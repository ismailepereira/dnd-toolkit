# D&D Toolkit

Ferramenta web para ajudar o Mestre e os jogadores durante campanhas de D&D 5e.

## Funcionalidades

- **Fichas de personagem** compartilhadas entre Mestre e jogadores
- **Rastreador de combate / iniciativa**
- **Notas de campanha / NPCs**
- **Progressão de classe** (referência oficial das 12 classes do PHB, níveis 1-20)
- **Bestiário** da aventura "Mina Perdida de Phandelver", com controle de visibilidade pelo Mestre
- **Loja de itens** com cadastro de novos itens
- **Geradores rápidos** (NPC, loot, encontro, gancho de aventura, taverna, dados)

## Login

- **Mestre**: acesso completo, controla quais monstros aparecem para os jogadores
- **Jogadores**: login compartilhado, acessam fichas, bestiário liberado e progressão (somente leitura)

## Rodar localmente

```bash
pip install -r requirements.txt
cp .env.example .env   # edite as credenciais se quiser
python app.py
```

Acesse em `http://localhost:5300`. Para jogadores na mesma rede Wi-Fi, use o IP local do seu PC.

## Deploy (Render)

Conecte este repositório no [Render](https://render.com) — o `render.yaml` configura o serviço automaticamente. Defina `MESTRE_SENHA` e `JOGADOR_SENHA` no painel do Render.

---

Desenvolvido por [ismailepereira](https://ismailepereira.github.io/)
