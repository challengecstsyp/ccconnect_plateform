"""
Interviewer Agent - Question Generation Module

This module handles the generation of interview questions using Ollama LLM
based on job requirements, difficulty level, and adaptive learning context.
"""

import os
from typing import Dict, List, Any, Optional
from ollama import Client

try:
    from utils.config import QuestionConfig, get_job_categories, InterviewConfig, OllamaConfig
    from utils.id_utils import generate_short_id
except ImportError:
    # Fallback for direct execution
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent))
    from utils.config import QuestionConfig, get_job_categories, InterviewConfig, OllamaConfig
    from utils.id_utils import generate_short_id


class InterviewerAgent:
    """
    Agent responsible for generating contextual interview questions using Ollama LLM.
    
    This agent adapts question difficulty and content based on:
    - Job title and requirements
    - Current difficulty level
    - Keywords and focus areas
    - Previous question history
    - Soft vs technical skills ratio
    """
    
    def __init__(self):
        """Initialize the interviewer agent with Ollama client."""
        # Configure headers only if API key is provided
        headers = {}
        if OllamaConfig.OLLAMA_API_KEY and OllamaConfig.OLLAMA_API_KEY.strip():
            headers['Authorization'] = f'Bearer {OllamaConfig.OLLAMA_API_KEY}'
        
        self.client = Client(
            host=OllamaConfig.OLLAMA_HOST,
            headers=headers if headers else None
        )
        
    def generate_question(self, 
                         job_title: str,
                         level: int,
                         keywords: List[str],
                         question_type: str,
                         language: str = "en",
                         previous_questions: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Generate a contextual interview question using Ollama LLM.
        
        Args:
            job_title: Target job position
            level: Difficulty level (1-5, where 5 is hardest)
            keywords: List of relevant keywords/topics
            question_type: Type of question ("technical" or "soft")
            language: Language for the question (default: "en")
            previous_questions: List of previously asked questions to avoid repetition
            
        Returns:
            Dictionary containing:
            - question_id: Unique identifier for the question
            - question_text: The generated question
            - question_type: Type of question
            - level: Difficulty level
            - estimated_time: Estimated time to answer (minutes)
            - topics: List of topics the question covers
            - context: Additional context or hints for the candidate
        """
        try:
            # Construct the prompt for question generation
            prompt = self._build_question_prompt(
                job_title, level, keywords, question_type, language, previous_questions
            )
            
            # Generate question using Ollama
            messages = [{"role": "user", "content": prompt}]
            
            response_parts = []
            for part in self.client.chat(
                OllamaConfig.OLLAMA_MODEL,
                messages=messages,
                stream=True,
                options={
                    "temperature": OllamaConfig.TEMPERATURE,
                    "top_p": OllamaConfig.TOP_P,
                    "num_predict": OllamaConfig.MAX_TOKENS
                }
            ):
                if 'message' in part and 'content' in part['message']:
                    response_parts.append(part['message']['content'])
            
            response_text = ''.join(response_parts)
            
            # Parse the LLM response to extract structured question data
            return self._parse_question_response(response_text, level, question_type)
            
        except Exception as e:
            print(f"Error generating question with Ollama: {e}")
            # Fallback to a basic question if LLM fails
            return self._generate_fallback_question(job_title, level, question_type)
    
    def _build_question_prompt(self, 
                              job_title: str,
                              level: int,
                              keywords: List[str],
                              question_type: str,
                              language: str,
                              previous_questions: Optional[List[str]]) -> str:
        """Build the prompt for question generation."""
        
        difficulty_desc = {
            1: "entry-level/junior",
            2: "junior",
            3: "mid-level",
            4: "senior",
            5: "expert/architect"
        }
        
        keywords_str = ", ".join(keywords) if keywords else "general skills"
        previous_str = ""
        if previous_questions:
            previous_str = f"\n\nPrevious questions asked (avoid similar topics):\n" + "\n".join(f"- {q}" for q in previous_questions[-3:])
        
        prompt = f"""You are an expert technical interviewer. Generate a SHORT, QUIZ-LIKE {question_type} question for a {job_title} position.

CRITICAL REQUIREMENTS:
- Difficulty level: {level}/5 ({difficulty_desc.get(level, 'unknown')}) - STRICTLY follow this difficulty level
- Focus areas: {keywords_str}
- Question type: {question_type}
- Language: {language}

QUESTION STYLE REQUIREMENTS:
1. CONCISE and DIRECT - maximum 1-2 sentences
2. QUIZ-LIKE format - test specific knowledge, not scenarios
3. APPROPRIATE for {difficulty_desc.get(level, 'unknown')} level - not harder!
4. Quick to read and understand
5. Focused on ONE specific concept

DIFFICULTY LEVEL GUIDELINES:
- Level 1 (entry-level): Basic definitions, simple concepts, fundamental knowledge
- Level 2 (junior): Basic application, simple tools, common practices  
- Level 3 (mid-level): Practical application, intermediate concepts, best practices
- Level 4 (senior): Advanced concepts, complex scenarios, design decisions
- Level 5 (expert): Cutting-edge technologies, architecture, leadership decisions

EXAMPLES FOR REFERENCE:
Level 1: "What is Git and why is it used in software development?"
Level 2: "Name three common Python data types and their use cases."
Level 3: "Explain the difference between supervised and unsupervised machine learning."
Level 4: "How would you optimize a machine learning model that's overfitting?"
Level 5: "Design a distributed ML pipeline architecture for real-time predictions."

Please provide your response in this exact format:

QUESTION: [Your SHORT quiz question here - 1-2 sentences max]
TOPICS: [comma-separated list of 2-3 main topics]
TIME: [estimated minutes: 2-3 for levels 1-2, 3-5 for levels 3-4, 5-7 for level 5]
CONTEXT: [brief context if needed, or leave empty for straightforward questions]

{previous_str}"""
        
        return prompt
    
    def _parse_question_response(self, response: str, level: int, question_type: str) -> Dict[str, Any]:
        """Parse the LLM response into structured question data."""
        
        lines = response.strip().split('\n')
        question_text = ""
        topics = []
        estimated_time = 5  # default
        context = ""
        
        for line in lines:
            line = line.strip()
            if line.startswith("QUESTION:"):
                question_text = line.replace("QUESTION:", "").strip()
                if not question_text:
                    continue
            elif line.startswith("TOPICS:"):
                topics_str = line.replace("TOPICS:", "").strip()
                topics = [t.strip() for t in topics_str.split(",") if t.strip()]
            elif line.startswith("TIME:"):
                time_str = line.replace("TIME:", "").strip()
                try:
                    estimated_time = int(''.join(filter(str.isdigit, time_str))) or 5
                except:
                    estimated_time = 5
            elif line.startswith("CONTEXT:"):
                context = line.replace("CONTEXT:", "").strip()
        
        # Additional cleanup for question text
        if question_text:
            # Remove any extra whitespace and newlines
            question_text = ' '.join(question_text.split())
            # Remove any stray formatting markers
            for marker in ["QUESTION:", "TOPICS:", "TIME:", "CONTEXT:", "Topic:", "Topics:", "Time:", "Context:"]:
                question_text = question_text.replace(marker, "").strip()
            # Remove any leading/trailing punctuation that might be artifacts
            question_text = question_text.strip('.,;:-')
        
        # Fallback if parsing failed
        if not question_text:
            # Try to extract just the first meaningful line
            clean_lines = [line.strip() for line in lines if line.strip() and not any(marker.lower() in line.lower() for marker in ["question:", "topics:", "time:", "context:"])]
            if clean_lines:
                question_text = clean_lines[0].strip('.,;:-')
            else:
                question_text = response.strip()
        
        return {
            "question_id": generate_short_id(),
            "question_text": question_text,
            "question_type": question_type,
            "level": level,
            "estimated_time": estimated_time,
            "topics": topics or ["general"],
            "context": context
        }
    
    def _generate_fallback_question(self, job_title: str, level: int, question_type: str) -> Dict[str, Any]:
        """Generate a basic fallback question if LLM fails."""
        
        fallback_questions = {
            ("software_engineer", "technical"): {
                1: "Explain what a variable is in programming and give an example.",
                2: "What is the difference between a list and a dictionary in Python?",
                3: "How would you implement a function to reverse a string?",
                4: "Design a simple REST API for a todo application.",
                5: "How would you design a distributed system for handling millions of users?"
            },
            ("software_engineer", "soft"): {
                1: "Tell me about a time you had to learn something new quickly.",
                2: "How do you handle feedback on your code?",
                3: "Describe how you would approach a project with unclear requirements.",
                4: "How do you mentor junior developers?",
                5: "How would you lead a team through a major technical decision?"
            }
        }
        
        # Get fallback question or create a generic one
        key = (job_title.lower().replace(" ", "_"), question_type)
        if key in fallback_questions and level in fallback_questions[key]:
            question_text = fallback_questions[key][level]
        else:
            question_text = f"Describe your experience with {question_type} aspects of {job_title} work."
        
        return {
            "question_id": generate_short_id(),
            "question_text": question_text,
            "question_type": question_type,
            "level": level,
            "estimated_time": 5,
            "topics": [question_type, job_title.lower().replace(" ", "_")],
            "context": "Please provide specific examples where possible."
        }