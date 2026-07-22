// =====================================================
// FORMA SELVAGEM (Druida) — catálogo de feras + regras por nível (5e/SRD)
// Fonte única usada pelo Criador (painel de classe), pelo Modo de Jogo
// (transformar/reverter com PV da fera) e pelos testes.
//
// Regra (PHB, tabela Formas de Fera):
//   nível 2 → ND máx ¼, sem deslocamento de voo nem natação
//   nível 4 → ND máx ½, ganha natação (sem voo)
//   nível 8 → ND máx 1, ganha voo
// Círculo da Lua: ND 1 já no nível 2 (Forma Selvagem de Combate) e, do nível
// 6 em diante, ND = ⌊nível/3⌋ — as travas de natação (nv4) e voo (nv8) valem
// igual (a subclasse melhora o ND, não o deslocamento).
// =====================================================

// nd: usar frações decimais (0.125 = ⅛, 0.25 = ¼, 0.5 = ½)
// atributos: só os FÍSICOS (FOR/DES/CON) — na forma, INT/SAB/CAR seguem os do druida
const FORMAS_SELVAGENS = [
  // ----- ND 0 -----
  { nome: 'Gato', nd: 0, ca: 12, pv: 2, desloc: '12m · escalar 9m', atributos: { for: 3, des: 15, con: 10 },
    ataques: [{ nome: 'Garras', bonus: 0, dano: '1 cortante' }],
    tracos: ['Faro Aguçado: vantagem em Percepção pelo olfato'] },
  { nome: 'Corvo', nd: 0, ca: 12, pv: 1, desloc: '3m · voo 15m', voa: true, atributos: { for: 2, des: 14, con: 8 },
    ataques: [{ nome: 'Bicada', bonus: 4, dano: '1 perfurante' }],
    tracos: ['Imitação: reproduz sons e vozes simples (Intuição CD 10 percebe)'] },
  { nome: 'Aranha', nd: 0, ca: 12, pv: 1, desloc: '6m · escalar 6m', atributos: { for: 2, des: 14, con: 8 },
    ataques: [{ nome: 'Picada', bonus: 4, dano: '1 perfurante + veneno (CD 9, 1d4)' }],
    tracos: ['Andar em Teias: ignora restrições de teias', 'Escalada Aranha: anda por paredes e tetos'] },
  // ----- ND ⅛ -----
  { nome: 'Rato Gigante', nd: 0.125, ca: 12, pv: 7, desloc: '9m', atributos: { for: 7, des: 15, con: 11 },
    ataques: [{ nome: 'Mordida', bonus: 4, dano: '1d4+2 perfurante' }],
    tracos: ['Faro Aguçado', 'Tática de Matilha: vantagem se um aliado estiver a 1,5m do alvo'] },
  { nome: 'Doninha Gigante', nd: 0.125, ca: 13, pv: 9, desloc: '12m', atributos: { for: 11, des: 16, con: 10 },
    ataques: [{ nome: 'Mordida', bonus: 5, dano: '1d4+3 perfurante' }],
    tracos: ['Faro e Audição Aguçados'] },
  { nome: 'Mula', nd: 0.125, ca: 10, pv: 11, desloc: '12m', atributos: { for: 14, des: 10, con: 13 },
    ataques: [{ nome: 'Casco', bonus: 2, dano: '1d4+2 concussão' }],
    tracos: ['Besta de Carga: conta como um tamanho maior p/ capacidade', 'Pés Firmes: vantagem contra ser derrubada'] },
  // ----- ND ¼ (nível 2) -----
  { nome: 'Lobo', nd: 0.25, ca: 13, pv: 11, desloc: '12m', atributos: { for: 12, des: 15, con: 12 },
    ataques: [{ nome: 'Mordida', bonus: 4, dano: '2d4+2 perfurante; FOR CD 11 ou o alvo cai' }],
    tracos: ['Faro e Audição Aguçados', 'Tática de Matilha'] },
  { nome: 'Pantera', nd: 0.25, ca: 12, pv: 13, desloc: '15m · escalar 12m', atributos: { for: 14, des: 15, con: 10 },
    ataques: [{ nome: 'Mordida', bonus: 4, dano: '1d6+2 perfurante' }, { nome: 'Garra', bonus: 4, dano: '1d4+2 cortante' }],
    tracos: ['Faro Aguçado', 'Bote: com 6m de corrida, a garra derruba (FOR CD 12) e dá mordida bônus'] },
  { nome: 'Javali', nd: 0.25, ca: 11, pv: 11, desloc: '12m', atributos: { for: 13, des: 11, con: 12 },
    ataques: [{ nome: 'Presas', bonus: 3, dano: '1d6+1 cortante' }],
    tracos: ['Investida: +1d6 com 6m de corrida (FOR CD 11 ou cai)', 'Implacável: 1×/descanso fica com 1 PV em vez de 0'] },
  { nome: 'Alce', nd: 0.25, ca: 10, pv: 13, desloc: '15m', atributos: { for: 16, des: 10, con: 12 },
    ataques: [{ nome: 'Chifrada', bonus: 5, dano: '1d6+3 concussão' }, { nome: 'Cascos (em alvo caído)', bonus: 5, dano: '2d4+3 concussão' }],
    tracos: ['Investida: +2d6 com 6m de corrida (FOR CD 13 ou cai)'] },
  { nome: 'Cavalo de Montaria', nd: 0.25, ca: 10, pv: 13, desloc: '18m', atributos: { for: 16, des: 10, con: 12 },
    ataques: [{ nome: 'Cascos', bonus: 5, dano: '2d4+3 concussão' }],
    tracos: ['O mais rápido em terra deste nível (18m)'] },
  { nome: 'Cobra Constritora', nd: 0.25, ca: 12, pv: 13, desloc: '9m · natação 9m', nada: true, atributos: { for: 15, des: 14, con: 12 },
    ataques: [{ nome: 'Mordida', bonus: 4, dano: '1d6+2 perfurante' }, { nome: 'Constrição', bonus: 4, dano: '1d8+2 concussão + agarrado (CD 14)' }],
    tracos: ['Respira normalmente; nada a 9m'] },
  // ----- ND ½ (nível 4) -----
  { nome: 'Urso Negro', nd: 0.5, ca: 11, pv: 19, desloc: '12m · escalar 9m', atributos: { for: 15, des: 10, con: 14 },
    ataques: [{ nome: 'Mordida', bonus: 3, dano: '1d6+2 perfurante' }, { nome: 'Garras', bonus: 3, dano: '2d4+2 cortante' }],
    tracos: ['Faro Aguçado', 'Multiataque: mordida + garras'] },
  { nome: 'Crocodilo', nd: 0.5, ca: 12, pv: 19, desloc: '6m · natação 9m', nada: true, atributos: { for: 15, des: 10, con: 13 },
    ataques: [{ nome: 'Mordida', bonus: 4, dano: '1d10+2 perfurante + agarrado (CD 12)' }],
    tracos: ['Prende a Respiração por 15 minutos'] },
  { nome: 'Cavalo de Guerra', nd: 0.5, ca: 11, pv: 19, desloc: '18m', atributos: { for: 18, des: 12, con: 13 },
    ataques: [{ nome: 'Cascos', bonus: 6, dano: '2d6+4 concussão' }],
    tracos: ['Investida com Pisoteio: com 6m de corrida, FOR CD 14 ou o alvo cai + ataque bônus de cascos'] },
  // ----- ND 1 (nível 8; Círculo da Lua já no 2) -----
  { nome: 'Urso-Pardo', nd: 1, ca: 11, pv: 34, desloc: '12m · escalar 9m', atributos: { for: 19, des: 10, con: 16 },
    ataques: [{ nome: 'Mordida', bonus: 5, dano: '1d8+4 perfurante' }, { nome: 'Garras', bonus: 5, dano: '2d6+4 cortante' }],
    tracos: ['Faro Aguçado', 'Multiataque: mordida + garras'] },
  { nome: 'Lobo Atroz', nd: 1, ca: 14, pv: 37, desloc: '15m', atributos: { for: 17, des: 15, con: 15 },
    ataques: [{ nome: 'Mordida', bonus: 5, dano: '2d6+3 perfurante; FOR CD 13 ou o alvo cai' }],
    tracos: ['Faro e Audição Aguçados', 'Tática de Matilha'] },
  { nome: 'Leão', nd: 1, ca: 12, pv: 26, desloc: '15m', atributos: { for: 17, des: 15, con: 13 },
    ataques: [{ nome: 'Mordida', bonus: 5, dano: '1d8+3 perfurante' }, { nome: 'Garra', bonus: 5, dano: '1d6+3 cortante' }],
    tracos: ['Faro Aguçado', 'Bote (FOR CD 13 derruba + mordida bônus)', 'Corrida Impetuosa: salto de 7,5m com corrida'] },
  { nome: 'Aranha Gigante', nd: 1, ca: 14, pv: 26, desloc: '9m · escalar 9m', atributos: { for: 14, des: 16, con: 12 },
    ataques: [{ nome: 'Mordida', bonus: 5, dano: '1d8+3 perfurante + veneno (CD 11, 2d8)' }, { nome: 'Teia (recarga 5-6)', bonus: 5, dano: 'prende o alvo (CD 12 p/ escapar)' }],
    tracos: ['Escalada Aranha', 'Sentido de Teia', 'Andar em Teias'] },
  { nome: 'Águia Gigante', nd: 1, ca: 13, pv: 26, desloc: '3m · voo 24m', voa: true, atributos: { for: 16, des: 17, con: 13 },
    ataques: [{ nome: 'Bicada', bonus: 5, dano: '1d6+3 perfurante' }, { nome: 'Garras', bonus: 5, dano: '2d6+3 cortante' }],
    tracos: ['Visão Aguçada: vantagem em Percepção pela visão', 'Multiataque: bicada + garras'] },
  // ----- ND 2 (Círculo da Lua nível 6) -----
  { nome: 'Urso Polar', nd: 2, ca: 12, pv: 42, desloc: '12m · natação 9m', nada: true, atributos: { for: 20, des: 10, con: 16 },
    ataques: [{ nome: 'Mordida', bonus: 7, dano: '1d8+5 perfurante' }, { nome: 'Garras', bonus: 7, dano: '2d6+5 cortante' }],
    tracos: ['Faro Aguçado', 'Multiataque: mordida + garras'] },
  { nome: 'Rinoceronte', nd: 2, ca: 11, pv: 45, desloc: '12m', atributos: { for: 21, des: 8, con: 15 },
    ataques: [{ nome: 'Chifrada', bonus: 7, dano: '2d8+5 concussão' }],
    tracos: ['Investida: +2d8 com 6m de corrida (FOR CD 15 ou cai)'] },
  { nome: 'Tubarão-Caçador', nd: 2, ca: 12, pv: 45, desloc: 'natação 12m (só na água)', nada: true, atributos: { for: 18, des: 13, con: 15 },
    ataques: [{ nome: 'Mordida', bonus: 6, dano: '2d8+4 perfurante' }],
    tracos: ['Respiração Aquática: SÓ respira debaixo d\'água', 'Sentido Sísmico na água', 'Frenesi de Sangue: vantagem contra alvos feridos'] },
  // ----- ND 3-6 (Círculo da Lua níveis 9+) -----
  { nome: 'Anquilossauro', nd: 3, ca: 15, pv: 68, desloc: '9m', atributos: { for: 19, des: 11, con: 15 },
    ataques: [{ nome: 'Cauda', bonus: 7, dano: '4d6+4 concussão; FOR CD 14 ou o alvo cai' }],
    tracos: ['Couraça natural (CA 15)'] },
  { nome: 'Elefante', nd: 4, ca: 12, pv: 76, desloc: '12m', atributos: { for: 22, des: 9, con: 17 },
    ataques: [{ nome: 'Presas', bonus: 8, dano: '3d8+6 perfurante' }, { nome: 'Pisotear (alvo caído)', bonus: 8, dano: '3d10+6 concussão' }],
    tracos: ['Investida com Pisoteio: com 6m de corrida, FOR CD 12 ou cai + pisotear bônus'] },
  { nome: 'Tubarão Gigante', nd: 5, ca: 13, pv: 126, desloc: 'natação 15m (só na água)', nada: true, atributos: { for: 23, des: 11, con: 21 },
    ataques: [{ nome: 'Mordida', bonus: 9, dano: '3d10+6 perfurante' }],
    tracos: ['Respiração Aquática: SÓ respira debaixo d\'água', 'Frenesi de Sangue'] },
  { nome: 'Mamute', nd: 6, ca: 13, pv: 126, desloc: '12m', atributos: { for: 24, des: 9, con: 21 },
    ataques: [{ nome: 'Presas', bonus: 10, dano: '4d8+7 perfurante' }, { nome: 'Pisotear (alvo caído)', bonus: 10, dano: '4d10+7 concussão' }],
    tracos: ['Investida com Pisoteio (FOR CD 18)'] },
];

// F3b: FORMAS ELEMENTAIS (Círculo da Lua, nível 10) — gasta 2 usos de Forma
// Selvagem para virar um Elemental do Ar/Terra/Fogo/Água (todos ND 5, MM).
// Mantidos separados das feras: NÃO entram na lista normal (que filtra por ND),
// mas formaSelvagemDados() os encontra para o painel/PV da forma ativa.
const FORMAS_ELEMENTAIS = [
  { nome: 'Elemental do Ar', elemental: true, nd: 5, ca: 15, pv: 90, desloc: 'voo 27m (paira)', voa: true, atributos: { for: 14, des: 20, con: 14 },
    ataques: [{ nome: 'Multiataque', bonus: null, dano: 'dois golpes' }, { nome: 'Golpe', bonus: 8, dano: '2d8+5 concussão' }],
    tracos: ['Forma Aérea: entra no espaço de criaturas', 'Redemoinho (recarga 4-6): DES CD 13, 3d8 concussão e derruba', 'Resistência a raio/trovão e a dano físico não-mágico'] },
  { nome: 'Elemental da Terra', elemental: true, nd: 5, ca: 17, pv: 126, desloc: '9m · escavar 9m', atributos: { for: 20, des: 8, con: 20 },
    ataques: [{ nome: 'Multiataque', bonus: null, dano: 'dois golpes' }, { nome: 'Golpe', bonus: 8, dano: '2d8+5 concussão' }],
    tracos: ['Deslizar na Terra: atravessa terra e rocha sem revolvê-las', 'Monstro de Cerco: dano dobrado a objetos e estruturas', 'Resistência a dano físico não-mágico'] },
  { nome: 'Elemental do Fogo', elemental: true, nd: 5, ca: 13, pv: 102, desloc: '15m', atributos: { for: 10, des: 17, con: 16 },
    ataques: [{ nome: 'Multiataque', bonus: null, dano: 'dois toques' }, { nome: 'Toque', bonus: 6, dano: '2d6+3 fogo + incendeia (1d10 no início do turno do alvo)' }],
    tracos: ['Forma Ígnea: quem o toca ou acerta corpo a corpo sofre 1d10 fogo; entra no espaço de criaturas', 'Iluminação (9m)', 'Susceptível à Água: 1d10 por 1,5m que se move na água', 'Imune a fogo; resistência a dano físico não-mágico'] },
  { nome: 'Elemental da Água', elemental: true, nd: 5, ca: 14, pv: 114, desloc: '9m · natação 27m', nada: true, atributos: { for: 18, des: 14, con: 18 },
    ataques: [{ nome: 'Multiataque', bonus: null, dano: 'dois golpes' }, { nome: 'Golpe', bonus: 7, dano: '2d8+4 concussão' }],
    tracos: ['Forma Aquática: entra no espaço de criaturas', 'Sorver (recarga 4-6): FOR CD 15, 2d8+4 concussão, agarra e afoga', 'Resistência a ácido e a dano físico não-mágico'] },
];

// Formas elementais que ESTE druida pode assumir (Círculo da Lua a partir do N10).
function formasElementaisDisponiveis(nivel, subclasse) {
  return (subclasse === 'Círculo da Lua' && nivel >= 10) ? FORMAS_ELEMENTAIS.slice() : [];
}

// Trava de nível (PHB): {nd, nado, voo} ou null se ainda não tem Forma Selvagem.
function limiteFormaSelvagem(nivel, subclasse) {
  if (!nivel || nivel < 2) return null;
  const lua = subclasse === 'Círculo da Lua';
  const nd = lua
    ? (nivel >= 6 ? Math.max(1, Math.floor(nivel / 3)) : 1)
    : (nivel >= 8 ? 1 : (nivel >= 4 ? 0.5 : 0.25));
  return { nd, nado: nivel >= 4, voo: nivel >= 8 };
}

// Formas que ESTE druida pode assumir agora (ordenadas por ND e nome).
function formasSelvagensDisponiveis(nivel, subclasse) {
  const lim = limiteFormaSelvagem(nivel, subclasse);
  if (!lim) return [];
  return FORMAS_SELVAGENS
    .filter(f => f.nd <= lim.nd && (lim.nado || !f.nada) && (lim.voo || !f.voa))
    .sort((a, b) => (a.nd - b.nd) || a.nome.localeCompare(b.nome));
}

function formaSelvagemDados(nome) {
  return FORMAS_SELVAGENS.find(f => f.nome === nome)
    || FORMAS_ELEMENTAIS.find(f => f.nome === nome) || null;
}

// Rótulo amigável do ND (0.125 → ⅛ etc.)
function ndRotulo(nd) {
  return nd === 0.125 ? '⅛' : nd === 0.25 ? '¼' : nd === 0.5 ? '½' : String(nd);
}

// Export p/ os testes em Node (no navegador vira global como os demais módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FORMAS_SELVAGENS, FORMAS_ELEMENTAIS, limiteFormaSelvagem, formasSelvagensDisponiveis, formasElementaisDisponiveis, formaSelvagemDados, ndRotulo };
}
