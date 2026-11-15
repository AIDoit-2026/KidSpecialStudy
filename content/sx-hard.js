/* 数学 · 高阶题（两步应用题 + 挑战题）
   目的：把「纯算式 / 一眼看出答案」的比例压下去，让每场练习都有几道
   要读题、要转一个弯的题。题型取自一年级单元卷、期中卷、期末卷的高频题：
     · 应用题：两步增减、连加、连减、加减混合、求原来、比多求和、
       比少求差、排队（前后人数 / 第几第几）、多余条件、间隔、移多补少；
     · 挑战题：年龄差、找规律、移多补少、排队位置、等量代换、比高矮、
       爬楼梯、对折、星期推算、拼正方形。
   数域由 decorate 的 max 控制，不会冒出本单元还没学到的数。
   题干、答案都由算式反推，不手写；同一册题干不重复。 */
(function (w) {
  'use strict';

  var M = w.SXBuilder.M;

  /* ---------------- 随机 ---------------- */
  function hash(s) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function rng(seed) {
    var h = hash(String(seed));
    return function () {
      h = (h + 0x6D2B79F5) >>> 0;
      var t = h;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randInt(r, a, b) { return a + Math.floor(r() * (b - a + 1)); }
  function shuffled(r, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function sayify(s) {
    return String(s).replace(/□/g, ' 方框 ').replace(/−/g, ' 减 ')
      .replace(/\+/g, ' 加 ').replace(/[，。？、：（）]/g, ' ');
  }

  /* 4 选 1：干扰项去重、不留负数、不超出本单元数域 */
  function choice(r, correct, distractors, cap) {
    var right = String(correct), seen = {}, opts = [right];
    seen[right] = 1;
    shuffled(r, (distractors || []).map(String)).forEach(function (s) {
      if (opts.length >= 4 || seen[s] || s === '' || s === 'NaN') return;
      if (/^-?\d+$/.test(s) && Number(s) < 0) return;          // 负数不能当选项
      if (/^\d+$/.test(s) && Number(s) > cap) return;
      seen[s] = 1; opts.push(s);
    });
    var k = 1;
    while (opts.length < 4 && k < 20) {
      var v = Number(correct) + k;
      if (v > cap) v = Number(correct) - k;
      if (v >= 0 && !seen[String(v)]) { seen[String(v)] = 1; opts.push(String(v)); }
      k++;
    }
    var out = shuffled(r, opts);
    return { options: out, answer: out.indexOf(right) };
  }

  function AQ(o) {
    return M({
      type: 'word', ext: 'apply', level: o.level || 3,
      skill: '应用题.' + o.kind,
      stem: o.stem, audio: sayify(o.stem),
      answer: o.answer, unit: o.unit || '',
      explain: o.explain
    });
  }
  function CQ(o, r, cap) {
    var c = choice(r, o.answer, o.distractors, cap);
    return M({
      type: 'challenge', level: 3, skill: '思维挑战.' + o.kind,
      stem: o.stem, audio: sayify(o.stem),
      options: c.options, answer: c.answer, explain: o.explain
    });
  }

  /* ---------------- 应用题 ---------------- */
  var APPLY = [
    /* 1. 两步增减：先减后加 */
    function (r, max) {
      if (max < 7) return null;
      var a = randInt(r, 6, max - 1), b = randInt(r, 1, a - 2);
      var c = randInt(r, 2, Math.max(2, Math.min(4, max - (a - b))));
      var ans = a - b + c;
      if (ans < 0 || ans > max) return null;
      return AQ({ kind: '两步增减', unit: '颗', answer: ans,
        stem: '小明有 ' + a + ' 颗糖，给了弟弟 ' + b + ' 颗，妈妈又给他 ' + c + ' 颗，现在有几颗？',
        explain: '先算给了弟弟后剩 ' + a + ' − ' + b + ' = ' + (a - b) + ' 颗，再算 ' +
          (a - b) + ' + ' + c + ' = ' + ans + ' 颗。' });
    },
    /* 2. 连加 */
    function (r, max) {
      if (max < 7) return null;
      var a = randInt(r, 2, Math.max(2, Math.floor(max / 3)));
      var b = randInt(r, 2, Math.max(2, Math.floor(max / 3)));
      var c = randInt(r, 2, Math.max(2, Math.floor(max / 3)));
      var ans = a + b + c;
      if (ans > max || ans < 7) return null;
      return AQ({ kind: '连加', unit: '个', answer: ans,
        stem: '妈妈买了 ' + a + ' 个苹果、' + b + ' 个梨、' + c + ' 个橘子，一共几个？',
        explain: '三样合起来：' + a + ' + ' + b + ' + ' + c + ' = ' + ans + ' 个。' });
    },
    /* 3. 连减 */
    function (r, max) {
      var a = randInt(r, 5, max), b = randInt(r, 1, Math.min(3, a - 2)),
        c = randInt(r, 1, Math.min(3, a - b - 1));
      var ans = a - b - c;
      if (ans < 0) return null;
      return AQ({ kind: '连减', unit: '只', answer: ans,
        stem: '树上有 ' + a + ' 只鸟，先飞走 ' + b + ' 只，又飞走 ' + c + ' 只，还剩几只？',
        explain: '先飞走后剩 ' + (a - b) + ' 只，再飞走后 ' + (a - b) + ' − ' + c + ' = ' + ans + ' 只。' });
    },
    /* 4. 加减混合 */
    function (r, max) {
      if (max < 7) return null;
      var a = randInt(r, 4, max - 1), b = randInt(r, 2, Math.min(4, max - a)),
        c = randInt(r, 1, Math.max(1, a + b - 2));
      var ans = a + b - c;
      if (ans < 1 || ans > max) return null;
      return AQ({ kind: '加减混合', unit: '只', answer: ans,
        stem: '池塘里有 ' + a + ' 只鸭子，游来 ' + b + ' 只，又游走 ' + c + ' 只，现在有几只？',
        explain: '游来后 ' + a + ' + ' + b + ' = ' + (a + b) + ' 只，再游走 ' + c + ' 只，' +
          (a + b) + ' − ' + c + ' = ' + ans + ' 只。' });
    },
    /* 5. 求原来（逆向加法） */
    function (r, max) {
      if (max < 6) return null;
      var used = randInt(r, 2, max - 2), left = randInt(r, 2, max - used);
      var ans = used + left;
      return AQ({ kind: '求原来', unit: '块', answer: ans,
        stem: '小华吃掉了 ' + used + ' 块糖，还剩 ' + left + ' 块，原来有几块？',
        explain: '吃掉的加上剩下的就是原来的：' + used + ' + ' + left + ' = ' + ans + ' 块。' });
    },
    /* 6. 比多求和 */
    function (r, max) {
      if (max < 8) return null;
      var a = randInt(r, 4, Math.max(4, Math.floor(max / 2) - 1)), b = randInt(r, 1, Math.min(3, max - 2 * a));
      if (b < 1) return null;
      var ans = a + (a + b);
      if (ans > max) return null;
      return AQ({ kind: '比多求和', unit: '人', answer: ans,
        stem: '一班有 ' + a + ' 人，二班比一班多 ' + b + ' 人，两班一共几人？',
        explain: '二班有 ' + a + ' + ' + b + ' = ' + (a + b) + ' 人，两班一共 ' +
          a + ' + ' + (a + b) + ' = ' + ans + ' 人。' });
    },
    /* 7. 比少求差 */
    function (r, max) {
      if (max < 6) return null;
      var a = randInt(r, 6, max), b = randInt(r, 1, a - 3);
      var ans = a - b;
      return AQ({ kind: '比少求差', unit: '只', answer: ans,
        stem: '小红折了 ' + a + ' 只纸鹤，小明折了 ' + b + ' 只，小红比小明多几只？',
        explain: '求多几只用大数减小数：' + a + ' − ' + b + ' = ' + ans + ' 只。' });
    },
    /* 8. 排队：前后人数 → 总人数（别忘了自己） */
    function (r, max) {
      var a = randInt(r, 2, 4), b = randInt(r, 2, 4), ans = a + b + 1;
      if (ans > max || ans < 6) return null;
      return AQ({ kind: '排队求总', unit: '人', answer: ans,
        stem: '小明前面有 ' + a + ' 人，后面有 ' + b + ' 人，这一队一共几人？',
        explain: '前面 ' + a + ' 人 + 后面 ' + b + ' 人 + 小明自己 1 人 = ' +
          a + ' + ' + b + ' + 1 = ' + ans + ' 人。' });
    },
    /* 9. 排队：第几第几 → 总人数（自己数了两次） */
    function (r, max) {
      var a = randInt(r, 2, 5), b = randInt(r, 2, 5), ans = a + b - 1;
      if (ans > max) return null;
      return AQ({ kind: '排队求总', unit: '人', answer: ans,
        stem: '从前面数小红排第 ' + a + '，从后面数排第 ' + b + '，这一队共几人？',
        explain: '小红被数了两次，要减 1：' + a + ' + ' + b + ' − 1 = ' + ans + ' 人。' });
    },
    /* 10. 多余条件 */
    function (r, max) {
      if (max < 7) return null;
      var a = randInt(r, 6, max), b = randInt(r, 1, a - 2), c = randInt(r, 2, 5);
      var ans = a - b;
      return AQ({ kind: '多余条件', unit: '只', answer: ans,
        stem: '树上有 ' + a + ' 只鸟，飞走 ' + b + ' 只，树下有 ' + c + ' 只兔子，树上还剩几只？',
        explain: '「树下有几只兔子」和树上的鸟没关系，是多余条件：' +
          a + ' − ' + b + ' = ' + ans + ' 只。' });
    },
    /* 11. 间隔：两棵树之间放一盆花 */
    function (r, max) {
      var n = randInt(r, 4, 6), ans = n - 1;
      return AQ({ kind: '间隔', unit: '盆', answer: ans,
        stem: '小路的一边种了 ' + n + ' 棵树，每两棵之间放一盆花，一共放几盆？',
        explain: n + ' 棵树之间有 ' + n + ' − 1 = ' + ans + ' 个间隔，所以放 ' + ans + ' 盆花。' });
    },
    /* 12. 移多补少（逆向） */
    function (r, max) {
      if (max < 6) return null;
      var a = randInt(r, 6, max), b = randInt(r, 1, Math.max(1, Math.floor((a - 1) / 2)));
      var ans = a - 2 * b;
      if (ans < 0 || ans > max) return null;
      return AQ({ kind: '移多补少', unit: '张', answer: ans,
        stem: '哥哥有 ' + a + ' 张卡片，给弟弟 ' + b + ' 张后两人一样多，弟弟原来有几张？',
        explain: '给完后哥哥剩 ' + a + ' − ' + b + ' = ' + (a - b) + ' 张，弟弟原来有 ' +
          (a - b) + ' − ' + b + ' = ' + ans + ' 张。' });
    }
  ];

  /* ---------------- 挑战题 ---------------- */
  /* 固定 rng：第 10 题不需要随机数，给一个占位，避免解构时 undefined */
  var rgn = rng('sx-hard-fixed');
  var CHALLENGE = [
    /* 1. 年龄差不变 */
    function (r, max) {
      var a = randInt(r, 5, Math.max(5, max)), d = randInt(r, 1, 3), y = randInt(r, 1, 2);
      if (a - d < 1) return null;
      return CQ({ kind: '年龄差', answer: d,
        stem: '哥哥今年 ' + a + ' 岁，弟弟 ' + (a - d) + ' 岁，' + y + ' 年后哥哥比弟弟大几岁？',
        distractors: [d + y, d - y, a, y],
        explain: '两人的年龄差不会变，' + y + ' 年后还是大 ' + d + ' 岁。' }, r, max);
    },
    /* 2. 找规律填数 */
    function (r, max) {
      var step = randInt(r, 1, 3), start = randInt(r, 0, Math.max(0, max - step * 4));
      var ans = start + step * 4;
      if (ans > max) return null;
      var seq = [0, 1, 2, 3].map(function (k) { return start + step * k; });
      return CQ({ kind: '找规律', answer: ans,
        stem: '找规律：' + seq.join('、') + '、□，□ 里填几？',
        distractors: [ans + step, ans - step, ans + 1, ans - 1, start + step * 3],
        explain: '每次多 ' + step + '：' + seq.join('、') + '，下一个是 ' + ans + '。' }, r, max);
    },
    /* 3. 移多补少：给几张三张后一样多，原来多几张 */
    function (r, max) {
      var b = randInt(r, 1, Math.min(4, Math.floor(max / 2)));
      var ans = 2 * b;
      if (ans > max) return null;
      return CQ({ kind: '移多补少', answer: ans,
        stem: '哥哥给弟弟 ' + b + ' 张卡片后，两人的卡片一样多。哥哥原来比弟弟多几张？',
        distractors: [b, b + 1, ans + 1, ans - 1, ans + b],
        explain: '哥哥给出 ' + b + ' 张，自己少了 ' + b + ' 张、弟弟多了 ' + b + ' 张，' +
          '一来一去相差 ' + b + ' + ' + b + ' = ' + ans + ' 张。' }, r, max);
    },
    /* 4. 排队：后面还有几人 */
    function (r, max) {
      var a = randInt(r, 2, 4), b = randInt(r, 4, Math.min(7, max));
      if (b - 1 < 1) return null;
      return CQ({ kind: '排队位置', answer: b - 1,
        stem: '小明从前数排第 ' + a + '，从后数排第 ' + b + '，小明后面有几人？',
        distractors: [b, b + 1, b - 2, a + b, a],
        explain: '从后数排第 ' + b + '，说明他后面有 ' + b + ' − 1 = ' + (b - 1) + ' 人。' }, r, max);
    },
    /* 5. 等量代换 */
    function (r, max) {
      var x = randInt(r, 2, 3), y = randInt(r, 2, 4), ans = x * y;
      if (ans > max) return null;
      return CQ({ kind: '等量代换', answer: ans,
        stem: '1 个西瓜换 ' + x + ' 个菠萝，1 个菠萝换 ' + y + ' 个苹果，1 个西瓜换几个苹果？',
        distractors: [x + y, ans + 1, ans - 1, x + y + 1, ans + y],
        explain: '1 个西瓜 = ' + x + ' 个菠萝，每个菠萝又换 ' + y + ' 个苹果，' +
          '一共 ' + x + ' × ' + y + ' = ' + ans + ' 个苹果。' }, r, max);
    },
    /* 6. 比高矮推理 */
    function (r, max) {
      var sets = [
        { a: '小明', b: '小红', c: '小刚', rel: '高', ans: '小刚',
          explain: '小明比小红高，小红比小刚高，所以小刚最矮。' },
        { a: '小华', b: '小丽', c: '小强', rel: '高', ans: '小强',
          explain: '小华比小丽高，小丽比小强高，所以小强最矮。' },
        { a: '哥哥', b: '姐姐', c: '弟弟', rel: '高', ans: '弟弟',
          explain: '哥哥比姐姐高，姐姐比弟弟高，所以弟弟最矮。' }
      ];
      var s = sets[randInt(r, 0, sets.length - 1)];
      return CQ({ kind: '比高矮', answer: s.ans,
        stem: s.a + '比' + s.b + '高，' + s.b + '比' + s.c + '高，谁最矮？',
        distractors: [s.a, s.b, '一样高'],
        explain: s.explain }, r, max);
    },
    /* 7. 爬楼梯（楼层与段数） */
    function (r, max) {
      var t = randInt(r, 2, 4), ans = t * 2;
      return CQ({ kind: '爬楼梯', answer: ans,
        stem: '从 1 楼走到 3 楼用 ' + t + ' 分钟，照这样从 1 楼走到 5 楼用几分钟？',
        distractors: [t, t + 2, t * 3, ans + 2, ans - 1],
        explain: '1 楼到 3 楼走 2 层，1 楼到 5 楼走 4 层，是 2 倍：' + t + ' × 2 = ' + ans + ' 分钟。' }, r, max);
    },
    /* 8. 对折求原长 */
    function (r, max) {
      var n = randInt(r, 2, Math.max(2, Math.floor(max / 2))), ans = n * 2;
      if (ans > max) return null;
      return CQ({ kind: '对折', answer: ans,
        stem: '一根绳子对折一次后长 ' + n + ' 米，这根绳子原来长几米？',
        distractors: [n, n + 1, ans + 2, ans - 1, n * 3],
        explain: '对折一次，原长是折后长度的 2 倍：' + n + ' × 2 = ' + ans + ' 米。' }, r, max);
    },
    /* 9. 星期推算 */
    function (r, max) {
      var names = ['一', '二', '三', '四', '五', '六', '日'];
      var d = randInt(r, 0, 6), k = randInt(r, 2, 6);
      var idx = (d + k) % 7, ans = names[idx];
      var walk = [];
      for (var i = 1; i <= k; i++) walk.push(names[(d + i) % 7]);
      return CQ({ kind: '星期推算', answer: '星期' + ans,
        stem: '今天是星期' + names[d] + '，再过 ' + k + ' 天是星期几？',
        distractors: names.filter(function (x) { return x !== ans; }).slice(0, 4).map(function (x) { return '星期' + x; }),
        explain: '从星期' + names[d] + '往后数 ' + k + ' 天：' + walk.join('、') +
          '，所以是星期' + ans + '。' }, r, 99);
    },
    /* 10. 拼正方形 */
    function () {
      return CQ({ kind: '拼图形', answer: 7,
        stem: '用同样长的小棒摆 2 个正方形，拼在一起最少要几根？',
        distractors: [8, 6, 9, 10],
        explain: '两个正方形拼在一起会共用 1 根小棒，4 + 4 − 1 = 7 根。' }, rgn, 10);
    }
  ];

  /* ---------------- 铺题 ---------------- */
  var USED = {};      // 跨册题干去重：同一道题不要在一上、一下各出一次

  function pack(items, o) {
    var r = rng(o.seed), out = [], guard = 0, want = o.count || 1;
    var pool = shuffled(r, items.map(function (f, i) { return i; }));
    while (out.length < want && guard++ < 400) {
      var at = guard <= items.length ? pool[guard - 1] : randInt(r, 0, items.length - 1);
      var it = items[at](r, o.max);
      if (!it || USED[it.stem] || it.stem.length > 34) continue;
      if (it.options) {
        if (it.options.length < 4 || new Set(it.options).size !== 4) continue;
        var ans = String(it.options[it.answer]);
        if (/^\d+$/.test(ans) && (it.stem.match(/\d+/g) || []).indexOf(ans) >= 0) continue;
      }
      var nums = (it.stem + ' ' + (it.options || []).join(' ')).match(/\d+/g) || [];
      if (nums.some(function (s) { return Number(s) > o.max; })) continue;
      USED[it.stem] = 1;
      out.push(it);
    }
    return out;
  }

  /* rules = [{unit:'u2', max:10, apply:1, challenge:2, from:0}, ...] */
  function decorate(units, rules) {
    (rules || []).forEach(function (rule) {
      var u = null;
      for (var i = 0; i < units.length; i++) if (units[i].id === rule.unit) { u = units[i]; break; }
      if (!u) return;
      u.nodes.forEach(function (n, ni) {
        if (ni < (rule.from || 0)) return;
        var adds = [];
        if (rule.apply) {
          adds = adds.concat(pack(APPLY, {
            max: rule.max || 10, count: rule.apply,
            seed: 'ap-' + u.id + '-' + n.id
          }));
        }
        if (rule.challenge) {
          adds = adds.concat(pack(CHALLENGE, {
            max: rule.max || 10, count: rule.challenge,
            seed: 'ch2-' + u.id + '-' + n.id
          }));
        }
        if (!adds.length) return;
        n.items = n.items.concat(adds);
        n.apply = n.items.filter(function (it) { return it.ext === 'apply'; }).length;
        n.challenge = n.items.filter(function (it) { return it.type === 'challenge'; }).length;
      });
    });
  }

  w.SXHard = {
    decorate: decorate, APPLY: APPLY, CHALLENGE: CHALLENGE,
    stats: function () { return { apply: APPLY.length, challenge: CHALLENGE.length }; }
  };
})(window);
