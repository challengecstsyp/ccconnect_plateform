"""
FastAPI entry point for the AI-driven adaptive interview simulator.

Endpoints:
 - POST /start_interview
 - GET  /next_question?interview_id=...
 - POST /submit_answer
 - GET  /summary/{interview_id}

This module wires the InterviewManager into a simple REST API.
"""

import sys
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional, List
import uvicorn

# Load environment variables FIRST before importing config
load_dotenv()

# Add the Backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from services.interview_manager import get_manager
from services.storage import get_storage
from models.interview import (
    InterviewStartRequest,
    InterviewResponse,
    QuestionResponse,
    AnswerSubmission,
    EvaluationResponse,
)
from utils.config import APIConfig, InterviewConfig, OllamaConfig

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

# Get global instances
interview_manager = get_manager()
storage = get_storage()


@app.get("/", response_class=JSONResponse)
async def root():
    """Root endpoint with API information."""
    return {
        "message": "AI-Driven Adaptive Interview Simulator API",
        "version": APIConfig.VERSION,
        "docs_url": "/docs",
        "health_check": "/health",
        "endpoints": [
            "/start_interview",
            "/next_question",
            "/submit_answer", 
            "/summary/{interview_id}",
            "/status/{interview_id}",
            "/interviews"
        ]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Test storage connectivity
        stats = storage.get_storage_stats()
        
        return {
            "status": "healthy",
            "timestamp": "2025-11-06T10:00:00Z",
            "storage": {
                "status": "connected",
                "interviews_count": stats.get("interviews_count", 0)
            },
            "config": {
                "ollama_configured": bool(OllamaConfig.OLLAMA_API_KEY and OllamaConfig.OLLAMA_API_KEY.strip()),
                "max_questions": InterviewConfig.MAX_QUESTIONS
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy", 
                "error": str(e),
                "timestamp": "2025-11-06T10:00:00Z"
            }
        )


@app.post("/start_interview", response_model=InterviewResponse)
async def start_interview(request: InterviewStartRequest):
    """
    Initialize a new interview session.
    
    Creates a new interview with specified parameters and returns
    the session ID and initial configuration.
    """
    try:
        print(f"📝 Received interview start request: {request.dict()}")
        result = interview_manager.create_session(request.dict())
        
        print(f"✅ Interview created successfully: {result['interview_id']}")
        return InterviewResponse(
            interview_id=result["interview_id"],
            current_level=result["current_level"],
            asked_count=0,  # New session starts with 0 questions asked
            settings=result["settings"]
        )
        
    except Exception as e:
        print(f"❌ Error creating interview: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create interview: {str(e)}"
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create interview: {str(e)}")


@app.get("/next_question", response_model=QuestionResponse)
async def get_next_question(interview_id: str = Query(..., description="Interview session ID")):
    """
    Generate and return the next question for an interview session.
    
    Uses the interviewer agent to generate contextually appropriate questions
    based on current difficulty level and interview progress.
    """
    try:
        print(f"📝 Getting next question for interview: {interview_id}")
        question_data = interview_manager.get_next_question(interview_id)
        
        if not question_data:
            print(f"❌ No question data returned for interview: {interview_id}")
            raise HTTPException(status_code=404, detail="Interview not found or no more questions available")
        
        print(f"✅ Question generated successfully: {question_data.get('text', 'N/A')[:50]}...")
        return QuestionResponse(
            q_id=question_data["q_id"],
            text=question_data["text"],
            type=question_data["type"],
            level=question_data["level"],
            interview_id=interview_id,
            topics=question_data.get("topics"),
            estimated_time=question_data.get("estimated_time"),
            context=question_data.get("context")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error generating question: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate question: {str(e)}")


@app.post("/submit_answer", response_model=EvaluationResponse)
async def submit_answer(submission: AnswerSubmission):
    """
    Submit and evaluate a candidate's answer.
    
    Processes the answer through the evaluator agent, updates the session state,
    and adjusts difficulty level based on performance.
    """
    try:
        print(f"📝 Received answer submission for interview: {submission.interview_id}")
        print(f"Answer length: {len(submission.answer)} characters")
        
        # Validate answer length
        if len(submission.answer) > APIConfig.MAX_ANSWER_LENGTH:
            raise HTTPException(
                status_code=400, 
                detail=f"Answer exceeds maximum length of {APIConfig.MAX_ANSWER_LENGTH} characters"
            )
        
        result = interview_manager.submit_answer(
            interview_id=submission.interview_id,
            answer=submission.answer.strip()
        )
        
        if not result:
            print(f"❌ submit_answer returned None for interview: {submission.interview_id}")
            raise HTTPException(status_code=400, detail="Failed to process answer submission")
        
        print(f"✅ Answer evaluated successfully for interview: {submission.interview_id}")
        return EvaluationResponse(
            interview_id=submission.interview_id,
            evaluation=result["evaluation"],
            new_level=result["new_level"],
            is_complete=result["is_complete"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in submit_answer: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")


@app.get("/summary/{interview_id}")
async def get_interview_summary(interview_id: str):
    """
    Get comprehensive interview summary and analysis.
    
    Returns detailed results including scores, strengths, weaknesses,
    and recommendations. Only available for completed interviews.
    """
    try:
        summary = interview_manager.get_summary(interview_id)
        
        if not summary:
            # Interview not found or no summary available
            raise HTTPException(status_code=404, detail="Interview summary not found")
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get summary: {str(e)}")


@app.get("/status/{interview_id}")
async def get_interview_status(interview_id: str):
    """
    Get current status and progress of an interview session.
    
    Returns progress information, current state, and performance metrics
    for both ongoing and completed interviews.
    """
    try:
        # Load interview data directly from storage
        interview_data = interview_manager.storage.load_interview(interview_id)
        
        if not interview_data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Extract status information
        state = interview_data.get("state", {})
        settings = interview_data.get("settings", {})
        questions = interview_data.get("questions", [])
        summary = interview_data.get("summary")
        
        status = {
            "interview_id": interview_id,
            "current_level": state.get("current_level", 3),
            "asked_count": state.get("asked_count", 0),
            "total_questions": settings.get("num_questions", 10),
            "recent_scores": state.get("recent_scores", []),
            "is_completed": summary is not None,
            "progress_percentage": min(100, (state.get("asked_count", 0) / settings.get("num_questions", 10)) * 100),
            "job_title": settings.get("job_title", ""),
            "questions_answered": len([q for q in questions if q.get("evaluation")])
        }
        
        return status
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


@app.get("/interviews")
async def list_interviews(
    limit: Optional[int] = Query(10, ge=1, le=100, description="Maximum number of interviews to return"),
    include_summary: bool = Query(False, description="Include basic summary information"),
    sort_by: str = Query("created", regex="^(created|modified|id)$", description="Sort criteria")
):
    """
    List available interview sessions.
    
    Returns metadata for existing interviews with optional summary information.
    Useful for dashboard views and session management.
    """
    try:
        interviews = storage.list_interviews(
            limit=limit,
            sort_by=sort_by,
            include_summary=include_summary
        )
        
        return {
            "interviews": interviews,
            "total_count": len(interviews),
            "limit_applied": limit,
            "sort_by": sort_by
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list interviews: {str(e)}")


@app.delete("/interviews/{interview_id}")
async def delete_interview(interview_id: str):
    """
    Delete an interview session.
    
    Removes the interview data from storage. This operation cannot be undone.
    """
    try:
        success = storage.delete_interview(interview_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        return {"message": f"Interview {interview_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete interview: {str(e)}")


@app.post("/interviews/{interview_id}/restart")
async def restart_interview(interview_id: str):
    """
    Restart an interview session.
    
    Clears all answers and resets the session to initial state while
    preserving the original configuration.
    """
    try:
        # Load existing interview data
        interview_data = interview_manager.storage.load_interview(interview_id)
        
        if not interview_data:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Reset the interview state while preserving settings
        settings = interview_data.get("settings", {})
        interview_data.update({
            "questions": [],
            "state": {
                "current_level": settings.get("initial_level", 3),
                "asked_count": 0,
                "recent_scores": []
            },
            "summary": None
        })
        
        # Save the reset interview
        success = interview_manager.storage.save_interview(interview_data)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save restarted interview")
        
        return {"message": f"Interview {interview_id} restarted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to restart interview: {str(e)}")


@app.get("/storage/stats")
async def get_storage_statistics():
    """
    Get storage usage statistics.
    
    Returns information about disk usage, file counts, and storage health.
    """
    try:
        stats = storage.get_storage_stats()
        return stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get storage stats: {str(e)}")


@app.post("/storage/cleanup")
async def cleanup_old_backups(keep_days: int = Query(7, ge=1, le=30, description="Days to keep backups")):
    """
    Clean up old backup files.
    
    Removes backup files older than specified number of days to free up storage space.
    """
    try:
        deleted_count = storage.cleanup_old_backups(keep_days)
        
        return {
            "message": f"Cleanup completed successfully",
            "deleted_backups": deleted_count,
            "keep_days": keep_days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup backups: {str(e)}")


# Exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions with appropriate HTTP status."""
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "type": "ValueError"}
    )


@app.exception_handler(FileNotFoundError)
async def file_not_found_handler(request, exc):
    """Handle FileNotFoundError exceptions."""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found", "type": "FileNotFoundError"}
    )


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    print(f"🚀 Starting {APIConfig.TITLE} v{APIConfig.VERSION}")
    print(f"📁 Storage directory: {InterviewConfig.INTERVIEWS_DIR}")
    print(f"🤖 Ollama API: {'Configured' if (OllamaConfig.OLLAMA_API_KEY and OllamaConfig.OLLAMA_API_KEY.strip()) else 'Not configured'}")
    
    # Ensure storage directories exist
    InterviewConfig.ensure_directories()
    
    # Log configuration
    stats = storage.get_storage_stats()
    print(f"📊 Found {stats.get('interviews_count', 0)} existing interviews")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    print("🛑 Shutting down AI Interview Simulator API")


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host=APIConfig.HOST,
        port=APIConfig.PORT,
        reload=APIConfig.DEBUG,
        log_level="info" if not APIConfig.DEBUG else "debug"
    )