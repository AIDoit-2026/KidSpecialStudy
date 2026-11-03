/* 数学题目构造器与变式模板（各册共用）
   M({...}) 生成一道题；TPL.xxx({...}) 按模板换数换情境，答案自动计算。 */
(function (w) {
  'use strict';

  function M(o) {
    o.module = 'math';
    o.input = o.input || 'number';
    o.type = o.type || 'word';
    o.level = o.level || 2;
    return o;
  }

  /* ---------------- 比较式填数 ----------------
     形如「□ + 2 < 5」「9 > □ + 4」「10 − □ > 3」，问 □ 里最大/最小能填几。
     规则：只出答案有唯一极值的组合——问最大必须上面有界，问最小必须下面有界，
     否则「最大」会无穷大。答案由 solveIneq 算，不手写。 */
  var OPP = { '<': '>', '>': '<' };
  var INEQ_MAX = 10;          // 前几个单元只到 10 以内

  /* 算式相对右边那个数的关系符号（算式在右时显示符号要翻过来） */
  function relOf(p) {
    return p.side === 'rhs' ? (OPP[p.cmp] || p.cmp) : p.cmp;
  }

  /* 把空位的值当成 x，算出式子的得数 */
  function ineqVal(p, x) {
    var blankA = (p.a === null || p.a === undefined);
    if (p.op === '+') return blankA ? x + p.b : p.a + x;
    return blankA ? x - p.b : p.a - x;
  }

  /* 枚举 0..max 找极值；无解、或顶到边界（说明还能再大/再小）都返回 null */
  function solveIneq(p) {
    var max = p.max || INEQ_MAX;
    var blankA = (p.a === null || p.a === undefined);
    var blankB = (p.b === null || p.b === undefined);
    if (blankA === blankB) return null;              // 必须正好空一个数
    var rel = relOf(p);
    var hits = [];
    for (var x = 0; x <= max; x++) {
      var v = ineqVal(p, x);
      if (v < 0 || v > max) continue;                // 一年级不出超纲得数
      if (rel === '<' ? v < p.c : v > p.c) hits.push(x);
    }
    if (!hits.length) return null;
    var first = hits[0], last = hits[hits.length - 1];
    var inRange = function (v) { return v >= 0 && v <= max; };
    if (p.ask === 'max') {
      if (last >= max) return null;                  // 已经能填到上限，说明没顶
      /* 再大一个数就「算不出来」而不是「不成立」，孩子会觉得奇怪，也不出 */
      if (!inRange(ineqVal(p, last + 1))) return null;
      return { answer: last };
    }
    if (first <= 0) return null;
    if (!inRange(ineqVal(p, first - 1))) return null;
    return { answer: first };
  }

  /* ---------------- 按节点批量铺开 ----------------
     跟着教材进度，把「比较式填数」铺到每个练习里（每次 1~3 道）：
     5 以内 → 10 以内 → 20 以内 → 100 以内。
     同一节点用固定种子生成，预览、打印、错题本看到的永远是同一批题。 */
  var TIERS = {
    w5: { max: 5, ops: ['+'], numMax: 4, minC: 2, minAns: 1, minOther: 1, level: 2, skill: '5以内.比较式填数' },
    w10: { max: 10, ops: ['+', '-'], numMax: 8, minC: 3, minAns: 2, minOther: 1, level: 2, skill: '10以内.比较式填数' },
    w20: { max: 20, ops: ['+', '-'], numMax: 14, minC: 5, minAns: 3, minOther: 2, level: 3, skill: '20以内.比较式填数' },
    /* 100 以内刚起步：另一个数只取一位数，算的都是「两位数 ± 一位数」 */
    w100e: { max: 100, ops: ['+', '-'], numMax: 9, minC: 20, minAns: 10, minOther: 2, level: 3, skill: '100以内.比较式填数' },
    w100: { max: 100, ops: ['+', '-'], numMax: 20, minC: 20, minAns: 10, minOther: 2, level: 3, skill: '100以内.比较式填数' }
  };

  /* 定长种子随机：同一个 seed 永远给出同一串题 */
  function rng(seed) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return function () {
      h = (h + 0x6D2B79F5) >>> 0;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randInt(rnd, lo, hi) { return lo + Math.floor(rnd() * (hi - lo + 1)); }

  /* 生成一道合法的比较式填数：先定答案和另一个数，再反推比较的那个数 c
     opts 可以把某一维钉死（用来让每次练习的第一道先出最常规的「左式 · 求最大」） */
  function genIneq(tier, rnd, avoid, opts) {
    opts = opts || {};
    var M = tier.max;
    for (var t = 0; t < 160; t++) {
      var op = tier.ops[randInt(rnd, 0, tier.ops.length - 1)];
      var blank = rnd() < 0.5 ? 'a' : 'b';
      var side = opts.side || (rnd() < 0.5 ? 'lhs' : 'rhs');
      var ask = opts.ask || (rnd() < 0.5 ? 'max' : 'min');
      /* 求「最小」时答案至少 2，孩子得先试 0 和 1 才会排除，不至于变成送分题 */
      var lo = Math.max(tier.minAns || 1, ask === 'min' ? 2 : 1);
      var ans = randInt(rnd, lo, Math.max(lo, M - 2));
      var a, b, other, v;

      if (op === '+') {
        var room = M - ans;
        if (room < 1) continue;
        other = randInt(rnd, tier.minOther, Math.min(tier.numMax, room));
        v = ans + other;
        if (blank === 'a') { a = null; b = other; } else { a = other; b = null; }
      } else if (blank === 'a') {
        if (ans < 2) continue;
        other = randInt(rnd, tier.minOther, Math.min(tier.numMax, ans - 1));
        v = ans - other; a = null; b = other;
      } else {
        if (ans >= M) continue;
        other = randInt(rnd, ans + 1, Math.min(M, ans + tier.numMax));
        v = other - ans; a = other; b = null;
      }

      /* 得数随 x 变大（加、或减第一个数）时，问最大要「<」；变小（减第二个数）时反过来 */
      var up = (op === '+' || blank === 'a');
      var rel = ask === 'max' ? '<' : '>';
      var c = (up === (ask === 'max')) ? v + 1 : v - 1;
      if (c < (tier.minC || 1) || c > M) continue;

      var p = { op: op, a: a, b: b, c: c, side: side, ask: ask, max: M,
        cmp: side === 'lhs' ? rel : OPP[rel] };
      var r = solveIneq(p);
      if (!r || r.answer !== ans) continue;          // 答案不唯一或不闭合，换一组
      var sig = sigOf(p);
      if (avoid.indexOf(sig) >= 0) continue;
      avoid.push(sig);
      return p;
    }
    return null;
  }

  /* 题目指纹：用来跨节点去重，别让孩子连着两天做同一道 */
  function sigOf(p) {
    return [p.op, p.a, p.b, p.c, p.cmp, p.side, p.ask].join(' ');
  }

  /* 给一个节点生成 count 道；生成不出来就少给几道，不抛错
     o.avoid 传同一个数组就能跨节点去重（decorate 里按册共用） */
  function ineqPack(o) {
    var tier = TIERS[o.tier] || TIERS.w10;
    var rnd = rng(o.seed || 'ineq');
    var out = [], avoid = o.avoid || [], ops = [];
    var total = o.count || 2;
    for (var i = 0; i < total; i++) {
      /* 一次练 2 道以上时，第一道先出最常规的「左式 · 求最大」，后面再上反着想的 */
      var opt = (i === 0 && total > 1) ? { side: 'lhs', ask: 'max' } : {};
      var p = genIneq(tier, rnd, avoid, opt);
      if (!p) continue;
      /* 尽量别连着两道同一种运算，孩子的体感会好一些 */
      if (ops.length && ops[ops.length - 1] === p.op && tier.ops.length > 1) {
        var p2 = genIneq(tier, rnd, avoid, opt);
        if (p2) p = p2;
      }
      ops.push(p.op);
      p.level = tier.level;
      p.skill = tier.skill;
      out.push(TPL.ineq(p));
    }
    return out;
  }

  /* 按「单元」批量铺：rules = [{unit:'u2', tier:'w10', base:2, from:0}, ...]
     节点题量：第一个节点 base-1，整理复习类 base+1，其余 base（都在 1~3 之间） */
  function decorate(units, rules) {
    /* 同一个数组按册共用：手写题 + 生成题一起去重，避免跨节点出同一道 */
    var used = [];
    units.forEach(function (u) {
      u.nodes.forEach(function (n) {
        n.items.forEach(function (it) {
          if (it.type !== 'cmp' || !it.fig) return;
          used.push(sigOf({
            op: it.fig.op === '−' ? '-' : it.fig.op, a: it.fig.a, b: it.fig.b,
            c: it.fig.c, cmp: it.fig.cmp, side: it.fig.side, ask: it.fig.ask
          }));
        });
      });
    });

    (rules || []).forEach(function (r) {
      var u = null;
      for (var i = 0; i < units.length; i++) if (units[i].id === r.unit) { u = units[i]; break; }
      if (!u) return;
      var base = r.base || 2;
      u.nodes.forEach(function (n, ni) {
        if (ni < (r.from || 0)) return;
        var want = ni === (r.from || 0) ? Math.max(1, base - 1) : base;
        if (/整理和复习|单元复习|总复习|复习$/.test(n.lesson)) want = Math.min(3, base + 1);
        var have = n.items.filter(function (it) { return it.type === 'cmp'; }).length;
        want = Math.min(3, want);
        var need = want - have;
        if (need > 0) {
          n.items = n.items.concat(ineqPack({
            tier: r.tier, count: need, seed: 'sx-' + u.id + '-' + n.id, avoid: used
          }));
        }
        n.ineq = n.items.filter(function (it) { return it.type === 'cmp'; }).length;
      });
    });
  }

  /* 变式模板：数值、情境可换，答案自动计算 */
  var TPL = {
    add: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: p.level || 1,
        skill: (p.skill || '加减法.用加法解决问题'),
        stem: '有 ' + a + ' 个' + p.name + '，又拿来 ' + b + ' 个，一共有几个？',
        fig: { type: 'objects', icon: p.icon, groups: [a, b] },
        answer: a + b, unit: p.unit || '个',
        explain: '合起来用加法：' + a + ' + ' + b + ' = ' + (a + b) + '。'
      });
    },
    sub: function (p) {
      var a = p.a, b = p.b, verb = p.verb || '吃';
      return M({
        type: 'word', level: p.level || 1,
        skill: (p.skill || '加减法.用减法解决问题'),
        stem: '有 ' + a + ' 个' + p.name + '，' + verb + '了 ' + b + ' 个，还剩几个？',
        fig: { type: 'objects', icon: p.icon, groups: [a, -b] },
        answer: a - b, unit: p.unit || '个',
        explain: '去掉一部分用减法：' + a + ' − ' + b + ' = ' + (a - b) + '。'
      });
    },
    more: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'compare', level: p.level || 2,
        skill: (p.skill || '比多比少.求相差'),
        stem: p.leftName + ' ' + a + ' ' + (p.unit || '人') + '，' + p.rightName + ' ' + b + ' ' + (p.unit || '人') + '，' + p.leftName + '比' + p.rightName + '多几' + (p.unit || '人') + '？',
        fig: {
          type: 'twoRows',
          left: { icon: p.leftIcon, n: a, label: p.leftName },
          right: { icon: p.rightIcon, n: b, label: p.rightName }
        },
        answer: a - b, unit: p.unit || '人',
        explain: '比多少用减法：' + a + ' − ' + b + ' = ' + (a - b) + '。'
      });
    },
    back: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: 3,
        skill: (p.skill || '加减法.逆向用加法解决问题'),
        stem: (p.name || '小鸟') + '飞走 ' + a + ' 只，还剩 ' + b + ' 只。原来有几只？',
        fig: { type: 'objects', icon: p.icon || '🐦', groups: [b] },
        answer: a + b, unit: '只',
        explain: '飞走的和剩下的合起来是原来的：' + a + ' + ' + b + ' = ' + (a + b) + '。'
      });
    },
    part: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: 2,
        skill: (p.skill || '加减法.总数与部分'),
        stem: '一共 ' + a + ' 个' + p.name + '，' + b + ' 个是' + p.c1 + '的，其余是' + p.c2 + '的。' + p.c2 + '的有几个？',
        fig: { type: 'objects', icon: p.icon, groups: [b, a - b], colors: [p.c1, p.c2] },
        answer: a - b, unit: '个',
        explain: '总数减去一部分：' + a + ' − ' + b + ' = ' + (a - b) + '。'
      });
    },
    cmpAdd: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: 2,
        skill: (p.skill || '比多比少.求多的数'),
        stem: '小明有 ' + a + ' 个' + p.name + '，小红比小明多 ' + b + ' 个，小红有几个？',
        fig: { type: 'twoRows', left: { icon: p.icon, n: a, label: '小明' }, right: { icon: p.icon, n: a + b, label: '小红' } },
        answer: a + b, unit: '个',
        explain: '比小明多 ' + b + ' 个，就是 ' + a + ' + ' + b + ' = ' + (a + b) + '。'
      });
    },
    /* 比较式填数：□ + 2 < 5，□ 里最大/最小能填几
       op:'+'|'-'；a、b 里正好一个传 null（那个就是空格）
       side:'lhs' 算式在左 / 'rhs' 算式在右；cmp:'<'|'>' 是显示出来的符号
       ask:'max'|'min'；max: 数字上限，默认 10 */
    ineq: function (p) {
      var r = solveIneq(p);
      if (!r) throw new Error('比较式填数没有唯一答案：' + JSON.stringify(p));
      var ans = r.answer;
      var blankA = (p.a === null || p.a === undefined);
      var ask = p.ask === 'max' ? '最大' : '最小';
      var bad = p.ask === 'max' ? ans + 1 : ans - 1;
      var shown = p.op === '+' ? '+' : '−';
      var expr = function (x) {
        return p.op === '+'
          ? (blankA ? x + ' + ' + p.b : p.a + ' + ' + x)
          : (blankA ? x + ' − ' + p.b : p.a + ' − ' + x);
      };
      var v1 = ineqVal(p, ans), v2 = ineqVal(p, bad);
      /* 解析里的比较方向和题目显示的一致：算式在右就写「9 > 8」，不翻回来 */
      var chain = function (v) {
        return p.side === 'rhs' ? (p.c + ' ' + p.cmp + ' ' + v) : (v + ' ' + p.cmp + ' ' + p.c);
      };
      /* 题干只问一句，算式交给图去画（练习页、看题页、打印、错题本都会渲染图）；
         朗读另给一份带算式的，孩子不认识字时也能听懂整道题 */
      var say = function (v) { return (v === null || v === undefined) ? '方框' : String(v); };
      var plus = p.op === '+' ? ' 加 ' : ' 减 ';
      var sign = p.cmp === '>' ? ' 大于 ' : ' 小于 ';
      var sayExpr = say(p.a) + plus + say(p.b);
      return M({
        type: 'cmp', level: p.level || 3,
        skill: (p.skill || '10以内.比较式填数'),
        stem: '□ 里' + ask + '能填几？',
        audio: '方框里' + ask + '能填几？ ' + (p.side === 'rhs'
          ? p.c + sign + sayExpr
          : sayExpr + sign + p.c),
        fig: {
          type: 'cmp', op: shown,
          a: blankA ? null : p.a,
          b: (p.b === null || p.b === undefined) ? null : p.b,
          c: p.c, cmp: p.cmp, side: p.side || 'lhs', ask: p.ask,
          max: p.max || INEQ_MAX                        // 本题的数域上限（自检用）
        },
        answer: ans, unit: '',
        explain: '填 ' + ans + '：' + expr(ans) + ' = ' + v1 + '，' + chain(v1) + '；' +
          '填 ' + bad + '：' + expr(bad) + ' = ' + v2 + '，' + chain(v2) +
          ' 就不成立。所以' + ask + '填 ' + ans + '。'
      });
    }
  };


  /* ---------------- 组装 ---------------- */
  /**
   * units: 节点数组；meta: {bookId, code, name, textbook, version}
   */
  function build(units, meta) {
    var code = meta.code;
    var content = {
      bookId: meta.bookId, subject: 'math', name: meta.name,
      textbook: meta.textbook || '人教版 2024 修订版',
      version: meta.version || '2024.1', units: []
    };
    var seq = 0;
    units.forEach(function (u, ui) {
      var unit = { id: u.id, name: u.name, index: ui, lessons: [], nodes: [] };
      u.nodes.forEach(function (n, ni) {
        if (unit.lessons.indexOf(n.lesson) < 0) unit.lessons.push(n.lesson);
        var items = n.items.map(function (it, qi) {
          it.id = code + '-' + u.id + '-' + n.id + '-q' + (qi + 1);
          it.seq = ++seq;
          it.source = '人教版一上'.replace('一上', meta.stage || '一上') + ' · ' +
            u.name.replace(/^[^·]*· /, '') + ' · ' + n.lesson;
          if (!it.audio && it.stem) it.audio = it.stem.replace(/[「」？?，。、：（）]/g, ' ');
          return it;
        });
        unit.nodes.push({
          id: n.id, index: ni, title: n.lesson + ' · ' + n.title,
          lesson: n.lesson, estimatedMin: 30, items: items,
          ineq: n.ineq                                   // 本节点应带的比较式填数题数
        });
      });
      content.units.push(unit);
    });
    content.nodeCount = content.units.reduce(function (s, u) { return s + u.nodes.length; }, 0);
    content.itemCount = content.units.reduce(function (s, u) {
      return s + u.nodes.reduce(function (s2, n) { return s2 + n.items.length; }, 0);
    }, 0);
    return content;
  }

  /* 自检：比较式填数题的答案是否与算式一致（给 check-content 用） */
  function checkIneq(it) {
    var f = (it && it.fig) || {};
    if (f.type !== 'cmp') return { ok: false, msg: '不是比较式图' };
    if ((f.a === null) === (f.b === null)) return { ok: false, msg: '空格数量不对' };
    var p = {
      op: f.op === '−' ? '-' : f.op, a: f.a, b: f.b, c: f.c,
      cmp: f.cmp, side: f.side, ask: f.ask, max: f.max || INEQ_MAX
    };
    var r = solveIneq(p);
    if (!r) return { ok: false, msg: '没有唯一答案' };
    if (Number(it.answer) !== r.answer) {
      return { ok: false, msg: '答案应为 ' + r.answer + '，实际 ' + it.answer };
    }
    return { ok: true, msg: '' };
  }

  w.SXBuilder = {
    build: build, M: M, TPL: TPL, solveIneq: solveIneq, checkIneq: checkIneq,
    INEQ_MAX: INEQ_MAX, TIERS: TIERS, ineqPack: ineqPack, decorate: decorate
  };
})(window);
