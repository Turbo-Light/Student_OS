import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

const QuizPlayer = ({ quizData, onClose, subject, dayNumber }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (!quizData || quizData.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-base/90 backdrop-blur-md flex items-center justify-center p-6 text-text-primary">
        <div className="bg-surface border border-border-subtle rounded-lg p-8 max-w-md w-full text-center font-sans">
          <p className="text-danger text-sm font-medium mb-4">No quiz questions found.</p>
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
    <div id="quiz-modal" className="fixed inset-0 z-50 bg-base/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-surface border border-border-subtle rounded-lg w-full max-w-3xl relative z-10 overflow-hidden font-sans">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-border-subtle p-4 sm:p-6 bg-surface">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-violet" />
              <p className="text-xs font-sans text-violet font-semibold uppercase tracking-wider">
                Daily Quiz
              </p>
            </div>
            <h2 className="text-base font-sans text-text-primary font-bold">
              {subject ? `${subject} - Day ${dayNumber}` : `Daily Practice Quiz`}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary text-xs font-sans px-3 py-1.5 border border-border-subtle hover:border-border-strong rounded-md transition-all cursor-pointer"
          >
            Close
          </button>
        </header>

        {!isSubmitted ? (
          /* QUIZ TAKER INTERFACE */
          <div className="p-5 sm:p-8 space-y-6">
            
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-sans text-text-secondary">
                <span>Question {currentQuestionIndex + 1} of {quizData.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / quizData.length) * 100)}% Complete</span>
              </div>
              <div className="h-1.5 bg-surface-inset rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-violet transition-all duration-300 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Display Card */}
            <div className="bg-surface-inset border border-border-subtle rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-violet/10 text-violet border border-violet/30 px-2 py-0.5 text-xs font-sans font-semibold rounded-sm">
                  {currentQuestion.type}
                </span>
              </div>
              <p id="quiz-question-text" className="text-gray-100 dark:text-white text-lg font-medium leading-relaxed font-sans">
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
                        className={`w-full text-left p-4 rounded-md border font-sans text-xs transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-violet/15 border-violet text-text-primary'
                            : 'bg-surface-inset border-border-subtle text-text-secondary hover:border-border-strong hover:text-text-primary'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-semibold ${
                          isSelected 
                            ? 'border-violet text-violet bg-violet/10' 
                            : 'border-border-subtle text-text-tertiary'
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
                  <label className="text-xs font-sans font-medium text-text-secondary block">Your Response</label>
                  <textarea
                    value={userAnswers[currentQuestionIndex] || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    className="w-full bg-surface-inset border border-border-subtle text-text-primary rounded-md px-4 py-3 font-sans text-xs focus:outline-none focus:border-violet/50 focus:ring-1 focus:ring-violet/50 transition-all placeholder:text-text-tertiary min-h-[140px]"
                    placeholder="Provide your response..."
                  />
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center border-t border-border-subtle pt-6">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-border-subtle text-text-secondary rounded-md disabled:opacity-30 disabled:cursor-not-allowed hover:border-border-strong hover:text-text-primary font-sans text-xs font-medium transition-all cursor-pointer"
              >
                Back
              </button>

              {isLastQuestion ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-violet text-text-on-accent hover:brightness-110 font-sans font-medium text-xs rounded-md transition-all shadow-sm cursor-pointer"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 border border-violet/30 text-violet hover:border-violet hover:text-violet-tint rounded-md font-sans text-xs font-medium transition-all cursor-pointer"
                >
                  Next
                </button>
              )}
            </div>

          </div>
        ) : (
          /* RESULTS DISPLAY SCREEN */
          <div className="p-5 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
            
            {/* Scoreboard Panel */}
            <div className="bg-surface-inset border border-border-subtle rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-sans font-bold text-text-primary mb-1">
                  Evaluation Finished
                </h3>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  Multiple-choice responses have been processed.<br/>
                  Short answers saved for your study history.
                </p>
              </div>
              <div className="shrink-0 text-center sm:text-right border-l sm:border-l border-border-subtle pl-0 sm:pl-8 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0">
                <span className="text-xs font-sans text-text-secondary block mb-1">Quiz Score</span>
                <span className="text-3xl font-bold font-mono text-violet">
                  {score.correct} <span className="text-text-tertiary">/</span> {score.total}
                </span>
                <span className="text-xs text-text-secondary font-sans block mt-1">
                  ({score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}% Efficiency)
                </span>
              </div>
            </div>

            {/* Questions Breakdown Sector */}
            <div className="space-y-4">
              <h4 className="text-xs font-sans font-semibold text-text-secondary border-b border-border-subtle pb-2">
                Question Breakdown
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
                      className="border border-border-subtle bg-surface-inset rounded-lg p-5 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-sans text-text-secondary font-medium">Question {idx + 1}</span>
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

                      <p className="text-xs text-gray-100 dark:text-white font-medium leading-relaxed font-sans">{q.question}</p>

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
                        <div className="bg-violet/5 border-l-2 border-l-violet p-3 mt-2 text-xs leading-relaxed text-text-secondary font-sans rounded-r">
                          <span className="text-violet font-semibold block mb-1">Explanation</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Exit Action Panel */}
            <div className="border-t border-border-subtle pt-6 text-center">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-surface-raised border border-border-subtle hover:border-border-strong text-text-primary font-sans text-xs font-medium rounded-md transition-all cursor-pointer"
              >
                Close Quiz
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default QuizPlayer;
