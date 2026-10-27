# Review — revisar working tree ou diff

Delegue ao subagente `reviewer` a revisão de `$ARGUMENTS` (arquivos ou `git diff` indicado). Sem argumentos: todo o `git diff HEAD` mais arquivos novos em `src/`.

Passe ao reviewer: lista de arquivos, fase atual e o foco (eliminatórios, sessão, socket, pedidos). Ao receber o veredito, reporte os achados ao usuário separando problema real de sugestão. Corrija só se pedido ou se o fluxo da fase exigir (fases 1, 5, 6), e apenas os achados reais.
