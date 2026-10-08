const http=require('http');
const fs=require('fs');
const path=require('path');
const {Server}=require('socket.io');
const PORT=process.env.PORT||3000;
const publicDir=path.join(__dirname,'public');
const rooms=new Map();
const soundLibrary=new Map();
const soundSse=new Set();
let soundSeq=0;
function sseSend(res,event,data){try{res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)}catch(e){}}
function broadcastSound(event,data){for(const res of soundSse)sseSend(res,event,data)}
function publicSounds(){return [...soundLibrary.values()]}
const CODE='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode(){let c='';do{c='';for(let i=0;i<4;i++)c+=CODE[Math.floor(Math.random()*CODE.length)]}while(rooms.has(c));return c}
function newPage(id,name){return{id,name,locked:false,allowedPlayers:[],state:null}}
function cleanName(v){return String(v||'Jogador').trim().slice(0,40)||'Jogador'}
function roomState(room,me){return{role:me?.role||'player',roomCode:room.code,currentPageId:me?.pageId||room.pages[0].id,pages:room.pages.map(p=>({id:p.id,name:p.name,locked:p.locked,allowedPlayers:p.allowedPlayers.slice()})),players:[...room.players.values()].map(p=>({id:p.clientId,name:p.name,role:p.role,pageId:p.pageId}))}}
function broadcast(room){for(const p of room.players.values())io.to(p.socketId).emit('pagina-atualizada',roomState(room,p))}
function gm(socket,room){const p=room.players.get(socket.id);return !!p&&p.role==='gm'}
function defaultPage(room){return room.pages.find(p=>!p.locked)||room.pages[0]}
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent(req.url.split('?')[0]);
  if(u==='/api/sounds'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify({sounds:publicSounds()}))}
  if(u==='/api/sound/events'&&req.method==='GET'){res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-store','Connection':'keep-alive','Access-Control-Allow-Origin':'*'});res.write(': connected\n\n');soundSse.add(res);sseSend(res,'presence',{count:soundSse.size});sseSend(res,'sound-library',{sounds:publicSounds()});req.on('close',()=>{soundSse.delete(res);broadcastSound('presence',{count:soundSse.size})});return}
  if(u==='/api/sound'&&req.method==='POST'){let body='';req.on('data',c=>body+=c);req.on('end',()=>{try{const d=JSON.parse(body||'{}');soundSeq++;broadcastSound('sound-sync',{...d,seq:soundSeq});res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,seq:soundSeq}))}catch(e){res.writeHead(400).end('JSON inválido')}});return}
  if(u==='/api/sounds'&&req.method==='POST'){let body='';req.on('data',c=>body+=c);req.on('end',()=>{try{const item=JSON.parse(body||'{}');const id=String(item.id||('sound-'+Date.now()+'-'+Math.random().toString(36).slice(2,7)));const clean={id,name:String(item.name||'Som do YouTube').slice(0,120),url:String(item.url||'').slice(0,1000)};if(!clean.url)return res.writeHead(400).end('URL ausente');soundLibrary.set(id,clean);broadcastSound('sound-library',{sounds:publicSounds()});res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,sound:clean}))}catch(e){res.writeHead(400).end('JSON inválido')}});return}
  if(u.startsWith('/api/sounds/')&&req.method==='DELETE'){const id=decodeURIComponent(u.slice('/api/sounds/'.length));soundLibrary.delete(id);broadcastSound('sound-library',{sounds:publicSounds()});res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true}))}
  let fileUrl=u;if(fileUrl==='/')fileUrl='/index.html';const file=path.normalize(path.join(publicDir,fileUrl));if(!file.startsWith(publicDir))return res.writeHead(403).end();fs.readFile(file,(e,d)=>{if(e)return res.writeHead(404).end('Not found');const ext=path.extname(file);const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};res.writeHead(200,{'Content-Type':types[ext]||'application/octet-stream'});res.end(d)})
});
const io=new Server(server,{cors:{origin:true,credentials:true}});
io.on('connection',socket=>{
 socket.on('criar-sala',({clientId,nome}={})=>{
   if(!clientId)return socket.emit('sala-erro','Identidade do Mestre inválida.');
   const code=makeCode();const room={code,ownerClientId:clientId,pages:[newPage('page-1','Mapa 1')],players:new Map()};rooms.set(code,room);
   const p={socketId:socket.id,clientId,name:cleanName(nome||'Mestre'),role:'gm',pageId:room.pages[0].id};room.players.set(socket.id,p);socket.data.room=code;socket.join(code);
   socket.emit('sala-criada',{sala:code});socket.emit('sala-estado',roomState(room,p));
 });
 socket.on('entrar-sala',({sala,clientId,nome}={})=>{
   sala=String(sala||'').toUpperCase();const room=rooms.get(sala);if(!room)return socket.emit('sala-erro','Sala não encontrada. O Mestre precisa criá-la primeiro.');
   const existing=[...room.players.values()].find(p=>p.clientId===clientId);const page=existing?room.pages.find(p=>p.id===existing.pageId)||defaultPage(room):defaultPage(room);
   const p={socketId:socket.id,clientId:clientId||socket.id,name:cleanName(nome),role:clientId===room.ownerClientId?'gm':'player',pageId:page.id};
   if(p.role==='gm')room.ownerClientId=clientId;room.players.set(socket.id,p);if(p.role==='player'&&!page.allowedPlayers.includes(clientId))page.allowedPlayers.push(clientId);
   socket.data.room=sala;socket.join(sala);socket.emit('sala-estado',roomState(room,p));
   if(page.state)socket.emit('pagina-estado',{pageId:page.id,state:page.state});broadcast(room);
 });
 socket.on('pagina-trocar',({sala,pageId})=>{const room=rooms.get(String(sala||'').toUpperCase());const me=room?.players.get(socket.id);const pg=room?.pages.find(p=>p.id===pageId);if(!room||!me||!pg)return;if(me.role!=='gm'&&(pg.locked||!pg.allowedPlayers.includes(me.clientId))){return socket.emit('pagina-acesso-negado','O Mestre não liberou este mapa para você.')}me.pageId=pg.id;socket.emit('pagina-troca-confirmada',{pageId:pg.id});if(pg.state)socket.emit('pagina-estado',{pageId:pg.id,state:pg.state});broadcast(room)});
 socket.on('pagina-salvar-estado',({sala,pageId,state})=>{const room=rooms.get(String(sala||'').toUpperCase());const me=room?.players.get(socket.id);const pg=room?.pages.find(p=>p.id===pageId);if(!room||!me||!pg||!state||typeof state.html!=='string')return;if(JSON.stringify(state).length>6000000)return;if(me.role!=='gm'&&(pg.locked||me.pageId!==pg.id))return;pg.state=state;for(const p of room.players.values())if(p.pageId===pg.id&&p.socketId!==socket.id)io.to(p.socketId).emit('pagina-estado',{pageId:pg.id,state})});
 socket.on('pagina-criar',({sala,name}={})=>{const room=rooms.get(String(sala||'').toUpperCase());if(!room||!gm(socket,room))return socket.emit('sala-erro','Apenas o Mestre pode criar mapas.');const id='page-'+Date.now()+'-'+Math.random().toString(36).slice(2,7);room.pages.push(newPage(id,cleanName(name||`Mapa ${room.pages.length+1}`)));broadcast(room);socket.emit('pagina-troca-confirmada',{pageId:id})});
 socket.on('pagina-renomear',({sala,pageId,name}={})=>{const room=rooms.get(String(sala||'').toUpperCase());if(!room||!gm(socket,room))return;const p=room.pages.find(x=>x.id===pageId);if(p)p.name=cleanName(name||p.name);broadcast(room)});
 socket.on('pagina-excluir',({sala,pageId}={})=>{const room=rooms.get(String(sala||'').toUpperCase());if(!room||!gm(socket,room)||room.pages.length<=1)return;const fallback=room.pages.find(p=>p.id!==pageId);room.pages=room.pages.filter(p=>p.id!==pageId);for(const p of room.players.values())if(p.pageId===pageId){p.pageId=fallback.id;io.to(p.socketId).emit('pagina-troca-confirmada',{pageId:fallback.id});if(fallback.state)io.to(p.socketId).emit('pagina-estado',{pageId:fallback.id,state:fallback.state})}broadcast(room)});
 socket.on('pagina-travar',({sala,pageId,locked}={})=>{const room=rooms.get(String(sala||'').toUpperCase());if(!room||!gm(socket,room))return socket.emit('sala-erro','Apenas o Mestre pode travar mapas.');const p=room.pages.find(x=>x.id===pageId);if(!p)return; p.locked=!!locked;if(p.locked){const fallback=defaultPage(room);for(const pl of room.players.values()){if(pl.role==='player'&&pl.pageId===p.id){pl.pageId=fallback.id;io.to(pl.socketId).emit('pagina-troca-confirmada',{pageId:fallback.id});if(fallback.state)io.to(pl.socketId).emit('pagina-estado',{pageId:fallback.id,state:fallback.state})}}}broadcast(room)});
 socket.on('pagina-atribuir',({sala,pageId,playerId}={})=>{const room=rooms.get(String(sala||'').toUpperCase());if(!room||!gm(socket,room))return;const pg=room.pages.find(p=>p.id===pageId);const pl=[...room.players.values()].find(p=>p.clientId===playerId);if(!pg||!pl||pl.role==='gm'||pg.locked)return;for(const p of room.pages)p.allowedPlayers=p.allowedPlayers.filter(id=>id!==pl.clientId);pg.allowedPlayers.push(pl.clientId);pl.pageId=pg.id;io.to(pl.socketId).emit('pagina-troca-confirmada',{pageId:pg.id});if(pg.state)io.to(pl.socketId).emit('pagina-estado',{pageId:pg.id,state:pg.state});broadcast(room)});
 socket.on('modo-role',({sala,role}={})=>{const room=rooms.get(String(sala||'').toUpperCase());const me=room?.players.get(socket.id);if(!room||!me)return;me.role=role==='gm'?'gm':'player';broadcast(room)});
 socket.on('disconnect',()=>{const code=socket.data.room,room=rooms.get(code);if(!room)return;room.players.delete(socket.id);if(room.players.size>0)broadcast(room)});
});
server.listen(PORT,()=>console.log(`RPG Forge em http://localhost:${PORT}`));
