import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCurriculum, fetchLesson } from './api/client';
import type { Module, LessonData } from './api/client';
import { useLanguage } from './context/LanguageContext';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { StageView } from './components/StageView';
import { TimelineBar } from './components/TimelineBar';
import { GuidePanel } from './components/GuidePanel';
import { GoalsPanel } from './components/GoalsPanel';
import { SearchModal } from './components/SearchModal';
import { renderIcon } from './engine/Stage';

const Qh = { w: 1672, h: 920 };
const eg = (w: number, h: number) =>
  w >= 1200 && h >= 560 ? 'desktop' : w >= 960 && h >= 600 ? 'tablet' : 'stack';

export const App: React.FC = () => {
  const { lang, t } = useLanguage();
  const [curriculum, setCurriculum] = useState<Module[]>([]);
  const [currentLessonId, setCurrentLessonId] = useState<string>('request-lifecycle');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('sdt:completed');
      if (stored) return new Set(JSON.parse(stored));
    } catch {}
    return new Set<string>();
  });

  // Responsive Layout Scaling Controller matching original engine
  useEffect(() => {
    const updateLayout = () => {
      const layout = eg(window.innerWidth, window.innerHeight);
      document.documentElement.dataset.layout = layout;
      const winEl = document.querySelector<HTMLElement>('.window');
      if (winEl) {
        if (layout === 'desktop') {
          const zoom = Math.min(1, window.innerWidth / Qh.w, window.innerHeight / Qh.h);
          winEl.style.zoom = String(zoom);
          winEl.style.width = `${window.innerWidth / zoom}px`;
          winEl.style.height = `${window.innerHeight / zoom}px`;
        } else {
          winEl.style.zoom = '';
          winEl.style.width = '';
          winEl.style.height = '';
        }
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // Parse URL hash on load or hashchange
  const parseHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return;
    const parts = hash.split('/');
    if (parts[0] === 'lesson' && parts[1]) {
      setCurrentLessonId(parts[1]);
      if (parts[2]) {
        const step = parseInt(parts[2], 10) - 1;
        if (!isNaN(step) && step >= 0) setCurrentStepIndex(step);
      } else {
        setCurrentStepIndex(0);
      }
    } else if (parts[0]) {
      setCurrentLessonId(parts[0]);
      if (parts[1]) {
        const step = parseInt(parts[1], 10) - 1;
        if (!isNaN(step) && step >= 0) setCurrentStepIndex(step);
      } else {
        setCurrentStepIndex(0);
      }
    }
  }, []);

  useEffect(() => {
    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, [parseHash]);

  // Load curriculum
  useEffect(() => {
    fetchCurriculum(lang).then((data) => {
      setCurriculum(data);
    });
  }, [lang]);

  // Load active lesson
  useEffect(() => {
    fetchLesson(currentLessonId, lang).then((data) => {
      setLessonData(data);
    });
  }, [currentLessonId, lang]);

  // Sync hash when lesson or step changes
  const updateHash = (lessonId: string, stepIdx: number) => {
    window.location.hash = `#/${lessonId}/${stepIdx + 1}`;
  };

  const handleSelectLesson = (id: string) => {
    setCurrentLessonId(id);
    setCurrentStepIndex(0);
    updateHash(id, 0);
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    updateHash(currentLessonId, idx);

    // Mark as completed when reaching last step
    if (lessonData && idx === lessonData.steps.length - 1) {
      setCompletedLessons((prev) => {
        const updated = new Set(prev).add(currentLessonId);
        localStorage.setItem('sdt:completed', JSON.stringify([...updated]));
        return updated;
      });
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          handleSelectStep(currentStepIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (lessonData && currentStepIndex < lessonData.steps.length - 1) {
          handleSelectStep(currentStepIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, lessonData]);

  // Module & Lesson sequence calculations
  const allLessons = useMemo(() => {
    return curriculum.flatMap((m) => m.lessons);
  }, [curriculum]);

  const currentModule = curriculum.find((m) =>
    m.lessons.some((l) => l.id === currentLessonId)
  );

  const lessonIndexInModule = currentModule
    ? currentModule.lessons.findIndex((l) => l.id === currentLessonId) + 1
    : 1;

  const currentGlobalIndex = allLessons.findIndex((l) => l.id === currentLessonId);
  const nextLesson = currentGlobalIndex >= 0 && currentGlobalIndex < allLessons.length - 1
    ? allLessons[currentGlobalIndex + 1]
    : null;

  return (
    <div className="window">
      <Topbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <div className="body">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          curriculum={curriculum}
          currentLessonId={currentLessonId}
          onSelectLesson={handleSelectLesson}
          completedLessons={completedLessons}
        />

        <main className="sheet">
          {/* Lesson Header */}
          {lessonData && (
            <div className="lesson-head" id="head">
              <div className="crumb">
                {currentModule ? `${currentModule.num}. ${currentModule.title}` : ''}
                <span>/</span>
                {t('Lesson {n} of {total}', {
                  n: lessonIndexInModule,
                  total: currentModule?.lessons.length || 1
                })}
              </div>
              <div className="lesson-head__row">
                <h1 className="title">{lessonData.title}</h1>
                <div className="tags">
                  <span className="tag tag--sand">
                    <span dangerouslySetInnerHTML={{ __html: renderIcon('clock', { size: 13, stroke: 2 }) }} />
                    <span>{t('{n} min', { n: lessonData.minutes })}</span>
                  </span>
                  <span className="tag tag--mint">
                    <span dangerouslySetInnerHTML={{ __html: renderIcon('signal', { size: 13, stroke: 2 }) }} />
                    <span>{t(lessonData.level)}</span>
                  </span>
                  <span className="tag tag--violet">
                    <span dangerouslySetInnerHTML={{ __html: renderIcon('listOrdered', { size: 13, stroke: 2 }) }} />
                    <span>{t('{n} steps', { n: lessonData.steps.length })}</span>
                  </span>
                </div>
              </div>
              <p className="subtitle" title={lessonData.summary}>
                {lessonData.summary}
              </p>
            </div>
          )}

          {/* Simulation Stage */}
          {lessonData && (
            <StageView
              lesson={lessonData}
              stepIndex={currentStepIndex}
            />
          )}

          {/* Timeline Controls */}
          {lessonData && (
            <TimelineBar
              steps={lessonData.steps}
              currentStepIndex={currentStepIndex}
              onSelectStep={handleSelectStep}
            />
          )}
        </main>

        <aside className="rail">
          {lessonData && lessonData.steps[currentStepIndex] && (
            <GuidePanel
              step={lessonData.steps[currentStepIndex]}
              currentStepIndex={currentStepIndex}
              totalSteps={lessonData.steps.length}
              nextStepName={lessonData.steps[currentStepIndex + 1]?.short}
              isLastStep={currentStepIndex === lessonData.steps.length - 1}
              hasNextLesson={!!nextLesson}
              nextLessonTitle={nextLesson?.title}
              onPrev={() => handleSelectStep(currentStepIndex - 1)}
              onNext={() => {
                if (currentStepIndex < lessonData.steps.length - 1) {
                  handleSelectStep(currentStepIndex + 1);
                } else if (nextLesson) {
                  handleSelectLesson(nextLesson.id);
                }
              }}
            />
          )}

          {lessonData && (
            <GoalsPanel
              goals={lessonData.goals}
              currentStepIndex={currentStepIndex}
              onJumpToStep={handleSelectStep}
            />
          )}
        </aside>
      </div>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(lessonId, stepIdx) => {
          handleSelectLesson(lessonId);
          handleSelectStep(stepIdx);
        }}
      />
    </div>
  );
};
