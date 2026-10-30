/* 练习页：一次一题，支持单选 / 数字键盘 / 图示题 */
(function (w) {
  'use strict';

  var MODULE_META = {
    chars: { name: '认字', emoji: '🈶', color: 'var(--purple)' },
    pinyin: { name: '拼音', emoji: '🔤', color: 'var(--blue)' },
    math: { name: '数学', emoji: '🔢', color: 'var(--orange)' }
  };

  /* ---------------- 图示渲染 ---------------- */
  var SHAPE_NAMES = { cube: '正方体', cuboid: '长方体', cylinder: '圆柱', ball: '球', circle: '圆', square: '正方形', triangle: '三角形' };

  function shapeSVG(kind) {
    var svg = U.svg('svg', { viewBox: '0 0 76 76', class: 'shape-svg' });
    var fill = { cube: '#FFD9E6', cuboid: '#D8F0EC', cylinder: '#FFE9C7', ball: '#E4DDFF', circle: '#FFE9C7', square: '#D8F0EC', triangle: '#E4DDFF' }[kind] || '#EEE';
    var stroke = '#C99AAE';
    function add(tag, attrs) { svg.appendChild(U.svg(tag, attrs)); }

    if (kind === 'cube' || kind === 'cuboid') {
      var wq = kind === 'cube' ? 40 : 52, hq = kind === 'cube' ? 40 : 30, ox = 12, oy = 22;
      add('polygon', { points: (ox + 8) + ',' + (oy - 8) + ' ' + (ox + wq + 8) + ',' + (oy - 8) + ' ' + (ox + wq) + ',' + oy + ' ' + ox + ',' + oy, fill: '#FFFFFF', stroke: stroke });
      add('polygon', { points: (ox + wq) + ',' + oy + ' ' + (ox + wq + 8) + ',' + (oy - 8) + ' ' + (ox + wq + 8) + ',' + (oy + hq - 8) + ' ' + (ox + wq) + ',' + (oy + hq), fill: fill, stroke: stroke, 'fill-opacity': '.7' });
      add('rect', { x: ox, y: oy, width: wq, height: hq, fill: fill, stroke: stroke, rx: 2 });
    } else if (kind === 'cylinder') {
      add('ellipse', { cx: 38, cy: 22, rx: 20, ry: 7, fill: '#fff', stroke: stroke });
      add('path', { d: 'M18 22 L18 54 A20 7 0 0 0 58 54 L58 22', fill: fill, stroke: stroke });
      add('ellipse', { cx: 38, cy: 22, rx: 20, ry: 7, fill: '#fff', stroke: stroke, 'fill-opacity': '.9' });
    } else if (kind === 'ball') {
      add('circle', { cx: 38, cy: 38, r: 21, fill: fill, stroke: stroke });
      add('ellipse', { cx: 31, cy: 30, rx: 6, ry: 4, fill: '#fff', 'fill-opacity': '.7', transform: 'rotate(-25 31 30)' });
    } else if (kind === 'circle') {
      add('circle', { cx: 38, cy: 38, r: 22, fill: fill, stroke: stroke });
    } else if (kind === 'square') {
      add('rect', { x: 16, y: 16, width: 44, height: 44, fill: fill, stroke: stroke, rx: 3 });
    } else if (kind === 'triangle') {
      add('polygon', { points: '38,14 62,60 14,60', fill: fill, stroke: stroke });
    }
    return svg;
  }

  function icons(icon, n, faded) {
    var box = U.h('div', { class: 'fig-group' });
    for (var i = 0; i < n; i++) box.appendChild(U.h('span', { class: 'fig-icon' + (faded ? ' faded' : ''), text: icon }));
    return box;
  }

  function renderFigure(fig) {
    if (!fig) return null;
    var wrap = U.h('div', { class: 'q-figure' });

    if (fig.type === 'objects') {
      var groups = fig.groups || [];
      groups.forEach(function (g, gi) {
        if (gi > 0) {
          wrap.appendChild(U.h('span', { class: 'fig-eq', text: g < 0 ? '−' : '＋' }));
        }
        if (g === 0) {
          wrap.appendChild(U.h('span', { class: 'small muted', text: '（空的）' }));
        } else if (g < 0) {
          var negBox = U.h('div', { class: 'fig-group', style: { maxWidth: '220px' } });
          for (var k = 0; k < Math.abs(g); k++) negBox.appendChild(U.h('span', { class: 'fig-icon faded', text: fig.icon }));
          wrap.appendChild(negBox);
        } else {
          wrap.appendChild(icons(fig.icon, g, false));
        }
      });
      if (fig.suffix) wrap.appendChild(U.h('div', { style: { fontSize: '26px' }, text: fig.suffix }));
    } else if (fig.type === 'twoRows') {
      [['left', fig.left], ['right', fig.right]].forEach(function (pair) {
        var d = pair[1];
        if (!d) return;
        var row = U.h('div', { class: 'fig-row' });
        row.appendChild(U.h('div', { class: 'fig-label', text: d.label || '' }));
        row.appendChild(icons(d.icon, d.n, false));
        wrap.appendChild(row);
      });
    } else if (fig.type === 'tenframe') {
      var frame = U.h('div', { class: 'fig-tenframe' });
      for (var i = 0; i < 10; i++) frame.appendChild(U.h('i', { class: i < fig.n ? 'on' : '' }));
      wrap.appendChild(frame);
    } else if (fig.type === 'shapes') {
      var panel = U.h('div', { class: 'shape-panel' });
      (fig.list || []).forEach(function (k, idx) {
        var cell = U.h('div', { style: { textAlign: 'center' } });
        cell.appendChild(shapeSVG(k));
        cell.appendChild(U.h('div', { class: 'tiny muted', text: (idx + 1) + '. ' + (SHAPE_NAMES[k] || '') }));
        panel.appendChild(cell);
      });
      wrap.appendChild(panel);
    } else if (fig.type === 'eq') {
      wrap.appendChild(U.h('span', { class: 'fig-box', text: String(fig.a) }));
      wrap.appendChild(U.h('span', { class: 'fig-eq', text: fig.op }));
      wrap.appendChild(U.h('span', { class: 'fig-box', text: String(fig.b) }));
      wrap.appendChild(U.h('span', { class: 'fig-eq', text: '=' }));
      wrap.appendChild(U.h('span', { class: 'fig-box', text: fig.blank === 'result' ? '' : String(fig.c || '') }));
    } else if (fig.type === 'blocks') {
      var area = U.h('div', { style: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' } });
      (fig.layout || []).forEach(function (n) {
        var row = U.h('div', { style: { display: 'flex', gap: '4px' } });
        for (var i = 0; i < n; i++) row.appendChild(U.h('span', { style: { fontSize: '26px' }, text: '🟦' }));
        area.appendChild(row);
      });
      wrap.appendChild(area);
    }
    return wrap;
  }

  /* ---------------- 页面 ---------------- */
  function render(view, query) {
    var date = U.today();
    var slot = Number(query.slot || 0);
    var moduleFilter = query.module || null;
    var redoIds = query.ids ? query.ids.split(',').filter(Boolean) : null;
    var day = w.Task.ensure(date);
    var session;
    var queue;

    if (redoIds && redoIds.length) {
      session = { answers: {}, items: { chars: [], pinyin: [], math: [] }, chars: [], status: 'todo', redo: true };
      queue = redoIds;
    } else {
      session = day.plan[slot];
      if (!session) { App.go('#/today'); return; }
      queue = buildQueue(session, moduleFilter);
      if (!queue.length) {
        U.toast('这个模块今天没有题目');
        App.go('#/today');
        return;
      }
    }

    var state = {
      date: date, slot: slot, session: session, queue: queue,
      pos: 0, selected: null, judged: false, tries: 0, startedAt: Date.now(), qStart: Date.now()
    };
    state.pos = firstUnanswered(session, queue);

    var wrap = U.h('div', { class: 'practice-wrap' });
    view.appendChild(wrap);

    if (state.pos >= queue.length) {
      finish();
      return;
    }
    showQuestion();

    /* ---------- 渲染当前题 ---------- */
    function showQuestion() {
      U.clear(wrap);
      var item = w.Content.item(queue[state.pos]);
      if (!item) { state.pos++; if (state.pos >= queue.length) return finish(); return showQuestion(); }
      // 已答过则跳过
      if (session.answers[item.id]) {
        state.pos++;
        if (state.pos >= queue.length) return finish();
        return showQuestion();
      }

      state.selected = null;
      state.judged = false;
      state.tries = 0;
      state.qStart = Date.now();

      var meta = MODULE_META[item.module] || { name: '', emoji: '', color: 'var(--pink)' };

      /* 进度条 */
      var head = U.h('div', { class: 'p-head' });
      head.appendChild(U.h('div', { class: 'p-bar' }, U.h('i', { style: { width: Math.round(state.pos / queue.length * 100) + '%' } })));
      head.appendChild(U.h('div', { class: 'p-count', text: '第 ' + (state.pos + 1) + ' / ' + queue.length + ' 题' }));
      head.appendChild(U.h('button', {
        class: 'btn btn-sm', text: '⏸ 暂停',
        onclick: function () { U.toast('已保存，回来继续'); App.go('#/today'); }
      }));
      wrap.appendChild(head);

      /* 题卡 */
      var card = U.h('div', { class: 'q-card' });
      var tag = U.h('div', { class: 'q-tag' });
      tag.appendChild(U.h('span', { class: 'pill', style: { background: '#F6F2F5', color: meta.color }, text: meta.emoji + ' ' + meta.name }));
      tag.appendChild(U.h('span', { class: 'pill gray', text: item.skill || '' }));
      if (item.level === 3) tag.appendChild(U.h('span', { class: 'pill pink', text: '挑战' }));
      card.appendChild(tag);

      var stem = U.h('div', { class: 'q-stem' },
        U.h('div', { class: 'stem-text', text: item.stem }),
        U.h('button', {
          class: 'speaker', text: '🔊', title: '再读一遍',
          onclick: function (e) {
            var btn = e.currentTarget;
            btn.classList.add('playing');
            TTS.speak(item.audio || item.stem, { force: true });
            setTimeout(function () { btn.classList.remove('playing'); }, 1200);
          }
        })
      );
      card.appendChild(stem);

      var fig = renderFigure(item.fig);
      if (fig) card.appendChild(fig);

      /* 答题区 */
      var answerArea = U.h('div');
      card.appendChild(answerArea);

      var hasOptions = item.options && item.options.length;
      if (hasOptions) {
        var twoCols = (item.options.length === 2 || item.options.length === 4) &&
          item.options.every(function (o) { return String(o).length <= 7; });
        var opts = U.h('div', { class: 'q-options' + (twoCols ? ' cols2' : '') });
        item.options.forEach(function (opt, i) {
          var b = U.h('button', { class: 'opt' },
            U.h('span', { class: 'key', text: 'ABCD'[i] }),
            U.h('span', { text: String(opt) })
          );
          b.addEventListener('click', function () {
            if (state.judged) return;
            U.$$('.opt', opts).forEach(function (x) { x.classList.remove('sel'); });
            b.classList.add('sel');
            state.selected = i;
            judge();
          });
          opts.appendChild(b);
        });
        answerArea.appendChild(opts);
      } else {
        buildNumpad(answerArea, item);
      }

      var foot = U.h('div', { class: 'q-foot' });
      card.appendChild(foot);
      wrap.appendChild(card);

      /* 自动朗读 */
      if (w.Store.settings().tts) {
        setTimeout(function () { TTS.speak(item.audio || item.stem); }, 220);
      }

      function buildNumpad(host, it) {
        var val = '';
        var box = U.h('div', { class: 'numpad' });
        var disp = U.h('div', { class: 'np-display' });
        function paint() {
          U.clear(disp);
          disp.appendChild(U.h('span', { text: val || '?' }));
          if (it.unit) disp.appendChild(U.h('span', { class: 'unit', text: it.unit }));
        }
        paint();
        box.appendChild(disp);
        var keys = U.h('div', { class: 'np-keys' });
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '删除', '0', '确定'].forEach(function (k) {
          var cls = k === '删除' ? 'fn' : k === '确定' ? 'ok' : '';
          keys.appendChild(U.h('button', {
            class: cls, text: k,
            onclick: function () {
              if (state.judged) return;
              if (k === '删除') { val = val.slice(0, -1); paint(); return; }
              if (k === '确定') {
                if (!val) { U.toast('先输入一个数'); return; }
                state.selected = Number(val);
                judge();
                return;
              }
              if (val.length >= 3) return;
              val += k;
              paint();
              U.sfx('done');
            }
          }));
        });
        box.appendChild(keys);
        host.appendChild(box);
      }

      function judge() {
        if (state.judged) return;
        state.judged = true;
        var correct = isCorrect(item, state.selected);
        var first = state.tries === 0;
        var ms = Date.now() - state.qStart;

        if (correct) {
          onCorrect(item, first, ms);
        } else {
          onWrong(item, first, ms);
        }
      }

      function onCorrect(item, first, ms) {
        U.sfx('right');
        if (hasOptions) {
          var btns = U.$$('.opt', answerArea);
          if (btns[state.selected]) btns[state.selected].classList.add('right');
        }
        var gain = first ? 1 : 0.5;
        recordAnswer(item, state.selected, true, state.tries + 1, ms);
        w.Store.addStars(gain);
        U.flyStar(answerArea);
        U.toast('答对啦 +' + gain + ' ⭐', 'ok');
        feedback(true, item, gain);
      }

      function onWrong(item, first, ms) {
        U.sfx('wrong');
        if (hasOptions) {
          var btns = U.$$('.opt', answerArea);
          if (btns[state.selected]) btns[state.selected].classList.add('wrong');
        }
        state.tries++;
        recordAnswer(item, state.selected, false, state.tries, ms, true);
        if (state.tries >= 2) {
          // 两次都不对：公布答案
          if (hasOptions) {
            var all = U.$$('.opt', answerArea);
            all.forEach(function (b, i) { if (i === item.answer) b.classList.add('right'); });
          }
          feedback(false, item, 0, true);
          state.judged = true;
          state.revealed = true;
        } else {
          feedback(false, item, 0, false);
          setTimeout(function () {
            state.judged = false;
            state.selected = null;
            U.$$('.opt', answerArea).forEach(function (x) { x.classList.remove('sel', 'wrong'); });
            if (!hasOptions) {
              U.clear(answerArea);
              buildNumpad(answerArea, item);
            }
            var fb = U.$('.feedback', card);
            if (fb) fb.parentNode.removeChild(fb);
          }, 1400);
        }
      }

      function feedback(ok, item, gain, revealed) {
        var old = U.$('.feedback', card);
        if (old) old.parentNode.removeChild(old);
        var fb = U.h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') });
        fb.appendChild(U.h('div', { class: 'fb-emoji', text: ok ? '🎉' : '🤔' }));
        var body = U.h('div', { style: { flex: '1' } });
        body.appendChild(U.h('div', { text: ok ? '太棒了，答对啦！' + (gain === 0.5 ? '（第二次答对，半分）' : '') : (revealed ? '正确答案是：' + correctText(item) : '再想一想～') }));
        if (!ok || revealed) {
          body.appendChild(U.h('div', { class: 'fb-explain', text: item.explain || '' }));
          if (item.source) body.appendChild(U.h('div', { class: 'fb-src', text: item.source }));
        }
        fb.appendChild(body);
        card.insertBefore(fb, foot);
        foot.innerHTML = '';

        if (ok || revealed) {
          foot.appendChild(U.h('div', { class: 'spacer' }));
          foot.appendChild(U.h('button', {
            class: 'btn btn-primary btn-lg',
            text: state.pos + 1 >= queue.length ? '完成这一科 →' : '下一题 →',
            onclick: next
          }));
          setTimeout(function () {
            var b = U.$('.q-foot .btn', card);
            if (b) b.focus();
          }, 30);
        } else {
          foot.appendChild(U.h('div', { class: 'small muted', text: '可以再试一次哦，答对给半分 ⭐' }));
        }
      }

      function next() {
        state.pos++;
        if (state.pos >= queue.length) return finish();
        showQuestion();
      }

      document.onkeydown = function (e) {
        if (e.key === 'Enter' && state.judged) { next(); }
      };
    }

    /* ---------- 收尾 ---------- */
    function finish() {
      document.onkeydown = null;
      if (session.redo) {
        U.toast('重练完成，又巩固了一遍！', 'ok');
        App.go('#/mistakes');
        return;
      }
      var s = day.plan[slot];
      var answeredNow = Object.keys(s.answers || {}).length;
      var total = s.items.chars.length + s.items.pinyin.length + s.items.math.length;

      if (answeredNow >= total) {
        // 三科做完 → 去写字
        if (s.chars.length) { App.go('#/writing?slot=' + slot); return; }
        // 没有写字任务，直接完成
        w.Task.completeSlot(date, slot, { ms: Date.now() - state.startedAt });
        App.go('#/done?slot=' + slot);
        return;
      }
      U.toast('这一科做完啦，还有其他科目哦', 'ok');
      App.go('#/today');
    }

    function recordAnswer(item, ans, correct, tries, ms) {
      var s = session.redo ? session : day.plan[slot];
      s.answers = s.answers || {};
      var prev = s.answers[item.id];
      var rec = {
        ans: ans, correct: correct || (prev ? prev.correct : false),
        tries: tries, ms: ms, at: Date.now()
      };
      if (prev && prev.correct) rec.correct = true;
      s.answers[item.id] = rec;
      if (!session.redo) w.Store.saveDay(date, day);
      w.Store.addAttempt({
        id: U.uid('a'), date: date, subject: item.module, itemId: item.id,
        answer: ans, correct: correct, tries: tries, ms: ms, slot: slot,
        skill: item.skill
      });
      w.Store.recordAnswer(item, correct, { review: !!item._isReview });
    }
  }

  function buildQueue(session, moduleFilter) {
    var out = [];
    if (moduleFilter) {
      out = (session.items[moduleFilter] || []).slice();
    } else {
      out = (session.items.chars || []).concat(session.items.pinyin || [], session.items.math || []);
    }
    return out;
  }

  function firstUnanswered(session, queue) {
    for (var i = 0; i < queue.length; i++) {
      if (!session.answers || !session.answers[queue[i]]) return i;
    }
    return queue.length;
  }

  function isCorrect(item, ans) {
    if (ans === null || ans === undefined) return false;
    if (item.options) return Number(ans) === Number(item.answer);
    return String(ans).trim() === String(item.answer).trim();
  }

  function correctText(item) {
    if (item.options) return item.options[item.answer];
    return item.answer + (item.unit || '');
  }

  App.page('practice', { title: '开始练习', render: render, renderFigure: renderFigure });
})(window);
