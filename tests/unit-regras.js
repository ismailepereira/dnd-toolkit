#!/usr/bin/env node
// =====================================================
// TESTES UNITÁRIOS DAS REGRAS (dados puros, sem navegador)
// Roda com: node tests/unit-regras.js
// Carrega os ficheiros de dados/regras num contexto isolado (vm) — o mesmo
// código que o navegador executa — e valida a consistência entre eles.
// =====================================================
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const RAIZ = path.join(__dirname, '..');
const sandbox = { console, module: { exports: {} }, require: () => ({}) };
vm.createContext(sandbox);
// ordem espelha a dos <script> nos templates (classes.js define PB antes dos demais usos)
for (const f of ['classes.js', 'dados5e.js', 'compendio.js', 'fontes.js', 'regras-ficha.js', 'formaselvagem.js']) {
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'static/js', f), 'utf8'), sandbox, { filename: f });
}
// const/let do topo dos ficheiros ficam no escopo léxico do contexto, não em
// `sandbox` — extraímos as bindings avaliando uma expressão DENTRO do contexto.
const ctx = vm.runInContext(`({
  PERICIAS, CLASSES, CLASSE_NOME_PARA_CHAVE, PERICIAS_CLASSE, ATRIBUTOS_PRIORIDADE,
  CLASSES_RESUMO, RACAS_DETALHE, RACAS_RESUMO, CONJURACAO, mod, PB,
  DIVINDADES, SEM_DIVINDADE, CLASSES_DEVOTAS, listaDivindades, divindadeDados,
  PATRONOS_PACTO, patronoDados, SUBCLASSES, antecedentesDisponiveis, antecedenteDados,
  calcularCA, percepcaoPassiva, cdConjuracao, pvMaximoMonoclasse,
  FORMAS_SELVAGENS, limiteFormaSelvagem, formasSelvagensDisponiveis, formaSelvagemDados,
})`, sandbox);
// guarda contra testes vácuos: nada aqui pode estar indefinido
for (const k in ctx) assert.ok(ctx[k] != null, `binding indefinida no contexto: ${k}`);

let total = 0;
function t(nome, fn) {
  total++;
  try { fn(); console.log(`✅ ${nome}`); }
  catch (e) { console.error(`❌ ${nome}\n   ${e.message}`); process.exitCode = 1; }
}

// ----- Estrutura básica 5e -----
t('PERICIAS tem as 18 perícias e todas apontam p/ um atributo válido', () => {
  const chaves = ['for', 'des', 'con', 'int', 'sab', 'car'];
  assert.strictEqual(Object.keys(ctx.PERICIAS).length, 18);
  for (const p in ctx.PERICIAS) assert.ok(chaves.includes(ctx.PERICIAS[p]), `${p} → ${ctx.PERICIAS[p]}`);
});

t('CLASSE_NOME_PARA_CHAVE cobre as 12 classes e toda chave existe em CLASSES', () => {
  const nomes = Object.keys(ctx.CLASSE_NOME_PARA_CHAVE);
  assert.strictEqual(nomes.length, 12);
  nomes.forEach(n => assert.ok(ctx.CLASSES[ctx.CLASSE_NOME_PARA_CHAVE[n]], `CLASSES sem a chave de ${n}`));
});

t('toda classe tem PERICIAS_CLASSE, prioridade de atributos e resumo de galeria', () => {
  Object.keys(ctx.CLASSE_NOME_PARA_CHAVE).forEach(n => {
    assert.ok(ctx.PERICIAS_CLASSE[n], `PERICIAS_CLASSE sem ${n}`);
    assert.ok(ctx.ATRIBUTOS_PRIORIDADE[n], `ATRIBUTOS_PRIORIDADE sem ${n}`);
    assert.ok(ctx.CLASSES_RESUMO[n], `CLASSES_RESUMO sem ${n}`);
  });
});

t('opções de perícia por classe existem na lista mestra PERICIAS', () => {
  for (const c in ctx.PERICIAS_CLASSE) {
    ctx.PERICIAS_CLASSE[c].opcoes.forEach(p => assert.ok(ctx.PERICIAS[p] !== undefined, `${c}: perícia desconhecida "${p}"`));
  }
});

t('toda raça de RACAS_DETALHE tem resumo de galeria (e vice-versa)', () => {
  assert.deepStrictEqual(Object.keys(ctx.RACAS_DETALHE).sort(), Object.keys(ctx.RACAS_RESUMO).sort());
});

t('CONJURACAO: atributo-chave válido em todas as classes conjuradoras', () => {
  for (const c in ctx.CONJURACAO) {
    assert.ok(['int', 'sab', 'car'].includes(ctx.CONJURACAO[c].atributo), c);
    assert.ok(ctx.CLASSE_NOME_PARA_CHAVE[c], `CONJURACAO com classe desconhecida: ${c}`);
  }
});

t('mod() segue a tabela 5e', () => {
  assert.strictEqual(ctx.mod(10), 0);
  assert.strictEqual(ctx.mod(8), -1);
  assert.strictEqual(ctx.mod(15), 2);
  assert.strictEqual(ctx.mod(20), 5);
  assert.strictEqual(ctx.mod(3), -4);
});

t('PB() (bônus de proficiência) segue a tabela 5e', () => {
  assert.strictEqual(ctx.PB(1), 2);
  assert.strictEqual(ctx.PB(4), 2);
  assert.strictEqual(ctx.PB(5), 3);
  assert.strictEqual(ctx.PB(9), 4);
  assert.strictEqual(ctx.PB(17), 6);
});

// ----- Fé & Pacto (divindades e patronos) -----
t('DIVINDADES: 6 grupos, 32 divindades, todas com os 5 campos', () => {
  const grupos = Object.keys(ctx.DIVINDADES);
  assert.strictEqual(grupos.length, 6);
  let n = 0;
  grupos.forEach(g => Object.entries(ctx.DIVINDADES[g]).forEach(([nome, d]) => {
    n++;
    ['titulo', 'dominio', 'alinhamento', 'simbolo', 'resumo'].forEach(c =>
      assert.ok(d[c] && d[c].length > 2, `${nome} sem campo "${c}"`));
  }));
  assert.strictEqual(n, 32);
  assert.strictEqual(ctx.listaDivindades().length, 32);
});

t('divindadeDados: acha em qualquer grupo, devolve null p/ ateu e desconhecida', () => {
  const d = ctx.divindadeDados('Lathander');
  assert.strictEqual(d.grupo, 'Vida e Luz');
  assert.strictEqual(d.titulo, 'Senhor da Manhã');
  assert.ok(ctx.divindadeDados('Tiamat'));
  assert.strictEqual(ctx.divindadeDados(ctx.SEM_DIVINDADE), null);
  assert.strictEqual(ctx.divindadeDados('Zeus'), null);
  assert.strictEqual(ctx.divindadeDados(''), null);
});

t('PATRONOS_PACTO: chaves espelham 1:1 as subclasses de Bruxo', () => {
  const subs = ctx.SUBCLASSES['Bruxo'].opcoes.map(o => o.nome).sort();
  const pactos = Object.keys(ctx.PATRONOS_PACTO).sort();
  // JSON.stringify: arrays criados no realm do vm têm outro Array.prototype,
  // o que faria deepStrictEqual falhar mesmo com conteúdo idêntico
  assert.strictEqual(JSON.stringify(pactos), JSON.stringify(subs));
});

t('PATRONOS_PACTO: toda entidade tem título e resumo; dica em todo tipo', () => {
  for (const tipo in ctx.PATRONOS_PACTO) {
    assert.ok(ctx.PATRONOS_PACTO[tipo].dica, `${tipo} sem dica`);
    const ents = ctx.PATRONOS_PACTO[tipo].entidades;
    assert.ok(Object.keys(ents).length >= 4, `${tipo} com poucas entidades`);
    for (const nome in ents) {
      assert.ok(ents[nome].titulo, `${nome} sem título`);
      assert.ok(ents[nome].resumo, `${nome} sem resumo`);
    }
  }
});

t('patronoDados: acha a entidade com o tipo certo; null p/ desconhecida/vazia', () => {
  const p = ctx.patronoDados('Asmodeus');
  assert.strictEqual(p.tipo, 'O Corruptor (Fiend)');
  assert.strictEqual(p.titulo, 'Senhor dos Nove Infernos');
  assert.strictEqual(ctx.patronoDados('Titânia').tipo, 'O Arquifada (Archfey)');
  assert.strictEqual(ctx.patronoDados('Tharizdun').tipo, 'O Grande Antigo (Great Old One)');
  assert.strictEqual(ctx.patronoDados('Fulano'), null);
  assert.strictEqual(ctx.patronoDados(''), null);
});

t('CLASSES_DEVOTAS são classes reais', () => {
  ctx.CLASSES_DEVOTAS.forEach(c => assert.ok(ctx.CLASSE_NOME_PARA_CHAVE[c], c));
});

// ----- Antecedentes -----
t('antecedentes (PHB + módulos): perícias existem e personalidade completa', () => {
  ctx.antecedentesDisponiveis().forEach(({ nome }) => {
    const a = ctx.antecedenteDados(nome);
    assert.ok(a, `antecedenteDados falhou p/ ${nome}`);
    (a.pericias || []).forEach(p => assert.ok(ctx.PERICIAS[p] !== undefined, `${nome}: perícia "${p}"`));
    ['tracosPersonalidade', 'ideais', 'ligacoes', 'defeitos'].forEach(c =>
      assert.ok(Array.isArray(a[c]) && a[c].length >= 1, `${nome} sem ${c}`));
  });
});

// ----- regras-ficha.js: derivados da ficha (fonte única) -----
t('calcularCA: armadura leve/média/pesada, escudo e estilo Defesa', () => {
  const at = { for: 10, des: 16, con: 14, int: 10, sab: 12, car: 8 }; // DES +3
  const base = { classes: ['Guerreiro'], escudo: false, estilo: '', atributos: at };
  assert.strictEqual(ctx.calcularCA({ ...base, armadura: 'Armadura de Couro' }), 14);          // 11 + 3
  assert.strictEqual(ctx.calcularCA({ ...base, armadura: 'Camisão de Malha' }), 15);           // 13 + min(3,2)
  assert.strictEqual(ctx.calcularCA({ ...base, armadura: 'Cota de Malha' }), 16);              // fixa
  assert.strictEqual(ctx.calcularCA({ ...base, armadura: 'Cota de Malha', escudo: true }), 18);
  assert.strictEqual(ctx.calcularCA({ ...base, armadura: 'Cota de Malha', estilo: 'Defesa' }), 17);
  assert.strictEqual(ctx.calcularCA({ ...base, armadura: 'Sem armadura', estilo: 'Defesa' }), 13); // Defesa só COM armadura
});

t('calcularCA: defesa sem armadura de Bárbaro e Monge (e em multiclasse)', () => {
  const at = { for: 14, des: 14, con: 16, int: 10, sab: 16, car: 8 };
  assert.strictEqual(ctx.calcularCA({ classes: ['Bárbaro'], armadura: 'Sem armadura', escudo: false, estilo: '', atributos: at }), 15); // 10+2+3
  assert.strictEqual(ctx.calcularCA({ classes: ['Monge'], armadura: 'Sem armadura', escudo: false, estilo: '', atributos: at }), 15);   // 10+2+3
  // multiclasse: qualquer classe da lista concede a defesa
  assert.strictEqual(ctx.calcularCA({ classes: ['Ladino', 'Bárbaro'], armadura: 'Sem armadura', escudo: false, estilo: '', atributos: at }), 15);
  assert.strictEqual(ctx.calcularCA({ classes: ['Ladino'], armadura: 'Sem armadura', escudo: false, estilo: '', atributos: at }), 12);  // 10+2
});

t('pvMaximoMonoclasse: dado cheio no nv1 + média depois + CON + racial', () => {
  const at = { for: 15, des: 12, con: 16, int: 10, sab: 10, car: 8 }; // CON +3
  assert.strictEqual(ctx.pvMaximoMonoclasse('Guerreiro', 1, at, 'Humano'), 13);        // 10+3
  assert.strictEqual(ctx.pvMaximoMonoclasse('Guerreiro', 3, at, 'Humano'), 31);        // 13 + 2*(6+3)
  assert.strictEqual(ctx.pvMaximoMonoclasse('Mago', 1, at, 'Humano'), 9);              // 6+3
  assert.strictEqual(ctx.pvMaximoMonoclasse('Guerreiro', 3, at, 'Anão da Colina'), 34); // +1 PV/nível
});

t('cdConjuracao: 8+prof+mod; null p/ não-conjurador e meio-conjurador nv1', () => {
  const at = { for: 10, des: 10, con: 10, int: 16, sab: 14, car: 18 };
  const mago = ctx.cdConjuracao('Mago', 1, at, 2);
  assert.deepStrictEqual({ ...mago }, { atributo: 'int', cd: 13, ataque: 5 });
  assert.strictEqual(ctx.cdConjuracao('Guerreiro', 5, at, 3), null);
  assert.strictEqual(ctx.cdConjuracao('Paladino', 1, at, 2), null);   // conjura só do nv2
  assert.strictEqual(ctx.cdConjuracao('Paladino', 2, at, 2).cd, 14);  // 8+2+4 (CAR)
});

t('percepcaoPassiva: 10 + SAB (+prof), aceitando array ou Set', () => {
  const at = { for: 10, des: 10, con: 10, int: 10, sab: 14, car: 10 };
  assert.strictEqual(ctx.percepcaoPassiva(at, ['Furtividade'], 2), 12);
  assert.strictEqual(ctx.percepcaoPassiva(at, ['Percepção'], 2), 14);
  assert.strictEqual(ctx.percepcaoPassiva(at, new Set(['Percepção']), 3), 15);
});

// ----- Forma Selvagem (Druida) -----
t('formas selvagens: catálogo íntegro (stats completos em todas)', () => {
  assert.ok(ctx.FORMAS_SELVAGENS.length >= 20, `só ${ctx.FORMAS_SELVAGENS.length} formas`);
  ctx.FORMAS_SELVAGENS.forEach(f => {
    assert.ok(f.nome && f.nd >= 0 && f.ca >= 10 && f.pv >= 1 && f.desloc, `${f.nome}: básico`);
    ['for', 'des', 'con'].forEach(k => assert.ok(f.atributos[k] >= 1 && f.atributos[k] <= 30, `${f.nome}: ${k}`));
    assert.ok(Array.isArray(f.ataques) && f.ataques.length >= 1 && f.ataques.every(a => a.nome && a.dano), `${f.nome}: ataques`);
    assert.ok(Array.isArray(f.tracos), `${f.nome}: traços`);
  });
});

t('limiteFormaSelvagem segue a tabela do PHB (padrão e Círculo da Lua)', () => {
  assert.strictEqual(ctx.limiteFormaSelvagem(1, ''), null);                       // sem Forma Selvagem no nv1
  assert.deepStrictEqual({ ...ctx.limiteFormaSelvagem(2, '') }, { nd: 0.25, nado: false, voo: false });
  assert.deepStrictEqual({ ...ctx.limiteFormaSelvagem(4, '') }, { nd: 0.5, nado: true, voo: false });
  assert.deepStrictEqual({ ...ctx.limiteFormaSelvagem(8, '') }, { nd: 1, nado: true, voo: true });
  assert.strictEqual(ctx.limiteFormaSelvagem(2, 'Círculo da Lua').nd, 1);         // Forma de Combate
  assert.strictEqual(ctx.limiteFormaSelvagem(9, 'Círculo da Lua').nd, 3);         // ⌊9/3⌋
  assert.strictEqual(ctx.limiteFormaSelvagem(20, 'Círculo da Lua').nd, 6);
  assert.strictEqual(ctx.limiteFormaSelvagem(2, 'Círculo da Lua').nado, false);   // deslocamento não muda com a subclasse
});

t('formasSelvagensDisponiveis filtra ND, natação e voo por nível', () => {
  const nomes = nivel => ctx.formasSelvagensDisponiveis(nivel, '').map(f => f.nome);
  const n2 = nomes(2);
  assert.ok(n2.includes('Lobo') && n2.includes('Pantera'), 'nv2 tem Lobo/Pantera');
  assert.ok(!n2.includes('Corvo') && !n2.includes('Cobra Constritora'), 'nv2 sem voo nem natação');
  assert.ok(!n2.includes('Urso Negro'), 'nv2 sem ND ½');
  const n4 = nomes(4);
  assert.ok(n4.includes('Urso Negro') && n4.includes('Crocodilo') && n4.includes('Cobra Constritora'), 'nv4 ganha ND ½ e natação');
  assert.ok(!n4.includes('Águia Gigante') && !n4.includes('Corvo'), 'nv4 ainda sem voo');
  const n8 = nomes(8);
  assert.ok(n8.includes('Urso-Pardo') && n8.includes('Águia Gigante') && n8.includes('Corvo'), 'nv8 ganha ND 1 e voo');
  assert.ok(!n8.includes('Urso Polar'), 'nv8 padrão não passa de ND 1');
  const lua2 = ctx.formasSelvagensDisponiveis(2, 'Círculo da Lua').map(f => f.nome);
  assert.ok(lua2.includes('Urso-Pardo') && lua2.includes('Lobo Atroz'), 'Lua nv2 alcança ND 1');
  assert.ok(!lua2.includes('Águia Gigante'), 'Lua nv2 continua sem voo');
  const lua9 = ctx.formasSelvagensDisponiveis(9, 'Círculo da Lua').map(f => f.nome);
  assert.ok(lua9.includes('Urso Polar') && lua9.includes('Anquilossauro'), 'Lua nv9 alcança ND 3');
});

t('formaSelvagemDados devolve a forma pelo nome (e null p/ inexistente)', () => {
  assert.strictEqual(ctx.formaSelvagemDados('Urso-Pardo').pv, 34);
  assert.strictEqual(ctx.formaSelvagemDados('Fênix'), null);
});

t('SUBCLASSES: toda classe listada existe e nível de escolha é 1-3', () => {
  for (const c in ctx.SUBCLASSES) {
    assert.ok(ctx.CLASSE_NOME_PARA_CHAVE[c], c);
    assert.ok(ctx.SUBCLASSES[c].nivel >= 1 && ctx.SUBCLASSES[c].nivel <= 3, c);
    assert.ok(ctx.SUBCLASSES[c].opcoes.length >= 2, c);
  }
});

console.log(`\n${process.exitCode ? '❌ Houve falhas' : `✅ ${total} testes passaram`}`);
