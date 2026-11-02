/* 打卡完成页 */
(function (w) {
  'use strict';

  function render(view, query) {
    var date = U.today();
    var slot = Number(query.slot || 0);
    var day = w.Task.ensure(date);
    var session = day.plan[slot];
    if (!session) { App.go('#/today'); return; }

    var firstTime = session.status !== 'done';
    if (firstTime) {
      w.Task.completeSlot(date, slot, { ms: session.ms || 0 });
      day = w.Store.day(date);
      session = day.plan[slot];
      U.sfx('done');
    }

    var items = w.Task.sessionItems(session);
    var correct = session.correct || 0;
    var score = session.score || 0;
    var gain = 0;
    items.forEach(function (it) {
      var a = (session.answers || {})[it.id];
      if (a && a.correct) gain += (a.tries > 1 ? 0.5 : 1);
    });
    if (session.photoId) gain += 2;

    var wrap = U.h('div', { class: 'done-wrap' });
    wrap.appendChild(U.h('div', { class: 'done-emoji', text: score >= 0.8 ? '🎉' : score >= 0.5 ? '👍' : '💪' }));
    wrap.appendChild(U.h('h2', { text: '第 ' + (slot + 1) + ' 场完成！' }));
    wrap.appendChild(U.h('div', { class: 'muted', text: session.type === 'catchup' ? '这一场是补练，欠的账又少一场～' : '今天的任务打卡成功' }));

    var starRow = U.h('div', { class: 'done-stars' });
    var n = Math.min(5, Math.max(1, Math.round(score * 5)));
    for (var i = 0; i < 5; i++) starRow.appendChild(U.h('span', { style: { opacity: i < n ? 1 : 0.22 }, text: '⭐' }));
    wrap.appendChild(starRow);

    var stats = U.h('div', { class: 'done-stats' });
    stats.appendChild(U.h('div', { class: 'ds' }, U.h('b', { text: correct + '/' + items.length }), U.h('span', { text: '答对题数' })));
    stats.appendChild(U.h('div', { class: 'ds' }, U.h('b', { text: '+' + gain }), U.h('span', { text: '本次星星' })));
    stats.appendChild(U.h('div', { class: 'ds' }, U.h('b', { text: App.streak() }), U.h('span', { text: '连续天数' })));
    wrap.appendChild(stats);

    /* 今日全部场次状态 */
    var sum = w.Task.summary(date);
    if (sum.planned > 1) {
      var box = U.h('div', { class: 'card', style: { textAlign: 'left' } });
      box.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '今天还有 ' + (sum.planned - sum.doneCount) + ' 场' })));
      box.appendChild(U.h('div', { class: 'small muted', text: '今天是' + sum.dayTypeLabel + (sum.holiday ? '（' + sum.holiday + '）' : '') + '，应完成 ' + sum.capacity + ' 场' +
        (sum.planned > sum.capacity ? '，另有 ' + (sum.planned - sum.capacity) + ' 场补练（今天共 ' + sum.planned + ' 场）' : '') + '。' }));
      wrap.appendChild(box);
    } else if (sum.backlog > 0) {
      var eta = sum.eta;
      wrap.appendChild(U.h('div', { class: 'card', style: { textAlign: 'left' } },
        U.h('div', { class: 'small muted', text: '还有 ' + sum.backlog + ' 场没补（' + (eta && eta.date ? U.fmtCn(eta.date) + ' 前后可补完' : '') + '），到假期每天可以多做 2 场。' })
      ));
    }

    /* 明日预告 */
    var p = w.Store.progress();
    var ywNext = w.Content.nodeAtCursor('chinese', p.yw);
    var sxNext = w.Content.nodeAtCursor('math', p.sx);
    var nxt = U.h('div', { class: 'card', style: { textAlign: 'left' } });
    nxt.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '明天见 👋' })));
    nxt.appendChild(U.h('div', { class: 'kv' },
      U.h('div', { class: 'k', text: '语文' }), U.h('div', { text: ywNext ? ywNext.title : '巩固复习' }),
      U.h('div', { class: 'k', text: '数学' }), U.h('div', { text: sxNext ? sxNext.title : '巩固复习' })
    ));
    wrap.appendChild(nxt);

    var actions = U.h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' } });
    actions.appendChild(U.h('button', { class: 'btn btn-primary btn-lg', text: '回到首页', onclick: function () { App.go('#/today'); } }));
    if (sum.planned > sum.doneCount) {
      actions.appendChild(U.h('button', {
        class: 'btn btn-lg', text: '继续下一场 →',
        onclick: function () {
          var next = sum.doneCount;
          App.go('#/practice?slot=' + next);
        }
      }));
    }
    actions.appendChild(U.h('button', { class: 'btn btn-ghost btn-lg', text: '看成长记录', onclick: function () { App.go('#/growth'); } }));
    wrap.appendChild(actions);

    view.appendChild(wrap);
  }

  App.page('done', { title: '完成打卡', render: render });
})(window);
