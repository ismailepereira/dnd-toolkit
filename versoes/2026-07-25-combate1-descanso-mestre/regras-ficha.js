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

// Recursos/poderes de classe com contagem por descanso (Fúria, Ki, Canalizar
// Divindade, etc.). Função PURA por classe — some as pools de cada classe da
// multiclasse por fora. cm = modificador de Carisma (para pools que dependem
// dele: Inspiração Bárdica, Sentido Divino do Paladino).
// Usada pelo Modo de Jogo (jogo.js) e pelo tracker de combate do Mestre (app.js).
function recursosDeClasse5e(cl, nivel, cm) {
  const r = [];
  if (cl === 'Bárbaro') r.push({ nome: 'Fúria', max: nivel >= 17 ? 6 : nivel >= 12 ? 5 : nivel >= 6 ? 4 : nivel >= 3 ? 3 : 2, rec: 'longo' });
  if (cl === 'Monge' && nivel >= 2) r.push({ nome: 'Pontos de Ki', max: nivel, rec: 'curto' });
  if (cl === 'Guerreiro') { if (nivel >= 2) r.push({ nome: 'Surto de Ação', max: nivel >= 17 ? 2 : 1, rec: 'curto' }); r.push({ nome: 'Retomar o Fôlego', max: 1, rec: 'curto' }); }
  if (cl === 'Bardo') r.push({ nome: 'Inspiração Bárdica', max: Math.max(1, cm), rec: nivel >= 5 ? 'curto' : 'longo' });
  if (cl === 'Clérigo' && nivel >= 2) r.push({ nome: 'Canalizar Divindade', max: nivel >= 18 ? 3 : nivel >= 6 ? 2 : 1, rec: 'curto' });
  if (cl === 'Druida' && nivel >= 2) r.push({ nome: 'Forma Selvagem', max: 2, rec: 'curto' });
  if (cl === 'Feiticeiro' && nivel >= 2) r.push({ nome: 'Pontos de Feitiçaria', max: nivel, rec: 'longo' });
  if (cl === 'Paladino') {
    r.push({ nome: 'Sentido Divino', max: Math.max(1, 1 + cm), rec: 'longo' });
    r.push({ nome: 'Imposição das Mãos (PV)', max: nivel * 5, rec: 'longo', pool: true });
    if (nivel >= 3) r.push({ nome: 'Canalizar Divindade', max: 1, rec: 'curto' });
  }
  return r;
}

// Descanso 5e como funções PURAS (mutam a ficha passada). Extraídas de jogo.js
// para o Mestre conceder descanso pelo tracker (app.js): na fase de combate o
// descanso passou a ser ATIVADO SÓ PELO MESTRE — o jogador não recupera slots/
// recursos sozinho. "Recuperar" = zerar o que aquele descanso devolve.
function aplicarDescansoCurto5e(f) {
  f.recursosUsados = f.recursosUsados || {};
  const classes = (typeof classesAtuais === 'function') ? classesAtuais(f)
    : [{ classe: f.classe, nivel: f.nivel || 1, subclasse: f.subclasse || '' }];
  const cm = (typeof mod === 'function') ? mod((f.atributos || {}).car || 10) : 0;
  let recs = [];
  classes.forEach(c => { recs = recs.concat(recursosDeClasse5e(c.classe, c.nivel, cm)); });
  recs.forEach(r => { if (r.rec === 'curto') f.recursosUsados[r.nome] = 0; });
  f.pactoUsados = 0;        // Bruxo recupera os espaços de pacto no descanso curto
  f.inspiracoesDadas = [];  // dados de Inspiração já expiraram (duram ~1 min)
  return f;
}
function aplicarDescansoLongo5e(f) {
  f.hpAtual = f.hpMax;
  f.pvTemp = 0;
  f.slotsUsados = {};
  f.pactoUsados = 0;
  f.recursosUsados = {};
  f.inspiracoesDadas = [];
  f.formaAtiva = null;      // a Forma Selvagem não sobrevive à noite
  f.arremessadas = {};      // recolhe o que foi arremessado
  f.recArcanaUsada = false; // Recuperação Arcana do Mago volta no descanso longo
  const dvMax = f.nivel || 1;
  f.dvUsados = Math.max(0, (f.dvUsados || 0) - Math.max(1, Math.floor(dvMax / 2)));
  return f;
}

// F4: Resumo de combate ("cola" do jogador) — escolhe os poucos números que
// importam no turno: ataque principal, melhor conjuração (CD) e o recurso de
// classe a lembrar. Função PURA; CA/PV/deslocamento ficam com quem renderiza
// (já os tem à mão). Usada pelo Criador (etapa final) e pelo PDF.
// Depende de ataqueArma (regras.js) e classesAtuais (multiclasse.js) quando
// existem — sem eles (contexto de teste) cai no comportamento monoclasse.
function resumoCombate5e(f) {
  const atributos = f.atributos || {};
  const nivel = f.nivel || 1;
  const pb = (typeof PB === 'function') ? PB(nivel) : (2 + Math.floor((nivel - 1) / 4));
  const classes = (typeof classesAtuais === 'function')
    ? classesAtuais(f)
    : ((f.classes && f.classes.length) ? f.classes : [{ classe: f.classe, nivel, subclasse: f.subclasse || '' }]);
  // ataque principal: a arma da mão principal; senão a de maior bônus de acerto
  let ataque = null;
  if (typeof ataqueArma === 'function') {
    const eq = f.equipado || {};
    const nomes = [...new Set(f.itens || [])];
    const cand = nomes.map(n => ataqueArma(f, n, pb)).filter(Boolean);
    ataque = cand.find(a => a.nome === eq.maoPrincipal)
      || cand.slice().sort((a, b) => b.ataque - a.ataque)[0] || null;
  }
  // melhor conjuração entre as classes (a de maior CD)
  let conj = null;
  classes.forEach(c => {
    const cd = (typeof cdConjuracao === 'function') ? cdConjuracao(c.classe, c.nivel, atributos, pb) : null;
    if (cd && (!conj || cd.cd > conj.cd)) conj = { cd: cd.cd, ataque: cd.ataque };
  });
  const magiaDestaque = (f.truques && f.truques[0]) || (f.magias1 && f.magias1[0]) || null;
  // recurso de classe a lembrar: o primeiro (mais icônico) somando as classes
  const cm = mod(atributos.car != null ? atributos.car : 10);
  let recursos = [];
  classes.forEach(c => { recursos = recursos.concat(recursosDeClasse5e(c.classe, c.nivel, cm) || []); });
  const recurso = recursos[0] || null;
  return { ataque, conj, magiaDestaque, recurso };
}

// F4: HTML do cartão "Seu personagem em combate" — o MESMO markup (com estilos
// inline, para servir tanto na etapa final do Criador quanto no PDF impresso).
// extras = { ca, pv, deslocamento, iniciativa } que o chamador já tem à mão.
function cartaoCombateHtml(f, extras) {
  extras = extras || {};
  const r = resumoCombate5e(f);
  const escq = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => (typeof n === 'number' ? (n >= 0 ? '+' : '') + n : n);
  const ca = extras.ca != null ? extras.ca : (f.ca != null ? f.ca : '—');
  const pv = extras.pv != null ? extras.pv : (f.hpMax != null ? f.hpMax : (f.hp != null ? f.hp : '—'));
  const desloc = extras.deslocamento != null ? extras.deslocamento : '';
  const inic = extras.iniciativa != null ? extras.iniciativa : (f.iniciativa || 0);
  const recNome = { curto: 'descanso curto', longo: 'descanso longo' };
  const linhas = [];
  linhas.push(`<div style="display:flex;gap:14px;flex-wrap:wrap;font-size:14px;margin-bottom:6px">
    <span>🛡️ CA <b>${escq(ca)}</b></span><span>❤️ PV <b>${escq(pv)}</b></span>${desloc !== '' ? `<span>👟 ${escq(desloc)}m</span>` : ''}<span>⚡ Inic. <b>${fmt(inic)}</b></span></div>`);
  if (r.ataque) linhas.push(`<div style="margin:3px 0"><b>🗡️ Ataque principal:</b> ${escq(r.ataque.nome)} — <b>${fmt(r.ataque.ataque)}</b> p/ acertar · ${escq(r.ataque.dano)}${r.ataque.semProf ? ' ⚠ sem proficiência' : ''}</div>`);
  else linhas.push(`<div style="margin:3px 0;opacity:.75"><b>🗡️ Ataque principal:</b> nenhuma arma na bolsa — equipe uma na etapa de equipamento.</div>`);
  if (r.conj) linhas.push(`<div style="margin:3px 0"><b>✨ Magia:</b> CD <b>${escq(r.conj.cd)}</b> · ataque mágico <b>${fmt(r.conj.ataque)}</b>${r.magiaDestaque ? ` · destaque: ${escq(r.magiaDestaque)}` : ''}</div>`);
  if (r.recurso) {
    const usos = (r.recurso.max != null && !r.recurso.pool) ? ` — ${r.recurso.max}×` : '';
    const quando = r.recurso.rec ? ` por ${recNome[r.recurso.rec] || r.recurso.rec}` : '';
    linhas.push(`<div style="margin:3px 0"><b>🎲 Não esqueça:</b> ${escq(r.recurso.nome)}${usos}${quando}</div>`);
  }
  return `<div style="border:2px solid #c85a35;border-radius:10px;padding:10px 12px;margin:0 0 12px;background:rgba(200,90,53,.08)">
    <div style="font-weight:bold;color:#c85a35;font-size:15px;margin-bottom:4px">⚔️ Seu personagem em combate</div>
    ${linhas.join('')}
    <div style="font-size:11px;opacity:.6;margin-top:5px">Cola rápida do turno: seu ataque, sua magia e o recurso a não esquecer.</div>
  </div>`;
}

// Export p/ os testes em Node (no navegador vira global como os demais módulos)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcularCA, percepcaoPassiva, cdConjuracao, pvMaximoMonoclasse, recursosDeClasse5e, resumoCombate5e, cartaoCombateHtml };
}
