"""
Servicio de extracción de información relevante.

Aplica heurísticas por reglas sobre el texto extraído para distintos tipos
documentales. En una iteración futura puede reemplazarse por un modelo LLM
si se configura la clave de OpenAI.
"""

import re
from typing import Dict, List

YEAR_RE = re.compile(r"\b(19|20)\d{2}\b")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
FORMAT_RE = re.compile(r"(pdf|docx?|txt)\b", re.IGNORECASE)
KEYWORD_LABELS: Dict[str, List[str]] = {
    "académico": [
        "autor(?:a|es)?", "tesis", "director", "tutor", "institución", "universidad",
        "palabras clave", "resumen",
    ],
    "técnico": [
        "requisitos", "arquitectura", "tecnologías", "stack", "lenguaje",
        "framework", "base de datos", "despliegue", "versionado",
    ],
    "legal": [
        "partes", "firmante", "contrato", "cláusula", "vigencia", "jurisdicción",
        "domicilio", "resolución",
    ],
    "administrativo": [
        "comité", "asistentes", "acuerdos", "compromisos", "fecha", "presupuesto",
        "responsable", "plazo",
    ],
}


def _find_line(text: str, pattern: str) -> str:
    """Devuelve la primera línea que contiene el patrón, saneada."""
    for line in text.splitlines():
        line = line.strip().rstrip()
        if re.search(pattern, line, re.IGNORECASE):
            return line[:200]
    return ""


def _find_years(text: str) -> str:
    years = sorted({y for y in YEAR_RE.findall(text)})
    return ", ".join(years) if years else ""


def _find_emails(text: str) -> str:
    emails = list(dict.fromkeys(EMAIL_RE.findall(text)))
    return ", ".join(emails[:3]) if emails else ""


class ArtifactExtractor:
    """Extrae campos relevantes del texto según el tipo de documento."""

    def __init__(self):
        pass

    def extract(self, text: str, extraction_type: str) -> List[Dict[str, str]]:
        """
        Devuelve una lista de {field_name, field_value} para el tipo indicado.
        Los tipos sin esquema devuelven lista vacía.
        """
        fields: List[Dict[str, str]] = []
        kind = (extraction_type or "general").lower()
        if kind == "académico":
            fields.append({"field_name": "año", "field_value": _find_years(text)})
            fields.append({"field_name": "autor", "field_value": _find_line(text, r"autor")})
            fields.append({
                "field_name": "institución",
                "field_value": _find_line(text, r"universidad|institución"),
            })
            fields.append({
                "field_name": "palabras clave",
                "field_value": _find_line(text, r"palabras clave"),
            })
            fields.append({"field_name": "email", "field_value": _find_emails(text)})
        elif kind == "técnico":
            fields.append({
                "field_name": "requisitos",
                "field_value": _find_line(text, r"requisitos"),
            })
            fields.append({
                "field_name": "arquitectura",
                "field_value": _find_line(text, r"arquitectura"),
            })
            fields.append({
                "field_name": "tecnologías",
                "field_value": _find_line(text, r"tecnologías|stack|lenguaje|framework"),
            })
            fields.append({"field_name": "formatos", "field_value": ", ".join(
                sorted({m.group(0) for m in FORMAT_RE.finditer(text)}))})
        elif kind == "legal":
            fields.append({
                "field_name": "partes",
                "field_value": _find_line(text, r"^.{0,40}\b(contrato|acuerdo)") or _find_line(text, r"partes"),
            })
            fields.append({
                "field_name": "cláusulas",
                "field_value": _find_line(text, r"cláusula"),
            })
            fields.append({"field_name": "fechas", "field_value": _find_years(text)})
            fields.append({"field_name": "vigencia", "field_value": _find_line(text, r"vigencia")})
        elif kind == "administrativo":
            fields.append({
                "field_name": "asistentes",
                "field_value": _find_line(text, r"asistentes"),
            })
            fields.append({
                "field_name": "acuerdos",
                "field_value": _find_line(text, r"acuerdos|compromisos"),
            })
            fields.append({"field_name": "fechas", "field_value": _find_years(text)})
        return [f for f in fields if f["field_value"]]