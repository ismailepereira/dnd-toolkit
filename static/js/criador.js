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
      ${(() => { const a = ANTECEDENTES[s.antecedente]; if (!a) return ''; return `<div class="pv-bloco"><h4>Antecedente — ${escHtml(s.antecedente)}</h4>
        <div class="pv-linha"><strong>Característica:</strong> ${escHtml(a.caracteristica)}</div>
        ${a.ferramentas && a.ferramentas.length ? `<div class="pv-linha"><strong>Ferramentas:</strong> ${a.ferramentas.map(escHtml).join(', ')}</div>` : ''}
        ${a.idiomas ? `<div class="pv-linha"><strong>Idiomas extras:</strong> ${a.idiomas}</div>` : ''}
        ${a.equipamento ? `<div class="pv-linha"><strong>Equipamento:</strong> ${escHtml(a.equipamento)}</div>` : ''}</div>`; })()}
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
    const ehConj = (typeof ehConjurador === 'function') && ehConjurador(estado.classe, estado.nivel, estado.subclasse);
    if (!ehConj) { wrap.classList.add('hidden'); estado.truques = []; estado.magias1 = []; return; }
    wrap.classList.remove('hidden');

    const subConj = (typeof subclasseConjura === 'function') && subclasseConjura(estado.subclasse);
    const disp = magiasDisponiveis(estado.classe, estado.subclasse, estado.nivel); // {truques, circulos, bonus}
    const limTruques = truquesNoNivel(estado.classe, estado.nivel, estado.subclasse);
    const ehMago = estado.classe === 'Mago';
    // Mago aprende no GRIMÓRIO (6 no nível 1, +2 por nível); as preparadas do dia (INT+nível) vivem no Modo de Jogo
    const limMagias = ehMago ? (6 + (estado.nivel - 1) * 2) : magiasNoNivel(estado.classe, estado.nivel, atributosFinais(estado), estado.subclasse);
    const prepara = !!PREPARA[estado.classe] && estado.classe !== 'Mago' && !subConj;

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
    const maxc = maxCirculo(estado.classe, estado.nivel, estado.subclasse);
    const escolas = (typeof escolasDeFiltro === 'function') ? escolasDeFiltro(estado.classe, estado.subclasse) : null;
    const escolaFiltro = (escolas && !mostrarTodasEscolas) ? escolas : null;
    let porCirculo = '';
    for (let circ = 1; circ <= maxc; circ++) {
      let naLista = disp.circulos.filter(n => MAGIAS_DETALHE[n] && MAGIAS_DETALHE[n].nivel === circ);
      if (escolaFiltro) naLista = naLista.filter(n => escolaFiltro.includes(MAGIAS_DETALHE[n].escola || '') || estado.magias1.includes(n));
      if (!naLista.length) continue;
      porCirculo += `<div class="circulo-grupo"><h5>${circ}º Círculo</h5><div class="pericias-grid">` +
        naLista.map(t => {
          const ch = estado.magias1.includes(t);
          return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-magia1="${escHtml(t)}" ${ch ? 'checked' : ''}>${rotuloMagiaCriador(t)}</label>`;
        }).join('') + `</div></div>`;
    }
    const toggleEscola = escolas
      ? `<button type="button" id="cToggleEscola" class="btn-mini">${mostrarTodasEscolas ? '🔒 Só ' + escHtml(escolas.join('/')) : '🔓 Ver todas as escolas'}</button>` : '';
    const verboMagia = ehMago ? 'grimório:' : (prepara ? 'prepare' : 'conheça');
    $('cMagias1Wrap').innerHTML = `<h4>Magias <span class="criador-hint-inline">(${verboMagia} ${limMagias} · até ${maxc}º círculo)</span> ${toggleEscola}</h4>${ehMago ? `<div class="criador-hint">📖 São as magias do grimório (tudo que o mago aprendeu). No Modo de Jogo você prepara INT + nível delas por dia.</div>` : ''}${subConj ? `<div class="criador-hint">🪄 Conjuração 1/3 (lista de Mago). Você <b>conhece</b> magias fixas; favorecidas: ${escHtml((escolas || []).join(' e '))}.</div>` : ''}${escolaFiltro ? `<div class="criador-hint">🔒 Travado em <b>${escHtml(escolaFiltro.join(' / '))}</b>.</div>` : ''}${porCirculo}`;
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
    renderGaleriaClasse();
    renderGaleriaRaca();
    renderResumoEscolha();
    renderEscolhaAtributos();
    renderPainelClasse();
    renderPericias();
    renderEstilo();
    renderMagias();
    renderPeso();
    renderPreview();
  }

  // ---------- Galerias de seleção (passos 1 e 2) ----------
  function nomeAtributo(k) {
    const a = ATRIBUTOS.find(x => x.chave === k);
    return a ? a.nome : k;
  }

  function renderGaleriaClasse() {
    const wrap = $('cGaleriaClasse');
    if (!wrap) return;
    const nome = estado.classe;
    const info = (typeof CLASSES_RESUMO !== 'undefined' && CLASSES_RESUMO[nome]) || {};
    const cls = CLASSES[CLASSE_NOME_PARA_CHAVE[nome]];
    const combos = (info.melhoresRacas || []).map(r => {
      const ri = (typeof RACAS_RESUMO !== 'undefined' && RACAS_RESUMO[r]) || {};
      return `<button type="button" class="combo-chip" data-combo-raca="${escHtml(r)}">${ri.simbolo || ''} ${escHtml(r)}</button>`;
    }).join('');
    const minis = Object.keys(CLASSE_NOME_PARA_CHAVE).map(c => {
      const i = (typeof CLASSES_RESUMO !== 'undefined' && CLASSES_RESUMO[c]) || {};
      return `<button type="button" class="mini-card${c === nome ? ' ativo' : ''}" data-galeria-classe="${escHtml(c)}">
        <span class="mini-simbolo">${i.simbolo || '❔'}</span><span class="mini-nome">${escHtml(c)}</span>
      </button>`;
    }).join('');
    wrap.innerHTML = `
      <div class="galeria-centro">
        <div class="galeria-simbolo">${info.simbolo || '❔'}</div>
        <h3 class="galeria-nome">${escHtml(nome)}</h3>
        ${info.papel ? `<div class="galeria-papel">${escHtml(info.papel)}</div>` : ''}
        ${cls ? `<div class="galeria-meta">Dado de vida ${cls.dadoVida} · Salvaguardas: ${cls.salvaguardas.join(' e ')}</div>` : ''}
        <p class="galeria-texto">${escHtml(info.resumo || '')}</p>
        ${combos ? `<div class="galeria-combos"><span class="combos-titulo">Melhores raças:</span> ${combos}</div>` : ''}
      </div>
      <div class="galeria-minis">${minis}</div>`;
    wrap.querySelectorAll('[data-galeria-classe]').forEach(b => {
      b.addEventListener('click', () => {
        estado.classe = b.dataset.galeriaClasse;
        estado.subclasse = '';
        mostrarTodasEscolas = false;
        if (criandoNovo) { estado.ouro = (typeof OURO_INICIAL !== 'undefined' && OURO_INICIAL[estado.classe]) || 0; atualizarOuroDisp(); }
        renderTudoDinamico();
      });
    });
    // atalho: clicar numa raça recomendada já a seleciona e avança para o passo 2
    wrap.querySelectorAll('[data-combo-raca]').forEach(b => {
      b.addEventListener('click', () => {
        estado.raca = b.dataset.comboRaca;
        renderTudoDinamico();
        irPasso(2);
      });
    });
  }

  function renderGaleriaRaca() {
    const wrap = $('cGaleriaRaca');
    if (!wrap) return;
    const nome = estado.raca;
    const info = (typeof RACAS_RESUMO !== 'undefined' && RACAS_RESUMO[nome]) || {};
    const det = RACAS_DETALHE[nome] || {};
    const recomendadas = ((typeof CLASSES_RESUMO !== 'undefined' && CLASSES_RESUMO[estado.classe]) || {}).melhoresRacas || [];
    const asiFixo = Object.entries(det.asi || {})
      .map(([k, v]) => `<span class="attr-chip">+${v} ${nomeAtributo(k)}</span>`).join('');
    const asiEscolha = det.escolhaAtributos
      ? `<span class="attr-chip escolha">+1 em ${det.escolhaAtributos} atributo${det.escolhaAtributos > 1 ? 's' : ''} à escolha</span>` : '';
    const meta = [
      `Deslocamento ${det.deslocamento || 30}`,
      `Tamanho ${det.tamanho || 'Médio'}`,
      det.visaoNoEscuro ? `Visão no escuro ${det.visaoNoEscuro}m` : '',
      det.idiomas ? det.idiomas.join(', ') : '',
    ].filter(Boolean).join(' · ');
    const tracos = (det.tracos || []).map(t => `<li>${escHtml(t)}</li>`).join('');
    const minis = RACAS.flatMap(g => g.opcoes).map(r => {
      const i = (typeof RACAS_RESUMO !== 'undefined' && RACAS_RESUMO[r]) || {};
      const rec = recomendadas.includes(r);
      return `<button type="button" class="mini-card${r === nome ? ' ativo' : ''}${rec ? ' recomendada' : ''}" data-galeria-raca="${escHtml(r)}" ${rec ? `title="Recomendada para ${escHtml(estado.classe)}"` : ''}>
        <span class="mini-simbolo">${i.simbolo || '❔'}</span><span class="mini-nome">${escHtml(r)}</span>${rec ? '<span class="mini-estrela">⭐</span>' : ''}
      </button>`;
    }).join('');
    wrap.innerHTML = `
      <div class="galeria-centro">
        <div class="galeria-simbolo">${info.simbolo || '❔'}</div>
        <h3 class="galeria-nome">${escHtml(nome)}</h3>
        <div class="galeria-atributos">${asiFixo}${asiEscolha}</div>
        <div class="galeria-meta">${escHtml(meta)}</div>
        <p class="galeria-texto">${escHtml(info.resumo || '')}</p>
        ${tracos ? `<ul class="galeria-tracos">${tracos}</ul>` : ''}
      </div>
      <div class="galeria-minis">${minis}</div>`;
    wrap.querySelectorAll('[data-galeria-raca]').forEach(b => {
      b.addEventListener('click', () => {
        estado.raca = b.dataset.galeriaRaca;
        renderTudoDinamico();
      });
    });
  }

  // Chips com a escolha feita, exibidos no passo 3
  function renderResumoEscolha() {
    const el = $('cResumoEscolha');
    if (!el) return;
    const ic = (typeof CLASSES_RESUMO !== 'undefined' && CLASSES_RESUMO[estado.classe]) || {};
    const ir = (typeof RACAS_RESUMO !== 'undefined' && RACAS_RESUMO[estado.raca]) || {};
    el.innerHTML = `
      <button type="button" class="resumo-chip" data-ir-passo="1">${ic.simbolo || ''} ${escHtml(estado.classe)} <span class="resumo-editar">alterar</span></button>
      <button type="button" class="resumo-chip" data-ir-passo="2">${ir.simbolo || ''} ${escHtml(estado.raca)} <span class="resumo-editar">alterar</span></button>`;
    el.querySelectorAll('[data-ir-passo]').forEach(b => {
      b.addEventListener('click', () => irPasso(Number(b.dataset.irPasso)));
    });
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
    const selG = $('cSubclasseSel'); // seletor genérico de subclasse (não-Mago)
    if (selG) selG.addEventListener('change', () => {
      estado.subclasse = selG.value; mostrarTodasEscolas = false; renderTudoDinamico();
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
        ${s.nivel >= 15 ? '<li><b>Magias de 8º Círculo (N15):</b> abre o 8º círculo (ex.: Palavra de Poder: Atordoar, Domínio de Monstros, Nuvem Mortal, Labirinto). Ganha 1 espaço de 8º.</li>' : ''}
        ${s.nivel >= 17 ? '<li><b>Magias de 9º Círculo (N17):</b> abre o 9º círculo — as magias mais poderosas do jogo (ex.: Desejo, Parada Temporal, Palavra de Poder: Matar, Portal). Ganha 1 espaço de 9º.</li>' : ''}
        ${s.nivel >= 18 ? '<li><b>Domínio de Magia (N18):</b> escolha 1 magia de 1º e 1 de 2º círculo do grimório; enquanto preparadas, conjura ambas no círculo mais baixo <b>sem gastar espaço</b>, à vontade (troca a escolha com 8h de estudo).</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Magias-Assinatura (N20):</b> escolha 2 magias de 3º círculo; ficam <b>sempre preparadas</b> (não contam no limite) e você conjura cada uma 1× no 3º círculo sem gastar espaço (recupera em descanso curto).</li>' : ''}
      </ul>
      ${subNivel ? `<label class="mago-escola"><b>Tradição Arcana (Escola de Magia)</b>
        <select id="cEscolaMago"><option value="">— Escolher escola —</option>${(SUBCLASSES['Mago'] ? SUBCLASSES['Mago'].opcoes : []).map(o => `<option value="${escHtml(o.nome)}" ${s.subclasse === o.nome ? 'selected' : ''}>${escHtml(o.nome)}</option>`).join('')}</select></label>
        <div class="criador-hint">Ao escolher uma escola, o grimório passa a mostrar só as magias dessa escola (use "ver todas" para liberar as demais).</div>` : '<div class="criador-hint">No nível 2 você escolhe sua <b>Escola de Magia</b> (especialização).</div>'}
      ${s.subclasse && typeof featuresSubclasse === 'function' && featuresSubclasse(s.subclasse, s.nivel).length ? `<h4>Poderes da ${escHtml(s.subclasse)}</h4><ul class="mago-feats">${featuresSubclasse(s.subclasse, s.nivel).map(f => `<li><b>N${f.nivel} · ${escHtml(f.nome)}:</b> ${escHtml(f.desc)}</li>`).join('')}</ul>${s.nivel >= 14 ? '<div class="criador-hint">✓ As 8 Escolas de Magia têm poderes apenas em <b>N2, N6, N10 e N14</b> — a partir do N14 sua Escola não concede novas características. Do N15 em diante, a evolução do Mago vem dos <b>círculos de magia mais altos</b> (8º no N15, 9º no N17) e dos marcos da classe (<b>Domínio de Magia</b> no N18 e <b>Magias-Assinatura</b> no N20).</div>' : ''}` : ''}
    </div>`;
  }

  // Seletor genérico de subclasse (para classes não-Mago)
  function seletorSubclasse(s) {
    const sc = SUBCLASSES[s.classe];
    if (!sc) return '';
    if (s.nivel < sc.nivel) return `<div class="criador-hint">No nível ${sc.nivel} você escolhe sua especialização.</div>`;
    return `<label class="mago-escola"><b>Especialização</b>
      <select id="cSubclasseSel"><option value="">— Escolher —</option>${sc.opcoes.map(o => `<option value="${escHtml(o.nome)}" ${s.subclasse === o.nome ? 'selected' : ''}>${escHtml(o.nome)}</option>`).join('')}</select></label>`;
  }

  // Painel específico do GUERREIRO
  function painelGuerreiro(s) {
    const attrs = atributosFinais(s);
    const pb = PB(s.nivel);
    const ataques = s.nivel >= 20 ? 4 : s.nivel >= 11 ? 3 : s.nivel >= 5 ? 2 : 1;
    const surto = s.nivel >= 17 ? 2 : (s.nivel >= 2 ? 1 : 0);
    const indom = s.nivel >= 17 ? 3 : s.nivel >= 13 ? 2 : (s.nivel >= 9 ? 1 : 0);
    const estilos = s.nivel >= 10 && s.subclasse === 'Campeão' ? 2 : 1;
    // bloco de conjuração do Cavaleiro Arcano
    let blocoConj = '';
    if (s.subclasse === 'Cavaleiro Arcano' && s.nivel >= 3) {
      const intMod = mod(attrs.int);
      const cd = 8 + pb + intMod, atq = pb + intMod;
      const maxc = maxCirculo('Guerreiro', s.nivel, 'Cavaleiro Arcano');
      const tr = truquesNoNivel('Guerreiro', s.nivel, 'Cavaleiro Arcano');
      const conh = magiasNoNivel('Guerreiro', s.nivel, attrs, 'Cavaleiro Arcano');
      blocoConj = `<h4>Conjuração Arcana (1/3)</h4>
        <div class="mago-stats">
          <div class="mago-card"><span>${cd}</span><small>CD de Magia</small></div>
          <div class="mago-card"><span>+${atq}</span><small>Ataque Mágico</small></div>
          <div class="mago-card"><span>${maxc}º</span><small>Círculo máx.</small></div>
          <div class="mago-card"><span>${tr}</span><small>Truques</small></div>
          <div class="mago-card"><span>${conh}</span><small>Magias conhecidas</small></div>
        </div>
        <div class="criador-hint">Conjura pela <b>Inteligência</b>, da lista de Mago (favorece <b>Abjuração</b> e <b>Evocação</b>). Escolha as magias na etapa de Magias.</div>`;
    }
    // bloco de manobras do Mestre de Batalha
    let blocoManobras = '';
    if (s.subclasse === 'Mestre de Batalha' && s.nivel >= 3 && typeof MANOBRAS_BATALHA !== 'undefined') {
      const dado = s.nivel >= 18 ? 'd12' : (s.nivel >= 10 ? 'd10' : 'd8');
      const nDados = s.nivel >= 15 ? 6 : (s.nivel >= 7 ? 5 : 4);
      const nMan = s.nivel >= 15 ? 9 : s.nivel >= 10 ? 7 : (s.nivel >= 7 ? 5 : 3);
      const desMod = mod(attrs.des), forMod = mod(attrs.for);
      const cdMan = 8 + pb + Math.max(forMod, desMod);
      blocoManobras = `<h4>Superioridade de Combate</h4>
        <div class="mago-stats">
          <div class="mago-card"><span>${nDados}${dado}</span><small>Dados de superioridade</small></div>
          <div class="mago-card"><span>${nMan}</span><small>Manobras conhecidas</small></div>
          <div class="mago-card"><span>${cdMan}</span><small>CD de Manobra</small></div>
        </div>
        <details class="mago-detalhes"><summary>Ver as ${Object.keys(MANOBRAS_BATALHA).length} manobras</summary>
          <ul class="mago-feats">${Object.entries(MANOBRAS_BATALHA).map(([n, d]) => `<li><b>${escHtml(n)}:</b> ${escHtml(d)}</li>`).join('')}</ul></details>`;
    }
    const featsSub = (s.subclasse && typeof featuresSubclasse === 'function') ? featuresSubclasse(s.subclasse, s.nivel) : [];
    return `<div class="classe-painel-box mago">
      <h3>⚔️ Guerreiro — Nível ${s.nivel}</h3>
      <div class="criador-hint">Mestre das armas e armaduras. Combina manobras, magia ou pura força marcial conforme o Arquétipo.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${ataques}</span><small>Ataques por ação</small></div>
        <div class="mago-card"><span>${surto}</span><small>Surto de Ação</small></div>
        <div class="mago-card"><span>${indom}</span><small>Indomável (usos)</small></div>
        <div class="mago-card"><span>1d10+${s.nivel}</span><small>Retomar o Fôlego</small></div>
      </div>
      <h4>Características de Guerreiro</h4>
      <ul class="mago-feats">
        <li><b>Estilo de Luta:</b> ${escHtml(s.estilo || '—')}${estilos === 2 ? ' (Campeão N10: ganha um 2º estilo)' : ''}. Escolha/ajuste na etapa de Habilidades.</li>
        <li><b>Retomar o Fôlego (N1):</b> ação bônus para recuperar 1d10 + ${s.nivel} PV. Recupera em descanso curto/longo.</li>
        <li><b>Surto de Ação (N2):</b> uma ação extra no turno${surto >= 2 ? ' (N17: 2 usos)' : ''}. Recupera em descanso curto/longo.</li>
        ${s.nivel >= 5 ? `<li><b>Ataque Extra (N5/11/20):</b> ataca <b>${ataques}×</b> ao usar a ação de Ataque.</li>` : ''}
        ${s.nivel >= 9 ? `<li><b>Indomável (N9/13/17):</b> rerrole uma salvaguarda falhada — <b>${indom}×</b> por descanso longo.</li>` : ''}
      </ul>
      ${seletorSubclasse(s)}
      ${featsSub.length ? `<h4>Poderes do ${escHtml(s.subclasse)}</h4><ul class="mago-feats">${featsSub.map(f => `<li><b>N${f.nivel} · ${escHtml(f.nome)}:</b> ${escHtml(f.desc)}</li>`).join('')}</ul>` : ''}
      ${blocoConj}${blocoManobras}
    </div>`;
  }

  // Painel específico do LADINO
  function painelLadino(s) {
    const attrs = atributosFinais(s);
    const pb = PB(s.nivel);
    const furtivo = Math.ceil(s.nivel / 2);
    const pericias = s.nivel >= 6 ? 4 : 2;
    // bloco de conjuração do Trapaceiro Arcano
    let blocoConj = '';
    if (s.subclasse === 'Trapaceiro Arcano' && s.nivel >= 3) {
      const intMod = mod(attrs.int);
      const cd = 8 + pb + intMod, atq = pb + intMod;
      const maxc = maxCirculo('Ladino', s.nivel, 'Trapaceiro Arcano');
      const tr = truquesNoNivel('Ladino', s.nivel, 'Trapaceiro Arcano');
      const conh = magiasNoNivel('Ladino', s.nivel, attrs, 'Trapaceiro Arcano');
      blocoConj = `<h4>Conjuração Arcana (1/3)</h4>
        <div class="mago-stats">
          <div class="mago-card"><span>${cd}</span><small>CD de Magia</small></div>
          <div class="mago-card"><span>+${atq}</span><small>Ataque Mágico</small></div>
          <div class="mago-card"><span>${maxc}º</span><small>Círculo máx.</small></div>
          <div class="mago-card"><span>${tr}</span><small>Truques</small></div>
          <div class="mago-card"><span>${conh}</span><small>Magias conhecidas</small></div>
        </div>
        <div class="criador-hint">Conjura pela <b>Inteligência</b>, da lista de Mago (favorece <b>Encantamento</b> e <b>Ilusão</b>; Mão Mágica é truque obrigatório). Escolha as magias na etapa de Magias.</div>`;
    }
    const featsSub = (s.subclasse && typeof featuresSubclasse === 'function') ? featuresSubclasse(s.subclasse, s.nivel) : [];
    return `<div class="classe-painel-box mago">
      <h3>🗡️ Ladino — Nível ${s.nivel}</h3>
      <div class="criador-hint">Especialista em perícia e precisão. Causa dano extra explorando brechas e age com astúcia.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${furtivo}d6</span><small>Ataque Furtivo</small></div>
        <div class="mago-card"><span>${pericias}</span><small>Perícias dobradas</small></div>
      </div>
      <h4>Características de Ladino</h4>
      <ul class="mago-feats">
        <li><b>Ataque Furtivo (${furtivo}d6):</b> 1×/turno, +${furtivo}d6 de dano quando tem vantagem ou um aliado está adjacente ao alvo (com arma de acuidade ou à distância).</li>
        <li><b>Perícia (N1${s.nivel >= 6 ? '/6' : ''}):</b> proficiência dobrada em ${pericias} perícias (ou ferramentas de ladrão).</li>
        ${s.nivel >= 2 ? '<li><b>Ação Ardilosa (N2):</b> Disparar, Desengajar ou Esconder-se como ação bônus a cada turno.</li>' : ''}
        ${s.nivel >= 5 ? '<li><b>Esquiva Sobrenatural (N5):</b> reação para reduzir à metade o dano de um ataque que você enxerga.</li>' : ''}
        ${s.nivel >= 7 ? '<li><b>Evasão (N7):</b> em salvas de Destreza por área, metade do dano ao falhar e nenhum ao passar.</li>' : ''}
        ${s.nivel >= 11 ? '<li><b>Talento Confiável (N11):</b> em perícias com proficiência, qualquer d20 ≤ 9 conta como 10.</li>' : ''}
        ${s.nivel >= 14 ? '<li><b>Sentido às Cegas (N14):</b> localiza criaturas ocultas/invisíveis a até 3m se puder ouvir.</li>' : ''}
        ${s.nivel >= 15 ? '<li><b>Mente Escorregadia (N15):</b> proficiência em salvaguardas de Sabedoria.</li>' : ''}
        ${s.nivel >= 18 ? '<li><b>Elusivo (N18):</b> ataques não têm vantagem contra você (a menos que incapacitado).</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Golpe de Sorte (N20):</b> transforma um erro em acerto ou um teste falho em 20 natural — 1×/descanso.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}
      ${featsSub.length ? `<h4>Poderes do ${escHtml(s.subclasse)}</h4><ul class="mago-feats">${featsSub.map(f => `<li><b>N${f.nivel} · ${escHtml(f.nome)}:</b> ${escHtml(f.desc)}</li>`).join('')}</ul>` : ''}
      ${blocoConj}
    </div>`;
  }

  // Painel específico do CLÉRIGO
  function painelClerigo(s) {
    const attrs = atributosFinais(s);
    const sabMod = mod(attrs.sab);
    const pb = PB(s.nivel);
    const cd = 8 + pb + sabMod, atq = pb + sabMod;
    const truques = truquesNoNivel('Clérigo', s.nivel);
    const maxc = maxCirculo('Clérigo', s.nivel);
    const preparadas = Math.max(1, sabMod + s.nivel);
    const canalizar = s.nivel >= 18 ? 3 : (s.nivel >= 6 ? 2 : (s.nivel >= 2 ? 1 : 0));
    const nd = s.nivel >= 17 ? '4' : s.nivel >= 14 ? '3' : s.nivel >= 11 ? '2' : s.nivel >= 8 ? '1' : (s.nivel >= 5 ? '½' : null);
    const featsSub = (s.subclasse && typeof featuresSubclasse === 'function') ? featuresSubclasse(s.subclasse, s.nivel) : [];
    return `<div class="classe-painel-box mago">
      <h3>✨ Clérigo — Nível ${s.nivel}</h3>
      <div class="criador-hint">Conjurador divino que <b>prepara</b> magias da lista inteira (Sabedoria + nível por dia) e canaliza o poder do seu domínio.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${cd}</span><small>CD de Magia</small></div>
        <div class="mago-card"><span>+${atq}</span><small>Ataque Mágico</small></div>
        <div class="mago-card"><span>${maxc}º</span><small>Círculo máx.</small></div>
        <div class="mago-card"><span>${truques}</span><small>Truques</small></div>
        <div class="mago-card"><span>${preparadas}</span><small>Preparadas/dia</small></div>
        <div class="mago-card"><span>${canalizar}</span><small>Canalizar Divindade</small></div>
      </div>
      <h4>Características de Clérigo</h4>
      <ul class="mago-feats">
        <li><b>Conjuração Divina:</b> prepara ${preparadas} magias (SAB ${sabMod >= 0 ? '+' : ''}${sabMod} + nível ${s.nivel}) da lista inteira de Clérigo por dia. O domínio adiciona magias sempre preparadas.</li>
        ${s.nivel >= 2 ? `<li><b>Canalizar Divindade (N2/6/18):</b> ${canalizar} uso(s) por descanso curto/longo — Expulsar Mortos-Vivos + a opção do seu domínio.</li>` : ''}
        ${nd ? `<li><b>Destruir Mortos-Vivos (N5+):</b> ao Expulsar, mortos-vivos com ND ≤ <b>${nd}</b> são destruídos no ato.</li>` : ''}
        ${s.nivel >= 10 ? `<li><b>Intervenção Divina (N10):</b> role d100; se ≤ ${s.nivel} (seu nível), a divindade intervém${s.nivel >= 20 ? ' — <b>automático no N20</b>' : ''}.</li>` : ''}
      </ul>
      ${seletorSubclasse(s)}
      ${featsSub.length ? `<h4>Poderes do ${escHtml(s.subclasse)}</h4><ul class="mago-feats">${featsSub.map(f => `<li><b>N${f.nivel} · ${escHtml(f.nome)}:</b> ${escHtml(f.desc)}</li>`).join('')}</ul>` : '<div class="criador-hint">No nível 1, escolha seu <b>Domínio Divino</b> acima para ver os poderes.</div>'}
    </div>`;
  }

  // Helper: cartões de conjuração (classe que conjura por um atributo)
  function cardsConj(classe, s, attrChave, rotuloPrep) {
    const attrs = atributosFinais(s);
    const m = mod(attrs[attrChave]);
    const pb = PB(s.nivel);
    const maxc = maxCirculo(classe, s.nivel);
    const truques = truquesNoNivel(classe, s.nivel);
    return `<div class="mago-stats">
      <div class="mago-card"><span>${8 + pb + m}</span><small>CD de Magia</small></div>
      <div class="mago-card"><span>+${pb + m}</span><small>Ataque Mágico</small></div>
      <div class="mago-card"><span>${maxc}º</span><small>Círculo máx.</small></div>
      ${truques ? `<div class="mago-card"><span>${truques}</span><small>Truques</small></div>` : ''}
      ${rotuloPrep ? `<div class="mago-card"><span>${rotuloPrep.valor}</span><small>${rotuloPrep.rotulo}</small></div>` : ''}
    </div>`;
  }
  function blocoSubFeats(s) {
    const featsSub = (s.subclasse && typeof featuresSubclasse === 'function') ? featuresSubclasse(s.subclasse, s.nivel) : [];
    return featsSub.length ? `<h4>Poderes do ${escHtml(s.subclasse)}</h4><ul class="mago-feats">${featsSub.map(f => `<li><b>N${f.nivel} · ${escHtml(f.nome)}:</b> ${escHtml(f.desc)}</li>`).join('')}</ul>` : '';
  }

  // BARDO — conjurador (conhece magias), Carisma
  function painelBardo(s) {
    const conh = magiasNoNivel('Bardo', s.nivel, atributosFinais(s));
    const insp = s.nivel >= 15 ? 'd12' : s.nivel >= 10 ? 'd10' : (s.nivel >= 5 ? 'd8' : 'd6');
    const usos = Math.max(1, mod(atributosFinais(s).car));
    return `<div class="classe-painel-box mago"><h3>🎵 Bardo — Nível ${s.nivel}</h3>
      <div class="criador-hint">Conjurador versátil (Carisma) que inspira aliados e conhece magias de qualquer fonte (Segredos Mágicos).</div>
      ${cardsConj('Bardo', s, 'car', { valor: conh, rotulo: 'Magias conhecidas' })}
      <h4>Características de Bardo</h4>
      <ul class="mago-feats">
        <li><b>Inspiração de Bardo (${insp}):</b> ação bônus, dá um dado a um aliado (${usos} usos, recupera em descanso ${s.nivel >= 5 ? 'curto/longo' : 'longo'}).</li>
        ${s.nivel >= 2 ? '<li><b>Versatilidade (N2):</b> soma metade da proficiência a testes sem proficiência. <b>Recuperação de Canção</b> num descanso curto.</li>' : ''}
        ${s.nivel >= 3 ? '<li><b>Especialização (N3/10):</b> dobra a proficiência em perícias escolhidas.</li>' : ''}
        ${s.nivel >= 6 ? '<li><b>Contraencanto (N6):</b> usa música para dar vantagem contra medo e enfeitiçamento a quem está perto.</li>' : ''}
        ${s.nivel >= 10 ? '<li><b>Segredos Mágicos (N10/14/18):</b> aprende magias de qualquer classe.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Inspiração Suprema (N20):</b> recupera toda a Inspiração ao rolar iniciativa sem nenhuma.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // BÁRBARO — marcial
  function painelBarbaro(s) {
    const attrs = atributosFinais(s);
    const furores = s.nivel >= 20 ? '∞' : s.nivel >= 17 ? 6 : s.nivel >= 12 ? 5 : s.nivel >= 6 ? 4 : (s.nivel >= 3 ? 3 : 2);
    const bonus = s.nivel >= 16 ? 4 : (s.nivel >= 9 ? 3 : 2);
    const ataques = s.nivel >= 5 ? 2 : 1;
    const critico = s.nivel >= 17 ? 3 : s.nivel >= 13 ? 2 : (s.nivel >= 9 ? 1 : 0);
    return `<div class="classe-painel-box mago"><h3>🪓 Bárbaro — Nível ${s.nivel}</h3>
      <div class="criador-hint">Guerreiro primal movido pela Fúria. Resistente e devastador no corpo a corpo.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${furores}</span><small>Furores/descanso</small></div>
        <div class="mago-card"><span>+${bonus}</span><small>Dano na Fúria</small></div>
        <div class="mago-card"><span>${10 + mod(attrs.des) + mod(attrs.con)}</span><small>CA sem armadura</small></div>
        <div class="mago-card"><span>${ataques}</span><small>Ataques por ação</small></div>
      </div>
      <h4>Características de Bárbaro</h4>
      <ul class="mago-feats">
        <li><b>Fúria:</b> ação bônus — +${bonus} de dano corpo a corpo de Força, vantagem em testes/salvas de Força e resistência a concussão/perfurante/cortante (1 min).</li>
        <li><b>Defesa sem Armadura:</b> CA = 10 + Destreza + Constituição.</li>
        ${s.nivel >= 2 ? '<li><b>Ataque Descuidado (N2):</b> vantagem nos ataques de Força, mas inimigos também têm contra você. <b>Sentido de Perigo</b> (vantagem em salvas de Des).</li>' : ''}
        ${s.nivel >= 5 ? '<li><b>Movimento Rápido (N5):</b> +3m de deslocamento sem armadura pesada.</li>' : ''}
        ${s.nivel >= 7 ? '<li><b>Instinto Selvagem (N7):</b> vantagem na iniciativa.</li>' : ''}
        ${critico ? `<li><b>Crítico Selvagem (N9/13/17):</b> +${critico} dado(s) de dano da arma em acertos críticos.</li>` : ''}
        ${s.nivel >= 11 ? '<li><b>Fúria Implacável (N11):</b> ao cair a 0 PV durante a Fúria, faz salva de CON para ficar com 1.</li>' : ''}
        ${s.nivel >= 18 ? '<li><b>Corpo Indomável (N18):</b> vantagem em salvas de Força.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Força Primitiva (N20):</b> Força e Constituição sobem para 24 (máx. 24).</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // DRUIDA — conjurador que prepara (Sabedoria)
  function painelDruida(s) {
    const prep = Math.max(1, mod(atributosFinais(s).sab) + s.nivel);
    const ndForma = s.nivel >= 8 ? '1 (qualquer desloc.)' : (s.nivel >= 4 ? '½ (sem voo)' : '¼ (sem voo/natação)');
    return `<div class="classe-painel-box mago"><h3>🌿 Druida — Nível ${s.nivel}</h3>
      <div class="criador-hint">Conjurador da natureza (Sabedoria) que <b>prepara</b> magias da lista inteira e assume Forma Selvagem.</div>
      ${cardsConj('Druida', s, 'sab', { valor: prep, rotulo: 'Preparadas/dia' })}
      <h4>Características de Druida</h4>
      <ul class="mago-feats">
        <li><b>Druídico:</b> idioma secreto dos druidas.</li>
        ${s.nivel >= 2 ? `<li><b>Forma Selvagem (N2):</b> 2 usos/descanso — vira feras de até ND ${ndForma}.</li>` : ''}
        ${s.nivel >= 18 ? '<li><b>Conjuração Atemporal (N18):</b> pode conjurar magias enquanto estiver em Forma Selvagem.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Arquidruida (N20):</b> usos ilimitados de Forma Selvagem; ignora componentes V/S de magias de druida.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // MONGE — marcial (Ki)
  function painelMonge(s) {
    const attrs = atributosFinais(s);
    const pb = PB(s.nivel);
    const ki = s.nivel >= 2 ? s.nivel : 0;
    const am = s.nivel >= 17 ? 'd10' : s.nivel >= 11 ? 'd8' : (s.nivel >= 5 ? 'd6' : 'd4');
    const desloc = s.nivel >= 18 ? 9 : s.nivel >= 14 ? 7.5 : s.nivel >= 10 ? 6 : s.nivel >= 6 ? 4.5 : (s.nivel >= 2 ? 3 : 0);
    const ataques = s.nivel >= 5 ? 2 : 1;
    return `<div class="classe-painel-box mago"><h3>👊 Monge — Nível ${s.nivel}</h3>
      <div class="criador-hint">Artista marcial que canaliza o Ki. Rápido, preciso e difícil de acertar.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${ki}</span><small>Pontos de Ki</small></div>
        <div class="mago-card"><span>${am}</span><small>Artes Marciais</small></div>
        <div class="mago-card"><span>${10 + mod(attrs.des) + mod(attrs.sab)}</span><small>CA sem armadura</small></div>
        <div class="mago-card"><span>${8 + pb + mod(attrs.sab)}</span><small>CD de Ki</small></div>
        ${desloc ? `<div class="mago-card"><span>+${desloc}m</span><small>Deslocamento</small></div>` : ''}
        <div class="mago-card"><span>${ataques}</span><small>Ataques por ação</small></div>
      </div>
      <h4>Características de Monge</h4>
      <ul class="mago-feats">
        <li><b>Artes Marciais:</b> usa Destreza com armas de monge/desarmado (dano ${am}); ataque desarmado bônus a cada ataque.</li>
        ${s.nivel >= 2 ? '<li><b>Ki (N2):</b> Rajada de Golpes (2 ataques bônus), Defesa Paciente (Esquiva) e Passo do Vento (Disparar/Desengajar). Recupera em descanso curto.</li>' : ''}
        ${s.nivel >= 3 ? '<li><b>Defletir Projéteis (N3):</b> reação para reduzir/anular dano de ataques à distância.</li>' : ''}
        ${s.nivel >= 5 ? '<li><b>Golpe Atordoante (N5):</b> gasta Ki ao acertar para atordoar (salva de CON).</li>' : ''}
        ${s.nivel >= 7 ? '<li><b>Evasão / Quietude da Mente (N7):</b> metade do dano em área; remove enfeitiçar/medo de si.</li>' : ''}
        ${s.nivel >= 10 ? '<li><b>Purificar o Corpo (N10):</b> imune a doenças e veneno.</li>' : ''}
        ${s.nivel >= 14 ? '<li><b>Alma de Diamante (N14):</b> proficiência em todas as salvaguardas; gasta Ki para repetir uma falha.</li>' : ''}
        ${s.nivel >= 18 ? '<li><b>Corpo Vazio (N18):</b> gasta Ki para ficar invisível e resistente; ou Astral.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Mente e Corpo Perfeitos (N20):</b> Força, Destreza e Sabedoria viram no mínimo... +atributos lendários.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // PALADINO — meio-conjurador que prepara (Carisma)
  function painelPaladino(s) {
    const prep = s.nivel >= 2 ? Math.max(1, Math.floor(s.nivel / 2) + mod(atributosFinais(s).car)) : 0;
    const pool = 5 * s.nivel;
    const ataques = s.nivel >= 5 ? 2 : 1;
    return `<div class="classe-painel-box mago"><h3>🛡️ Paladino — Nível ${s.nivel}</h3>
      <div class="criador-hint">Guerreiro sagrado (Carisma). Combina marcial, magia e auras; pune inimigos com energia divina.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${pool}</span><small>Cura pelas Mãos (PV)</small></div>
        <div class="mago-card"><span>${ataques}</span><small>Ataques por ação</small></div>
        ${s.nivel >= 2 ? cardsConjInline('Paladino', s, 'car', { valor: prep, rotulo: 'Preparadas/dia' }) : '<div class="mago-card"><span>N2</span><small>Conjuração começa</small></div>'}
      </div>
      <h4>Características de Paladino</h4>
      <ul class="mago-feats">
        <li><b>Sentido Divino:</b> detecta celestiais, corruptores e mortos-vivos. <b>Cura pelas Mãos:</b> reserva de ${pool} PV ao toque.</li>
        ${s.nivel >= 2 ? '<li><b>Punição Divina (N2):</b> ao acertar corpo a corpo, gasta espaço de magia para +2d8 radiante (+1d8 por círculo acima do 1º). <b>Estilo de Luta</b>.</li>' : ''}
        ${s.nivel >= 3 ? '<li><b>Saúde Divina (N3):</b> imune a doenças.</li>' : ''}
        ${s.nivel >= 6 ? '<li><b>Aura de Proteção (N6):</b> você e aliados a 3m (9m no N18) somam seu Carisma às salvaguardas.</li>' : ''}
        ${s.nivel >= 10 ? '<li><b>Aura de Coragem (N10):</b> você e aliados perto não podem ser amedrontados.</li>' : ''}
        ${s.nivel >= 11 ? '<li><b>Punição Divina Aprimorada (N11):</b> todo ataque corpo a corpo causa +1d8 radiante.</li>' : ''}
        ${s.nivel >= 14 ? '<li><b>Toque Purificador (N14):</b> usa Cura pelas Mãos para remover venenos/doenças.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // PATRULHEIRO — meio-conjurador (conhece, Sabedoria)
  function painelPatrulheiro(s) {
    const conh = s.nivel >= 2 ? magiasNoNivel('Patrulheiro', s.nivel, atributosFinais(s)) : 0;
    const ataques = s.nivel >= 5 ? 2 : 1;
    return `<div class="classe-painel-box mago"><h3>🏹 Patrulheiro — Nível ${s.nivel}</h3>
      <div class="criador-hint">Caçador e explorador (Sabedoria). Meio-conjurador que domina o território e os inimigos prediletos.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${ataques}</span><small>Ataques por ação</small></div>
        ${s.nivel >= 2 ? cardsConjInline('Patrulheiro', s, 'sab', { valor: conh, rotulo: 'Magias conhecidas' }) : '<div class="mago-card"><span>N2</span><small>Conjuração começa</small></div>'}
      </div>
      <h4>Características de Patrulheiro</h4>
      <ul class="mago-feats">
        <li><b>Inimigo Predileto:</b> vantagem para rastrear/lembrar de um tipo de criatura; idioma extra.</li>
        <li><b>Explorador Nato:</b> deslocamento e furtividade no terreno favorito; viagem eficiente.</li>
        ${s.nivel >= 3 ? '<li><b>Consciência Primitiva (N3):</b> gasta espaço para detectar tipos de criatura por perto.</li>' : ''}
        ${s.nivel >= 8 ? '<li><b>Passos Ágeis (N8):</b> ignora terreno difícil natural.</li>' : ''}
        ${s.nivel >= 10 ? '<li><b>Esconder-se em Plena Vista (N10):</b> camuflagem que dá +10 em Furtividade parado.</li>' : ''}
        ${s.nivel >= 14 ? '<li><b>Desaparecer (N14):</b> Esconder-se como ação bônus; não pode ser rastreado.</li>' : ''}
        ${s.nivel >= 18 ? '<li><b>Sentidos Ferinos (N18):</b> percebe criaturas invisíveis/ocultas por perto.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Caçador Supremo (N20):</b> ataques extras contra o inimigo predileto.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // FEITICEIRO — conjurador (conhece, Carisma)
  function painelFeiticeiro(s) {
    const conh = magiasNoNivel('Feiticeiro', s.nivel, atributosFinais(s));
    const pontos = s.nivel >= 2 ? s.nivel : 0;
    const metamagia = s.nivel >= 17 ? 4 : s.nivel >= 10 ? 3 : (s.nivel >= 3 ? 2 : 0);
    return `<div class="classe-painel-box mago"><h3>✴️ Feiticeiro — Nível ${s.nivel}</h3>
      <div class="criador-hint">Magia inata (Carisma). Molda magias com Metamagia gastando Pontos de Feitiçaria.</div>
      ${cardsConj('Feiticeiro', s, 'car', { valor: conh, rotulo: 'Magias conhecidas' })}
      <h4>Características de Feiticeiro</h4>
      <ul class="mago-feats">
        ${s.nivel >= 2 ? `<li><b>Fontes de Feitiçaria (N2):</b> ${pontos} pontos — converte entre pontos e espaços de magia.</li>` : ''}
        ${metamagia ? `<li><b>Metamagia (N3/10/17):</b> conhece ${metamagia} opções (ex.: Magia Gêmea, Magia Acelerada, Magia Sutil).</li>` : ''}
        ${s.nivel >= 20 ? '<li><b>Restauração de Feitiçaria (N20):</b> recupera 4 Pontos de Feitiçaria num descanso curto.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // BRUXO — conjurador de pacto (Carisma)
  function painelBruxo(s) {
    const attrs = atributosFinais(s);
    const pb = PB(s.nivel);
    const car = mod(attrs.car);
    const pacto = (CLASSES.bruxo.niveis.find(n => n.nivel === s.nivel) || {}).pactoBruxo || { slots: 1, nivel: 1 };
    const truques = truquesNoNivel('Bruxo', s.nivel);
    const conh = magiasNoNivel('Bruxo', s.nivel, attrs);
    const invoc = s.nivel >= 18 ? 8 : s.nivel >= 15 ? 7 : s.nivel >= 12 ? 6 : s.nivel >= 9 ? 5 : s.nivel >= 7 ? 4 : s.nivel >= 5 ? 3 : (s.nivel >= 2 ? 2 : 0);
    return `<div class="classe-painel-box mago"><h3>🜏 Bruxo — Nível ${s.nivel}</h3>
      <div class="criador-hint">Poder vindo de um Patrono (Carisma). Poucos espaços, mas que recarregam em descanso curto e sobem ao círculo máximo.</div>
      <div class="mago-stats">
        <div class="mago-card"><span>${8 + pb + car}</span><small>CD de Magia</small></div>
        <div class="mago-card"><span>+${pb + car}</span><small>Ataque Mágico</small></div>
        <div class="mago-card"><span>${pacto.slots}×${pacto.nivel}º</span><small>Espaços de Pacto</small></div>
        <div class="mago-card"><span>${truques}</span><small>Truques</small></div>
        <div class="mago-card"><span>${conh}</span><small>Magias conhecidas</small></div>
        <div class="mago-card"><span>${invoc}</span><small>Invocações</small></div>
      </div>
      <h4>Características de Bruxo</h4>
      <ul class="mago-feats">
        <li><b>Magia de Pacto:</b> ${pacto.slots} espaço(s), todos de ${pacto.nivel}º círculo, recuperados em <b>descanso curto</b>.</li>
        ${s.nivel >= 2 ? `<li><b>Invocações Mágicas (N2):</b> ${invoc} invocações (ex.: Visão do Diabo, Explosão Agonizante, Máscara de Mil Faces).</li>` : ''}
        ${s.nivel >= 3 ? '<li><b>Pacto Místico (N3):</b> escolhe Corrente (familiar), Lâmina (arma de pacto) ou Tomo (grimório de truques).</li>' : ''}
        ${s.nivel >= 11 ? '<li><b>Arcano Místico (N11+):</b> 1 magia de 6º (depois 7º/8º/9º) que conjura 1×/descanso longo sem espaço.</li>' : ''}
        ${s.nivel >= 20 ? '<li><b>Mestre dos Mistérios (N20):</b> recupera todos os espaços de pacto 1×/dia rapidamente.</li>' : ''}
      </ul>
      ${seletorSubclasse(s)}${blocoSubFeats(s)}</div>`;
  }

  // cartões de conjuração "soltos" (para encaixar dentro de um grid já aberto)
  function cardsConjInline(classe, s, attrChave, prep) {
    const attrs = atributosFinais(s);
    const m = mod(attrs[attrChave]);
    const pb = PB(s.nivel);
    const maxc = maxCirculo(classe, s.nivel);
    return `<div class="mago-card"><span>${8 + pb + m}</span><small>CD de Magia</small></div>
      <div class="mago-card"><span>${maxc}º</span><small>Círculo máx.</small></div>
      <div class="mago-card"><span>${prep.valor}</span><small>${prep.rotulo}</small></div>`;
  }

  // Mapa de painéis específicos (todas as 12 classes do PHB)
  const PAINEIS_CLASSE = {
    'Mago': painelMago,
    'Guerreiro': painelGuerreiro,
    'Ladino': painelLadino,
    'Clérigo': painelClerigo,
    'Bardo': painelBardo,
    'Bárbaro': painelBarbaro,
    'Druida': painelDruida,
    'Monge': painelMonge,
    'Paladino': painelPaladino,
    'Patrulheiro': painelPatrulheiro,
    'Feiticeiro': painelFeiticeiro,
    'Bruxo': painelBruxo,
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

    // Magias automáticas (só para conjuradores)
    if (typeof ehConjurador === 'function' && ehConjurador(s.classe, s.nivel, s.subclasse)) {
      const limTruques = truquesNoNivel(s.classe, s.nivel, s.subclasse);
      const limMagias = s.classe === 'Mago' ? (6 + (s.nivel - 1) * 2) : magiasNoNivel(s.classe, s.nivel, atributosFinais(s), s.subclasse);
      const banco = MAGIAS[s.classe] || { truques: [], nivel1: [] };
      s.truques = [...banco.truques].sort(() => Math.random() - 0.5).slice(0, limTruques);
      s.magias1 = [...banco.nivel1].sort(() => Math.random() - 0.5).slice(0, limMagias);
    }
    renderTudoDinamico();
  }

  // ---------- Preencher campos a partir do estado ----------
  function preencherCampos() {
    $('cNome').value = estado.nome;
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
    const conj = typeof ehConjurador === 'function' && ehConjurador(s.classe, s.nivel, s.subclasse);
    const temEstilo = CLASSES_COM_ESTILO.includes(s.classe);
    const truquesLimpos = conj ? s.truques : [];
    const magiasLimpas = conj ? s.magias1 : [];
    const estiloLimpo = temEstilo ? s.estilo : '';
    const equip = [s.armadura + (s.escudo ? ' + Escudo' : ''), ...s.itens].filter(Boolean).join(', ');
    const magiasTxt = [
      truquesLimpos.length ? 'Truques: ' + truquesLimpos.join(', ') : '',
      magiasLimpas.length ? '1º Círculo: ' + magiasLimpas.join(', ') : '',
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
      estilo: estiloLimpo,
      subclasse: s.subclasse || '',
      pericias: [...c.perProf],
      truques: truquesLimpos,
      magias1: magiasLimpas,
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
      s.subclasse = f.subclasse || '';
      const _conj = typeof ehConjurador === 'function' && ehConjurador(s.classe, s.nivel, s.subclasse);
      s.estilo = CLASSES_COM_ESTILO.includes(s.classe) ? (f.estilo || '') : '';
      s.truques = _conj ? (f.truques || []) : [];
      s.magias1 = _conj ? (f.magias1 || []) : [];
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
  const TOTAL_PASSOS = 5;
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
    // Antecedente
    $('cAntecedente').innerHTML = Object.keys(ANTECEDENTES).map(a => `<option value="${a}">${a}</option>`).join('');
    // Nível
    $('cNivel').innerHTML = Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}">Nível ${i + 1}</option>`).join('');
    // Armadura
    $('cArmadura').innerHTML = Object.keys(ARMADURAS).map(a => `<option value="${a}">${a}</option>`).join('');

    // Listeners
    $('cNome').addEventListener('input', () => { estado.nome = $('cNome').value; renderPreview(); });
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
