# Livro-jogo — o processo de montar aventuras jogáveis

Guia de referência: como transformar uma aventura (publicada ou própria)
em conteúdo jogável dentro do toolkit, e o roadmap do que falta para os
jogadores participarem. A primeira aventura feita com este processo é o
**Ninho da Rainha Dragão — Greenest em Chamas** (`static/js/aventurasprontas.js`),
que serve de exemplo em todos os passos.

---

## Parte 1 — O processo (pipeline de conteúdo)

Ordem recomendada para adicionar uma aventura nova. Cada passo tem o
ficheiro onde mexer e o teste que garante a qualidade.

### 1. Bestiário primeiro (`static/js/monstros.js`)
Liste todas as criaturas que a aventura usa e confira o que já existe no
bestiário. O que faltar, adicione ANTES de escrever os nós:
- Formato: mesmo shape dos monstros existentes (`nome`, `categoria`,
  `ca`, `hp`, `atributos`, `cr`, `pe`, `tracos`, `acoes`).
- Vilões com nome próprio entram como monstros individuais (ex.:
  `Langdedrosa Cyanwrath (Meio-Dragão)`, `Frulam Mondath (Sacerdotisa
  do Culto)`) — categoria própria da facção ajuda o filtro (ex.:
  `Culto do Dragão`).
- Regras especiais de condução (moral, duelo de honra) vão nos `tracos`
  — o Mestre vê no cartão do bestiário e no combate.
- **Adicione `loot`** a cada monstro novo (Fase 13): `ouroFormula`,
  `itensGarantidos` (chefes: é aqui que entram documentos-gancho, como
  os registos de Mondath) e `tabela` ponderada.
- Criaturas de nível muito acima da mesa (ex.: Lennithon, CR 16) entram
  MESMO ASSIM, com um traço `AVISO AO MESTRE` explicando como conduzir
  sem TPK.

### 2. NPCs de história (banco M4 / Fase 11)
Aliados e figuras sociais (Nighthill, Leosin, Linan Swift) não são
monstros: são NPCs da campanha. Hoje o Mestre cria-os manualmente na aba
NPCs; o passo futuro "NPCs por nó" (ver Parte 2) vai deixá-los embutidos
na própria aventura.

### 3. O grafo de nós (`static/js/aventurasprontas.js`)
Estruture os episódios como grafo. Padrões que funcionaram no Ninho:
- **Ponto 0 com 3-5 escolhas** de tom diferente (heroica, prudente,
  temerária 💀, covarde 🚧).
- **Hub central** por episódio (a fortaleza) para onde as missões voltam
  — é o que faz o grafo ser rede, não árvore.
- **Becos e mortes SINALIZADOS** (`aviso: 'beco' | 'mortal'`): o jogador
  arrisca sabendo; as notas do Mestre sempre oferecem alternativa a TPK
  (captura, inconsciência, resgate).
- **Tipos de nó** guiam o ritmo: `narracao` (transições), `encontro`
  (combate — preencher `encontro: [{nome, qtd}]` com nomes EXATOS do
  bestiário), `social` (decisões/roleplay), `assalto` (infiltração com
  CDs sugeridas nas notas), `descanso`, `final` (com `resultado`).
- **`narracao`** = o que se lê aos jogadores; **`notasMestre`** = como
  conduzir (CDs, moral dos inimigos, consequências de cada escolha).
  As duas SEMPRE preenchidas — é o que torna a aventura utilizável por
  Mestre iniciante.
- **Decisão moral** em nó `social` sem resposta certa (os ovos) marca a
  campanha mais que qualquer combate.
- Finais múltiplos: pelo menos 1 vitória, 1-2 derrotas jogáveis e 1
  final neutro digno (one-shot).

### 4. Validação automática (sempre, antes de commitar)
- `node --check` nos ficheiros tocados.
- Harness do grafo: `validarAventura` tem de devolver **0 erros e 0
  avisos** (órfãos, becos não marcados, caminho de vitória) e todos os
  nomes de `encontro` têm de existir em `MONSTROS` (o harness
  `test-k2b.js` já cobre tudo — ver CHANGELOG de 05/07/2026).

### 5. Teste de mesa (manual, no preview)
Importar o modelo → Iniciar → percorrer o caminho feliz e um caminho de
morte → lançar um encontro no combate → gerar o loot ao vencer.

---

## Parte 2 — Roadmap: o que falta para OS JOGADORES jogarem

Estado atual: o livro-jogo é uma ferramenta do MESTRE (ele lê, conduz,
escolhe). Os passos abaixo, em ordem, transformam-no em experiência dos
jogadores. (Espelhado na secção K2 do `ROADMAP-FUTURO.md`.)

### P1. Escolhas na tela dos jogadores ✅
> **✅ Entregue em 05/07/2026** — aba "📖 História" no jogador (narração
> pública, sem `notasMestre`), botão "🗳️ Abrir escolhas aos jogadores"
> na condução, votação com troca de voto e contagem por saída; avançar
> de nó fecha e limpa a votação (ver `CHANGELOG.md`).
> Limitação conhecida: contas legadas partilhadas (login fixo "jogador")
> contam como UM votante — cada jogador com conta própria vota
> individualmente.

### P2. NPCs por nó ✅
> **✅ Entregue em 06/07/2026** — cada nó tem `npcs: [{nome, tipo,
> descricao, notasPrivadas}]` embutidos (auto-contidos, sem referências
> a ids externos). Na condução, cada NPC aparece como cartão com botão
> "👁️ Apresentar aos jogadores" → `window.npcAdicionarExterno` (npc.js,
> dono único do array de NPCs) cria o NPC na campanha VISÍVEL, sem
> duplicar (dedup por nome). Editor de nós ganhou a secção de NPCs; a
> aventura pronta do Ninho traz 6 nós com o elenco (Nighthill, Linan,
> Cyanwrath, Leosin, Mondath, Nesim). Ver `CHANGELOG.md`.

### P3. Partilha e limites ✅
> **✅ Entregue em 10/07/2026** — botão **📥 De um membro** na aba Aventura:
> `GET /api/aventuras/<uid>` (só-Mestre, valida membresia como o
> `banco_npc/<uid>`) lê a biblioteca de um membro e o Mestre copia uma
> aventura para a sua (id novo). E `avisosLimites` compara as fichas da
> mesa (`ficha.nivel`) com `limites` ao **Iniciar**, mostrando avisos
> NÃO-bloqueantes no confirm. Ver `CHANGELOG.md`.
> Nota: a partilha precisa de campanha REGISTADA (contas com meta); em
> campanha legada degrada com aviso "sem membros geridos".

### P4. Canvas visual (editor v2)
Grafo desenhado em SVG puro (nós arrastáveis, setas, nó atual destacado,
caminho percorrido pintado). A lista atual continua como modo compacto.

### P5. Grid por nó (depende da Fase 14)
Campo `gridId` no nó: cada cena de combate/assalto abre já com o seu
mapa (posições iniciais, obstáculos). O grafo não sabe de mapas — só
aponta. É o que falta para "cada nó com o seu tabuleiro".

### P6. Loot e XP integrados à condução ✅
> **✅ Entregue em 13/07/2026** — no nó de encontro da condução: botão
> **🎲 Loot do nó** (reusa `rolarLootEncontro` da Fase 13; expande o
> encontro numa entrada por criatura via `entradasDoEncontro`, mostra
> ouro + itens e **💰 Dividir ouro pelo grupo**) e **🏅 Enviar XP ao
> grupo** (XP bruto = `xpDoEncontro` = soma de `pe × qtd`, dividido
> pelas fichas vivas → `ficha.xp`, respeitando **B2**). Itens seguem
> distribuídos por "📦 Enviar à ficha". Ver `CHANGELOG.md`.

Ao completar nó de encontro: botão "🎲 Loot do nó" (Fase 13 já cobre os
monstros abatidos) + sugestão de XP (soma dos `pe` do encontro) com
envio via "📦 Enviar à ficha" (respeitando a regra B2: só o Mestre dá
XP/ouro).

### P7. Mais aventuras prontas 🔄
Phandelver (CT1) escrito neste formato; depois, one-shots curtos (3-5
nós) como material de demonstração para Mestres novos.
> **1º one-shot original entregue em 13/07/2026** — **A Cripta do Sino
> Silencioso** (`modelo_cripta_sino_silencioso` em `aventurasprontas.js`):
> 14 nós, nível 1-3, conteúdo próprio (não reproduz módulo publicado).
> Hub + escolha moral sem resposta certa (o pacto sob o sino) + becos/
> mortes sinalizados com alternativa clemente + finais múltiplos (vitória/
> derrota/neutro). Monstros só do bestiário (Esqueleto, Rato Gigante,
> Lodo Cinzento, Carniçal, Cultista, Wight — todos com loot da Fase 13).
> `validarAventura` → 0 erros / 0 avisos. Próximos: mais capítulos de
> Phandelver e outros one-shots.

---

## Referência rápida do formato

```jsonc
{
  "id": "modelo_x", "titulo": "...",
  "limites": { "jogadoresMax": 5, "nivelMin": 1, "nivelMax": 4 },
  "noInicial": "n0",
  "nos": [{
    "id": "n0", "titulo": "...",
    "tipo": "narracao|encontro|social|assalto|descanso|final",
    "narracao": "lido aos jogadores",
    "notasMestre": "só o Mestre vê",
    "resultado": "vitoria|derrota|neutro",     // só tipo final
    "encontro": [{ "nome": "<nome EXATO em MONSTROS>", "qtd": 4 }],
    "saidas": [{ "para": "n1", "rotulo": "escolha", "aviso": "|mortal|beco" }]
    // futuros: "npcs": [], "gridId": null
  }]
}
```
