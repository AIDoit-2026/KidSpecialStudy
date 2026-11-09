/* 徽章库：成长记录页「徽章墙」与今日任务页「徽章速览」共用一份定义和判定。
   判定只从现有 Store / Task / App 数据推导，不新增存档字段，旧数据直接兼容。 */
(function (w) {
  'use strict';

  var GROUPS = [
    { id: 'streak', name: '坚持打卡', emoji: '🔥' },
    { id: 'answer', name: '答题达人', emoji: '📚' },
    { id: 'session', name: '练习场次', emoji: '🎯' },
    { id: 'subject', name: '单科小能手', emoji: '🧠' },
    { id: 'quality', name: '又快又准', emoji: '💎' },
    { id: 'writing', name: '写字小书法家', emoji: '✍️' },
    { id: 'stars', name: '星星收藏家', emoji: '⭐' },
    { id: 'collect', name: '车库收藏家', emoji: '🚗' },
    { id: 'special', name: '特别成就', emoji: '🎖️' }
  ];

  /* metric = 统计口径，goal = 达成阈值。
     梯度刻意做得密：每天做题都能看见下一枚还差多少，而不是攒一个月才有一次反馈。 */
  var BADGES = [
    /* 连续打卡 */
    { id: 'streak1', emoji: '🌱', name: '第一天', desc: '完成第一次打卡', group: 'streak', metric: 'streak', goal: 1 },
    { id: 'streak3', emoji: '🔥', name: '坚持 3 天', desc: '连续打卡 3 天', group: 'streak', metric: 'streak', goal: 3 },
    { id: 'streak7', emoji: '🔥', name: '坚持 7 天', desc: '连续打卡 7 天', group: 'streak', metric: 'streak', goal: 7 },
    { id: 'streak14', emoji: '🌟', name: '坚持 14 天', desc: '连续打卡 14 天', group: 'streak', metric: 'streak', goal: 14 },
    { id: 'streak30', emoji: '👑', name: '坚持 30 天', desc: '连续打卡 30 天', group: 'streak', metric: 'streak', goal: 30 },
    { id: 'streak60', emoji: '🏆', name: '坚持 60 天', desc: '连续打卡 60 天', group: 'streak', metric: 'streak', goal: 60 },
    { id: 'streak100', emoji: '💫', name: '百日之星', desc: '连续打卡 100 天', group: 'streak', metric: 'streak', goal: 100 },

    /* 累计答对 */
    { id: 'q50', emoji: '📖', name: '五十题', desc: '累计答对 50 题', group: 'answer', metric: 'correct', goal: 50 },
    { id: 'q100', emoji: '📚', name: '百题斩', desc: '累计答对 100 题', group: 'answer', metric: 'correct', goal: 100 },
    { id: 'q300', emoji: '📗', name: '三百题', desc: '累计答对 300 题', group: 'answer', metric: 'correct', goal: 300 },
    { id: 'q500', emoji: '🏅', name: '五百题', desc: '累计答对 500 题', group: 'answer', metric: 'correct', goal: 500 },
    { id: 'q1000', emoji: '🎓', name: '千题学士', desc: '累计答对 1000 题', group: 'answer', metric: 'correct', goal: 1000 },
    { id: 'q2000', emoji: '🧙', name: '两千题', desc: '累计答对 2000 题', group: 'answer', metric: 'correct', goal: 2000 },

    /* 完成场次 */
    { id: 's1', emoji: '🎈', name: '开场啦', desc: '完成 1 场练习', group: 'session', metric: 'sessions', goal: 1 },
    { id: 's10', emoji: '🎯', name: '十场', desc: '完成 10 场练习', group: 'session', metric: 'sessions', goal: 10 },
    { id: 's30', emoji: '🎪', name: '三十场', desc: '完成 30 场练习', group: 'session', metric: 'sessions', goal: 30 },
    { id: 's60', emoji: '🎡', name: '六十场', desc: '完成 60 场练习', group: 'session', metric: 'sessions', goal: 60 },
    { id: 's100', emoji: '🎆', name: '百场达人', desc: '完成 100 场练习', group: 'session', metric: 'sessions', goal: 100 },

    /* 单科 */
    { id: 'chars100', emoji: '🈶', name: '认字小能手', desc: '认字答对 100 题', group: 'subject', metric: 'chars', goal: 100 },
    { id: 'pinyin100', emoji: '🔤', name: '拼音小能手', desc: '拼音答对 100 题', group: 'subject', metric: 'pinyin', goal: 100 },
    { id: 'math100', emoji: '🔢', name: '数学小能手', desc: '数学答对 100 题', group: 'subject', metric: 'math', goal: 100 },

    /* 正确率 */
    { id: 'perfect', emoji: '💎', name: '满分一次', desc: '单场全对', group: 'quality', metric: 'perfect', goal: 1 },
    { id: 'perfect3', emoji: '💠', name: '连中三元', desc: '连续 3 场全对', group: 'quality', metric: 'perfectRun', goal: 3 },
    { id: 'perfectDay', emoji: '🌞', name: '完美一天', desc: '一天里每场都全对', group: 'quality', metric: 'perfectDays', goal: 1 },

    /* 写字 */
    { id: 'write1', emoji: '🖊️', name: '第一张作业', desc: '交 1 次写字照片', group: 'writing', metric: 'writing', goal: 1 },
    { id: 'write10', emoji: '✍️', name: '小小书法家', desc: '交作业 10 次', group: 'writing', metric: 'writing', goal: 10 },
    { id: 'write30', emoji: '🖌️', name: '三十张作业', desc: '交作业 30 次', group: 'writing', metric: 'writing', goal: 30 },

    /* 累计赚到的星星（不受买装饰 / 车模影响） */
    { id: 'star100', emoji: '⭐', name: '一百颗星', desc: '累计赚到 100 颗星', group: 'stars', metric: 'earned', goal: 100 },
    { id: 'star500', emoji: '🌠', name: '五百颗星', desc: '累计赚到 500 颗星', group: 'stars', metric: 'earned', goal: 500 },
    { id: 'star1000', emoji: '🌌', name: '星河', desc: '累计赚到 1000 颗星', group: 'stars', metric: 'earned', goal: 1000 },

    /* 车模收藏：和小屋的展柜联动，goal 按实际车模总数取 */
    { id: 'car5', emoji: '🚙', name: '车库开张', desc: '收集 5 辆汽车模型', group: 'collect', metric: 'cars', goal: 5 },
    { id: 'car15', emoji: '🏎️', name: '小型车展', desc: '收集 15 辆汽车模型', group: 'collect', metric: 'cars', goal: 15 },
    { id: 'carAll', emoji: '🚘', name: '满车库', desc: '收齐全部年代车模', group: 'collect', metric: 'cars', goal: -1 },

    /* 特别成就 */
    { id: 'makeup', emoji: '🧩', name: '补练达人', desc: '完成 5 场补练', group: 'special', metric: 'makeup', goal: 5 },
    { id: 'weekend', emoji: '🌈', name: '周末勇士', desc: '周末打卡 4 天', group: 'special', metric: 'weekend', goal: 4 },
    { id: 'early', emoji: '🌅', name: '早起鸟', desc: '早上 9 点前完成 3 场', group: 'special', metric: 'early', goal: 3 }
  ];

  function carTotal() { return w.Cars ? w.Cars.all().length : 26; }

  function num(v) { return Number(v) || 0; }

  /* 一次算出所有统计口径，避免每个徽章各扫一遍流水 */
  function stats() {
    var days = w.Store.days() || {};
    var attempts = w.Store.attempts() || [];
    var p = w.Store.progress() || {};
    var plan = [];
    Object.keys(days).sort().forEach(function (k) {
      (days[k].plan || []).forEach(function (s) { plan.push({ date: k, s: s }); });
    });
    var done = plan.filter(function (x) { return x.s.status === 'done'; });
    var right = attempts.filter(function (a) { return a.correct; });
    var bySub = function (m) {
      return right.filter(function (a) { return a.subject === m; }).length;
    };
    var writing = w.Store.writingList().filter(function (x) { return x.photoId; }).length;

    var run = 0, bestRun = 0;
    done.forEach(function (x) {
      if (x.s.score === 1) { run++; if (run > bestRun) bestRun = run; }
      else run = 0;
    });
    var perfectDays = Object.keys(days).filter(function (k) {
      var ss = days[k].plan || [];
      return ss.length && ss.every(function (s) { return s.status === 'done' && s.score === 1; });
    }).length;
    var weekend = Object.keys(days).filter(function (k) {
      var d = U.parse(k).getDay();
      return (d === 0 || d === 6) && w.Task.checkedIn(days[k]);
    }).length;
    var early = done.filter(function (x) {
      return x.s.finishedAt && new Date(x.s.finishedAt).getHours() < 9;
    }).length;
    var makeup = done.filter(function (x) { return x.s.type === 'catchup'; }).length;
    var cars = (w.Store.decor() || []).filter(function (id) {
      return String(id).indexOf('car_') === 0;
    }).length;

    /* 累计赚到的星星：口径与 Task.completeSlot 发星一致（答对 1 星 + 交照片 2 星）。
       不能读 Store.stars()，那是会被商店花掉的余额。 */
    return {
      streak: w.App && w.App.streak ? num(w.App.streak()) : 0,
      correct: right.length,
      sessions: num(p.sessionsDone),
      chars: bySub('chars'), pinyin: bySub('pinyin'), math: bySub('math'),
      perfect: done.filter(function (x) { return x.s.score === 1; }).length,
      perfectRun: bestRun,
      perfectDays: perfectDays,
      writing: writing,
      earned: right.length + writing * 2,
      cars: cars,
      makeup: makeup, weekend: weekend, early: early
    };
  }

  function all() {
    var s = stats();
    return BADGES.map(function (b) {
      var goal = b.goal < 0 ? carTotal() : b.goal;
      var cur = Math.min(s[b.metric] || 0, goal);
      return {
        id: b.id, emoji: b.emoji, name: b.name, desc: b.desc,
        group: b.group, metric: b.metric, goal: goal,
        current: cur, raw: s[b.metric] || 0,
        pct: Math.round(cur / goal * 100),
        left: Math.max(0, goal - cur),
        owned: cur >= goal
      };
    });
  }

  function owned() {
    return all().filter(function (b) { return b.owned; }).map(function (b) { return b.id; });
  }

  /* 下一枚：挑进度最接近的未获得徽章 */
  function next() {
    var list = all().filter(function (b) { return !b.owned; });
    if (!list.length) return null;
    list.sort(function (a, b) { return b.pct - a.pct || a.goal - b.goal; });
    return list[0];
  }

  /* 速览用：每个统计口径只展示已达成的「最高一级」，凑成一面小成就墙 */
  function highlights(limit) {
    var best = {}, order = [];
    all().forEach(function (b) {
      if (!b.owned) return;
      if (!best[b.metric]) { best[b.metric] = b; order.push(b.metric); }
      else if (b.goal > best[b.metric].goal) best[b.metric] = b;
    });
    return order.map(function (m) { return best[m]; }).slice(0, limit || 6);
  }

  w.Badges = {
    groups: GROUPS, all: all, owned: owned, next: next,
    highlights: highlights, stats: stats, length: BADGES.length
  };
})(window);
