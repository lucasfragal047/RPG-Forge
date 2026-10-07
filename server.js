const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const port = Number(process.env.PORT || 3000);
const root = path.join(__dirname, 'public');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.json':'application/json; charset=utf-8','.ico':'image/x-icon'};

// Canal simples de sincronização de Som / efeito entre todos os navegadores conectados.
// Usa Server-Sent Events para receber os comandos e POST para enviá-los.
const soundClients = new Set();
let soundState = { seq: 0, action: 'stop', item: null, at: Date.now() };

function broadcastPresence(){
  const payload={count:soundClients.size,at:Date.now()};
  const data='event: presence\ndata: '+JSON.stringify(payload)+'\n\n';
  for(const client of [...soundClients]){
    try{client.write(data)}catch(_){soundClients.delete(client)}
  }
}

function json(res, status, body){
  const out = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type':'application/json; charset=utf-8',
    'Cache-Control':'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin':'*',
    'Access-Control-Allow-Headers':'Content-Type'
  });
  res.end(out);
}
function broadcastSound(payload){
  const data = 'event: sound-sync\ndata: '+JSON.stringify(payload)+'\n\n';
  for(const client of [...soundClients]){
    try{client.write(data)}catch(_){soundClients.delete(client)}
  }
}
function handleSoundPost(req,res){
  let body='';
  req.on('data',chunk=>{
    body+=chunk;
    if(body.length>20000)req.destroy();
  });
  req.on('end',()=>{
    try{
      const msg=JSON.parse(body||'{}');
      if(msg.action==='play'){
        if(!msg.item || !msg.item.id || !msg.item.url){return json(res,400,{ok:false,error:'Som inválido.'})}
        soundState={seq:soundState.seq+1,action:'play',item:{id:String(msg.item.id),name:String(msg.item.name||'Som do YouTube'),url:String(msg.item.url)},clientId:msg.clientId?String(msg.clientId):null,commandId:msg.commandId?String(msg.commandId):null,at:Date.now()};
      }else if(msg.action==='stop'){
        soundState={seq:soundState.seq+1,action:'stop',item:null,clientId:msg.clientId?String(msg.clientId):null,commandId:msg.commandId?String(msg.commandId):null,at:Date.now()};
      }else{
        return json(res,400,{ok:false,error:'Ação inválida.'});
      }
      broadcastSound(soundState);
      return json(res,200,{ok:true,seq:soundState.seq});
    }catch(e){return json(res,400,{ok:false,error:'JSON inválido.'})}
  });
}

http.createServer((req,res)=>{
  if(req.url==='/api/health' && req.method==='GET') return json(res,200,{ok:true,service:'rpg-forge'});
  if(req.method==='OPTIONS'){
    res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type'});return res.end();
  }
  if(req.url==='/api/sound/events' && req.method==='GET'){
    res.writeHead(200,{
      'Content-Type':'text/event-stream; charset=utf-8',
      'Cache-Control':'no-cache, no-store, must-revalidate',
      'Connection':'keep-alive',
      'Access-Control-Allow-Origin':'*',
      'X-Accel-Buffering':'no'
    });
    soundClients.add(res);
    res.write('event: sound-sync\ndata: '+JSON.stringify(soundState)+'\n\n');
    broadcastPresence();
    const heartbeat=setInterval(()=>{try{res.write(': heartbeat\n\n')}catch(_){clearInterval(heartbeat)}},25000);
    req.on('close',()=>{clearInterval(heartbeat);soundClients.delete(res);broadcastPresence()});
    return;
  }
  if(req.url==='/api/sound/state' && req.method==='GET') return json(res,200,{ok:true,...soundState});
  if(req.url==='/api/sound' && req.method==='POST') return handleSoundPost(req,res);

  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end('Bad Request');}
  if(pathname==='/'||pathname==='') pathname='/index.html';
  const file=path.normalize(path.join(root,pathname));
  if(!file.startsWith(root)){res.writeHead(403);return res.end('Forbidden');}
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){res.writeHead(404);return res.end('Not Found');}
    res.writeHead(200,{'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache'});
    fs.createReadStream(file).pipe(res);
  });
}).listen(port,'0.0.0.0',()=>{
  console.log(`RPG Forge rodando em http://127.0.0.1:${port}`);
  const nets=os.networkInterfaces();
  for(const [name,items] of Object.entries(nets)) for(const n of (items||[])) if(n.family==='IPv4'&&!n.internal) console.log(`Na rede: http://${n.address}:${port}`);
});
