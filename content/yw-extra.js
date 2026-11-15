/* 语文 · 高阶题型（近义词 / 反义词 / 成语 / 短文阅读）
   一上、一下共用一套词表与短文，按单元进度循序铺开：
     · 准备课、识字一（u0/u1）：还不会读题，不出；
     · 拼音单元（u2）：先出最简单的反义词；
     · 拼音后段（u3/u4）：加近义词；
     · 阅读、课文单元（u5 起）：再加成语；
     · 每个单元最后一课：一篇短文带两问阅读。
   每题都是 4 选 1，答案不手写，由词表 / 短文直接给出。
   同一册内题干不重复：每个词有正反两种问法，用完再换下一个词。 */
(function (w) {
  'use strict';

  /* ---------------- 词表 ---------------- */
  /* 反义词：一年级常用、意思明确、没有第二种解释的词对 */
  var ANTONYMS = [
    ['大', '小'], ['多', '少'], ['上', '下'], ['来', '去'], ['前', '后'],
    ['左', '右'], ['里', '外'], ['早', '晚'], ['黑', '白'], ['长', '短'],
    ['高', '低'], ['开', '关'], ['冷', '热'], ['新', '旧'], ['快', '慢'],
    ['远', '近'], ['明', '暗'], ['哭', '笑'], ['出', '入'], ['天', '地'],
    ['男', '女'], ['老', '少'], ['胖', '瘦'], ['好', '坏'], ['真', '假'],
    ['对', '错'], ['粗', '细'], ['轻', '重'], ['深', '浅'], ['加', '减'],
    ['有', '无'], ['升', '降'], ['进', '退'], ['生', '熟'], ['单', '双'],
    ['软', '硬'], ['甜', '苦'], ['咸', '淡'], ['圆', '方'], ['直', '弯'],
    ['满', '空'], ['湿', '干'], ['忙', '闲'], ['强', '弱'], ['动', '静'],
    ['饱', '饿'], ['站', '坐'], ['送', '收'], ['借', '还'], ['问', '答'],
    ['买', '卖'], ['日', '夜'], ['东', '西'], ['南', '北'], ['开心', '难过'],
    ['仔细', '马虎'], ['勇敢', '胆小'], ['明亮', '黑暗'], ['温暖', '寒冷'],
    ['容易', '困难'], ['干净', '肮脏'], ['安静', '吵闹'], ['许多', '很少']
  ];

  /* 近义词：只收意思几乎相同的词；同一组里的词互为近义，出题时不能当干扰项 */
  var SYNONYM_GROUPS = [
    ['高兴', '开心', '快乐', '愉快', '欢乐', '欢喜'],
    ['漂亮', '好看', '美丽', '俊俏'],
    ['认真', '仔细', '用心'],
    ['马上', '立刻', '立即', '连忙', '赶紧'],
    ['有名', '著名'],
    ['突然', '忽然', '猛然'],
    ['喜欢', '喜爱'],
    ['明白', '知道', '清楚', '懂得'],
    ['暖和', '温暖'],
    ['干净', '整洁', '整齐'],
    ['许多', '很多'],
    ['一同', '一起'],
    ['帮助', '帮忙'],
    ['安静', '宁静', '寂静'],
    ['想念', '思念'],
    ['爱护', '保护'],
    ['勇敢', '英勇'],
    ['飞快', '迅速'],
    ['生气', '发怒'],
    ['奇怪', '古怪'],
    ['特别', '非常', '十分'],
    ['舒服', '舒适'],
    ['雪白', '洁白'],
    ['火红', '鲜红'],
    ['碧绿', '翠绿'],
    ['惊奇', '惊讶'],
    ['关心', '关怀'],
    ['办法', '方法'],
    ['珍贵', '宝贵'],
    ['希望', '盼望'],
    ['慢慢', '缓缓']
  ];

  /* 成语：一年级能懂的意思 + 一个挖空的字 + 形近 / 音近干扰字 */
  var IDIOMS = [
    { w: '一心一意', idx: 1, ch: '心', ds: ['新', '二', '个'], mean: '做事专心，不分心' },
    { w: '三心二意', idx: 1, ch: '心', ds: ['新', '一', '个'], mean: '做事不专心，一会儿想这一会儿想那' },
    { w: '五颜六色', idx: 0, ch: '五', ds: ['六', '四', '七'], mean: '颜色很多，很好看' },
    { w: '七上八下', idx: 0, ch: '七', ds: ['八', '九', '六'], mean: '心里不安，很紧张' },
    { w: '四面八方', idx: 0, ch: '四', ds: ['五', '三', '十'], mean: '各个方向，到处' },
    { w: '十全十美', idx: 0, ch: '十', ds: ['九', '八', '百'], mean: '非常完美，没有缺点' },
    { w: '自言自语', idx: 0, ch: '自', ds: ['只', '字', '子'], mean: '自己跟自己说话' },
    { w: '又高又大', idx: 1, ch: '高', ds: ['长', '胖', '矮'], mean: '个子高，样子大' },
    { w: '一五一十', idx: 0, ch: '一', ds: ['二', '三', '十'], mean: '原原本本，说得清清楚楚' },
    { w: '三三两两', idx: 0, ch: '三', ds: ['二', '四', '五'], mean: '三个两个地在一起' },
    { w: '百发百中', idx: 0, ch: '百', ds: ['十', '千', '万'], mean: '每次都射中，从不落空' },
    { w: '画蛇添足', idx: 1, ch: '蛇', ds: ['龙', '马', '鱼'], mean: '做了多余的事，反而不好' },
    { w: '守株待兔', idx: 3, ch: '兔', ds: ['猫', '狗', '鸟'], mean: '不努力，只等好运' },
    { w: '亡羊补牢', idx: 1, ch: '羊', ds: ['牛', '马', '猪'], mean: '出了问题及时补救' },
    { w: '井底之蛙', idx: 3, ch: '蛙', ds: ['鱼', '虫', '鸟'], mean: '见识很小' },
    { w: '狐假虎威', idx: 1, ch: '假', ds: ['真', '借', '装'], mean: '借别人的威风吓唬人' },
    { w: '对牛弹琴', idx: 1, ch: '牛', ds: ['马', '羊', '猫'], mean: '对不懂的人讲道理' },
    { w: '掩耳盗铃', idx: 3, ch: '铃', ds: ['钟', '鼓', '门'], mean: '自己骗自己' },
    { w: '拔苗助长', idx: 1, ch: '苗', ds: ['草', '花', '树'], mean: '急于求成，反而坏事' },
    { w: '半途而废', idx: 0, ch: '半', ds: ['一', '全', '中'], mean: '事情做到一半就停下' }
  ];

  /* 短文：一年级长度（50~90 字），每篇两问，答案都能在文中找到 */
  var PASSAGES = [
    {
      title: '小松鼠找花生', text: '秋天到了，小松鼠在地里找花生。它用小爪子挖呀挖，挖出了许多花生。小松鼠高兴地捧着花生回家了。',
      qs: [
        { stem: '小松鼠在做什么？', options: ['找花生', '摘苹果', '种树'], answer: 0, explain: '短文第一句就说小松鼠在地里找花生。' },
        { stem: '小松鼠的心情怎样？', options: ['高兴', '难过', '生气'], answer: 0, explain: '短文写它「高兴地捧着花生回家了」。' }
      ]
    },
    {
      title: '小兔的雨伞', text: '下雨了，小兔没有带伞。小青蛙举着一片大荷叶走过来，说：「快躲到荷叶下面吧！」小兔和小青蛙一起回家了。',
      qs: [
        { stem: '谁把荷叶给小兔当伞？', options: ['小青蛙', '小鸭子', '小鸡'], answer: 0, explain: '是小青蛙举着大荷叶走过来的。' },
        { stem: '故事发生在什么天气？', options: ['下雨', '下雪', '晴天'], answer: 0, explain: '短文开头就是「下雨了」。' }
      ]
    },
    {
      title: '春天来了', text: '春天来了，小草绿了，桃花开了。燕子从南方飞回来，在屋檐下筑窝。小朋友脱下厚棉衣，在草地上放风筝。',
      qs: [
        { stem: '春天，什么花开了？', options: ['桃花', '菊花', '梅花'], answer: 0, explain: '短文写「小草绿了，桃花开了」。' },
        { stem: '燕子从哪里飞回来？', options: ['南方', '北方', '东方'], answer: 0, explain: '短文写「燕子从南方飞回来」。' }
      ]
    },
    {
      title: '我的小书包', text: '我有一个小书包，它是蓝色的。书包里有语文书、数学书和文具盒。每天上学，我都背着它，它是我形影不离的好朋友。',
      qs: [
        { stem: '小书包是什么颜色？', options: ['蓝色', '红色', '黄色'], answer: 0, explain: '短文写「它是蓝色的」。' },
        { stem: '书包里没有什么？', options: ['玩具熊', '语文书', '文具盒'], answer: 0, explain: '短文只提到语文书、数学书和文具盒。' }
      ]
    },
    {
      title: '小蚂蚁搬米', text: '一只小蚂蚁发现了一粒米，它搬不动，就回家叫来了许多小伙伴。大家一起用力，很快把米搬回了家。',
      qs: [
        { stem: '小蚂蚁叫来了谁？', options: ['小伙伴', '老师', '小狗'], answer: 0, explain: '短文写它「回家叫来了许多小伙伴」。' },
        { stem: '米是怎么搬回家的？', options: ['大家一起搬', '小蚂蚁自己搬', '风吹回去的'], answer: 0, explain: '「大家一起用力」才把米搬回家。' }
      ]
    },
    {
      title: '月亮和星星', text: '晚上，月亮出来了，弯弯的像小船。星星一闪一闪的，像许多小眼睛。小明坐在院子里数星星，数也数不清。',
      qs: [
        { stem: '弯弯的月亮像什么？', options: ['小船', '圆盘', '大饼'], answer: 0, explain: '短文写月亮「弯弯的像小船」。' },
        { stem: '小明在数什么？', options: ['星星', '月亮', '灯笼'], answer: 0, explain: '短文写「小明坐在院子里数星星」。' }
      ]
    },
    {
      title: '秋天的树叶', text: '秋天到了，树叶黄了。风一吹，叶子从树上飘下来，像一只只黄蝴蝶。小红捡起一片，夹在书里做书签。',
      qs: [
        { stem: '树叶飘下来像什么？', options: ['蝴蝶', '小鸟', '小船'], answer: 0, explain: '短文写叶子「像一只只黄蝴蝶」。' },
        { stem: '小红把树叶做什么？', options: ['书签', '扇子', '小船'], answer: 0, explain: '短文写她「夹在书里做书签」。' }
      ]
    },
    {
      title: '小猫钓鱼', text: '小猫跟着妈妈去河边钓鱼。一只蜻蜓飞来了，小猫去捉蜻蜓；一只蝴蝶飞来了，小猫去捉蝴蝶。结果，小猫一条鱼也没钓到。',
      qs: [
        { stem: '小猫为什么没钓到鱼？', options: ['它不专心', '河里没有鱼', '鱼竿断了'], answer: 0, explain: '它一会儿捉蜻蜓、一会儿捉蝴蝶，不专心。' },
        { stem: '小猫去捉了什么？', options: ['蜻蜓和蝴蝶', '小鸟', '小鱼'], answer: 0, explain: '短文写它去捉蜻蜓和蝴蝶。' }
      ]
    },
    {
      title: '学校运动会', text: '今天学校开运动会。小明参加跑步，小红参加跳绳。同学们在旁边喊：「加油！加油！」大家都跑得满头大汗。',
      qs: [
        { stem: '小明参加什么比赛？', options: ['跑步', '跳绳', '跳远'], answer: 0, explain: '短文写「小明参加跑步」。' },
        { stem: '同学们在做什么？', options: ['喊加油', '看书', '唱歌'], answer: 0, explain: '同学们在旁边喊「加油」。' }
      ]
    },
    {
      title: '小雨点', text: '小雨点从云里落下来，落在屋顶上，滴答滴答；落在小河里，叮咚叮咚。小草喝了雨水，长得更绿了。',
      qs: [
        { stem: '小雨点落在屋顶上是什么声音？', options: ['滴答滴答', '叮咚叮咚', '哗啦哗啦'], answer: 0, explain: '短文写落在屋顶上「滴答滴答」。' },
        { stem: '小草喝了雨水怎么样？', options: ['更绿了', '更黄了', '枯了'], answer: 0, explain: '短文写小草「长得更绿了」。' }
      ]
    },
    {
      title: '过新年', text: '过年了，家家户户贴春联、挂灯笼。晚上，一家人围在一起吃年夜饭。小朋友给爷爷奶奶拜年，收到了大红包。',
      qs: [
        { stem: '过年时家家户户挂什么？', options: ['灯笼', '风车', '风筝'], answer: 0, explain: '短文写「贴春联、挂灯笼」。' },
        { stem: '小朋友收到什么？', options: ['红包', '书包', '玩具'], answer: 0, explain: '短文写小朋友「收到了大红包」。' }
      ]
    },
    {
      title: '小树苗', text: '春天，我在院子里种下一棵小树苗。我每天给它浇水，还给它松土。小树苗长出了嫩绿的新叶子。',
      qs: [
        { stem: '「我」每天给小树苗做什么？', options: ['浇水', '唱歌', '讲故事'], answer: 0, explain: '短文写「我每天给它浇水，还给它松土」。' },
        { stem: '小树苗长出了什么？', options: ['新叶子', '花朵', '果子'], answer: 0, explain: '短文写它「长出了嫩绿的新叶子」。' }
      ]
    },
    {
      title: '小鸭子学游泳', text: '鸭妈妈带着小鸭子来到池塘边。小鸭子不敢下水，鸭妈妈说：「别怕，妈妈扶着你。」小鸭子慢慢下了水，很快就学会了。',
      qs: [
        { stem: '小鸭子一开始敢下水吗？', options: ['不敢', '敢', '很想下'], answer: 0, explain: '短文写「小鸭子不敢下水」。' },
        { stem: '谁扶着小鸭子下水？', options: ['鸭妈妈', '小青蛙', '小鸡'], answer: 0, explain: '鸭妈妈说「妈妈扶着你」。' }
      ]
    },
    {
      title: '爷爷的菜园', text: '爷爷的菜园里有白菜、萝卜和西红柿。爷爷每天给菜浇水，还拔草。秋天，菜园里结满了果实，爷爷笑得很开心。',
      qs: [
        { stem: '菜园里没有什么？', options: ['苹果', '白菜', '萝卜'], answer: 0, explain: '短文提到白菜、萝卜和西红柿，没有苹果。' },
        { stem: '爷爷每天给菜做什么？', options: ['浇水', '施肥', '捉虫'], answer: 0, explain: '短文写「每天给菜浇水，还拔草」。' }
      ]
    },
    {
      title: '下雪了', text: '下雪了，地上白了，树上也白了。小朋友穿上棉衣，戴上手套，在雪地里堆雪人。雪人的鼻子是一根胡萝卜。',
      qs: [
        { stem: '雪人的鼻子是什么做的？', options: ['胡萝卜', '石头', '树枝'], answer: 0, explain: '短文写「雪人的鼻子是一根胡萝卜」。' },
        { stem: '小朋友在雪地里做什么？', options: ['堆雪人', '放风筝', '游泳'], answer: 0, explain: '短文写小朋友「在雪地里堆雪人」。' }
      ]
    },
    {
      title: '小蜜蜂采蜜', text: '春天，花园里的花开了。小蜜蜂提着一个小桶，在花丛中飞来飞去采花蜜。它采了满满一桶，高高兴兴地飞回家了。',
      qs: [
        { stem: '小蜜蜂在做什么？', options: ['采花蜜', '搬家', '唱歌'], answer: 0, explain: '短文写小蜜蜂「采花蜜」。' },
        { stem: '小蜜蜂把花蜜采到哪里？', options: ['小桶里', '篮子里', '口袋里'], answer: 0, explain: '短文写它「提着一个小桶」。' }
      ]
    },
    {
      title: '值日生', text: '今天轮到小明和小红值日。小明擦黑板，小红扫地。他们把教室打扫得干干净净，老师说：「你们真是爱劳动的好孩子。」',
      qs: [
        { stem: '小明值日做什么？', options: ['擦黑板', '扫地', '擦桌子'], answer: 0, explain: '短文写「小明擦黑板，小红扫地」。' },
        { stem: '老师夸他们什么？', options: ['爱劳动', '学习好', '唱歌好'], answer: 0, explain: '老师说他们是「爱劳动的好孩子」。' }
      ]
    },
    {
      title: '小蝌蚪找妈妈', text: '池塘里有一群小蝌蚪，长着大脑袋、黑身子。它们游呀游，先长出两条后腿，又长出两条前腿，最后变成了小青蛙，找到了妈妈。',
      qs: [
        { stem: '小蝌蚪最后变成了什么？', options: ['小青蛙', '小鱼', '小虾'], answer: 0, explain: '短文写它们「最后变成了小青蛙」。' },
        { stem: '小蝌蚪先长出什么？', options: ['后腿', '前腿', '尾巴'], answer: 0, explain: '短文写「先长出两条后腿」。' }
      ]
    },
    {
      title: '雨中的伞', text: '放学时下起了大雨。小明没带伞，站在校门口发愁。小红走过来，把伞举到小明头上，说：「我们一起走吧。」',
      qs: [
        { stem: '谁和小明一起打伞？', options: ['小红', '老师', '妈妈'], answer: 0, explain: '小红把伞举到小明头上，说一起走。' },
        { stem: '放学时天气怎样？', options: ['下大雨', '出太阳', '下雪'], answer: 0, explain: '短文写「下起了大雨」。' }
      ]
    },
    {
      title: '小闹钟', text: '我有一个小闹钟，圆圆的脸上有三根针。每天早晨六点，它就叮铃铃地响，叫我起床。它是我准时上学的好帮手。',
      qs: [
        { stem: '小闹钟每天几点响？', options: ['六点', '七点', '八点'], answer: 0, explain: '短文写「每天早晨六点」。' },
        { stem: '小闹钟是什么形状？', options: ['圆形', '方形', '三角形'], answer: 0, explain: '短文写它「圆圆的脸上有三根针」。' }
      ]
    }
  ];

  /* ---------------- 工具 ---------------- */
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
  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }
  function shuffled(r, arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function uniq(arr) {
    var seen = {}, out = [];
    arr.forEach(function (x) { if (!seen[x]) { seen[x] = 1; out.push(x); } });
    return out;
  }

  /* 近义词分组：同组不能互相当干扰项，否则会出现两个正确答案 */
  var SYN_GROUP_OF = {};
  SYNONYM_GROUPS.forEach(function (g, gi) {
    g.forEach(function (word) {
      SYN_GROUP_OF[word] = gi;
    });
  });
  /* 近义词题用到的词对：组内两两组合，取一部分（全组合太多，也没必要） */
  var SYN_PAIRS = [];
  SYNONYM_GROUPS.forEach(function (g) {
    for (var i = 0; i < g.length; i++) {
      for (var j = i + 1; j < g.length; j++) SYN_PAIRS.push([g[i], g[j]]);
    }
  });

  /* 每册的取词游标：按单元顺序往后走，不回头 */
  var CUR = {};
  function cursor(code) {
    if (!CUR[code]) CUR[code] = { a: 0, s: 0, i: 0, p: 0 };
    return CUR[code];
  }

  /* 反义词题：正确项是 b，干扰项从别的词对里取（不能取到 a 的另一个反义） */
  function antonymItem(pair, flip, form, r) {
    var a = flip ? pair[1] : pair[0];
    var b = flip ? pair[0] : pair[1];
    var pool = [];
    ANTONYMS.forEach(function (p) {
      if (p.indexOf(a) >= 0 || p.indexOf(b) >= 0) return;
      pool.push(p[0], p[1]);
    });
    pool = uniq(pool);
    var ds = shuffled(r, pool).slice(0, 3);
    if (ds.length < 3) return null;
    var opts = shuffled(r, [b].concat(ds));
    var stem = form === 0
      ? '「' + a + '」的反义词是哪个？'
      : '和「' + a + '」意思相反的词是哪个？';
    return {
      stem: stem,
      options: opts, answer: opts.indexOf(b),
      explain: '「' + a + '」和「' + b + '」意思相反。'
    };
  }

  function synonymItem(pair, flip, form, r) {
    var a = flip ? pair[1] : pair[0];
    var b = flip ? pair[0] : pair[1];
    var gid = SYN_GROUP_OF[a];
    var pool = [];
    Object.keys(SYN_GROUP_OF).forEach(function (word) {
      if (SYN_GROUP_OF[word] === gid) return;
      pool.push(word);
    });
    var ds = shuffled(r, uniq(pool)).slice(0, 3);
    if (ds.length < 3) return null;
    var opts = shuffled(r, [b].concat(ds));
    var stem = form === 0
      ? '「' + a + '」的近义词是哪个？'
      : '和「' + a + '」意思相近的词是哪个？';
    return {
      stem: stem,
      options: opts, answer: opts.indexOf(b),
      explain: '「' + a + '」和「' + b + '」意思相近。'
    };
  }

  /* 成语两问：补字 / 看意思选成语 */
  function idiomItem(d, form, r) {
    var chars = d.w.split('');
    var miss = chars[d.idx];
    var shown = chars.slice(); shown[d.idx] = '（ ）';
    if (form === 0) {
      var opts = shuffled(r, [d.ch].concat(d.ds.slice(0, 3)));
      return {
        stem: '成语「' + shown.join('') + '」括号里填哪个字？',
        options: opts, answer: opts.indexOf(d.ch),
        explain: '「' + d.w + '」的「' + miss + '」是' + d.ch + '字，意思是' + d.mean + '。'
      };
    }
    var others = IDIOMS.filter(function (x) { return x.w !== d.w; });
    var ds = shuffled(r, others).slice(0, 3);
    if (ds.length < 3) return null;
    var opts2 = shuffled(r, [d.w].concat(ds.map(function (x) { return x.w; })));
    return {
      stem: d.mean.replace(/，/g, '、') + '，用哪个成语？',
      options: opts2, answer: opts2.indexOf(d.w),
      explain: '「' + d.w + '」的意思是' + d.mean + '。'
    };
  }

  /* ---------------- 对外接口 ----------------
     ctx = { code, prefix, unit, node, ni, unitIndex, unitCount, used }
     used：本册已用题干表（YWBuilder 的 USED_STEM），防止同册重复 */
  function build(ctx) {
    var out = [];
    var ui = ctx.unitIndex || 0;
    var used = ctx.used || {};
    var code = ctx.code || 'yw';
    var cur = cursor(code);
    var r = rng(code + '|' + ctx.unit.id + '|' + ctx.node.id);
    var total = ctx.unitCount || 9;
    /* 学期越往后，单课带的题型越多 */
    var wantAnti = ui >= 2 ? 1 : 0;
    var wantSyn = ui >= 3 ? 1 : 0;
    var wantIdiom = ui >= 5 ? 1 : 0;
    /* 短文阅读：每单元最后一课必有一篇，另外每隔一课再加一篇。
       一下没有拼音单元，从第三单元就开始读。 */
    var isLast = (ctx.ni === (ctx.niTotal - 1));
    var readStart = (ctx.code === 'yw1b') ? 2 : 5;
    var readNode = ui >= readStart && (isLast || ctx.ni % 2 === 1);
    var wantRead = readNode ? 2 : 0;
    /* 最后一个单元再多一道成语，给期末复习加密度 */
    if (ui >= total - 2) wantIdiom += 1;

    /* 取词顺序：词表走一圈 → 反过来问一圈 → 换一种问法再走两圈。
       这样每个词的正反两个方向都能用上，一册里 60 对反义词够铺满所有单元。 */
    function takeAnt() {
      var N = ANTONYMS.length;
      for (var n = 0; n < N * 4; n++) {
        var k = cur.a++;
        var pair = ANTONYMS[k % N];
        var flip = Math.floor(k / N) % 2 === 1;
        var form = Math.floor(k / (N * 2)) % 2;
        var it = antonymItem(pair, flip, form, r);
        if (!it || used[it.stem]) continue;
        return it;
      }
      return null;
    }
    function takeSyn() {
      var N = SYN_PAIRS.length;
      for (var n = 0; n < N * 4; n++) {
        var k = cur.s++;
        var pair = SYN_PAIRS[k % N];
        var flip = Math.floor(k / N) % 2 === 1;
        var form = Math.floor(k / (N * 2)) % 2;
        var it = synonymItem(pair, flip, form, r);
        if (!it || used[it.stem]) continue;
        return it;
      }
      return null;
    }
    function takeIdiom() {
      var N = IDIOMS.length;
      for (var n = 0; n < N * 4; n++) {
        var k = cur.i++;
        var d = IDIOMS[k % N];
        var form = Math.floor(k / N) % 2;
        var it = idiomItem(d, form, r);
        /* 看意思选成语的问法太长会超题干上限，退回「补字」问法 */
        if (it && it.stem.length > 24) it = idiomItem(d, 0, r);
        if (!it || used[it.stem]) continue;
        return it;
      }
      return null;
    }

    function push(it, kind, level, skill) {
      if (!it) return;
      it.skill = skill;
      it.level = level;
      it.ext = kind;
      out.push(it);
    }

    if (wantAnti) push(takeAnt(), 'antonym', 2, '词义.反义词');
    if (wantSyn) push(takeSyn(), 'synonym', 2, '词义.近义词');
    if (wantIdiom) push(takeIdiom(), 'idiom', 3, '成语.积累');

    /* 短文阅读：一篇两问，题干短、答案都能在文中找到 */
    var reads = [];
    if (wantRead) {
      var p = PASSAGES[cur.p % PASSAGES.length];
      cur.p++;
      reads = p.qs.slice(0, wantRead).map(function (q) {
        return {
          stem: q.stem,
          options: q.options.slice(), answer: q.answer,
          explain: q.explain,
          fig: { type: 'passage', title: p.title, text: p.text },
          skill: '阅读.短文理解', level: 3, ext: 'reading'
        };
      });
      /* 同一篇短文的问句若已在本册出现过（极少），直接丢掉 */
      reads = reads.filter(function (q) { return !used[q.stem]; });
    }

    return { items: out, reads: reads };
  }

  w.YWExtra = {
    build: build,
    /* 给自检用 */
    stats: function () {
      return { antonyms: ANTONYMS.length, synonyms: SYN_PAIRS.length, idioms: IDIOMS.length, passages: PASSAGES.length };
    },
    ANTONYMS: ANTONYMS, SYNONYM_GROUPS: SYNONYM_GROUPS, IDIOMS: IDIOMS, PASSAGES: PASSAGES
  };
})(window);
