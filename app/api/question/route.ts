import { NextResponse } from 'next/server'
import { areQuestionsTooSimilar, getQuestionTopicKey } from '../../sims/active-recall/question-similarity';
import { STATISTICS_TOPIC_TO_DATASET_FILE, normalizeStatisticsTopic } from '../../sims/active-recall/shared';

function isQuestionDatasetFile(fileName: string) {
  return /^unit\d+\.json$/i.test(fileName);
}

function readQuestionArray(fs: any, filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed)
    ? parsed
    : (parsed && Array.isArray(parsed.questions) ? parsed.questions : []);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { unit = null, difficulty = 'easy' } = body;

  // Always serve from local fixed dataset files.
  try {
    const fs = await Promise.resolve().then(() => require('fs'));
    const path = await Promise.resolve().then(() => require('path'));
    const datasetsDir = path.join(process.cwd(), 'app', 'sims', 'active-recall', 'datasets');
    if (fs.existsSync(datasetsDir)) {
      const allQuestions: any[] = [];

      if (difficulty === 'statistics') {
        const statsDir = path.join(datasetsDir, 'statistics');
        const requestedTopic = normalizeStatisticsTopic(typeof unit === 'string' ? unit : null);
        const requestedFiles = requestedTopic
          ? [STATISTICS_TOPIC_TO_DATASET_FILE[requestedTopic as keyof typeof STATISTICS_TOPIC_TO_DATASET_FILE]].filter(Boolean)
          : Object.values(STATISTICS_TOPIC_TO_DATASET_FILE);

        for (const fileName of new Set(requestedFiles)) {
          try {
            const arr = readQuestionArray(fs, path.join(statsDir, fileName));
            if (arr.length > 0) {
              allQuestions.push(...arr.map((question: any) => ({ ...question, difficulty: 'statistics' })));
            }
          } catch (e) {
            // ignore bad files
          }
        }
      } else {
        const files = fs.readdirSync(datasetsDir).filter((f: string) => isQuestionDatasetFile(f));

        // If a specific dataset file was requested, read only that file when it exists
        if (body.dataset) {
          const df = String(body.dataset);
          const matchFile = files.find((fn: string) => fn === df || fn === `${df}.json`);
          if (matchFile) {
            try {
              const arr = readQuestionArray(fs, path.join(datasetsDir, matchFile));
              if (arr.length > 0) allQuestions.push(...arr);
            } catch (e) {
              // ignore
            }
          }
        } else {
          for (const f of files) {
            try {
              const arr = readQuestionArray(fs, path.join(datasetsDir, f));
              if (arr.length > 0) allQuestions.push(...arr);
            } catch (e) {
              // ignore bad files
            }
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

      const questionsById = new Map<string, any>();
      for (const question of candidates) {
        if (question?.id) {
          questionsById.set(String(question.id), question);
        }
      }

      // If unit specified (e.g., "Unit 1. Chemistry of Life"), filter by id prefix convention (u<unit>-...)
      if (difficulty !== 'statistics' && unit && typeof unit === 'string' && /Unit\s*\d+/i.test(unit)) {
        const m = unit.match(/Unit\s*(\d+)/i);
        if (m) {
          const unitNum = Number(m[1]);
          candidates = candidates.filter((q: any) => typeof q.id === 'string' && q.id.startsWith(`u${unitNum}-`));
        }
      } else if (difficulty === 'statistics' && unit && typeof unit === 'string') {
        const topicKey = normalizeStatisticsTopic(unit);
        if (topicKey) {
          candidates = candidates.filter((q: any) => normalizeStatisticsTopic(q?.topic) === topicKey);
        }
      }

      // Filter by difficulty if present
      if (difficulty) {
        candidates = candidates.filter((q: any) => q.difficulty === difficulty);
      }

      if (Array.isArray(body.questionIds) && body.questionIds.length > 0) {
        const allowedIds = new Set(body.questionIds.map((id: unknown) => String(id)));
        candidates = candidates.filter((q: any) => q?.id && allowedIds.has(String(q.id)));
      }

      // In analysis mode, surface image-based questions first when they exist
      // in the remaining candidate pool so users can actually encounter them.
      if (difficulty === 'analysis') {
        const imageCandidates = candidates.filter((q: any) => typeof q?.image === 'string' && q.image.length > 0);
        if (imageCandidates.length > 0) {
          candidates = imageCandidates;
        }
      }

      const recentQuestionIds = Array.isArray(body.recentQuestionIds)
        ? body.recentQuestionIds.map((id: unknown) => String(id))
        : [];
      const recentQuestions = recentQuestionIds
        .map((id: string) => questionsById.get(id))
        .filter(Boolean);

      const avoidSimilarToQuestionIds = Array.isArray(body.avoidSimilarToQuestionIds)
        ? body.avoidSimilarToQuestionIds.map((id: unknown) => String(id))
        : [];
      const avoidSimilarQuestions = Array.from(
        new Map(
          avoidSimilarToQuestionIds
            .map((id: string) => {
              const question = questionsById.get(id);
              return question ? [id, question] : null;
            })
            .filter(Boolean) as Array<[string, any]>
        ).values()
      );

      const dissimilarCandidates = avoidSimilarQuestions.length > 0
        ? candidates.filter((candidate: any) => !avoidSimilarQuestions.some((previousQuestion) => areQuestionsTooSimilar(candidate, previousQuestion)))
        : candidates;

      const recentTopicKeys = new Set(
        recentQuestions
          .map((question: any) => getQuestionTopicKey(question))
          .filter(Boolean)
      );

      const topicSpacedCandidates = recentTopicKeys.size > 0
        ? dissimilarCandidates.filter((candidate: any) => {
            const topicKey = getQuestionTopicKey(candidate);
            return !topicKey || !recentTopicKeys.has(topicKey);
          })
        : dissimilarCandidates;

      if (topicSpacedCandidates.length > 0) {
        candidates = topicSpacedCandidates;
      } else if (dissimilarCandidates.length > 0) {
        candidates = dissimilarCandidates;
      }

      if (candidates.length > 0) {
        let choice: any;

        // In AP mode, stratify by unit so every unit has equal chance regardless of pool size
        if (body.mode === 'ap') {
          const groupedCandidates: Record<string, any[]> = {};
          for (const q of candidates) {
            const groupKey = difficulty === 'statistics'
              ? (normalizeStatisticsTopic(q?.topic) || 'statistics')
              : ((typeof q.id === 'string' ? q.id.match(/^u(\d+)-/i)?.[1] : null) || 'unknown');
            if (!groupedCandidates[groupKey]) groupedCandidates[groupKey] = [];
            groupedCandidates[groupKey].push(q);
          }
          const groups = Object.keys(groupedCandidates);
          const pickedGroup = groups[Math.floor(Math.random() * groups.length)];
          const pool = groupedCandidates[pickedGroup];
          choice = pool[Math.floor(Math.random() * pool.length)];
        } else {
          choice = candidates[Math.floor(Math.random() * candidates.length)];
        }

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
