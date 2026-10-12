# RPG Forge · LUMATHHU — reprodução sincronizada do YouTube

Esta versão ajusta o fluxo de reprodução sincronizada do som compartilhado.

## Alteração
- O Mestre continua enviando o comando de reprodução para a sala imediatamente.
- Nos dispositivos dos jogadores, a reprodução tenta iniciar silenciada para contornar políticas de autoplay do navegador e libera o som quando o player confirma que começou a tocar.
- Um bloqueio de autoplay com áudio não desativa imediatamente a sincronização da sala.
- Mantém o restante dos arquivos e recursos da versão de origem.

## Limitação importante
Navegadores podem exigir uma interação do usuário para permitir áudio automático. Nenhum site consegue garantir que todo navegador/dispositivo reproduza som audível sem essa autorização. Se o navegador bloquear até a reprodução silenciada ou exigir ativação inicial, o jogador pode precisar liberar o áudio uma vez; não deve precisar apertar Play a cada faixa quando a autorização e o player estiverem funcionando.

## Publicação
1. Faça backup da versão atual.
2. Substitua os arquivos do projeto pelos arquivos deste ZIP, mantendo a estrutura de pastas.
3. Envie as alterações ao GitHub e aguarde o deploy do Render.
4. Recarregue a mesa em todos os dispositivos e teste com uma faixa curta.

A sintaxe do servidor e dos scripts inline foi verificada. A reprodução real entre dispositivos ainda precisa ser testada na sala publicada.
