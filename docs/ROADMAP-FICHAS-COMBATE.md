# 🗺️ Roadmap — Fichas por Classe & Combate

Plano de melhoria nascido da **mesa de 18/07/2026**: dificuldades reais com Paladino,
Clérigo e Druida na criação, e fricções no combate (magias invisíveis, azagaias
repetidas, arma arremessada sem controle). Cada item aponta a dor que o originou.

**Legenda:** `[ ]` a fazer · `[~]` em andamento · `[x]` pronto ·
🔴 primeiro · 🟠 em seguida · 🟡 depois

**Ordem recomendada de execução:** C1 → F1 → C2+C3 (juntos, mexem no mesmo código) → F2 → C4 → C5 → F4 → F3b → C6 → C7 → F5.
Um item por sessão de trabalho; cada entrega com teste de regressão (a suíte `tests/` já cobre Criador, servidor e Modo de Jogo).

---

## ✅ Já entregue (da mesma leva de feedback)

- [x] **Druida sem forma animal** → 🐺 Forma Selvagem completa (19/07): catálogo de 26 feras por ND,
  regras do PHB por nível (2/4/8 + Círculo da Lua), painel no Modo de Jogo com transformar/reverter,
  PV da fera e dano excedente. `formaselvagem.js`.
- [x] **Bug do Clérigo** "avisa 4 magias, só marca 3" (19/07): o +1 racial em SAB não re-renderizava o
  painel de magias. Corrigido + regressão em teste.
- [x] **Divindades/patronos** com aba própria, explicação de quem-é/para-quê e validação por classe (18/07).

---

## FASE F — Criação de ficha por classe

### F1 🔴 Paladino compreensível do nível 1 ao 3
**Dor relatada:** "o paladino não tinha nenhuma habilidade inicial a não ser cura, e estava confuso."
No PHB o nível 1 do Paladino é realmente só **Sentido Divino + Imposição das Mãos** — mas o app
precisa DIZER isso e mostrar o que está chegando, senão parece ficha quebrada.

- [ ] **Recurso "Sentido Divino"** no Modo de Jogo (`recursosDeClasse`): 1 + mod CAR usos/descanso longo
  (hoje só a Imposição das Mãos aparece — por isso "só cura").
- [ ] **Painel do Paladino no Criador** (`painelPaladino`): bloco "Seu nível 1" explicando Sentido Divino
  e Imposição das Mãos + aviso claro: *"No nível 2 chegam Estilo de Combate, magias e a Punição Divina —
  o golpe explosivo da classe. Grupos iniciantes costumam começar no nível 2-3."*
- [ ] **Punição Divina jogável** no Modo de Jogo (nv2+): botão "⚡ Punição (+2d8 radiante)" junto ao ataque
  corpo a corpo que gasta 1 espaço de magia AO CONFIRMAR o acerto (+1d8 por círculo acima do 1º; +1d8 vs
  mortos-vivos/ínferos). Hoje é só uma dica de texto.
- [ ] Auras (nv6+) visíveis como linha permanente no cabeçalho do Modo de Jogo (não escondidas em dicas).

### F2 🔴 Auditoria "kit de estreia" das 12 classes (níveis 1-3)
**Dor generalizada:** classes cuja abertura confunde. Para CADA classe, garantir os 3 pontos:
(a) painel do Criador explica TODAS as características iniciais em linguagem de mesa;
(b) todo recurso gastável aparece rastreável no Modo de Jogo; (c) toda ação especial tem botão ou card, não só texto.

- [ ] Tabela de auditoria (classe × o que falta) preenchida e commitada neste doc.
- [ ] Lacunas conhecidas já mapeadas: **Sentido Divino** (Paladino, → F1) · **Destruir Mortos-Vivos** do
  Clérigo nv5 sem botão · **Ataque Furtivo** do Ladino é só dica (→ C4) · **Bardo**: Inspiração existe, mas
  sem lembrete de a QUEM deu · **Feiticeiro**: Pontos de Feitiçaria sem conversão slot↔ponto no clique.
- [ ] Cada classe corrigida = 1 commit pequeno com caso E2E.

### F3 🟠 Druida — fechamento das pendências da Forma Selvagem
- [x] Catálogo por nível + transformar/reverter (19/07).
- [ ] **F3b — Forma Elemental** (Círculo da Lua nv10): gastar 2 usos para virar Elemental do Ar/Terra/Fogo/Água
  (4 formas novas no catálogo com stats).
- [ ] Conjuração Atemporal (nv18): liberar o painel de magias mesmo com forma ativa.

### F4 🟠 Cartão-resumo de combate no fim do Criador ("cola" do jogador)
**Dor de fundo:** jogador novo termina a ficha sem saber o que faz no turno.
- [ ] Etapa final ganha um cartão gerado: "Seu personagem em combate" — ataque principal com bônus/dano,
  melhor truque/magia com CD, recurso de classe a lembrar, CA/PV/deslocamento. O mesmo cartão sai no PDF.

### F5 🟡 Subclasses com efeito mecânico completo
- [ ] Domínios do Clérigo: magias de domínio ganhas automaticamente (sempre preparadas, sem contar no limite).
- [ ] Juramentos do Paladino (nv3): magias de juramento + Canalizar Divindade específico do juramento.
- [ ] Patronos do Bruxo: magias expandidas do patrono aparecendo na lista de escolha.

---

## FASE C — Combate (Modo de Jogo)

### C1 🔴 Magias como cartas de ação (igual às armas)
**Dor relatada:** "no combate não fica disponível as magias para uso, somente algumas armas."
Hoje o painel "O teu turno" só lista os NOMES das magias num texto corrido; as armas têm card com
bônus/dano. As magias precisam do mesmo tratamento.

- [ ] Painel **"✨ Conjuração"** ao lado de "Ataques de Arma": um card por truque/magia castável com
  **+ataque mágico ou CD**, dano/efeito, alcance, tempo (ação/bônus/reação) e concentração.
- [ ] Botão **"Conjurar"** no card: gasta o espaço do círculo certo com 1 clique (e marca concentração
  se for o caso) — hoje o gasto de slot é manual e distante da magia.
- [ ] Filtro "castável agora": esconde/apaga cards sem espaço disponível; truques sempre acesos.
- [ ] Escalonamento no card: truques por nível de personagem (Rajada Sobrenatural 2 raios no nv5…),
  magias com "+Xd por círculo acima".

### C2 🔴 Itens repetidos agrupados com quantidade
**Dor relatada:** "azagaia se repete muito; se tem mais de uma coloque a quantidade."
O kit do Bárbaro entrega 4 azagaias FIXAS (equipamento.js) — e a UI mostra o nome repetido ou some com
as cópias sem dizer quantas são.

- [ ] **Ataques de Arma**: uma linha só com contagem — "Azagaia ×4 · +5 · 1d6+3 perfurante".
- [ ] **Slots de equipar** (mão principal/secundária): opção única com "(×4)" no rótulo.
- [ ] **PDF e preview do Criador**: mesma agregação (a Bolsa já agrupa — estender o padrão `contarItem`
  aos demais painéis).

### C3 🔴 Armas de arremesso com controle de lançada/recuperada
**Dor relatada:** "e se recuperou a arma…" — azagaia lançada some da mão e ninguém controla.
- [ ] Ao usar ataque à distância de arma com propriedade `arremesso`: botão "🎯 Lançar" decrementa a
  contagem "em mãos" e soma em "no chão" (ex.: Em mãos 2× · No chão 2×).
- [ ] Botão **"↩️ Recuperar arremessadas"** (fim do combate) devolve tudo para a mão.
- [ ] Última azagaia lançada → aviso "sem azagaias em mãos" e o card de ataque apaga.
- [ ] Mesmo padrão vale para Adaga, Lança, Machadinha, Martelo Leve, Tridente e Dardo.

### C4 🟠 Golpes especiais pós-acerto com botão
- [ ] Paladino: Punição Divina (ver F1) — mesmo mecanismo.
- [ ] Ladino: card "🗡️ Ataque Furtivo +Xd6" aceso quando as condições do painel tático valem
  (vantagem OU aliado adjacente ao alvo), com o dado certo por nível.
- [ ] Bárbaro: dano da Fúria somado automaticamente no card do ataque corpo a corpo enquanto "Em Fúria".

### C5 🟠 Rolagem integrada nos cards
- [ ] Botão 🎲 em cada card (arma/magia): rola ataque (com vantagem/desvantagem) e dano, registra no
  Histórico da ficha. Tira o jogador da calculadora sem tirar o dado físico de quem prefere (rolagem é opcional).

### C6 🟡 Efeitos dos ataques → condições com 1 toque
- [ ] Ataque com efeito conhecido (Lobo derruba CD 11, teia prende…) sugere aplicar a condição no alvo
  selecionado do combate ("Aplicar 'Caído' em Goblin 2?").

### C7 🟡 Economia de ação do turno
- [ ] Marcadores Ação/Bônus/Movimento/Reação no painel do turno: clicar num card marca o gasto; "▶ Próxima
  rodada" limpa. Evita o "já ataquei este turno?" da mesa remota.

---

## Critérios de pronto (valem para TODOS os itens)

1. Regra confere com o PHB/SRD (citar a página/tabela no commit quando houver dúvida).
2. Funciona no fluxo real (teste E2E no navegador, não só unit).
3. Entra no `CHANGELOG.md` com backup em `versoes/`.
4. Nada de texto em inglês na UI; termos oficiais em PT-BR com o nome em inglês entre parênteses quando ajudar a buscar.
