import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export const getAllLessons = (req: Request, res: Response): void => {
  try {
    const lang = (req.query.lang as string) || 'vi';
    const lessonsDir = path.join(DATA_DIR, 'lessons');
    if (!fs.existsSync(lessonsDir)) {
      res.status(404).json({ error: 'Lessons directory not found' });
      return;
    }

    const files = fs.readdirSync(lessonsDir);
    const list = files.map((file) => {
      const lesson = JSON.parse(fs.readFileSync(path.join(lessonsDir, file), 'utf8'));
      let title = lesson.title;
      let summary = lesson.summary;

      if (lang === 'vi') {
        const trPath = path.join(DATA_DIR, 'translations', file);
        if (fs.existsSync(trPath)) {
          const dict = JSON.parse(fs.readFileSync(trPath, 'utf8'));
          title = dict[title] || title;
          summary = dict[summary] || summary;
        }
      }

      return {
        id: lesson.id,
        title,
        summary,
        minutes: lesson.minutes,
        level: lesson.level,
        stepsCount: lesson.steps ? lesson.steps.length : 0,
        goalsCount: lesson.goals ? lesson.goals.length : 0
      };
    });

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to list lessons', message: err.message });
  }
};

export const getLessonById = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const lang = (req.query.lang as string) || 'vi';

    const lessonPath = path.join(DATA_DIR, 'lessons', `${id}.json`);
    if (!fs.existsSync(lessonPath)) {
      res.status(404).json({ error: `Lesson not found: ${id}` });
      return;
    }

    const lesson = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));

    if (lang === 'vi') {
      const trPath = path.join(DATA_DIR, 'translations', `${id}.json`);
      if (fs.existsSync(trPath)) {
        const dict = JSON.parse(fs.readFileSync(trPath, 'utf8'));
        const translate = (text: string): string => {
          if (!text) return text;
          return dict[text] || text;
        };

        const translatedLesson = {
          ...lesson,
          title: translate(lesson.title),
          summary: translate(lesson.summary),
          goals: (lesson.goals || []).map((g: any) => ({
            ...g,
            text: translate(g.text)
          })),
          steps: (lesson.steps || []).map((st: any) => ({
            ...st,
            short: translate(st.short),
            chapter: translate(st.chapter),
            title: translate(st.title),
            body: Array.isArray(st.body) ? st.body.map((b: string) => translate(b)) : st.body,
            changes: Array.isArray(st.changes) ? st.changes.map((c: string) => translate(c)) : st.changes,
            callout: st.callout ? { ...st.callout, text: translate(st.callout.text) } : st.callout
          })),
          translationDict: dict
        };
        res.json(translatedLesson);
        return;
      }
    }

    res.json(lesson);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get lesson', message: err.message });
  }
};

