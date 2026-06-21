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
| Mago | Conjurador | 8 escolas | [x] | [x] | [x] |
| Guerreiro | Marcial | Campeão, Mestre de Batalha, Cav. Arcano | [x] | [x] | [x] |
| Monge | Marcial | Mão Aberta, Sombra, 4 Elementos | [x] | [x] | [x] |
| Clérigo | Conjurador (prepara) | 7 domínios | [x] | [x] | [x] |
| Ladino | Perícia | Ladrão, Assassino, Trapaceiro Arcano | [x] | [x] | [x] |
| Bárbaro | Marcial | Berserker, Totêmico | [x] | [x] | [x] |
| Patrulheiro | Meio-conjurador | Caçador, Senhor das Feras | [x] | [x] | [x] |
| Paladino | Meio-conjurador | Devoção, Anciões, Vingança | [x] | [x] | [x] |
| Bardo | Conjurador | Conhecimento, Bravura | [x] | [x] | [x] |
| Druida | Conjurador | Terra, Lua | [x] | [x] | [x] |
| Feiticeiro | Conjurador | Dracônico, Selvagem | [x] | [x] | [x] |
| Bruxo | Conjurador (pacto) | Corruptor, Arquifada, Grande Antigo | [x] | [x] | [x] |

**Alinhamento de magias por bloco (conjurador pleno):** 1–7 = até 4º círculo · 8–14 = 5º a 7º · 15–20 = 8º/9º + capstone.

### Pendência específica do Mago (Bloco A)
- [x] Separar **grimório** (tudo que aprendeu) de **magias preparadas** (INT + nível, do dia) no Modo de Jogo, com botão preparar/despreparar — Criador/Subida usam o tamanho do grimório (6 + 2/nível); preparadas vivem na ficha de jogo
- [x] Características mecânicas de cada **Escola de Magia** por nível (8 escolas, no painel do Criador e na Subida de Nível) — commit `f5f26f3`
- [x] Completar a lista de magias de Mago (agora **200 magias** de Mago no compêndio, cobrindo truques até 9º círculo)

---

## ⚔️ FASE 2 — Combate mais fiel às regras
- [x] 2.1 Resistência / Vulnerabilidade / Imunidade no dano (metade/dobro por tipo) — tipo de dano no ataque/dano manual; defesas auto-detectadas dos traços do monstro + editáveis por combatente
- [x] 2.2 Salva em massa (vários monstros) + dano em área em múltiplos alvos — ferramenta "💥 Dano em Área": fórmula+tipo+salva(CD/atributo/½), rola 1×, aplica salva e resist/vuln por alvo
- [x] 2.3 Ataques dos PJs clicáveis no rastreador — gerados da ficha (armas via `ataqueArma` + truques de dano escalados, com ataque mágico)
- [x] 2.4 Ações lendárias / resistência lendária / multiataque (chefes) — botão ⚔ Multiataque (detecta nº do texto), marcar ⭐ Chefe com Resistência Lendária (contador) e Ações Lendárias/rodada (recarregam por rodada)
- [x] 2.5 Companheiros e invocações como combatentes — botão "+ Aliado" adiciona criatura do bestiário como aliado (stat block + ataques próprios)

---

## 📚 FASE 3 — Compêndio & itens
- [~] 3.1 Completar magias do PHB — lote desta fase adicionado (smites, utilidade, cura/ressurreição, adivinhação, terremoto etc.); ~278 magias no total. Segue como trabalho contínuo até 100% do PHB.
- [x] 3.2 Itens mágicos com efeitos + sintonização (máx. 3) — catálogo `ITENS_MAGICOS` (26, com raridade/sintonia/efeito) na loja; rastreador de Sintonização no Modo de Jogo (toggle, trava de 3, passivos "sempre ativos")
- [x] 3.3 Antecedentes completos — 13 antecedentes com perícias, ferramentas, idiomas, equipamento e característica; bloco no preview do Criador

---

## 🧑‍🤝‍🧑 FASE 4 — Qualidade de vida (Jogador & Mestre)
- [x] 4.1 "Minha ficha" por jogador — estrela ⭐ marca a ficha do jogador (localStorage), atalho "Jogar minha ficha" + destaque/ordenação (sem mexer no login compartilhado)
- [x] 4.2 Montador de encontros com orçamento de XP — aba Encontros: limiares fácil/médio/difícil/mortal (das fichas ou manual), multiplicador por nº de monstros, dificuldade calculada + recompensa de XP
- [x] 4.3 Encontros salvos + NPC rápido — salvar/carregar/excluir encontros (estado compartilhado) e "lançar no combate"; NPC avulso e "+ Aliado" no rastreador
- [x] 4.4 Notas / handouts compartilhados em tempo real — notas no estado compartilhado com flag de handout; aba Handouts do jogador (somente as compartilhadas), sync em tempo real
- [x] 4.5 Exportar ficha em PDF + subir por XP — botão "Ficha PDF" (janela imprimível) no Modo de Jogo; rastreio de XP com aviso/pulso ao atingir o nível seguinte

---

## ♿ FASE 5 — Acessibilidade & robustez
- [x] 5.1 Acessibilidade — widget ♿ (compartilhado): tamanho de fonte (zoom 90–150%), alto contraste, foco visível por teclado, navegação por setas nas abas e ARIA (role tablist/tab); preferências no localStorage
- [x] 5.2 Backup exportar/importar — botão 💾 Backup no Mestre: exporta `.json` (fichas/monstros/combate/notas/encontros) e importa substituindo a campanha atual
- [x] 5.3 Multi-campanha — cada mesa é um doc `campanha/<id>` (padrão `principal`); seletor no cabeçalho cria/troca; cliente (RT) escuta o doc da campanha ativa; isolado por campanha
- [x] 5.4 Segurança — login aceita senha em hash do Werkzeug (`senha_confere`, retrocompatível com texto puro); `SEGURANCA.md` documenta hash, regras do Firestore, exposição de notas no RT, multi-campanha e backup. (Login do Firebase + regras por usuário ficam como evolução futura.)

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
