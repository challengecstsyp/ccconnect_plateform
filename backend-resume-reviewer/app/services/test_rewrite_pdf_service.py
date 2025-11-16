"""
Test service for CV rewriting and PDF generation (without Ollama).
This service creates mock rewritten CVs for testing purposes.
"""
from typing import Optional, Dict, Any
from infrastructure.latex_gen.pdf_generator import generate_pdf_from_cv


class TestCVRewritePDFService:
    """
    Test service that combines CV rewriting (mock) and PDF generation.
    This bypasses Ollama for testing purposes.
    """
    
    def _mock_rewrite_cv(self, cv_data: Dict[str, Any], rating: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a mock rewritten CV by improving action verbs and adding metrics.
        This simulates what the AI rewriter would do.
        """
        import copy
        rewritten_cv = copy.deepcopy(cv_data)
        
        # Improve action verbs in experience descriptions
        if 'experience' in rewritten_cv and rewritten_cv['experience']:
            strong_verbs = [
                'Developed', 'Designed', 'Implemented', 'Optimized', 'Managed',
                'Led', 'Created', 'Automated', 'Improved', 'Launched',
                'Built', 'Deployed', 'Enhanced', 'Streamlined', 'Delivered'
            ]
            
            for i, exp in enumerate(rewritten_cv['experience']):
                if 'details' in exp and exp['details'] and len(exp['details']) > 0:
                    # Improve first detail with a strong verb
                    detail = exp['details'][0]
                    verb_index = i % len(strong_verbs)
                    # Add metrics if not present
                    if not any(char.isdigit() for char in detail):
                        exp['details'][0] = f"{strong_verbs[verb_index]} {detail} resulting in 25% improvement"
                    else:
                        # Already has metrics, just improve verb
                        if not detail.startswith(tuple(strong_verbs)):
                            exp['details'][0] = f"{strong_verbs[verb_index]} {detail}"
        
        # Add summary if missing or improve it
        if 'summary' not in rewritten_cv or not rewritten_cv['summary']:
            rewritten_cv['summary'] = "Experienced professional with a proven track record of delivering high-quality results and driving innovation."
        else:
            rewritten_cv['summary'] = f"{rewritten_cv['summary']} Proven track record of exceeding expectations and delivering measurable results."
        
        return rewritten_cv
    
    def rewrite_and_generate_pdf(
        self, 
        cv_data: Dict[str, Any], 
        rating: Dict[str, Any], 
        language: str = "english"
    ) -> Dict[str, Any]:
        """
        Mock rewrite CV and generate PDF (for testing without Ollama).
        
        Args:
            cv_data: Original CV JSON data
            rating: ATS rating/score dictionary
            language: Language for rewriting (default: "english")
        
        Returns:
            Dictionary containing:
            - original: Original CV data
            - rewritten: Mock rewritten CV data
            - rating: ATS rating
            - pdf_base64: Base64 encoded PDF (optional, if PDF generation succeeds)
            - pdf_error: Error message if PDF generation fails (optional)
        """
        # Step 1: Mock rewrite the CV (bypasses Ollama)
        rewritten_cv = self._mock_rewrite_cv(cv_data, rating)
        
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
        Mock rewrite CV with job description and generate PDF (for testing without Ollama).
        
        Args:
            cv_data: Original CV JSON data
            job_description: Job description text
        
        Returns:
            Dictionary containing:
            - original: Original CV data
            - rewritten: Mock rewritten CV data
            - rewritten_rating: Mock new ATS rating after rewriting
            - pdf_base64: Base64 encoded PDF (optional)
            - pdf_error: Error message if PDF generation fails (optional)
        """
        # Step 1: Mock rewrite the CV (bypasses Ollama)
        # Create a mock rating for the rewrite
        mock_rating = {
            "percentage": 75,
            "language": "english"
        }
        rewritten_cv = self._mock_rewrite_cv(cv_data, mock_rating)
        
        # Step 2: Mock rescore the rewritten CV
        rewritten_rating = {
            "percentage": 92,
            "overall_percentage": 92,
            "total_score": 92,
            "rating": "Excellent - CV optimized for ATS systems",
            "detailed_breakdown": {
                "keyword_matching": {"score": 28},
                "quantifiable_achievements": {"score": 24},
                "skills_match": {"score": 20},
                "experience_relevance": {"score": 15},
                "formatting_structure": {"score": 10}
            }
        }
        
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

