const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const INDEX_FILE = path.join(PUBLIC_DIR, 'index.html');

// O index.html do projeto continua intacto no disco. O servidor apenas troca
// o nome exibido na tela inicial quando entrega a página.
app.get('/', (req, res) => {
  try {
    let html = fs.readFileSync(INDEX_FILE, 'utf8');
    html = html
      .replace(/<title>[^<]*<\/title>/i, '<title>LuMaThHu</title>')
      .replace(/⚔️ RPG Forge/g, '⚔️ LuMaThHu')
      .replace(/RPG Forge não conseguiu iniciar/g, 'LuMaThHu não conseguiu iniciar');
    res.type('html').send(html);
  } catch (err) {
    res.status(500).send('Não foi possível carregar o LuMaThHu.');
  }
});
app.use(express.static(PUBLIC_DIR));
app.get('*', (req, res) => res.sendFile(INDEX_FILE));

const rooms = new Map();
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_STATE_CHARS = 2_500_000;

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeCode() {
  let code;
  do {
    code = Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function cleanName(value, fallback) {
  const name = String(value ?? '').trim().slice(0, 32);
  return name || fallback;
}

function roomOf(socket) {
  return socket.data.roomCode ? rooms.get(socket.data.roomCode) : null;
}

function isGM(socket, room) {
  return !!room && socket.data.clientId === room.ownerClientId;
}

function publicPage(page) {
  if (!page) return null;
  return {
    id: page.id,
    name: page.name,
    locked: !!page.locked,
    state: page.state || null
  };
}

function publicRoom(room) {
  return {
    code: room.code,
    ownerId: room.ownerClientId,
    pages: [...room.pages.values()].map(page => ({
      id: page.id,
      name: page.name,
      locked: !!page.locked
    })),
    players: [...room.players.values()].map(player => ({
      clientId: player.clientId,
      name: player.name,
      role: player.role,
      pageId: player.pageId
    }))
  };
}

function currentPageFor(room, player) {
  const preferred = player?.pageId || room.defaultPageId;
  return room.pages.get(preferred) || room.pages.get(room.defaultPageId) || [...room.pages.values()][0];
}

function sendRoomState(socket, room) {
  const player = room.players.get(socket.data.clientId);
  const page = currentPageFor(room, player);
  if (player && page) player.pageId = page.id;

  socket.emit('sala-estado', {
    room: publicRoom(room),
    role: isGM(socket, room) ? 'gm' : 'player',
    currentPageId: page?.id || null,
    page: publicPage(page)
  });
}

function broadcastRoom(room) {
  io.to(room.code).emit('sala-atualizada', publicRoom(room));
}

function emitPageStateToViewers(room, page) {
  for (const otherSocket of io.sockets.sockets.values()) {
    if (otherSocket.data.roomCode !== room.code) continue;
    const viewer = room.players.get(otherSocket.data.clientId);
    if (viewer?.pageId === page.id) {
      otherSocket.emit('pagina-estado-atualizado', {
        page: publicPage(page),
        currentPageId: page.id
      });
    }
  }
}

function leaveSocketRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;

  const room = rooms.get(code);
  socket.leave(code);
  socket.data.roomCode = null;

  if (!room) return;

  const player = room.players.get(socket.data.clientId);
  if (player && player.socketId === socket.id) room.players.delete(socket.data.clientId);

  if (room.players.size === 0) {
    rooms.delete(code);
    return;
  }

  broadcastRoom(room);
}

function createRoom(clientId, playerName) {
  const code = makeCode();
  const firstPageId = makeId('page');
  const room = {
    code,
    ownerClientId: clientId,
    createdAt: Date.now(),
    defaultPageId: firstPageId,
    pages: new Map(),
    players: new Map()
  };

  room.pages.set(firstPageId, {
    id: firstPageId,
    name: 'Mapa 1',
    locked: false,
    state: null
  });

  room.players.set(clientId, {
    clientId,
    socketId: null,
    name: cleanName(playerName, 'Mestre'),
    role: 'gm',
    pageId: firstPageId
  });

  rooms.set(code, room);
  return room;
}

io.on('connection', socket => {
  socket.on('criar-sala', ({ clientId, playerName } = {}, ack = () => {}) => {
    if (!clientId) return ack({ ok: false, error: 'Identificador do jogador ausente.' });

    leaveSocketRoom(socket);

    const room = createRoom(clientId, playerName);
    const player = room.players.get(clientId);
    player.socketId = socket.id;

    socket.data.clientId = clientId;
    socket.data.roomCode = room.code;
    socket.join(room.code);

    ack({ ok: true, room: publicRoom(room), role: 'gm' });
    sendRoomState(socket, room);
  });

  socket.on('entrar-sala', ({ code, clientId, playerName } = {}, ack = () => {}) => {
    const normalized = String(code || '').trim().toUpperCase();
    if (!normalized || !clientId) {
      return ack({ ok: false, error: 'Informe o código da sala.' });
    }

    const room = rooms.get(normalized);
    if (!room) {
      return ack({ ok: false, error: 'Sala não encontrada. Confira o código.' });
    }

    leaveSocketRoom(socket);

    const oldPlayer = room.players.get(clientId);
    const role = clientId === room.ownerClientId ? 'gm' : 'player';
    let pageId = oldPlayer?.pageId || room.defaultPageId;
    if (!room.pages.has(pageId) || (role !== 'gm' && room.pages.get(pageId).locked)) {
      pageId = room.defaultPageId;
    }

    room.players.set(clientId, {
      clientId,
      socketId: socket.id,
      name: cleanName(playerName, oldPlayer?.name || 'Jogador'),
      role,
      pageId
    });

    socket.data.clientId = clientId;
    socket.data.roomCode = normalized;
    socket.join(normalized);

    ack({ ok: true, room: publicRoom(room), role });
    sendRoomState(socket, room);
    broadcastRoom(room);
  });

  socket.on('sala-pedir-estado', () => {
    const room = roomOf(socket);
    if (room) sendRoomState(socket, room);
  });

  // Abas/cenários continuam pertencendo à mesma sala.
  socket.on('pagina-criar', ({ name } = {}, ack = () => {}) => {
    const room = roomOf(socket);
    if (!room) return ack({ ok: false, error: 'Você não está em uma sala.' });
    if (!isGM(socket, room)) return ack({ ok: false, error: 'Somente o Mestre pode criar abas.' });

    const id = makeId('page');
    const page = {
      id,
      name: cleanName(name, `Mapa ${room.pages.size + 1}`),
      locked: false,
      state: null
    };
    room.pages.set(id, page);

    broadcastRoom(room);
    ack({ ok: true, page: publicPage(page) });
  });

  socket.on('pagina-renomear', ({ pageId, name } = {}, ack = () => {}) => {
    const room = roomOf(socket);
    if (!room) return ack({ ok: false, error: 'Você não está em uma sala.' });
    if (!isGM(socket, room)) return ack({ ok: false, error: 'Somente o Mestre pode renomear abas.' });

    const page = room.pages.get(pageId);
    if (!page) return ack({ ok: false, error: 'Aba não encontrada.' });

    page.name = cleanName(name, page.name);
    broadcastRoom(room);
    ack({ ok: true, page: publicPage(page) });
  });

  socket.on('pagina-excluir', ({ pageId } = {}, ack = () => {}) => {
    const room = roomOf(socket);
    if (!room) return ack({ ok: false, error: 'Você não está em uma sala.' });
    if (!isGM(socket, room)) return ack({ ok: false, error: 'Somente o Mestre pode excluir abas.' });
    if (room.pages.size <= 1) return ack({ ok: false, error: 'A sala precisa manter pelo menos uma aba.' });
    if (!room.pages.has(pageId)) return ack({ ok: false, error: 'Aba não encontrada.' });

    room.pages.delete(pageId);
    if (room.defaultPageId === pageId) room.defaultPageId = [...room.pages.keys()][0];

    for (const player of room.players.values()) {
      if (player.pageId === pageId) player.pageId = room.defaultPageId;
    }

    broadcastRoom(room);
    for (const otherSocket of io.sockets.sockets.values()) {
      if (otherSocket.data.roomCode === room.code) sendRoomState(otherSocket, room);
    }
    ack({ ok: true });
  });

  socket.on('pagina-travar', ({ pageId, locked } = {}, ack = () => {}) => {
    const room = roomOf(socket);
    if (!room) return ack({ ok: false, error: 'Você não está em uma sala.' });
    if (!isGM(socket, room)) return ack({ ok: false, error: 'Somente o Mestre pode travar abas.' });

    const page = room.pages.get(pageId);
    if (!page) return ack({ ok: false, error: 'Aba não encontrada.' });

    page.locked = !!locked;
    if (page.locked) {
      const fallback = [...room.pages.values()].find(candidate => candidate.id !== page.id && !candidate.locked);
      for (const player of room.players.values()) {
        if (player.role === 'player' && player.pageId === page.id) {
          player.pageId = fallback?.id || page.id;
        }
      }
    }

    broadcastRoom(room);
    for (const otherSocket of io.sockets.sockets.values()) {
      if (otherSocket.data.roomCode === room.code) sendRoomState(otherSocket, room);
    }
    ack({ ok: true, page: publicPage(page) });
  });

  socket.on('pagina-trocar', ({ pageId } = {}, ack = () => {}) => {
    const room = roomOf(socket);
    if (!room) return ack({ ok: false, error: 'Você não está em uma sala.' });

    const page = room.pages.get(pageId);
    if (!page) return ack({ ok: false, error: 'Aba não encontrada.' });
    if (page.locked && !isGM(socket, room)) return ack({ ok: false, error: 'Esta aba está bloqueada pelo Mestre.' });

    const player = room.players.get(socket.data.clientId);
    if (!player) return ack({ ok: false, error: 'Jogador não encontrado.' });

    player.pageId = pageId;
    const payload = {
      room: publicRoom(room),
      role: isGM(socket, room) ? 'gm' : 'player',
      currentPageId: pageId,
      page: publicPage(page)
    };

    ack({ ok: true, page: publicPage(page), currentPageId: pageId });
    socket.emit('pagina-estado', payload);
    broadcastRoom(room);
  });

  // Estado do cenário: tokens, objetos, neblina, mapa importado, zoom/estilo etc.
  // O servidor guarda uma cópia por aba e distribui somente para quem está na mesma aba.
  socket.on('pagina-salvar-estado', ({ pageId, state } = {}, ack = () => {}) => {
    const room = roomOf(socket);
    if (!room) return ack({ ok: false, error: 'Você não está em uma sala.' });

    const page = room.pages.get(pageId);
    if (!page) return ack({ ok: false, error: 'Aba não encontrada.' });

    const player = room.players.get(socket.data.clientId);
    if (!player || (player.role !== 'gm' && player.pageId !== pageId)) {
      return ack({ ok: false, error: 'Sem permissão para salvar esta aba.' });
    }

    if (!state || typeof state.html !== 'string') {
      return ack({ ok: false, error: 'Estado inválido.' });
    }
    if (state.html.length > MAX_STATE_CHARS) {
      return ack({ ok: false, error: 'O estado do mapa ficou grande demais.' });
    }

    page.state = {
      version: 6,
      html: state.html,
      mapStyle: String(state.mapStyle || '').slice(0, 20000),
      weather: state.weather || null,
      fog: state.fog || null,
      updatedAt: Date.now(),
      sourceClientId: socket.data.clientId
    };

    emitPageStateToViewers(room, page);
    ack({ ok: true });
  });

  socket.on('sair-sala', () => leaveSocketRoom(socket));

  socket.on('disconnect', () => {
    const code = socket.data.roomCode;
    if (!code) return;

    const room = rooms.get(code);
    if (!room) return;

    const player = room.players.get(socket.data.clientId);
    if (player && player.socketId === socket.id) room.players.delete(socket.data.clientId);

    if (room.players.size === 0) {
      rooms.delete(code);
      return;
    }

    broadcastRoom(room);
  });
});

server.listen(PORT, () => {
  console.log(`LuMaThHu servidor rodando na porta ${PORT}`);
});
