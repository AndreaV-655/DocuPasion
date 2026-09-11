from typing import List

from app.core.config import settings


class EmbeddingService:
    """
    Genera embeddings (vectores) para chunks de texto.
    Si no hay OpenAI_API_KEY configurada, usa un hash-hash fallback
    determinístico para que el prototipo funcione sin credenciales.
    """

    @staticmethod
    def chunk_text(text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """Divide el texto en chunks con superposición."""
        chunk_size = settings.CHUNK_SIZE if chunk_size is None else chunk_size
        overlap = settings.CHUNK_OVERLAP if overlap is None else overlap
        if chunk_size <= 0:
            chunk_size = settings.CHUNK_SIZE
        if overlap >= chunk_size:
            overlap = 0
        words = text.split()
        if not words:
            return []
        chunks = []
        step = chunk_size - overlap
        i = 0
        while i < len(words):
            chunks.append(" ".join(words[i:i + chunk_size]))
            i += step
        return chunks

    @staticmethod
    def embed_texts(texts: List[str]) -> List[List[float]]:
        """
        Genera embeddings. Usa OpenAI si la API key está disponible;
        de lo contrario, un vector determinístico local (word hashing).
        """
        if settings.OPENAI_API_KEY:
            return EmbeddingService._embed_openai(texts)
        return [EmbeddingService._embed_local(text) for text in texts]

    @staticmethod
    def embed_query(text: str) -> List[float]:
        return EmbeddingService.embed_texts([text])[0]

    @staticmethod
    def _embed_local(text: str, dim: int = 1536) -> List[float]:
        """
        Proxy determinístico: combina característiques de unigramas/bigramas
        en un vector normalizado. Solo para demo sin API key.
        """
        vector = [0.0] * dim
        tokens = text.lower().split()
        for tok in tokens:
            for ch in tok:
                vector[hash(ch) % dim] += 1.0
        for i in range(len(tokens) - 1):
            bigram = tokens[i] + tokens[i + 1]
            vector[hash(bigram) % dim] += 2.0
        norm = sum(v * v for v in vector) ** 0.5 or 1.0
        return [v / norm for v in vector]

    @staticmethod
    def _embed_openai(texts: List[str]) -> List[List[float]]:
        import openai
        client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.embeddings.create(model=settings.EMBEDDING_MODEL, input=texts)
        return [item.embedding for item in response.data]