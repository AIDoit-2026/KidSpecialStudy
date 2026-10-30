/* 轻量图表：日历热力图 / 雷达图 / 折线（纯 SVG，无依赖） */
(function (w) {
  'use strict';

  function svg(wd, ht, viewBox) {
    return U.svg('svg', { viewBox: viewBox || ('0 0 ' + wd + ' ' + ht), preserveAspectRatio: 'xMidYMid meet' });
  }

  /* 雷达图：data = [{label, value(0~1)}] */
  function radar(data, opts) {
    opts = opts || {};
    var size = 300, cx = size / 2, cy = size / 2 + 4, R = 96;
    var s = svg(size, size + 18);
    var n = data.length;

    function pt(i, r) {
      var ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(ang) * r, cy + Math.sin(ang) * r];
    }

    [0.25, 0.5, 0.75, 1].forEach(function (k) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push(pt(i, R * k).join(','));
      s.appendChild(U.svg('polygon', { points: pts.join(' '), fill: 'none', stroke: '#EFE3EA', 'stroke-width': 1 }));
    });

    for (var i = 0; i < n; i++) {
      var p = pt(i, R);
      s.appendChild(U.svg('line', { x1: cx, y1: cy, x2: p[0], y2: p[1], stroke: '#EFE3EA' }));
    }

    var poly = [];
    for (var j = 0; j < n; j++) poly.push(pt(j, R * Math.max(0.04, Math.min(1, data[j].value))).join(','));
    s.appendChild(U.svg('polygon', {
      points: poly.join(' '), fill: 'rgba(255,107,157,.28)',
      stroke: '#FF6B9D', 'stroke-width': 2, 'stroke-linejoin': 'round'
    }));

    for (var k = 0; k < n; k++) {
      var p2 = pt(k, R * Math.max(0.04, Math.min(1, data[k].value)));
      s.appendChild(U.svg('circle', { cx: p2[0], cy: p2[1], r: 3.5, fill: '#FF6B9D' }));
      var labelPt = pt(k, R + 22);
      var anchor = Math.abs(labelPt[0] - cx) < 6 ? 'middle' : (labelPt[0] > cx ? 'start' : 'end');
      var t = U.svg('text', {
        x: labelPt[0], y: labelPt[1] + 4, 'text-anchor': anchor,
        'font-size': 12, fill: '#55556A', 'font-weight': 600
      });
      t.textContent = data[k].label;
      s.appendChild(t);
      var tv = U.svg('text', {
        x: labelPt[0], y: labelPt[1] + 17, 'text-anchor': anchor,
        'font-size': 11, fill: '#8B8B9E'
      });
      tv.textContent = Math.round(data[k].value * 100) + '%';
      s.appendChild(tv);
    }
    return s;
  }

  /* 折线图：labels[], values[](0~1 或 0~max) */
  function line(labels, values, opts) {
    opts = opts || {};
    var W = 640, H = 220, padL = 40, padR = 14, padT = 16, padB = 28;
    var s = svg(W, H);
    var max = opts.max || Math.max(1, Math.max.apply(null, values.concat([1])));
    var iw = W - padL - padR, ih = H - padT - padB;
    var n = Math.max(1, values.length);

    for (var g = 0; g <= 4; g++) {
      var y = padT + ih - (ih * g / 4);
      s.appendChild(U.svg('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: '#F4EAEF' }));
      var t = U.svg('text', { x: padL - 8, y: y + 4, 'text-anchor': 'end', 'font-size': 10, fill: '#9A9AAC' });
      t.textContent = Math.round(max * g / 4 * (opts.percent ? 100 : 1)) + (opts.percent ? '%' : '');
      s.appendChild(t);
    }

    var pts = values.map(function (v, i) {
      var x = padL + (n === 1 ? iw / 2 : iw * i / (n - 1));
      var y = padT + ih - ih * Math.min(1, v / max);
      return [x, y];
    });
    if (pts.length) {
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      s.appendChild(U.svg('path', { d: d, fill: 'none', stroke: '#4ECDC4', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }));
      s.appendChild(U.svg('path', {
        d: d + ' L' + pts[pts.length - 1][0] + ' ' + (padT + ih) + ' L' + pts[0][0] + ' ' + (padT + ih) + ' Z',
        fill: 'rgba(78,205,196,.14)', stroke: 'none'
      }));
      pts.forEach(function (p) {
        s.appendChild(U.svg('circle', { cx: p[0], cy: p[1], r: 2.6, fill: '#4ECDC4' }));
      });
    }
    // x 轴标签（最多 7 个）
    var step = Math.max(1, Math.ceil(labels.length / 7));
    labels.forEach(function (lb, i) {
      if (i % step) return;
      var x = padL + (n === 1 ? iw / 2 : iw * i / (n - 1));
      var t2 = U.svg('text', { x: x, y: H - 8, 'text-anchor': 'middle', 'font-size': 10, fill: '#9A9AAC' });
      t2.textContent = lb;
      s.appendChild(t2);
    });
    return s;
  }

  /* 日历热力图 */
  function calendar(year, month, infoFn) {
    var wrap = U.h('div', { class: 'cal' });
    ['日', '一', '二', '三', '四', '五', '六'].forEach(function (d) {
      wrap.appendChild(U.h('div', { class: 'cd-head', text: d }));
    });
    var first = new Date(year, month, 1);
    var startPad = first.getDay();
    for (var i = 0; i < startPad; i++) wrap.appendChild(U.h('div', { class: 'cd blank' }));

    var days = U.monthDays(year, month);
    var today = U.today();
    for (var d = 1; d <= days; d++) {
      var key = year + '-' + U.pad(month + 1) + '-' + U.pad(d);
      var info = infoFn(key);
      var cls = 'cd';
      if (info.status === 'full') cls += ' full';
      else if (info.status === 'part') cls += ' part';
      else if (info.status === 'miss') cls += ' miss';
      else if (info.status === 'makeup') cls += ' makeup';
      if (key === today) cls += ' today';
      var cell = U.h('div', { class: cls, title: info.title || '' });
      cell.appendChild(U.h('div', { class: 'cd-n', text: String(d) }));
      if (info.badge) cell.appendChild(U.h('div', { class: 'cd-d', text: info.badge }));
      wrap.appendChild(cell);
    }
    return wrap;
  }

  w.Charts = { radar: radar, line: line, calendar: calendar };
})(window);
