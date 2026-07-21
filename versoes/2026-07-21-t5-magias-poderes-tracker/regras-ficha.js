// =====================================================
// REGRAS DERIVADAS DA FICHA — fonte única (5e)
// Funções PURAS compartilhadas por Criador (preview/salvar), Modo de Jogo e
// PDF. Antes, CA/percepção/CD de magia eram calculadas em cópias separadas
// (criador.js e jogo.js) que podiam divergir; agora a regra vive só aqui.
// Depende de: mod (dados5e.js), ARMADURAS (dados5e.js), CONJURACAO (dados5e.js),
// CLASSES + PB (classes.js), RACAS_DETALHE (dados5e.js) — carregar depois deles.
// =====================================================

// CA (Classe de Armadura).
// classes: ARRAY de nomes de classe (multiclasse manda a lista toda; o Criador
// passa [classe]). Defesa Sem Armadura de Bárbaro/Monge vale se QUALQUER
// classe do personagem a tiver (mesma regra que o Modo de Jogo já usava).
function calcularCA({ classes, armadura, escudo, estilo, atributos }) {
  const arm = ARMADURAS[armadura] || ARMADURAS['Sem armadura'];
  const dexMod = mod(atributos.des);
  const lista = classes || [];
  let ca;
  if (armadura === 'Sem armadura' && lista.includes('Bárbaro')) ca = 10 + dexMod + mod(atributos.con);
  else if (armadura === 'Sem armadura' && lista.includes('Monge')) ca = 10 + dexMod + mod(atributos.sab);
  else if (arm.tipo === 'leve') ca = arm.base + dexMod;
  else if (arm.tipo === 'media') ca = arm.base + Math.min(dexMod, 2);
  else ca = arm.base;
  if (escudo) ca += 2;
  if (estilo === 'Defesa' && armadura !== 'Sem armadura') ca += 1;
  return ca;
}

// Percepção passiva: 10 + mod SAB (+ proficiência se treinado em Percepção).
function percepcaoPassiva(atributos, periciasProficientes, pb) {
  const tem = Array.isArray(periciasProficientes)
    ? periciasProficientes.includes('Percepção')
    : !!(periciasProficientes && periciasProficientes.has && periciasProficientes.has('Percepção'));
  return 10 + mod(atributos.sab) + (tem ? pb : 0);
}

// CD de magia e bônus de ataque mágico da classe; null se a classe não
// conjura (ou ainda não conjura nesse nível — Paladino/Patrulheiro começam no 2).
function cdConjuracao(classe, nivel, atributos, pb) {
  const cj = CONJURACAO[classe];
  if (!cj || nivel < (cj.desdeNivel || 1)) return null;
  const m = mod(atributos[cj.atributo]);
  return { atributo: cj.atributo, cd: 8 + pb + m, ataque: pb + m };
}

// PV máximo de personagem MONO-classe: máximo do dado no nível 1 + média nos
// demais + mod CON por nível + extra racial (Anão da Colina). Multiclasse tem
// caminho próprio (multiclasse.js) — aqui é a regra usada pelo Criador.
const MEDIA_DADO_VIDA = { d6: 4, d8: 5, d10: 6, d12: 7 };
function pvMaximoMonoclasse(classe, nivel, atributos, raca) {
  const chave = CLASSE_NOME_PARA_CHAVE[classe];
  const dado = (CLASSES[chave] && CLASSES[chave].dadoVida) || 'd8';
  const conMod = mod(atributos.con);
  let hp = parseInt(dado.replace('d', ''), 10) + conMod;
  for (let n = 2; n <= nivel; n++) hp += MEDIA_DADO_VIDA[dado] + conMod;
  const r = RACAS_DETALHE[raca] || {};
  hp += (r.pvExtraPorNivel || 0) * nivel;
  return Math.max(1, hp);
}

// Export p/ os testes em Node (no navegador vira global como os demais módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcularCA, percepcaoPassiva, cdConjuracao, pvMaximoMonoclasse };
}
