/* 数学 · 一年级下册（人教版 2024 修订版）· 节点数据
   每节点 5 题：情境应用题 / 看图题 / 逆向思考为主，纯算式题 ≤ 1 题。 */
(function (w) {
  'use strict';

  var M = w.SXBuilder.M, TPL = w.SXBuilder.TPL;

  var UNITS = [
    /* ---------------- 第一单元 认识图形（二） ---------------- */
    {
      id: 'u1', name: '第一单元 · 认识图形（二）', nodes: [
        {
          id: 'n1', lesson: '认识平面图形', title: '长方形 正方形 三角形 圆', items: [
            M({
              skill: '图形.认识平面图形', level: 1,
              stem: '下面哪个是圆形？', fig: { type: 'shapes', list: ['rect', 'circle', 'triangle'] },
              options: ['第一个', '第二个', '第三个'], answer: 1,
              explain: '圆形的边是弯曲的，没有角。'
            }),
            M({
              skill: '图形.认识平面图形', level: 1,
              stem: '书本的封面是什么形状？',
              options: ['长方形', '圆形', '三角形'], answer: 0,
              explain: '书本封面长长的、四个角是直角，是长方形。'
            }),
            M({
              skill: '图形.认识平面图形', level: 1,
              stem: '三条边、三个角的图形是哪个？', fig: { type: 'shapes', list: ['square', 'triangle', 'circle'] },
              options: ['正方形', '三角形', '圆'], answer: 1,
              explain: '三条边三个角，就是三角形。'
            }),
            M({
              skill: '图形.认识平面图形', level: 2,
              stem: '下面哪个图形四条边一样长？', fig: { type: 'shapes', list: ['rect', 'square'] },
              options: ['长方形', '正方形', '都不是'], answer: 1,
              explain: '正方形四条边一样长。'
            }),
            M({
              skill: '图形.数图形', level: 2,
              stem: '下面一排图形里有几个三角形？', fig: { type: 'shapes', list: ['triangle', 'rect', 'triangle', 'circle'] },
              answer: 2, unit: '个', explain: '第一个和第三个是三角形。'
            })
          ]
        },
        {
          id: 'n2', lesson: '拼一拼', title: '两个三角形拼一拼', items: [
            M({
              skill: '图形.拼组', level: 2,
              stem: '两个同样的三角形，能拼成正方形吗？',
              options: ['能', '不能', '要看颜色'], answer: 0,
              explain: '两个一样的三角形拼在一起，可以是正方形。'
            }),
            M({
              skill: '图形.拼组', level: 2,
              stem: '用 4 个同样的小正方形，能拼成什么？',
              options: ['一个大正方形', '一个圆', '一个三角形'], answer: 0,
              explain: '4 个小正方形可以拼成一个大的正方形。'
            }),
            M({
              skill: '图形.拼组', level: 3,
              stem: '拼一个大长方形，最少要几个小正方形？',
              options: ['2 个', '3 个', '4 个'], answer: 0,
              explain: '两个小正方形横着拼，就是一个长方形。'
            }),
            M({
              skill: '图形.拼组', level: 2,
              stem: '下面哪个图形不能拼成正方形？',
              options: ['圆', '三角形', '长方形'], answer: 0,
              explain: '圆的边是弯曲的，拼不成正方形。'
            }),
            M({
              skill: '图形.数图形', level: 3,
              stem: '把一张正方形纸对折再剪开，得到两个什么？',
              options: ['长方形', '圆', '三角形'], answer: 0,
              explain: '正方形对折剪开，得到两个长方形。'
            })
          ]
        },
        {
          id: 'n3', lesson: '七巧板', title: '七巧板里的图形', items: [
            M({
              skill: '图形.七巧板', level: 2,
              stem: '一副七巧板一共有几块？',
              options: ['5 块', '7 块', '9 块'], answer: 1,
              explain: '七巧板一共有 7 块。'
            }),
            M({
              skill: '图形.七巧板', level: 2,
              stem: '七巧板里最多的是哪种图形？',
              options: ['三角形', '正方形', '圆'], answer: 0,
              explain: '七巧板里有 5 个三角形。'
            }),
            M({
              skill: '图形.七巧板', level: 3,
              stem: '七巧板里有几个三角形？', fig: { type: 'shapes', list: ['triangle', 'triangle', 'square', 'triangle'] },
              answer: 3, unit: '个', explain: '图中有 3 个三角形。'
            }),
            M({
              skill: '图形.七巧板', level: 2,
              stem: '七巧板里有没有圆？',
              options: ['没有', '有 1 个', '有 2 个'], answer: 0,
              explain: '七巧板只有三角形、正方形和平行四边形，没有圆。'
            }),
            M({
              skill: '图形.拼组', level: 3,
              stem: '两个小三角形能拼成一个什么？',
              options: ['正方形', '圆', '圆柱'], answer: 0,
              explain: '两个一样的三角形能拼成正方形。'
            })
          ]
        },
        {
          id: 'n4', lesson: '整理和复习', title: '图形综合练习', items: [
            M({
              skill: '图形.综合', level: 2,
              stem: '下面哪个有 4 个直角？', fig: { type: 'shapes', list: ['circle', 'square', 'triangle'] },
              options: ['圆', '正方形', '三角形'], answer: 1,
              explain: '正方形有 4 个直角。'
            }),
            M({
              skill: '图形.数图形', level: 2,
              stem: '图中长方形有几个？', fig: { type: 'shapes', list: ['rect', 'square', 'rect', 'rect'] },
              answer: 3, unit: '个', explain: '第一、三、四个是长方形。'
            }),
            M({
              skill: '图形.综合', level: 3,
              stem: '用 2 个正方形和 1 个三角形能拼成什么？',
              options: ['一座小房子', '一个圆', '一个球'], answer: 0,
              explain: '正方形做墙、三角形做屋顶，拼成小房子。'
            }),
            M({
              skill: '图形.综合', level: 2,
              stem: '哪个图形的边都是弯的？',
              options: ['圆', '长方形', '三角形'], answer: 0,
              explain: '圆的边是弯的，没有直边。'
            }),
            M({
              skill: '图形.综合', level: 3,
              stem: '一张长方形纸剪掉一个角，还剩几个角？',
              options: ['3 个', '4 个', '5 个'], answer: 2,
              explain: '剪掉一个角，会多出两个角，变成 5 个角。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第二单元 20 以内的退位减法 ---------------- */
    {
      id: 'u2', name: '第二单元 · 20 以内的退位减法', nodes: [
        {
          id: 'n1', lesson: '十几减 9', title: '十几减 9', items: [
            M({
              skill: '20以内.十几减9', level: 2,
              stem: '有 15 个气球，飞走 9 个，还剩几个？', fig: { type: 'objects', icon: '🎈', groups: [15, -9] },
              answer: 6, unit: '个', explain: '15 − 9 = 6，把 15 分成 10 和 5，10 − 9 = 1，1 + 5 = 6。'
            }),
            M({
              skill: '20以内.十几减9', level: 1, type: 'calc',
              stem: '算一算：13 − 9 = ?',
              answer: 4, unit: '', explain: '10 − 9 = 1，1 + 3 = 4。'
            }),
            M({
              skill: '20以内.十几减9', level: 3,
              stem: '小红有 17 张卡片，送给弟弟 9 张，还剩几张？',
              answer: 8, unit: '张', explain: '17 − 9 = 8 张。'
            }),
            M({
              skill: '20以内.十几减9', level: 2,
              stem: '12 减 9 得几？', fig: { type: 'eq', a: 12, b: 9, op: '−', blank: 'result' },
              answer: 3, unit: '', explain: '12 − 9 = 3。'
            }),
            M({
              skill: '20以内.十几减9', level: 3,
              stem: '树上有 16 只小鸟，飞走 9 只，还剩几只？',
              answer: 7, unit: '只', explain: '16 − 9 = 7 只。'
            })
          ]
        },
        {
          id: 'n2', lesson: '十几减 8、7、6', title: '十几减 8、7、6', items: [
            M({
              skill: '20以内.十几减8', level: 2,
              stem: '盒子里有 14 块糖，吃了 8 块，还剩几块？', fig: { type: 'objects', icon: '🍬', groups: [14, -8] },
              answer: 6, unit: '块', explain: '14 − 8 = 6 块。'
            }),
            M({
              skill: '20以内.十几减7', level: 2,
              stem: '有 15 个苹果，拿走 7 个，还剩几个？',
              answer: 8, unit: '个', explain: '15 − 7 = 8 个。'
            }),
            M({
              skill: '20以内.十几减6', level: 2, type: 'calc',
              stem: '算一算：13 − 6 = ?',
              answer: 7, unit: '', explain: '13 − 6 = 7。'
            }),
            M({
              skill: '20以内.十几减8', level: 3,
              stem: '小明有 11 元，买笔用了 8 元，还剩几元？',
              answer: 3, unit: '元', explain: '11 − 8 = 3 元。'
            }),
            M({
              skill: '20以内.十几减7', level: 3,
              stem: '停车场有 16 辆车，开走 7 辆，还剩几辆？',
              answer: 9, unit: '辆', explain: '16 − 7 = 9 辆。'
            })
          ]
        },
        {
          id: 'n3', lesson: '十几减 5、4、3、2', title: '十几减 5、4、3、2', items: [
            M({
              skill: '20以内.十几减5', level: 2,
              stem: '有 12 只小鸭，游走 5 只，还剩几只？', fig: { type: 'objects', icon: '🦆', groups: [12, -5] },
              answer: 7, unit: '只', explain: '12 − 5 = 7 只。'
            }),
            M({
              skill: '20以内.十几减4', level: 2,
              stem: '篮子里有 13 个鸡蛋，用了 4 个，还剩几个？',
              answer: 9, unit: '个', explain: '13 − 4 = 9 个。'
            }),
            M({
              skill: '20以内.十几减3', level: 2, type: 'calc',
              stem: '算一算：11 − 3 = ?',
              answer: 8, unit: '', explain: '11 − 3 = 8。'
            }),
            M({
              skill: '20以内.十几减2', level: 2,
              stem: '小华有 12 张贴纸，用掉 2 张，还剩几张？',
              answer: 10, unit: '张', explain: '12 − 2 = 10 张。'
            }),
            M({
              skill: '20以内.退位减法', level: 3,
              stem: '哪个算式的得数是 8？',
              options: ['14 − 6', '13 − 4', '15 − 6'], answer: 0,
              explain: '14−6=8，13−4=9，15−6=9。'
            })
          ]
        },
        {
          id: 'n4', lesson: '解决问题', title: '求剩下多少', items: [
            M({
              skill: '20以内.求剩下', level: 2,
              stem: '书架上有 17 本书，借走 8 本，还剩几本？',
              answer: 9, unit: '本', explain: '17 − 8 = 9 本。'
            }),
            M({
              skill: '20以内.求剩下', level: 3,
              stem: '妈妈买了 16 个橘子，吃了 7 个，还剩几个？',
              fig: { type: 'objects', icon: '🍊', groups: [16, -7] },
              answer: 9, unit: '个', explain: '16 − 7 = 9 个。'
            }),
            M({
              skill: '20以内.求剩下', level: 3,
              stem: '一共有 15 个座位，坐了 9 人，还空几个？',
              answer: 6, unit: '个', explain: '15 − 9 = 6 个。'
            }),
            M({
              skill: '20以内.求剩下', level: 3,
              stem: '小树上有 14 只鸟，飞走 6 只，还剩几只？',
              answer: 8, unit: '只', explain: '14 − 6 = 8 只。'
            }),
            M({
              skill: '20以内.求剩下', level: 3,
              stem: '一盒彩笔有 12 支，用坏 5 支，还能用几支？',
              answer: 7, unit: '支', explain: '12 − 5 = 7 支。'
            })
          ]
        },
        {
          id: 'n5', lesson: '解决问题（比多比少）', title: '比多比少', items: [
            M({
              skill: '20以内.比多比少', level: 3, type: 'compare',
              stem: '男生 13 人，女生 8 人，男生比女生多几人？',
              fig: { type: 'twoRows', left: { icon: '👦', n: 13, label: '男生' }, right: { icon: '👧', n: 8, label: '女生' } },
              answer: 5, unit: '人', explain: '13 − 8 = 5 人。'
            }),
            M({
              skill: '20以内.比多比少', level: 3,
              stem: '红花 15 朵，黄花 9 朵，黄花比红花少几朵？',
              answer: 6, unit: '朵', explain: '15 − 9 = 6 朵。'
            }),
            M({
              skill: '20以内.比多比少', level: 3,
              stem: '小明有 14 颗星，小红有 6 颗，两人相差几颗？',
              answer: 8, unit: '颗', explain: '14 − 6 = 8 颗。'
            }),
            M({
              skill: '20以内.比多比少', level: 3,
              stem: '一班 17 人，二班 9 人，二班比一班少几人？',
              answer: 8, unit: '人', explain: '17 − 9 = 8 人。'
            }),
            M({
              skill: '20以内.比多比少', level: 3,
              stem: '小猫 12 只，小狗 7 只，小狗比小猫少几只？',
              answer: 5, unit: '只', explain: '12 − 7 = 5 只。'
            })
          ]
        },
        {
          id: 'n6', lesson: '整理和复习', title: '减法整理', items: [
            M({
              skill: '20以内.整理', level: 2,
              stem: '哪个算式的得数最大？',
              options: ['16 − 9', '14 − 6', '13 − 5'], answer: 1,
              explain: '分别是 7、8、8，14−6 和 13−5 都是 8。'
            }),
            M({
              skill: '20以内.整理', level: 3,
              stem: '被减数是 15，减数是 8，得几？',
              answer: 7, unit: '', explain: '15 − 8 = 7。'
            }),
            M({
              skill: '20以内.整理', level: 3,
              stem: '两个数相减得 9，被减数是 16，减数是几？',
              answer: 7, unit: '', explain: '16 − 9 = 7。'
            }),
            M({
              skill: '20以内.整理', level: 3,
              stem: '小明有 13 元，买本子用 5 元，买笔用 4 元，还剩几元？',
              answer: 4, unit: '元', explain: '5 + 4 = 9，13 − 9 = 4 元。'
            }),
            M({
              skill: '20以内.整理', level: 3,
              stem: '一个数加上 7 得 15，这个数是几？',
              answer: 8, unit: '', explain: '15 − 7 = 8。'
            })
          ]
        },
        {
          id: 'n7', lesson: '解决问题（综合）', title: '两步问题', items: [
            M({
              skill: '20以内.综合', level: 3,
              stem: '车上有 12 人，下去 5 人，又上来 3 人，现在几人？',
              answer: 10, unit: '人', explain: '12 − 5 = 7，7 + 3 = 10 人。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '篮子里有 16 个苹果，先拿走 7 个，又拿走 4 个，还剩几个？',
              answer: 5, unit: '个', explain: '16 − 7 − 4 = 5 个。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '小红有 8 颗糖，妈妈又给 7 颗，她吃了 6 颗，现在几颗？',
              answer: 9, unit: '颗', explain: '8 + 7 = 15，15 − 6 = 9 颗。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '图书角有 14 本书，借出 6 本，又还回 3 本，现在几本？',
              answer: 11, unit: '本', explain: '14 − 6 = 8，8 + 3 = 11 本。'
            }),
            M({
              skill: '20以内.综合', level: 3,
              stem: '有 13 个小朋友，走了 4 个，又来了 5 个，现在几个？',
              answer: 14, unit: '个', explain: '13 − 4 = 9，9 + 5 = 14 个。'
            })
          ]
        },
        {
          id: 'n8', lesson: '解决问题（逆向）', title: '原来有多少', items: [
            M({
              skill: '20以内.逆向', level: 3,
              stem: '盘子里有一些糖，吃了 8 颗，还剩 6 颗，原来有几颗？',
              answer: 14, unit: '颗', explain: '8 + 6 = 14 颗。'
            }),
            TPL.back({ a: 9, b: 5, icon: '🐟' }),
            M({
              skill: '20以内.逆向', level: 3,
              stem: '树上有一些鸟，飞走 7 只还剩 8 只，原来有几只？',
              answer: 15, unit: '只', explain: '7 + 8 = 15 只。'
            }),
            M({
              skill: '20以内.逆向', level: 3,
              stem: '小明用掉 9 元，还剩 7 元，他原来有几元？',
              answer: 16, unit: '元', explain: '9 + 7 = 16 元。'
            }),
            M({
              skill: '20以内.逆向', level: 3,
              stem: '停车场开走 6 辆车，还剩 9 辆，原来有几辆？',
              answer: 15, unit: '辆', explain: '6 + 9 = 15 辆。'
            })
          ]
        },
        {
          id: 'n9', lesson: '单元复习', title: '退位减法复习', items: [
            M({
              skill: '20以内.复习', level: 2,
              stem: '下面哪个算式的得数是 9？',
              options: ['17 − 8', '16 − 8', '15 − 7'], answer: 0,
              explain: '17−8=9，16−8=8，15−7=8。'
            }),
            M({
              skill: '20以内.复习', level: 3,
              stem: '一年级有 15 人跳绳，8 人踢球，跳绳的比踢球的多几人？',
              answer: 7, unit: '人', explain: '15 − 8 = 7 人。'
            }),
            M({
              skill: '20以内.复习', level: 3,
              stem: '一本书有 18 页，看了 9 页，还剩几页？',
              answer: 9, unit: '页', explain: '18 − 9 = 9 页。'
            }),
            M({
              skill: '20以内.复习', level: 3,
              stem: '妈妈买了 14 个鸡蛋，早上用 6 个，晚上用 4 个，还剩几个？',
              answer: 4, unit: '个', explain: '14 − 6 − 4 = 4 个。'
            }),
            M({
              skill: '20以内.复习', level: 3,
              stem: '小红折了 13 只纸鹤，比小明多 6 只，小明折了几只？',
              answer: 7, unit: '只', explain: '13 − 6 = 7 只。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第三单元 分类与整理 ---------------- */
    {
      id: 'u3', name: '第三单元 · 分类与整理', nodes: [
        {
          id: 'n1', lesson: '按形状分类', title: '按形状分一分', items: [
            M({
              skill: '分类.按形状', level: 1,
              stem: '图中有几个圆形？', fig: { type: 'shapes', list: ['circle', 'square', 'circle', 'triangle', 'circle'] },
              answer: 3, unit: '个', explain: '第 1、3、5 个是圆形。'
            }),
            M({
              skill: '分类.按形状', level: 2,
              stem: '把图形按形状分，可以分成几类？', fig: { type: 'shapes', list: ['circle', 'square', 'triangle'] },
              options: ['3 类', '2 类', '1 类'], answer: 0,
              explain: '圆、正方形、三角形，一共 3 类。'
            }),
            M({
              skill: '分类.按形状', level: 2,
              stem: '下面哪个和其他两个不是一类？',
              options: ['苹果', '香蕉', '铅笔'], answer: 2,
              explain: '苹果和香蕉是水果，铅笔是文具。'
            }),
            M({
              skill: '分类.按形状', level: 2,
              stem: '数一数，三角形有几个？', fig: { type: 'shapes', list: ['triangle', 'rect', 'triangle'] },
              answer: 2, unit: '个', explain: '第 1、3 个是三角形。'
            }),
            M({
              skill: '分类.按形状', level: 3,
              stem: '一堆图形里有 5 个圆、3 个正方形，圆比正方形多几个？',
              answer: 2, unit: '个', explain: '5 − 3 = 2 个。'
            })
          ]
        },
        {
          id: 'n2', lesson: '按种类分类', title: '按种类分一分', items: [
            M({
              skill: '分类.按种类', level: 2,
              stem: '图中有几只小动物？', fig: { type: 'objects', icon: '🐰', groups: [3, 2] },
              answer: 5, unit: '只', explain: '3 + 2 = 5 只。'
            }),
            M({
              skill: '分类.按种类', level: 2,
              stem: '下面哪些是水果？',
              options: ['苹果 梨 桃子', '白菜 萝卜 土豆', '铅笔 尺子 本子'], answer: 0,
              explain: '苹果、梨、桃子都是水果。'
            }),
            M({
              skill: '分类.按种类', level: 3,
              stem: '一共有 12 个水果，其中 7 个是苹果，其余是梨，梨有几个？',
              answer: 5, unit: '个', explain: '12 − 7 = 5 个。'
            }),
            M({
              skill: '分类.按种类', level: 2,
              stem: '男生 6 人，女生 5 人，一共几人？',
              fig: { type: 'twoRows', left: { icon: '👦', n: 6, label: '男生' }, right: { icon: '👧', n: 5, label: '女生' } },
              answer: 11, unit: '人', explain: '6 + 5 = 11 人。'
            }),
            M({
              skill: '分类.按种类', level: 3,
              stem: '把 9 个球平均放进 3 个筐里，每筐几个？',
              answer: 3, unit: '个', explain: '9 个分 3 筐，每筐 3 个。'
            })
          ]
        },
        {
          id: 'n3', lesson: '整理与统计', title: '看一看 填一填', items: [
            M({
              skill: '分类.统计', level: 2,
              stem: '统计表里红花 8 朵、黄花 5 朵，一共几朵？',
              answer: 13, unit: '朵', explain: '8 + 5 = 13 朵。'
            }),
            M({
              skill: '分类.统计', level: 3,
              stem: '统计表里红花 8 朵、黄花 5 朵，红花比黄花多几朵？',
              answer: 3, unit: '朵', explain: '8 − 5 = 3 朵。'
            }),
            M({
              skill: '分类.统计', level: 3,
              stem: '三种水果分别有 4、6、2 个，一共几个？',
              answer: 12, unit: '个', explain: '4 + 6 + 2 = 12 个。'
            }),
            M({
              skill: '分类.统计', level: 3,
              stem: '一共 15 个图形，圆形 6 个，正方形 5 个，三角形有几个？',
              answer: 4, unit: '个', explain: '15 − 6 − 5 = 4 个。'
            }),
            M({
              skill: '分类.统计', level: 3,
              stem: '统计图中最长的一行有 7 个，最短的有 3 个，相差几个？',
              answer: 4, unit: '个', explain: '7 − 3 = 4 个。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第四单元 100 以内数的认识 ---------------- */
    {
      id: 'u4', name: '第四单元 · 100 以内数的认识', nodes: [
        {
          id: 'n1', lesson: '数数', title: '一个一个数 十个十个数', items: [
            M({
              skill: '100以内.数数', level: 1,
              stem: '10 个十是多少？', fig: { type: 'tenframe', n: 10 },
              answer: 100, unit: '', explain: '10 个十是 100。'
            }),
            M({
              skill: '100以内.数数', level: 2,
              stem: '29 的后面一个数是几？',
              answer: 30, unit: '', explain: '29 再数一个是 30。'
            }),
            M({
              skill: '100以内.数数', level: 2,
              stem: '一个一个数，从 27 数到 31，要数几个数？',
              options: ['4 个', '5 个', '6 个'], answer: 1,
              explain: '27、28、29、30、31，共 5 个数。'
            }),
            M({
              skill: '100以内.数数', level: 2,
              stem: '5 个十和 3 个一是多少？',
              answer: 53, unit: '', explain: '5 个十是 50，再加 3 是 53。'
            }),
            M({
              skill: '100以内.数数', level: 3,
              stem: '比 40 少 1 的数是几？',
              answer: 39, unit: '', explain: '40 的前面一个是 39。'
            })
          ]
        },
        {
          id: 'n2', lesson: '数的组成', title: '几个十几个一', items: [
            M({
              skill: '100以内.数的组成', level: 2,
              stem: '36 里面有几个十和几个一？',
              options: ['3 个十和 6 个一', '6 个十和 3 个一', '36 个一'], answer: 0,
              explain: '36 = 30 + 6，即 3 个十和 6 个一。'
            }),
            M({
              skill: '100以内.数的组成', level: 2,
              stem: '7 个十和 5 个一组成的数是几？',
              answer: 75, unit: '', explain: '70 + 5 = 75。'
            }),
            M({
              skill: '100以内.数的组成', level: 3,
              stem: '一个数由 8 个十和 9 个一组成，这个数是几？',
              answer: 89, unit: '', explain: '80 + 9 = 89。'
            }),
            M({
              skill: '100以内.数的组成', level: 3,
              stem: '60 里面有几个十？',
              answer: 6, unit: '个', explain: '60 里面有 6 个十。'
            }),
            M({
              skill: '100以内.数的组成', level: 3,
              stem: '48 的十位上是几？',
              answer: 4, unit: '', explain: '48 的十位是 4，个位是 8。'
            })
          ]
        },
        {
          id: 'n3', lesson: '读数 写数', title: '读一读 写一写', items: [
            M({
              skill: '100以内.读数写数', level: 2,
              stem: '“五十四”写作哪个数？',
              options: ['54', '45', '504'], answer: 0,
              explain: '五十四写作 54。'
            }),
            M({
              skill: '100以内.读数写数', level: 2,
              stem: '“九十”写作哪个数？',
              options: ['9', '90', '19'], answer: 1,
              explain: '九十写作 90。'
            }),
            M({
              skill: '100以内.读数写数', level: 3,
              stem: '86 读作什么？',
              options: ['八十六', '六十八', '八百六十'], answer: 0,
              explain: '86 读作八十六。'
            }),
            M({
              skill: '100以内.读数写数', level: 3,
              stem: '十位是 6、个位是 0 的数是几？',
              answer: 60, unit: '', explain: '这个数是 60。'
            }),
            M({
              skill: '100以内.读数写数', level: 3,
              stem: '比 99 多 1 的数是几？',
              answer: 100, unit: '', explain: '99 后面是 100。'
            })
          ]
        },
        {
          id: 'n4', lesson: '数的顺序', title: '百数表里的秘密', items: [
            M({
              skill: '100以内.数的顺序', level: 2,
              stem: '按顺序填：46、47、（ ）、49',
              answer: 48, unit: '', explain: '47 后面是 48。'
            }),
            M({
              skill: '100以内.数的顺序', level: 3,
              stem: '百数表中，55 的下面一个数是几？',
              answer: 65, unit: '', explain: '百数表每列相差 10，55 下面是 65。'
            }),
            M({
              skill: '100以内.数的顺序', level: 3,
              stem: '比 68 大、比 70 小的数是几？',
              answer: 69, unit: '', explain: '68 和 70 之间是 69。'
            }),
            M({
              skill: '100以内.数的顺序', level: 3,
              stem: '个位是 7 的两位数中，最大的是几？',
              answer: 97, unit: '', explain: '十位最大是 9，所以是 97。'
            }),
            M({
              skill: '100以内.数的顺序', level: 3,
              stem: '十位是 5 的数中，最小的是几？',
              answer: 50, unit: '', explain: '十位是 5 的最小两位数是 50。'
            })
          ]
        },
        {
          id: 'n5', lesson: '比较大小', title: '比一比 说一说', items: [
            M({
              skill: '100以内.比较大小', level: 2,
              stem: '38 和 41 比，哪个大？',
              options: ['38', '41', '一样大'], answer: 1,
              explain: '41 比 38 大。'
            }),
            M({
              skill: '100以内.比较大小', level: 2,
              stem: '在 5、2、7 中，最大的数是几？',
              answer: 72, unit: '', explain: '用 7、5、2 能组成最大的两位数是 72。'
            }),
            M({
              skill: '100以内.比较大小', level: 3,
              stem: '一年级 42 人，二年级 40 人，哪个年级人多？',
              options: ['一年级多', '二年级多', '一样多'], answer: 0,
              explain: '42 > 40，一年级人多。'
            }),
            M({
              skill: '100以内.比较大小', level: 3,
              stem: '一个数比 60 多，比 63 少，这个数是几？',
              answer: 61, unit: '', explain: '比 60 多又比 63 少的有 61、62，题干问“一个”，取 61。'
            }),
            M({
              skill: '100以内.比较大小', level: 3,
              stem: '个位是 8 的两位数，最大的是几？',
              answer: 98, unit: '', explain: '十位最大是 9，所以是 98。'
            })
          ]
        },
        {
          id: 'n6', lesson: '整十数加一位数', title: '整十数加几 减几', items: [
            M({
              skill: '100以内.整十数加减', level: 1,
              stem: '30 + 5 = ?', fig: { type: 'objects', icon: '🔴', groups: [30, 5] },
              answer: 35, unit: '', explain: '30 加 5 是 35。'
            }),
            M({
              skill: '100以内.整十数加减', level: 2,
              stem: '有 40 个苹果，又拿来 6 个，一共几个？',
              answer: 46, unit: '个', explain: '40 + 6 = 46 个。'
            }),
            M({
              skill: '100以内.整十数加减', level: 2,
              stem: '78 减去 8 得几？',
              answer: 70, unit: '', explain: '78 − 8 = 70。'
            }),
            M({
              skill: '100以内.整十数加减', level: 3,
              stem: '小明有 50 元，买笔用 4 元，还剩几元？',
              answer: 46, unit: '元', explain: '50 − 4 = 46 元。'
            }),
            M({
              skill: '100以内.整十数加减', level: 3,
              stem: '一个数减去 7 得 60，这个数是几？',
              answer: 67, unit: '', explain: '60 + 7 = 67。'
            })
          ]
        },
        {
          id: 'n7', lesson: '解决问题', title: '多得多 少一些', items: [
            M({
              skill: '100以内.多得多', level: 3,
              stem: '一年级 45 人，二年级比一年级少一些，可能几人？',
              options: ['42 人', '20 人', '80 人'], answer: 0,
              explain: '少一些就是比 45 小一点，42 最合适。'
            }),
            M({
              skill: '100以内.多得多', level: 3,
              stem: '苹果有 30 个，梨比苹果多得多，梨可能几个？',
              options: ['32 个', '28 个', '90 个'], answer: 2,
              explain: '多得多表示差很多，90 个最合适。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '树上有 56 只小鸟，飞走 6 只，还剩几只？',
              answer: 50, unit: '只', explain: '56 − 6 = 50 只。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '图书角有 40 本故事书和 8 本画册，一共几本？',
              answer: 48, unit: '本', explain: '40 + 8 = 48 本。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '一班 32 人，二班 30 人，两班共几人？',
              answer: 62, unit: '人', explain: '32 + 30 = 62 人。'
            })
          ]
        },
        {
          id: 'n8', lesson: '单元复习', title: '100 以内数复习', items: [
            M({
              skill: '100以内.复习', level: 2,
              stem: '最大的两位数是几？',
              answer: 99, unit: '', explain: '最大的两位数是 99。'
            }),
            M({
              skill: '100以内.复习', level: 3,
              stem: '比 79 大 1 的数是几？',
              answer: 80, unit: '', explain: '79 + 1 = 80。'
            }),
            M({
              skill: '100以内.复习', level: 3,
              stem: '一个两位数，十位是 7，个位比十位少 3，这个数是几？',
              answer: 74, unit: '', explain: '个位是 7 − 3 = 4，所以是 74。'
            }),
            M({
              skill: '100以内.复习', level: 3,
              stem: '45 里面有 4 个十和几个一？',
              answer: 5, unit: '个', explain: '45 = 40 + 5，有 5 个一。'
            }),
            M({
              skill: '100以内.复习', level: 3,
              stem: '把 63、36、60 从小到大排，最小的是几？',
              answer: 36, unit: '', explain: '36 < 60 < 63，最小是 36。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第五单元 认识人民币 ---------------- */
    {
      id: 'u5', name: '第五单元 · 认识人民币', nodes: [
        {
          id: 'n1', lesson: '认识人民币', title: '元 角 分', items: [
            M({
              skill: '人民币.认识', level: 1,
              stem: '1 元可以换几个 1 角？',
              options: ['10 个', '5 个', '100 个'], answer: 0,
              explain: '1 元 = 10 角。'
            }),
            M({
              skill: '人民币.认识', level: 1,
              stem: '1 角等于几分？',
              options: ['10 分', '5 分', '100 分'], answer: 0,
              explain: '1 角 = 10 分。'
            }),
            M({
              skill: '人民币.认识', level: 2,
              stem: '人民币的单位有哪些？',
              options: ['元 角 分', '元 米 分', '角 分 时'], answer: 0,
              explain: '人民币的单位是元、角、分。'
            }),
            M({
              skill: '人民币.认识', level: 2,
              stem: '一张 5 元和一张 1 元，一共几元？',
              answer: 6, unit: '元', explain: '5 + 1 = 6 元。'
            }),
            M({
              skill: '人民币.认识', level: 2,
              stem: '1 元等于多少角？',
              answer: 10, unit: '角', explain: '1 元 = 10 角。'
            })
          ]
        },
        {
          id: 'n2', lesson: '元角分换算', title: '换一换 算一算', items: [
            M({
              skill: '人民币.换算', level: 2,
              stem: '3 元 5 角是多少角？',
              answer: 35, unit: '角', explain: '3 元 = 30 角，30 + 5 = 35 角。'
            }),
            M({
              skill: '人民币.换算', level: 3,
              stem: '28 角是几元几角？',
              options: ['2 元 8 角', '8 元 2 角', '28 元'], answer: 0,
              explain: '28 角 = 2 元 8 角。'
            }),
            M({
              skill: '人民币.换算', level: 3,
              stem: '1 元 2 角加 3 角，一共几元几角？',
              options: ['1 元 5 角', '4 元 2 角', '1 元 3 角'], answer: 0,
              explain: '2 角 + 3 角 = 5 角，一共 1 元 5 角。'
            }),
            M({
              skill: '人民币.换算', level: 3,
              stem: '5 元 4 角减去 4 角，还剩几元？',
              answer: 5, unit: '元', explain: '4 角减 4 角没有了，还剩 5 元。'
            }),
            M({
              skill: '人民币.换算', level: 3,
              stem: '10 元可以换几张 5 元？',
              answer: 2, unit: '张', explain: '10 ÷ 5 = 2 张。'
            })
          ]
        },
        {
          id: 'n3', lesson: '买东西', title: '买一买 算一算', items: [
            M({
              skill: '人民币.购物', level: 2,
              stem: '一支笔 3 元，一块橡皮 2 元，一共几元？',
              answer: 5, unit: '元', explain: '3 + 2 = 5 元。'
            }),
            M({
              skill: '人民币.购物', level: 3,
              stem: '一个本子 4 元，拿 10 元去买，找回几元？',
              answer: 6, unit: '元', explain: '10 − 4 = 6 元。'
            }),
            M({
              skill: '人民币.购物', level: 3,
              stem: '买一个 6 元的玩具和一个 5 元的球，20 元够不够？',
              options: ['够，还剩 9 元', '不够', '正好用完'], answer: 0,
              explain: '6 + 5 = 11，20 − 11 = 9 元，够。'
            }),
            M({
              skill: '人民币.购物', level: 3,
              stem: '面包 5 元、牛奶 3 元，付 10 元找回几元？',
              answer: 2, unit: '元', explain: '5 + 3 = 8，10 − 8 = 2 元。'
            }),
            M({
              skill: '人民币.购物', level: 3,
              stem: '小明有 9 元，买 4 元的本子后还剩几元？',
              answer: 5, unit: '元', explain: '9 − 4 = 5 元。'
            })
          ]
        },
        {
          id: 'n4', lesson: '比一比价格', title: '谁贵 谁便宜', items: [
            M({
              skill: '人民币.比较', level: 2,
              stem: '铅笔 2 元，钢笔 8 元，哪个贵？',
              options: ['钢笔贵', '铅笔贵', '一样贵'], answer: 0,
              explain: '8 > 2，钢笔贵。'
            }),
            M({
              skill: '人民币.比较', level: 3,
              stem: '钢笔 8 元，铅笔 2 元，贵几元？',
              answer: 6, unit: '元', explain: '8 − 2 = 6 元。'
            }),
            M({
              skill: '人民币.比较', level: 3,
              stem: '一个书包 35 元，一顶帽子 20 元，书包比帽子贵几元？',
              answer: 15, unit: '元', explain: '35 − 20 = 15 元。'
            }),
            M({
              skill: '人民币.比较', level: 3,
              stem: '3 元 5 角和 4 元比，哪个少？',
              options: ['3 元 5 角', '4 元', '一样多'], answer: 0,
              explain: '3 元 5 角比 4 元少 5 角。'
            }),
            M({
              skill: '人民币.比较', level: 3,
              stem: '买 2 本同样的本子共 8 元，一本几元？',
              answer: 4, unit: '元', explain: '8 ÷ 2 = 4 元。'
            })
          ]
        },
        {
          id: 'n5', lesson: '单元复习', title: '人民币复习', items: [
            M({
              skill: '人民币.复习', level: 2,
              stem: '1 元 = 几角？',
              answer: 10, unit: '角', explain: '1 元 = 10 角。'
            }),
            M({
              skill: '人民币.复习', level: 3,
              stem: '2 元 3 角加 1 元 4 角，一共几元几角？',
              options: ['3 元 7 角', '4 元 7 角', '3 元 5 角'], answer: 0,
              explain: '2+1=3 元，3+4=7 角，是 3 元 7 角。'
            }),
            M({
              skill: '人民币.复习', level: 3,
              stem: '妈妈有 50 元，买菜用 28 元，还剩几元？',
              answer: 22, unit: '元', explain: '50 − 28 = 22 元。'
            }),
            M({
              skill: '人民币.复习', level: 3,
              stem: '一本 7 元，买 3 本一共几元？',
              answer: 21, unit: '元', explain: '7 + 7 + 7 = 21 元。'
            }),
            M({
              skill: '人民币.复习', level: 3,
              stem: '有 1 张 10 元和 2 张 5 元，一共几元？',
              answer: 20, unit: '元', explain: '10 + 5 + 5 = 20 元。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第六单元 100 以内的加法和减法（一） ---------------- */
    {
      id: 'u6', name: '第六单元 · 100 以内的加法和减法（一）', nodes: [
        {
          id: 'n1', lesson: '整十数加减整十数', title: '整十数相加减', items: [
            M({
              skill: '100以内.整十数加减', level: 1,
              stem: '20 + 30 = ?', fig: { type: 'objects', icon: '🟦', groups: [20, 30] },
              answer: 50, unit: '', explain: '2 个十加 3 个十是 5 个十，就是 50。'
            }),
            M({
              skill: '100以内.整十数加减', level: 2,
              stem: '一班 20 人，二班 30 人，一共几人？',
              answer: 50, unit: '人', explain: '20 + 30 = 50 人。'
            }),
            M({
              skill: '100以内.整十数加减', level: 2,
              stem: '70 − 40 = ?',
              answer: 30, unit: '', explain: '7 个十减 4 个十是 3 个十，就是 30。'
            }),
            M({
              skill: '100以内.整十数加减', level: 3,
              stem: '有 80 个气球，送给同学 50 个，还剩几个？',
              answer: 30, unit: '个', explain: '80 − 50 = 30 个。'
            }),
            M({
              skill: '100以内.整十数加减', level: 3,
              stem: '一个数加 40 得 90，这个数是几？',
              answer: 50, unit: '', explain: '90 − 40 = 50。'
            })
          ]
        },
        {
          id: 'n2', lesson: '两位数加一位数', title: '两位数加一位数', items: [
            M({
              skill: '100以内.两位数加一位数', level: 2,
              stem: '有 32 个苹果，又拿来 5 个，一共几个？', fig: { type: 'objects', icon: '🍎', groups: [32, 5] },
              answer: 37, unit: '个', explain: '32 + 5 = 37 个。'
            }),
            M({
              skill: '100以内.两位数加一位数', level: 2,
              stem: '45 + 3 = ?',
              answer: 48, unit: '', explain: '5 + 3 = 8，45 + 3 = 48。'
            }),
            M({
              skill: '100以内.进位加法', level: 3,
              stem: '28 + 6 = ?',
              answer: 34, unit: '', explain: '8 + 6 = 14，20 + 14 = 34。'
            }),
            M({
              skill: '100以内.进位加法', level: 3,
              stem: '小明有 27 张卡片，又得到 5 张，现在几张？',
              answer: 32, unit: '张', explain: '27 + 5 = 32 张。'
            }),
            M({
              skill: '100以内.进位加法', level: 3,
              stem: '一个数加 7 得 43，这个数是几？',
              answer: 36, unit: '', explain: '43 − 7 = 36。'
            })
          ]
        },
        {
          id: 'n3', lesson: '两位数加整十数', title: '两位数加整十数', items: [
            M({
              skill: '100以内.两位数加整十数', level: 2,
              stem: '23 + 40 = ?',
              answer: 63, unit: '', explain: '2 个十加 4 个十是 6 个十，再加 3 是 63。'
            }),
            M({
              skill: '100以内.两位数加整十数', level: 2,
              stem: '一班 25 人，二班 30 人，一共几人？',
              answer: 55, unit: '人', explain: '25 + 30 = 55 人。'
            }),
            M({
              skill: '100以内.两位数加整十数', level: 3,
              stem: '图书馆有 32 本故事书，又买来 40 本，一共几本？',
              answer: 72, unit: '本', explain: '32 + 40 = 72 本。'
            }),
            M({
              skill: '100以内.两位数加整十数', level: 3,
              stem: '35 + 50 = ?',
              answer: 85, unit: '', explain: '30 + 50 = 80，80 + 5 = 85。'
            }),
            M({
              skill: '100以内.两位数加整十数', level: 3,
              stem: '小明有 46 元，妈妈又给 20 元，现在几元？',
              answer: 66, unit: '元', explain: '46 + 20 = 66 元。'
            })
          ]
        },
        {
          id: 'n4', lesson: '两位数减一位数', title: '两位数减一位数', items: [
            M({
              skill: '100以内.两位数减一位数', level: 2,
              stem: '有 38 块糖，吃了 5 块，还剩几块？', fig: { type: 'objects', icon: '🍬', groups: [38, -5] },
              answer: 33, unit: '块', explain: '38 − 5 = 33 块。'
            }),
            M({
              skill: '100以内.两位数减一位数', level: 2,
              stem: '46 − 4 = ?',
              answer: 42, unit: '', explain: '6 − 4 = 2，46 − 4 = 42。'
            }),
            M({
              skill: '100以内.退位减法', level: 3,
              stem: '32 − 7 = ?',
              answer: 25, unit: '', explain: '12 − 7 = 5，20 + 5 = 25。'
            }),
            M({
              skill: '100以内.退位减法', level: 3,
              stem: '有 41 个鸡蛋，用了 6 个，还剩几个？',
              answer: 35, unit: '个', explain: '41 − 6 = 35 个。'
            }),
            M({
              skill: '100以内.退位减法', level: 3,
              stem: '50 减去 8 得几？',
              answer: 42, unit: '', explain: '50 − 8 = 42。'
            })
          ]
        },
        {
          id: 'n5', lesson: '两位数减整十数', title: '两位数减整十数', items: [
            M({
              skill: '100以内.两位数减整十数', level: 2,
              stem: '56 − 30 = ?',
              answer: 26, unit: '', explain: '50 − 30 = 20，20 + 6 = 26。'
            }),
            M({
              skill: '100以内.两位数减整十数', level: 2,
              stem: '书架上有 65 本书，借走 40 本，还剩几本？',
              answer: 25, unit: '本', explain: '65 − 40 = 25 本。'
            }),
            M({
              skill: '100以内.两位数减整十数', level: 3,
              stem: '78 − 50 = ?',
              answer: 28, unit: '', explain: '70 − 50 = 20，20 + 8 = 28。'
            }),
            M({
              skill: '100以内.两位数减整十数', level: 3,
              stem: '小明有 54 元，买书用 20 元，还剩几元？',
              answer: 34, unit: '元', explain: '54 − 20 = 34 元。'
            }),
            M({
              skill: '100以内.两位数减整十数', level: 3,
              stem: '一个数减 30 得 45，这个数是几？',
              answer: 75, unit: '', explain: '45 + 30 = 75。'
            })
          ]
        },
        {
          id: 'n6', lesson: '解决问题', title: '求一共 求剩下', items: [
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '一年级 34 人，二年级 40 人，两个年级共几人？',
              answer: 74, unit: '人', explain: '34 + 40 = 74 人。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '妈妈买了 62 个鸡蛋，用了 8 个，还剩几个？',
              answer: 54, unit: '个', explain: '62 − 8 = 54 个。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '果园里有 45 棵苹果树，梨树比苹果树多 20 棵，梨树几棵？',
              answer: 65, unit: '棵', explain: '45 + 20 = 65 棵。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '一班 38 人，二班比一班少 6 人，二班几人？',
              answer: 32, unit: '人', explain: '38 − 6 = 32 人。'
            }),
            M({
              skill: '100以内.解决问题', level: 3,
              stem: '小明有 50 元，买书用 23 元，买笔用 6 元，还剩几元？',
              answer: 21, unit: '元', explain: '23 + 6 = 29，50 − 29 = 21 元。'
            })
          ]
        },
        {
          id: 'n7', lesson: '连加 连减', title: '连加连减 加减混合', items: [
            M({
              skill: '100以内.连加', level: 3,
              stem: '车上有 24 人，上来 5 人，又上来 8 人，现在几人？',
              answer: 37, unit: '人', explain: '24 + 5 + 8 = 37 人。'
            }),
            M({
              skill: '100以内.连减', level: 3,
              stem: '有 60 个气球，飞走 20 个，又飞走 15 个，还剩几个？',
              answer: 25, unit: '个', explain: '60 − 20 − 15 = 25 个。'
            }),
            M({
              skill: '100以内.加减混合', level: 3,
              stem: '篮子里有 45 个苹果，拿走 8 个，又放进 6 个，现在几个？',
              answer: 43, unit: '个', explain: '45 − 8 = 37，37 + 6 = 43 个。'
            }),
            M({
              skill: '100以内.加减混合', level: 3,
              stem: '树上有 32 只鸟，飞来 7 只，又飞走 9 只，现在几只？',
              answer: 30, unit: '只', explain: '32 + 7 = 39，39 − 9 = 30 只。'
            }),
            M({
              skill: '100以内.连加', level: 3,
              stem: '三个班分别 20 人、30 人、15 人，一共几人？',
              answer: 65, unit: '人', explain: '20 + 30 + 15 = 65 人。'
            })
          ]
        },
        {
          id: 'n8', lesson: '整理和复习', title: '加减法整理', items: [
            M({
              skill: '100以内.整理', level: 2,
              stem: '哪个算式的得数是 60？',
              options: ['35 + 25', '40 + 30', '70 − 20'], answer: 0,
              explain: '35+25=60，40+30=70，70−20=50。'
            }),
            M({
              skill: '100以内.整理', level: 3,
              stem: '两个数相加得 80，一个数是 45，另一个是几？',
              answer: 35, unit: '', explain: '80 − 45 = 35。'
            }),
            M({
              skill: '100以内.整理', level: 3,
              stem: '被减数是 74，减数是 8，差是几？',
              answer: 66, unit: '', explain: '74 − 8 = 66。'
            }),
            M({
              skill: '100以内.整理', level: 3,
              stem: '一本 8 元，买 6 本一共几元？',
              answer: 48, unit: '元', explain: '8 × 6 = 48 元。'
            }),
            M({
              skill: '100以内.整理', level: 3,
              stem: '60 元买一个 23 元的玩具和一本书 17 元，还剩几元？',
              answer: 20, unit: '元', explain: '23 + 17 = 40，60 − 40 = 20 元。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第七单元 找规律 ---------------- */
    {
      id: 'u7', name: '第七单元 · 找规律', nodes: [
        {
          id: 'n1', lesson: '图形规律', title: '图形的排列规律', items: [
            M({
              skill: '规律.图形', level: 1,
              stem: '接下来应该是什么图形？', fig: { type: 'shapes', list: ['circle', 'square', 'circle', 'square', 'circle'] },
              options: ['正方形', '圆形', '三角形'], answer: 0,
              explain: '圆、正方形交替出现，接下来是正方形。'
            }),
            M({
              skill: '规律.图形', level: 2,
              stem: '按规律，第 6 个是什么？', fig: { type: 'shapes', list: ['triangle', 'triangle', 'circle', 'triangle', 'triangle'] },
              options: ['圆形', '三角形', '正方形'], answer: 0,
              explain: '两个三角形一个圆，第 6 个是圆。'
            }),
            M({
              skill: '规律.图形', level: 2,
              stem: '一串珠子按红、红、黄重复，第 7 颗是什么颜色？',
              options: ['红色', '黄色', '蓝色'], answer: 0,
              explain: '每 3 颗一组，第 7 颗是第 3 组的第 1 颗，红色。'
            }),
            M({
              skill: '规律.图形', level: 3,
              stem: '图形按 1 个圆、2 个正方形重复，第 5 个是什么？',
              options: ['圆形', '正方形', '三角形'], answer: 1,
              explain: '顺序是圆、正、正、圆、正，第 5 个是正方形。'
            }),
            M({
              skill: '规律.图形', level: 3,
              stem: '下图方框里应该画几个圆？', fig: { type: 'shapes', list: ['circle', 'circle', 'square', 'circle', 'circle', 'circle'] },
              options: ['1 个', '2 个', '3 个'], answer: 2,
              explain: '圆的数量每次多 1 个，下一组是 3 个。'
            })
          ]
        },
        {
          id: 'n2', lesson: '数字规律', title: '数字的排列规律', items: [
            M({
              skill: '规律.数字', level: 2,
              stem: '按规律填数：2、4、6、（ ）、10',
              answer: 8, unit: '', explain: '每次多 2，所以是 8。'
            }),
            M({
              skill: '规律.数字', level: 2,
              stem: '按规律填数：5、10、15、（ ）',
              answer: 20, unit: '', explain: '每次多 5，所以是 20。'
            }),
            M({
              skill: '规律.数字', level: 2,
              stem: '按规律填数：20、18、16、（ ）',
              answer: 14, unit: '', explain: '每次少 2，所以是 14。'
            }),
            M({
              skill: '规律.数字', level: 3,
              stem: '按规律填数：1、3、6、10、（ ）',
              options: ['13', '15', '16'], answer: 1,
              explain: '分别多 2、3、4、5，10 + 5 = 15。'
            }),
            M({
              skill: '规律.数字', level: 3,
              stem: '按规律填数：3、6、9、12、（ ）',
              answer: 15, unit: '', explain: '每次多 3，所以是 15。'
            })
          ]
        },
        {
          id: 'n3', lesson: '规律的应用', title: '找规律再用规律', items: [
            M({
              skill: '规律.应用', level: 3,
              stem: '一排花按红、黄、黄重复，第 6 盆是什么颜色？',
              options: ['红色', '黄色', '白色'], answer: 1,
              explain: '每 3 盆一组，第 6 盆是第 2 组的第 3 盆，黄色。'
            }),
            M({
              skill: '规律.应用', level: 3,
              stem: '数字按 10、20、30 排列，第 5 个数是几？',
              answer: 50, unit: '', explain: '第 5 个数是 50。'
            }),
            M({
              skill: '规律.应用', level: 3,
              stem: '按规律填数：50、45、40、（ ）、30',
              answer: 35, unit: '', explain: '每次少 5，所以是 35。'
            }),
            M({
              skill: '规律.应用', level: 3,
              stem: '一盏灯亮 2 秒、灭 1 秒，第 7 秒灯是亮的还是灭的？',
              options: ['亮', '灭', '不确定'], answer: 0,
              explain: '每 3 秒一循环，第 7 秒是第 3 个循环的第 1 秒，是亮的。'
            }),
            M({
              skill: '规律.应用', level: 3,
              stem: '一根绳子对折一次变 2 段，对折两次变几段？',
              answer: 4, unit: '段', explain: '每对折一次段数翻倍，2 × 2 = 4 段。'
            })
          ]
        },
        {
          id: 'n4', lesson: '单元复习', title: '找规律复习', items: [
            M({
              skill: '规律.复习', level: 2,
              stem: '按规律填数：1、4、7、（ ）',
              answer: 10, unit: '', explain: '每次多 3，所以是 10。'
            }),
            M({
              skill: '规律.复习', level: 3,
              stem: '按规律填数：100、90、80、（ ）',
              answer: 70, unit: '', explain: '每次少 10，所以是 70。'
            }),
            M({
              skill: '规律.复习', level: 3,
              stem: '图形按三角、圆、圆、三角、圆、圆排列，第 8 个是什么？',
              options: ['三角形', '圆形', '正方形'], answer: 1,
              explain: '每 3 个一组，第 8 个是第 3 组的第 2 个，圆形。'
            }),
            M({
              skill: '规律.复习', level: 3,
              stem: '按规律填数：2、5、8、11、（ ）',
              answer: 14, unit: '', explain: '每次多 3，所以是 14。'
            }),
            M({
              skill: '规律.复习', level: 3,
              stem: '一列数 20、25、30、35，第 6 个数是几？',
              answer: 45, unit: '', explain: '每次多 5，第 6 个数是 45。'
            })
          ]
        }
      ]
    },

    /* ---------------- 第八单元 总复习 ---------------- */
    {
      id: 'u8', name: '第八单元 · 总复习', nodes: [
        {
          id: 'n1', lesson: '数与运算', title: '数与运算复习', items: [
            M({
              skill: '复习.数与运算', level: 3,
              stem: '比 60 大 7 的数是几？',
              answer: 67, unit: '', explain: '60 + 7 = 67。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '86 减去 40 得几？',
              answer: 46, unit: '', explain: '86 − 40 = 46。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '45 + 8 = ?',
              answer: 53, unit: '', explain: '5 + 8 = 13，40 + 13 = 53。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '72 − 9 = ?',
              answer: 63, unit: '', explain: '12 − 9 = 3，60 + 3 = 63。'
            }),
            M({
              skill: '复习.数与运算', level: 3,
              stem: '一个数加 25 得 60，这个数是几？',
              answer: 35, unit: '', explain: '60 − 25 = 35。'
            })
          ]
        },
        {
          id: 'n2', lesson: '图形与分类', title: '图形与分类复习', items: [
            M({
              skill: '复习.图形', level: 2,
              stem: '下面哪个图形没有角？', fig: { type: 'shapes', list: ['square', 'circle', 'triangle'] },
              options: ['正方形', '圆', '三角形'], answer: 1,
              explain: '圆没有角。'
            }),
            M({
              skill: '复习.图形', level: 2,
              stem: '图中有几个正方形？', fig: { type: 'shapes', list: ['square', 'rect', 'square'] },
              answer: 2, unit: '个', explain: '第 1、3 个是正方形。'
            }),
            M({
              skill: '复习.图形', level: 3,
              stem: '用 2 个三角形和 1 个正方形能拼成什么？',
              options: ['一条小鱼', '一个圆', '一个球'], answer: 0,
              explain: '可以拼出小鱼的样子。'
            }),
            M({
              skill: '复习.分类', level: 3,
              stem: '一共 12 个球，红球 5 个，蓝球几个？',
              answer: 7, unit: '个', explain: '12 − 5 = 7 个。'
            }),
            M({
              skill: '复习.分类', level: 2,
              stem: '下面哪个不能和“苹果、梨”归为一类？',
              options: ['香蕉', '白菜', '桃子'], answer: 1,
              explain: '白菜是蔬菜，其余都是水果。'
            })
          ]
        },
        {
          id: 'n3', lesson: '人民币与生活', title: '生活中的数学', items: [
            M({
              skill: '复习.人民币', level: 3,
              stem: '一支笔 4 元，一本本子 3 元，买这两样要几元？',
              answer: 7, unit: '元', explain: '4 + 3 = 7 元。'
            }),
            M({
              skill: '复习.人民币', level: 3,
              stem: '拿 20 元买 13 元的东西，找回几元？',
              answer: 7, unit: '元', explain: '20 − 13 = 7 元。'
            }),
            M({
              skill: '复习.人民币', level: 3,
              stem: '3 元 6 角和 4 元比，哪个多？',
              options: ['4 元多', '3 元 6 角多', '一样多'], answer: 0,
              explain: '4 元比 3 元 6 角多 4 角。'
            }),
            M({
              skill: '复习.生活', level: 3,
              stem: '小明 7 时起床，8 时上学，中间隔了几小时？',
              answer: 1, unit: '小时', explain: '8 − 7 = 1 小时。'
            }),
            M({
              skill: '复习.生活', level: 3,
              stem: '妈妈买了 2 袋苹果，每袋 8 个，一共几个？',
              answer: 16, unit: '个', explain: '8 + 8 = 16 个。'
            })
          ]
        },
        {
          id: 'n4', lesson: '应用提升', title: '综合应用', items: [
            M({
              skill: '复习.综合', level: 3,
              stem: '树上有 28 只鸟，飞走 9 只，又飞来 6 只，现在几只？',
              answer: 25, unit: '只', explain: '28 − 9 = 19，19 + 6 = 25 只。'
            }),
            M({
              skill: '复习.综合', level: 3,
              stem: '一班 30 人，二班 28 人，两班共几人？',
              answer: 58, unit: '人', explain: '30 + 28 = 58 人。'
            }),
            M({
              skill: '复习.综合', level: 3,
              stem: '小红有 45 元，比小明多 9 元，小明有几元？',
              answer: 36, unit: '元', explain: '45 − 9 = 36 元。'
            }),
            M({
              skill: '复习.综合', level: 3,
              stem: '一本书 68 页，第一天看 20 页，第二天看 25 页，还剩几页？',
              answer: 23, unit: '页', explain: '20 + 25 = 45，68 − 45 = 23 页。'
            }),
            M({
              skill: '复习.综合', level: 3,
              stem: '排队时小明前面 9 人，后面 6 人，一共几人？',
              answer: 16, unit: '人', explain: '9 + 6 + 1 = 16 人。'
            })
          ]
        }
      ]
    }
  ];

  /* 比较式填数：同样每次 1~3 道
     · 图形、分类、人民币这些课只给 1 道保温，20 以内为限
     · 100 以内数的认识还没学两位数加减，仍用 20 以内
     · 到了「100 以内的加减法」再放开到 100 以内，先一位数、再两位数 */
  w.SXBuilder.decorate(UNITS, [
    { unit: 'u1', tier: 'w20', base: 1 },
    { unit: 'u2', tier: 'w20', base: 2 },
    { unit: 'u3', tier: 'w20', base: 1 },
    { unit: 'u4', tier: 'w20', base: 2 },
    { unit: 'u5', tier: 'w20', base: 1 },
    { unit: 'u6', tier: 'w100e', base: 2 },
    { unit: 'u7', tier: 'w100', base: 1 },
    { unit: 'u8', tier: 'w100', base: 3 }
  ]);

  /* 思维挑战题：一下每课保温 1 道，数域仍限 20 以内
     （100 以内那几单元难在竖式，不靠加大数字来堆难度） */
  w.SXBuilder.challengeDecorate(UNITS, [
    { unit: 'u1', max: 20, count: 1 },
    { unit: 'u2', max: 20, count: 1 },
    { unit: 'u3', max: 20, count: 1 },
    { unit: 'u4', max: 20, count: 1 },
    { unit: 'u5', max: 20, count: 1 },
    { unit: 'u6', max: 20, count: 1 },
    { unit: 'u7', max: 20, count: 1 },
    { unit: 'u8', max: 20, count: 1 }
  ]);

  /* 单元知识点题：一下各单元按知识点配题——平面图形与折拼、破十法与
     想加算减、分类整理、100 以内数的组成与数位、人民币换算、两位数
     加减、数列规律、总复习综合。每课 2 道，数域跟着单元走。 */
  w.SXBuilder.packDecorate(UNITS, [
    { unit: 'u1', tag: '1b', cap: 20, count: 2, keys: ['plane', 'pattern', 'sort'] },
    { unit: 'u2', tag: '1b', cap: 20, count: 2, keys: ['borrow', 'reverse', 'cmpExpr', 'same'] },
    { unit: 'u3', tag: '1b', cap: 20, count: 2, keys: ['sort', 'picture', 'plane'] },
    { unit: 'u4', tag: '1b', cap: 100, count: 2,
      keys: ['hundreds', 'pattern', 'adjacent'] },
    { unit: 'u5', tag: '1b', cap: 100, count: 2, keys: ['money', 'reverse', 'same'] },
    { unit: 'u6', tag: '1b', cap: 100, count: 2,
      keys: ['addsub100', 'ineq', 'mixed', 'pattern'] },
    { unit: 'u7', tag: '1b', cap: 100, count: 2, keys: ['pattern', 'plane', 'sort'] },
    { unit: 'u8', tag: '1b', cap: 100, count: 2,
      keys: ['final', 'mixed', 'pattern', 'addsub100'] }
  ]);

  w.CONTENT = w.CONTENT || {};
  w.CONTENT['sx-1b'] = w.SXBuilder.build(UNITS, {
    bookId: 'sx-1b', code: 'sx1b', name: '数学 · 一年级下册', stage: '一下'
  });
})(window);
