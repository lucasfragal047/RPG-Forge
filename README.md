# RPG Forge — Mesa Virtual

Mesa virtual multiplayer para RPG. Uma única sala contém vários mapas/páginas independentes.

## Estrutura
- `server.js`
- `package.json`
- `README.md`
- `public/index.html`

## Rodar localmente
```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Render
- Build Command: `npm install`
- Start Command: `npm start`

O primeiro jogador que entra na sala vira Mestre. Os demais entram como jogadores. O Mestre pode criar, renomear, excluir, travar mapas e atribuir cada jogador a um mapa. Tudo ocorre dentro da mesma sala; trocar de mapa não cria outra sala.

O estado de cada mapa é separado, incluindo tokens, objetos, posições e névoa. O servidor valida as permissões, então o jogador não pode liberar outro mapa apenas alterando o navegador/localStorage.
