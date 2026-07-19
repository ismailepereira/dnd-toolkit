// =====================================================
// CRIADOR DE PERSONAGEM - preview ao vivo, regras 5e, gerador automático
// Compartilhado por Mestre e Jogador. Expõe window.Criador.abrir(ficha, opts)
// =====================================================
const Criador = (function () {
  const $ = id => document.getElementById(id);
  let ctx = null; // { aoSalvar, aoExcluir, original }
  let fichaOriginal = null; // ficha em edição (p/ detectar troca de classe/subclasse)
  let estado = null;
  let criandoNovo = true;        // ficha nova (aplica ouro inicial)
  let mostrarTodasEscolas = false; // Mago: ver magias de todas as escolas

  function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function estadoVazio() {
    return {
      nome: '',
      miniaturaUrl: null,     // Fase 16.1: PNG/WebP sem fundo (Storage); null → símbolo da classe
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
      armadura: 'Sem armadura',   // derivado do slot (compat c/ cálculo de CA)
      escudo: false,              // derivado do slot mão secundária
      itens: [],                  // tudo que possui (bolsa + equipado)
      equipado: { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '' },
      municao: { nome: '', qtd: 0 },
      kit: {},                    // índice da opção escolhida por grupo do kit
      kitAplicado: [],            // o que veio de graça (sem reembolso)
      ouro: 0,
      ouroRolado: false,          // trava: rola uma única vez por ficha
      anotacoes: '',
      divindade: '',              // Fé & Pacto: divindade devotada, SEM_DIVINDADE (ateu) ou nome livre; obrigatória p/ Clérigo e Paladino
      patrono: '',                // Fé & Pacto: entidade do pacto (só Bruxo) — da lista do tipo de patrono ou nome livre
      personalidade: { traco: '', ideal: '', ligacao: '', defeito: '' }, // do antecedente: lista OU texto livre
      historia: '',               // história prévia do personagem (texto livre, contextualizada pelo antecedente)
      itemMemoria: { nome: '', tipo: '', descricao: '' }, // objeto pessoal/herdado — só narrativo, não entra no acervo
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
    const ant = (typeof antecedenteDados === 'function') ? antecedenteDados(s.antecedente) : ANTECEDENTES[s.antecedente];
    if (ant) ant.pericias.forEach(p => set.add(p));
    const r = RACAS_DETALHE[s.raca];
    if (r && r.periciaFixa) r.periciaFixa.forEach(p => set.add(p));
    return set;
  }

  function calcular(s) {
    const attrs = atributosFinais(s);
    const pb = PB(s.nivel);
    const cls = CLASSES[CLASSE_NOME_PARA_CHAVE[s.classe]];

    // PV, CA e percepção passiva: regras-ficha.js (fonte única, compartilhada
    // com o Modo de Jogo e o PDF — antes cada um tinha a sua cópia)
    const r = RACAS_DETALHE[s.raca] || {};
    const hp = pvMaximoMonoclasse(s.classe, s.nivel, attrs, s.raca);
    const ca = calcularCA({ classes: [s.classe], armadura: s.armadura, escudo: s.escudo, estilo: s.estilo, atributos: attrs });

    const iniciativa = mod(attrs.des);
    const perProf = periciasProficientes(s);
    const percPassiva = percepcaoPassiva(attrs, perProf, pb);

    // Salvaguardas
    const salvas = (cls ? cls.salvaguardas : []).map(n => SALVA_CHAVE[n]);
    const salvaguardas = ATRIBUTOS.map(a => ({
      nome: a.nome, chave: a.chave,
      valor: mod(attrs[a.chave]) + (salvas.includes(a.chave) ? pb : 0),
      prof: salvas.includes(a.chave),
    }));

    // Conjuração (CD/ataque): regras-ficha.js
    const conj = cdConjuracao(s.classe, s.nivel, attrs, pb);

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
    salvarRascunho(); // Fase B1: todo caminho de alteração passa por aqui
    const s = estado;
    const c = calcular(s);
    const linhasAttr = ATRIBUTOS.map(a => {
      const v = c.attrs[a.chave];
      return `<div class="pv-attr"><span class="pv-attr-nome">${getAttrIcone(a.chave)} ${a.nome.slice(0, 3).toUpperCase()}</span>
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

    // bolsa com contagem (sem repetir nomes) + linha de equipado por slot
    const contItens = {};
    s.itens.forEach(n => { contItens[n] = (contItens[n] || 0) + 1; });
    const itensHtml = Object.keys(contItens).length
      ? Object.keys(contItens).map(n => `${contItens[n] > 1 ? contItens[n] + '× ' : ''}${escHtml(n)}`).join(', ') : '—';
    const eqPrev = s.equipado || {};
    const equipadoHtml = [
      eqPrev.maoPrincipal ? `${getArmaIcone(eqPrev.maoPrincipal)} ${escHtml(eqPrev.maoPrincipal)}` : '',
      eqPrev.maoSecundaria ? `🛡️ ${escHtml(eqPrev.maoSecundaria)}` : '',
      eqPrev.armadura ? `🥋 ${escHtml(eqPrev.armadura)}` : '',
      eqPrev.foco ? `🔮 ${escHtml(eqPrev.foco)}` : '',
      (s.municao && s.municao.nome) ? `🏹 ${escHtml(s.municao.nome)} × ${s.municao.qtd}` : '',
    ].filter(Boolean).join(' · ');

    // armas (dano/acerto) e avisos de proficiência/sobrepeso
    const fichaTmp = { classe: s.classe, armadura: s.armadura, escudo: s.escudo, atributos: c.attrs, itens: s.itens, equipado: s.equipado };
    const avisos = (typeof penalidadesEquipamento === 'function') ? penalidadesEquipamento(fichaTmp) : [];
    const armas = [...new Set(s.itens)].map(n => (typeof ataqueArma === 'function') ? ataqueArma(fichaTmp, n, c.pb) : null).filter(Boolean);
    const penDesloc = avisos.reduce((acc, a) => acc + (a.deslocamento || 0), 0);
    const armasHtml = armas.length ? `<div class="pv-bloco"><h4>Ataques de Arma</h4>${armas.map(a => `<div class="pv-linha"><strong>${getArmaIcone(a.nome)} ${escHtml(a.nome)}:</strong> ${a.ataque >= 0 ? '+' : ''}${a.ataque} p/ acertar · ${escHtml(a.dano)}${a.semProf ? ' <span class="pv-warn">⚠ sem proficiência</span>' : ''}</div>`).join('')}</div>` : '';
    const avisosHtml = avisos.length ? `<div class="pv-bloco pv-avisos"><h4>⚠ Penalidades</h4>${avisos.map(a => `<div class="pv-linha">${escHtml(a.texto)}</div>`).join('')}</div>` : '';

    $('cPreview').innerHTML = `
      <div class="pv-cabecalho pv-cabecalho-mini">
        ${(typeof miniaturaFichaHtml === 'function') ? miniaturaFichaHtml(s, 56) : ''}
        <div>
          <h3>${escHtml(s.nome) || 'Personagem sem nome'}</h3>
          <div class="pv-sub">${escHtml(s.raca)} · ${getClasseIcone(s.classe)} ${escHtml(s.classe)} Nível ${s.nivel} · ${escHtml(s.antecedente)}</div>
        </div>
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
      ${(() => { const a = (typeof antecedenteDados === 'function') ? antecedenteDados(s.antecedente) : ANTECEDENTES[s.antecedente]; if (!a) return ''; return `<div class="pv-bloco"><h4>Antecedente — ${escHtml(s.antecedente)}</h4>
        <div class="pv-linha"><strong>Característica:</strong> ${escHtml(a.caracteristica)}</div>
        ${a.ferramentas && a.ferramentas.length ? `<div class="pv-linha"><strong>Ferramentas:</strong> ${a.ferramentas.map(escHtml).join(', ')}</div>` : ''}
        ${a.idiomas ? `<div class="pv-linha"><strong>Idiomas extras:</strong> ${a.idiomas}</div>` : ''}
        ${a.equipamento ? `<div class="pv-linha"><strong>Equipamento:</strong> ${escHtml(a.equipamento)}</div>` : ''}</div>`; })()}
      ${(() => {
        if (!s.divindade && !s.patrono) return '';
        const dd = (typeof divindadeDados === 'function') ? divindadeDados(s.divindade) : null;
        const pi = (typeof patronoDados === 'function') ? patronoDados(s.patrono) : null;
        return `<div class="pv-bloco"><h4>⛩️ Fé & Pacto</h4>
          ${s.divindade === SEM_DIVINDADE ? `<div class="pv-linha">🚫 <strong>Ateu:</strong> não segue divindade alguma.</div>` : ''}
          ${s.divindade && s.divindade !== SEM_DIVINDADE ? `<div class="pv-linha"><strong>Divindade:</strong> ${escHtml(s.divindade)}${dd ? ` — ${escHtml(dd.titulo)}` : ''}</div>` : ''}
          ${dd ? `<div class="pv-linha">⚖️ ${escHtml(dd.alinhamento)} · 📜 Domínios: ${escHtml(dd.dominio)} · 🔱 ${escHtml(dd.simbolo)}</div><div class="pv-linha">${escHtml(dd.resumo)}</div>` : ''}
          ${s.patrono ? `<div class="pv-linha"><strong>Patrono do Pacto:</strong> ${escHtml(s.patrono)}${pi ? ` — ${escHtml(pi.titulo)} (${escHtml(pi.tipo)})` : ''}</div>` : ''}
          ${pi ? `<div class="pv-linha">${escHtml(pi.resumo)}</div>` : ''}
        </div>`;
      })()}
      ${s.estilo ? `<div class="pv-bloco"><h4>Estilo de Combate</h4><div class="pv-linha">${escHtml(s.estilo)}: ${escHtml(ESTILOS_LUTA[s.estilo] || '')}</div></div>` : ''}
      ${conjHtml}
      ${armasHtml}
      <div class="pv-bloco"><h4>Equipamento</h4>${equipadoHtml ? `<div class="pv-linha"><strong>Equipado:</strong> ${equipadoHtml}</div>` : ''}<div class="pv-linha"><strong>Bolsa:</strong> ${itensHtml}</div><div class="pv-linha"><strong>Ouro:</strong> ${s.ouro} po</div></div>
      ${(() => { const p = s.personalidade || {}; if (!p.traco && !p.ideal && !p.ligacao && !p.defeito) return ''; return `<div class="pv-bloco"><h4>Personalidade</h4>
        ${p.traco ? `<div class="pv-linha"><strong>Traço:</strong> ${escHtml(p.traco)}</div>` : ''}
        ${p.ideal ? `<div class="pv-linha"><strong>Ideal:</strong> ${escHtml(p.ideal)}</div>` : ''}
        ${p.ligacao ? `<div class="pv-linha"><strong>Ligação:</strong> ${escHtml(p.ligacao)}</div>` : ''}
        ${p.defeito ? `<div class="pv-linha"><strong>Defeito:</strong> ${escHtml(p.defeito)}</div>` : ''}</div>`; })()}
      ${s.historia ? `<div class="pv-bloco"><h4>História Prévia</h4><div class="pv-linha">${escHtml(s.historia).replace(/\n/g, '<br>')}</div></div>` : ''}
      ${(() => { const im = s.itemMemoria || {}; if (!im.nome) return ''; return `<div class="pv-bloco"><h4>🎁 Item de Memória</h4>
        <div class="pv-linha"><strong>${escHtml(im.nome)}</strong>${im.tipo ? ` (${escHtml(im.tipo)})` : ''}</div>
        ${im.descricao ? `<div class="pv-linha">${escHtml(im.descricao)}</div>` : ''}</div>`; })()}
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
        // BUG (relato do Ismaile): +1 racial em SAB/INT/CAR muda o limite de
        // magias preparadas (ex.: Clérigo 15→16 de SAB = 3→4 magias), mas o
        // painel de magias não era re-renderizado — o aviso/validação dizia 4
        // e os checkboxes travavam em 3. Re-render de tudo que depende de
        // atributos (o select da escolha racial não é tocado, o foco fica).
        renderAposAtributos();
      });
    });
  }

  // ---------- Antecedente: explicação amigável do que ele concede ----------
  function renderAntecedenteInfo() {
    const wrap = $('cAntecedenteInfo');
    if (!wrap) return;
    const a = (typeof antecedenteDados === 'function') ? antecedenteDados(estado.antecedente) : ANTECEDENTES[estado.antecedente];
    if (!a) { wrap.innerHTML = ''; return; }
    const pericias = a.pericias && a.pericias.length ? a.pericias.join(', ') : '—';
    const ferramentas = a.ferramentas && a.ferramentas.length ? a.ferramentas.join(', ') : 'nenhuma';
    const idiomas = a.idiomas ? `${a.idiomas} à escolha` : 'nenhum extra';
    wrap.innerHTML = `<h4>O que ${escHtml(estado.antecedente)} concede</h4>
      <div class="pv-linha">🧠 <strong>Perícias:</strong> ${escHtml(pericias)}</div>
      <div class="pv-linha">🛠️ <strong>Ferramentas:</strong> ${escHtml(ferramentas)}</div>
      <div class="pv-linha">🗣️ <strong>Idiomas:</strong> ${escHtml(idiomas)}</div>
      <div class="pv-linha">🎒 <strong>Equipamento:</strong> ${escHtml(a.equipamento || '—')}</div>
      <div class="pv-linha">✨ <strong>Característica:</strong> ${escHtml(a.caracteristica || '—')}</div>`;
  }

  // ---------- Fé & Pacto: divindade (todos) e patrono do pacto (Bruxo) ----------
  // Toda ficha escolhe uma divindade OU declara-se atéia; Clérigo e Paladino
  // não podem ser ateus (canalizam o poder da divindade — CLASSES_DEVOTAS em
  // dados5e.js). Bruxo escolhe ainda a ENTIDADE do pacto, sugerida pelo tipo
  // de patrono (subclasse).
  function renderFe() {
    const wrap = $('cFeWrap');
    if (!wrap || typeof DIVINDADES === 'undefined') return;
    const ehBruxo = estado.classe === 'Bruxo';
    if (!ehBruxo) estado.patrono = '';
    const devota = CLASSES_DEVOTAS.includes(estado.classe);
    const dInfo = divindadeDados(estado.divindade);
    const dManual = !!estado.divindade && estado.divindade !== SEM_DIVINDADE && !dInfo;

    // Divindade: ateu + grupos do panteão + escrever à mão
    const optsDiv = `<option value="">— escolher —</option>` +
      `<option value="${escHtml(SEM_DIVINDADE)}" ${estado.divindade === SEM_DIVINDADE ? 'selected' : ''} ${devota ? 'disabled' : ''}>🚫 ${escHtml(SEM_DIVINDADE)}${devota ? ' — não vale para ' + escHtml(estado.classe) : ''}</option>` +
      Object.keys(DIVINDADES).map(g => `<optgroup label="${escHtml(g)}">` +
        Object.keys(DIVINDADES[g]).map(n => `<option value="${escHtml(n)}" ${estado.divindade === n ? 'selected' : ''}>${escHtml(n)} — ${escHtml(DIVINDADES[g][n].titulo)}</option>`).join('') +
      `</optgroup>`).join('') +
      `<option value="__manual__" ${dManual ? 'selected' : ''}>✍️ Outra (escrever à mão)…</option>`;

    const hintDiv = devota
      ? `⚠️ ${estado.classe} canaliza o poder de uma divindade: a escolha é <b>obrigatória</b> (ateu não é opção para esta classe).`
      : 'Opcional para esta classe: devote-se a quem quiser — ou declare-se ateu.';

    let infoDiv = '';
    if (estado.divindade === SEM_DIVINDADE) {
      infoDiv = `<div class="pv-linha">🚫 Sem devoção: este personagem não segue divindade alguma.</div>`;
    } else if (dInfo) {
      infoDiv = `<div class="pv-linha"><strong>${escHtml(estado.divindade)}</strong> — ${escHtml(dInfo.titulo)} <em>(${escHtml(dInfo.grupo)})</em></div>
        <div class="pv-linha">⚖️ <strong>Alinhamento:</strong> ${escHtml(dInfo.alinhamento)} · 📜 <strong>Domínios:</strong> ${escHtml(dInfo.dominio)}</div>
        <div class="pv-linha">🔱 <strong>Símbolo:</strong> ${escHtml(dInfo.simbolo)}</div>
        <div class="pv-linha">${escHtml(dInfo.resumo)}</div>`;
    }

    // Patrono (só Bruxo): entidades agrupadas por tipo de pacto; o grupo da
    // subclasse escolhida vem marcado como "seu pacto".
    let patronoHtml = '';
    if (ehBruxo && typeof PATRONOS_PACTO !== 'undefined') {
      const pInfo = patronoDados(estado.patrono);
      const pManual = !!estado.patrono && !pInfo;
      const optsPat = `<option value="">— escolher a entidade do pacto —</option>` +
        Object.keys(PATRONOS_PACTO).map(t => `<optgroup label="${escHtml(t)}${estado.subclasse === t ? ' ★ seu pacto' : ''}">` +
          Object.keys(PATRONOS_PACTO[t].entidades).map(n => `<option value="${escHtml(n)}" ${estado.patrono === n ? 'selected' : ''}>${escHtml(n)} — ${escHtml(PATRONOS_PACTO[t].entidades[n].titulo)}</option>`).join('') +
        `</optgroup>`).join('') +
        `<option value="__manual__" ${pManual ? 'selected' : ''}>✍️ Outra entidade (escrever à mão)…</option>`;
      const avisoTipo = (pInfo && estado.subclasse && pInfo.tipo !== estado.subclasse)
        ? `<div class="pv-linha">⚠️ ${escHtml(estado.patrono)} é do tipo <b>${escHtml(pInfo.tipo)}</b>, mas sua subclasse é <b>${escHtml(estado.subclasse)}</b> — confirme com o Mestre.</div>` : '';
      patronoHtml = `
        <label>Patrono do Pacto <span class="criador-hint-inline">(obrigatório para Bruxo)</span>
          <select id="cPatrono">${optsPat}</select>
        </label>
        <input type="text" id="cPatronoManual" class="${pManual ? '' : 'hidden'}" placeholder="Nome da entidade do pacto (ex.: um demônio da sua campanha)" value="${pManual ? escHtml(estado.patrono) : ''}">
        <div class="antecedente-info">
          <div class="pv-linha">👁️ Bruxos extraem magia de um <b>pacto</b> com uma entidade poderosa${estado.subclasse ? ` — o seu tipo é <b>${escHtml(estado.subclasse)}</b>` : ' (escolha o tipo de patrono no passo 1: Classe)'}. ${escHtml((PATRONOS_PACTO[estado.subclasse] || {}).dica || '')}</div>
          ${pInfo ? `<div class="pv-linha"><strong>${escHtml(estado.patrono)}</strong> — ${escHtml(pInfo.titulo)}: ${escHtml(pInfo.resumo)}</div>` : ''}
          ${avisoTipo}
        </div>`;
    }

    wrap.innerHTML = `
      <div class="criador-hint">${hintDiv}</div>
      <div class="criador-row">
        <label>Divindade
          <select id="cDivindade">${optsDiv}</select>
        </label>
      </div>
      <input type="text" id="cDivindadeManual" class="${dManual ? '' : 'hidden'}" placeholder="Nome da divindade (homebrew / outra ambientação)" value="${dManual ? escHtml(estado.divindade) : ''}">
      ${infoDiv ? `<div class="antecedente-info">${infoDiv}</div>` : ''}
      ${patronoHtml}`;

    // Listeners (re-render a cada mudança: os painéis de info acompanham)
    $('cDivindade').addEventListener('change', () => {
      const v = $('cDivindade').value;
      if (v === '__manual__') {
        // sem re-render: o select fica em "Outra…" e o campo de texto aparece
        estado.divindade = '';
        const t = $('cDivindadeManual');
        t.classList.remove('hidden');
        t.value = '';
        t.focus();
        renderPreview();
        return;
      }
      estado.divindade = v;
      renderFe(); renderPreview();
    });
    const dTxt = $('cDivindadeManual');
    dTxt.addEventListener('input', () => { estado.divindade = dTxt.value; renderPreview(); });
    const pSel = $('cPatrono');
    if (pSel) {
      pSel.addEventListener('change', () => {
        const v = pSel.value;
        if (v === '__manual__') {
          estado.patrono = '';
          const t = $('cPatronoManual');
          t.classList.remove('hidden');
          t.value = '';
          t.focus();
          renderPreview();
          return;
        }
        estado.patrono = v;
        renderFe(); renderPreview();
      });
      const pTxt = $('cPatronoManual');
      pTxt.addEventListener('input', () => { estado.patrono = pTxt.value; renderPreview(); });
    }
  }

  // ---------- Personalidade: traço/ideal/ligação/defeito — lista OU texto livre ----------
  const PERSONALIDADE_CAMPOS = [
    ['traco', 'Traço de Personalidade', 'tracosPersonalidade'],
    ['ideal', 'Ideal', 'ideais'],
    ['ligacao', 'Ligação', 'ligacoes'],
    ['defeito', 'Defeito', 'defeitos'],
  ];
  function renderPersonalidade() {
    const wrap = $('cPersonalidadeWrap');
    if (!wrap) return;
    const a = (typeof antecedenteDados === 'function') ? antecedenteDados(estado.antecedente) : ANTECEDENTES[estado.antecedente];
    wrap.innerHTML = PERSONALIDADE_CAMPOS.map(([chave, rotulo, chaveLista]) => {
      const opcoes = (a && a[chaveLista]) || [];
      const valorAtual = estado.personalidade[chave] || '';
      const daLista = opcoes.includes(valorAtual);
      const selOps = `<option value="">— escolher da lista —</option>` +
        opcoes.map(op => `<option value="${escHtml(op)}" ${daLista && valorAtual === op ? 'selected' : ''}>${escHtml(op)}</option>`).join('') +
        `<option value="__manual__" ${!daLista && valorAtual ? 'selected' : ''}>✍️ Escrever à mão…</option>`;
      return `<div class="personalidade-grupo">
        <label>${rotulo}</label>
        <select data-pers-select="${chave}">${selOps}</select>
        <textarea data-pers-texto="${chave}" rows="2" placeholder="Escreva livremente..." ${daLista ? 'class="hidden"' : ''}>${escHtml(valorAtual)}</textarea>
      </div>`;
    }).join('');
    PERSONALIDADE_CAMPOS.forEach(([chave]) => {
      const sel = wrap.querySelector(`[data-pers-select="${chave}"]`);
      const txt = wrap.querySelector(`[data-pers-texto="${chave}"]`);
      sel.addEventListener('change', () => {
        if (sel.value === '__manual__') {
          txt.classList.remove('hidden');
          txt.value = '';
          estado.personalidade[chave] = '';
          txt.focus();
        } else {
          txt.classList.add('hidden');
          txt.value = sel.value;
          estado.personalidade[chave] = sel.value;
        }
        renderPreview();
      });
      txt.addEventListener('input', () => { estado.personalidade[chave] = txt.value; renderPreview(); });
    });
  }

  function renderAtributosBase() {
    const wrap = $('cAtributos');
    wrap.innerHTML = ATRIBUTOS.map(a => `
      <label class="mini-label">${getAttrIcone(a.chave)} ${a.nome.slice(0, 3).toUpperCase()}
        <input type="number" data-attr="${a.chave}" value="${estado.base[a.chave]}" min="3" max="20">
      </label>`).join('');
    wrap.querySelectorAll('[data-attr]').forEach(inp => {
      inp.addEventListener('input', () => {
        estado.base[inp.dataset.attr] = Number(inp.value) || 10;
        sincronizarAtributosGaleria();
        renderAposAtributos();
      });
    });
  }

  // Espelha estado.base nos inputs da galeria de classe (sem re-render, preserva o foco)
  function sincronizarAtributosGaleria() {
    document.querySelectorAll('#cGaleriaClasse [data-galeria-attr]').forEach(i => {
      if (document.activeElement !== i) i.value = estado.base[i.dataset.galeriaAttr];
    });
  }

  // Tudo que depende dos valores de atributos (painel de classe, perícias, magias, peso, preview)
  function renderAposAtributos() {
    renderPainelClasse();
    renderPericias();
    renderMagias();
    renderPeso();
    renderPreview();
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

  // ========== PASSO 5: ouro (rolagem PHB), kit grátis, loja, bolsa e slots ==========
  const arred = n => Math.round(n * 100) / 100;
  function precoEmPO(nome) { return (typeof precoItemPO === 'function') ? precoItemPO(nome) : 0; }
  function pesoDeItem(nome) { return (typeof pesoItemKg === 'function') ? pesoItemKg(nome) : 0; }
  const catDe = n => (typeof itemCatalogo === 'function') ? itemCatalogo(n) : null;
  function atualizarOuroDisp() {
    const d = $('cOuroDisp'); if (d) d.textContent = estado.ouro;
  }
  const contar = (arr, n) => (arr || []).filter(x => x === n).length;

  // deriva os campos legados (usados por calcular/CA) a partir dos slots
  function sincronizarEquipado() {
    estado.armadura = estado.equipado.armadura || 'Sem armadura';
    estado.escudo = estado.equipado.maoSecundaria === 'Escudo';
  }

  // aquisição central: packs de munição viram contador; o resto entra na bolsa
  function adquirirItem(nome, origem) {
    const it = catDe(nome);
    if (it && it.cat === 'municao') {
      if (!estado.municao.nome || estado.municao.nome === it.municaoNome) {
        estado.municao.nome = it.municaoNome;
        estado.municao.qtd += it.qtdPack;
        if (origem === 'kit') estado.kitAplicado.push(`~municao:${it.municaoNome}:${it.qtdPack}`);
        return;
      }
    }
    estado.itens.push(nome);
    if (origem === 'kit') estado.kitAplicado.push(nome);
  }
  function removerUmItem(nome) {
    const i = estado.itens.indexOf(nome);
    if (i >= 0) estado.itens.splice(i, 1);
    ['maoPrincipal', 'maoSecundaria', 'armadura', 'foco'].forEach(k => {
      if (estado.equipado[k] === nome && !estado.itens.includes(nome)) estado.equipado[k] = '';
    });
  }

  // ----- Kit inicial gratuito (só na criação) -----
  function limparKit() {
    (estado.kitAplicado || []).forEach(n => {
      if (n.startsWith('~municao:')) {
        const [, nomeM, qtd] = n.split(':');
        if (estado.municao.nome === nomeM) {
          estado.municao.qtd = Math.max(0, estado.municao.qtd - Number(qtd));
          if (estado.municao.qtd === 0) estado.municao.nome = '';
        }
      } else removerUmItem(n);
    });
    estado.kitAplicado = [];
  }
  function aplicarKit() {
    if (!criandoNovo) return;
    limparKit();
    const kit = (typeof KIT_INICIAL !== 'undefined') ? KIT_INICIAL[estado.classe] : null;
    if (!kit) return;
    (kit.fixos || []).forEach(n => adquirirItem(n, 'kit'));
    (kit.escolhas || []).forEach((e, i) => {
      const sel = estado.kit[i] != null ? estado.kit[i] : 0;
      const op = e.opcoes[Math.min(sel, e.opcoes.length - 1)] || [];
      op.forEach(n => {
        if (typeof PACOTES !== 'undefined' && PACOTES[n]) PACOTES[n].forEach(x => adquirirItem(x, 'kit'));
        else adquirirItem(n, 'kit');
      });
    });
    autoEquipar();
    sincronizarEquipado();
  }
  // preenche slots vazios com o melhor disponível na bolsa
  function autoEquipar() {
    const eq = estado.equipado;
    if (!eq.armadura || !estado.itens.includes(eq.armadura))
      eq.armadura = estado.itens.find(n => catDe(n) && catDe(n).cat === 'armadura') || '';
    if (!eq.maoPrincipal || !estado.itens.includes(eq.maoPrincipal))
      eq.maoPrincipal = estado.itens.find(n => catDe(n) && catDe(n).cat === 'arma' && catDe(n).alcance === 'cac')
        || estado.itens.find(n => catDe(n) && catDe(n).cat === 'arma') || '';
    const p = catDe(eq.maoPrincipal);
    if (p && p.maos === 2) eq.maoSecundaria = '';
    else if (!eq.maoSecundaria || (eq.maoSecundaria !== 'Escudo' && !estado.itens.includes(eq.maoSecundaria))) {
      eq.maoSecundaria = estado.itens.includes('Escudo') ? 'Escudo'
        : (estado.itens.find(n => n !== eq.maoPrincipal && catDe(n) && catDe(n).cat === 'arma'
            && (catDe(n).props || []).includes('leve')) || '');
    }
    if (!eq.foco || !estado.itens.includes(eq.foco))
      eq.foco = estado.itens.find(n => catDe(n) && catDe(n).cat === 'foco') || '';
  }

  // ----- Ouro por rolagem oficial (uma vez por ficha) -----
  function renderOuro() {
    const wrap = $('cOuroWrap'); if (!wrap) return;
    const podeRolar = !estado.ouroRolado && typeof rolarOuroClasse === 'function';
    wrap.innerHTML = `<h3>💰 Ouro</h3>
      <div class="loja-ouro">Ouro: <b id="cOuroDisp">${estado.ouro}</b> po
        ${podeRolar
          ? `<button type="button" id="cRolarOuro" class="btn-mini">🎲 Rolar ouro inicial (${formulaOuro(estado.classe)})</button>`
          : '<span class="criador-hint-inline">🔒 rolagem única feita — ouro extra só via Mestre ou jogo</span>'}
        <span id="cOuroDados" class="criador-hint-inline"></span>
      </div>`;
    const b = $('cRolarOuro');
    if (b) b.addEventListener('click', () => {
      const r = rolarOuroClasse(estado.classe);
      estado.ouro = arred(estado.ouro + r.total);
      estado.ouroRolado = true;
      renderPassoItens(); renderPreview();
      const d = $('cOuroDados');
      if (d) d.textContent = `— saiu [${r.dados.join(', ')}]${r.mult > 1 ? ' × ' + r.mult : ''} = ${r.total} po`;
    });
  }

  function renderKit() {
    const wrap = $('cKitWrap'); if (!wrap) return;
    const kit = criandoNovo && typeof KIT_INICIAL !== 'undefined' ? KIT_INICIAL[estado.classe] : null;
    if (!kit) { wrap.innerHTML = ''; return; }
    const fixos = (kit.fixos || []).length
      ? `<div class="criador-hint">Incluído de graça: ${[...new Set(kit.fixos)].map(n => `${contar(kit.fixos, n) > 1 ? contar(kit.fixos, n) + '× ' : ''}${escHtml(n)}`).join(', ')}</div>` : '';
    const grupos = kit.escolhas.map((e, i) => {
      const sel = estado.kit[i] != null ? estado.kit[i] : 0;
      const ops = e.opcoes.map((op, j) =>
        `<label class="check-chip ${sel === j ? 'on' : ''}"><input type="radio" name="cKit${i}" data-kit-grupo="${i}" data-kit-op="${j}" ${sel === j ? 'checked' : ''}>${escHtml(op.join(' + '))}</label>`).join('');
      return `<div class="kit-grupo"><b>${escHtml(e.rotulo)}:</b><div class="pericias-grid">${ops}</div></div>`;
    }).join('');
    wrap.innerHTML = `<h3>🎁 Kit inicial <span class="criador-hint-inline">(grátis, só na criação)</span></h3>${fixos}${grupos}`;
    wrap.querySelectorAll('[data-kit-grupo]').forEach(r => r.addEventListener('change', () => {
      estado.kit[Number(r.dataset.kitGrupo)] = Number(r.dataset.kitOp);
      aplicarKit();
      renderPassoItens(); renderPreview();
    }));
  }

  // ----- Loja da criação (Fase 9: categorias unificadas + Loja Especial gated) -----
  // Loja Básica = equipamento mundano do PHB (equipamento.js/itens.js) — é o
  // que fica disponível por padrão na criação. Loja Especial = itens
  // mágicos/raros; só aparece (em modo consulta, sem comprar) se o Mestre
  // já tiver liberado para a campanha ou para esta ficha (ver loja.js).
  let lojaCat = null;
  let lojaMostrarTudo = false;
  let lojaAbaAtiva = 'basica'; // 'basica' | 'especial'
  function renderLoja() {
    const wrap = $('cLojaWrap'); if (!wrap) return;
    if (typeof itensLojaBasica !== 'function') { wrap.innerHTML = ''; return; }

    const especialOk = (typeof lojaEspecialLiberada === 'function') && lojaEspecialLiberada(fichaOriginal);
    if (lojaAbaAtiva === 'especial' && !especialOk) lojaAbaAtiva = 'basica';
    const gruposBasicos = agruparPorCategoriaLoja(itensLojaBasica());
    const gruposEspeciais = especialOk ? agruparPorCategoriaLoja(itensLojaEspecial()) : [];
    const gruposAtivos = lojaAbaAtiva === 'especial' ? gruposEspeciais : gruposBasicos;
    if (!lojaCat || !gruposAtivos.some(g => g.chave === lojaCat)) lojaCat = gruposAtivos[0] ? gruposAtivos[0].chave : null;

    const abasPrincipais = `
      <button type="button" class="btn-mini aba-loja${lojaAbaAtiva === 'basica' ? ' on' : ''}" data-loja-aba="basica">🛒 Loja Básica</button>
      <button type="button" class="btn-mini aba-loja${lojaAbaAtiva === 'especial' ? ' on' : ''}${especialOk ? '' : ' bloqueada'}" data-loja-aba="especial"${especialOk ? '' : ' title="Bloqueada — peça ao Mestre para liberar a Loja Especial"'}>✨ Loja Especial${especialOk ? '' : ' 🔒'}</button>
      <button type="button" class="btn-mini" id="btnLojaCompleta">${lojaMostrarTudo ? '📑 Ver por categoria' : '📖 Abrir loja completa'}</button>`;
    const abasCategoria = gruposAtivos.map(g =>
      `<button type="button" class="btn-mini aba-loja${lojaCat === g.chave ? ' on' : ''}" data-loja-cat="${g.chave}">${g.rotulo} <small>(${g.itens.length})</small></button>`).join('');

    const linhaItem = i => {
      const bloqueada = lojaAbaAtiva === 'basica' && (
        (i.categoriaLoja === 'arma' && !podeUsarArma(estado.classe, i.nome)) ||
        ((i.categoriaLoja === 'armadura' || i.categoriaLoja === 'escudo') && !podeUsarArmadura(estado.classe, i.nome, estado.subclasse)));
      const semOuro = !(ctx && ctx.modoNpc) && lojaAbaAtiva === 'basica' && i.precoPO > estado.ouro;
      const precoTxt = lojaAbaAtiva === 'especial'
        ? `${i.precoPO ? i.precoPO + ' po · ' : ''}${escHtml(i.raridade || '')}${i.sintonia ? ' · sintonia' : ''}`
        : `${i.precoPO} po${i.pesoTexto ? ' · ' + escHtml(i.pesoTexto) : ''}`;
      const acao = lojaAbaAtiva === 'especial'
        ? `<span class="loja-cadeado" title="Itens especiais são concedidos pelo Mestre (aba Fichas → Enviar à ficha), não comprados aqui">✨</span>`
        : (bloqueada
          ? `<span class="loja-cadeado" title="${escHtml(estado.classe)} não tem proficiência">🔒</span>`
          : `<button type="button" class="btn-mini" data-comprar="${escHtml(i.nome)}"${semOuro ? ' disabled title="ouro insuficiente"' : ''}>Comprar</button>`);
      return cardLojaHtml({
        icone: iconeCategoriaLoja(i.categoriaLoja),
        nome: escHtml(i.nome), descricao: escHtml(i.descricao || ''),
        precoTxt, bloqueada, acaoHtml: acao,
      });
    };
    let corpo;
    if (lojaMostrarTudo) {
      corpo = gruposAtivos.map(g => `<h4 class="loja-cat-titulo">${g.rotulo}</h4><div class="loja-cards">${g.itens.map(linhaItem).join('')}</div>`).join('')
        || '<span class="criador-hint">Nenhum item disponível.</span>';
    } else {
      const grupo = gruposAtivos.find(g => g.chave === lojaCat);
      corpo = grupo ? `<div class="loja-cards">${grupo.itens.map(linhaItem).join('')}</div>` : '<span class="criador-hint">Loja Especial vazia — peça ao Mestre para criar itens (aba Itens Mágicos).</span>';
    }

    wrap.innerHTML = `<h3>🛒 Loja <span class="criador-hint-inline">(compre com o ouro rolado; devolver reembolsa 100% antes de salvar)</span></h3>
      <div class="loja-abas">${abasPrincipais}</div>
      ${!lojaMostrarTudo ? `<div class="loja-abas loja-abas-cat">${abasCategoria}</div>` : ''}
      <div class="loja-lista">${corpo}</div>`;

    wrap.querySelectorAll('[data-loja-aba]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.lojaAba === 'especial' && !especialOk) return;
      lojaAbaAtiva = b.dataset.lojaAba; lojaCat = null; renderLoja();
    }));
    if ($('btnLojaCompleta')) $('btnLojaCompleta').addEventListener('click', () => { lojaMostrarTudo = !lojaMostrarTudo; renderLoja(); });
    wrap.querySelectorAll('[data-loja-cat]').forEach(b => b.addEventListener('click', () => { lojaCat = b.dataset.lojaCat; renderLoja(); }));
    wrap.querySelectorAll('[data-comprar]').forEach(b => b.addEventListener('click', () => {
      const nome = b.dataset.comprar;
      const preco = precoEmPO(nome);
      if (!(ctx && ctx.modoNpc) && preco > estado.ouro) return;
      if (!(ctx && ctx.modoNpc)) {
        estado.ouro = arred(estado.ouro - preco);
        if (typeof lojaFeedbackCompra === 'function') lojaFeedbackCompra(b, `−${preco} po`);
      }
      adquirirItem(nome, 'loja');
      autoEquipar(); sincronizarEquipado();
      renderPassoItens(); renderPreview();
    }));
  }

  // ----- Bolsa + slots de equipar -----
  function renderEquipado() {
    const wrap = $('cEquipadoWrap'); if (!wrap) return;
    sincronizarEquipado();
    const eq = estado.equipado;
    const armas = estado.itens.filter(n => catDe(n) && catDe(n).cat === 'arma');
    const armaduras = estado.itens.filter(n => catDe(n) && catDe(n).cat === 'armadura');
    const focos = estado.itens.filter(n => catDe(n) && catDe(n).cat === 'foco');
    const principal = catDe(eq.maoPrincipal);
    const duasMaos = principal && principal.maos === 2;
    const opsSecundaria = duasMaos ? [] : [
      ...(estado.itens.includes('Escudo') ? ['Escudo'] : []),
      ...[...new Set(armas)].filter(n => {
        const it = catDe(n);
        if (!it || !(it.props || []).includes('leve')) return false;
        return n !== eq.maoPrincipal || contar(estado.itens, n) > 1;
      }),
    ];
    const slotSel = (id, rotulo, icone, opcoes, valor, extra) => `
      <label class="slot-eq"><span>${icone} ${rotulo}</span>
        <select data-slot="${id}"><option value="">— vazio —</option>${[...new Set(opcoes)].map(o =>
          `<option value="${escHtml(o)}"${valor === o ? ' selected' : ''}>${escHtml(o)}</option>`).join('')}</select>
        ${extra || ''}</label>`;
    const armaduraSemProf = eq.armadura && typeof podeUsarArmadura === 'function'
      && !podeUsarArmadura(estado.classe, eq.armadura, estado.subclasse);
    const armaSemProf = eq.maoPrincipal && typeof podeUsarArma === 'function'
      && !podeUsarArma(estado.classe, eq.maoPrincipal);
    const municaoHtml = estado.municao.nome
      ? `<div class="slot-eq slot-municao"><span>🏹 Munição</span><b>${escHtml(estado.municao.nome)} × ${estado.municao.qtd}</b></div>` : '';
    // bolsa: itens não equipados (contagem), kit marcado 🎁 (sem devolução), comprados com ×
    const nomesUnicos = [...new Set(estado.itens)];
    const chips = nomesUnicos.map(n => {
      const total = contar(estado.itens, n);
      const doKit = contar(estado.kitAplicado, n);
      const devolvivel = total > doKit;
      const equipadoAqui = [eq.maoPrincipal, eq.maoSecundaria, eq.armadura, eq.foco].includes(n);
      return `<span class="chip${equipadoAqui ? ' equipado' : ''}">${total > 1 ? total + '× ' : ''}${escHtml(n)}${doKit ? ' 🎁' : ''}${equipadoAqui ? ' ✋' : ''}
        ${devolvivel ? `<button type="button" data-rem="${escHtml(n)}" title="Devolver (reembolsa ${precoEmPO(n)} po)">×</button>` : ''}</span>`;
    }).join('');
    wrap.innerHTML = `<h3>🎒 Bolsa & Equipamento</h3>
      <div class="slots-grid">
        ${slotSel('maoPrincipal', 'Mão principal', '🗡️', armas, eq.maoPrincipal, armaSemProf ? '<span class="pv-warn">⚠ sem proficiência</span>' : '')}
        ${slotSel('maoSecundaria', 'Mão secundária', '🛡️', opsSecundaria, eq.maoSecundaria, duasMaos ? '<span class="criador-hint-inline">arma de duas mãos</span>' : '')}
        ${slotSel('armadura', 'Armadura', '🥋', armaduras, eq.armadura, armaduraSemProf ? '<span class="pv-warn">⚠ sem proficiência (desvantagem)</span>' : '')}
        ${slotSel('foco', 'Foco / Símbolo', '🔮', focos, eq.foco, '')}
        ${municaoHtml}
      </div>
      <div class="bolsa-grid">${chips}</div>`;

    wrap.querySelectorAll('[data-slot]').forEach(sel => sel.addEventListener('change', () => {
      estado.equipado[sel.dataset.slot] = sel.value;
      if (sel.dataset.slot === 'maoPrincipal') {
        const p2 = catDe(sel.value);
        if (p2 && p2.maos === 2) estado.equipado.maoSecundaria = '';
      }
      sincronizarEquipado();
      renderEquipado(); renderPeso(); renderPreview();
    }));
    wrap.querySelectorAll('[data-rem]').forEach(b => b.addEventListener('click', () => {
      const nome = b.dataset.rem;
      removerUmItem(nome);
      if (!(ctx && ctx.modoNpc)) estado.ouro = arred(estado.ouro + precoEmPO(nome));
      sincronizarEquipado();
      renderPassoItens(); renderPreview();
    }));
  }
  function renderPassoItens() {
    renderOuro();
    renderKit();
    renderLoja();
    renderEquipado();
    renderPeso();
  }

  function renderTudoDinamico() {
    renderGaleriaClasse();
    renderGaleriaRaca();
    renderResumoEscolha();
    renderEscolhaAtributos();
    renderFe();               // divindade/patrono dependem da classe e subclasse
    renderPainelClasse();
    renderPericias();
    renderEstilo();
    renderMagias();
    renderPassoItens();
    renderPreview();
  }

  // ---------- Galerias de seleção (passos 1 e 2) ----------
  function nomeAtributo(k) {
    const a = ATRIBUTOS.find(x => x.chave === k);
    return a ? a.nome : k;
  }

  // Limpeza central ao trocar subclasse/especialização: tudo que a escolha
  // anterior liberou (magias de escola, truques de Cavaleiro/Trapaceiro Arcano,
  // magias de domínio...) é removido — escolhas exclusivas nunca acumulam.
  function limparEscolhasDeSubclasse() {
    estado.truques = [];
    estado.magias1 = [];
    mostrarTodasEscolas = false;
  }

  // Distribui um conjunto de 6 valores nos atributos, do melhor p/ o pior,
  // seguindo a prioridade da classe (quick build do PHB)
  function arranjarPorClasse(valores) {
    const ordem = (typeof ATRIBUTOS_PRIORIDADE !== 'undefined' && ATRIBUTOS_PRIORIDADE[estado.classe])
      || ['for', 'des', 'con', 'int', 'sab', 'car'];
    const v = [...valores].sort((a, b) => b - a);
    ordem.forEach((k, i) => { estado.base[k] = v[i]; });
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

    // Subclasses da classe escolhida
    const scDef = (typeof SUBCLASSES !== 'undefined' && SUBCLASSES[nome]) || null;
    let subHtml = '';
    if (scDef) {
      const pendente = estado.nivel < scDef.nivel;
      const cards = scDef.opcoes.map(o => `
        <button type="button" class="sub-card${estado.subclasse === o.nome ? ' ativo' : ''}" data-galeria-sub="${escHtml(o.nome)}">
          <b>${escHtml(o.nome)}</b><span>${escHtml(o.desc)}</span>
        </button>`).join('');
      subHtml = `
        <div class="galeria-subclasses">
          <div class="sub-titulo">Subclasse <span class="sub-nota">${pendente ? `entra em jogo no nível ${scDef.nivel} — pode deixar pré-escolhida` : `escolhida no nível ${scDef.nivel}`}</span></div>
          <div class="sub-lista">${cards}</div>
        </div>`;
    }

    // Status recomendados p/ a classe (arranjo padrão orientado), editáveis + rolagem
    const ordemPrio = (typeof ATRIBUTOS_PRIORIDADE !== 'undefined' && ATRIBUTOS_PRIORIDADE[nome]) || [];
    const statusInputs = ATRIBUTOS.map(a => {
      const rank = ordemPrio.indexOf(a.chave);
      const cl = rank === 0 ? ' primario' : (rank === 1 ? ' secundario' : '');
      return `<label class="status-attr${cl}"><span>${getAttrIcone(a.chave)} ${a.chave.toUpperCase()}</span>
        <input type="number" min="3" max="20" data-galeria-attr="${a.chave}" value="${estado.base[a.chave]}"></label>`;
    }).join('');
    const statusHtml = `
      <div class="galeria-status">
        <div class="status-titulo">Status recomendados para ${escHtml(nome)} <span class="sub-nota">edite à vontade ou role os dados</span></div>
        <div class="status-grid">${statusInputs}</div>
        <div class="status-botoes">
          <button type="button" class="btn-mini" data-acao-attr="otimo">✔ Melhor da classe (compra de pontos)</button>
          <button type="button" class="btn-mini" data-acao-attr="padrao">Arranjo padrão</button>
          <button type="button" class="btn-mini" data-acao-attr="rolar">🎲 Rolar 4d6</button>
        </div>
      </div>`;

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
        ${subHtml}
        ${statusHtml}
      </div>
      <div class="galeria-minis">${minis}</div>`;
    wrap.querySelectorAll('[data-galeria-classe]').forEach(b => {
      b.addEventListener('click', () => {
        estado.classe = b.dataset.galeriaClasse;
        estado.subclasse = '';
        limparEscolhasDeSubclasse();
        if (criandoNovo) {
          // ouro e kit são por classe: trocar de classe reinicia ambos (evita
          // rolar como uma classe e ficar com o ouro/kit noutra)
          estado.ouro = 0;
          estado.ouroRolado = false;
          estado.kit = {};
          aplicarKit();
          // aplica automaticamente o melhor arranjo legal da nova classe
          arranjarPorClasse(typeof ARRANJO_OTIMO !== 'undefined' ? ARRANJO_OTIMO : ARRANJO_PADRAO);
          renderAtributosBase();
        }
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
    // subclasses: clicar seleciona; clicar de novo desmarca
    wrap.querySelectorAll('[data-galeria-sub]').forEach(b => {
      b.addEventListener('click', () => {
        estado.subclasse = (estado.subclasse === b.dataset.galeriaSub) ? '' : b.dataset.galeriaSub;
        limparEscolhasDeSubclasse();
        renderTudoDinamico();
      });
    });
    // status: edição manual (sem re-render da galeria p/ não perder o foco)
    wrap.querySelectorAll('[data-galeria-attr]').forEach(inp => {
      inp.addEventListener('input', () => {
        const v = Number(inp.value);
        if (!Number.isFinite(v)) return;
        estado.base[inp.dataset.galeriaAttr] = Math.max(3, Math.min(20, v));
        renderAtributosBase();
        renderAposAtributos();
      });
    });
    // status: botões de arranjo (ótimo/padrão) e rolagem 4d6
    wrap.querySelectorAll('[data-acao-attr]').forEach(b => {
      b.addEventListener('click', () => {
        const acao = b.dataset.acaoAttr;
        const valores = acao === 'rolar' ? Array.from({ length: 6 }, rolar4d6)
          : acao === 'otimo' && typeof ARRANJO_OTIMO !== 'undefined' ? ARRANJO_OTIMO
          : ARRANJO_PADRAO;
        arranjarPorClasse(valores);
        renderAtributosBase();
        renderTudoDinamico();
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
    const sub = estado.subclasse ? ` · ${escHtml(estado.subclasse)}` : '';
    el.innerHTML = `
      <button type="button" class="resumo-chip" data-ir-passo="1">${ic.simbolo || ''} ${escHtml(estado.classe)}${sub} <span class="resumo-editar">alterar</span></button>
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
      estado.subclasse = sel.value; limparEscolhasDeSubclasse(); renderTudoDinamico();
    });
    const selG = $('cSubclasseSel'); // seletor genérico de subclasse (não-Mago)
    if (selG) selG.addEventListener('change', () => {
      estado.subclasse = selG.value; limparEscolhasDeSubclasse(); renderTudoDinamico();
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
    let total = 0;
    (estado.itens || []).forEach(i => { total += pesoDeItem(i); });
    // munição: peso proporcional ao pack do catálogo
    if (estado.municao && estado.municao.nome && typeof CATALOGO !== 'undefined') {
      const pack = CATALOGO.find(i => i.cat === 'municao' && i.municaoNome === estado.municao.nome);
      if (pack && pack.qtdPack) total += (pack.pesoKg / pack.qtdPack) * estado.municao.qtd;
    }
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

    // Personalidade: sorteia da tabela sugerida do antecedente (história/item de memória ficam em branco p/ o jogador escrever)
    const antAuto = (typeof antecedenteDados === 'function') ? antecedenteDados(s.antecedente) : ANTECEDENTES[s.antecedente];
    if (antAuto) {
      s.personalidade = {
        traco: escolherAleatorio(antAuto.tracosPersonalidade || ['']),
        ideal: escolherAleatorio(antAuto.ideais || ['']),
        ligacao: escolherAleatorio(antAuto.ligacoes || ['']),
        defeito: escolherAleatorio(antAuto.defeitos || ['']),
      };
    }

    // Atributos: melhor arranjo legal distribuído pela prioridade da classe
    const ordem = (typeof ATRIBUTOS_PRIORIDADE !== 'undefined' && ATRIBUTOS_PRIORIDADE[s.classe])
      || ['for', 'des', 'con', 'int', 'sab', 'car'];
    const todos = ['for', 'des', 'con', 'int', 'sab', 'car'];
    const arr = [...(typeof ARRANJO_OTIMO !== 'undefined' ? ARRANJO_OTIMO : ARRANJO_PADRAO)].sort((a, b) => b - a);
    ordem.forEach((k, i) => { s.base[k] = arr[i]; });

    // Subclasse aleatória quando o nível já permite a escolha
    const scDef = (typeof SUBCLASSES !== 'undefined' && SUBCLASSES[s.classe]) || null;
    if (scDef && s.nivel >= scDef.nivel) s.subclasse = escolherAleatorio(scDef.opcoes).nome;

    // Fé & Pacto: Clérigo/Paladino sempre devotos; os demais podem sair ateus
    if (typeof DIVINDADES !== 'undefined') {
      s.divindade = (CLASSES_DEVOTAS.includes(s.classe) || Math.random() > 0.2)
        ? escolherAleatorio(listaDivindades()) : SEM_DIVINDADE;
      if (s.classe === 'Bruxo' && typeof PATRONOS_PACTO !== 'undefined') {
        const pc = PATRONOS_PACTO[s.subclasse];
        const ents = Object.keys((pc || escolherAleatorio(Object.values(PATRONOS_PACTO))).entidades);
        s.patrono = escolherAleatorio(ents);
      }
    }

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

    // Equipamento: kit da classe (escolhas aleatórias) + ouro rolado (trava)
    estado = s;
    if (criandoNovo) {
      const kitDef = (typeof KIT_INICIAL !== 'undefined') ? KIT_INICIAL[s.classe] : null;
      s.kit = {};
      if (kitDef) kitDef.escolhas.forEach((e, i) => { s.kit[i] = Math.floor(Math.random() * e.opcoes.length); });
      aplicarKit();
    }
    if (typeof rolarOuroClasse === 'function') {
      s.ouro = rolarOuroClasse(s.classe).total;
      s.ouroRolado = true;
    }
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
    $('cAnotacoes').value = estado.anotacoes;
    $('cHistoria').value = estado.historia || '';
    $('cItemMemNome').value = estado.itemMemoria.nome || '';
    $('cItemMemTipo').value = estado.itemMemoria.tipo || '';
    $('cItemMemDescricao').value = estado.itemMemoria.descricao || '';
    atualizarContadorHistoria();
    renderMiniatura();
    renderAtributosBase();
    renderAntecedenteInfo();
    renderFe();
    renderPersonalidade();
  }

  // Fase 16.1: preview do avatar (miniatura enviada ou símbolo da classe) +
  // estado do botão "Remover". Chamado ao preencher e após enviar/remover.
  function renderMiniatura() {
    const box = $('cMiniPreview');
    if (box) box.innerHTML = (typeof miniaturaFichaHtml === 'function')
      ? miniaturaFichaHtml(estado, 72) : '';
    const rem = $('cMiniRemover');
    if (rem) rem.style.display = estado.miniaturaUrl ? '' : 'none';
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
    sincronizarEquipado();
    const equip = [s.armadura !== 'Sem armadura' ? s.armadura + (s.escudo ? ' + Escudo' : '') : (s.escudo ? 'Escudo' : ''), ...s.itens.filter(n => n !== s.armadura && n !== 'Escudo')].filter(Boolean).join(', ');
    const magiasTxt = [
      truquesLimpos.length ? 'Truques: ' + truquesLimpos.join(', ') : '',
      magiasLimpas.length ? '1º Círculo: ' + magiasLimpas.join(', ') : '',
      c.conj ? `CD ${c.conj.cd} · Ataque ${(c.conj.ataque >= 0 ? '+' : '') + c.conj.ataque}` : '',
    ].filter(Boolean).join('\n');
    // trocou classe ou subclasse na edição → zera resíduos do Modo de Jogo
    // (preparadas/concentração/slots gastos da escolha antiga sobreviveriam ao
    // Object.assign do aoSalvar e desbalanceariam a ficha)
    const mudouBase = fichaOriginal
      && (fichaOriginal.classe !== s.classe || (fichaOriginal.subclasse || '') !== (s.subclasse || ''));
    const limpezaJogo = mudouBase
      ? { preparadas: [], concentrando: '', slotsUsados: {}, pactoUsados: 0, recursosUsados: {} }
      : {};
    // Multiclasse (Fase 8B): o Criador não tem UI de multiclasse — preserva
    // ficha.classes ao editar, contanto que classe/subclasse/nível primários
    // não tenham mudado aqui (senão ficaria dessincronizado; nesse caso a
    // ficha volta a ser tratada como mono-classe no novo estado).
    const classesPreservadas = (fichaOriginal && fichaOriginal.classes && !mudouBase && fichaOriginal.nivel === s.nivel)
      ? fichaOriginal.classes.map(c => ({ ...c }))
      : undefined;
    return {
      ...limpezaJogo,
      nome: s.nome.trim() || 'Sem nome',
      miniaturaUrl: s.miniaturaUrl || null,
      classe: s.classe,
      classes: classesPreservadas,
      raca: s.raca,
      nivel: s.nivel,
      antecedente: s.antecedente,
      divindade: s.divindade || '',
      patrono: s.classe === 'Bruxo' ? (s.patrono || '') : '',
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
      equipado: { ...s.equipado },
      municao: { ...s.municao },
      kitAplicado: [...(s.kitAplicado || [])],
      ouro: s.ouro,
      ouroRolado: !!s.ouroRolado,
      inventario: equip + (s.ouro ? ` | ${s.ouro} po` : ''),
      magias: magiasTxt,
      anotacoes: s.anotacoes,
      personalidade: { ...s.personalidade },
      historia: s.historia,
      itemMemoria: { ...s.itemMemoria },
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
      s.miniaturaUrl = f.miniaturaUrl || null;
      s.raca = f.raca && RACAS_DETALHE[f.raca] ? f.raca : 'Humano';
      s.classe = f.classe && CLASSE_NOME_PARA_CHAVE[f.classe] ? f.classe : 'Guerreiro';
      const _antValido = typeof antecedenteDados === 'function' ? antecedenteDados(f.antecedente) : ANTECEDENTES[f.antecedente];
      s.antecedente = f.antecedente && _antValido ? f.antecedente : 'Soldado';
      s.divindade = f.divindade || '';
      s.patrono = s.classe === 'Bruxo' ? (f.patrono || '') : '';
      s.nivel = f.nivel || 1;
      if (f.atributos) s.base = { ...s.base, ...f.atributos };
      s.subclasse = f.subclasse || '';
      // subclasse órfã (não pertence à classe atual) → descarta
      const _scDef = (typeof SUBCLASSES !== 'undefined') ? SUBCLASSES[s.classe] : null;
      if (s.subclasse && (!_scDef || !_scDef.opcoes.some(o => o.nome === s.subclasse))) s.subclasse = '';
      const _conj = typeof ehConjurador === 'function' && ehConjurador(s.classe, s.nivel, s.subclasse);
      s.estilo = CLASSES_COM_ESTILO.includes(s.classe) ? (f.estilo || '') : '';
      s.truques = _conj ? (f.truques || []) : [];
      s.magias1 = _conj ? (f.magias1 || []) : [];
      s.itens = [...(f.itens || [])];
      s.ouro = f.ouro || 0;
      // fichas antigas com ouro/nível já contam como "rolagem feita" (trava)
      s.ouroRolado = f.ouroRolado != null ? !!f.ouroRolado : (s.ouro > 0 || s.nivel > 1);
      s.municao = f.municao && f.municao.nome ? { ...f.municao } : { nome: '', qtd: 0 };
      s.kitAplicado = [...(f.kitAplicado || [])];
      if (f.equipado) {
        s.equipado = { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '', ...f.equipado };
      } else {
        // migração dos campos legados (armadura/escudo soltos) p/ bolsa + slots
        const armLegada = f.armadura && f.armadura !== 'Sem armadura' && ARRADURA_OK(f.armadura) ? f.armadura : '';
        if (armLegada && !s.itens.includes(armLegada)) s.itens.push(armLegada);
        if (f.escudo && !s.itens.includes('Escudo')) s.itens.push('Escudo');
        s.equipado = {
          maoPrincipal: s.itens.find(n => { const it = catDe(n); return it && it.cat === 'arma'; }) || '',
          maoSecundaria: f.escudo ? 'Escudo' : '',
          armadura: armLegada,
          foco: s.itens.find(n => { const it = catDe(n); return it && it.cat === 'foco'; }) || '',
        };
      }
      s.armadura = s.equipado.armadura || 'Sem armadura';
      s.escudo = s.equipado.maoSecundaria === 'Escudo';
      s.anotacoes = f.anotacoes || '';
      s.pericias = (f.pericias || []).filter(p => (PERICIAS_CLASSE[s.classe]?.opcoes || []).includes(p));
      s.personalidade = { traco: '', ideal: '', ligacao: '', defeito: '', ...(f.personalidade || {}) };
      s.historia = f.historia || '';
      s.itemMemoria = { nome: '', tipo: '', descricao: '', ...(f.itemMemoria || {}) };
    }
    estado = s;
  }
  function ARRADURA_OK(n) { return !!ARMADURAS[n]; }

  // ---------- Fase B1: rascunho persistente (sobrevive a F5/refresh) ----------
  // O estado da criação vive só em memória; um refresh descartava tudo.
  // Agora cada alteração grava um rascunho no localStorage (debounced) e,
  // ao reabrir o Criador NO MESMO contexto (ficha nova ↔ ficha nova, ou a
  // mesma ficha em edição), oferecemos "continuar de onde parou".
  function chaveRascunho() {
    return `dnd_rascunho_criador_${window.CAMPANHA_ID || 'local'}`;
  }
  let _rascunhoTimer = null;
  function salvarRascunho() {
    if (!estado) return;
    clearTimeout(_rascunhoTimer);
    _rascunhoTimer = setTimeout(() => {
      try {
        localStorage.setItem(chaveRascunho(), JSON.stringify({
          fichaId: fichaOriginal ? (fichaOriginal.id || null) : null,
          criandoNovo, passo, estado, quando: Date.now(),
        }));
      } catch (e) { /* localStorage cheio/indisponível: segue sem rascunho */ }
    }, 300);
  }
  function lerRascunho() {
    try { return JSON.parse(localStorage.getItem(chaveRascunho()) || 'null'); } catch (e) { return null; }
  }
  function limparRascunho() {
    clearTimeout(_rascunhoTimer);
    _rascunhoTimer = null;
    try { localStorage.removeItem(chaveRascunho()); } catch (e) {}
  }

  // ---------- Validação de completude (Fase 9c) ----------
  // Cada passo só deixa avançar quando está completo; Salvar valida tudo.
  // Cada erro carrega `alvo`: o id da seção pendente — a navegação rola até
  // ela e a faz piscar (destacarAlvoInvalido), para o olho achar na hora.
  const HISTORIA_MIN = 150;
  function validarPasso(p) {
    const erros = [];
    const erro = (texto, alvo) => erros.push({ texto, alvo });
    if (p === 1) {
      const sc = (typeof SUBCLASSES !== 'undefined') ? SUBCLASSES[estado.classe] : null;
      if (sc && estado.nivel >= sc.nivel && !estado.subclasse) {
        erro(`Escolha a especialização de ${estado.classe} (disponível a partir do nível ${sc.nivel}).`, 'cGaleriaClasse');
      }
    }
    if (p === 3) {
      if (!estado.nome.trim()) erro('Dê um nome ao personagem.', 'cNome');
      const r = RACAS_DETALHE[estado.raca] || {};
      const ne = r.escolhaAtributos || 0;
      const escolhidos = (estado.escolhaAtributos || []).filter(Boolean).length;
      if (ne && escolhidos < ne) erro(`Escolha os ${ne} atributos de bônus racial (+1) — faltam ${ne - escolhidos}.`, 'cEscolhaAtributos');
      const tamHistoria = (estado.historia || '').trim().length;
      // fichas antigas salvas sem história não ficam presas na edição (legado);
      // fichas novas — e qualquer história começada — precisam do mínimo.
      const exigeHistoria = criandoNovo || tamHistoria > 0;
      if (exigeHistoria && tamHistoria < HISTORIA_MIN) {
        erro(`História prévia precisa de pelo menos ${HISTORIA_MIN} caracteres (tem ${tamHistoria}).`, 'cHistoria');
      }
    }
    if (p === 4) {
      // ⛩️ Divindade & Pacto (aba própria): Clérigo/Paladino exigem divindade
      // (ateu não vale); Bruxo exige a entidade do pacto; as demais classes
      // escolhem divindade OU ateísmo em fichas novas (fichas antigas não travam).
      const divindade = (estado.divindade || '').trim();
      if (CLASSES_DEVOTAS.includes(estado.classe)) {
        if (!divindade || divindade === SEM_DIVINDADE) erro(`${estado.classe} precisa devotar-se a uma divindade (ateu não é opção para esta classe).`, 'cFeWrap');
      } else if (criandoNovo && !divindade) {
        erro('Escolha uma divindade — ou declare o personagem ateu.', 'cFeWrap');
      }
      if (estado.classe === 'Bruxo' && !(estado.patrono || '').trim()) {
        erro('Bruxo precisa de um patrono: escolha a entidade do pacto.', 'cFeWrap');
      }
    }
    if (p === 5) {
      const def = PERICIAS_CLASSE[estado.classe] || { qtd: 0, opcoes: [] };
      if (estado.pericias.length < def.qtd) erro(`Escolha ${def.qtd} perícias de ${estado.classe} — faltam ${def.qtd - estado.pericias.length}.`, 'cPericias');
      const r = RACAS_DETALHE[estado.raca] || {};
      const ne = r.periciaExtra || 0;
      if (ne && estado.periciasExtra.length < ne) erro(`Escolha ${ne} perícias raciais — faltam ${ne - estado.periciasExtra.length}.`, 'cPericiasExtra');
      const temEstilo = CLASSES_COM_ESTILO.includes(estado.classe)
        && (estado.classe !== 'Patrulheiro' || estado.nivel >= 2)
        && (estado.classe !== 'Paladino' || estado.nivel >= 2);
      if (temEstilo && !estado.estilo) erro('Escolha um Estilo de Combate.', 'cEstilo');
      const ehConj = (typeof ehConjurador === 'function') && ehConjurador(estado.classe, estado.nivel, estado.subclasse);
      if (ehConj) {
        const disp = magiasDisponiveis(estado.classe, estado.subclasse, estado.nivel);
        // limites nunca acima do que existe para escolher (evita travar quando o compêndio tem menos magias que a regra pede)
        const limTruques = Math.min(truquesNoNivel(estado.classe, estado.nivel, estado.subclasse), disp.truques.length);
        const limBase = estado.classe === 'Mago'
          ? (6 + (estado.nivel - 1) * 2)
          : magiasNoNivel(estado.classe, estado.nivel, atributosFinais(estado), estado.subclasse);
        const limMagias = Math.min(limBase, disp.circulos.length);
        if (estado.truques.length < limTruques) erro(`Escolha ${limTruques} truques — faltam ${limTruques - estado.truques.length}.`, 'cTruquesWrap');
        if (estado.magias1.length < limMagias) erro(`Escolha ${limMagias} magias — faltam ${limMagias - estado.magias1.length}.`, 'cMagias1Wrap');
      }
    }
    return erros;
  }
  function atualizarContadorHistoria() {
    const el = $('cHistoriaCont');
    if (!el) return;
    const n = (estado.historia || '').trim().length;
    const falta = HISTORIA_MIN - n;
    el.innerHTML = falta > 0
      ? `✍️ ${n}/${HISTORIA_MIN} caracteres — faltam <b>${falta}</b>`
      : `✅ ${n} caracteres`;
    el.style.color = falta > 0 ? '#d29922' : '#3fb950';
  }
  function mostrarValidacao(erros) {
    const el = $('cValidacao');
    const textos = erros.map(e => (e && e.texto) || String(e));
    if (!el) { if (textos.length) alert(textos.join('\n')); return; }
    if (!textos.length) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.classList.remove('hidden');
    el.innerHTML = `<b>⚠ Complete antes de continuar:</b><ul>${textos.map(t => `<li>${escHtml(t)}</li>`).join('')}</ul>`;
  }
  // valida todos os passos de `de` até `ate` (exclusivo); devolve o 1º passo com erro ou 0
  let _alvoInvalido = null; // id da seção pendente do 1º erro (p/ rolar e piscar)
  function primeiroPassoInvalido(de, ate) {
    for (let p = de; p < ate; p++) {
      const erros = validarPasso(p);
      if (erros.length) {
        mostrarValidacao(erros);
        _alvoInvalido = erros[0].alvo || null;
        return p;
      }
    }
    mostrarValidacao([]);
    _alvoInvalido = null;
    return 0;
  }
  // Rola até a seção que ficou pendente e a faz PISCAR — o jogador vê na hora
  // o que falta preencher, em vez de procurar pela etapa inteira.
  let _piscarTimer = null;
  let _piscarEl = null;
  function destacarAlvoInvalido() {
    if (!_alvoInvalido) return;
    const el = $(_alvoInvalido);
    if (!el) return;
    // espera o irPasso mostrar a etapa e zerar o scroll antes de rolar até o alvo
    setTimeout(() => {
      // um destaque por vez: cancela o timer do anterior — senão o timer velho
      // (3s) apagava o piscar NOVO no meio da animação quando dois destaques
      // aconteciam em sequência rápida
      clearTimeout(_piscarTimer);
      if (_piscarEl && _piscarEl !== el) _piscarEl.classList.remove('piscar-pendente');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.remove('piscar-pendente');
      void el.offsetWidth; // força reflow p/ reiniciar a animação se já estava piscando
      el.classList.add('piscar-pendente');
      _piscarEl = el;
      _piscarTimer = setTimeout(() => el.classList.remove('piscar-pendente'), 3000);
    }, 80);
  }

  // ---------- Navegação por etapas ----------
  let passo = 1;
  const TOTAL_PASSOS = 6;
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
    // ao trocar de etapa, volta ao topo do modal (sem isso a nova etapa
    // abre no meio/fim da rolagem da etapa anterior)
    const cont = document.querySelector('#modalCriador .modal-content');
    if (cont) cont.scrollTop = 0;
    const form = document.querySelector('#modalCriador .criador-form');
    if (form) form.scrollTop = 0;
    salvarRascunho(); // Fase B1: guarda também o passo atual
  }

  // ---------- Abrir ----------
  function abrir(ficha, opts) {
    ctx = opts || {};
    fichaOriginal = ficha || null;
    montarSelectsUmaVez();
    carregarFicha(ficha);
    // ficha nova já nasce com o melhor arranjo legal p/ a classe e o kit aplicado
    if (criandoNovo) {
      if (typeof ARRANJO_OTIMO !== 'undefined') arranjarPorClasse(ARRANJO_OTIMO);
      aplicarKit();
    }
    // Fase B1: rascunho não salvo DO MESMO contexto? oferece continuar
    let passoInicial = 1;
    const r = lerRascunho();
    const mesmoContexto = r && r.estado
      && ((ficha && r.fichaId === ficha.id) || (!ficha && !r.fichaId));
    if (mesmoContexto) {
      if (confirm(`📝 Há um rascunho não salvo${r.estado.nome ? ` de "${r.estado.nome}"` : ''} nesta mesa. Continuar de onde parou?\n\n(Cancelar começa do zero e descarta o rascunho.)`)) {
        // merge com o shape atual: rascunhos de versões antigas ganham os campos novos
        estado = { ...estadoVazio(), ...r.estado };
        criandoNovo = !!r.criandoNovo;
        passoInicial = Math.max(1, Math.min(TOTAL_PASSOS, r.passo || 1));
      } else {
        limparRascunho();
      }
    }
    preencherCampos();
    atualizarAntecedentesExclusivos(ficha);  // trava antecedentes de campanha já em uso
    renderTudoDinamico();
    $('criadorTitulo').textContent = ficha ? 'Editar Personagem' : 'Criar Personagem';
    $('cExcluir').style.display = (ficha && ctx.aoExcluir) ? 'inline-block' : 'none';
    mostrarValidacao([]);
    irPasso(passoInicial);
    $('modalCriador').classList.remove('hidden');
    // a11y: foco entra no modal ao abrir (teclado/leitor de tela não fica
    // preso na página de trás); Esc fecha — o rascunho B1 preserva o progresso
    const mc = document.querySelector('#modalCriador .modal-content');
    if (mc) { mc.setAttribute('tabindex', '-1'); mc.focus({ preventScroll: true }); }
  }

  // Antecedentes EXCLUSIVOS de campanha (módulos pré-prontos): cada um só pode
  // ser usado por UM PJ na campanha. Desabilita no <select> os que já estão em
  // uso por OUTRAS fichas (a própria ficha em edição continua liberada). O
  // servidor faz a trava definitiva (ver /api/fichas).
  function atualizarAntecedentesExclusivos(fichaAtual) {
    const sel = $('cAntecedente');
    if (!sel || typeof antecedenteExclusivo !== 'function') return;
    const lista = (typeof fichas !== 'undefined' && Array.isArray(fichas)) ? fichas : [];
    const meuId = fichaAtual && fichaAtual.id;
    const meuAnt = fichaAtual && fichaAtual.antecedente;
    const usados = new Set();
    lista.forEach(f => {
      if (f && f.id !== meuId && f.antecedente && antecedenteExclusivo(f.antecedente)) usados.add(f.antecedente);
    });
    Array.from(sel.options).forEach(opt => {
      const emUso = usados.has(opt.value) && opt.value !== meuAnt;
      opt.disabled = emUso;
      opt.textContent = opt.value + (emUso ? ' — em uso nesta campanha' : '');
    });
  }

  let montado = false;
  function montarSelectsUmaVez() {
    if (montado) return;
    montado = true;
    // Antecedente: agrupado por fonte (Livro do Jogador + módulos cadastrados em fontes.js)
    if (typeof antecedentesDisponiveis === 'function') {
      const grupos = {};
      antecedentesDisponiveis().forEach(a => { (grupos[a.grupo] = grupos[a.grupo] || []).push(a.nome); });
      $('cAntecedente').innerHTML = Object.keys(grupos).map(g =>
        `<optgroup label="${g}">${grupos[g].map(a => `<option value="${a}">${a}</option>`).join('')}</optgroup>`).join('');
    } else {
      $('cAntecedente').innerHTML = Object.keys(ANTECEDENTES).map(a => `<option value="${a}">${a}</option>`).join('');
    }
    // Nível
    $('cNivel').innerHTML = Array.from({ length: 20 }, (_, i) => `<option value="${i + 1}">Nível ${i + 1}</option>`).join('');

    // Listeners
    $('cNome').addEventListener('input', () => { estado.nome = $('cNome').value; renderPreview(); });
    $('cAntecedente').addEventListener('change', () => {
      estado.antecedente = $('cAntecedente').value;
      // trocar de antecedente descarta escolhas de personalidade da lista anterior (evita resíduo incoerente)
      estado.personalidade = { traco: '', ideal: '', ligacao: '', defeito: '' };
      renderAntecedenteInfo(); renderPersonalidade(); renderPreview();
    });
    $('cNivel').addEventListener('change', () => { estado.nivel = Number($('cNivel').value); renderTudoDinamico(); });
    $('cEstilo').addEventListener('change', () => { estado.estilo = $('cEstilo').value; renderPreview(); });
    $('cAnotacoes').addEventListener('input', () => { estado.anotacoes = $('cAnotacoes').value; });
    $('cHistoria').addEventListener('input', () => {
      estado.historia = $('cHistoria').value;
      atualizarContadorHistoria();
      renderPreview();
    });
    // U2: gerar a história prévia com IA (botão só aparece se o servidor tiver ANTHROPIC_API_KEY)
    (function setupIaHistoria() {
      const btn = $('cIaHistoria');
      if (!btn) return;
      fetch('/api/ia/status').then(r => r.ok ? r.json() : null).then(st => {
        if (st && st.disponivel) {
          btn.style.display = '';
          btn.title = `Gerações restantes hoje: ${st.restantes}/${st.quota}`;
        }
      }).catch(() => {});
      btn.addEventListener('click', async () => {
        if (!estado.classe && !estado.raca) { alert('Escolha ao menos raça e classe antes de gerar.'); return; }
        const p = estado.personalidade || {};
        const contexto = [
          estado.nome ? `Nome: ${estado.nome}` : '',
          estado.raca ? `Raça: ${estado.raca}` : '',
          estado.classe ? `Classe: ${estado.classe}${estado.subclasse ? ' (' + estado.subclasse + ')' : ''}` : '',
          estado.antecedente ? `Antecedente: ${estado.antecedente}` : '',
          estado.divindade ? `Divindade/fé: ${estado.divindade}` : '',
          estado.patrono ? `Patrono do pacto (Bruxo): ${estado.patrono}` : '',
          estado.nivel ? `Nível: ${estado.nivel}` : '',
          p.traco ? `Traço: ${p.traco}` : '',
          p.ideal ? `Ideal: ${p.ideal}` : '',
          p.ligacao ? `Vínculo: ${p.ligacao}` : '',
          p.defeito ? `Defeito: ${p.defeito}` : '',
        ].filter(Boolean).join('\n');
        const rotulo = btn.textContent;
        btn.disabled = true; btn.textContent = '✨ Gerando...';
        try {
          const r = await fetch('/api/ia/gerar', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'historia', contexto }),
          });
          const d = await r.json().catch(() => ({}));
          if (r.ok && d.texto) {
            $('cHistoria').value = d.texto;
            estado.historia = d.texto;
            atualizarContadorHistoria(); renderPreview();
            if (typeof d.restantes === 'number') btn.title = `Gerações restantes hoje: ${d.restantes}`;
          } else {
            alert(d.detalhe || 'Não foi possível gerar agora.');
          }
        } catch (e) {
          alert('Falha de rede ao contatar a IA.');
        } finally {
          btn.disabled = false; btn.textContent = rotulo;
        }
      });
    })();
    $('cItemMemNome').addEventListener('input', () => { estado.itemMemoria.nome = $('cItemMemNome').value; renderPreview(); });
    $('cItemMemTipo').addEventListener('input', () => { estado.itemMemoria.tipo = $('cItemMemTipo').value; renderPreview(); });
    $('cItemMemDescricao').addEventListener('input', () => { estado.itemMemoria.descricao = $('cItemMemDescricao').value; renderPreview(); });

    // Fase 16.1: enviar miniatura (Firebase Storage). Degrada em modo LAN
    // (sem Firebase) e enquanto o Storage não estiver ativo no Console.
    const miniInput = $('cMiniInput');
    if (miniInput) miniInput.addEventListener('change', async () => {
      const file = miniInput.files && miniInput.files[0];
      miniInput.value = ''; // permite reenviar o mesmo ficheiro depois
      if (!file) return;
      const msg = $('cMiniMsg');
      if (!(window.Armazenamento && window.Armazenamento.disponivel())) {
        if (msg) msg.textContent = '⚠ Envio de imagem indisponível aqui (ative o Storage no Firebase). A ficha usa o símbolo da classe.';
        return;
      }
      if (msg) msg.textContent = '⏳ Enviando… 0%';
      try {
        const url = await window.Armazenamento.enviarMiniatura(file, {
          onProgress: p => { if (msg) msg.textContent = `⏳ Enviando… ${p}%`; },
        });
        estado.miniaturaUrl = url;
        if (msg) msg.textContent = '✓ Miniatura enviada.';
        renderMiniatura(); renderPreview();
      } catch (e) {
        if (msg) msg.textContent = '⚠ ' + ((e && e.message) || 'Falha ao enviar.');
      }
    });
    const miniRem = $('cMiniRemover');
    if (miniRem) miniRem.addEventListener('click', () => {
      estado.miniaturaUrl = null;
      const msg = $('cMiniMsg'); if (msg) msg.textContent = '';
      renderMiniatura(); renderPreview();
    });

    $('btnArranjoPadrao').addEventListener('click', () => {
      arranjarPorClasse(ARRANJO_PADRAO);
      renderAtributosBase(); renderTudoDinamico();
    });
    $('btnRolarAtributos').addEventListener('click', () => {
      arranjarPorClasse(Array.from({ length: 6 }, rolar4d6));
      renderAtributosBase(); renderTudoDinamico();
    });
    $('btnAutoGerar').addEventListener('click', autoGerar);

    $('cCancelar').addEventListener('click', () => $('modalCriador').classList.add('hidden'));
    // Esc fecha o Criador (sem perder nada: o rascunho persistente continua lá)
    $('modalCriador').addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); $('modalCriador').classList.add('hidden'); }
    });
    $('cSalvar').addEventListener('click', () => {
      // ficha só salva completa: valida TODOS os passos, volta ao primeiro
      // incompleto e pisca a seção pendente
      const invalido = primeiroPassoInvalido(1, TOTAL_PASSOS);
      if (invalido) { irPasso(invalido); destacarAlvoInvalido(); return; }
      // itens sem proficiência não bloqueiam (regra 5e permite usar com penalidade), mas o jogador confirma ciente
      sincronizarEquipado();
      const fichaTmp = { classe: estado.classe, classes: undefined, armadura: estado.armadura, escudo: estado.escudo, atributos: atributosFinais(estado), itens: estado.itens, equipado: estado.equipado };
      const avisos = (typeof penalidadesEquipamento === 'function') ? penalidadesEquipamento(fichaTmp) : [];
      if (avisos.length && !confirm(`⚠ Avisos de proficiência/equipamento:\n\n${avisos.map(a => '• ' + a.texto).join('\n')}\n\nSalvar mesmo assim?`)) return;
      if (ctx.aoSalvar) ctx.aoSalvar(construirFicha());
      limparRascunho(); // Fase B1: salvou de verdade — rascunho cumpriu o papel
      $('modalCriador').classList.add('hidden');
    });
    $('cExcluir').addEventListener('click', () => {
      if (ctx.aoExcluir && confirm('Excluir este personagem?')) { ctx.aoExcluir(); limparRascunho(); $('modalCriador').classList.add('hidden'); }
    });

    // navegação por etapas — avançar exige passo completo (voltar é livre)
    $('cVoltar').addEventListener('click', () => { mostrarValidacao([]); irPasso(passo - 1); });
    $('cProximo').addEventListener('click', () => {
      const invalido = primeiroPassoInvalido(passo, passo + 1);
      if (invalido) { destacarAlvoInvalido(); return; }
      irPasso(passo + 1);
    });
    document.querySelectorAll('#modalCriador [data-passo-chip]').forEach(c => {
      c.addEventListener('click', () => {
        const alvo = Number(c.dataset.passoChip);
        if (alvo <= passo) { mostrarValidacao([]); irPasso(alvo); return; }
        const invalido = primeiroPassoInvalido(passo, alvo);
        if (invalido) { irPasso(invalido); destacarAlvoInvalido(); return; }
        irPasso(alvo);
      });
    });
  }

  return { abrir };
})();
window.Criador = Criador;
