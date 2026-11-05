/* 首次引导：建档案 → 选节奏 → 设家长密码 */
(function (w) {
  'use strict';

  var draft = { name: '', avatar: '🐰', color: '#FF6B9D', pace: 'standard', bookId: 'yw-1a' };
  var step = 0;

  function render(host, query) {
    if (query && query.reset) step = 0;
    host.innerHTML = '';
    var wrap = U.h('div', { class: 'setup-wrap' });

    var hero = U.h('div', { class: 'setup-hero' },
      U.h('div', { class: 'h-emoji', text: step === 0 ? '🌱' : step === 1 ? '⏱' : '🔒' }),
      U.h('h1', { text: step === 0 ? '欢迎来到每日一练' : step === 1 ? '每天做多久？' : '最后一步：家长密码' }),
      U.h('p', { text: step === 0 ? '先给孩子建个档案，之后所有记录都会分开保存。' :
        step === 1 ? '按孩子的状态选一个节奏，之后随时可以改。' : '家长中心、删除、导出都需要这个 4 位密码。' })
    );
    wrap.appendChild(hero);

    var dots = U.h('div', { class: 'steps' });
    [0, 1, 2].forEach(function (i) {
      dots.appendChild(U.h('div', { class: 'dot' + (i === step ? ' on' : '') }));
    });
    wrap.appendChild(dots);

    var card = U.h('div', { class: 'card' });
    wrap.appendChild(card);

    if (step === 0) {
      var nameInput = U.h('input', { class: 'input', placeholder: '比如：小满', value: draft.name, maxlength: 10 });
      var pick = U.h('div', { class: 'avatar-pick' });
      w.Store.AVATARS.forEach(function (a) {
        pick.appendChild(U.h('button', {
          class: draft.avatar === a ? 'on' : '', text: a,
          onclick: function (e) {
            draft.avatar = a;
            U.$$('button', pick).forEach(function (b) { b.classList.remove('on'); });
            e.currentTarget.classList.add('on');
          }
        }));
      });
      card.appendChild(U.h('div', { class: 'field' }, U.h('label', { text: '孩子叫什么？' }), nameInput));
      card.appendChild(U.h('div', { class: 'field' }, U.h('label', { text: '选个头像' }), pick));

      var bookSel = U.h('select', { class: 'input' });
      (w.Content && w.Content.availableBooks ? w.Content.availableBooks() : [{ id: 'yw-1a', label: '一年级上册' }])
        .forEach(function (b) {
          bookSel.appendChild(U.h('option', { value: b.id, text: b.label, selected: draft.bookId === b.id }));
        });
      bookSel.addEventListener('change', function () { draft.bookId = bookSel.value; });
      card.appendChild(U.h('div', { class: 'field' },
        U.h('label', { text: '这学期学哪一册' }), bookSel,
        U.h('span', { class: 'hint', text: '之后在家长中心也能切换，两册进度各自保存。' })));
      card.appendChild(U.h('button', {
        class: 'btn btn-primary btn-lg btn-block', text: '下一步',
        onclick: function () {
          var v = nameInput.value.trim();
          if (!v) { U.toast('先填个名字吧', 'no'); nameInput.focus(); return; }
          draft.name = v;
          step = 1; render(host);
        }
      }));
    } else if (step === 1) {
      var seg = U.h('div', { class: 'grid', style: { gap: '10px' } });
      [['light', '☕ 轻', '约 20 分钟 / 18 题，适合刚上一年级'], ['standard', '🌤 标准', '约 30 分钟 / 25 题，推荐'],
      ['plus', '🔥 加量', '约 40 分钟 / 35 题，基础好、想多练']].forEach(function (x) {
        var on = draft.pace === x[0];
        seg.appendChild(U.h('button', {
          class: 'btn' + (on ? ' btn-primary' : ' btn-ghost'),
          style: { flexDirection: 'column', alignItems: 'flex-start', padding: '14px 16px', textAlign: 'left' },
          onclick: function () { draft.pace = x[0]; render(host); }
        }, U.h('b', { text: x[1] }), U.h('span', { class: 'small', text: x[2] })));
      });
      card.appendChild(seg);
      card.appendChild(U.h('div', { class: 'row', style: { marginTop: '18px' } },
        U.h('button', { class: 'btn btn-ghost', text: '上一步', onclick: function () { step = 0; render(host); } }),
        U.h('div', { class: 'spacer' }),
        U.h('button', {
          class: 'btn btn-primary', text: '下一步',
          onclick: function () { step = 2; render(host); }
        })
      ));
    } else {
      var p1 = U.h('input', { class: 'input', type: 'password', maxlength: 4, inputmode: 'numeric', placeholder: '4 位数字' });
      var p2 = U.h('input', { class: 'input', type: 'password', maxlength: 4, inputmode: 'numeric', placeholder: '再输一次' });
      card.appendChild(U.h('div', { class: 'field' }, U.h('label', { text: '设置家长密码' }), p1,
        U.h('span', { class: 'hint', text: '孩子端看不到任何设置入口，密码只有家长知道。' })));
      card.appendChild(U.h('div', { class: 'field' }, U.h('label', { text: '确认密码' }), p2));
      card.appendChild(U.h('button', {
        class: 'btn btn-primary btn-lg btn-block', text: '开始使用',
        onclick: function () {
          var v1 = p1.value.trim(), v2 = p2.value.trim();
          if (!/^\d{4}$/.test(v1)) { U.toast('请输 4 位数字', 'no'); return; }
          if (v1 !== v2) { U.toast('两次输入不一致', 'no'); return; }
          var kid = w.Store.kids.add({
            name: draft.name, avatar: draft.avatar, color: draft.color,
            grade: 1, bookId: draft.bookId, pace: draft.pace
          });
          w.Store.saveProgress({ bookId: draft.bookId });
          w.Store.saveSettings({ pinHash: U.hashPin(v1), pace: draft.pace });
          App.lock();
          U.toast('档案建好啦，开始今天的练习吧', 'ok');
          location.hash = '#/today';
          App.render();
        }
      }));
      card.appendChild(U.h('div', { class: 'row', style: { marginTop: '14px' } },
        U.h('button', { class: 'btn btn-ghost', text: '上一步', onclick: function () { step = 1; render(host); } })
      ));
    }

    wrap.appendChild(U.h('div', { class: 'center tiny muted', style: { marginTop: '20px' }, text: '数据只保存在这台电脑的浏览器里，可随时导出备份' }));
    host.appendChild(wrap);
  }

  App.page('setup', { title: '开始使用', render: render });
})(window);
