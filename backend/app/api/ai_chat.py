import time

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.ai_log import AILog
from app.services.rag_engine import RAGEngine

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


@router.post("/")
def chat(payload: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """
    Consulta RAG limitada a los documentos del usuario (RF-015, RNF-004).
    """
    start = time.perf_counter()
    rag = RAGEngine(db)
    result = rag.answer(payload.message, owner_id=user.id)
    elapsed_ms = int((time.perf_counter() - start) * 1000)
    db.add(AILog(
        document_id=None,
        owner_id=user.id,
        operation_type="chat",
        tokens_used=0 if result.get("mode") == "demo" else None,
        processing_time_ms=elapsed_ms,
    ))
    db.commit()
    result["response_time_ms"] = elapsed_ms
    return result


@router.get("/search")
def search(
    q: str = "",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Búsqueda por palabras clave dentro del contenido del usuario (RF-014)."""
    if not q.strip():
        raise HTTPException(status_code=400, detail="La consulta no puede estar vacía")
    rag = RAGEngine(db)
    results = rag.keyword_search(q, owner_id=user.id)
    return {"query": q, "count": len(results), "results": results}