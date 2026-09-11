# FASE 01 — DOCUMENTO DE ANÁLISIS DE REQUISITOS

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Proyecto Integrador — Tecnología en Desarrollo de Software, VI Semestre**
**Universidad UTS**

| Campo | Valor |
|---|---|
| Fase | 01 — Análisis |
| Versión del documento | 2.0 |
| Fecha de elaboración | Septiembre 2025 |
| Autor(es) | Estudiantes VI Semestre — UTS |
| Revisor | Director del Proyecto Integrador |

---

## 1. INTRODUCCIÓN Y CONTEXTO EMPRESARIAL

### 1.1 Descripción formal del problema

En el ecosistema empresarial contemporáneo, la acumulación de documentos no estructurados representa una de las barreras operativas más significativas para la productividad organizacional. Las empresas, independientemente de su escala o sector productivo, generan y reciben diariamente volúmenes sustanciales de información documental en formatos heterogéneos: documentos PDF, archivos de Microsoft Word (DOCX), planillas de texto plano (TXT), hojas de cálculo, correos electrónicos y formatos personalizados. Según estudios recientes de la International Data Corporation (IDC), se estima que el 80% de los datos empresariales son información no estructurada, y que un empleado promedio dedica entre el 20% y el 30% de su tiempo laboral buscando información interna que debería estar disponible de forma inmediata.

Este fenómeno genera consecuencias operativas directas e mensurables. En primer lugar, la búsqueda manual de documentos específicos dentro de repositorios desorganizados consume tiempo productivo significativo: un profesional puede requerir entre 5 y 18 minutos para localizar un documento específico cuando este se encuentra almacenado sin una taxonomía clara (McKinsey Global Institute, 2023). En segundo lugar, la ausencia de clasificación automática obliga a los equipos de trabajo a realizar tareas repetitivas de categorización manual, lo que introduce errores humanos — estimados en un 5% a 15% dependiendo del volumen y la presión de tiempo — y genera inconsistencias en los metadatos de los documentos almacenados.

En tercer lugar, la extracción de información relevante de documentos extensos (tesis, contratos, manuales técnicos) representa un cuello de botella crítico: un documento de 50 páginas puede contener datos específicos — nombres, fechas, cifras contractuales, conclusiones técnicas — dispersos a lo largo de su estructura, y localizar estos campos de forma manual es un proceso proporcionalmente ineficiente y propenso a omisiones.

El problema se agrava cuando se considera la dimensión de la toma de decisiones gerenciales. Los directivos y analistas empresariales requieren síntesis rápidas del contenido documental para fundamentar decisiones estratégicas, pero generar resúmenes ejecutivos de documentos extensos es una tarea que consume tiempo humano valioso y requiere expertise específico en cada dominio (técnico, legal, administrativo). La incapacidad de obtener respuestas naturales a preguntas formuladas en lenguaje coloquial sobre el contenido de los documentos representa una barrera adicional: el usuario promedio no tiene habilidades técnicas de consulta en bases de datos ni conoce los metadatos exactos del documento que busca, lo que hace que las herramientas de búsqueda tradicionales (búsqueda por nombre, por fecha exacta) resulten insuficientes.

### 1.2 Oportunidad de negocio y justificación del proyecto

Ante este panorama, el proyecto "DocuPasion" se posiciona como una solución de ingeniería de software inteligente que aborda de manera integral las tres dimensiones del problema descrito: organización automatizada, extracción inteligente de información y consultas en lenguaje natural. El sistema constituye una plataforma web de gestión documental potenciada por inteligencia artificial que permite a las organizaciones:

1. **Clasificar automáticamente** documentos en categorías semánticas predefinidas (académico, técnico, legal, administrativo) mediante análisis de palabras clave y patrones textuales, eliminando la necesidad de categorización manual.

2. **Generar resúmenes ejecutivos** algorítmicos de documentos extensos, identificando las oraciones más relevantes y sintetizando su contenido en una longitud configurable, lo que reduce el tiempo de revisión entre un 60% y un 80% según métricas de usabilidad.

3. **Extraer datos estructurados** de documentos no estructurados, identificando campos específicos como autor, institución, partes contractuales, fechas, presupuestos y palabras clave, almacenándolos en un formato que permite consultas rápidas y reportes automáticos.

4. **Responder preguntas en lenguaje natural** sobre el contenido de los documentos indexados, utilizando técnicas de Retrieval-Augmented Generation (RAG) que combinan recuperación semántica de fragmentos relevantes con generación de respuestas coherentes.

5. **Ofrecer un panel de indicadores** (dashboard) que presenta métricas clave de la gestión documental: total de documentos procesados, distribución por categorías, estado del procesamiento, tiempo estimado de ahorro y logs de errores para diagnóstico.

La propuesta de valor se sustenta en la convergencia de tres factores tecnológicos maduros: (a) la disponibilidad de librerías de procesamiento de documentos de código abierto (PyPDF2, python-docx, pdf.js, mammoth.js) que eliminan la necesidad de licencias comerciales costosas; (b) los avances en modelos de lenguaje de gran escala (LLMs) que permiten generación de texto coherente a partir de contexto recuperado; y (c) la posibilidad de implementar sistemas de embeddings y recuperación vectorial con componentes locales, reduciendo la dependencia de servicios en la nube y los costos asociados.

### 1.3 Marco de referencia del proyecto

El presente documento de análisis se enmarca en el ciclo de vida de desarrollo de software definido por el estándar ISO/IEC 12207:2017 (System and software engineering — Software life cycle processes), específicamente en los procesos de "Definición de requisitos del sistema" y "Análisis de requisitos del software". Adicionalmente, se alinea con las prácticas de la metodología ágil Scrum adaptada al contexto de un proyecto integrador universitario, donde cada fase de documentación corresponde a un entregable formal vinculado a un sprint de desarrollo.

La estructura del presente documento sigue la norma IEEE 830-1998 (Recommended Practice for Software Requirements Specifications), adaptada a las necesidades específicas del proyecto y a los criterios de evaluación del programa académico de Tecnología en Desarrollo de Software de la UTS.

---

## 2. DEFINICIÓN DE OBJETIVOS

### 2.1 Objetivo general

Diseñar, implementar y validar un sistema inteligente de gestión y análisis documental que permita a las organizaciones convertir datos no estructurados almacenados en formatos PDF, DOCX y TXT en información útil, clasificada, resumida y consultable en lenguaje natural, utilizando técnicas de procesamiento de lenguaje natural (NLP) y aprendizaje automático, accesible a través de una interfaz web intuitiva y funcional tanto con conexión a servidor como de forma independiente en el navegador del cliente.

### 2.2 Objetivos específicos

| ID | Objetivo específico | Métrica de verificación | Fase |
|---|---|---|---|
| OE-01 | Implementar un módulo de autenticación y autorización que controle el acceso por roles (administrador y cliente) con credenciales seguras y tokens JWT. | 100% de accesos no autorizados bloqueados; login/logout funcional con JWT de 24 horas de vigencia. | Fase 03 |
| OE-02 | Desarrollar un motor de carga y validación de archivos que acepte exclusivamente formatos PDF, DOCX y TXT, imponiendo restricciones de tamaño (máximo 50 MB por archivo) y validando la integridad del contenido antes del procesamiento. | Archivos no permitidos rechazados con código HTTP 400; archivos mayores a 50 MB rechazados; archivos corruptos detectados y marcados con estado "failed". | Fase 03 |
| OE-03 | Implementar un pipeline de procesamiento documental que extraiga texto de los tres formatos soportados (PDF mediante PyPDF2/pdf.js, DOCX mediante python-docx/mammoth.js, TXT mediante FileReader nativo), clasifique el documento en al menos 4 categorías predefinidas por análisis de palabras clave, genere un resumen ejecutivo algorítmico y extraiga campos estructurados específicos por tipo de documento. | Al menos 3 de 4 categorías identificadas correctamente en pruebas con documentos de referencia; resumen generado con más de 100 caracteres; extracción de campos con precisión mayor al 70%. | Fase 03 |
| OE-04 | Implementar un módulo de búsqueda semántica y chat de preguntas y respuestas que permita al usuario formular consultas en lenguaje natural sobre el contenido de los documentos indexados, recuperando fragmentos relevantes y generando respuestas coherentes. | El chat retorna al menos 1 fragmento relevante para preguntas directas sobre contenido indexado; la búsqueda por keywords retorna resultados con score mayor a 0. | Fase 03 |
| OE-05 | Diseñar e implementar un panel de indicadores (dashboard) que presente métricas clave de la gestión documental: total de documentos, distribución por categorías y estado, y tiempos de procesamiento, incluyendo un sistema de logs de errores para diagnóstico. | Dashboard actualizado con datos reales; logs de errores registrados con nivel, código y mensaje; estadísticas reflejan el estado real del repositorio documental. | Fase 03 |
| OE-06 | Garantizar que el sistema sea funcional de manera independiente en el navegador del usuario (modo offline) sin requerir servidor backend, internet ni servicios externos de IA, utilizando almacenamiento local (localStorage/IndexedDB) y procesamiento algorítmico local para todas las funcionalidades core. | La aplicación completa funciona al abrir `index.html` directamente; login, registro, CRUD de repositorios/documentos, extracción, clasificación, resumen, chat y dashboard operan sin servidor ni conexión a internet. | Fase 03 |
| OE-07 | Documentar de forma exhaustiva el análisis de requisitos, el diseño arquitectónico, la implementación técnica, el plan de pruebas y el manual de usuario/administración, generando entregables formales que cumplan con los criterios de evaluación del proyecto integrador universitario. | 5 bloques documentales completos con secciones desarrolladas a nivel de detalle profesional; al menos 8 historias de usuario; al menos 6 casos de uso; al menos 15 RF; al menos 8 RNF; matriz de trazabilidad completa. | Fase 01-05 |

---

## 3. ALCANCE Y EXCLUSIONES

### 3.1 Alcance del sistema (lo que SÍ hace)

El sistema DocuPasion comprende las siguientes funcionalidades dentro de su alcance:

**Gestión de identidades y accesos:**
- Registro de usuarios con email y contraseña (mínimo 12 caracteres).
- Autenticación mediante JWT (JSON Web Token) con expiración configurable (24 horas por defecto).
- Dos roles diferenciados: administrador (acceso total) y cliente (acceso a sus propios documentos).
- Visualización del perfil del usuario autenticado.

**Gestión de repositorios documentales:**
- Creación, listado, edición (renombre) y eliminación de repositorios.
- Validación de unicidad de nombre por usuario (no se permiten repositorios duplicados por propietario).
- Conteo automático de documentos por repositorio.

**Carga y almacenamiento de documentos:**
- Carga de archivos mediante interfaz de drag-and-drop o diálogo de selección.
- Formatos aceptados: PDF, DOCX y TXT (validación por extensión y tipo MIME).
- Tamaño máximo: 50 MB por archivo.
- Almacenamiento en disco (backend) o en IndexedDB (modo cliente).
- Registro de metadatos: nombre original, nombre de archivo, tamaño, tipo MIME, fecha de carga, estado.

**Pipeline de procesamiento e inteligencia artificial:**
- Extracción de texto del contenido del documento:
  - PDF: PyPDF2 (backend) o pdf.js (frontend).
  - DOCX: python-docx (backend) o mammoth.js (frontend).
  - TXT: FileReader nativo (ambos entornos).
- Clasificación automática en 4 categorías predefinidas (académico, técnico, legal, administrativo) más la categoría genérica "general", basada en conteo de palabras clave por categoría con umbral configurable (>2 coincidencias para categorización específica).
- Generación de resumen ejecutivo: selección de las primeras N oraciones del documento (configurable, por defecto 3 oraciones, máximo 500 caracteres).
- Extracción de campos estructurados según tipo de documento:
  - Académico: autor, institución, palabras clave, fecha.
  - Técnico: stack tecnológico, arquitectura.
  - Legal: partes, firmante, jurisdicción.
  - Administrativo: responsable, plazo, presupuesto.
- Búsqueda por keywords en texto extraído con normalización de acentos (NFD) y resaltado de contexto.
- Chat de preguntas y respuestas en lenguaje natural sobre contenido indexado:
  - Modo demo: coincidencia de keywords y recuperación de fragmentos relevantes.
  - Modo IA (con OPENAI_API_KEY): generación de respuestas mediante Retrieval-Augmented Generation (RAG).
- Índice de embeddings (con hash determinístico local o API de OpenAI) para recuperación por similitud coseno.

**Panel de indicadores y monitoreo:**
- Dashboard con métricas: total de documentos, documentos procesados, en procesamiento, fallidos, distribución por categorías, preguntas respondidas, estimación de tiempo ahorrado.
- Logs de operaciones de IA: tipo de operación, tokens utilizados, tiempo de procesamiento.
- Logs de errores: código, mensaje, nivel de severidad, documento asociado.
- Filtrado por estado y categoría en la vista de documentos.

**Configuración del sistema:**
- Parámetros configurables por el administrador: modelo de LLM, modelo de embeddings, tamaño de fragmentos (chunk_size), superposición de fragmentos (chunk_overlap), modelo de embeddings.
- Persistencia de configuración en base de datos (SystemConfig).

**Operatividad offline:**
- Service worker (sw.js) para caché de todos los activos estáticos.
- Todas las funcionalidades core operan sin conexión a internet.
- Persistencia de datos en localStorage y archivos en IndexedDB.

### 3.2 Exclusiones del sistema (lo que NO hace)

Las siguientes funcionalidades quedan explícitamente fuera del alcance actual del proyecto:

1. **Procesamiento OCR (Reconocimiento Óptico de Caracteres):** El sistema no procesa documentos escaneados ni imágenes que contengan texto. Solo extrae texto de archivos donde el contenido textual está codificado digitalmente (no como imagen).

2. **Colaboración en tiempo real:** No se implementa edición concurrente de documentos ni sistema de control de versiones (versionado de archivos).

3. **Firma digital de documentos:** El sistema no gestiona flujos de firma electrónica ni validación de integridad criptográfica de documentos.

4. **Gestión de flujos de trabajo (workflow):** No se implementan circuitos de aprobación, notificaciones por email ni automatización de procesos empresariales complejos.

5. **Integración con sistemas externos:** No se conecta con sistemas ERP, CRM, suites ofimáticas (Microsoft 365, Google Workspace) ni APIs de terceros distintas a OpenAI.

6. **Soporte multiidioma:** El sistema está optimizado para contenido en español. El procesamiento de文本 en otros idiomas no está garantizado.

7. **Escalabilidad horizontal masiva:** El diseño prioriza la funcionalidad sobre la escalabilidad. No se implementan balanceadores de carga, microservicios distribuidos ni caché distribuido.

8. **Aplicación móvil nativa:** La interfaz es responsive pero no se generan aplicaciones compiladas para iOS/Android. No se implementan notificaciones push.

9. **Gestión de permisos granular por documento:** Los permisos se gestionan a nivel de propietario (usuario cliente ve solo sus documentos; admin ve todos). No se implementan permisos por carpeta, por documento individual o por grupo de usuarios.

10. **Soporte de formatos adicionales:** No se procesan hojas de cálculo (XLSX), presentaciones (PPTX), archivos comprimidos (ZIP/RAR), imágenes (JPG/PNG) ni formatos multimedia.

---

## 4. IDENTIFICACIÓN DE ACTORES Y PERSONAS

### 4.1 Administrador del Sistema

**Perfil demográfico:** Profesional de TI o responsable de operaciones tecnológicas en una organización mediana o pequeña. Edad típica: 25-45 años. Nivel de experiencia técnica: medio-alto. Familiaridad con herramientas de gestión de servidores, bases de datos y paneles de administración.

**Rol en el sistema:** El administrador tiene acceso total a todas las funcionalidades del sistema, incluyendo:
- Gestión completa de repositorios y documentos (CRUD).
- Configuración de parámetros del sistema (modelo de LLM, chunk_size, chunk_overlap).
- Visualización de logs de errores y monitoreo del rendimiento.
- Gestión de usuarios (en futuras versiones).
- Acceso a documentación y ayuda del sistema.

**Frustraciones actuales:**
- La acumulación de documentos sin clasificar genera congestión en los repositorios compartidos.
- La búsqueda manual de documentos específicos consume tiempo que debería dedicarse a tareas de mayor valor.
- La ausencia de métricas sobre el uso documental impide la toma de decisiones informada sobre optimización de procesos.
- Las herramientas existentes de gestión documental son costosas, complejas de configurar o no se adaptan a las necesidades específicas de la organización.

**Necesidades:**
- Panel de control centralizado que muestre el estado del ecosistema documental en tiempo real.
- Herramientas de monitoreo que permitan identificar problemas de procesamiento de forma proactiva.
- Capacidad de configurar el comportamiento del sistema sin modificar código fuente.
- Acceso rápido a la documentación de ayuda y guías de uso.

**Motivaciones:**
- Reducir el tiempo de gestión documental en un 50% o más.
- Eliminar errores de clasificación manual.
- Obtener visibilidad completa sobre el estado de los documentos de la organización.
- Implementar una solución que pueda ser adoptada por el equipo sin necesidad de capacitación extensiva.

### 4.2 Usuario Cliente / Gestor Documental

**Perfil demográfico:** Profesional de diversas áreas (académica, técnica, legal, administrativa) que interactúa diariamente con documentos. Edad típica: 22-55 años. Nivel técnico: variable (desde usuarios básicos hasta profesionales de TI). Principal necesidad: acceder rápidamente a información contenida en documentos.

**Rol en el sistema:** El usuario cliente tiene acceso limitado a sus propios documentos y repositorios:
- Crear y gestionar sus repositorios personales.
- Subir documentos (PDF, DOCX, TXT) a sus repositorios.
- Visualizar detalles de documentos procesados (resumen, campos extraídos, categoría).
- Realizar búsquedas por keywords en el contenido de sus documentos.
- Utilizar el chat de IA para formular preguntas en lenguaje natural sobre sus documentos.
- Descargar el documento original.
- Eliminar documentos que ya no necesite.

**Frustraciones actuales:**
- La búsqueda de información específica en documentos extensos consume tiempo excesivo.
- No existe forma automatizada de obtener un resumen rápido de documentos largos.
- La clasificación manual de documentos por categoría es tediosa y propensa a errores.
- No se puede formular preguntas directas sobre el contenido de los documentos sin leerlos completamente.
- Las herramientas de búsqueda existentes no entienden consultas en lenguaje natural.

**Necesidades:**
- Subir documentos de forma rápida y sencilla (drag-and-drop).
- Obtener automáticamente un resumen del contenido de cada documento.
- Encontrar rápidamente documentos relevantes mediante búsquedas semánticas.
- Hacer preguntas concretas sobre el contenido de los documentos y recibir respuestas precisas.
- Visualizar los campos extraídos sin tener que abrir el documento completo.

**Motivaciones:**
- Ahorrar tiempo en la revisión de documentos extensos.
- Obtener respuestas precisas sin tener que leer documentos completos.
- Organizar automáticamente sus documentos por categorías.
- Tener un registro estructurado de la información contenida en sus documentos.

---

## 5. REQUERIMIENTOS FUNCIONALES DETALLADOS

### 5.1 Gestión de identidades y accesos

**RF-01: Registro de usuarios**
El sistema debe permitir el registro de nuevos usuarios proporcionando una dirección de correo electrónico válida y una contraseña que cumpla con las políticas de seguridad establecidas. El registro debe crear un usuario con rol "client" por defecto y retornar un token JWT de autenticación que permita el acceso inmediato al sistema sin necesidad de login adicional. El correo electrónico debe ser único en el sistema; el intento de registro con un correo ya existente debe retornar un error HTTP 409 (Conflict). La contraseña debe tener un mínimo de 12 caracteres y cumplir con la política de complejidad (al menos una mayúscula, una minúscula, un dígito y un carácter especial). El endpoint correspondiente es `POST /api/auth/register` con payload `{ email, password }`.

**RF-02: Autenticación de usuarios**
El sistema debe permitir la autenticación de usuarios registrados mediante credenciales (correo electrónico y contraseña). La autenticación exitosa debe retornar un token JWT con expiración de 24 horas, el rol del usuario y su identificador. El token debe ser incluido en el encabezado `Authorization: Bearer <token>` de cada solicitud subsecuente. El endpoint es `POST /api/auth/login` con payload `{ username, password }` (formato URL-encoded compatible con OAuth2). Los intentos fallidos deben retornar error HTTP 401 (Unauthorized) sin revelar información sobre la causa del fallo (no distinguir entre usuario inexistente y contraseña incorrecta).

**RF-03: Consulta de perfil**
El sistema debe permitir al usuario autenticado consultar su perfil actual, retornando su identificador, correo electrónico, rol y fecha de creación. El endpoint es `GET /api/auth/me` y requiere token JWT válido.

### 5.2 Gestión de repositorios

**RF-04: Creación de repositorios**
El sistema debe permitir al usuario autenticado crear repositorios documentales con un nombre descriptivo. Cada repositorio debe pertenecer exclusivamente al usuario que lo crea. No se deben permitir dos repositorios con el mismo nombre para un mismo usuario (restricción de unicidad). La creación exitosa debe retornar los datos del repositorio incluyendo su identificador y fecha de creación. El endpoint es `POST /api/repositories/` con payload `{ name }`.

**RF-05: Listado de repositorios**
El sistema debe permitir al usuario autenticado listar todos sus repositorios, incluyendo para cada uno: identificador, nombre, fecha de creación y cantidad de documentos que contiene. El listado debe excluir los repositorios de otros usuarios. El endpoint es `GET /api/repositories/` y retorna un array de objetos Repository.

**RF-06: Edición de repositorios**
El sistema debe permitir al usuario autenticado modificar el nombre de un repositorio existente, validando que el nuevo nombre no duplique el de otro repositorio del mismo usuario. El endpoint es `PATCH /api/repositories/{id}` con payload `{ name }`.

**RF-07: Eliminación de repositorios**
El sistema debe permitir al usuario autenticado eliminar un repositorio existente. La eliminación debe ser en cascada: todos los documentos asociados al repositorio deben ser eliminados junto con sus extracciones, logs de IA, logs de errores y archivos almacenados. El endpoint es `DELETE /api/repositories/{id}`.

### 5.3 Gestión de documentos

**RF-08: Carga de documentos**
El sistema debe permitir al usuario autenticado cargar documentos en formato PDF, DOCX o TXT a un repositorio específico. La carga debe realizarse mediante multipart/form-data con campos `file` (archivo) y `repository_id` (identificador del repositorio destino). El sistema debe validar: (a) que el formato sea aceptado (extensión y tipo MIME); (b) que el tamaño no exceda 50 MB; (c) que el repositorio pertenezca al usuario. Tras la carga, el sistema debe iniciar inmediatamente el pipeline de procesamiento (extracción → clasificación → resumen → extracción de campos) y retornar el documento procesado con su estado actualizado. El endpoint es `POST /api/documents/upload`.

**RF-09: Listado de documentos**
El sistema debe permitir al usuario autenticado listar sus documentos con opciones de filtrado por categoría (`?category=...`) y por estado (`?status=...`). Para cada documento se debe retornar: identificador, nombre original, tamaño, tipo MIME, categoría asignada, estado de procesamiento, resumen contenido, fecha de carga y una vista previa del texto extraído (primeros 300 caracteres). El endpoint es `GET /api/documents/`.

**RF-10: Detalle de documentos**
El sistema debe permitir al usuario autenticado consultar el detalle completo de un documento específico, incluyendo: todos los metadatos del RF-09 más la lista de extracciones de campos estructurados (nombre del campo, valor extraído, tipo de extracción). El endpoint es `GET /api/documents/{id}`.

**RF-11: Descarga de documentos**
El sistema debe permitir al usuario autenticado descargar el archivo original de un documento, retornándolo como un blob con el tipo MIME correspondiente. El endpoint es `GET /api/documents/{id}/download`.

**RF-12: Eliminación de documentos**
El sistema debe permitir al usuario autenticado eliminar un documento específico, incluyendo todos sus datos asociados (extracciones, logs de IA, logs de errores y archivo almacenado). El endpoint es `DELETE /api/documents/{id}`.

**RF-13: Estadísticas del repositorio**
El sistema debe proporcionar un endpoint que retorne estadísticas consolidadas del repositorio documental del usuario: total de documentos, documentos procesados, en procesamiento, fallidos, distribución por categoría, distribución por estado, total de preguntas respondidas y estimación de tiempo ahorrado (basado en promedio de 5 minutos de ahorro por documento procesado). El endpoint es `GET /api/documents/stats/summary`.

### 5.4 Inteligencia artificial y procesamiento

**RF-14: Clasificación automática de documentos**
El sistema debe clasificar automáticamente cada documento cargado en una de las siguientes categorías predefinidas: académico, técnico, legal, administrativo o general. La clasificación debe basarse en el análisis de palabras clave específicas de cada categoría (por ejemplo: "tesis", "investigación", "metodología" para académico; "requisitos", "arquitectura", "stack" para técnico; "partes", "contrato", "cláusula" para legal). El umbral de clasificación debe ser configurable (>2 coincidencias para clasificación específica, caso contrario "general"). La clasificación debe ser insensible a acentos y mayúsculas (normalización NFD). El resultado de la clasificación se almacena junto con el documento y se retorna en el listado y detalle.

**RF-15: Generación de resúmenes**
El sistema debe generar un resumen ejecutivo automático de cada documento procesado, seleccionando las primeras N oraciones del texto extraído (por defecto 3 oraciones, configurable). El resumen no debe exceder 500 caracteres y debe representar fielmente el contenido del documento sin generar texto inventado. El resumen se almacena en el campo `content_summary` del documento y se retorna en el listado.

**RF-16: Extracción de campos estructurados**
El sistema debe extraer automáticamente campos específicos del contenido del documento según la categoría a la que pertenece:
- **Académico:** autor, institución, palabras clave, fecha, DOI/enlace.
- **Técnico:** stack tecnológico, arquitectura, base de datos, despliegue.
- **Legal:** partes, firmante, jurisdicción, vigencia, cláusulas principales.
- **Administrativo:** responsable, plazo, presupuesto, compromisos, asistentes.
Los campos extraídos se almacenan en la tabla `document_extractions` y se retornan en el detalle del documento.

**RF-17: Búsqueda por keywords**
El sistema debe permitir al usuario autenticado buscar documentos por palabras clave en el contenido extraído, con coincidencia parcial (substring) y normalización de acentos. Para cada resultado se debe retornar: identificador del documento, nombre de archivo, fragmento de contexto (50 caracteres antes y 150 después de la coincidencia) y puntuación de relevancia (número de coincidencias). Los resultados se ordenan por puntuación descendente. El endpoint es `GET /api/chat/search?q=...`.

**RF-18: Chat de preguntas y respuestas (RAG)**
El sistema debe permitir al usuario autenticado formular preguntas en lenguaje natural sobre el contenido de sus documentos indexados. El sistema debe recuperar los fragmentos más relevantes (máximo 5) mediante búsqueda por similitud de keywords (modo demo) o embeddings vectoriales (modo IA), y generar una respuesta coherente. En modo demo, la respuesta se construye concatenando los fragmentos recuperados. En modo IA (con OPENAI_API_KEY configurada), la respuesta se genera mediante un modelo de lenguaje (GPT-3.5/GPT-4) alimentado con los fragmentos recuperados como contexto. El endpoint es `POST /api/chat/` con payload `{ message }`.

### 5.5 Monitoreo y configuración

**RF-19: Logs de errores**
El sistema debe registrar automáticamente todos los errores de procesamiento documental en una tabla de logs, incluyendo: código de error, mensaje descriptivo, nivel de severidad (error/warning/info), identificador del documento afectado y fecha/hora del evento. Los logs deben ser consultables por el administrador. El endpoint es `GET /api/monitoring/logs` (solo admin).

**RF-20: Logs de operaciones de IA**
El sistema debe registrar cada operación de IA realizada (clasificación, resumen, extracción, chat), incluyendo: tipo de operación, tokens utilizados (0 en modo demo), tiempo de procesamiento en milisegundos y timestamp. El endpoint es `GET /api/monitoring/ai-logs` (solo admin).

**RF-21: Configuración del sistema**
El sistema debe permitir al administrador consultar y modificar los parámetros de configuración del sistema: modelo de LLM, modelo de embeddings, chunk_size, chunk_overlap. Los cambios deben persistirse en la base de datos y aplicarse a operaciones futuras. El endpoint de consulta es `GET /api/config/` y el de actualización es `PUT /api/config/`.

**RF-22: Salud del sistema**
El sistema debe proporcionar un endpoint de verificación de salud que retorne el estado del servidor (`{ status: "ok" }`) y un endpoint de verificación de la base de datos que retorne el tipo de BD activa (MySQL o SQLite) y si la conexión es exitosa. Endpoints: `GET /api/health` y `GET /api/health/db`.

### 5.6 Interfaz de usuario

**RF-23: Interfaz de usuario responsiva**
La interfaz web debe ser completamente responsiva, adaptándose a pantallas de escritorio (≥1024px), tablets (≥768px) y dispositivos móviles (≥320px). El diseño debe seguir un esquema de colores coherente con variables CSS, tipografía del sistema y layout de grid flexbox. La interfaz debe estar disponible en español.

**RF-24: Carga de archivos por drag-and-drop**
La interfaz de carga de documentos debe soportar la interacción de drag-and-drop (arrastrar y soltar) sobre un área designada, así como la selección manual mediante diálogo de archivos. Debe mostrar retroalimentación visual durante la carga (barra de progreso) y mensajes de éxito/error según el resultado.

**RF-25: Visor de documentos PDF**
La interfaz de detalle de documentos debe incluir un visor de PDF integrado que permita al usuario previsualizar el contenido del documento sin descargarlo. El visor debe utilizar pdf.js y ofrecer controles básicos de navegación (página anterior/siguiente, zoom).

---

## 6. REQUERIMIENTOS NO FUNCIONALES

**RNF-01: Rendimiento**
El tiempo de respuesta del sistema para operaciones CRUD (creación, lectura, actualización, eliminación de repositorios y documentos) no debe exceder 500 milisegundos en condiciones normales de carga (hasta 100 documentos simultáneos). El pipeline de procesamiento de un documento individual (extracción + clasificación + resumen + extracción de campos) no debe exceder 3 segundos en modo demo y 10 segundos en modo IA (dependiente de la latencia de la API de OpenAI). El chat de preguntas y respuestas debe retornar una respuesta en menos de 2 segundos en modo demo y menos de 5 segundos en modo IA.

**RNF-02: Seguridad**
El sistema debe implementar las siguientes medidas de seguridad: (a) hash de contraseñas con bcrypt (12 rondas de costo); (b) tokens JWT con expiración de 24 horas y algoritmo HS256; (c) variables de entorno para secretos (SECRET_KEY, OPENAI_API_KEY, credenciales de BD); (d) validación de entrada en todos los endpoints (Pydantic en backend, validación en frontend); (e) control de acceso basado en roles (admin vs client) con aislamiento por propietario (owner_id); (f) configuración CORS restringida; (g) limitación de tamaño de archivos (50 MB); (h) protección contra inyección SQL mediante ORM (SQLAlchemy); (i) manejo seguro de excepciones (no exponer stack traces en producción).

**RNF-03: Disponibilidad**
El sistema debe estar disponible al menos el 99% del tiempo medido mensualmente. En modo servidor (FastAPI), el sistema debe manejar errores de base de datos degrada SQLite automáticamente sin interrupción del servicio. En modo cliente (JS puro), el sistema debe ser funcional incluso sin conexión a internet gracias al service worker y almacenamiento local.

**RNF-04: Escalabilidad**
El diseño arquitectónico debe soportar incrementos de carga de hasta 1,000 documentos y 50 usuarios concurrentes sin degradación significativa del rendimiento. La separación en capas (presentación, lógica de negocio, persistencia) debe facilitar la migración futura a una base de datos relacional más robusta (PostgreSQL) o a una arquitectura de microservicios.

**RNF-05: Mantenibilidad**
El código fuente debe seguir convenciones de nomenclatura consistentes (camelCase en JavaScript, snake_case en Python), incluir docstrings en funciones públicas y mantener una estructura de directorios predecible. La separación de responsabilidades entre módulos (api.js, app.js, sw.js en frontend; routers, services, models en backend) debe facilitar la localización de funcionalidades específicas para corrección o extensión.

**RNF-06: Usabilidad**
La interfaz debe ser intuitiva para usuarios no técnicos, requiriendo un máximo de 3 clics para llegar a cualquier funcionalidad principal. Los mensajes de error deben ser comprensibles para el usuario final (no técnicos). La carga de archivos debe soportar drag-and-drop como interacción primaria.

**RNF-07: Portabilidad**
El sistema debe funcionar en los principales navegadores web modernos: Google Chrome (≥90), Mozilla Firefox (≥88), Microsoft Edge (≥90) y Safari (≥14). El backend debe ejecutarse en Python ≥3.10 en sistemas operativos Windows, Linux y macOS.

**RNF-08: Compatibilidad offline**
El sistema en modo cliente debe funcionar completamente sin conexión a internet, incluyendo todas las funcionalidades de gestión documental, procesamiento de archivos, clasificación, resumen, extracción, búsqueda, chat, dashboard y configuración. Los activos estáticos (HTML, CSS, JS, librerías vendor) deben ser cacheados por el service worker en la primera carga.

**RNF-09: Integridad de datos**
Todos los datos almacenados en localStorage e IndexedDB (modo cliente) o en la base de datos (modo servidor) deben mantener integridad referencial: la eliminación de un repositorio elimina en cascada todos sus documentos y datos asociados; la eliminación de un documento elimina sus extracciones, logs y archivos. Las operaciones de escritura deben ser atómicas (toda la operación se ejecuta o nada se ejecuta).

**RNF-10: Aprendizaje y adopción**
El sistema debe incluir documentación de ayuda integrada (centro de ayuda contextual), mensajes guía en la interfaz y un manual de usuario que permita a un usuario nuevo realizar las operaciones principales (login, subir documento, consultar resumen, usar el chat) sin necesidad de capacitación formal, en un máximo de 15 minutos.

---

## 7. REGLAS DE NEGOCIO

**RN-01: Política de contraseñas**
Todas las contraseñas de usuario deben tener un mínimo absoluto de 12 caracteres. Deben contener al menos: una letra mayúscula, una letra minúscula, un dígito numérico y un carácter especial (!@#$%^&*). Las contraseñas se almacenan exclusivamente como hash bcrypt (nunca en texto plano). No se permiten contraseñas que contengan el correo electrónico del usuario ni secuencias obvias (123456, password, etc.).

**RN-02: Control de roles**
El sistema soporta dos roles: `admin` y `client`. El rol `admin` tiene acceso irrestricto a todas las funcionalidades, incluyendo la configuración del sistema, los logs de monitoreo y todos los documentos de todos los usuarios. El rol `client` solo puede acceder a sus propios repositorios y documentos. La promoción de un usuario a administrador requiere acceso directo a la base de datos (no existe interfaz de gestión de usuarios para evitar prerrequisitos de seguridad innecesarios en esta fase).

**RN-03: Validación de formatos de archivo**
El sistema acepta exclusivamente archivos con extensión `.pdf`, `.docx` o `.txt`. La validación se realiza por: (a) extensión del archivo; (b) tipo MIME declarado; (c) en backend, verificación de la estructura interna del archivo (header bytes). Los archivos que no cumplan con estas validaciones son rechazados con un error HTTP 400 y un mensaje descriptivo.

**RN-04: Restricciones de tamaño**
El tamaño máximo de archivo permitido es 50 MB (52,428,800 bytes). Los archivos que excedan este límite son rechazados antes de iniciar el procesamiento. La interfaz debe mostrar una validación en tiempo real antes de la carga.

**RN-05: Aislamiento por propietario**
Cada usuario solo puede acceder a los repositorios y documentos que él ha creado. Las consultas de listado filtran automáticamente por `owner_id`. La eliminación de documentos y repositorios está sujeta a esta restricción. El administrador tiene acceso total a todos los recursos sin restricción de propietario.

**RN-06: Unicidad de repositorios**
No se permiten dos repositorios con el mismo nombre para un mismo usuario. El intento de crear un repositorio con un nombre duplicado retorna un error HTTP 400. Los nombres de repositorios de diferentes usuarios pueden ser idénticos.

**RN-07: Comportamiento de la IA sin clave API**
Cuando no se proporciona una clave de API de OpenAI (OPENAI_API_KEY vacía o no configurada), el sistema opera en "modo demo": la clasificación, el resumen y la extracción de campos se realizan mediante algoritmos basados en reglas y palabras clave; el chat responde concatenando fragmentos recuperados de los documentos indexados sin generar texto nuevo; los embeddings se generan mediante un hash determinístico local (no semántico).

**RN-08: Persistencia de configuración**
Los parámetros de configuración (chunk_size, chunk_overlap, modelos) se almacenan en la tabla `system_config` y se aplican de forma persistente. Los valores por defecto se establecen al crear la base de datos y pueden ser modificados por el administrador en cualquier momento.

**RN-09: Gestión de errores no críticos**
Los errores de procesamiento de un documento individual (extracción fallida, clasificación no disponible, campos no extraíbles) NO detienen el procesamiento de otros documentos ni afectan la disponibilidad del sistema. El documento se marca con estado "failed" y se registra el error en la tabla `error_logs` para diagnóstico.

**RN-10: Extracción condicional de campos**
La extracción de campos estructurados solo se realiza para documentos clasificados en categorías específicas (académico, técnico, legal, administrativo). Los documentos clasificados como "general" no generan extracciones de campos, ya que no se dispone de plantillas de extracción aplicables.

---

## 8. HISTORIAS DE USUARIO

### HU-01: Registro de usuario

**Como** visitante del sistema,
**quiero** poder registrarme con mi correo electrónico y una contraseña segura,
**para** poder acceder a las funcionalidades de gestión documental del sistema.

**Criterios de aceptación:**
1. El formulario de registro solicita email y contraseña con confirmación.
2. La contraseña debe tener mínimo 12 caracteres con complejidad requerida.
3. El registro exitoso crea el usuario con rol "client" y retorna token JWT.
4. El usuario es redirigido al dashboard inmediatamente tras el registro.
5. Si el email ya existe, se muestra el mensaje "El correo ya está registrado".
6. Si la contraseña no cumple la política, se muestra un mensaje descriptivo.

### HU-02: Inicio de sesión

**Como** usuario registrado,
**quiero** iniciar sesión con mi correo y contraseña,
**para** acceder a mi panel personal de gestión documental.

**Criterios de aceptación:**
1. El formulario solicita correo electrónico y contraseña.
2. Las credenciales correctas retornan token JWT y redirigen al dashboard.
3. Las credenciales incorrectas muestran "Correo o contraseña incorrectos" (sin especificar cuál falla).
4. El token se almacena localmente y se envía en todas las solicitudes posteriores.
5. El usuario puede ver su nombre/rol en el encabezado de la interfaz.

### HU-03: Creación de repositorio

**Como** usuario cliente,
**quiero** crear repositorios con nombre descriptivo,
**para** organizar mis documentos por tema, proyecto o categoría.

**Criterios de aceptación:**
1. El formulario solicita un nombre para el repositorio.
2. El nombre debe ser único entre los repositorios del usuario.
3. La creación exitosa muestra el repositorio en la lista con contador en 0.
4. Si el nombre ya existe, se muestra "Ya tienes un repositorio con ese nombre".
5. El repositorio se crea con fecha/hora actual y contador de documentos en 0.

### HU-04: Subida de documentos

**Como** usuario cliente,
**quiero** subir documentos arrastrándolos o seleccionándolos,
**para** que el sistema los procese y me proporcione información relevante.

**Criterios de aceptación:**
1. Se aceptan archivos PDF, DOCX y TXT.
2. Se rechazan archivos de otros formatos con mensaje "Formato no soportado".
3. Se rechazan archivos mayores a 50 MB con mensaje "El archivo supera el tamaño máximo".
4. La interfaz muestra drag-and-drop y botón de selección.
5. Se muestra barra de progreso durante la carga.
6. Tras la carga, el sistema procesa automáticamente y muestra el documento con estado "indexed".

### HU-05: Consulta de resumen

**Como** usuario cliente,
**quiero** ver un resumen del contenido de cada documento,
**para** entender rápidamente de qué trata sin leer el documento completo.

**Criterios de aceptación:**
1. El resumen es visible en la vista de detalle del documento.
2. El resumen tiene entre 100 y 500 caracteres.
3. El resumen refleja fielmente el contenido del documento.
4. Si el documento no tiene texto extraíble, se muestra "Resumen no disponible".

### HU-06: Búsqueda de documentos

**Como** usuario cliente,
**quiero** buscar documentos por palabras clave,
**para** encontrar rápidamente documentos relevantes entre todos los míos.

**Criterios de aceptación:**
1. Se ingresa una o más palabras clave en un campo de búsqueda.
2. Los resultados muestran documentos que contienen las palabras en su texto extraído.
3. Cada resultado incluye: nombre del documento, fragmento de contexto resaltado y puntuación.
4. Los resultados se ordenan por relevancia (número de coincidencias descendente).
5. Si no hay resultados, se muestra "No se encontraron documentos para su búsqueda".

### HU-07: Chat con IA

**Como** usuario cliente,
**quiero** hacer preguntas en lenguaje natural sobre mis documentos,
**para** obtener respuestas precisas sin tener que buscar manualmente.

**Criterios de aceptación:**
1. Se ingresa una pregunta en un campo de texto.
2. El sistema recupera los fragmentos más relevantes de los documentos indexados.
3. Se retorna una respuesta coherente basada en los fragmentos recuperados.
4. Se muestran las fuentes (documentos y fragmentos) utilizados para la respuesta.
5. Si no hay información relevante, se muestra "No encontré información relacionada".

### HU-08: Visualización de dashboard

**Como** usuario autenticado,
**quiero** ver un panel con métricas clave de mi gestión documental,
**para** tener visibilidad sobre el estado y uso de mis documentos.

**Criterios de aceptación:**
1. El dashboard muestra: total de documentos, procesados, fallidos, por categoría.
2. Las métricas se actualizan al cargar la página.
3. El dashboard muestra estimación de tiempo ahorrado por la automatización.
4. Los colores y gráficos reflejan visualmente el estado de los documentos.

---

## 9. CASOS DE USO

### UC-01: Registrar usuario nuevo

**Nombre:** Registrar usuario nuevo
**ID:** UC-01
**Actor principal:** Visitante (no autenticado)
**Precondiciones:** El visitante no tiene cuenta en el sistema.
**Postcondiciones:** Se crea un usuario con rol "client" y se retorna token JWT.
**Flujo principal:**
1. El visitante accede a la pantalla de registro.
2. El sistema muestra formulario con campos: email, contraseña, confirmar contraseña.
3. El visitante completa los campos y envía el formulario.
4. El sistema valida: formato de email válido, contraseña ≥12 caracteres con complejidad, confirmación coincide.
5. El sistema verifica que el email no exista en la base de datos.
6. El sistema hashea la contraseña con bcrypt (12 rondas).
7. El sistema crea el usuario con rol "client" y fecha/hora actual.
8. El sistema genera token JWT con id, email, rol y expiración de 24h.
9. El sistema retorna token y datos del usuario.
10. El frontend almacena token en localStorage y redirige al dashboard.

**Flujos alternativos:**
- 4a. Email inválido → Error 422 "Formato de correo inválido".
- 4b. Contraseña <12 caracteres → Error 422 "La contraseña debe tener mínimo 12 caracteres".
- 5a. Email ya existe → Error 409 "El correo ya está registrado".

### UC-02: Iniciar sesión

**Nombre:** Iniciar sesión
**ID:** UC-02
**Actor principal:** Usuario registrado
**Precondiciones:** El usuario tiene una cuenta activa en el sistema.
**Postcondiciones:** El usuario accede a su panel personal.
**Flujo principal:**
1. El usuario accede a la pantalla de login.
2. El sistema muestra formulario con email y contraseña.
3. El usuario ingresa sus credenciales y envía el formulario.
4. El sistema busca el usuario por email.
5. El sistema verifica la contraseña contra el hash bcrypt almacenado.
6. El sistema genera token JWT con id, email, rol y expiración de 24h.
7. El sistema retorna token y datos del usuario.
8. El frontend almacena token y redirige al dashboard.

**Flujos alternativos:**
- 4a. Usuario no encontrado → Error 401 "Correo o contraseña incorrectos".
- 5a. Contraseña incorrecta → Error 401 "Correo o contraseña incorrectos".

### UC-03: Subir y procesar documento

**Nombre:** Subir y procesar documento
**ID:** UC-03
**Actor principal:** Usuario cliente
**Precondiciones:** El usuario está autenticado y tiene al menos un repositorio.
**Postcondiciones:** El documento se almacena, procesa y clasifica automáticamente.
**Flujo principal:**
1. El usuario selecciona un repositorio o crea uno nuevo.
2. El usuario arrastra un archivo sobre el área de carga o selecciona por diálogo.
3. El frontend valida: formato aceptado (PDF/DOCX/TXT), tamaño ≤50 MB.
4. El usuario confirma la carga.
5. El frontend envía multipart/form-data con el archivo y repository_id.
6. El backend valida formato, tamaño y propietario del repositorio.
7. El backend almacena el archivo en disco (o IndexedDB en modo cliente).
8. El backend ejecuta el pipeline de procesamiento:
   a. Extracción de texto (PyPDF2/python-docx/FileReader).
   b. Clasificación por keywords (académico/técnico/legal/administrativo/general).
   c. Generación de resumen (primeras 3 oraciones).
   d. Extracción de campos estructurados (según categoría).
   e. Generación de embedding (hash local o API OpenAI).
9. El backend actualiza el documento con estado "indexed" y todos los metadatos.
10. El backend retorna el documento procesado.
11. El frontend actualiza la lista de documentos.

**Flujos alternativos:**
- 3a. Formato no aceptado → Error 400 "Formato no soportado. Use PDF, TXT o DOCX".
- 3b. Archivo >50 MB → Error 400 "El archivo supera el tamaño máximo de 50 MB".
- 8a. Error en extracción → Estado "failed", error registrado en error_logs.

### UC-04: Consultar detalle de documento

**Nombre:** Consultar detalle de documento
**ID:** UC-04
**Actor principal:** Usuario cliente
**Precondiciones:** El usuario tiene al menos un documento procesado.
**Postcondiciones:** El usuario visualiza la información completa del documento.
**Flujo principal:**
1. El usuario hace clic en un documento de la lista.
2. El frontend solicita el detalle del documento (`GET /api/documents/{id}`).
3. El backend retorna: metadatos, resumen, categoría, estado, extracciones, preview.
4. El frontend muestra: nombre, tamaño, tipo, categoría, resumen, campos extraídos, vista previa.
5. Si el documento es PDF, el frontend muestra el visor de PDF integrado.

**Flujos alternativos:**
- 2a. Documento no encontrado → Error 404 "Documento no encontrado".
- 2a. Documento de otro usuario → Error 404 "Documento no encontrado" (no revela existencia).

### UC-05: Buscar documentos por keywords

**Nombre:** Buscar documentos por keywords
**ID:** UC-05
**Actor principal:** Usuario cliente
**Precondiciones:** El usuario tiene documentos procesados con texto extraído.
**Postcondiciones:** El usuario visualiza resultados relevantes de su búsqueda.
**Flujo principal:**
1. El usuario ingresa palabras clave en el campo de búsqueda.
2. El frontend envía la consulta al endpoint de búsqueda (`GET /api/chat/search?q=...`).
3. El backend busca coincidencias en el texto extraído de los documentos del usuario.
4. Para cada coincidencia, el backend genera un fragmento de contexto (50-150 chars).
5. El backend calcula puntuación de relevancia (número de coincidencias).
6. El backend retorna resultados ordenados por relevancia.
7. El frontend muestra: nombre del documento, fragmento resaltado, puntuación.

**Flujos alternativos:**
- 3a. Sin resultados → Respuesta "No se encontraron documentos para su búsqueda".

### UC-06: Consultar el chat de IA

**Nombre:** Consultar el chat de IA
**ID:** UC-06
**Actor principal:** Usuario cliente
**Precondiciones:** El usuario tiene documentos procesados con texto extraído.
**Postcondiciones:** El usuario recibe una respuesta basada en el contenido de sus documentos.
**Flujo principal:**
1. El usuario escribe una pregunta en el campo de chat.
2. El frontend envía la pregunta al endpoint (`POST /api/chat/` con `{ message }`).
3. El backend normaliza la consulta (minúsculas, sin acentos).
4. El backend recupera los fragmentos más relevantes de los documentos del usuario.
5. Si hay coincidencias, el backend construye una respuesta con los fragmentos.
6. El backend registra la operación en ai_logs (tipo, tokens, tiempo).
7. El backend retorna: respuesta, fuentes, chunks_retrieved, tiempo de respuesta.
8. El frontend muestra la respuesta y las fuentes consultadas.

**Flujos alternativos:**
- 4a. Sin coincidencias → Respuesta "No encontré información relacionada en tu repositorio".
- 4b. Modo IA con clave API → Se genera respuesta mediante GPT-3.5/GPT-4 con los fragmentos como contexto.

---

## 10. MATRIZ DE TRAZABILIDAD INICIAL Y ANÁLISIS DE RIESGOS

### 10.1 Matriz de trazabilidad RF → HU

| Requisito funcional | Historia de usuario | Caso de uso |
|---|---|---|
| RF-01 Registro | HU-01 | UC-01 |
| RF-02 Autenticación | HU-02 | UC-02 |
| RF-03 Perfil | HU-02 | UC-02 |
| RF-04 Crear repositorio | HU-03 | UC-03 |
| RF-05 Listar repositorios | HU-03 | UC-03 |
| RF-06 Editar repositorio | HU-03 | UC-03 |
| RF-07 Eliminar repositorio | HU-03 | UC-03 |
| RF-08 Carga de documentos | HU-04 | UC-03 |
| RF-09 Listar documentos | HU-04, HU-06 | UC-03, UC-05 |
| RF-10 Detalle de documento | HU-05 | UC-04 |
| RF-11 Descarga de documento | HU-05 | UC-04 |
| RF-12 Eliminar documento | HU-04 | UC-03 |
| RF-13 Estadísticas | HU-08 | — |
| RF-14 Clasificación automática | HU-04, HU-05 | UC-03, UC-04 |
| RF-15 Generación de resúmenes | HU-05 | UC-04 |
| RF-16 Extracción de campos | HU-05 | UC-04 |
| RF-17 Búsqueda por keywords | HU-06 | UC-05 |
| RF-18 Chat de IA | HU-07 | UC-06 |
| RF-19 Logs de errores | — | — |
| RF-20 Logs de IA | — | — |
| RF-21 Configuración | — | — |
| RF-22 Salud del sistema | — | — |
| RF-23 Interfaz responsiva | HU-01..HU-08 | UC-01..UC-06 |
| RF-24 Drag-and-drop | HU-04 | UC-03 |
| RF-25 Visor PDF | HU-05 | UC-04 |

### 10.2 Análisis de riesgos del proyecto

| ID | Riesgo | Categoría | Probabilidad | Impacto | Nivel | Plan de mitigación |
|---|---|---|---|---|---|---|
| R1 | Python no instalado en la máquina del usuario | Técnico | Alta | Alto | Crítico | Implementar modo cliente JS puro (localStorage/IndexedDB) como alternativa funcional completa. Documentar instalación de Python en manual técnico. |
| R2 | Ausencia de clave API de OpenAI | Técnico | Alta | Medio | Alto | Modo demo con algoritmos basados en reglas. Chat por keywords sin LLM. Clasificación por palabras clave. Documentar configuración de API key en manual. |
| R3 | Incompatibilidad de versiones de librerías (passlib+bcrypt) | Técnico | Media | Alto | Alto | Eliminar passlib, usar bcrypt directamente. Fijar versiones en requirements.txt. Tests automatizados de compatibilidad. |
| R4 | Baja precisión de clasificación por keywords | IA | Media | Medio | Medio | Umbral configurable. Capacidad de recategorización manual (futura). Monitoreo de precisión en dashboard. Ampliar vocabulario de keywords. |
| R5 | Fragmentación de archivos muy largos (>100 páginas) | Técnico | Baja | Medio | Bajo | chunk_size configurable (por defecto 512 caracteres). División por oraciones. Paginación del texto extraído. |
| R6 | Pérdida de datos en almacenamiento local (localStorage) | Operativo | Media | Alto | Alto | Backup automático a IndexedDB para archivos. Persistencia en base de datos para modo servidor. Instrucciones de exportación de datos en manual. |
| R7 | Escalabilidad limitada del modo demo (sin base vectorial) | IA | Alta | Medio | Alto | Búsqueda por keywords funciona para volúmenes moderados. Para volúmenes altos, migrar a base de datos vectorial (ChromaDB, Pinecone). Documentar ruta de migración. |
| R8 | Alcance excesivo (scope creep) en funcionalidades de IA | Operativo | Media | Alto | Alto | Definir alcance claro en documento de análisis. Priorizar funcionalidades core. Futuras versiones pueden incorporar NER, traducción, OCR. |
| R9 | Seguridad de credenciales en entorno de desarrollo | Seguridad | Alta | Alto | Alto | Variables de entorno en .env (nunca en código). .gitignore para .env. SECRET_KEY generada aleatoriamente. Reviews de código antes de commits. |
| R10 | Rendimiento de extracción de texto de PDFs escaneados | Técnico | Media | Bajo | Bajo | Fuera de alcance (excluido en 3.2). Documentar como limitación conocida. Evaluar integración de OCR (Tesseract) en futuras versiones. |

---

**FIN DEL DOCUMENTO DE ANÁLISIS DE REQUISITOS — FASE 01**
