import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { TaskContext } from '../context/TaskContext';
import QuizPlayer from './QuizPlayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AIPlanner = () => {
  const [inputMode, setInputMode] = useState('text');
  const [syllabusText, setSyllabusText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [plan, setPlan] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const { addTask } = useContext(TaskContext);
  const [appendedTasks, setAppendedTasks] = useState(new Set());

  // Quiz Integration States
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [quizSubject, setQuizSubject] = useState('');
  const [quizDay, setQuizDay] = useState(1);
  const [generatingQuizDay, setGeneratingQuizDay] = useState(null);

  const handleAppendTask = (item, idx) => {
    // Creating a combined description from topics, practice, and revision
    let desc = '';
    if (item.topics) desc += `Topics: ${item.topics}\n`;
    if (item.practiceTasks) desc += `Practice: ${item.practiceTasks}\n`;
    if (item.revisionTasks) desc += `Revision: ${item.revisionTasks}`;
    
    if (!desc) {
      desc = item.description || item.Description || 'AI Generated Topic';
    }

    addTask({ 
      title: item.topic || `Study Day ${item.day}`, 
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
      const today = new Date();
      const target = new Date(examDate);
      const diffTime = Math.abs(target - today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let response;
      if (inputMode === 'text') {
        response = await fetch(`${API_URL}/api/ai/generate/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ syllabusText, examDate, hoursPerDay, days: diffDays })
        });
      } else {
        if (!selectedImage) {
          setError('Please select a syllabus image to upload.');
          setIsGenerating(false);
          return;
        }
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('examDate', examDate);
        formData.append('hoursPerDay', hoursPerDay);
        formData.append('days', diffDays);

        response = await fetch(`${API_URL}/api/ai/generate/image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
      }

      const data = await response.json();
      
      if (response.ok) {
        setPlan(data.studyPlan || data.plan || []);
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

  const handleGenerateQuiz = async (dayItem) => {
    setGeneratingQuizDay(dayItem.day);
    setError(null);
    
    try {
      // derive subject from the input text or image name
      const derivedSubject = syllabusText.split('\n')[0].substring(0, 50) || 
                             (selectedImage ? selectedImage.name.split('.')[0] : 'Syllabus Directives');

      const topicsArray = dayItem.topics ? dayItem.topics.split(',').map(t => t.trim()) : [dayItem.topic || `Study Day ${dayItem.day}`];

      const response = await fetch(`${API_URL}/api/quizzes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject: derivedSubject,
          dayNumber: dayItem.day,
          topics: topicsArray
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setActiveQuizData(data.questions || []);
        setQuizSubject(derivedSubject);
        setQuizDay(dayItem.day);
      } else {
        setError(data.message || 'Quiz generation failed.');
      }
    } catch (err) {
      console.error('Quiz Generation Error:', err);
      setError('Failed to reach Quiz Engine.');
    } finally {
      setGeneratingQuizDay(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 py-10 px-6 relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-neutral-800 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#818cf8]" />
              <p className="text-xs uppercase tracking-[0.25em] font-mono text-indigo-400 font-bold">MODULE // AI_PLANNER</p>
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
              <h2 className="text-sm font-bold tracking-wider uppercase font-mono text-neutral-400 mb-4 border-b border-neutral-800 pb-2">
                &gt; Initialize_Generation
              </h2>
              
              {/* Sleek Toggle Button Group */}
              <div className="flex border border-neutral-850 p-0.5 bg-[#0b0d13] mb-4">
                <button
                  type="button"
                  onClick={() => { setInputMode('text'); setError(null); }}
                  className={`flex-1 py-1.5 text-center font-mono text-[10px] tracking-wider transition-all cursor-pointer ${
                    inputMode === 'text'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  TEXT MODE
                </button>
                <button
                  type="button"
                  onClick={() => { setInputMode('image'); setError(null); }}
                  className={`flex-1 py-1.5 text-center font-mono text-[10px] tracking-wider transition-all cursor-pointer ${
                    inputMode === 'image'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  IMAGE MODE
                </button>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                {inputMode === 'text' ? (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">SYLLABUS DATA [PASTE TOPICS]</label>
                    <textarea 
                      value={syllabusText}
                      onChange={(e) => setSyllabusText(e.target.value)}
                      required
                      className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-700 min-h-[120px]"
                      placeholder="e.g., Module 1: Processor Pipelining, Module 2: Cache Coherence..."
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">SYLLABUS IMAGE [UPLOAD SCREENSHOT]</label>
                    <div className="relative border border-dashed border-neutral-800 hover:border-indigo-500/50 bg-[#0b0d13] p-4 text-center cursor-pointer transition-all min-h-[120px] flex items-center justify-center">
                      <input
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedImage(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required={inputMode === 'image' && !selectedImage}
                      />
                      <div className="space-y-1">
                        <svg className="mx-auto h-8 w-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[10px] font-mono text-neutral-400">
                          {selectedImage ? selectedImage.name : 'CLICK TO UPLOAD SCREENSHOT'}
                        </p>
                        <p className="text-[8px] font-mono text-neutral-600">PNG, JPG, JPEG UP TO 10MB</p>
                      </div>
                    </div>
                    {selectedImage && (
                      <div className="mt-2 p-1 bg-neutral-900 border border-neutral-800 relative">
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Syllabus Preview"
                          className="max-h-32 mx-auto object-contain border border-neutral-800"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedImage(null)}
                          className="text-[9px] font-mono text-rose-500 hover:text-rose-400 mt-1 cursor-pointer block mx-auto uppercase tracking-wider"
                        >
                          [ REMOVE IMAGE ]
                        </button>
                      </div>
                    )}
                  </div>
                )}

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
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
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
                      className="bg-[#111] border-l-2 border-l-indigo-500 border-t border-b border-r border-neutral-800/80 p-5 hover:border-r-indigo-500/30 hover:border-t-indigo-500/30 hover:border-b-indigo-500/30 transition-all group relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      
                      <div className="relative z-10 flex-grow w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest">
                            DAY {item.day}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                            // {item.duration || item.studyTime || hoursPerDay} HOURS
                          </span>
                        </div>
                        
                        <div className="space-y-2 mb-3">
                           {item.topics && (
                              <div>
                                <h4 className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest mb-0.5">Topics</h4>
                                <p className="text-xs font-bold text-neutral-200">{item.topics}</p>
                              </div>
                           )}
                           {item.practiceTasks && (
                              <div>
                                <h4 className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest mb-0.5">Practice</h4>
                                <p className="text-xs text-neutral-400">{item.practiceTasks}</p>
                              </div>
                           )}
                           {item.revisionTasks && (
                              <div>
                                <h4 className="text-[9px] font-mono text-indigo-500 uppercase tracking-widest mb-0.5">Revision</h4>
                                <p className="text-xs text-neutral-400">{item.revisionTasks}</p>
                              </div>
                           )}
                           {/* Fallback rendering if AI output varies slightly */}
                           {(!item.topics && !item.practiceTasks && !item.revisionTasks && item.topic) && (
                              <h3 className="text-sm font-bold text-neutral-200 tracking-wide">{item.topic}</h3>
                           )}
                           {(!item.topics && !item.practiceTasks && !item.revisionTasks && (item.description || item.Description)) && (
                              <p className="text-xs text-neutral-400 mt-1">{item.description || item.Description}</p>
                           )}
                        </div>
                      </div>
                      
                      <div className="relative z-10 shrink-0 text-right w-full sm:w-auto flex flex-col gap-2">
                        <button 
                          onClick={() => handleAppendTask(item, idx)}
                          disabled={appendedTasks.has(idx)}
                          className={`w-full sm:w-auto text-[10px] font-mono border px-3 py-1.5 transition-all ${
                            appendedTasks.has(idx)
                              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 cursor-not-allowed'
                              : 'text-neutral-500 border-neutral-700 hover:text-indigo-400 hover:border-indigo-500/30 cursor-pointer'
                          }`}
                        >
                          {appendedTasks.has(idx) ? '[ APPENDED ]' : '[ + APPEND TO TASKS ]'}
                        </button>

                        <button
                          onClick={() => handleGenerateQuiz(item)}
                          disabled={generatingQuizDay === item.day}
                          className={`w-full sm:w-auto text-[10px] font-mono border px-3 py-1.5 transition-all cursor-pointer ${
                            generatingQuizDay === item.day
                              ? 'text-indigo-400 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)] bg-indigo-500/10'
                              : 'text-neutral-500 border-neutral-700 hover:text-indigo-400 hover:border-indigo-500/30 bg-indigo-500/5'
                          }`}
                        >
                          {generatingQuizDay === item.day ? '[ GENERATING... ]' : '[ GENERATE QUIZ ]'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Quiz Modal Overlay */}
      {activeQuizData && (
        <QuizPlayer 
          quizData={activeQuizData}
          subject={quizSubject}
          dayNumber={quizDay}
          onClose={() => setActiveQuizData(null)}
        />
      )}
    </div>
  );
};

export default AIPlanner;
