/* 在 Node 里加载全部内容包，供其他脚本 / 自检复用 */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.resolve(__dirname, '..');

const FILES = [
  'assets/js/util.js',
  'content/chars-db.js', 'content/chars-db-1b.js',
  'content/py-presets.js', 'content/yw-builder.js', 'content/sx-builder.js',
  'content/writing-1a.js', 'content/writing-1b.js',
  'content/yw-1a.js', 'content/yw-1b.js',
  'content/sx-1a.js', 'content/sx-1b.js'
];

function load() {
  const ctx = { console, setTimeout, clearTimeout, Math, Date, JSON };
  ctx.window = ctx;
  ctx.document = {
    createElement: () => ({ style: {}, setAttribute() { }, appendChild() { }, addEventListener() { } }),
    getElementById: () => null,
    addEventListener() { }
  };
  vm.createContext(ctx);
  FILES.forEach(f => {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) { console.warn('缺文件:', f); return; }
    vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: f });
  });
  return ctx;
}
module.exports = { load, FILES, root };
