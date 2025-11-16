# Job Matcher Backend (FastAPI)

This is the FastAPI backend for the AI-powered job matching service.

## Setup Instructions

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- MongoDB running (or MongoDB URI configured)

### Installation

1. Navigate to the backend directory:
```bash
cd backend-job-matcher
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

Create a `.env` file in the `backend-job-matcher` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/utopiahire

# Environment
ENVIRONMENT=development
```

### Running the Backend

1. Make sure you're in the `backend-job-matcher` directory and your virtual environment is activated.

2. Run the FastAPI server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

3. The API will be available at:
   - API: `http://localhost:8001`
   - API Documentation: `http://localhost:8001/docs`
   - Health Check: `http://localhost:8001/health`

### API Endpoints

- `POST /match/cv-to-jobs` - Match CV text to job descriptions
- `POST /match/job-to-cvs` - Match job description to CVs
- `POST /match/text-to-jobs` - Match text to jobs (alias)
- `POST /match/text-to-cvs` - Match text to CVs (alias)
- `POST /initialize` - Initialize matcher with database data
- `GET /health` - Health check

### Data Loading

The service automatically loads jobs from the `joblistings` collection and CVs from the `resumes` collection in MongoDB. Jobs are filtered by `status: "active"`.

### Matching Model

The service uses sentence transformers model `all-MiniLM-L6-v2` for semantic matching. The model will be downloaded automatically on first use.

### Testing

You can test the API using:
- Swagger UI: `http://localhost:8001/docs`
- Health check: `curl http://localhost:8001/health`


