"""
Interview Manager - Core Business Logic

This module orchestrates the interview workflow, managing sessions and coordinating
between the interviewer agent (question generation) and evaluator agent (answer evaluation).
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

try:
    from models.interview import InterviewSession, InterviewSettings
    from agents.interviewer_agent import InterviewerAgent
    from agents.evaluator_agent import EvaluatorAgent
    from services.storage import InterviewStorage, get_storage
    from utils.config import InterviewConfig
    from utils.scoring import update_level
    from utils.id_utils import generate_interview_id
except ImportError:
    # Fallback for direct execution
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from models.interview import InterviewSession, InterviewSettings
    from agents.interviewer_agent import InterviewerAgent
    from agents.evaluator_agent import EvaluatorAgent
    from services.storage import InterviewStorage, get_storage
    from utils.config import InterviewConfig
    from utils.scoring import update_level
    from utils.id_utils import generate_interview_id


class InterviewManager:
    """
    Core manager for interview sessions and business logic.
    
    Handles:
    - Session creation and management
    - Question generation through interviewer agent
    - Answer evaluation through evaluator agent
    - Adaptive difficulty adjustment
    - Progress tracking and summarization
    """
    
    def __init__(self, storage: Optional[InterviewStorage] = None):
        """Initialize interview manager."""
        self.storage = storage or get_storage()
        self.interviewer = InterviewerAgent()
        self.evaluator = EvaluatorAgent()

    def create_session(self, settings_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new interview session.
        
        Args:
            settings_payload: Dictionary containing interview settings
            
        Returns:
            Dictionary with interview_id and initial state
        """
        settings = InterviewSettings(**settings_payload)

        # Create InterviewState object instead of dictionary
        from models.interview import InterviewState
        state = InterviewState(
            current_level=settings.initial_level,
            asked_count=0,
            recent_scores=[]
        )

        session = InterviewSession(
            interview_id=generate_interview_id(),
            settings=settings,
            questions=[],
            state=state,
            summary=None,
        )

        ok = self.storage.save_interview(session.dict())
        if not ok:
            raise RuntimeError("Failed to persist interview session")

        return {
            "interview_id": session.interview_id, 
            "current_level": session.state.current_level,  # Use dot notation for Pydantic model
            "settings": session.settings  # Return the actual InterviewSettings object
        }

    def get_next_question(self, interview_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the next question for an interview session.
        
        Args:
            interview_id: Interview session identifier
            
        Returns:
            Question data or None if interview is complete/invalid
        """
        data = self.storage.load_interview(interview_id)
        if not data:
            return None

        if data.get("summary"):
            return None

        settings = data["settings"]
        state = data["state"]
        
        # Debug: Check current level
        current_level = state.get("current_level", settings.get("initial_level", 1))
        print(f"🔧 Debug - Current level for question generation: {current_level}")
        print(f"🔧 Debug - Question count: {state['asked_count']}/{settings['num_questions']}")

        if state["asked_count"] >= settings["num_questions"]:
            return None

        # Determine question type based on soft_pct
        previous_question_texts = [q.get("text", "") for q in data.get("questions", [])]
        soft_count = sum(1 for q in data.get("questions", []) if q.get("type") == "soft")
        total_count = len(data.get("questions", []))
        current_soft_ratio = soft_count / total_count if total_count > 0 else 0
        target_soft_pct = settings.get("soft_pct", 0.3)
        
        if current_soft_ratio < target_soft_pct:
            question_type = "soft"
        elif current_soft_ratio > target_soft_pct:
            question_type = "technical"
        else:
            import random
            question_type = "soft" if random.random() < target_soft_pct else "technical"

        q = self.interviewer.generate_question(
            job_title=settings["job_title"],
            level=current_level,  # Use the debugged current_level
            keywords=settings.get("keywords", []),
            question_type=question_type,
            language=settings.get("language", "en"),
            previous_questions=previous_question_texts,
        )

        q_id = state["asked_count"] + 1
        question_record = {
            "q_id": q_id,
            "question_id": q["question_id"],
            "text": q["question_text"],
            "type": q["question_type"],
            "level": q["level"],
            "topics": q.get("topics", []),
            "estimated_time": q.get("estimated_time", 5),
            "context": q.get("context", ""),
            "candidate_answer": None,
            "evaluation": None,
        }

        data.setdefault("questions", []).append(question_record)
        data["state"]["asked_count"] = q_id
        self.storage.save_interview(data)

        return {
            "q_id": q_id,
            "text": q["question_text"],
            "type": q["question_type"],
            "level": q["level"],
            "topics": q.get("topics", []),
            "estimated_time": q.get("estimated_time", 5),
            "context": q.get("context", ""),
            "interview_id": interview_id
        }

    def submit_answer(self, interview_id: str, answer: str) -> Optional[Dict[str, Any]]:
        """
        Submit and evaluate a candidate's answer.
        
        Args:
            interview_id: Interview session identifier
            answer: Candidate's response text
            
        Returns:
            Evaluation results or None if invalid
        """
        data = self.storage.load_interview(interview_id)
        if not data:
            return None

        if data.get("summary"):
            return None

        questions = data.setdefault("questions", [])
        if not questions:
            raise RuntimeError("No active question to answer")

        last_q = questions[-1]
        if last_q.get("candidate_answer"):
            raise RuntimeError("Question already answered")

        last_q["candidate_answer"] = answer

        eval_result = self.evaluator.evaluate_answer(
            question_text=last_q["text"],
            question_type=last_q["type"],
            question_level=last_q["level"],
            answer_text=answer,
            job_title=data["settings"]["job_title"],
            topics=last_q.get("topics", [])
        )

        last_q["evaluation"] = {
            "overall_score": float(eval_result.get("overall_score", 0.0)),
            "subscores": eval_result.get("subscores", {}),
            "feedback": eval_result.get("feedback", ""),
            "level_recommendation": eval_result.get("level_recommendation", "MAINTAIN"),
            "level_adjustment": eval_result.get("level_adjustment", 0),
            "strengths": eval_result.get("strengths", []),
            "improvements": eval_result.get("improvements", [])
        }

        recent = data["state"].setdefault("recent_scores", [])
        recent.append(last_q["evaluation"]["overall_score"])
        if len(recent) > InterviewConfig.SCORE_WINDOW_SIZE:
            recent = recent[-InterviewConfig.SCORE_WINDOW_SIZE:]
            data["state"]["recent_scores"] = recent

        current_level = data["state"].get("current_level", data["settings"].get("initial_level", InterviewConfig.DEFAULT_INITIAL_LEVEL))
        new_level, reason = update_level(current_level, data["state"]["recent_scores"])
        data["state"]["current_level"] = new_level

        self.storage.save_interview(data)

        if data["state"]["asked_count"] >= data["settings"]["num_questions"]:
            self._finalize_summary(data)
            self.storage.save_interview(data)

        return {
            "interview_id": interview_id,
            "evaluation": last_q["evaluation"],
            "new_level": new_level,
            "is_complete": data.get("summary") is not None
        }

    def get_summary(self, interview_id: str) -> Optional[Dict[str, Any]]:
        """
        Get interview summary.
        
        Args:
            interview_id: Interview session identifier
            
        Returns:
            Summary data or None if not found
        """
        data = self.storage.load_interview(interview_id)
        if not data:
            return None
        return data.get("summary")

    def _finalize_summary(self, data: Dict[str, Any]) -> None:
        """Generate final interview summary."""
        questions = data.get("questions", [])
        answered_questions = [q for q in questions if q.get("candidate_answer") and q.get("evaluation")]
        
        if not answered_questions:
            return

        total_score = sum(q["evaluation"]["overall_score"] for q in answered_questions)
        avg_score = total_score / len(answered_questions)
        
        tech_questions = [q for q in answered_questions if q["type"] == "technical"]
        soft_questions = [q for q in answered_questions if q["type"] == "soft"]
        
        tech_avg = sum(q["evaluation"]["overall_score"] for q in tech_questions) / len(tech_questions) if tech_questions else 0
        soft_avg = sum(q["evaluation"]["overall_score"] for q in soft_questions) / len(soft_questions) if soft_questions else 0
        
        # Collect strengths and improvements
        all_strengths = []
        all_improvements = []
        for q in answered_questions:
            eval_data = q.get("evaluation", {})
            all_strengths.extend(eval_data.get("strengths", []))
            all_improvements.extend(eval_data.get("improvements", []))
        
        # Get most common ones
        from collections import Counter
        top_strengths = [item for item, count in Counter(all_strengths).most_common(3)]
        top_improvements = [item for item, count in Counter(all_improvements).most_common(3)]

        data["summary"] = {
            "overall_score": round(avg_score, 2),
            "technical_score": round(tech_avg, 2),
            "soft_skills_score": round(soft_avg, 2),
            "final_level": data["state"]["current_level"],
            "questions_answered": len(answered_questions),
            "strengths": top_strengths,
            "areas_for_improvement": top_improvements,
            "recommendation": self._generate_recommendation(avg_score),
            "completed_at": datetime.utcnow().isoformat()
        }

    def _generate_recommendation(self, avg_score: float) -> str:
        """Generate hiring recommendation based on score."""
        if avg_score >= 80:
            return "Strong candidate - Highly recommended for the position"
        elif avg_score >= 70:
            return "Good candidate - Recommended with minor reservations"
        elif avg_score >= 60:
            return "Average candidate - Consider with additional evaluation"
        else:
            return "Below expectations - Not recommended without significant improvement"


# Global manager instance
_manager_instance = None


def get_manager() -> InterviewManager:
    """Get global interview manager instance."""
    global _manager_instance
    
    if _manager_instance is None:
        _manager_instance = InterviewManager()
    
    return _manager_instance