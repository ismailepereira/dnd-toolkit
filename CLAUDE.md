# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

D&D Toolkit — app web (PT-BR) para Mestre e jogadores de D&D 5e conduzirem campanhas: fichas de
personagem, iniciativa/combate, notas/NPCs, progressão de classe (12 classes, níveis 1-20), bestiário,
lojas, geradores rápidos e um tabuleiro-imagem ao vivo (sem grid) para a mesa.

Stack: **Flask (Python) + JS estático vanilla**, sem build step, sem framework front-end e sem bundler.
Persistência: **Firestore** (produção, tempo real) com fallback automático para **JSON local**
(`data/estado.json` e afins) quando não há credencial do Firebase.

## Comandos

```bash
pip install -r requirements.txt
cp .env.example .env      # editar credenciais
python app.py              # roda em http://localhost:5300
```

Testes (precisam de `npm install` uma vez, só para o Playwright do E2E):

```bash
npm run test:sintaxe   # node --check em todo static/js/ (roda na CI)
npm test               # tests/unit-regras.js — regras/dados puros (perícias, classes, CA/PV/CD)
npm run test:servidor  # tests/test-servidor.py — API de fichas (schema v2, PATCH otimista, posse por papel)
npm run test:e2e       # tests/run-e2e.sh — fluxo real no navegador (Criador, PDF) via Playwright
npm run test:tudo      # as quatro em sequência
```

- Rodar um teste isolado: `node tests/unit-regras.js` ou `python3 tests/test-servidor.py` diretamente.
- A CI (`.github/workflows/ci.yml`) roda só sintaxe + unit-regras + `py_compile app.py` + test-servidor
  a cada push — o E2E é local (precisa de Chromium).
- O E2E sobe o Flask com `DATA_DIR=tests/.data-teste` (descartável) e credenciais de teste — **nunca**
  toca em `data/` real.
- Convenção: todo bug corrigido no Criador/ficha ganha um caso de teste que o teria pego. Testes novos
  entram em `tests/` com prefixo `unit-` (sem navegador) ou `e2e-` (Playwright).

## Arquitetura

### Backend: `app.py` (arquivo único, ~2700 linhas)

Todas as rotas e regras de negócio vivem em `app.py` — não há blueprints nem pastas de módulo. Para
achar algo, procure a rota por `@app.route`. Seções principais, na ordem em que aparecem:

- **Estado da campanha**: `ESTADO_PADRAO` define o schema (fichas, combate, notas, encontros, npcs,
  lojas, aventura_ativa, tabuleiro). `carregar_estado()`/`salvar_estado()` leem/gravam por campanha.
- **Persistência dupla**: Firestore se houver credencial (`FIREBASE_KEY_JSON` ou `firebase-key.json`),
  senão arquivo JSON em `DATA_DIR`. `USE_LOCAL_DB=1` força o modo local mesmo com credencial presente
  (útil para dev sem tocar na campanha real).
- **Dois documentos por mesa** (Fase 18.2): `campanha/<id>` (bruto, só o Mestre lê) e
  `campanha_publica/<id>` (projeção sem `notasPrivadas`/notas não-compartilhadas, gerada por
  `_estado_publico()`) — é o que `jogador.js` escuta em tempo real. Isso é intencional: nunca mande o
  documento bruto para o cliente do jogador.
- **Papéis** (Fase A2): `papelGlobal` é admin/mestre/jogador, decidido no cadastro; `exige_papel(...)`
  é o gate central no servidor (diferente de `login_obrigatorio(papeis=...)`, que valida o papel
  *dentro* de uma campanha, não o papel global da conta). `eh_admin()` é o único ponto que decide quem
  é dono do produto — não duplicar essa regra em outro lugar.
- **Multi-campanha**: cada mesa é um documento `campanha/<id>` (padrão `principal`), isolado; o Mestre
  troca de campanha pelo cabeçalho.
- **Monetização por créditos** (Fase 23, `docs/MONETIZACAO.md`): campanha = R$5/mês = 20 créditos;
  jogador é grátis; créditos avulsos via Pix (AbacatePay, com fallback manual sem `ABACATEPAY_API_KEY`).
- **Rotas `/api/*`**: cada recurso de campanha (fichas, combate, notas, encontros, npcs, lojas,
  aventuras, tabuleiro) tem GET/PUT simples que carregam o estado inteiro, alteram a chave e salvam —
  exceto `/api/fichas/<fid>` (PATCH com trava otimista via carimbo `atualizadoEm`) e `/api/combate/acao`
  (ações granulares de turno).
- **Tempo real**: `/api/firebase_token` troca a sessão Flask por um token do Firebase Auth; o cliente
  usa esse token para ler a campanha via `firebase-rt.js` (regras em `firestore.rules` restringem
  leitura ao Mestre/membros — ver `SEGURANCA.md`).

### Frontend: `static/js/` (vanilla JS, um arquivo por área, sem módulos ES/bundler)

Arquivos grandes correspondem a áreas inteiras do produto, não a componentes pequenos:
`criador.js` (criador de ficha), `jogo.js` e `aventura.js` (condução do livro-jogo/aventura),
`mestre.html`/`jogador.js` (telas por papel), `monstros.js`/`aventurasprontas.js` (bestiário e
conteúdo), `compendio.js` (referência de regras), `regras.js`/`regras-ficha.js` (cálculos puros de
CA/PV/CD — é o que `tests/unit-regras.js` testa isoladamente), `tabuleiro.js` (tabuleiro-imagem ao
vivo), `firebase-rt.js` (assinatura em tempo real). `grid.js` e `mapa-ui.js` são do sistema de grid
antigo (Fase 14/15) — **dormentes**, fora do fluxo principal, não expandir (ver `docs/ARQUITETURA.md §1`).

### Templates: `templates/*.html` (Jinja2, sem componentização)

Uma página por papel/tela: `mestre.html`, `jogador.html`, `hub.html` (cards de modo pós-login),
`admin_dashboard.html`/`admin_assinaturas.html`, `campanhas.html`, `creditos.html`/`assinatura.html`.
PWA: `static/manifest.webmanifest` + `static/sw.js` cacheiam o plano de **preparação** (offline);
a **mesa ao vivo** (tabuleiro, iniciativa, NPCs visíveis) sempre exige conexão (Firestore).

### Modelo mental: dois planos (ver `docs/ARQUITETURA.md`)

- **Preparação & Referência** (offline via PWA): criador de ficha, subida de nível, compêndio,
  bestiário, geradores, escrever aventuras.
- **Mesa ao vivo** (exige Firestore/canal): tabuleiro-imagem, iniciativa, NPCs visíveis, handouts.

Ao decidir onde colocar uma feature nova, primeiro identifique em qual dos dois planos ela vive —
isso determina se precisa de rota `/api` + Firestore ou se pode ser só client-side/cacheável.

## Convenções deste repositório

- **Backup antes de editar**: para mudanças não triviais, copiar os arquivos afetados para
  `versoes/AAAA-MM-DD-descricao/` antes de editar, e registrar a entrada em `CHANGELOG.md` (com o
  caminho do backup) ao final — é a rede de segurança para reverter sem depender só do Git.
  `versoes/` é **local, não versionada** (está no `.gitignore` desde 18/08/2026): a pasta pesava
  30 MB e era 54% do repositório. Continue criando os backups ali normalmente — eles só não
  entram mais em commit.
  ⚠️ **Armadilha ao visitar commits anteriores a 18/08/2026**: naqueles commits `versoes/` ainda
  era rastreada, então dar `git checkout` num deles materializa os arquivos como rastreados e
  voltar para a `master` os **apaga do disco**. Se acontecer, restaure sem re-rastrear com
  `git archive 736cd27 versoes | tar -x` (`git checkout 736cd27 -- versoes/` não serve: ele
  devolve os arquivos ao índice).
  `README.md` de `tests/` documenta a convenção de nomes de teste.
- **Sem build step**: qualquer JS novo em `static/js/` precisa passar em `node --check` (é o que
  `test:sintaxe` valida) — não introduzir sintaxe que exija transpilação.
- **Segredos**: nunca commitar `.env` ou `firebase-key.json` (ambos gitignored). Em produção usar
  `FIREBASE_KEY_JSON`/Secret File do Render. Detalhe completo em `SEGURANCA.md`.
- **Roadmap ativo**: o topo de `ROADMAP.md` aponta para o documento de fase em vigor no momento
  (hoje `docs/ROADMAP-ACESSO-INTERFACE.md`) — checar lá antes de assumir prioridade.
