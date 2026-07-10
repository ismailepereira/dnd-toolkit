// =====================================================================
// K2 — Livro-jogo (v1): aventuras como GRAFO de nós/escolhas
// ---------------------------------------------------------------------
// DEFINIÇÃO (biblioteca pessoal do autor, /api/aventuras):
//   { id, titulo, limites:{jogadoresMax,nivelMin,nivelMax}, noInicial,
//     nos: [{ id, titulo, tipo, narracao, notasMestre, resultado?,
//             encontro: [{nome, qtd}], saidas: [{para, rotulo, aviso}] }] }
// PROGRESSO (estado da campanha, /api/aventura_ativa):
//   { definicao (snapshot), noAtual, historico, nosCompletados }
// Editar a biblioteca NÃO muda uma aventura já em curso (snapshot).
// v1: só o Mestre conduz; escolhas na tela dos jogadores são fase futura.
// =====================================================================

const AVENTURA_TIPOS = [
  ['narracao', '📜 Narração'],
  ['encontro', '⚔️ Encontro'],
  ['social', '💬 Social'],
  ['assalto', '🗝️ Assalto / Infiltração'],
  ['descanso', '🏕️ Descanso'],
  ['final', '🏁 Final'],
];

const AVENTURA_AVISOS = [
  ['', '—'],
  ['mortal', '💀 mortal'],
  ['beco', '🚧 sem saída'],
];

// P2: tipos de NPC do nó (espelham NPC_TIPOS de npc.js; duplicados aqui
// para as funções puras não dependerem do DOM/npc.js)
const AVENTURA_NPC_TIPOS = [
  ['lojista', '🛒 Lojista'],
  ['aliado', '🤝 Aliado'],
  ['inimigo', '⚔️ Inimigo'],
  ['neutro', '😐 Neutro'],
];

// ---------- Funções puras (testáveis em Node) ----------

// Valida o grafo da aventura. Retorna { erros: [...], avisos: [...] }.
// Erros impedem iniciar; avisos são dicas para o Mestre.
function validarAventura(av) {
  const erros = [], avisos = [];
  const nos = (av && av.nos) || [];
  if (!nos.length) { erros.push('A aventura não tem nenhum nó.'); return { erros, avisos }; }
  const ids = new Set();
  nos.forEach(n => {
    if (!n.id) erros.push(`Nó sem id ("${n.titulo || '?'}").`);
    else if (ids.has(n.id)) erros.push(`Id de nó duplicado: ${n.id}.`);
    ids.add(n.id);
  });
  const inicial = av.noInicial || nos[0].id;
  if (!ids.has(inicial)) erros.push('O nó inicial não existe na aventura.');
  nos.forEach(n => (n.saidas || []).forEach(s => {
    if (!ids.has(s.para)) erros.push(`"${n.titulo || n.id}" tem uma saída para nó inexistente (${s.para}).`);
  }));
  if (erros.length) return { erros, avisos };
  // alcançabilidade (busca em largura a partir do inicial)
  const alcancados = new Set([inicial]);
  const fila = [inicial];
  while (fila.length) {
    const id = fila.shift();
    const atual = nos.find(n => n.id === id);
    if (!atual) continue;
    (atual.saidas || []).forEach(s => {
      if (!alcancados.has(s.para)) { alcancados.add(s.para); fila.push(s.para); }
    });
  }
  nos.forEach(n => {
    if (!alcancados.has(n.id)) avisos.push(`Nó órfão (inalcançável a partir do início): "${n.titulo || n.id}".`);
    const ehFinal = n.tipo === 'final';
    if (!ehFinal && !(n.saidas || []).length) avisos.push(`Beco sem saída não marcado como Final: "${n.titulo || n.id}".`);
    if (ehFinal && (n.saidas || []).length) avisos.push(`Nó Final com saídas (serão ignoradas na condução): "${n.titulo || n.id}".`);
  });
  const temVitoria = nos.some(n => n.tipo === 'final' && n.resultado === 'vitoria' && alcancados.has(n.id));
  if (!temVitoria) avisos.push('Nenhum caminho leva a um Final de VITÓRIA alcançável.');
  return { erros, avisos };
}

// Nó pelo id (helper usado na condução e nos testes)
function noDaAventura(definicao, noId) {
  return ((definicao && definicao.nos) || []).find(n => n.id === noId) || null;
}

// Export para o harness de testes em Node (no browser é ignorado)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AVENTURA_TIPOS, AVENTURA_AVISOS, validarAventura, noDaAventura };
}

// ---------- UI (só na tela do Mestre) ----------
(function () {
  if (typeof document === 'undefined') return; // Node (harness de testes): só as funções puras acima
  const $ = id => document.getElementById(id);
  const lib = $('aventuraLib');
  if (!lib) return; // página sem a aba Aventura
  const editor = $('aventuraEditor');
  const conducao = $('aventuraConducao');

  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uidAv = p => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const rotuloTipo = t => (AVENTURA_TIPOS.find(([k]) => k === t) || [t, t])[1];

  let aventuras = [];
  let ativa = null;
  let avEdit = null; // cópia em edição (só grava no Salvar)
  let vistaEditor = 'mapa'; // 'mapa' (canvas/mind-map) | 'lista' (cartões)
  let noSel = null;         // id do nó selecionado no canvas
  let canvasZoom = 1;       // zoom da vista mapa

  async function carregarTudo() {
    try { aventuras = await (await fetch('/api/aventuras')).json(); } catch (e) { aventuras = []; }
    if (!Array.isArray(aventuras)) aventuras = [];
    try { ativa = await (await fetch('/api/aventura_ativa')).json(); } catch (e) { ativa = null; }
    renderLib(); renderConducao();
  }

  function salvarBiblioteca() {
    return fetch('/api/aventuras', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aventuras) }).catch(() => {});
  }

  // ----- Biblioteca -----
  function renderLib() {
    lib.innerHTML = aventuras.length ? aventuras.map(a => {
      const v = validarAventura(a);
      return `<div class="ficha-card">
        <h3>📖 ${esc(a.titulo) || 'Sem título'}</h3>
        <div class="sub">${(a.nos || []).length} nó(s) · até ${(a.limites && a.limites.jogadoresMax) || 5} jogadores · nível ${(a.limites && a.limites.nivelMin) || 1}–${(a.limites && a.limites.nivelMax) || 20}</div>
        ${v.erros.length ? `<div class="npc-desc" style="color:var(--danger,#e94560)">⛔ ${v.erros.length} erro(s) no grafo</div>` : (v.avisos.length ? `<div class="npc-desc" style="color:#d29922">⚠️ ${v.avisos.length} aviso(s)</div>` : '<div class="npc-desc" style="color:#3fb950">✓ grafo válido</div>')}
        <div class="ficha-card-acoes">
          <button class="btn-primary" data-av-iniciar="${esc(a.id)}" ${v.erros.length || ativa ? 'disabled title="' + (ativa ? 'já há uma aventura em curso' : 'corrija os erros do grafo') + '"' : ''}>▶ Iniciar</button>
          <button class="btn-editar" data-av-editar="${esc(a.id)}">✎ Editar</button>
          <button class="btn-secondary" data-av-duplicar="${esc(a.id)}">⧉ Duplicar</button>
          <button class="btn-danger" data-av-excluir="${esc(a.id)}">Excluir</button>
        </div>
      </div>`;
    }).join('') : '<p style="color:var(--text-dim)">Nenhuma aventura ainda — crie a primeira com "➕ Nova aventura".</p>';

    lib.querySelectorAll('[data-av-editar]').forEach(b => b.addEventListener('click', () => abrirEditor(b.dataset.avEditar)));
    lib.querySelectorAll('[data-av-excluir]').forEach(b => b.addEventListener('click', () => {
      const a = aventuras.find(x => x.id === b.dataset.avExcluir);
      if (!a || !confirm(`Excluir a aventura "${a.titulo}" da sua biblioteca?`)) return;
      aventuras = aventuras.filter(x => x.id !== a.id);
      salvarBiblioteca(); renderLib();
    }));
    lib.querySelectorAll('[data-av-duplicar]').forEach(b => b.addEventListener('click', () => {
      const a = aventuras.find(x => x.id === b.dataset.avDuplicar);
      if (!a) return;
      const copia = JSON.parse(JSON.stringify(a));
      copia.id = uidAv('av');
      copia.titulo = `${a.titulo} (cópia)`;
      aventuras.push(copia);
      salvarBiblioteca(); renderLib();
    }));
    lib.querySelectorAll('[data-av-iniciar]').forEach(b => b.addEventListener('click', async () => {
      const a = aventuras.find(x => x.id === b.dataset.avIniciar);
      if (!a || !confirm(`Iniciar "${a.titulo}" nesta campanha? (a definição é copiada — editar a biblioteca depois não muda a mesa)`)) return;
      const r = await fetch('/api/aventura_ativa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ definicao: a }) });
      const d = await r.json();
      if (!r.ok || !d.ok) { alert(d.erro || 'Não foi possível iniciar.'); return; }
      await carregarTudo();
    }));
  }

  // ----- Editor (lista de nós — o canvas SVG é a v2) -----
  function abrirEditor(id) {
    const base = id ? aventuras.find(a => a.id === id) : null;
    avEdit = base ? JSON.parse(JSON.stringify(base)) : {
      id: uidAv('av'), titulo: '', limites: { jogadoresMax: 5, nivelMin: 1, nivelMax: 4 },
      noInicial: null, nos: [],
    };
    canvasZoom = 1; noSel = null;
    editor.classList.remove('hidden');
    renderEditor();
    editor.scrollIntoView({ behavior: 'smooth' });
  }

  function fecharEditor() {
    avEdit = null;
    editor.classList.add('hidden');
    editor.innerHTML = '';
  }

  function opcoesNos(selecionado, excluirId) {
    return avEdit.nos.filter(n => n.id !== excluirId)
      .map(n => `<option value="${esc(n.id)}" ${n.id === selecionado ? 'selected' : ''}>${esc(n.titulo) || n.id}</option>`).join('');
  }

  function renderEditor() {
    if (!avEdit) return;
    autoLayout(); // garante x/y em todo nó (posições do canvas)
    editor.innerHTML = `
      <div class="panel-header"><h2>${avEdit.titulo ? '✎ ' + esc(avEdit.titulo) : '➕ Nova aventura'}</h2></div>
      <div class="form-grid">
        <label class="full">Título <input type="text" id="aeTitulo" value="${esc(avEdit.titulo)}" placeholder="ex.: A Mina Perdida"></label>
        <label>Jogadores (máx) <input type="number" id="aeJogMax" value="${avEdit.limites.jogadoresMax}" min="1" max="10"></label>
        <label>Nível mín <input type="number" id="aeNivMin" value="${avEdit.limites.nivelMin}" min="1" max="20"></label>
        <label>Nível máx <input type="number" id="aeNivMax" value="${avEdit.limites.nivelMax}" min="1" max="20"></label>
        <label>Nó inicial <select id="aeInicial">${avEdit.nos.length ? opcoesNos(avEdit.noInicial) : '<option value="">(crie um nó)</option>'}</select></label>
      </div>
      <div class="ae-vista-toggle">
        <button type="button" class="btn-mini" data-vista="mapa">🗺️ Mapa</button>
        <button type="button" class="btn-mini" data-vista="lista">📋 Lista</button>
        <span class="criador-hint-inline">Mapa mental: arraste os nós; puxe da bolinha <b>●</b> de um nó até outro para ligar; clique numa seta remove; duplo-clique edita os detalhes.</span>
      </div>
      <div id="aeCorpo"></div>
      <div class="ficha-card-acoes">
        <button class="btn-secondary" id="aeAddNo">➕ Nó</button>
        <button class="btn-secondary" id="aeValidar">🔍 Verificar grafo</button>
        <button class="btn-primary" id="aeSalvar">💾 Salvar aventura</button>
        <button class="btn-secondary" id="aeCancelar">Cancelar</button>
      </div>
      <div id="aeValidacao"></div>`;

    // campos de topo
    $('aeTitulo').addEventListener('input', () => { avEdit.titulo = $('aeTitulo').value; });
    $('aeJogMax').addEventListener('change', () => { avEdit.limites.jogadoresMax = Math.max(1, +$('aeJogMax').value || 5); });
    $('aeNivMin').addEventListener('change', () => { avEdit.limites.nivelMin = Math.max(1, +$('aeNivMin').value || 1); });
    $('aeNivMax').addEventListener('change', () => { avEdit.limites.nivelMax = Math.max(1, +$('aeNivMax').value || 20); });
    $('aeInicial').addEventListener('change', () => { avEdit.noInicial = $('aeInicial').value || null; mostrarVista(); });

    $('aeAddNo').addEventListener('click', () => {
      const novo = { id: uidAv('n'), titulo: `Cena ${avEdit.nos.length + 1}`, tipo: 'narracao', narracao: '', notasMestre: '', encontro: [], saidas: [], npcs: [] };
      posicionarNovo(novo);
      avEdit.nos.push(novo);
      if (!avEdit.noInicial) avEdit.noInicial = novo.id;
      renderEditor();
    });
    $('aeValidar').addEventListener('click', () => {
      const v = validarAventura(avEdit);
      $('aeValidacao').innerHTML = `
        ${v.erros.length ? `<div class="aviso-mestre" style="border-color:var(--danger,#e94560)">⛔ <b>Erros:</b><br>${v.erros.map(esc).join('<br>')}</div>` : ''}
        ${v.avisos.length ? `<div class="aviso-mestre">⚠️ <b>Avisos:</b><br>${v.avisos.map(esc).join('<br>')}</div>` : ''}
        ${!v.erros.length && !v.avisos.length ? '<div class="aviso-mestre" style="border-color:#3fb950">✓ Grafo válido: sem erros nem avisos.</div>' : ''}`;
    });
    $('aeSalvar').addEventListener('click', () => {
      if (!avEdit.titulo.trim()) { alert('Dê um título à aventura.'); return; }
      if (!avEdit.nos.length) { alert('Crie pelo menos um nó.'); return; }
      const i = aventuras.findIndex(a => a.id === avEdit.id);
      if (i >= 0) aventuras[i] = avEdit; else aventuras.push(avEdit);
      salvarBiblioteca();
      fecharEditor(); renderLib();
    });
    $('aeCancelar').addEventListener('click', fecharEditor);

    editor.querySelectorAll('[data-vista]').forEach(b => b.addEventListener('click', () => { vistaEditor = b.dataset.vista; mostrarVista(); }));
    mostrarVista();
  }

  function mostrarVista() {
    if (!$('aeCorpo')) return;
    editor.querySelectorAll('[data-vista]').forEach(b => b.classList.toggle('on', b.dataset.vista === vistaEditor));
    if (vistaEditor === 'lista') renderListaNos(); else renderCanvas();
  }

  // ---------- Vista LISTA (cartões — comportamento original) ----------
  function renderListaNos() {
    const monstroOps = (typeof MONSTROS !== 'undefined') ? MONSTROS.map(m => `<option>${esc(m.nome)}</option>`).join('') : '';
    $('aeCorpo').innerHTML = avEdit.nos.length
      ? avEdit.nos.map((n, i) => cardNoEditor(n, i, monstroOps)).join('')
      : '<p style="color:var(--text-dim)">Nenhum nó ainda — clique em "➕ Nó".</p>';
    bindListaNos();
  }

  function bindListaNos() {
    editor.querySelectorAll('[data-no-campo]').forEach(inp => inp.addEventListener('input', () => {
      const n = avEdit.nos[+inp.dataset.noIdx];
      n[inp.dataset.noCampo] = inp.value;
    }));
    editor.querySelectorAll('[data-no-rem]').forEach(b => b.addEventListener('click', () => {
      const n = avEdit.nos[+b.dataset.noRem];
      if (!confirm(`Remover o nó "${n.titulo || n.id}"? (saídas que apontam para ele ficam inválidas até corrigir)`)) return;
      avEdit.nos.splice(+b.dataset.noRem, 1);
      avEdit.nos.forEach(m => { m.saidas = (m.saidas || []).filter(s => s.para !== n.id); });
      if (avEdit.noInicial === n.id) avEdit.noInicial = avEdit.nos.length ? avEdit.nos[0].id : null;
      renderEditor();
    }));
    editor.querySelectorAll('[data-enc-add]').forEach(b => b.addEventListener('click', () => {
      const n = avEdit.nos[+b.dataset.encAdd];
      const sel = editor.querySelector(`[data-enc-sel="${b.dataset.encAdd}"]`);
      const qtd = Math.max(1, +editor.querySelector(`[data-enc-qtd="${b.dataset.encAdd}"]`).value || 1);
      (n.encontro = n.encontro || []).push({ nome: sel.value, qtd });
      renderEditor();
    }));
    editor.querySelectorAll('[data-enc-rem]').forEach(b => b.addEventListener('click', () => {
      const [i, j] = b.dataset.encRem.split(':').map(Number);
      avEdit.nos[i].encontro.splice(j, 1);
      renderEditor();
    }));
    editor.querySelectorAll('[data-saida-add]').forEach(b => b.addEventListener('click', () => {
      const n = avEdit.nos[+b.dataset.saidaAdd];
      const outro = avEdit.nos.find(x => x.id !== n.id);
      (n.saidas = n.saidas || []).push({ para: outro ? outro.id : n.id, rotulo: '', aviso: '' });
      renderEditor();
    }));
    editor.querySelectorAll('[data-saida-rem]').forEach(b => b.addEventListener('click', () => {
      const [i, j] = b.dataset.saidaRem.split(':').map(Number);
      avEdit.nos[i].saidas.splice(j, 1);
      renderEditor();
    }));
    editor.querySelectorAll('[data-saida-campo]').forEach(inp => inp.addEventListener('change', () => {
      const [i, j] = inp.dataset.saidaIdx.split(':').map(Number);
      avEdit.nos[i].saidas[j][inp.dataset.saidaCampo] = inp.value;
    }));
    editor.querySelectorAll('[data-npcnode-add]').forEach(b => b.addEventListener('click', () => {
      const n = avEdit.nos[+b.dataset.npcnodeAdd];
      (n.npcs = n.npcs || []).push({ nome: '', tipo: 'neutro', descricao: '', notasPrivadas: '' });
      renderEditor();
    }));
    editor.querySelectorAll('[data-npcnode-rem]').forEach(b => b.addEventListener('click', () => {
      const [i, j] = b.dataset.npcnodeRem.split(':').map(Number);
      avEdit.nos[i].npcs.splice(j, 1);
      renderEditor();
    }));
    editor.querySelectorAll('[data-npcnode-campo]').forEach(inp => inp.addEventListener('change', () => {
      const [i, j] = inp.dataset.npcnodeIdx.split(':').map(Number);
      avEdit.nos[i].npcs[j][inp.dataset.npcnodeCampo] = inp.value;
    }));
    editor.querySelectorAll('[data-no-tipo]').forEach(sel => sel.addEventListener('change', () => {
      avEdit.nos[+sel.dataset.noTipo].tipo = sel.value;
      renderEditor(); // o campo "resultado" aparece/some conforme o tipo
    }));
    editor.querySelectorAll('[data-no-resultado]').forEach(sel => sel.addEventListener('change', () => {
      avEdit.nos[+sel.dataset.noResultado].resultado = sel.value;
    }));
  }

  // ---------- Vista MAPA (canvas / mapa mental) ----------
  const NODE_W = 168; // largura fixa do nó no canvas (px) — casa com o CSS .ae-node

  // Atribui x/y aos nós que ainda não têm — layout em camadas (esq→dir) a
  // partir do nó inicial; nós órfãos ficam numa faixa abaixo. Posições
  // manuais (já com x/y) são preservadas.
  function autoLayout() {
    if (!avEdit || !avEdit.nos.length) return;
    const faltam = avEdit.nos.some(n => typeof n.x !== 'number' || typeof n.y !== 'number');
    if (!faltam) return;
    const byId = {}; avEdit.nos.forEach(n => { byId[n.id] = n; });
    const prof = {}; const fila = [];
    const inicial = (avEdit.noInicial && byId[avEdit.noInicial]) ? avEdit.noInicial : avEdit.nos[0].id;
    prof[inicial] = 0; fila.push(inicial);
    while (fila.length) {
      const id = fila.shift();
      (byId[id].saidas || []).forEach(s => {
        if (byId[s.para] && prof[s.para] == null) { prof[s.para] = prof[id] + 1; fila.push(s.para); }
      });
    }
    const porCol = {};
    avEdit.nos.forEach(n => {
      if (typeof n.x === 'number' && typeof n.y === 'number') return;
      const orfao = prof[n.id] == null;
      const col = orfao ? 0 : prof[n.id];
      const linha = porCol[col] || 0; porCol[col] = linha + 1;
      n.x = 30 + col * 210;
      n.y = 30 + linha * 118 + (orfao ? 470 : 0);
    });
  }

  function posicionarNovo(novo) {
    let maxX = 0;
    avEdit.nos.forEach(n => { if ((n.x || 0) > maxX) maxX = n.x || 0; });
    novo.x = avEdit.nos.length ? maxX + 210 : 30;
    novo.y = 30 + (avEdit.nos.length % 5) * 118;
  }

  const tipoIcone = t => (rotuloTipo(t) || '').split(' ')[0] || '📜';
  const SVGNS = 'http://www.w3.org/2000/svg';

  function renderCanvas() {
    const corpo = $('aeCorpo');
    let maxX = 420, maxY = 320;
    avEdit.nos.forEach(n => { maxX = Math.max(maxX, (n.x || 0) + NODE_W + 80); maxY = Math.max(maxY, (n.y || 0) + 160); });
    corpo.innerHTML = `
      <div class="ae-canvas-topo">
        <button type="button" class="btn-mini" data-zoom="out" title="Diminuir zoom">−</button>
        <span id="aeZoomPct" class="ae-zoom-pct">100%</span>
        <button type="button" class="btn-mini" data-zoom="in" title="Aumentar zoom">＋</button>
        <button type="button" class="btn-mini" data-zoom="fit" title="Enquadrar tudo">⤢ Ajustar</button>
        <span class="criador-hint-inline">Roda do mouse dá zoom · arraste o fundo para deslocar · duplo-clique no título renomeia</span>
      </div>
      <div class="ae-canvas-wrap" id="aeCanvasWrap">
        <div class="ae-canvas-scroll" id="aeCanvasScroll" style="width:${maxX}px;height:${maxY}px">
          <div class="ae-canvas" id="aeCanvas" style="width:${maxX}px;height:${maxY}px;transform-origin:0 0">
            <svg class="ae-edges" id="aeEdges" width="${maxX}" height="${maxY}">
              <defs><marker id="aeSeta" markerWidth="12" markerHeight="12" refX="9" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
                <path d="M0,0 L9,3.5 L0,7 Z" fill="var(--accent,#e94560)"></path></marker></defs>
            </svg>
          </div>
        </div>
      </div>
      ${avEdit.nos.length ? '' : '<p style="color:var(--text-dim);margin-top:8px">Canvas vazio — clique em "➕ Nó" para criar a primeira cena.</p>'}`;
    const canvas = $('aeCanvas');
    avEdit.nos.forEach(n => canvas.appendChild(nodeEl(n)));
    aplicarZoom(canvasZoom);
    desenharEdges();
    ligarCanvas(canvas);
  }

  function nodeEl(n) {
    const el = document.createElement('div');
    el.className = 'ae-node ae-tipo-' + (n.tipo || 'narracao') + (n.id === noSel ? ' selected' : '');
    el.style.left = (n.x || 0) + 'px';
    el.style.top = (n.y || 0) + 'px';
    el.dataset.id = n.id;
    const inicial = n.id === avEdit.noInicial;
    const meta = [
      (n.encontro || []).length ? '⚔️' + n.encontro.length : '',
      (n.npcs || []).length ? '🧑' + n.npcs.length : '',
      '➡️' + (n.saidas || []).length,
      n.tipo === 'final' ? '🏁' + (n.resultado ? ' ' + esc(n.resultado) : '') : '',
    ].filter(Boolean).join(' · ');
    el.innerHTML = `
      <div class="ae-node-cab">
        <span class="ae-node-ic" data-setinicial title="${inicial ? 'Nó inicial' : 'Marcar como nó inicial'}">${inicial ? '⭐' : tipoIcone(n.tipo)}</span>
        <span class="ae-node-tit" title="Duplo-clique renomeia">${esc(n.titulo) || '(sem título)'}</span>
        <button class="ae-node-x" title="Remover nó" data-nodex>✕</button>
      </div>
      <div class="ae-node-meta">${meta}</div>
      <div class="ae-node-handle" data-handle title="Arraste até outro nó para criar uma saída"></div>`;
    return el;
  }

  // Zoom aplicado por transform no #aeCanvas; o #aeCanvasScroll fica com o
  // tamanho JÁ escalado para as barras de rolagem baterem certo.
  function aplicarZoom(z) {
    canvasZoom = Math.max(0.4, Math.min(1.8, z));
    const canvas = $('aeCanvas'), scroll = $('aeCanvasScroll'), pct = $('aeZoomPct');
    if (!canvas || !scroll) return;
    const w = canvas.offsetWidth, h = canvas.offsetHeight; // base (pré-transform)
    canvas.style.transform = `scale(${canvasZoom})`;
    scroll.style.width = (w * canvasZoom) + 'px';
    scroll.style.height = (h * canvasZoom) + 'px';
    if (pct) pct.textContent = Math.round(canvasZoom * 100) + '%';
  }

  // Converte coordenadas de ecrã → coordenadas do canvas (independente do zoom).
  function pontoCanvas(clientX, clientY) {
    const r = $('aeCanvas').getBoundingClientRect();
    return { x: (clientX - r.left) / canvasZoom, y: (clientY - r.top) / canvasZoom };
  }

  function desenharEdges() {
    const svg = $('aeEdges'), canvas = $('aeCanvas');
    if (!svg || !canvas) return;
    [...svg.querySelectorAll('.ae-edge, .ae-edge-lbl')].forEach(p => p.remove());
    // geometria em coordenadas do canvas (offset*), imune ao zoom
    avEdit.nos.forEach(n => {
      const a = canvas.querySelector(`.ae-node[data-id="${n.id}"]`);
      if (!a) return;
      const x1 = a.offsetLeft + a.offsetWidth, y1 = a.offsetTop + a.offsetHeight / 2;
      (n.saidas || []).forEach((s, j) => {
        const b = canvas.querySelector(`.ae-node[data-id="${s.para}"]`);
        if (!b) return;
        const x2 = b.offsetLeft, y2 = b.offsetTop + b.offsetHeight / 2;
        const mx = (x1 + x2) / 2;
        const path = document.createElementNS(SVGNS, 'path');
        path.setAttribute('d', `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`);
        path.setAttribute('class', 'ae-edge' + (s.aviso === 'mortal' ? ' ae-edge-mortal' : ''));
        path.setAttribute('data-edge', n.id + '|' + j);
        path.setAttribute('marker-end', 'url(#aeSeta)');
        svg.appendChild(path);
        const rot = (s.rotulo || '').trim();
        if (rot) {
          const txt = document.createElementNS(SVGNS, 'text');
          txt.setAttribute('class', 'ae-edge-lbl');
          txt.setAttribute('x', (x1 + x2) / 2);
          txt.setAttribute('y', (y1 + y2) / 2 - 5);
          txt.setAttribute('text-anchor', 'middle');
          txt.textContent = rot.length > 22 ? rot.slice(0, 21) + '…' : rot;
          svg.appendChild(txt);
        }
      });
    });
  }

  function renomearInline(node, n) {
    const tit = node.querySelector('.ae-node-tit');
    if (!tit || tit.querySelector('input')) return;
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'ae-node-tit-input'; inp.value = n.titulo || '';
    tit.replaceChildren(inp); inp.focus(); inp.select();
    let feito = false;
    const commit = () => { if (feito) return; feito = true; n.titulo = inp.value.trim(); if ($('aeInicial')) mostrarVista(); renderCanvas(); };
    inp.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { ev.preventDefault(); commit(); }
      else if (ev.key === 'Escape') { feito = true; renderCanvas(); }
    });
    inp.addEventListener('blur', commit);
    inp.addEventListener('mousedown', ev => ev.stopPropagation());
    inp.addEventListener('dblclick', ev => ev.stopPropagation());
  }

  function ligarCanvas(canvas) {
    const wrap = $('aeCanvasWrap');
    let modo = null, alvo = null, origem = null, tempLine = null;
    const off = { x: 0, y: 0 };       // agarrar nó (coords canvas)
    const pan = { x: 0, y: 0, sl: 0, st: 0 };

    function onMove(e) {
      if (modo === 'move' && alvo) {
        const p = pontoCanvas(e.clientX, e.clientY);
        const x = Math.max(0, p.x - off.x), y = Math.max(0, p.y - off.y);
        alvo.style.left = x + 'px'; alvo.style.top = y + 'px';
        const n = avEdit.nos.find(z => z.id === alvo.dataset.id);
        if (n) { n.x = x; n.y = y; }
        desenharEdges();
      } else if (modo === 'connect' && tempLine) {
        const a = canvas.querySelector(`.ae-node[data-id="${origem}"]`);
        if (!a) return;
        const p = pontoCanvas(e.clientX, e.clientY);
        tempLine.setAttribute('d', `M${a.offsetLeft + a.offsetWidth},${a.offsetTop + a.offsetHeight / 2} L${p.x},${p.y}`);
      } else if (modo === 'pan') {
        wrap.scrollLeft = pan.sl - (e.clientX - pan.x);
        wrap.scrollTop = pan.st - (e.clientY - pan.y);
      }
    }
    function onUp(e) {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (modo === 'connect') {
        const sob = document.elementFromPoint(e.clientX, e.clientY);
        const destino = sob && sob.closest ? sob.closest('.ae-node') : null;
        if (tempLine) tempLine.remove();
        if (destino && destino.dataset.id !== origem) {
          const src = avEdit.nos.find(z => z.id === origem);
          if (src && !(src.saidas || []).some(s => s.para === destino.dataset.id)) {
            (src.saidas = src.saidas || []).push({ para: destino.dataset.id, rotulo: '', aviso: '' });
          }
        }
        renderCanvas();
      } else if (modo === 'move' && alvo) {
        alvo.classList.remove('dragging');
      } else if (modo === 'pan') {
        wrap.classList.remove('ae-panning');
      }
      modo = null; alvo = null; origem = null; tempLine = null;
    }

    canvas.addEventListener('mousedown', e => {
      const node = e.target.closest('.ae-node');
      if (!node) { // fundo → pan
        modo = 'pan'; pan.x = e.clientX; pan.y = e.clientY; pan.sl = wrap.scrollLeft; pan.st = wrap.scrollTop;
        wrap.classList.add('ae-panning');
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
        return;
      }
      if (e.target.closest('.ae-node-tit-input')) return; // editando título
      if (e.target.closest('[data-nodex]')) { // remover nó
        const id = node.dataset.id;
        const n = avEdit.nos.find(x => x.id === id);
        if (n && confirm(`Remover o nó "${n.titulo || n.id}"?`)) {
          avEdit.nos = avEdit.nos.filter(x => x.id !== id);
          avEdit.nos.forEach(m => { m.saidas = (m.saidas || []).filter(s => s.para !== id); });
          if (avEdit.noInicial === id) avEdit.noInicial = avEdit.nos[0] ? avEdit.nos[0].id : null;
          renderCanvas();
        }
        return;
      }
      if (e.target.closest('[data-setinicial]')) { // marcar como inicial
        avEdit.noInicial = node.dataset.id;
        const sel = $('aeInicial'); if (sel) sel.value = node.dataset.id;
        renderCanvas();
        return;
      }
      noSel = node.dataset.id;
      canvas.querySelectorAll('.ae-node.selected').forEach(x => x.classList.remove('selected'));
      node.classList.add('selected');
      if (e.target.closest('[data-handle]')) { // iniciar ligação
        e.preventDefault();
        modo = 'connect'; origem = node.dataset.id;
        tempLine = document.createElementNS(SVGNS, 'path');
        tempLine.setAttribute('class', 'ae-edge ae-edge-temp');
        tempLine.setAttribute('marker-end', 'url(#aeSeta)');
        $('aeEdges').appendChild(tempLine);
      } else { // mover nó
        modo = 'move'; alvo = node;
        const p = pontoCanvas(e.clientX, e.clientY);
        const n = avEdit.nos.find(z => z.id === node.dataset.id);
        off.x = p.x - (n ? n.x : node.offsetLeft); off.y = p.y - (n ? n.y : node.offsetTop);
        node.classList.add('dragging');
      }
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    canvas.addEventListener('dblclick', e => {
      const node = e.target.closest('.ae-node'); if (!node) return;
      const n = avEdit.nos.find(x => x.id === node.dataset.id); if (!n) return;
      if (e.target.closest('.ae-node-tit')) { renomearInline(node, n); return; } // renomear no título
      // resto do nó → abre a vista Lista com os campos completos
      const idx = avEdit.nos.findIndex(x => x.id === node.dataset.id);
      vistaEditor = 'lista'; mostrarVista();
      const card = editor.querySelectorAll('#aeCorpo .av-no')[idx];
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    $('aeEdges').addEventListener('click', e => {
      const p = e.target.closest('.ae-edge'); if (!p || !p.dataset.edge) return;
      const [nid, j] = p.dataset.edge.split('|');
      const n = avEdit.nos.find(x => x.id === nid);
      if (n && confirm('Remover esta ligação (saída)?')) { n.saidas.splice(+j, 1); renderCanvas(); }
    });

    // zoom pela roda do mouse (mantém o ponto sob o cursor)
    wrap.addEventListener('wheel', e => {
      e.preventDefault();
      const p = pontoCanvas(e.clientX, e.clientY);
      aplicarZoom(canvasZoom * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
      const wr = wrap.getBoundingClientRect();
      wrap.scrollLeft = p.x * canvasZoom - (e.clientX - wr.left);
      wrap.scrollTop = p.y * canvasZoom - (e.clientY - wr.top);
    }, { passive: false });

    editor.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.zoom === 'in') aplicarZoom(canvasZoom * 1.15);
      else if (b.dataset.zoom === 'out') aplicarZoom(canvasZoom / 1.15);
      else ajustarCanvas();
    }));
  }

  // Enquadra todos os nós na área visível.
  function ajustarCanvas() {
    const wrap = $('aeCanvasWrap'), canvas = $('aeCanvas');
    if (!wrap || !canvas || !avEdit.nos.length) { aplicarZoom(1); return; }
    let minX = 1e9, minY = 1e9, maxX = 0, maxY = 0;
    avEdit.nos.forEach(n => {
      const el = canvas.querySelector(`.ae-node[data-id="${n.id}"]`); if (!el) return;
      minX = Math.min(minX, el.offsetLeft); minY = Math.min(minY, el.offsetTop);
      maxX = Math.max(maxX, el.offsetLeft + el.offsetWidth); maxY = Math.max(maxY, el.offsetTop + el.offsetHeight);
    });
    const w = (maxX - minX) + 80, h = (maxY - minY) + 80;
    aplicarZoom(Math.min(wrap.clientWidth / w, wrap.clientHeight / h));
    wrap.scrollLeft = (minX - 40) * canvasZoom;
    wrap.scrollTop = (minY - 40) * canvasZoom;
  }

  function cardNoEditor(n, i, monstroOps) {
    const ehFinal = n.tipo === 'final';
    return `<div class="ficha-card av-no">
      <div class="form-grid">
        <label class="full">Nó ${i + 1} — Título <input type="text" data-no-campo="titulo" data-no-idx="${i}" value="${esc(n.titulo)}"></label>
        <label>Tipo <select data-no-tipo="${i}">${AVENTURA_TIPOS.map(([k, r]) => `<option value="${k}" ${n.tipo === k ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        ${ehFinal ? `<label>Resultado <select data-no-resultado="${i}">
          <option value="vitoria" ${n.resultado === 'vitoria' ? 'selected' : ''}>🏆 Vitória</option>
          <option value="derrota" ${n.resultado === 'derrota' ? 'selected' : ''}>💀 Derrota</option>
          <option value="neutro" ${!n.resultado || n.resultado === 'neutro' ? 'selected' : ''}>😐 Neutro</option>
        </select></label>` : ''}
      </div>
      <label class="full">Narração (o que o Mestre lê/adapta)
        <textarea rows="2" data-no-campo="narracao" data-no-idx="${i}">${esc(n.narracao)}</textarea></label>
      <label class="full">🔒 Notas do Mestre (dicas de condução)
        <textarea rows="2" data-no-campo="notasMestre" data-no-idx="${i}">${esc(n.notasMestre)}</textarea></label>
      <div class="av-sub"><b>⚔️ Encontro do nó</b>
        <span class="add-monstro"><select data-enc-sel="${i}">${monstroOps}</select>
        <input type="number" data-enc-qtd="${i}" value="1" min="1" style="width:54px">
        <button class="btn-secondary btn-mini" data-enc-add="${i}">+</button></span>
        ${(n.encontro || []).map((e, j) => `<span class="cond-tag">${e.qtd}× ${esc(e.nome)} <a data-enc-rem="${i}:${j}" style="cursor:pointer">✕</a></span>`).join('')}
      </div>
      <div class="av-sub"><b>🧑‍🌾 NPCs do nó</b> <span class="criador-hint-inline">(apresentáveis aos jogadores durante a condução)</span>
        <button class="btn-secondary btn-mini" data-npcnode-add="${i}">+ NPC</button>
        ${(n.npcs || []).map((p, j) => `
          <div class="dado-row lj-linha av-npc-edit">
            <input type="text" placeholder="nome" value="${esc(p.nome)}" data-npcnode-campo="nome" data-npcnode-idx="${i}:${j}" style="flex:1">
            <select data-npcnode-campo="tipo" data-npcnode-idx="${i}:${j}">${AVENTURA_NPC_TIPOS.map(([k, r]) => `<option value="${k}" ${p.tipo === k ? 'selected' : ''}>${r}</option>`).join('')}</select>
            <button class="btn-danger btn-mini" data-npcnode-rem="${i}:${j}">✕</button>
            <input type="text" placeholder="descrição (os jogadores veem ao apresentar)" value="${esc(p.descricao)}" data-npcnode-campo="descricao" data-npcnode-idx="${i}:${j}" style="flex:1 1 100%">
            <input type="text" placeholder="🔒 notas privadas (nunca vão aos jogadores)" value="${esc(p.notasPrivadas)}" data-npcnode-campo="notasPrivadas" data-npcnode-idx="${i}:${j}" style="flex:1 1 100%">
          </div>`).join('')}
      </div>
      <div class="av-sub"><b>➡️ Saídas (escolhas)</b>
        <button class="btn-secondary btn-mini" data-saida-add="${i}">+ Saída</button>
        ${(n.saidas || []).map((s, j) => `
          <div class="dado-row lj-linha">
            <input type="text" placeholder="rótulo da escolha (ex.: Seguir a trilha norte)" value="${esc(s.rotulo)}" data-saida-campo="rotulo" data-saida-idx="${i}:${j}" style="flex:1">
            <span>→</span>
            <select data-saida-campo="para" data-saida-idx="${i}:${j}">${opcoesNos(s.para, n.id)}</select>
            <select data-saida-campo="aviso" data-saida-idx="${i}:${j}">${AVENTURA_AVISOS.map(([k, r]) => `<option value="${k}" ${s.aviso === k ? 'selected' : ''}>${r}</option>`).join('')}</select>
            <button class="btn-danger btn-mini" data-saida-rem="${i}:${j}">✕</button>
          </div>`).join('')}
      </div>
      <div class="ficha-card-acoes"><button class="btn-danger btn-mini" data-no-rem="${i}">Remover nó</button></div>
    </div>`;
  }

  // ----- Condução (aventura ativa na mesa) -----
  function renderConducao() {
    if (!ativa || !ativa.definicao) { conducao.innerHTML = ''; return; }
    const def = ativa.definicao;
    const no = noDaAventura(def, ativa.noAtual);
    if (!no) { conducao.innerHTML = ''; return; }
    const completado = !!(ativa.nosCompletados || {})[no.id];
    const trilha = (ativa.historico || []).map(id => {
      const x = noDaAventura(def, id);
      return esc(x ? x.titulo || x.id : id);
    }).join(' → ');
    conducao.innerHTML = `
      <div class="ficha-card av-conducao">
        <div class="panel-header"><h2>🎬 Em curso: ${esc(def.titulo)}</h2>
          <button class="btn-danger btn-mini" id="acEncerrar">Encerrar aventura</button></div>
        <div class="sub">Trilha: ${trilha}</div>
        <h3>${rotuloTipo(no.tipo)} — ${esc(no.titulo)}${completado ? ' ✓' : ''}${no.tipo === 'final' ? ` (${esc(no.resultado || 'neutro')})` : ''}</h3>
        ${no.narracao ? `<div class="npc-desc">📜 ${esc(no.narracao)}</div>` : ''}
        ${no.notasMestre ? `<div class="npc-notas-privadas">🔒 ${esc(no.notasMestre)}</div>` : ''}
        ${(no.npcs || []).length ? `<div class="av-sub"><b>🧑‍🌾 NPCs desta cena:</b>
          ${no.npcs.map((p, j) => {
            const jaExiste = (window.NPCS_CAMPANHA || []).some(n => (n.nome || '').trim().toLowerCase() === (p.nome || '').trim().toLowerCase());
            const rot = (AVENTURA_NPC_TIPOS.find(([k]) => k === p.tipo) || [p.tipo, p.tipo])[1];
            return `<div class="ficha-card npc-card npc-${esc(p.tipo)} av-npc-cond">
              <b>${esc(p.nome) || '(sem nome)'}</b> <span class="sub">${rot}</span>
              ${p.descricao ? `<div class="npc-desc">${esc(p.descricao)}</div>` : ''}
              ${p.notasPrivadas ? `<div class="npc-notas-privadas">🔒 ${esc(p.notasPrivadas)}</div>` : ''}
              <button class="btn-secondary btn-mini" data-ac-npc="${j}" ${jaExiste ? 'disabled title="já está na lista de NPCs da campanha"' : ''}>${jaExiste ? '✓ apresentado' : '👁️ Apresentar aos jogadores'}</button>
            </div>`;
          }).join('')}</div>` : ''}
        ${(no.encontro || []).length ? `<div class="av-sub"><b>⚔️ Encontro:</b> ${no.encontro.map(e => `${e.qtd}× ${esc(e.nome)}`).join(', ')}
          <button class="btn-secondary btn-mini" id="acLancarEncontro">⚔️ Lançar no combate</button></div>` : ''}
        ${!completado && no.tipo !== 'final' ? '<button class="btn-secondary btn-mini" id="acCompletar">✓ Marcar nó como vencido</button>' : ''}
        ${no.tipo !== 'final' && (no.saidas || []).length ? `<button class="btn-secondary btn-mini" id="acVotacao">${ativa.escolhasAbertas ? '🔒 Fechar votação' : '🗳️ Abrir escolhas aos jogadores'}</button>` : ''}
        ${no.tipo !== 'final' ? `<div class="av-sub"><b>➡️ Escolhas do grupo:</b>${ativa.escolhasAbertas ? ' <span class="chip-em-combate">🗳️ votação aberta</span>' : ''}<br>
          ${(no.saidas || []).map((s, j) => {
            const destino = noDaAventura(def, s.para);
            const avisoTag = s.aviso === 'mortal' ? ' 💀' : s.aviso === 'beco' ? ' 🚧' : '';
            const votosSaida = Object.values(ativa.votos || {}).filter(v => v.para === s.para);
            const votoTag = votosSaida.length ? ` · 🗳️ ${votosSaida.length} (${votosSaida.map(v => esc(v.nome)).join(', ')})` : '';
            return `<button class="btn-primary btn-mini" data-ac-avancar="${esc(s.para)}">${esc(s.rotulo) || (destino ? esc(destino.titulo) : s.para)}${avisoTag}${votoTag}</button> `;
          }).join('') || '<i>sem saídas — marque este nó como Final no editor</i>'}</div>` :
          '<div class="av-sub">🏁 A aventura chegou a um final. Encerre quando quiser.</div>'}
      </div>`;

    const bVot = $('acVotacao');
    if (bVot) bVot.addEventListener('click', async () => {
      await fetch('/api/aventura_ativa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ abrirEscolhas: !ativa.escolhasAbertas }) });
      ativa.escolhasAbertas = !ativa.escolhasAbertas;
      if (ativa.escolhasAbertas) ativa.votos = {};
      renderConducao();
    });

    $('acEncerrar').addEventListener('click', async () => {
      if (!confirm('Encerrar a aventura em curso? (o progresso da mesa é descartado; a definição continua na biblioteca)')) return;
      await fetch('/api/aventura_ativa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ encerrar: true }) });
      await carregarTudo();
    });
    conducao.querySelectorAll('[data-ac-npc]').forEach(b => b.addEventListener('click', () => {
      const p = (no.npcs || [])[+b.dataset.acNpc];
      if (!p) return;
      if (typeof window.npcAdicionarExterno !== 'function') { alert('Módulo de NPCs indisponível.'); return; }
      const r = window.npcAdicionarExterno(p);
      if (r === 'novo') { b.disabled = true; b.textContent = '✓ apresentado'; }
      else if (r === 'existente') { b.disabled = true; b.textContent = '✓ já existe na campanha'; }
      else if (r === 'sem-nome') alert('Dê um nome ao NPC no editor antes de apresentar.');
    }));
    const bComp = $('acCompletar');
    if (bComp) bComp.addEventListener('click', async () => {
      await fetch('/api/aventura_ativa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completarNo: no.id }) });
      (ativa.nosCompletados = ativa.nosCompletados || {})[no.id] = { vencido: true };
      renderConducao();
    });
    const bEnc = $('acLancarEncontro');
    if (bEnc) bEnc.addEventListener('click', () => {
      if (typeof addMonstro !== 'function') return;
      (no.encontro || []).forEach(e => addMonstro(e.nome, e.qtd));
      const tab = document.querySelector('[data-tab="combate"]');
      if (tab) tab.click();
    });
    conducao.querySelectorAll('[data-ac-avancar]').forEach(b => b.addEventListener('click', async () => {
      const destino = noDaAventura(def, b.dataset.acAvancar);
      if (!confirm(`O grupo segue para "${destino ? destino.titulo : b.dataset.acAvancar}"?`)) return;
      const r = await fetch('/api/aventura_ativa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noAtual: b.dataset.acAvancar }) });
      const d = await r.json();
      if (!r.ok || !d.ok) { alert(d.erro || 'Não foi possível avançar.'); return; }
      ativa.noAtual = d.noAtual;
      (ativa.historico = ativa.historico || []).push(d.noAtual);
      ativa.escolhasAbertas = false; ativa.votos = {}; // o servidor também limpa
      renderConducao(); renderLib();
    }));
  }

  // P1: enquanto a votação está aberta, atualiza os votos a cada 6s
  setInterval(async () => {
    if (!ativa || !ativa.escolhasAbertas) return;
    try {
      const nova = await (await fetch('/api/aventura_ativa')).json();
      if (nova && JSON.stringify(nova.votos || {}) !== JSON.stringify(ativa.votos || {})) {
        ativa = nova;
        renderConducao();
      }
    } catch (e) {}
  }, 6000);

  $('avNova').addEventListener('click', () => abrirEditor(null));

  // ----- Modelos prontos (aventurasprontas.js) -----
  const btnModelo = $('avImportarModelo');
  if (btnModelo) btnModelo.addEventListener('click', () => {
    const prontas = (typeof AVENTURAS_PRONTAS !== 'undefined') ? AVENTURAS_PRONTAS : [];
    if (!prontas.length) { alert('Nenhum modelo disponível.'); return; }
    let escolhida = prontas[0];
    if (prontas.length > 1) {
      const lista = prontas.map((a, i) => `${i + 1}. ${a.titulo}`).join('\n');
      const resp = prompt(`Qual modelo importar?\n${lista}\n\nDigite o número:`, '1');
      if (resp === null) return;
      escolhida = prontas[Math.max(1, Math.min(prontas.length, parseInt(resp, 10) || 1)) - 1];
    }
    const copia = JSON.parse(JSON.stringify(escolhida));
    copia.id = uidAv('av'); // id novo: importar 2× cria 2 cópias independentes
    aventuras.push(copia);
    salvarBiblioteca(); renderLib();
    alert(`"${copia.titulo}" importada para a sua biblioteca — edite à vontade, o modelo original não muda.`);
  });

  carregarTudo();
})();
