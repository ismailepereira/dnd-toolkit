// =====================================================
// ASSISTENTE DE SUBIDA DE NÍVEL - progressão automática + escolhas da classe
// window.Nivel.abrir(ficha, { aoSalvar })
// =====================================================
const Nivel = (function () {
  const $ = id => document.getElementById(id);
  let ficha = null, ctx = null, novo = 1, escolhas = null;
  const AVG = { d6: 4, d8: 5, d10: 6, d12: 7 };
  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function chave() { return CLASSE_NOME_PARA_CHAVE[ficha.classe]; }
  function nivelData(n) { const c = CLASSES[chave()]; return c ? c.niveis.find(x => x.nivel === n) : null; }

  function ganhoHP() {
    const c = CLASSES[chave()];
    const dado = c ? c.dadoVida : 'd8';
    const r = RACAS_DETALHE[ficha.raca] || {};
    return AVG[dado] + mod(ficha.atributos.con) + (r.pvExtraPorNivel || 0);
  }

  function detectarEscolhas(n) {
    const nd = nivelData(n);
    const txt = nd ? nd.caracteristicas.join(' ') : '';
    const e = { asi: false, estilo: false, subclasse: false, magias: false, caracteristicas: nd ? nd.caracteristicas : [] };
    if (/Aprimoramento de Habilidade/i.test(txt)) e.asi = true;
    if (/Estilo de Luta/i.test(txt) && !ficha.estilo) e.estilo = true;
    const sc = SUBCLASSES[ficha.classe];
    if (sc && n >= sc.nivel && !ficha.subclasse) e.subclasse = true;
    if (CONJURACAO[ficha.classe] && MAGIAS[ficha.classe]) e.magias = true;
    return e;
  }

  function render() {
    const e = detectarEscolhas(novo);
    escolhas = { modoAsi: '+2', asi1: '', asi2: '', asiUm: '', feat: '', estilo: '', subclasse: '', novasMagias: [] };
    const hpGanho = ganhoHP();

    let html = `<div class="nv-head"><h2>Subir para o Nível ${novo}</h2>
      <div class="nv-sub">${esc(ficha.nome)} · ${esc(ficha.classe)} ${ficha.nivel} → ${novo}</div></div>
      <div class="nv-auto">
        <div class="nv-chip">PV +${hpGanho} <small>(${ficha.hpMax} → ${ficha.hpMax + hpGanho})</small></div>
        <div class="nv-chip">Bônus de Proficiência +${nivelData(novo) ? nivelData(novo).bonusProf : '?'}</div>
      </div>`;

    if (e.caracteristicas.length) {
      html += `<div class="nv-bloco"><h4>Você ganha neste nível</h4><ul>${e.caracteristicas.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>`;
    }

    // Subclasse
    if (e.subclasse) {
      const sc = SUBCLASSES[ficha.classe];
      html += `<div class="nv-bloco"><h4>Escolha sua especialização</h4>
        <select id="nvSubclasse"><option value="">— Selecione —</option>
        ${sc.opcoes.map(o => `<option value="${esc(o.nome)}">${esc(o.nome)} — ${esc(o.desc)}</option>`).join('')}</select></div>`;
    }

    // Estilo de luta
    if (e.estilo) {
      html += `<div class="nv-bloco"><h4>Estilo de Combate</h4>
        <select id="nvEstilo"><option value="">— Selecione —</option>
        ${Object.keys(ESTILOS_LUTA).map(s => `<option value="${esc(s)}">${esc(s)} — ${esc(ESTILOS_LUTA[s])}</option>`).join('')}</select></div>`;
    }

    // ASI / Talento
    if (e.asi) {
      const opts = ATRIBUTOS.map(a => `<option value="${a.chave}">${a.nome} (${ficha.atributos[a.chave]})</option>`).join('');
      html += `<div class="nv-bloco"><h4>Aprimoramento de Habilidade</h4>
        <div class="nv-asi-modo">
          <label><input type="radio" name="nvAsiModo" value="+2" checked> +2 em um atributo</label>
          <label><input type="radio" name="nvAsiModo" value="+1+1"> +1 em dois atributos</label>
          <label><input type="radio" name="nvAsiModo" value="feat"> Talento (Feat)</label>
        </div>
        <div id="nvAsiUm"><select id="nvAsi1"><option value="">— Atributo —</option>${opts}</select></div>
        <div id="nvAsiDois" class="hidden"><select id="nvAsi2a"><option value="">— Atributo —</option>${opts}</select>
          <select id="nvAsi2b"><option value="">— Atributo —</option>${opts}</select></div>
        <div id="nvFeatWrap" class="hidden"><select id="nvFeat"><option value="">— Talento —</option>
          ${Object.keys(TALENTOS).map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('')}</select>
          <p class="nv-feat-desc" id="nvFeatDesc"></p></div>
      </div>`;
    }

    // Novas magias
    if (e.magias) {
      const banco = MAGIAS[ficha.classe] || { truques: [], nivel1: [] };
      const conhecidas = [...(ficha.truques || []), ...(ficha.magias1 || [])];
      const disp = [...banco.truques, ...banco.nivel1].filter(x => !conhecidas.includes(x));
      if (disp.length) {
        html += `<div class="nv-bloco"><h4>Aprender novas magias <small>(opcional)</small></h4>
          <div class="pericias-grid">${disp.map(mg => `<label class="check-chip"><input type="checkbox" data-novamagia="${esc(mg)}">${esc(mg)}</label>`).join('')}</div></div>`;
      }
    }

    $('modalNivelBody').innerHTML = html + `
      <div class="modal-actions">
        <button type="button" id="nvCancelar" class="btn-secondary">Cancelar</button>
        <button type="button" id="nvConfirmar" class="btn-primary">Confirmar Nível ${novo}</button>
      </div>`;

    wire(e);
  }

  function wire(e) {
    $('nvCancelar').onclick = () => $('modalNivel').classList.add('hidden');
    $('nvConfirmar').onclick = confirmar;

    if (e.asi) {
      const upd = () => {
        const modo = document.querySelector('[name="nvAsiModo"]:checked').value;
        $('nvAsiUm').classList.toggle('hidden', modo !== '+2');
        $('nvAsiDois').classList.toggle('hidden', modo !== '+1+1');
        $('nvFeatWrap').classList.toggle('hidden', modo !== 'feat');
      };
      document.querySelectorAll('[name="nvAsiModo"]').forEach(r => r.onchange = upd);
      const fsel = $('nvFeat');
      if (fsel) fsel.onchange = () => { $('nvFeatDesc').textContent = TALENTOS[fsel.value] || ''; };
    }
  }

  function confirmar() {
    const e = detectarEscolhas(novo);
    // validações mínimas
    if (e.subclasse && !$('nvSubclasse').value) return alert('Escolha sua especialização.');
    if (e.estilo && !$('nvEstilo').value) return alert('Escolha um estilo de combate.');
    if (e.asi) {
      const modo = document.querySelector('[name="nvAsiModo"]:checked').value;
      if (modo === '+2') { const a = $('nvAsi1').value; if (!a) return alert('Escolha o atributo.'); ficha.atributos[a] = Math.min(20, ficha.atributos[a] + 2); }
      else if (modo === '+1+1') { const a = $('nvAsi2a').value, b = $('nvAsi2b').value; if (!a || !b) return alert('Escolha os dois atributos.'); ficha.atributos[a] = Math.min(20, ficha.atributos[a] + 1); ficha.atributos[b] = Math.min(20, ficha.atributos[b] + 1); }
      else { const ft = $('nvFeat').value; if (!ft) return alert('Escolha um talento.'); ficha.talentos = ficha.talentos || []; ficha.talentos.push(ft); }
    }
    // aplicar
    const hpGanho = ganhoHP();
    ficha.hpMax += hpGanho;
    ficha.hpAtual = (ficha.hpAtual || 0) + hpGanho;
    ficha.nivel = novo;
    if (e.subclasse) ficha.subclasse = $('nvSubclasse').value;
    if (e.estilo) ficha.estilo = $('nvEstilo').value;
    document.querySelectorAll('[data-novamagia]:checked').forEach(chk => {
      const nm = chk.dataset.novamagia;
      const banco = MAGIAS[ficha.classe];
      if (banco.truques.includes(nm)) { ficha.truques = ficha.truques || []; if (!ficha.truques.includes(nm)) ficha.truques.push(nm); }
      else { ficha.magias1 = ficha.magias1 || []; if (!ficha.magias1.includes(nm)) ficha.magias1.push(nm); }
    });

    if (ctx.aoSalvar) ctx.aoSalvar();
    $('modalNivel').classList.add('hidden');
  }

  function abrir(f, opts) {
    ficha = f; ctx = opts || {};
    if (ficha.nivel >= 20) { alert('Este personagem já está no nível máximo (20).'); return; }
    novo = ficha.nivel + 1;
    montarUmaVez();
    render();
    $('modalNivel').classList.remove('hidden');
  }

  let montado = false;
  function montarUmaVez() {
    if (montado) return; montado = true;
    $('nvFechar').onclick = () => $('modalNivel').classList.add('hidden');
  }

  return { abrir };
})();
window.Nivel = Nivel;
