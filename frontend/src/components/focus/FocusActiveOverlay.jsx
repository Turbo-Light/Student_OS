import React, { useContext } from 'react';
import { FocusContext } from '../../context/FocusContext';
import FocusWorkspace from './FocusWorkspace';
import { Play, Pause, Maximize2, Check } from 'lucide-react';

const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const FocusActiveOverlay = () => {
  const {
    activeSession,
    remainingSeconds,
    isPaused,
    sessionMode,
    togglePause,
    isOverlayOpen,
    setIsOverlayOpen
  } = useContext(FocusContext);

  if (!activeSession) return null;

  // 1. FULLSCREEN DISTRACTION-FREE WORKSPACE
  if (isOverlayOpen) {
    return <FocusWorkspace />;
  }

  // 2. FLOATING MINI-HUD (Shown when minimized)
  return (
    <div 
      id="focus-active-hud"
      className="fixed bottom-6 right-6 z-40 bg-surface/95 backdrop-blur-md border border-cyan/40 shadow-2xl rounded-xl p-3.5 flex items-center gap-4 font-sans text-text-primary animate-in slide-in-from-bottom-5 duration-300"
    >
      {/* Indicator */}
      <div className="relative flex items-center justify-center">
        {!isPaused && (
          <span className={`animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full opacity-75 ${
            sessionMode === 'break' ? 'bg-amber/40' : 'bg-cyan/40'
          }`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
          sessionMode === 'break' ? 'bg-amber' : (isPaused ? 'bg-warning' : 'bg-cyan')
        }`} />
      </div>

      {/* Session Meta */}
      <div className="min-w-0 max-w-[180px]">
        <p className="text-xs font-semibold text-text-primary truncate">
          {sessionMode === 'break' ? 'Break Time' : (activeSession.topic || activeSession.subject)}
        </p>
        <p className="text-[11px] text-text-secondary truncate">
          {sessionMode === 'break' ? 'Recharge' : activeSession.subject}
        </p>
      </div>

      {/* Live Countdown Display */}
      <div className="px-2.5 py-1 bg-surface-inset border border-border-subtle rounded-md">
        <span 
          id="focus-countdown"
          className={`font-mono font-bold text-sm tabular-nums tracking-wider ${
            sessionMode === 'break' ? 'text-amber' : 'text-cyan'
          }`}
        >
          {formatTime(remainingSeconds)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5 border-l border-border-subtle pl-2.5">
        <button
          onClick={togglePause}
          className="p-1.5 rounded-md hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title={isPaused ? 'Resume Focus' : 'Pause Focus'}
        >
          {isPaused ? <Play className="w-4 h-4 text-cyan" /> : <Pause className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setIsOverlayOpen(true)}
          className="p-1.5 rounded-md hover:bg-surface-raised text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          title="Expand Focus Workspace"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default FocusActiveOverlay;
