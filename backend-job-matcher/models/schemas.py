"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class MatchRequest(BaseModel):
    """Request schema for text-based matching."""
    text: str = Field(..., description="Text to match (CV or job description)")
    top_n: int = Field(default=5, ge=1, le=50, description="Number of top matches to return")


class MatchResponse(BaseModel):
    """Response schema for match results."""
    matches: List[dict] = Field(..., description="List of matches with index, score, and text")
    total_found: int = Field(..., description="Total number of matches found")


class MatchItem(BaseModel):
    """Individual match item."""
    index: int = Field(..., description="Index of the matched item")
    score: float = Field(..., description="Similarity score (0-1)")
    text: str = Field(..., description="Matched text content")
    metadata: Optional[dict] = Field(default=None, description="Additional metadata (e.g., job title, company)")


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    model_loaded: bool
    jobs_count: int
    cvs_count: int


