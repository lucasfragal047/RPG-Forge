const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let requestPath;
  try { requestPath = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch { res.writeHead(400); return res.end('Bad request'); }
  if (requestPath === '/') requestPath = '/index.html';

  const file = path.normalize(path.join(publicDir, requestPath));
  if (!file.startsWith(publicDir + path.sep) && file !== publicDir) {
    res.writeHead(403); return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      if (requestPath !== '/index.html') return res.writeHead(404).end('Not found');
      return res.writeHead(404).end('index.html not found');
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`RPG Forge rodando em http://localhost:${PORT} — sem sistema de salas`));
