// =====================================================
// COMPÊNDIO - D&D 5e (PHB/SRD) em PT-BR
// Detalhes de magias (dano/efeito/alcance), condições e talentos.
// Indexado por NOME para ser reutilizado pelo Criador e pelo Modo de Jogo.
// (Início do compêndio completo — expansível com mais círculos.)
// =====================================================

// nome -> { nivel(0=truque), escola, tempo, alcance, duracao, dano, salva, descricao }
const MAGIAS_DETALHE = {
  // ----- TRUQUES (nível 0) -----
  'Raio de Gelo': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '1d8 frio', salva: 'Ataque à distância', descricao: 'Lança um raio gélido. Em acerto, 1d8 de dano de frio e o deslocamento do alvo cai 3m até seu próximo turno. Dano escala: 2d8 (nv5), 3d8 (nv11), 4d8 (nv17).' },
  'Rajada de Fogo': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Instantânea', dano: '1d10 fogo', salva: 'Destreza', descricao: 'Bola de fogo numa criatura. DT Destreza ou 1d10 de dano de fogo (objetos inflamáveis pegam fogo). Escala: 2d10 (nv5), 3d10 (nv11), 4d10 (nv17).' },
  'Toque Chocante': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '1d8 elétrico', salva: 'Ataque corpo a corpo', descricao: 'Toque elétrico (vantagem contra alvos com armadura de metal). Em acerto, 1d8 elétrico e o alvo não pode usar reações até seu próximo turno. Escala: 2d8 (nv5), 3d8 (nv11), 4d8 (nv17).' },
  'Chama Sagrada': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '1d8 radiante', salva: 'Destreza', descricao: 'Chama divina desce sobre o alvo. DT Destreza (sem benefício de cobertura) ou 1d8 radiante. Escala: 2d8 (nv5), 3d8 (nv11), 4d8 (nv17).' },
  'Zombaria Viciosa': { nivel: 0, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '1d4 psíquico', salva: 'Sabedoria', descricao: 'Insulto carregado de magia. DT Sabedoria ou 1d4 psíquico e desvantagem no próximo ataque até o fim do próximo turno. Escala: 2d4 (nv5), 3d4 (nv11), 4d4 (nv17).' },
  'Rajada Sobrenatural': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Instantânea', dano: '1d10 energia', salva: 'Ataque à distância', descricao: 'Feixe de energia (a magia-assinatura do Bruxo). Em acerto, 1d10 de dano de energia. Ganha feixes extras: 2 (nv5), 3 (nv11), 4 (nv17). Invocações podem somar Carisma ao dano.' },
  'Produzir Chamas': { nivel: 0, escola: 'Conjuração', tempo: '1 ação', alcance: 'Toque/9m', duracao: '10 min', dano: '1d8 fogo', salva: 'Ataque à distância', descricao: 'Chama na mão (ilumina). Pode arremessá-la: em acerto, 1d8 fogo. Escala: 2d8 (nv5), 3d8 (nv11), 4d8 (nv17).' },
  'Luz': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: 'Constituição (se hostil)', descricao: 'Um objeto emite luz plena em 6m e penumbra por mais 6m. Se mirado numa criatura hostil, DT Constituição para evitar.' },
  'Mão Mágica': { nivel: 0, escola: 'Conjuração', tempo: '1 ação', alcance: '9m', duracao: '1 min', dano: '—', salva: '—', descricao: 'Mão espectral flutuante que manipula objetos, abre portas, carrega até 5kg. Não pode atacar nem ativar itens mágicos.' },
  'Prestidigitação': { nivel: 0, escola: 'Transmutação', tempo: '1 ação', alcance: '3m', duracao: 'até 1 hora', dano: '—', salva: '—', descricao: 'Truque mágico menor: cria efeito sensorial, acende/apaga chama, limpa/suja, esquenta/esfria, cria pequeno objeto ou marca.' },
  'Orientação': { nivel: 0, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Toca uma criatura disposta; ela soma 1d4 a um teste de atributo à escolha (uma vez), antes ou depois de rolar.' },
  'Resistência': { nivel: 0, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Alvo disposto soma 1d4 a uma salvaguarda à escolha (uma vez).' },
  'Taumaturgia': { nivel: 0, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'até 1 min', dano: '—', salva: '—', descricao: 'Manifestação de poder divino: voz amplificada, tremores, abrir/fechar portas, mudar luz de chamas.' },
  'Mensagem': { nivel: 0, escola: 'Transmutação', tempo: '1 ação', alcance: '36m', duracao: '1 rodada', dano: '—', salva: '—', descricao: 'Sussurra uma mensagem a uma criatura que você possa ver; só ela ouve e pode responder em sussurro.' },
  'Florescer (Druidcraft)': { nivel: 0, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Pequeno efeito natural: prevê o tempo, faz uma flor desabrochar, cria efeito sensorial inofensivo ou apaga uma pequena chama.' },
  'Aríete Espinhento (Shillelagh)': { nivel: 0, escola: 'Transmutação', tempo: '1 ação bônus', alcance: 'Toque', duracao: '1 min', dano: '1d8 (mágico)', salva: '—', descricao: 'Imbui um bordão/clava: usa Sabedoria nos ataques e o dano vira 1d8, contando como mágico.' },

  // ----- 1º CÍRCULO -----
  'Mísseis Mágicos': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Instantânea', dano: '3× 1d4+1 força', salva: 'Acerto automático', descricao: 'Cria 3 dardos que acertam automaticamente; cada um causa 1d4+1 de força. +1 dardo por nível de espaço acima do 1º.' },
  'Escudo Arcano (Shield)': { nivel: 1, escola: 'Abjuração', tempo: '1 reação', alcance: 'Pessoal', duracao: '1 rodada', dano: '—', salva: '—', descricao: 'Reação ao ser atingido: +5 na CA até o início do próximo turno (pode anular o ataque) e imunidade a Mísseis Mágicos.' },
  'Sono': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '27m', duracao: '1 min', dano: '5d8 PV afetados', salva: 'Sem salva (PV)', descricao: 'Role 5d8: esse total de PV de criaturas (das mais fracas p/ as mais fortes, em 6m) caem inconscientes. +2d8 por nível acima do 1º. Não afeta mortos-vivos nem imunes a encantamento.' },
  'Detectar Magia': { nivel: 1, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal (3m)', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Sente a presença de magia em 9m e, com uma ação, vê a aura e a escola de cada efeito mágico.' },
  'Armadura do Mago (Mage Armor)': { nivel: 1, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: '8 horas', dano: '—', salva: '—', descricao: 'Alvo sem armadura passa a ter CA 13 + modificador de Destreza.' },
  'Enfeitiçar Pessoa (Charm Person)': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '9m', duracao: '1 hora', dano: '—', salva: 'Sabedoria', descricao: 'Um humanoide faz DT Sabedoria (com vantagem se em combate) ou fica enfeitiçado, te tratando como amigo. +1 alvo por nível acima do 1º.' },
  'Compreender Idiomas': { nivel: 1, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Entende o sentido literal de qualquer idioma falado que ouvir e textos que tocar (1 página/min).' },
  'Salto': { nivel: 1, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: '1 min', dano: '—', salva: '—', descricao: 'A distância de salto da criatura tocada triplica.' },
  'Passos Longos (Longstrider)': { nivel: 1, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: '—', descricao: 'O deslocamento do alvo aumenta em 3m. +1 alvo por nível acima do 1º.' },
  'Curar Ferimentos': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: 'Cura 1d8+mod', salva: '—', descricao: 'Cura 1d8 + modificador de conjuração de PV (não afeta mortos-vivos/constructos). +1d8 por nível acima do 1º.' },
  'Palavra Curativa': { nivel: 1, escola: 'Evocação', tempo: '1 ação bônus', alcance: '18m', duracao: 'Instantânea', dano: 'Cura 1d4+mod', salva: '—', descricao: 'À distância e como ação bônus, cura 1d4 + modificador de conjuração. +1d4 por nível acima do 1º.' },
  'Escudo da Fé': { nivel: 1, escola: 'Abjuração', tempo: '1 ação bônus', alcance: '18m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Campo protetor: +2 na CA de uma criatura à escolha.' },
  'Bênção (Bless)': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Até 3 criaturas somam 1d4 às jogadas de ataque e salvaguardas. +1 alvo por nível acima do 1º.' },
  'Comando': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: '1 rodada', dano: '—', salva: 'Sabedoria', descricao: 'Ordem de uma palavra (ex: largar, fugir, ajoelhar). DT Sabedoria ou obedece no próximo turno. +1 alvo por nível acima do 1º.' },
  'Perdição (Bane)': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '—', salva: 'Carisma', descricao: 'Até 3 inimigos fazem DT Carisma ou subtraem 1d4 de ataques e salvaguardas. +1 alvo por nível acima do 1º.' },
  'Detectar o Mal e o Bem': { nivel: 1, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Sente em 9m a presença de aberrações, celestiais, corruptores, elementais, feéricos e mortos-vivos, e locais/objetos consagrados ou profanados.' },
  'Mãos Flamejantes': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: 'Cone 4,5m', duracao: 'Instantânea', dano: '3d6 fogo', salva: 'Destreza', descricao: 'Leque de chamas num cone de 4,5m. DT Destreza ou 3d6 fogo (metade se passar). +1d6 por nível acima do 1º.' },
  'Dardo Flamejante (Faerie Fire)': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: 'Destreza', descricao: 'Cubo de 6m: criaturas falham DT Destreza ou ficam contornadas por luz — ataques contra elas têm vantagem e não podem se beneficiar de invisibilidade.' },
  'Falar com Animais': { nivel: 1, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: '10 min', dano: '—', salva: '—', descricao: 'Permite compreender e se comunicar verbalmente com feras.' },
  'Emaranhar (Entangle)': { nivel: 1, escola: 'Conjuração', tempo: '1 ação', alcance: '27m', duracao: 'Concentração 1 min', dano: '—', salva: 'Força', descricao: 'Plantas brotam num quadrado de 6m (terreno difícil). Criaturas na área: DT Força ou ficam agarradas.' },
  'Cura por Toque (Goodberry)': { nivel: 1, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: 'Cura 1 PV cada', salva: '—', descricao: 'Cria até 10 frutinhas; comer uma cura 1 PV e nutre por um dia. Duram 24h.' },
  'Nevoeiro (Fog Cloud)': { nivel: 1, escola: 'Conjuração', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Esfera de névoa de 6m de raio (área fortemente obscurecida). +6m de raio por nível acima do 1º.' },
  'Comando Heroico (Heroism)': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 min', dano: 'PV temp.', salva: '—', descricao: 'Alvo fica imune a amedrontar e ganha PV temporários iguais ao seu mod. de conjuração no início de cada turno. +1 alvo por nível acima do 1º.' },
  'Dissonância Sussurrada': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '3d6 psíquico', salva: 'Sabedoria', descricao: 'DT Sabedoria ou 3d6 psíquico e o alvo deve usar a reação para se afastar de você o máximo possível. +1d6 por nível acima do 1º.' },
  'Maldição Profana (Hex)': { nivel: 1, escola: 'Encantamento', tempo: '1 ação bônus', alcance: '27m', duracao: 'Concentração 1 hora', dano: '+1d6 necrótico', salva: '—', descricao: 'Amaldiçoa um alvo: seus ataques contra ele causam +1d6 necrótico, e ele tem desvantagem em testes de um atributo à sua escolha. Move-se ao novo alvo se este cair.' },
  'Seta Encantada (Witch Bolt)': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '1d12 elétrico', salva: 'Ataque à distância', descricao: 'Em acerto, 1d12 elétrico; nos turnos seguintes, ação para repetir 1d12 automaticamente. +1d12 inicial por nível acima do 1º.' },
  'Repreensão Infernal (Hellish Rebuke)': { nivel: 1, escola: 'Evocação', tempo: '1 reação', alcance: '18m', duracao: 'Instantânea', dano: '2d10 fogo', salva: 'Destreza', descricao: 'Reação ao sofrer dano: o atacante faz DT Destreza ou 2d10 fogo (metade se passar). +1d10 por nível acima do 1º.' },
  'Proteção contra o Mal e o Bem': { nivel: 1, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Aberrações, celestiais, corruptores, elementais, feéricos e mortos-vivos têm desvantagem ao atacar o alvo e não podem enfeitiçá-lo, amedrontá-lo nem possuí-lo.' },
  'Marca do Caçador (Hunter\'s Mark)': { nivel: 1, escola: 'Adivinhação', tempo: '1 ação bônus', alcance: '27m', duracao: 'Concentração 1 hora', dano: '+1d6', salva: '—', descricao: 'Marca um alvo: seus ataques com arma contra ele causam +1d6, e você tem vantagem em Percepção/Sobrevivência para rastreá-lo. Migra se o alvo cair.' },
  'Golpe Furioso (Searing Smite)': { nivel: 1, escola: 'Evocação', tempo: '1 ação bônus', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '+1d6 fogo', salva: 'Constituição', descricao: 'Próximo acerto com arma causa +1d6 fogo e incendeia o alvo (1d6 fogo por turno; DT Constituição encerra). +1d6 por nível acima do 1º.' },
  'Detectar Veneno e Doença': { nivel: 1, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Sente a presença e localização de venenos, criaturas venenosas e doenças em 9m.' },

  // ----- Alguns clássicos de 2º/3º (para níveis 3-5) -----
  'Aranha (Web)': { nivel: 2, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 hora', dano: '—', salva: 'Destreza', descricao: 'Teias preenchem um cubo de 6m (terreno difícil). Criaturas: DT Destreza ou ficam agarradas (repetem o teste no fim do turno). Inflamável.' },
  'Imagem Espelhada': { nivel: 2, escola: 'Ilusão', tempo: '1 ação', alcance: 'Pessoal', duracao: '1 min', dano: '—', salva: '—', descricao: 'Cria 3 duplicatas suas; ataques têm chance de acertar uma ilusão (que some) em vez de você.' },
  'Restauração Menor': { nivel: 2, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Encerra uma doença ou uma das condições: cego, surdo, paralisado ou envenenado no alvo tocado.' },
  'Bola de Fogo': { nivel: 3, escola: 'Evocação', tempo: '1 ação', alcance: '45m', duracao: 'Instantânea', dano: '8d6 fogo', salva: 'Destreza', descricao: 'Explosão numa esfera de 6m de raio. DT Destreza ou 8d6 fogo (metade se passar). +1d6 por nível acima do 3º.' },
  'Relâmpago': { nivel: 3, escola: 'Evocação', tempo: '1 ação', alcance: 'Pessoal (linha 30m)', duracao: 'Instantânea', dano: '8d6 elétrico', salva: 'Destreza', descricao: 'Raio numa linha de 30m × 1,5m. DT Destreza ou 8d6 elétrico (metade se passar). +1d6 por nível acima do 3º.' },
  'Voo': { nivel: 3, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'O alvo ganha deslocamento de voo de 18m. +1 alvo por nível acima do 3º.' },
  // ----- 2º CÍRCULO -----
  'Raio Ardente (Scorching Ray)': { nivel: 2, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Instantânea', dano: '3× 2d6 fogo', salva: 'Ataque à distância', descricao: 'Cria 3 raios de fogo; cada um é um ataque à distância separado por 2d6 de fogo. +1 raio por nível acima do 2º.' },
  'Invisibilidade': { nivel: 2, escola: 'Ilusão', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'O alvo fica invisível até atacar ou conjurar. +1 alvo por nível acima do 2º.' },
  'Passo Enevoado (Misty Step)': { nivel: 2, escola: 'Conjuração', tempo: '1 ação bônus', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Teleporta-se até 9m para um espaço desocupado que você possa ver.' },
  'Imobilizar Pessoa (Hold Person)': { nivel: 2, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Um humanoide faz DT Sabedoria ou fica paralisado (repete o teste no fim de cada turno). +1 alvo por nível acima do 2º.' },
  'Arma Espiritual': { nivel: 2, escola: 'Evocação', tempo: '1 ação bônus', alcance: '18m', duracao: '1 min', dano: '1d8+mod força', salva: 'Ataque corpo a corpo', descricao: 'Cria uma arma flutuante; ataque por 1d8 + mod. de conjuração de dano de força. Como ação bônus pode movê-la e atacar de novo. +1d8 a cada 2 níveis acima do 2º.' },
  'Auxílio (Aid)': { nivel: 2, escola: 'Abjuração', tempo: '1 ação', alcance: '9m', duracao: '8 horas', dano: '+5 PV máx', salva: '—', descricao: 'Até 3 criaturas têm o PV máximo e atual aumentados em 5. +5 por nível acima do 2º.' },
  'Embaçar (Blur)': { nivel: 2, escola: 'Ilusão', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Sua forma fica borrada: ataques contra você têm desvantagem (exceto de quem não depende de visão).' },

  // ----- 3º CÍRCULO -----
  'Contramágica (Counterspell)': { nivel: 3, escola: 'Abjuração', tempo: '1 reação', alcance: '18m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Reação quando vê alguém conjurar: interrompe magia de até 3º automaticamente; acima disso, teste de conjuração DT 10+círculo.' },
  'Dissipar Magia (Dispel Magic)': { nivel: 3, escola: 'Abjuração', tempo: '1 ação', alcance: '36m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Encerra efeitos mágicos de até 3º círculo no alvo; acima disso, teste de conjuração DT 10+círculo.' },
  'Revivificar (Revivify)': { nivel: 3, escola: 'Necromancia', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: 'Revive', salva: '—', descricao: 'Revive uma criatura morta há até 1 minuto, com 1 PV (componente: 300 po em diamantes). Não restaura membros nem cura velhice.' },
  'Velocidade (Haste)': { nivel: 3, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Alvo: +2 CA, deslocamento dobrado, vantagem em salvas de Destreza e uma ação extra limitada por turno. Ao acabar, o alvo perde o turno seguinte.' },
  'Medo (Fear)': { nivel: 3, escola: 'Ilusão', tempo: '1 ação', alcance: 'Cone 9m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Criaturas no cone: DT Sabedoria ou largam o que seguram e ficam amedrontadas, fugindo.' },
  'Proteção contra Energia': { nivel: 3, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'O alvo ganha resistência a um tipo de dano à escolha: ácido, frio, fogo, elétrico ou trovão.' },
  'Restauração Maior': { nivel: 3, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Remove um efeito: exaustão, enfeitiçar/petrificar, redução de atributo ou de PV máximo, ou maldição.' },

  // ----- 4º CÍRCULO -----
  'Tempestade de Gelo (Ice Storm)': { nivel: 4, escola: 'Evocação', tempo: '1 ação', alcance: '90m', duracao: 'Instantânea', dano: '2d8 concussão + 4d6 frio', salva: 'Destreza', descricao: 'Granizo numa esfera de 6m: DT Destreza ou 2d8 concussão + 4d6 frio (metade se passar); a área vira terreno difícil. +1d8 concussão por nível acima do 4º.' },
  'Muralha de Fogo (Wall of Fire)': { nivel: 4, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '5d8 fogo', salva: 'Destreza', descricao: 'Muralha de fogo (até 18m). Um lado causa 5d8 fogo a quem chega perto/atravessa (DT Destreza p/ metade). +1d8 por nível acima do 4º.' },
  'Porta Dimensional (Dimension Door)': { nivel: 4, escola: 'Conjuração', tempo: '1 ação', alcance: '150m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Teleporta você (e 1 criatura disposta adjacente) para um local que você conheça/visualize a até 150m.' },
  'Banimento (Banishment)': { nivel: 4, escola: 'Abjuração', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: 'Carisma', descricao: 'DT Carisma ou o alvo é banido para um semiplano (se extraplanar e durar 1 min, vai-se de vez). +1 alvo por nível acima do 4º.' },
  'Invisibilidade Maior': { nivel: 4, escola: 'Ilusão', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'O alvo fica invisível mesmo atacando e conjurando.' },
  'Polimorfia (Polymorph)': { nivel: 4, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 hora', dano: '—', salva: 'Sabedoria', descricao: 'Transforma o alvo numa fera de ND igual/menor ao seu nível. Usa os PV da nova forma; ao chegar a 0, volta ao normal.' },
  'Liberdade de Movimento': { nivel: 4, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: '—', descricao: 'O alvo ignora terreno difícil e não pode ser agarrado, paralisado ou impedido por magia.' },

  // ----- 5º CÍRCULO -----
  'Cone de Frio (Cone of Cold)': { nivel: 5, escola: 'Evocação', tempo: '1 ação', alcance: 'Cone 18m', duracao: 'Instantânea', dano: '8d8 frio', salva: 'Constituição', descricao: 'Frio explosivo num cone de 18m. DT Constituição ou 8d8 frio (metade se passar). +1d8 por nível acima do 5º.' },
  'Reviver Mortos (Raise Dead)': { nivel: 5, escola: 'Necromancia', tempo: '1 hora', alcance: 'Toque', duracao: 'Instantânea', dano: 'Revive', salva: '—', descricao: 'Revive quem morreu há até 10 dias com 1 PV (componente: diamante de 500 po). O alvo fica com -4 em testes/ataques/salvas, recuperando 1 por descanso longo.' },
  'Telecinésia (Telekinesis)': { nivel: 5, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 10 min', dano: '—', salva: 'Força', descricao: 'Move objetos ou criaturas (DT Força) à distância, podendo empurrar, segurar ou arremessar.' },
  'Muralha de Pedra': { nivel: 5, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Cria uma muralha de pedra (até 10 painéis de 3m). Pode bloquear passagens ou prender criaturas.' },
  'Praga de Insetos (Insect Plague)': { nivel: 5, escola: 'Conjuração', tempo: '1 ação', alcance: '90m', duracao: 'Concentração 10 min', dano: '4d10 perfurante', salva: 'Constituição', descricao: 'Enxame numa esfera de 6m (terreno difícil). Quem entra/começa o turno: DT Constituição ou 4d10 perfurante (metade se passar). +1d10 por nível acima do 5º.' },
  'Dominar Pessoa': { nivel: 5, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou um humanoide fica enfeitiçado e sob seu controle. Repete o teste ao sofrer dano. Sobe em duração com níveis maiores.' },
  'Nuvem Mortal (Cloudkill)': { nivel: 5, escola: 'Conjuração', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '5d8 veneno', salva: 'Constituição', descricao: 'Névoa venenosa de 6m que se move 3m/rodada. DT Constituição ou 5d8 veneno (metade se passar). +1d8 por nível acima do 5º.' },

  // ----- 6º CÍRCULO -----
  'Desintegrar (Disintegrate)': { nivel: 6, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '10d6+40 força', salva: 'Destreza', descricao: 'DT Destreza ou 10d6+40 de força; se reduzir a 0, o alvo vira pó. +3d6 por nível acima do 6º.' },
  'Cura em Massa (Heal)': { nivel: 6, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: 'Cura 70 PV', salva: '—', descricao: 'Cura 70 PV de uma criatura e remove cegueira, surdez e doenças. +10 PV por nível acima do 6º.' },
  'Corrente de Relâmpagos (Chain Lightning)': { nivel: 6, escola: 'Evocação', tempo: '1 ação', alcance: '45m', duracao: 'Instantânea', dano: '10d8 elétrico', salva: 'Destreza', descricao: 'Atinge 1 alvo + salta para até 3 outros a 9m. Cada um: DT Destreza ou 10d8 elétrico (metade se passar). +1 alvo por nível acima do 6º.' },
  'Globo de Invulnerabilidade': { nivel: 6, escola: 'Abjuração', tempo: '1 ação', alcance: 'Pessoal (3m)', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Esfera de 3m que bloqueia magias de 5º círculo ou menor lançadas de fora para dentro.' },
  'Círculo da Morte (Circle of Death)': { nivel: 6, escola: 'Necromancia', tempo: '1 ação', alcance: '45m', duracao: 'Instantânea', dano: '8d6 necrótico', salva: 'Constituição', descricao: 'Onda negativa numa esfera de 18m. DT Constituição ou 8d6 necrótico (metade se passar). +2d6 por nível acima do 6º.' },

  // ----- 7º CÍRCULO -----
  'Dedo da Morte (Finger of Death)': { nivel: 7, escola: 'Necromancia', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '7d8+30 necrótico', salva: 'Constituição', descricao: 'DT Constituição ou 7d8+30 necrótico (metade se passar). Humanoide morto por ela vira um zumbi sob seu controle.' },
  'Tempestade de Fogo (Fire Storm)': { nivel: 7, escola: 'Evocação', tempo: '1 ação', alcance: '45m', duracao: 'Instantânea', dano: '7d10 fogo', salva: 'Destreza', descricao: 'Chamas em até 10 cubos de 3m à escolha. DT Destreza ou 7d10 fogo (metade se passar).' },
  'Teleporte (Teleport)': { nivel: 7, escola: 'Conjuração', tempo: '1 ação', alcance: '3m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Teleporta você e até 8 aliados (ou 1 objeto grande) para um destino que você conheça, a qualquer distância no mesmo plano (com risco se pouco familiar).' },
  'Regeneração': { nivel: 7, escola: 'Transmutação', tempo: '1 min', alcance: 'Toque', duracao: '1 hora', dano: 'Cura', salva: '—', descricao: 'O alvo recupera 4d8+15 PV e passa a regenerar 1 PV/min; membros perdidos voltam a crescer.' },

  // ----- 8º CÍRCULO -----
  'Palavra de Poder: Atordoar': { nivel: 8, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: '—', dano: '—', salva: 'Constituição', descricao: 'Se o alvo tiver até 150 PV, fica atordoado (repete DT Constituição no fim de cada turno). Sem salva inicial.' },
  'Nuvem Incendiária (Incendiary Cloud)': { nivel: 8, escola: 'Conjuração', tempo: '1 ação', alcance: '45m', duracao: 'Concentração 1 min', dano: '10d8 fogo', salva: 'Destreza', descricao: 'Fumaça flamejante de 6m que se move 3m/rodada. DT Destreza ou 10d8 fogo (metade se passar).' },
  'Sol Ardente (Sunburst)': { nivel: 8, escola: 'Evocação', tempo: '1 ação', alcance: '45m', duracao: 'Instantânea', dano: '12d6 radiante', salva: 'Constituição', descricao: 'Clarão numa esfera de 18m. DT Constituição ou 12d6 radiante e cegueira por 1 min; mortos-vivos têm desvantagem.' },
  'Dominar Monstro': { nivel: 8, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 hora', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou qualquer criatura fica enfeitiçada e sob seu controle; repete o teste ao sofrer dano.' },

  // ----- 9º CÍRCULO -----
  'Desejo (Wish)': { nivel: 9, escola: 'Conjuração', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'A magia mais poderosa: duplica qualquer magia de até 8º círculo sem componentes, ou altera a realidade (com risco de nunca mais conjurá-la).' },
  'Parar o Tempo (Time Stop)': { nivel: 9, escola: 'Transmutação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Você age por 1d4+1 turnos enquanto o tempo para; quebra se afetar outra criatura ou um item carregado por ela.' },
  'Tempestade de Meteoros (Meteor Swarm)': { nivel: 9, escola: 'Evocação', tempo: '1 ação', alcance: '1,5 km', duracao: 'Instantânea', dano: '20d6 (fogo+concussão)', salva: 'Destreza', descricao: 'Quatro impactos em esferas de 12m. DT Destreza ou 20d6 (40 total: fogo e concussão) — metade se passar.' },
  'Palavra de Poder: Matar': { nivel: 9, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: 'Morte', salva: '—', descricao: 'Se o alvo tiver 100 PV ou menos, morre instantaneamente. Sem salva.' },
  'Curar em Massa (Mass Heal)': { nivel: 9, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: 'Cura 700 PV', salva: '—', descricao: 'Distribui até 700 PV de cura entre várias criaturas e remove doenças, cegueira e surdez.' },

  // ----- LOTE EXTRA: truques -----
  'Toque Gélido (Chill Touch)': { nivel: 0, escola: 'Necromancia', tempo: '1 ação', alcance: '36m', duracao: '1 rodada', dano: '1d8 necrótico', salva: 'Ataque à distância', descricao: 'Mão esquelética: em acerto, 1d8 necrótico e o alvo não pode recuperar PV até seu próximo turno (mortos-vivos ficam com desvantagem em ataques contra você). Escala: 2d8 (nv5), 3d8 (nv11), 4d8 (nv17).' },
  'Borrifada de Veneno (Poison Spray)': { nivel: 0, escola: 'Conjuração', tempo: '1 ação', alcance: '3m', duracao: 'Instantânea', dano: '1d12 veneno', salva: 'Constituição', descricao: 'DT Constituição ou 1d12 de veneno. Escala: 2d12 (nv5), 3d12 (nv11), 4d12 (nv17).' },
  'Estabilizar (Spare the Dying)': { nivel: 0, escola: 'Necromancia', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Estabiliza uma criatura caída a 0 PV (interrompe testes de morte).' },
  'Ilusão Menor (Minor Illusion)': { nivel: 0, escola: 'Ilusão', tempo: '1 ação', alcance: '9m', duracao: '1 min', dano: '—', salva: 'Investigação', descricao: 'Cria um som OU uma imagem de objeto (cubo de 1,5m). Investigação revela a ilusão.' },
  'Consertar (Mending)': { nivel: 0, escola: 'Transmutação', tempo: '1 min', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Repara uma única quebra ou rasgo num objeto (até 30cm).' },
  'Chicote de Espinhos (Thorn Whip)': { nivel: 0, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'Instantânea', dano: '1d6 perfurante', salva: 'Ataque corpo a corpo', descricao: 'Chicote de espinhos: em acerto, 1d6 perfurante e puxa o alvo (Grande ou menor) 3m. Escala: 2d6 (nv5), 3d6 (nv11), 4d6 (nv17).' },
  'Luzes Dançantes': { nivel: 0, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Cria até 4 luzes (tochas/globo) que você move com ação bônus.' },
  // ----- LOTE EXTRA: 1º -----
  'Onda Trovejante (Thunderwave)': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: 'Cubo 4,5m', duracao: 'Instantânea', dano: '2d8 trovão', salva: 'Constituição', descricao: 'Onda de trovão num cubo de 4,5m. DT Constituição ou 2d8 trovão e empurrado 3m (metade e fica, se passar). +1d8 por nível acima do 1º.' },
  'Flecha Guiada (Guiding Bolt)': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: '1 rodada', dano: '4d6 radiante', salva: 'Ataque à distância', descricao: 'Em acerto, 4d6 radiante e o próximo ataque contra o alvo tem vantagem. +1d6 por nível acima do 1º.' },
  'Causar Ferimentos (Inflict Wounds)': { nivel: 1, escola: 'Necromancia', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '3d10 necrótico', salva: 'Ataque corpo a corpo', descricao: 'Toque maligno: em acerto, 3d10 necrótico. +1d10 por nível acima do 1º.' },
  'Orbe Cromático (Chromatic Orb)': { nivel: 1, escola: 'Evocação', tempo: '1 ação', alcance: '27m', duracao: 'Instantânea', dano: '3d8 (à escolha)', salva: 'Ataque à distância', descricao: 'Orbe de um tipo de dano à escolha (ácido, frio, fogo, elétrico, veneno ou trovão): em acerto, 3d8. +1d8 por nível acima do 1º.' },
  'Riso Histérico (Tasha\'s Hideous Laughter)': { nivel: 1, escola: 'Encantamento', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou o alvo cai prostrado, incapacitado de tanto rir (repete o teste a cada turno e ao sofrer dano).' },
  'Borrão de Cores (Color Spray)': { nivel: 1, escola: 'Ilusão', tempo: '1 ação', alcance: 'Cone 4,5m', duracao: '1 rodada', dano: '6d10 PV cega', salva: 'Sem salva (PV)', descricao: 'Role 6d10: esse total de PV de criaturas no cone (das mais fracas p/ fortes) ficam cegas até seu próximo turno. +2d10 por nível acima do 1º.' },
  'Graxa (Grease)': { nivel: 1, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: '1 min', dano: '—', salva: 'Destreza', descricao: 'Cobre um quadrado de 3m com graxa (terreno difícil). Quem está/entra: DT Destreza ou cai prostrado.' },
  'Queda Suave (Feather Fall)': { nivel: 1, escola: 'Transmutação', tempo: '1 reação', alcance: '18m', duracao: '1 min', dano: '—', salva: '—', descricao: 'Reação quando até 5 criaturas caem: a queda fica lenta (sem dano de queda).' },
  // ----- LOTE EXTRA: 2º -----
  'Escuridão (Darkness)': { nivel: 2, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Escuridão mágica numa esfera de 4,5m que nem visão no escuro penetra.' },
  'Esfera Flamejante (Flaming Sphere)': { nivel: 2, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '2d6 fogo', salva: 'Destreza', descricao: 'Esfera de fogo que você move 9m por turno (ação bônus). Quem encosta: DT Destreza ou 2d6 fogo. +1d6 por nível acima do 2º.' },
  'Sugestão (Suggestion)': { nivel: 2, escola: 'Encantamento', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 8 horas', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou o alvo segue um curso de ação razoável que você sugerir.' },
  'Silêncio (Silence)': { nivel: 2, escola: 'Ilusão', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Esfera de 6m sem som: ninguém ouve nem conjura magias com componente verbal lá dentro.' },
  'Raio Lunar (Moonbeam)': { nivel: 2, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '2d10 radiante', salva: 'Constituição', descricao: 'Feixe de luar (cilindro de 1,5m) que você reposiciona por turno. Quem entra/começa o turno: DT Constituição ou 2d10 radiante. +1d10 por nível acima do 2º.' },
  'Aquecer Metal (Heat Metal)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '2d8 fogo', salva: '—', descricao: 'Esquenta um objeto de metal: 2d8 fogo a quem o segura (ação bônus p/ repetir; desvantagem se não largar). +1d8 por nível acima do 2º.' },
  'Estilhaçar (Shatter)': { nivel: 2, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '3d8 trovão', salva: 'Constituição', descricao: 'Estrondo numa esfera de 3m. DT Constituição ou 3d8 trovão (metade se passar). +1d8 por nível acima do 2º.' },
  'Passos sem Pegadas (Pass without Trace)': { nivel: 2, escola: 'Abjuração', tempo: '1 ação', alcance: 'Pessoal (9m)', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Você e aliados próximos recebem +10 em Furtividade e não deixam rastros.' },
  // ----- LOTE EXTRA: 3º -----
  'Padrão Hipnótico (Hypnotic Pattern)': { nivel: 3, escola: 'Ilusão', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Padrão de cores num cubo de 9m. DT Sabedoria ou as criaturas ficam enfeitiçadas e incapacitadas (acaba se sofrerem dano).' },
  'Guardiões Espirituais (Spirit Guardians)': { nivel: 3, escola: 'Conjuração', tempo: '1 ação', alcance: 'Pessoal (4,5m)', duracao: 'Concentração 10 min', dano: '3d8 radiante/necrótico', salva: 'Sabedoria', descricao: 'Espíritos protetores a 4,5m (terreno difícil p/ inimigos). Quem entra/começa o turno: DT Sabedoria ou 3d8 (metade se passar). +1d8 por nível acima do 3º.' },
  'Lentidão (Slow)': { nivel: 3, escola: 'Transmutação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Até 6 criaturas: DT Sabedoria ou metade do deslocamento, −2 CA e Destreza, e só 1 ação por turno.' },
  'Nuvem Fétida (Stinking Cloud)': { nivel: 3, escola: 'Conjuração', tempo: '1 ação', alcance: '27m', duracao: 'Concentração 1 min', dano: '—', salva: 'Constituição', descricao: 'Gás nauseante numa esfera de 6m. DT Constituição ou perde a ação naquele turno, engasgando. +nada (escala em raio só com magias maiores).' },
  'Animar Mortos (Animate Dead)': { nivel: 3, escola: 'Necromancia', tempo: '1 min', alcance: '3m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Cria 1 esqueleto/zumbi sob seu comando (renova/expande o controle a cada conjuração). +1 morto-vivo por nível acima do 3º.' },
  'Chamar Relâmpagos (Call Lightning)': { nivel: 3, escola: 'Conjuração', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '3d10 elétrico', salva: 'Destreza', descricao: 'Nuvem de tempestade: cada turno (ação) chama um raio — DT Destreza ou 3d10 elétrico (metade se passar). +1d10 por nível acima do 3º.' },
  'Conjurar Animais (Conjure Animals)': { nivel: 3, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Invoca feras feéricas para lutar ao seu lado (ex.: 8 ND 1/4, 4 ND 1/2, 2 ND 1 ou 1 ND 2).' },
  'Toque Vampírico (Vampiric Touch)': { nivel: 3, escola: 'Necromancia', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 min', dano: '3d6 necrótico', salva: 'Ataque corpo a corpo', descricao: 'Em acerto, 3d6 necrótico e você cura metade disso. Pode repetir o ataque a cada turno. +1d6 por nível acima do 3º.' },

  // ----- LOTE 3: utilidade e controle -----
  'Respingo Ácido (Acid Splash)': { nivel: 0, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '1d6 ácido', salva: 'Destreza', descricao: 'Bolha de ácido em até 2 criaturas próximas. DT Destreza ou 1d6 ácido. Escala: 2d6 (nv5), 3d6 (nv11), 4d6 (nv17).' },
  'Identificar (Identify)': { nivel: 1, escola: 'Adivinhação', tempo: '1 min (ritual)', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Descobre as propriedades mágicas de um item (magias, sintonização, encantos).' },
  'Disfarçar-se (Disguise Self)': { nivel: 1, escola: 'Ilusão', tempo: '1 ação', alcance: 'Pessoal', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Muda sua aparência (roupas, rosto, altura aparente). Quem inspecionar faz teste contra sua CD.' },
  'Detectar Pensamentos (Detect Thoughts)': { nivel: 2, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Lê os pensamentos superficiais de criaturas a 9m; pode sondar mais fundo (DT Sabedoria).' },
  'Levitação (Levitate)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 10 min', dano: '—', salva: 'Constituição', descricao: 'Faz uma criatura/objeto flutuar até 6m no ar (você o move verticalmente).' },
  'Pés de Aranha (Spider Climb)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'O alvo anda por paredes e tetos com as mãos livres, com deslocamento de escalada igual ao normal.' },
  'Ver o Invisível (See Invisibility)': { nivel: 2, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Você enxerga criaturas e objetos invisíveis e o Plano Etéreo.' },
  'Destrancar (Knock)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Abre uma fechadura, tranca ou barra mágica (com um estrondo audível a 90m).' },
  'Ampliar/Reduzir (Enlarge/Reduce)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '—', salva: 'Constituição', descricao: 'Dobra ou reduz pela metade o tamanho do alvo, alterando dano e testes de Força (+1d4 ou −1d4 no dano).' },
  'Clarividência (Clairvoyance)': { nivel: 3, escola: 'Adivinhação', tempo: '10 min', alcance: '1,5 km', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Cria um sensor invisível em local conhecido para ver OU ouvir à distância.' },
  'Enviar Mensagem (Sending)': { nivel: 3, escola: 'Evocação', tempo: '1 ação', alcance: 'Ilimitado', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Manda uma mensagem de até 25 palavras a uma criatura conhecida, em qualquer lugar, e recebe a resposta.' },
  'Idiomas (Tongues)': { nivel: 3, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: '—', descricao: 'O alvo entende qualquer idioma falado e é entendido por quem o ouve.' },
  'Imagem Maior (Major Image)': { nivel: 3, escola: 'Ilusão', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '—', salva: 'Investigação', descricao: 'Cria uma ilusão com som, cheiro e temperatura (cubo de 6m), controlável.' },
  'Remover Maldição (Remove Curse)': { nivel: 3, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Encerra maldições em uma criatura ou objeto (quebra a sintonização de itens amaldiçoados).' },
  'Conceder Maldição (Bestow Curse)': { nivel: 3, escola: 'Necromancia', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 min', dano: '1d8 necrótico', salva: 'Sabedoria', descricao: 'DT Sabedoria ou o alvo recebe uma maldição à escolha (desvantagem, perde ação às vezes, +1d8 necrótico que você causa, etc.).' },
  'Confusão (Confusion)': { nivel: 4, escola: 'Encantamento', tempo: '1 ação', alcance: '27m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Esfera de 3m: criaturas falham DT Sabedoria e agem de forma aleatória (vagar, atacar quem estiver perto, nada). +1,5m de raio por nível acima do 4º.' },
  'Pele de Pedra (Stoneskin)': { nivel: 4, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'O alvo ganha resistência a dano de concussão, perfurante e cortante de ataques não mágicos.' },
  'Tentáculos Negros (Black Tentacles)': { nivel: 4, escola: 'Conjuração', tempo: '1 ação', alcance: '27m', duracao: 'Concentração 1 min', dano: '3d6 concussão', salva: 'Destreza', descricao: 'Tentáculos num quadrado de 6m (terreno difícil). DT Destreza ou 3d6 e agarrado; agarrados sofrem 3d6/turno.' },
  'Proteção contra a Morte (Death Ward)': { nivel: 4, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: '8 horas', dano: '—', salva: '—', descricao: 'A primeira vez que o alvo cairia a 0 PV, fica com 1 PV; ou anula um efeito de morte instantânea.' },
  'Escudo de Fogo (Fire Shield)': { nivel: 4, escola: 'Evocação', tempo: '1 ação', alcance: 'Pessoal', duracao: '10 min', dano: '2d8 fogo/frio', salva: '—', descricao: 'Chamas ao seu redor: resistência a frio OU fogo, e quem o atinge corpo a corpo sofre 2d8.' },
  'Imobilizar Monstro (Hold Monster)': { nivel: 5, escola: 'Encantamento', tempo: '1 ação', alcance: '27m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'Qualquer criatura (não só humanoide): DT Sabedoria ou paralisada (repete no fim do turno). +1 alvo por nível acima do 5º.' },
  'Cura em Massa Menor (Mass Cure Wounds)': { nivel: 5, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: 'Cura 3d8+mod', salva: '—', descricao: 'Cura até 6 criaturas em 3d8 + mod. de conjuração cada. +1d8 por nível acima do 5º.' },
  'Muralha de Força (Wall of Force)': { nivel: 5, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Parede invisível e indestrutível (não-mágico não passa). Pode virar cúpula ou esfera.' },
  'Golpe Flamejante (Flame Strike)': { nivel: 5, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '4d6 fogo + 4d6 radiante', salva: 'Destreza', descricao: 'Coluna de fogo divino (cilindro de 3m). DT Destreza ou 4d6 fogo + 4d6 radiante (metade se passar).' },
  'Animar Objetos (Animate Objects)': { nivel: 5, escola: 'Transmutação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Anima até 10 objetos para lutarem por você (quanto menores, mais objetos).' },
  'Banquete dos Heróis (Heroes\' Feast)': { nivel: 6, escola: 'Conjuração', tempo: '10 min', alcance: '9m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Banquete que cura 2d10 PV, aumenta o PV máximo em 2d10 e dá imunidade a veneno/medo por 24h.' },
  'Muralha de Gelo (Wall of Ice)': { nivel: 6, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 10 min', dano: '10d6 frio', salva: 'Destreza', descricao: 'Parede de gelo; atravessá-la causa frio. DT Destreza ao romper. +2d6 por nível acima do 6º.' },
  'Prismática (Prismatic Spray)': { nivel: 7, escola: 'Evocação', tempo: '1 ação', alcance: 'Cone 18m', duracao: 'Instantânea', dano: 'até 10d6 variado', salva: 'Destreza', descricao: 'Oito raios coloridos aleatórios (fogo, ácido, veneno, etc., e um que petrifica). Cada alvo sofre 2 cores ao acaso.' },
  'Reversão da Gravidade (Reverse Gravity)': { nivel: 7, escola: 'Transmutação', tempo: '1 ação', alcance: '30m', duracao: 'Concentração 1 min', dano: '—', salva: 'Destreza', descricao: 'Inverte a gravidade num cilindro de 15m: tudo cai para cima (dano de queda).' },

  // =====================================================
  // LOTE MAGO COMPLETO (PHB) — magias de Mago que faltavam
  // =====================================================
  // ----- Truque -----
  'Golpe Certeiro (True Strike)': { nivel: 0, escola: 'Adivinhação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 rodada', dano: '—', salva: '—', descricao: 'Aponta para um alvo: seu próximo ataque contra ele, no seu próximo turno, é feito com vantagem.' },
  // ----- 1º CÍRCULO -----
  'Alarme (Alarm)': { nivel: 1, escola: 'Abjuração', tempo: '1 min (ritual)', alcance: '9m', duracao: '8 horas', dano: '—', salva: '—', descricao: 'Define um alarme mental ou sonoro numa área de até 6m; avisa você quando uma criatura toca ou entra na área.' },
  'Recuo Expedito (Expeditious Retreat)': { nivel: 1, escola: 'Transmutação', tempo: '1 ação bônus', alcance: 'Pessoal', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Você pode usar a ação de Disparar (Correr) como ação bônus em cada um de seus turnos.' },
  'Vida Falsa (False Life)': { nivel: 1, escola: 'Necromancia', tempo: '1 ação', alcance: 'Pessoal', duracao: '1 hora', dano: '1d4+4 PV temp', salva: '—', descricao: 'Ganha 1d4+4 pontos de vida temporários. +5 PV temporários por nível de espaço acima do 1º.' },
  'Encontrar Familiar (Find Familiar)': { nivel: 1, escola: 'Conjuração', tempo: '1 hora (ritual)', alcance: '3m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Invoca um espírito em forma de animal pequeno como familiar. Você pode ver/ouvir pelos sentidos dele e conjurar magias de toque através dele.' },
  'Escrita Ilusória (Illusory Script)': { nivel: 1, escola: 'Ilusão', tempo: '1 min (ritual)', alcance: 'Toque', duracao: '10 dias', dano: '—', salva: '—', descricao: 'Escreve um texto que só quem você designar consegue ler; os demais veem rabiscos ou outra mensagem.' },
  'Raio do Enjoo (Ray of Sickness)': { nivel: 1, escola: 'Necromancia', tempo: '1 ação', alcance: '18m', duracao: 'Instantânea', dano: '2d8 veneno', salva: 'Ataque à distância', descricao: 'Em acerto, 2d8 de veneno; DT Constituição ou o alvo fica envenenado até o fim do próximo turno. +1d8 por nível acima do 1º.' },
  'Imagem Silenciosa (Silent Image)': { nivel: 1, escola: 'Ilusão', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 10 min', dano: '—', salva: 'Investigação', descricao: 'Cria a imagem visual de um objeto/criatura (cubo de 4,5m) que você pode mover. Sem som, cheiro ou outros sentidos; Investigação revela a ilusão.' },
  'Disco Flutuante de Tenser (Tenser\'s Floating Disk)': { nivel: 1, escola: 'Conjuração', tempo: '1 ação (ritual)', alcance: '9m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Cria um disco flutuante de força que carrega até 250 kg e segue você, mantendo-se a 1m do chão.' },
  'Servo Invisível (Unseen Servant)': { nivel: 1, escola: 'Conjuração', tempo: '1 ação (ritual)', alcance: '18m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Cria uma força invisível e obediente que executa tarefas simples: carregar, limpar, buscar, servir.' },
  // ----- 2º CÍRCULO -----
  'Alterar-se (Alter Self)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Transforma seu corpo: adaptação aquática (brânquias/nado), mudar a aparência ou criar armas naturais (1d6 mágico).' },
  'Fechadura Arcana (Arcane Lock)': { nivel: 2, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Até ser dissipada', dano: '—', salva: '—', descricao: 'Tranca magicamente uma porta, baú ou portal: +10 na DT para arrombar e impossível de abrir sem a senha que você definir.' },
  'Cegueira/Surdez (Blindness/Deafness)': { nivel: 2, escola: 'Necromancia', tempo: '1 ação', alcance: '9m', duracao: '1 min', dano: '—', salva: 'Constituição', descricao: 'DT Constituição ou o alvo fica cego ou surdo (à sua escolha) por 1 min (repete a salva no fim de cada turno). +1 alvo por nível acima do 2º.' },
  'Chama Contínua (Continual Flame)': { nivel: 2, escola: 'Evocação', tempo: '1 ação', alcance: 'Toque', duracao: 'Até ser dissipada', dano: '—', salva: '—', descricao: 'Cria uma chama permanente e sem calor presa a um objeto, que ilumina como uma tocha (componente: 50 po em rubi).' },
  'Visão no Escuro (Darkvision)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: '8 horas', dano: '—', salva: '—', descricao: 'O alvo passa a enxergar no escuro a até 18m.' },
  'Repouso Tranquilo (Gentle Repose)': { nivel: 2, escola: 'Necromancia', tempo: '1 ação (ritual)', alcance: 'Toque', duracao: '10 dias', dano: '—', salva: '—', descricao: 'Protege um cadáver da decomposição e de virar morto-vivo, e estende o prazo para ressurreição.' },
  'Rajada de Vento (Gust of Wind)': { nivel: 2, escola: 'Evocação', tempo: '1 ação', alcance: 'Pessoal (linha 18m)', duracao: 'Concentração 1 min', dano: '—', salva: 'Força', descricao: 'Vento forte numa linha de 18m: DT Força ou empurrado 4,5m; apaga chamas e dispersa gases. Move objetos leves.' },
  'Localizar Objeto (Locate Object)': { nivel: 2, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Sente a direção de um objeto conhecido ou de um tipo de objeto a até 300m (some atrás de chumbo).' },
  'Boca Mágica (Magic Mouth)': { nivel: 2, escola: 'Ilusão', tempo: '1 min (ritual)', alcance: '9m', duracao: 'Até ser dissipada', dano: '—', salva: '—', descricao: 'Implanta numa objeto uma mensagem de até 25 palavras, falada quando uma condição definida ocorre.' },
  'Arma Mágica (Magic Weapon)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação bônus', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Uma arma comum vira mágica com +1 em ataque e dano. +2 (espaço de 4º) e +3 (espaço de 6º).' },
  'Aura Mágica de Nystul (Nystul\'s Magic Aura)': { nivel: 2, escola: 'Ilusão', tempo: '1 ação', alcance: 'Toque', duracao: '24 horas', dano: '—', salva: '—', descricao: 'Mascara a aura mágica de uma criatura/objeto ou cria uma aura falsa, enganando Detectar Magia e efeitos similares.' },
  'Força Fantasmagórica (Phantasmal Force)': { nivel: 2, escola: 'Ilusão', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '1d6 psíquico', salva: 'Inteligência', descricao: 'DT Inteligência ou cria uma ilusão na mente do alvo que ele trata como real, sofrendo 1d6 psíquico por rodada por ela.' },
  'Raio do Enfraquecimento (Ray of Enfeeblement)': { nivel: 2, escola: 'Necromancia', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: 'Ataque à distância', descricao: 'Em acerto, o alvo causa apenas metade do dano com ataques baseados em Força (repete salva de Constituição no fim do turno).' },
  'Truque da Corda (Rope Trick)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Uma corda sobe no ar até uma entrada para um espaço extradimensional onde cabem até 8 criaturas Médias.' },
  // ----- 3º CÍRCULO -----
  'Lampejar (Blink)': { nivel: 3, escola: 'Transmutação', tempo: '1 ação', alcance: 'Pessoal', duracao: '1 min', dano: '—', salva: '—', descricao: 'No fim de cada turno, 50% de chance de desaparecer para o Plano Etéreo (oculto e intangível) e voltar no início do próximo turno.' },
  'Forma Gasosa (Gaseous Form)': { nivel: 3, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'O alvo vira uma névoa: voa devagar (3m), passa por pequenas frestas e tem resistência a dano não-mágico, mas não pode atacar nem conjurar.' },
  'Glifo de Vigilância (Glyph of Warding)': { nivel: 3, escola: 'Abjuração', tempo: '1 hora', alcance: 'Toque', duracao: 'Até disparar', dano: '5d8', salva: 'varia', descricao: 'Inscreve um glifo que dispara ao ser acionado: explosão de 5d8 de um tipo à escolha (DT à escolha) ou uma magia armazenada. +1d8 por nível acima do 3º.' },
  'Círculo Mágico (Magic Circle)': { nivel: 3, escola: 'Abjuração', tempo: '1 min', alcance: '3m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Cria um cilindro de 3m que barra/aprisiona um tipo de criatura (corruptores, mortos-vivos, fadas, elementais ou celestiais).' },
  'Indetectabilidade (Nondetection)': { nivel: 3, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: '8 horas', dano: '—', salva: '—', descricao: 'Esconde o alvo (criatura, objeto ou área de até 3m) de magias de adivinhação e de sensores mágicos.' },
  'Corcel Fantasma (Phantom Steed)': { nivel: 3, escola: 'Ilusão', tempo: '1 min (ritual)', alcance: '9m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Invoca uma montaria espectral (deslocamento 30m) ideal para percorrer longas distâncias (some se sofrer dano).' },
  'Tempestade de Granizo (Sleet Storm)': { nivel: 3, escola: 'Conjuração', tempo: '1 ação', alcance: '45m', duracao: 'Concentração 1 min', dano: '—', salva: 'Destreza', descricao: 'Gelo e granizo num cilindro de 12m: terreno difícil e escorregadio (DT Destreza ou cai prostrado), área obscurecida e quebra de concentração de quem está dentro.' },
  'Respirar na Água (Water Breathing)': { nivel: 3, escola: 'Transmutação', tempo: '1 ação (ritual)', alcance: '9m', duracao: '24 horas', dano: '—', salva: '—', descricao: 'Até 10 criaturas dispostas passam a respirar debaixo d\'água (mantêm a respiração de ar normalmente).' },
  // ----- 4º CÍRCULO -----
  'Olho Arcano (Arcane Eye)': { nivel: 4, escola: 'Adivinhação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Cria um olho invisível flutuante (visão no escuro 9m) que você move 9m/ação para explorar à distância (passa por buracos pequenos).' },
  'Definhar (Blight)': { nivel: 4, escola: 'Necromancia', tempo: '1 ação', alcance: '9m', duracao: 'Instantânea', dano: '8d8 necrótico', salva: 'Constituição', descricao: 'Drena a vitalidade: DT Constituição ou 8d8 necrótico (metade se passar). Plantas falham automaticamente e sofrem o máximo. +1d8 por nível acima do 4º.' },
  'Conjurar Elementais Menores (Conjure Minor Elementals)': { nivel: 4, escola: 'Conjuração', tempo: '1 min', alcance: '27m', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Invoca elementais menores para combater por você (ex.: 8 ND 1/4, 4 ND 1/2, 2 ND 1 ou 1 ND 2).' },
  'Controlar Água (Control Water)': { nivel: 4, escola: 'Transmutação', tempo: '1 ação', alcance: '90m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Manipula um grande volume de água: marés, redemoinhos, separar as águas ou inundar/desviar correntes.' },
  'Fabricar (Fabricate)': { nivel: 4, escola: 'Transmutação', tempo: '10 min', alcance: '36m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Converte matéria-prima em um produto acabado (madeira numa ponte, tecido em roupas), na quantidade que sua perícia permitir.' },
  'Terreno Alucinatório (Hallucinatory Terrain)': { nivel: 4, escola: 'Ilusão', tempo: '10 min', alcance: '90m', duracao: '24 horas', dano: '—', salva: '—', descricao: 'Disfarça uma grande área natural (até cubos de 45m) como outro tipo de terreno: campo vira pântano, estrada some no mato, etc.' },
  'Localizar Criatura (Locate Creature)': { nivel: 4, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Sente a direção de uma criatura conhecida (ou de um tipo) a até 300m, se ela estiver no mesmo plano.' },
  'Assassino Fantasmagórico (Phantasmal Killer)': { nivel: 4, escola: 'Ilusão', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '4d10 psíquico', salva: 'Sabedoria', descricao: 'Materializa o pior medo do alvo: DT Sabedoria ou fica amedrontado e sofre 4d10 psíquico por rodada (repete a salva). +1d10 por nível acima do 4º.' },
  'Moldar Pedra (Stone Shape)': { nivel: 4, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Molda um objeto de pedra de até 1,5m na forma que quiser: abrir uma passagem, fechar uma porta, criar uma arma rústica.' },
  // ----- 5º CÍRCULO -----
  'Mão de Bigby (Bigby\'s Hand)': { nivel: 5, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '4d8 força', salva: 'varia', descricao: 'Cria uma mão de força gigante que soca (4d8), empurra, agarra (DT Força) ou bloqueia. Move-se e age por ação bônus. +2d8 por nível acima do 5º.' },
  'Conjurar Elemental (Conjure Elemental)': { nivel: 5, escola: 'Conjuração', tempo: '1 min', alcance: '27m', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Invoca um elemental de ar, terra, fogo ou água de ND até 5 para servir você (pode ficar hostil se perder a concentração).' },
  'Contatar Outro Plano (Contact Other Plane)': { nivel: 5, escola: 'Adivinhação', tempo: '1 min (ritual)', alcance: 'Pessoal', duracao: '1 min', dano: '6d6 psíquico', salva: 'Inteligência', descricao: 'Contata uma entidade extraplanar para até 5 perguntas curtas. DT Inteligência ou 6d6 psíquico e fica enlouquecido por um tempo.' },
  'Criação (Creation)': { nivel: 5, escola: 'Ilusão', tempo: '1 min', alcance: '9m', duracao: 'Especial', dano: '—', salva: '—', descricao: 'Cria um objeto de matéria vegetal ou mineral não-viva (cubo de até 1,5m); a duração varia conforme a densidade do material.' },
  'Sonho (Dream)': { nivel: 5, escola: 'Ilusão', tempo: '1 min', alcance: 'Especial', duracao: '8 horas', dano: '3d6 psíquico', salva: 'Sabedoria', descricao: 'Você (ou um mensageiro) entra no sono de um alvo conhecido: entrega uma mensagem ou cria um pesadelo (DT Sabedoria ou 3d6 psíquico e sem benefício do descanso).' },
  'Geas (Geas)': { nivel: 5, escola: 'Encantamento', tempo: '1 min', alcance: '18m', duracao: '30 dias', dano: '5d10 psíquico', salva: 'Sabedoria', descricao: 'DT Sabedoria ou o alvo é compelido a cumprir uma ordem sua; desobedecer causa 5d10 psíquico por dia (máx. 5d10).' },
  'Lendas (Legend Lore)': { nivel: 5, escola: 'Adivinhação', tempo: '10 min', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Revela o conhecimento lendário existente sobre uma pessoa, lugar ou objeto notável.' },
  'Despistar (Mislead)': { nivel: 5, escola: 'Ilusão', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Você fica invisível e cria um duplicado ilusório controlável; pode ver e ouvir pelos sentidos dele.' },
  'Modificar Memória (Modify Memory)': { nivel: 5, escola: 'Encantamento', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou você reformula/apaga uma memória recente do alvo (até 24 horas atrás).' },
  'Passar pela Parede (Passwall)': { nivel: 5, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Abre uma passagem através de madeira, gesso ou pedra (até 1,5m de largura por 6m de profundidade).' },
  'Aprisionamento Planar (Planar Binding)': { nivel: 5, escola: 'Abjuração', tempo: '1 hora', alcance: '18m', duracao: '24 horas', dano: '—', salva: 'Carisma', descricao: 'DT Carisma ou liga um celestial, elemental, corruptor ou fada ao seu serviço (componente: oferenda de 1.000 po).' },
  'Bisbilhotar (Scrying)': { nivel: 5, escola: 'Adivinhação', tempo: '10 min', alcance: 'Pessoal', duracao: 'Concentração 10 min', dano: '—', salva: 'Sabedoria', descricao: 'Cria um sensor invisível que vê e ouve uma criatura conhecida à distância (DT Sabedoria, mais difícil quanto menos você a conhece).' },
  'Aparência (Seeming)': { nivel: 5, escola: 'Ilusão', tempo: '1 ação', alcance: '9m', duracao: '8 horas', dano: '—', salva: 'Carisma', descricao: 'Muda a aparência (corpo e roupas) de quantas criaturas quiser; quem suspeitar faz teste de Investigação contra sua CD.' },
  'Círculo de Teleporte (Teleportation Circle)': { nivel: 5, escola: 'Conjuração', tempo: '1 min', alcance: '3m', duracao: '1 rodada', dano: '—', salva: '—', descricao: 'Desenha um portal ligado a um círculo de teleporte permanente que você conheça, por onde criaturas podem passar.' },
  // ----- 6º CÍRCULO -----
  'Portão Arcano (Arcane Gate)': { nivel: 6, escola: 'Conjuração', tempo: '1 ação', alcance: '150m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Cria dois portais circulares ligados (a até 150m um do outro) por onde criaturas passam de um ao outro.' },
  'Contingência (Contingency)': { nivel: 6, escola: 'Evocação', tempo: '10 min', alcance: 'Pessoal', duracao: '10 dias', dano: '—', salva: '—', descricao: 'Armazena uma magia de até 5º círculo (que afete só você) e define uma condição; ela é conjurada automaticamente quando a condição ocorre.' },
  'Criar Mortos-Vivos (Create Undead)': { nivel: 6, escola: 'Necromancia', tempo: '1 min', alcance: '3m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Cria até 3 carniçais (ghouls) sob seu controle por 24h (renove para mantê-los). Mais e mais fortes em círculos maiores.' },
  'Mau-Olhado (Eyebite)': { nivel: 6, escola: 'Necromancia', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '—', salva: 'Sabedoria', descricao: 'A cada turno, mira uma criatura a 18m: DT Sabedoria ou fica adormecida, amedrontada ou enjoada (à sua escolha).' },
  'Carne para Pedra (Flesh to Stone)': { nivel: 6, escola: 'Transmutação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: 'Constituição', descricao: 'DT Constituição ou o alvo começa a petrificar (restringido); falhando a salva 3 vezes, fica petrificado.' },
  'Receptáculo de Almas (Magic Jar)': { nivel: 6, escola: 'Necromancia', tempo: '1 min', alcance: 'Pessoal', duracao: 'Até terminar', dano: '—', salva: 'Carisma', descricao: 'Sua alma migra para um recipiente e pode possuir corpos próximos (DT Carisma), assumindo o controle deles.' },
  'Sugestão em Massa (Mass Suggestion)': { nivel: 6, escola: 'Encantamento', tempo: '1 ação', alcance: '18m', duracao: '24 horas', dano: '—', salva: 'Sabedoria', descricao: 'Como Sugestão, mas afeta até 12 criaturas (DT Sabedoria ou seguem um curso de ação razoável que você sugerir).' },
  'Mover Terra (Move Earth)': { nivel: 6, escola: 'Transmutação', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 2 horas', dano: '—', salva: '—', descricao: 'Remodela grandes áreas de terra, areia ou argila: cavar trincheiras, levantar colinas, abrir caminhos.' },
  'Esfera Congelante de Otiluke (Otiluke\'s Freezing Sphere)': { nivel: 6, escola: 'Evocação', tempo: '1 ação', alcance: '90m', duracao: 'Instantânea', dano: '10d6 frio', salva: 'Constituição', descricao: 'Explosão gélida numa esfera de 18m: DT Constituição ou 10d6 frio (metade se passar); congela superfícies de água. +1d6 por nível acima do 6º.' },
  'Ilusão Programada (Programmed Illusion)': { nivel: 6, escola: 'Ilusão', tempo: '1 ação', alcance: '36m', duracao: 'Até ser dissipada', dano: '—', salva: '—', descricao: 'Cria uma ilusão (com som) de até cubo de 9m que se ativa quando uma condição definida acontece.' },
  'Raio Solar (Sunbeam)': { nivel: 6, escola: 'Evocação', tempo: '1 ação', alcance: 'Pessoal (linha 18m)', duracao: 'Concentração 1 min', dano: '6d8 radiante', salva: 'Constituição', descricao: 'Feixe de luz solar numa linha (repetível por turno): DT Constituição ou 6d8 radiante e cegueira por 1 turno; mortos-vivos e limos têm desvantagem.' },
  'Visão da Verdade (True Seeing)': { nivel: 6, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: '—', descricao: 'O alvo enxerga a verdade num raio de 36m: vê no escuro, ignora ilusões, vê o invisível e o Plano Etéreo, e percebe disfarces mágicos.' },
  // ----- 7º CÍRCULO -----
  'Bola de Fogo Retardada (Delayed Blast Fireball)': { nivel: 7, escola: 'Evocação', tempo: '1 ação', alcance: '45m', duracao: 'Concentração 1 min', dano: '12d6 fogo', salva: 'Destreza', descricao: 'Uma semente de fogo acumula +1d6 a cada turno até detonar numa esfera de 6m: DT Destreza ou 12d6+ fogo (metade se passar). +1d6 inicial por nível acima do 7º.' },
  'Forma Etérea (Etherealness)': { nivel: 7, escola: 'Transmutação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Até 8 horas', dano: '—', salva: '—', descricao: 'Você entra no Plano Etéreo, atravessando objetos e criaturas do plano material. +3 criaturas com espaços maiores.' },
  'Jaula de Força (Forcecage)': { nivel: 7, escola: 'Evocação', tempo: '1 ação', alcance: '30m', duracao: '1 hora', dano: '—', salva: 'Carisma', descricao: 'Cria uma prisão de força inescapável (gaiola de 6m ou caixa sólida de 3m); só sai com teleporte vencendo DT Carisma.' },
  'Miragem Arcana (Mirage Arcane)': { nivel: 7, escola: 'Ilusão', tempo: '10 min', alcance: 'Visão', duracao: '10 dias', dano: '—', salva: '—', descricao: 'Transforma a aparência (e até o tato e o som) de uma área de terreno de até ~1,5 km² por até 10 dias.' },
  'Mansão Magnífica de Mordenkainen (Mordenkainen\'s Magnificent Mansion)': { nivel: 7, escola: 'Conjuração', tempo: '1 min', alcance: '90m', duracao: '24 horas', dano: '—', salva: '—', descricao: 'Cria uma porta para uma morada extradimensional luxuosa, com servos invisíveis e um banquete, onde até 100 criaturas descansam em segurança.' },
  'Espada de Mordenkainen (Mordenkainen\'s Sword)': { nivel: 7, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '3d10 força', salva: 'Ataque mágico', descricao: 'Cria uma espada espectral de força que ataca (ataque com seu bônus de conjuração, 3d10 força) e se reposiciona por ação bônus.' },
  'Mudança de Plano (Plane Shift)': { nivel: 7, escola: 'Conjuração', tempo: '1 ação', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: 'Carisma', descricao: 'Transporta até 8 criaturas dispostas para outro plano, ou bane 1 inimigo (DT Carisma) usando uma vara sintonizada.' },
  'Projetar Imagem (Project Image)': { nivel: 7, escola: 'Ilusão', tempo: '1 ação', alcance: '800 km', duracao: 'Concentração 1 dia', dano: '—', salva: 'Investigação', descricao: 'Cria uma cópia ilusória sua num lugar conhecido; você vê, ouve e pode conjurar magias como se estivesse lá.' },
  'Sequestrar (Sequester)': { nivel: 7, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Até ser dissipada', dano: '—', salva: '—', descricao: 'Torna um objeto ou criatura disposta invisível e em estase, oculto de adivinhação; pode definir uma condição para despertar.' },
  'Simulacro (Simulacrum)': { nivel: 7, escola: 'Ilusão', tempo: '12 horas', alcance: 'Toque', duracao: 'Até ser destruído', dano: '—', salva: '—', descricao: 'Cria um duplicado de gelo e neve de uma criatura, com metade dos PV dela e obediente a você (não recupera espaços).' },
  'Símbolo (Symbol)': { nivel: 7, escola: 'Abjuração', tempo: '1 min', alcance: 'Toque', duracao: 'Até ser dissipada', dano: 'varia', salva: 'varia', descricao: 'Inscreve um glifo mortal que dispara um efeito devastador (morte, dor, loucura, sono, etc.) quando uma condição é acionada.' },
  // ----- 8º CÍRCULO -----
  'Campo Antimagia (Antimagic Field)': { nivel: 8, escola: 'Abjuração', tempo: '1 ação', alcance: 'Pessoal (3m)', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Uma esfera de 3m onde nenhuma magia funciona, nem pode ser conjurada, e itens mágicos ficam suprimidos.' },
  'Antipatia/Simpatia (Antipathy/Sympathy)': { nivel: 8, escola: 'Encantamento', tempo: '1 hora', alcance: '18m', duracao: '10 dias', dano: '—', salva: 'Sabedoria', descricao: 'Faz um objeto/área repelir (amedronta) ou atrair fortemente um tipo de criatura à escolha (DT Sabedoria para resistir).' },
  'Clone (Clone)': { nivel: 8, escola: 'Necromancia', tempo: '1 hora', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Cultiva um corpo de reserva idêntico ao alvo; quando ele morre, a alma migra para o clone maduro (componente: 1.000 po + recipiente).' },
  'Controlar o Clima (Control Weather)': { nivel: 8, escola: 'Transmutação', tempo: '10 min', alcance: 'Pessoal (8 km)', duracao: 'Concentração 8 horas', dano: '—', salva: '—', descricao: 'Altera gradualmente o clima da região num raio de 8 km: chuva, tempestade, neve, calor, vento ou céu limpo.' },
  'Semiplano (Demiplane)': { nivel: 8, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Cria uma porta sombria para um cômodo extradimensional vazio (cubo de 9m) que pode guardar criaturas ou itens.' },
  'Debilitar (Feeblemind)': { nivel: 8, escola: 'Encantamento', tempo: '1 ação', alcance: '45m', duracao: 'Instantânea', dano: '4d6 psíquico', salva: 'Inteligência', descricao: 'DT Inteligência ou 4d6 psíquico e a INT e o CAR do alvo caem para 1 (não conjura, lê nem fala) até ser curado.' },
  'Labirinto (Maze)': { nivel: 8, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Bane o alvo para um labirinto extraplanar; ele escapa gastando uma ação para passar num teste de Inteligência DT 20.' },
  'Mente em Branco (Mind Blank)': { nivel: 8, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: '24 horas', dano: '—', salva: '—', descricao: 'Imuniza o alvo contra dano psíquico, leitura de mente, adivinhação, encantamento e até o efeito de Desejo.' },
  'Telepatia (Telepathy)': { nivel: 8, escola: 'Evocação', tempo: '1 ação', alcance: 'Ilimitado', duracao: '24 horas', dano: '—', salva: '—', descricao: 'Cria uma ligação telepática com uma criatura conhecida em qualquer lugar do mesmo plano, trocando palavras e imagens.' },
  // ----- 9º CÍRCULO -----
  'Projeção Astral (Astral Projection)': { nivel: 9, escola: 'Necromancia', tempo: '1 hora', alcance: '3m', duracao: 'Especial', dano: '—', salva: '—', descricao: 'Projeta você e até 8 aliados ao Plano Astral, deixando os corpos físicos em estase para explorar outros planos.' },
  'Presciência (Foresight)': { nivel: 9, escola: 'Adivinhação', tempo: '1 min', alcance: 'Toque', duracao: '8 horas', dano: '—', salva: '—', descricao: 'O alvo ganha vantagem em ataques, testes e salvas, não pode ser surpreendido, e ataques contra ele têm desvantagem, por 8 horas.' },
  'Portal (Gate)': { nivel: 9, escola: 'Conjuração', tempo: '1 ação', alcance: '18m', duracao: 'Concentração 1 min', dano: '—', salva: '—', descricao: 'Abre um portal circular para outro plano e pode puxar uma criatura específica conhecida de lá para o seu lado.' },
  'Aprisionamento (Imprisonment)': { nivel: 9, escola: 'Abjuração', tempo: '1 min', alcance: '9m', duracao: 'Até ser dissipada', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou o alvo é preso indefinidamente (enterrado, em estase, encolhido numa gema, em prisão mental, etc.).' },
  'Muralha Prismática (Prismatic Wall)': { nivel: 9, escola: 'Abjuração', tempo: '1 ação', alcance: '18m', duracao: '10 min', dano: '10d6 por camada', salva: 'Destreza', descricao: 'Sete camadas coloridas, cada uma com seu próprio dano/efeito (fogo, ácido, veneno, petrificação, etc.); atravessar exige vencer todas em ordem.' },
  'Metamorfose (Shapechange)': { nivel: 9, escola: 'Transmutação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Transforma-se em qualquer criatura de ND até o seu nível, mantendo sua mente e podendo trocar de forma a cada turno.' },
  'Metamorfose Verdadeira (True Polymorph)': { nivel: 9, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 1 hora', dano: '—', salva: 'Sabedoria', descricao: 'DT Sabedoria ou transforma uma criatura em outra criatura/objeto (ou objeto em criatura); mantida por toda a duração, vira permanente.' },
  'Pavor (Weird)': { nivel: 9, escola: 'Ilusão', tempo: '1 ação', alcance: '36m', duracao: 'Concentração 1 min', dano: '4d10 psíquico', salva: 'Sabedoria', descricao: 'Como Assassino Fantasmagórico, mas afeta todas as criaturas numa esfera de 9m: DT Sabedoria ou amedrontadas e 4d10 psíquico por rodada.' },

  // ===== LOTE FASE 3 — magias do PHB que faltavam =====
  // 1º — golpes do Paladino e utilidade
  'Golpe Trovejante (Thunderous Smite)': { nivel: 1, escola: 'Evocação', tempo: '1 ação bônus', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '2d6 trovão', salva: 'Força', descricao: 'O próximo acerto com arma causa +2d6 de trovão; o alvo faz salva de Força ou cai Caído e é empurrado 3m.' },
  'Golpe Iracundo (Wrathful Smite)': { nivel: 1, escola: 'Evocação', tempo: '1 ação bônus', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '1d6 psíquico', salva: 'Sabedoria', descricao: 'O próximo acerto com arma causa +1d6 psíquico; o alvo faz salva de Sabedoria ou fica amedrontado de você.' },
  // 2º
  'Aprimorar Habilidade (Enhance Ability)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: 'Toque', duracao: 'Concentração 1 hora', dano: '—', salva: '—', descricao: 'Concede vantagem em testes de um atributo (e benefícios extras: PV temporários, não cair, capacidade de carga, etc.).' },
  'Proteção contra Veneno (Protection from Poison)': { nivel: 2, escola: 'Abjuração', tempo: '1 ação', alcance: 'Toque', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Neutraliza um veneno no alvo e dá vantagem em salvas contra veneno + resistência a dano de veneno.' },
  'Lâmina Flamejante (Flame Blade)': { nivel: 2, escola: 'Evocação', tempo: '1 ação bônus', alcance: 'Pessoal', duracao: 'Concentração 10 min', dano: '3d6 fogo', salva: 'Ataque corpo a corpo', descricao: 'Cria uma espada flamejante; ataque mágico corpo a corpo causando 3d6 de fogo e iluminando a área.' },
  'Crescimento de Espinhos (Spike Growth)': { nivel: 2, escola: 'Transmutação', tempo: '1 ação', alcance: '45m', duracao: 'Concentração 10 min', dano: '2d4 perfurante', salva: '—', descricao: 'Área de 6m vira terreno difícil de espinhos: 2d4 de dano a cada 1,5m percorridos.' },
  'Augúrio (Augury)': { nivel: 2, escola: 'Adivinhação', tempo: '1 min', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Pergunta sobre um plano para até 30 min adiante: recebe Bom, Ruim, Bom e Ruim, ou Nada.' },
  'Encontrar Corcel (Find Steed)': { nivel: 2, escola: 'Conjuração', tempo: '10 min', alcance: '9m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Invoca um corcel celestial/feérico leal e inteligente; vínculo telepático e proteção mágica compartilhada.' },
  // 3º
  'Crescimento Vegetal (Plant Growth)': { nivel: 3, escola: 'Transmutação', tempo: '1 ação ou 8h', alcance: '45m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Faz plantas crescerem: área de 30m vira terreno difícil (deslocamento a 1/4) ou enriquece colheitas por 1 ano.' },
  'Luz do Dia (Daylight)': { nivel: 3, escola: 'Evocação', tempo: '1 ação', alcance: '18m', duracao: '1 hora', dano: '—', salva: '—', descricao: 'Esfera de luz solar de 18m; dissipa escuridão mágica de 3º círculo ou menor na área.' },
  // 4º
  'Adivinhação (Divination)': { nivel: 4, escola: 'Adivinhação', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Pergunta sobre um objetivo/evento em até 7 dias e recebe um presságio verdadeiro (mas curto) do seu deus.' },
  'Crescimento Descomunal (Giant Insect)': { nivel: 4, escola: 'Transmutação', tempo: '1 ação', alcance: '9m', duracao: 'Concentração 10 min', dano: '—', salva: '—', descricao: 'Transforma até 10 insetos comuns em versões gigantes e venenosas que obedecem aos seus comandos.' },
  // 5º
  'Comunhão (Commune)': { nivel: 5, escola: 'Adivinhação', tempo: '1 min', alcance: 'Pessoal', duracao: '1 min', dano: '—', salva: '—', descricao: 'Faz até 3 perguntas de sim/não ao seu deus (ou servo dele).' },
  'Comunhão com a Natureza (Commune with Nature)': { nivel: 5, escola: 'Adivinhação', tempo: '1 min', alcance: 'Pessoal', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Sintoniza-se com a natureza num raio de 5 km (ou 90m subterrâneo) e descobre 3 fatos do terreno/criaturas/água/plantas.' },
  'Praga (Contagion)': { nivel: 5, escola: 'Necromancia', tempo: '1 ação', alcance: 'Toque', duracao: '7 dias', dano: '—', salva: 'Constituição', descricao: 'Ataque corpo a corpo que inflige uma doença (cegueira, definhamento, febre etc.) após 3 falhas em salvas de Constituição.' },
  'Reencarnar (Reincarnate)': { nivel: 5, escola: 'Transmutação', tempo: '1 hora', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Cria um novo corpo (raça determinada aleatoriamente) para a alma de uma criatura morta há até 10 dias.' },
  // 6º
  'Barreira de Lâminas (Blade Barrier)': { nivel: 6, escola: 'Evocação', tempo: '1 ação', alcance: '27m', duracao: 'Concentração 10 min', dano: '6d10 corte', salva: 'Destreza', descricao: 'Parede de lâminas giratórias (cobertura 3/4); atravessar/iniciar o turno nela: DT Destreza ou 6d10 de corte.' },
  'Encontrar o Caminho (Find the Path)': { nivel: 6, escola: 'Adivinhação', tempo: '1 min', alcance: 'Pessoal', duracao: 'Concentração 1 dia', dano: '—', salva: '—', descricao: 'Conhece a rota mais curta e direta até um local que você já visitou.' },
  // 7º
  'Ressurreição (Resurrection)': { nivel: 7, escola: 'Necromancia', tempo: '1 hora', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Revive uma criatura morta há até 100 anos (corpo intacto), com PV cheios e sem penalidades.' },
  'Palavra Divina (Divine Word)': { nivel: 7, escola: 'Evocação', tempo: '1 ação bônus', alcance: '9m', duracao: 'Instantânea', dano: '—', salva: 'Carisma', descricao: 'DT Carisma: conforme o PV, criaturas ficam surdas, cegas, atordoadas ou morrem; celestiais/elementais/corruptores/fadas são banidos.' },
  // 8º
  'Terremoto (Earthquake)': { nivel: 8, escola: 'Evocação', tempo: '1 ação', alcance: '150m', duracao: 'Concentração 1 min', dano: '—', salva: 'Destreza', descricao: 'Tremor numa área de 30m: derruba criaturas, abre fendas, desaba estruturas e rompe concentração.' },
  'Aura Sagrada (Holy Aura)': { nivel: 8, escola: 'Abjuração', tempo: '1 ação', alcance: 'Pessoal', duracao: 'Concentração 1 min', dano: '—', salva: 'Constituição', descricao: 'Aliados a 9m: vantagem em salvas, ataques contra eles com desvantagem, e cegam corruptores/mortos-vivos que os acertam corpo a corpo.' },
  // 9º
  'Ressurreição Verdadeira (True Resurrection)': { nivel: 9, escola: 'Necromancia', tempo: '1 hora', alcance: 'Toque', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Revive uma criatura morta há até 200 anos (mesmo sem corpo), curando tudo e removendo maldições/doenças/venenos.' },
  'Tempestade Vingadora (Storm of Vengeance)': { nivel: 9, escola: 'Conjuração', tempo: '1 ação', alcance: '1,5 km', duracao: 'Concentração 1 min', dano: 'até 10d6/2d6', salva: 'Constituição/Destreza', descricao: 'Tempestade colossal: a cada rodada um efeito novo — trovão ensurdecedor, ácido, relâmpagos, granizo, chuva e vendaval.' },
};

// =====================================================
// CARACTERÍSTICAS DE CLASSE - descrições (o que cada habilidade faz)
// Indexado por nome aproximado (busca tolerante por detalheCaracteristica)
// =====================================================
const CARACTERISTICAS_DETALHE = {
  'Estilo de Luta': 'Você adota uma especialização de combate (Arquearia, Defesa, Duelo, etc.) que concede um bônus passivo.',
  'Surto de Ação': 'Em seu turno, você pode realizar uma ação adicional. Recupera em descanso curto ou longo.',
  'Retomar o Fôlego': 'Como ação bônus, recupera 1d10 + nível de Guerreiro de PV. Recupera em descanso curto/longo.',
  'Ataque Extra': 'Você ataca duas (ou mais) vezes ao usar a ação de Ataque.',
  'Indomável': 'Pode rolar de novo uma salvaguarda que falhou (Guerreiro: 1 uso no N9, 2 no N13, 3 no N17, por descanso longo).',
  'Arquétipo Marcial': 'No N3 o Guerreiro escolhe um arquétipo (Campeão, Mestre de Batalha ou Cavaleiro Arcano) que molda sua evolução.',
  'Fúria': 'Como ação bônus: vantagem em testes/salvas de Força, +dano corpo a corpo e resistência a concussão/perfurante/cortante. Dura 1 min.',
  'Defesa sem Armadura': 'Sem armadura, sua CA usa um atributo extra (Bárbaro: +CON; Monge: +SAB).',
  'Ataque Imprudente': 'Ganha vantagem nos ataques corpo a corpo de Força no turno, mas ataques contra você também têm vantagem.',
  'Ataque Furtivo': 'Causa dano extra (escala com o nível) quando tem vantagem ou um aliado está perto do alvo, 1x por turno.',
  'Ação Ardilosa': 'Pode Disparar, Desengajar ou Esconder-se como ação bônus em cada turno.',
  'Esquiva Sobrenatural': 'Reação para reduzir à metade o dano de um ataque que você enxerga.',
  'Evasão': 'Em efeitos de área com salva de Destreza, sofre metade do dano (ou nenhum, se passar).',
  'Gíria de Ladrão': 'Código secreto de símbolos e jargão que só ladrões entendem, para passar mensagens ocultas.',
  'Especialização': 'Dobra o bônus de proficiência em mais 2 perícias (ou ferramentas de ladrão).',
  'Talento Confiável': 'Em testes de perícia em que tem proficiência, trate qualquer rolagem do d20 igual ou menor que 9 como 10.',
  'Sentido às Cegas': 'Enquanto puder ouvir, sabe a localização de criaturas ocultas ou invisíveis a até 3m.',
  'Mente Escorregadia': 'Ganha proficiência em salvaguardas de Sabedoria.',
  'Elusivo': 'Nenhuma jogada de ataque tem vantagem contra você, a menos que esteja incapacitado.',
  'Golpe de Sorte': 'Se errar um ataque, pode transformar em acerto; ou se falhar um teste de atributo, tratar o d20 como 20. 1×/descanso curto ou longo.',
  'Pontos de Ki': 'Energia mística para Rajada de Golpes, Defesa Paciente, Passo do Vento e outras técnicas. Recupera em descanso curto.',
  'Rajada de Golpes': 'Após a ação de Ataque, gaste 1 Ki para 2 ataques desarmados como ação bônus.',
  'Movimento sem Armadura': 'Seu deslocamento aumenta enquanto não usar armadura nem escudo.',
  'Inspiração Bárdica': 'Como ação bônus, dá a um aliado um dado de inspiração para somar a um ataque, teste ou salva.',
  'Canalizar Divindade': 'Efeito divino da sua divindade/domínio (ex.: Expulsar Mortos-Vivos). Recupera em descanso curto. Clérigo: 1 uso no N2, 2 no N6, 3 no N18.',
  'Domínio Divino': 'No N1 o Clérigo escolhe um domínio que concede magias sempre preparadas e poderes próprios em 1/2/6/8/17.',
  'Destruir Mortos-Vivos': 'Ao Expulsar Mortos-Vivos, criaturas com Nível de Desafio até o limite (½ no N5; 1/2/3/4 em 8/11/14/17) são destruídas no lugar de expulsas.',
  'Intervenção Divina': 'Ação: role d100; se tirar ≤ nível de Clérigo, sua divindade intervém. Recupera em 7 dias (ou 1 descanso longo se funcionar). No N20 (Aprimorada) funciona automaticamente.',
  'Imposição das Mãos': 'Reserva de cura igual a 5× seu nível de Paladino, distribuída ao toque; também cura doença/veneno.',
  'Sentido Divino': 'Detecta celestiais, corruptores e mortos-vivos próximos.',
  'Punição Divina': 'Ao acertar com arma corpo a corpo, gaste um espaço de magia para +2d8 (ou mais) de dano radiante.',
  'Forma Selvagem': 'Transforma-se em uma fera que você já viu, assumindo seus atributos físicos. Recupera em descanso curto.',
  'Conjuração': 'Você lança magias da sua classe usando espaços de magia e o atributo de conjuração.',
  'Recuperação Arcana': 'Em um descanso curto, recupera espaços de magia (Mago).',
  'Magias de 5º Círculo': 'Abre o 5º círculo de magia e concede 1 espaço dele (controle de campo e dano pesado).',
  'Magias de 6º Círculo': 'Abre o 6º círculo de magia e concede 1 espaço dele.',
  'Magias de 7º Círculo': 'Abre o 7º círculo de magia e concede 1 espaço dele.',
  'Magias de 8º Círculo': 'Abre o 8º círculo de magia e concede 1 espaço dele (Mago N15).',
  'Magias de 9º Círculo': 'Abre o 9º círculo — as magias mais poderosas do jogo — e concede 1 espaço dele (Mago N17).',
  'Domínio de Magia': 'Escolha 1 magia de 1º e 1 de 2º círculo do grimório: enquanto preparadas, conjura ambas no círculo mais baixo sem gastar espaço, à vontade (troca com 8h de estudo). Mago N18.',
  'Maestria de Magias': 'Escolha 1 magia de 1º e 1 de 2º círculo do grimório: enquanto preparadas, conjura ambas no círculo mais baixo sem gastar espaço, à vontade. Mago N18.',
  'Magias-Assinatura': 'Escolha 2 magias de 3º círculo: ficam sempre preparadas (não contam no limite) e você conjura cada uma 1× no 3º círculo sem gastar espaço, recuperando em descanso curto. Mago N20.',
  'Magia Atemporal': 'Duas magias de 3º círculo sempre preparadas que você conjura 1× sem gastar espaço (recupera em descanso curto). Mago N20.',
  'Sortudo (Halfling)': 'Ao rolar 1 natural num d20 de ataque, teste ou salva, rerrole o dado.',
};

// Busca tolerante de característica (ignora parênteses e sufixos)
function detalheCaracteristica(nome) {
  if (CARACTERISTICAS_DETALHE[nome]) return CARACTERISTICAS_DETALHE[nome];
  const base = nome.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  for (const k in CARACTERISTICAS_DETALHE) {
    const kb = k.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    if (base === kb || base.startsWith(kb) || kb.startsWith(base)) return CARACTERISTICAS_DETALHE[k];
  }
  return null;
}

// =====================================================
// CONDIÇÕES (PHB) - para o rastreador de combate
// =====================================================
const CONDICOES = {
  'Agarrado': 'Deslocamento = 0; termina se o agarrador ficar incapacitado ou for afastado.',
  'Amedrontado': 'Desvantagem em testes e ataques enquanto a fonte do medo estiver visível; não pode se aproximar dela.',
  'Atordoado': 'Incapacitado, não se move, fala vacilante; falha automática em salvas de Força e Destreza; ataques contra ele têm vantagem.',
  'Caído': 'Só rasteja; desvantagem em ataques; ataques corpo a corpo contra ele têm vantagem, à distância têm desvantagem.',
  'Cego': 'Não enxerga, falha em testes que exijam visão; seus ataques têm desvantagem e ataques contra ele têm vantagem.',
  'Enfeitiçado': 'Não pode atacar o enfeitiçador; este tem vantagem em testes sociais com ele.',
  'Envenenado': 'Desvantagem em jogadas de ataque e testes de atributo.',
  'Impedido': 'Deslocamento = 0; desvantagem em ataques e em salvas de Destreza; ataques contra ele têm vantagem (ex.: preso em teia).',
  'Incapacitado': 'Não pode realizar ações nem reações.',
  'Inconsciente': 'Incapacitado, caído, larga o que segura; ataques têm vantagem e acertos a 1,5m são críticos.',
  'Invisível': 'Impossível de ver sem ajuda; ataques contra ele têm desvantagem, seus ataques têm vantagem.',
  'Paralisado': 'Incapacitado, não se move/fala; falha salvas de Força/Destreza; ataques têm vantagem e acertos a 1,5m são críticos.',
  'Petrificado': 'Vira pedra: incapacitado, resistência a todo dano, imune a veneno/doença.',
  'Surdo': 'Não ouve e falha em testes que exijam audição.',
  'Exausto': 'Níveis de exaustão acumulam penalidades (desvantagem em testes, deslocamento reduzido, etc.).',
};

// C6: detecta condições implícitas no texto de um ataque (ex.: "FOR CD 11 ou o
// alvo cai" → Caído CD 11 FOR). Devolve um array de { cond, cd, salva } — cond é
// uma chave de CONDICOES. Função PURA (usada pelo rastreador de combate e testes).
function efeitosDoAtaque(texto) {
  if (!texto) return [];
  const t = String(texto).toLowerCase();
  const cdM = String(texto).match(/CD\s*(\d+)/i);
  const cd = cdM ? parseInt(cdM[1], 10) : null;
  const salvaM = String(texto).match(/\b(FOR|DES|CON|INT|SAB|CAR)\s*CD/i);
  const salva = salvaM ? salvaM[1].toUpperCase() : null;
  // ordem: mais específico primeiro; cada condição entra no máximo uma vez
  const regras = [
    [/paralisad/, 'Paralisado'],
    [/inconscient|adormec/, 'Inconsciente'],
    [/atordoad/, 'Atordoado'],
    [/amedront|apavora|assombr/, 'Amedrontado'],
    [/impedid|enredad|preso|prende|teia|restrain/, 'Impedido'],
    [/agarrad|agarra\b|constri[cç]/, 'Agarrado'],
    [/envenenad|veneno|poison/, 'Envenenado'],
    [/\bcego\b|cegueira|\bcega\b|blind/, 'Cego'],
    [/\bsurd/, 'Surdo'],
    [/enfeiti[cç]ad|encantad|charm/, 'Enfeitiçado'],
    [/incapacitad/, 'Incapacitado'],
    [/\bcai\b|derruba|ca[íi]d[oa]|ao ch[ãa]o|no ch[ãa]o|prone/, 'Caído'],
  ];
  const achados = [];
  regras.forEach(([re, cond]) => { if (re.test(t) && !achados.some(a => a.cond === cond)) achados.push({ cond, cd, salva }); });
  return achados;
}

// =====================================================
// TALENTOS (Feats) - PHB (resumo dos efeitos)
// =====================================================
const TALENTOS = {
  'Atacante Brutal (Great Weapon Master)': 'Em crítico/abate, ataque corpo a corpo bônus. Pode optar por -5 no ataque para +10 no dano com armas pesadas.',
  'Atirador de Elite (Sharpshooter)': 'Ignora cobertura leve/média, sem desvantagem em longo alcance; pode optar por -5 no ataque para +10 no dano à distância.',
  'Sortudo (Lucky)': '3 pontos de sorte/descanso longo: role um d20 extra em ataque, teste ou salva e escolha qual usar.',
  'Alerta (Alert)': '+5 em iniciativa; não pode ser surpreendido enquanto consciente; inimigos ocultos não ganham vantagem contra você.',
  'Mestre em Armas Curtas (Defensive Duelist)': 'Reação: ao ser atingido com arma de acuidade, +bônus de proficiência na CA contra o ataque.',
  'Resiliente (Resilient)': '+1 num atributo e proficiência em salvaguardas daquele atributo.',
  'Robusto (Tough)': '+2 PV por nível de personagem.',
  'Iniciado em Magia (Magic Initiate)': 'Aprende 2 truques e 1 magia de 1º círculo de uma classe.',
  'Mestre em Escudos (Shield Master)': 'Ação bônus para empurrar com escudo; bônus do escudo em salvas de Destreza.',
  'Combatente com Armas Grandes (Polearm Master)': 'Ataque bônus com a haste (1d4); ataque de oportunidade quando inimigos entram no alcance.',
  'Sentinela (Sentinel)': 'Acerto de oportunidade zera o deslocamento do alvo; ataca quem desengaja perto de você.',
  'Conjurador de Guerra (War Caster)': 'Vantagem em salvas de concentração; conjura com mãos ocupadas; ataques de oportunidade podem ser magias.',
  'Mobilidade (Mobile)': '+3m de deslocamento; ignora terreno difícil ao Disparar; sem ataques de oportunidade de quem você atacou corpo a corpo.',
  'Observador (Observant)': '+1 INT ou SAB; +5 em Percepção e Investigação passivas; lê lábios.',
};

// =====================================================
// SUBCLASSES (PHB) - { classe: { nivel, opcoes:[{nome, desc}] } }
// nivel = nível em que a subclasse é escolhida
// =====================================================
const SUBCLASSES = {
  'Bárbaro': { nivel: 3, opcoes: [
    { nome: 'Caminho do Berserker', desc: 'Frenesi: ataque bônus durante a Fúria.' },
    { nome: 'Caminho do Guerreiro Totêmico', desc: 'Espíritos totêmicos (urso/águia/lobo) concedem poderes.' },
  ] },
  'Bardo': { nivel: 3, opcoes: [
    { nome: 'Colégio do Conhecimento', desc: 'Perícias extras e Palavras Cortantes.' },
    { nome: 'Colégio da Bravura', desc: 'Inspiração de combate e proficiência marcial.' },
  ] },
  'Clérigo': { nivel: 1, opcoes: [
    { nome: 'Domínio da Vida', desc: 'Cura potencializada; armadura pesada.' },
    { nome: 'Domínio da Luz', desc: 'Magias de fogo/radiância; Flash protetor.' },
    { nome: 'Domínio da Guerra', desc: 'Ataques divinos; proficiência marcial.' },
    { nome: 'Domínio do Engano', desc: 'Bênção do Trapaceiro; magias de ilusão.' },
    { nome: 'Domínio do Conhecimento', desc: 'Perícias e idiomas; ler pensamentos.' },
    { nome: 'Domínio da Natureza', desc: 'Magias druídicas; encantar animais.' },
    { nome: 'Domínio da Tempestade', desc: 'Trovão e relâmpago; resposta destrutiva.' },
  ] },
  'Druida': { nivel: 2, opcoes: [
    { nome: 'Círculo da Terra', desc: 'Magias do bioma; recupera espaços.' },
    { nome: 'Círculo da Lua', desc: 'Forma Selvagem em feras de combate.' },
  ] },
  'Guerreiro': { nivel: 3, opcoes: [
    { nome: 'Campeão', desc: 'Crítico aprimorado (19-20); atlético.' },
    { nome: 'Mestre de Batalha', desc: 'Manobras táticas com dados de superioridade.' },
    { nome: 'Cavaleiro Arcano', desc: 'Conjura magias de mago.' },
  ] },
  'Monge': { nivel: 3, opcoes: [
    { nome: 'Caminho da Mão Aberta', desc: 'Técnicas de Ki que empurram/derrubam.' },
    { nome: 'Caminho da Sombra', desc: 'Furtividade mágica; teleporte nas sombras.' },
    { nome: 'Caminho dos Quatro Elementos', desc: 'Conjura efeitos elementais com Ki.' },
  ] },
  'Paladino': { nivel: 3, opcoes: [
    { nome: 'Juramento da Devoção', desc: 'O paladino clássico; arma sagrada.' },
    { nome: 'Juramento dos Anciões', desc: 'Protetor da natureza; resistência a magia.' },
    { nome: 'Juramento da Vingança', desc: 'Caçador implacável; marca o inimigo.' },
  ] },
  'Patrulheiro': { nivel: 3, opcoes: [
    { nome: 'Caçador', desc: 'Bônus contra grupos/grandes inimigos.' },
    { nome: 'Senhor das Feras', desc: 'Companheiro animal de combate.' },
  ] },
  'Ladino': { nivel: 3, opcoes: [
    { nome: 'Ladrão', desc: 'Mãos rápidas; escalar e agir veloz.' },
    { nome: 'Assassino', desc: 'Dano massivo contra surpresos; disfarces.' },
    { nome: 'Trapaceiro Arcano', desc: 'Magias de ilusão/encantamento.' },
  ] },
  'Feiticeiro': { nivel: 1, opcoes: [
    { nome: 'Linhagem Dracônica', desc: 'Resistência e dano do tipo do dragão.' },
    { nome: 'Magia Selvagem', desc: 'Surtos caóticos de magia.' },
  ] },
  'Mago': { nivel: 2, opcoes: [
    { nome: 'Escola de Evocação', desc: 'Magias de dano mais seguras e fortes.' },
    { nome: 'Escola de Abjuração', desc: 'Proteção arcana; escudo de magia.' },
    { nome: 'Escola de Ilusão', desc: 'Ilusões aprimoradas e versáteis.' },
    { nome: 'Escola de Necromancia', desc: 'Dreno de vida; comanda mortos-vivos.' },
    { nome: 'Escola de Adivinhação', desc: 'Prevê resultados (Portento).' },
    { nome: 'Escola de Conjuração', desc: 'Invoca criaturas e objetos.' },
    { nome: 'Escola de Encantamento', desc: 'Domina mentes; hipnose.' },
    { nome: 'Escola de Transmutação', desc: 'Altera matéria e realidade.' },
  ] },
  'Bruxo': { nivel: 1, opcoes: [
    { nome: 'O Corruptor (Fiend)', desc: 'PV temporários ao abater; magias de fogo.' },
    { nome: 'O Arquifada (Archfey)', desc: 'Encanta e desorienta inimigos.' },
    { nome: 'O Grande Antigo (Great Old One)', desc: 'Telepatia; poderes psíquicos.' },
  ] },
};

// =====================================================
// CARACTERÍSTICAS DE SUBCLASSE por nível (mecânica completa)
// Indexado pelo nome da subclasse. Começa pelas 8 Escolas do Mago.
// =====================================================
const SUBCLASSE_FEATURES = {
  'Escola de Evocação': {
    2: [
      ['Especialista em Evocação', 'Copiar magias de evocação para o grimório custa metade do ouro e do tempo.'],
      ['Esculpir Magias', 'Ao conjurar uma evocação de área, escolha 1 + nível da magia aliados: eles passam automaticamente na salva e não sofrem dano dela.'],
    ],
    6: [['Truque Potente', 'Criaturas que passam na salvaguarda de um truque seu ainda sofrem metade do dano (sem efeitos secundários).']],
    10: [['Evocação Empoderada', 'Some seu modificador de Inteligência ao dano de uma evocação de mago.']],
    14: [['Sobrecarga', 'Maximiza o dano de uma magia de até 5º círculo. Depois da 1ª vez por descanso longo, sofre dano necrótico crescente a cada reuso.']],
  },
  'Escola de Abjuração': {
    2: [
      ['Especialista em Abjuração', 'Copiar abjurações para o grimório custa metade.'],
      ['Proteção Arcana', 'Ao conjurar uma abjuração de 1º+, cria um escudo de PV (2× nível de mago + INT) que absorve dano antes do seu PV; recarrega ao conjurar abjurações.'],
    ],
    6: [['Proteção Projetada', 'Reação: use a Proteção Arcana para absorver dano de uma criatura a até 9m.']],
    10: [['Abjuração Aprimorada', 'Some o bônus de proficiência aos testes de conjuração de abjuração (ex.: Dissipar Magia, Contramágica).']],
    14: [['Resistência a Magias', 'Vantagem em salvaguardas contra magias e resistência ao dano de magias.']],
  },
  'Escola de Adivinhação': {
    2: [
      ['Especialista em Adivinhação', 'Copiar adivinhações para o grimório custa metade.'],
      ['Portento', 'Ao terminar um descanso longo, role 2d20 e guarde. Pode substituir qualquer ataque, teste ou salva (sua ou de quem você vê) por um desses números.'],
    ],
    6: [['Adivinhação Experiente', 'Ao conjurar adivinhação de 2º+, recupera um espaço de magia de círculo menor (1×/descanso).']],
    10: [['O Terceiro Olho', 'Ação: ganha visão no escuro, ver o invisível, leitura de qualquer idioma escrito ou visão etérea.']],
    14: [['Portento Maior', 'Passa a rolar 3 dados de Portento por descanso longo.']],
  },
  'Escola de Conjuração': {
    2: [
      ['Especialista em Conjuração', 'Copiar conjurações para o grimório custa metade.'],
      ['Conjuração Menor', 'Ação: cria um objeto não-mágico (até 3 kg, cubo de 0,9m) que dura 1 hora.'],
    ],
    6: [['Transposição Benigna', 'Ação: teleporta-se até 9m OU troca de lugar com uma criatura pequena/média aliada.']],
    10: [['Conjuração Focada', 'Sua concentração em magias de conjuração não pode ser quebrada por dano.']],
    14: [['Invocação Duradoura', 'Criaturas que você invoca ganham 30 PV temporários.']],
  },
  'Escola de Encantamento': {
    2: [
      ['Especialista em Encantamento', 'Copiar encantamentos para o grimório custa metade.'],
      ['Olhar Hipnótico', 'Ação: um alvo a 1,5m faz DT de magia ou fica enfeitiçado e incapacitado enquanto você mantiver o olhar.'],
    ],
    6: [['Encanto Instintivo', 'Reação ao ser atacado: o atacante faz salva ou redireciona o ataque para outra criatura.']],
    10: [['Encantamento Dividido', 'Encantamentos de alvo único de 1º+ podem atingir 2 alvos.']],
    14: [['Alterar Memórias', 'Faz o alvo esquecer que foi enfeitiçado; pode apagar até várias horas de memória.']],
  },
  'Escola de Ilusão': {
    2: [
      ['Especialista em Ilusão', 'Copiar ilusões para o grimório custa metade.'],
      ['Ilusão Menor Aprimorada', 'Ilusão Menor cria som E imagem ao mesmo tempo; pode conjurar sem o componente sonoro.'],
    ],
    6: [['Ilusões Maleáveis', 'Pode alterar a natureza de uma ilusão sua de duração 1 min+ enquanto a vê.']],
    10: [['Eu Ilusório', 'Reação: cria uma cópia ilusória que faz um ataque que o acertaria errar (1×/descanso).']],
    14: [['Realidade Ilusória', 'Torna um objeto ilusório real (não-mágico) por 1 minuto.']],
  },
  'Escola de Necromancia': {
    2: [
      ['Especialista em Necromancia', 'Copiar necromancias para o grimório custa metade.'],
      ['Colheita Sombria', 'Ao matar uma criatura com magia, recupera PV iguais a 2× o círculo da magia (ou o nível, com truques).'],
    ],
    6: [['Servos Mortos-Vivos', 'Aprende Animar Mortos; cria 1 morto-vivo a mais e eles ganham +PV e dano radiante/necrótico extra.']],
    10: [['Habituado à Morte', 'Resistência a dano necrótico e seu PV máximo não pode ser reduzido.']],
    14: [['Comandar Mortos-Vivos', 'Ação: domina um morto-vivo (salva de Carisma; mais difícil para inteligentes).']],
  },
  'Escola de Transmutação': {
    2: [
      ['Especialista em Transmutação', 'Copiar transmutações para o grimório custa metade.'],
      ['Alquimia Menor', 'Transforma um material (madeira↔pedra, ferro↔cobre etc.) por 1 hora.'],
    ],
    6: [['Pedra do Transmutador', 'Cria uma pedra que dá um benefício à escolha (visão no escuro, +3m desloc., proficiência em CON, resistência a um dano).']],
    10: [['Metamorfo', 'Conjura Polimorfia em si mesmo sem gastar espaço (formas de fera limitadas), 1×/descanso.']],
    14: [['Mestre Transmutador', 'Consome a pedra para um grande efeito: rejuvenescer, restaurar, ou tornar a pedra permanente.']],
  },

  // ---------- GUERREIRO ----------
  'Campeão': {
    3: [['Crítico Aprimorado', 'Suas jogadas de ataque com arma causam crítico em 19 ou 20 no dado (não só 20).']],
    7: [['Atleta Notável', 'Some metade do bônus de proficiência (arredondado p/ cima) a testes de Força, Destreza e Constituição que não já tenham proficiência. Salto em distância +alguns metros (mod. de Força).']],
    10: [['Estilo de Luta Adicional', 'Escolhe um segundo Estilo de Luta.']],
    15: [['Crítico Superior', 'Suas jogadas de ataque com arma causam crítico em 18, 19 ou 20.']],
    18: [['Sobrevivente', 'No início de cada turno, se estiver com até metade do PV (e não a 0), recupera 5 + mod. de Constituição de PV.']],
  },
  'Mestre de Batalha': {
    3: [
      ['Manobras de Combate', 'Aprende 3 manobras. Tem 4 dados de superioridade (d8) que gasta para ativá-las; CD = 8 + prof + Força ou Destreza. Recupera todos em descanso curto/longo. (Ver lista de manobras no painel.)'],
      ['Sabe Disso (Student of War)', 'Ganha proficiência com um tipo de ferramenta de artesão.'],
    ],
    7: [['Conhecer o Inimigo', 'Estudando uma criatura por 1 minuto, descobre se ela é igual, superior ou inferior a você em Força, Destreza, Constituição, CA, PV atual, total de níveis de classe e níveis de Guerreiro. (Sobe para 5 dados e 5 manobras.)']],
    10: [['Manobras Aprimoradas', 'Seus dados de superioridade tornam-se d10. (Aprende +2 manobras, total 7.)']],
    15: [['Manobras Implacáveis', 'Se rolar iniciativa sem nenhum dado de superioridade, recupera 1. (Sobe para 6 dados e 9 manobras.)']],
    18: [['Manobras Superiores', 'Seus dados de superioridade tornam-se d12.']],
  },
  'Cavaleiro Arcano': {
    3: [
      ['Conjuração (1/3 Mago)', 'Conjura magias da lista de Mago (Abjuração e Evocação) usando Inteligência. Começa com 2 truques e 3 magias conhecidas; espaços de magia parciais (até 4º círculo no N19). CD = 8 + prof + INT.'],
      ['Vínculo com Arma', 'Ritual de 1h vincula até 2 armas: não pode ser desarmado delas contra a vontade e pode invocá-las para a mão como ação bônus (mesmo plano).'],
    ],
    7: [['Magia de Guerra', 'Ao usar a ação para conjurar um truque, pode fazer 1 ataque de arma como ação bônus.']],
    10: [['Golpe Arcano', 'Ao acertar uma criatura com ataque de arma, ela fica com desvantagem na próxima salvaguarda contra uma magia sua, até o fim do seu próximo turno.']],
    15: [['Carga Arcana', 'Ao usar Surto de Ação, pode se teletransportar até 9m antes ou depois da ação adicional.']],
    18: [['Magia de Guerra Aprimorada', 'Ao usar a ação para conjurar qualquer magia (não só truque), pode fazer 1 ataque de arma como ação bônus.']],
  },

  // ---------- LADINO ----------
  'Ladrão': {
    3: [
      ['Mãos Rápidas', 'Use a Ação Ardilosa (ação bônus) para Prestidigitação, usar um objeto, abrir fechadura ou desarmar armadilha com as ferramentas de ladrão.'],
      ['Trabalho em Altura', 'Escalar não custa deslocamento extra; ao saltar à distância, percorre +alguns metros (mod. de Destreza).'],
    ],
    9: [['Furtividade Suprema', 'Tem vantagem em testes de Destreza (Furtividade) se não se mover mais que metade do deslocamento no turno.']],
    13: [['Usar Itens Mágicos', 'Ignora todos os requisitos de classe, raça e nível para usar itens mágicos.']],
    17: [['Reflexos de Ladrão', 'Na 1ª rodada de combate, faz dois turnos: um na sua iniciativa e outro na sua iniciativa −10 (não vale se for surpreendido).']],
  },
  'Assassino': {
    3: [
      ['Proficiências de Assassino', 'Ganha proficiência com kit de disfarces e kit de envenenamento.'],
      ['Assassinar', 'Vantagem em ataques contra criaturas que ainda não agiram no combate. Qualquer acerto numa criatura surpresa é um acerto crítico.'],
    ],
    9: [['Perito em Infiltração', 'Passa 7 dias e 25 po para criar uma identidade falsa convincente e documentada.']],
    13: [['Impostor', 'Após estudar uma pessoa por 3h, imita fala, escrita e comportamento dela de forma convincente.']],
    17: [['Golpe Mortal', 'Ao acertar e causar Ataque Furtivo numa criatura surpresa, ela faz salva de Constituição (CD 8+Des+prof) ou o dano do ataque é dobrado.']],
  },
  'Trapaceiro Arcano': {
    3: [
      ['Conjuração (1/3 Mago)', 'Conjura magias da lista de Mago (Encantamento e Ilusão) usando Inteligência. Começa com 3 truques (incl. Mão Mágica) e 3 magias conhecidas; até o 4º círculo no N19. CD = 8 + prof + INT.'],
      ['Prestidigitação Fantasma (Mão Mágica)', 'Sua Mão Mágica fica invisível e pode: guardar/recuperar objeto, abrir porta/recipiente destrancado, usar ferramentas de ladrão a distância — controlando-a como ação bônus.'],
    ],
    9: [['Emboscada Mágica', 'Se estiver escondido ao conjurar uma magia numa criatura, ela tem desvantagem na salvaguarda contra essa magia.']],
    13: [['Trapaceiro Versátil', 'Use a Mão Mágica para distrair uma criatura a até 1,5m dela: você tem vantagem em ataques contra essa criatura até o fim do turno.']],
    17: [['Ladrão de Magias', 'Quando uma criatura conjura nas suas proximidades, use a reação para impor desvantagem; se ela falhar/errar, você rouba a magia (pode conjurá-la 1×) e ela não pode usá-la por 8h.']],
  },

  // ---------- CLÉRIGO (domínios escolhidos no N1; evoluem em 1/2/6/8/17) ----------
  'Domínio da Vida': {
    1: [
      ['Proficiência com Armadura Pesada', 'O Domínio da Vida concede proficiência com armadura pesada.'],
      ['Discípulo da Vida', 'Suas magias de cura de 1º círculo ou maior recuperam +2 + o círculo da magia de PV adicionais.'],
    ],
    2: [['Canalizar Divindade: Preservar a Vida', 'Cura total = 5× nível de Clérigo, distribuída entre criaturas a até 9m, mas nenhuma além da metade do PV máximo.']],
    6: [['Curandeiro Abençoado', 'Quando uma magia sua cura outra criatura, você também recupera 2 + o círculo da magia de PV.']],
    8: [['Golpe Divino', '1×/turno, ao acertar com arma, +1d8 de dano radiante (sobe para 2d8 no N14).']],
    17: [['Cura Suprema', 'Ao conjurar magia de cura com dados, use o valor máximo de cada dado em vez de rolar.']],
  },
  'Domínio da Luz': {
    1: [
      ['Truque Bônus (Luz)', 'Aprende o truque Luz, que não conta no seu total.'],
      ['Flash de Advertência', 'Reação ao ser atacado (ou Sab usos/descanso longo): impõe desvantagem à jogada de ataque.'],
    ],
    2: [['Canalizar Divindade: Radiância da Aurora', 'Dissipa escuridão mágica em 9m e causa 2d10 + nível de Clérigo de dano radiante (metade na salva).']],
    6: [['Flash de Advertência Aprimorado', 'Pode usar o Flash de Advertência também para proteger outra criatura a até 9m.']],
    8: [['Potência de Conjuração', 'Some seu modificador de Sabedoria ao dano dos seus truques de Clérigo.']],
    17: [['Coroa de Luz', 'Ação: emana luz por 1 min; inimigos na luz têm desvantagem em salvas contra suas magias de fogo e radiância.']],
  },
  'Domínio da Guerra': {
    1: [
      ['Proficiências de Guerra', 'Proficiência com armas marciais e armadura pesada.'],
      ['Sacerdote de Guerra', 'Quando usa a ação de Ataque, faz um ataque de arma adicional como ação bônus (Sab usos/descanso).'],
    ],
    2: [['Canalizar Divindade: Ataque Guiado', 'Soma +10 a uma jogada de ataque sua (decide antes de saber se acerta).']],
    6: [['Canalizar Divindade: Bênção do Deus da Guerra', 'Reação: gasta CD para dar +10 ao ataque de uma criatura a até 9m.']],
    8: [['Golpe Divino', '1×/turno, ao acertar com arma, +1d8 de dano (do tipo da arma); sobe para 2d8 no N14.']],
    17: [['Avatar da Batalha', 'Resistência a dano de concussão, perfurante e cortante de armas não-mágicas.']],
  },
  'Domínio do Engano': {
    1: [['Bênção do Trapaceiro', 'Toque: dá a uma criatura vantagem em testes de Destreza (Furtividade) por 1 hora.']],
    2: [['Canalizar Divindade: Invocar Duplicidade', 'Cria uma ilusão perfeita sua por 1 min; pode conjurar a partir dela e tem vantagem em ataques se você e ela flanquearem o alvo.']],
    6: [['Canalizar Divindade: Manto de Sombras', 'Fica invisível até o fim do seu próximo turno.']],
    8: [['Golpe Divino', '1×/turno, ao acertar com arma, +1d8 de dano venenoso (sobe para 2d8 no N14).']],
    17: [['Duplicidade Aprimorada', 'Ao Invocar Duplicidade, cria até 4 ilusões de uma vez.']],
  },
  'Domínio do Conhecimento': {
    1: [['Bênçãos do Conhecimento', 'Aprende 2 idiomas e ganha proficiência + especialização (dobra prof.) em 2 perícias entre Arcanismo, História, Natureza e Religião.']],
    2: [['Canalizar Divindade: Conhecimento das Eras', 'Por 10 min, ganha proficiência com qualquer perícia ou ferramenta à escolha.']],
    6: [['Canalizar Divindade: Ler Pensamentos', 'Lê a mente de uma criatura e pode lançar Sugestão nela sem gastar espaço.']],
    8: [['Potência de Conjuração', 'Some seu modificador de Sabedoria ao dano dos seus truques de Clérigo.']],
    17: [['Visões do Passado', 'Concentração/meditação para ver visões da história de um objeto ou local.']],
  },
  'Domínio da Natureza': {
    1: [
      ['Acólito da Natureza', 'Aprende 1 truque de Druida e ganha proficiência em uma entre Adestrar Animais, Natureza e Sobrevivência; também proficiência com armadura pesada.'],
    ],
    2: [['Canalizar Divindade: Encantar Animais e Plantas', 'Criaturas do tipo fera ou planta a 9m fazem salva de Sabedoria ou ficam enfeitiçadas por 1 min.']],
    6: [['Amenizar Elementos', 'Reação: concede a si ou a aliado a 9m resistência a dano de ácido, frio, fogo, relâmpago ou trovão.']],
    8: [['Golpe Divino', '1×/turno, ao acertar com arma, +1d8 de dano de frio, fogo ou relâmpago (sobe para 2d8 no N14).']],
    17: [['Mestre da Natureza', 'Pode comandar (sem ação) as criaturas enfeitiçadas pelo seu Canalizar Divindade.']],
  },
  'Domínio da Tempestade': {
    1: [
      ['Proficiências de Tempestade', 'Proficiência com armas marciais e armadura pesada.'],
      ['Fúria da Tempestade', 'Reação ao ser atingido corpo a corpo: o atacante faz salva de Destreza ou sofre 2d8 de trovão (Sab usos/descanso).'],
    ],
    2: [['Canalizar Divindade: Ira Destrutiva', 'Maximiza o dano de trovão ou relâmpago de uma magia/efeito seu em vez de rolar.']],
    6: [['Golpe Trovejante', 'Quando causa dano elétrico a uma criatura Grande ou menor, pode empurrá-la até 3m.']],
    8: [['Golpe Divino', '1×/turno, ao acertar com arma, +1d8 de dano de trovão (sobe para 2d8 no N14).']],
    17: [['Filho da Tempestade', 'Ao ar livre em clima de tempestade, ganha deslocamento de voo igual ao seu deslocamento.']],
  },

  // ---------- BARDO ----------
  'Colégio do Conhecimento': {
    3: [
      ['Proficiências Bônus', 'Ganha proficiência em 3 perícias à escolha.'],
      ['Palavras Cortantes', 'Reação: gasta uma Inspiração de Bardo para subtrair o dado de uma jogada de ataque, teste de habilidade ou dano de uma criatura a até 18m.'],
    ],
    6: [['Segredos Mágicos Adicionais', 'Aprende 2 magias de qualquer classe (contam como magias de bardo).']],
    14: [['Habilidade Incomparável', 'Pode somar uma Inspiração de Bardo a qualquer teste de habilidade seu.']],
  },
  'Colégio da Bravura': {
    3: [
      ['Proficiências Bônus', 'Proficiência com armadura média, escudos e armas marciais.'],
      ['Inspiração de Combate', 'A criatura com sua Inspiração pode gastá-la para somar o dado ao dano de uma arma, ou somar à CA contra um ataque.'],
    ],
    6: [['Ataque Extra', 'Ataca duas vezes ao usar a ação de Ataque.']],
    14: [['Magia de Batalha', 'Ao usar a ação para conjurar uma magia, pode fazer um ataque de arma como ação bônus.']],
  },

  // ---------- BÁRBARO ----------
  'Caminho do Berserker': {
    3: [['Frenesi', 'Ao entrar em Fúria, pode entrar em frenesi: 1 ataque corpo a corpo bônus por turno enquanto durar. Ao acabar, ganha 1 nível de exaustão.']],
    6: [['Fúria Insana', 'Durante a Fúria, não pode ser enfeitiçado nem amedrontado (se já estiver, o efeito é suspenso).']],
    10: [['Presença Intimidadora', 'Ação: uma criatura a 9m faz salva de Sabedoria ou fica amedrontada de você; pode renovar a cada turno.']],
    14: [['Retaliação', 'Reação ao sofrer dano de uma criatura a até 1,5m: faz um ataque corpo a corpo contra ela.']],
  },
  'Caminho do Guerreiro Totêmico': {
    3: [['Totem do Espírito', 'Escolhe um espírito: Urso (resistência a todo dano exceto psíquico durante a Fúria), Águia (Disparar como bônus, ataques contra você têm desvantagem) ou Lobo (aliados têm vantagem contra inimigos a 1,5m de você).']],
    6: [['Aspecto da Besta', 'Ganha um benefício constante do animal: Urso (capacidade de carga dobrada), Águia (visão aguçada) ou Lobo (rastrear/furtividade em grupo).']],
    10: [['Andarilho Espiritual', 'Pode conjurar Comunhão com a Natureza como ritual.']],
    14: [['Sintonia Totêmica', 'Benefício de combate do totem: Urso (inimigos a 1,5m têm desvantagem em ataques contra outros), Águia (voa por curtos períodos) ou Lobo (derruba o alvo ao acertar corpo a corpo).']],
  },

  // ---------- DRUIDA ----------
  'Círculo da Terra': {
    2: [
      ['Truque Bônus', 'Aprende um truque de druida adicional.'],
      ['Recuperação Natural', 'Num descanso curto (1×/dia), recupera espaços de magia somando até metade do seu nível de druida (nenhum acima do 5º).'],
      ['Magias do Círculo', 'Conforme o bioma (ártico, costa, deserto, floresta, pântano, etc.), ganha magias sempre preparadas.'],
    ],
    6: [['Passos da Terra', 'Terreno difícil natural não reduz seu deslocamento; passa por plantas sem dano/atraso.']],
    10: [['Defesa Natural', 'Imune a veneno e doença; não pode ser enfeitiçado nem amedrontado por elementais e fadas.']],
    14: [['Santuário Natural', 'Feras e plantas fazem salva de Sabedoria para conseguir atacá-lo.']],
  },
  'Círculo da Lua': {
    2: [
      ['Forma Selvagem de Combate', 'Pode usar Forma Selvagem como ação bônus e assumir feras de combate de até ND 1.'],
      ['PV de Fera', 'Como ação bônus na forma, gasta espaço de magia para curar 1d8 por círculo do espaço.'],
    ],
    6: [['Ataques Primitivos', 'Seus ataques na Forma Selvagem contam como mágicos; pode assumir feras de até ND 6.']],
    10: [['Forma Elemental', 'Pode gastar 2 usos de Forma Selvagem para se transformar em um elemental do ar, terra, fogo ou água.']],
    14: [['Mil Formas', 'Pode conjurar Alterar-se à vontade.']],
  },

  // ---------- MONGE ----------
  'Caminho da Mão Aberta': {
    3: [['Técnica da Mão Aberta', 'Ao acertar com Rajada de Golpes, escolhe: derrubar (salva de Des), empurrar 4,5m (salva de For) ou negar reações do alvo até seu próximo turno.']],
    6: [['Totalidade do Corpo', 'Ação: cura a si mesmo 3× seu nível de monge de PV (1×/descanso longo).']],
    11: [['Tranquilidade', 'Ao terminar um descanso longo, ganha o efeito de Santuário (CD = 8 + Sab + prof) até o próximo descanso.']],
    17: [['Palma Vibrante', 'Gasta 3 Ki ao acertar: planta vibrações letais. Em até alguns dias, pode liberar — salva de Constituição ou cai a 0 PV (ou metade do dano se passar).']],
  },
  'Caminho da Sombra': {
    3: [['Artes das Sombras', 'Gasta 2 Ki para conjurar Escuridão, Passo Enevoado, Visão no Escuro, Passos sem Pegadas ou Silêncio; aprende o truque Ilusão Menor.']],
    6: [['Passo das Sombras', 'Na penumbra/escuridão, ação bônus para teleportar até 18m a outra área sombria; vantagem no 1º ataque corpo a corpo até o fim do turno.']],
    11: [['Manto de Sombras', 'Em penumbra/escuridão, ação para ficar invisível enquanto permanecer na sombra e não atacar/conjurar.']],
    17: [['Oportunista', 'Quando uma criatura a 1,5m é atingida por outra, você pode fazer um ataque corpo a corpo contra ela como reação.']],
  },
  'Caminho dos Quatro Elementos': {
    3: [['Discípulo dos Elementos', 'Aprende a disciplina Sintonia Elemental + 1 disciplina; gasta Ki para conjurar magias elementais (ex.: Punho da Fúria Inflamada, Garras do Inverno).']],
    6: [['Disciplina Elemental Adicional', 'Aprende mais uma disciplina elemental; pode conjurar magias de círculos maiores gastando mais Ki.']],
    11: [['Disciplina Elemental Adicional', 'Aprende mais uma disciplina elemental.']],
    17: [['Disciplina Elemental Adicional', 'Aprende mais uma disciplina elemental (até magias de 5º círculo elementais).']],
  },

  // ---------- PALADINO (juramentos: Canalizar Divindade no N3, auras, capstone no N20) ----------
  'Juramento da Devoção': {
    3: [['Canalizar Divindade: Arma Sagrada e Expulsar os Profanos', 'Arma Sagrada: +Carisma nas jogadas de ataque com uma arma por 1 min, que emite luz. Expulsar os Profanos: corruptores e mortos-vivos a 9m fazem salva ou fogem.']],
    7: [['Aura de Devoção', 'Você e aliados a 3m (9m no N18) não podem ser enfeitiçados.']],
    15: [['Pureza de Espírito', 'Está sempre sob o efeito de Proteção contra o Mal e o Bem.']],
    20: [['Nimbo Sagrado', 'Ação (1×/descanso longo): emana luz solar por 1 min; inimigos na aura sofrem 10 de dano radiante por turno e você tem vantagem em salvas contra magias de conjuradores corruptores/mortos-vivos.']],
  },
  'Juramento dos Anciões': {
    3: [['Canalizar Divindade: Ira Natural e Repreender o Profano', 'Ira Natural: enraíza uma criatura (salva de Força/Destreza ou fica impedida). Repreender o Profano: corruptores e mortos-vivos fogem.']],
    7: [['Aura de Guarda', 'Você e aliados a 3m (9m no N18) têm resistência a dano de magias.']],
    15: [['Sentinela Imortal', 'Ao cair a 0 PV (e não morrer de imediato), volta a 1 PV (1×/descanso longo); não envelhece magicamente e dispensa dormir.']],
    20: [['Campeão dos Anciões', 'Ação (1×/descanso longo): por 1 min, ganha resistência a todo dano, regenera 10 PV/turno e conjura magias de paladino mais rápido.']],
  },
  'Juramento da Vingança': {
    3: [['Canalizar Divindade: Voto de Inimizade e Repreender o Profano', 'Voto de Inimizade: por 1 min, tem vantagem em ataques contra uma criatura. Repreender o Profano: afasta corruptores e mortos-vivos.']],
    7: [['Implacável', 'Quando uma criatura sua reduz seu deslocamento a 0 ou você acerta um ataque de oportunidade, pode se mover até metade do deslocamento.']],
    15: [['Alma da Vingança', 'Quando o alvo do seu Voto de Inimizade ataca, você pode fazer um ataque corpo a corpo contra ele como reação.']],
    20: [['Anjo Vingador', 'Ação (1×/descanso longo): por 1h, ganha asas (voo) e emite uma aura de pavor (inimigos a 9m fazem salva ou ficam amedrontados).']],
  },

  // ---------- PATRULHEIRO ----------
  'Caçador': {
    3: [['Presa do Caçador', 'Escolhe: Assassino de Colossos (+1d8 a um alvo já ferido, 1×/turno), Destruidor de Hordas (ataque extra num 2º inimigo adjacente) ou Algoz de Gigantes (reação ao ataque de inimigo Grande+).']],
    7: [['Táticas Defensivas', 'Escolhe: Escapar da Horda, Defesa Multiataque ou Vontade de Aço (contra medo).']],
    11: [['Multiataque', 'Escolhe: Flecha Múltipla (uma flecha atinge 3 alvos) ou Ataque Giratório (ataca todos ao redor).']],
    15: [['Defesa Suprema do Caçador', 'Escolhe: Evasão, Permanecer Vigilante ou Esquiva Sobrenatural conforme a tática escolhida.']],
  },
  'Senhor das Feras': {
    3: [['Companheiro Animal Primitivo', 'Ganha uma fera companheira (ND ≤ ¼) que age conforme seus comandos e usa seu bônus de proficiência.']],
    7: [['Camaradagem Excepcional', 'O companheiro pode usar Esquiva quando você não dá comando; ganha bônus de PV e ataque.']],
    11: [['Fúria Bestial', 'Seu companheiro pode atacar duas vezes ao receber o comando de Atacar.']],
    15: [['Compartilhar Magias', 'Ao conjurar uma magia em si mesmo, pode afetar também o companheiro a 9m.']],
  },

  // ---------- FEITICEIRO ----------
  'Linhagem Dracônica': {
    1: [
      ['Ancestral Dragão', 'Escolhe um tipo de dragão (define um tipo de dano). Soma o dobro da proficiência em testes de Carisma com dragões.'],
      ['Resiliência Dracônica', 'PV máximo +1 por nível de feiticeiro; sem armadura, sua CA é 13 + Destreza.'],
    ],
    6: [['Afinidade Elemental', 'Some seu modificador de Carisma ao dano de magias do seu tipo de dano; pode gastar 1 ponto para ganhar resistência a esse dano por 1h.']],
    14: [['Asas do Dragão', 'Ação bônus: ganha asas e deslocamento de voo igual ao seu deslocamento, enquanto não usar armadura pesada.']],
    18: [['Presença Dracônica', 'Ação (5 pontos): aura de 18m de pavor ou fascínio; inimigos fazem salva de Sabedoria ou ficam amedrontados/enfeitiçados.']],
  },
  'Magia Selvagem': {
    1: [
      ['Surto de Magia Selvagem', 'Ao conjurar magia de 1º+, o Mestre pode pedir um teste: em 1 num d20, role na Tabela de Surto de Magia Selvagem (efeito caótico).'],
      ['Marés do Caos', 'Ganha vantagem em uma jogada de ataque, teste ou salva; recupera após causar um Surto de Magia Selvagem.'],
    ],
    6: [['Flexão da Sorte', 'Reação (2 pontos): some ou subtraia 1d4 de uma jogada de ataque, teste ou salva de qualquer criatura.']],
    14: [['Caos Controlado', 'Quando rola na tabela de Surto, pode rolar duas vezes e escolher o resultado.']],
    18: [['Pandemônio Mágico (Bombardeio)', 'Quando rola dano de magia e tira o valor máximo num dado, pode rolá-lo de novo e somar.']],
  },

  // ---------- BRUXO (pacto no N3; invocações à parte) ----------
  'O Corruptor (Fiend)': {
    1: [['Bênção do Senhor Sombrio', 'Quando uma criatura que você enxerga morre, ganha PV temporários iguais ao seu Carisma + nível de bruxo.']],
    6: [['Sorte do Senhor Sombrio', 'Some 1d10 a um teste de habilidade ou salvaguarda sua (1×/descanso curto).']],
    10: [['Resiliência Infernal', 'No fim de um descanso curto, escolhe um tipo de dano e ganha resistência a ele até escolher outro.']],
    14: [['Arremesso pelo Inferno', 'Ao acertar uma criatura, pode bani-la pelos planos infernais: ela reaparece no fim do seu próximo turno sofrendo 10d10 de dano psíquico.']],
  },
  'O Arquifada (Archfey)': {
    1: [['Presença Feérica', 'Ação: criaturas a 3m fazem salva de Sabedoria ou ficam enfeitiçadas ou amedrontadas (à sua escolha) até o fim do seu próximo turno.']],
    6: [['Refúgio Sombrio', 'Quando sofre dano, reação para ficar invisível e teleportar até 18m (1×/descanso curto).']],
    10: [['Defesas Enganosas', 'Não pode ser enfeitiçado; se algo tentar, pode refletir o efeito de volta no atacante.']],
    14: [['Delírio Sombrio', 'Ação: mergulha uma criatura enfeitiçada/amedrontada num reino ilusório de êxtase ou terror por 1 min.']],
  },
  'O Grande Antigo (Great Old One)': {
    1: [['Mente Acorrentada', 'Telepatia com qualquer criatura que você veja, a até 9m (idioma em comum).']],
    6: [['Guarda Entrópica', 'Reação ao ser atacado: o atacante tem desvantagem; se errar, seu próximo ataque contra ele tem vantagem (1×/descanso curto).']],
    10: [['Escudo de Pensamentos', 'Seus pensamentos não podem ser lidos; resistência a dano psíquico e reflete metade do dano psíquico no atacante.']],
    14: [['Criar Escravo', 'Toque: uma criatura incapacitada faz salva de Sabedoria ou fica enfeitiçada por você até ser dissipado, com comunicação telepática a qualquer distância (mesmo plano).']],
  },
};

// Manobras do Mestre de Batalha (PHB) — referência para o jogador escolher
const MANOBRAS_BATALHA = {
  'Ataque Comandante': 'Gasta 1 dado para um aliado usar a reação e fazer 1 ataque; soma o dado ao dano.',
  'Ataque Ágil': 'Some o dado ao dano de um ataque; pode também Desengajar como parte da ação.',
  'Ataque Desarmante': 'Ao acertar, alvo faz salva de Força ou derruba um item; soma o dado ao dano.',
  'Ataque Derrubante': 'Ao acertar (alvo Grande ou menor), faz salva de Força ou cai Caído; soma o dado ao dano.',
  'Ataque Empurrão': 'Ao acertar (alvo Grande ou menor), faz salva de Força ou é empurrado até 4,5m; soma o dado ao dano.',
  'Ataque Provocante': 'Ao acertar, alvo faz salva de Sabedoria ou tem desvantagem em ataques contra outros que não você; soma o dado ao dano.',
  'Ataque de Precisão': 'Soma o dado a uma jogada de ataque (pode ser após ver o resultado, antes de acertar/errar).',
  'Ataque Distraente': 'Ao acertar, o próximo ataque de um aliado contra esse alvo tem vantagem; soma o dado ao dano.',
  'Manobra Evasiva': 'Como reação ao ser atingido, some o dado à sua CA contra esse ataque.',
  'Finta': 'Vantagem no próximo ataque contra um alvo neste turno; soma o dado ao dano.',
  'Manobra Defensiva': 'Como reação quando um aliado próximo é atacado, some o dado à CA dele.',
  'Disciplina de Combate': 'Some o dado a um teste de perícia (Atletismo etc.) ou de iniciativa.',
  'Varredura': 'Some o dado a um ataque; uma segunda criatura adjacente ao alvo sofre o dano do dado.',
  'Riposte': 'Como reação quando uma criatura erra você corpo a corpo, faz 1 ataque contra ela; soma o dado ao dano.',
  'Comandar Aliado': 'Concede a um aliado vantagem na próxima jogada de ataque, somando o dado de superioridade.',
  'Postura Vigilante': 'Some o dado à iniciativa rolada (manobra de prontidão).',
};

// Características de uma subclasse acumuladas até um nível (lista {nivel, nome, desc})
function featuresSubclasse(nomeSub, nivelMax) {
  const mapa = SUBCLASSE_FEATURES[nomeSub];
  if (!mapa) return [];
  const out = [];
  Object.keys(mapa).map(Number).sort((a, b) => a - b).forEach(nv => {
    if (nv <= nivelMax) mapa[nv].forEach(([nome, desc]) => out.push({ nivel: nv, nome, desc }));
  });
  return out;
}

// Busca tolerante: encontra detalhe de magia mesmo com variações de nome
function detalheMagia(nome) {
  if (MAGIAS_DETALHE[nome]) return MAGIAS_DETALHE[nome];
  const base = nome.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
  for (const k in MAGIAS_DETALHE) {
    const kb = k.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim();
    if (kb === base || kb.startsWith(base) || base.startsWith(kb)) return MAGIAS_DETALHE[k];
  }
  return null;
}
