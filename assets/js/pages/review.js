/* 批改详情页：大图 + 四维评分 + 评语 + AI */
(function (w) {
  'use strict';

  var DIMS = ['stroke', 'structure', 'clean', 'complete'];
  var DIM_CN = { stroke: '笔画正确', structure: '间架结构', clean: '整洁规范', complete: '完成度' };
  var PRESET_NOTES = [
    '今天写得很认真，继续保持！',
    '间架结构再紧凑一点 📏',
    '注意笔顺，慢一点写',
    '横平竖直，进步明显 👏',
    '字要写在田字格中间',
    '竖钩再挺一点，更有力'
  ];

  /* 把任意输入收敛成 1~5，无效返回 null（不写默认值） */
  function norm(v) {
    if (v === null || v === undefined || v === '') return null;
    var n = Math.round(Number(v));
    if (!isFinite(n)) return null;
    return Math.max(1, Math.min(5, n));
  }
  function reviewerText(by) {
    by = by || '';
    if (by === 'parent') return '家长';
    if (by.indexOf('ai') === 0) return 'AI' + (by.length > 3 ? '（' + by.slice(3) + '）' : '');
    return by || '系统';
  }

  function render(view, query) {
    var date = query.date || U.today();
    var slot = Number(query.slot || 0);
    var rec = w.Store.writingOf(date, slot);
    if (!rec) {
      view.appendChild(U.h('div', { class: 'card' },
        U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '🧐' }), '找不到这条写字记录')
      ));
      return;
    }

    var scores = { stroke: 3, structure: 3, clean: 3, complete: 3 };
    DIMS.forEach(function (d) {
      var v = norm(rec.scores ? rec.scores[d] : undefined);
      if (v !== null) scores[d] = v;
    });
    var note = rec.note || '';

    var wrap = U.h('div', { class: 'grid', style: { gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,1fr)', gap: '16px', alignItems: 'start' } });
    view.appendChild(wrap);

    /* 左：照片 */
    var left = U.h('div', { class: 'card' });
    left.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: U.fmtCn(date) + ' 第 ' + (slot + 1) + ' 场' }),
      U.h('span', { class: 'pill purple', text: (rec.chars || []).join(' ') })
    ));
    var photoBox = U.h('div', { style: { borderRadius: '14px', overflow: 'hidden', background: '#F7F2F5', minHeight: '220px', display: 'grid', placeItems: 'center' } });
    photoBox.appendChild(U.h('div', { class: 'muted small', text: '照片加载中…' }));
    left.appendChild(photoBox);
    if (rec.photoId) {
      w.Store.photoURL(rec.photoId).then(function (url) {
        U.clear(photoBox);
        if (!url) { photoBox.appendChild(U.h('div', { class: 'muted small', text: '照片丢失（可能被清理过），不影响评分记录' })); return; }
        var img = U.h('img', { src: url, style: { width: '100%', cursor: 'zoom-in' } });
        img.addEventListener('click', function () {
          U.modal({
            title: '作业大图', dismissable: true,
            body: U.h('img', { src: url, style: { width: '100%' } })
          });
        });
        photoBox.appendChild(img);
      });
    } else {
      U.clear(photoBox);
      photoBox.appendChild(U.h('div', { class: 'muted small', text: '这条记录没有照片' }));
    }
    if (rec.reviewedAt) {
      left.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '10px' },
        text: '上次评分：' + reviewerText(rec.reviewedBy) + '　' +
          new Date(rec.reviewedAt).toLocaleString('zh-CN') }));
    }
    left.appendChild(U.h('div', { class: 'row', style: { marginTop: '12px' } },
      U.h('button', { class: 'btn btn-sm', text: '🎒 导出这条给评分 App',
        onclick: function () {
          U.toast('正在打包…');
          w.AI.exportPackage().then(function (n) { U.toast('已导出 ' + n + ' 条待批改任务', 'ok'); })
            .catch(function (e) { U.toast(e.message, 'no'); });
        }
      }),
      U.h('button', { class: 'btn btn-sm btn-blue', text: '🤖 AI 打分',
        onclick: function () {
          U.toast('AI 正在看照片…');
          w.AI.scoreDirect(date, slot).then(function (r) {
            // 先把结果同步到当前界面，再整页重绘，保证两个来源都刷新
            var s = r.scores || {};
            DIMS.forEach(function (d) { var v = norm(s[d]); if (v !== null) scores[d] = v; });
            if (r.note) { note = r.note; ta.value = r.note; }
            paint();
            U.toast('AI 打分完成：' + DIMS.map(function (d) { return scores[d]; }).join('/'), 'ok');
            App.render();
          }).catch(function (e) { U.toast('AI 评分失败：' + e.message, 'no'); });
        }
      })
    ));
    wrap.appendChild(left);

    /* 右：评分 */
    var right = U.h('div', { class: 'card' });
    var titleRow = U.h('div', { class: 'card-title' }, U.h('h2', { text: '四个维度打分' }));
    if ((rec.reviewedBy || '').indexOf('ai') === 0) {
      titleRow.appendChild(U.h('span', { class: 'pill purple', text: '🤖 ' + reviewerText(rec.reviewedBy) + ' 已评分' }));
    }
    right.appendChild(titleRow);

    var total = U.h('div', { class: 'pill yellow', text: '均分 3.0' });
    right.appendChild(U.h('div', { class: 'row', style: { marginBottom: '8px' } },
      U.h('span', { class: 'small muted', text: '点星星给分（1~5 星）' }), U.h('div', { class: 'spacer' }), total));

    var starRows = {};
    DIMS.forEach(function (d) {
      var row = U.h('div', { class: 'score-row' });
      row.appendChild(U.h('div', { class: 'sr-name', text: DIM_CN[d] }));
      var pick = U.h('div', { class: 'stars-pick' });
      var btns = [];
      for (var i = 1; i <= 5; i++) {
        (function (v) {
          var b = U.h('button', { class: scores[d] >= v ? 'on' : '', text: '⭐' });
          b.addEventListener('click', function () {
            scores[d] = v;
            paint();
          });
          btns.push(b); pick.appendChild(b);
        })(i);
      }
      row.appendChild(pick);
      starRows[d] = btns;
      right.appendChild(row);
    });

    function paint() {
      DIMS.forEach(function (d) {
        starRows[d].forEach(function (b, i) { b.classList.toggle('on', scores[d] >= i + 1); });
      });
      var avg = (scores.stroke + scores.structure + scores.clean + scores.complete) / 4;
      total.textContent = '均分 ' + avg.toFixed(1);
    }

    var chips = U.h('div', { class: 'chips', style: { marginTop: '14px' } });
    PRESET_NOTES.forEach(function (t) {
      chips.appendChild(U.h('button', {
        text: t,
        onclick: function () {
          note = t;
          ta.value = t;
        }
      }));
    });
    right.appendChild(U.h('div', { class: 'small muted', style: { marginTop: '10px' }, text: '一句评语（可点选，也可自己写）' }));
    var ta = U.h('textarea', { class: 'input', placeholder: '例如：今天的「水」竖钩再挺一点' });
    ta.value = note;                       // textarea 只能属性赋值，setAttribute 不生效
    ta.addEventListener('input', function () { note = ta.value; });
    right.appendChild(chips);
    right.appendChild(U.h('div', { style: { marginTop: '8px' } }, ta));

    var actions = U.h('div', { class: 'row', style: { marginTop: '18px' } });
    actions.appendChild(U.h('button', {
      class: 'btn btn-primary', text: '保存评分',
      onclick: function () {
        w.Store.saveWriting(Object.assign({}, rec, {
          scores: {
            stroke: scores.stroke, structure: scores.structure,
            clean: scores.clean, complete: scores.complete
          },
          note: note,
          reviewedAt: Date.now(),
          reviewedBy: 'parent'
        }));
        U.sfx('done');
        U.toast('已保存，书写曲线已更新', 'ok');
        App.go('#/parent?tab=review');
      }
    }));
    actions.appendChild(U.h('button', {
      class: 'btn btn-ghost', text: '返回列表',
      onclick: function () { App.go('#/parent?tab=review'); }
    }));
    right.appendChild(actions);
    wrap.appendChild(right);

    paint();                                // 首次渲染就按存档分数点亮星星和均分
  }

  App.page('review', { title: '批改作业', render: render });
})(window);
