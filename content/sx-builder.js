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
      /* 题干把算式写出来：以前几十道题统一叫「□ 里最大能填几？」，
         算式只画在图里，屏幕上看着一模一样，打印单 / 错题本更是分不清哪道是哪道。
         现在每题题干都带自己的算式，朗读另给一份口语版，孩子不认字也能听懂 */
      var say = function (v) { return (v === null || v === undefined) ? '方框' : String(v); };
      var plus = p.op === '+' ? ' 加 ' : ' 减 ';
      var sign = p.cmp === '>' ? ' 大于 ' : ' 小于 ';
      var sayExpr = say(p.a) + plus + say(p.b);
      var exprBlank = p.op === '+'
        ? (blankA ? '□ + ' + p.b : p.a + ' + □')
        : (blankA ? '□ − ' + p.b : p.a + ' − □');
      var chainBlank = p.side === 'rhs'
        ? (p.c + ' ' + p.cmp + ' ' + exprBlank)
        : (exprBlank + ' ' + p.cmp + ' ' + p.c);
      return M({
        type: 'cmp', level: p.level || 3,
        skill: (p.skill || '10以内.比较式填数'),
        stem: chainBlank + '，□ 里' + ask + '能填几？',
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


  /* ---------------- 思维挑战题 ----------------
     参考一上第 9、10 周「周末大闯关」卷：等式两边填数、双重不等式、相邻数、
     序数合起来（多余条件）、青蛙跳格、数阵求和、间隔 / 楼层、倒数比较、
     「同样多」隐藏条件、凑等式、逆向求原数。
     全部 4 选 1，答案由算式反推不手写；数域 max 跟着册次走（10 / 20 以内）。 */
  var CHALLENGE_CAP = 10;      // 当前单元允许出现的最大数，challengePack 每次设置
  function sayify(s) {
    return String(s).replace(/□/g, ' 方框 ').replace(/−/g, ' 减 ')
      .replace(/\+/g, ' 加 ').replace(/>/g, ' 大于 ').replace(/</g, ' 小于 ')
      .replace(/=/g, ' 等于 ').replace(/[，。？、…（）]/g, ' ');
  }
  function shuffled(rnd, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  /* 4 个互不相同的选项，正确答案的位置打乱；负数 / 空值不能当干扰项 */
  function choice(rnd, correct, distractors) {
    var right = String(correct), seen = {}, opts = [right];
    seen[right] = 1;
    shuffled(rnd, (distractors || []).map(String)).forEach(function (s) {
      if (opts.length >= 4 || seen[s] || s === '' || s === 'NaN') return;
      if (!isNaN(Number(s)) && Number(s) < 0) return;
      seen[s] = 1; opts.push(s);
    });
    var numeric = /^\d+$/.test(right), k = 1;
    while (opts.length < 4 && k < 40) {
      /* 补位也不能冒出没学过的数（刚学 10 以内时别补出 11、12） */
      var v = Number(correct) + k;
      if (numeric && v > CHALLENGE_CAP) v = Number(correct) - k;
      var s2 = numeric ? (v >= 0 ? String(v) : null) : '以上都不对 ' + k;
      if (s2 && !seen[s2]) { seen[s2] = 1; opts.push(s2); }
      k++;
    }
    var out = shuffled(rnd, opts);
    return { options: out, answer: out.indexOf(right) };
  }
  function CQ(o, rnd) {
    var c = choice(rnd, o.answer, o.distractors);
    return M({
      type: 'challenge', level: 3, skill: '思维挑战.' + o.kind,
      stem: o.stem, audio: sayify(o.stem),
      options: c.options, answer: c.answer, explain: o.explain
    });
  }
  function seq(lo, hi) {
    var a = []; for (var i = lo; i <= hi; i++) a.push(i); return a;
  }

  var CHALLENGE = [
    /* 1. 等式两边填数：6 − 3 = □ − 7 */
    function (rnd, max) {
      var a = randInt(rnd, 3, Math.max(3, max - 1)), b = randInt(rnd, 1, a - 1);
      var left = a - b, plus = rnd() < 0.5;
      var d = randInt(rnd, 1, Math.min(5, Math.max(1, max - 1)));
      var ans, right;
      if (plus) { ans = left - d; right = '□ + ' + d; }
      else { ans = left + d; right = '□ − ' + d; }
      if (ans < 0 || ans > max) return null;
      return CQ({ kind: '等式填数',
        stem: a + ' − ' + b + ' = ' + right + '，□ 里填几？', answer: ans,
        distractors: [left, left + 1, ans + 1, ans - 1, b, d],
        explain: '先算 ' + a + ' − ' + b + ' = ' + left + '，右边也要等于 ' + left +
          '，所以 □ = ' + ans + '。' }, rnd);
    },
    /* 2. 双重不等式：5 > □ > 2
       干扰项必须全落在区间外，否则「哪个数能填」会出现两个正确答案 */
    function (rnd, max) {
      var hi = randInt(rnd, 4, Math.min(max, 10));
      var lo = randInt(rnd, Math.max(0, hi - 5), hi - 2);
      var cnt = hi - lo - 1, chain = hi + ' > □ > ' + lo;
      if (cnt < 1) return null;
      var bads = [lo, hi, lo - 1, lo - 2, hi + 1, hi + 2].filter(function (v) {
        return v >= 0 && v <= max && (v <= lo || v >= hi);
      });
      if (rnd() < 0.5) {
        var good = randInt(rnd, lo + 1, hi - 1);
        return CQ({ kind: '双重不等式', stem: chain + '，下面哪个数能填？', answer: good,
          distractors: bads,
          explain: '□ 要同时比 ' + lo + ' 大、比 ' + hi + ' 小，只能是 ' +
            seq(lo + 1, hi - 1).join('、') + '，所以 ' + good + ' 能填。' }, rnd);
      }
      return CQ({ kind: '双重不等式', stem: chain + '，□ 里能填几个数？', answer: cnt,
        distractors: [cnt + 1, cnt - 1, cnt + 2, hi, lo],
        explain: '比 ' + lo + ' 大又比 ' + hi + ' 小的数是 ' +
          seq(lo + 1, hi - 1).join('、') + '，一共 ' + cnt + ' 个。' }, rnd);
    },
    /* 3. 相邻数 / 前面第几个 / 后面第几个（跨 2~3 格，别出「前面第 1 个」这种送分题） */
    function (rnd, max) {
      var top = Math.min(max, 10), n = randInt(rnd, 3, top - 1), mode = randInt(rnd, 0, 2);
      if (mode === 0) {
        return CQ({ kind: '相邻数', stem: '与 ' + n + ' 相邻的两个数里，较大的是几？',
          answer: n + 1, distractors: [n, n - 1, n + 2, n - 2],
          explain: '与 ' + n + ' 相邻的是 ' + (n - 1) + ' 和 ' + (n + 1) +
            '，较大的是 ' + (n + 1) + '。' }, rnd);
      }
      if (mode === 1) {
        var back = randInt(rnd, 2, Math.min(3, n - 1));
        return CQ({ kind: '前后第几个', stem: n + ' 前面第 ' + back + ' 个数是几？',
          answer: n - back, distractors: [n + back, n - back + 1, n - back - 1, n],
          explain: '从 ' + n + ' 往前数 ' + back + ' 个：' + n + ' − ' + back +
            ' = ' + (n - back) + '。' }, rnd);
      }
      var fwdMax = Math.min(3, top - n);
      if (fwdMax < 2) return null;
      var fwd = randInt(rnd, 2, fwdMax);
      return CQ({ kind: '前后第几个', stem: n + ' 后面第 ' + fwd + ' 个数是几？',
        answer: n + fwd, distractors: [n - fwd, n + fwd - 1, n + fwd + 1, n],
        explain: '从 ' + n + ' 往后数 ' + fwd + ' 个：' + n + ' + ' + fwd +
          ' = ' + (n + fwd) + '。' }, rnd);
    },
    /* 4. 序数合起来：「第几盘」是多余条件，得抓两个数相加 */
    function (rnd, max) {
      var p1 = randInt(rnd, 1, 5), p2 = randInt(rnd, p1 + 1, 6);
      var a = randInt(rnd, 1, Math.min(5, max - 1));
      var b = randInt(rnd, 1, Math.min(5, max - a));
      if (a + b < 2) return null;
      return CQ({ kind: '序数合起来',
        stem: '从左数第 ' + p1 + ' 盘有 ' + a + ' 个，第 ' + p2 + ' 盘有 ' + b + ' 个，共几个？',
        answer: a + b, distractors: [a + b + 1, a + b - 1, a, b, p1 + p2],
        explain: '「第几盘」只是位置，问一共几个就把两盘加起来：' +
          a + ' + ' + b + ' = ' + (a + b) + '。' }, rnd);
    },
    /* 5. 青蛙跳格（数轴）：终点和干扰项都不能超过本单元的数域 */
    function (rnd, max) {
      var step = randInt(rnd, 1, 3), times = randInt(rnd, 2, 4), span = step * times;
      if (span > max) return null;
      var start = randInt(rnd, 0, max - span);
      var ans = start + span;
      return CQ({ kind: '数轴跳格',
        stem: '青蛙从 ' + start + ' 出发，每次跳 ' + step + ' 格，跳 ' + times + ' 次到几？',
        answer: ans, distractors: [ans + step, ans - step, start + times, ans + 1, start + step],
        explain: '跳 ' + times + ' 次一共前进 ' + step + ' × ' + times + ' = ' +
          (step * times) + ' 格，' + start + ' + ' + (step * times) + ' = ' + ans + '。' }, rnd);
    },
    /* 6. 数阵：每条线上三个数的和相同 */
    function (rnd, max) {
      var target = randInt(rnd, 6, Math.min(max, 20));
      var a = randInt(rnd, 1, target - 2), b = randInt(rnd, 1, target - a - 1);
      var ans = target - a - b;
      if (ans < 1) return null;
      return CQ({ kind: '数阵求和',
        stem: '每条线上三数和是 ' + target + '，已知 ' + a + ' 和 ' + b + '，第三个是几？',
        answer: ans, distractors: [ans + 1, ans - 1, target - a, target - b, a + b],
        explain: '三个数加起来是 ' + target + '，' + target + ' − ' + a + ' − ' + b +
          ' = ' + ans + '。' }, rnd);
    },
    /* 7. 间隔问题：n 个人之间只有 n−1 个空 */
    function (rnd, max) {
      var boys = randInt(rnd, 4, Math.min(max, 10)), ans = boys - 1;
      return CQ({ kind: '间隔问题',
        stem: boys + ' 名男生排一列，每两人间站 1 名女生，共几名女生？',
        answer: ans, distractors: [boys, boys + 1, boys - 2, ans + 2],
        explain: boys + ' 名男生之间只有 ' + ans + ' 个空，每空站 1 名女生，共 ' +
          ans + ' 名。' }, rnd);
    },
    /* 8. 楼层问题：楼上的层数是多余条件 */
    function (rnd, max) {
      var down = randInt(rnd, 1, Math.min(max, 10) - 2);
      var up = randInt(rnd, 1, 3), ans = down + 1;
      if (ans + up > max) return null;
      return CQ({ kind: '楼层',
        stem: '小云家楼下有 ' + down + ' 层，楼上有 ' + up + ' 层，她住第几层？',
        answer: ans, distractors: [down, down + up, ans + 1, ans - 1],
        explain: '楼下 ' + down + ' 层，再往上就是她家，所以是第 ' + ans +
          ' 层；楼上的 ' + up + ' 层用不上。' }, rnd);
    },
    /* 9. 倒数时前后谁大 */
    function (rnd, max) {
      var n = randInt(rnd, 3, Math.min(max, 10) - 1);
      if (rnd() < 0.5) {
        return CQ({ kind: '倒数比较', stem: '按 9、8、7…倒数，' + n + ' 前后哪个数大？',
          answer: '前面的数', distractors: ['后面的数', '一样大', '无法比较'],
          explain: '倒着数越往前越大，' + n + ' 前面是 ' + (n + 1) +
            '，后面是 ' + (n - 1) + '。' }, rnd);
      }
      return CQ({ kind: '倒数比较', stem: '倒着数时，' + n + ' 后面的数比 ' + n + ' 大还是小？',
        answer: '小', distractors: ['大', '一样大', '不一定'],
        explain: '倒着数越往后越小，' + n + ' 后面是 ' + (n - 1) + '，比 ' + n + ' 小。' }, rnd);
    },
    /* 10. 「同样多」是要自己翻一倍的隐藏条件 */
    function (rnd, max) {
      var a = randInt(rnd, 2, Math.floor(Math.min(max, 10) / 2)), ans = a * 2;
      return CQ({ kind: '同样多',
        stem: '小兰摘 ' + a + ' 朵，我摘的和小兰同样多，一共几朵？',
        answer: ans, distractors: [a, a + 1, ans + 1, ans - 1, a + 2],
        explain: '「同样多」说明我也摘了 ' + a + ' 朵，' + a + ' + ' + a + ' = ' +
          ans + ' 朵。' }, rnd);
    },
    /* 11. 凑等式：找出得数相同的另一道算式（正确算式不写在题干里） */
    function (rnd, max) {
      var target = randInt(rnd, 5, Math.min(max, 8));
      var baseA = randInt(rnd, 1, target - 1);
      var base = baseA + ' + ' + (target - baseA);
      var cA = randInt(rnd, 1, target - 1);
      /* 只把加数换个顺序（4+1 → 1+4）等于把答案写在题干里，直接弃用 */
      if (cA === baseA || cA === target - baseA) return null;
      var right = cA + ' + ' + (target - cA);
      function expr(v) {
        var x = randInt(rnd, 1, Math.max(1, v - 1));
        return x + ' + ' + (v - x);
      }
      var wrong = [expr(target + 1), expr(target - 1), expr(target + 2)];
      var uniq = {}, ok = true;
      wrong.concat([right, base]).forEach(function (s) {
        if (uniq[s]) ok = false; uniq[s] = 1;
      });
      if (!ok) return null;
      return CQ({ kind: '凑等式',
        stem: base + ' = ' + target + '，下面哪道也得 ' + target + '？',
        answer: right, distractors: wrong,
        explain: '只有 ' + right + ' = ' + target + '，另外三道得数分别是 ' +
          (target + 1) + '、' + (target - 1) + '、' + (target + 2) + '。' }, rnd);
    },
    /* 12. 逆向求原数：飞走的 + 剩下的 */
    function (rnd, max) {
      var gone = randInt(rnd, 1, Math.min(5, max - 2));
      var left = randInt(rnd, 1, Math.min(5, max - gone - 1));
      var ans = gone + left;
      return CQ({ kind: '逆向求原数',
        stem: '树上飞走 ' + gone + ' 只还剩 ' + left + ' 只，原来有几只？',
        answer: ans, distractors: [left, gone, ans - 1, ans + 1, left - gone],
        explain: '飞走的加上剩下的就是原来的：' + gone + ' + ' + left + ' = ' +
          ans + ' 只。' }, rnd);
    }
  ];

  /* 按节点生成 count 道；avoid 传同一个对象就能跨节点、跨册不重题。
     前一轮按打乱后的题型顺序逐个试，保证每个节点的题不扎堆在同一类 */
  function challengePack(o) {
    var rnd = rng(o.seed || 'challenge'), max = o.max || 10;
    var avoid = o.avoid || {}, out = [], guard = 0, total = o.count || 2;
    CHALLENGE_CAP = max;
    var order = shuffled(rnd, CHALLENGE.map(function (f, i) { return i; }));
    while (out.length < total && guard++ < 600) {
      var at = guard <= CHALLENGE.length ? order[guard - 1]
        : randInt(rnd, 0, CHALLENGE.length - 1);
      var it = CHALLENGE[at](rnd, max);
      if (!it || avoid[it.stem] || it.stem.length > 34) continue;
      if (it.options.length < 4 || new Set(it.options).size !== 4) continue;
      /* 答案数字不能碰巧也是题干里的已知数，否则孩子看着眼熟就能蒙对
         （「9 − 1 = □ + 4」答案恰好是 4，就是这种送分题） */
      var ans = String(it.options[it.answer]);
      if (/^\d+$/.test(ans) && (it.stem.match(/\d+/g) || []).indexOf(ans) >= 0) continue;
      /* 题干和选项里都不能冒出这个单元还没学到的数（干扰项最容易漏） */
      var nums = (it.stem + ' ' + it.options.join(' ')).match(/\d+/g) || [];
      if (nums.some(function (s) { return Number(s) > max; })) continue;
      avoid[it.stem] = 1;
      out.push(it);
    }
    return out;
  }

  /* 跨册共用的题干去重表：一上、一下分别调用 challengeDecorate，
     各自建表会让同一道题在两册里各出现一次 */
  var CHALLENGE_USED = {};

  /* 按单元铺题：rules = [{unit:'u2', max:10, count:2, from:0}, ...] */
  function challengeDecorate(units, rules) {
    var used = CHALLENGE_USED;
    (rules || []).forEach(function (r) {
      var u = null;
      for (var i = 0; i < units.length; i++) if (units[i].id === r.unit) { u = units[i]; break; }
      if (!u) return;
      u.nodes.forEach(function (n, ni) {
        if (ni < (r.from || 0)) return;
        n.items = n.items.concat(challengePack({
          max: r.max || 10, count: r.count || 2,
          seed: 'ch-' + u.id + '-' + n.id, avoid: used
        }));
        n.challenge = n.items.filter(function (it) { return it.type === 'challenge'; }).length;
      });
    });
  }


  /* ---------------- 单元知识点题库 ----------------
     把「周末大闯关」的题型做数值 / 情境变式，连同后面单元
     （一上：立体图形、11~20、进位加法；一下：退位减法、100 以内数、
     人民币、100 以内加减、找规律）的同步题型，按【单元知识点】
     分散铺到每个练习里，而不是集中成一张卷子。
     每题 4 选 1、type:'unit'、skill:'单元题.<知识点>'；
     题干与全书已有题互不重复，题干和选项里的数字不超过本单元数域。 */
  var UNIT_STEMS = {};      // 全书题干去重（含四册已有题）
  var PACK_RULES = {};      // 供自检核对「题是否落在本单元允许的知识点」
  var UNIT_CAP = 10;        // 本单元数域上限，choice() 的补位也看它

  function UQ(o, rnd) {
    var c = choice(rnd, o.answer, o.distractors);
    var ans = String(c.options[c.answer]);
    var ex = o.explain || '';
    if (/^\d+$/.test(ans) && ex.indexOf(ans) < 0) ex += ' 答案：' + ans + '。';
    return M({
      type: 'unit', level: 3, skill: '单元题.' + (o.kind || '综合'),
      stem: o.stem, audio: sayify(o.stem),
      options: c.options, answer: c.answer, explain: ex
    });
  }
  function R(rnd, lo, hi) { return randInt(rnd, lo, Math.max(lo, hi)); }
  function dn(v) {
    return [v - 2, v - 1, v + 1, v + 2, v + 3]
      .filter(function (x) { return x >= 0 && x <= UNIT_CAP; });
  }
  function expr(v, rnd) {
    var x = R(rnd, 1, Math.max(1, v - 1));
    return x + ' + ' + (v - x);
  }

  var TOPICS = {
    /* ===== 试卷变式：比较式填数 / 等式两边 / 相邻数 / 序数 / 跳格 ===== */
    ineq: [
      function (rnd) {
        var c = R(rnd, 4, UNIT_CAP - 1), b = R(rnd, 1, Math.min(4, c - 2));
        var ans = c - b - 1;
        if (ans < 1 || ans + b > UNIT_CAP) return null;
        return UQ({ stem: '要使 □ + ' + b + ' < ' + c + '，□ 最大填几？', answer: ans,
          distractors: dn(ans).concat([b, c]),
          explain: '□ + ' + b + ' 要比 ' + c + ' 小，最大只能填 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var hi = R(rnd, 4, Math.min(UNIT_CAP, 10));
        var lo = R(rnd, 0, hi - 3);
        var good = R(rnd, lo + 1, hi - 1);
        var bads = [lo, hi, lo - 1, hi + 1, lo - 2, hi + 2].filter(function (v) {
          return v >= 0 && v <= UNIT_CAP && (v <= lo || v >= hi);
        });
        if (bads.length < 3) return null;
        return UQ({ stem: '比 ' + lo + ' 大又比 ' + hi + ' 小的数是下面哪个？', answer: good,
          distractors: bads,
          explain: '夹在 ' + lo + ' 和 ' + hi + ' 之间的数只有 ' +
            seq(lo + 1, hi - 1).join('、') + '，' + good + ' 在其中。' }, rnd);
      }
    ],
    eqboth: [
      function (rnd) {
        var a = R(rnd, 3, UNIT_CAP - 1), b = R(rnd, 1, a - 1), left = a - b;
        var d = R(rnd, 1, Math.min(4, UNIT_CAP - 1)), ans = left - d;
        if (ans < 0 || ans > UNIT_CAP) return null;
        return UQ({ stem: '天平 ' + a + ' − ' + b + ' 与 □ + ' + d + ' 平衡，□ 填几？',
          answer: ans, distractors: dn(ans).concat([left, d]),
          explain: '左边 ' + a + ' − ' + b + ' = ' + left + '，右边 □ + ' + d +
            ' 也要等于 ' + left + '，所以 □ = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 1, Math.max(1, UNIT_CAP - 3)), d = R(rnd, 1, 3), ans = a + d;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '□ − ' + d + ' = ' + a + '，□ 里填几？', answer: ans,
          distractors: dn(ans).concat([a, d]),
          explain: '减去的 ' + d + ' 要加回来：' + a + ' + ' + d + ' = ' + ans + '。' }, rnd);
      }
    ],
    adjacent: [
      function (rnd) {
        var n = R(rnd, 2, Math.max(2, Math.floor(UNIT_CAP / 2))), ans = 2 * n;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '与 ' + n + ' 相邻的两个数加起来是几？', answer: ans,
          distractors: dn(ans).concat([n - 1, n + 1]),
          explain: '相邻的是 ' + (n - 1) + ' 和 ' + (n + 1) + '，加起来是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 4, UNIT_CAP), k = R(rnd, 2, Math.min(3, n - 1)), ans = n - k;
        if (ans < 0) return null;
        return UQ({ stem: '从 ' + n + ' 往前数第 ' + k + ' 个数是几？', answer: ans,
          distractors: dn(ans).concat([n + k, n]),
          explain: '从 ' + n + ' 往前数 ' + k + ' 个：' + n + ' − ' + k + ' = ' + ans + '。' }, rnd);
      }
    ],
    plates: [
      function (rnd) {
        var a = R(rnd, 1, Math.min(5, UNIT_CAP - 1));
        var b = R(rnd, 1, Math.min(5, Math.max(1, UNIT_CAP - a)));
        var p = R(rnd, 2, 6), ans = a + b;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '第 ' + p + ' 盘 ' + a + ' 个，相邻盘 ' + b + ' 个，共几个？',
          answer: ans, distractors: dn(ans).concat([a, b, p]),
          explain: '「第几盘」只是位置，把两盘加起来：' + a + ' + ' + b + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var k = R(rnd, 2, 5), a = R(rnd, 1, Math.min(4, UNIT_CAP - 2));
        var b = R(rnd, 1, Math.min(4, Math.max(1, UNIT_CAP - a - 1))), ans = a + b;
        return UQ({ stem: '右数第 ' + k + ' 盘 ' + a + ' 个，左邻 ' + b + ' 个，共几个？',
          answer: ans, distractors: dn(ans).concat([a, b, k]),
          explain: '两盘合起来是 ' + a + ' + ' + b + ' = ' + ans + '。' }, rnd);
      }
    ],
    jump: [
      function (rnd) {
        var step = R(rnd, 1, 3), times = R(rnd, 2, 3), span = step * times;
        if (span > UNIT_CAP) return null;
        var start = R(rnd, span, UNIT_CAP), ans = start - span;
        return UQ({ stem: '小兔从 ' + start + ' 起每次回跳 ' + step + ' 格，跳 ' + times + ' 次到几？',
          answer: ans, distractors: dn(ans).concat([start, start + span]),
          explain: '一共往回 ' + span + ' 格：' + start + ' − ' + span + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var step = R(rnd, 1, 3), times = R(rnd, 2, 3), span = step * times;
        if (span > UNIT_CAP) return null;
        var start = R(rnd, 0, UNIT_CAP - span), ans = start + span;
        return UQ({ stem: '青蛙从 ' + start + ' 起，每跳 ' + step + ' 格，' + times + ' 次后到几？',
          answer: ans, distractors: dn(ans).concat([start, start + step, start + times]),
          explain: '跳 ' + times + ' 次一共 ' + span + ' 格：' + start + ' + ' + span + ' = ' + ans + '。' }, rnd);
      }
    ],
    array9: [
      function (rnd) {
        var t = R(rnd, 6, Math.min(UNIT_CAP, 20));
        var a = R(rnd, 1, t - 3), b = R(rnd, 1, t - a - 1), ans = t - a - b;
        if (ans < 1) return null;
        return UQ({ stem: '每条线三数和 ' + t + '，另两个 ' + a + '、' + b + '，第三个几？',
          answer: ans, distractors: dn(ans).concat([t - a, t - b]),
          explain: t + ' − ' + a + ' − ' + b + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var m = R(rnd, 2, Math.max(2, Math.floor(Math.min(UNIT_CAP, 20) / 3))), t = 3 * m;
        var ans = m - 1;
        return UQ({ stem: '三个连着的数加起来是 ' + t + '，最小的是几？', answer: ans,
          distractors: dn(ans).concat([m, m + 1]),
          explain: '中间数是 ' + m + '，三个数是 ' + ans + '、' + m + '、' + (m + 1) + '。' }, rnd);
      }
    ],
    interval: [
      function (rnd) {
        var n = R(rnd, 4, Math.min(UNIT_CAP, 10)), ans = n - 1;
        return UQ({ stem: n + ' 面红旗排一行，两旗间插 1 面黄旗，共几面？', answer: ans,
          distractors: dn(ans).concat([n, n + 1]),
          explain: n + ' 面旗之间只有 ' + ans + ' 个空，所以插 ' + ans + ' 面黄旗。' }, rnd);
      },
      function (rnd) {
        var d = R(rnd, 1, Math.max(1, Math.min(UNIT_CAP, 10) - 2));
        var up = R(rnd, 1, 3), ans = d + 1;
        if (ans + up > UNIT_CAP) return null;
        return UQ({ stem: '楼下 ' + d + ' 层、楼上 ' + up + ' 层，他家第几层？', answer: ans,
          distractors: dn(ans).concat([d, d + up]),
          explain: '楼下 ' + d + ' 层，再往上就是他家，第 ' + ans + ' 层；楼上的层数用不上。' }, rnd);
      }
    ],
    countdown: [
      function (rnd) {
        var n = R(rnd, 3, Math.max(3, Math.min(UNIT_CAP, 10) - 1));
        return UQ({ stem: '按 9、8、7…倒数，' + n + ' 前面的数比它大还是小？', answer: '大',
          distractors: ['小', '一样大', '无法比较'],
          explain: '倒着数越往前越大，' + n + ' 前面是 ' + (n + 1) + '，比它大。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 5, UNIT_CAP), ans = n - 2;
        return UQ({ stem: '从 ' + n + ' 倒着数，第 3 个数是几？', answer: ans,
          distractors: dn(ans).concat([n - 1, n - 3]),
          explain: '从 ' + n + ' 起：' + n + '、' + (n - 1) + '、' + ans + '，第 3 个是 ' + ans + '。' }, rnd);
      }
    ],
    same: [
      function (rnd) {
        var a = R(rnd, 2, Math.max(2, Math.floor(Math.min(UNIT_CAP, 10) / 2))), ans = 2 * a;
        return UQ({ stem: '小兰折 ' + a + ' 只，我折的同样多，共几只？', answer: ans,
          distractors: dn(ans).concat([a, a + 1]),
          explain: '「同样多」就是我也折 ' + a + ' 只，' + a + ' + ' + a + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var d = 2 * R(rnd, 1, Math.max(1, Math.floor(Math.min(UNIT_CAP, 20) / 4))), ans = d / 2;
        return UQ({ stem: '两堆相差 ' + d + ' 个，多的给少的几个就同样多？', answer: ans,
          distractors: dn(ans).concat([d, d - ans]),
          explain: '只移相差数的一半：' + d + ' ÷ 2 = ' + ans + ' 个。' }, rnd);
      }
    ],
    makeEq: [
      function (rnd) {
        var t = R(rnd, 5, Math.min(UNIT_CAP, 8)), a = R(rnd, 1, t - 1);
        var c = R(rnd, 1, t - 1);
        if (c === a || c === t - a) return null;
        var base = a + ' + ' + (t - a), right = c + ' + ' + (t - c);
        var wrong = [expr(t + 1, rnd), expr(t - 1, rnd), expr(t + 2, rnd)];
        var all = wrong.concat([right, base]), ok = new Set(all).size === all.length;
        if (!ok) return null;
        return UQ({ stem: '下面哪道算式和 ' + base + ' 的得数一样？', answer: right,
          distractors: wrong,
          explain: '只有 ' + right + ' = ' + t + '，另外三道得数是 ' +
            (t + 1) + '、' + (t - 1) + '、' + (t + 2) + '。' }, rnd);
      },
      function (rnd) {
        var t = R(rnd, 4, Math.min(UNIT_CAP, 12));
        var right = expr(t, rnd), wrong = [expr(t + 1, rnd), expr(t - 1, rnd), expr(t + 2, rnd)];
        if (new Set(wrong.concat([right])).size !== 4) return null;
        return UQ({ stem: '下面哪道算式的得数是 ' + t + '？', answer: right, distractors: wrong,
          explain: right + ' = ' + t + '，其余三道得数分别是 ' +
            (t + 1) + '、' + (t - 1) + '、' + (t + 2) + '。' }, rnd);
      }
    ],
    reverse: [
      function (rnd) {
        var g = R(rnd, 1, Math.min(5, UNIT_CAP - 2));
        var l = R(rnd, 1, Math.min(5, Math.max(1, UNIT_CAP - g - 1))), ans = g + l;
        return UQ({ stem: '借走 ' + g + ' 本还剩 ' + l + ' 本，原来几本？', answer: ans,
          distractors: dn(ans).concat([g, l]),
          explain: '借走的加剩下的：' + g + ' + ' + l + ' = ' + ans + ' 本。' }, rnd);
      },
      function (rnd) {
        var g = R(rnd, 1, Math.min(5, UNIT_CAP - 2));
        var l = R(rnd, 1, Math.min(5, Math.max(1, UNIT_CAP - g - 1))), ans = g + l;
        return UQ({ stem: '吃掉 ' + g + ' 个还剩 ' + l + ' 个，原有几个？', answer: ans,
          distractors: dn(ans).concat([g, l]),
          explain: '吃掉的加剩下的：' + g + ' + ' + l + ' = ' + ans + ' 个。' }, rnd);
      }
    ],
    picture: [
      function (rnd) {
        var a = R(rnd, 1, Math.max(1, UNIT_CAP - 1));
        var b = R(rnd, 1, Math.max(1, UNIT_CAP - a));
        if (a === b) return null;   // 两个减法干扰项会撞车，凑不出四个不同选项
        return UQ({ stem: '左边 ' + a + ' 只、右边 ' + b + ' 只，求一共用哪道算式？',
          answer: a + ' + ' + b,
          distractors: [a + ' − ' + b, b + ' − ' + a, a + ' + ' + (b + 1)],
          explain: '求一共用加法：' + a + ' + ' + b + '。' }, rnd);
      },
      function (rnd) {
        var t = R(rnd, 3, UNIT_CAP), p = R(rnd, 1, t - 1);
        return UQ({ stem: '共 ' + t + ' 个，拿走 ' + p + ' 个，求还剩用哪道算式？',
          answer: t + ' − ' + p,
          distractors: [t + ' + ' + p, p + ' − ' + t, t + ' − ' + (p + 1)],
          explain: '从总数里去掉拿走的：' + t + ' − ' + p + '。' }, rnd);
      }
    ],
    cmpExpr: [
      function (rnd) {
        var a = R(rnd, 1, Math.max(1, UNIT_CAP - 2));
        var b = R(rnd, 1, Math.max(1, UNIT_CAP - a)), s = a + b;
        var c = R(rnd, 0, Math.max(0, UNIT_CAP - 1));
        if (c === s || s > UNIT_CAP) return null;
        var right = s > c ? '>' : '<';
        return UQ({ stem: a + ' + ' + b + ' ○ ' + c + '，○ 里填什么？', answer: right,
          distractors: ['>', '<', '=', '无法比'].filter(function (x) { return x !== right; }),
          explain: a + ' + ' + b + ' = ' + s + '，' + s + (right === '>' ? ' > ' : ' < ') + c + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 1, Math.max(1, UNIT_CAP - 3));
        var b = R(rnd, 1, Math.max(1, UNIT_CAP - a - 1)), s = a + b, ans = s + 1;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '下面哪个数比 ' + a + ' + ' + b + ' 大？', answer: ans,
          distractors: [s, s - 1, s - 2, a, b],
          explain: a + ' + ' + b + ' = ' + s + '，比它大的只有 ' + ans + '。' }, rnd);
      }
    ],

    /* ===== 一上后段：立体图形 / 11~20 / 进位加法 / 综合 ===== */
    shape3d: [
      function (rnd) {
        var list = [
          { q: '魔方的形状是下面哪个？', a: '正方体' },
          { q: '易拉罐的形状是下面哪个？', a: '圆柱' },
          { q: '牙膏盒的形状是下面哪个？', a: '长方体' },
          { q: '能向任意方向滚动的是哪个图形？', a: '球' }
        ];
        var p = list[R(rnd, 0, list.length - 1)];
        return UQ({ stem: p.q, answer: p.a,
          distractors: ['球', '正方体', '圆柱', '长方体'].filter(function (x) { return x !== p.a; }),
          explain: '正确答案是' + p.a + '。' }, rnd);
      },
      function (rnd) {
        return UQ({ stem: '哪种图形横放能滚、竖放能站稳？', answer: '圆柱',
          distractors: ['球', '正方体', '长方体'],
          explain: '圆柱横放能滚动，竖放两个圆面能站稳。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, Math.min(6, UNIT_CAP)), b = R(rnd, 1, a), ans = a + b;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '积木下层 ' + a + ' 个、上层 ' + b + ' 个，一共几个？', answer: ans,
          distractors: dn(ans).concat([a, b]),
          explain: '分层数再合起来：' + a + ' + ' + b + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        if (UNIT_CAP < 8) return null;
        return UQ({ stem: '至少几个小正方体能拼成一个大正方体？', answer: 8,
          distractors: ['2', '4', '6', '9'],
          explain: '每层 4 个、共 2 层，至少要 8 个小正方体。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, 5), b = R(rnd, 1, 3), ans = b + 1;
        return UQ({ stem: a + ' 个正方体、' + b + ' 个圆柱、1 个球，能滚的几个？', answer: ans,
          distractors: dn(ans).concat([a, b, a + b]),
          explain: '圆柱和球能滚：' + b + ' + 1 = ' + ans + ' 个。' }, rnd);
      }
    ],
    teens: [
      function (rnd) {
        var k = R(rnd, 1, 9), ans = 10 + k;
        return UQ({ stem: '1 个十和 ' + k + ' 个一组成的数是几？', answer: ans,
          distractors: dn(ans).concat([k, k + 1]),
          explain: '1 个十是 10，再加 ' + k + ' 个一就是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 11, 19);
        return UQ({ stem: n + ' 的十位上是几？', answer: 1,
          distractors: ['2', String(n - 10), '0', '9'],
          explain: '十几都由 1 个十组成，十位上是 1。' }, rnd);
      },
      function (rnd) {
        var k = R(rnd, 2, 5), ans = 10 + k;
        return UQ({ stem: '从 11 起数，第 ' + k + ' 个数是几？', answer: ans,
          distractors: dn(ans).concat([11, 11 + k]),
          explain: '从 11 开始数，第 ' + k + ' 个是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var k = R(rnd, 2, 8), ans = 11 + k;
        return UQ({ stem: '十位 1、个位比十位多 ' + k + '，这个两位数是几？', answer: ans,
          distractors: dn(ans).concat([k + 1, 10 + k]),
          explain: '个位是 1 + ' + k + ' = ' + (1 + k) + '，这个数是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        return UQ({ stem: '最小的两位数是几？', answer: 10,
          distractors: ['9', '11', '20', '1'],
          explain: '最大的一位数是 9，最小的两位数是 10。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 11, 17), b = a + 2, ans = a + 1;
        return UQ({ stem: '比 ' + a + ' 大又比 ' + b + ' 小的数是几？', answer: ans,
          distractors: dn(ans).concat([a, b]),
          explain: '夹在 ' + a + ' 和 ' + b + ' 中间的是 ' + ans + '。' }, rnd);
      }
    ],
    carry: [
      function (rnd) {
        var k = R(rnd, 2, 9), ans = k - 1;
        return UQ({ stem: '算 9 + ' + k + ' 时，把 ' + k + ' 分成 1 和几？', answer: ans,
          distractors: dn(ans).concat([k, 10 - k]),
          explain: '9 差 1 凑成 10，所以把 ' + k + ' 分成 1 和 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var k = R(rnd, 2, 9), ans = k - 1;
        return UQ({ stem: '9 + ' + k + ' = 10 + □，□ 里填几？', answer: ans,
          distractors: dn(ans).concat([k, 10]),
          explain: '9 凑十用掉 1，剩下 ' + ans + '，所以 9 + ' + k + ' = 10 + ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, 9), b = R(rnd, 2, 9);
        return UQ({ stem: a + ' + ' + b + ' 和 ' + b + ' + ' + a + ' 的得数怎样？', answer: '一样大',
          distractors: ['第一个大', '第二个大', '无法比较'],
          explain: '交换两个加数的位置，和不变，都是 ' + (a + b) + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, Math.min(9, UNIT_CAP - 3));
        var b = R(rnd, 1, Math.min(8, UNIT_CAP - a - 1)), ans = a + b + 1;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '前面 ' + a + ' 人、后面 ' + b + ' 人，这队共几人？', answer: ans,
          distractors: dn(ans).concat([a, b, a + b]),
          explain: '别漏了自己：' + a + ' + ' + b + ' + 1 = ' + ans + ' 人。' }, rnd);
      }
    ],
    mixed: [
      function (rnd) {
        var a = R(rnd, 4, Math.min(15, UNIT_CAP)), b = R(rnd, 1, a - 1);
        var c = R(rnd, 1, Math.min(5, Math.max(1, UNIT_CAP - a))), ans = a - b + c;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: '有 ' + a + ' 个，用去 ' + b + ' 个又买 ' + c + ' 个，现在几个？',
          answer: ans, distractors: dn(ans).concat([a, b, c]),
          explain: a + ' − ' + b + ' + ' + c + ' = ' + ans + ' 个。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, Math.max(2, Math.min(8, UNIT_CAP - 2)));
        var b = R(rnd, 1, 5), c = R(rnd, 1, 5), ans = a + b + c;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: a + ' + ' + b + ' + ' + c + ' 得几？', answer: ans,
          distractors: dn(ans).concat([a + b, a + c]),
          explain: '先算 ' + a + ' + ' + b + ' = ' + (a + b) + '，再加 ' + c + ' 得 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 1, Math.max(1, UNIT_CAP - 8)), d = R(rnd, 2, 3), ans = a + 3 * d;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: a + '、' + (a + d) + '、' + (a + 2 * d) + '、□，□ 里填几？',
          answer: ans, distractors: dn(ans).concat([a + d, a + 2 * d]),
          explain: '每次多 ' + d + '，所以最后一个是 ' + ans + '。' }, rnd);
      }
    ],

    /* ===== 一下：图形 / 退位减 / 分类 / 100 以内 / 人民币 / 找规律 ===== */
    plane: [
      function (rnd) {
        return UQ({ stem: '两个一样的正方形能拼成下面哪个？', answer: '长方形',
          distractors: ['正方形', '三角形', '圆'],
          explain: '两个正方形并排拼起来是长方形。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, Math.min(6, UNIT_CAP)), b = R(rnd, 1, Math.min(5, UNIT_CAP - a)), ans = a + b;
        return UQ({ stem: '图里 ' + a + ' 个三角形、' + b + ' 个圆，共几个图形？', answer: ans,
          distractors: dn(ans).concat([a, b]),
          explain: a + ' + ' + b + ' = ' + ans + ' 个图形。' }, rnd);
      },
      function (rnd) {
        return UQ({ stem: '正方形纸沿中线对折剪开，得到两个什么？', answer: '长方形',
          distractors: ['正方形', '三角形', '圆'],
          explain: '沿中线对折剪开，得到两个一样的长方形。' }, rnd);
      }
    ],
    borrow: [
      function (rnd) {
        var n = R(rnd, 12, 18), k = R(rnd, 3, 9), ans = n - k;
        return UQ({ stem: '想 ' + k + ' + 几 = ' + n + '？', answer: ans,
          distractors: dn(ans).concat([k, ans + 1, n]),
          explain: '想加算减：' + k + ' + ' + ans + ' = ' + n + '，所以 ' + n + ' − ' + k + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 11, 18), k = R(rnd, 2, 8), ans = n - 10;
        return UQ({ stem: '破十法算 ' + n + ' − ' + k + '，10 − ' + k + ' 后要加几？', answer: ans,
          distractors: dn(ans).concat([k, 10 - k]),
          explain: '把 ' + n + ' 拆成 10 和 ' + ans + '，最后要加回 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var k1 = R(rnd, 4, 9), k2 = R(rnd, 2, k1 - 1);
        return UQ({ stem: '★ − ' + k1 + ' 和 ★ − ' + k2 + '，哪个得数大？', answer: '★ − ' + k2,
          distractors: ['★ − ' + k1, '一样大', '无法比较'],
          explain: '减得越少剩得越多，' + k2 + ' 比 ' + k1 + ' 小，所以 ★ − ' + k2 + ' 大。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 8, Math.min(20, UNIT_CAP)), b = R(rnd, 1, a - 1), ans = a - b;
        return UQ({ stem: a + ' 朵比 ' + b + ' 朵多几朵？', answer: ans,
          distractors: dn(ans).concat([a, b, a + b]),
          explain: '求多多少用减法：' + a + ' − ' + b + ' = ' + ans + ' 朵。' }, rnd);
      }
    ],
    sort: [
      function (rnd) {
        var t = R(rnd, 5, Math.min(9, UNIT_CAP));
        var right = expr(t, rnd), a2 = expr(t, rnd), a3 = expr(t, rnd);
        var wrong = expr(t + 1, rnd);
        if (new Set([right, a2, a3, wrong]).size !== 4) return null;
        return UQ({ stem: '下面哪道算式的得数和其它三道不同？', answer: wrong,
          distractors: [right, a2, a3],
          explain: '三道得 ' + t + '，只有 ' + wrong + ' = ' + (t + 1) + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, 5), b = R(rnd, 2, 5);
        return UQ({ stem: '按颜色分红 ' + a + ' 个、蓝 ' + b + ' 个，共分几类？', answer: 2,
          distractors: [String(a), String(b), String(a + b), '1'],
          explain: '只有红、蓝两种颜色，分成 2 类。' }, rnd);
      },
      function (rnd) {
        var t = R(rnd, 5, 9);
        return UQ({ stem: '三道算式的得数都是 ' + t + '，按得数分几类？', answer: 1,
          distractors: ['2', '3', String(t)],
          explain: '得数都相同，按得数只能分成 1 类。' }, rnd);
      }
    ],
    hundreds: [
      function (rnd) {
        var n = R(rnd, 21, 99), t = Math.floor(n / 10), o = n % 10;
        return UQ({ stem: n + ' 里有几个十？', answer: t,
          distractors: dn(t).concat([o, t + 1]),
          explain: n + ' 的十位是 ' + t + '，表示 ' + t + ' 个十。' }, rnd);
      },
      function (rnd) {
        return UQ({ stem: '从右边起，第二位是什么位？', answer: '十位',
          distractors: ['个位', '百位', '千位'],
          explain: '从右边起第一位是个位，第二位是十位。' }, rnd);
      },
      function (rnd) {
        var t = R(rnd, 1, 8), o = R(rnd, 1, 9), ans = t * 10 + o;
        return UQ({ stem: '计数器十位 ' + t + ' 颗、个位 ' + o + ' 颗，是几？', answer: ans,
          distractors: dn(ans).concat([t + o, o * 10 + t]),
          explain: t + ' 个十和 ' + o + ' 个一合起来是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        return UQ({ stem: '个位比十位大 2 的最小两位数是几？', answer: 13,
          distractors: ['24', '31', '12', '20'],
          explain: '十位取最小的 1，个位就是 3，这个数是 13。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 5, 45), ans = a + 15;
        return UQ({ stem: a + '、' + (a + 5) + '、' + (a + 10) + '、□，□ 里填几？', answer: ans,
          distractors: dn(ans).concat([a + 5, a + 20]),
          explain: '每次多 5，所以最后填 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 30, 60), d = R(rnd, 2, 9), ans = a - 3 * d;
        if (ans < 0) return null;
        return UQ({ stem: a + '、' + (a - d) + '、' + (a - 2 * d) + '、□，□ 里填几？', answer: ans,
          distractors: dn(ans).concat([a - d, a - 4 * d]),
          explain: '每次少 ' + d + '，所以最后填 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 20, Math.min(45, Math.floor(UNIT_CAP / 2))), ans = 2 * n;
        return UQ({ stem: '与 ' + n + ' 相邻的两数之和是几？', answer: ans,
          distractors: dn(ans).concat([n - 1, n + 1]),
          explain: (n - 1) + ' + ' + (n + 1) + ' = ' + ans + '。' }, rnd);
      }
    ],
    money: [
      function (rnd) {
        var k = R(rnd, 2, 9), ans = k * 10;
        return UQ({ stem: k + ' 元可以换几个 1 角？', answer: ans,
          distractors: dn(ans).concat([k + 10, k]),
          explain: '1 元 = 10 角，' + k + ' 元 = ' + ans + ' 角。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, 9), b = R(rnd, 2, 9), ans = a + b;
        return UQ({ stem: a + ' 角 + ' + b + ' 角 = 几角？', answer: ans,
          distractors: dn(ans).concat([a, b]),
          explain: a + ' + ' + b + ' = ' + ans + ' 角。' }, rnd);
      },
      function (rnd) {
        var k = R(rnd, 1, 9), ans = 10 - k;
        return UQ({ stem: '1 元买 ' + k + ' 角的笔，找回几角？', answer: ans,
          distractors: dn(ans).concat([k, 10 + k]),
          explain: '1 元 = 10 角，10 − ' + k + ' = ' + ans + ' 角。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, 9);
        return UQ({ stem: a + ' 角 ○ ' + a + ' 分，○ 里填什么？', answer: '>',
          distractors: ['<', '=', '无法比'],
          explain: '角比分大，同样多的角一定大于同样多的分。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 2, 9);
        return UQ({ stem: '一块橡皮 ' + a + ' ( )，括号里填哪个单位？', answer: '角',
          distractors: ['元', '分', '米'],
          explain: '橡皮通常几角钱，用「角」作单位最合适。' }, rnd);
      }
    ],
    addsub100: [
      function (rnd) {
        var a = 10 * R(rnd, 1, 8);
        var b = 10 * R(rnd, 1, Math.max(1, Math.min(9, (UNIT_CAP - a) / 10))), ans = a + b;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: a + ' + ' + b + ' = 几？', answer: ans,
          distractors: dn(ans).concat([a, b]),
          explain: a + ' 是 ' + (a / 10) + ' 个十，加 ' + (b / 10) + ' 个十，得 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 21, Math.min(89, UNIT_CAP - 10)), k = R(rnd, 2, 9), ans = n + k;
        return UQ({ stem: n + ' + ' + k + ' = 几？', answer: ans,
          distractors: dn(ans).concat([n - k]),
          explain: '个位 ' + (n % 10) + ' + ' + k + '，结果是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var n = R(rnd, 21, Math.min(89, UNIT_CAP - 10)), k = R(rnd, 2, 9), ans = n - k;
        return UQ({ stem: n + ' − ' + k + ' = 几？', answer: ans,
          distractors: dn(ans).concat([n + k]),
          explain: n + ' − ' + k + ' = ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 20, 60), b = a + R(rnd, 3, 8), ans = b - a - 1;
        return UQ({ stem: a + ' + □ < ' + b + '，□ 最大填几？', answer: ans,
          distractors: dn(ans).concat([b - a, a, b]),
          explain: '要小于 ' + b + '，□ 最大只能是 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 40, 80), b = R(rnd, 5, 15), c = R(rnd, 2, 9), ans = a - b - c;
        return UQ({ stem: a + ' − (' + b + ' + ' + c + ') = 几？', answer: ans,
          distractors: dn(ans).concat([a - b, a - c]),
          explain: '先算括号里 ' + b + ' + ' + c + ' = ' + (b + c) + '，再算 ' + a + ' − ' + (b + c) + ' = ' + ans + '。' }, rnd);
      }
    ],
    pattern: [
      function (rnd) {
        var a = R(rnd, 2, 10), d = R(rnd, 2, 9), ans = a + 3 * d;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: a + '、' + (a + d) + '、' + (a + 2 * d) + '、□，□ 里填几？', answer: ans,
          distractors: dn(ans).concat([a + d, a + 4 * d]),
          explain: '每次多 ' + d + '，所以填 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 1, 5), d = R(rnd, 1, 3), ans = a + 10 * d;
        if (ans > UNIT_CAP) return null;
        return UQ({ stem: a + '、' + (a + d) + '、' + (a + 3 * d) + '、' + (a + 6 * d) + '、□，□ 里填几？',
          answer: ans, distractors: dn(ans).concat([a + 6 * d + 3 * d, a + 6 * d + 2 * d]),
          explain: '每次多的数依次是 ' + d + '、' + (2 * d) + '、' + (3 * d) + '、' + (4 * d) + '，所以填 ' + ans + '。' }, rnd);
      },
      function (rnd) {
        var k = R(rnd, 4, 9), ans = k % 3 === 1 ? '红' : '蓝';
        return UQ({ stem: '按红、蓝、蓝重复，第 ' + k + ' 个是什么颜色？', answer: ans,
          distractors: ['红', '蓝', '绿', '白'].filter(function (x) { return x !== ans; }),
          explain: '每 3 个一组，第 ' + k + ' 个是' + ans + '色。' }, rnd);
      }
    ],
    final: [
      function (rnd) {
        var p = R(rnd, 3, 9), q = R(rnd, 3, 9), ans = p + q - 1;
        return UQ({ stem: '从前数第 ' + p + '、从后数第 ' + q + '，一共几人？', answer: ans,
          distractors: dn(ans).concat([p + q, p, q]),
          explain: '自己被数了两次：' + p + ' + ' + q + ' − 1 = ' + ans + ' 人。' }, rnd);
      },
      function (rnd) {
        var b = R(rnd, 2, 5), g = R(rnd, 2, Math.min(9, Math.floor(UNIT_CAP / b))), ans = g;
        return UQ({ stem: g * b + ' 人每 ' + b + ' 人一组，能分几组？', answer: ans,
          distractors: dn(ans).concat([b, g * b]),
          explain: g * b + ' ÷ ' + b + ' = ' + ans + ' 组。' }, rnd);
      },
      function (rnd) {
        var a = R(rnd, 30, 80), b = R(rnd, 5, 20), c = R(rnd, 2, 9), ans = a - b + c;
        return UQ({ stem: a + ' 个，卖了 ' + b + ' 个又进货 ' + c + ' 个，现有几个？', answer: ans,
          distractors: dn(ans).concat([a, b, c]),
          explain: a + ' − ' + b + ' + ' + c + ' = ' + ans + ' 个。' }, rnd);
      }
    ]
  };

  function packItemOK(it, cap) {
    if (!it || !it.stem || it.stem.length > 34) return false;
    if (UNIT_STEMS[it.stem]) return false;
    var o = it.options || [];
    if (o.length !== 4 || new Set(o).size !== 4) return false;
    if (o.some(function (s) { return /以上都不对/.test(String(s)); })) return false;
    var ans = String(o[it.answer]);
    /* 答案不能碰巧是题干里出现过的数字，也不能解析里找不到 */
    if (/^\d+$/.test(ans)) {
      if ((it.stem.match(/\d+/g) || []).indexOf(ans) >= 0) return false;
      if ((it.explain || '').indexOf(ans) < 0) return false;
    }
    var nums = (it.stem + ' ' + o.join(' ')).match(/\d+/g) || [];
    if (nums.some(function (s) { return Number(s) > cap; })) return false;
    return true;
  }

  /* 按单元铺题：rules = [{unit, keys, cap, count, from, tag}]
     · 先把本册原有题干收进全局表，新题不会和任何旧题撞（跨册也不会）
     · 每个节点用固定种子，题型按打乱顺序轮着出，不会一场里扎堆同类
     · 每场只带 1~2 道，剩下的留作后面课次的复习，题目自然「分散」 */
  function packDecorate(units, rules) {
    units.forEach(function (u) {
      u.nodes.forEach(function (n) {
        n.items.forEach(function (it) { if (it.stem) UNIT_STEMS[it.stem] = 1; });
      });
    });
    (rules || []).forEach(function (r) {
      var u = null;
      for (var i = 0; i < units.length; i++) if (units[i].id === r.unit) { u = units[i]; break; }
      if (!u) return;
      var tag = r.tag || 'x';
      var keys = (r.keys || []).filter(function (k) { return (TOPICS[k] || []).length; });
      PACK_RULES[tag + '|' + r.unit] = keys.slice();
      if (!keys.length) return;
      UNIT_CAP = r.cap || 10;
      CHALLENGE_CAP = UNIT_CAP;
      /* 同一单元里让每个知识点轮流出场：只按随机函数抽，参数空间大的
         模板（逆向求原数）会因为不撞题干而反复中选，别的题型就被挤没了 */
      var turns = {}, fails = {};
      keys.forEach(function (k) { turns[k] = 0; fails[k] = 0; });
      u.nodes.forEach(function (n, ni) {
        if (ni < (r.from || 0)) return;
        var rnd = rng('unit-' + tag + '-' + u.id + '-' + n.id);
        var out = [], guard = 0;
        while (out.length < (r.count || 2) && guard++ < 500) {
          var best = null, bestScore = Infinity;
          keys.forEach(function (k) {
            var score = turns[k] + fails[k] / 15 + rnd() * 0.01;
            if (score < bestScore) { bestScore = score; best = k; }
          });
          if (!best) break;
          var fs = TOPICS[best], it = fs[R(rnd, 0, fs.length - 1)](rnd, UNIT_CAP);
          if (!packItemOK(it, UNIT_CAP)) { fails[best]++; continue; }
          it.skill = '单元题.' + best;
          UNIT_STEMS[it.stem] = 1;
          turns[best]++;
          out.push(it);
        }
        n.items = n.items.concat(out);
        n.unitpack = out.length;
      });
    });
  }

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
          ineq: n.ineq,                                  // 本节点应带的比较式填数题数
          challenge: n.challenge || 0,                   // 本节点应带的思维挑战题数
          unitpack: n.unitpack || 0                     // 本节点应带的单元知识点题数
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
    INEQ_MAX: INEQ_MAX, TIERS: TIERS, ineqPack: ineqPack, decorate: decorate,
    challengePack: challengePack, challengeDecorate: challengeDecorate, CHALLENGE: CHALLENGE,
    packDecorate: packDecorate, TOPICS: TOPICS, PACK_RULES: PACK_RULES
  };
})(window);
