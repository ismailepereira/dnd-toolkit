# Changelog

Registo de alterações relevantes do D&D Toolkit. Cada entrada indica os
ficheiros tocados e, quando aplicável, a pasta de backup em `versoes/` com o
estado anterior desses ficheiros (para reverter sem depender só do Git).

## 2026-07-08 — Miniaturas de cenário no mapa (Fase 15.1)

**Backup antes da alteração:** `versoes/2026-07-08-fase15-1/`.

**Resumo:** Início do "editor de mapas" (Fase 15). O antigo modo "🧱 Obstáculos" virou um **modo Cenário** com uma **paleta de peças** que o Mestre coloca no grid clicando: **Parede** 🧱, **Elevação** ⛰️, **Escada** 🪜, **Alçapão** 🕳️, **Cadeira** 🪑, **Barril** 🛢️ e **Fogueira** 🔥. A Parede continua sendo obstáculo (dá cobertura + bloqueia visão, guardada em `mapa.obstaculos`); as demais são **miniaturas** guardadas num novo `mapa.objetos: [{tipo, x, y}]` e desenhadas como emoji no centro da célula, sob os tokens dos combatentes. Selecionar uma peça na paleta e clicar num quadrado coloca; clicar de novo com a mesma peça remove; clicar com outra peça troca. v1 é visual + tooltip (as mecânicas próprias de cada peça — vantagem de elevação, dano de fogueira — virão numa sub-fase). Opcional e retrocompatível: mapas sem objetos não mudam.

**Ficheiros alterados:**
- `static/js/mapa-ui.js` — catálogo `PROPS` (7 peças); estado `modoCenario`/`propAtivo` (substituem `modoObstaculo`); paleta `.mapa-paleta`; camada de edição generalizada (parede→obstáculo, demais→objeto, com colocar/trocar/remover); desenho dos objetos como emoji; `objetos: []` no mapa padrão; botão "🎭 Cenário".
- `static/css/style.css` — `.mapa-objeto`, `.mapa-paleta`, `.mapa-prop`(`.on`).
- `ROADMAP.md` — Fase 15 aberta com 15.1 entregue.

**Testes:** ao vivo no preview com o login do Ismaile — paleta rende as 7 peças; selecionar Barril → clicar (5,5) grava `{tipo:'barril',x:5,y:5}` em `mapa.objetos` e desenha 🛢️; Fogueira em (6,5) → 🔥; Parede em (7,5) → entra em `mapa.obstaculos` (mantém a cobertura); clicar de novo no Barril remove-o (fogueira permanece); 0 erros no console; combate de teste limpo no fim. (Nota: um segundo servidor rodando na mesma pasta recarregava a página entre passos — a verificação foi feita em evals únicos e síncronos.)

**Próximo (Fase 15):** 15.2 biblioteca de mapas salvos; 15.3 mapa por nó da aventura; 15.4 gerador de masmorras. E as mecânicas por peça (elevação/escada/alçapão/fogueira).

**Como reverter:** restaurar `static/js/mapa-ui.js` e `static/css/style.css` de `versoes/2026-07-08-fase15-1/` e reverter a linha do ROADMAP.

---

## 2026-07-08 — Obstáculos + cobertura no mapa (Fase 14.4)

**Backup antes da alteração:** `versoes/2026-07-08-fase14-4/`.

**Resumo:** O Mestre agora desenha **paredes/obstáculos** no mapa tático e o jogo calcula **cobertura** entre atacante e alvo. `grid.js` ganhou `nivelDeCobertura(a, b, obstaculos)`: percorre as células do caminho (Bresenham, via `celulasEntre`) e devolve o obstáculo de cobertura mais forte encontrado — `meia` (+2 CA/DES), `tresQuartos` (+5) ou `total` (não pode ser alvo direto → `semLinhaDeVisao: true`). No `mapa-ui.js`, um botão **"🧱 Obstáculos"** liga um modo de edição: clicar num quadrado adiciona/remove uma parede (`{x, y, bloqueiaVisao: true, cobertura: 'meia'}`), desenhada como quadrado escuro; enquanto isso o clique não move tokens. O topo do mapa, quando há alvo selecionado, mostra a cobertura do combatente do turno até o alvo (ex.: "· 🧱 meia cobertura (+2 CA)" ou "cobertura total (sem alvo direto)"). Tudo opcional e retrocompatível: sem obstáculos, nada muda.

**Ficheiros alterados:**
- `static/js/grid.js` — `nivelDeCobertura()` (+ tabelas de rank/CA de cobertura) exportada em `Grid`.
- `static/js/mapa-ui.js` — estado `modoObstaculo`; botão "🧱 Obstáculos"; camada de células de edição (adiciona/remove parede); desenho dos obstáculos; cobertura no topo; move de token bloqueado enquanto em modo obstáculo.
- `static/css/style.css` — `.mapa-obstaculo`(`.total`) e `.mapa-cel-obst`.
- `ROADMAP.md` / `docs/ROADMAP-FUTURO.md` — 14.4 marcada como entregue.

**Testes:** ao vivo no preview — `Grid.nivelDeCobertura` validado (sem obstáculo → nenhuma/+0; meia no caminho → +2; total → sem linha de visão; obstáculo fora do caminho → ignorado; dois obstáculos → pega o mais forte, três-quartos +5); fluxo de UI: 2 goblins em (2,5) e (8,5) → ativar mapa → botão "🧱 Obstáculos" → 192 células de edição → clicar (5,5) adiciona a parede (no estado e desenhada) → topo mostra "meia cobertura (+2 CA)"; clicar (5,5) de novo remove (cobertura some); screenshot confirma a parede marrom entre atacante (anel dourado) e alvo (anel vermelho); 0 erros no console; combate de teste limpo (0 combatentes, mapa null).

**Próximo (14.5+):** overlay de áreas de efeito ao conjurar magia (círculo/cone/linha) listando quem é afetado; depois 14.6 (imagem de fundo).

**Como reverter:** restaurar `static/js/grid.js`, `static/js/mapa-ui.js` e `static/css/style.css` de `versoes/2026-07-08-fase14-4/` e reverter as linhas dos roadmaps.

---

## 2026-07-08 — Grid ligado à ajuda tática (Fase 14.3)

**Backup antes da alteração:** `versoes/2026-07-08-fase14-3/`.

**Resumo:** Fecha o elo prometido desde a Fase 8A: quando há um **mapa tático ativo** no combate, a ajuda tática do jogador (Modo de Jogo) deixa de depender dos toggles manuais e passa a **detectar adjacência de verdade pelo grid**. Nova função `adjacenciaAutoDoMapa(f)` em `jogo.js`: localiza o combatente do jogador no `window.COMBATE_ATUAL` pelo `fichaId`, e com `Grid.adjacentes` calcula "inimigo adjacente a mim" (algum inimigo vivo a ≤1 quadrado) e "aliado adjacente ao alvo" (algum aliado vivo adjacente ao alvo selecionado via `jgAlvoId`, da C1). Esses valores substituem os do `estadoTatico` no contexto passado a `opcoesTurno`/`dicasContextuais`/`combosSugeridos` (ex.: a dica de Ataque Furtivo do Ladino agora acende sozinha quando um aliado está de fato colado no alvo). Na UI, os dois toggles manuais de adjacência viram **chips só-leitura "(auto)"** mostrando sim/não (ou "—" quando não há alvo); sem mapa ativo — ou sem o token do jogador posicionado — tudo cai de volta aos **toggles manuais** de antes (retrocompatível, "theatre of the mind" continua a funcionar). `emFuria`/`caído` seguem manuais (o grid não sabe disso).

**Ficheiros alterados:**
- `static/js/jogo.js` — `adjacenciaAutoDoMapa(f)`; `etEfetivo` (estadoTatico com adjacência auto) alimenta o `ctxTatico`; os dois toggles de adjacência renderizam como chip `.auto` quando há mapa.
- `static/css/style.css` — `.check-chip.auto` (borda tracejada, cursor default, `small` esmaecido).
- `ROADMAP.md` / `docs/ROADMAP-FUTURO.md` — 14.3 marcada como entregue.

**Testes:** ao vivo no preview — `Jogo`/`Grid`/`MapaCombate` carregam, 0 erros no console; abrindo o Modo de Jogo com uma ficha e um `COMBATE_ATUAL` com mapa: PJ em (5,5) + goblin em (5,6) → chip "🎯 Inimigo adjacente: **sim** (auto)" e checkbox manual ausente; goblin movido para (10,10) → "**não** (auto)"; `mapa=null` → o checkbox manual `#jgEtInimigo` volta e 0 chips auto (fallback); sem alvo selecionado, o chip do aliado mostra "—". Estado do servidor conferido limpo no fim (0 fichas, 0 combatentes, mapa null).

**Como reverter:** restaurar `static/js/jogo.js` e `static/css/style.css` de `versoes/2026-07-08-fase14-3/` e reverter as linhas dos roadmaps.

---

## 2026-07-08 — Grid Virtual / mapa de combate, v1 (Fase 14.1 + 14.2)

**Backup antes da alteração:** `versoes/2026-07-08-fase14-grid/`.

**Resumo:** Primeira versão do maior item estrutural do roadmap: dar posição real (x,y) aos combatentes e um mapa tático em grade. Duas peças novas: (1) **`grid.js`** — matemática pura de grelha 5e, sem DOM: distância de Chebyshev (diagonal = 1 quadrado = 1,5 m), alcance em metros, adjacência, `parseAlcanceMetros` (extrai de "18m"/"(24/96m)"/"Toque"), área de efeito circular, e linha de visão por Bresenham contra obstáculos. (2) **`mapa-ui.js`** (`MapaCombate`) — grid SVG lisco (sem imagem de fundo) desenhado sob a lista de combate: um token por combatente (cor por tipo — PJ verde, aliado azul, inimigo vermelho, caído cinza; iniciais no centro), com anéis de destaque para o turno atual (dourado) e o alvo selecionado (vermelho). O Mestre **ativa o mapa** por um botão (posiciona automaticamente quem não tem `pos`), **move** por clique-no-token-depois-clique-na-célula, e vê no topo a **distância/adjacência** do combatente do turno até o alvo. Retrocompatível: sem mapa, o combate continua exatamente como antes (lista pura); jogadores veriam em modo leitura. Integração aditiva na aba Combate do Mestre.

**Ficheiros:**
- **Novo** `static/js/grid.js` — funções puras (`distanciaQuadros`, `distanciaMetros`, `adjacentes`, `dentroDoAlcanceMetros`, `parseAlcanceMetros`, `dentroDaArea`, `combatentesNaArea`, `celulasEntre`, `temLinhaDeVisao`); expostas em `window.Grid` + `module.exports`.
- **Novo** `static/js/mapa-ui.js` — `MapaCombate.render(container, combate, {ehMestre, alvoId, onMudou})`, `ativarMapa`, `posicionarFaltantes`.
- `static/js/app.js` — hook no fim de `renderCombate()` que chama `MapaCombate.render` no `#mapaCombate` (só quando o módulo existe), passando `EH_MESTRE`, o alvo selecionado e `salvarCombate` como `onMudou`.
- `templates/mestre.html` — `<div id="mapaCombate">` na aba Combate + `<script>` de `grid.js` e `mapa-ui.js`.
- `static/css/style.css` — estilos `.mapa-*` (grelha, tokens, anéis de turno/alvo/pego, células-alvo clicáveis); o mapa ocupa a largura toda da aba (`grid-column: 1 / -1`).
- `app.py` — `ESTADO_PADRAO['combate']['mapa'] = None` (opcional, retrocompatível).
- `ROADMAP.md` / `docs/ROADMAP-FUTURO.md` — Fase 14 marcada como v1 (14.1+14.2).

**Testes:** ao vivo no preview com o login do Ismaile — `grid.js` validado com ~13 asserções (Chebyshev=4, 6 m, adjacência sim/não, alcance, `parseAlcanceMetros` 18/24/1.5, área círculo dentro/fora, `celulasEntre` exclui extremos, LDV com/sem obstáculo); fluxo de UI: 2 goblins → botão "Ativar mapa tático" → grid 16×12 com 2 tokens auto-posicionados → pegar token (192 células clicáveis = 16×12) → mover para (5,5) (posição persistida, células limpas ao largar) → distância "Goblin 2 → Goblin 1: 5 quadrado(s) (7.5 m)"; screenshot confirma a grelha com anéis de turno (dourado) e alvo (vermelho); zero erros no console; dados de teste do combate limpos no fim.

**Próximo (14.3+):** trocar os toggles manuais da Fase 8A (`ajudatatica.js`) por detecção real via `grid.js` quando há mapa ativo; obstáculos + cobertura; overlay de áreas de efeito ao conjurar; imagem de fundo.

**Como reverter:** apagar `static/js/grid.js` e `static/js/mapa-ui.js`; restaurar `app.py`, `static/js/app.js`, `templates/mestre.html` e `static/css/style.css` de `versoes/2026-07-08-fase14-grid/`; reverter as linhas dos roadmaps.

---

## 2026-07-08 — Integração com IA: gerar história do personagem (U2 v1)

**Backup antes da alteração:** `versoes/2026-07-08-u2-ia/`.

**Resumo:** Primeira integração com IA (Anthropic/Claude). Novo endpoint `POST /api/ia/gerar` (+ `GET /api/ia/status`) no servidor que chama a API da Anthropic via SDK oficial, com a **chave sempre no servidor** (`ANTHROPIC_API_KEY`), nunca no cliente. É gated por `login_obrigatorio` (assinatura ativa — contas legadas passam) e por **quota diária por utilizador** (`IA_QUOTA_DIARIA`, padrão 20, guardada em `data/ia_uso.json`), para controlar custo. O **modelo é configurável** (`IA_MODELO`, padrão `claude-haiku-4-5` — barato e ótimo para textos curtos de mesa; troque para `claude-opus-4-8` se quiser respostas mais ricas). Suporta 4 tipos de prompt (`historia`, `npc`, `gancho`, `ambiente`); a v1 liga o frontend só na **história prévia do Criador**: botão "✨ Gerar com IA" que monta o contexto (raça/classe/subclasse/antecedente/nível/personalidade), chama o endpoint e preenche o textarea. O botão **só aparece se o servidor tiver a chave** — sem ela, tudo degrada suave (botões ocultos, resto do app 100% intacto).

**Ficheiros alterados:**
- `app.py` — `GET /api/ia/status`, `POST /api/ia/gerar`; helpers `_anthropic_client()` (lazy, None sem chave/SDK), `_ia_quota_hoje`/`_ia_registar_uso` (quota em `data/ia_uso.json`); prompts `_IA_PROMPTS`; envs `IA_MODELO`/`IA_QUOTA_DIARIA`.
- `requirements.txt` — `anthropic>=0.40`.
- `templates/_criador.html` — botão `#cIaHistoria` (oculto por padrão).
- `static/js/criador.js` — `setupIaHistoria()`: consulta `/api/ia/status` (mostra o botão + quota no title), monta o contexto e chama `/api/ia/gerar`, com estados de "Gerando..."/erro amigável.
- `.env.example` — `ANTHROPIC_API_KEY` (vazio), `IA_MODELO`, `IA_QUOTA_DIARIA`.
- `ROADMAP.md` / `docs/ROADMAP-FUTURO.md` — U2 marcado como entregue (v1).

**Testes:** ao vivo no preview com o login do Ismaile — sem chave: `/api/ia/status` → `{disponivel:false}`, `/api/ia/gerar` → 503 amigável, tipo inválido → 400, tudo gated por login; com chave fictícia: `disponivel:true`, o SDK é chamado corretamente (snippet isolado confirmou `AuthenticationError` 401 — cabeamento certo, não bug de código) e o botão "✨ Gerar com IA" aparece no Criador com a quota no tooltip ("20/20"); zero erros no console; dados de teste (`data/ia_uso.json`, chave fictícia) limpos.

**Pendências do Mestre (não-código):** pôr um `ANTHROPIC_API_KEY` real no `.env` local e nas envs do Render para ligar a geração; decidir orçamento mensal e se o custo entra na assinatura ou vira recurso premium.

**Como reverter:** restaurar `app.py`, `requirements.txt`, `templates/_criador.html`, `static/js/criador.js` e `.env.example` de `versoes/2026-07-08-u2-ia/`, reverter as linhas dos roadmaps e (opcional) `pip uninstall anthropic`.

---

## 2026-07-08 — Loja em cartões com feedback de compra (U1)

**Backup antes da alteração:** `versoes/2026-07-08-u1-loja-cartoes/`.

**Resumo:** A loja do jogador (Criador — passo 5 — e Modo de Jogo) deixa de ser uma lista de linhas e passa a uma **grade de cartões**: ícone grande por categoria (reaproveitando os emojis de `CATEGORIAS_LOJA`), nome, descrição (2 linhas com reticências + tooltip), preço em dourado e botão "Comprar" de largura total. Ao comprar, uma **bolha flutuante "−X po 💰"** sobe a partir do botão (anexada ao `<body>` para sobreviver ao re-render) e o cartão pisca com borda verde. É pura reforma de UI: os dados, preços, filtros por categoria, abas Básica/Especial, travas de proficiência e o fluxo de compra/ouro continuam idênticos. O painel de itens do Mestre (`.item-card`/`.loja-grid`) não foi tocado.

**Ficheiros alterados:**
- `static/js/loja.js` — helpers de apresentação `iconeCategoriaLoja()`, `cardLojaHtml()` e `lojaFeedbackCompra()` (expostos em `window`); nenhuma mudança de dados.
- `static/js/jogo.js` — `linhaLojaJg` monta cartão via `cardLojaHtml`; grupos embrulhados em `.loja-cards`; handler `data-lojaadd` dispara a bolha antes do re-render.
- `static/js/criador.js` — `linhaItem` monta cartão (preserva cadeado de proficiência/✨ especial); grupos em `.loja-cards`; handler `data-comprar` dispara a bolha (só quando há custo de ouro, não em modo NPC).
- `static/css/style.css` — `.loja-cards`/`.loja-card`/`.loja-card-ico|nome|desc|rodape|preco`, estado `.comprado` e `.loja-fx-bolha` com keyframes `lojaFxSobe`.
- `ROADMAP.md` / `docs/ROADMAP-FUTURO.md` — U1 marcado como entregue.

**Testes:** verificado ao vivo no preview com o login do Ismaile — `mestre.html` carrega sem erro no console; `Criador`/`Jogo` e os helpers definidos; loja básica real (38 armas) renderizada em cartões com ícone ⚔️/nome/descrição/preço; `lojaFeedbackCompra` cria a bolha "−2 po 💰" e marca o cartão como `.comprado` (borda verde confirmada em screenshot). Dados de teste limpos.

**Como reverter:** restaurar `static/js/loja.js`, `static/js/criador.js`, `static/js/jogo.js` e `static/css/style.css` de `versoes/2026-07-08-u1-loja-cartoes/` e reverter as duas linhas dos roadmaps.

---

## 2026-07-08 — Campanha pronta: Mina Perdida de Phandelver, Cap. 1 (CT1)

**Backup antes da alteração:** `versoes/2026-07-08-ct1-phandelver/`.

**Resumo:** Primeira campanha pronta do módulo clássico de introdução ao D&D 5e — **"Mina Perdida de Phandelver — Emboscada Goblin"** (Capítulo 1, "Flechas Goblin") — adicionada à biblioteca de aventuras prontas no mesmo formato de livro-jogo do "Ninho da Rainha Dragão". É um grafo de 14 nós, calibrado para 4-5 PJs de nível 1-2, com ramificação real: a emboscada na Trilha de Triboar (com rota cautelosa que dá vantagem), o rasto até o Esconderijo Cragmaw (canil dos lobos ou ponte da represa), a proposta de Yeemik (aceitar o trato, atacar com o refém em risco, ou dobrá-lo na conversa), o covil do chefe bugbear Klarg, o resgate de Sildar Hallwinter (que revela o gancho do Aranha Negra / Castelo Cragmaw / mapa da Mina) e três finais (vitória em Phandalin, neutro por abandonar o resgate, derrota jogável por acordar o esconderijo inteiro). Todos os NPCs (Gundren, Sildar, Yeemik, Klarg) estão embutidos por nó com notas do Mestre; os encontros referenciam nomes exatos do bestiário (Goblin, Goblin Mestre, Bugbear, Lobo — todos já existentes).

**Ficheiros alterados:**
- `static/js/aventurasprontas.js` — nova entrada `modelo_phandelver_emboscada` no array `AVENTURAS_PRONTAS` (14 nós; sem mudança de esquema — reusa o formato existente).
- `ROADMAP.md` / `docs/ROADMAP-FUTURO.md` — CT1 marcado como entregue.

**Testes:** validação de integridade do grafo (14 nós, 0 saídas quebradas, 0 nós inalcançáveis a partir de `noInicial`, os 3 tipos de final com `resultado`); nomes de monstros conferidos 1:1 com `monstros.js`; sem apóstrofos não escapados; verificado ao vivo no preview com o login do Ismaile: `mestre.html` carrega `AVENTURAS_PRONTAS` com a nova aventura, 0 erros no console, e o round-trip de JSON da importação resolve o nó inicial ("A Trilha de Triboar") e todas as saídas.

**Como reverter:** restaurar `static/js/aventurasprontas.js` de `versoes/2026-07-08-ct1-phandelver/` e reverter as duas linhas dos roadmaps.

---

## 2026-07-06 — NPCs por nó na aventura (P2 do livro-jogo)

**Backup antes da alteração:** `versoes/2026-07-06-p2-npcs/`.

**Resumo:** Os NPCs de história (Nighthill, Leosin, Cyanwrath...) deixam de viver só na narração e passam a ser figuras apresentáveis por nó. Cada nó ganha `npcs: [{nome, tipo, descricao, notasPrivadas}]` embutidos (auto-contidos — sem referências a ids externos, então importar/iniciar não precisa criar nada). Na condução, cada NPC do nó atual aparece como cartão (nome, tipo, descrição, notas 🔒) com botão "👁️ Apresentar aos jogadores" que cria o NPC na campanha já VISÍVEL, sem duplicar (dedup por nome). O editor de nós ganhou uma secção para adicionar/editar NPCs. A aventura pronta do Ninho da Rainha Dragão traz 6 nós com o elenco: Linan Swift (família), Governador Nighthill + sacerdote Falconmoon (fortaleza), Cyanwrath (duelo), Nesim (amanhecer), Leosin (fuga) e Mondath (santuário).

**Ficheiros alterados:**
- `static/js/npc.js` — `window.npcAdicionarExterno(dados)`: dono único do array de NPCs cria um NPC visível na campanha (evita corrida com `/api/npcs`), com dedup por nome; retorna 'novo'|'existente'|'sem-nome'|'sem-permissao'.
- `static/js/aventura.js` — `AVENTURA_NPC_TIPOS`; secção de NPCs no editor de nós (add/editar/remover); cartões de NPC na condução com botão "Apresentar".
- `static/js/aventurasprontas.js` — 6 nós do Ninho enriquecidos com NPCs.
- `static/css/style.css` — `.av-npc-edit`/`.av-npc-cond`.
- `docs/LIVRO-JOGO.md` — P2 marcado ✅.

**Testes:** `node --check` (aventura/npc/aventurasprontas); harness Node do grafo estendido (NPCs por nó: nome, tipo válido, descrição/notas presentes; ≥5 NPCs no modelo — grafo continua 0 erros/0 avisos); verificado ao vivo no preview com o login do Ismaile: nó da fortaleza mostra os 2 cartões com botão, `npcAdicionarExterno` cria o NPC visível com notas e não duplica na 2ª chamada; dados de teste limpos, `data/` real intacta.

**Como reverter:** restaurar `static/js/npc.js`, `static/js/aventura.js`, `static/js/aventurasprontas.js`, `static/css/style.css` e `docs/LIVRO-JOGO.md` de `versoes/2026-07-06-p2-npcs/`.

---

## 2026-07-06 — Segurança: PUT /api/fichas validado no servidor

**Backup antes da alteração:** `versoes/2026-07-06-seg-fichas/`.

**Resumo:** Fecha um furo de integridade: antes, qualquer jogador logado
podia reescrever TODAS as fichas da mesa (ouro/XP de qualquer personagem)
com um único `PUT /api/fichas` — a posse e a regra B2 (XP só via Mestre)
eram apenas do lado do cliente. Agora o servidor arbitra o PUT do jogador:
- o jogador só altera fichas PRÓPRIAS (o seu `donoUid`, ou fichas legadas
  sem dono); fichas de outros donos são preservadas do estado gravado,
  ignorando o array enviado;
- `xp` é sempre preservado do valor gravado (B2 — XP só entra via Mestre);
- `donoUid` não pode ser reatribuído (evita roubo/troca de dono);
- revivência (morto→vivo) fica com o Mestre; morrer (vivo→morto) é livre;
- ficha nova criada pelo jogador recebe `donoUid` do próprio;
- payload não-lista → 400.
O Mestre mantém controlo total (concede XP/ouro, revive) — o caminho dele
não passa pela sanitização. **Limitação conhecida:** `ouro` continua
editável na ficha própria do jogador porque a loja base do Modo de Jogo
debita no cliente; o fix definitivo é validar a loja base no servidor
(como já fazem as lojas de NPC da Fase 12) — anotado no roadmap.

**Ficheiros alterados:**
- `app.py` — helper `_sanitizar_fichas_jogador` + `PUT /api/fichas` passa a
  ramificar por papel (Mestre: livre; jogador: sanitizado).

**Testes:** `py_compile`; harness Flask com 3 contas (Mestre + 2 jogadores,
`DATA_DIR` temporário): jogador edita só a própria ficha, XP travado, não
rouba/reescreve/omite fichas alheias, morre mas não revive sozinho, apaga
só a própria, Mestre concede XP/ouro/revive, payload inválido 400.
Verificado ao vivo: o Mestre (Ismaile) continua a gravar ficha com XP/ouro
(PUT 200) no preview.

**Como reverter:** restaurar `app.py` de `versoes/2026-07-06-seg-fichas/`.

---

## 2026-07-05 — Escolhas dos jogadores com votação (P1 do livro-jogo) + DATA_DIR

**Backup antes da alteração:** `versoes/2026-07-05-p1-livrojogo/`.

**Resumo:** Os jogadores agora participam da aventura: nova aba "📖 História" na tela do jogador mostra a cena atual (título + narração pública — as `notasMestre` NUNCA saem do servidor, mesmo filtro de `/api/npcs`). Na condução, o Mestre ganha o botão "🗳️ Abrir escolhas aos jogadores": os jogadores veem os botões de escolha (com avisos 💀/🚧), votam e podem trocar o voto (substitui, não duplica); a contagem e os nomes aparecem para todos, e o Mestre vê os votos ao lado de cada saída (atualização a cada 6s). Avançar de nó fecha a votação e limpa os votos — a palavra final é sempre do Mestre. Extra de segurança de desenvolvimento: `DATA_DIR` (env) no `app.py` permite apontar a pasta de dados do modo local para outro sítio — os harnesses de teste agora usam uma pasta temporária descartável e NUNCA tocam na `data/` real (na sequência do incidente de hoje em que limpezas de teste apagaram dados locais).

**Ficheiros alterados:**
- `app.py` — visão pública do nó para o jogador em `GET /api/aventura_ativa` (narração sem notas; saídas/votos só com votação aberta), `POST /api/aventura_ativa/votar` (valida votação aberta e escolha existente; 1 voto por utilizador), ações `abrirEscolhas` no POST do Mestre, avanço de nó limpa votação; `DATA_DIR` configurável por env.
- `static/js/jogador.js` — painel "A História" (polling 6s, cache anti-re-render, votação, normalização do shape do Mestre em "Ver como Jogador").
- `static/js/aventura.js` — botão "🗳️ Abrir/Fechar votação" na condução, votos por saída (contagem + nomes), poll de votos enquanto aberta.
- `templates/jogador.html` — aba "📖 História".

**Testes:** `py_compile` + `node --check` + Jinja; harness Flask com 3 contas (mestre + 2 jogadores, `DATA_DIR` temporário): narração pública sem vazamento de `notasMestre`, voto com votação fechada 400, abertura expõe saídas com avisos, votos somam e trocam sem duplicar, voto inválido 400, Mestre vê o dict completo, avançar limpa votação, encerrar zera tudo; fluxo verificado ao vivo no preview com o login do Ismaile (aba História, voto pelo botão, troca de voto, contagem no Mestre) — a `data/` real ficou intacta durante os testes.

**Como reverter:** restaurar `app.py`, `static/js/jogador.js`, `static/js/aventura.js` e `templates/jogador.html` de `versoes/2026-07-05-p1-livrojogo/`.

---

## 2026-07-05 — Ninho da Rainha Dragão completo + bestiário do culto + guia do processo (Passo K2c)

**Backup antes da alteração:** `versoes/2026-07-05-k2c/`.

**Resumo:** (1) **Bestiário**: nova categoria "Culto do Dragão" com 6 criaturas próprias do módulo, todas com `loot` (Fase 13): Garra do Dragão, Guarda Draco, Draco de Emboscada, **Langdedrosa Cyanwrath** (meio-dragão, com o traço do duelo de honra), **Frulam Mondath** (sacerdotisa; os registos do chocadouro são drop garantido — gancho do próximo arco) e **Lennithon, Dragão Azul Adulto** (CR 16, com AVISO AO MESTRE de condução por moral). (2) **Aventura expandida de 19 → 29 nós**: os stand-ins foram substituídos pelos monstros reais e o arco ganhou o Episódio 3 (Chocadouro): retorno ao acampamento abandonado, rota furtiva pela fenda vs. entrada com armadilhas kobold, salão dos fungos com guardas dracos, a decisão moral dos ovos de dragão, o santuário de Mondath e a revanche de Cyanwrath; agora são 2 finais de vitória (arco curto "Heróis de Greenest" e arco completo "O Chocadouro cai"), 4 derrotas jogáveis e 2 finais neutros. (3) **`docs/LIVRO-JOGO.md`** (novo): guia do processo de montar aventuras jogáveis (pipeline bestiário → NPCs → grafo → validação → teste de mesa) + roadmap P1-P7 do que falta para os jogadores jogarem (escolhas na tela deles, NPCs por nó, partilha, canvas, grid por nó, loot/XP integrados, mais modelos).

**Ficheiros alterados:**
- `static/js/monstros.js` — 6 monstros novos (categoria "Culto do Dragão", com loot).
- `static/js/aventurasprontas.js` — aventura expandida para 29 nós (Episódios 1-3).
- `docs/LIVRO-JOGO.md` (NOVO) — guia do processo + roadmap dos jogadores.

**Testes:** `node --check`; harness do grafo (0 erros, 0 avisos; nomes de monstros validados; narração/notas em todos os 29 nós; finais corretos); harness de loot (20 monstros com loot próprio, rolagem sem erro em todo o bestiário); verificado ao vivo no preview (categoria no filtro do bestiário, modelo com 29 nós, biblioteca do Ismaile atualizada para a versão completa).

**Como reverter:** restaurar `static/js/monstros.js` e `static/js/aventurasprontas.js` de `versoes/2026-07-05-k2c/`; apagar `docs/LIVRO-JOGO.md`.

---

## 2026-07-05 — Preparação de deploy no Render

**Backup antes da alteração:** `versoes/2026-07-05-deploy/`.

**Resumo:** `render.yaml` atualizado com as variáveis da Fase 10.9 (`TRIAL_DIAS`, `ASSINATURA_PRECO`, `PIX_CHAVE`, `CONTATO_PAGAMENTO` — as duas últimas `sync: false`, preencher no painel) e notas sobre a credencial do Firestore (Secret File `firebase-key.json` → `/etc/secrets/`; sem ela o armazenamento no Render é EFÉMERO). Nenhuma mudança de código.

**Como reverter:** restaurar `render.yaml` de `versoes/2026-07-05-deploy/`.

---

## 2026-07-05 — Aventura pronta: Ninho da Rainha Dragão (Passo K2b)

**Backup antes da alteração:** `versoes/2026-07-05-k2b/`
(cópia de todos os ficheiros tocados).

**Resumo:** Primeira aventura oficial no formato livro-jogo: "Ninho da Rainha Dragão — Greenest em Chamas" (arco de abertura do módulo), disponível como MODELO importável pelo botão "📚 Importar modelo" na aba Aventura (copia para a biblioteca pessoal com id novo — o Mestre adapta tudo sem afetar o modelo; importar 2× cria 2 cópias independentes). O grafo tem 18 nós: ponto de partida com 4 escolhas, hub central na fortaleza (várias entradas — rede, não árvore), 2 becos/finais neutros (esconder-se; ficar a reconstruir), 3 caminhos de morte sinalizados 💀 (horda nas ruas, perseguir o dragão, ataque frontal ao acampamento), o duelo assinatura contra o meio-dragão, e a rota de infiltração até a vitória (resgate do monge Leosin). Cada nó traz narração para ler, notas privadas de condução para Mestres iniciantes (moral do dragão, stand-ins de stats, alternativas a TPK) e encontros calibrados para 4-5 PJs nível 1-3 com monstros do bestiário.

**Ficheiros alterados:**
- `static/js/aventurasprontas.js` (NOVO) — registo `AVENTURAS_PRONTAS` com a aventura completa (extensível: novos modelos são só novas entradas).
- `static/js/aventura.js` — botão "📚 Importar modelo" (escolha por prompt quando houver vários; cópia profunda com id novo).
- `templates/mestre.html` — botão na aba Aventura + script tag do novo ficheiro.

**Testes:** `node --check`; harness Node validou o modelo com `validarAventura` (zero erros E zero avisos — sem órfãos, sem becos não marcados, caminho de vitória alcançável), todos os monstros dos encontros existem no bestiário com qtd válida, narração/notas preenchidas em todos os nós, finais corretos (vitória + 3 derrotas + 2 neutros), nó inicial com 4+ escolhas e hub com múltiplas entradas; sintaxe Jinja OK.

**Como reverter:**
1. Restaurar `static/js/aventura.js`, `templates/mestre.html`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-k2b/`.
2. Apagar `static/js/aventurasprontas.js`.

---

## 2026-07-05 — Livro-jogo v1: aventuras como grafo de nós/escolhas (Passo K2)

**Backup antes da alteração:** `versoes/2026-07-05-k2/`
(cópia de todos os ficheiros tocados).

**Resumo:** O K2 evoluiu de "mapa mental" para um motor de livro-jogo (arquitetura combinada com o Ismaile em 05/07). Nova aba "📖 Aventura" no Mestre com: biblioteca PESSOAL de aventuras (`aventuras/<uid>`, segue o autor entre campanhas — padrão M4); editor de grafo em lista (nós com título, tipo — narração/encontro/social/assalto/descanso/final —, narração para ler, notas privadas 🔒, encontro do bestiário e saídas com rótulo + aviso 💀 mortal / 🚧 sem saída); validador de grafo ("🔍 Verificar": ids duplicados, saídas para nós inexistentes, nós órfãos via BFS, becos não marcados como final, ausência de caminho de vitória); "▶ Iniciar" copia a definição para a mesa (SNAPSHOT — editar a biblioteca depois não muda a aventura em curso); painel de condução no topo da aba (narração do nó atual, "⚔️ Lançar no combate" reusa `addMonstro`, "✓ Marcar vencido", botões de escolha para avançar com trilha percorrida, encerrar). Jogador por enquanto só sabe o título/que há aventura em curso — as escolhas na tela dele são a próxima fase (decisão do Ismaile).

**Ficheiros alterados:**
- `app.py` — `ESTADO_PADRAO['aventura_ativa']`; helpers + rotas `GET/PUT /api/aventuras` (biblioteca pessoal, cap 50) e `GET/POST /api/aventura_ativa` (iniciar com validação de definição/nó inicial, avançar com validação de destino, completar nó, encerrar; jogador recebe visão limitada).
- `static/js/aventura.js` (NOVO) — funções puras `validarAventura` (BFS) e `noDaAventura` (export CommonJS p/ testes) + UI completa (biblioteca, editor em lista, condução).
- `templates/mestre.html` — aba "📖 Aventura" + secção + script tag.
- `static/css/style.css` — estilos `.av-no`/`.av-sub`/`.av-conducao`.
- `.gitignore` — `data/aventuras.json`.
- `docs/ROADMAP-FUTURO.md` — K2 reescrito com a arquitetura do livro-jogo, v1 marcada ✅ e os 6 próximos passos (escolhas dos jogadores, NPCs por nó, partilha, canvas SVG, grid por nó, Phandelver neste formato).

**Testes:** `node --check`; harness Node do validador (grafo do exemplo "ponto 0 com 6 caminhos" — 1 beco, 1 morte, caminhos cruzados até a vitória —, todos os defeitos detetados, ciclos sem loop infinito; **apanhou um bug real**: `fila.shift()` dentro do callback do `find` corrompia a BFS — corrigido); harness Flask (campanha isolada, limpa no fim): biblioteca pessoal e isolada por utilizador, PUT não-lista 400, iniciar com snapshot, definições inválidas 400, jogador com visão limitada e sem poder conduzir, completar/avançar com validação de destino, snapshot imune a edições da biblioteca, encerrar; `py_compile` + Jinja OK.

**Como reverter:**
1. Restaurar `app.py`, `templates/mestre.html`, `static/css/style.css`, `.gitignore`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-k2/`.
2. Apagar `static/js/aventura.js`.

---

## 2026-07-05 — Lojas geridas por NPC (Fase 12)

**Backup antes da alteração:** `versoes/2026-07-05-f12/`
(cópia de todos os ficheiros tocados).

**Resumo:** NPCs lojistas agora têm loja própria com estoque e preços definidos pelo Mestre. No cartão do NPC lojista, o Mestre ganha o botão "🛒 Loja" (editor em modal: adicionar itens de qualquer catálogo — básico, mágicos e itens do Mestre —, preço próprio por item, qtd finita ou −1 = infinito, toggle "compra dos aventureiros" com percentagem do preço). O jogador vê "🛒 Ver loja" nos NPCs lojistas visíveis: compra com uma ficha própria (débito de ouro + decremento de estoque) e vende de volta itens que o lojista conhece (recebe a percentagem configurada; estoque incrementa). Compra e venda são VALIDADAS no servidor (`POST /api/lojas/comprar|vender` — estoque, preço e ouro conferidos lá; o cliente nunca dita valores), seguindo o padrão do `/api/combate/acao` da Fase C1. Jogadores só veem lojas de NPCs visíveis (filtro no servidor, como `/api/npcs`).

**Ficheiros alterados:**
- `app.py` — `ESTADO_PADRAO['lojas']`; `GET /api/lojas` (filtrado por visibilidade do NPC para jogadores), `PUT /api/lojas` (só Mestre), `POST /api/lojas/comprar` (valida loja/ficha/dono/estoque/ouro, persiste tudo junto) e `POST /api/lojas/vender` (só itens que existem no estoque do lojista — é de lá que sai o preço de referência; ficha precisa ter o item; lojista precisa aceitar compras).
- `static/js/loja.js` — `itensDaLojaNpc(loja)` (resolve estoque contra os catálogos, mantendo preço/qtd da loja) e `precoRecompraLojaNpc(loja, nome)`.
- `static/js/npc.js` — botões "🛒 Loja" (Mestre) e "🛒 Ver loja" (jogador) nos cartões de lojista; editor de loja e modal de compra/venda criados em JS (sem tocar nos templates); espelho local do resultado das operações do servidor.
- `static/css/style.css` — estilos `.lj-linha` das linhas de estoque.
- `docs/ROADMAP-FUTURO.md` — marca a Fase 12 como concluída (reabastecimento periódico fica pendente).

**Testes:** `node --check` em `npc.js`/`loja.js`; `py_compile`; harness Flask (campanha isolada descartável, limpa no fim): PUT lojas só-Mestre, jogador só vê lojas de NPCs visíveis, compra normal (ouro e estoque certos e persistidos), ouro insuficiente, estoque insuficiente/esgotado, item/loja inexistentes (404), ficha alheia (403), venda a 50% com incremento de estoque, venda de item que a ficha não tem, item que o lojista não conhece e lojista que não compra (400s).

**Como reverter:**
1. Restaurar `app.py`, `static/js/loja.js`, `static/js/npc.js`, `static/css/style.css`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-f12/`.

---

## 2026-07-05 — Campanhas aprimoradas + aviso de combate (Passo K1)

**Backup antes da alteração:** `versoes/2026-07-05-k1/`
(cópia de todos os ficheiros tocados).

**Resumo:** Quando o Mestre inicia um combate (adiciona combatentes ou rola iniciativa), a flag `combate.ativo` liga; os jogadores detetam a transição (tempo real Firestore, com polling de fallback) e recebem um banner destacado "⚔️ COMBATE INICIADO — rolem iniciativa!" (pulsante, fecha ao clicar ou após 8s), um toque de corneta via WebAudio (sem ficheiro de som; silencioso se o browser bloquear áudio sem gesto) e a tela salta para a aba Combate. O estado "em combate" fica visível: aba "Combate" do jogador pulsa em vermelho e o cabeçalho da rodada ganha o chip "⚔️ EM COMBATE". "Limpar" desliga tudo. Sem mudanças no backend (a flag viaja dentro do JSON do combate).

**Ficheiros alterados:**
- `static/js/app.js` — `ordenarCombate` liga `combate.ativo` quando há combatentes; "Limpar" repõe `ativo: false`.
- `static/js/jogador.js` — deteção da transição inativo→ativo em `renderCombateJog` (sem aviso na primeira renderização, para não disparar ao abrir a página já em combate), `avisoCombateIniciado` (banner + som + salto de aba), `sinalizarEstadoCombate` (pulso na aba) e chip no cabeçalho.
- `static/css/style.css` — `.banner-combate` (+ animação de pulso), `.tab-btn.combate-ativo` e `.chip-em-combate`.
- `docs/ROADMAP-FUTURO.md` — marca o passo K1 como concluído.

**Testes:** `node --check` em `app.js` e `jogador.js`; verificação byte a byte de que o append no `style.css` não introduziu BOM intercalado. (O aviso em si é comportamento de browser — validar no preview com duas janelas: Mestre inicia combate, jogador recebe o banner.)

**Como reverter:**
1. Restaurar `static/js/app.js`, `static/js/jogador.js`, `static/css/style.css`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-k1/`.

---

## 2026-07-05 — Banco de NPCs partilhado entre utilizadores (Passo M4)

**Backup antes da alteração:** `versoes/2026-07-05-m4/`
(cópia de todos os ficheiros tocados).

**Resumo:** Cada utilizador (Mestre ou jogador) ganhou um banco PESSOAL de NPCs, fora de qualquer campanha (coleção `bancos_npc/<uid>`, segue o utilizador entre mesas). Botão "💾" no cartão de qualquer NPC guarda uma cópia no banco; a secção "💾 Meu Banco de NPCs" (aba NPCs do Mestre e do jogador) lista o banco com "Remover" e — para o Mestre — "📥 Trazer para a campanha". O Mestre também pode ver o banco de qualquer MEMBRO da campanha ativa (seletor "👀 Ver banco do membro") e copiar NPCs dele para a mesa. A membresia é validada no servidor: `GET /api/banco_npc/<uid>` só devolve bancos de membros/mestre da campanha ativa (403 caso contrário; campanhas legadas sem meta dão 400).

**Ficheiros alterados:**
- `app.py` — helpers `uid_sessao`, `carregar_banco_npc`, `salvar_banco_npc` e rotas `GET/PUT /api/banco_npc` (o próprio, qualquer papel; PUT valida lista, filtra não-dict e limita a 100) + `GET /api/banco_npc/<uid>` (só Mestre, com validação de membresia).
- `static/js/npc.js` — botão 💾 nos cartões (Mestre e jogador), secção do banco (`renderBanco`, guardar/remover/trazer com id novo em cada cópia) e navegação pelos bancos dos membros (`/api/campanha_info` para o seletor).
- `templates/mestre.html` — secção "💾 Meu Banco de NPCs" + seletor de membro na aba NPCs.
- `templates/jogador.html` — secção "💾 Meu Banco de NPCs" na aba NPCs.
- `.gitignore` — `data/bancos_npc.json` (estado local de runtime, como os restantes).
- `docs/ROADMAP-FUTURO.md` — marca o passo M4 como concluído.

**Testes:** `node --check` no `npc.js`; `py_compile` no `app.py`; sintaxe Jinja dos dois templates; harness Flask (modo local, campanha isolada descartável, limpa tudo no fim): registo de 2 contas, campanha nova + convite, banco começa vazio, PUT/GET do próprio banco, rejeição de payload não-lista (400), filtragem de entradas inválidas, limite de 100, jogador sem acesso ao banco alheio (redirect), Mestre vê banco do membro e o próprio, 403 para uid fora da campanha.

**Como reverter:**
1. Restaurar `app.py`, `static/js/npc.js`, `templates/mestre.html`, `templates/jogador.html`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-m4/`.
2. Reverter a linha `data/bancos_npc.json` do `.gitignore` (opcional; inofensiva).

---

## 2026-07-05 — Monstros & Sistema de Loot (Fase 13)

**Backup antes da alteração:** `versoes/2026-07-05-f13/`
(cópia de todos os ficheiros tocados).

**Resumo:** Botão "🎲 Gerar Loot" na aba Combate do Mestre: rola o tesouro dos monstros abatidos (PV 0) e mostra o total de ouro + itens. Monstros comuns (14: Goblin, Goblin Boss, Bandido, Capanga, Bandido Capitão, Cultista, Orc, Hobgoblin, Bugbear, Kobold, Lobo, Zumbi, Esqueleto, Ogro) têm tabela de loot própria (`loot` em `MONSTROS`, com `itensGarantidos` para chefes); os restantes caem nas tabelas genéricas por Nível de Desafio (bandas 0-4, 5-10, 11-16, 17+, inspiradas na Tabela de Tesouro Individual do Guia do Mestre). Botão "💰 Dividir ouro pelo grupo" reparte o ouro pelas fichas vivas (troco fica com o Mestre); itens distribuem-se manualmente via "📦 Enviar à ficha" (como planeado — automatizar é passo futuro).

**Ficheiros alterados:**
- `static/js/loot.js` (NOVO) — `TABELAS_LOOT_POR_ND`, `lootBandaDoCr`, `lootRolarFormula`, `lootEscolhaPonderada`, `rolarLoot` e `rolarLootEncontro` (funções puras, `rng` injetável, export CommonJS em Node).
- `static/js/monstros.js` — campo `loot` adicionado a 14 monstros comuns.
- `static/js/app.js` — handler do botão "🎲 Gerar Loot" (filtra monstros com PV 0, agrega loot, log no histórico) e "💰 Dividir ouro pelo grupo".
- `templates/mestre.html` — botão na toolbar do Combate, bloco `#lootResultado` e `<script>` do `loot.js`.
- `docs/ROADMAP-FUTURO.md` — marca a Fase 13 como concluída (loot por monstro segue incremental).

**Testes:** `node --check` nos três JS; harness Node validou bandas de CR (frações incluídas), mínimos/máximos e clamp das fórmulas, estrutura do `loot` dos 14 monstros, `itensGarantidos` sempre presentes, agregação do encontro, e rolagem sem erro para TODOS os monstros do bestiário (20× cada); sintaxe Jinja validada.

**Como reverter:**
1. Restaurar `templates/mestre.html`, `static/js/app.js`, `static/js/monstros.js`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-f13/`.
2. Apagar `static/js/loot.js`.

---

## 2026-07-05 — Gerador de ambientes urbanos (Passo M3)

**Backup antes da alteração:** `versoes/2026-07-05-m3/`
(cópia de todos os ficheiros tocados).

**Resumo:** Novo card "🏘️ Ocupar Ambiente" na aba Geradores do Mestre. O Mestre escolhe um ambiente (🏠 casa, 🏚️ casarão, 🍺 taverna, 🐴 estábulo, 🏛️ mansão, 👥 multidão, ⛪ templo, 🏪 mercado, 🌃 beco, 📦 armazém) e o gerador sorteia o nº de ocupantes (fórmula de dados própria de cada ambiente) e um perfil de ocupação. ~90% dos resultados são normais (a cidade é uma cidade); ~10% são variações raras com encontros — nesse caso aparece o botão "⚔️ Lançar encontro no combate", que adiciona os monstros (nomes validados contra o Bestiário) via `addMonstro` e muda para a aba Combate.

**Ficheiros alterados:**
- `static/js/ambientes.js` (NOVO) — tabelas curadas de 10 ambientes (perfis normais ponderados + variações raras com monstros) e funções puras `ambRolarFormula`, `ambEscolhaPonderada` e `gerarOcupacao` (com `rng` injetável para testes; export CommonJS quando em Node).
- `static/js/app.js` — handler do card: popular o seletor, renderizar resultado e botão de lançar encontro no combate.
- `templates/mestre.html` — card "🏘️ Ocupar Ambiente" na aba Geradores + `<script>` do `ambientes.js`.
- `docs/ROADMAP-FUTURO.md` — marca o passo M3 como concluído.

**Testes:** `node --check` em `ambientes.js` e `app.js`; harness Node validou que todos os nomes de monstros das tabelas existem no Bestiário, fórmulas de dados válidas, mínimos/máximos de `ambRolarFormula`, substituição do placeholder `{n}`, quantidades de monstros ≥ 1 e frequência de raros ≈ 10% (9,7% em 20 000 amostras); sintaxe Jinja do template validada.

**Como reverter:**
1. Restaurar `templates/mestre.html`, `static/js/app.js`, `docs/ROADMAP-FUTURO.md` e `CHANGELOG.md` a partir de `versoes/2026-07-05-m3/`.
2. Apagar `static/js/ambientes.js`.

---

## 2026-07-05 — Miniaturas de classes, atributos e armas (Miniaturas)

**Backup antes da alteração:** `versoes/2026-07-05-miniaturas/`
(cópia de todos os ficheiros tocados).

**Resumo:** Adicionados ícones/miniaturas visuais (emojis correspondentes) para as habilidades/atributos (Força 💪, Destreza 🏃‍♂️, Constituição ✊, Inteligência 🧠, Sabedoria 👁️, Carisma 🗣️), para todas as classes do PHB (Guerreiro ⚔️, Mago 🔮, etc.) e para as armas (Adaga 🗡️, Besta 🏹, Espada ⚔️, etc.) no Criador de Personagens, no seletor de classes e no painel do Modo de Jogo.

**Ficheiros alterados:**
- `static/js/regras.js` — mapeamento de ícones e funções auxiliares `getClasseIcone`, `getAttrIcone` e `getArmaIcone`.
- `static/js/classes.js` — exibição do ícone da classe nas opções do `<select>`.
- `static/js/jogo.js` — inclusão de miniaturas de atributos nos blocos de habilidades, de armas nos blocos de ataques, e de classes nos subcabeçalhos de Modo de Jogo.
- `static/js/criador.js` — inclusão de miniaturas nos blocos de atributos (base e recomendados) e na visualização prévia de classes e armas do criador.

---

## 2026-07-05 — Criaturas do bestiário como NPCs persistentes (Passo M2)

**Backup antes da alteração:** `versoes/2026-07-05-m2/`
(cópia de todos os ficheiros tocados).

**Resumo:** O Mestre agora pode promover monstros do Bestiário a NPCs persistentes da campanha. Foi adicionado um botão "⭐ Promover a NPC" no cartão de cada monstro no Bestiário, preenchendo o modal de criação simples com a CA, PV, atributos, ações e magias do monstro. Também foi adicionado o botão "🎲 NPC Aleatório (Bestiário)" na aba de NPCs que sorteia um monstro baseado em um ND (CR) e o promove automaticamente.

**Ficheiros alterados:**
- `static/js/app.js` — botão "⭐ Promover a NPC" no template do Bestiário e escutador de eventos.
- `static/js/npc.js` — função global `window.npcCriarDeMonstro` para pré-preenchimento do modal simples e escutador do botão "🎲 NPC Aleatório (Bestiário)".
- `templates/mestre.html` — inclusão do botão "🎲 NPC Aleatório (Bestiário)" na aba de NPCs.
- `docs/ROADMAP-FUTURO.md` — marca o passo M2 como concluído.

---

## 2026-07-05 — NPC com Ficha Completa (Passo M1)

**Backup antes da alteração:** `versoes/2026-07-05-m1/`
(cópia de todos os ficheiros tocados).

**Resumo:** O Mestre agora pode criar e editar NPCs usando o Criador de Personagens completo (raça, classe, perícias, magias e equipamentos). No Criador, compras e remoções de itens não deduzem/acrescentam ouro (trava desativada para NPCs). O cartão do NPC na tela do Mestre exibe informações detalhadas ("Ficha Completa") e possui botões para "Editar" via Criador e "Ver ficha" (Modo de Jogo) permitindo ao Mestre jogar com a ficha do NPC. No combate, esses NPCs entram com PV, CA, iniciativa e todas as suas ações (ataques de arma e truques) gerados dinamicamente com base nas regras de PJs.

**Ficheiros alterados:**
- `static/js/criador.js` — suporte a `modoNpc` que ignora custos e limites de ouro na compra e devolução de equipamentos.
- `static/js/npc.js` — botão "+ NPC Completo" e cartões atualizados com identificação de ficha completa, botões de ação e hooks correspondentes.
- `templates/mestre.html` — layout de botões na aba de NPCs.
- `static/js/app.js` — integração no combate, gerando ações de combatente dinâmicas e cálculo de iniciativa baseados na ficha completa.

---

## 2026-07-05 — Rolagem com alvo, dano real, defesas e dado físico (Fase C1)

**Backup antes da alteração:** `versoes/2026-07-05-c1/`
(cópia de todos os ficheiros tocados).


**Resumo:** O jogador agora pode selecionar um alvo ativo do combate na própria ficha (Modo de Jogo); rolagens de ataque e dano são validadas e aplicadas diretamente ao alvo através da nova API central `/api/combate/acao` (comparação com CA, aplicação de resistências, vulnerabilidades e imunidades); as defesas funcionam em fluxo reverso (o jogador indica o CD/ataque do inimigo, rola e aplica o dano resultante a si mesmo); e todas as rolagens ganham a opção "Dado Físico" que solicita a inserção manual do resultado dos dados.

**Ficheiros alterados (backup em `versoes/2026-07-05-c1/`):**
- `app.py` — nova rota `POST /api/combate/acao` para processar ataques (comparando contra CA) e dano real (com aplicação de imunidades/resistências/vulnerabilidades e persistência de HP de PJs).
- `static/js/jogo.js` — inclusão da variável de estado `jgDadoFisico` e `jgAlvoId`; interface estendida com seletor de alvo, caixa de seleção para Dado Físico (que intercepta rolagens de d20 e dano por prompts numéricos) e o bloco de Defesas contra Inimigo (cálculo de salvaguarda/CA vs ataque/CD com aplicação de dano local e log centralizado).
- `static/js/jogador.js` — expõe o estado de combate ativo na variável global `window.COMBATE_ATUAL`.
- `static/js/app.js` — expõe o estado de combate ativo na variável global `window.COMBATE_ATUAL` no painel do Mestre.
- `docs/ROADMAP-FUTURO.md` — marca o passo C1 como concluído.

**Como reverter:**
1. Restaurar os ficheiros de backup em `versoes/2026-07-05-c1/` para suas localizações originais.

## 2026-07-04 — Criação de personagem avançada (Fase 7)

**Backup antes da alteração:** `versoes/2026-07-04-criacao-personagem-avancada/`
(cópia de todos os ficheiros existentes tocados, antes de qualquer edição).

**Resumo:** antecedentes com explicação amigável e tabelas de personalidade
(traço/ideal/ligação/defeito, lista OU texto livre); registo extensível de
antecedentes de módulos de aventura (`fontes.js`, com Ninho da Rainha Dragão e
Mina Perdida de Phandelver como exemplo); história prévia do personagem;
item de memória (objeto pessoal, fora do acervo); ferramenta do Mestre para
criar itens mágicos dentro das diretrizes de raridade do Guia do Mestre,
guardados à parte da loja do jogador.

**Ficheiros novos:**
- `static/js/fontes.js` — registro extensível de fontes/módulos de aventura.
- `static/js/itensmestre.js` — diretrizes de raridade + ferramenta de criação de itens mágicos do Mestre.
- `CHANGELOG.md` — este ficheiro.

**Ficheiros alterados (backup em `versoes/2026-07-04-criacao-personagem-avancada/`):**
- `static/js/dados5e.js` — cada antecedente ganhou `tracosPersonalidade`, `ideais`, `ligacoes`, `defeitos`.
- `static/js/criador.js` — UI de antecedente (explicação + optgroups por fonte), personalidade, história prévia, item de memória; `estadoVazio`/`construirFicha`/`carregarFicha`/`autoGerar` atualizados.
- `static/js/jogo.js` — Modo de Jogo mostra/edita personalidade, história e item de memória; PDF exporta os três; `antecedenteDados()` substitui o acesso direto a `ANTECEDENTES` (para reconhecer antecedentes de módulos).
- `static/js/app.js` — dropdown "Enviar à ficha" passa a incluir itens do Mestre; backup/restauro (💾) inclui `itens_mestre`; listener de tempo real sincroniza `itens_mestre`.
- `static/js/jogador.js` — carrega `itens_mestre` (para sintonização reconhecer itens do Mestre) e sincroniza em tempo real.
- `static/js/itens.js` — `itemMagico()` também procura em `window.ITENS_MESTRE`.
- `static/css/style.css` — estilos novos: `.im-*` (ferramenta de itens mágicos), `.antecedente-info`, `.personalidade-grid`, `.item-memoria-wrap`.
- `templates/_criador.html` — novos campos na Etapa 3 (antecedente info, personalidade, história, item de memória).
- `templates/mestre.html` — nova aba "Itens Mágicos"; inclui `fontes.js` e `itensmestre.js`.
- `templates/jogador.html` — inclui `fontes.js`.
- `app.py` — nova chave `itens_mestre` no estado padrão; endpoints `GET/PUT /api/itens_mestre` (GET para qualquer papel logado, PUT só Mestre).

**Como reverter:**
1. Restaurar um ficheiro específico: copiar de volta de
   `versoes/2026-07-04-criacao-personagem-avancada/<nome-com-__-em-vez-de-/>`
   para o caminho original (ex.: `static_js_criador.js` → `static/js/criador.js`).
2. Reverter tudo desta sessão de uma vez: como o repositório Git estava limpo
   antes desta sessão (commit `d8f6307`), basta `git checkout d8f6307 -- .`
   ou `git diff d8f6307 -- <ficheiro>` para inspecionar/reverter ficheiro a
   ficheiro, e depois apagar os ficheiros novos (`static/js/fontes.js`,
   `static/js/itensmestre.js`, este `CHANGELOG.md`) e a chave `itens_mestre`
   do `data/estado*.json`/Firestore se já tiver sido usada.
3. Fichas já criadas com os novos campos (`personalidade`, `historia`,
   `itemMemoria`) continuam válidas mesmo revertendo o código — os campos
   extras são simplesmente ignorados pelas versões antigas do Criador/Jogo.

## 2026-07-04 — Ajuda tática ao jogador + Multiclasse (Fase 8A/8B)

**Backup antes da alteração:** `versoes/2026-07-04-fase8-tatica-multiclasse/`
(cópia de todos os ficheiros existentes tocados, antes de qualquer edição).

**Resumo:** painel "O teu turno" no Modo de Jogo (Ação/Ação Bônus/Movimento/
Reação/Ação Livre, só com o que aquele personagem específico tem); dicas
contextuais e combos sugeridos por classe/subclasse; ajuda textual de
movimento/alcance/cobertura (o projeto não tem grid/mapa); e multiclasse
completo na Subida de Nível (pré-requisito de atributo, proficiências
limitadas, bônus de proficiência pelo nível total, slots de magia combinados,
Ataque Extra que não acumula).

**Ficheiros novos:**
- `static/js/multiclasse.js` — regras de multiclasse (pré-requisitos, proficiências limitadas, slots combinados por tipo de conjurador, Ataque Extra, pacto do Bruxo separado). Funções puras, sem DOM.
- `static/js/ajudatatica.js` — motor da ajuda tática: `opcoesTurno()`, `dicasContextuais()`, `combosSugeridos()`, `ajudaMovimentoAtaque()`. Funções puras, sem DOM; dados curados em `DICAS_CLASSE`/`DICAS_SUBCLASSE`/`COMBOS_CLASSE`.

**Ficheiros alterados (backup em `versoes/2026-07-04-fase8-tatica-multiclasse/`):**
- `static/js/jogo.js` — painel "O teu turno" (toggles `ficha.estadoTatico`: em combate/em fúria/inimigo adjacente/aliado adjacente ao alvo/caído); `pbAtual()` agora usa `PB(nivel total)` diretamente; `slotsMax()`, `recursosClasse()` (renomeado corpo para `recursosDeClasse()`), `caracHtml`, `recalcularCA()`, `ehPreparador()`/`limitePreparadas()`/checagens de `ehConjurador` todos multiclasse-aware via `classesFicha()`/`ehMulticlasse()`; cabeçalho mostra "Classe A X / Classe B Y (total Z)" quando multiclassado.
- `static/js/nivel.js` — reescrito: cada subida de nível começa por uma tela "em qual classe você vai subir?" (classes atuais + opção "Multiclassar"); toda a lógica (HP, ASI, subclasse, magias) passou a operar sobre a CLASSE ATIVA e o nível dela, não a ficha inteira; grava progressão em `ficha.classes` (materializado na primeira vez que é preciso) e espelha a 1ª entrada em `ficha.classe`/`ficha.subclasse` para compatibilidade.
- `static/js/regras.js` — `proficienteArmaduraFicha(ficha, nome)`/`proficienteArmaFicha(ficha, nome)` novos (usam `proficienciasEfetivas()` quando multiclasse); `ataqueArma()` e `penalidadesEquipamento()` passaram a usá-los em vez das versões de uma classe só.
- `static/js/criador.js` — `construirFicha()` preserva `ficha.classes` ao editar (contanto que classe/subclasse/nível primários não tenham mudado no próprio Criador).
- `static/css/style.css` — estilos novos: `.jg-turno*` (painel do turno), `.nv-escolha-classe`/`.nv-classe-btn` (tela de escolha de classe/multiclasse).
- `templates/mestre.html`, `templates/jogador.html` — incluem `multiclasse.js` e `ajudatatica.js` (depois de `regras.js`, antes de `criador.js`).
- `ROADMAP.md` — nova Fase 8A/8B com lista de pontos em aberto.

**Decisões de design / pontos em aberto:**
- **Sem grid/mapa:** o projeto não tem noção de posição/adjacência (confirmado por leitura de `app.js`/`jogo.js` — o rastreador de combate é só uma lista por iniciativa). "Inimigo adjacente", "aliado adjacente ao alvo", "em Fúria" e "caído" são toggles manuais em `ficha.estadoTatico`, persistidos na ficha — o jogador é quem informa a condição real da mesa, não é detectado automaticamente.
- **Multiclasse limitado a 2 classes** por personagem (não 3+). É uma decisão de escopo para manter a UI e o motor administráveis nesta fase; `multiclasse.js` já suporta N classes internamente (é só `classesAtuais(ficha)` retornar mais entradas), mas `nivel.js` só oferece adicionar 1 classe extra.
- **Magias continuam numa lista única por ficha** (`ficha.truques`/`ficha.magias1`/`ficha.preparadas`), não uma por classe. Um Clérigo/Paladino multiclasse, por exemplo, tem as magias de ambas as classes misturadas na mesma lista, e o limite de "preparadas" é a SOMA das fórmulas de cada classe preparadora (aproximação — a regra oficial mantém as preparações e listas totalmente separadas por classe). Refazer isso com listas separadas por classe tocaria em quase todo o código de magias (Criador, Modo de Jogo, PDF) — ficou fora do escopo desta fase.
- **Um único Estilo de Combate** (`ficha.estilo`). Se a 2ª classe também concede Estilo de Luta e já havia um escolhido, a ferramenta não reoferece (o personagem já tem o benefício mecânico; só não modela ESCOLHER UM ESTILO DIFERENTE como a regra realmente pede).
- **Editar nível/classe pelo Criador não atualiza `ficha.classes`.** O Criador é uma ferramenta de edição rápida/global (inclusive para debug do Mestre); a progressão de multiclasse correta deve sempre passar pelo fluxo guiado da Subida de Nível (`Nivel.abrir`). Se o nível ou a classe primária forem alterados diretamente no Criador, `ficha.classes` é descartado (a ficha volta a ser tratada como mono-classe no novo estado) para evitar dessincronia silenciosa.
- **Ataque Extra** é só um número mostrado como orientação no painel "O teu turno" ("2 ataques") — o jogador ainda clica no botão de atacar mais de uma vez; não há automação do clique múltiplo.
- **Dados de Vida em descanso longo/gasto manual** (`descansoLongo`/`gastarDadoVida` em jogo.js) usam o dado da PRIMEIRA classe para todo o pool de dados de vida do personagem multiclasse, em vez de misturar os dados de cada classe (ex.: d10 do Guerreiro + d6 do Mago) — simplificação pré-existente (o pool já era tratado como uniforme antes da Fase 8B); não chega a ficar errado para mono-classe, só imperfeito para multiclasse.

**Como testar/verificar:** toda a lógica de multiclasse (`multiclasse.js`) e as
funções de ataque/proficiência multiclasse-aware (`regras.js`) foram testadas
com Node (`node --check` em todos os `.js` + scripts de verificação executando
as funções puras fora do navegador — sem subir servidor). Casos conferidos:
Guerreiro5/Mago3 (Ataque Extra não soma, slots = nível de conjurador completo
3, proficiência de arma marcial ganha via multiclasse), Paladino4/Patrulheiro4
(meio-conjuradores somam metade cada), Mago5/Bruxo3 (Bruxo fica de fora da
tabela combinada e mantém pacto próprio), e validação de pré-requisito de
atributo em ambos os sentidos (falha e sucesso).

**Como reverter:**
1. Restaurar um ficheiro específico: copiar de volta de
   `versoes/2026-07-04-fase8-tatica-multiclasse/<nome-com-__-em-vez-de-/>`
   para o caminho original.
2. Reverter tudo desta fase: `git diff d8f6307 -- static/js/jogo.js static/js/nivel.js static/js/regras.js static/js/criador.js static/css/style.css templates/mestre.html templates/jogador.html` para ver exatamente o que mudou desde antes da Fase 7, ou restaurar cada ficheiro a partir da pasta de backup acima; depois apagar `static/js/multiclasse.js` e `static/js/ajudatatica.js` e remover as duas linhas `<script>` correspondentes de `mestre.html`/`jogador.html`.
3. Fichas que já tiverem `ficha.classes` (por terem multiclassado nesta versão) continuam funcionando como mono-classe se o código for revertido — o resto do app sempre leu só `ficha.classe`/`ficha.nivel`/`ficha.subclasse`, que continuam corretos (a 1ª classe/nível total).

## 2026-07-04 — Loja reorganizada por categoria + Loja Especial (Fase 9) + Roadmap futuro (Fase 10+, só documentação)

**Backup antes da alteração:** `versoes/2026-07-04-fase9-loja/`
(cópia de todos os ficheiros existentes tocados, antes de qualquer edição).

**Resumo:** catálogo da loja reorganizado por categoria (Armaduras, Escudos,
Armas, Munição, Instrumentos, Anéis, Calçados, Cintos, Mantos & Capas,
Varinhas & Cajados, Montarias, Focos, Poções, Pergaminhos, Aventura, Outros),
navegável por abas, com botão "Abrir loja completa"; a compra inicial
(Criador) continua limitada à Loja Básica (equipamento mundano do PHB); nova
Loja Especial (itens mágicos/raros) fica bloqueada até o Mestre liberar, por
campanha inteira ou por personagem. Também criei `docs/ROADMAP-FUTURO.md`
com o plano detalhado (objetivo/dados/ficheiros/passos) das fases seguintes:
autenticação e sistema de campanha, NPCs, lojas geridas por NPC, monstros &
loot, e grid virtual/mapa de combate — **nada disso foi implementado**, é só
o guia para quando formos construir.

**Ficheiros novos:**
- `static/js/loja.js` — catálogo unificado por categoria (`CATEGORIAS_LOJA`, `classificarItemLoja()`, `itensLojaBasica()`, `itensLojaEspecial()`, `agruparPorCategoriaLoja()`, `lojaEspecialLiberada()`). Funções puras, sem DOM.
- `docs/ROADMAP-FUTURO.md` — plano detalhado das Fases 10–14 (autenticação/campanha, NPCs, lojas por NPC, monstros/loot, grid virtual). Só documentação.

**Ficheiros alterados (backup em `versoes/2026-07-04-fase9-loja/`):**
- `app.py` — nova chave `loja_especial_campanha` no estado padrão; endpoints `GET/PUT /api/loja_especial` (GET para qualquer papel logado, PUT só Mestre).
- `static/js/itens.js` — nova categoria "Instrumento" (instrumentos musicais) em `ITENS_PADRAO`; mais itens de "Montaria" (Pônei, Sela, Alforje).
- `static/js/criador.js` — `renderLoja()` (passo 5) reescrita: abas Básica/Especial + categorias + botão "Abrir loja completa"; Especial é só consulta (itens continuam a entrar na ficha só via envio do Mestre).
- `static/js/jogo.js` — inventário do Modo de Jogo ganhou a mesma mini-loja categorizada (dentro de um `<details>` que preserva o estado aberto entre re-renderizações); dropdown antigo de "+ Adicionar" removido.
- `static/js/app.js` — toggle "🔓 Loja Especial" por personagem (cartão da ficha) e por campanha (checkbox na aba Fichas); carrega/sincroniza `window.LOJA_ESPECIAL_CAMPANHA`; backup/restauro (💾) inclui `loja_especial_campanha`.
- `static/js/jogador.js` — carrega e sincroniza `window.LOJA_ESPECIAL_CAMPANHA` em tempo real.
- `static/css/style.css` — estilos novos: `.loja-abas-cat`, `.aba-loja.bloqueada`, `.loja-cat-titulo`, `.loja-especial-toggle`, `#lojaEspecialWrap`.
- `templates/mestre.html` — inclui `loja.js`; novo bloco `#lojaEspecialWrap` (checkbox de liberação por campanha) na aba Fichas.
- `templates/jogador.html` — inclui `loja.js`.
- `ROADMAP.md` — nova Fase 9 + pontos em aberto + link para `docs/ROADMAP-FUTURO.md`.

**Decisões de design / pontos em aberto:**
- **Loja Especial é só consulta**, mesmo quando liberada — os itens mágicos continuam a só chegar a uma ficha através de "📦 Enviar à ficha" (Mestre). Decisão deliberada: evita que um personagem novo compre um item Lendário com o ouro inicial só porque a campanha liberou a Loja Especial para outro motivo.
- **"+ Adicionar" da Loja Básica no Modo de Jogo continua sem custo de ouro** — comportamento pré-existente que eu não alterei (só reorganizei por categoria); um "carrinho com débito de ouro" ali é um follow-up natural, não pedido nesta fase.
- **Sem imagens/retrato de item** — a loja é só texto (nome/descrição/preço), como já era antes.

**Como testar/verificar:** `node --check` em todos os `.js`; script Node que
carrega `loja.js` (+ toda a cadeia de dependências) fora do navegador e
confirma a classificação por categoria (125 itens básicos em 9 categorias,
26 itens especiais em 11 categorias) e a lógica de liberação (por ficha, por
campanha, e nenhuma das duas). Endpoint `/api/loja_especial` testado
ponta-a-ponta com o cliente de testes do Flask, numa campanha isolada
descartável, e a permissão por papel confirmada (Mestre consegue PUT,
jogador só GET).

**Como reverter:**
1. Restaurar um ficheiro específico: copiar de volta de
   `versoes/2026-07-04-fase9-loja/<nome-com-__-em-vez-de-/>` para o caminho
   original.
2. Apagar `static/js/loja.js` e `docs/ROADMAP-FUTURO.md` (este último pode
   ficar — é só documentação, não afeta o funcionamento do app).
3. Remover a linha `<script src=".../loja.js">` de `mestre.html`/`jogador.html`.
4. Fichas com `lojaEspecialLiberada: true` continuam válidas mesmo revertendo
   o código — o campo extra é simplesmente ignorado pelas versões antigas.

## 2026-07-04 — Loja do Modo de Jogo debita ouro (Fase 9b)

**Backup antes da alteração:** `versoes/2026-07-04-fase9b-ouro-loja/` (só `jogo.js`).

**Resumo:** o botão "+ Adicionar" da Loja Básica no Modo de Jogo virou
"Comprar": debita o preço do ouro da ficha, fica desabilitado quando o ouro
não chega, e regista no histórico ("💰 Comprou X por Y po (restam Z po)").
Fecha o ponto em aberto da Fase 9. Munição em packs continua a virar contador
do slot; arredondamento a 2 casas (centavos de po) igual ao da venda.

**Ficheiros alterados:** `static/js/jogo.js` (linha da loja + handler
`data-lojaadd`), `ROADMAP.md` (ponto em aberto marcado como resolvido).

**Verificação:** `node --check` + simulação da lógica de compra em Node
(ouro insuficiente bloqueia, packs de munição, arredondamento 0.01 po).

**Como reverter:** restaurar `versoes/2026-07-04-fase9b-ouro-loja/static_js_jogo.js`
→ `static/js/jogo.js`, ou `git revert` do commit desta entrada.

## 2026-07-04 — Validações de ficha + Loja Especial curada (Fase 9c)

**Backup antes da alteração:** `versoes/2026-07-04-fase9c-validacoes-loja-curada/`.

**Resumo:** o Criador passa a exigir ficha completa para avançar de passo ou
salvar (nome, atributos raciais, subclasse quando o nível pede, contagem
exata de perícias/estilo/truques/magias da classe, história prévia ≥150
caracteres com contador ao vivo); salvar com item sem proficiência pede
confirmação listando as penalidades. A Loja Especial deixou de mostrar todos
os itens mágicos: agora é CURADA pelo Mestre — a aba "Itens Mágicos & Loja
Especial" ganhou o acervo completo (PHB/DMG + criações do Mestre) com busca
e botão "➕ à loja" (preço sugerido pela raridade, editável); só o que o
Mestre adiciona aparece para os jogadores liberados, e a ficha ganha um botão
"✨ Loja Especial" que abre a loja completa e vende pelo preço do Mestre.

**Ficheiros alterados (backup em `versoes/2026-07-04-fase9c-validacoes-loja-curada/`):**
- `app.py` — chave `loja_especial_itens` ([{nome, precoPO}]) + endpoints `GET/PUT /api/loja_especial_itens` (PUT só Mestre).
- `static/js/loja.js` — `acervoItensMagicos()` (catálogo completo p/ o Mestre) e `itensLojaEspecial()` reescrita para resolver só a lista curada (entrada sem correspondente no acervo é ignorada).
- `static/js/itensmestre.js` — gestão do estado curado (fila de gravação própria), `renderLojaCurada()` (preço editável inline + remover) e `renderAcervo()` (busca + "➕ à loja" com preço sugerido por raridade: Comum 75 / Incomum 300 / Raro 2.500 / Muito raro 25.000 / Lendário 75.000 po).
- `static/js/app.js` — sync RT de `loja_especial_itens` (sem re-render enquanto o Mestre edita um preço, para não perder o foco do input); backup exporta/importa a lista curada.
- `static/js/jogador.js` — carrega e sincroniza `window.LOJA_ESPECIAL_ITENS`.
- `static/js/jogo.js` — Loja Especial vende (botão Comprar com o preço do Mestre via `data-lojapreco`, debita ouro); botão "✨ Loja Especial" no cabeçalho da ficha quando liberada (abre a loja completa e faz scroll até ela).
- `static/js/criador.js` — `validarPasso()`/`mostrarValidacao()`/`primeiroPassoInvalido()`; navegação (Próximo, chips, Salvar) bloqueia passo incompleto; contador de caracteres da história; confirm de proficiência no Salvar; limites de magias com teto no nº de opções disponíveis (evita travar quando o compêndio tem menos magias que a regra pede); consulta da Especial mostra o preço do Mestre.
- `templates/_criador.html` — div `#cValidacao` + contador `#cHistoriaCont` + rótulo "mínimo 150 caracteres".
- `templates/mestre.html` — aba renomeada "Itens Mágicos & Loja Especial" com secções Loja Especial (curada), Acervo (com busca) e Minhas Criações.
- `static/css/style.css` — `.criador-validacao`, `.loja-curada`, `.loja-acervo`, `.jg-loja-especial`.
- `ROADMAP.md` — Fase 9c registada; ponto "Especial só consulta" marcado como evoluído.

**Decisões de design / pontos em aberto:**
- **Fichas antigas sem história não ficam presas na edição** (legado): o mínimo de 150 caracteres vale para fichas novas e para qualquer história começada; uma ficha antiga com história vazia pode ser editada sem preencher.
- **Não proficiência avisa mas não bloqueia** — a regra 5e permite usar equipamento sem proficiência (com penalidade); o Salvar exige confirmação consciente em vez de proibir.
- **Criador: Loja Especial continua consulta** — a compra inicial permanece só na loja básica; comprar item mágico é em jogo (Modo de Jogo), com o ouro ganho na campanha.
- **Sem controlo de estoque na Loja Especial** — comprar não decrementa quantidade (o jogador não pode escrever na lista curada, que é só do Mestre); se quiseres exclusividade de um item, remove-o da loja depois da venda. Estoque real está planeado na Fase 12 (lojas por NPC).
- **Limite de magias com teto nas opções disponíveis** — se o compêndio tiver menos magias da classe que a regra pede (ex.: círculos altos ainda em expansão na Fase 3.1), a validação exige só o que existe para escolher, nunca trava a criação.

**Verificação:** `node --check` em todos os `.js`; harness Node confirmou a
resolução da loja curada (entrada inválida ignorada, preço do Mestre
propagado, acervo 26+1) e a matemática dos limites de validação; endpoints
testados ponta-a-ponta com o cliente Flask em campanha isolada descartável
(Mestre PUT ok, jogador só GET). Dados reais intactos.

**Como reverter:** restaurar os ficheiros de
`versoes/2026-07-04-fase9c-validacoes-loja-curada/` (nomes com `__` no lugar
de `/`) ou `git revert` do commit desta entrada; a chave `loja_especial_itens`
em `data/estado*.json`/Firestore é ignorada por versões antigas.

## 2026-07-04 — Autenticação e Sistema de Campanha, v1 (Fase 10)

**Backup antes da alteração:** `versoes/2026-07-04-fase10-auth-campanha/`.

**Resumo:** contas individuais com auto-registo (usuário/senha com hash) e
campanhas como entidade própria: qualquer utilizador registado pode criar uma
campanha (vira o Mestre dela, com código de convite) ou entrar numa mesa com o
código partilhado pelo Mestre. O personagem vive na campanha ativa; fichas
novas ganham dono (`donoUid`) e só o dono (ou o Mestre) joga/edita. Regra de
permanência: 3 falhas nos testes de morte selam a ficha como memorial
(read-only, 🪦) — o jogador volta criando personagem novo; o Mestre tem botão
"Reviver" para exceções (ressurreição em jogo). **As contas fixas antigas
(Ismaile/jogador) continuam a funcionar exatamente como antes** (legado), e a
campanha `principal` segue intocada.

**Ficheiros novos:** `templates/registro.html` (criar conta),
`templates/campanhas.html` (Minhas Campanhas: lista, entrar por código, criar).

**Ficheiros alterados (backup em `versoes/2026-07-04-fase10-auth-campanha/`):**
- `app.py` — armazém de utilizadores (`usuarios`) e campanhas (`campanhas_meta`)
  no Firestore com fallback local `data/usuarios.json`/`data/campanhas_meta.json`;
  rotas `/registro`, `/campanhas`, `/campanha/nova|entrar|ativa`,
  `/api/campanha_info`, `/api/campanha_remover_membro`; login tenta contas
  fixas primeiro (legado) e depois as registadas; `papel_na_campanha()` deriva
  mestre/jogador da campanha ativa; `/campanha` (form livre do cabeçalho)
  agora valida membresia para contas registadas (fecha escalada de privilégio).
- `templates/login.html` — link "Criar conta de jogador".
- `templates/mestre.html` — aba "Membros" (código de convite + remover jogador);
  expõe `window.MEU_UID`/`window.EH_MESTRE`.
- `templates/jogador.html` — link "🗺️ Campanhas"; "Voltar ao Mestre" por papel
  (não mais hardcoded ao usuário Ismaile); expõe `MEU_UID`/`EH_MESTRE`.
- `static/js/app.js` — aba Membros; cartão de ficha morta (🪦 Memorial, editar
  desabilitado); fichas novas ganham `donoUid`/`status`.
- `static/js/jogador.js` — ficha com dono só jogável/editável pelo dono
  (fichas antigas sem dono ficam livres — legado); cartão de morto = memorial.
- `static/js/jogo.js` — `testeMorte()` com 3 falhas grava `status='morto'` +
  `morteEm` e a ficha abre como memorial read-only (história, ligação e item
  de memória em destaque); botão "✨ Reviver" só para o Mestre.
- `static/css/style.css` — `.campanha-*`, `.ficha-morta`, `.jg-memorial`,
  `.convite-codigo`.
- `.gitignore` — `data/usuarios.json`, `data/campanhas_meta.json`,
  `data/estado_*.json` (contêm hashes de senha/estado local — nunca versionar).

**Decisões de design / pontos em aberto:**
- **Auto-registo com convite** (escolha do Ismaile): registo aberto, mas entrar
  numa mesa exige o código de convite do Mestre.
- **Qualquer conta registada pode criar campanha** e vira Mestre só dela — o
  mestre legado (Ismaile) continua mestre em TODAS as campanhas.
- **Fichas antigas sem `donoUid` ficam livres** (qualquer jogador da mesa joga)
  — migração silenciosa, mesmo princípio das fases anteriores.
- **Regras do Firestore** ainda são as antigas — a v1 valida tudo no servidor
  Flask, mas o acesso RT (firebase-rt.js) lê o documento inteiro da campanha;
  revisão de segurança dedicada continua pendente (ver SEGURANCA.md e Fase 10
  passo 7 no ROADMAP-FUTURO).
- **Contas geridas só por ficheiro/coleção** — sem recuperação de senha nem
  e-mail (v1); Firebase Auth fica como evolução futura.
- **Legado partilhado**: quem entra com a conta fixa `jogador` partilha o mesmo
  "dono" (uid `legacy:jogador`) — comportamento igual ao de hoje.

**Verificação:** `node --check` em todos os `.js` + harness de carga completo;
backend com 17 cenários no cliente Flask (registo/duplicado/inválido, fluxo
Minhas Campanhas, convite certo/errado/case-insensitive, código oculto para
jogador, remoção de membro revoga acesso, escalada de privilégio pelo form
`/campanha` bloqueada para contas registadas, logins legados intactos, senhas
sempre com hash). Dados de teste apagados; `data/estado.json` real intacto.

**Como reverter:** restaurar `versoes/2026-07-04-fase10-auth-campanha/` ou
`git revert`; apagar `templates/registro.html`/`campanhas.html` e os ficheiros
locais `data/usuarios.json`/`data/campanhas_meta.json` se existirem. Fichas
com `donoUid`/`status` continuam válidas em versões antigas (campos ignorados).

## 2026-07-04 — Regras do Firestore por campanha (Fase 10.8)

**Backup antes da alteração:** `versoes/2026-07-04-fase10-8-regras-firestore/`.

**Resumo:** o tempo real deixa de depender de leitura pública. O Flask emite
tokens personalizados do Firebase Auth (`/api/firebase_token`, com o uid da
sessão e claims `legado`/`legadoMestre`), o cliente autentica-se antes do
`onSnapshot`, e as novas regras (`firestore.rules`, versionado na raiz) só
deixam ler `campanha/<id>` a quem é mestre/membro dela — `usuarios` e
`campanhas_meta` ficam totalmente inacessíveis ao cliente (contêm hashes de
senha). Escrita continua 100% pelo backend (Admin SDK).

**Ficheiros novos:** `firestore.rules` (regras comentadas, prontas a publicar).

**Ficheiros alterados (backup em `versoes/2026-07-04-fase10-8-regras-firestore/`):**
- `app.py` — endpoint `/api/firebase_token` (login obrigatório; `disponivel:false`
  em modo local; claims de legado para as contas fixas).
- `static/js/firebase-rt.js` — autentica com `signInWithCustomToken` antes de
  escutar (promessa única por página); se o Auth falhar, tenta escutar na
  mesma (degradação suave durante a transição de regras).
- `templates/mestre.html`, `templates/jogador.html` — script `firebase-auth-compat`.
- `SEGURANCA.md` — secção de regras reescrita: modelo por campanha + passos de
  ativação no Console (ordem: deploy do código PRIMEIRO, regras depois).

**Decisões / pontos em aberto:**
- **Ativação é manual no Console** (só o Ismaile pode): Authentication →
  Começar, depois Firestore → Regras → colar `firestore.rules` → Publicar.
  Até lá, tudo continua a funcionar como antes (regras antigas + código novo).
- **Membros da mesa continuam a ver o documento inteiro da campanha** via RT
  (incluindo notas não compartilhadas) — as regras fecham o acesso a
  estranhos, não aos próprios jogadores; separar notas num doc à parte fica
  como evolução futura (nota no SEGURANCA.md).
- A emissão real do token exige o Firestore/Admin SDK ativos — em modo local
  o endpoint devolve `disponivel:false` e o cliente segue sem RT (polling).

**Verificação:** `node --check` no firebase-rt.js; contrato do endpoint testado
no cliente Flask (sem login → bloqueado; modo local → `disponivel:false`).
A validação das regras em si só é possível no projeto Firebase real (fica
para o passo de publicação no Console).

**Como reverter:** restaurar `versoes/2026-07-04-fase10-8-regras-firestore/`
(ou `git revert`); no Console, repor as regras antigas de leitura pública
(estão no histórico do próprio Console e no git em `SEGURANCA.md` antigo).

## 2026-07-05 — Assinatura manual: trial de 3 dias + painel admin (Fase 10.9)

**Backup antes da alteração:** `versoes/2026-07-04-fase10-9-assinatura/`.

**Resumo:** o registo passa a pedir nome completo, e-mail, CPF (validado com
dígitos verificadores; único — impede multi-trial) e WhatsApp opcional. Toda
conta nova ganha **3 dias grátis** (`TRIAL_DIAS`); expirou, o acesso bloqueia:
páginas redirecionam para `/assinatura` (instruções de Pix + botão "Já paguei
— avisar") e a API responde 402. A confirmação é **100% manual** no painel
`/admin/assinaturas` (só o mestre legado): +30 dias, +trial, bloquear/
desbloquear, com o aviso de pagamento do utilizador visível. Contas legadas
(env) são isentas de assinatura.

**Ficheiros novos:** `templates/assinatura.html`, `templates/admin_assinaturas.html`.

**Ficheiros alterados (backup em `versoes/2026-07-04-fase10-9-assinatura/`):**
- `app.py` — `validar_cpf()` (checksum), `assinatura_valida()`/`status_assinatura()`,
  `carregar_usuario_reg()` (leitura de 1 doc por request, sem stream da coleção),
  `login_obrigatorio(exigir_assinatura=...)`, registo estendido com unicidade de
  e-mail/CPF, rotas `/assinatura` e `/admin/assinaturas`; envs `TRIAL_DIAS`,
  `ASSINATURA_PRECO`, `PIX_CHAVE`, `CONTATO_PAGAMENTO`.
- `templates/registro.html` — campos novos + aviso do trial/preço.
- `templates/campanhas.html` — link "🔑 Admin de assinaturas" (só mestre legado).
- `static/css/style.css` — `.assinatura-*`, `.admin-tabela*`.
- `.env.example` — as 4 envs novas.
- `SEGURANCA.md` — secção LGPD (CPF: finalidade, exclusão a pedido, como remover o campo).

**Decisões / pontos em aberto:**
- **CPF (LGPD)**: guardado para impedir multi-trial; regras do Firestore negam
  leitura do cliente e o painel é só do mestre legado, mas a responsabilidade
  legal é do operador — instruções para remover o campo no SEGURANCA.md.
- **Sem upload de comprovante**: o utilizador envia o comprovante pelo contato
  configurado (`CONTATO_PAGAMENTO`) e regista um aviso textual; guardar
  ficheiros exigiria Firebase Storage (evolução futura).
- **Sem renovação automática/gateway**: por desenho (confirmação manual para
  testes); integração Pix automática fica para depois.
- Configurar no Render: `PIX_CHAVE` e `CONTATO_PAGAMENTO` reais.

**Verificação:** 10 cenários no cliente Flask (trial, expiração bloqueia
páginas/API, CPF/e-mail inválidos e duplicados, informar pagamento, painel
restrito, +30 dias reabre, bloquear/desbloquear, legados isentos) + fluxo
completo verificado AO VIVO no preview (registo → Minhas Campanhas →
/assinatura → login admin → aprovar +30 dias). Conta de teste do preview
removida do armazém local.

**Como reverter:** restaurar `versoes/2026-07-04-fase10-9-assinatura/` (ou
`git revert`) e apagar os 2 templates novos; contas já registadas continuam a
funcionar (os campos extra são ignorados por versões antigas).

## 2026-07-05 — NPCs da campanha (Fase 11)

**Backup antes da alteração:** `versoes/2026-07-05-fase11-npcs/`.

**Resumo:** NPCs (lojistas, aliados, inimigos, neutros) agora têm ficha
própria que PERSISTE entre combates e sessões — diferente do bestiário
(estático) e dos avulsos do rastreador (efémeros). O Mestre gere tudo na nova
aba "NPCs" (CRUD com modal: descrição pública, notas privadas 🔒, stat block
opcional); os jogadores ganham a aba "NPCs Conhecidos" (só os visíveis, em
tempo real); e NPCs com stat block entram no combate pelo botão "+ NPC".

**Ficheiros novos:** `static/js/npc.js` — módulo partilhado Mestre/Jogador
(CRUD, cartões, filtro de visibilidade replicado no RT, hook
`window._npcsAtualizados` para o rastreador).

**Ficheiros alterados (backup em `versoes/2026-07-05-fase11-npcs/`):**
- `app.py` — chave `npcs` no estado + `GET/PUT /api/npcs` (GET: jogador só
  recebe `visivelParaJogadores` e sem `notasPrivadas` — filtro no servidor,
  mesmo padrão de /api/notas; PUT só Mestre).
- `templates/mestre.html` — aba "NPCs" (a antiga "Notas / NPCs" virou só
  "Notas"), modal de edição (tipo/local/descrição/notas privadas/visível/
  stat block com CA/PV/6 atributos/ações uma-por-linha) e "+ NPC" na barra
  do Combate.
- `templates/jogador.html` — aba "NPCs Conhecidos" (read-only).
- `static/js/app.js` — combate: `popularNpcCombate()` + handler "+ NPC"
  (inimigo entra do lado dos monstros; lojista/aliado/neutro como 🤝 aliado;
  ações parseadas pelo MESMO `parseAcoes` do bestiário); `bonusSalva()` e
  a rolagem de iniciativa reconhecem combatentes `npcId` (atributos do stat
  block); RT sincroniza `npcs`; backup exporta/importa `npcs`.
- `static/js/jogador.js` — RT sincroniza `npcs` (via `window._syncNpcs`).
- `static/css/style.css` — `.npc-card` (cor da borda por tipo), `.npc-desc`,
  `.npc-notas-privadas`, `.npc-visivel`, `.npc-attrs`.

**Decisões / pontos em aberto:**
- **Notas privadas nunca saem do servidor** para jogadores no REST; no tempo
  real (que entrega o doc inteiro da campanha a membros) o filtro é replicado
  no cliente — mesma limitação já documentada para as notas do Mestre
  (SEGURANCA.md): protege da UI, não de quem inspecionar o socket. Segredos
  críticos: usar as notas privadas com a mesma cautela das notas de campanha.
- **PV do NPC no combate é uma CÓPIA** (como monstros): dano no rastreador
  não altera o `pvAtual` persistente do NPC — o Mestre atualiza a ficha do
  NPC se quiser registar ferimentos duradouros (sincronizar automaticamente
  fica para quando houver necessidade real em mesa).
- **Retrato/imagem** (11.6) fora de escopo até haver hospedagem de imagens.
- `lojaId` do plano fica para a Fase 12 (lojas geridas por NPC).

**Verificação:** `node --check` em todos os `.js`; endpoints testados no
cliente Flask em campanha isolada (4 cenários: vazio, Mestre lê tudo,
jogador só visíveis SEM notas privadas, PUT bloqueado); harness Node provou
que `parseAcoes` entende o formato de ações do NPC e que o filtro RT do lado
do jogador não vaza segredos para o HTML.

**Como reverter:** restaurar `versoes/2026-07-05-fase11-npcs/` (ou
`git revert`) e apagar `static/js/npc.js`; a chave `npcs` no estado é
ignorada por versões antigas.

## 2026-07-05 — P0: rascunho persistente + XP/ouro só via Mestre (B1/B2)

**Backup antes da alteração:** `versoes/2026-07-05-p0-rascunho-xp/`.

### B1 — Bug: atualizar a página perdia tudo
O estado da criação vivia só em memória. Agora:
- **Criador** (`criador.js`): cada alteração grava um rascunho no
  `localStorage` (debounce 300ms; chave por campanha), incluindo o passo
  atual. Ao reabrir NO MESMO contexto (ficha nova ↔ nova, ou a mesma ficha),
  pergunta "📝 Continuar de onde parou?" — aceitar restaura estado+passo
  (com merge no shape atual, p/ rascunhos de versões antigas); recusar
  descarta. Salvar/Excluir limpam o rascunho; Cancelar MANTÉM (proteção
  contra fecho acidental).
- **Modal de NPC** (`npc.js`) e **Item Mágico** (`itensmestre.js`): snapshot
  no `beforeunload` (se o modal/form estiver aberto) + oferta de restauro ao
  recarregar; limpo ao salvar/cancelar.

### B2 — Integridade: XP e ouro só via Mestre
- Modo de Jogo (`jogo.js`): os controlos "+/− ouro" e "+ Ganhar XP" agora só
  aparecem quando `window.EH_MESTRE` — o jogador vê o valor e a dica ("ganhe
  ouro do Mestre ou vendendo itens; gaste na Loja" / "o Mestre concede o
  XP"). Compra/venda na loja continuam a mexer no ouro normalmente.
- Painel "📦 Enviar à ficha" (`app.js` + `mestre.html`): ganhou campo **XP**
  e o toggle **"👥 todos"** — ouro/XP vão à mesa inteira (fichas mortas são
  puladas); itens continuam indo só ao personagem selecionado.

**Decisões:** Cancelar mantém o rascunho de propósito (o objetivo do B1 é
proteger contra perda acidental); "Ver como Jogador" do mestre legado mantém
os controlos (EH_MESTRE=true) — é ferramenta de mestre, não brecha.

**Verificação:** `node --check` em tudo; harness Node com localStorage
simulado cobriu o ciclo completo do rascunho (autosave → restauro pós-F5 com
nome preservado → recusa descarta) e o gating do B2 (render do Modo de Jogo
com EH_MESTRE false/true: jogador sem controlos e com dicas, mestre com
tudo).

**Como reverter:** restaurar `versoes/2026-07-05-p0-rascunho-xp/` ou
`git revert`; rascunhos órfãos no localStorage são inofensivos (chaves
`dnd_rascunho_*`).
