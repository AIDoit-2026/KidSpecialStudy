/* 内容包注册与查询（支持多册次：一年级上册 / 下册 …） */
(function (w) {
  'use strict';

  var BOOKS = w.CONTENT || {};

  /* 册次 → 学科内容包 */
  var BOOK_PAIRS = {
    'yw-1a': { chinese: 'yw-1a', math: 'sx-1a', label: '一年级上册' },
    'yw-1b': { chinese: 'yw-1b', math: 'sx-1b', label: '一年级下册' }
  };
  var DEFAULT_BOOK = 'yw-1a';

  var index = null;

  function activeBookId() {
    var kid = w.Store && w.Store.kids ? w.Store.kids.active() : null;
    var id = (kid && kid.bookId) || DEFAULT_BOOK;
    return BOOK_PAIRS[id] ? id : DEFAULT_BOOK;
  }

  function pair(bookId) {
    return BOOK_PAIRS[bookId || activeBookId()] || BOOK_PAIRS[DEFAULT_BOOK];
  }

  function book(subject) {
    if (typeof subject === 'string' && BOOKS[subject]) return BOOKS[subject];   // 直接传 bookId
    var p = pair();
    return BOOKS[p[subject]] || null;
  }

  function bookLabel(bookId) {
    return pair(bookId).label || '一年级上册';
  }

  function availableBooks() {
    return Object.keys(BOOK_PAIRS).map(function (id) {
      return { id: id, label: BOOK_PAIRS[id].label, ready: !!BOOKS[BOOK_PAIRS[id].chinese] };
    });
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
    Object.keys(BOOKS).forEach(function (bid) {
      var b = BOOKS[bid];
      if (!b || !b.units) return;
      b.units.forEach(function (u) {
        u.nodes.forEach(function (n) {
          n.items.forEach(function (it) { index[it.id] = it; });
        });
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

  /* 当前册次的写字表 */
  function writingTable(bookId) {
    return w.WritingTable ? w.WritingTable.get(bookId || activeBookId()) : [];
  }

  /* 自检：返回问题列表 */
  function validate() {
    var problems = [];
    Object.keys(BOOKS).forEach(function (bid) {
      var b = BOOKS[bid];
      if (!b || !b.units) { problems.push('内容包结构异常：' + bid); return; }
      b.units.forEach(function (u) {
        u.nodes.forEach(function (n) {
          if (!n.items.length) problems.push(bid + ' ' + n.title + ' 没有题目');
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
    });
    return problems;
  }

  function stats() {
    var y = book('chinese'), s = book('math');
    return {
      bookId: activeBookId(), bookLabel: bookLabel(),
      ywUnits: y ? y.units.length : 0, ywNodes: y ? y.nodeCount : 0, ywItems: y ? y.itemCount : 0,
      sxUnits: s ? s.units.length : 0, sxNodes: s ? s.nodeCount : 0, sxItems: s ? s.itemCount : 0,
      writing: writingTable().length
    };
  }

  /* 全部册次合计 */
  function allStats() {
    var out = { nodes: 0, items: 0, books: 0 };
    Object.keys(BOOKS).forEach(function (bid) {
      var b = BOOKS[bid];
      if (!b || !b.units) return;
      out.books++;
      out.nodes += b.nodeCount || 0;
      out.items += b.itemCount || 0;
    });
    return out;
  }

  w.Content = {
    book: book, unit: unit, node: node, nodeCount: nodeCount,
    advance: advance, nodeAtCursor: nodeAtCursor, allNodes: allNodes,
    item: item, items: items, skills: skills, validate: validate, stats: stats, allStats: allStats,
    activeBookId: activeBookId, bookLabel: bookLabel, availableBooks: availableBooks,
    writingTable: writingTable, BOOK_PAIRS: BOOK_PAIRS
  };
})(window);
