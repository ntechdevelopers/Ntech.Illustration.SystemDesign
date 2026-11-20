import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export const searchCourse = (req: Request, res: Response): void => {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    const lang = (req.query.lang as string) || 'vi';

    if (!q) {
      res.json([]);
      return;
    }

    const lessonsDir = path.join(DATA_DIR, 'lessons');
    const files = fs.readdirSync(lessonsDir);
    const results: any[] = [];

    for (const file of files) {
      const lesson = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf8'));
      let dict: Record<string, string> = {};
      if (lang === 'vi') {
        const trPath = path.join(DATA_DIR, 'translations', file);
        if (fs.existsSync(trPath)) {
          dict = JSON.parse(fs.readFileSync(trPath, 'utf8'));
        }
      }

      const title = dict[lesson.title] || lesson.title;
      const summary = dict[lesson.summary] || lesson.summary;

      // Check title or summary match
      if (title.toLowerCase().includes(q) || summary.toLowerCase().includes(q)) {
        results.push({
          lessonId: lesson.id,
          stepIndex: 0,
          title,
          snippet: summary,
          kind: 'lesson'
        });
        continue;
      }

      // Check step titles and bodies
      if (lesson.steps) {
        for (let i = 0; i < lesson.steps.length; i++) {
          const step = lesson.steps[i];
          const stepTitle = dict[step.title] || step.title;
          const bodyArr = Array.isArray(step.body) ? step.body : [step.body];
          const matchedBody = bodyArr.find((b: string) => {
            const trBody = dict[b] || b;
            return trBody && trBody.toLowerCase().includes(q);
          });

          if (stepTitle.toLowerCase().includes(q) || matchedBody) {
            results.push({
              lessonId: lesson.id,
              stepIndex: i,
              title: `${title} → ${stepTitle}`,
              snippet: (dict[matchedBody] || matchedBody || summary).replace(/<[^>]+>/g, ''),
              kind: 'step'
            });
            break;
          }
        }
      }
    }

    res.json(results.slice(0, 15));
  } catch (err: any) {
    res.status(500).json({ error: 'Search failed', message: err.message });
  }
};

