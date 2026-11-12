/* 真题试卷预览 / 打印：原卷题录 或 仿造卷 */
(function (w) {
  'use strict';

  function render(view, query) {
    var paper = w.Exam.get(query.id || '');
    if (!paper) {
      view.appendChild(U.h('div', { class: 'card' },
        U.h('h2', { text: '没找到这份试卷' }),
        U.h('div', { class: 'small muted', text: '可能题库更新过，回题库列表重新选一份。' }),
        U.h('button', {
          class: 'btn btn-primary', style: { marginTop: '12px' }, text: '← 回真题题库',
          onclick: function () { App.go('#/exam'); }
        })
      ));
      return;
    }

    var seed = query.seed || '';
    var isVar = !!seed;
    var showAns = query.ans === '1';
    var data = isVar ? w.Exam.variant(paper, seed) : paper;

    var bar = U.h('div', { class: 'no-print', style: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' } });
    bar.appendChild(U.h('button', { class: 'btn btn-primary', text: '🖨 打印这张', onclick: function () { w.print(); } }));
    bar.appendChild(U.h('button', {
      class: 'btn', text: showAns ? '👁 隐藏答案' : '👁 显示答案',
      onclick: function () { App.go(hashOf(query.id, seed, showAns ? '' : '1')); }
    }));
    if (isVar) {
      bar.appendChild(U.h('button', {
        class: 'btn', text: '🎲 再换一套',
        onclick: function () {
          App.go(hashOf(query.id, String(Date.now() % 100000), showAns ? '1' : ''));
        }
      }));
    }
    bar.appendChild(U.h('button', {
      class: 'btn', text: '← 回题库',
      onclick: function () { App.go('#/exam?open=' + encodeURIComponent(query.id)); }
    }));
    bar.appendChild(U.h('div', { class: 'small muted', style: { alignSelf: 'center' },
      text: '打印用 A4 纵向、边距默认；黑白打印也能看清。' }));
    view.appendChild(bar);

    var stage = U.h('div', { class: 'paper-stage' });
    stage.appendChild(w.Exam.renderPaper(data, {
      showAns: showAns,
      variant: isVar,
      seed: seed,
      date: U.today()
    }));
    view.appendChild(stage);
  }

  function hashOf(id, seed, ans) {
    var h = '#/paper?id=' + encodeURIComponent(id);
    if (seed) h += '&seed=' + encodeURIComponent(seed);
    if (ans) h += '&ans=1';
    return h;
  }

  App.page('paper', { title: '试卷预览', render: render });
})(window);
