const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ===== Tabs =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// marca do último dado recebido em tempo real (suprime o polling quando o RT funciona)
let ultimoRT = 0;
const rtRecente = () => Date.now() - ultimoRT < 10000;

// =====================================================
// FICHAS (compartilhadas com o mestre via API)
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

function minhaFichaId() { try { return localStorage.getItem('dnd_minha_ficha'); } catch (e) { return null; } }
function setMinhaFicha(id) { try { id ? localStorage.setItem('dnd_minha_ficha', id) : localStorage.removeItem('dnd_minha_ficha'); } catch (e) {} }
function jogarFicha(f) { Jogo.abrir(f, { aoAtualizar: () => { salvarFichas(); renderFichas(); } }); }

function renderFichas() {
  listaFichas.innerHTML = '';
  if (fichas.length === 0) {
    listaFichas.innerHTML = '<p style="color:var(--text-dim)">Nenhuma ficha ainda. Clique em "+ Nova Ficha" para criar a sua.</p>';
    return;
  }
  const minhaId = minhaFichaId();
  const minha = fichas.find(f => f.id === minhaId);
  // atalho "Jogar minha ficha"
  if (minha) {
    const banner = document.createElement('div');
    banner.className = 'minha-ficha-banner';
    banner.innerHTML = `<span>⭐ Sua ficha: <b>${escapeHtml(minha.nome || 'Sem nome')}</b></span><button class="btn-primary" id="btnJogarMinha">▶ Jogar minha ficha</button>`;
    banner.querySelector('#btnJogarMinha').addEventListener('click', () => jogarFicha(minha));
    listaFichas.appendChild(banner);
  }
  // ordena com a "minha" primeiro
  const ordenadas = [...fichas].sort((x, y) => (y.id === minhaId) - (x.id === minhaId));
  ordenadas.forEach(f => {
    const pct = f.hpMax > 0 ? Math.max(0, Math.min(100, (f.hpAtual / f.hpMax) * 100)) : 0;
    const ehMinha = f.id === minhaId;
    const card = document.createElement('div');
    card.className = 'ficha-card' + (ehMinha ? ' minha' : '');
    card.innerHTML = `
      <button class="ficha-estrela" data-estrela="${f.id}" title="${ehMinha ? 'Esta é a minha ficha' : 'Marcar como minha ficha'}">${ehMinha ? '⭐' : '☆'}</button>
      <h3>${escapeHtml(f.nome) || 'Sem nome'}</h3>
      <div class="sub">${escapeHtml(f.raca) || ''} ${escapeHtml(f.classe) || ''} - Nível ${f.nivel}</div>
      <div>HP: ${f.hpAtual} / ${f.hpMax} | CA: ${f.ca}</div>
      <div class="hp-bar"><div class="hp-bar-fill" style="width:${pct}%"></div></div>
      <div class="ficha-card-acoes">
        <button class="btn-jogar" data-jogar="${f.id}">▶ Jogar</button>
        <button class="btn-editar" data-editar="${f.id}">✎ Editar</button>
      </div>
    `;
    card.querySelector('[data-jogar]').addEventListener('click', (e) => { e.stopPropagation(); jogarFicha(f); });
    card.querySelector('[data-editar]').addEventListener('click', (e) => { e.stopPropagation(); abrirFicha(f.id); });
    card.querySelector('[data-estrela]').addEventListener('click', (e) => {
      e.stopPropagation();
      setMinhaFicha(ehMinha ? null : f.id);
      renderFichas();
    });
    listaFichas.appendChild(card);
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
// BESTIÁRIO (somente leitura, filtrado pelo que o Mestre liberou)
// =====================================================
const listaMonstros = document.getElementById('listaMonstros');
const bestiaBusca = document.getElementById('bestiaBusca');
const bestiaTipo = document.getElementById('bestiaTipo');
let monstrosVisiveis = [];

// popula o filtro de tipo só com categorias dos monstros liberados
function popularTipoJogador() {
  const cats = [...new Set(MONSTROS.filter(m => monstrosVisiveis.includes(m.nome)).map(m => m.categoria))].sort();
  const atual = bestiaTipo.value;
  bestiaTipo.innerHTML = '<option value="">Todos os tipos</option>' +
    cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  if (cats.includes(atual)) bestiaTipo.value = atual;
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
  const liberados = MONSTROS.filter(m => monstrosVisiveis.includes(m.nome));
  let filtrados = liberados;
  if (tipo) filtrados = filtrados.filter(m => m.categoria === tipo);
  if (busca) filtrados = filtrados.filter(m => m.nome.toLowerCase().includes(busca));

  listaMonstros.innerHTML = '';
  if (liberados.length === 0) {
    listaMonstros.innerHTML = '<p style="color:var(--text-dim)">O Mestre ainda não liberou nenhum monstro.</p>';
    return;
  }
  if (filtrados.length === 0) {
    listaMonstros.innerHTML = '<p style="color:var(--text-dim)">Nenhum monstro encontrado.</p>';
    return;
  }

  filtrados.forEach(m => {
    const card = document.createElement('div');
    card.className = 'monstro-card';
    card.innerHTML = `
      <div class="monstro-header">
        <h3>${escapeHtml(m.nome)}</h3>
        <span class="cr-badge">ND ${m.cr} (${m.pe} PE)</span>
      </div>
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
}

async function atualizarVisibilidade() {
  const res = await fetch('/api/monstros_visiveis');
  monstrosVisiveis = await res.json();
  popularTipoJogador();
  renderMonstros();
}

bestiaBusca.addEventListener('input', renderMonstros);
bestiaTipo.addEventListener('change', renderMonstros);
atualizarVisibilidade();
// polling de fallback (auto-suprimido quando o tempo real está entregando dados)
setInterval(() => { if (!rtRecente()) atualizarVisibilidade(); }, 8000);

// =====================================================
// PROGRESSÃO DE CLASSE (somente leitura)
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
// COMBATE (somente leitura - acompanha o que o Mestre conduz)
// =====================================================
const turnoInfoJog = document.getElementById('turnoInfoJog');
const listaCombateJog = document.getElementById('listaCombateJog');

function statusMonstro(pct, hpAtual) {
  if (hpAtual === 0) return { txt: 'Caído 💀', cor: '#e94560' };
  if (pct > 75) return { txt: 'Saudável', cor: '#3fb950' };
  if (pct > 50) return { txt: 'Arranhado', cor: '#3fb950' };
  if (pct > 25) return { txt: 'Ferido', cor: '#d29922' };
  return { txt: 'Quase morto', cor: '#e94560' };
}

function renderCombateJog(combate) {
  if (!combate || !combate.combatentes || !combate.combatentes.length) {
    turnoInfoJog.textContent = 'Nenhum combate em andamento.';
    listaCombateJog.innerHTML = '';
    return;
  }
  const idx = combate.turno % combate.combatentes.length;
  const atual = combate.combatentes[idx];
  turnoInfoJog.innerHTML = `Rodada <b>${combate.rodada}</b> · Vez de <b>${escapeHtml(atual.nome)}</b>`;
  listaCombateJog.innerHTML = '';
  combate.combatentes.forEach((c, i) => {
    const pct = c.hpMax > 0 ? (c.hpAtual / c.hpMax) * 100 : 0;
    const div = document.createElement('div');
    div.className = 'comb-card leitura' + (i === idx ? ' turno' : '') + (c.hpAtual === 0 ? ' morto' : '');
    let estado;
    if (c.tipo === 'pc') {
      const cor = pct > 50 ? '#3fb950' : pct > 25 ? '#d29922' : '#e94560';
      estado = `<div class="comb-hp">PV ${c.hpAtual}/${c.hpMax}<div class="comb-bar"><div style="width:${pct}%;background:${cor}"></div></div></div>`;
    } else {
      const s = statusMonstro(pct, c.hpAtual);
      estado = `<div class="comb-status" style="color:${s.cor}">${s.txt}</div>`;
    }
    const conds = (c.condicoes || []).length ? `<div class="comb-conds">${c.condicoes.map(x => `<span class="cond-tag">${escapeHtml(x)}</span>`).join('')}</div>` : '';
    const defs = [...(c.resist || []).map(t => `<span class="def-chip r">½ ${escapeHtml(t)}</span>`),
      ...(c.vuln || []).map(t => `<span class="def-chip v">×2 ${escapeHtml(t)}</span>`),
      ...(c.imune || []).map(t => `<span class="def-chip i">∅ ${escapeHtml(t)}</span>`)].join('');
    const tipoRot = c.tipo === 'pc' ? 'PJ' : c.tipo === 'aliado' ? 'Aliado' : c.tipo === 'monstro' ? 'Monstro' : 'NPC';
    div.innerHTML = `
      <div class="comb-top">
        <span class="comb-ini">${c.iniciativa}</span>
        <span class="comb-nome">${escapeHtml(c.nome)} <small class="comb-tipo ${c.tipo}">${tipoRot}</small>${c.chefe ? ' ⭐' : ''}</span>
        <span class="comb-ca">CA ${c.ca}</span>
      </div>
      ${estado}${defs ? `<div class="comb-defs">${defs}</div>` : ''}${conds}`;
    listaCombateJog.appendChild(div);
  });
}

async function atualizarCombateJog() {
  try {
    const c = await (await fetch('/api/combate')).json();
    renderCombateJog(c);
  } catch (e) {}
}
atualizarCombateJog();

// ===== Handouts (notas compartilhadas pelo Mestre) =====
const listaHandouts = document.getElementById('listaHandouts');
function renderHandouts(notas) {
  if (!listaHandouts) return;
  const compartilhadas = (notas || []).filter(n => n.compartilhada);
  if (!compartilhadas.length) { listaHandouts.innerHTML = '<p style="color:var(--text-dim)">Nenhum handout compartilhado ainda.</p>'; return; }
  listaHandouts.innerHTML = compartilhadas.map(n => `<div class="handout-card"><h3>📜 ${escapeHtml(n.titulo || 'Handout')}</h3><div class="handout-conteudo">${escapeHtml(n.conteudo || '').replace(/\n/g, '<br>')}</div></div>`).join('');
}
async function atualizarHandouts() {
  try { renderHandouts(await (await fetch('/api/notas')).json()); } catch (e) {}
}
atualizarHandouts();

// Itens mágicos criados pelo Mestre (à parte do acervo) — precisam estar
// disponíveis para a ficha reconhecer sintonização/efeito quando o Mestre
// envia um desses itens a um personagem (ver itemMagico() em itens.js).
async function atualizarItensMestre() {
  try { window.ITENS_MESTRE = await (await fetch('/api/itens_mestre')).json(); } catch (e) { window.ITENS_MESTRE = window.ITENS_MESTRE || []; }
}
atualizarItensMestre();

// Fase 9: Loja Especial liberada para toda a campanha (por personagem é lido direto de f.lojaEspecialLiberada)
async function atualizarLojaEspecialCampanha() {
  try { const r = await (await fetch('/api/loja_especial')).json(); window.LOJA_ESPECIAL_CAMPANHA = !!r.liberada; } catch (e) { window.LOJA_ESPECIAL_CAMPANHA = window.LOJA_ESPECIAL_CAMPANHA || false; }
}
atualizarLojaEspecialCampanha();

// =====================================================
// TEMPO REAL (Firestore) - atualiza ficha/bestiário/combate na hora
// =====================================================
if (window.RT && RT.ativo()) {
  let _lf = '', _lv = '', _lc = '', _ln = '', _lim = '';
  RT.ouvir(estado => {
    ultimoRT = Date.now();
    const sf = JSON.stringify(estado.fichas || []);
    if (sf !== _lf) { _lf = sf; fichas = estado.fichas || []; renderFichas(); }
    const sv = JSON.stringify(estado.monstros_visiveis || []);
    if (sv !== _lv) { _lv = sv; monstrosVisiveis = estado.monstros_visiveis || []; popularTipoJogador(); renderMonstros(); }
    const sc = JSON.stringify(estado.combate || {});
    if (sc !== _lc) { _lc = sc; renderCombateJog(estado.combate || {}); }
    const sn = JSON.stringify((estado.notas || []).filter(n => n.compartilhada));
    if (sn !== _ln) { _ln = sn; renderHandouts(estado.notas || []); }
    const sim = JSON.stringify(estado.itens_mestre || []);
    if (sim !== _lim) { _lim = sim; window.ITENS_MESTRE = estado.itens_mestre || []; }
    window.LOJA_ESPECIAL_CAMPANHA = !!estado.loja_especial_campanha;
  });
}
// polling de fallback (auto-suprimido quando o tempo real está entregando dados)
setInterval(() => { if (!rtRecente()) atualizarCombateJog(); }, 6000);
