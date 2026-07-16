# Campanha completa — Ninho da Rainha Dragão (plano de criação)

Roadmap de criação, episódio por episódio, da campanha completa no formato
livro-jogo do toolkit. Os **8 episódios** do módulo, fielmente à **estrutura**
(locais, NPCs, encontros, decisões, itens, fatos mecânicos).

> ⚠️ **Regra de adaptação (obrigatória, repo público):** TODO texto de
> narração/notas dos nós é escrito com **palavras próprias**, condensado (2-4
> frases por nó) — **nunca copiar prosa do módulo** (material da Wizards).
> Nomes de locais/NPCs/criaturas e fatos mecânicos (CDs, quantidades, CA/PV,
> efeitos) são usáveis; a prosa do livro, não. Mesmo padrão do Phandelver
> (`docs/CAMPANHA-PHANDELVER.md`) e do arco de Greenest já entregue.

**Formato:** UMA aventura importável por episódio (`modelo_ninho_epN_*`), grafo
validado (0 erros/0 avisos no `validarAventura` + nomes de encontro EXATOS do
bestiário). Nível por episódio via `limites`. O nó de Final de cada episódio
aponta o próximo `id` a importar.

**Nível recomendado por episódio:** Ep1-3 (1→4) · Ep4 (~4) · Ep5 (~5) ·
Ep6 (~5-6) · Ep7 (~6-7) · Ep8 (~7-8).

---

## Estado atual

- [x] **Eps 1-3 — Greenest / Trilha / Chocadouro** ✅ (já entregue):
  `modelo_ninho_rainha_dragao` (36 nós, nível 1-4) — o ataque a Greenest
  (Lennithon, Cyanwrath, Nighthill, o templo, a muralha), a trilha e a
  infiltração no acampamento (Leosin), e o Chocadouro (dracos, salão dos
  fungos, ovos, Mondath, revanche de Cyanwrath) → gancho Castelo Naerytar.
- [x] **Antecedentes de campanha** ✅ (15/07): 5 antecedentes próprios do Ninho
  em `fontes.js`, exclusivos por campanha (um PJ cada).

## NR0 — Bestiário & itens que faltam (pré-requisito dos Eps 4-8)

Criaturas a adicionar em `monstros.js` (shape existente + `loot` próprio):
| Criatura | Uso | Notas |
|---|---|---|
| Fanático do Culto (Cult Fanatic) | Eps 4-8 (onipresente) | conjurador CD 13; Comando/Infligir Ferimentos |
| Homem-Lagarto (Lizardfolk) | Ep6 Naerytar | pântano; prende o fôlego; multiataque |
| Bullywug | Ep6 Naerytar | anfíbio; salto; fala com sapos; camuflagem no pântano |
| Rezmir (Meia-Dragã Negra) | Eps 6/8 (chefe) | sopro de ácido; espada Hazirawn; resist. ácido |
| Talis, a Branca (Meia-Dragã) | Ep7 Refúgio de Caça | sopro de frio; arco/rapieira |
| Gigante das Nuvens (Blagothkus) | Ep8 Skyreach | CR 9; arremesso de rocha; magia inata |
| Dragão Branco Jovem (Glazhael) | Ep8 Skyreach | sopro de frio; dragão do castelo voador |

Itens a garantir no catálogo: Máscara Dracônica Negra (Black Dragon Mask —
foco arcano, resist. ácido) · Hazirawn (espada grande +1, dreno) · pilhagem do
tesouro do culto (contínuo, gerado pela Fase 13).

## Ep4 — Na Estrada (On the Road)

Aventura `modelo_ninho_ep4_estrada` · nível ~4 · viagem/social · ~14 nós.
- Escoltar/seguir a caravana do culto rumo ao norte pela Estrada do Comércio;
  disfarce e intriga entre mercadores, mercenários e cultistas.
- Encontros de estrada (tabela), o mercador suspeito, os caçadores de recompensa,
  a decisão de manter o disfarce vs. agir; ganchos para o Carnath Roadhouse.

## Ep5 — Obras à Frente (Construction Ahead / Carnath Roadhouse)

Aventura `modelo_ninho_ep5_carnath` · nível ~5 · masmorra/social · ~15 nós.
- O entreposto/estalagem que o culto usa como base logística; Bog Luck
  (meio-dragão), cultistas, kobolds, dracos; o depósito do tesouro e a balsa.

## Ep6 — Castelo Naerytar

Aventura `modelo_ninho_ep6_naerytar` · nível ~5-6 · fortaleza de pântano · ~16 nós.
- O castelo no brejo: bullywugs e homens-lagarto (aliança instável),
  cultistas, dracos; Rezmir, a wyrmspeaker de manto; o CÍRCULO DE
  TELETRANSPORTE que leva ao Skyreach. Decisão: aliança com os bullywugs.

## Ep7 — O Refúgio de Caça (Hunting Lodge)

Aventura `modelo_ninho_ep7_refugio` · nível ~6-7 · infiltração · ~14 nós.
- A base de onde o castelo voador parte; Talis, a Branca (meia-dragã
  dissidente que pode até negociar); guardas, dracos; embarcar no Skyreach.

## Ep8 — Castelo nas Nuvens (Castle in the Clouds / Skyreach)

Aventura `modelo_ninho_ep8_skyreach` · nível ~7-8 · fortaleza voadora · ~18 nós.
- O castelo do gigante das nuvens Blagothkus (aliado potencial contra o culto);
  Rezmir e a Máscara Negra; o dragão branco Glazhael acorrentado no coração do
  castelo; o tesouro do culto; clímax e finais múltiplos (fugir com o tesouro,
  derrubar Rezmir, libertar/enfrentar Glazhael, aliar-se a Blagothkus).

---

## Ordem de execução (1 episódio por run)

NR0 → Ep4 → Ep5 → Ep6 → Ep7 → Ep8. Cada entrega: backup, grafo validado (0/0),
encontros exatos do bestiário, CHANGELOG, ✅ aqui e no ROADMAP, commit+push.

**Progresso:**
- [x] Eps 1-3 (Greenest/Trilha/Chocadouro) — `modelo_ninho_rainha_dragao`
- [x] NR0 — bestiário (15/07/2026: 7 criaturas — Fanático do Culto, Homem-Lagarto, Bullywug, Rezmir, Talis, Gigante das Nuvens/Blagothkus, Dragão Branco Jovem/Glazhael; itens Máscara Dracônica Negra + Hazirawn como loot garantido de Rezmir)
- [x] Ep4 — Na Estrada (15/07/2026: `modelo_ninho_ep4_estrada`, 13 nós, prefixo `e4_` — caravana + disfarce, hub da viagem (quem é quem, vigília noturna, bisbilhotar as lonas 💀, encontro de estrada com tabela 1d6, caçadores/Azbara Jos), desmascaramento como ramo, o desvio para o entreposto; finais "disfarce intacto" e "sem máscara" (ambos vitória) + beco "largar o rasto". 0 erros/0 avisos; encontros exatos)
- [ ] Ep5 — Obras à Frente (Carnath)
- [ ] Ep6 — Castelo Naerytar
- [ ] Ep7 — Refúgio de Caça
- [ ] Ep8 — Castelo nas Nuvens (Skyreach)
