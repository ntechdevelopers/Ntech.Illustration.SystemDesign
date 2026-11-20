import type { Request, Response } from 'express';

// In-memory progress store (can be easily connected to MongoDB, PostgreSQL, SQLite, or Redis later)
interface UserProgress {
  completedLessons: string[];
  bookmarks: string[];
  lastVisited?: { lessonId: string; stepIndex: number; updatedAt: number };
}

const progressStore: Record<string, UserProgress> = {
  default: {
    completedLessons: [],
    bookmarks: [],
    lastVisited: undefined
  }
};

export const getProgress = (req: Request, res: Response): void => {
  const userId = (req.query.userId as string) || 'default';
  const progress = progressStore[userId] || { completedLessons: [], bookmarks: [] };
  res.json(progress);
};

export const updateProgress = (req: Request, res: Response): void => {
  const userId = (req.body.userId as string) || 'default';
  const { completedLessons, bookmarks, lastVisited } = req.body;

  if (!progressStore[userId]) {
    progressStore[userId] = { completedLessons: [], bookmarks: [] };
  }

  if (Array.isArray(completedLessons)) {
    progressStore[userId].completedLessons = completedLessons;
  }
  if (Array.isArray(bookmarks)) {
    progressStore[userId].bookmarks = bookmarks;
  }
  if (lastVisited) {
    progressStore[userId].lastVisited = {
      ...lastVisited,
      updatedAt: Date.now()
    };
  }

  res.json({ success: true, progress: progressStore[userId] });
};

