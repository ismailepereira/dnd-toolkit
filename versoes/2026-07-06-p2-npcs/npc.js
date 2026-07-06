// =====================================================
// NPCs DA CAMPANHA (Fase 11) — lojistas, aliados, inimigos e neutros
// -----------------------------------------------------
// Diferente dos monstros (bestiário estático) e dos aliados avulsos do
// rastreador, um NPC PERSISTE entre combates: o ferreiro continua a existir
// depois da compra, o aliado recorrente aparece de sessão em sessão.
//
// Este módulo serve as duas telas:
//  - Mestre (#listaNpcs + #modalNpc): CRUD completo, notas privadas,
//    stat block opcional (só para NPCs que podem entrar em combate).
//  - Jogador (#listaNpcsJog): cartões read-only, só os visíveis
//    (o servidor já filtra e remove notasPrivadas — /api/npcs).
//
// Integração com o combate (app.js): window.NPCS_CAMPANHA fica sempre
// atualizado e window._npcsAtualizados(npcs) é chamado a cada mudança
// para repovoar o seletor "+ NPC" do rastreador.
// =====================================================

const NPC_TIPOS = [
  ['lojista', '🛒 Lojista'],
  ['aliado', '🤝 Aliado'],
  ['inimigo', '⚔️ Inimigo'],
  ['neutro', '😐 Neutro'],
];

(function () {
  const $ = id => document.getElementById(id);
  const listaMestre = $('listaNpcs');
  const listaJog = $('listaNpcsJog');
  if (!listaMestre && !listaJog) return; // tela sem NPCs (ex.: login)
  const ehMestre = !!listaMestre;

  const esc = s => s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uidNpc = () => 'npc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const rotuloTipo = t => (NPC_TIPOS.find(([k]) => k === t) || [t, t])[1];

  let npcs = [];
  let editandoId = null;

  async function carregar() {
    try { npcs = await (await fetch('/api/npcs')).json(); } catch (e) { npcs = []; }
    window.NPCS_CAMPANHA = npcs;
    render();
  }

  let _fila = Promise.resolve();
  function salvar() {
    window.NPCS_CAMPANHA = npcs;
    const body = JSON.stringify(npcs);
    _fila = _fila.then(() => fetch('/api/npcs', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })).catch(() => {});
    return _fila;
  }

  // Chamado pelos listeners de tempo real (app.js/jogador.js).
  window._syncNpcs = function (lista) {
    // no lado do jogador o servidor já filtrou; no RT chega o estado cru da
    // campanha — replica o mesmo filtro do endpoint para não vazar nada
    let novos = lista || [];
    if (!ehMestre) {
      novos = novos.filter(n => n.visivelParaJogadores).map(n => {
        const { notasPrivadas, ...resto } = n;
        return resto;
      });
    }
    npcs = novos;
    window.NPCS_CAMPANHA = npcs;
    render();
  };

  // ---------- Cartões ----------
  function cardNpc(n) {
    const sb = n.statBlock;
    const fc = n.fichaCompleta;
    const pct = sb && sb.pvMax > 0 ? Math.max(0, Math.min(100, (sb.pvAtual / sb.pvMax) * 100)) : 
                (fc && fc.hpMax > 0 ? Math.max(0, Math.min(100, ((fc.hpAtual ?? fc.hpMax) / fc.hpMax) * 100)) : 0);
    const hpTxt = sb ? `PV ${sb.pvAtual}/${sb.pvMax}` : (fc ? `PV ${fc.hpAtual ?? fc.hpMax}/${fc.hpMax}` : '');
    const caTxt = sb ? `CA ${sb.ca}` : (fc ? `CA ${fc.ca}` : '');
    const blocoHp = (sb || fc) ? `<div>${caTxt} · ${hpTxt}</div>
      <div class="hp-bar"><div class="hp-bar-fill" style="width:${pct}%"></div></div>` : '';

    return `<div class="ficha-card npc-card npc-${esc(n.tipo)}">
      <h3>${esc(n.nome) || 'Sem nome'}</h3>
      <div class="sub">${rotuloTipo(n.tipo)}${n.localizacao ? ' · 📍 ' + esc(n.localizacao) : ''}${fc ? ' · 📜 Ficha Completa' : ''}</div>
      ${n.descricao ? `<div class="npc-desc">${esc(n.descricao)}</div>` : ''}
      ${blocoHp}
      ${ehMestre && n.notasPrivadas ? `<div class="npc-notas-privadas">🔒 ${esc(n.notasPrivadas)}</div>` : ''}
      ${ehMestre ? `
        <label class="check-chip npc-visivel ${n.visivelParaJogadores ? 'on' : ''}">
          <input type="checkbox" data-npc-visivel="${esc(n.id)}" ${n.visivelParaJogadores ? 'checked' : ''}> 👁️ Visível p/ jogadores
        </label>
        <div class="ficha-card-acoes">
          ${fc ? `<button class="btn-primary" data-npc-ver-ficha="${esc(n.id)}">▶ Ver ficha</button>` : ''}
          ${n.tipo === 'lojista' ? `<button class="btn-secondary" data-npc-loja-editar="${esc(n.id)}" title="Editar o estoque e os preços da loja deste NPC">🛒 Loja</button>` : ''}
          <button class="btn-editar" data-npc-editar="${esc(n.id)}">✎ Editar</button>
          <button class="btn-secondary" data-npc-banco="${esc(n.id)}" title="Guardar uma cópia no meu banco pessoal (segue você entre campanhas)">💾 Banco</button>
          <button class="btn-danger" data-npc-excluir="${esc(n.id)}">Excluir</button>
        </div>` : `
        <div class="ficha-card-acoes">
          ${n.tipo === 'lojista' && lojaDoNpc(n.id) ? `<button class="btn-primary" data-npc-loja-ver="${esc(n.id)}">🛒 Ver loja</button>` : ''}
          <button class="btn-secondary" data-npc-banco="${esc(n.id)}" title="Guardar uma cópia no meu banco pessoal">💾 Guardar no meu banco</button>
        </div>`}
    </div>`;
  }

  function render() {
    const el = ehMestre ? listaMestre : listaJog;
    if (!npcs.length) {
      el.innerHTML = `<p style="color:var(--text-dim)">${ehMestre ? 'Nenhum NPC ainda. Clique em "+ Novo NPC".' : 'Nenhum NPC conhecido ainda — eles aparecem quando o Mestre os apresenta.'}</p>`;
    } else {
      el.innerHTML = npcs.map(cardNpc).join('');
    }
    if (ehMestre) {
      el.querySelectorAll('[data-npc-editar]').forEach(b => b.addEventListener('click', () => {
        const n = npcs.find(x => x.id === b.dataset.npcEditar);
        if (n && n.fichaCompleta) {
          Criador.abrir(n.fichaCompleta, {
            modoNpc: true,
            aoSalvar(novaFicha) {
              n.fichaCompleta = novaFicha;
              n.nome = novaFicha.nome;
              n.descricao = `${novaFicha.raca} ${novaFicha.classe} Nível ${novaFicha.nivel}`;
              salvar();
              render();
            }
          });
        } else {
          abrirModal(b.dataset.npcEditar);
        }
      }));
      el.querySelectorAll('[data-npc-ver-ficha]').forEach(b => b.addEventListener('click', () => {
        const n = npcs.find(x => x.id === b.dataset.npcVerFicha);
        if (!n || !n.fichaCompleta) return;
        if (typeof Jogo !== 'undefined') {
          Jogo.abrir(n.fichaCompleta, {
            aoAtualizar(novaFicha) {
              n.fichaCompleta = novaFicha;
              n.nome = novaFicha.nome;
              n.descricao = `${novaFicha.raca} ${novaFicha.classe} Nível ${novaFicha.nivel}`;
              salvar();
              render();
            }
          });
        }
      }));
      el.querySelectorAll('[data-npc-excluir]').forEach(b => b.addEventListener('click', () => {
        const n = npcs.find(x => x.id === b.dataset.npcExcluir);
        if (!n || !confirm(`Excluir o NPC "${n.nome}"?`)) return;
        npcs = npcs.filter(x => x.id !== n.id);
        salvar(); render();
      }));
      el.querySelectorAll('[data-npc-visivel]').forEach(chk => chk.addEventListener('change', () => {
        const n = npcs.find(x => x.id === chk.dataset.npcVisivel);
        if (!n) return;
        n.visivelParaJogadores = chk.checked;
        salvar(); render();
      }));
    }
    // M4: guardar no banco pessoal (disponível para Mestre E jogador)
    el.querySelectorAll('[data-npc-banco]').forEach(b => b.addEventListener('click', () => {
      const n = npcs.find(x => x.id === b.dataset.npcBanco);
      if (n) guardarNoBanco(n);
    }));
    // Fase 12: loja do NPC lojista
    el.querySelectorAll('[data-npc-loja-editar]').forEach(b => b.addEventListener('click', () => {
      const n = npcs.find(x => x.id === b.dataset.npcLojaEditar);
      if (n) abrirEditorLoja(n);
    }));
    el.querySelectorAll('[data-npc-loja-ver]').forEach(b => b.addEventListener('click', () => {
      const n = npcs.find(x => x.id === b.dataset.npcLojaVer);
      if (n) abrirLojaCompra(n);
    }));
    if (typeof window._npcsAtualizados === 'function') window._npcsAtualizados(npcs);
  }

  // ---------- M4: banco PESSOAL de NPCs (fora da campanha) ----------
  const listaBanco = $('listaBancoNpc');
  let banco = [];

  async function carregarBanco() {
    if (!listaBanco) return;
    try {
      const r = await (await fetch('/api/banco_npc')).json();
      banco = Array.isArray(r) ? r : [];
    } catch (e) { banco = []; }
    renderBanco();
  }

  let _filaBanco = Promise.resolve();
  function salvarBanco() {
    const body = JSON.stringify(banco);
    _filaBanco = _filaBanco.then(() => fetch('/api/banco_npc', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body })).catch(() => {});
    return _filaBanco;
  }

  function copiaNpc(n) {
    // cópia profunda com id novo (banco e campanha não partilham ids)
    const c = JSON.parse(JSON.stringify(n));
    c.id = uidNpc();
    return c;
  }

  function guardarNoBanco(n) {
    if (!listaBanco) { alert('Banco indisponível nesta tela.'); return; }
    if (banco.some(b => b.nome === n.nome && b.tipo === n.tipo)) {
      if (!confirm(`Já existe "${n.nome}" no seu banco. Guardar outra cópia?`)) return;
    }
    banco.push(copiaNpc(n));
    salvarBanco(); renderBanco();
  }

  function cardBanco(n, origem) {
    // origem: 'meu' (com remover/trazer) ou 'membro' (só trazer, Mestre)
    const fc = n.fichaCompleta;
    return `<div class="ficha-card npc-card npc-${esc(n.tipo)}">
      <h3>${esc(n.nome) || 'Sem nome'}</h3>
      <div class="sub">${rotuloTipo(n.tipo)}${fc ? ' · 📜 Ficha Completa' : ''}${n.statBlock ? ' · ⚔️' : ''}</div>
      ${n.descricao ? `<div class="npc-desc">${esc(n.descricao)}</div>` : ''}
      <div class="ficha-card-acoes">
        ${ehMestre ? `<button class="btn-primary" data-banco-trazer="${esc(n.id)}" data-banco-origem="${origem}">📥 Trazer para a campanha</button>` : ''}
        ${origem === 'meu' ? `<button class="btn-danger" data-banco-remover="${esc(n.id)}">Remover</button>` : ''}
      </div>
    </div>`;
  }

  let bancoMembro = [];
  function renderBanco() {
    if (!listaBanco) return;
    listaBanco.innerHTML = banco.length
      ? banco.map(n => cardBanco(n, 'meu')).join('')
      : '<p style="color:var(--text-dim)">Banco vazio — use 💾 num cartão de NPC para guardar uma cópia pessoal.</p>';
    listaBanco.querySelectorAll('[data-banco-remover]').forEach(b => b.addEventListener('click', () => {
      const n = banco.find(x => x.id === b.dataset.bancoRemover);
      if (!n || !confirm(`Remover "${n.nome}" do seu banco?`)) return;
      banco = banco.filter(x => x.id !== n.id);
      salvarBanco(); renderBanco();
    }));
    ligarTrazer(listaBanco);
    const wrapMembro = $('listaBancoMembro');
    if (wrapMembro) {
      wrapMembro.innerHTML = bancoMembro.length ? bancoMembro.map(n => cardBanco(n, 'membro')).join('') : '<p style="color:var(--text-dim)">Banco vazio.</p>';
      ligarTrazer(wrapMembro);
    }
  }

  function ligarTrazer(raiz) {
    if (!ehMestre) return;
    raiz.querySelectorAll('[data-banco-trazer]').forEach(b => b.addEventListener('click', () => {
      const fonte = b.dataset.bancoOrigem === 'membro' ? bancoMembro : banco;
      const n = fonte.find(x => x.id === b.dataset.bancoTrazer);
      if (!n) return;
      const c = copiaNpc(n);
      npcs.push(c);
      salvar(); render();
      alert(`"${c.nome}" entrou nos NPCs da campanha.`);
    }));
  }

  // ---------- Fase 12: lojas geridas por NPC lojista ----------
  let lojas = [];

  async function carregarLojas() {
    try {
      const r = await (await fetch('/api/lojas')).json();
      lojas = Array.isArray(r) ? r : [];
    } catch (e) { lojas = []; }
  }

  function lojaDoNpc(npcId) {
    return lojas.find(l => l.npcId === npcId) || null;
  }

  function salvarLojas() {
    return fetch('/api/lojas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lojas) }).catch(() => {});
  }

  // Modal genérico criado em JS (reusa as classes .modal/.modal-content do CSS)
  function modalLoja(html) {
    fecharModalLoja();
    const wrap = document.createElement('div');
    wrap.id = 'modalLojaNpc';
    wrap.className = 'modal';
    wrap.innerHTML = `<div class="modal-content">${html}</div>`;
    wrap.addEventListener('click', e => { if (e.target === wrap) fecharModalLoja(); });
    document.body.appendChild(wrap);
    return wrap;
  }
  function fecharModalLoja() {
    const m = document.getElementById('modalLojaNpc');
    if (m) m.remove();
  }

  // Catálogo completo para o editor (básico + itens mágicos/do Mestre)
  function catalogoParaLoja() {
    const base = (typeof itensLojaBasica === 'function') ? itensLojaBasica() : [];
    const magicos = (typeof acervoItensMagicos === 'function') ? acervoItensMagicos() : [];
    return [...base, ...magicos];
  }

  // ----- Editor do Mestre -----
  function abrirEditorLoja(npc) {
    const existente = lojaDoNpc(npc.id);
    // trabalha numa cópia: só grava no "Salvar"
    const loja = existente ? JSON.parse(JSON.stringify(existente)) : {
      id: 'loja_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      npcId: npc.id,
      nome: `Loja de ${npc.nome}`,
      estoque: [],
      compraDoJogador: { aceita: true, multiplicador: 0.5 },
    };
    const catalogo = catalogoParaLoja();
    const wrap = modalLoja(`
      <h2>🛒 ${esc(loja.nome)}</h2>
      <label class="full">Nome da loja <input type="text" id="ljNome" value="${esc(loja.nome)}"></label>
      <div class="dado-row">
        <select id="ljItemSel">${catalogo.map(i => `<option value="${esc(i.nome)}" data-preco="${i.precoPO || 0}">${esc(i.nome)}${i.raridade ? ' ✨' : ''} (${i.precoPO || 0} po)</option>`).join('')}</select>
        <button class="btn-secondary" id="ljAddItem">+ Adicionar ao estoque</button>
      </div>
      <div id="ljEstoque"></div>
      <label class="check-chip"><input type="checkbox" id="ljCompra" ${loja.compraDoJogador && loja.compraDoJogador.aceita ? 'checked' : ''}> 💰 Compra dos aventureiros</label>
      <label>pagando <input type="number" id="ljMult" value="${Math.round(((loja.compraDoJogador && loja.compraDoJogador.multiplicador) || 0.5) * 100)}" min="0" max="200" style="width:64px"> % do preço da loja</label>
      <p class="criador-hint">Qtd −1 = estoque infinito. O lojista só compra itens que existem no estoque dele (é de lá que sai o preço de referência).</p>
      <div class="ficha-card-acoes">
        <button class="btn-primary" id="ljSalvar">💾 Salvar loja</button>
        ${existente ? '<button class="btn-danger" id="ljExcluir">Excluir loja</button>' : ''}
        <button class="btn-secondary" id="ljFechar">Cancelar</button>
      </div>`);

    function renderEstoque() {
      const alvo = wrap.querySelector('#ljEstoque');
      alvo.innerHTML = loja.estoque.length ? loja.estoque.map((e, i) => `
        <div class="dado-row lj-linha">
          <span class="lj-nome">${esc(e.nome)}</span>
          <label>po <input type="number" data-lj-preco="${i}" value="${e.precoPO}" min="0" style="width:70px"></label>
          <label>qtd <input type="number" data-lj-qtd="${i}" value="${e.qtd}" min="-1" style="width:60px"></label>
          <button class="btn-danger btn-mini" data-lj-rem="${i}">✕</button>
        </div>`).join('') : '<p class="criador-hint">Estoque vazio — adicione itens acima.</p>';
      alvo.querySelectorAll('[data-lj-preco]').forEach(inp => inp.addEventListener('change', () => { loja.estoque[+inp.dataset.ljPreco].precoPO = Math.max(0, Number(inp.value) || 0); }));
      alvo.querySelectorAll('[data-lj-qtd]').forEach(inp => inp.addEventListener('change', () => { loja.estoque[+inp.dataset.ljQtd].qtd = Math.max(-1, Math.trunc(Number(inp.value) || 0)); }));
      alvo.querySelectorAll('[data-lj-rem]').forEach(b => b.addEventListener('click', () => { loja.estoque.splice(+b.dataset.ljRem, 1); renderEstoque(); }));
    }
    renderEstoque();

    wrap.querySelector('#ljAddItem').addEventListener('click', () => {
      const sel = wrap.querySelector('#ljItemSel');
      const nome = sel.value;
      if (!nome || loja.estoque.some(e => e.nome === nome)) return;
      loja.estoque.push({ nome, precoPO: Math.max(0, Number(sel.selectedOptions[0].dataset.preco) || 0), qtd: -1 });
      renderEstoque();
    });
    wrap.querySelector('#ljSalvar').addEventListener('click', async () => {
      loja.nome = wrap.querySelector('#ljNome').value.trim() || loja.nome;
      loja.compraDoJogador = {
        aceita: wrap.querySelector('#ljCompra').checked,
        multiplicador: Math.max(0, Math.min(2, (Number(wrap.querySelector('#ljMult').value) || 50) / 100)),
      };
      const i = lojas.findIndex(l => l.id === loja.id);
      if (i >= 0) lojas[i] = loja; else lojas.push(loja);
      await salvarLojas();
      fecharModalLoja(); render();
    });
    const btnExcluir = wrap.querySelector('#ljExcluir');
    if (btnExcluir) btnExcluir.addEventListener('click', async () => {
      if (!confirm(`Excluir a loja "${loja.nome}"?`)) return;
      lojas = lojas.filter(l => l.id !== loja.id);
      await salvarLojas();
      fecharModalLoja(); render();
    });
    wrap.querySelector('#ljFechar').addEventListener('click', fecharModalLoja);
  }

  // ----- Compra/venda (jogador; o Mestre também pode, com qualquer ficha) -----
  function fichasCompraveis() {
    const todas = (typeof fichas !== 'undefined' && Array.isArray(fichas)) ? fichas : [];
    return todas.filter(f => f.status !== 'morto' &&
      (ehMestre || !f.donoUid || !window.MEU_UID || f.donoUid === window.MEU_UID));
  }

  function abrirLojaCompra(npc) {
    const loja = lojaDoNpc(npc.id);
    if (!loja) { alert('Este lojista ainda não montou a banca.'); return; }
    const minhas = fichasCompraveis();
    if (!minhas.length) { alert('Nenhuma ficha sua disponível para comprar.'); return; }
    const itens = (typeof itensDaLojaNpc === 'function') ? itensDaLojaNpc(loja) : [];
    const wrap = modalLoja(`
      <h2>🛒 ${esc(loja.nome)}</h2>
      <div class="sub">${esc(npc.nome)}${npc.localizacao ? ' · 📍 ' + esc(npc.localizacao) : ''}</div>
      <label>Comprar com <select id="lcFicha">${minhas.map(f => `<option value="${esc(f.id)}">${esc(f.nome)} (${f.ouro || 0} po)</option>`).join('')}</select></label>
      <div id="lcLista"></div>
      <div id="lcVenda"></div>
      <div id="lcMsg" class="envio-msg"></div>
      <div class="ficha-card-acoes"><button class="btn-secondary" id="lcFechar">Fechar</button></div>`);

    const fichaSel = () => minhas.find(f => f.id === wrap.querySelector('#lcFicha').value);

    function renderCompra() {
      wrap.querySelector('#lcLista').innerHTML = itens.length ? itens.map(i => `
        <div class="dado-row lj-linha">
          <span class="lj-nome" title="${esc(i.descricao)}">${esc(i.nome)}${i.raridade ? ' ✨' : ''}</span>
          <span><b>${i.precoPO} po</b></span>
          <span>${i.qtd < 0 ? '∞' : (i.qtd === 0 ? '<i>esgotado</i>' : `${i.qtd}×`)}</span>
          ${i.qtd !== 0 ? `<button class="btn-primary btn-mini" data-lc-comprar="${esc(i.nome)}">Comprar</button>` : ''}
        </div>`).join('') : '<p class="criador-hint">A banca está vazia.</p>';
      wrap.querySelectorAll('[data-lc-comprar]').forEach(b => b.addEventListener('click', () => operacao('comprar', b.dataset.lcComprar)));
      renderVenda();
    }

    function renderVenda() {
      const alvo = wrap.querySelector('#lcVenda');
      const f = fichaSel();
      const compra = loja.compraDoJogador || {};
      if (!compra.aceita || !f) { alvo.innerHTML = ''; return; }
      const vendaveis = [];
      const vistos = new Set();
      (f.itens || []).forEach(nome => {
        if (vistos.has(nome)) return;
        vistos.add(nome);
        const preco = (typeof precoRecompraLojaNpc === 'function') ? precoRecompraLojaNpc(loja, nome) : null;
        if (preco !== null) vendaveis.push({ nome, preco, qtd: f.itens.filter(x => x === nome).length });
      });
      alvo.innerHTML = vendaveis.length ? `<h4>💰 O lojista compra de você (${Math.round((compra.multiplicador || 0.5) * 100)}% do preço):</h4>` +
        vendaveis.map(v => `
          <div class="dado-row lj-linha">
            <span class="lj-nome">${esc(v.nome)} (${v.qtd}×)</span>
            <span><b>${v.preco} po</b></span>
            <button class="btn-secondary btn-mini" data-lc-vender="${esc(v.nome)}">Vender 1</button>
          </div>`).join('') : '';
      alvo.querySelectorAll('[data-lc-vender]').forEach(b => b.addEventListener('click', () => operacao('vender', b.dataset.lcVender)));
    }

    async function operacao(tipo, itemNome) {
      const f = fichaSel();
      if (!f) return;
      const msg = wrap.querySelector('#lcMsg');
      try {
        const r = await fetch(`/api/lojas/${tipo}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lojaId: loja.id, fichaId: f.id, itemNome, qtd: 1 }),
        });
        const d = await r.json();
        if (!r.ok || d.erro) { msg.textContent = `✗ ${d.erro || 'Falhou.'}`; return; }
        // espelha localmente o que o servidor já persistiu
        if (tipo === 'comprar') {
          f.ouro = d.ouroRestante;
          f.itens = f.itens || []; f.itens.push(itemNome);
          const e = (loja.estoque || []).find(x => x.nome === itemNome);
          if (e && e.qtd > 0) e.qtd--;
          const it = itens.find(x => x.nome === itemNome);
          if (it && it.qtd > 0) it.qtd--;
          msg.textContent = `✓ ${itemNome} comprado (${d.total} po). Restam ${d.ouroRestante} po.`;
        } else {
          f.ouro = d.ouroRestante;
          const i = (f.itens || []).indexOf(itemNome);
          if (i >= 0) f.itens.splice(i, 1);
          const e = (loja.estoque || []).find(x => x.nome === itemNome);
          if (e && e.qtd >= 0) e.qtd++;
          const it = itens.find(x => x.nome === itemNome);
          if (it && it.qtd >= 0) it.qtd++;
          msg.textContent = `✓ ${itemNome} vendido por ${d.valor} po. Agora tem ${d.ouroRestante} po.`;
        }
        wrap.querySelectorAll('#lcFicha option').forEach(o => { const ff = minhas.find(x => x.id === o.value); if (ff) o.textContent = `${ff.nome} (${ff.ouro || 0} po)`; });
        renderCompra();
      } catch (e) { msg.textContent = '✗ Erro de rede.'; }
    }

    wrap.querySelector('#lcFicha').addEventListener('change', renderVenda);
    wrap.querySelector('#lcFechar').addEventListener('click', fecharModalLoja);
    renderCompra();
  }

  // Mestre: ver o banco de um membro da campanha ativa
  async function montarBancoMembros() {
    const sel = $('bancoMembroSel');
    const btn = $('verBancoMembro');
    if (!ehMestre || !sel || !btn) return;
    try {
      const info = await (await fetch('/api/campanha_info')).json();
      const membros = info.membros || [];
      if (info.legado || !membros.length) {
        sel.innerHTML = '<option value="">(campanha sem membros geridos)</option>';
        btn.disabled = true;
        return;
      }
      sel.innerHTML = membros.map(m => `<option value="${esc(m.uid)}">${esc(m.nome)}</option>`).join('');
    } catch (e) { btn.disabled = true; return; }
    btn.addEventListener('click', async () => {
      if (!sel.value) return;
      try {
        const r = await (await fetch(`/api/banco_npc/${encodeURIComponent(sel.value)}`)).json();
        bancoMembro = Array.isArray(r) ? r : [];
      } catch (e) { bancoMembro = []; }
      $('bancoMembroTitulo').textContent = `Banco de ${sel.options[sel.selectedIndex].text}`;
      $('bancoMembroWrap').classList.remove('hidden');
      renderBanco();
    });
  }

  window.npcCriarDeMonstro = function (monstro) {
    if (!modal) return;
    editandoId = null;
    $('nNome').value = monstro.nome;
    $('nTipo').value = 'inimigo';
    $('nLocal').value = '';
    $('nDescricao').value = `${monstro.tipo} (ND ${monstro.cr})`;
    $('nNotasPrivadas').value = '';
    $('nVisivel').checked = true;
    $('nTemStat').checked = true;
    
    const caNum = parseInt(monstro.ca) || 10;
    $('nCa').value = caNum;
    
    const hpNum = parseInt(monstro.hp) || 10;
    $('nPv').value = hpNum;
    
    ['for', 'des', 'con', 'int', 'sab', 'car'].forEach(k => {
      $('nAttr_' + k).value = monstro.atributos ? (monstro.atributos[k.toUpperCase()] || 10) : 10;
    });
    
    const acoes = [];
    if (monstro.acoes) {
      monstro.acoes.forEach(a => acoes.push(a));
    }
    if (monstro.conjuracao) {
      monstro.conjuracao.forEach(c => acoes.push('Conjuração: ' + c));
    }
    $('nAcoes').value = acoes.join('\n');
    
    atualizarStatWrap();
    $('npcModalTitulo').textContent = 'Promover Monstro a NPC';
    modal.classList.remove('hidden');
    
    const tabNpcs = document.querySelector('[data-tab="npcs"]');
    if (tabNpcs) tabNpcs.click();
  };

  // ---------- Modal de edição (só o Mestre tem o #modalNpc) ----------
  const modal = $('modalNpc');
  function abrirModal(id) {
    if (!modal) return;
    editandoId = id || null;
    const n = id ? npcs.find(x => x.id === id) : null;
    const sb = n && n.statBlock;
    $('nNome').value = n ? n.nome : '';
    $('nTipo').innerHTML = NPC_TIPOS.map(([k, r]) => `<option value="${k}" ${n && n.tipo === k ? 'selected' : ''}>${r}</option>`).join('');
    $('nLocal').value = n ? (n.localizacao || '') : '';
    $('nDescricao').value = n ? (n.descricao || '') : '';
    $('nNotasPrivadas').value = n ? (n.notasPrivadas || '') : '';
    $('nVisivel').checked = n ? !!n.visivelParaJogadores : true;
    $('nTemStat').checked = !!sb;
    $('nCa').value = sb ? sb.ca : 11;
    $('nPv').value = sb ? sb.pvMax : 8;
    ['for', 'des', 'con', 'int', 'sab', 'car'].forEach(k => {
      $('nAttr_' + k).value = sb && sb.atributos ? (sb.atributos[k] || 10) : 10;
    });
    $('nAcoes').value = sb && sb.acoes ? sb.acoes.join('\n') : '';
    atualizarStatWrap();
    $('npcModalTitulo').textContent = n ? 'Editar NPC' : 'Novo NPC';
    modal.classList.remove('hidden');
  }
  function atualizarStatWrap() {
    $('nStatWrap').classList.toggle('hidden', !$('nTemStat').checked);
  }

  function salvarModal() {
    const nome = $('nNome').value.trim();
    if (!nome) { alert('Dê um nome ao NPC.'); return; }
    const temStat = $('nTemStat').checked;
    const pvMax = Math.max(1, Number($('nPv').value) || 1);
    const atual = editandoId ? npcs.find(x => x.id === editandoId) : null;
    const statAnterior = atual && atual.statBlock;
    const novo = {
      id: editandoId || uidNpc(),
      nome,
      tipo: $('nTipo').value,
      localizacao: $('nLocal').value.trim(),
      descricao: $('nDescricao').value.trim(),
      notasPrivadas: $('nNotasPrivadas').value.trim(),
      visivelParaJogadores: $('nVisivel').checked,
      statBlock: temStat ? {
        ca: Math.max(1, Number($('nCa').value) || 10),
        pvMax,
        // preserva o PV atual em edição (se o máximo não diminuiu abaixo dele)
        pvAtual: Math.min(statAnterior ? (statAnterior.pvAtual ?? pvMax) : pvMax, pvMax),
        atributos: Object.fromEntries(['for', 'des', 'con', 'int', 'sab', 'car'].map(k =>
          [k, Math.max(1, Math.min(30, Number($('nAttr_' + k).value) || 10))])),
        acoes: $('nAcoes').value.split('\n').map(s => s.trim()).filter(Boolean),
      } : null,
    };
    if (editandoId) {
      const i = npcs.findIndex(x => x.id === editandoId);
      if (i >= 0) npcs[i] = novo;
    } else {
      npcs.push(novo);
    }
    salvar(); render();
    limparRascunhoNpc(); // Fase B1: salvou de verdade
    modal.classList.add('hidden');
  }

  // ----- Fase B1: rascunho do NPC em edição sobrevive a F5 -----
  const CHAVE_RASCUNHO_NPC = () => `dnd_rascunho_npc_${window.CAMPANHA_ID || 'local'}`;
  const CAMPOS_NPC = ['nNome', 'nLocal', 'nDescricao', 'nNotasPrivadas', 'nCa', 'nPv', 'nAcoes',
    'nAttr_for', 'nAttr_des', 'nAttr_con', 'nAttr_int', 'nAttr_sab', 'nAttr_car'];
  function limparRascunhoNpc() { try { localStorage.removeItem(CHAVE_RASCUNHO_NPC()); } catch (e) {} }
  function restaurarRascunhoNpc() {
    if (!ehMestre || !modal) return;
    let r = null;
    try { r = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO_NPC()) || 'null'); } catch (e) {}
    if (!r || !r.campos) return;
    if (confirm(`📝 Há um NPC não salvo${r.campos.nNome ? ` ("${r.campos.nNome}")` : ''}. Continuar de onde parou?`)) {
      abrirModal(r.editandoId && npcs.some(n => n.id === r.editandoId) ? r.editandoId : null);
      CAMPOS_NPC.forEach(id => { if ($(id) && r.campos[id] != null) $(id).value = r.campos[id]; });
      $('nTipo').value = r.campos.nTipo || 'neutro';
      $('nVisivel').checked = !!r.campos.nVisivel;
      $('nTemStat').checked = !!r.campos.nTemStat;
      atualizarStatWrap();
    }
    limparRascunhoNpc(); // usado ou descartado — não pergunta duas vezes
  }
  if (ehMestre && modal) {
    window.addEventListener('beforeunload', () => {
      if (modal.classList.contains('hidden')) return;
      try {
        const campos = {};
        CAMPOS_NPC.forEach(id => { if ($(id)) campos[id] = $(id).value; });
        campos.nTipo = $('nTipo').value;
        campos.nVisivel = $('nVisivel').checked;
        campos.nTemStat = $('nTemStat').checked;
        localStorage.setItem(CHAVE_RASCUNHO_NPC(), JSON.stringify({ editandoId, campos }));
      } catch (e) {}
    });
  }

  if (ehMestre && modal) {
    const btnNovo = $('novoNpc');
    if (btnNovo) btnNovo.addEventListener('click', () => abrirModal(null));
    const btnNovoCompleto = $('novoNpcCompleto');
    if (btnNovoCompleto) {
      btnNovoCompleto.addEventListener('click', () => {
        Criador.abrir(null, {
          modoNpc: true,
          aoSalvar(ficha) {
            const novo = {
              id: uidNpc(),
              nome: ficha.nome,
              tipo: 'neutro',
              localizacao: '',
              descricao: `${ficha.raca} ${ficha.classe} Nível ${ficha.nivel}`,
              notasPrivadas: '',
              visivelParaJogadores: true,
              statBlock: null,
              fichaCompleta: ficha
            };
            npcs.push(novo);
            salvar();
            render();
          }
        });
      });
    }
    const btnNovoAleatorio = $('novoNpcAleatorio');
    if (btnNovoAleatorio) {
      btnNovoAleatorio.addEventListener('click', () => {
        const crInput = prompt('Digite o ND (CR) para filtrar (ex: 1, 2, 1/2) ou deixe em branco para qualquer ND:');
        if (crInput === null) return;
        let pool = typeof MONSTROS !== 'undefined' ? MONSTROS : [];
        if (crInput.trim()) {
          const filterCr = crInput.trim();
          pool = pool.filter(m => String(m.cr) === filterCr);
        }
        if (!pool.length) {
          alert('Nenhuma criatura encontrada no Bestiário com o ND especificado.');
          return;
        }
        const sorteado = pool[Math.floor(Math.random() * pool.length)];
        window.npcCriarDeMonstro(sorteado);
      });
    }
    $('nTemStat').addEventListener('change', atualizarStatWrap);
    $('npcCancelar').addEventListener('click', () => { limparRascunhoNpc(); modal.classList.add('hidden'); });
    $('npcSalvar').addEventListener('click', salvarModal);
  }

  // Fase 12: as lojas carregam ANTES dos NPCs para o botão "🛒 Ver loja"
  // aparecer logo na primeira renderização dos cartões
  carregarLojas().then(() => carregar()).then(() => restaurarRascunhoNpc());
  carregarBanco();
  montarBancoMembros();
})();
