from fastapi import APIRouter, HTTPException, File, UploadFile
from app.services.extraction_service import ExtractionService
from app.services.scoring_service import ATSScoringService
from app.services.rewriting_service import CVRewritingService
import shutil, os, tempfile

router = APIRouter(prefix="/process", tags=["Full CV Pipeline"])

extractor = ExtractionService()
scorer = ATSScoringService()
rewriter = CVRewritingService()

@router.post("/cv")
async def process_cv(file: UploadFile = File(...), job_id: str = None):
    """
    Full pipeline: upload CV → extract → score → rewrite
    job_id is optional; if provided, used for scoring and rewriting
    """
    try:
        # Save uploaded CV to temp file
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        # 1️⃣ Extract
        cv_json = extractor.extract_cv_to_json(temp_path)
        if not cv_json:
            raise HTTPException(status_code=400, detail="Failed to extract CV")

        # 2️⃣ Score
        score_result = scorer.score(cv_json)

        # 3️⃣ Rewrite
        rewritten_cv = rewriter.rewrite_cv(cv_json , score_result , score_result.get("language","eb"))

        return {
            "extracted_cv": cv_json,
            "score": score_result,
            "rewritten_cv": rewritten_cv
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
