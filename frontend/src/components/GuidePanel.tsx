import React from 'react';
import type { LessonStep } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { CHAPTER_TONES } from '../engine/metrics';
import { renderIcon } from '../engine/Stage';

interface GuidePanelProps {
  step: LessonStep;
  currentStepIndex: number;
  totalSteps: number;
  nextStepName?: string;
  isLastStep: boolean;
  hasNextLesson: boolean;
  nextLessonTitle?: string;
  onPrev: () => void;
  onNext: () => void;
}

const CALLOUT_CONFIG: Record<string, { icon: string; title: string }> = {
  warn: { icon: 'alert', title: 'Watch out' },
  tip: { icon: 'bulb', title: 'Good to know' },
  insight: { icon: 'sparkles', title: 'Key idea' },
  next: { icon: 'arrowRight', title: 'Coming up' }
};

export const GuidePanel: React.FC<GuidePanelProps> = ({
  step,
  currentStepIndex,
  totalSteps,
  nextStepName,
  isLastStep,
  hasNextLesson,
  nextLessonTitle,
  onPrev,
  onNext
}) => {
  const { t } = useLanguage();

  if (!step) return null;

  const chapterInfo = CHAPTER_TONES[step.chapter] || { tone: 'amber', label: step.chapter || 'PROBLEM' };

  // Determine next button label
  let nextLabel = '';
  if (!isLastStep) {
    nextLabel = t('Next: {title}', { title: nextStepName || '' });
  } else if (hasNextLesson) {
    nextLabel = t('Next: {title}', { title: nextLessonTitle || '' });
  } else {
    nextLabel = t('Finish lesson');
  }

  const calloutInfo = step.callout
    ? CALLOUT_CONFIG[step.callout.kind] || { icon: 'sparkles', title: 'Key idea' }
    : null;

  return (
    <section className="card guide" id="guide">
      <div className="guide__meta">
        <span className="eyebrow">
          {t('Step {n} / {total}', { n: currentStepIndex + 1, total: totalSteps })}
        </span>
        <div className="guide__meta-end">
          <span className={`chapter chapter--${chapterInfo.tone}`}>
            {t(chapterInfo.label)}
          </span>
        </div>
      </div>

      <div className="guide__content">
        <h2 className="guide__title">{step.title}</h2>
        <div className="guide__body">
          {Array.isArray(step.body) ? (
            step.body.map((para, idx) => (
              <p key={idx} dangerouslySetInnerHTML={{ __html: para }} />
            ))
          ) : (
            <p dangerouslySetInnerHTML={{ __html: step.body }} />
          )}
        </div>

        {/* Callout box */}
        {step.callout && calloutInfo && (
          <div className={`callout callout--${step.callout.kind}`}>
            <div
              className="callout__icon"
              dangerouslySetInnerHTML={{
                __html: renderIcon(calloutInfo.icon, { size: 16, stroke: 2 })
              }}
            />
            <div>
              <div className="callout__title">{t(calloutInfo.title)}</div>
              <p dangerouslySetInnerHTML={{ __html: step.callout.text }} />
            </div>
          </div>
        )}

        {/* Changes diff list */}
        {step.changes && step.changes.length > 0 && (
          <div className="changes">
            <div className="eyebrow">{t('What changed')}</div>
            <ul>
              {step.changes.map((change, idx) => {
                const prefix = change.charAt(0);
                const isAdd = prefix === '+';
                const isDel = prefix === '-' || prefix === '−';
                const typeClass = isAdd ? 'chg--add' : isDel ? 'chg--del' : 'chg--mod';
                const symbol = isAdd ? '+' : isDel ? '−' : '~';
                const rest = change.replace(/^[+~−-]\s*/, '');
                return (
                  <li key={idx} className={`chg ${typeClass}`}>
                    <b>{symbol}</b>
                    <span dangerouslySetInnerHTML={{ __html: rest }} />
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation buttons: Quay lại & Tiếp: ... */}
      <div className="guide__nav">
        <button
          className="btn-ghost"
          id="back"
          type="button"
          disabled={currentStepIndex === 0}
          onClick={onPrev}
        >
          <span
            dangerouslySetInnerHTML={{ __html: renderIcon('arrowLeft', { size: 15, stroke: 2.2 }) }}
          />
          <span>{t('Back')}</span>
        </button>

        <button
          className={`btn-pop btn-next ${nextLabel.length > 21 ? 'is-long' : ''}`}
          id="next"
          type="button"
          onClick={onNext}
        >
          <span className="btn-next__label">{nextLabel}</span>
          <span
            dangerouslySetInnerHTML={{
              __html: isLastStep && !hasNextLesson
                ? renderIcon('check', { size: 15, stroke: 2.2 })
                : renderIcon('arrowRight', { size: 15, stroke: 2.2 })
            }}
          />
        </button>
      </div>

      <div className="guide__hint">
        <span dangerouslySetInnerHTML={{ __html: renderIcon('keyboard', { size: 14, stroke: 1.8 }) }} />
        <span>
          <kbd>←</kbd> <kbd>→</kbd> {t('step')} · <kbd>R</kbd> {t('replay')} · <kbd>Space</kbd> {t('pause')}
        </span>
      </div>
    </section>
  );
};
