/* 题目预览：家长检查某天某一场的题目与答案（只读，不生成记录） */
(function (w) {
  'use strict';

  var MOD = {
    chars: { name: '认字', pill: 'purple' },
    pinyin: { name: '拼音', pill: 'blue' },
    math: { name: '数学', pill: 'orange' }
  };

  function answerText(it) {
    if (it.options) return 'ABCD'[it.answer] + '．' + it.options[it.answer];
    return String(it.answer === undefined ? '—' : it.answer) + (it.unit || '');
  }

  function qCard(it, no) {
    var m = MOD[it.module] || { name: it.module || '题目', pill: 'gray' };
    var card = U.h('div', { class: 'peek-q' });

    var head = U.h('div', { class: 'q-head' });
    head.appendChild(U.h('span', { class: 'pill ' + m.pill, text: m.name }));
    if (it.skill) {
      var parts = String(it.skill).split('.');
      head.appendChild(U.h('span', { class: 'q-skill', text: parts.length > 1 ? parts[1] : parts[0] }));
    }
    head.appendChild(U.h('span', { class: 'q-no', text: '第 ' + no + ' 题' }));
    card.appendChild(head);

    var isPy = it.module === 'pinyin' || it.stemPy;
    card.appendChild(U.h('div', { class: 'q-stem' + (isPy ? ' py' : ''), text: it.stem }));

    var figFn = App.pages.practice && App.pages.practice.renderFigure;
    if (it.fig && figFn) {
      var fig = figFn(it.fig);
      if (fig) { fig.classList.add('peek-fig'); card.appendChild(fig); }
    }

    if (it.options) {
      var opts = U.h('div', { class: 'q-opts' + (isPy ? ' py' : '') });
      it.options.forEach(function (o, i) {
        opts.appendChild(U.h('span', {
          class: 'q-opt' + (i === it.answer ? ' right' : ''),
          text: 'ABCD'[i] + '．' + o + (i === it.answer ? ' ✓' : '')
        }));
      });
      card.appendChild(opts);
    }

    var ans = U.h('div', { class: 'q-ans' });
    ans.appendChild(U.h('b', { text: '答案：' }));
    ans.appendChild(U.h('span', { class: isPy ? 'py' : '', text: answerText(it) }));
    card.appendChild(ans);

    if (it.explain) {
      card.appendChild(U.h('div', { class: 'q-expl', text: '解析：' + it.explain }));
    }
    return card;
  }

  function render(view, query) {
    /* 页面上有答案，不能让孩子直接敲 URL 看，跟家长中心同一把锁 */
    if (!App.isUnlocked()) {
      var lock = U.h('div', { class: 'card', style: { maxWidth: '460px', margin: '40px auto', textAlign: 'center' } });
      lock.appendChild(U.h('div', { style: { fontSize: '42px' }, text: '🔒' }));
      lock.appendChild(U.h('h2', { style: { margin: '8px 0' }, text: '题目预览' }));
      lock.appendChild(U.h('p', { class: 'muted small', text: '这一页有题目和答案，需要家长密码才能看。' }));
      lock.appendChild(U.h('button', {
        class: 'btn btn-primary', style: { marginTop: '16px' },
        text: App.hasPin() ? '输入家长密码' : '设置家长密码',
        onclick: function () { App.requirePin().then(function (ok) { if (ok) App.render(); }); }
      }));
      view.appendChild(lock);
      return;
    }

    var date = /^\d{4}-\d{2}-\d{2}$/.test(query.date || '') ? query.date : U.today();
    var slot = Number(query.slot || 0);
    var info = w.Task.preview(date);
    var plan = info.plan || [];
    var s = plan[slot];

    function backBtn() {
      return U.h('button', {
        class: 'btn btn-sm', text: '← 回到家长中心',
        onclick: function () { App.go('#/parent?tab=peek&date=' + date); }
      });
    }

    if (!s) {
      var c0 = U.h('div', { class: 'card' });
      c0.appendChild(U.h('div', { class: 'empty' },
        U.h('span', { class: 'e-emoji', text: '🤔' }),
        '这一天没有第 ' + (slot + 1) + ' 场，回家长中心换一天看看。'));
      c0.appendChild(U.h('div', { class: 'row', style: { justifyContent: 'center' } }, backBtn()));
      view.appendChild(c0);
      return;
    }

    var items = w.Task.sessionItems(s);

    var head = U.h('div', { class: 'card' });
    head.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: U.fmtCn(date) + '（' + U.weekdayCn(date) + '）第 ' + (slot + 1) + ' 场' }),
      U.h('div', { class: 'row' }, backBtn())
    ));

    var meta = U.h('div', { class: 'peek-meta' });
    meta.appendChild(U.h('span', {
      class: 'pill ' + (s.type === 'catchup' ? 'yellow' : s.type === 'extra' ? 'blue' : 'green'),
      text: s.type === 'catchup' ? '补欠账' : s.type === 'extra' ? '当天加练' : '新内容'
    }));
    meta.appendChild(U.h('span', { text: '　共 ' + items.length + ' 题　' +
      (info.source === 'record' ? '实际记录' : info.source === 'sim' ? '按当前进度推算' : '按当前进度估算') }));
    head.appendChild(meta);

    var lines = U.h('div', { style: { marginTop: '8px' } });
    if (s.yw) {
      lines.appendChild(U.h('div', { class: 'peek-line' },
        U.h('b', { text: '语文' }),
        U.h('span', { class: 'pl-text', text: s.yw.unitName + ' · ' + s.yw.title }),
        U.h('span', { class: 'pl-right', text: (s.items.chars || []).length + ' 认字 / ' + (s.items.pinyin || []).length + ' 拼音' })
      ));
    }
    if (s.sx) {
      lines.appendChild(U.h('div', { class: 'peek-line' },
        U.h('b', { text: '数学' }),
        U.h('span', { class: 'pl-text', text: s.sx.unitName + ' · ' + s.sx.title }),
        U.h('span', { class: 'pl-right', text: (s.items.math || []).length + ' 题' })
      ));
    }
    if (s.chars && s.chars.length) {
      lines.appendChild(U.h('div', { class: 'peek-line' },
        U.h('b', { text: '写字' }),
        U.h('span', { class: 'pl-text', text: s.chars.join('　') }),
        U.h('span', { class: 'pl-right', text: s.chars.length + ' 个' })
      ));
    }
    head.appendChild(lines);
    view.appendChild(head);

    var list = U.h('div', { style: { marginTop: '16px' } });
    items.forEach(function (it, i) { list.appendChild(qCard(it, i + 1)); });
    view.appendChild(list);

    // 场次之间直接翻，不用回家长中心
    if (plan.length > 1) {
      var nav = U.h('div', { class: 'row', style: { justifyContent: 'space-between', marginTop: '4px' } });
      nav.appendChild(slot > 0
        ? U.h('button', { class: 'btn btn-sm', text: '← 第 ' + slot + ' 场',
            onclick: function () { App.go('#/peek?date=' + date + '&slot=' + (slot - 1)); } })
        : U.h('span'));
      nav.appendChild(U.h('span', { class: 'small muted', text: '第 ' + (slot + 1) + ' / ' + plan.length + ' 场' }));
      nav.appendChild(slot < plan.length - 1
        ? U.h('button', { class: 'btn btn-sm', text: '第 ' + (slot + 2) + ' 场 →',
            onclick: function () { App.go('#/peek?date=' + date + '&slot=' + (slot + 1)); } })
        : U.h('span'));
      view.appendChild(nav);
    }

    view.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '10px', textAlign: 'center' },
      text: '这是只读预览，不会写进孩子的练习记录。' }));
  }

  App.page('peek', { title: '题目预览', render: render });
})(window);
