import { NextResponse } from 'next/server'

// Simple in-memory rate limiter for development use.
// IP -> { count, windowStart }
const RATE = new Map();

// Note: caching of AI-generated questions disabled to ensure fresh output during testing
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_PER_WINDOW = 20; // requests per IP per window

function getIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  return (fwd || real || 'local').split(',')[0].trim();
}

export async function POST(req: Request) {
  const now = Date.now();
  const ip = getIp(req);

  // rate limit
  const state = RATE.get(ip) || { count: 0, windowStart: now };
  if (now - state.windowStart > WINDOW_MS) {
    state.count = 0;
    state.windowStart = now;
  }
  state.count += 1;
  RATE.set(ip, state);
  if (state.count > MAX_PER_WINDOW) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const { unit = null, difficulty = 'easy' } = body;

  // Always serve from local fixed dataset files.
  try {
    const fs = await Promise.resolve().then(() => require('fs'));
    const path = await Promise.resolve().then(() => require('path'));
    const datasetsDir = path.join(process.cwd(), 'app', 'sims', 'active-recall', 'datasets');
    if (fs.existsSync(datasetsDir)) {
      const files = fs.readdirSync(datasetsDir).filter((f: string) => f.endsWith('.json'));
      const allQuestions: any[] = [];

      // If a specific dataset file was requested, read only that file when it exists
      if (body.dataset) {
        const df = String(body.dataset);
        const matchFile = files.find((fn: string) => fn === df || fn === `${df}.json`);
        if (matchFile) {
          try {
            const raw = fs.readFileSync(path.join(datasetsDir, matchFile), 'utf8');
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) allQuestions.push(...arr);
          } catch (e) {
            // ignore
          }
        }
      } else {
        for (const f of files) {
          try {
            const raw = fs.readFileSync(path.join(datasetsDir, f), 'utf8');
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) allQuestions.push(...arr);
          } catch (e) {
            // ignore bad files
          }
        }
      }

      // Build candidates from the aggregated questions
      let candidates = allQuestions;

      // Normalize difficulty from id prefix when possible (e.g., u1-e-..., u1-h-..., u1-a-...)
      const diffMap: Record<string, string> = { e: 'easy', h: 'hard', a: 'analysis' };
      candidates = candidates.map((q: any) => {
        if (q && typeof q.id === 'string') {
          const m = q.id.match(/^u(\d+)-([eha])-/i);
          if (m) {
            const code = m[2].toLowerCase();
            q.difficulty = diffMap[code] || q.difficulty;
          }
        }
        return q;
      });

      // If unit specified (e.g., "Unit 1. Chemistry of Life"), filter by id prefix convention (u<unit>-...)
      if (unit && typeof unit === 'string' && /Unit\s*\d+/i.test(unit)) {
        const m = unit.match(/Unit\s*(\d+)/i);
        if (m) {
          const unitNum = Number(m[1]);
          candidates = candidates.filter((q: any) => typeof q.id === 'string' && q.id.startsWith(`u${unitNum}-`));
        }
      }

      // Filter by difficulty if present
      if (difficulty) {
        candidates = candidates.filter((q: any) => q.difficulty === difficulty);
      }

      if (candidates.length > 0) {
        const choice = candidates[Math.floor(Math.random() * candidates.length)];
        if (choice) return NextResponse.json({ question: choice, source: 'dataset' });
      }
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed reading dataset files.' }, { status: 500 });
  }

  return NextResponse.json(
    { error: 'No matching question found in fixed dataset.', source: 'dataset' },
    { status: 404 }
  );
}
