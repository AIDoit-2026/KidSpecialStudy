/* 真题题库：按年级 / 单元归档的真实试卷，家长输密码后可仿造一份同型卷 */
(function (w) {
  'use strict';

  function render(view, query) {
    if (!App.isUnlocked()) {
      var lock = U.h('div', { class: 'card', style: { maxWidth: '460px', margin: '40px auto', textAlign: 'center' } });
      lock.appendChild(U.h('div', { style: { fontSize: '42px' }, text: '🔒' }));
      lock.appendChild(U.h('h2', { style: { margin: '8px 0' }, text: '真题题库' }));
      lock.appendChild(U.h('p', { class: 'small muted',
        text: '这里存的是孩子考过的真题，按年级和单元归档。仿造试卷会换掉数字和图形，结构和分值不变，孩子不能靠背答案过关。' }));
      lock.appendChild(U.h('button', {
        class: 'btn btn-primary', style: { marginTop: '16px' },
        text: App.hasPin() ? '输入家长密码' : '设置家长密码',
        onclick: function () { App.requirePin().then(function (ok) { if (ok) App.render(); }); }
      }));
      view.appendChild(lock);
      return;
    }

    var groups = w.Exam.groups();
    var openId = query.open || '';

    /* ---- 概览 ---- */
    var head = U.h('div', { class: 'card' });
    head.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '真题题库' }),
      U.h('span', { class: 'pill purple', text: groups.length + ' 组' })
    ));
    var totalItems = 0, totalPapers = 0;
    groups.forEach(function (g) {
      g.papers.forEach(function (p) { totalPapers++; totalItems += w.Exam.countOf(p); });
    });
    head.appendChild(U.h('div', { class: 'small muted',
      text: '一共 ' + totalPapers + ' 份试卷、' + totalItems + ' 道题。题目里的手写答案已经去掉，标准答案单独存；' +
        '「仿造」会把数字和图形换一遍，卷面结构、题量、分值都不变。' }));
    head.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '12px' } },
      U.h('button', {
        class: 'btn btn-sm', text: '💡 怎么用',
        onclick: function () {
          U.modal({
            title: '真题题库怎么用',
            body: U.h('div', { class: 'small', style: { lineHeight: '1.9' } },
              U.h('p', { text: '1. 孩子考完试，把卷子拍照传上来，题目录进题库（去掉孩子写的答案，标准答案单独存）。' }),
              U.h('p', { text: '2. 录题时按「年级 + 单元」归档，比如这份是一年级上册第 1–2 单元。' }),
              U.h('p', { text: '3. 到周末或考前，家长输密码进来，点「仿造一份」，系统会出一份同结构、不同数字的卷子。' }),
              U.h('p', { text: '4. 打印出来给孩子做，做完可以点「显示答案」核对。' }),
              U.h('p', { class: 'muted', text: '孩子端看不到这个页面；30 分钟没操作会自动重新上锁。' })
            ),
            actions: [{ label: '知道了', class: 'btn-primary', onClick: function (m) { m.close(); } }]
          });
        }
      }),
      U.h('button', {
        class: 'btn btn-sm', text: '🔒 立即锁定',
        onclick: function () { App.lock(); U.toast('已锁定'); App.go('#/today'); }
      })
    ));
    view.appendChild(head);

    if (!groups.length) {
      view.appendChild(U.h('div', { class: 'card' },
        U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '📚' }), '题库还是空的')));
      return;
    }

    /* ---- 分组 ---- */
    groups.forEach(function (g) {
      var sec = U.h('div', { class: 'card' });
      sec.appendChild(U.h('div', { class: 'card-title' },
        U.h('h2', { text: g.label }),
        U.h('span', { class: 'pill gray', text: g.count + ' 份' })
      ));
      g.papers.forEach(function (p) {
        sec.appendChild(paperRow(p, openId === p.id));
        if (openId === p.id) sec.appendChild(detail(p));
      });
      view.appendChild(sec);
    });
  }

  function paperRow(p, opened) {
    var row = U.h('div', { class: 'ex-paper-row' + (opened ? ' on' : '') });
    var main = U.h('div', { class: 'ex-paper-main' });
    main.appendChild(U.h('div', { class: 'ex-paper-title', text: p.title }));
    main.appendChild(U.h('div', { class: 'ex-paper-meta',
      text: w.Exam.countOf(p) + ' 题 · ' + w.Exam.scoreOf(p) + ' 分 · ' + w.Exam.blankCount(p) + ' 个空 · 录入 ' + (p.recordedAt || '—') }));
    main.appendChild(U.h('div', { class: 'ex-paper-src', text: p.source || '' }));
    row.appendChild(main);

    var ops = U.h('div', { class: 'ex-paper-ops' });
    ops.appendChild(U.h('button', {
      class: 'btn btn-sm', text: opened ? '收起' : '看题录',
      onclick: function () { App.go('#/exam' + (opened ? '' : '?open=' + encodeURIComponent(p.id))); }
    }));
    ops.appendChild(U.h('button', {
      class: 'btn btn-sm btn-primary', text: '✨ 仿造一份',
      onclick: function () { makeVariant(p); }
    }));
    ops.appendChild(U.h('button', {
      class: 'btn btn-sm', text: '🖨 原卷',
      onclick: function () { App.go('#/paper?id=' + encodeURIComponent(p.id) + '&ans=1'); }
    }));
    row.appendChild(ops);
    return row;
  }

  /* ---- 题录详情 ---- */
  function detail(p) {
    var box = U.h('div', { class: 'ex-detail' });
    if (p.note) box.appendChild(U.h('div', { class: 'ex-detail-note', text: '📌 ' + p.note }));

    var rows = w.Exam.compareRows(p);
    var wrong = rows.filter(function (r) { return r.right < r.total; }).length;

    (p.sections || []).forEach(function (sec) {
      var h = U.h('div', { class: 'ex-detail-sec' });
      h.appendChild(U.h('b', { text: sec.no + '、' + sec.title + '　' }));
      h.appendChild(U.h('span', { class: 'muted', text: (sec.sub || '') + '　' + (sec.score || '') + ' 分' }));
      box.appendChild(h);

      (sec.items || []).forEach(function (it) {
        var line = U.h('div', { class: 'ex-detail-item' });
        line.appendChild(U.h('span', { class: 'edi-no', text: it.no || '' }));
        line.appendChild(U.h('span', { class: 'edi-stem', text: preview(it.stem || '（看图作答）') }));
        if (it.ansText) line.appendChild(U.h('span', { class: 'edi-ans', text: '答案 ' + it.ansText }));
        else if ((it.ans || []).length) line.appendChild(U.h('span', { class: 'edi-ans', text: '答案 ' + it.ans.join('、') }));
        if (it.attempt && it.attempt.length) {
          // 照片上看不到的空用 null 占位，不算作答，也不参与对错
          var seen = 0, wrong = 0;
          it.attempt.forEach(function (v, i) {
            if (v === null || v === undefined) return;
            seen++;
            if (String(v) !== String(it.ans[i])) wrong++;
          });
          var ok = seen > 0 && wrong === 0;
          line.appendChild(U.h('span', { class: 'edi-attempt' + (ok ? '' : ' bad'),
            text: ok ? '原卷 ✓'
              : '原卷 ' + it.attempt.map(function (v) {
                return (v === null || v === undefined) ? '—' : v;
              }).join('、') }));
        }
        if (it.note) line.appendChild(U.h('span', { class: 'edi-note', text: it.note }));
        box.appendChild(line);
      });
    });

    var foot = U.h('div', { class: 'ex-detail-foot' });
    foot.appendChild(U.h('span', { class: 'small muted',
      text: '原卷共 ' + rows.length + ' 组填空，错 ' + wrong + ' 组（红字标出）。' }));
    foot.appendChild(U.h('button', {
      class: 'btn btn-sm', text: '🖨 打印题录（含答案）',
      onclick: function () { App.go('#/paper?id=' + encodeURIComponent(p.id) + '&ans=1'); }
    }));
    box.appendChild(foot);
    return box;
  }

  function preview(s) {
    s = String(s).replace(/\{\{\}\}/g, '（　）');
    return s.length > 46 ? s.slice(0, 46) + '…' : s;
  }

  /* ---- 仿造弹窗 ---- */
  function makeVariant(p) {
    var info = U.h('div', { class: 'small', style: { lineHeight: '1.9' } });
    info.appendChild(U.h('p', { text: '会做出「' + p.title + '」的同型卷：' }));
    info.appendChild(U.h('p', { class: 'muted',
      text: '· 大题顺序、题量、每空分值都不变（共 ' + w.Exam.countOf(p) + ' 题 / ' + w.Exam.scoreOf(p) + ' 分 / ' +
        w.Exam.blankCount(p) + ' 空）' }));
    info.appendChild(U.h('p', { class: 'muted', text: '· 数字、图形数量、人物和物品全部换一遍，答案重新算' }));
    info.appendChild(U.h('p', { class: 'muted', text: '· 拓展题（原卷第 5 题那种）保留原样，不换数' }));

    var seed = U.h('input', { class: 'input', value: String(Math.floor(Math.random() * 90000) + 10000) });
    var ansBox = U.h('input', { type: 'checkbox' });

    var body = U.h('div', {},
      info,
      U.h('div', { class: 'field', style: { marginTop: '14px' } },
        U.h('label', { text: '试卷编号（同一个编号每次出的题一样，方便重印）' }), seed),
      U.h('label', { class: 'switch', style: { marginTop: '6px' } }, ansBox,
        U.h('span', { class: 'track' }), U.h('span', { text: '同时打印答案页' }))
    );

    U.modal({
      title: '仿造一份试卷',
      body: body,
      actions: [
        { label: '取消', class: 'btn-ghost', onClick: function (m) { m.close(); } },
        {
          label: '生成试卷', class: 'btn-primary', onClick: function (m) {
            var s = (seed.value || '').trim() || String(Date.now() % 90000);
            m.close();
            App.go('#/paper?id=' + encodeURIComponent(p.id) + '&seed=' + encodeURIComponent(s) +
              (ansBox.checked ? '&ans=1' : ''));
          }
        }
      ]
    });
  }

  App.page('exam', { title: '真题题库', render: render });
})(window);
