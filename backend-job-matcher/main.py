"""
FastAPI entry point for the AI Job Matcher service.

Endpoints:
 - POST /match/cv-to-jobs - Match CV text to job descriptions
 - POST /match/job-to-cvs - Match job description to CVs
 - POST /match/text-to-jobs - Match text to jobs (alias for cv-to-jobs)
 - POST /match/text-to-cvs - Match text to CVs (alias for job-to-cvs)
 - GET  /health - Health check
 - POST /initialize - Initialize matcher with data from database

This module wires the MatcherService into a REST API.
"""

import sys
from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import uvicorn

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from services.matcher_service import get_matcher_service
from models.schemas import (
    MatchRequest,
    MatchResponse,
    MatchItem,
    HealthResponse
)
from utils.config import APIConfig

# Initialize FastAPI app
app = FastAPI(
    title=APIConfig.TITLE,
    description=APIConfig.DESCRIPTION,
    version=APIConfig.VERSION,
    debug=APIConfig.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=APIConfig.ALLOW_ORIGINS,
    allow_credentials=APIConfig.ALLOW_CREDENTIALS,
    allow_methods=APIConfig.ALLOW_METHODS,
    allow_headers=APIConfig.ALLOW_HEADERS,
)

# Get global matcher service
matcher_service = get_matcher_service()


@app.get("/", response_class=JSONResponse)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI Job Matcher API",
        "version": APIConfig.VERSION,
        "endpoints": {
            "POST /match/cv-to-jobs": "Match CV text to job descriptions",
            "POST /match/job-to-cvs": "Match job description to CVs",
            "POST /match/text-to-jobs": "Match text to jobs (alias)",
            "POST /match/text-to-cvs": "Match text to CVs (alias)",
            "POST /initialize": "Initialize matcher with database data",
            "GET /health": "Health check",
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        stats = matcher_service.get_stats()
        return HealthResponse(
            status="healthy",
            model_loaded=stats.get('model_loaded', False),
            jobs_count=stats.get('jobs_count', 0),
            cvs_count=stats.get('cvs_count', 0)
        )
    except Exception as e:
        return HealthResponse(
            status=f"error: {str(e)}",
            model_loaded=False,
            jobs_count=0,
            cvs_count=0
        )


@app.post("/initialize")
async def initialize_matcher(user_id: Optional[str] = Query(None, description="Optional user ID to filter CVs")):
    """Initialize the matcher with data from database."""
    try:
        matcher_service.initialize(user_id=user_id, force_reload=True)
        stats = matcher_service.get_stats()
        return {
            "status": "initialized",
            "jobs_count": stats['jobs_count'],
            "cvs_count": stats['cvs_count']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize matcher: {str(e)}")


@app.post("/match/cv-to-jobs", response_model=MatchResponse)
async def match_cv_to_jobs(request: MatchRequest):
    """
    Match CV text to job descriptions.
    
    Args:
        request: MatchRequest with text and top_n
        
    Returns:
        MatchResponse with matches and metadata
    """
    try:
        # Ensure matcher is initialized
        if not matcher_service._initialized:
            matcher_service.initialize()
        
        matches = matcher_service.match_cv_to_jobs(
            cv_text=request.text,
            top_n=min(request.top_n, APIConfig.MAX_TOP_N)
        )
        
        return MatchResponse(
            matches=matches,
            total_found=len(matches)
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


@app.post("/match/job-to-cvs", response_model=MatchResponse)
async def match_job_to_cvs(request: MatchRequest):
    """
    Match job description to CVs.
    
    Args:
        request: MatchRequest with text and top_n
        
    Returns:
        MatchResponse with matches and metadata
    """
    try:
        # Ensure matcher is initialized
        if not matcher_service._initialized:
            matcher_service.initialize()
        
        matches = matcher_service.match_job_to_cvs(
            job_text=request.text,
            top_n=min(request.top_n, APIConfig.MAX_TOP_N)
        )
        
        return MatchResponse(
            matches=matches,
            total_found=len(matches)
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")


@app.post("/match/text-to-jobs", response_model=MatchResponse)
async def match_text_to_jobs(request: MatchRequest):
    """Alias for /match/cv-to-jobs."""
    return await match_cv_to_jobs(request)


@app.post("/match/text-to-cvs", response_model=MatchResponse)
async def match_text_to_cvs(request: MatchRequest):
    """Alias for /match/job-to-cvs."""
    return await match_job_to_cvs(request)


if __name__ == "__main__":
    # Initialize matcher on startup
    try:
        matcher_service.initialize()
    except Exception as e:
        print(f"Warning: Could not initialize matcher on startup: {e}")
        print("Matcher will be initialized on first request.")
    
    uvicorn.run(
        "main:app",
        host=APIConfig.HOST,
        port=APIConfig.PORT,
        reload=APIConfig.DEBUG
    )


