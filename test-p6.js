// Teste P6 — entradasDoEncontro / xpDoEncontro (funções puras) + rolarLootEncontro
const { entradasDoEncontro, xpDoEncontro } = require('./static/js/aventura.js');
const { rolarLootEncontro } = require('./static/js/loot.js');

let falhas = 0;
function ok(cond, msg) { if (!cond) { console.error('✗ ' + msg); falhas++; } else { console.log('✓ ' + msg); } }

// Bestiário fake para o resolver injetado
const BEST = [
  { nome: 'Goblin', pe: 50, cr: '1/4', loot: { ouroFormula: '2d6', itensGarantidos: [], tabela: [{ item: 'Adaga gasta', peso: 100, qtd: 1 }] } },
  { nome: 'Lobo', pe: 50, cr: '1/4' },
  { nome: 'Hobgoblin Chefe', pe: 700, cr: '3' },
];
const resolver = (nome) => BEST.find(m => m.nome === nome);

const encontro = [{ nome: 'Goblin', qtd: 4 }, { nome: 'Lobo', qtd: 2 }, { nome: 'Hobgoblin Chefe', qtd: 1 }];

// XP: 4*50 + 2*50 + 1*700 = 200 + 100 + 700 = 1000
ok(xpDoEncontro(encontro, resolver) === 1000, `XP do encontro = 1000 (got ${xpDoEncontro(encontro, resolver)})`);

// Entradas: uma por criatura = 4 + 2 + 1 = 7
const entradas = entradasDoEncontro(encontro, resolver);
ok(entradas.length === 7, `7 entradas de criatura (got ${entradas.length})`);

// Monstro ausente é ignorado (sem quebrar)
const comFantasma = [{ nome: 'Goblin', qtd: 1 }, { nome: 'NaoExiste', qtd: 3 }];
ok(xpDoEncontro(comFantasma, resolver) === 50, `monstro ausente conta 0 XP (got ${xpDoEncontro(comFantasma, resolver)})`);
ok(entradasDoEncontro(comFantasma, resolver).length === 1, `monstro ausente não gera entrada`);

// Loot: rolarLootEncontro aceita as entradas; Goblins têm loot próprio (Adaga gasta garantida)
const loot = rolarLootEncontro(entradas);
ok(typeof loot.ouro === 'number' && loot.ouro > 0, `loot gera ouro > 0 (got ${loot.ouro})`);
const adagas = (loot.itens.find(i => i.nome === 'Adaga gasta') || {}).qtd || 0;
ok(adagas === 4, `4 Adagas gastas (loot próprio dos 4 goblins) — got ${adagas}`);

// Encontro vazio / undefined não quebra
ok(xpDoEncontro([], resolver) === 0 && xpDoEncontro(undefined, resolver) === 0, `encontro vazio/undefined = 0 XP`);
ok(entradasDoEncontro(undefined, resolver).length === 0, `encontro undefined = 0 entradas`);

console.log(falhas === 0 ? '\nP6 OK — todos os testes passaram.' : `\n${falhas} FALHA(S).`);
process.exit(falhas === 0 ? 0 : 1);
