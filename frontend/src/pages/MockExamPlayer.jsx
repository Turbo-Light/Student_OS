import React, { useState, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';

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
      <div className="fixed inset-0 z-50 bg-base/90 backdrop-blur-md flex items-center justify-center p-6 text-text-primary">
        <div className="bg-surface border border-border-subtle rounded-lg p-8 max-w-md w-full text-center font-sans">
          <p className="text-danger text-sm font-medium mb-4">Unable to load exam data.</p>
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-border-subtle hover:border-border-strong rounded-md text-xs text-text-secondary hover:text-text-primary transition-all cursor-pointer font-sans"
          >
            Close
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
    <div className="fixed inset-0 z-50 bg-base/90 backdrop-blur-md flex justify-center p-0 sm:p-6 overflow-y-auto">
      <div className="bg-surface border border-border-subtle rounded-lg w-full max-w-4xl relative z-10 flex flex-col font-sans h-full sm:h-auto sm:max-h-[90vh] overflow-hidden">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 flex justify-between items-center border-b border-border-subtle p-4 sm:p-6 bg-surface/95 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`h-2 w-2 rounded-full ${isSubmitted ? 'bg-violet' : 'bg-cyan'}`} />
              <p className={`text-xs font-sans font-semibold uppercase tracking-wider ${isSubmitted ? 'text-violet' : 'text-cyan'}`}>
                {isSubmitted ? 'Mock Exam Completed' : 'Mock Exam in Progress'}
              </p>
            </div>
            <h2 className="text-base font-sans font-bold text-text-primary truncate max-w-xs sm:max-w-md">
              {examData.subject || 'Mock Exam'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {!isSubmitted ? (
              <div className={`font-mono font-semibold text-sm flex items-center gap-1.5 px-3 py-1.5 rounded border ${
                timeLeft < 300 
                  ? 'text-danger bg-danger/10 border-danger/30 animate-pulse' 
                  : 'text-cyan bg-cyan/10 border-cyan/30'
              }`}>
                <Clock className="w-4 h-4" />
                <span>Time Remaining: {formatTime(timeLeft)}</span>
              </div>
            ) : (
              <button 
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary font-sans text-xs font-medium px-3 py-1.5 border border-border-subtle hover:border-border-strong rounded-md transition-all cursor-pointer"
              >
                Exit Exam
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {!isSubmitted ? (
            /* EXAM MODE */
            <div className="space-y-10">
              {examData.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-6">
                  <div className="border-b border-border-subtle pb-3">
                    <h3 className="text-base font-sans font-bold text-text-primary flex items-center gap-2">
                      <span className="text-cyan bg-cyan/10 px-2 py-0.5 text-xs font-semibold rounded">Section {sIdx + 1}</span>
                      <span>{section.sectionName}</span>
                    </h3>
                    <p className="text-xs text-text-secondary font-sans mt-1">
                      {section.instructions}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-surface-inset border border-border-subtle rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
                          <span className="text-xs font-sans text-text-secondary font-semibold">
                            Question {qIdx + 1}
                          </span>
                          <span className="bg-surface border border-border-subtle text-text-tertiary px-2 py-0.5 text-xs font-sans font-medium rounded">
                            {q.type}
                          </span>
                        </div>
                        
                        <p className="text-gray-100 dark:text-white text-lg font-medium leading-relaxed font-sans">
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
                                    className={`w-full text-left p-3 rounded-md border font-sans text-xs transition-all flex items-center gap-3 cursor-pointer ${
                                      isSelected
                                        ? 'bg-cyan/15 border-cyan text-text-primary'
                                        : 'bg-surface border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-semibold shrink-0 ${
                                      isSelected 
                                        ? 'border-cyan text-cyan bg-cyan/10' 
                                        : 'border-border-subtle text-text-tertiary'
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
                              className="w-full bg-surface border border-border-subtle text-text-primary rounded-md px-4 py-3 font-sans text-xs focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/50 transition-all placeholder:text-text-tertiary min-h-[140px]"
                              placeholder="Write your detailed response..."
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
              <div className="bg-surface-inset border border-border-subtle rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-sans font-bold text-text-primary mb-1">
                    Exam Completed
                  </h3>
                  <p className="text-xs text-text-secondary font-sans leading-relaxed">
                    Time Elapsed: {formatTime((examData.durationMinutes * 60) - timeLeft)} <br/>
                    Subjective responses logged for review.
                  </p>
                </div>
                <div className="shrink-0 text-center sm:text-right border-l sm:border-l border-border-subtle pl-0 sm:pl-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0">
                  <span className="text-xs font-sans text-text-secondary block mb-1">Exam Score</span>
                  <span className="text-3xl font-bold font-mono text-cyan">
                    {score.correct} <span className="text-text-tertiary">/</span> {score.total}
                  </span>
                  <span className="text-xs text-text-secondary font-sans block mt-1">
                    ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% Efficiency)
                  </span>
                </div>
              </div>

              {examData.sections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  <h4 className="text-xs font-sans font-semibold text-text-secondary border-b border-border-subtle pb-2">
                    Section {sIdx + 1}: {section.sectionName}
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
                        <div key={qIdx} className="border border-border-subtle bg-surface-inset rounded-lg p-5 space-y-3 relative overflow-hidden">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-sans text-text-secondary font-medium">Question {qIdx + 1}</span>
                            <span className="bg-surface border border-border-subtle text-text-tertiary px-1.5 py-0.5 text-xs font-sans font-medium rounded">
                              {q.type}
                            </span>
                            {isMcq && (
                              <span className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${
                                isCorrect 
                                  ? 'text-success border-success/30 bg-success/10' 
                                  : 'text-danger border-danger/30 bg-danger/10'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-text-primary font-medium leading-relaxed font-sans">{q.question}</p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans pt-1">
                            <div className="bg-surface p-2.5 rounded border border-border-subtle">
                              <span className="text-text-tertiary block text-xs mb-0.5">Your Answer</span>
                              <span className={`${isMcq ? (isCorrect ? 'text-success font-medium' : 'text-danger font-medium') : 'text-text-secondary'}`}>
                                {uAnswer || 'No response provided'}
                              </span>
                            </div>
                            {isMcq && (
                              <div className="bg-surface p-2.5 rounded border border-border-subtle">
                                <span className="text-text-tertiary block text-xs mb-0.5">Correct Answer</span>
                                <span className="text-success font-medium">{cAnswer}</span>
                              </div>
                            )}
                          </div>

                          {q.explanation && (
                            <div className="bg-cyan/5 border-l-2 border-l-cyan p-3 mt-2 text-xs leading-relaxed text-text-secondary font-sans rounded-r">
                              <span className="text-cyan font-semibold block mb-1">Explanation</span>
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
          <div className="border-t border-border-subtle p-4 sm:p-6 bg-surface text-right shrink-0">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-cyan text-text-on-accent hover:brightness-110 font-sans font-medium text-sm rounded-md transition-all shadow-sm cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MockExamPlayer;
