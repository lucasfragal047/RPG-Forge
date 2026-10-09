# RPG FORGE · LUMATHHU — servidor reorganizado

Pacote para implantação como Web Service no Render.

## Arquivos
- `server.js`: servidor HTTP + Socket.IO, gerenciamento de salas/mapas, sincronização de estado e rolagens de dados, biblioteca/sincronização de sons e endpoint de saúde.
- `public/index.html`: interface do RPG Forge.
- `package.json`: comando `npm start` e dependência Socket.IO.
- `render.yaml`: configuração de implantação no Render.

## Deploy
1. Faça backup do repositório atual.
2. Extraia o ZIP e envie os arquivos mantendo `public/index.html` dentro da pasta `public`.
3. No Render, use `npm install` como Build Command e `npm start` como Start Command.
4. Depois do deploy, abra `/api/health`; a resposta deve conter `ok: true`.

## Rotas úteis
- `/` — página HTML.
- `/api/health` — status do servidor.
- `/api/rooms/recent` — salas ativas criadas recentemente (JSON).
- `/api/sounds` — biblioteca de sons.
- `/api/sound/events` — eventos SSE de sincronização de sons.

## Eventos de sala
Mantidos para compatibilidade com a interface: `criar-sala`, `entrar-sala`, `sala-criada`, `sala-estado`, `sala-erro`, eventos de mapas e `rpg-dice-roll`. Também publica `salas-recentes` para clientes que implementem essa atualização.

Observações: as salas e os estados dos mapas ficam em memória; elas são perdidas quando o processo reinicia. O endpoint de salas recentes só lista salas ativas no processo atual. Teste criação/entrada com dois navegadores depois do deploy.
