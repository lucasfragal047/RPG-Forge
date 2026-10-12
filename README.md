# RPG Forge · LUMATHHU — correção do menu de objetos

Correção pontual: quando o estado do mapa é reaplicado via `innerHTML`, os objetos mantêm o atributo `data-obj-bound`, mas perdem seus listeners de clique/arraste. A rotina de religação agora reaplica os eventos aos elementos reconstruídos, permitindo abrir novamente o menu de ações.

## Atualização
1. Faça backup dos arquivos atuais.
2. Substitua os arquivos pelos deste pacote mantendo a estrutura `public/index.html`, `server.js` e `package.json`.
3. Envie para o GitHub e aguarde o deploy do Render.
4. Atualize a mesa em Mestre e jogadores e teste clicar num objeto já colocado.

Esta correção foi validada por inspeção e verificação de sintaxe; não foi testada numa sala real do Render.
