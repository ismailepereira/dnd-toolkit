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

  const [popup] = await Promise.all([
    page.waitForEvent('popup'),
    page.evaluate(f => {
      window.Jogo.abrir(f, {});
      document.getElementById('jgPDF').click();
    }, ficha),
  ]);
  await popup.waitForLoadState('domcontentloaded');
  await popup.evaluate(() => { window.print = () => {}; });
  const html = await popup.content();

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

  console.log(falhas.length ? `\n❌ ${falhas.length} falha(s)` : '\n✅ E2E do PDF: todas as verificações passaram');
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(2); });
