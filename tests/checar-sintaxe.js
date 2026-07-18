#!/usr/bin/env node
// Checagem de sintaxe de TODOS os JS servidos ao navegador (node --check).
// Pega erro de digitação/merge antes de qualquer deploy.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'static', 'js');
let falhas = 0;
for (const f of fs.readdirSync(dir).filter(n => n.endsWith('.js')).sort()) {
  try {
    execFileSync(process.execPath, ['--check', path.join(dir, f)], { stdio: 'pipe' });
    console.log(`✅ ${f}`);
  } catch (e) {
    falhas++;
    console.error(`❌ ${f}\n${e.stderr}`);
  }
}
if (falhas) { console.error(`\n❌ ${falhas} ficheiro(s) com erro de sintaxe`); process.exit(1); }
console.log('\n✅ sintaxe OK em todos os JS');
