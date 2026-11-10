/* 汽车模型库：1950 年代到今天的经典车型，小屋展柜与装饰商店共用。
   每款车都有一条自己的侧视轮廓（车头朝右），再叠加该车型在 1/64 车模上
   最容易被认出来的签名特征：鸥翼门缝、帕加达凹顶、尾鳍、跳灯、大尾翼、
   侧面奶酪刨、侧刃、C 形双色、后挂备胎、车顶激光雷达……
   全部是参数化 SVG，离线可用、打印清晰，不依赖网络图片。 */
(function (w) {
  'use strict';

  var GROUND = 139;

  var ERAS = [
    { id: '1950s', label: '1950 年代', note: '圆滚滚的老爷车、镀铬大尾鳍' },
    { id: '1960s', label: '1960 年代', note: '小方盒、长车头的肌肉车' },
    { id: '1970s', label: '1970 年代', note: '两厢小车和楔形超级跑车' },
    { id: '1980s', label: '1980 年代', note: '方方正正的性能车' },
    { id: '1990s', label: '1990 年代', note: '圆润的跑车黄金年代' },
    { id: '2000s', label: '2000 年代', note: '超跑和第一辆电动跑车' },
    { id: '2010s', label: '2010 年代', note: '流线电动车走进生活' },
    { id: '2020s', label: '2020 年代 · 现在', note: '智能电车、国产新势力' }
  ];

  /* ---------------- 基础侧视轮廓 ----------------
     b   车身控制点（从车尾下方起，顺时针一圈），"x,y x,y ..."
     r   各点圆角半径；长度不足时自动补 4
     g   侧窗控制点；gr 侧窗圆角
     w   两个车轮 "x,y,r x,y,r"（x 小的是后轮，x 大的是前轮）
     head/tail = "x,y,w,h,kind"
     sill 车身底边 y；belt 腰线 y；doors 门数；mirror 后视镜位置
     注意：这里只是「轮廓原型」，每辆车还会用 pts / tw 改成自己的样子。 */
  var BASE = {
    /* 现代三厢 / 溜背基础 */
    sedan: {
      b: '8,118 7,99 14,85 34,81 58,79 88,46 172,43 195,49 214,79 250,81 290,85 304,90 311,108 309,122 297,126 26,126 11,124',
      r: '6,6,10,14,14,10,10,8,6,6,8,6,4,4,4,4,6',
      g: '64,75 94,51 168,48 190,54 207,75', gr: '10,8,10,8,5',
      w: '72,117,22 246,117,22', sill: 126, belt: 80, doors: 4, mirror: '201,72',
      head: '298,92,16,9,sweep', tail: '15,94,12,9,wrap'
    },
    /* 溜背电动轿车：Model S / ET7 / Taycan / SU7 */
    evlift: {
      b: '8,118 7,100 12,86 26,78 48,68 96,44 174,42 198,48 216,78 252,80 290,84 304,90 311,108 309,122 297,126 26,126 11,124',
      r: '6,6,10,12,14,12,10,8,6,6,8,6,4,4,4,4,6',
      g: '46,72 100,48 170,46 194,52 210,74', gr: '10,8,10,8,5',
      w: '72,117,22 246,117,22', sill: 126, belt: 80, doors: 4, mirror: '202,70',
      head: '298,90,16,8,led', tail: '15,92,12,7,led'
    },
    /* 双门轿跑：86 / M3 / i8 */
    coupe: {
      b: '8,116 7,96 16,83 36,79 60,76 100,48 174,42 198,47 216,76 252,79 292,84 306,89 313,107 311,121 299,126 26,126 11,123',
      r: '6,6,10,14,16,12,10,8,6,6,8,6,4,4,4,4,6',
      g: '66,73 104,52 172,47 192,53 209,72', gr: '10,8,10,8,5',
      w: '74,116,23 246,116,23', sill: 126, belt: 80, doors: 2, mirror: '203,70',
      head: '299,90,16,8,sweep', tail: '15,89,11,7,bar'
    },
    /* 浮空 C 柱：i8 */
    i8: {
      b: '8,116 7,96 16,82 36,76 60,70 100,46 176,42 200,48 218,76 252,78 292,83 306,88 313,107 311,121 299,126 26,126 11,123',
      r: '6,6,10,14,16,12,10,8,6,6,8,6,4,4,4,4,6',
      g: '62,70 104,50 172,46 194,52 210,72', gr: '10,8,10,8,5',
      w: '74,116,23 246,116,23', sill: 126, belt: 80, doors: 2, mirror: '204,68',
      head: '299,88,15,6,led', tail: '15,88,11,6,led'
    },
    /* 九十年代中置引擎跑车：NSX / RX-7 / Supra / SLK */
    sport: {
      b: '6,114 6,96 14,86 36,82 68,78 98,56 132,50 172,50 206,56 224,78 258,80 296,84 308,88 313,110 311,122 299,126 24,126 10,122',
      r: '6,6,10,16,18,14,10,10,8,8,8,6,4,4,4,4,6',
      g: '74,76 102,58 168,54 200,60 212,76', gr: '8,6,10,8,5',
      w: '70,116,23 248,116,23', sill: 126, belt: 82, doors: 2, mirror: '205,70',
      head: '298,88,15,6,slit', tail: '14,87,13,7,bar'
    },
    /* 2000 年代旗舰超跑：Veyron / R8 / SLR / AMG GT */
    supercar00: {
      b: '6,114 6,96 14,84 36,78 68,74 100,52 138,46 176,48 210,58 230,78 260,80 296,84 308,88 313,110 311,122 299,126 24,126 10,122',
      r: '6,6,10,16,18,14,10,10,8,8,8,6,4,4,4,4,6',
      g: '72,72 104,54 170,50 200,60 216,74', gr: '8,6,10,8,5',
      w: '70,116,23 248,116,23', sill: 126, belt: 82, doors: 2, mirror: '206,68',
      head: '298,88,15,6,slit', tail: '14,87,13,7,led'
    },
    /* 方盒子越野：G-Class / G 63 */
    suv: {
      b: '16,127 16,62 22,52 40,46 48,30 186,28 200,32 208,64 258,68 292,72 304,78 306,118 300,127 24,127 18,126',
      r: '4,8,12,12,10,10,8,8,8,8,6,4,4,4,5',
      g: '46,66 52,36 182,34 196,66', gr: '8,8,8,6',
      w: '70,112,27 246,112,27', sill: 127, belt: 68, doors: 4, mirror: '200,62',
      head: '296,80,12,10,rect', tail: '20,72,6,15,rect'
    },
    /* 新能源方盒越野：仰望 U8（更高、带车顶雷达） */
    u8: {
      b: '14,127 14,60 20,50 38,44 46,26 188,24 202,28 210,62 258,66 294,70 306,76 308,118 300,127 22,127 16,126',
      r: '4,8,12,12,10,10,8,8,8,8,6,4,4,4,5',
      g: '44,64 50,32 184,30 198,62', gr: '8,8,8,6',
      w: '70,112,29 246,112,29', sill: 127, belt: 66, doors: 4, mirror: '202,60',
      head: '298,78,12,9,led', tail: '19,70,6,15,led'
    },
    /* 不锈钢楔形皮卡：Cybertruck */
    cyber: {
      b: '10,127 10,100 20,94 150,44 196,44 254,88 298,96 306,104 308,122 300,127 18,127',
      r: '2,3,3,3,3,3,2,2,3,3,2',
      g: '162,48 190,48 250,90 198,90', gr: '3,3,3,3',
      w: '74,114,25 238,114,25', sill: 127, belt: 88, doors: 2, mirror: '214,62',
      head: '297,100,12,5,led', tail: '14,104,5,20,led'
    },
    /* 两厢小车：第一代 Civic / Golf GTI / AE86 */
    hatch: {
      b: '10,118 10,84 16,73 34,69 54,65 76,48 158,44 188,50 198,74 212,78 278,82 296,88 304,104 302,120 292,126 24,126 12,124',
      r: '6,8,14,16,14,14,12,8,8,6,8,6,4,4,4,4,6',
      g: '62,68 82,52 154,48 182,54 194,71 58,71', gr: '10,8,10,8,4,4',
      w: '70,117,22 242,117,22', sill: 126, belt: 74, doors: 4, mirror: '196,68',
      head: '289,88,13,8,sweep', tail: '18,84,7,14,rect'
    },
    /* 楔形超跑：Countach / Testarossa */
    wedge: {
      b: '6,120 6,96 14,88 40,86 70,84 104,70 146,62 176,62 204,72 232,88 268,90 300,96 308,104 310,118 300,124 18,124',
      r: '5,5,8,10,10,6,8,6,6,8,6,6,4,4,4,4',
      g: '84,82 112,72 168,66 190,74 204,82', gr: '6,6,6,6,4',
      w: '68,116,23 248,116,23', sill: 124, belt: 84, doors: 2, mirror: '207,76',
      head: '298,98,12,5,pop', tail: '13,90,10,6,bar'
    },
    /* 八九十年代方盒子三厢：190E / 560SEL / E21 / E30 M3 / 2002 */
    square80: {
      b: '8,118 8,90 14,78 24,75 50,73 64,71 84,49 156,47 176,51 190,71 214,75 284,77 298,83 306,100 304,120 292,126 26,126 12,124',
      r: '5,6,10,10,12,10,10,10,10,8,8,6,4,4,4,4,5',
      g: '66,69 88,53 152,51 172,56 182,69', gr: '8,6,8,6,4',
      w: '72,117,22 244,117,22', sill: 126, belt: 73, doors: 4, mirror: '190,68',
      head: '293,84,13,8,rect', tail: '15,87,9,9,rect'
    },
    /* 五十年代圆润老爷车 */
    classic50: {
      b: '10,116 10,100 16,90 30,84 50,82 74,70 90,54 120,46 152,46 170,52 186,72 212,78 250,82 284,86 298,92 304,104 302,118 292,124 24,124 12,122',
      r: '10,8,12,16,18,20,18,14,10,10,10,10,8,6,4,4,4,4,8',
      g: '80,66 96,56 148,50 166,56 178,68', gr: '12,10,14,10,6',
      w: '66,118,21 246,118,21', sill: 124, belt: 72, doors: 2, mirror: '184,66',
      head: '292,92,13,10,round', tail: '15,94,8,7,round'
    },
    /* 300SL 鸥翼：更低的车顶 + 更长的引擎盖 */
    gullwing: {
      b: '10,116 10,100 16,90 30,84 50,82 76,70 94,52 126,44 158,44 178,54 198,72 232,76 268,80 292,86 302,94 306,106 304,118 292,124 24,124 12,122',
      r: '10,8,12,16,18,20,18,14,12,10,10,10,8,6,4,4,4,4,8',
      g: '84,64 102,54 148,48 170,54 190,68', gr: '12,10,14,10,6',
      w: '66,118,21 248,118,21', sill: 124, belt: 74, doors: 2, mirror: '190,64',
      head: '294,92,13,10,round', tail: '15,94,8,7,round'
    },
    /* 宝马 507：长车头敞篷、只有一片风挡 */
    cabrio: {
      b: '10,116 10,98 16,84 32,78 56,74 84,72 166,72 184,60 194,60 208,74 246,80 284,86 300,92 308,106 306,120 292,124 24,124 12,122',
      r: '8,8,12,14,16,16,14,4,4,10,10,8,6,4,4,4,4,6,6',
      g: '165,71 184,61 194,61 206,73', gr: '2,2,2,2',
      w: '66,118,21 248,118,21', sill: 124, belt: 74, doors: 2, mirror: '204,64',
      head: '294,92,12,10,round', tail: '15,94,8,7,round'
    },
    /* 小敞篷：SLK / Tesla Roadster */
    roadster: {
      b: '12,116 12,98 18,86 34,80 58,76 96,74 162,74 180,62 192,62 204,74 244,80 282,84 300,90 308,106 304,120 290,124 26,124',
      r: '8,8,12,14,16,16,14,4,4,10,10,8,6,4,4,4,4,6',
      g: '161,73 180,63 192,63 202,73', gr: '2,2,2,2',
      w: '70,117,22 242,117,22', sill: 126, belt: 76, doors: 2, mirror: '200,66',
      head: '292,90,13,8,round', tail: '17,92,8,7,round'
    },
    /* 280SL 帕加达：硬顶中间凹下去 */
    pagoda: {
      b: '10,116 10,100 16,90 30,84 50,82 74,70 92,52 114,44 136,52 158,44 180,56 200,74 232,78 266,82 292,86 302,94 306,106 304,118 292,124 24,124 12,122',
      r: '10,8,12,16,18,20,16,12,12,10,10,10,8,6,4,4,4,4,8,6',
      g: '82,68 98,52 128,58 156,50 178,58 194,70 82,70', gr: '10,10,8,10,8,5,4',
      w: '66,118,21 246,118,21', sill: 124, belt: 74, doors: 2, mirror: '192,64',
      head: '292,92,12,9,round', tail: '15,94,8,7,round'
    },
    /* 五十年代尾鳍车：Bel Air / Eldorado */
    fins50: {
      b: '6,114 6,98 9,86 14,74 26,71 50,74 70,74 92,56 120,44 154,44 176,50 196,72 220,78 256,82 290,86 304,92 310,106 308,118 296,124 24,124 10,122',
      r: '8,8,10,12,14,12,14,12,10,10,10,10,8,6,4,4,4,4,8',
      g: '96,68 104,54 150,49 170,56 186,70', gr: '8,8,10,8,6',
      w: '70,117,22 246,117,22', sill: 124, belt: 74, doors: 4, mirror: '186,68',
      head: '294,94,12,10,round', tail: '14,92,7,12,fin'
    },
    /* 圆顶甲壳虫 */
    beetle: {
      b: '12,114 12,96 20,84 34,74 48,66 62,52 84,40 112,38 140,40 158,50 172,66 196,74 238,80 282,86 298,94 302,110 298,120 288,124 24,124 14,122',
      r: '8,10,14,16,18,20,20,18,14,12,10,10,8,6,4,4,4,4,8',
      g: '70,62 86,48 112,42 140,44 154,52 164,64', gr: '10,10,14,12,10,8',
      w: '64,118,21 248,118,21', sill: 124, belt: 66, doors: 2, mirror: '176,64',
      head: '293,95,12,12,round', tail: '17,101,7,6,round'
    },
    /* 迷你小方盒 */
    mini60: {
      b: '20,118 20,92 24,80 34,75 48,73 62,69 76,50 154,46 174,52 184,71 206,75 268,79 286,87 294,102 292,118 282,123 34,123 22,121',
      r: '8,8,12,14,16,14,12,10,10,8,8,6,4,4,4,4,8',
      g: '62,67 78,53 150,49 168,55 176,67', gr: '10,8,12,8,4',
      w: '48,119,20 266,119,20', sill: 123, belt: 69, doors: 2, mirror: '180,64',
      head: '282,88,11,11,round', tail: '25,92,6,12,rect'
    },
    /* 六十年代长车头肌肉车：Mustang */
    muscle60: {
      b: '6,116 6,92 12,82 26,79 56,76 84,72 112,50 170,46 206,54 226,76 250,80 292,84 306,90 312,106 310,120 298,126 24,126 10,124',
      r: '6,6,10,14,16,20,16,12,10,8,8,6,4,4,4,4,6',
      g: '96,70 118,54 166,50 196,58 212,74', gr: '10,8,12,10,6',
      w: '70,116,23 248,116,23', sill: 126, belt: 76, doors: 2, mirror: '201,72',
      head: '291,92,14,8,round', tail: '15,91,9,6,bar'
    },
    /* 保时捷式溜背：911 / 2000GT */
    sport60: {
      b: '6,116 8,100 16,88 34,82 58,76 86,60 112,48 140,44 164,46 186,56 200,76 240,80 290,84 304,90 310,106 308,120 296,126 24,126 10,124',
      r: '6,8,12,16,18,20,16,14,10,8,8,6,4,4,4,4,6',
      g: '78,70 102,54 136,48 160,50 180,60 190,72', gr: '8,8,12,10,8,6',
      w: '70,117,22 248,117,22', sill: 126, belt: 76, doors: 2, mirror: '192,70',
      head: '290,92,13,9,round', tail: '13,92,9,6,round'
    }
  };

  /* ---------------- 车型清单 ----------------
     每辆车 shape 唯一：base 给骨架，pts 精改控制点，tw 做比例微调，sig 是签名特征。
     同一 base 的车也一定有不同的 pts/tw，保证 42 条轮廓两两不同。 */
  var CARS = [
    /* 1950s */
    { id: 'car_300sl', brand: '奔驰', model: '300SL 鸥翼', year: 1954, era: '1950s', shape: 'sl300', base: 'gullwing', color: '#C9D2DD', ww: 1,
      tw: { roof: -1 }, sig: ['gullwing', 'gills', 'star', 'chrome50'] },
    { id: 'car_beetle', brand: '大众', model: '甲壳虫', year: 1955, era: '1950s', shape: 'beetle55', base: 'beetle', color: '#6FA8C9', ww: 1,
      tw: { roof: -2 }, sig: ['rearEngine', 'chrome50', 'runningBoard'] },
    { id: 'car_bmw507', brand: '宝马', model: '507 敞篷', year: 1956, era: '1950s', shape: 'bmw507', base: 'cabrio', color: '#E9EEF4', ww: 1,
      tw: { hood: -2 }, sig: ['kidney', 'sidegill', 'seat', 'chrome50'] },
    { id: 'car_belair', brand: '雪佛兰', model: 'Bel Air', year: 1957, era: '1950s', shape: 'belair57', base: 'fins50', color: '#D3547A', roof2: '#FFFFFF', ww: 1,
      tw: { roof: 2 }, sig: ['fins', 'twotoneWide', 'chrome50'] },
    { id: 'car_eldorado', brand: '凯迪拉克', model: 'Eldorado', year: 1959, era: '1950s', shape: 'eldorado59', base: 'fins50', color: '#D3A03A', roof2: '#FFF8E8', ww: 1,
      pts: { 1: [6, 92], 2: [9, 80], 3: [13, 64], 4: [24, 62] }, tw: { roof: 3 }, sig: ['fins', 'rocketTail', 'twotoneWide', 'chrome50'] },

    /* 1960s */
    { id: 'car_mini', brand: '迷你', model: 'Cooper', year: 1961, era: '1960s', shape: 'mini61', base: 'mini60', color: '#C8503F', roof2: '#F8F5ED',
      pts: { 0: [22, 118], 1: [22, 90], 16: [36, 123] }, sig: ['twotone', 'minigrille', 'chrome50'] },
    { id: 'car_911', brand: '保时捷', model: '911', year: 1963, era: '1960s', shape: 'p911_63', base: 'sport60', color: '#E8B657',
      pts: { 5: [80, 58], 6: [108, 46], 7: [142, 42], 8: [168, 46] }, sig: ['rearEngine', 'fuchs', 'fastback'] },
    { id: 'car_mustang', brand: '福特', model: 'Mustang', year: 1965, era: '1960s', shape: 'mustang65', base: 'muscle60', color: '#D9564F',
      tw: { roof: -2, hood: -2 }, sig: ['fastback', 'sidescoop', 'triBar', 'stripe'] },
    { id: 'car_2000gt', brand: '丰田', model: '2000GT', year: 1967, era: '1960s', shape: 'toy2000gt', base: 'sport60', color: '#EDEFF3',
      pts: { 11: [252, 78], 12: [294, 82], 13: [306, 88] }, tw: { roof: -3 }, sig: ['pop', 'fastback', 'wireWheel'] },
    { id: 'car_280sl', brand: '奔驰', model: '280SL 帕加达', year: 1968, era: '1960s', shape: 'sl280pagoda', base: 'pagoda', color: '#8FB894',
      sig: ['pagoda', 'star', 'chrome50'] },
    { id: 'car_bmw2002', brand: '宝马', model: '2002', year: 1968, era: '1960s', shape: 'bmw2002', base: 'square80', color: '#E4A23C',
      pts: { 3: [30, 75], 4: [56, 72], 5: [70, 70], 10: [188, 70] }, tw: { front: -4 }, sig: ['kidney', 'hof', 'roundlight2'] },

    /* 1970s */
    { id: 'car_civic', brand: '本田', model: 'Civic', year: 1972, era: '1970s', shape: 'civic72', base: 'hatch', color: '#E7BE64',
      pts: { 1: [12, 86], 2: [18, 74], 3: [36, 70], 8: [196, 74] }, tw: { front: -6 }, sig: ['hatch', 'blackBumper', 'roundlight2'] },
    { id: 'car_golf', brand: '大众', model: 'Golf GTI', year: 1974, era: '1970s', shape: 'golf74', base: 'hatch', color: '#C94F48',
      pts: { 5: [70, 48], 6: [154, 42], 7: [190, 48], 8: [200, 72] }, sig: ['hatch', 'redGrille', 'blackBumper', 'cPillar'] },
    { id: 'car_countach', brand: '兰博基尼', model: 'Countach', year: 1974, era: '1970s', shape: 'countach74', base: 'wedge', color: '#EFC65F',
      pts: { 5: [100, 68], 6: [144, 60], 7: [178, 60] }, sig: ['scissor', 'bigWing', 'sideIntake', 'pop'] },
    { id: 'car_bmwe21', brand: '宝马', model: '3 系 E21', year: 1975, era: '1970s', shape: 'bmwe21', base: 'square80', color: '#7FBBDA',
      pts: { 6: [88, 48], 7: [158, 46], 8: [178, 50], 9: [192, 70] }, tw: { front: -3 }, sig: ['kidney', 'hof', 'squarelight2'] },
    { id: 'car_gclass', brand: '奔驰', model: 'G 级 W460', year: 1979, era: '1970s', shape: 'gw460', base: 'suv', color: '#9DAF8B',
      pts: { 4: [46, 32], 5: [184, 30], 6: [198, 34] }, sig: ['spare', 'roofrack', 'hinges', 'star', 'roundlight2'] },

    /* 1980s */
    { id: 'car_190e', brand: '奔驰', model: '190E', year: 1982, era: '1980s', shape: 'w201', base: 'square80', color: '#C3CCD8',
      pts: { 2: [14, 76], 3: [26, 73], 6: [86, 47], 7: [158, 45] }, sig: ['star', 'squarelight2', 'blackBumper'] },
    { id: 'car_ae86', brand: '丰田', model: 'AE86', year: 1983, era: '1980s', shape: 'ae86', base: 'square80', color: '#F1F3F6',
      pts: { 3: [28, 74], 4: [54, 71], 7: [152, 46], 9: [188, 70] }, tw: { front: -5 }, sig: ['pop', 'blackBumper', 'hatch'] },
    { id: 'car_testarossa', brand: '法拉利', model: 'Testarossa', year: 1984, era: '1980s', shape: 'testarossa84', base: 'wedge', color: '#D24A45',
      pts: { 3: [36, 84], 4: [66, 82], 5: [100, 68], 8: [206, 70] }, sig: ['strakes', 'pop'] },
    { id: 'car_bmwm3e30', brand: '宝马', model: 'M3 E30', year: 1986, era: '1980s', shape: 'm3e30', base: 'square80', color: '#D8DDE4',
      pts: { 4: [48, 71], 5: [62, 69], 6: [86, 46], 8: [178, 50] }, sig: ['flares', 'wing', 'kidney', 'hof', 'squarelight2'] },
    { id: 'car_560sel', brand: '奔驰', model: '560SEL', year: 1988, era: '1980s', shape: 'w126', base: 'square80', color: '#5D6B7A',
      pts: { 6: [96, 45], 7: [164, 43], 8: [182, 47], 9: [196, 69], 12: [290, 76] }, tw: { front: 2 }, sig: ['star', 'chromeFrame', 'longWheel'] },

    /* 1990s */
    { id: 'car_nsx', brand: '本田', model: 'NSX', year: 1990, era: '1990s', shape: 'nsx90', base: 'sport', color: '#DE5F52',
      pts: { 6: [100, 54], 7: [134, 48], 8: [174, 48], 9: [208, 54] }, sig: ['pop', 'midEngine', 'blackRoof'] },
    { id: 'car_rx7', brand: '马自达', model: 'RX-7', year: 1992, era: '1990s', shape: 'rx7fd', base: 'sport', color: '#C9453F',
      pts: { 4: [64, 76], 5: [94, 54], 8: [204, 54], 9: [226, 76] }, sig: ['pop', 'smallWing', 'roundTail'] },
    { id: 'car_supra', brand: '丰田', model: 'Supra', year: 1993, era: '1990s', shape: 'supraa80', base: 'sport', color: '#D89A34',
      pts: { 5: [92, 56], 6: [128, 50], 9: [210, 58], 11: [262, 80] }, sig: ['bigWing', 'scoop', 'roundTail'] },
    { id: 'car_bmwm3e36', brand: '宝马', model: 'M3 E36', year: 1994, era: '1990s', shape: 'm3e36', base: 'coupe', color: '#E8B33F',
      pts: { 5: [96, 48], 6: [170, 42], 7: [196, 47], 8: [214, 76] }, sig: ['kidney', 'hof', 'fourLight'] },
    { id: 'car_slk', brand: '奔驰', model: 'SLK', year: 1996, era: '1990s', shape: 'slkr170', base: 'roadster', color: '#C7363B',
      pts: { 5: [92, 72], 6: [160, 72], 7: [176, 54], 8: [188, 54] }, sig: ['seat', 'hardtop', 'star', 'chrome50'] },

    /* 2000s */
    { id: 'car_slr', brand: '奔驰', model: 'SLR McLaren', year: 2003, era: '2000s', shape: 'slr03', base: 'supercar00', color: '#B7BEC9',
      pts: { 5: [94, 52], 6: [132, 46], 7: [170, 46], 8: [206, 56], 10: [236, 78] }, sig: ['gullwing', 'vents', 'star', 'sidepipe'] },
    { id: 'car_veyron', brand: '布加迪', model: 'Veyron', year: 2005, era: '2000s', shape: 'veyron05', base: 'supercar00', color: '#4E5670', roof2: '#C8CDD6',
      pts: { 4: [64, 72], 5: [96, 50], 6: [134, 44], 7: [178, 46], 9: [232, 76] }, sig: ['ccurve', 'sideIntake'] },
    { id: 'car_r8', brand: '奥迪', model: 'R8', year: 2006, era: '2000s', shape: 'r806', base: 'supercar00', color: '#C0C6D2', accent: '#3C414C',
      pts: { 5: [102, 52], 6: [140, 46], 7: [174, 48], 8: [212, 58] }, sig: ['sideblade', 'midEngine', 'led'] },
    { id: 'car_bmwm3e92', brand: '宝马', model: 'M3 E92', year: 2007, era: '2000s', shape: 'm3e92', base: 'coupe', color: '#4E7FB0',
      pts: { 4: [58, 74], 5: [98, 46], 6: [176, 40], 7: [200, 46], 8: [218, 74] }, sig: ['kidney', 'hof', 'carbonRoof', 'powerdome'] },
    { id: 'car_roadster', brand: '特斯拉', model: 'Roadster', year: 2008, era: '2000s', shape: 'tsroadster', base: 'roadster', color: '#D8503F',
      pts: { 3: [32, 78], 4: [56, 74], 9: [206, 74], 10: [248, 78] }, sig: ['seat', 'vent', 'blackBumper'] },

    /* 2010s */
    { id: 'car_models', brand: '特斯拉', model: 'Model S', year: 2012, era: '2010s', shape: 'models12', base: 'evlift', color: '#C9D4E2',
      pts: { 4: [46, 66], 5: [94, 42], 6: [176, 40], 7: [200, 46] }, sig: ['pano', 'hiddenHandle', 'nogrille', 'ledbar'] },
    { id: 'car_gt86', brand: '丰田', model: '86', year: 2012, era: '2010s', shape: 'gt86', base: 'coupe', color: '#E3924A',
      pts: { 5: [98, 48], 6: [172, 42], 7: [198, 48], 8: [216, 76] }, tw: { front: -4 }, sig: ['longHood', 'ducktail', 'hiddenHandle'] },
    { id: 'car_i8', brand: '宝马', model: 'i8', year: 2014, era: '2010s', shape: 'bmwi8', base: 'i8', color: '#DDE4EA', accent: '#2E9BD6',
      pts: { 4: [58, 68], 5: [98, 44], 6: [178, 40], 7: [202, 46] }, sig: ['floatingC', 'kidney', 'blueAccent', 'led'] },
    { id: 'car_amggt', brand: '奔驰', model: 'AMG GT', year: 2015, era: '2010s', shape: 'amggt15', base: 'supercar00', color: '#96B4C9',
      pts: { 5: [96, 50], 6: [136, 44], 7: [172, 46], 8: [206, 56], 9: [226, 76], 10: [256, 78] }, sig: ['star', 'longHood', 'panamericana'] },
    { id: 'car_taycan', brand: '保时捷', model: 'Taycan', year: 2019, era: '2010s', shape: 'taycan19', base: 'evlift', color: '#7A4FB5',
      pts: { 5: [98, 42], 6: [178, 40], 7: [202, 46], 8: [220, 76] }, tw: { roof: 2 }, sig: ['ledbar', 'pano', 'hiddenHandle'] },

    /* 2020s */
    { id: 'car_g63', brand: '奔驰', model: 'G 63', year: 2021, era: '2020s', shape: 'g63_21', base: 'suv', color: '#5B5F63',
      pts: { 4: [46, 28], 5: [188, 26], 6: [202, 30], 9: [294, 70] }, tw: { wheel: 2 }, sig: ['spare', 'roofrack', 'star', 'amgGrille', 'flares'] },
    { id: 'car_et7', brand: '蔚来', model: 'ET7', year: 2022, era: '2020s', shape: 'et7_22', base: 'evlift', color: '#8FBBDF',
      pts: { 4: [44, 66], 5: [92, 42], 6: [174, 40], 7: [198, 46] }, sig: ['lidar', 'ledbar', 'pano', 'hiddenHandle'] },
    { id: 'car_i7', brand: '宝马', model: 'i7', year: 2022, era: '2020s', shape: 'i7_22', base: 'sedan', color: '#6B7076',
      pts: { 5: [94, 44], 6: [178, 41], 7: [200, 47], 8: [218, 77], 12: [306, 88] }, tw: { front: 2 }, sig: ['kidneyBig', 'splitLight', 'chromeFrame', 'hof', 'ledbar'] },
    { id: 'car_cybertruck', brand: '特斯拉', model: 'Cybertruck', year: 2023, era: '2020s', shape: 'cyber23', base: 'cyber', color: '#B4BCC2',
      pts: { 3: [148, 42], 4: [198, 42], 5: [256, 86] }, sig: ['stainless', 'ledbar', 'blackClad'] },
    { id: 'car_u8', brand: '比亚迪', model: '仰望 U8', year: 2023, era: '2020s', shape: 'u8_23', base: 'u8', color: '#4F6570',
      sig: ['spare', 'lidar', 'roofrack', 'ledbar'] },
    { id: 'car_su7', brand: '小米', model: 'SU7 Ultra', year: 2024, era: '2020s', shape: 'su7_24', base: 'evlift', color: '#F2C81E',
      pts: { 4: [44, 64], 5: [92, 40], 6: [176, 38], 7: [200, 44], 8: [218, 74] }, tw: { roof: 2 }, sig: ['lidar', 'ledbar', 'hiddenHandle', 'pano'] }
  ];

  CARS.forEach(function (c, i) { c.cost = 30 + i * 20; });

  /* ---------------- 解析与轮廓生成 ---------------- */
  function pts(s) {
    return String(s || '').trim().split(/\s+/).map(function (p) {
      var a = p.split(',').map(Number); return [a[0], a[1]];
    });
  }
  function triples(s) {
    return String(s || '').trim().split(/\s+/).map(function (p) {
      var a = p.split(',').map(Number); return [a[0], a[1], a[2]];
    });
  }
  function nums(s) { return String(s || '').split(',').map(Number); }
  function lamp(s) {
    var a = String(s || '').split(',');
    return { x: +a[0], y: +a[1], w: +a[2], h: +a[3], kind: a[4] || 'rect' };
  }
  function pad(arr, n, d) {
    var a = arr.slice();
    while (a.length < n) a.push(d);
    return a.slice(0, n);
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function parseBase(b) {
    var body = pts(b.b), glass = pts(b.g), wheels = triples(b.w);
    return {
      body: body, rad: pad(nums(b.r), body.length, 4),
      glass: glass, grad: pad(nums(b.gr), glass.length, 4),
      wheels: wheels, sill: b.sill, belt: b.belt, doors: b.doors,
      mirror: pts(b.mirror)[0], head: lamp(b.head), tail: lamp(b.tail),
      extra: b.extra || ''
    };
  }

  /* tw：按区域做比例微调；pts：直接改某一个控制点 */
  function makeShape(car) {
    var s = parseBase(BASE[car.base] || BASE.sedan);
    var tw = car.tw || {};
    if (tw.roof || tw.hood || tw.front || tw.rear || tw.glassTop) {
      s.body = s.body.map(function (p) {
        var x = p[0], y = p[1];
        if (tw.roof && y < s.belt - 10 && x > 50 && x < 225) y += tw.roof;
        if (tw.hood && x > 205 && y < 100) y += tw.hood;
        if (tw.front && x > 245) x = Math.min(314, x + tw.front);
        if (tw.rear && x < 65) x = Math.max(4, x + tw.rear);
        return [x, y];
      });
      if (tw.glassTop) {
        s.glass = s.glass.map(function (p) {
          return p[1] < s.belt ? [p[0], p[1] + tw.glassTop] : p;
        });
      }
    }
    if (tw.wheel) s.wheels.forEach(function (p) { p[2] += tw.wheel; });
    if (car.pts) {
      Object.keys(car.pts).forEach(function (k) {
        var i = +k;
        if (i >= 0 && i < s.body.length) s.body[i] = car.pts[k].slice();
      });
    }
    if (car.gpts) {
      Object.keys(car.gpts).forEach(function (k) {
        var i = +k;
        if (i >= 0 && i < s.glass.length) s.glass[i] = car.gpts[k].slice();
      });
    }
    s.sig = car.sig || [];
    return s;
  }

  var SHAPES = {};
  CARS.forEach(function (c) { SHAPES[c.shape] = makeShape(c); });

  /* ---------------- 绘图工具 ---------------- */
  function num(v) { return Math.round(v * 10) / 10; }
  function vecTo(a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1];
    var l = Math.sqrt(dx * dx + dy * dy) || 1;
    return [dx / l, dy / l, l];
  }
  function rpath(p, radii) {
    var d = '', n = p.length;
    for (var i = 0; i < n; i++) {
      var q = p[i], r = (radii && radii[i]) || 0;
      if (i === 0) { d += 'M' + num(q[0]) + ' ' + num(q[1]); continue; }
      if (!r) { d += 'L' + num(q[0]) + ' ' + num(q[1]); continue; }
      var a = p[i - 1], z = p[(i + 1) % n];
      var v1 = vecTo(a, q), v2 = vecTo(z, q);
      var rr = Math.min(r, v1[2] * 0.45, v2[2] * 0.45);
      d += 'L' + num(q[0] - v1[0] * rr) + ' ' + num(q[1] - v1[1] * rr) +
        'Q' + num(q[0]) + ' ' + num(q[1]) + ' ' +
        num(q[0] - v2[0] * rr) + ' ' + num(q[1] - v2[1] * rr);
    }
    return d + 'Z';
  }
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function rgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function mix(a, b, t) {
    var x = rgb(a), y = rgb(b);
    return '#' + x.map(function (v, i) {
      var n = Math.round(v + (y[i] - v) * t);
      return (n < 16 ? '0' : '') + n.toString(16);
    }).join('');
  }
  function fillTpl(str, car, dark) {
    return String(str || '').replace(/__C__/g, car.color).replace(/__D__/g, dark);
  }

  /* 车轮：深灰胎 + 可选白边 + 五辐轮毂 */
  function wheel(cx, cy, r, whitewall, style) {
    var s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#24242C"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r - 0.6) + '" fill="none" stroke="#3B3B47" stroke-width="1.1" opacity=".8"/>';
    s += '<path d="M' + num(cx - r * 0.72) + ' ' + num(cy - r * 0.7) + ' A' + num(r * 0.97) + ' ' + num(r * 0.97) +
      ' 0 0 1 ' + num(cx + r * 0.5) + ' ' + num(cy - r * 0.85) + '" fill="none" stroke="#4A4A58" stroke-width="1.6" opacity=".55"/>';
    if (whitewall) {
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r * 0.78) + '" fill="#EDEAE0"/>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r * 0.78) + '" fill="none" stroke="#CFCBBD" stroke-width=".8"/>';
    }
    var rim = r * 0.66;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(rim) + '" fill="' +
      (style === 'fuchs' ? '#3C4149' : style === 'wire' ? '#C7CDD4' : '#6B7280') + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(rim) + '" fill="none" stroke="#4E5461" stroke-width="1.1"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(rim * 0.46) + '" fill="#767E8C"/>';
    var spokes = style === 'wire' ? 10 : 5;
    for (var i = 0; i < spokes; i++) {
      var a = (i * 360 / spokes - 90) * Math.PI / 180;
      s += '<line x1="' + num(cx + Math.cos(a) * rim * 0.22) + '" y1="' + num(cy + Math.sin(a) * rim * 0.22) +
        '" x2="' + num(cx + Math.cos(a) * rim * 0.92) + '" y2="' + num(cy + Math.sin(a) * rim * 0.92) +
        '" stroke="' + (style === 'wire' ? '#8A919C' : '#C3CAD5') + '" stroke-width="' + num(r * 0.14) + '" stroke-linecap="round"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(rim * 0.26) + '" fill="#AEB6C2" stroke="#7C8391" stroke-width=".8"/>';
    return s;
  }

  /* 前灯：round / rect / sweep / slit / pop / led */
  function headLamp(h, hid, dark) {
    var cx = h.x, cy = h.y, wd = h.w, ht = h.h, k = h.kind || 'rect';
    var x0 = cx - wd / 2, y0 = cy - ht / 2;
    if (k === 'round') {
      var r = Math.min(wd, ht) / 2;
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r + 1.3) + '" fill="' + dark + '" opacity=".55"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r) + '" fill="url(#' + hid + ')" stroke="#EAF2F8" stroke-width=".8"/>' +
        '<circle cx="' + num(cx - r * 0.28) + '" cy="' + num(cy - r * 0.3) + '" r="' + num(r * 0.36) + '" fill="#FFFEF6" opacity=".85"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r * 0.9) + '" fill="none" stroke="#8D95A2" stroke-width=".6" opacity=".6"/>';
    }
    var d;
    if (k === 'slit' || k === 'pop') {
      d = 'M' + num(x0) + ' ' + num(y0 + ht) + ' L' + num(x0 + wd * 0.3) + ' ' + num(y0) +
        ' L' + num(x0 + wd) + ' ' + num(y0 + ht * 0.25) + ' L' + num(x0 + wd * 0.72) + ' ' + num(y0 + ht) + ' Z';
    } else {
      var skew = k === 'sweep' ? ht * 0.7 : 1.8;
      d = 'M' + num(x0) + ' ' + num(y0 + ht) + ' L' + num(x0 + skew) + ' ' + num(y0) +
        ' L' + num(x0 + wd) + ' ' + num(y0 + 0.9) + ' L' + num(x0 + wd - skew * 0.55) + ' ' + num(y0 + ht) + ' Z';
    }
    return '<path d="' + d + '" fill="' + dark + '" opacity=".55" stroke="' + dark + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="url(#' + hid + ')" stroke="#F3F8FC" stroke-width=".7" stroke-linejoin="round" opacity=".95"/>' +
      '<path d="M' + num(x0 + wd * 0.3) + ' ' + num(y0 + ht * 0.55) + ' L' + num(x0 + wd * 0.9) + ' ' + num(y0 + ht * 0.42) +
      '" stroke="#FFFFFF" stroke-width="1.1" opacity=".7"/>';
  }

  /* 尾灯：round / bar / wrap / rect / led / fin */
  function tailLamp(t, tid, dark) {
    var cx = t.x, cy = t.y, wd = t.w, ht = t.h, k = t.kind || 'bar';
    var x0 = cx - wd / 2, y0 = cy - ht / 2;
    if (k === 'round') {
      var r = Math.min(wd, ht) / 2;
      return '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r + 1.1) + '" fill="' + dark + '" opacity=".5"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + num(r) + '" fill="url(#' + tid + ')" stroke="#F0B6AE" stroke-width=".6"/>';
    }
    if (k === 'fin') {
      var fd = 'M' + num(x0) + ' ' + num(y0 + ht) + ' L' + num(x0 + 1) + ' ' + num(y0) +
        ' L' + num(x0 + wd) + ' ' + num(y0 + 1) + ' L' + num(x0 + wd) + ' ' + num(y0 + ht) + ' Z';
      return '<path d="' + fd + '" fill="' + dark + '" opacity=".5" stroke="' + dark + '" stroke-width="2.2"/>' +
        '<path d="' + fd + '" fill="url(#' + tid + ')" stroke="#F2BDB4" stroke-width=".6"/>';
    }
    var rd = Math.min(2.4, ht / 2);
    return '<rect x="' + num(x0 - 1) + '" y="' + num(y0 - 1) + '" width="' + num(wd + 2) + '" height="' + num(ht + 2) +
      '" rx="' + num(rd + 1) + '" fill="' + dark + '" opacity=".45"/>' +
      '<rect x="' + num(x0) + '" y="' + num(y0) + '" width="' + num(wd) + '" height="' + num(ht) +
      '" rx="' + num(rd) + '" fill="url(#' + tid + ')" stroke="#F2BDB4" stroke-width=".5"/>' +
      '<rect x="' + num(x0 + 0.6) + '" y="' + num(y0 + ht * 0.6) + '" width="' + num(wd - 1.2) + '" height="' +
      num(ht * 0.34) + '" fill="#A9261B" opacity=".45" rx=".8"/>';
  }

  /* 车头格栅：侧视只露出前端一小块 */
  function grille(sh, car) {
    if (!sh.grille) return '';
    var g = sh.grille, x = g.x, y = g.y, wd = g.w, ht = g.h;
    if (g.kind === 'kidney') {
      return '<rect x="' + x + '" y="' + y + '" width="' + num(wd * 0.42) + '" height="' + ht + '" rx="1.4" fill="#3A3A46" stroke="#C7CDD6" stroke-width=".7"/>' +
        '<rect x="' + num(x + wd * 0.54) + '" y="' + y + '" width="' + num(wd * 0.42) + '" height="' + ht + '" rx="1.4" fill="#3A3A46" stroke="#C7CDD6" stroke-width=".7"/>';
    }
    if (g.kind === 'star') {
      return '<rect x="' + x + '" y="' + y + '" width="' + wd + '" height="' + ht + '" rx="1.6" fill="#2F2F3A" stroke="#C7CDD6" stroke-width=".8"/>' +
        '<circle cx="' + num(x + wd / 2) + '" cy="' + num(y + ht / 2) + '" r="' + num(Math.min(wd, ht) * 0.3) + '" fill="none" stroke="#E8EBF0" stroke-width=".9"/>';
    }
    return '<rect x="' + x + '" y="' + y + '" width="' + wd + '" height="' + ht + '" rx="1.4" fill="#33333F" opacity=".8"/>';
  }

  function archHoles(sh) {
    var d = '';
    sh.wheels.forEach(function (p) {
      var R = p[2] + 6;
      d += 'M' + num(p[0] - R) + ' ' + num(sh.sill) + ' A' + num(R) + ' ' + num(R) + ' 0 0 1 ' +
        num(p[0] + R) + ' ' + num(sh.sill) + ' Z';
    });
    return d;
  }

  /* ---------------- 车型签名特征（1/64 车模的辨识点） ----------------
     每个特征返回 [车身内的 SVG, 车身外的 SVG]。
     c 提供颜色与几何上下文，坐标都按 320×160 的侧视画布。 */
  var FEAT = {
    /* 奔驰立标 / 星徽 */
    star: function (car, sh, c) {
      var x = 268, y = c.hoodY + 1;
      return ['', '<path d="M' + x + ' ' + y + ' l0 -5" stroke="#D8DEE7" stroke-width="1"/>' +
        '<circle cx="' + x + '" cy="' + (y - 6) + '" r="1.8" fill="none" stroke="#D8DEE7" stroke-width=".9"/>' +
        '<path d="M' + x + ' ' + (y - 6) + ' l0 -2 M' + x + ' ' + (y - 6) + ' l-1.7 1 M' + x + ' ' + (y - 6) + ' l1.7 1" stroke="#D8DEE7" stroke-width=".8"/>'];
    },
    /* 宝马双肾（侧视露前端） */
    kidney: function (car, sh, c) {
      var x = c.headX + 2, y = c.headY - 4;
      return ['<rect x="' + x + '" y="' + y + '" width="4.6" height="' + num(c.headH + 2) + '" rx="1" fill="#2B2B35" stroke="#B9C0CA" stroke-width=".6"/>' +
        '<rect x="' + num(x + 6) + '" y="' + (y + 1) + '" width="3.4" height="' + num(c.headH) + '" rx="1" fill="#2B2B35" stroke="#B9C0CA" stroke-width=".6"/>', ''];
    },
    kidneyBig: function (car, sh, c) {
      var x = c.headX - 1, y = c.headY - 8;
      return ['<rect x="' + x + '" y="' + y + '" width="6" height="' + num(c.headH + 12) + '" rx="1.6" fill="#25252F" stroke="#C9CFD8" stroke-width=".9"/>' +
        '<rect x="' + num(x + 8) + '" y="' + num(y + 2) + '" width="4" height="' + num(c.headH + 8) + '" rx="1.2" fill="#25252F" stroke="#C9CFD8" stroke-width=".9"/>', ''];
    },
    /* 宝马霍夫迈斯特弯角 */
    hof: function (car, sh, c) {
      var x = c.gx0 + 4, y = c.belt + 2;
      return ['<path d="M' + x + ' ' + y + ' q-5 6 1 12 l7 -2 q-3 -6 0 -10 Z" fill="' + c.deep + '" opacity=".75"/>', ''];
    },
    /* 300SL / SLR 鸥翼门：门缝一直开到车顶 */
    gullwing: function (car, sh, c) {
      var x0 = c.gx0 + 6, x1 = c.gx1 - 6, yTop = c.gy0 + 1, yBot = c.sill - 3;
      return ['<path d="M' + x0 + ' ' + yTop + ' L' + num(x1 - 18) + ' ' + yTop + ' L' + num(x1 + 4) + ' ' + yBot +
        ' L' + num(x0 + 4) + ' ' + yBot + ' Z" fill="none" stroke="' + c.deep + '" stroke-width="1.1" opacity=".55"/>' +
        '<path d="M' + x0 + ' ' + yTop + ' L' + num(x0 + 4) + ' ' + yBot + '" stroke="' + c.deep + '" stroke-width="1" opacity=".4"/>' +
        '<path d="M' + num(x0 + 12) + ' ' + num(yTop + 2) + ' L' + num(x1 - 8) + ' ' + num(yTop + 2) + '" stroke="#FFFFFF" stroke-width="1" opacity=".45"/>', ''];
    },
    /* 300SL 侧鳃 */
    gills: function (car, sh, c) {
      var x = c.fw - 66, y = c.belt + 2, s = '';
      for (var i = 0; i < 4; i++) {
        s += '<path d="M' + x + ' ' + num(y + i * 4) + ' l26 -1" stroke="' + c.deep + '" stroke-width="1.7" opacity=".6"/>';
      }
      return ['<rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="34" height="18" rx="3" fill="none" stroke="#C9CFD8" stroke-width=".9" opacity=".8"/>' + s, ''];
    },
    /* 507 侧面鳃 */
    sidegill: function (car, sh, c) {
      var x = c.fw - 78, y = c.belt + 3, s = '';
      for (var i = 0; i < 3; i++) s += '<path d="M' + x + ' ' + num(y + i * 5) + ' l20 -2" stroke="' + c.deep + '" stroke-width="1.6" opacity=".6"/>';
      return [s, ''];
    },
    /* 敞篷：风挡框 + 座椅头枕 */
    seat: function (car, sh, c) {
      var a = c.gx0 - 48, b = c.gx0 - 24;
      return ['', '<path d="M' + num(c.gx0 - 68) + ' ' + num(c.belt - 1) + ' L' + num(c.gx0 - 2) + ' ' + num(c.belt - 1) +
        '" stroke="' + c.deep + '" stroke-width="1.2" opacity=".5"/>' +
        '<rect x="' + a + '" y="' + num(c.belt - 12) + '" width="11" height="12" rx="4.5" fill="' + c.deep + '" opacity=".8"/>' +
        '<rect x="' + b + '" y="' + num(c.belt - 11) + '" width="10" height="11" rx="4.5" fill="' + c.deep + '" opacity=".8"/>'];
    },
    /* 五十年代镀铬腰线 */
    chrome50: function (car, sh, c) {
      return ['<path d="M14 ' + num(c.belt + 9) + ' Q160 ' + num(c.belt + 5) + ' 302 ' + num(c.belt + 13) +
        '" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".7"/>' +
        '<path d="M16 ' + num(c.belt + 13) + ' L300 ' + num(c.belt + 17) + '" stroke="#D9DEE6" stroke-width="1" opacity=".55"/>', ''];
    },
    /* 双色车顶 / 浮顶 */
    /* 复合路径 + evenodd：矩形减去侧窗，车顶和 A/B/C 柱一起换色，玻璃保持透明蓝 */
    twotone: function (car, sh, c) {
      return ['<path d="M0 0 L320 0 L320 ' + num(c.gy0 + 4) + ' L0 ' + num(c.gy0 + 4) + ' Z ' + c.glassD +
        '" fill-rule="evenodd" fill="' + (car.roof2 || '#F2F0EA') + '" opacity=".97"/>', ''];
    },
    /* 五十年代美式双色：腰线以上整片换色 */
    twotoneWide: function (car, sh, c) {
      return ['<path d="M0 0 L320 0 L320 ' + num(c.belt + 2) + ' L0 ' + num(c.belt + 2) + ' Z ' + c.glassD +
        '" fill-rule="evenodd" fill="' + (car.roof2 || '#F2F0EA') + '" opacity=".94"/>', ''];
    },
    carbonRoof: function (car, sh, c) {
      return ['<path d="M0 0 L320 0 L320 ' + num(c.gy0 + 6) + ' L0 ' + num(c.gy0 + 6) + ' Z ' + c.glassD +
        '" fill-rule="evenodd" fill="#2C3038" opacity=".94"/>', ''];
    },
    blackRoof: function () { return FEAT.carbonRoof.apply(null, arguments); },
    /* 尾鳍高光 */
    fins: function (car, sh, c) {
      return ['<path d="M10 80 Q22 70 48 74" stroke="#FFFFFF" stroke-width="2" opacity=".8" fill="none"/>' +
        '<path d="M12 102 L300 106" stroke="#E8EDF4" stroke-width="1.6" opacity=".55"/>', ''];
    },
    rocketTail: function (car, sh, c) {
      return ['', '<path d="M8 76 L22 74 L20 84 L8 84 Z" fill="#D8412F" stroke="#8A241A" stroke-width=".8"/>' +
        '<circle cx="12" cy="79" r="2.2" fill="#FFF3D6"/>'];
    },
    /* 甲壳虫后置引擎盖与踏板 */
    rearEngine: function (car, sh, c) {
      var s = '';
      for (var i = 0; i < 4; i++) s += '<path d="M22 ' + num(88 + i * 4) + ' l34 -1" stroke="' + c.deep + '" stroke-width="1" opacity=".35"/>';
      return [s, ''];
    },
    runningBoard: function (car, sh, c) {
      return ['<rect x="' + num(c.rw + 24) + '" y="' + (c.sill - 5) + '" width="' + num(c.fw - c.rw - 48) +
        '" height="4" rx="2" fill="#8A919C" opacity=".65"/>', ''];
    },
    fuchs: function (car, sh, c) {
      return ['', ''];
    },
    wireWheel: function (car, sh, c) { return ['', '']; },
    /* 溜背线 */
    fastback: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 - 2) + ' ' + num(c.gy0 + 2) + ' L20 ' + num(c.belt + 4) +
        '" stroke="' + c.deep + '" stroke-width="1" opacity=".35"/>', ''];
    },
    /* Mustang 侧凹 + 三竖条尾灯 */
    sidescoop: function (car, sh, c) {
      var x = c.rw + 42;
      return ['<path d="M' + x + ' ' + num(c.belt + 13) + ' q13 -4 26 0 l-2 7 q-12 3 -24 0 Z" fill="none" stroke="' + c.deep + '" stroke-width="1.4" opacity=".65"/>', ''];
    },
    triBar: function (car, sh, c) {
      return ['<path d="M12 ' + num(c.tailY - 2) + ' l11 0 M12 ' + num(c.tailY + 2) + ' l11 0" stroke="#FFF1E4" stroke-width="1.2" opacity=".85"/>', ''];
    },
    stripe: function (car, sh, c) {
      return ['<path d="M18 ' + num(c.sill - 9) + ' L300 ' + num(c.sill - 9) + '" stroke="#FFFFFF" stroke-width="2.4" opacity=".65"/>', ''];
    },
    /* Mini 小格栅、高尔夫红边、黑色保险杠、两厢尾门 */
    minigrille: function (car, sh, c) {
      return ['<rect x="' + num(c.headX - 4) + '" y="' + num(c.headY + 4) + '" width="11" height="7" rx="2" fill="#33333F" stroke="#C9CFD8" stroke-width=".8"/>', ''];
    },
    redGrille: function (car, sh, c) {
      return ['<path d="M282 ' + num(c.headY + 3) + ' l22 0" stroke="#D8392E" stroke-width="2.4"/>', ''];
    },
    blackBumper: function (car, sh, c) {
      return ['<rect x="4" y="' + (c.sill - 11) + '" width="22" height="9" rx="2" fill="#2B2B33" opacity=".8"/>' +
        '<rect x="292" y="' + (c.sill - 11) + '" width="24" height="9" rx="2" fill="#2B2B33" opacity=".8"/>', ''];
    },
    hatch: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 - 5) + ' ' + num(c.gy0) + ' L' + num(c.gx0 - 8) + ' ' + (c.sill - 3) +
        '" stroke="' + c.deep + '" stroke-width="1" opacity=".4"/>', ''];
    },
    cPillar: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 - 3) + ' ' + num(c.gy0 + 2) + ' L' + num(c.gx0 + 8) + ' ' + num(c.belt + 2) +
        ' L' + num(c.gx0 + 2) + ' ' + num(c.belt + 2) + ' Z" fill="' + c.deep + '" opacity=".4"/>', ''];
    },
    /* G 级：后挂备胎、行李架、外露铰链 */
    spare: function (car, sh, c) {
      var cy = c.tailY + 4;
      return ['', '<circle cx="9" cy="' + cy + '" r="14" fill="#232329" stroke="#4A4A55" stroke-width="1.2"/>' +
        '<circle cx="9" cy="' + cy + '" r="8.6" fill="' + car.color + '" stroke="#C9CFD8" stroke-width="1"/>' +
        '<circle cx="9" cy="' + cy + '" r="2.6" fill="#C9CFD8"/>' +
        '<path d="M4 ' + num(cy - 10) + ' a11 11 0 0 1 10 -1" fill="none" stroke="#6A6A76" stroke-width="1.4"/>'];
    },
    roofrack: function (car, sh, c) {
      var y = c.roofY - 4;
      return ['', '<path d="M' + num(c.gx0 - 2) + ' ' + y + ' L' + num(c.gx1 + 2) + ' ' + y +
        '" stroke="#4A4A58" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M' + num(c.gx0 + 6) + ' ' + y + ' l0 5 M' + num(c.gx1 - 6) + ' ' + y + ' l0 5" stroke="#4A4A58" stroke-width="1.8"/>'];
    },
    hinges: function (car, sh, c) {
      var y = c.belt + 8;
      return ['<rect x="' + num(c.gx0 + 10) + '" y="' + y + '" width="4" height="5" rx="1" fill="#D6DBE2" stroke="#7C8391" stroke-width=".6"/>' +
        '<rect x="' + num(c.gx0 + 10) + '" y="' + num(y + 16) + '" width="4" height="5" rx="1" fill="#D6DBE2" stroke="#7C8391" stroke-width=".6"/>', ''];
    },
    /* Countach 剪刀门 + 大尾翼 */
    scissor: function (car, sh, c) {
      var x = c.gx1 - 10;
      return ['<path d="M' + num(x - 22) + ' ' + num(c.gy0 + 2) + ' L' + x + ' ' + (c.sill - 3) +
        '" stroke="' + c.deep + '" stroke-width="1.2" opacity=".6"/>', ''];
    },
    bigWing: function (car, sh, c) {
      var deck = c.deckY, y = deck - 20;
      return ['', '<path d="M20 ' + (y + 4) + ' L20 ' + (deck + 2) + ' M52 ' + (y + 2) + ' L52 ' + (deck + 2) +
        '" stroke="' + c.deep + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M6 ' + y + ' L62 ' + (y - 3) + ' L66 ' + (y + 2) + ' L8 ' + (y + 5) + ' Z" fill="' + c.deep + '"/>'];
    },
    smallWing: function (car, sh, c) {
      var deck = c.deckY, y = deck - 11;
      return ['', '<path d="M22 ' + (y + 3) + ' L22 ' + (deck + 2) + ' M46 ' + (y + 2) + ' L46 ' + (deck + 2) +
        '" stroke="' + c.deep + '" stroke-width="2.4"/>' +
        '<path d="M10 ' + y + ' L54 ' + (y - 2) + ' L56 ' + (y + 2) + ' L12 ' + (y + 4) + ' Z" fill="' + c.deep + '"/>'];
    },
    wing: function () { return FEAT.smallWing.apply(null, arguments); },
    ducktail: function (car, sh, c) {
      var d = c.deckY;
      return ['<path d="M10 ' + (d - 1) + ' L34 ' + (d - 7) + ' L36 ' + (d + 2) + ' Z" fill="' + c.deep + '" opacity=".8"/>', ''];
    },
    /* 中置引擎侧进气 / 后舱百叶 */
    sideIntake: function (car, sh, c) {
      var x = c.rw + 26;
      return ['<path d="M' + x + ' ' + num(c.belt + 9) + ' L' + num(x + 26) + ' ' + num(c.belt + 11) +
        ' L' + num(x + 22) + ' ' + num(c.belt + 26) + ' L' + num(x - 1) + ' ' + num(c.belt + 22) +
        ' Z" fill="none" stroke="' + c.deep + '" stroke-width="1.6" opacity=".7"/>' +
        '<path d="M' + num(x + 4) + ' ' + num(c.belt + 14) + ' l16 1 M' + num(x + 3) + ' ' + num(c.belt + 19) + ' l16 1" stroke="' + c.deep + '" stroke-width="1.2" opacity=".5"/>', ''];
    },
    midEngine: function (car, sh, c) {
      var s = '', x = c.gx0 - 6;
      for (var i = 0; i < 5; i++) {
        s += '<path d="M' + num(x + i * 5) + ' ' + num(c.gy0 + 8) + ' l-6 ' + num(c.gy1 - c.gy0 - 6) +
          '" stroke="' + c.deep + '" stroke-width="1.4" opacity=".5"/>';
      }
      return [s, ''];
    },
    /* Testarossa 奶酪刨侧腮 */
    strakes: function (car, sh, c) {
      var x = 22, y = c.belt + 3, s = '';
      s += '<rect x="' + (x - 2) + '" y="' + (y - 2) + '" width="' + num(c.rw + 2) + '" height="27" rx="3" fill="#1F1F28" opacity=".26"/>';
      for (var i = 0; i < 6; i++) {
        s += '<path d="M' + x + ' ' + num(y + i * 4) + ' l' + num(c.rw - 6) + ' 0" stroke="#20202A" stroke-width="2.2" opacity=".8"/>';
      }
      return [s, ''];
    },
    /* 跳灯 */
    pop: function (car, sh, c) {
      var x = c.headX - 6, y = c.hoodY - 1;
      return ['<path d="M' + x + ' ' + (y + 5) + ' L' + num(x + 2) + ' ' + y + ' L' + num(x + 17) + ' ' + (y + 1) +
        ' L' + num(x + 15) + ' ' + (y + 6) + ' Z" fill="#EFF5FA" stroke="' + c.deep + '" stroke-width=".8"/>', ''];
    },
    /* 圆形尾灯 / 机盖进气 */
    roundTail: function (car, sh, c) {
      return ['<circle cx="' + (c.tailX + 2) + '" cy="' + c.tailY + '" r="3.4" fill="#E24834" stroke="#8A241A" stroke-width=".8"/>', ''];
    },
    scoop: function (car, sh, c) {
      return ['<path d="M' + num(c.fw + 8) + ' ' + num(c.hoodY + 3) + ' q14 -6 26 0 l-2 5 q-12 -3 -24 0 Z" fill="' + c.deep + '" opacity=".55"/>', ''];
    },
    powerdome: function (car, sh, c) {
      return ['<path d="M' + num(c.fw - 4) + ' ' + num(c.hoodY + 4) + ' Q' + num(c.fw + 30) + ' ' + num(c.hoodY - 4) + ' 300 ' + num(c.hoodY + 5) +
        '" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".45"/>', ''];
    },
    longHood: function (car, sh, c) {
      return ['<path d="M' + num(c.gx1 + 6) + ' ' + num(c.hoodY + 2) + ' L302 ' + num(c.hoodY + 6) +
        '" stroke="#FFFFFF" stroke-width="1.4" opacity=".5"/>', ''];
    },
    fourLight: function (car, sh, c) {
      return ['<circle cx="' + num(c.headX - 5) + '" cy="' + num(c.headY - 1) + '" r="2.4" fill="#F0F6FB" stroke="#8D95A2" stroke-width=".6"/>' +
        '<circle cx="' + num(c.headX - 5) + '" cy="' + num(c.headY + 5) + '" r="2.4" fill="#F0F6FB" stroke="#8D95A2" stroke-width=".6"/>', ''];
    },
    /* SLR 侧出排气 + 银色通风口 */
    vents: function (car, sh, c) {
      var x = c.fw - 52, y = c.belt + 6;
      return ['<rect x="' + x + '" y="' + y + '" width="26" height="8" rx="2" fill="#C9CFD8" stroke="#7C8391" stroke-width=".7"/>' +
        '<path d="M' + (x + 4) + ' ' + (y + 2) + ' v4 M' + (x + 10) + ' ' + (y + 2) + ' v4 M' + (x + 16) + ' ' + (y + 2) + ' v4" stroke="#565D69" stroke-width="1.2"/>', ''];
    },
    sidepipe: function (car, sh, c) {
      return ['<path d="M' + num(c.rw + 30) + ' ' + (c.sill - 7) + ' L' + num(c.fw - 24) + ' ' + (c.sill - 7) +
        '" stroke="#B9C0CA" stroke-width="2.2" opacity=".8"/>', ''];
    },
    /* Veyron C 形双色侧弧 */
    ccurve: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 - 12) + ' ' + num(c.sill - 2) + ' C' + num(c.gx0 - 6) + ' ' + num(c.roofY - 2) + ' ' +
        num(c.gx1 - 24) + ' ' + num(c.roofY - 2) + ' ' + num(c.gx1 + 14) + ' ' + num(c.belt + 14) +
        '" fill="none" stroke="' + (car.roof2 || '#C8CDD6') + '" stroke-width="13" opacity=".9" stroke-linecap="round"/>', ''];
    },
    /* R8 侧刃 */
    sideblade: function (car, sh, c) {
      var x = c.gx0 + 3;
      return ['<path d="M' + x + ' ' + num(c.gy0 - 2) + ' L' + num(x + 13) + ' ' + num(c.gy0 + 1) + ' L' + num(x + 17) + ' ' +
        (c.sill - 10) + ' L' + num(x + 3) + ' ' + (c.sill - 10) + ' Z" fill="' + (car.accent || '#3C414C') + '" opacity=".88"/>', ''];
    },
    /* i8 浮空 C 柱 + 蓝色饰条 */
    floatingC: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 - 2) + ' ' + num(c.gy0 - 2) + ' L' + num(c.gx0 + 9) + ' ' + num(c.gy0 + 1) + ' L' +
        num(c.gx0 + 5) + ' ' + num(c.belt + 12) + ' Z" fill="#232833" opacity=".9"/>' +
        '<path d="M' + num(c.gx0 + 6) + ' ' + num(c.belt + 16) + ' L' + num(c.gx1 - 8) + ' ' + num(c.belt + 16) +
        '" stroke="' + (car.accent || '#2E9BD6') + '" stroke-width="2.2" opacity=".8"/>', ''];
    },
    blueAccent: function (car, sh, c) {
      return ['<path d="M20 ' + num(c.sill - 12) + ' L298 ' + num(c.sill - 9) + '" stroke="' +
        (car.accent || '#2E9BD6') + '" stroke-width="2.2" opacity=".75"/>', ''];
    },
    /* 宽体轮拱 / 黑轮眉 */
    flares: function (car, sh, c) {
      var o = '';
      c.wheels.forEach(function (p) {
        var R = p[2] + 8;
        o += '<path d="M' + num(p[0] - R) + ' ' + c.sill + ' A' + R + ' ' + R + ' 0 0 1 ' + num(p[0] + R) + ' ' + c.sill +
          '" fill="none" stroke="' + c.deep + '" stroke-width="5" opacity=".85"/>';
      });
      return ['', o];
    },
    blackClad: function (car, sh, c) {
      var o = '';
      c.wheels.forEach(function (p) {
        var R = p[2] + 8;
        o += '<path d="M' + num(p[0] - R) + ' ' + c.sill + ' A' + R + ' ' + R + ' 0 0 1 ' + num(p[0] + R) + ' ' + c.sill +
          '" fill="none" stroke="#3C414A" stroke-width="6" opacity=".78"/>';
      });
      return ['', o];
    },
    /* 电动车：贯穿尾灯、激光雷达、镀铬窗框、分体大灯、AMG 竖条格栅 */
    ledbar: function (car, sh, c) {
      return ['<rect x="7" y="' + num(c.tailY - 1) + '" width="20" height="3.4" rx="1.6" fill="#E5453A"/>' +
        '<rect x="7" y="' + num(c.tailY + 3) + '" width="14" height="1.4" rx=".7" fill="#FF9A8C" opacity=".8"/>', ''];
    },
    lidar: function (car, sh, c) {
      var x = c.gx1 - 26;
      return ['', '<rect x="' + x + '" y="' + num(c.roofY - 5) + '" width="20" height="7" rx="3" fill="#333A44" stroke="#9BA4B0" stroke-width=".8"/>' +
        '<circle cx="' + num(x + 10) + '" cy="' + num(c.roofY - 1.5) + '" r="1.8" fill="#7FD2E8"/>'];
    },
    chromeFrame: function (car, sh, c) {
      return ['<path d="' + c.glassD + '" fill="none" stroke="#E6EBF1" stroke-width="1.6" opacity=".7"/>', ''];
    },
    splitLight: function (car, sh, c) {
      return ['<rect x="284" y="' + num(c.headY - 9) + '" width="24" height="3" rx="1.5" fill="#EAF3FA" opacity=".9"/>', ''];
    },
    panamericana: function (car, sh, c) {
      var s = '', x = c.headX - 3, y = c.headY - 3;
      s += '<rect x="' + x + '" y="' + y + '" width="14" height="' + num(c.headH + 8) + '" rx="2" fill="#2B2B35"/>';
      for (var i = 0; i < 7; i++) s += '<path d="M' + num(x + 2 + i * 1.8) + ' ' + num(y + 2) + ' v' + num(c.headH + 4) + '" stroke="#C9CFD8" stroke-width=".8"/>';
      return [s, ''];
    },
    amgGrille: function () { return FEAT.panamericana.apply(null, arguments); },
    stainless: function (car, sh, c) {
      return ['<path d="M22 ' + num(c.belt + 2) + ' L148 ' + num(c.roofY + 4) + ' L196 ' + num(c.roofY + 4) +
        ' L252 ' + num(c.belt + 2) + '" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".6"/>', ''];
    },
    /* 帕加达凹顶的浅色高光、硬顶折线、侧面通风口、无格栅、LED */
    pagoda: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 + 12) + ' ' + num(c.roofY + 3) + ' Q' + num((c.gx0 + c.gx1) / 2) + ' ' +
        num(c.roofY + 13) + ' ' + num(c.gx1 - 12) + ' ' + num(c.roofY + 3) + '" fill="none" stroke="#FFFFFF" stroke-width="1.4" opacity=".55"/>', ''];
    },
    hardtop: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 + 4) + ' ' + num(c.belt - 1) + ' L' + num(c.gx1 - 4) + ' ' + num(c.belt - 1) +
        '" stroke="' + c.deep + '" stroke-width="1" opacity=".5"/>', ''];
    },
    vent: function (car, sh, c) {
      return ['<path d="M' + num(c.rw + 16) + ' ' + num(c.belt + 10) + ' l24 -2 M' + num(c.rw + 16) + ' ' + num(c.belt + 15) +
        ' l24 -2" stroke="' + c.deep + '" stroke-width="1.4" opacity=".5"/>', ''];
    },
    nogrille: function () { return ['', '']; },
    led: function (car, sh, c) {
      return ['<path d="M284 ' + num(c.headY + 2) + ' l22 0" stroke="#F2F8FD" stroke-width="1.6" opacity=".85"/>', ''];
    },
    /* 长轴距 / 全景顶 / 隐藏把手：细节在 svg() 里配合处理 */
    longWheel: function () { return ['', '']; },
    pano: function (car, sh, c) {
      return ['<path d="M' + num(c.gx0 - 3) + ' ' + num(c.gy0 - 1) + ' L' + num(c.gx1 + 2) + ' ' + num(c.gy0 - 1) +
        ' L' + num(c.gx1 + 2) + ' ' + num(c.gy0 + 4) + ' L' + num(c.gx0 - 3) + ' ' + num(c.gy0 + 4) + ' Z" fill="#243B4E" opacity=".45"/>', ''];
    },
    hiddenHandle: function () { return ['', '']; },
    roundlight2: function () { return ['', '']; },
    squarelight2: function () { return ['', '']; }
  };

  /* ---------------- 生成一辆车的完整 SVG ---------------- */
  function svg(car) {
    /* 手绘矢量图（cars-art.js，目前 42 辆全覆盖）优先；以后新增的车若没画，继续走下面的参数化造型 */
    var art = w.CarArt && w.CarArt[car.id];
    if (art) {
      return '<svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
        esc(car.brand + ' ' + car.model + ' ' + car.year) + '">' +
        art.replace(/__C__/g, car.color)
          .replace(/__D__/g, mix(car.color, '#1D1D2B', 0.42))
          .replace(/__L__/g, mix(car.color, '#FFFFFF', 0.46))
          .replace(/__R__/g, car.roof2 || car.color) + '</svg>';
    }
    var sh = SHAPES[car.shape] || SHAPES.sedan;
    var uid = String(car.id || 'car').replace(/[^a-zA-Z0-9_]/g, '');
    var light = mix(car.color, '#FFFFFF', 0.46);
    var dark = mix(car.color, '#1D1D2B', 0.6);
    var deep = mix(car.color, '#12121C', 0.74);
    var bodyD = rpath(sh.body, sh.rad) + archHoles(sh);
    var glassD = rpath(sh.glass, sh.grad);
    var ids = {
      body: 'cbg_' + uid, glass: 'cgg_' + uid, head: 'chg_' + uid, tail: 'ctg_' + uid,
      shadow: 'csg_' + uid, clip: 'cbc_' + uid, gclip: 'cgc_' + uid
    };

    var gx0 = 999, gy0 = 999, gx1 = -999, gy1 = -999;
    sh.glass.forEach(function (p) {
      gx0 = Math.min(gx0, p[0]); gx1 = Math.max(gx1, p[0]);
      gy0 = Math.min(gy0, p[1]); gy1 = Math.max(gy1, p[1]);
    });
    var roofY = Math.min.apply(null, sh.body.map(function (p) { return p[1]; }));
    var hoodY = Math.min.apply(null, sh.body.filter(function (p) { return p[0] > 230; }).map(function (p) { return p[1]; }));
    if (!isFinite(hoodY)) hoodY = sh.belt;
    var deckY = sh.body[2] ? sh.body[2][1] : sh.belt + 8;
    var c = {
      deep: deep, dark: dark, light: light, deckY: deckY,
      gx0: gx0, gy0: gy0, gx1: gx1, gy1: gy1, roofY: roofY, hoodY: hoodY,
      belt: sh.belt, sill: sh.sill, wheels: sh.wheels,
      rw: sh.wheels[0][0], fw: sh.wheels[1][0],
      headX: sh.head.x, headY: sh.head.y, headH: sh.head.h,
      tailX: sh.tail.x, tailY: sh.tail.y, glassD: glassD
    };

    /* 签名特征 */
    /* 车身色块必须画在玻璃之前，门缝/线条/灯具画在玻璃之后 */
    var PAINT = { ccurve: 1, sideblade: 1, floatingC: 1 };
    var sig = car.sig || [], paint = '', inside = '', outside = '';
    function has(k) { return sig.indexOf(k) >= 0; }
    sig.forEach(function (k) {
      var f = FEAT[k];
      if (!f) return;
      var out = f(car, sh, c);
      if (PAINT[k]) paint += out[0] || '';
      else inside += out[0] || '';
      outside += out[1] || '';
    });

    /* 车轮、轮拱 */
    var wheels = '', wells = '';
    var wheelStyle = has('fuchs') ? 'fuchs' : has('wireWheel') ? 'wire' : '';
    sh.wheels.forEach(function (p) {
      var cx = p[0], cy = p[1], r = p[2], R = r + 3.6;
      wells += '<path d="M' + num(cx - R) + ' ' + num(sh.sill) + ' A' + num(R) + ' ' + num(R) + ' 0 0 1 ' +
        num(cx + R) + ' ' + num(sh.sill) + ' Z" fill="#1A1A22"/>';
      wells += '<path d="M' + num(cx - R + 1) + ' ' + num(sh.sill - 1) + ' A' + num(R - 1) + ' ' + num(R - 1) +
        ' 0 0 1 ' + num(cx + R - 1) + ' ' + num(sh.sill - 1) + '" fill="none" stroke="#3A3A46" stroke-width="1.4" opacity=".55"/>';
      wheels += wheel(cx, cy, r, !!car.ww && car.year < 1965, wheelStyle);
    });

    /* 腰线、门缝、把手、B 柱 */
    var g0 = sh.glass[0], g1 = sh.glass[sh.glass.length - 1];
    var beltY = sh.belt, detail = '';
    if (!has('gullwing') && !has('scissor')) {
      detail += '<path d="M' + num(g0[0] - 9) + ' ' + num(g0[1] - 2) + ' Q' + num((g0[0] + g1[0]) / 2) + ' ' +
        num(beltY + 1) + ' ' + num(g1[0] + 10) + ' ' + num(g1[1] - 2) + '" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity=".5"/>';
      var span = g1[0] - g0[0];
      var cuts = sh.doors === 4 ? [0.24, 0.87] : [0.8];
      cuts.forEach(function (t) {
        var sx = g0[0] + span * t;
        detail += '<path d="M' + num(sx) + ' ' + num(beltY + 1) + ' L' + num(sx - 1.5) + ' ' + num(sh.sill - 2) +
          '" stroke="' + deep + '" stroke-width="1" opacity=".34"/>';
        if (has('hiddenHandle')) {
          detail += '<circle cx="' + num(sx - 7) + '" cy="' + num(beltY + 4.5) + '" r="1.5" fill="' + deep + '" opacity=".7"/>';
        } else {
          detail += '<rect x="' + num(sx - 10) + '" y="' + num(beltY + 3.5) + '" width="7" height="2.4" rx="1.2" fill="' +
            deep + '" opacity=".6"/>';
        }
      });
      if (sh.doors === 4) {
        var bx = g0[0] + span * 0.56;
        detail += '<rect x="' + num(bx - 2.3) + '" y="' + num(gy0 - 1.5) + '" width="3.8" height="' + num(gy1 - gy0 + 5) +
          '" rx="1" fill="' + mix(car.color, '#15151F', 0.62) + '" stroke="' + deep + '" stroke-width=".6"/>';
      }
    }

    var mx = sh.mirror[0], my = sh.mirror[1];
    var mirror = '<path d="M' + num(mx + 6) + ' ' + num(my + 4) + ' L' + num(mx + 1) + ' ' + num(my) + '" stroke="' + deep + '" stroke-width="1.3"/>' +
      '<path d="M' + num(mx - 4) + ' ' + num(my - 1.6) + ' q-6 -.6 -7 2.2 q-.6 2 1.4 2.4 l5 .8 q2.4 .2 2.6 -2.2 q.2 -2.6 -2 -3.2 Z" fill="' +
      mix(car.color, '#FFFFFF', 0.12) + '" stroke="' + deep + '" stroke-width=".7"/>';

    return '<svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      esc(car.brand + ' ' + car.model + ' ' + car.year) + '">' +
      '<defs>' +
      '<linearGradient id="' + ids.body + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + light + '"/>' +
      '<stop offset=".18" stop-color="' + mix(car.color, '#FFFFFF', 0.3) + '"/>' +
      '<stop offset=".52" stop-color="' + car.color + '"/>' +
      '<stop offset=".88" stop-color="' + mix(car.color, '#3A3A50', 0.18) + '"/>' +
      '<stop offset="1" stop-color="' + mix(car.color, '#2A2A3C', 0.3) + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.glass + '" x1="0" y1="0" x2=".35" y2="1">' +
      '<stop offset="0" stop-color="#DCEFFA"/>' +
      '<stop offset=".45" stop-color="#9FC5DD"/>' +
      '<stop offset="1" stop-color="#4C6C86"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.head + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#EAF3FA"/><stop offset="1" stop-color="#B9CBD9"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + ids.tail + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#FF8E7C"/><stop offset=".5" stop-color="#E0402F"/><stop offset="1" stop-color="#A62418"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + ids.shadow + '" cx=".5" cy=".5" r=".5">' +
      '<stop offset="0" stop-color="#2B2B3C" stop-opacity=".26"/><stop offset="1" stop-color="#2B2B3C" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<clipPath id="' + ids.clip + '"><path d="' + bodyD + '" clip-rule="evenodd"/></clipPath>' +
      '<clipPath id="' + ids.gclip + '"><path d="' + glassD + '"/></clipPath>' +
      '</defs>' +

      '<ellipse cx="160" cy="' + num(GROUND + 3) + '" rx="146" ry="8" fill="url(#' + ids.shadow + ')"/>' +
      '<ellipse cx="158" cy="' + num(GROUND - 1) + '" rx="118" ry="3.4" fill="#2B2B3C" opacity=".1"/>' +

      '<path d="' + bodyD + '" fill="url(#' + ids.body + ')" fill-rule="evenodd" stroke="' + deep +
      '" stroke-width="1.1" stroke-linejoin="round" stroke-opacity=".9"/>' +
      '<g clip-path="url(#' + ids.clip + ')">' +
      '<rect x="0" y="' + num(beltY + 2) + '" width="320" height="30" fill="#1B1B2A" opacity=".06"/>' +
      '<rect x="0" y="' + num(sh.sill - 13) + '" width="320" height="16" fill="#1B1B2A" opacity=".1"/>' +
      '<path d="M0 ' + num(beltY - 4) + ' L320 ' + num(beltY - 7) + ' L320 ' + num(beltY - 1) + ' L0 ' + num(beltY + 2) +
      ' Z" fill="#FFFFFF" opacity=".12"/>' +
      '</g>' +

      wells +

      /* 车身色块（双色车顶、C 形侧弧、侧刃…）在玻璃之下 */
      '<g clip-path="url(#' + ids.clip + ')">' + paint + '</g>' +

      '<path d="' + glassD + '" fill="url(#' + ids.glass + ')" stroke="' + deep + '" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<g clip-path="url(#' + ids.gclip + ')">' +
      '<rect x="' + num(gx0 - 4) + '" y="' + num(gy0 - 4) + '" width="' + num(gx1 - gx0 + 8) + '" height="' +
      num((gy1 - gy0) * 0.3) + '" fill="#0E2A44" opacity=".22"/>' +
      '<path d="M' + num(gx0 - 10) + ' ' + num(gy1 + 12) + ' L' + num(gx0 + 34) + ' ' + num(gy0 - 8) + ' L' +
      num(gx0 + 52) + ' ' + num(gy0 - 8) + ' L' + num(gx0 + 12) + ' ' + num(gy1 + 12) + ' Z" fill="#FFFFFF" opacity=".2"/>' +
      '<path d="M' + num(gx1 - 26) + ' ' + num(gy1 + 12) + ' L' + num(gx1 - 2) + ' ' + num(gy0 + 2) + ' L' +
      num(gx1 + 6) + ' ' + num(gy0 + 2) + ' L' + num(gx1 - 6) + ' ' + num(gy1 + 12) + ' Z" fill="#FFFFFF" opacity=".14"/>' +
      '</g>' +

      '<g clip-path="url(#' + ids.clip + ')">' +
      detail +
      headLamp(sh.head, ids.head, deep) +
      tailLamp(sh.tail, ids.tail, deep) +
      (sh.grille ? grille(sh, car) : '') +
      inside +
      '</g>' +

      /* 车身外的特征（备胎、尾翼、雷达、立标、行李架…） */
      fillTpl(outside + sh.extra, car, deep) +

      mirror +
      wheels +
      '</svg>';
  }

  function byEra(id) { return CARS.filter(function (x) { return x.era === id; }); }
  function owned(decor) {
    var ids = decor || [];
    return CARS.filter(function (x) { return ids.indexOf(x.id) >= 0; });
  }
  function firstYear() { return Math.min.apply(null, CARS.map(function (x) { return x.year; })); }
  function lastYear() { return Math.max.apply(null, CARS.map(function (x) { return x.year; })); }

  w.Cars = {
    eras: function () { return ERAS.slice(); },
    all: function () { return CARS.slice(); },
    shapes: SHAPES, svg: svg, byEra: byEra,
    owned: owned, firstYear: firstYear, lastYear: lastYear
  };
})(window);
