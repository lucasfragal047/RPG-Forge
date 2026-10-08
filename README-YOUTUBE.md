# RPG Forge — YouTube corrigido + sincronização

A mesa precisa ser aberta pela URL HTTPS do servidor (ex.: Render). O player usa o domínio `youtube-nocookie.com`, `referrerpolicy="origin"` e o parâmetro `origin` para atender ao requisito atual do player incorporado do YouTube.

A sincronização usa o servidor: o Mestre envia `play`/`stop` e os clientes conectados recebem o estado por SSE em `/api/sound/events`.

Observação: vídeos do YouTube cujo proprietário não permite incorporação podem continuar bloqueados pelo próprio YouTube.
