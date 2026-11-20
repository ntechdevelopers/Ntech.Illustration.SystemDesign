import React from 'react';
import type { LessonStep } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { CHAPTER_TONES } from '../engine/metrics';

interface TimelineBarProps {
  steps: LessonStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  steps,
  currentStepIndex,
  onSelectStep
}) => {
  const { t } = useLanguage();

  if (!steps || steps.length === 0) return null;

  const pct = steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <section className="card timeline" id="timeline">
      <div className="timeline__head">
        <span className="eyebrow">{t('In this lesson')}</span>
        <span className="timeline__count" id="tl-count">
          {t('Step {n} of {total}', { n: currentStepIndex + 1, total: steps.length })}
        </span>
      </div>

      <div
        className="timeline__track"
        style={{ '--n': steps.length } as React.CSSProperties}
      >
        <div className="timeline__rail">
          <span id="tl-fill" style={{ width: `${pct}%` }} />
        </div>

        <ol className="timeline__steps">
          {steps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isDone = idx < currentStepIndex;
            const tone = CHAPTER_TONES[step.chapter]?.tone || 'amber';
            return (
              <li
                key={idx}
                className={`${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
              >
                <button
                  type="button"
                  data-step={idx}
                  title={step.title}
                  onClick={() => onSelectStep(idx)}
                >
                  <span className={`timeline__dot chapter-dot--${tone}`}>
                    {idx + 1}
                  </span>
                  <span className="timeline__label">{step.short}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
