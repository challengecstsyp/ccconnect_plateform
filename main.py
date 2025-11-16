from src.data_loader import load_jobs, load_cvs
from src.matcher import Matcher


def print_snippet(text, width=180):
    """Return a shortened snippet of text for display."""
    text = text.replace("\n", " ")
    return text[:width] + ("..." if len(text) > width else "")


def choose_index(items, label):
    """Let user choose an index from the first 10 items."""
    print(f"Available {label}s:")
    for i, t in enumerate(items[:10]):
        print(f"  [{i}] {print_snippet(t, 120)}")
    
    value = input(f"Choose {label} index: ").strip()
    if value == "":
        return None
    if not value.isdigit():
        return None
    idx = int(value)
    if idx < 0 or idx >= len(items):
        return None
    return idx


def run_cli():
    print("Loading data...")
    jobs = load_jobs()                  # Load jobs from JSON
    cvs = load_cvs("data/cvs")         # Load CVs from PDF/DOCX folder
    print(f"Loaded {len(jobs)} jobs and {len(cvs)} CVs.")
    
    print("Loading model...")
    matcher = Matcher(jobs, cvs)
    
    while True:
        print("\n1) Candidate -> Jobs")
        print("2) Job -> Candidates")
        print("3) Text -> Jobs")
        print("4) Text -> CVs")
        print("q) Quit")
        
        choice = input("Choice: ").strip().lower()
        if choice == "q":
            break
        
        if choice == "1":
            idx = choose_index(cvs, "CV")
            if idx is None:
                continue
            n = int(input("Top N (default 5): ").strip() or "5")
            results = matcher.match_cv_to_jobs_by_index(idx, top_n=n)
            for rank, (i, score, text) in enumerate(results, start=1):
                print(f"{rank}. Job[{i}] score={score:.4f}")
                print(f"   {print_snippet(text, 200)}\n")
        
        elif choice == "2":
            idx = choose_index(jobs, "Job")
            if idx is None:
                continue
            n = int(input("Top N (default 5): ").strip() or "5")
            results = matcher.match_job_to_cvs_by_index(idx, top_n=n)
            for rank, (i, score, text) in enumerate(results, start=1):
                print(f"{rank}. CV[{i}] score={score:.4f}")
                print(f"   {print_snippet(text, 200)}\n")
        
        elif choice == "3":
            text = input("Paste CV text: ").strip()
            if text:
                n = int(input("Top N (default 5): ").strip() or "5")
                results = matcher.match_text_to_jobs(text, top_n=n)
                for rank, (i, score, jobtext) in enumerate(results, start=1):
                    print(f"{rank}. Job[{i}] score={score:.4f}")
                    print(f"   {print_snippet(jobtext, 200)}\n")
        
        elif choice == "4":
            text = input("Paste job text: ").strip()
            if text:
                n = int(input("Top N (default 5): ").strip() or "5")
                results = matcher.match_text_to_cvs(text, top_n=n)
                for rank, (i, score, cvtext) in enumerate(results, start=1):
                    print(f"{rank}. CV[{i}] score={score:.4f}")
                    print(f"   {print_snippet(cvtext, 200)}\n")


if __name__ == "__main__":
    try:
        run_cli()
    except Exception as e:
        print(f"Error: {e}")
        raise
