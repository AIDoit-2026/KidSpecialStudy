/* AI 评分接入
   两种用法：
   ① 导出「评分任务包」（ZIP：manifest.json + photos/*.jpg），交给外部评分 App，再把结果 JSON 导回；
   ② 在本应用内直连 OpenAI 兼容接口（自带 key），一键评分。 */
(function (w) {
  'use strict';

  var DIMS = ['stroke', 'structure', 'clean', 'complete'];
  var DIM_CN = { stroke: '笔画正确', structure: '间架结构', clean: '整洁规范', complete: '完成度' };

  function promptFor(rec) {
    return '你是一位小学一年级语文老师，正在批改学生的手写作业照片。\n' +
      '本次要求写的字：' + (rec.chars || []).join('、') + '\n' +
      '请从四个维度分别打 1~5 分（整数）：\n' +
      '1) 笔画正确 stroke：笔顺、笔画有无增减\n' +
      '2) 间架结构 structure：是否居中、比例是否匀称\n' +
      '3) 整洁规范 clean：字迹清晰、有无涂改\n' +
      '4) 完成度 complete：是否按要求每字写满一行\n' +
      '只输出 JSON，不要任何解释：\n' +
      '{"stroke":4,"structure":3,"clean":4,"complete":5,"note":"一句鼓励或建议，20 字以内"}';
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

  /* 导入评分结果 */
  function applyResult(list) {
    if (!Array.isArray(list)) list = [list];
    var applied = 0, missed = [];
    list.forEach(function (r) {
      var m = /^w_(\d{4}-\d{2}-\d{2})_(\d+)$/.exec(r.recordId || '');
      if (!m) { missed.push(r.recordId); return; }
      var date = m[1], slot = Number(m[2]);
      var rec = w.Store.writingOf(date, slot);
      if (!rec) { missed.push(r.recordId); return; }
      var s = r.scores || {};
      var scores = {
        stroke: clampScore(s.stroke), structure: clampScore(s.structure),
        clean: clampScore(s.clean), complete: clampScore(s.complete)
      };
      w.Store.saveWriting(Object.assign({}, rec, {
        scores: scores,
        note: r.note || '',
        reviewedAt: Date.now(),
        reviewedBy: r.model ? 'ai:' + r.model : 'ai'
      }));
      applied++;
    });
    return { applied: applied, missed: missed };
  }

  function clampScore(v) {
    var n = Math.round(Number(v));
    if (!isFinite(n) || n < 1) n = 1;
    if (n > 5) n = 5;
    return n;
  }

  function importResultFile(file) {
    return new Promise(function (resolve, reject) {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var data = JSON.parse(fr.result);
          var list = Array.isArray(data) ? data : (data.results || [data]);
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
      var rep = applyResult([json]);
      if (!rep.applied) throw new Error('评分结果未能写入');
      return json;
    });
  }

  function extractJSON(text) {
    var s = String(text).trim();
    var start = s.indexOf('{'), end = s.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try { return JSON.parse(s.slice(start, end + 1)); } catch (e) { return null; }
  }

  w.AI = {
    DIMS: DIMS, DIM_CN: DIM_CN,
    promptFor: promptFor, pendingTasks: pendingTasks,
    exportPackage: exportPackage, applyResult: applyResult, importResultFile: importResultFile,
    scoreDirect: scoreDirect, recordId: recordId
  };
})(window);
