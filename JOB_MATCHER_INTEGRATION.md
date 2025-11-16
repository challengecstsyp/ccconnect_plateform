# Job Matcher Integration Guide

This document explains how the Job Matcher has been integrated into the UtopiaHire application.

## Overview

The Job Matcher consists of:
- **Backend**: FastAPI Python backend (`backend-job-matcher/`)
- **Frontend**: React components integrated into the Next.js app

## Architecture

### Backend (FastAPI)
- Location: `backend-job-matcher/`
- Port: `8001` (different from AI Interviewer which uses 8000)
- API Base URL: `http://localhost:8001`

### Frontend Components
- API Client: `lib/job-matcher-api.js`
- Main Component: `pages/Dashboard/modules/JobMatcher.jsx`
- API Routes:
  - `app/api/jobs/route.js` - Fetch job listings
  - `app/api/resume/me/route.js` - Get user's resume

## Setup

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend-job-matcher
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file (optional, for custom MongoDB URI):
```env
MONGODB_URI=mongodb://localhost:27017/utopiahire
ENVIRONMENT=development
```

5. Run the backend:
```bash
python main.py
```

The backend will start on `http://localhost:8001`

**Note:** The first run will download the sentence-transformers model (about 80MB), which may take a few minutes.

### 2. Frontend Configuration

1. Set the API URL in your environment variables (`.env.local`):
```env
NEXT_PUBLIC_JOB_MATCHER_API_URL=http://localhost:8001
```

2. The frontend will automatically connect to the backend when you use the Job Matcher feature.

### 3. Using the Job Matcher

1. **Add your CV**: Go to your profile and add your resume/CV
2. **Navigate to Jobs**: Go to Dashboard > Jobs
3. **Load Jobs**: The page will automatically load active job listings from the database
4. **Find Matches**: Click "Trouver mes matches" to use AI matching to find jobs that match your CV
5. **View Results**: Jobs are sorted by match score, and each job card shows the match percentage

## Features

### Matching Modes
- **CV to Jobs**: Match your CV text to job descriptions (primary use case)
- **Job to CVs**: Match a job description to CVs (for recruiters)
- **Text to Jobs**: Match any text to jobs
- **Text to CVs**: Match any text to CVs

### Match Score Display
- Each matched job shows a percentage match score
- Jobs are automatically sorted by match score (highest first)
- Match scores are calculated using semantic similarity (cosine similarity of embeddings)

## API Endpoints

### Backend (FastAPI - Port 8001)

- `POST /match/cv-to-jobs` - Match CV text to job descriptions
- `POST /match/job-to-cvs` - Match job description to CVs
- `POST /match/text-to-jobs` - Match text to jobs
- `POST /match/text-to-cvs` - Match text to CVs
- `POST /initialize` - Initialize matcher with database data
- `GET /health` - Health check

### Frontend API Routes (Next.js)

- `GET /api/jobs` - Fetch active job listings
- `GET /api/resume/me` - Get current user's resume

## Data Loading

The backend automatically loads:
- **Jobs**: From the `joblistings` MongoDB collection (status: "active")
- **CVs**: From the `resumes` MongoDB collection (all users or filtered by user_id)

## Matching Model

The service uses the sentence-transformers model `all-MiniLM-L6-v2` for semantic matching. This model:
- Is lightweight and fast
- Provides good semantic similarity for job matching
- Automatically downloads on first use

## Troubleshooting

### Backend not starting
- Check if port 8001 is available
- Ensure MongoDB is running and accessible
- Check that all dependencies are installed

### No matches found
- Ensure jobs exist in the database with status "active"
- Check that your CV is properly formatted
- Try initializing the matcher manually: `POST /initialize`

### Match scores seem low
- This is normal - semantic matching scores are typically between 0.3-0.8
- Scores above 0.5 usually indicate good matches
- The model compares semantic meaning, not exact keyword matches

## Future Enhancements

- Caching of embeddings for faster repeated queries
- Support for multiple matching models
- Job recommendation history
- User preference-based filtering
- Integration with job application tracking


