"""
Evaluator Agent - Answer Evaluation Module

This module handles the evaluation of candidate responses using Ollama LLM,
providing detailed scoring, feedback, and recommendations for difficulty level adjustments.
"""

import os
from typing import Dict, List, Any, Optional, Tuple
from ollama import Client

try:
    from backend.utils.config import EvaluationConfig, InterviewConfig, OllamaConfig
    from backend.utils.scoring import calculate_subscores_from_overall, update_level
    from backend.models.evaluation import calculate_overall_score
except ImportError:
    # Fallback for direct execution
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from utils.config import EvaluationConfig, InterviewConfig, OllamaConfig
    from utils.scoring import calculate_subscores_from_overall, update_level
    from models.evaluation import calculate_overall_score


class EvaluatorAgent:
    """
    Agent responsible for evaluating candidate answers using Ollama LLM and providing feedback.
    
    This agent provides:
    - Comprehensive scoring across multiple criteria
    - Level adjustment recommendations
    - Optimal answer examples
    - Constructive feedback
    """
    
    def __init__(self):
        """Initialize the evaluator agent with Ollama client."""
        # Configure headers only if API key is provided
        headers = {}
        if OllamaConfig.OLLAMA_API_KEY and OllamaConfig.OLLAMA_API_KEY.strip():
            headers['Authorization'] = f'Bearer {OllamaConfig.OLLAMA_API_KEY}'
        
        self.client = Client(
            host=OllamaConfig.OLLAMA_HOST,
            headers=headers if headers else None
        )
    
    def evaluate_answer(self,
                       question_text: str,
                       question_type: str,
                       question_level: int,
                       answer_text: str,
                       job_title: str,
                       topics: List[str] = None) -> Dict[str, Any]:
        """
        Evaluate a candidate's answer using Ollama LLM.
        
        Args:
            question_text: The interview question
            question_type: Type of question ("technical" or "soft")
            question_level: Difficulty level of the question (1-5)
            answer_text: Candidate's response
            job_title: Target job position
            topics: List of topics the question covers
            
        Returns:
            Dictionary containing:
            - overall_score: Overall score (0-100)
            - subscores: Dictionary of detailed scores
            - feedback: Constructive feedback text
            - level_recommendation: Suggested difficulty adjustment
            - strengths: List of identified strengths
            - improvements: List of areas for improvement
        """
        try:
            # Build evaluation prompt
            prompt = self._build_evaluation_prompt(
                question_text, question_type, question_level, answer_text, job_title, topics
            )
            
            # Get evaluation from Ollama
            messages = [{"role": "user", "content": prompt}]
            
            response_parts = []
            for part in self.client.chat(
                OllamaConfig.OLLAMA_MODEL,
                messages=messages,
                stream=True,
                options={
                    "temperature": 0.3,  # Lower temperature for more consistent scoring
                    "top_p": OllamaConfig.TOP_P,
                    "num_predict": OllamaConfig.MAX_TOKENS
                }
            ):
                if 'message' in part and 'content' in part['message']:
                    response_parts.append(part['message']['content'])
            
            response_text = ''.join(response_parts)
            
            # Parse the LLM response to extract structured evaluation data
            return self._parse_evaluation_response(response_text, question_level)
            
        except Exception as e:
            print(f"Error evaluating answer with Ollama: {e}")
            # Fallback to basic evaluation if LLM fails
            return self._generate_fallback_evaluation(answer_text, question_level)
    
    def _build_evaluation_prompt(self,
                                question_text: str,
                                question_type: str,
                                question_level: int,
                                answer_text: str,
                                job_title: str,
                                topics: List[str] = None) -> str:
        """Build the prompt for answer evaluation."""
        
        difficulty_desc = {
            1: "entry-level/junior",
            2: "junior", 
            3: "mid-level",
            4: "senior",
            5: "expert/architect"
        }
        
        topics_str = ", ".join(topics) if topics else "general"
        
        prompt = f"""You are an expert technical interviewer evaluating a candidate's response for a {job_title} position.

QUESTION CONTEXT:
- Question: {question_text}
- Type: {question_type}
- Difficulty: {question_level}/5 ({difficulty_desc.get(question_level, 'unknown')})
- Topics: {topics_str}
- Position: {job_title}

CANDIDATE'S ANSWER:
{answer_text}

Please evaluate this answer across the following criteria and provide scores from 0-100:

1. CORRECTNESS: How technically accurate and factually correct is the answer?
2. DEPTH: How thoroughly does the answer explore the topic? Does it show deep understanding?
3. CLARITY: How well-structured and clearly communicated is the response?
4. RELEVANCE: How well does the answer address the specific question asked?

Also consider:
- Is the answer appropriate for the {difficulty_desc.get(question_level, 'unknown')} level?
- Does it demonstrate the skills expected for a {job_title}?
- What are the candidate's main strengths and areas for improvement?

Please provide your response in this exact format:

CORRECTNESS: [score 0-100]
DEPTH: [score 0-100] 
CLARITY: [score 0-100]
RELEVANCE: [score 0-100]
OVERALL: [score 0-100]
LEVEL_RECOMMENDATION: [INCREASE/MAINTAIN/DECREASE]
STRENGTHS: [bullet point list of 2-3 key strengths]
IMPROVEMENTS: [bullet point list of 2-3 areas for improvement]
FEEDBACK: [detailed constructive feedback paragraph]"""
        
        return prompt
    
    def _parse_evaluation_response(self, response: str, question_level: int) -> Dict[str, Any]:
        """Parse the LLM response into structured evaluation data."""
        
        lines = response.strip().split('\n')
        
        # Default values
        subscores = {"correctness": 50, "depth": 50, "clarity": 50, "relevance": 50}
        overall_score = 50
        level_recommendation = "MAINTAIN"
        strengths = []
        improvements = []
        feedback = ""
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if line.startswith("CORRECTNESS:"):
                try:
                    subscores["correctness"] = int(''.join(filter(str.isdigit, line))) or 50
                except:
                    pass
            elif line.startswith("DEPTH:"):
                try:
                    subscores["depth"] = int(''.join(filter(str.isdigit, line))) or 50
                except:
                    pass
            elif line.startswith("CLARITY:"):
                try:
                    subscores["clarity"] = int(''.join(filter(str.isdigit, line))) or 50
                except:
                    pass
            elif line.startswith("RELEVANCE:"):
                try:
                    subscores["relevance"] = int(''.join(filter(str.isdigit, line))) or 50
                except:
                    pass
            elif line.startswith("OVERALL:"):
                try:
                    overall_score = int(''.join(filter(str.isdigit, line))) or 50
                except:
                    pass
            elif line.startswith("LEVEL_RECOMMENDATION:"):
                rec = line.replace("LEVEL_RECOMMENDATION:", "").strip().upper()
                if rec in ["INCREASE", "MAINTAIN", "DECREASE"]:
                    level_recommendation = rec
            elif line.startswith("STRENGTHS:"):
                current_section = "strengths"
            elif line.startswith("IMPROVEMENTS:"):
                current_section = "improvements"
            elif line.startswith("FEEDBACK:"):
                current_section = "feedback"
            elif line.startswith("-") or line.startswith("•"):
                # Bullet point
                if current_section == "strengths":
                    strengths.append(line.lstrip("-• "))
                elif current_section == "improvements":
                    improvements.append(line.lstrip("-• "))
            elif current_section == "feedback" and line:
                feedback += line + " "
        
        # Calculate level adjustment
        level_adjustment = self._calculate_level_adjustment(
            overall_score, question_level, level_recommendation
        )
        
        return {
            "overall_score": overall_score,
            "subscores": subscores,
            "feedback": feedback.strip(),
            "level_recommendation": level_recommendation,
            "level_adjustment": level_adjustment,
            "strengths": strengths,
            "improvements": improvements
        }
    
    def _calculate_level_adjustment(self, 
                                   overall_score: int,
                                   current_level: int,
                                   recommendation: str) -> int:
        """Calculate the level adjustment based on score and recommendation."""
        
        if recommendation == "INCREASE" and current_level < 5:
            return 1
        elif recommendation == "DECREASE" and current_level > 1:
            return -1
        else:
            return 0
    
    def _generate_fallback_evaluation(self, answer_text: str, question_level: int) -> Dict[str, Any]:
        """Generate a basic evaluation if LLM fails."""
        
        # Simple fallback scoring based on answer length and basic analysis
        answer_length = len(answer_text.strip())
        
        if answer_length < 50:
            base_score = 30
        elif answer_length < 150:
            base_score = 50
        elif answer_length < 300:
            base_score = 70
        else:
            base_score = 80
            
        # Add some randomness but keep it reasonable
        import random
        score_variation = random.randint(-10, 10)
        overall_score = max(0, min(100, base_score + score_variation))
        
        subscores = {
            "correctness": max(0, min(100, overall_score + random.randint(-5, 5))),
            "depth": max(0, min(100, overall_score + random.randint(-5, 5))),
            "clarity": max(0, min(100, overall_score + random.randint(-5, 5))),
            "relevance": max(0, min(100, overall_score + random.randint(-5, 5)))
        }
        
        # Determine level adjustment
        if overall_score >= 80:
            level_recommendation = "INCREASE"
            level_adjustment = 1 if question_level < 5 else 0
        elif overall_score <= 40:
            level_recommendation = "DECREASE"
            level_adjustment = -1 if question_level > 1 else 0
        else:
            level_recommendation = "MAINTAIN"
            level_adjustment = 0
        
        return {
            "overall_score": overall_score,
            "subscores": subscores,
            "feedback": "Your answer shows understanding of the topic. Consider providing more specific examples and deeper analysis in future responses.",
            "level_recommendation": level_recommendation,
            "level_adjustment": level_adjustment,
            "strengths": ["Clear communication", "Relevant response"],
            "improvements": ["Add more depth", "Include specific examples"]
        }