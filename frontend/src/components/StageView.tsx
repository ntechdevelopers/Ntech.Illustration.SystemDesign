import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { LessonData, LessonStep } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Stage, renderIcon, setStageTranslation } from '../engine/Stage';
import type { StageInstance } from '../engine/Stage.d.ts';
import { METRIC_DEFS } from '../engine/metrics';

interface StageViewProps {
  lesson: LessonData;
  stepIndex: number;
}

export const StageView: React.FC<StageViewProps> = ({ lesson, stepIndex }) => {
  const { lang, dict, t } = useLanguage();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<StageInstance | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const currentStageLessonId = useRef<string | null>(null);
  const currentStageLang = useRef<string | null>(null);

  const currentStep = lesson.steps[stepIndex] || lesson.steps[0];

  // Mount Stage instance
  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.innerHTML = '';
    const stage = new Stage(canvasRef.current);
    stageRef.current = stage;
    currentStageLessonId.current = null;

    stage.onView = (zoomed: boolean) => {
      setIsZoomed(zoomed);
    };

    return () => {
      stage.destroy();
      stageRef.current = null;
      currentStageLessonId.current = null;
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, []);

  // Retheme stage when theme changes
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.retheme();
    }
  }, [theme]);

  // Load / update scene
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !lesson || !lesson.steps || !lesson.steps[stepIndex]) return;

    if (lang === 'vi' && lesson.translationDict) {
      setStageTranslation('vi', { ...dict, ...lesson.translationDict });
    } else {
      setStageTranslation(lang, dict);
    }

    const isNewLesson = currentStageLessonId.current !== lesson.id;
    const isNewLang = currentStageLang.current !== lang;
    currentStageLessonId.current = lesson.id;
    currentStageLang.current = lang;

    if (isNewLesson || isNewLang) {
      stage.clear();
      stage.frame(lesson.steps.map((s: LessonStep) => s.scene));
      stage.goTo(currentStep.scene, { instant: true });
      // Ensure camera fit occurs after layout calculation
      requestAnimationFrame(() => {
        stage.refit();
      });
    } else {
      stage.goTo(currentStep.scene);
    }
  }, [lesson, stepIndex, currentStep, lang, dict]);

  const handleReplay = () => {
    if (!stageRef.current || !currentStep) return;
    stageRef.current.clear();
    stageRef.current.goTo(currentStep.scene);
  };

  const handleTogglePause = () => {
    if (!stageRef.current) return;
    stageRef.current.paused = !stageRef.current.paused;
    setIsPaused(stageRef.current.paused);
  };

  const handleFit = () => {
    if (!stageRef.current) return;
    stageRef.current.fit();
  };

  const handleToggleFullscreen = () => {
    const stageEl = canvasRef.current?.closest('.stage');
    if (!stageEl) return;
    if (!document.fullscreenElement) {
      stageEl.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Metric HUD items
  const hudItems = useMemo(() => {
    if (!lesson.metrics || lesson.metrics.length === 0) return [];
    return lesson.metrics.map((k) => {
      const def = METRIC_DEFS[k] || { label: k, icon: 'activity' };
      const rawVal = currentStep?.metrics?.[k];
      let displayVal = '—';
      if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
        displayVal = def.fmt ? def.fmt(rawVal) : String(rawVal);
      }
      const level = def.level ? def.level(rawVal) : 'none';
      return {
        key: k,
        label: t(def.label),
        icon: def.icon,
        value: displayVal,
        level
      };
    });
  }, [lesson.metrics, currentStep, t]);

  // Legend items mapping
  const legendItems = useMemo(() => {
    if (!lesson.legend || lesson.legend.length === 0) return [];
    return lesson.legend.map((item, idx) => {
      const isPair = Array.isArray(item);
      const kind = isPair ? item[0] : item;
      const label = isPair ? item[1] : item;
      return { kind, label: t(label), idx };
    });
  }, [lesson.legend, t]);

  return (
    <section className="card stage">
      {/* Top HUD Chips */}
      {hudItems.length > 0 && (
        <div className="stage__hud" id="hud">
          {hudItems.map((item) => (
            <div className="chip" key={item.key} data-k={item.key} data-level={item.level}>
              <span className="chip__label">
                <span dangerouslySetInnerHTML={{ __html: renderIcon(item.icon, { size: 12, stroke: 2 }) }} />
                <span>{item.label}</span>
              </span>
              <span className="chip__value">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stage Tools Controls */}
      <div className="stage__tools">
        {isZoomed && (
          <button
            className="tool tool--fit"
            id="fit"
            type="button"
            title={t('Back to the whole diagram (0)')}
            onClick={handleFit}
          >
            <span dangerouslySetInnerHTML={{ __html: renderIcon('zoomOut', { size: 15, stroke: 2 }) }} />
            <span>{t('Fit')}</span>
          </button>
        )}

        <button
          className="tool"
          id="replay"
          type="button"
          title={t('Replay this step (R)')}
          onClick={handleReplay}
        >
          <span dangerouslySetInnerHTML={{ __html: renderIcon('replay', { size: 15, stroke: 2 }) }} />
          <span>{t('Replay')}</span>
        </button>

        <button
          className="tool"
          id="pause"
          type="button"
          title={t('Pause traffic (Space)')}
          onClick={handleTogglePause}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: isPaused
                ? renderIcon('play', { size: 15, stroke: 2 })
                : renderIcon('pause', { size: 15, stroke: 2 })
            }}
          />
          <span>{isPaused ? t('Resume') : t('Pause')}</span>
        </button>

        <button
          className="tool tool--expand"
          id="expand"
          type="button"
          title={t('Full screen')}
          aria-label={t('Show the diagram full screen')}
          onClick={handleToggleFullscreen}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: isFullscreen
                ? renderIcon('collapse', { size: 15, stroke: 2 })
                : renderIcon('expand', { size: 15, stroke: 2 })
            }}
          />
        </button>
      </div>

      {/* SVG Canvas */}
      <div className="stage__canvas" id="canvas" ref={canvasRef} />

      {/* Legend */}
      {legendItems.length > 0 && (
        <div className="stage__legend" id="legend">
          {legendItems.map((item) => (
            <span key={item.idx}>
              <i className={`lg lg--${item.kind}`} />
              <span>{item.label}</span>
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
