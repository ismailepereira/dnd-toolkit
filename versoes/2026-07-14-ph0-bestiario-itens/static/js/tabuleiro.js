// =====================================================================
// Tabuleiro-imagem AO VIVO — render + tokens arrastáveis (Fases 16.3/16.4/16.5)
// ---------------------------------------------------------------------
// window.Tabuleiro — usado no Mestre (app.js) e no Jogador (jogador.js).
//   • Desenha a imagem do mapa (tabuleiro.imagemUrl, por URL — NÃO depende do
//     Firebase Storage) + um TOKEN por PJ (tabuleiro.tokens[fichaId]={x,y,tam})
//     e por MONSTRO (tabuleiro.monstros[id]={nome,categoria,imagemUrl,x,y,tam}).
//   • Arrastar (Pointer Events → funciona com MOUSE e TOQUE): Mestre move
//     qualquer token; jogador só o(s) da própria ficha, e só se o mapa não
//     estiver TRAVADO. No fim do arrasto, POST grava a posição (o servidor
//     revalida posse/trava) → tempo real leva aos demais; sem RT, poll leve.
//   • Fase 16.5: toque (Pointer Events), "travar jogadores" (Mestre), e
//     redimensionar token (Mestre seleciona um token e usa 🔎−/🔎＋).
//   • Token de PJ = miniaturaFichaHtml (símbolo da classe como fallback);
//     token de monstro = imagem (URL) ou ícone da categoria.
// =====================================================================
(function () {
  if (typeof document === 'undefined') return; // ambiente sem DOM

  let cont = null;              // container onde o board é desenhado
  let ehMestre = false;
  let meuUid = null;
  let getFichas = () => [];     // a página fornece a lista atual de fichas
  let tab = { aberto: false, imagemUrl: null, tokens: {}, monstros: {}, travado: false };
  let arrastando = null;        // id do token em arrasto (suspende o re-render)
  let selecionado = null;       // { kind, id } selecionado pelo Mestre (só cliente)
  let pollTimer = null;
  let ultimaChave = '';         // assinatura do último render (evita reconstruir sem mudança)

  const TAMS = [0.7, 0.85, 1, 1.25, 1.6, 2]; // passos de tamanho do token
  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round2 = n => Math.round(n * 100) / 100;

  // Ícone por categoria de monstro (fallback quando não há imagem).
  const CATEGORIA_ICONE = {
    'Aberração': '👁️', 'Animal': '🐺', 'Constructo': '🗿', 'Corruptor': '😈',
    'Culto do Dragão': '🐲', 'Dragão': '🐉', 'Elemental': '🔥', 'Fey': '🧚',
    'Gigante': '🗿', 'Goblinoide': '👺', 'Humanoide': '🧑', 'Limo': '🫧',
    'Monstruosidade': '🦎', 'Morto-vivo': '💀',
  };
  const iconeCategoria = c => CATEGORIA_ICONE[c] || '👹';

  function podeMover(f) {
    if (ehMestre) return true;
    if (tab.travado) return false;               // 16.5: Mestre travou os jogadores
    const dono = f && f.donoUid;
    return !dono || !meuUid || dono === meuUid;   // ficha legada sem dono: liberada
  }

  function posDe(fid, idx) {
    const p = tab.tokens && tab.tokens[fid];
    if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
    return { x: 8 + (idx * 11) % 84, y: 86 }; // padrão: PJs na faixa de baixo
  }

  function tamDe(kind, id) {
    const o = kind === 'monstro' ? (tab.monstros[id] || {}) : (tab.tokens[id] || {});
    return (typeof o.tam === 'number' && o.tam > 0) ? o.tam : 1;
  }

  // PJs elegíveis a token: fichas vivas (ou sem status).
  function fichasNoTabuleiro() {
    return (getFichas() || []).filter(f => f && f.id && (f.status ? f.status !== 'morto' : true));
  }

  // Monstros colocados no tabuleiro ([id, dados]); default no topo.
  function monstrosNoTabuleiro() {
    return Object.entries(tab.monstros || {}).map(([id, m], idx) => {
      const px = (m && typeof m.x === 'number') ? m.x : 8 + (idx * 11) % 84;
      const py = (m && typeof m.y === 'number') ? m.y : 14;
      return { id, nome: (m && m.nome) || 'Monstro', categoria: m && m.categoria, imagemUrl: m && m.imagemUrl, x: px, y: py };
    });
  }

  function aplicar(novo) {
    tab = {
      aberto: !!(novo && novo.aberto),
      imagemUrl: (novo && novo.imagemUrl) || null,
      tokens: (novo && novo.tokens) || {},
      monstros: (novo && novo.monstros) || {},
      travado: !!(novo && novo.travado),
    };
  }

  // Garante que o token selecionado ainda existe (senão limpa a seleção).
  function validarSelecao() {
    if (!selecionado) return;
    if (selecionado.kind === 'monstro') { if (!tab.monstros[selecionado.id]) selecionado = null; }
    else if (!(getFichas() || []).some(f => f && f.id === selecionado.id)) selecionado = null;
  }

  function render() {
    if (!cont || arrastando) return; // não reconstrói durante um arrasto local
    if (!tab.aberto || !tab.imagemUrl) {
      if (ehMestre) { cont.classList.add('hidden'); cont.innerHTML = ''; }
      else { cont.classList.remove('hidden'); cont.innerHTML = '<div class="tab-vazio">🗺️ O Mestre ainda não abriu nenhum mapa.</div>'; }
      ultimaChave = '';
      return;
    }
    cont.classList.remove('hidden');
    validarSelecao();
    const fichas = fichasNoTabuleiro();
    const monstros = monstrosNoTabuleiro();
    // Só reconstrói o DOM se algo relevante mudou — evita flicker e não destaca
    // tokens durante interação (o poll de fallback ocioso vira no-op).
    const chave = JSON.stringify({
      i: tab.imagemUrl, t: tab.tokens, m: tab.monstros, tr: tab.travado, s: selecionado,
      f: fichas.map(f => [f.id, f.nome, f.classe, f.miniaturaUrl || '', podeMover(f)]),
    });
    if (chave === ultimaChave && document.getElementById('tabBoard')) return;
    ultimaChave = chave;
    const safeImg = String(tab.imagemUrl).replace(/"/g, '&quot;');
    cont.innerHTML =
      barraMestreHtml() +
      (!ehMestre && tab.travado ? '<div class="tab-aviso">🔒 O Mestre travou o movimento dos tokens.</div>' : '') +
      '<div class="tab-board" id="tabBoard">' +
        `<img class="tab-img" src="${safeImg}" alt="mapa" draggable="false">` +
        fichas.map((f, i) => {
          const p = posDe(f.id, i);
          const mine = podeMover(f);
          const sel = selecionado && selecionado.kind === 'pj' && selecionado.id === f.id;
          return `<div class="tab-token${mine ? ' movivel' : ''}${sel ? ' selecionado' : ''}" data-kind="pj" data-id="${esc(f.id)}" ` +
            `style="left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%) scale(${tamDe('pj', f.id)})" title="${esc(f.nome || 'PJ')}">` +
            (typeof miniaturaFichaHtml === 'function' ? miniaturaFichaHtml(f, 44) : '') +
            `<span class="tab-token-nome">${esc(f.nome || 'PJ')}</span>` +
          '</div>';
        }).join('') +
        monstros.map(m => {
          const corpo = m.imagemUrl
            ? `<img class="tab-mon-img" src="${String(m.imagemUrl).replace(/"/g, '&quot;')}" alt="">`
            : `<span class="tab-mon-ic">${iconeCategoria(m.categoria)}</span>`;
          const sel = selecionado && selecionado.kind === 'monstro' && selecionado.id === m.id;
          return `<div class="tab-token tab-token-monstro${ehMestre ? ' movivel' : ''}${sel ? ' selecionado' : ''}" data-kind="monstro" data-id="${esc(m.id)}" ` +
            `style="left:${m.x}%;top:${m.y}%;transform:translate(-50%,-50%) scale(${tamDe('monstro', m.id)})" title="${esc(m.nome)}">` +
            corpo +
            `<span class="tab-token-nome">${esc(m.nome)}</span>` +
          '</div>';
        }).join('') +
      '</div>';
    ligarArrasto();
    ligarBarraMestre();
  }

  // Barra do Mestre: adicionar monstro + travar jogadores + controles do token
  // selecionado (tamanho / remover).
  function barraMestreHtml() {
    if (!ehMestre) return '';
    const lista = (typeof MONSTROS !== 'undefined') ? MONSTROS : [];
    const ops = lista.map(m => `<option value="${esc(m.nome)}" data-cat="${esc(m.categoria || '')}">${esc(m.nome)}</option>`).join('');
    return '<div class="tab-mestre-barra">' +
      (lista.length ? '<label>🐉 Monstro <select id="tabMonSel">' + ops + '</select></label>' +
        '<button type="button" class="btn-secondary btn-mini" id="tabMonAdd">➕ Colocar</button>' : '') +
      `<button type="button" class="btn-mini${tab.travado ? ' on' : ''}" id="tabTravar" title="Impede os jogadores de mover os tokens">${tab.travado ? '🔒 Jogadores travados' : '🔓 Travar jogadores'}</button>` +
      selecionadoHtml() +
      '<span class="criador-hint-inline">Toque/clique num token seleciona; arraste para mover; duplo-clique num monstro remove.</span>' +
    '</div>';
  }

  function selecionadoHtml() {
    if (!ehMestre || !selecionado) return '';
    const ehMon = selecionado.kind === 'monstro';
    let nome;
    if (ehMon) { const m = tab.monstros[selecionado.id]; if (!m) return ''; nome = m.nome; }
    else { const f = (getFichas() || []).find(x => x && x.id === selecionado.id); if (!f) return ''; nome = f.nome || 'PJ'; }
    return '<span class="tab-sel-info">Selecionado: <b>' + esc(nome) + '</b>' +
      ' <button type="button" class="btn-mini" id="tabSelMenos" title="Menor">🔎−</button>' +
      ' <button type="button" class="btn-mini" id="tabSelMais" title="Maior">🔎＋</button>' +
      (ehMon ? ' <button type="button" class="btn-danger btn-mini" id="tabSelRem">🗑 Remover</button>' : '') +
    '</span>';
  }

  function selecionar(kind, id) {
    if (selecionado && selecionado.kind === kind && selecionado.id === id) selecionado = null; // alterna
    else selecionado = { kind, id };
    render();
  }

  function passoTam(dir) {
    if (!selecionado) return;
    const atual = tamDe(selecionado.kind, selecionado.id);
    let i = TAMS.reduce((best, v, idx) => Math.abs(v - atual) < Math.abs(TAMS[best] - atual) ? idx : best, 0);
    i = Math.max(0, Math.min(TAMS.length - 1, i + dir));
    const novo = TAMS[i];
    if (selecionado.kind === 'monstro') salvarMonstro({ id: selecionado.id, tam: novo });
    else salvarToken({ id: selecionado.id, tam: novo });
  }

  function ligarArrasto() {
    const board = document.getElementById('tabBoard');
    if (!board) return;
    board.querySelectorAll('.tab-token.movivel').forEach(tk => {
      tk.addEventListener('pointerdown', e => {
        if (e.button && e.button !== 0) return; // só botão principal / toque
        e.preventDefault();
        const startX = e.clientX, startY = e.clientY;
        let moveu = false;
        arrastando = tk.dataset.id;
        tk.classList.add('arrastando');
        try { tk.setPointerCapture(e.pointerId); } catch (_) {}
        const rect = board.getBoundingClientRect();
        function mv(ev) {
          if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 4) moveu = true;
          let x = ((ev.clientX - rect.left) / rect.width) * 100;
          let y = ((ev.clientY - rect.top) / rect.height) * 100;
          x = Math.max(0, Math.min(100, x)); y = Math.max(0, Math.min(100, y));
          tk.style.left = x + '%'; tk.style.top = y + '%';
          tk._x = x; tk._y = y;
        }
        function up() {
          tk.removeEventListener('pointermove', mv);
          tk.removeEventListener('pointerup', up);
          tk.removeEventListener('pointercancel', up);
          tk.classList.remove('arrastando');
          const id = arrastando, kind = tk.dataset.kind; arrastando = null;
          if (moveu && typeof tk._x === 'number') {
            if (kind === 'monstro') {
              (tab.monstros[id] = tab.monstros[id] || {}).x = round2(tk._x);
              tab.monstros[id].y = round2(tk._y);
              salvarMonstro({ id: id, x: tk._x, y: tk._y });
            } else {
              const ent = (tab.tokens = tab.tokens || {})[id] = tab.tokens[id] || {};
              ent.x = round2(tk._x); ent.y = round2(tk._y); // otimista
              salvarToken({ id: id, x: tk._x, y: tk._y });
            }
          } else if (ehMestre) {
            selecionar(kind, id); // toque/clique sem arrastar → seleciona (Mestre)
          }
        }
        tk.addEventListener('pointermove', mv);
        tk.addEventListener('pointerup', up);
        tk.addEventListener('pointercancel', up);
      });
    });
    // Mestre remove um monstro com duplo-clique no token (atalho de mouse).
    if (ehMestre) board.querySelectorAll('.tab-token-monstro').forEach(tk => {
      tk.addEventListener('dblclick', () => {
        const m = tab.monstros[tk.dataset.id];
        if (m && confirm(`Remover o monstro "${(m.nome) || ''}" do mapa?`)) salvarMonstro({ id: tk.dataset.id, remover: true });
      });
    });
  }

  // Liga os controles da barra do Mestre.
  function ligarBarraMestre() {
    const add = document.getElementById('tabMonAdd');
    if (add) add.addEventListener('click', () => {
      const sel = document.getElementById('tabMonSel');
      if (!sel || !sel.value) return;
      const op = sel.options[sel.selectedIndex];
      salvarMonstro({ nome: sel.value, categoria: op ? op.dataset.cat : '' });
    });
    const trv = document.getElementById('tabTravar');
    if (trv) trv.addEventListener('click', () => {
      fetch('/api/tabuleiro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travado: !tab.travado }),
      }).then(r => r.json()).then(d => { if (d && d.ok && d.tabuleiro) { aplicar(d.tabuleiro); render(); } else refresh(); }).catch(() => {});
    });
    const menos = document.getElementById('tabSelMenos');
    if (menos) menos.addEventListener('click', () => passoTam(-1));
    const mais = document.getElementById('tabSelMais');
    if (mais) mais.addEventListener('click', () => passoTam(1));
    const rem = document.getElementById('tabSelRem');
    if (rem) rem.addEventListener('click', () => {
      if (selecionado && selecionado.kind === 'monstro') { salvarMonstro({ id: selecionado.id, remover: true }); selecionado = null; }
    });
  }

  // Move/redimensiona o token de um PJ. O servidor revalida posse e trava.
  function salvarToken(payload) {
    if (payload.x != null) payload.x = round2(payload.x);
    if (payload.y != null) payload.y = round2(payload.y);
    return fetch('/api/tabuleiro/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()).then(d => {
      if (d && d.ok && d.tabuleiro) { aplicar(d.tabuleiro); render(); } else refresh();
    }).catch(() => {});
  }

  // Adiciona/move/redimensiona/remove um monstro (só o Mestre; servidor revalida).
  function salvarMonstro(payload) {
    if (payload.x != null) payload.x = round2(payload.x);
    if (payload.y != null) payload.y = round2(payload.y);
    return fetch('/api/tabuleiro/monstro', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()).then(d => {
      if (d && d.ok && d.tabuleiro) { aplicar(d.tabuleiro); render(); } else refresh();
    }).catch(() => {});
  }

  function sync(novo) { if (novo) aplicar(novo); render(); }

  function refresh() {
    return fetch('/api/tabuleiro').then(r => r.json()).then(t => { aplicar(t); render(); }).catch(() => {});
  }

  function init(opts) {
    opts = opts || {};
    cont = document.getElementById(opts.containerId);
    if (!cont) return; // página sem o container do tabuleiro
    ehMestre = !!opts.ehMestre;
    meuUid = opts.meuUid || null;
    if (typeof opts.getFichas === 'function') getFichas = opts.getFichas;
    refresh();
    // Poll de fallback só quando NÃO há tempo real (local/LAN). Em produção o
    // Firestore entrega na hora e este poll nem liga.
    const temRT = !!(window.RT && window.RT.ativo && window.RT.ativo());
    if (!temRT) {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(() => { if (!arrastando) refresh(); }, 3000);
    }
  }

  window.Tabuleiro = { init, sync, refresh, render };
})();
