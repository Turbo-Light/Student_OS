import React, { useState } from 'react';

const QuizPlayer = ({ quizData, onClose, subject, dayNumber }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (!quizData || quizData.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-md flex items-center justify-center p-6 text-neutral-100">
        <div className="bg-neutral-950 border border-neutral-800 p-8 max-w-md w-full text-center font-sans">
          <p className="font-mono text-rose-500 uppercase tracking-widest text-sm mb-4">[ERROR: EMPTY QUIZ DATA]</p>
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-neutral-700 hover:border-neutral-500 font-mono text-xs text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
          >
            [CLOSE MATRIX]
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.length - 1;

  const handleAnswerSelect = (option) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  const handleTextAnswerChange = (val) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: val
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate MCQ Score
    let mcqCorrect = 0;
    let mcqTotal = 0;

    quizData.forEach((q, idx) => {
      if (q.type === 'MCQ') {
        mcqTotal += 1;
        const userAnswer = userAnswers[idx];
        const correctAnswer = q.correctAnswer;
        
        const isCorrect = userAnswer && correctAnswer && (
          userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase() || 
          userAnswer.trim().charAt(0).toLowerCase() === correctAnswer.trim().charAt(0).toLowerCase()
        );
        if (isCorrect) {
          mcqCorrect += 1;
        }
      }
    });

    setScore({ correct: mcqCorrect, total: mcqTotal });
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[200px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="bg-neutral-950/90 border border-neutral-800/80 w-full max-w-3xl relative z-10 shadow-2xl overflow-hidden font-sans">
        
        {/* Dynamic scan line effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/50 shadow-[0_0_10px_#818cf8] animate-pulse" />

        {/* Header */}
        <header className="flex justify-between items-center border-b border-neutral-800 p-4 sm:p-6 bg-neutral-950">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_6px_#818cf8]" />
              <p className="text-[10px] uppercase tracking-[0.25em] font-mono text-indigo-400 font-bold">
                EVALUATION // QUIZ_ENGINE
              </p>
            </div>
            <h2 className="text-sm font-mono text-neutral-300 font-bold uppercase tracking-wider">
              {subject ? `${subject} - DAY ${dayNumber}` : `DAILY DIRECTIVE QUIZ`}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 font-mono text-xs px-3 py-1 border border-neutral-800 hover:border-neutral-700 bg-neutral-900/40 transition-all cursor-pointer"
          >
            [TERMINATE]
          </button>
        </header>

        {!isSubmitted ? (
          /* QUIZ TAKER INTERFACE */
          <div className="p-5 sm:p-8 space-y-6">
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 tracking-wider">
                <span>QUESTION {currentQuestionIndex + 1} OF {quizData.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / quizData.length) * 100)}% COMPLETE</span>
              </div>
              <div className="h-1 bg-neutral-900 overflow-hidden relative">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_8px_#818cf8]"
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Display Card */}
            <div className="bg-[#0b0d13] border border-neutral-800 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase">
                  {currentQuestion.type}
                </span>
              </div>
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-sans">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer Options Zone */}
            <div className="space-y-3 min-h-[180px]">
              {currentQuestion.type === 'MCQ' ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = userAnswers[currentQuestionIndex] === option;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full text-left p-4 border font-mono text-xs transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        <span className={`w-4 h-4 border flex items-center justify-center text-[9px] font-bold ${
                          isSelected 
                            ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
                            : 'border-neutral-700 text-neutral-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-sans text-xs">{option}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">INPUT RESPONSE</label>
                  <textarea
                    value={userAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    className="w-full bg-[#0b0d13] border border-neutral-800 text-neutral-200 px-4 py-3 font-mono text-xs focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-neutral-700 min-h-[140px]"
                    placeholder="Provide your detailed conceptual or coding response..."
                  />
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center border-t border-neutral-800/60 pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-neutral-800 text-neutral-500 disabled:opacity-30 disabled:cursor-not-allowed hover:border-neutral-700 hover:text-neutral-300 font-mono text-xs transition-all cursor-pointer"
              >
                &lt; BACK
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/60 text-indigo-400 hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] font-mono text-xs font-bold tracking-wider transition-all cursor-pointer"
                >
                  [SUBMIT DIRECTIVE]
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 border border-indigo-500/30 text-indigo-400 hover:border-indigo-500 hover:text-indigo-300 font-mono text-xs transition-all cursor-pointer"
                >
                  NEXT &gt;
                </button>
              )}
            </div>

          </div>
        ) : (
          /* RESULTS DISPLAY SCREEN */
          <div className="p-5 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Scoreboard Panel */}
            <div className="bg-[#0b0d13] border border-neutral-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-neutral-100 mb-1">
                  Evaluation Finished
                </h3>
                <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider leading-relaxed">
                  Multiple-choice responses have been processed.<br/>
                  Short answers saved for cognitive roadmap indexing.
                </p>
              </div>
              <div className="shrink-0 text-center sm:text-right border-l sm:border-l border-neutral-800 pl-0 sm:pl-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0">
                <span className="text-[10px] font-mono text-neutral-500 block uppercase tracking-wider mb-1">MCQ SCORE MATRIX</span>
                <span className="text-3xl font-black font-mono text-indigo-400 tracking-wider">
                  {score.correct} <span className="text-neutral-600">/</span> {score.total}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                  ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% EFFICIENCY)
                </span>
              </div>
            </div>

            {/* Questions Breakdown Sector */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">
                QUESTION_EVALUATION_REPORT
              </h4>
              
              <div className="space-y-4">
                {quizData.map((q, idx) => {
                  const isMcq = q.type === 'MCQ';
                  const uAnswer = userAnswers[idx];
                  const cAnswer = q.correctAnswer;
                  const isCorrect = isMcq && uAnswer && cAnswer && (
                    uAnswer.trim().toLowerCase() === cAnswer.trim().toLowerCase() || 
                    uAnswer.trim().charAt(0).toLowerCase() === cAnswer.trim().charAt(0).toLowerCase()
                  );

                  return (
                    <div 
                      key={idx}
                      className="border border-neutral-800 bg-[#090b0f] p-5 space-y-3 relative overflow-hidden"
                    >
                      {isMcq && (
                        <div className={`absolute top-0 left-0 w-1 h-full ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-500">#{idx + 1}</span>
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
                        <div className="bg-indigo-950/10 border-l border-indigo-500/30 p-3 mt-2 text-[10px] leading-relaxed text-neutral-400 font-mono">
                          <span className="text-indigo-400 font-bold block mb-1">AI ANALYSIS //</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exit Action Panel */}
            <div className="border-t border-neutral-800/60 pt-6 text-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100 font-mono text-xs tracking-wider transition-all cursor-pointer"
              >
                [CLOSE SCORESHEET]
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default QuizPlayer;
