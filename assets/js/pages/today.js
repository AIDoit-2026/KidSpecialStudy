/* 今日任务页 */
(function (w) {
  'use strict';

  var DECOR = [
    { id: 'sprout', emoji: '🌱', name: '小芽', cost: 0 },
    { id: 'rainbow', emoji: '🌈', name: '彩虹', cost: 20 },
    { id: 'tree', emoji: '🌳', name: '大树', cost: 40 },
    { id: 'rocket', emoji: '🚀', name: '火箭', cost: 80 },
    { id: 'castle', emoji: '🏰', name: '城堡', cost: 150 },
    { id: 'dino', emoji: '🦖', name: '恐龙', cost: 220 },
    { id: 'unicorn', emoji: '🦄', name: '独角兽', cost: 320 }
  ];

  function greeting() {
    var h = new Date().getHours();
    if (h < 6) return '夜深了';
    if (h < 9) return '早上好';
    if (h < 12) return '上午好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function moduleProgress(s) {
    var items = s.items;
    var ans = s.answers || {};
    function cnt(list) {
      var done = 0, right = 0;
      (list || []).forEach(function (id) {
        if (ans[id]) { done++; if (ans[id].correct) right++; }
      });
      return { done: done, total: (list || []).length, right: right };
    }
    return {
      chars: cnt(items.chars), pinyin: cnt(items.pinyin), math: cnt(items.math),
      writing: { done: s.photoId ? 1 : 0, total: s.chars.length }
    };
  }

  function avatarColor(k) { return k.color || '#FF6B9D'; }

  function render(view, query) {
    var kid = w.Store.kids.active();
    var date = U.today();
    if (query && query.d) date = query.d;
    var day = w.Task.ensure(date);
    var sum = w.Task.summary(date);
    var settings = w.Store.settings();

    var curIdx = 0;
    (day.plan || []).forEach(function (s, i) { if (s.status !== 'done' && curIdx === i) curIdx = i; });
    for (var i = 0; i < (day.plan || []).length; i++) {
      if (day.plan[i].status !== 'done') { curIdx = i; break; }
      curIdx = i + 1;
    }
    if (curIdx >= (day.plan || []).length) curIdx = (day.plan || []).length - 1;
    var cur = (day.plan || [])[curIdx] || null;

    /* ---- Hero ---- */
    var hero = U.h('div', { class: 'hero' });
    hero.appendChild(U.h('div', { class: 'h-greet', text: greeting() + '，' + kid.name + '　·　' + U.fmtCn(date) + '　' + U.weekdayCn(date) }));
    hero.appendChild(U.h('h2', { text: sum.allDone ? '今天全部完成啦！🎉' : '今天的小练习准备好了' }));

    var meta = U.h('div', { class: 'h-meta' });
    meta.appendChild(U.h('span', { class: 'pill pink', text: '⏱ 约 ' + (cur ? cur.estMin : 30) + ' 分钟 / 场' }));
    meta.appendChild(U.h('span', { class: 'pill blue', text: sum.dayTypeLabel + (sum.holiday ? '·' + sum.holiday : '') }));
    meta.appendChild(U.h('span', { class: 'pill green', text: '今日 ' + sum.doneCount + '/' + sum.planned + ' 场' }));
    if (sum.backlog > 0) {
      meta.appendChild(U.h('span', {
        class: 'pill yellow',
        text: '还差 ' + sum.backlog + ' 场' + (sum.eta && sum.eta.date ? '（' + U.fmtCn(sum.eta.date) + ' 可补完）' : '')
      }));
    }
    hero.appendChild(meta);

    var actions = U.h('div', { class: 'h-actions' });
    var allDone = sum.allDone;
    actions.appendChild(U.h('button', {
      class: 'btn ' + (allDone ? 'btn-ghost' : 'btn-primary') + ' btn-lg',
      text: allDone ? '✓ 今日已全部完成' : (curIdx > 0 ? '继续第 ' + (curIdx + 1) + ' 场' : '开始今天的练习'),
      onclick: function () {
        if (allDone) { U.toast('今天已经完成 ' + sum.doneCount + ' 场，太棒了'); return; }
        App.go('#/practice?slot=' + curIdx);
      }
    }));
    actions.appendChild(U.h('button', {
      class: 'btn btn-ghost btn-lg', text: '🖨 打印练习单',
      onclick: function () { App.go('#/print?slot=' + curIdx); }
    }));
    hero.appendChild(actions);
    hero.appendChild(U.h('div', { class: 'h-decor', text: kid.avatar }));
    view.appendChild(hero);

    if (w.Store.photoMode && w.Store.photoMode() === 'local') {
      view.appendChild(U.h('div', {
        class: 'small', style: {
          marginTop: '-6px', marginBottom: '12px', background: '#FFF9E6',
          border: '1px solid #FFE9A8', borderRadius: '12px', padding: '10px 14px', color: '#8A6E00'
        },
        text: '提示：当前是「双击 index.html」打开，浏览器不让存照片，照片会暂存在浏览器小仓库里（最多 40 张）。推荐双击 start.bat 用本地服务器打开，照片存得更稳。'
      }));
    }

    if (settings.pace === 'light' || settings.pace === 'plus') {
      view.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '-6px', marginBottom: '12px' },
        text: '当前节奏：' + (settings.pace === 'light' ? '轻（约 20 分钟）' : '加量（约 40 分钟）') + '，可在家长中心调整。' }));
    }

    /* ---- 场次条 ---- */
    if ((day.plan || []).length > 1) {
      var strip = U.h('div', { class: 'session-strip' });
      day.plan.forEach(function (s, i) {
        var cls = 'session-chip' + (s.status === 'done' ? ' done' : '') + (i === curIdx && s.status !== 'done' ? ' now' : '');
        strip.appendChild(U.h('div', {
          class: cls, onclick: function () { if (s.status !== 'done') App.go('#/practice?slot=' + i); }
        },
          U.h('span', { class: 'dot' }),
          U.h('span', { text: '第 ' + (i + 1) + ' 场' }),
          U.h('span', { class: 'sub', text: s.type === 'catchup' ? '补练' : '新内容' })
        ));
      });
      view.appendChild(strip);
    }

    /* ---- 四张任务卡 ---- */
    var pr = cur ? moduleProgress(cur) : null;
    var grid = U.h('div', { class: 'task-grid', style: { marginTop: '16px' } });

    function card(cfg) {
      var pct = cfg.total ? Math.round(cfg.done / cfg.total * 100) : 0;
      var el = U.h('div', { class: 'task-card' + (pct >= 100 ? ' done' : ''), style: { '--tc': cfg.color } });
      el.appendChild(U.h('div', { class: 'tc-emoji', text: cfg.emoji }));
      el.appendChild(U.h('div', { class: 'tc-name', text: cfg.name }));
      el.appendChild(U.h('div', { class: 'tc-sub', text: cfg.sub || '' }));
      el.appendChild(U.h('div', { class: 'tc-prog' }, U.h('i', { style: { width: pct + '%' } })));
      el.appendChild(U.h('div', { class: 'tc-num', text: cfg.done + ' / ' + cfg.total }));
      el.addEventListener('click', cfg.onClick);
      return el;
    }

    if (pr) {
      grid.appendChild(card({
        emoji: '🈶', name: '认字', color: 'var(--purple)',
        sub: cur.yw ? cur.yw.lesson || cur.yw.title : '巩固练习',
        done: pr.chars.done, total: pr.chars.total,
        onClick: function () { App.go('#/practice?slot=' + curIdx + '&module=chars'); }
      }));
      grid.appendChild(card({
        emoji: '🔤', name: '拼音', color: 'var(--blue)',
        sub: '拼读 · 声调 · 辨析',
        done: pr.pinyin.done, total: pr.pinyin.total,
        onClick: function () { App.go('#/practice?slot=' + curIdx + '&module=pinyin'); }
      }));
      grid.appendChild(card({
        emoji: '🔢', name: '数学', color: 'var(--orange)',
        sub: cur.sx ? cur.sx.lesson || cur.sx.title : '巩固练习',
        done: pr.math.done, total: pr.math.total,
        onClick: function () { App.go('#/practice?slot=' + curIdx + '&module=math'); }
      }));
      grid.appendChild(card({
        emoji: '🖌', name: '写字', color: 'var(--green)',
        sub: cur.chars.length ? cur.chars.slice(0, 5).join(' ') : '本场无写字',
        done: pr.writing.done, total: pr.writing.total || 1,
        onClick: function () { App.go('#/writing?slot=' + curIdx); }
      }));
    }
    view.appendChild(grid);

    /* ---- 下次节假日提示 ---- */
    var nh = w.Schedule.nextHolidays(date, 1);
    if (sum.backlog > 0 && nh.length) {
      view.appendChild(U.h('div', { class: 'card', style: { marginTop: '16px' } },
        U.h('div', { class: 'row' },
          U.h('span', { style: { fontSize: '24px' }, text: '📅' }),
          U.h('div', {},
            U.h('div', { style: { fontWeight: '800', fontSize: '15px' }, text: '欠下的 ' + sum.backlog + ' 场，安排到假期补' }),
            U.h('div', { class: 'small muted', text: '最近的' + nh[0].name + '：' + U.fmtCn(nh[0].date) + ' 起 ' + nh[0].days + ' 天，每天最多 3 场（含补练）。' })
          )
        )
      ));
    }

    /* ---- 我的小屋（虚拟奖励）---- */
    var decor = w.Store.decor();
    var stars = w.Store.stars();
    var bar = U.h('div', { class: 'card', style: { marginTop: '16px' } });
    var head = U.h('div', { class: 'card-title' },
      U.h('h2', { text: '🏡 我的小屋' }),
      U.h('div', { class: 'row' },
        U.h('span', { class: 'pill yellow', text: '⭐ ' + stars }),
        U.h('button', { class: 'btn btn-sm', text: '装扮', onclick: openShop })
      )
    );
    bar.appendChild(head);
    var dbar = U.h('div', { class: 'decor-bar' });
    DECOR.forEach(function (d) {
      var owned = d.cost === 0 || decor.indexOf(d.id) >= 0;
      dbar.appendChild(U.h('span', {
        class: 'decor-item' + (owned ? ' on' : ''), title: d.name + (owned ? '' : '（' + d.cost + ' 星解锁）'),
        text: d.emoji
      }));
    });
    bar.appendChild(dbar);
    frame(() => {
      bar.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '8px' },
        text: ownedCount() + ' / ' + DECOR.length + ' 件装饰已解锁，答对题目和交作业都能攒星星。' }));
    });
    view.appendChild(bar);

    function ownedCount() {
      var n = 0;
      DECOR.forEach(function (d) { if (d.cost === 0 || decor.indexOf(d.id) >= 0) n++; });
      return n;
    }

    function openShop() {
      var body = U.h('div', { class: 'grid g2' });
      var m = U.modal({ title: '装饰小商店', desc: '用星星解锁，纯虚拟奖励，随时可换。', body: body });
      DECOR.forEach(function (d) {
        var owned = d.cost === 0 || w.Store.decor().indexOf(d.id) >= 0;
        body.appendChild(U.h('div', {
          class: 'card', style: { padding: '14px', textAlign: 'center', boxShadow: 'none', background: '#FBF7FA' }
        },
          U.h('div', { style: { fontSize: '34px' }, text: d.emoji }),
          U.h('div', { style: { fontWeight: '800', fontSize: '14px' }, text: d.name }),
          owned ? U.h('div', { class: 'pill green', style: { marginTop: '6px' }, text: '已拥有' }) :
            U.h('button', {
              class: 'btn btn-sm', style: { marginTop: '6px' },
              text: '⭐ ' + d.cost,
              onclick: function () {
                if (w.Store.stars() < d.cost) { U.toast('星星还不够，再做几天吧', 'no'); return; }
                w.Store.addStars(-d.cost);
                w.Store.unlockDecor(d.id);
                U.sfx('done');
                m.close();
                render(view, query);
              }
            })
        ));
      });
    }
  }

  /* 简易延迟执行（避免上面函数声明顺序问题） */
  function frame(fn) { setTimeout(fn, 0); }

  App.page('today', { title: '今日任务', render: render, DECOR: DECOR });
})(window);
