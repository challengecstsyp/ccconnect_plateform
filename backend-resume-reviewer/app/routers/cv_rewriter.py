# app/routers/cv_rewriter.py
from fastapi import APIRouter, HTTPException
from app.services.rewriting_service import CVRewritingService , CVRewritingJDService
from app.services.rewrite_pdf_service import CVRewritePDFService
from app.services.test_rewrite_pdf_service import TestCVRewritePDFService
from app.models.schemas import CVJDRequest

router = APIRouter(prefix="/rewrite", tags=["CV Rewriting"])
service = CVRewritingService()
service_JD = CVRewritingJDService()
rewrite_pdf_service = CVRewritePDFService()
test_rewrite_pdf_service = TestCVRewritePDFService()

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

    except HTTPException:
        # Re-raise HTTPException to let FastAPI handle it properly
        raise
    except Exception as e:
        # Only catch non-HTTPException errors
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
    except HTTPException:
        # Re-raise HTTPException to let FastAPI handle it properly
        raise
    except Exception as e:
        # Only catch non-HTTPException errors
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cv/pdf")
async def rewrite_and_generate_pdf_endpoint(request: dict):
    """
    Rewrite CV based on ATS rating and generate PDF.
    Expected input:
    {
        "cv_json": {...},
        "rating": {...},
        "language": "english" (optional, default: "english")
    }
    Returns:
    {
        "original": {...},
        "rewritten": {...},
        "rating": {...},
        "pdf_base64": "base64_encoded_pdf_string" (if successful),
        "pdf_error": "error_message" (if PDF generation fails)
    }
    """
    try:
        cv_json = request.get("cv_json")
        rating = request.get("rating")
        language = request.get("language", "english")

        if not cv_json or not rating:
            raise HTTPException(status_code=400, detail="cv_json and rating are required")

        result = rewrite_pdf_service.rewrite_and_generate_pdf(cv_json, rating, language)
        return result

    except HTTPException:
        # Re-raise HTTPException to let FastAPI handle it properly
        raise
    except Exception as e:
        # Only catch non-HTTPException errors
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cv/jd_description/pdf")
def rewrite_with_jd_and_generate_pdf_endpoint(request: CVJDRequest):
    """
    Rewrite CV based on job description and generate PDF.
    Expected input (CVJDRequest):
    {
        "cv_data": {...},
        "job_description": "..."
    }
    Returns:
    {
        "original": {...},
        "rewritten": {...},
        "rewritten_rating": {...},
        "pdf_base64": "base64_encoded_pdf_string" (if successful),
        "pdf_error": "error_message" (if PDF generation fails)
    }
    """
    try:
        result = rewrite_pdf_service.rewrite_with_jd_and_generate_pdf(
            request.cv_data, 
            request.job_description
        )
        return result
    except HTTPException:
        # Re-raise HTTPException to let FastAPI handle it properly
        raise
    except Exception as e:
        # Only catch non-HTTPException errors
        raise HTTPException(status_code=500, detail=str(e))


# ========== TEST ENDPOINTS (No Ollama Required) ==========

@router.post("/cv/pdf/test")
async def test_rewrite_and_generate_pdf_endpoint(request: dict):
    """
    TEST ENDPOINT: Rewrite CV and generate PDF (without Ollama).
    This endpoint uses mock rewriting for testing purposes.
    Expected input:
    {
        "cv_json": {...},
        "rating": {...},
        "language": "english" (optional, default: "english")
    }
    Returns:
    {
        "original": {...},
        "rewritten": {...},
        "rating": {...},
        "pdf_base64": "base64_encoded_pdf_string" (if successful),
        "pdf_error": "error_message" (if PDF generation fails)
    }
    """
    try:
        cv_json = request.get("cv_json")
        rating = request.get("rating")
        language = request.get("language", "english")

        if not cv_json or not rating:
            raise HTTPException(status_code=400, detail="cv_json and rating are required")

        result = test_rewrite_pdf_service.rewrite_and_generate_pdf(cv_json, rating, language)
        return result

    except HTTPException:
        # Re-raise HTTPException to let FastAPI handle it properly
        raise
    except Exception as e:
        # Only catch non-HTTPException errors
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cv/jd_description/pdf/test")
async def test_rewrite_with_jd_and_generate_pdf_endpoint(request: CVJDRequest):
    """
    TEST ENDPOINT: Rewrite CV with job description and generate PDF (without Ollama).
    This endpoint uses mock rewriting for testing purposes.
    Expected input (CVJDRequest):
    {
        "cv_data": {...},
        "job_description": "..."
    }
    Returns:
    {
        "original": {...},
        "rewritten": {...},
        "rewritten_rating": {...},
        "pdf_base64": "base64_encoded_pdf_string" (if successful),
        "pdf_error": "error_message" (if PDF generation fails)
    }
    """
    try:
        result = test_rewrite_pdf_service.rewrite_with_jd_and_generate_pdf(
            request.cv_data, 
            request.job_description
        )
        return result
    except HTTPException:
        # Re-raise HTTPException to let FastAPI handle it properly
        raise
    except Exception as e:
        # Only catch non-HTTPException errors
        raise HTTPException(status_code=500, detail=str(e))
