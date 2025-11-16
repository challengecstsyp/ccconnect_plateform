/**
 * API client for Resume Reviewer FastAPI backend
 * Connects to the FastAPI backend running on port 8001
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_RESUME_REVIEWER_API_URL || 'http://localhost:8001';

class APIError extends Error {
  constructor(message, statusCode, details) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Extract CV from PDF/DOCX file
 * @param {File} file - Resume file
 * @returns {Promise<Object>} Extracted CV JSON
 */
export const extractCV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/extract/cv/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP ${response.status}: ${response.statusText}` };
      }
      const errorMessage = errorData.detail || 'Failed to extract CV';
      throw new APIError(errorMessage, response.status, errorData);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to extract CV');
  }
};

/**
 * Score CV using ATS scoring (without job description)
 * @param {Object} cvData - Extracted CV JSON
 * @returns {Promise<Object>} ATS score and rating
 */
export const scoreCV = async (cvData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/score/ats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cv_data: cvData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.detail || 'Failed to score CV', response.status, error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to score CV');
  }
};

/**
 * Score CV with job description
 * @param {Object} cvData - Extracted CV JSON
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} ATS score and rating
 */
export const scoreCVWithJobDescription = async (cvData, jobDescription) => {
  try {
    const response = await fetch(`${API_BASE_URL}/score/ats/job_description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_data: cvData,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.detail || 'Failed to score CV', response.status, error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to score CV');
  }
};

/**
 * Rewrite CV based on ATS rating
 * @param {Object} cvData - Extracted CV JSON
 * @param {Object} rating - ATS rating/score
 * @param {string} language - Language for rewriting (default: "english")
 * @returns {Promise<Object>} Rewritten CV
 */
export const rewriteCV = async (cvData, rating, language = 'english') => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite/cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_json: cvData,
        rating: rating,
        language: language,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.detail || 'Failed to rewrite CV', response.status, error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to rewrite CV');
  }
};

/**
 * Rewrite CV with job description
 * @param {Object} cvData - Extracted CV JSON
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Rewritten CV and new rating
 */
export const rewriteCVWithJobDescription = async (cvData, jobDescription) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite/cv/jd_description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_data: cvData,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.detail || 'Failed to rewrite CV', response.status, error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to rewrite CV');
  }
};

/**
 * Rewrite CV and generate PDF
 * @param {Object} cvData - Extracted CV JSON
 * @param {Object} rating - ATS rating/score
 * @param {string} language - Language for rewriting (default: "english")
 * @returns {Promise<Object>} Rewritten CV and PDF (base64 encoded)
 */
export const rewriteCVAndGeneratePDF = async (cvData, rating, language = 'english') => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite/cv/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_json: cvData, rating, language }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      throw new APIError(
        errorData.detail || errorData.message || 'Failed to rewrite CV and generate PDF',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to rewrite CV and generate PDF');
  }
};


/**
 * Rewrite CV with job description and generate PDF
 * @param {Object} cvData - Extracted CV JSON
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Rewritten CV, new rating, and PDF (base64 encoded)
 */
export const rewriteCVWithJDAndGeneratePDF = async (cvData, jobDescription) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite/cv/jd_description/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_data: cvData,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.detail || 'Failed to rewrite CV and generate PDF', response.status, error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to rewrite CV and generate PDF');
  }
};

/**
 * Health check
 * @returns {Promise<Object>} Health status
 */
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new APIError('Backend is not healthy', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Health check failed');
  }
};

/**
 * TEST: Rewrite CV and generate PDF (without Ollama - uses mock rewriting)
 * @param {Object} cvData - Extracted CV JSON
 * @param {Object} rating - ATS rating/score
 * @param {string} language - Language for rewriting (default: "english")
 * @returns {Promise<Object>} Rewritten CV and PDF (base64 encoded)
 */
export const testRewriteCVAndGeneratePDF = async (cvData, rating, language = 'english') => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite/cv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cv_json: cvData, rating, language }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: await response.text() };
      }
      throw new APIError(
        errorData.detail || errorData.message || 'Failed to rewrite CV and generate PDF',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to rewrite CV and generate PDF');
  }
};

/**
 * TEST: Rewrite CV with job description and generate PDF (without Ollama - uses mock rewriting)
 * @param {Object} cvData - Extracted CV JSON
 * @param {string} jobDescription - Job description text
 * @returns {Promise<Object>} Rewritten CV, new rating, and PDF (base64 encoded)
 */
export const testRewriteCVWithJDAndGeneratePDF = async (cvData, jobDescription) => {
  try {
    const response = await fetch(`${API_BASE_URL}/rewrite/cv/jd_description/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cv_data: cvData,
        job_description: jobDescription,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.detail || 'Failed to rewrite CV and generate PDF (test)', response.status, error);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new APIError(error.message || 'Failed to rewrite CV and generate PDF (test)');
  }
};

export { APIError };

