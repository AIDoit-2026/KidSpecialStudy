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
          c: p.c, cmp: p.cmp, side: p.side || 'lhs', ask: p.ask
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
          lesson: n.lesson, estimatedMin: 30, items: items
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
      cmp: f.cmp, side: f.side, ask: f.ask
    };
    var r = solveIneq(p);
    if (!r) return { ok: false, msg: '没有唯一答案' };
    if (Number(it.answer) !== r.answer) {
      return { ok: false, msg: '答案应为 ' + r.answer + '，实际 ' + it.answer };
    }
    return { ok: true, msg: '' };
  }

  w.SXBuilder = { build: build, M: M, TPL: TPL, solveIneq: solveIneq, checkIneq: checkIneq, INEQ_MAX: INEQ_MAX };
})(window);
