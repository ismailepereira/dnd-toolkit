# Changelog

Registo de alterações relevantes do D&D Toolkit. Cada entrada indica os
ficheiros tocados e, quando aplicável, a pasta de backup em `versoes/` com o
estado anterior desses ficheiros (para reverter sem depender só do Git).

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
