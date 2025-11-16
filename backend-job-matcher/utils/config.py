"""
Configuration for Job Matcher FastAPI backend.
"""
import os
from dotenv import load_dotenv

load_dotenv()


class APIConfig:
    """Configuration for FastAPI application."""
    
    # Server settings
    HOST = "0.0.0.0"
    PORT = 8001  # Different port from AI Interviewer (8000)
    DEBUG = True
    
    # API metadata
    TITLE = "AI Job Matcher API"
    DESCRIPTION = """
    AI-powered job matching service using sentence transformers.
    
    Features:
    - Match CVs to job descriptions
    - Match job descriptions to CVs
    - Text-based matching
    - Semantic similarity using embeddings
    """
    VERSION = "1.0.0"
    
    # CORS settings
    ALLOW_ORIGINS = ["*"]  # Configure appropriately for production
    ALLOW_CREDENTIALS = True
    ALLOW_METHODS = ["*"]
    ALLOW_HEADERS = ["*"]
    
    # Model settings
    MODEL_NAME = "all-MiniLM-L6-v2"  # sentence-transformers model
    
    # MongoDB settings
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/utopiahire")
    
    # Matching settings
    DEFAULT_TOP_N = 5
    MAX_TOP_N = 50
    BATCH_SIZE = 64


# Environment-specific overrides
if os.getenv("ENVIRONMENT") == "production":
    APIConfig.DEBUG = False
    APIConfig.ALLOW_ORIGINS = ["https://your-frontend-domain.com"]


