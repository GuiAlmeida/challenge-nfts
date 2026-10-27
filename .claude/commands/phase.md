# Phase — executar uma fase do plano

Execute a fase `$ARGUMENTS` do plano.

1. Leia `AGENTS.md`, `docs/plan/STATUS.md` e `docs/plan/phase-$ARGUMENTS.md`. Consulte `docs/planning/PLANEJAMENTO.md` apenas nas seções que a fase referencia.
2. Trabalhe as tarefas em ordem. Para cada uma: implemente, rode a verificação, marque o checkbox, atualize `STATUS.md`. Não commite nem dê push: o Guico revisa e manda commitar.
3. Ao fechar um bloco ou a fase: rode a verificação completa; se a fase for 1, 5 ou 6, rode `/review` e corrija só achados reais; atualize `STATUS.md` apontando a próxima fase; avise o Guico e espere.
4. Bloqueio > 30 min: registre em `STATUS.md` e siga para tarefa independente.
5. Reporte ao final: o que ficou, o que não ficou, bloqueios, desvios.
