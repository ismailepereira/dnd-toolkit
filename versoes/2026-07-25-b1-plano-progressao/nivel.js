// =====================================================
// ASSISTENTE DE SUBIDA DE NÍVEL - progressão automática + escolhas da classe
// + MULTICLASSE (Fase 8B): a cada subida, escolhe continuar na classe atual
// ou multiclassar (adicionar/subir numa 2ª classe). Ver static/js/multiclasse.js
// para as regras (pré-requisitos, proficiências limitadas, slots combinados).
// window.Nivel.abrir(ficha, { aoSalvar })
// =====================================================
const Nivel = (function () {
  const $ = id => document.getElementById(id);
  let ficha = null, ctx = null, novo = 1, escolhas = null;
  let verTodasEscolas = false; // Mago/conjurador 1/3: ver magias de todas as escolas no level-up
  let subPreview = null;       // subclasse escolhida ainda não confirmada (p/ conjuração que abre no mesmo nível)
  // ----- Fase 8B: classe sendo subida NESTE level-up -----
  let classeAtiva = null;      // nome da classe (pode ser uma classe nova = multiclasse)
  let entradaAtiva = null;     // entrada existente em ficha.classes (ou null se for uma classe nova)
  function nivelNaClasseAtiva() { return entradaAtiva ? entradaAtiva.nivel + 1 : 1; }
  function subclasseAtivaAtual() { return entradaAtiva ? (entradaAtiva.subclasse || '') : ''; }
  function subEfetivaAtiva() { return subclasseAtivaAtual() || subPreview; }

  const AVG = { d6: 4, d8: 5, d10: 6, d12: 7 };
  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function chave() { return CLASSE_NOME_PARA_CHAVE[classeAtiva]; }
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
    // Estilo de Luta: simplificação — a ficha guarda só UM estilo (ficha.estilo). Se uma
    // 2ª classe também concede Estilo de Luta e o personagem já tem um, não reoferece
    // (ver CHANGELOG/pontos em aberto: não modela dois estilos distintos).
    if (/Estilo de Luta/i.test(txt) && !ficha.estilo) e.estilo = true;
    const sc = SUBCLASSES[classeAtiva];
    if (sc && n >= sc.nivel && !subclasseAtivaAtual()) e.subclasse = true;
    if (typeof ehConjurador === 'function' && ehConjurador(classeAtiva, n, subEfetivaAtiva())) e.magias = true;
    return e;
  }

  // ---------- Fase 8B: tela inicial — escolher em qual classe subir ----------
  function renderEscolhaClasse() {
    const atuais = classesAtuais(ficha);
    let html = `<div class="nv-head"><h2>Subir de Nível</h2>
      <div class="nv-sub">${esc(ficha.nome)} · nível total ${ficha.nivel} → ${novo}</div></div>
      <div class="nv-bloco"><h4>Em qual classe você vai subir?</h4>
        <div class="nv-escolha-classe">${atuais.map(c =>
          `<button type="button" class="btn-secondary nv-classe-btn" data-classe-nivel="${esc(c.classe)}">${esc(c.classe)} <small>nível ${c.nivel} → ${c.nivel + 1}${c.subclasse ? ' · ' + esc(c.subclasse) : ''}</small></button>`).join('')}
        ${atuais.length < 2 ? `<button type="button" class="btn-secondary nv-classe-btn nv-multi" id="nvBtnMulticlasse">🔀 Multiclassar <small>adicionar uma 2ª classe</small></button>` : ''}
        </div>
        ${atuais.length >= 2 ? '<div class="criador-hint">Este personagem já tem 2 classes — esta ferramenta só permite multiclasse com até 2 (decisão de escopo desta fase; ver CHANGELOG.md).</div>' : ''}
      </div>
      <div class="modal-actions"><button type="button" id="nvCancelarEscolha" class="btn-secondary">Cancelar</button></div>`;
    $('modalNivelBody').innerHTML = html;
    $('nvCancelarEscolha').onclick = () => { $('modalNivel').classList.add('hidden'); };
    document.querySelectorAll('[data-classe-nivel]').forEach(b => b.onclick = () => {
      classeAtiva = b.dataset.classeNivel;
      entradaAtiva = atuais.find(c => c.classe === classeAtiva);
      subPreview = null; verTodasEscolas = false;
      render();
    });
    if ($('nvBtnMulticlasse')) $('nvBtnMulticlasse').onclick = () => renderEscolhaMulticlasse(atuais);
  }

  function renderEscolhaMulticlasse(atuais) {
    const jaTem = atuais.map(c => c.classe);
    const opcoes = Object.keys(CLASSE_NOME_PARA_CHAVE).filter(nome => !jaTem.includes(nome));
    let html = `<div class="nv-head"><h2>Multiclassar</h2>
      <div class="nv-sub">Escolha a nova classe — ela começa no nível 1 dela (o nível TOTAL do personagem sobe do mesmo jeito).</div></div>
      <div class="nv-bloco"><div class="nv-escolha-classe">`;
    html += opcoes.map(nome => {
      const check = podeMulticlassarPara(ficha, nome);
      const req = textoPreRequisito(nome);
      return `<button type="button" class="btn-secondary nv-classe-btn${check.ok ? '' : ' desabilitado'}" data-nova-classe="${esc(nome)}" ${check.ok ? '' : 'disabled'} title="${esc(check.ok ? ('Pré-requisito: ' + req) : check.motivo)}">${esc(nome)}${check.ok ? '' : ' 🔒'} <small>${esc(req)}</small></button>`;
    }).join('');
    html += `</div></div><div class="modal-actions">
      <button type="button" id="nvVoltarEscolha" class="btn-secondary">← Voltar</button>
    </div>`;
    $('modalNivelBody').innerHTML = html;
    $('nvVoltarEscolha').onclick = renderEscolhaClasse;
    document.querySelectorAll('[data-nova-classe]:not(.desabilitado)').forEach(b => b.onclick = () => {
      classeAtiva = b.dataset.novaClasse;
      entradaAtiva = null; // classe nova: nível 1 nela
      subPreview = null; verTodasEscolas = false;
      render();
    });
  }

  function render() {
    const n = nivelNaClasseAtiva();
    const e = detectarEscolhas(n);
    escolhas = { modoAsi: '+2', asi1: '', asi2: '', asiUm: '', feat: '', estilo: '', subclasse: '', novasMagias: [] };
    const hpGanho = ganhoHP();
    const multiclassando = !entradaAtiva;

    let html = `<div class="nv-head"><h2>${multiclassando ? `Multiclassar em ${esc(classeAtiva)}` : `${esc(classeAtiva)} — Nível ${n}`}</h2>
      <div class="nv-sub">${esc(ficha.nome)} · ${esc(classeAtiva)} ${multiclassando ? '0' : entradaAtiva.nivel} → ${n} <small>(nível total ${ficha.nivel} → ${novo})</small></div></div>
      <div class="nv-auto">
        <div class="nv-chip">PV +${hpGanho} <small>(${ficha.hpMax} → ${ficha.hpMax + hpGanho})</small></div>
        <div class="nv-chip">Bônus de Proficiência +${(typeof PB === 'function') ? PB(novo) : '?'} <small>(pelo nível TOTAL)</small></div>
      </div>`;

    if (multiclassando) {
      const chk = podeMulticlassarPara(ficha, classeAtiva);
      if (!chk.ok) html += `<div class="nv-bloco pv-avisos"><h4>⚠ Pré-requisito não atendido</h4><p>${esc(chk.motivo)}</p></div>`;
      const mc = (typeof PROF_MULTICLASSE !== 'undefined') ? PROF_MULTICLASSE[classeAtiva] : null;
      if (mc) {
        const armaduraTxt = mc.armadura.length ? mc.armadura.join(', ') : 'nenhuma';
        html += `<div class="nv-bloco"><h4>Proficiências ganhas ao multiclassar</h4>
          <p>Armadura: <b>${esc(armaduraTxt)}</b> · Armas: <b>${esc(mc.arma || 'nenhuma')}</b></p>
          <p class="criador-hint">Multiclasse concede menos proficiências que a classe inicial (regra do PHB) — perícias/ferramentas extras não são modeladas aqui.</p></div>`;
      }
    }

    if (e.caracteristicas.length) {
      html += `<div class="nv-bloco"><h4>Você ganha neste nível</h4><ul>${e.caracteristicas.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>`;
    }

    // Características de subclasse ganhas exatamente neste nível (da classe ativa)
    const subAtual = subclasseAtivaAtual();
    if (subAtual && typeof SUBCLASSE_FEATURES !== 'undefined' && SUBCLASSE_FEATURES[subAtual] && SUBCLASSE_FEATURES[subAtual][n]) {
      const feats = SUBCLASSE_FEATURES[subAtual][n];
      html += `<div class="nv-bloco"><h4>${esc(subAtual)} — novo poder</h4><ul>${feats.map(([nm, d]) => `<li><b>${esc(nm)}:</b> ${esc(d)}</li>`).join('')}</ul></div>`;
    }

    // Subclasse
    if (e.subclasse) {
      const sc = SUBCLASSES[classeAtiva];
      html += `<div class="nv-bloco"><h4>Escolha a especialização de ${esc(classeAtiva)}</h4>
        <select id="nvSubclasse"><option value="">— Selecione —</option>
        ${sc.opcoes.map(o => `<option value="${esc(o.nome)}" ${subPreview === o.nome ? 'selected' : ''}>${esc(o.nome)} — ${esc(o.desc)}</option>`).join('')}</select></div>`;
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

    // Novas magias (regras: contagem por classe/nível, filtro por círculo) — da classe ATIVA
    if (e.magias) {
      const sub = subEfetivaAtiva();
      const g = ganhoMagias(classeAtiva, n, ficha.atributos, sub);
      escolhas.gTruques = g.truques; escolhas.gMagias = g.magias;
      const disp = magiasDisponiveis(classeAtiva, sub, n);
      const conhecidas = [...(ficha.truques || []), ...(ficha.magias1 || [])];
      const maxc = maxCirculo(classeAtiva, n, sub);
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
        // Trava as magias pelas escolas favorecidas (Mago: 1 escola; Cav. Arcano/Trapaceiro: 2), com opção de ver todas
        const escolas = (typeof escolasDeFiltro === 'function') ? escolasDeFiltro(classeAtiva, sub) : null;
        const escolaFiltro = (escolas && !verTodasEscolas) ? escolas : null;
        if (escolaFiltro) opc = opc.filter(n2 => escolaFiltro.includes(MAGIAS_DETALHE[n2].escola || ''));
        let grupos = '';
        for (let circ = 1; circ <= maxc; circ++) {
          const naLista = opc.filter(n2 => MAGIAS_DETALHE[n2] && MAGIAS_DETALHE[n2].nivel === circ);
          if (!naLista.length) continue;
          grupos += `<div class="circulo-grupo"><h5>${circ}º Círculo</h5><div class="pericias-grid">${naLista.map(mg => `<label class="check-chip"><input type="checkbox" data-magianova="${esc(mg)}">${rotuloMagia(mg)}</label>`).join('')}</div></div>`;
        }
        const toggle = escolas
          ? `<button type="button" id="nvToggleEscola" class="btn-mini">${verTodasEscolas ? '🔒 Só ' + esc(escolas.join('/')) : '🔓 Ver todas as escolas'}</button>` : '';
        html += `<div class="nv-bloco"><h4>Novas Magias <small>(${verbo} ${g.magias} · até ${maxc}º círculo)</small> ${toggle}</h4>${escolaFiltro ? `<div class="criador-hint">🔒 Travado em <b>${esc(escolaFiltro.join(' / '))}</b>.</div>` : ''}${grupos || '<span class="criador-hint">Nenhuma magia nova disponível.</span>'}</div>`;
      }
      if (disp.bonus.length) {
        const novas = disp.bonus.filter(x => !conhecidas.includes(x));
        if (novas.length) html += `<div class="nv-bloco"><h4>Magias da Especialização <small>(automáticas)</small></h4><p class="criador-hint">${novas.map(esc).join(', ')}</p></div>`;
      }
    }

    $('modalNivelBody').innerHTML = html + `
      <div class="modal-actions">
        <button type="button" id="nvVoltar" class="btn-secondary">← Trocar classe</button>
        <button type="button" id="nvCancelar" class="btn-secondary">Cancelar</button>
        <button type="button" id="nvConfirmar" class="btn-primary">Confirmar Nível ${novo}</button>
      </div>`;

    wire(e);
  }

  function wire(e) {
    $('nvVoltar').onclick = renderEscolhaClasse;
    $('nvCancelar').onclick = () => { subPreview = null; $('modalNivel').classList.add('hidden'); };
    $('nvConfirmar').onclick = confirmar;
    if ($('nvToggleEscola')) $('nvToggleEscola').onclick = () => { verTodasEscolas = !verTodasEscolas; render(); };
    // Se a subclasse abre conjuração neste mesmo nível (Cav. Arcano/Trapaceiro), re-renderiza ao escolhê-la
    if ($('nvSubclasse')) $('nvSubclasse').onchange = () => {
      const v = $('nvSubclasse').value;
      if (typeof subclasseConjura === 'function' && subclasseConjura(v)) { subPreview = v; verTodasEscolas = false; render(); }
    };

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

  // Garante que a ficha tem o modelo ficha.classes (materializa a partir do
  // estado mono-classe atual, na primeira vez que for necessário). Fichas que
  // nunca multiclassam continuam com um array de 1 entrada — se comporta
  // exatamente como mono-classe em todo o resto do app (ver ehMulticlasse()
  // em jogo.js, que só ativa a lógica de multiclasse com 2+ entradas).
  function garantirClasses() {
    if (!ficha.classes || !ficha.classes.length) {
      ficha.classes = [{ classe: ficha.classe, nivel: ficha.nivel, subclasse: ficha.subclasse || '' }];
    }
  }

  function confirmar() {
    const n = nivelNaClasseAtiva();
    const e = detectarEscolhas(n);
    const multiclassando = !entradaAtiva;
    // validações mínimas
    if (multiclassando) {
      const chk = podeMulticlassarPara(ficha, classeAtiva);
      if (!chk.ok) return alert(chk.motivo);
    }
    if (e.subclasse && !$('nvSubclasse').value) return alert('Escolha sua especialização.');
    if (e.estilo && !$('nvEstilo').value) return alert('Escolha um estilo de combate.');
    if (e.asi) {
      const modo = document.querySelector('[name="nvAsiModo"]:checked').value;
      if (modo === '+2') { const a = $('nvAsi1').value; if (!a) return alert('Escolha o atributo.'); ficha.atributos[a] = Math.min(20, ficha.atributos[a] + 2); }
      else if (modo === '+1+1') { const a = $('nvAsi2a').value, b = $('nvAsi2b').value; if (!a || !b) return alert('Escolha os dois atributos.'); ficha.atributos[a] = Math.min(20, ficha.atributos[a] + 1); ficha.atributos[b] = Math.min(20, ficha.atributos[b] + 1); }
      else { const ft = $('nvFeat').value; if (!ft) return alert('Escolha um talento.'); ficha.talentos = ficha.talentos || []; ficha.talentos.push(ft); }
    }

    // Materializa ficha.classes ANTES de tocar em ficha.nivel — garantirClasses()
    // usa o nível total AINDA ANTIGO para preencher a 1ª entrada corretamente
    // (senão, ao multiclassar, a classe original ficaria com o nível NOVO total
    // em vez do nível que ela realmente tinha antes desta subida).
    garantirClasses();

    // aplicar PV e nível total
    const hpGanho = ganhoHP();
    ficha.hpMax += hpGanho;
    ficha.hpAtual = (ficha.hpAtual || 0) + hpGanho;
    ficha.nivel = novo;

    // aplicar progressão na CLASSE ATIVA (multiclasse.js: ficha.classes)
    let entry = ficha.classes.find(c => c.classe === classeAtiva);
    if (!entry) { entry = { classe: classeAtiva, nivel: 0, subclasse: '' }; ficha.classes.push(entry); }
    entry.nivel += 1;
    if (e.subclasse) entry.subclasse = $('nvSubclasse').value;
    if (e.estilo) ficha.estilo = $('nvEstilo').value;
    // espelha a PRIMEIRA classe em ficha.classe/subclasse (compat com o resto do app)
    ficha.classe = ficha.classes[0].classe;
    ficha.subclasse = ficha.classes[0].subclasse || '';

    ficha.truques = ficha.truques || [];
    ficha.magias1 = ficha.magias1 || [];
    document.querySelectorAll('[data-truquenovo]:checked').forEach(chk => { if (!ficha.truques.includes(chk.dataset.truquenovo)) ficha.truques.push(chk.dataset.truquenovo); });
    document.querySelectorAll('[data-magianova]:checked').forEach(chk => { if (!ficha.magias1.includes(chk.dataset.magianova)) ficha.magias1.push(chk.dataset.magianova); });
    // magias automáticas da especialização (da classe ativa)
    const subFinal = subclasseAtivaAtual();
    if (subFinal && typeof SUBCLASS_MAGIAS !== 'undefined' && SUBCLASS_MAGIAS[subFinal]) {
      const maxc = maxCirculo(classeAtiva, n, subFinal);
      SUBCLASS_MAGIAS[subFinal].forEach(nm => {
        const d = MAGIAS_DETALHE[nm]; if (!d || d.nivel > maxc) return;
        if (d.nivel === 0) { if (!ficha.truques.includes(nm)) ficha.truques.push(nm); }
        else if (!ficha.magias1.includes(nm)) ficha.magias1.push(nm);
      });
    }

    subPreview = null;
    if (ctx.aoSalvar) ctx.aoSalvar();
    $('modalNivel').classList.add('hidden');
  }

  function abrir(f, opts) {
    ficha = f; ctx = opts || {};
    if (ficha.nivel >= 20) { alert('Este personagem já está no nível máximo (20).'); return; }
    verTodasEscolas = false; subPreview = null;
    novo = ficha.nivel + 1;
    classeAtiva = null; entradaAtiva = null;
    montarUmaVez();
    renderEscolhaClasse();
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
