// =====================================================================
// MAPA-UI.JS (Fase 14.2) — grid tático em SVG sobre o combate existente.
// ---------------------------------------------------------------------
// Desenha uma grelha lisa (sem imagem de fundo) com um token por combatente.
// Mestre: clica num token para o "pegar", clica numa célula para o mover
// (atualiza c.pos e persiste via onMudou). Mostra distância/alcance para o
// alvo selecionado usando Grid (grid.js). Sem mapa ativo, oferece o botão
// "Ativar mapa tático" (só Mestre). Jogadores veem em modo leitura.
//
// API: MapaCombate.render(container, combate, {
//   ehMestre, alvoId, onMudou(), onSelecionarAlvo(id)
// })
// =====================================================================
const MapaCombate = (function () {
  const SVGNS = 'http://www.w3.org/2000/svg';
  let pegouId = null;         // token "na mão" do Mestre à espera de célula-destino
  let modoObstaculo = false;  // Fase 14.4: clicar em células adiciona/remove obstáculo

  const LARGURA_PADRAO = 16, ALTURA_PADRAO = 12;

  function esc(s) {
    return s == null ? '' : String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function corDoTipo(c) {
    if (c.hpAtual === 0) return '#6e7681';           // caído
    if (c.tipo === 'pc') return '#3fb950';           // jogador
    if (c.tipo === 'aliado' || c.aliado) return '#58a6ff';
    return '#e94560';                                 // monstro/inimigo
  }

  function iniciais(nome) {
    const p = String(nome || '?').trim().split(/\s+/);
    return ((p[0] || '')[0] || '?').toUpperCase() + (p[1] ? (p[1][0] || '').toUpperCase() : '');
  }

  // Dá uma posição inicial a quem não tem: preenche em linhas, PJs à esquerda.
  function posicionarFaltantes(combate) {
    const m = combate.mapa;
    const ocupadas = new Set(combate.combatentes.filter(c => c.pos).map(c => c.pos.x + ',' + c.pos.y));
    let ix = 0, iy = 0;
    combate.combatentes.forEach(c => {
      if (c.pos) return;
      // procura a próxima célula livre
      while (ocupadas.has(ix + ',' + iy)) {
        ix++;
        if (ix >= m.larguraQuadros) { ix = 0; iy++; }
      }
      c.pos = { x: ix, y: iy };
      ocupadas.add(ix + ',' + iy);
    });
  }

  function ativarMapa(combate) {
    combate.mapa = combate.mapa || {
      id: 'mapa_' + Date.now(),
      larguraQuadros: LARGURA_PADRAO,
      alturaQuadros: ALTURA_PADRAO,
      obstaculos: [],
      areasDeEfeito: [],
    };
    posicionarFaltantes(combate);
  }

  function render(container, combate, opts) {
    opts = opts || {};
    const ehMestre = !!opts.ehMestre;
    if (!container) return;
    container.innerHTML = '';

    if (!combate || !combate.combatentes || !combate.combatentes.length) {
      container.style.display = 'none';
      return;
    }
    container.style.display = '';

    // Sem mapa: botão para ativar (só Mestre).
    if (!combate.mapa) {
      if (!ehMestre) { container.style.display = 'none'; return; }
      const btn = document.createElement('button');
      btn.className = 'btn-secondary';
      btn.textContent = '🗺️ Ativar mapa tático';
      btn.title = 'Dá posição real (x,y) aos combatentes e liga distância/adjacência automáticas';
      btn.onclick = () => { ativarMapa(combate); if (opts.onMudou) opts.onMudou(); render(container, combate, opts); };
      container.appendChild(btn);
      return;
    }

    const mapa = combate.mapa;
    const cols = mapa.larguraQuadros, rows = mapa.alturaQuadros;
    const CELL = 34; // px por quadrado
    const W = cols * CELL, H = rows * CELL;

    // ---- painel de topo: distância do turno atual -> alvo ----
    const idxAtual = combate.turno % combate.combatentes.length;
    const atual = combate.combatentes[idxAtual];
    const alvo = combate.combatentes.find(c => c.id === opts.alvoId);
    const topo = document.createElement('div');
    topo.className = 'mapa-topo';
    const obst = mapa.obstaculos || [];
    let infoTxt = '';
    if (atual && alvo && atual.id !== alvo.id && atual.pos && alvo.pos) {
      const dQ = Grid.distanciaQuadros(atual.pos, alvo.pos);
      const dM = Grid.distanciaMetros(atual.pos, alvo.pos);
      const adj = Grid.adjacentes(atual.pos, alvo.pos);
      const cob = Grid.nivelDeCobertura(atual.pos, alvo.pos, obst);
      const rotCob = { nenhuma: '', meia: ' · 🧱 meia cobertura (+2 CA)', tresQuartos: ' · 🧱 três-quartos (+5 CA)', total: ' · 🧱 <b style="color:#e94560">cobertura total (sem alvo direto)</b>' };
      infoTxt = `📏 ${esc(atual.nome)} → ${esc(alvo.nome)}: <b>${dQ}</b> quadrado(s) (${dM.toFixed(1)} m)` +
        (adj ? ' · <b style="color:#3fb950">adjacente</b>' : '') + (rotCob[cob.nivel] || '');
    } else {
      infoTxt = ehMestre
        ? (modoObstaculo
          ? '🧱 <b>Modo obstáculo:</b> clique nos quadrados para adicionar/remover paredes (dão cobertura e bloqueiam visão).'
          : 'Clique num token para pegá-lo e num quadrado para movê-lo. Selecione um alvo na lista para ver a distância e a cobertura.')
        : 'Mapa do combate (somente leitura).';
    }
    const botoesMestre = ehMestre
      ? ` <button type="button" class="btn-mini${modoObstaculo ? ' on' : ''}" id="mapaObstaculo" title="Adicionar/remover paredes que dão cobertura">🧱 Obstáculos${modoObstaculo ? ' (ligado)' : ''}</button>` +
        ` <button type="button" class="btn-mini" id="mapaDesativar" title="Volta ao combate só por lista">Desativar mapa</button>`
      : '';
    topo.innerHTML = infoTxt + botoesMestre;
    container.appendChild(topo);

    // ---- SVG ----
    const svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('class', 'mapa-svg');
    svg.style.maxWidth = W + 'px';

    // fundo + grelha
    const fundo = document.createElementNS(SVGNS, 'rect');
    fundo.setAttribute('x', 0); fundo.setAttribute('y', 0);
    fundo.setAttribute('width', W); fundo.setAttribute('height', H);
    fundo.setAttribute('class', 'mapa-fundo');
    svg.appendChild(fundo);

    for (let x = 0; x <= cols; x++) {
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('x1', x * CELL); l.setAttribute('y1', 0);
      l.setAttribute('x2', x * CELL); l.setAttribute('y2', H);
      l.setAttribute('class', 'mapa-linha'); svg.appendChild(l);
    }
    for (let y = 0; y <= rows; y++) {
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('x1', 0); l.setAttribute('y1', y * CELL);
      l.setAttribute('x2', W); l.setAttribute('y2', y * CELL);
      l.setAttribute('class', 'mapa-linha'); svg.appendChild(l);
    }

    // obstáculos (paredes) — quadrados escuros que dão cobertura/bloqueiam visão
    (mapa.obstaculos || []).forEach(o => {
      const r = document.createElementNS(SVGNS, 'rect');
      r.setAttribute('x', o.x * CELL); r.setAttribute('y', o.y * CELL);
      r.setAttribute('width', CELL); r.setAttribute('height', CELL);
      r.setAttribute('class', 'mapa-obstaculo' + (o.cobertura === 'total' ? ' total' : ''));
      const t = document.createElementNS(SVGNS, 'title');
      t.textContent = (o.cobertura === 'total' ? 'Parede (cobertura total)' : 'Obstáculo (meia cobertura)');
      r.appendChild(t);
      svg.appendChild(r);
    });

    // camada de células clicáveis — só Mestre. Em modo obstáculo: adiciona/remove
    // parede; senão, quando há token pego: move-o para a célula clicada.
    if (ehMestre && (modoObstaculo || pegouId)) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cel = document.createElementNS(SVGNS, 'rect');
          cel.setAttribute('x', x * CELL); cel.setAttribute('y', y * CELL);
          cel.setAttribute('width', CELL); cel.setAttribute('height', CELL);
          cel.setAttribute('class', modoObstaculo ? 'mapa-cel-obst' : 'mapa-cel-alvo');
          cel.dataset.cx = x; cel.dataset.cy = y;
          cel.addEventListener('click', () => {
            if (modoObstaculo) {
              mapa.obstaculos = mapa.obstaculos || [];
              const i = mapa.obstaculos.findIndex(o => o.x === x && o.y === y);
              if (i >= 0) mapa.obstaculos.splice(i, 1);
              else mapa.obstaculos.push({ x: x, y: y, bloqueiaVisao: true, cobertura: 'meia' });
            } else {
              const c = combate.combatentes.find(k => k.id === pegouId);
              if (c) { c.pos = { x: x, y: y }; pegouId = null; }
            }
            if (opts.onMudou) opts.onMudou();
            render(container, combate, opts);
          });
          svg.appendChild(cel);
        }
      }
    }

    // tokens
    combate.combatentes.forEach(c => {
      if (!c.pos) return;
      const cx = c.pos.x * CELL + CELL / 2, cy = c.pos.y * CELL + CELL / 2;
      const g = document.createElementNS(SVGNS, 'g');
      g.setAttribute('class', 'mapa-token' +
        (c.id === pegouId ? ' pego' : '') +
        (c.id === opts.alvoId ? ' alvo' : '') +
        (c.id === (atual && atual.id) ? ' turno' : ''));
      if (ehMestre) g.style.cursor = 'pointer';

      const circ = document.createElementNS(SVGNS, 'circle');
      circ.setAttribute('cx', cx); circ.setAttribute('cy', cy);
      circ.setAttribute('r', CELL * 0.4);
      circ.setAttribute('fill', corDoTipo(c));
      g.appendChild(circ);

      const txt = document.createElementNS(SVGNS, 'text');
      txt.setAttribute('x', cx); txt.setAttribute('y', cy);
      txt.setAttribute('class', 'mapa-token-txt');
      txt.textContent = iniciais(c.nome);
      g.appendChild(txt);

      const titulo = document.createElementNS(SVGNS, 'title');
      titulo.textContent = `${c.nome} — PV ${c.hpAtual}/${c.hpMax}`;
      g.appendChild(titulo);

      if (ehMestre) {
        g.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (modoObstaculo) return; // em modo obstáculo, o clique é para paredes
          pegouId = (pegouId === c.id) ? null : c.id; // clicar de novo solta
          render(container, combate, opts);
        });
      }
      svg.appendChild(g);
    });

    const wrap = document.createElement('div');
    wrap.className = 'mapa-svg-wrap';
    wrap.appendChild(svg);
    container.appendChild(wrap);

    if (ehMestre) {
      const bo = container.querySelector('#mapaObstaculo');
      if (bo) bo.onclick = () => { modoObstaculo = !modoObstaculo; pegouId = null; render(container, combate, opts); };
      const bd = container.querySelector('#mapaDesativar');
      if (bd) bd.onclick = () => {
        if (!confirm('Desativar o mapa tático? As posições e obstáculos são descartados; o combate volta a ser só por lista.')) return;
        combate.mapa = null;
        combate.combatentes.forEach(c => { delete c.pos; });
        pegouId = null; modoObstaculo = false;
        if (opts.onMudou) opts.onMudou();
        render(container, combate, opts);
      };
    }
  }

  return { render, ativarMapa, posicionarFaltantes };
})();

if (typeof window !== 'undefined') window.MapaCombate = MapaCombate;
if (typeof module !== 'undefined' && module.exports) module.exports = { MapaCombate };
