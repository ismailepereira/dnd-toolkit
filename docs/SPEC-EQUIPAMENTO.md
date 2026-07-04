# SPEC — Revisão de criação por classe, ouro, equipamento, bolsa e slots

> Prompt de execução acordado com o Ismaile em 03/07/2026.
> Fonte de verdade para as fases A–F abaixo. Implementar na ordem; cada fase
> deve terminar testada no preview (banco local, `USE_LOCAL_DB=1`) antes da seguinte.

## Decisões tomadas (não rediscutir)

| Tema | Decisão |
|---|---|
| Ouro inicial | **Híbrido**: kit grátis + rolagem oficial do PHB por classe |
| Rolagem de ouro | **Uma vez só por ficha** (trava depois); ouro extra só via painel do Mestre |
| Grátis na criação | Pacote de aventureiro + armas da classe + armadura inicial + itens de conjurador |
| Loja da criação | Armas PHB + armaduras/escudos + itens de aventura + poções básicas |
| Slots de equipar | **5**: Mão principal · Mão secundária · Armadura · Foco/Símbolo · Munição |
| Slots são mecânicos | **Sim**: armadura equipada define CA, arma equipada define ataque/dano, escudo +2 CA |
| Bolsa aparece | **Criador (passo 5) + modo de jogo** (equipar/desequipar em sessão) |
| Peso | Capacidade = FOR × 7,5 kg; barra visual; acima do limite = aviso vermelho, sem bloquear |
| Mercadores/lojas do Mestre | Fase futura (fora desta spec); aqui só envio direto de ouro/itens |

---

## FASE A — Corrigir acúmulo ao trocar subclasse/especialização (BUG) ✅ (03/07/2026)

**Problema:** trocar de subclasse (ou escolha de especialização) não limpa o que a
anterior liberou — manobras, magias extras, escolhas — a ficha acumula e desbalanceia.

1. Mapear TODOS os campos de estado que uma subclasse/escolha pode liberar no
   criador (`criador.js`): manobras do Mestre de Batalha, truques/magias de
   Cavaleiro Arcano e Trapaceiro Arcano, metamagia do Feiticeiro, invocações do
   Bruxo, domínio do Clérigo (magias de domínio), totem do Bárbaro, etc.
   Investigar os painéis `painelGuerreiro`, `painelLadino`, `painelFeiticeiro`,
   `painelBruxo`, `painelClerigo`, `painelBarbaro` e o que gravam em `estado`/ficha.
2. Criar UMA função central `limparEscolhasDeSubclasse(estadoOuFicha)` que zera
   esses campos. Chamá-la em TODA troca de subclasse (galeria do passo 1,
   `cSubclasseSel`, `cEscolaMago`) e na troca de classe.
3. Mesmo princípio para qualquer par de opções mutuamente exclusivas
   (estilo de luta, pacto do Bruxo, totem): selecionar um REMOVE o outro.
4. Validar também ao carregar ficha (`carregarFicha`) e ao salvar
   (`construirFicha`): campo de subclasse inválido para a classe → limpa tudo.
5. Testar no preview: Guerreiro→Mestre de Batalha (escolhe manobras)→trocar p/
   Campeão → manobras zeradas; Mago Evocação→Ilusão → sem resíduo; trocar de
   classe inteira → nada da anterior sobra.

## FASE B — Ouro inicial por rolagem oficial (PHB) ✅ (03/07/2026)

1. Remover `OURO_INICIAL` (médias fixas) e o input manual livre de ouro do criador.
2. Nova tabela `OURO_ROLAGEM` em `dados5e.js` (PHB cap. 5):
   - Bárbaro **2d4×10** · Bardo **5d4×10** · Clérigo **5d4×10** · Druida **2d4×10**
   - Guerreiro **5d4×10** · Monge **5d4** (sem ×10!) · Paladino **5d4×10**
   - Patrulheiro **5d4×10** · Ladino **4d4×10** · Feiticeiro **3d4×10**
   - Bruxo **4d4×10** · Mago **4d4×10**
3. No passo 5: botão "🎲 Rolar ouro inicial (5d4×10)" mostrando os dados que saíram.
   Rola UMA vez: grava `ouroRolado: true` na ficha e o botão some/trava.
   Fichas em edição que já têm ouro: não mostram o botão.
4. Gerar Automático rola o ouro da classe respeitando a mesma trava.

## FASE C — Kit inicial grátis por classe (só na criação) ✅ (03/07/2026)

1. Nova estrutura `KIT_INICIAL` em `dados5e.js`, por classe, com escolhas do PHB
   simplificadas — cada linha é uma escolha do jogador (radio):
   - **Armadura**: a da classe (ex. Guerreiro: cota de malha OU couro batido+arco longo).
   - **Armas**: 1–2 escolhas da lista de proficiência (Guerreiro: qualquer marcial
     + escudo OU duas marciais; Mago: bastão OU adaga; Monge: espada curta OU simples...).
   - **Pacote**: Explorador OU Aventureiro OU Sacerdote OU Estudioso (conforme classe),
     listando o conteúdo (mochila, corda, tochas, rações, cantil...).
   - **Conjurador**: foco arcano (Mago/Feiticeiro/Bruxo), símbolo sagrado
     (Clérigo/Paladino), foco druídico, grimório (Mago), vestes de mago,
     componente de bolsa — de graça conforme a classe.
2. UI no passo 5, seção "🎁 Kit inicial (grátis, só na criação)": grupos de radio
   por escolha. Tudo que for escolhido entra na bolsa sem custo.
3. Só aparece em ficha NOVA (`criandoNovo`); edição posterior não re-oferece.
4. Itens que faltam no catálogo (foco arcano, grimório, vestes, símbolo sagrado,
   aljava + flechas, bolsa de componentes) → adicionar na Fase D.

## FASE D — Loja da criação (catálogo PHB estruturado) ✅ (03/07/2026)

1. Reestruturar o catálogo (hoje `ITENS_PADRAO` em `itens.js` com descrição em
   texto solto) para campos mecânicos parseáveis, em `dados5e.js` ou arquivo novo
   `equipamento.js`:
   ```js
   { nome, categoria: 'arma|armadura|escudo|foco|aventura|pocao|municao',
     precoPO, pesoKg, dano: '1d8', tipoDano: 'corte',
     propriedades: ['versátil 1d10', 'leve', 'acuidade', ...],
     maos: 1|2, municaoTipo: 'flecha'|null, slot: 'maoPrincipal|armadura|...' }
   ```
2. Cobertura: TODAS as armas simples e marciais do PHB, todas as armaduras +
   escudo, itens de aventura essenciais (corda, tocha, rações, kit de cura,
   ferramentas de ladrão, símbolo sagrado, foco arcano, grimório, vestes,
   aljava, flechas/virotes ×20, bolsa de componentes), Poção de Cura (50 po).
3. Loja no passo 5 filtra por proficiência da classe (Mago não vê espada longa
   para comprar... mostrar bloqueado com cadeado explicando, em vez de sumir).
4. Comprar debita do ouro; devolver na criação reembolsa 100% (antes de salvar).
5. `criador.js` usa esse catálogo para peso e preço (remover tabelas duplicadas
   `precoEmPO`/`pesoDeItem` hardcoded se existirem).

## FASE E — Bolsa + 5 slots mecânicos (criador e modo de jogo) ✅ (03/07/2026)

1. Novo formato na ficha:
   ```js
   equipado: { maoPrincipal: 'Espada Longa', maoSecundaria: 'Escudo',
               armadura: 'Cota de Malha', foco: 'Símbolo Sagrado',
               municao: { nome: 'Flechas', qtd: 20 } },
   bolsa: [{ nome, qtd }],
   ```
   Migração: fichas antigas (`armadura`, `escudo`, `itens[]`) convertem ao abrir
   no criador ou no modo de jogo — sem perder nada.
2. **Mecânica (regras.js/criador.js/jogo.js):**
   - CA = armadura do slot (ou defesa sem armadura de Monge/Bárbaro) + escudo se
     na mão secundária + estilo Defesa.
   - Ataque do combate usa a arma da mão principal (dano, tipo, acuidade usa o
     melhor entre FOR/DES, versátil 2 mãos se a secundária estiver vazia).
   - Arma de munição consome do slot munição a cada ataque no modo de jogo.
   - Duas armas leves = ataque bônus com a secundária (estilo Duas Armas soma o mod).
3. **UI criador (passo 5)** e **modo de jogo (jogo.js)**, seção "🎒 Equipamento":
   - 5 slots visuais no topo (clicar → escolher da bolsa o que couber no slot).
   - Bolsa listada abaixo com qtd e peso por item.
   - Barra de peso: total / capacidade (FOR × 7,5 kg); vermelho + aviso
     "Sobrecarregado" acima do limite (não bloqueia).
4. No modo de jogo, equipar/desequipar re-calcula CA/ataques na hora e salva
   (respeitando a fila de salvamento e o re-sync do listener RT já existente).

## FASE F — Painel do Mestre: enviar ouro e itens ✅ (03/07/2026)

1. Na vista do Mestre (`app.js`), fora da edição de ficha: controle "💰 Enviar
   para ficha" — escolhe personagem, envia ouro (+valor) e/ou item do catálogo
   (com qtd) → cai na bolsa/ouro do jogador em tempo real (Firestore/local).
2. Registrar no log da ficha/combate: "Mestre enviou 50 po a Fizzbang".
3. Preparado para o futuro: mercadores/lojas específicas do Mestre (fora desta
   spec) vão reusar o mesmo mecanismo de envio.

---

## Regras de execução

- Banco local (`USE_LOCAL_DB=1`) durante todo o desenvolvimento; não tocar na campanha real.
- Cada fase: implementar → verificar no preview (fluxo completo) → commit separado.
- Compatibilidade: fichas existentes nunca quebram — migração silenciosa (Fase E.1).
- Bloqueios por classe continuam valendo (conjurador/estilo/manobras — ver regras.js).
- Push para GitHub ao final de cada fase; deploy Render é manual (avisar o Ismaile).
