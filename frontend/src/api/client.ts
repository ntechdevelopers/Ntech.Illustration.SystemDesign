// API Client with automatic fallback to static files

export interface Module {
  id: string;
  num: string;
  title: string;
  color: string;
  lessons: Array<{
    id: string;
    title: string;
    ready?: boolean;
  }>;
}

export interface LessonGoal {
  text: string;
  step: number;
}

export interface LessonStep {
  short: string;
  chapter: string;
  title: string;
  body: string[];
  changes?: string[];
  metrics?: Record<string, any>;
  callout?: { kind: string; text: string };
  scene: {
    entities: Record<string, any>;
    links?: Record<string, any>;
    flows?: any[];
  };
}

export interface LessonData {
  id: string;
  title: string;
  summary: string;
  minutes: number;
  level: string;
  metrics?: string[];
  legend?: any[];
  goals: LessonGoal[];
  steps: LessonStep[];
  translationDict?: Record<string, string>;
}

export async function fetchCurriculum(lang = 'vi'): Promise<Module[]> {
  try {
    const res = await fetch(`/api/curriculum?lang=${lang}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Backend offline, fallback to static file
  }

  const staticRes = await fetch('/data/curriculum.json');
  const curriculum: Module[] = await staticRes.json();

  if (lang === 'vi') {
    try {
      const uiRes = await fetch('/data/i18n/vi.json');
      const uiDict = await uiRes.json();
      return curriculum.map((mod) => ({
        ...mod,
        title: uiDict[mod.title] || mod.title,
        lessons: mod.lessons.map((l) => ({
          ...l,
          title: uiDict[l.title] || l.title
        }))
      }));
    } catch {}
  }
  return curriculum;
}

export async function fetchLesson(id: string, lang = 'vi'): Promise<LessonData> {
  try {
    const res = await fetch(`/api/lessons/${id}?lang=${lang}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Backend offline, fallback to static files
  }

  const lessonRes = await fetch(`/data/lessons/${id}.json`);
  const lesson: LessonData = await lessonRes.json();

  if (lang === 'vi') {
    try {
      const trRes = await fetch(`/data/translations/${id}.json`);
      if (trRes.ok) {
        const dict = await trRes.json();
        const tr = (str: string) => dict[str] || str;
        return {
          ...lesson,
          title: tr(lesson.title),
          summary: tr(lesson.summary),
          goals: (lesson.goals || []).map((g) => ({ ...g, text: tr(g.text) })),
          steps: (lesson.steps || []).map((st) => ({
            ...st,
            short: tr(st.short),
            chapter: tr(st.chapter),
            title: tr(st.title),
            body: Array.isArray(st.body) ? st.body.map((b) => tr(b)) : st.body,
            changes: Array.isArray(st.changes) ? st.changes.map((c) => tr(c)) : st.changes,
            callout: st.callout ? { ...st.callout, text: tr(st.callout.text) } : st.callout
          })),
          translationDict: dict
        };
      }
    } catch {}
  }

  return lesson;
}

export async function fetchI18n(lang = 'vi'): Promise<Record<string, string>> {
  try {
    const res = await fetch(`/api/i18n/${lang}`);
    if (res.ok) return await res.json();
  } catch (e) {}

  try {
    const staticRes = await fetch(`/data/i18n/${lang}.json`);
    if (staticRes.ok) return await staticRes.json();
  } catch {}

  return {};
}

export async function searchCourse(q: string, lang = 'vi'): Promise<any[]> {
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&lang=${lang}`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return [];
}

