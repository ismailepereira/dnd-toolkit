# Changelog

Registo de alterações relevantes do D&D Toolkit. Cada entrada indica os
ficheiros tocados e, quando aplicável, a pasta de backup em `versoes/` com o
estado anterior desses ficheiros (para reverter sem depender só do Git).

## 2026-07-22 — F3b · Druida — Forma Elemental 🌙 (Círculo da Lua N10)

**Backup:** `versoes/2026-07-22-f3b-forma-elemental/` (formaselvagem.js, jogo.js, unit-regras.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** Fase F3b do roadmap Fichas & Combate. O Druida do Círculo da Lua (N10) agora pode gastar **2 usos**
de Forma Selvagem para virar um **Elemental**.
- **4 elementais** (Ar/Terra/Fogo/Água, ND 5, stats do MM em metros) num catálogo próprio `FORMAS_ELEMENTAIS`
  (`formaselvagem.js`), com CA/PV/deslocamento/atributos físicos/ataques (Multiataque + Golpe/Toque)/traços
  (Forma Aérea, Deslizar na Terra, Forma Ígnea, Sorver, resistências…).
- **Separados das feras:** não entram na lista normal (que filtra por ND ≤ teto — elementais são ND 5), mas
  `formaSelvagemDados` os encontra para o painel/PV da forma ativa. Novo `formasElementaisDisponiveis(nivel,
  subclasse)` só devolve as 4 na **Lua N10+**.
- **Modo de Jogo (`jogo.js`):** seletor **🌙 Forma Elemental (2 usos)** abaixo do seletor de feras; transformar
  reusa o painel da forma ativa (dano/cura/reverter) com cabeçalho 🌙. `transformarEm(nome, custo)` unifica fera
  (1 uso) e elemental (2); guard rejeita se faltam usos (Arquidruida N20 = ilimitado).

**Ficheiros:** `static/js/formaselvagem.js` (+catálogo, +helper, `formaSelvagemDados`+exports), `static/js/jogo.js`
(seletor elemental, `transformarEm`, cabeçalho 🌙), `tests/unit-regras.js` (+3 casos), `docs/ROADMAP-FICHAS-COMBATE.md`
(F3b ✅).

**Verificação:** `node --check` OK · `npm test` **35/35** ✅ (elementais só na Lua N10; achados por
formaSelvagemDados; fora da lista de feras). E2E em **navegador real** (Browser pane): Druida Lua N10 → seletor
com os 4 elementais e botão ativo (2/2); virar Elemental do Fogo gastou 2 usos, painel "🌙 Forma Elemental —
Elemental do Fogo · 102 PV · Multiataque", log correto; N9 e outro Círculo sem o bloco; N10 com 1 uso → botão
travado.

**Como reverter:** restaurar `versoes/2026-07-22-f3b-forma-elemental/`, ou `git revert`.

**Próximo (roadmap Fichas & Combate):** F3 (Conjuração Atemporal N18) ou **C6** (efeitos → condições com 1 toque).

## 2026-07-21 — F4 · Cartão-resumo de combate ⚔️ (Criador + PDF)

**Backup:** `versoes/2026-07-21-f4-cartao-combate/` (regras-ficha.js, criador.js, jogo.js, _criador.html,
unit-regras.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** Fase F4 do roadmap Fichas & Combate. O jogador novo terminava a ficha sem saber o que faz no turno;
agora a **etapa final do Criador** (passo 6) e o **PDF** mostram o mesmo cartão **"⚔️ Seu personagem em combate"**.
- **Conteúdo (a "cola" do turno):** CA · PV · deslocamento · iniciativa; **ataque principal** (arma da mão
  principal, ou a de maior bônus de acerto) com acerto/dano; **melhor magia** (maior CD entre as classes +
  ataque mágico + truque/magia de destaque); e o **recurso de classe a não esquecer** (Fúria, Ki, Canalizar,
  Retomar o Fôlego…).
- **Fonte única:** `resumoCombate5e(f)` escolhe os números (função PURA em `regras-ficha.js`, cai no modo
  monoclasse sem `ataqueArma`/`classesAtuais`) e `cartaoCombateHtml(f, {ca,pv,deslocamento,iniciativa})` monta o
  **mesmo markup** (estilos inline, tema-resiliente) para os dois lugares — Criador e PDF não divergem.
- **Criador:** novo `#cResumoCombate` no topo do passo 6 (`_criador.html`), populado no `renderPreview` (criador.js).
- **PDF:** cartão inserido logo após a linha de stats em `exportarFichaPDF` (jogo.js).

**Ficheiros:** `static/js/regras-ficha.js` (+`resumoCombate5e`, +`cartaoCombateHtml`, exports), `static/js/criador.js`
(render no passo 6), `static/js/jogo.js` (card no PDF), `templates/_criador.html` (container), `tests/unit-regras.js`
(+3 casos), `tests/e2e-pdf.js` (+asserções do card no PDF), `docs/ROADMAP-FICHAS-COMBATE.md` (F4 ✅).

**Verificação:** `node --check` OK · `npm test` **32/32** ✅ (3 novos: melhor CD + recurso; guerreiro sem conj;
markup do cartão). E2E em **navegador real** (Browser pane): funções globais pegam a Espada Longa equipada
(+5 · 1d10+3) e o recurso; Criador com Guerreiro → `#cResumoCombate` renderiza "CA 18 · PV 13 · 30m · Inic +2 ·
Ataque: Espada Longa +5 · Não esqueça: Retomar o Fôlego". Asserções do card no PDF adicionadas ao `e2e-pdf.js`
(roda no CI). Nota: disparar o print do PDF na aba do preview trava o diálogo nativo — verifiquei o card pelo
caminho puro + Criador + teste de CI, sem imprimir ao vivo.

**Como reverter:** restaurar `versoes/2026-07-21-f4-cartao-combate/`, ou `git revert`.

**Próximo (roadmap Fichas & Combate):** **F3b** (Forma Elemental do Druida, Círculo da Lua N10) ou **C6/C7**.

## 2026-07-21 — F2 (fecho) · Ladino 🃏 + Patrulheiro 🐾 — FASE F2 CONCLUÍDA

**Backup:** `versoes/2026-07-21-f2-ladino-patrulheiro/` (jogo.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 4ª e 5ª "menores" da FASE F2 (num commit — ambas eram "só texto"). **Conclui a FASE F2** — as 12
classes têm agora (a) painel no Criador, (b) recurso rastreável e (c) ação com card/botão/toggle.
- **🃏 Ação Ladina (Ladino N2+):** card-lembrete das 3 opções de **ação bônus** (Disparar, Desengajar,
  Esconder-se), deixando claro que é grátis a cada turno (não gasta recurso). Fecha o "só texto".
- **🐾 Consciência Primitiva (Patrulheiro N3+):** card com botão **🐾 Sondar** que **gasta o menor espaço de
  magia disponível** e registra no Histórico a sondagem (aberrações, celestiais, corruptores, dragões,
  elementais, fadas ou mortos-vivos a até 1,5 km / 6 km em terreno favorito; sem número nem localização, 1 min
  por nível do espaço). Botão desabilita sem espaço.

**Ficheiros:** `static/js/jogo.js` (`patrulheiroConsciencia`/`conscienciaPrimitiva`, os 2 cards, handler, índice
T3, inserção no HTML), `docs/ROADMAP-FICHAS-COMBATE.md` (linhas Ladino/Patrulheiro ✅, F2 marcada CONCLUÍDA).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Ladino N3 →
card com as 3 opções; Patrulheiro N3 com espaço de 1º → botão gastou o espaço ({1:1}) e logou a sondagem com os
tipos corretos.

**Como reverter:** restaurar `versoes/2026-07-21-f2-ladino-patrulheiro/`, ou `git revert`.

**Próximo (roadmap Fichas & Combate):** **F4** — cartão-resumo de combate no fim do Criador ("cola" do jogador).

## 2026-07-21 — F2 (fecho) · Paladino — Imposição das Mãos 🙏 (distribuir cura)

**Backup:** `versoes/2026-07-21-f2-paladino-impmaos/` (jogo.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 3ª das "menores" da FASE F2. A reserva da Imposição das Mãos já era rastreável (pool em Recursos de
Classe), mas gastar era manual no −/+. Agora há um card no Modo de Jogo (`jogo.js`).
- **Card 🙏 Imposição das Mãos** (só p/ Paladino) com a reserva (5×nível PV) no cabeçalho.
- **Curar-me N:** input + botão que gasta N da reserva e **cura o próprio PV** (respeitando o máximo), logando.
- **−5: doença/veneno:** botão que gasta 5 da reserva para neutralizar uma doença OU um veneno.
- **Aliados:** hint explica que curar um aliado gasta a mesma reserva (o PV entra na ficha dele). Botões
  desabilitam sem reserva; a reserva volta no descanso longo (`rec: longo`).

**Ficheiros:** `static/js/jogo.js` (`paladinoImpMaos`/`impMaosRestam`/`imposicaoDasMaos`/`imposicaoDoencaVeneno`,
card, handlers, índice T3), `docs/ROADMAP-FICHAS-COMBATE.md` (linha do Paladino ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Paladino N5
(reserva 25/25), ferido 20/44 → "Curar-me 8" curou p/ 28/44 e baixou a reserva p/ 17; "−5 doença/veneno" baixou
p/ 13; ambos logados.

**Como reverter:** restaurar `versoes/2026-07-21-f2-paladino-impmaos/`, ou `git revert`.

## 2026-07-21 — F2 (fecho) · Mago — Recuperação Arcana 🔮 (botão)

**Backup:** `versoes/2026-07-21-f2-mago-recuperacao/` (jogo.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 2ª das "menores" da FASE F2. A Recuperação Arcana (Mago N1) não tinha botão; agora é um card no
Modo de Jogo (`jogo.js`).
- **Card 🔮 Recuperação Arcana** (só p/ Mago) com o orçamento **⌈nível/2⌉ níveis de círculo** e um botão.
- **Efeito real:** recupera os espaços gastos do **círculo mais alto para o mais baixo** (nenhum acima do 5º),
  cabendo no orçamento — one-click, registrando no Histórico o que voltou (ex.: "1× 3º").
- **Limite:** **1×/descanso longo** (`ficha.recArcanaUsada`, resetado no descanso longo). Botão desabilita se já
  usada ou se não há espaço de 1º-5º gasto para recuperar.

**Ficheiros:** `static/js/jogo.js` (`magoDaFicha`/`recuperacaoArcana`, card, handler, índice T3, reset no descanso
longo), `docs/ROADMAP-FICHAS-COMBATE.md` (linha do Mago ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Mago N6
(orçamento 3) com espaços gastos {1:2,2:1,3:1} → botão recuperou 1× 3º (o mais valioso que cabe), marcou como
usada, desabilitou e logou.

**Como reverter:** restaurar `versoes/2026-07-21-f2-mago-recuperacao/`, ou `git revert`.

## 2026-07-21 — F2 (fecho) · Bárbaro — Ataque Descuidado 💥 (toggle de vantagem)

**Backup:** `versoes/2026-07-21-f2-barbaro-descuidado/` (jogo.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 1ª das "menores" da FASE F2. O Ataque Descuidado (Bárbaro N2) era só texto; agora é um **toggle**
funcional no Modo de Jogo (`jogo.js`).
- **Toggle 💥 Ataque Descuidado** na barra "🎯 O teu turno" (só aparece p/ Bárbaro N2+), estado em
  `ficha.estadoTatico.descuidado`.
- **Efeito real:** ligado, os ataques **corpo a corpo com Força** (nem à distância, nem com Destreza) passam a
  **rolar com vantagem** — botão 🎲 atacar ganha `data-descuidado` e o handler força vantagem via
  `d20Modo(forcarVantagem)`; se o jogador já escolheu desvantagem, os dois se cancelam (→ normal, regra do PHB).
  Selo "💥 vant." no ataque afetado.
- **Aviso honesto:** cabeçalho de Ataques mostra "inimigos têm vantagem contra você até seu próximo turno".

**Ficheiros:** `static/js/jogo.js` (`d20Modo` com override, cálculo `descuidadoAtivo`, selo/`data-descuidado` nos
ataques, chip + handler, aviso no cabeçalho), `docs/ROADMAP-FICHAS-COMBATE.md` (linha do Bárbaro ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Bárbaro N2 com
Machado Grande (corpo a corpo) + Arco Curto (distância) → toggle liga `estadoTatico.descuidado`, aviso no
cabeçalho, só o Machado recebe `data-descuidado="1"`; ataque do Machado logou "d20 1/20→20 (vant.)" (pegou o
maior); o Arco continua normal.

**Como reverter:** restaurar `versoes/2026-07-21-f2-barbaro-descuidado/`, ou `git revert`.

## 2026-07-21 — F2 · Guerreiro — Retomar o Fôlego 💨 + Surto de Ação ⚡

**Backup:** `versoes/2026-07-21-f2-guerreiro-folego/` (jogo.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 5ª (e última das "grandes") correção da FASE F2. Novo card **💨 Retomar o Fôlego** no Modo de Jogo
(`jogo.js`) para o Guerreiro — fecha a lacuna "Retomar o Fôlego era só um contador, não rolava/curava".
- **Retomar o Fôlego (N1):** botão que rola **1d10 + nível de Guerreiro**, **cura de fato** (respeitando o PV
  máximo) e gasta 1 uso — `rec: curto`, 1×/descanso curto — registrando no Histórico o detalhe da rolagem
  (`1d10+3 = 11 [8+3] → +11 PV`).
- **Surto de Ação (N2+):** no mesmo card, botão **⚡ Surto de Ação** que gasta 1 uso (2 usos no N17) e loga a
  ação adicional do turno.
- **Guards:** cada botão desabilita quando não há uso; ambos os pontos usam o **mesmo contador** de "Recursos
  de Classe" (fonte única `recursosDeClasse5e`). Guerreiro N1 tem só o Fôlego (Surto chega no N2). Entrada no
  índice de ações do turno (T3.2).

**Ficheiros:** `static/js/jogo.js` (`guerreiroDaFicha`/`retomarFolego`/`surtoDeAcao`, card, handlers, índice T3,
inserção no HTML), `tests/e2e-pdf.js` (+bloco F2 Guerreiro), `docs/ROADMAP-FICHAS-COMBATE.md` (item 5 ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane, preview
local): Guerreiro N3 ferido (10/28) → card com "1/1", botões 💨 (1d10+3) e ⚡; Fôlego rolou 8+3 e curou p/ 21/28,
gastou o uso e desabilitou + logou; Surto gastou 1 uso e logou; N1 tem Fôlego mas não o Surto. Caso de
regressão adicionado ao `e2e-pdf.js` (roda no CI).

**Como reverter:** restaurar `versoes/2026-07-21-f2-guerreiro-folego/`, ou `git revert`.

**Próximo (F2):** passada de fecho das "menores" (Ataque Descuidado, Ação Ladina, Recuperação Arcana, Imposição
das Mãos-cura, Consciência Primitiva), se valer a pena — depois a fase segue p/ F3b/F4.

## 2026-07-21 — F2 · Monge — Opções de Ki com botão 👊

**Backup:** `versoes/2026-07-21-f2-monge-ki/` (jogo.js, e2e-pdf.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 4ª correção da FASE F2. Novo card **👊 Opções de Ki** no Modo de Jogo (`jogo.js`) para o Monge
(N2+) — fecha a lacuna "as opções de Ki eram só texto, sem botão que gaste o ponto".
- **N2:** três botões — **Rajada de Golpes** (2 ataques desarmados bônus), **Defesa Paciente** (Esquiva bônus)
  e **Passo do Vento** (Disparar/Desengajar bônus, salto dobra) — cada um **gasta 1 Ponto de Ki** e registra
  no Histórico. Cada opção tem a explicação de mesa acima dos botões.
- **N5:** ganha o **Golpe Atordoante** (também 1 Ki), com a **CD de Ki (8 + PB + mod SAB)** no texto.
- **Guard:** sem Ki, todos os botões ficam desabilitados. Os pontos usam o **mesmo contador** de "Recursos de
  Classe" (fonte única `recursosDeClasse5e`) — Ki é `rec: curto`, recupera no descanso curto. Cabeçalho mostra
  os Ki restantes. Monge N1 não tem card (Ki começa no N2).

**Ficheiros:** `static/js/jogo.js` (`mongeDaFicha`/`gastarKi`, card, handlers, índice T3, inserção no HTML),
`tests/e2e-pdf.js` (+bloco F2 Monge), `docs/ROADMAP-FICHAS-COMBATE.md` (item 4 ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Monge N5 →
card "5/5 Ki", 4 botões (3 base + Golpe Atordoante); Rajada gasta 1 → "4/5 Ki" e loga; N2 → só as 3 opções
base; Ki esgotado → botões desabilitados; N1 sem card. Caso de regressão no `e2e-pdf.js` (roda no CI).

**Como reverter:** restaurar `versoes/2026-07-21-f2-monge-ki/`, ou `git revert`.

**Próximo (F2):** Guerreiro — Retomar o Fôlego (rola 1d10+nível e cura) + chip de Surto de Ação.

---

## 2026-07-21 — F2 · Feiticeiro — Fontes de Feitiçaria: conversão espaço↔ponto ✴️

**Backup:** `versoes/2026-07-21-f2-feiticeiro-feiticaria/` (jogo.js, e2e-pdf.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 3ª correção da FASE F2. Novo card **✴️ Fontes de Feitiçaria** no Modo de Jogo (`jogo.js`) para o
Feiticeiro (N2+) — fecha a lacuna "Pontos de Feitiçaria sem conversão no clique". Antes só havia o contador
+/− genérico; agora as duas conversões do PHB estão jogáveis num clique:
- **Espaço → pontos:** um botão por círculo com espaço livre; gasta o espaço e **ganha pontos iguais ao
  número do círculo** (1º→1, 2º→2…), sem passar do teto de pontos (= nível).
- **Pontos → espaço:** botões até o 5º com o **custo do PHB (1º=2 · 2º=3 · 3º=5 · 4º=6 · 5º=7)**; gasta os
  pontos e **recupera um espaço já gasto** daquele círculo.
- **Guards:** com os pontos no máximo, os botões espaço→ponto ficam desabilitados (não desperdiça); sem um
  espaço gasto do círculo, o botão de criar fica desabilitado. Os pontos usam o **mesmo contador** de
  "Recursos de Classe" (fonte única `recursosDeClasse5e`). O cabeçalho mostra os **pontos restantes**.

**Ficheiros:** `static/js/jogo.js` (`feiticeiroDaFicha`/`pontosFeiticariaMax`/`espacoParaPontos`/
`pontosParaEspaco` + `CUSTO_ESPACO_FEIT`, card, handlers, índice T3, inserção no HTML), `tests/e2e-pdf.js`
(+bloco F2 Feiticeiro), `docs/ROADMAP-FICHAS-COMBATE.md` (item 3 ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Feiticeiro
N5 (5 pontos), com 3 pontos usados + 2 espaços de 1º gastos → card "2/5 pontos"; espaço 1º→+1pt vira "3/5" e
gasta o espaço; pontos→espaço 1º (custo 2) volta a "1/5" e devolve o espaço; guards conferidos (pontos cheios
travam ganhar; N2 sem espaço gasto trava criar). Caso de regressão no `e2e-pdf.js` (roda no CI).

**Nota de modelo:** "criar espaço" recupera um espaço **gasto** do círculo (o modelo de fichas rastreia
espaços usados até o máximo diário); criar espaços *além* do máximo diário não é representável hoje — cobre o
uso comum de mesa (reconverter pontos num espaço queimado). Documentado na UI.

**Como reverter:** restaurar `versoes/2026-07-21-f2-feiticeiro-feiticaria/`, ou `git revert`.

**Próximo (F2):** Monge — botões das opções de Ki (Rajada de Golpes/Defesa Paciente/Passo do Vento).

---

## 2026-07-21 — F2 · Bardo — Inspiração Bárdica com registro de "a quem" 🎵

**Backup:** `versoes/2026-07-21-f2-bardo-inspiracao/` (jogo.js, e2e-pdf.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** 2ª correção da FASE F2. Novo card **🎵 Inspiração Bárdica** no Modo de Jogo (`jogo.js`) para o Bardo
(N1+) — fecha a lacuna "a Inspiração some sem lembrar a QUEM foi dada".
- **Dar Inspiração:** mostra o **dado por nível** (d6 → d8 no N5 → d10 no N10 → d12 no N15), um campo **"a quem?"**
  e o botão que **gasta 1 uso** (o mesmo contador de "Recursos de Classe" — fonte única `recursosDeClasse5e` —
  então os dois refletem o gasto) e **registra no Histórico** com o nome do aliado.
- **Lista de pendentes:** cada dado dado vira um chip "**Nome (dX)**" na seção "Segurando o dado", com botão
  **✔** que marca como usada e remove da lista (loga "Fulano usou a Inspiração") — **sem devolver o uso**
  (o dado foi gasto ao ser concedido, regra do PHB).
- **Descanso** (curto e longo) limpa os dados pendentes — eles duram só ~1 min.

**Ficheiros:** `static/js/jogo.js` (`bardoDaFicha`/`dadoInspiracao`/`darInspiracao`/`inspiracaoUsada`, card,
handlers, índice T3, limpeza nos descansos, inserção no HTML), `tests/e2e-pdf.js` (+bloco F2 Bardo),
`docs/ROADMAP-FICHAS-COMBATE.md` (item 2 ✅).

**Verificação:** `node --check` OK · `npm test` **29/29** ✅. E2E em **navegador real** (Browser pane): Bardo N3
(CAR +3) → card d6, botão **3/3**; dar a "Thorin" → gasta 1, pendente **Thorin:d6**, chip visível, loga
"Inspiração Bárdica (d6) para Thorin", botão **2/3**; marcar usada → lista zera, uso **segue 1** (não devolve).
Escalonamento do dado conferido (d6/d8/d10/d12 nos N1/5/10/15). Caso de regressão no `e2e-pdf.js` (roda no CI).

**Como reverter:** restaurar `versoes/2026-07-21-f2-bardo-inspiracao/`, ou `git revert`.

**Próximo (F2):** Feiticeiro — conversão espaço↔ponto de Feitiçaria.

---

## 2026-07-21 — F2 (auditoria kit de estreia): tabela das 12 classes + Clérigo — Expulsar Mortos-Vivos ✨

**Backup:** `versoes/2026-07-21-f2-clerigo-expulsar/` (jogo.js, e2e-pdf.js, ROADMAP-FICHAS-COMBATE.md).

**Resumo:** Abre a **FASE F2** — auditoria "kit de estreia" das 12 classes (níveis 1-3) contra 3 critérios:
(a) painel do Criador explica as características, (b) recurso gastável rastreável no Modo de Jogo, (c) ação
especial com botão/card, não só texto.
- **Tabela de auditoria** preenchida e commitada em `docs/ROADMAP-FICHAS-COMBATE.md`. Retrato: (a) e (b) já
  cobertos nas 12 classes; as lacunas reais estão no critério (c). Ordem de correção definida (Clérigo →
  Bardo → Feiticeiro → Monge → Guerreiro).
- **1ª correção — Clérigo · Expulsar Mortos-Vivos:** card **✨ Expulsar Mortos-Vivos** (Canalizar Divindade)
  no Modo de Jogo (`jogo.js`), a partir do N2. Mostra a **CD (8 + PB + mod SAB)**, alcance **9m**, salva de
  **Sabedoria** e o efeito **Expulso** (foge por 1 min, quebra ao sofrer dano). O botão **gasta 1 uso de
  Canalizar Divindade** — o mesmo contador do bloco "Recursos de Classe" (fonte única `recursosDeClasse5e`),
  então os dois refletem o gasto — e **registra no Histórico** com a CD. Linha **💀 Destruir Mortos-Vivos
  (N5+)** com o limiar de ND por nível (½ no N5 → 4 no N17). Entrou também no índice de ações da T3.

**Ficheiros:** `static/js/jogo.js` (função `expulsarMortosVivos`/`clerigoDaFicha`/`ndDestruir`, card, handler,
índice T3, inserção no HTML), `tests/e2e-pdf.js` (+3 asserts F2), `docs/ROADMAP-FICHAS-COMBATE.md` (tabela + item 1).

**Verificação:** `node --check` OK · `npm run test:sintaxe` ✅ · `npm test` **29/29** ✅. E2E em **navegador real**
(Browser pane, conta mestre): Clérigo N3 (SAB 16) → card com **CD 13**, botão **1/1**; clicar gasta 1 Canalizar,
loga "Expulsar Mortos-Vivos: salva de Sabedoria CD 13", botão vira **0/1 desabilitado**; o bloco genérico
"Recursos de Classe" reflete **0/1** (contador compartilhado). Clérigo N5 (SAB 18) → **CD 15** + linha
"💀 Destruir ND ≤ ½". Caso de regressão adicionado ao `e2e-pdf.js` (roda no CI).

**Como reverter:** restaurar `versoes/2026-07-21-f2-clerigo-expulsar/`, ou `git revert`.

**Próximo (F2):** Bardo — Inspiração Bárdica com registro de "a quem" e o dado.

---

## 2026-07-21 — Combate T5: 🪄 Mestre vê as Magias & Poderes do PJ no tracker (conclui a Fase T)

**Backup antes da alteração:** `versoes/2026-07-21-t5-magias-poderes-tracker/` (`app.js`, `jogo.js`, `regras-ficha.js`, `style.css`).

**Resumo:** última parte da Fase T — antes o card de combate do PJ só mostrava os **ataques**; agora o Mestre também vê as **magias e poderes escolhidos**, para conduzir o turno do jogador presencial.
- No card de cada **PJ** do tracker de combate, um bloco recolhível **🪄 Magias & Poderes** (só-leitura) traz: o **cabeçalho de conjuração** por classe (CD e ataque mágico), os **truques** (com o dano quando houver), as **magias de círculo lançáveis hoje** — **Preparadas** para quem prepara (Clérigo, Druida, Mago, Paladino) ou o grimório/conhecidas para os demais, cada uma com o **círculo** (1º, 2º…) — e os **poderes de classe** (Fúria, Ki, Canalizar Divindade, Imposição das Mãos, etc.) com os usos por descanso.
- **Calculado ao vivo da ficha** (`fichas.find(...)` pelo `fichaId`), não guardado no combatente: nunca desatualiza e vale igual para PJs que o próprio jogador colocou na ordem (T4). Uma nota lembra que **o jogador executa a magia/poder no próprio Modo de Jogo** (é lá que o espaço/recurso é gasto na ficha) — o tracker é só o painel de condução do Mestre.
- **Fonte única (DRY):** a tabela de recursos/poderes por classe saiu do fecho do `jogo.js` para `regras-ficha.js` como `recursosDeClasse5e(classe, nivel, modCarisma)`; o Modo de Jogo passou a delegar para ela, então Mestre e jogador leem exatamente os mesmos números. **Com isso a Fase T está concluída.**

**Ficheiros:** `static/js/regras-ficha.js` (`recursosDeClasse5e` compartilhada + export), `static/js/jogo.js` (delega recursos à regra única), `static/js/app.js` (`magiasEPoderesDoPC` + bloco no card do tracker), `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (T5 ✅, Fase T concluída), `tests/unit-regras.js` (+4), `tests/e2e-pdf.js` (+8).

**Verificação:** **29/29** unit (recursosDeClasse5e: Fúria escala, Ki ≥ nv2, Paladino com Sentido Divino/Imposição/Canalizar, classe sem pool vazia) · **E2E completo verde** (card do PJ tem o bloco; CD 14 do Clérigo nv5; truques + magias com círculo; preparador reconhecido; poder Canalizar Divindade listado; nota de execução) · 35/35 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-21-t5-magias-poderes-tracker/`, ou `git revert`.

---

## 2026-07-21 — Combate T4: 🎲 jogador entra no combate rolando a própria iniciativa

**Backup antes da alteração:** `versoes/2026-07-21-t4-entrar-combate/` (`jogo.js`, `style.css`, `app.py`).

**Resumo:** parte T4 da Fase T — antes só o Mestre montava a ordem; agora o jogador entra sozinho.
- Quando há **combate em andamento** e a ficha aberta ainda **não está na ordem**, o Modo de Jogo mostra o banner **🎲 Entrar no combate** (com "Vez de <nome>"). Clicar chama a ação de servidor `entrar_combate`: rola **d20 + iniciativa da ficha**, insere o PJ na lista e **reordena por iniciativa desc preservando a vez atual** (o combatente que estava na vez continua na vez após a reordenação). Assim que entra, o banner vira o de turno normal (T2/T3).
- **Segurança:** o jogador só entra com a **própria** ficha (`donoUid`); o Mestre pode por qualquer PJ. **Rerrolar não duplica** o combatente — só troca a iniciativa e reordena.

**Ficheiros:** `app.py` (ação `entrar_combate`), `static/js/jogo.js` (`entrarCombate` + banner de entrada), `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (T4 ✅), `tests/test-servidor.py` (+5), `tests/e2e-pdf.js` (+2).

**Verificação:** **35/35** servidor (entra e rola iniciativa; lista reordenada desc; rerrolar não duplica; ficha de outro dono → 403) · E2E completo verde (botão de entrar quando fora da ordem → some ao entrar) · 25/25 unit · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-21-t4-entrar-combate/`, ou `git revert`.

---

## 2026-07-21 — Combate T3.2: 🎬 índice de ações no turno (conclui a T3)

**Backup antes da alteração:** `versoes/2026-07-21-t32-indice-acoes/` (`jogo.js`, `style.css`).

**Resumo:** segunda sub-parte da T3 — reúne a visão das ações do personagem quando é a sua vez, sem duplicar os cards.
- Na barra **"⚔️ É a sua vez"**, uma linha **"Suas ações:"** com um atalho por categoria presente na ficha: **⚔️ Ataques (N) · ✨ Magias · ⚡ Punição Divina · 🗡️ Ataque Furtivo · 🐺 Forma Selvagem · 🎲 Recursos de Classe**. Só aparecem as que o personagem realmente tem.
- Clicar num atalho **rola até o bloco existente e o destaca** (flash) — a fonte de cada ação continua sendo o seu próprio bloco (Ataques de Arma, ✨ Conjuração, etc.), então nada é duplicado. O índice some fora da sua vez.
- Cada bloco de ação ganhou um marcador `data-bloco-acao` para o atalho encontrá-lo. **Com isso a T3 (e a antiga C7) está concluída.**

**Ficheiros:** `static/js/jogo.js` (índice no banner + `data-bloco-acao` nos blocos + handler de scroll/flash), `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (T3 ✅), `tests/e2e-pdf.js` (+4).

**Verificação:** E2E completo verde — Clérigo nv3 real no navegador: índice lista Ataques/Magias/Recursos, clicar em "Magias →" destaca o bloco ✨ Conjuração, e o índice some quando não é a vez · 25/25 unit · 30/30 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-21-t32-indice-acoes/`, ou `git revert`.

---

## 2026-07-21 — Combate T3.1: 🎯 marcadores de economia de ação do turno

**Backup antes da alteração:** `versoes/2026-07-21-t3-economia-acao/` (`jogo.js`, `style.css`).

**Resumo:** primeira sub-parte da T3 — o "já usei minha ação?" da mesa remota.
- Na barra **"⚔️ É a sua vez"**, quatro chips: **🎯 Ação · ⚡ Ação Bônus · 👟 Movimento · ↩️ Reação**. Clica ao usar → o chip fica riscado/verde (clica de novo para desmarcar).
- Os marcadores ficam atrelados à **chave do turno** (rodada + índice na iniciativa), então **auto-resetam** sozinhos quando o turno vira — seja você finalizando (o `Finalizar meu turno` já zera), seja o Mestre avançando a ordem. Somem quando não é a sua vez. Estado persistido em `ficha.acoesGastas` (via PATCH da C1).

**Ficheiros:** `static/js/jogo.js` (`acoesDoTurno`/`alternarAcaoTurno` + chips no banner), `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (T3.1 ✅), `tests/e2e-pdf.js` (+5 checagens).

**Verificação:** E2E completo verde — Guerreiro nv3 real no navegador: 4 chips na vez, clicar em "Ação" marca só ele, virar a rodada auto-reseta, fora da vez os chips somem · 25/25 unit · 30/30 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-21-t3-economia-acao/`, ou `git revert`.

---

## 2026-07-21 — Combate T2: ⚔️ "É a sua vez" no Modo de Jogo + finalizar turno

**Backup antes da alteração:** `versoes/2026-07-21-t2-sua-vez/` (`jogo.js`, `jogador.js`, `app.js`, `style.css`, `app.py`).

**Resumo:** parte T2 da Fase T (fluxo de turno) — liga o Modo de Jogo do jogador à iniciativa do combate.
- **Banner no topo do Modo de Jogo** quando o combate está ativo: **⚔️ "É a sua vez! · Rodada X"** (pulsando) com **✔️ Finalizar meu turno** quando a iniciativa aponta para a ficha aberta; **⏳ "Em combate · Vez de <nome>"** quando é de outro; nada fora de combate.
- **Servidor — nova ação `proximo_turno`** em `/api/combate/acao` (acessível ao jogador): avança o **mesmo `combate.turno` do painel do Mestre** (fonte ÚNICA — sem segundo contador), vira a rodada e recarrega ações lendárias como o Mestre já fazia. O jogador só finaliza a **própria vez** (o combatente da vez é um PJ cuja ficha é dele); o Mestre finaliza qualquer uma. Registra no log do combate.
- **Ao vivo:** a sincronização do combate (RT/polling no jogador; render no Mestre) chama `window.Jogo.combateAtualizou()`, então o banner do modal aberto acompanha a mudança de turno feita por outros.

**Ficheiros:** `app.py` (ação `proximo_turno`), `static/js/jogo.js` (`estadoTurno`/`finalizarTurno`/banner + hooks `combateAtualizou`/`estaAberto`), `static/js/jogador.js`, `static/js/app.js`, `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (T2 ✅), `tests/test-servidor.py` (+4), `tests/e2e-pdf.js` (+6).

**Verificação:** **30/30** servidor (jogador finaliza a própria vez → turno avança; NÃO finaliza a de outro → 403; Mestre finaliza qualquer uma e vira a rodada) · E2E completo verde (banner "é a sua vez" com botão; vira "aguardando" na vez do Ogro; some fora de combate) · 25/25 unit · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-21-t2-sua-vez/`, ou `git revert`.

---

## 2026-07-21 — Combate T1: ⓘ card de magia expansível ("o que faz" + usar)

**Backup antes da alteração:** `versoes/2026-07-21-t1-magia-descricao/` (`jogo.js`, `style.css`).

**Resumo:** primeira parte da Fase T (fluxo de turno) — fecha o pedido do Ismaile de "um botão que mostra o que a magia faz e outro de usar, inclusive as sem dano".
- Cada card do bloco **✨ Conjuração** virou um `<details>` expansível: clicar mostra **duração, defesa e a descrição completa** da magia, com o selo **"ⓘ o que faz"** e a escola no resumo. Os botões **✨ Conjurar** (que já desconta o espaço de magia) e **🎲 atacar/dano** continuam ao lado; um guard (`stopPropagation` na área de ações) impede que clicar num botão abra/feche o card.
- Vale para as magias de **utilidade sem dano** (Escudo da Fé, Bênção, Comando…), que era a lacuna sentida — elas já apareciam e já descontavam o espaço desde a C1; agora também explicam o efeito ali no combate.

**Ficheiros:** `static/js/jogo.js` (cardCast vira details + guard), `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (T1 ✅), `tests/e2e-pdf.js` (+8 checagens).

**Verificação:** E2E completo verde — Clérigo nv3 real no navegador: Escudo da Fé (sem dano) é `<details>` fechado com "ⓘ o que faz", abre e mostra "+2 na CA…", o botão Conjurar não fecha o card e desconta o espaço do 1º círculo · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-21-t1-magia-descricao/`, ou `git revert`.

---

## 2026-07-20 — Combate C5: ✨🎲 rolagem integrada nos cards de magia

**Backup antes da alteração:** `versoes/2026-07-20-c5-rolagem-magia/` (`jogo.js`, `style.css`).

**Resumo:** item C5 do roadmap — as armas já tinham 🎲; agora as **magias** também.
- Cada card do bloco **✨ Conjuração** ganhou botões de rolagem: **"🎲 atacar"** nas magias de ataque (rola d20 + ataque mágico, respeitando o modo Vantagem/Desvantagem e o Dado Físico, marcando 20/1 natural) e **"🎲 dano"** / **"🎲 cura"** com a fórmula certa. O helper `formulaMagia` extrai o NdM do compêndio, **escala o dado do truque** pelo nível do personagem (Raio de Gelo nv5 → 2d8, Rajada de Fogo nv5 → 2d10) e **soma o modificador de conjuração** quando a magia diz "+mod" (Curar Ferimentos com INT +3 → 1d8+3). Toda rolagem entra no Histórico.
- Magias de salvaguarda (ex.: Rajada de Fogo pede save de Destreza) não mostram "🎲 atacar" — só o dano; magias sem dado (utilitárias) não mostram nenhum.

**Ficheiros:** `static/js/jogo.js` (`formulaMagia` + botões no card + handlers), `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (C5 ✅), `tests/e2e-pdf.js` (+6 checagens).

**Verificação:** E2E completo verde — Mago nv5 real no navegador: Raio de Gelo (ataque) tem 🎲 atacar e dano 2d8; Rajada de Fogo (save) só dano 2d10; Curar Ferimentos vira 🎲 cura 1d8+3; rolar registra no histórico · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-20-c5-rolagem-magia/`, ou `git revert`.

---

## 2026-07-20 — Combate C4 (fecha): 🔥 dano da Fúria do Bárbaro somado automático no corpo a corpo

**Backup antes da alteração:** `versoes/2026-07-20-barbaro-furia/` (`jogo.js`, `regras.js`, `style.css`).

**Resumo:** fecha o item C4 do roadmap (o dano da Fúria era manual).
- Enquanto o Bárbaro está **"Em Fúria"** (toggle do painel "O teu turno"), o dano de cada ataque **corpo a corpo com Força** ganha o bônus da Fúria automaticamente: **+2** (nv1-8), **+3** (nv9-15), **+4** (nv16+). O selo **🔥+N** aparece ao lado do dano e o bônus **já entra no botão "🎲 dano"** (ex.: Machado Grande passa de `1d12+4` para `1d12+6`). O cabeçalho de Ataques de Arma avisa "🔥 Em Fúria: +N de dano corpo a corpo (Força)".
- **Não se aplica** a ataques à distância (arco) nem a golpes que usam Destreza — a regra 5e restringe a Fúria a armas corpo a corpo de Força. `ataqueArma` ganhou um parâmetro opcional de bônus de dano (não-destrutivo) e passou a expor `usaDes`/`distancia` para essa decisão.

**Ficheiros:** `static/js/regras.js` (`ataqueArma` com bônus opcional + flags), `static/js/jogo.js`, `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (C4 ✅), `tests/e2e-pdf.js` (+5 checagens).

**Verificação:** E2E completo verde — Bárbaro nv5 real no navegador: fora de Fúria o machado é `1d12+4` sem selo; em Fúria vira `1d12+6` com 🔥+2 e o arco fica de fora; cabeçalho avisa · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-20-barbaro-furia/`, ou `git revert`.

---

## 2026-07-20 — Combate C4 (parte): 🗡️ Ataque Furtivo do Ladino jogável

**Backup antes da alteração:** `versoes/2026-07-20-ladino-furtivo/` (`jogo.js`, `style.css`).

**Resumo:** primeira fatia do item C4 do roadmap (o Ataque Furtivo era só uma dica de texto — estava na lista de lacunas do F2).
- **Bloco "🗡️ Ataque Furtivo"** no Modo de Jogo para o Ladino: mostra os dados certos por nível (**⌈nível/2⌉d6** — 1d6 no nv1, 3d6 no nv5, 5d6 no nv9…), botão que **rola e registra no Histórico** ("3d6 = 10 [3,1,6]"), e um lembrete da condição (arma ágil/à distância + vantagem OU aliado adjacente ao alvo) que fica **verde** quando o estado tático da ficha já satisfaz. Não gasta recurso, como manda a regra.

**Ficheiros:** `static/js/jogo.js`, `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (C4 Ladino ✅), `tests/e2e-pdf.js` (+4 checagens).

**Verificação:** E2E completo verde — Ladino nv5 real no navegador: bloco presente com "3d6", condição verde com aliado adjacente, rola e registra; Ladino nv1 mostra "1d6" (escala por nível) · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-20-ladino-furtivo/`, ou `git revert`.

---

## 2026-07-19 — Combate C2+C3: itens repetidos com quantidade (×4) e armas de arremesso (lançar/recuperar)

**Backup antes da alteração:** `versoes/2026-07-19-c2c3-arremesso/` (`jogo.js`, `style.css`).

**Resumo:** itens C2 e C3 do roadmap `docs/ROADMAP-FICHAS-COMBATE.md` (dores: "azagaia se repete muito, coloque a quantidade" e "se recuperou a arma").
- **C2 — quantidade agregada:** os Ataques de Arma mostram "×4" numa linha só em vez de repetir a azagaia quatro vezes; os slots de equipar trazem "(×4)" no rótulo da opção. (A Bolsa já agrupava — agora os ataques e slots também.)
- **C3 — armas de arremesso:** toda arma com propriedade `arremesso` (Azagaia, Adaga, Lança, Machadinha, Martelo Leve, Tridente, Dardo…) ganha botão **"🎯 lançar"** que tira a unidade da mão e a coloca "no chão" — a linha vira "×4 (3 em mãos · 1 no chão)". Botão **"↩️ Recuperar armas arremessadas"** (aparece só quando há algo lançado) devolve tudo à mão. Sem unidades em mãos, os botões de atacar/lançar desabilitam com aviso "nenhuma em mãos". O descanso longo recolhe automaticamente. Estado novo `ficha.arremessadas` (nome→qtd no chão), inicializado e migrado com segurança.

**Ficheiros:** `static/js/jogo.js`, `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (C2 ✅, C3 ✅), `tests/e2e-pdf.js` (+7 checagens).

**Verificação:** E2E completo verde — Bárbaro com 4 azagaias real no navegador: linha "×4", lançar 1 mostra "3 em mãos · 1 no chão", recuperar zera, lançar as 4 desabilita atacar/lançar · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-19-c2c3-arremesso/`, ou `git revert`.

---

## 2026-07-19 — Ficha F1: 🛡️ Paladino claro do nível 1 ao 3 (Sentido Divino, Punição Divina com botão, Auras)

**Backup antes da alteração:** `versoes/2026-07-19-paladino-f1/` (`jogo.js`, `criador.js`, `style.css`).

**Resumo:** item F1 do roadmap `docs/ROADMAP-FICHAS-COMBATE.md` (dor da mesa: "o paladino não tinha nenhuma habilidade inicial a não ser cura, e estava confuso").
- **Sentido Divino rastreável** no Modo de Jogo (`recursosDeClasse`): 1 + mod CAR usos por descanso longo — agora aparece ao lado da Cura pelas Mãos, então não é mais "só cura".
- **Painel do Paladino no Criador reescrito:** card de Sentido Divino + seção "O que você faz já no nível 1" e um **aviso honesto no nível 1** — explica que magia, Estilo de Luta e a Punição Divina chegam no N2 e o Juramento no N3 (sugere começar no nível 2-3). Some a impressão de "ficha quebrada".
- **⚡ Punição Divina jogável (nv2+):** bloco com um botão por círculo disponível ("1º espaço → 2d8"), checkbox "alvo é morto-vivo/ínfero (+1d8)"; gasta o espaço de magia, **rola o dano radiante** (2d8 base, +1d8 por círculo acima, teto 5d8) e registra no Histórico. Botão apaga quando não há espaço; nota da Punição Aprimorada no N11.
- **🛡️ Auras (nv6+)** como bloco passivo sempre visível: Proteção (N6, soma o Carisma às salvas de aliados a 3m/9m) e Coragem (N10). Antes ficavam escondidas em dicas.

**Ficheiros:** `static/js/jogo.js`, `static/js/criador.js`, `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (F1 ✅), `tests/e2e-pdf.js` (+8 checagens).

**Verificação:** E2E completo verde — Paladino nv2 real no navegador: Sentido Divino presente, bloco de Punição com botão "1º espaço → 2d8", conjurar a Punição gasta 1 espaço do 1º e registra o dano radiante rolado no histórico; o Criador cita Sentido Divino e avisa que Punição/magia chegam no nível 2 · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-19-paladino-f1/`, ou `git revert`.

---

## 2026-07-19 — Combate C1: ✨ magias viram cartas de ação (CD/ataque, Conjurar com 1 clique, upcast e concentração)

**Backup antes da alteração:** `versoes/2026-07-19-magias-cards/` (`jogo.js`, `style.css`).

**Resumo:** primeiro item executado do roadmap `docs/ROADMAP-FICHAS-COMBATE.md` (dor da mesa de 18/07: "no combate não fica disponível as magias, só as armas").
- **Bloco "✨ Conjuração"** no Modo de Jogo, logo abaixo dos Ataques de Arma: cabeçalho com **CD de magia e ataque mágico** (por classe conjuradora, no caso de multiclasse) e um **card por truque/magia castável** — círculo, tempo com ícone (🎯 ação / ⚡ ação bônus / ↩️ reação), alcance, dano ou DT, e 🧠 quando exige concentração.
- **Botão "✨ Conjurar"** gasta o espaço do círculo certo com 1 clique: **upcast automático** quando o círculo base está esgotado (rótulo "(2º↑)"), **Magia de Pacto** do Bruxo suportada (gasta `pactoUsados`; em multiclasse o espaço normal exato tem prioridade e o pacto é o plano B), **concentração marcada sozinha** e registro no Histórico. Truques têm "✨ Usar" (não gastam nada) e o **dano escala pelos níveis 5/11/17** direto no card ("2× 1d10").
- **"Castável agora":** card sem espaço fica apagado com o botão desabilitado; truques ficam sempre acesos. O bloco de gerenciamento (🧠 Preparadas/Grimório) continua onde estava — o novo bloco é a visão de COMBATE.
- Helpers novos: `conjuracaoDaMagia`, `espacoParaMagia`, `conjurarMagia`, `escalaTruque` (jogo.js).

**Ficheiros:** `static/js/jogo.js`, `static/css/style.css`, `docs/ROADMAP-FICHAS-COMBATE.md` (C1 ✅), `tests/e2e-pdf.js` (+7 checagens).

**Verificação:** E2E completo verde — Clérigo nv1 real no navegador: bloco presente, cabeçalho "CD 13 · Atq. mágico +5", 5 cards, conjurar Bênção gasta 1 espaço do 1º e marca concentração, segundo gasto esgota e o card de Curar Ferimentos apaga com botão desabilitado, truques seguem acesos · 25/25 unit · 26/26 servidor · sintaxe OK.

**Como reverter:** restaurar `versoes/2026-07-19-magias-cards/`, ou `git revert`.

---

## 2026-07-19 — Druida: 🐺 Forma Selvagem completa por nível (catálogo de feras + transformar/reverter no Modo de Jogo)

**Backup antes da alteração:** `versoes/2026-07-19-forma-selvagem/` (`jogo.js`, `criador.js`, `mestre.html`, `jogador.html`).

**Resumo:** pedido do Ismaile — o Druida só tinha o contador de usos; agora tem as **transformações de verdade, bem feitas por nível**.
- **`formaselvagem.js` (novo):** catálogo de **26 feras jogáveis** (SRD, PT-BR) do ND 0 ao 6 — Gato, Corvo, Lobo, Pantera, Javali, Cobra Constritora, Urso Negro, Crocodilo, Urso-Pardo, Águia Gigante, Urso Polar, Anquilossauro, Elefante, Mamute… cada uma com CA, PV, deslocamento, FOR/DES/CON, ataques (bônus + dano) e traços (Tática de Matilha, Bote, Investida…). Regras da tabela do PHB: **nv2** ND ¼ sem voo/natação · **nv4** ND ½ + natação · **nv8** ND 1 + voo; **Círculo da Lua**: ND 1 já no nv2 e ⌊nível/3⌋ do nv6 em diante (travas de deslocamento continuam por nível).
- **Modo de Jogo:** painel **🐺 Forma Selvagem** para Druida nv2+ — select com as formas do nível (ND/CA/PV/deslocamento), **Transformar** gasta 1 dos 2 usos (Arquidruida nv20: ilimitado) e ativa o card da fera: **PV próprios da fera** com dano/cura, ataques e traços prontos, atributos físicos da fera (INT/SAB/CAR seguem do druida), aviso de "não conjura" (exceto nv18) e **Reverter** (ação bônus). **Fera a 0 PV reverte sozinha e o dano excedente passa para os PV do druida** (regra 5e). Descanso longo desfaz a forma; a forma ativa persiste na ficha (`formaAtiva`) e sobrevive a refresh.
- **Criador:** o painel do Druida agora lista as **formas concretas disponíveis no nível** (agrupadas por ND, com CA/PV), reagindo à subclasse (Círculo da Lua) e dizendo em que nível melhora.

**Ficheiros:** `static/js/formaselvagem.js` (novo), `static/js/jogo.js`, `static/js/criador.js`, `templates/mestre.html`, `templates/jogador.html`, `tests/unit-regras.js` (+4), `tests/e2e-pdf.js` (+7 checagens).

**Verificação:** **25/25** unit (catálogo íntegro; tabela do PHB nv2/4/8 e Lua nv2/9/20; filtros de voo/natação) · **26/26** servidor · **E2E completo verde** — o smoke transforma um Druida nv2 em Lobo no navegador, confere as 10 formas do select (sem Águia/Crocodilo no nv2), aplica 15 de dano na fera de 11 PV e confirma a reversão automática com 4 de dano passando ao druida (17→13).

**Como reverter:** restaurar `versoes/2026-07-19-forma-selvagem/`, ou `git revert`.

---

## 2026-07-19 — Bug do Clérigo: limite de magias não acompanhava o +1 racial em SAB ("avisa 4, só marca 3")

**Resumo:** relato do Ismaile — Clérigo nível 1 avisava "prepare 4 magias" mas os checkboxes travavam em 3. **Causa:** o handler do **+1 racial à escolha** (Humano Variante, Meio-Elfo…) só re-renderizava o preview; o painel de magias ficava com o limite congelado do atributo ANTIGO (SAB 15 → 3), enquanto a validação recalculava com o atributo final (SAB 16 → 4). **Correção:** a escolha racial agora dispara `renderAposAtributos()` (painel de classe, perícias, magias, peso e preview) — o aviso e os checkboxes acompanham o atributo final na hora. De quebra, corrigido um race no "piscar" da validação: o timer de remoção do destaque anterior apagava o destaque novo quando dois erros aconteciam em menos de 3s.

**Ficheiros:** `static/js/criador.js`, `tests/e2e-criador.js` (+2 casos de regressão: o aviso muda 3→4 ao pôr +1 em SAB e as 4 magias ficam marcáveis).

**Verificação:** E2E completo verde (incl. os 2 casos novos e os 3 do piscar) · sintaxe · 21/21 unit · 26/26 servidor.

---

## 2026-07-19 — MODO LIVRE (temporário): limitação de jogo e créditos DESLIGADOS até segunda ordem

**Backup antes da alteração:** `versoes/2026-07-19-modo-livre/` (`app.py`, `campanhas.html`).

**Resumo:** pedido do Ismaile — retirar temporariamente a limitação de jogo e a questão dos créditos, até ele mandar reativar. Implementado como uma **chave única e reversível** (`MODO_LIVRE`, ligada por padrão): nada do código de cobrança foi removido, só desviado.
- **Com a chave ligada:** campanhas nunca ficam inativas/só-leitura (mesmo com `pagaAte` vencido) e **não são apagadas pela retenção**; campanhas que estavam inativas **voltam a ativas** no próximo acesso; o **limite de 6 fichas** por campanha não se aplica; **criar e renovar campanha é grátis** (nenhum crédito debitado — os saldos dos usuários ficam intactos para quando a cobrança voltar); a página de campanhas mostra "🎉 Período livre" e esconde preços/saldo/botão de renovar.
- **Para REATIVAR a cobrança:** definir `MODO_LIVRE=0` no ambiente (Render) — ou trocar o padrão em `app.py` para `'0'` e fazer deploy. Bloqueio manual de conta pelo admin continua funcionando mesmo no modo livre.

**Ficheiros:** `app.py` (chave + 4 desvios: `campanha_paga_em_dia`, `campanha_cobravel`, criar, renovar), `templates/campanhas.html`, `tests/test-servidor.py` (+4 casos do modo livre).

**Verificação:** **26/26** testes de servidor (os 4 novos: chave ligada por padrão, campanha vencida não fica só-leitura, nada é "cobrável", ciclo não marca/apaga) · sintaxe · 21/21 unit · E2E completo verde.

**Como reverter:** `MODO_LIVRE=0` no env (reativa a cobrança sem deploy de código), ou restaurar `versoes/2026-07-19-modo-livre/`.

---

## 2026-07-18 — Fichas: PATCH em todos os fluxos de ficha única, PDF sem pop-up (iframe) e Esc nos modais

**Backup antes da alteração:** `versoes/2026-07-18-patch-geral-pdf-iframe/` (`app.js`, `jogador.js`, `jogo.js`, `criador.js`).

**Resumo:** continuação das melhorias — fecha as pontas soltas da rodada anterior.
- **Salvamento por ficha em TODOS os fluxos de ficha única:** além do Modo de Jogo, agora usam `PATCH /api/fichas/<id>` (com trava otimista): **editar no Criador** (mestre e jogador), o **toggle 🔓 Loja Especial** do card e a **sincronização de PV do combate** (as duas vias). Criação, exclusão e recompensas em grupo ("👥 todos") seguem no PUT em lista — o PATCH não cria fichas e recompensa múltipla é operação de lista mesmo.
- **PDF sem pop-up:** a exportação deixou de usar `window.open` (que dependia de permissão de pop-up e tinha o alert "Permita pop-ups") e passou a imprimir por um **iframe oculto** — funciona sempre, sem pedir nada ao navegador. O iframe se remove após a impressão (`afterprint` + limite de segurança).
- **A11y dos modais:** **Esc fecha** o Criador (o rascunho persistente B1 segura o progresso — nada se perde) e o Modo de Jogo (que já salva a cada ação); o foco entra no modal do Criador ao abrir (`tabindex=-1` + `focus()`), então teclado e leitores de tela não ficam presos na página de trás.

**Ficheiros:** `static/js/app.js`, `static/js/jogador.js`, `static/js/jogo.js`, `static/js/criador.js`, `tests/e2e-criador.js`, `tests/e2e-pdf.js`.

**Verificação:** sintaxe OK; **21/21** unit; **22/22** servidor; E2E completo verde — incluindo os casos novos: "Esc fecha o modal do Criador" e "iframe oculto do PDF foi criado com conteúdo (sem pop-up)"; o smoke do PATCH segue passando (dano gravado + carimbo sincronizado).

**Como reverter:** restaurar `versoes/2026-07-18-patch-geral-pdf-iframe/`, ou `git revert`.

---

## 2026-07-18 — Fichas: regras derivadas em módulo único, schema v2 no servidor e salvamento por ficha com trava otimista

**Backup antes da alteração:** `versoes/2026-07-18-regras-unicas-e-servidor/` (`criador.js`, `jogo.js`, `app.js`, `jogador.js`, `app.py`, `mestre.html`, `jogador.html`).

**Resumo:** a segunda leva das melhorias de engenharia — os três itens estruturais do plano.
- **`regras-ficha.js` (novo): fonte única dos derivados.** `calcularCA` (leve/média/pesada, escudo, estilo Defesa, defesa sem armadura de Bárbaro/Monge — inclusive multiclasse), `percepcaoPassiva`, `cdConjuracao` e `pvMaximoMonoclasse`. Antes, a CA era calculada em DUAS cópias independentes (criador.js e jogo.js) e a percepção/CD em três lugares — cópias que podiam divergir a qualquer edição. Agora Criador (preview/salvar), Modo de Jogo (recalcularCA ao equipar) e PDF chamam as MESMAS funções, testadas em unidade (5 casos novos).
- **Servidor: schema v2 + normalização leniente (`_normalizar_ficha`).** O `PUT /api/fichas` deixou de aceitar qualquer blob: campos conhecidos são coagidos a tipos/limites sãos (nível 1-20, atributos 1-30, textos com teto, listas só de strings) — sempre CONSERTANDO o campo, nunca rejeitando a ficha (fichas legadas passam). Todo save carimba `schemaVersion: 2` e `atualizadoEm` — que **só avança quando o conteúdo muda** (saves repetidos e o PUT em lista do Mestre passando por fichas intocadas preservam o carimbo).
- **`PATCH /api/fichas/<id>` (novo): salvamento por ficha com trava otimista.** Antes, todo save era PUT da lista COMPLETA: Mestre e jogador salvando quase juntos = o último sobrescrevia o outro em silêncio. O Modo de Jogo (que salva a cada clique de dano/magia/item) agora grava só a própria ficha via PATCH, enviando `baseAtualizadoEm`; se outra sessão salvou antes, o servidor devolve **409 + a versão atual** e o cliente recarrega e avisa — nunca atropela. Mesmas proteções por papel do PUT (posse, xp/ouro/morte só via Mestre, antecedente exclusivo); 404 para id inexistente; falhas de rede caem no fluxo antigo (PUT) sem perder o save.

**Ficheiros:** `static/js/regras-ficha.js` (novo), `static/js/criador.js`, `static/js/jogo.js`, `static/js/app.js`, `static/js/jogador.js`, `app.py`, `templates/mestre.html`, `templates/jogador.html`, `tests/test-servidor.py` (novo), `tests/unit-regras.js`, `tests/e2e-*.js`, `.github/workflows/ci.yml`, `package.json`.

**Verificação:** sintaxe OK em todos os JS; **21/21** unit (5 novos p/ regras-ficha); **22/22** testes de servidor novos (`python3 tests/test-servidor.py`: normalização, carimbo estável, 409/404/403, B2 preservado); **23/23** E2E Criador; **16/16** E2E PDF+PATCH (o smoke grava dano via PATCH no navegador e confere carimbo/schema no servidor). CI agora roda também os testes de servidor.

**Como reverter:** restaurar `versoes/2026-07-18-regras-unicas-e-servidor/`, ou `git revert`.

---

## 2026-07-18 — Criador: aba própria ⛩️ Divindade & Pacto, "rolar e piscar" na seção pendente, testes automatizados + CI

**Backup antes da alteração:** `versoes/2026-07-18-fe-aba-propria-e-testes/` (`_criador.html`, `criador.js`, `dados5e.js`, `jogo.js`, `style.css`).

**Resumo:** Dois pedidos do Ismaile ("não achei o local das divindades" e "a validação devia voltar pra aba que faltou e piscar") + a primeira leva das melhorias de engenharia (testes commitados, CI e deduplicação).
- **Aba própria para a fé:** o Criador agora tem **6 etapas** — a **4 · ⛩️ Divindade & Pacto** é dedicada (a seção saiu do meio da etapa de Identidade, onde ficava escondida). As validações acompanharam: fé valida na etapa 4, habilidades/magias na 5, itens na 6.
- **Validação que guia o olho:** todo erro de validação agora carrega um **alvo** (a seção pendente). Ao clicar Próximo/Salvar/chip com algo faltando, o Criador **volta à etapa pendente, rola até a seção exata e a faz PISCAR** (animação `piscar-pendente`, 4 pulsos âmbar). O aviso `#cValidacao` ganhou `role=alert`/`aria-live` (leitores de tela anunciam).
- **Testes commitados (`tests/`) + CI:** `unit-regras.js` (16 testes de consistência dos dados: 18 perícias, 12 classes, 32 divindades, patronos×subclasses de Bruxo 1:1, antecedentes completos, mod()/PB() na tabela 5e), `checar-sintaxe.js` (node --check em todos os JS), `e2e-criador.js` + `e2e-pdf.js` (Playwright no fluxo real) com `run-e2e.sh` que sobe o Flask com `DATA_DIR` descartável. `package.json` com scripts (`npm test`, `test:e2e`, `test:tudo`) e **GitHub Actions** (`.github/workflows/ci.yml`): sintaxe JS + unit + `py_compile` a cada push.
- **Deduplicação:** `patronoDados()` e `CLASSES_DEVOTAS` agora vivem em `dados5e.js` (fonte única — o lookup de patrono estava copiado em 4 lugares); o PDF passou a usar o `esc` do módulo (a cópia local não escapava aspas); `renderPasso5` renomeado p/ `renderPassoItens` (o número mentia após a renumeração).

**Ficheiros:** `templates/_criador.html`, `static/js/criador.js`, `static/js/dados5e.js`, `static/js/jogo.js`, `static/css/style.css`, `tests/*` (novos), `.github/workflows/ci.yml` (novo), `package.json` (novo, só p/ testes), `.gitignore`.

**Verificação:** sintaxe OK em todos os JS; **16/16** unit; **23/23** E2E Criador (6 etapas, Ateu desabilitado p/ Clérigo, piscar na seção pendente ao avançar E ao salvar, scroll a 0, painel explicativo, Bruxo trava sem patrono) e **12/12** E2E PDF.

**Como reverter:** restaurar `versoes/2026-07-18-fe-aba-propria-e-testes/`, ou `git revert`.

---

## 2026-07-18 — Fichas: ⛩️ Fé & Pacto (divindades + patronos de Bruxo), scroll das etapas e PDF completo

**Backup antes da alteração:** `versoes/2026-07-18-divindades-pactos/` (`dados5e.js`, `criador.js`, `jogo.js`, `_criador.html`).

**Resumo:** Pedido do Ismaile — toda ficha pode escolher a sua divindade (ou declarar-se ateia), Clérigos/Paladinos são devotos obrigatórios e Bruxos escolhem a ENTIDADE do pacto (o demônio/fada/horror por trás da subclasse). Cada escolha vem explicada (quem é o deus e para quê) na hora de escolher, no preview, no Modo de Jogo e no PDF. De quebra, dois incómodos antigos: a etapa nova do Criador abria no meio da rolagem, e o PDF exportado saía "simples".
- **Dados novos (`dados5e.js`):** `DIVINDADES` — 32 divindades de Faerûn em 6 grupos (Vida e Luz · Guerra e Proteção · Conhecimento e Magia · Natureza e Tempestades · Fortuna, Sombras e Morte · Panteões Ancestrais/raciais), cada uma com título, domínios, alinhamento, símbolo e resumo ("quem é e para quê"); `SEM_DIVINDADE` ('Ateu (sem divindade)'); `PATRONOS_PACTO` — 18 entidades de pacto agrupadas pelos 3 tipos de patrono do Bruxo (as chaves espelham `SUBCLASSES['Bruxo']`): Asmodeus, Orcus, Titânia, Tharizdun etc., com título e resumo; helpers `divindadeDados()` e `listaDivindades()`.
- **Criador (etapa 3 — Identidade):** nova seção **⛩️ Fé & Pacto**. Select de divindade agrupado por panteão + opção Ateu + "✍️ Outra (escrever à mão)" para homebrew; painel de info explica a escolha na hora. Para **Bruxo**, aparece também o **Patrono do Pacto** (agrupado por tipo, com o grupo da subclasse marcado "★ seu pacto", aviso se a entidade não bate com a subclasse, e campo manual p/ demônios da campanha). **Regras:** Clérigo/Paladino → divindade obrigatória (Ateu desabilitado no select + validação); Bruxo → patrono obrigatório; demais classes → escolher divindade OU ateísmo (fichas antigas em edição não travam). Gerador automático sorteia fé coerente (devotos nunca saem ateus; Bruxo ganha entidade do tipo do pacto) e a IA de história recebe a fé no contexto.
- **Ficha:** `divindade` e `patrono` entram no schema (o servidor grava a ficha inteira — sem mudança no backend). Preview do Criador, cabeçalho + bloco "Fé & Pacto" (com a explicação) no Modo de Jogo, e PDF.
- **Bug do scroll (`irPasso`):** ao trocar de etapa (Próximo/Voltar/chips), o `.modal-content` volta ao topo — antes a etapa nova abria no ponto de rolagem da anterior.
- **PDF completo (`exportarFichaPDF`):** agora sai com **as 18 perícias** (modificador + proficiência, em 2 colunas), **traços raciais**, **sentidos** (deslocamento/tamanho/visão no escuro/percepção passiva), **idiomas**, **características de classe ACUMULADAS até o nível** (antes só as do nível atual!), **estilo de combate com descrição**, **CD/ataque de conjuração**, **⛩️ Fé & Pacto explicado** e **anotações** — além de tudo que já tinha.

**Ficheiros:** `static/js/dados5e.js`, `static/js/criador.js`, `static/js/jogo.js`, `templates/_criador.html`, `CHANGELOG.md`.

**Verificação (Playwright + Node):** `node --check` OK nos 3 JS; harness de dados (32 divindades, chaves de `PATRONOS_PACTO` batem 1:1 com as subclasses de Bruxo, helpers devolvem null p/ ateu/desconhecida); **20/20 ✅** no fluxo real do Criador (login mestre → Clérigo: Ateu desabilitado, info "Senhor da Manhã" ao escolher Lathander, preview explicado; Bruxo: select de patrono com "★ seu pacto", info de Orcus, validação trava sem patrono; scroll volta a 0 ao trocar de etapa; auto-gerar escolhe divindade) e **18/18 ✅** no PDF exportado (Shar e Asmodeus explicados, 18 perícias, traços de Tiefling, percepção passiva, CD de magia, características nível 1-3, anotações).

**Como reverter:** restaurar os backups de `versoes/2026-07-18-divindades-pactos/`, ou `git revert`.

---

## 2026-07-15 — Ninho da Rainha Dragão: Eps 7 e 8 + CAMPANHA COMPLETA ✅ (os 8 episódios)

**Backups:** `versoes/2026-07-15-ninho-ep7-refugio/` · `versoes/2026-07-15-ninho-ep8-skyreach/`.

**Resumo:** Fecha a campanha **Ninho da Rainha Dragão** — os **8 episódios**, do ataque a Greenest ao castelo voador, e tudo emendado num único modelo importável (pedido do Ismaile). Escrita própria/condensada (repo público — nunca copia prosa do módulo).
- **Ep. 7 — O Refúgio de Caça** (`modelo_ninho_ep7_refugio`, 13 nós, nível 6-7, prefixo `e7_`): neve e troféus; hub com salão das arcas (subir NA carga), pátio das correntes (escalada 💀), quartos/Yarra (a fofoca da briga entre as duas) e o bosque gelado (disfarce). **Talis, a Branca** é o coração: DISSIDENTE preterida por Rezmir, negociável (Persuasão CD 13 com a fofoca, CD 16 sem) — abre a porta, dá a planta e avisa do dragão. Três finais de vitória (carga / correntes / acordo) + beco.
- **Ep. 8 — Castelo nas Nuvens** (`modelo_ninho_ep8_skyreach`, 13 nós, nível 7-8, prefixo `e8_`): o FINAL. Três forças em conflito — o culto, **Blagothkus** (gigante ressentido; Persuasão CD 15 → fecha os olhos, e pousa o castelo se Rezmir cair) e **Glazhael** acorrentado (uma CARTA: soltar = caos, não um aliado). Fundação, depósito (o tesouro é grande demais para carregar — a percepção que reenquadra o final), santuário das cinco cabeças (a pista do "Poço": era ritual, não roubo), torre (relógio). Clímax: **Rezmir** no terraço, sem círculo para fugir — Máscara Dracônica Negra + Hazirawn. Finais "a montanha que desceu" (plena) e "o que coube nas mãos" (parcial).
- **CAMPANHA COMPLETA** (`modelo_ninho_completa`): **"Ninho da Rainha Dragão — CAMPANHA COMPLETA (Ep. 1 ao 8)"**, **95 nós, nível 1-8**, um grafo só. **Derivada**, como no Phandelver: composta em tempo de carga pelos 6 modelos (`montarCampanhaCompleta`, o MESMO helper — reusado sem alteração), com **10 Finais de episódio** religados em passagens "▶ Continuar — Ep. X". Os episódios seguem sendo a fonte única da verdade. Becos/derrotas e os dois desfechos do Ep8 continuam Finais de verdade.

**Ficheiros:** `static/js/aventurasprontas.js` (+Ep7, +Ep8, `NINHO_EPISODIOS`, `NINHO_TRANSICOES`, push do modelo derivado), `docs/CAMPANHA-NINHO.md` (Ep7/Ep8 ✅ + guia de condução Opção A/B; corrigida a contagem dos Eps 1-3 para **29 nós** — a estimativa anterior de 36 estava errada).

**Verificação (harness Node) — 24/24 ✅ na completa:** Ep7 e Ep8 validam **0 erros / 0 avisos** cada, encontros exatos, ids `e7_`/`e8_` sem colisão global. A completa: **95 nós** (29+13+13+14+13+13), `noInicial` `n_chegada`, nível 1-8, **0/0**; as **10 passagens** apontam para o episódio certo; os 2 finais de campanha e os 6 becos preservados; **os episódios originais NÃO são mutados** pela composição; os **16 modelos** de `AVENTURAS_PRONTAS` validam 0/0; **99,2 KB** (limite 2 MB).

**Como reverter:** restaurar os backups de `versoes/2026-07-15-ninho-ep7-refugio/` ou `-ep8-skyreach/`, ou `git revert`.

**Campanha Ninho da Rainha Dragão: CONCLUÍDA.** Eps 1-3 (Greenest) · NR0 (bestiário) · Ep4 (Na Estrada) · Ep5 (Carnath) · Ep6 (Naerytar) · Ep7 (Refúgio) · Ep8 (Skyreach) · campanha completa derivada. As DUAS campanhas do toolkit (Phandelver e Ninho) estão inteiras e importáveis de ponta a ponta.

---

## 2026-07-15 — Ep4 (Campanha Ninho): Na Estrada (13 nós)

**Backup antes da alteração:** `versoes/2026-07-15-ninho-ep4-estrada/aventurasprontas.js`.

**Resumo:** Novo modelo importável **`modelo_ninho_ep4_estrada`** (Ep. 4, nível 4-5, **13 nós**) — a longa viagem pela Estrada do Comércio seguindo o tesouro de Greenest. Episódio de **intriga social**, não de combate: vence quem observa e chega a Naerytar sem queimar o disfarce. Escrita própria/condensada; ids com prefixo **`e4_`** (não colidem com os Eps 1-3, que usam `n_` — necessário para a campanha completa derivada mais à frente).
- **Setup:** entrar na caravana disfarçado (guardas/mercadores; Ackyn Selebon, o mestre da caravana neutro).
- **Hub da viagem:** quem é quem (identificar cultistas pela marca da escama; **Jamna Gleamsilver**, a gnoma investigadora que é aliada em potencial; **Bortand**, o carroceiro cultista) · vigília noturna (o sinal de vela, Dracônico sussurrado) · **bisbilhotar as lonas** 💀 (Furtividade CD 15 — confirma o tesouro e o destino) · encontro de estrada (tabela 1d6; os PJs lutam AO LADO dos cultistas e são observados) · caçadores de recompensa + **Azbara Jos** (o mago frio que testa em vez de atacar).
- **Ramo de desmascaramento:** disfarce queimado → célula do culto (Fanático + Cultistas + Garra do Dragão); objetivo é sumir, não vencer a caravana.
- **Fecho:** as carroças deixam a estrada rumo ao entreposto do rio; finais **"Hóspedes do inimigo"** (disfarce intacto) e **"Sem máscara, no encalço"** (ambos vitória — mudam o tom do Ep5) + beco "largar o rasto".

**Ficheiros:** `static/js/aventurasprontas.js` (+`modelo_ninho_ep4_estrada`), `docs/CAMPANHA-NINHO.md` (Ep4 ✅).

**Verificação (harness Node):** `node --check` OK; `validarAventura` → **0 erros / 0 avisos**; **13 nós**; encontros com nomes exatos (Bandido/Lobo/Bandido Capitão/Fanático do Culto/Cultista/Garra do Dragão); final de vitória alcançável; **ids `e4_*` sem colisão com os Eps 1-3**; os **11 modelos** validam 0/0.

**Como reverter:** restaurar `versoes/2026-07-15-ninho-ep4-estrada/aventurasprontas.js`, ou `git revert`.

**Próximo:** Ep5 (Carnath) → Ep6 (Naerytar) → Ep7 (Refúgio de Caça) → Ep8 (Skyreach) → "Ninho — CAMPANHA COMPLETA" derivada (mesmo `montarCampanhaCompleta` do Phandelver).

---

## 2026-07-15 — Phandelver: CAMPANHA COMPLETA num único modelo importável (derivado dos 6 capítulos)

**Backup antes da alteração:** `versoes/2026-07-15-phandelver-campanha-completa/aventurasprontas.js`.

**Contexto:** o Ismaile perguntou por que a Mina Perdida de Phandelver estava dividida em várias aventuras importáveis e se dava para juntar tudo numa só. Dava — e agora dá para escolher.
- **Por que estava dividida:** nível recomendado por capítulo (`limites`), o nó `final` encerra a condução, poder rodar um capítulo avulso (o Cap. 1 é um bom one-shot) e manter o canvas legível.
- **O que viabilizou juntar:** os 93 nós usam **prefixos distintos por capítulo** (`p_`/`ph2_`/`m_`/`t_`/`k_`/`w_`) → **zero colisão de id**; e a campanha inteira dá **106 KB**, folgado ante o limite de 2 MB (18.3) e o 1 MB do Firestore.

**Resumo:** Novo modelo **`modelo_phandelver_completa`** — "Mina Perdida de Phandelver — CAMPANHA COMPLETA (Cap. 1 ao 4)", **93 nós, nível 1-5**, um grafo só, do ataque na estrada ao confronto com o Aranha Negra. **Não duplica conteúdo:** é **composto em tempo de carga** a partir dos 6 capítulos (`montarCampanhaCompleta`), que seguem sendo a fonte única da verdade — corrigir um nó no capítulo corrige a campanha completa; as duas versões nunca divergem.
- **Única transformação:** os **7 Finais de "vitória de capítulo"** (`p_vitoria`, `ph2_final_pronto`, `m_final_lei`, `m_final_halia`, `t_rumo`, `k_final_mapa`, `k_final_memoria`) viram nós de **passagem** (tipo `narracao`, sem `resultado`, com uma saída "▶ Continuar — Cap. X" + nota ao Mestre de que não precisa importar nada).
- **Preservados como Finais de verdade:** os dois desfechos do Cap. 4 (`w_final_plena`/`w_final_amarga`) e todos os becos/derrotas (`p_phandalin_cedo`, `p_tpk`, `ph2_partir`, `m_alarme`, `t_partir`).
- **As duas opções convivem:** importar a campanha completa (jogar de ponta a ponta) OU um capítulo por vez (one-shot / canvas pequeno). Guia atualizado em `docs/CAMPANHA-PHANDELVER.md`.

**Ficheiros:** `static/js/aventurasprontas.js` (`PHANDELVER_CAPITULOS`, `PHANDELVER_TRANSICOES`, `montarCampanhaCompleta` + push do modelo derivado; export do helper), `docs/CAMPANHA-PHANDELVER.md` (Opção A/B no guia).

**Verificação (harness Node) — 24/24 ✅:** `node --check` OK; a completa tem **93 nós**, `noInicial` `p_estrada`, nível 1-5, **0 erros / 0 avisos**; as 7 passagens religadas para o capítulo certo; os 2 finais de campanha e os 5 becos preservados; **os capítulos originais NÃO foram mutados** pela composição (cópia profunda — `p_vitoria` e `k_final_mapa` seguem Finais nos capítulos); os **10 modelos** de `AVENTURAS_PRONTAS` validam **0/0**; encontros com nomes exatos do bestiário; **106 KB**.

**Como reverter:** restaurar `versoes/2026-07-15-phandelver-campanha-completa/aventurasprontas.js`, ou `git revert`.

**Próximo:** Ep4 do Ninho (`modelo_ninho_ep4_estrada`) → Ep5 → Ep6 → Ep7 → Ep8; no fim, o mesmo modelo "campanha completa" derivado para o Ninho (o helper `montarCampanhaCompleta` já é genérico).

---

## 2026-07-15 — NR0 (Campanha Ninho da Rainha Dragão): bestiário dos Episódios 4-8

**Backup antes da alteração:** `versoes/2026-07-15-nr0-bestiario-ninho/monstros.js`.

**Contexto:** o Ismaile pediu a campanha "Ninho da Rainha Dragão" completa, os 8 episódios fielmente. Os Eps 1-3 já existem (`modelo_ninho_rainha_dragao`, 36 nós). Antes de escrever os Eps 4-8, é preciso preparar o bestiário — vários inimigos-chave não existiam. Plano completo em `docs/CAMPANHA-NINHO.md`.

**Resumo:** **7 criaturas novas** em `monstros.js` (shape existente + `loot` próprio; descrições em palavras próprias, só fatos mecânicos padrão):
- **Fanático do Culto (Cult Fanatic)** — CR 2, conjurador (Comando/Infligir Ferimentos); onipresente nos Eps 4-8.
- **Homem-Lagarto (Lizardfolk)** — CR 1/2; pântano de Naerytar (Ep6).
- **Bullywug** — CR 1/4; anfíbio/salto/camuflagem; aliado instável em Naerytar (Ep6).
- **Rezmir (Meia-Dragã Negra)** — CR 6, chefe wyrmspeaker; sopro de ácido + espada Hazirawn; loot garantido **Máscara Dracônica Negra + Hazirawn** (Eps 6/8).
- **Talis, a Branca (Meia-Dragã)** — CR 4; sopro de frio; dissidente negociável (Ep7).
- **Gigante das Nuvens (Blagothkus)** — CR 9; magia inata; aliado potencial no castelo voador (Ep8).
- **Dragão Branco Jovem (Glazhael)** — CR 6; sopro de frio; o dragão acorrentado do Skyreach (Ep8).

Cada bloco traz um traço **CONDUÇÃO** com a intenção narrativa (quando negociar, quando é chefe, quando é aliado potencial) — o mesmo padrão dos monstros nomeados do Phandelver.

**Ficheiros:** `static/js/monstros.js` (+7 criaturas), **novo** `docs/CAMPANHA-NINHO.md` (plano dos 8 episódios + progresso).

**Verificação (harness Node/vm):** `node --check` OK; as 7 criaturas existem no `MONSTROS` com shape completo (loot/tipo/ca/hp/atributos/cr/pe/tracos/acoes); **75 monstros** no total; **sem nomes duplicados** (essencial: os encontros das aventuras casam por nome exato).

**Como reverter:** restaurar `versoes/2026-07-15-nr0-bestiario-ninho/monstros.js`, ou `git revert`.

**Próximo:** Ep4 — Na Estrada (`modelo_ninho_ep4_estrada`) → Ep5 Carnath → Ep6 Naerytar → Ep7 Refúgio de Caça → Ep8 Skyreach.

---

## 2026-07-15 — Antecedentes de campanha (Ninho da Rainha Dragão): mais opções + exclusividade por campanha

**Backup antes da alteração:** `versoes/2026-07-15-antecedentes-exclusivos/` (fontes.js, criador.js, app.js, app.py).

**Contexto:** pedido do Ismaile — a campanha pré-pronta "Ninho da Rainha Dragão" tem antecedentes próprios sugeridos; ele quer que apareçam na criação de ficha e que **cada um seja único na campanha** (se um PJ já usa, ninguém mais pode).
- **Conteúdo:** `FONTES_AVENTURA.ninho_rainha_dragao` passou de **1 para 5 antecedentes** (novos: Sobrevivente de Greenest, Desertor do Culto, Guarda de Caravana, Órfão das Cinzas), cada um com o shape completo (perícias/idiomas/ferramentas/equipamento/característica + tabelas de personalidade/ideais/vínculos/defeitos). Escrita própria, temática do culto dracônico. Já aparecem no `<select>` do Criador (agrupados por "Ninho da Rainha Dragão"), via a infra de fontes que já existia.
- **Exclusividade (cliente):** `fontes.js` ganhou `antecedenteExclusivo(nome)` (true para antecedentes de módulo, false para os do PHB) e o flag `exclusivo` em `antecedentesDisponiveis()`. No Criador (`criador.js`), ao abrir a ficha, `atualizarAntecedentesExclusivos()` **desabilita no select** os antecedentes de campanha já usados por OUTRAS fichas (rótulo "— em uso nesta campanha"); a própria ficha em edição continua liberada para o seu.
- **Exclusividade (servidor, trava real):** `PUT /api/fichas` rejeita com **403 `antecedente_em_uso`** se a submissão colocar o mesmo antecedente **exclusivo** em duas fichas da campanha. O servidor identifica "exclusivo" pelo sufixo `(Módulo)` no nome (regex `\(.+\)$` — nenhum antecedente do PHB tem parênteses), então não precisa conhecer o `fontes.js`. Só barra **novos** conflitos (não trava dados legados); antecedentes do PHB podem repetir à vontade. `salvarFichas` (`app.js`) reverte e avisa no 403.

**Ficheiros:** `static/js/fontes.js` (4 antecedentes + `antecedenteExclusivo` + flag + export Node), `static/js/criador.js` (`atualizarAntecedentesExclusivos` + chamada no `abrir`), `app.py` (`_ANTECEDENTE_EXCLUSIVO_RE` + `_antecedentes_exclusivos_dup` + trava no `api_put_fichas`), `static/js/app.js` (alerta do 403).

**Verificação:** `node --check` nos 3 JS + `ast.parse` no app.py. Harness cliente (fontes) **9/9** — PHB não-exclusivo, módulos exclusivos, Ninho com 5 antecedentes e shape completo. Harness servidor (Flask, DATA_DIR temporário) **10/10** — 2 PJs com o mesmo exclusivo → 403; 1 exclusivo + 1 PHB → 200; introduzir conflito → 403 e estado preservado; 2 PJs com antecedente do PHB → 200; editar a própria ficha mantendo seu exclusivo → 200. Dados reais intocados.

**Como reverter:** restaurar `versoes/2026-07-15-antecedentes-exclusivos/`, ou `git revert`.

**Próximo:** reproduzir a campanha "Ninho da Rainha Dragão" completa, capítulo a capítulo (mesmo tratamento do Phandelver), agora com os antecedentes exclusivos amarrados a ela.

---

## 2026-07-15 — PH6 (Campanha Phandelver): fecho e integração — CAMPANHA COMPLETA ✅

**Resumo:** Passe final de integração que fecha a **Mina Perdida de Phandelver completa** no toolkit. Não é um novo modelo — é a validação do arco inteiro e a documentação de condução.
- **Arco validado ponta a ponta:** os **6 capítulos** (`emboscada`, `phandalin`, `marcarrubra`, `teia`, `castelo`, `caverna`) somam **93 nós**, do nível 1 ao 5, todos com **0 erros / 0 avisos** no `validarAventura` e **encontros com nomes exatos do bestiário** (loot da Fase 13 automático).
- **Continuidade:** cada Final aponta o próximo `id` a importar; os fios (Gundren/mapa, Aranha Negra/Nezznar, o traidor doppelganger, missões da vila, família Dendrar) atravessam os capítulos e pagam no fim.
- **Integração conferida:** antecedente **"Herdeiro de Phandalin"** presente em `fontes.js`; NPCs com `notasPrivadas`; itens-marco (Talon, Anel de Proteção, Hew, Cajado da Defesa, Lightbringer, Dragonguard, Cajado da Aranha) distribuídos pelos capítulos.
- **Guia de condução** adicionado em `docs/CAMPANHA-PHANDELVER.md` (tabela de ordem/import/nível/nós + fios da trama + notas de integração).

**Contexto:** resolve o apontamento do Ismaile de que a campanha importável estava "pouco trabalhada, com poucos nós" — ela ia só até a porta do 1º calabouço (2 capítulos / 28 nós). Agora vai do ataque na estrada ao confronto final com o Aranha Negra: **6 capítulos, 93 nós**.

**Ficheiros:** `docs/CAMPANHA-PHANDELVER.md` (PH5/PH6 ✅ + guia de condução). Sem mudança de código (validação do que os PH2-PH5 entregaram).

**Verificação (harness Node):** os 6 modelos do arco validam juntos — 14+14+15+16+16+18 = **93 nós**, todos **0 erros / 0 avisos**, encontros exatos; níveis 1-2 → 2-3 → 2-3 → 3-4 → 3-4 → 4-5; antecedente "Herdeiro de Phandalin" confirmado em `fontes.js`.

**Fase 19 (Campanha Phandelver): CONCLUÍDA.** PH0 (bestiário/itens) · PH1 (Phandalin) · PH2 (Marcarrubra) · PH3 (Teia da Aranha) · PH4 (Castelo Dentefino) · PH5 (Caverna Onda Eco) · PH6 (finais/integração).

---

## 2026-07-15 — PH5 (Campanha Phandelver): Cap. 4 — Caverna do Eco das Ondas (18 nós, final)

**Backup antes da alteração:** `versoes/2026-07-15-ph5-caverna/aventurasprontas.js`.

**Resumo:** Novo modelo importável **`modelo_phandelver_caverna`** (Cap. 4, nível 4-5, **18 nós**) — a masmorra FINAL da campanha: a Mina Perdida, a Forja das Magias e o clímax contra Nezznar, o Aranha Negra. Escrita própria/condensada, mesmo padrão.
- **Abertura de peso:** o corpo de Tharden (irmão de Gundren) na entrada.
- **Percurso (sandbox convergente):** Gosma Ocre que persegue → poço de 10 Estirge → 9 Esqueleto (mineiros) → depósito seguro (descanso) → 3 + 7 Carniçal com câmara de esporos (armadilha Con CD 11) → lago (Varinha de Mísseis Mágicos) → barricada de 5 Bugbear → Caveira Flamejante + 8 Zumbi (revive sem água benta) → **Mormesk** (Aparição/Wraith — barganha social + mapa) → **Forja das Magias** com o **Espectador** (dispensar por Enganação CD 15 ou lutar; Lightbringer + Dragonguard; águas que sobem).
- **Clímax:** guarda de **Vhalak** (Doppelganger + 3 Bugbear) → templo de **Nezznar** (Mago Drow, chefe) invisível + 4 Aranha Gigante (teia + blefe do refém) → resgate de **Nundro** (último irmão).
- **Finais:** vitória plena (irmãos vivos, Mina retomada, 10% dos lucros vitalícios) e vitória amarga (perdas/fugas); ambos `vitoria`. Ganchos pós-campanha nos notasMestre (mansão como base, masmorra do mapa de Mormesk, Nezznar solto por Halia se entregue vivo).

**Ficheiros:** `static/js/aventurasprontas.js` (+`modelo_phandelver_caverna`), `docs/CAMPANHA-PHANDELVER.md` (PH5 ✅).

**Verificação (harness Node):** `node --check` OK; `validarAventura` → **0 erros / 0 avisos**; **18 nós**; os 12 tipos de encontro do final confirmados no bestiário (Gosma Ocre, Estirge, Esqueleto, Carniçal, Bugbear, Zumbi, Caveira Flamejante, Aparição, Espectador, Doppelganger, Mago Drow/Nezznar, Aranha Gigante); final de vitória alcançável; os **9 modelos** seguem sem erros.

**Como reverter:** restaurar `versoes/2026-07-15-ph5-caverna/aventurasprontas.js`, ou `git revert`.

**Próximo:** PH6 — passe final de integração e fecho da campanha completa.

---

## 2026-07-15 — PH4 (Campanha Phandelver): Cap. 3B — Castelo Dentefino (16 nós)

**Backup antes da alteração:** `versoes/2026-07-15-ph4-castelo/aventurasprontas.js`.

**Resumo:** Novo modelo importável **`modelo_phandelver_castelo`** (Cap. 3B, nível 3-4, **16 nós**) — a fortaleza goblin Cragmaw na Floresta Neverwinter, com o resgate de Gundren e do mapa da Mina. Escrita própria/condensada, mesmo padrão.
- **3 abordagens:** portão principal (arqueiros + alarme), porta lateral (Ladinagem CD 15, furtiva), torre em ruínas com lona falsa (escalada, sem alarme).
- **Corredores-hub** → guarda hobgoblin (á.6) → salão do **Yegg** (Goblin Mestre + 7 Goblin; moral quebra se o chefe cai) → **Grick** emboscando do teto (á.8) → capela do falso deus **Lhupo** (Goblin Mestre + emboscada) → antecâmara (2 Hobgoblin; um corre avisar Grol) → jaula do **Urso-Coruja** (acalmar com carne ou soltar contra os goblins).
- **Clímax (á.14):** **Rei Grol** (Bugbear chefe) usa Gundren como escudo vivo + 1 Lobo + **Vyerith** (Doppelganger disfarçado de mensageiro drow que TRAI o lado perdedor, tenta matar Gundren e fugir com o mapa).
- **Resgate + finais:** libertar Gundren e achar o mapa sob o colchão de Grol; dois finais de vitória — "com o mapa" e "de memória" (se Vyerith fugiu com ele, Gundren sabe o caminho — rede de segurança). Gundren revela que o Aranha Negra é o drow Nezznar.

**Ficheiros:** `static/js/aventurasprontas.js` (+`modelo_phandelver_castelo`), `docs/CAMPANHA-PHANDELVER.md` (PH4 ✅).

**Verificação (harness Node):** `node --check` OK; `validarAventura` → **0 erros / 0 avisos**; **16 nós**; encontros com nomes exatos (Goblin/Hobgoblin/Goblin Mestre/Grick/Urso-Coruja/Rei Grol/Lobo/Doppelganger); final de vitória alcançável; os **8 modelos** seguem sem erros.

**Como reverter:** restaurar `versoes/2026-07-15-ph4-castelo/aventurasprontas.js`, ou `git revert`.

**Próximo:** PH5 — Cap. 4: Caverna Onda Eco (masmorra final; Nezznar, o Aranha Negra) → PH6 (finais/integração).

---

## 2026-07-15 — PH3 (Campanha Phandelver): Cap. 3A — A Teia da Aranha (16 nós)

**Backup antes da alteração:** `versoes/2026-07-15-ph3-teia/aventurasprontas.js`.

**Resumo:** Novo modelo importável **`modelo_phandelver_teia`** (Cap. 3A, nível 3-4, **16 nós**) — o sandbox das estradas ao redor de Phandalin, resolvendo os ganchos plantados no Cap. 2A. Escrita própria/condensada (repo público), mesmo padrão dos capítulos anteriores.
- **Hub de viagem** com 4 destinos independentes + nó "Na Trilha Triboar" (encontro aleatório, tabela 1d8 nos notasMestre) e saída gated para o castelo.
- **Conyberry/Agatha** (social puro, sem combate — a banshee não está no bestiário de propósito): uma pergunta com o pente de prata (missão de Garaele) = pista do Castelo Cragmaw.
- **Poço da Velha Coruja:** Hamun Kost (Mago) — negociar paz OU enfrentar 12× Zumbi; loot Anel de Proteção; fecha o gancho de Daran.
- **Árvore Trovão** (~6 nós internos): Ramos Secos + Zumbis das Cinzas → **Reidoth** (2ª fonte da pista, rede de segurança) → 2× Aranha Gigante → 6× Cultista/Favric (traição) → **Venomfang** (Dragão Verde Jovem, encontro de AVISO 💀 — espantar/negociar, não matar; foge a ~50% PV) → saque (colar dos Dendrar 200 po + machado Hew).
- **Cume da Wyvern:** furtividade neutraliza a sentinela (surpresa) → 6× Orc + ogro Gog + chefe Brughor; missão de Harbin (100 po).
- **Fecho:** a pista do castelo (Agatha OU Reidoth OU goblins interrogados) consolida em "Rumo ao Castelo Cragmaw" → final de vitória (segue ao Cap. 3B) + beco neutro "deixar a região".

**Ficheiros:** `static/js/aventurasprontas.js` (+`modelo_phandelver_teia`), `docs/CAMPANHA-PHANDELVER.md` (PH3 ✅).

**Verificação (harness Node):** `node --check` OK; `validarAventura` → **0 erros / 0 avisos**; **16 nós**; encontros com nomes exatos do bestiário (Estirge/Zumbi/Mago/Ramo Seco/Zumbi das Cinzas/Aranha Gigante/Cultista/Venomfang/Orc/Ogro); final de vitória alcançável; os **7 modelos** de `AVENTURAS_PRONTAS` seguem sem erros.

**Como reverter:** restaurar `versoes/2026-07-15-ph3-teia/aventurasprontas.js`, ou `git revert`.

**Próximo:** PH4 — Cap. 3B: Castelo Dentefino (fortaleza goblin; resgate de Gundren + o mapa) → PH5 (Caverna Onda Eco) → PH6 (finais/integração).

---

## 2026-07-15 — PH2 (Campanha Phandelver): Cap. 2B — Esconderijo Marcarrubra (15 nós)

**Backup antes da alteração:** `versoes/2026-07-15-ph2-marcarrubra/aventurasprontas.js`.

**Contexto:** o Ismaile apontou que a campanha importável de Phandelver "parece pouco trabalhada, tem poucos nós". O diagnóstico: ela **terminava na porta do primeiro calabouço** — o Cap. 2A (Phandalin) fechava com *"PRÓXIMO: importar Cap. 2B — Esconderijo Marcarrubra"*, mas esse capítulo **não existia**. Toda a metade de masmorra (PH2→PH6 do `docs/CAMPANHA-PHANDELVER.md`) estava por fazer. Esta entrega começa a completá-la, capítulo a capítulo.

**Resumo:** Novo modelo importável **`modelo_phandelver_marcarrubra`** (Cap. 2B, nível 2-3, **15 nós**) — a masmorra sob a Mansão Tresendar, com clímax no mago Iarno "Cajavidro" Albrek. Escrita própria e condensada (repo público — nunca copia prosa do módulo; só nomes/fatos mecânicos), no mesmo padrão do Cap. 1 e 2A (narração + notasMestre + NPCs com `notasPrivadas`).
- **Estrutura:** 2 entradas (porta do porão em sequência / túnel do Carp que pula pra fresta) → porão (2 Bandido, caixas do Leão Escudo) → alojamento (3 Bandido) → criptas (3 Esqueleto, senha "Illefarn" os deixa dormentes) → jaulas (2 Bandido; **resgate da família Dendrar**, Mirna dá o gancho do colar em Árvore Trovão/PH3) → fresta (**Nothic** como encontro social + espada mágica **Talon**) → quartel dos bugbears (3 Bugbear + goblin Droop; Enganação com manto disfarça) / antro dos bêbados (4 Bandido) → oficina (familiar avisa Iarno) → **Cajavidro** (Mago; rende-se ≤8 PV; Cajado da Defesa + cartas do Aranha Negra) com ramo de **fuga**.
- **Decisões:** capturar Iarno vivo vs. matar; entregar à **lei (Sildar)** vs. à **sombra (Halia/Zhentarim)** — dois finais de vitória com consequências distintas + beco mortal sinalizado ("o esconderijo desperta", com saída clemente: acordam presos nas jaulas).

**Ficheiros:** `static/js/aventurasprontas.js` (+`modelo_phandelver_marcarrubra`), `docs/CAMPANHA-PHANDELVER.md` (PH2 ✅).

**Verificação (harness Node):** `node --check` OK; `validarAventura` no novo modelo → **0 erros / 0 avisos**; **15 nós**; todos os encontros usam **nomes exatos do bestiário** (Bandido/Esqueleto/Nothic/Bugbear/Mago); final de vitória alcançável; e os **6 modelos** de `AVENTURAS_PRONTAS` seguem sem erros de grafo (não quebrou os existentes).

**Como reverter:** restaurar `versoes/2026-07-15-ph2-marcarrubra/aventurasprontas.js`, ou `git revert`.

**Próximo:** PH3 — Cap. 3A: A Teia da Aranha (sandbox das estradas: Agatha, Velha Coruja, Árvore Trovão/Venomfang, Cume da Wyvern) → depois PH4 (Castelo Dentefino) → PH5 (Caverna Onda Eco) → PH6 (finais/integração).

---

## 2026-07-15 — Fase 23.7 (migração): jogador grátis — assinatura plana desligada (cobrança 100% por créditos)

**Backup antes da alteração:** `versoes/2026-07-15-fase23-7b-migracao-jogador-gratis/` (app.py).

**Resumo:** Fecha a Fase 23. A assinatura plana de conta (Fase 10.9) trancava a app inteira após o trial de 3 dias — o que contradizia o modelo novo (**jogador é grátis; a cobrança é por campanha, em créditos** — 23.3). Esta migração **desliga o gate plana por padrão**, de forma **reversível** e **sem perder o bloqueio manual do admin**.
- **Gate reescrito** (`login_obrigatorio`): para contas registadas, o **bloqueio do admin** (`bloqueado`) trava **sempre** (HTML → tela de status; API → **403 `bloqueado`**). A checagem de **assinatura/trial** só roda se `EXIGIR_ASSINATURA_PLANA=1` (env, **padrão desligado** = migrado). Com o padrão, uma conta com trial expirado **acessa normalmente** — cria/joga; o que custa é criar/renovar campanha (débito de créditos, 23.3).
- **Rollback de emergência:** `EXIGIR_ASSINATURA_PLANA=1` restaura exatamente o comportamento antigo (trial/pagaAte trancam a app). As rotas de assinatura (`/assinatura`, admin) e os helpers `assinatura_valida`/`status_assinatura` seguem existindo (usados no admin e no rollback).

**Ficheiros:** `app.py` (const `EXIGIR_ASSINATURA_PLANA` + gate de `login_obrigatorio` reescrito: bloqueio sempre, plana opcional).

**Verificação (harness Flask com `DATA_DIR` temporário, os dois modos — dados reais intocados):** **plana OFF (padrão)** → trial expirado **acessa** `/campanhas` (200) e `/api/creditos` (200); conta **bloqueada** → 302 no HTML e **403 `bloqueado`** na API. **plana ON (rollback)** → trial expirado **redireciona** para assinatura; trial em dia **acessa**. **6/6 ✅.**

**Como reverter:** definir `EXIGIR_ASSINATURA_PLANA=1` (volta o gate antigo, sem redeploy de código) ou restaurar `versoes/2026-07-15-fase23-7b-migracao-jogador-gratis/app.py`.

**Fase 23 — MONETIZAÇÃO: concluída.** 23.1 carteira · 23.2/23.8 comprar créditos (Pix AbacatePay) · 23.3 campanha=produto · 23.4 limite 6 fichas · 23.5 jobs/retenção · 23.6 admin · 23.9 dashboard · 23.7 bônus de boas-vindas + migração jogador-grátis.

---

## 2026-07-15 — Fase 23.7: bônus de boas-vindas (conta nova nasce com crédito para 1 aventura + 6 fichas)

**Backup antes da alteração:** `versoes/2026-07-15-fase23-7-bonus-boasvindas/` (app.py).

**Resumo:** Decisão do Ismaile (15/07): **toda conta nova nasce com crédito suficiente para 1 aventura + 6 fichas** — que no modelo atual é exatamente **1 campanha completa = 20 créditos**. Então o registo passa a dar um **bônus de boas-vindas** de `CREDITO_INICIAL` créditos (env, padrão **20**). (Isto substitui a ideia anterior de "15 fichas + 1 aventura por 15 dias" — o Ismaile simplificou para "o trial deixa a conta com o suficiente para 1 aventura e 6 fichas".)
- **Registo** (`/registro`): a conta é criada já com `creditos = CREDITO_INICIAL` e um lançamento no `creditos_log` ("bonus de boas-vindas (1 aventura + 6 fichas)"), num único write. Com isso a conta consegue **criar 1 campanha na hora** (a criação debita 20 — Fase 23.3), sem pagar nada.
- **UI** (`registro.html`): a copy vende o bônus — "ganhe 20 créditos grátis — dá para montar 1 aventura completa + 6 fichas"; botão "Criar conta (+20 créditos grátis)".

**Ficheiros:** `app.py` (const `CREDITO_INICIAL` + bônus no dict do registo + passa ao template), `templates/registro.html` (copy + botão).

**Verificação (harness Flask com `DATA_DIR` temporário — dados reais intocados):** conta nova nasce com **20 créditos** e ledger correto (delta 20/saldo 20, motivo "boas-vindas"); consegue **criar 1 campanha** com o bônus (saldo 20→0); `GET /api/creditos` mostra saldo 0 e o bônus no histórico. **7/7 ✅.**

**Como reverter:** restaurar `versoes/2026-07-15-fase23-7-bonus-boasvindas/app.py` e a copy de `registro.html`, ou `git revert`.

**Nota:** o gate de assinatura plana da Fase 10.9 (`exigir_assinatura=True`, trial de 3 dias) ainda coexiste; a aposentadoria dele fica para quando o Ismaile decidir migrar 100% para créditos.

---

## 2026-07-15 — Fase 23.9: dashboard de admin (gráficos de vendas + produtos + usuários, só o Ismaile)

**Backup antes da alteração:** `versoes/2026-07-15-fase23-9-dashboard/` (app.py, admin_assinaturas.html, campanhas.html).

**Resumo:** Nova tela **`/admin/dashboard`** (também em `/admin`), **exclusiva do mestre legado** (a conta `MESTRE_USER`/Ismaile — `eh_legado_mestre`; jogadores e contas registadas nunca entram, redireciona). Visão de negócio com gráficos, sem biblioteca externa (barras em CSS/HTML — offline-safe, no estilo do app). Tudo vem dos dados que já existem (compras Pix creditadas, campanhas, ledgers de crédito) — nada inventado.
- **KPIs:** faturamento (gateway), nº de vendas, **ticket médio**, créditos vendidos, utilizadores, créditos em circulação; e campanhas total/ativas/inativas.
- **📈 Vendas — últimos 30 dias:** barra por dia (R$), escala automática pelo pico, rótulos a cada 3 dias, container com scroll horizontal no mobile.
- **🏆 Pacotes de crédito mais vendidos:** ranking por faturamento (8/20/40/110/livre), com qtd + R$ + barra proporcional.
- **🎲 Uso de créditos:** quanto foi gasto em **criar** vs **renovar** campanha (dos ledgers), + comprados/creditados-admin.
- **👥 Utilizadores por status** (ativa/teste/aguardando/bloqueada/expirada).
- **Navegação:** o link do mestre legado em "Minhas Campanhas" agora é **📊 Admin** → dashboard; dashboard ↔ **🗂️ Gestão** (`/admin/assinaturas`, as tabelas acionáveis da 23.6) cruzados no topo.
- **Helper** `_dashboard_dados(dias=30)` (agregação) — reusável/testável isolado.

**Ficheiros:** `app.py` (`_dashboard_dados` + rota `admin_dashboard` em `/admin` e `/admin/dashboard`), **novo** `templates/admin_dashboard.html`, `templates/admin_assinaturas.html` (título "Gestão" + link Dashboard), `templates/campanhas.html` (link 📊 Admin), `static/css/style.css` (gráficos `.dash-*`).

**Verificação (harness Flask com `DATA_DIR` temporário — dados reais intocados):** agregação exata — faturamento R$ 12 (2 vendas, pendente não conta), 48 créditos vendidos, ticket R$ 6, circulação 18, campanhas 2/1a/1i (legada ignorada), série de 30 dias com hoje/ontem certos, pacote top = 40 créditos (100%), uso criar20/renovar20/comprados48, 1 em trial; GET dashboard renderiza as seções; **não-admin → 302**. **21/21 ✅.** Além disso, boot real com dados de demo semeados (5 compras, 3 utilizadores, 3 campanhas): o servidor serviu o dashboard com **faturamento R$ 49,50**, 30 barras (5 com venda, alturas 100/36/18/7%) e todos os blocos — confirmado por `curl` (o painel visual do browser não renderiza neste ambiente).

**Como reverter:** restaurar `versoes/2026-07-15-fase23-9-dashboard/`, apagar `templates/admin_dashboard.html`, ou `git revert`.

**Nota de segurança:** o dashboard é gated pelo mesmo `eh_legado_mestre` do resto do admin — só a conta `MESTRE_USER`/`MESTRE_SENHA`. Para ser realmente exclusivo em produção, o Ismaile precisa ter definido `MESTRE_SENHA` (secreta) no Render — o padrão do repositório é público.

---

## 2026-07-15 — Fase 23.6: painel de admin completo (campanhas + compras Pix + receita)

**Backup antes da alteração:** `versoes/2026-07-15-fase23-6-admin/` (app.py, admin_assinaturas.html).

**Resumo:** O `/admin/assinaturas` (só mestre legado) ganha tudo o que o Ismaile precisa controlar num lugar só (modelo em `docs/MONETIZACAO.md`), aditivo às ações de utilizador da Fase 10.9/23.1:
- **Receita** (4 cards): compras Pix creditadas (nº), créditos vendidos via gateway, **faturamento** estimado (R$), e **créditos em circulação** (soma dos saldos). Faturamento conta só o **gateway** (AbacatePay) — o Pix manual é creditado na coluna 💳 dos utilizadores.
- **Compras pendentes** (Pix não creditado, `compras/<pixId>` com `creditadoEm` nulo): **🔁 reconferir** (re-consulta a AbacatePay via `_confirmar_compra_se_paga`, idempotente) e **✅ creditar** (crédito forçado do admin quando o Pix foi conferido à mão → `lancar_creditos` + marca `creditadoEm`/`status=PAID_MANUAL`; nunca dobra).
- **Campanhas** (todas): dono, nº de membros, status (✅ ativa / ⚠️ inativa / 🔑 legada), `pagaAte`, retenção ("apaga em Nd"), com **🔄 +30d cortesia** (estende sem debitar créditos de ninguém) e **🗑️ apagar** (usa `deletar_campanha`, com confirmação; a `principal` é protegida).

**Ficheiros:** `app.py` (ações `camp_renovar`/`camp_apagar`/`compra_reconferir`/`compra_creditar` + dados de campanhas/compras/receita na rota `admin_assinaturas`), `templates/admin_assinaturas.html` (seções de receita, compras e campanhas), `static/css/style.css` (`.admin-receita`, `.receita-card`, `.admin-secao`, `.btn-perigo`).

**Verificação (harness Flask com `DATA_DIR` temporário — dados reais intocados):** GET admin renderiza as 3 seções (compras/campanhas/receita), receita correta (1 venda, 20 créditos, R$ 5,00, circulação 35); não-admin → 302; `camp_renovar` reativa **sem debitar**; `compra_creditar` credita +8 e marca (repetir **não dobra**); `camp_apagar` remove a campanha e a `principal` fica protegida. **18/18 ✅** + regressão das ações antigas (aprovar30/creditos/bloquear) **3/3 ✅**. Screenshot do painel renderizado no boot local.

**Como reverter:** restaurar `versoes/2026-07-15-fase23-6-admin/`, ou `git revert`.

**Próximo:** 23.7 — migração jogador-grátis (aposentar `login_obrigatorio(exigir_assinatura=True)` da assinatura plana da Fase 10.9). **Precisa de cuidado** — muda quem paga.

---

## 2026-07-15 — Fase 23.5: ciclo de vida da campanha (só-expirar + retenção de 6 meses, lazy)

**Backup antes da alteração:** `versoes/2026-07-15-fase23-5-jobs-retencao/` (app.py, campanhas.html).

**Resumo:** Fecha o ciclo de vida do produto (modelo em `docs/MONETIZACAO.md`). **Decisões do Ismaile:** renovação é **só-expirar** (o Claude **nunca** debita créditos sozinho — o dono renova à mão pela 23.3); a exclusão aos **6 meses** é **automática**; o disparo é **verificação lazy** (sem cron — o plano free do Render hiberna).
- **Ciclo** (`ciclo_campanha(cid, meta)`): campanha paga que **venceu** ganha `inativaDesde` (contado a partir do `pagaAte`) no 1º acesso; inativa há **≥ RETENCAO_DIAS** (env, padrão **180**) é **apagada** com todo o estado; se voltou a ficar em dia (renovada), `inativaDesde` é limpo. Campanhas legadas/`principal` passam intactas.
- **Deleção** (`deletar_campanha(cid)`): remove `campanhas_meta/<cid>` + `campanha/<cid>` + `campanha_publica/<cid>` (Firestore) ou o `estado_<cid>.json` (local). **Nunca** apaga a `principal`. Loga a exclusão.
- **Lazy sweep** (`varrer_ciclo_campanhas`): roda no `pagina_campanhas` (qualquer acesso à lista limpa as vencidas de todos) e ao **entrar** numa campanha (`campanha_ativa` — se a retenção esgotou, avisa em vez de entrar).
- **UI** (`campanhas.html`): card inativo mostra a contagem regressiva "**será apagada em N dias**" (`dias_ate_apagar`).
- **Infra:** `timedelta` promovido ao import do topo. Consts `RETENCAO_DIAS`; helpers `_deletar_doc`, `deletar_campanha`, `dias_ate_apagar`, `ciclo_campanha`, `varrer_ciclo_campanhas`.

**Ficheiros:** `app.py` (ciclo/retenção/deleção + sweep em `pagina_campanhas`/`campanha_ativa` + `apagaEm` no card), `templates/campanhas.html` (contagem regressiva), `docs/MONETIZACAO.md` (progresso + decisões).

**Verificação (harness Flask com `DATA_DIR` temporário — só campanhas fictícias no temp, dados reais intocados):** vencida sem `inativaDesde` → marca (persistido); inativa há 100 dias → mantida, `dias_ate_apagar≈80`; inativa há 181 dias → **apagada** (meta + `estado_*.json`), `ciclo` devolve None; renovada com `inativaDesde` antigo → limpo; dono legado → intacta; `principal` **não** apagável; `varrer_ciclo_campanhas` apaga a expirada e mantém a recente. **12/12 ✅.**

**Como reverter:** restaurar `versoes/2026-07-15-fase23-5-jobs-retencao/`, ou `git revert`. (Campanhas já apagadas por retenção **não** voltam — a deleção é destrutiva por design.)

**Próximo:** 23.6 — painel de admin completo (utilizadores + campanhas + compras + receita).

---

## 2026-07-15 — Fase 23.4: limite de 6 fichas de PJ por campanha paga

**Backup antes da alteração:** `versoes/2026-07-15-fase23-4-limite-fichas/` (app.py).

**Resumo:** Cada campanha paga aceita no máximo **6 fichas de personagem (PJ)** (modelo em `docs/MONETIZACAO.md`). O servidor rejeita a criação da **7ª** — a trava é do servidor, não só do cliente. As campanhas **legadas/'principal'** (mestre legado/admin) ficam **fora** do limite (podem ter dados de teste com muitas fichas).
- **Servidor** (`PUT /api/fichas`): calcula a lista candidata (caminho do Mestre ou o `_sanitizar_fichas_jogador` do jogador) e, se a campanha é **cobrável** (`campanha_cobravel`) e o total **aumenta** acima de `MAX_FICHAS_PJ` (6), devolve **403 `limite_fichas`** sem gravar. Só barra quando o total **cresce** — editar as 6 ou remover fichas segue livre, mesmo em dados legados que já passassem do teto.
- **Cliente** (`app.js` `salvarFichas`): passa a ler a resposta; num **403** reverte o estado local (recarrega do servidor) e mostra `alert` — "limite de fichas" ou "campanha inativa" (reaproveita a trava da 23.3). Antes o `PUT` era fire-and-forget e a 7ª sumiria em silêncio no próximo sync.
- **Helper/const** (`app.py`): `MAX_FICHAS_PJ` (env, padrão 6) e `campanha_cobravel(cid)`.

**Ficheiros:** `app.py` (`MAX_FICHAS_PJ`, `campanha_cobravel`, trava em `api_put_fichas`), `static/js/app.js` (`salvarFichas` trata 403).

**Verificação (harness Flask com `DATA_DIR` temporário — dados reais intocados):** 6 fichas → 200; **7ª → 403 `limite_fichas`** e o estado mantém 6; editar as 6 (mesmo total) → 200; remover para 5 → 200; voltar a 6 → 200; **campanha legada 'principal' sem limite** (20 fichas → 200). **8/8 ✅.** `node --check app.js` + `ast.parse app.py` OK.

**Como reverter:** restaurar `versoes/2026-07-15-fase23-4-limite-fichas/app.py` e reverter o `salvarFichas` de `static/js/app.js`, ou `git revert`.

**Próximo:** 23.5 — jobs mensais (renovação automática + `inativaDesde` + retenção/exclusão aos 6 meses).

---

## 2026-07-15 — Fase 23.3: a campanha é o produto (criar/renovar debita créditos + trava só-leitura)

**Backup antes da alteração:** `versoes/2026-07-15-fase23-3-campanha-produto/` (app.py, campanhas.html).

**Resumo:** A **campanha** passa a ser a unidade paga (modelo em `docs/MONETIZACAO.md`): **criar** ou **renovar** uma campanha debita **20 créditos** (R$ 5,00) do dono e estende `pagaAte` por **30 dias**. Campanha **sem pagamento em dia** fica **só-leitura** (inativa) para todos até renovar. O **mestre legado (admin/Ismaile) é isento** — as campanhas dele nunca são cobradas nem travadas. **Jogador não paga nada** (entra por convite).
- **Criar** (`/campanha/nova`): valida saldo ≥ 20 antes; debita via `lancar_creditos` (ledger); grava `pagaAte = +30 dias`. Sem saldo → volta para "Minhas Campanhas" com CTA de comprar créditos.
- **Renovar** (`/campanha/renovar`, novo): só o Mestre da campanha; debita 20 e **empilha** +30 sobre o vencimento futuro (usa `_mais_dias`); limpa `inativaDesde` (reativa).
- **Trava de escrita**: no `login_obrigatorio`, qualquer mutação (`POST/PUT/PATCH/DELETE`) em `/api/*` numa campanha inativa devolve **403 `campanha_inativa`** — **exceto** `/api/creditos*` (o dono precisa comprar créditos para renovar). Leitura (`GET`) e o tempo real seguem livres → mesa vira só-leitura, não some.
- **Helpers** (`app.py`): `campanha_paga_em_dia(meta)` (legada sem meta / dono legado / `pagaAte` futuro = ativa) e `campanha_ativa_para_escrita(cid)`.
- **UI** (`campanhas.html`): cada card mostra **✅ Ativa até AAAA-MM-DD** ou **⚠️ Inativa (só-leitura)**; o Mestre ganha **🔄 Renovar (20)** com confirmação; o criar mostra o custo ("Criar campanha (20 créditos)"). Card inativo com borda âmbar.

**Ficheiros:** `app.py` (constantes `CAMPANHA_CREDITOS`/`CAMPANHA_DIAS`; `campanha_paga_em_dia`/`campanha_ativa_para_escrita`; débito em `campanha_nova`; rota `campanha_renovar`; trava no `login_obrigatorio`; status na `pagina_campanhas`), `templates/campanhas.html` (status/renovar/custo), `static/css/style.css` (`.campanha-card.inativa`, `.campanha-card-acoes`, `.camp-status`), `docs/MONETIZACAO.md` (progresso).

**Verificação (harness Flask com `DATA_DIR` temporário — sem tocar dados reais):** `campanha_paga_em_dia` (legada/legado/futuro/passado/sem-pagaAte); criar sem 20 créditos **não cria** e saldo intacto; criar com saldo **debita 20** e nasce ativa; `PUT /api/notas` **200** em campanha ativa; forçando `pagaAte` no passado → **403 campanha_inativa**, `GET` segue **200**, `/api/creditos/comprar` **não** bloqueado; renovar **debita 20** e reativa (escrita volta a 200); jogador **não** renova campanha alheia (saldo intacto). **17/17 ✅.** Template renderizado via test-client (status, 🔄 Renovar, "Inativa (só-leitura)", "Criar campanha (20 créditos)") e servido no boot local. Dados reais intocados.

**Como reverter:** restaurar `versoes/2026-07-15-fase23-3-campanha-produto/`, ou `git revert`.

**Próximo:** 23.4 — limite de 6 fichas de PJ por campanha (servidor rejeita a 7ª).

---

## 2026-07-14 — Fase 23.2: comprar créditos com Pix (AbacatePay) + fallback manual

**Backup antes da alteração:** `versoes/2026-07-14-fase23-2-abacatepay/` (app.py, requirements.txt, .gitignore, campanhas.html).

**Resumo:** Tela de **comprar créditos** com Pix automático via **AbacatePay** (SDK oficial `abacatepay`), e degradação suave para **Pix manual** quando não há chave configurada. Modelo verificado na doc do SDK (não chutado): `POST /pixQrCode/create` (valor em **centavos**) → `{id, brcode, brcode_base64, status, dev_mode, expires_at}`; `check(id)` e `simulate(id)` (modo teste).
- **Fluxo:** `/creditos` (pacotes 8/20/40/110 + valor livre, mín. 8) → `POST /api/creditos/comprar` cria a cobrança Pix e regista a compra (coleção `compras/<pixId>`) → a tela mostra **QR + copia-e-cola** e faz **polling** de `GET /api/creditos/status?id=` → ao pagar, credita a carteira (`lancar_creditos`). Chave de **dev** mostra o botão "🧪 Simular pagamento".
- **Webhook** `POST /api/pagamento/abacatepay/webhook?webhookSecret=…`: valida o segredo do query string; extrai o id; **re-confirma com `check()`** antes de creditar. **Nunca confia só no corpo do webhook.**
- **Segurança/idempotência:** crédito só se `check()==PAID` e se ainda não creditado (`creditadoEm`), então webhook + polling repetidos **não dobram** o saldo. Conta legada não compra.
- **Sem chave** (`ABACATEPAY_API_KEY` vazio): a compra devolve instruções de **Pix manual** (chave + valor) e o admin credita no `/admin/assinaturas` (23.1).

**Ficheiros:** `app.py` (config AbacatePay + `_abacate_client` + coleção `compras` + `_confirmar_compra_se_paga` idempotente + rotas `/creditos`, `/api/creditos/comprar|status|simular`, webhook), **novo** `templates/creditos.html`, `templates/campanhas.html` (link "+ Comprar créditos"), `requirements.txt` (`abacatepay>=1.0.9`), `.gitignore` (`data/compras.json`), `.env.example` (envs novas), `static/css/style.css` (estilos de créditos).

**Verificação (harness Flask com `DATA_DIR` temporário, cliente AbacatePay mockado — sem tocar dados reais):** mínimo (<8 → 400); **sem gateway → Pix manual** (R$2); comprar auto → `pix_1` + brcode, saldo 0; status PENDING antes de pagar; **simular → PAID, saldo 20**; status de novo → **idempotente (segue 20)**; **webhook sem/segredo errado → 401**; webhook credita nova compra (saldo 28) e **repetido não dobra**; conta legada barrada. Template `creditos.html` renderiza com os pacotes e o aviso manual. 11 checagens ✅.

**Como o Ismaile ativa** (em `docs/MONETIZACAO.md`): criar conta AbacatePay → pôr `ABACATEPAY_API_KEY` (dev `abc_dev_...` para testar com "Simular") e `ABACATEPAY_WEBHOOK_SECRET` no Render → cadastrar o webhook. Sem isso, o Pix manual já vende.

**Como reverter:** restaurar `versoes/2026-07-14-fase23-2-abacatepay/`, remover `templates/creditos.html` e a linha do `requirements.txt`, ou `git revert`.

**Próximo:** 23.3 — campanha como produto (criar/renovar debita 20 créditos + trava de campanha inativa).

---

## 2026-07-14 — Fase 23.1: carteira de créditos (fundação da monetização)

**Backup antes da alteração:** `versoes/2026-07-14-fase23-1-carteira/` (app.py, admin_assinaturas.html, campanhas.html).

**Resumo:** Primeira sub-fase da **Fase 23 — Monetização por créditos** (modelo completo em `docs/MONETIZACAO.md`: a campanha é o produto — R$5/mês = 20 créditos, inclui 6 fichas de PJ + controle total de Mestre; jogador grátis; crédito = R$0,25, mínimo R$2). Esta entrega é a **carteira**, puramente aditiva (convive com a assinatura atual da Fase 10.9):
- **Modelo:** `usuarios/<uid>.creditos` (saldo inteiro) + `creditos_log[]` (ledger dos 200 lançamentos mais recentes: `{delta, motivo, por, em, saldo}`). Contas sem o campo têm saldo 0 (retrocompatível).
- **Helpers** (`app.py`): `saldo_creditos(u)` e `lancar_creditos(uid, delta, motivo, por)` — credita/debita, **nunca deixa negativo**, regista no ledger; reusável pela compra (23.2) e pelo débito de campanha (23.3).
- **Endpoint** `GET /api/creditos` — saldo + histórico do próprio utilizador (contas legadas devolvem `saldo: null`).
- **Admin** (`/admin/assinaturas`, só mestre legado): coluna **💳 Créditos** com o saldo + mini-formulário de ajuste (±créditos com motivo, ação `creditos` → `lancar_creditos`).
- **UI do utilizador:** a tela "Minhas Campanhas" mostra "💳 Seus créditos: N".

**Ficheiros:** `app.py` (helpers + `/api/creditos` + ação `creditos` no admin + saldo em `pagina_campanhas`), `templates/admin_assinaturas.html` (coluna + form), `templates/campanhas.html` (linha do saldo).

**Verificação (boot local, curl):** registar conta → saldo 0; admin **+8** → saldo 8 (com lançamento no ledger); **−20** (insuficiente) → **rejeitado, saldo fica 8**; **−3** → saldo 5 com histórico newest-first; **jogador comum no POST do admin → 302** (barrado, saldo intacto). Templates: coluna 💳 Créditos + form no admin, "Seus créditos: 5" na tela do utilizador, nada para o mestre legado (não tem carteira). Dados locais de teste restaurados ao fim.

**Como reverter:** restaurar `versoes/2026-07-14-fase23-1-carteira/` ou `git revert`.

**Próximo:** 23.2 — Comprar créditos (tela de compra, cobrança Pix pendente, confirmação do admin credita).

---

## 2026-07-14 — Cache-busting dos estáticos (fim do "sumiu depois do deploy")

**Backup antes da alteração:** `versoes/2026-07-14-cache-busting/` (app.py).

**Resumo:** Os `<script>`/`<link>` referenciavam os estáticos sem versão, então o browser servia CSS/JS **cacheados** após um deploy — foi por isso que a aventura nova (PH1) "não apareceu" para quem tinha o `aventurasprontas.js` velho em cache. Agora **`@app.url_defaults`** acrescenta `?v=<mtime>` a TODO `url_for('static', …)` automaticamente — sem tocar em nenhum template. Cada ficheiro é versionado pela própria data de modificação, então só o que muda é rebaixado; em produção o valor é cacheado em memória (não toca o disco por request), em modo debug recalcula.

**Ficheiros:** `app.py` (função `_versionar_estaticos` + cache `_STATIC_V_CACHE`).

**Verificação:** boot local; as tags saem versionadas (`style.css?v=1784043597`, `app.js?v=1783709791` — valores distintos por ficheiro) e a URL versionada serve **HTTP 200**. Interage bem com o Service Worker (network-first já busca a versão nova).

**Efeito colateral positivo:** o Service Worker (17.3) e o cache do browser deixam de servir código velho após qualquer deploy — não precisa mais de Ctrl+F5.

**Como reverter:** restaurar `versoes/2026-07-14-cache-busting/` ou `git revert`.

---

## 2026-07-14 — PH1 (Campanha Phandelver): Cap. 2A — Phandalin (vila-hub)

**Backup antes da alteração:** `versoes/2026-07-14-ph1-phandalin/` (aventurasprontas.js).

**Resumo:** Segunda sub-fase da campanha (plano em `docs/CAMPANHA-PHANDELVER.md`). Nova aventura pronta **`modelo_phandelver_phandalin`** ("Mina Perdida de Phandelver — Cap. 2: Phandalin", nível 2-3, **14 nós**), adaptação própria e condensada:
- **Chegada** (entrega no Barthen, 10 po) → **hub da praça** com 8 locais, cada um com NPC embutido (P2) e um gancho: Stonehill (Toblen + 4 rumores), **Sildar** (500 po Gundren/castelo + 200 po Iarno), Leão Escudo (Linene, 50 po caixas), Câmbio (**Halia** — 100 po pela cabeça do Cajavidro; `notasPrivadas`: Zhentarim), Pomar (Daran → Velha Coruja), Fazenda (Qelline/Reidoth + **túnel do Carp**), Salão (Harbin covarde, 100 po orcs), Santuário (Garaele → Agatha + pente de prata).
- **Confronto de rua** (4× Bandido; o último foge pra mansão; prisioneiro entrega a senha "Illefarn") → **decisão pré-assalto** (recap das vantagens) → finais **vitória** (rumo à mansão; aponta o Cap. 2B) e **neutro** (partir da vila, retomável).
- Ganchos do Cap. 3 semeados em 4 nós (Velha Coruja, Agatha, orcs do Cume, Reidoth).

**Nota de coordenação:** uma run da rotina horária havia escrito uma versão própria do capítulo (13 nós) no working tree sem commitar (a run morreu no meio; o servidor dela ficou órfão na porta 5300). As duas versões foram comparadas e a mais completa (14 nós, com decisão pré-assalto, final neutro e segredos mais profundos) ficou; a duplicata foi removida — o validador agora acusa **0 ids duplicados**.

**Ficheiros:** `static/js/aventurasprontas.js` (+1 modelo).

**Verificação:** `node --check` (ok); harness Node com `validarAventura` nas **5 aventuras prontas**: todas 0 erros / 0 avisos, encontros com nomes EXATOS do bestiário, NPCs bem-formados, 0 ids duplicados. **Teste de mesa no preview** (porta alternativa 5399, Mestre, 0 erros de console): importar → iniciar → condução renderiza a chegada com o cartão do Barthen → avançar pro hub mostra as **10 saídas** → editor canvas com autolayout limpo (**14 nós, 23 setas + 23 rótulos, 0 sobreposições**). Dados locais restaurados após o teste.

**Como reverter:** restaurar `versoes/2026-07-14-ph1-phandalin/` ou `git revert`.

**Próximo:** PH2 — Cap. 2B: Esconderijo Marcarrubra (~13 nós, 2 entradas, Iarno/Cajavidro).

---

## 2026-07-14 — PH0 (Campanha Phandelver): bestiário + itens mágicos

**Backup antes da alteração:** `versoes/2026-07-14-ph0-bestiario-itens/` (monstros.js, itens.js, tabuleiro.js).

**Resumo:** Primeira sub-fase da campanha Phandelver completa (plano em `docs/CAMPANHA-PHANDELVER.md`). O bestiário ganhou as **9 criaturas** que os Caps. 2-4 usam e o catálogo ganhou os **9 itens mágicos** do módulo. Stats padrão do jogo com textos de traços/ações em redação própria (estilo da casa), todos com `loot` (Fase 13) e notas de CONDUÇÃO onde importa.
- **Criaturas** (`monstros.js`, 59→68): Grick (CR 2), Urso-Coruja (CR 3), Doppelganger (CR 3, nota: Vyerith/Vhalak), **Dragão Verde Jovem — Venomfang (CR 8, traço AVISO AO MESTRE: grupo nível 3-4 não enfrenta de frente)**, Gosma Ocre (CR 2, Dividir), Aparição/Wraith (CR 5, nota: Mormesk pode ser social), Ramo Seco (CR 1/8, vulnerável a fogo, nova categoria **Planta**), Zumbi das Cinzas (CR 1/4, nuvem de cinzas), Rei Grol (CR 2, chefe do Castelo Dentefino).
- **Itens** (`itens.js`, ITENS_MAGICOS 26→35): Talon, Cajado da Defesa, Hew, Botas de Correr e Saltar, Poção de Vitalidade, Criadora da Luz (Lightbringer), Guarda-Dragão (Dragonguard), Manoplas de Poder de Ogro, Cajado da Aranha. (Anel de Proteção e Varinha de Mísseis Mágicos já existiam.)
- `tabuleiro.js` — ícone 🌿 para a categoria Planta no `CATEGORIA_ICONE`.

**Verificação:** `node --check` nos 3 JS (ok); avaliação dos módulos em Node: 68 monstros, **0 nomes duplicados, 0 sem loot**, os 9 novos presentes, categorias com Planta; 35 itens mágicos, 0 duplicados, os 9 novos presentes e **todos no catálogo da loja** (ITENS_PADRAO).

**Como reverter:** restaurar `versoes/2026-07-14-ph0-bestiario-itens/` ou `git revert`.

**Próximo:** PH1 — Cap. 2A: Phandalin (vila-hub, ~14 nós, as 8 missões) — ver `docs/CAMPANHA-PHANDELVER.md`.

---

## 2026-07-14 — UI: cards de "Minhas Aventuras" sem estouro de botões

**Backup antes da alteração:** `versoes/2026-07-14-ui-card-aventuras/` (style.css).

**Resumo:** No grid de 260px, os 4 botões do card de aventura (Iniciar/Editar/Duplicar/Excluir) estouravam a largura e o `overflow:hidden` do card **cortava o Excluir** (reporte do Ismaile com screenshot). Correções: `.ficha-card-acoes` ganhou `flex-wrap: wrap` (global — cards de ficha não mudam, só quebram quando precisa); a biblioteca `#aventuraLib` ganhou cards mais largos (`minmax(320px,1fr)`), título com fonte/line-height ajustados e botões em grade fluida 2×2 (`flex: 1 1 calc(50% - 6px)` + ellipsis).

**Ficheiros:** `static/css/style.css` (só CSS).

**Verificação (browser real, 0 erros de console):** boot local, importado o modelo Ninho; card com 320px, **4 botões visíveis em 2 linhas, nenhum estourando** (medido por getBoundingClientRect vs. o card).

**Como reverter:** restaurar `versoes/2026-07-14-ui-card-aventuras/` ou `git revert`.

---

## 2026-07-14 — Fase 20.4 (addendum): corrige overflow na vista Lista do editor de aventuras

**Nota de concorrência:** esta entrada foi escrita em paralelo à entrada
"Fase 20.4 (conclusão)" logo abaixo — outra execução da rotina horária
auditou Modo de Jogo e o editor em vista **canvas** (🗺️ Mapa) e concluiu
(corretamente) que ambos já estavam limpos. Esta entrada complementa: audita
também a vista **Lista** (📋 Lista) do mesmo editor, que a outra execução não
teve chance de cobrir, e corrige um bug real encontrado nela.

**Backup antes da alteração:** `versoes/2026-07-14-20-4-conclusao/` (`static/css/style.css`, capturado antes desta correção).

**Resumo:** com a mesma ficha de teste (Mago nível 5) e a aventura
importada ("Mina Perdida de Phandelver" via `avImportarModelo`, local,
USE_LOCAL_DB=1 — nada tocou o Firestore), a vista **📋 Lista** do editor de
aventuras (alternativa ao canvas, mesmos dados) mostrou overflow real a
375px — mesma causa-raiz da 20.4 parcial (CSS Grid/Flex usa o min-content
dos filhos como piso, mesmo com faixa `minmax`/`flex` definida):
- `.dado-row` (linha de "Saídas (escolhas)" do nó: rótulo + 2 `<select>` +
  botão remover, também usada em `npc.js`) não tinha `flex-wrap` — conteúdo
  cortado (sem scroll, porque o pai não tem `overflow-x` próprio) a partir
  de 611px de largura numa viewport de 375px.
- `.form-grid` (grid `auto-fill, minmax(120px, 1fr)` dos campos do nó —
  Título/Tipo/etc.) estourava até 639px porque o `<select>` mede seu
  min-content pela opção mais larga (ex. "Assalto / Infiltração") e o item
  do grid, sem `min-width: 0`, nunca encolhe abaixo disso — a faixa
  `minmax(120px, 1fr)` só define um piso da FAIXA, não do item dentro dela.
- `static/css/style.css`: novo bloco `@media (max-width: 600px)` para
  `.dado-row` (`flex-wrap: wrap`, selects/`input` com `flex-basis`
  ajustado) + `.form-grid label`/`select`/`input` com `min-width: 0` e
  `max-width: 100%` (sem media query — seguro em qualquer largura, só
  permite o item encolher quando a faixa do grid mandar).

**Verificação (local, `USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`; `data/aventuras.json` criado pelo teste foi apagado ao
final):** scan de overflow automatizado (JS injetado via browser tool,
mesmo método da 20.4 parcial) em 375px na vista Lista — 0 ocorrências após
a correção (eram 94, depois 34 num fix intermediário, depois 0); reconferi
também Modo de Jogo (Mestre e Jogador `jogador`/`dnd2024`) e a vista canvas
para não regredir — 0 ocorrências nas duas, confirmando o achado da outra
execução. Reteste a 1280px: `.form-grid` mantém `auto-fill` multi-coluna
normal no desktop (7 colunas de ~131px) — nenhuma regressão.

**Como reverter:** restaurar `versoes/2026-07-14-20-4-conclusao/style.css` ou `git revert`.

---

## 2026-07-14 — Fase 20.4 (conclusão): auditoria das telas pendentes — Modo de Jogo com ficha completa e editor canvas

**Backup:** nenhum — **zero alterações de código** nesta entrega; é a
auditoria que faltava para fechar a 20.4 (ver entrada anterior).

**Resumo:** a entrega parcial da 20.4 deixou duas telas sem auditar por falta
de dados de teste (exigiam ficha de personagem pronta). Auditadas agora, a
375px, com o mesmo script de varredura de overflow da entrada anterior:
- **Modo de Jogo com ficha completa** — Mago nível 5 com 122 magias e 11
  itens (dados de teste locais), exercitando `.jg-attrs`, `.jg-cols`,
  `.jg-turno`, `.jg-pv` e 14 blocos `.jg-bloco` (slots, recursos, inventário,
  grimório/preparadas): **0 elementos estourando**; prova adicional — o
  `.modal-content.jogo-content` tem `scrollWidth == clientWidth` (358 = 358),
  ou seja, nada dentro dele é mais largo que ele.
- **Editor de aventuras em vista canvas** — aventura de 14 nós aberta no
  🗺️ Mapa: **0 elementos estourando** na página; o `.ae-canvas-wrap` contém o
  canvas grande (scrollWidth 1748) dentro de si com `overflow: auto` — a
  página não vaza, o mapa rola/paneia dentro do container (comportamento
  desejado, é assim que zoom/pan do editor funciona).
- `body.scrollWidth == 375` na viewport de 375px nas duas telas; 0 erros de
  console. As correções da entrega parcial (os 7 `minmax(0, 1fr)`, incluindo
  `.jg-cols`) já cobriam essas telas — nenhum ajuste novo foi necessário.
  **Fase 20.4 concluída.**

**Nota de infraestrutura:** `.claude/launch.json` ganhou a configuração
`dnd-toolkit-local-5301` (mesmo boot local, porta 5301 via env `PORT`) — usada
quando a porta 5300 está ocupada por outra sessão de trabalho.

**Como reverter:** nada a reverter (só documentação + config de dev).

---

## 2026-07-14 — Fase 20.4 (parcial): overflow horizontal em 375px + consolidação dos grids "→ 1 coluna"

**Backup antes da alteração:** `versoes/2026-07-14-20-4-responsividade/` (`static/css/style.css`).

**Resumo:** auditoria real em viewport 375px (script injetado no navegador
que varre todo elemento e reporta quem ultrapassa a largura da tela,
ignorando containers com `overflow-x` próprio) em TODAS as abas do Mestre
(3 modos × todas as tabs) e do Jogador (2 modos × todas as tabs). Achados:
- **Bug real confirmado**: `.combate-layout`, `.enc-layout`, `.criador-layout`,
  `.notas-layout`, `.jg-cols`, `.sub-lista` e `.personalidade-grid` colapsam
  para 1 coluna no mobile com `grid-template-columns: 1fr`. Sem `minmax(0, ...)`,
  o CSS Grid usa o **min-content** dos filhos como piso da coluna — se algum
  filho tiver conteúdo que não encolhe (ex.: `<select>` com `max-width`, texto
  `white-space: nowrap`), a coluna (e o container) estoura a viewport mesmo
  "colapsada". Confirmado ao vivo: aba Combate e Montador de Encontros
  estouravam a tela em até 598px de largura útil numa viewport de 375px.
  Corrigido nos 7 pontos trocando `1fr` por `minmax(0, 1fr)` — mesmo efeito
  visual, mas a coluna agora pode encolher abaixo do conteúdo (o conteúdo
  interno é que deve quebrar/rolar, não a coluna vazar).
- **Causa raiz do estouro acima**: `.add-monstro` (select + input + botões,
  usado no toolbar do Combate e no formulário "+ Adicionar" do Montador de
  Encontros) é `inline-flex` sem `flex-wrap` — os 3-4 controles em linha não
  cabem em 375px. Novo bloco `@media (max-width: 600px)` faz `.add-monstro`
  quebrar linha e o `<select>` ocupar a largura disponível.
- **Auditado e OK, sem mudança**: Fichas, Loja, Itens Mágicos, Membros,
  Geradores, Bestiário, Progressão (Mestre); Minha Ficha, Combate, História,
  Mapa, Handouts, NPCs, Bestiário, Progressão (Jogador) — zero overflow
  encontrado nesses ecrãs com os dados de teste disponíveis.
- `static/css/style.css`: os 7 `grid-template-columns: 1fr` → `minmax(0, 1fr)`
  (linhas perto de `.notas-layout`, `.jg-cols`, `.enc-layout`,
  `.combate-layout`, `.criador-layout`, `.sub-lista`, `.personalidade-grid`)
  + novo bloco mobile para `.add-monstro`.

**Verificação (local, `USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`):** boot sem erros de console; scan de overflow
automatizado (JS injetado via browser tool) em todas as abas do Mestre e do
Jogador a 375px — 0 ocorrências após a correção (Combate e Encontros
zeraram, antes tinham 4 e 15 elementos estourando a tela); reteste a
1280px confirmou que os grids continuam com o layout multi-coluna normal
no desktop (`.combate-layout` → `682px 300px`) e `.add-monstro` continua
`nowrap` (compacto) acima de 600px — nenhuma regressão.

**Falta para fechar a 20.4** (entrega parcial, coesa e funcional — o que
falta fica para a próxima execução): a auditoria não cobriu telas que
exigem uma ficha de personagem já criada (Modo de Jogo completo com
PV/slots/inventário, `.pv-attrs`/`.jg-attrs`/`.jg-turno-grid`) nem o editor
de aventuras em canvas (`.ae-canvas-wrap`) — nenhum dado de teste local
tinha ficha pronta para abrir essas telas sem construir uma pelo Criador
completo. Recomenda-se rodar o mesmo script de auditoria (documentado
acima) nessas telas específicas antes de marcar 20.4 como 100% concluída.
Os 8 breakpoints "avulsos" (700/767/820×4/560/720/900/pointer:coarse)
continuam como estavam — cada um já vive junto do componente que afeta
(prática válida), a consolidação nesta entrega foi a correção do bug de
overflow, não a redução do número de valores de breakpoint.

**Como reverter:** restaurar `versoes/2026-07-14-20-4-responsividade/style.css` ou `git revert`.

## 2026-07-14 — Fase 20.3: alvos de toque ≥44px

**Backup antes da alteração:** `versoes/2026-07-14-20-3-alvos-toque/` (`static/css/style.css`).

**Resumo:** vários controles pequenos (zoom do canvas do editor de aventuras,
✕ de remover nó/combatente, "➕ à loja", fechar do Modo de Jogo, chips de
magia preparada) tinham alvo de toque bem abaixo dos 44px recomendados —
fáceis de errar com o dedo, mesmo já com a navegação híbrida da 20.1/20.2.
- `static/css/style.css`: novo bloco `@media (pointer: coarse)` no final do
  arquivo — `pointer: coarse` detecta **toque**, não largura de tela (um
  notebook touchscreen também ganha os alvos maiores; mouse/trackpad mantém
  o tamanho compacto de sempre nas telas do Mestre). Eleva `.btn-mini`
  (zoom do canvas — `aeZoomPct`/±/ajustar —, "➕ à loja" em
  `itensmestre.js`, remoções de saída/NPC no editor de nó), `.comb-rem`/
  `.comb-alvo` (rastreador de combate), `.ae-node-x` (✕ do nó no canvas),
  `.jogo-fechar` (✕ dos modais de Jogo/Subida de Nível), `.jg-prep-chip`
  (chips de magia preparada) e `.banner-combate .banner-fechar` para
  `min-height`/`min-width: 44px`.
- **Exceção deliberada:** `.chefe-track .btn-mini` (contador denso de
  Resistência Lendária) continua compacto — seletor mais específico
  (`0,2,0` vs `0,1,0` do novo bloco) vence por especificidade CSS
  independente da media query, e essa densidade é intencional ali.

**Verificação (local, `USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`):** boot sem erros de console. Como o navegador de
automação usa mouse real (`pointer: fine`), não dá pra simular
`pointer: coarse` fisicamente aqui — validado direto no CSSOM
(`document.styleSheets`): a regra `@media (pointer: coarse)` existe com os
6 grupos de seletores esperados, sintaxe válida (o parser do navegador só
aceita `cssRules` bem formadas). O comportamento em toque real é garantido
pela media query padrão do CSS; a exceção do `.chefe-track` é garantida por
especificidade (determinístico, não depende de ambiente).

**Como reverter:** restaurar `versoes/2026-07-14-20-3-alvos-toque/style.css` ou `git revert`.

---

## 2026-07-14 — Fase 20.2: topbar enxuta no celular (drawer "⋯")

**Backup antes da alteração:** `versoes/2026-07-14-20-2-topbar-mobile/` (`templates/mestre.html`, `templates/jogador.html`, `static/css/style.css`).

**Resumo:** fecha o achado da 20.1 — em 375px, `.user-info` do Mestre
(campanha + 💾 Backup + Ver como Jogador + Sair, tudo numa linha) estourava a
largura do `body` (~185px de overflow horizontal). Os botões secundários
passam a viver num **drawer** atrás de um botão único "⋯"; no desktop nada
muda visualmente (mesmo truque de `display: contents` da 20.1).
- `templates/mestre.html` / `templates/jogador.html`: os botões de
  `.user-info` (exceto o nome do usuário) movidos para dentro de
  `<div class="user-info-extra" id="userInfoExtra">`, com um novo
  `<button id="userInfoToggle">⋯</button>` antes dele. Novo
  `<script src=".../navegacao.js">` incluído em ambos.
- `static/js/navegacao.js` (novo arquivo): abre/fecha o drawer no clique do
  "⋯", fecha ao clicar fora ou pressionar Esc. Só age quando os elementos
  existem — não faz nada no desktop (o toggle fica `display:none` lá).
- `static/css/style.css`: `.user-info-toggle{display:none}` +
  `.user-info-extra{display:contents}` como padrão (base, todas as larguras —
  no desktop os botões continuam soltos na `.user-info` como sempre). Dentro
  do bloco `@media (max-width: 767px)` (já criado na 20.1): toggle vira
  botão quadrado 36×36, `.user-info-extra` vira painel dropdown
  `position:absolute` **ancorado no `.topbar-row`** (não no `.user-info` —
  tentativa inicial ancorada no `.user-info`/`right:16px` ainda vazava pra
  fora da tela porque esse elemento quebra de linha e fica estreito;
  `.topbar-row` sempre ocupa a largura toda, então `left:16px; right:16px`
  nele garante que o drawer cabe em qualquer largura).

**Verificação (local, `USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`):** `node --check static/js/navegacao.js` OK. Em 1280px:
toggle `display:none`, `.user-info-extra` `display:contents`, botão de
Backup visível e no lugar de sempre (sem mudança visual). Em 375px: overflow
horizontal do `body` foi de ~185px para **0px**; clique no "⋯" abre o drawer
(`display:flex`, dentro da viewport, 4 botões presentes — Trocar/Backup/Ver
como Jogador/Sair); clique fora fecha. Repetido em 500px (achei e corrigi um
bug de ancoragem nessa faixa antes de confirmar) e em `/jogador` (3 botões:
Voltar ao Mestre condicional/Campanhas/Sair) — sem erros de console.

**Como reverter:** restaurar os 3 arquivos de `versoes/2026-07-14-20-2-topbar-mobile/` e apagar `static/js/navegacao.js`, ou `git revert`.

---

## 2026-07-14 — Fase 20.1: navegação híbrida (sidebar desktop / bottom-nav celular)

**Backup antes da alteração:** `versoes/2026-07-14-20-1-navegacao-hibrida/` (`static/css/style.css`).

**Resumo:** primeira sub-fase da pesquisa UX de 13/07 — "sidebar não funciona
<768px; bottom-nav de 3–5 itens na zona do polegar é o padrão". Reaproveita o
MESMO HTML e a MESMA lógica JS de troca de modo/aba (`app.js`/`jogador.js`,
Fase 17.1/17.2) — muda só a apresentação via CSS, sem tocar templates nem JS.
Como `.tabs` já esconde as abas fora do modo atual (`.tab-oculta`), empilhar
`.modos` + `.tabs` na vertical já lê como "grupo do modo + suas abas".
- `static/css/style.css`: bloco novo logo após as regras de `main` —
  `@media (min-width: 768px)`: `.topbar` vira sidebar fixa (220px, altura
  100vh, scroll próprio), `.modos`/`.tabs` empilham na vertical, `main` ganha
  `margin-left: 220px`. `@media (max-width: 767px)`: `.modos` vira bottom-nav
  fixo (`position: fixed; bottom: 0`, `env(safe-area-inset-bottom)`), `.tabs`
  vira linha rolável horizontal (`overflow-x: auto` + `scroll-snap-type: x`),
  `main` ganha `padding-bottom` para não ficar atrás do bottom-nav.
- Nenhuma mudança em `templates/*.html` ou `static/js/*.js` — só CSS.

**Verificação (local, `USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`):** login Mestre; em 1280px, confirmado via
`getBoundingClientRect`/`getComputedStyle` que `.topbar` fica `position:fixed`
220px com `main` deslocado (`margin-left:220px`), clique num botão de modo
troca as abas visíveis e clique numa aba troca a seção ativa (mesma lógica de
sempre, só reposicionada). Em 375px, `.modos` fica `position:fixed;bottom:0`
(altura de cada botão 61px, acima do alvo mínimo de 44px), `.tabs` com
`overflow-x:auto` funcionando, clique em aba ainda troca a seção corretamente.
Repetido em `/jogador` (Mestre + jogador têm o mesmo `.topbar`/`.modos`/`.tabs`).

**Achado (não corrigido aqui, é o escopo da 20.2):** em 375px, `.user-info` do
Mestre (campanha + 💾 Backup + Ver como Jogador + Sair, todos numa linha) não
quebra e causa overflow horizontal do `body` (~185px) — bug pré-existente
(CSS de `.user-info` não tocado por esta sub-fase; `/jogador` não tem esse
problema, tem menos botões). Fica para a 20.2 ("topbar enxuta no celular").

**Como reverter:** restaurar `versoes/2026-07-14-20-1-navegacao-hibrida/style.css` ou `git revert`.

---

## 2026-07-14 — Fase 18.3: limite de tamanho de payload

**Backup antes da alteração:** `versoes/2026-07-14-18-3-limite-payload/` (`app.py.bak`).

**Resumo:** nenhuma rota tinha limite de tamanho de corpo — um cliente mal-
intencionado (ou um bug no navegador) podia enviar um `PUT` gigante (fichas,
aventuras, lojas, notas etc.) e estourar memória/banda sem qualquer bloqueio
no servidor. Fecha o último item pendente da Fase 18 (segurança/integridade).
- `app.py`: `app.config['MAX_CONTENT_LENGTH'] = 2 * 1024 * 1024` (2 MB, generoso
  para o maior estado de campanha — texto/JSON puro, sem upload de imagem)
  aplica-se a **todas** as rotas automaticamente (Flask rejeita antes de
  processar o corpo); `@app.errorhandler(413)` devolve JSON no mesmo padrão
  `{'erro': ...}` das demais rotas, em vez da página HTML padrão do Werkzeug.
- **Verificação:** boot local (`USE_LOCAL_DB=1`, porta 5301), backup/restauro
  de `data/estado.json`; login como Mestre, `PUT /api/fichas` com corpo normal
  → 200; `PUT /api/fichas` com corpo de 3 MB → 413 com
  `{"erro":"payload_grande",...}`; log do servidor sem tracebacks. Servidor
  encerrado ao final.
- **Reverter:** copiar `versoes/2026-07-14-18-3-limite-payload/app.py.bak`
  sobre `app.py`, ou remover as ~7 linhas adicionadas após `app.secret_key`.

## 2026-07-14 — Fase 18.2: tempo real sem vazar notas privadas do Mestre

**Backup antes da alteração:** `versoes/2026-07-14-18-2-rt-sem-vazamento/` (`app.py`, `static/js/firebase-rt.js`, `static/js/jogador.js`, `firestore.rules`).

**Resumo:** o RT (Firestore `onSnapshot`) é lido **direto pelo cliente**, sem
passar pelas rotas Flask — então o filtro que essas rotas já faziam (GET
`/api/npcs` remove `notasPrivadas`; GET `/api/aventura_ativa` esconde
`notasMestre` do jogador) nunca protegia o tempo real: qualquer membro da
campanha recebia o **documento inteiro** via `onSnapshot`, incluindo
`npcs[].notasPrivadas` e notas do Mestre com `compartilhada: false`, visíveis
a quem abrisse o DevTools. `SEGURANCA.md` (linha 43) já documentava isso como
lacuna conhecida.
- `app.py`: `_estado_publico(estado)` gera uma cópia do estado sem esses dois
  campos; `salvar_estado()` agora grava **dois documentos** no Firestore —
  `campanha/<id>` (bruto, como antes) e `campanha_publica/<id>` (a projeção
  filtrada); `carregar_estado()` semeia os dois na criação de uma campanha
  nova. Sem Firestore (modo local), o comportamento não muda — o segundo
  write só roda quando `db is not None`.
- `firestore.rules`: `campanha/<id>` passa a ser legível **só pelo Mestre**
  (mestre da mesa ou mestre fixo legado); novo `match /campanha_publica/<id>`
  com a mesma regra ampla de antes (mestre, membro registado ou jogador fixo
  legado) — é o documento que o jogador lê.
- `static/js/firebase-rt.js`: `RT.ouvir()` continua a escutar `campanha`
  (usado pelo Mestre em `app.js`); novo `RT.ouvirPublico()` escuta
  `campanha_publica`.
- `static/js/jogador.js`: o listener de tempo real troca `RT.ouvir` por
  `RT.ouvirPublico` — o resto do handler não muda (mesmo formato de estado).

**Verificação:** `python -c "import ast; ast.parse(...)"` e `node --check` nos
3 arquivos JS tocados, OK. `_estado_publico()` testado isoladamente (script
`python -c`): notas não-compartilhadas removidas, `notasPrivadas` removido de
cada NPC, demais campos (fichas, etc.) preservados sem mutar o dict original.
Boot local (`USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`): login Mestre, `GET/PUT /api/notas` (nota privada +
compartilhada), `GET /api/fichas` — tudo 200, sem erros de console. Como o
modo local não usa Firestore, o par de documentos e as novas Regras só são
exercitados em produção (ou com credencial Firebase local).

**Pendência manual do Ismaile (não bloqueia — degradação suave):** o código já
grava os dois documentos, mas o benefício de segurança só vale depois de
publicar o `firestore.rules` atualizado no Console (Firestore Database →
Regras → colar → Publicar) — mesma pendência #3 já listada em `ROADMAP.md`
🧭 AGORA. Até lá, as regras antigas (mais permissivas) continuam valendo.

**Pendente (para 18.3, não coberto aqui):** limite de tamanho de payload nos PUTs.

**Como reverter:** restaurar `versoes/2026-07-14-18-2-rt-sem-vazamento/` ou `git revert`.

---

## 2026-07-14 — Fase 18.1: Loja do Modo de Jogo validada no servidor

**Backup antes da alteração:** `versoes/2026-07-14-18-1-loja-base-servidor/` (`app.py`, `static/js/jogo.js`).

**Resumo:** a Loja Básica/Especial do Modo de Jogo debitava e creditava `ficha.ouro`
**no cliente** (o preço vinha do catálogo JS ou do atributo `data-lojapreco`) — um
jogador com DevTools podia editar o preço antes do clique e comprar qualquer coisa
de graça. Migrado para o mesmo padrão validado das lojas de NPC (Fase 12): o
servidor decide o preço e debita/credita, o cliente só pede.
- `app.py`: `LOJA_BASICA_PRECOS` (espelho em Python do catálogo mundano de
  `equipamento.js`, ~110 itens + 24 extras só em `itens.js` — montarias,
  instrumentos, nomes legados) e `LOJA_BASICA_MUNICAO` (pacotes de flecha/virote/
  pedra/agulha → incremento de `ficha.municao`); `_preco_loja_jogo()` resolve o
  preço pela Loja Básica OU pelos itens curados da Loja Especial
  (`estado['loja_especial_itens']`, só se liberada para a ficha/campanha).
  Novos endpoints `POST /api/loja_base/comprar` e `POST /api/loja_base/vender`
  (valida dono da ficha, estoque de ouro, existência do item; venda por metade
  do preço, desequipa slot se o item vendido estava equipado).
- `_sanitizar_fichas_jogador`: agora também preserva `ouro` do valor gravado
  (como já fazia com `xp`) — com a loja validada no servidor, `PUT /api/fichas`
  deixou de ser um caminho legítimo para o jogador alterar ouro; fecha o vetor
  que o comentário da função já apontava como pendência.
- `static/js/jogo.js`: os handlers `[data-lojaadd]` (comprar) e `[data-vender]`
  (vender) do Modo de Jogo agora chamam os novos endpoints via `fetch` e
  espelham a resposta do servidor na ficha local (mesmo padrão do `npc.js`),
  em vez de mutar `ficha.ouro`/`ficha.itens` diretamente.

**Verificação (local, `USE_LOCAL_DB=1`, porta 5300, backup/restauro de
`data/estado.json`):** `python -c "import ast; ast.parse(...)"` e `node --check
static/js/jogo.js` OK. Testes via `fetch` autenticado como jogador: comprar item
comum (debita preço certo), comprar pacote de munição 2× (incrementa
`ficha.municao.qtd` corretamente), comprar item inexistente (404), comprar sem
ouro suficiente (400 com mensagem clara), vender item possuído (credita metade
do preço, remove 1 unidade), vender item não possuído (400). Confirmado que um
`PUT /api/fichas` do jogador com `ouro` adulterado manualmente é ignorado pelo
servidor (preserva o valor gravado). Testado também pela **UI real** (criação de
ficha via Criador → 🎲 Gerar Automático → Salvar → Modo de Jogo → 🛒 Loja): clique
em comprar e vender debitam/creditam o ouro exibido corretamente, sem erros de
console; `read_network_requests` confirmou as chamadas a `/api/loja_base/comprar`
e `/api/loja_base/vender` com os status esperados (200/404/400 conforme o caso).

**Pendente (para a próxima sub-fase 18.2/18.3, não coberto aqui):** tempo real
sem vazamento de `notasMestre`/`notasPrivadas` no RT cru; limite de tamanho de
payload nos PUTs.

**Como reverter:** restaurar `versoes/2026-07-14-18-1-loja-base-servidor/` ou `git revert`.

---

## 2026-07-13 — Livro-jogo P7: 2ª one-shot original ("O Comboio de Sal")

**Backup antes da alteração:** `versoes/2026-07-13-p7-oneshot-comboio/` (HEAD de `aventurasprontas.js`, já com a 1ª one-shot).

**Resumo:** Segunda aventura pronta original (P7), de **tom deliberadamente diferente** da Cripta para dar variedade ao material de demonstração: uma aventura SELVAGEM de escolta/emboscada, sem mortos-vivos. **O Comboio de Sal** (`modelo_comboio_de_sal`): 13 nós, nível 1-3, até 5 jogadores.
- Escoltar a carroça de sal do mercador ganancioso Halden pela estrada da Fenda; 4 aberturas de tom (batedores / dia cauteloso / noite mortal 💀 / recusar a rota 🚧).
- **Escolha moral sem resposta certa:** os "bandidos" são refugiados famintos liderados pelo ex-soldado Bram — partilhar o sal dá guia seguro + aliados mas reduz a paga; entregá-los agrada a Halden mas tira o aviso do ninho (os PJs entram na garganta em desvantagem).
- Clímax na garganta cheia de teias (Aranha Gigante) até o guardião do ninho (Ursaco/Owlbear); 1 vitória, 1 derrota clemente e 2 becos/mortes sinalizados.
- **Monstros:** só nomes exatos do bestiário (Bandido, Lobo, Aranha Gigante, Ursaco) — todos com `loot` (Fase 13).

**Ficheiros:** `static/js/aventurasprontas.js` (2ª entrada nova); `docs/LIVRO-JOGO.md` (P7 com as duas one-shots). Biblioteca de modelos: agora **4** (Ninho, Phandelver Cap.1, Cripta, Comboio).

**Verificação (Node):** `node --check` OK; `validarAventura` das duas one-shots → **0 erros, 0 avisos**; todos os monstros de encontro existem em `MONSTROS`; 0 caracteres não-latinos.

**Como reverter:** restaurar `versoes/2026-07-13-p7-oneshot-comboio/` ou `git revert`.

---

## 2026-07-13 — Livro-jogo P7: 1ª one-shot original ("A Cripta do Sino Silencioso")

**Backup antes da alteração:** `versoes/2026-07-13-p7-oneshot-cripta/` (HEAD de `aventurasprontas.js`).

**Resumo:** Primeiro passo do P7 (mais aventuras prontas) com uma **one-shot original** — conteúdo próprio, sem reproduzir módulo publicado — como material de demonstração para Mestres novos. **A Cripta do Sino Silencioso** (`modelo_cripta_sino_silencioso`): 14 nós, nível 1-3, até 5 jogadores.
- **Estrutura de livro-jogo exemplar:** abertura com 4 escolhas de tom → hub de investigação (coveiro / cemitério / descida direta) → cripta (ossuário opcional com mais loot/risco → câmara dos festins) → **escolha moral sem resposta certa** (o pacto sob o sino: matar o cultista e devolver a mortalidade à vila, ou aceitar a vida eterna ao custo das almas) → clímax contra Cultista + Wight.
- **Finais múltiplos:** 1 vitória, 2 derrotas jogáveis (ambas com alternativa clemente à morte — captura/exaustão em vez de TPK) e 2 neutros/becos sinalizados (inação, pacto ambíguo).
- **Monstros:** só nomes exatos do bestiário (Esqueleto, Rato Gigante, Lodo Cinzento, Carniçal, Cultista, Wight) — todos já com `loot` (Fase 13), então o "🎲 Loot do nó" (P6) funciona de imediato nesta aventura.

**Ficheiros:** `static/js/aventurasprontas.js` (nova entrada no fim de `AVENTURAS_PRONTAS`); `docs/LIVRO-JOGO.md` (P7 com o one-shot registado).

**Modelo de dados:** nenhum novo (formato de livro-jogo existente). Importável pelo botão "📚 Importar modelo".

**Verificação (Node):** `node --check` OK; `validarAventura` → **0 erros, 0 avisos** (sem órfãos, becos não-finais, e há caminho de vitória alcançável); **todos** os monstros de encontro existem em `MONSTROS`; 0 caracteres não-latinos residuais (checado após corrigir um nome digitado com script misto).

**Como reverter:** restaurar `versoes/2026-07-13-p7-oneshot-cripta/` ou `git revert`.

---

## 2026-07-13 — Fase 13 COMPLETA: loot em 100% do bestiário (59/59)

**Backup antes da alteração:** `versoes/2026-07-13-fase13-loot-completo/` (HEAD de `monstros.js`, já com os +12 anteriores).

**Resumo:** Fecha o trabalho contínuo da Fase 13 — os **27 monstros restantes** ganharam `loot` próprio, levando o bestiário a **59/59 com tabela de tesouro**. Nada mais cai só na tabela genérica por ND. Loot temático por natureza da criatura:
- **Feras/constructos** (Lobo Atroz, Urso-Pardo, Rato Gigante, Worg, Grifo, Estirge, Armadura Animada, Dríade…): `ouroFormula: '0'` (não carregam moedas) + despojos coerentes (peles, penas, a própria armadura recuperável, encantos naturais).
- **Mortos-vivos** (Carniçal, Ghast, Espectro, Sombra, Flameskull): bens funerários e relíquias; incorpóreos (Espectro/Sombra) quase nada físico.
- **Monstruosidades/aberrações** (Aranha Gigante, Harpia, Mantícora, Minotauro, Nothic, Espectador): glândula de veneno, ninhos com moedas de vítimas, o tesouro que guardavam.
- **Limos** (Lodo Cinzento, Cubo Gelatinoso): itens engolidos/indigestos — o clássico saque de dentro do cubo.
- **Gigante da Colina, corruptores (Diabrete, Cão Infernal) e dragões filhotes (Vermelho/Branco):** despojos e pequenos covis com gemas/arte/poções.

**Ficheiros:** `static/js/monstros.js` (campo `loot` em 27 entradas; só dados).

**Modelo de dados:** nenhum novo. Retrocompatível.

**Verificação (Node):** `node --check` OK; **59/59** com `loot` (lista de "sem loot" vazia); amostras de `rolarLoot` — `ouroFormula:'0'` das feras rende 0 po (só despojo), dragão filhote e cubo dão ouro+item dentro da faixa. Reforça diretamente o P6 (🎲 Loot do nó) entregue hoje.

**Como reverter:** restaurar `versoes/2026-07-13-fase13-loot-completo/` ou `git revert`.

---

## 2026-07-13 — Fase 13 (contínuo): tabelas de loot em +12 monstros

**Backup antes da alteração:** `versoes/2026-07-13-fase13-loot-monstros/` (HEAD de `monstros.js`).

**Resumo:** Trabalho contínuo da Fase 13 (loot por monstro), reforçando o P6 recém-entregue (🎲 Loot do nó) — agora mais encontros deixam tesouro temático em vez de só cair na tabela genérica por ND. **12 monstros** ganharam `loot` próprio (de 20 → **32 de 59** com loot):
- **Humanoides de combate:** Guarda, Batedor (Scout), Veterano, Berserker, Sacerdote (Priest), Mago (Mage), Gnoll — moedas + equipamento/pergaminhos/gemas coerentes com o papel.
- **Chefe de Phandelver:** Mago Drow (Nezznar) com `itensGarantidos` (Mapa para a Caverna do Eco das Ondas + Bastão de aranhas) — sempre soltos, servem de gancho.
- **Mortos-vivos:** Wight, Múmia — bens funerários (anéis, objetos de arte, escaravelhos).
- **Icônicos:** Ursaco (Owlbear) e Trol (Troll) — bugigangas/gemas "engolidas" no ninho/estômago.

**Ficheiros:** `static/js/monstros.js` (campo `loot` em 12 entradas; só dados, nada de lógica).

**Modelo de dados:** nenhum novo (usa o `loot` já consumido por `loot.js`/`rolarLoot`). Retrocompatível.

**Verificação (Node):** `node --check` OK; rolagens de amostra com `rolarLoot`/`rolarLootEncontro` — Nezznar solta os 2 itens garantidos de forma confiável; Veterano/Mago/Múmia/Wight dão ouro+itens dentro da faixa; encontro misto (Kobold+Cultista+Gnoll) soma corretamente.

**Como reverter:** restaurar `versoes/2026-07-13-fase13-loot-monstros/` ou `git revert`.

**Restam sem loot próprio:** 27 monstros (sobretudo feras e alguns elementais/constructos) — seguem na tabela genérica por ND; ir preenchendo conforme aparecem nas mesas.

---

## 2026-07-13 — Livro-jogo P6: Loot e XP integrados à condução

**Backup antes da alteração:** `versoes/2026-07-13-p6-loot-xp-conducao/` (HEAD de `aventura.js`).

**Resumo:** Último passo pendente do motor de livro-jogo (P6 do `docs/LIVRO-JOGO.md`): ao conduzir um nó de **encontro**, o Mestre agora fecha o ciclo de recompensa sem sair da aba Aventura.
- **🎲 Loot do nó:** rola o tesouro dos monstros do encontro reusando a Fase 13 (`rolarLootEncontro`). Expande `encontro: [{nome,qtd}]` numa entrada por criatura, resolve pelo bestiário (`MONSTROS`), mostra ouro + itens e traz o botão **💰 Dividir ouro pelo grupo** (quota inteira por ficha viva; troco fica com o Mestre) — mesmo comportamento do "🎲 Gerar Loot" do Combate.
- **🏅 XP sugerido + Enviar XP ao grupo:** o cabeçalho do encontro mostra o XP bruto (`soma de pe × qtd`); o botão divide esse total pelas fichas vivas e soma a `ficha.xp` (respeita **B2** — só o Mestre dá XP; a condução é tela do Mestre). Confirmação antes de aplicar.
- Itens continuam a ser distribuídos manualmente com "📦 Enviar à ficha" (aba Fichas), como o loot do Combate.

**Ficheiros:**
- `static/js/aventura.js` — funções puras testáveis `entradasDoEncontro(encontro, resolver)` e `xpDoEncontro(encontro, resolver)` (exportadas p/ Node); em `renderConducao`, cálculo de `xpEncontro`, botões `#acLootNo`/`#acXpGrupo` + caixa `#acRecompensaBox` no bloco de encontro, e os handlers (loot com divisão de ouro; XP dividido pelas fichas vivas).
- `test-p6.js` — harness Node das funções puras (XP somado, expansão por criatura, monstro ausente ignorado, integração com `rolarLootEncontro`).
- `docs/LIVRO-JOGO.md` — P6 marcado como entregue.

**Modelo de dados:** nenhum novo (reusa `no.encontro`, `MONSTROS.pe`, `loot.js`, `fichas`). Retrocompatível.

**Verificação (Node + browser real, 0 erros de console):** `node --check` + `node test-p6.js` (8/8 verdes: 4 Goblins = 200 PE, 7 entradas p/ 4+2+1 criaturas, monstro ausente = 0 XP e 0 entradas, 4 Adagas garantidas via loot próprio). No browser (login Mestre, `USE_LOCAL_DB=1`): aventura "Ninho da Rainha Dragão" iniciada no nó **A família Swift** (4 Kobolds), a condução renderizou 🎲 Loot do nó, 🏅 Enviar XP ao grupo e "100 PE". Clique em **Loot do nó** → 16 po; **Dividir ouro** → 8 po para cada uma de 2 fichas; **Enviar XP** → 50 XP para cada (100/2). Lido de volta em `/api/fichas`: `ouro:8, xp:50` nas duas — persistido. Console sem erros. (Achado à parte: `data/estado.json` local estava corrompido por uma escrita parcial anterior — reparado pegando o 1º objeto JSON válido; ficheiro é gitignored/dev, produção usa Firestore.)

**Como reverter:** restaurar `versoes/2026-07-13-p6-loot-xp-conducao/` ou `git revert`.

**Livro-jogo:** P1–P3 e P6 entregues. Restam P4 (canvas SVG v2 do editor — parcialmente coberto pelo mapa mental do K2), P5 (grid por nó, dependente da Fase 14 dormente) e P7 (mais aventuras prontas — Phandelver no formato de livro-jogo).

---

## 2026-07-10 — Livro-jogo P3: partilha de aventuras entre membros + limites ao iniciar

**Backup antes da alteração:** `versoes/2026-07-10-p3-partilha-limites/` (HEAD de `app.py`, `aventura.js`, `mestre.html`).

**Resumo:** Dois refinos do motor de livro-jogo (P3 do `docs/LIVRO-JOGO.md`):
- **Partilha:** o Mestre pode **importar uma aventura da biblioteca de outro membro** da campanha. Botão **📥 De um membro** na aba Aventura → escolhe o membro → escolhe a aventura dele → copia para a própria biblioteca (id novo, título "… (de Fulano)"), independente do original. Mesma validação de membresia do `GET /api/banco_npc/<uid>` (só-Mestre, só membros da campanha ativa).
- **Limites ao iniciar (aviso NÃO-bloqueante):** ao clicar **▶ Iniciar**, o app compara as fichas da mesa com `limites` da aventura e, se houver divergência, mostra os avisos no confirm ("A mesa tem 3 fichas; o modelo sugere até 2 jogadores.", "Há ficha(s) abaixo/acima do nível sugerido") + "Iniciar mesmo assim?". O Mestre decide — nada é bloqueado.

**Ficheiros:**
- `app.py` — novo endpoint **`GET /api/aventuras/<uid_alvo>`** (só-Mestre; valida que o alvo é membro da campanha ativa; espelha `banco_npc/<uid>`).
- `static/js/aventura.js` — `avisosLimites(a)` (compara `/api/fichas` com `limites`; usa `ficha.nivel` = nível total) chamado no handler de Iniciar; handler do botão **📥 De um membro** (`campanha_info` → membros → `aventuras/<uid>` → copiar).
- `templates/mestre.html` — botão `#avImportarMembro` ao lado de "📚 Importar modelo".
- `docs/LIVRO-JOGO.md` — P3 marcado como entregue.

**Modelo de dados:** nenhum novo (usa `aventuras/<uid>`, `limites` e `ficha.nivel` existentes). Retrocompatível.

**Verificação (browser real + curl, 0 erros de console):** boot local (`USE_LOCAL_DB=1`, estado restaurado do backup). **Endpoint:** Mestre legado → 400 "campanha legada" (sem meta); jogador → barrado (mestre-only). **Limites:** com 3 fichas (níveis 1/7/3) e uma aventura `limites:{jogadoresMax:2,nivelMin:3,nivelMax:5}`, o confirm de Iniciar trouxe os **3 avisos** corretos + "Iniciar mesmo assim?" (capturado sobrescrevendo `window.confirm`). **Partilha:** o botão 📥 existe e, em campanha legada, degrada com alerta "sem membros geridos". O happy-path (importar de um membro real) exige campanha **registrada** com membros — não exercível no modo legado local, mas o endpoint espelha o `banco_npc/<uid>` já testado.

**Como reverter:** restaurar `versoes/2026-07-10-p3-partilha-limites/` ou `git revert`.

**Próximo (livro-jogo):** P6 — Loot e XP integrados à condução (botão "🎲 Loot do nó" + sugestão de XP pela soma dos `pe` do encontro, enviada via "📦 Enviar à ficha").

---

## 2026-07-10 — Fase 17.2: tela do Jogador enxuta (2 modos) — Fase 17 concluída

**Backup antes da alteração:** `versoes/2026-07-10-fase17-2-jogador-enxuto/` (HEAD 17.1 de `jogador.html`, `jogador.js`).

**Resumo:** Mesma ideia da 17.1, aplicada à tela do **jogador** (que é mais simples): as 8 abas viraram **2 modos por tarefa**:
- **🎲 Mesa:** Minha Ficha, Combate, História, Mapa, Handouts.
- **📖 Consultar:** NPCs, Bestiário, Progressão.

Só as abas do modo atual aparecem; a barra de modos fica acima das abas. **Nada removido** — reusa o CSS de modos (`.modos/.modo-btn/.tab-oculta`) e a mesma lógica da 17.1. Cliques de aba — inclusive o **programático** ao entrar em combate (o app pula pra aba Combate) — **trazem o modo Mesa junto**.

**Ficheiros:**
- `templates/jogador.html` — `<nav class="modos">` (2 botões) + `data-mode` em cada `.tab-btn`.
- `static/js/jogador.js` — bloco "Tabs" reescrito para "Tabs + Modos" (mesma implementação da 17.1; inicial = modo da aba ativa = Minha Ficha → Mesa).
- (Sem mudança de CSS — reaproveita a Fase 17.1.)
- `ROADMAP.md` — Fase 17.2 marcada como entregue.

**Modelo de dados:** nenhum (só UI). Retrocompatível.

**Verificação (browser real, 0 erros de console):** boot local (`USE_LOCAL_DB=1`), login do jogador. Estado inicial = **Mesa** com Minha Ficha ativa (5 abas: fichas/combate/historia/mapa/handouts). **Consultar** → 3 abas (npcs/bestiario/progressao), NPCs ativa. **Clique programático** em `[data-tab="combate"]` a partir do Consultar → voltou pro modo Mesa com Combate ativa (garante que o salto automático ao entrar em combate funciona). 2 botões de modo.

**Como reverter:** restaurar `versoes/2026-07-10-fase17-2-jogador-enxuto/` ou `git revert`.

**Fase 17 (UX & PWA) concluída** — 17.1 Mestre em 3 modos, 17.2 Jogador em 2 modos, 17.3 PWA instalável.

**Próximo sugerido:** fora do épico de UX/Tabuleiro — P3+ do livro-jogo (partilha de aventuras, loot/XP na condução) ou segurança (loja base validada no servidor). Ou refinos opcionais 16.6 (centralizar/seguir, medir distância no tabuleiro).

---

## 2026-07-10 — Fase 17.1: tela do Mestre em 3 modos (Jogar / Preparar / Consultar)

**Backup antes da alteração:** `versoes/2026-07-10-fase17-1-tres-modos/` (HEAD 17.3 de `mestre.html`, `app.js`, `style.css`).

**Resumo:** As **~12 abas** lado a lado do Mestre viraram **3 modos por tarefa**, reduzindo o que aparece de uma vez:
- **🎲 Jogar (Mesa):** Aventura (condução + tabuleiro), Combate, NPCs, Notas.
- **📝 Preparar:** Fichas, Encontros, Loja, Itens Mágicos, Membros, Geradores.
- **📖 Consultar:** Bestiário, Progressão.

Uma barra de modos aparece acima das abas; ao escolher um modo, só as abas dele ficam visíveis e a primeira é ativada. **Nada foi removido** — todas as seções e a lógica de abas continuam iguais; só ganharam uma camada de filtro. Um clique de aba — **inclusive os programáticos** (ex.: "lançar encontro do ambiente" → Combate; "lançar encontro" da condução → Combate) — **traz o modo dela junto**, então a navegação existente não quebra.

**Ficheiros:**
- `templates/mestre.html` — nova `<nav class="modos">` (3 botões) + `data-mode` em cada `.tab-btn` (mapeando aba→modo).
- `static/js/app.js` — bloco "Tabs" reescrito para "Tabs + Modos": `ativarTab`/`mostrarModo`; clique de aba aplica o modo dela; clique de modo mostra o grupo e ativa a 1ª aba; estado inicial = modo da aba ativa no HTML (Fichas → Preparar).
- `static/css/style.css` — `.modos`/`.modo-btn`/`.modo-btn.on` (controle segmentado) + `.tab-oculta { display:none }`.

**Modelo de dados:** nenhum (só UI). Retrocompatível.

**Verificação (browser real, 0 erros de console):** boot local (`USE_LOCAL_DB=1`). Estado inicial = **Preparar** com Fichas ativa (6 abas visíveis: fichas/encontros/loja/itensMagicos/membros/geradores; 6 ocultas). **Jogar** → 4 abas (combate/npcs/aventura/notas), Combate ativa. **Consultar** → 2 abas (progressão/bestiário). **Clique programático** em `[data-tab="bestiario"]` a partir de outro modo → o modo Consultar veio junto e a aba ficou visível/ativa (garante que os `.click()` automáticos não deixam aba escondida). 3 botões de modo.

**Como reverter:** restaurar `versoes/2026-07-10-fase17-1-tres-modos/` ou `git revert`.

**Próximo (Fase 17):** 17.2 — enxugar a tela do jogador (ficha, mapa, handouts, dados). Depois disso a Fase 17 fecha (17.3 PWA já entregue).

---

## 2026-07-10 — Fase 17.3: PWA (instalável + offline básico)

**Backup antes da alteração:** `versoes/2026-07-10-fase17-3-pwa/` (HEAD 16.5 de `app.py` + templates `mestre/jogador/login/campanhas`).

**Resumo:** O D&D Toolkit virou **PWA** — dá pra **instalar na tela inicial** (celular e desktop) e abre em janela própria (standalone), combinando com o tabuleiro que agora funciona no toque.
- **Manifest** (`/manifest.webmanifest`): nome, ícones (192/512 + maskable), `display: standalone`, cores do tema (`#e94560` / fundo `#12121e`).
- **Ícones** (`static/icons/`): 🐉 sobre fundo escuro com o anel vermelho da marca, gerados com Pillow (Segoe UI Emoji) em 192, 512 e 512-maskable.
- **Service Worker** (`/sw.js`, escopo **raiz**): estratégia **network-first + fallback ao cache** — sempre busca a rede primeiro (código/estado/tempo real SEMPRE frescos; evita o clássico "PWA servindo JS velho após deploy"), e offline cai no cache das páginas/estáticos já visitados. **Não** intercepta POST/PUT nem `/api/` (dinâmicos). Precache do shell (`style.css`) + página **`offline.html`** para navegações sem conexão.

**Ficheiros:**
- **Novos** `static/manifest.webmanifest`, `static/sw.js`, `static/offline.html`, `static/icons/icon-192.png` / `icon-512.png` / `icon-512-maskable.png`.
- `app.py` — rotas públicas **`/sw.js`** (com `Service-Worker-Allowed: /` para o SW controlar todo o app + `Content-Type` de JS + `no-cache`) e **`/manifest.webmanifest`** (MIME `application/manifest+json`).
- `templates/mestre.html`, `jogador.html`, `login.html`, `campanhas.html`, `assinatura.html` — `<link rel="manifest">` + `theme-color` + `icon`/`apple-touch-icon` + registro do SW (`navigator.serviceWorker.register('/sw.js')` no `load`).
- `ROADMAP.md` — Fase 17.3 marcada como entregue.

**Sem dependências novas de runtime** (Pillow só foi usado para gerar os ícones, offline; não entra no `requirements.txt`). **Sem env nova.** HTTPS de produção (Render) já satisfaz o requisito de PWA; em `localhost` funciona para teste.

**Verificação (Playwright — browser real, 0 erros de console):** boot local (`USE_LOCAL_DB=1`, `data/estado.json` restaurado do backup). `/manifest.webmanifest` → 200 `application/manifest+json`, JSON válido (name, 3 ícones, standalone); `/sw.js` → 200 `application/javascript` com `Service-Worker-Allowed: /`; ícones → 200 `image/png`. No browser: link do manifest + theme-color + apple-touch-icon no `<head>`; **SW registrado, `active`, escopo `http://localhost:5300/`, controlando a página**; cache `dnd-toolkit-v1` com o shell precacheado (`style.css` + `offline.html`); fallback offline disponível.

**Como reverter:** restaurar `versoes/2026-07-10-fase17-3-pwa/`, apagar `static/sw.js`/`manifest.webmanifest`/`offline.html`/`icons/` e as rotas `/sw.js` e `/manifest.webmanifest`. (Para desinstalar o SW de um browser: DevTools → Application → Service Workers → Unregister.)

**Próximo (Fase 17):** 17.1 — reorganizar a tela do Mestre (~12 abas) em 3 modos (🎲 Jogar / 📝 Preparar / 📖 Consultar); 17.2 — enxugar a tela do jogador. (17.3 PWA entregue.)

---

## 2026-07-10 — Fase 16.5: tabuleiro com toque + travar + redimensionar

**Backup antes da alteração:** `versoes/2026-07-10-fase16-5-toque-refinos/` (HEAD 16.4 de `app.py`, `tabuleiro.js`, `style.css`).

**Resumo:** Refinos do tabuleiro ao vivo, focados em uso real na mesa/celular:
- **Toque (Pointer Events):** o arrasto foi reescrito de `mouse*` para `pointer*` + `setPointerCapture` e os tokens ganharam `touch-action:none`. Agora **funciona com dedo no celular** e com mouse/caneta — o mesmo código para todos. (Bônus: o arrasto ficou mais robusto — o Playwright consegue arrastar de ponta a ponta, o que antes travava.)
- **Travar jogadores:** botão do Mestre **🔓 Travar / 🔒 Travado** (`tabuleiro.travado`). Travado, os jogadores não movem os próprios tokens (o servidor rejeita e a UI mostra "🔒 …travou o movimento"); o Mestre continua movendo tudo.
- **Redimensionar token:** o Mestre **toca/clica num token para selecioná-lo** (destaque amarelo + barra "Selecionado: <nome>") e usa **🔎− / 🔎＋** para mudar o tamanho (passos 0.7→2.0, via `transform: scale`). Vale para PJ e monstro. Da barra do selecionado o Mestre também **🗑 Remove** um monstro (jeito de remover amigável ao toque, além do duplo-clique).

**Modelo de dados:** aditivo — `tabuleiro.travado` (bool) e `tam` por token (`tokens[fid].tam`, `monstros[id].tam`). Retrocompatível (sem `tam` = 1×).

**Ficheiros:**
- `static/js/tabuleiro.js` — arrasto em **Pointer Events** com detecção de toque-vs-arrasto (tap seleciona, arraste move); estado `travado` + `selecionado`; barra do Mestre com travar + controles do selecionado; `passoTam`/`tamDe`; `salvarToken` agora envia move e/ou `tam`; `render` aplica `scale(tam)` e destaque da seleção (assinatura inclui travado/selecionado).
- `app.py` — `ESTADO_PADRAO.tabuleiro.travado`; `POST /api/tabuleiro` aceita `travado`; `POST /api/tabuleiro/token` reescrito: move (com **bloqueio se travado** para não-Mestre) e/ou `tam` (**só Mestre**), devolve o `tabuleiro`; `POST /api/tabuleiro/monstro` aceita `tam`.
- `static/css/style.css` — `touch-action:none` no token, destaque `.selecionado`, `.tab-sel-info`, `.tab-aviso`, `.btn-mini.on` na barra.
- `ROADMAP.md` — Fase 16.5 marcada como entregue.

**Verificação (Playwright — browser real, 0 erros de console):** boot local (`USE_LOCAL_DB=1`, `data/estado.json` restaurado do backup ao fim). Selecionar PJ (clique sem arrastar → seleção + barra, sem "Remover"); **redimensionar** (🔎＋ → servidor `tam:1.25`, DOM `scale(1.25)`); **travar** (servidor `travado:true`, botão muda); **arrasto real com Pointer Events** move e persiste (Gandalf → x50, y85.94); jogador com mapa **travado → 403**, **destravado → 200**, e tentativa de `tam` por jogador → 400 (ignorado, só Mestre); selecionar **monstro** mostra "🗑 Remover".

**Como reverter:** restaurar `versoes/2026-07-10-fase16-5-toque-refinos/` ou `git revert`. `travado`/`tam` ficam ignorados sem esta versão.

**Fase 16 (Tabuleiro-imagem) concluída** — 16.1 miniatura, 16.2 imagem no nó + abrir mapa, 16.3 tabuleiro ao vivo (PJs), 16.4 monstros, 16.5 toque/travar/redimensionar. Refinos opcionais que ficaram de fora (dependem de zoom/pan no board, hoje inexistente): **centralizar/seguir** e **medir distância por escala** — podem virar 16.6 se fizerem falta.

**Próximo sugerido:** Fase 17 — UX & PWA (reorganizar o Mestre em 3 modos, enxugar a tela do jogador, virar PWA instalável/offline).

---

## 2026-07-10 — Fase 16.4: tokens de MONSTRO no tabuleiro + no-flicker

**Backup antes da alteração:** `versoes/2026-07-10-fase16-4-monstros/` (HEAD 16.3 de `app.py`, `tabuleiro.js`, `style.css`).

**Resumo:** O tabuleiro ao vivo (16.3) ganhou **tokens de monstro**. O Mestre coloca monstros do bestiário no mapa; eles se movem como os PJs, sincronizados em tempo real. E o board deixou de "piscar" com o poll.
- **Barra do Mestre** (acima do board): select do bestiário (`window.MONSTROS`) + **➕ Colocar**. Cada clique cria uma **instância** com id próprio (dá pra colocar vários goblins).
- **Token de monstro:** quadrado com borda vermelha (distinto do PJ, redondo). Mostra a **imagem** (se houver URL) ou, como fallback, o **ícone da categoria** (👺 Goblinoide, 🐉 Dragão, 💀 Morto-vivo, 🗿 Gigante, 🧑 Humanoide…). Só o **Mestre arrasta** monstros; **duplo-clique** remove.
- **Sincronização:** instâncias vivem em `tabuleiro.monstros[id] = {nome, categoria, imagemUrl, x, y}` → tempo real / poll de fallback, igual aos PJs. Jogador vê os monstros (sem poder mover).
- **No-flicker (correção de qualidade):** o `render()` agora só reconstrói o DOM quando o estado relevante muda (assinatura). Antes, o poll de 3 s reconstruía o board ocioso — causava flicker e chegava a "soltar" um token durante o arrasto. Agora o poll ocioso é no-op e o arrasto fica estável.

**Modelo de dados:** aditivo — `tabuleiro.monstros`. Retrocompatível.

**Ficheiros:**
- `static/js/tabuleiro.js` — `CATEGORIA_ICONE` + `monstrosNoTabuleiro`; `render` desenha a barra do Mestre + tokens de monstro; arrasto generalizado (`data-kind` pj|monstro, `data-id`) com POST por tipo; `salvarMonstro` (add/mover/remover) + duplo-clique remove; **detecção de mudança** (`ultimaChave`) evita reconstruir sem mudança.
- `app.py` — `ESTADO_PADRAO.tabuleiro.monstros`; novo endpoint **`POST /api/tabuleiro/monstro`** (só Mestre): sem id → adiciona (id `m_<hex>`, default no topo); id+x,y → move (clamp 0..100); id+`remover` → remove. Devolve o `tabuleiro` atualizado.
- `static/css/style.css` — `.tab-mestre-barra`, `.tab-token-monstro`/`.tab-mon-ic`/`.tab-mon-img` (quadrado, borda de perigo).
- `.gitignore` — ignora `.playwright-mcp/` (artefatos de teste do browser).
- `ROADMAP.md` — Fase 16.4 marcada como entregue.

**Verificação (Playwright — browser real, 0 erros de console):** boot local (`USE_LOCAL_DB=1`, `data/estado.json` restaurado do backup ao fim). Mestre coloca monstro (1 clique = **exatamente 1** token — medido; sem duplicação), ícone de categoria como fallback; **arrasto com mouse real** move o token e **persiste no servidor** (Goblin → x 46.28, y 33.84) — o que valida também o arrasto de PJ da 16.3 (mesmo handler); **duplo-clique remove** (some do servidor e do DOM); endpoint é **só do Mestre** (jogador barrado). Com a detecção de mudança, o `mousedown` não destaca mais o token (o poll ocioso virou no-op).

**Como reverter:** restaurar `versoes/2026-07-10-fase16-4-monstros/` ou `git revert`. `tabuleiro.monstros` fica ignorado sem esta versão.

**Próximo:** Fase 16.5 — refinos: redimensionar token, "travar" movimento do jogador, centralizar/seguir, medir distância, e **suporte a toque** (o arrasto hoje é só mouse).

---

## 2026-07-10 — Fase 16.3: Tabuleiro-imagem AO VIVO (tokens dos PJs)

**Backup antes da alteração:** `versoes/2026-07-10-fase16-3-tabuleiro-vivo/` (HEAD 16.2 de `app.py`, `aventura.js`, `app.js`, `jogador.js`, `style.css`, `mestre.html`, `jogador.html`).

**Resumo:** O mapa aberto pelo Mestre (Fase 16.2) agora é um **tabuleiro ao vivo**: renderiza a imagem e um **token por PJ** posicionado em **%**, que se move **livremente** sobre a imagem, **sincronizado em tempo real**.
- **Mestre** (aba 📖 Aventura, abaixo da condução): board aparece quando o mapa está aberto; **arrasta qualquer token**.
- **Jogador** (nova aba **🗺️ Mapa**): vê o mesmo board; **arrasta só o token da própria ficha** (donoUid); os demais ficam travados. Sem mapa aberto, mostra "O Mestre ainda não abriu nenhum mapa."
- **Token** = `miniaturaFichaHtml` (miniatura por URL ou **símbolo da classe** como fallback) + nome. Sem grelha (posição livre). **Sem depender do Firebase Storage** (decisão do Ismaile 10/07): miniatura só se já houver URL; senão símbolo.
- **Sincronização:** posições vivem em `tabuleiro.tokens[fichaId] = {x,y}` no estado da campanha → o tempo real (Firestore) leva a todos. Sem RT (local/LAN), o módulo faz um **poll leve** (3 s) de fallback. Ao soltar o token, um único POST grava a posição (não durante o arrasto).

**Modelo de dados:** aditivo — `tabuleiro.tokens` (mapa fichaId→{x,y} em %). Retrocompatível.

**Ficheiros:**
- **Novo** `static/js/tabuleiro.js` — `window.Tabuleiro` (init/sync/refresh/render), usado nas duas telas; desenha imagem+tokens, arrasto com trava por posse, POST no fim, poll de fallback sem RT.
- `app.py` — `ESTADO_PADRAO.tabuleiro.tokens`; novo endpoint **`POST /api/tabuleiro/token`** (qualquer membro; Mestre move qualquer, jogador só a ficha própria via `_pode_usar_ficha`; valida coords 0..100).
- `templates/mestre.html` — `<div id="tabuleiroMestre">` na aba Aventura + carrega `tabuleiro.js` antes do `app.js`.
- `templates/jogador.html` — aba **🗺️ Mapa** + `<section id="mapa">` com `#tabuleiroJogador` + carrega `tabuleiro.js` antes do `jogador.js`.
- `static/js/app.js` e `static/js/jogador.js` — slice `tabuleiro` no `RT.ouvir` (sync ao vivo) + `Tabuleiro.init` (Mestre move tudo; jogador respeita `EH_MESTRE`/`MEU_UID`).
- `static/js/aventura.js` — ao Abrir/Fechar mapa, chama `Tabuleiro.sync` para atualizar o board na hora (inclusive sem RT).
- `static/css/style.css` — `.tab-board/.tab-img/.tab-token/.tab-token-nome/.tab-vazio`.
- `ROADMAP.md` — Fase 16.3 marcada como entregue.

**Verificação:** `node --check` (4 JS) + parse do `app.py` (ok). Boot local (`USE_LOCAL_DB=1`, `data/estado.json` restaurado do backup ao fim). **Endpoint (fetch/curl):** Mestre move token → grava `{x,y}`; coords inválidas → 400; ficha inexistente → 404; **jogador move a própria ficha → 200, mas a de outro → 403** (não persiste). **Browser (0 erros de console):** Mestre vê board com 2 tokens (ambos móveis); render posiciona o token na % do servidor (prova o caminho de sync/exibição); Jogador (login real `jogador`) vê a aba Mapa, o token da própria ficha **móvel** na posição que ele gravou e o do Mestre **travado**. O arrasto usa mouse (mousedown/move/up) padrão; a persistência e o render-a-partir-do-estado foram exercitados ponta a ponta.

**Como reverter:** restaurar `versoes/2026-07-10-fase16-3-tabuleiro-vivo/` + apagar `static/js/tabuleiro.js`, ou `git revert`. `tabuleiro.tokens` fica ignorado sem esta versão.

**Próximo:** Fase 16.4 — imagens/tokens de **monstro** no tabuleiro (fallback: ícone do tipo). Depois 16.5 (refinos: redimensionar token, travar movimento, medir distância; e suporte a toque para celular).

---

## 2026-07-10 — Fase 16.2: imagem no nó da aventura + "Abrir mapa para os jogadores"

**Backup antes da alteração:** `versoes/2026-07-10-fase16-2-imagem-no/` (HEAD de `app.py`, `aventura.js`, `style.css`).

**Resumo:** Segunda sub-fase do Tabuleiro-imagem. Cada **nó da aventura** ganha um campo **imagem** (mapa/cena) e o Mestre passa a poder **abrir esse mapa para os jogadores** durante a condução.
- **No editor (vista Lista):** bloco "🗺️ Imagem do nó" com **preview**, **🖼️ Enviar imagem** (upload pro Firebase Storage, reusa `Armazenamento.enviarMapa` da Fase 16.1) **ou colar URL** (a URL funciona já; o upload passa a funcionar quando o Storage for ativado), e **Remover**.
- **No editor (vista Mapa/canvas):** a caixa do nó mostra uma **miniatura** da imagem + um marcador **🗺️** entre os contadores.
- **Na condução (mesa ao vivo):** se o nó atual tem imagem, aparece o mapa + botão **🗺️ Abrir mapa para os jogadores** / **🔒 Fechar**, que grava `tabuleiro.aberto`/`tabuleiro.imagemUrl` no estado da campanha (indicador "🗺️ aberto aos jogadores"). O **render ao vivo com tokens** sobre a imagem é a Fase 16.3; aqui só publicamos o estado.

**Modelo de dados:** aditivo — `no.imagemUrl` (string/URL ou null) e um novo objeto `tabuleiro:{aberto,imagemUrl,atualizadoEm}` no estado da campanha. Retrocompatível: nós/aventuras antigos sem `imagemUrl` simplesmente não mostram imagem.

**Ficheiros:**
- `app.py` — `ESTADO_PADRAO.tabuleiro`; novos endpoints **`GET /api/tabuleiro`** (qualquer membro) e **`POST /api/tabuleiro`** (só Mestre) que atualiza `aberto`/`imagemUrl` (sem imagem força `aberto=false`). Como o estado vive no doc da campanha, flui aos jogadores pelo tempo real junto do resto.
- `static/js/aventura.js` — campo imagem no `cardNoEditor` + binds de upload/URL/remover em `bindListaNos`; miniatura + marcador 🗺️ em `nodeEl`; botão "Abrir/Fechar mapa" na condução (`renderConducao`) + handler; carrega o estado do tabuleiro no `carregarTudo`.
- `static/css/style.css` — `.av-img-wrap/.av-img-preview/.av-img-acoes`, `.ae-node-thumb`, `.av-cond-mapa`.
- `.claude/launch.json` — nova config **`dnd-toolkit-local`** (boot com `USE_LOCAL_DB=1`) para verificação no browser sem tocar o Firestore real.
- `ROADMAP.md` — Fase 16.2 marcada como entregue.

**Backend do nó:** o `imagemUrl` no nó persiste sem tocar no servidor — o PUT `/api/aventuras` guarda a lista inteira (passthrough) e o snapshot de `aventura_ativa` copia a definição completa.

**Verificação:** `node --check` (aventura.js) + parse do `app.py` (ok). Boot local (`USE_LOCAL_DB=1`, `data/estado.json` restaurado do backup ao fim — 0 alterações). **Endpoints (curl):** GET default = fechado; POST abrir com URL → aberto+timestamp; GET confirma; POST fechar mantém a URL; POST sem imagem força `aberto=false`; **jogador é barrado no POST** (mesmo guard dos outros endpoints de Mestre). **Browser (Mestre, 0 erros de console):** o bloco de imagem rende na Lista; colar URL mostra preview + botão Remover; a caixa do canvas mostra miniatura + 🗺️; na condução, "Abrir mapa" → botão vira "Fechar", chip "🗺️ aberto aos jogadores", e `GET /api/tabuleiro` confirma `aberto:true` com a imagem. Estado de teste (tabuleiro/aventura_ativa) encerrado via API depois.

**⚠️ Pré-requisito manual (Ismaile):** o **upload** de imagem só funciona em produção depois de **ativar o Firebase Storage** e publicar `storage.rules` (mesmo pendente da Fase 16.1). O caminho por **URL** já funciona sem isso.

**Como reverter:** restaurar `versoes/2026-07-10-fase16-2-imagem-no/` ou `git revert`. Nós com `imagemUrl` e o campo `tabuleiro` seguem válidos (ignorados sem esta versão).

**Próximo:** Fase 16.3 — Tabuleiro ao vivo (render da imagem + tokens dos PJs em %, arrastar livre, sincronizado; jogador vê no `jogador.html`).

---

## 2026-07-09 — Editor de aventuras: canvas / mapa mental (estilo MindMeister)

**Backup antes da alteração:** `versoes/2026-07-09-editor-canvas-mapa-mental/` (versões do HEAD de `aventura.js` e `style.css`).

**Resumo:** O editor de aventuras (grafo de nós/escolhas) ganhou uma **vista visual de mapa mental**, ao lado da lista de cartões — o "canvas SVG v2" que já estava previsto. No editor há agora um alternador **🗺️ Mapa / 📋 Lista**:
- **Mapa:** cada nó é uma **caixa arrastável** posicionada livremente; as **saídas** viram **setas curvas** desenhadas automaticamente (setas de saída "mortal" saem em dourado). Arrastar da **bolinha ●** de um nó até outro **cria uma saída**; **clicar numa seta remove** a ligação; **arrastar o corpo** move o nó; **duplo-clique** abre a Lista já rolada até os campos completos daquele nó; clicar no ícone marca o nó como **inicial** (⭐). Cada caixa mostra tipo (cor da borda), título e contadores (⚔️ encontro, 🧑 NPCs, ➡️ saídas, 🏁 final).
- **Lista:** exatamente o editor de cartões anterior (narração, notas, encontro, NPCs, saídas), intacto.
- **Posições** ficam em `no.x`/`no.y` (persistem no Salvar). Nós sem posição (aventuras antigas e modelos prontos) recebem um **layout automático em camadas** a partir do nó inicial (esq→dir), sem sobreposição.

**Refinos (mesma sessão):**
- **Zoom** — botões **− / % / ＋** e **⤢ Ajustar** (enquadra tudo), além de **roda do mouse** (zoom ancorado no cursor). O desenho passou a usar coordenadas do canvas (`offsetLeft/Top`), imune ao zoom; o `#aeCanvasScroll` fica com o tamanho já escalado para as barras de rolagem baterem. Zoom clamped a 40–180%.
- **Pan** — arrastar o **fundo** do canvas desloca a vista.
- **Renomear inline** — **duplo-clique no título** vira um input (Enter/blur confirma, Esc cancela); duplo-clique no resto do nó continua abrindo a Lista.
- **Rótulo na seta** — a escolha (`saida.rotulo`) aparece sobre a seta correspondente.

**Decisões (confirmadas pelo Ismaile):** canvas **+** lista convivendo (alternador), e ligações **por arrastar** (tipo MindMeister).

**Ficheiros:**
- `static/js/aventura.js` — `renderEditor` reestruturado (toggle + `#aeCorpo`); vista lista extraída para `renderListaNos`/`bindListaNos` (comportamento idêntico); vista canvas: `autoLayout`, `posicionarNovo`, `renderCanvas`, `nodeEl`, `desenharEdges` (geometria por `offset*` + rótulos), `ligarCanvas` (arrastar-mover, arrastar-ligar, pan de fundo, roda-zoom, remover nó/ligação, marcar inicial, renomear inline, duplo-clique→lista), `aplicarZoom`/`pontoCanvas`/`renomearInline`/`ajustarCanvas`. Remover nó também limpa as saídas que apontavam para ele (nas duas vistas).
- `static/css/style.css` — estilos do canvas (`.ae-canvas-topo`/`.ae-zoom-pct`, `.ae-canvas-wrap` com grid pontilhado + `.ae-panning`, `.ae-canvas-scroll`, `.ae-node`/`.ae-node-handle`/`.ae-node-tit-input`, `.ae-edge`/`.ae-edge-mortal`/`.ae-edge-temp`/`.ae-edge-lbl`, toggle `.ae-vista-toggle`).

**Modelo de dados:** só aditivo — `x`/`y` por nó. Retrocompatível: aventuras/modelos sem coordenadas recebem layout automático ao abrir.

**Verificação:** `node --check` (ok). Boot local (`USE_LOCAL_DB=1`, sem tocar dados reais) + login do Mestre e drive no browser: criar aventura, adicionar nós (posições em cascata), **arrastar-ligar** cria saída + seta, **arrastar-mover** reposiciona, alternar Mapa↔Lista preserva nós/cartões, **salvar+reabrir preserva posições E ligações**. Autolayout no modelo real **Phandelver: 29 nós, 43 setas + 43 rótulos, 0 sobreposições**. Refinos: **zoom** por botão (100→115%, área de scroll 3008→3459px), **−−** (87%), **roda** ancorada no cursor (→97%), **Ajustar** (enquadra a 40%); **mover sob zoom 132%** → Δmodelo 76px = 100/1.32 (conversão de coordenadas correta); **pan** (scrollLeft 0→120); **renomear inline** ("Greenest em chamas" → texto novo via Enter). **0 erros de console.** Dados de teste (`data/aventuras.json`) removidos após a verificação.

**Como reverter:** restaurar `versoes/2026-07-09-editor-canvas-mapa-mental/` ou `git checkout` de `aventura.js`/`style.css`. Aventuras salvas com `x`/`y` seguem válidas na lista.

---

## 2026-07-09 — Fase 16.1: upload p/ Firebase Storage + miniatura na ficha

**Backup antes da alteração:** `versoes/2026-07-09-fase16-1-tabuleiro-miniatura/`.

**Resumo:** Primeira sub-fase do Tabuleiro-imagem. A ficha ganha uma **miniatura** (avatar): no passo 3 do Criador (Identidade) há um botão **🖼️ Enviar miniatura** que sobe a imagem (PNG/WebP sem fundo, ou JPG; teto 5 MB) para o **Firebase Storage** e guarda a URL em `ficha.miniaturaUrl`. Sem imagem — ou em modo LAN/Storage inativo —, tudo cai no **símbolo da classe** como fallback. O avatar aparece no preview do Criador e nos cards de ficha (Mestre e Jogador). Novo helper de upload reutiliza o app/auth do Firebase que o tempo real já usa (mesmo token de `/api/firebase_token`), com degradação suave e mensagens amigáveis quando o Storage ainda não está ativo.

**Ficheiros:**
- **Novo** `static/js/storage.js` — helper `window.Armazenamento` (`enviarMiniatura`/`enviarMapa`, `disponivel()`); valida tipo/tamanho no cliente; progresso; erros amigáveis.
- **Novo** `storage.rules` — regras do Firebase Storage (v1): só autenticado; miniatura só o dono escreve; mapas/monstros autenticado; teto 5 MB e PNG/WebP/JPEG.
- `static/js/firebase-rt.js` — expõe `window.FIREBASE_CONFIG` e `RT.garantirAuth()` para o `storage.js` reutilizar o mesmo app/login (evita duplo `initializeApp`).
- `static/js/regras.js` — helper `miniaturaFichaHtml(f, tam)` (imagem ou símbolo da classe).
- `static/js/criador.js` — `miniaturaUrl` no estado/carregar/salvar; controle de upload+preview no passo 3; avatar no header do preview.
- `static/js/app.js` e `static/js/jogador.js` — avatar nos cards de ficha (`.ficha-card-topo`).
- `static/css/style.css` — estilos do avatar/controle (`.ficha-mini`, `.criador-mini-*`, `.ficha-card-topo`, `.pv-cabecalho-mini`).
- `templates/mestre.html` e `templates/jogador.html` — carregam `firebase-storage-compat.js` + `storage.js` (dentro do bloco `{% if not use_local %}`).
- `templates/_criador.html` — bloco da miniatura no passo 3.
- `ROADMAP.md` — Fase 16.1 marcada como entregue.

**Backend:** nenhuma mudança — a ficha faz passthrough de campos arbitrários, então `miniaturaUrl` persiste no PUT `/api/fichas` sem tocar no servidor.

**Verificação:** `node --check` em todos os JS alterados (ok). Boot local (`USE_LOCAL_DB=1`, sem tocar nos dados reais nem no Firestore) + login do Mestre e drive no browser: o passo 3 rende o controle de miniatura; `#cMiniPreview` e o header do preview mostram o **símbolo da classe** (fallback); em modo local `window.Armazenamento` é `undefined` e a UI degrada com mensagem própria; **0 erros de console**. O caminho de upload real só é exercível depois de ativar o Storage no Console (ver abaixo).

**⚠️ Pré-requisitos manuais (Ismaile, uma vez) para o upload funcionar em produção:**
1. **Ativar o Firebase Storage** — Console → Storage → Começar.
2. **Publicar `storage.rules`** — Console → Storage → Regras → colar → Publicar (fazer o deploy do código ANTES).

**Como reverter:** restaurar `versoes/2026-07-09-fase16-1-tabuleiro-miniatura/`, apagar `static/js/storage.js` e `storage.rules`, ou `git revert`. Fichas com `miniaturaUrl` continuam válidas (campo ignorado sem o helper).

**Próximo:** Fase 16.2 (imagem no nó da aventura + botão "Abrir mapa para os jogadores").

---

## 2026-07-08 — Virada de direção: Tabuleiro-imagem + arquitetura (docs)

**Resumo:** Decisão estratégica (só documentação, sem mudança de código). O **grid virtual** (Fases 14 e 15) fica **dormente** e é substituído por um **Tabuleiro-imagem sem grelha**: o nó da aventura recebe uma imagem, o Mestre a abre para os jogadores, e tokens (miniatura da ficha — PNG/WebP sem fundo — ou símbolo da classe; monstros depois) se movem **livremente** sobre a imagem, em tempo real. Definido também: **web-first + PWA** (não desktop nativo agora); separação **preparação (offline) × mesa ao vivo (sync)**; canal da mesa por **nuvem (Firebase) e/ou LAN**; e **imagens no Firebase Storage**. Tudo detalhado no novo `docs/ARQUITETURA.md`, com o roadmap novo (Fase 16 Tabuleiro, Fase 17 UX & PWA).

**Ficheiros:**
- **Novo** `docs/ARQUITETURA.md` — decisões + spec do tabuleiro + Fases 16/17.
- `ROADMAP.md` — Fases 14/15 marcadas dormentes; abertas as Fases 16 e 17.

**Próximo:** Fase 16.1 (upload p/ Firebase Storage + miniatura na ficha).

---

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
