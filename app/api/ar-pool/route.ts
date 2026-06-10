import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { STATISTICS_TOPIC_TO_DATASET_FILE, normalizeStatisticsTopic } from "../../sims/active-recall/shared";

function isQuestionDatasetFile(fileName: string) {
  return /^unit\d+\.json$/i.test(fileName);
}

function parseUnitNumber(unitLabel: string) {
  if (!unitLabel) return null;
  const m = unitLabel.match(/Unit\s*(\d+)/i);
  if (!m) return null;
  return Number(m[1]);
}

function readQuestionArray(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(content);
  return Array.isArray(parsed)
    ? parsed
    : (parsed && Array.isArray(parsed.questions) ? parsed.questions : []);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "unit";
    const unit = url.searchParams.get("unit") || "";
    const difficulty = url.searchParams.get("difficulty") || "";

    const datasetsDir = path.join(process.cwd(), "app", "sims", "active-recall", "datasets");
    const ids: string[] = [];

    if (difficulty === "statistics") {
      const statsDir = path.join(datasetsDir, "statistics");
      const requestedTopic = normalizeStatisticsTopic(unit);
      const statsFiles = mode === "unit" && requestedTopic
        ? [STATISTICS_TOPIC_TO_DATASET_FILE[requestedTopic as keyof typeof STATISTICS_TOPIC_TO_DATASET_FILE]].filter(Boolean)
        : Object.values(STATISTICS_TOPIC_TO_DATASET_FILE);

      for (const fileName of new Set(statsFiles)) {
        try {
          const arr = readQuestionArray(path.join(statsDir, fileName));
          if (!Array.isArray(arr) || arr.length === 0) continue;
          for (const question of arr) {
            if (!question?.id) continue;
            ids.push(String(question.id));
          }
        } catch {
          // ignore file parse errors
        }
      }

      return NextResponse.json({ ids, size: ids.length });
    }

    const files = fs.readdirSync(datasetsDir).filter((f) => isQuestionDatasetFile(f));

    const unitNum = parseUnitNumber(unit);

    for (const f of files) {
      try {
        const arr = readQuestionArray(path.join(datasetsDir, f));
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
