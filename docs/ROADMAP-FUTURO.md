# 🗺️ Roadmap Futuro — Fases 10+

> Guia de planeamento das próximas fases. As Fases 10 e 11 já foram entregues
> (notas ✅ nas secções); o resto é plano detalhado: objetivo, estrutura de
> dados, ficheiros afetados e passos. **A ordem de trabalho é a do
> [Backlog Priorizado](#-backlog-priorizado--atualização-de-05072026)** logo
> abaixo, que integra as fases antigas (12–14) com os pedidos novos.

## Índice
- [🎯 Backlog Priorizado (05/07/2026)](#-backlog-priorizado--atualização-de-05072026) ← **começar por aqui**
- [Fase 10 — Autenticação e Sistema de Campanha](#fase-10--autenticação-e-sistema-de-campanha) ✅
- [Fase 11 — NPCs (lojistas, aliados, inimigos)](#fase-11--npcs-lojistas-aliados-inimigos) ✅
- [Fase 12 — Lojas geridas por NPC](#fase-12--lojas-geridas-por-npc)
- [Fase 13 — Monstros & Sistema de Loot](#fase-13--monstros--sistema-de-loot)
- [Fase 14 — Grid Virtual / Mapa de Combate](#fase-14--grid-virtual--mapa-de-combate)
- [Como estas fases se encaixam](#como-estas-fases-se-encaixam)

---

# 🎯 Backlog Priorizado — atualização de 05/07/2026

Pedidos novos do Ismaile organizados por prioridade, integrados com as fases
já planeadas (12–14). Regra: **bugs e integridade primeiro, mesa de jogo
depois, ferramentas do Mestre a seguir, visual e IA por último**.

## 🔴 P0 — Bugs e integridade (fazer primeiro)

> **✅ P0 entregue em 05/07/2026** (B1 + B2 — ver `CHANGELOG.md`).

### B1. Bug: atualizar a página perde tudo (rascunho persistente)
**Problema:** a meio da criação de uma ficha (ou NPC, ou item do Mestre), um
F5/refresh descarta tudo e volta ao início — o estado vive só em memória.
**Solução:** autosave do rascunho em `localStorage` (por campanha + contexto),
gravado a cada alteração; ao reabrir o Criador, oferecer "📝 Continuar de onde
parou?" (restaura) ou "Começar do zero" (descarta). Limpar o rascunho ao
salvar/cancelar explicitamente.
**Ficheiros:** `criador.js` (principal — serializar `estado` + passo atual),
`npc.js` e `itensmestre.js` (mesmo padrão nos modais).
**Passos:** 1) chave `dnd_rascunho_<campanha>_<contexto>`; 2) autosave
debounced no `renderPreview`/inputs; 3) prompt de restauro em `abrir()`;
4) limpar em salvar/excluir/cancelar.

### B2. Integridade: XP e ouro só via Mestre
**Problema:** o jogador consegue somar XP e ouro à própria ficha no Modo de
Jogo — quebra o controlo do Mestre sobre a progressão.
**Solução:** esconder os controlos "+ Ganhar XP" e "+/− ouro" do Modo de Jogo
quando `!window.EH_MESTRE`; ouro do jogador só muda por compra/venda na loja
(já debitam/creditam certo) e por envio do Mestre; XP só pelo Mestre — o
painel "📦 Enviar à ficha" ganha um campo de XP (além de ouro/item), com
opção "enviar a todos" para recompensa de grupo.
**Ficheiros:** `jogo.js` (gating por EH_MESTRE), `app.js` (campo XP no envio),
`templates/mestre.html`.

## 🟠 P1 — Combate na mesa (a seguir aos bugs)

### C1. Rolagem com alvo, dano real, defesas e dado físico ✅
**Objetivo:** o jogador escolhe um alvo do combate na própria ficha; o ataque
compara automaticamente com a CA do alvo (acertou/errou) e o dano rolado é
aplicado de verdade ao alvo (com resist/vuln/imune); as defesas funcionam ao
contrário (o Mestre indica a CD/ataque do inimigo, o jogador rola a salva/CA
e o resultado aplica-se); e TODAS as rolagens ganham a opção "🎲 usei dado
físico" com campo para digitar o resultado real da mesa.
**Estrutura:** o jogador já recebe `estado.combate` em tempo real; falta um
canal jogador→combate (hoje só o Mestre escreve no combate). Opções: (a) API
`POST /api/combate/acao` validada no servidor (preferível), ou (b) permitir
PUT de combate a jogadores (mais simples, menos seguro). Decidir na hora.
**Ficheiros:** `jogo.js` (seletor de alvo + fluxo de ataque/dano/salva +
input de dado físico), `app.py` (endpoint de ação), `app.js`/`jogador.js`
(render do combate).
**Ligação:** é meio caminho para a Fase 14 (grid) — o conceito de "alvo"
fica pronto.

## 🟡 P2 — Ferramentas do Mestre

### M1. NPC com ficha completa (igual a personagem) ✅
**Objetivo:** além do stat block simples (Fase 11), criar NPC pelo **Criador
completo** — raça, classe, antecedente, personalidade (traços/ideais/
ligações/defeitos), história, equipamento. Basicamente uma ficha de personagem
marcada como NPC.
**Abordagem:** `Criador.abrir(null, { modoNpc: true, aoSalvar: ... })` — a
ficha gerada vai para `npcs[]` com `fichaCompleta: {...}` em vez de
`statBlock` manual; o cartão do NPC ganha botão "▶ Ver ficha" (Modo de Jogo
read-only do Mestre) e entra no combate com os ataques da ficha (o motor
`ataqueArma`/truques já existe).
**Ficheiros:** `npc.js` (botão "+ NPC completo", card), `criador.js` (flag
`modoNpc` — pula validação de história? NÃO: NPC completo também merece; mas
pular a trava de ouro/kit se o Mestre quiser), `app.js` (combate lê
`fichaCompleta` como lê ficha de PJ).

### M2. Criaturas do bestiário como NPCs persistentes ✅
**Objetivo:** "promover" uma criatura do bestiário a NPC da campanha (com
nome próprio, ciente/senciente ou não) — ex.: um Goblin vira "Grik, o
Batedor", persiste entre sessões e entra em combate contra o grupo.
**Abordagem:** botão "⭐ Promover a NPC" no cartão do monstro (aba Bestiário)
→ pré-preenche o modal de NPC com o stat block da criatura (CA/PV/atributos/
ações já convertidos); opção "criatura aleatória" (sorteia do bestiário
filtrado por ND).
**Ficheiros:** `app.js` (botão no bestiário), `npc.js` (preencher modal a
partir de um monstro), `monstros.js` (nenhuma mudança — só leitura).

### M3. Gerador de ambientes urbanos (ocupação de locais) ✅

> **✅ Entregue em 05/07/2026** — 10 ambientes em `static/js/ambientes.js`,
> card "🏘️ Ocupar Ambiente" nos Geradores, ~10% de variações raras com botão
> para lançar o encontro no combate (ver `CHANGELOG.md`).

**Objetivo:** acervo de ambientes (🏠 casa, 🏚️ casa grande, 🍺 taverna, 🐴
estábulo, 🏛️ mansão, 👥 multidão, ⛪ templo, 🏪 mercado...) que gera quem/o
que está lá dentro: nº de pessoas e perfil (família, aristocratas, ladrões,
comerciantes...) — e, nas variações raras, encontros (monstros no porão,
enxame de ratos...). Regra da dita: **~90% dos resultados são normais** (a
cidade é uma cidade); os 10% restantes puxam das tabelas de encontro.
**Abordagem:** novo `static/js/ambientes.js` com tabelas curadas por ambiente
(`{ tipo, dados: '2d4', perfis: [{peso, texto}], raros: [{peso, texto,
monstros?: [...] }] }`); card novo na aba **Geradores** ("🏘️ Ocupar
Ambiente"): escolhe ambiente → gera ocupantes → botão "lançar encontro no
combate" quando sair monstro (reusa `addMonstro`).
**Ficheiros:** `ambientes.js` (novo), `app.js` (card no Geradores),
`templates/mestre.html`.

### M4. Banco de NPCs partilhado entre utilizadores ✅

> **✅ Entregue em 05/07/2026** — banco pessoal por utilizador
> (`bancos_npc/<uid>`), 💾 nos cartões, secção "Meu Banco de NPCs" no Mestre
> e no jogador, Mestre vê bancos dos membros e traz NPCs para a mesa com
> validação de membresia no servidor (ver `CHANGELOG.md`).

**Objetivo:** cada utilizador (jogador ou mestre) pode criar NPCs num banco
PESSOAL (fora da campanha) e partilhá-los; o Mestre pode copiar NPCs do banco
de qualquer membro para a campanha ativa ("salvar para mim").
**Estrutura:** coleção `bancos_npc/<uid>` = lista de NPCs pessoais (mesmo
shape da Fase 11); API `GET/PUT /api/banco_npc` (o próprio) + `GET
/api/banco_npc/<uid>` (Mestre da campanha vê o banco dos membros);
botões "💾 Guardar no meu banco" / "📥 Trazer para a campanha".
**Ficheiros:** `app.py`, `npc.js`, `templates/*`.
**Dependência:** contas da Fase 10 (✅ pronto).

### (Fase 13 já planeada) Monstros & Loot — encaixa aqui no P2 ✅
Tabelas de tesouro/drops por ND ao derrotar monstros — ver secção detalhada
[Fase 13](#fase-13--monstros--sistema-de-loot). Combina com M3 (os encontros
raros dos ambientes dão loot).

## 🟢 P3 — Campanha viva

### K1. Campanhas aprimoradas + aviso de combate ✅

> **✅ Entregue em 05/07/2026** — flag `combate.ativo`, banner "⚔️ COMBATE
> INICIADO" com som WebAudio e salto para a aba Combate no jogador; aba e
> cabeçalho sinalizam "em combate" (ver `CHANGELOG.md`).

**Objetivo:** dentro da campanha ativa, quando o Mestre inicia um combate,
todos os jogadores recebem um aviso imediato ("⚔️ COMBATE INICIADO — rolem
iniciativa!") — banner destacado + som opcional; e a tela do jogador salta
para a aba Combate. Estado "em combate" visível na campanha.
**Abordagem:** flag `combate.ativo` no estado (o Mestre liga ao adicionar
combatentes/rolar iniciativa, desliga em "Limpar"); os listeners RT do
jogador detetam a transição false→true e disparam o aviso.
**Ficheiros:** `app.js` (setar flag), `jogador.js` (banner/som/troca de aba),
`style.css`.

### K2. Livro-jogo: aventuras como grafo de nós/escolhas (evolução do mapa mental)

> **✅ v1 entregue em 05/07/2026** — ver `CHANGELOG.md`. O K2 evoluiu de
> "mapa mental do Mestre" para um **motor de livro-jogo** (decisão de
> arquitetura de 05/07 com o Ismaile): campanhas estruturadas como grafo
> dirigido de cenas jogáveis, reutilizáveis e partilháveis.

**Arquitetura (decisão central):** DEFINIÇÃO separada de PROGRESSO.
- Definição = grafo `{ id, titulo, limites:{jogadoresMax,nivelMin,nivelMax},
  noInicial, nos: [{id, titulo, tipo (narracao|encontro|social|assalto|
  descanso|final), narracao, notasMestre, resultado?, encontro:[{nome,qtd}],
  saidas:[{para, rotulo, aviso ('' | mortal | beco)}], npcs?, gridId?}] }` —
  vive na biblioteca PESSOAL do autor (`aventuras/<uid>`, padrão M4).
- Progresso = `aventura_ativa` no estado da campanha: SNAPSHOT da definição
  + `noAtual`, `historico`, `nosCompletados`. Editar a biblioteca não muda
  uma mesa em curso; a mesma aventura roda em N mesas.

**v1 entregue:** biblioteca (criar/editar/duplicar/excluir), editor de grafo
em LISTA (nós com narração, notas 🔒, encontro do bestiário, saídas com
rótulo e aviso 💀/🚧), validador de grafo (função pura: ids duplicados,
saídas para nós inexistentes, órfãos por BFS, becos não-finais, ausência de
caminho de vitória), "▶ Iniciar" com snapshot, painel de condução (narração,
lançar encontro no combate via `addMonstro`, completar nó, avançar por
escolha com trilha percorrida, encerrar). Jogador só vê título/emCurso.

**Guia do processo e roadmap detalhado dos jogadores:** ver
`docs/LIVRO-JOGO.md` (pipeline de conteúdo + passos P1-P7).

**Próximos passos do livro-jogo (ordem):**
1. **Escolhas na tela dos jogadores** — o Mestre "abre" as saídas do nó; os
   jogadores veem os botões e votam (aviso estilo K1); o Mestre confirma.
2. **NPCs por nó** — referências ao banco M4 nos nós, com cartões na condução.
3. **Partilha de aventuras** — Mestre copia aventuras de membros (padrão do
   `GET /api/banco_npc/<uid>`); validação de limites (nº jogadores/nível) ao iniciar.
4. **Canvas SVG (v2 do editor)** — nós arrastáveis + linhas, sem lib externa.
5. **Grid por nó** — quando a Fase 14 existir, cada nó aponta um `gridId`.
6. **CT1/Phandelver** passa a ser escrito NESTE formato (primeira aventura
   oficial pronta, exemplo para Mestres iniciantes).
   > ✅ Infra de modelos prontos entregue em 05/07/2026
   > (`static/js/aventurasprontas.js` + botão "📚 Importar modelo"), com a
   > primeira aventura oficial: **Ninho da Rainha Dragão — Greenest em
   > Chamas** (18 nós, hub, becos, mortes sinalizadas e infiltração até a
   > vitória). Phandelver segue o mesmo caminho quando chegar o CT1.

### (Fase 12 já planeada) Lojas geridas por NPC — encaixa aqui no P3 ✅
Inventário e preços próprios por lojista — ver secção detalhada
[Fase 12](#fase-12--lojas-geridas-por-npc). Depende de M1/M2 darem vida aos
lojistas; reusa `loja.js` da Fase 9.

## 🔵 P4 — Visual e IA

### U1. Loja com visual interativo (reforma de UI) ✅ (08/07/2026)
**Objetivo:** a loja (criação + Modo de Jogo) deixa de ser lista de linhas e
vira uma grelha visual: cartões com ícone grande por categoria, hover com
detalhe, feedback de compra (animação do ouro a descer), filtros mais
gráficos. Sem lib externa — CSS + emoji/SVG.
**Ficheiros:** `style.css` (principal), `criador.js`/`jogo.js` (markup das
linhas → cartões), `loja.js` (sem mudança de dados).
**Entregue:** helpers `iconeCategoriaLoja`/`cardLojaHtml`/`lojaFeedbackCompra`
em `loja.js` (só apresentação); `.loja-cards`/`.loja-card` + bolha flutuante
`.loja-fx-bolha` (keyframes `lojaFxSobe`) no CSS; `criador.js` (passo 5) e
`jogo.js` (Modo de Jogo) trocam `.loja-item` (linha) por cartão e disparam a
bolha "−X po" ao comprar. Filtros por categoria/abas continuam os mesmos.

### U2. Integração com IA (gerar fichas, histórias e NPCs) ✅ (08/07/2026)
**Entregue (v1):** endpoint `POST /api/ia/gerar` (+ `GET /api/ia/status`) em
`app.py`, chamando a API da Anthropic (Claude) via SDK oficial, com a chave em
`ANTHROPIC_API_KEY` (servidor, nunca no cliente). Gated por `login_obrigatorio`
(assinatura ativa) + quota diária por utilizador (`IA_QUOTA_DIARIA`, guardada em
`data/ia_uso.json`). Modelo configurável (`IA_MODELO`, padrão `claude-haiku-4-5`).
Tipos suportados: `historia`, `npc`, `gancho`, `ambiente`. Frontend: botão
"✨ Gerar com IA" na história prévia do Criador (`criador.js`/`_criador.html`),
que só aparece se o servidor tiver a chave. Sem a chave, degrada suave (botões
ocultos, resto do app intacto). **Decisões do Ismaile ainda em aberto:**
orçamento mensal, se o custo entra na assinatura ou é premium. **Próximo:**
botões nos NPCs (`npc.js`) reusando os tipos `npc`/`gancho`/`ambiente`.
**Objetivo:** botões "✨ Gerar com IA": história prévia do personagem (a
partir de raça/classe/antecedente/personalidade já escolhidos), NPC completo
(perfil + stat block), ganchos de aventura, descrições de ambiente.
**Abordagem:** endpoint Flask `POST /api/ia/gerar` (a chave da API fica no
servidor, NUNCA no cliente) chamando a API da Anthropic (Claude); limitar por
assinatura ativa (Fase 10.9) e por quota diária para controlar custo.
**Decisões em aberto (do Ismaile):** orçamento mensal de API; se o custo
entra no preço da assinatura ou é recurso premium; modelo (Haiku chega para
histórias curtas e é barato).
**Ficheiros:** `app.py` (endpoint + quota), `criador.js` (botão na história),
`npc.js` (botão no NPC), `.env` (`ANTHROPIC_API_KEY`).

### (Fase 14 já planeada) Grid Virtual — fecha o P4
Mapa de combate com posições, alcance, áreas e linha de visão — ver secção
detalhada [Fase 14](#fase-14--grid-virtual--mapa-de-combate). C1 (alvos)
já prepara metade do terreno.

## 🔒 Segurança / integridade (contínuo)

> Trilha de endurecimento do backend antes de escalar utilizadores pagantes.

- ✅ **PUT /api/fichas validado** (06/07/2026) — jogador só altera fichas
  próprias; XP e revivência ficam com o Mestre (ver `CHANGELOG.md`).
- ⏳ **Loja base validada no servidor** — hoje a loja do Modo de Jogo debita
  `ouro` no cliente (por isso `ouro` ficou editável na trava de fichas).
  Migrar para endpoints validados (como `POST /api/lojas/comprar` da Fase 12)
  fecha o último vetor de ouro do jogador.
- ⏳ **Tempo real com filtro no servidor** — o RT do Firestore entrega o
  estado cru da campanha (com `notasMestre`/`notasPrivadas`) e filtra no
  cliente; um jogador curioso lê tudo no DevTools. Resolver com
  `firestore.rules` por campo ou um documento "público" separado por mesa.
- ⏳ **Limite de tamanho de payload** nos PUTs (fichas, aventuras, lojas).

## 📦 Conteúdo (depois das ferramentas)

### CT1. Campanha pronta: Mina Perdida de Phandelver — Cap. 1 ✅ (08/07/2026)
Montar a campanha completa baseada no módulo (NPCs com ficha, lojas de
Phandalin, encontros por capítulo, ambientes, árvore de decisões) usando
todas as ferramentas acima. O antecedente "Herdeiro de Phandalin" (Fase 7) já
existe como semente.
**Entregue (v1):** Capítulo 1 "Emboscada Goblin" (`modelo_phandelver_emboscada`
em `aventurasprontas.js`) — grafo de 14 nós de livro-jogo, nível 1-2, com a
emboscada da Trilha de Triboar, o Esconderijo Cragmaw (lobos/ponte/Yeemik/Klarg),
o resgate de Sildar e o gancho do Aranha Negra / Castelo Cragmaw / mapa da Mina.
**Próximos capítulos** (Phandalin + Mantos Vermelhos, Castelo Cragmaw, Caverna
do Eco das Ondas) ficam como evolução futura, seguindo o mesmo formato.

## Ordem de trabalho sugerida (resumo de 1 linha cada)
1. **B1** rascunho persistente (bug do F5)
2. **B2** XP/ouro só via Mestre
3. **C1** alvo + dano real + dado físico
4. **M1** NPC com ficha completa → **M2** criatura→NPC → **M3** ambientes → **Fase 13** loot → **M4** banco de NPCs
5. **K1** aviso de combate → **Fase 12** lojas por NPC → **K2** árvore narrativa
6. **U1** loja visual → **U2** IA → **Fase 14** grid
7. **CT1** Phandelver

---

## Fase 10 — Autenticação e Sistema de Campanha

> **✅ v1 entregue em 04/07/2026** (passos 1–6 abaixo; ver `CHANGELOG.md`).
> Fica pendente o passo 7 (regras de segurança do Firestore por campanha) e,
> como evolução futura, recuperação de senha / Firebase Auth.

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

> **✅ v1 entregue em 05/07/2026** (passos 1–5; retrato/imagem fica pendente — ver `CHANGELOG.md`).

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

> **✅ Entregue em 05/07/2026 (v1)** — loja por NPC lojista com estoque e
> preços próprios, editor no cartão do NPC (Mestre), compra/venda do jogador
> validadas no servidor (`POST /api/lojas/comprar|vender`). Pendente:
> reabastecimento periódico (passo 5) e loja aberta direto do Modo de Jogo
> (ver `CHANGELOG.md`).

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

> **✅ Entregue em 05/07/2026** — `static/js/loot.js` (tabelas genéricas por
> ND + rolagem), `loot` próprio em 14 monstros comuns, botão "🎲 Gerar Loot"
> no Combate com "💰 Dividir ouro pelo grupo" (ver `CHANGELOG.md`).
> **✅ Concluída em 13/07/2026** — loot próprio em **100% do bestiário
> (59/59)** + integração à condução do livro-jogo (P6: "🎲 Loot do nó").

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

> **v1 entregue (08/07/2026): sub-fases 14.1 + 14.2.** `grid.js` (matemática
> pura: Chebyshev, alcance, adjacência, área circular, linha de visão/Bresenham)
> + `mapa-ui.js` (grid SVG sem imagem de fundo, tokens clicáveis, mover por
> clique, leitura de distância/adjacência para o alvo). Integrado na aba
> Combate do Mestre (`app.js`/`mestre.html`), opcional e retrocompatível
> (combate sem mapa continua igual).
>
> **14.3 entregue (08/07/2026):** `jogo.js` deteta adjacência REAL pelo grid
> quando há mapa ativo — `adjacenciaAutoDoMapa(f)` acha o combatente do jogador
> (`fichaId`), calcula "inimigo adjacente a mim" e "aliado adjacente ao alvo"
> (usando `jgAlvoId` da C1) via `Grid.adjacentes`, e a ajuda tática (Fase 8A)
> passa a usar esses valores. Na UI, os dois toggles manuais viram chips
> só-leitura "(auto)"; sem mapa (ou sem o meu token posicionado) caem de volta
> aos toggles manuais.
>
> **14.4 entregue (08/07/2026):** obstáculos + cobertura. `grid.js` ganhou
> `nivelDeCobertura(a,b,obstaculos)` (ray casting por Bresenham nas células do
> caminho; retorna meia/três-quartos/total com bónus de CA — total = sem linha
> de visão). `mapa-ui.js`: botão "🧱 Obstáculos" liga um modo em que o Mestre
> clica células para adicionar/remover paredes (desenhadas como quadrados
> escuros, `bloqueiaVisao` + cobertura); o topo do mapa mostra a cobertura do
> combatente do turno até o alvo (ex.: "meia cobertura (+2 CA)"). **Faltam:**
> 14.5 (áreas de efeito visuais), 14.6 (imagem de fundo). Ver detalhe abaixo.

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
