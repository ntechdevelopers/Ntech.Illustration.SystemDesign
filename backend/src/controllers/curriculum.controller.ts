import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export const getCurriculum = (req: Request, res: Response): void => {
  try {
    const lang = (req.query.lang as string) || 'vi';
    const curriculumPath = path.join(DATA_DIR, 'curriculum.json');
    if (!fs.existsSync(curriculumPath)) {
      res.status(404).json({ error: 'Curriculum data not found' });
      return;
    }

    const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

    if (lang === 'vi') {
      const uiDictPath = path.join(DATA_DIR, 'i18n/vi.json');
      const uiDict = fs.existsSync(uiDictPath) ? JSON.parse(fs.readFileSync(uiDictPath, 'utf8')) : {};

      const translated = curriculum.map((mod: any) => ({
        ...mod,
        title: uiDict[mod.title] || mod.title,
        lessons: mod.lessons.map((lesson: any) => {
          let translatedTitle = lesson.title;
          const trPath = path.join(DATA_DIR, 'translations', `${lesson.id}.json`);
          if (fs.existsSync(trPath)) {
            const trDict = JSON.parse(fs.readFileSync(trPath, 'utf8'));
            translatedTitle = trDict[lesson.title] || uiDict[lesson.title] || lesson.title;
          }
          return {
            ...lesson,
            title: translatedTitle
          };
        })
      }));
      res.json(translated);
      return;
    }

    res.json(curriculum);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read curriculum', message: err.message });
  }
};

