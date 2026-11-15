/* 期中 / 期末考：排期 + 组卷
   · 排期按学校日历：上册期中 11 月 2 日、期末次年 1 月 11 日；
     下册期中 4 月 20 日、期末 6 月 22 日（都是周一）。
   · 期中只考前半册，期末考整册；题目从已学节点里抽，绝不超进度。
   · 组卷固定：语文 10 题 + 数学 10 题，每题 5 分，满分 100。
   · 同一册同一场考试永远出同一套卷（种子固定），重考也是这套。 */
(function (w) {
  'use strict';

  var PLAN = {
    'yw-1a': { label: '一年级上册', mid: [11, 2], final: [1, 11] },   // 期末在次年 1 月
    'yw-1b': { label: '一年级下册', mid: [4, 20], final: [6, 22] }
  };

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
  function shuffled(r, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* 本次学期对应的年份：9 月之后算新学年 */
  function schoolYear(bookId, today) {
    var y = Number(String(today).slice(0, 4));
    var m = Number(String(today).slice(5, 7));
    if (bookId === 'yw-1b') return m >= 8 ? y + 1 : y;
    return m >= 8 ? y : y - 1;
  }

  function dateOf(bookId, kind, sy) {
    var p = PLAN[bookId] || PLAN['yw-1a'];
    var md = p[kind];
    var y = sy;
    if (bookId !== 'yw-1b' && kind === 'final') y = sy + 1;
    return y + '-' + U.pad(md[0]) + '-' + U.pad(md[1]);
  }

  /* 考试状态：open = 可以考（含补考），upcoming = 还有几天，early = 还早，closed = 过期太久 */
  function stateOf(date, today, kind) {
    var gap = U.diffDays(date, today);      // 正数 = 已经过了几天
    if (kind === 'mid') {
      if (gap < -14) return 'early';
      if (gap < 0) return 'upcoming';
      return gap <= 90 ? 'open' : 'closed';
    }
    if (gap < -10) return 'early';
    if (gap < 0) return 'upcoming';
    return gap <= 45 ? 'open' : 'closed';
  }

  /* 当前册次的两场考试（期中 / 期末），附状态与成绩 */
  function schedule(today, bookId) {
    today = today || U.today();
    var kid = w.Store.kids.active();
    bookId = bookId || (kid && kid.bookId) || 'yw-1a';
    if (!PLAN[bookId]) bookId = 'yw-1a';
    var sy = schoolYear(bookId, today);
    var out = [];
    ['mid', 'final'].forEach(function (kind) {
      /* 前后各看一学年，取最近一场 */
      var best = null;
      [sy - 1, sy, sy + 1].forEach(function (y) {
        var d = dateOf(bookId, kind, y);
        var st = stateOf(d, today, kind);
        if (st === 'closed') return;
        if (!best || Math.abs(U.diffDays(d, today)) < Math.abs(U.diffDays(best.date, today))) {
          best = { kind: kind, date: d, state: st };
        }
      });
      if (!best) return;
      var key = bookId + '|' + kind + '|' + best.date;
      best.key = key;
      best.bookId = bookId;
      best.label = kind === 'mid' ? '期中考试' : '期末考试';
      best.bookLabel = PLAN[bookId].label;
      best.record = w.Store.examOf(key);
      if (best.record) best.state = 'done';
      out.push(best);
    });
    return out;
  }

  /* 当前最该做的一场：已开放且没考的；没有就返回 null */
  function due(today, bookId) {
    var list = schedule(today, bookId).filter(function (x) { return x.state === 'open'; });
    return list[0] || null;
  }

  /* ---------------- 组卷 ---------------- */
  function bookOf(bookId) {
    var pair = w.Content.BOOK_PAIRS[bookId] || w.Content.BOOK_PAIRS['yw-1a'];
    return { chinese: w.Content.book(pair.chinese), math: w.Content.book(pair.math) };
  }

  function allItems(book) {
    var out = [];
    (book ? book.units : []).forEach(function (u) {
      u.nodes.forEach(function (n) { out = out.concat(n.items); });
    });
    return out;
  }

  /* 只取到游标为止的题；mid 再砍掉后半册 */
  function upto(book, cursor, frac) {
    var out = [], total = 0;
    (book ? book.units : []).forEach(function (u, ui) { total += u.nodes.length; });
    var limit = total;
    if (frac && frac < 1) limit = Math.max(1, Math.round(total * frac));
    var idx = 0, stop = false;
    (book ? book.units : []).forEach(function (u, ui) {
      if (stop) return;
      u.nodes.forEach(function (n, ni) {
        if (stop) return;
        if (cursor && (ui > cursor.unit || (ui === cursor.unit && ni > cursor.node))) { stop = true; return; }
        if (idx >= limit) { stop = true; return; }
        out = out.concat(n.items);
        idx++;
      });
    });
    return out;
  }

  function pick(pool, n, accept, r) {
    var cand = pool.filter(function (it) { return !accept || accept(it); });
    return shuffled(r, cand).slice(0, n);
  }

  /* 数字答案合成 4 个选项（应用题本来要手写答案，考试统一做成选择题） */
  function numericOptions(answer, r) {
    var right = String(answer), seen = {}, opts = [right];
    seen[right] = 1;
    var deltas = shuffled(r, [1, -1, 2, -2, 3, -3, 5, 10]);
    deltas.forEach(function (d) {
      if (opts.length >= 4) return;
      var v = Number(answer) + d;
      if (v < 0 || seen[String(v)]) return;
      seen[String(v)] = 1;
      opts.push(String(v));
    });
    var k = 1;
    while (opts.length < 4) {
      var v2 = Number(answer) + k;
      if (!seen[String(v2)]) { seen[String(v2)] = 1; opts.push(String(v2)); }
      k++;
    }
    opts = shuffled(r, opts);
    return { options: opts, answer: opts.indexOf(right) };
  }

  function wrap(it, r) {
    if (it.options && it.options.length >= 2) {
      return { item: it, options: it.options.slice(), answer: it.answer, score: 5 };
    }
    var o = numericOptions(it.answer, r);
    return { item: it, options: o.options, answer: o.answer, score: 5 };
  }

  function build(bookId, kind, cursor, today) {
    today = today || U.today();
    var books = bookOf(bookId);
    /* 考试范围：期中 = 前半册，期末 = 整册。
       先取「孩子已经学到」的部分；不够 20 题时，再从这个范围里还没学到的
       课文补——考试考的是半个学期的内容，不因为进度慢就出不满 100 分。 */
    var frac = kind === 'mid' ? 0.55 : 1;
    var scopeYw = upto(books.chinese, null, frac);
    var scopeSx = upto(books.math, null, frac);
    var learntYw = upto(books.chinese, cursor && cursor.yw, frac);
    /* 阅读理解不绑某一课：期中还没学到「阅读单元」时，也从整册里借两篇短文 */
    var readPool = allItems(books.chinese).filter(function (it) { return it.ext === 'reading'; });
    var learntSx = upto(books.math, cursor && cursor.sx, frac);
    var r = rng('exam|' + bookId + '|' + kind);
    var used = {};

    function take(first, fallback, n, accept) {
      var out = [];
      function scan(pool) {
        var list = shuffled(r, pool.filter(function (it) { return !accept || accept(it); }));
        for (var i = 0; i < list.length && out.length < n; i++) {
          if (used[list[i].stem]) continue;
          used[list[i].stem] = 1;
          out.push(list[i]);
        }
      }
      scan(first);
      if (out.length < n && fallback) scan(fallback);
      return out;
    }

    /* 语文：阅读 2、词义/成语 3、认字 3、拼音 2 */
    var yw = [];
    /* 阅读两问必须来自同一篇短文，孩子读一遍就能连答两题 */
    var readGroups = {};
    readPool.forEach(function (it) {
      var t = (it.fig && it.fig.title) || '';
      (readGroups[t] = readGroups[t] || []).push(it);
    });
    var readTitles = shuffled(r, Object.keys(readGroups)).filter(function (t) { return readGroups[t].length >= 2; });
    /* 优先选已经学过的那几篇 */
    var learntRead = {};
    learntYw.forEach(function (it) { if (it.ext === 'reading' && it.fig) learntRead[it.fig.title] = 1; });
    readTitles.sort(function (a, b) { return (learntRead[b] ? 1 : 0) - (learntRead[a] ? 1 : 0); });
    if (readTitles.length) {
      readGroups[readTitles[0]].slice(0, 2).forEach(function (it) {
        if (used[it.stem]) return;
        used[it.stem] = 1;
        yw.push(it);
      });
    }
    yw = yw.concat(take(learntYw, scopeYw, 3, function (it) { return it.ext === 'antonym' || it.ext === 'synonym' || it.ext === 'idiom'; }));
    yw = yw.concat(take(learntYw, scopeYw, 3, function (it) { return it.module === 'chars' && !it.ext; }));
    yw = yw.concat(take(learntYw, scopeYw, 2, function (it) { return it.module === 'pinyin'; }));
    if (yw.length < 10) yw = yw.concat(take(learntYw, scopeYw, 10 - yw.length));

    /* 数学：应用题 3、挑战 3、比较式 2、常规 2 */
    var sx = [];
    sx = sx.concat(take(learntSx, scopeSx, 3, function (it) { return it.ext === 'apply'; }));
    sx = sx.concat(take(learntSx, scopeSx, 3, function (it) { return it.type === 'challenge'; }));
    sx = sx.concat(take(learntSx, scopeSx, 2, function (it) { return it.type === 'cmp'; }));
    sx = sx.concat(take(learntSx, scopeSx, 2, function (it) { return it.type !== 'challenge' && it.type !== 'cmp' && it.type !== 'unit' && it.ext !== 'apply'; }));
    if (sx.length < 10) sx = sx.concat(take(learntSx, scopeSx, 10 - sx.length));

    /* 前半张语文、后半张数学，跟学校卷子的顺序一致 */
    var questions = yw.concat(sx).slice(0, 20).map(function (it) { return wrap(it, r); });
    var entry = schedule(today, bookId).filter(function (x) { return x.kind === kind; })[0];
    return {
      key: entry ? entry.key : bookId + '|' + kind,
      kind: kind, bookId: bookId,
      date: entry ? entry.date : today,
      title: (kind === 'mid' ? '期中考试' : '期末考试'),
      subtitle: PLAN[bookId].label + ' · ' + (kind === 'mid' ? '前半册' : '整册'),
      questions: questions,
      total: questions.length * 5
    };
  }

  /* 判分：answers = {题号: 选项下标} */
  function grade(paper, answers) {
    var correct = 0, wrong = [];
    paper.questions.forEach(function (q, i) {
      if (Number(answers[i]) === Number(q.answer)) correct++;
      else wrong.push(i);
    });
    var score = correct * 5;
    return { correct: correct, total: paper.questions.length, score: score, wrong: wrong, full: paper.total };
  }

  function submit(paper, answers) {
    var g = grade(paper, answers);
    var rec = {
      key: paper.key, kind: paper.kind, bookId: paper.bookId, date: paper.date,
      title: paper.title, score: g.score, full: g.full,
      correct: g.correct, total: g.total, answers: answers,
      wrong: g.wrong.map(function (i) { return paper.questions[i].item.id; }),
      at: Date.now()
    };
    w.Store.saveExam(rec);
    return rec;
  }

  w.ExamGen = {
    PLAN: PLAN, schedule: schedule, due: due, build: build,
    grade: grade, submit: submit, stateOf: stateOf
  };
})(window);
