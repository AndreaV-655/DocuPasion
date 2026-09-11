from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentStatus
from app.models.error_log import ErrorLog
from app.models.ai_log import AILog

router = APIRouter(prefix="/api/monitoring", tags=["monitoring"])


def _status_counts(db: Session) -> dict:
    counts = {
        status: db.query(Document).filter(Document.status == status).count()
        for status in DocumentStatus
    }
    return {"total": sum(counts.values()), **{s.value: c for s, c in counts.items()}}


@router.get("/logs")
def get_error_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    logs = (
        db.query(ErrorLog)
        .order_by(ErrorLog.created_at.desc())
        .limit(min(limit, 200))
        .all()
    )
    return {
        "status_counts": _status_counts(db),
        "errors": [
            {
                "id": log.id,
                "document_id": log.document_id,
                "doc_id": log.document_id,
                "error_code": log.error_code,
                "message": log.message,
                "level": log.level,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
    }


@router.get("/ai-logs")
def get_ai_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    logs = (
        db.query(AILog)
        .order_by(AILog.timestamp.desc())
        .limit(min(limit, 200))
        .all()
    )
    return [
        {
            "id": log.id,
            "document_id": log.document_id,
            "operation_type": log.operation_type,
            "tokens_used": log.tokens_used or 0,
            "processing_time_ms": log.processing_time_ms,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
        }
        for log in logs
    ]