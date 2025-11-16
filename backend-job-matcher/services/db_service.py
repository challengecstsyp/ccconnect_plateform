"""
MongoDB service for loading jobs and CVs from database.
"""
from typing import List, Dict, Optional
import os
from pymongo import MongoClient
from bson import ObjectId
from utils.config import APIConfig


class DatabaseService:
    """Service for interacting with MongoDB."""
    
    def __init__(self):
        self.client = None
        self.db = None
        self._connect()
    
    def _connect(self):
        """Connect to MongoDB."""
        try:
            self.client = MongoClient(APIConfig.MONGODB_URI)
            # Extract database name from URI or use default
            db_name = APIConfig.MONGODB_URI.split('/')[-1].split('?')[0]
            if not db_name or db_name == '':
                db_name = 'utopiahire'
            self.db = self.client[db_name]
        except Exception as e:
            print(f"Warning: Could not connect to MongoDB: {e}")
            self.client = None
            self.db = None
    
    def load_jobs(self, user_id: Optional[str] = None) -> List[Dict]:
        """
        Load all active job listings from database.
        
        Args:
            user_id: Optional user ID to filter jobs for specific user
            
        Returns:
            List of job dictionaries with 'text' and 'metadata' keys
        """
        if not self.db:
            return []
        
        try:
            jobs_collection = self.db.joblistings
            query = {"status": "active"}
            
            # If user_id provided, we could filter by recruiter_id or apply matching logic
            # For now, we'll load all active jobs
            
            jobs = list(jobs_collection.find(query))
            
            result = []
            for job in jobs:
                # Combine title, description, requirements, etc. into a single text
                text_parts = []
                if job.get('title'):
                    text_parts.append(f"Title: {job['title']}")
                if job.get('company'):
                    text_parts.append(f"Company: {job['company']}")
                if job.get('description'):
                    text_parts.append(f"Description: {job['description']}")
                if job.get('requirements'):
                    if isinstance(job['requirements'], list):
                        text_parts.append(f"Requirements: {', '.join(job['requirements'])}")
                    else:
                        text_parts.append(f"Requirements: {job['requirements']}")
                if job.get('tags'):
                    if isinstance(job['tags'], list):
                        text_parts.append(f"Tags: {', '.join(job['tags'])}")
                
                text = " ".join(text_parts)
                
                result.append({
                    'text': text,
                    'metadata': {
                        'id': str(job['_id']),
                        'title': job.get('title', ''),
                        'company': job.get('company', ''),
                        'location': job.get('location', ''),
                        'salary_range': job.get('salary_range', ''),
                        'tags': job.get('tags', []),
                        'requirements': job.get('requirements', []),
                    }
                })
            
            return result
        except Exception as e:
            print(f"Error loading jobs from database: {e}")
            return []
    
    def load_cvs(self, user_id: Optional[str] = None) -> List[Dict]:
        """
        Load CVs from database.
        
        Args:
            user_id: Optional user ID to filter CVs for specific user
            
        Returns:
            List of CV dictionaries with 'text' and 'metadata' keys
        """
        if not self.db:
            return []
        
        try:
            resumes_collection = self.db.resumes
            query = {}
            
            if user_id:
                query['user_id'] = ObjectId(user_id)
            
            resumes = list(resumes_collection.find(query))
            
            result = []
            for resume in resumes:
                # Combine original_text and parsed_data into a single text
                text_parts = []
                
                if resume.get('original_text'):
                    text_parts.append(resume['original_text'])
                
                if resume.get('parsed_data'):
                    parsed = resume['parsed_data']
                    
                    if parsed.get('education'):
                        ed_parts = []
                        for edu in parsed['education']:
                            ed_str = f"{edu.get('degree', '')} in {edu.get('field', '')} from {edu.get('school', '')} ({edu.get('year', '')})"
                            ed_parts.append(ed_str)
                        if ed_parts:
                            text_parts.append("Education: " + " | ".join(ed_parts))
                    
                    if parsed.get('experience'):
                        exp_parts = []
                        for exp in parsed['experience']:
                            exp_str = f"{exp.get('title', '')} at {exp.get('company', '')} - {exp.get('description', '')}"
                            exp_parts.append(exp_str)
                        if exp_parts:
                            text_parts.append("Experience: " + " | ".join(exp_parts))
                    
                    if parsed.get('skills'):
                        if isinstance(parsed['skills'], list):
                            text_parts.append("Skills: " + ", ".join(parsed['skills']))
                    
                    if parsed.get('certifications'):
                        cert_parts = []
                        for cert in parsed['certifications']:
                            cert_str = f"{cert.get('name', '')} from {cert.get('issuer', '')}"
                            cert_parts.append(cert_str)
                        if cert_parts:
                            text_parts.append("Certifications: " + " | ".join(cert_parts))
                
                text = " ".join(text_parts)
                
                result.append({
                    'text': text,
                    'metadata': {
                        'id': str(resume['_id']),
                        'user_id': str(resume.get('user_id', '')),
                    }
                })
            
            return result
        except Exception as e:
            print(f"Error loading CVs from database: {e}")
            return []


# Global instance
_db_service = None


def get_db_service() -> DatabaseService:
    """Get singleton database service instance."""
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service


