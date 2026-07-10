// =====================================================================
// Fase 16.3 — Tabuleiro-imagem AO VIVO (render + tokens de PJ arrastáveis)
// ---------------------------------------------------------------------
// window.Tabuleiro — usado no Mestre (app.js) e no Jogador (jogador.js).
//   • Desenha a imagem do mapa (tabuleiro.imagemUrl, por URL — NÃO depende do
//     Firebase Storage) e um TOKEN por ficha de PJ, posicionado em % da imagem
//     (tabuleiro.tokens[fichaId] = {x, y}).
//   • Arrastar: o Mestre move qualquer token; o jogador só o(s) da SUA ficha
//     (donoUid). No fim do arrasto, POST /api/tabuleiro/token grava a posição
//     (o servidor revalida a posse) → o tempo real (Firestore) leva aos demais.
//     Sem tempo real (modo local/LAN), um poll leve mantém o board atualizado.
//   • Token = miniaturaFichaHtml (símbolo da classe como fallback) + nome.
//   Monstros no tabuleiro = Fase 16.4.
// =====================================================================
(function () {
  if (typeof document === 'undefined') return; // ambiente sem DOM

  let cont = null;              // container onde o board é desenhado
  let ehMestre = false;
  let meuUid = null;
  let getFichas = () => [];     // a página fornece a lista atual de fichas
  let tab = { aberto: false, imagemUrl: null, tokens: {}, monstros: {} };
  let arrastando = null;        // id do token em arrasto (suspende o re-render)
  let pollTimer = null;
  let ultimaChave = '';         // assinatura do último render (evita reconstruir sem mudança)

  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round2 = n => Math.round(n * 100) / 100;

  // Fase 16.4: ícone por categoria de monstro (fallback quando não há imagem).
  const CATEGORIA_ICONE = {
    'Aberração': '👁️', 'Animal': '🐺', 'Constructo': '🗿', 'Corruptor': '😈',
    'Culto do Dragão': '🐲', 'Dragão': '🐉', 'Elemental': '🔥', 'Fey': '🧚',
    'Gigante': '🗿', 'Goblinoide': '👺', 'Humanoide': '🧑', 'Limo': '🫧',
    'Monstruosidade': '🦎', 'Morto-vivo': '💀',
  };
  const iconeCategoria = c => CATEGORIA_ICONE[c] || '👹';

  function podeMover(f) {
    if (ehMestre) return true;
    const dono = f && f.donoUid;
    return !dono || !meuUid || dono === meuUid; // ficha legada sem dono: liberada
  }

  function posDe(fid, idx) {
    const p = tab.tokens && tab.tokens[fid];
    if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
    return { x: 8 + (idx * 11) % 84, y: 86 }; // padrão: PJs na faixa de baixo
  }

  // PJs elegíveis a token: fichas vivas (ou sem status).
  function fichasNoTabuleiro() {
    return (getFichas() || []).filter(f => f && f.id && (f.status ? f.status !== 'morto' : true));
  }

  // Fase 16.4: monstros colocados no tabuleiro ([id, dados]); default no topo.
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
    };
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
    const fichas = fichasNoTabuleiro();
    const monstros = monstrosNoTabuleiro();
    // Só reconstrói o DOM se algo relevante mudou — evita flicker e não destaca
    // tokens durante interação (o poll de fallback ocioso vira no-op).
    const chave = JSON.stringify({
      i: tab.imagemUrl, t: tab.tokens, m: tab.monstros,
      f: fichas.map(f => [f.id, f.nome, f.classe, f.miniaturaUrl || '', podeMover(f)]),
    });
    if (chave === ultimaChave && document.getElementById('tabBoard')) return;
    ultimaChave = chave;
    const safeImg = String(tab.imagemUrl).replace(/"/g, '&quot;');
    cont.innerHTML =
      barraMestreHtml() +
      '<div class="tab-board" id="tabBoard">' +
        `<img class="tab-img" src="${safeImg}" alt="mapa" draggable="false">` +
        fichas.map((f, i) => {
          const p = posDe(f.id, i);
          const mine = podeMover(f);
          return `<div class="tab-token${mine ? ' movivel' : ''}" data-kind="pj" data-id="${esc(f.id)}" ` +
            `style="left:${p.x}%;top:${p.y}%" title="${esc(f.nome || 'PJ')}">` +
            (typeof miniaturaFichaHtml === 'function' ? miniaturaFichaHtml(f, 44) : '') +
            `<span class="tab-token-nome">${esc(f.nome || 'PJ')}</span>` +
          '</div>';
        }).join('') +
        monstros.map(m => {
          const corpo = m.imagemUrl
            ? `<img class="tab-mon-img" src="${String(m.imagemUrl).replace(/"/g, '&quot;')}" alt="">`
            : `<span class="tab-mon-ic">${iconeCategoria(m.categoria)}</span>`;
          return `<div class="tab-token tab-token-monstro${ehMestre ? ' movivel' : ''}" data-kind="monstro" data-id="${esc(m.id)}" ` +
            `style="left:${m.x}%;top:${m.y}%" title="${esc(m.nome)}${ehMestre ? ' — duplo-clique remove' : ''}">` +
            corpo +
            `<span class="tab-token-nome">${esc(m.nome)}</span>` +
          '</div>';
        }).join('') +
      '</div>';
    ligarArrasto();
    ligarBarraMestre();
  }

  // Barra do Mestre: adicionar um monstro do bestiário ao tabuleiro.
  function barraMestreHtml() {
    if (!ehMestre) return '';
    const lista = (typeof MONSTROS !== 'undefined') ? MONSTROS : [];
    if (!lista.length) return '';
    const ops = lista.map(m => `<option value="${esc(m.nome)}" data-cat="${esc(m.categoria || '')}">${esc(m.nome)}</option>`).join('');
    return '<div class="tab-mestre-barra">' +
      '<label>🐉 Monstro no mapa <select id="tabMonSel">' + ops + '</select></label>' +
      '<button type="button" class="btn-secondary btn-mini" id="tabMonAdd">➕ Colocar</button>' +
      '<span class="criador-hint-inline">Arraste os tokens; duplo-clique num monstro remove.</span>' +
    '</div>';
  }

  function ligarArrasto() {
    const board = document.getElementById('tabBoard');
    if (!board) return;
    board.querySelectorAll('.tab-token.movivel').forEach(tk => {
      tk.addEventListener('mousedown', e => {
        e.preventDefault();
        arrastando = tk.dataset.id;
        tk.classList.add('arrastando');
        const rect = board.getBoundingClientRect();
        function mv(ev) {
          let x = ((ev.clientX - rect.left) / rect.width) * 100;
          let y = ((ev.clientY - rect.top) / rect.height) * 100;
          x = Math.max(0, Math.min(100, x)); y = Math.max(0, Math.min(100, y));
          tk.style.left = x + '%'; tk.style.top = y + '%';
          tk._x = x; tk._y = y;
        }
        function up() {
          window.removeEventListener('mousemove', mv);
          window.removeEventListener('mouseup', up);
          tk.classList.remove('arrastando');
          const id = arrastando, kind = tk.dataset.kind; arrastando = null;
          if (typeof tk._x === 'number') {
            if (kind === 'monstro') {
              (tab.monstros[id] = tab.monstros[id] || {}).x = round2(tk._x);
              tab.monstros[id].y = round2(tk._y);
              salvarMonstro({ id: id, x: tk._x, y: tk._y });
            } else {
              (tab.tokens = tab.tokens || {})[id] = { x: round2(tk._x), y: round2(tk._y) }; // otimista
              salvarToken(id, tk._x, tk._y);
            }
          }
        }
        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup', up);
      });
    });
    // Mestre remove um monstro com duplo-clique no token.
    if (ehMestre) board.querySelectorAll('.tab-token-monstro').forEach(tk => {
      tk.addEventListener('dblclick', () => {
        const m = tab.monstros[tk.dataset.id];
        if (m && confirm(`Remover o monstro "${(m.nome) || ''}" do mapa?`)) salvarMonstro({ id: tk.dataset.id, remover: true });
      });
    });
  }

  // Barra do Mestre: liga o botão "Colocar" (adiciona o monstro selecionado).
  function ligarBarraMestre() {
    const btn = document.getElementById('tabMonAdd');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const sel = document.getElementById('tabMonSel');
      if (!sel || !sel.value) return;
      const op = sel.options[sel.selectedIndex];
      salvarMonstro({ nome: sel.value, categoria: op ? op.dataset.cat : '' });
    });
  }

  function salvarToken(fid, x, y) {
    fetch('/api/tabuleiro/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fid, x: round2(x), y: round2(y) }),
    }).then(r => r.json()).then(d => { if (!d || !d.ok) refresh(); }) // rejeitado → volta ao servidor
      .catch(() => {});
  }

  // Adiciona/move/remove um monstro (só o Mestre; o servidor revalida o papel).
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
