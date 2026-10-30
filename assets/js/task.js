/* 任务引擎：今日任务生成 / 场次推进 / 打卡判定 / 欠账补练 */
(function (w) {
  'use strict';

  var PACE = {
    light: { chars: 4, pinyin: 5, math: 4, min: 20, label: '轻（约 20 分钟）' },
    standard: { chars: 5, pinyin: 6, math: 5, min: 30, label: '标准（约 30 分钟）' },
    plus: { chars: 5, pinyin: 6, math: 5, min: 40, label: '加量（约 40 分钟）' }
  };

  function paceCfg() {
    var st = w.Store.settings();
    return PACE[st.pace] || PACE.standard;
  }

  function moduleOf(itemId) {
    var it = w.Content.item(itemId);
    return it ? it.module : null;
  }

  function takeModule(items, module, n) {
    var out = [];
    for (var i = 0; i < items.length && out.length < n; i++) {
      if (items[i].module === module) out.push(items[i].id);
    }
    return out;
  }

  /* 内容用尽后的巩固题：优先错题，其次从已学节点抽 */
  function consolidate(module, n, upto) {
    var out = [];
    var due = w.Store.dueMistakes(U.today()).filter(function (r) { return moduleOf(r.itemId) === module; });
    due.slice(0, n).forEach(function (r) { out.push(r.itemId); });
    if (out.length >= n) return out.slice(0, n);

    var subject = (module === 'math') ? 'math' : 'chinese';
    var pool = [];
    w.Content.allNodes(subject).forEach(function (node, idx) {
      if (upto && idx >= upto) return;
      node.items.forEach(function (it) { if (it.module === module && out.indexOf(it.id) < 0) pool.push(it.id); });
    });
    if (!pool.length) {
      w.Content.allNodes(subject).forEach(function (node) {
        node.items.forEach(function (it) { if (it.module === module && out.indexOf(it.id) < 0) pool.push(it.id); });
      });
    }
    U.shuffle(pool).slice(0, n - out.length).forEach(function (id) { out.push(id); });
    return out;
  }

  /* 错题复习插题：替换目标模块中的题位 */
  function injectReview(target, module, maxN) {
    if (!w.Store.settings().review) return 0;
    var due = w.Store.dueMistakes(U.today())
      .filter(function (r) { return moduleOf(r.itemId) === module; });
    var used = 0;
    due.slice(0, maxN).forEach(function (r) {
      if (target.indexOf(r.itemId) >= 0) return;
      // 替换掉最后一个非错题项
      for (var i = target.length - 1; i >= 0; i--) {
        var it = w.Content.item(target[i]);
        if (it && it._isReview) continue;
        if (target.indexOf(r.itemId) >= 0) return;
        target[i] = r.itemId;
        used++;
        return;
      }
    });
    return used;
  }

  function nextWriting(cursor, count) {
    var table = w.Content.writingTable();
    if (!table.length || count <= 0) return { chars: [], cursor: cursor };
    var out = [], c = cursor;
    for (var i = 0; i < count; i++) {
      out.push(table[c % table.length].c);
      c++;
    }
    return { chars: out, cursor: c };
  }

  function cursorVal(c) { return (c.unit || 0) * 1000 + (c.node || 0); }

  function maxCursor(a, b) {
    return cursorVal(b) > cursorVal(a) ? { unit: b.unit, node: b.node } : { unit: a.unit, node: a.node };
  }

  /* 生成一天的场次计划（不落盘） */
  function buildPlan(date) {
    var p = w.Store.progress();
    var st = w.Store.settings();
    var cfg = paceCfg();
    var count = w.Schedule.plannedSessions(p, date, st);

    var ywCur = { unit: p.yw.unit, node: p.yw.node };
    var sxCur = { unit: p.sx.unit, node: p.sx.node };
    var wCur = p.writingCursor || 0;
    var sessions = [];

    for (var i = 0; i < count; i++) {
      var isCatchup = i > 0;
      var ywNode = w.Content.nodeAtCursor('chinese', ywCur);
      var sxNode = w.Content.nodeAtCursor('math', sxCur);

      var chars = ywNode ? takeModule(ywNode.items, 'chars', cfg.chars) : consolidate('chars', cfg.chars, null);
      var pinyin = ywNode ? takeModule(ywNode.items, 'pinyin', cfg.pinyin) : consolidate('pinyin', cfg.pinyin, null);
      var math = sxNode ? takeModule(sxNode.items, 'math', cfg.math) : consolidate('math', cfg.math, null);

      // 插错题复习（数学 2 题、语文各 1 题）
      injectReview(math, 'math', 2);
      injectReview(chars, 'chars', 1);
      injectReview(pinyin, 'pinyin', 1);

      // 加量模式追加 2 题巩固
      if (st.pace === 'plus') {
        consolidate('math', 2, null).forEach(function (id) {
          if (math.indexOf(id) < 0) math.push(id);
        });
      }

      var wCount = st.charsPerDay || cfg.chars;
      if (st.pace === 'light') wCount = Math.min(wCount, 3);
      if (isCatchup) wCount = st.catchupWriting ? Math.min(2, wCount) : 0;
      var wr = nextWriting(wCur, wCount);
      wCur = wr.cursor;

      var nextYw = ywNode ? (w.Content.advance('chinese', ywCur) || ywCur) : ywCur;
      var nextSx = sxNode ? (w.Content.advance('math', sxCur) || sxCur) : sxCur;
      if (ywNode) ywCur = nextYw;
      if (sxNode) sxCur = nextSx;

      sessions.push({
        slot: i,
        type: isCatchup ? 'catchup' : 'new',
        status: 'todo',
        yw: ywNode ? { unit: ywNode.unit, node: ywNode.node, key: ywNode.key, title: ywNode.title, lesson: ywNode.lesson, unitName: ywNode.unitName } : null,
        sx: sxNode ? { unit: sxNode.unit, node: sxNode.node, key: sxNode.key, title: sxNode.title, lesson: sxNode.lesson, unitName: sxNode.unitName } : null,
        items: { chars: chars, pinyin: pinyin, math: math },
        chars: wr.chars,
        writing: { slots: wr.chars.length },
        idx: 0,
        answers: {},
        ms: 0,
        correct: 0,
        total: chars.length + pinyin.length + math.length,
        next: { yw: nextYw, sx: nextSx, w: wr.cursor },
        estMin: isCatchup ? Math.round(cfg.min * 0.8) : cfg.min
      });
    }
    return sessions;
  }

  /* 确保今天的计划已生成 */
  function ensure(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    if (day && day.plan && day.plan.length) return day;
    var plan = buildPlan(date);
    day = w.Store.saveDay(date, { plan: plan, done: false, startedAt: null });
    return day;
  }

  /* 重建（内容/节奏/进度被外部改动后） */
  function rebuild(date) {
    date = date || U.today();
    var plan = buildPlan(date);
    return w.Store.saveDay(date, { plan: plan, done: false, startedAt: null });
  }

  function sessionItems(s) {
    var ids = (s.items.chars || []).concat(s.items.pinyin || [], s.items.math || []);
    return w.Content.items(ids);
  }

  function sessionDone(s) { return s.status === 'done'; }

  /* 判断某场次是否可打卡 */
  function canCheckin(s) {
    var answered = Object.keys(s.answers || {}).length;
    if (answered < (s.items.chars.length + s.items.pinyin.length + s.items.math.length)) return false;
    if (s.chars && s.chars.length && !s.photoId) return false;
    return true;
  }

  /* 完成一场：写回答题结果、推进进度、结算星星 */
  function completeSlot(date, slot, payload) {
    var day = w.Store.day(date);
    if (!day) return null;
    var s = day.plan[slot];
    if (!s) return null;

    var items = sessionItems(s);
    var correct = 0, answered = 0;
    items.forEach(function (it) {
      var a = (s.answers || {})[it.id];
      if (!a) return;
      answered++;
      if (a.correct) correct++;
    });

    s.status = 'done';
    s.ms = (payload && payload.ms) || s.ms || 0;
    s.correct = correct;
    s.answered = answered;
    s.total = items.length;
    s.score = items.length ? correct / items.length : 0;
    s.finishedAt = Date.now();
    s.photoId = s.photoId || (payload && payload.photoId) || null;
    day.done = day.plan.every(function (x) { return x.status === 'done' && (x.chars.length ? !!x.photoId : true); });
    if (day.done && !day.finishedAt) day.finishedAt = Date.now();
    w.Store.saveDay(date, day);

    // 推进进度（取较大游标，避免乱序完成回退）
    var p = w.Store.progress();
    var yw = maxCursor(p.yw, s.next.yw || p.yw);
    var sx = maxCursor(p.sx, s.next.sx || p.sx);
    var wc = Math.max(p.writingCursor || 0, (s.next.w || 0));
    w.Store.saveProgress({
      yw: yw, sx: sx, writingCursor: wc,
      sessionsDone: (p.sessionsDone || 0) + 1
    });

    // 星星：答对 1 星 + 交作业 2 星
    var gain = correct + (s.photoId ? 2 : 0);
    w.Store.addStars(gain);
    s.stars = gain;

    w.Store.saveDay(date, day);
    return { stars: gain, correct: correct, total: items.length };
  }

  /* 今日概览 */
  function summary(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    var st = w.Store.settings();
    var p = w.Store.progress();
    var backlog = w.Schedule.backlog(p, date);
    var dayType = w.Schedule.dayType(date);
    var out = {
      date: date, dayType: dayType, dayTypeLabel: w.Schedule.typeLabel(dayType),
      holiday: w.Schedule.holidayName(date),
      capacity: w.Schedule.capacity(date, st),
      backlog: backlog,
      planned: day ? (day.plan || []).length : 0,
      doneCount: day ? (day.plan || []).filter(function (s) { return s.status === 'done'; }).length : 0,
      allDone: day ? !!day.done : false,
      day: day
    };
    out.eta = w.Schedule.catchupEta(p, date, st);
    return out;
  }

  function writingCharsOf(s) { return s.chars || []; }

  w.Task = {
    PACE: PACE, paceCfg: paceCfg,
    buildPlan: buildPlan, ensure: ensure, rebuild: rebuild,
    sessionItems: sessionItems, canCheckin: canCheckin, completeSlot: completeSlot,
    summary: summary, writingCharsOf: writingCharsOf,
    maxCursor: maxCursor, consolidate: consolidate
  };
})(window);
