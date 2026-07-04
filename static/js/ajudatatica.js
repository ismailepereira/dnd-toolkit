// =====================================================
// AJUDA TÁTICA AO JOGADOR (Fase 8A) — Modo de Jogo
// -----------------------------------------------------
// Funções puras (sem DOM): recebem a ficha + um contexto tático simples e
// devolvem dados já filtrados para o que aquele personagem específico pode
// fazer agora. jogo.js só desenha o HTML a partir do que estas funções
// devolvem — toda a "regra"/curadoria fica aqui, num único lugar fácil de
// expandir (novas dicas, combos ou opções de turno).
//
// Não existe grid/mapa no projeto (ver combate em app.js): por isso as ajudas
// de movimento/ataque/cobertura são apresentadas como informação textual,
// e "inimigo adjacente"/"aliado adjacente ao alvo" são alternados manualmente
// pelo jogador (ficha.estadoTatico), não detectados automaticamente.
// =====================================================

// ---------- Estrutura do contexto tático (ctx) esperado por estas funções ----------
// {
//   classes: [{classe, nivel, subclasse}],   // classesAtuais(ficha) — multiclasse.js
//   nivel: número (total),
//   recursos: [{nome, max, restantes, rec, pool}],  // recursosClasse() + restantes já calculado
//   conjurador: bool,
//   magiasConhecidas: [nomeDaMagia, ...],     // truques + magias castáveis agora
//   concentrando: string,
//   estilo: string,
//   duasArmasDisponivel: bool,
//   estadoTatico: { emFuria, inimigoAdjacente, aliadoAdjacenteAoAlvo, caido },
//   deslocamento: número (metros),
//   armaPrincipal: { nome, tipoDano, alcanceTexto, arremesso, alcance } | null
// }

function _temMagiaComTempo(ctx, tempo) {
  if (!ctx.magiasConhecidas || typeof MAGIAS_DETALHE === 'undefined') return [];
  return ctx.magiasConhecidas.filter(n => MAGIAS_DETALHE[n] && MAGIAS_DETALHE[n].tempo === tempo);
}
function _recursoRestante(ctx, nome) {
  const r = (ctx.recursos || []).find(x => x.nome === nome);
  return r ? r.restantes : null;
}

// ---------- 1) Painel "O teu turno": economia de ações ----------
function opcoesTurno(ficha, ctx) {
  const acao = [], bonus = [], movimento = [], reacao = [], livre = [];
  const classesNomes = ctx.classes.map(c => c.classe);
  const tem = c => classesNomes.includes(c);
  const nivelDe = c => (ctx.classes.find(x => x.classe === c) || {}).nivel || 0;

  // ----- AÇÃO (universal) -----
  const nAtaques = (typeof totalAtaques === 'function') ? totalAtaques(ficha) : 1;
  acao.push({ nome: 'Atacar', desc: nAtaques > 1 ? `${nAtaques} ataques (Ataque Extra).` : 'Um ataque com arma ou desarmado.' });
  if (ctx.conjurador && _temMagiaComTempo(ctx, '1 ação').length) {
    acao.push({ nome: 'Conjurar uma magia', desc: `Magias de 1 ação conhecidas: ${_temMagiaComTempo(ctx, '1 ação').join(', ')}.` });
  }
  acao.push({ nome: 'Corrida (Dash)', desc: 'Dobra seu deslocamento neste turno.' });
  acao.push({ nome: 'Desengajar', desc: 'Seu movimento não provoca ataques de oportunidade até o fim do turno.' });
  acao.push({ nome: 'Esconder-se', desc: 'Teste de Furtividade para ficar oculto.' });
  acao.push({ nome: 'Ajudar', desc: 'Dá vantagem a um aliado num teste ou ataque contra uma criatura adjacente a você.' });
  acao.push({ nome: 'Usar um objeto', desc: 'Beber uma poção, usar uma varinha, puxar uma alavanca distante etc.' });
  if (tem('Druida') && nivelDe('Druida') >= 2) {
    const restantes = _recursoRestante(ctx, 'Forma Selvagem');
    acao.push({ nome: 'Forma Selvagem', desc: `Transforma-se numa fera conhecida (usos: ${restantes ?? '?'}).`, disponivel: restantes == null || restantes > 0 });
  }
  if (tem('Clérigo') && nivelDe('Clérigo') >= 2) {
    const restantes = _recursoRestante(ctx, 'Canalizar Divindade');
    acao.push({ nome: 'Canalizar Divindade', desc: `Use uma opção do seu Domínio (usos: ${restantes ?? '?'}).`, disponivel: restantes == null || restantes > 0 });
  }
  if (tem('Guerreiro')) {
    const restantes = _recursoRestante(ctx, 'Surto de Ação');
    if (restantes != null) acao.push({ nome: 'Surto de Ação', desc: `Ganha uma AÇÃO adicional neste turno (usos: ${restantes}).`, disponivel: restantes > 0 });
  }
  if (tem('Monge') && nivelDe('Monge') >= 3) {
    reacao.push({ nome: 'Defletir Projéteis', desc: 'Reação: reduz o dano de um ataque à distância que te atinja (1d10 + DES + nível de monge); às vezes pode devolvê-lo.' });
  }

  // ----- AÇÃO BÔNUS -----
  if (tem('Bárbaro')) {
    const restantes = _recursoRestante(ctx, 'Fúria');
    bonus.push({ nome: 'Entrar em Fúria', desc: `+dano corpo a corpo e resistência a dano físico (usos: ${restantes ?? '?'}). Ative ANTES de atacar.`, disponivel: (restantes == null || restantes > 0) && !ctx.estadoTatico.emFuria });
  }
  if (tem('Monge')) {
    bonus.push({ nome: 'Ataque desarmado extra', desc: 'Grátis (Artes Marciais), sem custo de Ki.' });
    if (nivelDe('Monge') >= 2) {
      const kiRest = _recursoRestante(ctx, 'Pontos de Ki');
      bonus.push({ nome: 'Rajada de Golpes', desc: `2 ataques desarmados extras por 1 Ponto de Ki (restam: ${kiRest ?? '?'}).`, disponivel: kiRest == null || kiRest > 0 });
    }
  }
  if (tem('Ladino') && nivelDe('Ladino') >= 2) {
    bonus.push({ nome: 'Ação Ardilosa', desc: 'Disparada (Dash), Desengajar ou Esconder-se, grátis.' });
  }
  if (tem('Bardo')) {
    const restantes = _recursoRestante(ctx, 'Inspiração Bárdica');
    bonus.push({ nome: 'Inspiração Bárdica', desc: `Dá 1 dado de inspiração a um aliado que ouça você (restam: ${restantes ?? '?'}).`, disponivel: restantes == null || restantes > 0 });
  }
  if (tem('Feiticeiro') && nivelDe('Feiticeiro') >= 3) {
    bonus.push({ nome: 'Metamagia', desc: 'Se conhecida, pode acelerar (Quickened) uma magia de 1 ação para ação bônus, gastando Pontos de Feitiçaria.' });
  }
  if (_temMagiaComTempo(ctx, '1 ação bônus').length) {
    bonus.push({ nome: 'Conjurar (ação bônus)', desc: _temMagiaComTempo(ctx, '1 ação bônus').join(', ') });
  }
  if (ctx.duasArmasDisponivel) {
    bonus.push({ nome: 'Ataque com a arma secundária', desc: 'Duas armas leves: ataque extra sem somar o modificador ao dano (a menos que tenha o estilo Combate com Duas Armas).' });
  }

  // ----- MOVIMENTO -----
  movimento.push({ nome: `Deslocamento: ${ctx.deslocamento} m`, desc: 'Pode dividir o movimento antes/depois da ação (ex.: andar, atacar, andar mais).' });
  if (ctx.estadoTatico.caido) movimento.push({ nome: 'Levantar-se', desc: 'Custa metade do seu deslocamento total.' });
  movimento.push({ nome: 'Terreno difícil', desc: 'Cada 1,5m em terreno difícil custa 3m de deslocamento.' });

  // ----- REAÇÃO -----
  reacao.push({ nome: 'Ataque de Oportunidade', desc: 'Quando um inimigo visível sai do seu alcance sem Desengajar.' });
  if (ctx.estilo === 'Proteção') reacao.push({ nome: 'Estilo: Proteção', desc: 'Usa seu escudo para impor desvantagem a um ataque contra aliado a até 1,5m.' });
  if (_temMagiaComTempo(ctx, '1 reação').length) {
    reacao.push({ nome: 'Conjurar (reação)', desc: _temMagiaComTempo(ctx, '1 reação').join(', ') });
  }
  if (tem('Ladino') && nivelDe('Ladino') >= 5) {
    reacao.push({ nome: 'Esquiva Sobrenatural', desc: 'Automática: metade do dano de UM ataque que te atinja e que você veja, sem gastar nada além da reação.' });
  }

  // ----- AÇÃO LIVRE (grátis) -----
  livre.push({ nome: 'Falar', desc: 'Uma frase curta, sem gastar ação.' });
  livre.push({ nome: 'Interagir com um objeto', desc: '1 interação grátis por turno: sacar/guardar arma, abrir uma porta, soltar um item.' });

  return { acao, bonus, movimento, reacao, livre };
}

// ---------- 2) Dicas contextuais por classe/subclasse ----------
// `quando` recebe (ficha, ctx) e decide se a dica aparece AGORA.
const DICAS_CLASSE = {
  'Bárbaro': [
    { quando: (f, ctx) => !ctx.estadoTatico.emFuria, texto: '🪓 Ative a Fúria (ação bônus) ANTES de atacar — o dano bônus e a resistência só valem depois de ativada.' },
    { quando: (f, ctx) => ctx.estadoTatico.emFuria, texto: '🔥 Em Fúria: +dano corpo a corpo e resistência a contundente/cortante/perfurante. Lembre-se: sem armadura pesada, sem conjurar magias.' },
    { quando: (f, ctx) => (ctx.classes.find(c => c.classe === 'Bárbaro') || {}).nivel >= 2, texto: '⚔️ Ataque Descuidado: vantagem no ataque corpo a corpo, mas os inimigos também têm vantagem contra você até seu próximo turno.' },
  ],
  'Ladino': [
    { quando: () => true, texto: '🗡️ Ataque Furtivo só funciona com VANTAGEM no ataque OU com um aliado adjacente ao alvo (e sem desvantagem). Confira antes de rolar.' },
    { quando: (f, ctx) => (ctx.classes.find(c => c.classe === 'Ladino') || {}).nivel >= 2, texto: '💨 Ação Ardilosa: Disparar, Desengajar ou Esconder-se como ação bônus — grátis, todo turno.' },
    { quando: (f, ctx) => ctx.estadoTatico.inimigoAdjacente || ctx.estadoTatico.aliadoAdjacenteAoAlvo, texto: '✅ Condição para Ataque Furtivo satisfeita agora (aliado adjacente ao alvo ou vantagem) — pode atacar.' },
  ],
  'Mago': [
    { quando: (f, ctx) => ctx.concentrando, texto: (f, ctx) => `🧠 Está concentrando em ${ctx.concentrando}. Ao sofrer dano: salva de Constituição (CD 10 ou metade do dano) ou perde a magia.` },
    { quando: (f, ctx) => ctx.magiasConhecidas.some(n => /Bola de Fogo|Relâmpago|Nuvem|Tempestade|Cone de Frio/i.test(n)), texto: '💥 Cuidado: magias de área também atingem aliados dentro do raio/linha/cone — confira o posicionamento antes de conjurar.' },
    { quando: (f, ctx) => ctx.magiasConhecidas.includes('Escudo Arcano (Shield)'), texto: '🛡️ Escudo Arcano (Shield) é reação: +5 CA até seu próximo turno, inclusive contra o ataque que a gatilhou.' },
    { quando: (f, ctx) => ctx.magiasConhecidas.includes('Contramágica (Counterspell)'), texto: '🚫 Contramágica: reação ao VER alguém conjurar — não funciona contra magias já em efeito.' },
  ],
  'Guerreiro': [
    { quando: (f, ctx) => (_recursoRestante(ctx, 'Surto de Ação') || 0) > 0, texto: '⚡ Ainda tem Surto de Ação disponível — ganha uma ação extra neste turno (ótimo p/ atacar de novo ou conjurar+atacar).' },
    { quando: (f, ctx) => (_recursoRestante(ctx, 'Retomar o Fôlego') || 0) > 0 && f.hpAtual < f.hpMax * 0.5, texto: '❤️ Considere Retomar o Fôlego (ação bônus): cura 1d10 + níveis de guerreiro.' },
  ],
  'Monge': [
    { quando: (f, ctx) => (_recursoRestante(ctx, 'Pontos de Ki') || 0) > 0, texto: '☯️ Golpe Atordoante (nível 5+): ao acertar, gaste 1 Ki para forçar salva de Constituição ou atordoar o alvo.' },
    { quando: () => true, texto: '🥋 CA sem armadura = 10 + DES + SAB. Vestir armadura ANULA essa característica.' },
  ],
  'Clérigo': [
    { quando: (f, ctx) => (_recursoRestante(ctx, 'Canalizar Divindade') || 0) > 0, texto: '📿 Canalizar Divindade disponível — confira as opções do seu Domínio (ex.: Repreender os Mortos-Vivos).' },
    { quando: (f, ctx) => ctx.magiasConhecidas.includes('Arma Espiritual'), texto: '👻 Arma Espiritual: invoque como ação, depois ataque com ela de graça como ação bônus nos turnos seguintes.' },
  ],
  'Druida': [
    { quando: (f, ctx) => (_recursoRestante(ctx, 'Forma Selvagem') || 0) > 0, texto: '🐺 Em Forma Selvagem você não conjura magias (com exceções de subclasse) — decida antes de se transformar.' },
  ],
  'Bardo': [
    { quando: () => true, texto: '🎵 Inspiração Bárdica dada ANTES de um teste/ataque/salva pode ser usada depois de saber o resultado do d20 (mas antes do efeito).' },
    { quando: (f, ctx) => (ctx.classes.find(c => c.classe === 'Bardo') || {}).nivel >= 6, texto: '🎼 Contraencanto: reação, dá vantagem a si ou a um aliado contra ser amedrontado/enfeitiçado.' },
  ],
  'Paladino': [
    { quando: (f, ctx) => true, texto: '⚡ Punição Divina: ao ACERTAR um ataque corpo a corpo, pode gastar um espaço de magia (sem custar ação) para dano radiante extra.' },
    { quando: (f, ctx) => (ctx.classes.find(c => c.classe === 'Paladino') || {}).nivel >= 6, texto: '🛡️ Sua Aura de Proteção soma seu mod. de Carisma às salvaguardas de aliados a até 3m.' },
  ],
  'Patrulheiro': [
    { quando: () => true, texto: '🏹 Marca do Caçador (ação bônus, concentração): +1d6 de dano por acerto contra o alvo marcado.' },
  ],
  'Feiticeiro': [
    { quando: (f, ctx) => (_recursoRestante(ctx, 'Pontos de Feitiçaria') || 0) > 0, texto: '✨ Pontos de Feitiçaria: converta em espaço de magia (descanso curto/longo) ou use Metamagia para moldar a próxima magia.' },
  ],
  'Bruxo': [
    { quando: () => true, texto: '👁️ Seus espaços de Pacto são poucos mas recarregam em descanso CURTO — vale gastar sem medo entre combates.' },
  ],
};
const DICAS_SUBCLASSE = {
  'Caminho do Berserker': [{ quando: () => true, texto: '😡 Frenesi: ataque bônus extra na Fúria, mas soma um nível de Exaustão ao terminá-la.' }],
  'Assassino': [{ quando: () => true, texto: '🔪 Vantagem automática contra qualquer alvo que ainda não agiu no combate — e é crítico automático em surpresos.' }],
  'Escola de Evocação': [{ quando: (f, ctx) => (ctx.classes.find(c => c.subclasse === 'Escola de Evocação') || {}).nivel >= 2, texto: '💠 Esculpir Magias: escolha aliados para não sofrerem dano/efeito das suas próprias evocações de área.' }],
  'Mestre de Batalha': [{ quando: () => true, texto: '🎲 Gaste um Dado Superior numa manobra (ex.: Ataque Precavido, Empurrão) junto com um ataque acertado ou errado, conforme a manobra.' }],
  'Domínio da Guerra': [{ quando: () => true, texto: '⚔️ Guerra Divina (Canalizar Divindade): +bônus de proficiência no dano de arma nesta rodada.' }],
  'Juramento da Devoção': [{ quando: () => true, texto: '✨ Arma Sagrada (Canalizar Divindade): sua arma vira mágica e emite luz por 1 minuto.' }],
  'Círculo da Lua': [{ quando: () => true, texto: '🐻 Forma Selvagem de combate: pode virar feras de ND mais alto que outros Druidas no mesmo nível.' }],
  'Caçador': [{ quando: () => true, texto: '🎯 Presa Predatória: escolha entre Matador de Colossos, Assassino de Enxames ou Matador de Gigantes conforme o inimigo.' }],
};

function _resolveTexto(d, ficha, ctx) { return typeof d.texto === 'function' ? d.texto(ficha, ctx) : d.texto; }
function dicasContextuais(ficha, ctx) {
  const out = [];
  ctx.classes.forEach(c => {
    (DICAS_CLASSE[c.classe] || []).forEach(d => { if (d.quando(ficha, ctx)) out.push(_resolveTexto(d, ficha, ctx)); });
    if (c.subclasse && DICAS_SUBCLASSE[c.subclasse]) {
      DICAS_SUBCLASSE[c.subclasse].forEach(d => { if (d.quando(ficha, ctx)) out.push(_resolveTexto(d, ficha, ctx)); });
    }
  });
  return [...new Set(out)];
}

// ---------- 3) Motor de combos/sugestões por classe ----------
// Lista curada inicial — cada combo é {classes: [...], texto}. `classes` vazio = vale p/ qualquer grupo.
const COMBOS_CLASSE = {
  'Druida': [{ texto: '🌿 Enredar (Entangle) para prender os inimigos + ataque com vantagem de um aliado corpo a corpo contra alvo Impedido.' }],
  'Bárbaro': [{ texto: '🛡️ Empurrão com escudo/agarrão para derrubar ou afastar + aliado ataca o alvo Caído com vantagem (corpo a corpo).' }],
  'Guerreiro': [{ texto: '🛡️ Empurrão com escudo/agarrão para derrubar ou afastar + aliado ataca o alvo Caído com vantagem (corpo a corpo).' }],
  'Ladino': [{ texto: '🗡️ Peça a um aliado para ficar adjacente ao seu alvo (ou use Esconder-se antes) para garantir o Ataque Furtivo mesmo sem vantagem direta.' }],
  'Mago': [
    { texto: '🌫️ Nevoeiro/Escuridão para bloquear visão de arqueiros + avance protegido; cuidado se você também precisar enxergar o alvo.' },
    { texto: '🧊 Enredar/Teia + magia de área (Bola de Fogo) no mesmo grupo de inimigos preso: eles não conseguem se espalhar para reduzir o alcance da explosão.' },
  ],
  'Clérigo': [{ texto: '✝️ Bênção antes do combate começar (ação, concentração) + ataques/salvas dos aliados com +1d4 durante toda a briga.' }],
  'Bardo': [{ texto: '🎵 Dê Inspiração Bárdica a quem for atacar em seguida — o aliado decide usá-la depois de ver o próprio d20.' }],
  'Paladino': [{ texto: '⚡ Ataque corpo a corpo certeiro + Punição Divina no MESMO ataque (gasta o espaço só depois de confirmar o acerto).' }],
  'Patrulheiro': [{ texto: '🏹 Marque o alvo com Marca do Caçador antes de focar fogo com o grupo — todo o dano seu nele soma o bônus.' }],
  'Feiticeiro': [{ texto: '🔥 Metamagia Gemínea (nível 3+) num truque de alvo único para acertar DOIS inimigos com uma única conjuração.' }],
  'Bruxo': [{ texto: '😈 Maldição Profana (Hex, ação bônus) num alvo prioritário antes de focar nele com Rajada Sobrenatural.' }],
};

function combosSugeridos(ficha, ctx) {
  const out = [];
  ctx.classes.forEach(c => { (COMBOS_CLASSE[c.classe] || []).forEach(cb => out.push(cb.texto)); });
  return [...new Set(out)];
}

// ---------- 4) Ajuda de movimentação/ataque (sem grid: informação textual) ----------
// Extrai alcance (curto/longo em metros) de uma string de propriedade tipo
// "munição (24/96m)" ou "arremesso (6/18m)".
function _extrairAlcanceMetros(props) {
  for (const p of (props || [])) {
    const m2 = p.match(/\((\d+)\/(\d+)m\)/);
    if (m2) return { curto: +m2[1], longo: +m2[2] };
  }
  return null;
}

function ajudaMovimentoAtaque(ficha, ctx) {
  const armas = [];
  const eq = ficha.equipado || {};
  [eq.maoPrincipal, eq.maoSecundaria].filter(Boolean).forEach(nome => {
    const it = (typeof itemCatalogo === 'function') ? itemCatalogo(nome) : null;
    if (!it || it.cat !== 'arma') return;
    const alcanceMetros = _extrairAlcanceMetros(it.props);
    const alcancado = (it.props || []).includes('alcance'); // arma com propriedade "alcance" (reach): +1,5m de alcance corpo a corpo
    armas.push({
      nome,
      texto: it.alcance === 'dist'
        ? `${nome}: alcance ${alcanceMetros ? `${alcanceMetros.curto}m (normal) / ${alcanceMetros.longo}m (desvantagem além disso)` : 'à distância'}.`
        : `${nome}: corpo a corpo, alcance ${alcancado ? '3m (propriedade alcance)' : '1,5m'}.`,
    });
  });
  return {
    deslocamento: ctx.deslocamento,
    armas,
    avisoOportunidade: 'Se você (ou um inimigo) sair do alcance de uma arma corpo a corpo inimiga sem Desengajar, sofre um Ataque de Oportunidade (reação do outro lado).',
    cobertura: [
      'Meia cobertura (mureta, móvel, criatura): +2 na CA e em salvas de Destreza.',
      'Três quartos de cobertura (grade, tronco fino, seteira): +5 na CA e em salvas de Destreza.',
      'Cobertura total (atrás de parede sólida): não pode ser alvo direto de ataque ou magia.',
    ],
  };
}
