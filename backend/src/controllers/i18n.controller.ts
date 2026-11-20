import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

export const getI18n = (req: Request, res: Response): void => {
  try {
    const lang = req.params.lang || 'vi';
    const filePath = path.join(DATA_DIR, 'i18n', `${lang}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      res.json(data);
    } else {
      // Fallback to English
      const fallbackPath = path.join(DATA_DIR, 'i18n/en.json');
      const data = fs.existsSync(fallbackPath) ? JSON.parse(fs.readFileSync(fallbackPath, 'utf8')) : {};
      res.json(data);
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to read i18n data', message: err.message });
  }
};

