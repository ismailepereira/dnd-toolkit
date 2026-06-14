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
  'Bola Relampejante': { nivel: 3, escola: 'Evocação', tempo: '1 ação', alcance: '36m', duracao: 'Instantânea', dano: '—', salva: '—', descricao: 'Veja Relâmpago/Bola de Fogo para área. (Placeholder de expansão.)' },
};

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
  'Incapacitado': 'Não pode realizar ações nem reações.',
  'Inconsciente': 'Incapacitado, caído, larga o que segura; ataques têm vantagem e acertos a 1,5m são críticos.',
  'Invisível': 'Impossível de ver sem ajuda; ataques contra ele têm desvantagem, seus ataques têm vantagem.',
  'Paralisado': 'Incapacitado, não se move/fala; falha salvas de Força/Destreza; ataques têm vantagem e acertos a 1,5m são críticos.',
  'Petrificado': 'Vira pedra: incapacitado, resistência a todo dano, imune a veneno/doença.',
  'Surdo': 'Não ouve e falha em testes que exijam audição.',
  'Exausto': 'Níveis de exaustão acumulam penalidades (desvantagem em testes, deslocamento reduzido, etc.).',
};

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
