// =====================================================
// CRIADOR DE PERSONAGEM - preview ao vivo, regras 5e, gerador automático
// Compartilhado por Mestre e Jogador. Expõe window.Criador.abrir(ficha, opts)
// =====================================================
const Criador = (function () {
  const $ = id => document.getElementById(id);
  let ctx = null; // { aoSalvar, aoExcluir, original }
  let estado = null;
  let criandoNovo = true;        // ficha nova (aplica ouro inicial)
  let mostrarTodasEscolas = false; // Mago: ver magias de todas as escolas

  const AVG_DADO = { d6: 4, d8: 5, d10: 6, d12: 7 };

  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function estadoVazio() {
    return {
      nome: '',
      raca: 'Humano',
      classe: 'Guerreiro',
      antecedente: 'Soldado',
      nivel: 1,
      base: { for: 15, des: 14, con: 13, int: 12, sab: 10, car: 8 },
      escolhaAtributos: [],   // atributos +1 escolhidos (raça)
      pericias: [],           // perícias de classe escolhidas
      periciasExtra: [],      // perícias raciais extras
      estilo: '',
      subclasse: '',
      truques: [],
      magias1: [],
      armadura: 'Cota de Malha',
      escudo: true,
      itens: [],
      ouro: 0,
      anotacoes: '',
    };
  }

  // ---------- Cálculo de regras ----------
  function atributosFinais(s) {
    const r = RACAS_DETALHE[s.raca] || { asi: {} };
    const f = { ...s.base };
    for (const k in (r.asi || {})) f[k] = (f[k] || 10) + r.asi[k];
    (s.escolhaAtributos || []).forEach(k => { if (k) f[k] = (f[k] || 10) + 1; });
    return f;
  }

  function periciasProficientes(s) {
    const set = new Set();
    (s.pericias || []).forEach(p => set.add(p));
    (s.periciasExtra || []).forEach(p => set.add(p));
    const ant = ANTECEDENTES[s.antecedente];
    if (ant) ant.pericias.forEach(p => set.add(p));
    const r = RACAS_DETALHE[s.raca];
    if (r && r.periciaFixa) r.periciaFixa.forEach(p => set.add(p));
    return set;
  }

  function calcular(s) {
    const attrs = atributosFinais(s);
    const pb = PB(s.nivel);
    const chaveClasse = CLASSE_NOME_PARA_CHAVE[s.classe];
    const cls = CLASSES[chaveClasse];
    const dado = cls ? cls.dadoVida : 'd8';
    const numDado = parseInt(dado.replace('d', ''), 10);
    const conMod = mod(attrs.con);

    const r = RACAS_DETALHE[s.raca] || {};
    const pvExtra = (r.pvExtraPorNivel || 0) * s.nivel;
    let hp = numDado + conMod; // nível 1
    for (let n = 2; n <= s.nivel; n++) hp += AVG_DADO[dado] + conMod;
    hp += pvExtra;
    hp = Math.max(1, hp);

    // CA
    const arm = ARMADURAS[s.armadura] || ARMADURAS['Sem armadura'];
    const dexMod = mod(attrs.des);
    let ca;
    if (s.armadura === 'Sem armadura' && s.classe === 'Bárbaro') ca = 10 + dexMod + conMod;
    else if (s.armadura === 'Sem armadura' && s.classe === 'Monge') ca = 10 + dexMod + mod(attrs.sab);
    else if (arm.tipo === 'leve') ca = arm.base + dexMod;
    else if (arm.tipo === 'media') ca = arm.base + Math.min(dexMod, 2);
    else ca = arm.base;
    if (s.escudo) ca += 2;
    if (s.estilo === 'Defesa' && s.armadura !== 'Sem armadura') ca += 1;

    const iniciativa = dexMod;
    const perProf = periciasProficientes(s);
    const percMod = mod(attrs.sab) + (perProf.has('Percepção') ? pb : 0);
    const percPassiva = 10 + percMod;

    // Salvaguardas
    const salvas = (cls ? cls.salvaguardas : []).map(n => SALVA_CHAVE[n]);
    const salvaguardas = ATRIBUTOS.map(a => ({
      nome: a.nome, chave: a.chave,
      valor: mod(attrs[a.chave]) + (salvas.includes(a.chave) ? pb : 0),
      prof: salvas.includes(a.chave),
    }));

    // Conjuração
    let conj = null;
    const cj = CONJURACAO[s.classe];
    if (cj && s.nivel >= (cj.desdeNivel || 1)) {
      const m = mod(attrs[cj.atributo]);
      conj = {
        atributo: cj.atributo,
        cd: 8 + pb + m,
        ataque: pb + m,
      };
    }

    return {
      attrs, pb, hp, ca, iniciativa, percPassiva, salvaguardas, conj,
      deslocamento: r.deslocamento || 30, tamanho: r.tamanho || 'Médio',
      visaoNoEscuro: r.visaoNoEscuro || 0, idiomas: r.idiomas || ['Comum'],
      tracos: r.tracos || [], perProf,
      caracteristicasNivel: cls ? cls.niveis.find(x => x.nivel === s.nivel) : null,
      cls,
    };
  }

  // ---------- Preview ao vivo ----------
  function renderPreview() {
    const s = estado;
    const c = calcular(s);
    const linhasAttr = ATRIBUTOS.map(a => {
      const v = c.attrs[a.chave];
      return `<div class="pv-attr"><span class="pv-attr-nome">${a.nome.slice(0, 3).toUpperCase()}</span>
        <span class="pv-attr-val">${v}</span><span class="pv-attr-mod">${fmtMod(v)}</span></div>`;
    }).join('');

    const salvas = c.salvaguardas.map(sv =>
      `<span class="pv-pill ${sv.prof ? 'prof' : ''}">${sv.nome.slice(0, 3)} ${(sv.valor >= 0 ? '+' : '') + sv.valor}</span>`
    ).join('');

    const periciasHtml = Object.keys(PERICIAS).map(p => {
      const prof = c.perProf.has(p);
      const m = mod(c.attrs[PERICIAS[p]]) + (prof ? c.pb : 0);
      return `<div class="pv-pericia ${prof ? 'prof' : ''}"><span>${prof ? '●' : '○'} ${p}</span><span>${(m >= 0 ? '+' : '') + m}</span></div>`;
    }).join('');

    const caracteristicas = (c.caracteristicasNivel && c.caracteristicasNivel.caracteristicas.length)
      ? c.caracteristicasNivel.caracteristicas.map(t => `<li>${escHtml(t)}</li>`).join('')
      : '<li class="vazio">—</li>';

    const conjHtml = c.conj ? `
      <div class="pv-bloco">
        <h4>Conjuração</h4>
        <div class="pv-linha">CD de Magia <strong>${c.conj.cd}</strong> · Ataque <strong>${(c.conj.ataque >= 0 ? '+' : '') + c.conj.ataque}</strong></div>
        ${s.truques.length ? `<div class="pv-linha"><strong>Truques:</strong> ${s.truques.map(escHtml).join(', ')}</div>` : ''}
        ${s.magias1.length ? `<div class="pv-linha"><strong>1º Círculo:</strong> ${s.magias1.map(escHtml).join(', ')}</div>` : ''}
      </div>` : '';

    const itensHtml = s.itens.length ? s.itens.map(escHtml).join(', ') : '—';

    // armas (dano/acerto) e avisos de proficiência/sobrepeso
    const fichaTmp = { classe: s.classe, armadura: s.armadura, escudo: s.escudo, atributos: c.attrs, itens: s.itens };
    const avisos = (typeof penalidadesEquipamento === 'function') ? penalidadesEquipamento(fichaTmp) : [];
    const armas = s.itens.map(n => (typeof ataqueArma === 'function') ? ataqueArma(fichaTmp, n, c.pb) : null).filter(Boolean);
    const penDesloc = avisos.reduce((acc, a) => acc + (a.deslocamento || 0), 0);
    const armasHtml = armas.length ? `<div class="pv-bloco"><h4>Ataques de Arma</h4>${armas.map(a => `<div class="pv-linha"><strong>${escHtml(a.nome)}:</strong> ${a.ataque >= 0 ? '+' : ''}${a.ataque} p/ acertar · ${escHtml(a.dano)}${a.semProf ? ' <span class="pv-warn">⚠ sem proficiência</span>' : ''}</div>`).join('')}</div>` : '';
    const avisosHtml = avisos.length ? `<div class="pv-bloco pv-avisos"><h4>⚠ Penalidades</h4>${avisos.map(a => `<div class="pv-linha">${escHtml(a.texto)}</div>`).join('')}</div>` : '';

    $('cPreview').innerHTML = `
      <div class="pv-cabecalho">
        <h3>${escHtml(s.nome) || 'Personagem sem nome'}</h3>
        <div class="pv-sub">${escHtml(s.raca)} · ${escHtml(s.classe)} Nível ${s.nivel} · ${escHtml(s.antecedente)}</div>
      </div>
      <div class="pv-destaques">
        <div class="pv-box"><span class="pv-box-num">${c.hp}</span><span>PV</span></div>
        <div class="pv-box"><span class="pv-box-num">${c.ca}</span><span>CA</span></div>
        <div class="pv-box"><span class="pv-box-num">${(c.iniciativa >= 0 ? '+' : '') + c.iniciativa}</span><span>Inic.</span></div>
        <div class="pv-box"><span class="pv-box-num">+${c.pb}</span><span>Prof.</span></div>
        <div class="pv-box"><span class="pv-box-num">${c.percPassiva}</span><span>Perc.</span></div>
      </div>
      <div class="pv-attrs">${linhasAttr}</div>
      <div class="pv-bloco"><h4>Salvaguardas</h4><div class="pv-pills">${salvas}</div></div>
      <div class="pv-bloco">
        <h4>Deslocamento & Sentidos</h4>
        <div class="pv-linha">${c.deslocamento + penDesloc}m${penDesloc ? ' <span class="pv-warn">(sobrepeso)</span>' : ''} · ${c.tamanho}${c.visaoNoEscuro ? ` · Visão no escuro ${c.visaoNoEscuro}m` : ''}</div>
        <div class="pv-linha"><strong>Idiomas:</strong> ${c.idiomas.map(escHtml).join(', ')}</div>
      </div>
      <div class="pv-bloco"><h4>Perícias</h4><div class="pv-pericias">${periciasHtml}</div></div>
      ${c.tracos.length ? `<div class="pv-bloco"><h4>Traços Raciais</h4><ul>${c.tracos.map(t => `<li>${escHtml(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="pv-bloco"><h4>Características de Classe (Nível ${s.nivel})</h4><ul>${caracteristicas}</ul></div>
      ${s.estilo ? `<div class="pv-bloco"><h4>Estilo de Combate</h4><div class="pv-linha">${escHtml(s.estilo)}: ${escHtml(ESTILOS_LUTA[s.estilo] || '')}</div></div>` : ''}
      ${conjHtml}
      ${armasHtml}
      <div class="pv-bloco"><h4>Equipamento</h4><div class="pv-linha"><strong>Armadura:</strong> ${escHtml(s.armadura)}${s.escudo ? ' + Escudo' : ''}</div><div class="pv-linha"><strong>Itens:</strong> ${itensHtml}</div><div class="pv-linha"><strong>Ouro:</strong> ${s.ouro} po</div></div>
      ${avisosHtml}
    `;
  }

  // ---------- Render das escolhas dinâmicas ----------
  function renderEscolhaAtributos() {
    const r = RACAS_DETALHE[estado.raca] || {};
    const n = r.escolhaAtributos || 0;
    const wrap = $('cEscolhaAtributos');
    if (!n) { wrap.innerHTML = ''; estado.escolhaAtributos = []; return; }
    if (estado.escolhaAtributos.length !== n) estado.escolhaAtributos = new Array(n).fill('');
    const fixos = Object.keys(r.asi || {});
    let html = `<div class="criador-hint">Esta raça concede +1 em ${n} atributo(s) à escolha:</div>`;
    for (let i = 0; i < n; i++) {
      const opts = ATRIBUTOS.filter(a => !fixos.includes(a.chave))
        .map(a => `<option value="${a.chave}" ${estado.escolhaAtributos[i] === a.chave ? 'selected' : ''}>${a.nome}</option>`).join('');
      html += `<label class="mini-label">+1 <select data-escolha="${i}"><option value="">—</option>${opts}</select></label>`;
    }
    wrap.innerHTML = html;
    wrap.querySelectorAll('[data-escolha]').forEach(sel => {
      sel.addEventListener('change', () => {
        estado.escolhaAtributos[+sel.dataset.escolha] = sel.value;
        renderPreview();
      });
    });
  }

  function renderAtributosBase() {
    const wrap = $('cAtributos');
    wrap.innerHTML = ATRIBUTOS.map(a => `
      <label class="mini-label">${a.nome.slice(0, 3).toUpperCase()}
        <input type="number" data-attr="${a.chave}" value="${estado.base[a.chave]}" min="3" max="20">
      </label>`).join('');
    wrap.querySelectorAll('[data-attr]').forEach(inp => {
      inp.addEventListener('input', () => {
        estado.base[inp.dataset.attr] = Number(inp.value) || 10;
        renderPreview();
      });
    });
  }

  function renderPericias() {
    const def = PERICIAS_CLASSE[estado.classe] || { qtd: 0, opcoes: [] };
    estado.pericias = estado.pericias.filter(p => def.opcoes.includes(p));
    $('cPericiasInfo').textContent = `(escolha ${def.qtd} de ${estado.classe})`;
    const wrap = $('cPericias');
    wrap.innerHTML = def.opcoes.map(p => {
      const ch = estado.pericias.includes(p);
      return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-per="${escHtml(p)}" ${ch ? 'checked' : ''}>${escHtml(p)}</label>`;
    }).join('');
    wrap.querySelectorAll('[data-per]').forEach(chk => {
      chk.addEventListener('change', () => {
        const p = chk.dataset.per;
        if (chk.checked) {
          if (estado.pericias.length >= def.qtd) { chk.checked = false; return; }
          estado.pericias.push(p);
        } else estado.pericias = estado.pericias.filter(x => x !== p);
        chk.closest('.check-chip').classList.toggle('on', chk.checked);
        renderPreview();
      });
    });

    // Perícias raciais extras
    const r = RACAS_DETALHE[estado.raca] || {};
    const ne = r.periciaExtra || 0;
    const wrapE = $('cPericiasExtra');
    if (!ne) { wrapE.innerHTML = ''; estado.periciasExtra = []; return; }
    estado.periciasExtra = estado.periciasExtra.slice(0, ne);
    wrapE.innerHTML = `<h3>Perícias raciais <span class="criador-hint-inline">(escolha ${ne})</span></h3>
      <div class="pericias-grid">` + Object.keys(PERICIAS).map(p => {
        const ch = estado.periciasExtra.includes(p);
        return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-perx="${escHtml(p)}" ${ch ? 'checked' : ''}>${escHtml(p)}</label>`;
      }).join('') + `</div>`;
    wrapE.querySelectorAll('[data-perx]').forEach(chk => {
      chk.addEventListener('change', () => {
        const p = chk.dataset.perx;
        if (chk.checked) {
          if (estado.periciasExtra.length >= ne) { chk.checked = false; return; }
          estado.periciasExtra.push(p);
        } else estado.periciasExtra = estado.periciasExtra.filter(x => x !== p);
        chk.closest('.check-chip').classList.toggle('on', chk.checked);
        renderPreview();
      });
    });
  }

  function renderEstilo() {
    const tem = CLASSES_COM_ESTILO.includes(estado.classe) && estado.nivel >= 1
      && (estado.classe !== 'Patrulheiro' || estado.nivel >= 2)
      && (estado.classe !== 'Paladino' || estado.nivel >= 2);
    $('cEstiloWrap').classList.toggle('hidden', !tem);
    $('cEstilo').classList.toggle('hidden', !tem);
    if (!tem) { estado.estilo = ''; return; }
    $('cEstiloWrap').innerHTML = `Estilo de Combate <span class="criador-hint-inline">(característica marcial de ${escHtml(estado.classe)})</span>`;
    $('cEstilo').innerHTML = '<option value="">— Selecione —</option>' +
      Object.keys(ESTILOS_LUTA).map(e => `<option value="${e}" ${estado.estilo === e ? 'selected' : ''}>${e} — ${ESTILOS_LUTA[e]}</option>`).join('');
  }

  function rotuloMagiaCriador(nome) {
    const d = (typeof MAGIAS_DETALHE !== 'undefined') ? MAGIAS_DETALHE[nome] : null;
    const dano = d && d.dano && d.dano !== '—' ? ` <small>· ${escHtml(d.dano)}</small>` : '';
    return `${escHtml(nome)}${dano}`;
  }

  function renderMagias() {
    const wrap = $('cMagiasWrap');
    const ehConj = (typeof ehConjurador === 'function') && ehConjurador(estado.classe, estado.nivel);
    if (!ehConj) { wrap.classList.add('hidden'); estado.truques = []; estado.magias1 = []; return; }
    wrap.classList.remove('hidden');

    const disp = magiasDisponiveis(estado.classe, null, estado.nivel); // {truques, circulos, bonus}
    const limTruques = truquesNoNivel(estado.classe, estado.nivel);
    const ehMago = estado.classe === 'Mago';
    // Mago aprende no GRIMÓRIO (6 no nível 1, +2 por nível); as preparadas do dia (INT+nível) vivem no Modo de Jogo
    const limMagias = ehMago ? (6 + (estado.nivel - 1) * 2) : magiasNoNivel(estado.classe, estado.nivel, atributosFinais(estado));
    const prepara = !!PREPARA[estado.classe] && estado.classe !== 'Mago';

    // truque racial automático (não conta)
    const r = RACAS_DETALHE[estado.raca] || {};
    const truqueRacial = (r.truqueExtra && r.truqueExtra.nome) ? r.truqueExtra.nome : '';

    // mantém só escolhas válidas
    estado.truques = (estado.truques || []).filter(t => disp.truques.includes(t));
    estado.magias1 = (estado.magias1 || []).filter(t => disp.circulos.includes(t));

    // ----- Truques -----
    $('cTruquesWrap').innerHTML = limTruques > 0
      ? `<h4>Truques <span class="criador-hint-inline">(escolha ${limTruques})</span></h4>
         ${truqueRacial ? `<div class="criador-hint">+ Truque racial automático: <strong>${escHtml(truqueRacial)}</strong></div>` : ''}
         <div class="pericias-grid">` + disp.truques.map(t => {
            const ch = estado.truques.includes(t);
            return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-truque="${escHtml(t)}" ${ch ? 'checked' : ''}>${rotuloMagiaCriador(t)}</label>`;
          }).join('') + `</div>`
      : (truqueRacial ? `<div class="criador-hint">Truque racial: <strong>${escHtml(truqueRacial)}</strong></div>` : '');

    // ----- Magias agrupadas por círculo (Mago: travadas pela Escola escolhida) -----
    const maxc = maxCirculo(estado.classe, estado.nivel);
    const escolaFiltro = (estado.classe === 'Mago' && estado.subclasse && !mostrarTodasEscolas)
      ? estado.subclasse.replace(/^Escola de\s*/i, '').trim() : null;
    let porCirculo = '';
    for (let circ = 1; circ <= maxc; circ++) {
      let naLista = disp.circulos.filter(n => MAGIAS_DETALHE[n] && MAGIAS_DETALHE[n].nivel === circ);
      if (escolaFiltro) naLista = naLista.filter(n => (MAGIAS_DETALHE[n].escola || '') === escolaFiltro || estado.magias1.includes(n));
      if (!naLista.length) continue;
      porCirculo += `<div class="circulo-grupo"><h5>${circ}º Círculo</h5><div class="pericias-grid">` +
        naLista.map(t => {
          const ch = estado.magias1.includes(t);
          return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-magia1="${escHtml(t)}" ${ch ? 'checked' : ''}>${rotuloMagiaCriador(t)}</label>`;
        }).join('') + `</div></div>`;
    }
    const toggleEscola = (estado.classe === 'Mago' && estado.subclasse)
      ? `<button type="button" id="cToggleEscola" class="btn-mini">${mostrarTodasEscolas ? '🔒 Só ' + escHtml(estado.subclasse.replace(/^Escola de\s*/i, '')) : '🔓 Ver todas as escolas'}</button>` : '';
    const verboMagia = ehMago ? 'grimório:' : (prepara ? 'prepare' : 'conheça');
    $('cMagias1Wrap').innerHTML = `<h4>Magias <span class="criador-hint-inline">(${verboMagia} ${limMagias} · até ${maxc}º círculo)</span> ${toggleEscola}</h4>${ehMago ? `<div class="criador-hint">📖 São as magias do grimório (tudo que o mago aprendeu). No Modo de Jogo você prepara INT + nível delas por dia.</div>` : ''}${escolaFiltro ? `<div class="criador-hint">🔒 Travado na escola de <b>${escHtml(escolaFiltro)}</b>.</div>` : ''}${porCirculo}`;
    const tg = $('cToggleEscola');
    if (tg) tg.addEventListener('click', () => { mostrarTodasEscolas = !mostrarTodasEscolas; renderMagias(); });

    $('cTruquesWrap').querySelectorAll('[data-truque]').forEach(chk => {
      chk.addEventListener('change', () => {
        const t = chk.dataset.truque;
        if (chk.checked) { if (estado.truques.length >= limTruques) { chk.checked = false; return; } estado.truques.push(t); }
        else estado.truques = estado.truques.filter(x => x !== t);
        chk.closest('.check-chip').classList.toggle('on', chk.checked);
        renderPreview();
      });
    });
    $('cMagias1Wrap').querySelectorAll('[data-magia1]').forEach(chk => {
      chk.addEventListener('change', () => {
        const t = chk.dataset.magia1;
        if (chk.checked) { if (estado.magias1.length >= limMagias) { chk.checked = false; return; } estado.magias1.push(t); }
        else estado.magias1 = estado.magias1.filter(x => x !== t);
        chk.closest('.check-chip').classList.toggle('on', chk.checked);
        renderPreview();
      });
    });
  }

  // preço de um item em peças de ouro (po)
  function precoEmPO(nome) {
    const it = (typeof ITENS_PADRAO !== 'undefined') ? ITENS_PADRAO.find(i => i.nome === nome) : null;
    if (!it || !it.preco) return 0;
    const m = String(it.preco).toLowerCase().replace(',', '.').match(/([\d.]+)\s*(po|gp|pp|sp|pc|cp|pe)?/);
    if (!m) return 0;
    const v = parseFloat(m[1]), u = m[2] || 'po';
    if (u === 'pp' || u === 'sp') return v / 10;
    if (u === 'pc' || u === 'cp') return v / 100;
    if (u === 'pe') return v / 2;
    return v;
  }
  const arred = n => Math.round(n * 100) / 100;
  function atualizarOuroDisp() {
    const d = $('cOuroDisp'); if (d) d.textContent = estado.ouro;
    if ($('cOuro')) $('cOuro').value = estado.ouro;
  }

  function renderItens() {
    const wrap = $('cLojaWrap');
    const opts = ITENS_PADRAO.map(i => `<option value="${escHtml(i.nome)}">${escHtml(i.nome)} — ${escHtml(i.preco)}</option>`).join('');
    wrap.innerHTML = `
      <div class="loja-ouro">💰 Ouro: <b id="cOuroDisp">${estado.ouro}</b> po</div>
      <div class="criador-add-item">
        <select id="cItemSelect">${opts}</select>
        <button type="button" id="cAddItem" class="btn-mini">+ Comprar</button>
      </div>
      <div id="cItensChips" class="chips"></div>`;
    $('cAddItem').addEventListener('click', () => {
      const v = $('cItemSelect').value;
      if (!v || estado.itens.includes(v)) return;
      const preco = precoEmPO(v);
      if (preco > estado.ouro) { alert(`Ouro insuficiente: ${v} custa ${preco} po e você tem ${estado.ouro} po.`); return; }
      estado.ouro = arred(estado.ouro - preco);
      estado.itens.push(v);
      atualizarOuroDisp(); renderChipsItens(); renderPeso(); renderPreview();
    });
    renderChipsItens();
  }
  function renderChipsItens() {
    $('cItensChips').innerHTML = estado.itens.map(i =>
      `<span class="chip">${escHtml(i)} <button type="button" data-rem="${escHtml(i)}" title="Remover (devolve o ouro)">×</button></span>`).join('');
    $('cItensChips').querySelectorAll('[data-rem]').forEach(b => {
      b.addEventListener('click', () => {
        const nome = b.dataset.rem;
        estado.itens = estado.itens.filter(x => x !== nome);
        estado.ouro = arred(estado.ouro + precoEmPO(nome)); // devolve o ouro na criação
        atualizarOuroDisp(); renderChipsItens(); renderPeso(); renderPreview();
      });
    });
  }

  function renderTudoDinamico() {
    renderEscolhaAtributos();
    renderPainelClasse();
    renderPericias();
    renderEstilo();
    renderMagias();
    renderPeso();
    renderPreview();
  }

  // ---------- Painel detalhado por classe (etapa 2) ----------
  function renderPainelClasse() {
    const wrap = $('cClassePainel');
    if (!wrap) return;
    const fn = PAINEIS_CLASSE[estado.classe];
    wrap.innerHTML = fn ? fn(estado) : painelGenerico(estado);
    const sel = $('cEscolaMago');
    if (sel) sel.addEventListener('change', () => {
      estado.subclasse = sel.value; mostrarTodasEscolas = false; renderTudoDinamico();
    });
  }

  function painelGenerico(s) {
    const chave = CLASSE_NOME_PARA_CHAVE[s.classe];
    const cls = CLASSES[chave];
    const nd = cls ? cls.niveis.find(n => n.nivel === s.nivel) : null;
    const carac = nd && nd.caracteristicas.length ? nd.caracteristicas.map(c => `<li>${escHtml(c)}</li>`).join('') : '<li class="vazio">—</li>';
    return `<div class="classe-painel-box"><h3>${escHtml(s.classe)} — Nível ${s.nivel}</h3>
      <div class="criador-hint">Dado de Vida ${cls ? cls.dadoVida : ''} · Salvaguardas: ${(cls ? cls.salvaguardas : []).join(', ')}</div>
      <h4>Características deste nível</h4><ul>${carac}</ul></div>`;
  }

  // Painel específico do MAGO
  function painelMago(s) {
    const attrs = atributosFinais(s);
    const intMod = mod(attrs.int);
    const pb = PB(s.nivel);
    const cd = 8 + pb + intMod, atq = pb + intMod;
    const truques = truquesNoNivel('Mago', s.nivel);
    const grimorio = 6 + (s.nivel - 1) * 2; // grimório começa com 6 e ganha 2/nível
    const preparadas = Math.max(1, intMod + s.nivel);
    const maxc = maxCirculo('Mago', s.nivel);
    const recArcana = Math.max(1, Math.ceil(s.nivel / 2)); // espaços recuperáveis (soma de círculos)
    const subNivel = (s.nivel >= 2);
    return `<div class="classe-painel-box mago">
      <h3>🧙 Mago — Nível ${s.nivel}</h3>
      <div class="criador-hint">A magia do Mago vem da <b>Inteligência</b> e do <b>Grimório</b>. Você prepara magias do grimório a cada dia.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${cd}</span><small>CD de Magia</small></div>
        <div class="mago-card"><span>+${atq}</span><small>Ataque Mágico</small></div>
        <div class="mago-card"><span>${maxc}º</span><small>Círculo máx.</small></div>
        <div class="mago-card"><span>${truques}</span><small>Truques</small></div>
        <div class="mago-card"><span>${grimorio}</span><small>Magias no grimório</small></div>
        <div class="mago-card"><span>${preparadas}</span><small>Preparadas/dia</small></div>
      </div>
      <h4>Características de Mago</h4>
      <ul class="mago-feats">
        <li><b>Conjuração Arcana:</b> prepara ${preparadas} magias (INT ${intMod >= 0 ? '+' : ''}${intMod} + nível ${s.nivel}) do grimório por dia.</li>
        <li><b>Recuperação Arcana:</b> 1×/dia, num descanso curto, recupera espaços de magia somando até ${recArcana} (nenhum acima do 5º).</li>
        ${s.nivel >= 4 ? '<li><b>Aprimoramento de Habilidade (N4/8/12/16/19):</b> em cada um desses níveis, +2 num atributo, +1 em dois, ou um talento.</li>' : ''}
        ${s.nivel >= 9 ? '<li><b>Magias de 5º Círculo (N9):</b> abre o 5º círculo — controle de campo e dano pesado (ex.: Telecinésia, Muralha de Pedra, Cone de Frio). Ganha 1 espaço de 5º.</li>' : ''}
        ${s.nivel >= 11 ? '<li><b>Magias de 6º Círculo (N11):</b> abre o 6º círculo (ex.: Desintegrar, Globo de Invulnerabilidade, Muralha de Gelo). Ganha 1 espaço de 6º.</li>' : ''}
        ${s.nivel >= 13 ? '<li><b>Magias de 7º Círculo (N13):</b> abre o 7º círculo (ex.: Teleporte, Reversão da Gravidade, Dedo da Morte). Ganha 1 espaço de 7º.</li>' : ''}
        ${s.nivel >= 18 ? '<li><b>Domínio de Magia:</b> 2 magias de 1º/2º círculo viram à vontade.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Magia-Assinatura:</b> 2 magias de 3º círculo grátis 1×/descanso curto.</li>' : ''}
      </ul>
      ${subNivel ? `<label class="mago-escola"><b>Tradição Arcana (Escola de Magia)</b>
        <select id="cEscolaMago"><option value="">— Escolher escola —</option>${(SUBCLASSES['Mago'] ? SUBCLASSES['Mago'].opcoes : []).map(o => `<option value="${escHtml(o.nome)}" ${s.subclasse === o.nome ? 'selected' : ''}>${escHtml(o.nome)}</option>`).join('')}</select></label>
        <div class="criador-hint">Ao escolher uma escola, o grimório passa a mostrar só as magias dessa escola (use "ver todas" para liberar as demais).</div>` : '<div class="criador-hint">No nível 2 você escolhe sua <b>Escola de Magia</b> (especialização).</div>'}
      ${s.subclasse && typeof featuresSubclasse === 'function' && featuresSubclasse(s.subclasse, s.nivel).length ? `<h4>Poderes da ${escHtml(s.subclasse)}</h4><ul class="mago-feats">${featuresSubclasse(s.subclasse, s.nivel).map(f => `<li><b>N${f.nivel} · ${escHtml(f.nome)}:</b> ${escHtml(f.desc)}</li>`).join('')}</ul>` : ''}
    </div>`;
  }

  // Mapa de painéis específicos (vamos preenchendo classe por classe)
  const PAINEIS_CLASSE = {
    'Mago': painelMago,
  };

  // ---------- Peso / carga (etapa 3) ----------
  function pesoDeItem(nome) {
    const it = (typeof ITENS_PADRAO !== 'undefined') ? ITENS_PADRAO.find(i => i.nome === nome) : null;
    if (!it || !it.peso) return 0;
    const m = String(it.peso).replace(',', '.').match(/([\d.]+)/);
    return m ? parseFloat(m[1]) : 0;
  }
  function renderPeso() {
    const wrap = $('cPesoInfo');
    if (!wrap) return;
    const forca = atributosFinais(estado).for;
    const capacidade = forca * 7.5;            // capacidade de carga (kg) = Força × 7,5
    const limiteSobrecarga = forca * 5;        // > isso: sobrecarregado (regra opcional)
    const limiteMuito = forca * 10;            // > isso: muito sobrecarregado / não pode
    let total = pesoDeItem(estado.armadura);
    if (estado.escudo) total += pesoDeItem('Escudo');
    (estado.itens || []).forEach(i => { total += pesoDeItem(i); });
    total = Math.round(total * 10) / 10;
    let estadoCarga = 'Normal', cor = '#3fb950';
    if (total > limiteMuito) { estadoCarga = 'Muito sobrecarregado (não consegue se mover bem)'; cor = '#e94560'; }
    else if (total > limiteSobrecarga) { estadoCarga = 'Sobrecarregado (−3m de deslocamento)'; cor = '#d29922'; }
    const temMontaria = (estado.itens || []).some(i => { const it = ITENS_PADRAO.find(x => x.nome === i); return it && it.categoria === 'Montaria'; });
    wrap.innerHTML = `<h4>Carga / Peso</h4>
      <div class="peso-barra"><div style="width:${Math.min(100, capacidade ? total / capacidade * 100 : 0)}%;background:${cor}"></div></div>
      <div class="pv-linha">Carregando <b>${total} kg</b> de <b>${capacidade} kg</b> (capacidade = Força ${forca} × 7,5) — <span style="color:${cor}">${estadoCarga}</span></div>
      ${temMontaria ? '<div class="criador-hint">🐴 Você tem uma montaria: ela carrega o peso pesado e dobra sua capacidade ao puxar/arrastar. Em combate, montar/desmontar custa metade do deslocamento.</div>' : '<div class="criador-hint">Dica: uma montaria (na loja) aumenta muito o quanto você carrega e seu deslocamento.</div>'}`;
  }

  // ---------- Métodos de atributos ----------
  const ARRANJO_PADRAO = [15, 14, 13, 12, 10, 8];
  function rolar4d6() {
    const ds = [0, 0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6)).sort((a, b) => a - b);
    return ds[1] + ds[2] + ds[3];
  }

  // ---------- Gerador automático ----------
  function escolherAleatorio(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function autoGerar() {
    const racas = Object.keys(RACAS_DETALHE).filter(r => r !== 'Humano (Variante)');
    const classes = Object.keys(CLASSE_NOME_PARA_CHAVE);
    const s = estadoVazio();
    s.nome = escolherAleatorio(NOMES_ALEATORIOS);
    s.raca = escolherAleatorio(racas);
    s.classe = escolherAleatorio(classes);
    s.antecedente = escolherAleatorio(Object.keys(ANTECEDENTES));
    s.nivel = estado ? estado.nivel : 1;

    // Atributos: arranjo padrão direcionado para o atributo principal da classe
    const principal = {
      'Guerreiro': 'for', 'Bárbaro': 'for', 'Paladino': 'for',
      'Mago': 'int', 'Clérigo': 'sab', 'Druida': 'sab', 'Patrulheiro': 'des',
      'Ladino': 'des', 'Monge': 'des', 'Bardo': 'car', 'Feiticeiro': 'car', 'Bruxo': 'car',
    }[s.classe] || 'for';
    const ordem = [principal, 'con', 'des', 'sab', 'int', 'car'].filter((v, i, a) => a.indexOf(v) === i);
    const todos = ['for', 'des', 'con', 'int', 'sab', 'car'];
    todos.forEach(k => { if (!ordem.includes(k)) ordem.push(k); });
    const arr = [...ARRANJO_PADRAO];
    ordem.forEach((k, i) => { s.base[k] = arr[i]; });

    // Escolha de atributos raciais
    const r = RACAS_DETALHE[s.raca] || {};
    const ne = r.escolhaAtributos || 0;
    const fixos = Object.keys(r.asi || {});
    const cand = todos.filter(k => !fixos.includes(k));
    s.escolhaAtributos = [];
    for (let i = 0; i < ne; i++) s.escolhaAtributos.push(cand[i] || '');

    // Perícias de classe
    const def = PERICIAS_CLASSE[s.classe] || { qtd: 0, opcoes: [] };
    s.pericias = [...def.opcoes].sort(() => Math.random() - 0.5).slice(0, def.qtd);
    // Perícias raciais extras
    const nex = r.periciaExtra || 0;
    s.periciasExtra = Object.keys(PERICIAS).sort(() => Math.random() - 0.5).slice(0, nex);

    // Estilo
    if (CLASSES_COM_ESTILO.includes(s.classe)) s.estilo = escolherAleatorio(Object.keys(ESTILOS_LUTA));

    // Equipamento
    const eq = EQUIPAMENTO_CLASSE[s.classe] || { armadura: 'Sem armadura', armas: [] };
    s.armadura = eq.armadura;
    s.escudo = eq.armas.includes('Escudo');
    s.itens = eq.armas.filter(a => a !== 'Escudo');
    s.ouro = 10 + Math.floor(Math.random() * 40);

    estado = s;
    preencherCampos();

    // Magias automáticas (após preencher para ter contagem)
    const cont = contagemMagias();
    if (cont) {
      const banco = MAGIAS[s.classe] || { truques: [], nivel1: [] };
      s.truques = [...banco.truques].sort(() => Math.random() - 0.5).slice(0, cont.truques);
      s.magias1 = [...banco.nivel1].sort(() => Math.random() - 0.5).slice(0, cont.nivel1);
    }
    renderTudoDinamico();
  }

  // ---------- Preencher campos a partir do estado ----------
  function preencherCampos() {
    $('cNome').value = estado.nome;
    $('cRaca').value = estado.raca;
    $('cClasse').value = estado.classe;
    $('cAntecedente').value = estado.antecedente;
    $('cNivel').value = estado.nivel;
    $('cArmadura').value = estado.armadura;
    $('cEscudo').checked = estado.escudo;
    $('cOuro').value = estado.ouro;
    $('cAnotacoes').value = estado.anotacoes;
    renderAtributosBase();
  }

  // ---------- Construir ficha final (schema compatível) ----------
  function construirFicha() {
    const c = calcular(estado);
    const s = estado;
    const equip = [s.armadura + (s.escudo ? ' + Escudo' : ''), ...s.itens].filter(Boolean).join(', ');
    const magiasTxt = [
      s.truques.length ? 'Truques: ' + s.truques.join(', ') : '',
      s.magias1.length ? '1º Círculo: ' + s.magias1.join(', ') : '',
      c.conj ? `CD ${c.conj.cd} · Ataque ${(c.conj.ataque >= 0 ? '+' : '') + c.conj.ataque}` : '',
    ].filter(Boolean).join('\n');
    return {
      nome: s.nome.trim() || 'Sem nome',
      classe: s.classe,
      raca: s.raca,
      nivel: s.nivel,
      antecedente: s.antecedente,
      hpAtual: c.hp,
      hpMax: c.hp,
      ca: c.ca,
      iniciativa: c.iniciativa,
      atributos: c.attrs,
      estilo: s.estilo,
      subclasse: s.subclasse || '',
      pericias: [...c.perProf],
      truques: s.truques,
      magias1: s.magias1,
      armadura: s.armadura,
      escudo: s.escudo,
      itens: s.itens,
      ouro: s.ouro,
      inventario: equip + (s.ouro ? ` | ${s.ouro} po` : ''),
      magias: magiasTxt,
      anotacoes: s.anotacoes,
      _criador: true,
    };
  }

  // ---------- Carregar ficha existente no estado ----------
  function carregarFicha(f) {
    const s = estadoVazio();
    criandoNovo = !f;
    mostrarTodasEscolas = false;
    if (f) {
      s.nome = f.nome || '';
      s.raca = f.raca && RACAS_DETALHE[f.raca] ? f.raca : 'Humano';
      s.classe = f.classe && CLASSE_NOME_PARA_CHAVE[f.classe] ? f.classe : 'Guerreiro';
      s.antecedente = f.antecedente && ANTECEDENTES[f.antecedente] ? f.antecedente : 'Soldado';
      s.nivel = f.nivel || 1;
      if (f.atributos) s.base = { ...s.base, ...f.atributos };
      s.estilo = f.estilo || '';
      s.subclasse = f.subclasse || '';
      s.truques = f.truques || [];
      s.magias1 = f.magias1 || [];
      s.armadura = f.armadura && ARRADURA_OK(f.armadura) ? f.armadura : 'Cota de Malha';
      s.escudo = f.escudo != null ? f.escudo : false;
      s.itens = f.itens || [];
      s.ouro = f.ouro || 0;
      s.anotacoes = f.anotacoes || '';
      s.pericias = (f.pericias || []).filter(p => (PERICIAS_CLASSE[s.classe]?.opcoes || []).includes(p));
    } else {
      // ficha nova: recebe o ouro inicial da classe para comprar equipamento
      s.ouro = (typeof OURO_INICIAL !== 'undefined' && OURO_INICIAL[s.classe]) || 0;
    }
    estado = s;
  }
  function ARRADURA_OK(n) { return !!ARMADURAS[n]; }

  // ---------- Navegação por etapas ----------
  let passo = 1;
  const TOTAL_PASSOS = 3;
  function irPasso(n) {
    passo = Math.max(1, Math.min(TOTAL_PASSOS, n));
    document.querySelectorAll('#modalCriador .criador-step').forEach(el => {
      el.classList.toggle('hidden', Number(el.dataset.step) !== passo);
    });
    document.querySelectorAll('#modalCriador [data-passo-chip]').forEach(c => {
      const n2 = Number(c.dataset.passoChip);
      c.classList.toggle('ativo', n2 === passo);
      c.classList.toggle('feito', n2 < passo);
    });
    $('cVoltar').style.display = passo > 1 ? 'inline-block' : 'none';
    $('cProximo').style.display = passo < TOTAL_PASSOS ? 'inline-block' : 'none';
    $('cSalvar').style.display = passo === TOTAL_PASSOS ? 'inline-block' : 'none';
  }

  // ---------- Abrir ----------
  function abrir(ficha, opts) {
    ctx = opts || {};
    montarSelectsUmaVez();
    carregarFicha(ficha);
    preencherCampos();
    renderTudoDinamico();
    renderItens();
    $('criadorTitulo').textContent = ficha ? 'Editar Personagem' : 'Criar Personagem';
    $('cExcluir').style.display = (ficha && ctx.aoExcluir) ? 'inline-block' : 'none';
    irPasso(1);
    $('modalCriador').classList.remove('hidden');
  }

  let montado = false;
  function montarSelectsUmaVez() {
    if (montado) return;
    montado = true;
    // Raça
    $('cRaca').innerHTML = RACAS.flatMap(g => g.opcoes).map(o => `<option value="${o}">${o}</option>`).join('');
    // Classe
    $('cClasse').innerHTML = Object.keys(CLASSE_NOME_PARA_CHAVE).map(c => `<option value="${c}">${c}</option>`).join('');
    // Antecedente
    $('cAntecedente').innerHTML = Object.keys(ANTECEDENTES).map(a => `<option value="${a}">${a}</option>`).join('');
    // Nível
    $('cNivel').innerHTML = Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}">Nível ${i + 1}</option>`).join('');
    // Armadura
    $('cArmadura').innerHTML = Object.keys(ARMADURAS).map(a => `<option value="${a}">${a}</option>`).join('');

    // Listeners
    $('cNome').addEventListener('input', () => { estado.nome = $('cNome').value; renderPreview(); });
    $('cRaca').addEventListener('change', () => { estado.raca = $('cRaca').value; renderTudoDinamico(); });
    $('cClasse').addEventListener('change', () => {
      estado.classe = $('cClasse').value;
      estado.subclasse = ''; mostrarTodasEscolas = false;
      if (criandoNovo) { estado.ouro = (typeof OURO_INICIAL !== 'undefined' && OURO_INICIAL[estado.classe]) || 0; atualizarOuroDisp(); }
      renderTudoDinamico();
    });
    $('cAntecedente').addEventListener('change', () => { estado.antecedente = $('cAntecedente').value; renderPreview(); });
    $('cNivel').addEventListener('change', () => { estado.nivel = Number($('cNivel').value); renderTudoDinamico(); });
    $('cArmadura').addEventListener('change', () => { estado.armadura = $('cArmadura').value; renderPeso(); renderPreview(); });
    $('cEscudo').addEventListener('change', () => { estado.escudo = $('cEscudo').checked; renderPeso(); renderPreview(); });
    $('cEstilo').addEventListener('change', () => { estado.estilo = $('cEstilo').value; renderPreview(); });
    $('cOuro').addEventListener('input', () => { estado.ouro = Number($('cOuro').value) || 0; const d = $('cOuroDisp'); if (d) d.textContent = estado.ouro; renderPreview(); });
    $('cAnotacoes').addEventListener('input', () => { estado.anotacoes = $('cAnotacoes').value; });

    $('btnArranjoPadrao').addEventListener('click', () => {
      const ordem = ['for', 'des', 'con', 'int', 'sab', 'car'];
      ordem.forEach((k, i) => estado.base[k] = ARRANJO_PADRAO[i]);
      renderAtributosBase(); renderTudoDinamico();
    });
    $('btnRolarAtributos').addEventListener('click', () => {
      ['for', 'des', 'con', 'int', 'sab', 'car'].forEach(k => estado.base[k] = rolar4d6());
      renderAtributosBase(); renderTudoDinamico();
    });
    $('btnAutoGerar').addEventListener('click', autoGerar);

    $('cCancelar').addEventListener('click', () => $('modalCriador').classList.add('hidden'));
    $('cSalvar').addEventListener('click', () => {
      if (ctx.aoSalvar) ctx.aoSalvar(construirFicha());
      $('modalCriador').classList.add('hidden');
    });
    $('cExcluir').addEventListener('click', () => {
      if (ctx.aoExcluir && confirm('Excluir este personagem?')) { ctx.aoExcluir(); $('modalCriador').classList.add('hidden'); }
    });

    // navegação por etapas
    $('cVoltar').addEventListener('click', () => irPasso(passo - 1));
    $('cProximo').addEventListener('click', () => irPasso(passo + 1));
    document.querySelectorAll('#modalCriador [data-passo-chip]').forEach(c => {
      c.addEventListener('click', () => irPasso(Number(c.dataset.passoChip)));
    });
  }

  return { abrir };
})();
window.Criador = Criador;
