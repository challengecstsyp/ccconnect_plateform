# app/routers/cv_rewriter.py
from fastapi import APIRouter, HTTPException
from app.services.rewriting_service import CVRewritingService , CVRewritingJDService
from app.models.schemas import CVJDRequest

router = APIRouter(prefix="/rewrite", tags=["CV Rewriting"])
service = CVRewritingService()
service_JD = CVRewritingJDService()

@router.post("/cv")
async def rewrite_cv_endpoint(request: dict):
    """
    Rewrite CV intelligently based on prior ATS scoring.
    Expected input:
    {
        "cv_json": {...},
        "rating": {...}
    }
    """
    try:
        cv_json = request.get("cv_json")
        rating = request.get("rating")

        if not cv_json or not rating:
            raise HTTPException(status_code=400, detail="cv_json and rating are required")

        language = rating.get("language", "en")

        rewritten = service.rewrite_cv(cv_json, rating, language)

        return {
            "original": cv_json,
            "rating": rating,
            "rewritten": rewritten
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    


@router.post("/cv/jd_description")
def rewrite_endpoint(request: CVJDRequest):
    try:
        rewritten = service_JD.rewrite_cv(request.cv_data, request.job_description)
        rescored = service_JD.rescore_rewritten_cv(rewritten, request.job_description)
        return {
            "status": "success",
            "rewritten_cv": rewritten,
            "rewritten_rating": rescored
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
