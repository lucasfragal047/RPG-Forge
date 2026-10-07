const express=require('express');
const http=require('http');
const path=require('path');
const crypto=require('crypto');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server);
const PORT=process.env.PORT||3000;
app.use(express.static(path.join(__dirname,'public')));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

const rooms=new Map();
const CHARS='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const id=()=>crypto.randomUUID();
function code(){let c;do c=Array.from({length:4},()=>CHARS[Math.floor(Math.random()*CHARS.length)]).join('');while(rooms.has(c));return c;}
function clean(v,f){return String(v||f).trim().slice(0,32)||f;}
function room(socket){return socket.data.roomCode?rooms.get(socket.data.roomCode):null;}
function gm(socket,r){return !!r&&socket.data.clientId===r.ownerId;}
function publicRoom(r){return {code:r.code,ownerId:r.ownerId,players:[...r.players.values()].map(p=>({id:p.id,name:p.name,role:p.role}))};}
function leave(socket){const r=room(socket);if(!r)return;const p=r.players.get(socket.data.clientId);if(p&&p.socketId===socket.id)r.players.delete(socket.data.clientId);socket.leave(r.code);socket.data.roomCode=null;if(r.players.size===0)rooms.delete(r.code);else io.to(r.code).emit('room:update',publicRoom(r));}
function sendState(socket,r){socket.emit('room:state',{room:publicRoom(r),role:gm(socket,r)?'gm':'player',state:r.state});}

io.on('connection',socket=>{
  socket.on('room:create',({clientId,name}={},ack=()=>{})=>{
    if(!clientId)return ack({ok:false,error:'Identificador ausente.'});
    leave(socket);
    const c=code();
    const r={code:c,ownerId:clientId,players:new Map(),state:{html:null,mapStyle:'',stageStyle:'',updatedAt:Date.now()}};
    r.players.set(clientId,{id:clientId,socketId:socket.id,name:clean(name,'Mestre'),role:'gm'});
    rooms.set(c,r);socket.data.clientId=clientId;socket.data.roomCode=c;socket.join(c);
    ack({ok:true,room:publicRoom(r),role:'gm'});sendState(socket,r);
  });
  socket.on('room:join',({code:raw,clientId,name}={},ack=()=>{})=>{
    const c=String(raw||'').trim().toUpperCase();
    if(!clientId||c.length!==4)return ack({ok:false,error:'Informe um código de sala com 4 caracteres.'});
    const r=rooms.get(c);if(!r)return ack({ok:false,error:'Sala não encontrada. Confira o código.'});
    leave(socket);
    const role=clientId===r.ownerId?'gm':'player';
    r.players.set(clientId,{id:clientId,socketId:socket.id,name:clean(name,'Jogador'),role});
    socket.data.clientId=clientId;socket.data.roomCode=c;socket.join(c);
    ack({ok:true,room:publicRoom(r),role});sendState(socket,r);io.to(c).emit('room:update',publicRoom(r));
  });
  socket.on('room:request-state',()=>{const r=room(socket);if(r)sendState(socket,r);});
  socket.on('room:sync',({state}={},ack=()=>{})=>{
    const r=room(socket);if(!r)return ack({ok:false,error:'Você não está em uma sala.'});
    if(!state||typeof state.html!=='string')return ack({ok:false,error:'Estado inválido.'});
    r.state={html:state.html,mapStyle:String(state.mapStyle||''),stageStyle:String(state.stageStyle||''),updatedAt:Date.now()};
    socket.to(r.code).emit('room:sync',r.state);ack({ok:true});
  });
  socket.on('room:chat',({message}={},ack=()=>{})=>{const r=room(socket);if(!r)return;const p=r.players.get(socket.data.clientId);const m=String(message||'').trim().slice(0,300);if(!m)return;io.to(r.code).emit('room:chat',{name:p?.name||'Jogador',role:p?.role||'player',message:m});ack({ok:true});});
  socket.on('room:roll',({sides}={},ack=()=>{})=>{const r=room(socket);if(!r)return;const n=Math.max(2,Math.min(1000,Number(sides)||20));const value=Math.floor(Math.random()*n)+1;const p=r.players.get(socket.data.clientId);io.to(r.code).emit('room:roll',{name:p?.name||'Jogador',sides:n,value});ack({ok:true,value});});
  socket.on('room:leave',()=>leave(socket));
  socket.on('disconnect',()=>leave(socket));
});
server.listen(PORT,()=>console.log(`LuMaThHu servidor rodando na porta ${PORT}`));
