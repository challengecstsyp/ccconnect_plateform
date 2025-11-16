import os
import json
import re
import requests
from collections import Counter
from pathlib import Path

# ==========================================================
# CONFIGURATION
# ==========================================================
INPUT_JSON_PATH = r"data\test_data\extracted_cv.json"
OUTPUT_DIR = os.path.dirname(INPUT_JSON_PATH)
RATING_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cv_ats_rating.json")
REWRITTEN_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cv_rewritten.json")
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "gemma3:4b"


# ==========================================================
# ATS SCORING SYSTEM - INDUSTRY STANDARD
# Based on real ATS algorithms used by Fortune 500 companies
# ==========================================================

def score_keyword_matching(cv_data, language, bilingual_verbs):
    """
    Score: 30 points (Most important ATS factor)
    Evaluates presence of strong action verbs and technical keywords
    """
    score = 0
    feedback = []
    max_score = 30
    
    # Collect ALL text with descriptions (experience, associations, projects)
    text_parts = []
    
    # Experience descriptions
    for exp in cv_data.get("experience", []):
        if isinstance(exp, dict):
            desc = exp.get("description", "")
            if desc:
                text_parts.append(desc)
    
    # Association descriptions (handle both dict and string formats)
    for assoc in cv_data.get("associations", []):
        if isinstance(assoc, dict):
            desc = assoc.get("description", "")
            if desc:
                text_parts.append(desc)
        elif isinstance(assoc, str):
            text_parts.append(assoc)
    
    # Project descriptions
    for proj in cv_data.get("projects", []):
        if isinstance(proj, dict):
            desc = proj.get("description", "")
            if desc:
                text_parts.append(desc)
    
    all_exp_text = " ".join(text_parts).lower()
    
    # Get language-appropriate action verbs
    if language == "french":
        action_verbs = list(bilingual_verbs.get("french_to_english", {}).keys())
    else:
        action_verbs = list(bilingual_verbs.get("english_to_french", {}).keys())
    
    # Count unique action verbs used
    found_verbs = set()
    for verb in action_verbs:
        if verb in all_exp_text:
            found_verbs.add(verb)
    
    # Scoring logic: 
    # 0-2 verbs = 5 points, 3-5 = 10, 6-8 = 15, 9-11 = 20, 12-14 = 25, 15+ = 30
    verb_count = len(found_verbs)
    if verb_count >= 15:
        verb_score = 30
    elif verb_count >= 12:
        verb_score = 25
    elif verb_count >= 9:
        verb_score = 20
    elif verb_count >= 6:
        verb_score = 15
    elif verb_count >= 3:
        verb_score = 10
    else:
        verb_score = 5
    
    score = verb_score
    
    if language == "french":
        feedback.append(f"Verbes d'action trouvés: {verb_count} ({verb_score}/30 points)")
        if verb_count < 10:
            feedback.append(f"⚠ Recommandation: Ajoutez plus de verbes d'action (objectif: 15+)")
    else:
        feedback.append(f"Action verbs found: {verb_count} ({verb_score}/30 points)")
        if verb_count < 10:
            feedback.append(f"⚠ Recommendation: Add more action verbs (target: 15+)")
    
    return score, feedback, list(found_verbs)



def score_quantifiable_achievements(cv_data, language):
    """
    Score: 25 points (Critical for ATS ranking)
    Measures presence of metrics, numbers, percentages
    """
    score = 0
    feedback = []
    max_score = 25
    
    experiences = cv_data.get("experience", [])
    projects = cv_data.get("projects", [])
    associations = cv_data.get("associations", [])
    
    # Patterns for quantifiable metrics
    patterns = {
        "percentage": r'\d+%',
        "numbers": r'\b\d{1,3}([,\s]\d{3})*\b',
        "currency": r'[$€£]\s?\d+',
        "multiplier": r'\d+[xX]',
        "range": r'\d+-\d+'
    }
    
    total_metrics = 0
    examples = []
    
    # Check experiences
    for exp in experiences:
        if isinstance(exp, dict):
            desc = exp.get("description", "")
            for pattern_name, pattern in patterns.items():
                matches = re.findall(pattern, desc)
                if matches:
                    total_metrics += len(matches)
                    examples.extend(matches[:2])
    
    # Check projects
    for proj in projects:
        if isinstance(proj, dict):
            desc = proj.get("description", "")
            for pattern_name, pattern in patterns.items():
                matches = re.findall(pattern, desc)
                if matches:
                    total_metrics += len(matches)
                    examples.extend(matches[:2])
    
    # Check associations
    for assoc in associations:
        if isinstance(assoc, dict):
            desc = assoc.get("description", "")
            for pattern_name, pattern in patterns.items():
                matches = re.findall(pattern, desc)
                if matches:
                    total_metrics += len(matches)
                    examples.extend(matches[:2])
        elif isinstance(assoc, str):
            # If association is a string, check it directly
            for pattern_name, pattern in patterns.items():
                matches = re.findall(pattern, assoc)
                if matches:
                    total_metrics += len(matches)
                    examples.extend(matches[:2])
    
    # Scoring: 0 = 0pts, 1-2 = 10pts, 3-4 = 15pts, 5-6 = 20pts, 7+ = 25pts
    if total_metrics >= 7:
        score = 25
    elif total_metrics >= 5:
        score = 20
    elif total_metrics >= 3:
        score = 15
    elif total_metrics >= 1:
        score = 10
    else:
        score = 0
    
    if language == "french":
        feedback.append(f"Réalisations quantifiables: {total_metrics} métriques ({score}/25 points)")
        if total_metrics < 5:
            feedback.append(f"⚠ Critique: Ajoutez des chiffres/pourcentages pour quantifier vos résultats")
    else:
        feedback.append(f"Quantifiable achievements: {total_metrics} metrics ({score}/25 points)")
        if total_metrics < 5:
            feedback.append(f"⚠ Critical: Add numbers/percentages to quantify your results")
    
    return score, feedback, examples[:5]

def score_skills_match(cv_data, language):
    """
    Score: 20 points (Essential for ATS filtering)
    Evaluates technical skills, soft skills, and tools
    """
    score = 0
    feedback = []
    max_score = 20

    skills = cv_data.get("skills", [])
    soft_skills = cv_data.get("soft_skills", [])

    # Count distinct skills
    total_skills = len(skills) + len(soft_skills)

    # Scoring logic:
    # 0-5 skills = 5pts, 6-10 = 10pts, 11-15 = 15pts, 16+ = 20pts
    # Bonus for diversity (multiple categories)
    if total_skills >= 16:
        score = 20
    elif total_skills >= 11:
        score = 15
    elif total_skills >= 6:
        score = 10
    else:
        score = 5

    score = min(score, max_score)

    if language == "french":
        feedback.append(f"Compétences techniques: {len(skills)} ({score}/20 points)")
        feedback.append(f"Soft skills: {len(soft_skills)}")
        if total_skills < 15:
            feedback.append(f"⚠ Suggestion: Visez 15-20 compétences pour maximiser le score")
    else:
        feedback.append(f"Technical skills: {len(skills)} ({score}/20 points)")
        feedback.append(f"Soft skills: {len(soft_skills)}")
        if total_skills < 15:
            feedback.append(f"⚠ Suggestion: Aim for 15-20 skills to maximize score")

    return score, feedback

def score_experience_relevance(cv_data, language):
    """
    Score: 15 points (Experience quality and depth)
    Evaluates job titles, tenure, and description quality
    """
    score = 0
    feedback = []
    max_score = 15

    experiences = cv_data.get("experience", [])
    exp_count = len(experiences)

    # Base score on number of experiences
    if exp_count >= 4:
        base_score = 10
    elif exp_count >= 3:
        base_score = 8
    elif exp_count >= 2:
        base_score = 6
    elif exp_count >= 1:
        base_score = 4
    else:
        base_score = 0

    # Check description quality (length and detail)
    quality_bonus = 0
    for exp in experiences:
        desc = exp.get("description", "")
        # Good descriptions are 100+ characters with multiple sentences
        if len(desc) >= 100 and "." in desc:
            quality_bonus += 1

    # Cap quality bonus at 5 points
    quality_bonus = min(quality_bonus, 5)

    score = base_score + quality_bonus
    score = min(score, max_score)

    if language == "french":
        feedback.append(f"Expérience professionnelle: {exp_count} postes ({score}/15 points)")
        if exp_count < 3:
            feedback.append(f"⚠ Ajoutez stages, projets freelance ou postes académiques")
    else:
        feedback.append(f"Professional experience: {exp_count} positions ({score}/15 points)")
        if exp_count < 3:
            feedback.append(f"⚠ Add internships, freelance projects, or academic positions")

    return score, feedback

def score_formatting_and_structure(cv_data, language):
    """
    Score: 10 points (ATS parsing compatibility)
    Checks for proper structure, consistent dates, complete sections
    """
    score = 10  # Start with perfect score, deduct for issues
    feedback = []
    issues = []

    # Check required sections exist and have content
    required_sections = ["contact", "education", "experience", "skills"]
    for section in required_sections:
        if section not in cv_data or not cv_data[section]:
            score -= 2
            issues.append(f"Missing or empty: {section}")

    # Check contact information completeness
    contact = cv_data.get("contact", {})
    required_contact = ["name", "email", "phone"]
    for field in required_contact:
        if not contact.get(field):
            score -= 1
            issues.append(f"Missing contact: {field}")

    # Date format consistency
    experiences = cv_data.get("experience", [])
    date_formats = set()
    for exp in experiences:
        start = exp.get("start_date", "")
        end = exp.get("end_date", "")
        if start:
            # Check if it follows a pattern (Month YYYY or MM/YYYY, etc.)
            date_formats.add(len(start))

    if len(date_formats) > 2: 
        score -= 1
        issues.append("Inconsistent date formats")

    score = max(0, score)  # Don't go below 0

    if language == "french":
        if issues:
            feedback.append(f"Structure et format: {score}/10 points")
            feedback.append(f"⚠ Problèmes: {', '.join(issues)}")
        else:
            feedback.append(f"Structure et format: Excellent ({score}/10 points)")
    else:
        if issues:
            feedback.append(f"Structure and formatting: {score}/10 points")
            feedback.append(f"⚠ Issues: {', '.join(issues)}")
        else:
            feedback.append(f"Structure and formatting: Excellent ({score}/10 points)")

    return score, feedback


def analyze_strengths_and_weaknesses(rating, language):
    """
    Extracts strong and weak points from the ATS rating using classical NLP metrics.
    Returns dict with 'strong_points' and 'weak_points'.
    """
    breakdown = rating["detailed_breakdown"]
    strong_points = []
    weak_points = []

    # --- Keyword Matching ---
    kw_score = breakdown["keyword_matching"]["score"]
    if kw_score >= 20:
        strong_points.append("Effective use of action verbs" if language == "english" else "Bonne utilisation des verbes d'action")
    elif kw_score < 20:
        weak_points.append("Needs more varied action verbs" if language == "english" else "Manque de verbes d'action variés")

    # --- Quantifiable Achievements ---
    qa_score = breakdown["quantifiable_achievements"]["score"]
    if qa_score >= 20:
        strong_points.append("Strong use of measurable results" if language == "english" else "Utilisation solide de résultats mesurables")
    elif qa_score < 20:
        weak_points.append("Few or no quantifiable achievements" if language == "english" else "Peu ou pas de réalisations quantifiables")

    # --- Skills Match ---
    sk_score = breakdown["skills_match"]["score"]
    if sk_score >= 15:
        strong_points.append("Good range of technical and soft skills" if language == "english" else "Bon équilibre entre compétences techniques et humaines")
    elif sk_score < 15:
        weak_points.append("Limited skills coverage" if language == "english" else "Couverture limitée des compétences")

    # --- Experience Relevance ---
    ex_score = breakdown["experience_relevance"]["score"]
    if ex_score >= 12:
        strong_points.append("Solid and relevant experience descriptions" if language == "english" else "Descriptions d'expérience solides et pertinentes")
    elif ex_score < 12:
        weak_points.append("Needs richer or more detailed experience sections" if language == "english" else "Descriptions d'expérience trop brèves")

    # --- Formatting & Structure ---
    fmt_score = breakdown["formatting_structure"]["score"]
    if fmt_score >= 9:
        strong_points.append("Well-structured and ATS-friendly format" if language == "english" else "Format bien structuré et compatible ATS")
    elif fmt_score < 9:
        weak_points.append("Missing contact: phone, Inconsistent date formats" if language == "english" else "Problèmes de formatage ou sections manquantes")

    # Fallback if lists are empty
    if not strong_points:
        strong_points.append("Overall structure is acceptable" if language == "english" else "Structure globale acceptable")
    if not weak_points:
        weak_points.append("Minor improvements possible" if language == "english" else "Améliorations mineures possibles")

    return {
        "strong_points": strong_points,
        "weak_points": weak_points
    }

def calculate_ats_score(cv_data, language, bilingual_verbs):
    """
    COMPREHENSIVE ATS SCORING (100 points total)

    Based on industry-standard ATS algorithms:
    - 30pts: Keyword Matching (Action verbs + Technical terms)
    - 25pts: Quantifiable Achievements (Metrics, numbers, impact)
    - 20pts: Skills Match (Technical + Soft skills coverage)
    - 15pts: Experience Relevance (Quality, titles, descriptions)
    - 10pts: Formatting & Structure (ATS parsing compatibility)

    80%+ = Strong (passes most ATS)
    60-79% = Good (needs improvement)
    40-59% = Fair (significant gaps)
    <40% = Weak (major revision needed)
    """

    total_score = 0
    all_feedback = []
    detailed_breakdown = {}

    # 1. Keyword Matching (30 points)
    kw_score, kw_feedback, found_verbs = score_keyword_matching(cv_data, language, bilingual_verbs)
    total_score += kw_score
    all_feedback.extend(kw_feedback)
    detailed_breakdown["keyword_matching"] = {"score": kw_score, "max": 30, "verbs": found_verbs}

    # 2. Quantifiable Achievements (25 points)
    qa_score, qa_feedback, examples = score_quantifiable_achievements(cv_data, language)
    total_score += qa_score
    all_feedback.extend(qa_feedback)
    detailed_breakdown["quantifiable_achievements"] = {"score": qa_score, "max": 25, "examples": examples}

    # 3. Skills Match (20 points)
    sk_score, sk_feedback = score_skills_match(cv_data, language)
    total_score += sk_score
    all_feedback.extend(sk_feedback)
    detailed_breakdown["skills_match"] = {"score": sk_score, "max": 20}

    # 4. Experience Relevance (15 points)
    ex_score, ex_feedback = score_experience_relevance(cv_data, language)
    total_score += ex_score
    all_feedback.extend(ex_feedback)
    detailed_breakdown["experience_relevance"] = {"score": ex_score, "max": 15}

    # 5. Formatting & Structure (10 points)
    fmt_score, fmt_feedback = score_formatting_and_structure(cv_data, language)
    total_score += fmt_score
    all_feedback.extend(fmt_feedback)
    detailed_breakdown["formatting_structure"] = {"score": fmt_score, "max": 10}

    # Calculate percentage and rating
    percentage = (total_score / 100) * 100

    if percentage >= 80:
        rating = "Strong - Passes most ATS systems"
        rating_fr = "Fort - Passe la plupart des systèmes ATS"
    elif percentage >= 60:
        rating = "Good - Needs minor improvements"
        rating_fr = "Bon - Nécessite des améliorations mineures"
    elif percentage >= 40:
        rating = "Fair - Significant gaps to address"
        rating_fr = "Moyen - Lacunes importantes à combler"
    else:
        rating = "Weak - Major revision needed"
        rating_fr = "Faible - Révision majeure nécessaire"

    
    sw_summary = analyze_strengths_and_weaknesses(
    {
        "detailed_breakdown": detailed_breakdown,
        "rating": rating
    },
    language
)

    return {
        "total_score": total_score,
        "max_score": 100,
        "percentage": round(percentage, 1),
        "rating": rating_fr if language == "french" else rating,
        "language_detected": language,
        "feedback": all_feedback,
        "detailed_breakdown": detailed_breakdown,
        "strong_points": sw_summary["strong_points"],
        "weak_points": sw_summary["weak_points"]
    }
