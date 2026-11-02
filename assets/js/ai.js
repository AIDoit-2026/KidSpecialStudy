/* AI 评分接入
   两种用法：
   ① 导出「评分任务包」（ZIP：manifest.json + photos/*.jpg），交给外部评分 App，再把结果 JSON 导回；
   ② 在本应用内直连 OpenAI 兼容接口（自带 key），一键评分。 */
(function (w) {
  'use strict';

  var DIMS = ['stroke', 'structure', 'clean', 'complete'];
  var DIM_CN = { stroke: '笔画正确', structure: '间架结构', clean: '整洁规范', complete: '完成度' };
  /* 写拼音时同一个分项换一套说法 */
  var DIM_CN_PY = { stroke: '字母形体', structure: '占格位置', clean: '声调与整洁', complete: '完成度' };
  /* 还没看过照片（不知道写的是汉字还是拼音）时，用一套两边都说得通的说法。
     写字任务不预设写哪种，孩子当天自己选，所以这是常态而不是异常。 */
  var DIM_CN_ANY = { stroke: '写法正确', structure: '占格结构', clean: '整洁规范', complete: '完成度' };

  function dimCN(mode) {
    if (mode === 'pinyin') return DIM_CN_PY;
    if (mode === 'hanzi') return DIM_CN;
    return DIM_CN_ANY;
  }
  function dimLabel(key, mode) { return dimCN(mode)[key] || key; }
  function scriptCN(script) {
    if (script === 'pinyin') return '按拼音';
    if (script === 'hanzi') return '按汉字';
    return '汉字/拼音都行';
  }

  /* 这条记录写的是汉字还是拼音：AI 看过照片会把判断写回 mode；
     家长手评时不知道，返回 null，别替孩子假设。 */
  function modeOf(rec) {
    if (!rec || !rec.mode) return null;
    return rec.mode === 'pinyin' ? 'pinyin' : 'hanzi';
  }

  function promptFor(rec) {
    var list = (rec.chars || []).map(function (c) {
      var p = w.CHARS && w.CHARS[c] ? w.CHARS[c].p : '';
      return p ? c + '（' + p + '）' : c;
    }).join('、');
    return '你是一位小学一年级语文老师，正在批改学生的写字作业照片。\n' +
      '【写汉字或写拼音都可以，孩子当天自己挑一种】\n' +
      '- 照片里写的是汉字，就按汉字的标准评；写的是拼音，就按拼音的标准评；\n' +
      '- 不要因为「只写了拼音、没写汉字」或「只写了汉字、没写拼音」扣分或提醒，两种都算完成；\n' +
      '- 只有当照片里几乎没写、或写的不是要求的这几个字时，才在 note 里提醒。\n' +
      '这次要求写的字（字（拼音））：' + list + '\n' +
      '先判断照片里写的是哪一种，按实际情况填在 script 字段：写了汉字填 "hanzi"，写了拼音填 "pinyin"（别照抄示例）。\n' +
      '四个维度各打 1~5 分（整数）：\n' +
      '1) stroke 写法正确：写汉字看笔顺、笔画有无增减；写拼音看字母形体（a、g 是否课本上的单层写法，b/d、p/q 有没有写反）\n' +
      '2) structure 占格结构：汉字看是否居中、比例是否匀称；拼音看是否写在四线三格的中格，b d h l 向上伸到上格、g p q y 向下伸到下格\n' +
      '3) clean 整洁规范：字迹或字母清晰、卷面有无涂改；写拼音还要看声调符号标得对不对（轻声不标调是正常的）\n' +
      '4) complete 完成度：是否按要求每个字（或每个拼音）写满一行\n' +
      '只输出 JSON，不要任何解释：\n' +
      '{"script":"hanzi","scores":{"stroke":4,"structure":3,"clean":4,"complete":5},"note":"一句鼓励或建议，20 字以内"}';
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        var s = String(fr.result);
        resolve(s.slice(s.indexOf(',') + 1));
      };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }

  function recordId(date, slot) { return 'w_' + date + '_' + (slot || 0); }

  /* 待批改记录 → 评分任务 */
  function pendingTasks() {
    return w.Store.pendingReviews().map(function (rec) {
      return {
        recordId: recordId(rec.date, rec.slot || 0),
        kidId: w.Store.kids.activeId(),
        date: rec.date,
        slot: rec.slot || 0,
        chars: rec.chars || [],
        mode: modeOf(rec),
        image: 'photos/' + rec.date + '_' + (rec.slot || 0) + '.jpg',
        prompt: promptFor(rec),
        schema: { stroke: '1-5', structure: '1-5', clean: '1-5', complete: '1-5', note: 'string' },
        photoId: rec.photoId
      };
    });
  }

  /* 导出评分任务包（ZIP） */
  function exportPackage() {
    var tasks = pendingTasks();
    if (!tasks.length) return Promise.reject(new Error('没有待批改的作业'));
    var entries = [];
    var manifest = {
      app: '宝贝每日一练', kind: 'grading-package', version: 1,
      createdAt: Date.now(), kid: w.Store.kids.active(),
      tasks: tasks.map(function (t) {
        var o = Object.assign({}, t); delete o.photoId; return o;
      }),
      resultFormat: {
        description: '评分完成后输出以下结构的 JSON 文件（数组），再在家长中心导入',
        example: [{ recordId: 'w_2026-10-30_0', scores: { stroke: 4, structure: 4, clean: 5, complete: 5 }, note: '写得不错', model: 'gpt-4o' }]
      }
    };
    entries.push({
      name: 'manifest.json',
      data: new TextEncoder().encode(JSON.stringify(manifest, null, 2))
    });

    var i = 0;
    function step() {
      if (i >= tasks.length) {
        w.Exporter.download(w.Exporter.buildZip(entries), '评分任务包_' + U.today() + '.zip');
        return Promise.resolve(tasks.length);
      }
      var t = tasks[i++];
      return w.Store.photoBlob(t.photoId).then(function (blob) {
        if (!blob) return step();
        return blob.arrayBuffer().then(function (buf) {
          entries.push({ name: t.image, data: new Uint8Array(buf) });
          return step();
        });
      });
    }
    return step();
  }

  /* 导入评分结果
     兼容三种写法：
       ① 规范：{ recordId, scores:{stroke,...}, note }
       ② 扁平：{ recordId, stroke:4, structure:3, ... , note }
       ③ 分数放在 score / result 字段里 */
  function pickScores(r) {
    r = r || {};
    var s = r.scores || r.score || r.result || r;
    var out = {}, count = 0;
    DIMS.forEach(function (d) {
      var v = normScore(s ? s[d] : undefined);
      if (v === null && r[d] !== undefined) v = normScore(r[d]);   // 扁平兜底
      if (v !== null) { out[d] = v; count++; }
    });
    return { scores: out, count: count };
  }

  function pickNote(r) {
    r = r || {};
    var s = r.scores || r.score || r.result;
    return r.note || r.comment || r.remark || r.评语 || (s && (s.note || s.comment)) || '';
  }

  /* AI 看照片后判断孩子写的是汉字还是拼音（script 字段），认得就记下来 */
  function pickScript(r) {
    r = r || {};
    var s = String(r.script || r.mode || r.type || '').toLowerCase();
    if (s.indexOf('pinyin') >= 0 || s.indexOf('拼音') >= 0) return 'pinyin';
    if (s.indexOf('hanzi') >= 0 || s.indexOf('汉字') >= 0) return 'hanzi';
    return null;
  }

  function applyResult(list) {
    if (!Array.isArray(list)) list = [list];
    var applied = 0, missed = [];
    list.forEach(function (r) {
      if (!r) { missed.push('空记录'); return; }
      var m = /^w_(\d{4}-\d{2}-\d{2})_(\d+)$/.exec(r.recordId || '');
      if (!m) { missed.push(r.recordId || '(缺少 recordId)'); return; }
      var date = m[1], slot = Number(m[2]);
      var rec = w.Store.writingOf(date, slot);
      if (!rec) { missed.push(r.recordId + '（找不到这条作业）'); return; }
      var p = pickScores(r);
      if (!p.count) { missed.push(r.recordId + '（分数格式不对）'); return; }
      // 只覆盖 AI 给了的维度，其余沿用已有分数/默认 3 分，绝不写死成 1 分
      var scores = Object.assign({ stroke: 3, structure: 3, clean: 3, complete: 3 }, rec.scores || {}, p.scores);
      var note = pickNote(r);
      var script = pickScript(r);
      w.Store.saveWriting(Object.assign({}, rec, {
        scores: scores,
        note: note || rec.note || '',
        reviewedAt: Date.now(),
        reviewedBy: r.model ? 'ai:' + r.model : 'ai',
        mode: script || rec.mode || null   // AI 看过照片就知道是汉字还是拼音，记下来供维度名用
      }));
      applied++;
    });
    return { applied: applied, missed: missed };
  }

  /* 有效分返回 1~5，无效返回 null（以前统一兜底成 1，会把 AI 的真实分数全吃掉） */
  function normScore(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = Math.round(Number(v));
    if (!isFinite(n)) return null;
    if (n < 1) n = 1;
    if (n > 5) n = 5;
    return n;
  }
  function clampScore(v) { var n = normScore(v); return n === null ? 3 : n; }

  function normalize(raw) {
    raw = raw || {};
    var p = pickScores(raw);
    return {
      recordId: raw.recordId || '',
      scores: p.scores,
      note: pickNote(raw),
      script: pickScript(raw),
      model: raw.model || ''
    };
  }

  function importResultFile(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var data = JSON.parse(fr.result);
          var list = Array.isArray(data) ? data :
            (data.results || data.tasks || data.items || data.data || [data]);
          resolve(applyResult(list));
        } catch (e) { reject(e); }
      };
      fr.onerror = function () { reject(new Error('读取失败')); };
      fr.readAsText(file);
    });
  }

  /* 直连 OpenAI 兼容接口 */
  function scoreDirect(date, slot, cfg) {
    cfg = cfg || w.Store.settings().ai || {};
    if (!cfg.baseURL || !cfg.model) return Promise.reject(new Error('还没配置 API 地址和模型'));
    var rec = w.Store.writingOf(date, slot);
    if (!rec || !rec.photoId) return Promise.reject(new Error('这条记录没有照片'));

    return w.Store.photoBlob(rec.photoId).then(function (blob) {
      if (!blob) throw new Error('照片读取失败');
      return blobToBase64(blob);
    }).then(function (b64) {
      var url = cfg.baseURL.replace(/\/+$/, '') + '/chat/completions';
      var body = {
        model: cfg.model,
        temperature: 0.2,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: promptFor(rec) },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + b64 } }
          ]
        }]
      };
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (cfg.apiKey || '')
        },
        body: JSON.stringify(body)
      });
    }).then(function (res) {
      if (!res.ok) return res.text().then(function (t) { throw new Error('接口返回 ' + res.status + '：' + t.slice(0, 160)); });
      return res.json();
    }).then(function (data) {
      var txt = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!txt) throw new Error('接口没有返回内容');
      var json = extractJSON(txt);
      if (!json) throw new Error('无法解析评分结果：' + String(txt).slice(0, 120));
      json.recordId = recordId(date, slot);
      json.model = data.model || cfg.model;
      var res = normalize(json);
      if (!pickScores(json).count) throw new Error('AI 没给出可识别的四维分数：' + String(txt).slice(0, 120));
      var rep = applyResult([res]);
      if (!rep.applied) throw new Error('评分结果未能写入' + (rep.missed[0] ? '：' + rep.missed[0] : ''));
      return res;
    });
  }

  function extractJSON(text) {
    var s = String(text).trim();
    var start = s.indexOf('{'), end = s.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try { return JSON.parse(s.slice(start, end + 1)); } catch (e) { return null; }
  }

  w.AI = {
    DIMS: DIMS, DIM_CN: DIM_CN, DIM_CN_PY: DIM_CN_PY, DIM_CN_ANY: DIM_CN_ANY,
    dimCN: dimCN, dimLabel: dimLabel, modeOf: modeOf, scriptCN: scriptCN,
    promptFor: promptFor, pendingTasks: pendingTasks,
    exportPackage: exportPackage, applyResult: applyResult, importResultFile: importResultFile,
    scoreDirect: scoreDirect, recordId: recordId,
    pickScores: pickScores, pickNote: pickNote, pickScript: pickScript,
    normalize: normalize, normScore: normScore
  };
})(window);
