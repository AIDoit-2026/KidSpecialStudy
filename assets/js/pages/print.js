/* 打印练习单：A4、彩色、含图示与空白田字格 */
(function (w) {
  'use strict';

  function itemLine(no, item) {
    var line = U.h('div', { class: 'pr-item' });
    var stem = U.h('div', { class: 'pr-stem' });
    stem.appendChild(U.h('span', { class: 'pr-no', text: no + '.' }));
    stem.appendChild(U.h('span', { text: item.stem }));
    line.appendChild(stem);

    var fig = null;
    var figFn = App.pages.practice && App.pages.practice.renderFigure;
    if (item.fig && figFn) {
      fig = figFn(item.fig);
      if (fig) {
        fig.classList.add('pr-fig');
        line.appendChild(fig);
      }
    }

    if (item.options) {
      var opts = U.h('div', { class: 'pr-opts' });
      item.options.forEach(function (o, i) {
        opts.appendChild(U.h('span', { class: 'pr-opt' }, U.h('b', { text: 'ABCD'[i] + '．' }), String(o)));
      });
      line.appendChild(opts);
    } else {
      line.appendChild(U.h('div', { class: 'pr-answer' }, '答：', U.h('span', { class: 'pr-blank' }), item.unit || ''));
    }
    return line;
  }

  function writingRow(ch, count) {
    var row = U.h('div', { class: 'pr-write-row' });
    var label = U.h('div', { class: 'pr-write-label' },
      U.h('div', { style: { fontFamily: 'var(--font-kai)', fontSize: '30px', lineHeight: '1' }, text: ch }),
      U.h('div', { class: 'tiny muted', text: w.CHARS[ch] ? w.CHARS[ch].p : '' })
    );
    row.appendChild(label);
    for (var i = 0; i < (count || 4); i++) {
      var tian = U.h('div', { class: 'pr-tian' });
      if (i === 0) {
        tian.classList.add('trace');
        tian.appendChild(U.h('span', { class: 'pr-glyph', text: ch }));
      }
      row.appendChild(tian);
    }
    return row;
  }

  function render(view, query) {
    var date = U.today();
    var slot = Number(query.slot || 0);
    var mode = query.mode || 'all';
    var day = w.Task.ensure(date);
    var session = day.plan[slot];
    if (!session) { App.go('#/today'); return; }
    var kid = w.Store.kids.active();

    var bar = U.h('div', { class: 'no-print', style: { display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' } });
    bar.appendChild(U.h('button', { class: 'btn btn-primary', text: '🖨 打印这张', onclick: function () { w.print(); } }));
    bar.appendChild(U.h('button', { class: 'btn', text: '← 返回今日', onclick: function () { App.go('#/today'); } }));
    bar.appendChild(U.h('div', { class: 'small muted', style: { alignSelf: 'center' }, text: '提示：打印时选「彩色」「A4 纵向」，纸张边距用「默认」即可。' }));
    view.appendChild(bar);

    var sheet = U.h('div', { class: 'print-sheet' });
    sheet.appendChild(U.h('div', { class: 'pr-head' },
      U.h('div', { class: 'pr-title', text: '宝贝每日一练 · 一年级上册' }),
      U.h('div', { class: 'pr-meta', text: '姓名：' + (kid ? kid.name : '＿＿＿') + '　　日期：' + date + '　　第 ' + (slot + 1) + ' 场' })
    ));

    var items = w.Task.sessionItems(session);
    var groups = [
      { key: 'chars', name: '一、认字', list: items.filter(function (i) { return i.module === 'chars'; }) },
      { key: 'pinyin', name: '二、拼音', list: items.filter(function (i) { return i.module === 'pinyin'; }) },
      { key: 'math', name: '三、数学', list: items.filter(function (i) { return i.module === 'math'; }) }
    ];

    if (mode !== 'writing') {
      groups.forEach(function (g) {
        if (!g.list.length) return;
        sheet.appendChild(U.h('div', { class: 'pr-section', text: g.name }));
        g.list.forEach(function (it, i) { sheet.appendChild(itemLine(i + 1, it)); });
      });
    }

    if (session.chars && session.chars.length) {
      sheet.appendChild(U.h('div', { class: 'pr-section', text: '四、写字（每字写满一行）' }));
      session.chars.forEach(function (c) {
        sheet.appendChild(writingRow(c, mode === 'writing' ? 6 : 4));
      });
    }

    sheet.appendChild(U.h('div', { class: 'pr-foot' },
      U.h('span', { text: '做完请拍照上传，或在纸上完成后由家长批改。' }),
      U.h('span', { text: '家长签字：＿＿＿＿＿' })
    ));

    view.appendChild(sheet);
  }

  App.page('print', { title: '打印练习单', render: render });
})(window);
