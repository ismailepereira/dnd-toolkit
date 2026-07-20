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

// Versões "efetivas": se a ficha for multiclasse (ficha.classes com 2+
// entradas), usam a união de proficiências das classes (ver multiclasse.js:
// proficienciasEfetivas). Mono-classe cai exatamente no comportamento antigo.
function proficienteArmaduraFicha(ficha, armaduraNome) {
  if (!armaduraNome || armaduraNome === 'Sem armadura') return true;
  if (ficha.classes && ficha.classes.length > 1 && typeof proficienciasEfetivas === 'function') {
    const cat = categoriaArmadura(armaduraNome);
    return proficienciasEfetivas(ficha).armadura.includes(cat);
  }
  return proficienteArmadura(ficha.classe, armaduraNome);
}
function proficienteArmaFicha(ficha, armaNome) {
  const tipo = ARMA_TIPO[armaNome];
  if (!tipo) return true;
  if (ficha.classes && ficha.classes.length > 1 && typeof proficienciasEfetivas === 'function') {
    const nivelArma = proficienciasEfetivas(ficha).arma;
    if (nivelArma === 'marcial') return true;
    if (tipo.startsWith('simples')) return true;
    if (nivelArma === 'simples+' && ARMAS_SIMPLES_MAIS.includes(armaNome)) return true;
    return false;
  }
  return proficienteArma(ficha.classe, armaNome);
}

// Avisos/penalidades de equipamento (sobrepeso e falta de proficiência)
function penalidadesEquipamento(ficha) {
  const avisos = [];
  const classe = ficha.classe;
  const multi = !!(ficha.classes && ficha.classes.length > 1);
  const armaduraSetEfetiva = multi && typeof proficienciasEfetivas === 'function' ? proficienciasEfetivas(ficha).armadura : (PROF_ARMADURA[classe] || []);
  if (ficha.armadura && ficha.armadura !== 'Sem armadura' && !proficienteArmaduraFicha(ficha, ficha.armadura)) {
    avisos.push({ tipo: 'armadura', texto: `Sem proficiência com ${ficha.armadura}: desvantagem em testes, ataques e salvas de Força e Destreza, e não pode conjurar magias.` });
  }
  if (ficha.escudo && !armaduraSetEfetiva.includes('escudo')) {
    avisos.push({ tipo: 'escudo', texto: 'Sem proficiência com escudo: penalidade ao usá-lo.' });
  }
  const fmin = FORCA_MIN_ARMADURA[ficha.armadura];
  if (fmin && (ficha.atributos.for || 10) < fmin) {
    avisos.push({ tipo: 'sobrepeso', texto: `Força ${ficha.atributos.for} abaixo do exigido (${fmin}) para ${ficha.armadura}: deslocamento −3m (sobrepeso).`, deslocamento: -3 });
  }
  (ficha.itens || []).forEach(it => {
    if (ARMA_TIPO[it] && !proficienteArmaFicha(ficha, it)) {
      avisos.push({ tipo: 'arma', texto: `Sem proficiência com ${it}: você não soma o bônus de proficiência ao ataque.` });
    }
  });
  return avisos;
}

// ---------- DANO DE ARMA ----------
// Extrai dano/propriedades: catálogo estruturado (equipamento.js) primeiro,
// com fallback para a descrição solta da loja antiga (itens mágicos etc.)
function dadosArma(nome) {
  const it = (typeof itemCatalogo === 'function') ? itemCatalogo(nome) : null;
  if (it && it.cat === 'arma') {
    const props = it.props || [];
    const vers = (props.find(p => p.startsWith('versátil')) || '').match(/(\d+d\d+)/);
    return {
      dano: it.dano || '1d4', tipoDano: it.tipoDano || '',
      acuidade: props.includes('acuidade'),
      distancia: it.alcance === 'dist',
      leve: props.includes('leve'),
      versatil: vers ? vers[1] : null,
      maos: it.maos || 1,
    };
  }
  const item = (typeof ITENS_PADRAO !== 'undefined') ? ITENS_PADRAO.find(i => i.nome === nome) : null;
  if (!item || item.categoria !== 'Arma') return null;
  const d = item.descricao || '';
  const dano = (d.match(/(\d+d\d+)/) || [])[1] || '1d4';
  const tipoDano = (d.match(/(corte|perfurante|concuss[aã]o)/i) || [])[1] || '';
  const acuidade = /acuidade/i.test(d);
  const distancia = /muni[cç][aã]o|arremesso|alcance \(/i.test(d) || /Arco|Besta|Funda/i.test(nome);
  const versatil = (d.match(/vers[aá]til\s*\(?(\d+d\d+)/i) || [])[1] || null;
  return { dano, tipoDano, acuidade, distancia, leve: /\bleve\b/i.test(d), versatil, maos: /duas m[aã]os/i.test(d) ? 2 : 1 };
}

// Ataque de arma calculado para um personagem
// Arma versátil empunhada na mão principal com a secundária LIVRE usa o dado maior
function ataqueArma(ficha, nome, pb) {
  const da = dadosArma(nome);
  if (!da) return null;
  const forMod = mod(ficha.atributos.for), desMod = mod(ficha.atributos.des);
  const usaDes = da.distancia || (da.acuidade && desMod > forMod);
  const atrMod = usaDes ? desMod : forMod;
  const prof = proficienteArmaFicha(ficha, nome) ? pb : 0;
  const ataque = atrMod + prof;
  let dado = da.dano;
  let notaVersatil = '';
  const eq = ficha.equipado;
  if (da.versatil && eq && eq.maoPrincipal === nome && !eq.maoSecundaria) {
    dado = da.versatil;
    notaVersatil = ' (2 mãos)';
  }
  return { nome, dano: `${dado}${atrMod >= 0 ? '+' : ''}${atrMod} ${da.tipoDano}${notaVersatil}`, ataque, semProf: prof === 0 };
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

// ---------- CONJURAÇÃO 1/3 POR SUBCLASSE (Cavaleiro Arcano, Trapaceiro Arcano) ----------
// Slots parciais (círculos 1-4): começam no nível 3, vão até o 4º círculo no nível 19.
const SLOTS_TERCO = {
  3:[2,0,0,0], 4:[3,0,0,0], 5:[3,0,0,0], 6:[3,0,0,0],
  7:[4,2,0,0], 8:[4,2,0,0], 9:[4,2,0,0], 10:[4,3,0,0],
  11:[4,3,0,0], 12:[4,3,0,0], 13:[4,3,2,0], 14:[4,3,2,0],
  15:[4,3,2,0], 16:[4,3,3,0], 17:[4,3,3,0], 18:[4,3,3,0],
  19:[4,3,3,1], 20:[4,3,3,1],
};
// Magias conhecidas por nível (índice = nível-1) — igual para Cav. Arcano e Trapaceiro Arcano
const TERCO_MAGIAS_CONHECIDAS = [0,0,3,4,4,4,5,6,6,6,7,7,8,9,9,10,10,10,11,13];
// Subclasses que conjuram 1/3: lista-fonte (Mago), atributo, escolas favorecidas e truque obrigatório
const CONJURADOR_SUBCLASSE = {
  'Cavaleiro Arcano': { lista: 'Mago', atr: 'int', escolas: ['Abjuração', 'Evocação'],
    truquesTab: [0,0,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3], obrigatorio: null },
  'Trapaceiro Arcano': { lista: 'Mago', atr: 'int', escolas: ['Encantamento', 'Ilusão'],
    truquesTab: [0,0,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4], obrigatorio: 'Mão Mágica' },
};
function subclasseConjura(subclasse) { return subclasse ? CONJURADOR_SUBCLASSE[subclasse] : null; }
function slotsTerco(nivel) { return SLOTS_TERCO[nivel] || null; }

function chaveDeClasse(classe) { return CLASSE_NOME_PARA_CHAVE[classe]; }

// Maior círculo de magia acessível (subclasse opcional p/ conjuradores 1/3)
function maxCirculo(classe, nivel, subclasse) {
  const c = CLASSES[chaveDeClasse(classe)];
  if (!c) return 0;
  const nd = c.niveis.find(n => n.nivel === nivel);
  if (!nd) return 0;
  if (nd.pactoBruxo) return nd.pactoBruxo.nivel;
  if (nd.slotsMagia) { for (let i = nd.slotsMagia.length - 1; i >= 0; i--) if (nd.slotsMagia[i] > 0) return i + 1; }
  if (subclasseConjura(subclasse)) { const s = slotsTerco(nivel); if (s) { for (let i = s.length - 1; i >= 0; i--) if (s[i] > 0) return i + 1; } }
  return 0;
}

function ehConjurador(classe, nivel, subclasse) {
  return maxCirculo(classe, nivel, subclasse) > 0
    || (CANTRIPS_CONHECIDOS[classe] && CANTRIPS_CONHECIDOS[classe][nivel - 1] > 0)
    || (subclasseConjura(subclasse) && truquesNoNivel(classe, nivel, subclasse) > 0);
}

// Quantos truques o personagem deve conhecer neste nível
function truquesNoNivel(classe, nivel, subclasse) {
  const sc = subclasseConjura(subclasse);
  if (sc) return sc.truquesTab[nivel - 1] || 0;
  const t = CANTRIPS_CONHECIDOS[classe];
  return t ? (t[nivel - 1] || 0) : 0;
}

// Quantas magias (de círculo) o personagem deve conhecer/preparar neste nível
function magiasNoNivel(classe, nivel, attrs, subclasse) {
  if (subclasseConjura(subclasse)) return TERCO_MAGIAS_CONHECIDAS[nivel - 1] || 0;
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
  // lote extra — truques
  'Toque Gélido (Chill Touch)': ['Bruxo', 'Feiticeiro', 'Mago'], 'Borrifada de Veneno (Poison Spray)': ['Bruxo', 'Druida', 'Feiticeiro', 'Mago'], 'Estabilizar (Spare the Dying)': ['Clérigo', 'Druida'],
  'Ilusão Menor (Minor Illusion)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Consertar (Mending)': ['Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago'], 'Chicote de Espinhos (Thorn Whip)': ['Druida'], 'Luzes Dançantes': ['Bardo', 'Feiticeiro', 'Mago'],
  // lote extra — 1º
  'Onda Trovejante (Thunderwave)': ['Bardo', 'Druida', 'Feiticeiro', 'Mago'], 'Flecha Guiada (Guiding Bolt)': ['Clérigo'], 'Causar Ferimentos (Inflict Wounds)': ['Clérigo'], 'Orbe Cromático (Chromatic Orb)': ['Feiticeiro', 'Mago'],
  'Riso Histérico (Tasha\'s Hideous Laughter)': ['Bardo', 'Mago'], 'Borrão de Cores (Color Spray)': ['Feiticeiro', 'Mago'], 'Graxa (Grease)': ['Mago'], 'Queda Suave (Feather Fall)': ['Bardo', 'Feiticeiro', 'Mago'],
  // lote extra — 2º
  'Escuridão (Darkness)': ['Bruxo', 'Feiticeiro', 'Mago'], 'Esfera Flamejante (Flaming Sphere)': ['Druida', 'Mago'], 'Sugestão (Suggestion)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Silêncio (Silence)': ['Bardo', 'Clérigo'],
  'Raio Lunar (Moonbeam)': ['Druida'], 'Aquecer Metal (Heat Metal)': ['Bardo', 'Druida'], 'Estilhaçar (Shatter)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Passos sem Pegadas (Pass without Trace)': ['Druida', 'Patrulheiro'],
  // lote extra — 3º
  'Padrão Hipnótico (Hypnotic Pattern)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Guardiões Espirituais (Spirit Guardians)': ['Clérigo'], 'Lentidão (Slow)': ['Feiticeiro', 'Mago'], 'Nuvem Fétida (Stinking Cloud)': ['Bruxo', 'Feiticeiro', 'Mago'],
  'Animar Mortos (Animate Dead)': ['Clérigo', 'Mago'], 'Chamar Relâmpagos (Call Lightning)': ['Druida'], 'Conjurar Animais (Conjure Animals)': ['Druida', 'Patrulheiro'], 'Toque Vampírico (Vampiric Touch)': ['Bruxo', 'Mago'],
  // lote 3 — utilidade e controle
  'Respingo Ácido (Acid Splash)': ['Feiticeiro', 'Mago'], 'Identificar (Identify)': ['Bardo', 'Mago'], 'Disfarçar-se (Disguise Self)': ['Bardo', 'Feiticeiro', 'Mago'],
  'Detectar Pensamentos (Detect Thoughts)': ['Bardo', 'Feiticeiro', 'Mago'], 'Levitação (Levitate)': ['Feiticeiro', 'Mago'], 'Pés de Aranha (Spider Climb)': ['Bruxo', 'Feiticeiro', 'Mago'],
  'Ver o Invisível (See Invisibility)': ['Bardo', 'Feiticeiro', 'Mago'], 'Destrancar (Knock)': ['Bardo', 'Feiticeiro', 'Mago'], 'Ampliar/Reduzir (Enlarge/Reduce)': ['Feiticeiro', 'Mago'],
  'Clarividência (Clairvoyance)': ['Bardo', 'Clérigo', 'Feiticeiro', 'Mago'], 'Enviar Mensagem (Sending)': ['Bardo', 'Clérigo', 'Mago'], 'Idiomas (Tongues)': ['Bardo', 'Clérigo', 'Feiticeiro', 'Mago', 'Bruxo'],
  'Imagem Maior (Major Image)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Remover Maldição (Remove Curse)': ['Bruxo', 'Clérigo', 'Mago', 'Paladino'], 'Conceder Maldição (Bestow Curse)': ['Bardo', 'Bruxo', 'Clérigo', 'Mago'],
  'Confusão (Confusion)': ['Bardo', 'Druida', 'Feiticeiro', 'Mago'], 'Pele de Pedra (Stoneskin)': ['Druida', 'Feiticeiro', 'Mago', 'Patrulheiro'], 'Tentáculos Negros (Black Tentacles)': ['Mago'], 'Proteção contra a Morte (Death Ward)': ['Clérigo', 'Paladino'], 'Escudo de Fogo (Fire Shield)': ['Mago'],
  'Imobilizar Monstro (Hold Monster)': ['Bardo', 'Bruxo', 'Feiticeiro', 'Mago'], 'Cura em Massa Menor (Mass Cure Wounds)': ['Bardo', 'Clérigo', 'Druida'], 'Muralha de Força (Wall of Force)': ['Mago'], 'Golpe Flamejante (Flame Strike)': ['Clérigo'], 'Animar Objetos (Animate Objects)': ['Bardo', 'Feiticeiro', 'Mago'],
  'Banquete dos Heróis (Heroes\' Feast)': ['Clérigo', 'Druida'], 'Muralha de Gelo (Wall of Ice)': ['Mago'], 'Prismática (Prismatic Spray)': ['Feiticeiro', 'Mago'], 'Reversão da Gravidade (Reverse Gravity)': ['Druida', 'Feiticeiro', 'Mago'],

  // ===== LOTE MAGO COMPLETO (PHB) — completa a lista de magias de Mago =====
  // Truque
  'Golpe Certeiro (True Strike)': ['Mago', 'Feiticeiro', 'Bardo', 'Bruxo'],
  // 1º
  'Alarme (Alarm)': ['Mago', 'Patrulheiro'], 'Recuo Expedito (Expeditious Retreat)': ['Mago', 'Feiticeiro', 'Bruxo'], 'Vida Falsa (False Life)': ['Mago'],
  'Encontrar Familiar (Find Familiar)': ['Mago'], 'Escrita Ilusória (Illusory Script)': ['Mago', 'Bardo', 'Bruxo'], 'Raio do Enjoo (Ray of Sickness)': ['Mago', 'Feiticeiro'],
  'Imagem Silenciosa (Silent Image)': ['Mago', 'Feiticeiro', 'Bardo'], 'Disco Flutuante de Tenser (Tenser\'s Floating Disk)': ['Mago'], 'Servo Invisível (Unseen Servant)': ['Mago', 'Bardo', 'Bruxo'],
  // 2º
  'Alterar-se (Alter Self)': ['Mago', 'Feiticeiro'], 'Fechadura Arcana (Arcane Lock)': ['Mago'], 'Cegueira/Surdez (Blindness/Deafness)': ['Mago', 'Feiticeiro', 'Bardo', 'Bruxo', 'Clérigo'],
  'Chama Contínua (Continual Flame)': ['Mago', 'Clérigo'], 'Visão no Escuro (Darkvision)': ['Mago', 'Feiticeiro', 'Druida', 'Patrulheiro'], 'Repouso Tranquilo (Gentle Repose)': ['Mago', 'Clérigo'],
  'Rajada de Vento (Gust of Wind)': ['Mago', 'Druida', 'Feiticeiro'], 'Localizar Objeto (Locate Object)': ['Mago', 'Bardo', 'Clérigo', 'Druida', 'Patrulheiro'], 'Boca Mágica (Magic Mouth)': ['Mago', 'Bardo'],
  'Arma Mágica (Magic Weapon)': ['Mago', 'Paladino'], 'Aura Mágica de Nystul (Nystul\'s Magic Aura)': ['Mago'], 'Força Fantasmagórica (Phantasmal Force)': ['Mago', 'Bardo', 'Feiticeiro', 'Bruxo'],
  'Raio do Enfraquecimento (Ray of Enfeeblement)': ['Mago', 'Bruxo'], 'Truque da Corda (Rope Trick)': ['Mago'],
  // 3º
  'Lampejar (Blink)': ['Mago', 'Feiticeiro'], 'Forma Gasosa (Gaseous Form)': ['Mago', 'Feiticeiro', 'Bruxo'], 'Glifo de Vigilância (Glyph of Warding)': ['Mago', 'Bardo', 'Clérigo'],
  'Círculo Mágico (Magic Circle)': ['Mago', 'Clérigo', 'Paladino', 'Bruxo'], 'Indetectabilidade (Nondetection)': ['Mago', 'Bardo', 'Patrulheiro'], 'Corcel Fantasma (Phantom Steed)': ['Mago'],
  'Tempestade de Granizo (Sleet Storm)': ['Mago', 'Druida', 'Feiticeiro'], 'Respirar na Água (Water Breathing)': ['Mago', 'Druida', 'Feiticeiro', 'Patrulheiro'],
  // 4º
  'Olho Arcano (Arcane Eye)': ['Mago'], 'Definhar (Blight)': ['Mago', 'Druida', 'Feiticeiro', 'Bruxo'], 'Conjurar Elementais Menores (Conjure Minor Elementals)': ['Mago', 'Druida'],
  'Controlar Água (Control Water)': ['Mago', 'Clérigo', 'Druida'], 'Fabricar (Fabricate)': ['Mago'], 'Terreno Alucinatório (Hallucinatory Terrain)': ['Mago', 'Bardo', 'Druida', 'Bruxo'],
  'Localizar Criatura (Locate Creature)': ['Mago', 'Bardo', 'Clérigo', 'Druida', 'Paladino', 'Patrulheiro'], 'Assassino Fantasmagórico (Phantasmal Killer)': ['Mago', 'Bruxo'], 'Moldar Pedra (Stone Shape)': ['Mago', 'Clérigo', 'Druida'],
  // 5º
  'Mão de Bigby (Bigby\'s Hand)': ['Mago'], 'Conjurar Elemental (Conjure Elemental)': ['Mago', 'Druida'], 'Contatar Outro Plano (Contact Other Plane)': ['Mago', 'Bruxo'],
  'Criação (Creation)': ['Mago', 'Feiticeiro'], 'Sonho (Dream)': ['Mago', 'Bardo', 'Bruxo'], 'Geas (Geas)': ['Mago', 'Bardo', 'Clérigo', 'Druida', 'Paladino'],
  'Lendas (Legend Lore)': ['Mago', 'Bardo', 'Clérigo'], 'Despistar (Mislead)': ['Mago', 'Bardo'], 'Modificar Memória (Modify Memory)': ['Mago', 'Bardo'],
  'Passar pela Parede (Passwall)': ['Mago'], 'Aprisionamento Planar (Planar Binding)': ['Mago', 'Bardo', 'Clérigo', 'Druida'], 'Bisbilhotar (Scrying)': ['Mago', 'Bardo', 'Clérigo', 'Druida', 'Bruxo'],
  'Aparência (Seeming)': ['Mago', 'Bardo', 'Feiticeiro'], 'Círculo de Teleporte (Teleportation Circle)': ['Mago', 'Bardo', 'Feiticeiro'],
  // 6º
  'Portão Arcano (Arcane Gate)': ['Mago', 'Feiticeiro', 'Bruxo'], 'Contingência (Contingency)': ['Mago'], 'Criar Mortos-Vivos (Create Undead)': ['Mago', 'Clérigo', 'Bruxo'],
  'Mau-Olhado (Eyebite)': ['Mago', 'Bardo', 'Feiticeiro', 'Bruxo'], 'Carne para Pedra (Flesh to Stone)': ['Mago', 'Druida', 'Feiticeiro', 'Bruxo'], 'Receptáculo de Almas (Magic Jar)': ['Mago'],
  'Sugestão em Massa (Mass Suggestion)': ['Mago', 'Bardo', 'Feiticeiro', 'Bruxo'], 'Mover Terra (Move Earth)': ['Mago', 'Druida', 'Feiticeiro'], 'Esfera Congelante de Otiluke (Otiluke\'s Freezing Sphere)': ['Mago'],
  'Ilusão Programada (Programmed Illusion)': ['Mago', 'Bardo'], 'Raio Solar (Sunbeam)': ['Mago', 'Druida', 'Feiticeiro'], 'Visão da Verdade (True Seeing)': ['Mago', 'Bardo', 'Clérigo', 'Bruxo'],
  // 7º
  'Bola de Fogo Retardada (Delayed Blast Fireball)': ['Mago', 'Feiticeiro'], 'Forma Etérea (Etherealness)': ['Mago', 'Bardo', 'Clérigo', 'Bruxo'], 'Jaula de Força (Forcecage)': ['Mago', 'Bardo', 'Bruxo'],
  'Miragem Arcana (Mirage Arcane)': ['Mago', 'Bardo', 'Druida'], 'Mansão Magnífica de Mordenkainen (Mordenkainen\'s Magnificent Mansion)': ['Mago', 'Bardo'], 'Espada de Mordenkainen (Mordenkainen\'s Sword)': ['Mago', 'Bardo'],
  'Mudança de Plano (Plane Shift)': ['Mago', 'Clérigo', 'Druida', 'Feiticeiro', 'Bruxo'], 'Projetar Imagem (Project Image)': ['Mago', 'Bardo'], 'Sequestrar (Sequester)': ['Mago'], 'Simulacro (Simulacrum)': ['Mago'],
  'Símbolo (Symbol)': ['Mago', 'Bardo', 'Clérigo', 'Druida'],
  // 8º
  'Campo Antimagia (Antimagic Field)': ['Mago', 'Clérigo'], 'Antipatia/Simpatia (Antipathy/Sympathy)': ['Mago', 'Druida'], 'Clone (Clone)': ['Mago'],
  'Controlar o Clima (Control Weather)': ['Mago', 'Clérigo', 'Druida'], 'Semiplano (Demiplane)': ['Mago', 'Bruxo'], 'Debilitar (Feeblemind)': ['Mago', 'Druida', 'Bardo'],
  'Labirinto (Maze)': ['Mago'], 'Mente em Branco (Mind Blank)': ['Mago', 'Bardo'], 'Telepatia (Telepathy)': ['Mago'],
  // 9º
  'Projeção Astral (Astral Projection)': ['Mago', 'Clérigo', 'Bruxo'], 'Presciência (Foresight)': ['Mago', 'Bardo', 'Druida', 'Bruxo'], 'Portal (Gate)': ['Mago', 'Clérigo', 'Feiticeiro'],
  'Aprisionamento (Imprisonment)': ['Mago', 'Bruxo'], 'Muralha Prismática (Prismatic Wall)': ['Mago'], 'Metamorfose (Shapechange)': ['Mago', 'Druida'],
  'Metamorfose Verdadeira (True Polymorph)': ['Mago', 'Bardo'], 'Pavor (Weird)': ['Mago'],

  // ===== LOTE FASE 3 — listas de classe das novas magias =====
  'Golpe Trovejante (Thunderous Smite)': ['Paladino'], 'Golpe Iracundo (Wrathful Smite)': ['Paladino'],
  'Aprimorar Habilidade (Enhance Ability)': ['Bardo', 'Clérigo', 'Druida', 'Feiticeiro', 'Mago'],
  'Proteção contra Veneno (Protection from Poison)': ['Clérigo', 'Druida', 'Paladino', 'Patrulheiro', 'Feiticeiro'],
  'Lâmina Flamejante (Flame Blade)': ['Druida'], 'Crescimento de Espinhos (Spike Growth)': ['Druida', 'Patrulheiro'],
  'Augúrio (Augury)': ['Clérigo'], 'Encontrar Corcel (Find Steed)': ['Paladino'],
  'Crescimento Vegetal (Plant Growth)': ['Bardo', 'Druida', 'Patrulheiro'],
  'Luz do Dia (Daylight)': ['Clérigo', 'Druida', 'Paladino', 'Patrulheiro', 'Feiticeiro', 'Mago'],
  'Adivinhação (Divination)': ['Clérigo'], 'Crescimento Descomunal (Giant Insect)': ['Druida'],
  'Comunhão (Commune)': ['Clérigo'], 'Comunhão com a Natureza (Commune with Nature)': ['Druida', 'Patrulheiro'],
  'Praga (Contagion)': ['Clérigo', 'Druida'], 'Reencarnar (Reincarnate)': ['Druida'],
  'Barreira de Lâminas (Blade Barrier)': ['Clérigo'], 'Encontrar o Caminho (Find the Path)': ['Bardo', 'Clérigo', 'Druida'],
  'Ressurreição (Resurrection)': ['Bardo', 'Clérigo'], 'Palavra Divina (Divine Word)': ['Clérigo'],
  'Terremoto (Earthquake)': ['Clérigo', 'Druida', 'Feiticeiro'], 'Aura Sagrada (Holy Aura)': ['Clérigo'],
  'Ressurreição Verdadeira (True Resurrection)': ['Clérigo', 'Druida'], 'Tempestade Vingadora (Storm of Vengeance)': ['Druida'],
};

// Magias concedidas por subclasse (sempre disponíveis/preparadas)
const SUBCLASS_MAGIAS = {
  'Domínio da Vida': ['Bênção (Bless)', 'Curar Ferimentos', 'Arma Espiritual', 'Restauração Menor', 'Revivificar (Revivify)', 'Cura em Massa (Heal)'],
  'Domínio da Luz': ['Mãos Flamejantes', 'Chama Sagrada', 'Raio Ardente (Scorching Ray)', 'Bola de Fogo', 'Muralha de Fogo (Wall of Fire)'],
  'Domínio da Guerra': ['Bênção (Bless)', 'Comando', 'Arma Espiritual', 'Velocidade (Haste)'],
  'Domínio da Tempestade': ['Mãos Flamejantes', 'Relâmpago', 'Tempestade de Gelo (Ice Storm)'],
  'Domínio da Natureza': ['Falar com Animais', 'Aranha (Web)', 'Tempestade de Gelo (Ice Storm)'],
  'Domínio do Engano': ['Enfeitiçar Pessoa (Charm Person)', 'Imagem Espelhada', 'Lampejar (Blink)', 'Porta Dimensional (Dimension Door)', 'Modificar Memória (Modify Memory)'],
  'Domínio do Conhecimento': ['Comando', 'Identificar (Identify)', 'Sugestão (Suggestion)', 'Indetectabilidade (Nondetection)', 'Confusão (Confusion)', 'Lendas (Legend Lore)', 'Bisbilhotar (Scrying)'],
  'Círculo da Terra': ['Dardo Flamejante (Faerie Fire)', 'Névoa', 'Aranha (Web)', 'Bola de Fogo'],
  'O Corruptor (Fiend)': ['Repreensão Infernal (Hellish Rebuke)', 'Mãos Flamejantes', 'Bola de Fogo', 'Muralha de Fogo (Wall of Fire)'],
  'O Arquifada (Archfey)': ['Dardo Flamejante (Faerie Fire)', 'Sono', 'Enfeitiçar Pessoa (Charm Person)', 'Medo (Fear)'],
  'O Grande Antigo (Great Old One)': ['Dissonância Sussurrada', 'Imagem Espelhada', 'Medo (Fear)', 'Dominar Pessoa'],
  'Juramento da Devoção': ['Proteção contra o Mal e o Bem', 'Escudo da Fé', 'Auxílio (Aid)'],
  'Juramento da Vingança': ['Perdição (Bane)', 'Marca do Caçador (Hunter\'s Mark)', 'Imobilizar Pessoa (Hold Person)'],
  'Juramento dos Anciões': ['Falar com Animais', 'Passo Enevoado (Misty Step)', 'Raio Lunar (Moonbeam)', 'Proteção contra Energia', 'Tempestade de Gelo (Ice Storm)', 'Pele de Pedra (Stoneskin)'],
};

// Escolas em que as magias ficam "travadas" (Mago: a da Escola; conjurador 1/3: as favorecidas). null = sem trava.
function escolasDeFiltro(classe, subclasse) {
  const sc = subclasseConjura(subclasse);
  if (sc) return sc.escolas.slice();
  if (classe === 'Mago' && subclasse) return [subclasse.replace(/^Escola de\s*/i, '').trim()];
  return null;
}

// Magias que a classe (+ subclasse) pode aprender, separadas em truques e círculos
function magiasDisponiveis(classe, subclasse, nivel) {
  const sc = subclasseConjura(subclasse);
  const listaClasse = sc ? sc.lista : classe; // Cav. Arcano / Trapaceiro Arcano usam a lista de Mago
  const maxc = maxCirculo(classe, nivel, subclasse);
  const truques = [], circulos = [];
  for (const nome in MAGIAS_CLASSES) {
    if (!MAGIAS_CLASSES[nome].includes(listaClasse)) continue;
    const d = MAGIAS_DETALHE[nome]; if (!d) continue;
    if (d.nivel === 0) truques.push(nome);
    else if (d.nivel <= maxc) circulos.push(nome);
  }
  // magias bônus da subclasse (entram como sempre disponíveis)
  const bonus = (subclasse && SUBCLASS_MAGIAS[subclasse]) ? SUBCLASS_MAGIAS[subclasse].filter(n => MAGIAS_DETALHE[n] && MAGIAS_DETALHE[n].nivel <= maxc) : [];
  return { truques: [...new Set(truques)], circulos: [...new Set(circulos)], bonus };
}

// Quantos NOVOS truques / magias o personagem ganha ao subir para "nivel"
function ganhoMagias(classe, nivel, attrs, subclasse) {
  const tNovo = truquesNoNivel(classe, nivel, subclasse) - truquesNoNivel(classe, nivel - 1, subclasse);
  let mNovo;
  if (classe === 'Mago') mNovo = (nivel === 1 ? 6 : 2); // grimório
  else mNovo = magiasNoNivel(classe, nivel, attrs, subclasse) - magiasNoNivel(classe, nivel - 1, attrs, subclasse);
  return { truques: Math.max(0, tNovo), magias: Math.max(0, mNovo), prepara: !!PREPARA[classe] && classe !== 'Mago' && !subclasseConjura(subclasse) };
}

// --- MINIATURAS/ÍCONES ---
const CLASSE_ICONE = {
  'Guerreiro': '⚔️', 'Mago': '🔮', 'Ladino': '🗡️', 'Clérigo': '☀️', 'Bardo': '🎵', 'Bárbaro': '🪓',
  'Druida': '🍃', 'Monge': '🥋', 'Paladino': '🛡️', 'Patrulheiro': '🏹', 'Feiticeiro': '✨', 'Bruxo': '💀'
};
const ATTR_ICONE = {
  'for': '💪', 'des': '🏃‍♂️', 'con': '✊', 'int': '🧠', 'sab': '👁️', 'car': '🗣️',
  'Força': '💪', 'Destreza': '🏃‍♂️', 'Constituição': '✊', 'Inteligência': '🧠', 'Sabedoria': '👁️', 'Carisma': '🗣️'
};
const ARMA_ICONE = {
  'Adaga': '🗡️', 'Azagaia': '🔱', 'Bastão': '🦯', 'Clava': '🪵', 'Clava Grande': '🪵', 'Foice Curta': '🌾',
  'Lança': '🔱', 'Maça': '🔨', 'Machadinha': '🪓', 'Martelo Leve': '🔨', 'Arco Curto': '🏹', 'Besta Leve': '🏹',
  'Dardo': '🎯', 'Funda': '🪨', 'Alabarda': '🪓', 'Chicote': '🪢', 'Cimitarra': '⚔️', 'Espada Curta': '🗡️',
  'Espada Grande': '⚔️', 'Espada Longa': '⚔️', 'Glaive': '🔱', 'Lança de Cavalaria': '🔱', 'Lança Longa (Pique)': '🔱',
  'Maça Estrela': '🔨', 'Machado de Batalha': '🪓', 'Machado Grande': '🪓', 'Malho': '🔨', 'Mangual': '🪢',
  'Martelo de Guerra': '🔨', 'Picareta de Guerra': '⛏️', 'Rapieira': '⚔️', 'Tridente': '🔱', 'Arco Longo': '🏹',
  'Besta de Mão': '🏹', 'Besta Pesada': '🏹', 'Zarabatana': '🎋', 'Rede': '🕸️'
};
function getClasseIcone(c) { return CLASSE_ICONE[c] || '👤'; }
function getAttrIcone(a) { return ATTR_ICONE[a] || '⭐'; }
function getArmaIcone(w) { return ARMA_ICONE[w] || '⚔️'; }

// Fase 16.1: avatar da ficha — miniatura enviada (Firebase Storage) ou, sem
// ela, o símbolo da classe como fallback. `tam` em px (default 48). Devolve
// HTML; a URL vem do Storage do próprio projeto, mas escapamos aspas por
// garantia contra quebra de atributo.
function miniaturaFichaHtml(f, tam) {
  tam = tam || 48;
  const url = f && f.miniaturaUrl;
  if (url) {
    const safe = String(url).replace(/"/g, '&quot;');
    return `<img class="ficha-mini" src="${safe}" alt="" ` +
      `style="width:${tam}px;height:${tam}px;object-fit:cover;border-radius:50%;flex:0 0 auto">`;
  }
  return `<span class="ficha-mini ficha-mini-simbolo" ` +
    `style="width:${tam}px;height:${tam}px;font-size:${Math.round(tam * 0.55)}px;` +
    `line-height:${tam}px;display:inline-flex;align-items:center;justify-content:center;` +
    `border-radius:50%;background:var(--accent2,#2a2a35);flex:0 0 auto">${getClasseIcone(f && f.classe)}</span>`;
}
