/* 语文题目生成器：认字 5 题 + 拼音 6 题
   各册内容包只提供「节点规格」，这里统一生成题目（选项顺序随机、答案确定）。
   两条硬规则：
   1) 全书题干不重复（去重表 USED_STEM），同一个字的读音只问一次；
   2) 不出一眼就能抄答案的送分题。

   已下架的 6 类「太简单」题型（数笔画 / 选组词 / 拼音读第几声 / 声母韵母分类 /
   字形结构 / 问偏旁），空出的题位由「第 N 笔 / 末笔」「选字填空」这类
   要真会笔顺、真懂字义的问法，以及更多拼读识字题补上。
   每个节点仍是 5 + 6 = 11 题，全册题量不变。 */
(function (w) {
  'use strict';

  var C = w.CHARS, P = w.PY;
  var CODE = 'yw1a';

  /* 认字问法：都要真的认识这个字（读音 / 笔顺 / 字义 / 听音找字）。
     不再问「一共几笔」「能组哪个词」「什么结构」「偏旁是哪个」这类看一眼就能猜的。
     笔顺类（first/nth/last）在题库里保留，但每场练习最多只出 1 道，见 Task.trimChars。 */
  var CHAR_TYPES = ['py', 'first', 'nth', 'last', 'word', 'syl'];
  var STROKE_POOL = ['横', '竖', '撇', '点', '提', '捺', '横折', '横钩', '竖钩', '竖提', '竖弯钩',
    '撇折', '斜钩', '卧钩', '横折钩', '横撇', '横折弯钩', '竖折'];

  /* 全书去重表（每次 build 重置） */
  var USED_STEM = null;        // 题干 → 1
  var USED_CHAR_TYPE = null;   // 字 → {题型:1}
  var USED_CHAR_PY = null;     // 已问过读音（字→拼音）的字
  var USED_WORD = null;        // 选字填空用过的词 → 1（同一个词不考两次）
  var CHAR_BASE = null;        // 基础拼音 → [字]
  var BOOK_PREFIX = '人教版一上';

  function resetRegistries() {
    USED_STEM = {};
    USED_CHAR_TYPE = {};
    USED_CHAR_PY = {};
    USED_WORD = {};
    CHAR_BASE = null;
  }

  function uniq(arr) {
    var out = [], seen = {};
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  function hashStr(s) {
    var h = 7;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000003;
    return h;
  }

  function pickDistinct(pool, n, exclude) {
    var cands = uniq(pool).filter(function (x) { return exclude.indexOf(x) < 0 && x !== undefined && x !== ''; });
    // 优先取靠前（更常见）的候选，再打乱顺序
    var head = cands.slice(0, Math.max(n * 3, n));
    return U.shuffle(head).slice(0, n);
  }

  /* 固定种子的候选挑选：不依赖 Math.random，同一个词每次生成的干扰项都一样 */
  function hashPick(pool, n, seed, exclude) {
    var cands = uniq(pool).filter(function (x) { return exclude.indexOf(x) < 0 && x !== undefined && x !== ''; });
    cands.sort(function (a, b) { return hashStr(a + '|' + seed) - hashStr(b + '|' + seed); });
    return cands.slice(0, n);
  }

  function shuffleOptions(correct, distractors) {
    var opts = U.shuffle([correct].concat(distractors.filter(function (x) { return x !== undefined && x !== null && x !== ''; })));
    return { options: opts, answer: opts.indexOf(correct) };
  }

  function pinyinDistractors(ch, n) {
    var base = P.stripTone(ch.p);
    var sameBase = P.all.filter(function (p) { return P.stripTone(p) === base && p !== ch.p; });
    var first = ch.p[0];
    var sameInit = P.all.filter(function (p) { return p[0] === first && p !== ch.p && sameBase.indexOf(p) < 0; });
    var others = P.all.filter(function (p) { return p !== ch.p && p[1] !== first; });
    var pool = uniq(sameBase.concat(sameInit, others));
    return pool.slice(0, 20).filter(function (x) { return x !== ch.p; }).slice(0, n);
  }

  /* 笔顺题的干扰项优先用「这个字里的其他笔画」，孩子得真按笔顺数，猜不出来 */
  function strokeDistractors(ch, correct, n) {
    var own = uniq((ch.st || []).filter(function (s) { return s && s !== correct; }));
    var out = pickDistinct(own, n, [correct]);
    if (out.length < n) out = out.concat(pickDistinct(STROKE_POOL, n - out.length, [correct].concat(out)));
    return out.slice(0, n);
  }

  /* ---------------- 拼音工具（本文件用） ---------------- */
  function baseIndex() {
    if (CHAR_BASE) return CHAR_BASE;
    CHAR_BASE = {};
    Object.keys(C).forEach(function (k) {
      var b = P.stripTone(C[k].p);
      (CHAR_BASE[b] = CHAR_BASE[b] || []).push(k);
    });
    return CHAR_BASE;
  }

  /* 拼音完全等于 syl 的字 */
  function charsWithSyllable(syl) {
    var b = P.stripTone(syl);
    return (baseIndex()[b] || []).filter(function (c) { return C[c].p === syl; });
  }

  function splitSyl(base) {
    for (var i = 0; i < P.SHENGMU.length; i++) {
      var s = P.SHENGMU[i];
      if (base.indexOf(s) === 0 && base.length > s.length) return { ini: s, fin: base.slice(s.length) };
    }
    return { ini: '', fin: base };
  }

  function toneOfSyl(p) {
    for (var i = 0; i < p.length; i++) { var t = P.toneOf(p[i]); if (t) return t; }
    return 0;
  }

  /* 同一个音节的另外三个声调 */
  function toneVariants(p) {
    var base = P.stripTone(p), part = splitSyl(base), cur = toneOfSyl(p), out = [];
    for (var t = 1; t <= 4; t++) {
      if (t === cur) continue;
      out.push(P.syllable(part.ini, part.fin, t));
    }
    return out;
  }

  function markLetter(base) {
    if (base.indexOf('a') >= 0) return 'a';
    if (base.indexOf('o') >= 0) return 'o';
    if (base.indexOf('e') >= 0) return 'e';
    if (base.indexOf('iu') >= 0) return 'u';
    if (base.indexOf('ui') >= 0) return 'i';
    for (var i = base.length - 1; i >= 0; i--) if ('iuü'.indexOf(base[i]) >= 0) return base[i];
    return '';
  }

  /* 找两个字作为干扰项：先同韵不同调的，再同声母的 */
  function charDistractors(target, n, pool) {
    var t = C[target];
    if (!t) return [];
    var base = P.stripTone(t.p), ini = splitSyl(base).ini;
    var all = Object.keys(C).filter(function (c) { return C[c].p !== t.p; });
    var tier1 = all.filter(function (c) { return P.stripTone(C[c].p) === base; });
    var tier2 = all.filter(function (c) { return splitSyl(P.stripTone(C[c].p)).ini === ini; });
    var tier3 = (pool || []).filter(function (c) { return C[c] && C[c].p !== t.p; });
    var tier4 = all;
    var out = [];
    [tier1, tier2, tier3, tier4].forEach(function (list) {
      U.shuffle(list).forEach(function (c) {
        if (out.length < n && out.indexOf(c) < 0 && C[c] && C[c].p !== t.p) out.push(c);
      });
    });
    return out;
  }

  /* ---------------- 拼音题生成器 ---------------- */

  /* 字 → 读音（选项同韵不同调，必须真的认识这个字） */
  function gCharPinyin(ch) {
    if (!ch || USED_CHAR_PY[ch.c]) return null;
    if (!toneOfSyl(ch.p)) return null;              // 轻声不作答，一年级不考
    var ds = U.shuffle(toneVariants(ch.p)).slice(0, 2);
    if (ds.length < 2) return null;
    var r = shuffleOptions(ch.p, ds);
    return {
      type: 'choice', level: 1, skill: '拼音.字音',
      _char: ch.c, _syl: P.stripTone(ch.p),
      stem: '「' + ch.c + '」读什么？',
      audio: ch.c + '读什么',
      options: r.options, answer: r.answer,
      explain: '「' + ch.c + '」读 ' + ch.p + '。'
    };
  }

  /* 音节 → 字（真的把音节读出来才选得出） */
  function gSyllableChar(syl, pool) {
    if (!toneOfSyl(syl)) return null;
    var hits = charsWithSyllable(syl);
    if (!hits.length) return null;
    var target = hits.filter(function (c) { return (pool || []).indexOf(c) >= 0; })[0] || hits[0];
    var ds = charDistractors(target, 2, pool);
    if (ds.length < 2) return null;
    var r = shuffleOptions(target, ds);
    return {
      type: 'choice', level: 2, skill: '拼音.拼读识字',
      _syl: P.stripTone(syl),
      stem: '「' + syl + '」是下面哪个字？',
      audio: syl + '是哪个字',
      options: r.options, answer: r.answer,
      explain: '「' + syl + '」是「' + target + '」这个字。'
    };
  }

  /* 声母 + 韵母拼起来是哪个字（取代「d 和 i 拼成 di」这种抄字母题） */
  function gBlend(ini, fin, tone, pool) {
    var syl = P.syllable(ini, fin, tone);
    var hits = charsWithSyllable(syl);
    if (!hits.length) return null;
    var target = hits.filter(function (c) { return (pool || []).indexOf(c) >= 0; })[0] || hits[0];
    var ds = charDistractors(target, 2, pool);
    if (ds.length < 2) return null;
    var r = shuffleOptions(target, ds);
    var toneCn = ['', '一', '二', '三', '四'][tone] || '';
    return {
      type: 'choice', level: 2, skill: '拼音.拼读',
      _syl: P.stripTone(syl),
      stem: '「' + ini + '」和「' + fin + '」拼起来，读第' + toneCn + '声，是哪个字？',
      audio: ini + '和' + fin + '拼起来，读第' + toneCn + '声，是哪个字',
      options: r.options, answer: r.answer,
      explain: ini + ' + ' + fin + ' = ' + syl + '，「' + syl + '」是「' + target + '」。'
    };
  }

  /* 标调位置：给不带调的音节，让孩子用规则判断 */
  function gMarkPos(base) {
    var target = markLetter(base);
    if (!target) return null;
    var vowels = uniq(base.split('')).filter(function (c) { return 'aoeiuü'.indexOf(c) >= 0 && c !== target; });
    if (!vowels.length) return null;
    var r = shuffleOptions(target, U.shuffle(vowels).slice(0, 2));
    return {
      type: 'choice', level: 2, skill: '拼音.标调',
      _syl: base,
      stem: '「' + base + '」标声调时，标在哪个字母上？',
      audio: base + '标声调时，标在哪个字母上',
      options: r.options, answer: r.answer,
      explain: '标调规则：有 a 找 a，没 a 找 o e，i u 并列标在后。所以标在「' + target + '」上。'
    };
  }

  /* 整体认读音节（只出一次，避免重复） */
  function gZtr(spec) {
    var ztr = (spec.ztr || []).filter(function (z) { return P.ZHENGTI.indexOf(z) >= 0; });
    if (!ztr.length) return null;
    var z = ztr[0];
    var fake = ['zha', 'zhe', 'zhu', 'cha', 'che', 'chu', 'sha', 'she', 'shu', 're', 'ru', 'ca', 'sa']
      .filter(function (x) { return P.ZHENGTI.indexOf(x) < 0; });
    var r = shuffleOptions(z, U.shuffle(fake).slice(0, 2));
    return {
      type: 'choice', level: 2, skill: '拼音.整体认读',
      stem: '下面哪个音节要整体认读，不用拼？',
      audio: '下面哪个音节要整体认读',
      options: r.options, answer: r.answer,
      explain: '「' + z + '」是整体认读音节，要整体读出来，不用拼。'
    };
  }

  /* 预设里的概念题 */
  function gQuiz(q) {
    if (!q || !q.o || q.a === undefined) return null;
    return {
      type: 'choice', level: 2, skill: q.s || '拼音.概念',
      stem: q.q, audio: q.q.replace(/[「」？]/g, ''),
      options: q.o.slice(), answer: q.a, explain: q.e
    };
  }

  /* 选字填空：把词语里的目标字挖掉，让孩子从音近字里挑回来。
     和已下架的「这个字能组成哪个词」正好反过来——得先读懂词语、再认得字形。
     字库每个字都带 2 个组词，足够全书换着考；挖空后如果别的字也能组成这个词，
     就换一个词，保证答案只有一个。 */
  function wordOtherFits(word, from, to) {
    var alt = word.replace(from, to);
    return (C[to].w || []).some(function (x) { return x === alt; });
  }

  function gWordBlank(ch, node) {
    var words = (ch.w || []).filter(function (word) {
      return word.length === 2 && word.indexOf(ch.c) >= 0 && !USED_WORD[word];
    });
    if (!words.length) return null;
    var start = hashStr(ch.c + '|' + node.id) % words.length;
    for (var k = 0; k < words.length; k++) {
      var word = words[(start + k) % words.length];
      var stem = '选字填空：' + word.replace(ch.c, '（　）');
      if (USED_STEM[stem]) continue;
      var ambiguous = false, pool = [];
      Object.keys(C).forEach(function (o) {
        if (o === ch.c) return;
        // 别的字填进去也成词 → 这题有两个答案，换词
        if (wordOtherFits(word, ch.c, o)) { ambiguous = true; return; }
        pool.push(o);
      });
      if (ambiguous) continue;
      var base = P.stripTone(ch.p), part = splitSyl(base);
      var tier1 = pool.filter(function (o) { return P.stripTone(C[o].p) === base; });
      var tier2 = pool.filter(function (o) { return part.ini && splitSyl(P.stripTone(C[o].p)).ini === part.ini; });
      var tier3 = pool.filter(function (o) { return part.fin && splitSyl(P.stripTone(C[o].p)).fin === part.fin; });
      /* 干扰项按「同音 → 同声母 → 同韵母 → 其它」分层取，尽量别给一眼就能排除的字 */
      var ds = hashPick(tier1, 2, word, [ch.c]);
      [[tier2, '声'], [tier3, '韵'], [pool, '余']].forEach(function (t) {
        if (ds.length >= 2) return;
        ds = ds.concat(hashPick(t[0], 2 - ds.length, word + t[1], [ch.c].concat(ds)));
      });
      if (ds.length < 2) continue;
      var r = shuffleOptions(ch.c, ds);
      USED_WORD[word] = 1;
      return {
        type: 'choice', level: 2, skill: '认字.选字填空',
        stem: stem, audio: '选字填空，括号里应该填哪个字',
        options: r.options, answer: r.answer,
        explain: '「' + word + '」里要填「' + ch.c + '」（' + ch.p + '），别的字填进去不成词。'
      };
    }
    return null;
  }

  /* ---------------- 认字题生成器 ---------------- */
  function buildCharItem(ch, type, idx, node, unit, qIndex) {
    var id = CODE + '-' + unit.id + '-' + node.id + '-c' + qIndex;
    var base = {
      id: id, module: 'chars', type: 'choice', level: 1,
      source: BOOK_PREFIX + ' · ' + unit.name.replace(/^[^·]*· /, '') + ' · ' + node.lesson
    };
    if (!ch) return null;

    /* 看字选拼音 */
    if (type === 'py') {
      if (USED_CHAR_PY[ch.c]) return null;
      var ds = pinyinDistractors(ch, 2);
      if (ds.length < 2) return null;
      var r1 = shuffleOptions(ch.p, ds);
      return Object.assign(base, {
        skill: '认字.看字选拼音',
        stem: '「' + ch.c + '」的拼音是哪个？',
        audio: ch.c + '的拼音是哪个',
        options: r1.options, answer: r1.answer,
        explain: '「' + ch.c + '」读 ' + ch.p + '。'
      });
    }

    /* 笔顺三问：第一笔 / 第 N 笔 / 最后一笔，都得真会笔顺才答得出 */
    if (type === 'first' || type === 'nth' || type === 'last') {
      var st = ch.st || [];
      if (st.length < 2) return null;
      if (type === 'nth' && st.length < 3) return null;
      var pos, label, skill, level;
      if (type === 'first') {
        pos = 1; label = '第一笔'; skill = '认字.笔顺起笔'; level = 2;
      } else if (type === 'last') {
        pos = st.length; label = '最后一笔'; skill = '认字.笔顺末笔'; level = 3;
      } else {
        var maxPos = Math.min(st.length - 1, 5);
        pos = 2 + (hashStr(ch.c + '|' + node.id) % Math.max(1, maxPos - 1));
        label = '第' + pos + '笔'; skill = '认字.笔顺中段'; level = 3;
      }
      var correct = st[pos - 1];
      if (!correct) return null;
      var dsF = strokeDistractors(ch, correct, 2);
      if (dsF.length < 2) return null;
      var rF = shuffleOptions(correct, dsF);
      return Object.assign(base, {
        skill: skill, level: level,
        stem: '「' + ch.c + '」的' + label + '是什么？',
        audio: ch.c + '的' + label + '是什么',
        options: rF.options, answer: rF.answer,
        explain: '「' + ch.c + '」的笔顺是：' + st.join('、') + '，' + label + '是「' + correct + '」。'
      });
    }

    /* 选字填空：给出挖空的词语，从音近字里挑回正确的字 */
    if (type === 'word') {
      var wordItem = gWordBlank(ch, node);
      if (!wordItem) return null;
      return Object.assign(base, wordItem);
    }

    /* 听音选字：给音节找汉字，和「看字选拼音」正好反过来。
       干扰项必须读音不同，否则同音字会造成两个正确答案。
       题干和拼音模块的「是哪个字」错开写，避免全书题干撞车。 */
    if (type === 'syl') {
      var py0 = P.stripTone(ch.p);
      var part0 = splitSyl(py0);
      var sameIni = [], sameFin = [], restS = [];
      Object.keys(C).forEach(function (k) {
        if (k === ch.c || C[k].p === ch.p) return;
        var pk = splitSyl(P.stripTone(C[k].p));
        if (pk.ini === part0.ini && pk.ini) sameIni.push(k);
        else if (pk.fin === part0.fin && pk.fin) sameFin.push(k);
        else restS.push(k);
      });
      var dsS = pickDistinct(sameIni, 2, [ch.c]);
      if (dsS.length < 2) dsS = dsS.concat(pickDistinct(sameFin, 2 - dsS.length, [ch.c].concat(dsS)));
      if (dsS.length < 2) dsS = dsS.concat(pickDistinct(restS, 2 - dsS.length, [ch.c].concat(dsS)));
      if (dsS.length < 2) return null;
      var r6 = shuffleOptions(ch.c, dsS);
      return Object.assign(base, {
        skill: '认字.听音选字',
        stem: '「' + ch.p + '」对应下面哪个字？',
        audio: ch.p + '是哪个字',
        stemPy: true,
        options: r6.options, answer: r6.answer,
        explain: '「' + ch.p + '」就是「' + ch.c + '」字。'
      });
    }

    return null;
  }

  /* ---------------- 拼音：6 题 ---------------- */
  /* 本节点的字优先，不够时从全字库补「和本课声韵母一致」的字 */
  function fitLesson(ch, spec) {
    var part = splitSyl(P.stripTone(ch.p));
    var sm = spec.sm || [], ym = spec.ym || [];
    if (sm.length && sm.indexOf(part.ini) < 0) return false;
    if (ym.length && ym.indexOf(part.fin) < 0) return false;
    return true;
  }

  function buildPinyinItems(spec, node, unit, nodeIdx, covered) {
    var items = [];
    var allChars = Object.keys(C).map(function (k) { return C[k]; });
    var nodeChars = (node.chars || []).map(function (c) { return C[c]; }).filter(Boolean);
    var pairs = (spec.pairs && spec.pairs.length) ? spec.pairs : [['b', 'a', 1], ['m', 'a', 3]];
    var SYL_USED = {};
    /* 选字优先：本课的字 → 前面学过的字（且声韵母对得上） → 全字库补充 */
    var nodeSet = node.chars || [];
    var learned = (covered || []).filter(function (c) { return nodeSet.indexOf(c) < 0 && C[c]; })
      .map(function (c) { return C[c]; });
    var spare = allChars.filter(function (ch) {
      return nodeSet.indexOf(ch.c) < 0 && (covered || []).indexOf(ch.c) < 0;
    });
    var otherChars = U.shuffle(learned.filter(function (ch) { return fitLesson(ch, spec); }));
    U.shuffle(spare.filter(function (ch) { return fitLesson(ch, spec); }))
      .slice(0, 16).forEach(function (ch) { otherChars.push(ch); });
    if (otherChars.length < 10) {
      U.shuffle(learned.concat(spare)).forEach(function (ch) {
        if (otherChars.length < 10 && otherChars.indexOf(ch) < 0) otherChars.push(ch);
      });
    }
    var charPool = nodeChars.concat(otherChars.slice(0, 24));
    /* 全书兜底池：本节点的字问完之后，还有 400+ 个字可以换着问，题量不会掉 */
    var extraChars = allChars.filter(function (ch) { return charPool.indexOf(ch) < 0; });

    function add(it) {
      if (!it || !it.options || it.options.length < 2) return false;
      if (it.answer === undefined || it.answer < 0 || it.answer >= it.options.length) return false;
      if (USED_STEM[it.stem]) return false;
      if (it._syl && SYL_USED[it._syl]) return false;   // 同一场不重复考同一个音节
      var seen = {}, ok = true;
      it.options.forEach(function (o) { var k = String(o); if (seen[k]) { ok = false; } seen[k] = 1; });
      if (!ok) return false;
      USED_STEM[it.stem] = 1;
      if (it._char) USED_CHAR_PY[it._char] = 1;
      if (it._syl) SYL_USED[it._syl] = 1;
      it.id = CODE + '-' + unit.id + '-' + node.id + '-p' + (items.length + 1);
      it.module = 'pinyin';
      it.source = BOOK_PREFIX + ' · ' + node.lesson;
      items.push(it);
      return true;
    }

    function pickFrom(group, start) {
      if (!group.length) return false;
      for (var i = 0; i < group.length; i++) {
        var fn = group[(start + i) % group.length];
        var it = fn();
        if (it && add(it)) return true;
      }
      return false;
    }

    /* 拼读：本课的拼读组合 × 四个声调，再扩到本课声母 × 韵母 */
    var blends = [];
    pairs.forEach(function (pr) {
      for (var t = 1; t <= 4; t++) {
        (function (ini, fin, tone) {
          blends.push(function () { return gBlend(ini, fin, tone, node.chars); });
        })(pr[0], pr[1], t);
      }
    });
    (spec.sm || []).slice(0, 4).forEach(function (ini) {
      (spec.ym || []).slice(0, 4).forEach(function (fin) {
        for (var t = 1; t <= 4; t++) {
          (function (a, b, tone) {
            blends.push(function () { return gBlend(a, b, tone, node.chars); });
          })(ini, fin, t);
        }
      });
    });

    /* 字 → 读音、音节 → 字：先用本节点/已学的字，再用全字库兜底 */
    var pyPool = charPool.concat(extraChars);
    var charPys = pyPool.map(function (ch) { return function () { return gCharPinyin(ch); }; });
    var pyChars = pyPool.map(function (ch) {
      return function () { return gSyllableChar(ch.p, node.chars); };
    });

    /* 标调位置：本课的拼读组合 + 常见声韵母组合，只留含两个以上元音的 */
    var markBases = [];
    pairs.forEach(function (pr) { markBases.push(pr[0] + P.stripTone(pr[1])); });
    var markInis = (spec.sm && spec.sm.length) ? spec.sm : P.SHENGMU.slice(0, 8);
    var markFins = (spec.ym && spec.ym.length) ? spec.ym : P.YUNMU_DAN.concat(P.YUNMU_FU);
    markInis.slice(0, 6).forEach(function (ini) {
      markFins.slice(0, 12).forEach(function (fin) { markBases.push(ini + fin); });
    });
    var marks = uniq(markBases).map(function (b) {
      return function () { return gMarkPos(b); };
    });

    var miscs = (spec.quiz || []).map(function (q) { return function () { return gQuiz(q); }; });
    if (spec.ztr && spec.ztr.length) miscs.push(function () { return gZtr(spec); });

    var groups = [blends, charPys, pyChars, marks, miscs];
    groups.forEach(function (g, gi) { if (g.length) pickFrom(g, (nodeIdx + gi) % g.length); });

    /* 不足 6 题：继续从各组捞，最后用拼读组合兜底 */
    var guard = 0;
    while (items.length < 6 && guard < 120) {
      var progressed = false;
      for (var gi2 = 0; gi2 < groups.length && items.length < 6; gi2++) {
        if (pickFrom(groups[gi2], guard)) progressed = true;
      }
      if (!progressed) {
        var inis = (spec.sm && spec.sm.length) ? spec.sm : P.SHENGMU.slice(0, 8);
        var fins = (spec.ym && spec.ym.length) ? spec.ym : P.YUNMU_DAN;
        var ini = inis[guard % inis.length];
        var fin = fins[Math.floor(guard / inis.length) % fins.length];
        if (add(gBlend(ini, fin, (guard % 4) + 1, node.chars))) progressed = true;
        if (items.length < 6 && add(gMarkPos(ini + fin))) progressed = true;
      }
      guard++;
    }

    return items.slice(0, 6);
  }

  /* ---------------- 组装 ---------------- */
  /**
   * units: 节点规格数组；meta: {bookId, code, name, textbook, version}
   */
  function build(units, meta) {
    CODE = meta.code;
    BOOK_PREFIX = '人教版' + (/一(上|下)册/.test(meta.name || '') ? '一' + RegExp.$1 : '一上');
    resetRegistries();

    var content = {
      bookId: meta.bookId, subject: 'chinese', name: meta.name,
      textbook: meta.textbook || '人教版（统编）2024 修订版',
      version: meta.version || '2024.1', units: []
    };

    var covered = [];
    var allCharKeys = Object.keys(C);
    units.forEach(function (unit, ui) {
      var u = { id: unit.id, name: unit.name, index: ui, lessons: [], nodes: [] };
      unit.nodes.forEach(function (node, ni) {
        if (u.lessons.indexOf(node.lesson) < 0) u.lessons.push(node.lesson);
        var items = [];
        // 认字 5 题：字与题型错位轮转，同一个字不再重复同一问法
        var qChars = node.chars.slice(0, 5);
        // 本课字不足 5 个时，用最近学过的字复习补足，保证每场题量稳定为 5 题
        for (var ci = covered.length - 1; ci >= 0 && qChars.length < 5; ci--) {
          if (qChars.indexOf(covered[ci]) < 0 && C[covered[ci]]) qChars.push(covered[ci]);
        }
        /* 问一个字：题型从轮转位开始试，跳过这个字已问过的问法、以及题干撞车的问法 */
        var askChar = function (ch) {
          var rec = USED_CHAR_TYPE[ch.c] || (USED_CHAR_TYPE[ch.c] = {});
          var start = (ni + items.length) % CHAR_TYPES.length;
          for (var k = 0; k < CHAR_TYPES.length; k++) {
            var t = CHAR_TYPES[(start + k) % CHAR_TYPES.length];
            if (rec[t]) continue;
            var it = buildCharItem(ch, t, items.length, node, unit, items.length + 1);
            if (!it || USED_STEM[it.stem]) continue;
            rec[t] = 1;
            return it;
          }
          return null;
        };
        qChars.forEach(function (c) {
          if (items.length >= 5) return;
          var chObj = C[c];
          if (!chObj) return;
          var it = askChar(chObj), asked = c;
          if (!it) {
            /* 这个字的问法用完了 → 换成前面学过、还没考过的字 */
            var pool = covered.slice().reverse();
            for (var k = 0; k < pool.length && !it; k++) {
              var alt = pool[k];
              if (alt === c || qChars.indexOf(alt) >= 0 || !C[alt]) continue;
              it = askChar(C[alt]);
              if (it) asked = alt;
            }
          }
          if (!it) {
            /* 还没凑够就再放宽到全字库，保证每场就是 5 题 */
            for (var k2 = 0; k2 < allCharKeys.length && !it; k2++) {
              var alt2 = allCharKeys[(k2 + ni * 7) % allCharKeys.length];
              if (qChars.indexOf(alt2) >= 0) continue;
              it = askChar(C[alt2]);
              if (it) asked = alt2;
            }
          }
          if (!it) return;
          USED_STEM[it.stem] = 1;
          if (it.skill === '认字.看字选拼音') USED_CHAR_PY[asked] = 1;
          items.push(it);
        });
        var pyItems = buildPinyinItems(w.PY_PRESETS[node.py] || w.PY_PRESETS.basic, node, unit, ni, covered);
        node.chars.forEach(function (c) { if (covered.indexOf(c) < 0) covered.push(c); });
        items = items.concat(pyItems);
        u.nodes.push({
          id: node.id, index: ni, title: node.lesson + ' · ' + node.title,
          lesson: node.lesson, chars: node.chars.slice(),
          estimatedMin: 30, items: items
        });
      });
      content.units.push(u);
    });

    content.nodeCount = content.units.reduce(function (s, u) { return s + u.nodes.length; }, 0);
    content.itemCount = content.units.reduce(function (s, u) {
      return s + u.nodes.reduce(function (s2, n) { return s2 + n.items.length; }, 0);
    }, 0);
    return content;
  }

  w.YWBuilder = { build: build };
})(window);
