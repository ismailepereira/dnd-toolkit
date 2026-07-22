# 🔐 Roadmap — Acesso, Perfis & Interface

Pedido do Ismaile (22/07/2026). Duas dores centrais:

1. **A interface não comunica o produto.** Os menus estão "levemente separados", mas sem cor/categoria que
   diga ao público o que é cada coisa. A **página de admin ficou perdida no meio da campanha** — só se chega
   nela digitando `/admin` na URL.
2. **Os papéis não estão separados nem trancados.** Hoje qualquer jogador edita o próprio **ouro**, e não
   existe um lugar único que diga "você entra como quê". Falta também o **controle do Mestre sobre a evolução**
   do personagem.

**Prioridade decidida pelo Ismaile: interface e segurança administrativa PRIMEIRO** (Fases A e B).
Saque e furto (Fase C) vêm depois.

**Legenda:** `[ ]` a fazer · `[~]` em andamento · `[x]` pronto · 🔴 primeiro · 🟠 em seguida · 🟡 depois

---

## 📸 Como está hoje (levantado no código em 22/07)

- **Login** (`app.py:725`) mistura dois mundos: contas fixas de env (`Ismaile` = mestre, `jogador`) com
  `uid = legacy:<user>`, e contas registadas (`uid = u_...`).
- **Depois do login não há escolha:** conta legada cai direto em `/mestre` ou `/jogador` (`index`, `app.py:709`);
  conta registada cai em `/campanhas`. Não existe tela de "como quero entrar".
- **Admin existe mas é invisível:** `/admin`, `/admin/dashboard` e `/admin/assinaturas` são barrados por
  `eh_legado_mestre()` — ou seja, **só o `legacy:Ismaile`** — mas **nenhum menu leva até lá**.
- **Registo não pergunta o papel:** `app.py:~790` grava sempre `papelGlobal: 'jogador'`.
- **Papel por campanha** já existe e funciona (`papel_na_campanha`, `app.py:341`): mestre da campanha, membro
  jogador, ou nada.
- **Economia meio aberta:** o servidor já tranca XP e dono da ficha (`_sanitizar_fichas_jogador`), mas o
  **ouro continua editável pelo jogador** — inclusive por botões na UI (`jogo.js:1818-1819`,
  `jgOuroMais`/`jgOuroMenos`).
- **Modos de tela já existem** (Fases 17.1/17.2): `data-mode` nas abas + `<nav class="modos">` — Mestre em
  3 modos (Jogar/Preparar/Consultar), Jogador em 2 (Mesa/Consultar). **A Fase A3 constrói em cima disso**,
  não do zero.

---

## FASE A — Acesso e identidade visual 🔴 (PRIMEIRO)

### A1 ✅ Login isolado + Hub de modos (cards) — ENTREGUE 22/07
**Dor:** "queria separar o local que se faz login, e quando fizer login ter cards pra mim ter as opções."

- [x] **`/login` é só login** (já era — confirmado: nenhum conteúdo de campanha na tela).
- [x] Nova rota **`/hub`** (tela de escolha) logo após autenticar — cards grandes, um por modo, mostrando só
      os que a conta realmente tem direito:
  | Card | Quem vê | Leva para |
  |---|---|---|
  | 💰 **ADM — Créditos & Finanças** | só `papelGlobal = admin` | `/admin/dashboard` |
  | 👑 **Mestre — Controle Total** | só `papelGlobal = admin` | qualquer campanha como mestre, sem pedir mais nada |
  | 🎲 **Mestre** | `papelGlobal = mestre` | `/campanhas` (as que ele mestra) |
  | 🧝 **Jogador** | `papelGlobal = jogador` | `/campanhas` (as que participa) + suas fichas |
- [x] Conta com **um papel só** não fica presa numa tela extra: `/hub` entra direto no único modo dela;
      **`/hub?escolher=1`** força a tela (é o link **"⇄ Trocar de modo"**, posto no topo do Mestre, do Jogador,
      das Campanhas e do Admin).
- [x] O modo escolhido fica em **`session['modo']`**; o card do modo atual aparece marcado no hub.
- [x] **Guard no servidor:** `/modo/<chave>` só aceita modo que a conta pode usar — um jogador que tenta
      `/modo/adm` ou `/modo/total` é devolvido ao hub. (Verificado ao vivo.)
- [x] Helper **`papel_global_efetivo()`** isola a decisão de "quem é admin" num lugar só (hoje deduz do mestre
      legado) — é exatamente aí que a **A2** vai plugar o `papelGlobal='admin'` de verdade.

**Pronto quando:** ao logar, aparece a tela de cards; o admin vê os 4; um jogador registado vê só o dele;
`/admin` deixa de ser um endereço secreto e passa a ter porta de entrada. ✅

**Onde ficou:** `app.py` (`papel_global_efetivo`, `MODOS`, `modos_disponiveis`, rotas `/hub` e `/modo/<chave>`;
login/registo/index passam pelo hub), `templates/hub.html` (novo), `static/css/style.css` (`.hub-*` + as
variáveis **`--cat-*`** da paleta por categoria, que a A3 vai reusar nos menus).

### A2 🔴 Papéis de verdade (segurança administrativa)
**Dor:** "somente o mestre pode adicionar xp itens abrir o acesso a lojas, ou upar o personagem".

- [ ] **`papelGlobal` passa a ter 3 valores:** `admin` | `mestre` | `jogador` (hoje só existem os 2 últimos, e
      o admin é deduzido de "é o legacy:Ismaile").
- [ ] **No registo, a pessoa escolhe Mestre OU Jogador** — e é só isso que ela tem. `admin` **nunca** é
      escolhível no cadastro; é concedido só pelo dono.
- [ ] **Controle Total** = `papelGlobal = admin` ⇒ `papel_na_campanha()` devolve `mestre` em **qualquer**
      campanha, e o acesso às fichas de todos é liberado.
      ⚠️ **Nota de segurança (importante):** "sem senha" significa **sem uma segunda senha/PIN** — o poder vem
      de *estar logado naquela conta*. A área continua **exigindo login**; não existe URL pública com poder de
      admin. Se algum dia o Ismaile quiser uma trava a mais, o lugar é aqui.
- [ ] **Gate central no servidor:** um decorator `@exige_papel('admin'|'mestre')` aplicado às rotas, em vez do
      `if not eh_legado_mestre(...)` repetido. Toda rota de escrita sensível passa por ele.
- [ ] **Migração:** `legacy:Ismaile` vira `admin` automaticamente (não quebra o que já existe).

**Pronto quando:** um jogador não consegue, nem pela API crua, tocar em XP/ouro/itens/nível; e o admin
alcança tudo sem ceder senha a ninguém.

### A3 🔴 Menus por categoria e cor (a linguagem visual)
**Dor:** "organizar a interface dos menus, por cores e categorias... botões que façam mais sentido para o público."

- [ ] **Uma cor por categoria**, aplicada de forma consistente em aba, chip, botão e borda de card — reusando
      o `data-mode` que já existe (17.1/17.2), sem reescrever a navegação:
  | Categoria | Cor | Sentido para o público |
  |---|---|---|
  | 🎲 **Jogar / Mesa** | vermelho-âmbar quente | "é agora, é ação" |
  | 📖 **Preparar** | azul | "antes da sessão, com calma" |
  | 📚 **Consultar** | roxo/cinza | "referência, não muda nada" |
  | 💰 **ADM / Finanças** | verde | "dinheiro, do dono" |
  | 👑 **Controle Total** | dourado | "poder máximo, use com cuidado" |
- [ ] **Hierarquia de botão:** primário (ação da vez) × secundário (apoio) × perigo (destrutivo, sempre
      vermelho e sempre com confirmação). Hoje há `btn-primary`/`btn-secondary`/`btn-danger` — falta *usar com
      critério*, não por acaso.
- [ ] **Faixa de modo no topo** com a cor da categoria, para nunca haver dúvida de onde se está.
- [ ] Acessibilidade: contraste AA e **nunca cor sozinha** como informação (sempre ícone + texto junto).

**Pronto quando:** dá para saber, olhando 1 segundo, se a tela é de jogar, preparar, consultar ou de dinheiro.

### A4 🔴 Trancar a economia (o ouro sai da mão do jogador)
**Dor:** "remova a opção do player adicionar ouro, o ouro quem dá é o mestre ou o loot."

- [ ] **Remover os botões de ouro do jogador** (`jgOuroMais`/`jgOuroMenos` em `jogo.js`) — o jogador **vê** o
      ouro, não edita.
- [ ] **Servidor recusa** alteração de `ouro` vinda de jogador em `_sanitizar_fichas_jogador` (mesmo tratamento
      que o XP já tem). Sem isso, tirar o botão é só cosmético.
- [ ] **Entradas legítimas de ouro:** Mestre (dá/tira), **loot** e **venda na loja** — todas já validadas no
      servidor pela Fase 18.1.
- [ ] Mesma trava para **itens** e **abrir a loja**: só Mestre.

**Pronto quando:** um jogador com o DevTools aberto não consegue ficar rico.

---

## FASE B — Evolução só com permissão do Mestre 🟠

**Dor (pedido literal):** "a pessoa pode até upar a ficha dela, mas só evolui com permissão do mestre, enquanto
o mestre nao permitir a ficha fica sem alteração no jogo, porem se a pessoa upou e escolheu tudo até nivel 20
fica salvo na memoria e quando o mestre permitir a evolução ja vai ter os pressets da ficha na memoria."

### B1 🟠 Preset de progressão (planejar agora, valer depois)
- [ ] O jogador pode abrir o Criador e **planejar a subida até o nível 20** — classe, subclasse, magias,
      atributos, tudo.
- [ ] O resultado **não altera a ficha em jogo**. Vai para **`ficha.progressaoPlanejada`**: uma lista por
      nível (`{nivel, escolhas...}`), guardada no servidor junto da ficha.
- [ ] Na tela do jogador: "📈 Plano de evolução — níveis 2 a 20 planejados. **Aguardando liberação do Mestre.**"
- [ ] **O nível efetivo continua sendo `ficha.nivel`** — nada de PV/magia/recurso muda enquanto o Mestre não
      liberar.

### B2 🟠 Liberação pelo Mestre (1 clique)
- [ ] No painel do Mestre, por ficha: **"⬆️ Liberar nível X"**. Ao liberar, o preset já escolhido é **aplicado
      de uma vez** (sem o jogador ter que refazer as escolhas).
- [ ] Liberar em massa: "subir o grupo todo para o nível X" (o normal numa mesa).
- [ ] **Só o Mestre** dá XP e libera nível — validado no servidor (a Fase 18 já tranca o XP; falta o nível).
- [ ] Registro no log da campanha: quem subiu, quando, para que nível.

**Pronto quando:** o jogador planeja sozinho no meio da semana e, quando o Mestre libera na sessão, a ficha
sobe instantaneamente com as escolhas dele.

---

## FASE C — Saque e furto 🟡 (depois da A e da B)

### C1 🟡 Saquear alvo abatido
**Pedido:** "opção de saque quando um inimigo npc ou player morre, de setar o alvo e saquear."

- [ ] No combate, alvo com **0 PV** ganha a ação **"💰 Saquear"** (reusa o alvo 🎯 que já existe).
- [ ] Já existe o loot de **monstro** (Fase 13, `loot.js`, 59/59 monstros). Falta: **NPC** e **PJ caído** —
      saquear o que está de fato na bolsa/ouro da ficha, transferindo para quem saqueia.
- [ ] Transferência validada no servidor (ninguém "saqueia" um vivo, nem à distância).

### C2 🟡 Furto com dificuldade variável
**Pedido:** "nivel de dificuldades de furto... pela classe do item peso e importancia, aplicar variabilidade
de dificuldade no furto."

- [ ] **CD do furto calculada**, não fixa — fórmula a partir de:
      **base** (Percepção passiva do alvo) **+ peso/volume** do item **+ raridade/valor** **+ "importância"**
      (item equipado, sintonizado ou de missão = muito mais difícil) **− distração/ajuda**.
- [ ] Rolagem de **Prestidigitação** contra essa CD, com o resultado explicando *por que* foi difícil
      ("+5 porque está equipado, +3 porque é raro").
- [ ] Falha por margem: quase = alvo desconfia; falha feia = flagrado.
- [ ] Vale para **qualquer classe** (o Ladino só é melhor nisso, não o único).

---

## Critérios de pronto (valem para TODOS os itens)

1. **Toda regra de permissão é validada no servidor.** Esconder o botão é UI, não segurança.
2. Nada de texto em inglês na UI.
3. Entra no `CHANGELOG.md` com backup em `versoes/`.
4. Testado no fluxo real (E2E no navegador), não só unit.
5. Migração sem quebrar contas/campanhas que já existem.

---

## Perguntas em aberto (assumi um caminho; é só dizer se preferir outro)

1. **Uma conta pode ser Mestre numa campanha e Jogador em outra?** Assumi **sim** (o `papel_na_campanha` já
   funciona assim). O `papelGlobal` diz o que a pessoa *pode ser*; a campanha diz o que ela *é ali*.
   O pedido "só vão ter acesso ao módulo mestre ou o módulo player" foi lido como **a escolha do cadastro**.
2. **O jogador cria ficha fora de campanha e depois importa** — assumi ficha "de bolso" ligada à conta
   (`fichas/<uid>`), e a importação copia para a campanha. Isso conversa com o limite de 6 fichas da Fase 23.
3. **Cores:** a tabela da A3 é uma proposta. Se você tiver referência visual (um app que goste), eu adapto.
