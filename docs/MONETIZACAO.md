# Monetização por créditos — Fase 23

Modelo de cobrança do D&D Toolkit (definido pelo Ismaile em 14/07/2026).
Substitui, aos poucos, a assinatura plana de conta (Fase 10.9).

## O produto = a CAMPANHA (não fichas soltas)

- A unidade paga é uma **campanha**: **R$ 5,00/mês = 20 créditos/mês**.
- Quem paga a campanha (o **Mestre/dono**) recebe:
  - **Controle total de Mestre**: monstros, NPCs, aventuras (livro-jogo),
    tabuleiro, loja, itens — **ilimitado**.
  - **6 fichas de personagem (PJ)** — só 6 PJs por campanha.
- **Jogadores entram de graça**: criam conta, entram na campanha do Mestre
  por convite/cadastro, e o Mestre **envia o acesso** a uma das 6 fichas.
  Jogador NÃO paga; quem paga é o dono da campanha.

## Créditos (a moeda)

- **1 crédito = R$ 0,25.**
- **Compra mínima: R$ 2,00 (8 créditos).** Pode comprar quantos quiser.
- Créditos comprados **não expiram** (a cobrança é que é mensal).
- **Carteira** por utilizador: `usuarios/<uid>.creditos` (saldo inteiro) +
  `creditos_log[]` (histórico: cada lançamento `{delta, motivo, por, em, saldo}`).

## Ciclo de vida da campanha

- **Criar/renovar** uma campanha debita **20 créditos** do dono e marca
  `pagaAte = +30 dias`. Sem saldo → não cria/renova (CTA "comprar créditos").
- **Renovação mensal automática** (job): a cada vencimento, debita 20 créditos
  e estende `pagaAte`. Com saldo insuficiente, a campanha fica **inativa**
  (só-leitura para todos) e marca `inativaDesde`.
- **Retenção**: campanha inativa é **guardada por 6 meses**; passados os 6
  meses sem pagamento, é **apagada** por um job. (Retomar antes disso: pagar
  os 20 créditos reativa tudo de onde parou.)

## Pagamento

- **Agora — Pix manual** (reusa a infra da Fase 10.9): comprar créditos gera
  uma **cobrança pendente**; o utilizador paga na chave Pix e o **admin
  confirma** no painel → os créditos caem na carteira. Sem conta nova, sem taxa.
- **Depois — Pix automático** (gateway): confirma sozinho por webhook, crédito
  instantâneo. Precisa de conta do Ismaile num gateway (Mercado Pago /
  AbacatePay / Asaas) + chaves; o webhook usa a URL do Render.
  > ⚠️ O Claude **nunca** cria conta de pagamento nem insere credenciais
  > financeiras — isso é sempre do Ismaile. O Claude só escreve a integração.

## Painel de admin (estende `/admin/assinaturas`)

Tudo que o Ismaile precisa controlar, num lugar só (mestre legado):
- **Utilizadores**: saldo de créditos, ajustar (+/−) com motivo, bloquear.
- **Campanhas**: dono, `pagaAte`, status (ativa/inativa/a apagar), confirmar
  pagamento (credita), forçar renovar/apagar.
- **Compras pendentes** de Pix (confirmar → credita).
- **Receita**: total de créditos vendidos / faturamento estimado.

## Migração (assinatura plana → créditos)

Hoje `login_obrigatorio(exigir_assinatura=True)` tranca a app inteira na
assinatura de conta (Fase 10.9). No modelo novo, **o jogador é grátis** e só
o **dono da campanha** paga (por campanha). A troca é feita com cuidado numa
sub-fase dedicada (23.7), depois que a carteira e a cobrança estiverem no ar —
a carteira (23.1) é puramente aditiva e convive com a assinatura atual.

---

## Sub-fases (1 entrega por vez, verificada)

- **23.1 Carteira de créditos** (fundação, aditiva): `usuarios/<uid>.creditos`
  + `creditos_log`; helpers `saldo_creditos`/`lancar_creditos`;
  `GET /api/creditos`; ajuste de créditos no admin; saldo visível ao utilizador.
- **23.2 Comprar créditos**: tela de compra (quantidade, mín. 8), gera cobrança
  Pix pendente; admin confirma → credita (`lancar_creditos`).
- **23.3 Campanha como produto**: criar/renovar debita 20 créditos + `pagaAte`;
  trava de campanha **inativa** (só-leitura) sem pagamento.
- **23.4 Limite de 6 fichas de PJ** por campanha (servidor rejeita a 7ª).
- **23.5 Jobs mensais**: renovação automática + `inativaDesde` + retenção/
  exclusão aos 6 meses.
- **23.6 Painel admin completo** (utilizadores + campanhas + compras + receita).
- **23.7 Migração**: jogador grátis; aposentar a assinatura plana de conta.
- **23.8 (opcional) Pix automático** via gateway (conta + chaves do Ismaile).

**Progresso:**
- [x] 23.1 (14/07) · [x] 23.2+23.8 AbacatePay (14/07) · [ ] 23.3 · [ ] 23.4 · [ ] 23.5 · [ ] 23.6 · [ ] 23.7

## Como o Ismaile liga o pagamento automático (AbacatePay)

1. Criar conta na AbacatePay. Pegar a **API key** (comece pela de **DEV**:
   `abc_dev_...` — permite o botão "🧪 Simular pagamento" sem dinheiro real).
2. No Render, definir os envs: `ABACATEPAY_API_KEY=<sua chave>` e
   `ABACATEPAY_WEBHOOK_SECRET=<um valor secreto seu>`.
3. No painel da AbacatePay, cadastrar o **webhook** apontando para
   `https://SEU-APP.onrender.com/api/pagamento/abacatepay/webhook?webhookSecret=<o mesmo valor>`
   (eventos de Pix pago).
4. Pronto: a tela `/creditos` gera o QR/copia-e-cola e credita sozinho.
   **Sem a API key, tudo continua funcionando em Pix manual** (o admin confirma).

**Segurança:** o app **nunca credita só pelo corpo do webhook** — ele valida o
`webhookSecret` e re-confirma o pagamento com `pixQrCode.check(id)` antes de
creditar; o crédito é **idempotente** (não dobra em webhook/polling repetidos).
