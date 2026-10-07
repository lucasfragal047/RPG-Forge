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
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function publicRoom(room) {
  return {
    code: room.code,
    ownerId: room.ownerClientId,
    players: [...room.players.values()].map(p => ({ clientId: p.clientId, name: p.name, role: p.role })),
    createdAt: room.createdAt
  };
}

function leaveSocketRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  if (!room) return;
  const clientId = socket.data.clientId;
  const player = room.players.get(clientId);
  if (player && player.socketId === socket.id) room.players.delete(clientId);
  socket.leave(code);
  socket.data.roomCode = null;
  if (room.players.size === 0) rooms.delete(code);
  else io.to(code).emit('sala-atualizada', publicRoom(room));
}

io.on('connection', socket => {
  socket.on('criar-sala', ({ clientId, playerName } = {}, ack = () => {}) => {
    if (!clientId) return ack({ ok: false, error: 'Identificador do jogador ausente.' });
    leaveSocketRoom(socket);
    const code = makeCode();
    const room = {
      code,
      ownerClientId: clientId,
      createdAt: Date.now(),
      players: new Map()
    };
    room.players.set(clientId, { clientId, socketId: socket.id, name: String(playerName || 'Mestre').slice(0, 32), role: 'gm' });
    rooms.set(code, room);
    socket.data.clientId = clientId;
    socket.data.roomCode = code;
    socket.join(code);
    ack({ ok: true, room: publicRoom(room), role: 'gm' });
    socket.emit('sala-estado', publicRoom(room));
  });

  socket.on('entrar-sala', ({ code, clientId, playerName } = {}, ack = () => {}) => {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized || !clientId) return ack({ ok: false, error: 'Informe o código da sala.' });
    const room = rooms.get(normalized);
    if (!room) return ack({ ok: false, error: 'Sala não encontrada. Confira o código.' });
    leaveSocketRoom(socket);
    const old = room.players.get(clientId);
    const role = clientId === room.ownerClientId ? 'gm' : 'player';
    room.players.set(clientId, { clientId, socketId: socket.id, name: String(playerName || (old && old.name) || 'Jogador').slice(0, 32), role });
    socket.data.clientId = clientId;
    socket.data.roomCode = normalized;
    socket.join(normalized);
    ack({ ok: true, room: publicRoom(room), role });
    io.to(normalized).emit('sala-atualizada', publicRoom(room));
  });

  socket.on('sair-sala', () => leaveSocketRoom(socket));

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;
    const room = rooms.get(code);
    if (!room) return;
    const player = room.players.get(socket.data.clientId);
    if (player && player.socketId === socket.id) room.players.delete(socket.data.clientId);
    if (room.players.size === 0) rooms.delete(code);
    else io.to(code).emit('sala-atualizada', publicRoom(room));
  });
});

server.listen(PORT, () => console.log(`RPG Forge rodando na porta ${PORT}`));
