# Kurio — NFT Marketplace

Implementação do desafio Frontend "Marketplace de NFTs" (enunciado completo em [`docs/CHALLENGE.md`](docs/CHALLENGE.md)). Backend, autenticação, carteiras, pagamentos e eventos em tempo real são simulados no navegador com MSW e uma integração compatível com o protocolo Socket.IO.

> Em construção. Plano: [`docs/planning/PLANEJAMENTO.md`](docs/planning/PLANEJAMENTO.md) · Estado: [`docs/plan/STATUS.md`](docs/plan/STATUS.md).

## Requisitos

- Node >= 22.12 (`.nvmrc` aponta para 24)
- pnpm 11

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev            # http://localhost:5173 com mocks ativos
```

## Scripts

| Comando                                        | O que faz                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                                     | servidor de desenvolvimento com mocks (`.env.development`)                   |
| `pnpm build` / `pnpm build:demo`               | build de produção / build com mocks ativos (usado no deploy e nos testes)    |
| `pnpm preview`                                 | serve `dist/` em `http://localhost:4173`                                     |
| `pnpm typecheck` / `pnpm lint` / `pnpm format` | TypeScript, ESLint (com boundaries) e Prettier                               |
| `pnpm test:unit`                               | Vitest (regras puras)                                                        |
| `pnpm test:e2e`                                | build demo + Playwright (projetos `desktop` e `mobile`)                      |
| `pnpm test:visual`                             | build demo + regressão visual (390/768/1440)                                 |
| `pnpm lighthouse`                              | 3 auditorias por página e perfil, mediana em `lighthouse/reports/summary.md` |

## Variáveis de ambiente

Ver [`.env.example`](.env.example). `VITE_ENABLE_MOCKS=true` liga a camada de mocks.

## Credenciais fictícias, cenários e reset

Preenchido na Fase 1 (ver `docs/plan/phase-1.md`).
