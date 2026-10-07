# Som / efeito — fluxo sincronizado

O Mestre adiciona os links do YouTube. O catálogo é enviado ao servidor para todos os clientes da sessão.

Somente o Mestre exibe o player do YouTube na interface. Quando o Mestre clica em **Tocar**, o servidor transmite o comando de reprodução para os clientes.

Cada jogador precisa fazer uma única interação para **Permitir áudio da mesa** por causa das políticas de autoplay do navegador. Depois dessa autorização, as reproduções iniciadas pelo Mestre são disparadas automaticamente no player invisível do jogador.

O servidor sincroniza o comando e o estado; o áudio do YouTube é reproduzido pelo navegador de cada participante.
