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

const diffMap = { e: 'easy', h: 'hard', a: 'analysis' };
let total = 0;
let anomalies = [];

for (const fn of files) {
  const p = path.join(datasetsDir, fn);
  let arr;
  try {
    const raw = fs.readFileSync(p, 'utf8');
    arr = JSON.parse(raw);
  } catch (err) {
    anomalies.push({ file: fn, id: null, issue: 'invalid_json', msg: err.message });
    continue;
  }
  if (!Array.isArray(arr)) {
    anomalies.push({ file: fn, id: null, issue: 'not_array' });
    continue;
  }
  console.log(`${fn}: ${arr.length} items`);
  total += arr.length;
  for (const item of arr) {
    if (!item || typeof item !== 'object') {
      anomalies.push({ file: fn, id: null, issue: 'not_object' });
      continue;
    }
    const id = item.id || '(no-id)';
    const expectedMatch = (id || '').match(/^u1-([eha])-\d+/i);
    if (!item.id) anomalies.push({ file: fn, id, issue: 'missing_id' });
    if (!expectedMatch) anomalies.push({ file: fn, id, issue: 'id_format', msg: 'expected u1-[e|h|a]-NNN' });
    const code = expectedMatch ? expectedMatch[1].toLowerCase() : null;
    const expectedDiff = code ? diffMap[code] : null;
    if (!item.difficulty) anomalies.push({ file: fn, id, issue: 'missing_difficulty' });
    if (expectedDiff && item.difficulty !== expectedDiff) anomalies.push({ file: fn, id, issue: 'difficulty_mismatch', expected: expectedDiff, actual: item.difficulty });
    if (!Array.isArray(item.choices) || item.choices.length !== 4) anomalies.push({ file: fn, id, issue: 'choices_count', count: (item.choices || []).length });
    if (typeof item.correct !== 'number' || item.correct < 0 || item.correct > 3) anomalies.push({ file: fn, id, issue: 'correct_index', val: item.correct });
    if (!item.explain || typeof item.explain !== 'string' || item.explain.trim().length === 0) anomalies.push({ file: fn, id, issue: 'missing_explain' });
    if (item.choice_explanations && (!Array.isArray(item.choice_explanations) || item.choice_explanations.length !== 4)) anomalies.push({ file: fn, id, issue: 'choice_explanations_length' });
    // Heuristic: detect template-generator placeholders (e.g., text contains 'Choose the best answer' or 'Which statement best')
    if (item.text && typeof item.text === 'string' && /choose the best answer|which statement best|select the correct/i.test(item.text)) {
      anomalies.push({ file: fn, id, issue: 'possible_template', text: item.text.slice(0, 120) });
    }
  }
}

console.log('\nSummary:');
console.log('Files checked:', files.length);
console.log('Total questions:', total);
console.log('Anomalies found:', anomalies.length);
if (anomalies.length > 0) console.log(JSON.stringify(anomalies, null, 2));
process.exit(0);
