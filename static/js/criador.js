// =====================================================
// CRIADOR DE PERSONAGEM - preview ao vivo, regras 5e, gerador automático
// Compartilhado por Mestre e Jogador. Expõe window.Criador.abrir(ficha, opts)
// =====================================================
const Criador = (function () {
  const $ = id => document.getElementById(id);
  let ctx = null; // { aoSalvar, aoExcluir, original }
  let estado = null;

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
        <div class="pv-linha">${c.deslocamento}m · ${c.tamanho}${c.visaoNoEscuro ? ` · Visão no escuro ${c.visaoNoEscuro}m` : ''}</div>
        <div class="pv-linha"><strong>Idiomas:</strong> ${c.idiomas.map(escHtml).join(', ')}</div>
      </div>
      <div class="pv-bloco"><h4>Perícias</h4><div class="pv-pericias">${periciasHtml}</div></div>
      ${c.tracos.length ? `<div class="pv-bloco"><h4>Traços Raciais</h4><ul>${c.tracos.map(t => `<li>${escHtml(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="pv-bloco"><h4>Características de Classe (Nível ${s.nivel})</h4><ul>${caracteristicas}</ul></div>
      ${s.estilo ? `<div class="pv-bloco"><h4>Estilo de Combate</h4><div class="pv-linha">${escHtml(s.estilo)}: ${escHtml(ESTILOS_LUTA[s.estilo] || '')}</div></div>` : ''}
      ${conjHtml}
      <div class="pv-bloco"><h4>Equipamento</h4><div class="pv-linha"><strong>Armadura:</strong> ${escHtml(s.armadura)}${s.escudo ? ' + Escudo' : ''}</div><div class="pv-linha"><strong>Itens:</strong> ${itensHtml}</div><div class="pv-linha"><strong>Ouro:</strong> ${s.ouro} po</div></div>
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
    $('cEstilo').innerHTML = '<option value="">— Selecione —</option>' +
      Object.keys(ESTILOS_LUTA).map(e => `<option value="${e}" ${estado.estilo === e ? 'selected' : ''}>${e} — ${ESTILOS_LUTA[e]}</option>`).join('');
  }

  function contagemMagias() {
    const cj = CONJURACAO[estado.classe];
    if (!cj || estado.nivel < (cj.desdeNivel || 1)) return null;
    const attrs = atributosFinais(estado);
    const m = mod(attrs[cj.atributo]);
    let nivel1;
    if (cj.modo === 'prepara') nivel1 = Math.max(1, m + estado.nivel);
    else nivel1 = cj.conhece || 0;
    return { truques: cj.truques || 0, nivel1, modo: cj.modo };
  }

  function renderMagias() {
    const cont = contagemMagias();
    const wrap = $('cMagiasWrap');
    if (!cont) { wrap.classList.add('hidden'); estado.truques = []; estado.magias1 = []; return; }
    wrap.classList.remove('hidden');
    const banco = MAGIAS[estado.classe] || { truques: [], nivel1: [] };

    // truque racial automático
    const r = RACAS_DETALHE[estado.raca] || {};
    let truqueRacial = '';
    if (r.truqueExtra && r.truqueExtra.nome) truqueRacial = r.truqueExtra.nome;

    estado.truques = estado.truques.filter(t => banco.truques.includes(t));
    estado.magias1 = estado.magias1.filter(t => banco.nivel1.includes(t));

    const limTruques = cont.truques;
    const limMagias = cont.nivel1;

    $('cTruquesWrap').innerHTML = limTruques > 0
      ? `<h4>Truques <span class="criador-hint-inline">(escolha ${limTruques})</span></h4>
         ${truqueRacial ? `<div class="criador-hint">+ Truque racial automático: <strong>${escHtml(truqueRacial)}</strong></div>` : ''}
         <div class="pericias-grid">` + banco.truques.map(t => {
            const ch = estado.truques.includes(t);
            return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-truque="${escHtml(t)}" ${ch ? 'checked' : ''}>${escHtml(t)}</label>`;
          }).join('') + `</div>`
      : (truqueRacial ? `<div class="criador-hint">Truque racial: <strong>${escHtml(truqueRacial)}</strong></div>` : '');

    $('cMagias1Wrap').innerHTML = `<h4>Magias de 1º Círculo <span class="criador-hint-inline">(${cont.modo === 'prepara' ? 'prepare' : 'conheça'} ${limMagias})</span></h4>
      <div class="pericias-grid">` + banco.nivel1.map(t => {
        const ch = estado.magias1.includes(t);
        return `<label class="check-chip ${ch ? 'on' : ''}"><input type="checkbox" data-magia1="${escHtml(t)}" ${ch ? 'checked' : ''}>${escHtml(t)}</label>`;
      }).join('') + `</div>`;

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

  function renderItens() {
    const wrap = $('cLojaWrap');
    const opts = ITENS_PADRAO.map(i => `<option value="${escHtml(i.nome)}">${escHtml(i.nome)} (${escHtml(i.preco)})</option>`).join('');
    wrap.innerHTML = `
      <div class="criador-add-item">
        <select id="cItemSelect">${opts}</select>
        <button type="button" id="cAddItem" class="btn-mini">+ Adicionar</button>
      </div>
      <div id="cItensChips" class="chips"></div>`;
    $('cAddItem').addEventListener('click', () => {
      const v = $('cItemSelect').value;
      if (v && !estado.itens.includes(v)) estado.itens.push(v);
      renderChipsItens();
      renderPreview();
    });
    renderChipsItens();
  }
  function renderChipsItens() {
    $('cItensChips').innerHTML = estado.itens.map(i =>
      `<span class="chip">${escHtml(i)} <button type="button" data-rem="${escHtml(i)}">×</button></span>`).join('');
    $('cItensChips').querySelectorAll('[data-rem]').forEach(b => {
      b.addEventListener('click', () => {
        estado.itens = estado.itens.filter(x => x !== b.dataset.rem);
        renderChipsItens(); renderPreview();
      });
    });
  }

  function renderTudoDinamico() {
    renderEscolhaAtributos();
    renderPericias();
    renderEstilo();
    renderMagias();
    renderPreview();
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
    if (f) {
      s.nome = f.nome || '';
      s.raca = f.raca && RACAS_DETALHE[f.raca] ? f.raca : 'Humano';
      s.classe = f.classe && CLASSE_NOME_PARA_CHAVE[f.classe] ? f.classe : 'Guerreiro';
      s.antecedente = f.antecedente && ANTECEDENTES[f.antecedente] ? f.antecedente : 'Soldado';
      s.nivel = f.nivel || 1;
      if (f.atributos) s.base = { ...s.base, ...f.atributos };
      s.estilo = f.estilo || '';
      s.truques = f.truques || [];
      s.magias1 = f.magias1 || [];
      s.armadura = f.armadura && ARRADURA_OK(f.armadura) ? f.armadura : 'Cota de Malha';
      s.escudo = f.escudo != null ? f.escudo : false;
      s.itens = f.itens || [];
      s.ouro = f.ouro || 0;
      s.anotacoes = f.anotacoes || '';
      s.pericias = (f.pericias || []).filter(p => (PERICIAS_CLASSE[s.classe]?.opcoes || []).includes(p));
    }
    estado = s;
  }
  function ARRADURA_OK(n) { return !!ARMADURAS[n]; }

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
    $('cClasse').addEventListener('change', () => { estado.classe = $('cClasse').value; renderTudoDinamico(); });
    $('cAntecedente').addEventListener('change', () => { estado.antecedente = $('cAntecedente').value; renderPreview(); });
    $('cNivel').addEventListener('change', () => { estado.nivel = Number($('cNivel').value); renderTudoDinamico(); });
    $('cArmadura').addEventListener('change', () => { estado.armadura = $('cArmadura').value; renderPreview(); });
    $('cEscudo').addEventListener('change', () => { estado.escudo = $('cEscudo').checked; renderPreview(); });
    $('cEstilo').addEventListener('change', () => { estado.estilo = $('cEstilo').value; renderPreview(); });
    $('cOuro').addEventListener('input', () => { estado.ouro = Number($('cOuro').value) || 0; renderPreview(); });
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
  }

  return { abrir };
})();
window.Criador = Criador;
