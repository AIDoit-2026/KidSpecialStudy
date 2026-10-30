/* 数学题目构造器与变式模板（各册共用）
   M({...}) 生成一道题；TPL.xxx({...}) 按模板换数换情境，答案自动计算。 */
(function (w) {
  'use strict';

  function M(o) {
    o.module = 'math';
    o.input = o.input || 'number';
    o.type = o.type || 'word';
    o.level = o.level || 2;
    return o;
  }

  /* 变式模板：数值、情境可换，答案自动计算 */
  var TPL = {
    add: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: p.level || 1,
        skill: (p.skill || '加减法.用加法解决问题'),
        stem: '有 ' + a + ' 个' + p.name + '，又拿来 ' + b + ' 个，一共有几个？',
        fig: { type: 'objects', icon: p.icon, groups: [a, b] },
        answer: a + b, unit: p.unit || '个',
        explain: '合起来用加法：' + a + ' + ' + b + ' = ' + (a + b) + '。'
      });
    },
    sub: function (p) {
      var a = p.a, b = p.b, verb = p.verb || '吃';
      return M({
        type: 'word', level: p.level || 1,
        skill: (p.skill || '加减法.用减法解决问题'),
        stem: '有 ' + a + ' 个' + p.name + '，' + verb + '了 ' + b + ' 个，还剩几个？',
        fig: { type: 'objects', icon: p.icon, groups: [a, -b] },
        answer: a - b, unit: p.unit || '个',
        explain: '去掉一部分用减法：' + a + ' − ' + b + ' = ' + (a - b) + '。'
      });
    },
    more: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'compare', level: p.level || 2,
        skill: (p.skill || '比多比少.求相差'),
        stem: p.leftName + ' ' + a + ' ' + (p.unit || '人') + '，' + p.rightName + ' ' + b + ' ' + (p.unit || '人') + '，' + p.leftName + '比' + p.rightName + '多几' + (p.unit || '人') + '？',
        fig: {
          type: 'twoRows',
          left: { icon: p.leftIcon, n: a, label: p.leftName },
          right: { icon: p.rightIcon, n: b, label: p.rightName }
        },
        answer: a - b, unit: p.unit || '人',
        explain: '比多少用减法：' + a + ' − ' + b + ' = ' + (a - b) + '。'
      });
    },
    back: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: 3,
        skill: (p.skill || '加减法.逆向用加法解决问题'),
        stem: (p.name || '小鸟') + '飞走 ' + a + ' 只，还剩 ' + b + ' 只。原来有几只？',
        fig: { type: 'objects', icon: p.icon || '🐦', groups: [b] },
        answer: a + b, unit: '只',
        explain: '飞走的和剩下的合起来是原来的：' + a + ' + ' + b + ' = ' + (a + b) + '。'
      });
    },
    part: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: 2,
        skill: (p.skill || '加减法.总数与部分'),
        stem: '一共 ' + a + ' 个' + p.name + '，' + b + ' 个是' + p.c1 + '的，其余是' + p.c2 + '的。' + p.c2 + '的有几个？',
        fig: { type: 'objects', icon: p.icon, groups: [b, a - b], colors: [p.c1, p.c2] },
        answer: a - b, unit: '个',
        explain: '总数减去一部分：' + a + ' − ' + b + ' = ' + (a - b) + '。'
      });
    },
    cmpAdd: function (p) {
      var a = p.a, b = p.b;
      return M({
        type: 'word', level: 2,
        skill: (p.skill || '比多比少.求多的数'),
        stem: '小明有 ' + a + ' 个' + p.name + '，小红比小明多 ' + b + ' 个，小红有几个？',
        fig: { type: 'twoRows', left: { icon: p.icon, n: a, label: '小明' }, right: { icon: p.icon, n: a + b, label: '小红' } },
        answer: a + b, unit: '个',
        explain: '比小明多 ' + b + ' 个，就是 ' + a + ' + ' + b + ' = ' + (a + b) + '。'
      });
    }
  };


  /* ---------------- 组装 ---------------- */
  /**
   * units: 节点数组；meta: {bookId, code, name, textbook, version}
   */
  function build(units, meta) {
    var code = meta.code;
    var content = {
      bookId: meta.bookId, subject: 'math', name: meta.name,
      textbook: meta.textbook || '人教版 2024 修订版',
      version: meta.version || '2024.1', units: []
    };
    var seq = 0;
    units.forEach(function (u, ui) {
      var unit = { id: u.id, name: u.name, index: ui, lessons: [], nodes: [] };
      u.nodes.forEach(function (n, ni) {
        if (unit.lessons.indexOf(n.lesson) < 0) unit.lessons.push(n.lesson);
        var items = n.items.map(function (it, qi) {
          it.id = code + '-' + u.id + '-' + n.id + '-q' + (qi + 1);
          it.seq = ++seq;
          it.source = '人教版一上'.replace('一上', meta.stage || '一上') + ' · ' +
            u.name.replace(/^[^·]*· /, '') + ' · ' + n.lesson;
          if (!it.audio && it.stem) it.audio = it.stem.replace(/[「」？?，。、：（）]/g, ' ');
          return it;
        });
        unit.nodes.push({
          id: n.id, index: ni, title: n.lesson + ' · ' + n.title,
          lesson: n.lesson, estimatedMin: 30, items: items
        });
      });
      content.units.push(unit);
    });
    content.nodeCount = content.units.reduce(function (s, u) { return s + u.nodes.length; }, 0);
    content.itemCount = content.units.reduce(function (s, u) {
      return s + u.nodes.reduce(function (s2, n) { return s2 + n.items.length; }, 0);
    }, 0);
    return content;
  }

  w.SXBuilder = { build: build, M: M, TPL: TPL };
})(window);
