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

  console.log(falhas.length ? `\n❌ ${falhas.length} falha(s)` : '\n✅ E2E do PDF: todas as verificações passaram');
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(2); });
