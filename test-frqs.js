const fs = require('fs');
const path = require('path');

const datasetsDir = path.join(process.cwd(), 'app', 'sims', 'active-recall', 'datasets');
const files = fs.readdirSync(datasetsDir).filter(f => f.endsWith('.json') && /frq/i.test(f));

console.log('=== FRQ File Analysis ===');
console.log('FRQ files found:', files.length);
console.log('');

files.sort().forEach(f => {
  try {
    const raw = fs.readFileSync(path.join(datasetsDir, f), 'utf8');
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.questions) ? parsed.questions : []);
    const withParts = arr.filter(q => q && Array.isArray(q.parts));
    console.log(`${f}: ${arr.length} questions, ${withParts.length} with valid parts`);
    if (arr.length > 0 && arr[0]) {
      console.log(`  First question: ${arr[0].id}`);
    }
  } catch (e) {
    console.log(`${f}: ERROR - ${e.message}`);
  }
});
