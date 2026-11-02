/* 语文题目生成器：认字 5 题 + 拼音 6 题
   各册内容包只提供「节点规格」，这里统一生成题目（选项顺序随机、答案确定）。
   两条硬规则：
   1) 全书题干不重复（去重表 USED_STEM），同一个字的读音只问一次；
   2) 拼音题以「字」和「音节」为锚点，不再出「d 和 i 拼成 di」这种一眼可抄的题。 */
(function (w) {
  'use strict';

  var C = w.CHARS, P = w.PY;
  var CODE = 'yw1a';

  var CHAR_TYPES = ['py', 'stroke', 'word', 'radical', 'struct', 'first', 'syl'];
  var STROKE_POOL = ['横', '竖', '撇', '点', '提', '捺', '横折', '横钩', '竖钩', '竖提', '竖弯钩',
    '撇折', '斜钩', '卧钩', '横折钩', '横撇', '横折弯钩', '竖折'];
  /* 结构题的候选池：字库里出现过的五种结构都要有，否则「国」这类字会掉进兜底选项变成错题。
     每道题仍只出 3 个选项，从池子里抽 2 个干扰项。 */
  var STRUCT_OPTS = ['左右结构', '上下结构', '独体字', '半包围结构', '全包围结构'];

  /* 全书去重表（每次 build 重置） */
  var USED_STEM = null;        // 题干 → 1
  var USED_CHAR_TYPE = null;   // 字 → {题型:1}
  var USED_CHAR_PY = null;     // 已问过读音（字→拼音）的字
  var CHAR_BASE = null;        // 基础拼音 → [字]
  var BOOK_PREFIX = '人教版一上';

  function resetRegistries() {
    USED_STEM = {};
    USED_CHAR_TYPE = {};
    USED_CHAR_PY = {};
    CHAR_BASE = null;
  }

  function uniq(arr) {
    var out = [], seen = {};
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  function pickDistinct(pool, n, exclude) {
    var cands = uniq(pool).filter(function (x) { return exclude.indexOf(x) < 0 && x !== undefined && x !== ''; });
    // 优先取靠前（更常见）的候选，再打乱顺序
    var head = cands.slice(0, Math.max(n * 3, n));
    return U.shuffle(head).slice(0, n);
  }

  function shuffleOptions(correct, distractors) {
    var opts = U.shuffle([correct].concat(distractors));
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

  function strokesDistractors(n, cnt) {
    var cands = [n - 1, n + 1, n - 2, n + 2, n + 3].filter(function (x) { return x > 0; });
    return U.shuffle(uniq(cands)).slice(0, cnt).map(function (x) { return x + ' 笔'; });
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

  /* 音节 → 第几声 */
  function gTone(syl) {
    var t = toneOfSyl(syl);
    if (!t) return null;
    var cn = P.TONE_CN[t];
    var others = ['第一声', '第二声', '第三声', '第四声'].filter(function (x) { return x !== cn; });
    var r = shuffleOptions(cn, U.shuffle(others).slice(0, 2));
    return {
      type: 'choice', level: 1, skill: '拼音.声调',
      _syl: P.stripTone(syl),
      stem: '「' + syl + '」是第几声？',
      audio: '这个音节是第几声',
      options: r.options, answer: r.answer,
      explain: '「' + syl + '」是' + cn + '。'
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

  /* 声母 / 韵母分类 */
  function gLetterClass(letters, isSm) {
    if (!letters || !letters.length) return null;
    var L = letters[0];
    if (isSm && P.SHENGMU.indexOf(L) < 0) return null;
    if (!isSm && P.ZHENGTI.indexOf(L) >= 0) return null;
    var correct = isSm ? '声母' : '韵母';
    var r = shuffleOptions(correct, [isSm ? '韵母' : '声母', '整体认读音节']);
    return {
      type: 'choice', level: 1, skill: isSm ? '拼音.声母辨认' : '拼音.韵母辨认',
      stem: '「' + L + '」是声母还是韵母？',
      audio: L + '是声母还是韵母',
      options: r.options, answer: r.answer,
      explain: '「' + L + '」是' + correct + '。'
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

  function buildCharItem(ch, type, idx, node, unit, qIndex) {
    var id = CODE + '-' + unit.id + '-' + node.id + '-c' + qIndex;
    var base = {
      id: id, module: 'chars', type: 'choice', level: 1,
      source: BOOK_PREFIX + ' · ' + unit.name.replace(/^[^·]*· /, '') + ' · ' + node.lesson
    };
    if (!ch) return null;

    if (type === 'py') {
      var ds = pinyinDistractors(ch, 2);
      if (ds.length < 2) return buildCharItem(ch, 'stroke', idx, node, unit, qIndex);
      var r1 = shuffleOptions(ch.p, ds);
      return Object.assign(base, {
        skill: '认字.看字选拼音',
        stem: '「' + ch.c + '」的拼音是哪个？',
        audio: ch.c + '的拼音是哪个',
        options: r1.options, answer: r1.answer,
        explain: '「' + ch.c + '」读 ' + ch.p + '。'
      });
    }

    if (type === 'stroke') {
      if (!ch.s) return buildCharItem(ch, 'word', idx, node, unit, qIndex);
      var r2 = shuffleOptions(ch.s + ' 笔', strokesDistractors(ch.s, 2));
      return Object.assign(base, {
        skill: '认字.数笔画', level: 2,
        stem: '「' + ch.c + '」一共有几笔？',
        audio: ch.c + '一共有几笔',
        options: r2.options, answer: r2.answer,
        explain: ch.st.length ? '「' + ch.c + '」的笔顺是：' + ch.st.join('、') + '，共 ' + ch.s + ' 笔。' : '「' + ch.c + '」共 ' + ch.s + ' 笔。'
      });
    }

    if (type === 'first') {
      if (!ch.st || !ch.st.length) return buildCharItem(ch, 'py', idx, node, unit, qIndex);
      var first = ch.st[0];
      var dsF = pickDistinct(STROKE_POOL, 2, [first]);
      if (dsF.length < 2) return buildCharItem(ch, 'py', idx, node, unit, qIndex);
      var rF = shuffleOptions(first, dsF);
      return Object.assign(base, {
        skill: '认字.笔顺起笔', level: 2,
        stem: '「' + ch.c + '」的第一笔是什么？',
        audio: ch.c + '的第一笔是什么',
        options: rF.options, answer: rF.answer,
        explain: '「' + ch.c + '」的第一笔是「' + first + '」，笔顺是：' + ch.st.join('、') + '。'
      });
    }

    if (type === 'word') {
      var correctWord = ch.w[0];
      if (!correctWord) return buildCharItem(ch, 'py', idx, node, unit, qIndex);
      var pool = [];
      Object.keys(C).forEach(function (k) {
        if (k === ch.c) return;
        var w0 = C[k].w[0];
        if (w0 && w0.indexOf(ch.c) < 0 && w0.length === correctWord.length) pool.push(w0);
      });
      var ds2 = pickDistinct(pool, 2, [correctWord]);
      if (ds2.length < 2) return buildCharItem(ch, 'struct', idx, node, unit, qIndex);
      var r3 = shuffleOptions(correctWord, ds2);
      return Object.assign(base, {
        skill: '认字.选组词',
        stem: '「' + ch.c + '」可以组成下面哪个词？',
        audio: ch.c + '可以组成下面哪个词',
        options: r3.options, answer: r3.answer,
        explain: '「' + ch.c + '」可以组成「' + correctWord + '」。'
      });
    }

    if (type === 'radical') {
      /* 独体字的偏旁就是它自己，题目会变成「「二」的偏旁是二」这种送分题 */
      if (!ch.r || ch.r === ch.c) return buildCharItem(ch, 'word', idx, node, unit, qIndex);
      var pool2 = [];
      Object.keys(C).forEach(function (k) { if (C[k].r && C[k].r !== ch.r && C[k].r !== ch.c) pool2.push(C[k].r); });
      var ds3 = pickDistinct(pool2, 2, [ch.r]);
      if (ds3.length < 2) return buildCharItem(ch, 'word', idx, node, unit, qIndex);
      var r4 = shuffleOptions(ch.r, ds3);
      return Object.assign(base, {
        skill: '认字.选偏旁', level: 2,
        stem: '「' + ch.c + '」的偏旁是哪个？',
        audio: ch.c + '的偏旁是哪个',
        options: r4.options, answer: r4.answer,
        explain: '「' + ch.c + '」的偏旁是「' + ch.r + '」。'
      });
    }

    if (type === 'syl') {
      /* 听音选字：给音节找汉字，和「看字选拼音」正好反过来。
         干扰项必须是读音不同的字，否则同音字会造成两个正确答案 */
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
      if (dsS.length < 2) return buildCharItem(ch, 'stroke', idx, node, unit, qIndex);
      var r6 = shuffleOptions(ch.c, dsS);
      return Object.assign(base, {
        skill: '认字.听音选字',
        stem: '「' + ch.p + '」是下面哪个字？',
        audio: ch.p + '是哪个字',
        stemPy: true,
        options: r6.options, answer: r6.answer,
        explain: '「' + ch.p + '」就是「' + ch.c + '」字。'
      });
    }

    /* struct */
    if (!ch.struct) return buildCharItem(ch, 'py', idx, node, unit, qIndex);
    var correctStruct = null;
    for (var si = 0; si < STRUCT_OPTS.length; si++) {
      if (STRUCT_OPTS[si].indexOf(ch.struct) >= 0) { correctStruct = STRUCT_OPTS[si]; break; }
    }
    // 字库里出现了候选池没有的结构（比如「左中右」），宁可换题型也不要出成错题
    if (!correctStruct) return buildCharItem(ch, 'py', idx, node, unit, qIndex);
    var ds4 = STRUCT_OPTS.filter(function (s) { return s !== correctStruct; });
    var r5 = shuffleOptions(correctStruct, ds4.slice(0, 2));
    return Object.assign(base, {
      skill: '认字.字形结构', level: 2,
      stem: '「' + ch.c + '」是什么结构的字？',
      audio: ch.c + '是什么结构的字',
      options: r5.options, answer: r5.answer,
      explain: '「' + ch.c + '」是' + correctStruct + '。'
    });
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
    var nodeChars = (node.chars || []).map(function (c) { return C[c]; }).filter(Boolean);
    var pairs = (spec.pairs && spec.pairs.length) ? spec.pairs : [['b', 'a', 1], ['m', 'a', 3]];
    var SYL_USED = {};
    /* 选字优先：本课的字 → 前面学过的字（且声韵母对得上） → 全字库补充 */
    var nodeSet = node.chars || [];
    var learned = (covered || []).filter(function (c) { return nodeSet.indexOf(c) < 0 && C[c]; })
      .map(function (c) { return C[c]; });
    var spare = Object.keys(C).map(function (k) { return C[k]; })
      .filter(function (ch) { return nodeSet.indexOf(ch.c) < 0 && (covered || []).indexOf(ch.c) < 0; });
    var otherChars = U.shuffle(learned.filter(function (ch) { return fitLesson(ch, spec); }));
    U.shuffle(spare.filter(function (ch) { return fitLesson(ch, spec); }))
      .slice(0, 16).forEach(function (ch) { otherChars.push(ch); });
    if (otherChars.length < 10) {
      U.shuffle(learned.concat(spare)).forEach(function (ch) {
        if (otherChars.length < 10 && otherChars.indexOf(ch) < 0) otherChars.push(ch);
      });
    }
    var charPool = nodeChars.concat(otherChars.slice(0, 24));

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
      for (var i = 0; i < group.length; i++) {
        var fn = group[(start + i) % group.length];
        var it = fn();
        if (it && add(it)) return true;
      }
      return false;
    }

    var charPys = charPool.map(function (ch) { return function () { return gCharPinyin(ch); }; });
    var blends = pairs.map(function (pr) { return function () { return gBlend(pr[0], pr[1], pr[2], node.chars); }; });
    /* 扩音：本课声母 × 韵母的组合，只要字库里有对应的字就能出题 */
    (spec.sm || []).slice(0, 4).forEach(function (ini, ii) {
      (spec.ym || []).slice(0, 4).forEach(function (fin, fi) {
        blends.push(function () { return gBlend(ini, fin, ((nodeIdx + ii + fi) % 4) + 1, node.chars); });
      });
    });
    var pyChars = charPool.map(function (ch) {
      return function () { return gSyllableChar(ch.p, node.chars); };
    });
    var tones = charPool.map(function (ch) { return function () { return gTone(ch.p); }; });
    var marks = pairs.map(function (pr) {
      var b = pr[0] + P.stripTone(pr[1]);
      return function () { return gMarkPos(b); };
    });
    var miscs = (spec.quiz || []).map(function (q) { return function () { return gQuiz(q); }; });
    if (spec.ztr && spec.ztr.length) miscs.push(function () { return gZtr(spec); });
    if (spec.sm && spec.sm.length) miscs.push(function () { return gLetterClass(spec.sm, true); });
    if (spec.ym && spec.ym.length) miscs.push(function () { return gLetterClass(spec.ym, false); });

    var groups = [blends, charPys, pyChars, tones, marks, miscs];
    groups.forEach(function (g, gi) { if (g.length) pickFrom(g, (nodeIdx + gi) % g.length); });

    /* 不足 6 题：继续从各组捞，最后用声调组合兜底 */
    var guard = 0;
    while (items.length < 6 && guard < 60) {
      var progressed = false;
      for (var gi2 = 0; gi2 < groups.length && items.length < 6; gi2++) {
        if (pickFrom(groups[gi2], guard)) progressed = true;
      }
      if (!progressed) {
        var inis = (spec.sm && spec.sm.length) ? spec.sm : ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l'];
        var fins = (spec.ym && spec.ym.length) ? spec.ym : ['a', 'o', 'e', 'i', 'u'];
        var ini = inis[guard % inis.length];
        var fin = fins[Math.floor(guard / inis.length) % fins.length];
        add(gTone(P.syllable(ini, fin, (guard % 4) + 1)));
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
            /* 这个字的问法已经用完（同一册里被好几个节点重复用到）→ 换成前面学过、还没考过的字 */
            var pool = covered.slice().reverse();
            for (var k = 0; k < pool.length && !it; k++) {
              var alt = pool[k];
              if (alt === c || qChars.indexOf(alt) >= 0 || !C[alt]) continue;
              it = askChar(C[alt]);
              if (it) asked = alt;
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
