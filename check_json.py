import json

files = ["data/sample_jobs.json", "data/sample_cvs.json"]

for f in files:
    try:
        with open(f, encoding="utf-8") as fp:
            json.load(fp)
        print(f"{f} → OK")
    except Exception as e:
        print(f"{f} → ERROR: {e}")
