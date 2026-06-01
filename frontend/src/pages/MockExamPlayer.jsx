import React, { useState, useEffect } from 'react';

const MockExamPlayer = ({ examData, onClose }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState((examData?.durationMinutes || 120) * 60);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    if (isSubmitted) return;
    
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitted]);

  if (!examData || !examData.sections) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-md flex items-center justify-center p-6 text-neutral-100">
        <div className="bg-neutral-950 border border-neutral-800 p-8 max-w-md w-full text-center font-sans">
          <p className="font-mono text-rose-500 uppercase tracking-widest text-sm mb-4">[ERROR: CORRUPT EXAM DATA]</p>
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-neutral-700 hover:border-neutral-500 font-mono text-xs text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
          >
            [CLOSE TERMINAL]
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (sectionIdx, qIdx, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [`${sectionIdx}-${qIdx}`]: answer
    }));
  };

  const handleSubmit = () => {
    // Calculate MCQ Score for results screen
    let mcqCorrect = 0;
    let mcqTotal = 0;

    examData.sections.forEach((section, sectionIdx) => {
      section.questions.forEach((q, qIdx) => {
        if (q.type === 'MCQ') {
          mcqTotal += 1;
          const uAnswer = userAnswers[`${sectionIdx}-${qIdx}`];
          const cAnswer = q.correctAnswer;
          if (uAnswer && cAnswer && (
            uAnswer.trim().toLowerCase() === cAnswer.trim().toLowerCase() ||
            uAnswer.trim().charAt(0).toLowerCase() === cAnswer.trim().charAt(0).toLowerCase()
          )) {
            mcqCorrect += 1;
          }
        }
      });
    });

    setScore({ correct: mcqCorrect, total: mcqTotal });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-md flex justify-center p-0 sm:p-6 overflow-y-auto">
      {/* Decorative background grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      
      <div className="bg-neutral-950/90 border border-neutral-800/80 w-full max-w-4xl relative z-10 shadow-2xl flex flex-col font-sans h-full sm:h-auto sm:max-h-[90vh]">
        
        {/* Dynamic scan line effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/50 shadow-[0_0_10px_#22d3ee] animate-pulse" />

        {/* Sticky Header */}
        <header className="sticky top-0 z-20 flex justify-between items-center border-b border-neutral-800 p-4 sm:p-6 bg-neutral-950/95 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-1.5 w-1.5 rounded-full animate-pulse shadow-[0_0_6px] ${isSubmitted ? 'bg-indigo-400 shadow-indigo-400' : 'bg-cyan-400 shadow-cyan-400'}`} />
              <p className={`text-[10px] uppercase tracking-[0.25em] font-mono font-bold ${isSubmitted ? 'text-indigo-400' : 'text-cyan-400'}`}>
                {isSubmitted ? 'EVALUATION // COMPLETE' : 'EVALUATION // IN_PROGRESS'}
              </p>
            </div>
            <h2 className="text-sm font-mono text-neutral-300 font-bold uppercase tracking-wider truncate max-w-xs sm:max-w-md">
              {examData.subject || 'MOCK EXAM'}
            </h2>
          </div>
          <div className="flex flex-col items-end gap-1">
            {!isSubmitted ? (
              <div className={`font-mono font-bold text-lg tracking-widest ${timeLeft < 300 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
                [ TIME REMAINING // {formatTime(timeLeft)} ]
              </div>
            ) : (
              <button 
                onClick={onClose}
                className="text-neutral-500 hover:text-neutral-200 font-mono text-xs px-3 py-1 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 transition-all cursor-pointer"
              >
                [EXIT SIMULATION]
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {!isSubmitted ? (
            /* EXAM MODE */
            <div className="space-y-12">
              {examData.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-6">
                  <div className="border-b border-neutral-800 pb-4">
                    <h3 className="text-lg font-mono font-bold text-neutral-200 tracking-wider uppercase flex items-center gap-3">
                      <span className="text-cyan-500 bg-cyan-500/10 px-2 py-1 text-xs">SECTION {sIdx + 1}</span>
                      {section.sectionName}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono uppercase tracking-widest mt-2">
                      {section.instructions}
                    </p>
                  </div>

                  <div className="space-y-8">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-[#0b0d13] border border-neutral-800/60 p-5 space-y-4">
                        <div className="flex items-center justify-between gap-2 border-b border-neutral-800/40 pb-3">
                          <span className="text-xs font-mono text-neutral-500 font-bold tracking-widest">
                            Q{qIdx + 1}.
                          </span>
                          <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase">
                            {q.type}
                          </span>
                        </div>
                        
                        <p className="text-sm text-neutral-200 leading-relaxed font-sans pb-2">
                          {q.question}
                        </p>

                        <div className="space-y-2">
                          {q.type === 'MCQ' ? (
                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = userAnswers[`${sIdx}-${qIdx}`] === opt;
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleAnswerSelect(sIdx, qIdx, opt)}
                                    className={`w-full text-left p-3 border font-mono text-xs transition-all flex items-center gap-3 cursor-pointer ${
                                      isSelected
                                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                                    }`}
                                  >
                                    <span className={`w-4 h-4 border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                                      isSelected 
                                        ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' 
                                        : 'border-neutral-700 text-neutral-500'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className="font-sans text-xs">{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <textarea
                              value={userAnswers[`${sIdx}-${qIdx}`] || ''}
                              onChange={(e) => handleAnswerSelect(sIdx, qIdx, e.target.value)}
                              className="w-full bg-[#090b0f] border border-neutral-800 text-neutral-200 px-4 py-3 font-mono text-xs focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-neutral-700 min-h-[140px]"
                              placeholder={q.type === 'Coding' ? '// Write your code here...' : 'Write your detailed response...'}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* RESULTS MODE */
            <div className="space-y-8">
              <div className="bg-[#0b0d13] border border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-neutral-100 mb-1">
                    Simulation Concluded
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider leading-relaxed">
                    Time Elapsed: {formatTime((examData.durationMinutes * 60) - timeLeft)} <br/>
                    Subjective responses logged for manual review.
                  </p>
                </div>
                <div className="shrink-0 text-center sm:text-right border-l sm:border-l border-neutral-800 pl-0 sm:pl-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0">
                  <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider mb-1">OBJECTIVE SCORE MATRIX</span>
                  <span className="text-4xl font-black font-mono text-cyan-400 tracking-wider shadow-cyan-400/20 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    {score.correct} <span className="text-neutral-600">/</span> {score.total}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                    ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% EFFICIENCY)
                  </span>
                </div>
              </div>

              {examData.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <h4 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">
                    SECTION {sIdx + 1} // {section.sectionName}
                  </h4>
                  
                  <div className="space-y-4">
                    {section.questions.map((q, qIdx) => {
                      const isMcq = q.type === 'MCQ';
                      const uAnswer = userAnswers[`${sIdx}-${qIdx}`];
                      const cAnswer = q.correctAnswer;
                      const isCorrect = isMcq && uAnswer && cAnswer && (
                        uAnswer.trim().toLowerCase() === cAnswer.trim().toLowerCase() || 
                        uAnswer.trim().charAt(0).toLowerCase() === cAnswer.trim().charAt(0).toLowerCase()
                      );

                      return (
                        <div key={qIdx} className="border border-neutral-800 bg-[#090b0f] p-5 space-y-3 relative overflow-hidden">
                          {isMcq && (
                            <div className={`absolute top-0 left-0 w-1 h-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          )}

                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-[10px] font-mono text-neutral-500">Q{qIdx + 1}</span>
                            <span className="bg-neutral-900 border border-neutral-800 text-neutral-400 px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase">
                              {q.type}
                            </span>
                            {isMcq && (
                              <span className={`text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.5 border ${
                                isCorrect 
                                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' 
                                  : 'text-rose-400 border-rose-500/20 bg-rose-500/5'
                              }`}>
                                {isCorrect ? 'PASSED' : 'FAILED'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-300 font-medium leading-relaxed font-sans">{q.question}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                            <div className="bg-neutral-950 p-2 border border-neutral-900">
                              <span className="text-neutral-600 block text-[9px] uppercase tracking-wider mb-0.5">YOUR RESPONSE</span>
                              <span className={`${isMcq ? (isCorrect ? 'text-emerald-400' : 'text-rose-400') : 'text-neutral-400'}`}>
                                {uAnswer || '[ NO RESPONSE PROVIDED ]'}
                              </span>
                            </div>
                            {isMcq && (
                              <div className="bg-neutral-950 p-2 border border-neutral-900">
                                <span className="text-neutral-600 block text-[9px] uppercase tracking-wider mb-0.5">CORRECT TARGET</span>
                                <span className="text-emerald-400">{cAnswer}</span>
                              </div>
                            )}
                          </div>

                          {q.explanation && (
                            <div className="bg-cyan-950/10 border-l border-cyan-500/30 p-3 mt-2 text-[10px] leading-relaxed text-neutral-400 font-mono">
                              <span className="text-cyan-400 font-bold block mb-1">AI ANALYSIS //</span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions (Exam Mode) */}
        {!isSubmitted && (
          <div className="border-t border-neutral-800 p-4 sm:p-6 bg-neutral-950 text-right shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 bg-cyan-500/10 border border-cyan-500/60 text-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] font-mono text-xs font-bold tracking-wider transition-all cursor-pointer"
            >
              [ SUBMIT EXAM & EVALUATE ]
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MockExamPlayer;
