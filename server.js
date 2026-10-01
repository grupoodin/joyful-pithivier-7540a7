const http = require('http');
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const port = 5502;
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css', '.js':'application/javascript', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.ico':'image/x-icon', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain', '.webp':'image/webp', '.json':'application/json' };
http.createServer((req, res) => {
  let p = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
  if (p === dir || p === dir + path.sep) p = path.join(dir, 'index.html');
  fs.readFile(p, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'text/plain' });
    res.end(data);
  });
}).listen(port, () => console.log('Serving on http://localhost:' + port));
