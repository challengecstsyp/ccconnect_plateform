# Testing Guide (Without Ollama)

This guide explains how to test the CV rewriting and PDF generation functionality without Ollama.

## Test Endpoints

### 1. Test Rewrite + PDF Generation (Without Job Description)
**Endpoint:** `POST /rewrite/cv/pdf/test`

**Request:**
```json
{
  "cv_json": {
    "name": "John Doe",
    "email": "john@example.com",
    "experience": [...],
    ...
  },
  "rating": {
    "percentage": 75,
    "language": "english"
  },
  "language": "english"
}
```

**Response:**
```json
{
  "original": {...},
  "rewritten": {...},
  "rating": {...},
  "pdf_base64": "base64_encoded_pdf_string",
  "pdf_error": null
}
```

### 2. Test Rewrite + PDF Generation (With Job Description)
**Endpoint:** `POST /rewrite/cv/jd_description/pdf/test`

**Request:**
```json
{
  "cv_data": {
    "name": "John Doe",
    "email": "john@example.com",
    "experience": [...],
    ...
  },
  "job_description": "Software Engineer position..."
}
```

**Response:**
```json
{
  "original": {...},
  "rewritten": {...},
  "rewritten_rating": {
    "percentage": 92,
    ...
  },
  "pdf_base64": "base64_encoded_pdf_string",
  "pdf_error": null
}
```

## Testing Methods

### Method 1: Test PDF Generation Directly (Python Script)

1. Navigate to the backend directory:
```bash
cd backend-resume-reviewer
```

2. Run the test script:
```bash
python test_pdf_generation.py
```

This will:
- Generate a PDF from sample CV data
- Save it to `test_output.pdf`
- Show success/failure message

**Requirements:**
- LaTeX (pdflatex) must be installed
- Python dependencies must be installed

### Method 2: Test via Frontend (Recommended)

1. Start the backend server:
```bash
cd backend-resume-reviewer
python main.py
```

2. Start the frontend (if not already running):
```bash
npm run dev
```

3. In the ResumeReviewer component:
   - The `useTestMode` is set to `true` by default
   - Upload a CV and analyze it
   - Click "Activer la Réécriture IA Pro" or "Optimiser et Générer PDF"
   - The test endpoint will be used (no Ollama required)
   - Download the generated PDF

### Method 3: Test via API (cURL or Postman)

1. Start the backend server:
```bash
cd backend-resume-reviewer
python main.py
```

2. Send a POST request to the test endpoint:

```bash
curl -X POST "http://localhost:8001/rewrite/cv/pdf/test" \
  -H "Content-Type: application/json" \
  -d '{
    "cv_json": {
      "name": "John Doe",
      "email": "john@example.com",
      "location": "New York, NY",
      "phone": "+1 (555) 123-4567",
      "summary": "Experienced software developer",
      "experience": [
        {
          "title": "Software Engineer",
          "company": "Tech Corp",
          "start": "2020",
          "end": "Present",
          "details": [
            "Developed web applications",
            "Led team of 5 developers"
          ]
        }
      ],
      "education": [
        {
          "degree": "BS Computer Science",
          "school": "University",
          "start": "2016",
          "end": "2020",
          "details": ["Graduated with honors"]
        }
      ],
      "skills": ["JavaScript", "Python", "React"],
      "technologies": ["Git", "Docker"]
    },
    "rating": {
      "percentage": 75,
      "language": "english"
    },
    "language": "english"
  }'
```

3. The response will contain `pdf_base64` if successful.

## Requirements

### For PDF Generation:
- **LaTeX (pdflatex)** must be installed
  - Windows: Install [MiKTeX](https://miktex.org/download) or [TeX Live](https://www.tug.org/texlive/)
  - Linux: `sudo apt-get install texlive-latex-base`
  - macOS: `brew install --cask mactex`
  - Make sure `pdflatex` is in your PATH

### For Backend:
- Python 3.8+
- All dependencies from `requirements.txt`
- FastAPI server running on port 8001

### For Frontend:
- Node.js and npm
- Frontend dependencies installed

## Troubleshooting

### PDF Generation Fails
- **Error:** "Failed to generate PDF. Make sure LaTeX (pdflatex) is installed."
- **Solution:** Install LaTeX and ensure `pdflatex` is in your PATH
- **Test:** Run `pdflatex --version` in terminal

### Backend Not Running
- **Error:** "Failed to connect to backend"
- **Solution:** Make sure backend is running on `http://localhost:8001`
- **Check:** Visit `http://localhost:8001/health` in browser

### Test Endpoint Not Found
- **Error:** 404 Not Found
- **Solution:** Make sure you're using `/rewrite/cv/pdf/test` (with `/test`)
- **Check:** Verify the router is registered in `app/main.py`

## Notes

- **Test mode uses mock rewriting:** The CV is improved with simulated AI rewriting (adds action verbs, metrics, etc.)
- **Real AI rewriting requires Ollama:** To use real AI rewriting, set `useTestMode = false` in the frontend and ensure Ollama is running
- **PDF generation is real:** Even in test mode, PDF generation uses real LaTeX compilation

## Next Steps

Once testing is successful:
1. Install Ollama for real AI rewriting
2. Set `useTestMode = false` in the frontend
3. Use the real endpoints: `/rewrite/cv/pdf` and `/rewrite/cv/jd_description/pdf`

