/* 应用外壳：路由 / 导航 / 孩子切换 / 家长锁 */
(function (w) {
  'use strict';

  var pages = {};
  var current = null;
  var booted = false;

  var NAV = [
    { key: 'today', hash: '#/today', label: '今日任务', icon: '🏠', side: true, tab: true },
    { key: 'practice', hash: '#/practice', label: '开始练习', icon: '✏️', side: true },
    { key: 'writing', hash: '#/writing', label: '写字打卡', icon: '🖌', side: true },
    { key: 'growth', hash: '#/growth', label: '成长记录', icon: '📈', side: true, tab: true },
    { key: 'mistakes', hash: '#/mistakes', label: '错题本', icon: '📕', side: true, tab: true },
    { key: 'parent', hash: '#/parent', label: '家长中心', icon: '👨‍👩‍👧', side: true, tab: true }
  ];

  var App = {
    page: function (key, def) { pages[key] = def; },
    pages: pages,
    nav: NAV
  };

  /* ---------------- 路由 ---------------- */
  function parseHash() {
    var h = (location.hash || '#/today').replace(/^#\/?/, '');
    var qIdx = h.indexOf('?');
    var path = qIdx >= 0 ? h.slice(0, qIdx) : h;
    var query = {};
    if (qIdx >= 0) {
      h.slice(qIdx + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        var p = kv.split('=');
        query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
      });
    }
    return { path: path || 'today', query: query };
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function render() {
    var r = parseHash();
    var key = r.path.split('/')[0];
    var def = pages[key] || pages.today;
    current = { key: key, def: def, query: r.query };

    if (!w.Store.kids.list().length) {
      document.getElementById('app').hidden = true;
      var setupDef = pages.setup;
      var holder = document.getElementById('boot');
      if (setupDef) {
        document.getElementById('boot').hidden = true;
        var shell = document.getElementById('setup-shell');
        if (!shell) {
          shell = document.createElement('div');
          shell.id = 'setup-shell';
          document.body.appendChild(shell);
        }
        shell.innerHTML = '';
        setupDef.render(shell, r.query);
      }
      return;
    }

    var shell2 = document.getElementById('setup-shell');
    if (shell2) shell2.innerHTML = '';
    document.getElementById('app').hidden = false;
    document.getElementById('boot').hidden = true;

    document.body.classList.toggle('focus-mode', key === 'practice');
    refreshChrome();
    var view = document.getElementById('view');
    U.clear(view);
    document.getElementById('page-title').textContent = def.title || '';
    try {
      def.render(view, r.query);
    } catch (e) {
      console.error(e);
      view.innerHTML = '<div class="card"><h2>页面出错了</h2><p class="muted small">' + U.esc(e.message) + '</p></div>';
    }
    w.scrollTo(0, 0);
  }
  App.render = render;
  App.go = go;

  /* ---------------- 顶栏 / 导航 ---------------- */
  function refreshChrome() {
    var kid = w.Store.kids.active();
    var nav = document.getElementById('side-nav');
    var tabs = document.getElementById('bottom-tabs');
    var curKey = current ? current.key : 'today';
    var mapKey = curKey === 'review' ? 'parent' : curKey === 'done' ? 'practice' : curKey;

    nav.innerHTML = NAV.filter(function (n) { return n.side; }).map(function (n) {
      return '<a href="' + n.hash + '" class="' + (mapKey === n.key ? 'active' : '') + '">' +
        '<span class="ni">' + n.icon + '</span>' + n.label +
        (n.key === 'parent' && w.Store.pendingReviews().length ? ' <span class="badge-dot">' + w.Store.pendingReviews().length + '</span>' : '') +
        '</a>';
    }).join('');

    tabs.innerHTML = NAV.filter(function (n) { return n.tab; }).map(function (n) {
      return '<a href="' + n.hash + '" class="' + (mapKey === n.key ? 'active' : '') + '"><span class="ni">' + n.icon + '</span>' + n.label + '</a>';
    }).join('');

    var starChip = document.getElementById('star-chip');
    starChip.innerHTML = '⭐ <b>' + w.Store.stars() + '</b>';

    var kidChip = document.getElementById('kid-chip');
    if (kid) {
      kidChip.innerHTML = '<span class="kc-avatar" style="background:' + kid.color + '22">' + kid.avatar + '</span>' + U.esc(kid.name);
      var sideKid = document.getElementById('side-kid');
      var streak = streakOf();
      sideKid.innerHTML =
        '<div class="sk-row"><span class="sk-avatar">' + kid.avatar + '</span>' +
        '<div><div class="sk-name">' + U.esc(kid.name) + '</div>' +
        '<div class="sk-meta">一年级 · ' + (w.Content.book('chinese') ? '上册' : '') + '</div></div></div>' +
        '<div class="sk-streak">🔥 连续打卡 ' + streak + ' 天</div>';
      document.getElementById('brand-sub').textContent = w.Store.settings().pace === 'light' ? '轻量节奏' :
        w.Store.settings().pace === 'plus' ? '加量节奏' : '标准节奏';
    }
  }
  App.refreshChrome = refreshChrome;

  function streakOf() {
    var days = w.Store.days();
    var streak = 0;
    var d = U.today();
    // 今天没打卡不算断
    if (!(days[d] && days[d].done)) d = U.addDays(d, -1);
    for (var i = 0; i < 400; i++) {
      var rec = days[d];
      if (rec && rec.done) { streak++; d = U.addDays(d, -1); }
      else break;
    }
    return streak;
  }
  App.streak = streakOf;

  /* ---------------- 家长锁 ---------------- */
  var unlockedUntil = 0;
  function hasPin() { return !!w.Store.settings().pinHash; }

  function setPin(pin) {
    w.Store.saveSettings({ pinHash: U.hashPin(pin) });
  }

  function requirePin(opts) {
    opts = opts || {};
    if (Date.now() < unlockedUntil && !opts.force) return Promise.resolve(true);
    return new Promise(function (resolve) {
      if (!hasPin()) {
        // 首次设置
        U.askPin('设置家长密码').then(function (v1) {
          if (!v1 || v1.length !== 4) { resolve(false); return; }
          U.askPin('再输一次确认').then(function (v2) {
            if (v1 !== v2) { U.toast('两次输入不一致', 'no'); resolve(false); return; }
            setPin(v1);
            unlockedUntil = Date.now() + 30 * 60 * 1000;
            U.toast('家长密码已设置', 'ok');
            resolve(true);
          });
        });
        return;
      }
      U.askPin(opts.title || '请输入家长密码').then(function (v) {
        if (!v) { resolve(false); return; }
        if (U.hashPin(v) === w.Store.settings().pinHash) {
          unlockedUntil = Date.now() + 30 * 60 * 1000;
          resolve(true);
        } else {
          U.toast('密码不对，再试一次', 'no');
          resolve(false);
        }
      });
    });
  }
  App.requirePin = requirePin;
  App.hasPin = hasPin;
  App.setPin = setPin;
  App.lock = function () { unlockedUntil = 0; };
  App.isUnlocked = function () { return Date.now() < unlockedUntil; };

  /* ---------------- 孩子切换 ---------------- */
  function switchKid() {
    var kids = w.Store.kids.list();
    if (kids.length === 1) {
      U.toast('只有一个孩子，去家长中心添加');
      return;
    }
    var body = U.h('div');
    kids.forEach(function (k) {
      var active = w.Store.kids.activeId() === k.id;
      body.appendChild(U.h('button', {
        class: 'btn btn-block',
        style: {
          marginBottom: '8px', justifyContent: 'flex-start',
          background: active ? '#FFF2F7' : '#FBF7FA'
        },
        onclick: function (m) {
          w.Store.kids.setActive(k.id);
          m.close();
          render();
        }
      }, k.avatar + '  ' + k.name + (active ? '（当前）' : '')));
    });
    U.modal({ title: '切换孩子', desc: '每个孩子的数据完全独立。', body: body });
  }

  /* ---------------- 初始化 ---------------- */
  function boot() {
    if (booted) return;
    booted = true;
    w.Store.boot();

    document.getElementById('kid-chip').addEventListener('click', switchKid);
    document.getElementById('btn-menu').addEventListener('click', function () {
      var sb = document.querySelector('.sidebar');
      sb.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      var sb = document.querySelector('.sidebar');
      if (!sb.classList.contains('open')) return;
      if (sb.contains(e.target) || (e.target.closest && e.target.closest('#btn-menu'))) return;
      sb.classList.remove('open');
    });

    w.Store.subscribe(function (what) {
      if (what === 'kid' || what === 'kids') {
        var sb = document.querySelector('.sidebar');
        if (sb) sb.classList.remove('open');
      }
      if (current && current.def && current.def.onStore) current.def.onStore(what);
    });

    w.addEventListener('hashchange', render);
    render();
  }

  App.boot = boot;
  w.App = App;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
