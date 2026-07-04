// =====================================================
// LOJA (Fase 9) — catálogo unificado por categoria + Loja Especial (Mestre)
// -----------------------------------------------------
// Junta os catálogos já existentes (equipamento.js: CATALOGO — mundano/PHB;
// itens.js: ITENS_PADRAO/ITENS_MAGICOS) num só "browser" por categoria, sem
// duplicar dados nem reescrever preço/peso (equipamento.js já resolve isso
// com fallback para ITENS_PADRAO — ver precoItemPO/pesoItemKg).
//
// "Loja Básica" = equipamento mundano do Livro do Jogador (armas, armaduras,
// instrumentos, montarias, poções simples, itens de aventura...) — é o que
// fica disponível por padrão, inclusive na criação do personagem.
//
// "Loja Especial" = itens mágicos/raros (ITENS_MAGICOS + itens criados pelo
// Mestre em window.ITENS_MESTRE). Só aparece quando liberada — por campanha
// inteira (window.LOJA_ESPECIAL_CAMPANHA) ou por personagem
// (ficha.lojaEspecialLiberada). Ver painel do Mestre (app.js) para o controlo.
// =====================================================

const CATEGORIAS_LOJA = [
  ['armadura', '🛡️ Armaduras'],
  ['escudo', '🛡️ Escudos'],
  ['arma', '⚔️ Armas'],
  ['municao', '🏹 Munição'],
  ['instrumento', '🎻 Instrumentos'],
  ['anel', '💍 Anéis'],
  ['calcado', '👢 Calçados'],
  ['cinto', '📿 Cintos'],
  ['manto', '🧥 Mantos & Capas'],
  ['varinha_cajado', '🪄 Varinhas & Cajados'],
  ['montaria', '🐴 Montarias & Veículos'],
  ['foco', '🔮 Focos'],
  ['pocao', '🧪 Poções'],
  ['pergaminho', '📜 Pergaminhos'],
  ['aventura', '🎒 Itens de Aventura'],
  ['outro', '📦 Outros'],
];

// Classifica um item (de qualquer catálogo) numa categoria única da lista acima.
function classificarItemLoja(item) {
  const nome = item.nome || '';
  if (item.cat) { // CATALOGO (equipamento.js) — já vem com .cat certo
    if (['arma', 'armadura', 'escudo', 'municao', 'foco', 'pocao', 'aventura'].includes(item.cat)) return item.cat;
    return 'outro';
  }
  if (item.tipo) { // ITENS_MAGICOS / itens do Mestre (tipo definido em itensmestre.js/itens.js)
    if (item.tipo === 'Anel') return /bota|cal[cç]ad/i.test(nome) ? 'calcado' : 'anel';
    if (item.tipo === 'Varinha' || item.tipo === 'Cajado') return 'varinha_cajado';
    if (item.tipo === 'Pergaminho') return 'pergaminho';
    if (item.tipo === 'Poção') return 'pocao';
    if (item.tipo === 'Arma') return 'arma';
    if (item.tipo === 'Armadura') return /escudo/i.test(nome) ? 'escudo' : 'armadura';
    // Maravilhoso: refina por nome quando dá
    if (/bota|cal[cç]ad/i.test(nome)) return 'calcado';
    if (/cinto|cintur/i.test(nome)) return 'cinto';
    if (/manto|capa/i.test(nome)) return 'manto';
    if (/anel/i.test(nome)) return 'anel';
    return 'outro';
  }
  if (item.categoria) { // ITENS_PADRAO (itens.js) — categorias antigas
    const mapa = { 'Arma': 'arma', 'Armadura': 'armadura', 'Aventura': 'aventura', 'Ferramenta': 'instrumento', 'Instrumento': 'instrumento', 'Montaria': 'montaria', 'Mágico': 'outro', 'Outro': 'outro' };
    return mapa[item.categoria] || 'outro';
  }
  return 'outro';
}

// Catálogo básico: mundano, sempre disponível (inclusive na criação do personagem).
function itensLojaBasica() {
  const vistos = new Set();
  const lista = [];
  if (typeof CATALOGO !== 'undefined') {
    CATALOGO.forEach(i => {
      if (vistos.has(i.nome)) return;
      vistos.add(i.nome);
      lista.push({
        nome: i.nome, categoriaLoja: classificarItemLoja(i),
        precoPO: i.precoPO || 0, pesoTexto: i.pesoKg != null ? `${i.pesoKg} kg` : '',
        descricao: (typeof descItemCurta === 'function') ? descItemCurta(i.nome) : '',
        origem: 'catalogo',
      });
    });
  }
  if (typeof ITENS_PADRAO !== 'undefined') {
    ITENS_PADRAO.forEach(i => {
      if (vistos.has(i.nome) || i.categoria === 'Mágico') return;
      vistos.add(i.nome);
      lista.push({
        nome: i.nome, categoriaLoja: classificarItemLoja(i),
        precoPO: (typeof precoItemPO === 'function') ? precoItemPO(i.nome) : 0, precoTexto: i.preco,
        pesoTexto: i.peso, descricao: i.descricao || '',
        origem: 'itens_padrao',
      });
    });
  }
  return lista;
}

// Catálogo especial: mágico/raro — só para quem tiver a Loja Especial liberada.
function itensLojaEspecial() {
  const lista = [];
  if (typeof ITENS_MAGICOS !== 'undefined') {
    ITENS_MAGICOS.forEach(i => lista.push({
      nome: i.nome, categoriaLoja: classificarItemLoja(i), raridade: i.raridade, sintonia: i.sintonia,
      descricao: i.efeito, pesoTexto: i.peso, origem: 'itens_magicos',
    }));
  }
  (window.ITENS_MESTRE || []).forEach(i => {
    if (ITENS_MAGICOS && ITENS_MAGICOS.some(m => m.nome === i.nome)) return; // evita duplicar por nome
    lista.push({
      nome: i.nome, categoriaLoja: classificarItemLoja(i), raridade: i.raridade, sintonia: i.sintonia,
      descricao: i.efeito, pesoTexto: i.peso, origem: 'itens_mestre',
    });
  });
  return lista;
}

// A Loja Especial está liberada para esta ficha? (por campanha inteira OU por personagem)
function lojaEspecialLiberada(ficha) {
  if (window.LOJA_ESPECIAL_CAMPANHA) return true;
  return !!(ficha && ficha.lojaEspecialLiberada);
}

// Agrupa uma lista de itens (já com .categoriaLoja) na ordem de CATEGORIAS_LOJA.
function agruparPorCategoriaLoja(itens) {
  const grupos = {};
  itens.forEach(i => { (grupos[i.categoriaLoja] = grupos[i.categoriaLoja] || []).push(i); });
  return CATEGORIAS_LOJA
    .filter(([chave]) => grupos[chave] && grupos[chave].length)
    .map(([chave, rotulo]) => ({ chave, rotulo, itens: grupos[chave] }));
}
