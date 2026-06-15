// =====================================================
// MODO DE JOGO - ficha viva: gasta PV, espaços de magia, ouro, recursos
// Dedução automática + descanso + condições. window.Jogo.abrir(ficha, {aoAtualizar})
// =====================================================
const Jogo = (function () {
  const $ = id => document.getElementById(id);
  let ficha = null, ctx = null;

  function esc(s) { return s == null ? '' : String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const m = v => Math.floor((v - 10) / 2);
  const fmt = v => (v >= 0 ? '+' : '') + v;

  function rolar(formula) {
    const mt = String(formula).match(/(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?/i);
    if (!mt) return null;
    const n = mt[1] ? +mt[1] : 1, faces = +mt[2], bonus = mt[3] ? parseInt(mt[3].replace(/\s/g, '')) : 0;
    let total = bonus; const ds = [];
    for (let i = 0; i < n; i++) { const r = 1 + Math.floor(Math.random() * faces); ds.push(r); total += r; }
    return { total, ds, bonus, txt: `${ds.join('+')}${bonus ? (bonus > 0 ? '+' + bonus : bonus) : ''} = ${total}` };
  }

  // ----- dados derivados -----
  function chaveClasse() { return CLASSE_NOME_PARA_CHAVE[ficha.classe]; }
  function classeObj() { return CLASSES[chaveClasse()]; }
  function nivelObj() { const c = classeObj(); return c ? c.niveis.find(n => n.nivel === ficha.nivel) : null; }

  function slotsMax() {
    const n = nivelObj();
    if (!n) return null;
    if (n.pactoBruxo) return { pacto: n.pactoBruxo };
    if (n.slotsMagia && n.slotsMagia.some(s => s > 0)) return { normal: n.slotsMagia };
    return null;
  }

  function recursosClasse() {
    const r = [], cm = m(ficha.atributos.car), nivel = ficha.nivel, cl = ficha.classe;
    if (cl === 'Bárbaro') r.push({ nome: 'Fúria', max: nivel >= 17 ? 6 : nivel >= 12 ? 5 : nivel >= 6 ? 4 : nivel >= 3 ? 3 : 2, rec: 'longo' });
    if (cl === 'Monge' && nivel >= 2) r.push({ nome: 'Pontos de Ki', max: nivel, rec: 'curto' });
    if (cl === 'Guerreiro') { if (nivel >= 2) r.push({ nome: 'Surto de Ação', max: nivel >= 17 ? 2 : 1, rec: 'curto' }); r.push({ nome: 'Retomar o Fôlego', max: 1, rec: 'curto' }); }
    if (cl === 'Bardo') r.push({ nome: 'Inspiração Bárdica', max: Math.max(1, cm), rec: nivel >= 5 ? 'curto' : 'longo' });
    if (cl === 'Clérigo' && nivel >= 2) r.push({ nome: 'Canalizar Divindade', max: nivel >= 18 ? 3 : nivel >= 6 ? 2 : 1, rec: 'curto' });
    if (cl === 'Druida' && nivel >= 2) r.push({ nome: 'Forma Selvagem', max: 2, rec: 'curto' });
    if (cl === 'Feiticeiro' && nivel >= 2) r.push({ nome: 'Pontos de Feitiçaria', max: nivel, rec: 'longo' });
    if (cl === 'Paladino') { r.push({ nome: 'Imposição das Mãos (PV)', max: nivel * 5, rec: 'longo', pool: true }); if (nivel >= 3) r.push({ nome: 'Canalizar Divindade', max: 1, rec: 'curto' }); }
    return r;
  }

  // ----- estado de jogo na ficha -----
  function garantirEstado() {
    if (ficha.hpAtual == null) ficha.hpAtual = ficha.hpMax || 1;
    if (ficha.pvTemp == null) ficha.pvTemp = 0;
    if (!ficha.slotsUsados) ficha.slotsUsados = {};
    if (ficha.pactoUsados == null) ficha.pactoUsados = 0;
    if (!ficha.recursosUsados) ficha.recursosUsados = {};
    if (ficha.dvUsados == null) ficha.dvUsados = 0;
    if (!ficha.condicoes) ficha.condicoes = [];
    if (ficha.ouro == null) ficha.ouro = 0;
  }

  function salvar() { if (ctx.aoAtualizar) ctx.aoAtualizar(); render(); }

  // ----- ações -----
  function aplicarDano(v) {
    let dano = v;
    if (ficha.pvTemp > 0) { const abs = Math.min(ficha.pvTemp, dano); ficha.pvTemp -= abs; dano -= abs; }
    ficha.hpAtual = Math.max(0, ficha.hpAtual - dano);
    salvar();
  }
  function curar(v) { ficha.hpAtual = Math.min(ficha.hpMax, ficha.hpAtual + v); salvar(); }
  function setTemp(v) { ficha.pvTemp = Math.max(0, v); salvar(); }

  function gastarSlot(nivel) {
    const max = slotsMax();
    if (!max || !max.normal) return;
    const usados = ficha.slotsUsados[nivel] || 0;
    if (usados < max.normal[nivel - 1]) { ficha.slotsUsados[nivel] = usados + 1; salvar(); }
  }
  function recuperarSlot(nivel) {
    const usados = ficha.slotsUsados[nivel] || 0;
    if (usados > 0) { ficha.slotsUsados[nivel] = usados - 1; salvar(); }
  }

  function descansoCurto() {
    recursosClasse().forEach(r => { if (r.rec === 'curto') ficha.recursosUsados[r.nome] = 0; });
    const max = slotsMax();
    if (max && max.pacto) ficha.pactoUsados = 0; // Bruxo recupera no descanso curto
    salvar();
  }
  function descansoLongo() {
    ficha.hpAtual = ficha.hpMax;
    ficha.pvTemp = 0;
    ficha.slotsUsados = {};
    ficha.pactoUsados = 0;
    ficha.recursosUsados = {};
    const c = classeObj();
    const dvMax = ficha.nivel;
    ficha.dvUsados = Math.max(0, ficha.dvUsados - Math.max(1, Math.floor(dvMax / 2)));
    salvar();
  }

  function gastarDadoVida() {
    if (ficha.dvUsados >= ficha.nivel) return;
    const c = classeObj();
    const r = rolar((c ? c.dadoVida : 'd8') + '+' + m(ficha.atributos.con));
    ficha.dvUsados++;
    ficha.hpAtual = Math.min(ficha.hpMax, ficha.hpAtual + Math.max(1, r.total));
    log(`Dado de Vida: curou ${r.total} (${r.txt})`);
    salvar();
  }

  // log simples na sessão
  let registro = [];
  function log(txt) { registro.unshift(txt); registro = registro.slice(0, 8); }

  // ----- render -----
  function render() {
    garantirEstado();
    const f = ficha, a = f.atributos, pb = nivelObj() ? nivelObj().bonusProf : 2;
    const pctHp = f.hpMax > 0 ? Math.max(0, Math.min(100, (f.hpAtual / f.hpMax) * 100)) : 0;
    const corHp = pctHp > 50 ? '#3fb950' : pctHp > 25 ? '#d29922' : '#e94560';

    // atributos
    const attrHtml = ATRIBUTOS.map(at => `<div class="jg-attr"><span>${at.nome.slice(0, 3).toUpperCase()}</span><b>${a[at.chave]}</b><i>${fmt(m(a[at.chave]))}</i></div>`).join('');

    // espaços de magia
    let slotsHtml = '';
    const sm = slotsMax();
    if (sm && sm.normal) {
      slotsHtml = '<div class="jg-bloco"><h4>Espaços de Magia</h4>';
      sm.normal.forEach((qtd, i) => {
        if (qtd <= 0) return;
        const nivel = i + 1, usados = f.slotsUsados[nivel] || 0;
        let bolinhas = '';
        for (let k = 0; k < qtd; k++) bolinhas += `<span class="slot ${k < usados ? 'usado' : ''}"></span>`;
        slotsHtml += `<div class="jg-slot-linha"><span>${nivel}º</span><div class="slots">${bolinhas}</div>
          <button data-slotgastar="${nivel}" class="btn-mini">−</button><button data-slotrec="${nivel}" class="btn-mini">+</button></div>`;
      });
      slotsHtml += '</div>';
    } else if (sm && sm.pacto) {
      const usados = f.pactoUsados || 0; let bol = '';
      for (let k = 0; k < sm.pacto.slots; k++) bol += `<span class="slot ${k < usados ? 'usado' : ''}"></span>`;
      slotsHtml = `<div class="jg-bloco"><h4>Magia de Pacto (nível ${sm.pacto.nivel})</h4>
        <div class="jg-slot-linha"><div class="slots">${bol}</div>
        <button data-pacto="-1" class="btn-mini">−</button><button data-pacto="1" class="btn-mini">+</button></div></div>`;
    }

    // recursos
    const recs = recursosClasse();
    let recHtml = '';
    if (recs.length) {
      recHtml = '<div class="jg-bloco"><h4>Recursos de Classe</h4>';
      recs.forEach(r => {
        const usados = f.recursosUsados[r.nome] || 0, restantes = r.max - usados;
        recHtml += `<div class="jg-rec"><span>${esc(r.nome)} <small>(${r.rec})</small></span>
          <span class="jg-rec-ctrl"><button data-recm="${esc(r.nome)}" class="btn-mini">−</button>
          <b>${restantes}/${r.max}</b><button data-recp="${esc(r.nome)}" class="btn-mini">+</button></span></div>`;
      });
      recHtml += '</div>';
    }

    // magias detalhadas
    const todasMagias = [...(f.truques || []), ...(f.magias1 || [])];
    let magiasHtml = '';
    if (todasMagias.length) {
      magiasHtml = '<div class="jg-bloco"><h4>Magias</h4>';
      todasMagias.forEach(nome => {
        const d = (typeof detalheMagia === 'function') ? detalheMagia(nome) : null;
        if (d) {
          magiasHtml += `<details class="jg-magia"><summary>${esc(nome)} ${d.dano && d.dano !== '—' ? `<span class="jg-dano">${esc(d.dano)}</span>` : ''}</summary>
            <div class="jg-magia-corpo"><div class="jg-magia-meta">${d.nivel === 0 ? 'Truque' : d.nivel + 'º'} · ${esc(d.escola)} · ${esc(d.tempo)} · ${esc(d.alcance)} · ${esc(d.duracao)}${d.salva && d.salva !== '—' ? ' · ' + esc(d.salva) : ''}</div>
            <p>${esc(d.descricao)}</p>
            ${d.dano && /\d+d\d+/.test(d.dano) ? `<button data-rolarmagia="${esc(d.dano)}" data-nome="${esc(nome)}" class="btn-mini">🎲 Rolar dano</button>` : ''}</div></details>`;
        } else {
          magiasHtml += `<div class="jg-magia-simples">${esc(nome)}</div>`;
        }
      });
      magiasHtml += '</div>';
    }

    // características acumuladas até o nível atual (com descrição do que fazem)
    const cls = classeObj();
    let caracHtml = '';
    if (cls) {
      const linhas = [];
      cls.niveis.filter(n => n.nivel <= f.nivel).forEach(n => {
        n.caracteristicas.forEach(ca => {
          const d = (typeof detalheCaracteristica === 'function') ? detalheCaracteristica(ca) : null;
          if (d) linhas.push(`<details class="jg-magia"><summary><span class="jg-nv-tag">N${n.nivel}</span> ${esc(ca)}</summary><div class="jg-magia-corpo"><p>${esc(d)}</p></div></details>`);
          else linhas.push(`<div class="jg-magia-simples"><span class="jg-nv-tag">N${n.nivel}</span> ${esc(ca)}</div>`);
        });
      });
      if (f.subclasse) linhas.unshift(`<div class="jg-magia-simples"><strong>Especialização:</strong> ${esc(f.subclasse)}</div>`);
      if ((f.talentos || []).length) f.talentos.forEach(t => linhas.unshift(`<div class="jg-magia-simples"><strong>Talento:</strong> ${esc(t)}</div>`));
      caracHtml = `<div class="jg-bloco"><h4>Características de Classe</h4>${linhas.join('')}</div>`;
    }

    // condições
    const condHtml = `<div class="jg-bloco"><h4>Condições</h4><div class="jg-cond-grid">` +
      Object.keys(CONDICOES).map(c => {
        const on = f.condicoes.includes(c);
        return `<label class="check-chip ${on ? 'on' : ''}" title="${esc(CONDICOES[c])}"><input type="checkbox" data-cond="${esc(c)}" ${on ? 'checked' : ''}>${esc(c)}</label>`;
      }).join('') + `</div></div>`;

    const logHtml = registro.length ? `<div class="jg-bloco"><h4>Histórico</h4><ul class="jg-log">${registro.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div>` : '';

    // ataques de arma, penalidades e bolsa de inventário
    const avisos = (typeof penalidadesEquipamento === 'function') ? penalidadesEquipamento(f) : [];
    const armas = (f.itens || []).map(n => (typeof ataqueArma === 'function') ? ataqueArma(f, n, pb) : null).filter(Boolean);
    const armasHtml = armas.length ? `<div class="jg-bloco"><h4>Ataques de Arma</h4>${armas.map(a => `<div class="pv-linha"><strong>${esc(a.nome)}:</strong> ${a.ataque >= 0 ? '+' : ''}${a.ataque} p/ acertar · ${esc(a.dano)} ${/\d+d\d+/.test(a.dano) ? `<button class="btn-mini" data-rolararma="${esc(a.dano)}" data-arma="${esc(a.nome)}">🎲</button>` : ''}${a.semProf ? ' <span class="pv-warn">⚠ sem prof.</span>' : ''}</div>`).join('')}</div>` : '';
    const itensChips = (f.itens || []).map(i => `<span class="chip">${esc(i)} <button data-rinv="${esc(i)}">×</button></span>`).join('');
    const optsItens = (typeof ITENS_PADRAO !== 'undefined') ? ITENS_PADRAO.map(i => `<option value="${esc(i.nome)}">${esc(i.nome)} (${esc(i.preco)})</option>`).join('') : '';
    const inventarioHtml = `<div class="jg-bloco"><h4>Bolsa / Inventário</h4>
      <div class="pv-linha"><strong>Armadura:</strong> ${esc(f.armadura || 'Sem armadura')}${f.escudo ? ' + Escudo' : ''}</div>
      <div class="chips">${itensChips || '<span class="criador-hint">Sem itens.</span>'}</div>
      <div class="criador-add-item" style="margin-top:6px"><select id="jgItemSel">${optsItens}</select><button id="jgAddItem" class="btn-mini">+ Adicionar</button></div></div>`;
    const avisosHtml = avisos.length ? `<div class="jg-bloco pv-avisos"><h4>⚠ Penalidades</h4>${avisos.map(a => `<div class="pv-linha">${esc(a.texto)}</div>`).join('')}</div>` : '';

    $('modalJogoBody').innerHTML = `
      <div class="jg-header">
        <div>
          <h2>${esc(f.nome)}</h2>
          <div class="jg-sub">${esc(f.raca)} · ${esc(f.classe)} nível ${f.nivel}${f.estilo ? ' · ' + esc(f.estilo) : ''}</div>
        </div>
        <div class="jg-rest">
          <button id="jgSubirNivel" class="btn-primary">⬆️ Subir de Nível</button>
          <button id="jgDescCurto" class="btn-secondary">☕ Descanso Curto</button>
          <button id="jgDescLongo" class="btn-secondary">🌙 Descanso Longo</button>
        </div>
      </div>

      <div class="jg-pv">
        <div class="jg-pv-num">PV <b>${f.hpAtual}</b> / ${f.hpMax}${f.pvTemp ? ` <span class="jg-temp">+${f.pvTemp} temp</span>` : ''} · CA ${f.ca} · Inic ${fmt(f.iniciativa)} · Prof +${pb}</div>
        <div class="jg-pv-bar"><div style="width:${pctHp}%;background:${corHp}"></div></div>
        <div class="jg-pv-acoes">
          <input type="number" id="jgValor" value="5" min="1" style="width:64px">
          <button id="jgDano" class="btn-danger">− Dano</button>
          <button id="jgCura" class="btn-primary">+ Cura</button>
          <button id="jgTemp" class="btn-secondary">PV Temp</button>
          <button id="jgDadoVida" class="btn-secondary">🎲 Dado de Vida (${f.nivel - f.dvUsados}/${f.nivel})</button>
        </div>
      </div>

      <div class="jg-attrs">${attrHtml}</div>

      <div class="jg-cols">
        <div>${slotsHtml}${recHtml}
          <div class="jg-bloco"><h4>Ouro</h4>
            <div class="jg-ouro"><b>${f.ouro} po</b>
              <input type="number" id="jgOuroVal" value="10" style="width:64px">
              <button id="jgOuroMais" class="btn-mini">+</button><button id="jgOuroMenos" class="btn-mini">−</button>
            </div>
          </div>
          ${condHtml}${logHtml}
        </div>
        <div>${armasHtml}${avisosHtml}${inventarioHtml}${magiasHtml}${caracHtml}</div>
      </div>
    `;

    wire();
  }

  function wire() {
    const val = () => Math.max(1, Number($('jgValor').value) || 1);
    $('jgDano').onclick = () => { aplicarDano(val()); log(`Sofreu ${val()} de dano`); };
    $('jgCura').onclick = () => { curar(val()); log(`Curou ${val()} PV`); };
    $('jgTemp').onclick = () => setTemp(val());
    $('jgDadoVida').onclick = gastarDadoVida;
    $('jgDescCurto').onclick = () => { descansoCurto(); log('Descanso curto'); };
    $('jgDescLongo').onclick = () => { descansoLongo(); log('Descanso longo — recuperado'); };
    $('jgSubirNivel').onclick = () => {
      if (typeof Nivel === 'undefined') return;
      Nivel.abrir(ficha, { aoSalvar: () => { log(`Subiu para o nível ${ficha.nivel}!`); salvar(); } });
    };

    const ov = () => Math.max(0, Number($('jgOuroVal').value) || 0);
    $('jgOuroMais').onclick = () => { ficha.ouro += ov(); salvar(); };
    $('jgOuroMenos').onclick = () => { ficha.ouro = Math.max(0, ficha.ouro - ov()); salvar(); };

    // inventário
    if ($('jgAddItem')) $('jgAddItem').onclick = () => {
      const v = $('jgItemSel').value;
      ficha.itens = ficha.itens || [];
      if (v && !ficha.itens.includes(v)) ficha.itens.push(v);
      salvar();
    };
    document.querySelectorAll('[data-rinv]').forEach(b => b.onclick = () => {
      ficha.itens = (ficha.itens || []).filter(x => x !== b.dataset.rinv);
      salvar();
    });
    document.querySelectorAll('[data-rolararma]').forEach(b => b.onclick = () => {
      const r = rolar(b.dataset.rolararma);
      if (r) { log(`${b.dataset.arma}: dano ${r.total} (${r.txt})`); render(); }
    });

    document.querySelectorAll('[data-slotgastar]').forEach(b => b.onclick = () => gastarSlot(+b.dataset.slotgastar));
    document.querySelectorAll('[data-slotrec]').forEach(b => b.onclick = () => recuperarSlot(+b.dataset.slotrec));
    document.querySelectorAll('[data-pacto]').forEach(b => b.onclick = () => {
      const sm = slotsMax(); if (!sm || !sm.pacto) return;
      ficha.pactoUsados = Math.max(0, Math.min(sm.pacto.slots, (ficha.pactoUsados || 0) + (+b.dataset.pacto)));
      salvar();
    });
    document.querySelectorAll('[data-recm]').forEach(b => b.onclick = () => {
      const n = b.dataset.recm; ficha.recursosUsados[n] = Math.min((recursosClasse().find(r => r.nome === n)?.max || 0), (ficha.recursosUsados[n] || 0) + 1); salvar();
    });
    document.querySelectorAll('[data-recp]').forEach(b => b.onclick = () => {
      const n = b.dataset.recp; ficha.recursosUsados[n] = Math.max(0, (ficha.recursosUsados[n] || 0) - 1); salvar();
    });
    document.querySelectorAll('[data-cond]').forEach(c => c.onchange = () => {
      const nome = c.dataset.cond;
      if (c.checked) { if (!ficha.condicoes.includes(nome)) ficha.condicoes.push(nome); }
      else ficha.condicoes = ficha.condicoes.filter(x => x !== nome);
      salvar();
    });
    document.querySelectorAll('[data-rolarmagia]').forEach(b => b.onclick = () => {
      const r = rolar(b.dataset.rolarmagia);
      if (r) { log(`${b.dataset.nome}: dano ${r.total} (${r.txt})`); render(); }
    });
  }

  function abrir(f, opts) {
    ficha = f; ctx = opts || {}; registro = [];
    garantirEstado();
    montarUmaVez();
    render();
    $('modalJogo').classList.remove('hidden');
  }

  let montado = false;
  function montarUmaVez() {
    if (montado) return; montado = true;
    $('jgFechar').onclick = () => $('modalJogo').classList.add('hidden');
  }

  return { abrir };
})();
window.Jogo = Jogo;
