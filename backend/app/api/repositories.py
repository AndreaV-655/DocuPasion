from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.repository import Repository
from app.models.document import Document

router = APIRouter(prefix="/api/repositories", tags=["repositories"])


class RepositoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class RepositoryUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


@router.get("/")
def list_repositories(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repos = (
        db.query(Repository, func.count(Document.id))
        .outerjoin(Document, Document.repository_id == Repository.id)
        .filter(Repository.owner_id == user.id)
        .group_by(Repository.id)
        .order_by(Repository.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "name": r.name,
            "document_count": count,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r, count in repos
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_repository(
    payload: RepositoryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    existing = (
        db.query(Repository)
        .filter(Repository.owner_id == user.id, Repository.name == name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un repositorio con ese nombre")
    repo = Repository(name=name, owner_id=user.id)
    db.add(repo)
    db.commit()
    db.refresh(repo)
    return {"id": repo.id, "name": repo.name, "created_at": repo.created_at.isoformat()}


def _get_owned_repo(db: Session, repo_id: int, user: User) -> Repository:
    repo = (
        db.query(Repository)
        .filter(Repository.id == repo_id, Repository.owner_id == user.id)
        .first()
    )
    if not repo:
        raise HTTPException(status_code=404, detail="Repositorio no encontrado")
    return repo


@router.patch("/{repo_id}")
def rename_repository(
    repo_id: int,
    payload: RepositoryUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = _get_owned_repo(db, repo_id, user)
    name = payload.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    duplicate = (
        db.query(Repository)
        .filter(Repository.owner_id == user.id, Repository.name == name)
        .first()
    )
    if duplicate and duplicate.id != repo.id:
        raise HTTPException(status_code=400, detail="Ya existe un repositorio con ese nombre")
    repo.name = name
    db.commit()
    return {"id": repo.id, "name": repo.name}


@router.delete("/{repo_id}")
def delete_repository(
    repo_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    repo = _get_owned_repo(db, repo_id, user)
    doc_count = (
        db.query(Document).filter(Document.repository_id == repo.id).count()
    )
    if doc_count > 0:
        raise HTTPException(
            status_code=409,
            detail=f"El repositorio contiene {doc_count} documento(s); elimínelos o muévalos primero",
        )
    db.delete(repo)
    db.commit()
    return {"detail": "Repositorio eliminado"}