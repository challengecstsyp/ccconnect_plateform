
from .utils_service import load_bilingual_verbs, detect_language
from ..core.config import settings
from infrastructure.reviewer.scoring_job_description import deterministic_score , call_llm , build_scoring_prompt



class ATSScoringService:
    def __init__(self):
        # Load bilingual verbs once
        try:
            self.verbs = load_bilingual_verbs()
        except Exception:
            self.verbs = {}  # fallback to empty dict if file missing

    def score(self, cv_data: dict) -> dict:
        """
        Main method: takes extracted CV JSON and returns full ATS scoring.
        """
        language = detect_language(cv_data)
        return self.calculate_score(cv_data, language)

    def calculate_score(self, cv_data: dict, language: str) -> dict:
        """
        Uses the full industry-standard ATS scoring logic
        """
        from infrastructure.reviewer.scoring_no_job_description import calculate_ats_score 
        return calculate_ats_score(cv_data, language, self.verbs)



class JDScoringService:
    """
    LLM-based ATS scoring service that compares CV content against a job description.
    """

    def __init__(self):
        self.ollama_url = settings.OLLAMA_URL
        self.model_name = settings.MODEL_NAME

    # ==========================================================
    # Public API
    # ==========================================================
    def score_cv(self ,cv_data, job_description_text):
        det_score = deterministic_score(cv_data, job_description_text)
        prompt = build_scoring_prompt(cv_data, job_description_text, det_score)
        llm_response = call_llm(prompt, "CV Scoring")

        llm_score = llm_response.get("ats_rating", det_score) if llm_response else det_score

        hybrid = {
            k: round((0.7 * det_score[k] + 0.3 * llm_score.get(k, det_score[k])), 1)
            for k in det_score
        }

        return {"original_rating": hybrid, "deterministic": det_score}
