import React from 'react';
import type { LessonGoal } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { renderIcon } from '../engine/Stage';

interface GoalsPanelProps {
  goals: LessonGoal[];
  currentStepIndex: number;
  onJumpToStep: (step: number) => void;
}

export const GoalsPanel: React.FC<GoalsPanelProps> = ({ goals, currentStepIndex, onJumpToStep }) => {
  const { t } = useLanguage();

  if (!goals || goals.length === 0) return null;

  return (
    <section className="card goals" id="goals">
      <div className="eyebrow">{t('You’ll learn')}</div>
      <ul>
        {goals.map((goal, idx) => {
          const isHit = currentStepIndex >= goal.step;
          return (
            <li
              key={idx}
              className={isHit ? 'is-hit' : ''}
              onClick={() => onJumpToStep(goal.step)}
              style={{ cursor: 'pointer' }}
            >
              <span className={`check ${isHit ? 'is-on' : ''}`}>
                <span dangerouslySetInnerHTML={{ __html: renderIcon('check', { size: 11, stroke: 3 }) }} />
              </span>
              <span dangerouslySetInnerHTML={{ __html: goal.text }} />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
