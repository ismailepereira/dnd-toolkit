# Testes do D&D Toolkit

Três camadas, da mais barata à mais completa:

| Comando | O que cobre | Precisa de |
|---|---|---|
| `npm run test:sintaxe` | `node --check` em todos os JS de `static/js/` | Node |
| `npm test` | Regras/dados puros (perícias, classes, divindades, patronos, antecedentes) | Node |
| `npm run test:e2e` | Fluxo real no navegador: Criador (Fé & Pacto, validação, piscar, scroll) e PDF completo | Node + `npm install` + Python/Flask + Chromium |

- As duas primeiras camadas rodam na CI (`.github/workflows/ci.yml`) a cada push.
- O E2E sobe o Flask com `DATA_DIR=tests/.data-teste` (descartável — **nunca** toca na `data/` real)
  e credenciais de mestre próprias de teste via env (`MESTRE_USER`/`MESTRE_SENHA`).
- Chromium: o Playwright baixa o seu na primeira vez (`npx playwright install chromium`);
  se já existir um em `/opt/pw-browsers/chromium` (ambiente do Claude Code) ele é usado
  automaticamente, ou aponte o seu com `PW_CHROMIUM=/caminho/do/chromium`.

## Convenção

Teste novo entra aqui dentro com prefixo `unit-` (puro, sem navegador) ou `e2e-`
(Playwright). Todo bug corrigido no Criador/ficha merece um caso de teste que o
teria pegado.
