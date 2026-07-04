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

## 🎒 FASE 6 — Criação guiada & Equipamento 5e (entregue 03–04/07/2026)
Spec completa em `docs/SPEC-EQUIPAMENTO.md`.
- [x] 6.1 Criador em 5 passos com galerias: Classe (símbolo, papel, melhores raças, subclasses selecionáveis, status recomendados com edição/rolagem) e Raça (ASI, traços, ⭐ recomendadas)
- [x] 6.2 Ficha nova nasce com o melhor arranjo legal (compra de pontos 15/15/14/10/8/8 pela prioridade da classe)
- [x] 6.3 Troca de subclasse limpa tudo que a anterior liberou (magias/truques/preparadas/slots) — sem acúmulo
- [x] 6.4 Ouro por rolagem oficial do PHB (única por ficha, trava; extra só via Mestre)
- [x] 6.5 Kit inicial grátis por classe (escolhas do PHB em radios, só na criação) + `equipamento.js` (catálogo PHB estruturado: armas/armaduras/focos/munição/poções)
- [x] 6.6 Loja da criação com abas, filtro de proficiência (cadeado) e devolução 100%
- [x] 6.7 Bolsa + 5 slots mecânicos (criador E modo de jogo): CA recalcula ao equipar, arma versátil usa dado maior com mão livre, ataque bônus de duas armas leves, munição consome por ataque, peso FOR×7,5 kg
- [x] 6.8 Usar poção da bolsa (rola cura e consome) e vender item por metade do preço no Modo de Jogo
- [x] 6.9 Painel do Mestre: enviar ouro/itens a qualquer ficha (loot/recompensa)
- [ ] 6.10 Mercadores/lojas específicas do Mestre (evolução futura — reusa o mecanismo de envio)

---

## 📖 FASE 7 — Criação de personagem avançada (entregue 04/07/2026)
- [x] 7.1 Antecedentes com explicação amigável no Criador (perícias/ferramentas/idiomas/equipamento/característica) + tabelas de traço/ideal/ligação/defeito por antecedente (lista OU texto livre)
- [x] 7.2 Registro extensível de fontes/módulos (`fontes.js`) — antecedentes de aventuras publicadas somam-se aos do PHB no Criador; exemplos incluídos: Ninho da Rainha Dragão e Mina Perdida de Phandelver
- [x] 7.3 História prévia (texto livre, com o antecedente como contexto) salva na ficha e exibida no preview, no Modo de Jogo e no PDF
- [x] 7.4 Item de Memória — objeto pessoal/herdado só narrativo, ligado à ficha, fora do acervo/loja
- [x] 7.5 Ferramenta do Mestre "Itens Mágicos" — cria itens dentro das diretrizes de raridade do Guia do Mestre (bônus/propriedades/cargas/magias por dia), guardados à parte do acervo do jogador; envio à ficha reusa o mecanismo da Fase F
- [ ] 7.6 Mais módulos de aventura em `fontes.js` (evolução futura — só criar novas entradas no registro)

---

## 🎯 FASE 8A — Ajuda tática ao jogador (entregue 04/07/2026)
- [x] 8A.1 Painel "O teu turno" no Modo de Jogo: Ação/Ação Bônus/Movimento/Reação/Ação Livre, só com o que aquele personagem tem (classe/subclasse/nível/recursos) — `ajudatatica.js: opcoesTurno()`
- [x] 8A.2 Dicas contextuais por classe/subclasse, condicionadas ao estado real (nível, recursos gastos, concentração, magias conhecidas) e a toggles manuais (Em Fúria/Inimigo adjacente/Aliado adjacente ao alvo — sem grid, ver ponto em aberto) — `ajudatatica.js: dicasContextuais()`
- [x] 8A.3 Motor de combos sugeridos por classe, lista curada inicial fácil de expandir — `ajudatatica.js: combosSugeridos()`
- [x] 8A.4 Ajuda de movimento/ataque: deslocamento, alcance de armas (curto/longo ou corpo a corpo/alcance), aviso de Ataque de Oportunidade e tabela de cobertura — textual (não há grid no projeto) — `ajudatatica.js: ajudaMovimentoAtaque()`

## 🧬 FASE 8B — Multiclasse (entregue 04/07/2026)
- [x] 8B.1 Ao subir de nível, escolher entre continuar na classe atual ou multiclassar (até 2 classes — decisão de escopo) — `nivel.js`
- [x] 8B.2 Pré-requisito de atributo (13, com regra "todos" ou "qualquer" por classe) validado antes de multiclassar — `multiclasse.js: PREREQ_MULTICLASSE/podeMulticlassarPara`
- [x] 8B.3 Proficiências limitadas ao multiclassar (tabela do PHB, só a 2ª classe em diante) — `multiclasse.js: PROF_MULTICLASSE/proficienciasEfetivas`, usado em `ataqueArma`/`penalidadesEquipamento` (regras.js)
- [x] 8B.4 Bônus de proficiência sempre pelo nível TOTAL — `pbAtual()` (jogo.js) e `PB()` (classes.js) já eram funções puras do nível
- [x] 8B.5 Slots de magia por tabela de multiclasse (cheio + meio/2 + terço/3), Pacto do Bruxo sempre separado — `multiclasse.js: slotsMulticlasse/pactoBruxoDaFicha`, usado em `slotsMax()` (jogo.js)
- [x] 8B.6 Ataque Extra não acumula entre classes (melhor valor, não soma) — `multiclasse.js: totalAtaques`
- [x] 8B.7 ASI/talentos e dado de vida por classe; características de classe exibidas por classe no nível dela (Modo de Jogo)

### Pontos em aberto (Fase 8, ver CHANGELOG.md para detalhe)
- Sem grid/mapa no projeto: "inimigo adjacente"/"aliado adjacente ao alvo"/"em Fúria"/"caído" são toggles manuais (`ficha.estadoTatico`), não detecção automática.
- Multiclasse limitado a 2 classes por personagem (não 3+).
- Magias conhecidas/preparadas ficam numa lista única por ficha (não uma por classe) — o limite de preparadas soma a fórmula de cada classe preparadora como aproximação.
- Um único campo de Estilo de Combate (`ficha.estilo`) — se a 2ª classe também concede Estilo de Luta e já há um escolhido, não reoferece.
- Editar nível/classe diretamente pelo Criador (fora do fluxo guiado de Subida de Nível) não ajusta `ficha.classes` — usar sempre o Nivel.abrir() para progressão de multiclasse.

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
- **Dados/regras (static/js):** `classes.js` (progressão), `dados5e.js` (raças/perícias/antecedentes+personalidade/ouro), `fontes.js` (registro extensível de antecedentes/ligações de módulos de aventura), `compendio.js` (magias/condições/talentos/subclasses), `regras.js` (proficiências/peso/listas de magia por classe), `monstros.js` (bestiário), `itensmestre.js` (diretrizes de raridade + ferramenta de criação de itens mágicos do Mestre), `multiclasse.js` (regras de multiclasse: pré-requisitos, proficiências limitadas, slots combinados, Ataque Extra), `ajudatatica.js` (painel "O teu turno", dicas contextuais, combos, ajuda de movimento/ataque).
- **UI (static/js):** `criador.js` (criação), `nivel.js` (subida de nível + escolha de multiclasse), `jogo.js` (modo de jogo), `app.js` (mestre), `jogador.js` (jogador), `firebase-rt.js` (tempo real).
- **Adicionar um novo módulo de aventura:** edite só `fontes.js` — crie uma entrada em `FONTES_AVENTURA` com `nome` e `antecedentes` (mesmo formato de `ANTECEDENTES` em `dados5e.js`); o Criador já lista automaticamente.
- **Adicionar uma dica/combo tático novo:** edite `ajudatatica.js` — acrescente uma entrada em `DICAS_CLASSE`/`DICAS_SUBCLASSE`/`COMBOS_CLASSE`, sem mexer em mais nada.
