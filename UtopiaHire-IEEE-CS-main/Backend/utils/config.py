"""
Application configuration and constants.

This module contains all configuration settings, thresholds, and constants
used throughout the AI-driven adaptive interview simulator.
"""

from typing import Dict, List
import os
from pathlib import Path


class InterviewConfig:
    """Configuration settings for interview behavior."""
    
    # Level adjustment thresholds
    UPPER_THRESHOLD = 80.0  # Score threshold for level increase
    LOWER_THRESHOLD = 50.0  # Score threshold for level decrease
    
    # Level constraints
    MIN_LEVEL = 1
    MAX_LEVEL = 5
    DEFAULT_INITIAL_LEVEL = 3
    
    # Adaptive logic
    SCORE_WINDOW_SIZE = 3  # Number of recent scores to consider for level adjustment
    
    # Question constraints
    MIN_QUESTIONS = 1
    MAX_QUESTIONS = 50
    DEFAULT_NUM_QUESTIONS = 10
    
    # Soft skills percentage constraints
    MIN_SOFT_PCT = 0.0
    MAX_SOFT_PCT = 1.0
    DEFAULT_SOFT_PCT = 0.3
    
    # Language settings
    DEFAULT_LANGUAGE = "en"
    SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "it", "pt"]
    
    # File paths
    BASE_DIR = Path(__file__).parent.parent
    DATA_DIR = BASE_DIR / "data"
    INTERVIEWS_DIR = DATA_DIR / "interviews"
    
    # Scoring weights
    SCORE_WEIGHTS = {
        "correctness": 0.35,
        "depth": 0.25,
        "clarity": 0.20,
        "relevance": 0.20
    }
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist."""
        cls.DATA_DIR.mkdir(exist_ok=True)
        cls.INTERVIEWS_DIR.mkdir(exist_ok=True)


class OllamaConfig:
    """Configuration for Ollama LLM integration."""
    
    # Ollama API settings
    OLLAMA_HOST = "https://ollama.com"
    OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:120b")
    
    # Generation parameters
    TEMPERATURE = 0.7
    MAX_TOKENS = 1000
    TOP_P = 0.9


class QuestionConfig:
    """Configuration for question generation."""
    
    # Question type distribution
    QUESTION_TYPES = ["technical", "soft"]
    
    # Technical question categories by job title
    TECHNICAL_CATEGORIES = {
        "software_engineer": [
            "algorithms", "data_structures", "system_design", "databases",
            "programming_languages", "testing", "version_control"
        ],
        "data_scientist": [
            "machine_learning", "statistics", "data_analysis", "python",
            "sql", "visualization", "modeling"
        ],
        "product_manager": [
            "product_strategy", "market_analysis", "user_research",
            "agile_methodology", "roadmap_planning", "stakeholder_management"
        ],
        "ux_designer": [
            "user_research", "prototyping", "design_principles",
            "usability_testing", "information_architecture", "visual_design"
        ],
        "default": [
            "problem_solving", "communication", "leadership", "teamwork",
            "time_management", "adaptability"
        ]
    }
    
    # Soft skills categories
    SOFT_SKILLS_CATEGORIES = [
        "communication", "leadership", "teamwork", "problem_solving",
        "time_management", "adaptability", "conflict_resolution",
        "decision_making", "emotional_intelligence", "creativity"
    ]
    
    # Level complexity indicators
    LEVEL_DESCRIPTORS = {
        1: "Basic/Entry-level",
        2: "Fundamental/Junior",
        3: "Intermediate/Mid-level", 
        4: "Advanced/Senior",
        5: "Expert/Lead"
    }


class EvaluationConfig:
    """Configuration for answer evaluation."""
    
    # Score ranges
    MIN_SCORE = 0.0
    MAX_SCORE = 100.0
    
    # Performance level thresholds
    PERFORMANCE_LEVELS = {
        "excellent": 90.0,
        "good": 75.0,
        "satisfactory": 60.0,
        "needs_improvement": 45.0,
        "poor": 0.0
    }
    
    # Evaluation criteria descriptions
    CRITERIA_DESCRIPTIONS = {
        "correctness": "Accuracy and factual correctness of the answer",
        "depth": "Depth of understanding and detail provided",
        "clarity": "Clarity and organization of communication",
        "relevance": "Relevance to the question and context"
    }
    
    # Mock evaluation settings
    MOCK_SCORE_RANGE = (40, 95)  # Range for random mock scores
    
    # Summary generation
    MAX_STRENGTHS = 3
    MAX_WEAKNESSES = 3
    ADVICE_TEMPLATES = {
        "technical": "Focus on strengthening your technical foundation in {areas}. "
                    "Practice explaining complex concepts clearly and concisely.",
        "soft": "Work on developing your {skills} skills through practical experience "
               "and self-reflection. Consider seeking feedback from colleagues.",
        "balanced": "Continue building both technical expertise and soft skills. "
                   "Focus particularly on {areas} for maximum impact."
    }


class APIConfig:
    """Configuration for FastAPI application."""
    
    # Server settings
    HOST = "0.0.0.0"
    PORT = 8000
    DEBUG = True
    
    # API metadata
    TITLE = "AI-Driven Adaptive Interview Simulator"
    DESCRIPTION = """
    A modular backend for conducting adaptive technical and soft skills interviews.
    
    Features:
    - Adaptive difficulty adjustment based on performance
    - Technical and soft skills question generation
    - Comprehensive answer evaluation
    - Interview session management
    - Performance analytics and summaries
    """
    VERSION = "1.0.0"
    
    # CORS settings
    ALLOW_ORIGINS = ["*"]  # Configure appropriately for production
    ALLOW_CREDENTIALS = True
    ALLOW_METHODS = ["*"]
    ALLOW_HEADERS = ["*"]
    
    # Request/Response limits
    MAX_ANSWER_LENGTH = 5000
    MAX_PROFILE_BRIEF_LENGTH = 1000
    
    # Rate limiting (if implemented)
    RATE_LIMIT_PER_MINUTE = 60


# Environment-specific overrides
if os.getenv("ENVIRONMENT") == "production":
    APIConfig.DEBUG = False
    APIConfig.ALLOW_ORIGINS = ["https://your-frontend-domain.com"]

if os.getenv("ENVIRONMENT") == "testing":
    InterviewConfig.INTERVIEWS_DIR = Path("/tmp/test_interviews")


def get_job_categories(job_title: str) -> List[str]:
    """
    Get relevant categories for a job title.
    
    Args:
        job_title: Job title string
        
    Returns:
        List of relevant category keywords
    """
    # Normalize job title
    normalized = job_title.lower().replace(" ", "_").replace("-", "_")
    
    # Try exact matches first
    if normalized in QuestionConfig.TECHNICAL_CATEGORIES:
        return QuestionConfig.TECHNICAL_CATEGORIES[normalized]
    
    # Try partial matches
    for key, categories in QuestionConfig.TECHNICAL_CATEGORIES.items():
        if key in normalized or any(word in normalized for word in key.split("_")):
            return categories
    
    # Return default categories
    return QuestionConfig.TECHNICAL_CATEGORIES["default"]


def validate_config():
    """Validate configuration settings."""
    # Ensure directories exist
    InterviewConfig.ensure_directories()
    
    # Validate score weights sum to 1.0
    weights_sum = sum(InterviewConfig.SCORE_WEIGHTS.values())
    if abs(weights_sum - 1.0) > 0.001:
        raise ValueError(f"Score weights must sum to 1.0, got {weights_sum}")
    
    # Validate thresholds
    if InterviewConfig.LOWER_THRESHOLD >= InterviewConfig.UPPER_THRESHOLD:
        raise ValueError("Lower threshold must be less than upper threshold")
    
    return True


# Initialize configuration on import
validate_config()