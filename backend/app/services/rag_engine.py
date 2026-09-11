import math
from typing import List, Dict, Any, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.services.embedding import EmbeddingService
from app.services.config_service import ConfigService


class RAGEngine:
    """
    Motor de Recuperación Aumentada por Generación (RAG).

    Flujo:
      1. Un documento se indexa: extracción de texto -> chunking -> embeddings.
      2. Búsqueda semántica: la consulta se normaliza y se comparan los chunks
         indexados en memoria por similitud (coseno / determinística).
      3. Generación: los chunks más relevantes se pasan al LLM (si hay API key)
         o se componen en una respuesta demo fundamentada con citas.

    Aislamiento: cada chunk conserva el owner_id del documento; toda búsqueda
    filtra por el usuario autenticado (RF-014, RF-015, RNF-004).
    """

    def __init__(self, db: Session):
        self.db = db
        # Cache en memoria: doc_id -> lista de {text, vector, doc_id, owner_id}
        self.index: Dict[int, List[Dict[str, Any]]] = {}
        self._load_index()

    def _load_index(self):
        docs = self.db.execute(
            select(Document).where(Document.status == "indexed")
        ).scalars().all()
        for doc in docs:
            if doc.extracted_text:
                chunks = EmbeddingService.chunk_text(
                    doc.extracted_text,
                    ConfigService.get_int(self.db, "chunk_size", settings.CHUNK_SIZE),
                    ConfigService.get_int(self.db, "chunk_overlap", settings.CHUNK_OVERLAP),
                )
                vectors = EmbeddingService.embed_texts(chunks)
                self.index[doc.id] = [
                    {
                        "text": chunks[i],
                        "vector": vectors[i],
                        "doc_id": doc.id,
                        "owner_id": doc.owner_id,
                    }
                    for i in range(len(chunks))
                ]

    def index_document(self, doc: Document) -> int:
        """Indexa (o re-indexa) un documento y devuelve el número de chunks."""
        if not doc.extracted_text:
            return 0
        chunks = EmbeddingService.chunk_text(
            doc.extracted_text,
            ConfigService.get_int(self.db, "chunk_size", settings.CHUNK_SIZE),
            ConfigService.get_int(self.db, "chunk_overlap", settings.CHUNK_OVERLAP),
        )
        vectors = EmbeddingService.embed_texts(chunks)
        self.index[doc.id] = [
            {
                "text": chunks[i],
                "vector": vectors[i],
                "doc_id": doc.id,
                "owner_id": doc.owner_id,
            }
            for i in range(len(chunks))
        ]
        return len(chunks)

    def remove_document(self, doc_id: int) -> None:
        self.index.pop(doc_id, None)

    @staticmethod
    def _cosine_similarity(a: List[float], b: List[float]) -> float:
        if len(a) != len(b):
            return 0.0
        dot = sum(x * y for x, y in zip(a, b))
        norm_a = math.sqrt(sum(x * x for x in a)) or 1.0
        norm_b = math.sqrt(sum(x * x for x in b)) or 1.0
        return dot / (norm_a * norm_b)

    def search(self, query: str, owner_id: int, top_k: int = 5) -> List[Dict[str, Any]]:
        """Búsqueda semántica por similitud coseno, limitada al usuario."""
        if not self.index:
            return []
        query_vec = EmbeddingService.embed_query(query)
        scored = []
        for doc_id, chunks in self.index.items():
            for c in chunks:
                if c.get("owner_id") != owner_id:
                    continue
                score = self._cosine_similarity(query_vec, c["vector"])
                scored.append({"score": score, **c})
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def keyword_search(self, query: str, owner_id: int, limit: int = 30) -> List[Dict[str, Any]]:
        """Búsqueda por palabras clave dentro del contenido del usuario."""
        q = query.lower()
        results = []
        docs = self.db.execute(
            select(Document).where(Document.status == "indexed")
        ).scalars().all()
        for doc in docs:
            if doc.owner_id != owner_id or not doc.extracted_text:
                continue
            if q in doc.extracted_text.lower():
                results.append({
                    "doc_id": doc.id,
                    "filename": doc.original_filename or doc.filename,
                    "snippet": _make_snippet(doc.extracted_text, q),
                    "score": doc.extracted_text.lower().count(q),
                })
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:limit]

    def answer(self, query: str, owner_id: int) -> Dict[str, Any]:
        """
        End-to-end RAG: recupera chunks relevantes del usuario y genera una
        respuesta fundamentada con fuentes.
        """
        hits = self.search(query, owner_id=owner_id, top_k=5)
        context = "\n\n".join(h["text"] for h in hits)

        if not hits:
            return {
                "query": query,
                "answer": "No encontré información relacionada en tu repositorio.",
                "sources": [],
                "chunks_retrieved": 0,
                "mode": "demo",
            }

        llm_model = ConfigService.get(self.db, "llm_model") or settings.LLM_MODEL

        if settings.OPENAI_API_KEY:
            answer = self._answer_with_llm(query, context, llm_model)
            mode = "llm"
        else:
            answer = self._answer_without_llm(query, hits)
            mode = "demo"

        return {
            "query": query,
            "answer": answer,
            "sources": [
                {"doc_id": h.get("doc_id"), "score": round(h.get("score", 0), 3),
                 "snippet": h.get("text", "")[:240]}
                for h in hits
            ],
            "chunks_retrieved": len(hits),
            "mode": mode,
        }

    @staticmethod
    def _answer_with_llm(query: str, context: str, llm_model: str) -> str:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        messages = [
            {
                "role": "system",
                "content": (
                    "Eres el asistente de análisis documental de DocuPasion. "
                    "Responde SOLO basándote en el contexto proporcionado. "
                    "Si no encuentras la respuesta, indícalo claramente."
                ),
            },
            {"role": "user", "content": f"Contexto:\n{context}\n\nPregunta: {query}"},
        ]
        response = client.chat.completions.create(
            model=llm_model, messages=messages, temperature=0.2
        )
        return response.choices[0].message.content

    @staticmethod
    def _answer_without_llm(query: str, hits: List[Dict[str, Any]]) -> str:
        lines = [f"Fragmento {i + 1}: {h['text'][:400]}" for i, h in enumerate(hits)]
        return (
            "Respuesta generada desde el repositorio semántico (demo sin API key):\n\n"
            + "\n\n".join(lines)
        )


def _make_snippet(text: str, needle: str, radius: int = 120) -> str:
    idx = text.lower().find(needle)
    if idx == -1:
        return text[:240]
    start = max(0, idx - radius)
    end = min(len(text), idx + len(needle) + radius)
    return text[start:end].replace("\n", " ")