RPG Forge — versão multiplayer corrigida

1. npm install
2. npm start
3. Abra http://localhost:3000

A sala agora é definida pela URL (?sala=XXXX) antes do localStorage.
Criar/trocar mapas não recarrega a página e não cria outra sala.
O estado de cada mapa continua separado dentro da mesma sala.
O servidor usa Socket.IO e permanece autoritativo para salas/mapas.

As salas ficam em memória e são perdidas se o servidor reiniciar.
