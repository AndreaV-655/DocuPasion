# FASE 05 — IMPLEMENTACIÓN, DESPLIEGUE Y MANUALES

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Proyecto Integrador — Tecnología en Desarrollo de Software, VI Semestre**
**Universidad UTS**

| Campo | Valor |
|---|---|
| Fase | 05 — Implementación |
| Versión del documento | 2.0 |
| Fecha de elaboración | Septiembre 2025 |
| Autor(es) | Estudiantes VI Semestre — UTS |
| Revisor | Director del Proyecto Integrador |

---

## 1. AMBIENTE DE IMPLEMENTACIÓN Y DESPLIEGUE

### 1.1 Arquitectura de despliegue

El sistema DocuPasion soporta dos modalidades de despliegue que coexisten y ofrecen flexibilidad según las necesidades del entorno:

**Modalidad A — Despliegue standalone (recomendada para demostraciones):**
No requiere servidor, base de datos ni conexión a internet. El usuario ejecuta directamente el archivo `frontend/index.html` en su navegador web. Todos los datos se almacenan en localStorage (datos estructurados) e IndexedDB (archivos binarios) del navegador. Esta modalidad es ideal para presentaciones académicas, demos presenciales y entornos sin infraestructura de servidores.

**Modalidad B — Despliegue con servidor (recomendada para producción):**
Requiere Python 3.10+ ejecutando un servidor FastAPI con uvicorn. Los datos se almacenan en MySQL (producción) o SQLite (desarrollo/fallback). Los archivos se almacenan en disco en el directorio `uploads/`. Esta modalidad soporta múltiples usuarios simultáneos, persistencia de datos en servidor y configuración de IA con API keys.

### 1.2 Infraestructura requerida

| Recurso | Modalidad A (Standalone) | Modalidad B (Servidor) |
|---|---|---|
| Sistema operativo | Cualquier SO con navegador web | Windows 10+, Linux, macOS |
| Navegador | Chrome 90+, Firefox 88+, Edge 90+ | Igual que Modalidad A |
| Python | No requerido | ≥3.10 |
| MySQL | No requerido | ≥8.0 (XAMPP recomendado) |
| RAM | Mínimo 2 GB (navegador) | Mínimo 4 GB (servidor + BD) |
| Disco | Mínimo 100 MB (assets de la app) | Mínimo 500 MB (app + uploads + BD) |
| Conexión a internet | Solo primera carga (después funciona offline) | Requerida para OpenAI API (opcional) |
| Puertos | Ninguno | 8000 (uvicorn), 3306 (MySQL) |

### 1.3 Variables de entorno de producción

```env
# backend/.env (PRODUCCIÓN)
DATABASE_URL=mysql+pymysql://docupasion:PASSWORD_SEGURO@localhost:3306/docupasion
SECRET_KEY=<generar_con_python_-c_"import_secrets;print(secrets.token_hex(32))">
OPENAI_API_KEY=sk-<tu-clave-aqui>
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
CHUNK_SIZE=512
CHUNK_OVERLAP=64
CORS_ORIGINS=https://tudominio.com
```

### 1.4 Configuración de servicios de IA

**OpenAI API (opcional):**
1. Crear cuenta en https://platform.openai.com
2. Generar API key en https://platform.openai.com/api-keys
3. Agregar la key al archivo `.env` como `OPENAI_API_KEY=sk-...`
4. Configurar `LLM_MODEL` (gpt-3.5-turbo o gpt-4o-mini) y `EMBEDDING_MODEL` (text-embedding-3-small)
5. Los costos estimados por documento son: ~$0.002 por clasificación + resumen + embeddings (gpt-4o-mini)

**Modo demo (sin API key):**
Si `OPENAI_API_KEY` está vacío o no configurado, el sistema opera automáticamente en modo demo:
- Clasificación por keywords (sin LLM)
- Resumen por selección de oraciones (sin LLM)
- Extracción de campos por regex (sin LLM)
- Embeddings por hash determinístico (sin API)
- Chat por concatenación de fragmentos (sin LLM)

### 1.5 Gestión segura de secretos de producción

```bash
# 1. NUNCA commitear el archivo .env al repositorio
echo ".env" >> .gitignore

# 2. Generar SECRET_KEY aleatorio
python -c "import secrets; print(secrets.token_hex(32))"
# Copiar el resultado al .env

# 3. Usar variables de entorno del sistema en producción (alternativa)
export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export OPENAI_API_KEY=sk-...

# 4. En Docker/Kubernetes, usar secrets management
# docker secret create db_password db_password.txt
# docker service create --secret db_password ...
```

### 1.6 Script de despliegue automático (`start_server.bat`)

```batch
@echo off
echo ===================================
echo   DocuPasion - Servidor Local
echo ===================================

:: Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no encontrado.
    echo Descarga desde https://python.org y marca "Add Python to PATH"
    pause
    exit /b 1
)

:: Crear entorno virtual si no existe
if not exist "venv" (
    echo Creando entorno virtual...
    python -m venv venv
)

:: Activar entorno virtual
call venv\Scripts\activate

:: Instalar dependencias
echo Instalando dependencias...
pip install -r requirements.txt --quiet

:: Verificar MySQL
python -c "import pymysql; pymysql.connect(host='127.0.0.1', port=3306, user='root', password='')" >nul 2>&1
if %errorlevel% equ 0 (
    echo MySQL detectado - usando MySQL
) else (
    echo MySQL no encontrado - usando SQLite (datos en docupasion.db)
)

:: Iniciar servidor
echo.
echo Iniciando servidor en http://localhost:8000
echo Presiona Ctrl+C para detener
echo.
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause
```

---

## 2. MANUAL DE USUARIO

### 2.1 Bienvenida a DocuPasion

DocuPasion es un sistema inteligente de gestión documental que le permite:

- **Organizar** sus documentos en repositorios temáticos.
- **Subir** archivos PDF, DOCX y TXT con procesamiento automático.
- **Clasificar** documentos en categorías (académico, técnico, legal, administrativo).
- **Obtener resúmenes** ejecutivos de cada documento.
- **Extraer** campos relevantes (autor, institución, fechas, etc.).
- **Buscar** documentos por palabras clave en su contenido.
- **Preguntar** en lenguaje natural sobre el contenido de sus documentos.

### 2.2 Primeros pasos

#### Acceso al sistema

1. Abra el archivo `frontend/index.html` en su navegador web (doble clic).
2. Se mostrará la pantalla de inicio de sesión.
3. Ingrese las credenciales:
   - **Email:** `admin@docupasion.com`
   - **Contraseña:** `Admin123456!`
4. Haga clic en **"Iniciar sesión"**.
5. Será redirigido al panel principal (Dashboard).

> **Nota:** Si es la primera vez que accede, el sistema crea automáticamente el usuario administrador y las categorías predefinidas.

#### Crear su primer repositorio

1. En el menú lateral, haga clic en **"Repositorios"**.
2. Haga clic en **"Nuevo repositorio"**.
3. Ingrese un nombre descriptivo (ej: "Mis Tesis", "Contratos 2025", "Documentos Técnicos").
4. Haga clic en **"Crear"**.
5. El repositorio aparecerá en la lista con contador de documentos en 0.

#### Subir su primer documento

1. Haga clic en el repositorio que creó.
2. Arrastre un archivo (PDF, DOCX o TXT) sobre el área de carga, o haga clic en **"Seleccionar archivo"**.
3. Espere a que se complete la barra de progreso.
4. El sistema procesará automáticamente el documento:
   - Extraerá el texto contenido.
   - Lo clasificará en una categoría.
   - Generará un resumen ejecutivo.
   - Extraerá campos relevantes.
5. El documento aparecerá en la lista con estado **"Indexed"** (procesado exitosamente).

### 2.3 Consultar la información de un documento

1. En la lista de documentos, haga clic en el nombre del documento que desea consultar.
2. Se abrirá una vista detallada que muestra:
   - **Categoría asignada** (académico, técnico, legal, administrativo o general).
   - **Estado** (indexed = procesado, failed = error).
   - **Resumen ejecutivo** (síntesis del contenido).
   - **Campos extraídos** (autor, institución, palabras clave, fechas, etc.).
   - **Vista previa** del texto extraído.
   - **Visor de PDF** (si el documento es un PDF).

### 2.4 Buscar documentos

1. En la barra de búsqueda (parte superior), ingrese una o más palabras clave.
2. Presione **Enter** o haga clic en el ícono de búsqueda.
3. El sistema mostrará los documentos que contengan esas palabras en su contenido.
4. Cada resultado incluye:
   - Nombre del documento.
   - Fragmento de contexto resaltado.
   - Puntuación de relevancia.

### 2.5 Usar el chat inteligente

1. En el menú lateral, haga clic en **"Chat IA"**.
2. Escriba una pregunta en lenguaje natural, por ejemplo:
   - "¿Cuál es la metodología de la tesis?"
   - "¿Qué presupuesto menciona el contrato?"
   - "¿Cuáles son los requisitos del sistema?"
3. Haga clic en **"Enviar"**.
4. El sistema responderá con la información encontrada en sus documentos.
5. Se mostrarán las **fuentes** consultadas (nombre del documento y fragmento relevante).

### 2.6 Visualizar el dashboard

1. En el menú lateral, haga clic en **"Dashboard"**.
2. El panel muestra:
   - **Total de documentos** cargados.
   - **Documentos procesados** exitosamente.
   - **Documentos fallidos** (con errores de procesamiento).
   - **Distribución por categoría** (gráfico de barras).
   - **Tiempo estimado ahorrado** por la automatización.
   - **Preguntas respondidas** por el chat.

### 2.7 Gestionar repositorios

| Acción | Cómo hacerlo |
|---|---|
| **Crear repositorio** | Repositorios → "Nuevo repositorio" → Ingrese nombre → "Crear" |
| **Renombrar repositorio** | Repositorios → Clic en ícono de editar → Ingrese nuevo nombre → "Guardar" |
| **Eliminar repositorio** | Repositorios → Clic en ícono de eliminar → Confirme → "Eliminar" (debe vaciar los documentos primero) |

### 2.8 Gestionar documentos

| Acción | Cómo hacerlo |
|---|---|
| **Subir documento** | Repositorio → Arrastre archivo o seleccione → Espere procesamiento |
| **Ver detalle** | Lista de documentos → Clic en nombre del documento |
| **Descargar original** | Detalle del documento → Clic en "Descargar" |
| **Eliminar documento** | Detalle del documento → Clic en "Eliminar" → Confirme |
| **Filtrar por categoría** | Lista de documentos → Seleccione categoría en filtro |
| **Filtrar por estado** | Lista de documentos → Seleccione estado en filtro |

### 2.9 Formatos soportados

| Formato | Extensión | Tamaño máximo | Notas |
|---|---|---|---|
| PDF | `.pdf` | 50 MB | Extracción de texto digital (no escaneado) |
| Microsoft Word | `.docx` | 50 MB | Solo formato .docx (no .doc antiguo) |
| Texto plano | `.txt` | 50 MB | Codificación UTF-8 recomendada |

> **Importante:** No se aceptan archivos de imagen (JPG, PNG), hojas de cálculo (XLSX), presentaciones (PPTX) ni archivos comprimidos (ZIP).

---

## 3. MANUAL DE ADMINISTRACIÓN Y SOPORTE

### 3.1 Gestión de usuarios

**Acceso de administrador:**
- Login con `admin@docupasion.com` / `Admin123456!`
- El rol "admin" tiene acceso irrestricto a todas las funcionalidades.

**Crear un usuario cliente:**
1. El usuario se registra desde la pantalla de registro con su email y contraseña.
2. El sistema crea automáticamente el usuario con rol "client".

**Modificar el rol de un usuario (solo BD):**
```sql
-- Conectar a la base de datos
USE docupasion;

-- Promover un usuario a administrador
UPDATE users SET role = 'admin' WHERE email = 'usuario@correo.com';

-- Revocar privilegios de administrador
UPDATE users SET role = 'client' WHERE email = 'usuario@correo.com';
```

### 3.2 Monitoreo de logs de errores

1. Inicie sesión como administrador.
2. En el menú lateral, haga clic en **"Monitoreo"**.
3. El panel muestra:
   - **Total de errores** registrados.
   - **Distribución por nivel** (error, warning, info).
   - **Distribución por código** de error.
   - **Logs recientes** con timestamp, mensaje y documento asociado.

**Códigos de error comunes:**

| Código | Significado | Acción recomendada |
|---|---|---|
| `EXTRACTION_FAILED` | Error al extraer texto del archivo | Verificar que el PDF no sea una imagen escaneada |
| `CLASSIFICATION_ERROR` | Error en el algoritmo de clasificación | Revisar logs del servidor; el documento se clasifica como "general" |
| `UNSUPPORTED_FORMAT` | Formato de archivo no aceptado | Convertir a PDF, DOCX o TXT |
| `FILE_TOO_LARGE` | Archivo excede 50 MB | Comprimir o dividir el archivo |

### 3.3 Configuración del sistema

**Acceder a la configuración:**
1. Inicie sesión como administrador.
2. En el menú lateral, haga clic en **"Configuración"**.
3. Modifique los parámetros disponibles:

| Parámetro | Descripción | Valor por defecto | Rango recomendado |
|---|---|---|---|
| `chunk_size` | Tamaño de los fragmentos para búsqueda RAG | 512 | 256 - 1024 |
| `chunk_overlap` | Superposición entre fragmentos | 64 | 32 - 128 |
| `llm_model` | Modelo de lenguaje para chat (con API key) | gpt-4o-mini | gpt-3.5-turbo, gpt-4o |
| `embedding_model` | Modelo de embeddings (con API key) | text-embedding-3-small | text-embedding-3-large |

### 3.4 Mantenimiento de la base de datos

#### Modo MySQL (producción)

```sql
-- Verificar integridad de tablas
CHECK TABLE users, repositories, documents, categories, document_extractions, ai_logs, error_logs;

-- Limpiar logs antiguos (más de 90 días)
DELETE FROM ai_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM error_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Optimizar tablas
OPTIMIZE TABLE documents, ai_logs, error_logs;

-- Verificar espacio en disco
SELECT table_name, round(data_length/1024/1024, 2) AS 'Data (MB)',
       round(index_length/1024/1024, 2) AS 'Index (MB)'
FROM information_schema.tables
WHERE table_schema = 'docupasion';
```

#### Modo SQLite (desarrollo)

```bash
# Verificar integridad
sqlite3 docupasion.db "PRAGMA integrity_check;"

# Crear respaldo
cp docupasion.db docupasion_backup_$(date +%Y%m%d).db

# Compactar base de datos
sqlite3 docupasion.db "VACUUM;"
```

### 3.5 Gestión de archivos

**Ubicación de archivos subidos:**
- Backend: `backend/uploads/` (archivos en disco con nombres UUID)
- Frontend: IndexedDB en el navegador (store `blobs`)

**Liberar espacio en disco (backend):**
```bash
# Verificar tamaño del directorio uploads
du -sh backend/uploads/

# Eliminar archivos huérfanos (documentos eliminados pero archivos no)
# Primero identificar archivos referenciados en la BD:
python -c "
import os, pymysql
conn = pymysql.connect(host='localhost', user='root', password='', database='docupasion')
cursor = conn.cursor()
cursor.execute('SELECT filename FROM documents')
db_files = {row[0] for row in cursor.fetchall()}
disk_files = set(os.listdir('backend/uploads/'))
orphans = disk_files - db_files
print(f'Archivos en disco: {len(disk_files)}')
print(f'Archivos en BD: {len(db_files)}')
print(f'Archivos huérfanos: {len(orphans)}')
for f in orphans:
    os.remove(f'backend/uploads/{f}')
    print(f'Eliminado: {f}')
"
```

### 3.6 Control de accesos

| Nivel | Descripción | Cómo se gestiona |
|---|---|---|
| **Admin** | Acceso total: configuración, monitoreo, todos los documentos | Rol `admin` en tabla `users` |
| **Client** | Acceso a sus propios repositorios y documentos | Rol `client` en tabla `users` |
| **No autenticado** | Solo puede registrar cuenta o iniciar sesión | Sin token JWT |

**Revisión de permisos periódica:**
```sql
-- Listar todos los usuarios y sus roles
SELECT id, email, role, created_at FROM users ORDER BY role, email;

-- Contar documentos por usuario
SELECT u.email, u.role, COUNT(d.id) AS documents
FROM users u LEFT JOIN documents d ON u.id = d.owner_id
GROUP BY u.id ORDER BY documents DESC;
```

---

## 4. ESTRATEGIA DE RESPALDO Y RECUPERACIÓN (BACKUP & RECOVERY)

### 4.1 Políticas de respaldo

| Componente | Frecuencia | Método | Retención |
|---|---|---|---|
| Base de datos MySQL | Diario | `mysqldump` programado | 30 días |
| Archivos subidos (`uploads/`) | Semanal | Copia de directorio | 90 días |
| Base de datos SQLite | Diario | Copia del archivo `.db` | 30 días |
| Código fuente | Continuo | Git + GitHub | Indefinido |
| Configuración (`.env`) | Manual | Copia segura | Indefinido |

### 4.2 Procedimiento de respaldo MySQL

```bash
# Respaldo completo de la base de datos
mysqldump -u docupasion -p docupasion > backup_docupasion_$(date +%Y%m%d_%H%M%S).sql

# Respaldo comprimido
mysqldump -u docupasion -p docupasion | gzip > backup_docupasion_$(date +%Y%m%d).sql.gz

# Respaldo programado con cron (Linux) o Task Scheduler (Windows)
# Agregar al crontab:
0 2 * * * mysqldump -u docupasion -p"DocuPasion2024!" docupasion | gzip > /backups/docupasion_$(date +\%Y\%m\%d).sql.gz
```

### 4.3 Procedimiento de restauración MySQL

```bash
# Restaurar desde respaldo SQL
mysql -u docupasion -p docupasion < backup_docupasion_20250915.sql

# Restaurar desde respaldo comprimido
gunzip < backup_docupasion_20250915.sql.gz | mysql -u docupasion -p docupasion
```

### 4.4 Procedimiento de respaldo SQLite

```bash
# Copiar el archivo de base de datos
cp backend/docupasion.db backups/docupasion_$(date +%Y%m%d).db

# Respaldo programado (Windows Task Scheduler)
schtasks /create /tn "DocuPasion Backup" /tr "copy C:\path\to\docupasion.db C:\backups\docupasion_%date:~0,4%%date:~5,2%%date:~8,2%.db" /sc daily /st 02:00
```

### 4.5 Procedimiento de recuperación ante desastres

**Escenario 1: Corrupción de la base de datos**
1. Detener el servidor.
2. Restaurar la BD desde el respaldo más reciente: `mysql -u docupasion -p docupasion < backup.sql`
3. Verificar integridad: `CHECK TABLE ...`
4. Reiniciar el servidor.

**Escenario 2: Pérdida de archivos subidos**
1. Restaurar el directorio `uploads/` desde el respaldo semanal.
2. Los documentos cuyos archivos se perdieron mostrarán estado "failed" en la interfaz.
3. Los usuarios pueden re-subir los documentos afectados.

**Escenario 3: Pérdida total del servidor**
1. Instalar Python y dependencias en un nuevo servidor.
2. Restaurar la BD desde el respaldo en la nube o dispositivo externo.
3. Restaurar el directorio `uploads/`.
4. Configurar las variables de entorno.
5. Iniciar el servidor.

**Escenario 4: Pérdida de datos en modo cliente (localStorage)**
1. Los datos en localStorage del navegador se pierden si el usuario limpia los datos de navegación o cambia de navegador.
2. No hay forma de recuperarlos (no hay servidor).
3. **Recomendación:** Usar el modo servidor para datos críticos, o exportar periódicamente los datos desde la interfaz (función de exportación a implementar en futuras versiones).

### 4.6 Plan de recuperación (RTO/RPO)

| Métrica | Objetivo | Estrategia |
|---|---|---|
| **RTO** (Recovery Time Objective) | < 30 minutos | Scripts de restauración automatizados, infraestructura de respaldo |
| **RPO** (Recovery Point Objective) | < 24 horas | Respaldos diarios de la BD, respaldos semanales de archivos |

---

**FIN DEL DOCUMENTO DE IMPLEMENTACIÓN — FASE 05**
