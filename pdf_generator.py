import json
from fpdf import FPDF
from pathlib import Path
import sys
import unicodedata
import subprocess
from typing import List

def generate_pdfs_from_json(json_path: str, output_folder: str):
    """
    Reads a JSON file containing CVs and creates a PDF for each CV with the person's name.
    """
    output_folder = Path(output_folder)
    output_folder.mkdir(parents=True, exist_ok=True)

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    def _sanitize_text(s: str) -> str:
        if not s:
            return ""
        # replace common Unicode punctuation that latin-1 can't encode
        s = s.replace('\u2013', '-')  # en-dash
        s = s.replace('\u2014', '-')  # em-dash
        s = s.replace('\u2018', "'")
        s = s.replace('\u2019', "'")
        s = s.replace('\u201c', '"')
        s = s.replace('\u201d', '"')
        # normalize and strip accents (transliterate to ASCII)
        normalized = unicodedata.normalize('NFKD', s)
        ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
        return ascii_text

    generated = 0
    for idx, cv in enumerate(data, start=1):
        # prefer `full_name` (as in sample_cvs.json), fall back to `name` then id
        name = cv.get("full_name") or cv.get("name") or f"candidate_{cv.get('id', idx)}"
        title = _sanitize_text(str(cv.get("title", "")))
        years = cv.get("years_experience", "")
        summary = _sanitize_text(str(cv.get("summary", "")))
        skills = cv.get("skills", [])
        experience = cv.get("experience", [])
        education = cv.get("education", [])
        cv_text = _sanitize_text(str(cv.get("cv_text", "")))

        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Header: name
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, txt=_sanitize_text(name), ln=True)

        # Subheader: title and years
        header_line = title
        if years:
            header_line = f"{header_line} - {years} yrs" if header_line else f"{years} yrs"
        if header_line:
            pdf.set_font("Arial", '', 12)
            pdf.cell(0, 8, txt=header_line, ln=True)

        pdf.ln(4)

        # Summary / main text
        if summary or cv_text:
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 7, txt="Summary", ln=True)
            pdf.set_font("Arial", '', 11)
            body = summary if summary else cv_text
            pdf.multi_cell(0, 6, txt=_sanitize_text(body))
            pdf.ln(3)

        # Skills
        if skills:
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 7, txt="Skills", ln=True)
            pdf.set_font("Arial", '', 11)
            skills_line = ", ".join([_sanitize_text(str(s)) for s in skills])
            pdf.multi_cell(0, 6, txt=skills_line)
            pdf.ln(3)

        # Experience
        if experience:
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 7, txt="Experience", ln=True)
            pdf.ln(1)
            pdf.set_font("Arial", '', 11)
            for exp in experience:
                role = _sanitize_text(str(exp.get("role", "")))
                company = _sanitize_text(str(exp.get("company", "")))
                duration = _sanitize_text(str(exp.get("duration", "")))
                header = "".join([p for p in [role, (" at " + company) if company else "", (" - " + duration) if duration else ""]])
                if header:
                    pdf.set_font("Arial", 'B', 11)
                    pdf.multi_cell(0, 6, txt=header)
                resp = exp.get("responsibilities", [])
                if resp:
                    pdf.set_font("Arial", '', 11)
                    for r in resp:
                        # simple bullet
                        pdf.multi_cell(0, 6, txt=f"- {_sanitize_text(str(r))}")
                pdf.ln(2)

        # Education
        if education:
            pdf.set_font("Arial", 'B', 12)
            pdf.cell(0, 7, txt="Education", ln=True)
            pdf.set_font("Arial", '', 11)
            for edu in education:
                degree = _sanitize_text(str(edu.get("degree", "")))
                field = _sanitize_text(str(edu.get("field", "")))
                inst = _sanitize_text(str(edu.get("institution", "")))
                line = ", ".join([p for p in [degree, field, inst] if p])
                if line:
                    pdf.multi_cell(0, 6, txt=line)
            pdf.ln(2)

        # fallback: if no structured content was present, include cv_text
        if not (summary or skills or experience or education) and cv_text:
            pdf.set_font("Arial", '', 11)
            pdf.multi_cell(0, 6, txt=cv_text)

        # Make a filesystem-safe filename and prepend id to avoid overwriting duplicates
        safe_name = "".join(c for c in _sanitize_text(name) if c.isalnum() or c in (" ", "_")).rstrip()
        unique_prefix = cv.get("id") or idx
        pdf_file_path = output_folder / f"{unique_prefix}_{safe_name}.pdf"

        try:
            pdf.output(str(pdf_file_path))
            generated += 1
        except Exception as e:
            print(f"Failed to write PDF for '{name}' -> {e}")

    print(f"Generated {generated}/{len(data)} PDFs in '{output_folder}'")


def _latex_escape(s: str) -> str:
    """Escape basic LaTeX special characters. Keep UTF-8 — template uses utf8.
    """
    if s is None:
        return ""
    replacements = {
        '\\': '\\textbackslash{}',
        '%': '\\%',
        '&': '\\&',
        '$': '\\$',
        '#': '\\#',
        '_': '\\_',
        '{': '\\{',
        '}': '\\}',
        '~': '\\textasciitilde{}',
        '^': '\\textasciicircum{}'
    }
    out = s
    for k, v in replacements.items():
        out = out.replace(k, v)
    return out


def _build_experience_block(experience: List[dict]) -> str:
    parts: List[str] = []
    for exp in experience:
        role = _latex_escape(str(exp.get('role', '')))
        company = _latex_escape(str(exp.get('company', '')))
        duration = _latex_escape(str(exp.get('duration', '')))
        header = ''
        if role or company:
            header = role
            if company:
                header += f' at {company}'
            if duration:
                header += f' -- {duration}'
        parts.append('\\begin{onecolentry}')
        if header:
            parts.append(f'\\textbf{{{header}}}\\\\')
        resp = exp.get('responsibilities', []) or []
        if resp:
            parts.append('\\begin{highlights}')
            for r in resp:
                parts.append('\\item ' + _latex_escape(str(r)))
            parts.append('\\end{highlights}')
        parts.append('\\end{onecolentry}')
    return '\n'.join(parts)


def _build_education_block(education: List[dict]) -> str:
    parts: List[str] = []
    for edu in education:
        degree = _latex_escape(str(edu.get('degree', '')))
        field = _latex_escape(str(edu.get('field', '')))
        inst = _latex_escape(str(edu.get('institution', '')))
        line = ', '.join([p for p in [degree, field, inst] if p])
        parts.append('\\begin{onecolentry}')
        if line:
            parts.append(line)
        parts.append('\\end{onecolentry}')
    return '\n'.join(parts)


def generate_pdfs_from_json_using_latex(json_path: str, output_folder: str, template_path: str = 'templates/cv_template.tex', run_pdflatex: bool = True):
    output_folder = Path(output_folder)
    output_folder.mkdir(parents=True, exist_ok=True)

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    tpl_path = Path(template_path)
    if not tpl_path.exists():
        print(f"LaTeX template not found at {tpl_path}")
        return
    tpl = tpl_path.read_text(encoding='utf-8')

    generated = 0
    for idx, cv in enumerate(data, start=1):
        name = str(cv.get('full_name') or cv.get('name') or f'candidate_{cv.get("id", idx)}')
        context = {
            'name': _latex_escape(name),
            'location': _latex_escape(str(cv.get('location', ''))),
            'email': _latex_escape(str(cv.get('email', ''))),
            'phone': _latex_escape(str(cv.get('phone', ''))),
            'website': _latex_escape(str(cv.get('website', ''))),
            'linkedin': _latex_escape(str(cv.get('linkedin', ''))),
            'github': _latex_escape(str(cv.get('github', ''))),
            'summary': _latex_escape(str(cv.get('summary', '') or cv.get('cv_text', ''))),
            'experience_block': _build_experience_block(cv.get('experience', [])),
            'education_block': _build_education_block(cv.get('education', [])),
            'skills_block': '\\begin{highlights}\\item ' + ' \\item '.join([_latex_escape(str(s)) for s in cv.get('skills', [])]) + '\\end{highlights}' if cv.get('skills') else '',
            'projects_block': '',
            'tech_block': '\\begin{highlights}\\item ' + ' \\item '.join([_latex_escape(str(t)) for t in cv.get('technologies', [])]) + '\\end{highlights}' if cv.get('technologies') else ''
        }

        tex = tpl
        for k, v in context.items():
            tex = tex.replace('{{' + k + '}}', v)

        safe_name = ''.join(c for c in name if c.isalnum() or c in (' ', '_')).rstrip()
        base = f"{cv.get('id') or idx}_{safe_name}"
        tex_path = output_folder / f"{base}.tex"
        pdf_path = output_folder / f"{base}.pdf"

        tex_path.write_text(tex, encoding='utf-8')

        compiled = False
        if run_pdflatex:
            try:
                subprocess.run(['pdflatex', '-interaction=nonstopmode', tex_path.name], cwd=output_folder, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                subprocess.run(['pdflatex', '-interaction=nonstopmode', tex_path.name], cwd=output_folder, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                compiled = pdf_path.exists()
            except FileNotFoundError:
                print('pdflatex not found. .tex files have been written; install MiKTeX/TeX Live to compile.')
            except subprocess.CalledProcessError:
                print(f'pdflatex failed for {tex_path.name}. Check .log in {output_folder}')

        if compiled:
            generated += 1
        else:
            generated += 1

    print(f"LaTeX: generated {generated}/{len(data)} outputs (PDF or .tex) in '{output_folder}'")



if __name__ == "__main__":
    # Backwards compatible CLI: allow optional '--latex' flag
    if len(sys.argv) < 3:
        print("Usage: python pdf_generator.py <json_path> <output_folder> [--latex]")
        sys.exit(1)

    json_file = sys.argv[1]
    pdf_folder = sys.argv[2]
    use_latex = '--latex' in sys.argv[3:]
    if use_latex:
        generate_pdfs_from_json_using_latex(json_file, pdf_folder)
    else:
        generate_pdfs_from_json(json_file, pdf_folder)
