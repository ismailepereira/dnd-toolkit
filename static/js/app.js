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
  // serializa os PUTs para não se atropelarem (modo de jogo / tempo real)
  _filaSalvarFichas = _filaSalvarFichas.then(() =>
    fetch('/api/fichas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fichas),
    })
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
// COMBATE / INICIATIVA
// =====================================================
let combatentes = Storage.get('dnd_combate', []);
let turnoAtual = Storage.get('dnd_combate_turno', 0);

const listaCombate = document.getElementById('listaCombate');
const turnoInfo = document.getElementById('turnoInfo');

function salvarCombate() {
  Storage.set('dnd_combate', combatentes);
  Storage.set('dnd_combate_turno', turnoAtual);
}

function renderCombate() {
  listaCombate.innerHTML = '';
  if (combatentes.length === 0) {
    turnoInfo.textContent = 'Nenhum combatente. Adicione com "+ Combatente".';
  } else {
    const atual = combatentes[turnoAtual % combatentes.length];
    turnoInfo.textContent = `Turno ${turnoAtual + 1} — Vez de: ${atual?.nome || '(sem nome)'}`;
  }

  combatentes.forEach((c, i) => {
    const div = document.createElement('div');
    div.className = 'combat-item' + (i === (turnoAtual % combatentes.length) ? ' current-turn' : '');
    div.innerHTML = `
      <input type="number" value="${c.iniciativa}" data-field="iniciativa" title="Iniciativa">
      <input type="text" value="${escapeHtml(c.nome)}" data-field="nome" placeholder="Nome">
      <div class="hp-controls">
        <input type="number" value="${c.hpAtual}" data-field="hpAtual" title="HP atual">
        <span>/</span>
        <input type="number" value="${c.hpMax}" data-field="hpMax" title="HP máximo">
      </div>
      <input type="text" value="${escapeHtml(c.condicoes || '')}" data-field="condicoes" placeholder="Condições">
      <button class="remove-btn" title="Remover">✕</button>
    `;
    div.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', () => {
        const field = inp.dataset.field;
        c[field] = (field === 'iniciativa' || field === 'hpAtual' || field === 'hpMax')
          ? Number(inp.value) || 0
          : inp.value;
        salvarCombate();
      });
    });
    div.querySelector('.remove-btn').addEventListener('click', () => {
      combatentes.splice(i, 1);
      if (turnoAtual >= combatentes.length) turnoAtual = 0;
      salvarCombate();
      renderCombate();
    });
    listaCombate.appendChild(div);
  });
}

document.getElementById('addCombatente').addEventListener('click', () => {
  combatentes.push({ id: uid(), nome: '', iniciativa: 0, hpAtual: 10, hpMax: 10, condicoes: '' });
  salvarCombate();
  renderCombate();
});

document.getElementById('ordenarIniciativa').addEventListener('click', () => {
  combatentes.sort((a, b) => b.iniciativa - a.iniciativa);
  turnoAtual = 0;
  salvarCombate();
  renderCombate();
});

document.getElementById('proximoTurno').addEventListener('click', () => {
  if (combatentes.length === 0) return;
  turnoAtual = (turnoAtual + 1) % combatentes.length;
  salvarCombate();
  renderCombate();
});

document.getElementById('limparCombate').addEventListener('click', () => {
  if (!confirm('Limpar todos os combatentes?')) return;
  combatentes = [];
  turnoAtual = 0;
  salvarCombate();
  renderCombate();
});

renderCombate();

// =====================================================
// NOTAS / NPCs
// =====================================================
let notas = Storage.get('dnd_notas', []);
let notaAtualId = null;

const listaNotas = document.getElementById('listaNotas');
const editorNota = document.getElementById('editorNota');

function salvarNotas() {
  Storage.set('dnd_notas', notas);
}

function renderListaNotas() {
  listaNotas.innerHTML = '';
  notas.forEach(n => {
    const div = document.createElement('div');
    div.className = 'nota-item' + (n.id === notaAtualId ? ' active' : '');
    div.textContent = n.titulo || '(sem título)';
    div.addEventListener('click', () => {
      notaAtualId = n.id;
      renderListaNotas();
      renderEditorNota();
    });
    listaNotas.appendChild(div);
  });
}

function renderEditorNota() {
  const n = notas.find(x => x.id === notaAtualId);
  if (!n) {
    editorNota.innerHTML = '<p style="color:var(--text-dim)">Selecione ou crie uma nota.</p>';
    return;
  }
  editorNota.innerHTML = `
    <input type="text" id="notaTitulo" value="${escapeHtml(n.titulo)}" placeholder="Título (ex: NPC - Taverneiro Brom)">
    <textarea id="notaConteudo" placeholder="Anotações...">${escapeHtml(n.conteudo)}</textarea>
    <div class="modal-actions">
      <button id="excluirNota" class="btn-danger">Excluir nota</button>
    </div>
  `;
  document.getElementById('notaTitulo').addEventListener('input', e => {
    n.titulo = e.target.value;
    salvarNotas();
    renderListaNotas();
  });
  document.getElementById('notaConteudo').addEventListener('input', e => {
    n.conteudo = e.target.value;
    salvarNotas();
  });
  document.getElementById('excluirNota').addEventListener('click', () => {
    if (!confirm('Excluir esta nota?')) return;
    notas = notas.filter(x => x.id !== n.id);
    notaAtualId = notas[0]?.id || null;
    salvarNotas();
    renderListaNotas();
    renderEditorNota();
  });
}

document.getElementById('novaNota').addEventListener('click', () => {
  const nova = { id: uid(), titulo: 'Nova Nota', conteudo: '' };
  notas.unshift(nova);
  notaAtualId = nova.id;
  salvarNotas();
  renderListaNotas();
  renderEditorNota();
});

renderListaNotas();
renderEditorNota();

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
