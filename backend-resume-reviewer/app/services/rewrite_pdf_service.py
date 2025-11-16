"""
Combined service for CV rewriting and PDF generation.
Rewrites CV based on ATS scoring, then generates a PDF from the rewritten CV.
"""
from typing import Optional, Dict, Any
from .rewriting_service import CVRewritingService, CVRewritingJDService
from infrastructure.latex_gen.pdf_generator import generate_pdf_from_cv


class CVRewritePDFService:
    """
    Service that combines CV rewriting and PDF generation.
    """
    
    def __init__(self):
        self.rewriting_service = CVRewritingService()
        self.rewriting_jd_service = CVRewritingJDService()
    
    def rewrite_and_generate_pdf(
        self, 
        cv_data: Dict[str, Any], 
        rating: Dict[str, Any], 
        language: str = "english"
    ) -> Dict[str, Any]:
        """
        Rewrite CV based on ATS rating and generate PDF.
        
        Args:
            cv_data: Original CV JSON data
            rating: ATS rating/score dictionary
            language: Language for rewriting (default: "english")
        
        Returns:
            Dictionary containing:
            - original: Original CV data
            - rewritten: Rewritten CV data
            - rating: ATS rating
            - pdf_base64: Base64 encoded PDF (optional, if PDF generation succeeds)
            - pdf_error: Error message if PDF generation fails (optional)
        """
        # Step 1: Rewrite the CV
        rewritten_cv = self.rewriting_service.rewrite_cv(cv_data, rating, language)
        
        if not rewritten_cv:
            return {
                "original": cv_data,
                "rewritten": None,
                "rating": rating,
                "error": "Failed to rewrite CV"
            }
        
        # Step 2: Generate PDF from rewritten CV
        pdf_bytes = generate_pdf_from_cv(rewritten_cv)
        
        result = {
            "original": cv_data,
            "rewritten": rewritten_cv,
            "rating": rating,
        }
        
        if pdf_bytes:
            import base64
            result["pdf_base64"] = base64.b64encode(pdf_bytes).decode('utf-8')
        else:
            result["pdf_error"] = "Failed to generate PDF. Make sure LaTeX (pdflatex) is installed."
        
        return result
    
    def rewrite_with_jd_and_generate_pdf(
        self,
        cv_data: Dict[str, Any],
        job_description: str
    ) -> Dict[str, Any]:
        """
        Rewrite CV based on job description and generate PDF.
        
        Args:
            cv_data: Original CV JSON data
            job_description: Job description text
        
        Returns:
            Dictionary containing:
            - original: Original CV data
            - rewritten: Rewritten CV data
            - rewritten_rating: New ATS rating after rewriting
            - pdf_base64: Base64 encoded PDF (optional)
            - pdf_error: Error message if PDF generation fails (optional)
        """
        # Step 1: Rewrite the CV based on job description
        rewritten_cv = self.rewriting_jd_service.rewrite_cv(cv_data, job_description)
        
        if not rewritten_cv:
            return {
                "original": cv_data,
                "rewritten": None,
                "error": "Failed to rewrite CV"
            }
        
        # Step 2: Rescore the rewritten CV
        rewritten_rating = self.rewriting_jd_service.rescore_rewritten_cv(
            rewritten_cv, 
            job_description
        )
        
        # Step 3: Generate PDF from rewritten CV
        pdf_bytes = generate_pdf_from_cv(rewritten_cv)
        
        result = {
            "original": cv_data,
            "rewritten": rewritten_cv,
            "rewritten_rating": rewritten_rating,
        }
        
        if pdf_bytes:
            import base64
            result["pdf_base64"] = base64.b64encode(pdf_bytes).decode('utf-8')
        else:
            result["pdf_error"] = "Failed to generate PDF. Make sure LaTeX (pdflatex) is installed."
        
        return result

