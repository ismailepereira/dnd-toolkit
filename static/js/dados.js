// =====================================================================
// 20.6 — Rolador de Dados (Dice Roller) flutuante, em qualquer tela.
// Botão 🎲 na zona do polegar → painel com dados-gema (d4–d20 + d100),
// quantidade, modificador e vantagem/desvantagem. Módulo autossuficiente:
// injeta o próprio HTML/estado, sem depender do resto da página. A rolagem
// usa a regra pura rolarDadosGrupo() (regras-ficha.js), testada.
// =====================================================================
(function () {
  if (window.__dadosMontado) return;
  window.__dadosMontado = true;

  const FACES = [4, 6, 8, 10, 12, 20, 100];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let sel = 20, qtd = 1, mod = 0, modo = 'normal';
  const hist = [];

  function montar() {
    if (document.getElementById('drFab')) return;
    const fab = document.createElement('button');
    fab.id = 'drFab';
    fab.className = 'dr-fab';
    fab.type = 'button';
    fab.title = 'Rolador de Dados';
    fab.setAttribute('aria-label', 'Abrir o rolador de dados');
    fab.textContent = '🎲';
    document.body.appendChild(fab);

    const painel = document.createElement('div');
    painel.id = 'drPainel';
    painel.className = 'dr-painel oculto';
    document.body.appendChild(painel);

    fab.addEventListener('click', () => { painel.classList.toggle('oculto'); if (!painel.classList.contains('oculto')) render(); });
    painel.addEventListener('click', e => { if (e.target === painel) painel.classList.add('oculto'); });
    render();
  }

  function render() {
    const painel = document.getElementById('drPainel');
    if (!painel) return;
    const gemas = FACES.map(f =>
      `<button type="button" class="dr-gema dr-d${f} ${sel === f ? 'sel' : ''}" data-faces="${f}"><span>d${f}</span></button>`).join('');
    const ultimo = hist[0];
    painel.innerHTML = `
      <div class="dr-caixa" role="dialog" aria-label="Rolador de Dados">
        <div class="dr-topo"><b>🎲 Rolador de Dados</b><button type="button" class="dr-fechar" title="Fechar">✕</button></div>
        <div class="dr-gemas">${gemas}</div>
        <div class="dr-controles">
          <div class="dr-qtd"><button type="button" class="dr-menos" title="Menos">−</button><span><b id="drQtd">${qtd}</b>× d${sel}</span><button type="button" class="dr-mais" title="Mais">+</button></div>
          <label class="dr-mod">mod <input type="number" id="drMod" value="${mod}" step="1" style="width:56px"></label>
          <div class="dr-modo">
            <button type="button" class="dr-modo-btn ${modo === 'desvantagem' ? 'on' : ''}" data-modo="desvantagem" title="Desvantagem (2d20, pega o menor)">▼</button>
            <button type="button" class="dr-modo-btn ${modo === 'normal' ? 'on' : ''}" data-modo="normal">Normal</button>
            <button type="button" class="dr-modo-btn ${modo === 'vantagem' ? 'on' : ''}" data-modo="vantagem" title="Vantagem (2d20, pega o maior)">▲</button>
          </div>
        </div>
        <button type="button" class="dr-rolar" id="drRolar">🎲 Rolar ${qtd}d${sel}${mod ? (mod > 0 ? ' +' + mod : ' ' + mod) : ''}</button>
        <div class="dr-resultado ${ultimo ? (ultimo.natural || '') : ''}" id="drResultado">
          ${ultimo ? `<div class="dr-total">${ultimo.total}</div><div class="dr-detalhe">${esc(ultimo.rotulo)} — ${esc(ultimo.txt)}${ultimo.natural === 'critico' ? ' · 20 NATURAL!' : ultimo.natural === 'falha' ? ' · 1 natural' : ''}</div>` : '<div class="dr-vazio">escolha os dados e role 🎲</div>'}
        </div>
        ${hist.length > 1 ? `<div class="dr-hist"><h5>Rolagens</h5>${hist.slice(1, 8).map(h => `<div class="dr-hist-linha"><b>${h.total}</b> <small>${esc(h.rotulo)} · ${esc(h.txt)}</small></div>`).join('')}</div>` : ''}
      </div>`;
    wire();
  }

  function wire() {
    const $ = s => document.querySelector(s);
    document.querySelectorAll('.dr-gema').forEach(b => b.onclick = () => { sel = +b.dataset.faces; render(); });
    document.querySelectorAll('.dr-modo-btn').forEach(b => b.onclick = () => { modo = b.dataset.modo; render(); });
    const painel = document.getElementById('drPainel');
    const fechar = $('.dr-fechar'); if (fechar) fechar.onclick = () => painel.classList.add('oculto');
    const menos = $('.dr-menos'); if (menos) menos.onclick = () => { qtd = Math.max(1, qtd - 1); render(); };
    const mais = $('.dr-mais'); if (mais) mais.onclick = () => { qtd = Math.min(20, qtd + 1); render(); };
    const modI = $('#drMod'); if (modI) modI.onchange = () => { mod = parseInt(modI.value, 10) || 0; render(); };
    const rolar = $('#drRolar'); if (rolar) rolar.onclick = rolarAgora;
  }

  function rolarAgora() {
    if (typeof rolarDadosGrupo !== 'function') return;
    const r = rolarDadosGrupo(qtd, sel, mod, sel === 20 ? modo : 'normal');
    r.rotulo = `${qtd}d${sel}${mod ? (mod > 0 ? '+' + mod : mod) : ''}${sel === 20 && modo !== 'normal' ? ' (' + modo + ')' : ''}`;
    hist.unshift(r);
    if (hist.length > 12) hist.length = 12;
    render();
    const res = document.getElementById('drResultado');
    if (res) { res.classList.remove('dr-pulse'); void res.offsetWidth; res.classList.add('dr-pulse'); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
})();
