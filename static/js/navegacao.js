// =====================================================
// Fase 20.2 — menu "⋯" do topbar no celular
// -----------------------------------------------------
// No desktop, .user-info-extra vira display:contents (CSS) e os botões
// continuam soltos na .user-info como sempre — este script não faz nada lá
// (o toggle fica display:none). No celular, os botões secundários (trocar
// campanha, backup, ver como jogador, sair) só aparecem dentro do drawer
// depois de tocar em "⋯" — sem isso, .user-info estourava a largura em
// 375px (achado da 20.1).
// =====================================================
(function () {
  const toggle = document.getElementById('userInfoToggle');
  const extra = document.getElementById('userInfoExtra');
  if (!toggle || !extra) return;

  function fechar() {
    extra.classList.remove('aberto');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const abrindo = !extra.classList.contains('aberto');
    extra.classList.toggle('aberto', abrindo);
    toggle.setAttribute('aria-expanded', String(abrindo));
  });

  document.addEventListener('click', (e) => {
    if (extra.classList.contains('aberto') && !extra.contains(e.target) && e.target !== toggle) fechar();
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fechar(); });
})();
