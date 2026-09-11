import os
import uuid
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Optional

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.category import Category
from app.models.repository import Repository
from app.models.document_extraction import DocumentExtraction
from app.models.ai_log import AILog
from app.models.error_log import ErrorLog
from app.services.pdf_parser import PDFParserService
from app.services.document_analyzer import DocumentAnalyzer
from app.services.extractor import ArtifactExtractor
from app.services.rag_engine import RAGEngine
from app.core.config import settings

router = APIRouter(prefix="/api/documents", tags=["documents"])

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}
MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB (RB-002)

# Heurística honesta para el indicador de ahorro estimado.
MINUTES_PER_INDEXED_DOC = 15
MINUTES_PER_QUESTION = 3


def _add_ai_log(db: Session, document_id: Optional[int], operation: str,
                time_ms: int, owner_id: Optional[int] = None, tokens: int = 0) -> None:
    db.add(AILog(
        document_id=document_id,
        owner_id=owner_id,
        operation_type=operation,
        tokens_used=tokens,
        processing_time_ms=time_ms,
    ))


def _add_error_log(db: Session, document_id: Optional[int], code: str,
                   message: str, level: str = "error") -> None:
    db.add(ErrorLog(document_id=document_id, error_code=code, message=message, level=level))


def _category_by_name(db: Session, name: str) -> Category:
    category = db.query(Category).filter(Category.name == name).first()
    if not category:
        category = Category(name=name)
        db.add(category)
        db.flush()
    return category


def _serialize(doc: Document) -> dict:
    return {
        "id": doc.id,
        "filename": doc.original_filename or doc.filename,
        "status": doc.status.value,
        "category": doc.category.name if doc.category else None,
        "repository_id": doc.repository_id,
        "repository": doc.repository.name if doc.repository else None,
        "file_size": doc.file_size,
        "summary": doc.content_summary,
        "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
        "processed_at": doc.processed_at.isoformat() if doc.processed_at else None,
    }


@router.post("/upload", status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    repository_id: Optional[int] = Form(default=None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    # 1. Validar extensión (RB-001)
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato no soportado. Use PDF, TXT o DOCX.")

    # 2. Validar tamaño (RB-002) y leer contenido
    contents = await file.read()
    if len(contents) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="El archivo supera los 10 MB.")
    await file.seek(0)

    # 3. Validar propiedad del repositorio si se indica
    if repository_id:
        repo = (db.query(Repository)
                .filter(Repository.id == repository_id, Repository.owner_id == user.id)
                .first())
        if not repo:
            raise HTTPException(status_code=404, detail="Repositorio no encontrado")

    # 4. Guardar archivo con nombre seguro (9.5)
    stored_name = f"{user.id}_{uuid.uuid4().hex}{ext}"
    file_location = os.path.join(settings.UPLOAD_DIR, stored_name)
    with open(file_location, "wb") as buffer:
        buffer.write(contents)

    # 5. Crear registro (ESTADO: PROCESSING)
    new_doc = Document(
        filename=stored_name,
        original_filename=file.filename,
        file_path=file_location,
        file_size=os.path.getsize(file_location),
        mime_type=file.content_type,
        owner_id=user.id,
        repository_id=repository_id,
        status=DocumentStatus.PROCESSING,
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # 6. Pipeline de IA (CU-010) con registro de operaciones y errores
    try:
        start = datetime.utcnow()
        extracted_text = PDFParserService.extract_text(file_location, ext)
        _add_ai_log(db, new_doc.id, "extraccion",
                    int((datetime.utcnow() - start).total_seconds() * 1000),
                    owner_id=user.id, tokens=0)

        if not extracted_text:
            new_doc.status = DocumentStatus.FAILED
            _add_error_log(db, new_doc.id, "PDF_NO_TEXT",
                           "No se pudo extraer texto del documento (RB-006).")
            db.commit()
            return {**_serialize(new_doc), "detail": "No se pudo extraer texto del documento"}

        new_doc.extracted_text = extracted_text
        new_doc.status = DocumentStatus.INDEXED

        t1 = datetime.utcnow()
        analyzer = DocumentAnalyzer()
        category_name = analyzer.classify(new_doc.original_filename, extracted_text)
        summary = analyzer.summarize(extracted_text)
        new_doc.category_id = _category_by_name(db, category_name).id
        new_doc.content_summary = summary
        _add_ai_log(db, new_doc.id, "clasificacion",
                    int((datetime.utcnow() - t1).total_seconds() * 1000),
                    owner_id=user.id, tokens=0)

        t2 = datetime.utcnow()
        per_cat = new_doc.category.name if new_doc.category else category_name
        fields = ArtifactExtractor().extract(extracted_text, per_cat)
        for field in fields:
            db.add(DocumentExtraction(
                document_id=new_doc.id,
                field_name=field["field_name"],
                field_value=field["field_value"],
                extraction_type=per_cat,
            ))
        _add_ai_log(db, new_doc.id, "extraccion_info",
                    int((datetime.utcnow() - t2).total_seconds() * 1000),
                    owner_id=user.id, tokens=0)

        new_doc.processed_at = datetime.utcnow()
        db.commit()

        # 7. Indexar en RAG (RF-013)
        rag = RAGEngine(db)
        rag.index_document(new_doc)
    except Exception as exc:  # noqa: BLE001
        new_doc.status = DocumentStatus.FAILED
        _add_error_log(db, new_doc.id, "PROCESSING_ERROR", str(exc))
        db.commit()
        return {**_serialize(new_doc), "detail": "Error durante el procesamiento"}

    return _serialize(new_doc)


@router.get("/")
def list_documents(
    repository_id: Optional[int] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(Document).filter(Document.owner_id == user.id)
    if repository_id:
        query = query.filter(Document.repository_id == repository_id)
    if status:
        try:
            status_enum = DocumentStatus(status)
        except ValueError:
            valid = ", ".join(s.value for s in DocumentStatus)
            raise HTTPException(status_code=422,
                                detail=f"Estado no válido: {status}. Valores permitidos: {valid}")
        query = query.filter(Document.status == status_enum)
    if category:
        query = query.join(Document.category).filter(Category.name == category)
    if search:
        query = query.filter(Document.original_filename.ilike(f"%{search}%"))
    docs = query.order_by(Document.uploaded_at.desc()).all()
    return [_serialize(d) for d in docs]


def _get_owned_doc(db: Session, doc_id: int, user: User) -> Document:
    doc = db.query(Document).filter(Document.id == doc_id, Document.owner_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return doc


@router.get("/{doc_id}")
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = _get_owned_doc(db, doc_id, user)
    extractions = (
        db.query(DocumentExtraction)
        .filter(DocumentExtraction.document_id == doc.id)
        .order_by(DocumentExtraction.timestamp)
        .all()
    )
    data = _serialize(doc)
    data.update({
        "extracted_text_preview": (doc.extracted_text or "")[:2000],
        "extractions": [
            {"field_name": e.field_name, "field_value": e.field_value,
             "extraction_type": e.extraction_type}
            for e in extractions
        ],
    })
    return data


@router.get("/{doc_id}/download")
def download_document(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = _get_owned_doc(db, doc_id, user)
    if not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type=doc.mime_type or "application/octet-stream",
    )


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    doc = _get_owned_doc(db, doc_id, user)

    try:
        rag = RAGEngine(db)
        rag.remove_document(doc.id)
    except Exception:
        pass

    # RB-010: eliminar archivo físico, registros y extracciones
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)

    db.query(DocumentExtraction).filter(DocumentExtraction.document_id == doc.id).delete()
    db.query(AILog).filter(AILog.document_id == doc.id).delete()
    db.query(ErrorLog).filter(ErrorLog.document_id == doc.id).delete()
    db.delete(doc)
    db.commit()


@router.get("/stats/summary")
def stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    base = db.query(Document).filter(Document.owner_id == user.id)
    total = base.count()
    by_status = {
        s.value: base.filter(Document.status == s).count()
        for s in DocumentStatus
    }
    indexed = by_status[DocumentStatus.INDEXED.value]
    by_category = {
        (c.name or "sin categoría"): count
        for c, count in (
            db.query(Category, func.count(Document.id))
            .outerjoin(Document, Document.category_id == Category.id)
            .filter(Document.owner_id == user.id)
            .group_by(Category.id)
            .all()
        )
    }
    questions = (
        db.query(AILog)
        .filter(AILog.operation_type == "chat", AILog.owner_id == user.id)
        .count()
    )
    time_saved_estimate_h = round(
        (indexed * MINUTES_PER_INDEXED_DOC + questions * MINUTES_PER_QUESTION) / 60, 1
    )
    return {
        "total_documents": total,
        "processed": indexed,
        "processing": by_status[DocumentStatus.PROCESSING.value],
        "failed": by_status[DocumentStatus.FAILED.value],
        "by_status": by_status,
        "by_category": by_category,
        "questions_answered": questions,
        "time_saved_estimate_h": time_saved_estimate_h,
    }