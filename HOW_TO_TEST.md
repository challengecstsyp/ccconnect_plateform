# How to Test CV Rewriting + PDF Generation (Without Ollama)

## Quick Start

### Option 1: Test via Frontend (Easiest) ✅

1. **Start the backend:**
   ```bash
   cd backend-resume-reviewer
   python main.py
   ```

2. **The frontend is already configured** with `useTestMode = true` in `ResumeReviewer.jsx`
   - This means it will use test endpoints (no Ollama needed)
   - Just upload a CV, analyze it, and click "Rewrite"
   - The PDF will be generated if LaTeX is installed

### Option 2: Test PDF Generation Directly

1. **Run the test script:**
   ```bash
   cd backend-resume-reviewer
   python test_pdf_generation.py
   ```

2. **This will:**
   - Generate a PDF from sample CV data
   - Save it to `test_output.pdf`
   - Show success/failure message

### Option 3: Test via API (cURL/Postman)

**Test Endpoint:** `POST http://localhost:8001/rewrite/cv/pdf/test`

**Example Request:**
```json
{
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
}
```

**Response:**
```json
{
  "original": {...},
  "rewritten": {...},
  "rating": {...},
  "pdf_base64": "base64_encoded_pdf_string"
}
```

## Requirements

### For PDF Generation:
- **LaTeX (pdflatex)** must be installed
  - Windows: Install [MiKTeX](https://miktex.org/download) or [TeX Live](https://www.tug.org/texlive/)
  - Linux: `sudo apt-get install texlive-latex-base`
  - macOS: `brew install --cask mactex`
  - **Test:** Run `pdflatex --version` in terminal

### For Backend:
- Python 3.8+
- FastAPI server running on port 8001
- All dependencies installed (`pip install -r requirements.txt`)

## Test Endpoints Available

1. **`POST /rewrite/cv/pdf/test`** - Test rewrite + PDF (without job description)
2. **`POST /rewrite/cv/jd_description/pdf/test`** - Test rewrite + PDF (with job description)

## What the Test Mode Does

- **Mock Rewriting:** Simulates AI rewriting by:
  - Adding strong action verbs (Developed, Designed, Implemented, etc.)
  - Adding metrics (25% improvement, etc.)
  - Improving summary text
- **Real PDF Generation:** Uses real LaTeX to generate PDF
- **No Ollama Required:** Test mode bypasses Ollama completely

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

## Next Steps

Once testing is successful:
1. Install Ollama for real AI rewriting
2. Set `useTestMode = false` in `pages/Dashboard/modules/ResumeReviewer.jsx`
3. Use the real endpoints: `/rewrite/cv/pdf` and `/rewrite/cv/jd_description/pdf`

## Files Created

1. **`backend-resume-reviewer/app/services/test_rewrite_pdf_service.py`** - Test service (mock rewriting)
2. **`backend-resume-reviewer/test_pdf_generation.py`** - Direct PDF generation test script
3. **`backend-resume-reviewer/TESTING.md`** - Detailed testing guide
4. **`lib/resume-reviewer-api.js`** - Added test API functions
5. **`pages/Dashboard/modules/ResumeReviewer.jsx`** - Updated to use test mode by default

