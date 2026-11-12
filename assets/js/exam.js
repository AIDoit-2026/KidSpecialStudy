/* 真题题库：题录索引 / 题目渲染 / 同型变式生成 / 打印用答题栏
 *
 * 设计要点
 *  - 题库数据只描述「题长什么样」和「标准答案」，孩子的铅笔答案单独存在 attempt 里，
 *    渲染试卷时默认不显示，家长可以一键对照。
 *  - 每道题都是一份参数，变式生成器按同一套参数重新摇号，结构和分值不变，
 *    所以仿造出来的卷子和原卷「长得一样、数不一样」。
 *  - 所有渲染都是纯 DOM，能直接进打印页（A4），黑白打印也能辨认。
 */
(function (w) {
  'use strict';

  /* ---------------- 伪随机（同一 seed 出同一套题，方便重打） ---------------- */
  function hashSeed(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = typeof seed === 'number' ? seed : hashSeed(seed);
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function ri(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function pick(r, arr) { return arr[Math.min(arr.length - 1, Math.floor(r() * arr.length))]; }
  function shuffle(r, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* 从 [a,b] 里取 n 个互不相同的整数，升序 */
  function sampleInts(r, a, b, n) {
    var pool = [];
    for (var i = a; i <= b; i++) pool.push(i);
    return shuffle(r, pool).slice(0, n).sort(function (x, y) { return x - y; });
  }

  /* ---------------- 题库索引 ---------------- */
  function papers() { return (w.EXAM_BANK || []).slice(); }

  function get(id) {
    var list = papers();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  /* 按「年级 + 单元区间」归档，家长要的是这个顺序 */
  function groups() {
    var map = {}, out = [];
    papers().forEach(function (p) {
      var key = p.grade + '|' + p.units.join(',');
      if (!map[key]) {
        map[key] = {
          key: key, grade: p.grade,
          units: p.units, label: gradeLabel(p.grade) + ' · ' + unitLabel(p.units),
          count: 0, papers: []
        };
        out.push(map[key]);
      }
      map[key].count++;
      map[key].papers.push(p);
    });
    out.sort(function (a, b) {
      return a.grade - b.grade || a.units[0] - b.units[0];
    });
    return out;
  }

  function gradeLabel(g) { return '一' + (g === 1 ? '' : g) + '年级'; }
  function unitLabel(units) {
    if (!units || !units.length) return '全册';
    if (units.length === 1) return '第 ' + units[0] + ' 单元';
    return '第 ' + units[0] + '–' + units[units.length - 1] + ' 单元';
  }

  function items(paper) {
    var out = [];
    (paper.sections || []).forEach(function (s) {
      (s.items || []).forEach(function (it) { out.push(it); });
    });
    return out;
  }
  function countOf(paper) { return items(paper).length; }
  function scoreOf(paper) {
    return (paper.sections || []).reduce(function (n, s) {
      return n + (s.score || (s.items || []).reduce(function (m, it) { return m + (it.score || 0); }, 0));
    }, 0);
  }
  function blankCount(paper) {
    return items(paper).reduce(function (n, it) { return n + (it.ans || []).length; }, 0);
  }

  /* ---------------- 小工具 ---------------- */
  function el(tag, cls, txt) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (txt !== undefined && txt !== null && txt !== '') node.textContent = txt;
    return node;
  }

  var CURSOR = { i: 0, ans: [], show: false };

  /* 答题空格：showAns 时填入答案并标色 */
  function blank(size) {
    var b = el('span', 'ex-box' + (size === 'lg' ? ' lg' : ''));
    if (CURSOR.show) {
      var v = CURSOR.ans[CURSOR.i];
      if (v !== undefined && v !== null && v !== '') {
        b.textContent = v;
        b.classList.add('is-ans');
      }
    }
    CURSOR.i++;
    return b;
  }
  function opCircle() {
    var b = el('span', 'ex-op');
    if (CURSOR.show) {
      var v = CURSOR.ans[CURSOR.i];
      if (v) { b.textContent = v; b.classList.add('is-ans'); }
    }
    CURSOR.i++;
    return b;
  }

  /* 题干里的 {{}} 占位 */
  function stemNode(text) {
    var wrap = el('span', 'ex-stem-text');
    String(text || '').split('{{}}').forEach(function (part, i) {
      if (i) wrap.appendChild(blank());
      if (part) wrap.appendChild(document.createTextNode(part));
    });
    return wrap;
  }

  /* 图案组：严格按 per 个一行排（用 grid 列数，不靠宽度硬算，避免 emoji 略宽就掉行） */
  function figGroup(g) {
    var box = el('div', 'ex-fig');
    var per = Math.max(1, g.per || g.n);
    box.style.setProperty('--per', String(per));
    for (var i = 0; i < g.n; i++) box.appendChild(el('span', 'ex-e', g.e));
    return box;
  }

  /* 算式：cells = [{v:9}|{op:'-'}|{}+{text:'（支）'} */
  function eqNode(eq) {
    var row = el('div', 'ex-eq');
    (eq.cells || []).forEach(function (c) {
      if (c.text) { row.appendChild(el('span', 'ex-unit', c.text)); return; }
      if (c.op) { row.appendChild(opCircle()); return; }
      if (c.v !== undefined) { row.appendChild(el('span', 'ex-given', String(c.v))); return; }
      row.appendChild(blank());
    });
    if (eq.tail) row.appendChild(el('span', 'ex-unit', eq.tail));
    return row;
  }

  function subLine(node) {
    var d = el('div', 'ex-sub');
    d.appendChild(node);
    return d;
  }

  /* ---------------- 各题型渲染 ---------------- */
  var R = {};

  /* 数一数，写一写 */
  R['count-write'] = function (item) {
    var row = el('div', 'ex-groups');
    (item.groups || []).forEach(function (g) {
      var cell = el('div', 'ex-gcell');
      var fb = el('div', 'ex-figbox');
      fb.appendChild(figGroup(g));
      cell.appendChild(fb);
      var ans = el('div', 'ex-under-num');
      ans.appendChild(blank());
      cell.appendChild(ans);
      row.appendChild(cell);
    });
    return row;
  };

  /* 按顺序写数 */
  R['fill-seq'] = function (item) {
    var row = el('div', 'ex-seq');
    for (var n = item.from; n <= item.to; n++) {
      var miss = (item.miss || []).indexOf(n) >= 0;
      if (miss) row.appendChild(blank());
      else row.appendChild(el('span', 'ex-seq-n', String(n)));
    }
    return row;
  };

  /* 数的分与合 */
  R['decompose'] = function (item) {
    var row = el('div', 'ex-decomps');
    (item.pairs || []).forEach(function (p) {
      var total = p[0], a = p[1], b = p[2], hide = p[3];
      var d = el('div', 'ex-decomp');
      d.innerHTML = '<svg viewBox="0 0 96 76" aria-hidden="true">' +
        '<path d="M48 26 L20 50 M48 26 L76 50" fill="none" stroke="#111" stroke-width="1.6"/></svg>';
      var top = el('span', 'ex-dtop', String(total));
      d.appendChild(top);
      var l = el('span', 'ex-dl');
      if (hide === 'a') l.appendChild(blank()); else l.textContent = String(a);
      var rr = el('span', 'ex-dr');
      if (hide === 'b') rr.appendChild(blank()); else rr.textContent = String(b);
      d.appendChild(l); d.appendChild(rr);
      row.appendChild(d);
    });
    return row;
  };

  /* 数盘子 + 三小问 */
  R['plates'] = function (item) {
    var wrap = el('div', 'ex-plate-wrap');
    wrap.appendChild(plateRow(item));
    (item.subs || []).forEach(function (sub) {
      wrap.appendChild(subLine(plateSubText(item, sub)));
    });
    return wrap;
  };

  function plateRow(item) {
    var row = el('div', 'ex-plates');
    (item.plates || []).forEach(function (n, i) {
      var p = el('div', 'ex-plate');
      p.appendChild(el('span', 'ex-plate-no', String(i + 1)));
      var inner = el('div', 'ex-plate-in');
      for (var k = 0; k < n; k++) inner.appendChild(el('span', 'ex-e', item.icon || '🥟'));
      p.appendChild(inner);
      row.appendChild(p);
    });
    return row;
  }

  /* 三小问：把结构化描述变成文字 + 空格
     sub 里带全部渲染信息（题号 idx、第几盘 atIdx / 盘号 i、j），答案由生成器算好放在 item.ans 里，
     这里只管摆空。 */
  function plateSubText(item, sub) {
    var wrap = el('span', 'ex-stem-text');

    if (sub.q === 'countAt') {
      wrap.appendChild(document.createTextNode('(' + sub.idx + ') 从' + (sub.from === 'right' ? '右' : '左') +
        '边数，第 ' + sub.atIdx + ' 盘有('));
      wrap.appendChild(blank());
      wrap.appendChild(document.createTextNode(')个，第('));
      wrap.appendChild(blank());
      wrap.appendChild(document.createTextNode(')盘有' + sub.n + '个。'));
      return wrap;
    }
    if (sub.q === 'pairSum') {
      wrap.appendChild(document.createTextNode('(' + sub.idx + ') 从' + (sub.from === 'right' ? '右' : '左') + '边数，第('));
      wrap.appendChild(blank());
      wrap.appendChild(document.createTextNode(')盘和第('));
      wrap.appendChild(blank());
      wrap.appendChild(document.createTextNode(')盘合起来有' + sub.sum + '个。'));
      return wrap;
    }
    wrap.appendChild(document.createTextNode('(' + sub.idx + ') ' + (sub.who || '豆豆') + '吃了其中的 ' +
      (sub.eat || 1) + ' 盘，还剩('));
    wrap.appendChild(blank());
    wrap.appendChild(document.createTextNode(')盘。'));
    return wrap;
  }

  /* 比多少：qs = [{left:'a'|'b', rel:'多'|'少'}] */
  R['compare-count'] = function (item) {
    var wrap = el('div', 'ex-cmp');
    var left = el('div', 'ex-cmp-figs');
    left.appendChild(figGroup(item.a));
    left.appendChild(figGroup(item.b));
    wrap.appendChild(left);
    var right = el('div', 'ex-cmp-qs');
    (item.qs || []).forEach(function (q) {
      var A = q.left === 'b' ? item.b : item.a;
      var B = q.left === 'b' ? item.a : item.b;
      var line = el('div', 'ex-cmp-q');
      line.appendChild(el('span', 'ex-e', A.e));
      line.appendChild(document.createTextNode(' 比 '));
      line.appendChild(el('span', 'ex-e', B.e));
      line.appendChild(document.createTextNode(' ' + q.rel + '('));
      line.appendChild(blank());
      line.appendChild(document.createTextNode(')'));
      right.appendChild(line);
    });
    wrap.appendChild(right);
    return wrap;
  };

  /* 选一选：答案显示时在正确选项的方框里打 √ */
  R['choice'] = function (item) {
    var wrap = el('div', 'ex-opts');
    var right = (item.ans || []).length ? String(item.ans[0]) : '';
    (item.opts || []).forEach(function (o, i) {
      var line = el('div', 'ex-opt');
      var mk = el('span', 'ex-opt-box');
      if (CURSOR.show && String(i) === right) {
        mk.textContent = '√';
        mk.classList.add('is-ans');
      }
      line.appendChild(mk);
      if (o.e) {
        var f = el('div', 'ex-fig');
        f.style.setProperty('--per', String(Math.min(o.n, 5)));
        for (var k = 0; k < o.n; k++) f.appendChild(el('span', 'ex-e', o.e));
        line.appendChild(f);
      } else if (o.t) {
        line.appendChild(el('span', 'ex-opt-text', o.t));
      } else if (o.n !== undefined) {
        line.appendChild(el('span', 'ex-opt-text', String(o.n)));
      }
      wrap.appendChild(line);
    });
    return wrap;
  };

  /* 口算 */
  R['compute'] = function (item) {
    var grid = el('div', 'ex-compute');
    (item.list || []).forEach(function (expr) {
      var cell = el('div', 'ex-compute-i');
      cell.appendChild(el('span', 'ex-expr', expr + ' ='));
      cell.appendChild(blank());
      grid.appendChild(cell);
    });
    return grid;
  };

  /* 比大小 */
  R['compare-sign'] = function (item) {
    var grid = el('div', 'ex-signs');
    (item.list || []).forEach(function (pair) {
      var cell = el('div', 'ex-sign-i');
      cell.appendChild(el('span', 'ex-expr', pair[0]));
      cell.appendChild(opCircle());
      cell.appendChild(el('span', 'ex-expr', pair[1]));
      grid.appendChild(cell);
    });
    return grid;
  };

  /* 一图四式 / 看图列式：两堆图案 + 若干算式 */
  R['picture-four'] = function (item) {
    var wrap = el('div', 'ex-pfour');
    var figs = el('div', 'ex-pfour-figs');
    figs.appendChild(figGroup(item.a));
    figs.appendChild(figGroup(item.b));
    wrap.appendChild(figs);
    var eqs = el('div', 'ex-pfour-eqs');
    (item.eqs || []).forEach(function (cells) {
      var e = el('div', 'ex-eq');
      cells.forEach(function (c) {
        if (c === '=') { e.appendChild(el('span', 'ex-op-fix', '=')); return; }
        if (c === '+' || c === '-') { e.appendChild(el('span', 'ex-op-fix', c)); return; }
        e.appendChild(blank());
      });
      e.classList.add('ex-eq-frame');
      eqs.appendChild(e);
    });
    wrap.appendChild(eqs);
    return wrap;
  };

  /* 看图列式：场景 + 大括号 + 算式 */
  R['picture-ask'] = function (item) {
    var wrap = el('div', 'ex-pask');
    var scene = el('div', 'ex-pask-scene');
    if (item.scene === 'box') {
      scene.appendChild(figGroup({ e: '✏️', n: item.out, per: Math.min(6, item.out) }));
      var boxEl = el('div', 'ex-pask-box');
      boxEl.appendChild(el('span', 'ex-pask-q', '? ' + (item.unitShort || '支')));
      boxEl.appendChild(el('div', 'ex-pencilbox'));
      scene.appendChild(boxEl);
    } else if (item.scene === 'tree') {
      var t = el('div', 'ex-pask-tree');
      t.appendChild(el('span', 'ex-e xl', '🌳'));
      var onTree = el('div', 'ex-pask-on');
      for (var i = 0; i < item.up; i++) onTree.appendChild(el('span', 'ex-e', item.icon || '🐒'));
      t.appendChild(onTree);
      scene.appendChild(t);
      scene.appendChild(figGroup({ e: item.icon || '🐒', n: item.down, per: 6 }));
    } else {
      scene.appendChild(figGroup({ e: item.icon || '🍄', n: item.left, per: 5 }));
      if (item.cross) {
        var c = el('div', 'ex-fig');
        for (var j = 0; j < item.cross; j++) {
          var s = el('span', 'ex-e crossed', item.icon || '🍄');
          c.appendChild(s);
        }
        scene.appendChild(c);
      }
    }
    wrap.appendChild(scene);
    if (item.brace) {
      var br = el('div', 'ex-under');
      br.appendChild(el('span', '', item.brace));
      wrap.appendChild(br);
    }
    wrap.appendChild(eqNode(item.eq));
    return wrap;
  };

  /* 解决问题（文字 + 可选图 + 算式） */
  R['word'] = function (item) {
    var wrap = el('div', 'ex-word');
    if (item.pic) {
      var p = el('div', 'ex-word-pic');
      if (item.pic.e) p.appendChild(figGroup({ e: item.pic.e, n: item.pic.n, per: item.pic.per || item.pic.n }));
      if (item.pic.text) p.appendChild(el('span', 'ex-word-tag', item.pic.text));
      wrap.appendChild(p);
    }
    wrap.appendChild(eqNode(item.eq));
    return wrap;
  };

  /* 选择问题 + 解答 */
  R['pick-problem'] = function (item) {
    var wrap = el('div', 'ex-pick');
    if (item.pic) {
      var p = el('div', 'ex-word-pic');
      p.appendChild(figGroup({ e: item.pic.e, n: item.pic.n, per: item.pic.per || 5 }));
      if (item.second) {
        p.appendChild(figGroup({ e: item.second.e, n: item.second.n, per: item.second.per || 5 }));
      }
      wrap.appendChild(p);
    }
    (item.opts || []).forEach(function (o, i) {
      var line = el('div', 'ex-opt');
      var mk = el('span', 'ex-opt-box');
      if (CURSOR.show && String(i) === String((item.ans || [])[0])) {
        mk.textContent = '√';
        mk.classList.add('is-ans');
      }
      line.appendChild(mk);
      line.appendChild(el('span', 'ex-opt-text', o + '？'));
      wrap.appendChild(line);
    });
    var sol = el('div', 'ex-solve');
    sol.appendChild(el('span', 'ex-solve-label', '解答：'));
    sol.appendChild(el('span', 'ex-solve-line'));
    wrap.appendChild(sol);
    return wrap;
  };

  /* 涂一涂比一比（操作题，只能印出来手工做；涂完在后面写 ▢○▢ 的式子） */
  R['color-compare'] = function (item) {
    var wrap = el('div', 'ex-color');
    (item.rows || []).forEach(function (row) {
      var line = el('div', 'ex-color-row');
      var label = el('div', 'ex-color-label');
      label.appendChild(el('span', 'ex-e', row.a));
      label.appendChild(el('span', 'ex-color-word', '比'));
      label.appendChild(el('span', 'ex-e gray', row.b));
      label.appendChild(el('span', 'ex-color-word', row.rel));
      line.appendChild(label);
      var base = el('div', 'ex-fig');
      base.style.setProperty('--per', String(row.base));
      for (var i = 0; i < row.base; i++) base.appendChild(el('span', 'ex-e filled', row.b));
      line.appendChild(base);
      var target = el('div', 'ex-fig');
      target.style.setProperty('--per', String(row.n));
      for (var j = 0; j < row.n; j++) target.appendChild(el('span', 'ex-e', row.a));
      line.appendChild(target);
      // 每组后面跟一个比较式子：个数 ○ 个数
      if (row.eq !== false) {
        var eq = el('div', 'ex-color-eq');
        eq.appendChild(blank());
        eq.appendChild(opCircle());
        eq.appendChild(blank());
        line.appendChild(eq);
      }
      wrap.appendChild(line);
    });
    return wrap;
  };

  /* 画一画再写得数 */
  R['draw-solve'] = function (item) {
    var wrap = el('div', 'ex-draw');
    (item.list || []).forEach(function (x) {
      var block = el('div', 'ex-draw-b');
      var head = el('div', 'ex-draw-eq');
      head.appendChild(el('span', 'ex-expr', x.expr + ' ='));
      head.appendChild(blank());
      block.appendChild(head);
      block.appendChild(el('div', 'ex-draw-canvas'));
      wrap.appendChild(block);
    });
    return wrap;
  };

  /* ---------------- 渲染入口 ---------------- */
  function renderItem(item, opt) {
    opt = opt || {};
    var prev = { i: CURSOR.i, ans: CURSOR.ans, show: CURSOR.show };
    CURSOR.i = 0;
    CURSOR.ans = item.ans || [];
    CURSOR.show = !!opt.showAns;

    var wrap = el('div', 'ex-item');

    var head = el('div', 'ex-head');
    if (item.no) head.appendChild(el('span', 'ex-no', item.no));
    if (item.stem) head.appendChild(stemNode(item.stem));
    if (item.score) head.appendChild(el('span', 'ex-score', '(' + item.score + '分)'));
    wrap.appendChild(head);

    var body = R[item.k] ? R[item.k](item) : null;
    if (body) wrap.appendChild(body);
    if (item.hint && opt.showHint) wrap.appendChild(el('div', 'ex-hint', '💡 ' + item.hint));

    CURSOR.i = prev.i; CURSOR.ans = prev.ans; CURSOR.show = prev.show;
    return wrap;
  }

  /* ---------------- 整卷渲染 ---------------- */
  function renderPaper(paper, opt) {
    opt = opt || {};
    var sheet = el('div', 'print-sheet ex-sheet');

    var title = paper.title;
    var sub = (paper.subject === 'math' ? '数学' : '语文') + ' · ' + gradeLabel(paper.grade) + ' · ' + unitLabel(paper.units);
    sheet.appendChild(el('div', 'pr-head ex-head-top'));
    var top = sheet.lastChild;
    top.appendChild(el('div', 'pr-title', title));
    var meta = el('div', 'pr-meta');
    meta.appendChild(el('span', '', '班级：＿＿＿＿'));
    meta.appendChild(el('span', '', '姓名：＿＿＿＿'));
    meta.appendChild(el('span', '', '学号：＿＿'));
    if (opt.date) meta.appendChild(el('span', '', '日期：' + opt.date));
    meta.appendChild(el('span', '', '满分 ' + scoreOf(paper) + ' 分'));
    top.appendChild(meta);
    top.appendChild(el('div', 'ex-subtitle', sub + '　·　' + (opt.variant ? '仿造卷（第 ' + opt.seed + ' 号）' : '原卷题录')));

    (paper.sections || []).forEach(function (sec) {
      var h = el('div', 'pr-section');
      h.appendChild(el('span', '', sec.no + '、' + sec.title));
      if (sec.sub) h.appendChild(el('span', 'ex-sec-sub', sec.sub));
      sheet.appendChild(h);
      (sec.items || []).forEach(function (it) {
        sheet.appendChild(renderItem(it, opt));
      });
    });

    var foot = el('div', 'pr-foot');
    foot.appendChild(el('span', '', opt.variant ? '这份是题库仿造的，和原卷同结构、不同数。' : '题目来自家长上传的真实试卷。'));
    foot.appendChild(el('span', '', '家长签字：＿＿＿＿＿'));
    sheet.appendChild(foot);

    if (opt.showAns) sheet.appendChild(answerSheet(paper));

    return sheet;
  }

  function answerSheet(paper) {
    var box = el('div', 'ex-ans-page');
    box.appendChild(el('div', 'ex-ans-title', '参考答案'));
    (paper.sections || []).forEach(function (sec) {
      var line = el('div', 'ex-ans-line');
      line.appendChild(el('span', 'ex-ans-sec', sec.no + '、'));
      var parts = [];
      (sec.items || []).forEach(function (it) {
        var txt = it.ansText;
        if (!txt) {
          if (!(it.ans || []).length) txt = '（开放题）';
          else txt = it.ans.map(function (v) { return String(v); }).join('、');
        }
        parts.push((it.no || '') + ' ' + txt);
      });
      line.appendChild(el('span', '', parts.join('　')));
      box.appendChild(line);
    });
    return box;
  }

  /* ---------------- 答案对照（原卷铅笔答案 vs 标准答案） ---------------- */
  function compareRows(paper) {
    var rows = [];
    (paper.sections || []).forEach(function (sec) {
      (sec.items || []).forEach(function (it) {
        if (!it.attempt) return;
        var right = 0, known = 0;
        it.ans.forEach(function (a, i) {
          var at = it.attempt[i];
          // 原卷这一空在照片上看不到（裁切），用 null 占位，不参与对错统计
          if (at === undefined || at === null) return;
          known++;
          if (String(a) === String(at)) right++;
        });
        if (!known) return;
        rows.push({
          no: sec.no + (it.no || ''),
          stem: String(it.stem || '').slice(0, 18),
          ans: it.ans.join('、'),
          attempt: it.attempt.map(function (v) {
            return (v === null || v === undefined) ? '—' : v;
          }).join('、'),
          right: right, total: known
        });
      });
    });
    return rows;
  }

  /* ---------------- 变式生成 ---------------- */
  var GEN = {};

  /* 数一数写一写：换动物、换数量 */
  GEN['count-write'] = function (item, r) {
    var pool = ['🦆', '🐒', '🐱', '🐶', '🐰', '🐟', '🐤', '🦋'];
    var es = shuffle(r, pool).slice(0, item.groups.length);
    var ns = sampleInts(r, 3, 9, item.groups.length);
    var groups = item.groups.map(function (g, i) {
      var per = g.per || g.n;
      return { e: es[i], n: ns[i], per: per };
    });
    return { groups: groups, ans: ns.slice() };
  };

  /* 按顺序写数：换区间与空位 */
  GEN['fill-seq'] = function (item, r) {
    var to = pick(r, [9, 10]);
    var from = 0;
    var cands = [];
    for (var n = from + 1; n <= to - 1; n++) cands.push(n);
    var want = Math.max(1, (item.miss || []).length || 6);
    var miss = shuffle(r, cands).slice(0, Math.min(want, cands.length)).sort(function (a, b) { return a - b; });
    return { from: from, to: to, miss: miss, ans: miss.slice() };
  };

  /* 数的分与合 */
  GEN['decompose'] = function (item, r) {
    var totals = shuffle(r, [5, 6, 7, 8, 9, 10]).slice(0, item.pairs.length);
    var pairs = totals.map(function (t) {
      var a = ri(r, 1, t - 1);
      var hide = r() < 0.5 ? 'a' : 'b';
      return [t, a, t - a, hide];
    });
    var ans = pairs.map(function (p) { return p[3] === 'a' ? p[1] : p[2]; });
    return { pairs: pairs, ans: ans };
  };

  /* 数盘子：换每盘个数，三小问的结构不变、数字重算 */
  GEN['plates'] = function (item, r) {
    var n = (item.plates || []).length || 5;
    var plates = shuffle(r, sampleInts(r, 2, 9, n));

    /* (1) 从左边数第 atIdx 盘有几个；另一个有 n 个的盘是第几盘 */
    var atIdx = ri(r, 2, n - 1);
    var cnt = plates[atIdx - 1];
    var others = plates.filter(function (v) { return v !== cnt; });
    var nVal = pick(r, others);
    var nIdx = plates.indexOf(nVal) + 1;

    /* (2) 从右边数的一对，和落在 7~12，太小的组合跳过 */
    var pair = null;
    for (var i = 0; i < n && !pair; i++) {
      for (var j = i + 1; j < n; j++) {
        var s = plates[n - 1 - i] + plates[n - 1 - j];
        if (s >= 7 && s <= 13) { pair = { i: i + 1, j: j + 1, sum: s }; break; }
      }
    }
    if (!pair) {
      pair = { i: 1, j: 2, sum: plates[n - 1] + plates[n - 2] };
    }

    return {
      plates: plates,
      subs: [
        { q: 'countAt', idx: 1, from: 'left', atIdx: atIdx, n: nVal },
        { q: 'pairSum', idx: 2, from: 'right', i: pair.i, j: pair.j, sum: pair.sum },
        { q: 'remain', idx: 3, eat: 1, who: pick(r, ['豆豆', '明明', '乐乐']) }
      ],
      ans: [String(cnt), String(nIdx), String(pair.i), String(pair.j), String(n - 1)]
    };
  };

  /* 比多少 */
  GEN['compare-count'] = function (item, r) {
    var a = ri(r, 6, 10);
    var b = ri(r, 2, a - 1);
    return {
      a: { e: item.a.e, n: a },
      b: { e: item.b.e, n: b },
      ans: [String(a - b), String(a - b)]
    };
  };

  /* 选一选：每题一个生成器，按 id 分派 */
  GEN['choice'] = function (item, r) {
    var g = item.gen || 'num';
    if (g === 'zongzi') {
      var right = ri(r, 4, 8);
      var ns = shuffle(r, [right - 2, right - 1, right + 1, right + 2]).slice(0, 2);
      ns.push(right);
      ns = shuffle(r, ns);
      var idx = ns.indexOf(right);
      return {
        stem: '有 ' + right + ' 个小朋友，每人吃一个粽(zòng)子，哪一堆正合适？',
        opts: ns.map(function (n) { return { e: '🍙', n: n }; }),
        ans: [idx]
      };
    }
    if (g === 'count') {
      var to = ri(r, 6, 9);
      var rightN = to + 1;
      var opts = [to - 1, to + 1, to + 2];
      opts = shuffle(r, opts);
      return {
        stem: '从 0 数到 ' + to + '，一共数了多少个数？',
        opts: opts.map(function (n) { return { n: n }; }),
        ans: [opts.indexOf(rightN)]
      };
    }
    if (g === 'equal') {
      var x = ri(r, 6, 9), y = ri(r, 2, x - 2);
      var r0 = x - y;
      var oa = r0 > 1 ? ri(r, 1, r0 - 1) : 0;
      var optOk = oa + ' + ' + (r0 - oa);
      var wrongA = (r0 + 1) + ' + ' + ri(r, 1, 2);
      var wrongB = x + ' - ' + (y + 1);
      var opts2 = shuffle(r, [optOk, wrongA, wrongB]);
      return {
        stem: '下面与 ' + x + ' - ' + y + ' 得数相等的算式是哪一个？',
        opts: opts2.map(function (o) { return { t: o }; }),
        ans: [opts2.indexOf(optOk)]
      };
    }
    if (g === 'odd') {
      var n = ri(r, 7, 10);
      var odd = n % 2 === 1;
      var opts3 = ['会', '不会', '不确定'];
      return {
        stem: '有 ' + n + ' 个小朋友分两组玩游戏，每组的人数会同样多吗？',
        opts: opts3.map(function (t) { return { t: t }; }),
        ans: [odd ? 1 : 0]
      };
    }
    /* picture：三幅图里只有「吃掉几个」那幅是减法，位置随机 */
    var a2 = ri(r, 6, 10), b2 = ri(r, 2, a2 - 2);
    var scenes = [
      { t: '🍡 一串 ' + a2 + ' 个，吃掉 ' + b2 + ' 个', ok: true },
      { t: '🌳 树上有 ' + a2 + ' 个果子', ok: false },
      { t: '🧺 篮子里有 ' + a2 + ' 个鸡蛋', ok: false }
    ];
    var mixed = shuffle(r, scenes);
    return {
      stem: '下面哪幅图可以用算式 ' + a2 + ' - ' + b2 + ' = ' + (a2 - b2) + ' 表示？',
      opts: mixed.map(function (o) { return { t: o.t }; }),
      ans: [String(mixed.map(function (o) { return o.ok; }).indexOf(true))]
    };
  };

  /* 口算 */
  GEN['compute'] = function (item, r) {
    var list = [];
    var ans = [];
    function add(expr, v) { list.push(expr); ans.push(String(v)); }

    var kinds = ['a-b', 'a+0', 'a+b', 'a-b-c', 'a-b', 'a+b', 'a-b', 'a+b-c', 'a+b', 'a-b', 'a+b-c', 'a-b+c'];
    kinds.forEach(function (k) {
      var x, y, z, v;
      if (k === 'a-b') { x = ri(r, 3, 10); y = ri(r, 1, x - 1); v = x - y; add(x + '-' + y, v); }
      else if (k === 'a+0') { x = 0; y = ri(r, 1, 9); v = y; add(y + '+0', v); }
      else if (k === 'a+b') { x = ri(r, 1, 6); y = ri(r, 1, 9 - x); v = x + y; add(x + '+' + y, v); }
      else if (k === 'a-b-c') { x = ri(r, 6, 10); y = ri(r, 1, x - 2); z = ri(r, 1, x - y); v = x - y - z; add(x + '-' + y + '-' + z, v); }
      else if (k === 'a+b-c') { x = ri(r, 2, 7); y = ri(r, 1, 9 - x); z = ri(r, 1, x + y - 1); v = x + y - z; add(x + '+' + y + '-' + z, v); }
      else { x = ri(r, 4, 10); y = ri(r, 1, x - 1); z = ri(r, 1, 10 - (x - y)); v = x - y + z; add(x + '-' + y + '+' + z, v); }
    });
    return { list: list, ans: ans };
  };

  /* 比大小 */
  GEN['compare-sign'] = function (item, r) {
    var list = [], ans = [];
    for (var i = 0; i < (item.list || []).length; i++) {
      var a = ri(r, 2, 10), b = ri(r, 2, 10);
      if (i % 3 === 2) b = a;           /* 偶尔来一个等号 */
      list.push([String(a), String(b)]);
      ans.push(a > b ? '>' : a < b ? '<' : '=');
    }
    return { list: list, ans: ans };
  };

  /* 一图四式：4 个算式各 3 个空，答案按「数、数、结果」排 */
  GEN['picture-four'] = function (item, r) {
    var a = ri(r, 2, 5);
    var b = ri(r, 2, 10 - a);
    var s = a + b;
    return {
      a: { e: item.a.e, n: a }, b: { e: item.b.e, n: b },
      ans: [String(b), String(a), String(s),
        String(a), String(b), String(s),
        String(s), String(a), String(b),
        String(s), String(b), String(a)],
      ansText: b + '+' + a + '=' + s + '　' + a + '+' + b + '=' + s +
        '　' + s + '-' + a + '=' + b + '　' + s + '-' + b + '=' + a
    };
  };

  /* 看图列式：图和算式里的数一起换，答案按「空出现的顺序」排 */
  GEN['picture-ask'] = function (item, r) {
    var tail = (item.eq && item.eq.tail) || '（个）';
    if (item.scene === 'box') {
      var total = ri(r, 7, 10);
      var out = ri(r, 2, total - 1);
      return {
        out: out, total: total,
        brace: total + (item.unitShort || '支'),
        eq: { cells: [{ v: total }, { op: 'op' }, { v: out }, { text: '=' }, {}], tail: tail },
        ans: ['-', String(total - out)]
      };
    }
    if (item.scene === 'tree') {
      var up = ri(r, 1, 3), down = ri(r, 3, 7);
      return {
        up: up, down: down,
        brace: '? 只',
        eq: { cells: [{}, { op: 'op' }, {}, { text: '=' }, {}], tail: tail },
        ans: [String(up), '+', String(down), String(up + down)]
      };
    }
    var total2 = ri(r, 8, 10);
    var cross = ri(r, 2, 3);
    var boxed = ri(r, 2, Math.max(2, total2 - cross - 1));
    return {
      left: total2 - cross, cross: cross, boxed: boxed,
      eq: { cells: [{ v: total2 }, { op: 'op' }, { op: 'op' }, { text: '=' }, {}], tail: tail },
      ans: [String(cross), String(boxed), String(total2 - cross - boxed)]
    };
  };

  /* 解决问题 */
  GEN['word'] = function (item, r) {
    var g = item.gen || 'cats';
    if (g === 'cats') {
      var a = ri(r, 2, 6), b = ri(r, 1, 8 - a);
      return {
        stem: '大猫钓了 {{}} 条鱼，小猫钓了 {{}} 条鱼。一共钓了几条鱼？',
        eq: { cells: [{}, { op: 'op' }, {}, { text: '=' }, {}], tail: '（条）' },
        ans: [String(a), String(b), String(a), '+', String(b), String(a + b)]
      };
    }
    if (g === 'birds') {
      var total = ri(r, 8, 10), fly = ri(r, 2, total - 2);
      return {
        stem: '一共有 ' + total + ' 只小鸟，飞走了 ' + fly + ' 只。身边还剩几只小鸟？',
        eq: { cells: [{ v: total }, { op: 'op' }, { v: fly }, { text: '=' }, {}], tail: '（只）' },
        ans: ['-', String(total - fly)]
      };
    }
    /* sheep */
    var l = ri(r, 2, 4), rr2 = ri(r, 3, 6);
    return {
      stem: '一共有几只羊？',
      eq: { cells: [{}, { op: 'op' }, {}, { text: '=' }, {}], tail: '（只）' },
      ans: [String(l), '+', String(rr2), String(l + rr2)]
    };
  };

  /* 涂一涂 / 画一画：图形数量换一换，答案（含 ▢○▢ 式子）跟着换 */
  GEN['color-compare'] = function (item, r) {
    var ans = [], txts = [];
    var rows = (item.rows || []).map(function (src) {
      var base = ri(r, 4, 8);
      var n;
      if (src.rel === '少') n = base - ri(r, 1, 2);
      else if (src.rel === '多') n = base + ri(r, 1, 2);
      else n = base;
      if (n < 2) n = 2;
      if (n > 10) n = 10;
      var sign = n < base ? '<' : (n > base ? '>' : '=');
      ans.push(String(n), sign, String(base));
      txts.push(n + ' ' + sign + ' ' + base);
      return { a: src.a, b: src.b, rel: src.rel, base: base, n: n };
    });
    return { rows: rows, ans: ans, ansText: '涂好后写式子：' + txts.join('；') };
  };
  GEN['draw-solve'] = function (item, r) {
    var out = [], ans = [];
    (item.list || []).forEach(function (x) {
      var parts = String(x.expr).split(/([+-])/).filter(Boolean);
      var v = Number(parts[0]);
      for (var i = 1; i < parts.length; i += 2) {
        v = parts[i] === '+' ? v + Number(parts[i + 1]) : v - Number(parts[i + 1]);
      }
      out.push({ expr: x.expr });
      ans.push(String(v));
    });
    return { list: out, ans: ans };
  };
  GEN['pick-problem'] = function (item, r) {
    var idx = ri(r, 0, (item.opts || []).length - 1);
    return { ans: [idx] };
  };

  /* 把生成结果合并回题目 */
  function applyGen(item, patch) {
    var out = {};
    Object.keys(item).forEach(function (k) { out[k] = item[k]; });
    Object.keys(patch).forEach(function (k) { out[k] = patch[k]; });
    if (patch.ans) out.ans = patch.ans;
    out.attempt = null;
    return out;
  }

  /* 生成整份仿造卷 */
  function variant(paper, seed) {
    var r = rng(seed);
    var out = {};
    Object.keys(paper).forEach(function (k) { out[k] = paper[k]; });
    out.id = paper.id;
    out.variantSeed = seed;
    out.sections = (paper.sections || []).map(function (sec) {
      var s = {};
      Object.keys(sec).forEach(function (k) { s[k] = sec[k]; });
      s.items = (sec.items || []).map(function (it) {
        if (it.challenge) return applyGen(it, {});
        var gen = GEN[it.k];
        if (!gen) return applyGen(it, {});
        return applyGen(it, gen(it, r));
      });
      return s;
    });
    return out;
  }

  w.Exam = {
    papers: papers, get: get, groups: groups, items: items,
    countOf: countOf, scoreOf: scoreOf, blankCount: blankCount,
    gradeLabel: gradeLabel, unitLabel: unitLabel,
    renderItem: renderItem, renderPaper: renderPaper, answerSheet: answerSheet,
    compareRows: compareRows,
    variant: variant, rng: rng,
    /* 变式里 plateSub 的盘号要从 _extra 拿，渲染前先摊平 */
    _R: R
  };
})(window);
