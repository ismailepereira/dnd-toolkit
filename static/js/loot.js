// =====================================================================
// Fase 13 — Monstros & Sistema de Loot
// Tabelas de tesouro individuais por Nível de Desafio (inspiradas na
// Tabela de Tesouro Individual do Guia do Mestre, simplificadas para po)
// e rolagem de loot por monstro/encontro.
// Um monstro pode ter `loot` próprio em MONSTROS (monstros.js):
//   loot: { ouroFormula: '2d6', itensGarantidos: [...], tabela: [{item, peso, qtd?}] }
// `item: null` na tabela significa "sem drop".
// =====================================================================

const TABELAS_LOOT_POR_ND = {
  '0-4': {
    ouroFormula: '3d6',
    tabela: [
      { item: null, peso: 55 },
      { item: 'Adaga gasta', peso: 10, qtd: 1 },
      { item: 'Ração de viagem', peso: 10, qtd: 1 },
      { item: 'Tocha', peso: 8, qtd: 2 },
      { item: 'Corda de cânhamo (15m)', peso: 6, qtd: 1 },
      { item: 'Pedra semipreciosa (10 po)', peso: 6, qtd: 1 },
      { item: 'Poção de Cura', peso: 5, qtd: 1 },
    ],
  },
  '5-10': {
    ouroFormula: '4d6+20',
    tabela: [
      { item: null, peso: 45 },
      { item: 'Pedra semipreciosa (10 po)', peso: 15, qtd: 2 },
      { item: 'Estatueta de marfim (25 po)', peso: 12, qtd: 1 },
      { item: 'Poção de Cura', peso: 12, qtd: 1 },
      { item: 'Gema (50 po)', peso: 10, qtd: 1 },
      { item: 'Poção de Cura Maior', peso: 4, qtd: 1 },
      { item: 'Pergaminho de magia (1º círculo)', peso: 2, qtd: 1 },
    ],
  },
  '11-16': {
    ouroFormula: '2d8+80',
    tabela: [
      { item: null, peso: 35 },
      { item: 'Gema (50 po)', peso: 18, qtd: 2 },
      { item: 'Gema (100 po)', peso: 15, qtd: 1 },
      { item: 'Objeto de arte (250 po)', peso: 12, qtd: 1 },
      { item: 'Poção de Cura Maior', peso: 12, qtd: 1 },
      { item: 'Pergaminho de magia (3º círculo)', peso: 5, qtd: 1 },
      { item: 'Poção de Cura Superior', peso: 3, qtd: 1 },
    ],
  },
  '17+': {
    ouroFormula: '6d6+300',
    tabela: [
      { item: null, peso: 25 },
      { item: 'Gema (100 po)', peso: 20, qtd: 2 },
      { item: 'Gema (500 po)', peso: 18, qtd: 1 },
      { item: 'Objeto de arte (750 po)', peso: 15, qtd: 1 },
      { item: 'Poção de Cura Superior', peso: 12, qtd: 1 },
      { item: 'Pergaminho de magia (5º círculo)', peso: 6, qtd: 1 },
      { item: 'Poção de Cura Suprema', peso: 4, qtd: 1 },
    ],
  },
};

// Converte CR ('1/8', '1/4', '1/2', '3', '10'...) na banda da tabela
function lootBandaDoCr(cr) {
  const s = String(cr || '0').trim();
  let n;
  if (s.includes('/')) {
    const [a, b] = s.split('/');
    n = parseInt(a, 10) / (parseInt(b, 10) || 1);
  } else {
    n = parseFloat(s);
  }
  if (isNaN(n)) n = 0;
  if (n <= 4) return '0-4';
  if (n <= 10) return '5-10';
  if (n <= 16) return '11-16';
  return '17+';
}

// Rola fórmulas 'NdM', 'NdM+K', 'NdM-K'
function lootRolarFormula(formula, rng) {
  rng = rng || Math.random;
  const m = String(formula).trim().match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!m) return 0;
  const qtd = parseInt(m[1], 10), lados = parseInt(m[2], 10), extra = m[3] ? parseInt(m[3], 10) : 0;
  let total = extra;
  for (let i = 0; i < qtd; i++) total += Math.floor(rng() * lados) + 1;
  return Math.max(0, total);
}

function lootEscolhaPonderada(lista, rng) {
  rng = rng || Math.random;
  const total = lista.reduce((s, e) => s + (e.peso || 1), 0);
  let sorteio = rng() * total;
  for (const e of lista) {
    sorteio -= (e.peso || 1);
    if (sorteio <= 0) return e;
  }
  return lista[lista.length - 1];
}

// Loot de UM monstro abatido. Usa monstro.loot se existir; senão a tabela
// genérica pela banda do CR. Retorna { ouro, itens: ['nome', ...] }.
function rolarLoot(monstro, rng) {
  rng = rng || Math.random;
  if (!monstro) return { ouro: 0, itens: [] };
  const proprio = monstro.loot || null;
  const tabela = proprio || TABELAS_LOOT_POR_ND[lootBandaDoCr(monstro.cr)];
  const ouro = lootRolarFormula(tabela.ouroFormula, rng);
  const itens = [];
  (proprio && proprio.itensGarantidos ? proprio.itensGarantidos : []).forEach(i => itens.push(i));
  if (tabela.tabela && tabela.tabela.length) {
    const drop = lootEscolhaPonderada(tabela.tabela, rng);
    if (drop.item) for (let k = 0; k < (drop.qtd || 1); k++) itens.push(drop.item);
  }
  return { ouro, itens };
}

// Loot somado de um encontro (lista de entradas de MONSTROS, uma por
// criatura abatida). Retorna { ouro, itens: [{nome, qtd}], porMonstro: [...] }.
function rolarLootEncontro(monstros, rng) {
  rng = rng || Math.random;
  let ouro = 0;
  const contagem = {};
  const porMonstro = [];
  (monstros || []).forEach(m => {
    const r = rolarLoot(m, rng);
    ouro += r.ouro;
    r.itens.forEach(i => { contagem[i] = (contagem[i] || 0) + 1; });
    porMonstro.push({ nome: m ? m.nome : '?', ouro: r.ouro, itens: r.itens });
  });
  const itens = Object.keys(contagem).map(nome => ({ nome, qtd: contagem[nome] }));
  return { ouro, itens, porMonstro };
}

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TABELAS_LOOT_POR_ND, lootBandaDoCr, lootRolarFormula, lootEscolhaPonderada, rolarLoot, rolarLootEncontro };
}
