# 🔐 Segurança & Robustez — D&D Toolkit

Guia rápido de produção (Fase 5.4). Nada de segredo entra no repositório.

## Senhas (hash)

O login aceita a senha em **texto puro** (padrão, para desenvolvimento) **ou em hash do Werkzeug** (recomendado em produção).
Para gerar um hash:

```bash
python -c "from werkzeug.security import generate_password_hash as g; print(g('SUA_SENHA'))"
```

Cole o resultado nas variáveis de ambiente do Render (começam com `pbkdf2:` ou `scrypt:`):

```
MESTRE_USER=Ismaile
MESTRE_SENHA=pbkdf2:sha256:...    # hash, não a senha
JOGADOR_USER=jogador
JOGADOR_SENHA=pbkdf2:sha256:...
SECRET_KEY=<string longa e aleatória>   # NUNCA use o valor padrão em produção
```

`senha_confere()` detecta o prefixo do hash automaticamente; senhas em texto puro continuam funcionando para a mesa local.

## Regras do Firestore (Fase 10.8 — por campanha)

O cliente faz **somente leitura** em tempo real; quem escreve é o backend (Admin SDK). Desde a Fase 10.8 a leitura deixou de ser pública: o cliente troca a sessão Flask por um **token personalizado do Firebase Auth** (`/api/firebase_token`) e as regras só deixam ler a campanha de que o utilizador é **membro ou mestre**.

As regras completas (com comentários) estão versionadas em **`firestore.rules`** na raiz do repositório.

### Como ativar (uma vez, no Console do Firebase)
1. **Deploy do código primeiro** (Render) — o código novo funciona com as regras antigas (degradação suave); o contrário derrubaria o tempo real.
2. Console do Firebase → **Authentication → Começar** (ativa o produto; não precisa habilitar nenhum provedor — os tokens vêm do backend).
3. Console → **Firestore Database → Regras** → colar o conteúdo de `firestore.rules` → **Publicar**.
4. Testar: entrar como jogador registado e confirmar no console do navegador que não há erro `[RT] onSnapshot` (se houver `permission-denied`, o passo 2 ou o deploy ficou em falta).

### O que as regras garantem
- `campanha/<id>` (documento BRUTO — fichas, combate, notas, NPCs com `notasPrivadas`...): leitura só para o **Mestre** da campanha (ou o mestre fixo legado); **escrita sempre negada** (só o Admin SDK escreve).
- `campanha_publica/<id>` (Fase 18.2 — projeção sem `notasPrivadas` de NPC nem notas do Mestre não compartilhadas, gerada por `_estado_publico()` em `app.py` a cada `salvar_estado`): leitura para o Mestre, membros registados e o jogador fixo legado — é isto que `jogador.js` escuta em tempo real (`RT.ouvirPublico`).
- `usuarios` e `campanhas_meta`: **inacessíveis ao cliente** (contêm hashes de senha e a lista de membros); o `get()`/`exists()` usado pelas regras roda no servidor de regras e não expõe os documentos.
- Qualquer outra coleção: negada por padrão.

✅ **Notas privadas / handouts (resolvido na Fase 18.2, 14/07/2026):** antes, membros da campanha recebiam o documento INTEIRO via `onSnapshot` (incluindo `notasPrivadas` de NPC e notas do Mestre não compartilhadas) — o filtro de "compartilhada" era só do cliente/REST, e um jogador com DevTools lia tudo. Agora o backend mantém DOIS documentos por mesa (`campanha` bruto + `campanha_publica` filtrado) e as regras acima restringem o bruto ao Mestre. **Efeito só vale depois de publicar o `firestore.rules` atualizado no Console** (pendência manual — passo 3 abaixo); até lá, o código já funciona (grava os dois documentos), mas a regra antiga ainda permite ao jogador ler o bruto se ele tentar diretamente.

## Multi-campanha

Cada mesa é um documento em `campanha/<id>` (padrão `principal`). Trocar de campanha no cabeçalho do Mestre cria/abre o documento correspondente; os dados de cada mesa ficam isolados. O backup (.json) é por campanha.

## Backup (rede de segurança)

Além do Firestore, use **💾 Backup → Exportar** periodicamente para baixar um `.json` com fichas, monstros visíveis, combate, notas e encontros. **Importar** substitui a campanha atual pelos dados do arquivo.

## Credenciais sensíveis

- `firebase-key.json` é **gitignored** — nunca commitar. Em produção, use a env `FIREBASE_KEY_JSON` ou o Secret File do Render (`/etc/secrets/firebase-key.json`).
- A 1ª chave de serviço já foi exposta em chat no passado: **rotacione-a** no Console do Firebase antes de usar em produção.

## Assinaturas e dados pessoais (Fase 10.9 — LGPD)

O registo recolhe **nome completo, e-mail, CPF e WhatsApp** para a assinatura
manual (R$ 5/mês por Pix, confirmação no painel `/admin/assinaturas`, só o
mestre legado). Implicações:

- **CPF é dado pessoal (LGPD)**: guardado em `usuarios` (Firestore) /
  `data/usuarios.json` (local). As regras do Firestore (10.8) negam qualquer
  leitura do cliente, e o painel admin é restrito ao mestre legado — mas a
  responsabilidade legal de finalidade/exclusão a pedido é do operador.
  Se o CPF deixar de ser necessário (a utilidade real aqui é impedir
  multi-trial), remova o campo do `templates/registro.html` e a validação em
  `app.py` (`validar_cpf`).
- **Exclusão a pedido do titular**: apagar o documento do utilizador em
  `usuarios` (Console do Firestore) ou a entrada em `data/usuarios.json`.
- Configure no `.env`/Render: `PIX_CHAVE`, `CONTATO_PAGAMENTO`,
  `ASSINATURA_PRECO`, `TRIAL_DIAS` (padrões: R$ 5,00/mês, 3 dias).
