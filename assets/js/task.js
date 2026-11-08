/* 任务引擎：今日任务生成 / 场次推进 / 打卡判定 / 欠账补练 */
(function (w) {
  'use strict';

  /* 每场题量：20 分钟 18 题 / 30 分钟 25 题 / 40 分钟 35 题。
     mix 是三块各几题，加起来就是 total；一个节点只有 5 认字 + 6 拼音，
     多出来的题从已经学过的节点里稳定轮换补齐（不烧新内容、也不出没学过的题）。 */
  var PACE = {
    light: { total: 18, mix: { chars: 5, pinyin: 6, math: 7 }, writing: 3, min: 20, label: '轻（约 20 分钟 · 18 题）' },
    standard: { total: 25, mix: { chars: 7, pinyin: 8, math: 10 }, writing: 4, min: 30, label: '标准（约 30 分钟 · 25 题）' },
    plus: { total: 35, mix: { chars: 9, pinyin: 11, math: 15 }, writing: 5, min: 40, label: '加量（约 40 分钟 · 35 题）' }
  };

  /* 已下架的题型 + 每场限流：
     · 问偏旁的题整类下架（题库里已换成「选字填空」，这里兼容旧计划里的残留 id）
     · 「第一笔 / 第 N 笔 / 最后一笔」是同一类太简单的笔顺题，一场合计最多 1 道
     少出来的题位不丢，全数转给数学计算题，每场总题量仍是 18 / 25 / 35。 */
  var BANNED_CHAR_SKILL = /^认字\.选偏旁$/;
  var STROKE_SKILL = /^认字\.笔顺(起笔|中段|末笔)$/;
  var STROKE_LIMIT = 1;
  var MATH_CALC = /[+＋\-－=＝]|算一算|一共|还剩|得数|加上|减去|比多|比少|再添|合起来|去掉|剩/;

  function isBannedChar(it) { return BANNED_CHAR_SKILL.test((it && it.skill) || ''); }
  function isStrokeChar(it) { return STROKE_SKILL.test((it && it.skill) || ''); }
  function isCalcMath(it) { return it.type !== 'cmp' && it.type !== 'challenge' && it.type !== 'unit' && MATH_CALC.test(it.stem || ''); }
  /* 补位池不收思维挑战题、也不收单元知识点题：这两类都由 pickMath
     每场定量带出，放进补位池会被 prefer 当计算题反复抽中，一场堆太多。 */
  function isPlainMath(it) { return it.type !== 'cmp' && it.type !== 'challenge' && it.type !== 'unit'; }

  /* 同一天不能出「完全重复」的题。只按 id 去重不够：题库里有不同 id、
     相同题干的题（跨册复习题、错题本里另一册的旧题），孩子看到就是原题。
     签名 = 题干 + 选项，不含图（题干一样但换张图，也会被当成重复拦掉）。 */
  function sigOf(id) {
    var it = w.Content.item(id);
    if (!it) return '@' + id;
    return '@' + String(it.stem || '').replace(/\s+/g, '') + '|' +
      (it.options || []).join('|');
  }
  function blockedByDay(id, dayUsed) {
    if (!dayUsed) return false;
    return !!(dayUsed[id] || dayUsed[sigOf(id)]);
  }
  function markUsed(map, id) { map[id] = 1; map[sigOf(id)] = 1; }
  function isUsed(map, id) { return !!(map[id] || map[sigOf(id)]); }

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

  /* 固定种子的下标：同一天同一场每次算出来的巩固题都一样，预览和实做不会跳题 */
  function seededIndex(s, mod) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003;
    return mod ? h % mod : h;
  }

  /* 补位题的数域上限（只对数学）：跟着教材走，别把没学过的数借进来。
     上册：准备课/5 以内 → 5，6~10 与图形 → 10，11~20 之后 → 20；
     下册：退位减法/分类 → 20，100 以内数的认识之后 → 100。 */
  function numCap(subject, cur) {
    if (subject !== 'math') return Infinity;
    var bid = '';
    try { bid = (w.Store.progress() || {}).bookId || ''; } catch (e) { }
    var table = bid.indexOf('1b') >= 0
      ? [20, 20, 20, 100, 100, 100, 100, 100]
      : [5, 5, 10, 10, 20, 20, 20];
    return table[cur.unit] || 10;
  }

  /* 一个节点只有 5 认字 + 6 拼音，节奏要的题更多时，从这里补齐：
     先在本册「已经学过的节点」里按固定种子轮换抽（等于顺带复习），
     还不够（刚开学那几天）就顺着教材往下取最近的几课，不跳到很远的课文。
     dayUsed 记着当天前面场次已经出过的题：以前补位只在本场去重，
     同一天做 3 场时补位池又小又固定，尾几道会一场一场原样重复，这里跨场一起排掉。 */
  function fillModule(ids, module, target, date, slot, subject, cur, accept, prefer, dayUsed) {
    if (ids.length >= target) return ids.slice(0, target);
    var nodes = w.Content.allNodes(subject);
    var curIdx = nodes.length;   // 游标已经走完全册时，整册都算「学过」
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].unit === cur.unit && nodes[i].node === cur.node) { curIdx = i; break; }
    }
    /* prefer 把补位池分两级：先取优先题型（比如计算题），不够再取其它，
       一次遍历就够，家长按天预览连推一年也不会卡。
       未学部分只借到「下一个单元」为止：整册一起轮换会跳到 11~20 甚至 100 以内，
       孩子还没学到那些数；已学的课文则整册都算复习，可以放心抽。
       更远的课文只留作「题池被当天多场耗光」时的最后兜底。 */
    var UPCOMING_SPAN = 12;
    var curUnit = nodes[curIdx] ? nodes[curIdx].unit
      : (nodes.length ? nodes[nodes.length - 1].unit : 0);
    var cap = numCap(subject, cur);
    var learned = [], learned2 = [], upcoming = [], upcoming2 = [], farPool = [];
    nodes.forEach(function (n, ni) {
      var tooFar = ni >= curIdx && (ni >= curIdx + UPCOMING_SPAN || n.unit > curUnit + 1);
      n.items.forEach(function (it) {
        if (it.module !== module) return;
        if (accept && !accept(it)) return;   // 只从允许的题型里补位
        if (tooFar) { farPool.push(it.id); return; }
        /* 借未学课文的题时，题干里不能出现本单元还没学到的数
           （u3 学图形时借到 u4 的「15 里面有几个十」就是超进度） */
        if (ni >= curIdx && cap !== Infinity) {
          var nums = (it.stem || '').match(/\d+/g) || [];
          if (nums.some(function (s) { return Number(s) > cap; })) return;
        }
        var top = !prefer || prefer(it);
        (ni < curIdx
          ? (top ? learned : learned2)
          : (top ? upcoming : upcoming2)).push(it.id);
      });
    });
    var used = {};
    if (dayUsed) {
      for (var dk in dayUsed) if (Object.prototype.hasOwnProperty.call(dayUsed, dk)) used[dk] = 1;
    }
    ids.forEach(function (id) { markUsed(used, id); });
    var out = ids.slice(0, target);
    var seed = date + '#' + slot + '#' + module;
    function rotate(pool, s) {
      for (var k = 0; k < pool.length && out.length < target; k++) {
        var id = pool[(s + k) % pool.length];
        if (isUsed(used, id)) continue;
        markUsed(used, id); out.push(id);
      }
    }
    /* 四级池都按种子轮换，不再有「固定顺序池」——以前 upcoming 是顺序取，
       每场尾部补的都是同一批题，这才是「最后几道一模一样」的直接原因 */
    rotate(learned, seededIndex(seed, learned.length || 1));
    rotate(upcoming, seededIndex(seed + '#u', upcoming.length || 1));
    rotate(learned2, seededIndex(seed + '#2', learned2.length || 1));
    rotate(upcoming2, seededIndex(seed + '#u2', upcoming2.length || 1));
    /* 场次特别多、窗口内题池被用尽时才走到这里：先挑窗口内当天没出过的，
       再复用窗口内的（宁可重复也不出没学过的），最后才借更远的课文，
       按这个顺序既保证每场题量不变，也尽量不重题、不超进度 */
    if (out.length < target) {
      var relax = {};
      out.forEach(function (id) { markUsed(relax, id); });
      var near = learned.concat(upcoming, learned2, upcoming2);
      function sweep(pool, skipUsed) {
        for (var k = 0; k < pool.length && out.length < target; k++) {
          var id = pool[k];
          if (isUsed(relax, id)) continue;
          if (skipUsed && blockedByDay(id, dayUsed)) continue;
          markUsed(relax, id); out.push(id);
        }
      }
      sweep(near, true);
      sweep(near, false);
      sweep(farPool, true);
      sweep(farPool, false);
    }
    return out;
  }

  /* 数学内容全走完后是从全册抽巩固题，随机抽不一定抽到比较式填数，
     这里兜一下：没有就换一道进去（替换而不是追加，题量才不会变），保证每个练习都练到 */
  function ensureCmp(ids, date, slot, dayUsed, cur) {
    var has = false;
    ids.forEach(function (id) { var it = w.Content.item(id); if (it && it.type === 'cmp') has = true; });
    if (has || !ids.length) return ids;
    /* 只从学过的课文里挑：以前从全册抽，刚学 5 以内时会塞进
       「□ − 3 < 14」这种 20 以内的题。还没学到比较式的课文就不硬塞。 */
    var nodes = w.Content.allNodes('math');
    var curIdx = nodes.length - 1;
    for (var k = 0; k < nodes.length; k++) {
      if (nodes[k].unit === cur.unit && nodes[k].node === cur.node) { curIdx = k; break; }
    }
    var pool = [];
    nodes.forEach(function (node, ni) {
      if (ni > curIdx) return;
      node.items.forEach(function (it) {
        if (it.type === 'cmp' && !blockedByDay(it.id, dayUsed)) pool.push(it.id);
      });
    });
    if (!pool.length) return ids;
    var s = date + '#' + slot, h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 99991;
    var out = ids.slice();
    /* 别把更难的思维挑战题、单元知识点题替换掉 */
    var pos = 1;
    for (var j = 1; j < out.length; j++) {
      var cur = w.Content.item(out[j]);
      if (cur && cur.type !== 'challenge' && cur.type !== 'unit') { pos = j; break; }
    }
    out[pos] = pool[h % pool.length];
    return out;
  }

  /* 数学题挑选：常规题按原顺序取，带上本节点的「比较式填数」1~3 道、
     「思维挑战」1~2 道和「单元知识点题」1~2 道，插在中后段先热身再上难度。
     返回题数不超过 n，其余由 fillModule 补齐。dayUsed 里的题（当天别的场次
     出过，或题干与当天某题完全一样）直接跳过。 */
  function pickMath(items, n, dayUsed, seed) {
    var base = [], cmp = [], ch = [], unit = [];
    items.forEach(function (it) {
      if (blockedByDay(it.id, dayUsed)) return;
      if (it.type === 'cmp') cmp.push(it.id);
      else if (it.type === 'challenge') ch.push(it.id);
      else if (it.type === 'unit') unit.push(it.id);
      else if (it.module === 'math') base.push(it.id);
    });
    var wantCmp = Math.min(3, cmp.length, Math.max(1, Math.round(n / 5)));
    var wantCh = Math.min(2, ch.length, Math.max(1, Math.round(n / 8)));
    var wantUnit = Math.min(2, unit.length, Math.max(1, Math.round(n / 6)));
    var out = base.slice(0, Math.max(0, n - wantCmp - wantCh - wantUnit));
    cmp.slice(0, wantCmp).forEach(function (id, i) {
      out.splice(Math.min(1 + i * 2, out.length), 0, id);
    });
    ch.slice(0, wantCh).forEach(function (id, i) {
      out.splice(Math.min(3 + i * 3, out.length), 0, id);
    });
    /* 单元题按场次轮换起点：一课里的两道新题不会永远只出第一道 */
    var uStart = unit.length ? seededIndex(seed || 'unit', unit.length) : 0;
    for (var k = 0; k < wantUnit; k++) {
      out.splice(Math.min(5 + k * 3, out.length), 0, unit[(uStart + k) % unit.length]);
    }
    return out.slice(0, n);
  }

  /* 认字题过滤：偏旁题下架、笔顺类（第一笔 / 第 N 笔 / 最后一笔）每场合计最多 1 道。
     不足下限（认字题不能被掏空）就从已学课文补非笔顺题；
     剩下的缺口由 buildPlan 转成数学计算题。 */
  function trimChars(ids, minKeep, date, slot, cur, dayUsed) {
    var kept = [], strokes = 0;
    ids.forEach(function (id) {
      var it = w.Content.item(id);
      if (!it || isBannedChar(it)) return;
      if (isStrokeChar(it)) {
        if (strokes >= STROKE_LIMIT) return;
        strokes++;
      }
      kept.push(id);
    });
    if (kept.length < minKeep) {
      kept = fillModule(kept, 'chars', minKeep, date, slot, 'chinese', cur, function (it) {
        return !isBannedChar(it) && !isStrokeChar(it);
      }, null, dayUsed);
    }
    return kept;
  }

  /* 错题复习也遵守同样的限流，不能从后门塞回被下架的题 */
  function charReviewOk(id, list) {
    var it = w.Content.item(id);
    if (!it || isBannedChar(it)) return false;
    if (!isStrokeChar(it)) return true;
    var n = 0;
    list.forEach(function (x) { var t = w.Content.item(x); if (t && isStrokeChar(t)) n++; });
    return n < STROKE_LIMIT;
  }

  /* 内容用尽后的巩固题：优先错题，其次从已学节点抽。
     现在每场的常规题由 fillModule 稳定补齐，这个函数保留给外部按模块抽题用 */
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
  function injectReview(target, module, maxN, accept, dayUsed) {
    if (!w.Store.settings().review) return 0;
    var due = w.Store.dueMistakes(U.today())
      .filter(function (r) { return moduleOf(r.itemId) === module; });
    var used = 0;
    /* 错题是「后插入」的：本场的题此刻还没登记进 dayUsed，
       得另建一张本场题干表，否则会塞进一道和本场某题一模一样的题。 */
    var sigs = {};
    target.forEach(function (id) { sigs[sigOf(id)] = 1; });
    due.slice(0, maxN).forEach(function (r) {
      if (target.indexOf(r.itemId) >= 0) return;
      if (blockedByDay(r.itemId, dayUsed)) return;   // 别从复习后门塞回当天出过的题
      if (sigs[sigOf(r.itemId)]) return;             // 本场已经有这道完全一样的题
      if (accept && !accept(r.itemId, target)) return;
      // 替换掉最后一个非错题项
      for (var i = target.length - 1; i >= 0; i--) {
        var it = w.Content.item(target[i]);
        if (it && it._isReview) continue;
        if (target.indexOf(r.itemId) >= 0) return;
        delete sigs[sigOf(target[i])];
        target[i] = r.itemId;
        sigs[sigOf(r.itemId)] = 1;
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

  /* 生成一天的场次计划（不落盘）
     prog 可传入模拟用的进度副本：预览未来日期时会逐天推演，不能动到真实进度 */
  function buildPlan(date, prog) {
    var p = prog || w.Store.progress();
    var st = w.Store.settings();
    var cfg = paceCfg();
    var target = w.Schedule.capacity(date, st);            // 当天应完成场次
    var count = w.Schedule.plannedSessions(p, date, st);   // 目标 + 最多 catchupExtra 场补欠账
    var ywCur = { unit: p.yw.unit, node: p.yw.node };
    var sxCur = { unit: p.sx.unit, node: p.sx.node };
    var wCur = p.writingCursor || 0;
    var sessions = [];
    /* 当天已出过的题：同一天做多场时不能撞题，尤其是补位题池小的头几个单元 */
    var dayUsed = {};

    for (var i = 0; i < count; i++) {
      var isCatchup = i >= target;          // 超出当天目标的才算补练
      var isExtra = i > 0 && !isCatchup;    // 当天的第 2、3 场：正常新内容，写字不减半
      var ywNode = w.Content.nodeAtCursor('chinese', ywCur);
      var sxNode = w.Content.nodeAtCursor('math', sxCur);
      var fresh = function (id) { return !blockedByDay(id, dayUsed); };

      var chars = ywNode ? takeModule(ywNode.items, 'chars', cfg.mix.chars).filter(fresh) : [];
      var pinyin = ywNode ? takeModule(ywNode.items, 'pinyin', cfg.mix.pinyin).filter(fresh) : [];
      chars = fillModule(chars, 'chars', cfg.mix.chars, date, i, 'chinese', ywCur, null, null, dayUsed);
      pinyin = fillModule(pinyin, 'pinyin', cfg.mix.pinyin, date, i, 'chinese', ywCur, null, null, dayUsed);

      /* 偏旁题下架、笔顺题每场最多 1 道；少掉的认字题位全数转给数学。
         补位优先取「真要算」的加减题，计算题不够再用其它数学题兜底。 */
      var minChars = Math.max(3, Math.round(cfg.mix.chars * 0.6));
      chars = trimChars(chars, minChars, date, i, ywCur, dayUsed);
      var mathN = cfg.mix.math + (cfg.mix.chars - chars.length);
      var math = sxNode ? pickMath(sxNode.items, mathN, dayUsed, date + '#' + i) : [];
      math = fillModule(math, 'math', mathN, date, i, 'math', sxCur, isPlainMath, isCalcMath, dayUsed);
      math = ensureCmp(math, date, i, dayUsed, sxCur);

      // 插错题复习（数学 2 题、语文各 1 题）
      injectReview(math, 'math', 2, null, dayUsed);
      injectReview(chars, 'chars', 1, charReviewOk, dayUsed);
      injectReview(pinyin, 'pinyin', 1, null, dayUsed);

      /* 本场用过的题登记下来，后面的场次补位时整批避开；
         连「题干签名」一起记，杜绝不同 id、同一道题的完全重复 */
      [].concat(chars, pinyin, math).forEach(function (id) { markUsed(dayUsed, id); });

      var wCount = st.charsPerDay || cfg.writing;
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
        type: isCatchup ? 'catchup' : (isExtra ? 'extra' : 'new'),
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

  /* 计划结构版本：题型/题量改过就 +1，还没开始做的旧计划会自动重排，
     免得改完当天打开看到的还是老样子。
     v3 = 去掉送分认字题 + 三档题量改 18/25/35
     v4 = 偏旁题下架 + 笔顺题每场限 1 道 + 差额转数学计算题
     v5 = 同日多场不重题 + 比较式题干带算式 + 新增试卷同款思维挑战题 */
  var PLAN_VERSION = 6;

  function touched(day) {
    return (day.plan || []).some(function (s) {
      return s.status === 'done' || s.startedAt || Object.keys(s.answers || {}).length;
    });
  }

  /* 确保今天的计划已生成 */
  /* 当前该做第几场：第一个还没完成的场次；全部做完返回 -1。
     侧栏「开始练习 / 写字打卡」的链接不带 slot，之前一律落到 0，
     做完一场后从家长评分页回来就会又看见第一场，这里统一兜住。 */
  function currentSlot(date) {
    var day = w.Store.day(date || U.today());
    var plan = (day && day.plan) || [];
    for (var i = 0; i < plan.length; i++) {
      if (plan[i].status !== 'done') return i;
    }
    return -1;
  }

  /* 这一场的写字任务算不算完成：没有写字任务 / 交了照片 / 家长跳过都算。
     AI 有没有点评（reviewedAt、scores）与任务完成无关，不能拿它卡打卡。 */
  function writingOK(s) {
    if (!s) return false;
    return !s.chars || !s.chars.length || !!s.photoId || !!s.writingSkipped;
  }

  /* 「今天打过卡」= 至少完成一场（那场的写字任务也要完成）。
     和 day.done（当天所有场次都完成）分开：一场就计 1 天，但今日页仍要照常提示剩余场次。
     老数据没有 checkedIn 字段，用 done 兜底。 */
  function checkedIn(day) {
    if (!day) return false;
    if (day.checkedIn) return true;
    /* 老数据没这个字段：按 done 或「有一场做完且写字任务齐」兜底，升级后不用补数据 */
    if (day.done) return true;
    return (day.plan || []).some(function (s) {
      return s.status === 'done' && writingOK(s);
    });
  }

  function ensure(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    if (day && day.plan && day.plan.length) {
      if (day.planVersion !== PLAN_VERSION && !touched(day)) return rebuild(date);
      return day;
    }
    var prev = w.Store.day(date);
    var plan = buildPlan(date);
    day = w.Store.saveDay(date, {
      plan: plan, done: false, startedAt: null, planVersion: PLAN_VERSION,
      checkedIn: checkedIn(prev)
    });
    return day;
  }

  /* 重建（内容/节奏/进度被外部改动后）；重排题目不能把已经打过的卡抹掉 */
  function rebuild(date) {
    date = date || U.today();
    var old = w.Store.day(date);
    var plan = buildPlan(date);
    return w.Store.saveDay(date, {
      plan: plan, done: false, startedAt: null, planVersion: PLAN_VERSION,
      checkedIn: checkedIn(old)
    });
  }

  /* 预览缓存：同一天在同一次查看里反复进出（列表 ↔ 详情 ↔ 翻场次）要看到同一份题，
     否则每次 buildPlan 都会重新随机，家长会以为题目在跳。孩子做了一场后进度变了，key 自然失效。 */
  var PREVIEW_CACHE = {};

  function previewKey(date) {
    var p = w.Store.progress();
    var st = w.Store.settings();
    var kidId = (w.Store.kids && w.Store.kids.activeId) ? w.Store.kids.activeId() : '';
    return [kidId, date, p.bookId, p.startDate,
      p.yw.unit, p.yw.node, p.sx.unit, p.sx.node,
      p.writingCursor || 0, p.sessionsDone || 0,
      st.pace, st.charsPerDay, st.review ? 1 : 0, st.catchupWriting ? 1 : 0,
      st.workCapacity, st.satCapacity, st.sunCapacity, st.holidayCapacity, st.catchupExtra].join('|');
  }

  /* 预览某天会出什么题（只读，不写盘）
     · 那天已有计划（做过或打开过）→ 直接返回真实的
     · 今天或更早、但没有计划 → 用当前进度算一份
     · 未来 → 从今天起逐天模拟「每天都按时完成」，推到那天
     这样可以保证家长看到的是「按现在的进度，那天真的会排到的题」，而不是每次都一样的题。 */
  function preview(date) {
    date = date || U.today();
    var today = U.today();
    var day = w.Store.day(date);
    if (day && day.plan && day.plan.length) {
      return { date: date, plan: day.plan, real: true, source: 'record' };
    }

    var key = previewKey(date);
    if (PREVIEW_CACHE[key]) return PREVIEW_CACHE[key];

    if (date <= today) {
      if (Object.keys(PREVIEW_CACHE).length > 80) PREVIEW_CACHE = {};
      return (PREVIEW_CACHE[key] = { date: date, plan: buildPlan(date), real: false, source: 'estimate' });
    }

    var base = w.Store.progress();
    var sim = {
      yw: { unit: base.yw.unit, node: base.yw.node },
      sx: { unit: base.sx.unit, node: base.sx.node },
      writingCursor: base.writingCursor || 0,
      sessionsDone: base.sessionsDone || 0,
      startDate: base.startDate
    };

    // 起点：今天的场次也算做完（家长查的是「往后每天按时练」的排法）
    var day0 = w.Store.day(today);
    var plan0 = (day0 && day0.plan && day0.plan.length) ? day0.plan : buildPlan(today, sim);
    sim.sessionsDone += plan0.filter(function (s) { return s.status !== 'done'; }).length;
    var last0 = plan0[plan0.length - 1];
    if (last0 && last0.next) {
      if (last0.next.yw) sim.yw = last0.next.yw;
      if (last0.next.sx) sim.sx = last0.next.sx;
      if (last0.next.w) sim.writingCursor = last0.next.w;
    }

    var d = U.addDays(today, 1), guard = 0, truncated = false;
    while (d < date) {
      if (guard++ > 800) { truncated = true; break; }
      var pl = buildPlan(d, sim);
      var last = pl[pl.length - 1];
      if (last && last.next) {
        if (last.next.yw) sim.yw = last.next.yw;
        if (last.next.sx) sim.sx = last.next.sx;
        if (last.next.w) sim.writingCursor = last.next.w;
      }
      sim.sessionsDone += pl.length;
      d = U.addDays(d, 1);
    }
    var out = { date: date, plan: buildPlan(date, sim), real: false, source: 'sim', truncated: truncated };
    // 别让缓存无限长，留着最近几十天的就够
    if (Object.keys(PREVIEW_CACHE).length > 80) PREVIEW_CACHE = {};
    PREVIEW_CACHE[key] = out;
    return out;
  }

  /* ---- 连续练习提醒 ----
     「连着练」= 相邻两场之间的空档不超过 BREAK_MIN 分钟。
     连着练了 2 场，第 3 场开始前先提醒休息；真去歇够了的，空档变大，自动不再提醒。 */
  var BREAK_MIN = 25;      // 两场之间歇超过 25 分钟，就不算连着练了
  var REST_AFTER = 2;      // 连着练满几场后开始提醒

  function ms(v) { return Number(v) || 0; }

  /* 今天的连续练习情况：从最近完成的一场往前数 */
  function streakInfo(date) {
    date = date || U.today();
    var day = w.Store.day(date);
    var out = { count: 0, lastAt: 0, restAck: -1 };
    if (!day || !day.plan) return out;
    out.restAck = (day.restAck === undefined || day.restAck === null) ? -1 : Number(day.restAck);
    var done = [];
    day.plan.forEach(function (s) { if (s.status === 'done') done.push(s); });
    if (!done.length) return out;
    // 按开始时间排一下，防止孩子跳着场次做时把顺序算乱
    done.sort(function (a, b) { return (ms(a.startedAt) || ms(a.finishedAt)) - (ms(b.startedAt) || ms(b.finishedAt)); });

    var count = 1;
    for (var i = done.length - 1; i > 0; i--) {
      var nxt = done[i], prv = done[i - 1];
      var from = ms(prv.finishedAt) || ms(prv.startedAt);
      var to = ms(nxt.startedAt) || ms(nxt.finishedAt);
      // 老记录没有时间戳时按「接着练的」算，宁可提醒一次
      var gap = (from && to) ? Math.abs(to - from) : 0;
      if (gap <= BREAK_MIN * 60000) count++;
      else break;
    }
    out.count = count;
    out.lastAt = ms(done[done.length - 1].finishedAt);
    return out;
  }

  /* 进入第 slot 场之前要不要提醒休息 */
  function shouldRest(date, slot) {
    date = date || U.today();
    slot = Number(slot) || 0;
    if (slot < REST_AFTER) return false;                 // 前两场不打扰
    var day = w.Store.day(date);
    if (!day || !day.plan) return false;
    if (Number(day.restAck) >= slot) return false;       // 这一场已经提醒过了
    var s = day.plan[slot];
    if (!s || s.status === 'done') return false;
    return streakInfo(date).count >= REST_AFTER;
  }

  function ackRest(date, slot) {
    var day = w.Store.day(date);
    if (!day) return;
    day.restAck = Number(slot) || 0;
    w.Store.saveDay(date, day);
  }

  /* 提醒弹窗。resolve(true) = 接着练，false = 先去休息 */
  function restGate(date, slot) {
    return new Promise(function (resolve) {
      var info = streakInfo(date);
      var m = U.modal({
        title: '⏰ 连着第 ' + (info.count + 1) + ' 场啦，先歇一会儿',
        desc: '已经连着练了 ' + info.count + ' 场，眼睛和脖子该松一松了。' +
          '看看窗外的远处，站起来喝口水，比硬撑着多做几题更有用。',
        dismissable: false,
        actions: [
          {
            label: '☕ 先休息一下', class: 'btn-ghost',
            onClick: function () { ackRest(date, slot); m.close(); resolve(false); }
          },
          {
            label: '我还想接着练', class: 'btn-primary',
            onClick: function () { ackRest(date, slot); m.close(); resolve(true); }
          }
        ]
      });
    });
  }

  /* 需要拦截时返回 Promise，不需要时直接 resolve(true) */
  function restGateIfNeeded(date, slot) {
    if (!shouldRest(date, slot)) return Promise.resolve(true);
    return restGate(date, slot);
  }

  function sessionItems(s) {
    var ids = (s.items.chars || []).concat(s.items.pinyin || [], s.items.math || []);
    return w.Content.items(ids);
  }

  function sessionDone(s) { return s.status === 'done'; }

  /* 判断某场次是否可打卡：三科答完 + 写字任务完成（照片或家长跳过）。
     不检查 AI/家长有没有评分——批改是另一回事，不该挡住打卡。 */
  function canCheckin(s) {
    var answered = Object.keys(s.answers || {}).length;
    if (answered < (s.items.chars.length + s.items.pinyin.length + s.items.math.length)) return false;
    return writingOK(s);
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
    day.done = day.plan.every(function (x) { return x.status === 'done' && writingOK(x); });
    /* 只要完成一场（且该场写字任务完成了）就算今天打过卡，连续天数不再等全部场次 */
    day.checkedIn = day.plan.some(function (x) { return x.status === 'done' && writingOK(x); });
    if (day.checkedIn && !day.finishedAt) day.finishedAt = Date.now();
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
    var backlog = w.Schedule.backlog(p, date, st);
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
    buildPlan: buildPlan, ensure: ensure, rebuild: rebuild, preview: preview,
    pickMath: pickMath, trimChars: trimChars, isCalcMath: isCalcMath,
    sessionItems: sessionItems, canCheckin: canCheckin, completeSlot: completeSlot,
    summary: summary, writingCharsOf: writingCharsOf, checkedIn: checkedIn,
    currentSlot: currentSlot, writingOK: writingOK,
    streakInfo: streakInfo, shouldRest: shouldRest, restGate: restGate, restGateIfNeeded: restGateIfNeeded,
    BREAK_MIN: BREAK_MIN, REST_AFTER: REST_AFTER,
    maxCursor: maxCursor, consolidate: consolidate
  };
})(window);
