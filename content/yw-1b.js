/* 语文 · 一年级下册（人教版统编 2024 修订版）· 节点规格
   结构同上册：每节点 5 字 + 一组拼音课型，题目由 yw-builder.js 生成。
   下册拼音已学完，拼音题以「辨析复习」为主（平翘舌 / 前后鼻音 / 整体认读）。 */
(function (w) {
  'use strict';

  var UNITS = [
    {
      id: 'u1', name: '第一单元 · 识字（春夏秋冬）',
      nodes: [
        { id: 'n1', lesson: '春夏秋冬', title: '春风 夏雨 秋霜 冬雪', chars: ['春', '风', '冬', '雪', '花'], py: 'ang' },
        { id: 'n2', lesson: '春夏秋冬', title: '池草青 山花红', chars: ['飞', '入', '风', '雪', '春'], py: 'review' },
        { id: 'n3', lesson: '姓氏歌', title: '你姓什么', chars: ['姓', '什', '么', '双', '国'], py: 'zhchsh' },
        { id: 'n4', lesson: '姓氏歌', title: '中国姓氏多', chars: ['王', '方', '姓', '双', '国'], py: 'zcs' },
        { id: 'n5', lesson: '小青蛙', title: '青草 清水 晴天', chars: ['青', '清', '气', '生', '情'], py: 'an' },
        { id: 'n6', lesson: '小青蛙', title: '请你保护小青蛙', chars: ['请', '晴', '清', '青', '生'], py: 'ang' },
        { id: 'n7', lesson: '猜字谜', title: '猜一猜是什么字', chars: ['字', '左', '右', '时', '动'], py: 'zcs' },
        { id: 'n8', lesson: '猜字谜', title: '一边绿 一边红', chars: ['万', '无', '时', '动', '字'], py: 'review' }
      ]
    },
    {
      id: 'u2', name: '第二单元 · 课文（心愿与家人）',
      nodes: [
        { id: 'n1', lesson: '吃水不忘挖井人', title: '吃水不忘挖井人', chars: ['吃', '忘', '井', '村', '叫'], py: 'zhchsh' },
        { id: 'n2', lesson: '吃水不忘挖井人', title: '想念毛主席', chars: ['主', '乡', '亲', '战', '士'], py: 'an' },
        { id: 'n3', lesson: '我多想去看看', title: '我多想去看看', chars: ['想', '念', '告', '诉', '门'], py: 'ang' },
        { id: 'n4', lesson: '我多想去看看', title: '天安门广场', chars: ['广', '场', '非', '常', '观'], py: 'review' },
        { id: 'n5', lesson: '一个接一个', title: '一个接一个', chars: ['接', '各', '种', '伙', '伴'], py: 'ai' },
        { id: 'n6', lesson: '一个接一个', title: '却也很开心', chars: ['却', '也', '趣', '接', '伙'], py: 'ao' },
        { id: 'n7', lesson: '四个太阳', title: '四个太阳', chars: ['太', '阳', '道', '送', '忙'], py: 'ang' },
        { id: 'n8', lesson: '四个太阳', title: '香甜的梦', chars: ['尝', '香', '甜', '温', '暖'], py: 'an' },
        { id: 'n9', lesson: '复习', title: '第一二单元复习', chars: ['该', '颜', '因', '想', '忘'], py: 'review' }
      ]
    },
    {
      id: 'u3', name: '第三单元 · 课文（伙伴与快乐）',
      nodes: [
        { id: 'n1', lesson: '小公鸡和小鸭子', title: '小公鸡和小鸭子', chars: ['块', '捉', '急', '直', '河'], py: 'zcs' },
        { id: 'n2', lesson: '小公鸡和小鸭子', title: '急得直哭', chars: ['行', '死', '信', '跟', '忽'], py: 'zhchsh' },
        { id: 'n3', lesson: '小公鸡和小鸭子', title: '喊救命', chars: ['喊', '身', '块', '河', '直'], py: 'an' },
        { id: 'n4', lesson: '树和喜鹊', title: '一棵树 一只鸟', chars: ['只', '窝', '孤', '单', '都'], py: 'ao' },
        { id: 'n5', lesson: '树和喜鹊', title: '邻居 招呼', chars: ['邻', '居', '招', '呼', '静'], py: 'ie' },
        { id: 'n6', lesson: '怎么都快乐', title: '怎么都快乐', chars: ['怎', '独', '跳', '绳', '讲'], py: 'ai' },
        { id: 'n7', lesson: '怎么都快乐', title: '一起打球做游戏', chars: ['戏', '排', '得', '羽', '球'], py: 'review' }
      ]
    },
    {
      id: 'u4', name: '第四单元 · 课文（夜色与节日）',
      nodes: [
        { id: 'n1', lesson: '静夜思', title: '静夜思', chars: ['夜', '思', '床', '光', '疑'], py: 'an' },
        { id: 'n2', lesson: '静夜思', title: '举头望明月', chars: ['举', '望', '低', '故', '夜'], py: 'ang' },
        { id: 'n3', lesson: '夜色', title: '夜色真美', chars: ['色', '外', '晚', '笑', '再'], py: 'ai' },
        { id: 'n4', lesson: '端午粽', title: '端午粽', chars: ['端', '午', '节', '粽', '总'], py: 'an' },
        { id: 'n5', lesson: '端午粽', title: '粽子里的味道', chars: ['分', '豆', '肉', '带', '知'], py: 'ao' },
        { id: 'n6', lesson: '端午粽', title: '据说 纪念', chars: ['据', '端', '午', '节', '粽'], py: 'review' },
        { id: 'n7', lesson: '彩虹', title: '彩虹', chars: ['虹', '座', '浇', '提', '洒'], py: 'ie' },
        { id: 'n8', lesson: '彩虹', title: '一面镜子', chars: ['挑', '镜', '拿', '照', '千'], py: 'ang' },
        { id: 'n9', lesson: '彩虹', title: '花裙子飘啊飘', chars: ['裙', '飘', '虹', '提', '洒'], py: 'ai' }
      ]
    },
    {
      id: 'u5', name: '第五单元 · 识字（动物与运动）',
      nodes: [
        { id: 'n1', lesson: '动物儿歌', title: '动物儿歌', chars: ['间', '造', '迷', '运', '池'], py: 'an' },
        { id: 'n2', lesson: '动物儿歌', title: '蚂蚁搬家', chars: ['网', '池', '间', '运', '造'], py: 'ang' },
        { id: 'n3', lesson: '古对今', title: '古对今', chars: ['古', '细', '夕', '李', '语'], py: 'zcs' },
        { id: 'n4', lesson: '操场上', title: '操场上真热闹', chars: ['操', '场', '拔', '拍', '跑'], py: 'ao' },
        { id: 'n5', lesson: '操场上', title: '踢球 跳绳', chars: ['踢', '铃', '热', '闹', '操'], py: 'ang' },
        { id: 'n6', lesson: '操场上', title: '锻炼身体', chars: ['锻', '炼', '跑', '踢', '拍'], py: 'an' },
        { id: 'n7', lesson: '人之初', title: '人之初', chars: ['之', '初', '性', '善', '习'], py: 'zhchsh' },
        { id: 'n8', lesson: '人之初', title: '习相远', chars: ['教', '迁', '贵', '专', '善'], py: 'review' }
      ]
    },
    {
      id: 'u6', name: '第六单元 · 课文（古诗与夏天）',
      nodes: [
        { id: 'n1', lesson: '古诗二首', title: '池上', chars: ['首', '池', '采', '爱', '柔'], py: 'ai' },
        { id: 'n2', lesson: '古诗二首', title: '小池', chars: ['荷', '露', '角', '池', '采'], py: 'an' },
        { id: 'n3', lesson: '荷叶圆圆', title: '荷叶圆圆', chars: ['珠', '摇', '篮', '晶', '停'], py: 'ang' },
        { id: 'n4', lesson: '荷叶圆圆', title: '透明的翅膀', chars: ['机', '透', '翅', '膀', '唱'], py: 'ie' },
        { id: 'n5', lesson: '荷叶圆圆', title: '一朵朵荷花', chars: ['朵', '荷', '珠', '摇', '篮'], py: 'ao' },
        { id: 'n6', lesson: '要下雨了', title: '要下雨了', chars: ['腰', '坡', '沉', '伸', '潮'], py: 'an' },
        { id: 'n7', lesson: '要下雨了', title: '潮湿 闷热', chars: ['湿', '闷', '消', '息', '搬'], py: 'ai' },
        { id: 'n8', lesson: '要下雨了', title: '哗哗下雨了', chars: ['阵', '哗', '坡', '沉', '腰'], py: 'ang' }
      ]
    },
    {
      id: 'u7', name: '第七单元 · 课文（好习惯）',
      nodes: [
        { id: 'n1', lesson: '文具的家', title: '文具的家', chars: ['文', '具', '次', '丢', '哪'], py: 'an' },
        { id: 'n2', lesson: '文具的家', title: '新的文具盒', chars: ['新', '每', '平', '她', '些'], py: 'ang' },
        { id: 'n3', lesson: '文具的家', title: '仔细检查', chars: ['仔', '检', '查', '所', '文'], py: 'zcs' },
        { id: 'n4', lesson: '一分钟', title: '一分钟', chars: ['钟', '元', '迟', '洗', '背'], py: 'zhchsh' },
        { id: 'n5', lesson: '一分钟', title: '很快就决定', chars: ['刚', '共', '汽', '决', '定'], py: 'ai' },
        { id: 'n6', lesson: '动物王国开大会', title: '动物王国开大会', chars: ['物', '虎', '熊', '通', '注'], py: 'an' },
        { id: 'n7', lesson: '动物王国开大会', title: '注意 准时', chars: ['意', '百', '舌', '鬼', '脸'], py: 'ao' },
        { id: 'n8', lesson: '动物王国开大会', title: '第一号通知', chars: ['准', '第', '已', '经', '元'], py: 'zhchsh' },
        { id: 'n9', lesson: '小猴子下山', title: '小猴子下山', chars: ['猴', '结', '掰', '扛', '追'], py: 'ao' },
        { id: 'n10', lesson: '小猴子下山', title: '捧着西瓜往回走', chars: ['摘', '捧', '瓜', '抱', '蹦'], py: 'ang' }
      ]
    },
    {
      id: 'u8', name: '第八单元 · 课文（朋友与互助）',
      nodes: [
        { id: 'n1', lesson: '棉花姑娘', title: '棉花姑娘', chars: ['棉', '姑', '娘', '治', '蚜'], py: 'an' },
        { id: 'n2', lesson: '棉花姑娘', title: '盼着有人来', chars: ['盼', '啊', '吐', '棉', '治'], py: 'ai' },
        { id: 'n3', lesson: '咕咚', title: '咕咚来了', chars: ['咕', '咚', '熟', '掉', '吓'], py: 'ang' },
        { id: 'n4', lesson: '咕咚', title: '逃命 野牛', chars: ['羊', '逃', '命', '野', '咕'], py: 'ao' },
        { id: 'n5', lesson: '咕咚', title: '一个熟透的瓜', chars: ['掉', '熟', '咚', '吓', '逃'], py: 'ie' },
        { id: 'n6', lesson: '小壁虎借尾巴', title: '小壁虎借尾巴', chars: ['壁', '虎', '借', '蚊', '蛇'], py: 'ie' },
        { id: 'n7', lesson: '小壁虎借尾巴', title: '您把尾巴借给我', chars: ['断', '您', '拨', '甩', '赶'], py: 'an' },
        { id: 'n8', lesson: '小壁虎借尾巴', title: '又长出一条尾巴', chars: ['房', '壁', '借', '断', '您'], py: 'review' }
      ]
    }
  ];

  var content = w.YWBuilder.build(UNITS, {
    bookId: 'yw-1b', code: 'yw1b', name: '语文 · 一年级下册'
  });

  w.CONTENT = w.CONTENT || {};
  w.CONTENT['yw-1b'] = content;
})(window);
