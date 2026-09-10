import React, { useState, useContext, useEffect } from 'react';
import { TaskContext } from '../context/TaskContext';
import { FocusContext, useFocus } from '../context/FocusContext';
import QuizPlayer from './QuizPlayer';
import MockExamPlayer from './MockExamPlayer';
import { Sparkles, Calendar, Clock, BookOpen, Upload, AlertCircle, Plus, Check, Target, Pencil } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AIPlanner = () => {
  const [inputMode, setInputMode] = useState('text');
  const [syllabusText, setSyllabusText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [savedPlans, setSavedPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const { addTask } = useContext(TaskContext);
  const { openFocusLauncher, openFocusModal } = useContext(FocusContext) || {};
  const [appendedTasks, setAppendedTasks] = useState(new Set());

  // Quiz Integration States
  const [activeQuizData, setActiveQuizData] = useState(null);
  const [quizSubject, setQuizSubject] = useState('');
  const [quizDay, setQuizDay] = useState(1);
  const [generatingQuizDay, setGeneratingQuizDay] = useState(null);

  // Mock Exam States
  const [activeMockExam, setActiveMockExam] = useState(null);
  const [generatingMockExam, setGeneratingMockExam] = useState(false);
  const [showMockExamConfig, setShowMockExamConfig] = useState(false);
  const [examConfig, setExamConfig] = useState({
    durationMinutes: 60,
    questionType: 'mixed',
    questionCount: 5
  });

  // Fetch all saved study plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsCreating(true);
          return;
        }

        const response = await fetch(`${API_URL}/api/ai/plans`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setSavedPlans(data);
            setActivePlan(data[0]);
            setIsCreating(false);
          } else {
            setSavedPlans([]);
            setActivePlan(null);
            setIsCreating(true);
          }
        } else {
          setIsCreating(true);
        }
      } catch (err) {
        console.error('Failed to fetch study plans:', err);
        setIsCreating(true);
      }
    };

    fetchPlans();
  }, []);

  const handleAppendTask = (item, idx) => {
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
      status: 'Pending',
      isAiGenerated: true,
      source: 'ai'
    });
    setAppendedTasks(prev => new Set(prev).add(idx));
  };

  const handleRename = async (planId, e) => {
    if (e) e.stopPropagation();
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEditingPlanId(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/ai/plans/${planId}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: trimmedTitle })
      });

      if (response.ok) {
        const updated = await response.json();
        const newSubject = updated.subject || trimmedTitle;

        setSavedPlans(prev => prev.map(p => {
          if (p._id === planId) {
            return { ...p, subject: newSubject };
          }
          return p;
        }));

        setActivePlan(prev => {
          if (prev && prev._id === planId) {
            return { ...prev, subject: newSubject };
          }
          return prev;
        });

        setEditingPlanId(null);
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to rename study plan.');
      }
    } catch (err) {
      console.error('Rename error:', err);
      setError('Failed to rename study plan.');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const today = new Date();
      const target = new Date(examDate);
      const diffTime = Math.abs(target - today);
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (!diffDays || isNaN(diffDays) || diffDays < 1) diffDays = 7;
      if (diffDays > 30) diffDays = 14;

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
        const generatedDays = data.studyPlan || data.plan || [];
        const planSubject = data.title || data.planDoc?.subject || ((syllabusText && syllabusText.trim().length > 0) 
          ? syllabusText.split('\n')[0].substring(0, 50) 
          : (selectedImage ? selectedImage.name.split('.')[0] : 'Study Plan'));

        const newPlan = data.planDoc || {
          _id: Date.now().toString(),
          subject: planSubject,
          examDate,
          dailyHours: hoursPerDay,
          plan: generatedDays,
          createdAt: new Date().toISOString()
        };

        setSavedPlans(prev => [newPlan, ...prev.filter(p => p._id !== newPlan._id)]);
        setActivePlan(newPlan);
        setIsCreating(false);

        // Background refresh from server to ensure complete document state
        try {
          const freshRes = await fetch(`${API_URL}/api/ai/plans`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (freshRes.ok) {
            const freshData = await freshRes.json();
            if (Array.isArray(freshData) && freshData.length > 0) {
              setSavedPlans(freshData);
              setActivePlan(freshData[0]);
            }
          }
        } catch (syncErr) {
          console.warn('Could not sync latest plans list:', syncErr);
        }
      } else {
        setError(data.message || 'Generation failed.');
      }
    } catch (err) {
      console.error('AI Generation Error:', err);
      setError('Failed to reach AI service. Please check your network connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuiz = async (dayItem) => {
    setGeneratingQuizDay(dayItem.day);
    setError(null);
    
    try {
      const derivedSubject = activePlan?.subject || 
                             ((syllabusText && syllabusText.trim().length > 0) 
                               ? syllabusText.split('\n')[0].substring(0, 50) 
                               : (selectedImage ? selectedImage.name.split('.')[0] : 'Daily Syllabus Revision'));

      const topicsArray = Array.isArray(dayItem.topics) ? dayItem.topics : [dayItem.topics || `Study Day ${dayItem.day}`];

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
      setError('Failed to connect to Quiz Engine.');
    } finally {
      setGeneratingQuizDay(null);
    }
  };

  const handleGenerateMockExam = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setShowMockExamConfig(false);
    setGeneratingMockExam(true);
    setError(null);

    try {
      const derivedSubject = activePlan?.subject ||
                             ((syllabusText && syllabusText.trim().length > 0) 
                               ? syllabusText.split('\n')[0].substring(0, 50) 
                               : (selectedImage ? selectedImage.name.split('.')[0] : 'Comprehensive AI Syllabus Review'));

      const examSyllabus = (activePlan?.plan && Array.isArray(activePlan.plan))
        ? activePlan.plan.map(d => `Day ${d.day}: ${Array.isArray(d.topics) ? d.topics.join(', ') : (d.topics || d.topic || '')}`).join('\n')
        : (syllabusText || 'Analyze topics generated in the study plan.');

      const response = await fetch(`${API_URL}/api/mock-exams/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subject: derivedSubject,
          syllabusText: examSyllabus,
          durationMinutes: examConfig.durationMinutes,
          questionType: examConfig.questionType,
          questionCount: examConfig.questionCount
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setActiveMockExam(data);
      } else {
        setError(data.message || 'Mock exam generation failed.');
      }
    } catch (err) {
      console.error('Mock Exam Generation Error:', err);
      setError('Failed to generate mock exam.');
    } finally {
      setGeneratingMockExam(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-primary font-sans selection:bg-violet-dim selection:text-violet py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[250px] bg-violet/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[300px] bg-cyan/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border-subtle pb-5 gap-4">
          <div>
            <p className="text-xs font-sans text-violet font-medium uppercase tracking-wider mb-1">
              AI Planner
            </p>
            <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-text-primary">
              AI Study Assistant
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Section A: Command Input / Saved Plans Library */}
          <div className="lg:col-span-4">
            {!isCreating ? (
              /* SAVED PLANS LIBRARY VIEW */
              <div className="bg-surface border border-border-subtle rounded-lg p-6 sticky top-20 space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet" />
                    <h2 className="text-sm font-sans font-semibold text-text-primary">
                      Saved Study Plans
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-text-tertiary bg-surface-inset px-2 py-0.5 rounded border border-border-subtle">
                    {savedPlans.length} {savedPlans.length === 1 ? 'Plan' : 'Plans'}
                  </span>
                </div>

                {/* Primary Action: Generate New Plan */}
                <button
                  type="button"
                  id="btn-generate-new-plan"
                  onClick={() => {
                    setIsCreating(true);
                    setError(null);
                  }}
                  className="w-full bg-violet text-text-on-accent hover:brightness-110 font-sans font-medium text-sm py-2.5 rounded-md transition-all shadow-sm flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate New Plan</span>
                </button>

                {/* Saved Plans List */}
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {savedPlans.length === 0 ? (
                    <div className="text-center py-8 px-4 border border-dashed border-border-subtle rounded-md bg-surface-inset/50">
                      <p className="text-xs text-text-secondary font-medium">No study plans saved yet</p>
                      <p className="text-[11px] text-text-tertiary mt-1">Create your first AI-generated schedule above.</p>
                    </div>
                  ) : (
                    savedPlans.map((p, index) => {
                      const isSelected = activePlan?._id ? activePlan._id === p._id : activePlan === p;
                      const isEditing = editingPlanId === p._id;
                      const createdDate = p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Recent';
                      const planDaysCount = Array.isArray(p.plan) ? p.plan.length : (Array.isArray(p.studyPlan) ? p.studyPlan.length : 0);

                      return (
                        <div
                          key={p._id || index}
                          role="button"
                          tabIndex={0}
                          id={`plan-card-${index}`}
                          onClick={() => {
                            if (!isEditing) {
                              setActivePlan(p);
                            }
                          }}
                          className={`w-full text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-violet/10 border-violet text-text-primary shadow-sm ring-1 ring-violet/40'
                              : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-violet/40 hover:bg-surface-inset/80 hover:text-text-primary'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              {isEditing ? (
                                <input
                                  type="text"
                                  autoFocus
                                  id={`plan-rename-input-${index}`}
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleRename(p._id, e);
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      setEditingPlanId(null);
                                    }
                                  }}
                                  className="bg-surface border border-violet text-text-primary text-xs font-sans font-semibold rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-violet w-full"
                                />
                              ) : (
                                <span 
                                  id={`plan-title-${index}`}
                                  className={`text-xs font-sans font-semibold truncate ${isSelected ? 'text-violet' : 'text-text-primary'}`}
                                >
                                  {p.subject || 'Study Plan'}
                                </span>
                              )}

                              {isEditing ? (
                                <button
                                  type="button"
                                  id={`plan-save-btn-${index}`}
                                  onClick={(e) => handleRename(p._id, e)}
                                  className="p-1 rounded hover:bg-violet/20 text-violet cursor-pointer transition-colors shrink-0"
                                  title="Save Plan Title"
                                >
                                  <Check className="w-3.5 h-3.5 text-violet" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  id={`plan-edit-btn-${index}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingPlanId(p._id);
                                    setEditTitle(p.subject || '');
                                  }}
                                  className="p-1 rounded hover:bg-surface-raised text-text-tertiary hover:text-violet cursor-pointer transition-colors shrink-0"
                                  title="Rename Plan"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {isSelected && (
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-violet/20 text-violet rounded border border-violet/30 font-bold shrink-0 ml-1">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-text-tertiary font-sans">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-text-tertiary" />
                              {createdDate}
                            </span>
                            {planDaysCount > 0 && (
                              <span>{planDaysCount} Days</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* CREATE NEW PLAN FORM VIEW */
              <div className="bg-surface border border-border-subtle rounded-lg p-6 sticky top-20">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-violet" />
                    <h2 className="text-sm font-sans font-semibold text-text-primary">
                      Generate Study Plan
                    </h2>
                  </div>
                  {savedPlans.length > 0 && (
                    <button
                      type="button"
                      id="btn-cancel-create-plan"
                      onClick={() => {
                        setIsCreating(false);
                        setError(null);
                      }}
                      className="text-xs font-sans text-text-tertiary hover:text-text-primary px-2 py-1 rounded border border-border-subtle hover:border-border-strong transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                
                {/* Tabs: Plain text with thin underline for active state */}
                <div className="flex border-b border-border-subtle mb-5 gap-6">
                  <button
                    type="button"
                    onClick={() => { setInputMode('text'); setError(null); }}
                    className={`pb-2 text-sm font-sans tracking-normal transition-all cursor-pointer ${
                      inputMode === 'text'
                        ? 'text-violet border-b-2 border-violet font-semibold'
                        : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
                    }`}
                  >
                    Text Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputMode('image'); setError(null); }}
                    className={`pb-2 text-sm font-sans tracking-normal transition-all cursor-pointer ${
                      inputMode === 'image'
                        ? 'text-violet border-b-2 border-violet font-semibold'
                        : 'text-text-secondary hover:text-text-primary border-b-2 border-transparent'
                    }`}
                  >
                    Image Mode
                  </button>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  {inputMode === 'text' ? (
                    <div className="space-y-1.5">
                      <label className="text-xs font-sans font-medium text-text-secondary">
                        Syllabus Topics
                      </label>
                      <textarea 
                        value={syllabusText}
                        onChange={(e) => setSyllabusText(e.target.value)}
                        required
                        className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all placeholder:text-text-tertiary min-h-[120px]"
                        placeholder="e.g., Module 1: Processor Pipelining, Module 2: Cache Coherence..."
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-sans font-medium text-text-secondary">
                        Syllabus Image
                      </label>
                      <div className="relative border border-dashed border-border-subtle hover:border-violet/50 bg-surface-inset rounded-md p-4 text-center cursor-pointer transition-all min-h-[120px] flex items-center justify-center">
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
                          <Upload className="mx-auto h-6 w-6 text-text-tertiary" />
                          <p className="text-xs font-sans text-text-secondary">
                            {selectedImage ? selectedImage.name : 'Click or drop syllabus screenshot'}
                          </p>
                          <p className="text-xs font-sans text-text-tertiary">PNG, JPG, JPEG up to 10MB</p>
                        </div>
                      </div>
                      {selectedImage && (
                        <div className="mt-2 p-1.5 bg-surface-inset border border-border-subtle rounded relative">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Syllabus Preview"
                            className="max-h-32 mx-auto object-contain rounded"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="text-xs font-sans text-danger hover:underline mt-1 cursor-pointer block mx-auto"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-medium text-text-secondary">
                      Target Exam Date
                    </label>
                    <input 
                      type="date" 
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      required
                      className="w-full bg-surface-inset border border-border-subtle text-text-secondary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-sans font-medium text-text-secondary">
                      Daily Study Hours
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="16"
                      value={hoursPerDay}
                      onChange={(e) => setHoursPerDay(Number(e.target.value))}
                      required
                      className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all"
                    />
                  </div>

                  {/* Action Buttons: Cancel + Generate */}
                  <div className="flex gap-2.5 pt-2">
                    {savedPlans.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreating(false);
                          setError(null);
                        }}
                        className="py-2.5 px-3.5 rounded-md border border-border-subtle text-xs font-sans font-medium text-text-secondary hover:text-text-primary hover:bg-surface-inset transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit" 
                      disabled={isGenerating}
                      className={`flex-1 bg-violet text-text-on-accent hover:brightness-110 font-sans font-medium text-sm py-2.5 rounded-md transition-all shadow-sm flex justify-center items-center gap-2 cursor-pointer ${
                        isGenerating ? 'opacity-80 cursor-not-allowed' : ''
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="h-4 w-4 border-2 border-text-on-accent border-t-transparent rounded-full animate-spin" />
                          <span>Generating Plan...</span>
                        </>
                      ) : (
                        <span>Generate Study Plan</span>
                      )}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-danger/10 border border-danger/20 rounded text-danger text-xs font-sans flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section B: Output Matrix */}
          <div className="lg:col-span-8">
            <div className="bg-surface border border-border-subtle rounded-lg p-6 min-h-[500px]">
              <div className="flex justify-between items-center mb-6 border-b border-border-subtle pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet" />
                  <h2 className="text-sm font-sans font-semibold text-text-primary">
                    {activePlan?.subject ? `${activePlan.subject}` : 'Your Study Plan'}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  {activePlan?.createdAt && (
                    <span className="text-xs font-sans text-text-tertiary hidden sm:inline">
                      Created {new Date(activePlan.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {isGenerating && <div className="text-xs font-sans text-violet animate-pulse font-medium">Generating...</div>}
                </div>
              </div>

              {(() => {
                const currentPlanDays = activePlan ? (Array.isArray(activePlan.plan) ? activePlan.plan : (Array.isArray(activePlan.studyPlan) ? activePlan.studyPlan : [])) : [];

                if (currentPlanDays.length === 0 && !isGenerating) {
                  return (
                    <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border-subtle bg-surface-inset/50 rounded-lg h-full">
                      <Sparkles className="w-10 h-10 text-text-tertiary mb-3 stroke-[1.5]" />
                      <p className="text-text-secondary font-sans text-sm font-medium text-center max-w-sm">
                        {isCreating ? 'Generate New Study Plan' : 'No Study Plan Selected'}
                        <span className="text-xs mt-1 block text-text-tertiary font-normal">
                          {isCreating
                            ? 'Fill out the form on the left to generate a new matrix.'
                            : 'Select a saved study plan from the library or create a new one.'}
                        </span>
                      </p>
                      {!isCreating && (
                        <button
                          type="button"
                          onClick={() => setIsCreating(true)}
                          className="mt-4 px-4 py-2 bg-violet text-text-on-accent text-xs font-sans font-medium rounded-md hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create New Plan</span>
                        </button>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {currentPlanDays.map((item, idx) => (
                      <div 
                        key={idx}
                        className="bg-surface-inset border-l-2 border-l-violet border-t border-b border-r border-border-subtle rounded-r-lg p-5 hover:border-r-violet/30 hover:border-t-violet/30 hover:border-b-violet/30 transition-all group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex-grow w-full min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
                            <span className="bg-violet/10 text-violet border border-violet/30 px-2 py-0.5 text-xs font-sans font-semibold rounded-sm">
                              Day {item.day}
                            </span>
                            <span className="text-xs text-text-tertiary font-sans">
                              {item.duration || item.studyTime || activePlan?.dailyHours || hoursPerDay} Hours Allocated
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-2">
                            {item.topics && (
                              <div>
                                <h4 className="text-xs font-sans text-violet font-medium mb-0.5">Topics</h4>
                                <p className="text-xs font-sans text-text-primary font-medium">{item.topics}</p>
                              </div>
                            )}
                            {item.practiceTasks && (
                              <div>
                                <h4 className="text-xs font-sans text-text-tertiary font-medium mb-0.5">Practice</h4>
                                <p className="text-xs font-sans text-text-secondary">{item.practiceTasks}</p>
                              </div>
                            )}
                            {item.revisionTasks && (
                              <div>
                                <h4 className="text-xs font-sans text-text-tertiary font-medium mb-0.5">Revision</h4>
                                <p className="text-xs font-sans text-text-secondary">{item.revisionTasks}</p>
                              </div>
                            )}
                            {/* Fallback rendering */}
                            {(!item.topics && !item.practiceTasks && !item.revisionTasks && item.topic) && (
                              <h3 className="text-xs font-sans font-semibold text-text-primary">{item.topic}</h3>
                            )}
                            {(!item.topics && !item.practiceTasks && !item.revisionTasks && (item.description || item.Description)) && (
                              <p className="text-xs font-sans text-text-secondary mt-1">{item.description || item.Description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="shrink-0 text-right w-full sm:w-auto flex flex-col sm:flex-row gap-2">
                          {/* Launch Focus Session Button */}
                          <button
                            type="button"
                            id={`focus-btn-day-${item.day}`}
                            onClick={() => {
                              const triggerFocus = openFocusModal || openFocusLauncher;
                              if (triggerFocus) {
                                const dayTopic = Array.isArray(item.topics) ? item.topics.join(', ') : (item.topic || `Day ${item.day} Study`);
                                const daySubject = activePlan?.subject || ((syllabusText && syllabusText.trim().length > 0) ? syllabusText.split('\n')[0] : 'Study Plan');
                                const dayHours = Number(item.duration) || Number(item.studyTime) || Number(activePlan?.dailyHours) || Number(hoursPerDay) || 1;
                                triggerFocus({
                                  subject: daySubject,
                                  topic: dayTopic,
                                  duration: dayHours * 60,
                                  plannedDuration: dayHours * 60,
                                  goal: item.practiceTasks ? `Practice: ${item.practiceTasks}` : (item.revisionTasks ? `Revision: ${item.revisionTasks}` : `Complete Day ${item.day} study goals`)
                                });
                              }
                            }}
                            className="w-full sm:w-auto text-xs font-sans font-medium rounded-md px-3 py-1.5 transition-all text-cyan border border-cyan/30 hover:border-cyan hover:bg-cyan-dim cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            title="Launch Focus Session for this study day"
                          >
                            <Target className="w-3.5 h-3.5 text-cyan" />
                            <span>Focus</span>
                          </button>

                          <button 
                            onClick={() => handleAppendTask(item, idx)}
                            disabled={appendedTasks.has(idx)}
                            className={`w-full sm:w-auto text-xs font-sans font-medium rounded-md px-3 py-1.5 transition-all ${
                              appendedTasks.has(idx)
                                ? 'text-success border border-success/30 bg-success/10 cursor-not-allowed'
                                : 'text-text-secondary border border-border-subtle hover:text-violet hover:border-violet/40 hover:bg-violet-dim cursor-pointer'
                            }`}
                          >
                            {appendedTasks.has(idx) ? 'Added to Tasks' : '+ Add to Tasks'}
                          </button>

                          <button
                            onClick={() => handleGenerateQuiz(item)}
                            disabled={generatingQuizDay === item.day}
                            className={`w-full sm:w-auto text-xs font-sans font-medium rounded-md px-3 py-1.5 transition-all cursor-pointer ${
                              generatingQuizDay === item.day
                                ? 'text-violet border border-violet bg-violet/10'
                                : 'text-text-secondary border border-border-subtle hover:text-violet hover:border-violet/40 hover:bg-violet-dim'
                            }`}
                          >
                            {generatingQuizDay === item.day ? 'Generating...' : 'Take Quiz'}
                          </button>
                        </div>
                      </div>
                    ))}

                    {currentPlanDays.length > 0 && (
                      <div className="pt-8 border-t border-border-subtle text-center">
                        <button
                          onClick={() => setShowMockExamConfig(true)}
                          disabled={generatingMockExam}
                          className={`px-6 py-2.5 rounded-md bg-violet text-text-on-accent hover:brightness-110 font-sans font-medium text-sm transition-all shadow-sm cursor-pointer inline-flex items-center gap-2 ${
                            generatingMockExam ? 'opacity-80 cursor-not-allowed' : ''
                          }`}
                        >
                          {generatingMockExam ? (
                            <>
                              <div className="h-4 w-4 border-2 border-text-on-accent border-t-transparent rounded-full animate-spin" />
                              <span>Preparing Exam...</span>
                            </>
                          ) : (
                            <span>Take Mock Exam</span>
                          )}
                        </button>
                        <p className="text-xs font-sans text-text-tertiary mt-2">
                          Practice with a timed mock exam based on your syllabus.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
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

      {/* Mock Exam Configuration Modal */}
      {showMockExamConfig && (
        <div className="fixed inset-0 z-50 bg-base/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-strong rounded-lg p-6 max-w-md w-full font-sans relative">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet" />
                <h2 className="text-sm font-sans font-semibold text-text-primary">
                  Mock Exam Settings
                </h2>
              </div>
            </div>

            <form onSubmit={handleGenerateMockExam} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-text-secondary">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  required
                  value={examConfig.durationMinutes}
                  onChange={e => setExamConfig({ ...examConfig, durationMinutes: Number(e.target.value) })}
                  className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-text-secondary">
                  Question Type
                </label>
                <div className="flex gap-2">
                  {['objective', 'subjective', 'mixed'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setExamConfig({ ...examConfig, questionType: type })}
                      className={`flex-1 py-1.5 font-sans text-xs capitalize rounded-md border transition-all cursor-pointer ${
                        examConfig.questionType === type
                          ? 'bg-violet/15 border-violet text-violet font-semibold'
                          : 'bg-surface-inset border-border-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-sans font-medium text-text-secondary">
                  Question Count (Max 15)
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  required
                  value={examConfig.questionCount}
                  onChange={e => setExamConfig({ ...examConfig, questionCount: Number(e.target.value) })}
                  className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-3 py-2 text-xs font-sans focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setShowMockExamConfig(false)}
                  className="flex-1 py-2 border border-border-subtle rounded-md text-text-secondary hover:text-text-primary font-sans text-xs font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet text-text-on-accent hover:brightness-110 font-sans font-medium text-xs rounded-md transition-all shadow-sm cursor-pointer"
                >
                  Start Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mock Exam Modal Overlay */}
      {activeMockExam && (
        <MockExamPlayer 
          examData={activeMockExam}
          onClose={() => setActiveMockExam(null)}
        />
      )}
    </div>
  );
};

export default AIPlanner;
