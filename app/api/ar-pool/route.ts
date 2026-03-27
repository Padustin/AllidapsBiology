import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

function parseUnitNumber(unitLabel: string) {
  if (!unitLabel) return null;
  const m = unitLabel.match(/Unit\s*(\d+)/i);
  if (!m) return null;
  return Number(m[1]);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "unit";
    const unit = url.searchParams.get("unit") || "";
    const difficulty = url.searchParams.get("difficulty") || "";

    const datasetsDir = path.join(process.cwd(), "app", "sims", "active-recall", "datasets");
    const files = fs.readdirSync(datasetsDir).filter((f) => /^unit\d+\.json$/i.test(f));
    const ids: string[] = [];

    const unitNum = parseUnitNumber(unit);

    for (const f of files) {
      try {
        const content = fs.readFileSync(path.join(datasetsDir, f), "utf8");
        const parsed = JSON.parse(content);
        const arr = Array.isArray(parsed)
          ? parsed
          : (parsed && Array.isArray(parsed.questions) ? parsed.questions : []);
        if (!Array.isArray(arr) || arr.length === 0) continue;
        for (const q of arr) {
          // Normalize difficulty from id prefix when possible
          if (q && typeof q.id === 'string') {
            const m = q.id.match(/^u(\d+)-([eha])-/i);
            if (m) {
              const code = m[2].toLowerCase();
              const diffMap: any = { e: 'easy', h: 'hard', a: 'analysis' };
              q.difficulty = diffMap[code] || q.difficulty;
            }
          }

          if (difficulty && q.difficulty && q.difficulty !== difficulty) continue;
          if (mode === "unit") {
            if (unitNum !== null) {
              if (typeof q.id === "string" && q.id.startsWith(`u${unitNum}-`)) ids.push(q.id);
            }
          } else {
            if (!difficulty || (q.difficulty && q.difficulty === difficulty)) ids.push(q.id);
          }
        }
      } catch (e) {
        // ignore file parse errors
      }
    }

    return NextResponse.json({ ids, size: ids.length });
  } catch (e) {
    return NextResponse.json({ ids: [], size: 0 });
  }
}
