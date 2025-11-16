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
    """Escape LaTeX special characters."""
    return ''.join(LATEX_ESC.get(c, c) for c in s) if isinstance(s, str) else ""

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
    """Generate LaTeX for education section."""
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
    """Generate LaTeX for projects section."""
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
    """Generate LaTeX for skills section."""
    if not skills:
        return ""
    return "\\begin{highlights}\n" + \
           "\n".join(f"\\item {esc(s)}" for s in skills) + \
           "\n\\end{highlights}"

def generate_latex_from_cv(cv_data: Dict[str, Any], template_path: Optional[Path] = None) -> str:
    """
    Generate LaTeX content from CV JSON data.
    
    Args:
        cv_data: Dictionary containing CV information
        template_path: Optional path to LaTeX template. If None, uses default template.
    
    Returns:
        LaTeX content as string
    """
    # Get template
    if template_path is None:
        # Use default template from this module
        template_path = Path(__file__).parent / "template_rendercv.tex"
    
    template = template_path.read_text(encoding="utf-8")
    
    # Replace placeholders
    tex = template
    tex = tex.replace("{{name}}", esc(cv_data.get("name", "")))
    tex = tex.replace("{{location}}", esc(cv_data.get("location", "")))
    tex = tex.replace("{{email}}", esc(cv_data.get("email", "")))
    tex = tex.replace("{{phone}}", esc(cv_data.get("phone", "")))
    tex = tex.replace("{{website}}", esc(cv_data.get("website", "")))
    tex = tex.replace("{{linkedin}}", esc(cv_data.get("linkedin", "")))
    tex = tex.replace("{{github}}", esc(cv_data.get("github", "")))
    tex = tex.replace("{{summary}}", esc(cv_data.get("summary", "")))
    
    tex = tex.replace("{{experience_block}}", make_experience_block(cv_data.get("experience", [])))
    tex = tex.replace("{{education_block}}", make_education_block(cv_data.get("education", [])))
    tex = tex.replace("{{projects_block}}", make_projects_block(cv_data.get("projects", [])))
    tex = tex.replace("{{skills_block}}", make_skills_block(cv_data.get("skills", [])))
    tex = tex.replace("{{tech_block}}", make_skills_block(cv_data.get("technologies", [])))
    
    return tex

def compile_latex_to_pdf(latex_content: str, output_dir: Optional[Path] = None) -> Optional[bytes]:
    """
    Compile LaTeX content to PDF.
    
    Args:
        latex_content: LaTeX content as string
        output_dir: Optional directory for temporary files. If None, uses system temp.
    
    Returns:
        PDF bytes if successful, None otherwise
    """
    try:
        # Create temporary directory
        if output_dir is None:
            temp_dir = tempfile.mkdtemp()
        else:
            temp_dir = str(output_dir)
            os.makedirs(temp_dir, exist_ok=True)
        
        temp_dir_path = Path(temp_dir)
        tex_file = temp_dir_path / "resume.tex"
        pdf_file = temp_dir_path / "resume.pdf"
        
        # Write LaTeX file
        tex_file.write_text(latex_content, encoding="utf-8")
        
        # Compile LaTeX to PDF using pdflatex
        # Run twice to resolve references
        for _ in range(2):
            result = subprocess.run(
                ["pdflatex", "-interaction=nonstopmode", "-output-directory", str(temp_dir), str(tex_file)],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                print(f"LaTeX compilation error: {result.stderr}")
                return None
        
        # Read PDF file
        if pdf_file.exists():
            pdf_bytes = pdf_file.read_bytes()
            return pdf_bytes
        else:
            print("PDF file was not created")
            return None
            
    except subprocess.TimeoutExpired:
        print("LaTeX compilation timed out")
        return None
    except FileNotFoundError:
        print("pdflatex not found. Please install LaTeX distribution (e.g., MiKTeX, TeX Live)")
        return None
    except Exception as e:
        print(f"Error compiling LaTeX to PDF: {e}")
        return None

def generate_pdf_from_cv(cv_data: Dict[str, Any], template_path: Optional[Path] = None) -> Optional[bytes]:
    """
    Generate PDF from CV JSON data.
    
    Args:
        cv_data: Dictionary containing CV information
        template_path: Optional path to LaTeX template
    
    Returns:
        PDF bytes if successful, None otherwise
    """
    latex_content = generate_latex_from_cv(cv_data, template_path)
    return compile_latex_to_pdf(latex_content)

