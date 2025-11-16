# src/data_loader.py
import json
from pathlib import Path
from typing import List

# For reading PDF and DOCX
import PyPDF2
import docx


def load_texts_from_json(path: str) -> List[str]:
    """Load job descriptions from a JSON file."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")

    with path.open(encoding="utf-8") as f:
        data = json.load(f)

    texts = []

    def extract_from_item(item):
        if isinstance(item, str):
            return item.strip()
        if isinstance(item, dict):
            for key in ("text", "description", "job_description", "content", "summary", "title"):
                if key in item and isinstance(item[key], str) and item[key].strip():
                    return item[key].strip()
            # If no key matched, combine all string values
            parts = [v.strip() for v in item.values() if isinstance(v, str) and v.strip()]
            if parts:
                return " ".join(parts)
        return None

    if isinstance(data, list):
        for item in data:
            t = extract_from_item(item)
            if t:
                texts.append(t)
    elif isinstance(data, dict):
        for v in data.values():
            if isinstance(v, str) and v.strip():
                texts.append(v.strip())
            elif isinstance(v, list):
                for item in v:
                    t = extract_from_item(item)
                    if t:
                        texts.append(t)

    return texts


def read_pdf(path: Path) -> str:
    """Extract text from a PDF file."""
    text = ""
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()


def read_docx(path: Path) -> str:
    """Extract text from a DOCX file."""
    doc = docx.Document(path)
    text = "\n".join([p.text for p in doc.paragraphs])
    return text.strip()


def load_cvs_from_folder(folder_path: str) -> List[str]:
    """Load all CVs (PDF or DOCX) from a folder."""
    folder = Path(folder_path)
    if not folder.exists() or not folder.is_dir():
        raise FileNotFoundError(f"Folder not found: {folder}")

    cvs = []
    for file_path in folder.iterdir():
        if file_path.suffix.lower() == ".pdf":
            cvs.append(read_pdf(file_path))
        elif file_path.suffix.lower() == ".docx":
            cvs.append(read_docx(file_path))
    return cvs


def load_jobs(path=None):
    """Load job descriptions from JSON."""
    root = Path(__file__).resolve().parents[1]
    default = root / "data" / "sample_jobs.json"
    return load_texts_from_json(path or str(default))


def load_cvs(path=None):
    """Load CVs from a folder containing PDF/DOCX files."""
    root = Path(__file__).resolve().parents[1]
    default = root / "data" / "cvs"  # default folder for CV files
    return load_cvs_from_folder(path or str(default))
