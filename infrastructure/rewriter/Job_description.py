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


def build_rewriting_prompt(cv_data, job_description_text, missing_keywords):
    prompt = f"""
You are an expert ATS CV optimizer.
The goal is to align the CV more closely with the job description
**without fabricating or adding fake experiences.**

You may:
- Rephrase sentences to include relevant, truthful keywords from the list below
- Highlight DevOps-related activities where technically valid
- Quantify outcomes if realistic (use safe, small metrics)
- Maintain structure and factual accuracy
- Do NOT invent new tools, jobs, or companies

### JOB DESCRIPTION ###
{job_description_text}

### RELEVANT KEYWORDS TO INCORPORATE ###
{', '.join(missing_keywords)}

### CURRENT CV ###
{json.dumps(cv_data, ensure_ascii=False, indent=2)}

Return ONLY valid JSON matching the CV structure.
"""
    return prompt

# ==========================================================
# VALIDATION
# ==========================================================
def validate_rewritten_cv(original, rewritten):
    if not rewritten:
        return original
    # Preserve core identity
    for k in ["contact", "education", "certifications", "languages", "skills"]:
        rewritten[k] = original.get(k, [])
    # Keep same counts
    for k in ["experience", "projects"]:
        if len(rewritten.get(k, [])) != len(original.get(k, [])):
            rewritten[k] = original.get(k, [])
    return rewritten

