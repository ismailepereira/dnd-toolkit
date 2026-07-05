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

## Regras do Firestore

O cliente faz **somente leitura** em tempo real; quem escreve é o backend (Admin SDK). Regras recomendadas (cobrem multi-campanha via wildcard):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /campanha/{doc} {
      allow read: if true;     // leitura pública (a mesa toda acompanha em tempo real)
      allow write: if false;   // escrita só pelo backend (Admin SDK ignora as regras)
    }
  }
}
```

⚠️ **Notas privadas / handouts:** a leitura pública expõe, via Firestore, **todas** as notas ao navegador do jogador — o filtro de "compartilhada" é feito no cliente e no endpoint REST, mas não esconde do `onSnapshot`. Não guarde segredos reais do enredo em notas se isso for um problema. Solução futura: **Login do Firebase** + regras por usuário (ver ROADMAP 5.4).

## Multi-campanha

Cada mesa é um documento em `campanha/<id>` (padrão `principal`). Trocar de campanha no cabeçalho do Mestre cria/abre o documento correspondente; os dados de cada mesa ficam isolados. O backup (.json) é por campanha.

## Backup (rede de segurança)

Além do Firestore, use **💾 Backup → Exportar** periodicamente para baixar um `.json` com fichas, monstros visíveis, combate, notas e encontros. **Importar** substitui a campanha atual pelos dados do arquivo.

## Credenciais sensíveis

- `firebase-key.json` é **gitignored** — nunca commitar. Em produção, use a env `FIREBASE_KEY_JSON` ou o Secret File do Render (`/etc/secrets/firebase-key.json`).
- A 1ª chave de serviço já foi exposta em chat no passado: **rotacione-a** no Console do Firebase antes de usar em produção.
