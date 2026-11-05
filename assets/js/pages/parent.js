/* 家长中心：概览 / 孩子 / 批改 / 设置 / 数据 / AI */
(function (w) {
  'use strict';

  var TABS = [
    { key: 'overview', label: '概览' },
    { key: 'kids', label: '孩子' },
    { key: 'review', label: '批改' },
    { key: 'peek', label: '看题' },
    { key: 'settings', label: '设置' },
    { key: 'data', label: '数据' },
    { key: 'ai', label: 'AI 评分' }
  ];

  function render(view, query) {
    if (!App.isUnlocked()) {
      var lock = U.h('div', { class: 'card', style: { maxWidth: '460px', margin: '40px auto', textAlign: 'center' } });
      lock.appendChild(U.h('div', { style: { fontSize: '42px' }, text: '🔒' }));
      lock.appendChild(U.h('h2', { style: { margin: '8px 0' }, text: '家长中心' }));
      lock.appendChild(U.h('p', { class: 'muted small', text: '这里能看到全部记录、改设置、导出数据。请输入 4 位家长密码。' }));
      lock.appendChild(U.h('button', {
        class: 'btn btn-primary', style: { marginTop: '16px' },
        text: App.hasPin() ? '输入密码' : '设置家长密码',
        onclick: function () {
          App.requirePin().then(function (ok) { if (ok) App.render(); });
        }
      }));
      view.appendChild(lock);
      return;
    }

    var tab = query.tab || 'overview';
    var tabs = U.h('div', { class: 'parent-tabs' });
    TABS.forEach(function (t) {
      tabs.appendChild(U.h('button', {
        class: t.key === tab ? 'on' : '', text: t.label,
        onclick: function () { App.go('#/parent?tab=' + t.key); }
      }));
    });
    view.appendChild(tabs);

    if (tab === 'overview') renderOverview(view);
    else if (tab === 'kids') renderKids(view);
    else if (tab === 'review') renderReview(view);
    else if (tab === 'peek') renderPeek(view, query);
    else if (tab === 'settings') renderSettings(view);
    else if (tab === 'data') renderData(view);
    else if (tab === 'ai') renderAI(view);
  }

  /* ---------------- 概览 ---------------- */
  function renderOverview(view) {
    var date = U.today();
    var day = w.Store.day(date);
    var sum = w.Task.summary(date);
    var pending = w.Store.pendingReviews();
    var stats = w.Content.stats();
    var inToday = w.Task.checkedIn(w.Store.day(date));

    var c = U.h('div', { class: 'card' });
    c.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '今天（' + U.fmtCn(date) + ' ' + U.weekdayCn(date) + '）' }),
      U.h('span', {
        class: 'pill ' + (inToday ? 'green' : 'gray'),
        text: sum.allDone ? '已全部完成' : (inToday ? '已打卡' : '进行中')
      })
    ));
    c.appendChild(U.h('div', { class: 'kv' },
      U.h('div', { class: 'k', text: '场次' }), U.h('div', { text: sum.doneCount + ' / ' + sum.planned + ' 场完成' }),
      U.h('div', { class: 'k', text: '日类型' }), U.h('div', { text: sum.dayTypeLabel + (sum.holiday ? '（' + sum.holiday + '）' : '') + '，应完成 ' + sum.capacity + ' 场' }),
      U.h('div', { class: 'k', text: '欠账' }), U.h('div', { text: sum.backlog ? sum.backlog + ' 场（' + (sum.eta && sum.eta.date ? '预计 ' + U.fmtCn(sum.eta.date) + ' 补完' : '假期补练') + '）' : '没有欠账' }),
      U.h('div', { class: 'k', text: '待批改' }), U.h('div', { text: pending.length ? pending.length + ' 条作业' : '没有' })
    ));
    var ops = U.h('div', { class: 'row wrap', style: { marginTop: '12px' } });
    if (pending.length) {
      ops.appendChild(U.h('button', {
        class: 'btn btn-primary btn-sm', text: '去批改（' + pending.length + '）',
        onclick: function () { App.go('#/parent?tab=review'); }
      }));
    }
    var pp = w.Store.progress();
    ops.appendChild(U.h('button', {
      class: 'btn btn-sm', text: '🖨 打印下一个语文节点',
      onclick: function () { App.go('#/print?node=chinese:' + pp.yw.unit + ':' + pp.yw.node); }
    }));
    ops.appendChild(U.h('button', {
      class: 'btn btn-sm', text: '🖨 打印下一个数学节点',
      onclick: function () { App.go('#/print?node=math:' + pp.sx.unit + ':' + pp.sx.node); }
    }));
    c.appendChild(ops);
    view.appendChild(c);

    var q = U.h('div', { class: 'grid g3', style: { marginTop: '16px' } });
    q.appendChild(quick('📚', '课文进度', progressText('chinese'), function () { App.go('#/parent?tab=settings'); }));
    q.appendChild(quick('🔢', '数学进度', progressText('math'), function () { App.go('#/parent?tab=settings'); }));
    q.appendChild(quick('✍️', '写字游标', (w.Store.progress().writingCursor || 0) + ' / ' + w.Content.writingTable().length + ' 字', null));
    view.appendChild(q);

    var info = U.h('div', { class: 'card', style: { marginTop: '16px' } });
    info.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '内容与环境' })));
    info.appendChild(U.h('div', { class: 'kv' },
      U.h('div', { class: 'k', text: '当前册次' }), U.h('div', { text: stats.bookLabel + '（' + stats.bookId + '）' }),
      U.h('div', { class: 'k', text: '语文包' }), U.h('div', { text: stats.ywUnits + ' 单元 / ' + stats.ywNodes + ' 节点 / ' + stats.ywItems + ' 题' }),
      U.h('div', { class: 'k', text: '数学包' }), U.h('div', { text: stats.sxUnits + ' 单元 / ' + stats.sxNodes + ' 节点 / ' + stats.sxItems + ' 题' }),
      U.h('div', { class: 'k', text: '写字表' }), U.h('div', { text: stats.writing + ' 字' }),
      U.h('div', { class: 'k', text: '全库' }), U.h('div', { text: (function () { var a = w.Content.allStats(); return a.books + ' 个包 / ' + a.nodes + ' 节点 / ' + a.items + ' 题'; })() }),
      U.h('div', { class: 'k', text: '语音' }), U.h('div', { text: TTS.available() ? '可用（中文语音已就绪）' : '不可用：系统缺少中文语音包，已自动隐藏朗读' }),
      U.h('div', { class: 'k', text: '存储占用' }), U.h('div', { text: storageSize() })
    ));
    if (!TTS.available()) {
      info.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '10px' },
        text: 'Windows 安装中文语音：设置 → 时间和语言 → 语音 → 添加语音包（中文简体）。'
      }));
    }
    view.appendChild(info);
  }

  function progressText(subject) {
    var p = w.Store.progress();
    var cur = subject === 'chinese' ? p.yw : p.sx;
    var n = w.Content.nodeAtCursor(subject, cur);
    var total = w.Content.nodeCount(subject);
    var idx = 0;
    var all = w.Content.allNodes(subject);
    all.forEach(function (x, i) { if (x.unit === cur.unit && x.node === cur.node) idx = i; });
    return (n ? n.title : '已学完') + '（' + idx + ' / ' + total + '）';
  }

  function quick(emoji, title, sub, onClick) {
    var el = U.h('div', { class: 'card', style: { padding: '16px', cursor: onClick ? 'pointer' : 'default' } },
      U.h('div', { style: { fontSize: '24px' }, text: emoji }),
      U.h('div', { style: { fontWeight: '800', marginTop: '6px' }, text: title }),
      U.h('div', { class: 'small muted', text: sub })
    );
    if (onClick) el.addEventListener('click', onClick);
    return el;
  }

  function storageSize() {
    var bytes = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k.indexOf('wb2_') === 0) bytes += (localStorage.getItem(k) || '').length * 2;
      }
    } catch (e) { }
    return (bytes / 1024).toFixed(0) + ' KB（照片另存于 IndexedDB）';
  }

  /* ---------------- 孩子 ---------------- */
  function renderKids(view) {
    var kids = w.Store.kids.list();
    var card = U.h('div', { class: 'card' });
    card.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '孩子档案（' + kids.length + '）' }),
      U.h('button', { class: 'btn btn-sm btn-primary', text: '+ 添加', onclick: addKid })
    ));
    var tb = U.h('table', { class: 'table' });
    tb.appendChild(U.h('tr', {}, ['孩子', '年级', '节奏', '累计星星', '操作'].map(function (h) {
      return U.h('th', { text: h });
    })));
    kids.forEach(function (k) {
      var tr = U.h('tr');
      tr.appendChild(U.h('td', { text: k.avatar + ' ' + k.name + (w.Store.kids.activeId() === k.id ? '（当前）' : '') }));
      tr.appendChild(U.h('td', { text: '一' + (k.grade || 1) + '年级' }));
      tr.appendChild(U.h('td', { text: { light: '轻', standard: '标准', plus: '加量' }[k.pace || 'standard'] || '标准' }));
      tr.appendChild(U.h('td', { text: '⭐ ' + (k.id === w.Store.kids.activeId() ? w.Store.stars() : '—') }));
      var ops = U.h('td');
      ops.appendChild(U.h('button', {
        class: 'btn btn-sm', text: '切换',
        onclick: function () { w.Store.kids.setActive(k.id); U.toast('已切到 ' + k.name); App.render(); }
      }));
      ops.appendChild(U.h('button', {
        class: 'btn btn-sm', style: { marginLeft: '6px' }, text: '改名',
        onclick: function () {
          U.promptText({ title: '改名字', value: k.name }).then(function (v) {
            if (v) { w.Store.kids.update(k.id, { name: v }); App.render(); }
          });
        }
      }));
      ops.appendChild(U.h('button', {
        class: 'btn btn-sm btn-danger', style: { marginLeft: '6px' }, text: '删除',
        onclick: function () {
          U.confirm({
            title: '删除 ' + k.name + ' 的全部记录？',
            desc: '将同时删除这个孩子的答题流水、星星、写字照片，且无法撤销。建议先导出备份。',
            okText: '仍要删除', danger: true
          }).then(function (ok) {
            if (!ok) return;
            w.Store.kids.remove(k.id);
            U.toast('已删除');
            App.render();
          });
        }
      }));
      tr.appendChild(ops);
      tb.appendChild(tr);
    });
    card.appendChild(tb);
    view.appendChild(card);
  }

  function addKid() {
    var name = U.h('input', { class: 'input', placeholder: '孩子名字', maxlength: 10 });
    var pick = U.h('div', { class: 'avatar-pick' });
    var chosen = w.Store.AVATARS[1];
    w.Store.AVATARS.forEach(function (a) {
      pick.appendChild(U.h('button', {
        class: a === chosen ? 'on' : '', text: a,
        onclick: function (e) {
          chosen = a;
          U.$$('button', pick).forEach(function (b) { b.classList.remove('on'); });
          e.currentTarget.classList.add('on');
        }
      }));
    });
    var pace = U.h('select', { class: 'input' },
      U.h('option', { value: 'light', text: '轻（约 20 分钟 · 18 题）' }),
      U.h('option', { value: 'standard', text: '标准（约 30 分钟 · 25 题）', selected: true }),
      U.h('option', { value: 'plus', text: '加量（约 40 分钟 · 35 题）' })
    );
    var m = U.modal({
      title: '添加孩子',
      body: U.h('div', {},
        U.h('div', { class: 'field' }, U.h('label', { text: '名字' }), name),
        U.h('div', { class: 'field' }, U.h('label', { text: '头像' }), pick),
        U.h('div', { class: 'field' }, U.h('label', { text: '每天节奏' }), pace)
      ),
      actions: [
        { label: '取消', class: 'btn-ghost', onClick: function (mm) { mm.close(); } },
        {
          label: '创建', class: 'btn-primary', onClick: function (mm) {
            var v = name.value.trim();
            if (!v) { U.toast('填个名字', 'no'); return; }
            w.Store.kids.add({ name: v, avatar: chosen, pace: pace.value });
            mm.close();
            U.toast('已创建');
            App.render();
          }
        }
      ]
    });
  }

  /* ---------------- 批改 ---------------- */
  function avgScore(rec) {
    var s = (rec && rec.scores) || {};
    var vals = ['stroke', 'structure', 'clean', 'complete']
      .map(function (d) { return w.AI.normScore(s[d]); })
      .filter(function (v) { return v !== null; });
    if (!vals.length) return '—';
    return (vals.reduce(function (a, b) { return a + b; }, 0) / vals.length).toFixed(1);
  }
  function reviewerText(by) {
    by = by || '';
    if (by === 'parent') return '家长评分';
    if (by.indexOf('ai') === 0) return 'AI' + (by.length > 3 ? '（' + by.slice(3) + '）' : '');
    return by || '';
  }

  function renderReview(view) {
    var pending = w.Store.pendingReviews();
    var done = w.Store.writingList().filter(function (x) { return x.reviewedAt; })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 12);

    var c = U.h('div', { class: 'card' });
    c.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '待批改（' + pending.length + '）' }),
      U.h('div', { class: 'row' },
        U.h('button', { class: 'btn btn-sm', text: '🎒 导出评分任务包', onclick: exportPkg }),
        U.h('button', { class: 'btn btn-sm', text: '📥 导入 AI 评分结果', onclick: importResult })
      )
    ));

    if (!pending.length) {
      c.appendChild(U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '✅' }), '没有待批改的作业'));
    } else {
      var list = U.h('div', { class: 'review-list' });
      pending.forEach(function (rec) { list.appendChild(reviewRow(rec)); });
      c.appendChild(list);
    }
    view.appendChild(c);

    if (done.length) {
      var c2 = U.h('div', { class: 'card' });
      c2.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '最近批改' })));
      var l2 = U.h('div', { class: 'review-list' });
      done.forEach(function (rec) {
        var avg = avgScore(rec);
        l2.appendChild(U.h('div', { class: 'review-row' },
          U.h('div', { class: 'rr-thumb' }, '🖼'),
          U.h('div', { class: 'rr-main' },
            U.h('div', { class: 'rr-title', text: U.fmtCn(rec.date) + '　' + (rec.chars || []).join(' ') }),
            U.h('div', { class: 'rr-sub', text: '均分 ' + avg + (rec.reviewedBy ? '　·　' + reviewerText(rec.reviewedBy) + (rec.note ? '　·　' + rec.note : '') : '') })
          ),
          U.h('button', {
            class: 'btn btn-sm', text: '查看',
            onclick: function () { App.go('#/review?date=' + rec.date + '&slot=' + (rec.slot || 0)); }
          })
        ));
      });
      c2.appendChild(l2);
      view.appendChild(c2);
    }
  }

  function reviewRow(rec) {
    var row = U.h('div', { class: 'review-row' });
    var thumb = U.h('div', { class: 'rr-thumb', text: '🖼' });
    if (rec.photoId) {
      w.Store.photoURL(rec.photoId).then(function (url) {
        if (url) { U.clear(thumb); thumb.appendChild(U.h('img', { src: url })); }
      });
    }
    row.appendChild(thumb);
    row.appendChild(U.h('div', { class: 'rr-main' },
      U.h('div', { class: 'rr-title', text: U.fmtCn(rec.date) + '（第 ' + ((rec.slot || 0) + 1) + ' 场）' }),
      U.h('div', { class: 'rr-sub', text: '写了：' + (rec.chars || []).join(' ') })
    ));
    row.appendChild(U.h('button', {
      class: 'btn btn-sm btn-primary', text: '批改',
      onclick: function () { App.go('#/review?date=' + rec.date + '&slot=' + (rec.slot || 0)); }
    }));
    return row;
  }

  /* ---------------- 看题（按天预览题目，检查质量） ---------------- */
  function countOf(s) {
    if (!s) return 0;
    if (typeof s.total === 'number' && s.total) return s.total;
    var it = s.items || {};
    return (it.chars || []).length + (it.pinyin || []).length + (it.math || []).length;
  }

  function peekLine(label, text, right) {
    return U.h('div', { class: 'peek-line' },
      U.h('b', { text: label }),
      U.h('span', { class: 'pl-text', text: text }),
      U.h('span', { class: 'pl-right', text: right })
    );
  }

  function renderPeek(view, query) {
    var today = U.today();
    var date = /^\d{4}-\d{2}-\d{2}$/.test(query.date || '') ? query.date : today;
    var info = w.Task.preview(date);
    var plan = info.plan || [];
    var st = w.Store.settings();
    var dayType = w.Schedule.dayType(date);
    var holiday = w.Schedule.holidayName(date);
    var total = plan.reduce(function (n, s) { return n + countOf(s); }, 0);

    var head = U.h('div', { class: 'card' });
    head.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '看题 · 检查题目质量' }),
      U.h('span', { class: 'pill purple', text: '只读预览' })
    ));
    head.appendChild(U.h('div', { class: 'small muted',
      text: '选一天，看看那天会出哪些题、答案是什么。预看不会写进记录，也不影响孩子的进度。' }));

    var bar = U.h('div', { class: 'peek-bar', style: { marginTop: '14px' } });
    bar.appendChild(U.h('button', {
      class: 'btn btn-sm', text: '◀ 前一天',
      onclick: function () { App.go('#/parent?tab=peek&date=' + U.addDays(date, -1)); }
    }));
    var inp = U.h('input', {
      type: 'date', class: 'input', value: date,
      min: U.addDays(today, -365), max: U.addDays(today, 365)
    });
    inp.addEventListener('change', function () {
      if (inp.value) App.go('#/parent?tab=peek&date=' + inp.value);
    });
    bar.appendChild(inp);
    bar.appendChild(U.h('button', {
      class: 'btn btn-sm', text: '后一天 ▶',
      onclick: function () { App.go('#/parent?tab=peek&date=' + U.addDays(date, 1)); }
    }));
    if (date !== today) {
      bar.appendChild(U.h('button', {
        class: 'btn btn-sm btn-primary', text: '回到今天',
        onclick: function () { App.go('#/parent?tab=peek&date=' + today); }
      }));
    }
    head.appendChild(bar);

    var meta = U.h('div', { class: 'peek-meta' });
    meta.appendChild(U.h('b', { text: U.fmtCn(date) + ' ' + U.weekdayCn(date) }));
    meta.appendChild(U.h('span', { text: '　' + w.Schedule.typeLabel(dayType) + (holiday ? '（' + holiday + '）' : '') }));
    meta.appendChild(U.h('span', { text: '　应完成 ' + w.Schedule.capacity(date, st) + ' 场' }));
    meta.appendChild(U.h('span', { text: '　当天排 ' + plan.length + ' 场 / ' + total + ' 题' }));
    head.appendChild(meta);

    var srcText = info.source === 'record'
      ? '这天已经生成过计划，看到的就是孩子实际做的那份题。'
      : info.source === 'sim'
        ? '未来日期：按「每天都按时完成」往后推演的，看到的是那天真会排到的题，不同日期会往后走。'
        : '这天还没有记录，按当前进度算出来的一份。';
    head.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '6px' }, text: srcText }));
    if (info.truncated) {
      head.appendChild(U.h('div', { class: 'small', style: { marginTop: '6px', color: 'var(--pink-d)' },
        text: '日期太远，只推演了前 800 天，后面的题仅供参考。' }));
    }
    view.appendChild(head);

    if (!plan.length) {
      var empty = U.h('div', { class: 'card' });
      empty.appendChild(U.h('div', { class: 'empty' },
        U.h('span', { class: 'e-emoji', text: '🌤' }),
        '这一天没有排练习，可能是教材进度已经走完，或当天不在练习计划里。'));
      view.appendChild(empty);
      return;
    }

    plan.forEach(function (s, i) {
      var n = countOf(s);
      var c = U.h('div', { class: 'card' });
      c.appendChild(U.h('div', { class: 'card-title' },
        U.h('h2', { text: '第 ' + (i + 1) + ' 场' }),
        U.h('div', { class: 'row' },
          U.h('span', {
            class: 'pill ' + (s.type === 'catchup' ? 'yellow' : s.type === 'extra' ? 'blue' : 'green'),
            text: s.type === 'catchup' ? '补欠账' : s.type === 'extra' ? '当天加练' : '新内容'
          }),
          U.h('span', { class: 'pill gray', text: n + ' 题' }),
          U.h('button', {
            class: 'btn btn-sm btn-primary', text: '看题目 →',
            onclick: function () { App.go('#/peek?date=' + date + '&slot=' + i); }
          })
        )
      ));

      if (s.yw) {
        c.appendChild(peekLine('语文', s.yw.unitName + ' · ' + s.yw.title,
          (s.items.chars || []).length + ' 认字 / ' + (s.items.pinyin || []).length + ' 拼音'));
      }
      if (s.sx) {
        c.appendChild(peekLine('数学', s.sx.unitName + ' · ' + s.sx.title,
          (s.items.math || []).length + ' 题'));
      }
      if (s.chars && s.chars.length) {
        c.appendChild(peekLine('写字', s.chars.join('　'), s.chars.length + ' 个'));
      }

      if (s.status === 'done') {
        c.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '8px' },
          text: '这场孩子已经做完了' + (s.total && typeof s.correct === 'number' ? '，答对 ' + s.correct + '/' + s.total : '') }));
      }
      view.appendChild(c);
    });
  }

  function exportPkg() {
    U.toast('正在打包作业照片…');
    w.AI.exportPackage().then(function (n) {
      U.toast('已导出 ' + n + ' 条评分任务', 'ok');
    }).catch(function (e) { U.toast(e.message, 'no'); });
  }

  function importResult() {
    var input = U.h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      var f = input.files[0];
      if (!f) return;
      w.AI.importResultFile(f).then(function (rep) {
        U.toast('已写入 ' + rep.applied + ' 条评分' + (rep.missed.length ? '，' + rep.missed.length + ' 条未匹配' : ''), rep.applied ? 'ok' : 'no');
        App.render();
      }).catch(function (e) { U.toast('导入失败：' + e.message, 'no'); });
      document.body.removeChild(input);
    });
    input.click();
  }

  /* ---------------- 设置 ---------------- */
  function renderSettings(view) {
    var st = w.Store.settings();
    var p = w.Store.progress();
    var cfg = U.h('div', { class: 'card' });
    cfg.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '每日节奏' })));

    var seg = U.h('div', { class: 'seg' });
    [['light', '轻 20 分钟'], ['standard', '标准 30 分钟'], ['plus', '加量 40 分钟']].forEach(function (x) {
      seg.appendChild(U.h('button', {
        class: st.pace === x[0] ? 'on' : '', text: x[1],
        onclick: function () {
          w.Store.saveSettings({ pace: x[0] });
          w.Store.kids.update(w.Store.kids.activeId(), { pace: x[0] });
          U.toast('已切换节奏，明天生效；今天要改请点「重排今日」');
          App.render();
        }
      }));
    });
    cfg.appendChild(seg);
    cfg.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '8px' },
      text: '每场题量：轻 18 题 / 标准 25 题 / 加量 35 题（认字 + 拼音 + 数学，写字另算）。' +
        '笔顺题每场最多 1 道，少出的题换成数学计算题。' }));

    cfg.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '16px', gap: '18px' } }));
    cfg.lastChild.appendChild(toggle('语音朗读题目', st.tts, function (v) { w.Store.saveSettings({ tts: v }); }));
    cfg.lastChild.appendChild(toggle('答题音效', st.sfx, function (v) { w.Store.saveSettings({ sfx: v }); }));
    cfg.lastChild.appendChild(toggle('错题自动复习', st.review, function (v) { w.Store.saveSettings({ review: v }); }));
    cfg.lastChild.appendChild(toggle('补练也写字', st.catchupWriting, function (v) { w.Store.saveSettings({ catchupWriting: v }); }));

    var cpw = U.h('select', { class: 'input', style: { maxWidth: '160px' } });
    [3, 4, 5].forEach(function (n) {
      cpw.appendChild(U.h('option', { value: n, text: n + ' 个字/天', selected: st.charsPerDay === n }));
    });
    cpw.addEventListener('change', function () { w.Store.saveSettings({ charsPerDay: Number(cpw.value) }); });

    cfg.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '14px', gap: '18px' } },
      U.h('div', { class: 'field', style: { margin: 0, maxWidth: '240px' } },
        U.h('label', { text: '每天写字个数' }), cpw)
    ));

    cfg.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '8px' },
      text: '写字任务里每个字都同时给出田字格和四线三格，写汉字还是写拼音由孩子当天自己选，不用提前设。' }));

    cfg.appendChild(U.h('div', { class: 'row wrap', style: { gap: '10px', marginTop: '10px' } },
      U.h('button', {
        class: 'btn btn-sm', text: '🔁 重排今日任务',
        onclick: function () {
          U.confirm({ title: '重排今天？', desc: '会清空今天已生成的计划（已做的题会丢），一般只在改了节奏或插班时用。' }).then(function (ok) {
            if (!ok) return;
            w.Task.rebuild(U.today());
            U.toast('已按新设置重排');
            App.render();
          });
        }
      }),
      U.h('button', {
        class: 'btn btn-sm', text: '🎵 测试语音',
        onclick: function () {
          if (!TTS.available()) { U.toast('系统没有中文语音包', 'no'); return; }
          TTS.test();
        }
      })
    ));
    view.appendChild(cfg);

    /* 教材册次与进度 */
    var bk = U.h('div', { class: 'card' });
    bk.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '教材与进度' }),
      U.h('span', { class: 'pill purple', text: w.Content.bookLabel() })
    ));
    var bookSeg = U.h('div', { class: 'seg' });
    w.Content.availableBooks().forEach(function (b) {
      bookSeg.appendChild(U.h('button', {
        class: w.Content.activeBookId() === b.id ? 'on' : '',
        text: b.label + (b.ready ? '' : '（未装）'),
        onclick: function () {
          if (!b.ready) { U.toast('这一册的内容包还没装', 'no'); return; }
          if (w.Content.activeBookId() === b.id) return;
          U.confirm({
            title: '切换到' + b.label + '？',
            desc: '当前册次的进度会存起来，切回来还能接着做；今天没做完的计划会按新册次重排。写字表也会换成这一册的。',
            okText: '切换'
          }).then(function (ok) {
            if (!ok) return;
            w.Store.switchBook(b.id);
            U.toast('已切换到' + b.label, 'ok');
            App.render();
          });
        }
      }));
    });
    bk.appendChild(bookSeg);

    var pr = w.Store.progress();
    var ywNow = w.Content.nodeAtCursor('chinese', pr.yw);
    var sxNow = w.Content.nodeAtCursor('math', pr.sx);
    var ywAll = w.Content.allNodes('chinese');
    var sxAll = w.Content.allNodes('math');
    function idxOf(list, cur) {
      for (var i = 0; i < list.length; i++) if (list[i].unit === cur.unit && list[i].node === cur.node) return i + 1;
      return 0;
    }
    bk.appendChild(U.h('div', { class: 'kv', style: { marginTop: '14px' } },
      U.h('div', { class: 'k', text: '语文' }), U.h('div', { text: (ywNow ? ywNow.title : '已学完') + '（第 ' + idxOf(ywAll, pr.yw) + ' / ' + ywAll.length + ' 节）' }),
      U.h('div', { class: 'k', text: '数学' }), U.h('div', { text: (sxNow ? sxNow.title : '已学完') + '（第 ' + idxOf(sxAll, pr.sx) + ' / ' + sxAll.length + ' 节）' }),
      U.h('div', { class: 'k', text: '写字' }), U.h('div', { text: '已写 ' + (pr.writingCursor || 0) + ' / ' + w.Content.writingTable().length + ' 字' })
    ));
    bk.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '12px' } },
      U.h('button', { class: 'btn btn-sm', text: '✏️ 跳到指定课时', onclick: openJump }),
      U.h('button', {
        class: 'btn btn-sm', text: '↺ 回到第一课',
        onclick: function () {
          U.confirm({ title: '从第一课重来？', desc: '只改进度指针，历史记录和星星都保留。' }).then(function (ok) {
            if (!ok) return;
            w.Store.jumpTo(0, 0, 0, 0);
            U.toast('已回到第一课', 'ok');
            App.render();
          });
        }
      })
    ));
    view.appendChild(bk);

    /* 排程 */
    var sch = U.h('div', { class: 'card' });
    sch.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '排程与补练' })));
    sch.appendChild(U.h('div', { class: 'kv' },
      U.h('div', { class: 'k', text: '开始日期' }), U.h('div', { text: p.startDate }),
      U.h('div', { class: 'k', text: '已完成' }), U.h('div', { text: (p.sessionsDone || 0) + ' 场' })
    ));
    var REC = w.Schedule.RECOMMENDED || { workCapacity: 1, satCapacity: 3, sunCapacity: 2, holidayCapacity: 3, catchupExtra: 2 };
    var ruleEl = U.h('div', { class: 'small muted', style: { marginTop: '10px' } });

    function setOne(key, val) {
      var o = {}; o[key] = Number(val);
      w.Store.saveSettings(o);
    }

    function capSelect(key, label, unit) {
      var def = REC[key];
      var list = (key === 'catchupExtra') ? [0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5];
      var now = Number(st[key] === undefined ? def : st[key]);
      var sel = U.h('select', { class: 'input', style: { maxWidth: '120px' } });
      list.forEach(function (n) {
        sel.appendChild(U.h('option', {
          value: n, selected: now === n,
          text: (unit === '场' && n === 0) ? '不补' : (n + ' ' + unit)
        }));
      });
      sel.addEventListener('change', function () {
        setOne(key, sel.value);
        U.toast('已保存：' + label + ' ' + (sel.value === '0' && unit === '场' ? '不补' : sel.value + ' ' + unit), 'ok');
        refreshRule();
      });
      return sel;
    }

    var work = capSelect('workCapacity', '工作日', '场');
    var sat = capSelect('satCapacity', '周六', '场');
    var sun = capSelect('sunCapacity', '周日', '场');
    var hd = capSelect('holidayCapacity', '法定节假日', '场');
    var cp = capSelect('catchupExtra', '每天补练', '场');

    sch.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '14px', gap: '18px' } },
      U.h('div', { class: 'field', style: { margin: 0 } }, U.h('label', { text: '工作日几场（推荐 ' + REC.workCapacity + '）' }), work),
      U.h('div', { class: 'field', style: { margin: 0 } }, U.h('label', { text: '周六几场（推荐 ' + REC.satCapacity + '）' }), sat),
      U.h('div', { class: 'field', style: { margin: 0 } }, U.h('label', { text: '周日几场（推荐 ' + REC.sunCapacity + '）' }), sun),
      U.h('div', { class: 'field', style: { margin: 0 } }, U.h('label', { text: '法定节假日几场（推荐 ' + REC.holidayCapacity + '）' }), hd),
      U.h('div', { class: 'field', style: { margin: 0 } }, U.h('label', { text: '每天最多补几场（推荐 ' + REC.catchupExtra + '）' }), cp)
    ));

    function refreshRule() {
      var s2 = w.Store.settings();
      var wc = Number(s2.workCapacity === undefined ? REC.workCapacity : s2.workCapacity);
      var sc = Number(s2.satCapacity === undefined ? REC.satCapacity : s2.satCapacity);
      var uc = Number(s2.sunCapacity === undefined ? REC.sunCapacity : s2.sunCapacity);
      var hc = Number(s2.holidayCapacity === undefined ? REC.holidayCapacity : s2.holidayCapacity);
      var cc = Number(s2.catchupExtra === undefined ? REC.catchupExtra : s2.catchupExtra);
      ruleEl.textContent = '当天应完成：工作日 ' + wc + ' 场、周六 ' + sc + ' 场、周日 ' + uc +
        ' 场、法定节假日 ' + hc + ' 场，当天全部做完才算完成。' +
        '没做完的算欠账，' + (cc > 0 ? '每天（含工作日）最多再补 ' + cc + ' 场，' : '目前设为不补欠账，') +
        '补练场次写字少一些，做完照样算完成。';
    }
    refreshRule();
    sch.appendChild(ruleEl);
    sch.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '6px' },
      text: '括号里是推荐值（原来的固定规则），可以按孩子的状态随时调；连续练到第 3 场会提醒休息。' }));
    sch.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '6px' },
      text: '改完只影响之后新生成的任务；今天已经排好的，点下面「重排今日任务」才会按新场次重排。' }));

    sch.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '12px' } },
      U.h('button', {
        class: 'btn btn-sm', text: '📆 编辑节假日表',
        onclick: function () { editHolidays(); }
      }),
      U.h('button', {
        class: 'btn btn-sm', text: '↺ 恢复内置表',
        onclick: function () { w.Schedule.saveCustom(null); U.toast('已恢复默认'); App.render(); }
      }),
      U.h('button', {
        class: 'btn btn-sm', text: '🎯 场次恢复推荐值',
        onclick: function () {
          w.Store.saveSettings({
            workCapacity: REC.workCapacity, satCapacity: REC.satCapacity,
            sunCapacity: REC.sunCapacity, holidayCapacity: REC.holidayCapacity,
            catchupExtra: REC.catchupExtra
          });
          U.toast('已恢复推荐场次', 'ok');
          App.render();
        }
      })
    ));
    view.appendChild(sch);

    /* 安全 */
    var sec = U.h('div', { class: 'card' });
    sec.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '家长密码' })));
    sec.appendChild(U.h('div', { class: 'small muted', text: App.hasPin() ? '已设置 4 位密码。孩子端看不到任何设置入口。' : '还没有设置密码。' }));
    sec.appendChild(U.h('div', { class: 'row', style: { marginTop: '12px' } },
      U.h('button', {
        class: 'btn btn-sm', text: App.hasPin() ? '修改密码' : '设置密码',
        onclick: function () {
          App.requirePin({ force: true }).then(function (ok) {
            if (!ok) return;
            U.askPin('设置新密码').then(function (v1) {
              if (!v1 || v1.length !== 4) return;
              U.askPin('再输一次').then(function (v2) {
                if (v1 !== v2) { U.toast('两次不一致', 'no'); return; }
                App.setPin(v1); U.toast('密码已更新', 'ok');
              });
            });
          });
        }
      }),
      U.h('button', { class: 'btn btn-sm', text: '立即锁定', onclick: function () { App.lock(); U.toast('已锁定'); App.go('#/today'); } })
    ));
    view.appendChild(sec);
  }

  function openJump() {
    var ywBook = w.Content.book('chinese'), sxBook = w.Content.book('math');
    var pr = w.Store.progress();

    function unitSelect(book, curUnit, onChange) {
      var sel = U.h('select', { class: 'input' });
      book.units.forEach(function (u, i) {
        sel.appendChild(U.h('option', { value: i, text: (i + 1) + '. ' + u.name.replace(/^第[^·]*· /, ''), selected: i === curUnit }));
      });
      sel.addEventListener('change', onChange);
      return sel;
    }
    function nodeSelect(book, unitIdx, curNode) {
      var sel = U.h('select', { class: 'input' });
      book.units[unitIdx].nodes.forEach(function (n, i) {
        sel.appendChild(U.h('option', { value: i, text: '第 ' + (i + 1) + ' 节 · ' + n.title, selected: i === curNode }));
      });
      return sel;
    }

    var ywUnitSel = unitSelect(ywBook, pr.yw.unit, function () { repaint(); });
    var ywNodeSel = nodeSelect(ywBook, pr.yw.unit, pr.yw.node);
    var sxUnitSel = unitSelect(sxBook, pr.sx.unit, function () { repaint(); });
    var sxNodeSel = nodeSelect(sxBook, pr.sx.unit, pr.sx.node);
    var wInput = U.h('input', { class: 'input', type: 'number', min: 0, value: pr.writingCursor || 0 });

    var ywNodeBox = U.h('div', { class: 'field' }, U.h('label', { text: '语文 · 第几节' }), ywNodeSel);
    var sxNodeBox = U.h('div', { class: 'field' }, U.h('label', { text: '数学 · 第几节' }), sxNodeSel);
    function repaint() {
      U.clear(ywNodeSel);
      ywBook.units[Number(ywUnitSel.value)].nodes.forEach(function (n, i) {
        ywNodeSel.appendChild(U.h('option', { value: i, text: '第 ' + (i + 1) + ' 节 · ' + n.title }));
      });
      U.clear(sxNodeSel);
      sxBook.units[Number(sxUnitSel.value)].nodes.forEach(function (n, i) {
        sxNodeSel.appendChild(U.h('option', { value: i, text: '第 ' + (i + 1) + ' 节 · ' + n.title }));
      });
    }

    var m = U.modal({
      title: '跳到指定课时',
      desc: '用于插班、跳课或重学某一节。历史记录与星星不受影响。',
      body: U.h('div', {},
        U.h('div', { class: 'field' }, U.h('label', { text: '语文 · 第几单元' }), ywUnitSel),
        ywNodeBox,
        U.h('div', { class: 'field' }, U.h('label', { text: '数学 · 第几单元' }), sxUnitSel),
        sxNodeBox,
        U.h('div', { class: 'field' }, U.h('label', { text: '写字游标（第几个字）' }), wInput)
      ),
      actions: [
        { label: '取消', class: 'btn-ghost', onClick: function (mm) { mm.close(); } },
        {
          label: '保存', class: 'btn-primary', onClick: function (mm) {
            w.Store.jumpTo(ywUnitSel.value, ywNodeSel.value, sxUnitSel.value, sxNodeSel.value);
            w.Store.saveProgress({ writingCursor: Number(wInput.value) || 0 });
            mm.close();
            U.toast('已跳转', 'ok');
            App.render();
          }
        }
      ]
    });
  }

  function toggle(label, value, onChange) {
    var input = U.h('input', { type: 'checkbox', checked: value ? true : false });
    input.addEventListener('change', function () { onChange(input.checked); });
    return U.h('label', { class: 'switch' }, input, U.h('span', { class: 'track' }), U.h('span', { text: label }));
  }

  function editHolidays() {
    var cur = w.Schedule.exportCustom();
    var text = cur.map(function (r) { return r[0] + ' ' + r[1] + ' ' + (r[2] || '假期'); }).join('\n');
    var ta = U.h('textarea', { class: 'input', style: { minHeight: '220px', fontFamily: 'monospace', fontSize: '13px' }, value: text });
    U.modal({
      title: '节假日表',
      desc: '每行一条：开始日期 结束日期 名称（空格分隔）。以国务院当年通知为准，改完保存即可。',
      body: ta,
      actions: [
        { label: '取消', class: 'btn-ghost', onClick: function (m) { m.close(); } },
        {
          label: '保存', class: 'btn-primary', onClick: function (m) {
            var rows = ta.value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
              var p = l.split(/\s+/);
              return [p[0], p[1] || p[0], p[2] || '假期'];
            }).filter(function (r) { return /^\d{4}-\d{2}-\d{2}$/.test(r[0]); });
            w.Schedule.saveCustom(rows);
            m.close();
            U.toast('已保存 ' + rows.length + ' 条', 'ok');
            App.render();
          }
        }
      ]
    });
  }

  /* ---------------- 数据 ---------------- */
  function renderData(view) {
    var last = w.Exporter.lastExportAt();
    var c = U.h('div', { class: 'card' });
    c.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '导出备份' }),
      last ? U.h('span', { class: 'pill ' + (Date.now() - last > 30 * 86400000 ? 'pink' : 'gray'), text: '上次 ' + U.fmt(new Date(last)) }) : U.h('span', { class: 'pill pink', text: '从未导出' })
    ));
    c.appendChild(U.h('div', { class: 'small muted', text: '数据只在这台电脑的浏览器里。换电脑、清缓存前一定要导出。' }));
    var row = U.h('div', { class: 'row wrap', style: { marginTop: '14px' } });
    row.appendChild(U.h('button', {
      class: 'btn btn-primary', text: '📦 导出 JSON（全量）',
      onclick: function () { w.Exporter.exportJSON(); U.toast('已导出', 'ok'); App.render(); }
    }));
    row.appendChild(U.h('button', {
      class: 'btn', text: '📊 导出 CSV（打卡流水）',
      onclick: function () { w.Exporter.exportCSV(); U.toast('已导出', 'ok'); }
    }));
    row.appendChild(U.h('button', {
      class: 'btn', text: '🗂 导出 ZIP（含作业照片）',
      onclick: function () {
        U.toast('正在打包照片…');
        w.Exporter.exportZIP(function (i, n) { if (i % 5 === 0) U.toast('已处理 ' + i + '/' + n + ' 张'); })
          .then(function () { U.toast('ZIP 已导出', 'ok'); App.render(); })
          .catch(function (e) { U.toast('导出失败：' + e.message, 'no'); });
      }
    }));
    c.appendChild(row);
    view.appendChild(c);

    var imp = U.h('div', { class: 'card' });
    imp.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '导入 / 还原' })));
    imp.appendChild(U.h('div', { class: 'small muted', text: '导入前会自动存一份快照；同一天的数据以后到的为准，导入完会给出报告。' }));
    var fileInput = U.h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' } });
    imp.appendChild(fileInput);
    imp.appendChild(U.h('button', {
      class: 'btn', style: { marginTop: '12px' }, text: '📥 选择 JSON 备份文件',
      onclick: function () { fileInput.click(); }
    }));
    fileInput.addEventListener('change', function () {
      var f = fileInput.files[0];
      if (!f) return;
      w.Exporter.importJSON(f).then(function (rep) {
        var body = U.h('div', {},
          U.h('div', { class: 'kv' },
            U.h('div', { class: 'k', text: '新增孩子' }), U.h('div', { text: rep.kidsAdded }),
            U.h('div', { class: 'k', text: '合并天数' }), U.h('div', { text: rep.daysMerged }),
            U.h('div', { class: 'k', text: '覆盖日期' }), U.h('div', { text: rep.daysOverwritten.join('、') || '无' }),
            U.h('div', { class: 'k', text: '新增答题' }), U.h('div', { text: rep.attemptsAdded }),
            U.h('div', { class: 'k', text: '写字记录' }), U.h('div', { text: rep.writingMerged }),
            U.h('div', { class: 'k', text: '提示' }), U.h('div', { text: rep.errors.join('；') || '无' })
          )
        );
        U.modal({ title: '导入完成', body: body, actions: [{ label: '知道了', class: 'btn-primary', onClick: function (m) { m.close(); App.render(); } }] });
      }).catch(function (e) { U.toast('导入失败：' + e.message, 'no'); });
      fileInput.value = '';
    });
    view.appendChild(imp);

    var danger = U.h('div', { class: 'card' });
    danger.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '危险操作' })));
    danger.appendChild(U.h('button', {
      class: 'btn btn-danger', text: '清空全部数据（保留设置）',
      onclick: function () {
        U.confirm({
          title: '清空所有人的记录？',
          desc: '会删除孩子档案、答题流水、写字照片。建议先导出 JSON。清空后无法恢复（会自动留一份快照，可在控制台还原）。',
          okText: '确认清空', danger: true
        }).then(function (ok) {
          if (!ok) return;
          w.Store.snapshot('before_wipe');
          w.Store.wipeAll();
          U.toast('已清空');
          location.hash = '#/setup';
          App.render();
        });
      }
    }));
    danger.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '10px' }, text: '清空前会自动快照（localStorage 中的 wb2_snapshot_before_wipe）。' }));
    view.appendChild(danger);
  }

  /* ---------------- AI 评分 ---------------- */
  function renderAI(view) {
    var st = w.Store.settings();
    var ai = st.ai || {};
    var c = U.h('div', { class: 'card' });
    c.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: 'AI 评分' }),
      U.h('span', { class: 'pill ' + (ai.enabled ? 'green' : 'gray'), text: ai.enabled ? '已开启' : '未开启' })
    ));
    c.appendChild(U.h('div', { class: 'small muted',
      text: '两种方式：① 导出「评分任务包」交给外部评分 App（推荐，key 存在你自己的 App 里）；② 在这里填 OpenAI 兼容接口，直接调用。' }));

    c.appendChild(U.h('div', { class: 'row', style: { marginTop: '14px' } },
      toggle('启用 AI 评分入口', ai.enabled, function (v) {
        w.Store.saveSettings({ ai: Object.assign({}, ai, { enabled: v }) });
        App.render();
      })
    ));
    c.appendChild(U.h('div', { class: 'row', style: { marginTop: '8px' } },
      toggle('拍照上传后自动点评', !!ai.autoScore, function (v) {
        w.Store.saveSettings({ ai: Object.assign({}, ai, { autoScore: v }) });
        if (v && (!ai.baseURL || !ai.model)) U.toast('先把下面的接口地址和模型填好，自动点评才会生效', 'no');
      })
    ));
    c.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '4px' }, text: '开启后孩子拍完 1 张照片就自动评分，家长不用再手动点；失败不打扰孩子，可在「批改」里重试。' }));

    var base = U.h('input', { class: 'input', placeholder: 'https://api.openai.com/v1', value: ai.baseURL || '' });
    var key = U.h('input', { class: 'input', type: 'password', placeholder: 'sk-...', value: ai.apiKey || '' });
    var model = U.h('input', { class: 'input', placeholder: 'gpt-4o-mini / qwen-vl-max …', value: ai.model || '' });
    c.appendChild(U.h('div', { class: 'field', style: { marginTop: '16px' } },
      U.h('label', { text: '接口地址（OpenAI 兼容 /chat/completions）' }), base,
      U.h('span', { class: 'hint', text: '本地模型也可以，例如 http://127.0.0.1:11434/v1' })));
    c.appendChild(U.h('div', { class: 'field' }, U.h('label', { text: 'API Key' }), key,
      U.h('span', { class: 'hint', text: '只存在本机浏览器里，不会上传到别处' })));
    c.appendChild(U.h('div', { class: 'field' }, U.h('label', { text: '模型名（需支持图片输入）' }), model));
    c.appendChild(U.h('button', {
      class: 'btn btn-primary', text: '保存配置',
      onclick: function () {
        w.Store.saveSettings({ ai: Object.assign({}, ai, { baseURL: base.value.trim(), apiKey: key.value.trim(), model: model.value.trim() }) });
        U.toast('已保存', 'ok');
        App.render();
      }
    }));
    view.appendChild(c);

    var flow = U.h('div', { class: 'card' });
    flow.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '评分流程' })));
    flow.appendChild(U.h('div', { class: 'small muted', text: '待批改 ' + w.Store.pendingReviews().length + ' 条' }));
    var row2 = U.h('div', { class: 'row wrap', style: { marginTop: '12px' } });
    row2.appendChild(U.h('button', {
      class: 'btn', text: '🎒 导出评分任务包（ZIP）',
      onclick: function () {
        U.toast('正在打包…');
        w.AI.exportPackage().then(function (n) { U.toast('已导出 ' + n + ' 条任务', 'ok'); })
          .catch(function (e) { U.toast(e.message, 'no'); });
      }
    }));
    row2.appendChild(U.h('button', {
      class: 'btn', text: '📥 导入评分结果 JSON',
      onclick: function () {
        var inp = U.h('input', { type: 'file', accept: '.json', style: { display: 'none' } });
        document.body.appendChild(inp);
        inp.addEventListener('change', function () {
          if (!inp.files[0]) return;
          w.AI.importResultFile(inp.files[0]).then(function (r) {
            U.toast('写入 ' + r.applied + ' 条', 'ok'); App.render();
          }).catch(function (e) { U.toast(e.message, 'no'); });
          document.body.removeChild(inp);
        });
        inp.click();
      }
    }));
    flow.appendChild(row2);

    flow.appendChild(U.h('div', { class: 'card-title', style: { marginTop: '18px' } }, U.h('h2', { text: '直连测试' })));
    var pending = w.Store.pendingReviews();
    if (!pending.length) {
      flow.appendChild(U.h('div', { class: 'small muted', text: '暂无待批改作业' }));
    } else {
      var first = pending[0];
      flow.appendChild(U.h('button', {
        class: 'btn btn-blue', text: '用 AI 批改「' + U.fmtCn(first.date) + '」这一条',
        onclick: function () {
          U.toast('AI 正在看照片…');
          w.AI.scoreDirect(first.date, first.slot || 0).then(function (r) {
            var s = r.scores || {};
            U.toast('AI 评分完成：' + ['stroke', 'structure', 'clean', 'complete']
              .map(function (d) { return s[d] || '-'; }).join('/') + '　已写入，可在「批改」里查看', 'ok');
            App.render();
          }).catch(function (e) { U.toast('评分失败：' + e.message, 'no'); });
        }
      }));
    }
    flow.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '12px' },
      text: '评分结果写入后仍可家长手动修改；AI 给的分不高时，孩子看到的仍是鼓励口径。' }));
    view.appendChild(flow);
  }

  App.page('parent', { title: '家长中心', render: render });
})(window);
