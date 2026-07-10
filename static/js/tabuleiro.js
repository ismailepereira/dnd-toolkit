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
  let tab = { aberto: false, imagemUrl: null, tokens: {} };
  let arrastando = null;        // id do token em arrasto (suspende o re-render)
  let pollTimer = null;

  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round2 = n => Math.round(n * 100) / 100;

  function podeMover(f) {
    if (ehMestre) return true;
    const dono = f && f.donoUid;
    return !dono || !meuUid || dono === meuUid; // ficha legada sem dono: liberada
  }

  function posDe(fid, idx) {
    const p = tab.tokens && tab.tokens[fid];
    if (p && typeof p.x === 'number' && typeof p.y === 'number') return { x: p.x, y: p.y };
    return { x: 8 + (idx * 11) % 84, y: 86 }; // padrão: espalhados na faixa de baixo
  }

  // PJs elegíveis a token: fichas vivas (ou sem status). Monstros = 16.4.
  function fichasNoTabuleiro() {
    return (getFichas() || []).filter(f => f && f.id && (f.status ? f.status !== 'morto' : true));
  }

  function aplicar(novo) {
    tab = {
      aberto: !!(novo && novo.aberto),
      imagemUrl: (novo && novo.imagemUrl) || null,
      tokens: (novo && novo.tokens) || {},
    };
  }

  function render() {
    if (!cont || arrastando) return; // não reconstrói durante um arrasto local
    if (!tab.aberto || !tab.imagemUrl) {
      if (ehMestre) { cont.classList.add('hidden'); cont.innerHTML = ''; }
      else { cont.classList.remove('hidden'); cont.innerHTML = '<div class="tab-vazio">🗺️ O Mestre ainda não abriu nenhum mapa.</div>'; }
      return;
    }
    cont.classList.remove('hidden');
    const fichas = fichasNoTabuleiro();
    const safeImg = String(tab.imagemUrl).replace(/"/g, '&quot;');
    cont.innerHTML =
      '<div class="tab-board" id="tabBoard">' +
        `<img class="tab-img" src="${safeImg}" alt="mapa" draggable="false">` +
        fichas.map((f, i) => {
          const p = posDe(f.id, i);
          const mine = podeMover(f);
          return `<div class="tab-token${mine ? ' movivel' : ''}" data-fid="${esc(f.id)}" ` +
            `style="left:${p.x}%;top:${p.y}%" title="${esc(f.nome || 'PJ')}">` +
            (typeof miniaturaFichaHtml === 'function' ? miniaturaFichaHtml(f, 44) : '') +
            `<span class="tab-token-nome">${esc(f.nome || 'PJ')}</span>` +
          '</div>';
        }).join('') +
      '</div>';
    ligarArrasto();
  }

  function ligarArrasto() {
    const board = document.getElementById('tabBoard');
    if (!board) return;
    board.querySelectorAll('.tab-token.movivel').forEach(tk => {
      tk.addEventListener('mousedown', e => {
        e.preventDefault();
        arrastando = tk.dataset.fid;
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
          const fid = arrastando; arrastando = null;
          if (typeof tk._x === 'number') {
            (tab.tokens = tab.tokens || {})[fid] = { x: round2(tk._x), y: round2(tk._y) }; // otimista
            salvarToken(fid, tk._x, tk._y);
          }
        }
        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup', up);
      });
    });
  }

  function salvarToken(fid, x, y) {
    fetch('/api/tabuleiro/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fid, x: round2(x), y: round2(y) }),
    }).then(r => r.json()).then(d => { if (!d || !d.ok) refresh(); }) // rejeitado → volta ao servidor
      .catch(() => {});
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
