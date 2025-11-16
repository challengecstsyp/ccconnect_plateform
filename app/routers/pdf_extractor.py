from fastapi import APIRouter, HTTPException, File, UploadFile
from app.services.extraction_service import ExtractionService
import shutil
import os
import tempfile

router = APIRouter(prefix="/extract", tags=["Extraction"])
service = ExtractionService()

# -------------------------------
# Extract from existing file path
# -------------------------------
@router.post("/cv")
async def extract_cv(request: dict):
    """
    Extract structured JSON from CV file (PDF, DOCX, TXT)
    Expects: {"file_path": "/path/to/cv.pdf"}
    """
    file_path = request.get("file_path")
    if not file_path:
        raise HTTPException(status_code=400, detail="file_path is required")
    
    try:
        cv_json = service.extract_cv_to_json(file_path)
        if not cv_json:
            raise HTTPException(status_code=400, detail="Failed to parse CV")
        return cv_json
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------------------
# Upload and extract CV
# -------------------------------
@router.post("/cv/upload")
async def extract_cv_upload(file: UploadFile = File(...)):
    """
    Upload a CV and extract structured JSON in one request
    """
    try:
        # Save to a temporary file
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        # Extract JSON
        cv_json = service.extract_cv_to_json(temp_path)
        if not cv_json:
            raise HTTPException(status_code=400, detail="Failed to parse CV")
        return cv_json

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)