import os
import json
import re
import requests
import math
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ==========================================================
# CONFIGURATION
# ==========================================================
INPUT_JSON_PATH = r"data\test_data\extracted_cv.json"
JOB_DESCRIPTION_PATH = r"data\test_data\job_description.txt"
OUTPUT_DIR = os.path.dirname(INPUT_JSON_PATH)
RATING_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cv_ats_rating.json")
REWRITTEN_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cv_rewritten.json")

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "gemma3:4b"

# ==========================================================
# UTILITIES
# ==========================================================
def load_json(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_text(path):
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return f.read().strip()

def extract_json_from_string(s):
    try:
        match = re.search(r'\{.*\}', s, re.DOTALL)
        if not match:
            return None
        return json.loads(match.group())
    except json.JSONDecodeError:
        return None

def clean_text(t):
    if not t:
        return ""
    t = re.sub(r'[^a-zA-Z0-9\s\-\+\#\.]', ' ', t)
    return re.sub(r'\s+', ' ', t).strip().lower()

# ==========================================================
# DETERMINISTIC ANALYSIS
# ==========================================================
def deterministic_score(cv_data, job_description_text):
    jd_text = clean_text(job_description_text)
    jd_tokens = set(jd_text.split())

    # Gather CV text
    cv_sections = []
    for section in ["experience", "projects"]:
        for item in cv_data.get(section, []):
            if isinstance(item, dict):
                cv_sections.append(item.get("description", ""))
    cv_text = clean_text(" ".join(cv_sections))

    # 1️⃣ Skill match (keyword overlap)
    jd_skill_words = [w for w in jd_tokens if len(w) > 2]
    cv_words = set(cv_text.split())
    overlap = len(cv_words.intersection(jd_skill_words))
    coverage = overlap / max(1, len(jd_skill_words)) * 100

    # 2️⃣ Cosine similarity (TF-IDF)
    tfidf = TfidfVectorizer().fit_transform([jd_text, cv_text])
    cos_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100

    # 3️⃣ Action verbs
    verbs = ["developed", "built", "designed", "implemented", "optimized",
             "managed", "deployed", "created", "automated", "enhanced"]
    verb_hits = sum(v in cv_text for v in verbs)
    action_score = min(100, (verb_hits / 10) * 100)

    # 4️⃣ Quantifiable metrics
    nums = len(re.findall(r'\d+', cv_text))
    quant_score = min(100, nums * 5)

    # 5️⃣ Experience relevance ≈ cosine sim
    exp_score = cos_sim

    # Weighted overall
    overall = (0.4 * coverage + 0.3 * exp_score +
               0.15 * quant_score + 0.15 * action_score)

    return {
        "overall_percentage": round(overall, 1),
        "skills_match": round(coverage, 1),
        "experience_relevance": round(exp_score, 1),
        "quantifiable_achievements": round(quant_score, 1),
        "action_verbs": round(action_score, 1),
        "formatting_structure": 65
    }

# ==========================================================
# LLM WRAPPER
# ==========================================================
def call_llm(prompt, task_name, temperature=0.2, max_retries=2):
    print(f"🤖 Calling LLM for {task_name}...")
    for attempt in range(max_retries):
        try:
            r = requests.post(
                OLLAMA_URL,
                json={
                    "model": MODEL_NAME,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False,
                    "options": {"temperature": temperature, "num_predict": 8192},
                },
                timeout=300,
            )
            if r.status_code != 200:
                continue
            content = r.json().get("message", {}).get("content", "")
            content = re.sub(r"```json|```", "", content).strip()
            j = extract_json_from_string(content)
            if j:
                print(f"✓ {task_name} JSON parsed successfully")
                return j
        except Exception as e:
            print(f"✗ LLM error ({task_name}): {e}")
    return None

# ==========================================================
# PROMPTS
# ==========================================================
def build_scoring_prompt(cv_data, job_description_text, det_score):
    prompt = f"""
Vous êtes un expert en évaluation ATS.
Ci-dessous se trouvent une description de poste et un CV. Vous devez renvoyer un score JSON juste et réaliste.

DESCRIPTION DU POSTE

{job_description_text}

CV

{json.dumps(cv_data, ensure_ascii=False, indent=2)}

Votre JSON doit contenir la clé "ats_rating" avec les champs numériques suivants :

overall_percentage (pourcentage global)

skills_match (correspondance des compétences)

experience_relevance (pertinence de l'expérience)

quantifiable_achievements (réalisations quantifiables)

action_verbs (verbes d'action)

formatting_structure (structure et mise en forme)

Utilisez le score déterministe ci-dessous comme guide de base (vous pouvez ajuster ±15% seulement si cela est justifié) :

{json.dumps(det_score, indent=2)}
"""
    return prompt
