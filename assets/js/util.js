/* 工具层：DOM / 日期 / 弹层 / 音效 / 哈希 */
(function (w) {
  'use strict';

  var U = {};

  /* ---------------- DOM ---------------- */
  U.$ = function (sel, root) { return (root || document).querySelector(sel); };
  U.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /**
   * h('div', {class:'a', onclick:fn}, '文本', h('b',{},'x'))
   */
  U.h = function (tag, attrs) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class' || k === 'className') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.keys(v).forEach(function (s) {
        if (s.indexOf('--') === 0) node.style.setProperty(s, v[s]);
        else node.style[s] = v[s];
      });
      else if (k.indexOf('on') === 0 && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
      else if (v === true) node.setAttribute(k, '');
      else node.setAttribute(k, v);
    });
    for (var i = 2; i < arguments.length; i++) append(node, arguments[i]);
    return node;
  };

  function append(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(node, c); }); return; }
    if (child instanceof Node) { node.appendChild(child); return; }
    node.appendChild(document.createTextNode(String(child)));
  }
  U.append = append;
  U.clear = function (node) { while (node.firstChild) node.removeChild(node.firstChild); return node; };

  U.esc = function (s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  U.on = function (root, evt, sel, fn) {
    root.addEventListener(evt, function (e) {
      var t = e.target.closest ? e.target.closest(sel) : null;
      if (t && root.contains(t)) fn(e, t);
    });
  };

  /* ---------------- 日期 ---------------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  U.pad = pad;
  U.today = function () { return U.fmt(new Date()); };
  U.fmt = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  U.parse = function (s) {
    var p = String(s).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  };
  U.addDays = function (s, n) {
    var d = U.parse(s); d.setDate(d.getDate() + n); return U.fmt(d);
  };
  U.diffDays = function (a, b) {
    return Math.round((U.parse(b) - U.parse(a)) / 86400000);
  };
  U.weekday = function (s) { return U.parse(s).getDay(); }; // 0=周日
  U.WD = ['日', '一', '二', '三', '四', '五', '六'];
  U.weekdayCn = function (s) { return '周' + U.WD[U.weekday(s)]; };
  U.fmtCn = function (s) {
    var d = U.parse(s);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  };
  U.now = function () { return Date.now(); };
  U.uid = function (prefix) {
    return (prefix || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };
  U.fmtMin = function (ms) {
    var m = Math.round((ms || 0) / 60000);
    if (m < 1) return '不到 1 分钟';
    if (m < 60) return m + ' 分钟';
    return Math.floor(m / 60) + ' 小时 ' + (m % 60) + ' 分';
  };
  U.monthDays = function (year, month) { return new Date(year, month + 1, 0).getDate(); };

  /* ---------------- 数值 ---------------- */
  U.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  U.pct = function (v) { return Math.round((v || 0) * 100); };
  U.avg = function (arr) {
    if (!arr.length) return 0;
    var s = 0; arr.forEach(function (x) { s += x; });
    return s / arr.length;
  };
  U.sum = function (arr) { var s = 0; arr.forEach(function (x) { s += x; }); return s; };
  U.groupBy = function (arr, fn) {
    var m = {};
    arr.forEach(function (x) { var k = fn(x); (m[k] = m[k] || []).push(x); });
    return m;
  };
  U.randInt = function (a, b) { return a + Math.floor(Math.random() * (b - a + 1)); };
  U.shuffle = function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  };
  U.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  U.debounce = function (fn, ms) {
    var t; return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  };

  /* ---------------- 简易哈希（PIN 用，非加密安全）---------------- */
  U.hashPin = function (pin) {
    var s = 'wb2$' + String(pin);
    var h1 = 0x811c9dc5, h2 = 0x1000193;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      h1 = (h1 ^ c) * 16777619 >>> 0;
      h2 = ((h2 << 5) - h2 + c) >>> 0;
    }
    return h1.toString(16) + '-' + h2.toString(16);
  };

  /* ---------------- Toast ---------------- */
  U.toast = function (msg, type) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var t = U.h('div', { class: 'toast' + (type ? ' ' + type : ''), text: msg });
    root.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .25s, transform .25s';
      t.style.opacity = '0';
      t.style.transform = 'translateY(-6px)';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, 2000);
  };

  /* ---------------- Modal ---------------- */
  U.modal = function (opts) {
    var root = document.getElementById('modal-root');
    var mask = U.h('div', { class: 'modal-mask' });
    var box = U.h('div', { class: 'modal' });
    var bodyWrap = U.h('div', { class: 'm-body' });
    if (opts.title) box.appendChild(U.h('h3', { text: opts.title }));
    if (opts.desc) box.appendChild(U.h('div', { class: 'm-desc', html: opts.desc }));
    box.appendChild(bodyWrap);
    if (opts.body) append(bodyWrap, opts.body);

    var api = {
      el: box,
      body: bodyWrap,
      close: function () { if (mask.parentNode) mask.parentNode.removeChild(mask); document.removeEventListener('keydown', onKey); if (opts.onClose) opts.onClose(); },
      setBusy: function (b) {
        U.$$('button', box).forEach(function (x) { x.disabled = !!b; });
      }
    };
    function onKey(e) { if (e.key === 'Escape') api.close(); }

    if (opts.actions && opts.actions.length) {
      var foot = U.h('div', { class: 'modal-foot' });
      opts.actions.forEach(function (a) {
        foot.appendChild(U.h('button', {
          class: 'btn ' + (a.class || 'btn-ghost'),
          text: a.label,
          onclick: function () { if (a.onClick) a.onClick(api); else api.close(); }
        }));
      });
      box.appendChild(foot);
    }
    mask.appendChild(box);
    mask.addEventListener('mousedown', function (e) { if (e.target === mask && opts.dismissable !== false) api.close(); });
    root.appendChild(mask);
    document.addEventListener('keydown', onKey);
    var first = box.querySelector('input,button');
    if (first) setTimeout(function () { first.focus(); }, 60);
    return api;
  };

  U.confirm = function (opts) {
    return new Promise(function (resolve) {
      U.modal({
        title: opts.title || '确认',
        desc: opts.desc || '',
        dismissable: false,
        actions: [
          { label: opts.cancelText || '取消', class: 'btn-ghost', onClick: function (m) { m.close(); resolve(false); } },
          { label: opts.okText || '确定', class: opts.danger ? 'btn-danger' : 'btn-primary', onClick: function (m) { m.close(); resolve(true); } }
        ]
      });
    });
  };

  U.promptText = function (opts) {
    return new Promise(function (resolve) {
      var input = U.h('input', { class: 'input', type: opts.type || 'text', value: opts.value || '', placeholder: opts.placeholder || '', maxlength: opts.maxlength || 40 });
      var m = U.modal({
        title: opts.title,
        desc: opts.desc,
        dismissable: false,
        body: input,
        actions: [
          { label: '取消', class: 'btn-ghost', onClick: function (mm) { mm.close(); resolve(null); } },
          { label: '确定', class: 'btn-primary', onClick: function (mm) { mm.close(); resolve(input.value.trim()); } }
        ]
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { var b = m.el.querySelector('.btn-primary'); if (b) b.click(); }
      });
    });
  };

  /* 4 位 PIN 输入框 */
  U.askPin = function (title) {
    return new Promise(function (resolve) {
      var wrap = U.h('div', { class: 'pin-inputs' });
      var inputs = [];
      for (var i = 0; i < 4; i++) {
        (function (idx) {
          var inp = U.h('input', { type: 'password', inputmode: 'numeric', maxlength: 1 });
          inp.addEventListener('input', function () {
            if (inp.value && idx < 3) inputs[idx + 1].focus();
            if (inputs.every(function (x) { return x.value; })) {
              setTimeout(function () { ok && ok(); }, 80);
            }
          });
          inp.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !inp.value && idx > 0) inputs[idx - 1].focus();
          });
          inputs.push(inp); wrap.appendChild(inp);
        })(i);
      }
      var ok = null;
      U.modal({
        title: title || '请输入家长密码',
        desc: '4 位数字，用于保护家长中心。',
        dismissable: false,
        body: wrap,
        actions: [
          { label: '取消', class: 'btn-ghost', onClick: function (m) { m.close(); resolve(null); } },
          {
            label: '确定', class: 'btn-primary', onClick: function (m) {
              var v = inputs.map(function (x) { return x.value; }).join('');
              m.close(); resolve(v);
            }
          }
        ]
      });
      ok = function () { var b = document.querySelector('.modal .btn-primary'); if (b) b.click(); };
      setTimeout(function () { inputs[0].focus(); }, 80);
    });
  };

  /* ---------------- 音效（WebAudio 合成，零资源）---------------- */
  var actx = null;
  U.sfx = function (kind) {
    try {
      var Store = w.Store;
      if (Store && Store.settings && Store.settings().sfx === false) return;
      if (!actx) actx = new (w.AudioContext || w.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      var seq = kind === 'wrong' ? [[330, 0, .12], [262, .12, .16]]
        : kind === 'done' ? [[523, 0, .1], [659, .1, .1], [784, .2, .1], [1047, .3, .18]]
          : [[784, 0, .08], [1047, .08, .12]];
      seq.forEach(function (s) {
        var o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === 'wrong' ? 'triangle' : 'sine';
        o.frequency.value = s[0];
        g.gain.setValueAtTime(0.0001, actx.currentTime + s[1]);
        g.gain.exponentialRampToValueAtTime(0.16, actx.currentTime + s[1] + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + s[1] + s[2]);
        o.connect(g); g.connect(actx.destination);
        o.start(actx.currentTime + s[1]); o.stop(actx.currentTime + s[1] + s[2] + .02);
      });
    } catch (e) { /* 忽略音频错误 */ }
  };

  /* 星星飞入动画 */
  U.flyStar = function (fromEl) {
    var root = document.getElementById('fx-root');
    if (!root || !fromEl) return;
    var r = fromEl.getBoundingClientRect();
    var target = document.getElementById('star-chip');
    var tr = target ? target.getBoundingClientRect() : { left: w.innerWidth - 90, top: 20, width: 0, height: 0 };
    var el = document.createElement('div');
    el.className = 'fly-star';
    el.textContent = '⭐';
    el.style.left = (r.left + r.width / 2) + 'px';
    el.style.top = (r.top + r.height / 2) + 'px';
    el.style.setProperty('--dx', (tr.left - r.left) + 'px');
    el.style.setProperty('--dy', (tr.top - r.top) + 'px');
    root.appendChild(el);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1050);
  };

  /* ---------------- 事件总线 ---------------- */
  var listeners = {};
  U.on2 = function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); };
  U.emit = function (name, payload) {
    (listeners[name] || []).forEach(function (fn) { try { fn(payload); } catch (e) { console.error(e); } });
  };

  /* 简易 SVG 命名空间元素 */
  U.svg = function (tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') el.textContent = attrs[k];
      else el.setAttribute(k, attrs[k]);
    });
    for (var i = 2; i < arguments.length; i++) {
      if (arguments[i] instanceof Node) el.appendChild(arguments[i]);
    }
    return el;
  };

  w.U = U;
})(window);
