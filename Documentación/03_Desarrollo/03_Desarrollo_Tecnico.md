# FASE 03 — DOCUMENTO DE DESARROLLO / TÉCNICO

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Proyecto Integrador — Tecnología en Desarrollo de Software, VI Semestre**
**Universidad UTS**

| Campo | Valor |
|---|---|
| Fase | 03 — Desarrollo |
| Versión del documento | 2.0 |
| Fecha de elaboración | Septiembre 2025 |
| Autor(es) | Estudiantes VI Semestre — UTS |
| Revisor | Director del Proyecto Integrador |

---

## 1. ENTORNO DE DESARROLLO Y CONFIGURACIÓN

### 1.1 Requisitos de software

| Componente | Versión mínima | Versión utilizada | Propósito |
|---|---|---|---|
| Python | 3.10 | 3.12 | Lenguaje del backend, servicios de IA |
| Node.js | 18.0 | 24.19.0 | Validación de sintaxis JS, herramientas de desarrollo |
| Git | 2.0 | 2.44 | Control de versiones |
| MySQL | 8.0 | 8.0 (XAMPP) | Base de datos relacional (producción) |
| Navegador web | Chrome 90+ | Chrome 125+ | Ejecución del frontend, Service Worker |

### 1.2 Configuración inicial del backend

```bash
# 1. Navegar al directorio del backend
cd backend

# 2. Crear entorno virtual de Python
python -m venv venv

# 3. Activar entorno virtual (Windows)
venv\Scripts\activate

# 4. Instalar dependencias
pip install -r requirements.txt

# 5. Configurar variables de entorno
copy .env.example .env
# Editar .env con las credenciales de la BD

# 6. Crear directorio de uploads
mkdir uploads

# 7. Iniciar el servidor
python -m uvicorn app.main:app --reload
```

### 1.3 Archivo de dependencias (`requirements.txt`)

```
fastapi==0.115.6
uvicorn[standard]==0.32.1
sqlalchemy==2.0.36
pydantic==2.10.4
pydantic-settings==2.7.0
PyMySQL==1.1.1
cryptography==43.0.1
python-multipart==0.0.19
python-jose[cryptography]==3.3.0
bcrypt==4.0.1
email-validator==2.2.0
PyPDF2==3.0.1
python-docx==1.1.2
openai==1.58.1
```

### 1.4 Configuración de variables de entorno (`backend/.env`)

```env
# Base de datos (MySQL con fallback automático a SQLite)
DATABASE_URL=mysql+pymysql://docupasion:DocuPasion2024!@127.0.0.1:3306/docupasion

# Seguridad
SECRET_KEY=docupasion-secret-key-2025-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# IA (vacío = modo demo)
OPENAI_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-3.5-turbo
CHUNK_SIZE=512
CHUNK_OVERLAP=64

# CORS
CORS_ORIGINS=
```

---

## 2. ESTRUCTURA DE CÓDIGO FUENTE

### 2.1 Backend — Estructura de directorios

```
backend/
├── app/
│   ├── __init__.py              # Marcador de paquete Python
│   ├── main.py                  # Punto de entrada: crea FastAPI app, registra routers,
│   │                            #   crea tablas, siembra datos, monta archivos estáticos
│   ├── database.py              # Engine SQLAlchemy con fallback MySQL→SQLite
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependency injection: get_current_user, get_current_admin
│   │   ├── auth.py              # POST /register, POST /login, GET /me
│   │   ├── documents.py         # POST /upload, GET /, GET /{id}, GET /download, DELETE /{id}
│   │   ├── repositories.py      # GET /, POST /, PATCH /{id}, DELETE /{id}
│   │   ├── ai_chat.py           # POST /, GET /search
│   │   ├── monitoring.py        # GET /logs, GET /ai-logs (admin)
│   │   └── config.py            # GET /, PUT / (admin)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic BaseSettings — lee .env
│   │   └── security.py          # bcrypt hash + JWT encode/decode
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py              # Base = declarative_base()
│   │   ├── user.py              # User: id, email, hashed_password, role, created_at
│   │   ├── document.py          # Document: 13 columnas, FK a user, repository, category
│   │   ├── repository.py        # Repository: id, name, owner_id, created_at
│   │   ├── category.py          # Category: id, name, description, is_default
│   │   ├── extraction.py        # DocumentExtraction: document_id, field_name, field_value
│   │   ├── ai_log.py            # AILog: operation_type, tokens_used, processing_time_ms
│   │   ├── error_log.py         # ErrorLog: error_code, message, level
│   │   └── system_config.py     # SystemConfig: key (PK), value
│   └── services/
│       ├── __init__.py
│       ├── pdf_parser.py        # Extracción: PyPDF2 (PDF), python-docx (DOCX), open() (TXT)
│       ├── document_analyzer.py # Clasificación por keywords + resumen por oraciones
│       ├── extractor.py         # Extracción de campos por tipo de documento
│       ├── rag_engine.py        # Búsqueda semántica + chat RAG (demo o con OpenAI)
│       ├── embedding.py         # Generación de embeddings: hash local o API OpenAI
│       └── config_service.py    # CRUD de SystemConfig con valores por defecto
├── sql/
│   └── docupasion.sql           # Esquema MySQL: CREATE TABLE, INSERT semilla
├── uploads/                     # Almacenamiento de archivos subidos (gitignored)
├── .env                         # Variables de entorno (gitignored)
├── requirements.txt             # 14 dependencias Python fijadas
└── start_server.bat             # Script de arranque automático (Windows)
```

### 2.2 Frontend — Estructura de directorios

```
frontend/
├── index.html                   # SPA: login, registro, dashboard, documentos, chat,
│                                #   monitoreo, configuración, visor PDF
├── sw.js                        # Service Worker: caché offline de todos los activos
├── css/
│   └── styles.css               # Diseño responsive: variables CSS, grid, tema púrpura
├── js/
│   ├── api.js                   # API 100% client-side: localStorage + IndexedDB,
│   │                            #   extracción, clasificación, resumen, chat, routing
│   └── app.js                   # Controlador SPA: manejo de eventos, renderizado,
│                                #   drag-and-drop, chat, monitoreo, configuración
├── vendor/
│   ├── lucide.min.js            # Iconografía vectorial (reemplaza Font Awesome)
│   ├── pdf.min.js               # Renderizado de PDF en navegador (pdf.js 3.11.174)
│   ├── pdf.worker.min.js        # Worker de pdf.js (procesamiento en segundo plano)
│   └── mammoth.browser.min.js   # Conversión de DOCX a texto/HTML
└── assets/
    └── (recursos estáticos adicionales)
```

---

## 3. IMPLEMENTACIÓN DE MÓDULOS CRÍTICOS

### 3.1 Módulo de Autenticación y Control de Roles

#### Backend — Seguridad (`backend/app/core/security.py`)

```python
"""
Módulo de seguridad: hash de contraseñas con bcrypt y JWT.

Se utiliza bcrypt directamente (sin passlib) para evitar la incompatibilidad
con bcrypt >= 4.1 que genera AttributeError en passlib 1.7.4.
"""
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings


def _encode_password(password: str) -> bytes:
    """
    Codifica la contraseña a bytes UTF-8 y valida la longitud.
    bcrypt tiene un límite de 72 bytes; contraseñas más largas
    se truncan silenciosamente, lo que reduce la seguridad.
    """
    data = password.encode("utf-8")
    if len(data) > 72:
        raise ValueError("La contraseña no puede superar los 72 caracteres")
    return data


def hash_password(password: str) -> str:
    """Genera un hash bcrypt de la contraseña con 12 rondas de costo."""
    return bcrypt.hashpw(
        _encode_password(password),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con un hash bcrypt.
    Retorna False en lugar de lanzar excepciones ante errores de formato.
    """
    try:
        return bcrypt.checkpw(
            _encode_password(plain_password),
            hashed_password.encode("utf-8")
        )
    except (ValueError, TypeError):
        return False


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Genera un token JWT con expiración configurable."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def decode_access_token(token: str) -> Optional[dict]:
    """Decodifica y valida un token JWT. Retorna None si es inválido."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None
```

#### Backend — Dependency injection (`backend/app/api/deps.py`)

```python
"""
Dependency injection para autenticación y autorización.
FastAPI ejecuta estas funciones en cada request que las declare como Depends().
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Extrae y valida el token JWT del header Authorization.
    Retorna el usuario autenticado o lanza 401.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Verifica que el usuario autenticado tenga rol 'admin'.
    Se usa en endpoints de monitoreo y configuración.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren privilegios de administrador",
        )
    return current_user
```

#### Backend — Endpoint de login (`backend/app/api/auth.py`)

```python
"""
Router de autenticación: registro, login y perfil.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """Registra un nuevo usuario con rol 'client'."""
    # Validar longitud mínima de contraseña
    if len(body.password) < 12:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La contraseña debe tener mínimo 12 caracteres",
        )
    # Verificar unicidad de email
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El correo ya está registrado",
        )
    # Crear usuario
    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        role="client",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Generar token
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {
        "id": user.id, "email": user.email, "role": user.role,
        "access_token": token, "token_type": "bearer",
    }


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Autentica usuario y retorna JWT."""
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Retorna el perfil del usuario autenticado."""
    return {
        "id": current_user.id, "email": current_user.email,
        "role": current_user.role, "created_at": current_user.created_at,
    }
```

#### Frontend — API client-side (`frontend/js/api.js`, sección Auth)

```javascript
/**
 * Módulo de autenticación client-side.
 * Almacena tokens en localStorage y gestiona sesiones.
 * Implementa la misma interfaz que el backend para
 * que la UI funcione idénticamente en ambos modos.
 */
if (method === 'POST' && _matchSegs(segs, ['api', 'auth', 'register'])) {
    var em = (body.email || '').trim().toLowerCase();
    var pw = body.password || '';
    if (!em || !pw) throw new APIError('Email y contraseña son requeridos', 422);
    if (pw.length < 12) throw new APIError(
        'La contraseña debe tener al menos 12 caracteres', 422
    );
    // Verificar unicidad de email
    if (db.users.some(function (u) { return u.email === em; }))
        throw new APIError('El email ya está registrado', 400);
    // Crear usuario con hash de contraseña
    var nu = {
        id: _nextId(db, 'users'), email: em,
        passwordHash: String(_hash(pw)), role: 'client',
        createdAt: new Date().toISOString()
    };
    db.users.push(nu);
    _saveDB(db);
    return {
        id: nu.id, email: nu.email, role: nu.role,
        access_token: nu.email, token_type: 'bearer'
    };
}
```

### 3.2 Módulo de Carga y Validación de Archivos

#### Backend — Endpoint de carga (`backend/app/api/documents.py`)

```python
"""
Router de documentos: carga, listado, detalle, descarga, eliminación y estadísticas.
"""
import os, uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.document import Document
from app.models.user import User
from app.api.deps import get_current_user
from app.services.pdf_parser import extract_text
from app.services.document_analyzer import classify_document, summarize_text
from app.services.extractor import extract_fields

router = APIRouter(prefix="/api/documents", tags=["documents"])

ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.txt'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    repository_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Carga y procesa un documento PDF, DOCX o TXT.
    Pipeline: validación → extracción → clasificación → resumen → extracción de campos.
    """
    # 1. Validar extensión
    ext = os.path.splitext(file.filename or '')[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, "Formato no soportado. Use PDF, TXT o DOCX.")

    # 2. Validar tamaño
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "El archivo supera el tamaño máximo de 50 MB.")

    # 3. Guardar archivo en disco
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join("uploads", filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # 4. Extraer texto
    extracted_text = extract_text(file_path, ext)

    # 5. Clasificar documento
    category = classify_document(file.filename, extracted_text)

    # 6. Generar resumen
    summary = summarize_text(extracted_text)

    # 7. Extraer campos estructurados
    extractions = extract_fields(extracted_text, category)

    # 8. Crear registro en BD
    doc = Document(
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream",
        status="indexed" if extracted_text else "failed",
        content_summary=summary,
        extracted_text=extracted_text,
        owner_id=current_user.id,
        repository_id=int(repository_id),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 9. Guardar extracciones
    for ext_data in extractions:
        extraction = DocumentExtraction(
            document_id=doc.id,
            field_name=ext_data["field_name"],
            field_value=ext_data["field_value"],
            extraction_type="metadata",
        )
        db.add(extraction)
    db.commit()

    return {
        "id": doc.id, "original_filename": doc.original_filename,
        "status": doc.status, "category": category,
        "content_summary": summary, "created_at": doc.created_at,
    }
```

#### Frontend — Validación y carga (`frontend/js/app.js`)

```javascript
/**
 * Módulo de carga de archivos con drag-and-drop.
 * Valida formato y tamaño antes de enviar al backend o procesar localmente.
 */
async function handleFileUpload(file, repositoryId) {
    // 1. Validar extensión
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'txt', 'docx'].includes(ext)) {
        showToast('Formato no soportado. Use PDF, TXT o DOCX.', 'error');
        return;
    }

    // 2. Validar tamaño (50 MB)
    if (file.size > 50 * 1024 * 1024) {
        showToast('El archivo supera el tamaño máximo de 50 MB.', 'error');
        return;
    }

    // 3. Crear FormData y enviar
    const fd = new FormData();
    fd.append('file', file);
    fd.append('repository_id', repositoryId);

    try {
        showLoader('Procesando documento...');
        const doc = await API.upload('/api/documents/upload', fd);
        showToast(`Documento "${doc.original_filename}" procesado exitosamente.`, 'success');
        await loadDocuments();
    } catch (err) {
        showToast(err.message || 'Error al cargar el documento.', 'error');
    }
}
```

### 3.3 Módulo de Procesamiento e Integración con IA

#### Backend — Parser de documentos (`backend/app/services/pdf_parser.py`)

```python
"""
Servicio de extracción de texto de documentos.
Soporta PDF (PyPDF2), DOCX (python-docx) y TXT (lectura directa).
"""
import PyPDF2
import docx


def extract_text(file_path: str, extension: str) -> str | None:
    """
    Extrae el contenido textual de un archivo según su formato.
    Retorna None si la extracción falla o el archivo está vacío.
    """
    try:
        if extension == '.pdf':
            return _extract_pdf(file_path)
        elif extension == '.docx':
            return _extract_docx(file_path)
        elif extension == '.txt':
            return _extract_txt(file_path)
    except Exception:
        return None
    return None


def _extract_pdf(file_path: str) -> str | None:
    """Extrae texto de PDF usando PyPDF2."""
    reader = PyPDF2.PdfReader(file_path)
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text)
    return "\n".join(parts) if parts else None


def _extract_docx(file_path: str) -> str | None:
    """Extrae texto de DOCX usando python-docx."""
    doc = docx.Document(file_path)
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs) if paragraphs else None


def _extract_txt(file_path: str) -> str | None:
    """Lee archivo de texto plano."""
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        text = f.read()
    return text.strip() if text.strip() else None
```

#### Backend — Clasificador y resumen (`backend/app/services/document_analyzer.py`)

```python
"""
Servicio de clasificación automática y generación de resúmenes.
Clasificación basada en conteo de palabras clave por categoría.
"""

# Diccionario de palabras clave por categoría
CATEGORY_KEYWORDS = {
    'académico': [
        'tesis', 'investigación', 'universidad', 'metodología', 'hipótesis',
        'bibliografía', 'abstract', 'conclusión', 'ensayo', 'trabajo de grado'
    ],
    'técnico': [
        'software', 'código', 'arquitectura', 'base de datos', 'servidor',
        'api', 'endpoints', 'docker', 'framework', 'backend', 'frontend'
    ],
    'legal': [
        'contrato', 'cláusula', 'ley', 'reglamento', 'norma', 'firma',
        'obligación', 'derecho', 'tribunal', 'demanda'
    ],
    'administrativo': [
        'acta', 'reunión', 'comité', 'planificación', 'presupuesto',
        'inventario', 'informe', 'reporte', 'directriz', 'gestión'
    ],
}


def classify_document(filename: str, text: str) -> str:
    """
    Clasifica un documento en una de las 4 categorías predefinidas
    o en 'general' si ninguna supera el umbral de 2 coincidencias.
    """
    normalized = _normalize(text)
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        scores[cat] = sum(1 for kw in keywords if _normalize(kw) in normalized)

    best_category = 'general'
    best_score = 0
    for cat, score in scores.items():
        if score > best_score:
            best_score = score
            best_category = cat

    return best_category if best_score > 2 else 'general'


def _normalize(text: str) -> str:
    """Normaliza texto: minúsculas + eliminación de acentos (NFD)."""
    import unicodedata
    text = (text or '').lower()
    nfd = unicodedata.normalize('NFD', text)
    return ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')


def summarize_text(text: str, max_sentences: int = 3, max_chars: int = 500) -> str:
    """
    Genera un resumen seleccionando las primeras N oraciones del texto.
    No genera texto nuevo; solo selecciona del contenido existente.
    """
    if not text or not text.strip():
        return ''
    sentences = [s.strip() for s in text.split('.') if len(s.strip()) > 20]
    if not sentences:
        return text[:300]
    summary = '. '.join(sentences[:max_sentences]) + '.'
    return summary[:max_chars] if len(summary) > max_chars else summary
```

#### Backend — Extracción de campos (`backend/app/services/extractor.py`)

```python
"""
Servicio de extracción de campos estructurados por tipo de documento.
Utiliza expresiones regulares y búsqueda de patrones textuales.
"""
import re


def extract_fields(text: str, category: str) -> list[dict]:
    """
    Extrae campos específicos según la categoría del documento.
    Retorna una lista de diccionarios {field_name, field_value}.
    """
    if not text or category == 'general':
        return []

    extractor_map = {
        'académico': _extract_academic,
        'técnico': _extract_technical,
        'legal': _extract_legal,
        'administrativo': _extract_administrative,
    }

    extractor = extractor_map.get(category)
    if extractor:
        return [f for f in extractor(text) if f['field_value']]
    return []


def _find_line(text: str, pattern: str) -> str:
    """Busca una línea que contenga el patrón regex indicado."""
    for line in text.split('\n'):
        if re.search(pattern, line, re.IGNORECASE):
            return line.strip()[:200]
    return ''


def _extract_academic(text: str) -> list[dict]:
    """Extrae campos de documentos académicos."""
    years = list(set(re.findall(r'\b(19|20)\d{2}\b', text)))
    emails = list(set(re.findall(r'[\w.+-]+@[\w-]+\.[\w.]+', text)))[:3]
    return [
        {'field_name': 'autor', 'field_value': _find_line(text, r'autor|author')},
        {'field_name': 'institución', 'field_value': _find_line(text, r'universidad|institución')},
        {'field_name': 'palabras clave', 'field_value': _find_line(text, r'palabras clave|keywords')},
        {'field_name': 'año', 'field_value': ', '.join(sorted(years))},
        {'field_name': 'email', 'field_value': ', '.join(emails)},
    ]


def _extract_technical(text: str) -> list[dict]:
    """Extrae campos de documentos técnicos."""
    return [
        {'field_name': 'requisitos', 'field_value': _find_line(text, r'requisitos')},
        {'field_name': 'arquitectura', 'field_value': _find_line(text, r'arquitectura')},
        {'field_name': 'tecnologías', 'field_value': _find_line(text, r'tecnologías|stack|framework')},
    ]


def _extract_legal(text: str) -> list[dict]:
    """Extrae campos de documentos legales."""
    years = list(set(re.findall(r'\b(19|20)\d{2}\b', text)))
    return [
        {'field_name': 'partes', 'field_value': _find_line(text, r'contrato|acuerdo|partes')},
        {'field_name': 'cláusulas', 'field_value': _find_line(text, r'cláusula')},
        {'field_name': 'vigencia', 'field_value': _find_line(text, r'vigencia')},
        {'field_name': 'fechas', 'field_value': ', '.join(sorted(years))},
    ]


def _extract_administrative(text: str) -> list[dict]:
    """Extrae campos de documentos administrativos."""
    years = list(set(re.findall(r'\b(19|20)\d{2}\b', text)))
    return [
        {'field_name': 'asistentes', 'field_value': _find_line(text, r'asistentes')},
        {'field_name': 'acuerdos', 'field_value': _find_line(text, r'acuerdos|compromisos')},
        {'field_name': 'fechas', 'field_value': ', '.join(sorted(years))},
    ]
```

#### Backend — Motor RAG (`backend/app/services/rag_engine.py`)

```python
"""
Motor de Retrieval-Augmented Generation (RAG).
Implementa búsqueda semántica por embeddings y chat con LLM.
Modo demo: búsqueda por keywords + respuesta basada en fragmentos.
"""
import time
from sqlalchemy.orm import Session
from app.models.document import Document


class RAGEngine:
    def __init__(self, db: Session, owner_id: int):
        self.db = db
        self.owner_id = owner_id

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """
        Busca fragmentos relevantes en los documentos del usuario.
        En modo demo: búsqueda por keywords con normalización de acentos.
        """
        normalized_query = self._normalize(query)
        documents = self.db.query(Document).filter(
            Document.owner_id == self.owner_id,
            Document.status == 'indexed',
            Document.extracted_text.isnot(None),
        ).all()

        results = []
        for doc in documents:
            text = self._normalize(doc.extracted_text)
            count = text.count(normalized_query)
            if count > 0:
                snippet = self._make_snippet(doc.extracted_text, query)
                results.append({
                    'doc_id': doc.id,
                    'filename': doc.original_filename,
                    'text': snippet,
                    'score': count,
                })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]

    def chat(self, message: str) -> dict:
        """Responde una pregunta usando RAG."""
        start = time.time()
        hits = self.search(message)
        elapsed_ms = int((time.time() - start) * 1000)

        if hits:
            answer = "Respuesta generada desde el repositorio local:\n\n"
            for i, h in enumerate(hits):
                answer += f"Fragmento {i+1}: {h['text'][:400]}\n\n"
        else:
            answer = "No encontré información relacionada en tu repositorio."

        return {
            'query': message,
            'answer': answer,
            'sources': [{'doc_id': h['doc_id'], 'score': h['score'], 'snippet': h['text'][:240]} for h in hits],
            'chunks_retrieved': len(hits),
            'mode': 'demo',
            'response_time_ms': elapsed_ms,
        }

    def _normalize(self, text: str) -> str:
        """Normaliza texto para búsqueda insensible a acentos."""
        import unicodedata
        text = (text or '').lower()
        nfd = unicodedata.normalize('NFD', text)
        return ''.join(c for c in nfd if unicodedata.category(c) != 'Mn')

    def _make_snippet(self, text: str, query: str, radius: int = 120) -> str:
        """Extrae un fragmento de contexto alrededor de la coincidencia."""
        idx = text.lower().find(query.lower())
        if idx == -1:
            return text[:240]
        start = max(0, idx - radius)
        end = min(len(text), idx + len(query) + radius)
        return text[start:end].replace('\n', ' ')
```

### 3.4 Módulo de Búsqueda Semántica y Consultas en Lenguaje Natural

#### Frontend — Chat y búsqueda (`frontend/js/api.js`, sección Chat)

```javascript
/**
 * Módulo de chat y búsqueda client-side.
 * Implementa RAG local sin servidor: busca por keywords,
 * recupera fragmentos relevantes y construye respuestas.
 */
// POST /api/chat/ — Chat de preguntas y respuestas
if (method === 'POST' && _matchSegs(segs, ['api', 'chat'])) {
    if (!body || !body._user) throw new APIError('No autenticado', 401);
    var msg = _norm(body.message || '');
    var start = Date.now();
    // Buscar documentos del usuario con texto extraído
    var q = db.documents.filter(function (d) {
        return d.ownerId === body._user.id && d.status === 'indexed' && d.extractedText;
    });
    var hits = [];
    q.forEach(function (d) {
        var t = _norm(d.extractedText), idx = t.indexOf(msg);
        if (idx !== -1) {
            hits.push({
                doc_id: d.id, filename: d.originalFilename,
                text: d.extractedText.slice(
                    Math.max(0, idx - 100), idx + msg.length + 300
                ),
                score: 1
            });
        }
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    hits = hits.slice(0, 5);
    // Construir respuesta
    var answer = hits.length
        ? 'Respuesta generada desde el repositorio local:\n\n'
          + hits.map(function (h, i) {
              return 'Fragmento ' + (i + 1) + ': ' + h.text.slice(0, 400);
          }).join('\n\n')
        : 'No encontré información relacionada en tu repositorio.';
    var elapsed = Date.now() - start;
    // Registrar en logs
    db.aiLogs.push({
        id: _nextId(db, 'aiLogs'), documentId: null,
        ownerId: body._user.id, operationType: 'chat',
        tokensUsed: 0, processingTimeMs: elapsed,
        timestamp: new Date().toISOString()
    });
    _saveDB(db);
    return {
        query: body.message, answer: answer,
        sources: hits.map(function (h) {
            return { doc_id: h.doc_id, score: h.score, snippet: h.text.slice(0, 240) };
        }),
        chunks_retrieved: hits.length, mode: 'demo', response_time_ms: elapsed
    };
}

// GET /api/chat/search?q=... — Búsqueda por keywords
if (method === 'GET' && _matchSegs(segs, ['api', 'chat', 'search'])) {
    if (!body || !body._user) throw new APIError('No autenticado', 401);
    var sq = _norm(qs.get('q') || '');
    if (!sq) throw new APIError('La consulta no puede estar vacía', 400);
    var res = [];
    db.documents.filter(function (d) {
        return d.ownerId === body._user.id && d.status === 'indexed' && d.extractedText;
    }).forEach(function (d) {
        var lc = _norm(d.extractedText), c = 0, pos = -1;
        while ((pos = lc.indexOf(sq, pos + 1)) !== -1) c++;
        if (c > 0) res.push({
            doc_id: d.id, filename: d.originalFilename,
            snippet: _makeSnippet(d.extractedText, sq), score: c
        });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return { query: qs.get('q'), count: res.length, results: res.slice(0, 30) };
}
```

---

## 4. GESTIÓN DE ERRORES, VALIDACIONES Y BUENAS PRÁCTICAS

### 4.1 Manejo de excepciones globales

#### Backend — Exception handler (`backend/app/main.py`)

```python
"""
Excepción global: captura errores no manejados y retorna JSON con detalle.
Sin esto, FastAPI retorna HTML con stack trace que expone información interna.
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="DocuPasion API")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Captura cualquier excepción no atrapada y retorna error 500 con detalle."""
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )
```

#### Frontend — APIError y manejo de errores (`frontend/js/api.js`)

```javascript
/**
 * Clase de error personalizada para la API.
 * Captura el status HTTP y el mensaje del servidor.
 */
class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.name = 'APIError';
    }
}

/**
 * Función request(): punto de entrada para todas las llamadas API.
 * En modo cliente: procesa la petición internamente.
 * En modo servidor: reenvía al backend FastAPI.
 */
async function request(path, opts) {
    opts = opts || {};
    var method = (opts.method || 'GET').toUpperCase();
    var body = opts.body;
    // Si hay propiedades internas (_user, _file, _route), procesar localmente
    // Si no, reenviar al servidor via fetch()
    // ...
}
```

### 4.2 Validaciones de entrada

El sistema implementa validación en tres capas:

1. **Frontend (api.js):** Validación inmediata antes de enviar al backend o procesar localmente. Incluye: formato de email, longitud de contraseña, extensión de archivo, tamaño de archivo, campos requeridos.

2. **Backend (Pydantic):** Validación automática de esquemas de entrada. FastAPI + Pydantic validan tipos, formatos y constraintes declarados en los modelos de request.

3. **Backend (SQLAlchemy):** Validación a nivel de base de datos. Constraintes UNIQUE, NOT NULL, FOREIGN KEY. El ORM lanza excepciones que el exception handler convierte en respuestas JSON.

### 4.3 Seguridad en variables de entorno

```bash
# El archivo .env NUNCA se incluye en el repositorio
echo ".env" >> .gitignore
echo "uploads/" >> .gitignore
echo "*.db" >> .gitignore
echo "venv/" >> .gitignore
echo "__pycache__/" >> .gitignore

# El SECRET_KEY se genera aleatoriamente en producción
python -c "import secrets; print(secrets.token_hex(32))"
# Copiar el resultado al .env
```

### 4.4 Flujo de control de versiones con Git

```bash
# Flujo de branching
main          ← código estable, desplegado
  └── feature/*   ← nuevas funcionalidades
  └── fix/*       ← corrección de bugs
  └── docs/*      ← actualización documental

# Convenciones de commits (conventional commits)
git commit -m "feat: add document upload with drag-and-drop"
git commit -m "fix: correct spinner not restoring after upload"
git commit -m "docs: update README for no-server architecture"
git commit -m "refactor: replace passlib with direct bcrypt usage"

# Push y pull request
git checkout -b feature/offline-mode
# ... desarrollo ...
git add .
git commit -m "feat: implement full client-side API with localStorage"
git push origin feature/offline-mode
# Crear PR en GitHub
```

---

## 5. MANUAL TÉCNICO DE INSTALACIÓN

### 5.1 Prerrequisitos

| Requisito | Versión | Verificación |
|---|---|---|
| Python | ≥3.10 | `python --version` |
| pip | Última | `pip --version` |
| Git | ≥2.0 | `git --version` |
| Navegador web | Chrome 90+, Firefox 88+ | Verificar en chrome://version |
| MySQL (opcional) | ≥8.0 | `mysql --version` |

### 5.2 Instalación del backend (opcional)

```bash
# Clonar repositorio
git clone https://github.com/usuario/docupasion.git
cd docupasion/backend

# Crear entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
copy .env.example .env
# Editar .env con las credenciales de MySQL (si se usa)

# Iniciar servidor
python -m uvicorn app.main:app --reload
# Abrir http://localhost:8000
```

### 5.3 Instalación del frontend (recomendada)

No se requiere instalación. El frontend funciona abriendo el archivo HTML directamente:

```
# Opción 1: Doble clic
frontend/index.html

# Opción 2: Servidor local rápido (si se tiene Node.js)
npx serve frontend
# Abrir http://localhost:3000

# Opción 3: Python
cd frontend
python -m http.server 8080
# Abrir http://localhost:8080
```

### 5.4 Credenciales por defecto

| Campo | Valor |
|---|---|
| Email administrador | `admin@docupasion.com` |
| Contraseña | `Admin123456!` |
| Rol | `admin` |

### 5.5 Solución de problemas

| Problema | Causa | Solución |
|---|---|---|
| "No hay conexión con el servidor" | Backend no ejecutándose | Iniciar con `python -m uvicorn app.main:app --reload` o abrir `index.html` directamente (modo cliente) |
| Spinner no se detiene | Bug de setBusy (corregido) | Actualizar `app.js` con la versión corregida del repo |
| "Formato no soportado" | Archivo no es PDF/DOCX/TXT | Verificar extensión del archivo |
| Login no funciona | Token expirado o localStorage corrupto | Limpiar localStorage y reintentar |
| MySQL no conecta | MySQL no está ejecutándose | El sistema usa SQLite automáticamente; o iniciar MySQL en XAMPP |

---

**FIN DEL DOCUMENTO DE DESARROLLO — FASE 03**
