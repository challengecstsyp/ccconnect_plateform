import streamlit as st
from src.data_loader import load_jobs, load_cvs
from src.matcher import Matcher

def snippet(text, width=200):
    """Shorten text for display in dropdowns or previews."""
    return text.replace("\n", " ")[:width] + ("..." if len(text) > width else "")

@st.cache_resource
def get_matcher():
    """Load jobs and CVs and initialize the Matcher."""
    jobs = load_jobs()           # from JSON
    cvs = load_cvs("data/cvs")  # from folder containing PDF/DOCX
    matcher = Matcher(jobs, cvs)
    return matcher, jobs, cvs

def main():
    st.title("AI Job Matcher")

    matcher, jobs, cvs = get_matcher()

    st.sidebar.header("Mode")
    mode = st.sidebar.selectbox("Choose mode", [
        "Candidate -> Jobs",
        "Job -> CVs",
        "Text -> Jobs",
        "Text -> CVs",
    ])

    top_n = st.sidebar.slider("Top N", min_value=1, max_value=20, value=5)

    if not jobs or not cvs:
        st.warning("Data files are empty.")

    # ---------------- Candidate -> Jobs ----------------
    if mode == "Candidate -> Jobs" and cvs:
        idx = st.selectbox("Select candidate", options=list(range(len(cvs))),
                           format_func=lambda i: f"[{i}] {snippet(cvs[i])}")
        st.text_area("Full CV text", value=cvs[idx], height=400)

        if st.button("Find matching jobs"):
            with st.spinner("Computing matches..."):
                results = matcher.match_cv_to_jobs_by_index(idx, top_n=top_n)
            st.subheader(f"Top {top_n} jobs for CV [{idx}]")
            for rank, (i, score, text) in enumerate(results, start=1):
                st.write(f"{rank}. Job [{i}] - score {score:.4f}")
                with st.expander("View job description"):
                    st.write(text)

    # ---------------- Job -> CVs ----------------
    elif mode == "Job -> CVs" and jobs:
        idx = st.selectbox("Select job", options=list(range(len(jobs))),
                           format_func=lambda i: f"[{i}] {snippet(jobs[i])}")
        st.text_area("Full Job description", value=jobs[idx], height=400)

        if st.button("Find matching candidates"):
            with st.spinner("Computing matches..."):
                results = matcher.match_job_to_cvs_by_index(idx, top_n=top_n)
            st.subheader(f"Top {top_n} CVs for Job [{idx}]")
            for rank, (i, score, text) in enumerate(results, start=1):
                st.write(f"{rank}. CV [{i}] - score {score:.4f}")
                with st.expander("View CV"):
                    st.write(text)

    # ---------------- Text -> Jobs ----------------
    elif mode == "Text -> Jobs":
        text = st.text_area("Paste candidate/CV text here", height=400)
        if st.button("Match to jobs"):
            if not text.strip():
                st.warning("Please paste some text.")
            else:
                with st.spinner("Computing matches..."):
                    results = matcher.match_text_to_jobs(text, top_n=top_n)
                st.subheader(f"Top {top_n} jobs")
                for rank, (i, score, jobtext) in enumerate(results, start=1):
                    st.write(f"{rank}. Job [{i}] - score {score:.4f}")
                    with st.expander("View job description"):
                        st.write(jobtext)

    # ---------------- Text -> CVs ----------------
    elif mode == "Text -> CVs":
        text = st.text_area("Paste job description here", height=400)
        if st.button("Match to CVs"):
            if not text.strip():
                st.warning("Please paste some text.")
            else:
                with st.spinner("Computing matches..."):
                    results = matcher.match_text_to_cvs(text, top_n=top_n)
                st.subheader(f"Top {top_n} CVs")
                for rank, (i, score, cvtext) in enumerate(results, start=1):
                    st.write(f"{rank}. CV [{i}] - score {score:.4f}")
                    with st.expander("View CV"):
                        st.write(cvtext)


if __name__ == "__main__":
    main()
