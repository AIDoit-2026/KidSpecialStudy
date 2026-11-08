/* 内容自检：加载全部册次的内容包，检查唯一性 / 答案有效性 / 题干长度 / 计算题占比 */
const { load } = require('./load-content.js');

const ctx = load();
let errors = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };

const BOOKS = ['yw-1a', 'yw-1b', 'sx-1a', 'sx-1b'];
const CN = { 'yw-1a': '语文一上', 'yw-1b': '语文一下', 'sx-1a': '数学一上', 'sx-1b': '数学一下' };

console.log('=== 字库与写字表 ===');
console.log(`汉字库：${Object.keys(ctx.CHARS).length} 字`);
['yw-1a', 'yw-1b'].forEach(b => {
  console.log(`写字表 ${CN[b]}：${ctx.WritingTable.get(b).length} 字`);
});

console.log('\n=== 各册概况 ===');
const ids = new Set();
const grand = { nodes: 0, items: 0, calc: 0 };
const summary = [];

BOOKS.forEach(bid => {
  const b = ctx.CONTENT[bid];
  if (!b) { err('缺少内容包：' + bid); return; }
  const isCN = bid.indexOf('yw') === 0;
  const wantPerNode = isCN ? 11 : 5;
  let total = 0, calc = 0;

  /* 同一册内不能有「不同 id、完全相同的题干」：每日练习按题干签名去重，
     但源头重复会让补位池白白少一道题，也容易让家长看成重复出题。
     跨册（一上 / 一下）是不同学期，允许同题干复习题各出现一次。 */
  const bookStems = new Set();
  b.units.forEach(u => {
    if (!u.nodes.length) err(`${CN[bid]} ${u.id} 没有节点`);
    u.nodes.forEach(n => {
      const nCmp = n.items.filter(i => i.type === 'cmp').length;
      const nCh = n.items.filter(i => i.type === 'challenge').length;
      const nUnit = n.items.filter(i => i.type === 'unit').length;
      if (isCN) {
        if (n.items.length !== wantPerNode) err(`${CN[bid]} ${u.id}/${n.id} 题量=${n.items.length}（应 ${wantPerNode}）`);
      } else {
        // 数学节点 = 5 道常规题 + 1~3 道比较式填数 + 0~2 道思维挑战 + 0~2 道单元知识点题
        const normal = n.items.length - nCmp - nCh - nUnit;
        if (normal !== wantPerNode) err(`${CN[bid]} ${u.id}/${n.id} 常规题=${normal}（应 ${wantPerNode}）`);
        if (nCmp > 3) err(`${CN[bid]} ${u.id}/${n.id} 比较式填数 ${nCmp} 道（最多 3）`);
        if (n.ineq !== undefined && nCmp !== n.ineq) err(`${CN[bid]} ${u.id}/${n.id} 比较式填数 ${nCmp} 道（应 ${n.ineq}）`);
        if (n.ineq === undefined && nCmp) err(`${CN[bid]} ${u.id}/${n.id} 不该有比较式填数（前面还没学加减）`);
        if (nCh > 2) err(`${CN[bid]} ${u.id}/${n.id} 思维挑战题 ${nCh} 道（最多 2）`);
        if ((n.challenge || 0) !== nCh) err(`${CN[bid]} ${u.id}/${n.id} 思维挑战题 ${nCh} 道（应 ${n.challenge || 0}）`);
        if (nUnit > 2) err(`${CN[bid]} ${u.id}/${n.id} 单元知识点题 ${nUnit} 道（最多 2）`);
        if ((n.unitpack || 0) !== nUnit) err(`${CN[bid]} ${u.id}/${n.id} 单元知识点题 ${nUnit} 道（应 ${n.unitpack || 0}）`);
      }
      n.items.forEach(it => {
        total++;
        const sk = (it.stem || '').replace(/\s+/g, '');
        if (bookStems.has(sk)) err(`${it.id} 同册题干完全重复：${it.stem}`);
        bookStems.add(sk);
        if (ids.has(it.id)) err('重复 id ' + it.id);
        ids.add(it.id);
        if (!it.stem) err(`${it.id} 缺题干`);
        const limit = it.module === 'math' ? 34 : 26;
        if (it.stem && it.stem.length > limit) err(`${it.id} 题干过长(${it.stem.length})：${it.stem}`);
        if (!it.explain) err(`${it.id} 缺解析`);
        if (!it.skill) err(`${it.id} 缺知识点标签`);
        if (it.options) {
          if (it.options.length < 2) err(`${it.id} 选项不足`);
          if (new Set(it.options).size !== it.options.length) err(`${it.id} 选项重复：${it.options.join('/')}`);
          if (it.answer === undefined || it.answer < 0 || it.answer >= it.options.length) err(`${it.id} 答案越界`);
        } else if (it.answer === undefined || it.answer === null || it.answer === '') {
          err(`${it.id} 缺答案`);
        }
        if (it.module === 'math' && it.type === 'calc') calc++;
      });
    });
  });

  const ratio = total ? calc / total : 0;
  if (!isCN && ratio > 0.2) err(`${CN[bid]} 纯计算题占比 ${(ratio * 100).toFixed(1)}% 超红线`);
  summary.push({ bid: CN[bid], units: b.units.length, nodes: b.nodeCount, items: total, calc, ratio });
  grand.nodes += b.nodeCount;
  grand.items += total;
  grand.calc += calc;
});

console.log('册次      单元  节点   题量   纯计算');
summary.forEach(s => {
  console.log(
    s.bid.padEnd(9) +
    String(s.units).padEnd(6) +
    String(s.nodes).padEnd(7) +
    String(s.items).padEnd(7) +
    (s.calc + '（' + (s.ratio * 100).toFixed(1) + '%）')
  );
});
console.log(`合计：${grand.nodes} 节点 / ${grand.items} 题`);

console.log('\n=== 送分题下架检查 ===');
const BANNED_STEM = /一共有几笔|可以组成下面哪个词|是第几声？|是声母还是韵母|是什么结构的字|的偏旁是哪个|像「广播」的 b|一竖在左|半圆在右下/;
const BANNED_SKILL = /^认字\.(数笔画|选组词|字形结构|选偏旁)$|^拼音\.(声调|声母辨认|韵母辨认|字母分类|形近字母)$/;
const WANT_ITEMS = { 'yw-1a': 781, 'yw-1b': 737, 'sx-1a': 440, 'sx-1b': 441 };
BOOKS.forEach(bid => {
  const b = ctx.CONTENT[bid];
  if (!b) return;
  let bad = 0;
  b.units.forEach(u => u.nodes.forEach(n => n.items.forEach(it => {
    if (BANNED_STEM.test(it.stem) || BANNED_SKILL.test(it.skill || '')) bad++;
  })));
  if (bad) err(`${CN[bid]} 还留着 ${bad} 道已下架的送分题`);
  if (b.itemCount !== WANT_ITEMS[bid]) err(`${CN[bid]} 题量 ${b.itemCount}（应 ${WANT_ITEMS[bid]}）`);
});
console.log('七类送分题：数笔画 / 选组词 / 读第几声 / 声母韵母分类 / 字形结构 / 问偏旁 / 描述字母长相 → 应为 0；四册题量应保持不变');

console.log('\n=== 选字填空（补位题型） ===');
['yw-1a', 'yw-1b'].forEach(bid => {
  const b = ctx.CONTENT[bid];
  let n = 0, bad = 0;
  b.units.forEach(u => u.nodes.forEach(nd => nd.items.forEach(it => {
    if (it.skill !== '认字.选字填空') return;
    n++;
    const blank = (it.stem || '').replace('选字填空：', '');
    if (blank.indexOf('（　）') < 0) { bad++; return; }
    // 干扰项填回去不能成词，否则一道题有两个正确答案
    (it.options || []).forEach((o, k) => {
      if (k === it.answer) return;
      const alt = blank.replace('（　）', o);
      const rec = ctx.CHARS[o];
      if (rec && (rec.w || []).some(x => x === alt)) bad++;
    });
    if (!it.audio) bad++;
  })));
  if (n < 10) err(`${CN[bid]} 选字填空只有 ${n} 道，补位不足`);
  if (bad) err(`${CN[bid]} 选字填空有 ${bad} 处答案不唯一或格式异常`);
  console.log(`  ${CN[bid]}：${n} 道，答案唯一性 ${bad ? '✗' : '✓'}`);
});

console.log('\n=== 同韵母 + 易混声母（看字选拼音） ===');
/* 取代「一竖在左、半圆在右下」这类描述字母长相的题：题干只给一个字，
   选项的韵母、声调完全相同，只有声母不同，且声母都来自三组易混声母。
   j/q/x 在普通话里只能接 i / ü 开头的韵母，所以除指定的 9 个韵母外，
   还按「等韵母」补了同类的鼻 / 复韵母。下面这张表同时校验拼合是否合法，
   防止出现 jan / bong 这种一眼就能排除的假拼音。 */
const CI_FINS = ['ai', 'ao', 'ou', 'en', 'un', 'an', 'ang', 'eng', 'ong',
  'in', 'ing', 'ian', 'iao', 'iang', 'iong', 'iu', 'ie'];
const CI_GROUPS = [['b', 'd', 'p'], ['j', 'q', 'x'], ['z', 'c', 's', 'zh', 'ch', 'sh']];
const CI_SM = CI_GROUPS.reduce((a, g) => a.concat(g), []);
const CI_ALLOW = {
  ai: ['b', 'd', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  ao: ['b', 'd', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  ou: ['d', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  en: ['b', 'd', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  un: ['d', 'z', 'c', 's', 'zh', 'ch', 'sh', 'j', 'q', 'x'],
  an: ['b', 'd', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  ang: ['b', 'd', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  eng: ['b', 'd', 'p', 'z', 'c', 's', 'zh', 'ch', 'sh'],
  ong: ['d', 'z', 'c', 's', 'zh', 'ch'],
  in: ['j', 'q', 'x', 'b', 'p'],
  ing: ['j', 'q', 'x', 'b', 'p', 'd'],
  ian: ['j', 'q', 'x', 'b', 'p', 'd'],
  iao: ['j', 'q', 'x', 'b', 'p', 'd'],
  iang: ['j', 'q', 'x'],
  iong: ['j', 'q', 'x'],
  iu: ['j', 'q', 'x', 'd'],
  ie: ['j', 'q', 'x', 'b', 'p', 'd']
};
function ciSplit(base) {
  for (const s of ctx.PY.SHENGMU) {
    if (base.indexOf(s) === 0 && base.length > s.length) return { ini: s, fin: base.slice(s.length) };
  }
  return { ini: '', fin: base };
}
function ciTone(p) {
  for (const c of p) { const t = ctx.PY.toneOf(c); if (t) return t; }
  return 0;
}
let ciTotal = 0;
const ciGrp = { bdp: 0, jqx: 0, zcs: 0 };
['yw-1a', 'yw-1b'].forEach(bid => {
  const b = ctx.CONTENT[bid];
  let n = 0, bad = 0;
  const stems = {};
  b.units.forEach(u => u.nodes.forEach(nd => {
    const mine = nd.items.filter(it => it.skill === '拼音.易混声母');
    if (mine.length > 1) { bad++; err(`${CN[bid]} ${nd.id} 一场出现了 ${mine.length} 道易混声母题`); }
    mine.forEach(it => {
      n++; ciTotal++;
      const opts = it.options || [];
      const correct = opts[it.answer];
      if (opts.length < 3 || new Set(opts).size !== opts.length) { bad++; err(`${it.id} 选项不足或重复`); return; }
      if (stems[it.stem]) { bad++; err(`${it.id} 同册题干重复：${it.stem}`); }
      stems[it.stem] = 1;
      if (/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(it.stem)) { bad++; err(`${it.id} 题干含拼音，答案被泄露`); }
      if (opts.some(o => it.stem.indexOf(o) >= 0)) { bad++; err(`${it.id} 题干里直接写了正确选项`); }
      if ((it.explain || '').indexOf(correct) < 0) { bad++; err(`${it.id} 解析没写正确答案`); }
      if (!ciTone(correct)) { bad++; err(`${it.id} 正确项没有声调`); }
      const parts = opts.map(o => ({ o, sp: ciSplit(ctx.PY.stripTone(o)), t: ciTone(o) }));
      const fin0 = parts[0].sp.fin, t0 = parts[0].t;
      if (CI_FINS.indexOf(fin0) < 0) { bad++; err(`${it.id} 韵母 ${fin0} 不在允许范围`); }
      const inis = [];
      parts.forEach(p => {
        if (p.sp.fin !== fin0) { bad++; err(`${it.id} 选项 ${p.o} 韵母不同`); }
        if (p.t !== t0) { bad++; err(`${it.id} 选项 ${p.o} 声调不同`); }
        if (CI_SM.indexOf(p.sp.ini) < 0) { bad++; err(`${it.id} 选项 ${p.o} 声母不在易混组`); }
        if (!(CI_ALLOW[fin0] || []).includes(p.sp.ini)) { bad++; err(`${it.id} 选项 ${p.o} 不是合法拼合`); }
        inis.push(p.sp.ini);
      });
      if (new Set(inis).size !== inis.length) { bad++; err(`${it.id} 两个选项声母相同`); }
      // 按正确项所在组统计覆盖，保证三组都有题
      const gCorrect = CI_GROUPS.findIndex(g => g.includes(ciSplit(ctx.PY.stripTone(correct)).ini));
      if (gCorrect === 0) ciGrp.bdp++;
      else if (gCorrect === 1) ciGrp.jqx++;
      else if (gCorrect === 2) ciGrp.zcs++;
    });
  }));
  if (n < 20) err(`${CN[bid]} 易混声母题只有 ${n} 道，覆盖不足`);
  if (bad) err(`${CN[bid]} 易混声母题有 ${bad} 处异常`);
  console.log(`  ${CN[bid]}：${n} 道，质量 ${bad ? '✗' : '✓'}`);
});
if (ciTotal < 60) err(`易混声母题总共只有 ${ciTotal} 道`);
Object.keys(ciGrp).forEach(k => { if (ciGrp[k] < 5) err(`声母组 ${k} 只出了 ${ciGrp[k]} 道，覆盖不足`); });
console.log(`  合计 ${ciTotal} 道；声母组覆盖 b/d/p ${ciGrp.bdp} / j/q/x ${ciGrp.jqx} / 平翘舌 ${ciGrp.zcs}`);

console.log('\n=== 比较式填数（□ + 2 < 5） ===');
let cmpN = 0, cmpBad = 0, cmpRange = 0;
const cover = { 加: 0, 减: 0, 挖第一个数: 0, 挖第二个数: 0, 算式在左: 0, 算式在右: 0, 求最大: 0, 求最小: 0 };
const perBook = {};
const seenSig = new Map();
['sx-1a', 'sx-1b'].forEach(bid => {
  const b = ctx.CONTENT[bid];
  if (!b) return;
  let nodes = 0, covered = 0, minPer = 9, maxPer = 0;
  b.units.forEach(u => u.nodes.forEach(n => {
    nodes++;
    const cs = n.items.filter(it => it.fig && it.fig.type === 'cmp');
    if (cs.length) { covered++; minPer = Math.min(minPer, cs.length); maxPer = Math.max(maxPer, cs.length); }
    cs.forEach(it => {
      cmpN++;
      const chk = ctx.SXBuilder.checkIneq(it);
      if (!chk.ok) { cmpBad++; err(`${it.id} ${it.stem} → ${chk.msg}`); }
      const f = it.fig;
      const top = f.max || ctx.SXBuilder.INEQ_MAX;
      [f.a, f.b, f.c].forEach(v => {
        if (v !== null && v !== undefined && (v < 0 || v > top)) {
          cmpRange++;
          err(`${it.id} 数值超出 ${top} 以内：${v}`);
        }
      });
      if ((f.a === null) === (f.b === null)) err(`${it.id} 空格数量不对`);
      if (['<', '>'].indexOf(f.cmp) < 0) err(`${it.id} 比较符异常：${f.cmp}`);
      const sig = [bid, f.op, f.a, f.b, f.c, f.cmp, f.side, f.ask].join(' ');
      if (seenSig.has(sig)) err(`${it.id} 与 ${seenSig.get(sig)} 完全重复`);
      else seenSig.set(sig, it.id);
      cover[f.op === '+' ? '加' : '减']++;
      cover[f.a === null ? '挖第一个数' : '挖第二个数']++;
      cover[f.side === 'rhs' ? '算式在右' : '算式在左']++;
      cover[f.ask === 'max' ? '求最大' : '求最小']++;
    });
  }));
  perBook[CN[bid]] = { nodes, covered, minPer: covered ? minPer : 0, maxPer };
});
console.log(`共 ${cmpN} 题，答案错 ${cmpBad} 处，超范围 ${cmpRange} 处`);
Object.keys(perBook).forEach(k => {
  const p = perBook[k];
  console.log(`  ${k}：${p.nodes} 个练习，${p.covered} 个带这类题（每个 ${p.minPer}~${p.maxPer} 道）`);
});
console.log('覆盖：' + Object.keys(cover).map(k => k + ' ' + cover[k]).join(' / '));

console.log('\n=== 思维挑战题（第 9/10 周试卷同款） ===');
const chStems = new Set(), cmpStems = new Set(), chKinds = {};
let chN = 0, chDup = 0, chBad = 0, cmpDup = 0;
BOOKS.forEach(bid => {
  const b = ctx.CONTENT[bid];
  if (!b) return;
  b.units.forEach(u => u.nodes.forEach(n => n.items.forEach(it => {
    // 比较式填数以前几十道都叫「□ 里最大能填几？」，现在每题都要带自己的算式
    // 按册去重即可：上下册是不同学期，同一道算式各出现一次是正常复习
    if (it.fig && it.fig.type === 'cmp') {
      const key = bid + '|' + it.stem;
      if (cmpStems.has(key)) { cmpDup++; err(`${it.id} 比较式题干重复：${it.stem}`); }
      cmpStems.add(key);
      return;
    }
    if (it.type !== 'challenge') return;
    chN++;
    // 干扰项最容易冒出还没学过的数：6~10 单元只能到 10，11~20 之后才放开到 20
    const cap = bid === 'sx-1a' ? ({ u2: 10, u3: 10, u4: 20, u5: 20, u6: 20 }[u.id] || 20) : 20;
    const allNums = (it.stem + ' ' + (it.options || []).join(' ')).match(/\d+/g) || [];
    if (Math.max(0, ...allNums.map(Number)) > cap) {
      chBad++; err(`${it.id} 超出本单元数域 ${cap}：${it.stem}`);
    }
    const kind = (it.skill || '').replace('思维挑战.', '');
    chKinds[kind] = (chKinds[kind] || 0) + 1;
    if (chStems.has(it.stem)) { chDup++; err(`${it.id} 挑战题题干重复：${it.stem}`); }
    chStems.add(it.stem);
    if (!it.options || it.options.length !== 4 || new Set(it.options).size !== 4 ||
      it.answer < 0 || it.answer >= it.options.length) {
      chBad++; err(`${it.id} 选项或答案下标异常`); return;
    }
    const ans = String(it.options[it.answer]);
    if (/^\d+$/.test(ans)) {
      if (!(it.explain || '').includes(ans)) { chBad++; err(`${it.id} 解析与答案不一致`); }
      // 「广播的 b」那种把答案写在题干里的送分题不能再出现
      if ((it.stem.match(/\d+/g) || []).includes(ans)) { chBad++; err(`${it.id} 题干直接含答案 ${ans}`); }
    }
    const m = it.stem.match(/(\d+) > □ > (\d+)/);
    if (m && it.stem.includes('下面哪个数能填')) {
      const hi = +m[1], lo = +m[2];
      const legal = it.options.filter(o => { const v = Number(o); return !isNaN(v) && v > lo && v < hi; });
      if (legal.length !== 1) { chBad++; err(`${it.id} 有 ${legal.length} 个合法选项：${it.options.join('/')}`); }
    }
  })));
});
console.log(`共 ${chN} 题 / ${Object.keys(chKinds).length} 类：${Object.keys(chKinds).map(k => k + ' ' + chKinds[k]).join(' / ')}`);
if (chN < 100) err(`思维挑战题只有 ${chN} 道，铺题不足`);
if (chDup || chBad) err(`思维挑战题还有 ${chDup + chBad} 处问题`);
if (cmpDup) err(`比较式填数题干重复 ${cmpDup} 道`);
console.log(`比较式题干 ${cmpStems.size} 道互不相同；挑战题题干唯一、答案唯一、解析一致`);

console.log('\n=== 单元知识点题（试卷变式 + 后段单元同步题） ===');
const PACK_CAP = {
  'sx-1a': { u0: 5, u1: 5, u2: 10, u3: 10, u4: 20, u5: 20, u6: 20 },
  'sx-1b': { u1: 20, u2: 20, u3: 20, u4: 100, u5: 100, u6: 100, u7: 100, u8: 100 }
};
const PR = ctx.SXBuilder.PACK_RULES;
const upStems = new Set(), upKinds = {}, upByUnit = {};
let upN = 0, upBad = 0;
['sx-1a', 'sx-1b'].forEach(bid => {
  const tag = bid.slice(-2), capOf = PACK_CAP[bid];
  ctx.CONTENT[bid].units.forEach(u => u.nodes.forEach(n => n.items.forEach(it => {
    if (it.type !== 'unit') return;
    upN++;
    const key = (it.skill || '').replace('单元题.', '');
    upKinds[key] = (upKinds[key] || 0) + 1;
    const uk = bid + '/' + u.id;
    upByUnit[uk] = (upByUnit[uk] || 0) + 1;
    const cap = capOf[u.id] || 20;
    const allow = PR[tag + '|' + u.id] || [];
    if (allow.indexOf(key) < 0) { upBad++; err(`${it.id} 知识点 ${key} 不属于 ${uk}`); }
    if (upStems.has(it.stem)) { upBad++; err(`${it.id} 单元题题干重复：${it.stem}`); }
    upStems.add(it.stem);
    const o = it.options || [];
    if (o.length !== 4 || new Set(o).size !== 4) { upBad++; err(`${it.id} 选项不是 4 个互异值`); return; }
    const ans = String(o[it.answer]);
    if (/^\d+$/.test(ans)) {
      if ((it.stem.match(/\d+/g) || []).includes(ans)) { upBad++; err(`${it.id} 题干直接含答案 ${ans}`); }
      if (!(it.explain || '').includes(ans)) { upBad++; err(`${it.id} 解析与答案不一致`); }
    }
    const nums = (it.stem + ' ' + o.join(' ')).match(/\d+/g) || [];
    if (Math.max(0, ...nums.map(Number)) > cap) { upBad++; err(`${it.id} 超出本单元数域 ${cap}：${it.stem}`); }
    if (o.some(s => /以上都不对/.test(String(s)))) { upBad++; err(`${it.id} 占位干扰项`); }
  })));
});
console.log(`共 ${upN} 题 / ${Object.keys(upKinds).length} 类知识点：${Object.keys(upKinds).sort().map(k => k + ' ' + upKinds[k]).join(' / ')}`);
if (upN < 150) err(`单元知识点题只有 ${upN} 道，铺题不足`);
if (Object.keys(upKinds).length < 20) err(`知识点只覆盖 ${Object.keys(upKinds).length} 类`);
if (upBad) err(`单元知识点题还有 ${upBad} 处问题`);
console.log('单元题题干跨册唯一、答案唯一、解析一致、知识点与单元匹配、数域跟着教材');

console.log('\n=== 抽样 ===');
const sample = ctx.CONTENT['yw-1b'].units[0].nodes[0].items.slice(0, 2)
  .concat(ctx.CONTENT['sx-1b'].units[1].nodes[0].items.slice(0, 2));
sample.forEach(it => {
  console.log(`[${it.module}] ${it.stem}`);
  if (it.options) console.log('    ' + it.options.map((o, i) => (i === it.answer ? '[' + o + ']' : o)).join(' | '));
  else console.log('    答案：' + it.answer + (it.unit || ''));
  console.log('    ' + it.explain);
});

console.log('\n=== 结果 ===');
console.log(errors === 0 ? '✅ 全部通过' : `❌ 共 ${errors} 处问题`);
process.exit(errors ? 1 : 0);
