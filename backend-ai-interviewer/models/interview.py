"""
Pydantic models for interview session data structures.

This module defines the core data models for the AI-driven adaptive interview simulator,
including interview sessions, questions, evaluations, and summaries.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Union
from uuid import UUID
import uuid


class InterviewSettings(BaseModel):
    """Configuration settings for an interview session."""
    
    job_title: str = Field(..., description="Target job title for the interview")
    num_questions: int = Field(..., ge=1, le=50, description="Total number of questions to ask")
    soft_pct: float = Field(..., ge=0.0, le=1.0, description="Percentage of soft skills questions (0.0-1.0)")
    initial_level: int = Field(..., ge=1, le=5, description="Starting difficulty level (1-5)")
    keywords: List[str] = Field(..., min_items=1, description="Relevant keywords for question generation")
    language: str = Field(default="en", description="Interview language code")
    profile_brief: Optional[str] = Field(default=None, description="Optional candidate profile summary")


class Decision(BaseModel):
    """Evaluation decision for level adjustment."""
    
    level_delta: int = Field(..., ge=-1, le=1, description="Level change (-1, 0, or +1)")
    reason: str = Field(..., description="Explanation for the level adjustment decision")


class Subscores(BaseModel):
    """Detailed scoring breakdown for an answer."""
    
    correctness: float = Field(..., ge=0.0, le=100.0, description="Accuracy of the answer")
    depth: float = Field(..., ge=0.0, le=100.0, description="Depth of understanding demonstrated")
    clarity: float = Field(..., ge=0.0, le=100.0, description="Clarity of communication")
    relevance: float = Field(..., ge=0.0, le=100.0, description="Relevance to the question")


class Evaluation(BaseModel):
    """Complete evaluation of a candidate's answer."""
    
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall score for the answer")
    subscores: Subscores = Field(..., description="Detailed scoring breakdown")
    feedback: str = Field(..., description="Detailed feedback on the answer")
    level_recommendation: str = Field(..., description="Recommendation for level adjustment")
    level_adjustment: int = Field(..., description="Numeric level adjustment (-1, 0, +1)")
    strengths: List[str] = Field(..., description="Identified strengths in the answer")
    improvements: List[str] = Field(..., description="Areas for improvement")


class QuestionRecord(BaseModel):
    """Complete record of a question and its evaluation."""
    
    q_id: int = Field(..., ge=1, description="Question sequence number")
    text: str = Field(..., description="The actual question text")
    type: str = Field(..., pattern="^(technical|soft)$", description="Question type: technical or soft")
    level: int = Field(..., ge=1, le=5, description="Difficulty level of the question")
    candidate_answer: Optional[str] = Field(default=None, description="Candidate's response")
    evaluation: Optional[Evaluation] = Field(default=None, description="Evaluation results")


class InterviewState(BaseModel):
    """Current state of an ongoing interview."""
    
    current_level: int = Field(..., ge=1, le=5, description="Current difficulty level")
    asked_count: int = Field(..., ge=0, description="Number of questions already asked")
    recent_scores: List[float] = Field(default=[], description="Recent scores for adaptive logic")


class Summary(BaseModel):
    """Final interview summary and analysis."""
    
    final_level: int = Field(..., ge=1, le=5, description="Final difficulty level achieved")
    aggregate_score: float = Field(..., ge=0.0, le=100.0, description="Weighted average score")
    strengths: List[str] = Field(..., description="Identified candidate strengths")
    weaknesses: List[str] = Field(..., description="Areas for improvement")
    advice: str = Field(..., description="Personalized advice for the candidate")


class InterviewSession(BaseModel):
    """Complete interview session data structure."""
    
    interview_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="Unique interview identifier")
    settings: InterviewSettings = Field(..., description="Interview configuration")
    questions: List[QuestionRecord] = Field(default=[], description="List of questions and responses")
    state: InterviewState = Field(..., description="Current interview state")
    summary: Optional[Summary] = Field(default=None, description="Final interview summary")
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            UUID: str
        }


class InterviewStartRequest(BaseModel):
    """Request model for starting a new interview."""
    
    job_title: str = Field(..., description="Target job title")
    num_questions: int = Field(..., ge=1, le=50, description="Number of questions")
    soft_pct: float = Field(..., ge=0.0, le=1.0, description="Soft skills percentage")
    initial_level: int = Field(default=3, ge=1, le=5, description="Starting level")
    keywords: List[str] = Field(..., min_items=1, description="Relevant keywords")
    language: str = Field(default="en", description="Interview language")
    profile_brief: Optional[str] = Field(default=None, description="Profile summary")


class AnswerSubmission(BaseModel):
    """Request model for submitting an answer."""
    
    interview_id: str = Field(..., description="Interview session ID")
    answer: str = Field(..., description="Candidate's answer text")


class InterviewResponse(BaseModel):
    """Response model for interview operations."""
    
    interview_id: str = Field(..., description="Interview session ID")
    current_level: int = Field(..., description="Current difficulty level")
    asked_count: int = Field(..., description="Questions asked so far")
    settings: InterviewSettings = Field(..., description="Interview settings")


class QuestionResponse(BaseModel):
    """Response model for question generation."""
    
    q_id: int = Field(..., description="Question ID")
    text: str = Field(..., description="Question text")
    type: str = Field(..., description="Question type")
    level: int = Field(..., description="Question level")
    interview_id: str = Field(..., description="Interview session ID")
    topics: Optional[List[str]] = Field(default=None, description="Question topics")
    estimated_time: Optional[int] = Field(default=None, description="Estimated time in minutes")
    context: Optional[str] = Field(default=None, description="Additional context")


class EvaluationResponse(BaseModel):
    """Response model for answer evaluation."""
    
    interview_id: str = Field(..., description="Interview session ID")
    evaluation: Evaluation = Field(..., description="Answer evaluation")
    new_level: int = Field(..., description="Updated difficulty level")
    is_complete: bool = Field(..., description="Whether interview is finished")