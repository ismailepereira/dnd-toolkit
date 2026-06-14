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

async function salvarFichas() {
  await fetch('/api/fichas', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fichas),
  });
}

function renderFichas() {
  listaFichas.innerHTML = '';
  if (fichas.length === 0) {
    listaFichas.innerHTML = '<p style="color:var(--text-dim)">Nenhuma ficha ainda. Clique em "+ Nova Ficha" para criar a sua.</p>';
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
    `;
    card.addEventListener('click', () => abrirFicha(f.id));
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
setInterval(atualizarVisibilidade, 8000); // verifica novos monstros liberados a cada 8s

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
