# FASE 02 — DOCUMENTO DE DISEÑO DE ARQUITECTURA

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Proyecto Integrador — Tecnología en Desarrollo de Software, VI Semestre**
**Universidad UTS**

| Campo | Valor |
|---|---|
| Fase | 02 — Diseño |
| Versión del documento | 2.0 |
| Fecha de elaboración | Septiembre 2025 |
| Autor(es) | Estudiantes VI Semestre — UTS |
| Revisor | Director del Proyecto Integrador |

---

## 1. ARQUITECTURA GENERAL DE LA SOLUCIÓN

### 1.1 Patrón arquitectónico seleccionado

El sistema DocuPasion adopta una **arquitectura MVC (Model-View-Controller) modular** como patrón arquitectónico principal, con una separación deliberada en tres capas fundamentales que permiten la independencia operativa del frontend respecto del backend. Esta decisión arquitectónica se justifica por tres razones fundamentales:

En primer lugar, el patrón MVC proporciona una separación clara de responsabilidades entre la presentación (View), la lógica de negocio (Controller) y los datos (Model), lo que facilita la mantenibilidad, las pruebas unitarias y la sustitución de componentes sin efectos colaterales. Cada capa puede ser desarrollada, probada y desplegada de forma independiente, lo cual es especialmente valioso en un contexto de proyecto integrador universitario donde los estudiantes deben comprender y justificar cada decisión de diseño.

En segundo lugar, la arquitectura dual del sistema (modo servidor con FastAPI y modo cliente puro con JavaScript) se facilita significativamente por la separación MVC. El frontend (View + Controller en JavaScript) puede funcionar de manera independiente implementando su propio "modelo" en localStorage/IndexedDB, o comunicarse con el backend (Controller FastAPI + Model SQLAlchemy) a través de la misma capa de abstracción (la capa API definida en `api.js`). Esta simetría arquitectónica es una de las decisiones de diseño más innovadoras del proyecto.

En tercer lugar, la escalabilidad futura del sistema — que podría incluir la migración a microservicios, la incorporación de una base de datos vectorial dedicada o la adición de clientes móviles nativos — se ve facilitada por la separación en capas. La capa de API actúa como contrato de integración estable que puede ser consumida por múltiples clientes sin modificaciones en el backend.

### 1.2 Diagrama de bloques arquitectónicos

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  index.html — SPA (Single Page Application)             │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │    │
│  │  │ Login /  │  │Dashboard │  │Documents │  │  Chat  │  │    │
│  │  │ Register │  │ Metrics  │  │ Upload   │  │   AI   │  │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────┘  │    │
│  │  app.js (SPA Controller) + styles.css (UI Theme)        │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        CAPA DE LÓGICA DE NEGOCIO                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  api.js — API Abstraction Layer (Dual Mode)              │    │
│  │  ┌─────────────────────┐  ┌──────────────────────────┐  │    │
│  │  │ MODO CLIENTE (JS)   │  │ MODO SERVIDOR (FastAPI)  │  │    │
│  │  │ localStorage + IDB  │  │ REST API + SQLAlchemy    │  │    │
│  │  │ Algoritmos locales  │  │ Services + ORM           │  │    │
│  │  └──────────┬──────────┘  └────────────┬─────────────┘  │    │
│  └─────────────┼──────────────────────────┼────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        CAPA DE INTELIGENCIA ARTIFICIAL          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Pipeline Documental:                                    │    │
│  │  Extracción → Clasificación → Resumen → Extracción       │    │
│  │  de Campos → Embeddings → Indexación → Búsqueda RAG     │    │
│  │                                                          │    │
│  │  Modo Demo: Algoritmos basados en reglas + keywords      │    │
│  │  Modo IA: OpenAI API (GPT-3.5/4 + Embeddings)          │    │
│  └─────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                        CAPA DE PERSISTENCIA                     │
│  ┌──────────────────┐    ┌────────────────────────────────┐    │
│  │  localStorage    │    │  MySQL / SQLite (backend)      │    │
│  │  (datos JSON)    │    │  8 tablas + system_config      │    │
│  ├──────────────────┤    ├────────────────────────────────┤    │
│  │  IndexedDB       │    │  uploads/ (archivos en disco)  │    │
│  │  (archivos Blob) │    │                                │    │
│  └──────────────────┘    └────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Decisiones arquitectónicas clave (ADR)

| ID | Decisión | Alternativas evaluadas | Justificación |
|---|---|---|---|
| ADR-01 | MVC modular sobre microservicios | Microservicios, arquitectura limpia hexagonal | Complejidad desproporcionada para el alcance. MVC proporciona claridad suficiente y es el patrón estándar en proyectos web de esta escala. |
| ADR-02 | Frontend JavaScript puro (sin frameworks) | React, Vue, Angular | Eliminación de dependencias de compilación. El proyecto debe funcionar abriendo index.html directamente. Reducción de tiempo de carga. |
| ADR-03 | Backend FastAPI sobre Flask/Django | Flask (más simple), Django (más completo) | FastAPI proporciona validación automática con Pydantic, soporte async nativo, documentación OpenAPI automática y rendimiento comparable a Node.js. |
| ADR-04 | SQLAlchemy ORM sobre queries directas | Raw SQL, SQLAlchemy Core | SQLAlchemy提供模型抽象、迁移辅助、relaciones declarativas y compatibilidad con múltiples BD (MySQL, SQLite, PostgreSQL). |
| ADR-05 | localStorage/IndexedDB sobre frameworks de estado | Redux, Vuex, Zustand | El almacenamiento nativo del navegador elimina dependencias externas y persiste datos sin servidor. IndexedDB maneja archivos grandes (hasta 50MB). |
| ADR-06 | Service Worker para offline | Application Cache (deprecated), Frameworks | SW es el estándar W3C soportado por todos los navegadores modernos. Proporciona caché controlado y sincría en segundo plano. |
| ADR-07 | bcrypt directo sobre passlib | passlib (wrapper), argon2 | passlib 1.7.4 tiene incompatibilidad conocida con bcrypt ≥4.1. bcrypt directo es más simple y elimina una capa de abstracción innecesaria. |

---

## 2. ARQUITECTURA DE COMPONENTES

### 2.1 Frontend — Capa de presentación

El frontend implementa una Single Page Application (SPA) construida con JavaScript vanilla (sin frameworks de terceros), que se carga completamente desde un único archivo HTML y gestiona la navegación interna mediante manipulación del DOM.

**Componentes del frontend:**

| Componente | Archivo | Responsabilidad | Líneas |
|---|---|---|---|
| Shell HTML | `index.html` | Estructura semántica, carga de scripts, meta tags, service worker registration | 283 |
| Controlador SPA | `app.js` | Navegación, manejo de eventos, renderizado de vistas, orquestación de llamadas API | 562 |
| Capa API | `api.js` | Abstracción de comunicación, routing interno, lógica de negocio client-side | 511 |
| Estilos | `styles.css` | Diseño visual, layout responsive, variables de tema, animaciones | 261 |
| Service Worker | `sw.js` | Caché offline, interceptación de requests, actualización de activos | 40 |
| Visor PDF | `vendor/pdf.min.js` + `pdf.worker.min.js` | Renderizado de documentos PDF en el navegador | — |
| Extracción DOCX | `vendor/mammoth.browser.min.js` | Conversión de DOCX a HTML/texto en el navegador | — |
| Iconos | `vendor/lucide.min.js` | Iconografía vectorial ligera (reemplaza Font Awesome/Feather) | — |

**Patrón de comunicación frontend:**

El frontend opera en dos modos que comparten la misma interfaz de usuario:

1. **Modo cliente (sin servidor):** `api.js` implementa internamente un "servidor virtual" que procesa las peticiones usando localStorage para datos estructurados, IndexedDB para archivos, y algoritmos locales para IA. Las funciones de extracción, clasificación, resumen, extracción de campos, búsqueda y chat se ejecutan completamente en el navegador.

2. **Modo servidor (con FastAPI):** `api.js` reenvía las peticiones al backend FastAPI mediante `fetch()`. El backend procesa las peticiones usando SQLAlchemy, servicios de IA y almacenamiento en disco.

La transición entre modos es transparente: si el backend no responde, el frontend detecta el error y opera en modo cliente. Esta dualidad se implementa en la función `request()` de `api.js`, que detecta si el body contiene propiedades internas (`_user`, `_file`, `_route`) que indican modo local, o si debe reenviar al servidor.

### 2.2 Backend — Capa de servicios

El backend implementa una API RESTful construida con FastAPI (Python), organizada en la siguiente estructura de módulos:

```
backend/
├── app/
│   ├── __init__.py              # Inicialización del paquete
│   ├── main.py                  # Punto de entrada: FastAPI app, lifespan, routers
│   ├── database.py              # Engine SQLAlchemy + fallback MySQL→SQLite
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py              # Dependency injection: get_current_user, get_current_admin
│   │   ├── auth.py              # Endpoints: /register, /login, /me
│   │   ├── documents.py         # Endpoints: /upload, /, /{id}, /download, /stats
│   │   ├── repositories.py      # Endpoints: /, /{id}
│   │   ├── ai_chat.py           # Endpoints: /, /search
│   │   ├── monitoring.py        # Endpoints: /logs, /ai-logs (admin)
│   │   └── config.py            # Endpoints: / (GET/PUT admin)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py            # Pydantic BaseSettings desde .env
│   │   └── security.py          # bcrypt hashing + JWT encode/decode
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py              # SQLAlchemy Base declarative
│   │   ├── user.py              # Modelo User (users)
│   │   ├── document.py          # Modelo Document (documents)
│   │   ├── repository.py        # Modelo Repository (repositories)
│   │   ├── category.py          # Modelo Category (categories)
│   │   ├── extraction.py        # Modelo DocumentExtraction (document_extractions)
│   │   ├── ai_log.py            # Modelo AILog (ai_logs)
│   │   ├── error_log.py         # Modelo ErrorLog (error_logs)
│   │   └── system_config.py     # Modelo SystemConfig (system_config)
│   └── services/
│       ├── __init__.py
│       ├── pdf_parser.py        # Extracción de texto: PyPDF2, python-docx, TXT
│       ├── document_analyzer.py # Clasificación por keywords + resumen
│       ├── extractor.py         # Extracción de campos por categoría
│       ├── rag_engine.py        # RAG: indexación, búsqueda semántica, chat
│       ├── embedding.py         # Generación de embeddings (hash local o OpenAI)
│       └── config_service.py    # CRUD de SystemConfig
├── sql/
│   └── docupasion.sql           # Esquema MySQL completo + datos semilla
├── uploads/                     # Almacenamiento de archivos subidos
├── .env                         # Variables de entorno (secrets)
└── requirements.txt             # Dependencias Python (14 paquetes)
```

**Componentes del backend:**

| Módulo | Archivos | Responsabilidad |
|---|---|---|
| Punto de entrada | `main.py` | Crear app FastAPI, registrar routers, crear tablas, sembrar datos iniciales, servir frontend estático |
| Base de datos | `database.py` | Configurar engine SQLAlchemy, fallback automático MySQL→SQLite, crear BD si no existe |
| Autenticación | `security.py`, `deps.py` | Hash de contraseñas (bcrypt), generación/verificación JWT, dependency injection de usuario actual |
| Routers | `auth.py`, `documents.py`, etc. | Validación de entrada (Pydantic), orquestación de servicios, respuesta HTTP |
| Modelos | `user.py`, `document.py`, etc. | Definición de tablas SQLAlchemy, relaciones, constraintes, métodos helper |
| Servicios | `pdf_parser.py`, `rag_engine.py`, etc. | Lógica de negocio: extracción, clasificación, resumen, embeddings, RAG |

### 2.3 Capa de datos

El sistema utiliza un enfoque dual de persistencia que varía según el modo de operación:

**Modo cliente (localStorage/IndexedDB):**
- `docupasion_db` (localStorage): Base de datos JSON serializada que contiene todas las tablas (users, repositories, documents, categories, document_extractions, ai_logs, error_logs, system_config) y secuencias de IDs (_seq).
- `docupasion_files` (IndexedDB, store `blobs`): Almacenamiento de archivos binarios (PDF, DOCX, TXT) como Blobs, indexados por el identificador del documento. IndexedDB se utiliza en lugar de localStorage por su capacidad de almacenamiento ilimitada (contrasta con los ~5MB de localStorage).

**Modo servidor (MySQL/SQLite):**
- MySQL (producción): Base de datos relacional con 8 tablas normalizadas, InnoDB, charset utf8mb4.
- SQLite (fallback): Archivo `docupasion.db` en el directorio del backend, utilizado automáticamente cuando MySQL no está disponible.
- `uploads/` (disco): Directorio de almacenamiento de archivos subidos, con nombres generados (UUID + extensión).

### 2.4 Motor de IA — Pipeline de procesamiento documental

El motor de IA es el componente central del sistema, responsable de transformar documentos no estructurados en información procesable. Está compuesto por cinco etapas secuenciales:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  EXTRACCIÓN  │ →  │CLASIFICACIÓN │ →  │   RESUMEN    │ →  │ EXTRACCIÓN   │ →  │  EMBEDDINGS  │
│  de texto    │    │ automática   │    │  ejecutivo   │    │ de campos    │    │  + indexación│
│              │    │              │    │              │    │ estructurados│    │              │
│ PDF→PyPDF2   │    │ 5 categorías │    │ Primeras N   │    │ 4 plantillas │    │ Hash local   │
│ DOCX→docx    │    │ por keywords │    │ oraciones    │    │ por tipo     │    │ o OpenAI API │
│ TXT→Reader   │    │ >2 threshold │    │ máx 500 chrs │    │ regex+KW     │    │ 1536 dims    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 3. DISEÑO DE MODELOS Y DATOS

### 3.1 Modelo Entidad-Relación (MER)

```
┌─────────────┐       ┌─────────────────┐       ┌──────────────┐
│   users     │       │  repositories   │       │  categories  │
├─────────────┤       ├─────────────────┤       ├──────────────┤
│ id (PK)     │──┐    │ id (PK)         │──┐    │ id (PK)      │
│ email (UQ)  │  │    │ name            │  │    │ name         │
│ hashed_pwd  │  │    │ owner_id (FK)   │──┘    │ description  │
│ role        │  │    │ created_at      │       │ is_default   │
│ created_at  │  │    └─────────────────┘       └──────┬───────┘
└─────────────┘  │                                     │
                 │    ┌──────────────────────────────┐  │
                 │    │         documents             │  │
                 │    ├──────────────────────────────┤  │
                 └───→│ id (PK)                      │  │
                      │ filename                     │  │
                      │ original_filename            │  │
                      │ file_path                    │  │
                      │ file_size                    │  │
                      │ mime_type                    │  │
                      │ status                       │  │
                      │ content_summary              │  │
                      │ extracted_text               │  │
                      │ owner_id (FK) ───────────────┤  │
                      │ repository_id (FK) ──────────┘  │
                      │ category_id (FK) ───────────────┘
                      │ created_at                     │
                      └──────────┬───────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
    ┌────────────┴──┐  ┌────────┴──────┐  ┌─────┴──────────┐
    │document_      │  │   ai_logs     │  │  error_logs    │
    │extractions    │  ├───────────────┤  ├────────────────┤
    ├───────────────┤  │ id (PK)       │  │ id (PK)        │
    │ id (PK)       │  │ document_id   │  │ document_id    │
    │ document_id   │  │ owner_id      │  │ error_code     │
    │ field_name    │  │ operation_type│  │ message        │
    │ field_value   │  │ tokens_used   │  │ level          │
    │ extraction_type│ │ proc_time_ms  │  │ created_at     │
    └───────────────┘  │ timestamp     │  └────────────────┘
                       └───────────────┘

    ┌─────────────────┐
    │ system_config   │
    ├─────────────────┤
    │ key (PK)        │
    │ value           │
    └─────────────────┘
```

### 3.2 Diccionario de datos completo

#### Tabla `users`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único del usuario |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Correo electrónico (usado como login) |
| `hashed_password` | VARCHAR(255) | NOT NULL | Contraseña hasheada con bcrypt (60 caracteres) |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'client' | Rol: 'admin' o 'client' |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha y hora de creación |

**Datos semilla:** Un usuario administrador con email `admin@docupasion.com` y contraseña hasheada de `Admin123456!`.

#### Tabla `repositories`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único del repositorio |
| `name` | VARCHAR(255) | NOT NULL | Nombre descriptivo del repositorio |
| `owner_id` | INT | FK → users.id, NOT NULL | Propietario del repositorio |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de creación |

**Constraintes:** UNIQUE(owner_id, name) — no se permiten repositorios duplicados por usuario.

#### Tabla `categories`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador de la categoría |
| `name` | VARCHAR(100) | UNIQUE, NOT NULL | Nombre de la categoría |
| `description` | TEXT | NULLABLE | Descripción de la categoría |
| `is_default` | BOOLEAN | DEFAULT FALSE | Si es una categoría del sistema (no eliminable) |

**Datos semilla:** 5 categorías predefinidas: académico, técnico, legal, administrativo, general.

#### Tabla `documents`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador único del documento |
| `filename` | VARCHAR(255) | NOT NULL | Nombre del archivo en disco (generado) |
| `original_filename` | VARCHAR(255) | NOT NULL | Nombre original del archivo subido |
| `file_path` | VARCHAR(500) | NOT NULL | Ruta completa del archivo en disco |
| `file_size` | BIGINT | NOT NULL | Tamaño en bytes |
| `mime_type` | VARCHAR(100) | NOT NULL | Tipo MIME (application/pdf, etc.) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'processing' | Estado: 'processing', 'indexed', 'failed' |
| `content_summary` | TEXT | NULLABLE | Resumen ejecutivo generado |
| `extracted_text` | LONGTEXT | NULLABLE | Texto completo extraído del documento |
| `owner_id` | INT | FK → users.id, NOT NULL | Propietario del documento |
| `repository_id` | INT | FK → repositories.id, NOT NULL | Repositorio contenedor |
| `category_id` | INT | FK → categories.id, NULLABLE | Categoría asignada automáticamente |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha de carga |

#### Tabla `document_extractions`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador de la extracción |
| `document_id` | INT | FK → documents.id, NOT NULL | Documento asociado |
| `field_name` | VARCHAR(100) | NOT NULL | Nombre del campo extraído |
| `field_value` | TEXT | NOT NULL | Valor extraído |
| `extraction_type` | VARCHAR(50) | NOT NULL | Tipo de extracción (metadata/content) |

**Relación:** Cada documento puede tener múltiples extracciones (1:N).

#### Tabla `ai_logs`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador del log |
| `document_id` | INT | FK → documents.id, NULLABLE | Documento asociado (NULL para chat) |
| `owner_id` | INT | FK → users.id, NOT NULL | Usuario que realizó la operación |
| `operation_type` | VARCHAR(50) | NOT NULL | Tipo: classification, summarization, extraction, embedding, chat |
| `tokens_used` | INT | DEFAULT 0 | Tokens consumidos (0 en modo demo) |
| `processing_time_ms` | INT | NOT NULL | Tiempo de procesamiento en ms |
| `timestamp` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha/hora de la operación |

#### Tabla `error_logs`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `id` | INT | PK, AUTO_INCREMENT | Identificador del error |
| `document_id` | INT | FK → documents.id, NULLABLE | Documento asociado |
| `error_code` | VARCHAR(50) | NOT NULL | Código del error (EXTRACTION_FAILED, etc.) |
| `message` | TEXT | NOT NULL | Mensaje descriptivo del error |
| `level` | VARCHAR(20) | NOT NULL, DEFAULT 'error' | Severidad: error, warning, info |
| `created_at` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Fecha/hora del error |

#### Tabla `system_config`

| Columna | Tipo | Constraintes | Descripción |
|---|---|---|---|
| `key` | VARCHAR(100) | PK | Nombre del parámetro |
| `value` | TEXT | NOT NULL | Valor del parámetro (JSON o string) |

**Datos semilla:** chunk_size=512, chunk_overlap=64, llm_model=gpt-3.5-turbo.

---

## 4. DISEÑO DE APIs Y SERVICIOS

### 4.1 Especificación de endpoints REST

#### Autenticación (`/api/auth`)

**POST /api/auth/register**
```
Request:
  Content-Type: application/json
  Body: { "email": "string", "password": "string" }

Response 200:
  {
    "id": 2,
    "email": "usuario@correo.com",
    "role": "client",
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
  }

Response 409:
  { "detail": "El correo ya está registrado" }

Response 422:
  { "detail": "La contraseña debe tener mínimo 12 caracteres" }
```

**POST /api/auth/login**
```
Request:
  Content-Type: application/x-www-form-urlencoded
  Body: username=correo@ejemplo.com&password=Contrasena123!

Response 200:
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer"
  }

Response 401:
  { "detail": "Correo o contraseña incorrectos" }
```

**GET /api/auth/me**
```
Request:
  Authorization: Bearer <token>

Response 200:
  {
    "id": 1,
    "email": "admin@docupasion.com",
    "role": "admin",
    "created_at": "2025-01-01T00:00:00"
  }
```

#### Repositorios (`/api/repositories`)

**GET /api/repositories/**
```
Response 200:
  [
    {
      "id": 1,
      "name": "Tesis",
      "owner_id": 1,
      "document_count": 5,
      "created_at": "2025-09-01T10:00:00"
    }
  ]
```

**POST /api/repositories/**
```
Request:
  Content-Type: application/json
  Body: { "name": "Nuevo Repositorio" }

Response 200:
  { "id": 3, "name": "Nuevo Repositorio", "owner_id": 1, "document_count": 0, "created_at": "..." }

Response 400:
  { "detail": "Ya existe un repositorio con ese nombre" }
```

**PATCH /api/repositories/{id}**
```
Request:
  Body: { "name": "Nombre Actualizado" }

Response 200:
  { "id": 3, "name": "Nombre Actualizado", ... }
```

**DELETE /api/repositories/{id}**
```
Response 200:
  { "message": "Repositorio eliminado" }
```

#### Documentos (`/api/documents`)

**POST /api/documents/upload**
```
Request:
  Content-Type: multipart/form-data
  Body:
    file: <archivo PDF/DOCX/TXT>
    repository_id: "1"

Response 200:
  {
    "id": 1,
    "original_filename": "tesis.pdf",
    "file_size": 1048576,
    "mime_type": "application/pdf",
    "status": "indexed",
    "category": "académico",
    "content_summary": "Este documento aborda la implementación de...",
    "extracted_text_preview": "Capítulo 1: Introducción...",
    "repository_id": 1,
    "owner_id": 1,
    "created_at": "2025-09-15T14:30:00"
  }

Response 400:
  { "detail": "Formato no soportado. Use PDF, TXT o DOCX." }
  { "detail": "El archivo supera el tamaño máximo de 50 MB" }
```

**GET /api/documents/**
```
Query params: ?category=académico&status=indexed

Response 200:
  [
    {
      "id": 1,
      "original_filename": "tesis.pdf",
      "file_size": 1048576,
      "mime_type": "application/pdf",
      "status": "indexed",
      "category": "académico",
      "content_summary": "Resumen del documento...",
      "extracted_text_preview": "Primeros 300 caracteres...",
      "created_at": "2025-09-15T14:30:00"
    }
  ]
```

**GET /api/documents/{id}**
```
Response 200:
  {
    "id": 1,
    "original_filename": "tesis.pdf",
    "status": "indexed",
    "category": "académico",
    "content_summary": "Resumen...",
    "extracted_text_preview": "Preview...",
    "extractions": [
      { "field_name": "autor", "field_value": "Juan Perez", "extraction_type": "metadata" },
      { "field_name": "institución", "field_value": "Universidad Nacional", "extraction_type": "metadata" }
    ]
  }
```

**GET /api/documents/{id}/download**
```
Response 200:
  Content-Type: application/pdf (o el MIME correspondiente)
  Body: <archivo binario>
```

**DELETE /api/documents/{id}**
```
Response 200:
  null (204 No Content)
```

**GET /api/documents/stats/summary**
```
Response 200:
  {
    "total_documents": 15,
    "processed": 12,
    "processing": 0,
    "failed": 3,
    "by_status": { "indexed": 12, "processing": 0, "failed": 3 },
    "by_category": { "académico": 5, "técnico": 4, "general": 3 },
    "questions_answered": 28,
    "time_saved_estimate_h": 1.0
  }
```

#### Chat (`/api/chat`)

**POST /api/chat/**
```
Request:
  Body: { "message": "¿Cuál es la metodología utilizada en la tesis?" }

Response 200:
  {
    "query": "¿Cuál es la metodología utilizada en la tesis?",
    "answer": "Respuesta generada desde el repositorio local (modo demo):\n\nFragmento 1: La metodología adoptada en esta investigación...",
    "sources": [
      { "doc_id": 1, "score": 1, "snippet": "La metodología adoptada en esta investigación cualitativa..." }
    ],
    "chunks_retrieved": 1,
    "mode": "demo",
    "response_time_ms": 45
  }
```

**GET /api/chat/search?q=metodología**
```
Response 200:
  {
    "query": "metodología",
    "count": 2,
    "results": [
      { "doc_id": 1, "filename": "tesis.pdf", "snippet": "...la metodología empleada...", "score": 3 }
    ]
  }
```

#### Monitoreo (`/api/monitoring`, solo admin)

**GET /api/monitoring/logs**
```
Response 200:
  {
    "total_errors": 2,
    "by_level": { "error": 1, "warning": 1 },
    "by_code": { "EXTRACTION_FAILED": 1, "CLASSIFICATION_ERROR": 1 },
    "status_counts": { "total": 15, "indexed": 12, "processing": 0, "failed": 3 },
    "recent": [ ... ]
  }
```

**GET /api/monitoring/ai-logs**
```
Response 200:
  [
    { "id": 1, "operation_type": "classification", "tokens_used": 0, "processing_time_ms": 12, "timestamp": "..." },
    { "id": 2, "operation_type": "chat", "tokens_used": 0, "processing_time_ms": 45, "timestamp": "..." }
  ]
```

#### Configuración (`/api/config`, solo admin)

**GET /api/config/**
```
Response 200:
  {
    "chunk_size": 512,
    "chunk_overlap": 64,
    "llm_model": "gpt-3.5-turbo",
    "embedding_model": "text-embedding-3-small"
  }
```

**PUT /api/config/**
```
Request:
  Body: { "chunk_size": 256, "chunk_overlap": 32 }

Response 200:
  { "chunk_size": 256, "chunk_overlap": 32, "llm_model": "gpt-3.5-turbo", ... }
```

---

## 5. FLUJO DE PROCESAMIENTO DOCUMENTAL E INTEGRACIÓN DE IA

### 5.1 Pipeline completo de procesamiento

El pipeline de procesamiento documental es la secuencia de operaciones que transforma un archivo subido por el usuario en información estructurada, clasificada, resumida y consultable. A continuación se describe cada etapa con detalle algorítmico:

#### Etapa 1: Recepción y validación

1. El endpoint `POST /api/documents/upload` recibe un multipart/form-data con campos `file` y `repository_id`.
2. Se valida que el repositorio pertenezca al usuario autenticado (owner_id check).
3. Se valida la extensión del archivo: solo `.pdf`, `.docx`, `.txt`.
4. Se valida el tamaño: máximo 52,428,800 bytes (50 MB).
5. Se genera un nombre de archivo único: `{uuid4()}.{ext}`.
6. Se almacena el archivo en disco (`uploads/`) o en IndexedDB (modo cliente).
7. Se crea el registro del documento en la tabla `documents` con estado `processing`.

#### Etapa 2: Extracción de texto

La extracción varía según el formato del archivo:

**PDF (PyPDF2 / pdf.js):**
```
Backend (PyPDF2):
  reader = PyPDF2.PdfReader(file_path)
  text = ""
  for page in reader.pages:
      text += page.extract_text() + "\n"

Frontend (pdf.js):
  pdfjsLib.getDocument(arrayBuffer).promise.then(pdf => {
      for (let i = 1; i <= pdf.numPages; i++) {
          pdf.getPage(i).then(page => {
              page.getTextContent().then(content => {
                  text += content.items.map(item => item.str).join(' ');
              });
          });
      }
  });
```

**DOCX (python-docx / mammoth.js):**
```
Backend (python-docx):
  doc = docx.Document(file_path)
  text = "\n".join([para.text for para in doc.paragraphs])

Frontend (mammoth.js):
  mammoth.extractRawText({ arrayBuffer }).then(result => {
      text = result.value;
  });
```

**TXT (FileReader nativo):**
```
Backend:
  with open(file_path, 'r', encoding='utf-8') as f:
      text = f.read()

Frontend:
  reader = new FileReader();
  reader.onload = () => { text = reader.result; };
  reader.readAsText(blob);
```

#### Etapa 3: Clasificación automática

La clasificación se realiza mediante un algoritmo de conteo de palabras clave (keyword matching) con normalización de acentos:

```
Diccionario de categorías:
  académico: ['tesis', 'investigación', 'universidad', 'metodología', 'hipótesis',
              'bibliografía', 'abstract', 'conclusión', '.references', 'director',
              'institución', 'académico', 'ensayo', 'análisis']
  técnico:   ['requisitos', 'arquitectura', 'tecnologías', 'stack', 'framework',
              'base de datos', 'despliegue', 'api', 'endpoints', 'backend',
              'frontend', 'diseño']
  legal:     ['partes', 'firmante', 'contrato', 'cláusula', 'vigencia',
              'jurisdicción', 'obligaciones', 'ley', 'legal', 'demanda']
  administrativo: ['comité', 'asistentes', 'acuerdos', 'compromisos', 'fecha',
                   'presupuesto', 'responsable', 'plazo', 'acta', 'reunión']

Algoritmo:
  1. Normalizar texto: toLowerCase() + NFD (quitar tildes)
  2. Para cada categoría, contar coincidencias de keywords en el texto
  3. Seleccionar la categoría con mayor puntuación
  4. Si la mejor puntuación > 2: asignar esa categoría
  5. Si no: asignar "general"
```

#### Etapa 4: Generación de resumen

El resumen se genera extrayendo las primeras N oraciones del texto (por defecto 3), con un límite máximo de 500 caracteres:

```
Algoritmo:
  1. Dividir el texto extraído en oraciones (delimitadas por . ? !)
  2. Seleccionar las primeras 3 oraciones no vacías
  3. Unir con espacio
  4. Si excede 500 caracteres, truncar en el último espacio completo antes de 500
  5. Almacenar en content_summary del documento
```

#### Etapa 5: Extracción de campos estructurados

La extracción varía según la categoría del documento:

```
Académico:
  autor → buscar "autor:", "author:", línea que contiene nombre propio al inicio
  institución → buscar "universidad", "instituto", "facultad"
  palabras clave → buscar "palabras clave:", "keywords:", extraer lista
  fecha → buscar patrón YYYY o MM/YYYY

Técnico:
  stack → buscar "stack", "tecnologías", listar tecnologías mencionadas
  arquitectura → buscar "arquitectura", "patrón", "diseño"
  base de datos → buscar "base de datos", "mysql", "postgresql", "mongodb"
  despliegue → buscar "despliegue", "deploy", "docker", "cloud"

Legal:
  partes → buscar "partes:", "entre:", extraer nombres
  firmante → buscar "firmado por", "representante"
  jurisdicción → buscar "jurisdicción", "ley aplicable", "tribunal"

Administrativo:
  responsable → buscar "responsable:", "encargado:"
  plazo → buscar "plazo", "fecha límite", "deadline"
  presupuesto → buscar "presupuesto", "$", "costo", "inversión"
```

#### Etapa 6: Generación de embeddings

```
Modo demo (sin API key):
  1. Tomar el texto extraído (máximo 8000 caracteres)
  2. Dividir en chunks de chunk_size (512) con overlap (64)
  3. Para cada chunk, generar un hash determinístico (SHA-256 truncado a 1536 dimensiones)
  4. El hash se normaliza a valores float entre -1 y 1
  5. Los embeddings se almacenan junto con el documento

Modo IA (con API key):
  1. Enviar el texto a OpenAI API (text-embedding-3-small)
  2. Recibir vector de 1536 dimensiones
  3. Almacenar el vector con el documento
```

#### Etapa 7: Búsqueda RAG (Retrieval-Augmented Generation)

```
Flujo de consulta del chat:
  1. Recibir pregunta del usuario
  2. Normalizar: lowercase + quitar acentos (NFD)
  3. Buscar coincidencias de keywords en textos extraídos de documentos del usuario
  4. Para cada coincidencia, generar fragmento de contexto (100 chars antes + 300 después)
  5. Calcular puntuación de relevancia (número de coincidencias)
  6. Ordenar por puntuación descendente, tomar top 5
  7. Modo demo: concatenar fragmentos como respuesta
  8. Modo IA: enviar fragmentos como contexto a GPT-3.5/4 con prompt de instrucción
  9. Registrar operación en ai_logs
  10. Retornar respuesta, fuentes y métricas
```

---

## 6. DECISIONES TECNOLÓGICAS Y JUSTIFICACIÓN

### 6.1 Frontend

| Tecnología | Versión | Justificación |
|---|---|---|
| JavaScript vanilla | ES2020+ | Eliminación de dependencias de frameworks. El proyecto debe funcionar abriendo index.html directamente sin proceso de compilación. |
| pdf.js | 3.11.174 | Librería estándar de Mozilla para renderizado de PDF en el navegador. Soporte completo de extracción de texto y visualización. |
| mammoth.js | 1.8.0 | Librería ligera para conversión de DOCX a HTML/texto. Alternativa a document-converter que funciona sin servidor. |
| Lucide Icons | latest | Iconografía vectorial ligera (reemplaza Font Awesome). Tamaño reducido, diseño consistente. |
| CSS Variables | native | Sistema de temas sin preprocesadores. Facilita la personalización y el modo oscuro futuro. |
| Service Worker API | W3C | Estándar para caché offline. Soportado por Chrome, Firefox, Edge, Safari. |

### 6.2 Backend

| Tecnología | Versión | Justificación |
|---|---|---|
| Python | ≥3.10 | Lenguaje con mayor ecosistema de IA/ML. Facilidad de lectura y mantenibilidad. |
| FastAPI | 0.115.6 | Framework async de alto rendimiento. Validación automática con Pydantic. Documentación OpenAPI generada automáticamente. |
| SQLAlchemy | 2.0.36 | ORM maduro con soporte para múltiples BD. Migration-friendly. Patrón de session factory. |
| Pydantic | 2.10.4 | Validación de datos con tipos nativos de Python. Serialización automática. Integración nativa con FastAPI. |
| bcrypt | 4.0.1 | Hash de contraseñas con 12 rondas de costo. Estándar de la industria. Eliminación de passlib (incompatible). |
| python-jose | 3.3.0 | JWT encode/decode con soporte HS256. Lightweight, sin dependencias pesadas. |
| PyPDF2 | 3.0.1 | Extracción de texto de PDFs. Comunidad amplia, soporte de encriptación básica. |
| python-docx | 1.1.2 | Extracción de texto de DOCX. Manipulación de párrafos y tablas. |
| OpenAI SDK | 1.58.1 | Cliente oficial para embeddings y chat completions. Fallback local si no hay API key. |
| PyMySQL | 1.1.1 | Driver puro Python para MySQL. Sin compilación nativa necesaria. |
| uvicorn | 0.32.1 | Servidor ASGI de alto rendimiento. Hot-reload para desarrollo. |

### 6.3 Base de datos

| Opción | Cuándo se usa | Justificación |
|---|---|---|
| MySQL | Producción (si disponible) | RDBMS maduro, ACID, soporte completo de concurrencía, escalabilidad horizontal. |
| SQLite | Fallback automático | Sin configuración necesaria. Archivo único. Ideal para desarrollo y demostraciones. |
| localStorage | Modo cliente | Almacenamiento nativo del navegador. Persiste datos sin servidor. ~5MB. |
| IndexedDB | Modo cliente (archivos) | Almacenamiento asincrónico del navegador. Capacidad ilimitada. Soporta blobs. |

### 6.4 Decisiones de IA

| Componente | Modo demo | Modo IA (con API key) |
|---|---|---|
| Clasificación | Keywords + umbral | Mismo algoritmo (no se usa LLM para clasificación) |
| Resumen | Primeras N oraciones | Mismo algoritmo + opción de LLM para refinamiento |
| Extracción de campos | Regex + keywords | Mismo algoritmo + opción de LLM para campos complejos |
| Embeddings | Hash determinístico local | OpenAI text-embedding-3-small (1536 dims) |
| Chat/RAG | Búsqueda por keywords + concatenación | RAG completo: embeddings + similitud coseno + GPT-3.5/4 |

---

## 7. DISEÑO DE SEGURIDAD Y PROTOTIPOS

### 7.1 Mecanismos de autenticación

```
Flujo de autenticación:
  1. Usuario envía credenciales (email + password)
  2. Backend busca usuario por email en la BD
  3. Backend verifica password contra hash bcrypt:
     bcrypt.checkpw(password.encode(), hashed_password.encode())
  4. Si coincide, genera JWT:
     payload = { "sub": user.id, "email": user.email, "role": user.role,
                 "exp": datetime.utcnow() + timedelta(hours=24) }
     token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
  5. Retorna token al frontend
  6. Frontend almacena en localStorage (clave: "dp_token")
  7. Cada solicitud subsiguiente incluye: Authorization: Bearer <token>
  8. Backend decodifica JWT y verifica expiración en cada request
```

### 7.2 Hash de contraseñas

```
Almacenamiento:
  password = "Admin123456!"
  hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt(rounds=12))
  # Resultado: $2b$12$LJ3m4ys3Lg.Ky8Gfv.8eZ.HvQ4y8x7Xv3V8Xv3V8Xv3V8Xv3V8Xv

Verificación:
  stored_hash = "$2b$12$LJ3m4ys3Lg.Ky8Gfv.8eZ..."
  is_valid = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
  # True si la contraseña coincide

Nota de seguridad: bcrypt tiene un límite de 72 bytes por contraseña.
El sistema valida que la contraseña no exceda este límite y
rechaza contraseñas menores a 12 caracteres.
```

### 7.3 Variables de entorno

```
# backend/.env
DATABASE_URL=mysql+pymysql://docupasion:DocuPasion2024!@127.0.0.1:3306/docupasion
SECRET_KEY=docupasion-secret-key-2025-cambiar-en-produccion
OPENAI_API_KEY=                    # Vacío = modo demo
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-3.5-turbo
CHUNK_SIZE=512
CHUNK_OVERLAP=64
CORS_ORIGINS=                      # Vacío = solo localhost
```

### 7.4 Prototipos de interfaces principales

#### Login / Registro
```
┌─────────────────────────────────────────┐
│           DOCUPASION                    │
│     Sistema de Gestión Documental       │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  Correo electrónico               │  │
│  │  usuario@ejemplo.com              │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Contraseña (mín. 12 caracteres)  │  │
│  │  ••••••••••••                     │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │         INICIAR SESIÓN            │  │
│  └───────────────────────────────────┘  │
│  ¿No tienes cuenta? Regístrate aquí    │
└─────────────────────────────────────────┘
```

#### Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  DOCUPASION  │  Repositorios  │  Documentos  │  Chat IA  │  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ Total   │  │Procesado│  │ Fallidos│  │ Tiempo  │       │
│  │   15    │  │   12    │  │    3    │  │  1.0 h  │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Por Categoría       │  │  Por Estado          │        │
│  │  Académico: 5  ████  │  │  Indexed: 12  ██████│        │
│  │  Técnico: 4   ███   │  │  Failed: 3   ██     │        │
│  │  General: 3   ██    │  │                      │        │
│  │  Legal: 2     █     │  │                      │        │
│  │  Admin: 1     █     │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

#### Visor de documento
```
┌──────────────────────────────────────────────────────────────┐
│  ← Volver  │  tesis_juan_perez.pdf  │  Descargar  │ Eliminar│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Categoría: Académico  │  Estado: Indexed            │   │
│  │  Tamaño: 2.4 MB  │  Cargado: 15/09/2025             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  RESUMEN EJECUTIVO                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Este documento aborda la implementación de un       │   │
│  │  sistema de gestión documental con IA, utilizando     │   │
│  │  técnicas de RAG para la recuperación de información. │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  CAMPOS EXTRAÍDOS                                            │
│  ┌──────────────────────┬────────────────────────────┐     │
│  │ Autor                │ Juan Perez                  │     │
│  │ Institución          │ Universidad Nacional        │     │
│  │ Palabras clave       │ IA, gestión documental, RAG │     │
│  └──────────────────────┴────────────────────────────┘     │
│                                                              │
│  VISOR PDF                                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  [PDF renderizado con pdf.js]                        │   │
│  │  ← Página 1 de 45 →    Zoom: [100%]                │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

#### Chat IA
```
┌──────────────────────────────────────────────────────────────┐
│  CHAT INTELIGENTE                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tú: ¿Cuál es la metodología utilizada en la tesis?  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DocuPasion: La metodología adoptada es cualitativa, │   │
│  │  basada en entrevistas semiestructuradas con 15       │   │
│  │  participantes del área de tecnología educativa.      │   │
│  │                                                       │   │
│  │  Fuentes: tesis_juan_perez.pdf (relevancia: 3)       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────┐  ┌──────┐    │
│  │  Escribe tu pregunta...                  │  │Enviar│    │
│  └──────────────────────────────────────────┘  └──────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

**FIN DEL DOCUMENTO DE DISEÑO — FASE 02**
