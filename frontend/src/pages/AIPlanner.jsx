import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../context/TaskContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AIPlanner = () => {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [studyHours, setStudyHours] = useState(2);
  const [plan, setPlan] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { addTask } = useContext(TaskContext);
  const [appendedTasks, setAppendedTasks] = useState(new Set());

  const handleAppendTask = (item, idx) => {
    const desc = item.description || item.Description || 'AI Generated Topic';
    addTask({ 
      title: item.topic, 
      description: desc, 
      priority: 'High', 
      status: 'Pending' 
    });
    setAppendedTasks(prev => new Set(prev).add(idx));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setPlan([]);

    try {
      const response = await fetch(`${API_URL}/api/ai/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subject, examDate, hours: studyHours })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPlan(data.studyPlan);
      } else {
        setError(data.message || 'Generation failed.');
      }
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Neural link disconnected. Failed to reach AI node.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 py-10 px-6 relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-neutral-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" />
              <p className="text-xs uppercase tracking-[0.25em] font-mono text-indigo-400 font-bold">MODULE // NEURAL_PLANNER</p>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400">
              AI Study Assistant
            </h1>
          </div>
          <Link to="/" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/60 px-4 py-2 rounded bg-indigo-500/5 transition-all">
            [RETURN TO DASHBOARD]
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Section A: Command Input */}
          <div className="lg:col-span-4">
            <div className="bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 p-6 shadow-2xl shadow-indigo-950/10 sticky top-10">
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400 mb-6 border-b border-neutral-800 pb-2">
                &gt; Initialize_Generation
              </h2>
              
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">PARAMETER [SUBJECT]</label>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-700"
                    placeholder="e.g., RISC Processor Pipelines"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">TARGET [EXAM_DATE]</label>
                  <input 
                    type="date" 
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    required
                    className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-400 px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">CONSTRAINT [HOURS/DAY]</label>
                  <input 
                    type="number" 
                    min="1"
                    max="16"
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    required
                    className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating}
                  className={`w-full border font-mono font-bold tracking-wider text-xs py-3 mt-4 transition-all flex justify-center items-center gap-2 cursor-pointer ${
                    isGenerating 
                      ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)] text-indigo-300' 
                      : 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      [GENERATING...]
                    </>
                  ) : (
                    '[INITIALIZE AI GENERATION]'
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono">
                  [ERROR]: {error}
                </div>
              )}
            </div>
          </div>

          {/* Section B: Output Matrix */}
          <div className="lg:col-span-8">
            <div className="bg-neutral-900/20 border border-neutral-800/60 p-6 min-h-[500px]">
              <div className="flex justify-between items-center mb-6 border-b border-neutral-800/40 pb-4">
                <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400">
                  <span className="text-indigo-500 mr-2">_</span>NEURAL_OUTPUT_MATRIX
                </h2>
                {isGenerating && <div className="text-xs font-mono text-indigo-500 animate-pulse tracking-widest">AWAITING_PAYLOAD...</div>}
              </div>

              {plan.length === 0 && !isGenerating ? (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-800 bg-neutral-900/10 h-full">
                  <svg className="w-12 h-12 text-neutral-800 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest text-center max-w-xs">STANDBY MODE ACTIVE<br/><span className="text-[9px] mt-2 block opacity-70">Awaiting parameter initialization</span></p>
                </div>
              ) : (
                <div className="space-y-4">
                  {plan.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#111] border-l-2 border-l-indigo-500 border-t border-b border-r border-neutral-800/80 p-5 hover:border-r-indigo-500/30 hover:border-t-indigo-500/30 hover:border-b-indigo-500/30 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest">
                              DAY {item.day}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                              // {item.duration} HOURS
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-neutral-200 tracking-wide">{item.topic}</h3>
                          {(item.description || item.Description) && (
                            <p className="text-xs text-neutral-400 mt-1">{item.description || item.Description}</p>
                          )}
                        </div>
                        
                        <div className="shrink-0 text-right">
                          <button 
                            onClick={() => handleAppendTask(item, idx)}
                            disabled={appendedTasks.has(idx)}
                            className={`text-[10px] font-mono border px-2 py-1 transition-all ${
                              appendedTasks.has(idx)
                                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 cursor-not-allowed'
                                : 'text-neutral-500 border-transparent hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer'
                            }`}
                          >
                            {appendedTasks.has(idx) ? '[ APPENDED ]' : '[ + APPEND TO TASKS ]'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AIPlanner;
