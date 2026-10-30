/* 内容自检：在 Node 里加载内容包，检查唯一性 / 超纲 / 答案有效性 / 计算题占比 */
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const root = path.resolve(__dirname, '..');
const ctx = { console, setTimeout, clearTimeout, Math, Date, JSON };
ctx.window = ctx;
ctx.document = {
  createElement: () => ({ style: {}, setAttribute() { }, appendChild() { }, addEventListener() { } }),
  getElementById: () => null,
  addEventListener() { }
};
vm.createContext(ctx);

function load(rel) {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  vm.runInContext(code, ctx, { filename: rel });
}

load('assets/js/util.js');
load('content/chars-db.js');
load('content/writing-1a.js');
load('content/yw-1a.js');
load('content/sx-1a.js');

let errors = 0;
const err = (m) => { errors++; console.log('  ✗ ' + m); };

const yw = ctx.CONTENT['yw-1a'];
const sx = ctx.CONTENT['sx-1a'];

console.log('=== 内容包概况 ===');
console.log(`语文：${yw.units.length} 单元 / ${yw.nodeCount} 节点 / ${yw.itemCount} 题`);
console.log(`数学：${sx.units.length} 单元 / ${sx.nodeCount} 节点 / ${sx.itemCount} 题`);
console.log(`写字表：${ctx.WRITING_TABLE.length} 字`);

function checkItems(subject, book) {
  const ids = new Set();
  const skills = {};
  let total = 0, calc = 0;
  book.units.forEach(u => u.nodes.forEach(n => {
    if (!n.items.length) err(`${subject} ${u.id}/${n.id} 无题目`);
    if (n.items.length !== (subject === '语文' ? 11 : 5)) err(`${subject} ${u.id}/${n.id} 题量=${n.items.length}`);
    n.items.forEach(it => {
      total++;
      if (ids.has(it.id)) err(`重复 id ${it.id}`);
      ids.add(it.id);
      if (!it.stem) err(`${it.id} 缺题干`);
      if (it.stem && it.stem.length > (subject === '语文' ? 26 : 34)) err(`${it.id} 题干过长(${it.stem.length})：${it.stem}`);
      if (!it.explain) err(`${it.id} 缺解析`);
      if (it.options) {
        if (it.options.length < 2) err(`${it.id} 选项不足`);
        if (new Set(it.options).size !== it.options.length) err(`${it.id} 选项重复：${it.options.join('/')}`);
        if (it.answer === undefined || it.answer < 0 || it.answer >= it.options.length) err(`${it.id} 答案越界`);
      }
      skills[it.skill] = (skills[it.skill] || 0) + 1;
      if (it.module === 'math' && it.type === 'calc') calc++;
    });
  }));
  return { total, calc, skills };
}

console.log('\n=== 语文校验 ===');
const y = checkItems('语文', yw);
console.log(`题量 ${y.total}，知识点 ${Object.keys(y.skills).length} 类`);

console.log('\n=== 数学校验 ===');
const m = checkItems('数学', sx);
const ratio = m.calc / m.total;
console.log(`题量 ${m.total}，纯计算题 ${m.calc}（${(ratio * 100).toFixed(1)}%，红线 ≤20%）`);
if (ratio > 0.2) err(`纯计算题占比 ${(ratio * 100).toFixed(1)}% 超红线`);

console.log('\n=== 抽样 ===');
const sample = yw.units[1].nodes[0].items.slice(0, 3).concat(sx.units[1].nodes[0].items.slice(0, 2));
sample.forEach(it => {
  console.log(`[${it.module}] ${it.stem}`);
  if (it.options) console.log('    ' + it.options.map((o, i) => (i === it.answer ? '[' + o + ']' : o)).join(' | '));
  else console.log('    答案：' + it.answer + (it.unit || ''));
  console.log('    ' + it.explain);
});

console.log('\n=== 结果 ===');
console.log(errors === 0 ? '✅ 全部通过' : `❌ ${errors} 处问题`);
process.exit(errors ? 1 : 0);
