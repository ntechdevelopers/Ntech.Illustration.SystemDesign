import { Router } from 'express';
import { getCurriculum } from '../controllers/curriculum.controller.ts';
import { getAllLessons, getLessonById } from '../controllers/lessons.controller.ts';
import { getI18n } from '../controllers/i18n.controller.ts';
import { searchCourse } from '../controllers/search.controller.ts';
import { getProgress, updateProgress } from '../controllers/progress.controller.ts';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Ntech.Illustration.SystemDesign Backend', timestamp: Date.now() });
});

// Curriculum & metadata
router.get('/curriculum', getCurriculum);

// Lessons
router.get('/lessons', getAllLessons);
router.get('/lessons/:id', getLessonById);

// Localization
router.get('/i18n/:lang', getI18n);

// Search
router.get('/search', searchCourse);

// User progress
router.get('/progress', getProgress);
router.post('/progress', updateProgress);

export default router;
