/* 期中 / 期末考试页：先看考试说明 → 逐题作答（不提示对错）→ 交卷评分 → 错题回顾 */
(function (w) {
  'use strict';

  function moduleName(it) {
    if (it.module === 'math') return '数学';
    if (it.module === 'pinyin') return '拼音';
    return '语文';
  }

  function render(view, query) {
    var kind = (query.kind === 'final') ? 'final' : 'mid';
    var today = U.today();
    var entry = w.ExamGen.schedule(today).filter(function (x) { return x.kind === kind; })[0];
    if (!entry) { App.go('#/today'); return; }

    var st = { phase: 'intro', paper: null, answers: {}, pos: 0 };

    function paperOf() {
      if (!st.paper) {
        var p = w.Store.progress();
        st.paper = w.ExamGen.build(entry.bookId, kind, { yw: p.yw, sx: p.sx }, today);
      }
      return st.paper;
    }

    function paint() {
      U.clear(view);
      if (st.phase === 'intro') return intro();
      if (st.phase === 'doing') return doing();
      return result();
    }

    /* ---------------- 说明页 ---------------- */
    function intro() {
      var rec = w.Store.examOf(entry.key);
      var card = U.h('div', { class: 'card exam-intro' });
      card.appendChild(U.h('div', { class: 'exam-badge', text: kind === 'mid' ? '📝' : '🏁' }));
      card.appendChild(U.h('h2', { class: 'exam-title', text: entry.label }));
      card.appendChild(U.h('div', { class: 'exam-sub', text: entry.bookLabel + ' · ' + U.fmtCn(entry.date) + '（' + U.weekdayCn(entry.date) + '）' }));

      var facts = U.h('div', { class: 'exam-facts' });
      [['题量', '20 题'], ['满分', '100 分'], ['时间', '约 30 分钟'], ['范围', kind === 'mid' ? '前半册' : '整册']]
        .forEach(function (f) {
          facts.appendChild(U.h('div', { class: 'exam-fact' },
            U.h('div', { class: 'ef-k', text: f[0] }),
            U.h('div', { class: 'ef-v', text: f[1] })));
        });
      card.appendChild(facts);

      card.appendChild(U.h('div', { class: 'exam-tip', text: '考试时不提示对错，做完统一评分。不会的题可以先选一个，最后再看错题解析。' }));

      if (rec) {
        var box = U.h('div', { class: 'exam-score-box' });
        box.appendChild(U.h('div', { class: 'es-label', text: '上次成绩' }));
        box.appendChild(U.h('div', { class: 'es-score ' + scoreClass(rec.score), text: rec.score + ' 分' }));
        box.appendChild(U.h('div', { class: 'es-sub', text: '答对 ' + rec.correct + '/' + rec.total + ' 题 · ' + U.fmtCn(String(rec.date || '')) }));
        card.appendChild(box);
      }

      var actions = U.h('div', { class: 'exam-actions' });
      actions.appendChild(U.h('button', {
        class: 'btn btn-primary btn-lg',
        text: rec ? '再考一次' : '开始考试',
        onclick: function () {
          st.answers = {}; st.pos = 0; st.phase = 'doing';
          paint();
        }
      }));
      if (rec) {
        actions.appendChild(U.h('button', {
          class: 'btn btn-ghost btn-lg', text: '看上次的错题',
          onclick: function () { st.phase = 'result'; paint(); }
        }));
      }
      actions.appendChild(U.h('button', {
        class: 'btn btn-ghost btn-lg', text: '← 回今日',
        onclick: function () { App.go('#/today'); }
      }));
      card.appendChild(actions);
      view.appendChild(card);
    }

    /* ---------------- 答题 ---------------- */
    function doing() {
      var paper = paperOf();
      var q = paper.questions[st.pos];
      var wrap = U.h('div', { class: 'exam-doing' });

      var head = U.h('div', { class: 'p-head' });
      head.appendChild(U.h('div', { class: 'p-bar' }, U.h('i', { style: { width: Math.round(st.pos / paper.questions.length * 100) + '%' } })));
      head.appendChild(U.h('div', { class: 'p-count', text: '第 ' + (st.pos + 1) + ' / ' + paper.questions.length + ' 题' }));
      head.appendChild(U.h('div', { class: 'exam-timer', text: entry.label }));
      wrap.appendChild(head);

      var card = U.h('div', { class: 'q-card exam-q' });
      var tag = U.h('div', { class: 'q-tag' });
      tag.appendChild(U.h('span', { class: 'pill', text: moduleName(q.item) }));
      tag.appendChild(U.h('span', { class: 'pill gray', text: q.item.skill || '' }));
      tag.appendChild(U.h('span', { class: 'pill pink', text: q.score + ' 分' }));
      card.appendChild(tag);

      card.appendChild(U.h('div', { class: 'q-stem' }, U.h('div', { class: 'stem-text', text: q.item.stem })));
      if (q.item.fig && App.renderFigure) {
        var fig = App.renderFigure(q.item.fig);
        if (fig) card.appendChild(fig);
      }

      var opts = U.h('div', { class: 'q-options' + ((q.options.length === 2 || q.options.length === 4) && q.options.every(function (o) { return String(o).length <= 7; }) ? ' cols2' : '') });
      q.options.forEach(function (opt, i) {
        var picked = Number(st.answers[st.pos]) === i;
        var b = U.h('button', { class: 'opt' + (picked ? ' sel' : '') },
          U.h('span', { class: 'key', text: 'ABCD'[i] }),
          U.h('span', { text: String(opt) }));
        b.addEventListener('click', function () {
          st.answers[st.pos] = i;
          U.$$('.opt', opts).forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          var nextBtn = U.$('.exam-next', card);
          if (nextBtn) nextBtn.classList.remove('is-off');
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);

      var foot = U.h('div', { class: 'q-foot exam-foot' });
      foot.appendChild(U.h('button', {
        class: 'btn btn-ghost', text: '← 上一题',
        onclick: function () { if (st.pos > 0) { st.pos--; paint(); } }
      }));
      foot.appendChild(U.h('div', { class: 'spacer' }));
      if (st.pos + 1 >= paper.questions.length) {
        foot.appendChild(U.h('button', {
          class: 'btn btn-primary btn-lg exam-next', text: '交卷',
          onclick: function () { confirmSubmit(); }
        }));
      } else {
        foot.appendChild(U.h('button', {
          class: 'btn btn-primary btn-lg exam-next' + (st.answers[st.pos] === undefined ? ' is-off' : ''),
          text: '下一题 →',
          onclick: function () {
            if (st.answers[st.pos] === undefined) { U.toast('先选一个答案'); return; }
            st.pos++; paint();
          }
        }));
      }
      card.appendChild(foot);
      wrap.appendChild(card);
      view.appendChild(wrap);
    }

    function confirmSubmit() {
      var paper = paperOf();
      var blank = paper.questions.filter(function (q, i) { return st.answers[i] === undefined; }).length;
      var body = U.h('div', { class: 'small', text: blank ? '还有 ' + blank + ' 题没有作答，没答的按错题算。确定交卷吗？' : '20 题都答完了，确定交卷吗？' });
      U.modal({
        title: '交卷', body: body,
        actions: [
          { label: '再检查一下', class: 'btn-ghost', onClick: function (m) { m.close(); } },
          {
            label: '确定交卷', class: 'btn-primary', onClick: function (m) {
              m.close();
              w.ExamGen.submit(paper, st.answers);
              st.phase = 'result';
              paint();
            }
          }
        ]
      });
    }

    /* ---------------- 成绩页 ---------------- */
    function result() {
      var paper = paperOf();
      var rec = w.Store.examOf(entry.key);
      var g = rec ? { correct: rec.correct, total: rec.total, score: rec.score, wrong: rec.wrong } : w.ExamGen.grade(paper, st.answers);

      var card = U.h('div', { class: 'card exam-result' });
      card.appendChild(U.h('div', { class: 'er-emoji', text: g.score >= 90 ? '🎉' : g.score >= 60 ? '💪' : '🌱' }));
      card.appendChild(U.h('h2', { class: 'er-title', text: entry.label + '成绩' }));
      card.appendChild(U.h('div', { class: 'er-score ' + scoreClass(g.score), text: g.score + ' 分' }));
      card.appendChild(U.h('div', { class: 'er-sub', text: '答对 ' + g.correct + ' / ' + g.total + ' 题（满分 ' + (g.total * 5) + ' 分）' }));

      var wrongIdx = [];
      if (rec && rec.wrong && rec.wrong.length === paper.questions.length - g.correct) {
        /* 存的是题目 id，换回题号 */
        rec.wrong.forEach(function (id) {
          for (var i = 0; i < paper.questions.length; i++) {
            if (paper.questions[i].item.id === id) { wrongIdx.push(i); return; }
          }
        });
      } else {
        paper.questions.forEach(function (q, i) {
          var a = rec && rec.answers ? rec.answers[i] : st.answers[i];
          if (Number(a) !== Number(q.answer)) wrongIdx.push(i);
        });
      }

      if (!wrongIdx.length) {
        card.appendChild(U.h('div', { class: 'er-perfect', text: '全对！这一册学得很扎实。' }));
      } else {
        card.appendChild(U.h('div', { class: 'er-section', text: '错题回顾（' + wrongIdx.length + ' 题）' }));
        wrongIdx.forEach(function (i) {
          var q = paper.questions[i];
          var ans = rec && rec.answers ? rec.answers[i] : st.answers[i];
          var row = U.h('div', { class: 'er-wrong' });
          row.appendChild(U.h('div', { class: 'ew-stem', text: (i + 1) + '. ' + q.item.stem }));
          if (q.item.fig && q.item.fig.type === 'passage') {
            row.appendChild(U.h('div', { class: 'ew-passage', text: '《' + (q.item.fig.title || '短文') + '》：' + q.item.fig.text }));
          }
          row.appendChild(U.h('div', { class: 'ew-line' },
            U.h('span', { class: 'ew-bad', text: '你的答案：' + (ans === undefined ? '没有作答' : q.options[ans]) }),
            U.h('span', { class: 'ew-good', text: '正确答案：' + q.options[q.answer] })));
          if (q.item.explain) row.appendChild(U.h('div', { class: 'ew-explain', text: q.item.explain }));
          card.appendChild(row);
        });
      }

      var actions = U.h('div', { class: 'exam-actions' });
      actions.appendChild(U.h('button', {
        class: 'btn btn-primary btn-lg', text: '回今日',
        onclick: function () { App.go('#/today'); }
      }));
      actions.appendChild(U.h('button', {
        class: 'btn btn-ghost btn-lg', text: '再考一次',
        onclick: function () { st.answers = {}; st.pos = 0; st.phase = 'doing'; paint(); }
      }));
      card.appendChild(actions);
      view.appendChild(card);
    }

    paint();
  }

  function scoreClass(s) {
    return s >= 90 ? 'good' : s >= 60 ? 'mid' : 'low';
  }

  App.page('examday', { title: '考试', render: render });
})(window);
