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
    const monstroOps = (typeof MONSTROS !== 'undefined') ? MONSTROS.map(m => `<option>${esc(m.nome)}</option>`).join('') : '';
    editor.innerHTML = `
      <div class="panel-header"><h2>${avEdit.titulo ? '✎ ' + esc(avEdit.titulo) : '➕ Nova aventura'}</h2></div>
      <div class="form-grid">
        <label class="full">Título <input type="text" id="aeTitulo" value="${esc(avEdit.titulo)}" placeholder="ex.: A Mina Perdida"></label>
        <label>Jogadores (máx) <input type="number" id="aeJogMax" value="${avEdit.limites.jogadoresMax}" min="1" max="10"></label>
        <label>Nível mín <input type="number" id="aeNivMin" value="${avEdit.limites.nivelMin}" min="1" max="20"></label>
        <label>Nível máx <input type="number" id="aeNivMax" value="${avEdit.limites.nivelMax}" min="1" max="20"></label>
        <label>Nó inicial <select id="aeInicial">${avEdit.nos.length ? opcoesNos(avEdit.noInicial) : '<option value="">(crie um nó)</option>'}</select></label>
      </div>
      <div id="aeNos">${avEdit.nos.map((n, i) => cardNoEditor(n, i, monstroOps)).join('')}</div>
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
    $('aeInicial').addEventListener('change', () => { avEdit.noInicial = $('aeInicial').value || null; });

    // campos por nó (delegação simples via data-attrs)
    editor.querySelectorAll('[data-no-campo]').forEach(inp => inp.addEventListener('input', () => {
      const n = avEdit.nos[+inp.dataset.noIdx];
      n[inp.dataset.noCampo] = inp.value;
    }));
    editor.querySelectorAll('[data-no-rem]').forEach(b => b.addEventListener('click', () => {
      const n = avEdit.nos[+b.dataset.noRem];
      if (!confirm(`Remover o nó "${n.titulo || n.id}"? (saídas que apontam para ele ficam inválidas até corrigir)`)) return;
      avEdit.nos.splice(+b.dataset.noRem, 1);
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

    $('aeAddNo').addEventListener('click', () => {
      const novo = { id: uidAv('n'), titulo: `Cena ${avEdit.nos.length + 1}`, tipo: 'narracao', narracao: '', notasMestre: '', encontro: [], saidas: [] };
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
