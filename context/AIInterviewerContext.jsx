import React, { createContext, useContext, useState, useCallback } from 'react';

const AIInterviewerContext = createContext(null);

export const useAIInterviewer = () => {
  const context = useContext(AIInterviewerContext);
  if (!context) {
    throw new Error('useAIInterviewer must be used within AIInterviewerProvider');
  }
  return context;
};

export const AIInterviewerProvider = ({ children }) => {
  // Session data
  const [interviewId, setInterviewId] = useState(null);
  const [settings, setSettings] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(3);
  
  // Question flow
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Progress
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  
  // Evaluation
  const [lastEvaluation, setLastEvaluation] = useState(null);
  
  // Summary
  const [summary, setSummary] = useState(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addQuestionToHistory = useCallback((question) => {
    setQuestionHistory(prev => [...prev, question]);
  }, []);

  const setProgress = useCallback((current, total) => {
    setCurrentQuestionNumber(current);
    setTotalQuestions(total);
  }, []);

  const reset = useCallback(() => {
    setInterviewId(null);
    setSettings(null);
    setCurrentLevel(3);
    setCurrentQuestion(null);
    setQuestionHistory([]);
    setCurrentAnswer('');
    setCurrentQuestionNumber(0);
    setTotalQuestions(10);
    setLastEvaluation(null);
    setSummary(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const value = {
    // State
    interviewId,
    settings,
    currentLevel,
    currentQuestion,
    questionHistory,
    currentAnswer,
    currentQuestionNumber,
    totalQuestions,
    lastEvaluation,
    summary,
    isLoading,
    error,
    
    // Actions
    setInterviewId,
    setSettings: (newSettings) => {
      setSettings(newSettings);
      if (newSettings) {
        setCurrentLevel(newSettings.initial_level || 3);
        setTotalQuestions(newSettings.num_questions || 10);
      }
    },
    setCurrentQuestion,
    setCurrentAnswer,
    addQuestionToHistory,
    setLastEvaluation,
    setCurrentLevel,
    setProgress,
    setSummary,
    setIsLoading,
    setError,
    reset,
  };

  return (
    <AIInterviewerContext.Provider value={value}>
      {children}
    </AIInterviewerContext.Provider>
  );
};


