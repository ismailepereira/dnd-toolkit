// =====================================================
// ASSISTENTE DE SUBIDA DE NÍVEL - progressão automática + escolhas da classe
// window.Nivel.abrir(ficha, { aoSalvar })
// =====================================================
const Nivel = (function () {
  const $ = id => document.getElementById(id);
  let ficha = null, ctx = null, novo = 1, escolhas = null;
  let verTodasEscolas = false; // Mago: ver magias de todas as escolas no level-up
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
    if (typeof ehConjurador === 'function' && ehConjurador(ficha.classe, n)) e.magias = true;
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

    // Características de subclasse ganhas exatamente neste nível
    if (ficha.subclasse && typeof SUBCLASSE_FEATURES !== 'undefined' && SUBCLASSE_FEATURES[ficha.subclasse] && SUBCLASSE_FEATURES[ficha.subclasse][novo]) {
      const feats = SUBCLASSE_FEATURES[ficha.subclasse][novo];
      html += `<div class="nv-bloco"><h4>${esc(ficha.subclasse)} — novo poder</h4><ul>${feats.map(([n, d]) => `<li><b>${esc(n)}:</b> ${esc(d)}</li>`).join('')}</ul></div>`;
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

    // Novas magias (regras: contagem por classe/nível, filtro por círculo)
    if (e.magias) {
      const g = ganhoMagias(ficha.classe, novo, ficha.atributos);
      escolhas.gTruques = g.truques; escolhas.gMagias = g.magias;
      const disp = magiasDisponiveis(ficha.classe, ficha.subclasse, novo);
      const conhecidas = [...(ficha.truques || []), ...(ficha.magias1 || [])];
      const maxc = maxCirculo(ficha.classe, novo);
      const rotuloMagia = nome => {
        const d = MAGIAS_DETALHE[nome];
        const lvl = d ? (d.nivel === 0 ? 'Truque' : d.nivel + 'º') : '';
        const dano = d && d.dano && d.dano !== '—' ? ' · ' + d.dano : '';
        return `${esc(nome)} <small>(${lvl}${dano})</small>`;
      };
      if (g.truques > 0) {
        const opc = disp.truques.filter(x => !conhecidas.includes(x));
        html += `<div class="nv-bloco"><h4>Novos Truques <small>(escolha ${g.truques})</small></h4>
          <div class="pericias-grid">${opc.map(mg => `<label class="check-chip"><input type="checkbox" data-truquenovo="${esc(mg)}">${rotuloMagia(mg)}</label>`).join('') || '<span class="criador-hint">Nenhum truque novo disponível.</span>'}</div></div>`;
      }
      if (g.magias > 0) {
        let opc = disp.circulos.filter(x => !conhecidas.includes(x));
        const verbo = g.prepara ? 'preparar' : 'aprender';
        // Mago: trava as magias pela Escola escolhida (com opção de ver todas)
        const escolaFiltro = (ficha.classe === 'Mago' && ficha.subclasse && !verTodasEscolas)
          ? ficha.subclasse.replace(/^Escola de\s*/i, '').trim() : null;
        if (escolaFiltro) opc = opc.filter(n => (MAGIAS_DETALHE[n].escola || '') === escolaFiltro);
        let grupos = '';
        for (let circ = 1; circ <= maxc; circ++) {
          const naLista = opc.filter(n => MAGIAS_DETALHE[n] && MAGIAS_DETALHE[n].nivel === circ);
          if (!naLista.length) continue;
          grupos += `<div class="circulo-grupo"><h5>${circ}º Círculo</h5><div class="pericias-grid">${naLista.map(mg => `<label class="check-chip"><input type="checkbox" data-magianova="${esc(mg)}">${rotuloMagia(mg)}</label>`).join('')}</div></div>`;
        }
        const toggle = (ficha.classe === 'Mago' && ficha.subclasse)
          ? `<button type="button" id="nvToggleEscola" class="btn-mini">${verTodasEscolas ? '🔒 Só ' + esc(ficha.subclasse.replace(/^Escola de\s*/i, '')) : '🔓 Ver todas as escolas'}</button>` : '';
        html += `<div class="nv-bloco"><h4>Novas Magias <small>(${verbo} ${g.magias} · até ${maxc}º círculo)</small> ${toggle}</h4>${escolaFiltro ? `<div class="criador-hint">🔒 Travado na escola de <b>${esc(escolaFiltro)}</b>.</div>` : ''}${grupos || '<span class="criador-hint">Nenhuma magia nova disponível.</span>'}</div>`;
      }
      if (disp.bonus.length) {
        const novas = disp.bonus.filter(x => !conhecidas.includes(x));
        if (novas.length) html += `<div class="nv-bloco"><h4>Magias da Especialização <small>(automáticas)</small></h4><p class="criador-hint">${novas.map(esc).join(', ')}</p></div>`;
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
    if ($('nvToggleEscola')) $('nvToggleEscola').onclick = () => { verTodasEscolas = !verTodasEscolas; render(); };

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
    // limita seleção de truques/magias ao permitido
    const limitar = (seletor, limite) => {
      const chks = document.querySelectorAll(seletor);
      const atualizar = () => {
        const marcados = [...chks].filter(c => c.checked).length;
        chks.forEach(c => { if (!c.checked) c.disabled = marcados >= limite; });
      };
      chks.forEach(c => c.addEventListener('change', atualizar));
      atualizar();
    };
    if (escolhas.gTruques) limitar('[data-truquenovo]', escolhas.gTruques);
    if (escolhas.gMagias) limitar('[data-magianova]', escolhas.gMagias);
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
    ficha.truques = ficha.truques || [];
    ficha.magias1 = ficha.magias1 || [];
    document.querySelectorAll('[data-truquenovo]:checked').forEach(chk => { if (!ficha.truques.includes(chk.dataset.truquenovo)) ficha.truques.push(chk.dataset.truquenovo); });
    document.querySelectorAll('[data-magianova]:checked').forEach(chk => { if (!ficha.magias1.includes(chk.dataset.magianova)) ficha.magias1.push(chk.dataset.magianova); });
    // magias automáticas da especialização
    if (ficha.subclasse && typeof SUBCLASS_MAGIAS !== 'undefined' && SUBCLASS_MAGIAS[ficha.subclasse]) {
      const maxc = maxCirculo(ficha.classe, novo);
      SUBCLASS_MAGIAS[ficha.subclasse].forEach(nm => {
        const d = MAGIAS_DETALHE[nm]; if (!d || d.nivel > maxc) return;
        if (d.nivel === 0) { if (!ficha.truques.includes(nm)) ficha.truques.push(nm); }
        else if (!ficha.magias1.includes(nm)) ficha.magias1.push(nm);
      });
    }

    if (ctx.aoSalvar) ctx.aoSalvar();
    $('modalNivel').classList.add('hidden');
  }

  function abrir(f, opts) {
    ficha = f; ctx = opts || {};
    if (ficha.nivel >= 20) { alert('Este personagem já está no nível máximo (20).'); return; }
    verTodasEscolas = false;
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
