# AI Interviewer Backend (FastAPI)

This is the FastAPI backend for the AI-driven adaptive interview simulator.

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
```bash
cd backend-ai-interviewer
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file in the `backend-ai-interviewer` directory with the following variables:

```env
# Ollama API Configuration (Optional - for LLM integration)
OLLAMA_API_KEY=your_ollama_api_key_here
OLLAMA_MODEL=gpt-oss:120b

# Environment
ENVIRONMENT=development
```

**Note:** If you don't have an Ollama API key, the system will use mock evaluations. This is fine for testing.

### Running the Backend

1. Make sure you're in the `backend-ai-interviewer` directory and your virtual environment is activated.

2. Run the FastAPI server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

3. The API will be available at:
   - API: `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/health`

### API Endpoints

- `POST /start_interview` - Start a new interview session
- `GET /next_question?interview_id={id}` - Get the next question
- `POST /submit_answer` - Submit an answer for evaluation
- `GET /summary/{interview_id}` - Get interview summary
- `GET /status/{interview_id}` - Get interview status
- `GET /health` - Health check

### Data Storage

Interview data is stored in JSON files in the `data/interviews/` directory. This directory will be created automatically on first run.

### Testing

You can test the API using:
1. The interactive API documentation at `/docs`
2. curl commands
3. Postman or similar tools

Example curl command to start an interview:
```bash
curl -X POST "http://localhost:8000/start_interview" \
  -H "Content-Type: application/json" \
  -d '{
    "job_title": "Software Engineer",
    "num_questions": 10,
    "soft_pct": 0.3,
    "initial_level": 3,
    "keywords": ["React", "TypeScript"],
    "language": "en"
  }'
```

### Troubleshooting

1. **Port already in use**: Change the port in `utils/config.py` or use a different port with uvicorn
2. **Import errors**: Make sure all dependencies are installed and you're in the correct directory
3. **Storage errors**: Ensure the `data/interviews/` directory has write permissions
