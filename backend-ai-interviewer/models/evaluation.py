"""
Evaluation logic and scoring utilities.

This module contains helper functions and models for evaluating candidate responses
and computing various metrics used throughout the interview process.
"""

from typing import List, Dict, Any
from dataclasses import dataclass
import statistics


@dataclass
class ScoreWeights:
    """Weights for different score components."""
    
    correctness: float = 0.35
    depth: float = 0.25
    clarity: float = 0.20
    relevance: float = 0.20
    
    def validate(self) -> bool:
        """Validate that weights sum to 1.0."""
        total = self.correctness + self.depth + self.clarity + self.relevance
        return abs(total - 1.0) < 0.001


def calculate_overall_score(subscores: Dict[str, float], weights: ScoreWeights = None) -> float:
    """
    Calculate overall score from subscores using weighted average.
    
    Args:
        subscores: Dictionary with keys: correctness, depth, clarity, relevance
        weights: Optional custom weights (defaults to ScoreWeights())
    
    Returns:
        Weighted overall score (0-100)
    """
    if weights is None:
        weights = ScoreWeights()
    
    if not weights.validate():
        raise ValueError("Score weights must sum to 1.0")
    
    required_keys = ['correctness', 'depth', 'clarity', 'relevance']
    if not all(key in subscores for key in required_keys):
        raise ValueError(f"Subscores must contain keys: {required_keys}")
    
    overall = (
        subscores['correctness'] * weights.correctness +
        subscores['depth'] * weights.depth +
        subscores['clarity'] * weights.clarity +
        subscores['relevance'] * weights.relevance
    )
    
    return round(max(0.0, min(100.0, overall)), 2)


def calculate_weighted_interview_score(questions: List[Dict[str, Any]]) -> float:
    """
    Calculate weighted average score for entire interview.
    Higher level questions have more weight.
    
    Args:
        questions: List of question records with 'level' and 'evaluation' fields
    
    Returns:
        Weighted average score (0-100)
    """
    if not questions:
        return 0.0
    
    total_weighted_score = 0.0
    total_weight = 0.0
    
    for question in questions:
        if 'evaluation' not in question or not question['evaluation']:
            continue
            
        level = question.get('level', 1)
        score = question['evaluation'].get('overall_score', 0.0)
        
        # Level acts as weight (higher levels count more)
        weight = level
        total_weighted_score += score * weight
        total_weight += weight
    
    if total_weight == 0:
        return 0.0
    
    return round(total_weighted_score / total_weight, 2)


def calculate_score_trend(recent_scores: List[float], window_size: int = 3) -> str:
    """
    Analyze trend in recent scores.
    
    Args:
        recent_scores: List of recent scores
        window_size: Number of recent scores to consider
    
    Returns:
        Trend description: "improving", "declining", "stable", or "insufficient_data"
    """
    if len(recent_scores) < 2:
        return "insufficient_data"
    
    # Use the last window_size scores
    scores = recent_scores[-window_size:] if len(recent_scores) >= window_size else recent_scores
    
    if len(scores) < 2:
        return "insufficient_data"
    
    # Calculate trend using linear approximation
    n = len(scores)
    x_values = list(range(n))
    
    # Simple linear regression slope
    x_mean = statistics.mean(x_values)
    y_mean = statistics.mean(scores)
    
    numerator = sum((x - x_mean) * (y - y_mean) for x, y in zip(x_values, scores))
    denominator = sum((x - x_mean) ** 2 for x in x_values)
    
    if denominator == 0:
        return "stable"
    
    slope = numerator / denominator
    
    # Classify trend based on slope
    if slope > 2.0:
        return "improving"
    elif slope < -2.0:
        return "declining"
    else:
        return "stable"


def determine_level_adjustment(recent_scores: List[float], 
                             current_level: int,
                             upper_threshold: float = 80.0,
                             lower_threshold: float = 50.0,
                             window_size: int = 3) -> int:
    """
    Determine level adjustment based on recent performance.
    
    Args:
        recent_scores: List of recent scores
        current_level: Current difficulty level (1-5)
        upper_threshold: Score threshold for level increase
        lower_threshold: Score threshold for level decrease
        window_size: Number of recent scores to consider
    
    Returns:
        Level delta: -1 (decrease), 0 (no change), or +1 (increase)
    """
    if len(recent_scores) == 0:
        return 0
    
    # Use sliding window of recent scores
    window_scores = recent_scores[-window_size:] if len(recent_scores) >= window_size else recent_scores
    avg_score = statistics.mean(window_scores)
    
    # Level boundaries
    min_level, max_level = 1, 5
    
    # Determine adjustment
    if avg_score >= upper_threshold and current_level < max_level:
        return 1  # Increase level
    elif avg_score <= lower_threshold and current_level > min_level:
        return -1  # Decrease level
    else:
        return 0  # No change


def generate_performance_insights(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate insights about candidate performance across the interview.
    
    Args:
        questions: List of completed question records
    
    Returns:
        Dictionary with performance insights
    """
    if not questions:
        return {
            "total_questions": 0,
            "avg_score": 0.0,
            "technical_avg": 0.0,
            "soft_avg": 0.0,
            "level_progression": [],
            "score_trend": "insufficient_data"
        }
    
    # Separate technical and soft questions
    technical_scores = []
    soft_scores = []
    all_scores = []
    level_progression = []
    
    for q in questions:
        if not q.get('evaluation'):
            continue
            
        score = q['evaluation'].get('overall_score', 0.0)
        all_scores.append(score)
        level_progression.append(q.get('level', 1))
        
        if q.get('type') == 'technical':
            technical_scores.append(score)
        elif q.get('type') == 'soft':
            soft_scores.append(score)
    
    return {
        "total_questions": len(questions),
        "avg_score": round(statistics.mean(all_scores), 2) if all_scores else 0.0,
        "technical_avg": round(statistics.mean(technical_scores), 2) if technical_scores else 0.0,
        "soft_avg": round(statistics.mean(soft_scores), 2) if soft_scores else 0.0,
        "level_progression": level_progression,
        "score_trend": calculate_score_trend(all_scores),
        "questions_by_type": {
            "technical": len(technical_scores),
            "soft": len(soft_scores)
        }
    }