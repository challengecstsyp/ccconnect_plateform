# ==========================================================
# LANGUAGE DETECTION
# ==========================================================
import json
import re
from ..core.config import settings



def detect_language(cv_data):
    """
    Improved language detection that focuses on CONTENT, not JSON structure.
    Ignores field names like "education", "skills", "project" which are JSON keys.
    Returns: 'french' or 'english'
    """
    
    # Extract only the meaningful TEXT content (descriptions, summaries, titles)
    content_fields = []
    
    # Contact summary
    if "contact" in cv_data and "summary" in cv_data["contact"]:
        summary = cv_data["contact"].get("summary", "")
        if summary:  # Only add non-empty strings
            content_fields.append(summary)
    
    # Education - degrees, fields, institutions
    for edu in cv_data.get("education", []):
        if isinstance(edu, dict):  # Verify it's a dictionary
            content_fields.append(edu.get("degree", ""))
            content_fields.append(edu.get("field", ""))
            content_fields.append(edu.get("institution", ""))
    
    # Experience - titles, companies, descriptions
    for exp in cv_data.get("experience", []):
        if isinstance(exp, dict):
            content_fields.append(exp.get("title", ""))
            content_fields.append(exp.get("company", ""))
            content_fields.append(exp.get("description", ""))
    
    # Projects - names and descriptions
    for proj in cv_data.get("projects", []):
        if isinstance(proj, dict):
            content_fields.append(proj.get("name", ""))
            content_fields.append(proj.get("description", ""))
    
    # Certifications
    for cert in cv_data.get("certifications", []):
        if isinstance(cert, dict):
            content_fields.append(cert.get("name", ""))
        elif isinstance(cert, str):  # Sometimes it's just a string
            content_fields.append(cert)
    
    # Associations - handle both dict and string formats
    for assoc in cv_data.get("associations", []):
        if isinstance(assoc, dict):
            content_fields.append(assoc.get("name", ""))
            content_fields.append(assoc.get("role", ""))
            content_fields.append(assoc.get("description", ""))
        elif isinstance(assoc, str):  # If it's just a string
            content_fields.append(assoc)
    
    # Soft skills (actual content, not just the array name)
    soft_skills = cv_data.get("soft_skills", [])
    if isinstance(soft_skills, list):
        content_fields.extend(soft_skills)
    
    # Languages spoken
    languages = cv_data.get("languages", [])
    if isinstance(languages, list):
        content_fields.extend(languages)
    
    # Combine all actual content, filtering out None and empty strings
    content_text = " ".join([str(field) for field in content_fields if field]).lower()
    
    # French-specific words (that appear in real content, not JSON keys)
    french_indicators = [
        "étudiant", "ingénieur", "stage", "stagiaire", "développement",
        "recherche", "gestion", "mise en place", "réalisation",
        "conception", "équipe", "projet", "année", "cycle",
        "université", "école", "diplôme", "entreprise",
        "membre", "pôle", "coordination", "suivi",
        # French prepositions and articles that appear in content
        " en ", " de ", " du ", " des ", " un ", " une ", " le ", " la ", " les ",
        " dans ", " sur ", " avec ", " pour ", " par "
    ]
    
    # English-specific words
    english_indicators = [
        "student", "engineer", "intern", "internship", "development",
        "research", "management", "implementation", "design",
        "team", "project", "year", "cycle", "university",
        "school", "degree", "company", "member",
        # English prepositions and articles
        " in ", " of ", " the ", " a ", " an ", " on ", " with ",
        " for ", " by ", " and ", " to "
    ]
    
    # Count occurrences (not just presence)
    french_score = sum(content_text.count(indicator) for indicator in french_indicators)
    english_score = sum(content_text.count(indicator) for indicator in english_indicators)
    
    # Accent character check (very reliable for French)
    accent_chars = sum(1 for c in content_text if c in "éèêëàâäùûüôöïîç")
    
    # Decision logic with improved thresholds
    # 1. Strong accent presence = French (definitive)
    if accent_chars > 5:
        return "french"
    
    # 2. Clear French dominance
    if french_score > english_score * 1.2:
        return "french"
    
    # 3. Clear English dominance
    if english_score > french_score * 1.2:
        return "english"
    
    # 4. Close call - use accents as tiebreaker
    if accent_chars > 2:
        return "french"
    
    # 5. Default to English if still unclear
    return "english"



def load_bilingual_verbs():
    """Load bilingual action verbs from JSON file"""
    try:
        with open(settings.BILINGUAL_VERBS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: {settings.BILINGUAL_VERBS_PATH} not found. Using basic verbs.")
        return {
            "english_to_french": {},
            "french_to_english": {}
        }
        
        
def load_cv_json(path):
    """Load the extracted CV JSON"""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
    
    
def extract_json_from_string(s):
    """Extract first valid JSON object from string."""
    try:
        match = re.search(r'\{.*\}', s, re.DOTALL)
        if not match:
            return None
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        print(f"✗ JSON decode error: {e}")
        return None

def clean_text(t):
    if not t:
        return ""
    t = re.sub(r'[^a-zA-Z0-9\s\-\+\#\.]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip().lower()

