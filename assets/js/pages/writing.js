/* 写字页：田字格 + 四线三格范写 → 本子写（汉字或拼音自己选）→ 拍照上传 → 打卡 */
(function (w) {
  'use strict';

  /* 每个字一张卡：田字格是写汉字用的，四线三格是写拼音用的，写哪种当天自己挑 */
  function charCard(c) {
    var ch = w.CHARS[c] || {};
    var card = U.h('div', { class: 'char-card' });

    var tian = U.h('div', { class: 'tian' });
    tian.appendChild(U.h('div', { class: 'glyph', text: c }));
    card.appendChild(tian);

    var grid = U.h('div', { class: 'py-grid' });
    for (var i = 0; i < 4; i++) grid.appendChild(U.h('i'));
    var p = ch.p || '';
    /* 音节越长字越小，别把四线三格撑破 */
    var k = p.length >= 5 ? 1.55 : 1.97;
    grid.appendChild(U.h('div', {
      class: 'py-w', text: p,
      style: { fontSize: 'calc(var(--band) * ' + k + ')' }
    }));
    card.appendChild(grid);

    card.appendChild(U.h('div', { class: 'char-meta' },
      U.h('b', { text: c }), ' ' + (ch.p || ''),
      U.h('span', { class: 'muted', text: ch.s ? '　' + ch.s + ' 笔' : '' })
    ));
    if (ch.w && ch.w.length) {
      card.appendChild(U.h('div', { class: 'char-words', text: '组词：' + ch.w.join('、') }));
    }
    if (ch.st && ch.st.length) {
      var list = U.h('div', { class: 'stroke-list' });
      ch.st.forEach(function (s, i) {
        list.appendChild(U.h('span', { text: (i + 1) + ' ' + s }));
      });
      card.appendChild(list);
    }
    return card;
  }

  function render(view, query) {
    var date = U.today();
    var day = w.Task.ensure(date);
    /* 侧栏「写字打卡」不带 slot：定位到当前该做的一场，别又落回第 1 场 */
    var slot = (query.slot === undefined || query.slot === '')
      ? w.Task.currentSlot(date) : Number(query.slot);
    var session = slot >= 0 ? day.plan[slot] : null;
    if (!session) { App.go('#/today'); return; }

    var wrap = U.h('div');
    view.appendChild(wrap);

    var chars = session.chars || [];

    var head = U.h('div', { class: 'card' });
    head.appendChild(U.h('div', { class: 'card-title' },
      U.h('h2', { text: '🖌 今天的字（' + chars.length + ' 个）' }),
      U.h('div', { class: 'row' },
        U.h('span', { class: 'pill green', text: '写完拍照上传' }),
        U.h('button', { class: 'btn btn-sm', text: '🖨 打印格子', onclick: function () { App.go('#/print?slot=' + slot + '&mode=writing'); } })
      )
    ));
    head.appendChild(U.h('div', { class: 'small muted',
      text: '每个字在本子上写一行：想写汉字就看田字格，想写拼音就看下面的四线三格，写哪种都行（也可以两种都写）。这一场的字写在同一页上，最后拍 1 张照片就够。' +
        '交了照片就算完成写字，AI 点评可以稍后再补；今天不想写，也可以让家长输密码跳过。' }));
    wrap.appendChild(head);

    if (!chars.length) {
      wrap.appendChild(U.h('div', { class: 'card' },
        U.h('div', { class: 'empty' }, U.h('span', { class: 'e-emoji', text: '🌤' }), '这一场没有写字任务，可以直接去打卡。')
      ));
    } else {
      var grid = U.h('div', { class: 'write-grid', style: { marginTop: '16px' } });
      chars.forEach(function (c) { grid.appendChild(charCard(c)); });
      wrap.appendChild(grid);
    }

    /* 上传区 */
    var upload = U.h('div', { class: 'card', style: { marginTop: '16px' } });
    var fileInput = U.h('input', { type: 'file', accept: 'image/*', capture: 'environment', style: { display: 'none' } });
    var zone = U.h('div', { class: 'upload-zone' });
    upload.appendChild(zone);
    upload.appendChild(fileInput);
    wrap.appendChild(upload);

    var lastURL = null;
    function paintZone(url) {
      U.clear(zone);
      lastURL = url || null;
      if (url) {
        zone.appendChild(U.h('div', { class: 'shot-thumb', style: { margin: '0 auto' } },
          U.h('img', { src: url, alt: '作业照片' })
        ));
        var photoBtns = U.h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '12px' } },
          U.h('button', { class: 'btn btn-sm', text: '重新拍一张', onclick: pick })
        );
        /* 本场已经结算过就不让删照片：删掉会让「已完成」和结算数据对不上 */
        if (session.status !== 'done') photoBtns.appendChild(U.h('button', {
          class: 'btn btn-sm btn-danger', text: '删除',
          onclick: function () {
            if (!session.photoId) return;
            var pid = session.photoId;
            w.Store.photoDelete(pid);
            session.photoId = null;
            session.writingDoneAt = null;
            w.Store.saveDay(date, day);
            paintZone(null);
            paintFoot();
          }
        }));
        zone.appendChild(photoBtns);
        zone.appendChild(U.h('div', {
          class: 'small', style: { textAlign: 'center', marginTop: '10px', color: '#2E7D32', fontWeight: '700' },
          text: '✅ 照片已交，写字任务就算完成' + (session.status === 'done' ? '，本场也已打卡。' : '。') +
            'AI 点评可以稍后再补，没点评不影响完成。'
        }));
        if (aiReady()) {
          zone.appendChild(U.h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '10px' } },
            U.h('button', { class: 'btn btn-sm btn-blue', text: '🤖 让 AI 看看写得怎么样', onclick: aiScore })
          ));
          zone.appendChild(U.h('div', { class: 'small muted', style: { textAlign: 'center', marginTop: '4px' }, text: '用这一张照片直接打分，需要家长确认' }));
        }
      } else {
        zone.appendChild(U.h('div', { class: 'u-emoji', text: session.writingSkipped ? '🌤' : '📷' }));
        zone.appendChild(U.h('div', { style: { fontWeight: '800', marginTop: '6px' },
          text: session.writingSkipped ? '本场写字已由家长跳过' : '写好了，拍 1 张照片' }));
        zone.appendChild(U.h('p', { text: session.writingSkipped
          ? '改主意了也可以现在补写、拍照上传，照片会覆盖跳过状态。'
          : '这一场的字（或拼音）写在同一页上，整页拍清楚就行' }));
        zone.appendChild(U.h('button', {
          class: 'btn btn-primary', style: { marginTop: '10px' },
          text: session.writingSkipped ? '补写并拍照 / 选择照片' : '拍照 / 选择照片', onclick: pick
        }));
      }
    }

    function aiReady() {
      var ai = w.Store.settings().ai || {};
      return !!ai.enabled && !!ai.baseURL && !!ai.model;
    }

    function aiScore() {
      App.requirePin({ title: 'AI 点评需要家长确认' }).then(function (ok) {
        if (!ok) return;
        U.toast('AI 正在看照片…');
        w.AI.scoreDirect(date, slot).then(function (r) {
          var s = r.scores || {};
          var label = w.AI.dimLabel;
          U.toast('AI 已评分（' + w.AI.scriptCN(r.script) + '）：' + w.AI.DIMS.map(function (d) { return label(d, r.script) + ' ' + (s[d] || '-'); }).join('　'), 'ok');
          App.go('#/review?date=' + date + '&slot=' + slot);
        }).catch(function (e) { U.toast('AI 评分失败：' + e.message, 'no'); });
      });
    }

    /* 家长开了「拍照上传后自动点评」→ 拍完这一张直接在后台评分 */
    function autoScoreIfNeeded() {
      var ai = w.Store.settings().ai || {};
      if (!ai.enabled || !ai.autoScore || !ai.baseURL || !ai.model) return;
      w.AI.scoreDirect(date, slot).then(function (r) {
        var s = r.scores || {};
        U.toast('🤖 AI 点评完成（' + w.AI.scriptCN(r.script) + '）：' + ['stroke', 'structure', 'clean', 'complete']
          .map(function (d) { return s[d] || '-'; }).join(' / '), 'ok');
      }).catch(function (e) {
        console.warn('自动 AI 点评失败', e);   // 失败不打扰孩子，家长可在「批改」里重试
      });
    }

    function pick() { fileInput.click(); }

    fileInput.addEventListener('change', function () {
      var f = fileInput.files && fileInput.files[0];
      if (!f) return;
      U.toast('正在压缩照片…');
      w.Store.compressImage(f, 1280, 0.82).then(function (out) {
        var pid = 'p_' + date + '_' + slot;
        w.Store.photoPut({
          id: pid, kidId: w.Store.kids.activeId(), date: date, slot: slot,
          blob: out.blob, thumbBlob: out.thumbBlob, w: out.w, h: out.h, at: Date.now(),
          _dataURL: out.dataURL, _thumbURL: out.thumbURL
        }).then(function () {
          session.photoId = pid;
          session.writingDoneAt = Date.now();
          session.writingSkipped = false;   // 补写交了照片就覆盖跳过状态
          w.Store.saveDay(date, day);
          w.Store.saveWriting({
            date: date, slot: slot, chars: chars, photoId: pid, mode: null,
            scores: null, note: '', reviewedAt: null
          });
          if (!session._photoStar) {
            session._photoStar = 1;
            w.Store.addStars(2);
            U.toast('照片收到啦 +2 ⭐', 'ok');
          }
          settleIfReady();                 // 三科也答完就直接收尾，不等 AI 点评
          w.Store.photoURL(pid).then(function (url) { paintZone(url); paintFoot(); });
          autoScoreIfNeeded();
        });
      }).catch(function (e) {
        console.error(e);
        U.toast('照片处理失败，换一张试试', 'no');
      });
      fileInput.value = '';
    });

    paintZone(null);
    if (session.photoId) {
      var wantId = session.photoId;
      w.Store.photoURL(wantId).then(function (url) {
        if (session.photoId !== wantId) return;
        if (url) { paintZone(url); return; }
        // 照片丢了：给出兜底
        U.clear(zone);
        zone.appendChild(U.h('div', { class: 'u-emoji', text: '🫥' }));
        zone.appendChild(U.h('div', { style: { fontWeight: '800', marginTop: '6px' }, text: '这张照片找不到了' }));
        zone.appendChild(U.h('p', { text: '可能是浏览器清理了缓存。重新拍一张就行，已打的卡不受影响。' }));
        zone.appendChild(U.h('button', {
          class: 'btn btn-primary', style: { marginTop: '10px' }, text: '重新拍一张', onclick: pick
        }));
      }).catch(function () { });
    }

    /* 写字任务交了（照片 / 家长跳过）+ 三科答完，就把这一场结算掉。
       结算只认 Task.canCheckin()，跟 AI / 家长有没有点评完全无关：
       家长中途去批改、去评分，回来时计划已经推进到下一场，不会再被当成第一场没做。 */
    function settleIfReady() {
      if (session.status === 'done') return;
      if (!w.Task.canCheckin(session)) return;
      w.Task.completeSlot(date, slot, {
        ms: session.startedAt ? Date.now() - session.startedAt : 0
      });
      U.sfx('done');
    }

    /* 今天不想写：家长跳过本场写字。每次都要重新输密码，
       不能用家长中心 30 分钟的解锁状态绕过（force:true）。 */
    function skipWriting() {
      if (!chars.length || session.photoId || session.writingSkipped || session.status === 'done') return;
      App.requirePin({ force: true, title: '跳过写字需要家长密码' }).then(function (ok) {
        if (!ok) return;
        session.writingSkipped = true;
        session.writingSkippedAt = Date.now();
        w.Store.saveDay(date, day);
        settleIfReady();
        paintZone(lastURL);
        paintFoot();
        U.toast('已由家长确认跳过本场写字', 'ok');
      });
    }

    /* 底部动作 */
    var foot = U.h('div', { class: 'card', style: { marginTop: '16px' } });
    wrap.appendChild(foot);

    function paintFoot() {
      U.clear(foot);
      var answered = Object.keys(session.answers || {}).length;
      var total = session.items.chars.length + session.items.pinyin.length + session.items.math.length;
      var finished = session.status === 'done';
      var canSubmit = w.Task.writingOK(session);
      var alreadyIn = w.Task.checkedIn(w.Store.day(date));

      if (finished) {
        foot.appendChild(U.h('div', {
          class: 'small', style: { marginBottom: '10px', color: '#2E7D32', fontWeight: '700' },
          text: '✅ 第 ' + (slot + 1) + ' 场已完成' + (session.writingSkipped ? '（写字由家长跳过）' : '') +
            '，AI 点评可以之后再看，不影响完成。'
        }));
      } else if (answered < total) {
        foot.appendChild(U.h('div', { class: 'small muted', style: { marginBottom: '10px' },
          text: '题目还没做完（' + answered + '/' + total + '），可以先去练习。' }));
        foot.appendChild(U.h('button', { class: 'btn btn-ghost', text: '← 回去做题',
          onclick: function () { App.go('#/practice?slot=' + slot); } }));
      }

      if (chars.length && !session.photoId && !session.writingSkipped && !finished) {
        foot.appendChild(U.h('button', {
          class: 'btn btn-ghost btn-block', style: { marginTop: '10px' },
          text: '🔒 今天不写字，家长跳过（需密码）',
          onclick: skipWriting
        }));
        foot.appendChild(U.h('div', { class: 'small muted', style: { textAlign: 'center', marginTop: '4px' },
          text: '只跳过本场写字，题目照做；每次跳过都要重新输入家长密码。' }));
      }

      /* 提交一场就算今天打过卡；已经打过卡的场次就只说「完成第 N 场」 */
      var btn = U.h('button', {
        class: 'btn btn-primary btn-lg btn-block', style: { marginTop: '10px' },
        text: finished ? '查看本场成绩 →'
          : !canSubmit ? '先拍照上传才能打卡'
            : (alreadyIn ? '完成第 ' + (slot + 1) + ' 场 ✓' : '完成今天的打卡 ✓'),
        onclick: function () {
          if (finished) { App.go('#/done?slot=' + slot); return; }
          if (!canSubmit) { U.toast('还没上传作业照片哦', 'no'); return; }
          if (answered < total) { U.toast('还有题目没做完，先做完再来打卡', 'no'); return; }
          settleIfReady();
          App.go('#/done?slot=' + slot);
        }
      });
      if (!canSubmit && !finished) btn.disabled = true;
      foot.appendChild(btn);
    }
    paintFoot();
  }

  App.page('writing', { title: '写字打卡', render: render });
})(window);
