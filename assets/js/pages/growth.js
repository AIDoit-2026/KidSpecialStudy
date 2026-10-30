/* 成长记录页 */
(function (w) {
  'use strict';

  var BADGES = [
    { id: 'streak7', emoji: '🔥', name: '坚持 7 天', desc: '连续打卡 7 天' },
    { id: 'streak14', emoji: '🌟', name: '坚持 14 天', desc: '连续打卡 14 天' },
    { id: 'streak30', emoji: '👑', name: '坚持 30 天', desc: '连续打卡 30 天' },
    { id: 'q100', emoji: '📚', name: '百题斩', desc: '累计答对 100 题' },
    { id: 'q500', emoji: '🏅', name: '五百题', desc: '累计答对 500 题' },
    { id: 's10', emoji: '🎯', name: '十场', desc: '完成 10 场练习' },
    { id: 'write10', emoji: '✍️', name: '小小书法家', desc: '交作业 10 次' },
    { id: 'perfect', emoji: '💎', name: '满分一次', desc: '单场全对' }
  ];

  function accOf(attempts, module) {
    var list = attempts.filter(function (a) { return !module || a.subject === module; });
    if (!list.length) return null;
    var right = list.filter(function (a) { return a.correct; }).length;
    return right / list.length;
  }

  function writingAvg() {
    var list = w.Store.writingList().filter(function (x) { return x.scores; });
    if (!list.length) return null;
    var sum = 0, n = 0;
    list.forEach(function (x) {
      var s = x.scores;
      var v = (s.stroke + s.structure + s.clean + s.complete) / 4;
      sum += v; n++;
    });
    return sum / n / 5;
  }

  function render(view, query) {
    var date = U.today();
    var allDays = w.Store.days();
    var attempts = w.Store.attempts();
    var progress = w.Store.progress();
    var monthOffset = Number(query.m || 0);
    var base = U.parse(date);
    var y = base.getFullYear(), m = base.getMonth() + monthOffset;
    var dt = new Date(y, m, 1);
    y = dt.getFullYear(); m = dt.getMonth();

    /* 概览 */
    var totalCorrect = attempts.filter(function (a) { return a.correct; }).length;
    var sessionsDone = progress.sessionsDone || 0;
    var row = U.h('div', { class: 'stat-row' });
    row.appendChild(statBox('⭐', '累计星星', w.Store.stars(), '答对 + 交作业获得'));
    row.appendChild(statBox('🔥', '连续打卡', App.streak() + ' 天', '最长 ' + longestStreak() + '天'));
    row.appendChild(statBox('✅', '完成场次', sessionsDone, '每场约 30 分钟'));
    row.appendChild(statBox('🎯', '平均正确率', pct(accOf(attempts)), '共 ' + attempts.length + ' 题'));
    view.appendChild(row);

    /* 日历 */
    var calCard = U.h('div', { class: 'card' });
    calCard.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '📅 ' + y + ' 年 ' + (m + 1) + ' 月' }),
      U.h('div', { class: 'row' },
        U.h('button', { class: 'btn btn-sm', text: '‹', onclick: function () { App.go('#/growth?m=' + (monthOffset - 1)); } }),
        U.h('button', { class: 'btn btn-sm', text: '本月', onclick: function () { App.go('#/growth'); } }),
        U.h('button', { class: 'btn btn-sm', text: '›', onclick: function () { App.go('#/growth?m=' + (monthOffset + 1)); } })
      )
    ));
    calCard.appendChild(Charts.calendar(y, m, function (key) {
      var rec = allDays[key];
      if (!rec) return { status: '', title: key };
      var plan = rec.plan || [];
      var done = plan.filter(function (s) { return s.status === 'done'; }).length;
      var makeup = plan.filter(function (s) { return s.type === 'catchup' && s.status === 'done'; }).length;
      if (rec.done) return { status: makeup > 0 ? 'makeup' : 'full', badge: '✓', title: key + '　全部完成' };
      if (done > 0) return { status: 'part', badge: done + '/' + plan.length, title: key + '　完成 ' + done + ' 场' };
      return { status: 'miss', title: key + '　未打卡' };
    }));
    var legend = U.h('div', { class: 'legend' });
    [['#CDEFC0', '全部完成'], ['#FFF0C2', '部分完成'], ['#DCEEFF', '含补练'], ['#FBE9EF', '未打卡']].forEach(function (x) {
      legend.appendChild(U.h('span', {}, U.h('i', { style: { background: x[0] } }), x[1]));
    });
    calCard.appendChild(legend);
    view.appendChild(calCard);

    /* 雷达 + 趋势 */
    var g2 = U.h('div', { class: 'grid g2', style: { marginTop: '16px', alignItems: 'start' } });

    var radarCard = U.h('div', { class: 'card' });
    radarCard.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '🎯 四项能力' })));
    var wAvg = writingAvg();
    var data = [
      { label: '认字', value: accOf(attempts, 'chars') || 0 },
      { label: '拼音', value: accOf(attempts, 'pinyin') || 0 },
      { label: '数学', value: accOf(attempts, 'math') || 0 },
      { label: '写字', value: wAvg || 0 }
    ];
    if (!attempts.length && wAvg === null) {
      radarCard.appendChild(U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '🌱' }), '做几天练习就能看到曲线啦'));
    } else {
      var rEl = Charts.radar(data);
      rEl.style.maxWidth = '340px';
      rEl.style.margin = '0 auto';
      radarCard.appendChild(rEl);
    }
    g2.appendChild(radarCard);

    var lineCard = U.h('div', { class: 'card' });
    lineCard.appendChild(U.h('div', { class: 'card-title' }, U.h('h2', { text: '📈 近 28 天正确率' })));
    var labels = [], vals = [];
    var span = Math.min(27, Math.max(2, U.diffDays(progress.startDate || date, date)));
    for (var i = span; i >= 0; i--) {
      var d = U.addDays(date, -i);
      labels.push((U.parse(d).getMonth() + 1) + '/' + U.parse(d).getDate());
      var dayAttempts = attempts.filter(function (a) { return a.date === d; });
      vals.push(dayAttempts.length ? dayAttempts.filter(function (a) { return a.correct; }).length / dayAttempts.length : 0);
    }
    if (!attempts.length) {
      lineCard.appendChild(U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '📈' }), '还没有数据'));
    } else {
      lineCard.appendChild(Charts.line(labels, vals, { percent: true, max: 1 }));
      lineCard.appendChild(U.h('div', { class: 'small muted center', text: '没有练习的日期按 0 计，看趋势即可' }));
    }
    g2.appendChild(lineCard);
    view.appendChild(g2);

    /* 徽章 */
    var badgeCard = U.h('div', { class: 'card' });
    var owned = ownedBadges();
    badgeCard.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '🏅 徽章墙' }),
      U.h('span', { class: 'pill yellow', text: owned.length + ' / ' + BADGES.length })
    ));
    var bw = U.h('div', { class: 'badges' });
    BADGES.forEach(function (b) {
      var on = owned.indexOf(b.id) >= 0;
      bw.appendChild(U.h('div', { class: 'badge-item' + (on ? ' on' : '') },
        U.h('div', { class: 'b-emoji', text: b.emoji }),
        U.h('div', { class: 'b-name', text: b.name }),
        U.h('div', { class: 'b-desc', text: b.desc })
      ));
    });
    badgeCard.appendChild(bw);
    view.appendChild(badgeCard);

    /* 错题入口 */
    var mis = Object.keys(w.Store.mistakes()).length;
    var entry = U.h('div', { class: 'card' });
    entry.appendChild(U.h('div', { class: 'row' },
      U.h('div', { style: { fontSize: '28px' }, text: '📕' }),
      U.h('div', { style: { flex: '1' } },
        U.h('div', { style: { fontWeight: '800' }, text: '错题本' }),
        U.h('div', { class: 'small muted', text: mis ? '还有 ' + mis + ' 道题需要再练' : '暂时没有错题，继续保持' })
      ),
      U.h('button', { class: 'btn btn-sm', text: '去看看', onclick: function () { App.go('#/mistakes'); } })
    ));
    view.appendChild(entry);

    function statBox(emoji, label, value, sub) {
      return U.h('div', { class: 'stat-box' },
        U.h('div', { class: 'sb-label', text: emoji + ' ' + label }),
        U.h('div', { class: 'sb-value', text: String(value) }),
        U.h('div', { class: 'sb-sub', text: sub || '' })
      );
    }

    function pct(v) { return v === null || v === undefined ? '—' : Math.round(v * 100) + '%'; }

    function longestStreak() {
      var keys = Object.keys(allDays).filter(function (k) { return allDays[k].done; }).sort();
      var best = 0, cur = 0, prev = null;
      keys.forEach(function (k) {
        if (prev && U.diffDays(prev, k) === 1) cur++;
        else cur = 1;
        best = Math.max(best, cur);
        prev = k;
      });
      return best;
    }

    function ownedBadges() {
      var out = [];
      var st = App.streak();
      if (st >= 7) out.push('streak7');
      if (st >= 14) out.push('streak14');
      if (st >= 30) out.push('streak30');
      if (totalCorrect >= 100) out.push('q100');
      if (totalCorrect >= 500) out.push('q500');
      if (sessionsDone >= 10) out.push('s10');
      if (w.Store.writingList().filter(function (x) { return x.photoId; }).length >= 10) out.push('write10');
      var perfect = Object.keys(allDays).some(function (k) {
        return (allDays[k].plan || []).some(function (s) { return s.status === 'done' && s.score === 1; });
      });
      if (perfect) out.push('perfect');
      return out;
    }
  }

  App.page('growth', { title: '成长记录', render: render });
})(window);
