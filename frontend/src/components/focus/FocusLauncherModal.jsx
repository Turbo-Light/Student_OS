import React, { useState, useEffect, useContext } from 'react';
import { FocusContext } from '../../context/FocusContext';
import { TaskContext } from '../../context/TaskContext';
import { Target, Clock, X, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';

const FocusLauncherModal = () => {
  const { isLauncherOpen, closeFocusLauncher, launcherParams, startFocusSession, isSubmitting } = useContext(FocusContext);
  const { tasks } = useContext(TaskContext) || { tasks: [] };

  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    taskId: '',
    durationMode: '25', // '25', '50', or 'custom'
    customDuration: 30,
    goal: ''
  });

  // Filter pending active tasks
  const activeTasks = (tasks || []).filter(t => t.status !== 'Completed');

  // Extract unique subjects from existing tasks for quick auto-completion
  const availableSubjects = Array.from(
    new Set(activeTasks.map(t => t.subject).filter(Boolean))
  );

  // Sync form data whenever launcherParams updates
  useEffect(() => {
    if (isLauncherOpen) {
      const initialDuration = launcherParams.plannedDuration || 25;
      let mode = 'custom';
      if (initialDuration === 25) mode = '25';
      else if (initialDuration === 50) mode = '50';

      setFormData({
        subject: launcherParams.subject || 'General Study',
        topic: launcherParams.topic || 'Deep Work',
        taskId: launcherParams.taskId || '',
        durationMode: mode,
        customDuration: mode === 'custom' ? initialDuration : 30,
        goal: launcherParams.goal || ''
      });
    }
  }, [isLauncherOpen, launcherParams]);

  // Handle Linked Task selection
  const handleTaskChange = (e) => {
    const selectedTaskId = e.target.value;
    const matchedTask = activeTasks.find(t => t._id === selectedTaskId);

    if (matchedTask) {
      setFormData(prev => ({
        ...prev,
        taskId: selectedTaskId,
        subject: matchedTask.subject || prev.subject || 'General Study',
        topic: matchedTask.title || prev.topic || 'Deep Work',
        goal: prev.goal || (matchedTask.description ? `Complete task: ${matchedTask.title}` : '')
      }));
    } else {
      setFormData(prev => ({ ...prev, taskId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const plannedDuration = formData.durationMode === 'custom' 
      ? Number(formData.customDuration) || 25
      : Number(formData.durationMode);

    await startFocusSession({
      subject: formData.subject,
      topic: formData.topic,
      taskId: formData.taskId,
      plannedDuration,
      goal: formData.goal
    });
  };

  if (!isLauncherOpen) return null;

  return (
    <div id="focus-launcher-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden relative flex flex-col font-sans text-text-primary"
        role="dialog"
        aria-modal="true"
      >
        {/* Subtle accent top border glow */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan via-violet to-cyan" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center text-cyan">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-text-primary">
                Launch Focus Session
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Configure your deep work parameters and study goals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeFocusLauncher}
            className="text-text-tertiary hover:text-text-primary hover:bg-surface-raised p-1.5 rounded-md transition-colors cursor-pointer"
            title="Close launcher"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-sans">
          
          {/* Linked Task Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-medium text-text-secondary">
                Linked Task <span className="text-text-tertiary font-normal">(Optional)</span>
              </label>
              {formData.taskId && (
                <span className="text-[11px] text-cyan font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Linked
                </span>
              )}
            </div>
            <select
              value={formData.taskId}
              onChange={handleTaskChange}
              className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all cursor-pointer"
            >
              <option value="">None (Ad-hoc Session)</option>
              {activeTasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title} {task.subject ? `[${task.subject}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 2-Column: Subject & Topic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="font-medium text-text-secondary">
                Subject
              </label>
              <input
                type="text"
                id="focus-subject-input"
                list="subject-suggestions"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Computer Systems"
                required
                className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all"
              />
              <datalist id="subject-suggestions">
                {availableSubjects.map((sub, idx) => (
                  <option key={idx} value={sub} />
                ))}
              </datalist>
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <label className="font-medium text-text-secondary">
                Topic / Concept
              </label>
              <input
                type="text"
                id="focus-topic-input"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Distributed Concurrency"
                required
                className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all"
              />
            </div>
          </div>

          {/* Preset Durations (Pomodoro 25m, Deep Focus 50m, Custom) */}
          <div className="space-y-2 pt-1">
            <label className="font-medium text-text-secondary flex items-center justify-between">
              <span>Preset Duration</span>
              <span className="text-[11px] text-text-tertiary">Select work interval</span>
            </label>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Pomodoro 25m */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, durationMode: '25' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  formData.durationMode === '25'
                    ? 'bg-cyan/10 border-cyan/50 text-cyan shadow-sm'
                    : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
              >
                <span className="font-mono font-bold text-sm">25m</span>
                <span className="text-[10px] font-medium mt-0.5">Pomodoro</span>
              </button>

              {/* Deep Focus 50m */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, durationMode: '50' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  formData.durationMode === '50'
                    ? 'bg-cyan/10 border-cyan/50 text-cyan shadow-sm'
                    : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
              >
                <span className="font-mono font-bold text-sm">50m</span>
                <span className="text-[10px] font-medium mt-0.5">Deep Focus</span>
              </button>

              {/* Custom Duration */}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, durationMode: 'custom' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all cursor-pointer ${
                  formData.durationMode === 'custom'
                    ? 'bg-cyan/10 border-cyan/50 text-cyan shadow-sm'
                    : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
              >
                <span className="font-mono font-bold text-sm">{formData.customDuration}m</span>
                <span className="text-[10px] font-medium mt-0.5">Custom</span>
              </button>
            </div>

            {/* Custom duration numeric slider / input */}
            {formData.durationMode === 'custom' && (
              <div className="pt-2 flex items-center gap-3 bg-surface-inset p-2.5 rounded-md border border-border-subtle/80 animate-in fade-in duration-150">
                <Clock className="w-4 h-4 text-cyan shrink-0" />
                <span className="text-xs text-text-secondary whitespace-nowrap">Duration (mins):</span>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={formData.customDuration}
                  onChange={e => setFormData({ ...formData, customDuration: Number(e.target.value) })}
                  className="w-20 bg-surface border border-border-subtle rounded px-2 py-1 text-xs text-text-primary font-mono focus:outline-none focus:border-cyan/50"
                />
                <input
                  type="range"
                  min="5"
                  max="180"
                  step="5"
                  value={formData.customDuration}
                  onChange={e => setFormData({ ...formData, customDuration: Number(e.target.value) })}
                  className="flex-1 accent-cyan cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Session Goal Textarea */}
          <div className="space-y-1.5 pt-1">
            <label className="font-medium text-text-secondary flex items-center justify-between">
              <span>Session Objective / Goal</span>
              <span className="text-[11px] text-text-tertiary">Optional</span>
            </label>
            <textarea
              id="focus-goal-input"
              rows={2}
              value={formData.goal}
              onChange={e => setFormData({ ...formData, goal: e.target.value })}
              placeholder="e.g., Read section 4.2 and write concise notes on distributed deadlock detection."
              className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeFocusLauncher}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-start-focus"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-md bg-cyan text-text-on-accent font-medium hover:brightness-110 transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-text-on-accent border-t-transparent rounded-full animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Target className="w-3.5 h-3.5" />
                  <span>Start Focus</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default FocusLauncherModal;
