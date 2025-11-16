import sys
from pathlib import Path

# Add current directory to Python path for imports
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import pdf_extractor, ats_scorer

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "*"
]

app = FastAPI(
    title="Resume Reviewer API",
    description="AI-powered CV extraction and ATS scoring",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (ONLY reviewer, not rewriter)
app.include_router(pdf_extractor.router)
app.include_router(ats_scorer.router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Resume Reviewer API",
        "endpoints": [
            "/extract/cv",
            "/extract/cv/upload",
            "/score/ats",
            "/score/ats/job_description"
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

