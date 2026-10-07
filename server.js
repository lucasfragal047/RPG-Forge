const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const rooms = new Map();
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeCode() {
  let code;
  do code = Array.from({length:4}, () => CODE_CHARS[Math.floor(Math.random()*CODE_CHARS.length)]).join('');
  while (rooms.has(code));
  return code;
}
function cleanName(v, fallback) { return String(v || fallback).slice(0,32); }
function publicRoom(room) {
  return {
    code: room.code,
    ownerId: room.ownerClientId,
    pages: [...room.pages.values()].map(p => ({ id:p.id, name:p.name, locked:!!p.locked })),
    players: [...room.players.values()].map(p => ({ clientId:p.clientId, name:p.name, role:p.role, pageId:p.pageId }))
  };
}
function publicPage(page) {
  if (!page) return null;
  return { id:page.id, name:page.name, locked:!!page.locked, state:page.state || null };
}
function roomOf(socket) { return socket.data.roomCode ? rooms.get(socket.data.roomCode) : null; }
function isGM(socket, room) { return !!room && socket.data.clientId === room.ownerClientId; }
function leaveSocketRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  if (!room) return;
  const p = room.players.get(socket.data.clientId);
  if (p && p.socketId === socket.id) room.players.delete(socket.data.clientId);
  socket.leave(code);
  socket.data.roomCode = null;
  if (room.players.size === 0) rooms.delete(code);
  else io.to(code).emit('sala-atualizada', publicRoom(room));
}
function sendRoomState(socket, room) {
  const p = room.players.get(socket.data.clientId);
  const page = room.pages.get(p?.pageId || room.defaultPageId) || [...room.pages.values()][0];
  if (p && !p.pageId) p.pageId = page.id;
  socket.emit('sala-estado', { room: publicRoom(room), role:isGM(socket,room)?'gm':'player', currentPageId:p?.pageId || page.id, page:publicPage(page) });
}

io.on('connection', socket => {
  socket.on('criar-sala', ({clientId, playerName} = {}, ack = () => {}) => {
    if (!clientId) return ack({ok:false,error:'Identificador do jogador ausente.'});
    leaveSocketRoom(socket);
    const code = makeCode();
    const pageId = 'page-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,7);
    const room = { code, ownerClientId:clientId, createdAt:Date.now(), defaultPageId:pageId, pages:new Map(), players:new Map() };
    room.pages.set(pageId, {id:pageId,name:'Mapa 1',locked:false,state:null});
    room.players.set(clientId, {clientId,socketId:socket.id,name:cleanName(playerName,'Mestre'),role:'gm',pageId});
    rooms.set(code,room);
    socket.data.clientId=clientId; socket.data.roomCode=code; socket.join(code);
    ack({ok:true,room:publicRoom(room),role:'gm'});
    sendRoomState(socket,room);
  });

  socket.on('entrar-sala', ({code, clientId, playerName} = {}, ack = () => {}) => {
    const normalized=String(code||'').trim().toUpperCase();
    if (!normalized || !clientId) return ack({ok:false,error:'Informe o código da sala.'});
    const room=rooms.get(normalized);
    if (!room) return ack({ok:false,error:'Sala não encontrada. Confira o código.'});
    leaveSocketRoom(socket);
    const old=room.players.get(clientId);
    const role=clientId===room.ownerClientId?'gm':'player';
    let pageId=old?.pageId || room.defaultPageId;
    if (!room.pages.has(pageId) || (role!=='gm' && room.pages.get(pageId).locked)) pageId=room.defaultPageId;
    room.players.set(clientId,{clientId,socketId:socket.id,name:cleanName(playerName,old?.name || 'Jogador'),role,pageId});
    socket.data.clientId=clientId; socket.data.roomCode=normalized; socket.join(normalized);
    ack({ok:true,room:publicRoom(room),role});
    sendRoomState(socket,room);
    io.to(normalized).emit('sala-atualizada',publicRoom(room));
  });

  socket.on('sala-pedir-estado', () => { const room=roomOf(socket); if(room) sendRoomState(socket,room); });

  socket.on('pagina-criar', ({name}={}, ack=()=>{}) => {
    const room=roomOf(socket); if(!room) return ack({ok:false,error:'Você não está em uma sala.'});
    if(!isGM(socket,room)) return ack({ok:false,error:'Somente o Mestre pode criar abas.'});
    const id='page-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
    const page={id,name:cleanName(name,'Mapa '+(room.pages.size+1)),locked:false,state:null};
    room.pages.set(id,page);
    io.to(room.code).emit('sala-atualizada',publicRoom(room));
    ack({ok:true,page:publicPage(page)});
  });

  socket.on('pagina-renomear', ({pageId,name}={}, ack=()=>{}) => {
    const room=roomOf(socket); if(!room) return ack({ok:false,error:'Você não está em uma sala.'});
    if(!isGM(socket,room)) return ack({ok:false,error:'Somente o Mestre pode renomear abas.'});
    const page=room.pages.get(pageId); if(!page) return ack({ok:false,error:'Aba não encontrada.'});
    page.name=cleanName(name,page.name); io.to(room.code).emit('sala-atualizada',publicRoom(room)); ack({ok:true,page:publicPage(page)});
  });

  socket.on('pagina-excluir', ({pageId}={}, ack=()=>{}) => {
    const room=roomOf(socket); if(!room) return ack({ok:false,error:'Você não está em uma sala.'});
    if(!isGM(socket,room)) return ack({ok:false,error:'Somente o Mestre pode excluir abas.'});
    if(room.pages.size<=1) return ack({ok:false,error:'A sala precisa manter pelo menos uma aba.'});
    if(!room.pages.has(pageId)) return ack({ok:false,error:'Aba não encontrada.'});
    room.pages.delete(pageId);
    const fallback=room.defaultPageId===pageId ? [...room.pages.keys()][0] : room.defaultPageId;
    room.defaultPageId=fallback;
    for(const p of room.players.values()) if(p.pageId===pageId) p.pageId=fallback;
    io.to(room.code).emit('sala-atualizada',publicRoom(room));
    for(const s of io.sockets.sockets.values()) if(s.data.roomCode===room.code) sendRoomState(s,room);
    ack({ok:true});
  });

  socket.on('pagina-travar', ({pageId,locked}={}, ack=()=>{}) => {
    const room=roomOf(socket); if(!room) return ack({ok:false,error:'Você não está em uma sala.'});
    if(!isGM(socket,room)) return ack({ok:false,error:'Somente o Mestre pode travar abas.'});
    const page=room.pages.get(pageId); if(!page) return ack({ok:false,error:'Aba não encontrada.'});
    page.locked=!!locked;
    if(page.locked) for(const p of room.players.values()) if(p.role==='player' && p.pageId===page.id) p.pageId=room.defaultPageId===page.id ? [...room.pages.keys()].find(id=>id!==page.id) || page.id : room.defaultPageId;
    io.to(room.code).emit('sala-atualizada',publicRoom(room));
    for(const s of io.sockets.sockets.values()) if(s.data.roomCode===room.code) sendRoomState(s,room);
    ack({ok:true,page:publicPage(page)});
  });

  socket.on('pagina-trocar', ({pageId}={}, ack=()=>{}) => {
    const room=roomOf(socket); if(!room) return ack({ok:false,error:'Você não está em uma sala.'});
    const page=room.pages.get(pageId); if(!page) return ack({ok:false,error:'Aba não encontrada.'});
    if(page.locked && !isGM(socket,room)) return ack({ok:false,error:'Esta aba está bloqueada pelo Mestre.'});
    const p=room.players.get(socket.data.clientId); if(!p) return ack({ok:false,error:'Jogador não encontrado.'});
    p.pageId=pageId;
    ack({ok:true,page:publicPage(page),currentPageId:pageId});
    socket.emit('pagina-estado', {room:publicRoom(room),role:isGM(socket,room)?'gm':'player',currentPageId:pageId,page:publicPage(page)});
    io.to(room.code).emit('sala-atualizada',publicRoom(room));
  });

  socket.on('pagina-salvar-estado', ({pageId,state}={}, ack=()=>{}) => {
    const room=roomOf(socket); if(!room) return ack({ok:false});
    const page=room.pages.get(pageId); if(!page) return ack({ok:false,error:'Aba não encontrada.'});
    // O Mestre é a autoridade final da campanha; jogadores podem enviar somente o estado da própria aba.
    const p=room.players.get(socket.data.clientId);
    if(!p || (p.role!=='gm' && p.pageId!==pageId)) return ack({ok:false,error:'Sem permissão para salvar esta aba.'});
    if(!state || typeof state.html!=='string') return ack({ok:false,error:'Estado inválido.'});
    page.state={version:5,html:state.html,mapStyle:String(state.mapStyle||''),weather:state.weather||null,fog:state.fog||null,updatedAt:Date.now(),sourceClientId:socket.data.clientId};
    socket.to(room.code).emit('pagina-estado-atualizado',{page:publicPage(page),currentPageId:pageId});
    ack({ok:true});
  });

  socket.on('sair-sala',()=>leaveSocketRoom(socket));
  socket.on('disconnect',()=>{ const code=socket.data.roomCode; if(!code)return; const room=rooms.get(code); if(!room)return; const p=room.players.get(socket.data.clientId); if(p&&p.socketId===socket.id)room.players.delete(socket.data.clientId); if(room.players.size===0)rooms.delete(code); else io.to(code).emit('sala-atualizada',publicRoom(room)); });
});

server.listen(PORT,()=>console.log(`RPG Forge rodando na porta ${PORT}`));
