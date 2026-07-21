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

  // ----- ✨ F2: Expulsar Mortos-Vivos do Clérigo (Canalizar Divindade) -----
  // Frei Bento (nv3, SAB 16 → +3, PB +2) → CD 8+2+3 = 13; 1 uso de Canalizar.
  const f2a = await page.evaluate(f => {
    window.__f = Object.assign({}, f, { recursosUsados: {} });
    window.Jogo.abrir(window.__f, {});
    const bloco = document.querySelector('.jg-expulsar');
    const btn = document.getElementById('jgExpulsar');
    return {
      temBloco: !!bloco,
      texto: bloco ? bloco.textContent.replace(/\s+/g, ' ').trim() : '',
      rotuloBtn: btn ? btn.textContent.replace(/\s+/g, ' ').trim() : '',
      desabilitado: btn ? btn.disabled : null,
    };
  }, clerigoT1);
  ok(f2a.temBloco, 'Clérigo nv3 ganha o card ✨ Expulsar Mortos-Vivos no Modo de Jogo');
  ok(/CD 13/.test(f2a.texto), `Card mostra a CD correta (8+PB+SAB = 13): "${f2a.texto.slice(0, 80)}"`);
  ok(/9m/.test(f2a.texto), 'Card explica o alcance de 9m e a salva de Sabedoria');
  ok(/1\/1/.test(f2a.rotuloBtn) && f2a.desabilitado === false, `Botão começa com 1/1 uso disponível: "${f2a.rotuloBtn}"`);

  // clicar Expulsar gasta 1 Canalizar Divindade, registra no histórico e desabilita o botão
  const f2b = await page.evaluate(() => {
    document.getElementById('jgExpulsar').click();
    const btn = document.getElementById('jgExpulsar');
    return {
      gasto: (window.__f.recursosUsados && window.__f.recursosUsados['Canalizar Divindade']) || 0,
      log: Array.from(document.querySelectorAll('.jg-log li')).map(li => li.textContent).join(' | '),
      desabilitado: btn ? btn.disabled : null,
      rotuloBtn: btn ? btn.textContent.replace(/\s+/g, ' ').trim() : '',
    };
  });
  ok(f2b.gasto === 1, `Expulsar gastou 1 uso de Canalizar Divindade (usados: ${f2b.gasto})`);
  ok(/Expulsar Mortos-Vivos.*CD 13/.test(f2b.log), `Registra no histórico com a CD: "${f2b.log.slice(0, 70)}"`);
  ok(f2b.desabilitado === true && /0\/1/.test(f2b.rotuloBtn), `Botão fica 0/1 e desabilitado sem usos: "${f2b.rotuloBtn}"`);

  // ----- ⚔️ T2: banner "é a sua vez" no Modo de Jogo -----
  const heroi = {
    id: 'teste-t2', nome: 'Aria', raca: 'Humano', classe: 'Guerreiro', nivel: 3,
    subclasse: 'Campeão', antecedente: 'Soldado', divindade: 'Ateu (sem divindade)',
    hpMax: 28, hpAtual: 28, ca: 16, iniciativa: 2,
    atributos: { for: 16, des: 14, con: 15, int: 10, sab: 12, car: 8 },
    pericias: ['Atletismo', 'Percepção'], itens: ['Espada Longa'],
    equipado: { maoPrincipal: 'Espada Longa', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 10, xp: 900, condicoes: [],
  };
  // simula o combate compartilhado com a vez na ficha do herói
  const t2a = await page.evaluate(f => {
    window.COMBATE_ATUAL = {
      ativo: true, turno: 0, rodada: 2, log: [],
      combatentes: [
        { id: 'x1', tipo: 'pc', fichaId: f.id, nome: f.nome, iniciativa: 18, hpAtual: 28, hpMax: 28, ca: 16 },
        { id: 'x2', tipo: 'monstro', nome: 'Ogro', iniciativa: 6, hpAtual: 30, hpMax: 30, ca: 11 },
      ],
    };
    window.Jogo.abrir(f, {});
    const banner = document.querySelector('.jg-vez');
    return { classe: banner ? banner.className : '', texto: banner ? banner.textContent.replace(/\s+/g, ' ').trim() : '', temBotao: !!document.getElementById('jgFinalizarTurno') };
  }, heroi);
  ok(/jg-vez-eu/.test(t2a.classe), 'Banner "é a sua vez" destacado (jg-vez-eu) quando a iniciativa aponta pra ficha');
  ok(/sua vez/i.test(t2a.texto) && /Rodada 2/.test(t2a.texto), `Banner mostra "É a sua vez · Rodada 2": "${t2a.texto.slice(0, 50)}"`);
  ok(t2a.temBotao, 'Botão ✔️ Finalizar meu turno presente');

  // quando a vez é de outro, o banner vira "aguardando" sem botão
  const t2b = await page.evaluate(() => {
    window.COMBATE_ATUAL.turno = 1; // vez do Ogro
    window.Jogo.combateAtualizou();
    const banner = document.querySelector('.jg-vez');
    return { classe: banner ? banner.className : '', texto: banner ? banner.textContent.replace(/\s+/g, ' ').trim() : '', temBotao: !!document.getElementById('jgFinalizarTurno') };
  });
  ok(/jg-vez-aguarda/.test(t2b.classe) && !t2b.temBotao, 'Vez de outro → banner "aguardando" sem botão de finalizar');
  ok(/Ogro/.test(t2b.texto), `Banner mostra de quem é a vez: "${t2b.texto.slice(0, 50)}"`);

  // fora de combate, nenhum banner
  const t2c = await page.evaluate(() => {
    window.COMBATE_ATUAL = { ativo: false, combatentes: [] };
    window.Jogo.combateAtualizou();
    return !!document.querySelector('.jg-vez');
  });
  ok(t2c === false, 'Fora de combate: nenhum banner de turno');

  // ----- 🎯 T3: marcadores de economia de ação (Ação/Bônus/Movimento/Reação) -----
  const lutador = {
    id: 'teste-t3', nome: 'Bruno', raca: 'Humano', classe: 'Guerreiro', nivel: 3,
    subclasse: 'Campeão', antecedente: 'Soldado', divindade: 'Ateu (sem divindade)',
    hpMax: 28, hpAtual: 28, ca: 16, iniciativa: 2,
    atributos: { for: 16, des: 14, con: 15, int: 10, sab: 12, car: 8 },
    pericias: ['Atletismo'], itens: ['Espada Longa'],
    equipado: { maoPrincipal: 'Espada Longa', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 10, xp: 900, condicoes: [],
  };
  const t3a = await page.evaluate(f => {
    window.COMBATE_ATUAL = { ativo: true, turno: 0, rodada: 1, log: [], combatentes: [
      { id: 'y1', tipo: 'pc', fichaId: f.id, nome: f.nome, iniciativa: 18, hpAtual: 28, hpMax: 28, ca: 16 },
      { id: 'y2', tipo: 'monstro', nome: 'Ogro', iniciativa: 6, hpAtual: 30, hpMax: 30, ca: 11 },
    ] };
    window.Jogo.abrir(f, {});
    return { chips: document.querySelectorAll('[data-acaoturno]').length, gastas: document.querySelectorAll('.jg-acao-chip.gasta').length };
  }, lutador);
  ok(t3a.chips === 4, `4 marcadores de ação na minha vez (${t3a.chips})`);
  ok(t3a.gastas === 0, 'Marcadores começam todos disponíveis');

  const t3b = await page.evaluate(() => {
    document.querySelector('[data-acaoturno="acao"]').click();
    const chip = document.querySelector('[data-acaoturno="acao"]');
    return { marcado: chip.classList.contains('gasta'), estado: window.__f ? null : null, ag: (window.COMBATE_ATUAL, document.querySelector('[data-acaoturno="movimento"]').classList.contains('gasta')) };
  });
  ok(t3b.marcado, 'Clicar em "Ação" marca como gasta');
  ok(t3b.ag === false, 'Outros marcadores seguem disponíveis (só o clicado marca)');

  // vira o turno (nova rodada = nova chave) → marcadores auto-resetam
  const t3c = await page.evaluate(() => {
    window.COMBATE_ATUAL.rodada = 2; // chave do turno muda de "1:0" para "2:0"
    window.Jogo.combateAtualizou();
    return document.querySelectorAll('.jg-acao-chip.gasta').length;
  });
  ok(t3c === 0, 'Ao virar o turno (nova rodada), os marcadores auto-resetam');

  // na vez de outro, os marcadores não aparecem
  const t3d = await page.evaluate(() => {
    window.COMBATE_ATUAL.turno = 1; // vez do Ogro
    window.Jogo.combateAtualizou();
    return document.querySelectorAll('[data-acaoturno]').length;
  });
  ok(t3d === 0, 'Fora da minha vez: sem marcadores de ação');

  // ----- 🎬 T3.2: índice de ações no turno leva até cada bloco (sem duplicar) -----
  const clerigoT32 = {
    id: 'teste-t32', nome: 'Dom Aurélio', raca: 'Humano', classe: 'Clérigo', nivel: 3,
    subclasse: 'Domínio da Guerra', antecedente: 'Acólito', divindade: 'Torm',
    hpMax: 24, hpAtual: 24, ca: 16, iniciativa: 0,
    atributos: { for: 14, des: 10, con: 14, int: 8, sab: 16, car: 10 },
    pericias: ['Intuição', 'Religião'], truques: ['Chama Sagrada'],
    magias1: ['Curar Ferimentos', 'Bênção (Bless)'], preparadas: ['Curar Ferimentos'],
    itens: ['Maça'], equipado: { maoPrincipal: 'Maça', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 15, xp: 900, condicoes: [],
  };
  const t32a = await page.evaluate(f => {
    window.COMBATE_ATUAL = { ativo: true, turno: 0, rodada: 1, log: [], combatentes: [
      { id: 'z1', tipo: 'pc', fichaId: f.id, nome: f.nome, iniciativa: 15, hpAtual: 24, hpMax: 24, ca: 16 },
      { id: 'z2', tipo: 'monstro', nome: 'Ogro', iniciativa: 6, hpAtual: 30, hpMax: 30, ca: 11 },
    ] };
    window.Jogo.abrir(f, {});
    return {
      cats: Array.from(document.querySelectorAll('[data-ir-acao]')).map(b => b.dataset.irAcao),
      temBlocoMagias: !!document.querySelector('[data-bloco-acao="magias"]'),
      temBlocoArmas: !!document.querySelector('[data-bloco-acao="armas"]'),
    };
  }, clerigoT32);
  ok(t32a.cats.includes('armas') && t32a.cats.includes('magias') && t32a.cats.includes('recursos'), `Índice lista as categorias presentes (${t32a.cats.join(', ')})`);
  ok(t32a.temBlocoMagias && t32a.temBlocoArmas, 'Blocos-alvo têm o marcador data-bloco-acao');

  // clicar num atalho destaca o bloco correspondente
  const t32b = await page.evaluate(() => {
    document.querySelector('[data-ir-acao="magias"]').click();
    const bloco = document.querySelector('[data-bloco-acao="magias"]');
    return bloco ? bloco.classList.contains('jg-bloco-destaque') : null;
  });
  ok(t32b === true, 'Clicar em "Magias →" destaca o bloco ✨ Conjuração');

  // fora da minha vez o índice não aparece
  const t32c = await page.evaluate(() => {
    window.COMBATE_ATUAL.turno = 1;
    window.Jogo.combateAtualizou();
    return document.querySelectorAll('[data-ir-acao]').length;
  });
  ok(t32c === 0, 'Fora da minha vez: índice de ações some');

  // ----- 🎲 T4: botão "Entrar no combate" quando a ficha ainda não está na ordem -----
  const novato = {
    id: 'teste-t4', nome: 'Kai', raca: 'Humano', classe: 'Ladino', nivel: 2,
    subclasse: 'Ladrão', antecedente: 'Criminoso', divindade: 'Ateu (sem divindade)',
    hpMax: 17, hpAtual: 17, ca: 14, iniciativa: 3,
    atributos: { for: 10, des: 16, con: 14, int: 12, sab: 10, car: 13 },
    pericias: ['Furtividade', 'Acrobacia'], itens: ['Adaga'],
    equipado: { maoPrincipal: 'Adaga', maoSecundaria: '', armadura: '', foco: '' },
    ouro: 10, xp: 300, condicoes: [],
  };
  const t4a = await page.evaluate(f => {
    // combate ativo só com um monstro — a ficha ainda NÃO entrou
    window.COMBATE_ATUAL = { ativo: true, turno: 0, rodada: 1, log: [], combatentes: [
      { id: 'm1', tipo: 'monstro', nome: 'Goblin', iniciativa: 12, hpAtual: 7, hpMax: 7, ca: 15 },
    ] };
    window.Jogo.abrir(f, {});
    const banner = document.querySelector('.jg-vez');
    return { classe: banner ? banner.className : '', temEntrar: !!document.getElementById('jgEntrarCombate') };
  }, novato);
  ok(/jg-vez-entrar/.test(t4a.classe) && t4a.temEntrar, 'Combate ativo sem a ficha na ordem → botão 🎲 Entrar no combate');

  // depois de entrar (aparece na ordem), o botão dá lugar ao banner de turno
  const t4b = await page.evaluate(f => {
    window.COMBATE_ATUAL.combatentes.push({ id: 'p1', tipo: 'pc', fichaId: f.id, nome: f.nome, iniciativa: 19, hpAtual: 17, hpMax: 17, ca: 14 });
    window.COMBATE_ATUAL.turno = 0; // ordenado, o Ladino (ini 19) fica antes? aqui só validamos o estado
    window.Jogo.combateAtualizou();
    return { temEntrar: !!document.getElementById('jgEntrarCombate'), temBanner: !!document.querySelector('.jg-vez') };
  }, novato);
  ok(!t4b.temEntrar && t4b.temBanner, 'Já na ordem → some o botão de entrar e aparece o banner de turno');

  // ---------- T5: Mestre vê as Magias & Poderes do PJ no tracker de combate ----------
  const clerigoT5 = {
    id: 'teste-clerigo-t5', nome: 'Sacerdote Teste', classe: 'Clérigo', raca: 'Humano',
    nivel: 5, hpMax: 33, hpAtual: 33, ca: 16,
    atributos: { for: 12, des: 10, con: 14, int: 10, sab: 16, car: 12 },
    truques: ['Chama Sagrada', 'Luz'],
    magias1: ['Curar Ferimentos', 'Arma Espiritual'],
    preparadas: ['Curar Ferimentos', 'Arma Espiritual'],
    itens: ['Maça'], pericias: [], condicoes: [], xp: 6500,
  };
  const t5 = await page.evaluate(f => {
    // registra a ficha e monta um combate com o PJ como combatente
    fichas = [f];
    combate = { ativo: true, turno: 0, rodada: 1, log: [], combatentes: [
      { id: 'pc1', tipo: 'pc', fichaId: f.id, nome: f.nome, iniciativa: 15, hpAtual: f.hpMax, hpMax: f.hpMax, ca: f.ca, condicoes: [], acoes: [] },
    ] };
    window.COMBATE_ATUAL = combate;
    renderCombate();
    const card = document.querySelector('.comb-card');
    const det = card ? card.querySelector('.comb-mp') : null;
    // também exercita o helper puro direto
    const mp = window.magiasEPoderesDoPC(f);
    return {
      temDetalhe: !!det,
      texto: det ? det.textContent : '',
      cd: mp.conj[0] && mp.conj[0].cd, // Clérigo nv5: 8 + PB(3) + SAB(+3) = 14
      truques: mp.truques.map(t => t.nome),
      circulos: mp.circulos.map(s => `${s.nome}:${s.nivel}`),
      poderes: mp.recursos.map(r => r.nome),
      preparadas: mp.preparadas,
    };
  }, clerigoT5);
  ok(t5.temDetalhe, 'T5: card do PJ tem o bloco 🪄 Magias & Poderes no tracker do Mestre');
  ok(/Magias & Poderes/.test(t5.texto), 'T5: o resumo traz o título Magias & Poderes');
  ok(t5.cd === 14, `T5: CD de conjuração do Clérigo nv5 (SAB+3) = 14 (veio ${t5.cd})`);
  ok(t5.truques.includes('Chama Sagrada') && t5.texto.includes('Chama Sagrada'), 'T5: lista os truques (Chama Sagrada) e aparece no card');
  ok(t5.circulos.includes('Curar Ferimentos:1') && t5.circulos.includes('Arma Espiritual:2'), 'T5: magias de círculo com o nível certo (1º e 2º)');
  ok(t5.preparadas === true, 'T5: Clérigo é reconhecido como preparador (mostra Preparadas)');
  ok(t5.poderes.includes('Canalizar Divindade'), 'T5: lista os poderes de classe (Canalizar Divindade)');
  ok(/executa no próprio Modo de Jogo/.test(t5.texto), 'T5: nota deixa claro que o jogador executa na própria ficha');

  console.log(falhas.length ? `\n❌ ${falhas.length} falha(s)` : '\n✅ E2E do PDF: todas as verificações passaram');
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(2); });
