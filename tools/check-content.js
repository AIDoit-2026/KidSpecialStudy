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

  b.units.forEach(u => {
    if (!u.nodes.length) err(`${CN[bid]} ${u.id} 没有节点`);
    u.nodes.forEach(n => {
      if (n.items.length !== wantPerNode) err(`${CN[bid]} ${u.id}/${n.id} 题量=${n.items.length}（应 ${wantPerNode}）`);
      n.items.forEach(it => {
        total++;
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

console.log('\n=== 比较式填数（□ + 2 < 5） ===');
let cmpN = 0, cmpBad = 0, cmpRange = 0;
const cover = { 加: 0, 减: 0, 挖第一个数: 0, 挖第二个数: 0, 算式在左: 0, 算式在右: 0, 求最大: 0, 求最小: 0 };
['sx-1a', 'sx-1b'].forEach(bid => {
  const b = ctx.CONTENT[bid];
  if (!b) return;
  b.units.forEach(u => u.nodes.forEach(n => n.items.forEach(it => {
    if (!it.fig || it.fig.type !== 'cmp') return;
    cmpN++;
    const chk = ctx.SXBuilder.checkIneq(it);
    if (!chk.ok) { cmpBad++; err(`${it.id} ${it.stem} → ${chk.msg}`); }
    const f = it.fig;
    [f.a, f.b, f.c].forEach(v => {
      if (v !== null && v !== undefined && (v < 0 || v > ctx.SXBuilder.INEQ_MAX)) {
        cmpRange++;
        err(`${it.id} 数值超出 10 以内：${v}`);
      }
    });
    if ((f.a === null) === (f.b === null)) err(`${it.id} 空格数量不对`);
    if (['<', '>'].indexOf(f.cmp) < 0) err(`${it.id} 比较符异常：${f.cmp}`);
    cover[f.op === '+' ? '加' : '减']++;
    cover[f.a === null ? '挖第一个数' : '挖第二个数']++;
    cover[f.side === 'rhs' ? '算式在右' : '算式在左']++;
    cover[f.ask === 'max' ? '求最大' : '求最小']++;
  })));
});
console.log(`共 ${cmpN} 题，答案错 ${cmpBad} 处，超范围 ${cmpRange} 处`);
console.log('覆盖：' + Object.keys(cover).map(k => k + ' ' + cover[k]).join(' / '));

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
