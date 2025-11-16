import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  InterviewSettings,
  QuestionRecord,
  Evaluation,
  InterviewSummary,
} from "./types";

interface InterviewStore {
  // Session data
  interviewId: string | null;
  settings: InterviewSettings | null;
  currentLevel: number;
  
  // Question flow
  currentQuestion: QuestionRecord | null;
  questionHistory: QuestionRecord[];
  currentAnswer: string;
  
  // Progress
  currentQuestionNumber: number;
  totalQuestions: number;
  
  // Evaluation
  lastEvaluation: Evaluation | null;
  
  // Summary
  summary: InterviewSummary | null;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setInterviewId: (id: string) => void;
  setSettings: (settings: InterviewSettings) => void;
  setCurrentQuestion: (question: QuestionRecord) => void;
  setCurrentAnswer: (answer: string) => void;
  addQuestionToHistory: (question: QuestionRecord) => void;
  setLastEvaluation: (evaluation: Evaluation) => void;
  setCurrentLevel: (level: number) => void;
  setProgress: (current: number, total: number) => void;
  setSummary: (summary: InterviewSummary) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  interviewId: null,
  settings: null,
  currentLevel: 1,
  currentQuestion: null,
  questionHistory: [],
  currentAnswer: "",
  currentQuestionNumber: 0,
  totalQuestions: 0,
  lastEvaluation: null,
  summary: null,
  isLoading: false,
  error: null,
};

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setInterviewId: (id) => set({ interviewId: id }),
      
      setSettings: (settings) => 
        set({ 
          settings, 
          currentLevel: settings.initial_level,
          totalQuestions: settings.num_questions,
        }),
      
      setCurrentQuestion: (question) => 
        set({ currentQuestion: question }),
      
      setCurrentAnswer: (answer) => 
        set({ currentAnswer: answer }),
      
      addQuestionToHistory: (question) =>
        set((state) => ({
          questionHistory: [...state.questionHistory, question],
        })),
      
      setLastEvaluation: (evaluation) =>
        set({ lastEvaluation: evaluation }),
      
      setCurrentLevel: (level) =>
        set({ currentLevel: level }),
      
      setProgress: (current, total) =>
        set({
          currentQuestionNumber: current,
          totalQuestions: total,
        }),
      
      setSummary: (summary) =>
        set({ summary }),
      
      setLoading: (loading) =>
        set({ isLoading: loading }),
      
      setError: (error) =>
        set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: "interview-storage",
      partialize: (state) => ({
        interviewId: state.interviewId,
        settings: state.settings,
        currentLevel: state.currentLevel,
        questionHistory: state.questionHistory,
        currentQuestionNumber: state.currentQuestionNumber,
        totalQuestions: state.totalQuestions,
      }),
    }
  )
);
