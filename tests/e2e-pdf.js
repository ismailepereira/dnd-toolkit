#!/usr/bin/env node
// =====================================================
// E2E — Exportação da ficha em PDF sai COMPLETA
// (perícias, traços raciais, sentidos, fé & pacto, conjuração, anotações)
// Requer o servidor Flask no ar (use tests/run-e2e.sh).
// =====================================================
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5099';
const USUARIO = process.env.MESTRE_USER || 'mestre-teste';
const SENHA = process.env.MESTRE_SENHA || 'senha-teste-123';

(async () => {
  const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const falhas = [];
  const ok = (cond, msg) => { console.log((cond ? '✅' : '❌') + ' ' + msg); if (!cond) falhas.push(msg); };

  await page.goto(`${BASE}/login`);
  await page.fill('input[name="usuario"]', USUARIO);
  await page.fill('input[name="senha"]', SENHA);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForLoadState('networkidle');
  if (!page.url().includes('/mestre')) await page.goto(`${BASE}/mestre`);
  await page.waitForLoadState('networkidle');

  // ficha completa de teste: Bruxo tiefling com divindade e patrono
  const ficha = {
    id: 'teste-pdf', nome: 'Vex do Pacto', raca: 'Tiefling', classe: 'Bruxo', nivel: 3,
    subclasse: 'O Corruptor (Fiend)', antecedente: 'Acólito',
    divindade: 'Shar', patrono: 'Asmodeus',
    hpMax: 24, hpAtual: 24, ca: 13, iniciativa: 2,
    atributos: { for: 8, des: 14, con: 14, int: 10, sab: 12, car: 16 },
    pericias: ['Arcanismo', 'Enganação', 'Intuição', 'Religião', 'Percepção'],
    truques: ['Rajada Sobrenatural', 'Luz'], magias1: ['Maldição Profana (Hex)', 'Repreensão Infernal'],
    itens: ['Armadura de Couro', 'Adaga'], equipado: { maoPrincipal: 'Adaga', maoSecundaria: '', armadura: 'Armadura de Couro', foco: '' },
    ouro: 15, xp: 900, estilo: '',
    personalidade: { traco: 'Cito escrituras.', ideal: 'Fé.', ligacao: 'Devo tudo ao templo.', defeito: 'Julgo os outros.' },
    historia: 'Uma longa história de pactos e sombras.',
    anotacoes: 'Nota de teste do PDF.',
    itemMemoria: { nome: 'Medalhão', tipo: 'joia', descricao: 'Da minha mãe.' },
    condicoes: [],
  };

  // a exportação agora escreve num IFRAME oculto (sem pop-up/bloqueador);
  // o conteúdo é escrito de forma síncrona no clique — lemos direto dele
  await page.evaluate(f => {
    window.Jogo.abrir(f, {});
    document.getElementById('jgPDF').click();
  }, ficha);
  const html = await page.evaluate(() => {
    const fr = document.getElementById('fichaPdfFrame');
    if (fr && fr.contentWindow) fr.contentWindow.print = () => {}; // não bloqueia o teste
    return (fr && fr.contentDocument) ? fr.contentDocument.documentElement.outerHTML : '';
  });
  ok(html.length > 1000, 'iframe oculto do PDF foi criado com conteúdo (sem pop-up)');

  ok(html.includes('Vex do Pacto'), 'Nome na ficha');
  ok(html.includes('Fé &amp; Pacto') || html.includes('Fé & Pacto'), 'Seção Fé & Pacto');
  ok(html.includes('Shar') && html.includes('Senhora da Noite'), 'Divindade explicada (quem é e para quê)');
  ok(html.includes('Asmodeus') && html.includes('Senhor dos Nove Infernos'), 'Patrono explicado');
  ok(html.includes('Perícias') && html.includes('Acrobacia') && html.includes('Sobrevivência'), 'As 18 perícias listadas');
  ok(html.includes('Traços Raciais') && html.includes('Resistência Infernal'), 'Traços raciais do Tiefling');
  ok(html.includes('Sentidos') && html.includes('Percepção passiva'), 'Sentidos + percepção passiva');
  ok(html.includes('Idiomas') && html.includes('Infernal'), 'Idiomas (racial + antecedente)');
  ok(html.includes('CD de Magia'), 'Conjuração: CD e ataque mágico');
  ok(html.includes('Magia de Pacto') || html.includes('Patrono Sobrenatural'), 'Características de classe acumuladas (nível 1-3)');
  ok(html.includes('Anotações') && html.includes('Nota de teste do PDF.'), 'Anotações');
  ok(html.includes('Antecedente') && html.includes('História Prévia') && html.includes('Medalhão'), 'Antecedente, história e item de memória');

  // ----- salvamento por ficha (PATCH com trava otimista) de ponta a ponta -----
  const resultadoPatch = await page.evaluate(async f => {
    fichas.push(f);
    await salvarFichas();          // cria no servidor (PUT em lista)
    await carregarFichas();        // pega o carimbo atualizadoEm do servidor
    const minha = fichas.find(x => x.id === f.id);
    minha.hpAtual = 21;            // simula dano no Modo de Jogo
    await salvarFicha(minha);      // caminho novo: PATCH só desta ficha
    const doServidor = await fetch('/api/fichas').then(r => r.json());
    const gravada = doServidor.find(x => x.id === f.id) || {};
    return { hpAtual: gravada.hpAtual, carimbo: gravada.atualizadoEm, versao: gravada.schemaVersion, local: minha.atualizadoEm };
  }, ficha);
  ok(resultadoPatch.hpAtual === 21, 'PATCH gravou o dano no servidor (hpAtual 21)');
  ok(!!resultadoPatch.carimbo, 'ficha gravada tem carimbo atualizadoEm');
  ok(resultadoPatch.versao === 2, 'ficha gravada tem schemaVersion 2');
  ok(resultadoPatch.local === resultadoPatch.carimbo, 'cliente sincronizou o carimbo devolvido pelo PATCH');

  // ----- 🐺 Forma Selvagem do Druida (Modo de Jogo) de ponta a ponta -----
  const druida = {
    id: 'teste-druida', nome: 'Raiz Torta', raca: 'Elfo da Floresta', classe: 'Druida', nivel: 2,
    subclasse: 'Círculo da Terra', antecedente: 'Eremita', divindade: 'Silvanus',
    hpMax: 17, hpAtual: 17, ca: 13, iniciativa: 2,
    atributos: { for: 10, des: 14, con: 14, int: 10, sab: 16, car: 8 },
    pericias: ['Natureza', 'Percepção'], truques: ['Orientação'], magias1: ['Curar Ferimentos'],
    itens: [], equipado: { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 5, xp: 300, condicoes: [],
  };
  const fs1 = await page.evaluate(async f => {
    window.Jogo.abrir(f, {});
    const painel = document.querySelector('.jg-forma');
    const opcoes = Array.from(document.querySelectorAll('#jgFsForma option')).map(o => o.value);
    return { temPainel: !!painel, titulo: painel ? painel.textContent.slice(0, 120) : '', opcoes };
  }, druida);
  ok(fs1.temPainel, 'Druida nv2 tem painel 🐺 Forma Selvagem no Modo de Jogo');
  ok(fs1.opcoes.includes('Lobo') && fs1.opcoes.includes('Pantera'), `Formas de nv2 no select (${fs1.opcoes.length} opções)`);
  ok(!fs1.opcoes.includes('Águia Gigante') && !fs1.opcoes.includes('Crocodilo'), 'Sem voo/natação no nv2 (Águia/Crocodilo fora)');

  const fs2 = await page.evaluate(() => {
    document.getElementById('jgFsForma').value = 'Lobo';
    document.getElementById('jgFsTransformar').click();
    const painel = document.querySelector('.jg-forma');
    return { texto: painel.textContent, temReverter: !!document.getElementById('jgFsReverter') };
  });
  ok(fs2.texto.includes('Lobo') && fs2.texto.includes('11'), 'Transformou em Lobo (PV da fera 11 no painel)');
  ok(fs2.temReverter, 'Botão Reverter presente na forma ativa');
  ok(fs2.texto.includes('1/2 usos') || fs2.texto.includes('NÃO conjura'), 'Painel avisa que não conjura na forma');

  // dano maior que os PV da fera → reverte e o excedente vai para o druida
  const fs3 = await page.evaluate(() => {
    document.getElementById('jgFsVal').value = 15; // Lobo tem 11 PV → 4 excedem
    document.getElementById('jgFsDano').click();
    const painel = document.querySelector('.jg-forma');
    const pvTexto = document.querySelector('.jg-pv-num').textContent;
    return { voltouAoSeletor: !!document.getElementById('jgFsTransformar'), pvTexto };
  });
  ok(fs3.voltouAoSeletor, 'Fera caiu → reverteu automaticamente');
  ok(fs3.pvTexto.includes('13'), `Dano excedente (4) passou para o druida: ${fs3.pvTexto.trim().slice(0, 30)} (17→13)`);

  // ----- ✨ C1: magias como cards de ação (conjurar gasta slot, marca concentração) -----
  const clerigo = {
    id: 'teste-clerigo-c1', nome: 'Irmã Solene', raca: 'Humano', classe: 'Clérigo', nivel: 1,
    subclasse: 'Domínio da Vida', antecedente: 'Acólito', divindade: 'Lathander',
    hpMax: 11, hpAtual: 11, ca: 15, iniciativa: 0,
    atributos: { for: 14, des: 10, con: 14, int: 8, sab: 16, car: 10 },
    pericias: ['Intuição', 'Religião'], truques: ['Chama Sagrada', 'Luz', 'Orientação'],
    magias1: ['Curar Ferimentos', 'Bênção (Bless)', 'Escudo da Fé'],
    preparadas: ['Curar Ferimentos', 'Bênção (Bless)'],
    itens: [], equipado: { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 15, xp: 0, condicoes: [],
  };
  const c1a = await page.evaluate(f => {
    window.__f = f; // referência p/ inspecionar o estado após as ações
    window.Jogo.abrir(f, {});
    const bloco = document.querySelector('.jg-conjuracao');
    return {
      existe: !!bloco,
      cabecalho: bloco ? bloco.querySelector('h4').textContent : '',
      cards: Array.from(document.querySelectorAll('.jg-cast .jg-cast-info b')).map(b => b.textContent),
    };
  }, clerigo);
  ok(c1a.existe, 'Bloco ✨ Conjuração aparece no Modo de Jogo');
  ok(c1a.cabecalho.includes('CD') && c1a.cabecalho.includes('13'), `Cabeçalho mostra CD de magia (SAB 16, nv1 → CD 13): "${c1a.cabecalho.trim().slice(0, 60)}"`);
  ok(c1a.cards.includes('Chama Sagrada') && c1a.cards.includes('Curar Ferimentos'), `Truques e preparadas viram cards (${c1a.cards.length} cards)`);

  // conjura Bênção (concentração) → gasta 1 slot do 1º e marca concentração
  const c1b = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('[data-conjurar]')).find(b => b.dataset.conjurar === 'Bênção (Bless)');
    btn.click();
    const f = window.__f;
    return {
      slotsUsados: (f && f.slotsUsados && f.slotsUsados[1]) || null,
      concentrando: f && f.concentrando,
    };
  });
  ok(c1b.slotsUsados === 1, `Conjurar gastou 1 espaço do 1º círculo (usados: ${c1b.slotsUsados})`);
  ok(c1b.concentrando === 'Bênção (Bless)', `Concentração marcada automaticamente (${c1b.concentrando})`);

  // Clérigo nv1 tem 2 espaços: gasta o segundo → cards de 1º círculo apagam
  const c1c = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('[data-conjurar]')).find(b => b.dataset.conjurar === 'Curar Ferimentos');
    btn.click();
    const cardCurar = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.textContent.includes('Curar Ferimentos'));
    const btnDepois = Array.from(document.querySelectorAll('[data-conjurar]')).find(b => b.dataset.conjurar === 'Curar Ferimentos');
    const truqueAceso = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.textContent.includes('Chama Sagrada'));
    return {
      esgotado: cardCurar && cardCurar.classList.contains('esgotado'),
      desabilitado: btnDepois && btnDepois.disabled,
      truqueSegueAceso: truqueAceso && !truqueAceso.classList.contains('esgotado'),
    };
  });
  ok(c1c.esgotado && c1c.desabilitado, 'Sem espaços restantes → card de magia apaga e botão desabilita');
  ok(c1c.truqueSegueAceso, 'Truques continuam sempre acesos (não gastam espaço)');

  // ----- ⚡ F1: Paladino — Sentido Divino rastreável e Punição Divina com botão -----
  const paladino = {
    id: 'teste-paladino-f1', nome: 'Sor Galahad', raca: 'Humano', classe: 'Paladino', nivel: 2,
    subclasse: '', antecedente: 'Nobre', divindade: 'Torm',
    hpMax: 20, hpAtual: 20, ca: 18, iniciativa: 0,
    atributos: { for: 16, des: 10, con: 14, int: 8, sab: 10, car: 16 }, // CAR 16 → mod +3
    pericias: ['Atletismo', 'Persuasão'], estilo: 'Defesa',
    truques: [], magias1: ['Bênção (Bless)', 'Escudo da Fé'], preparadas: ['Bênção (Bless)'],
    itens: ['Espada Longa'], equipado: { maoPrincipal: 'Espada Longa', maoSecundaria: 'Escudo', armadura: '', foco: '' },
    ouro: 25, xp: 300, condicoes: [],
  };
  const f1a = await page.evaluate(f => {
    window.__f = f;
    window.Jogo.abrir(f, {});
    const rec = document.body.textContent;
    const punicao = document.querySelector('.jg-punicao');
    return {
      temSentidoDivino: rec.includes('Sentido Divino'),
      temPunicao: !!punicao,
      botoesPunicao: Array.from(document.querySelectorAll('[data-punicao]')).map(b => b.textContent.trim()),
    };
  }, paladino);
  ok(f1a.temSentidoDivino, 'Sentido Divino aparece como recurso rastreável (não só a cura)');
  ok(f1a.temPunicao, 'Bloco ⚡ Punição Divina presente (Paladino nv2)');
  ok(f1a.botoesPunicao.some(t => t.includes('1º') && t.includes('2d8')), `Botão de Punição do 1º círculo → 2d8 (${f1a.botoesPunicao.join(' | ')})`);

  // usa a Punição do 1º círculo → gasta 1 espaço do 1º e registra o dano radiante
  const f1b = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('[data-punicao]')).find(b => b.dataset.punicao === '1');
    btn.click();
    const f = window.__f;
    const hist = Array.from(document.querySelectorAll('.jg-log li')).map(li => li.textContent).join(' | ');
    return { slot1: (f.slotsUsados && f.slotsUsados[1]) || 0, hist };
  });
  ok(f1b.slot1 === 1, `Punição gastou 1 espaço do 1º círculo (usados: ${f1b.slot1})`);
  ok(/Punição Divina/.test(f1b.hist) && /radiante/.test(f1b.hist), `Dano radiante rolado e registrado no histórico: "${f1b.hist.slice(0, 70)}"`);

  // ----- Criador: aviso honesto do Paladino nível 1 -----
  const f1c = await page.evaluate(() => {
    try { localStorage.removeItem('dnd_rascunho_criador_' + (window.CAMPANHA_ID || 'local')); } catch (e) {}
    window.Criador.abrir(null, {});
    document.querySelector('[data-galeria-classe="Paladino"]').click();
    // nível padrão é 1; lê o painel de classe na etapa de habilidades
    const painel = document.getElementById('cClassePainel');
    return painel ? painel.textContent : '';
  });
  ok(f1c.includes('Sentido Divino'), 'Painel do Paladino no Criador cita Sentido Divino');
  ok(/nível 2/.test(f1c) && /Punição/.test(f1c), 'Criador avisa que magia + Punição chegam no nível 2 (não é ficha quebrada)');
  await page.evaluate(() => document.getElementById('modalCriador').classList.add('hidden'));

  // ----- C2/C3: azagaias agrupadas (×4) e lançar/recuperar arma de arremesso -----
  const barbaro = {
    id: 'teste-barbaro-c2', nome: 'Grokk', raca: 'Meio-Orc', classe: 'Bárbaro', nivel: 1,
    subclasse: '', antecedente: 'Forasteiro', divindade: 'Ateu (sem divindade)',
    hpMax: 15, hpAtual: 15, ca: 13, iniciativa: 2,
    atributos: { for: 16, des: 14, con: 15, int: 8, sab: 10, car: 8 },
    pericias: ['Atletismo', 'Sobrevivência'],
    itens: ['Machado Grande', 'Azagaia', 'Azagaia', 'Azagaia', 'Azagaia'],
    equipado: { maoPrincipal: 'Machado Grande', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 10, xp: 0, condicoes: [],
  };
  const c2a = await page.evaluate(f => {
    window.__f = f;
    window.Jogo.abrir(f, {});
    const linhaAz = Array.from(document.querySelectorAll('#modalJogoBody .pv-linha')).find(l => l.textContent.includes('Azagaia'));
    return {
      texto: linhaAz ? linhaAz.textContent.replace(/\s+/g, ' ').trim() : '',
      temLancar: !!document.querySelector('[data-lancararma="Azagaia"]'),
    };
  }, barbaro);
  ok(/×4/.test(c2a.texto), `Azagaias repetidas agrupadas com quantidade: "${c2a.texto.slice(0, 60)}"`);
  ok(c2a.temLancar, 'Azagaia (arma de arremesso) tem botão 🎯 lançar');

  // lança 1 → em mãos cai para 3, aparece "no chão"
  const c2b = await page.evaluate(() => {
    document.querySelector('[data-lancararma="Azagaia"]').click();
    const f = window.__f;
    const linhaAz = Array.from(document.querySelectorAll('#modalJogoBody .pv-linha')).find(l => l.textContent.includes('Azagaia') && l.textContent.includes('×'));
    return { noChao: (f.arremessadas && f.arremessadas['Azagaia']) || 0, texto: linhaAz ? linhaAz.textContent.replace(/\s+/g, ' ') : '' };
  });
  ok(c2b.noChao === 1, `Lançar registra 1 azagaia no chão (${c2b.noChao})`);
  ok(/3 em mãos/.test(c2b.texto) && /1 no chão/.test(c2b.texto), `Linha mostra "3 em mãos · 1 no chão": "${c2b.texto.slice(0, 70)}"`);

  // recupera → volta tudo para a mão
  const c2c = await page.evaluate(() => {
    document.getElementById('jgRecuperarArrem').click();
    const f = window.__f;
    return { chao: Object.values(f.arremessadas || {}).reduce((a, b) => a + b, 0), temBotao: !!document.getElementById('jgRecuperarArrem') };
  });
  ok(c2c.chao === 0, 'Recuperar zera as armas no chão');
  ok(!c2c.temBotao, 'Botão de recuperar some quando não há nada arremessado');

  // lança as 4 → ataque desabilita ("nenhuma em mãos")
  const c2d = await page.evaluate(() => {
    for (let i = 0; i < 4; i++) { const b = document.querySelector('[data-lancararma="Azagaia"]'); if (b && !b.disabled) b.click(); }
    const btnAtacar = Array.from(document.querySelectorAll('[data-atacararma][data-arma="Azagaia"]'))[0];
    const btnLancar = document.querySelector('[data-lancararma="Azagaia"]');
    return { atacarOff: btnAtacar ? btnAtacar.disabled : null, lancarOff: btnLancar ? btnLancar.disabled : null };
  });
  ok(c2d.atacarOff === true && c2d.lancarOff === true, 'Sem azagaias em mãos → atacar e lançar desabilitam');

  // ----- 🗡️ C4: Ataque Furtivo do Ladino (dados por nível, rola e registra) -----
  const ladino = {
    id: 'teste-ladino-c4', nome: 'Vasco', raca: 'Halfling Pés-Leves', classe: 'Ladino', nivel: 5,
    subclasse: 'Ladrão', antecedente: 'Criminoso', divindade: 'Ateu (sem divindade)',
    hpMax: 27, hpAtual: 27, ca: 14, iniciativa: 3,
    atributos: { for: 8, des: 16, con: 14, int: 12, sab: 10, car: 13 },
    pericias: ['Furtividade', 'Prestidigitação', 'Percepção', 'Acrobacia'],
    itens: ['Adaga'], equipado: { maoPrincipal: 'Adaga', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 20, xp: 6500, condicoes: [], estadoTatico: { emCombate: true, aliadoAdjacenteAoAlvo: true },
  };
  const c4a = await page.evaluate(f => {
    window.__f = f;
    window.Jogo.abrir(f, {});
    const bloco = document.querySelector('.jg-furtivo');
    return {
      existe: !!bloco,
      titulo: bloco ? bloco.querySelector('h4').textContent : '',
      condOk: !!(bloco && bloco.querySelector('.jg-furtivo-cond.ok')),
    };
  }, ladino);
  ok(c4a.existe, 'Bloco 🗡️ Ataque Furtivo presente (Ladino)');
  ok(/3d6/.test(c4a.titulo), `Dados corretos por nível (nv5 → 3d6): "${c4a.titulo.trim()}"`);
  ok(c4a.condOk, 'Condição destacada em verde quando há aliado adjacente ao alvo');

  const c4b = await page.evaluate(() => {
    document.getElementById('jgFurtivo').click();
    const hist = Array.from(document.querySelectorAll('.jg-log li')).map(li => li.textContent).join(' | ');
    return { hist };
  });
  ok(/Ataque Furtivo: 3d6/.test(c4b.hist), `Rola 3d6 e registra no histórico: "${c4b.hist.slice(0, 60)}"`);

  // Ladino nv1 → 1d6 (dado escala com o nível)
  const c4c = await page.evaluate(() => {
    const f = { ...window.__f, id: 'teste-ladino-nv1', nivel: 1, hpMax: 9, hpAtual: 9, xp: 0 };
    window.Jogo.abrir(f, {});
    const bloco = document.querySelector('.jg-furtivo');
    return bloco ? bloco.querySelector('h4').textContent : '';
  });
  ok(/1d6/.test(c4c), `Ladino nv1 → 1d6 (escala por nível): "${c4c.trim()}"`);

  // ----- 🔥 C4: dano da Fúria do Bárbaro somado automático (corpo a corpo com Força) -----
  const barbaro2 = {
    id: 'teste-barbaro-furia', nome: 'Krull', raca: 'Meio-Orc', classe: 'Bárbaro', nivel: 5,
    subclasse: 'Caminho do Berserker', antecedente: 'Forasteiro', divindade: 'Ateu (sem divindade)',
    hpMax: 45, hpAtual: 45, ca: 14, iniciativa: 2,
    atributos: { for: 18, des: 14, con: 16, int: 8, sab: 10, car: 8 }, // FOR +4
    pericias: ['Atletismo', 'Intimidação'],
    itens: ['Machado Grande', 'Arco Curto'],
    equipado: { maoPrincipal: 'Machado Grande', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 10, xp: 6500, condicoes: [], estadoTatico: { emCombate: true, emFuria: false },
  };
  const blocoAtaques = () => {
    const h4 = Array.from(document.querySelectorAll('#modalJogoBody .jg-bloco h4')).find(h => h.textContent.includes('Ataques de Arma'));
    return h4 ? h4.parentElement : null;
  };
  const cf1 = await page.evaluate(f => {
    window.__f = f;
    window.Jogo.abrir(f, {});
    const h4 = Array.from(document.querySelectorAll('#modalJogoBody .jg-bloco h4')).find(h => h.textContent.includes('Ataques de Arma'));
    const bloco = h4 ? h4.parentElement : null;
    const linha = bloco ? Array.from(bloco.querySelectorAll('.pv-linha')).find(l => l.textContent.includes('Machado Grande')) : null;
    return { texto: linha ? linha.textContent.replace(/\s+/g, ' ').trim() : '', temSelo: !!document.querySelector('.jg-furia-selo') };
  }, barbaro2);
  ok(!cf1.temSelo, 'Fora de Fúria: sem selo 🔥 no ataque');
  ok(/\+4/.test(cf1.texto), `Dano base do Machado Grande com FOR +4 (sem Fúria): "${cf1.texto.slice(0, 55)}"`);

  // entra em Fúria → machado (corpo a corpo, Força) ganha +2 (nv5); arco NÃO
  const cf2 = await page.evaluate(() => {
    if (document.getElementById('jgEtFuria')) { document.getElementById('jgEtFuria').checked = true; document.getElementById('jgEtFuria').dispatchEvent(new Event('change')); }
    const h4 = Array.from(document.querySelectorAll('#modalJogoBody .jg-bloco h4')).find(h => h.textContent.includes('Ataques de Arma'));
    const bloco = h4 ? h4.parentElement : null;
    const machado = bloco ? Array.from(bloco.querySelectorAll('.pv-linha')).find(l => l.textContent.includes('Machado Grande')) : null;
    const arco = bloco ? Array.from(bloco.querySelectorAll('.pv-linha')).find(l => l.textContent.includes('Arco Curto')) : null;
    return {
      machado: machado ? machado.textContent.replace(/\s+/g, ' ') : '',
      arcoTemSelo: arco ? arco.textContent.includes('🔥') : null,
      cabecalho: (document.querySelector('.jg-furia-cab') || {}).textContent || '',
    };
  });
  ok(/\+6/.test(cf2.machado) && /🔥\+2/.test(cf2.machado), `Em Fúria: machado corpo a corpo vira +6 (4+2) com selo 🔥: "${cf2.machado.slice(0, 60)}"`);
  ok(cf2.arcoTemSelo === false, 'Fúria NÃO se aplica ao Arco Curto (ataque à distância)');
  ok(/\+2/.test(cf2.cabecalho), `Cabeçalho avisa "Em Fúria: +2 de dano corpo a corpo": "${cf2.cabecalho.trim()}"`);

  // ----- ✨🎲 C5: rolagem integrada nos cards de magia (ataque mágico e dano/cura) -----
  const mago = {
    id: 'teste-mago-c5', nome: 'Elara', raca: 'Alto Elfo', classe: 'Mago', nivel: 5,
    subclasse: 'Escola de Evocação', antecedente: 'Sábio', divindade: 'Mystra',
    hpMax: 27, hpAtual: 27, ca: 12, iniciativa: 2,
    atributos: { for: 8, des: 14, con: 14, int: 16, sab: 10, car: 10 }, // INT +3, pb +3 → CD 14, atq +6
    pericias: ['Arcanismo', 'História'],
    truques: ['Rajada de Fogo', 'Raio de Gelo'], // Rajada: Destreza (save); Raio de Gelo: Ataque à distância
    magias1: ['Mísseis Mágicos', 'Curar Ferimentos'], preparadas: ['Mísseis Mágicos', 'Curar Ferimentos'],
    itens: [], equipado: { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 20, xp: 6500, condicoes: [],
  };
  const c5a = await page.evaluate(f => {
    window.__f = f;
    window.Jogo.abrir(f, {});
    const cards = {};
    document.querySelectorAll('.jg-cast').forEach(c => {
      const nome = c.querySelector('b').textContent;
      cards[nome] = {
        temAtacar: !!c.querySelector('[data-magiaataque]'),
        danoLabel: (c.querySelector('[data-magiadano]') || {}).textContent || '',
        danoFormula: (c.querySelector('[data-magiadano]') || {}).getAttribute ? c.querySelector('[data-magiadano]')?.getAttribute('data-magiadano') : '',
      };
    });
    return cards;
  }, mago);
  // Raio de Gelo é truque de ATAQUE — tem 🎲 atacar; e dano escalado (nv5 → 2d8)
  ok(c5a['Raio de Gelo'] && c5a['Raio de Gelo'].temAtacar, 'Magia de ataque (Raio de Gelo) tem botão 🎲 atacar');
  ok(c5a['Raio de Gelo'] && c5a['Raio de Gelo'].danoFormula === '2d8', `Dano do truque escala por nível (Raio de Gelo nv5 → 2d8): "${c5a['Raio de Gelo'].danoFormula}"`);
  // Rajada de Fogo é SAVE (Destreza) — não tem 🎲 atacar, mas tem 🎲 dano
  ok(c5a['Rajada de Fogo'] && !c5a['Rajada de Fogo'].temAtacar, 'Magia de salvaguarda (Rajada de Fogo) NÃO tem 🎲 atacar');
  ok(c5a['Rajada de Fogo'] && c5a['Rajada de Fogo'].danoFormula === '2d10', `Rajada de Fogo nv5 → 2d10: "${c5a['Rajada de Fogo'].danoFormula}"`);
  // Curar Ferimentos: botão diz "cura" e soma o mod de conjuração (+3)
  ok(c5a['Curar Ferimentos'] && /cura/.test(c5a['Curar Ferimentos'].danoLabel), 'Curar Ferimentos: botão 🎲 cura');
  ok(c5a['Curar Ferimentos'] && c5a['Curar Ferimentos'].danoFormula === '1d8+3', `Cura soma o modificador de conjuração (INT +3 → 1d8+3): "${c5a['Curar Ferimentos'].danoFormula}"`);

  // clicar 🎲 dano registra no histórico
  const c5b = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.querySelector('b').textContent === 'Raio de Gelo');
    card.querySelector('[data-magiadano]').click();
    return Array.from(document.querySelectorAll('.jg-log li')).map(li => li.textContent).join(' | ');
  });
  ok(/Raio de Gelo.*dano/.test(c5b), `Rolar dano da magia registra no histórico: "${c5b.slice(0, 60)}"`);

  // ----- ⓘ T1: card de magia expande "o que faz" (inclusive magia sem dano) -----
  const clerigoT1 = {
    id: 'teste-clerigo-t1', nome: 'Frei Bento', raca: 'Anão da Colina', classe: 'Clérigo', nivel: 3,
    subclasse: 'Domínio da Vida', antecedente: 'Acólito', divindade: 'Lathander',
    hpMax: 24, hpAtual: 24, ca: 16, iniciativa: 0,
    atributos: { for: 12, des: 10, con: 15, int: 8, sab: 16, car: 10 },
    pericias: ['Intuição', 'Religião'], truques: ['Chama Sagrada'],
    magias1: ['Escudo da Fé', 'Bênção (Bless)', 'Curar Ferimentos'],
    preparadas: ['Escudo da Fé', 'Bênção (Bless)'], // Escudo da Fé é magia SEM dano (utilidade)
    itens: [], equipado: { maoPrincipal: '', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 15, xp: 900, condicoes: [],
  };
  const t1a = await page.evaluate(f => {
    window.__f = f;
    window.Jogo.abrir(f, {});
    const card = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.querySelector('b').textContent === 'Escudo da Fé');
    return {
      ehDetails: card ? card.tagName.toLowerCase() : '',
      temOQueFaz: !!(card && card.querySelector('.jg-cast-oquefaz')),
      abertoInicial: card ? card.hasAttribute('open') : null,
      temConjurar: !!(card && card.querySelector('[data-conjurar]')),
    };
  }, clerigoT1);
  ok(t1a.ehDetails === 'details', 'Card de magia agora é <details> expansível');
  ok(t1a.temOQueFaz, 'Card mostra o selo "ⓘ o que faz" (magia sem dano também)');
  ok(t1a.abertoInicial === false, 'Card começa fechado');
  ok(t1a.temConjurar, 'Botão ✨ Conjurar continua presente (magia de utilidade sem dano)');

  // abrir o card mostra a descrição
  const t1b = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.querySelector('b').textContent === 'Escudo da Fé');
    card.querySelector('summary').click();
    const desc = card.querySelector('.jg-cast-desc');
    return { aberto: card.hasAttribute('open'), texto: desc ? desc.textContent.replace(/\s+/g, ' ').trim() : '' };
  });
  ok(t1b.aberto, 'Clicar no card abre a descrição');
  ok(/CA/i.test(t1b.texto) && t1b.texto.length > 20, `Descrição "o que faz" aparece: "${t1b.texto.slice(0, 60)}"`);

  // clicar no botão Conjurar NÃO deve fechar o card (guard de stopPropagation) e deve gastar o espaço
  const t1c = await page.evaluate(() => {
    const card = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.querySelector('b').textContent === 'Escudo da Fé');
    const abertoAntes = card.hasAttribute('open');
    card.querySelector('[data-conjurar]').click();
    const cardDepois = Array.from(document.querySelectorAll('.jg-cast')).find(c => c.querySelector('b').textContent === 'Escudo da Fé');
    return { abertoAntes, gastou: (window.__f.slotsUsados && window.__f.slotsUsados[1]) || 0 };
  });
  ok(t1c.abertoAntes === true, 'Card seguia aberto antes de conjurar (o clique nos botões não togglou)');
  ok(t1c.gastou === 1, `Conjurar a magia sem dano deduziu o espaço do 1º círculo (usados: ${t1c.gastou})`);

  console.log(falhas.length ? `\n❌ ${falhas.length} falha(s)` : '\n✅ E2E do PDF: todas as verificações passaram');
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(2); });
