# RPG Forge — Home inicial + salas

Este projeto usa Node.js + Socket.IO para criar e participar de salas. Para multiplayer, publique como um serviço Node.js, não apenas como hospedagem estática.

## Estrutura
- `server.js`: servidor HTTP e Socket.IO.
- `package.json`: dependências e comando `npm start`.
- `public/index.html`: interface entregue pelo servidor.
- `index.html`: cópia para pré-visualização estática; o multiplayer exige o servidor Socket.IO.

## Publicação Node.js
1. Extraia o ZIP e envie estes arquivos diretamente para a raiz do repositório, sem uma pasta extra em volta.
2. Build/install command: `npm install`
3. Start command: `npm start`
4. Abra a URL do serviço Node.js publicado.

Não abra `server.js` nem a visualização Raw do GitHub como se fossem o site.
