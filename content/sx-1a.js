/* 数学 · 一年级上册（人教版 2024 修订版）· 节点数据
   每节点 5 题：情境应用题 / 看图列式 / 比多比少 / 逆向思考为主，
   纯算式题 ≤ 1 题（红线 20%）。 */
(function (w) {
  'use strict';

  var M = w.SXBuilder.M, TPL = w.SXBuilder.TPL;

  var UNITS = [
    {
      id: 'u0', name: '准备课 · 数学游戏', nodes: [
        {
          id: 'n1', lesson: '在校园里找一找', title: '数一数 · 比多少', items: [
            M({
              skill: '准备.数数', level: 1,
              stem: '图上有几只小鸟？', fig: { type: 'objects', icon: '🐦', groups: [3] },
              answer: 3, unit: '只', explain: '一只一只数：1、2、3，一共 3 只。'
            }),
            M({
              skill: '准备.比多少', level: 1, type: 'compare',
              stem: '苹果和梨，哪个多？', fig: { type: 'twoRows', left: { icon: '🍎', n: 4, label: '苹果' }, right: { icon: '🍐', n: 2, label: '梨' } },
              options: ['苹果多', '梨多', '一样多'], answer: 0,
              explain: '苹果 4 个，梨 2 个，4 比 2 多，所以苹果多。'
            }),
            M({
              skill: '准备.方位', level: 1,
              stem: '小猫在小桌的哪一边？', fig: { type: 'objects', icon: '🐱', groups: [1], suffix: '🐱 🪑' },
              options: ['左边', '右边', '上面'], answer: 0,
              explain: '小猫在小桌的左边。'
            }),
            M({
              skill: '准备.数数', level: 2,
              stem: '一共有几个小朋友在玩？', fig: { type: 'objects', icon: '🧒', groups: [2, 3] },
              answer: 5, unit: '个', explain: '2 个加 3 个，一共 5 个。'
            }),
            M({
              skill: '准备.分类', level: 2,
              stem: '下面哪个不是水果？', fig: { type: 'objects', icon: '🍎', groups: [3] },
              options: ['苹果', '香蕉', '白菜'], answer: 2,
              explain: '白菜是蔬菜，不是水果。'
            })
          ]
        },
        {
          id: 'n2', lesson: '在操场上玩一玩', title: '比长短 · 比高矮', items: [
            M({
              skill: '准备.比长短', level: 1,
              stem: '哪根跳绳更长？', fig: { type: 'objects', icon: '🪢', groups: [1], suffix: '🪢🪢🪢  vs  🪢' },
              options: ['左边的长', '右边的长', '一样长'], answer: 0,
              explain: '左边的跳绳绕的圈多，更长。'
            }),
            M({
              skill: '准备.比高矮', level: 1,
              stem: '大树和小树，谁高？', fig: { type: 'objects', icon: '🌳', groups: [1], suffix: '🌳  🌱' },
              options: ['大树高', '小树高', '一样高'], answer: 0,
              explain: '大树比小树高。'
            }),
            M({
              skill: '准备.数数', level: 1,
              stem: '操场上有几个球？', fig: { type: 'objects', icon: '⚽', groups: [4] },
              answer: 4, unit: '个', explain: '数一数：1、2、3、4。'
            }),
            M({
              skill: '准备.比多少', level: 2, type: 'compare',
              stem: '男生和女生，谁多？', fig: { type: 'twoRows', left: { icon: '👦', n: 5, label: '男生' }, right: { icon: '👧', n: 3, label: '女生' } },
              options: ['男生多', '女生多', '一样多'], answer: 0,
              explain: '男生 5 人，女生 3 人，男生多。'
            }),
            M({
              skill: '准备.分类', level: 2,
              stem: '这些图形里，圆形的有几个？',
              fig: { type: 'shapes', list: ['circle', 'square', 'circle', 'triangle'] },
              answer: 2, unit: '个', explain: '两个圆形：第 1 个和第 3 个。'
            })
          ]
        }
      ]
    },
    {
      id: 'u1', name: '第一单元 · 5 以内数的认识和加减法', nodes: [
        {
          id: 'n1', lesson: '1~5 的认识', title: '认识 1~5', items: [
            M({
              skill: '5以内.认数', level: 1,
              stem: '数一数，图上有几个桃子？', fig: { type: 'objects', icon: '🍑', groups: [4] },
              answer: 4, unit: '个', explain: '1、2、3、4，一共 4 个。'
            }),
            M({
              skill: '5以内.认数', level: 1,
              stem: '5 的后面一个数是几？',
              options: ['4', '6', '7'], answer: 1,
              explain: '数数时 5 的后面是 6。'
            }),
            M({
              skill: '5以内.数序', level: 2,
              stem: '按顺序数，3 的后面是几？',
              options: ['2', '4', '5'], answer: 1,
              explain: '1、2、3、4，3 的后面是 4。'
            }),
            M({
              skill: '5以内.认数', level: 1,
              stem: '3 个苹果用数字几表示？', fig: { type: 'objects', icon: '🍎', groups: [3] },
              answer: 3, unit: '个', explain: '3 个物体用数字 3 表示。'
            }),
            M({
              skill: '5以内.比较', level: 2, type: 'compare',
              stem: '小兔和小猴，谁少？', fig: { type: 'twoRows', left: { icon: '🐰', n: 5, label: '小兔' }, right: { icon: '🐵', n: 2, label: '小猴' } },
              options: ['小兔少', '小猴少', '一样多'], answer: 1,
              explain: '小猴 2 只，比小兔的 5 只少。'
            })
          ]
        },
        {
          id: 'n2', lesson: '比大小', title: '比一比：> < =', items: [
            M({
              skill: '5以内.比大小', level: 1,
              stem: '4 和 2 比，中间填什么？', fig: { type: 'objects', icon: '🍬', groups: [4, 2] },
              options: ['>', '<', '='], answer: 0,
              explain: '4 比 2 大，写成 4 > 2。'
            }),
            M({
              skill: '5以内.比大小', level: 1,
              stem: '3 和 3 比，中间填什么？',
              options: ['>', '<', '='], answer: 2,
              explain: '两个数一样大，用等号，3 = 3。'
            }),
            M({
              skill: '5以内.比大小', level: 2,
              stem: '哪个数最大？', options: ['2', '5', '3'], answer: 1,
              explain: '2、3、5 中，5 最大。'
            }),
            M({
              skill: '5以内.比大小', level: 2,
              stem: '一共有几只蝴蝶，比 3 多还是少？', fig: { type: 'objects', icon: '🦋', groups: [5] },
              options: ['比 3 多', '比 3 少', '一样多'], answer: 0,
              explain: '5 只蝴蝶，5 > 3，比 3 多。'
            }),
            M({
              skill: '5以内.比大小', level: 3,
              stem: '□ 里最大能填几？ □ < 4',
              options: ['3', '4', '5'], answer: 0,
              explain: '比 4 小的数里最大的是 3。'
            })
          ]
        },
        {
          id: 'n3', lesson: '第几', title: '认识第几', items: [
            M({
              skill: '5以内.序数', level: 1,
              stem: '从左往右数，小狗排第几？', fig: { type: 'objects', icon: '🐶', groups: [1], suffix: '🐱 🐶 🐰 🐻 🐼' },
              answer: 2, unit: '', explain: '小猫第 1，小狗第 2。'
            }),
            M({
              skill: '5以内.序数', level: 2,
              stem: '排队买票，小明前面有 2 人，他排第几？',
              answer: 3, unit: '', explain: '前面 2 人，小明是第 3 个。'
            }),
            M({
              skill: '5以内.序数', level: 2,
              stem: '5 个人排队，小红排最后，她排第几？',
              answer: 5, unit: '', explain: '5 个人排队，最后一个是第 5。'
            }),
            M({
              skill: '5以内.序数', level: 3,
              stem: '从右数，小兔排第 2，一共有 4 只小动物，从左数它排第几？',
              answer: 3, unit: '', explain: '4 只里从右数第 2，就是从左数第 3。'
            }),
            M({
              skill: '5以内.序数', level: 2,
              stem: '第 3 个盘子里有几个苹果？', fig: { type: 'objects', icon: '🍎', groups: [1, 2, 3, 1] },
              answer: 3, unit: '个', explain: '第 3 个盘子里有 3 个苹果。'
            })
          ]
        },
        {
          id: 'n4', lesson: '分与合', title: '2~5 的分与合', items: [
            M({
              skill: '5以内.分与合', level: 1,
              stem: '5 可以分成 2 和几？',
              answer: 3, unit: '', explain: '5 分成 2 和 3，因为 2 + 3 = 5。'
            }),
            M({
              skill: '5以内.分与合', level: 2,
              stem: '4 可以分成 1 和几？', fig: { type: 'objects', icon: '🍊', groups: [1, 3] },
              answer: 3, unit: '', explain: '4 分成 1 和 3。'
            }),
            M({
              skill: '5以内.分与合', level: 2,
              stem: '3 和 2 合起来是几？',
              answer: 5, unit: '', explain: '3 和 2 合起来是 5。'
            }),
            M({
              skill: '5以内.分与合', level: 3,
              stem: '把 5 个苹果分给两个盘子，有几种分法？',
              options: ['2 种', '4 种', '5 种'], answer: 1,
              explain: '5 可以分成 1和4、2和3、3和2、4和1，共 4 种。'
            }),
            TPL.sub({ a: 5, b: 2, name: '橘子', icon: '🍊', verb: '拿走' })
          ]
        },
        {
          id: 'n5', lesson: '加法', title: '认识加法', items: [
            M({
              skill: '5以内.加法', level: 1,
              stem: '图上有 3 只小鸟，又飞来 2 只，一共几只？',
              fig: { type: 'objects', icon: '🐦', groups: [3, 2] },
              answer: 5, unit: '只', explain: '合起来用加法：3 + 2 = 5。'
            }),
            TPL.add({ a: 2, b: 3, name: '气球', icon: '🎈', unit: '个' }),
            M({
              skill: '5以内.加法', level: 1, type: 'calc',
              stem: '算一算：1 + 3 = ?',
              answer: 4, unit: '', explain: '1 和 3 合起来是 4。'
            }),
            M({
              skill: '5以内.看图列式', level: 2,
              stem: '看图列式，□ 里填几？',
              fig: { type: 'eq', a: 2, b: 2, op: '+', blank: 'result' },
              answer: 4, unit: '', explain: '2 + 2 = 4。'
            }),
            M({
              skill: '5以内.加法', level: 3,
              stem: '小明有 2 支铅笔，妈妈又给他 2 支，现在几支？',
              answer: 4, unit: '支', explain: '2 + 2 = 4 支。'
            })
          ]
        },
        {
          id: 'n6', lesson: '减法', title: '认识减法', items: [
            M({
              skill: '5以内.减法', level: 1,
              stem: '盘子里有 5 个苹果，吃了 2 个，还剩几个？',
              fig: { type: 'objects', icon: '🍎', groups: [5, -2] },
              answer: 3, unit: '个', explain: '去掉 2 个用减法：5 − 2 = 3。'
            }),
            TPL.sub({ a: 4, b: 1, name: '糖果', icon: '🍬', verb: '吃' }),
            M({
              skill: '5以内.减法', level: 1, type: 'calc',
              stem: '算一算：5 − 3 = ?',
              answer: 2, unit: '', explain: '5 去掉 3 还剩 2。'
            }),
            M({
              skill: '5以内.看图列式', level: 2,
              stem: '看图列式，还剩几只？',
              fig: { type: 'objects', icon: '🐟', groups: [4, -2] },
              answer: 2, unit: '只', explain: '4 − 2 = 2 只。'
            }),
            M({
              skill: '5以内.减法', level: 3,
              stem: '树上有 5 只鸟，飞走 3 只，还剩几只？',
              fig: { type: 'objects', icon: '🐦', groups: [5, -3] },
              answer: 2, unit: '只', explain: '5 − 3 = 2 只。'
            })
          ]
        },
        {
          id: 'n7', lesson: '0', title: '认识 0', items: [
            M({
              skill: '5以内.0的认识', level: 1,
              stem: '盘子里一个苹果也没有，用数字几表示？',
              fig: { type: 'objects', icon: '🍎', groups: [0] },
              options: ['0', '1', '2'], answer: 0,
              explain: '一个也没有，用 0 表示。'
            }),
            M({
              skill: '5以内.0的加减', level: 2,
              stem: '3 − 3 = ?', options: ['0', '1', '3'], answer: 0,
              explain: '同样多的数相减得 0。'
            }),
            M({
              skill: '5以内.0的加减', level: 2,
              stem: '4 + 0 = ?',
              answer: 4, unit: '', explain: '任何数加 0，还是这个数。'
            }),
            M({
              skill: '5以内.0的加减', level: 3,
              stem: '鸟窝里有 2 只小鸟，都飞走了，还剩几只？',
              fig: { type: 'objects', icon: '🐦', groups: [2, -2] },
              answer: 0, unit: '只', explain: '2 − 2 = 0，一只也不剩。'
            }),
            M({
              skill: '5以内.0的认识', level: 2,
              stem: '尺子上最前面的数是几？',
              options: ['0', '1', '10'], answer: 0,
              explain: '尺子从 0 开始量。'
            })
          ]
        },
        {
          id: 'n8', lesson: '整理和复习', title: '5 以内综合练习', items: [
            TPL.add({ a: 3, b: 2, name: '积木', icon: '🧱', unit: '块' }),
            TPL.sub({ a: 5, b: 4, name: '饼干', icon: '🍪', verb: '吃' }),
            M({
              skill: '5以内.综合', level: 2, type: 'compare',
              stem: '红花和黄花，红花比黄花多几朵？',
              fig: { type: 'twoRows', left: { icon: '🌹', n: 5, label: '红花' }, right: { icon: '🌼', n: 2, label: '黄花' } },
              answer: 3, unit: '朵', explain: '5 − 2 = 3 朵。'
            }),
            M({
              skill: '5以内.综合', level: 3,
              stem: '小明有 4 颗糖，吃了 1 颗，又买了 2 颗，现在几颗？',
              answer: 5, unit: '颗', explain: '4 − 1 = 3，3 + 2 = 5 颗。'
            }),
            M({
              skill: '5以内.综合', level: 2,
              stem: '下面哪个算式得数最大？',
              options: ['2 + 2', '5 − 2', '1 + 2'], answer: 0,
              explain: '2+2=4，5−2=3，1+2=3，最大是 4。'
            })
          ]
        }
      ]
    },

    {
      id: 'u2', name: '第二单元 · 6~10 的认识和加减法', nodes: [
        {
          id: 'n1', lesson: '6~9 的认识', title: '认识 6~9', items: [
            M({
              skill: '10以内.认数', level: 1,
              stem: '数一数，一共有几个草莓？', fig: { type: 'objects', icon: '🍓', groups: [3, 4] },
              answer: 7, unit: '个', explain: '3 个加 4 个，一共 7 个。'
            }),
            M({
              skill: '10以内.数序', level: 1,
              stem: '7 的前面一个数是几？',
              options: ['6', '8', '9'], answer: 0,
              explain: '6、7、8，7 的前面是 6。'
            }),
            M({
              skill: '10以内.认数', level: 2,
              stem: '8 里面有 8 个一，还可以说 8 里面有几个一和几个一？',
              options: ['8 个一', '4 个一', '7 个一'], answer: 0,
              explain: '8 就是 8 个一。'
            }),
            M({
              skill: '10以内.数的组成', level: 2,
              stem: '9 可以分成 4 和几？',
              answer: 5, unit: '', explain: '4 + 5 = 9，所以 9 分成 4 和 5。'
            }),
            M({
              skill: '10以内.比大小', level: 2,
              stem: '8 和 6 比，哪个大？',
              options: ['8', '6', '一样大'], answer: 0,
              explain: '8 比 6 大。'
            })
          ]
        },
        {
          id: 'n2', lesson: '6、7 的组成', title: '6 和 7 的分与合', items: [
            M({
              skill: '10以内.6和7的组成', level: 1,
              stem: '6 可以分成 2 和几？',
              answer: 4, unit: '', explain: '2 + 4 = 6。'
            }),
            M({
              skill: '10以内.6和7的组成', level: 2,
              stem: '7 可以分成 3 和几？', fig: { type: 'objects', icon: '🍇', groups: [3, 4] },
              answer: 4, unit: '', explain: '3 + 4 = 7。'
            }),
            M({
              skill: '10以内.6和7的组成', level: 2,
              stem: '5 和 2 合起来是几？',
              answer: 7, unit: '', explain: '5 + 2 = 7。'
            }),
            TPL.add({ a: 5, b: 2, name: '小棒', icon: '🥢', unit: '根', level: 1 }),
            M({
              skill: '10以内.6和7的组成', level: 3,
              stem: '把 6 个球放进两个盒子，每个盒子至少 1 个，有几种放法？',
              options: ['3 种', '5 种', '6 种'], answer: 1,
              explain: '1-5、2-4、3-3、4-2、5-1，共 5 种。'
            })
          ]
        },
        {
          id: 'n3', lesson: '8、9 的组成', title: '8 和 9 的分与合', items: [
            M({
              skill: '10以内.8和9的组成', level: 1,
              stem: '8 可以分成 5 和几？',
              answer: 3, unit: '', explain: '5 + 3 = 8。'
            }),
            M({
              skill: '10以内.8和9的组成', level: 2,
              stem: '9 可以分成 6 和几？',
              answer: 3, unit: '', explain: '6 + 3 = 9。'
            }),
            M({
              skill: '10以内.8和9的组成', level: 2,
              stem: '4 和 4 合起来是几？',
              answer: 8, unit: '', explain: '4 + 4 = 8。'
            }),
            M({
              skill: '10以内.8和9的组成', level: 3,
              stem: '一个数分成 2 和 7，这个数是几？',
              answer: 9, unit: '', explain: '2 + 7 = 9。'
            }),
            TPL.sub({ a: 9, b: 4, name: '糖果', icon: '🍬', verb: '给弟弟' })
          ]
        },
        {
          id: 'n4', lesson: '6 和 7 的加减法', title: '6、7 的加减法', items: [
            M({
              skill: '10以内.6和7的加减', level: 1,
              stem: '有 4 个红球和 3 个蓝球，一共几个？',
              fig: { type: 'objects', icon: '⚽', groups: [4, 3] },
              answer: 7, unit: '个', explain: '4 + 3 = 7。'
            }),
            M({
              skill: '10以内.6和7的加减', level: 1, type: 'calc',
              stem: '算一算：6 − 2 = ?',
              answer: 4, unit: '', explain: '6 去掉 2 还剩 4。'
            }),
            TPL.sub({ a: 7, b: 3, name: '桃子', icon: '🍑', verb: '吃' }),
            M({
              skill: '10以内.看图列式', level: 2,
              stem: '看图列式，□ 里填几？',
              fig: { type: 'eq', a: 3, b: 4, op: '+', blank: 'result' },
              answer: 7, unit: '', explain: '3 + 4 = 7。'
            }),
            M({
              skill: '10以内.6和7的加减', level: 3,
              stem: '篮子里有 6 个鸡蛋，又放进 1 个，一共几个？',
              answer: 7, unit: '个', explain: '6 + 1 = 7。'
            })
          ]
        },
        {
          id: 'n5', lesson: '用加法解决问题', title: '用加法解决问题', items: [
            M({
              skill: '10以内.用加法解决问题', level: 2,
              stem: '树上有 4 只猴子，树下有 3 只，一共有几只？',
              fig: { type: 'objects', icon: '🐵', groups: [4, 3] },
              answer: 7, unit: '只', explain: '求一共用加法：4 + 3 = 7。'
            }),
            M({
              skill: '10以内.用加法解决问题', level: 2,
              stem: '小华折了 5 只纸鹤，小丽折了 4 只，两人一共折了几只？',
              answer: 9, unit: '只', explain: '5 + 4 = 9 只。'
            }),
            TPL.cmpAdd({ a: 3, b: 4, name: '贴纸', icon: '⭐' }),
            M({
              skill: '10以内.用加法解决问题', level: 3,
              stem: '第一排有 6 人，第二排比第一排多 2 人，第二排有几人？',
              answer: 8, unit: '人', explain: '比 6 多 2，就是 6 + 2 = 8。'
            }),
            M({
              skill: '10以内.用加法解决问题', level: 3,
              stem: '图书角有 5 本故事书和 4 本漫画书，一共几本？',
              answer: 9, unit: '本', explain: '5 + 4 = 9 本。'
            })
          ]
        },
        {
          id: 'n6', lesson: '用减法解决问题', title: '用减法解决问题', items: [
            M({
              skill: '10以内.用减法解决问题', level: 2,
              stem: '篮子里有 8 个苹果，拿走 3 个，还剩几个？',
              fig: { type: 'objects', icon: '🍎', groups: [8, -3] },
              answer: 5, unit: '个', explain: '8 − 3 = 5 个。'
            }),
            M({
              skill: '10以内.用减法解决问题', level: 2,
              stem: '停车场有 9 辆车，开走 4 辆，还剩几辆？',
              answer: 5, unit: '辆', explain: '9 − 4 = 5 辆。'
            }),
            M({
              skill: '10以内.比多比少', level: 3, type: 'compare',
              stem: '男生 7 人，女生 5 人，男生比女生多几人？',
              fig: { type: 'twoRows', left: { icon: '👦', n: 7, label: '男生' }, right: { icon: '👧', n: 5, label: '女生' } },
              answer: 2, unit: '人', explain: '7 − 5 = 2 人。'
            }),
            M({
              skill: '10以内.用减法解决问题', level: 3,
              stem: '有 10 块饼干，吃了 6 块，还剩几块？',
              answer: 4, unit: '块', explain: '10 − 6 = 4 块。'
            }),
            M({
              skill: '10以内.用减法解决问题', level: 3,
              stem: '小树上有 9 只鸟，飞走了 5 只，还剩几只？',
              fig: { type: 'objects', icon: '🐦', groups: [9, -5] },
              answer: 4, unit: '只', explain: '9 − 5 = 4 只。'
            })
          ]
        },
        {
          id: 'n7', lesson: '8 和 9 的加减法', title: '8、9 的加减法', items: [
            M({
              skill: '10以内.8和9的加减', level: 1,
              stem: '盒子里有 5 支红笔，3 支蓝笔，一共几支？',
              fig: { type: 'objects', icon: '🖍', groups: [5, 3] },
              answer: 8, unit: '支', explain: '5 + 3 = 8 支。'
            }),
            M({
              skill: '10以内.8和9的加减', level: 1, type: 'calc',
              stem: '算一算：9 − 4 = ?',
              answer: 5, unit: '', explain: '9 去掉 4 还剩 5。'
            }),
            TPL.sub({ a: 8, b: 6, name: '葡萄', icon: '🍇', verb: '吃' }),
            M({
              skill: '10以内.看图列式', level: 2,
              stem: '看图列式，还剩几只小船？',
              fig: { type: 'objects', icon: '⛵', groups: [9, -4] },
              answer: 5, unit: '只', explain: '9 − 4 = 5 只。'
            }),
            M({
              skill: '10以内.8和9的加减', level: 3,
              stem: '小美有 8 张画片，送给同学 2 张，还剩几张？',
              answer: 6, unit: '张', explain: '8 − 2 = 6 张。'
            })
          ]
        },
        {
          id: 'n8', lesson: '用加减法解决问题', title: '加减法综合应用', items: [
            M({
              skill: '10以内.综合解决问题', level: 2,
              stem: '花坛里有 6 朵红花和 2 朵白花，一共几朵？',
              fig: { type: 'objects', icon: '🌺', groups: [6, 2] },
              answer: 8, unit: '朵', explain: '6 + 2 = 8 朵。'
            }),
            M({
              skill: '10以内.综合解决问题', level: 2,
              stem: '一共 9 个气球，飞走了 3 个，还剩几个？',
              fig: { type: 'objects', icon: '🎈', groups: [9, -3] },
              answer: 6, unit: '个', explain: '9 − 3 = 6 个。'
            }),
            M({
              skill: '10以内.比多比少', level: 2, type: 'compare',
              stem: '小猫 5 只，小狗 8 只，小狗比小猫多几只？',
              fig: { type: 'twoRows', left: { icon: '🐱', n: 5, label: '小猫' }, right: { icon: '🐶', n: 8, label: '小狗' } },
              answer: 3, unit: '只', explain: '8 − 5 = 3 只。'
            }),
            M({
              skill: '10以内.综合解决问题', level: 3,
              stem: '车上有 7 人，下去 3 人，又上来 2 人，现在几人？',
              answer: 6, unit: '人', explain: '7 − 3 = 4，4 + 2 = 6 人。'
            }),
            M({
              skill: '10以内.综合解决问题', level: 3,
              stem: '小明有 6 元，买本子花了 2 元，还剩几元？',
              answer: 4, unit: '元', explain: '6 − 2 = 4 元。'
            })
          ]
        },
        {
          id: 'n9', lesson: '10 的认识', title: '认识 10', items: [
            M({
              skill: '10以内.认识10', level: 1,
              stem: '图上一共有几个格子被涂色？', fig: { type: 'tenframe', n: 10 },
              answer: 10, unit: '个', explain: '一行 5 个，两行 10 个。'
            }),
            M({
              skill: '10以内.10的组成', level: 2,
              stem: '10 可以分成 4 和几？', fig: { type: 'tenframe', n: 10 },
              answer: 6, unit: '', explain: '4 + 6 = 10。'
            }),
            M({
              skill: '10以内.10的组成', level: 2,
              stem: '7 和几合起来是 10？',
              answer: 3, unit: '', explain: '7 + 3 = 10。'
            }),
            M({
              skill: '10以内.认识10', level: 2,
              stem: '10 里面有 10 个几？',
              options: ['一', '十', '二'], answer: 0,
              explain: '10 里面有 10 个一。'
            }),
            M({
              skill: '10以内.10的组成', level: 3,
              stem: '一双筷子有 2 根，5 双筷子有几根？',
              answer: 10, unit: '根', explain: '2 + 2 + 2 + 2 + 2 = 10 根。'
            })
          ]
        },
        {
          id: 'n10', lesson: '10 的加减法', title: '10 的加减法', items: [
            M({
              skill: '10以内.10的加减', level: 1,
              stem: '有 6 个红汽球和 4 个黄汽球，一共几个？',
              fig: { type: 'objects', icon: '🎈', groups: [6, 4] },
              answer: 10, unit: '个', explain: '6 + 4 = 10。'
            }),
            M({
              skill: '10以内.10的加减', level: 1, type: 'calc',
              stem: '算一算：10 − 7 = ?',
              answer: 3, unit: '', explain: '10 去掉 7 还剩 3。'
            }),
            TPL.sub({ a: 10, b: 4, name: '贴纸', icon: '🌟', verb: '用掉' }),
            M({
              skill: '10以内.10的加减', level: 3,
              stem: '树上有 10 只小鸟，飞走了 6 只，又飞来 2 只，现在几只？',
              fig: { type: 'objects', icon: '🐦', groups: [10, -6, 2] },
              answer: 6, unit: '只', explain: '10 − 6 = 4，4 + 2 = 6 只。'
            }),
            M({
              skill: '10以内.10的加减', level: 3,
              stem: '小明有 10 元，买笔用 3 元，买本子用 4 元，还剩几元？',
              answer: 3, unit: '元', explain: '3 + 4 = 7，10 − 7 = 3 元。'
            })
          ]
        },
        {
          id: 'n11', lesson: '连加连减', title: '连加 连减', items: [
            M({
              skill: '10以内.连加', level: 2,
              stem: '原来有 3 只鸭，来了 2 只，又来了 4 只，一共几只？',
              fig: { type: 'objects', icon: '🦆', groups: [3, 2, 4] },
              answer: 9, unit: '只', explain: '3 + 2 + 4 = 9 只。'
            }),
            M({
              skill: '10以内.连减', level: 2,
              stem: '篮子里有 10 个鸡蛋，先拿走 3 个，又拿走 4 个，还剩几个？',
              fig: { type: 'objects', icon: '🥚', groups: [10, -3, -4] },
              answer: 3, unit: '个', explain: '10 − 3 − 4 = 3 个。'
            }),
            M({
              skill: '10以内.连加', level: 2, type: 'calc',
              stem: '算一算：2 + 3 + 4 = ?',
              answer: 9, unit: '', explain: '2 + 3 = 5，5 + 4 = 9。'
            }),
            M({
              skill: '10以内.连减', level: 3, stem: '算一算：9 − 2 − 3 = ?',
              answer: 4, unit: '', explain: '9 − 2 = 7，7 − 3 = 4。'
            }),
            M({
              skill: '10以内.连加连减', level: 3,
              stem: '停车场有 8 辆车，开走 2 辆，又开来 3 辆，现在几辆？',
              answer: 9, unit: '辆', explain: '8 − 2 = 6，6 + 3 = 9 辆。'
            })
          ]
        },
        {
          id: 'n12', lesson: '整理和复习', title: '10 以内综合练习', items: [
            M({
              skill: '10以内.综合', level: 2,
              stem: '小红有 7 颗星，又得到 3 颗，一共几颗？',
              fig: { type: 'objects', icon: '⭐', groups: [7, 3] },
              answer: 10, unit: '颗', explain: '7 + 3 = 10 颗。'
            }),
            M({
              skill: '10以内.综合', level: 2, type: 'compare',
              stem: '一年级有 9 人跳绳，8 人踢球，跳绳的比踢球的多几人？',
              answer: 1, unit: '人', explain: '9 − 8 = 1 人。'
            }),
            M({
              skill: '10以内.综合', level: 3,
              stem: '一盒彩笔有 10 支，用坏了 2 支，又丢了 1 支，还能用几支？',
              answer: 7, unit: '支', explain: '10 − 2 − 1 = 7 支。'
            }),
            M({
              skill: '10以内.综合', level: 3,
              stem: '小华有 5 本书，小丽比小华多 4 本，小丽有几本？',
              answer: 9, unit: '本', explain: '5 + 4 = 9 本。'
            }),
            M({
              skill: '10以内.综合', level: 3,
              stem: '排队时小明前面有 4 人，后面有 5 人，这一队共几人？',
              answer: 10, unit: '人', explain: '4 + 5 + 1（小明）= 10 人。'
            })
          ]
        }
      ]
    },

    {
      id: 'u3', name: '第三单元 · 认识立体图形', nodes: [
        {
          id: 'n1', lesson: '认识立体图形', title: '长方体 正方体 圆柱 球', items: [
            M({
              skill: '图形.认识立体图形', level: 1,
              stem: '下面哪个是球？', fig: { type: 'shapes', list: ['cuboid', 'ball', 'cylinder'] },
              options: ['第一个', '第二个', '第三个'], answer: 1,
              explain: '圆圆的、能到处滚的是球。'
            }),
            M({
              skill: '图形.认识立体图形', level: 1,
              stem: '骰子是什么形状？',
              fig: { type: 'shapes', list: ['cube'] },
              options: ['正方体', '长方体', '圆柱'], answer: 0,
              explain: '骰子六个面一样大，是正方体。'
            }),
            M({
              skill: '图形.认识立体图形', level: 1,
              stem: '易拉罐的形状像什么？',
              fig: { type: 'shapes', list: ['cylinder'] },
              options: ['圆柱', '球', '正方体'], answer: 0,
              explain: '易拉罐上下一样粗，是圆柱。'
            }),
            M({
              skill: '图形.认识立体图形', level: 2,
              stem: '哪个图形可以滚动，还能立住不倒？',
              fig: { type: 'shapes', list: ['cylinder', 'ball'] },
              options: ['圆柱', '球', '都不行'], answer: 0,
              explain: '圆柱躺着能滚，立着能站住。'
            }),
            M({
              skill: '图形.认识立体图形', level: 2,
              stem: '牙膏盒是什么形状？',
              options: ['长方体', '正方体', '球'], answer: 0,
              explain: '牙膏盒长长的，六个面是长方形，是长方体。'
            })
          ]
        },
        {
          id: 'n2', lesson: '解决问题', title: '数一数有几个图形', items: [
            M({
              skill: '图形.数图形', level: 2,
              stem: '图中有几个正方体？', fig: { type: 'shapes', list: ['cube', 'ball', 'cube', 'cylinder'] },
              answer: 2, unit: '个', explain: '第 1 个和第 3 个是正方体。'
            }),
            M({
              skill: '图形.数图形', level: 2,
              stem: '图中有几个球？', fig: { type: 'shapes', list: ['ball', 'cube', 'ball', 'ball'] },
              answer: 3, unit: '个', explain: '第 1、3、4 个是球。'
            }),
            M({
              skill: '图形.数图形', level: 2,
              stem: '搭这个图形一共用了几个正方体？', fig: { type: 'blocks', layout: [3, 2, 1] },
              answer: 6, unit: '个', explain: '3 + 2 + 1 = 6 个。'
            }),
            M({
              skill: '图形.数图形', level: 3,
              stem: '下面这堆积木有几层？', fig: { type: 'blocks', layout: [4, 3, 2] },
              answer: 3, unit: '层', explain: '从下往上数，一共 3 层。'
            }),
            M({
              skill: '图形.数图形', level: 3,
              stem: '一堆积木最上层有 2 个，中间 3 个，下层 4 个，一共几个？', fig: { type: 'blocks', layout: [4, 3, 2] },
              answer: 9, unit: '个', explain: '4 + 3 + 2 = 9 个。'
            })
          ]
        },
        {
          id: 'n3', lesson: '拼一拼', title: '图形拼搭', items: [
            M({
              skill: '图形.拼搭', level: 2,
              stem: '两个同样的正方体拼在一起，能拼成什么？',
              fig: { type: 'shapes', list: ['cube', 'cube'] },
              options: ['长方体', '球', '圆柱'], answer: 0,
              explain: '两个正方体拼接后是长方体。'
            }),
            M({
              skill: '图形.拼搭', level: 2,
              stem: '用 4 个同样的小正方体能拼成一个大正方体吗？',
              options: ['能', '不能', '要看颜色'], answer: 1,
              explain: '拼成大正方体至少要 8 个小正方体。'
            }),
            M({
              skill: '图形.拼搭', level: 3,
              stem: '拼一个如下图的大正方体，至少要几个小正方体？',
              fig: { type: 'blocks', layout: [2, 2] },
              options: ['4 个', '6 个', '8 个'], answer: 2,
              explain: '长 2、宽 2、高 2，共 8 个。'
            }),
            M({
              skill: '图形.拼搭', level: 2,
              stem: '下面哪个不能滚动？',
              fig: { type: 'shapes', list: ['cube', 'ball', 'cylinder'] },
              options: ['正方体', '球', '圆柱'], answer: 0,
              explain: '正方体的面是平的，不能滚。'
            }),
            M({
              skill: '图形.拼搭', level: 3,
              stem: '用长方体和正方体搭房子，屋顶想用能滚的，选哪个？',
              options: ['球', '正方体', '长方体'], answer: 0,
              explain: '球是圆的，能滚动。'
            })
          ]
        },
        {
          id: 'n4', lesson: '整理和复习', title: '图形综合练习', items: [
            M({
              skill: '图形.综合', level: 2,
              stem: '摸起来有 6 个平平的面，是哪个图形？',
              fig: { type: 'shapes', list: ['ball', 'cube', 'cylinder'] },
              options: ['球', '正方体', '圆柱'], answer: 1,
              explain: '正方体有 6 个平平的面。'
            }),
            M({
              skill: '图形.综合', level: 2,
              stem: '图中圆柱有几个？', fig: { type: 'shapes', list: ['cylinder', 'ball', 'cylinder', 'cube'] },
              answer: 2, unit: '个', explain: '第 1、3 个是圆柱。'
            }),
            M({
              skill: '图形.综合', level: 3,
              stem: '搭一个三层台阶，每层分别 3、2、1 个正方体，共几个？',
              fig: { type: 'blocks', layout: [3, 2, 1] },
              answer: 6, unit: '个', explain: '3 + 2 + 1 = 6 个。'
            }),
            M({
              skill: '图形.综合', level: 2,
              stem: '下面哪个物体是长方体？',
              options: ['魔方', '牙膏盒', '皮球'], answer: 1,
              explain: '牙膏盒是长方体，魔方是正方体，皮球是球。'
            }),
            M({
              skill: '图形.综合', level: 3,
              stem: '球和圆柱都能滚，不同在哪里？',
              options: ['球朝各个方向都能滚', '圆柱朝各个方向都能滚', '没有不同'], answer: 0,
              explain: '球任意方向都能滚，圆柱只能朝一个方向滚。'
            })
          ]
        }
      ]
    },

    {
      id: 'u4', name: '第四单元 · 11~20 各数的认识', nodes: [
        {
          id: 'n1', lesson: '10 的再认识', title: '10 个一是一个十', items: [
            M({
              skill: '20以内.计数单位', level: 2,
              stem: '10 个一是一个几？', fig: { type: 'tenframe', n: 10 },
              options: ['十', '二十', '一'], answer: 0,
              explain: '10 个一捆成一捆，就是一个十。'
            }),
            M({
              skill: '20以内.计数单位', level: 2,
              stem: '1 捆小棒有 10 根，2 捆有几根？', fig: { type: 'objects', icon: '🥢', groups: [10, 10] },
              answer: 20, unit: '根', explain: '10 + 10 = 20 根。'
            }),
            M({
              skill: '20以内.数数', level: 1,
              stem: '10 后面接着数 1 个数是几？',
              answer: 11, unit: '', explain: '10 的后面是 11。'
            }),
            M({
              skill: '20以内.计数单位', level: 3,
              stem: '15 里面有几个十和几个一？',
              options: ['1 个十和 5 个一', '5 个十和 1 个一', '15 个一'], answer: 0,
              explain: '15 = 10 + 5，即 1 个十和 5 个一。'
            }),
            M({
              skill: '20以内.数数', level: 2,
              stem: '从 10 起一个一个数，数到 13 要数几个数？',
              options: ['3 个', '4 个', '13 个'], answer: 1,
              explain: '10、11、12、13，一共 4 个数。'
            })
          ]
        },
        {
          id: 'n2', lesson: '11~20 的认识', title: '认识 11~20', items: [
            M({
              skill: '20以内.认数', level: 2,
              stem: '图上有几根小棒？', fig: { type: 'objects', icon: '🥢', groups: [10, 4] },
              answer: 14, unit: '根', explain: '1 捆加 4 根，是 14。'
            }),
            M({
              skill: '20以内.认数', level: 2,
              stem: '一个十和三个一组成的数是几？',
              answer: 13, unit: '', explain: '10 + 3 = 13。'
            }),
            M({
              skill: '20以内.数序', level: 2,
              stem: '19 的后面一个数是几？',
              answer: 20, unit: '', explain: '19 的后面是 20。'
            }),
            M({
              skill: '20以内.比大小', level: 2,
              stem: '18 和 20 比，哪个小？',
              options: ['18', '20', '一样大'], answer: 0,
              explain: '18 比 20 小。'
            }),
            M({
              skill: '20以内.认数', level: 3,
              stem: '十位上是 1，个位上是 7 的数是几？',
              answer: 17, unit: '', explain: '1 个十和 7 个一，就是 17。'
            })
          ]
        },
        {
          id: 'n3', lesson: '11~20 的加减法', title: '十几加几 十几减几', items: [
            M({
              skill: '20以内.不进位加法', level: 2,
              stem: '树上有 12 只鸟，又飞来 3 只，一共几只？',
              fig: { type: 'objects', icon: '🐦', groups: [12, 3] },
              answer: 15, unit: '只', explain: '12 + 3 = 15 只。'
            }),
            M({
              skill: '20以内.不退位减法', level: 2,
              stem: '有 16 个气球，飞走 4 个，还剩几个？',
              fig: { type: 'objects', icon: '🎈', groups: [16, -4] },
              answer: 12, unit: '个', explain: '16 − 4 = 12 个。'
            }),
            M({
              skill: '20以内.不进位加法', level: 2, type: 'calc',
              stem: '算一算：13 + 5 = ?',
              answer: 18, unit: '', explain: '3 + 5 = 8，13 + 5 = 18。'
            }),
            M({
              skill: '20以内.不退位减法', level: 2, type: 'calc',
              stem: '算一算：19 − 6 = ?',
              answer: 13, unit: '', explain: '9 − 6 = 3，19 − 6 = 13。'
            }),
            M({
              skill: '20以内.加减法', level: 3,
              stem: '小明有 14 张卡片，给弟弟 3 张，又买 2 张，现在几张？',
              answer: 13, unit: '张', explain: '14 − 3 = 11，11 + 2 = 13 张。'
            })
          ]
        },
        {
          id: 'n4', lesson: '解决问题', title: '排队问题', items: [
            M({
              skill: '20以内.排队问题', level: 3,
              stem: '小明从前数第 3，从后数第 4，这一队共几人？',
              answer: 6, unit: '人', explain: '3 + 4 − 1 = 6 人，小明被数了两次。'
            }),
            M({
              skill: '20以内.排队问题', level: 3,
              stem: '一队有 10 人，小红从前数第 4，她后面有几人？',
              answer: 6, unit: '人', explain: '10 − 4 = 6 人。'
            }),
            M({
              skill: '20以内.排队问题', level: 3,
              stem: '小朋友排队，小丽前面 5 人，后面 6 人，一共几人？',
              answer: 12, unit: '人', explain: '5 + 6 + 1（小丽）= 12 人。'
            }),
            M({
              skill: '20以内.解决问题', level: 3,
              stem: '书架上有 15 本书，借走 5 本，还剩几本？',
              answer: 10, unit: '本', explain: '15 − 5 = 10 本。'
            }),
            M({
              skill: '20以内.解决问题', level: 3,
              stem: '一盒有 10 个鸡蛋，妈妈又买 6 个，一共几个？',
              answer: 16, unit: '个', explain: '10 + 6 = 16 个。'
            })
          ]
        },
        {
          id: 'n5', lesson: '数位', title: '十位和个位', items: [
            M({
              skill: '20以内.数位', level: 2,
              stem: '12 里面的 1 表示什么？',
              options: ['1 个十', '1 个一', '12 个一'], answer: 0,
              explain: '12 的 1 在十位，表示 1 个十。'
            }),
            M({
              skill: '20以内.数位', level: 2,
              stem: '个位上是 8，十位上是 1，这个数是几？',
              answer: 18, unit: '', explain: '10 + 8 = 18。'
            }),
            M({
              skill: '20以内.数位', level: 3,
              stem: '比 14 大、比 16 小的数是几？',
              answer: 15, unit: '', explain: '14 和 16 中间的数是 15。'
            }),
            M({
              skill: '20以内.数位', level: 3,
              stem: '20 里面的 2 表示什么？',
              options: ['2 个十', '2 个一', '20 个一'], answer: 0,
              explain: '20 的 2 在十位，表示 2 个十。'
            }),
            M({
              skill: '20以内.数位', level: 3,
              stem: '一个数，十位是 1，个位是 0，这个数是几？',
              answer: 10, unit: '', explain: '1 个十是 10。'
            })
          ]
        },
        {
          id: 'n6', lesson: '整理和复习', title: '11~20 综合练习', items: [
            M({
              skill: '20以内.综合', level: 2,
              stem: '看图，一共有几个小球？', fig: { type: 'objects', icon: '🏀', groups: [10, 5] },
              answer: 15, unit: '个', explain: '10 + 5 = 15 个。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '小明有 13 元，买笔用了 3 元，还剩几元？',
              answer: 10, unit: '元', explain: '13 − 3 = 10 元。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '妈妈买了 12 个苹果，吃了 2 个，又买了 4 个，现在几个？',
              answer: 14, unit: '个', explain: '12 − 2 = 10，10 + 4 = 14 个。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '一班有 9 人，二班有 8 人，两班共几人？',
              answer: 17, unit: '人', explain: '9 + 8 = 17 人。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '有 18 个座位，坐了 6 人，还空几个？',
              answer: 12, unit: '个', explain: '18 − 6 = 12 个。'
            })
          ]
        }
      ]
    },

    {
      id: 'u5', name: '第五单元 · 20 以内的进位加法', nodes: [
        {
          id: 'n1', lesson: '9 加几', title: '9 加几（凑十法）', items: [
            M({
              skill: '20以内.9加几', level: 2,
              stem: '盒子里有 9 个鸡蛋，又放进 4 个，一共几个？',
              fig: { type: 'objects', icon: '🥚', groups: [9, 4] },
              answer: 13, unit: '个', explain: '把 4 分成 1 和 3，9 + 1 = 10，10 + 3 = 13。'
            }),
            M({
              skill: '20以内.9加几', level: 2,
              stem: '9 + 6 = ?', fig: { type: 'eq', a: 9, b: 6, op: '+', blank: 'result' },
              answer: 15, unit: '', explain: '9 + 1 = 10，10 + 5 = 15。'
            }),
            M({
              skill: '20以内.9加几', level: 2, type: 'calc',
              stem: '算一算：9 + 8 = ?',
              answer: 17, unit: '', explain: '9 + 1 = 10，10 + 7 = 17。'
            }),
            M({
              skill: '20以内.9加几', level: 3,
              stem: '树上有 9 只小鸟，又飞来 7 只，现在几只？',
              fig: { type: 'objects', icon: '🐦', groups: [9, 7] },
              answer: 16, unit: '只', explain: '9 + 7 = 16 只。'
            }),
            M({
              skill: '20以内.9加几', level: 3,
              stem: '小红有 9 颗星，老师又奖励 5 颗，一共几颗？',
              answer: 14, unit: '颗', explain: '9 + 5 = 14 颗。'
            })
          ]
        },
        {
          id: 'n2', lesson: '8、7、6 加几', title: '8、7、6 加几', items: [
            M({
              skill: '20以内.8加几', level: 2,
              stem: '有 8 个红球和 5 个蓝球，一共几个？',
              fig: { type: 'objects', icon: '⚽', groups: [8, 5] },
              answer: 13, unit: '个', explain: '8 + 2 = 10，10 + 3 = 13。'
            }),
            M({
              skill: '20以内.7加几', level: 2,
              stem: '7 + 6 = ?', fig: { type: 'eq', a: 7, b: 6, op: '+', blank: 'result' },
              answer: 13, unit: '', explain: '7 + 3 = 10，10 + 3 = 13。'
            }),
            M({
              skill: '20以内.6加几', level: 2,
              stem: '6 + 8 = ?',
              answer: 14, unit: '', explain: '6 + 4 = 10，10 + 4 = 14。'
            }),
            M({
              skill: '20以内.8加几', level: 3,
              stem: '篮子里有 8 个苹果，妈妈又买 9 个，一共几个？',
              answer: 17, unit: '个', explain: '8 + 9 = 17 个。'
            }),
            M({
              skill: '20以内.7加几', level: 3,
              stem: '教室里有 7 张桌子，又搬来 7 张，一共几张？',
              answer: 14, unit: '张', explain: '7 + 7 = 14 张。'
            })
          ]
        },
        {
          id: 'n3', lesson: '5、4、3、2 加几', title: '5、4、3、2 加几', items: [
            M({
              skill: '20以内.5加几', level: 2,
              stem: '有 5 个红气球和 8 个黄气球，一共几个？',
              fig: { type: 'objects', icon: '🎈', groups: [5, 8] },
              answer: 13, unit: '个', explain: '5 + 5 = 10，10 + 3 = 13。'
            }),
            M({
              skill: '20以内.4加几', level: 2, type: 'calc',
              stem: '算一算：4 + 9 = ?',
              answer: 13, unit: '', explain: '4 + 6 = 10，10 + 3 = 13。'
            }),
            M({
              skill: '20以内.3加几', level: 2,
              stem: '3 + 9 = ?',
              answer: 12, unit: '', explain: '3 + 7 = 10，10 + 2 = 12。'
            }),
            M({
              skill: '20以内.2加几', level: 3,
              stem: '小华有 2 元，妈妈给他 9 元，一共几元？',
              answer: 11, unit: '元', explain: '2 + 9 = 11 元。'
            }),
            M({
              skill: '20以内.进位加法', level: 3,
              stem: '盒子里有 5 支笔，又放进去 7 支，一共几支？',
              answer: 12, unit: '支', explain: '5 + 7 = 12 支。'
            })
          ]
        },
        {
          id: 'n4', lesson: '解决问题', title: '求一共是多少', items: [
            M({
              skill: '20以内.求总数', level: 2,
              stem: '一班有 9 个男生，7 个女生，一共几人？',
              fig: { type: 'twoRows', left: { icon: '👦', n: 9, label: '男生' }, right: { icon: '👧', n: 7, label: '女生' } },
              answer: 16, unit: '人', explain: '9 + 7 = 16 人。'
            }),
            M({
              skill: '20以内.求总数', level: 3,
              stem: '小明跳绳 8 下，小丽跳 9 下，两人一共跳几下？',
              answer: 17, unit: '下', explain: '8 + 9 = 17 下。'
            }),
            M({
              skill: '20以内.求总数', level: 3,
              stem: '花坛里有 6 朵红花，7 朵黄花，一共几朵？',
              answer: 13, unit: '朵', explain: '6 + 7 = 13 朵。'
            }),
            M({
              skill: '20以内.求总数', level: 3,
              stem: '书架上层有 8 本书，下层有 6 本，一共几本？',
              answer: 14, unit: '本', explain: '8 + 6 = 14 本。'
            }),
            M({
              skill: '20以内.求总数', level: 3,
              stem: '车上有 9 人，又上来 8 人，现在几人？',
              answer: 17, unit: '人', explain: '9 + 8 = 17 人。'
            })
          ]
        },
        {
          id: 'n5', lesson: '逆向用加法解决问题', title: '原来有多少', items: [
            M({
              skill: '20以内.逆向用加法', level: 3,
              stem: '树上有一些小鸟，飞走了 3 只，还剩 8 只。原来有几只？',
              fig: { type: 'objects', icon: '🐦', groups: [8] },
              answer: 11, unit: '只', explain: '飞走的加剩下的：3 + 8 = 11 只。'
            }),
            TPL.back({ a: 5, b: 7, icon: '🐟' }),
            M({
              skill: '20以内.逆向用加法', level: 3,
              stem: '盘子里有一些糖，吃了 4 颗，还剩 9 颗，原来有几颗？',
              answer: 13, unit: '颗', explain: '4 + 9 = 13 颗。'
            }),
            M({
              skill: '20以内.逆向用加法', level: 3,
              stem: '停车场开走 6 辆车，还剩 7 辆，原来有几辆？',
              answer: 13, unit: '辆', explain: '6 + 7 = 13 辆。'
            }),
            M({
              skill: '20以内.逆向用加法', level: 3,
              stem: '小明用掉 8 元，还剩 5 元，他原来有几元？',
              answer: 13, unit: '元', explain: '8 + 5 = 13 元。'
            })
          ]
        },
        {
          id: 'n6', lesson: '解决问题（综合）', title: '多步问题', items: [
            M({
              skill: '20以内.综合', level: 3,
              stem: '车上有 9 人，下去 3 人，又上来 5 人，现在几人？',
              answer: 11, unit: '人', explain: '9 − 3 = 6，6 + 5 = 11 人。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '小明有 8 张卡片，小红比他多 5 张，小红有几张？',
              answer: 13, unit: '张', explain: '8 + 5 = 13 张。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '一共有 16 个苹果，吃了 7 个，还剩几个？',
              fig: { type: 'objects', icon: '🍎', groups: [16, -7] },
              answer: 9, unit: '个', explain: '16 − 7 = 9 个。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '一班 9 人，二班 8 人，三班 7 人，一共几人？',
              answer: 24, unit: '人', explain: '9 + 8 = 17，17 + 7 = 24 人。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '小华有 7 元，买本子花了 3 元，妈妈又给 9 元，现在几元？',
              answer: 13, unit: '元', explain: '7 − 3 = 4，4 + 9 = 13 元。'
            })
          ]
        },
        {
          id: 'n7', lesson: '整理和复习', title: '进位加法整理', items: [
            M({
              skill: '20以内.进位加法', level: 2,
              stem: '哪个算式得数是 13？', options: ['9 + 4', '8 + 4', '7 + 4'], answer: 0,
              explain: '9 + 4 = 13，其余两题得 12 和 11。'
            }),
            M({
              skill: '20以内.进位加法', level: 2, type: 'calc',
              stem: '算一算：8 + 8 = ?',
              answer: 16, unit: '', explain: '8 + 2 = 10，10 + 6 = 16。'
            }),
            M({
              skill: '20以内.进位加法', level: 3,
              stem: '两个数相加得 15，其中一个数是 7，另一个是几？',
              answer: 8, unit: '', explain: '15 − 7 = 8。'
            }),
            M({
              skill: '20以内.进位加法', level: 3,
              stem: '小明第一天看 9 页书，第二天看 8 页，两天共看几页？',
              answer: 17, unit: '页', explain: '9 + 8 = 17 页。'
            }),
            M({
              skill: '20以内.进位加法', level: 3,
              stem: '跳绳比赛，小红跳 6 下，小明比她多跳 7 下，小明跳几下？',
              answer: 13, unit: '下', explain: '6 + 7 = 13 下。'
            })
          ]
        },
        {
          id: 'n8', lesson: '应用提升', title: '生活中的加法', items: [
            M({
              skill: '20以内.应用', level: 3,
              stem: '妈妈买了 9 个苹果和 6 个梨，一共几个水果？',
              fig: { type: 'objects', icon: '🍎', groups: [9, 6] },
              answer: 15, unit: '个', explain: '9 + 6 = 15 个。'
            }),
            M({
              skill: '20以内.应用', level: 3,
              stem: '一本书有 20 页，小明看了 8 页，还剩几页？',
              answer: 12, unit: '页', explain: '20 − 8 = 12 页。'
            }),
            M({
              skill: '20以内.应用', level: 3,
              stem: '有 7 个小朋友在玩，又来了 8 个，现在几个？',
              answer: 15, unit: '个', explain: '7 + 8 = 15 个。'
            }),
            M({
              skill: '20以内.应用', level: 3,
              stem: '小明存了 9 元，又存 9 元，一共几元？',
              answer: 18, unit: '元', explain: '9 + 9 = 18 元。'
            }),
            M({
              skill: '20以内.应用', level: 3,
              stem: '篮子里有 15 个鸡蛋，掉了 6 个，还剩几个？',
              answer: 9, unit: '个', explain: '15 − 6 = 9 个。'
            })
          ]
        }
      ]
    },

    {
      id: 'u6', name: '第六单元 · 复习与关联', nodes: [
        {
          id: 'n1', lesson: '数与运算', title: '数与运算复习', items: [
            M({
              skill: '复习.数与运算', level: 2,
              stem: '比 10 大 5 的数是几？',
              answer: 15, unit: '', explain: '10 + 5 = 15。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '下面哪个算式的得数最大？',
              options: ['9 + 9', '8 + 9', '7 + 9'], answer: 0,
              explain: '分别是 18、17、16，最大是 18。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '18 减去 8 得几？',
              answer: 10, unit: '', explain: '18 − 8 = 10。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '9 + 6 = 6 + □，□ 里填几？',
              answer: 9, unit: '', explain: '交换两个加数，和不变。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '一个加数是 7，和是 16，另一个加数是几？',
              answer: 9, unit: '', explain: '16 − 7 = 9。'
            })
          ]
        },
        {
          id: 'n2', lesson: '数量关系', title: '解决问题复习', items: [
            M({
              skill: '复习.数量关系', level: 3,
              type: 'compare',
              stem: '小华折了 9 只纸鹤，小丽折了 5 只，小华比小丽多几只？',
              fig: { type: 'twoRows', left: { icon: '🕊', n: 9, label: '小华' }, right: { icon: '🕊', n: 5, label: '小丽' } },
              answer: 4, unit: '只', explain: '9 − 5 = 4 只。'
            }),
            M({
              skill: '复习.数量关系', level: 3,
              stem: '树上有一些鸟，飞走 6 只还剩 7 只，原来有几只？',
              answer: 13, unit: '只', explain: '6 + 7 = 13 只。'
            }),
            M({
              skill: '复习.数量关系', level: 3,
              stem: '一共 17 个座位，坐了 8 人，还空几个？',
              answer: 9, unit: '个', explain: '17 − 8 = 9 个。'
            }),
            M({
              skill: '复习.数量关系', level: 3,
              stem: '小明有 9 元，小红比小明少 3 元，小红有几元？',
              answer: 6, unit: '元', explain: '9 − 3 = 6 元。'
            }),
            M({
              skill: '复习.数量关系', level: 3,
              stem: '一根绳长 20 米，用去 9 米，还剩几米？',
              answer: 11, unit: '米', explain: '20 − 9 = 11 米。'
            })
          ]
        },
        {
          id: 'n3', lesson: '图形的认识', title: '图形复习', items: [
            M({
              skill: '复习.图形', level: 2,
              stem: '下面哪个图形有 6 个面？',
              fig: { type: 'shapes', list: ['cube', 'ball', 'cylinder'] },
              options: ['正方体', '球', '圆柱'], answer: 0,
              explain: '正方体有 6 个面。'
            }),
            M({
              skill: '复习.图形', level: 2,
              stem: '图中能滚动的图形有几个？', fig: { type: 'shapes', list: ['ball', 'cube', 'cylinder', 'ball'] },
              answer: 3, unit: '个', explain: '球 2 个、圆柱 1 个，共 3 个能滚。'
            }),
            M({
              skill: '复习.图形', level: 3,
              stem: '用 2 个正方体能拼成什么？',
              options: ['长方体', '球', '正方体'], answer: 0,
              explain: '两个正方体拼成长方体。'
            }),
            M({
              skill: '复习.图形', level: 3,
              stem: '这堆积木共几块？', fig: { type: 'blocks', layout: [3, 2] },
              answer: 5, unit: '块', explain: '3 + 2 = 5 块。'
            }),
            M({
              skill: '复习.图形', level: 2,
              stem: '下面哪个是立体图形？',
              options: ['圆柱', '正方形', '三角形'], answer: 0,
              explain: '圆柱是立体图形，正方形和三角形是平面图形。'
            })
          ]
        },
        {
          id: 'n4', lesson: '应用提升', title: '综合应用', items: [
            M({
              skill: '复习.综合应用', level: 3,
              stem: '妈妈买了 8 个苹果，爸爸买了 9 个，吃了 7 个，还剩几个？',
              fig: { type: 'objects', icon: '🍎', groups: [8, 9, -7] },
              answer: 10, unit: '个', explain: '8 + 9 = 17，17 − 7 = 10 个。'
            }),
            M({
              skill: '复习.综合应用', level: 3,
              stem: '一班 9 人，二班 8 人，三班 9 人，一共几人？',
              answer: 26, unit: '人', explain: '9 + 8 + 9 = 26 人。'
            }),
            M({
              skill: '复习.综合应用', level: 3,
              stem: '小红有 15 颗星，比小明多 6 颗，小明有几颗？',
              answer: 9, unit: '颗', explain: '15 − 6 = 9 颗。'
            }),
            M({
              skill: '复习.综合应用', level: 3,
              stem: '一本书 18 页，第一天看 6 页，第二天看 7 页，还剩几页？',
              answer: 5, unit: '页', explain: '6 + 7 = 13，18 − 13 = 5 页。'
            }),
            M({
              skill: '复习.综合应用', level: 3,
              stem: '排队时小明前面 7 人，后面 5 人，一共几人？',
              answer: 13, unit: '人', explain: '7 + 5 + 1 = 13 人。'
            })
          ]
        }
      ]
    }
  ];


  w.CONTENT = w.CONTENT || {};
  w.CONTENT['sx-1a'] = w.SXBuilder.build(UNITS, {
    bookId: 'sx-1a', code: 'sx1a', name: '数学 · 一年级上册', stage: '一上'
  });
})(window);
