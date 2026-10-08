# RPG Forge — pronto para Render

Este pacote mantém a versão mais recente da mesa e inclui o servidor Node para a sincronização do Som / efeito.

## Render Dashboard
- Service type: Web Service
- Language/Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Port: o servidor usa `PORT` fornecida pelo Render e escuta em `0.0.0.0`.

Depois do deploy, abra a URL `https://SEU-SERVICO.onrender.com`. Os jogadores entram nessa mesma URL. O SSE em `/api/sound/events` mantém o Som / efeito sincronizado no serviço.

Observação: navegadores podem bloquear reprodução automática de áudio/YouTube até que cada jogador faça uma interação inicial no navegador.
