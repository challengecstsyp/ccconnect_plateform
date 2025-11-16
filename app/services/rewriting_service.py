import json
import re
import requests

from infrastructure.rewriter.Job_description import build_rewriting_prompt, validate_rewritten_cv
from infrastructure.reviewer.scoring_job_description import deterministic_score , build_scoring_prompt , call_llm
from .utils_service import clean_text
from ..core.config import settings



from infrastructure.rewriter.rewriter_no_job_description import improve_cv_with_llm


class CVRewritingService:
    """
    Handles LLM-powered CV rewriting to improve ATS score.
    Uses Ollama API locally (http://localhost:11434/api/chat).
    """

    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL
        self.model_name = settings.MODEL_NAME

    def rewrite_cv(self, cv_data: dict, rating: dict, language: str = "english") -> dict:
        """
        Call existing improve_cv_with_llm function from the infrastructure.
        No rewriting of logic is needed here.
        """
        return improve_cv_with_llm(cv_data, rating, language)   

    
class CVRewritingJDService:

    def rewrite_cv(self, cv_data, job_description_text):
        jd_words = set(clean_text(job_description_text).split())
        cv_words = set(clean_text(json.dumps(cv_data)).split())
        missing_keywords = [w for w in jd_words if w not in cv_words and len(w) > 3]

        prompt = build_rewriting_prompt(cv_data, job_description_text, missing_keywords[:20])
        rewritten = call_llm(prompt, "CV Rewriting", temperature=0.25)
        rewritten = validate_rewritten_cv(cv_data, rewritten)
        return rewritten

    def rescore_rewritten_cv(self, rewritten, job_description_text):
        new_det = deterministic_score(rewritten, job_description_text)
        rescoring_prompt = build_scoring_prompt(rewritten, job_description_text, new_det)
        llm_rescore_json = call_llm(rescoring_prompt, "CV Rescoring")
        llm_rescore = llm_rescore_json.get("ats_rating", new_det) if llm_rescore_json else new_det
        new_hybrid = {
            k: round((0.7 * new_det[k] + 0.3 * llm_rescore.get(k, new_det[k])), 1)
            for k in new_det
        }
        return new_hybrid
