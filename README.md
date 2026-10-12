# LUMATHHU — fundo de imagem no grid e alternância da grade

## Alterações
- No menu **Imagem selecionada** (aberto com duplo clique na imagem importada), foi adicionada a opção **🗺️ Anexar ao grid como fundo**.
- Essa opção fixa a imagem na camada da grade na mesma posição e dimensão em que estava, remove o objeto flutuante e mantém a grade desenhada por cima da imagem.
- A imagem de fundo e suas dimensões/posição são incluídas no estado da grade para sincronização entre participantes.
- Corrigida a alternância da grade: o botão **Grade: ligada/desligada** mantém um estado explícito, para não reativar a grade inesperadamente após sincronização.
- Alterar o tamanho das células continua funcionando sem redefinir o tamanho da imagem anexada.

## Atualização
Substitua os arquivos do projeto pelos deste ZIP, envie as alterações ao GitHub e aguarde o deploy do Render.

## Validação
A sintaxe do servidor e dos scripts JavaScript embutidos foi verificada. A sincronização real entre navegadores precisa ser conferida no Render.
