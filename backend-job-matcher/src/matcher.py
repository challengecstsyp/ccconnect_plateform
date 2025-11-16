from typing import List, Tuple
import numpy as np
from .utils import load_model, embed_texts, cosine_similarity_matrix


class Matcher:
    def __init__(self, job_texts, cv_texts, model_name="all-MiniLM-L6-v2"):
        self.job_texts = job_texts or []
        self.cv_texts = cv_texts or []
        self.model = load_model(model_name)
        self.job_embeddings = embed_texts(self.job_texts, self.model) if self.job_texts else np.array([])
        self.cv_embeddings = embed_texts(self.cv_texts, self.model) if self.cv_texts else np.array([])

    def match_cv_to_jobs_by_index(self, cv_index, top_n=5):
        if cv_index < 0 or cv_index >= len(self.cv_texts):
            raise IndexError("cv_index out of range")
        if self.job_embeddings.size == 0:
            return []
        sims = cosine_similarity_matrix(self.cv_embeddings[cv_index:cv_index + 1], self.job_embeddings)[0]
        idxs = np.argsort(-sims)[:top_n]
        return [(int(i), float(sims[i]), self.job_texts[i]) for i in idxs]

    def match_job_to_cvs_by_index(self, job_index, top_n=5):
        if job_index < 0 or job_index >= len(self.job_texts):
            raise IndexError("job_index out of range")
        if self.cv_embeddings.size == 0:
            return []
        sims = cosine_similarity_matrix(self.job_embeddings[job_index:job_index + 1], self.cv_embeddings)[0]
        idxs = np.argsort(-sims)[:top_n]
        return [(int(i), float(sims[i]), self.cv_texts[i]) for i in idxs]

    def match_text_to_jobs(self, text, top_n=5):
        emb = embed_texts([text], self.model)
        if self.job_embeddings.size == 0:
            return []
        sims = cosine_similarity_matrix(emb, self.job_embeddings)[0]
        idxs = np.argsort(-sims)[:top_n]
        return [(int(i), float(sims[i]), self.job_texts[i]) for i in idxs]

    def match_text_to_cvs(self, text, top_n=5):
        emb = embed_texts([text], self.model)
        if self.cv_embeddings.size == 0:
            return []
        sims = cosine_similarity_matrix(emb, self.cv_embeddings)[0]
        idxs = np.argsort(-sims)[:top_n]
        return [(int(i), float(sims[i]), self.cv_texts[i]) for i in idxs]


