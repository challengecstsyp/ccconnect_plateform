"""
Scoring and adaptive logic utilities.

This module implements the core scoring algorithms and adaptive difficulty
adjustment logic for the AI-driven interview simulator.
"""

import statistics
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass

try:
    from .config import InterviewConfig, EvaluationConfig
except ImportError:
    # Fallback for direct execution
    from config import InterviewConfig, EvaluationConfig


def update_level(current_level: int, 
                recent_scores: List[float], 
                upper_threshold: float = InterviewConfig.UPPER_THRESHOLD,
                lower_threshold: float = InterviewConfig.LOWER_THRESHOLD,
                window_size: int = InterviewConfig.SCORE_WINDOW_SIZE) -> Tuple[int, str]:
    """
    Update difficulty level based on recent performance using sliding window.
    
    Args:
        current_level: Current difficulty level (1-5)
        recent_scores: List of recent scores
        upper_threshold: Score threshold for level increase (default: 80)
        lower_threshold: Score threshold for level decrease (default: 50)
        window_size: Number of recent scores to consider (default: 3)
    
    Returns:
        Tuple of (new_level, reason_for_change)
    """
    if not recent_scores:
        return current_level, "No scores available for adjustment"
    
    # Use sliding window of most recent scores
    window_scores = recent_scores[-window_size:] if len(recent_scores) >= window_size else recent_scores
    avg_score = statistics.mean(window_scores)
    
    # Determine level adjustment
    if avg_score >= upper_threshold and current_level < InterviewConfig.MAX_LEVEL:
        new_level = current_level + 1
        reason = f"Average score {avg_score:.1f} >= {upper_threshold} threshold"
        return new_level, reason
    
    elif avg_score <= lower_threshold and current_level > InterviewConfig.MIN_LEVEL:
        new_level = current_level - 1
        reason = f"Average score {avg_score:.1f} <= {lower_threshold} threshold"
        return new_level, reason
    
    else:
        reason = f"Average score {avg_score:.1f} within acceptable range"
        return current_level, reason


def weighted_average(questions: List[Dict[str, Any]]) -> float:
    """
    Calculate weighted average score where higher level questions have more weight.
    
    Args:
        questions: List of question records with 'level' and 'evaluation' fields
    
    Returns:
        Weighted average score (0-100), rounded to 2 decimal places
    """
    if not questions:
        return 0.0
    
    total_score = 0.0
    total_weight = 0.0
    
    for question in questions:
        # Skip questions without evaluation
        if not question.get('evaluation') or 'overall_score' not in question['evaluation']:
            continue
        
        level = question.get('level', 1)
        score = question['evaluation']['overall_score']
        
        # Use level as weight (higher levels contribute more)
        weight = level
        total_score += score * weight
        total_weight += weight
    
    if total_weight == 0:
        return 0.0
    
    return round(total_score / total_weight, 2)


def calculate_subscores_from_overall(overall_score: float, 
                                   question_type: str = "technical",
                                   level: int = 3) -> Dict[str, float]:
    """
    Generate realistic subscores based on overall score.
    Used for mock evaluation when detailed scoring isn't available.
    
    Args:
        overall_score: Overall score (0-100)
        question_type: Type of question ("technical" or "soft")
        level: Question difficulty level (1-5)
    
    Returns:
        Dictionary with subscores for correctness, depth, clarity, relevance
    """
    import random
    
    # Set random seed based on score for consistent results
    random.seed(int(overall_score * 100))
    
    # Base variation range depends on question type and level
    if question_type == "technical":
        # Technical questions: correctness and depth matter more
        base_variation = 15
        correctness_bias = 2
        depth_bias = 1
        clarity_bias = -1
        relevance_bias = 0
    else:
        # Soft skills: clarity and relevance matter more
        base_variation = 12
        correctness_bias = -2
        depth_bias = -1
        clarity_bias = 2
        relevance_bias = 1
    
    # Adjust variation based on level (higher levels have more variation)
    variation = base_variation + (level - 3) * 3
    
    # Generate subscores with realistic relationships
    subscores = {}
    for criterion, bias in [
        ("correctness", correctness_bias),
        ("depth", depth_bias), 
        ("clarity", clarity_bias),
        ("relevance", relevance_bias)
    ]:
        # Random variation around the overall score
        variance = random.uniform(-variation, variation) + bias
        subscore = overall_score + variance
        
        # Ensure within valid range
        subscore = max(0.0, min(100.0, subscore))
        subscores[criterion] = round(subscore, 1)
    
    return subscores


def calculate_performance_level(score: float) -> str:
    """
    Classify performance level based on score.
    
    Args:
        score: Performance score (0-100)
    
    Returns:
        Performance level string
    """
    for level, threshold in sorted(EvaluationConfig.PERFORMANCE_LEVELS.items(), 
                                 key=lambda x: x[1], reverse=True):
        if score >= threshold:
            return level
    return "poor"


def calculate_score_percentile(score: float, all_scores: List[float]) -> float:
    """
    Calculate percentile rank of a score within a list of scores.
    
    Args:
        score: Target score
        all_scores: List of all scores for comparison
    
    Returns:
        Percentile rank (0-100)
    """
    if not all_scores:
        return 50.0  # Default to median if no comparison data
    
    scores_below = sum(1 for s in all_scores if s < score)
    scores_equal = sum(1 for s in all_scores if s == score)
    
    # Calculate percentile rank
    percentile = (scores_below + 0.5 * scores_equal) / len(all_scores) * 100
    return round(percentile, 1)


def analyze_score_distribution(scores: List[float]) -> Dict[str, float]:
    """
    Analyze the distribution of scores.
    
    Args:
        scores: List of scores to analyze
    
    Returns:
        Dictionary with distribution statistics
    """
    if not scores:
        return {
            "mean": 0.0,
            "median": 0.0,
            "std_dev": 0.0,
            "min": 0.0,
            "max": 0.0,
            "range": 0.0
        }
    
    return {
        "mean": round(statistics.mean(scores), 2),
        "median": round(statistics.median(scores), 2),
        "std_dev": round(statistics.stdev(scores) if len(scores) > 1 else 0.0, 2),
        "min": round(min(scores), 2),
        "max": round(max(scores), 2),
        "range": round(max(scores) - min(scores), 2)
    }


def predict_final_score(current_scores: List[float], 
                       remaining_questions: int,
                       target_level: int = 3) -> Dict[str, float]:
    """
    Predict potential final score range based on current performance.
    
    Args:
        current_scores: Scores achieved so far
        remaining_questions: Number of questions left
        target_level: Expected difficulty level for remaining questions
    
    Returns:
        Dictionary with predicted score range
    """
    if not current_scores:
        # No data yet - return broad range
        return {
            "predicted_min": 30.0,
            "predicted_max": 90.0,
            "predicted_avg": 60.0,
            "confidence": 0.1
        }
    
    current_avg = statistics.mean(current_scores)
    current_std = statistics.stdev(current_scores) if len(current_scores) > 1 else 15.0
    
    # Adjust prediction based on expected difficulty
    level_adjustment = (target_level - 3) * 5  # ±5 points per level difference
    
    # Calculate weighted prediction
    total_questions = len(current_scores) + remaining_questions
    current_weight = len(current_scores) / total_questions
    future_weight = remaining_questions / total_questions
    
    # Estimate future performance (slightly regressed toward mean)
    future_avg = current_avg * 0.8 + 60.0 * 0.2 + level_adjustment
    
    # Weighted average of current and predicted future
    predicted_avg = current_avg * current_weight + future_avg * future_weight
    
    # Confidence decreases with uncertainty
    confidence = min(0.9, len(current_scores) / 10.0)
    
    # Calculate range based on standard deviation
    range_multiplier = 1.5 * (1 - confidence)
    predicted_min = max(0.0, predicted_avg - current_std * range_multiplier)
    predicted_max = min(100.0, predicted_avg + current_std * range_multiplier)
    
    return {
        "predicted_min": round(predicted_min, 1),
        "predicted_max": round(predicted_max, 1),
        "predicted_avg": round(predicted_avg, 1),
        "confidence": round(confidence, 2)
    }


def should_adjust_difficulty(recent_scores: List[float], 
                           current_level: int,
                           min_questions_for_adjustment: int = 2) -> bool:
    """
    Determine if difficulty should be adjusted based on recent performance.
    
    Args:
        recent_scores: Recent scores for analysis
        current_level: Current difficulty level
        min_questions_for_adjustment: Minimum questions needed before adjustment
    
    Returns:
        True if level should be adjusted, False otherwise
    """
    if len(recent_scores) < min_questions_for_adjustment:
        return False
    
    new_level, _ = update_level(current_level, recent_scores)
    return new_level != current_level


@dataclass
class ScoringMetrics:
    """Container for various scoring metrics."""
    
    overall_score: float
    weighted_score: float
    performance_level: str
    percentile: float
    score_trend: str
    level_recommendation: int
    confidence: float


def calculate_comprehensive_metrics(questions: List[Dict[str, Any]], 
                                  comparison_scores: Optional[List[float]] = None) -> ScoringMetrics:
    """
    Calculate comprehensive scoring metrics for an interview.
    
    Args:
        questions: List of completed questions
        comparison_scores: Optional list of scores for percentile calculation
    
    Returns:
        ScoringMetrics object with all calculated metrics
    """
    if not questions:
        return ScoringMetrics(
            overall_score=0.0,
            weighted_score=0.0,
            performance_level="poor",
            percentile=0.0,
            score_trend="insufficient_data",
            level_recommendation=InterviewConfig.DEFAULT_INITIAL_LEVEL,
            confidence=0.0
        )
    
    # Extract scores
    scores = []
    for q in questions:
        if q.get('evaluation') and 'overall_score' in q['evaluation']:
            scores.append(q['evaluation']['overall_score'])
    
    if not scores:
        return ScoringMetrics(
            overall_score=0.0,
            weighted_score=0.0,
            performance_level="poor",
            percentile=0.0,
            score_trend="insufficient_data",
            level_recommendation=InterviewConfig.DEFAULT_INITIAL_LEVEL,
            confidence=0.0
        )
    
    # Calculate metrics
    overall = statistics.mean(scores)
    weighted = weighted_average(questions)
    performance_level = calculate_performance_level(overall)
    
    if comparison_scores:
        percentile = calculate_score_percentile(overall, comparison_scores)
    else:
        percentile = 50.0  # Default
    
    # Determine trend
    if len(scores) >= 3:
        recent_trend = scores[-3:]
        if recent_trend[-1] > recent_trend[0]:
            score_trend = "improving"
        elif recent_trend[-1] < recent_trend[0]:
            score_trend = "declining"
        else:
            score_trend = "stable"
    else:
        score_trend = "insufficient_data"
    
    # Level recommendation based on performance
    if overall >= 85:
        level_rec = min(5, InterviewConfig.DEFAULT_INITIAL_LEVEL + 2)
    elif overall >= 70:
        level_rec = min(5, InterviewConfig.DEFAULT_INITIAL_LEVEL + 1)
    elif overall >= 45:
        level_rec = InterviewConfig.DEFAULT_INITIAL_LEVEL
    else:
        level_rec = max(1, InterviewConfig.DEFAULT_INITIAL_LEVEL - 1)
    
    # Confidence based on number of questions and score consistency
    confidence = min(0.95, len(scores) / 10.0)
    if len(scores) > 1:
        cv = statistics.stdev(scores) / statistics.mean(scores)  # coefficient of variation
        confidence *= max(0.5, 1.0 - cv / 2.0)  # Reduce confidence for inconsistent scores
    
    return ScoringMetrics(
        overall_score=round(overall, 2),
        weighted_score=weighted,
        performance_level=performance_level,
        percentile=percentile,
        score_trend=score_trend,
        level_recommendation=level_rec,
        confidence=round(confidence, 2)
    )