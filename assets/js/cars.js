/* 汽车模型库：1950 年代到今天的经典车型，小屋展柜与装饰商店共用。
   每辆车用参数化 SVG 手绘侧面造型（不依赖网络图片，离线可用、打印也清晰）。
   __G__ = 车身渐变，__C__ = 车色，__D__ = 车色加深后的描边 / 细节。 */
(function (w) {
  'use strict';

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

  /* 车头一律朝右；车轮中心 y=60，车身底边压在轮子上半部 */
  var SHAPES = {
    round: {
      r: 10, wheels: [[44, 60], [118, 60]],
      body: '<path d="M16 56 Q16 44 32 40 Q42 20 78 18 Q112 20 122 40 Q142 44 144 56 Q144 60 138 60 L22 60 Q16 60 16 56 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M52 38 Q58 24 78 24 Q98 24 104 38 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<circle cx="139" cy="49" r="3.4" fill="#FFF3B0" stroke="__D__" stroke-width=".8"/><path d="M16 54 L9 54" stroke="#E6EBF2" stroke-width="2.2"/><path d="M78 39 L78 58" stroke="__D__" stroke-width="1" opacity=".7"/>'
    },
    fins: {
      r: 10, wheels: [[42, 60], [122, 60]],
      body: '<path d="M14 56 L20 44 L50 42 L64 30 L106 30 L120 42 L140 44 L148 54 L148 60 L14 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M66 32 L104 32 L116 42 L56 42 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M20 44 L9 21 L34 41 Z" fill="__C__" stroke="__D__" stroke-width="1.2"/><path d="M22 51 L146 51" stroke="#FFFFFF" stroke-width="2" opacity=".85"/><circle cx="144" cy="49" r="3.2" fill="#FFF3B0" stroke="__D__" stroke-width=".8"/><path d="M84 32 L84 42" stroke="__D__" stroke-width="1"/>'
    },
    box: {
      r: 10, wheels: [[42, 60], [120, 60]],
      body: '<path d="M20 56 L20 38 Q20 34 26 34 L50 34 L58 22 L102 22 L110 34 L138 34 Q142 34 142 40 L142 56 Q142 60 138 60 L24 60 Q20 60 20 56 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M60 24 L100 24 L108 34 L54 34 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M58 21 L102 21" stroke="#FFFFFF" stroke-width="2.4"/><path d="M80 24 L80 34" stroke="__D__" stroke-width="1.1"/><circle cx="138" cy="44" r="3.4" fill="#FFF3B0" stroke="__D__" stroke-width=".8"/><path d="M20 50 L142 50" stroke="#FFFFFF" stroke-width="1.4" opacity=".6"/>'
    },
    muscle: {
      r: 10, wheels: [[40, 60], [126, 60]],
      body: '<path d="M10 55 Q10 47 22 45 L60 41 L76 27 L110 27 L126 43 L144 46 Q150 48 150 55 L150 60 L10 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M80 29 L108 29 L122 42 L70 42 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M24 44 L52 41" stroke="__D__" stroke-width="2"/><circle cx="146" cy="49" r="2.6" fill="#FFF3B0"/><circle cx="146" cy="55" r="2.6" fill="#FFF3B0"/><rect x="11" y="50" width="4" height="3" rx="1" fill="#E86A6A"/>'
    },
    wedge: {
      r: 10, wheels: [[42, 60], [124, 60]],
      body: '<path d="M8 54 L38 49 L64 31 L110 29 L140 47 L152 51 L152 60 L8 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M70 33 L104 32 L122 44 L58 44 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M10 38 L36 36 L36 33 L10 33 Z" fill="__D__"/><path d="M20 38 L20 46 M30 37 L30 45" stroke="__D__" stroke-width="2"/><path d="M96 47 L120 47 L112 52 L96 52 Z" fill="__D__" opacity=".5"/><rect x="140" y="47" width="7" height="3" rx="1" fill="#FFF3B0"/>'
    },
    hatch: {
      r: 10, wheels: [[42, 60], [122, 60]],
      body: '<path d="M14 55 L16 41 L52 39 L64 25 L108 25 L120 39 L140 42 L146 55 L146 60 L14 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M66 27 L106 27 L118 39 L56 39 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<rect x="140" y="46" width="5.5" height="4" rx="1" fill="#FFF3B0"/><path d="M18 50 L144 50" stroke="#FFFFFF" stroke-width="1.5" opacity=".6"/><path d="M86 27 L86 39" stroke="__D__" stroke-width="1"/>'
    },
    square80: {
      r: 10, wheels: [[40, 60], [124, 60]],
      body: '<path d="M12 56 L12 43 L50 41 L62 27 L108 27 L120 41 L146 43 L146 56 L146 60 L12 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M64 29 L106 29 L118 41 L54 41 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M146 41 L146 35 M143 35 L149 35" stroke="#C9CDD6" stroke-width="1.5"/><rect x="139" y="46" width="6.5" height="4" rx="1" fill="#FFF3B0"/><path d="M14 50 L144 50" stroke="#FFFFFF" stroke-width="1.4" opacity=".65"/><path d="M85 29 L85 41" stroke="__D__" stroke-width="1"/>'
    },
    round90: {
      r: 10, wheels: [[40, 60], [126, 60]],
      body: '<path d="M10 55 Q10 47 22 45 L58 41 Q68 27 92 27 Q114 27 126 43 L144 46 Q152 48 152 55 L152 60 L10 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M70 31 Q90 28 104 31 L120 43 L60 43 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M12 38 L32 37 L32 34 L12 34 Z" fill="__D__"/><rect x="140" y="47" width="7" height="3" rx="1" fill="#FFF3B0"/><path d="M92 32 L92 43" stroke="__D__" stroke-width="1"/>'
    },
    super00: {
      r: 10, wheels: [[40, 60], [124, 60]],
      body: '<path d="M8 55 Q8 49 20 47 L52 43 Q68 27 96 29 Q122 31 138 47 L150 50 Q154 52 154 56 L154 60 L8 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M72 32 Q92 29 108 34 L124 45 L58 45 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M100 48 L128 48 L118 54 L100 54 Z" fill="__D__" opacity=".5"/><path d="M142 48 L152 50" stroke="#FFF3B0" stroke-width="2.6"/><rect x="9" y="51" width="6" height="2.6" rx="1" fill="#E86A6A"/>'
    },
    sedan10: {
      r: 10, wheels: [[40, 60], [124, 60]],
      body: '<path d="M10 55 Q10 47 22 45 L54 41 Q68 25 96 25 Q120 27 136 43 L148 47 Q152 49 152 55 L152 60 L10 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M70 28 Q92 26 106 29 L128 43 L58 43 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M78 27 L104 28" stroke="#FFFFFF" stroke-width="2.2"/><path d="M140 48 L151 51" stroke="#FFF3B0" stroke-width="2.4"/><circle cx="112" cy="47" r="1.2" fill="#FFFFFF" opacity=".9"/>'
    },
    suv20: {
      r: 11, wheels: [[42, 60], [122, 60]],
      body: '<path d="M12 57 L12 35 Q12 31 18 31 L54 29 L64 17 L112 17 L120 29 L144 31 Q148 31 148 36 L148 57 L148 60 L12 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M66 19 L110 19 L118 29 L58 29 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M64 15 L112 15" stroke="#3A3A48" stroke-width="2"/><path d="M48 59 L114 59" stroke="#9AA0AE" stroke-width="2"/><rect x="141" y="37" width="6" height="4.5" rx="1" fill="#FFF3B0"/><circle cx="14" cy="44" r="6" fill="#3A3A48"/><circle cx="14" cy="44" r="2.4" fill="#9AA0AE"/>'
    },
    cyber20: {
      r: 11, wheels: [[44, 60], [120, 60]],
      body: '<path d="M8 58 L46 22 L96 22 L152 58 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M52 26 L92 26 L118 42 L34 42 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/><path d="M72 26 L74 42" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M46 22 L96 22" stroke="__D__" stroke-width="2"/><path d="M142 50 L150 56" stroke="#FFF3B0" stroke-width="2.6"/><path d="M30 58 Q44 45 58 58 M106 58 Q120 45 134 58" stroke="__D__" stroke-width="2" fill="none"/>'
    },
    coupe20: {
      r: 10, wheels: [[40, 60], [126, 60]],
      body: '<path d="M8 56 Q8 48 22 46 L54 42 Q66 27 96 27 Q122 29 138 45 L150 49 Q154 51 154 56 L154 60 L8 60 Z" fill="__G__" stroke="__D__" stroke-width="1.4" stroke-linejoin="round"/>',
      glass: '<path d="M70 30 Q92 28 108 31 L126 44 L58 44 Z" fill="#BFE0F2" stroke="__D__" stroke-width="1.2"/>',
      extra: '<path d="M87 27 L92 22 L97 27 Z" fill="__D__"/><path d="M9 51 L21 51" stroke="#E86A6A" stroke-width="2.6"/><path d="M142 50 L152 52" stroke="#FFF3B0" stroke-width="2.2"/>'
    }
  };

  /* id 用 car_ 前缀，和原来的 7 件装饰互不冲突，旧存档直接兼容 */
  var CARS = [
    { id: 'car_300sl', brand: '奔驰', model: '300SL 鸥翼', year: 1954, era: '1950s', shape: 'round', color: '#D8DEE9', mark: 'BENZ', cost: 30 },
    { id: 'car_beetle', brand: '大众', model: '甲壳虫', year: 1955, era: '1950s', shape: 'round', color: '#7FB3D5', mark: 'VW', cost: 45 },
    { id: 'car_belair', brand: '雪佛兰', model: 'Bel Air', year: 1957, era: '1950s', shape: 'fins', color: '#F2A6B8', mark: 'CHEVY', cost: 60 },
    { id: 'car_eldorado', brand: '凯迪拉克', model: 'Eldorado', year: 1959, era: '1950s', shape: 'fins', color: '#F5DE9B', mark: 'CAD', cost: 75 },

    { id: 'car_mini', brand: '迷你', model: 'Cooper', year: 1961, era: '1960s', shape: 'box', color: '#BFD9A8', mark: 'MINI', cost: 90 },
    { id: 'car_911', brand: '保时捷', model: '911', year: 1963, era: '1960s', shape: 'round', color: '#EFC063', mark: 'PORSCHE', cost: 110 },
    { id: 'car_mustang', brand: '福特', model: 'Mustang', year: 1965, era: '1960s', shape: 'muscle', color: '#E2655A', mark: 'FORD', cost: 130 },
    { id: 'car_2000gt', brand: '丰田', model: '2000GT', year: 1967, era: '1960s', shape: 'muscle', color: '#F0F1F4', mark: 'TOYOTA', cost: 150 },

    { id: 'car_civic', brand: '本田', model: 'Civic', year: 1972, era: '1970s', shape: 'hatch', color: '#EFC46B', mark: 'HONDA', cost: 170 },
    { id: 'car_golf', brand: '大众', model: 'Golf GTI', year: 1974, era: '1970s', shape: 'hatch', color: '#D9564F', mark: 'VW', cost: 190 },
    { id: 'car_countach', brand: '兰博基尼', model: 'Countach', year: 1974, era: '1970s', shape: 'wedge', color: '#F2CE70', mark: 'LAMBO', cost: 210 },
    { id: 'car_bmw3', brand: '宝马', model: '3 系 E21', year: 1975, era: '1970s', shape: 'square80', color: '#86C4DE', mark: 'BMW', cost: 230 },

    { id: 'car_190e', brand: '奔驰', model: '190E', year: 1982, era: '1980s', shape: 'square80', color: '#CFD7E2', mark: 'BENZ', cost: 250 },
    { id: 'car_ae86', brand: '丰田', model: 'AE86', year: 1983, era: '1980s', shape: 'hatch', color: '#F4F5F7', mark: 'TOYOTA', cost: 270 },
    { id: 'car_testarossa', brand: '法拉利', model: 'Testarossa', year: 1984, era: '1980s', shape: 'wedge', color: '#DF5550', mark: 'FERRARI', cost: 290 },

    { id: 'car_nsx', brand: '本田', model: 'NSX', year: 1990, era: '1990s', shape: 'round90', color: '#E46A5C', mark: 'HONDA', cost: 310 },
    { id: 'car_rx7', brand: '马自达', model: 'RX-7', year: 1992, era: '1990s', shape: 'round90', color: '#D75B58', mark: 'MAZDA', cost: 330 },
    { id: 'car_supra', brand: '丰田', model: 'Supra', year: 1993, era: '1990s', shape: 'round90', color: '#DFA43A', mark: 'TOYOTA', cost: 350 },

    { id: 'car_veyron', brand: '布加迪', model: 'Veyron', year: 2005, era: '2000s', shape: 'super00', color: '#5B6079', mark: 'BUGATTI', cost: 380 },
    { id: 'car_r8', brand: '奥迪', model: 'R8', year: 2006, era: '2000s', shape: 'super00', color: '#C6CBD6', mark: 'AUDI', cost: 410 },
    { id: 'car_roadster', brand: '特斯拉', model: 'Roadster', year: 2008, era: '2000s', shape: 'super00', color: '#E0574F', mark: 'TESLA', cost: 440 },

    { id: 'car_models', brand: '特斯拉', model: 'Model S', year: 2012, era: '2010s', shape: 'sedan10', color: '#D3DCE8', mark: 'TESLA', cost: 480 },
    { id: 'car_gt86', brand: '丰田', model: '86', year: 2012, era: '2010s', shape: 'round90', color: '#EDA45A', mark: 'TOYOTA', cost: 520 },
    { id: 'car_taycan', brand: '保时捷', model: 'Taycan', year: 2019, era: '2010s', shape: 'sedan10', color: '#8DB7E4', mark: 'PORSCHE', cost: 560 },

    { id: 'car_et7', brand: '蔚来', model: 'ET7', year: 2022, era: '2020s', shape: 'sedan10', color: '#9BC4E2', mark: 'NIO', cost: 620 },
    { id: 'car_cybertruck', brand: '特斯拉', model: 'Cybertruck', year: 2023, era: '2020s', shape: 'cyber20', color: '#BEC6CC', mark: 'TESLA', cost: 680 },
    { id: 'car_u8', brand: '比亚迪', model: '仰望 U8', year: 2023, era: '2020s', shape: 'suv20', color: '#5E737D', mark: 'BYD', cost: 740 },
    { id: 'car_su7', brand: '小米', model: 'SU7', year: 2024, era: '2020s', shape: 'coupe20', color: '#5B96DF', mark: 'MI', cost: 800 }
  ];

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
  function fillTpl(str, car, gid, dark) {
    return String(str || '')
      .replace(/__G__/g, 'url(#' + gid + ')')
      .replace(/__C__/g, car.color)
      .replace(/__D__/g, dark);
  }

  /* 返回一段完整 SVG 字符串，可直接塞进 U.h(..., {html: ...}) */
  function svg(car) {
    var sh = SHAPES[car.shape] || SHAPES.sedan10;
    var gid = 'cargrad_' + String(car.id).replace(/[^a-zA-Z0-9_]/g, '');
    var light = mix(car.color, '#FFFFFF', 0.45);
    var dark = mix(car.color, '#22223A', 0.55);
    var r = sh.r || 10;
    var wheels = sh.wheels.map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="#3A3A48"/>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r - 4.2) + '" fill="#DDE3EC"/>' +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r - 7.6) + '" fill="#8B8B9E"/>';
    }).join('');
    var mark = esc(car.mark || '');
    return '<svg viewBox="0 0 160 80" preserveAspectRatio="xMidYMid meet" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(car.brand + ' ' + car.model) + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + light + '"/><stop offset="1" stop-color="' + car.color + '"/>' +
      '</linearGradient></defs>' +
      '<ellipse cx="80" cy="70" rx="70" ry="5" fill="rgba(43,43,60,.09)"/>' +
      fillTpl(sh.body, car, gid, dark) +
      fillTpl(sh.glass, car, gid, dark) +
      fillTpl(sh.extra, car, gid, dark) +
      wheels +
      '<rect x="64" y="48" width="30" height="9" rx="3" fill="rgba(255,255,255,.82)"/>' +
      '<text x="79" y="54.4" text-anchor="middle" font-size="' + (mark.length > 6 ? 5.4 : 6.6) +
      '" font-family="Arial,sans-serif" font-weight="700" fill="#55556A">' + mark + '</text>' +
      '</svg>';
  }

  function byEra(id) { return CARS.filter(function (c) { return c.era === id; }); }
  function owned(decor) {
    var ids = decor || [];
    return CARS.filter(function (c) { return ids.indexOf(c.id) >= 0; });
  }
  function firstYear() { return Math.min.apply(null, CARS.map(function (c) { return c.year; })); }
  function lastYear() { return Math.max.apply(null, CARS.map(function (c) { return c.year; })); }

  w.Cars = {
    /* all() / eras() 返回副本，和 Badges.all() 的调用习惯保持一致 */
    eras: function () { return ERAS.slice(); },
    all: function () { return CARS.slice(); },
    shapes: SHAPES, svg: svg, byEra: byEra,
    owned: owned, firstYear: firstYear, lastYear: lastYear
  };
})(window);
