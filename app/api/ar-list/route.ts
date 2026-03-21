import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const fs = await Promise.resolve().then(() => require('fs'));
    const path = await Promise.resolve().then(() => require('path'));
    const datasetsDir = path.join(process.cwd(), 'app', 'sims', 'active-recall', 'datasets');
    if (!fs.existsSync(datasetsDir)) return NextResponse.json({ files: [] });
    const files = fs.readdirSync(datasetsDir).filter((f: string) => f.endsWith('.json'));
    const all: any[] = [];
    for (const fn of files) {
      try {
        const raw = fs.readFileSync(path.join(datasetsDir, fn), 'utf8');
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed)
          ? parsed
          : (parsed && Array.isArray(parsed.questions) ? parsed.questions : []);
        for (const q of arr) {
          all.push({ ...q, __file: fn });
        }
      } catch (e) {
        // ignore
      }
    }
    return NextResponse.json({ questions: all });
  } catch (err: any) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
