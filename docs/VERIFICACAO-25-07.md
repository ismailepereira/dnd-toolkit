# ✅ Roteiro de verificação ao vivo — sessão 25/07/2026

Cobre tudo que entrou nesta sessão (roadmap de Acesso A/B/C + retrabalho de combate). Toda a lógica passa nos
testes automatizados (unit 50/50, servidor 69/69, sintaxe OK), mas os **fluxos visuais** precisam de uma
passada no navegador. Marque `[x]` conforme confirmar; anote o que sair diferente.

**Como usar:** precisa de **duas contas** — uma **Mestre** e uma **Jogador** — na mesma campanha (abra em duas
janelas/abas, ou celular + PC). Local: Mestre `Ismaile`/`99129863`, jogador `jogador`/`dnd2024`.

**Preparação (Mestre):**
- [ ] Crie (ou tenha) **um Clérigo** (nv3+, com magias) e **um Guerreiro/marcial** (nv5+, com Ataque Extra), e
      uma ficha com **2 armas na bolsa** (ex.: Espada Longa equipada + Machadinha guardada).
- [ ] Cada ficha com um **dono jogador** (para testar as travas do lado do jogador).

---

## A4 — Economia trancada (ouro/itens)  🔒
Entre como **Jogador**, abra a própria ficha (Modo de Jogo):
- [ ] No bloco **Ouro** aparece só o valor + "ganhe ouro do Mestre ou vendendo…" — **sem** botões +/−.
- [ ] No bloco **Experiência**, idem: "o Mestre concede o XP".
- [ ] (DevTools, opcional) Editar `ouro`/`itens` na ficha e salvar **não** enriquece — o servidor devolve o
      valor gravado. *(Coberto por teste; só confirme se quiser.)*

## B1 — Planejar evolução (Jogador)  📈
Como **Jogador**, na própria ficha:
- [ ] O botão do topo é **"📈 Planejar Evolução"** (não "Subir de Nível").
- [ ] Clicar abre o assistente em **modo plano** com o aviso "nada muda na sua ficha em jogo".
- [ ] Faça escolhas de alguns níveis (subclasse/ASI/magias) e **Cancele** para concluir o plano.
- [ ] A ficha mostra **"📈 Plano de Evolução — níveis X–Y planejados. Aguardando liberação do Mestre."**
- [ ] O **nível efetivo NÃO mudou** (PV/magias iguais). Botão agora diz "📈 Revisar Plano".

## B2 — Liberar nível (Mestre)  ⬆️
Como **Mestre**, aba **Fichas**:
- [ ] O card da ficha que planejou mostra "📈 Plano do jogador pronto…" e o botão **"⬆️ Liberar nível X"**.
- [ ] Clicar sobe **um** nível (PV/atributos/subclasse/magias do plano aplicados de uma vez); o botão passa ao
      próximo nível (ou some, se não há mais plano).
- [ ] A barra **"⬆️ Liberar próximo nível de todos"** sobe um nível de todos que têm plano.
- [ ] Como **Jogador**, tentar liberar (via URL/DevTools) é bloqueado. *(Coberto por teste.)*

## Combate 1 — Descanso só o Mestre  😴
- [ ] Como **Jogador**, na ficha: **não há** botões de descanso — só "😴 O descanso é ativado pelo Mestre".
- [ ] Como **Mestre**, abrindo uma ficha (▶ Jogar) os botões ☕/🌙 aparecem e funcionam.
- [ ] Aba **Fichas** (Mestre) tem a barra **"😴 Descanso do grupo: ☕ Curto / 🌙 Longo"** — aplica a todos
      (curto recupera recursos "curto" + pacto; longo cura PV, zera slots/recursos).

## Combate 2a — Magias do Clérigo no combate  ✨
Como **Jogador**, no **Clérigo**, entre em combate (role iniciativa):
- [ ] O bloco **"✨ Conjuração"** aparece com **todas** as magias de círculo (Curar Ferimentos, Raio Guia,
      Bênção…), **mesmo sem ter preparado** — não só truques/armas.
- [ ] Magias **preparadas** mostram o selo "🧠 preparada".
- [ ] Cada magia tem os botões (🎲 atacar / 🎲 dano-cura / ✨ Conjurar) e **conjurar gasta o espaço**.

## Combate 2b — Trava de economia de ação  ⏳
Em combate, **na sua vez** (banner "⚔️ É a sua vez"):
- [ ] A faixa mostra **Ação / Bônus / Reação** (e "1/2 golpes" quando ataca com Ataque Extra).
- [ ] **Atacar** com arma marca a **Ação**; tentar **conjurar** magia de ação depois → **bloqueia**
      ("🚫 Você já usou sua Ação atacando…").
- [ ] Com **Ataque Extra**, dá para atacar N vezes na mesma Ação; o golpe N+1 bloqueia.
- [ ] Magia de **ação bônus** gasta a Bônus (a Ação segue livre).
- [ ] Botão **"↩️ Novo turno"** reinicia a economia (Surto de Ação / Pressa / correção).
- [ ] **Fora de combate** (ou não sendo sua vez): sem trava (pode rolar à vontade).

## Combate 2c — Poderes de classe na economia  👊
- [ ] **Gastam a Ação:** Expulsar Mortos-Vivos, Imposição das Mãos, Consciência Primitiva, Forma Selvagem —
      usar um deles impede atacar/conjurar de ação no mesmo turno.
- [ ] **Gastam a Bônus:** Inspiração Bárdica, Ki (Rajada/Defesa/Vento), Retomar o Fôlego, Fontes de Feitiçaria.
- [ ] **NÃO gastam** (riders): Golpe Atordoante (Ki), Punição Divina, Ataque Furtivo.
- [ ] **Surto de Ação** libera uma Ação extra (a faixa "desmarca" a Ação).

## Combate 3 — Armas equipadas + custo de troca  🤚
Ficha com 2 armas (uma equipada, outra na bolsa):
- [ ] Só a arma **equipada** (✋) tem "🎲 atacar"; a da bolsa mostra **"🤚 Empunhar"**.
- [ ] **Em combate, na sua vez:** clicar "🤚 Empunhar" **gasta a Ação** e equipa a arma — você ataca com ela no
      **próximo** turno.
- [ ] **Fora de combate:** empunhar é livre (sem custo).
- [ ] Arma de **arremesso** continua com "🎯 lançar" direto da bolsa.

## C1 — Saquear alvo abatido  💰
Em combate, com um inimigo **caído (0 PV)** carregando ouro/itens (o Mestre pode setar isso no combatente):
- [ ] Selecione o alvo em **🎯 Mirar em**; aparece **"💰 Saquear <nome>"**.
- [ ] Clicar transfere o **ouro + itens** para a sua ficha; o alvo vira "já saqueado".
- [ ] Alvo **de pé** não mostra o botão / recusa (400). Saquear **PJ** só o Mestre ou se já é memorial.

## C2 — Furto com CD variável  🤏
Em combate, com um alvo **vivo**:
- [ ] Selecione o alvo; aparece **"🤏 Furtar"** → abre o painel (item + toggles equipado/sintonizado/de missão).
- [ ] **"🎲 Tentar furto"** rola Prestidigitação e loga no combate: **total vs CD**, com os **fatores**
      explicando ("+5 está equipado, +3 raro…") e o **grau** (✅ sucesso / 😬 quase / 🚨 flagrado).
- [ ] A CD **muda** conforme os toggles (equipado/raro sobem; em combate a distração já abate −3).
- [ ] O **item não é transferido automaticamente** — o Mestre concede pelas ferramentas de envio (assistente).

---

## Achou algo errado?
Anote aqui (tela · o que esperava · o que aconteceu) e me mande — cada bug vira um caso de teste + correção.
Reverter qualquer entrega: as pastas de backup estão em `versoes/2026-07-25-*`.
