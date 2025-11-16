from typing import List
import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:
    SentenceTransformer = None


def load_model(name="all-MiniLM-L6-v2"):
    if SentenceTransformer is None:
        raise RuntimeError("sentence-transformers not installed")
    model = SentenceTransformer(name)
    return model


def embed_texts(texts, model, batch_size=64):
    if not texts:
        return np.zeros((0, model.get_sentence_embedding_dimension()))
    embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=False, convert_to_numpy=True)
    return embeddings


def cosine_similarity_matrix(a, b):
    if a.size == 0 or b.size == 0:
        return np.zeros((a.shape[0], b.shape[0]))
    a_norm = a / np.linalg.norm(a, axis=1, keepdims=True)
    b_norm = b / np.linalg.norm(b, axis=1, keepdims=True)
    return np.dot(a_norm, b_norm.T)


