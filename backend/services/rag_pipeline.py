import numpy as np
from sentence_transformers import SentenceTransformer

# 🔥 Load embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# In-memory DB (you can upgrade later to FAISS)
VECTOR_DB = []
TEXT_DB = []


# =========================
# STORE EMBEDDINGS
# =========================
def create_embeddings(chunks):

    global VECTOR_DB, TEXT_DB

    embeddings = model.encode(chunks)

    VECTOR_DB.extend(embeddings)
    TEXT_DB.extend(chunks)


# =========================
# SEARCH CONTEXT
# =========================
def search(query, top_k=3):

    if not VECTOR_DB:
        return []

    query_vec = model.encode([query])[0]

    scores = []

    for i, vec in enumerate(VECTOR_DB):
        similarity = np.dot(query_vec, vec) / (
            np.linalg.norm(query_vec) * np.linalg.norm(vec)
        )
        scores.append((similarity, i))

    scores.sort(reverse=True)

    results = [TEXT_DB[i] for _, i in scores[:top_k]]

    return results


# =========================
# MAIN QUERY FUNCTION
# =========================
def query_db(query, llm_func):

    context_chunks = search(query)

    if not context_chunks:
        return None

    context = "\n".join(context_chunks)

    prompt = f"""
You are a financial AI assistant.

Context:
{context}

User Question:
{query}

Answer clearly and accurately:
"""

    return llm_func(prompt)
