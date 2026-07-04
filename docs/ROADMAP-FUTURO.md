# 🗺️ Roadmap Futuro — Fases 10+

> Documento de planeamento apenas — **nada aqui foi implementado**. É o guia
> detalhado para quando formos construir cada uma destas fases. Cada secção
> tem: objetivo, estrutura de dados sugerida, ficheiros afetados e passos de
> implementação. Sequência recomendada abaixo (a Fase 10 é estrutural e
> deveria vir primeiro, mesmo tendo sido pedida por último na conversa,
> porque as fases seguintes — NPCs, monstros, encontros — já nascem
> "por campanha", e a Fase 10 é o que dá um dono e um limite a cada campanha).

## Índice
- [Fase 10 — Autenticação e Sistema de Campanha](#fase-10--autenticação-e-sistema-de-campanha)
- [Fase 11 — NPCs (lojistas, aliados, inimigos)](#fase-11--npcs-lojistas-aliados-inimigos)
- [Fase 12 — Lojas geridas por NPC](#fase-12--lojas-geridas-por-npc)
- [Fase 13 — Monstros & Sistema de Loot](#fase-13--monstros--sistema-de-loot)
- [Fase 14 — Grid Virtual / Mapa de Combate](#fase-14--grid-virtual--mapa-de-combate)
- [Como estas fases se encaixam](#como-estas-fases-se-encaixam)

---

## Fase 10 — Autenticação e Sistema de Campanha

### Objetivo
Sair do modelo atual (dois utilizadores fixos, `Ismaile`/`jogador`, definidos em
variáveis de ambiente) para contas individuais por jogador, ligadas a
**campanhas** que o Mestre cria e administra. O personagem passa a "viver"
dentro da campanha ativa — progresso, itens e estado ficam presos a ela, não
soltos numa sessão de navegador. Introduz também a regra de permanência:
**personagem morto = precisa criar um personagem novo** para voltar a jogar
naquela campanha (dá ao Mestre controlo real sobre risco e consequência).

### Por que vem primeiro
Hoje (`app.py`) já existe um esboço de "multi-campanha" (Fase 5.3 do
`ROADMAP.md`): cada mesa é um documento `campanha/<id>`, trocável por um
formulário no cabeçalho do Mestre. Mas o login é só dois utilizadores fixos —
não há conceito de "este jogador pertence a estas campanhas" nem de "este
personagem pertence a esta campanha e não a outra". As Fases 11–14 (NPCs,
lojas, monstros/loot, grid) fazem mais sentido — e o Mestre configura-as mais
naturalmente — já dentro de uma campanha com dono e membros definidos.

### Estrutura de dados sugerida

**Coleção `usuarios`** (Firestore) ou tabela equivalente (se migrar para SQL
no futuro — fora de escopo agora, mas o desenho já fica pronto para isso):
```jsonc
// usuarios/<uid>
{
  "email": "jogador@example.com",
  "nomeExibicao": "Fizzbang",
  "senhaHash": "pbkdf2:...",          // reaproveita senha_confere() já existente
  "papelGlobal": "jogador",            // "mestre" | "jogador" — papel padrão fora de campanhas
  "campanhas": ["camp_abc123"],        // campanhas de que este utilizador é membro
  "criadoEm": "2026-08-01T12:00:00Z"
}
```

**Coleção `campanhas`** (substitui o documento único `campanha/<id>` atual,
que passa a ser só os DADOS da campanha, não a lista de quem pode entrar):
```jsonc
// campanhas/<campId>
{
  "nome": "A Maldição de Strahd",
  "mestreUid": "uid_do_mestre",
  "membros": {                          // uid -> papel dentro desta campanha
    "uid_jogador1": "jogador",
    "uid_jogador2": "jogador"
  },
  "codigoConvite": "STRAHD-7F2A",       // código simples p/ o jogador entrar sem o Mestre convidar manualmente
  "criadaEm": "2026-08-01T12:00:00Z",
  "ativa": true
}
```

**Personagens ligados a campanha** — hoje `ficha` vive dentro do documento
`campanha/<id>`, já implicitamente "presa" à campanha (bom, mantém-se). O que
falta é ligar a ficha ao UTILIZADOR dono e à regra de morte:
```jsonc
// dentro de campanhas/<campId>/fichas[] (ou subcoleção fichas, se crescer muito)
{
  "id": "f_123",
  "donoUid": "uid_jogador1",       // novo — antes não existia dono, era "livre" p/ qualquer jogador editar
  "status": "vivo",                 // novo — "vivo" | "morto"
  "morteEm": null,                  // novo — timestamp de quando morreu (se status === "morto")
  // ...todos os campos que já existem hoje (classe, nivel, atributos, itens, etc.)
}
```

**Sessão do utilizador** (Flask `session`), em vez de só `usuario`/`papel`:
```python
session['uid'] = 'uid_jogador1'
session['papelGlobal'] = 'jogador'
session['campanhaAtiva'] = 'camp_abc123'   # substitui session['campanha'] (string simples) de hoje
```

### Regra de morte/permanência
- Quando `ficha.hpAtual` chega a 0 e o jogador falha 3 testes de morte (já
  existe a lógica em `jogo.js: testeMorte()`), em vez de só logar "💀 O
  personagem MORREU", marcar `ficha.status = 'morto'` e `ficha.morteEm`.
- Fichas com `status: 'morto'` ficam **read-only** na UI do jogador (sem
  botões de ação no Modo de Jogo — só visualização, tipo "memorial"); o botão
  "▶ Jogar" vira "🪦 Ver personagem falecido".
- O jogador só volta a jogar criando uma ficha NOVA (o Criador já suporta
  criar quantas fichas quiser); a antiga fica no histórico da campanha.
- O Mestre pode reverter isto manualmente (recurso de exceção — ex.:
  ressurreição em jogo) num botão "Reviver" na aba Fichas, que faz
  `status = 'vivo'` de novo.

### Fluxo de entrada do jogador
1. Jogador faz login com email/senha (ou, mais simples numa 1ª versão,
   mantém-se usuário/senha mas agora por CONTA, não por variável de ambiente).
2. Se pertence a 1 campanha só → entra direto nela (`session['campanhaAtiva']`).
3. Se pertence a 0 ou 2+ → tela "Minhas Campanhas": lista as que já é membro
   + campo "Entrar com código de convite" (usa `codigoConvite` da campanha).
4. Dentro da campanha ativa, só vê fichas com `donoUid === session['uid']`
   (ou todas, se o Mestre permitir modo "mesa aberta" — flag por campanha).

### Como o Mestre gere tudo
- Tela "Minhas Campanhas" equivalente para o Mestre: criar campanha nova
  (gera `codigoConvite`), arquivar campanha antiga, trocar entre campanhas que
  mestra.
- Dentro da campanha: aba "Membros" nova em `mestre.html` — lista jogadores
  convidados, permite remover/bloquear, ver o `codigoConvite` para partilhar.
- Toda a configuração que já existe hoje (fichas, bestiário visível, notas,
  encontros, itens do Mestre, loja especial) passa a estar automaticamente
  isolada por campanha, porque já vive dentro do documento `campanhas/<id>`.

### Ficheiros afetados
- `app.py` — reescreve `USUARIOS` (dict fixo) para consultar a coleção
  `usuarios`; `login_obrigatorio()` passa a também validar
  `session['campanhaAtiva']` nas rotas que precisam; novas rotas:
  `/minhas-campanhas`, `/campanha/nova`, `/campanha/entrar` (código convite),
  `/campanha/<id>/membros` (GET/POST, Mestre).
- `templates/login.html` — campo de email real; novo `templates/campanhas.html`
  (tela "Minhas Campanhas").
- `templates/mestre.html` — nova aba "Membros".
- `static/js/app.js` — UI da aba Membros; ficha marcada `morto` vira
  read-only na lista (`renderFichas()`).
- `static/js/jogo.js` — `testeMorte()` grava `ficha.status`/`ficha.morteEm`;
  `abrir()` verifica `status==='morto'` e renderiza modo leitura.
- `static/js/jogador.js` — filtra fichas por `donoUid` (ou mostra todas, se
  "mesa aberta"); botão "Ver personagem falecido".
- `firebase-rt.js` — segurança do Firestore precisa de regras por campanha
  (hoje é tudo aberto por trás de login simples; ver `SEGURANCA.md`).

### Passos de implementação sugeridos
1. Migrar `USUARIOS` para uma coleção `usuarios` (com fallback ao dict fixo
   atual, para não quebrar o ambiente local `USE_LOCAL_DB=1` de um dia para o
   outro — o `data/usuarios.json` pode ser o equivalente local).
2. Introduzir `campanhas` como entidade própria com membros e código de
   convite (o documento `campanha/<id>` de hoje vira o "miolo" de dados
   dentro de `campanhas/<id>`).
3. Tela "Minhas Campanhas" + fluxo de entrar por código.
4. Adicionar `donoUid` a fichas novas (fichas antigas sem dono ficam
   "livres", migração silenciosa — mesmo princípio já usado nas Fases 6/7).
5. Implementar `status`/`morteEm` e o modo read-only de ficha morta.
6. Aba "Membros" no Mestre.
7. Regras de segurança do Firestore por campanha (documento à parte,
   revisão de segurança dedicada antes de ir para produção).

---

## Fase 11 — NPCs (lojistas, aliados, inimigos)

### Objetivo
Dar aos NPCs uma ficha própria — hoje só existem "monstros" (bestiário
estático) e "aliados avulsos" (criados ad-hoc no rastreador de combate,
sem persistência fora do combate). Um NPC precisa persistir ENTRE combates
(o lojista continua a existir depois da compra; o aliado recorrente lembra
o jogador).

### Estrutura de dados sugerida
Novo array no estado da campanha (mesmo padrão de `notas`/`encontros`):
```jsonc
// campanhas/<id>.npcs[]
{
  "id": "npc_ferreiro01",
  "nome": "Grimlock, o Ferreiro",
  "tipo": "lojista",              // "lojista" | "aliado" | "inimigo" | "neutro"
  "descricao": "Anão rabugento, dono da ferraria de Phandalin.",
  "retrato": null,                 // futuro: URL de imagem
  "statBlock": {                   // opcional — só p/ NPCs que podem entrar em combate
    "ca": 11, "pvMax": 8, "pvAtual": 8,
    "atributos": { "for": 12, "des": 10, "con": 12, "int": 10, "sab": 11, "car": 9 },
    "acoes": ["Martelo (+2, 1d4+1 concussão)"]
  },
  "lojaId": "loja_ferraria01",      // presente só se tipo === "lojista" (ver Fase 12)
  "visivelParaJogadores": true,
  "notasPrivadas": "Secretamente informante do culto do dragão.",  // só o Mestre vê
  "localizacao": "Phandalin — Ferraria"
}
```

### Ficheiros afetados
- `app.py` — `ESTADO_PADRAO['npcs'] = []`; endpoints `GET/PUT /api/npcs`
  (GET: jogador só recebe os com `visivelParaJogadores: true` e sem
  `notasPrivadas`, igual ao padrão já usado em `/api/notas`).
- **Novo** `static/js/npc.js` — módulo `NPC.abrir(npc, opts)` (modal de
  ficha de NPC), reaproveitando o máximo de `jogo.js`/`app.js` (barra de
  PV, ações clicáveis) mas mais simples (sem magias/subida de nível).
- `templates/mestre.html` — nova aba "NPCs" (lista + botão "+ Novo NPC");
  modal de edição parecido com o de monstro/ficha.
- `static/js/app.js` — CRUD de NPCs (`carregarNpcs`/`salvarNpcs`), e opção
  "+ NPC" no rastreador de combate (hoje só tem "+ Aliado" a partir do
  bestiário — passa a poder puxar de `npcs[]` também).
- `static/js/jogador.js`/`templates/jogador.html` — aba "NPCs Conhecidos"
  (só os `visivelParaJogadores`).

### Passos de implementação
1. Backend: chave `npcs` + endpoints (copiar o padrão de `notas`, que já
   filtra por visibilidade).
2. `npc.js`: modal simples (nome, tipo, descrição, stat block opcional).
3. Aba "NPCs" no Mestre com CRUD.
4. Ligar ao rastreador de combate: "+ NPC" ao lado de "+ Aliado"/"+ Monstro"
   em `app.js` (reusa a mesma estrutura de combatente já existente).
5. Aba "NPCs Conhecidos" no lado do jogador (read-only).
6. (Opcional, mais tarde) Retrato/imagem do NPC — precisa de upload ou URL,
   fora de escopo até haver hospedagem de imagens decidida.

---

## Fase 12 — Lojas geridas por NPC

### Objetivo
Cada NPC do tipo `lojista` tem uma loja própria (inventário e preços
próprios, diferentes uns dos outros — hoje só existe UMA loja global via
`equipamento.js`/`itens.js`). O jogador compra do NPC específico, não de um
catálogo universal.

### Relação com a Fase 9 (já implementada)
A Fase 9 criou `static/js/loja.js` com `itensLojaBasica()`/`itensLojaEspecial()`
+ categorias unificadas. Uma loja de NPC é, na prática, um SUBCONJUNTO
filtrado desses catálogos + preços próprios + estoque limitado — reaproveita
`CATEGORIAS_LOJA`/`classificarItemLoja()` para a navegação por categoria.

### Estrutura de dados sugerida
```jsonc
// campanhas/<id>.lojas[]  (uma por NPC lojista)
{
  "id": "loja_ferraria01",
  "npcId": "npc_ferreiro01",
  "nome": "Ferraria de Grimlock",
  "estoque": [
    { "nome": "Espada Longa", "origem": "catalogo", "qtd": 3, "precoPO": 15, "multiplicador": 1.0 },
    { "nome": "Cota de Malha", "origem": "catalogo", "qtd": 1, "precoPO": 90, "multiplicador": 1.2 },
    { "nome": "Poção de Cura", "origem": "catalogo", "qtd": 5, "precoPO": 60, "multiplicador": 1.2 }
  ],
  "compraDoJogador": { "aceita": true, "multiplicador": 0.4 },  // fração do preço de tabela ao comprar do jogador
  "reabastecePeriodicamente": true,
  "ultimoReabastecimento": "2026-08-01T00:00:00Z"
}
```
- `origem` aponta para `catalogo` (equipamento.js), `itens_padrao` (itens.js)
  ou `itens_magicos`/`itens_mestre` (se o Mestre quiser um lojista raro que
  vende itens especiais — reaproveita o gate da Loja Especial da Fase 9:
  a loja do NPC pode ignorar o gate, já que é o próprio Mestre quem decide
  o que aquele lojista vende).
- `qtd: -1` = estoque infinito (lojas comuns de vila); `qtd` finito = estoque
  que esgota e (opcionalmente) reabastece com o tempo.

### Ficheiros afetados
- `app.py` — `ESTADO_PADRAO['lojas'] = []`; `GET/PUT /api/lojas`.
- `static/js/loja.js` — nova função `itensDaLojaNpc(loja)` que resolve cada
  entrada do `estoque` para os dados completos do item (nome, descrição,
  peso) usando os catálogos já existentes, aplicando `precoPO`/`multiplicador`
  próprios da loja em vez do preço de tabela.
- `static/js/npc.js` (Fase 11) — se o NPC for lojista, o modal ganha um botão
  "🛒 Ver loja" que abre a UI de loja (reaproveita o HTML/CSS de
  `loja-abas`/`loja-item` já criado na Fase 9).
- `static/js/app.js` — CRUD de lojas no painel do Mestre (editar estoque,
  preços, ativar/desativar reabastecimento).
- `static/js/jogo.js` — ao comprar de uma loja de NPC (em vez da loja
  genérica), decrementa `estoque[].qtd` (se não for infinito) e credita ouro
  ao... nada, hoje o jogo não tem "banco" do NPC, então é só decremento de
  estoque + débito do ouro do jogador (não precisa dar ouro a ninguém).
  Vender ao NPC (`compraDoJogador`) incrementa `estoque[].qtd` se o item já
  existir na lista, ou soma como entrada nova com preço recalculado.

### Passos de implementação
1. Backend: chave `lojas` + endpoints.
2. `itensDaLojaNpc(loja)` em `loja.js`.
3. CRUD de loja no Mestre (provavelmente dentro do modal de edição do NPC
   lojista, não uma aba própria — mais natural).
4. UI de compra/venda no lado do jogador, reaproveitando os componentes de
   `loja-item`/`loja-abas` (Fase 9) com o estoque da loja do NPC.
5. Lógica de decremento de estoque + reabastecimento periódico (job simples:
   ao carregar a loja, se `reabastecePeriodicamente` e passou N dias
   [campo configurável] desde `ultimoReabastecimento`, repõe `qtd` ao valor
   original guardado em `estoqueBase` — precisa adicionar esse campo).

---

## Fase 13 — Monstros & Sistema de Loot

### Objetivo
Hoje o bestiário (`static/js/monstros.js`) só tem stats de combate — não tem
tabela de tesouro. Adicionar loot ligado a cada monstro (ou a uma tabela por
Nível de Desafio/tipo), e um botão "🎲 Gerar Loot" no rastreador de combate
que soma automaticamente o que os monstros abatidos deixam cair.

### Estrutura de dados sugerida
Extensão do próprio `MONSTROS` (dado estático, sem precisar de backend):
```jsonc
// dentro de cada entrada de MONSTROS (monstros.js)
{
  "nome": "Goblin",
  // ...campos já existentes (nd, pv, ca, acoes...)
  "loot": {
    "ouroFormula": "2d6",              // po por criatura abatida
    "itensGarantidos": [],              // itens que SEMPRE aparecem (raro — chefes)
    "tabela": [                          // rolagem ponderada (peso relativo)
      { "item": "Adaga enferrujada", "peso": 40, "qtd": 1 },
      { "item": "Poção de Cura", "peso": 5, "qtd": 1 },
      { "item": null, "peso": 55 }        // "nada" — item null = sem drop
    ]
  }
}
```
Tabelas GENÉRICAS por Nível de Desafio (para monstros sem `loot` próprio),
parecido com a Tabela de Tesouro Individual do Guia do Mestre:
```jsonc
// novo: static/js/loot.js
const TABELAS_LOOT_POR_ND = {
  '0-4':  { ouroFormula: '5d6', tabela: [ /* moedas + item comum ocasional */ ] },
  '5-10': { ouroFormula: '4d6×10', tabela: [ /* item incomum ocasional */ ] },
  '11-16':{ ouroFormula: '2d8×100', tabela: [ /* item raro ocasional */ ] },
  '17+':  { ouroFormula: '4d6×1000', tabela: [ /* item muito raro/lendário ocasional */ ] },
};
```

### Ficheiros afetados
- **Novo** `static/js/loot.js` — `TABELAS_LOOT_POR_ND`, função
  `rolarLoot(monstro)` (usa `monstro.loot` se existir, senão cai na tabela
  genérica pelo ND) e `rolarLootEncontro(combatentes)` (soma vários).
- `static/js/monstros.js` — adicionar `loot` a pelo menos os monstros mais
  comuns (trabalho de conteúdo, incremental — não precisa ser dia 1 em todos
  os ~53+ monstros).
- `static/js/app.js` — botão "🎲 Gerar Loot" na aba Combate (ativo quando há
  combatentes "monstro" com PV ≤ 0); mostra resultado + botão "📦 Enviar
  tudo ao grupo" (reaproveita a lógica de `envioBtn`/`itens_mestre` já usada
  na Fase F/8, mas dividido entre os PJs vivos, ou dado a escolher um só).
- `templates/mestre.html` — bloco de resultado do loot na aba Combate.

### Passos de implementação
1. `loot.js` com as tabelas genéricas por ND (não depende de dados por
   monstro — já funciona no dia 1 para qualquer monstro do bestiário).
2. Botão "🎲 Gerar Loot" no combate: identifica monstros com PV 0 na rodada,
   rola `rolarLootEncontro()`, mostra resultado.
3. Distribuir: por enquanto, manual (Mestre decide quem fica com o quê e usa
   "📦 Enviar à ficha" já existente); like automatizar 100% é um passo 2.
4. Ir adicionando `loot` específico aos monstros mais usados/chefes
   (trabalho de conteúdo contínuo, como já acontece com magias/subclasses).

---

## Fase 14 — Grid Virtual / Mapa de Combate

### Objetivo
A maior mudança estrutural desta lista: dar posição real (x/y) a cada
combatente, calcular distância/alcance de verdade, e permitir desenhar áreas
de efeito, cobertura e linha de visão sobre um mapa. Hoje (confirmado
lendo `app.js`/`jogo.js`) o combate é só uma LISTA por iniciativa — não há
nenhum conceito de posição, o que já foi documentado como limitação na Fase
8A (as ajudas táticas usam toggles manuais em vez de detecção automática).
Esta fase é o que resolveria isso de vez.

### Estrutura de dados sugerida
Extensão do `combate` já existente (`app.py`/`app.js`):
```jsonc
// campanhas/<id>.combate
{
  "combatentes": [
    { "id": "c1", "nome": "Fizzbang", /* ...campos já existentes... */,
      "pos": { "x": 4, "y": 6 },        // novo — em "quadrados" (1 quadrado = 1,5m, padrão 5e)
      "tamanho": 1                        // novo — em quadrados (1 = médio/pequeno, 2 = grande, etc.)
    }
  ],
  "mapa": {                                // novo bloco
    "id": "mapa_caverna01",
    "imagemUrl": null,                     // futuro: mapa de fundo (upload/URL)
    "larguraQuadros": 20,
    "alturaQuadros": 15,
    "terrenoDificil": [ { "x": 5, "y": 5 }, { "x": 6, "y": 5 } ],
    "obstaculos": [ { "x": 8, "y": 3, "bloqueiaVisao": true, "cobertura": "total" } ],
    "areasDeEfeito": [                       // temporárias — magia de área ativa
      { "id": "ae1", "tipo": "circulo", "centro": { "x": 10, "y": 10 }, "raioQuadros": 4,
        "origem": "Bola de Fogo", "expiraNoTurno": 12 }
    ]
  }
}
```

### Cálculos-chave a implementar (novo módulo, sem depender de mapa
"desenhado" — funciona só com a grelha lógica):
- **Distância** entre dois combatentes: distância de Chebyshev (regra 5e:
  diagonal conta como 1 quadrado, não 1,5) — `Math.max(Math.abs(dx), Math.abs(dy))`.
- **Alcance de arma/magia**: comparar distância (em metros = quadrados × 1,5)
  contra o alcance já parseável hoje em `equipamento.js` (props tipo
  "municao (24/96m)") e em `compendio.js` (`alcance` das magias, ex. "18m").
- **Adjacência**: distância ≤ 1 quadrado → substitui os toggles manuais
  `estadoTatico.inimigoAdjacente`/`aliadoAdjacenteAoAlvo` da Fase 8A por
  detecção real.
- **Área de efeito**: para cada `areaDeEfeito` ativa, calcular quem está
  dentro (círculo: distância ≤ raio; cone/linha: fórmulas geométricas mais
  elaboradas — podem vir depois, começar só por círculo/esfera que cobre a
  maioria das magias de dano em área).
- **Cobertura/linha de visão**: ray casting simples entre os dois pontos
  contra a lista de `obstaculos` (grelha discreta faz isto ser só percorrer
  as células no caminho de Bresenham entre origem e destino).

### Ficheiros afetados
- **Novo** `static/js/grid.js` — toda a matemática acima (`distanciaQuadros`,
  `dentroDoAlcance`, `combatentesNaAreaEfeito`, `temLinhaDeVisao`,
  `nivelDeCobertura`), puro/sem DOM (mesmo padrão de `multiclasse.js`/
  `ajudatatica.js` desta sessão).
- **Novo** `static/js/mapa-ui.js` — renderização do grid em `<canvas>` ou
  `<svg>` (SVG é mais simples de fazer clicável/arrastável sem reinventar
  hit-testing); desenha combatentes como tokens arrastáveis, obstáculos,
  áreas de efeito ativas.
- `app.py` — `ESTADO_PADRAO['combate']['mapa'] = null` por padrão (compatível
  com combates sem mapa, que continuam a funcionar como hoje — lista pura);
  `pos`/`tamanho` em cada combatente são opcionais.
- `static/js/app.js` — ao arrastar um token no mapa, atualiza `pos` do
  combatente e salva; painel lateral мostra distância/alcance calculados
  para o alvo selecionado.
- `static/js/ajudatatica.js` (Fase 8A) — trocar os toggles manuais por
  chamadas a `grid.js` QUANDO existir mapa ativo no combate (fallback para
  os toggles manuais quando não há mapa — mantém compatibilidade com mesas
  que preferem jogar "theatre of the mind").
- `templates/mestre.html`/`templates/jogador.html` — novo container para o
  mapa na aba Combate (`<div id="mapaCombate">`), visível só quando
  `combate.mapa` existir.

### Passos de implementação (a maior fase — dividir em sub-fases)
1. **14.1 Matemática pura**: `grid.js` com distância/alcance/adjacência,
   testado sem UI nenhuma (só funções, como os módulos desta sessão).
2. **14.2 Grid sem mapa de fundo**: SVG com uma grelha lisa (sem imagem),
   tokens coloridos arrastáveis, sem obstáculos nem área de efeito — já dá
   posição/distância real e resolve a maior dor (adjacência automática).
3. **14.3 Ligar à Fase 8A**: `ajudatatica.js` passa a usar `grid.js` quando
   há mapa ativo (inimigo adjacente, alcance de movimento real restante).
4. **14.4 Obstáculos + cobertura**: desenhar obstáculos simples (retângulos/
   círculos bloqueadores), calcular cobertura entre atacante e alvo.
5. **14.5 Áreas de efeito**: overlay visual ao conjurar magia de área
   (círculo/cone/linha), listar automaticamente quem é afetado.
6. **14.6 Mapa de fundo com imagem**: upload/URL de imagem de fundo,
   grid sobreposto (funcionalidade "bonita", mas a menos crítica — deixar
   por último).

---

## Como estas fases se encaixam

```
Fase 10 (Autenticação/Campanha)  ← fundação: dono de campanha, membros, morte/permanência
        │
        ├── Fase 11 (NPCs)               ← precisa de campanha p/ persistir NPCs por mesa
        │        │
        │        └── Fase 12 (Lojas por NPC)   ← precisa de NPCs (lojista) + reusa loja.js (Fase 9, já pronta)
        │
        ├── Fase 13 (Monstros & Loot)    ← independente das outras, pode ser feita em paralelo
        │
        └── Fase 14 (Grid Virtual)       ← a maior; beneficia de vir depois de 10 (mapa por campanha)
                 │
                 └── liga-se de volta à Fase 8A (ajudatatica.js) já implementada,
                     substituindo os toggles manuais por detecção automática
```

**Recomendação de ordem de execução:** 10 → 11 → 13 → 12 → 14 (Monstros/Loot
antes de Lojas por NPC porque é mais simples e não depende de NPCs; Grid por
último porque é a maior mudança estrutural e as outras fases não dependem
dela para funcionar).
