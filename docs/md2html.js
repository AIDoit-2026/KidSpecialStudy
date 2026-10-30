const fs = require('fs');
const path = require('path');

const src = process.argv[2];
const out = process.argv[3];
const title = process.argv[4] || '设计文档';

const md = fs.readFileSync(src, 'utf8').replace(/\r\n/g, '\n');

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, (m, c) => '<code>' + c + '</code>');
  t = t.replace(/\*\*([^*]+)\*\*/g, (m, c) => '<strong>' + c + '</strong>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, a, b) => '<a href="' + b + '">' + a + '</a>');
  return t;
}

const lines = md.split('\n');
const html = [];
let i = 0;
let h2n = 0;

while (i < lines.length) {
  const line = lines[i];

  // fenced code
  if (/^```/.test(line)) {
    const lang = line.slice(3).trim();
    const buf = [];
    i++;
    while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
    i++;
    html.push('<pre class="code' + (lang ? ' lang-' + lang : '') + '"><code>' + esc(buf.join('\n')) + '</code></pre>');
    continue;
  }

  // heading
  const h = line.match(/^(#{1,4})\s+(.*)$/);
  if (h) {
    const lv = h[1].length;
    let text = h[2];
    let id = '';
    if (lv === 1) { html.push('<h1>' + inline(text) + '</h1>'); i++; continue; }
    if (lv === 2) { h2n++; id = 'h' + h2n; }
    html.push('<h' + lv + (id ? ' id="' + id + '"' : '') + '>' + inline(text) + '</h' + lv + '>');
    i++;
    continue;
  }

  // table
  if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
    const parseRow = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    const head = parseRow(line);
    i += 2;
    const rows = [];
    while (i < lines.length && /^\|/.test(lines[i])) { rows.push(parseRow(lines[i])); i++; }
    let t = '<div class="tw"><table><thead><tr>';
    head.forEach((c) => { t += '<th>' + inline(c) + '</th>'; });
    t += '</tr></thead><tbody>';
    rows.forEach((r) => {
      t += '<tr>';
      for (let k = 0; k < head.length; k++) t += '<td>' + inline(r[k] === undefined ? '' : r[k]) + '</td>';
      t += '</tr>';
    });
    t += '</tbody></table></div>';
    html.push(t);
    continue;
  }

  // hr
  if (/^---+$/.test(line.trim())) { html.push('<hr>'); i++; continue; }

  // blockquote
  if (/^>\s?/.test(line)) {
    const buf = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
    html.push('<blockquote>' + inline(buf.join('<br>')) + '</blockquote>');
    continue;
  }

  // unordered list
  if (/^-\s+/.test(line)) {
    const buf = [];
    while (i < lines.length && /^-\s+/.test(lines[i])) { buf.push(lines[i].replace(/^-\s+/, '')); i++; }
    html.push('<ul>' + buf.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ul>');
    continue;
  }

  // ordered list
  if (/^\d+\.\s+/.test(line)) {
    const buf = [];
    while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { buf.push(lines[i].replace(/^\d+\.\s+/, '')); i++; }
    html.push('<ol>' + buf.map((x) => '<li>' + inline(x) + '</li>').join('') + '</ol>');
    continue;
  }

  // blank
  if (line.trim() === '') { i++; continue; }

  // paragraph (merge consecutive non-special lines)
  const buf = [line];
  i++;
  while (i < lines.length && lines[i].trim() !== '' &&
         !/^(#{1,4}\s|```|>\s?|-\s+|\d+\.\s+|\|)/.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
    buf.push(lines[i]);
    i++;
  }
  html.push('<p>' + inline(buf.join(' ')) + '</p>');
}

const css = `
:root{
  --pink:#FF6B9D; --blue:#4ECDC4; --yellow:#FFE66D; --green:#95E67E; --purple:#C47AFF;
  --ink:#2b2f36; --ink2:#5b6270; --line:#eceef2; --bg:#fbfbfd; --card:#fff;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  color:var(--ink); background:var(--bg); line-height:1.75; font-size:15px;
  -webkit-font-smoothing:antialiased;
}
.wrap{display:flex; max-width:1180px; margin:0 auto; padding:0 24px;}
nav{
  position:sticky; top:0; align-self:flex-start; width:230px; flex:0 0 230px;
  max-height:100vh; overflow:auto; padding:28px 12px 40px 0;
  border-right:1px solid var(--line);
}
nav .navtitle{font-size:12px;letter-spacing:.12em;color:#9aa1ad;margin:0 0 10px 10px}
nav a{
  display:block; padding:6px 10px; color:var(--ink2); text-decoration:none;
  font-size:13px; border-radius:8px; border-left:2px solid transparent;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
}
nav a:hover{background:#f4f5f8; color:var(--ink)}
nav a.lv3{padding-left:22px; font-size:12.5px; color:#8b93a1}
main{flex:1; min-width:0; padding:36px 0 80px 36px; max-width:860px}
h1{
  font-size:30px; line-height:1.3; margin:0 0 8px; letter-spacing:-.5px;
  background:linear-gradient(90deg,var(--pink),var(--purple));
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
h2{
  font-size:20px; margin:44px 0 14px; padding-top:14px; border-top:1px solid var(--line);
  letter-spacing:-.2px;
}
h2::before{content:""; display:inline-block; width:4px; height:16px; border-radius:2px;
  background:linear-gradient(180deg,var(--pink),var(--purple)); margin-right:10px; vertical-align:-2px;}
h3{font-size:16px; margin:26px 0 10px; color:#1f242b}
h4{font-size:14.5px; margin:20px 0 8px; color:var(--ink2)}
p{margin:10px 0}
a{color:#e0559a}
ul,ol{margin:10px 0; padding-left:22px}
li{margin:4px 0}
strong{color:#1b1f25}
code{
  background:#f3f1f8; color:#7a4bc4; padding:1.5px 6px; border-radius:5px;
  font-family:"JetBrains Mono",Consolas,Menlo,monospace; font-size:12.5px;
}
pre.code{
  background:#1e2430; color:#dfe6f3; padding:16px 18px; border-radius:12px;
  overflow:auto; font-size:12.5px; line-height:1.65; margin:14px 0;
  box-shadow:0 6px 18px rgba(30,36,48,.14);
}
pre.code code{background:none;color:inherit;padding:0;font-size:inherit}
blockquote{
  margin:16px 0; padding:12px 16px; background:#fff8db; border-left:3px solid var(--yellow);
  border-radius:0 10px 10px 0; color:#6b5a12;
}
blockquote code{background:#fff3bf}
hr{border:none; border-top:1px dashed #e2e5ec; margin:26px 0}
.tw{overflow-x:auto; margin:16px 0; border:1px solid var(--line); border-radius:12px; background:var(--card)}
table{border-collapse:collapse; width:100%; font-size:13.5px}
th{
  background:#faf7fb; text-align:left; font-weight:600; color:#4b3b56;
  padding:10px 12px; border-bottom:1px solid var(--line); white-space:nowrap;
}
td{padding:9px 12px; border-bottom:1px solid #f4f5f8; vertical-align:top; color:#3d434d}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fcfbfe}
.tag{display:inline-block;font-size:11px;padding:1px 7px;border-radius:999px;background:#f0e9fb;color:#7a4bc4;vertical-align:1px}
@media(max-width:920px){
  nav{display:none}
  main{padding:24px 0 60px; max-width:none}
  .wrap{padding:0 18px}
  h1{font-size:24px} h2{font-size:18px}
  body{font-size:14.5px}
}
@media print{
  nav{display:none} main{padding:0;max-width:none}
  pre.code{background:#f5f5f5;color:#222;box-shadow:none}
  h2{break-after:avoid}
}
`;

const body = html.join('\n');

const doc = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<style>${css}</style>
</head>
<body>
<div class="wrap">
<nav id="toc"><div class="navtitle">目录</div></nav>
<main>
${body}
</main>
</div>
<script>
(function(){
  var toc = document.getElementById('toc');
  var hs = document.querySelectorAll('main h2, main h3');
  hs.forEach(function(h){
    if(!h.id){
      h.id = 'auto-' + Math.random().toString(36).slice(2,8);
    }
    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    if(h.tagName === 'H3') a.className = 'lv3';
    toc.appendChild(a);
  });
  toc.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(!a) return;
    e.preventDefault();
    var t = document.querySelector(a.getAttribute('href'));
    if(t){ window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - 20, behavior:'smooth'}); }
  });
})();
</script>
</body>
</html>`;

fs.writeFileSync(out, doc, 'utf8');
console.log('written', out, (doc.length / 1024).toFixed(1) + ' KB');
