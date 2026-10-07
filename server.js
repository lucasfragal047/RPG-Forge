const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const root = __dirname;
const server = http.createServer((req,res)=>{
  let file = req.url === '/' ? 'index.html' : req.url.replace(/^\//,'');
  file = path.normalize(file);
  if (file.includes('..')) { res.writeHead(403); return res.end('Forbidden'); }
  const full = path.join(root,file);
  fs.readFile(full,(err,data)=>{
    if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Arquivo não encontrado');}
    const ext=path.extname(full).toLowerCase();
    const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};
    res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});res.end(data);
  });
});
server.listen(PORT,()=>console.log(`RPG Forge rodando em http://localhost:${PORT}`));
