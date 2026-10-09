# RPG Forge — Menu Lumathhu + salas corrigidas

Projeto Node.js com Socket.IO. A correção inclui criação de sala com tentativa automática quando o servidor ainda está conectando, retorno visual e desbloqueio do botão em caso de erro/timeout, além de reconexão à sala após queda temporária.

## Estrutura
- `server.js`: servidor HTTP e Socket.IO.
- `package.json`: dependências e comando `npm start`.
- `public/index.html`: interface servida pelo servidor (arquivo principal).
- `index.html`: cópia para pré-visualização.
- `render.yaml`: configuração de deploy no Render.

## Publicação
1. Extraia o ZIP.
2. Envie os arquivos diretamente para a raiz do repositório GitHub, sem uma pasta extra.
3. No Render, use Build Command `npm install` e Start Command `npm start`.
4. Abra a URL do serviço Node.js, não a prévia estática do GitHub.
