from pathlib import Path

pdf_folder = Path(r"C:\Users\user\OneDrive\Documents\job_matcher\data\cvs")
pdf_files = list(pdf_folder.glob("*.pdf"))

if pdf_files:
    print(f"Found {len(pdf_files)} PDFs:")
    for pdf in pdf_files:
        print(pdf)
else:
    print("No PDFs found in this folder.")
