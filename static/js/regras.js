// =====================================================
// MOTOR DE REGRAS 5e - proficiências, progressão de magias, penalidades
// Usa CLASSES (classes.js), MAGIAS_DETALHE (compendio.js), ARMADURAS/ITENS (dados5e/itens)
// =====================================================

// ---------- PROFICIÊNCIAS DE ARMADURA ----------
// categorias: 'leve','media','pesada','escudo'
const PROF_ARMADURA = {
  'Bárbaro': ['leve', 'media', 'escudo'],
  'Bardo': ['leve'],
  'Clérigo': ['leve', 'media', 'escudo'],
  'Druida': ['leve', 'media', 'escudo'],
  'Guerreiro': ['leve', 'media', 'pesada', 'escudo'],
  'Monge': [],
  'Paladino': ['leve', 'media', 'pesada', 'escudo'],
  'Patrulheiro': ['leve', 'media', 'escudo'],
  'Ladino': ['leve'],
  'Feiticeiro': [],
  'Mago': [],
  'Bruxo': ['leve'],
};

// ---------- PROFICIÊNCIAS DE ARMA ----------
// 'marcial' = todas; 'simples' = só simples; 'simples+' = simples + algumas marciais leves
const PROF_ARMA = {
  'Bárbaro': 'marcial', 'Guerreiro': 'marcial', 'Paladino': 'marcial', 'Patrulheiro': 'marcial',
  'Ladino': 'simples+', 'Bardo': 'simples+', 'Monge': 'simples+',
  'Clérigo': 'simples', 'Druida': 'simples', 'Feiticeiro': 'simples', 'Mago': 'simples', 'Bruxo': 'simples',
};

// Tipo de cada arma do catálogo
const ARMA_TIPO = {
  'Adaga': 'simples', 'Machadinha': 'simples', 'Maça': 'simples', 'Martelo Leve': 'simples',
  'Lança': 'simples', 'Bastão': 'simples', 'Arco Curto': 'simples',
  'Espada Longa': 'marcial', 'Espada Curta': 'marcial+', 'Machado de Batalha': 'marcial', 'Espadão': 'marcial',
  'Machado Grande': 'marcial', 'Rapieira': 'marcial+', 'Arco Longo': 'marcial', 'Besta Leve': 'simples',
  'Besta Pesada': 'marcial', 'Alabarda': 'marcial',
};
// Armas marciais "leves/de acuidade" que classes simples+ também usam
const ARMAS_SIMPLES_MAIS = ['Espada Curta', 'Rapieira'];

// Força mínima para armaduras pesadas (abaixo: deslocamento -3m)
const FORCA_MIN_ARMADURA = { 'Cota de Malha': 13, 'Cota de Bandas': 15, 'Cota de Placas': 15 };

function categoriaArmadura(nome) {
  if (nome === 'Escudo') return 'escudo';
  const a = (typeof ARMADURAS !== 'undefined') ? ARMADURAS[nome] : null;
  return a ? a.tipo : null;
}

function proficienteArmadura(classe, armaduraNome) {
  if (!armaduraNome || armaduraNome === 'Sem armadura') return true;
  const cat = categoriaArmadura(armaduraNome);
  return (PROF_ARMADURA[classe] || []).includes(cat);
}

function proficienteArma(classe, armaNome) {
  const tipo = ARMA_TIPO[armaNome];
  if (!tipo) return true; // item não-arma ou desconhecido: não penaliza
  const prof = PROF_ARMA[classe] || 'simples';
  if (prof === 'marcial') return true;
  if (tipo.startsWith('simples')) return true;
  if (prof === 'simples+' && ARMAS_SIMPLES_MAIS.includes(armaNome)) return true;
  return false; // marcial sem proficiência
}

// Avisos/penalidades de equipamento (sobrepeso e falta de proficiência)
function penalidadesEquipamento(ficha) {
  const avisos = [];
  const classe = ficha.classe;
  if (ficha.armadura && ficha.armadura !== 'Sem armadura' && !proficienteArmadura(classe, ficha.armadura)) {
    avisos.push({ tipo: 'armadura', texto: `Sem proficiência com ${ficha.armadura}: desvantagem em testes, ataques e salvas de Força e Destreza, e não pode conjurar magias.` });
  }
  if (ficha.escudo && !(PROF_ARMADURA[classe] || []).includes('escudo')) {
    avisos.push({ tipo: 'escudo', texto: 'Sem proficiência com escudo: penalidade ao usá-lo.' });
  }
  const fmin = FORCA_MIN_ARMADURA[ficha.armadura];
  if (fmin && (ficha.atributos.for || 10) < fmin) {
    avisos.push({ tipo: 'sobrepeso', texto: `Força ${ficha.atributos.for} abaixo do exigido (${fmin}) para ${ficha.armadura}: deslocamento −3m (sobrepeso).`, deslocamento: -3 });
  }
  (ficha.itens || []).forEach(it => {
    if (ARMA_TIPO[it] && !proficienteArma(classe, it)) {
      avisos.push({ tipo: 'arma', texto: `Sem proficiência com ${it}: você não soma o bônus de proficiência ao ataque.` });
    }
  });
  return avisos;
}

// ---------- DANO DE ARMA ----------
// Extrai dano/propriedades de um item de arma do catálogo
function dadosArma(nome) {
  const item = (typeof ITENS_PADRAO !== 'undefined') ? ITENS_PADRAO.find(i => i.nome === nome) : null;
  if (!item || item.categoria !== 'Arma') return null;
  const d = item.descricao || '';
  const dano = (d.match(/(\d+d\d+)/) || [])[1] || '1d4';
  const tipoDano = (d.match(/(corte|perfurante|concuss[aã]o)/i) || [])[1] || '';
  const acuidade = /acuidade/i.test(d);
  const distancia = /muni[cç][aã]o|arremesso|alcance \(/i.test(d) || /Arco|Besta|Funda/i.test(nome);
  return { dano, tipoDano, acuidade, distancia };
}

// Ataque de arma calculado para um personagem
function ataqueArma(ficha, nome, pb) {
  const da = dadosArma(nome);
  if (!da) return null;
  const forMod = mod(ficha.atributos.for), desMod = mod(ficha.atributos.des);
  const usaDes = da.distancia || (da.acuidade && desMod > forMod);
  const atrMod = usaDes ? desMod : forMod;
  const prof = proficienteArma(ficha.classe, nome) ? pb : 0;
  const ataque = atrMod + prof;
  return { nome, dano: `${da.dano}${atrMod >= 0 ? '+' : ''}${atrMod} ${da.tipoDano}`, ataque, semProf: prof === 0 };
}

// =====================================================
// PROGRESSÃO DE MAGIAS
// =====================================================
const CANTRIPS_CONHECIDOS = {
  'Bardo': [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  'Clérigo': [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  'Druida': [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
  'Feiticeiro': [4,4,4,5,5,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6],
  'Mago': [3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5],
  'Bruxo': [2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
};
// Magias "conhecidas" (conjuradores de lista fixa)
const MAGIAS_CONHECIDAS_TAB = {
  'Bardo': [4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],
  'Feiticeiro': [2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],
  'Bruxo': [2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],
  'Patrulheiro': [0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11],
};
// Conjuradores que preparam da lista inteira (não "compram" lista fixa)
const PREPARA = { 'Clérigo': 'sab', 'Druida': 'sab', 'Mago': 'int', 'Paladino': 'car' };

function chaveDeClasse(classe) { return CLASSE_NOME_PARA_CHAVE[classe]; }

// Maior círculo de magia acessível
function maxCirculo(classe, nivel) {
  const c = CLASSES[chaveDeClasse(classe)];
  if (!c) return 0;
  const nd = c.niveis.find(n => n.nivel === nivel);
  if (!nd) return 0;
  if (nd.pactoBruxo) return nd.pactoBruxo.nivel;
  if (nd.slotsMagia) { for (let i = nd.slotsMagia.length - 1; i >= 0; i--) if (nd.slotsMagia[i] > 0) return i + 1; }
  return 0;
}

function ehConjurador(classe, nivel) {
  return maxCirculo(classe, nivel) > 0 || (CANTRIPS_CONHECIDOS[classe] && CANTRIPS_CONHECIDOS[classe][nivel - 1] > 0);
}

// Quantos truques o personagem deve conhecer neste nível
function truquesNoNivel(classe, nivel) {
  const t = CANTRIPS_CONHECIDOS[classe];
  return t ? (t[nivel - 1] || 0) : 0;
}

// Quantas magias (de círculo) o personagem deve conhecer/preparar neste nível
function magiasNoNivel(classe, nivel, attrs) {
  if (MAGIAS_CONHECIDAS_TAB[classe]) return MAGIAS_CONHECIDAS_TAB[classe][nivel - 1] || 0;
  if (PREPARA[classe]) {
    const m = mod(attrs[PREPARA[classe]]);
    if (classe === 'Paladino') return Math.max(1, Math.floor(nivel / 2) + m);
    return Math.max(1, nivel + m);
  }
  return 0;
}

// Lista de magias que a CLASSE pode aprender (por nome), por círculo
const MAGIAS_CLASSES = {
  // Truques
  'Raio de Gelo': ['Mago', 'Feiticeiro'], 'Rajada de Fogo': ['Mago', 'Feiticeiro'], 'Toque Chocante': ['Mago', 'Feiticeiro', 'Bruxo'],
  'Chama Sagrada': ['Clérigo'], 'Zombaria Viciosa': ['Bardo', 'Bruxo'], 'Rajada Sobrenatural': ['Bruxo'],
  'Produzir Chamas': ['Druida'], 'Luz': ['Bardo', 'Clérigo', 'Feiticeiro', 'Mago'], 'Mão Mágica': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'],
  'Prestidigitação': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Orientação': ['Clérigo', 'Druida'], 'Resistência': ['Clérigo', 'Druida'],
  'Taumaturgia': ['Clérigo'], 'Mensagem': ['Bardo', 'Feiticeiro', 'Mago'], 'Florescer (Druidcraft)': ['Druida'], 'Aríete Espinhento (Shillelagh)': ['Druida'],
  // 1º
  'Mísseis Mágicos': ['Mago', 'Feiticeiro'], 'Escudo Arcano (Shield)': ['Mago', 'Feiticeiro'], 'Sono': ['Bardo', 'Feiticeiro', 'Mago'],
  'Detectar Magia': ['Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago', 'Paladino', 'Patrulheiro'], 'Armadura do Mago (Mage Armor)': ['Mago', 'Feiticeiro'],
  'Enfeitiçar Pessoa (Charm Person)': ['Bardo', 'Bruxo', 'Druida', 'Feiticeiro', 'Mago'], 'Compreender Idiomas': ['Bardo', 'Feiticeiro', 'Mago', 'Bruxo'],
  'Salto': ['Druida', 'Feiticeiro', 'Mago', 'Patrulheiro'], 'Passos Longos (Longstrider)': ['Bardo', 'Druida', 'Mago', 'Patrulheiro'],
  'Curar Ferimentos': ['Bardo', 'Clérigo', 'Druida', 'Paladino', 'Patrulheiro'], 'Palavra Curativa': ['Bardo', 'Clérigo', 'Druida'],
  'Escudo da Fé': ['Clérigo', 'Paladino'], 'Bênção (Bless)': ['Clérigo', 'Paladino'], 'Comando': ['Clérigo', 'Paladino'],
  'Perdição (Bane)': ['Bardo', 'Clérigo'], 'Detectar o Mal e o Bem': ['Clérigo', 'Paladino'], 'Mãos Flamejantes': ['Mago', 'Feiticeiro'],
  'Dardo Flamejante (Faerie Fire)': ['Bardo', 'Druida'], 'Falar com Animais': ['Bardo', 'Druida', 'Patrulheiro'], 'Emaranhar (Entangle)': ['Druida'],
  'Cura por Toque (Goodberry)': ['Druida', 'Patrulheiro'], 'Nevoeiro (Fog Cloud)': ['Druida', 'Feiticeiro', 'Mago', 'Patrulheiro'],
  'Comando Heroico (Heroism)': ['Bardo', 'Paladino'], 'Dissonância Sussurrada': ['Bardo'], 'Maldição Profana (Hex)': ['Bruxo'],
  'Seta Encantada (Witch Bolt)': ['Bruxo', 'Feiticeiro', 'Mago'], 'Repreensão Infernal (Hellish Rebuke)': ['Bruxo'],
  'Proteção contra o Mal e o Bem': ['Clérigo', 'Druida', 'Mago', 'Paladino', 'Bruxo'], 'Marca do Caçador (Hunter\'s Mark)': ['Patrulheiro'],
  'Golpe Furioso (Searing Smite)': ['Paladino'], 'Detectar Veneno e Doença': ['Druida', 'Paladino', 'Patrulheiro'],
  // 2º
  'Aranha (Web)': ['Feiticeiro', 'Mago'], 'Imagem Espelhada': ['Bruxo', 'Feiticeiro', 'Mago'], 'Restauração Menor': ['Bardo', 'Clérigo', 'Druida', 'Paladino', 'Patrulheiro'],
  'Raio Ardente (Scorching Ray)': ['Feiticeiro', 'Mago'], 'Invisibilidade': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Passo Enevoado (Misty Step)': ['Bruxo', 'Feiticeiro', 'Mago'],
  'Imobilizar Pessoa (Hold Person)': ['Bardo', 'Bruxo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago'], 'Arma Espiritual': ['Clérigo'],
  'Auxílio (Aid)': ['Clérigo', 'Paladino'], 'Embaçar (Blur)': ['Feiticeiro', 'Mago'],
  // 3º
  'Bola de Fogo': ['Feiticeiro', 'Mago'], 'Relâmpago': ['Feiticeiro', 'Mago'], 'Voo': ['Bruxo', 'Feiticeiro', 'Mago'],
  'Contramágica (Counterspell)': ['Bruxo', 'Feiticeiro', 'Mago'], 'Dissipar Magia (Dispel Magic)': ['Bardo', 'Bruxo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago', 'Paladino'],
  'Revivificar (Revivify)': ['Clérigo', 'Paladino'], 'Velocidade (Haste)': ['Feiticeiro', 'Mago'], 'Medo (Fear)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'],
  'Proteção contra Energia': ['Clérigo', 'Druida', 'Feiticeiro', 'Mago', 'Patrulheiro'], 'Restauração Maior': ['Bardo', 'Clérigo', 'Druida'],
  // 4º
  'Tempestade de Gelo (Ice Storm)': ['Druida', 'Feiticeiro', 'Mago'], 'Muralha de Fogo (Wall of Fire)': ['Druida', 'Feiticeiro', 'Mago'],
  'Porta Dimensional (Dimension Door)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Banimento (Banishment)': ['Clérigo', 'Feiticeiro', 'Mago', 'Paladino', 'Bruxo'],
  'Invisibilidade Maior': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Polimorfia (Polymorph)': ['Bardo', 'Druida', 'Feiticeiro', 'Mago'], 'Liberdade de Movimento': ['Bardo', 'Clérigo', 'Druida', 'Patrulheiro'],
  // 5º
  'Cone de Frio (Cone of Cold)': ['Feiticeiro', 'Mago'], 'Reviver Mortos (Raise Dead)': ['Bardo', 'Clérigo', 'Paladino'], 'Telecinésia (Telekinesis)': ['Feiticeiro', 'Mago'],
  'Muralha de Pedra': ['Druida', 'Feiticeiro', 'Mago'], 'Praga de Insetos (Insect Plague)': ['Clérigo', 'Druida', 'Feiticeiro'], 'Dominar Pessoa': ['Bardo', 'Feiticeiro', 'Mago'],
  'Nuvem Mortal (Cloudkill)': ['Feiticeiro', 'Mago'],
  // 6º
  'Desintegrar (Disintegrate)': ['Feiticeiro', 'Mago'], 'Cura em Massa (Heal)': ['Clérigo', 'Druida'], 'Corrente de Relâmpagos (Chain Lightning)': ['Feiticeiro', 'Mago'],
  'Globo de Invulnerabilidade': ['Feiticeiro', 'Mago'], 'Círculo da Morte (Circle of Death)': ['Bruxo', 'Feiticeiro', 'Mago'],
  // 7º
  'Dedo da Morte (Finger of Death)': ['Bruxo', 'Feiticeiro', 'Mago'], 'Tempestade de Fogo (Fire Storm)': ['Clérigo', 'Druida', 'Feiticeiro'], 'Teleporte (Teleport)': ['Bardo', 'Feiticeiro', 'Mago'], 'Regeneração': ['Bardo', 'Clérigo', 'Druida'],
  // 8º
  'Palavra de Poder: Atordoar': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Nuvem Incendiária (Incendiary Cloud)': ['Feiticeiro', 'Mago'], 'Sol Ardente (Sunburst)': ['Druida', 'Feiticeiro', 'Mago'], 'Dominar Monstro': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'],
  // 9º
  'Desejo (Wish)': ['Feiticeiro', 'Mago'], 'Parar o Tempo (Time Stop)': ['Feiticeiro', 'Mago'], 'Tempestade de Meteoros (Meteor Swarm)': ['Feiticeiro', 'Mago'], 'Palavra de Poder: Matar': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Curar em Massa (Mass Heal)': ['Clérigo'],
};

// Magias concedidas por subclasse (sempre disponíveis/preparadas)
const SUBCLASS_MAGIAS = {
  'Domínio da Vida': ['Bênção (Bless)', 'Curar Ferimentos', 'Arma Espiritual', 'Restauração Menor', 'Revivificar (Revivify)', 'Cura em Massa (Heal)'],
  'Domínio da Luz': ['Mãos Flamejantes', 'Chama Sagrada', 'Raio Ardente (Scorching Ray)', 'Bola de Fogo', 'Muralha de Fogo (Wall of Fire)'],
  'Domínio da Guerra': ['Bênção (Bless)', 'Comando', 'Arma Espiritual', 'Velocidade (Haste)'],
  'Domínio da Tempestade': ['Mãos Flamejantes', 'Relâmpago', 'Tempestade de Gelo (Ice Storm)'],
  'Domínio da Natureza': ['Falar com Animais', 'Aranha (Web)', 'Tempestade de Gelo (Ice Storm)'],
  'Círculo da Terra': ['Dardo Flamejante (Faerie Fire)', 'Névoa', 'Aranha (Web)', 'Bola de Fogo'],
  'O Corruptor (Fiend)': ['Repreensão Infernal (Hellish Rebuke)', 'Mãos Flamejantes', 'Bola de Fogo', 'Muralha de Fogo (Wall of Fire)'],
  'O Arquifada (Archfey)': ['Dardo Flamejante (Faerie Fire)', 'Sono', 'Enfeitiçar Pessoa (Charm Person)', 'Medo (Fear)'],
  'O Grande Antigo (Great Old One)': ['Dissonância Sussurrada', 'Imagem Espelhada', 'Medo (Fear)', 'Dominar Pessoa'],
  'Juramento da Devoção': ['Proteção contra o Mal e o Bem', 'Escudo da Fé', 'Auxílio (Aid)'],
  'Juramento da Vingança': ['Perdição (Bane)', 'Marca do Caçador (Hunter\'s Mark)', 'Imobilizar Pessoa (Hold Person)'],
};

// Magias que a classe (+ subclasse) pode aprender, separadas em truques e círculos
function magiasDisponiveis(classe, subclasse, nivel) {
  const maxc = maxCirculo(classe, nivel);
  const truques = [], circulos = [];
  for (const nome in MAGIAS_CLASSES) {
    if (!MAGIAS_CLASSES[nome].includes(classe)) continue;
    const d = MAGIAS_DETALHE[nome]; if (!d) continue;
    if (d.nivel === 0) truques.push(nome);
    else if (d.nivel <= maxc) circulos.push(nome);
  }
  // magias bônus da subclasse (entram como sempre disponíveis)
  const bonus = (subclasse && SUBCLASS_MAGIAS[subclasse]) ? SUBCLASS_MAGIAS[subclasse].filter(n => MAGIAS_DETALHE[n] && MAGIAS_DETALHE[n].nivel <= maxc) : [];
  return { truques: [...new Set(truques)], circulos: [...new Set(circulos)], bonus };
}

// Quantos NOVOS truques / magias o personagem ganha ao subir para "nivel"
function ganhoMagias(classe, nivel, attrs) {
  const tNovo = truquesNoNivel(classe, nivel) - truquesNoNivel(classe, nivel - 1);
  let mNovo;
  if (classe === 'Mago') mNovo = (nivel === 1 ? 6 : 2); // grimório
  else mNovo = magiasNoNivel(classe, nivel, attrs) - magiasNoNivel(classe, nivel - 1, attrs);
  return { truques: Math.max(0, tNovo), magias: Math.max(0, mNovo), prepara: !!PREPARA[classe] && classe !== 'Mago' };
}
