import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const FocusContext = createContext();

export const FocusProvider = ({ children }) => {
  const { user, setUser } = useContext(AuthContext) || {};

  // Launcher Modal State
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [launcherParams, setLauncherParams] = useState({
    subject: '',
    topic: '',
    taskId: '',
    plannedDuration: 25,
    goal: ''
  });

  // Active Focus Session State
  const [activeSession, setActiveSession] = useState(() => {
    try {
      const saved = localStorage.getItem('studentos_active_focus');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    try {
      const saved = localStorage.getItem('studentos_focus_remaining');
      return saved ? Number(saved) : 25 * 60;
    } catch {
      return 25 * 60;
    }
  });

  const [sessionMode, setSessionMode] = useState(() => {
    return localStorage.getItem('studentos_focus_mode') || 'focus'; // 'focus' | 'break'
  });

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const [pausesCount, setPausesCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Summary Modal & Score Presentation State
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);

  // Sync activeSession and sessionMode to localStorage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('studentos_active_focus', JSON.stringify(activeSession));
      localStorage.setItem('studentos_focus_mode', sessionMode);
    } else {
      localStorage.removeItem('studentos_active_focus');
      localStorage.removeItem('studentos_focus_remaining');
      localStorage.removeItem('studentos_focus_mode');
    }
  }, [activeSession, sessionMode]);

  // Sync remainingSeconds periodically
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('studentos_focus_remaining', remainingSeconds.toString());
    }
  }, [remainingSeconds, activeSession]);

  // Native Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Timer Engine: Countdown and Break Transition
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      if (!isPaused) {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            // Automatic break switch logic
            if (sessionMode === 'focus') {
              toast('Focus interval complete! Starting 5-minute break.', { icon: '☕', duration: 4000 });
              setSessionMode('break');
              return 5 * 60; // 5-minute break
            } else {
              toast('Break complete! Ready for your next sprint.', { icon: '🔔', duration: 4000 });
              setSessionMode('focus');
              setIsPaused(true);
              return 0;
            }
          }
          return prev - 1;
        });

        if (sessionMode === 'focus') {
          setElapsedSeconds((prev) => prev + 1);
        }
      } else {
        setPausedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, isPaused, sessionMode]);

  // Open Launcher with prefilled params
  const openFocusLauncher = (params = {}) => {
    setLauncherParams({
      subject: params.subject || '',
      topic: params.topic || '',
      taskId: params.taskId || '',
      plannedDuration: params.plannedDuration || params.duration || 25,
      goal: params.goal || ''
    });
    setIsLauncherOpen(true);
  };

  const openFocusModal = openFocusLauncher;

  const closeFocusLauncher = () => {
    setIsLauncherOpen(false);
  };

  // Start Focus Session via POST /api/focus/start
  const startFocusSession = async (formData) => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        subject: formData.subject || 'General Focus',
        topic: formData.topic || 'Deep Work',
        task: formData.taskId || undefined,
        plannedDuration: Number(formData.plannedDuration) || 25,
        goal: formData.goal || ''
      };

      const res = await fetch(`${API_URL}/api/focus/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to initiate focus session');
      }

      const sessionData = await res.json();
      setActiveSession(sessionData);
      setRemainingSeconds(payload.plannedDuration * 60);
      setSessionMode('focus');
      setElapsedSeconds(0);
      setPausedSeconds(0);
      setPausesCount(0);
      setIsPaused(false);
      setSessionNotes([]);
      setIsLauncherOpen(false);
      setIsOverlayOpen(true); // Automatically take user to Focus Workspace

      toast.success(`Focus session started (${payload.plannedDuration}m)`);
      return sessionData;
    } catch (err) {
      console.error('Focus session error:', err);
      toast.error(err.message || 'Unable to start focus session');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pause / Resume with count tracking
  const togglePause = () => {
    if (!isPaused) {
      setPausesCount((prev) => prev + 1);
      setIsPaused(true);
      toast('Focus session paused', { icon: '⏸️' });
    } else {
      setIsPaused(false);
      toast('Focus session resumed', { icon: '▶️' });
    }
  };

  // Restart session timer
  const restartFocusSession = () => {
    if (!activeSession) return;
    const plannedSecs = (activeSession.plannedDuration || 25) * 60;
    setRemainingSeconds(plannedSecs);
    setSessionMode('focus');
    setIsPaused(false);
    toast.success('Session timer restarted');
  };

  // Quick Notes Management
  const addSessionNote = (text) => {
    if (!text || !text.trim()) return;
    const newNote = {
      id: Date.now(),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setSessionNotes((prev) => [...prev, newNote]);
  };

  const removeSessionNote = (id) => {
    setSessionNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Native Fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // Summary Modal controls
  const openSummaryModal = () => {
    setIsPaused(true);
    setIsSummaryModalOpen(true);
  };

  const closeSummaryModal = () => {
    setIsSummaryModalOpen(false);
    setSummaryResult(null);
    setActiveSession(null);
    setIsOverlayOpen(false);
    setSessionNotes([]);
    setSessionMode('focus');
    localStorage.removeItem('studentos_active_focus');
    localStorage.removeItem('studentos_focus_remaining');
    localStorage.removeItem('studentos_focus_mode');
  };

  // Submit Session Completion via PUT /api/focus/:id/end
  const submitSessionCompletion = async ({ goalAchievement = 'achieved', quickNotes = [] } = {}) => {
    if (!activeSession) return;

    const token = localStorage.getItem('token');
    const finalNotes = quickNotes.length > 0 
      ? quickNotes 
      : sessionNotes.map((n) => n.text);

    try {
      const res = await fetch(`${API_URL}/api/focus/${activeSession._id}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          actualFocusedTime: Math.max(elapsedSeconds, 1),
          pausedTime: pausedSeconds,
          pausesCount,
          goalAchievement,
          quickNotes: finalNotes
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to complete focus session');
      }

      const data = await res.json();
      setSummaryResult(data);
      toast.success(`Session Complete! +${data.xpEarned} XP (Score: ${data.focusScore}%)`);

      // Update user in AuthContext
      if (setUser) {
        setUser((prev) => ({
          ...prev,
          xp: data.user?.xp ?? ((prev?.xp || 0) + (data.xpEarned || 0)),
          level: data.user?.level ?? prev?.level,
          streak: data.user?.streak ?? prev?.streak
        }));
      }

      // Clear session from active storage
      localStorage.removeItem('studentos_active_focus');
      localStorage.removeItem('studentos_focus_remaining');
      localStorage.removeItem('studentos_focus_mode');

      return data;
    } catch (err) {
      console.error('Failed to log completed session:', err);
      toast.error(err.message || 'Error recording session');
      throw err;
    }
  };

  // End Session directly triggers the Summary Modal
  const endFocusSession = async () => {
    openSummaryModal();
  };

  // Discard / Abort without saving
  const cancelFocusSession = () => {
    setActiveSession(null);
    setIsOverlayOpen(false);
    setIsSummaryModalOpen(false);
    setSummaryResult(null);
    setSessionNotes([]);
    setSessionMode('focus');
    localStorage.removeItem('studentos_active_focus');
    localStorage.removeItem('studentos_focus_remaining');
    localStorage.removeItem('studentos_focus_mode');
    toast('Focus session ended early', { icon: '⏹️' });
  };

  return (
    <FocusContext.Provider
      value={{
        isLauncherOpen,
        launcherParams,
        openFocusLauncher,
        openFocusModal: openFocusLauncher,
        closeFocusLauncher,
        activeSession,
        remainingSeconds,
        elapsedSeconds,
        pausedSeconds,
        pausesCount,
        isPaused,
        sessionMode,
        isOverlayOpen,
        setIsOverlayOpen,
        isSubmitting,
        sessionNotes,
        addSessionNote,
        removeSessionNote,
        isFullscreen,
        toggleFullscreen,
        startFocusSession,
        togglePause,
        restartFocusSession,
        endFocusSession,
        cancelFocusSession,
        isSummaryModalOpen,
        summaryResult,
        openSummaryModal,
        closeSummaryModal,
        submitSessionCompletion
      }}
    >
      {children}
    </FocusContext.Provider>
  );
};

export const useFocus = () => useContext(FocusContext);

