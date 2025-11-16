import axios from "axios";
import type {
  InterviewSettings,
  StartInterviewResponse,
  NextQuestionResponse,
  SubmitAnswerResponse,
  InterviewSummary,
} from "./types";

// Configure base URL - update this to match your FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout for LLM responses
});

// API Error Handler
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "APIError";
  }
}

const handleAPIError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.message;
    throw new APIError(message, error.response?.status, error.response?.data);
  }
  throw new APIError(error.message || "An unexpected error occurred");
};

// Start a new interview session
export const startInterview = async (
  settings: InterviewSettings
): Promise<StartInterviewResponse> => {
  try {
    const response = await api.post<StartInterviewResponse>("/start_interview", settings);
    return response.data;
  } catch (error) {
    return handleAPIError(error);
  }
};

// Get the next adaptive question
export const getNextQuestion = async (
  interviewId: string
): Promise<NextQuestionResponse> => {
  try {
    const response = await api.get<NextQuestionResponse>("/next_question", {
      params: { interview_id: interviewId },
    });
    return response.data;
  } catch (error) {
    return handleAPIError(error);
  }
};

// Submit an answer for evaluation
export const submitAnswer = async (
  interviewId: string,
  answer: string
): Promise<SubmitAnswerResponse> => {
  try {
    const response = await api.post<SubmitAnswerResponse>("/submit_answer", {
      interview_id: interviewId,
      answer,
    });
    return response.data;
  } catch (error) {
    return handleAPIError(error);
  }
};

// Get final interview summary
export const getSummary = async (interviewId: string): Promise<InterviewSummary> => {
  try {
    const response = await api.get<InterviewSummary>(`/summary/${interviewId}`);
    return response.data;
  } catch (error) {
    return handleAPIError(error);
  }
};

// Health check (optional, for testing backend connection)
export const healthCheck = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    return handleAPIError(error);
  }
};
