/* 语文题目生成器：认字 5 题 + 拼音 6 题
   各册内容包只提供「节点规格」，这里统一生成题目（选项顺序随机、答案确定）。 */
(function (w) {
  'use strict';

  var C = w.CHARS, P = w.PY;
  var CODE = 'yw1a';

  var CHAR_TYPES = ['py', 'stroke', 'word', 'radical', 'struct'];
  var STRUCT_OPTS = ['左右结构', '上下结构', '独体字'];

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

  function buildCharItem(ch, type, idx, node, unit, qIndex) {
    var id = CODE + '-' + unit.id + '-' + node.id + '-c' + qIndex;
    var base = {
      id: id, module: 'chars', type: 'choice', level: 1,
      source: '人教版一上 · ' + unit.name.replace(/^[^·]*· /, '') + ' · ' + node.lesson
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
      var pool2 = [];
      Object.keys(C).forEach(function (k) { if (C[k].r && C[k].r !== ch.r) pool2.push(C[k].r); });
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

    /* struct */
    if (!ch.struct) return buildCharItem(ch, 'py', idx, node, unit, qIndex);
    var correctStruct = STRUCT_OPTS.filter(function (s) { return s.indexOf(ch.struct) >= 0; })[0] || '独体字';
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
  function buildPinyinItems(spec, node, unit, nodeIdx) {
    var items = [];
    var used = {};
    function add(it) {
      if (!it || used[it.stem]) return;
      used[it.stem] = 1;
      it.id = CODE + '-' + unit.id + '-' + node.id + '-p' + (items.length + 1);
      it.module = 'pinyin';
      it.source = '人教版一上 · ' + node.lesson;
      items.push(it);
    }

    /* 1. 声母 / 韵母 辨析 */
    if (spec.sm && spec.sm.length) {
      var s = spec.sm[nodeIdx % spec.sm.length];
      var dsPool = P.YUNMU_DAN.concat(P.YUNMU_FU).filter(function (y) { return y !== s; });
      var ds = pickDistinct(dsPool, 2, [s]);
      var r = shuffleOptions(s, ds);
      add({
        type: 'choice', level: 1, skill: '拼音.声母辨认',
        stem: '下面哪个是声母？', audio: '下面哪个是声母',
        options: r.options, answer: r.answer,
        explain: '「' + s + '」是声母。'
      });
    } else {
      var y0 = (spec.ym && spec.ym[0]) || 'a';
      var dsY = P.SHENGMU.filter(function (x) { return x.length === 1 && x !== y0; });
      var rY = shuffleOptions(y0, pickDistinct(dsY, 2, [y0]));
      add({
        type: 'choice', level: 1, skill: '拼音.韵母辨认',
        stem: '下面哪个是韵母？', audio: '下面哪个是韵母',
        options: rY.options, answer: rY.answer,
        explain: '「' + y0 + '」是韵母。'
      });
    }

    /* 2. 整体认读 */
    if (spec.ztr && spec.ztr.length) {
      var z = spec.ztr[nodeIdx % spec.ztr.length];
      var dsZ = ['zh', 'ch', 'sh', 'z', 'c', 's', 'b', 'p'].concat(spec.sm || []).filter(function (x) { return spec.ztr.indexOf(x) < 0 && x !== z; });
      var rZ = shuffleOptions(z, pickDistinct(uniq(dsZ), 2, [z]));
      add({
        type: 'choice', level: 2, skill: '拼音.整体认读',
        stem: '下面哪个是整体认读音节？', audio: '下面哪个是整体认读音节',
        options: rZ.options, answer: rZ.answer,
        explain: '「' + z + '」是整体认读音节，要整体读出来，不用拼。'
      });
    } else {
      var pr0 = (spec.pairs && spec.pairs[0]) || ['b', 'a', 1];
      var sylT = P.syllable(pr0[0], pr0[1], pr0[2]);
      var cnT = P.TONE_CN[pr0[2]];
      var rT1 = shuffleOptions(cnT, ['第一声', '第二声', '第三声', '第四声'].filter(function (x) { return x !== cnT; }).slice(0, 2));
      add({
        type: 'choice', level: 1, skill: '拼音.声调',
        stem: '「' + sylT + '」是第几声？', audio: '这个音节是第几声',
        options: rT1.options, answer: rT1.answer,
        explain: '「' + sylT + '」是' + cnT + '，' + cnT[0] + cnT[1] + '是它的调号。'
      });
    }

    /* 3 & 4. 拼读合成 */
    var pairs = spec.pairs || [];
    for (var pi = 0; pi < Math.min(2, pairs.length); pi++) {
      var pr = pairs[(nodeIdx + pi) % pairs.length];
      var ini = pr[0], fin = pr[1], tone = pr[2];
      var syl = P.syllable(ini, fin, tone);
      var wrongTone = P.syllable(ini, fin, tone === 4 ? 1 : tone + 1);
      var wrongIni = P.syllable(pr[0] === 'b' ? 'p' : 'b', fin, tone);
      var rP = shuffleOptions(syl, [wrongTone, wrongIni].filter(function (x) { return x !== syl; }));
      add({
        type: 'choice', level: 1, skill: '拼音.拼读',
        stem: '「' + ini + '」和「' + fin + '」拼在一起，读第' + ['', '一', '二', '三', '四'][tone] + '声，是哪个？',
        audio: ini + '和' + P.stripTone(fin) + '拼在一起读第' + ['', '一', '二', '三', '四'][tone] + '声',
        options: rP.options, answer: rP.answer,
        explain: ini + ' + ' + fin + ' = ' + syl + '。'
      });
    }

    /* 5. 标调位置 */
    var firstPair = pairs[0] || ['b', 'a', 1];
    var finBase = P.splitTone(firstPair[1]).base;
    var target = finBase.indexOf('a') >= 0 ? 'a'
      : finBase.indexOf('o') >= 0 ? 'o'
        : finBase.indexOf('e') >= 0 ? 'e'
          : finBase.indexOf('iu') >= 0 ? 'u'
            : finBase.indexOf('ui') >= 0 ? 'i'
              : (/[iuü]/.test(finBase[finBase.length - 1]) ? finBase[finBase.length - 1] : 'a');
    var vowels = uniq(finBase.split(''));
    if (vowels.length >= 2) {
      var dsT = vowels.filter(function (v) { return v !== target; }).slice(0, 2);
      var rT = shuffleOptions(target, dsT);
      add({
        type: 'choice', level: 2, skill: '拼音.标调',
        stem: '「' + finBase + '」标声调时，标在哪个字母上？', audio: finBase + '标声调时标在哪个字母上',
        options: rT.options, answer: rT.answer,
        explain: '标调规则：有 a 找 a，没 a 找 o e，i u 并列标在后。所以标在「' + target + '」上。'
      });
    }

    /* 6. 概念 / 拆分题 */
    var quiz = spec.quiz || [];
    if (quiz.length) {
      var q = quiz[nodeIdx % quiz.length];
      add({
        type: 'choice', level: 2, skill: q.s || '拼音.概念',
        stem: q.q, audio: q.q.replace(/[「」？]/g, ''),
        options: q.o, answer: q.a, explain: q.e
      });
    } else {
      var ch = C[node.chars[0]];
      if (ch) {
        var base2 = P.stripTone(ch.p);
        var vowelPart = base2.replace(/^(zh|ch|sh|b|p|m|f|d|t|n|l|g|k|h|j|q|x|r|z|c|s|y|w)/, '');
        var rS = shuffleOptions(vowelPart || 'a', pickDistinct(P.YUNMU_DAN.concat(P.YUNMU_FU), 2, [vowelPart]));
        add({
          type: 'choice', level: 2, skill: '拼音.声韵母拆分',
          stem: '「' + ch.c + '」读 ' + ch.p + '，它的韵母是哪个？', audio: ch.c + '的韵母是哪个',
          options: rS.options, answer: rS.answer,
          explain: ch.p + ' 的韵母是 ' + (vowelPart || 'a') + '。'
        });
      }
    }

    /* 不足 6 题时用「听音辨字母 / 声调判断」补齐 */
    var extra = 0;
    while (items.length < 6 && extra < 12) {
      var letters = (spec.sm || []).concat(spec.ym || [], spec.ztr || []);
      if (!letters.length) break;
      var L = letters[(nodeIdx + extra) % letters.length];
      var dsL = P.SHENGMU.concat(P.YUNMU_DAN).filter(function (x) { return x !== L; });
      var rL = shuffleOptions(L, pickDistinct(dsL, 2, [L]));
      add({
        type: 'choice', level: 1, skill: '拼音.听音辨字母',
        stem: '听一听，选出「' + L + '」', audio: L, speakOnly: true,
        options: rL.options, answer: rL.answer,
        explain: '刚才读的是「' + L + '」。'
      });
      extra++;
    }
    /* 若仍不足（例如只有韵母），用声调题补齐 */
    var guard = 0;
    while (items.length < 6 && guard < 12) {
      var pr3 = pairs[guard % pairs.length];
      var tn = ((pr3[2] - 1 + guard) % 4) + 1;
      var syl3 = P.syllable(pr3[0], pr3[1], tn);
      var cn3 = P.TONE_CN[tn];
      var rT3 = shuffleOptions(cn3, ['第一声', '第二声', '第三声', '第四声'].filter(function (x) { return x !== cn3; }).slice(0, 2));
      add({
        type: 'choice', level: 2, skill: '拼音.声调',
        stem: '「' + syl3 + '」是第几声？', audio: '这个音节是第几声',
        options: rT3.options, answer: rT3.answer,
        explain: '「' + syl3 + '」是' + cn3 + '。'
      });
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
    var content = {
      bookId: meta.bookId, subject: 'chinese', name: meta.name,
      textbook: meta.textbook || '人教版（统编）2024 修订版',
      version: meta.version || '2024.1', units: []
    };

    units.forEach(function (unit, ui) {
      var u = { id: unit.id, name: unit.name, index: ui, lessons: [], nodes: [] };
      unit.nodes.forEach(function (node, ni) {
        if (u.lessons.indexOf(node.lesson) < 0) u.lessons.push(node.lesson);
        var items = [];
        // 认字 5 题：字与题型错位轮转，避免同一字总是同一题型
        for (var i = 0; i < 5 && i < node.chars.length; i++) {
          var type = CHAR_TYPES[(ni + i) % CHAR_TYPES.length];
          var it = buildCharItem(C[node.chars[i]], type, i, node, unit, i + 1);
          if (it) items.push(it);
        }
        var pyItems = buildPinyinItems(w.PY_PRESETS[node.py] || w.PY_PRESETS.basic, node, unit, ni);
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
