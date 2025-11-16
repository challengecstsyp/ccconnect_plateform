# AI Job Matcher

Small project to match candidate CVs with job descriptions using semantic embeddings.

---

## Overview

This project loads jobs and CVs (from JSON or from PDF/DOCX files), embeds the texts using a sentence-transformer model, computes cosine similarities, and returns ranked matches.

It ships with a simple CLI (`main.py`) and a Streamlit UI (`app.py`). There is also a PDF generator that can create CV PDFs from the sample JSON file.

---

## Chosen model

**`all-MiniLM-L6-v2` (sentence-transformers)**

* A compact, fast semantic embedding model from the `sentence-transformers` family.
* Excellent trade-off between speed and embedding quality for semantic search / matching tasks.
* Embeddings are used to represent job descriptions and CV texts; matches are computed via cosine similarity.

You can change the model by passing a different model name to `Matcher(...)` or by editing the default in `src/matcher.py` (and ensuring that the model name is available from `sentence_transformers`).

---

## What the project does

* Loads job descriptions from `data/sample_jobs.json` (or any JSON file containing jobs).
* Loads CVs either from `data/sample_cvs.json` (via the PDF generator) or from a folder of PDF/DOCX files (`data/cvs`) using `src/data_loader.py`.
* Encodes all texts into fixed-size embeddings via the sentence-transformers model.
* Computes pairwise cosine similarity and returns top-N matches.
* Provides two interactive frontends:

  * CLI: `python main.py` (text-based selection)
  * Streamlit UI: `streamlit run app.py`
* Utilities to generate PDFs from the JSON CVs (`pdf_generator.py`) — optionally via LaTeX template if `pdflatex` is available.

---

## Project structure

```
project-root/
├─ data/
│  ├─ sample_jobs.json
│  ├─ sample_cvs.json
│  └─ cvs/                # store PDF/DOCX CV files here
├─ src/
│  ├─ __init__.py
│  ├─ data_loader.py      # load JSON, PDF, DOCX
│  ├─ matcher.py          # Matcher class (embedding + matching)
│  └─ utils.py            # model loading, embedding, cosine similarity
├─ templates/
│  └─ cv_template.tex     # optional LaTeX CV template
├─ app.py                 # Streamlit UI
├─ main.py                # CLI UI
├─ pdf_generator.py       # create PDFs from sample_cvs.json
├─ check_json.py          # sanity-check JSON files
└─ check_pdfs.py          # quick check for PDFs in a folder
```

---

## Requirements

Create a virtual environment and install dependencies. Example `requirements.txt` (suggested):

```
streamlit
sentence-transformers
numpy
PyPDF2
python-docx
fpdf
fpdf2
```

Install with:

```bash
python -m venv .venv
source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

> Note: `sentence-transformers` will pull a transformer backend (`transformers`, `torch`). If you have a GPU and want to install the CUDA-enabled PyTorch wheel, follow PyTorch installation instructions from pytorch.org.

If you plan to use the LaTeX pipeline in `pdf_generator.py`, install a TeX distribution (MiKTeX on Windows or TeX Live on Linux/macOS) so `pdflatex` is available in your PATH.

---

## How to run

1. **Quick CLI**

```bash
python main.py
```

Follow the interactive prompts to choose a CV or job and view the top matches.

2. **Streamlit UI**

```bash
streamlit run app.py
```

Open the local URL shown by Streamlit (usually `http://localhost:8501`).

3. **Generate PDFs from JSON CVs**

```bash
python pdf_generator.py data/sample_cvs.json output_pdfs
# or with LaTeX template
python pdf_generator.py data/sample_cvs.json output_pdfs --latex
```

4. **Sanity checks**

```bash
python check_json.py
python check_pdfs.py
```

---

## How to customize

* Change the embedding model: modify `Matcher(..., model_name="your-model-name")` or change the default in `src/matcher.py`.
* Add more data: drop JSON files in `data/` or put PDF/DOCX files in `data/cvs`.
* Tweak top-N returned results by changing the `top_n` argument in the `Matcher` methods.
* Improve pre-processing: `src/data_loader.py` contains text extraction logic; enhance cleaning, normalization, or add language-specific token handling.

---

## Key APIs (quick reference)

* `src.data_loader.load_jobs(path=None) -> List[str]` — loads job texts from JSON.
* `src.data_loader.load_cvs(path=None) -> List[str]` — loads CV texts from folder of PDF/DOCX.
* `src.matcher.Matcher(job_texts, cv_texts, model_name="all-MiniLM-L6-v2")` — initializes embeddings.

Matcher methods:

* `match_cv_to_jobs_by_index(cv_index, top_n=5)`
* `match_job_to_cvs_by_index(job_index, top_n=5)`
* `match_text_to_jobs(text, top_n=5)`
* `match_text_to_cvs(text, top_n=5)`

Each returns a list of tuples: `(index, score, text)` where `score` is cosine similarity in `[0,1]` (floating).

---

## Troubleshooting

* **`sentence-transformers not installed`**: ensure `sentence-transformers` is in your environment.
* **Slow embedding or memory OOM**: use smaller batch sizes in `embed_texts(...)` or run on a machine with more RAM / a GPU.
* **`pdflatex not found`**: LaTeX not installed — either install a TeX distribution or run the non-LaTeX PDF generator mode.
* **PDF text extraction yields empty strings**: some PDFs are scanned images. Use OCR (e.g., Tesseract + pytesseract) to extract text from scanned PDFs.

---

If you want, I can also:

* produce a `requirements.txt` file
* create a concise `CONTRIBUTING.md`
* add example screenshots for the Streamlit UI
* convert the README into a GitHub-friendly `README.md` with badges

Tell me which of those you want next.
