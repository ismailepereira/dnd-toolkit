// =====================================================
// MULTICLASSE (Fase 8B) — regras de 5e para combinar duas classes
// -----------------------------------------------------
// Modelo de dados: ficha.classes = [{ classe, nivel, subclasse }, ...]
// A PRIMEIRA entrada é sempre espelhada em ficha.classe/ficha.nivel/ficha.subclasse
// (compatibilidade total com todo o resto do app, que só conhece uma classe).
// ficha.nivel continua sendo o NÍVEL TOTAL do personagem (soma de todas as classes)
// — é o valor certo para bônus de proficiência, XP e limite de nível 20.
//
// Limite desta implementação: até 2 classes por personagem (decisão de escopo,
// ver CHANGELOG.md). O motor está pronto para mais, mas a UI de nível só
// oferece adicionar uma 2ª classe.
// =====================================================

// ---------- Pré-requisitos de atributo p/ multiclassar (PHB) ----------
// modo 'todos' = precisa de 13 em TODOS os atributos listados
// modo 'qualquer' = precisa de 13 em PELO MENOS UM
const PREREQ_MULTICLASSE = {
  'Bárbaro':     { modo: 'todos', attrs: ['for'] },
  'Bardo':       { modo: 'todos', attrs: ['car'] },
  'Clérigo':     { modo: 'todos', attrs: ['sab'] },
  'Druida':      { modo: 'todos', attrs: ['sab'] },
  'Guerreiro':   { modo: 'qualquer', attrs: ['for', 'des'] },
  'Ladino':      { modo: 'todos', attrs: ['des'] },
  'Mago':        { modo: 'todos', attrs: ['int'] },
  'Monge':       { modo: 'todos', attrs: ['des', 'sab'] },
  'Paladino':    { modo: 'todos', attrs: ['for', 'car'] },
  'Patrulheiro': { modo: 'todos', attrs: ['des', 'sab'] },
  'Feiticeiro':  { modo: 'todos', attrs: ['car'] },
  'Bruxo':       { modo: 'todos', attrs: ['car'] },
};

function atendePreRequisito(attrs, classe) {
  const req = PREREQ_MULTICLASSE[classe];
  if (!req) return true;
  const ok13 = a => (attrs[a] || 0) >= 13;
  return req.modo === 'qualquer' ? req.attrs.some(ok13) : req.attrs.every(ok13);
}

function textoPreRequisito(classe) {
  const req = PREREQ_MULTICLASSE[classe];
  if (!req) return '';
  const NOMES = { for: 'Força', des: 'Destreza', con: 'Constituição', int: 'Inteligência', sab: 'Sabedoria', car: 'Carisma' };
  const lista = req.attrs.map(a => NOMES[a]).join(req.modo === 'qualquer' ? ' ou ' : ' e ');
  return `13 de ${lista}`;
}

// Pode adicionar `novaClasse` como classe extra? Precisa do pré-requisito de
// TODAS as classes que já tem (para poder "sair" delas) e da nova (p/ "entrar").
function classesAtuais(ficha) {
  return (ficha.classes && ficha.classes.length) ? ficha.classes : [{ classe: ficha.classe, nivel: ficha.nivel, subclasse: ficha.subclasse || '' }];
}

function podeMulticlassarPara(ficha, novaClasse) {
  const atuais = classesAtuais(ficha);
  if (atuais.some(c => c.classe === novaClasse)) return { ok: true }; // já tem níveis nela: é só subir, não multiclassar
  if (atuais.length >= 2) return { ok: false, motivo: 'Este personagem já tem 2 classes — o Criador só permite multiclasse com até 2 (decisão de escopo desta fase).' };
  const semPrereqAtual = atuais.find(c => !atendePreRequisito(ficha.atributos, c.classe));
  if (semPrereqAtual) return { ok: false, motivo: `Precisa de ${textoPreRequisito(semPrereqAtual.classe)} para manter níveis em ${semPrereqAtual.classe}.` };
  if (!atendePreRequisito(ficha.atributos, novaClasse)) return { ok: false, motivo: `Precisa de ${textoPreRequisito(novaClasse)} para multiclassar em ${novaClasse}.` };
  return { ok: true };
}

// ---------- Proficiências limitadas ao multiclassar (PHB, "Proficiências Ganhas") ----------
// Só se aplica à(s) classe(s) que NÃO for a primeira (a primeira ganha a tabela cheia normal).
const PROF_MULTICLASSE = {
  'Bárbaro':     { armadura: ['escudo'], arma: 'marcial' },
  'Bardo':       { armadura: ['leve'], arma: null },
  'Clérigo':     { armadura: ['leve', 'media', 'escudo'], arma: null },
  'Druida':      { armadura: ['leve', 'media', 'escudo'], arma: null },
  'Guerreiro':   { armadura: ['leve', 'media', 'escudo'], arma: 'marcial' },
  'Monge':       { armadura: [], arma: 'simples+' },
  'Paladino':    { armadura: ['leve', 'media', 'escudo'], arma: 'marcial' },
  'Patrulheiro': { armadura: ['leve'], arma: 'marcial' },
  'Ladino':      { armadura: ['leve'], arma: null },
  'Feiticeiro':  { armadura: [], arma: null },
  'Mago':        { armadura: [], arma: null },
  'Bruxo':       { armadura: ['leve'], arma: 'simples' },
};

const ORDEM_ARMA = ['nenhuma', 'simples', 'simples+', 'marcial'];

// Proficiências EFETIVAS de um personagem (mono ou multiclasse): a 1ª classe
// registrada dá a tabela cheia (PROF_ARMADURA/PROF_ARMA de regras.js); classes
// extras dão só o que consta em PROF_MULTICLASSE.
function proficienciasEfetivas(ficha) {
  const classes = classesAtuais(ficha);
  const armaduraSet = new Set();
  let armaNivel = 'nenhuma';
  classes.forEach((c, i) => {
    if (i === 0) {
      (PROF_ARMADURA[c.classe] || []).forEach(a => armaduraSet.add(a));
      const nv = PROF_ARMA[c.classe] || 'simples';
      if (ORDEM_ARMA.indexOf(nv) > ORDEM_ARMA.indexOf(armaNivel)) armaNivel = nv;
    } else {
      const mc = PROF_MULTICLASSE[c.classe];
      if (!mc) return;
      (mc.armadura || []).forEach(a => armaduraSet.add(a));
      if (mc.arma && ORDEM_ARMA.indexOf(mc.arma) > ORDEM_ARMA.indexOf(armaNivel)) armaNivel = mc.arma;
    }
  });
  return { armadura: [...armaduraSet], arma: armaNivel };
}

// ---------- Conjuração multiclasse ----------
// 'completo' conta nível cheio, 'meio' conta metade (arredondado p/ baixo),
// 'terco' conta um terço (Cavaleiro Arcano / Trapaceiro Arcano), 'pacto'
// (Bruxo) fica sempre SEPARADO — não entra na tabela combinada.
function tipoConjuradorClasse(classe, subclasse) {
  if (classe === 'Bruxo') return 'pacto';
  if (['Mago', 'Clérigo', 'Druida', 'Bardo', 'Feiticeiro'].includes(classe)) return 'completo';
  if (['Paladino', 'Patrulheiro'].includes(classe)) return 'meio';
  if ((classe === 'Guerreiro' && subclasse === 'Cavaleiro Arcano') || (classe === 'Ladino' && subclasse === 'Trapaceiro Arcano')) return 'terco';
  return 'nenhum';
}

function nivelConjuradorMulticlasse(classes) {
  let total = 0;
  classes.forEach(c => {
    const t = tipoConjuradorClasse(c.classe, c.subclasse);
    if (t === 'completo') total += c.nivel;
    else if (t === 'meio') total += Math.floor(c.nivel / 2);
    else if (t === 'terco') total += Math.floor(c.nivel / 3);
  });
  return total;
}

// Slots de magia combinados (array de 9 posições, como SLOTS_CONJURADOR_COMPLETO)
// para as classes que NÃO são de pacto (Bruxo fica de fora, ver pactoBruxoDaFicha).
function slotsMulticlasse(classes) {
  const nv = nivelConjuradorMulticlasse(classes.filter(c => tipoConjuradorClasse(c.classe, c.subclasse) !== 'pacto'));
  if (nv <= 0) return null;
  return SLOTS_CONJURADOR_COMPLETO[Math.min(20, Math.max(1, nv))];
}

// Slots de Pacto Mágico do Bruxo, calculados só pelo nível do personagem NA classe Bruxo.
function pactoBruxoDaFicha(classes) {
  const bruxo = classes.find(c => c.classe === 'Bruxo');
  if (!bruxo) return null;
  return SLOTS_BRUXO[Math.min(20, Math.max(1, bruxo.nivel))] || null;
}

// ---------- Ataque Extra (não acumula entre classes) ----------
// Retorna quantos ataques EXTRAS (além do 1º) essa classe concede, NO NÍVEL
// DELA (não no nível total do personagem).
function ataquesExtraDaClasse(classe, nivelNaClasse) {
  if (classe === 'Guerreiro') {
    if (nivelNaClasse >= 20) return 3;
    if (nivelNaClasse >= 11) return 2;
    if (nivelNaClasse >= 5) return 1;
    return 0;
  }
  if (['Bárbaro', 'Monge', 'Paladino', 'Patrulheiro'].includes(classe)) {
    return nivelNaClasse >= 5 ? 1 : 0;
  }
  return 0;
}

// Total de ataques por turno (1 + o melhor bônus entre as classes — nunca soma).
function totalAtaques(ficha) {
  const classes = classesAtuais(ficha);
  const extra = Math.max(0, ...classes.map(c => ataquesExtraDaClasse(c.classe, c.nivel)));
  return 1 + extra;
}

// ---------- Recursos/características: nível "efetivo" de uma classe específica ----------
// Dado um personagem multiclasse, devolve o nível QUE O PERSONAGEM TEM NAQUELA
// classe (não o total). Para mono-classe, é simplesmente ficha.nivel.
function nivelNaClasse(ficha, classe) {
  const classes = classesAtuais(ficha);
  const c = classes.find(x => x.classe === classe);
  return c ? c.nivel : 0;
}
