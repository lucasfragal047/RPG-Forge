const http=require('http');
const fs=require('fs');
const path=require('path');
const {Server}=require('socket.io');

const PORT=process.env.PORT||3000;
const publicDir=path.join(__dirname,'public');

const server=http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]);
  if(p==='/') p='/index.html';
  const file=path.normalize(path.join(publicDir,p));
  if(!file.startsWith(publicDir)){res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(err.code==='ENOENT'?404:500,{'Content-Type':'text/plain; charset=utf-8'});return res.end(err.code==='ENOENT'?'Not found':'Server error');}
    const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
    res.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream'});
    res.end(data);
  });
});
const io=new Server(server);
io.on('connection',socket=>{
  socket.on('entrar-sala',sala=>{if(!sala)return; socket.join(String(sala)); socket.to(String(sala)).emit('jogador-entrou',{id:socket.id});});
});
server.listen(PORT,()=>console.log(`RPG Forge rodando na porta ${PORT}`));
