"""
Servicio de análisis de documentos:
  - Clasificación automática (>= 3 categorías) por reglas de vocabulario clave.
  - Generación de resumen del documento (fragmento representativo).
  Si OPENAI_API_KEY estuviera configurado, aquí se invocaría un modelo real.
"""

import re
from typing import Optional, Dict, List

from app.core.config import settings


CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "académico": [
        "tesis", "disertación", "universidad", "investigación", "bibliografía",
        "metodología", "hipótesis", "resumen", "abstract", "conclusión",
        "biblioteca", "ensayo", "trabajo de grado", "maestría", "doctorado",
    ],
    "técnico": [
        "software", "código", "arquitectura", "base de datos", "servidor",
        "api", "endpoints", "deployment", "docker", "aws", "cloud",
        "implementación", "framework", "backend", "frontend", "sistemas",
        "programación", "algoritmo", "usuario", "requisitos", "modelo",
    ],
    "legal": [
        "contrato", "cláusula", "ley", "reglamento", "norma", "jurídico",
        "firma", "obligación", "derecho", "tribunal", "demanda", "resolución",
        "decreto", "disposición", "consentimiento", "arbitraje",
    ],
    "administrativo": [
        "acta", "acta de reunión", "reunión", "comité", "acta",
        "planificación", "presupuesto", "inventario", "informe", "reporte",
        "directriz", "estrategia", "gestión", "calidad", "auditoría",
        "guía", "manual", "protocolo", "instrucción",
    ],
}

DEFAULT_CATEGORY = "general"


class DocumentAnalyzer:
    """Análisis básico sin modelo LLM (demo). Se puede extender con GPT."""

    def classify(self, filename: str, text: str) -> str:
        """Clasifica el documento usando conteo de palabras clave."""
        text_lower = text.lower()
        scores = {
            cat: sum(1 for kw in keywords if kw in text_lower)
            for cat, keywords in CATEGORY_KEYWORDS.items()
        }
        best = max(scores, key=scores.get)
        return best if scores[best] > 2 else DEFAULT_CATEGORY

    def summarize(self, text: str, max_sentences: int = 5) -> str:
        """
        Extrae las primeras oraciones significativas como resumen rápido.
        Para un resumen real se usaría un modelo LLM (gpt-4o-mini / BART).
        """
        if not text.strip():
            return ""
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        meaningful = [s.strip() for s in sentences if len(s.strip()) > 20]
        if not meaningful:
            return text[:300]
        return " ".join(meaningful[:max_sentences])