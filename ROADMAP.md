# 🐉 D&D Toolkit — Roadmap

Mapa de tarefas do projeto, organizado por fases. Marque `[x]` conforme for concluindo.

**Como trabalhar (regra de ouro):** 1 pedido = 1 chat novo (ou 1 bloco de níveis). Quanto mais focado o pedido, mais completo o resultado. Eu mantenho o contexto do projeto na memória, então um chat novo já começa a par.

**Legenda:** `[ ]` a fazer · `[~]` em andamento · `[x]` pronto

---

## ✅ FASE 0 — Fundação (entregue)
- [x] Login Mestre/Jogador + estado compartilhado
- [x] Firestore (persistência + tempo real)
- [x] Criador de personagem em etapas (Identidade → Habilidades/Magias → Itens)
- [x] Motor de regras (proficiência de arma/armadura, peso/carga, progressão de magia)
- [x] Bestiário (53 monstros, filtros por aventura/tipo, visibilidade pelo Mestre)
- [x] Combate unificado (PJs + monstros, rolagem de ataque/dano, condições, log, visão do jogador)
- [x] Modo de Jogo (PV/slots/recursos/ouro/descanso/condições/testes de morte/concentração/rolagens com vantagem/inventário/peso)
- [x] Subida de nível (progressão automática + escolhas: subclasse, estilo, ASI/talento, magias por círculo)
- [x] Compêndio inicial: 159 magias + condições + talentos + subclasses (resumo)
- [x] Mago: painel detalhado + trava de magias por Escola + ouro inicial + compra na loja

---

## 🎯 FASE 1 — Classes completas até o nível 20 (épico principal)

**Regra:** cada classe em 3 blocos — **1–7**, **8–14**, **15–20**.
Cada bloco entrega: características base (com mecânica) + características de cada subclasse + magias/recursos que abrem + teste + deploy.

**Pedido (colar em chat novo):**
> "Continuar o D&D Toolkit. Detalhar o **[CLASSE]**, níveis **[1–7]**, completo: características base com mecânica, características de cada subclasse nesse intervalo, magias/recursos que abrem até aqui, e o painel da classe no Criador e na Subida de Nível. Teste e me chame só pro deploy."

| Classe | Tipo | Subclasses | 1–7 | 8–14 | 15–20 |
|---|---|---|:--:|:--:|:--:|
| Mago | Conjurador | 8 escolas | [x] | [x] | [ ] |
| Guerreiro | Marcial | Campeão, Mestre de Batalha, Cav. Arcano | [ ] | [ ] | [ ] |
| Monge | Marcial | Mão Aberta, Sombra, 4 Elementos | [ ] | [ ] | [ ] |
| Clérigo | Conjurador (prepara) | 7 domínios | [ ] | [ ] | [ ] |
| Ladino | Perícia | Ladrão, Assassino, Trapaceiro Arcano | [ ] | [ ] | [ ] |
| Bárbaro | Marcial | Berserker, Totêmico | [ ] | [ ] | [ ] |
| Patrulheiro | Meio-conjurador | Caçador, Senhor das Feras | [ ] | [ ] | [ ] |
| Paladino | Meio-conjurador | Devoção, Anciões, Vingança | [ ] | [ ] | [ ] |
| Bardo | Conjurador | Conhecimento, Bravura | [ ] | [ ] | [ ] |
| Druida | Conjurador | Terra, Lua | [ ] | [ ] | [ ] |
| Feiticeiro | Conjurador | Dracônico, Selvagem | [ ] | [ ] | [ ] |
| Bruxo | Conjurador (pacto) | Corruptor, Arquifada, Grande Antigo | [ ] | [ ] | [ ] |

**Alinhamento de magias por bloco (conjurador pleno):** 1–7 = até 4º círculo · 8–14 = 5º a 7º · 15–20 = 8º/9º + capstone.

### Pendência específica do Mago (Bloco A)
- [x] Separar **grimório** (tudo que aprendeu) de **magias preparadas** (INT + nível, do dia) no Modo de Jogo, com botão preparar/despreparar — Criador/Subida usam o tamanho do grimório (6 + 2/nível); preparadas vivem na ficha de jogo
- [x] Características mecânicas de cada **Escola de Magia** por nível (8 escolas, no painel do Criador e na Subida de Nível) — commit `f5f26f3`
- [x] Completar a lista de magias de Mago (agora **200 magias** de Mago no compêndio, cobrindo truques até 9º círculo)

---

## ⚔️ FASE 2 — Combate mais fiel às regras
- [ ] 2.1 Resistência / Vulnerabilidade / Imunidade no dano (metade/dobro por tipo)
- [ ] 2.2 Salva em massa (vários monstros) + dano em área em múltiplos alvos
- [ ] 2.3 Ataques dos PJs clicáveis no rastreador (igual aos monstros)
- [ ] 2.4 Ações lendárias / resistência lendária / multiataque automáticos (chefes)
- [ ] 2.5 Companheiros e invocações como combatentes

---

## 📚 FASE 3 — Compêndio & itens
- [ ] 3.1 Completar magias do PHB (~200 faltando; fazer junto da Fase 1, por classe)
- [ ] 3.2 Itens mágicos com efeitos + sintonização (máx. 3)
- [ ] 3.3 Antecedentes completos (ferramentas, idiomas, equipamento, característica)

---

## 🧑‍🤝‍🧑 FASE 4 — Qualidade de vida (Jogador & Mestre)
- [ ] 4.1 "Minha ficha" por jogador (cada um abre direto a sua) — decidir login por jogador
- [ ] 4.2 Montador de encontros com orçamento de XP (fácil/médio/difícil/mortal)
- [ ] 4.3 Encontros salvos + templates rápidos de NPC
- [ ] 4.4 Notas / handouts compartilhados em tempo real
- [ ] 4.5 Exportar ficha em PDF + subir de nível por XP

---

## ♿ FASE 5 — Acessibilidade & robustez
- [ ] 5.1 Acessibilidade: tamanho de fonte, alto contraste, navegação por teclado, ARIA
- [ ] 5.2 Backup exportar/importar (rede de segurança além do Firestore)
- [ ] 5.3 Multi-campanha (mais de uma mesa no mesmo app)
- [ ] 5.4 Segurança: senhas com hash / Login do Firebase; regras Firestore mais estritas

---

## 🧩 Formato padrão de qualquer pedido
1. **Contexto:** "Continuar o D&D Toolkit."
2. **Escopo exato:** classe + bloco de níveis, OU a tarefa da fase.
3. **Critério de pronto:** "completo, com mecânica, funcionando no Criador e na Subida de Nível."
4. **Fechamento:** "Teste e me chame só pro deploy."

---

## ℹ️ Referência técnica rápida
- **Rodar local:** `python app.py` → http://localhost:5300 · Mestre `Ismaile` · Jogador `jogador`
- **Deploy:** GitHub `ismailepereira/dnd-toolkit` → Render (Manual Deploy → Deploy latest commit). Dados ficam no Firestore (não se perdem no deploy).
- **Dados/regras (static/js):** `classes.js` (progressão), `dados5e.js` (raças/perícias/antecedentes/ouro), `compendio.js` (magias/condições/talentos/subclasses), `regras.js` (proficiências/peso/listas de magia por classe), `monstros.js` (bestiário).
- **UI (static/js):** `criador.js` (criação), `nivel.js` (subida de nível), `jogo.js` (modo de jogo), `app.js` (mestre), `jogador.js` (jogador), `firebase-rt.js` (tempo real).
