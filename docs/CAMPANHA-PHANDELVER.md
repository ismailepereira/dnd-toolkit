# Campanha completa — Mina Perdida de Phandelver (plano de criação)

Roadmap de criação, capítulo por capítulo, da campanha completa no formato
livro-jogo do toolkit. Fonte de estudo: notebook pessoal do Ismaile (NotebookLM
"Mina perdida de Phandelver") — usado APENAS para levantar a estrutura
(locais, encontros, NPCs, decisões, itens).

> ⚠️ **Regra de adaptação (obrigatória):** este repo é público. TODO texto de
> narração/notas dos nós é escrito com PALAVRAS PRÓPRIAS, condensado (2-4
> frases por nó) — **nunca copiar texto do módulo** (material da Wizards).
> Nomes de locais/NPCs/criaturas e fatos mecânicos (CDs, quantidades, efeitos)
> são usáveis; prosa do livro, não. Mesmo padrão já usado no Cap. 1 (CT1) e
> no pipeline do `docs/LIVRO-JOGO.md`.

**Estado:** Cap. 1 ("Emboscada Goblin", 14 nós, nível 1-2) ✅ entregue em
08/07/2026 (`modelo_phandelver_emboscada` em `aventurasprontas.js`).
**Formato:** UMA aventura importável por capítulo (`modelo_phandelver_<cap>`),
grafo validado (0 erros / 0 avisos no `validarAventura` + nomes de encontro
EXATOS do bestiário). Nível por capítulo via `limites`.

---

## PH0 — Bestiário & itens que faltam (pré-requisito de tudo)

Criaturas a adicionar em `monstros.js` (shape existente + `loot` próprio;
regras especiais de condução nos `tracos`):
| Criatura | Uso | Notas mecânicas |
|---|---|---|
| Grick | Castelo á.8 | camuflado no teto, surpresa; resist. a dano não-mágico |
| Urso-Coruja | Castelo á.13 + trilha | fera CR 3; no castelo está presa/faminta |
| Doppelganger | Castelo á.14 (Vyerith) e Caverna á.18 (Vhalak) | leitura de pensamentos, surpresa com vantagem; 2 instâncias nomeadas |
| Dragão Verde Jovem (Venomfang) | Árvore Trovão | CR 8 — traço AVISO AO MESTRE (foge com metade dos PV; grupo NÃO deve enfrentá-lo de frente) |
| Gosma Ocre | Caverna á.2 | divide-se com dano cortante |
| Aparição/Wraith (Mormesk) | Caverna á.14 | encontro SOCIAL possível (barganha: presente arcano / matar o Espectador) |
| Ramo Seco (Twig Blight) | Árvore Trovão | grupos; vulnerável a fogo; parece arbusto |
| Zumbi das Cinzas | Árvore Trovão | variante: nuvem de cinzas ao 1º dano (Con CD 10 ou desvantagem) |

Opcionais nomeados (reusam stats existentes com nome próprio): Iarno
"Cajavidro" Albrek (Mago), Hamun Kost (Mago), Brughor Machado-Mordedor (Orc
chefe), Gog (Ogro), Rei Grol (Bugbear chefe), Yegg (Goblin Mestre), Lhupo
(Goblin). Nezznar JÁ existe.

Itens mágicos a garantir no catálogo (`itens.js`/`itensmestre.js`, efeito em
1 linha): Talon (espada longa +1) · Cajado da Defesa (+1 CA, cargas p/
armadura arcana/escudo) · Anel de Proteção (+1 CA e salvaguardas) · Hew
(machado +1, dano máximo vs. plantas) · Botas de Correr e Saltar · Varinha de
Mísseis Mágicos (7 cargas) · Poção de Vitalidade · Lightbringer (maça +1,
brilha, +1d6 radiante vs. mortos-vivos) · Dragonguard (peitoral +1, vantagem
vs. sopro de dragão) · Manoplas de Poder de Ogro (FOR 19) · Cajado da Aranha
(+1d6 veneno, 10 cargas: patas de aranha/teia).

---

## PH1 — Cap. 2A: Phandalin (vila, missões e Marcarrubra na rua)

Aventura `modelo_phandelver_phandalin` · nível 2-3 · ~14 nós · tipo dominante: social.
- **n0 chegada** (narração): entrega da carga no Barthen (10 po) → hub.
- **HUB "explorar a vila"** com saídas para cada local (voltam ao hub):
  - Estalagem Stonehill (social): rumores — 3-4 boatos que apontam missões.
  - Barthen Provisões (social): gancho "encontrem Gundren".
  - Leão Escudo (social): missão de Linene — 50 po pelas caixas roubadas (leva ao esconderijo).
  - Câmbio de Minério (social): Halia — 100 po pela morte de Cajavidro + correspondência (segredo: Zhentarim; NPC com notasPrivadas).
  - Pomar Edermath (social): Daran — investigar mortos-vivos no Poço da Velha Coruja (gancho do Cap. 3).
  - Fazenda Alderleaf (social): Carp revela o túnel secreto (abre a entrada alternativa do PH2).
  - Salão do Chefe (social): Harbin — 100 po contra os orcs do Cume da Wyvern (gancho Cap. 3); covarde.
  - Santuário da Sorte (social): Irmã Garaele — barganhar com Agatha (pente de prata; 3 poções de cura) (gancho Cap. 3).
- **n encontro de rua** (encontro): 4× Bandido (Marcarrubra provocam; 1 foge à mansão se 3 caírem) — desbloqueia o PH2.
- **n Sildar em Phandalin** (social): 500 po pelo resgate de Gundren/castelo + 200 po por achar Iarno (ironia: Iarno É Cajavidro — notasMestre).
- **Final do capítulo:** aponta PH2 (esconderijo) e PH3 (estradas).

## PH2 — Cap. 2B: Esconderijo Marcarrubra (Mansão Tresendar)

Aventura `modelo_phandelver_marcarrubra` · nível 2-3 · ~13 nós · masmorra.
- **Duas entradas** (decisão): porta do porão (defesas em sequência) OU fenda
  do túnel do Carp (pula pra á.8, aviso 🚧 no caminho errado).
- Nós de sala (encontros com nomes EXATOS do bestiário):
  á.1 porão (2× Bandido; poções) → á.2 alojamento (3× Bandido, emboscada se
  barulho) → á.4 criptas (3× Esqueleto; senha "Illefarn"/mantos vermelhos
  evitam) → á.5 jaulas (2× Bandido; resgate da família Dendrar — Mirna dá o
  gancho do colar em Árvore Trovão) → á.8 fenda (1× Nothic — social possível:
  suborno com carne/segredos; tesouro Talon) → á.9 (3× Bugbear + Droop;
  Enganação CD 15 com mantos) → á.10 (4× Bandido bêbados/envenenados) →
  á.11 oficina (rato familiar avisa Iarno) → á.12 Cajavidro (Iarno: foge se
  avisado; rende-se com ≤8 PV; Cajado da Defesa + pergaminhos).
- **Decisões-chave:** capturar Iarno vivo (XP dobrado + intriga: Halia o
  solta) vs. matar; entregar a Halia vs. a Sildar (consequências nos finais).
- **Final:** Marcarrubra caem; Phandalin celebra; PH3 aberto.

## PH3 — Cap. 3A: A Teia da Aranha (sandbox das estradas)

Aventura `modelo_phandelver_teia` · nível 3-4 · ~18 nós · hub de viagem.
- **Hub "estradas"** com 4 destinos + nós de viagem com encontro aleatório da
  Trilha Triboar (tabela nos notasMestre: stirges, carniçais, ogro, goblins,
  hobgoblins c/ cartaz de recompensa, orcs, urso-coruja).
- **Conyberry/Agatha** (social, sem combate): UMA pergunta — grimório de
  Arco Suave (missão Garaele) OU a localização do castelo; pente de prata =
  sucesso automático, Persuasão CD 15 sem ele; desrespeito = perde pra sempre.
- **Poço da Velha Coruja**: 12× Zumbi + Hamun Kost (social possível: paz em
  troca de tarefa); loot Anel de Proteção. Completa a missão de Daran.
- **Ruínas da Árvore Trovão** (~5 nós internos): Ramos Secos, Zumbis das
  Cinzas, 2× Aranha Gigante, 6× Cultista (Favric propõe traição), Venomfang
  💀 (AVISO: fugir/negociar; dragão foge com 50% PV). Reidoth dá a localização
  do castelo E das minas. Loot: colar de Mirna (200 po), Hew, pergaminhos.
- **Cume da Wyvern**: 1 vigia + 6× Orc + Brughor + Gog (ogro); furtividade
  evita o alarme. Completa a missão de Harbin (100 po).
- **Pistas do castelo:** qualquer uma entre Agatha/Reidoth/goblins
  interrogados/hobgoblins/bugbears intimidação CD 15 abre o PH4.

## PH4 — Cap. 3B: Castelo Dentefino

Aventura `modelo_phandelver_castelo` · nível 3-4 · ~14 nós · fortaleza.
- Abordagens (decisão): portão principal, porta lateral (Des CD 15), torre em
  ruínas com lona falsa.
- Salas: á.3 arqueiros (4× Goblin, cobertura+alarme) → á.4 (3× Goblin) → á.6
  (4× Hobgoblin) → á.7 salão (7× Goblin + Yegg [Goblin Mestre]; fogem se o
  chefe cai) → á.8 (1× Grick, surpresa do teto) → á.9 santuário (Lhupo
  [Goblin Mestre] + 2× Goblin, emboscada atrás do altar) → á.12 (2×
  Hobgoblin; 1 corre avisar Grol) → á.13 (1× Urso-Coruja presa; carne acalma)
  → á.14 Rei Grol (Bugbear chefe) + 1× Lobo + Vyerith (Doppelganger como
  "drow"): Grol usa Gundren como escudo; Vyerith apunhala pelas costas e, se
  Grol cai, tenta matar Gundren e fugir com o mapa.
- **Resgate:** Gundren inconsciente/espancado; mapa sob o colchão de Grol.
- **Final:** com Gundren + mapa → PH5. Se o mapa se perde, Gundren sabe o
  caminho de memória (rede de segurança nos notasMestre).

## PH5 — Cap. 4: Caverna Onda Eco (final)

Aventura `modelo_phandelver_caverna` · nível 4-5 · ~18 nós · masmorra final.
- á.1 entrada: corpo de Tharden (irmão de Gundren) — peso emocional.
- Encontros por área: á.2 Gosma Ocre (segue o grupo) → á.3 10× Estirge → á.4
  9× Esqueleto → á.6 3× Carniçal → á.8 armadilha de esporos (Con CD 11, 3d6)
  → á.9 7× Carniçal → á.11 5× Bugbear (barricada) → á.12 8× Zumbi + Caveira
  Flamejante (bola de fogo; revive em 1h sem água benta) → á.14 Mormesk
  [Aparição] (social: presente arcano OU pede a morte do Espectador; dá o
  mapa da masmorra inexplorada) → á.15 Forja das Magias: Espectador
  (Enganação CD 15 o dispensa; Forja dá +1 temporário 1d12h em arma/armadura;
  Lightbringer e Dragonguard aqui) → á.18 3× Bugbear + Vhalak (Doppelganger)
  → á.19 TEMPLO: **Nezznar (Mago Drow)** + 4× Aranha Gigante (fica invisível,
  aranhas abrem com teia; doppelganger como falso refém) → á.20 resgate de
  Nundro (irmão vivo).
- Nós utilitários: á.5 cofre (600 pc/180 pp/90 pe/60 po), á.7 depósito
  seguro (descanso), á.10 lago (Varinha de Mísseis Mágicos), á.13 caverna
  estrelada (transição), águas que sobem (á.16-17, tensão).
- **Decisões:** ordem de exploração; barganhas (Mormesk/Espectador); capturar
  Nezznar (se entregue em Phandalin, Halia o solta — gancho pós-campanha).

## PH6 — Finais, integração e polimento

- **Finais múltiplos** (nós `final` em PH5): vitória plena (mina segura,
  10% dos lucros vitalícios; Gundren+Nundro vivos), vitória amarga (irmãos
  mortos), derrota jogável (expulsos da caverna; a mina fica com o Aranha).
- **Ganchos pós-campanha** (notasMestre do final): mansão Tresendar como
  base; a masmorra do mapa de Mormesk; Halia/Zhentarim com Nezznar solto.
- **Integração toolkit:** imagem por nó (`no.imagemUrl` por URL) nos hubs e
  chefes; NPCs por nó (`npcs[]`) nos sociais de Phandalin; `loot` de cada
  criatura nova; conferir XP/nível com o montador de encontros; validar cada
  grafo no harness (0 erros/0 avisos) e testar condução no preview.
- **Antecedente "Herdeiro de Phandalin"** (fontes.js) já liga o Criador à
  campanha — citar no texto de abertura do PH1.

---

## Ordem de execução (1 sub-fase por run da rotina)

PH0 → PH1 → PH2 → PH3 (pode dividir em 3a estradas+2 locais / 3b Árvore
Trovão+Cume) → PH4 → PH5 (pode dividir em 5a áreas 1-13 / 5b áreas 14-20) →
PH6. Cada entrega: backup, grafo validado, CHANGELOG, ✅ aqui e no ROADMAP,
commit+push. Se um capítulo não couber numa run, entregar metade coesa
validada e anotar o ponto de continuação AQUI.

**Progresso:**
- [x] Cap. 1 — Emboscada Goblin (08/07/2026, CT1)
- [x] PH0 — bestiário & itens (14/07/2026: 9 criaturas — as 8 planejadas + Rei Grol — e 9 itens mágicos; Anel de Proteção e Varinha de Mísseis já existiam)
- [ ] PH1 — Phandalin
- [ ] PH2 — Esconderijo Marcarrubra
- [ ] PH3 — Teia da Aranha
- [ ] PH4 — Castelo Dentefino
- [ ] PH5 — Caverna Onda Eco
- [ ] PH6 — finais & integração
