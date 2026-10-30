/* 语文 · 一年级上册（人教版统编 2024 修订版）
   内容以「节点规格」描述，加载时生成题目（选项顺序随机、答案随题目结构确定）。
   节点 = 一天（一场）的语文部分：认字 5 题 + 拼音 6 题。 */
(function (w) {
  'use strict';

  var C = w.CHARS, P = w.PY;

  /* ---------------- 拼音课型预设 ---------------- */
  var PY = {
    basic: {
      sm: [], ym: ['a', 'o', 'e', 'i', 'u', 'ü'], ztr: [],
      pairs: [['b', 'a', 1], ['m', 'a', 3], ['d', 'i', 4], ['n', 'i', 2]],
      quiz: [
        { q: '「a」是声母还是韵母？', o: ['韵母', '声母', '整体认读音节'], a: 0, e: 'a o e i u ü 都是单韵母。', s: '拼音.字母分类' },
        { q: '一声的「a」怎么写？', o: ['ā', 'á', 'à'], a: 0, e: '一声是平平的，写作 ā。', s: '拼音.声调' }
      ]
    },
    sm1: {
      sm: ['b', 'p', 'm', 'f'], ym: ['a', 'o', 'e', 'i', 'u'], ztr: [],
      pairs: [['b', 'a', 1], ['p', 'o', 2], ['m', 'i', 3], ['f', 'u', 3]],
      quiz: [
        { q: '「b」和「d」最容易看错，哪个像「广播」的 b？', o: ['b', 'd', 'p'], a: 0, e: 'b 的肚子在右边，像收音机的天线在左边。', s: '拼音.形近字母' }
      ]
    },
    sm2: {
      sm: ['d', 't', 'n', 'l'], ym: ['a', 'e', 'i', 'u'], ztr: [],
      pairs: [['d', 'a', 4], ['t', 'u', 3], ['n', 'i', 2], ['l', 'u', 4]],
      quiz: [
        { q: '「n」和「l」发音不同，哪个是「牛奶」的声母？', o: ['n', 'l', 'm'], a: 0, e: '牛奶 niú nǎi，声母是 n。', s: '拼音.声母辨音' }
      ]
    },
    sm3: {
      sm: ['g', 'k', 'h'], ym: ['a', 'e', 'u'], ztr: [],
      pairs: [['g', 'e', 1], ['k', 'u', 3], ['h', 'e', 2], ['g', 'u', 1]],
      quiz: [
        { q: '「h」的读音像下面哪个字？', o: ['喝', '哥', '可'], a: 0, e: 'h 读起来像「喝」的开头。', s: '拼音.声母辨音' }
      ]
    },
    sm4: {
      sm: ['j', 'q', 'x'], ym: ['i', 'ü'], ztr: [],
      pairs: [['j', 'i', 1], ['q', 'i', 2], ['x', 'i', 3], ['j', 'ü', 1]],
      quiz: [
        { q: '「ü」和 j q x 相拼时，两点要怎么办？', o: ['去掉两点', '保留两点', '写成 u 加两点'], a: 0, e: 'j q x 和 ü 相拼，两点要去掉，写成 ju qu xu。', s: '拼音.拼写规则' }
      ]
    },
    zcs: {
      sm: ['z', 'c', 's'], ym: ['a', 'e', 'u'], ztr: ['zi', 'ci', 'si'],
      pairs: [['z', 'a', 2], ['c', 'a', 3], ['s', 'u', 4], ['z', 'i', 3]],
      quiz: [
        { q: '「zi」是整体认读音节吗？', o: ['是', '不是，还要拼'], a: 0, e: 'z c s 后面跟 i 时，zi ci si 要整体认读，不用拼。', s: '拼音.整体认读' }
      ]
    },
    zhchsh: {
      sm: ['zh', 'ch', 'sh', 'r'], ym: ['a', 'e', 'u'], ztr: ['zhi', 'chi', 'shi', 'ri'],
      pairs: [['zh', 'a', 1], ['ch', 'e', 1], ['sh', 'u', 1], ['r', 'i', 4]],
      quiz: [
        { q: '「z」和「zh」哪一个要翘舌头？', o: ['zh', 'z', '都一样'], a: 0, e: 'zh ch sh r 是翘舌音，舌头要往上翘。', s: '拼音.平翘舌' },
        { q: '下面哪个是整体认读音节？', o: ['zhi', 'zh', 'zha'], a: 0, e: 'zhi 是整体认读音节，不拼读。', s: '拼音.整体认读' }
      ]
    },
    yw: {
      sm: ['y', 'w'], ym: ['i', 'u', 'ü'], ztr: ['yi', 'wu', 'yu'],
      pairs: [['y', 'i', 1], ['w', 'u', 3], ['y', 'u', 2], ['y', 'ue', 4]],
      quiz: [
        { q: '「ü」单独成音节时写作什么？', o: ['yu', 'ü', 'wu'], a: 0, e: 'ü 单独成音节写成 yu，两点去掉。', s: '拼音.拼写规则' }
      ]
    },
    ai: {
      sm: [], ym: ['ai', 'ei', 'ui'], ztr: [],
      pairs: [['b', 'ai', 2], ['m', 'ei', 3], ['t', 'ui', 4], ['k', 'ai', 1]],
      quiz: [
        { q: '「妹」的韵母是哪个？', o: ['ei', 'ai', 'ui'], a: 0, e: '妹 mèi，韵母是 ei。', s: '拼音.复韵母' }
      ]
    },
    ao: {
      sm: [], ym: ['ao', 'ou', 'iu'], ztr: [],
      pairs: [['m', 'ao', 1], ['h', 'ou', 2], ['n', 'iu', 2], ['z', 'ao', 3]],
      quiz: [
        { q: '「iu」的声调应该标在哪个字母上？', o: ['u', 'i', '都不标'], a: 0, e: 'i 和 u 并列时，声调标在后面的字母上，所以标 u。', s: '拼音.标调' }
      ]
    },
    ie: {
      sm: [], ym: ['ie', 'üe', 'er'], ztr: ['ye', 'yue'],
      pairs: [['x', 'ie', 3], ['j', 'ue', 2], ['n', 'ie', 4], ['q', 'ue', 1]],
      quiz: [
        { q: '「er」可以跟声母相拼吗？', o: ['不能，它自己成音节', '能，比如 ber', '能，比如 der'], a: 0, e: 'er 是特殊韵母，只能自己成音节，如「儿」。', s: '拼音.特殊韵母' }
      ]
    },
    an: {
      sm: [], ym: ['an', 'en', 'in', 'un', 'ün'], ztr: ['yin', 'yun', 'yuan'],
      pairs: [['b', 'an', 4], ['m', 'en', 2], ['l', 'in', 2], ['ch', 'un', 1]],
      quiz: [
        { q: '「yuan」是整体认读音节吗？', o: ['是', '不是，要拼读'], a: 0, e: 'yuan 是整体认读音节，直接读出来。', s: '拼音.整体认读' }
      ]
    },
    ang: {
      sm: [], ym: ['ang', 'eng', 'ing', 'ong'], ztr: ['ying'],
      pairs: [['b', 'ang', 1], ['f', 'eng', 1], ['x', 'ing', 1], ['h', 'ong', 2]],
      quiz: [
        { q: '「an」和「ang」哪个是后鼻音？', o: ['ang', 'an', '都不是'], a: 0, e: 'ang eng ing ong 是后鼻音，读的时候鼻子会振动。', s: '拼音.前后鼻音' }
      ]
    },
    review: {
      sm: ['b', 'p', 'd', 't'], ym: ['ai', 'ao', 'an', 'ang'], ztr: ['zhi', 'wu', 'yu'],
      pairs: [['b', 'ai', 3], ['d', 'ao', 4], ['l', 'an', 2], ['sh', 'ang', 4]],
      quiz: [
        { q: '「书」的声母是哪个？', o: ['sh', 's', 'zh'], a: 0, e: '书 shū，声母是 sh。', s: '拼音.声母' }
      ]
    }
  };

  /* ---------------- 单元 / 节点结构 ---------------- */
  var UNITS = [
    {
      id: 'u0', name: '准备课 · 我上学了', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: '我上学了', title: '我是小学生', chars: ['我', '们', '好', '你', '他'], py: 'basic' }
      ]
    },
    {
      id: 'u1', name: '第一单元 · 识字', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: '天地人', title: '天地人 · 象形字初识', chars: ['天', '地', '人', '你', '我'], py: 'basic' },
        { id: 'n2', lesson: '天地人', title: '你我他 · 人称代词', chars: ['他', '上', '下', '天', '人'], py: 'basic' },
        { id: 'n3', lesson: '金木水火土', title: '一二三四五', chars: ['一', '二', '三', '四', '五'], py: 'basic' },
        { id: 'n4', lesson: '金木水火土', title: '金木水火土', chars: ['上', '下', '日', '月', '水'], py: 'basic' },
        { id: 'n5', lesson: '口耳目手足', title: '口耳目手足', chars: ['口', '耳', '目', '手', '足'], py: 'sm1' },
        { id: 'n6', lesson: '口耳目手足', title: '站如松 坐如钟', chars: ['站', '坐', '手', '口', '目'], py: 'sm2' },
        { id: 'n7', lesson: '日月山川', title: '日月山川', chars: ['日', '月', '山', '川', '水'], py: 'sm3' },
        { id: 'n8', lesson: '日月山川', title: '水火田禾', chars: ['火', '田', '禾', '山', '水'], py: 'sm4' }
      ]
    },
    {
      id: 'u2', name: '第二单元 · 汉语拼音', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: 'a o e', title: '单韵母 a o e', chars: ['一', '二', '三', '上', '下'], py: 'basic' },
        { id: 'n2', lesson: 'a o e', title: '四声练习', chars: ['天', '地', '人', '你', '我'], py: 'basic' },
        { id: 'n3', lesson: 'i u ü y w', title: '单韵母 i u ü', chars: ['衣', '鱼', '五', '雨', '云'], py: 'basic' },
        { id: 'n4', lesson: 'i u ü y w', title: '声母 y w 与整体认读', chars: ['一', '七', '西', '鸡', '米'], py: 'yw' },
        { id: 'n5', lesson: 'b p m f', title: '声母 b p m f', chars: ['爸', '妈', '大', '米', '土'], py: 'sm1' },
        { id: 'n6', lesson: 'b p m f', title: '拼一拼：bà mā', chars: ['白', '皮', '八', '木', '马'], py: 'sm1' },
        { id: 'n7', lesson: 'd t n l', title: '声母 d t n l', chars: ['大', '米', '土', '地', '马'], py: 'sm2' },
        { id: 'n8', lesson: 'd t n l', title: '拼一拼：dà mǐ', chars: ['他', '地', '田', '兔', '立'], py: 'sm2' },
        { id: 'n9', lesson: '复习', title: '拼音复习一', chars: ['手', '口', '目', '耳', '足'], py: 'review' },
        { id: 'n10', lesson: '复习', title: '拼音复习二', chars: ['日', '月', '山', '川', '水'], py: 'review' }
      ]
    },
    {
      id: 'u3', name: '第三单元 · 汉语拼音', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: 'g k h', title: '声母 g k h', chars: ['画', '打', '棋', '鸡', '国'], py: 'sm3' },
        { id: 'n2', lesson: 'g k h', title: '拼一拼：huà huā', chars: ['口', '火', '花', '红', '个'], py: 'sm3' },
        { id: 'n3', lesson: 'j q x', title: '声母 j q x', chars: ['洗', '衣', '服', '鸡', '下'], py: 'sm4' },
        { id: 'n4', lesson: 'j q x', title: 'ü 遇 j q x', chars: ['七', '西', '学', '心', '星'], py: 'sm4' },
        { id: 'n5', lesson: 'z c s', title: '声母 z c s', chars: ['字', '词', '语', '句', '子'], py: 'zcs' },
        { id: 'n6', lesson: 'z c s', title: '平舌音练习', chars: ['早', '作', '三', '四', '足'], py: 'zcs' },
        { id: 'n7', lesson: 'zh ch sh r', title: '声母 zh ch sh r', chars: ['桌', '纸', '折', '尺', '虫'], py: 'zhchsh' },
        { id: 'n8', lesson: 'zh ch sh r', title: '翘舌音练习', chars: ['中', '山', '上', '手', '十'], py: 'zhchsh' },
        { id: 'n9', lesson: 'y w', title: '整体认读 yi wu yu', chars: ['衣', '五', '雨', '云', '鱼'], py: 'yw' },
        { id: 'n10', lesson: 'y w', title: '拼一拼：yǔ yī', chars: ['我', '月', '友', '右', '雨'], py: 'yw' },
        { id: 'n11', lesson: '复习', title: '拼音复习三', chars: ['爸', '妈', '大', '米', '马'], py: 'review' },
        { id: 'n12', lesson: '复习', title: '拼音复习四', chars: ['你', '我', '他', '手', '足'], py: 'review' }
      ]
    },
    {
      id: 'u4', name: '第四单元 · 汉语拼音', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: 'ai ei ui', title: '复韵母 ai ei ui', chars: ['妹', '奶', '白', '皮', '米'], py: 'ai' },
        { id: 'n2', lesson: 'ai ei ui', title: '标调练习', chars: ['飞', '水', '对', '北', '会'], py: 'ai' },
        { id: 'n3', lesson: 'ao ou iu', title: '复韵母 ao ou iu', chars: ['早', '书', '包', '好', '鸟'], py: 'ao' },
        { id: 'n4', lesson: 'ao ou iu', title: '拼一拼：zǎo shàng', chars: ['手', '口', '九', '六', '头'], py: 'ao' },
        { id: 'n5', lesson: 'ie üe er', title: '复韵母 ie üe er', chars: ['写', '字', '学', '儿', '月'], py: 'ie' },
        { id: 'n6', lesson: 'ie üe er', title: '特殊韵母 er', chars: ['叶', '雪', '好', '儿', '月'], py: 'ie' },
        { id: 'n7', lesson: 'an en in un ün', title: '前鼻韵母', chars: ['山', '田', '人', '门', '三'], py: 'an' },
        { id: 'n8', lesson: 'an en in un ün', title: '拼一拼：shān tián', chars: ['半', '天', '见', '前', '云'], py: 'an' },
        { id: 'n9', lesson: 'an en in un ün', title: '前鼻音练习', chars: ['心', '早', '半', '山', '门'], py: 'an' },
        { id: 'n10', lesson: 'ang eng ing ong', title: '后鼻韵母', chars: ['上', '风', '星', '亮', '中'], py: 'ang' },
        { id: 'n11', lesson: 'ang eng ing ong', title: '前后鼻音辨析', chars: ['红', '虫', '空', '冬', '东'], py: 'ang' },
        { id: 'n12', lesson: '复习', title: '拼音总复习', chars: ['天', '地', '人', '你', '我'], py: 'review' }
      ]
    },
    {
      id: 'u5', name: '第五单元 · 阅读', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: '秋天', title: '秋天来了', chars: ['秋', '气', '了', '树', '叶'], py: 'ai' },
        { id: 'n2', lesson: '秋天', title: '一片一片', chars: ['片', '大', '飞', '会', '个'], py: 'ao' },
        { id: 'n3', lesson: '江南', title: '江南可采莲', chars: ['江', '南', '可', '采', '莲'], py: 'an' },
        { id: 'n4', lesson: '江南', title: '鱼戏莲叶间', chars: ['鱼', '东', '西', '北', '江'], py: 'an' },
        { id: 'n5', lesson: '雪地里的小画家', title: '雪地画画', chars: ['鸡', '狗', '画', '叶', '片'], py: 'ie' },
        { id: 'n6', lesson: '雪地里的小画家', title: '谁画了什么', chars: ['笔', '画', '打', '鸡', '狗'], py: 'ie' },
        { id: 'n7', lesson: '四季', title: '春天 夏天', chars: ['尖', '说', '春', '青', '蛙'], py: 'ang' },
        { id: 'n8', lesson: '四季', title: '秋天 冬天', chars: ['夏', '弯', '就', '冬', '春'], py: 'ang' }
      ]
    },
    {
      id: 'u6', name: '第六单元 · 识字', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: '对韵歌', title: '云对雨 雪对风', chars: ['对', '云', '雨', '雪', '风'], py: 'review' },
        { id: 'n2', lesson: '对韵歌', title: '花对树 鸟对虫', chars: ['花', '鸟', '虫', '山', '水'], py: 'review' },
        { id: 'n3', lesson: '日月明', title: '日月明 小大尖', chars: ['明', '力', '尘', '从', '众'], py: 'basic' },
        { id: 'n4', lesson: '日月明', title: '双木林 三木森', chars: ['双', '木', '林', '森', '条'], py: 'basic' },
        { id: 'n5', lesson: '小书包', title: '我的小书包', chars: ['书', '包', '尺', '作', '业'], py: 'zhchsh' },
        { id: 'n6', lesson: '小书包', title: '文具的名字', chars: ['本', '笔', '刀', '课', '早'], py: 'zcs' },
        { id: 'n7', lesson: '升国旗', title: '五星红旗', chars: ['升', '国', '旗', '中', '红'], py: 'ang' },
        { id: 'n8', lesson: '升国旗', title: '向国旗敬礼', chars: ['歌', '起', '么', '美', '立'], py: 'ang' }
      ]
    },
    {
      id: 'u7', name: '第七单元 · 阅读', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: '小小的船', title: '弯弯的月儿', chars: ['的', '船', '两', '头', '在'], py: 'an' },
        { id: 'n2', lesson: '小小的船', title: '只看见闪闪的星星', chars: ['里', '看', '见', '闪', '星'], py: 'ang' },
        { id: 'n3', lesson: '影子', title: '影子在前 影子在后', chars: ['影', '前', '后', '黑', '狗'], py: 'ao' },
        { id: 'n4', lesson: '影子', title: '它是我的好朋友', chars: ['左', '右', '它', '好', '朋'], py: 'ao' },
        { id: 'n5', lesson: '两件宝', title: '人有两件宝', chars: ['两', '双', '手', '大', '心'], py: 'ai' },
        { id: 'n6', lesson: '两件宝', title: '双手和大脑', chars: ['力', '心', '手', '大', '双'], py: 'ai' }
      ]
    },
    {
      id: 'u8', name: '第八单元 · 阅读', book: 'yw-1a',
      nodes: [
        { id: 'n1', lesson: '比尾巴', title: '谁的尾巴长', chars: ['比', '尾', '巴', '谁', '长'], py: 'zhchsh' },
        { id: 'n2', lesson: '比尾巴', title: '谁的尾巴短', chars: ['短', '把', '伞', '兔', '最'], py: 'an' },
        { id: 'n3', lesson: '乌鸦喝水', title: '乌鸦找水喝', chars: ['公', '鸟', '口', '水', '看'], py: 'ao' },
        { id: 'n4', lesson: '乌鸦喝水', title: '想办法喝到水', chars: ['力', '半', '里', '可', '到'], py: 'ai' },
        { id: 'n5', lesson: '雨点儿', title: '数不清的雨点儿', chars: ['数', '彩', '半', '空', '问'], py: 'an' },
        { id: 'n6', lesson: '雨点儿', title: '小雨点儿和大雨点儿', chars: ['到', '方', '没', '更', '绿'], py: 'ang' }
      ]
    }
  ];

  /* ---------------- 生成工具 ---------------- */
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
    var id = 'yw1a-' + unit.id + '-' + node.id + '-c' + qIndex;
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

  /* ---------------- 拼音题生成 ---------------- */
  function buildPinyinItems(spec, node, unit, nodeIdx) {
    var items = [];
    var used = {};
    function add(it) {
      if (!it || used[it.stem]) return;
      used[it.stem] = 1;
      it.id = 'yw1a-' + unit.id + '-' + node.id + '-p' + (items.length + 1);
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
  var content = {
    bookId: 'yw-1a', subject: 'chinese', name: '语文 · 一年级上册',
    textbook: '人教版（统编）2024 修订版', version: '2024.1',
    units: []
  };

  UNITS.forEach(function (unit, ui) {
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
      var pyItems = buildPinyinItems(PY[node.py] || PY.basic, node, unit, ni);
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

  w.CONTENT = w.CONTENT || {};
  w.CONTENT['yw-1a'] = content;
})(window);
