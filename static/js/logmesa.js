// Fase 21.1 — Log da Mesa compartilhado.
// Feed em tempo real que TODOS veem: entrar em combate, quedas, saque e
// subidas de nível. Os eventos são registados pelo SERVIDOR (app.py,
// _registrar_evento) e fluem pela projeção pública (estado.eventos) — este
// módulo só renderiza. Sem estado próprio, sem sync novo (padrão Game Log).
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  // "há 2 min", "há 1 h", "agora" — a partir do carimbo ISO gravado em `em`.
  function tempoRelativo(iso) {
    const t = Date.parse(iso);
    if (!t) return '';
    const s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 45) return 'agora';
    if (s < 3600) return 'há ' + Math.round(s / 60) + ' min';
    if (s < 86400) return 'há ' + Math.round(s / 3600) + ' h';
    return 'há ' + Math.round(s / 86400) + ' d';
  }

  let _ultimo = '';

  // eventos: [{txt, em, ico}] — entradas antigas podem não ter `ico` (cai em 📜).
  function render(eventos) {
    const alvo = document.getElementById('logMesaLista');
    if (!alvo) return;
    const lista = Array.isArray(eventos) ? eventos : [];
    const chave = JSON.stringify(lista);
    if (chave === _ultimo) return; // nada mudou — não re-renderiza
    _ultimo = chave;
    if (!lista.length) {
      alvo.innerHTML = '<p class="logmesa-vazio">Ainda sem acontecimentos. Rolagens de iniciativa, quedas em combate, saques e subidas de nível aparecem aqui em tempo real.</p>';
      return;
    }
    // mais recente no topo (o servidor guarda em ordem cronológica)
    alvo.innerHTML = lista.slice().reverse().map(ev => `
      <li class="logmesa-item">
        <span class="logmesa-ico">${esc(ev.ico || '📜')}</span>
        <span class="logmesa-txt">${esc(ev.txt || '')}</span>
        <span class="logmesa-quando">${esc(tempoRelativo(ev.em))}</span>
      </li>`).join('');
  }

  window.LogMesa = { render };
})();
