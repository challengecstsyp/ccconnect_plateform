from app.core.config import settings
from infrastructure.extraction.pdf_extractor import (
    extract_text,
    query_ollama,
    clean_and_parse_json,
    SYSTEM_PROMPT
)

class ExtractionService:
    """
    Service to extract structured JSON from CV files (PDF, DOCX, TXT) using LLM.
    """

    SYSTEM_PROMPT = SYSTEM_PROMPT
    
    # Reuse existing functions
    def extract_text(self, file_path: str) -> str:
        return extract_text(file_path)

    def query_ollama(self, user_text: str) -> str:
        return query_ollama(
        model_name=settings.MODEL_NAME,     
        system_prompt=self.SYSTEM_PROMPT,   
        user_text=user_text                  
    )


    def clean_and_parse_json(self, raw_output):
        return clean_and_parse_json(raw_output)

    def extract_cv_to_json(self, file_path: str) -> dict:
        text = self.extract_text(file_path)
        result = self.query_ollama(text)
        return self.clean_and_parse_json(result)
