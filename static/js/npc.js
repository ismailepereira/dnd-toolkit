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
    const pct = sb && sb.pvMax > 0 ? Math.max(0, Math.min(100, (sb.pvAtual / sb.pvMax) * 100)) : 0;
    return `<div class="ficha-card npc-card npc-${esc(n.tipo)}">
      <h3>${esc(n.nome) || 'Sem nome'}</h3>
      <div class="sub">${rotuloTipo(n.tipo)}${n.localizacao ? ' · 📍 ' + esc(n.localizacao) : ''}</div>
      ${n.descricao ? `<div class="npc-desc">${esc(n.descricao)}</div>` : ''}
      ${sb ? `<div>CA ${sb.ca} · PV ${sb.pvAtual}/${sb.pvMax}</div>
        <div class="hp-bar"><div class="hp-bar-fill" style="width:${pct}%"></div></div>` : ''}
      ${ehMestre && n.notasPrivadas ? `<div class="npc-notas-privadas">🔒 ${esc(n.notasPrivadas)}</div>` : ''}
      ${ehMestre ? `
        <label class="check-chip npc-visivel ${n.visivelParaJogadores ? 'on' : ''}">
          <input type="checkbox" data-npc-visivel="${esc(n.id)}" ${n.visivelParaJogadores ? 'checked' : ''}> 👁️ Visível p/ jogadores
        </label>
        <div class="ficha-card-acoes">
          <button class="btn-editar" data-npc-editar="${esc(n.id)}">✎ Editar</button>
          <button class="btn-danger" data-npc-excluir="${esc(n.id)}">Excluir</button>
        </div>` : ''}
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
      el.querySelectorAll('[data-npc-editar]').forEach(b => b.addEventListener('click', () => abrirModal(b.dataset.npcEditar)));
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
    if (typeof window._npcsAtualizados === 'function') window._npcsAtualizados(npcs);
  }

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
    modal.classList.add('hidden');
  }

  if (ehMestre && modal) {
    const btnNovo = $('novoNpc');
    if (btnNovo) btnNovo.addEventListener('click', () => abrirModal(null));
    $('nTemStat').addEventListener('change', atualizarStatWrap);
    $('npcCancelar').addEventListener('click', () => modal.classList.add('hidden'));
    $('npcSalvar').addEventListener('click', salvarModal);
  }

  carregar();
})();
