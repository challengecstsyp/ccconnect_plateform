# Resume Reviewer Backend

FastAPI backend for resume/CV analysis and ATS scoring.

## Prerequisites

**IMPORTANT:** This backend requires Ollama to be running for CV extraction and analysis.

1. Install and start Ollama:
   - Download from: https://ollama.com
   - Start Ollama service (usually runs on `http://localhost:11434`)
   - Pull the required model: `ollama pull gemma3:4b`

2. **For PDF generation:** Install a LaTeX distribution:
   - **Windows:** Install [MiKTeX](https://miktex.org/download) or [TeX Live](https://www.tug.org/texlive/)
   - **Linux:** `sudo apt-get install texlive-latex-base` (or equivalent)
   - **macOS:** `brew install --cask mactex` or use MacTeX
   - Make sure `pdflatex` is in your PATH

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8001`

**Note:** Make sure Ollama is running before using the CV extraction features!

## Endpoints

### Extraction
- `POST /extract/cv/upload` - Extract CV from PDF/DOCX

### Scoring
- `POST /score/ats` - Score CV without job description
- `POST /score/ats/job_description` - Score CV with job description

### Rewriting
- `POST /rewrite/cv` - Rewrite CV based on ATS rating
- `POST /rewrite/cv/jd_description` - Rewrite CV based on job description

### Combined Rewrite + PDF Generation
- `POST /rewrite/cv/pdf` - Rewrite CV and generate PDF (requires LaTeX)
  - Input: `{"cv_json": {...}, "rating": {...}, "language": "english"}`
  - Returns: Rewritten CV JSON and base64-encoded PDF
- `POST /rewrite/cv/jd_description/pdf` - Rewrite CV with job description and generate PDF (requires LaTeX)
  - Input: `{"cv_data": {...}, "job_description": "..."}`
  - Returns: Rewritten CV JSON, new rating, and base64-encoded PDF

### Other
- `POST /process/cv` - Full pipeline (extract, score, rewrite)
- `GET /health` - Health check

