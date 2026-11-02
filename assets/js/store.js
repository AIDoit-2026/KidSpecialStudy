/* 存储层：localStorage（结构化数据）+ IndexedDB（照片）
   所有数据以 kidId 为命名空间；schemaVersion 负责迁移。 */
(function (w) {
  'use strict';

  var PREFIX = 'wb2_';
  var VERSION = 4;
  var mem = {};           // 读缓存
  var listeners = [];
  var LS_OK = true;

  /* ---------------- 底层读写 ---------------- */
  function rawGet(key, fallback) {
    try {
      var s = w.localStorage.getItem(PREFIX + key);
      if (s === null || s === undefined) return fallback;
      return JSON.parse(s);
    } catch (e) { return fallback; }
  }
  function rawSet(key, val) {
    try {
      w.localStorage.setItem(PREFIX + key, JSON.stringify(val));
      return true;
    } catch (e) {
      LS_OK = false;
      console.error('存储写入失败', e);
      U.toast('本地存储已满，请先导出备份后清理照片', 'no');
      return false;
    }
  }
  function rawDel(key) { try { w.localStorage.removeItem(PREFIX + key); } catch (e) { } }

  function cached(key, fallback, compute) {
    if (!(key in mem)) mem[key] = rawGet(key, fallback);
    return mem[key];
  }
  function setCache(key, val) { mem[key] = val; rawSet(key, val); return val; }
  function invalidate(key) { if (key) delete mem[key]; else mem = {}; }

  /* ---------------- 孩子档案 ---------------- */
  var AVATARS = ['🐰', '🐼', '🐯', '🦊', '🐨', '🐸', '🐥', '🦄', '🐙', '🐳', '🦖', '🐝'];
  var COLORS = ['#FF6B9D', '#4ECDC4', '#FFA45B', '#95E67E', '#C47AFF', '#5FA8FF'];

  function kidList() { return cached('kids', []); }

  function activeKidId() { return rawGet('active_kid', null); }

  function activeKid() {
    var id = activeKidId();
    var list = kidList();
    if (!id && list.length) { setActiveKid(list[0].id); id = list[0].id; }
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return list[0] || null;
  }

  function setActiveKid(id) { rawSet('active_kid', id); notify('kid'); }

  function addKid(data) {
    var list = kidList().slice();
    var kid = {
      id: U.uid('k'),
      name: data.name || '小朋友',
      avatar: data.avatar || AVATARS[0],
      color: data.color || COLORS[0],
      grade: data.grade || 1,
      bookId: data.bookId || 'yw-1a',
      createdAt: Date.now(),
      pace: data.pace || 'standard'
    };
    list.push(kid);
    setCache('kids', list);
    // 初始化该孩子的数据
    setCache(kid.id + '_settings', defaultSettings(kid));
    setCache(kid.id + '_progress', defaultProgress());
    setCache(kid.id + '_stars', 0);
    if (!activeKidId()) rawSet('active_kid', kid.id);
    notify('kids');
    return kid;
  }

  function updateKid(id, patch) {
    var list = kidList().map(function (k) { return k.id === id ? Object.assign({}, k, patch) : k; });
    setCache('kids', list);
    notify('kids');
    return list.filter(function (k) { return k.id === id; })[0];
  }

  function removeKid(id) {
    var list = kidList().filter(function (k) { return k.id !== id; });
    setCache('kids', list);
    ['settings', 'progress', 'days', 'attempts', 'mistakes', 'writing', 'stars', 'decor'].forEach(function (s) {
      rawDel(id + '_' + s);
      invalidate(id + '_' + s);
    });
    if (activeKidId() === id) rawSet('active_kid', list.length ? list[0].id : null);
    photoDeleteByKid(id);
    notify('kids');
  }

  /* ---------------- 默认值 ---------------- */
  function defaultSettings(kid) {
    return {
      pace: (kid && kid.pace) || 'standard',  // light 20 / standard 30 / plus 40
      tts: true,
      sfx: true,
      review: true,
      charsPerDay: 4,
      writingMode: 'hanzi',     // 写字任务默认写汉字，可切成写拼音
      catchupWriting: true,     // 补练场次是否含写字
      // 每天「应完成」的场次：工作日 1 / 周六 3 / 周日 2 / 法定节假日 3
      satCapacity: 3,           // 周六固定场次
      sunCapacity: 2,           // 周日固定场次
      holidayCapacity: 3,       // 法定节假日固定场次
      catchupExtra: 2,          // 周末/节假日最多额外补几场欠账
      pinHash: null,
      ai: { enabled: false, baseURL: '', apiKey: '', model: '', autoScore: false },
      theme: 'light',
      fontLarge: false
    };
  }
  function defaultProgress() {
    return {
      bookId: 'yw-1a',              // 当前册次
      yw: { unit: 0, node: 0 },     // 单元下标 / 节点下标
      sx: { unit: 0, node: 0 },
      writingCursor: 0,
      startDate: U.today(),
      sessionsDone: 0,              // 累计完成场次（用于欠账计算）
      archive: {}                   // 各册次进度存档 {bookId:{yw,sx,writingCursor,sessionsDone,startDate}}
    };
  }

  /* 切换册次：当前进度入档，取出目标册次进度（没有则从第一单元开始） */
  function switchBook(bookId) {
    var kid = activeKid();
    if (!kid || !bookId) return null;
    var p = progress();
    var cur = p.bookId || 'yw-1a';
    if (cur === bookId) return p;
    var arch = Object.assign({}, p.archive || {});
    arch[cur] = {
      yw: p.yw, sx: p.sx, writingCursor: p.writingCursor,
      sessionsDone: p.sessionsDone || 0, startDate: p.startDate
    };
    var next = arch[bookId] || {
      yw: { unit: 0, node: 0 }, sx: { unit: 0, node: 0 },
      writingCursor: 0, sessionsDone: 0, startDate: U.today()
    };
    updateKid(kid.id, { bookId: bookId });
    // 今天还没打完的计划作废，按新册次重排
    var today = U.today();
    var d = rawGet(kid.id + '_days', {}) || {};
    var rec = d[today];
    var hasPending = rec && (rec.plan || []).some(function (s) { return s.status !== 'done'; });
    if (rec && hasPending) { delete d[today]; rawSet(kid.id + '_days', d); }
    delete mem[kid.id + '_days'];
    saveProgress({
      bookId: bookId, archive: arch,
      yw: next.yw, sx: next.sx, writingCursor: next.writingCursor || 0,
      sessionsDone: next.sessionsDone || 0, startDate: next.startDate || U.today()
    });
    notify('book');
    return progress();
  }

  /* 跳到指定单元 / 节点（插班、跳课） */
  function jumpTo(ywU, ywN, sxU, sxN) {
    var p = progress();
    saveProgress({
      yw: { unit: Number(ywU) || 0, node: Number(ywN) || 0 },
      sx: { unit: Number(sxU) || 0, node: Number(sxN) || 0 }
    });
    var kid = activeKid();
    var d = rawGet(kid.id + '_days', {}) || {};
    var today = U.today();
    if (d[today] && !d[today].done) { delete d[today]; rawSet(kid.id + '_days', d); delete mem[kid.id + '_days']; }
    notify('progress');
    return p;
  }

  /* ---------------- 设置 ---------------- */
  function settings() {
    var kid = activeKid();
    if (!kid) return defaultSettings(null);
    var s = cached(kid.id + '_settings', null);
    if (!s) { s = defaultSettings(kid); setCache(kid.id + '_settings', s); }
    // 补全缺省字段（升级兼容）
    var d = defaultSettings(kid);
    Object.keys(d).forEach(function (k) { if (s[k] === undefined) s[k] = d[k]; });
    s.ai = Object.assign({}, d.ai, s.ai || {});
    return s;
  }
  function saveSettings(patch) {
    var kid = activeKid(); if (!kid) return null;
    var s = Object.assign({}, settings(), patch || {});
    setCache(kid.id + '_settings', s);
    notify('settings');
    return s;
  }

  /* ---------------- 进度 ---------------- */
  function progress() {
    var kid = activeKid(); if (!kid) return defaultProgress();
    var p = cached(kid.id + '_progress', null);
    if (!p) { p = defaultProgress(); setCache(kid.id + '_progress', p); }
    var d = defaultProgress();
    Object.keys(d).forEach(function (k) { if (p[k] === undefined) p[k] = d[k]; });
    return p;
  }
  function saveProgress(patch) {
    var kid = activeKid(); if (!kid) return null;
    var p = Object.assign({}, progress(), patch || {});
    setCache(kid.id + '_progress', p);
    notify('progress');
    return p;
  }

  /* ---------------- 每日场次（打卡）---------------- */
  /* days = { "2026-10-30": { plan:[{slot,type,yw,sx,status,ms,score,photoId}], done:bool } } */
  function days() {
    var kid = activeKid(); if (!kid) return {};
    return cached(kid.id + '_days', {});
  }
  function day(date) { return days()[date] || null; }
  function saveDay(date, obj) {
    var kid = activeKid(); if (!kid) return null;
    var all = days();
    all[date] = obj;
    setCache(kid.id + '_days', all);
    notify('days');
    return obj;
  }
  function ensureDay(date, plan) {
    var d = day(date);
    if (!d) { d = { plan: plan || [], done: false, startedAt: null, ms: 0 }; saveDay(date, d); }
    return d;
  }

  /* ---------------- 答题流水 ---------------- */
  function attempts() {
    var kid = activeKid(); if (!kid) return [];
    return cached(kid.id + '_attempts', []);
  }
  function addAttempt(a) {
    var kid = activeKid(); if (!kid) return;
    var list = attempts();
    list.push(a);
    // 只保留最近 90 天
    var cutoff = U.addDays(U.today(), -90);
    if (list.length > 4000) list = list.filter(function (x) { return x.date >= cutoff; });
    setCache(kid.id + '_attempts', list);
    notify('attempts');
  }
  function attemptsOf(date) {
    return attempts().filter(function (a) { return a.date === date; });
  }

  /* ---------------- 错题本 ---------------- */
  function mistakes() {
    var kid = activeKid(); if (!kid) return {};
    return cached(kid.id + '_mistakes', {});
  }
  function mistakeOf(itemId) { return mistakes()[itemId] || null; }
  function saveMistakes(m) {
    var kid = activeKid(); if (!kid) return;
    setCache(kid.id + '_mistakes', m);
    notify('mistakes');
  }
  /* 答错 → box1 明天复习；复习答对 → box+1，间隔 3/7 天；box>3 移出 */
  function recordAnswer(item, correct, opts) {
    opts = opts || {};
    var today = U.today();
    var m = Object.assign({}, mistakes());
    var rec = m[item.id];
    if (!correct) {
      rec = rec || { itemId: item.id, subject: item.module, skill: item.skill, box: 0, wrongCount: 0 };
      rec.box = 1;
      rec.wrongCount = (rec.wrongCount || 0) + 1;
      rec.lastWrong = today;
      rec.dueDate = U.addDays(today, 1);
      rec.stem = item.stem;
      m[item.id] = rec;
    } else if (rec && opts.review) {
      rec.box = (rec.box || 1) + 1;
      var gap = rec.box >= 3 ? 7 : 3;
      rec.dueDate = U.addDays(today, gap);
      if (rec.box > 3) delete m[item.id];
    }
    saveMistakes(m);
  }
  function dueMistakes(date) {
    var m = mistakes();
    return Object.keys(m).map(function (k) { return m[k]; })
      .filter(function (r) { return (r.dueDate || '9999') <= date; });
  }

  /* ---------------- 写字记录 ---------------- */
  /* { date, slot, chars:[], photoId, scores:{stroke,structure,clean,complete}, note, reviewedAt, reviewedBy } */
  function writingList() {
    var kid = activeKid(); if (!kid) return [];
    return cached(kid.id + '_writing', []);
  }
  function writingOf(date, slot) {
    return writingList().filter(function (x) { return x.date === date && (slot === undefined || x.slot === slot); })[0] || null;
  }
  function saveWriting(rec) {
    var kid = activeKid(); if (!kid) return;
    var list = writingList().slice();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].date === rec.date && list[i].slot === (rec.slot || 0)) { idx = i; break; }
    }
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], rec);
    else list.push(rec);
    setCache(kid.id + '_writing', list);
    notify('writing');
    return rec;
  }
  function pendingReviews() {
    return writingList().filter(function (x) { return !x.reviewedAt && x.photoId; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  }

  /* ---------------- 星星 / 装饰 ---------------- */
  function stars() {
    var kid = activeKid(); if (!kid) return 0;
    return cached(kid.id + '_stars', 0);
  }
  function addStars(n) {
    var kid = activeKid(); if (!kid) return 0;
    var v = Math.max(0, Math.round((stars() + n) * 10) / 10);
    setCache(kid.id + '_stars', v);
    notify('stars');
    return v;
  }
  function decor() {
    var kid = activeKid(); if (!kid) return [];
    return cached(kid.id + '_decor', []);
  }
  function unlockDecor(id) {
    var list = decor().slice();
    if (list.indexOf(id) < 0) list.push(id);
    var kid = activeKid();
    setCache(kid.id + '_decor', list);
    notify('decor');
    return list;
  }

  /* ---------------- 照片存储 ----------------
     优先 IndexedDB；file:// 下浏览器可能禁用 IDB，则降级到 localStorage（压得更小、保留最近 40 张） */
  var dbp = null;
  var modePromise = null;
  var PHOTO_MODE = 'unknown';     // 'idb' | 'local'

  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (resolve, reject) {
      if (!w.indexedDB) { reject(new Error('no-idb')); return; }
      var settled = false;
      var req;
      try { req = w.indexedDB.open('wb2-db', 1); } catch (e) { reject(e); return; }
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('idb-timeout'));
      }, 3000);
      req.onupgradeneeded = function (e) {
        var d = e.target.result;
        if (!d.objectStoreNames.contains('photos')) {
          var st = d.createObjectStore('photos', { keyPath: 'id' });
          st.createIndex('kidId', 'kidId');
          st.createIndex('date', 'date');
        }
      };
      req.onsuccess = function (e) {
        var conn = e.target.result;
        if (settled) {           // 迟到的成功：切回 IndexedDB
          dbp = Promise.resolve(conn);
          PHOTO_MODE = 'idb';
          return;
        }
        settled = true;
        clearTimeout(timer);
        resolve(conn);
      };
      req.onerror = function () {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(req.error || new Error('idb-error'));
      };
    });
    return dbp;
  }

  function detect() {
    if (PHOTO_MODE !== 'unknown') return Promise.resolve(PHOTO_MODE);
    if (modePromise) return modePromise;
    modePromise = db().then(function () { PHOTO_MODE = 'idb'; return 'idb'; })
      .catch(function () { if (PHOTO_MODE === 'unknown') PHOTO_MODE = 'local'; return PHOTO_MODE; });
    return modePromise;
  }
  detect();

  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (resolve, reject) {
        var t = d.transaction('photos', mode);
        var store = t.objectStore('photos');
        var result;
        try { result = fn(store); } catch (e) { reject(e); return; }
        t.oncomplete = function () { resolve(result && result.result !== undefined ? result.result : result); };
        t.onerror = function () { reject(t.error); };
      });
    });
  }

  /* ---- localStorage 降级存储 ---- */
  var LSP = PREFIX + 'photo_';
  function lsPut(rec) {
    try {
      w.localStorage.setItem(LSP + rec.id, JSON.stringify(rec));
      pruneLocal();
      return Promise.resolve(true);
    } catch (e) {
      pruneLocal(true);
      try { w.localStorage.setItem(LSP + rec.id, JSON.stringify(rec)); return Promise.resolve(true); }
      catch (e2) { return Promise.reject(e2); }
    }
  }
  function lsGet(id) {
    try {
      var raw = w.localStorage.getItem(LSP + id);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function lsAll(kidId) {
    var out = [];
    try {
      for (var i = 0; i < w.localStorage.length; i++) {
        var k = w.localStorage.key(i);
        if (!k || k.indexOf(LSP) !== 0) continue;
        try {
          var rec = JSON.parse(w.localStorage.getItem(k));
          if (rec && (!kidId || rec.kidId === kidId)) out.push(rec);
        } catch (e) { }
      }
    } catch (e) { }
    return out;
  }
  function lsDelete(id) { try { w.localStorage.removeItem(LSP + id); } catch (e) { } }
  function pruneLocal(force) {
    var all = lsAll(null).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
    var limit = force ? 30 : 40;
    while (all.length > limit) {
      var old = all.shift();
      lsDelete(old.id);
    }
  }

  function dataURLtoBlob(url) {
    try {
      var parts = String(url).split(',');
      var mime = /:(.*?);/.exec(parts[0])[1];
      var bin = atob(parts[1]);
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch (e) { return null; }
  }

  /* ---- 对外 API ---- */
  function photoPut(rec) {
    return detect().then(function (mode) {
      if (mode === 'idb') {
        return tx('readwrite', function (s) { s.put(rec); }).catch(function () {
          PHOTO_MODE = 'local';
          detect();
          return lsPut(toLocalRec(rec));
        });
      }
      return lsPut(toLocalRec(rec));
    });
  }

  function toLocalRec(rec) {
    return {
      id: rec.id, kidId: rec.kidId, date: rec.date, slot: rec.slot || 0,
      w: rec.w, h: rec.h, at: rec.at || Date.now(),
      dataURL: rec._dataURL || '',
      thumbURL: rec._thumbURL || ''
    };
  }

  function photoGet(id) {
    return detect().then(function (mode) {
      if (mode === 'local') return lsGet(id);
      return tx('readonly', function (s) { return s.get(id); }).then(function (r) { return r || null; })
        .catch(function () { return lsGet(id); });
    });
  }

  function photoAll(kidId) {
    return detect().then(function (mode) {
      if (mode === 'local') return lsAll(kidId);
      return db().then(function (d) {
        return new Promise(function (resolve) {
          var t = d.transaction('photos', 'readonly');
          var idx = t.objectStore('photos').index('kidId');
          var req = idx.getAll(kidId);
          req.onsuccess = function () { resolve(req.result || []); };
          req.onerror = function () { resolve([]); };
        });
      }).catch(function () { return lsAll(kidId); });
    });
  }

  function photoDelete(id) {
    return detect().then(function (mode) {
      if (mode === 'local') { lsDelete(id); return true; }
      return tx('readwrite', function (s) { s.delete(id); }).catch(function () { lsDelete(id); });
    });
  }

  function photoDeleteByKid(kidId) {
    photoAll(kidId).then(function (list) {
      list.forEach(function (p) { photoDelete(p.id); });
    });
  }

  var urlCache = {};
  function photoURL(id) {
    if (urlCache[id]) return Promise.resolve(urlCache[id]);
    return photoGet(id).then(function (rec) {
      if (!rec) return null;
      var url = rec.thumbURL || rec.dataURL || null;
      if (!url && (rec.thumbBlob || rec.blob)) url = URL.createObjectURL(rec.thumbBlob || rec.blob);
      if (url) urlCache[id] = url;
      return url;
    }).catch(function () { return null; });
  }

  function photoFullURL(id) {
    return photoGet(id).then(function (rec) {
      if (!rec) return null;
      if (rec.dataURL) return rec.dataURL;
      if (rec.blob) return URL.createObjectURL(rec.blob);
      return null;
    }).catch(function () { return null; });
  }

  function photoBlob(id) {
    return photoGet(id).then(function (r) {
      if (!r) return null;
      if (r.blob) return r.blob;
      if (r.dataURL) return dataURLtoBlob(r.dataURL);
      return null;
    });
  }

  function photoMode() { return PHOTO_MODE; }

  /* ---------------- 图片压缩 ---------------- */
  function compressImage(file, maxSide, quality) {
    maxSide = maxSide || 1280; quality = quality || 0.82;
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var scale = Math.min(1, maxSide / Math.max(img.width, img.height));
          var cw = Math.round(img.width * scale), ch = Math.round(img.height * scale);
          var c = document.createElement('canvas');
          c.width = cw; c.height = ch;
          var ctx = c.getContext('2d');
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
          ctx.drawImage(img, 0, 0, cw, ch);
          c.toBlob(function (blob) {
            var tc = document.createElement('canvas');
            var ts = Math.min(1, 360 / Math.max(cw, ch));
            tc.width = Math.round(cw * ts); tc.height = Math.round(ch * ts);
            var tctx = tc.getContext('2d');
            tctx.drawImage(c, 0, 0, tc.width, tc.height);
            tc.toBlob(function (thumb) {
              var out = { blob: blob, thumbBlob: thumb, w: cw, h: ch };
              try {
                out.dataURL = c.toDataURL('image/jpeg', 0.72);
                out.thumbURL = tc.toDataURL('image/jpeg', 0.62);
              } catch (e) { out.dataURL = ''; out.thumbURL = ''; }
              resolve(out);
            }, 'image/jpeg', 0.7);
          }, 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ---------------- 快照 / 导入导出 ---------------- */
  function dumpKid(kidId) {
    var out = { kidId: kidId, schemaVersion: VERSION };
    ['settings', 'progress', 'days', 'attempts', 'mistakes', 'writing', 'stars', 'decor'].forEach(function (k) {
      out[k] = rawGet(kidId + '_' + k, null);
    });
    return out;
  }

  function exportAll() {
    var kid = activeKid();
    var kids = kidList();
    var data = { schemaVersion: VERSION, exportedAt: Date.now(), app: '宝贝每日一练', activeKidId: kid ? kid.id : null, kids: [] };
    data.kids = kids.map(function (k) { return { profile: k, data: dumpKid(k.id) }; });
    return data;
  }

  function snapshot(tag) {
    try {
      var all = {};
      for (var i = 0; i < w.localStorage.length; i++) {
        var k = w.localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) all[k] = w.localStorage.getItem(k);
      }
      w.localStorage.setItem(PREFIX + 'snapshot_' + (tag || 'auto'), JSON.stringify({ at: Date.now(), data: all }));
      return true;
    } catch (e) { return false; }
  }

  function restoreSnapshot(tag) {
    try {
      var raw = w.localStorage.getItem(PREFIX + 'snapshot_' + (tag || 'auto'));
      if (!raw) return false;
      var snap = JSON.parse(raw);
      Object.keys(snap.data).forEach(function (k) { w.localStorage.setItem(k, snap.data[k]); });
      invalidate();
      notify('restore');
      return true;
    } catch (e) { return false; }
  }

  /* 导入：按 kidId + date 合并；冲突以「后到者为准」并记录报告 */
  function importAll(payload, opts) {
    opts = opts || {};
    var report = { kidsAdded: 0, daysMerged: 0, daysOverwritten: [], writingMerged: 0, attemptsAdded: 0, errors: [] };
    if (!payload || !payload.kids) { report.errors.push('文件格式不正确'); return report; }
    if (payload.schemaVersion > VERSION) report.errors.push('备份来自更高版本（v' + payload.schemaVersion + '），部分数据可能无法识别');

    snapshot('pre_import');

    payload.kids.forEach(function (entry) {
      var prof = entry.profile, dat = entry.data || {};
      var exists = kidList().filter(function (k) { return k.id === prof.id; })[0];
      if (!exists) {
        var list = kidList().slice();
        list.push(prof);
        setCache('kids', list);
        report.kidsAdded++;
      }
      var kidId = prof.id;

      // days 合并
      var localDays = rawGet(kidId + '_days', {}) || {};
      var incomingDays = dat.days || {};
      Object.keys(incomingDays).forEach(function (d) {
        if (localDays[d]) {
          report.daysOverwritten.push(d);
          report.daysMerged++;
        }
        localDays[d] = incomingDays[d];
      });
      rawSet(kidId + '_days', localDays);

      // attempts 合并去重
      var localA = rawGet(kidId + '_attempts', []) || [];
      var seen = {};
      localA.forEach(function (a) { seen[a.id] = 1; });
      (dat.attempts || []).forEach(function (a) {
        if (!seen[a.id]) { localA.push(a); report.attemptsAdded++; }
      });
      localA.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      rawSet(kidId + '_attempts', localA);

      // writing 合并
      var localW = rawGet(kidId + '_writing', []) || [];
      (dat.writing || []).forEach(function (rec) {
        var i = localW.findIndex(function (x) { return x.date === rec.date && (x.slot || 0) === (rec.slot || 0); });
        if (i >= 0) localW[i] = rec; else localW.push(rec);
        report.writingMerged++;
      });
      rawSet(kidId + '_writing', localW);

      // 其余直接覆盖（settings/progress/mistakes/stars/decor）
      ['settings', 'progress', 'mistakes', 'stars', 'decor'].forEach(function (k) {
        if (dat[k] !== null && dat[k] !== undefined) rawSet(kidId + '_' + k, dat[k]);
      });
    });

    invalidate();
    notify('import');
    return report;
  }

  function wipeAll() {
    try {
      var keys = [];
      for (var i = 0; i < w.localStorage.length; i++) {
        var k = w.localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) keys.push(k);
      }
      keys.forEach(function (k) { w.localStorage.removeItem(k); });
    } catch (e) { }
    invalidate();
    notify('wipe');
  }

  /* ---------------- 初始化 ---------------- */
  function boot() {
    var v = rawGet('schema_version', 0);
    if (!v) { rawSet('schema_version', VERSION); }
    else if (v < VERSION) { migrate(v); }
    var kids = kidList();
    if (kids.length && !activeKidId()) rawSet('active_kid', kids[0].id);
    return { version: VERSION, kids: kids };
  }

  function migrate(from) {
    console.log('[store] 迁移数据 v' + from + ' → v' + VERSION);
    snapshot('pre_migrate');
    // v1 → v2：checkins(单条) → days.plan(多场)
    kidList().forEach(function (kid) {
      var old = rawGet(kid.id + '_checkins', null);
      if (old) {
        var daysMap = rawGet(kid.id + '_days', {}) || {};
        Object.keys(old).forEach(function (d) {
          if (!daysMap[d]) {
            daysMap[d] = {
              plan: [{ slot: 0, type: 'new', status: old[d].done ? 'done' : 'todo', ms: old[d].ms || 0, score: old[d].score || 0 }],
              done: !!old[d].done
            };
          }
        });
        rawSet(kid.id + '_days', daysMap);
        rawDel(kid.id + '_checkins');
      }
    });
    // v2 → v3：进度加 bookId / archive
    kidList().forEach(function (kid) {
      var p = rawGet(kid.id + '_progress', null);
      if (p && !p.bookId) {
        p.bookId = 'yw-1a';
        p.archive = p.archive || {};
        rawSet(kid.id + '_progress', p);
      }
      if (!kid.bookId) updateKid(kid.id, { bookId: 'yw-1a' });
    });
    // v3 → v4：旧版 AI 评分解析格式不一致，会把四维分数全兜底成 1 分。
    // 这类坏数据退回「未批改」，重新打分即可，照片和记录都保留。
    kidList().forEach(function (kid) {
      var list = rawGet(kid.id + '_writing', null);
      if (!list || !list.length) return;
      var fixed = 0;
      var next = list.map(function (r) {
        var s = r && r.scores;
        if (!s || String(r.reviewedBy || '').indexOf('ai') !== 0) return r;
        if (s.stroke === 1 && s.structure === 1 && s.clean === 1 && s.complete === 1) {
          fixed++;
          return Object.assign({}, r, { scores: null, note: '', reviewedAt: null, reviewedBy: null });
        }
        return r;
      });
      if (fixed) {
        rawSet(kid.id + '_writing', next);
        invalidate(kid.id + '_writing');
        console.log('[store] 清理 AI 误评数据 ' + fixed + ' 条（' + kid.name + '），已退回待批改');
      }
    });
    rawSet('schema_version', VERSION);
  }

  /* ---------------- 订阅 ---------------- */
  function subscribe(fn) { listeners.push(fn); return function () { listeners = listeners.filter(function (f) { return f !== fn; }); }; }
  function notify(what) {
    listeners.forEach(function (fn) { try { fn(what); } catch (e) { console.error(e); } });
  }

  w.Store = {
    VERSION: VERSION, PREFIX: PREFIX, AVATARS: AVATARS, COLORS: COLORS,
    boot: boot, subscribe: subscribe, notify: notify,
    kids: { list: kidList, active: activeKid, activeId: activeKidId, setActive: setActiveKid, add: addKid, update: updateKid, remove: removeKid },
    settings: settings, saveSettings: saveSettings,
    progress: progress, saveProgress: saveProgress, switchBook: switchBook, jumpTo: jumpTo,
    days: days, day: day, saveDay: saveDay, ensureDay: ensureDay,
    attempts: attempts, addAttempt: addAttempt, attemptsOf: attemptsOf,
    mistakes: mistakes, mistakeOf: mistakeOf, recordAnswer: recordAnswer, dueMistakes: dueMistakes, saveMistakes: saveMistakes,
    writingList: writingList, writingOf: writingOf, saveWriting: saveWriting, pendingReviews: pendingReviews,
    stars: stars, addStars: addStars, decor: decor, unlockDecor: unlockDecor,
    photoPut: photoPut, photoGet: photoGet, photoAll: photoAll, photoDelete: photoDelete,
    photoURL: photoURL, photoFullURL: photoFullURL, photoBlob: photoBlob, photoMode: photoMode,
    compressImage: compressImage,
    exportAll: exportAll, importAll: importAll, snapshot: snapshot, restoreSnapshot: restoreSnapshot, dumpKid: dumpKid,
    wipeAll: wipeAll
  };
})(window);
