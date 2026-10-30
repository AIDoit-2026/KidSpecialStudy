/* 内容包注册与查询 */
(function (w) {
  'use strict';

  var BOOKS = w.CONTENT || {};
  var SUBJECT_BOOK = { chinese: 'yw-1a', math: 'sx-1a' };
  var index = null;

  function book(subject) {
    if (typeof subject === 'string' && BOOKS[subject]) return BOOKS[subject];
    return BOOKS[SUBJECT_BOOK[subject]] || null;
  }

  function unit(subject, ui) {
    var b = book(subject);
    if (!b) return null;
    return b.units[ui] || null;
  }

  function node(subject, ui, ni) {
    var u = unit(subject, ui);
    if (!u) return null;
    return u.nodes[ni] || null;
  }

  function nodeCount(subject) {
    var b = book(subject);
    return b ? b.nodeCount : 0;
  }

  /* 线性遍历：把 (unit,node) 当作一维游标 */
  function advance(subject, cur, step) {
    var b = book(subject);
    if (!b) return null;
    var ui = cur.unit, ni = cur.node;
    for (var k = 0; k < (step || 1); k++) {
      var u = b.units[ui];
      if (!u) return null;
      ni++;
      if (ni >= u.nodes.length) { ui++; ni = 0; }
      if (ui >= b.units.length) return null;
    }
    return { unit: ui, node: ni };
  }

  function nodeAtCursor(subject, cur) {
    var n = node(subject, cur.unit, cur.node);
    if (!n) return null;
    var u = unit(subject, cur.unit);
    return {
      key: subject.charAt(0) + cur.unit + '-' + n.id,
      unit: cur.unit, node: cur.node,
      unitName: u.name, title: n.title, lesson: n.lesson,
      items: n.items, chars: n.chars || []
    };
  }

  function allNodes(subject) {
    var b = book(subject);
    if (!b) return [];
    var out = [];
    b.units.forEach(function (u, ui) {
      u.nodes.forEach(function (n, ni) {
        out.push({ unit: ui, node: ni, unitName: u.name, title: n.title, items: n.items, lesson: n.lesson });
      });
    });
    return out;
  }

  function buildIndex() {
    index = {};
    ['chinese', 'math'].forEach(function (s) {
      allNodes(s).forEach(function (n) {
        n.items.forEach(function (it) { index[it.id] = it; });
      });
    });
  }

  function item(id) {
    if (!index) buildIndex();
    return index[id] || null;
  }

  function items(ids) {
    return (ids || []).map(item).filter(Boolean);
  }

  function skills(subject) {
    var m = {};
    allNodes(subject).forEach(function (n) {
      n.items.forEach(function (it) { m[it.skill] = (m[it.skill] || 0) + 1; });
    });
    return m;
  }

  /* 自检：返回问题列表 */
  function validate() {
    var problems = [];
    ['chinese', 'math'].forEach(function (s) {
      var b = book(s);
      if (!b) { problems.push('缺少内容包：' + s); return; }
      allNodes(s).forEach(function (n) {
        if (!n.items.length) problems.push(n.title + ' 没有题目');
        n.items.forEach(function (it) {
          if (!it.stem) problems.push(it.id + ' 缺题干');
          if (it.options && (it.answer === undefined || it.answer < 0 || it.answer >= it.options.length)) {
            problems.push(it.id + ' 答案越界');
          }
          if (it.options && it.options.length !== new Set(it.options).size) {
            problems.push(it.id + ' 选项重复');
          }
        });
      });
    });
    return problems;
  }

  function stats() {
    var y = book('chinese'), s = book('math');
    return {
      ywUnits: y ? y.units.length : 0, ywNodes: y ? y.nodeCount : 0, ywItems: y ? y.itemCount : 0,
      sxUnits: s ? s.units.length : 0, sxNodes: s ? s.nodeCount : 0, sxItems: s ? s.itemCount : 0,
      writing: (w.WRITING_TABLE || []).length
    };
  }

  w.Content = {
    book: book, unit: unit, node: node, nodeCount: nodeCount,
    advance: advance, nodeAtCursor: nodeAtCursor, allNodes: allNodes,
    item: item, items: items, skills: skills, validate: validate, stats: stats,
    SUBJECT_BOOK: SUBJECT_BOOK
  };
})(window);
