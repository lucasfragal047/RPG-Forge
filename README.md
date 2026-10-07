# RPG Forge — Mesa Virtual

Mesa virtual multiplayer para RPG com uma sala contendo vários mapas independentes.

## Estrutura
- `server.js`
- `package.json`
- `README.md`
- `public/index.html`

## Rodar
```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Salas
O botão **Criar sala** cria uma nova sala e define o criador como Mestre. Jogadores entram pelo código da sala. O servidor é a autoridade: jogadores não podem virar Mestre, criar mapas, travar/destravar mapas ou mudar sua própria atribuição alterando localStorage.

## Mapas
Todos os mapas ficam dentro da mesma sala. Cada mapa possui estado separado: tokens, objetos, posições, fundo/importação, névoa e demais elementos salvos no mapa. Criar ou trocar de mapa não cria outra sala.

## Render
- Build Command: `npm install`
- Start Command: `npm start`

As salas ficam em memória e são perdidas se a instância do servidor reiniciar.
