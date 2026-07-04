// =====================================================
// EQUIPAMENTO 5e (PHB) — catálogo estruturado, ouro inicial por rolagem,
// proficiências por classe e kits iniciais gratuitos da criação.
// Fonte usada pelo Criador (passo 5), Modo de Jogo (bolsa/slots) e Mestre.
// =====================================================

// ----- Ouro inicial por rolagem (PHB cap. 5) -----
// dados × d4; mult ×10 (Monge NÃO multiplica)
const OURO_ROLAGEM = {
  'Bárbaro':     { dados: 2, mult: 10 },
  'Bardo':       { dados: 5, mult: 10 },
  'Bruxo':       { dados: 4, mult: 10 },
  'Clérigo':     { dados: 5, mult: 10 },
  'Druida':      { dados: 2, mult: 10 },
  'Feiticeiro':  { dados: 3, mult: 10 },
  'Guerreiro':   { dados: 5, mult: 10 },
  'Ladino':      { dados: 4, mult: 10 },
  'Mago':        { dados: 4, mult: 10 },
  'Monge':       { dados: 5, mult: 1 },
  'Paladino':    { dados: 5, mult: 10 },
  'Patrulheiro': { dados: 5, mult: 10 },
};

function formulaOuro(classe) {
  const r = OURO_ROLAGEM[classe];
  return r ? `${r.dados}d4${r.mult > 1 ? `×${r.mult}` : ''}` : '4d4×10';
}
function rolarOuroClasse(classe) {
  const r = OURO_ROLAGEM[classe] || { dados: 4, mult: 10 };
  const dados = Array.from({ length: r.dados }, () => 1 + Math.floor(Math.random() * 4));
  const total = dados.reduce((a, b) => a + b, 0) * r.mult;
  return { total, dados, mult: r.mult };
}

// ----- Catálogo (armas/armaduras/escudo/focos/aventura/poções/munição) -----
// cat: arma | armadura | escudo | foco | aventura | pocao | municao | pacote
// grupo (armas): simples | marcial   · maos: 1|2 · alcance: cac | dist
// props: acuidade, leve, pesada, versátil, arremesso, municao, alcance, carregar, duasMaos
const CATALOGO = [
  // --- Armas simples corpo a corpo ---
  { nome: 'Adaga', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 2, pesoKg: 0.5, dano: '1d4', tipoDano: 'perfurante', props: ['acuidade', 'leve', 'arremesso (6/18m)'], maos: 1 },
  { nome: 'Azagaia', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 0.5, pesoKg: 1, dano: '1d6', tipoDano: 'perfurante', props: ['arremesso (9/36m)'], maos: 1 },
  { nome: 'Bastão', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 0.2, pesoKg: 2, dano: '1d6', tipoDano: 'concussão', props: ['versátil (1d8)'], maos: 1 },
  { nome: 'Clava', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 0.1, pesoKg: 1, dano: '1d4', tipoDano: 'concussão', props: ['leve'], maos: 1 },
  { nome: 'Clava Grande', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 0.2, pesoKg: 5, dano: '1d8', tipoDano: 'concussão', props: ['duasMaos'], maos: 2 },
  { nome: 'Foice Curta', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 1, pesoKg: 1, dano: '1d4', tipoDano: 'corte', props: ['leve'], maos: 1 },
  { nome: 'Lança', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 1, pesoKg: 1.5, dano: '1d6', tipoDano: 'perfurante', props: ['arremesso (6/18m)', 'versátil (1d8)'], maos: 1 },
  { nome: 'Maça', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 5, pesoKg: 2, dano: '1d6', tipoDano: 'concussão', props: [], maos: 1 },
  { nome: 'Machadinha', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 5, pesoKg: 1, dano: '1d6', tipoDano: 'corte', props: ['leve', 'arremesso (6/18m)'], maos: 1 },
  { nome: 'Martelo Leve', cat: 'arma', grupo: 'simples', alcance: 'cac', precoPO: 2, pesoKg: 1, dano: '1d4', tipoDano: 'concussão', props: ['leve', 'arremesso (6/18m)'], maos: 1 },
  // --- Armas simples à distância ---
  { nome: 'Arco Curto', cat: 'arma', grupo: 'simples', alcance: 'dist', precoPO: 25, pesoKg: 1, dano: '1d6', tipoDano: 'perfurante', props: ['municao (24/96m)', 'duasMaos'], maos: 2, municaoTipo: 'Flechas' },
  { nome: 'Besta Leve', cat: 'arma', grupo: 'simples', alcance: 'dist', precoPO: 25, pesoKg: 2.5, dano: '1d8', tipoDano: 'perfurante', props: ['municao (24/96m)', 'carregar', 'duasMaos'], maos: 2, municaoTipo: 'Virotes' },
  { nome: 'Dardo', cat: 'arma', grupo: 'simples', alcance: 'dist', precoPO: 0.05, pesoKg: 0.1, dano: '1d4', tipoDano: 'perfurante', props: ['acuidade', 'arremesso (6/18m)'], maos: 1 },
  { nome: 'Funda', cat: 'arma', grupo: 'simples', alcance: 'dist', precoPO: 0.1, pesoKg: 0, dano: '1d4', tipoDano: 'concussão', props: ['municao (9/36m)'], maos: 1, municaoTipo: 'Pedras de Funda' },
  // --- Armas marciais corpo a corpo ---
  { nome: 'Alabarda', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 20, pesoKg: 3, dano: '1d10', tipoDano: 'corte', props: ['pesada', 'alcance', 'duasMaos'], maos: 2 },
  { nome: 'Chicote', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 2, pesoKg: 1.5, dano: '1d4', tipoDano: 'corte', props: ['acuidade', 'alcance'], maos: 1 },
  { nome: 'Cimitarra', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 25, pesoKg: 1.5, dano: '1d6', tipoDano: 'corte', props: ['leve', 'acuidade'], maos: 1 },
  { nome: 'Espada Curta', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 10, pesoKg: 1, dano: '1d6', tipoDano: 'perfurante', props: ['leve', 'acuidade'], maos: 1 },
  { nome: 'Espada Grande', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 50, pesoKg: 3, dano: '2d6', tipoDano: 'corte', props: ['pesada', 'duasMaos'], maos: 2 },
  { nome: 'Espada Longa', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 15, pesoKg: 1.5, dano: '1d8', tipoDano: 'corte', props: ['versátil (1d10)'], maos: 1 },
  { nome: 'Glaive', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 20, pesoKg: 3, dano: '1d10', tipoDano: 'corte', props: ['pesada', 'alcance', 'duasMaos'], maos: 2 },
  { nome: 'Lança de Cavalaria', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 10, pesoKg: 3, dano: '1d12', tipoDano: 'perfurante', props: ['alcance', 'especial (montado)'], maos: 1 },
  { nome: 'Lança Longa (Pique)', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 5, pesoKg: 9, dano: '1d10', tipoDano: 'perfurante', props: ['pesada', 'alcance', 'duasMaos'], maos: 2 },
  { nome: 'Maça Estrela', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 15, pesoKg: 2, dano: '1d8', tipoDano: 'perfurante', props: [], maos: 1 },
  { nome: 'Machado de Batalha', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 10, pesoKg: 2, dano: '1d8', tipoDano: 'corte', props: ['versátil (1d10)'], maos: 1 },
  { nome: 'Machado Grande', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 30, pesoKg: 3.5, dano: '1d12', tipoDano: 'corte', props: ['pesada', 'duasMaos'], maos: 2 },
  { nome: 'Malho', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 10, pesoKg: 5, dano: '2d6', tipoDano: 'concussão', props: ['pesada', 'duasMaos'], maos: 2 },
  { nome: 'Mangual', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 10, pesoKg: 1, dano: '1d8', tipoDano: 'concussão', props: [], maos: 1 },
  { nome: 'Martelo de Guerra', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 15, pesoKg: 2.5, dano: '1d8', tipoDano: 'concussão', props: ['versátil (1d10)'], maos: 1 },
  { nome: 'Picareta de Guerra', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 5, pesoKg: 1, dano: '1d8', tipoDano: 'perfurante', props: [], maos: 1 },
  { nome: 'Rapieira', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 25, pesoKg: 1, dano: '1d8', tipoDano: 'perfurante', props: ['acuidade'], maos: 1 },
  { nome: 'Tridente', cat: 'arma', grupo: 'marcial', alcance: 'cac', precoPO: 5, pesoKg: 2, dano: '1d6', tipoDano: 'perfurante', props: ['arremesso (6/18m)', 'versátil (1d8)'], maos: 1 },
  // --- Armas marciais à distância ---
  { nome: 'Arco Longo', cat: 'arma', grupo: 'marcial', alcance: 'dist', precoPO: 50, pesoKg: 1, dano: '1d8', tipoDano: 'perfurante', props: ['municao (45/180m)', 'pesada', 'duasMaos'], maos: 2, municaoTipo: 'Flechas' },
  { nome: 'Besta de Mão', cat: 'arma', grupo: 'marcial', alcance: 'dist', precoPO: 75, pesoKg: 1.5, dano: '1d6', tipoDano: 'perfurante', props: ['municao (9/36m)', 'leve', 'carregar'], maos: 1, municaoTipo: 'Virotes' },
  { nome: 'Besta Pesada', cat: 'arma', grupo: 'marcial', alcance: 'dist', precoPO: 50, pesoKg: 9, dano: '1d10', tipoDano: 'perfurante', props: ['municao (30/120m)', 'pesada', 'carregar', 'duasMaos'], maos: 2, municaoTipo: 'Virotes' },
  { nome: 'Zarabatana', cat: 'arma', grupo: 'marcial', alcance: 'dist', precoPO: 10, pesoKg: 0.5, dano: '1', tipoDano: 'perfurante', props: ['municao (7,5/30m)', 'carregar'], maos: 1, municaoTipo: 'Agulhas' },
  { nome: 'Rede', cat: 'arma', grupo: 'marcial', alcance: 'dist', precoPO: 1, pesoKg: 1.5, dano: '—', tipoDano: '', props: ['especial (prende)', 'arremesso (1,5/4,5m)'], maos: 1 },
  // --- Munição ---
  { nome: 'Flechas (20)', cat: 'municao', municaoNome: 'Flechas', qtdPack: 20, precoPO: 1, pesoKg: 0.5 },
  { nome: 'Virotes (20)', cat: 'municao', municaoNome: 'Virotes', qtdPack: 20, precoPO: 1, pesoKg: 0.75 },
  { nome: 'Pedras de Funda (20)', cat: 'municao', municaoNome: 'Pedras de Funda', qtdPack: 20, precoPO: 0.04, pesoKg: 0.75 },
  { nome: 'Agulhas (50)', cat: 'municao', municaoNome: 'Agulhas', qtdPack: 50, precoPO: 1, pesoKg: 0.5 },
  // --- Armaduras (nomes casam com ARMADURAS de dados5e.js) ---
  { nome: 'Armadura Acolchoada', cat: 'armadura', tipoArm: 'leve', precoPO: 5, pesoKg: 4 },
  { nome: 'Armadura de Couro', cat: 'armadura', tipoArm: 'leve', precoPO: 10, pesoKg: 5 },
  { nome: 'Couro Batido', cat: 'armadura', tipoArm: 'leve', precoPO: 45, pesoKg: 6.5 },
  { nome: 'Gibão de Peles', cat: 'armadura', tipoArm: 'media', precoPO: 10, pesoKg: 6 },
  { nome: 'Camisão de Malha', cat: 'armadura', tipoArm: 'media', precoPO: 50, pesoKg: 10 },
  { nome: 'Brunea (Cota de Escamas)', cat: 'armadura', tipoArm: 'media', precoPO: 50, pesoKg: 22.5 },
  { nome: 'Peitoral', cat: 'armadura', tipoArm: 'media', precoPO: 400, pesoKg: 10 },
  { nome: 'Meia Armadura', cat: 'armadura', tipoArm: 'media', precoPO: 750, pesoKg: 20 },
  { nome: 'Cota de Malha', cat: 'armadura', tipoArm: 'pesada', precoPO: 75, pesoKg: 27.5 },
  { nome: 'Cota de Bandas', cat: 'armadura', tipoArm: 'pesada', precoPO: 200, pesoKg: 30 },
  { nome: 'Cota de Placas', cat: 'armadura', tipoArm: 'pesada', precoPO: 1500, pesoKg: 32.5 },
  { nome: 'Escudo', cat: 'escudo', precoPO: 10, pesoKg: 3 },
  // --- Focos e itens de conjurador ---
  { nome: 'Foco Arcano (varinha)', cat: 'foco', precoPO: 10, pesoKg: 0.5 },
  { nome: 'Foco Arcano (cajado)', cat: 'foco', precoPO: 5, pesoKg: 2 },
  { nome: 'Foco Arcano (orbe)', cat: 'foco', precoPO: 20, pesoKg: 1.5 },
  { nome: 'Foco Druídico (galho de visco)', cat: 'foco', precoPO: 1, pesoKg: 0 },
  { nome: 'Símbolo Sagrado (amuleto)', cat: 'foco', precoPO: 5, pesoKg: 0.5 },
  { nome: 'Símbolo Sagrado (emblema)', cat: 'foco', precoPO: 5, pesoKg: 0 },
  { nome: 'Bolsa de Componentes', cat: 'foco', precoPO: 25, pesoKg: 1 },
  { nome: 'Grimório', cat: 'aventura', precoPO: 50, pesoKg: 1.5 },
  { nome: 'Livro de Conhecimento', cat: 'aventura', precoPO: 25, pesoKg: 2.5 },
  { nome: 'Tinta e Pena', cat: 'aventura', precoPO: 10, pesoKg: 0 },
  { nome: 'Pergaminhos (10)', cat: 'aventura', precoPO: 1, pesoKg: 0 },
  { nome: 'Vestes de Mago', cat: 'aventura', precoPO: 1, pesoKg: 2 },
  { nome: 'Vestes Sacerdotais', cat: 'aventura', precoPO: 5, pesoKg: 2 },
  // --- Itens de aventura ---
  { nome: 'Mochila', cat: 'aventura', precoPO: 2, pesoKg: 2.5 },
  { nome: 'Saco de Dormir', cat: 'aventura', precoPO: 1, pesoKg: 3.5 },
  { nome: 'Corda de Cânhamo (15m)', cat: 'aventura', precoPO: 1, pesoKg: 5 },
  { nome: 'Corda de Seda (15m)', cat: 'aventura', precoPO: 10, pesoKg: 2.5 },
  { nome: 'Tocha', cat: 'aventura', precoPO: 0.01, pesoKg: 0.5 },
  { nome: 'Tochas (10)', cat: 'aventura', precoPO: 0.1, pesoKg: 5 },
  { nome: 'Lanterna Coberta', cat: 'aventura', precoPO: 5, pesoKg: 1 },
  { nome: 'Óleo (frasco)', cat: 'aventura', precoPO: 0.1, pesoKg: 0.5 },
  { nome: 'Isqueiro (pederneira)', cat: 'aventura', precoPO: 0.5, pesoKg: 0.5 },
  { nome: 'Rações (1 dia)', cat: 'aventura', precoPO: 0.5, pesoKg: 1 },
  { nome: 'Rações (10 dias)', cat: 'aventura', precoPO: 5, pesoKg: 10 },
  { nome: 'Cantil', cat: 'aventura', precoPO: 0.2, pesoKg: 2.5 },
  { nome: 'Kit de Cura', cat: 'aventura', precoPO: 5, pesoKg: 1.5 },
  { nome: 'Kit de Escalada', cat: 'aventura', precoPO: 25, pesoKg: 6 },
  { nome: 'Ferramentas de Ladrão', cat: 'aventura', precoPO: 25, pesoKg: 0.5 },
  { nome: 'Kit de Herbalismo', cat: 'aventura', precoPO: 5, pesoKg: 1.5 },
  { nome: 'Pé de Cabra', cat: 'aventura', precoPO: 2, pesoKg: 2.5 },
  { nome: 'Martelo', cat: 'aventura', precoPO: 1, pesoKg: 1.5 },
  { nome: 'Pitons (10)', cat: 'aventura', precoPO: 0.5, pesoKg: 1.25 },
  { nome: 'Grappling Hook (arpéu)', cat: 'aventura', precoPO: 2, pesoKg: 2 },
  { nome: 'Espelho de Aço', cat: 'aventura', precoPO: 5, pesoKg: 0.25 },
  { nome: 'Água Benta (frasco)', cat: 'aventura', precoPO: 25, pesoKg: 0.5 },
  { nome: 'Antitoxina (frasco)', cat: 'aventura', precoPO: 50, pesoKg: 0 },
  { nome: 'Velas (5)', cat: 'aventura', precoPO: 0.05, pesoKg: 0 },
  { nome: 'Giz (10)', cat: 'aventura', precoPO: 0.1, pesoKg: 0 },
  { nome: 'Sino', cat: 'aventura', precoPO: 1, pesoKg: 0 },
  { nome: 'Balde', cat: 'aventura', precoPO: 0.05, pesoKg: 1 },
  { nome: 'Tenda (2 pessoas)', cat: 'aventura', precoPO: 2, pesoKg: 10 },
  { nome: 'Algemas', cat: 'aventura', precoPO: 2, pesoKg: 3 },
  { nome: 'Corrente (3m)', cat: 'aventura', precoPO: 5, pesoKg: 5 },
  { nome: 'Bálsamo de Cura (pote c/ 3 usos)', cat: 'pocao', precoPO: 60, pesoKg: 0 },
  // --- Poções ---
  { nome: 'Poção de Cura (2d4+2)', cat: 'pocao', precoPO: 50, pesoKg: 0.25 },
  { nome: 'Poção de Cura Maior (4d4+4)', cat: 'pocao', precoPO: 150, pesoKg: 0.25 },
  { nome: 'Frasco de Fogo Alquímico (1d4 fogo)', cat: 'pocao', precoPO: 50, pesoKg: 0.5 },
  { nome: 'Frasco de Ácido (2d6 ácido)', cat: 'pocao', precoPO: 25, pesoKg: 0.5 },
];

function itemCatalogo(nome) {
  return CATALOGO.find(i => i.nome === nome) || null;
}

// ----- Proficiências por classe -----
// armas: 'todas' | 'simples' | lista extra além de simples | lista fechada
const PROF_ARMAS = {
  'Bárbaro':     { base: 'todas' },
  'Bardo':       { base: 'simples', extras: ['Besta de Mão', 'Espada Longa', 'Rapieira', 'Espada Curta'] },
  'Bruxo':       { base: 'simples' },
  'Clérigo':     { base: 'simples' },
  'Druida':      { base: 'lista', lista: ['Clava', 'Adaga', 'Dardo', 'Azagaia', 'Maça', 'Bastão', 'Cimitarra', 'Foice Curta', 'Funda', 'Lança'] },
  'Feiticeiro':  { base: 'lista', lista: ['Adaga', 'Dardo', 'Funda', 'Bastão', 'Besta Leve'] },
  'Guerreiro':   { base: 'todas' },
  'Ladino':      { base: 'simples', extras: ['Besta de Mão', 'Espada Longa', 'Rapieira', 'Espada Curta'] },
  'Mago':        { base: 'lista', lista: ['Adaga', 'Dardo', 'Funda', 'Bastão', 'Besta Leve'] },
  'Monge':       { base: 'simples', extras: ['Espada Curta'] },
  'Paladino':    { base: 'todas' },
  'Patrulheiro': { base: 'todas' },
};

// armaduras: tipos permitidos + escudo
const PROF_ARMADURAS = {
  'Bárbaro':     { tipos: ['leve', 'media'], escudo: true },
  'Bardo':       { tipos: ['leve'], escudo: false },
  'Bruxo':       { tipos: ['leve'], escudo: false },
  'Clérigo':     { tipos: ['leve', 'media'], escudo: true }, // domínios Guerra/Vida/Tempestade/Natureza: +pesada
  'Druida':      { tipos: ['leve', 'media'], escudo: true, nota: 'não usa metal' },
  'Feiticeiro':  { tipos: [], escudo: false },
  'Guerreiro':   { tipos: ['leve', 'media', 'pesada'], escudo: true },
  'Ladino':      { tipos: ['leve'], escudo: false },
  'Mago':        { tipos: [], escudo: false },
  'Monge':       { tipos: [], escudo: false },
  'Paladino':    { tipos: ['leve', 'media', 'pesada'], escudo: true },
  'Patrulheiro': { tipos: ['leve', 'media'], escudo: true },
};
const DOMINIOS_ARMADURA_PESADA = ['Domínio da Vida', 'Domínio da Guerra', 'Domínio da Tempestade', 'Domínio da Natureza'];

function podeUsarArma(classe, nomeItem) {
  const it = itemCatalogo(nomeItem);
  if (!it || it.cat !== 'arma') return true;
  const p = PROF_ARMAS[classe];
  if (!p) return true;
  if (p.base === 'todas') return true;
  if (p.base === 'simples') return it.grupo === 'simples' || (p.extras || []).includes(it.nome);
  return (p.lista || []).includes(it.nome);
}

function podeUsarArmadura(classe, nomeItem, subclasse) {
  const it = itemCatalogo(nomeItem);
  if (!it) return true;
  const p = PROF_ARMADURAS[classe];
  if (!p) return true;
  if (it.cat === 'escudo') return p.escudo;
  if (it.cat !== 'armadura') return true;
  if (p.tipos.includes(it.tipoArm)) return true;
  // Clérigo de domínio marcial ganha armadura pesada
  if (classe === 'Clérigo' && it.tipoArm === 'pesada' && DOMINIOS_ARMADURA_PESADA.includes(subclasse || '')) return true;
  return false;
}

// ----- Pacotes de aventureiro (conteúdo listado como itens do catálogo + extras) -----
const PACOTES = {
  'Pacote de Explorador': ['Mochila', 'Saco de Dormir', 'Isqueiro (pederneira)', 'Tochas (10)', 'Rações (10 dias)', 'Cantil', 'Corda de Cânhamo (15m)'],
  'Pacote de Aventureiro': ['Mochila', 'Pé de Cabra', 'Martelo', 'Pitons (10)', 'Tochas (10)', 'Isqueiro (pederneira)', 'Rações (10 dias)', 'Cantil', 'Corda de Cânhamo (15m)'],
  'Pacote de Assaltante': ['Mochila', 'Velas (5)', 'Pé de Cabra', 'Martelo', 'Pitons (10)', 'Lanterna Coberta', 'Óleo (frasco)', 'Rações (10 dias)', 'Isqueiro (pederneira)', 'Cantil', 'Corda de Cânhamo (15m)', 'Sino'],
  'Pacote de Sacerdote': ['Mochila', 'Saco de Dormir', 'Velas (5)', 'Isqueiro (pederneira)', 'Rações (1 dia)', 'Cantil', 'Vestes Sacerdotais'],
  'Pacote de Estudioso': ['Mochila', 'Livro de Conhecimento', 'Tinta e Pena', 'Pergaminhos (10)', 'Velas (5)', 'Isqueiro (pederneira)'],
  'Pacote de Artista': ['Mochila', 'Saco de Dormir', 'Velas (5)', 'Rações (1 dia)', 'Cantil'],
};

// ----- Kit inicial gratuito por classe (escolhas do PHB, simplificadas) -----
// Cada "escolha" é um radio-group; cada opção é uma lista de itens do catálogo.
const KIT_INICIAL = {
  'Bárbaro': {
    fixos: ['Azagaia', 'Azagaia', 'Azagaia', 'Azagaia'],
    escolhas: [
      { rotulo: 'Arma principal', opcoes: [['Machado Grande'], ['Espada Grande'], ['Malho']] },
      { rotulo: 'Armas secundárias', opcoes: [['Machadinha', 'Machadinha'], ['Lança'], ['Maça']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Explorador']] },
    ],
  },
  'Bardo': {
    fixos: ['Armadura de Couro', 'Adaga'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Rapieira'], ['Espada Longa'], ['Adaga']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Artista'], ['Pacote de Explorador']] },
    ],
  },
  'Bruxo': {
    fixos: ['Armadura de Couro', 'Adaga', 'Adaga'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Besta Leve', 'Virotes (20)'], ['Espada Curta'], ['Bastão']] },
      { rotulo: 'Foco', opcoes: [['Bolsa de Componentes'], ['Foco Arcano (varinha)'], ['Foco Arcano (orbe)']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Estudioso'], ['Pacote de Aventureiro']] },
    ],
  },
  'Clérigo': {
    fixos: ['Escudo', 'Símbolo Sagrado (amuleto)'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Maça'], ['Martelo de Guerra']] },
      { rotulo: 'Armadura', opcoes: [['Brunea (Cota de Escamas)'], ['Armadura de Couro'], ['Cota de Malha']] },
      { rotulo: 'Arma à distância', opcoes: [['Besta Leve', 'Virotes (20)'], ['Funda', 'Pedras de Funda (20)']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Sacerdote']] },
    ],
  },
  'Druida': {
    fixos: ['Armadura de Couro', 'Foco Druídico (galho de visco)'],
    escolhas: [
      { rotulo: 'Defesa', opcoes: [['Escudo'], ['Cimitarra']] },
      { rotulo: 'Arma', opcoes: [['Cimitarra'], ['Lança'], ['Bastão']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Explorador']] },
    ],
  },
  'Feiticeiro': {
    fixos: ['Adaga', 'Adaga'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Besta Leve', 'Virotes (20)'], ['Bastão'], ['Adaga']] },
      { rotulo: 'Foco', opcoes: [['Bolsa de Componentes'], ['Foco Arcano (varinha)'], ['Foco Arcano (orbe)']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Aventureiro']] },
    ],
  },
  'Guerreiro': {
    fixos: [],
    escolhas: [
      { rotulo: 'Armadura', opcoes: [['Cota de Malha'], ['Armadura de Couro', 'Arco Longo', 'Flechas (20)']] },
      { rotulo: 'Armas', opcoes: [['Espada Longa', 'Escudo'], ['Machado de Batalha', 'Escudo'], ['Martelo de Guerra', 'Escudo'], ['Espada Grande'], ['Espada Longa', 'Espada Curta']] },
      { rotulo: 'Arma extra', opcoes: [['Besta Leve', 'Virotes (20)'], ['Machadinha', 'Machadinha']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Aventureiro'], ['Pacote de Explorador']] },
    ],
  },
  'Ladino': {
    fixos: ['Armadura de Couro', 'Adaga', 'Adaga', 'Ferramentas de Ladrão'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Rapieira'], ['Espada Curta']] },
      { rotulo: 'Arma à distância', opcoes: [['Arco Curto', 'Flechas (20)'], ['Espada Curta']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Assaltante'], ['Pacote de Aventureiro'], ['Pacote de Explorador']] },
    ],
  },
  'Mago': {
    fixos: ['Grimório', 'Vestes de Mago'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Bastão'], ['Adaga']] },
      { rotulo: 'Foco', opcoes: [['Bolsa de Componentes'], ['Foco Arcano (varinha)'], ['Foco Arcano (orbe)']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Estudioso'], ['Pacote de Aventureiro']] },
    ],
  },
  'Monge': {
    fixos: ['Dardo', 'Dardo', 'Dardo', 'Dardo', 'Dardo', 'Dardo', 'Dardo', 'Dardo', 'Dardo', 'Dardo'],
    escolhas: [
      { rotulo: 'Arma', opcoes: [['Espada Curta'], ['Bastão'], ['Lança']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Aventureiro'], ['Pacote de Explorador']] },
    ],
  },
  'Paladino': {
    fixos: ['Cota de Malha', 'Símbolo Sagrado (emblema)'],
    escolhas: [
      { rotulo: 'Armas', opcoes: [['Espada Longa', 'Escudo'], ['Martelo de Guerra', 'Escudo'], ['Espada Grande'], ['Espada Longa', 'Machado de Batalha']] },
      { rotulo: 'Arma secundária', opcoes: [['Azagaia', 'Azagaia', 'Azagaia', 'Azagaia', 'Azagaia'], ['Maça']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Sacerdote'], ['Pacote de Explorador']] },
    ],
  },
  'Patrulheiro': {
    fixos: ['Arco Longo', 'Flechas (20)'],
    escolhas: [
      { rotulo: 'Armadura', opcoes: [['Brunea (Cota de Escamas)'], ['Armadura de Couro']] },
      { rotulo: 'Armas', opcoes: [['Espada Curta', 'Espada Curta'], ['Machadinha', 'Machadinha'], ['Lança', 'Adaga']] },
      { rotulo: 'Pacote', opcoes: [['Pacote de Aventureiro'], ['Pacote de Explorador']] },
    ],
  },
};

// Peso/preço com fallback: catálogo novo → ITENS_PADRAO antigo (loja do Mestre)
function precoItemPO(nome) {
  const it = itemCatalogo(nome);
  if (it) return it.precoPO || 0;
  if (typeof ITENS_PADRAO !== 'undefined') {
    const old = ITENS_PADRAO.find(i => i.nome === nome);
    if (old && old.preco) {
      const m = String(old.preco).toLowerCase().replace(',', '.').match(/([\d.]+)\s*(po|gp|pp|sp|pc|cp|pe)?/);
      if (m) {
        const v = parseFloat(m[1]), u = m[2] || 'po';
        if (u === 'pp' || u === 'sp') return v / 10;
        if (u === 'pc' || u === 'cp') return v / 100;
        if (u === 'pe') return v / 2;
        return v;
      }
    }
  }
  return 0;
}
function pesoItemKg(nome) {
  const it = itemCatalogo(nome);
  if (it) return it.pesoKg || 0;
  if (typeof ITENS_PADRAO !== 'undefined') {
    const old = ITENS_PADRAO.find(i => i.nome === nome);
    if (old && old.peso) {
      const m = String(old.peso).replace(',', '.').match(/([\d.]+)/);
      if (m) return parseFloat(m[1]);
    }
  }
  return 0;
}

// Descrição curta p/ tooltips e loja
function descItemCurta(nome) {
  const it = itemCatalogo(nome);
  if (!it) return '';
  if (it.cat === 'arma') return `${it.dano} ${it.tipoDano}${it.props.length ? ' · ' + it.props.join(', ') : ''}`;
  if (it.cat === 'armadura') {
    const a = (typeof ARMADURAS !== 'undefined') ? ARMADURAS[it.nome] : null;
    return a ? `CA ${a.base}${a.tipo === 'leve' ? ' + DES' : a.tipo === 'media' ? ' + DES (máx 2)' : ''} · ${it.tipoArm}` : it.tipoArm;
  }
  if (it.cat === 'escudo') return '+2 CA';
  if (it.cat === 'municao') return `pacote com ${it.qtdPack}`;
  return '';
}
