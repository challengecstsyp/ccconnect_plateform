from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import pdf_extractor, ats_scorer, cv_rewriter, full_pipeline



origins = [
    "http://localhost:3000",
    "https://your-production-domain.com",
    "*"
]

app = FastAPI(
    title="CV Analyzer API",
    description="AI-powered CV extraction, ATS scoring, and rewriting",
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

# Include existing routers
app.include_router(pdf_extractor.router)
app.include_router(ats_scorer.router)
app.include_router(cv_rewriter.router)

# Include full pipeline router
app.include_router(full_pipeline.router)  

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "CV Analyzer API",
        "endpoints": [
            "/extract/cv",
            "/extract/cv/upload",
            "/score/ats",
            "/score/ats/job_description",
            "/rewrite/cv",
            "/rewrite/cv/jd_description",
            "/rewrite/cv/pdf",
            "/rewrite/cv/jd_description/pdf",
            "/rewrite/cv/pdf/test",
            "/rewrite/cv/jd_description/pdf/test",
            "/process/cv",
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}
