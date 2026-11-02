/* 排程层：中国法定节假日 + 每日容量 + 欠账计算
   ⚠️ 节假日表为内置默认值，可按当年国务院通知在家长中心里增删（写入 localStorage 覆盖）。 */
(function (w) {
  'use strict';

  var YEAR_DEFAULT = {
    '2026': [
      ['2026-01-01', '2026-01-03', '元旦'],
      ['2026-02-15', '2026-02-22', '春节'],
      ['2026-04-04', '2026-04-06', '清明'],
      ['2026-05-01', '2026-05-05', '劳动节'],
      ['2026-06-19', '2026-06-21', '端午'],
      ['2026-09-25', '2026-09-27', '中秋'],
      ['2026-10-01', '2026-10-07', '国庆']
    ],
    '2027': [
      ['2027-01-01', '2027-01-03', '元旦'],
      ['2027-02-05', '2027-02-12', '春节'],
      ['2027-04-03', '2027-04-05', '清明'],
      ['2027-05-01', '2027-05-05', '劳动节'],
      ['2027-06-09', '2027-06-11', '端午'],
      ['2027-09-15', '2027-09-17', '中秋'],
      ['2027-10-01', '2027-10-07', '国庆']
    ]
  };

  var map = null;

  function build() {
    map = {};
    var custom = null;
    try { custom = JSON.parse(w.localStorage.getItem('wb2_holidays') || 'null'); } catch (e) { custom = null; }
    if (!custom) {
      Object.keys(YEAR_DEFAULT).forEach(function (y) {
        YEAR_DEFAULT[y].forEach(function (r) {
          var d = r[0];
          while (d <= r[1]) { map[d] = r[2]; d = U.addDays(d, 1); }
        });
      });
    } else {
      custom.forEach(function (r) {
        var d = r[0];
        while (d <= r[1]) { map[d] = r[2] || '假期'; d = U.addDays(d, 1); }
      });
    }
    return map;
  }

  function all() { if (!map) build(); return map; }

  function holidayName(date) { return all()[date] || null; }
  function isHoliday(date) { return !!all()[date]; }
  function isWeekend(date) { var d = U.weekday(date); return d === 0 || d === 6; }

  /* workday / weekend / holiday */
  function dayType(date) {
    if (isHoliday(date)) return 'holiday';
    return isWeekend(date) ? 'weekend' : 'workday';
  }

  function typeLabel(t) {
    return t === 'holiday' ? '节假日' : t === 'weekend' ? '周末' : '工作日';
  }

  /* 当日「应完成」的场次：工作日 1、周六 3、周日 2、法定节假日 3
     —— 这是目标场次，不是上限：做完这几场才算当天完成 */
  function capacity(date, settings) {
    settings = settings || {};
    var t = dayType(date);
    if (t === 'holiday') return Math.max(1, settings.holidayCapacity || 3);
    if (t === 'weekend') {
      return U.weekday(date) === 6
        ? Math.max(1, settings.satCapacity || 3)     // 周六
        : Math.max(1, settings.sunCapacity || 2);    // 周日
    }
    return 1;
  }

  /* 当日还能额外补几场欠账：工作日不补，周末/节假日有上额 */
  function catchupRoom(date, settings) {
    if (dayType(date) === 'workday') return 0;
    var n = settings ? settings.catchupExtra : undefined;
    return Math.max(0, n === undefined ? 2 : Number(n) || 0);
  }

  /* 从 startDate（含）到 date（不含）应完成多少场：逐日累加当日目标 */
  function expectedSessions(startDate, date, settings) {
    if (!startDate) return 0;
    var n = U.diffDays(startDate, date);
    if (!(n > 0)) return 0;
    if (n > 730) n = 730;                       // 防止离谱的起始日期把循环拉爆
    var total = 0, d = startDate;
    for (var i = 0; i < n; i++) { total += capacity(d, settings); d = U.addDays(d, 1); }
    return total;
  }

  function backlog(progress, date, settings) {
    settings = settings || (w.Store && w.Store.settings ? w.Store.settings() : {});
    var exp = expectedSessions(progress.startDate, date, settings);
    return Math.max(0, exp - (progress.sessionsDone || 0));
  }

  /* 今日计划场次 = 当日目标场次 + 最多 2 场补欠账 */
  function plannedSessions(progress, date, settings) {
    var cap = capacity(date, settings);
    var back = backlog(progress, date, settings);
    return cap + Math.min(back, catchupRoom(date, settings));
  }

  /* 预估欠账补完日期：从今天向后模拟（最多 365 天） */
  function catchupEta(progress, fromDate, settings) {
    settings = settings || (w.Store && w.Store.settings ? w.Store.settings() : {});
    var back = backlog(progress, fromDate, settings);
    if (back <= 0) return null;
    var d = fromDate;
    var acc = 0;
    for (var i = 0; i < 365; i++) {
      acc += catchupRoom(d, settings);
      if (acc >= back) return { date: d, backlog: back };
      d = U.addDays(d, 1);
    }
    return { date: null, backlog: back };
  }

  /* 未来 n 天里即将到来的节假日（用于今日页提示） */
  function nextHolidays(fromDate, n) {
    var out = [];
    var d = U.addDays(fromDate, 1);
    for (var i = 0; i < 90 && out.length < n; i++) {
      var name = holidayName(d);
      if (name) {
        // 只取每个假期的第一天
        var prev = holidayName(U.addDays(d, -1));
        if (prev !== name) out.push({ date: d, name: name, days: holidayLength(d, name) });
      }
      d = U.addDays(d, 1);
    }
    return out;
  }

  function holidayLength(start, name) {
    var n = 0, d = start;
    while (holidayName(d) === name) { n++; d = U.addDays(d, 1); }
    return n;
  }

  function saveCustom(ranges) {
    try {
      if (!ranges || !ranges.length) { w.localStorage.removeItem('wb2_holidays'); }
      else { w.localStorage.setItem('wb2_holidays', JSON.stringify(ranges)); }
      map = null;
      return true;
    } catch (e) { return false; }
  }

  function exportCustom() {
    try {
      var c = JSON.parse(w.localStorage.getItem('wb2_holidays') || 'null');
      if (c) return c;
    } catch (e) { }
    var out = [];
    Object.keys(YEAR_DEFAULT).forEach(function (y) {
      YEAR_DEFAULT[y].forEach(function (r) { out.push(r.slice()); });
    });
    return out;
  }

  w.Schedule = {
    all: all, holidayName: holidayName, isHoliday: isHoliday, isWeekend: isWeekend,
    dayType: dayType, typeLabel: typeLabel, capacity: capacity, catchupRoom: catchupRoom,
    expectedSessions: expectedSessions, backlog: backlog, plannedSessions: plannedSessions,
    catchupEta: catchupEta, nextHolidays: nextHolidays,
    saveCustom: saveCustom, exportCustom: exportCustom
  };
})(window);
