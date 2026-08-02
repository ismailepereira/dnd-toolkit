// =====================================================
// Fase 22.3 — Onboarding de campanha vazia
// Um checklist de 3 passos que aparece no topo da aba Fichas quando a campanha
// ainda está "crua": sem aventura importada, sem fichas de jogador e sem mapa.
// Cada passo tem um botão que leva à aba certa; quando os 3 estão feitos, o
// checklist some sozinho e não volta a atrapalhar.
// Autossuficiente: busca o próprio estado (fichas / aventura_ativa / tabuleiro)
// e só lê o DOM para renderizar — sem acoplar às variáveis do app.js.
// =====================================================
(function () {
  'use strict';
  var alvo = document.getElementById('onboarding');
  if (!alvo) return; // só existe na tela do Mestre

  function irParaAba(tab) {
    var btn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
    if (btn) btn.click();
  }

  function passoHtml(feito, icone, titulo, descricao, rotuloBtn, tab) {
    return '<li class="ob-passo ' + (feito ? 'ob-feito' : '') + '">' +
      '<span class="ob-check">' + (feito ? '✅' : '⬜') + '</span>' +
      '<div class="ob-texto"><b>' + icone + ' ' + titulo + '</b>' +
      '<small>' + descricao + '</small></div>' +
      (feito ? '' : '<button class="btn-mini ob-ir" data-ob-tab="' + tab + '">' + rotuloBtn + '</button>') +
      '</li>';
  }

  function render(flags) {
    // Tudo pronto → nada de checklist (campanha já "acolhida").
    if (flags.temAventura && flags.temFichas && flags.temMapa) {
      alvo.classList.add('hidden');
      alvo.innerHTML = '';
      return;
    }
    var feitos = (flags.temAventura ? 1 : 0) + (flags.temFichas ? 1 : 0) + (flags.temMapa ? 1 : 0);
    alvo.classList.remove('hidden');
    alvo.innerHTML =
      '<div class="ob-cabecalho"><h3>👋 Bem-vindo à campanha!</h3>' +
      '<span class="ob-progresso">' + feitos + ' de 3 prontos</span></div>' +
      '<p class="ob-intro">Três passos para a mesa começar. Faça na ordem que preferir.</p>' +
      '<ol class="ob-lista">' +
      passoHtml(flags.temAventura, '📖', '1. Importe uma aventura pronta',
        'Uma campanha completa (como Phandelver) ou uma one-shot para conduzir já na próxima sessão.',
        'Ir para Aventura', 'aventura') +
      passoHtml(flags.temFichas, '🧑', '2. Fichas dos jogadores',
        'Crie as fichas dos personagens ou peça que cada jogador crie a sua e importe para cá.',
        'Ir para Fichas', 'fichas') +
      passoHtml(flags.temMapa, '🗺️', '3. Abra um mapa',
        'Carregue a imagem do tabuleiro (por URL) e ponha os tokens dos personagens na mesa ao vivo.',
        'Ir para o Tabuleiro', 'aventura') +
      '</ol>';
    alvo.querySelectorAll('.ob-ir').forEach(function (b) {
      b.addEventListener('click', function () { irParaAba(b.dataset.obTab); });
    });
  }

  var _timer = null;
  function avaliar() {
    // debounce: várias fontes (load, troca de aba, tempo real) chamam junto
    clearTimeout(_timer);
    _timer = setTimeout(_avaliarAgora, 120);
  }

  function _avaliarAgora() {
    Promise.all([
      fetch('/api/fichas').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }),
      fetch('/api/aventura_ativa').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch('/api/tabuleiro').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
    ]).then(function (res) {
      var fichas = res[0] || [];
      var ativa = res[1];
      var tab = res[2] || {};
      // aventura_ativa pode vir como {ativa: {...}} ou o objeto direto (ou null)
      var av = ativa && (ativa.ativa !== undefined ? ativa.ativa : ativa);
      render({
        temFichas: Array.isArray(fichas) && fichas.length > 0,
        temAventura: !!(av && (av.definicao || av.noAtual || av.nome || av.titulo || av.modelo)),
        temMapa: !!(tab && (tab.imagemUrl || (tab.tabuleiro && tab.tabuleiro.imagemUrl)))
      });
    });
  }

  // Reavalia ao voltar para a aba Fichas (é onde o checklist mora).
  var btnFichas = document.querySelector('.tab-btn[data-tab="fichas"]');
  if (btnFichas) btnFichas.addEventListener('click', avaliar);

  window.Onboarding = { avaliar: avaliar };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avaliar);
  } else {
    avaliar();
  }
})();
