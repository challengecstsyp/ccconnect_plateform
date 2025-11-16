from fastapi import APIRouter, HTTPException, Body
from app.models.schemas import CVJDRequest
from app.services.scoring_service import ATSScoringService , JDScoringService
import json

router = APIRouter(prefix="/score", tags=["ATS Scoring"])
scoring_no_jd_service = ATSScoringService()
scoring_jd_service = JDScoringService()

@router.post("/ats")
async def score_cv_ats(request: dict = Body(...)):
    """
    Calculate ATS score for extracted CV JSON.

    Accepts either:
    {
        "cv_json_path": "path/to/cv.json"
    }
    OR
    {
        "cv_data": {...}  # full CV JSON
    }
    """
    cv_data = request.get("cv_data")
    cv_json_path = request.get("cv_json_path")

    if not cv_data and not cv_json_path:
        raise HTTPException(status_code=400, detail="cv_data or cv_json_path is required")

    # Load JSON from file if path provided
    if cv_json_path:
        try:
            with open(cv_json_path, "r", encoding="utf-8") as f:
                cv_data = json.load(f)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="CV JSON file not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    try:
        rating = scoring_no_jd_service.score(cv_data)
        return rating  # return full dictionary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ats/job_description")
async def score_cv_with_job_description(request:CVJDRequest):
    """
    Score a CV based on a specific job description using LLM.
    Expects:
    {
        "cv_data": {...},                # Extracted CV JSON
        "job_description": "text here"   # Job description text
    }
    """
    
    try:
        result = scoring_jd_service.score_cv(request.cv_data, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
