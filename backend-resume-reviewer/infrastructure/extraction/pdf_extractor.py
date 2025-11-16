import os
import json
import re
import requests
from PyPDF2 import PdfReader
from docx import Document
from pathlib import Path
import ast

# ==========================================================
# CONFIGURATION
# ==========================================================
FILE_PATH = r"data\test_data\Academic_CV_Template.pdf"
OUTPUT_DIR = os.path.dirname(FILE_PATH)
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "extracted_cv.json")
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "gemma3:4b"

# ==========================================================
# TEXT EXTRACTION
# ==========================================================
def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    elif ext in [".txt", ".tex"]:
        return extract_text_from_plain(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def extract_text_from_pdf(path):
    text = ""
    reader = PdfReader(path)
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text.strip()

def extract_text_from_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs).strip()

def extract_text_from_plain(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read().strip()

# ==========================================================
# SYSTEM PROMPT FOR EXTRACTION
# ==========================================================
SYSTEM_PROMPT = """You are an expert resume information extraction assistant.
Your task is to read a resume and extract all key information in clean, valid JSON.
Keep all extracted text (fields, descriptions, degrees, etc.) in the **original language** of the resume. Do not translate anything.

JSON FORMAT:
{
  "contact": {
    "name": "",
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "summary": ""
  },
  "education": [
    {"degree": "", "field": "", "institution": "", "start_year": "", "end_year": ""}
  ],
  "experience": [
    {"title": "", "company": "", "location": "", "start_date": "", "end_date": "", "description": ""}
  ],
  "skills": [],
  "certifications": [],
  "projects": [
    {"name": "", "description": "", "technologies": []}
  ],
  "languages": [],
  "soft_skills": [],
  "associations": []
}

Respond **only** with valid JSON. No explanations, no markdown.
"""

# ==========================================================
# OLLAMA QUERY UTILS
# ==========================================================
def query_ollama(model_name, system_prompt, user_text):
    try:
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ],
            "stream": False
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(OLLAMA_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if "message" in data:
            return data["message"]["content"]
        elif "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"]
        else:
            print("⚠️ Unexpected Ollama response format:", data)
            return ""
    except requests.exceptions.ConnectionError as e:
        error_msg = f"Ollama is not running. Please start Ollama on port 11434. Error: {str(e)}"
        print(f"❌ {error_msg}")
        raise ConnectionError(error_msg)
    except requests.exceptions.RequestException as e:
        error_msg = f"Failed to connect to Ollama: {str(e)}"
        print(f"❌ {error_msg}")
        raise ConnectionError(error_msg)

def clean_and_parse_json(raw_output):
    if not raw_output or not isinstance(raw_output, str):
        return None
    cleaned = raw_output.strip()
    cleaned = re.sub(r"```(json)?", "", cleaned, flags=re.IGNORECASE)
    cleaned = cleaned.replace("Here is the JSON:", "").replace("Here is your JSON:", "")
    cleaned = cleaned.strip()
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(1).strip()
    cleaned = cleaned.replace("“", '"').replace("”", '"').replace("’", "'")
    cleaned = re.sub(r",\s*(?=[}\]])", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        try:
            parsed = ast.literal_eval(cleaned)
            return json.loads(json.dumps(parsed, ensure_ascii=False))
        except Exception as e:
            print("⚠️ Failed to parse JSON:", e)
            return None

# ==========================================================
# MAIN EXECUTION
# ==========================================================
if __name__ == "__main__":
    text = extract_text(FILE_PATH)
    print(f"✅ Extracted text length: {len(text)} characters")

    result = query_ollama(MODEL_NAME, SYSTEM_PROMPT, text)
    parsed_json = clean_and_parse_json(result)

    if parsed_json:
        Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(parsed_json, f, indent=2, ensure_ascii=False)
        print(f"💾 Extracted resume JSON saved to: {OUTPUT_PATH}")
    else:
        print("❌ Failed to parse or save extracted resume JSON.")
