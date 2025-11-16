/**
 * API client for the AI Interviewer backend
 * Connects to FastAPI backend running on http://localhost:8000
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Make an API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      error.statusCode = response.status;
      throw error;
    }

    return await response.json();
  } catch (error) {
    // If it's already our custom error, rethrow it
    if (error.statusCode) {
      throw error;
    }
    
    // Network or other errors
    const networkError = new Error(
      error.message || 'Failed to connect to the backend server'
    );
    networkError.statusCode = 0;
    throw networkError;
  }
}

/**
 * Start a new interview session
 * @param {Object} settings - Interview settings
 * @param {string} settings.job_title - Target job title
 * @param {number} settings.num_questions - Number of questions
 * @param {number} settings.soft_pct - Soft skills percentage (0-1)
 * @param {number} settings.initial_level - Starting difficulty level (1-5)
 * @param {string[]} settings.keywords - Relevant keywords
 * @param {string} settings.language - Interview language (default: "en")
 * @param {string} [settings.profile_brief] - Optional profile summary
 * @returns {Promise<Object>} Interview response with interview_id and settings
 */
export async function startInterview(settings) {
  return apiRequest('/start_interview', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

/**
 * Get the next question for an interview
 * @param {string} interviewId - Interview session ID
 * @returns {Promise<Object>} Question data
 */
export async function getNextQuestion(interviewId) {
  return apiRequest(`/next_question?interview_id=${encodeURIComponent(interviewId)}`, {
    method: 'GET',
  });
}

/**
 * Submit an answer for evaluation
 * @param {string} interviewId - Interview session ID
 * @param {string} answer - The answer text
 * @returns {Promise<Object>} Evaluation response
 */
export async function submitAnswer(interviewId, answer) {
  return apiRequest('/submit_answer', {
    method: 'POST',
    body: JSON.stringify({
      interview_id: interviewId,
      answer: answer,
    }),
  });
}

/**
 * Get interview summary
 * @param {string} interviewId - Interview session ID
 * @returns {Promise<Object>} Interview summary
 */
export async function getSummary(interviewId) {
  return apiRequest(`/summary/${encodeURIComponent(interviewId)}`, {
    method: 'GET',
  });
}

/**
 * Get interview status
 * @param {string} interviewId - Interview session ID
 * @returns {Promise<Object>} Interview status
 */
export async function getStatus(interviewId) {
  return apiRequest(`/status/${encodeURIComponent(interviewId)}`, {
    method: 'GET',
  });
}

/**
 * Health check endpoint
 * @returns {Promise<Object>} Health status
 */
export async function healthCheck() {
  return apiRequest('/health', {
    method: 'GET',
  });
}
