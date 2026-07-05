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
- `campanha/<id>`: leitura só para o mestre da campanha, membros registados (via `campanhas_meta`) e o mestre fixo legado; **escrita sempre negada** (só o Admin SDK escreve).
- `usuarios` e `campanhas_meta`: **inacessíveis ao cliente** (contêm hashes de senha e a lista de membros); o `get()`/`exists()` usado pelas regras roda no servidor de regras e não expõe os documentos.
- Qualquer outra coleção: negada por padrão.

⚠️ **Notas privadas / handouts:** membros da campanha ainda recebem o documento INTEIRO dela via `onSnapshot` (incluindo notas não compartilhadas) — o filtro de "compartilhada" é do cliente/REST. As regras da 10.8 fecham o acesso a estranhos, mas não escondem segredos de enredo dos próprios jogadores da mesa; para isso seria preciso separar notas num documento à parte (evolução futura).

## Multi-campanha

Cada mesa é um documento em `campanha/<id>` (padrão `principal`). Trocar de campanha no cabeçalho do Mestre cria/abre o documento correspondente; os dados de cada mesa ficam isolados. O backup (.json) é por campanha.

## Backup (rede de segurança)

Além do Firestore, use **💾 Backup → Exportar** periodicamente para baixar um `.json` com fichas, monstros visíveis, combate, notas e encontros. **Importar** substitui a campanha atual pelos dados do arquivo.

## Credenciais sensíveis

- `firebase-key.json` é **gitignored** — nunca commitar. Em produção, use a env `FIREBASE_KEY_JSON` ou o Secret File do Render (`/etc/secrets/firebase-key.json`).
- A 1ª chave de serviço já foi exposta em chat no passado: **rotacione-a** no Console do Firebase antes de usar em produção.
