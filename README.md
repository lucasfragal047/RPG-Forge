# LUMATHHU — fundo ajustado ao tamanho da grade

Nesta versão, ao usar **Imagem selecionada → Anexar ao grid como fundo**, a imagem passa para uma camada própria atrás das linhas e é redimensionada para cobrir exatamente a área da grade. A camada acompanha as dimensões e a posição da grade quando a grade é reconstruída ou redimensionada.

A imagem é ajustada com `background-size: 100% 100%`, portanto pode ser esticada para ocupar a área inteira da grade.

## Publicação
1. Extraia o ZIP.
2. Substitua os arquivos correspondentes do projeto.
3. Faça commit/push para o GitHub e aguarde o Render concluir o deploy.
4. Teste em uma sala: importe uma imagem, abra **Imagem selecionada**, escolha **Anexar ao grid como fundo** e altere as dimensões da grade.

A sintaxe do servidor e dos scripts inline foi verificada. O teste visual e multiplayer no Render ainda precisa ser feito.
