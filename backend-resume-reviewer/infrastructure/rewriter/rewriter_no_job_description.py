
# ==========================================================
# LLM-BASED CV IMPROVEMENT (Bilingual)
# ==========================================================
import json
import os
import re
import requests


INPUT_JSON_PATH = r"data\test_data\extracted_cv.json"
OUTPUT_DIR = os.path.dirname(INPUT_JSON_PATH)
RATING_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cv_ats_rating.json")
REWRITTEN_OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cv_rewritten.json")
OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "gemma3:4b"



def build_improvement_prompt(cv_data, rating, language):
    """Build prompt for LLM to improve CV based on ATS gaps"""

    breakdown = rating["detailed_breakdown"]

    # Identify weak areas
    weak_areas = []
    if breakdown["keyword_matching"]["score"] < 20:
        weak_areas.append("action_verbs")
    if breakdown["quantifiable_achievements"]["score"] < 15:
        weak_areas.append("metrics")
    if breakdown["skills_match"]["score"] < 15:
        weak_areas.append("skills")
    if breakdown["experience_relevance"]["score"] < 10:
        weak_areas.append("experience_quality")

    if language == "french":
        prompt = f"""Tu es un expert en optimisation de CV pour systèmes ATS (Applicant Tracking Systems).

SCORE ATS ACTUEL: {rating['percentage']}% ({rating['total_score']}/100)
ÉVALUATION: {rating['rating']}

DÉTAILS DU SCORE:
- Verbes d'action: {breakdown['keyword_matching']['score']}/30
- Réalisations quantifiables: {breakdown['quantifiable_achievements']['score']}/25
- Compétences: {breakdown['skills_match']['score']}/20
- Expérience: {breakdown['experience_relevance']['score']}/15
- Format: {breakdown['formatting_structure']['score']}/10

CV ACTUEL (JSON):
{json.dumps(cv_data, ensure_ascii=False, indent=2)}

INSTRUCTIONS CRITIQUES POUR ATTEINDRE 90%+:

1. **VERBES D'ACTION** (objectif: 15+ verbes uniques):
   - Utilise des verbes forts: développé, conçu, optimisé, implémenté, géré, dirigé, automatisé, amélioré, créé, lancé
   - Commence CHAQUE description d'expérience par un verbe d'action différent
   - Varie les verbes (évite les répétitions)

2. **RÉALISATIONS QUANTIFIABLES** (objectif: 7+ métriques):
   - Ajoute des CHIFFRES précis dans CHAQUE expérience/projet
   - Formats: pourcentages (20%), multiplicateurs (2x), montants (10K€), nombres (15 personnes)
   - Exemple: "Réduit le temps de traitement de 40%" au lieu de "Amélioré les performances"

3. **COMPÉTENCES**:
   - Les compétences sont déjà extraites - NE LES MODIFIE PAS
   - Concentre-toi sur leur utilisation dans les descriptions

4. **QUALITÉ DES DESCRIPTIONS**:
   - Chaque description doit avoir 150-200 caractères minimum
   - Structure: [Verbe d'action] + [Action] + [Impact quantifiable] + [Technologies utilisées]
   - Exemple: "Développé une API REST avec Spring Boot gérant 10K requêtes/jour, réduisant les temps de réponse de 35%"

5. **FORMAT JSON**:
   - Garde EXACTEMENT la même structure JSON
   - Ne supprime AUCUN champ
   - Améliore uniquement les descriptions et ajoute des métriques


RÉPONDS UNIQUEMENT AVEC LE JSON AMÉLIORÉ. AUCUN TEXTE SUPPLÉMENTAIRE. TOUT EN FRANÇAIS.

IMPORTANT :

- Ne supprimez ni ne reformulez les verbes d’action forts déjà présents.

- Ne supprimez ni les chiffres ni les indicateurs.

- Ajoutez uniquement les verbes ou indicateurs manquants, ou clarifiez la formulation sans supprimer les termes clés du système de suivi des candidatures (ATS)."""

    else:
        prompt = f"""You are an expert in optimizing resumes for ATS (Applicant Tracking Systems).

CURRENT ATS SCORE: {rating['percentage']}% ({rating['total_score']}/100)
RATING: {rating['rating']}

SCORE BREAKDOWN:
- Action verbs: {breakdown['keyword_matching']['score']}/30
- Quantifiable achievements: {breakdown['quantifiable_achievements']['score']}/25
- Skills: {breakdown['skills_match']['score']}/20
- Experience: {breakdown['experience_relevance']['score']}/15
- Format: {breakdown['formatting_structure']['score']}/10

CURRENT CV (JSON):
{json.dumps(cv_data, ensure_ascii=False, indent=2)}

CRITICAL INSTRUCTIONS TO ACHIEVE 90%+:

1. **ACTION VERBS** (target: 15+ unique verbs):
   - Use strong verbs: developed, designed, optimized, implemented, managed, led, automated, improved, created, launched
   - Start EVERY experience description with a different action verb
   - Vary verbs (avoid repetition)

2. **QUANTIFIABLE ACHIEVEMENTS** (target: 7+ metrics):
   - Add SPECIFIC NUMBERS in EVERY experience/project
   - Formats: percentages (20%), multipliers (2x), amounts ($10K), numbers (15 people)
   - Example: "Reduced processing time by 40%" instead of "Improved performance"

3. **SKILLS**:
   - Skills are already extracted - DO NOT MODIFY THEM
   - Focus on using them in descriptions

4. **DESCRIPTION QUALITY**:
   - Each description must be 150-200 characters minimum
   - Structure: [Action verb] + [Action] + [Quantifiable impact] + [Technologies used]
   - Example: "Developed REST API with Spring Boot handling 10K requests/day, reducing response times by 35%"

5. **JSON FORMAT**:
   - Keep EXACTLY the same JSON structure
   - Do NOT remove ANY fields
   - Only improve descriptions and add metrics

RESPOND ONLY WITH THE IMPROVED JSON. NO ADDITIONAL TEXT. EVERYTHING IN ENGLISH.
 IMPORTANT:
- Do NOT remove or reword strong action verbs already present.
- Do NOT remove numbers or metrics.
- Only add missing verbs, metrics, or clarify wording without removing key ATS terms."""

    return prompt

def improve_cv_with_llm(cv_data, rating, language):
    """Send CV to LLM for ATS-optimized improvement"""
    prompt = build_improvement_prompt(cv_data, rating, language)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "options": {"temperature": 0.7, "num_predict": 4096}
            },
            timeout=180
        )

        if response.status_code == 200:
            content = response.json()["message"]["content"]

            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                improved_cv = json.loads(json_match.group())
                return improved_cv
            else:
                print("No valid JSON found in LLM response")
                return None
        else:
            print(f"LLM request failed with status {response.status_code}")
            return None

    except Exception as e:
        print(f"Error during LLM improvement: {e}")
        return None
