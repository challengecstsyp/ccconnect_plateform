import json
from pathlib import Path
import re

# Escape LaTeX
LATEX_ESC = {
    '&': r'\&','%': r'\%','$': r'\$','#': r'\#','_': r'\_',
    '{': r'\{','}': r'\}','~': r'\textasciitilde{}','^': r'\textasciicircum{}','\\': r'\textbackslash{}',
}

def esc(s):
    return ''.join(LATEX_ESC.get(c, c) for c in s) if isinstance(s, str) else ""

def list_to_highlights(items):
    if not items: return ""
    out = "\\begin{highlights}\n"
    for i in items:
        out += f"  \\item {esc(i)}\n"
    out += "\\end{highlights}\n"
    return out

def make_experience_block(items):
    out = ""
    for e in items:
        out += (
            f"\\begin{{twocolentry}}{{{esc(e.get('start',''))} -- {esc(e.get('end',''))}}}\n"
            f"  \\textbf{{{esc(e['title'])}}}, {esc(e['company'])}\n"
            "\\end{twocolentry}\n\n"
            "\\begin{onecolentry}\n"
            + list_to_highlights(e.get("details", [])) +
            "\\end{onecolentry}\n\n"
        )
    return out

def make_education_block(items):
    out = ""
    for e in items:
        out += (
            f"\\begin{{twocolentry}}{{{esc(e['start'])} -- {esc(e['end'])}}}\n"
            f"  \\textbf{{{esc(e['degree'])}}}, {esc(e['school'])}\n"
            "\\end{twocolentry}\n\n"
            "\\begin{onecolentry}\n"
            + list_to_highlights(e.get("details", [])) +
            "\\end{onecolentry}\n\n"
        )
    return out

def make_projects_block(items):
    out = ""
    for p in items:
        out += (
            f"\\begin{{twocolentry}}{{{esc(p.get('link',''))}}}\n"
            f"  \\textbf{{{esc(p['name'])}}}\n"
            "\\end{twocolentry}\n\n"
            "\\begin{onecolentry}\n"
            + list_to_highlights(p.get("details", [])) +
            "\\end{onecolentry}\n\n"
        )
    return out

def make_skills_block(skills):
    if not skills: return ""
    return "\\begin{highlights}\n" + \
           "\n".join(f"\\item {esc(s)}" for s in skills) + \
           "\n\\end{highlights}"

def main():
    data = json.loads(Path("resume.json").read_text(encoding="utf-8"))
    template = Path("template_rendercv.tex").read_text(encoding="utf-8")

    tex = template
    tex = tex.replace("{{name}}", esc(data.get("name","")))
    tex = tex.replace("{{location}}", esc(data.get("location","")))
    tex = tex.replace("{{email}}", esc(data.get("email","")))
    tex = tex.replace("{{phone}}", esc(data.get("phone","")))
    tex = tex.replace("{{website}}", esc(data.get("website","")))
    tex = tex.replace("{{linkedin}}", esc(data.get("linkedin","")))
    tex = tex.replace("{{github}}", esc(data.get("github","")))
    tex = tex.replace("{{summary}}", esc(data.get("summary","")))

    tex = tex.replace("{{experience_block}}", make_experience_block(data.get("experience", [])))
    tex = tex.replace("{{education_block}}", make_education_block(data.get("education", [])))
    tex = tex.replace("{{projects_block}}", make_projects_block(data.get("projects", [])))
    tex = tex.replace("{{skills_block}}", make_skills_block(data.get("skills", [])))
    tex = tex.replace("{{tech_block}}", make_skills_block(data.get("technologies", [])))

    Path("output.tex").write_text(tex, encoding="utf-8")
    print("[OK] Generated output.tex")

if __name__ == "__main__":
    main()
