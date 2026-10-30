/* 错题本：按学科 / 知识点分组，可重练 */
(function (w) {
  'use strict';

  var SUBJECT_CN = { chars: '认字', pinyin: '拼音', math: '数学' };

  function render(view, query) {
    var m = w.Store.mistakes();
    var ids = Object.keys(m);
    var due = w.Store.dueMistakes(U.today());

    var head = U.h('div', { class: 'card' });
    head.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '📕 错题本' }),
      U.h('div', { class: 'row' },
        U.h('span', { class: 'pill pink', text: '共 ' + ids.length + ' 题' }),
        U.h('span', { class: 'pill blue', text: '今天该复习 ' + due.length + ' 题' })
      )
    ));
    head.appendChild(U.h('div', { class: 'small muted', text: '答错会自动记进来。答对一次推后 3 天，再答对推后 7 天，连对 3 次就毕业啦。' }));
    if (ids.length) {
      head.appendChild(U.h('div', { class: 'row wrap', style: { marginTop: '12px' } },
        U.h('button', {
          class: 'btn btn-primary', text: '开始重练（' + Math.min(ids.length, 10) + ' 题）',
          onclick: function () {
            var pick = ids.slice(0, 10);
            App.go('#/practice?ids=' + pick.join(','));
          }
        }),
        U.h('button', {
          class: 'btn', text: '🖨 打印错题单',
          onclick: function () { App.go('#/print?ids=' + ids.slice(0, 10).join(',')); }
        })
      ));
    }
    view.appendChild(head);

    if (!ids.length) {
      view.appendChild(U.h('div', { class: 'card' },
        U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '🎈' }), '还没有错题，继续保持！')
      ));
      return;
    }

    var groups = {};
    ids.forEach(function (id) {
      var r = m[id];
      var key = (r.subject || 'other') + '|' + (r.skill || '未分类');
      (groups[key] = groups[key] || []).push(r);
    });

    Object.keys(groups).sort().forEach(function (key) {
      var parts = key.split('|');
      var list = groups[key].sort(function (a, b) { return (a.dueDate || '') < (b.dueDate || '') ? -1 : 1; });
      var box = U.h('div', { class: 'mistake-group' });
      box.appendChild(U.h('h3', {},
        U.h('span', { class: 'pill purple', text: SUBJECT_CN[parts[0]] || parts[0] }),
        U.h('span', { text: parts[1] }),
        U.h('span', { class: 'pill gray', text: list.length + ' 题' })
      ));
      list.forEach(function (r) {
        var it = w.Content.item(r.itemId);
        var row = U.h('div', { class: 'mistake-item' });
        row.appendChild(U.h('div', { class: 'mi-stem', text: it ? it.stem : (r.stem || r.itemId) }));
        var meta = '错了 ' + (r.wrongCount || 1) + ' 次　·　第 ' + (r.box || 1) + ' 轮复习';
        if (r.dueDate) meta += '　·　' + (r.dueDate <= U.today() ? '今天就该复习' : U.fmtCn(r.dueDate) + ' 复习');
        row.appendChild(U.h('div', { class: 'mi-meta', text: meta }));
        var btns = U.h('div', { class: 'row', style: { marginTop: '6px' } });
        btns.appendChild(U.h('button', {
          class: 'btn btn-sm', text: '重练这道',
          onclick: function () { App.go('#/practice?ids=' + r.itemId); }
        }));
        btns.appendChild(U.h('button', {
          class: 'btn btn-sm', text: '移出',
          onclick: function () {
            var mm = Object.assign({}, w.Store.mistakes());
            delete mm[r.itemId];
            w.Store.saveMistakes(mm);
            U.toast('已移出');
            App.render();
          }
        }));
        row.appendChild(btns);
        box.appendChild(row);
      });
      view.appendChild(box);
    });
  }

  App.page('mistakes', { title: '错题本', render: render });
})(window);
