# Kurio NFT Marketplace — Instruções para agentes

Fonte canônica de regras deste repositório. `CLAUDE.md` apenas importa este arquivo.

## Projeto

- Desafio Frontend "Marketplace de NFTs". `README.md` (raiz) é a fonte de verdade de comportamento e avaliação; leia-o antes de qualquer fase.
- Plano aprovado: `docs/planning/PLANEJAMENTO.md` (arquitetura em C, fases em D, testes em E, decisões em F). Estado vivo: `docs/plan/STATUS.md`. Checklists por fase: `docs/plan/phase-N.md`.
- Prazo de entrega: **29/10/2026 09:00 BRT**. Cronograma em `PLANEJAMENTO.md` D.0.
- Stack fixa: React 19 + TypeScript 5.9, Vite 8, TanStack Router (file-based via `@tanstack/router-plugin`), TanStack Query 5, Axios, `socket.io-client` 4, Tailwind 4, shadcn/ui, MSW **2.15.x** + `@mswjs/socket.io-binding`, Playwright, Lighthouse, zod 4, react-hook-form, zustand, pnpm, Node ≥ 22.12.
- Idioma da interface: pt-BR único, textos do Figma. Sem i18n.
- Figma de referência (acessível via MCP): arquivo `LupYhmHhcC6Gbren3WzDqK`, página `0:1`. Node ids por tela em `PLANEJAMENTO.md` A.2; tokens em A.3.

## Não negociáveis (mudança só com justificativa escrita e OK do Guico)

1. Nenhum dado fictício, `if (mock)` ou caminho alternativo de negócio em componentes, hooks ou `src/lib/http.ts`. Simulação só em `src/mocks/*`.
2. Todo REST passa por `src/lib/http.ts` (Axios). Todo evento em tempo real chega pelo `socket.io-client` real; nunca escrever no cache em nome de um evento que não veio pelo socket.
3. Recibo e confirmação só com `order.status === 'confirmed'` vindo da API.
4. Chaves de query privadas prefixadas por `userId`. Logout e troca de usuário removem queries privadas, desconectam o socket e limpam rascunhos.
5. `msw` fica em `~2.15.0`. `socket.io-client` conecta com `transports: ['websocket']`.
6. Valores em ETH: `string` decimal no transporte, `BigInt` em wei no cálculo (`src/lib/eth.ts`), `formatEth` na UI. Nunca `Number`.
7. A URL é a fonte de verdade de busca, filtros, ordenação e página. Filtro novo zera a página.
8. Eventos: validar o envelope com zod; descartar id já visto ou versão menor ou igual à do cache.
9. Skeletons com as dimensões reais do conteúdo; `prefers-reduced-motion` respeitado.
10. Sem `Co-Authored-By`, "Generated with" ou qualquer atribuição a agente em commits, PRs ou issues.

## Arquitetura (resumo; detalhe em `PLANEJAMENTO.md` C)

- Feature-based inspirado em FSD, não canônico. Imports só para baixo: `app → routes → features → components | lib | contracts`. Uma feature só importa de outra pelo `index.ts` dela. ESLint (`eslint-plugin-boundaries`) verifica.
- `src/contracts/*`: schemas zod + tipos compartilhados por app e mocks. Único tipo do transporte à interface.
- "Um dono" por dado: TanStack Query = dado do servidor; zustand = sessão e UI; URL = busca; `*.rules.ts` = regra pura; `useXFlow` = fluxo de tela (estado do form, envio, erro, navegação). Componente só renderiza.
- Mocks: `src/mocks/db` (estado + persistência em localStorage), `handlers/` (REST), `socket/` (ws.link + binding + bus), `scenarios/` (latência, falhas, pedidos, eventos agendados), `control.ts` (`window.__kurioMock`). O bus emite evento em toda mutação relevante do db.
- Tempo real: `features/realtime` (socket singleton, `RealtimeProvider`, `event-guard` por id e versão, handlers que escrevem no cache, `reconcile()` após reconexão).

## Convenções

- Pastas e arquivos em kebab-case; componentes em PascalCase; hooks `useX`; fluxos `useXFlow`; regras puras `*.rules.ts`; chaves de query em `features/<f>/queries/keys.ts`.
- Imports: `@/` entre camadas; relativo dentro da feature.
- Formulários: react-hook-form + zod em `features/<f>/schemas.ts`; erros 422 da API viram `setError`; `aria-invalid` e `aria-describedby`; foco no primeiro erro.
- Estados: `isPending` → skeleton; `isError` → `ErrorState` com retry; vazio → `EmptyState`; `isFetching` → barra fina no topo.
- Acessibilidade: tudo operável por teclado; foco visível; `Dialog`/`Sheet` com foco preso; `aria-live` para toasts, banners e estado de pedido; alt em imagens relevantes.
- Comentários: o código explica o quê; comentário só quando há fato que o código não diz (contrato externo, limitação de biblioteca, razão não óbvia de uma decisão). Proibido: comentário dentro de função, dentro de `interface`/`type`/objeto literal/JSX, comentário narrativo ("aqui fazemos X"), referência a fase ou a conversa, "diário" de IA. JSDoc é ferramenta, não regra: usar só em API pública de módulo quando acrescenta algo; nunca repetir o nome ou a assinatura. Na dúvida, nome melhor em vez de comentário.
- TypeScript strict; sem `any`; `interface` para objetos, `type` para unions; sem `enum`.

## Fluxo de trabalho

1. Leia `docs/plan/STATUS.md` e o `docs/plan/phase-N.md` da fase atual.
2. Trabalhe tarefa por tarefa (checkbox). Ao concluir: rode a verificação da tarefa, marque o checkbox, atualize `STATUS.md`. **Commit e push só quando o Guico pedir** (ele revisa antes); quando pedir, use Conventional Commits, inglês, assunto ≤ 60 caracteres.
3. Validação: `pnpm lint` e `pnpm typecheck` sempre; E2E da fase ao fechar um bloco; `pnpm build:demo` ao fechar a fase.
4. Ao fechar as fases 1, 5 e 6: rode `/review` (subagente `reviewer`) e corrija só achados reais.
5. Bloqueado por mais de 30 min: registre em `STATUS.md` (bloqueio, o que tentou, próxima ação), siga para uma tarefa independente.
6. Não expanda escopo. Cortes só os listados em `PLANEJAMENTO.md` D.0 e só se faltar tempo; registre em `STATUS.md`.
7. Ao encerrar uma sessão: `STATUS.md` atualizado e working tree limpo (commit ou stash descrito).

## Git

- Commits direto em `main`, build verde sempre. Commit e push só quando o Guico pedir; só o que foi pedido (confira `git diff --cached`).
- Nunca `push --force`.

## Segurança

- Não há segredos neste projeto. Nunca commitar tokens, chaves ou `.env` com valores reais. Credenciais fictícias dos mocks ficam documentadas no README.
