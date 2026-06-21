// =====================================================
// ACESSIBILIDADE (Fase 5.1) — compartilhado por Mestre e Jogador
// Tamanho de fonte (zoom), alto contraste, navegação por teclado e ARIA.
// As preferências ficam no localStorage do dispositivo.
// =====================================================
(function () {
  const ZOOMS = [0.9, 1, 1.15, 1.3, 1.5];
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  let zoomIdx = Math.max(0, ZOOMS.indexOf(parseFloat(get('a11y_zoom', '1'))));
  if (zoomIdx < 0) zoomIdx = 1;
  let contraste = get('a11y_contraste', '0') === '1';

  function aplicar() {
    document.body.style.zoom = ZOOMS[zoomIdx];
    document.body.classList.toggle('alto-contraste', contraste);
    const bc = document.getElementById('a11yContraste');
    if (bc) bc.setAttribute('aria-pressed', contraste ? 'true' : 'false');
    const pz = document.getElementById('a11yZoomPct');
    if (pz) pz.textContent = Math.round(ZOOMS[zoomIdx] * 100) + '%';
  }

  function montarWidget() {
    const btn = document.createElement('button');
    btn.className = 'a11y-btn';
    btn.id = 'a11yBtn';
    btn.setAttribute('aria-label', 'Acessibilidade');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '♿';

    const painel = document.createElement('div');
    painel.className = 'a11y-painel';
    painel.id = 'a11yPainel';
    painel.setAttribute('role', 'dialog');
    painel.setAttribute('aria-label', 'Opções de acessibilidade');
    painel.hidden = true;
    painel.innerHTML = `
      <h4>♿ Acessibilidade</h4>
      <div class="a11y-linha">
        <span>Tamanho do texto</span>
        <span class="a11y-botoes">
          <button class="a11y-op" id="a11yMenos" aria-label="Diminuir tamanho">A−</button>
          <span id="a11yZoomPct" aria-live="polite">100%</span>
          <button class="a11y-op" id="a11yMais" aria-label="Aumentar tamanho">A+</button>
        </span>
      </div>
      <div class="a11y-linha">
        <span>Alto contraste</span>
        <button class="a11y-op" id="a11yContraste" aria-pressed="false">Ativar</button>
      </div>
      <div class="a11y-linha"><button class="a11y-op" id="a11yReset" style="width:100%">Restaurar padrão</button></div>`;

    document.body.appendChild(btn);
    document.body.appendChild(painel);

    const toggle = (mostrar) => {
      const abrir = mostrar == null ? painel.hidden : mostrar;
      painel.hidden = !abrir;
      btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    };
    btn.addEventListener('click', () => toggle());
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !painel.hidden) toggle(false); });
    document.addEventListener('click', e => { if (!painel.hidden && !painel.contains(e.target) && e.target !== btn) toggle(false); });

    document.getElementById('a11yMais').addEventListener('click', () => { zoomIdx = Math.min(ZOOMS.length - 1, zoomIdx + 1); set('a11y_zoom', ZOOMS[zoomIdx]); aplicar(); });
    document.getElementById('a11yMenos').addEventListener('click', () => { zoomIdx = Math.max(0, zoomIdx - 1); set('a11y_zoom', ZOOMS[zoomIdx]); aplicar(); });
    document.getElementById('a11yContraste').addEventListener('click', () => { contraste = !contraste; set('a11y_contraste', contraste ? '1' : '0'); aplicar(); });
    document.getElementById('a11yReset').addEventListener('click', () => { zoomIdx = 1; contraste = false; set('a11y_zoom', '1'); set('a11y_contraste', '0'); aplicar(); });
  }

  // Melhora ARIA + navegação por teclado das abas (role=tablist/tab, setas)
  function aprimorarAbas() {
    const nav = document.querySelector('nav.tabs');
    if (!nav) return;
    nav.setAttribute('role', 'tablist');
    const btns = [...nav.querySelectorAll('.tab-btn')];
    btns.forEach(b => {
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', b.classList.contains('active') ? 'true' : 'false');
      b.addEventListener('click', () => btns.forEach(x => x.setAttribute('aria-selected', x.classList.contains('active') ? 'true' : 'false')));
    });
    nav.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const j = e.key === 'ArrowRight' ? (i + 1) % btns.length : (i - 1 + btns.length) % btns.length;
      btns[j].focus();
      e.preventDefault();
    });
  }

  function init() {
    montarWidget();
    aprimorarAbas();
    aplicar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
