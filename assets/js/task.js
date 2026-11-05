/* 任务引擎：今日任务生成 / 场次推进 / 打卡判定 / 欠账补练 */
(function (w) {
  'use strict';

  /* 每场题量：20 分钟 18 题 / 30 分钟 25 题 / 40 分钟 35 题。
     mix 是三块各几题，加起来就是 total；一个节点只有 5 认字 + 6 拼音，
     多出来的题从已经学过的节点里稳定轮换补齐（不烧新内容、也不出没学过的题）。 */
  var PACE = {
    light: { total: 18, mix: { chars: 5, pinyin: 6, math: 7 }, writing: 3, min: 20, label: '轻（约 20 分钟 · 18 题）' },
    standard: { total: 25, mix: { chars: 7, pinyin: 8, math: 10 }, writing: 4, min: 30, label: '标准（约 30 分钟 · 25 题）' },
    plus: { total: 35, mix: { chars: 9, pinyin: 11, math: 15 }, writing: 5, min: 40, label: '加量（约 40 分钟 · 35 题）' }
  };

  function paceCfg() {
    var st = w.Store.settings();
    return PACE[st.pace] || PACE.standard;
  }

  function moduleOf(itemId) {
    var it = w.Content.item(itemId);
    return it ? it.module : null;
  }

  function takeModule(items, module, n) {
    var out = [];
    for (var i = 0; i < items.length && out.length < n; i++) {
      if (items[i].module === module) out.push(items[i].id);
    }
    return out;
  }

  /* 固定种子的下标：同一天同一场每次算出来的巩固题都一样，预览和实做不会跳题 */
  function seededIndex(s, mod) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003;
    return mod ? h % mod : h;
  }

  /* 一个节点只有 5 认字 + 6 拼音，节奏要的题更多时，从这里补齐：
     先在本册「已经学过的节点」里按固定种子轮换抽（等于顺带复习），
     还不够（刚开学那几天）就顺着教材往下取最近的几课，不跳到很远的课文。 */
  function fillModule(ids, module, target, date, slot, subject, cur) {
    if (ids.length >= target) return ids.slice(0, target);
    var nodes = w.Content.allNodes(subject);
    var curIdx = nodes.length;   // 游标已经走完全册时，整册都算「学过」
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].unit === cur.unit && nodes[i].node === cur.node) { curIdx = i; break; }
    }
    var learned = [], upcoming = [];
    nodes.forEach(function (n, ni) {
      n.items.forEach(function (it) {
        if (it.module !== module) return;
        (ni < curIdx ? learned : upcoming).push(it.id);
      });
    });
    var used = {};
    ids.forEach(function (id) { used[id] = 1; });
    var out = ids.slice(0, target);
    var start = seededIndex(date + '#' + slot + '#' + module, learned.length || 1);
    for (var k = 0; k < learned.length && out.length < target; k++) {
      var id = learned[(start + k) % learned.length];
      if (used[id]) continue;
      used[id] = 1; out.push(id);
    }
    for (var j = 0; j < upcoming.length && out.length < target; j++) {
      if (used[upcoming[j]]) continue;
      used[upcoming[j]] = 1; out.push(upcoming[j]);
    }
    return out;
  }

  /* 数学内容全走完后是从全册抽巩固题，随机抽不一定抽到比较式填数，
     这里兜一下：没有就换一道进去（替换而不是追加，题量才不会变），保证每个练习都练到 */
  function ensureCmp(ids, date, slot) {
    var has = false;
    ids.forEach(function (id) { var it = w.Content.item(id); if (it && it.type === 'cmp') has = true; });
    if (has || !ids.length) return ids;
    var pool = [];
    w.Content.allNodes('math').forEach(function (node) {
      node.items.forEach(function (it) { if (it.type === 'cmp') pool.push(it.id); });
    });
    if (!pool.length) return ids;
    var s = date + '#' + slot, h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 99991;
    var out = ids.slice();
    out[Math.min(1, out.length - 1)] = pool[h % pool.length];
    return out;
  }

  /* 数学题挑选：常规题按原顺序取，再把本节点的「比较式填数」带 1~3 道插在中间，
     先热身再上要反着想的。返回的题数不超过 n，其余由 fillModule 补齐。 */
  function pickMath(items, n) {
    var base = [], cmp = [];
    items.forEach(function (it) {
      if (it.type === 'cmp') cmp.push(it.id);
      else if (it.module === 'math') base.push(it.id);
    });
    var wantCmp = Math.min(3, cmp.length, Math.max(1, Math.round(n / 5)));
    var out = base.slice(0, Math.max(0, n - wantCmp));
    cmp.slice(0, wantCmp).forEach(function (id, i) {
      out.splice(Math.min(1 + i * 2, out.length), 0, id);
    });
    return out.slice(0, n);
  }

  /* 内容用尽后的巩固题：优先错题，其次从已学节点抽。
     现在每场的常规题由 fillModule 稳定补齐，这个函数保留给外部按模块抽题用 */
  function consolidate(module, n, upto) {
    var out = [];
    var due = w.Store.dueMistakes(U.today()).filter(function (r) { return moduleOf(r.itemId) === module; });
    due.slice(0, n).forEach(function (r) { out.push(r.itemId); });
    if (out.length >= n) return out.slice(0, n);

    var subject = (module === 'math') ? 'math' : 'chinese';
    var pool = [];
    w.Content.allNodes(subject).forEach(function (node, idx) {
      if (upto && idx >= upto) return;
      node.items.forEach(function (it) { if (it.module === module && out.indexOf(it.id) < 0) pool.push(it.id); });
    });
    if (!pool.length) {
      w.Content.allNodes(subject).forEach(function (node) {
        node.items.forEach(function (it) { if (it.module === module && out.indexOf(it.id) < 0) pool.push(it.id); });
      });
    }
    U.shuffle(pool).slice(0, n - out.length).forEach(function (id) { out.push(id); });
    return out;
  }

  /* 错题复习插题：替换目标模块中的题位 */
  function injectReview(target, module, maxN) {
    if (!w.Store.settings().review) return 0;
    var due = w.Store.dueMistakes(U.today())
      .filter(function (r) { return moduleOf(r.itemId) === module; });
    var used = 0;
    due.slice(0, maxN).forEach(function (r) {
      if (target.indexOf(r.itemId) >= 0) return;
      // 替换掉最后一个非错题项
      for (var i = target.length - 1; i >= 0; i--) {
        var it = w.Content.item(target[i]);
        if (it && it._isReview) continue;
        if (target.indexOf(r.itemId) >= 0) return;
        target[i] = r.itemId;
        used++;
        return;
      }
    });
    return used;
  }

  function nextWriting(cursor, count) {
    var table = w.Content.writingTable();
    if (!table.length || count <= 0) return { chars: [], cursor: cursor };
    var out = [], c = cursor;
    for (var i = 0; i < count; i++) {
      out.push(table[c % table.length].c);
      c++;
    }
    return { chars: out, cursor: c };
  }

  function cursorVal(c) { return (c.unit || 0) * 1000 + (c.node || 0); }

  function maxCursor(a, b) {
    return cursorVal(b) > cursorVal(a) ? { unit: b.unit, node: b.node } : { unit: a.unit, node: a.node };
  }

  /* 生成一天的场次计划（不落盘）
     prog 可传入模拟用的进度副本：预览未来日期时会逐天推演，不能动到真实进度 */
  function buildPlan(date, prog) {
    var p = prog || w.Store.progress();
    var st = w.Store.settings();
    var cfg = paceCfg();
    var target = w.Schedule.capacity(date, st);            // 当天应完成场次
    var count = w.Schedule.plannedSessions(p, date, st);   // 目标 + 最多 catchupExtra 场补欠账
    var ywCur = { unit: p.yw.unit, node: p.yw.node };
    var sxCur = { unit: p.sx.unit, node: p.sx.node };
    var wCur = p.writingCursor || 0;
    var sessions = [];

    for (var i = 0; i < count; i++) {
      var isCatchup = i >= target;          // 超出当天目标的才算补练
      var isExtra = i > 0 && !isCatchup;    // 当天的第 2、3 场：正常新内容，写字不减半
      var ywNode = w.Content.nodeAtCursor('chinese', ywCur);
      var sxNode = w.Content.nodeAtCursor('math', sxCur);

      var chars = ywNode ? takeModule(ywNode.items, 'chars', cfg.mix.chars) : [];
      var pinyin = ywNode ? takeModule(ywNode.items, 'pinyin', cfg.mix.pinyin) : [];
      var math = sxNode ? pickMath(sxNode.items, cfg.mix.math) : [];
      chars = fillModule(chars, 'chars', cfg.mix.chars, date, i, 'chinese', ywCur);
      pinyin = fillModule(pinyin, 'pinyin', cfg.mix.pinyin, date, i, 'chinese', ywCur);
      math = fillModule(math, 'math', cfg.mix.math, date, i, 'math', sxCur);
      math = ensureCmp(math, date, i);

      // 插错题复习（数学 2 题、语文各 1 题）
      injectReview(math, 'math', 2);
      injectReview(chars, 'chars', 1);
      injectReview(pinyin, 'pinyin', 1);

      var wCount = st.charsPerDay || cfg.writing;
      if (st.pace === 'light') wCount = Math.min(wCount, 3);
      if (isCatchup) wCount = st.catchupWriting ? Math.min(2, wCount) : 0;
      var wr = nextWriting(wCur, wCount);
      wCur = wr.cursor;

      var nextYw = ywNode ? (w.Content.advance('chinese', ywCur) || ywCur) : ywCur;
      var nextSx = sxNode ? (w.Content.advance('math', sxCur) || sxCur) : sxCur;
      if (ywNode) ywCur = nextYw;
      if (sxNode) sxCur = nextSx;

      sessions.push({
        slot: i,
        type: isCatchup ? 'catchup' : (isExtra ? 'extra' : 'new'),
        status: 'todo',
        yw: ywNode ? { unit: ywNode.unit, node: ywNode.node, key: ywNode.key, title: ywNode.title, lesson: ywNode.lesson, unitName: ywNode.unitName } : null,
        sx: sxNode ? { unit: sxNode.unit, node: sxNode.node, key: sxNode.key, title: sxNode.title, lesson: sxNode.lesson, unitName: sxNode.unitName } : null,
        items: { chars: chars, pinyin: pinyin, math: math },
        chars: wr.chars,
        writing: { slots: wr.chars.length },
        idx: 0,
        answers: {},
        ms: 0,
        correct: 0,
        total: chars.length + pinyin.length + math.length,
        next: { yw: nextYw, sx: nextSx, w: wr.cursor },
        estMin: isCatchup ? Math.round(cfg.min * 0.8) : cfg.min
      });
    }
    return sessions;
  }

  /* 计划结构版本：题型/题量改过就 +1，还没开始做的旧计划会自动重排，
     免得改完当天打开看到的还是老样子。v3 = 去掉送分认字题 + 三档题量改 18/25/35 */
  var PLAN_VERSION = 3;

  function touched(day) {
    return (day.plan || []).some(function (s) {
      return s.status === 'done' || s.startedAt || Object.keys(s.answers || {}).length;
    });
  }

  /* 确保今天的计划已生成 */
  /* 「今天打过卡」= 至少完成一场（那场的写字照片也要传）。
     和 day.done（当天所有场次都完成）分开：一场就计 1 天，但今日页仍要照常提示剩余场次。
     老数据没有 checkedIn 字段，用 done 兜底。 */
  function checkedIn(day) {
    if (!day) return false;
    if (day.checkedIn) return true;
    /* 老数据没这个字段：按 done 或「有一场做完且照片齐」兜底，升级后不用补数据 */
    if (day.done) return true;
    return (day.plan || []).some(function (s) {
      return s.status === 'done' && (!s.chars || !s.chars.length || !!s.photoId);
    });
  }

  function ensure(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    if (day && day.plan && day.plan.length) {
      if (day.planVersion !== PLAN_VERSION && !touched(day)) return rebuild(date);
      return day;
    }
    var prev = w.Store.day(date);
    var plan = buildPlan(date);
    day = w.Store.saveDay(date, {
      plan: plan, done: false, startedAt: null, planVersion: PLAN_VERSION,
      checkedIn: checkedIn(prev)
    });
    return day;
  }

  /* 重建（内容/节奏/进度被外部改动后）；重排题目不能把已经打过的卡抹掉 */
  function rebuild(date) {
    date = date || U.today();
    var old = w.Store.day(date);
    var plan = buildPlan(date);
    return w.Store.saveDay(date, {
      plan: plan, done: false, startedAt: null, planVersion: PLAN_VERSION,
      checkedIn: checkedIn(old)
    });
  }

  /* 预览缓存：同一天在同一次查看里反复进出（列表 ↔ 详情 ↔ 翻场次）要看到同一份题，
     否则每次 buildPlan 都会重新随机，家长会以为题目在跳。孩子做了一场后进度变了，key 自然失效。 */
  var PREVIEW_CACHE = {};

  function previewKey(date) {
    var p = w.Store.progress();
    var st = w.Store.settings();
    var kidId = (w.Store.kids && w.Store.kids.activeId) ? w.Store.kids.activeId() : '';
    return [kidId, date, p.bookId, p.startDate,
      p.yw.unit, p.yw.node, p.sx.unit, p.sx.node,
      p.writingCursor || 0, p.sessionsDone || 0,
      st.pace, st.charsPerDay, st.review ? 1 : 0, st.catchupWriting ? 1 : 0,
      st.workCapacity, st.satCapacity, st.sunCapacity, st.holidayCapacity, st.catchupExtra].join('|');
  }

  /* 预览某天会出什么题（只读，不写盘）
     · 那天已有计划（做过或打开过）→ 直接返回真实的
     · 今天或更早、但没有计划 → 用当前进度算一份
     · 未来 → 从今天起逐天模拟「每天都按时完成」，推到那天
     这样可以保证家长看到的是「按现在的进度，那天真的会排到的题」，而不是每次都一样的题。 */
  function preview(date) {
    date = date || U.today();
    var today = U.today();
    var day = w.Store.day(date);
    if (day && day.plan && day.plan.length) {
      return { date: date, plan: day.plan, real: true, source: 'record' };
    }

    var key = previewKey(date);
    if (PREVIEW_CACHE[key]) return PREVIEW_CACHE[key];

    if (date <= today) {
      if (Object.keys(PREVIEW_CACHE).length > 80) PREVIEW_CACHE = {};
      return (PREVIEW_CACHE[key] = { date: date, plan: buildPlan(date), real: false, source: 'estimate' });
    }

    var base = w.Store.progress();
    var sim = {
      yw: { unit: base.yw.unit, node: base.yw.node },
      sx: { unit: base.sx.unit, node: base.sx.node },
      writingCursor: base.writingCursor || 0,
      sessionsDone: base.sessionsDone || 0,
      startDate: base.startDate
    };

    // 起点：今天的场次也算做完（家长查的是「往后每天按时练」的排法）
    var day0 = w.Store.day(today);
    var plan0 = (day0 && day0.plan && day0.plan.length) ? day0.plan : buildPlan(today, sim);
    sim.sessionsDone += plan0.filter(function (s) { return s.status !== 'done'; }).length;
    var last0 = plan0[plan0.length - 1];
    if (last0 && last0.next) {
      if (last0.next.yw) sim.yw = last0.next.yw;
      if (last0.next.sx) sim.sx = last0.next.sx;
      if (last0.next.w) sim.writingCursor = last0.next.w;
    }

    var d = U.addDays(today, 1), guard = 0, truncated = false;
    while (d < date) {
      if (guard++ > 800) { truncated = true; break; }
      var pl = buildPlan(d, sim);
      var last = pl[pl.length - 1];
      if (last && last.next) {
        if (last.next.yw) sim.yw = last.next.yw;
        if (last.next.sx) sim.sx = last.next.sx;
        if (last.next.w) sim.writingCursor = last.next.w;
      }
      sim.sessionsDone += pl.length;
      d = U.addDays(d, 1);
    }
    var out = { date: date, plan: buildPlan(date, sim), real: false, source: 'sim', truncated: truncated };
    // 别让缓存无限长，留着最近几十天的就够
    if (Object.keys(PREVIEW_CACHE).length > 80) PREVIEW_CACHE = {};
    PREVIEW_CACHE[key] = out;
    return out;
  }

  /* ---- 连续练习提醒 ----
     「连着练」= 相邻两场之间的空档不超过 BREAK_MIN 分钟。
     连着练了 2 场，第 3 场开始前先提醒休息；真去歇够了的，空档变大，自动不再提醒。 */
  var BREAK_MIN = 25;      // 两场之间歇超过 25 分钟，就不算连着练了
  var REST_AFTER = 2;      // 连着练满几场后开始提醒

  function ms(v) { return Number(v) || 0; }

  /* 今天的连续练习情况：从最近完成的一场往前数 */
  function streakInfo(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    var out = { count: 0, lastAt: 0, restAck: -1 };
    if (!day || !day.plan) return out;
    out.restAck = (day.restAck === undefined || day.restAck === null) ? -1 : Number(day.restAck);
    var done = [];
    day.plan.forEach(function (s) { if (s.status === 'done') done.push(s); });
    if (!done.length) return out;
    // 按开始时间排一下，防止孩子跳着场次做时把顺序算乱
    done.sort(function (a, b) { return (ms(a.startedAt) || ms(a.finishedAt)) - (ms(b.startedAt) || ms(b.finishedAt)); });

    var count = 1;
    for (var i = done.length - 1; i > 0; i--) {
      var nxt = done[i], prv = done[i - 1];
      var from = ms(prv.finishedAt) || ms(prv.startedAt);
      var to = ms(nxt.startedAt) || ms(nxt.finishedAt);
      // 老记录没有时间戳时按「接着练的」算，宁可提醒一次
      var gap = (from && to) ? Math.abs(to - from) : 0;
      if (gap <= BREAK_MIN * 60000) count++;
      else break;
    }
    out.count = count;
    out.lastAt = ms(done[done.length - 1].finishedAt);
    return out;
  }

  /* 进入第 slot 场之前要不要提醒休息 */
  function shouldRest(date, slot) {
    date = date || U.today();
    slot = Number(slot) || 0;
    if (slot < REST_AFTER) return false;                 // 前两场不打扰
    var day = w.Store.day(date);
    if (!day || !day.plan) return false;
    if (Number(day.restAck) >= slot) return false;       // 这一场已经提醒过了
    var s = day.plan[slot];
    if (!s || s.status === 'done') return false;
    return streakInfo(date).count >= REST_AFTER;
  }

  function ackRest(date, slot) {
    var day = w.Store.day(date);
    if (!day) return;
    day.restAck = Number(slot) || 0;
    w.Store.saveDay(date, day);
  }

  /* 提醒弹窗。resolve(true) = 接着练，false = 先去休息 */
  function restGate(date, slot) {
    return new Promise(function (resolve) {
      var info = streakInfo(date);
      var m = U.modal({
        title: '⏰ 连着第 ' + (info.count + 1) + ' 场啦，先歇一会儿',
        desc: '已经连着练了 ' + info.count + ' 场，眼睛和脖子该松一松了。' +
          '看看窗外的远处，站起来喝口水，比硬撑着多做几题更有用。',
        dismissable: false,
        actions: [
          {
            label: '☕ 先休息一下', class: 'btn-ghost',
            onClick: function () { ackRest(date, slot); m.close(); resolve(false); }
          },
          {
            label: '我还想接着练', class: 'btn-primary',
            onClick: function () { ackRest(date, slot); m.close(); resolve(true); }
          }
        ]
      });
    });
  }

  /* 需要拦截时返回 Promise，不需要时直接 resolve(true) */
  function restGateIfNeeded(date, slot) {
    if (!shouldRest(date, slot)) return Promise.resolve(true);
    return restGate(date, slot);
  }

  function sessionItems(s) {
    var ids = (s.items.chars || []).concat(s.items.pinyin || [], s.items.math || []);
    return w.Content.items(ids);
  }

  function sessionDone(s) { return s.status === 'done'; }

  /* 判断某场次是否可打卡 */
  function canCheckin(s) {
    var answered = Object.keys(s.answers || {}).length;
    if (answered < (s.items.chars.length + s.items.pinyin.length + s.items.math.length)) return false;
    if (s.chars && s.chars.length && !s.photoId) return false;
    return true;
  }

  /* 完成一场：写回答题结果、推进进度、结算星星 */
  function completeSlot(date, slot, payload) {
    var day = w.Store.day(date);
    if (!day) return null;
    var s = day.plan[slot];
    if (!s) return null;

    var items = sessionItems(s);
    var correct = 0, answered = 0;
    items.forEach(function (it) {
      var a = (s.answers || {})[it.id];
      if (!a) return;
      answered++;
      if (a.correct) correct++;
    });

    s.status = 'done';
    s.ms = (payload && payload.ms) || s.ms || 0;
    s.correct = correct;
    s.answered = answered;
    s.total = items.length;
    s.score = items.length ? correct / items.length : 0;
    s.finishedAt = Date.now();
    s.photoId = s.photoId || (payload && payload.photoId) || null;
    day.done = day.plan.every(function (x) { return x.status === 'done' && (x.chars.length ? !!x.photoId : true); });
    /* 只要完成一场（且该场照片齐了）就算今天打过卡，连续天数不再等全部场次 */
    day.checkedIn = day.plan.some(function (x) { return x.status === 'done' && (!x.chars || !x.chars.length || !!x.photoId); });
    if (day.checkedIn && !day.finishedAt) day.finishedAt = Date.now();
    w.Store.saveDay(date, day);

    // 推进进度（取较大游标，避免乱序完成回退）
    var p = w.Store.progress();
    var yw = maxCursor(p.yw, s.next.yw || p.yw);
    var sx = maxCursor(p.sx, s.next.sx || p.sx);
    var wc = Math.max(p.writingCursor || 0, (s.next.w || 0));
    w.Store.saveProgress({
      yw: yw, sx: sx, writingCursor: wc,
      sessionsDone: (p.sessionsDone || 0) + 1
    });

    // 星星：答对 1 星 + 交作业 2 星
    var gain = correct + (s.photoId ? 2 : 0);
    w.Store.addStars(gain);
    s.stars = gain;

    w.Store.saveDay(date, day);
    return { stars: gain, correct: correct, total: items.length };
  }

  /* 今日概览 */
  function summary(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    var st = w.Store.settings();
    var p = w.Store.progress();
    var backlog = w.Schedule.backlog(p, date, st);
    var dayType = w.Schedule.dayType(date);
    var out = {
      date: date, dayType: dayType, dayTypeLabel: w.Schedule.typeLabel(dayType),
      holiday: w.Schedule.holidayName(date),
      capacity: w.Schedule.capacity(date, st),
      backlog: backlog,
      planned: day ? (day.plan || []).length : 0,
      doneCount: day ? (day.plan || []).filter(function (s) { return s.status === 'done'; }).length : 0,
      allDone: day ? !!day.done : false,
      day: day
    };
    out.eta = w.Schedule.catchupEta(p, date, st);
    return out;
  }

  function writingCharsOf(s) { return s.chars || []; }

  w.Task = {
    PACE: PACE, paceCfg: paceCfg,
    buildPlan: buildPlan, ensure: ensure, rebuild: rebuild, preview: preview,
    pickMath: pickMath,
    sessionItems: sessionItems, canCheckin: canCheckin, completeSlot: completeSlot,
    summary: summary, writingCharsOf: writingCharsOf, checkedIn: checkedIn,
    streakInfo: streakInfo, shouldRest: shouldRest, restGate: restGate, restGateIfNeeded: restGateIfNeeded,
    BREAK_MIN: BREAK_MIN, REST_AFTER: REST_AFTER,
    maxCursor: maxCursor, consolidate: consolidate
  };
})(window);
