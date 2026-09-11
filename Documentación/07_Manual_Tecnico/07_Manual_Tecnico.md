# Manual Técnico

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Versión:** 2.0
**Fecha:** Septiembre 2025
**Universidad UTS — Tecnología en Desarrollo de Software**

---

## 1. Introducción

Este manual técnico está dirigido a desarrolladores, arquitectos de software y profesionales de TI que necesitan comprender la arquitectura interna del sistema DocuPasion, modificar su código fuente, extender sus funcionalidades o diagnosticar problemas técnicos.

El documento cubre la estructura completa del código fuente, los mecanismos de comunicación entre componentes, las decisiones de diseño implementadas, la configuración del entorno de desarrollo y las guías de extensión para funcionalidades futuras.

### 1.1 Prerrequisitos para este manual

- Conocimiento de JavaScript (ES2020+) y Python (3.10+).
- Familiaridad con arquitecturas web MVC y APIs REST.
- Conocimientos básicos de bases de datos relacionales (SQL) y NoSQL.
- Herramientas de desarrollo: VS Code, Git, terminal de comandos.

---

## 2. Arquitectura del Sistema

### 2.1 Visión general

DocuPasion implementa una **arquitectura MVC modular dual** que opera en dos modos:

1. **Modo cliente (JavaScript puro):** El frontend procesa todo localmente usando localStorage, IndexedDB y algoritmos en JavaScript. No requiere servidor ni conexión a internet.

2. **Modo servidor (FastAPI + SQLAlchemy):** El backend procesa las peticiones usando Python, SQLAlchemy ORM y almacenamiento en disco. Requiere Python 3.10+ y opcionalmente MySQL.

Ambos modos comparten la misma interfaz de usuario y la misma capa de abstracción API (`api.js`), lo que garantiza paridad funcional.

### 2.2 Diagrama de componentes

```
┌──────────────────────────────────────────────────────────────┐
│                     NAVEGADOR WEB                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  index.html + app.js + styles.css                      │  │
│  │  (Interfaz de usuario, manejo de eventos, renderizado) │  │
│  └────────────────────────┬───────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼───────────────────────────────┐  │
│  │  api.js (Capa de abstracción API)                      │  │
│  │  ┌──────────────────────┐  ┌────────────────────────┐  │  │
│  │  │ Modo Cliente         │  │ Modo Servidor          │  │  │
│  │  │ - localStorage       │  │ - fetch() → FastAPI    │  │  │
│  │  │ - IndexedDB          │  │ - JSON responses       │  │  │
│  │  │ - Algoritmos JS      │  │ - JWT auth             │  │  │
│  │  └──────────────────────┘  └────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│                     SERVIDOR (opcional)                       │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  FastAPI (app/main.py)                                 │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │  │
│  │  │ Auth    │ │ Documents│ │ Chat     │ │ Config    │  │  │
│  │  │ Router  │ │ Router   │ │ Router   │ │ Router    │  │  │
│  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │  │
│  │       │           │            │              │         │  │
│  │  ┌────▼───────────▼────────────▼──────────────▼─────┐  │  │
│  │  │  Services (pdf_parser, analyzer, extractor,      │  │  │
│  │  │           rag_engine, embedding, config)         │  │  │
│  │  └────────────────────┬────────────────────────────┘  │  │
│  │                       │                                │  │
│  │  ┌────────────────────▼────────────────────────────┐  │  │
│  │  │  SQLAlchemy ORM → MySQL / SQLite                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Decisiones arquitectónicas clave

| Decisión | Alternativa descartada | Justificación |
|---|---|---|
| JavaScript vanilla sin frameworks | React, Vue, Angular | Eliminación de dependencias de compilación. El proyecto debe funcionar abriendo index.html directamente. |
| FastAPI sobre Flask/Django | Flask (más simple), Django (más completo) | FastAPI proporciona validación automática con Pydantic, soporte async, documentación OpenAPI. |
| bcrypt directo sobre passlib | passlib (wrapper) | passlib 1.7.4 incompatible con bcrypt ≥4.1. Eliminación de capa innecesaria. |
| localStorage + IndexedDB | Redux, frameworks de estado | Almacenamiento nativo del navegador sin dependencias externas. |
| Service Worker para offline | Application Cache (deprecated) | Estándar W3C soportado por todos los navegadores modernos. |

---

## 3. Estructura del Código Fuente

### 3.1 Backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                  # Punto de entrada: FastAPI app, routers, lifespan
│   ├── database.py              # Engine SQLAlchemy, fallback MySQL→SQLite
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependency injection: get_current_user/admin
│   │   ├── auth.py              # POST /register, POST /login, GET /me
│   │   ├── documents.py         # POST /upload, GET /, GET /{id}, DELETE /{id}
│   │   ├── repositories.py      # GET /, POST /, PATCH /{id}, DELETE /{id}
│   │   ├── ai_chat.py           # POST /, GET /search
│   │   ├── monitoring.py        # GET /logs, GET /ai-logs (admin)
│   │   └── config.py            # GET /, PUT / (admin)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic BaseSettings desde .env
│   │   └── security.py          # bcrypt hash + JWT encode/decode
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py              # Base = declarative_base()
│   │   ├── user.py              # User: id, email, hashed_password, role
│   │   ├── document.py          # Document: 13 columnas, FK relationships
│   │   ├── repository.py        # Repository: id, name, owner_id
│   │   ├── category.py          # Category: id, name, is_default
│   │   ├── extraction.py        # DocumentExtraction: field_name, field_value
│   │   ├── ai_log.py            # AILog: operation_type, tokens_used
│   │   ├── error_log.py         # ErrorLog: error_code, message, level
│   │   └── system_config.py     # SystemConfig: key (PK), value
│   └── services/
│       ├── __init__.py
│       ├── pdf_parser.py        # Extracción: PyPDF2, python-docx, TXT
│       ├── document_analyzer.py # Clasificación por keywords + resumen
│       ├── extractor.py         # Extracción de campos por categoría
│       ├── rag_engine.py        # Búsqueda semántica + chat RAG
│       ├── embedding.py         # Embeddings: hash local o OpenAI API
│       └── config_service.py    # CRUD de SystemConfig
├── sql/
│   └── docupasion.sql           # Esquema MySQL + datos semilla
├── uploads/                     # Almacenamiento de archivos subidos
├── .env                         # Variables de entorno (NO commitear)
├── requirements.txt             # 14 dependencias Python
└── start_server.bat             # Script de arranque automático
```

### 3.2 Frontend

```
frontend/
├── index.html                   # SPA: estructura HTML, carga de scripts
├── sw.js                        # Service Worker: caché offline
├── css/
│   └── styles.css               # Diseño responsive, variables CSS, tema
├── js/
│   ├── api.js                   # API 100% client-side (511 líneas)
│   └── app.js                   # Controlador SPA (562 líneas)
├── vendor/
│   ├── lucide.min.js            # Iconografía vectorial
│   ├── pdf.min.js               # Renderizado de PDF (pdf.js 3.11.174)
│   ├── pdf.worker.min.js        # Worker de pdf.js
│   └── mammoth.browser.min.js   # Conversión DOCX a texto
└── assets/                      # Recursos estáticos adicionales
```

### 3.3 Dependencias del backend

| Paquete | Versión | Propósito |
|---|---|---|
| fastapi | 0.115.6 | Framework web async |
| uvicorn | 0.32.1 | Servidor ASGI |
| sqlalchemy | 2.0.36 | ORM para bases de datos |
| pydantic | 2.10.4 | Validación de datos |
| pydantic-settings | 2.7.0 | Variables de entorno |
| PyMySQL | 1.1.1 | Driver MySQL |
| cryptography | 43.0.1 | Encriptación para PyMySQL |
| python-multipart | 0.0.19 | Soporte multipart/form-data |
| python-jose | 3.3.0 | JWT encode/decode |
| bcrypt | 4.0.1 | Hash de contraseñas |
| email-validator | 2.2.0 | Validación de emails |
| PyPDF2 | 3.0.1 | Extracción de texto de PDF |
| python-docx | 1.1.2 | Extracción de texto de DOCX |
| openai | 1.58.1 | Cliente API OpenAI (opcional) |

### 3.4 Dependencias del frontend (vendor)

| Librería | Versión | Tamaño | Propósito |
|---|---|---|---|
| pdf.js | 3.11.174 | 320 KB | Renderizado y extracción de PDF |
| pdf.worker.min.js | 3.11.174 | 1.06 MB | Worker para procesamiento PDF |
| mammoth.js | 1.8.0 | 643 KB | Conversión DOCX a HTML/texto |
| Lucide Icons | latest | 439 KB | Iconografía vectorial |

---

## 4. Mecanismos de Comunicación

### 4.1 Capa API dual (`api.js`)

La función `request()` en `api.js` es el punto de entrada central para todas las comunicaciones:

```javascript
async function request(path, opts) {
    opts = opts || {};
    var method = (opts.method || 'GET').toUpperCase();
    var body = opts.body;

    // Construir contexto interno
    var ctx = {
        _user: _currentUser(),
        _file: null,
        _route: null,
    };

    // Si es FormData, extraer campos
    if (body && typeof body.get === 'function' && body.constructor && body.constructor.name === 'FormData') {
        ctx._file = body.get('file');
        ctx.repository_id = body.get('repository_id');
    } else if (body && typeof body === 'object') {
        Object.assign(ctx, body);
    }

    // Adjuntar usuario actual para autenticación
    ctx._user = _currentUser();

    // Procesar localmente (modo cliente)
    try {
        return await _route(method, path, ctx);
    } catch (e) {
        // Si falla, intentar con el servidor
        // ... fetch() al backend FastAPI
    }
}
```

### 4.2 Router interno (`_route`)

La función `_route()` implementa un router completo que maneja todas las rutas de la API:

```javascript
async function _route(method, path, body) {
    var segs = path.replace(/\/+$/, '').split('/').filter(Boolean);
    var db = _seed(_loadDB());

    // Auth routes
    if (method === 'POST' && _matchSegs(segs, ['api', 'auth', 'register'])) {
        // ... lógica de registro
    }
    if (method === 'POST' && _matchSegs(segs, ['api', 'auth', 'login'])) {
        // ... lógica de login
    }

    // Document routes
    if (method === 'POST' && _matchSegs(segs, ['api', 'documents', 'upload'])) {
        // ... lógica de carga y procesamiento
    }

    // ... más rutas
}
```

### 4.3 Patrón de matching de rutas

```javascript
function _matchSegs(segs, pat) {
    if (segs.length !== pat.length) return false;
    for (var i = 0; i < segs.length; i++) {
        if (pat[i] === ':id') {
            if (!/^\d+$/.test(segs[i])) return false;
        } else if (pat[i] !== segs[i]) {
            return false;
        }
    }
    return true;
}
```

### 4.4 Flujo de una petición típica

```
1. app.js llama: API.post('/api/auth/login', { username, password })
2. api.js construye: body = new URLSearchParams({ username, password })
3. api.js llama: request('/api/auth/login', { method: 'POST', body })
4. request() construye ctx con _user = null
5. _route('POST', '/api/auth/login', ctx) busca coincidencia
6. Encuentra: _matchSegs(['api','auth','login'], ['api','auth','login']) → true
7. Ejecuta lógica: busca usuario, verifica password, genera token
8. Retorna: { access_token: "...", token_type: "bearer" }
9. app.js recibe resultado y actualiza la UI
```

---

## 5. Base de Datos

### 5.1 Configuración del engine

```python
# backend/app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import pymysql

DATABASE_URL = "mysql+pymysql://user:pass@localhost:3306/docupasion"

def get_engine():
    try:
        # Intentar conectar a MySQL
        engine = create_engine(DATABASE_URL)
        engine.connect()
        return engine
    except Exception:
        # Fallback a SQLite
        return create_engine("sqlite:///./docupasion.db")
```

### 5.2 Modelo de datos (SQLAlchemy)

```python
# backend/app/models/user.py
from sqlalchemy import Column, Integer, String, DateTime, func
from app.models.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="client")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
```

### 5.3 Esquema de la base de datos

```sql
-- backend/sql/docupasion.sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'client',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE repositories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    UNIQUE KEY unique_repo_name (owner_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processing',
    content_summary TEXT,
    extracted_text LONGTEXT,
    owner_id INT NOT NULL,
    repository_id INT NOT NULL,
    category_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    FOREIGN KEY (repository_id) REFERENCES repositories(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 6. Pipeline de IA

### 6.1 Extracción de texto

```python
# backend/app/services/pdf_parser.py
def extract_text(file_path: str, extension: str) -> str | None:
    if extension == '.pdf':
        reader = PyPDF2.PdfReader(file_path)
        return "\n".join([p.extract_text() for p in reader.pages if p.extract_text()])
    elif extension == '.docx':
        doc = docx.Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    elif extension == '.txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read().strip() or None
```

### 6.2 Clasificación automática

```python
# backend/app/services/document_analyzer.py
CATEGORY_KEYWORDS = {
    'académico': ['tesis', 'investigación', 'universidad', 'metodología', ...],
    'técnico': ['software', 'arquitectura', 'base de datos', 'api', ...],
    'legal': ['contrato', 'cláusula', 'ley', 'firma', ...],
    'administrativo': ['acta', 'reunión', 'comité', 'presupuesto', ...],
}

def classify_document(filename: str, text: str) -> str:
    normalized = _normalize(text)  # toLowerCase() + NFD (quitar tildes)
    scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        scores[cat] = sum(1 for kw in keywords if _normalize(kw) in normalized)
    best = max(scores, key=scores.get)
    return best if scores[best] > 2 else 'general'
```

### 6.3 Búsqueda RAG

```python
# backend/app/services/rag_engine.py
class RAGEngine:
    def search(self, query: str, top_k: int = 5) -> list[dict]:
        normalized = self._normalize(query)
        documents = self.db.query(Document).filter(
            Document.owner_id == self.owner_id,
            Document.status == 'indexed',
        ).all()

        results = []
        for doc in documents:
            text = self._normalize(doc.extracted_text)
            count = text.count(normalized)
            if count > 0:
                results.append({
                    'doc_id': doc.id,
                    'filename': doc.original_filename,
                    'text': self._make_snippet(doc.extracted_text, query),
                    'score': count,
                })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
```

---

## 7. Seguridad

### 7.1 Hash de contraseñas

```python
import bcrypt

def hash_password(password: str) -> str:
    """12 rondas de costo, ~250ms en hardware moderno."""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12)).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    """Verifica sin revelar si el usuario existe o la contraseña es incorrecta."""
    try:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))
    except (ValueError, TypeError):
        return False
```

### 7.2 JWT

```python
from jose import jwt
from datetime import datetime, timedelta

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(hours=24)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    except JWTError:
        return None
```

### 7.3 Variables de entorno

```bash
# backend/.env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/docupasion
SECRET_KEY=<hex_64_caracteres>
OPENAI_API_KEY=sk-<tu_key>
CORS_ORIGINS=https://tudominio.com
```

### 7.4 Autenticación por dependencias (FastAPI)

```python
# backend/app/api/deps.py
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(401, "Credenciales inválidas")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None:
        raise HTTPException(401, "Credenciales inválidas")
    return user

async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(403, "Se requieren privilegios de administrador")
    return user
```

---

## 8. Guía de Extensión

### 8.1 Agregar un nuevo endpoint

1. Crear el endpoint en el router correspondiente:

```python
# backend/app/api/documents.py
@router.get("/{id}/summary")
def get_document_summary(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    doc = db.query(Document).filter(
        Document.id == id,
        Document.owner_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(404, "Documento no encontrado")
    return {"summary": doc.content_summary}
```

2. Agregar la ruta en `api.js` (modo cliente):

```javascript
// frontend/js/api.js — en _route()
if (method === 'GET' && segs[1] === 'documents' && segs[3] === 'summary') {
    var did = parseInt(segs[2]);
    var doc = db.documents.find(d => d.id === did && d.ownerId === body._user.id);
    if (!doc) throw new APIError('Documento no encontrado', 404);
    return { summary: doc.contentSummary };
}
```

### 8.2 Agregar una nueva categoría

1. Agregar la categoría en `_seed()` de `api.js`:

```javascript
// En la función _seed()
db.categories = [
    { id: 1, name: 'académico', ... },
    { id: 2, name: 'técnico', ... },
    // Nueva categoría:
    { id: 6, name: 'financiero', description: 'Documentos financieros', isDefault: false },
];
```

2. Agregar keywords en `_CAT_KW`:

```javascript
var _CAT_KW = {
    // ... categorías existentes
    'financiero': ['presupuesto', 'factura', 'inversión', 'ganancia', 'balance'],
};
```

3. Agregar campos de extracción en `_extractFields()`:

```javascript
if (type === 'financiero') {
    fields.push({ field_name: 'monto', field_value: findLine(/\$\d+/) });
    fields.push({ field_name: 'fecha', field_value: findLine(/fecha/i) });
}
```

### 8.3 Integrar un nuevo proveedor de IA

Para agregar un proveedor de IA distinto a OpenAI:

1. Crear un nuevo servicio en `backend/app/services/`:

```python
# backend/app/services/custom_ai.py
class CustomAIService:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_embeddings(self, text: str) -> list[float]:
        # Implementar llamada a la API del proveedor
        pass

    def chat_completion(self, context: str, question: str) -> str:
        # Implementar llamada a la API del proveedor
        pass
```

2. Modificar `rag_engine.py` para usar el nuevo servicio:

```python
# En rag_engine.py
if settings.AI_PROVIDER == 'custom':
    from app.services.custom_ai import CustomAIService
    ai_service = CustomAIService(settings.CUSTOM_AI_KEY)
```

---

## 9. Despliegue

### 9.1 Despliegue local (desarrollo)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 9.2 Despliegue en servidor

```bash
# 1. Clonar repositorio
git clone https://github.com/usuario/docupasion.git

# 2. Configurar entorno
cd docupasion/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Configurar .env
cp .env.example .env
nano .env  # Configurar DATABASE_URL, SECRET_KEY, etc.

# 4. Crear base de datos
mysql -u root -p < sql/docupasion.sql

# 5. Iniciar servidor
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 9.3 Docker (futuro)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 10. Solución de Problemas Técnicos

| Problema técnico | Causa | Solución |
|---|---|---|
| `AttributeError: module 'bcrypt' has no attribute '__about__'` | passlib 1.7.4 incompatible con bcrypt ≥4.1 | Eliminar passlib, usar bcrypt directamente |
| `ModuleNotFoundError: No module named 'PyPDF2'` | Dependencia no instalada | `pip install PyPDF2` o `pip install -r requirements.txt` |
| `JWTDecodeError: Not enough segments` | Token JWT malformado o ausente | Verificar que el header Authorization contiene "Bearer <token>" |
| `IntegrityError: duplicate key` | Email o nombre de repositorio duplicado | El sistema retorna error 409/400; el código cliente lo maneja |
| `OperationalError: (2002)` | MySQL no está ejecutándose | Iniciar MySQL o verificar DATABASE_URL en .env |
| `TypeError: Cannot read property 'getDocument'` | pdf.js no se cargó correctamente | Verificar que vendor/pdf.min.js y pdf.worker.min.js existen |
| Service Worker no registra | HTTPS requerido en producción | En localhost funciona; en producción usar HTTPS |
| `QuotaExceededError` | localStorage lleno (~5MB) | Limpiar datos antiguos o migrar a modo servidor |

---

**Fin del Manual Técnico**
