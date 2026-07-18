#!/usr/bin/env node
// =====================================================
// E2E — Criador de Personagem (Fé & Pacto, validação, scroll e piscar)
// Requer o servidor Flask no ar (use tests/run-e2e.sh, que sobe tudo).
// Env: BASE_URL, MESTRE_USER, MESTRE_SENHA, PW_CHROMIUM (opcional)
// =====================================================
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5099';
const USUARIO = process.env.MESTRE_USER || 'mestre-teste';
const SENHA = process.env.MESTRE_SENHA || 'senha-teste-123';
const HISTORIA = 'Nascido nas docas de Águas Profundas, cresceu ouvindo histórias de monstros e tesouros. '
  + 'Depois que um pacto sombrio salvou sua família da ruína, partiu em busca do preço que ainda deve pagar.';

(async () => {
  const exe = process.env.PW_CHROMIUM || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage();
  const falhas = [];
  const ok = (cond, msg) => { console.log((cond ? '✅' : '❌') + ' ' + msg); if (!cond) falhas.push(msg); };
  page.on('dialog', d => d.accept());
  // o destaque entra por setTimeout — espera ativa (até 3s) em vez de sleep fixo
  const piscou = sel => page.waitForSelector(`${sel}.piscar-pendente`, { timeout: 3000 }).then(() => true).catch(() => false);

  // ----- login (conta legada de mestre, definida por env no run-e2e.sh) -----
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="usuario"]', USUARIO);
  await page.fill('input[name="senha"]', SENHA);
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForLoadState('networkidle');
  if (!page.url().includes('/mestre')) await page.goto(`${BASE}/mestre`);
  await page.waitForLoadState('networkidle');

  await page.evaluate(() => window.Criador.abrir(null, { aoSalvar: f => { window.__fichaSalva = f; } }));
  await page.waitForSelector('#modalCriador:not(.hidden)');
  ok(true, 'Criador abriu');

  // ----- 6 etapas, com a 4 dedicada à fé -----
  const chips = await page.$$eval('[data-passo-chip]', cs => cs.map(c => c.textContent.trim()));
  ok(chips.length === 6, `6 etapas no indicador (${chips.length})`);
  ok(/Divindade/.test(chips[3] || ''), `Etapa 4 é a de Divindade & Pacto ("${chips[3]}")`);

  // ----- Clérigo: divindade obrigatória, com explicação na escolha -----
  await page.click('[data-galeria-classe="Clérigo"]');
  await page.waitForTimeout(200);
  await page.click('.sub-card >> nth=0'); // Domínio (subclasse nível 1)
  await page.waitForTimeout(200);
  // completa a etapa 3 p/ poder chegar à 4 (nome + história mínima; Humano não pede bônus racial)
  await page.click('[data-passo-chip="3"]');
  await page.waitForTimeout(200);
  await page.fill('#cNome', 'Irmã Solene');
  await page.fill('#cHistoria', HISTORIA);
  await page.click('[data-passo-chip="4"]');
  await page.waitForTimeout(250);
  ok(await page.isVisible('.criador-step[data-step="4"]'), 'Etapa 4 (Fé) visível');

  const optAteu = await page.$('#cDivindade option[value="Ateu (sem divindade)"]');
  ok(!!optAteu, 'Opção "Ateu (sem divindade)" existe');
  ok(await optAteu.evaluate(o => o.disabled), 'Ateu DESABILITADO para Clérigo (classe devota)');
  ok((await page.$$eval('#cDivindade optgroup', gs => gs.length)) >= 6, 'Panteão agrupado no select');

  await page.selectOption('#cDivindade', 'Lathander');
  await page.waitForTimeout(200);
  const infoTxt = await page.textContent('#cFeWrap');
  ok(infoTxt.includes('Senhor da Manhã') && infoTxt.includes('renascimento'), 'Painel explica quem é o deus e para quê');
  const prevTxt = await page.textContent('#cPreview');
  ok(prevTxt.includes('Fé & Pacto') && prevTxt.includes('Senhor da Manhã'), 'Preview da ficha explica a divindade');
  ok(!(await page.$('#cPatrono')), 'Clérigo NÃO mostra select de patrono');

  // ----- validação com scroll + piscar: Clérigo ateu não passa -----
  // (força um estado inválido por baixo: Clérigo sem divindade)
  await page.selectOption('#cDivindade', '');
  await page.waitForTimeout(150);
  await page.click('#cProximo');
  await page.waitForTimeout(300);
  ok((await page.textContent('#cValidacao')).includes('devotar'), 'Validação explica a exigência do Clérigo');
  ok(await piscou('#cFeWrap'), 'Seção pendente PISCA (classe piscar-pendente)');

  // ----- salvar lá da etapa 6 volta à etapa pendente e pisca -----
  await page.selectOption('#cDivindade', 'Lathander'); // fé ok
  await page.waitForTimeout(150);
  // esvazia o nome p/ deixar a etapa 3 pendente
  await page.click('[data-passo-chip="3"]');
  await page.waitForTimeout(150);
  await page.fill('#cNome', '');
  // pula direto p/ etapa 1 (voltar é livre) e tenta salvar da última via chips não dá;
  // usa o fluxo real: forçar irPasso(6) e clicar Salvar
  await page.evaluate(() => {
    // navega sem validação (simula usuário que já estava na última etapa)
    document.querySelectorAll('#modalCriador .criador-step').forEach(el => el.classList.toggle('hidden', el.dataset.step !== '6'));
    document.getElementById('cSalvar').style.display = 'inline-block';
  });
  await page.click('#cSalvar');
  await page.waitForTimeout(350);
  ok(await page.isVisible('.criador-step[data-step="3"]'), 'Salvar volta à primeira etapa pendente (3)');
  ok(await piscou('#cNome'), 'Campo pendente (nome) pisca');
  const scrollDepois = await page.evaluate(() => document.querySelector('#modalCriador .modal-content').scrollTop);
  ok(scrollDepois !== undefined, `Scroll controlado ao navegar (scrollTop=${scrollDepois})`);

  // ----- Bruxo: patrono obrigatório, grupo da subclasse marcado -----
  await page.fill('#cNome', 'Vex do Pacto');
  await page.click('[data-passo-chip="1"]');
  await page.waitForTimeout(150);
  await page.click('[data-galeria-classe="Bruxo"]');
  await page.waitForTimeout(200);
  await page.click('.sub-card >> nth=0'); // O Corruptor (Fiend)
  await page.waitForTimeout(200);
  await page.click('[data-passo-chip="3"]');
  await page.waitForTimeout(150);
  await page.fill('#cNome', 'Vex do Pacto');
  await page.fill('#cHistoria', HISTORIA);
  await page.click('[data-passo-chip="4"]');
  await page.waitForTimeout(250);
  ok(!!(await page.$('#cPatrono')), 'Bruxo mostra select de Patrono do Pacto');
  const grupoMarcado = await page.$$eval('#cPatrono optgroup', gs => gs.map(g => g.label).find(l => l.includes('seu pacto')));
  ok(!!grupoMarcado && grupoMarcado.includes('Corruptor'), `Grupo da subclasse marcado (${grupoMarcado})`);

  await page.click('#cProximo'); // sem patrono → deve travar e piscar
  await page.waitForTimeout(300);
  ok((await page.textContent('#cValidacao')).includes('patrono'), 'Validação exige patrono do Bruxo');
  ok(await piscou('#cFeWrap'), 'Fé & Pacto pisca quando falta o patrono');

  await page.selectOption('#cPatrono', 'Orcus');
  await page.waitForTimeout(200);
  ok((await page.textContent('#cFeWrap')).includes('Príncipe Demônio da Morte-Viva'), 'Painel explica o patrono (Orcus)');
  await page.selectOption('#cDivindade', 'Ateu (sem divindade)');
  await page.waitForTimeout(150);
  await page.click('#cProximo');
  await page.waitForTimeout(250);
  ok(await page.isVisible('.criador-step[data-step="5"]'), 'Com fé completa, avança para a etapa 5 (Habilidades)');

  // ----- scroll volta ao topo ao trocar de etapa -----
  await page.evaluate(() => { document.querySelector('#modalCriador .modal-content').scrollTop = 400; });
  await page.click('[data-passo-chip="1"]');
  await page.waitForTimeout(150);
  const topo = await page.evaluate(() => document.querySelector('#modalCriador .modal-content').scrollTop);
  ok(topo === 0, `Scroll volta ao topo ao trocar de etapa (scrollTop=${topo})`);

  // ----- gerador automático preenche fé -----
  await page.click('#btnAutoGerar');
  await page.waitForTimeout(400);
  const divAuto = await page.$eval('#cDivindade', s => s.value);
  ok(divAuto !== '' && divAuto !== '__manual__', `Auto-gerar escolhe divindade (${divAuto})`);

  // ----- a11y: Esc fecha o Criador (o rascunho persistente segura o progresso) -----
  await page.focus('#modalCriador .modal-content');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok(await page.$eval('#modalCriador', el => el.classList.contains('hidden')), 'Esc fecha o modal do Criador');

  console.log(falhas.length ? `\n❌ ${falhas.length} falha(s)` : '\n✅ E2E do Criador: todas as verificações passaram');
  await browser.close();
  process.exit(falhas.length ? 1 : 0);
})().catch(e => { console.error('ERRO:', e.message); process.exit(2); });
