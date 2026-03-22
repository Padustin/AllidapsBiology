import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

function parseUnitNumber(unitLabel: string | null) {
  if (!unitLabel) return null;
  const m = unitLabel.match(/Unit\s*(\d+)/i);
  if (!m) return null;
  return Number(m[1]);
}

function parseFrqData(raw: string) {
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.questions)) return parsed.questions;
  return [];
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "all";
    const unit = url.searchParams.get("unit");
    const unitNum = parseUnitNumber(unit);

    const datasetsDir = path.join(process.cwd(), "app", "sims", "active-recall", "datasets");
    const files = fs
      .readdirSync(datasetsDir)
      .filter((f) => f.endsWith(".json") && /frq/i.test(f));

    const candidates: any[] = [];

    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(datasetsDir, f), "utf8");
        const arr = parseFrqData(raw);
        for (const q of arr) {
          if (!q || !Array.isArray(q.parts)) continue;
          if (mode === "unit" && unitNum !== null) {
            if (typeof q.id === "string" && q.id.startsWith(`u${unitNum}-frq-`)) {
              candidates.push(q);
            }
          } else {
            candidates.push(q);
          }
        }
      } catch {
        // ignore malformed files
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json({ error: "No FRQs found.", size: 0 }, { status: 404 });
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return NextResponse.json({ question: picked, size: candidates.length });
  } catch {
    return NextResponse.json({ error: "Failed to load FRQs.", size: 0 }, { status: 500 });
  }
}
