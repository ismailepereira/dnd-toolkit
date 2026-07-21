# 🗺️ Roadmap — Fichas por Classe & Combate

Plano de melhoria nascido da **mesa de 18/07/2026**: dificuldades reais com Paladino,
Clérigo e Druida na criação, e fricções no combate (magias invisíveis, azagaias
repetidas, arma arremessada sem controle). Cada item aponta a dor que o originou.

**Legenda:** `[ ]` a fazer · `[~]` em andamento · `[x]` pronto ·
🔴 primeiro · 🟠 em seguida · 🟡 depois

**Ordem recomendada de execução:** C1 → F1 → C2+C3 (juntos, mexem no mesmo código) → F2 → C4 → C5 → F4 → F3b → C6 → C7 → F5.
Um item por sessão de trabalho; cada entrega com teste de regressão (a suíte `tests/` já cobre Criador, servidor e Modo de Jogo).

---

## ✅ Já entregue (da mesma leva de feedback)

- [x] **Druida sem forma animal** → 🐺 Forma Selvagem completa (19/07): catálogo de 26 feras por ND,
  regras do PHB por nível (2/4/8 + Círculo da Lua), painel no Modo de Jogo com transformar/reverter,
  PV da fera e dano excedente. `formaselvagem.js`.
- [x] **Bug do Clérigo** "avisa 4 magias, só marca 3" (19/07): o +1 racial em SAB não re-renderizava o
  painel de magias. Corrigido + regressão em teste.
- [x] **Divindades/patronos** com aba própria, explicação de quem-é/para-quê e validação por classe (18/07).

---

## FASE F — Criação de ficha por classe

### F1 ✅ Paladino compreensível do nível 1 ao 3 — ENTREGUE 19/07
**Dor relatada:** "o paladino não tinha nenhuma habilidade inicial a não ser cura, e estava confuso."

- [x] **Recurso "Sentido Divino"** no Modo de Jogo (`recursosDeClasse`): 1 + mod CAR usos/descanso longo —
  agora aparece rastreável ao lado da Cura pelas Mãos (antes só a cura, por isso "só cura").
- [x] **Painel do Paladino no Criador** reescrito: card de Sentido Divino, seção "O que você faz já no
  nível 1" e **aviso honesto no nível 1** (magia + Estilo de Luta + Punição chegam no N2, Juramento no N3 —
  "muitas mesas começam o Paladino no nível 2-3").
- [x] **Punição Divina jogável** (nv2+): bloco "⚡ Punição Divina" com um botão por círculo disponível
  ("1º espaço → 2d8"), checkbox "alvo é morto-vivo/ínfero (+1d8)"; gasta o espaço, **rola o dano radiante**
  (2d8 base, +1d8 por círculo acima, teto 5d8) e registra no Histórico. Botão apaga sem espaço; aviso da
  Punição Aprimorada (N11).
- [x] **Auras (nv6+)** como bloco passivo "🛡️ Auras (sempre ativas)" com o valor do Carisma e o alcance
  (3m, 9m no N18) — Proteção (N6) e Coragem (N10).

### F2 🔴 Auditoria "kit de estreia" das 12 classes (níveis 1-3)
**Dor generalizada:** classes cuja abertura confunde. Para CADA classe, garantir os 3 pontos:
(a) painel do Criador explica TODAS as características iniciais em linguagem de mesa;
(b) todo recurso gastável aparece rastreável no Modo de Jogo; (c) toda ação especial tem botão ou card, não só texto.

- [ ] Tabela de auditoria (classe × o que falta) preenchida e commitada neste doc.
- [ ] Lacunas conhecidas já mapeadas: **Sentido Divino** (Paladino, → F1) · **Destruir Mortos-Vivos** do
  Clérigo nv5 sem botão · **Ataque Furtivo** do Ladino é só dica (→ C4) · **Bardo**: Inspiração existe, mas
  sem lembrete de a QUEM deu · **Feiticeiro**: Pontos de Feitiçaria sem conversão slot↔ponto no clique.
- [ ] Cada classe corrigida = 1 commit pequeno com caso E2E.

### F3 🟠 Druida — fechamento das pendências da Forma Selvagem
- [x] Catálogo por nível + transformar/reverter (19/07).
- [ ] **F3b — Forma Elemental** (Círculo da Lua nv10): gastar 2 usos para virar Elemental do Ar/Terra/Fogo/Água
  (4 formas novas no catálogo com stats).
- [ ] Conjuração Atemporal (nv18): liberar o painel de magias mesmo com forma ativa.

### F4 🟠 Cartão-resumo de combate no fim do Criador ("cola" do jogador)
**Dor de fundo:** jogador novo termina a ficha sem saber o que faz no turno.
- [ ] Etapa final ganha um cartão gerado: "Seu personagem em combate" — ataque principal com bônus/dano,
  melhor truque/magia com CD, recurso de classe a lembrar, CA/PV/deslocamento. O mesmo cartão sai no PDF.

### F5 🟡 Subclasses com efeito mecânico completo
- [ ] Domínios do Clérigo: magias de domínio ganhas automaticamente (sempre preparadas, sem contar no limite).
- [ ] Juramentos do Paladino (nv3): magias de juramento + Canalizar Divindade específico do juramento.
- [ ] Patronos do Bruxo: magias expandidas do patrono aparecendo na lista de escolha.

---

## FASE C — Combate (Modo de Jogo)

### C1 ✅ Magias como cartas de ação (igual às armas) — ENTREGUE 19/07
**Dor relatada:** "no combate não fica disponível as magias para uso, somente algumas armas."

- [x] Painel **"✨ Conjuração"** logo abaixo de "Ataques de Arma": um card por truque/magia castável com
  **CD e ataque mágico no cabeçalho** (por classe, em multiclasse), dano/DT, alcance, tempo com ícone
  (🎯 ação / ⚡ bônus / ↩️ reação) e 🧠 concentração.
- [x] Botão **"✨ Conjurar"**: gasta o espaço do círculo certo com 1 clique — com **upcast automático**
  (círculo base esgotado → usa o menor acima, marcado "(2º↑)") e suporte à Magia de Pacto do Bruxo;
  marca a concentração sozinho e registra no Histórico.
- [x] "Castável agora": card sem espaço fica apagado com botão desabilitado; truques sempre acesos.
- [x] Escalonamento de truques por nível do personagem (nv5/11/17 → "2× 1d10" no card).

### C2 ✅ Itens repetidos agrupados com quantidade — ENTREGUE 19/07
**Dor relatada:** "azagaia se repete muito; se tem mais de uma coloque a quantidade."

- [x] **Ataques de Arma**: uma linha só com contagem — "Azagaia: +5 · 1d6+3 perfurante ×4".
- [x] **Slots de equipar** (mão principal/secundária): opção única com "(×4)" no rótulo.
- [~] PDF e preview já agregam pela Bolsa; a lista de ataques do PDF fica para uma passada futura (baixa
  prioridade — o combate acontece no Modo de Jogo).

### C3 ✅ Armas de arremesso com controle de lançada/recuperada — ENTREGUE 19/07
**Dor relatada:** "e se recuperou a arma…" — azagaia lançada some da mão e ninguém controla.
- [x] Botão **"🎯 lançar"** em toda arma com propriedade `arremesso` (Azagaia, Adaga, Lança, Machadinha,
  Martelo Leve, Tridente, Dardo…): decrementa "em mãos" e soma em "no chão"; a linha mostra
  "×4 (3 em mãos · 1 no chão)".
- [x] Botão **"↩️ Recuperar armas arremessadas"** devolve tudo para a mão; aparece só quando há algo no chão.
- [x] Sem unidades em mãos → aviso "nenhuma em mãos" e os botões de atacar/lançar desabilitam.
- [x] Descanso longo recolhe automaticamente o que foi arremessado.

### C4 ✅ Golpes especiais pós-acerto com botão — ENTREGUE
- [x] Paladino: Punição Divina — entregue junto com o F1 (19/07).
- [x] Ladino: bloco "🗡️ Ataque Furtivo (Xd6)" com o dado certo por nível (⌈nível/2⌉d6), rola e registra no
  Histórico; destaca em verde quando a condição tática (aliado adjacente ao alvo / corpo a corpo) vale. (20/07)
- [x] Bárbaro: dano da Fúria somado automaticamente no ataque **corpo a corpo com Força** enquanto "Em Fúria"
  (+2/+3/+4 por faixa de nível), com selo 🔥 no dano (que já entra no botão de rolar) e aviso no cabeçalho;
  não se aplica a ataques à distância nem com Destreza. (20/07)

### C5 🟠 Rolagem integrada nos cards — ENTREGUE (magias) 20/07
- [x] **Magias:** cada card da ✨ Conjuração ganhou 🎲 — "🎲 atacar" nas magias de ataque (d20 + ataque
  mágico, respeita vantagem/desvantagem) e "🎲 dano"/"🎲 cura" com a fórmula certa (dado do truque escalado
  por nível, +modificador de conjuração na cura); tudo registra no Histórico. Respeita o modo Dado Físico.
- [x] **Armas** já tinham 🎲 atacar / 🎲 dano (pré-existente) — C5 estendeu o padrão às magias.

### C6 🟡 Efeitos dos ataques → condições com 1 toque
- [ ] Ataque com efeito conhecido (Lobo derruba CD 11, teia prende…) sugere aplicar a condição no alvo
  selecionado do combate ("Aplicar 'Caído' em Goblin 2?").

### C7 🟡 Economia de ação do turno
- [ ] Marcadores Ação/Bônus/Movimento/Reação no painel do turno: clicar num card marca o gasto; "▶ Próxima
  rodada" limpa. Evita o "já ataquei este turno?" da mesa remota. (absorvido pela FASE T abaixo)

---

## FASE T — Fluxo de turno em combate (pedido do Ismaile, 20/07)

**A visão:** ao iniciar o combate, o personagem da vez vê **todas as suas ações e habilidades** num só lugar,
com controle de turno ("é a sua vez" → agir → **finalizar turno** → passa para o próximo pela iniciativa),
e cada magia (inclusive as que **não causam dano**) tem um botão que mostra **o que ela faz** e outro para
**usar** — já descontando o espaço de magia na ficha.

**O que JÁ existe hoje (não rebuildar):**
- **Painel "Combate" do Mestre** (`app.js`): iniciativa, ordena por iniciativa, "próximo turno", rodadas,
  dano/cura, ações de monstro, alvo selecionado.
- **Modo de Jogo do jogador** (`jogo.js`): blocos ricos já prontos — **✨ Conjuração** (um card por magia,
  **incluindo as sem dano**, com botão **✨ Conjurar que já desconta o espaço** + 🎲 atacar/dano da C5),
  Ataques de Arma, Punição/Furtivo/Fúria, recursos de classe, e o painel **"O teu turno"** (ações/bônus/
  movimento/reação com dicas).
- **Conclusão:** o "botão de usar a magia que deduz o espaço, inclusive as sem dano" **já está pronto** desde a
  C1. Provavelmente só falta o **deploy** dessa leva — ou você estava vendo o painel do Mestre (que não mostra
  as magias do PC), não o Modo de Jogo do jogador.

**O que realmente falta (as partes desta fase, uma por vez):**
- [ ] **T1 — "o que faz" no card de magia** (pequeno): cada card da ✨ Conjuração vira expansível (clica →
  mostra a descrição completa da magia), com o botão **Conjurar** (que já deduz o espaço) ao lado. Cobre o
  pedido "um botão que mostra o que ela faz e outro de usar" — vale para magias de utilidade sem dano.
- [ ] **T2 — "É a sua vez" no Modo de Jogo** (médio): quando o combate está ativo e a iniciativa aponta para
  a ficha aberta, destaca no topo ("⚔️ É a sua vez — Rodada X") e mostra **✔️ Finalizar meu turno**, que
  avança a iniciativa no painel do Mestre (fonte única do turno — sem segundo contador).
- [ ] **T3 — Painel de ações do turno unificado** (médio): ao iniciar o turno, reúne num só lugar as ações
  disponíveis do personagem — ataques, magias castáveis (com Conjurar/🎲) e poderes de classe — com
  marcadores de **Ação / Ação Bônus / Movimento / Reação** que registram o gasto; "Finalizar turno" limpa.
  (junta o "O teu turno" atual com os cards já existentes; **absorve a C7**.)
- [ ] **T4 — Iniciativa pelo jogador** (pequeno/médio): o próprio jogador rola e entra na iniciativa (hoje é
  o Mestre que monta a ordem), e vê "quem é o próximo".
- [ ] **T5 — Ações do PC visíveis no tracker do Mestre** (médio): no combatente PC, o Mestre vê as magias/
  poderes escolhidos (não só os ataques), para conduzir o turno do jogador presencial.

**Ideias/decisões de projeto (recomendações):**
- **Reusar, não duplicar:** os cards de magia/arma já existem e já descontam recursos. A FASE T deve
  *rotear* esses cards para o fluxo de turno, nunca recriar um segundo sistema de magia.
- **Uma fonte única de "de quem é a vez":** o `combate.turno`/iniciativa do painel do Mestre manda; o "é a
  sua vez" do jogador apenas lê e reflete. Evita dessincronizar dois contadores.
- **Guiar, nunca travar:** o fluxo sugere e marca gastos, mas o jogador/Mestre sempre pode agir fora da
  ordem (a mesa improvisa). Nada de bloquear ações.
- **Ordem sugerida:** T1 (rápido, fecha o pedido das magias sem dano) → T2 (liga jogador↔turno) → T3 (o
  painel unificado, o coração da fase) → T4/T5.

---

## Critérios de pronto (valem para TODOS os itens)

1. Regra confere com o PHB/SRD (citar a página/tabela no commit quando houver dúvida).
2. Funciona no fluxo real (teste E2E no navegador, não só unit).
3. Entra no `CHANGELOG.md` com backup em `versoes/`.
4. Nada de texto em inglês na UI; termos oficiais em PT-BR com o nome em inglês entre parênteses quando ajudar a buscar.
