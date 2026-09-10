import React, { useState, useContext } from 'react';
import { FocusContext } from '../../context/FocusContext';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Maximize2, 
  Minimize2, 
  FileText, 
  X, 
  Sparkles, 
  Target, 
  Coffee, 
  Clock, 
  Plus, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

const formatMMSS = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const FocusWorkspace = () => {
  const {
    activeSession,
    remainingSeconds,
    elapsedSeconds,
    pausedSeconds,
    pausesCount,
    isPaused,
    sessionMode,
    setIsOverlayOpen,
    togglePause,
    restartFocusSession,
    endFocusSession,
    cancelFocusSession,
    openSummaryModal,
    sessionNotes,
    addSessionNote,
    removeSessionNote,
    isFullscreen,
    toggleFullscreen
  } = useContext(FocusContext);

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [noteInput, setNoteInput] = useState('');

  if (!activeSession) return null;

  const totalPlannedSecs = (activeSession.plannedDuration || 25) * 60;
  const progressPercent = sessionMode === 'focus'
    ? Math.min(Math.max(100 - (remainingSeconds / totalPlannedSecs) * 100, 0), 100)
    : Math.min(Math.max(100 - (remainingSeconds / (5 * 60)) * 100, 0), 100);

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (noteInput.trim()) {
      addSessionNote(noteInput.trim());
      setNoteInput('');
    }
  };

  return (
    <div 
      id="focus-workspace"
      className="fixed inset-0 z-[100] bg-base text-text-primary flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden font-sans"
    >
      {/* Background ambient lighting */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] blur-[150px] rounded-full pointer-events-none transition-colors duration-1000 ${
        sessionMode === 'break' ? 'bg-amber/10' : 'bg-cyan/10'
      }`} />

      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between pb-4 border-b border-border-subtle/70">
        {/* Left: Exit Focus Mode (Minimizes to HUD) */}
        <button
          onClick={() => setIsOverlayOpen(false)}
          id="exit-focus-btn"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-surface border border-border-subtle hover:border-border-strong text-xs font-medium text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm"
          title="Minimize to floating HUD"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Focus</span>
        </button>

        {/* Center: Subject & Topic Breadcrumb */}
        <div className="flex items-center gap-2 max-w-md truncate px-2">
          <span className={`h-2 w-2 rounded-full shrink-0 ${sessionMode === 'break' ? 'bg-amber' : 'bg-cyan'}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary truncate">
            {activeSession.subject || 'General Focus'}
          </span>
          <span className="text-text-tertiary">•</span>
          <span className="text-xs font-medium text-text-primary truncate">
            {activeSession.topic || 'Deep Work'}
          </span>
        </div>

        {/* Right: Quick Notes Drawer Toggle & Native Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Quick Notes Toggle */}
          <button
            onClick={() => setIsNotesOpen(prev => !prev)}
            id="toggle-notes-btn"
            className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-all cursor-pointer shadow-sm ${
              isNotesOpen 
                ? 'bg-cyan/15 border-cyan/40 text-cyan' 
                : 'bg-surface border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary'
            }`}
            title="Toggle Quick Notes Drawer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Notes</span>
            {sessionNotes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan text-text-on-accent text-[10px] font-bold">
                {sessionNotes.length}
              </span>
            )}
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={toggleFullscreen}
            id="toggle-fullscreen-btn"
            className="p-1.5 rounded-md bg-surface border border-border-subtle hover:border-border-strong text-text-secondary hover:text-text-primary transition-colors cursor-pointer shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CENTRAL VIEW (Timer, Metrics, Goal Card)                               */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center my-auto text-center space-y-6">
        
        {/* Status Mode Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase transition-all shadow-sm">
          {sessionMode === 'focus' ? (
            <div className="flex items-center gap-2 text-cyan bg-cyan-dim px-3 py-1 rounded-full border border-cyan/30">
              <span className="h-2 w-2 rounded-full bg-cyan animate-ping" />
              <span>Deep Focus Mode</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber bg-amber-dim px-3 py-1 rounded-full border border-amber/30">
              <Coffee className="w-3.5 h-3.5" />
              <span>Break Time (5m)</span>
            </div>
          )}
        </div>

        {/* Prominent Countdown Display */}
        <div className="space-y-3">
          <div 
            id="workspace-timer-display"
            className={`text-7xl sm:text-8xl md:text-9xl font-mono font-bold tracking-tight tabular-nums transition-colors duration-300 ${
              sessionMode === 'break' 
                ? 'text-amber' 
                : isPaused 
                  ? 'text-text-secondary opacity-75' 
                  : 'text-cyan'
            }`}
          >
            {formatMMSS(remainingSeconds)}
          </div>

          {/* Linear Progress Bar */}
          <div className="w-64 sm:w-80 h-1.5 bg-surface-inset border border-border-subtle rounded-full mx-auto overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                sessionMode === 'break' ? 'bg-amber' : 'bg-cyan'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Live Metrics Counters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
          {/* Focused Time Elapsed */}
          <div className="bg-surface/80 border border-border-subtle rounded-lg p-2.5">
            <p className="text-[11px] font-sans text-text-tertiary">Focused Time</p>
            <p className="font-mono font-semibold text-sm text-text-primary mt-0.5" id="metric-focused-time">
              {Math.floor(elapsedSeconds / 60)} min
            </p>
          </div>

          {/* Pauses Count */}
          <div className="bg-surface/80 border border-border-subtle rounded-lg p-2.5">
            <p className="text-[11px] font-sans text-text-tertiary">Pauses</p>
            <p className="font-mono font-semibold text-sm text-warning mt-0.5" id="metric-pauses-count">
              {pausesCount}
            </p>
          </div>

          {/* Time Spent Paused */}
          <div className="bg-surface/80 border border-border-subtle rounded-lg p-2.5 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-sans text-text-tertiary">Paused Time</p>
            <p className="font-mono font-semibold text-sm text-text-secondary mt-0.5">
              {Math.floor(pausedSeconds / 60)} min
            </p>
          </div>
        </div>

        {/* Session Goal Display Card */}
        <div className="w-full max-w-md bg-surface/90 border border-border-subtle rounded-xl p-4 text-left shadow-sm">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-text-secondary">
            <Target className="w-3.5 h-3.5 text-cyan" />
            <span>Session Goal</span>
          </div>
          <p className="text-xs font-sans text-text-primary leading-relaxed" id="workspace-goal-text">
            {activeSession.goal || 'Complete dedicated study block without distractions.'}
          </p>
        </div>

      </main>

      {/* ========================================================================= */}
      {/* 3. CONTROLS BAR                                                           */}
      {/* ========================================================================= */}
      <footer className="relative z-10 w-full max-w-md mx-auto pt-4 border-t border-border-subtle/70 flex items-center justify-center gap-3 sm:gap-4">
        {/* Restart Button */}
        <button
          onClick={restartFocusSession}
          id="btn-restart-focus"
          className="px-4 py-2.5 rounded-md bg-surface border border-border-subtle hover:border-border-strong text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          title="Restart timer to planned duration"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restart</span>
        </button>

        {/* Pause / Resume Button */}
        <button
          onClick={togglePause}
          id="btn-pause-resume"
          className={`px-6 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
            isPaused
              ? 'bg-cyan text-text-on-accent hover:brightness-110'
              : 'bg-surface-raised border border-border-strong text-text-primary hover:bg-surface-inset'
          }`}
        >
          {isPaused ? (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          )}
        </button>

        {/* End Session Button */}
        <button
          onClick={openSummaryModal}
          id="btn-end-session"
          className="px-4 py-2.5 rounded-md bg-surface border border-border-subtle hover:border-success/50 hover:bg-success/10 text-xs font-medium text-text-secondary hover:text-success flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          title="End session and log results"
        >
          <Check className="w-3.5 h-3.5" />
          <span>End Session</span>
        </button>
      </footer>

      {/* ========================================================================= */}
      {/* 4. QUICK NOTES DRAWER (Slide-in right panel)                               */}
      {/* ========================================================================= */}
      {isNotesOpen && (
        <aside 
          id="quick-notes-drawer"
          className="fixed top-0 right-0 bottom-0 z-[110] w-full max-w-sm bg-surface/98 backdrop-blur-xl border-l border-border-subtle shadow-2xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-250 font-sans"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan" />
                <h3 className="text-sm font-semibold text-text-primary">Quick Notes</h3>
              </div>
              <button
                onClick={() => setIsNotesOpen(false)}
                className="text-text-tertiary hover:text-text-primary p-1 rounded-md transition-colors cursor-pointer"
                title="Close Notes"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Note Input Form */}
            <form onSubmit={handleNoteSubmit} className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Type a quick thought, question, or note..."
                  className="w-full bg-surface-inset border border-border-subtle focus:border-cyan rounded-lg pl-3 pr-9 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none transition-colors font-sans"
                  id="quick-note-input"
                />
                <button
                  type="submit"
                  id="quick-note-submit"
                  disabled={!noteInput.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-cyan hover:brightness-125 disabled:opacity-40 transition-all cursor-pointer"
                  title="Add Note"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {sessionNotes.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-border-subtle/70 rounded-lg">
                  <FileText className="w-6 h-6 text-text-tertiary mx-auto mb-1.5 opacity-50" />
                  <p className="text-xs text-text-tertiary">No notes added yet</p>
                  <p className="text-[10px] text-text-tertiary/70 mt-0.5">Keep track of sudden ideas without losing focus</p>
                </div>
              ) : (
                sessionNotes.map((note) => (
                  <div 
                    key={note.id} 
                    className="group bg-surface-inset border border-border-subtle/80 hover:border-border-strong rounded-lg p-2.5 transition-all flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-text-primary break-words font-sans">{note.text}</p>
                      <span className="text-[10px] text-text-tertiary mt-1 block font-mono">{note.timestamp}</span>
                    </div>
                    <button
                      onClick={() => removeSessionNote(note.id)}
                      className="text-text-tertiary hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Drawer Footer info */}
          <div className="pt-3 border-t border-border-subtle/60 flex items-center justify-between text-[11px] text-text-tertiary">
            <span>{sessionNotes.length} {sessionNotes.length === 1 ? 'note' : 'notes'} saved</span>
            <span>Persisted to session</span>
          </div>
        </aside>
      )}
    </div>
  );
};

export default FocusWorkspace;
