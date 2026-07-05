// =====================================================
// CRIAÇÃO DE ITENS MÁGICOS — ferramenta do Mestre (Fase: Item de Memória & Itens do Mestre)
// -----------------------------------------------------
// Guia de raridade inspirado nas diretrizes de criação de itens mágicos do
// Guia do Mestre (DMG): bônus máximo, nº de propriedades, cargas e
// frequência de magias sugeridos por raridade. O Mestre define o item (nome,
// categoria, raridade) e o sistema mostra os limites recomendados — ele pode
// ultrapassá-los, mas recebe um aviso visível, para nada sair das diretrizes
// sem que seja uma decisão consciente do Mestre.
//
// Guardado em `itens_mestre` no estado da campanha — SEPARADO do acervo/loja
// do jogador (ITENS_PADRAO/ITENS_MAGICOS/CATALOGO). Para dar um item a um
// personagem, o Mestre usa "📦 Enviar à ficha" na aba Fichas (Fase F).
// =====================================================

const RARIDADE_ITEM_MAGICO = {
  'Comum':      { bonusMax: 0, propriedadesMax: 1, cargasMax: 0,  magiasDiaMax: 0, sintoniaSugerida: false, valorPO: '50–100',     nivelSugerido: '1+' },
  'Incomum':    { bonusMax: 1, propriedadesMax: 1, cargasMax: 3,  magiasDiaMax: 1, sintoniaSugerida: false, valorPO: '101–500',    nivelSugerido: '1+' },
  'Raro':       { bonusMax: 2, propriedadesMax: 2, cargasMax: 7,  magiasDiaMax: 2, sintoniaSugerida: true,  valorPO: '501–5000',   nivelSugerido: '5+' },
  'Muito raro': { bonusMax: 3, propriedadesMax: 3, cargasMax: 10, magiasDiaMax: 3, sintoniaSugerida: true,  valorPO: '5001–50000', nivelSugerido: '11+' },
  'Lendário':   { bonusMax: 3, propriedadesMax: 4, cargasMax: 20, magiasDiaMax: 5, sintoniaSugerida: true,  valorPO: '50001+',     nivelSugerido: '17+' },
};

const CATEGORIAS_ITEM_MAGICO = [
  ['arma', '⚔️ Arma', 'Arma'], ['armadura', '🛡️ Armadura', 'Armadura'], ['escudo', '🛡️ Escudo', 'Armadura'],
  ['anel', '💍 Anel', 'Anel'], ['maravilhoso', '✨ Maravilhoso', 'Maravilhoso'],
  ['varinha', '🪄 Varinha', 'Varinha'], ['cajado', '🦯 Cajado', 'Cajado'], ['pergaminho', '📜 Pergaminho', 'Pergaminho'],
];

(function () {
  const $ = id => document.getElementById(id);
  const listaEl = () => $('listaItensMestre');
  if (!listaEl()) return; // esta ferramenta só existe na tela do Mestre

  function escHtml(s) { return s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const uidLocal = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  let itensMestre = [];
  let editandoId = null;
  let rascunho = null;
  // Fase 9c: curadoria da Loja Especial — [{nome, precoPO}], só o Mestre edita
  let lojaEspecialItens = [];
  let acervoFiltro = '';

  async function carregar() {
    try { itensMestre = await (await fetch('/api/itens_mestre')).json(); } catch (e) { itensMestre = []; }
    try { lojaEspecialItens = await (await fetch('/api/loja_especial_itens')).json(); } catch (e) { lojaEspecialItens = []; }
    window.ITENS_MESTRE = itensMestre;
    window.LOJA_ESPECIAL_ITENS = lojaEspecialItens;
    render();
    // a lista de fichas pode já ter montado o dropdown "Enviar à ficha" sem
    // estes itens (corrida entre os dois fetches iniciais) — atualiza agora.
    if (typeof renderFichas === 'function') renderFichas();
  }

  let _fila = Promise.resolve();
  function salvar() {
    window.ITENS_MESTRE = itensMestre;
    const body = JSON.stringify(itensMestre);
    _fila = _fila.then(() => fetch('/api/itens_mestre', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })).catch(() => {});
    return _fila;
  }
  let _filaLoja = Promise.resolve();
  function salvarLojaEspecial() {
    window.LOJA_ESPECIAL_ITENS = lojaEspecialItens;
    const body = JSON.stringify(lojaEspecialItens);
    _filaLoja = _filaLoja.then(() => fetch('/api/loja_especial_itens', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })).catch(() => {});
    return _filaLoja;
  }

  // Chamados pelo listener de tempo real do app.js quando o estado da campanha muda.
  window._syncItensMestre = function (lista) {
    itensMestre = lista || [];
    window.ITENS_MESTRE = itensMestre;
    render();
  };
  window._syncLojaEspecialItens = function (lista) {
    lojaEspecialItens = lista || [];
    window.LOJA_ESPECIAL_ITENS = lojaEspecialItens;
    render();
  };

  function novoRascunho() {
    return {
      id: uidLocal(), nome: '', categoria: 'maravilhoso', raridade: 'Incomum',
      bonus: 0, sintonia: false, propriedades: [''], magias: [], cargas: 0, descricao: '',
    };
  }

  function renderGuia(raridade) {
    const g = RARIDADE_ITEM_MAGICO[raridade];
    if (!g) return '';
    return `<div class="im-guia">
      <b>Diretrizes para ${escHtml(raridade)}</b> <span class="criador-hint-inline">(Guia do Mestre)</span>
      <div class="im-guia-grid">
        <span>Bônus máx.: <b>+${g.bonusMax || 0}</b></span>
        <span>Propriedades sugeridas: <b>${g.propriedadesMax}</b></span>
        <span>Cargas máx.: <b>${g.cargasMax || '—'}</b></span>
        <span>Magias/dia sugeridas: <b>${g.magiasDiaMax || '—'}</b></span>
        <span>Sintonização: <b>${g.sintoniaSugerida ? 'recomendada' : 'opcional'}</b></span>
        <span>Valor de referência: <b>${g.valorPO} po</b></span>
        <span>Nível de jogo sugerido: <b>${g.nivelSugerido}</b></span>
      </div>
    </div>`;
  }

  function avisosExcesso(r) {
    const g = RARIDADE_ITEM_MAGICO[r.raridade] || RARIDADE_ITEM_MAGICO['Comum'];
    const props = (r.propriedades || []).filter(p => p.trim());
    const avisos = [];
    if ((r.bonus || 0) > g.bonusMax) avisos.push(`Bônus +${r.bonus} excede o sugerido para ${r.raridade} (máx. +${g.bonusMax}).`);
    if (props.length > g.propriedadesMax) avisos.push(`${props.length} propriedades excedem o sugerido para ${r.raridade} (máx. ${g.propriedadesMax}).`);
    if ((r.cargas || 0) > g.cargasMax) avisos.push(`${r.cargas} cargas excedem o sugerido para ${r.raridade} (máx. ${g.cargasMax}).`);
    const totalMagiaDia = (r.magias || []).reduce((s, m) => s + (Number(m.vezes) || 0), 0);
    if (totalMagiaDia > g.magiasDiaMax) avisos.push(`${totalMagiaDia}×/dia de magia excede o sugerido para ${r.raridade} (máx. ${g.magiasDiaMax}).`);
    return avisos;
  }

  function renderForm() {
    const el = $('imFormWrap');
    if (!rascunho) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.classList.remove('hidden');
    const r = rascunho;
    const catOps = CATEGORIAS_ITEM_MAGICO.map(([c, rot]) => `<option value="${c}" ${r.categoria === c ? 'selected' : ''}>${rot}</option>`).join('');
    const rarOps = Object.keys(RARIDADE_ITEM_MAGICO).map(rn => `<option value="${rn}" ${r.raridade === rn ? 'selected' : ''}>${rn}</option>`).join('');
    const props = (r.propriedades || []).map((p, i) => `<div class="im-prop-linha">
        <input type="text" data-prop="${i}" value="${escHtml(p)}" placeholder="ex.: +1d6 de dano de fogo ao acertar">
        <button type="button" class="btn-mini" data-prop-rem="${i}">×</button></div>`).join('');
    const magias = (r.magias || []).map((m, i) => `<div class="im-prop-linha">
        <input type="text" data-magia-nome="${i}" value="${escHtml(m.nome)}" placeholder="nome da magia">
        <input type="number" data-magia-vezes="${i}" value="${m.vezes || 1}" min="1" style="width:56px" title="vezes por dia">×/dia
        <button type="button" class="btn-mini" data-magia-rem="${i}">×</button></div>`).join('');
    const avisos = avisosExcesso(r);
    el.innerHTML = `<h3>${editandoId ? 'Editar' : 'Novo'} Item Mágico</h3>
      <div class="form-grid">
        <label class="full">Nome <input type="text" id="imNome" value="${escHtml(r.nome)}" placeholder="ex.: Sombrero Mágico"></label>
        <label>Categoria <select id="imCategoria">${catOps}</select></label>
        <label>Raridade <select id="imRaridade">${rarOps}</select></label>
        <label>Bônus (+X ataque/dano/CA) <input type="number" id="imBonus" value="${r.bonus || 0}" min="0" max="5"></label>
        <label>Cargas (0 = sem cargas) <input type="number" id="imCargas" value="${r.cargas || 0}" min="0" max="30"></label>
        <label class="check-chip ${r.sintonia ? 'on' : ''}"><input type="checkbox" id="imSintonia" ${r.sintonia ? 'checked' : ''}> Requer sintonização</label>
      </div>
      ${renderGuia(r.raridade)}
      <h4>Propriedades / efeitos</h4>
      <div id="imProps">${props}</div>
      <button type="button" class="btn-mini" id="imAddProp">+ Propriedade</button>
      <h4>Magias associadas <span class="criador-hint-inline">(opcional)</span></h4>
      <div id="imMagias">${magias}</div>
      <button type="button" class="btn-mini" id="imAddMagia">+ Magia</button>
      <label class="full">Descrição / lore <textarea id="imDescricao" rows="3" placeholder="aparência, origem, como foi criado...">${escHtml(r.descricao)}</textarea></label>
      ${avisos.length ? `<div class="im-aviso">⚠ ${avisos.map(escHtml).join('<br>⚠ ')}</div>` : ''}
      <div class="modal-actions" style="position:static;margin-top:10px">
        <button type="button" class="btn-secondary" id="imCancelar">Cancelar</button>
        <button type="button" class="btn-primary" id="imSalvar">Salvar Item</button>
      </div>`;
    wireForm();
  }

  function wireForm() {
    $('imNome').addEventListener('input', () => { rascunho.nome = $('imNome').value; });
    $('imCategoria').addEventListener('change', () => { rascunho.categoria = $('imCategoria').value; });
    $('imRaridade').addEventListener('change', () => { rascunho.raridade = $('imRaridade').value; renderForm(); });
    $('imBonus').addEventListener('input', () => { rascunho.bonus = Math.max(0, Number($('imBonus').value) || 0); renderForm(); });
    $('imCargas').addEventListener('input', () => { rascunho.cargas = Math.max(0, Number($('imCargas').value) || 0); renderForm(); });
    $('imSintonia').addEventListener('change', () => { rascunho.sintonia = $('imSintonia').checked; });
    $('imDescricao').addEventListener('input', () => { rascunho.descricao = $('imDescricao').value; });
    document.querySelectorAll('#imProps [data-prop]').forEach(inp => inp.addEventListener('input', () => {
      rascunho.propriedades[Number(inp.dataset.prop)] = inp.value;
    }));
    document.querySelectorAll('#imProps [data-prop-rem]').forEach(b => b.addEventListener('click', () => {
      rascunho.propriedades.splice(Number(b.dataset.propRem), 1);
      renderForm();
    }));
    $('imAddProp').addEventListener('click', () => { rascunho.propriedades.push(''); renderForm(); });
    document.querySelectorAll('#imMagias [data-magia-nome]').forEach(inp => inp.addEventListener('input', () => {
      rascunho.magias[Number(inp.dataset.magiaNome)].nome = inp.value;
    }));
    document.querySelectorAll('#imMagias [data-magia-vezes]').forEach(inp => inp.addEventListener('input', () => {
      rascunho.magias[Number(inp.dataset.magiaVezes)].vezes = Math.max(1, Number(inp.value) || 1);
      renderForm();
    }));
    document.querySelectorAll('#imMagias [data-magia-rem]').forEach(b => b.addEventListener('click', () => {
      rascunho.magias.splice(Number(b.dataset.magiaRem), 1);
      renderForm();
    }));
    $('imAddMagia').addEventListener('click', () => { rascunho.magias.push({ nome: '', vezes: 1 }); renderForm(); });
    $('imCancelar').addEventListener('click', () => { rascunho = null; editandoId = null; renderForm(); });
    $('imSalvar').addEventListener('click', salvarItem);
  }

  // Monta um texto de efeito legível a partir das propriedades — usado pela
  // sintonização/inventário do Modo de Jogo (mesmo formato de ITENS_MAGICOS).
  function construirEfeito(r) {
    const partes = [];
    if (r.bonus > 0) partes.push(`+${r.bonus} nas jogadas de ataque/dano (armas) ou na CA (armaduras/escudos), conforme a categoria do item`);
    (r.propriedades || []).filter(p => p.trim()).forEach(p => partes.push(p.trim()));
    (r.magias || []).filter(m => m.nome.trim()).forEach(m => partes.push(`Conjura ${m.nome.trim()} (${m.vezes}×/dia)`));
    if (r.cargas > 0) partes.push(`${r.cargas} cargas (recarga definida pelo Mestre, tipicamente ao amanhecer)`);
    return partes.join('; ') || 'Efeito a definir.';
  }

  function salvarItem() {
    if (!rascunho.nome.trim()) { alert('Dê um nome ao item.'); return; }
    const catInfo = CATEGORIAS_ITEM_MAGICO.find(([c]) => c === rascunho.categoria);
    const item = {
      ...rascunho,
      nome: rascunho.nome.trim(),
      propriedades: (rascunho.propriedades || []).filter(p => p.trim()),
      magias: (rascunho.magias || []).filter(m => m.nome.trim()),
      tipo: catInfo ? catInfo[2] : 'Maravilhoso',
      peso: rascunho.peso || '-',
      efeito: construirEfeito(rascunho),
      criadoEm: rascunho.criadoEm || new Date().toISOString(),
    };
    const idx = itensMestre.findIndex(i => i.id === item.id);
    if (idx >= 0) itensMestre[idx] = item; else itensMestre.push(item);
    salvar();
    rascunho = null;
    editandoId = null;
    render();
    if (typeof renderFichas === 'function') renderFichas(); // atualiza o dropdown "Enviar à ficha"
  }

  function render() {
    renderForm();
    renderLojaCurada();
    renderAcervo();
    const el = listaEl();
    if (!itensMestre.length) { el.innerHTML = '<p style="color:var(--text-dim)">Nenhum item mágico criado ainda.</p>'; return; }
    el.innerHTML = itensMestre.map(i => {
      const g = RARIDADE_ITEM_MAGICO[i.raridade] || {};
      return `<div class="item-card">
        <div class="item-header"><h3>${escHtml(i.nome)}</h3><span class="item-cat">${escHtml(i.raridade)}</span></div>
        <div class="item-preco">${escHtml(i.tipo)}${i.bonus ? ` · +${i.bonus}` : ''}${i.sintonia ? ' · requer sintonização' : ''} · valor de referência ${escHtml(g.valorPO || '—')} po</div>
        <div class="item-desc">${escHtml(i.efeito)}</div>
        ${i.descricao ? `<div class="item-desc"><i>${escHtml(i.descricao)}</i></div>` : ''}
        <div class="ficha-card-acoes">
          <button class="btn-editar" data-editar-im="${i.id}">✎ Editar</button>
          <button class="btn-danger" data-excluir-im="${i.id}">Excluir</button>
        </div>
      </div>`;
    }).join('');
    el.querySelectorAll('[data-editar-im]').forEach(b => b.addEventListener('click', () => {
      const item = itensMestre.find(i => i.id === b.dataset.editarIm);
      if (!item) return;
      editandoId = item.id;
      rascunho = {
        ...item,
        propriedades: (item.propriedades && item.propriedades.length) ? [...item.propriedades] : [''],
        magias: (item.magias || []).map(m => ({ ...m })),
      };
      renderForm();
      $('imFormWrap').scrollIntoView({ behavior: 'smooth' });
    }));
    el.querySelectorAll('[data-excluir-im]').forEach(b => b.addEventListener('click', () => {
      if (!confirm('Excluir este item mágico?')) return;
      itensMestre = itensMestre.filter(i => i.id !== b.dataset.excluirIm);
      salvar();
      render();
      if (typeof renderFichas === 'function') renderFichas();
    }));
  }

  // ----- Fase 9c: Loja Especial curada + acervo -----
  // Sugestão de preço pela raridade (ponto médio do valor de referência do DMG)
  const PRECO_SUGERIDO_RARIDADE = { 'Comum': 75, 'Incomum': 300, 'Raro': 2500, 'Muito raro': 25000, 'Lendário': 75000 };

  function renderLojaCurada() {
    const el = $('lojaEspecialCurada');
    if (!el) return;
    if (!lojaEspecialItens.length) {
      el.innerHTML = '<p style="color:var(--text-dim)">Loja Especial vazia — os jogadores liberados verão uma loja sem itens. Adicione do acervo abaixo.</p>';
      return;
    }
    const acervo = (typeof acervoItensMagicos === 'function') ? acervoItensMagicos() : [];
    el.innerHTML = lojaEspecialItens.map((entrada, idx) => {
      const base = acervo.find(i => i.nome === entrada.nome);
      return `<div class="loja-item">
        <span class="loja-nome">${escHtml(entrada.nome)}${base ? '' : ' <span class="pv-warn">⚠ fora do acervo</span>'}</span>
        <span class="loja-desc">${escHtml(base ? base.descricao : '')}</span>
        <span class="loja-preco"><input type="number" data-curado-preco="${idx}" value="${entrada.precoPO || 0}" min="0" style="width:84px"> po</span>
        <button type="button" class="btn-mini" data-curado-rem="${idx}" title="Remover da loja">×</button>
      </div>`;
    }).join('');
    el.querySelectorAll('[data-curado-preco]').forEach(inp => inp.addEventListener('change', () => {
      lojaEspecialItens[Number(inp.dataset.curadoPreco)].precoPO = Math.max(0, Number(inp.value) || 0);
      salvarLojaEspecial();
    }));
    el.querySelectorAll('[data-curado-rem]').forEach(b => b.addEventListener('click', () => {
      lojaEspecialItens.splice(Number(b.dataset.curadoRem), 1);
      salvarLojaEspecial();
      render();
    }));
  }

  function renderAcervo() {
    const el = $('acervoItens');
    if (!el || typeof acervoItensMagicos !== 'function') return;
    const busca = acervoFiltro.trim().toLowerCase();
    const nomesNaLoja = new Set(lojaEspecialItens.map(e => e.nome));
    const itens = acervoItensMagicos().filter(i =>
      !busca || i.nome.toLowerCase().includes(busca) || (i.descricao || '').toLowerCase().includes(busca));
    el.innerHTML = itens.map(i => `<div class="loja-item${nomesNaLoja.has(i.nome) ? ' bloqueada' : ''}">
        <span class="loja-nome">${i.origem === 'itens_mestre' ? '🛠️ ' : ''}${escHtml(i.nome)}</span>
        <span class="loja-desc">${escHtml(i.descricao || '')}</span>
        <span class="loja-preco">${escHtml(i.raridade || '')}${i.sintonia ? ' · sintonia' : ''}</span>
        ${nomesNaLoja.has(i.nome)
          ? '<span class="loja-cadeado" title="Já está na Loja Especial">✔</span>'
          : `<button type="button" class="btn-mini" data-acervo-add="${escHtml(i.nome)}" data-acervo-raridade="${escHtml(i.raridade || '')}">➕ à loja</button>`}
      </div>`).join('') || '<p style="color:var(--text-dim)">Nada encontrado.</p>';
    el.querySelectorAll('[data-acervo-add]').forEach(b => b.addEventListener('click', () => {
      const nome = b.dataset.acervoAdd;
      if (lojaEspecialItens.some(e => e.nome === nome)) return;
      const sugerido = PRECO_SUGERIDO_RARIDADE[b.dataset.acervoRaridade] || 100;
      lojaEspecialItens.push({ nome, precoPO: sugerido });
      salvarLojaEspecial();
      render();
    }));
  }

  const buscaAcervo = $('acervoBusca');
  if (buscaAcervo) buscaAcervo.addEventListener('input', () => { acervoFiltro = buscaAcervo.value; renderAcervo(); });

  const btnNovo = $('imNovoItem');
  if (btnNovo) btnNovo.addEventListener('click', () => {
    editandoId = null;
    rascunho = novoRascunho();
    renderForm();
    $('imFormWrap').scrollIntoView({ behavior: 'smooth' });
  });

  carregar();
})();
