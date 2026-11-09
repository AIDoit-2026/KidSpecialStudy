/* 成长记录页 */
(function (w) {
  'use strict';

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
      /* 提交过一场就算这天打过卡，剩余场次在提示里说明 */
      if (w.Task.checkedIn(rec)) {
        var tail = plan.length && done < plan.length ? '（' + done + '/' + plan.length + ' 场）' : '';
        return { status: makeup > 0 ? 'makeup' : 'full', badge: '✓', title: key + '　已打卡' + tail };
      }
      if (done > 0) return { status: 'part', badge: done + '/' + plan.length, title: key + '　完成 ' + done + ' 场' };
      return { status: 'miss', title: key + '　未打卡' };
    }));
    var legend = U.h('div', { class: 'legend' });
    [['#CDEFC0', '已打卡'], ['#DCEEFF', '含补练'], ['#FFF0C2', '未完成'], ['#FBE9EF', '未打卡']].forEach(function (x) {
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

    /* 徽章：和今日任务页共用 Badges 的定义与判定，按组显示，没拿到的显示还差多少 */
    var badges = w.Badges.all();
    var ownedCount = badges.filter(function (b) { return b.owned; }).length;
    var badgeCard = U.h('div', { class: 'card' });
    badgeCard.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '🏅 徽章墙' }),
      U.h('span', { class: 'pill yellow', text: ownedCount + ' / ' + badges.length })
    ));
    badgeCard.appendChild(U.h('div', {
      class: 'small muted', style: { marginBottom: '10px' },
      text: '一直做题就会一枚一枚亮起来；灰色的徽章下面写着还差多少。'
    }));
    w.Badges.groups.forEach(function (g) {
      var list = badges.filter(function (b) { return b.group === g.id; });
      if (!list.length) return;
      var got = list.filter(function (b) { return b.owned; }).length;
      badgeCard.appendChild(U.h('div', { class: 'badge-group-head' },
        U.h('span', { text: g.emoji + ' ' + g.name }),
        U.h('span', { class: 'small muted', text: got + ' / ' + list.length })
      ));
      var bw = U.h('div', { class: 'badges' });
      list.forEach(function (b) {
        bw.appendChild(U.h('div', {
          class: 'badge-item' + (b.owned ? ' on' : ''),
          title: b.desc + (b.owned ? '' : '（' + b.current + ' / ' + b.goal + '）')
        },
          U.h('div', { class: 'b-emoji', text: b.emoji }),
          U.h('div', { class: 'b-name', text: b.name }),
          U.h('div', { class: 'b-desc', text: b.owned ? b.desc : '还差 ' + b.left + ' · ' + b.current + '/' + b.goal }),
          b.owned ? null : U.h('div', { class: 'b-prog' }, U.h('i', { style: { width: b.pct + '%' } }))
        ));
      });
      badgeCard.appendChild(bw);
    });
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
      var keys = Object.keys(allDays).filter(function (k) { return w.Task.checkedIn(allDays[k]); }).sort();
      var best = 0, cur = 0, prev = null;
      keys.forEach(function (k) {
        if (prev && U.diffDays(prev, k) === 1) cur++;
        else cur = 1;
        best = Math.max(best, cur);
        prev = k;
      });
      return best;
    }
  }

  App.page('growth', { title: '成长记录', render: render });
})(window);
