import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Static JSON file fallback (direct access e.g. /static/lessons/caching.json)
app.use('/static', express.static(DATA_DIR));

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[Backend] System Design API running at http://localhost:${PORT}`);
  console.log(`[Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[Backend] Curriculum: http://localhost:${PORT}/api/curriculum?lang=vi`);
});
