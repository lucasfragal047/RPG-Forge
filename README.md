# RPG Forge — Servidor

Pacote organizado para o RPG Forge multiplayer.

## Estrutura

- `server.js` — servidor Node + Socket.IO, salas, permissões e sincronização.
- `package.json` — dependências e comando de inicialização.
- `public/index.html` — interface completa do RPG Forge.

## O que está integrado

- Salas multiplayer por código/link.
- Mestre definido pelo dono da sala.
- Cenários/mapas múltiplos.
- Tamanho do mapa.
- Clima sincronizado.
- Névoa e visão.
- Tokens e objetos.
- Magias e efeitos.
- Sons sincronizados.
- Importação/exportação do mapa.

## Rodar localmente

```bash
npm install
npm start
```

Abra `http://localhost:3000`.

## Publicar no Render

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`

O servidor usa `PORT` e `0.0.0.0`, então funciona no ambiente do Render.

## Importante

As salas ficam em memória. Se o servidor reiniciar ou sofrer redeploy, as salas atuais são perdidas.
