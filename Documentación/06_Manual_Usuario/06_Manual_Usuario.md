# Manual de Usuario

## Sistema Inteligente de Gestión y Análisis Documental — DocuPasion

**Versión:** 2.0
**Fecha:** Septiembre 2025
**Universidad UTS — Tecnología en Desarrollo de Software**

---

## 1. Bienvenida

Bienvenido a **DocuPasion**, su sistema inteligente de gestión documental. Esta guía le acompañará paso a paso para aprovechar al máximo todas las funcionalidades del sistema: desde el registro inicial hasta la utilización del chat inteligente para consultar sus documentos.

DocuPasion está diseñado para profesionales, estudiantes y equipos de trabajo que necesitan organizar, procesar y consultar grandes volúmenes de documentos de forma eficiente. El sistema utiliza inteligencia artificial para clasificar automáticamente sus documentos, generar resúmenes ejecutivos, extraer campos relevantes y responder preguntas en lenguaje natural sobre el contenido de sus archivos.

### 1.1 ¿Qué puede hacer DocuPasion?

- **Organizar** sus documentos en repositorios temáticos (por proyecto, materia, cliente, etc.).
- **Subir** archivos en formato PDF, DOCX y TXT con procesamiento automático instantáneo.
- **Clasificar** documentos en categorías (académico, técnico, legal, administrativo) sin intervención manual.
- **Obtener resúmenes** ejecutivos de cada documento procesado,Ahorrando tiempo de lectura.
- **Extraer** campos relevantes como autor, institución, fechas, presupuestos y palabras clave.
- **Buscar** documentos por palabras clave en su contenido completo, no solo por nombre.
- **Preguntar** en lenguaje natural al chat inteligente y obtener respuestas basadas en sus documentos.
- **Visualizar** un panel de indicadores con métricas de su gestión documental.
- **Funcionar sin internet** después de la primera carga, gracias al modo offline.

### 1.2 ¿Qué necesita para empezar?

- Un navegador web moderno: Google Chrome, Mozilla Firefox, Microsoft Edge o Safari.
- Archivos en formato PDF, DOCX o TXT que desea gestionar.
- No se requiere instalación de ningún software adicional.

---

## 2. Primeros Pasos

### 2.1 Acceso al sistema

Para acceder a DocuPasion, siga estos pasos:

1. Localice el archivo `index.html` dentro de la carpeta `frontend` del proyecto.
2. Haga doble clic en el archivo. Se abrirá automáticamente en su navegador web.
3. Se mostrará la pantalla de inicio de sesión.

Si es la primera vez que accede al sistema, las credenciales por defecto son:

| Campo | Valor |
|---|---|
| Correo electrónico | admin@docupasion.com |
| Contraseña | Admin123456! |

> **Nota importante:** La contraseña tiene un mínimo de 12 caracteres por razones de seguridad. Asegúrese de escribir exactamente `Admin123456!` (con la "A" mayúscula, los números y el signo de exclamación al final).

4. Ingrese el correo electrónico en el primer campo.
5. Ingrese la contraseña en el segundo campo.
6. Haga clic en el botón **"Iniciar sesión"**.
7. Será redirigido al panel principal (Dashboard).

### 2.2 Registro de nuevo usuario

Si desea crear una cuenta personal (distinta del administrador):

1. En la pantalla de inicio de sesión, haga clic en el enlace **"Regístrate aquí"** ubicado debajo del formulario.
2. Se mostrará el formulario de registro.
3. Ingrese su correo electrónico válido (por ejemplo: usuario@correo.com).
4. Ingrese una contraseña que cumpla con las siguientes reglas:
   - Mínimo 12 caracteres.
   - Al menos una letra mayúscula.
   - Al menos una letra minúscula.
   - Al menos un número.
   - Al menos un carácter especial (!@#$%^&*).
5. Confirme la contraseña escribiéndola nuevamente.
6. Haga clic en **"Registrarse"**.
7. Será redirigido automáticamente al Dashboard con su nueva cuenta.

> **Ejemplo de contraseña válida:** MiClave2025!Segura (18 caracteres, cumple todas las reglas)

### 2.3 Conocer el Dashboard

Una vez que inicie sesión, verá el panel principal (Dashboard) que contiene:

**Tarjetas de métricas (parte superior):**
- **Total documentos:** Número total de documentos que ha cargado en el sistema.
- **Procesados:** Documentos que fueron procesados exitosamente (estado "indexed").
- **Fallidos:** Documentos que tuvieron errores durante el procesamiento.
- **Tiempo ahorrado:** Estimación del tiempo que el sistema le ha ahorrado en revisión manual.

**Gráficos de distribución (parte inferior):**
- **Por categoría:** Muestra cuántos documentos tiene en cada categoría (académico, técnico, legal, administrativo, general).
- **Por estado:** Muestra la distribución de documentos procesados vs. fallidos.

El Dashboard se actualiza automáticamente cada vez que carga la página o realiza una acción (subir, eliminar documentos).

---

## 3. Gestión de Repositorios

Los repositorios son carpetas virtuales donde organiza sus documentos. Puede crear tantos repositorios como necesite, y cada uno puede contener múltiples documentos.

### 3.1 Crear un repositorio

1. En el menú lateral izquierdo, haga clic en **"Repositorios"**.
2. Haga clic en el botón **"Nuevo repositorio"** (ubicado en la parte superior de la lista).
3. Se mostrará un diálogo solicitando el nombre del repositorio.
4. Escriba un nombre descriptivo. Ejemplos:
   - "Tesis de Grado"
   - "Contratos 2025"
   - "Documentación Técnica del Proyecto"
   - "Manuales y Guías"
5. Haga clic en **"Crear"**.
6. El repositorio aparecerá en la lista con contador de documentos en 0.

> **Regla importante:** No puede crear dos repositorios con el mismo nombre. Si intenta crear un repositorio con un nombre que ya existe, el sistema mostrará el mensaje "Ya existe un repositorio con ese nombre".

### 3.2 Ver la lista de repositorios

1. En el menú lateral, haga clic en **"Repositorios"**.
2. Se mostrará la lista de todos sus repositorios.
3. Para cada repositorio verá:
   - **Nombre** del repositorio.
   - **Número de documentos** que contiene.
   - **Fecha de creación**.
4. Los repositorios se muestran ordenados por fecha de creación (los más recientes primero).

### 3.3 Renombrar un repositorio

1. En la lista de repositorios, haga clic en el ícono de **editar** (lápiz) junto al nombre del repositorio.
2. Escriba el nuevo nombre.
3. Haga clic en **"Guardar"**.

### 3.4 Eliminar un repositorio

1. En la lista de repositorios, haga clic en el ícono de **eliminar** (papelera) junto al repositorio.
2. El sistema le pedirá confirmación.
3. Haga clic en **"Eliminar"** para confirmar.

> **Precaución:** Solo puede eliminar un repositorio si está vacío (no tiene documentos). Si el repositorio contiene documentos, primero debe eliminar o mover todos los documentos antes de eliminar el repositorio.

---

## 4. Gestión de Documentos

### 4.1 Subir documentos

1. Haga clic en el repositorio donde desea subir documentos.
2. Verá un área de carga con el mensaje "Arrastra archivos aquí o haz clic para seleccionar".
3. **Opción A — Arrastrar y soltar:**
   - Abra la carpeta de su computadora donde tiene el archivo.
   - Arrastre el archivo sobre el área de carga del navegador.
   - Suelte el archivo. El sistema comenzará a procesarlo automáticamente.
4. **Opción B — Selección manual:**
   - Haga clic en el área de carga.
   - Se abrirá el diálogo de selección de archivos de su sistema operativo.
   - Navegue hasta la ubicación del archivo y selecciónelo.
   - Haga clic en "Abrir".
5. Verá una barra de progreso indicando que el archivo se está cargando y procesando.
6. Cuando la barra desaparezca y el documento aparezca en la lista, el proceso está completo.

**Formatos aceptados:**

| Formato | Extensión | Descripción |
|---|---|---|
| PDF | .pdf | Documentos portátiles (texto digital, no escaneados) |
| DOCX | .docx | Documentos de Microsoft Word (formato moderno) |
| TXT | .txt | Archivos de texto plano |

**Tamaño máximo:** 50 megabytes (50 MB) por archivo.

**Formatos NO aceptados:** Imágenes (JPG, PNG, GIF), hojas de cálculo (XLSX), presentaciones (PPTX), archivos comprimidos (ZIP, RAR), ejecutables (EXE), etc. Si intenta cargar un formato no aceptado, el sistema mostrará el error "Formato no soportado. Use PDF, TXT o DOCX."

### 4.2 Lo que sucede después de subir un documento

Cuando usted sube un documento, el sistema ejecuta automáticamente un pipeline de procesamiento:

1. **Extracción de texto:** El sistema lee el contenido textual del archivo.
   - Para PDF: extrae el texto digital del documento.
   - Para DOCX: lee el contenido de los párrafos.
   - Para TXT: lee el contenido del archivo directamente.

2. **Clasificación automática:** El sistema analiza el texto y clasifica el documento en una de las siguientes categorías:
   - **Académico:** Documentos de investigación, tesis, artículos académicos.
   - **Técnico:** Documentos de ingeniería, especificaciones, manuales técnicos.
   - **Legal:** Contratos, cláusulas, documentos con valor legal.
   - **Administrativo:** Actas, informes, reportes de gestión.
   - **General:** Documentos que no encajan claramente en las categorías anteriores.

3. **Generación de resumen:** El sistema selecciona las oraciones más representativas del documento y genera un resumen ejecutivo de máximo 500 caracteres.

4. **Extracción de campos:** Según la categoría, el sistema extrae campos específicos:
   - Académico: autor, institución, palabras clave, año, email.
   - Técnico: requisitos, arquitectura, tecnologías.
   - Legal: partes, cláusulas, vigencia, fechas.
   - Administrativo: asistentes, acuerdos, fechas.

5. **Indexación:** El documento se marca como "indexed" (procesado) y queda disponible para búsqueda y chat.

Si el procesamiento falla (por ejemplo, si el archivo está corrupto o es un PDF escaneado como imagen), el documento se marca como "failed" pero permanece en el sistema. Puede revisar el error en la sección de monitoreo.

### 4.3 Ver la lista de documentos

1. Haga clic en un repositorio para ver sus documentos.
2. Se mostrará la lista de todos los documentos del repositorio.
3. Para cada documento verá:
   - **Nombre** del archivo.
   - **Categoría** asignada (académico, técnico, etc.).
   - **Estado** (indexed = procesado, failed = error).
   - **Resumen** ejecutivo (vista previa).
   - **Fecha de carga**.
4. Puede **filtrar** la lista:
   - Por categoría: seleccione una categoría en el filtro superior.
   - Por estado: seleccione "indexed", "processing" o "failed".

### 4.4 Ver el detalle de un documento

1. En la lista de documentos, haga clic en el nombre del documento que desea consultar.
2. Se abrirá una vista detallada que incluye:

**Información general:**
- Nombre del archivo original.
- Tamaño del archivo.
- Tipo de formato (PDF, DOCX, TXT).
- Categoría asignada.
- Estado de procesamiento.
- Fecha de carga.

**Resumen ejecutivo:**
- Una síntesis del contenido del documento en 1-3 oraciones.

**Campos extraídos:**
- Una tabla con los campos relevantes extraídos del documento (según su categoría).

**Vista previa del texto:**
- Los primeros caracteres del texto extraído del documento.

**Visor de PDF (solo para documentos PDF):**
- Si el documento es un PDF, se muestra un visor integrado que le permite:
  - Navegar entre páginas.
  - Hacer zoom (acercar/alejar).
  - Ver el contenido sin descargar el archivo.

### 4.5 Descargar un documento original

1. En el detalle del documento, haga clic en el botón **"Descargar"**.
2. Se descargará el archivo original (PDF, DOCX o TXT) a su carpeta de descargas.

### 4.6 Eliminar un documento

1. En el detalle del documento, haga clic en el botón **"Eliminar"**.
2. El sistema le pedirá confirmación.
3. Haga clic en **"Eliminar"** para confirmar.
4. El documento y todos sus datos asociados (resumen, extracciones, logs) serán eliminados permanentemente.

> **Advertencia:** Esta acción no se puede deshacer. Asegúrese de tener una copia del archivo original antes de eliminar.

---

## 5. Búsqueda de Documentos

La función de búsqueda le permite encontrar rápidamente documentos por palabras clave en su contenido, no solo por nombre de archivo.

### 5.1 Realizar una búsqueda

1. En la barra de búsqueda ubicada en la parte superior de la interfaz, escriba una o más palabras clave.
2. Presione **Enter** o haga clic en el ícono de búsqueda (lupa).
3. El sistema mostrará los documentos que contengan esas palabras en su texto extraído.

### 5.2 Interpretar los resultados

Para cada resultado de búsqueda verá:

- **Nombre del documento:** El nombre original del archivo.
- **Fragmento de contexto:** Un extracto del texto donde se encontró la palabra clave, con la palabra resaltada.
- **Puntuación de relevancia:** Un número que indica cuántas veces aparece la palabra clave en el documento. Cuanto mayor sea el número, más relevante es el documento.

Los resultados se ordenan automáticamente por relevancia (de mayor a menor puntuación).

### 5.3 Consejos de búsqueda

- **Palabras específicas funcionan mejor:** "metodología de investigación" es más específico que solo "investigación".
- **La búsqueda no distingue mayúsculas/minúsculas:** "Tesis", "TESIS" y "tesis" producen los mismos resultados.
- **La búsqueda es insensible a acentos:** "metodologia" y "metodología" producen los mismos resultados.
- **Puede buscar nombres propios:** "Juan Perez", "Universidad Nacional".
- **Puede buscar fechas:** "2025", "2024".

---

## 6. Chat Inteligente

El chat inteligente le permite formular preguntas en lenguaje natural sobre el contenido de sus documentos y obtener respuestas coherentes.

### 6.1 Acceder al chat

1. En el menú lateral izquierdo, haga clic en **"Chat IA"**.
2. Se mostrará la interfaz de chat con un campo de texto en la parte inferior.

### 6.2 Hacer una pregunta

1. Escriba su pregunta en el campo de texto. Ejemplos:
   - "¿Cuál es la metodología utilizada en la tesis?"
   - "¿Qué presupuesto menciona el contrato?"
   - "¿Cuáles son los requisitos del sistema?"
   - "¿Quién es el autor del documento académico?"
   - "¿Cuál es la fecha de vigencia del contrato?"
2. Haga clic en el botón **"Enviar"** o presione **Enter**.
3. Espere unos segundos mientras el sistema procesa su consulta.
4. El sistema mostrará la respuesta en el área de mensajes.

### 6.3 Interpretar la respuesta

La respuesta del chat incluye:

- **Texto de respuesta:** La información encontrada en sus documentos, presentada de forma coherente.
- **Fuentes consultadas:** Los nombres de los documentos que fueron utilizados para generar la respuesta, junto con el fragmento de texto relevante.
- **Indicador de modo:** Si el sistema está en "modo demo" (sin clave de API de IA), la respuesta se construye concatenando fragmentos relevantes. Si tiene una clave de API configurada, la respuesta se genera mediante un modelo de inteligencia artificial.

### 6.4 Ejemplos de preguntas útiles

**Para documentos académicos:**
- "¿Cuál es el problema de investigación?"
- "¿Qué metodología se utilizó?"
- "¿Cuáles son las conclusiones principales?"
- "¿Qué palabras clave describe el autor?"

**Para documentos técnicos:**
- "¿Qué tecnologías se mencionan?"
- "¿Cuál es la arquitectura del sistema?"
- "¿Qué requisitos se describen?"

**Para documentos legales:**
- "¿Quiénes son las partes del contrato?"
- "¿Cuál es la jurisdicción aplicable?"
- "¿Cuándo vence el contrato?"

**Para documentos administrativos:**
- "¿Cuáles son los acuerdos de la reunión?"
- "¿Quién es el responsable designado?"
- "¿Cuál es el presupuesto aprobado?"

### 6.5 Limitaciones del chat

- El chat solo puede responder preguntas sobre documentos que usted ha subido y que fueron procesados exitosamente (estado "indexed").
- Si no encuentra información relevante, mostrará el mensaje "No encontré información relacionada en tu repositorio".
- Las respuestas más largas o complejas pueden requerir preguntas más específicas.
- El chat no puede responder preguntas que no estén en sus documentos (por ejemplo, "¿Qué tiempo hace mañana?").

---

## 7. Monitoreo (Solo Administradores)

La sección de monitoreo está disponible exclusivamente para usuarios con rol de administrador. Le permite supervisar el estado del sistema y diagnosticar problemas.

### 7.1 Acceder al monitoreo

1. Inicie sesión con credenciales de administrador.
2. En el menú lateral, haga clic en **"Monitoreo"**.

### 7.2 Dashboard de monitoreo

El panel de monitoreo muestra:

- **Total de errores:** Número total de errores registrados en el sistema.
- **Por nivel:** Distribución de errores por severidad (error, warning, info).
- **Por código:** Distribución por tipo de error (EXTRACTION_FAILED, etc.).
- **Logs recientes:** Lista de los últimos errores registrados, incluyendo:
  - Timestamp (fecha y hora del error).
  - Nivel de severidad.
  - Código del error.
  - Mensaje descriptivo.
  - Documento asociado (si aplica).

### 7.3 Logs de operaciones de IA

En la misma sección puede ver:

- **Operaciones realizadas:** Tipo de operación (clasificación, resumen, chat, etc.).
- **Tokens utilizados:** Cantidad de tokens consumidos (0 en modo demo).
- **Tiempo de procesamiento:** Duración de cada operación en milisegundos.

---

## 8. Configuración del Sistema (Solo Administradores)

La sección de configuración permite al administrador ajustar parámetros del sistema sin modificar código fuente.

### 8.1 Acceder a la configuración

1. Inicie sesión con credenciales de administrador.
2. En el menú lateral, haga clic en **"Configuración"**.

### 8.2 Parámetros disponibles

| Parámetro | Descripción | Valor por defecto |
|---|---|---|
| Modelo de LLM | Modelo de lenguaje para el chat (requiere API key) | gpt-4o-mini |
| Modelo de embeddings | Modelo para generar vectores de búsqueda | text-embedding-3-small |
| Tamaño de fragmentos | Cantidad de caracteres por fragmento para búsqueda RAG | 512 |
| Superposición de fragmentos | Caracteres de superposición entre fragmentos | 64 |

### 8.3 Modificar configuración

1. Modifique los valores deseados en los campos del formulario.
2. Haga clic en **"Guardar"**.
3. Los cambios se aplican inmediatamente a las operaciones futuras.

> **Nota:** Solo los administradores pueden acceder a esta sección. Los usuarios clientes no ven el enlace de configuración en el menú.

---

## 9. Modo Offline (Sin Internet)

Una de las características principales de DocuPasion es que funciona completamente sin conexión a internet. Esto significa que puede usar todas las funciones del sistema sin necesidad de Wi-Fi o datos móviles.

### 9.1 Cómo funciona el modo offline

1. **Primera carga:** La primera vez que abre `index.html`, el navegador descarga y almacena en caché todos los archivos necesarios (HTML, CSS, JavaScript, librerías).
2. **Uso posterior:** Una vez cacheados los archivos, el sistema funciona independientemente de la conexión a internet.
3. **Service Worker:** Un componente técnico llamado "Service Worker" se encarga de interceptar las peticiones del navegador y servir los archivos desde la caché local.

### 9.2 Persistencia de datos

- **Datos estructurados** (usuarios, repositorios, documentos, configuración): Se almacenan en **localStorage** del navegador.
- **Archivos binarios** (PDFs, DOCXs, TXTs): Se almacenan en **IndexedDB** del navegador.
- Los datos persisten al cerrar y volver a abrir el navegador.
- Los datos se mantienen en el mismo navegador/dispositivo donde se crearon.

### 9.3 Precauciones importantes

- **No borre los datos de navegación:** Si limpia la caché o los datos del sitio web de DocuPasion, perderá todos sus documentos y configuraciones.
- **No cambie de navegador:** Los datos almacenados en Chrome no están disponibles en Firefox, y viceversa.
- **No cambie de dispositivo:** Los datos de su computadora no se sincronizan con su teléfono.
- **Para datos críticos:** Si necesita acceder a sus documentos desde múltiples dispositivos, considere usar el modo servidor (con FastAPI) que almacena los datos en una base de datos centralizada.

---

## 10. Solución de Problemas Comunes

| Problema | Causa probable | Solución |
|---|---|---|
| El botón de "Iniciar sesión" queda girando | Error de conexión o credenciales incorrectas | Verifique su correo y contraseña. Si persiste, recargue la página (F5). |
| "Formato no soportado" al subir archivo | El archivo no es PDF, DOCX o TXT | Convierta el archivo a uno de los formatos aceptados. |
| "El archivo supera el tamaño máximo" | El archivo pesa más de 50 MB | Comprima el archivo o divida el contenido en varios archivos más pequeños. |
| Documento muestra estado "failed" | Error durante la extracción de texto | El PDF puede ser una imagen escaneada. Use un PDF con texto digital. |
| Chat responde "No encontré información" | La palabra clave no aparece en ningún documento | Intente con sinónimos o palabras más generales. Verifique que los documentos estén en estado "indexed". |
| El dashboard muestra datos incorrectos | Los datos no se actualizaron | Recargue la página (F5). Los datos se actualizan al cargar. |
| No puedo eliminar un repositorio | El repositorio tiene documentos | Elimine primero todos los documentos del repositorio, luego elimine el repositorio. |
| La búsqueda no retorna resultados | Las palabras clave no coinciden con el texto | Intente con palabras diferentes. La búsqueda es insensible a acentos y mayúsculas. |
| El visor de PDF no muestra contenido | El PDF es una imagen escaneada | DocuPasion solo extrae texto de PDFs digitales, no de escaneos. |
| Los datos desaparecieron | Se limpiaron los datos de navegación | Lamentablemente los datos no se pueden recuperar. Use el modo servidor para datos críticos. |

---

## 11. Glosario de Términos

| Término | Definición |
|---|---|
| **Repositorio** | Carpeta virtual donde se agrupan documentos relacionados. |
| **Documento** | Archivo individual (PDF, DOCX, TXT) cargado al sistema. |
| **Categoría** | Etiqueta automática asignada al documento (académico, técnico, legal, administrativo, general). |
| **Resumen ejecutivo** | Síntesis automática del contenido del documento en 1-3 oraciones. |
| **Extracción** | Proceso de identificar y extraer campos específicos del documento (autor, fechas, etc.). |
| **Índice / Indexed** | Estado que indica que el documento fue procesado exitosamente y está disponible para búsqueda. |
| **Chunk / Fragmento** | Porción de texto del documento utilizada para la búsqueda y el chat. |
| **Embedding** | Representación vectorial del texto utilizada para búsquedas semánticas. |
| **RAG** | Retrieval-Augmented Generation. Técnica que combina recuperación de documentos con generación de respuestas. |
| **JWT** | JSON Web Token. Mecanismo de autenticación utilizado por el sistema. |
| **Service Worker** | Componente técnico que permite el funcionamiento offline. |
| **localStorage** | Almacenamiento local del navegador para datos estructurados. |
| **IndexedDB** | Base de datos del navegador para almacenar archivos grandes. |

---

**Fin del Manual de Usuario**
