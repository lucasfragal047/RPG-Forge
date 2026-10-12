# LUMATHHU SOM — correção de névoa e grade

Esta versão mantém a estrutura do projeto integrado e corrige:

- A névoa e seus ajustes de ativação, posição, tamanho, cor e opacidade ficam sob controle do Mestre. O servidor já valida as alterações da névoa e rejeita comandos enviados por jogadores comuns.
- A grade mantém o tamanho de célula selecionado (25, 50, 75 ou 100 px) quando a proporção horizontal/vertical é alterada.
- Os controles de proporção horizontal e vertical atualizam as dimensões da grade sem redefinir o tamanho das células.
- As dimensões e o tamanho da grade são sincronizados com o mapa e reaplicados quando chega uma atualização remota.

## Atualização
1. Extraia o ZIP.
2. Substitua os arquivos correspondentes no repositório local.
3. Faça commit e push para o GitHub.
4. Aguarde o Render concluir a implantação.
5. Teste com o Mestre e pelo menos um jogador na mesma sala.
