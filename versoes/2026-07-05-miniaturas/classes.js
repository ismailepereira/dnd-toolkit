// Tabelas de progressão das 12 classes do PHB (D&D 5e) - referência oficial
// Slots de magia: tabela de conjurador completo (Bardo, Clérigo, Druida, Mago, Feiticeiro)
const SLOTS_CONJURADOR_COMPLETO = {
  1:  [2,0,0,0,0,0,0,0,0],
  2:  [3,0,0,0,0,0,0,0,0],
  3:  [4,2,0,0,0,0,0,0,0],
  4:  [4,3,0,0,0,0,0,0,0],
  5:  [4,3,2,0,0,0,0,0,0],
  6:  [4,3,3,0,0,0,0,0,0],
  7:  [4,3,3,1,0,0,0,0,0],
  8:  [4,3,3,2,0,0,0,0,0],
  9:  [4,3,3,3,1,0,0,0,0],
  10: [4,3,3,3,2,0,0,0,0],
  11: [4,3,3,3,2,1,0,0,0],
  12: [4,3,3,3,2,1,0,0,0],
  13: [4,3,3,3,2,1,1,0,0],
  14: [4,3,3,3,2,1,1,0,0],
  15: [4,3,3,3,2,1,1,1,0],
  16: [4,3,3,3,2,1,1,1,0],
  17: [4,3,3,3,2,1,1,1,1],
  18: [4,3,3,3,3,1,1,1,1],
  19: [4,3,3,3,3,2,1,1,1],
  20: [4,3,3,3,3,2,2,1,1],
};

// Slots de magia: meio-conjurador (Paladino, Patrulheiro) - começa a conjurar no nível 2
const SLOTS_MEIO_CONJURADOR = {
  1:  [0,0,0,0,0],
  2:  [2,0,0,0,0],
  3:  [3,0,0,0,0],
  4:  [3,0,0,0,0],
  5:  [4,2,0,0,0],
  6:  [4,2,0,0,0],
  7:  [4,3,0,0,0],
  8:  [4,3,0,0,0],
  9:  [4,3,2,0,0],
  10: [4,3,2,0,0],
  11: [4,3,3,0,0],
  12: [4,3,3,0,0],
  13: [4,3,3,1,0],
  14: [4,3,3,1,0],
  15: [4,3,3,2,0],
  16: [4,3,3,2,0],
  17: [4,3,3,3,1],
  18: [4,3,3,3,1],
  19: [4,3,3,3,2],
  20: [4,3,3,3,2],
};

// Pacto Mágico do Bruxo (slots, todos do nível mais alto disponível)
const SLOTS_BRUXO = {
  1: { slots: 1, nivel: 1 }, 2: { slots: 2, nivel: 1 }, 3: { slots: 2, nivel: 2 },
  4: { slots: 2, nivel: 2 }, 5: { slots: 2, nivel: 3 }, 6: { slots: 2, nivel: 3 },
  7: { slots: 2, nivel: 4 }, 8: { slots: 2, nivel: 4 }, 9: { slots: 2, nivel: 5 },
  10: { slots: 2, nivel: 5 }, 11: { slots: 3, nivel: 5 }, 12: { slots: 3, nivel: 5 },
  13: { slots: 3, nivel: 5 }, 14: { slots: 3, nivel: 5 }, 15: { slots: 3, nivel: 5 },
  16: { slots: 3, nivel: 5 }, 17: { slots: 4, nivel: 5 }, 18: { slots: 4, nivel: 5 },
  19: { slots: 4, nivel: 5 }, 20: { slots: 4, nivel: 5 },
};

const PB = n => Math.ceil(n / 4) + 1; // bônus de proficiência por nível

function montarNiveis(featuresPorNivel, opcoes = {}) {
  const niveis = [];
  for (let n = 1; n <= 20; n++) {
    niveis.push({
      nivel: n,
      bonusProf: PB(n),
      caracteristicas: featuresPorNivel[n] || [],
      slotsMagia: opcoes.slots ? opcoes.slots[n] : null,
      pactoBruxo: opcoes.pacto ? opcoes.pacto[n] : null,
    });
  }
  return niveis;
}

const CLASSES = {
  guerreiro: {
    nome: 'Guerreiro',
    dadoVida: 'd10',
    salvaguardas: ['Força', 'Constituição'],
    pericias: 'Escolha 2: Acrobacia, Adestrar Animais, Atletismo, História, Intuição, Intimidação, Percepção e Sobrevivência',
    niveis: montarNiveis({
      1: ['Estilo de Luta', 'Retomar o Fôlego'],
      2: ['Surto de Ação (1 uso)'],
      3: ['Arquétipo Marcial (escolha de subclasse)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Ataque Extra (2 ataques)'],
      6: ['Aprimoramento de Habilidade (ASI)'],
      7: ['Característica de Arquétipo Marcial'],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: ['Indomável (1 uso)'],
      10: ['Característica de Arquétipo Marcial'],
      11: ['Ataque Extra (3 ataques)'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: ['Indomável (2 usos)'],
      14: ['Aprimoramento de Habilidade (ASI)'],
      15: ['Característica de Arquétipo Marcial'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Surto de Ação (2 usos)', 'Indomável (3 usos)'],
      18: ['Característica de Arquétipo Marcial'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Ataque Extra (4 ataques)'],
    }),
  },

  mago: {
    nome: 'Mago',
    dadoVida: 'd6',
    salvaguardas: ['Inteligência', 'Sabedoria'],
    pericias: 'Escolha 2: Arcanismo, História, Intuição, Investigação, Medicina e Religião',
    niveis: montarNiveis({
      1: ['Conjuração', 'Recuperação Arcana'],
      2: ['Tradição Arcana (escolha de subclasse)'],
      3: [],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: [],
      6: ['Característica de Tradição Arcana'],
      7: [],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: ['Magias de 5º Círculo (1 espaço novo)'],
      10: ['Característica de Tradição Arcana'],
      11: ['Magias de 6º Círculo (1 espaço novo)'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: ['Magias de 7º Círculo (1 espaço novo)'],
      14: ['Característica de Tradição Arcana (último poder da Escola)'],
      15: ['Magias de 8º Círculo (1 espaço novo)'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Magias de 9º Círculo (1 espaço novo)'],
      18: ['Domínio de Magia'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Magias-Assinatura'],
    }, { slots: SLOTS_CONJURADOR_COMPLETO }),
  },

  ladino: {
    nome: 'Ladino',
    dadoVida: 'd8',
    salvaguardas: ['Destreza', 'Inteligência'],
    pericias: 'Escolha 4: Acrobacia, Atletismo, Atuação, Enganação, Furtividade, História, Intimidação, Intuição, Investigação, Percepção, Persuasão e Prestidigitação',
    niveis: montarNiveis({
      1: ['Perícia (proficiência dobrada em 2 perícias)', 'Ataque Furtivo (1d6)', 'Gíria de Ladrão'],
      2: ['Ação Ardilosa'],
      3: ['Arquétipo de Ladino (escolha de subclasse)', 'Ataque Furtivo (2d6)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Esquiva Sobrenatural', 'Ataque Furtivo (3d6)'],
      6: ['Especialização (proficiência dobrada em mais 2 perícias)'],
      7: ['Evasão', 'Ataque Furtivo (4d6)'],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: ['Característica de Arquétipo de Ladino', 'Ataque Furtivo (5d6)'],
      10: ['Aprimoramento de Habilidade (ASI)'],
      11: ['Talento Confiável', 'Ataque Furtivo (6d6)'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: ['Característica de Arquétipo de Ladino', 'Ataque Furtivo (7d6)'],
      14: ['Sentido às Cegas (Blindsense)'],
      15: ['Mente Escorregadia (proficiência em salvas de Sabedoria)', 'Ataque Furtivo (8d6)'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Característica de Arquétipo de Ladino', 'Ataque Furtivo (9d6)'],
      18: ['Elusivo'],
      19: ['Aprimoramento de Habilidade (ASI)', 'Ataque Furtivo (10d6)'],
      20: ['Golpe de Sorte'],
    }),
  },

  clerigo: {
    nome: 'Clérigo',
    dadoVida: 'd8',
    salvaguardas: ['Sabedoria', 'Carisma'],
    pericias: 'Escolha 2: História, Intuição, Medicina, Persuasão e Religião',
    niveis: montarNiveis({
      1: ['Conjuração', 'Domínio Divino (escolha de subclasse)'],
      2: ['Canalizar Divindade (1 uso)', 'Característica de Domínio Divino'],
      3: [],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Destruir Mortos-Vivos (ND ½)'],
      6: ['Canalizar Divindade (2 usos)', 'Característica de Domínio Divino'],
      7: [],
      8: ['Aprimoramento de Habilidade (ASI)', 'Destruir Mortos-Vivos (ND 1)', 'Característica de Domínio Divino'],
      9: [],
      10: ['Intervenção Divina'],
      11: ['Destruir Mortos-Vivos (ND 2)'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: [],
      14: ['Destruir Mortos-Vivos (ND 3)'],
      15: [],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Destruir Mortos-Vivos (ND 4)', 'Característica de Domínio Divino'],
      18: ['Canalizar Divindade (3 usos)'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Intervenção Divina Aprimorada'],
    }, { slots: SLOTS_CONJURADOR_COMPLETO }),
  },

  bardo: {
    nome: 'Bardo',
    dadoVida: 'd8',
    salvaguardas: ['Destreza', 'Carisma'],
    pericias: 'Escolha 3 quaisquer perícias',
    niveis: montarNiveis({
      1: ['Conjuração', 'Inspiração de Bardo (d6)'],
      2: ['Versatilidade (Jack of All Trades)', 'Recuperação de Canção'],
      3: ['Colégio de Bardo (escolha de subclasse)', 'Especialização (Expertise)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Inspiração de Bardo (d8)', 'Fonte de Inspiração'],
      6: ['Contraencanto', 'Característica de Colégio de Bardo'],
      7: [],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: [],
      10: ['Inspiração de Bardo (d10)', 'Especialização (mais perícias)', 'Segredos Mágicos'],
      11: [],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: [],
      14: ['Característica de Colégio de Bardo', 'Segredos Mágicos'],
      15: ['Inspiração de Bardo (d12)'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: [],
      18: ['Segredos Mágicos'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Inspiração Suprema'],
    }, { slots: SLOTS_CONJURADOR_COMPLETO }),
  },

  barbaro: {
    nome: 'Bárbaro',
    dadoVida: 'd12',
    salvaguardas: ['Força', 'Constituição'],
    pericias: 'Escolha 2: Adestrar Animais, Atletismo, Intimidação, Natureza, Percepção e Sobrevivência',
    niveis: montarNiveis({
      1: ['Furor (2 usos)', 'Defesa sem Armadura'],
      2: ['Ataque Descuidado', 'Sentido de Perigo'],
      3: ['Trajetória Primitiva (escolha de subclasse)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Ataque Extra (2 ataques)', 'Movimento Rápido'],
      6: ['Furor (3 usos)', 'Característica de Trajetória Primitiva'],
      7: ['Instinto Selvagem'],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: ['Crítico Selvagem (1 dado extra)', 'Furor (4 usos)'],
      10: ['Característica de Trajetória Primitiva'],
      11: ['Furor Implacável'],
      12: ['Aprimoramento de Habilidade (ASI)', 'Furor (5 usos)'],
      13: ['Crítico Selvagem (2 dados extras)'],
      14: ['Instinto Selvagem Aprimorado'],
      15: ['Furia Persistente'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Furor (Ilimitado)', 'Crítico Selvagem (3 dados extras)'],
      18: ['Corpo Indomável'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Força Primitiva (Força e Constituição 24)'],
    }),
  },

  druida: {
    nome: 'Druida',
    dadoVida: 'd8',
    salvaguardas: ['Inteligência', 'Sabedoria'],
    pericias: 'Escolha 2: Adestrar Animais, Arcanismo, Intuição, Medicina, Natureza, Percepção, Religião e Sobrevivência',
    niveis: montarNiveis({
      1: ['Druídico', 'Conjuração'],
      2: ['Forma Selvagem (2 usos)', 'Círculo Druídico (escolha de subclasse)'],
      3: [],
      4: ['Aprimoramento de Habilidade (ASI)', 'Forma Selvagem (CD 1, melhora)'],
      5: [],
      6: ['Característica de Círculo Druídico'],
      7: [],
      8: ['Aprimoramento de Habilidade (ASI)', 'Forma Selvagem (CD 2, melhora)'],
      9: [],
      10: ['Característica de Círculo Druídico'],
      11: [],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: [],
      14: ['Característica de Círculo Druídico'],
      15: [],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: [],
      18: ['Conjuração Atemporal (Forma Selvagem)'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Arquidruida (Forma Selvagem ilimitada)'],
    }, { slots: SLOTS_CONJURADOR_COMPLETO }),
  },

  monge: {
    nome: 'Monge',
    dadoVida: 'd8',
    salvaguardas: ['Força', 'Destreza'],
    pericias: 'Escolha 2: Acrobacia, Atletismo, História, Intuição, Religião e Furtividade',
    niveis: montarNiveis({
      1: ['Defesa sem Armadura', 'Artes Marciais'],
      2: ['Ki (2 pontos)', 'Movimento sem Armadura (+10ft)'],
      3: ['Tradição Monástica (escolha de subclasse)', 'Defletir Projéteis'],
      4: ['Aprimoramento de Habilidade (ASI)', 'Queda Lenta'],
      5: ['Ataque Extra (2 ataques)', 'Golpe Atordoante'],
      6: ['Ataques de Ki Surreais', 'Característica de Tradição Monástica'],
      7: ['Evasão', 'Quietude da Mente'],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: ['Movimento sem Armadura Melhorado'],
      10: ['Purificar o Corpo (imune a doenças/veneno)'],
      11: ['Característica de Tradição Monástica'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: ['Língua do Sol e da Lua (telepatia)'],
      14: ['Diamond Soul (resistência mágica)'],
      15: ['Corpo Atemporal'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Característica de Tradição Monástica'],
      18: ['Corpo Vazio (1 uso)'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Mente e Corpo Perfeitos (Força/Destreza/Sabedoria 25)'],
    }),
  },

  paladino: {
    nome: 'Paladino',
    dadoVida: 'd10',
    salvaguardas: ['Sabedoria', 'Carisma'],
    pericias: 'Escolha 2: Atletismo, Intimidação, História, Intuição, Medicina, Persuasão e Religião',
    niveis: montarNiveis({
      1: ['Sentido Divino', 'Cura pelas Mãos'],
      2: ['Estilo de Luta', 'Conjuração', 'Punição Divina'],
      3: ['Juramento Sagrado (escolha de subclasse)', 'Saúde Divina (imune a doenças)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Ataque Extra (2 ataques)'],
      6: ['Aura de Proteção'],
      7: ['Característica de Juramento Sagrado'],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: [],
      10: ['Aura de Coragem'],
      11: ['Punição Divina Aprimorada'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: [],
      14: ['Toque Purificador'],
      15: ['Característica de Juramento Sagrado'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: [],
      18: ['Auras Aprimoradas (alcance 30ft)'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Característica de Juramento Sagrado (capacidade lendária)'],
    }, { slots: SLOTS_MEIO_CONJURADOR }),
  },

  patrulheiro: {
    nome: 'Patrulheiro',
    dadoVida: 'd10',
    salvaguardas: ['Força', 'Destreza'],
    pericias: 'Escolha 3: Adestrar Animais, Atletismo, Furtividade, Intuição, Investigação, Natureza, Percepção, Sobrevivência',
    niveis: montarNiveis({
      1: ['Inimigo Predileto', 'Explorador Nato'],
      2: ['Estilo de Luta', 'Conjuração'],
      3: ['Arquétipo de Patrulheiro (escolha de subclasse)', 'Consciência Primitiva'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Ataque Extra (2 ataques)'],
      6: ['Inimigo Predileto e Explorador Nato (melhoria)'],
      7: ['Característica de Arquétipo de Patrulheiro'],
      8: ['Aprimoramento de Habilidade (ASI)', 'Passos Ágeis'],
      9: [],
      10: ['Explorador Nato (melhoria)', 'Esconder-se em Plena Vista'],
      11: ['Característica de Arquétipo de Patrulheiro'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: [],
      14: ['Inimigo Predileto (melhoria)', 'Desaparecer'],
      15: ['Característica de Arquétipo de Patrulheiro'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: [],
      18: ['Sentidos Ferinos'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Caçador Supremo (ataques extras contra inimigo predileto)'],
    }, { slots: SLOTS_MEIO_CONJURADOR }),
  },

  feiticeiro: {
    nome: 'Feiticeiro',
    dadoVida: 'd6',
    salvaguardas: ['Constituição', 'Carisma'],
    pericias: 'Escolha 2: Arcanismo, Enganação, Intuição, Intimidação, Persuasão e Religião',
    niveis: montarNiveis({
      1: ['Conjuração', 'Origem Mágica (escolha de subclasse)'],
      2: ['Fontes de Feitiçaria (2 pontos)'],
      3: ['Metamagia (2 opções)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: [],
      6: ['Característica de Origem Mágica'],
      7: [],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: [],
      10: ['Metamagia (3 opções)'],
      11: ['Magia Marcante (1 magia de 6º círculo)'],
      12: ['Aprimoramento de Habilidade (ASI)'],
      13: [],
      14: ['Característica de Origem Mágica'],
      15: [],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Metamagia (4 opções)', 'Magia Marcante (1 magia de 8º círculo)'],
      18: ['Característica de Origem Mágica'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Restauração de Feitiçaria (recupera pontos em descanso curto)'],
    }, { slots: SLOTS_CONJURADOR_COMPLETO }),
  },

  bruxo: {
    nome: 'Bruxo',
    dadoVida: 'd8',
    salvaguardas: ['Sabedoria', 'Carisma'],
    pericias: 'Escolha 2: Arcanismo, Enganação, História, Intimidação, Investigação, Natureza e Religião',
    niveis: montarNiveis({
      1: ['Patrono Sobrenatural (escolha de subclasse)', 'Magia de Pacto'],
      2: ['Invocações Mágicas (2)'],
      3: ['Pacto Místico (escolha)'],
      4: ['Aprimoramento de Habilidade (ASI)'],
      5: ['Invocações Mágicas (3)'],
      6: ['Característica de Patrono Sobrenatural'],
      7: ['Invocações Mágicas (4)'],
      8: ['Aprimoramento de Habilidade (ASI)'],
      9: ['Invocações Mágicas (5)'],
      10: ['Característica de Patrono Sobrenatural'],
      11: ['Arcano Místico (magia extra de 6º círculo, 1/dia)'],
      12: ['Aprimoramento de Habilidade (ASI)', 'Invocações Mágicas (6)'],
      13: ['Arcano Místico (magia extra de 7º círculo)'],
      14: ['Característica de Patrono Sobrenatural'],
      15: ['Arcano Místico (magia extra de 8º círculo)', 'Invocações Mágicas (7)'],
      16: ['Aprimoramento de Habilidade (ASI)'],
      17: ['Arcano Místico (magia extra de 9º círculo)'],
      18: ['Invocações Mágicas (8)'],
      19: ['Aprimoramento de Habilidade (ASI)'],
      20: ['Mestre dos Mistérios (1 magia de qualquer círculo, 1/dia)'],
    }, { pacto: SLOTS_BRUXO }),
  },
};

// =====================================================
// RAÇAS do Livro do Jogador (PHB) - com subraças
// =====================================================
const RACAS = [
  { grupo: 'Anão', opcoes: ['Anão da Colina', 'Anão da Montanha'] },
  { grupo: 'Elfo', opcoes: ['Alto Elfo', 'Elfo da Floresta', 'Drow (Elfo Negro)'] },
  { grupo: 'Halfling', opcoes: ['Halfling Pés-Leves', 'Halfling Robusto'] },
  { grupo: 'Humano', opcoes: ['Humano', 'Humano (Variante)'] },
  { grupo: 'Draconato', opcoes: ['Draconato'] },
  { grupo: 'Gnomo', opcoes: ['Gnomo da Floresta', 'Gnomo das Rochas'] },
  { grupo: 'Meio-Elfo', opcoes: ['Meio-Elfo'] },
  { grupo: 'Meio-Orc', opcoes: ['Meio-Orc'] },
  { grupo: 'Tiefling', opcoes: ['Tiefling'] },
];

// Preenche um <select> com as 12 classes do PHB
function preencherSelectClasses(sel) {
  if (!sel) return;
  sel.innerHTML = '<option value="">— Selecione —</option>';
  Object.values(CLASSES).forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.nome;
    opt.textContent = `${getClasseIcone(c.nome)} ${c.nome}`;
    sel.appendChild(opt);
  });
}

// Preenche um <select> com as raças do PHB (subraças agrupadas)
function preencherSelectRacas(sel) {
  if (!sel) return;
  sel.innerHTML = '<option value="">— Selecione —</option>';
  RACAS.forEach(g => {
    if (g.opcoes.length === 1) {
      const opt = document.createElement('option');
      opt.value = g.opcoes[0];
      opt.textContent = g.opcoes[0];
      sel.appendChild(opt);
    } else {
      const og = document.createElement('optgroup');
      og.label = g.grupo;
      g.opcoes.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o;
        opt.textContent = o;
        og.appendChild(opt);
      });
      sel.appendChild(og);
    }
  });
}
