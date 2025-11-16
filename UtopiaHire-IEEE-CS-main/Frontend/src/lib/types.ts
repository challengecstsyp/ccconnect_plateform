// TypeScript types matching the FastAPI backend Pydantic models

export interface InterviewSettings {
  job_title: string;
  num_questions: number;
  soft_pct: number;
  initial_level: number;
  keywords: string[];
  language: string;
  profile_brief?: string;
}

export interface InterviewState {
  current_level: number;
  asked_count: number;
  recent_scores: number[];
}

export interface Subscores {
  correctness: number;
  depth: number;
  clarity: number;
  relevance: number;
}

export interface Decision {
  level_delta: number;
  reason: string;
}

export interface Evaluation {
  overall_score: number;
  subscores: Subscores;
  feedback: string;
  level_recommendation: string;
  level_adjustment: number;
  strengths: string[];
  improvements: string[];
}

export interface QuestionRecord {
  q_id: number;
  question_id?: string;
  text: string;
  type: "technical" | "soft";
  level: number;
  topics?: string[];
  estimated_time?: number;
  context?: string;
  candidate_answer?: string;
  evaluation?: Evaluation;
}

export interface InterviewSummary {
  overall_score: number;
  technical_score: number;
  soft_skills_score: number;
  final_level: number;
  questions_answered: number;
  strengths: string[];
  areas_for_improvement: string[];
  recommendation: string;
  completed_at: string;
}

export interface InterviewSession {
  interview_id: string;
  settings: InterviewSettings;
  state: InterviewState;
  questions: QuestionRecord[];
  summary?: InterviewSummary;
}

// API Response Types
export interface StartInterviewResponse {
  interview_id: string;
  current_level: number;
  asked_count: number;
  settings: InterviewSettings;
}

export interface NextQuestionResponse {
  q_id: number;
  text: string;
  type: "technical" | "soft";
  level: number;
  topics?: string[];
  estimated_time?: number;
  context?: string;
  interview_id: string;
}

export interface SubmitAnswerResponse {
  interview_id: string;
  evaluation: Evaluation;
  new_level: number;
  is_complete: boolean;
}
