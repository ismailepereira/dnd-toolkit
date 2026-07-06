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
    if (typeof window._npcsAtualizados === 'function') window._npcsAtualizados(npcs);
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

  carregar().then(() => restaurarRascunhoNpc());
})();
