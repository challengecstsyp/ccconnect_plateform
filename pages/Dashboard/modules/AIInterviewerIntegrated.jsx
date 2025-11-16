'use client'
import React, { useState, useEffect } from 'react';
import { Bot, Send, Loader2, X } from 'lucide-react';
import { AIInterviewerProvider, useAIInterviewer } from '@/context/AIInterviewerContext';
import { startInterview, getNextQuestion, submitAnswer, getSummary } from '@/lib/ai-interviewer-api';
import SetupForm from '@/components/ai-interviewer/SetupForm';
import { QuestionCard, LevelChangeIndicator } from '@/components/ai-interviewer/QuestionCard';
import { ProgressIndicator } from '@/components/ai-interviewer/ProgressIndicator';
import { ScoreBreakdown } from '@/components/ai-interviewer/ScoreBreakdown';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const AIInterviewerContent = () => {
  const [step, setStep] = useState('setup'); // 'setup', 'interview', 'summary'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    interviewId,
    settings,
    currentQuestion,
    currentAnswer,
    currentQuestionNumber,
    totalQuestions,
    currentLevel,
    lastEvaluation,
    isLoading,
    error,
    setInterviewId,
    setSettings,
    setCurrentQuestion,
    setCurrentAnswer,
    setLastEvaluation,
    setCurrentLevel,
    setProgress,
    addQuestionToHistory,
    setIsLoading,
    setError,
  } = useAIInterviewer();

  const handleStartInterview = async (interviewSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Starting interview with settings:', interviewSettings);
      const response = await startInterview(interviewSettings);
      console.log('Interview started successfully:', response);
      setInterviewId(response.interview_id);
      setSettings(response.settings);
      setProgress(0, response.settings.num_questions);
      setStep('interview');
      await loadNextQuestion(response.interview_id);
    } catch (error) {
      console.error('Failed to start interview:', error);
      let errorMessage = error.message || 'Failed to connect to the interview server.';
      
      // If it's a validation error, show more details
      if (error.statusCode === 422) {
        errorMessage = `Validation Error: ${error.message}\n\nPlease check that all fields are filled correctly.`;
      } else if (error.statusCode === 500) {
        errorMessage = `Server Error: ${error.message}\n\nPlease check the backend logs for more details.`;
      } else if (!error.statusCode) {
        errorMessage = `${error.message}\n\nPlease ensure the FastAPI backend is running on http://localhost:8000`;
      }
      
      setError(errorMessage);
      // Only show alert for connection errors, not validation errors
      if (!error.statusCode || error.statusCode >= 500) {
        alert(`Error: ${errorMessage}\n\nPlease ensure:\n1. The FastAPI backend is running (cd backend-ai-interviewer && python main.py)\n2. The backend is accessible at http://localhost:8000\n3. Check the browser console for more details`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadNextQuestion = async (id = interviewId) => {
    if (!id) return;
    
    setIsLoading(true);
    setShowFeedback(false);
    setError(null);
    try {
      const response = await getNextQuestion(id);
      setCurrentQuestion({
        q_id: response.q_id,
        text: response.text,
        type: response.type,
        level: response.level,
        topics: response.topics,
        estimated_time: response.estimated_time,
        context: response.context,
      });
      setProgress(response.q_id, settings?.num_questions || totalQuestions || 10);
      setCurrentAnswer('');
    } catch (error) {
      setError(error.message);
      console.error('Failed to load question:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentAnswer.trim() || !interviewId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await submitAnswer(interviewId, currentAnswer);
      
      setLastEvaluation(response.evaluation);
      setCurrentLevel(response.new_level);
      setShowFeedback(true);

      if (currentQuestion) {
        addQuestionToHistory({
          ...currentQuestion,
          evaluation: response.evaluation,
        });
      }

      if (response.is_complete) {
        setTimeout(() => {
          loadSummary();
        }, 3000);
      } else {
        setTimeout(() => {
          setCurrentAnswer('');
          loadNextQuestion();
        }, 2000);
      }
    } catch (error) {
      setError(error.message);
      console.error('Failed to submit answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSummary = async () => {
    if (!interviewId) return;
    
    setIsLoading(true);
    try {
      const summary = await getSummary(interviewId);
      // Store summary and navigate to summary view
      setStep('summary');
    } catch (error) {
      setError(error.message);
      console.error('Failed to load summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    loadNextQuestion();
  };

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const { healthCheck } = await import('@/lib/ai-interviewer-api');
        await healthCheck();
        console.log('Backend is connected');
      } catch (error) {
        console.warn('Backend not available:', error);
        setError('Backend server is not running. Please start the FastAPI backend first.');
      }
    };
    if (step === 'setup') {
      checkBackend();
    }
  }, [step, setError]);

  // Render Setup
  if (step === 'setup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-2xl space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-semibold">⚠️ Backend Connection Error:</p>
              <p className="text-sm mt-1">{error}</p>
              <div className="text-xs mt-3 space-y-1">
                <p className="font-semibold">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Open a terminal and navigate to: <code className="bg-red-100 px-1 rounded">backend-ai-interviewer</code></li>
                  <li>Activate virtual environment: <code className="bg-red-100 px-1 rounded">venv\Scripts\activate</code></li>
                  <li>Run: <code className="bg-red-100 px-1 rounded">python main.py</code></li>
                  <li>Wait for "Application startup complete" message</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </div>
          )}
          <SetupForm 
            onSubmit={handleStartInterview} 
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  // Render Summary (placeholder for now)
  if (step === 'summary') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card title="Interview Complete!">
            <p className="text-gray-600 mb-4">
              Your interview has been completed. Summary feature coming soon.
            </p>
            <Button onClick={() => setStep('setup')}>
              Start New Interview
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Render Interview
  if (!currentQuestion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-gray-600">Loading your interview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Bot className="w-7 h-7 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            AI Interview Simulator
          </h1>
        </div>

        {/* Progress */}
        <ProgressIndicator
          current={currentQuestionNumber}
          total={totalQuestions}
          currentLevel={currentLevel}
        />

        {/* Question */}
        <QuestionCard question={currentQuestion} />

        {/* Answer Input */}
        {!showFeedback && (
          <Card>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Type your detailed answer here..."
                  className="w-full min-h-[200px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setStep('setup')}
                  primary={false}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !currentAnswer.trim()}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Answer
                      <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Feedback */}
        {showFeedback && lastEvaluation && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <LevelChangeIndicator delta={lastEvaluation.level_adjustment} />
            </div>

            <ScoreBreakdown evaluation={lastEvaluation} />

            {!lastEvaluation.is_complete && (
              <div className="flex justify-center">
                <Button onClick={handleNext}>
                  Continue to Next Question
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AIInterviewerIntegrated = () => {
  return (
    <AIInterviewerProvider>
      <AIInterviewerContent />
    </AIInterviewerProvider>
  );
};

export default AIInterviewerIntegrated;

