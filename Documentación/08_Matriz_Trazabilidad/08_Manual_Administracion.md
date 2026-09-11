# Manual de Administración y Soporte

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Versión:** 2.0
**Fecha:** Septiembre 2025
**Universidad UTS — Tecnología en Desarrollo de Software**

---

## 1. Introducción

Este manual está dirigido a los administradores del sistema DocuPasion. Proporciona las instrucciones necesarias para administrar usuarios, monitorear el rendimiento del sistema, diagnosticar problemas, gestionar la base de datos, realizar respaldos y garantizar la disponibilidad continua del servicio.

El administrador del sistema tiene acceso irrestricto a todas las funcionalidades, incluyendo la configuración del sistema, los logs de monitoreo y los documentos de todos los usuarios.

### 1.1 Responsabilidades del administrador

- Gestionar cuentas de usuario (creación, modificación de roles, eliminación).
- Monitorear el estado del sistema y los logs de errores.
- Configurar parámetros del motor de IA (modelos, chunk_size, chunk_overlap).
- Realizar respaldos periódicos de la base de datos y los archivos.
- Diagnosticar y resolver problemas reportados por los usuarios.
- Mantener la documentación actualizada.
- Garantizar la seguridad del sistema y la protección de datos.

---

## 2. Gestión de Usuarios

### 2.1 Roles del sistema

| Rol | Descripción | Permisos |
|---|---|---|
| **admin** | Administrador del sistema | Acceso total: configuración, monitoreo, todos los documentos, gestión de usuarios |
| **client** | Usuario estándar | Acceso solo a sus propios repositorios y documentos |

### 2.2 Crear un usuario nuevo

Los usuarios se crean desde la interfaz de registro:

1. El usuario accede a la pantalla de registro.
2. Ingresa su correo electrónico y contraseña.
3. El sistema crea automáticamente el usuario con rol "client".
4. No se requiere intervención del administrador.

### 2.3 Promover un usuario a administrador

La promoción de un usuario a administrador solo se puede realizar desde la base de datos:

```sql
-- Conectar a la base de datos
USE docupasion;

-- Promover un usuario a administrador
UPDATE users SET role = 'admin' WHERE email = 'usuario@correo.com';

-- Verificar el cambio
SELECT id, email, role FROM users WHERE email = 'usuario@correo.com';
```

### 2.4 Revocar privilegios de administrador

```sql
-- Revocar privilegios de administrador
UPDATE users SET role = 'client' WHERE email = 'admin@example.com';

-- Nunca revocar sus propios privilegios
-- Verificar antes de ejecutar
SELECT id, email, role FROM users WHERE role = 'admin';
```

### 2.5 Listar todos los usuarios

```sql
SELECT id, email, role, created_at
FROM users
ORDER BY role, email;
```

### 2.6 Contar documentos por usuario

```sql
SELECT u.email, u.role, COUNT(d.id) AS total_documentos
FROM users u
LEFT JOIN documents d ON u.id = d.owner_id
GROUP BY u.id
ORDER BY total_documentos DESC;
```

### 2.7 Eliminar un usuario

> **Precaución:** La eliminación de un usuario elimina en cascada todos sus repositorios, documentos y datos asociados. Esta acción es irreversible.

```sql
-- Verificar primero los datos del usuario
SELECT u.email, COUNT(r.id) AS repositorios, COUNT(d.id) AS documentos
FROM users u
LEFT JOIN repositories r ON u.id = r.owner_id
LEFT JOIN documents d ON u.id = d.owner_id
WHERE u.email = 'usuario@correo.com'
GROUP BY u.id;

-- Eliminar (cascada: repositories, documents, extractions, ai_logs, error_logs)
DELETE FROM users WHERE email = 'usuario@correo.com';
```

---

## 3. Monitoreo del Sistema

### 3.1 Acceder al monitoreo

1. Inicie sesión como administrador.
2. En el menú lateral, haga clic en **"Monitoreo"**.
3. Se mostrará el panel de monitoreo con las siguientes secciones.

### 3.2 Panel de errores

**Métricas mostradas:**
- **Total de errores:** Número total de errores registrados.
- **Por nivel:** Distribución en error, warning, info.
- **Por código:** Distribución por tipo de error.

**Códigos de error comunes:**

| Código | Significado | Causa probable | Acción |
|---|---|---|---|
| `EXTRACTION_FAILED` | Fallo en extracción de texto | PDF escaneado (imagen), archivo corrupto | Verificar el archivo; usar PDFs con texto digital |
| `UNSUPPORTED_FORMAT` | Formato no aceptado | Archivo JPG, EXE, etc. | Convertir a PDF, DOCX o TXT |
| `FILE_TOO_LARGE` | Archivo excede 50 MB | Documento muy grande | Comprimir o dividir el archivo |
| `CLASSIFICATION_ERROR` | Error en clasificación | Texto vacío o muy corto | Verificar que el documento tiene contenido |
| `AUTH_FAILED` | Fallo de autenticación | Credenciales incorrectas | Verificar email/contraseña |

### 3.3 Logs de operaciones de IA

Los logs de IA registran cada operación realizada:

| Campo | Descripción |
|---|---|
| `operation_type` | Tipo: classification, summarization, extraction, embedding, chat |
| `tokens_used` | Tokens consumidos (0 en modo demo) |
| `processing_time_ms` | Tiempo de procesamiento en milisegundos |
| `timestamp` | Fecha y hora de la operación |

**Consultar logs recientes:**
```sql
SELECT operation_type, tokens_used, processing_time_ms, timestamp
FROM ai_logs
ORDER BY timestamp DESC
LIMIT 50;
```

### 3.4 Logs de errores

**Consultar errores recientes:**
```sql
SELECT e.error_code, e.message, e.level, e.created_at,
       d.original_filename AS documento
FROM error_logs e
LEFT JOIN documents d ON e.document_id = d.id
ORDER BY e.created_at DESC
LIMIT 50;
```

**Limpiar logs antiguos (más de 90 días):**
```sql
DELETE FROM ai_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM error_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
```

### 3.5 Verificar integridad del sistema

```sql
-- Verificar integridad de tablas
CHECK TABLE users, repositories, documents, categories, document_extractions, ai_logs, error_logs, system_config;

-- Verificar relaciones huérfanas
SELECT d.id, d.original_filename
FROM documents d
LEFT JOIN repositories r ON d.repository_id = r.id
WHERE r.id IS NULL;

-- Verificar documentos sin categoría
SELECT COUNT(*) AS sin_categoria
FROM documents
WHERE category_id IS NULL;
```

---

## 4. Configuración del Sistema

### 4.1 Acceder a la configuración

1. Inicie sesión como administrador.
2. En el menú lateral, haga clic en **"Configuración"**.

### 4.2 Parámetros configurables

| Parámetro | Descripción | Valor por defecto | Rango recomendado |
|---|---|---|---|
| `llm_model` | Modelo de lenguaje para chat | gpt-4o-mini | gpt-3.5-turbo, gpt-4o-mini, gpt-4o |
| `embedding_model` | Modelo de embeddings | text-embedding-3-small | text-embedding-3-small, text-embedding-3-large |
| `chunk_size` | Tamaño de fragmentos para RAG | 512 | 256 - 1024 |
| `chunk_overlap` | Superposición entre fragmentos | 64 | 32 - 128 |

### 4.3 Modificar configuración desde la interfaz

1. Modifique los valores en los campos del formulario.
2. Haga clic en **"Guardar"**.
3. Los cambios se aplican inmediatamente.

### 4.4 Modificar configuración desde la base de datos

```sql
-- Ver configuración actual
SELECT * FROM system_config;

-- Modificar un parámetro
UPDATE system_config SET value = '256' WHERE key = 'chunk_size';

-- Agregar un nuevo parámetro
INSERT INTO system_config (key, value) VALUES ('custom_param', 'custom_value');
```

### 4.5 Configuración de la API de OpenAI

Para habilitar el modo IA completo:

1. Obtener una API key en https://platform.openai.com/api-keys.
2. Configurar en el archivo `.env`:

```env
OPENAI_API_KEY=sk-<tu-key-aqui>
LLM_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
```

3. Reiniciar el servidor.

**Costos estimados (gpt-4o-mini):**
- Clasificación + resumen + embeddings: ~$0.002 por documento.
- Chat (por consulta): ~$0.0005 por consulta.

### 4.6 Configuración de CORS

Para permitir acceso desde dominios externos:

```env
# En .env
CORS_ORIGINS=https://tudominio.com,https://otrodominio.com
```

---

## 5. Gestión de la Base de Datos

### 5.1 Conexión a MySQL

```bash
# Conectar a la base de datos
mysql -u docupasion -p docupasion

# Verificar estado
STATUS;

# Ver tablas
SHOW TABLES;

# Ver estructura de una tabla
DESCRIBE users;
```

### 5.2 Crear la base de datos (instalación inicial)

```bash
# Si MySQL está instalado pero la BD no existe
mysql -u root -p < backend/sql/docupasion.sql
```

### 5.3 Respaldos automáticos (cron/Task Scheduler)

**Linux (cron):**
```bash
# Editar crontab
crontab -e

# Agregar respaldo diario a las 2:00 AM
0 2 * * * mysqldump -u docupasion -p"DocuPasion2024!" docupasion | gzip > /backups/docupasion_$(date +\%Y\%m\%d).sql.gz

# Agregar limpieza de logs antiguos (semanal, domingos a las 3:00 AM)
0 3 * * 0 mysql -u docupasion -p"DocuPasion2024!" docupasion -e "DELETE FROM ai_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY); DELETE FROM error_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);"
```

**Windows (Task Scheduler):**
```batch
@echo off
REM Respaldar base de datos
mysqldump -u docupasion -pDocuPasion2024! docupasion > C:\backups\docupasion_%date:~0,4%%date:~5,2%%date:~8,2%.sql

REM Comprimir el respaldo
powershell -command "Compress-Archive -Path 'C:\backups\docupasion_%date:~0,4%%date:~5,2%%date:~8,2%.sql' -DestinationPath 'C:\backups\docupasion_%date:~0,4%%date:~5,2%%date:~8,2%.zip'"
```

### 5.4 Restaurar desde respaldo

```bash
# Restaurar respaldo SQL
mysql -u docupasion -p docupasion < backup_docupasion_20250915.sql

# Restaurar respaldo comprimido
gunzip < backup_docupasion_20250915.sql.gz | mysql -u docupasion -p docupasion
```

### 5.5 Migración de SQLite a MySQL

Si comenzó con SQLite y desea migrar a MySQL:

```bash
# 1. Crear la BD en MySQL
mysql -u root -p < backend/sql/docupasion.sql

# 2. Exportar datos de SQLite
sqlite3 backend/docupasion.db ".dump" > sqlite_dump.sql

# 3. Convertir sintaxis (ajustar AUTO_INCREMENT, ENGINE, etc.)
# Editar sqlite_dump.sql manualmente o usar herramientas de migración

# 4. Importar a MySQL
mysql -u docupasion -p docupasion < sqlite_dump.sql

# 5. Actualizar .env
# Cambiar DATABASE_URL de sqlite a mysql
```

### 5.6 Optimización de rendimiento

```sql
-- Analizar tablas con mayor volumen
SELECT table_name, table_rows,
       ROUND(data_length/1024/1024, 2) AS 'Data (MB)',
       ROUND(index_length/1024/1024, 2) AS 'Index (MB)'
FROM information_schema.tables
WHERE table_schema = 'docupasion'
ORDER BY table_rows DESC;

-- Optimizar tablas grandes
OPTIMIZE TABLE documents, ai_logs, error_logs;

-- Agregar índices para consultas frecuentes
CREATE INDEX idx_documents_owner ON documents(owner_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_ai_logs_owner ON ai_logs(owner_id);
CREATE INDEX idx_ai_logs_timestamp ON ai_logs(timestamp);
```

---

## 6. Gestión de Archivos

### 6.1 Ubicación de archivos

| Modo | Ubicación | Descripción |
|---|---|---|
| Servidor | `backend/uploads/` | Archivos en disco con nombres UUID |
| Cliente | IndexedDB (store `blobs`) | Archivos en el navegador del usuario |

### 6.2 Verificar espacio en disco

```bash
# Linux
du -sh backend/uploads/
df -h backend/uploads/

# Windows
dir backend\uploads /s
powershell -command "Get-ChildItem backend\uploads -Recurse | Measure-Object -Property Length -Sum | Select-Object @{N='TotalSizeMB';E={[math]::Round($_.Sum/1MB,2)}}"
```

### 6.3 Limpiar archivos huérfanos

Archivos que existen en disco pero no están referenciados en la base de datos:

```python
import os
import pymysql

def clean_orphan_files():
    conn = pymysql.connect(host='localhost', user='docupasion',
                          password='DocuPasion2024!', database='docupasion')
    cursor = conn.cursor()

    # Obtener archivos referenciados en BD
    cursor.execute('SELECT filename FROM documents')
    db_files = {row[0] for row in cursor.fetchall()}

    # Obtener archivos en disco
    disk_files = set(os.listdir('backend/uploads/'))

    # Identificar huérfanos
    orphans = disk_files - db_files
    print(f'Archivos en disco: {len(disk_files)}')
    print(f'Archivos en BD: {len(db_files)}')
    print(f'Archivos huérfanos: {len(orphans)}')

    for f in orphans:
        os.remove(f'backend/uploads/{f}')
        print(f'Eliminado: {f}')

    conn.close()
```

---

## 7. Estrategia de Respaldo y Recuperación

### 7.1 Políticas de respaldo

| Componente | Frecuencia | Método | Retención | Ubicación |
|---|---|---|---|---|
| BD MySQL | Diario | mysqldump | 30 días | /backups/mysql/ |
| BD SQLite | Diario | Copia de archivo | 30 días | /backups/sqlite/ |
| Archivos uploads | Semanal | Copia de directorio | 90 días | /backups/uploads/ |
| Código fuente | Continuo | Git + GitHub | Indefinido | GitHub |
| Configuración .env | Manual | Copia segura | Indefinido | Almacenamiento externo |

### 7.2 Plan de recuperación ante desastres

**RTO (Recovery Time Objective):** < 30 minutos
**RPO (Recovery Point Objective):** < 24 horas

#### Escenario 1: Corrupción de la base de datos

```bash
# 1. Detener el servidor
# 2. Restaurar la BD
mysql -u docupasion -p docupasion < /backups/mysql/docupasion_20250915.sql

# 3. Verificar integridad
mysql -u docupasion -p docupasion -e "CHECK TABLE users, repositories, documents;"

# 4. Reiniciar el servidor
```

#### Escenario 2: Pérdida de archivos subidos

```bash
# 1. Restaurar directorio uploads desde el respaldo semanal
cp -r /backups/uploads/20250915/* backend/uploads/

# 2. Los documentos cuyos archivos se perdieron mostrarán estado "failed"
# 3. Los usuarios pueden re-subir los documentos afectados
```

#### Escenario 3: Pérdida total del servidor

```bash
# 1. Instalar Python y dependencias en nuevo servidor
# 2. Restaurar BD desde respaldo en la nube
# 3. Restaurar directorio uploads
# 4. Configurar variables de entorno
# 5. Iniciar servidor
```

#### Escenario 4: Corrupción del localStorage (modo cliente)

Los datos del modo cliente no tienen servidor de respaldo. Se recomienda:
- Usar el modo servidor para datos críticos.
- Implementar función de exportación de datos (futura versión).
- Educar a los usuarios sobre la importancia de no limpiar datos de navegación.

---

## 8. Seguridad

### 8.1 Buenas prácticas

1. **Cambiar la SECRET_KEY** en producción:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   # Copiar resultado al .env
   ```

2. **No exponer credenciales** en repositorios Git:
   ```bash
   echo ".env" >> .gitignore
   echo "uploads/" >> .gitignore
   echo "*.db" >> .gitignore
   ```

3. **Usar HTTPS** en producción:
   - Configurar un proxy reverso (nginx, Apache) con SSL/TLS.
   - Redirigir HTTP a HTTPS automáticamente.

4. **Restringir CORS** en producción:
   ```env
   CORS_ORIGINS=https://tudominio.com
   ```

5. **Auditar acceso** periódicamente:
   ```sql
   SELECT email, role, created_at FROM users ORDER BY created_at DESC;
   ```

### 8.2 Contraseñas de administrador

- La contraseña del administrador por defecto es `Admin123456!`.
- **Cambiar inmediatamente** después de la instalación inicial.
- Usar una contraseña fuerte: mínimo 12 caracteres, mayúsculas, minúsculas, números, caracteres especiales.
- No compartir credenciales de administrador.

### 8.3 Monitoreo de seguridad

```sql
-- Verificar si hay múltiples administradores
SELECT email, role FROM users WHERE role = 'admin';

-- Verificar usuarios con emails sospechosos
SELECT email, created_at FROM users WHERE email NOT LIKE '%@%.%';

-- Verificar actividad reciente
SELECT operation_type, COUNT(*) AS total
FROM ai_logs
WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY operation_type;
```

---

## 9. Solución de Problemas de Soporte

### 9.1 Problemas comunes reportados por usuarios

| Problema reportado | Diagnóstico | Solución |
|---|---|---|
| "No puedo iniciar sesión" | Credenciales incorrectas o token expirado | Verificar email/contraseña. Limpiar localStorage. |
| "Los documentos no se procesan" | Error de extracción de texto | Verificar que el PDF tiene texto digital (no imagen). |
| "El chat no responde" | No hay documentos indexados | Verificar que los documentos tienen estado "indexed". |
| "El dashboard muestra ceros" | Datos no actualizados | Recargar la página. Verificar que hay documentos. |
| "No puedo eliminar repositorio" | Repositorio tiene documentos | Eliminar documentos primero, luego el repositorio. |
| "La búsqueda no encuentra nada" | Palabras clave no coinciden | Probar con sinónimos. Verificar que el documento tiene texto. |
| "La página no carga" | Service Worker cachado con errores | Desregistrar SW en DevTools > Application > Service Workers. |

### 9.2 Herramientas de diagnóstico

**En el navegador (modo cliente):**
1. Abrir DevTools (F12).
2. Pestaña **Console**: Ver errores de JavaScript.
3. Pestaña **Application** > **Local Storage**: Ver datos de la BD local.
4. Pestaña **Application** > **IndexedDB**: Ver archivos almacenados.
5. Pestaña **Application** > **Service Workers**: Ver estado del caché.

**En el servidor (modo FastAPI):**
1. Revisar logs de uvicorn en la terminal.
2. Consultar `/api/health` para verificar estado del servidor.
3. Consultar `/api/health/db` para verificar conexión a BD.
4. Consultar `/docs` para ver documentación Swagger de la API.

### 9.3 Procedimiento de soporte level 1

1. Confirmar que el usuario tiene las credenciales correctas.
2. Verificar que el navegador es compatible (Chrome 90+, Firefox 88+).
3. Solicitar al usuario que limpie la caché del navegador.
4. Verificar que los archivos del frontend existen (index.html, js/, vendor/).
5. Si el problema persiste, escalar a soporte level 2.

### 9.4 Procedimiento de soporte level 2

1. Verificar que el backend está ejecutándose (si aplica).
2. Consultar logs de errores en la BD.
3. Verificar integridad de la BD: `CHECK TABLE ...`.
4. Verificar espacio en disco del servidor.
5. Revisar variables de entorno (.env).
6. Si el problema persiste, escalar a soporte level 3.

---

## 10. Mantenimiento Preventivo

### 10.1 Tareas diarias

- [ ] Verificar que el servidor está ejecutándose.
- [ ] Revisar logs de errores críticos.
- [ ] Verificar espacio en disco (>20% libre).

### 10.2 Tareas semanales

- [ ] Respaldar la base de datos.
- [ ] Respaldar el directorio de uploads.
- [ ] Limpiar logs antiguos (>90 días).
- [ ] Revisar métricas de rendimiento.

### 10.3 Tareas mensuales

- [ ] Actualizar dependencias del sistema (pip audit).
- [ ] Revisar usuarios inactivos.
- [ ] Optimizar tablas de la BD.
- [ ] Verificar integridad de los respaldos.
- [ ] Revisar configuración de seguridad.

### 10.4 Tareas trimestrales

- [ ] Auditar permisos de usuarios.
- [ ] Revisar y actualizar documentación.
- [ ] Evaluar necesidad de escalabilidad.
- [ ] Probar procedimiento de recuperación ante desastres.

---

**Fin del Manual de Administración y Soporte**
