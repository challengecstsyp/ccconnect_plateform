# AI Interviewer Integration Guide

This document explains how the AI Interviewer has been integrated into the UtopiaHire application.

## Overview

The AI Interviewer consists of:
- **Backend**: FastAPI Python backend (`backend-ai-interviewer/`)
- **Frontend**: React components integrated into the Next.js app

## Architecture

### Backend (FastAPI)
- Location: `backend-ai-interviewer/`
- Port: `8000` (default)
- API Base URL: `http://localhost:8000`

### Frontend Components
- API Client: `lib/ai-interviewer-api.js`
- Context Provider: `context/AIInterviewerContext.jsx`
- Components: `components/ai-interviewer/`
- Main Component: `pages/Dashboard/modules/AIInterviewerIntegrated.jsx`

## Setup

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend-ai-interviewer
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

4. Create a `.env` file (optional, for Ollama API):
```env
OLLAMA_API_KEY=your_key_here
OLLAMA_MODEL=gpt-oss:120b
```

5. Run the backend:
```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Configuration

1. Set the API URL in your environment variables (`.env.local`):
```env
NEXT_PUBLIC_AI_INTERVIEWER_API_URL=http://localhost:8000
```

2. Install any missing dependencies (if needed):
```bash
npm install
```

### 3. Using the Integrated Component

The integrated AI Interviewer component is available at:
- Component: `pages/Dashboard/modules/AIInterviewerIntegrated.jsx`

To use it, you can either:
1. Replace the existing `AIInterviewer.jsx` component
2. Create a new route that uses `AIInterviewerIntegrated`

Example usage in a Next.js page:
```jsx
import AIInterviewerIntegrated from '@/pages/Dashboard/modules/AIInterviewerIntegrated';

export default function InterviewerPage() {
  return <AIInterviewerIntegrated />;
}
```

## Features

### Interview Flow
1. **Setup**: Configure job title, number of questions, difficulty level, etc.
2. **Interview**: Answer questions with real-time evaluation
3. **Summary**: View comprehensive performance report

### Adaptive Difficulty
- Questions adjust based on your performance
- Level increases for good answers, decreases for poor ones
- Range: Level 1 (Junior) to Level 5 (Expert)

### Question Types
- **Technical**: Programming, algorithms, system design, etc.
- **Soft Skills**: Communication, leadership, problem-solving, etc.

## API Integration

The frontend communicates with the FastAPI backend through:
- `lib/ai-interviewer-api.js` - API client functions
- All API calls use fetch with proper error handling

## File Structure

```
backend-ai-interviewer/
├── main.py                 # FastAPI application entry point
├── agents/                 # AI agents (interviewer, evaluator)
├── models/                 # Pydantic models
├── services/               # Business logic
├── utils/                  # Configuration and utilities
└── requirements.txt        # Python dependencies

lib/
└── ai-interviewer-api.js    # API client

context/
└── AIInterviewerContext.jsx # React context for state management

components/
└── ai-interviewer/
    ├── SetupForm.jsx
    ├── QuestionCard.jsx
    ├── ProgressIndicator.jsx
    └── ScoreBreakdown.jsx

pages/Dashboard/modules/
└── AIInterviewerIntegrated.jsx # Main component
```

## Troubleshooting

### Backend not connecting
1. Ensure the FastAPI server is running on port 8000
2. Check `NEXT_PUBLIC_AI_INTERVIEWER_API_URL` environment variable
3. Verify CORS settings in `backend-ai-interviewer/utils/config.py`

### Import errors
1. Check that all paths use the `@/` alias correctly
2. Verify `tsconfig.json` has the correct path mappings
3. Ensure all components are in the correct directories

### API errors
1. Check browser console for detailed error messages
2. Verify backend is running: `http://localhost:8000/health`
3. Check backend logs for errors

## Next Steps

1. Replace the existing `AIInterviewer.jsx` with `AIInterviewerIntegrated.jsx`
2. Update routes to use the new component
3. Test the full interview flow
4. Configure Ollama API for real LLM evaluation (optional)

## Support

For issues or questions:
1. Check the backend logs
2. Review the API documentation at `http://localhost:8000/docs`
3. Check browser console for frontend errors




