import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusContext } from '../../context/FocusContext';
import { 
  Sparkles, 
  Check, 
  Target, 
  Clock, 
  Pause, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  MinusCircle, 
  XCircle,
  TrendingUp,
  Award
} from 'lucide-react';

const formatSeconds = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
};

const FocusSummaryModal = () => {
  const navigate = useNavigate();
  const {
    isSummaryModalOpen,
    closeSummaryModal,
    activeSession,
    elapsedSeconds,
    pausedSeconds,
    pausesCount,
    sessionNotes,
    submitSessionCompletion,
    summaryResult,
    cancelFocusSession
  } = useContext(FocusContext);

  const [goalAchievement, setGoalAchievement] = useState('achieved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSummaryModalOpen) return null;

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await submitSessionCompletion({
        goalAchievement,
        quickNotes: sessionNotes.map(n => n.text)
      });
    } catch (err) {
      console.error('Error submitting completion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinishAndReturn = () => {
    closeSummaryModal();
    navigate('/');
  };

  return (
    <div 
      id="focus-summary-modal"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-base/85 backdrop-blur-md animate-in fade-in duration-200 font-sans text-text-primary"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Subtle accent top glow */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-amber to-success" />

        {/* ========================================================================= */}
        {/* PHASE 1: GOAL ASSESSMENT SELECTOR                                         */}
        {/* ========================================================================= */}
        {!summaryResult ? (
          <div className="p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                  Focus Session Complete
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Assess your session achievement to calculate Focus Score and claim XP
                </p>
              </div>
            </div>

            {/* Goal Quote Card */}
            {activeSession?.goal && (
              <div className="bg-surface-inset border border-border-subtle/80 rounded-lg p-3.5 text-xs text-text-secondary">
                <span className="font-semibold text-text-primary block mb-1">Target Goal:</span>
                "{activeSession.goal}"
              </div>
            )}

            {/* Selector: Did you achieve your goal? */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary block">
                Did you achieve your goal?
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {/* 1. Achieved */}
                <button
                  type="button"
                  id="goal-opt-achieved"
                  onClick={() => setGoalAchievement('achieved')}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    goalAchievement === 'achieved'
                      ? 'bg-success/15 border-success text-success shadow-sm'
                      : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-semibold text-xs mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ Achieved</span>
                  </div>
                  <span className="text-[10px] opacity-85 block">+30 XP Bonus</span>
                </button>

                {/* 2. Partially */}
                <button
                  type="button"
                  id="goal-opt-partially"
                  onClick={() => setGoalAchievement('partially')}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    goalAchievement === 'partially'
                      ? 'bg-warning/15 border-warning text-warning shadow-sm'
                      : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-semibold text-xs mb-1">
                    <MinusCircle className="w-4 h-4" />
                    <span>○ Partially</span>
                  </div>
                  <span className="text-[10px] opacity-85 block">+15 XP Bonus</span>
                </button>

                {/* 3. Not Achieved */}
                <button
                  type="button"
                  id="goal-opt-not-achieved"
                  onClick={() => setGoalAchievement('not_achieved')}
                  className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                    goalAchievement === 'not_achieved'
                      ? 'bg-danger/15 border-danger text-danger shadow-sm'
                      : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-semibold text-xs mb-1">
                    <XCircle className="w-4 h-4" />
                    <span>✕ Not achieved</span>
                  </div>
                  <span className="text-[10px] opacity-85 block">+0 XP Bonus</span>
                </button>
              </div>
            </div>

            {/* Quick Session Stats Preview */}
            <div className="grid grid-cols-2 gap-3 bg-surface-inset/60 p-3 rounded-lg border border-border-subtle/50 text-xs">
              <div>
                <span className="text-text-tertiary block">Focused Time:</span>
                <span className="font-mono font-semibold text-text-primary">{formatSeconds(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-text-tertiary block">Pauses Taken:</span>
                <span className="font-mono font-semibold text-warning">{pausesCount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
              <button
                type="button"
                onClick={cancelFocusSession}
                className="text-xs text-text-tertiary hover:text-danger transition-colors cursor-pointer"
              >
                Discard Session
              </button>

              <button
                type="button"
                id="btn-submit-goal"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-md bg-cyan text-text-on-accent font-semibold text-xs hover:brightness-110 transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-text-on-accent border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Score...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Complete & View Score</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* PHASE 2: CALCULATED METRICS & SCORE PRESENTATION                          */
          /* ========================================================================= */
          <div className="p-6 sm:p-7 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Header: Focus Score Badge */}
            <div className="flex flex-col items-center justify-center text-center pt-2">
              {/* Circular Score Badge */}
              <div className="relative w-28 h-28 rounded-full bg-surface-inset border-2 border-cyan/40 flex flex-col items-center justify-center shadow-lg shadow-cyan/10">
                <span className="text-3xl font-mono font-extrabold text-cyan tracking-tight" id="summary-focus-score">
                  {summaryResult.focusScore}%
                </span>
                <span className="text-[10px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
                  Focus Score
                </span>
              </div>

              <h2 className="text-lg font-bold text-text-primary mt-3">
                {summaryResult.focusScore >= 80 ? 'Exceptional Deep Work!' : summaryResult.focusScore >= 50 ? 'Solid Focus Session' : 'Session Completed'}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Session telemetry logged to your historical analytics
              </p>
            </div>

            {/* Total Earned XP Breakdown Card */}
            <div className="bg-amber-dim border border-amber/30 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-amber/20 pb-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber fill-amber/20" />
                  <span className="font-semibold text-xs text-amber uppercase tracking-wider">
                    Total XP Earned
                  </span>
                </div>
                <span className="font-mono font-bold text-base text-amber" id="summary-total-xp">
                  +{summaryResult.xpEarned} XP
                </span>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-text-secondary">
                  <span>Base Focus Time XP:</span>
                  <span className="font-mono font-semibold text-text-primary">
                    +{summaryResult.breakdown?.baseXP ?? Math.round(summaryResult.session?.actualFocusedTime / 30)} XP
                  </span>
                </div>

                <div className="flex items-center justify-between text-text-secondary">
                  <span>Goal Achievement Bonus:</span>
                  <span className="font-mono font-semibold text-success">
                    +{summaryResult.breakdown?.goalBonusXP ?? (summaryResult.session?.goalAchievement === 'achieved' ? 30 : 15)} XP
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Calculated Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Focused Time */}
              <div className="bg-surface-inset border border-border-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-text-tertiary uppercase">Focused Time</p>
                <p className="font-mono font-bold text-xs text-text-primary mt-1" id="summary-focused-time">
                  {formatSeconds(summaryResult.breakdown?.actualFocusedTime || summaryResult.session?.actualFocusedTime || 0)}
                </p>
              </div>

              {/* Paused Time */}
              <div className="bg-surface-inset border border-border-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-text-tertiary uppercase">Paused Time</p>
                <p className="font-mono font-bold text-xs text-text-secondary mt-1" id="summary-paused-time">
                  {formatSeconds(summaryResult.breakdown?.pausedTime || summaryResult.session?.pausedTime || 0)}
                </p>
              </div>

              {/* Pauses Count */}
              <div className="bg-surface-inset border border-border-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-text-tertiary uppercase">Pauses</p>
                <p className="font-mono font-bold text-xs text-warning mt-1" id="summary-pauses-count">
                  {summaryResult.breakdown?.pausesCount ?? summaryResult.session?.pausesCount ?? 0}
                </p>
              </div>

              {/* Completion % */}
              <div className="bg-surface-inset border border-border-subtle rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-text-tertiary uppercase">Completion</p>
                <p className="font-mono font-bold text-xs text-cyan mt-1" id="summary-completion-pct">
                  {summaryResult.breakdown?.completionPercentage ?? 100}%
                </p>
              </div>
            </div>

            {/* Return Action */}
            <div className="pt-2">
              <button
                type="button"
                id="btn-return-dashboard"
                onClick={handleFinishAndReturn}
                className="w-full py-2.5 rounded-lg bg-cyan text-text-on-accent font-semibold text-xs hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusSummaryModal;
