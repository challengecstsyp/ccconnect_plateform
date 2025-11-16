"""
Service for managing the Matcher instance and providing matching functionality.
"""
from typing import List, Dict, Optional
from src.matcher import Matcher
from services.db_service import get_db_service
from utils.config import APIConfig


class MatcherService:
    """Service for managing job matching operations."""
    
    def __init__(self):
        self.matcher: Optional[Matcher] = None
        self.jobs_data: List[Dict] = []
        self.cvs_data: List[Dict] = []
        self.job_texts: List[str] = []
        self.cv_texts: List[str] = []
        self._initialized = False
    
    def initialize(self, user_id: Optional[str] = None, force_reload: bool = False):
        """
        Initialize the matcher with jobs and CVs from database.
        
        Args:
            user_id: Optional user ID to filter CVs for specific user
            force_reload: Force reload even if already initialized
        """
        if self._initialized and not force_reload:
            return
        
        db_service = get_db_service()
        
        # Load jobs and CVs from database
        self.jobs_data = db_service.load_jobs(user_id=user_id)
        self.cvs_data = db_service.load_cvs(user_id=user_id)
        
        # Extract text for matching
        self.job_texts = [job['text'] for job in self.jobs_data]
        self.cv_texts = [cv['text'] for cv in self.cvs_data]
        
        # Initialize matcher
        try:
            self.matcher = Matcher(
                job_texts=self.job_texts,
                cv_texts=self.cv_texts,
                model_name=APIConfig.MODEL_NAME
            )
            self._initialized = True
            print(f"Matcher initialized with {len(self.job_texts)} jobs and {len(self.cv_texts)} CVs")
        except Exception as e:
            print(f"Error initializing matcher: {e}")
            raise
    
    def match_cv_to_jobs(self, cv_text: str, top_n: int = 5) -> List[Dict]:
        """
        Match a CV text to job descriptions.
        
        Args:
            cv_text: CV text to match
            top_n: Number of top matches to return
            
        Returns:
            List of match dictionaries with index, score, text, and metadata
        """
        if not self.matcher:
            raise RuntimeError("Matcher not initialized. Call initialize() first.")
        
        matches = self.matcher.match_text_to_jobs(cv_text, top_n=top_n)
        
        result = []
        for idx, score, text in matches:
            match_dict = {
                'index': idx,
                'score': round(score, 4),
                'text': text,
                'metadata': self.jobs_data[idx]['metadata'] if idx < len(self.jobs_data) else None
            }
            result.append(match_dict)
        
        return result
    
    def match_job_to_cvs(self, job_text: str, top_n: int = 5) -> List[Dict]:
        """
        Match a job description to CVs.
        
        Args:
            job_text: Job description text to match
            top_n: Number of top matches to return
            
        Returns:
            List of match dictionaries with index, score, text, and metadata
        """
        if not self.matcher:
            raise RuntimeError("Matcher not initialized. Call initialize() first.")
        
        matches = self.matcher.match_text_to_cvs(job_text, top_n=top_n)
        
        result = []
        for idx, score, text in matches:
            match_dict = {
                'index': idx,
                'score': round(score, 4),
                'text': text,
                'metadata': self.cvs_data[idx]['metadata'] if idx < len(self.cvs_data) else None
            }
            result.append(match_dict)
        
        return result
    
    def get_stats(self) -> Dict:
        """Get statistics about loaded jobs and CVs."""
        return {
            'jobs_count': len(self.job_texts),
            'cvs_count': len(self.cv_texts),
            'model_loaded': self.matcher is not None
        }


# Global instance
_matcher_service = None


def get_matcher_service() -> MatcherService:
    """Get singleton matcher service instance."""
    global _matcher_service
    if _matcher_service is None:
        _matcher_service = MatcherService()
    return _matcher_service


