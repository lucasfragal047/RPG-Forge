# RPG Forge — versão online de teste

Projeto web com o editor RPG Forge + salas multiplayer via WebSocket.

## Rodar no PC
1. Instale Node.js 18+.
2. Abra um terminal nesta pasta.
3. Rode `npm install`.
4. Rode `npm start`.
5. Abra `http://localhost:3000`.

Para amigos na mesma rede, use o IP local do computador que executa o servidor.
Para acesso pela internet, publique esta pasta em um serviço que aceite Node.js e WebSocket. O processo deve iniciar com `npm start`.

## Como testar
- Mestre: crie uma sala e compartilhe o código/link.
- Jogadores: abram o endereço publicado e entrem usando o mesmo código.
- O servidor mantém a sala em memória enquanto houver participantes.
- O estado do mapa é sincronizado entre os participantes.

## Observação
Esta é uma versão de teste. Ainda não há login, banco de dados, HTTPS próprio, persistência permanente ou autenticação de Mestre.
