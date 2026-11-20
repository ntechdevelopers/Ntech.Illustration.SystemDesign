import React, { useState, useEffect } from 'react';
import type { Module } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { renderIcon } from '../engine/Stage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Module[];
  currentLessonId: string;
  onSelectLesson: (id: string) => void;
  completedLessons: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  curriculum,
  currentLessonId,
  onSelectLesson,
  completedLessons
}) => {
  const { t, lang, setLang } = useLanguage();
  const totalLessons = curriculum.reduce((acc, m) => acc + m.lessons.length, 0);

  // Set of opened module IDs (accordion)
  const [openMods, setOpenMods] = useState<Set<string>>(new Set());
  const [progressOpen, setProgressOpen] = useState(false);

  // Automatically open the module containing the current active lesson
  useEffect(() => {
    if (!currentLessonId || curriculum.length === 0) return;
    const currentMod = curriculum.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId)
    );
    if (currentMod) {
      setOpenMods((prev) => new Set(prev).add(currentMod.id));
    }
  }, [currentLessonId, curriculum]);

  const toggleMod = (modId: string) => {
    setOpenMods((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
      }
      return next;
    });
  };

  const folderSvg = (color: string) => `
    <svg class="folder folder--${color}" width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <path d="M1.2 3.2A2 2 0 0 1 3.2 1.2h4.1l2 2.2h7.5a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H3.2a2 2 0 0 1-2-2Z"/>
      <path class="folder__lip" d="M1.2 6.2h17.6"/>
    </svg>
  `;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`} id="sidebar" aria-label={t('Course')}>
        <nav className="drawer-nav">
          <button className="nav__item btn-pop is-active" type="button" data-nav="Course">
            <span dangerouslySetInnerHTML={{ __html: renderIcon('book', { size: 16 }) }} />
            <span>{t('Course')}</span>
          </button>
        </nav>

        <div className="tree-root">
          <svg width="22" height="18" viewBox="0 0 20 16" aria-hidden="true">
            <path d="M1 3a2 2 0 0 1 2-2h4.3l2 2.2H17a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2Z" fill="currentColor" />
          </svg>
          <span>{t('Course')}</span>
          <span className="tree-root__meta">{t('{n} lessons', { n: totalLessons })}</span>
          <button
            className="drawer-close"
            id="drawer-close"
            type="button"
            aria-label={t('Close the course menu')}
            onClick={onClose}
            dangerouslySetInnerHTML={{ __html: renderIcon('close', { size: 18, stroke: 2.2 }) }}
          />
        </div>

        <nav className="course" id="course">
          {curriculum.map((mod) => {
            const isModOpen = openMods.has(mod.id);
            const modDoneCount = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
            return (
              <section className={`mod ${isModOpen ? 'is-open' : ''}`} data-mod={mod.id} key={mod.id}>
                <button
                  className="mod__head"
                  data-mod={mod.id}
                  type="button"
                  aria-expanded={isModOpen}
                  onClick={() => toggleMod(mod.id)}
                >
                  <span
                    className="mod__chev"
                    dangerouslySetInnerHTML={{ __html: renderIcon('chevronRight', { size: 15, stroke: 2.2 }) }}
                  />
                  <span dangerouslySetInnerHTML={{ __html: folderSvg(mod.color) }} />
                  <span className="mod__title" title={`${mod.num}. ${mod.title}`}>
                    {mod.num}. {mod.title}
                  </span>
                  <span className="mod__count">{modDoneCount}/{mod.lessons.length}</span>
                </button>

                <div className="mod__body">
                  <div className="mod__clip">
                    <ul className="mod__lessons">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.id === currentLessonId;
                        const isDone = completedLessons.has(lesson.id);
                        return (
                          <li
                            key={lesson.id}
                            className={`lesson ${isCurrent ? 'is-current' : ''}`}
                            data-lesson={lesson.id}
                            data-done={String(isDone)}
                          >
                            <a
                              href={`#/${lesson.id}/1`}
                              className={isCurrent ? 'btn-pop' : ''}
                              onClick={(e) => {
                                e.preventDefault();
                                onSelectLesson(lesson.id);
                                if (window.innerWidth < 1200) {
                                  onClose();
                                }
                              }}
                            >
                              <span className="lesson__markbox">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: isDone
                                      ? renderIcon('circleCheck', { size: 16, stroke: 2, cls: 'lesson__mark lesson__mark--done' })
                                      : renderIcon('file', { size: 15, stroke: 1.5, cls: 'lesson__mark' })
                                  }}
                                />
                              </span>
                              <span className="lesson__title" title={lesson.title}>
                                {lesson.title}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </nav>

        {/* Progress accordion */}
        <section className={`card progress ${progressOpen ? 'is-open' : ''}`} id="progress">
          <button
            className="progress__head"
            type="button"
            aria-expanded={progressOpen}
            onClick={() => setProgressOpen(!progressOpen)}
          >
            <span className="eyebrow">{t('Progress')}</span>
            <span className="progress__pct">{completedLessons.size} / {totalLessons}</span>
            <span
              className="progress__chev"
              dangerouslySetInnerHTML={{ __html: renderIcon('chevronRight', { size: 14, stroke: 2.2 }) }}
            />
          </button>
          <div className="progress__body" id="progress-body">
            <div className="progress__clip">
              <div className="bar">
                <span
                  style={{
                    width: `${Math.max(totalLessons ? (completedLessons.size / totalLessons) * 100 : 2, 2)}%`
                  }}
                />
              </div>
              <ul className="progress__list">
                {curriculum.map((m) => {
                  const mDoneCount = m.lessons.filter((l) => completedLessons.has(l.id)).length;
                  const isAllDone = mDoneCount === m.lessons.length;
                  return (
                    <li data-mod={m.id} key={m.id}>
                      <span className={`check ${isAllDone ? 'is-on' : ''}`}>
                        <span dangerouslySetInnerHTML={{ __html: renderIcon('check', { size: 11, stroke: 3 }) }} />
                      </span>
                      <span className="progress__label">{m.title}</span>
                      <span className="progress__count">{mDoneCount}/{m.lessons.length}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <div className="drawer-foot">
          <button
            className="lang__btn"
            id="lang-btn-2"
            type="button"
            onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
          >
            <span dangerouslySetInnerHTML={{ __html: renderIcon('globe', { size: 16, stroke: 2 }) }} />
            <span className="lang__code">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="drawer-backdrop is-visible"
          id="drawer-backdrop"
          onClick={onClose}
        />
      )}
    </>
  );
};
