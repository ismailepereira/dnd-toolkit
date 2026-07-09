# 🏛️ Arquitetura & Direção — D&D Toolkit

> Documento de decisões. Escrito em **08/07/2026** após a virada do sistema de
> batalha. Serve de norte para o roadmap novo (Fases 16+). Complementa
> `ROADMAP.md` (backlog por fases) e `docs/ROADMAP-FUTURO.md` (detalhe das
> fases antigas).

---

## 1. A virada (o que mudou e por quê)

O **grid virtual** (Fases 14 e 15 — matemática de Chebyshev, cobertura,
miniaturas em grelha) fica **dormente**. Não é apagado, mas para de crescer.
Motivo: ficou **pouco intuitivo** e complexo demais para o ganho.

No lugar entra um sistema de batalha **imagem-tabuleiro, sem grelha**:

- Cada **nó da aventura** pode receber uma **imagem** (o "tabuleiro").
- No nó, o Mestre **abre a imagem para os jogadores**.
- Cada jogador tem uma **miniatura na ficha** (imagem sem fundo — PNG/WebP;
  se não tiver, usa o **símbolo da classe** como fallback).
- **Monstros** ganham imagem depois (fallback: ícone do tipo).
- Os tokens se movem **livremente sobre a imagem** (como peças num tabuleiro),
  **sem grid**. O Mestre acompanha/move manualmente; o jogador move o seu e o
  Mestre confere.

> Código antigo afetado: `static/js/grid.js` e `static/js/mapa-ui.js` ficam no
> repositório mas **fora do fluxo principal** (podem ser removidos numa limpeza
> futura). A aba "Combate" continua funcionando como lista de iniciativa.

---

## 2. Princípios de arquitetura

### 2.1 Web-first + PWA (não desktop nativo agora)
O maior trunfo do produto é ser **web**: o jogador entra pelo **celular**, sem
instalar nada. Virar app nativo desktop-only reduziria alcance e somaria
manutenção (empacotar, atualizar, bugs por SO).

**Decisão:** continuar web e transformar em **PWA** (instalável no desktop,
janela própria, ícone, cache offline) — a sensação de "software" sem o custo de
um nativo. Um app nativo do Mestre (via **Tauri**, não Electron) fica como
"talvez depois", só se a PWA não bastar.

### 2.2 Dois planos: Preparação (offline) × Mesa ao vivo (sync)
O app tem duas naturezas, e a separação delas guia o que precisa de conexão:

| Plano | Conexão | O que é |
|---|---|---|
| **Preparação & Referência** | ❌ Independente / offline | Criador de ficha, subida de nível, compêndio, bestiário, geradores, escrever aventuras |
| **Mesa ao vivo** | ✅ Precisa de canal | Tabuleiro compartilhado, abrir mapa aos jogadores, iniciativa, NPCs visíveis, handouts |

A PWA (2.1) cacheia o plano de **preparação** para funcionar offline. Só a
**mesa** exige sincronização.

### 2.3 Canal da mesa: nuvem e/ou LAN
Duas formas de sincronizar a mesa (podem coexistir):
- **Nuvem (Firebase)** — jogadores de qualquer lugar. É o padrão hoje.
- **Rede local (LAN)** — o Mestre roda na máquina dele; jogadores entram pelo
  IP local (já suportado). Presencial, sem custo de nuvem.

### 2.4 Imagens: Firebase Storage (decidido)
Miniaturas, mapas e imagens de monstro vão para o **Firebase Storage** (upload
do usuário → fica na nuvem → sincroniza para todos). Encaixa no Firebase que já
existe. Alternativas consideradas e descartadas para a v1: URL colada (frágil),
arquivo local (exige o Mestre servindo).

**Notas técnicas do Storage:**
- Cliente sobe direto com autenticação (reusar o token de `/api/firebase_token`
  que a Fase 10.8 já emite para o Firestore RT).
- **Regras do Storage** por campanha/dono, no mesmo espírito de `firestore.rules`.
- Aceitar **PNG/WebP** (transparência para miniaturas sem fundo) e **JPG** (mapas).
- Limites: tamanho máx. por imagem (ex.: 5 MB), tipos validados no cliente e nas
  regras. Guardar a **URL pública/assinada** no estado (Firestore), não o binário.
- Fallback sempre: sem imagem → símbolo da classe (PJ) / ícone do tipo (monstro).

---

## 3. O novo sistema de batalha (Tabuleiro-imagem) — spec

### Modelo de dados (rascunho)
```jsonc
// ficha
{ "miniaturaUrl": null }          // PNG/WebP sem fundo; null → símbolo da classe

// nó da aventura (aventurasprontas.js / biblioteca)
{ "imagemMapaUrl": null }         // imagem-tabuleiro do nó

// estado compartilhado da campanha (Firestore) — "mesa ao vivo"
"tabuleiro": {
  "aberto": false,                // Mestre abriu para os jogadores?
  "imagemUrl": null,              // imagem ativa (veio do nó ou enviada na hora)
  "tokens": [                     // posição LIVRE, em % da imagem (escala em qualquer tela)
    { "id": "t1", "tipo": "pc",      "fichaId": "...", "nome": "Aria",   "x": 42.5, "y": 60.1, "tamanho": 1 },
    { "id": "t2", "tipo": "monstro", "monstro": "Goblin", "imagemUrl": null, "x": 55, "y": 40, "tamanho": 1 }
  ]
}
```
Coordenadas em **porcentagem (0–100)** da largura/altura da imagem → o token
fica no mesmo lugar em qualquer tela (desktop grande ou celular).

### Comportamento
- **Mestre:** abre/fecha o mapa; arrasta qualquer token; adiciona tokens de
  monstro; troca a imagem.
- **Jogador:** vê a imagem quando o Mestre abre; arrasta **só o seu** token (o
  Mestre confere); os demais tokens são leitura.
- **Tempo real:** o `tabuleiro` vive no estado da campanha (Firestore) e
  sincroniza como o combate/notas já fazem.

---

## 4. Roadmap novo — Fase 16: Tabuleiro-imagem

| Sub-fase | Entrega |
|---|---|
| **16.1** | Upload para Firebase Storage (helper de upload + regras) · campo **miniatura** na ficha (PNG/WebP, com preview e fallback ao símbolo da classe) |
| **16.2** | Campo **imagem** no nó da aventura (biblioteca + aventuras prontas) · botão do Mestre "**Abrir mapa para os jogadores**" (grava `tabuleiro.aberto/imagemUrl`) |
| **16.3** | **Tabuleiro ao vivo**: render da imagem + tokens dos PJs em %, arrastar livre (Mestre move todos; jogador move o seu), sincronizado em tempo real; jogador vê em leitura no `jogador.html` |
| **16.4** | **Imagens de monstro** + adicionar/arrastar tokens de monstro no tabuleiro (fallback: ícone do tipo) |
| **16.5** | Refinos: redimensionar token, "travar" movimento do jogador, botão "centralizar/seguir", medir distância aproximada (opcional, em metros por escala definida à mão) |

## 5. Roadmap novo — Fase 17: UX & PWA

O maior problema de intuitividade hoje é a tela do Mestre com **~12 abas** lado
a lado. Reorganizar por **tarefa**, não por lista de recursos:

- **17.1 — Três modos no Mestre:** `🎲 Jogar (Mesa)` (tabuleiro, iniciativa,
  NPCs, handouts) · `📝 Preparar` (fichas, aventuras, encontros, itens) ·
  `📖 Consultar` (compêndio, bestiário, progressão). As abas viram sub-itens.
- **17.2 — Tela do jogador enxuta:** ficha, mapa compartilhado, handouts, dados.
- **17.3 — PWA:** `manifest.webmanifest` + service worker (cacheia o plano de
  preparação para offline; instalável no desktop e no celular).

---

## 6. O que fica conectado × independente (resumo)

- **Independente / offline (via PWA):** Criador, Subida de Nível, Compêndio,
  Bestiário, Geradores, escrever/editar aventuras. *Não precisam de servidor.*
- **Precisa de canal (nuvem ou LAN):** Tabuleiro, abrir mapa, iniciativa
  compartilhada, NPCs visíveis, handouts, multi-jogador. *Vivem no estado da
  campanha (Firestore/RT).*

Meta de longo prazo: a **preparação** roda como app independente (até offline);
a **mesa** é a única coisa que exige o Mestre + jogadores conectados no mesmo
canal.

---

## 7. Decisões em aberto (do Ismaile)
- Orçamento/cota do Firebase Storage (tamanho de imagens, nº de campanhas).
- Se a **mesa** deve ter modo **LAN** de primeira classe (presencial sem nuvem)
  além da nuvem.
- Momento de aposentar de vez o grid virtual (`grid.js`/`mapa-ui.js`).
