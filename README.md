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
- Rolagem de dados com animação 3D sincronizada em tempo real para todos os jogadores da mesma sala.
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

## Dados 3D sincronizados

Ao clicar em d4, d6, d8 ou d20, o resultado aparece em uma animação 3D. O servidor transmite o evento pela sala Socket.IO, para que todos os jogadores da mesma sala vejam o mesmo resultado. Não é necessário instalar extensão de navegador.

## Importante

As salas ficam em memória. Se o servidor reiniciar ou sofrer redeploy, as salas atuais são perdidas.


## Menu LUMATHHU e salas online

O menu inicial oferece **Criar sala**, **Participar de sala** e **Últimas salas**. As salas usam Socket.IO no servidor Node; para jogar com outras pessoas, publique a pasta do projeto no GitHub e conecte o repositório ao Render como serviço Web Service, com comando de build vazio e comando de início `npm start`. Compartilhe o código de 4 caracteres que aparece ao entrar na sala. A lista de salas recentes do servidor depende de o processo do Render continuar ativo; a memória das salas é reiniciada quando o processo reinicia.


## Dados 3D sincronizados (Owlbear Rodeo Dice)

O projeto inclui o código-fonte do Owlbear Rodeo Dice, sob GPL-3.0, adaptado para abrir dentro do LUMATHHU. A física 3D usa Three.js e Rapier. O cliente que inicia a rolagem envia a definição dos dados e os parâmetros físicos iniciais pelo Socket.IO; os demais clientes na mesma sala reproduzem a simulação.

### Primeira execução

1. Instale a versão atual do Node.js.
2. Na pasta `RPG-Forge-FINAL`, execute `npm install`.
3. Execute `npm start`. Na primeira inicialização, `setup-dice.js` instala as dependências do subprojeto `dice-source`, compila os dados 3D e copia os arquivos compilados para `public/dice`. É necessária conexão com a internet na primeira compilação.
4. Abra o LUMATHHU, entre na mesma sala com dois navegadores/dispositivos e clique em **Abrir mesa de dados 3D**. Escolha os dados e role; a mesa deve abrir também nos outros participantes quando a rolagem for recebida.

O código do servidor e os scripts da página passaram por verificação sintática. A compilação TypeScript/Vite e o teste real com múltiplos navegadores não foram executados neste ambiente, porque a instalação das dependências externas não concluiu; valide esses passos no primeiro `npm start`.
