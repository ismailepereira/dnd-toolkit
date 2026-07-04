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

  // ----- rolagem com Vantagem/Desvantagem -----
  let modoRolagem = 'normal';
  function d20Modo() {
    const a = 1 + Math.floor(Math.random() * 20);
    if (modoRolagem === 'normal') return { v: a, txt: `d20=${a}` };
    const b = 1 + Math.floor(Math.random() * 20);
    const v = modoRolagem === 'vantagem' ? Math.max(a, b) : Math.min(a, b);
    return { v, txt: `d20 ${a}/${b}→${v} (${modoRolagem === 'vantagem' ? 'vant.' : 'desv.'})`, nat: v };
  }
  function rolarTeste(nome, bonus) {
    const r = d20Modo();
    const total = r.v + bonus;
    const critMsg = r.v === 20 ? ' (20 natural!)' : r.v === 1 ? ' (1 natural)' : '';
    log(`${nome}: ${total} (${r.txt}${bonus ? (bonus >= 0 ? '+' : '') + bonus : ''})${critMsg}`);
    render();
  }

  // ----- dados derivados -----
  function chaveClasse() { return CLASSE_NOME_PARA_CHAVE[ficha.classe]; }
  function classeObj() { return CLASSES[chaveClasse()]; }
  function nivelObj() { const c = classeObj(); return c ? c.niveis.find(n => n.nivel === ficha.nivel) : null; }
  function pbAtual() { const n = nivelObj(); return n ? n.bonusProf : 2; }
  function profPericia(p) { return (ficha.pericias || []).includes(p); }
  function profSalva(nomePt) { return (classeObj() ? classeObj().salvaguardas : []).includes(nomePt); }
  function bonusPericia(p) { return m(ficha.atributos[PERICIAS[p]]) + (profPericia(p) ? pbAtual() : 0); }
  function bonusSalva(at) {
    const nomePt = ATRIBUTOS.find(a => a.chave === at).nome;
    return m(ficha.atributos[at]) + (profSalva(nomePt) ? pbAtual() : 0);
  }

  // ----- grimório vs. magias preparadas (Mago e demais conjuradores que preparam) -----
  function ehPreparador() { return typeof PREPARA !== 'undefined' && !!PREPARA[ficha.classe]; }
  function limitePreparadas() {
    return (typeof magiasNoNivel === 'function') ? magiasNoNivel(ficha.classe, ficha.nivel, ficha.atributos) : 0;
  }
  // magias de círculo que o personagem realmente pode lançar hoje
  function magiasCastaveis() { return ehPreparador() ? (ficha.preparadas || []) : (ficha.magias1 || []); }
  function alternarPreparada(nome) {
    if (!ficha.preparadas) ficha.preparadas = [];
    const i = ficha.preparadas.indexOf(nome);
    if (i >= 0) { ficha.preparadas.splice(i, 1); log(`Despreparou ${nome}.`); salvar(); return; }
    const lim = limitePreparadas();
    if (ficha.preparadas.length >= lim) { log(`Limite de magias preparadas atingido (${lim}).`); render(); return; }
    ficha.preparadas.push(nome); log(`Preparou ${nome}.`); salvar();
  }

  function testeMorte() {
    const r = 1 + Math.floor(Math.random() * 20);
    if (r === 20) { ficha.hpAtual = 1; ficha.morteSucessos = 0; ficha.morteFalhas = 0; log('🎲 Teste de Morte: 20 natural! Recupera 1 PV e fica de pé.'); }
    else if (r === 1) { ficha.morteFalhas = (ficha.morteFalhas || 0) + 2; log('🎲 Teste de Morte: 1 natural — DUAS falhas!'); }
    else if (r >= 10) { ficha.morteSucessos = (ficha.morteSucessos || 0) + 1; log(`🎲 Teste de Morte: ${r} — sucesso.`); }
    else { ficha.morteFalhas = (ficha.morteFalhas || 0) + 1; log(`🎲 Teste de Morte: ${r} — falha.`); }
    if ((ficha.morteFalhas || 0) >= 3) log('💀 O personagem MORREU.');
    else if ((ficha.morteSucessos || 0) >= 3) { ficha.morteSucessos = 3; log('✅ Estabilizado (inconsciente).'); }
    salvar();
  }

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

  // ----- equipamento: slots mecânicos -----
  // deriva os campos legados (armadura/escudo) dos slots e recalcula a CA
  function sincronizarSlots() {
    ficha.armadura = (ficha.equipado && ficha.equipado.armadura) || 'Sem armadura';
    ficha.escudo = !!(ficha.equipado && ficha.equipado.maoSecundaria === 'Escudo');
    recalcularCA();
  }
  function recalcularCA() {
    if (!ficha.atributos || typeof ARMADURAS === 'undefined') return;
    const arm = ARMADURAS[ficha.armadura] || ARMADURAS['Sem armadura'];
    const dexMod = mod(ficha.atributos.des);
    let ca;
    if (ficha.armadura === 'Sem armadura' && ficha.classe === 'Bárbaro') ca = 10 + dexMod + mod(ficha.atributos.con);
    else if (ficha.armadura === 'Sem armadura' && ficha.classe === 'Monge') ca = 10 + dexMod + mod(ficha.atributos.sab);
    else if (arm.tipo === 'leve') ca = arm.base + dexMod;
    else if (arm.tipo === 'media') ca = arm.base + Math.min(dexMod, 2);
    else ca = arm.base;
    if (ficha.escudo) ca += 2;
    if (ficha.estilo === 'Defesa' && ficha.armadura !== 'Sem armadura') ca += 1;
    ficha.ca = ca;
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
    if (ficha.morteSucessos == null) ficha.morteSucessos = 0;
    if (ficha.morteFalhas == null) ficha.morteFalhas = 0;
    if (ficha.concentrando == null) ficha.concentrando = '';
    // ----- bolsa + slots (migração de fichas legadas) -----
    ficha.itens = ficha.itens || [];
    if (!ficha.municao || !ficha.municao.nome) ficha.municao = ficha.municao || { nome: '', qtd: 0 };
    if (!ficha.equipado) {
      const cat = n => (typeof itemCatalogo === 'function') ? itemCatalogo(n) : null;
      const armLegada = (ficha.armadura && ficha.armadura !== 'Sem armadura') ? ficha.armadura : '';
      if (armLegada && !ficha.itens.includes(armLegada)) ficha.itens.push(armLegada);
      if (ficha.escudo && !ficha.itens.includes('Escudo')) ficha.itens.push('Escudo');
      ficha.equipado = {
        maoPrincipal: ficha.itens.find(n => cat(n) && cat(n).cat === 'arma') || '',
        maoSecundaria: ficha.escudo ? 'Escudo' : '',
        armadura: armLegada,
        foco: ficha.itens.find(n => cat(n) && cat(n).cat === 'foco') || '',
      };
    }
    // slots apontando p/ itens que não existem mais → esvazia
    ['maoPrincipal', 'maoSecundaria', 'armadura', 'foco'].forEach(k => {
      const v = ficha.equipado[k];
      if (v && !ficha.itens.includes(v)) ficha.equipado[k] = '';
    });
    sincronizarSlots();
    // limpeza: se a classe/subclasse não conjura, limpa dados de magia residuais
    const _conj = typeof ehConjurador === 'function' && ehConjurador(ficha.classe, ficha.nivel, ficha.subclasse);
    if (!_conj) {
      ficha.truques = [];
      ficha.magias1 = [];
      ficha.preparadas = [];
      ficha.concentrando = '';
    } else {
      // migração: na 1ª vez de um conjurador que prepara, já prepara o que couber do grimório
      if (!ficha.preparadas) {
        ficha.preparadas = [];
        if (ehPreparador()) ficha.preparadas = (ficha.magias1 || []).slice(0, limitePreparadas());
      }
      // mantém só preparadas que ainda estão no grimório
      if (ehPreparador()) ficha.preparadas = ficha.preparadas.filter(n => (ficha.magias1 || []).includes(n));
    }
  }

  function salvar() {
    // o listener RT pode ter substituído o array fichas — recolocar este objecto no array
    if (typeof fichas !== 'undefined' && ficha && ficha.id) {
      const idx = fichas.findIndex(f => f.id === ficha.id);
      if (idx >= 0) fichas[idx] = ficha;
    }
    if (ctx.aoAtualizar) ctx.aoAtualizar();
    render();
  }

  // checa concentração ao sofrer dano
  function checarConcentracao(dano) {
    if (!ficha.concentrando || dano <= 0) return;
    const dt = Math.max(10, Math.floor(dano / 2));
    const profCon = profSalva('Constituição') ? pbAtual() : 0;
    const r = 1 + Math.floor(Math.random() * 20), total = r + m(ficha.atributos.con) + profCon;
    if (total >= dt) log(`Concentração mantida em ${ficha.concentrando} (salva ${total} vs DT ${dt}).`);
    else { log(`⚠ Concentração PERDIDA em ${ficha.concentrando} (salva ${total} vs DT ${dt}).`); ficha.concentrando = ''; }
  }

  // ----- ações -----
  function aplicarDano(v) {
    let dano = v;
    if (ficha.pvTemp > 0) { const abs = Math.min(ficha.pvTemp, dano); ficha.pvTemp -= abs; dano -= abs; }
    ficha.hpAtual = Math.max(0, ficha.hpAtual - dano);
    checarConcentracao(v);
    if (ficha.hpAtual === 0 && ficha.concentrando) ficha.concentrando = '';
    salvar();
  }
  function curar(v) {
    if (ficha.hpAtual === 0 && v > 0) { ficha.morteSucessos = 0; ficha.morteFalhas = 0; }
    ficha.hpAtual = Math.min(ficha.hpMax, ficha.hpAtual + v);
    salvar();
  }
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

  // card de uma magia (detalhe expansível); comPreparar = mostra botão preparar/despreparar
  function cardMagia(nome, comPreparar) {
    const d = (typeof detalheMagia === 'function') ? detalheMagia(nome) : null;
    const prep = (ficha.preparadas || []).includes(nome);
    const badge = (comPreparar && prep) ? '<span class="jg-prep-badge">✓ preparada</span>' : '';
    const btnPrep = comPreparar
      ? `<button class="btn-mini ${prep ? 'jg-prep-on' : ''}" data-preparar="${esc(nome)}">${prep ? '✓ Despreparar' : '+ Preparar'}</button>`
      : '';
    if (!d) return `<div class="jg-magia-simples">${esc(nome)} ${badge} ${btnPrep}</div>`;
    const rolar = d.dano && /\d+d\d+/.test(d.dano) ? `<button data-rolarmagia="${esc(d.dano)}" data-nome="${esc(nome)}" class="btn-mini">🎲 Rolar dano</button>` : '';
    const acoes = (btnPrep || rolar) ? `<div class="jg-magia-acoes">${btnPrep}${btnPrep && rolar ? ' ' : ''}${rolar}</div>` : '';
    return `<details class="jg-magia ${prep && comPreparar ? 'prep' : ''}"><summary>${esc(nome)} ${badge} ${d.dano && d.dano !== '—' ? `<span class="jg-dano">${esc(d.dano)}</span>` : ''}</summary>
      <div class="jg-magia-corpo"><div class="jg-magia-meta">${d.nivel === 0 ? 'Truque' : d.nivel + 'º'} · ${esc(d.escola)} · ${esc(d.tempo)} · ${esc(d.alcance)} · ${esc(d.duracao)}${d.salva && d.salva !== '—' ? ' · ' + esc(d.salva) : ''}</div>
      <p>${esc(d.descricao)}</p>${acoes}</div></details>`;
  }

  // XP acumulado necessário para cada nível (PHB)
  const XP_NIVEL = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];
  function xpProxNivel(nivel) { return nivel >= 20 ? null : XP_NIVEL[nivel]; } // XP p/ alcançar nivel+1
  function podeSubirPorXP(f) { const alvo = xpProxNivel(f.nivel || 1); return alvo != null && (f.xp || 0) >= alvo; }

  // ----- render -----
  function render() {
    garantirEstado();
    const f = ficha, a = f.atributos, pb = nivelObj() ? nivelObj().bonusProf : 2;
    const pctHp = f.hpMax > 0 ? Math.max(0, Math.min(100, (f.hpAtual / f.hpMax) * 100)) : 0;
    const corHp = pctHp > 50 ? '#3fb950' : pctHp > 25 ? '#d29922' : '#e94560';
    const _ehConj = typeof ehConjurador === 'function' && ehConjurador(f.classe, f.nivel, f.subclasse);

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

    // magias detalhadas: truques (sempre prontos) + grimório/preparadas — só para conjuradores
    const truquesF = _ehConj ? (f.truques || []) : [];
    const grimorioF = _ehConj ? (f.magias1 || []) : [];
    let magiasHtml = '';
    if (_ehConj && (truquesF.length || grimorioF.length)) {
      magiasHtml = '<div class="jg-bloco"><h4>Magias</h4>';

      // Truques — sempre disponíveis, não precisam ser preparados
      if (truquesF.length) {
        magiasHtml += `<div class="jg-magia-grupo"><h5>Truques <small>(sempre prontos)</small></h5>` +
          truquesF.map(n => cardMagia(n, false)).join('') + `</div>`;
      }

      if (ehPreparador() && grimorioF.length) {
        const lim = limitePreparadas();
        const prep = f.preparadas || [];
        const rotuloGrim = f.classe === 'Mago' ? 'Grimório' : 'Magias Conhecidas';
        // resumo das preparadas (chips clicáveis p/ despreparar)
        const intMod = m(f.atributos.int);
        const formula = f.classe === 'Mago' ? ` <small>(INT ${fmt(intMod)} + nível ${f.nivel})</small>` : '';
        magiasHtml += `<div class="jg-magia-grupo jg-preparadas"><h5>🧠 Preparadas hoje <small>(${prep.length}/${lim})</small>${formula}</h5>`;
        if (!prep.length) {
          magiasHtml += `<div class="criador-hint">Nenhuma magia preparada. Prepare magias do ${rotuloGrim.toLowerCase()} abaixo.</div>`;
        } else {
          const ordenadas = [...prep].sort((a, b) => ((detalheMagia(a) || {}).nivel || 0) - ((detalheMagia(b) || {}).nivel || 0));
          magiasHtml += `<div class="jg-prep-chips">` + ordenadas.map(n => {
            const lv = (detalheMagia(n) || {}).nivel;
            return `<button class="jg-prep-chip" data-preparar="${esc(n)}" title="Despreparar">${esc(n)}${lv ? ` <i>${lv}º</i>` : ''} ✕</button>`;
          }).join('') + `</div>`;
        }
        magiasHtml += `</div>`;

        // grimório completo agrupado por círculo, com botão preparar/despreparar
        const circulos = {};
        grimorioF.forEach(n => { const lv = (detalheMagia(n) || {}).nivel || 1; (circulos[lv] = circulos[lv] || []).push(n); });
        let grimHtml = '';
        Object.keys(circulos).map(Number).sort((a, b) => a - b).forEach(lv => {
          grimHtml += `<div class="jg-circulo"><h6>${lv}º Círculo</h6>` + circulos[lv].map(n => cardMagia(n, true)).join('') + `</div>`;
        });
        magiasHtml += `<div class="jg-magia-grupo"><h5>📖 ${rotuloGrim} <small>(${grimorioF.length} magias aprendidas)</small></h5>${grimHtml}</div>`;
      } else if (grimorioF.length) {
        // conjuradores que "conhecem" (Feiticeiro, Bardo, Bruxo, Patrulheiro): todas castáveis
        magiasHtml += `<div class="jg-magia-grupo"><h5>Magias Conhecidas</h5>` +
          grimorioF.map(n => cardMagia(n, false)).join('') + `</div>`;
      }
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
    const eqJogo = f.equipado || {};
    const catJogo = n => (typeof itemCatalogo === 'function') ? itemCatalogo(n) : null;
    const nomesArmas = [...new Set(f.itens || [])];
    // arma equipada primeiro na lista
    nomesArmas.sort((a, b) => (b === eqJogo.maoPrincipal ? 1 : 0) - (a === eqJogo.maoPrincipal ? 1 : 0));
    const armas = nomesArmas.map(n => (typeof ataqueArma === 'function') ? ataqueArma(f, n, pb) : null).filter(Boolean);
    const armasHtml = armas.length ? `<div class="jg-bloco"><h4>Ataques de Arma</h4>${armas.map(a => {
      const it = catJogo(a.nome);
      const equipada = a.nome === eqJogo.maoPrincipal || a.nome === eqJogo.maoSecundaria;
      const usaMunicao = it && it.municaoTipo;
      const municaoOk = !usaMunicao || (f.municao && f.municao.nome === it.municaoTipo && f.municao.qtd > 0);
      return `<div class="pv-linha${equipada ? ' arma-equipada' : ''}"><strong>${equipada ? '✋ ' : ''}${esc(a.nome)}:</strong> ${a.ataque >= 0 ? '+' : ''}${a.ataque} · ${esc(a.dano)}
      <button class="btn-mini" data-atacararma="${a.ataque}" data-arma="${esc(a.nome)}"${usaMunicao && !municaoOk ? ' disabled title="sem munição"' : ''}${usaMunicao ? ` data-municao="${esc(it.municaoTipo)}"` : ''}>🎲 atacar</button>
      ${/\d+d\d+/.test(a.dano) ? `<button class="btn-mini" data-rolararma="${esc(a.dano)}" data-arma="${esc(a.nome)}">🎲 dano</button>` : ''}${a.semProf ? ' <span class="pv-warn">⚠ sem prof.</span>' : ''}${usaMunicao && !municaoOk ? ' <span class="pv-warn">sem munição</span>' : ''}</div>`;
    }).join('')}</div>` : '';

    // perícias clicáveis
    const periciasHtml = `<details class="jg-bloco"><summary><strong>Perícias</strong> (clique para rolar)</summary><div class="jg-pericias-jogo">` +
      Object.keys(PERICIAS).map(p => {
        const b = bonusPericia(p);
        return `<button class="jg-skill ${profPericia(p) ? 'prof' : ''}" data-pericia="${esc(p)}" data-bonus="${b}">${esc(p)} <b>${b >= 0 ? '+' : ''}${b}</b></button>`;
      }).join('') + `</div></details>`;

    // salvaguardas clicáveis
    const salvasHtml = `<div class="jg-bloco"><h4>Salvaguardas</h4><div class="jg-pericias-jogo">` +
      ATRIBUTOS.map(a => {
        const b = bonusSalva(a.chave);
        return `<button class="jg-skill ${profSalva(a.nome) ? 'prof' : ''}" data-salva="${a.chave}" data-snome="${esc(a.nome)}" data-bonus="${b}">${a.nome.slice(0, 3)} <b>${b >= 0 ? '+' : ''}${b}</b></button>`;
      }).join('') + `</div></div>`;

    // concentração (só aparece para conjuradores)
    const magiasConc = _ehConj ? [...magiasCastaveis()] : [];
    const concHtml = _ehConj ? `<div class="jg-bloco"><h4>Concentração</h4>
      <select id="jgConc"><option value="">— Nenhuma —</option>${magiasConc.map(mg => `<option value="${esc(mg)}" ${f.concentrando === mg ? 'selected' : ''}>${esc(mg)}</option>`).join('')}</select>
      ${f.concentrando ? `<div class="criador-hint">Ao sofrer dano: salva de Constituição (DT 10 ou metade do dano) automática.</div>` : ''}</div>` : '';

    // testes de morte (quando a 0 PV)
    const bolinhas = (qtd, max, cls) => { let s = ''; for (let i = 0; i < max; i++) s += `<span class="morte-dot ${i < qtd ? cls : ''}"></span>`; return s; };
    const morteHtml = f.hpAtual === 0 ? `<div class="jg-bloco jg-morte"><h4>☠ Testes de Morte</h4>
      <div class="morte-linha">Sucessos: ${bolinhas(f.morteSucessos, 3, 'ok')}</div>
      <div class="morte-linha">Falhas: ${bolinhas(f.morteFalhas, 3, 'fail')}</div>
      <button id="jgTesteMorte" class="btn-primary">🎲 Rolar Teste de Morte</button>
      ${f.morteFalhas >= 3 ? '<div class="pv-warn">💀 Morto.</div>' : f.morteSucessos >= 3 ? '<div class="criador-hint">Estável (inconsciente).</div>' : ''}</div>` : '';

    // controle de vantagem/desvantagem
    const modoHtml = `<div class="jg-modo">Rolagem:
      <button class="jg-modo-btn ${modoRolagem === 'desvantagem' ? 'on' : ''}" data-modo="desvantagem">Desvantagem</button>
      <button class="jg-modo-btn ${modoRolagem === 'normal' ? 'on' : ''}" data-modo="normal">Normal</button>
      <button class="jg-modo-btn ${modoRolagem === 'vantagem' ? 'on' : ''}" data-modo="vantagem">Vantagem</button>
    </div>`;
    // ----- slots de equipar + bolsa com peso -----
    const contarItem = (n) => (f.itens || []).filter(x => x === n).length;
    const armasBolsa = nomesArmas.filter(n => catJogo(n) && catJogo(n).cat === 'arma');
    const armadurasBolsa = nomesArmas.filter(n => catJogo(n) && catJogo(n).cat === 'armadura');
    const focosBolsa = nomesArmas.filter(n => catJogo(n) && catJogo(n).cat === 'foco');
    const armaP = catJogo(eqJogo.maoPrincipal);
    const duasMaosJg = armaP && armaP.maos === 2;
    const opsSec = duasMaosJg ? [] : [
      ...((f.itens || []).includes('Escudo') ? ['Escudo'] : []),
      ...armasBolsa.filter(n => {
        const it = catJogo(n);
        if (!it || !(it.props || []).includes('leve')) return false;
        return n !== eqJogo.maoPrincipal || contarItem(n) > 1;
      }),
    ];
    const slotJg = (id, rotulo, icone, opcoes, valor, nota) => `
      <label class="slot-eq"><span>${icone} ${rotulo}</span>
        <select data-slot-jogo="${id}"><option value="">— vazio —</option>${[...new Set(opcoes)].map(o =>
          `<option value="${esc(o)}"${valor === o ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>
        ${nota || ''}</label>`;
    const municaoJgHtml = (f.municao && f.municao.nome)
      ? `<div class="slot-eq slot-municao"><span>🏹 Munição</span><b>${esc(f.municao.nome)} × ${f.municao.qtd}</b></div>` : '';
    // peso total e capacidade
    let pesoTotal = 0;
    if (typeof pesoItemKg === 'function') {
      (f.itens || []).forEach(n => { pesoTotal += pesoItemKg(n); });
      if (f.municao && f.municao.nome && typeof CATALOGO !== 'undefined') {
        const pk = CATALOGO.find(i => i.cat === 'municao' && i.municaoNome === f.municao.nome);
        if (pk && pk.qtdPack) pesoTotal += (pk.pesoKg / pk.qtdPack) * f.municao.qtd;
      }
    }
    pesoTotal = Math.round(pesoTotal * 10) / 10;
    const capKg = (f.atributos ? f.atributos.for : 10) * 7.5;
    const sobre = pesoTotal > (f.atributos ? f.atributos.for : 10) * 5;
    const corPeso = pesoTotal > capKg ? '#e94560' : (sobre ? '#d29922' : '#3fb950');
    const itensChips = [...new Set(f.itens || [])].map(i => {
      const qt = contarItem(i);
      const equipadoAqui = [eqJogo.maoPrincipal, eqJogo.maoSecundaria, eqJogo.armadura, eqJogo.foco].includes(i);
      return `<span class="chip${equipadoAqui ? ' equipado' : ''}">${qt > 1 ? qt + '× ' : ''}${esc(i)}${equipadoAqui ? ' ✋' : ''} <button data-rinv="${esc(i)}">×</button></span>`;
    }).join('');
    const optsItens = (() => {
      const nomes = new Set();
      let ops = '';
      if (typeof CATALOGO !== 'undefined') CATALOGO.forEach(i => { if (!nomes.has(i.nome)) { nomes.add(i.nome); ops += `<option value="${esc(i.nome)}">${esc(i.nome)} (${i.precoPO} po)</option>`; } });
      if (typeof ITENS_PADRAO !== 'undefined') ITENS_PADRAO.forEach(i => { if (!nomes.has(i.nome)) { nomes.add(i.nome); ops += `<option value="${esc(i.nome)}">${esc(i.nome)} (${esc(i.preco)})</option>`; } });
      return ops;
    })();
    const inventarioHtml = `<div class="jg-bloco"><h4>🎒 Bolsa & Equipamento</h4>
      <div class="slots-grid">
        ${slotJg('maoPrincipal', 'Mão principal', '🗡️', armasBolsa, eqJogo.maoPrincipal, '')}
        ${slotJg('maoSecundaria', 'Mão secundária', '🛡️', opsSec, eqJogo.maoSecundaria, duasMaosJg ? '<span class="criador-hint-inline">arma de duas mãos</span>' : '')}
        ${slotJg('armadura', 'Armadura', '🥋', armadurasBolsa, eqJogo.armadura, '')}
        ${slotJg('foco', 'Foco / Símbolo', '🔮', focosBolsa, eqJogo.foco, '')}
        ${municaoJgHtml}
      </div>
      <div class="peso-barra"><div style="width:${Math.min(100, capKg ? pesoTotal / capKg * 100 : 0)}%;background:${corPeso}"></div></div>
      <div class="pv-linha">⚖️ <b>${pesoTotal} kg</b> / ${capKg} kg${pesoTotal > capKg ? ' — <span class="pv-warn">MUITO sobrecarregado</span>' : (sobre ? ' — <span class="pv-warn">sobrecarregado (−3m desloc.)</span>' : '')}</div>
      <div class="chips">${itensChips || '<span class="criador-hint">Bolsa vazia.</span>'}</div>
      <div class="criador-add-item" style="margin-top:6px"><select id="jgItemSel">${optsItens}</select><button id="jgAddItem" class="btn-mini">+ Adicionar</button></div></div>`;

    // Sintonização (itens mágicos) — máx. 3
    let sintHtml = '';
    if (typeof itemMagico === 'function') {
      const meusMagicos = (f.itens || []).map(itemMagico).filter(Boolean);
      const sintonizaveis = meusMagicos.filter(m => m.sintonia);
      const passivos = meusMagicos.filter(m => !m.sintonia);
      f.sintonizados = (f.sintonizados || []).filter(n => sintonizaveis.some(m => m.nome === n));
      const nSint = f.sintonizados.length;
      if (meusMagicos.length) {
        sintHtml = `<div class="jg-bloco"><h4>Sintonização <small>(${nSint}/3)</small></h4>
          ${sintonizaveis.length ? sintonizaveis.map(m => {
            const on = f.sintonizados.includes(m.nome);
            return `<label class="jg-sint ${on ? 'on' : ''}"><input type="checkbox" data-sint="${esc(m.nome)}" ${on ? 'checked' : ''} ${!on && nSint >= 3 ? 'disabled' : ''}>
              <span><b>${esc(m.nome)}</b> <small>(${esc(m.raridade)})</small><br><small>${esc(m.efeito)}</small></span></label>`;
          }).join('') : '<span class="criador-hint">Nenhum item que exija sintonização.</span>'}
          ${passivos.length ? `<div class="criador-hint" style="margin-top:6px">⚙️ Sempre ativos (sem sintonização): ${passivos.map(m => esc(m.nome)).join(', ')}.</div>` : ''}</div>`;
      }
    }
    const avisosHtml = avisos.length ? `<div class="jg-bloco pv-avisos"><h4>⚠ Penalidades</h4>${avisos.map(a => `<div class="pv-linha">${esc(a.texto)}</div>`).join('')}</div>` : '';

    $('modalJogoBody').innerHTML = `
      <div class="jg-header">
        <div>
          <h2>${esc(f.nome)}</h2>
          <div class="jg-sub">${esc(f.raca)} · ${esc(f.classe)} nível ${f.nivel}${f.estilo ? ' · ' + esc(f.estilo) : ''}</div>
        </div>
        <div class="jg-rest">
          <button id="jgSubirNivel" class="btn-primary${podeSubirPorXP(f) ? ' jg-pulsa' : ''}">⬆️ Subir de Nível${podeSubirPorXP(f) ? ' ✨' : ''}</button>
          <button id="jgDescCurto" class="btn-secondary">☕ Descanso Curto</button>
          <button id="jgDescLongo" class="btn-secondary">🌙 Descanso Longo</button>
          <button id="jgPDF" class="btn-secondary">🖨️ Ficha PDF</button>
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

      ${modoHtml}
      ${morteHtml}
      <div class="jg-attrs">${attrHtml}</div>

      <div class="jg-cols">
        <div>${salvasHtml}${periciasHtml}${slotsHtml}${recHtml}
          <div class="jg-bloco"><h4>Ouro</h4>
            <div class="jg-ouro"><b>${f.ouro} po</b>
              <input type="number" id="jgOuroVal" value="10" style="width:64px">
              <button id="jgOuroMais" class="btn-mini">+</button><button id="jgOuroMenos" class="btn-mini">−</button>
            </div>
          </div>
          <div class="jg-bloco"><h4>Experiência</h4>
            <div class="jg-ouro"><b>${(f.xp || 0).toLocaleString('pt-BR')} XP</b>
              <input type="number" id="jgXpVal" value="100" style="width:72px">
              <button id="jgXpMais" class="btn-mini">+ Ganhar</button>
            </div>
            <div class="pv-linha">${xpProxNivel(f.nivel || 1) == null ? 'Nível máximo (20).' : `Próximo nível: <b>${xpProxNivel(f.nivel).toLocaleString('pt-BR')}</b> XP${podeSubirPorXP(f) ? ' — <span class="jg-subir-ok">pode subir! ✨</span>' : ''}`}</div>
          </div>
          ${condHtml}${logHtml}
        </div>
        <div>${armasHtml}${concHtml}${avisosHtml}${inventarioHtml}${sintHtml}${magiasHtml}${caracHtml}</div>
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

    if ($('jgXpMais')) $('jgXpMais').onclick = () => {
      const v = Math.max(0, Number($('jgXpVal').value) || 0);
      ficha.xp = (ficha.xp || 0) + v;
      log(`Ganhou ${v} XP (total ${ficha.xp})`);
      if (podeSubirPorXP(ficha)) log('✨ XP suficiente para subir de nível!');
      salvar();
    };
    if ($('jgPDF')) $('jgPDF').onclick = () => exportarFichaPDF(ficha);

    // inventário
    if ($('jgAddItem')) $('jgAddItem').onclick = () => {
      const v = $('jgItemSel').value;
      if (!v) return;
      ficha.itens = ficha.itens || [];
      const it = (typeof itemCatalogo === 'function') ? itemCatalogo(v) : null;
      // packs de munição viram contador do slot
      if (it && it.cat === 'municao' && (!ficha.municao.nome || ficha.municao.nome === it.municaoNome)) {
        ficha.municao.nome = it.municaoNome;
        ficha.municao.qtd += it.qtdPack;
      } else {
        ficha.itens.push(v);
      }
      salvar();
    };
    document.querySelectorAll('[data-rinv]').forEach(b => b.onclick = () => {
      const n = b.dataset.rinv;
      const i = (ficha.itens || []).indexOf(n);
      if (i >= 0) ficha.itens.splice(i, 1); // remove 1 unidade
      ['maoPrincipal', 'maoSecundaria', 'armadura', 'foco'].forEach(k => {
        if (ficha.equipado && ficha.equipado[k] === n && !ficha.itens.includes(n)) ficha.equipado[k] = '';
      });
      sincronizarSlots();
      salvar();
    });
    // slots de equipar: mudar recalcula CA e salva na hora
    document.querySelectorAll('[data-slot-jogo]').forEach(sel => sel.onchange = () => {
      ficha.equipado = ficha.equipado || { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '' };
      ficha.equipado[sel.dataset.slotJogo] = sel.value;
      if (sel.dataset.slotJogo === 'maoPrincipal') {
        const it = (typeof itemCatalogo === 'function') ? itemCatalogo(sel.value) : null;
        if (it && it.maos === 2) ficha.equipado.maoSecundaria = '';
      }
      sincronizarSlots();
      log(`Equipou: ${sel.value || 'nada'} (${sel.dataset.slotJogo === 'armadura' ? 'armadura' : sel.dataset.slotJogo === 'foco' ? 'foco' : 'mão'}) — CA ${ficha.ca}`);
      salvar();
    });
    // sintonização (máx. 3)
    document.querySelectorAll('[data-sint]').forEach(chk => chk.onchange = () => {
      const nome = chk.dataset.sint;
      ficha.sintonizados = ficha.sintonizados || [];
      if (chk.checked) {
        if (ficha.sintonizados.length >= 3) { chk.checked = false; return; }
        if (!ficha.sintonizados.includes(nome)) ficha.sintonizados.push(nome);
        log(`Sintonizou com ${nome}`);
      } else {
        ficha.sintonizados = ficha.sintonizados.filter(x => x !== nome);
        log(`Desfez a sintonização com ${nome}`);
      }
      salvar();
    });
    document.querySelectorAll('[data-rolararma]').forEach(b => b.onclick = () => {
      const r = rolar(b.dataset.rolararma);
      if (r) { log(`${b.dataset.arma}: dano ${r.total} (${r.txt})`); render(); }
    });
    document.querySelectorAll('[data-atacararma]').forEach(b => b.onclick = () => {
      // arma de munição consome 1 disparo por ataque
      if (b.dataset.municao) {
        if (!ficha.municao || ficha.municao.nome !== b.dataset.municao || ficha.municao.qtd <= 0) return;
        ficha.municao.qtd -= 1;
        log(`Gastou 1 ${b.dataset.municao.replace(/s$/, '').toLowerCase()} (restam ${ficha.municao.qtd})`);
      }
      rolarTeste(`Ataque ${b.dataset.arma}`, +b.dataset.atacararma);
      if (b.dataset.municao) salvar();
    });

    // modo de rolagem (vantagem/desvantagem)
    document.querySelectorAll('[data-modo]').forEach(b => b.onclick = () => { modoRolagem = b.dataset.modo; render(); });
    // perícias e salvaguardas clicáveis
    document.querySelectorAll('[data-pericia]').forEach(b => b.onclick = () => rolarTeste(b.dataset.pericia, +b.dataset.bonus));
    document.querySelectorAll('[data-salva]').forEach(b => b.onclick = () => rolarTeste('Salva ' + b.dataset.snome, +b.dataset.bonus));
    // teste de morte
    if ($('jgTesteMorte')) $('jgTesteMorte').onclick = testeMorte;
    // concentração
    if ($('jgConc')) $('jgConc').onchange = () => { ficha.concentrando = $('jgConc').value; salvar(); };

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
    document.querySelectorAll('[data-preparar]').forEach(b => b.onclick = () => alternarPreparada(b.dataset.preparar));
  }

  // ----- Exportar ficha em PDF (janela imprimível -> Salvar como PDF) -----
  function exportarFichaPDF(f) {
    const e = s => String(s == null ? '' : s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const a = f.atributos || {};
    const chave = (typeof CLASSE_NOME_PARA_CHAVE !== 'undefined') ? CLASSE_NOME_PARA_CHAVE[f.classe] : null;
    const cls = (typeof CLASSES !== 'undefined' && chave) ? CLASSES[chave] : null;
    const pb = (typeof PB === 'function') ? PB(f.nivel || 1) : 2;
    const ATTRS = [['for', 'FOR'], ['des', 'DES'], ['con', 'CON'], ['int', 'INT'], ['sab', 'SAB'], ['car', 'CAR']];
    const NOMES = { for: 'Força', des: 'Destreza', con: 'Constituição', int: 'Inteligência', sab: 'Sabedoria', car: 'Carisma' };
    const fmtMod = m => (m >= 0 ? '+' : '') + m;
    const attrCards = ATTRS.map(([k, r]) => `<div class="c"><b>${r}</b><span>${a[k] ?? 10}</span><i>${fmtMod(mod(a[k] ?? 10))}</i></div>`).join('');
    const salvas = ATTRS.map(([k]) => { const prof = cls && (cls.salvaguardas || []).includes(NOMES[k]); return `<li>${NOMES[k]}: <b>${fmtMod(mod(a[k] ?? 10) + (prof ? pb : 0))}</b>${prof ? ' (prof.)' : ''}</li>`; }).join('');
    const nd = cls ? cls.niveis.find(n => n.nivel === (f.nivel || 1)) : null;
    const feats = (nd && nd.caracteristicas.length) ? nd.caracteristicas.map(c => `<li>${e(c)}</li>`).join('') : '<li>—</li>';
    const ant = (typeof ANTECEDENTES !== 'undefined') ? ANTECEDENTES[f.antecedente] : null;
    const truques = (f.truques || []).map(e).join(', ') || '—';
    const magias = (f.magias1 || []).map(e).join(', ') || '—';
    const itens = [(f.armadura && f.armadura !== 'Sem armadura') ? f.armadura + (f.escudo ? ' + Escudo' : '') : '', ...(f.itens || [])].filter(Boolean).map(e).join(', ') || '—';
    const sint = (f.sintonizados || []).map(e).join(', ');
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Ficha — ${e(f.nome)}</title>
      <style>
        body{font-family:Georgia,'Times New Roman',serif;color:#1a1a1a;max-width:780px;margin:0 auto;padding:24px;}
        h1{margin:0;font-size:26px;border-bottom:3px solid #7c2d12;padding-bottom:6px;}
        .sub{color:#555;margin:4px 0 14px;font-size:14px;}
        .attrs{display:flex;gap:8px;margin:12px 0;}
        .attrs .c{flex:1;border:1px solid #999;border-radius:8px;text-align:center;padding:6px;}
        .attrs .c b{display:block;font-size:11px;color:#7c2d12;}
        .attrs .c span{display:block;font-size:20px;font-weight:bold;}
        .attrs .c i{font-style:normal;color:#555;}
        .stats{display:flex;gap:18px;margin:10px 0;font-size:15px;}
        .stats b{font-size:18px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        h3{color:#7c2d12;border-bottom:1px solid #ccc;font-size:14px;margin:14px 0 6px;text-transform:uppercase;letter-spacing:.5px;}
        ul{margin:4px 0;padding-left:18px;font-size:13px;} li{margin:2px 0;}
        p{font-size:13px;margin:4px 0;}
        @media print{body{padding:0;} button{display:none;}}
      </style></head><body>
      <h1>${e(f.nome || 'Personagem')}</h1>
      <div class="sub">${e(f.raca)} · ${e(f.classe)} nível ${f.nivel}${f.subclasse ? ' (' + e(f.subclasse) + ')' : ''}${f.antecedente ? ' · ' + e(f.antecedente) : ''}${f.estilo ? ' · ' + e(f.estilo) : ''}</div>
      <div class="attrs">${attrCards}</div>
      <div class="stats"><span>PV <b>${f.hpMax}</b></span><span>CA <b>${f.ca}</b></span><span>Inic. <b>${fmtMod(f.iniciativa || 0)}</b></span><span>Prof. <b>+${pb}</b></span><span>XP <b>${(f.xp || 0).toLocaleString('pt-BR')}</b></span><span>Ouro <b>${f.ouro || 0} po</b></span></div>
      <div class="grid">
        <div><h3>Salvaguardas</h3><ul>${salvas}</ul>
          <h3>Características de Classe (Nível ${f.nivel})</h3><ul>${feats}</ul>
          ${ant ? `<h3>Antecedente — ${e(f.antecedente)}</h3><p><b>${e(ant.caracteristica)}</b></p>${ant.ferramentas && ant.ferramentas.length ? `<p>Ferramentas: ${ant.ferramentas.map(e).join(', ')}</p>` : ''}${ant.equipamento ? `<p>Equipamento: ${e(ant.equipamento)}</p>` : ''}` : ''}
        </div>
        <div><h3>Equipamento</h3><p>${itens}</p>${sint ? `<p><b>Sintonizado:</b> ${sint}</p>` : ''}
          <h3>Truques</h3><p>${truques}</p>
          <h3>Magias</h3><p>${magias}</p>
        </div>
      </div>
      <p style="margin-top:20px;color:#999;font-size:11px;text-align:center;">Gerado pelo D&D Toolkit · Desenvolvido por ismailepereira</p>
      <script>window.onload=function(){setTimeout(function(){window.print();},250);};<\/script>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) { alert('Permita pop-ups para exportar a ficha em PDF.'); return; }
    w.document.write(html); w.document.close();
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
