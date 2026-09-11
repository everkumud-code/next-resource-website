const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = process.env.PORT || 3000;

const injected = `\n<link rel="stylesheet" href="/site-fixes.css">\n<script src="/site-fixes.js" defer></script>\n`;

function contentType(file){
  const ext = path.extname(file).toLowerCase();
  return ({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'})[ext] || 'application/octet-stream';
}

const server = http.createServer((req,res)=>{
  let pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  if (pathname === '/') pathname = '/index.html';
  const file = path.join(root, pathname.replace(/^\/+/,''));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.readFile(file, 'utf8', (err,data)=>{
    if (err) {
      // SPA-style fallback for future pages: serve the same site shell.
      fs.readFile(path.join(root,'index.html'),'utf8',(e,html)=>{
        if(e){ res.writeHead(404); return res.end('Not found'); }
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        res.end(html.replace('</head>', injected + '</head>'));
      });
      return;
    }
    if (path.extname(file).toLowerCase() === '.html') data = data.replace('</head>', injected + '</head>');
    res.writeHead(200,{'Content-Type':contentType(file),'Cache-Control':'no-store'});
    res.end(data);
  });
});

server.listen(port,'0.0.0.0',()=>console.log(`Next Resource listening on ${port}`));
