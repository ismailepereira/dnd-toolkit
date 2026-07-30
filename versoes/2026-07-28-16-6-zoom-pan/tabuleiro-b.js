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
  // 16.6: zoom/pan POR-VIEWER (não sincroniza — cada um enquadra o próprio mapa).
  // Aplicado como transform em #tabMapa; o arrasto de token lê o rect de #tabMapa,
  // que já reflete a transformação, então as posições em % continuam corretas.
  let zoom = 1, panX = 0, panY = 0;
  let modoNevoa = false; // 21.3: quando ligado, o Mestre desenha névoa arrastando no fundo
  const ZOOM_MIN = 1, ZOOM_MAX = 5;
  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const round2 = n => Math.round(n * 100) / 100;

  // Ícone por categoria de monstro (fallback quando não há imagem).
  const CATEGORIA_ICONE = {
    'Aberração': '👁️', 'Animal': '🐺', 'Constructo': '🗿', 'Corruptor': '😈',
    'Culto do Dragão': '🐲', 'Dragão': '🐉', 'Elemental': '🔥', 'Fey': '🧚',
    'Gigante': '🗿', 'Goblinoide': '👺', 'Humanoide': '🧑', 'Limo': '🫧',
    'Monstruosidade': '🦎', 'Morto-vivo': '💀', 'Planta': '🌿',
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
      nevoa: (novo && Array.isArray(novo.nevoa)) ? novo.nevoa : [],
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
      nv: tab.nevoa, mn: modoNevoa,
      f: fichas.map(f => [f.id, f.nome, f.classe, f.miniaturaUrl || '', podeMover(f), f.hpAtual, f.hpMax, f.status || '']),
    });
    if (chave === ultimaChave && document.getElementById('tabBoard')) return;
    ultimaChave = chave;
    const safeImg = String(tab.imagemUrl).replace(/"/g, '&quot;');
    cont.innerHTML =
      barraMestreHtml() +
      (!ehMestre && tab.travado ? '<div class="tab-aviso">🔒 O Mestre travou o movimento dos tokens.</div>' : '') +
      '<div class="tab-board" id="tabBoard">' +
        '<div class="tab-mapa" id="tabMapa">' +
        `<img class="tab-img" src="${safeImg}" alt="mapa" draggable="false">` +
        fichas.map((f, i) => {
          const p = posDe(f.id, i);
          const mine = podeMover(f);
          const sel = selecionado && selecionado.kind === 'pj' && selecionado.id === f.id;
          // 21.2: condição visual de PV (🩸 ferido / 💀 caído) — deriva da ficha,
          // que já sincroniza; sem sync novo. Prioridade em estadoTokenPv5e.
          const cond = (typeof estadoTokenPv5e === 'function')
            ? estadoTokenPv5e(f.hpAtual, f.hpMax, f.status) : { classe: '', badge: '', rotulo: '' };
          const condCls = cond.classe ? ' cond-' + cond.classe : '';
          const tit = f.nome || 'PJ';
          return `<div class="tab-token${mine ? ' movivel' : ''}${sel ? ' selecionado' : ''}${condCls}" data-kind="pj" data-id="${esc(f.id)}" ` +
            `style="left:${p.x}%;top:${p.y}%;transform:translate(-50%,-50%) scale(${tamDe('pj', f.id)})" title="${esc(tit)}${cond.rotulo ? ' — ' + esc(cond.rotulo) : ''}">` +
            (typeof miniaturaFichaHtml === 'function' ? miniaturaFichaHtml(f, 44) : '') +
            (cond.badge ? `<span class="tab-token-cond" aria-label="${esc(cond.rotulo)}" title="${esc(cond.rotulo)}">${cond.badge}</span>` : '') +
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
        // 21.3: névoa de guerra — retângulos que escondem o mapa. Dentro de
        // #tabMapa, então acompanham zoom/pan. Mestre: semitransparente + ✕ p/
        // revelar. Jogador: opaca (esconde de verdade).
        (tab.nevoa || []).map(n => {
          if (!n || typeof n.x !== 'number') return '';
          return `<div class="tab-nevoa${ehMestre ? ' mestre' : ''}" data-nevoa="${esc(n.id)}" ` +
            `style="left:${n.x}%;top:${n.y}%;width:${n.w}%;height:${n.h}%">` +
            (ehMestre ? '<button type="button" class="tab-nevoa-x" title="Revelar (remover névoa)" aria-label="Revelar">✕</button>' : '') +
          '</div>';
        }).join('') +
        '</div>' + /* /tab-mapa */
        '<button type="button" class="tab-full-btn" id="tabFull" title="Tela cheia (mapa na mesa)" aria-label="Tela cheia">⛶</button>' +
        '<div class="tab-zoom">' +
          '<button type="button" class="tab-zbtn" id="tabCentrar" title="Centralizar no meu token" aria-label="Centralizar no token">🎯</button>' +
          '<button type="button" class="tab-zbtn" id="tabZmOut" title="Diminuir zoom" aria-label="Diminuir zoom">−</button>' +
          '<button type="button" class="tab-zbtn tab-zlbl" id="tabZmFit" title="Ajustar (100%)" aria-label="Ajustar">100%</button>' +
          '<button type="button" class="tab-zbtn" id="tabZmIn" title="Aumentar zoom" aria-label="Aumentar zoom">+</button>' +
        '</div>' +
      '</div>';
    ligarArrasto();
    ligarBarraMestre();
    aplicarTransform();
    ligarZoomPan();
  }

  // ---------- 16.6: zoom & pan (transform em #tabMapa) ----------
  function aplicarTransform() {
    const mapa = document.getElementById('tabMapa');
    if (mapa) mapa.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
    const lbl = document.getElementById('tabZmFit');
    if (lbl) lbl.textContent = Math.round(zoom * 100) + '%';
  }
  function clampPan() {
    const board = document.getElementById('tabBoard');
    if (!board) return;
    const r = board.getBoundingClientRect();
    // com transform-origin 0 0: pan fica entre (board - board*zoom) e 0 → sem
    // buracos pretos e sem pan quando zoom = 1 (aí o limite é 0..0).
    panX = Math.max(Math.min(0, r.width - r.width * zoom), Math.min(0, panX));
    panY = Math.max(Math.min(0, r.height - r.height * zoom), Math.min(0, panY));
  }
  // Ajusta o zoom mantendo fixo o ponto (cx,cy) em px relativos ao board.
  function setZoom(nz, cx, cy) {
    const board = document.getElementById('tabBoard');
    if (!board) return;
    nz = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, nz));
    const r = board.getBoundingClientRect();
    if (cx == null) cx = r.width / 2;
    if (cy == null) cy = r.height / 2;
    const k = nz / zoom;
    panX = cx - (cx - panX) * k;
    panY = cy - (cy - panY) * k;
    zoom = nz;
    clampPan();
    aplicarTransform();
  }
  // 16.6b: qual token centralizar — Mestre com seleção usa o selecionado;
  // senão (jogador, ou Mestre sem seleção) usa o 1º PJ que a pessoa controla.
  function tokenParaCentralizar() {
    if (ehMestre && selecionado) {
      if (selecionado.kind === 'monstro') { const m = tab.monstros[selecionado.id]; return m ? { x: m.x, y: m.y } : null; }
      const idx = fichasNoTabuleiro().findIndex(f => f.id === selecionado.id);
      return posDe(selecionado.id, idx < 0 ? 0 : idx);
    }
    const meus = fichasNoTabuleiro().filter(f => podeMover(f));
    const f = meus[0]; if (!f) return null;
    return posDe(f.id, fichasNoTabuleiro().findIndex(x => x.id === f.id));
  }
  function centralizar() {
    const t = tokenParaCentralizar();
    const board = document.getElementById('tabBoard');
    if (!t || !board) return;
    if (zoom < 1.2) zoom = 2; // sem zoom, centralizar não faz sentido — dá um zoom
    const r = board.getBoundingClientRect();
    panX = r.width / 2 - (t.x / 100) * r.width * zoom;
    panY = r.height / 2 - (t.y / 100) * r.height * zoom;
    clampPan();
    aplicarTransform();
  }
  function ligarZoomPan() {
    const board = document.getElementById('tabBoard');
    if (!board) return;
    const btn = id => document.getElementById(id);
    if (btn('tabZmIn')) btn('tabZmIn').onclick = () => setZoom(zoom * 1.3);
    if (btn('tabZmOut')) btn('tabZmOut').onclick = () => setZoom(zoom / 1.3);
    if (btn('tabZmFit')) btn('tabZmFit').onclick = () => { zoom = 1; panX = 0; panY = 0; aplicarTransform(); };
    if (btn('tabCentrar')) btn('tabCentrar').onclick = centralizar;
    board.addEventListener('wheel', e => {
      e.preventDefault();
      const r = board.getBoundingClientRect();
      setZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });
    // pan (1 dedo/mouse no FUNDO do mapa) + pinça (2 dedos). Tokens tratam o
    // próprio arrasto — ignoramos pointerdown que começou num token/botão.
    const pts = new Map();
    let pinch = 0, panIni = null;
    // 21.3: no modo névoa, arrastar no fundo DESENHA um retângulo (não faz pan).
    let nevoaDraw = null;
    board.addEventListener('pointerdown', e => {
      if (e.target.closest('.tab-token') || e.target.closest('button')) return;
      if (ehMestre && modoNevoa && e.isPrimary) {
        const mapa = document.getElementById('tabMapa');
        if (mapa) {
          e.preventDefault();
          const rect = mapa.getBoundingClientRect();
          const el = document.createElement('div');
          el.className = 'tab-nevoa mestre desenhando';
          mapa.appendChild(el);
          nevoaDraw = { rect, x0: e.clientX, y0: e.clientY, el };
          try { board.setPointerCapture(e.pointerId); } catch (_) {}
          return;
        }
      }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { panIni = { x: e.clientX, y: e.clientY, panX: panX, panY: panY }; board.classList.add('tab-pan'); }
      else if (pts.size === 2) { const a = [...pts.values()]; pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
      try { board.setPointerCapture(e.pointerId); } catch (_) {}
    });
    // % (top-left + tamanho) do retângulo em desenho, no espaço do #tabMapa.
    function nevoaRetPct(d, ev) {
      const r = d.rect;
      const ax = ((d.x0 - r.left) / r.width) * 100, ay = ((d.y0 - r.top) / r.height) * 100;
      const bx = ((ev.clientX - r.left) / r.width) * 100, by = ((ev.clientY - r.top) / r.height) * 100;
      const x = Math.max(0, Math.min(ax, bx)), y = Math.max(0, Math.min(ay, by));
      const w = Math.min(100 - x, Math.abs(bx - ax)), h = Math.min(100 - y, Math.abs(by - ay));
      return { x: round2(x), y: round2(y), w: round2(w), h: round2(h) };
    }
    board.addEventListener('pointermove', e => {
      if (nevoaDraw) {
        const p = nevoaRetPct(nevoaDraw, e);
        const s = nevoaDraw.el.style;
        s.left = p.x + '%'; s.top = p.y + '%'; s.width = p.w + '%'; s.height = p.h + '%';
        nevoaDraw.pct = p;
        return;
      }
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const a = [...pts.values()];
      if (pts.size >= 2) {
        const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (pinch > 0) {
          const r = board.getBoundingClientRect();
          setZoom(zoom * (d / pinch), (a[0].x + a[1].x) / 2 - r.left, (a[0].y + a[1].y) / 2 - r.top);
        }
        pinch = d;
      } else if (panIni && zoom > 1) {
        panX = panIni.panX + (e.clientX - panIni.x);
        panY = panIni.panY + (e.clientY - panIni.y);
        clampPan(); aplicarTransform();
      }
    });
    function fim(e) {
      if (nevoaDraw) {
        const p = nevoaDraw.pct;
        try { nevoaDraw.el.remove(); } catch (_) {}
        nevoaDraw = null;
        if (p && p.w >= 2 && p.h >= 2) salvarNevoa(p); // ignora toques minúsculos
        else render();
        return;
      }
      pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; if (pts.size === 0) { panIni = null; board.classList.remove('tab-pan'); }
    }
    board.addEventListener('pointerup', fim);
    board.addEventListener('pointercancel', fim);
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
      `<button type="button" class="btn-mini${modoNevoa ? ' on' : ''}" id="tabNevoa" title="Desenhe retângulos no mapa para esconder áreas dos jogadores">${modoNevoa ? '🌫️ Desenhando névoa…' : '🌫️ Névoa'}</button>` +
      ((tab.nevoa || []).length ? '<button type="button" class="btn-mini" id="tabNevoaLimpar" title="Revelar tudo (remover toda a névoa)">🧹 Revelar tudo</button>' : '') +
      selecionadoHtml() +
      `<span class="criador-hint-inline">${modoNevoa ? 'Arraste no mapa para cobrir uma área; ✕ numa névoa revela.' : 'Toque/clique num token seleciona; arraste para mover; duplo-clique num monstro remove.'}</span>` +
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
        // 16.6: o rect é o do #tabMapa (que carrega o zoom/pan), não o do board —
        // assim (x-left)/width dá o % certo mesmo com zoom aplicado.
        const rect = (document.getElementById('tabMapa') || board).getBoundingClientRect();
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
    // 21.3: névoa — alternar modo de desenho, limpar tudo, e ✕ para revelar.
    const nev = document.getElementById('tabNevoa');
    if (nev) nev.addEventListener('click', () => { modoNevoa = !modoNevoa; render(); });
    const nevLimpar = document.getElementById('tabNevoaLimpar');
    if (nevLimpar) nevLimpar.addEventListener('click', () => salvarNevoa({ limpar: true }));
    document.querySelectorAll('.tab-nevoa-x').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const el = b.closest('.tab-nevoa');
      if (el) salvarNevoa({ id: el.dataset.nevoa, remover: true });
    }));
  }

  // Adiciona/remove/limpa a névoa (só o Mestre; servidor revalida).
  function salvarNevoa(payload) {
    return fetch('/api/tabuleiro/nevoa', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json()).then(d => {
      if (d && d.ok && d.tabuleiro) { aplicar(d.tabuleiro); render(); } else refresh();
    }).catch(() => {});
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
