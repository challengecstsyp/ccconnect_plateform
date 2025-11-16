"""
LaTeX to PDF generator for CVs.
Converts JSON CV data to LaTeX and then to PDF.
"""
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import os

# Escape LaTeX special characters
LATEX_ESC = {
    '&': r'\&', '%': r'\%', '$': r'\$', '#': r'\#', '_': r'\_',
    '{': r'\{', '}': r'\}', '~': r'\textasciitilde{}', 
    '^': r'\textasciicircum{}', '\\': r'\textbackslash{}',
}

def esc(s):
    """Escape LaTeX special characters and remove/replace problematic Unicode."""
    if not isinstance(s, str):
        return ""
    
    # Handle URLs specially - don't escape
    if s.startswith('http://') or s.startswith('https://'):
        return s
    
    # Replace problematic Unicode characters FIRST
    # U+223C (∼) - Tilde operator -> convert to LaTeX sim
    s = s.replace('\u223c', r'$\sim$')
    s = s.replace('∼', r'$\sim$')
    
    # Remove other common problematic Unicode
    s = s.replace('\u2013', '--')  # En dash
    s = s.replace('\u2014', '---')  # Em dash
    s = s.replace('\u2018', '`')   # Left single quote
    s = s.replace('\u2019', "'")   # Right single quote
    s = s.replace('\u201c', '``')  # Left double quote
    s = s.replace('\u201d', "''")  # Right double quote
    s = s.replace('\u2026', '...')  # Ellipsis
    s = s.replace('\u00a0', ' ')   # Non-breaking space
    s = s.replace('\u202f', ' ')   # Narrow non-breaking space
    s = s.replace('\u200b', '')    # Zero-width space
    
    # Now apply LaTeX escaping
    s = s.replace('\\', r'\textbackslash{}')
    s = s.replace('&', r'\&')
    s = s.replace('%', r'\%')
    s = s.replace('$', r'\$')
    s = s.replace('#', r'\#')
    s = s.replace('_', r'\_')
    s = s.replace('{', r'\{')
    s = s.replace('}', r'\}')
    s = s.replace('~', r'\textasciitilde{}')
    s = s.replace('^', r'\textasciicircum{}')
    
    return s


def list_to_highlights(items):
    """Convert a list of items to LaTeX highlights environment."""
    if not items:
        return ""
    out = "\\begin{highlights}\n"
    for i in items:
        out += f"  \\item {esc(i)}\n"
    out += "\\end{highlights}\n"
    return out

def make_experience_block(items):
    """Generate LaTeX for experience section."""
    out = ""
    for e in items:
        start = e.get('start') or e.get('start_date') or ''
        end = e.get('end') or e.get('end_date') or 'Present'
        
        if start is None:
            start = ''
        if end is None:
            end = 'Present'
            
        out += (
            f"\\begin{{twocolentry}}{{{esc(str(start))} -- {esc(str(end))}}}\n"
            f"  \\textbf{{{esc(e.get('title', 'N/A'))}}}, {esc(e.get('company', 'N/A'))}\n"
            "\\end{twocolentry}\n\n"
            "\\begin{onecolentry}\n"
        )
        
        details = e.get('details', [])
        if not details and e.get('description'):
            details = [e['description']]
        
        out += list_to_highlights(details)
        out += "\\end{onecolentry}\n\n"
    
    return out

def make_education_block(items):
    """Generate LaTeX for education section."""
    out = ""
    for e in items:
        start = e.get('start') or e.get('start_year') or e.get('start_date') or ''
        end = e.get('end') or e.get('end_year') or e.get('end_date') or 'Present'
        
        if start is None:
            start = ''
        if end is None:
            end = 'Present'
        
        degree = e.get('degree') or e.get('field') or 'Degree'
        institution = e.get('school') or e.get('institution') or 'Institution'
        
        out += (
            f"\\begin{{twocolentry}}{{{esc(str(start))} -- {esc(str(end))}}}\n"
            f"  \\textbf{{{esc(degree)}}}, {esc(institution)}\n"
            "\\end{twocolentry}\n\n"
            "\\begin{onecolentry}\n"
            + list_to_highlights(e.get("details", [])) +
            "\\end{onecolentry}\n\n"
        )
    return out

def make_projects_block(items):
    """Generate LaTeX for projects section."""
    out = ""
    for p in items:
        link = p.get('link', '') or ''
        name = p.get('name', 'Project')
        
        out += (
            f"\\begin{{twocolentry}}{{{esc(link)}}}\n"
            f"  \\textbf{{{esc(name)}}}\n"
            "\\end{twocolentry}\n\n"
            "\\begin{onecolentry}\n"
        )
        
        details = p.get('details', [])
        if not details and p.get('description'):
            description = p['description']
            technologies = p.get('technologies', [])
            if technologies:
                tech_str = ', '.join(technologies)
                details = [f"{description} ({tech_str})"]
            else:
                details = [description]
        
        out += list_to_highlights(details)
        out += "\\end{onecolentry}\n\n"
    
    return out

def make_skills_block(skills):
    """Generate LaTeX for skills section."""
    if not skills:
        return ""
    return "\\begin{highlights}\n" + \
           "\n".join(f"\\item {esc(s)}" for s in skills) + \
           "\n\\end{highlights}"

def make_certifications_block(items):
    """Generate LaTeX for certifications section."""
    if not items:
        return ""
    out = "\\begin{highlights}\n"
    for cert in items:
        if isinstance(cert, str):
            out += f"\\item {esc(cert)}\n"
        elif isinstance(cert, dict):
            name = cert.get('name', '')
            issuer = cert.get('issuer', '')
            date = cert.get('date', '')
            if issuer and date:
                out += f"\\item {esc(name)} - {esc(issuer)} ({esc(date)})\n"
            elif issuer:
                out += f"\\item {esc(name)} - {esc(issuer)}\n"
            else:
                out += f"\\item {esc(name)}\n"
    out += "\\end{highlights}\n"
    return out

def make_languages_block(items):
    """Generate LaTeX for languages section."""
    if not items:
        return ""
    out = "\\begin{highlights}\n"
    for lang in items:
        if isinstance(lang, str):
            out += f"\\item {esc(lang)}\n"
        elif isinstance(lang, dict):
            name = lang.get('name', '')
            level = lang.get('level', '')
            if level:
                out += f"\\item {esc(name)} - {esc(level)}\n"
            else:
                out += f"\\item {esc(name)}\n"
    out += "\\end{highlights}\n"
    return out

def make_associations_block(items):
    """Generate LaTeX for associations section."""
    if not items:
        return ""
    out = ""
    for assoc in items:
        if isinstance(assoc, str):
            out += f"\\begin{{onecolentry}}\n{esc(assoc)}\n\\end{{onecolentry}}\n\n"
        elif isinstance(assoc, dict):
            name = assoc.get('name', '')
            role = assoc.get('role', '')
            start = assoc.get('start', '')
            end = assoc.get('end', 'Present')
            
            if start or end:
                date_str = f"{start} -- {end}" if start else end
                out += f"\\begin{{twocolentry}}{{{esc(date_str)}}}\n"
                if role:
                    out += f"  \\textbf{{{esc(role)}}}, {esc(name)}\n"
                else:
                    out += f"  \\textbf{{{esc(name)}}}\n"
                out += "\\end{twocolentry}\n\n"
            else:
                out += f"\\begin{{onecolentry}}\n\\textbf{{{esc(name)}}}\n\\end{{onecolentry}}\n\n"
    return out

def generate_latex_from_cv(cv_data: Dict[str, Any], template_path: Optional[Path] = None) -> str:
    """Generate LaTeX content from CV JSON data."""
    if template_path is None:
        template_path = Path(__file__).parent / "template_rendercv.tex"
    
    # Check if template exists
    if not template_path.exists():
        raise FileNotFoundError(f"Template not found: {template_path}")
    
    template = template_path.read_text(encoding="utf-8")
    
    contact = cv_data.get('contact', {})
    
    tex = template
    tex = tex.replace("{{name}}", esc(contact.get("name") or cv_data.get("name", "")))
    tex = tex.replace("{{location}}", esc(contact.get("location") or cv_data.get("location", "")))
    tex = tex.replace("{{email}}", esc(contact.get("email") or cv_data.get("email", "")))
    tex = tex.replace("{{phone}}", esc(contact.get("phone") or cv_data.get("phone", "")))
    tex = tex.replace("{{website}}", esc(contact.get("website") or cv_data.get("website", "")))
    tex = tex.replace("{{linkedin}}", esc(contact.get("linkedin") or cv_data.get("linkedin", "")))
    tex = tex.replace("{{github}}", esc(contact.get("github") or cv_data.get("github", "")))
    
    summary = contact.get("summary") or cv_data.get("summary", "")
    if summary:
        summary_section = f"\\section{{Summary}}\n\\begin{{onecolentry}}\n{esc(summary)}\n\\end{{onecolentry}}\n\n"
    else:
        summary_section = ""
    tex = tex.replace("{{summary_section}}", summary_section)
    
    experience = cv_data.get("experience", [])
    if experience:
        exp_section = f"\\section{{Experience}}\n{make_experience_block(experience)}"
    else:
        exp_section = ""
    tex = tex.replace("{{experience_section}}", exp_section)
    
    education = cv_data.get("education", [])
    if education:
        edu_section = f"\\section{{Education}}\n{make_education_block(education)}"
    else:
        edu_section = ""
    tex = tex.replace("{{education_section}}", edu_section)
    
    skills = cv_data.get("skills", [])
    if skills:
        skills_section = f"\\section{{Skills}}\n{make_skills_block(skills)}"
    else:
        skills_section = ""
    tex = tex.replace("{{skills_section}}", skills_section)
    
    certifications = cv_data.get("certifications", [])
    if certifications:
        cert_section = f"\\section{{Certifications}}\n{make_certifications_block(certifications)}"
    else:
        cert_section = ""
    tex = tex.replace("{{certifications_section}}", cert_section)
    
    projects = cv_data.get("projects", [])
    if projects:
        proj_section = f"\\section{{Projects}}\n{make_projects_block(projects)}"
    else:
        proj_section = ""
    tex = tex.replace("{{projects_section}}", proj_section)
    
    languages = cv_data.get("languages", [])
    if languages:
        lang_section = f"\\section{{Languages}}\n{make_languages_block(languages)}"
    else:
        lang_section = ""
    tex = tex.replace("{{languages_section}}", lang_section)
    
    soft_skills = cv_data.get("soft_skills", [])
    if soft_skills:
        soft_section = f"\\section{{Soft Skills}}\n{make_skills_block(soft_skills)}"
    else:
        soft_section = ""
    tex = tex.replace("{{soft_skills_section}}", soft_section)
    
    associations = cv_data.get("associations", [])
    if associations:
        assoc_section = f"\\section{{Professional Associations}}\n{make_associations_block(associations)}"
    else:
        assoc_section = ""
    tex = tex.replace("{{associations_section}}", assoc_section)
    
    # DEBUG: Save generated LaTeX for inspection
    debug_file = Path(tempfile.gettempdir()) / "debug_cv.tex"
    debug_file.write_text(tex, encoding="utf-8")
    print(f"📝 Generated LaTeX saved to: {debug_file}")
    
    return tex

def compile_latex_to_pdf(latex_content: str, output_dir: Optional[Path] = None) -> Optional[bytes]:
    """Compile LaTeX content to PDF."""
    try:
        if output_dir is None:
            temp_dir = tempfile.mkdtemp()
        else:
            temp_dir = str(output_dir)
            os.makedirs(temp_dir, exist_ok=True)
        
        temp_dir_path = Path(temp_dir)
        tex_file = temp_dir_path / "resume.tex"
        pdf_file = temp_dir_path / "resume.pdf"
        log_file = temp_dir_path / "resume.log"
        
        # Write LaTeX file with UTF-8 encoding
        tex_file.write_text(latex_content, encoding="utf-8")
        print(f"📄 LaTeX file written to: {tex_file}")
        
        # Compile LaTeX to PDF
        for i in range(2):
            print(f"🔨 Compiling LaTeX (pass {i+1}/2)...")
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", str(temp_dir), str(tex_file)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
                timeout=30
            )
            
            if result.returncode != 0:
                # Read log file for detailed error
                error_details = "No log file found"
                if log_file.exists():
                    log_content = log_file.read_text(encoding='utf-8', errors='ignore')
                    error_lines = [line for line in log_content.split('\n') if '!' in line or 'Error' in line]
                    if error_lines:
                        error_details = '\n'.join(error_lines[-15:])
                
                print(f"❌ LaTeX compilation failed on pass {i+1}")
                print(f"Return code: {result.returncode}")
                print(f"STDERR: {result.stderr.decode('utf-8', errors='ignore')}")
                print(f"LOG ERRORS:\n{error_details}")
                
                # FIX: Save log with proper UTF-8 encoding on Windows
                if log_file.exists():
                    try:
                        debug_log = Path(tempfile.gettempdir()) / "latex_error.log"
                        # FIXED: Force UTF-8 encoding on Windows
                        with open(debug_log, 'w', encoding='utf-8') as f:
                            f.write(log_file.read_text(encoding='utf-8', errors='ignore'))
                        print(f"📋 Full log saved to: {debug_log}")
                    except Exception as e:
                        print(f"⚠️ Could not save debug log: {e}")
                
                if i == 1:
                    return None
        
        # Check if PDF was created
        if pdf_file.exists():
            file_size = pdf_file.stat().st_size
            if file_size > 0:
                pdf_bytes = pdf_file.read_bytes()
                print(f"✅ PDF generated successfully: {len(pdf_bytes)} bytes")
                return pdf_bytes
            else:
                print("❌ PDF file is empty (0 bytes)")
                return None
        else:
            print("❌ PDF file was not created")
            return None
            
    except subprocess.TimeoutExpired:
        print("❌ LaTeX compilation timed out after 30 seconds")
        return None
    except FileNotFoundError:
        print("❌ pdflatex not found. Install LaTeX: https://miktex.org/download")
        return None
    except Exception as e:
        print(f"❌ Error compiling LaTeX to PDF: {e}")
        import traceback
        traceback.print_exc()
        return None


def generate_pdf_from_cv(cv_data: Dict[str, Any], template_path: Optional[Path] = None) -> Optional[bytes]:
    """Generate PDF from CV JSON data."""
    latex_content = generate_latex_from_cv(cv_data, template_path)
    return compile_latex_to_pdf(latex_content)
