// ===== Utilidades de armazenamento =====
const Storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ===== Tabs =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// =====================================================
// FICHAS (compartilhadas via API - mestre e jogadores veem o mesmo grupo)
// =====================================================
let fichas = [];

const listaFichas = document.getElementById('listaFichas');

async function carregarFichas() {
  const res = await fetch('/api/fichas');
  fichas = await res.json();
  renderFichas();
}

let _filaSalvarFichas = Promise.resolve();
function salvarFichas() {
  // captura o conteúdo AGORA (evita que o listener de tempo real atropele a gravação)
  const body = JSON.stringify(fichas);
  _filaSalvarFichas = _filaSalvarFichas.then(() =>
    fetch('/api/fichas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
  ).catch(() => {});
  return _filaSalvarFichas;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderFichas() {
  listaFichas.innerHTML = '';
  if (fichas.length === 0) {
    listaFichas.innerHTML = '<p style="color:var(--text-dim)">Nenhuma ficha ainda. Clique em "+ Nova Ficha".</p>';
    return;
  }
  fichas.forEach(f => {
    const pct = f.hpMax > 0 ? Math.max(0, Math.min(100, (f.hpAtual / f.hpMax) * 100)) : 0;
    const card = document.createElement('div');
    card.className = 'ficha-card';
    card.innerHTML = `
      <h3>${escapeHtml(f.nome) || 'Sem nome'}</h3>
      <div class="sub">${escapeHtml(f.raca) || ''} ${escapeHtml(f.classe) || ''} - Nível ${f.nivel}</div>
      <div>HP: ${f.hpAtual} / ${f.hpMax} | CA: ${f.ca}</div>
      <div class="hp-bar"><div class="hp-bar-fill" style="width:${pct}%"></div></div>
      <label class="check-chip loja-especial-toggle ${f.lojaEspecialLiberada ? 'on' : ''}" title="Libera a Loja Especial (itens mágicos) só para este personagem">
        <input type="checkbox" data-loja-especial-ficha="${f.id}" ${f.lojaEspecialLiberada ? 'checked' : ''}> 🔓 Loja Especial
      </label>
      <div class="ficha-card-acoes">
        <button class="btn-jogar" data-jogar="${f.id}">▶ Jogar</button>
        <button class="btn-editar" data-editar="${f.id}">✎ Editar</button>
      </div>
    `;
    card.querySelector('[data-jogar]').addEventListener('click', (e) => {
      e.stopPropagation();
      Jogo.abrir(f, { aoAtualizar: () => { salvarFichas(); renderFichas(); } });
    });
    card.querySelector('[data-editar]').addEventListener('click', (e) => { e.stopPropagation(); abrirFicha(f.id); });
    card.querySelector('[data-loja-especial-ficha]').addEventListener('click', e => e.stopPropagation());
    card.querySelector('[data-loja-especial-ficha]').addEventListener('change', (e) => {
      f.lojaEspecialLiberada = e.target.checked;
      salvarFichas();
    });
    listaFichas.appendChild(card);
  });
  montarEnvioMestre();
}

// ----- Fase 9: Loja Especial (itens mágicos) — liberação por campanha inteira -----
let lojaEspecialCampanha = false;
async function carregarLojaEspecial() {
  try { const r = await (await fetch('/api/loja_especial')).json(); lojaEspecialCampanha = !!r.liberada; } catch (e) { lojaEspecialCampanha = false; }
  window.LOJA_ESPECIAL_CAMPANHA = lojaEspecialCampanha;
  atualizarToggleLojaEspecialCampanha();
}
function atualizarToggleLojaEspecialCampanha() {
  const chk = document.getElementById('lojaEspecialCampanhaChk');
  if (chk) chk.checked = lojaEspecialCampanha;
}
function montarToggleLojaEspecialCampanha() {
  const chk = document.getElementById('lojaEspecialCampanhaChk');
  if (!chk) return;
  chk.addEventListener('change', () => {
    lojaEspecialCampanha = chk.checked;
    window.LOJA_ESPECIAL_CAMPANHA = lojaEspecialCampanha;
    fetch('/api/loja_especial', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liberada: lojaEspecialCampanha }) }).catch(() => {});
  });
}
carregarLojaEspecial();
montarToggleLojaEspecialCampanha();

// ----- Mestre envia ouro/itens direto a uma ficha (loot, recompensa, mercador) -----
let _envioMontado = false;
function montarEnvioMestre() {
  const wrap = document.getElementById('envioWrap');
  if (!wrap) return;
  const selF = document.getElementById('envioFicha');
  const anterior = selF.value;
  selF.innerHTML = fichas.map(f => `<option value="${escapeHtml(f.id)}">${escapeHtml(f.nome)}</option>`).join('');
  if (anterior && fichas.some(f => f.id === anterior)) selF.value = anterior;

  // catálogo: equipamento.js + itens (mágicos) da loja antiga + itens do Mestre
  // (rebuilda sempre, para refletir itens mágicos recém-criados na aba do Mestre)
  const selI = document.getElementById('envioItem');
  const itemAnterior = selI.value;
  const nomes = new Set();
  let ops = '<option value="">— sem item —</option>';
  if (typeof CATALOGO !== 'undefined') CATALOGO.forEach(i => { if (!nomes.has(i.nome)) { nomes.add(i.nome); ops += `<option value="${escapeHtml(i.nome)}">${escapeHtml(i.nome)}</option>`; } });
  if (typeof ITENS_PADRAO !== 'undefined') ITENS_PADRAO.forEach(i => { if (!nomes.has(i.nome)) { nomes.add(i.nome); ops += `<option value="${escapeHtml(i.nome)}">${escapeHtml(i.nome)} ✨</option>`; } });
  (window.ITENS_MESTRE || []).forEach(i => { if (!nomes.has(i.nome)) { nomes.add(i.nome); ops += `<option value="${escapeHtml(i.nome)}">🛠️ ${escapeHtml(i.nome)} (${escapeHtml(i.raridade)})</option>`; } });
  selI.innerHTML = ops;
  if (itemAnterior && nomes.has(itemAnterior)) selI.value = itemAnterior;

  if (_envioMontado) return;
  _envioMontado = true;
  document.getElementById('envioBtn').addEventListener('click', () => {
    const f = fichas.find(x => x.id === selF.value);
    if (!f) return;
    const ouro = Number(document.getElementById('envioOuro').value) || 0;
    const item = selI.value;
    const qtd = Math.max(1, Number(document.getElementById('envioQtd').value) || 1);
    if (!ouro && !item) return;
    if (ouro) f.ouro = Math.max(0, (f.ouro || 0) + ouro);
    if (item) {
      f.itens = f.itens || [];
      f.municao = (f.municao && f.municao.nome != null) ? f.municao : { nome: '', qtd: 0 };
      const it = (typeof itemCatalogo === 'function') ? itemCatalogo(item) : null;
      if (it && it.cat === 'municao' && (!f.municao.nome || f.municao.nome === it.municaoNome)) {
        f.municao.nome = it.municaoNome;
        f.municao.qtd += it.qtdPack * qtd;
      } else {
        for (let k = 0; k < qtd; k++) f.itens.push(item);
      }
    }
    salvarFichas();
    renderFichas();
    const msg = document.getElementById('envioMsg');
    if (msg) {
      msg.textContent = `✓ ${[ouro ? `${ouro > 0 ? '+' : ''}${ouro} po` : '', item ? `${qtd}× ${item}` : ''].filter(Boolean).join(' e ')} → ${f.nome}`;
      setTimeout(() => { msg.textContent = ''; }, 5000);
    }
    document.getElementById('envioOuro').value = '';
  });
}

// Abre o Criador de Personagem (preview ao vivo + regras 5e)
function abrirFicha(id) {
  const f = id ? fichas.find(x => x.id === id) : null;
  Criador.abrir(f, {
    aoSalvar(novo) {
      if (f) Object.assign(f, novo);
      else fichas.push({ id: uid(), ...novo });
      salvarFichas();
      renderFichas();
    },
    aoExcluir: f ? () => {
      fichas = fichas.filter(x => x.id !== f.id);
      salvarFichas();
      renderFichas();
    } : null,
  });
}

document.getElementById('novaFicha').addEventListener('click', () => abrirFicha(null));

carregarFichas();

// =====================================================
// COMBATE UNIFICADO (personagens + monstros, rolagem e dano)
// Estado compartilhado via API (jogadores acompanham em tempo real)
// =====================================================
let combate = { combatentes: [], turno: 0, rodada: 1, log: [] };
let alvoSelecionado = null;

// ----- Tipos de dano + Resistência / Vulnerabilidade / Imunidade (Fase 2.1) -----
const DANOS_TIPOS = ['corte', 'perfurante', 'concussão', 'ácido', 'fogo', 'frio', 'elétrico', 'veneno', 'necrótico', 'radiante', 'psíquico', 'trovão', 'força'];
const semAcento = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
function tipoCanon(t) { if (!t) return null; const s = semAcento(t); return DANOS_TIPOS.find(d => semAcento(d) === s) || null; }
// multiplicador de dano de um combatente para um tipo (0 imune, 0.5 resist, 2 vuln, 1 normal)
function multiplicadorDano(c, tipo) {
  const t = tipoCanon(tipo); if (!t) return 1;
  if ((c.imune || []).includes(t)) return 0;
  if ((c.resist || []).includes(t)) return 0.5;
  if ((c.vuln || []).includes(t)) return 2;
  return 1;
}
function rotuloMult(mult) { return mult === 0 ? ' (IMUNE)' : mult === 0.5 ? ' (resistência ½)' : mult === 2 ? ' (VULNERÁVEL ×2)' : ''; }
// Auto-detecta defesas a partir dos traços do monstro (texto livre → tipos estruturados)
function defesasDeTracos(tracos) {
  const res = { resist: [], vuln: [], imune: [] };
  (tracos || []).forEach(tx => {
    const low = semAcento(tx);
    DANOS_TIPOS.forEach(d => {
      const dn = semAcento(d);
      if (!low.includes(dn)) return;
      // procura a palavra-chave mais próxima antes do tipo
      if (/imune|imunidade/.test(low) && !res.imune.includes(d)) res.imune.push(d);
      else if (/vulner/.test(low) && !res.vuln.includes(d)) res.vuln.push(d);
      else if (/resist/.test(low) && !res.resist.includes(d)) res.resist.push(d);
    });
  });
  return res;
}

const listaCombate = document.getElementById('listaCombate');
const turnoInfo = document.getElementById('turnoInfo');
const combateLog = document.getElementById('combateLog');
const combMonstroSel = document.getElementById('combMonstroSel');

// preenche o seletor de monstros
MONSTROS.forEach(m => {
  const o = document.createElement('option');
  o.value = m.nome; o.textContent = `${m.nome} (ND ${m.cr})`;
  combMonstroSel.appendChild(o);
});

let _filaCombate = Promise.resolve();
function salvarCombate() {
  const body = JSON.stringify(combate); // captura agora (evita atropelo do tempo real)
  _filaCombate = _filaCombate.then(() =>
    fetch('/api/combate', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })
  ).catch(() => {});
  return _filaCombate;
}
async function carregarCombate() {
  try { combate = await (await fetch('/api/combate')).json(); } catch (e) {}
  if (!combate || !combate.combatentes) combate = { combatentes: [], turno: 0, rodada: 1, log: [] };
  renderCombate();
}

const dado = faces => 1 + Math.floor(Math.random() * faces);
function rolarFormula(f) {
  const mt = String(f).match(/(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?/i);
  if (!mt) return { total: 0, dice: 0, bonus: 0, txt: '0' };
  const n = mt[1] ? +mt[1] : 1, faces = +mt[2], bonus = mt[3] ? parseInt(mt[3].replace(/\s/g, '')) : 0;
  let dice = 0; const ds = [];
  for (let i = 0; i < n; i++) { const r = dado(faces); ds.push(r); dice += r; }
  return { total: dice + bonus, dice, bonus, txt: `${ds.join('+')}${bonus ? (bonus > 0 ? '+' + bonus : bonus) : ''}=${dice + bonus}` };
}
function logCombate(t) { combate.log.unshift(`R${combate.rodada} · ${t}`); combate.log = combate.log.slice(0, 40); }
const soNum = s => { const m = String(s).match(/\d+/); return m ? +m[0] : 10; };

function parseAcoes(m) {
  return (m.acoes || []).map(a => {
    const nome = a.split(':')[0].trim();
    const bm = a.match(/([+-]\d+)\s*para acertar/);
    const dm = a.match(/\((\d+d\d+(?:[+-]\d+)?)\)/);
    // tipo de dano = palavra após o "(XdY+Z)" ou após "Dano: N (...)"
    const tm = a.match(/\)\s*([a-zçãéíóôú]+)/i);
    return { texto: a, nome, bonus: bm ? parseInt(bm[1]) : null, dano: dm ? dm[1] : null, dmgTipo: tm ? tipoCanon(tm[1]) : null };
  }).filter(x => x.bonus !== null || x.dano !== null);
}
// nº de ataques do "Múltiplos Ataques / Multiataque" descrito no texto das ações
function multiataqueDe(m) {
  const txt = (m.acoes || []).find(a => /m[uú]ltiplos? ataques|multiataque/i.test(a)) || '';
  if (!txt) return 0;
  const mm = txt.match(/\b(dois|duas|tr[eê]s|quatro|um[a]?)\b/i);
  if (mm) { const k = semAcento(mm[1]); return k.startsWith('dois') || k.startsWith('dua') ? 2 : k.startsWith('tre') ? 3 : k.startsWith('quatro') ? 4 : 1; }
  const dn = txt.match(/(\d+)\s*ataques/i); return dn ? +dn[1] : 2;
}

// Atributo de conjuração por classe (p/ ataques de truque dos PJs)
const ATTR_CONJ = { 'Mago': 'int', 'Clérigo': 'sab', 'Druida': 'sab', 'Bardo': 'car', 'Feiticeiro': 'car', 'Bruxo': 'car', 'Paladino': 'car', 'Patrulheiro': 'sab' };
// Constrói as ações de combate de um PJ a partir da ficha (armas + truques de dano)
function acoesDoPC(f) {
  const out = [];
  const pb = (typeof PB === 'function') ? PB(f.nivel || 1) : 2;
  // armas que o PJ carrega
  (f.itens || []).forEach(it => {
    if (typeof ataqueArma !== 'function') return;
    const atk = ataqueArma(f, it, pb); // { nome, dano:'1d8+3 corte', ataque, semProf }
    if (!atk) return;
    const md = String(atk.dano).match(/(\d+d\d+(?:[+-]\d+)?)\s*([a-zçãéíóôú]+)?/i);
    out.push({ texto: `${it}: +${atk.ataque} p/ acertar, ${atk.dano}`, nome: it, bonus: atk.ataque, dano: md ? md[1] : null, dmgTipo: md ? tipoCanon(md[2]) : null });
  });
  // truques de dano (ataque mágico) — escalam por nível
  const attr = ATTR_CONJ[f.classe];
  if (attr && typeof MAGIAS_DETALHE !== 'undefined') {
    const atqMag = pb + mod(f.atributos[attr]);
    const escala = 1 + (f.nivel >= 5 ? 1 : 0) + (f.nivel >= 11 ? 1 : 0) + (f.nivel >= 17 ? 1 : 0);
    (f.truques || []).forEach(tq => {
      const d = MAGIAS_DETALHE[tq]; if (!d || !d.dano || d.dano === '—') return;
      const md = String(d.dano).match(/(\d+)d(\d+)\s*([a-zçãéíóôú]+)?/i); if (!md) return;
      const dados = (+md[1]) * escala, formula = `${dados}d${md[2]}`;
      out.push({ texto: `${tq} (truque): +${atqMag} p/ acertar, ${formula} ${md[3] || ''}`, nome: tq + ' ✨', bonus: atqMag, dano: formula, dmgTipo: tipoCanon(md[3]) });
    });
  }
  return out;
}

function addPersonagens() {
  let n = 0;
  fichas.forEach(f => {
    if (combate.combatentes.some(c => c.fichaId === f.id)) return;
    combate.combatentes.push({ id: uid(), tipo: 'pc', fichaId: f.id, nome: f.nome, iniciativa: dado(20) + (f.iniciativa || 0), hpAtual: f.hpAtual, hpMax: f.hpMax, ca: f.ca, condicoes: [], acoes: acoesDoPC(f), resist: [], vuln: [], imune: [] });
    n++;
  });
  logCombate(`${n} personagem(ns) entraram no combate`);
  ordenarCombate();
}

function addMonstro(nome, qtd, tipo = 'monstro') {
  const m = MONSTROS.find(x => x.nome === nome); if (!m) return;
  const acoes = parseAcoes(m), hp = soNum(m.hp), ca = soNum(m.ca), desMod = mod(m.atributos.des);
  const def = defesasDeTracos(m.tracos), multi = multiataqueDe(m);
  for (let i = 0; i < qtd; i++) {
    combate.combatentes.push({ id: uid(), tipo, monstroNome: nome, nome: (tipo === 'aliado' ? '🤝 ' : '') + m.nome + (qtd > 1 ? ' ' + (i + 1) : ''), iniciativa: dado(20) + desMod, hpAtual: hp, hpMax: hp, ca, condicoes: [], acoes, multi, resist: def.resist, vuln: def.vuln, imune: def.imune });
  }
  logCombate(`${qtd}× ${m.nome} ${tipo === 'aliado' ? 'aliado(s) entraram' : 'entraram'} no combate`);
  ordenarCombate();
}

// ----- Dano em Área / Salva em massa (Fase 2.2) -----
const ATRIB_SALVA = { for: 'Força', des: 'Destreza', con: 'Constituição', int: 'Inteligência', sab: 'Sabedoria', car: 'Carisma' };
function bonusSalva(c, attr) {
  if (c.tipo === 'pc' && c.fichaId) {
    const f = fichas.find(x => x.id === c.fichaId); if (!f) return 0;
    let b = mod(f.atributos[attr]);
    const cls = (typeof CLASSES !== 'undefined') ? CLASSES[CLASSE_NOME_PARA_CHAVE[f.classe]] : null;
    if (cls && (cls.salvaguardas || []).includes(ATRIB_SALVA[attr])) b += (typeof PB === 'function' ? PB(f.nivel || 1) : 2);
    return b;
  }
  if ((c.tipo === 'monstro' || c.tipo === 'aliado') && c.monstroNome) {
    const m = MONSTROS.find(x => x.nome === c.monstroNome); if (m) return mod(m.atributos[attr]);
  }
  return 0;
}
function renderAreaDano() {
  const wrap = document.getElementById('areaDanoPanel'); if (!wrap) return;
  if (wrap.classList.contains('hidden')) return;
  const tipoOpts = DANOS_TIPOS.map(t => `<option>${t}</option>`).join('');
  const attrOpts = Object.entries(ATRIB_SALVA).map(([k, v]) => `<option value="${k}">${v}</option>`).join('');
  const alvos = combate.combatentes.map(c => `<label class="check-chip mini"><input type="checkbox" data-area-alvo="${c.id}" checked>${escapeHtml(c.nome)}</label>`).join('');
  wrap.innerHTML = `
    <h4>💥 Dano em Área / Salva em massa</h4>
    <div class="area-linha">
      <label>Dano <input type="text" id="areaFormula" placeholder="ex.: 8d6" value="8d6" style="width:70px"></label>
      <label>Tipo <select id="areaTipo">${tipoOpts}</select></label>
      <label>Salva <select id="areaSalvaAttr"><option value="">— nenhuma —</option>${attrOpts}</select></label>
      <label>CD <input type="number" id="areaCD" value="15" style="width:54px"></label>
      <label title="Metade do dano se passar na salva"><input type="checkbox" id="areaMetade" checked> ½ se passar</label>
    </div>
    <div class="area-alvos"><b>Alvos:</b> ${alvos || '—'}</div>
    <div class="area-acoes"><button id="areaAplicar" class="btn-danger">Rolar e aplicar</button> <button id="areaFechar" class="btn-secondary">Fechar</button></div>`;
  document.getElementById('areaFechar').onclick = () => { wrap.classList.add('hidden'); };
  document.getElementById('areaAplicar').onclick = aplicarAreaDano;
}
function aplicarAreaDano() {
  const formula = document.getElementById('areaFormula').value.trim();
  const tipo = document.getElementById('areaTipo').value;
  const attr = document.getElementById('areaSalvaAttr').value;
  const cd = Number(document.getElementById('areaCD').value) || 0;
  const metade = document.getElementById('areaMetade').checked;
  const ids = [...document.querySelectorAll('[data-area-alvo]:checked')].map(x => x.dataset.areaAlvo);
  if (!ids.length) return alert('Selecione ao menos um alvo.');
  const dr = rolarFormula(formula);
  if (!dr.total) return alert('Fórmula de dano inválida (ex.: 8d6).');
  let resumo = `💥 Área (${dr.txt} ${tipo}${attr ? `, salva ${ATRIB_SALVA[attr]} CD ${cd}` : ''}):`;
  ids.forEach(id => {
    const c = combate.combatentes.find(x => x.id === id); if (!c) return;
    let bruto = dr.total, nota = '';
    if (attr) {
      const sv = dado(20), tot = sv + bonusSalva(c, attr), passou = tot >= cd;
      if (passou) { bruto = metade ? Math.floor(bruto / 2) : 0; nota = ` passou (${tot})`; }
      else nota = ` falhou (${tot})`;
    }
    const { real, mult } = aplicarDanoComb(c, bruto, tipo);
    resumo += ` [${c.nome}: ${real}${rotuloMult(mult)}${nota}]`;
  });
  logCombate(resumo); salvarCombate(); renderCombate();
}

function ordenarCombate() { combate.combatentes.sort((a, b) => b.iniciativa - a.iniciativa); combate.turno = 0; salvarCombate(); renderCombate(); }
function proximoTurnoCombate() {
  if (!combate.combatentes.length) return;
  combate.turno++;
  if (combate.turno >= combate.combatentes.length) {
    combate.turno = 0; combate.rodada++; logCombate(`— Rodada ${combate.rodada} —`);
    // recarrega ações lendárias dos chefes no início de cada rodada
    combate.combatentes.forEach(c => { if (c.chefe) c.lendAtual = c.lendMax ?? 3; });
  }
  salvarCombate(); renderCombate();
}

function aplicarDanoComb(c, v, tipo) {
  const mult = multiplicadorDano(c, tipo);
  const real = Math.floor(v * mult);
  c.hpAtual = Math.max(0, c.hpAtual - real);
  if (c.tipo === 'pc' && c.fichaId) { const f = fichas.find(x => x.id === c.fichaId); if (f) { f.hpAtual = c.hpAtual; salvarFichas(); } }
  return { real, mult };
}
function curarComb(c, v) {
  c.hpAtual = Math.min(c.hpMax, c.hpAtual + v);
  if (c.tipo === 'pc' && c.fichaId) { const f = fichas.find(x => x.id === c.fichaId); if (f) { f.hpAtual = c.hpAtual; salvarFichas(); } }
}

function umAtaque(atacante, acao, alvo) {
  const d20 = dado(20), total = d20 + (acao.bonus || 0);
  const critico = d20 === 20, erroAuto = d20 === 1;
  const acerto = critico || (!erroAuto && total >= alvo.ca);
  if (!acerto) return ` · ${acao.nome}: ERROU (${total} vs CA ${alvo.ca})`;
  if (!acao.dano) return ` · ${acao.nome}: acertou (${total}), sem dano definido`;
  const dr = rolarFormula(acao.dano);
  let bruto = dr.total;
  if (critico) bruto += rolarFormula(acao.dano).dice;
  const { real, mult } = aplicarDanoComb(alvo, bruto, acao.dmgTipo);
  return ` · ${acao.nome}: ${critico ? 'CRÍTICO! ' : ''}${real} de dano${acao.dmgTipo ? ' ' + acao.dmgTipo : ''}${rotuloMult(mult)}`;
}

function atacar(atacante, acao, vezes = 1) {
  const alvo = combate.combatentes.find(c => c.id === alvoSelecionado);
  if (!alvo) {
    const dr = acao.dano ? rolarFormula(acao.dano) : null;
    logCombate(`${atacante.nome} — ${acao.nome}${dr ? `: dano ${dr.txt}` : ''} (selecione um alvo 🎯 p/ aplicar)`);
    salvarCombate(); renderCombate(); return;
  }
  let txt = `${atacante.nome} → ${alvo.nome}${vezes > 1 ? ` (${vezes} ataques)` : ''}:`;
  for (let i = 0; i < vezes; i++) {
    txt += umAtaque(atacante, acao, alvo);
    if (alvo.hpAtual === 0) { txt += ' 💀 caiu!'; break; }
  }
  txt += ` — PV ${alvo.hpAtual}/${alvo.hpMax}`;
  logCombate(txt); salvarCombate(); renderCombate();
}

function statusPct(c) { return c.hpMax > 0 ? (c.hpAtual / c.hpMax) * 100 : 0; }

function renderCombate() {
  if (!listaCombate) return;
  // log
  combateLog.innerHTML = (combate.log || []).map(l => `<li>${escapeHtml(l)}</li>`).join('');
  if (!combate.combatentes.length) {
    turnoInfo.textContent = 'Sem combatentes. Adicione personagens e monstros.';
    listaCombate.innerHTML = '<p style="color:var(--text-dim)">Vazio.</p>';
    return;
  }
  const idxAtual = combate.turno % combate.combatentes.length;
  const atual = combate.combatentes[idxAtual];
  turnoInfo.innerHTML = `Rodada <b>${combate.rodada}</b> · Vez de <b>${escapeHtml(atual.nome)}</b>${alvoSelecionado ? ` · Alvo: <b>${escapeHtml(combate.combatentes.find(c => c.id === alvoSelecionado)?.nome || '—')}</b>` : ''}`;

  listaCombate.innerHTML = '';
  combate.combatentes.forEach((c, i) => {
    const pct = statusPct(c);
    const cor = pct > 50 ? '#3fb950' : pct > 25 ? '#d29922' : '#e94560';
    const div = document.createElement('div');
    div.className = 'comb-card' + (i === idxAtual ? ' turno' : '') + (c.id === alvoSelecionado ? ' alvo' : '') + (c.hpAtual === 0 ? ' morto' : '');
    const condChips = Object.keys(CONDICOES).map(cd => `<label class="check-chip mini ${c.condicoes.includes(cd) ? 'on' : ''}" title="${escapeHtml(CONDICOES[cd])}"><input type="checkbox" data-cond="${escapeHtml(cd)}" ${c.condicoes.includes(cd) ? 'checked' : ''}>${escapeHtml(cd)}</label>`).join('');
    const acoesHtml = (c.acoes || []).map((a, ai) => `<button class="comb-acao" data-acao="${ai}" title="${escapeHtml(a.texto)}">${escapeHtml(a.nome)}${a.bonus != null ? ` (${a.bonus >= 0 ? '+' : ''}${a.bonus})` : ''}${a.dano ? ` ${escapeHtml(a.dano)}` : ''}${a.dmgTipo ? ` <i>${escapeHtml(a.dmgTipo)}</i>` : ''}</button>`).join('');
    const multiBtn = (c.multi > 1 && (c.acoes || []).some(a => a.dano)) ? `<button class="comb-acao multi" data-multi title="Repete o 1º ataque com dano, ${c.multi}×">⚔ Multiataque ×${c.multi}</button>` : '';
    // defesas
    const defs = [...(c.resist || []).map(t => `<span class="def-chip r" title="Resistência">½ ${escapeHtml(t)}</span>`),
      ...(c.vuln || []).map(t => `<span class="def-chip v" title="Vulnerabilidade">×2 ${escapeHtml(t)}</span>`),
      ...(c.imune || []).map(t => `<span class="def-chip i" title="Imunidade">∅ ${escapeHtml(t)}</span>`)].join('');
    const nDef = (c.resist || []).length + (c.vuln || []).length + (c.imune || []).length;
    const defEditor = DANOS_TIPOS.map(t => {
      const cur = (c.imune || []).includes(t) ? 'imune' : (c.vuln || []).includes(t) ? 'vuln' : (c.resist || []).includes(t) ? 'resist' : '';
      return `<label class="comb-def-row"><span>${escapeHtml(t)}</span><select data-def="${escapeHtml(t)}"><option value="">—</option><option value="resist"${cur === 'resist' ? ' selected' : ''}>½ Resist</option><option value="vuln"${cur === 'vuln' ? ' selected' : ''}>×2 Vuln</option><option value="imune"${cur === 'imune' ? ' selected' : ''}>∅ Imune</option></select></label>`;
    }).join('');
    const tipoOpts = `<option value="">— tipo —</option>` + DANOS_TIPOS.map(t => `<option>${t}</option>`).join('');
    div.innerHTML = `
      <div class="comb-top">
        <span class="comb-ini" title="Iniciativa">${c.iniciativa}</span>
        <span class="comb-nome">${escapeHtml(c.nome)} <small class="comb-tipo ${c.tipo}">${c.tipo === 'pc' ? 'PJ' : c.tipo === 'monstro' ? 'Monstro' : c.tipo === 'aliado' ? 'Aliado' : 'NPC'}</small>${c.chefe ? ' ⭐' : ''}</span>
        <span class="comb-ca">CA ${c.ca}</span>
        <button class="comb-alvo" data-alvo title="Definir como alvo">🎯</button>
        <button class="comb-rem" data-rem title="Remover">✕</button>
      </div>
      <div class="comb-hp">PV ${c.hpAtual}/${c.hpMax}<div class="comb-bar"><div style="width:${pct}%;background:${cor}"></div></div></div>
      ${defs ? `<div class="comb-defs">${defs}</div>` : ''}
      <div class="comb-acoes-hp">
        <input type="number" class="comb-val" value="5" style="width:48px">
        <select class="comb-dmgtipo" title="Tipo de dano (aplica resistência/vulnerabilidade)">${tipoOpts}</select>
        <button class="btn-danger comb-dano" data-dano>− Dano</button>
        <button class="btn-primary comb-cura" data-cura>+ Cura</button>
      </div>
      ${acoesHtml || multiBtn ? `<div class="comb-ataques">${multiBtn}${acoesHtml}</div>` : ''}
      <details class="comb-cond"><summary>Condições${c.condicoes.length ? ' (' + c.condicoes.length + ')' : ''}</summary><div class="jg-cond-grid">${condChips}</div></details>
      <details class="comb-def"><summary>Defesas${nDef ? ' (' + nDef + ')' : ''}</summary><div class="comb-def-grid">${defEditor}</div></details>
      <details class="comb-chefe"><summary>Chefe${c.chefe ? ' ⭐' : ''}</summary>
        <label class="check-chip ${c.chefe ? 'on' : ''}"><input type="checkbox" data-chefe ${c.chefe ? 'checked' : ''}> Chefe (resistência + ações lendárias)</label>
        ${c.chefe ? `<div class="chefe-track">
          <div>🛡️ Resistência Lendária: <b data-reslend-val>${c.resLend || 0}</b> <button class="btn-mini" data-reslend="-1">−</button><button class="btn-mini" data-reslend="1">+</button> <button class="btn-mini" data-usa-reslend ${(c.resLend || 0) <= 0 ? 'disabled' : ''}>Usar (falha→sucesso)</button></div>
          <div>⚡ Ações Lendárias: <b>${c.lendAtual ?? c.lendMax ?? 3}</b>/<input type="number" class="lendmax" data-lendmax value="${c.lendMax ?? 3}" min="0" style="width:42px"> por rodada <button class="btn-mini" data-usa-lend ${(c.lendAtual ?? c.lendMax ?? 3) <= 0 ? 'disabled' : ''}>Usar 1</button></div>
        </div>` : ''}
      </details>
    `;
    // selecionar alvo
    div.querySelector('[data-alvo]').addEventListener('click', e => { e.stopPropagation(); alvoSelecionado = (alvoSelecionado === c.id ? null : c.id); renderCombate(); });
    div.querySelector('[data-rem]').addEventListener('click', e => {
      e.stopPropagation();
      combate.combatentes = combate.combatentes.filter(x => x.id !== c.id);
      if (combate.turno >= combate.combatentes.length) combate.turno = 0;
      salvarCombate(); renderCombate();
    });
    const val = () => Math.max(1, Number(div.querySelector('.comb-val').value) || 1);
    const tipoSel = () => div.querySelector('.comb-dmgtipo').value || null;
    div.querySelector('[data-dano]').addEventListener('click', () => {
      const { real, mult } = aplicarDanoComb(c, val(), tipoSel());
      logCombate(`${c.nome} sofreu ${real} de dano${tipoSel() ? ' ' + tipoSel() : ''}${rotuloMult(mult)}. PV ${c.hpAtual}/${c.hpMax}`);
      salvarCombate(); renderCombate();
    });
    div.querySelector('[data-cura]').addEventListener('click', () => { curarComb(c, val()); logCombate(`${c.nome} curou ${val()}. PV ${c.hpAtual}/${c.hpMax}`); salvarCombate(); renderCombate(); });
    div.querySelectorAll('[data-acao]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); atacar(c, c.acoes[+b.dataset.acao]); }));
    const bMulti = div.querySelector('[data-multi]');
    if (bMulti) bMulti.addEventListener('click', e => { e.stopPropagation(); atacar(c, (c.acoes || []).find(a => a.dano), c.multi); });
    div.querySelectorAll('[data-cond]').forEach(chk => chk.addEventListener('change', () => {
      const cd = chk.dataset.cond;
      if (chk.checked) { if (!c.condicoes.includes(cd)) c.condicoes.push(cd); } else c.condicoes = c.condicoes.filter(x => x !== cd);
      salvarCombate(); renderCombate();
    }));
    // defesas (resist/vuln/imune)
    div.querySelectorAll('[data-def]').forEach(sel => sel.addEventListener('change', () => {
      const t = sel.dataset.def;
      c.resist = (c.resist || []).filter(x => x !== t); c.vuln = (c.vuln || []).filter(x => x !== t); c.imune = (c.imune || []).filter(x => x !== t);
      if (sel.value === 'resist') c.resist.push(t); else if (sel.value === 'vuln') c.vuln.push(t); else if (sel.value === 'imune') c.imune.push(t);
      salvarCombate(); renderCombate();
    }));
    // chefe: ações lendárias + resistência lendária
    const chk = div.querySelector('[data-chefe]');
    if (chk) chk.addEventListener('change', () => {
      c.chefe = chk.checked;
      if (c.chefe) { if (c.resLend == null) c.resLend = 3; if (c.lendMax == null) c.lendMax = 3; c.lendAtual = c.lendMax; }
      salvarCombate(); renderCombate();
    });
    div.querySelectorAll('[data-reslend]').forEach(b => b.addEventListener('click', () => { c.resLend = Math.max(0, (c.resLend || 0) + (+b.dataset.reslend)); salvarCombate(); renderCombate(); }));
    const bUsaRes = div.querySelector('[data-usa-reslend]');
    if (bUsaRes) bUsaRes.addEventListener('click', () => { if ((c.resLend || 0) <= 0) return; c.resLend--; logCombate(`🛡️ ${c.nome} usou Resistência Lendária (a salva vira sucesso). Restam ${c.resLend}.`); salvarCombate(); renderCombate(); });
    const inLendMax = div.querySelector('[data-lendmax]');
    if (inLendMax) inLendMax.addEventListener('change', () => { c.lendMax = Math.max(0, Number(inLendMax.value) || 0); c.lendAtual = Math.min(c.lendAtual ?? c.lendMax, c.lendMax); salvarCombate(); renderCombate(); });
    const bUsaLend = div.querySelector('[data-usa-lend]');
    if (bUsaLend) bUsaLend.addEventListener('click', () => { if ((c.lendAtual ?? c.lendMax ?? 0) <= 0) return; c.lendAtual = (c.lendAtual ?? c.lendMax) - 1; logCombate(`⚡ ${c.nome} usou uma Ação Lendária. Restam ${c.lendAtual} nesta rodada.`); salvarCombate(); renderCombate(); });
    listaCombate.appendChild(div);
  });
  // mantém o painel de Dano em Área em sincronia com os combatentes atuais
  const ap = document.getElementById('areaDanoPanel');
  if (ap && !ap.classList.contains('hidden')) renderAreaDano();
}

document.getElementById('addPersonagens').addEventListener('click', addPersonagens);
const qtdComb = () => Math.max(1, Number(document.getElementById('combMonstroQtd').value) || 1);
document.getElementById('addMonstro').addEventListener('click', () => addMonstro(combMonstroSel.value, qtdComb()));
const btnAliado = document.getElementById('addAliado');
if (btnAliado) btnAliado.addEventListener('click', () => addMonstro(combMonstroSel.value, qtdComb(), 'aliado'));
const btnArea = document.getElementById('btnAreaDano');
if (btnArea) btnArea.addEventListener('click', () => {
  const wrap = document.getElementById('areaDanoPanel');
  wrap.classList.toggle('hidden');
  renderAreaDano();
});
document.getElementById('addCombatente').addEventListener('click', () => {
  const nome = prompt('Nome do combatente avulso:'); if (!nome) return;
  const hp = Number(prompt('PV:', '10')) || 10;
  combate.combatentes.push({ id: uid(), tipo: 'npc', nome, iniciativa: dado(20), hpAtual: hp, hpMax: hp, ca: Number(prompt('CA:', '12')) || 12, condicoes: [] });
  ordenarCombate();
});
document.getElementById('rolarIniciativa').addEventListener('click', () => {
  combate.combatentes.forEach(c => {
    let bonus = 0;
    if (c.tipo === 'pc' && c.fichaId) { const f = fichas.find(x => x.id === c.fichaId); bonus = f ? (f.iniciativa || 0) : 0; }
    else if (c.monstroNome) { const m = MONSTROS.find(x => x.nome === c.monstroNome); bonus = m ? mod(m.atributos.des) : 0; }
    c.iniciativa = dado(20) + bonus;
  });
  logCombate('Iniciativa rolada para todos');
  ordenarCombate();
});
document.getElementById('proximoTurno').addEventListener('click', proximoTurnoCombate);
document.getElementById('limparCombate').addEventListener('click', () => {
  if (!confirm('Limpar todo o combate?')) return;
  combate = { combatentes: [], turno: 0, rodada: 1, log: [] };
  alvoSelecionado = null;
  salvarCombate(); renderCombate();
});

carregarCombate();

// =====================================================
// NOTAS / NPCs
// =====================================================
let notas = [];
let notaAtualId = null;

const listaNotas = document.getElementById('listaNotas');
const editorNota = document.getElementById('editorNota');

let _filaNotas = Promise.resolve();
function salvarNotas() {
  const body = JSON.stringify(notas);
  _filaNotas = _filaNotas.then(() => fetch('/api/notas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })).catch(() => {});
  return _filaNotas;
}
async function carregarNotas() {
  try { notas = await (await fetch('/api/notas')).json(); } catch (e) { notas = []; }
  if (!Array.isArray(notas)) notas = [];
  renderListaNotas(); renderEditorNota();
}

function renderListaNotas() {
  if (!listaNotas) return;
  listaNotas.innerHTML = '';
  notas.forEach(n => {
    const div = document.createElement('div');
    div.className = 'nota-item' + (n.id === notaAtualId ? ' active' : '');
    div.innerHTML = `${escapeHtml(n.titulo || '(sem título)')}${n.compartilhada ? ' <span class="nota-share" title="Compartilhada com os jogadores">👁</span>' : ''}`;
    div.addEventListener('click', () => { notaAtualId = n.id; renderListaNotas(); renderEditorNota(); });
    listaNotas.appendChild(div);
  });
}

function renderEditorNota() {
  if (!editorNota) return;
  const n = notas.find(x => x.id === notaAtualId);
  if (!n) {
    editorNota.innerHTML = '<p style="color:var(--text-dim)">Selecione ou crie uma nota/handout.</p>';
    return;
  }
  editorNota.innerHTML = `
    <input type="text" id="notaTitulo" value="${escapeHtml(n.titulo)}" placeholder="Título (ex: NPC - Taverneiro Brom)">
    <textarea id="notaConteudo" placeholder="Anotações...">${escapeHtml(n.conteudo)}</textarea>
    <label class="nota-compartilhar"><input type="checkbox" id="notaShare" ${n.compartilhada ? 'checked' : ''}> 👁 Compartilhar com os jogadores (handout)</label>
    <div class="modal-actions">
      <button id="excluirNota" class="btn-danger">Excluir nota</button>
    </div>
  `;
  document.getElementById('notaTitulo').addEventListener('input', e => { n.titulo = e.target.value; salvarNotas(); renderListaNotas(); });
  document.getElementById('notaConteudo').addEventListener('input', e => { n.conteudo = e.target.value; salvarNotas(); });
  document.getElementById('notaShare').addEventListener('change', e => { n.compartilhada = e.target.checked; salvarNotas(); renderListaNotas(); });
  document.getElementById('excluirNota').addEventListener('click', () => {
    if (!confirm('Excluir esta nota?')) return;
    notas = notas.filter(x => x.id !== n.id);
    notaAtualId = notas[0]?.id || null;
    salvarNotas(); renderListaNotas(); renderEditorNota();
  });
}

const btnNovaNota = document.getElementById('novaNota');
if (btnNovaNota) btnNovaNota.addEventListener('click', () => {
  const nova = { id: uid(), titulo: 'Nova Nota', conteudo: '', compartilhada: false };
  notas.unshift(nova);
  notaAtualId = nova.id;
  salvarNotas(); renderListaNotas(); renderEditorNota();
});

carregarNotas();

// =====================================================
// MONTADOR DE ENCONTROS (orçamento de XP) — Fase 4.2/4.3
// =====================================================
// Limiares de XP por nível de personagem (DMG): [fácil, médio, difícil, mortal]
const XP_LIMIARES = {
  1: [25, 50, 75, 100], 2: [50, 100, 150, 200], 3: [75, 150, 225, 400], 4: [125, 250, 375, 500],
  5: [250, 500, 750, 1100], 6: [300, 600, 900, 1400], 7: [350, 750, 1100, 1700], 8: [450, 900, 1300, 1900],
  9: [550, 1100, 1600, 2400], 10: [600, 1200, 1900, 2800], 11: [800, 1600, 2400, 3600], 12: [1000, 2000, 3000, 4500],
  13: [1100, 2200, 3400, 5100], 14: [1250, 2500, 3800, 5700], 15: [1400, 2800, 4300, 6400], 16: [1600, 3200, 4800, 7200],
  17: [2000, 3900, 5900, 8800], 18: [2100, 4200, 6300, 9500], 19: [2400, 4900, 7300, 10900], 20: [2800, 5700, 8500, 12700],
};
function multEncontro(n) { return n <= 1 ? 1 : n === 2 ? 1.5 : n <= 6 ? 2 : n <= 10 ? 2.5 : n <= 14 ? 3 : 4; }

let encMonstros = [];          // [{nome, qtd}]
let encontrosSalvos = [];

const $enc = id => document.getElementById(id);
const encMonstroSel = $enc('encMonstroSel');
if (encMonstroSel) MONSTROS.forEach(m => { const o = document.createElement('option'); o.value = m.nome; o.textContent = `${m.nome} (ND ${m.cr} · ${m.pe || 0} PE)`; encMonstroSel.appendChild(o); });

function nivelDosPJs() {
  if ($enc('encUsarManual') && $enc('encUsarManual').checked) {
    const q = Math.max(1, Number($enc('encQtdPJ').value) || 1);
    const nv = Math.min(20, Math.max(1, Number($enc('encNivelPJ').value) || 1));
    return Array(q).fill(nv);
  }
  return (fichas || []).map(f => Math.min(20, Math.max(1, f.nivel || 1)));
}
function limiaresGrupo() {
  const niveis = nivelDosPJs();
  const t = [0, 0, 0, 0];
  niveis.forEach(nv => { const L = XP_LIMIARES[nv] || XP_LIMIARES[1]; for (let i = 0; i < 4; i++) t[i] += L[i]; });
  return { t, n: niveis.length };
}
function renderEncParty() {
  const wrap = $enc('encParty'); if (!wrap) return;
  const { t, n } = limiaresGrupo();
  const manual = $enc('encUsarManual') && $enc('encUsarManual').checked;
  wrap.innerHTML = `${n} PJ(s)${manual ? ' (manual)' : ' (das fichas)'} · Limiares do grupo — Fácil <b>${t[0]}</b> · Médio <b>${t[1]}</b> · Difícil <b>${t[2]}</b> · Mortal <b>${t[3]}</b> PE`;
}
function renderEncMonstros() {
  const wrap = $enc('encMonstros'); if (!wrap) return;
  wrap.innerHTML = encMonstros.length ? encMonstros.map((e, i) => {
    const m = MONSTROS.find(x => x.nome === e.nome);
    return `<div class="enc-mon"><span>${e.qtd}× ${escapeHtml(e.nome)} <small>(${(m && m.pe || 0) * e.qtd} PE)</small></span><button data-encrem="${i}" title="Remover">✕</button></div>`;
  }).join('') : '<span class="criador-hint">Nenhum monstro adicionado.</span>';
  wrap.querySelectorAll('[data-encrem]').forEach(b => b.onclick = () => { encMonstros.splice(+b.dataset.encrem, 1); renderEnc(); });
}
function renderEncMedidor() {
  const wrap = $enc('encMedidor'); if (!wrap) return;
  const totalMon = encMonstros.reduce((s, e) => s + e.qtd, 0);
  const xpBruto = encMonstros.reduce((s, e) => { const m = MONSTROS.find(x => x.nome === e.nome); return s + (m && m.pe || 0) * e.qtd; }, 0);
  const mult = multEncontro(totalMon);
  const xpAjust = Math.round(xpBruto * mult);
  const { t } = limiaresGrupo();
  let dif = 'Trivial', cor = '#6e7681';
  if (xpAjust >= t[3]) { dif = 'MORTAL'; cor = '#e94560'; }
  else if (xpAjust >= t[2]) { dif = 'Difícil'; cor = '#d29922'; }
  else if (xpAjust >= t[1]) { dif = 'Médio'; cor = '#3fb950'; }
  else if (xpAjust >= t[0]) { dif = 'Fácil'; cor = '#58a6ff'; }
  wrap.innerHTML = `<div class="enc-med-linha">XP bruto <b>${xpBruto}</b> · ${totalMon} monstro(s) → ×${mult} → <b>XP ajustado ${xpAjust}</b></div>
    <div class="enc-dif" style="color:${cor}">Dificuldade: <b>${dif}</b></div>
    <div class="enc-xprecompensa">Recompensa de XP (bruta, dividir pelo grupo): <b>${xpBruto}</b> PE</div>`;
}
function renderEncSalvos() {
  const wrap = $enc('encSalvosLista'); if (!wrap) return;
  wrap.innerHTML = encontrosSalvos.length ? encontrosSalvos.map(e => {
    const totalMon = (e.monstros || []).reduce((s, m) => s + m.qtd, 0);
    return `<div class="enc-salvo"><span><b>${escapeHtml(e.nome)}</b> <small>(${totalMon} monstros)</small></span>
      <span class="enc-salvo-btns"><button data-enccarregar="${e.id}" title="Carregar">📂</button><button data-enclancar="${e.id}" title="Lançar no combate">⚔️</button><button data-encdel="${e.id}" class="btn-danger" title="Excluir">✕</button></span></div>`;
  }).join('') : '<span class="criador-hint">Nenhum encontro salvo.</span>';
  wrap.querySelectorAll('[data-enccarregar]').forEach(b => b.onclick = () => { const e = encontrosSalvos.find(x => x.id === b.dataset.enccarregar); if (e) { encMonstros = JSON.parse(JSON.stringify(e.monstros || [])); if ($enc('encNome')) $enc('encNome').value = e.nome; renderEnc(); } });
  wrap.querySelectorAll('[data-enclancar]').forEach(b => b.onclick = () => { const e = encontrosSalvos.find(x => x.id === b.dataset.enclancar); if (e) lancarEncontro(e.monstros); });
  wrap.querySelectorAll('[data-encdel]').forEach(b => b.onclick = () => { encontrosSalvos = encontrosSalvos.filter(x => x.id !== b.dataset.encdel); salvarEncontros(); renderEncSalvos(); });
}
function renderEnc() { renderEncParty(); renderEncMonstros(); renderEncMedidor(); }

function lancarEncontro(lista) {
  (lista || []).forEach(e => addMonstro(e.nome, e.qtd));
  alert(`Encontro lançado no Combate (${(lista || []).reduce((s, e) => s + e.qtd, 0)} monstros).`);
}

let _filaEnc = Promise.resolve();
function salvarEncontros() {
  const body = JSON.stringify(encontrosSalvos);
  _filaEnc = _filaEnc.then(() => fetch('/api/encontros', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })).catch(() => {});
  return _filaEnc;
}
async function carregarEncontros() {
  try { encontrosSalvos = await (await fetch('/api/encontros')).json(); } catch (e) { encontrosSalvos = []; }
  if (!Array.isArray(encontrosSalvos)) encontrosSalvos = [];
  renderEncSalvos();
}

if ($enc('encAddMonstro')) {
  $enc('encAddMonstro').onclick = () => {
    const nome = encMonstroSel.value, qtd = Math.max(1, Number($enc('encMonstroQtd').value) || 1);
    const ex = encMonstros.find(e => e.nome === nome);
    if (ex) ex.qtd += qtd; else encMonstros.push({ nome, qtd });
    renderEnc();
  };
  $enc('encUsarManual').onchange = () => { $enc('encManualWrap').classList.toggle('hidden', !$enc('encUsarManual').checked); renderEnc(); };
  $enc('encQtdPJ').oninput = renderEnc;
  $enc('encNivelPJ').oninput = renderEnc;
  $enc('encLimpar').onclick = () => { encMonstros = []; if ($enc('encNome')) $enc('encNome').value = ''; renderEnc(); };
  $enc('encLancar').onclick = () => { if (!encMonstros.length) return alert('Adicione monstros ao encontro.'); lancarEncontro(encMonstros); };
  $enc('encSalvar').onclick = () => {
    const nome = ($enc('encNome').value || '').trim() || 'Encontro sem nome';
    if (!encMonstros.length) return alert('Adicione monstros antes de salvar.');
    encontrosSalvos.unshift({ id: uid(), nome, monstros: JSON.parse(JSON.stringify(encMonstros)) });
    salvarEncontros(); renderEncSalvos();
    alert(`Encontro "${nome}" salvo.`);
  };
  renderEnc();
  carregarEncontros();
}

// =====================================================
// BACKUP — exportar/importar (Fase 5.2)
// =====================================================
async function exportarBackup() {
  try {
    const [fichasD, monstros, comb, notasD, enc, itensM, lojaEsp] = await Promise.all([
      fetch('/api/fichas').then(r => r.json()),
      fetch('/api/monstros_visiveis').then(r => r.json()),
      fetch('/api/combate').then(r => r.json()),
      fetch('/api/notas').then(r => r.json()),
      fetch('/api/encontros').then(r => r.json()),
      fetch('/api/itens_mestre').then(r => r.json()),
      fetch('/api/loja_especial').then(r => r.json()),
    ]);
    const camp = window.CAMPANHA_ID || 'principal';
    const dump = { _app: 'dnd-toolkit', _versao: 1, _campanha: camp, _data: new Date().toISOString(), fichas: fichasD, monstros_visiveis: monstros, combate: comb, notas: notasD, encontros: enc, itens_mestre: itensM, loja_especial_campanha: !!lojaEsp.liberada };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-${camp}-${dump._data.slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
  } catch (e) { alert('Falha ao exportar: ' + e); }
}
async function importarBackup(file) {
  let d;
  try { d = JSON.parse(await file.text()); } catch (e) { return alert('Arquivo inválido (não é JSON).'); }
  if (d._app !== 'dnd-toolkit' && !confirm('Este arquivo não parece um backup do D&D Toolkit. Importar mesmo assim?')) return;
  if (!confirm(`Isto vai SUBSTITUIR os dados da campanha atual ("${window.CAMPANHA_ID || 'principal'}") pelos do backup. Continuar?`)) return;
  const put = (url, data) => fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  try {
    await put('/api/fichas', d.fichas || []);
    await put('/api/monstros_visiveis', d.monstros_visiveis || []);
    await put('/api/combate', d.combate || { combatentes: [], turno: 0, rodada: 1, log: [] });
    await put('/api/notas', d.notas || []);
    await put('/api/encontros', d.encontros || []);
    await put('/api/itens_mestre', d.itens_mestre || []);
    await fetch('/api/loja_especial', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ liberada: !!d.loja_especial_campanha }) });
    alert('Backup importado! Recarregando a página…');
    location.reload();
  } catch (e) { alert('Falha ao importar: ' + e); }
}
(function montarBackup() {
  const btn = document.getElementById('btnBackup');
  if (!btn) return;
  const painel = document.createElement('div');
  painel.className = 'a11y-painel'; painel.hidden = true; painel.style.top = '64px'; painel.style.right = '16px'; painel.style.bottom = 'auto';
  painel.innerHTML = `<h4>💾 Backup da campanha</h4>
    <div class="a11y-linha"><button class="a11y-op" id="bkExport" style="width:100%">⬇️ Exportar (.json)</button></div>
    <div class="a11y-linha"><button class="a11y-op" id="bkImport" style="width:100%">⬆️ Importar de arquivo</button></div>
    <input type="file" id="bkFile" accept="application/json,.json" hidden>
    <div class="criador-hint">Rede de segurança além do Firestore. A importação substitui a campanha atual.</div>`;
  document.body.appendChild(painel);
  btn.addEventListener('click', () => { painel.hidden = !painel.hidden; });
  document.addEventListener('click', e => { if (!painel.hidden && !painel.contains(e.target) && e.target !== btn) painel.hidden = true; });
  painel.querySelector('#bkExport').addEventListener('click', () => { exportarBackup(); painel.hidden = true; });
  painel.querySelector('#bkImport').addEventListener('click', () => painel.querySelector('#bkFile').click());
  painel.querySelector('#bkFile').addEventListener('change', e => { if (e.target.files[0]) importarBackup(e.target.files[0]); });
})();

// =====================================================
// PROGRESSÃO DE CLASSE
// =====================================================
const progClasse = document.getElementById('progClasse');
const progNivel = document.getElementById('progNivel');
const progInfo = document.getElementById('progInfo');
const progTabela = document.getElementById('progTabela');

Object.keys(CLASSES).forEach(key => {
  const opt = document.createElement('option');
  opt.value = key;
  opt.textContent = CLASSES[key].nome;
  progClasse.appendChild(opt);
});

for (let n = 1; n <= 20; n++) {
  const opt = document.createElement('option');
  opt.value = n;
  opt.textContent = `Nível ${n}`;
  progNivel.appendChild(opt);
}

function renderProgressao() {
  const classe = CLASSES[progClasse.value];
  const nivelAtual = Number(progNivel.value);

  progInfo.innerHTML = `
    <p><strong>Dado de Vida:</strong> ${classe.dadoVida} | <strong>Salvaguardas:</strong> ${classe.salvaguardas.join(', ')}</p>
    <p><strong>Perícias:</strong> ${classe.pericias}</p>
  `;

  const temSlots = classe.niveis.some(n => n.slotsMagia);
  const temPacto = classe.niveis.some(n => n.pactoBruxo);

  let cabecalhoExtra = '';
  if (temSlots) cabecalhoExtra = '<th>Espaços de Magia (1º-9º)</th>';
  if (temPacto) cabecalhoExtra = '<th>Pacto Mágico</th>';

  let html = `<table class="prog-table">
    <thead><tr><th>Nível</th><th>Bônus Prof.</th><th>Características</th>${cabecalhoExtra}</tr></thead>
    <tbody>`;

  classe.niveis.forEach(n => {
    const linhaClasse = n.nivel === nivelAtual ? 'linha-atual' : (n.nivel === nivelAtual + 1 ? 'linha-proxima' : '');
    let extra = '';
    if (temSlots) {
      extra = `<td>${n.slotsMagia ? n.slotsMagia.map((s, i) => s > 0 ? `${i+1}º:${s}` : '').filter(Boolean).join(' ') : '-'}</td>`;
    } else if (temPacto) {
      extra = `<td>${n.pactoBruxo ? `${n.pactoBruxo.slots} espaços (nível ${n.pactoBruxo.nivel})` : '-'}</td>`;
    }
    const carac = n.caracteristicas.length ? n.caracteristicas.map(c => `<li>${escapeHtml(c)}</li>`).join('') : '<li class="vazio">—</li>';
    html += `<tr class="${linhaClasse}">
      <td>${n.nivel}${n.nivel === nivelAtual ? ' <span class="tag-atual">atual</span>' : ''}${n.nivel === nivelAtual + 1 ? ' <span class="tag-proxima">próximo</span>' : ''}</td>
      <td>+${n.bonusProf}</td>
      <td><ul>${carac}</ul></td>
      ${extra}
    </tr>`;
  });

  html += '</tbody></table>';
  progTabela.innerHTML = html;
}

progClasse.addEventListener('change', renderProgressao);
progNivel.addEventListener('change', renderProgressao);
renderProgressao();

// =====================================================
// BESTIÁRIO
// =====================================================
const listaMonstros = document.getElementById('listaMonstros');
const sugestoesLista = document.getElementById('sugestoesLista');
const bestiaBusca = document.getElementById('bestiaBusca');
const bestiaAventura = document.getElementById('bestiaAventura');
const bestiaTipo = document.getElementById('bestiaTipo');
const aventuraInfo = document.getElementById('aventuraInfo');
const sugestoesTitulo = document.getElementById('sugestoesTitulo');
const monstroCount = document.getElementById('monstroCount');

let monstrosVisiveis = [];

function popularFiltrosBestiario() {
  bestiaAventura.innerHTML = '<option value="">Todas as aventuras</option>' +
    AVENTURAS.map((a, i) => `<option value="${i}">${escapeHtml(a.nome)}</option>`).join('');
  bestiaTipo.innerHTML = '<option value="">Todos os tipos</option>' +
    CATEGORIAS_MONSTRO.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function rosterAventura(idx) {
  const set = new Set();
  AVENTURAS[idx].encontros.forEach(e => e.monstros.forEach(n => set.add(n)));
  return set;
}

async function carregarVisibilidade() {
  const res = await fetch('/api/monstros_visiveis');
  monstrosVisiveis = await res.json();
  renderMonstros();
}

async function salvarVisibilidade() {
  await fetch('/api/monstros_visiveis', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(monstrosVisiveis),
  });
}

function renderAtributosMonstro(attrs) {
  const mod = v => {
    const m = Math.floor((v - 10) / 2);
    return (m >= 0 ? '+' : '') + m;
  };
  return `
    <div class="attr-row">
      <span>FOR ${attrs.for} (${mod(attrs.for)})</span>
      <span>DES ${attrs.des} (${mod(attrs.des)})</span>
      <span>CON ${attrs.con} (${mod(attrs.con)})</span>
      <span>INT ${attrs.int} (${mod(attrs.int)})</span>
      <span>SAB ${attrs.sab} (${mod(attrs.sab)})</span>
      <span>CAR ${attrs.car} (${mod(attrs.car)})</span>
    </div>`;
}

function renderMonstros() {
  const busca = bestiaBusca.value.trim().toLowerCase();
  const tipo = bestiaTipo.value;
  const avIdx = bestiaAventura.value;

  let filtrados = MONSTROS.slice();
  if (avIdx !== '') {
    const roster = rosterAventura(Number(avIdx));
    filtrados = filtrados.filter(m => roster.has(m.nome));
  }
  if (tipo) filtrados = filtrados.filter(m => m.categoria === tipo);
  if (busca) filtrados = filtrados.filter(m => m.nome.toLowerCase().includes(busca));

  if (monstroCount) monstroCount.textContent = `(${filtrados.length})`;
  listaMonstros.innerHTML = '';
  if (filtrados.length === 0) {
    listaMonstros.innerHTML = '<p style="color:var(--text-dim)">Nenhum monstro encontrado.</p>';
    return;
  }

  filtrados.forEach(m => {
    const card = document.createElement('div');
    card.className = 'monstro-card';
    const visivel = monstrosVisiveis.includes(m.nome);
    card.innerHTML = `
      <div class="monstro-header">
        <h3>${escapeHtml(m.nome)}</h3>
        <span class="cr-badge">ND ${m.cr} (${m.pe} PE)</span>
      </div>
      <label class="visibilidade-toggle">
        <input type="checkbox" data-visivel="${escapeHtml(m.nome)}" ${visivel ? 'checked' : ''}>
        Visível para jogadores
      </label>
      <div class="monstro-sub">${escapeHtml(m.tipo)}</div>
      <span class="cat-badge">${escapeHtml(m.categoria)}</span>
      <div class="monstro-stats">
        <div><strong>CA</strong> ${escapeHtml(m.ca)}</div>
        <div><strong>PV</strong> ${escapeHtml(m.hp)}</div>
        <div><strong>Velocidade</strong> ${escapeHtml(m.velocidade)}</div>
      </div>
      ${renderAtributosMonstro(m.atributos)}
      <div class="monstro-extra">
        <div><strong>Sentidos:</strong> ${escapeHtml(m.sentidos)}</div>
        <div><strong>Idiomas:</strong> ${escapeHtml(m.idiomas)}</div>
      </div>
      ${m.tracos && m.tracos.length ? `<div class="monstro-secao"><strong>Traços</strong><ul>${m.tracos.map(t => `<li>${escapeHtml(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="monstro-secao"><strong>Ações</strong><ul>${m.acoes.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ul></div>
      ${m.reacoes ? `<div class="monstro-secao"><strong>Reações</strong><ul>${m.reacoes.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul></div>` : ''}
      ${m.conjuracao ? `<div class="monstro-secao"><strong>Conjuração</strong><ul>${m.conjuracao.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul></div>` : ''}
    `;
    listaMonstros.appendChild(card);
  });

  listaMonstros.querySelectorAll('[data-visivel]').forEach(chk => {
    chk.addEventListener('change', () => {
      const nome = chk.dataset.visivel;
      if (chk.checked) {
        if (!monstrosVisiveis.includes(nome)) monstrosVisiveis.push(nome);
      } else {
        monstrosVisiveis = monstrosVisiveis.filter(n => n !== nome);
      }
      salvarVisibilidade();
    });
  });
}

function renderSugestoes() {
  const idx = bestiaAventura.value === '' ? 0 : Number(bestiaAventura.value);
  const av = AVENTURAS[idx];
  aventuraInfo.innerHTML = `<strong>${escapeHtml(av.nome)}</strong> · Níveis ${escapeHtml(av.niveis)}
    <div class="criador-hint">${escapeHtml(av.descricao)}</div>`;
  if (sugestoesTitulo) sugestoesTitulo.textContent = 'Encontros — ' + av.nome;

  sugestoesLista.innerHTML = '';
  av.encontros.forEach(s => {
    const card = document.createElement('div');
    card.className = 'sugestao-card';
    card.innerHTML = `
      <div class="sugestao-header">
        <span class="nivel-badge">Nível ${escapeHtml(s.nivel)}</span>
        <strong>${escapeHtml(s.area)}</strong>
      </div>
      <p>${escapeHtml(s.sugestao)}</p>
      <div class="sugestao-monstros">
        ${s.monstros.map(nome => `<span class="monstro-chip" data-monstro="${escapeHtml(nome)}">${escapeHtml(nome)}</span>`).join('')}
      </div>
    `;
    sugestoesLista.appendChild(card);
  });

  sugestoesLista.querySelectorAll('.monstro-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      bestiaBusca.value = chip.dataset.monstro;
      bestiaTipo.value = '';
      renderMonstros();
      document.getElementById('listaMonstros').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

bestiaBusca.addEventListener('input', renderMonstros);
bestiaTipo.addEventListener('change', renderMonstros);
bestiaAventura.addEventListener('change', () => { renderSugestoes(); renderMonstros(); });
popularFiltrosBestiario();
renderSugestoes();
carregarVisibilidade();

// =====================================================
// LOJA DE ITENS
// =====================================================
let itensLoja = Storage.get('dnd_loja', null);
if (!itensLoja) {
  itensLoja = ITENS_PADRAO.map(i => ({ id: uid(), ...i }));
  Storage.set('dnd_loja', itensLoja);
}
let itemEditandoId = null;

const listaLoja = document.getElementById('listaLoja');
const lojaBusca = document.getElementById('lojaBusca');
const lojaCategoria = document.getElementById('lojaCategoria');
const modalItem = document.getElementById('modalItem');

const CATEGORIAS_ITEM = ['Todas', 'Arma', 'Armadura', 'Aventura', 'Ferramenta', 'Montaria', 'Mágico', 'Outro'];
CATEGORIAS_ITEM.forEach(c => {
  const opt = document.createElement('option');
  opt.value = c;
  opt.textContent = c;
  lojaCategoria.appendChild(opt);
});

function salvarLoja() {
  Storage.set('dnd_loja', itensLoja);
}

function renderLoja() {
  const busca = lojaBusca.value.trim().toLowerCase();
  const categoria = lojaCategoria.value;

  const filtrados = itensLoja.filter(i => {
    const matchBusca = !busca || i.nome.toLowerCase().includes(busca) || (i.descricao || '').toLowerCase().includes(busca);
    const matchCategoria = categoria === 'Todas' || i.categoria === categoria;
    return matchBusca && matchCategoria;
  });

  listaLoja.innerHTML = '';
  if (filtrados.length === 0) {
    listaLoja.innerHTML = '<p style="color:var(--text-dim)">Nenhum item encontrado.</p>';
    return;
  }

  filtrados.forEach(i => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-header">
        <h3>${escapeHtml(i.nome)}</h3>
        <span class="item-cat">${escapeHtml(i.categoria)}</span>
      </div>
      <div class="item-preco">${escapeHtml(i.preco || '-')} ${i.peso ? `· ${escapeHtml(i.peso)}` : ''}</div>
      <div class="item-desc">${escapeHtml(i.descricao || '')}</div>
    `;
    card.addEventListener('click', () => abrirItem(i.id));
    listaLoja.appendChild(card);
  });
}

function abrirItem(id) {
  itemEditandoId = id;
  const i = itensLoja.find(x => x.id === id) || {};
  document.getElementById('modalItemTitulo').textContent = id ? 'Editar Item' : 'Novo Item';
  document.getElementById('iNome').value = i.nome || '';
  document.getElementById('iCategoria').value = i.categoria || 'Aventura';
  document.getElementById('iPreco').value = i.preco || '';
  document.getElementById('iPeso').value = i.peso || '';
  document.getElementById('iDescricao').value = i.descricao || '';
  document.getElementById('excluirItem').style.display = id ? 'inline-block' : 'none';
  modalItem.classList.remove('hidden');
}

document.getElementById('novoItem').addEventListener('click', () => abrirItem(null));
document.getElementById('cancelarItem').addEventListener('click', () => modalItem.classList.add('hidden'));

document.getElementById('salvarItem').addEventListener('click', () => {
  const dados = {
    nome: document.getElementById('iNome').value.trim(),
    categoria: document.getElementById('iCategoria').value,
    preco: document.getElementById('iPreco').value.trim(),
    peso: document.getElementById('iPeso').value.trim(),
    descricao: document.getElementById('iDescricao').value.trim(),
  };
  if (!dados.nome) return;

  if (itemEditandoId) {
    const idx = itensLoja.findIndex(i => i.id === itemEditandoId);
    itensLoja[idx] = { ...itensLoja[idx], ...dados };
  } else {
    itensLoja.push({ id: uid(), ...dados });
  }
  salvarLoja();
  renderLoja();
  modalItem.classList.add('hidden');
});

document.getElementById('excluirItem').addEventListener('click', () => {
  if (!itemEditandoId) return;
  if (!confirm('Excluir este item?')) return;
  itensLoja = itensLoja.filter(i => i.id !== itemEditandoId);
  salvarLoja();
  renderLoja();
  modalItem.classList.add('hidden');
});

lojaBusca.addEventListener('input', renderLoja);
lojaCategoria.addEventListener('change', renderLoja);
renderLoja();

// =====================================================
// GERADORES
// =====================================================
const rand = arr => arr[Math.floor(Math.random() * arr.length)];

const dadosGeradores = {
  npcNomes: ['Aldric', 'Branwen', 'Coraline', 'Dorian', 'Elowen', 'Fendrel', 'Garrick', 'Helsa', 'Ivor', 'Jossa', 'Kael', 'Lyra', 'Magnus', 'Nessa', 'Orin', 'Petra', 'Quill', 'Rowan', 'Sable', 'Thessaly'],
  npcSobrenomes: ['Pedraverde', 'da Colina', 'Cinzasforjadas', 'Riacholongo', 'Vendaval', 'das Sombras', 'Trovejante', 'Solar', 'Marfim', 'Negroaço'],
  npcOcupacoes: ['taverneiro', 'mercador', 'guarda da cidade', 'ferreiro', 'mago aposentado', 'caçador de recompensas', 'sacerdote', 'ladrão arrependido', 'curandeiro', 'capitão de navio', 'fazendeiro', 'bardo viajante'],
  npcTracos: ['fala muito alto', 'desconfia de estranhos', 'sempre otimista', 'guarda um segredo perigoso', 'coleciona objetos estranhos', 'tem medo de magia', 'é extremamente honesto', 'mente sobre seu passado', 'busca vingança', 'é leal até a morte'],

  lootComuns: ['10 moedas de prata', 'uma adaga simples', 'uma corda de 15m', 'um frasco de óleo', 'rações de viagem (3 dias)', 'um mapa rasgado e ilegível', 'uma pena de pássaro incomum', 'um anel de cobre sem valor'],
  lootRaros: ['uma poção de cura', 'uma adaga +1', 'um pergaminho de mensageiro', 'um amuleto que brilha levemente', 'uma gema azul (50 po)', 'botas de couro élfico', 'um livro em idioma desconhecido'],
  lootEpicos: ['uma espada longa +1 com runas', 'um anel de proteção', 'um cajado com cristal pulsante', 'um colar de resistência elemental', 'uma poção de cura maior', 'pergaminho de bola de fogo'],

  encontros: [
    'Um grupo de goblins emboscando viajantes na estrada.',
    'Uma criatura ferida pedindo ajuda - pode ser uma armadilha.',
    'Mercador ambulante oferecendo itens raros por preços estranhos.',
    'Ruínas antigas com sinais de atividade recente.',
    'Uma patrulha de guardas questionando o grupo sobre um crime local.',
    'Um lobo gigante isolado de sua matilha, acuado.',
    'Bandidos bloqueando uma ponte, exigindo pedágio.',
    'Um espírito perdido pedindo que sua história seja contada.',
    'Caravana atacada - sobreviventes precisam de socorro.',
    'Um portal mágico instável aparece de repente.',
  ],

  ganchos: [
    'Um NPC conhecido desaparece misteriosamente e deixa uma carta cifrada.',
    'Uma criança da vila começa a ter visões de um lugar distante em perigo.',
    'Um artefato antigo é roubado do templo local durante a noite.',
    'Rumores de uma cidade inteira que desapareceu sem deixar rastros.',
    'Um nobre oferece recompensa generosa por um serviço "discreto".',
    'Monstros estão migrando para perto de assentamentos, fugindo de algo pior.',
    'Um aliado antigo retorna pedindo ajuda, mas parece mudado.',
    'Uma profecia antiga começa a se cumprir, e os sinais apontam para o grupo.',
  ],

  tavernas: [
    'O Javali Dourado - taverna aconchegante, lareira sempre acesa, dono é um ex-soldado.',
    'A Sereia Cansada - porto movimentado, cheira a peixe e cerveja, marinheiros jogam dados.',
    'O Caldeirão Fumegante - cozinha exótica, especiarias raras, dona é uma bruxa simpática.',
    'A Lança Quebrada - bar de duelistas, paredes cobertas de armas antigas.',
    'O Poço dos Desejos - lugar místico, moedas jogadas em um poço central, ambiente silencioso.',
    'A Estalagem da Estrada - simples e barata, viajantes cansados, estábulo nos fundos.',
  ]
};

function gerarNpc() {
  const nome = `${rand(dadosGeradores.npcNomes)} ${rand(dadosGeradores.npcSobrenomes)}`;
  const ocupacao = rand(dadosGeradores.npcOcupacoes);
  const traco = rand(dadosGeradores.npcTracos);
  return `${nome}\nOcupação: ${ocupacao}\nTraço marcante: ${traco}`;
}

function gerarLoot() {
  const itens = [];
  itens.push(rand(dadosGeradores.lootComuns));
  itens.push(rand(dadosGeradores.lootComuns));
  if (Math.random() < 0.5) itens.push(rand(dadosGeradores.lootRaros));
  if (Math.random() < 0.15) itens.push(rand(dadosGeradores.lootEpicos));
  return itens.map(i => `• ${i}`).join('\n');
}

function gerarEncontro() {
  return rand(dadosGeradores.encontros);
}

function gerarGancho() {
  return rand(dadosGeradores.ganchos);
}

function gerarTaverna() {
  return rand(dadosGeradores.tavernas);
}

const geradoresMap = {
  npc: { fn: gerarNpc, target: 'resNpc' },
  loot: { fn: gerarLoot, target: 'resLoot' },
  encontro: { fn: gerarEncontro, target: 'resEncontro' },
  gancho: { fn: gerarGancho, target: 'resGancho' },
  taverna: { fn: gerarTaverna, target: 'resTaverna' },
};

document.querySelectorAll('[data-ger]').forEach(btn => {
  btn.addEventListener('click', () => {
    const { fn, target } = geradoresMap[btn.dataset.ger];
    document.getElementById(target).textContent = fn();
  });
});

// Rolagem de dados
document.getElementById('rolarDado').addEventListener('click', () => {
  const formula = document.getElementById('dadoFormula').value.trim().toLowerCase();
  const resultado = document.getElementById('resDado');
  const match = formula.match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match) {
    resultado.textContent = 'Formato inválido. Use ex: 1d20, 2d6+3';
    return;
  }
  const qtd = match[1] ? parseInt(match[1]) : 1;
  const lados = parseInt(match[2]);
  const mod = match[3] ? parseInt(match[3]) : 0;

  if (qtd < 1 || qtd > 100 || lados < 2 || lados > 1000) {
    resultado.textContent = 'Valores fora do limite (1-100 dados, 2-1000 lados).';
    return;
  }

  const rolagens = [];
  let total = 0;
  for (let i = 0; i < qtd; i++) {
    const r = Math.floor(Math.random() * lados) + 1;
    rolagens.push(r);
    total += r;
  }
  total += mod;
  resultado.textContent = `Rolagens: [${rolagens.join(', ')}]${mod ? ` ${mod >= 0 ? '+' : ''}${mod}` : ''}\nTotal: ${total}`;
});

// =====================================================
// TEMPO REAL (Firestore) - atualiza as telas quando o estado muda
// =====================================================
if (window.RT && RT.ativo()) {
  let _lf = '', _lc = '', _lv = '', _ln = '', _lim = '';
  RT.ouvir(estado => {
    const sf = JSON.stringify(estado.fichas || []);
    if (sf !== _lf) { _lf = sf; fichas = estado.fichas || []; renderFichas(); }
    const sc = JSON.stringify(estado.combate || {});
    if (sc !== _lc) { _lc = sc; combate = estado.combate || { combatentes: [], turno: 0, rodada: 1, log: [] }; renderCombate(); }
    const sv = JSON.stringify(estado.monstros_visiveis || []);
    if (sv !== _lv) { _lv = sv; monstrosVisiveis = estado.monstros_visiveis || []; renderMonstros(); }
    const sn = JSON.stringify(estado.notas || []);
    if (sn !== _ln) {
      _ln = sn;
      const editando = document.activeElement && ['notaTitulo', 'notaConteudo'].includes(document.activeElement.id);
      if (!editando) { notas = estado.notas || []; renderListaNotas(); renderEditorNota(); }
    }
    const sim = JSON.stringify(estado.itens_mestre || []);
    if (sim !== _lim) { _lim = sim; if (typeof window._syncItensMestre === 'function') window._syncItensMestre(estado.itens_mestre || []); }
    if (!!estado.loja_especial_campanha !== lojaEspecialCampanha) {
      lojaEspecialCampanha = !!estado.loja_especial_campanha;
      window.LOJA_ESPECIAL_CAMPANHA = lojaEspecialCampanha;
      atualizarToggleLojaEspecialCampanha();
    }
  });
}
