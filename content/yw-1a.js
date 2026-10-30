/* 语文 · 一年级上册（人教版统编 2024 修订版）· 节点规格
   每个节点 = 一场语文任务：认字 5 字 + 一组拼音课型，题目由 yw-builder.js 生成。 */
(function (w) {
  'use strict';

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

  var content = w.YWBuilder.build(UNITS, {
    bookId: 'yw-1a', code: 'yw1a', name: '语文 · 一年级上册'
  });

  w.CONTENT = w.CONTENT || {};
  w.CONTENT['yw-1a'] = content;
})(window);
