# 🎲 D&D Toolkit — Kickoff da próxima sessão

> Cole isto como primeira mensagem num chat novo. Atualizado em **28/07/2026**.

## Contexto rápido
- Repo: `F:\Claude\pessoal\produtos\dnd-toolkit` · stack: **Flask + JS estático vanilla** (sem build step).
- Persistência: **Firestore** em produção, fallback JSON local (`data/`) sem credencial.
- Produção: **https://dnd-toolkit.onrender.com** (deploy automático ao mesclar na `master`).
- Regras do projeto estão no `CLAUDE.md` (backup em `versoes/` antes de editar, teste pra cada bug, PT-BR na UI).

## ✅ O que acabou de entrar no ar (28/07)
- **20.7 Tabuleiro em tela cheia** (⛶) — fecha a **Fase 20 (Navegação & Mobile)**.
- **Set completo de ícones 3D "latão + gema"** (gerados no Gemini, recortados por script): botões de modo,
  cards do hub (ADM/Total/Mestre), **12 abas** (Mestre) + 5 (Jogador) e **12 classes** como avatar do token.
- **Recuperar senha** (`/recuperar-senha`) por **e-mail + CPF**, sem infra de e-mail (8 testes; 77/77 no total).

## ▶️ Onde estávamos no roadmap
- Roadmap **ACESSO, PERFIS & INTERFACE** (`docs/ROADMAP-ACESSO-INTERFACE.md`): **CONCLUÍDO** (Fases A, B, C).
- **Fase 20** (`ROADMAP.md`, tabela 🧭 AGORA): **CONCLUÍDA** com a 20.7.
- Roadmap **FICHAS & COMBATE** (`docs/ROADMAP-FICHAS-COMBATE.md`): em pausa; restam **F5b** (patronos do Bruxo),
  **F5c** (Canalizar Divindade do juramento) e **Conjuração Atemporal (N18)**.

## 🎯 Próximos candidatos (escolher 1 no início da sessão)
1. **16.6 — Tabuleiro: zoom/pan** + centralizar/seguir token + medir distância. Casa com a 20.7 recém-feita;
   melhora muito o uso no celular. **(recomendado — dá continuidade natural)**
2. **Unificar o esquema de cores dos modos.** Hoje há 3 esquemas conflitando (A3 vs reskin vs mockups) —
   ver memória "design-direction". Passada de CSS, alto impacto visual, baixo risco.
3. **Fase F5b/F5c** (Fichas & Combate): fechar as classes que faltam (Bruxo/Paladino).
4. **Blindar o recuperar-senha** (opcional): hoje quem sabe e-mail+CPF reseta. Evoluir p/ link por e-mail
   exigiria configurar um provedor (SMTP/Resend) — só se o Ismaile quiser investir nisso.

## ⚠️ Pendências manuais do Ismaile (destravam recursos já codificados)
1. **Ativar Firebase Storage** + publicar `storage.rules` → liga upload de imagens (miniatura/mapa).
2. **`ANTHROPIC_API_KEY` no Render** → liga a IA (U2).
3. **Publicar `firestore.rules`** no Console → fecha a leitura crua do RT.

## 🛠️ Convenções que já valem (não perguntar de novo)
- **Mesclar PRs sozinho**, sempre checando o CI antes (verde → merge; vermelho → corrigir). Merge = deploy.
- **Ícones novos:** pedir ao Gemini em **fundo branco liso** (não xadrez) → recorte limpo com
  `scratch-icons/process.py` (OpenCV/Pillow). O `.env` tem `GEMINI_API_KEY`, mas gerar por API exige billing.
- Testes: `npm run test:tudo` (ou `python tests/test-servidor.py` com `PYTHONIOENCODING=utf-8` no Windows).

## Memória relevante (já carregada em sessões deste projeto)
`dnd-toolkit-estado`, `dnd-toolkit-design-direction`, `dnd-toolkit-mesclar-prs`, `dnd-toolkit-convencoes`,
`dnd-toolkit-roadmap-acesso-interface`.
