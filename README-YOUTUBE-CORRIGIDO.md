CORREÇÃO DO PLAYER DO YOUTUBE

Foi corrigida a tela preta do player: o sistema estava, em alguns caminhos, tentando carregar o ID interno do item da biblioteca como se fosse o ID do vídeo do YouTube. Agora o player usa sempre o ID real extraído da URL.

Também foi corrigida a primeira reprodução do Mestre: o código aguarda o evento de prontidão do player antes de chamar playVideo/loadVideoById, evitando a primeira tentativa cair no vazio.

O player usa o domínio padrão do YouTube e só envia o parâmetro origin quando a mesa está em HTTP/HTTPS válido.

Para sincronização online, use a URL HTTPS do Render. Cada jogador precisa ativar o áudio uma vez por causa das políticas de autoplay do navegador.
