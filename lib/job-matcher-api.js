/**
 * API client for the Job Matcher backend
 * Connects to FastAPI backend running on http://localhost:8001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_JOB_MATCHER_API_URL || 'http://localhost:8001';

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
      error.message || 'Failed to connect to the job matcher backend server'
    );
    networkError.statusCode = 0;
    throw networkError;
  }
}

/**
 * Match CV text to job descriptions
 * @param {string} cvText - CV text to match
 * @param {number} topN - Number of top matches to return (default: 5)
 * @returns {Promise<Object>} Match response with matches array
 */
export async function matchCvToJobs(cvText, topN = 5) {
  return apiRequest('/match/cv-to-jobs', {
    method: 'POST',
    body: JSON.stringify({
      text: cvText,
      top_n: topN,
    }),
  });
}

/**
 * Match job description to CVs
 * @param {string} jobText - Job description text to match
 * @param {number} topN - Number of top matches to return (default: 5)
 * @returns {Promise<Object>} Match response with matches array
 */
export async function matchJobToCvs(jobText, topN = 5) {
  return apiRequest('/match/job-to-cvs', {
    method: 'POST',
    body: JSON.stringify({
      text: jobText,
      top_n: topN,
    }),
  });
}

/**
 * Match text to jobs (alias for matchCvToJobs)
 * @param {string} text - Text to match
 * @param {number} topN - Number of top matches to return (default: 5)
 * @returns {Promise<Object>} Match response with matches array
 */
export async function matchTextToJobs(text, topN = 5) {
  return apiRequest('/match/text-to-jobs', {
    method: 'POST',
    body: JSON.stringify({
      text: text,
      top_n: topN,
    }),
  });
}

/**
 * Match text to CVs (alias for matchJobToCvs)
 * @param {string} text - Text to match
 * @param {number} topN - Number of top matches to return (default: 5)
 * @returns {Promise<Object>} Match response with matches array
 */
export async function matchTextToCvs(text, topN = 5) {
  return apiRequest('/match/text-to-cvs', {
    method: 'POST',
    body: JSON.stringify({
      text: text,
      top_n: topN,
    }),
  });
}

/**
 * Initialize matcher with data from database
 * @param {string} [userId] - Optional user ID to filter CVs
 * @returns {Promise<Object>} Initialization response
 */
export async function initializeMatcher(userId = null) {
  const params = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
  return apiRequest(`/initialize${params}`, {
    method: 'POST',
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


