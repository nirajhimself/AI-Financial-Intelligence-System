from fastapi import APIRouter, UploadFile, HTTPException, Query
from services.rag_pipeline import create_embeddings, query_db
from utils.file_parser import parse_file
from ai.llm import chat_with_ai

router = APIRouter(tags=["AI Assistant"])


# ================================
# ✅ FILE UPLOAD + EMBEDDINGS
# ================================
@router.post("/upload")
async def upload(file: UploadFile):
    try:
        if file is None:
            raise HTTPException(status_code=400, detail="No file uploaded")

        # 🔥 Reset pointer (important fix)
        file.file.seek(0)

        # 🔥 Parse file
        text = parse_file(file.file, file.filename)

        if not text or len(text.strip()) == 0:
            raise HTTPException(status_code=400, detail="File is empty or unreadable")

        # 🔥 Smart chunking (better than simple split)
        raw_chunks = text.split("\n")

        chunks = []
        buffer = ""

        for line in raw_chunks:
            line = line.strip()
            if not line:
                continue

            buffer += " " + line

            # chunk size control
            if len(buffer) > 200:
                chunks.append(buffer.strip())
                buffer = ""

        if buffer:
            chunks.append(buffer.strip())

        if len(chunks) == 0:
            raise HTTPException(status_code=400, detail="No meaningful content found")

        # 🔥 Store embeddings
        create_embeddings(chunks)

        return {
            "message": "Data uploaded successfully",
            "chunks_created": len(chunks)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


# ================================
# ✅ ASK QUESTION (RAG + OLLAMA)
# ================================
@router.get("/ask")
def ask(query: str):
    try:
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query empty")

        # 🔥 Try RAG
        rag_answer = query_db(query, chat_with_ai)

        # 🔥 HARD FALLBACK (THIS IS THE REAL FIX)
        if rag_answer is None or "No relevant" in str(rag_answer):
            answer = chat_with_ai(f"""
You are a smart financial AI assistant.

User question:
{query}

Give a helpful, real answer.
""")
        else:
            answer = rag_answer

        return {
            "query": query,
            "answer": answer
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))