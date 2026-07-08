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

## 🛍️ FASE 9 — Loja reorganizada + Loja Especial (entregue 04/07/2026)
- [x] 9.1 Catálogo unificado por categoria (Armaduras, Escudos, Armas, Munição, Instrumentos, Anéis, Calçados, Cintos, Mantos & Capas, Varinhas & Cajados, Montarias, Focos, Poções, Pergaminhos, Aventura, Outros) — `loja.js: CATEGORIAS_LOJA/classificarItemLoja()`
- [x] 9.2 Botão "📖 Abrir loja completa" (mostra todas as categorias de uma vez) tanto no Criador quanto no Modo de Jogo
- [x] 9.3 Loja Básica (equipamento mundano do PHB) continua sendo o padrão na criação do personagem — nada mudou aqui além da navegação por categoria
- [x] 9.4 Loja Especial (itens mágicos/raros) bloqueada por padrão; painel do Mestre libera por campanha inteira (checkbox na aba Fichas) e/ou por personagem (toggle no cartão de cada ficha)
- [x] 9.5 Instrumentos musicais e mais montarias/acessórios adicionados a `itens.js` (categoria antes não existia no catálogo)

### Pontos em aberto (Fase 9)
- ~~Comprar em Modo de Jogo sem custo de ouro~~ — resolvido na Fase 9b (04/07/2026): o botão da Loja Básica virou "Comprar", debita o ouro da ficha e desabilita quando o ouro não chega; munição em packs e arredondamento de centavos tratados.
- ~~Loja Especial só consulta~~ — evoluiu na Fase 9c (04/07/2026): agora é CURADA pelo Mestre (acervo + preços) e vende de verdade no Modo de Jogo; no Criador continua consulta (compra inicial = só loja básica).
- Ver `docs/ROADMAP-FUTURO.md` para as fases seguintes já documentadas (NPCs, lojas geridas por NPC, monstros & loot, grid virtual, autenticação/campanha).

## ✅ FASE 9c — Validações de ficha + Loja Especial curada (entregue 04/07/2026)
- [x] 9c.1 Criador não avança/salva com passo incompleto: nome, atributos raciais, subclasse (quando o nível pede), perícias/estilo/truques/magias na contagem exata da classe — erros listados num painel amarelo, chip de passo também valida
- [x] 9c.2 História prévia mínima de 150 caracteres (contador ao vivo; fichas antigas sem história não ficam presas na edição — legado)
- [x] 9c.3 Itens sem proficiência: aviso já existia no preview/slots; agora o Salvar pede confirmação explícita listando as penalidades
- [x] 9c.4 Loja Especial CURADA: aba "Itens Mágicos & Loja Especial" do Mestre ganhou o acervo completo (PHB/DMG + criações) com busca e botão "➕ à loja" (preço sugerido pela raridade, editável) — só o que o Mestre adiciona aparece para os jogadores
- [x] 9c.5 Botão "✨ Loja Especial" no cabeçalho da ficha (Modo de Jogo) quando o personagem/campanha está liberado — abre a loja completa; comprar debita o ouro pelo preço definido pelo Mestre

---

## 🔐 FASE 10 — Autenticação e Sistema de Campanha, v1 (entregue 04/07/2026)
Plano completo em `docs/ROADMAP-FUTURO.md` (Fase 10); esta v1 cobre os passos 1–6.
- [x] 10.1 Auto-registo de jogadores (`/registro`, usuário+senha com hash) — contas fixas antigas continuam a funcionar (legado)
- [x] 10.2 Campanhas com dono, membros e código de convite (`campanhas_meta` no Firestore / `data/campanhas_meta.json` local)
- [x] 10.3 Tela "Minhas Campanhas": entrar por código, criar campanha (vira Mestre dela), trocar de mesa
- [x] 10.4 Papel derivado da campanha ativa; form livre de troca do cabeçalho valida membresia p/ contas registadas
- [x] 10.5 Fichas com dono (`donoUid`): só o dono (ou Mestre) joga/edita; fichas antigas sem dono ficam livres (legado)
- [x] 10.6 Morte/permanência: 3 falhas → ficha vira memorial 🪦 read-only; jogador volta com personagem novo; Mestre tem "✨ Reviver"
- [x] 10.7 Aba "Membros" do Mestre: código de convite + remover jogador (acesso revogado na hora)
- [x] 10.9 Assinatura manual (entregue 05/07/2026): registo com nome completo/e-mail/CPF (validado)/WhatsApp, trial de 3 dias, bloqueio automático ao expirar (páginas → /assinatura, API → 402), página de pagamento por Pix com "Já paguei", painel /admin/assinaturas (só mestre legado: +30 dias, +trial, bloquear) — confirmação 100% manual
- [x] 10.8 Regras de segurança do Firestore por campanha (código entregue 04/07/2026): `firestore.rules` versionado, tokens personalizados via `/api/firebase_token`, RT autentica antes de escutar com degradação suave. **Falta só publicar no Console** (Authentication → Começar + colar as regras) DEPOIS do deploy — passos no `SEGURANCA.md`

---

## 🧑‍🌾 FASE 11 — NPCs da campanha (entregue 05/07/2026)
Plano em `docs/ROADMAP-FUTURO.md` (Fase 11); base para as Fases 12 (lojas por NPC) e 13 (loot).
- [x] 11.1 NPCs persistentes no estado da campanha (`npcs[]`): nome, tipo (lojista/aliado/inimigo/neutro), descrição, localização, notas privadas 🔒 e stat block opcional (CA/PV/atributos/ações)
- [x] 11.2 API `GET/PUT /api/npcs` — jogador só recebe os visíveis e NUNCA as notas privadas (filtro no servidor, mesmo padrão de /api/notas); PUT só Mestre
- [x] 11.3 Aba "NPCs" no Mestre: CRUD completo com modal, toggle 👁️ visível no cartão, cor por tipo
- [x] 11.4 Aba "NPCs Conhecidos" no jogador (read-only, tempo real com o mesmo filtro replicado no cliente)
- [x] 11.5 "+ NPC" no rastreador de combate: NPC com stat block entra como aliado (🤝) ou inimigo (lado dos monstros), com ações parseadas pelo MESMO parseAcoes do bestiário, salvas por atributo e iniciativa por DES
- [ ] 11.6 Retrato/imagem do NPC (fora de escopo até decidir hospedagem de imagens)

---

## 🎯 PRÓXIMAS ATUALIZAÇÕES — backlog priorizado (05/07/2026)
Detalhe completo (objetivo/estrutura/ficheiros/passos) em `docs/ROADMAP-FUTURO.md → Backlog Priorizado`.
1. ✅ **B1** — ~~Bug: F5 perde a ficha em criação~~ (entregue 05/07/2026: rascunho automático no Criador/NPC/Item Mágico + "continuar de onde parou")
2. ✅ **B2** — ~~XP e ouro só via Mestre~~ (entregue 05/07/2026: jogador sem +XP/+ouro; envio do Mestre com campo XP e "👥 todos")
3. 🟠 **C1** — Rolagem com alvo: ataque compara com CA e aplica dano real; defesas contra CD; opção de dado físico
4. 🟡 **M1** — NPC com ficha COMPLETA (raça/classe/antecedente/personalidade/história via Criador)
5. 🟡 **M2** — Promover criatura do bestiário a NPC persistente (com opção aleatória)
6. 🟡 **M3** — Gerador de ambientes urbanos (casa/taverna/estábulo/multidão → ocupantes; ~90% normal, raros com monstros)
7. 🟡 **Fase 13** — Monstros & Loot (tabelas de tesouro por ND)
8. 🟡 **M4** — Banco de NPCs partilhado entre utilizadores (guardar no meu banco / trazer p/ campanha)
9. 🟢 **K1** — Aviso de combate em tempo real p/ jogadores (banner + som + salto p/ aba Combate)
10. 🟢 **Fase 12** — Lojas geridas por NPC (inventário/preços próprios)
11. 🟢 **K2** — Árvore narrativa da campanha (mapa mental de decisões, só o Mestre)
12. ✅ **U1** — ~~Loja com visual interativo~~ (entregue 08/07/2026: loja do jogador — Criador e Modo de Jogo — vira grade de cartões com ícone por categoria, hover e bolha "−X po" ao comprar; só CSS + emoji, dados intactos)
13. 🔵 **U2** — Integração com IA (gerar história/ficha/NPC — endpoint no servidor, quota por assinatura)
14. 🔵 **Fase 14** — Grid Virtual / mapa de combate
15. ✅ **CT1** — ~~Campanha pronta: Mina Perdida de Phandelver~~ (entregue 08/07/2026: Capítulo 1 "Emboscada Goblin" como livro-jogo — grafo de 14 nós, nível 1-2, na biblioteca de aventuras prontas)

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
- **Loja (Fase 9):** `loja.js` — catálogo unificado por categoria (`CATEGORIAS_LOJA`) e gate da Loja Especial (`lojaEspecialLiberada()`); usado por `criador.js` (passo 5) e `jogo.js` (Modo de Jogo). Liberar a Loja Especial: painel do Mestre, aba Fichas (checkbox de campanha + toggle por personagem).
- **Fases seguintes já planeadas em detalhe:** ver [docs/ROADMAP-FUTURO.md](docs/ROADMAP-FUTURO.md) — autenticação/campanha, NPCs, lojas geridas por NPC, monstros & loot, grid virtual.
