@echo off
chcp 65001 >nul
title 宝贝每日一练 - 本地服务器
cd /d "%~dp0"
set PORT=18080

echo.
echo   ===============================================
echo    宝贝每日一练 · 本地服务器
echo    启动后会自动打开浏览器，关闭本窗口即停止
echo   ===============================================
echo.

where python >nul 2>nul
if %errorlevel%==0 (
  echo   [1/2] 正在启动 http://127.0.0.1:%PORT%/
  start "" "http://127.0.0.1:%PORT%/index.html"
  python -m http.server %PORT% --bind 127.0.0.1
  goto :eof
)

where node >nul 2>nul
if %errorlevel%==0 (
  echo   [1/2] 正在启动 http://127.0.0.1:%PORT%/
  start "" "http://127.0.0.1:%PORT%/index.html"
  node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};http.createServer((q,s)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/'||f==='')f='/index.html';const p=path.join(process.cwd(),f);fs.readFile(p,(e,d)=>{if(e){s.writeHead(404);s.end('404');return}s.writeHead(200,{'Content-Type':mime[path.extname(p).toLowerCase()]||'application/octet-stream'});s.end(d)})}).listen(+process.env.PORT||18080,'127.0.0.1',()=>console.log('  [2/2] 服务已启动，按 Ctrl+C 停止'));"
  goto :eof
)

echo   [!] 没有找到 python 或 node，请直接双击 index.html
echo       （功能都能用，但照片只能存最近 40 张）
pause
