#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const datasetsDir = path.join(process.cwd(), 'app', 'sims', 'active-recall', 'datasets');
if (!fs.existsSync(datasetsDir)) {
  console.error('Datasets directory not found:', datasetsDir);
  process.exit(2);
}

const files = fs.readdirSync(datasetsDir).filter(f => f.startsWith('unit1-batch') && f.endsWith('.json'));
if (files.length === 0) {
  console.error('No unit1-batch JSON files found in', datasetsDir);
  process.exit(3);
}

const map = { e: 'easy', h: 'hard', a: 'analysis' };
let totalChanged = 0;
for (const fn of files) {
  const p = path.join(datasetsDir, fn);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) {
      console.warn(fn, 'does not contain a JSON array, skipping');
      continue;
    }
    let changed = 0;
    for (const item of arr) {
      if (!item || typeof item.id !== 'string') continue;
      const m = item.id.match(/^u1-([eha])-/i);
      if (m) {
        const want = map[m[1].toLowerCase()];
        if (item.difficulty !== want) {
          item.difficulty = want;
          changed += 1;
        }
      }
    }
    if (changed > 0) {
      fs.writeFileSync(p, JSON.stringify(arr, null, 2) + '\n', 'utf8');
      console.log(`${fn}: updated ${changed} items`);
      totalChanged += changed;
    } else {
      console.log(`${fn}: no changes`);
    }
  } catch (err) {
    console.error(fn, 'error:', err.message || err);
  }
}
console.log('Done. Total changed:', totalChanged);
process.exit(0);
