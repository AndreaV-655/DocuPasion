# DocuPasion

Sistema Inteligente de Gestion Documental con IA (RAG). Sube documentos (PDF, TXT, DOCX), el sistema los clasifica, genera resumen, extrae informacion relevante y responde preguntas basadas en su contenido.

## Como arrancar (version JS, sin servidor)

1. Abre `frontend\index.html` en tu navegador (doble clic). 
2. Usuario administrador inicial: `admin@docupasion.com` / `Admin123456!`

Todo corre en el navegador:

- Los datos se guardan en **localStorage** y los archivos subidos en **IndexedDB** (persisten al recargar).
- La extraccion de texto usa **pdf.js** (PDF), **mammoth** (DOCX) y **FileReader** (TXT), todo incluido en `frontend\vendor\`.
- Clasificacion por palabras clave, resumen, extraccion de campos, busqueda y chat (modo demo) se ejecutan completamente en JavaScript.
- La app funciona **sin internet** (librerias locales + service worker `sw.js`).


## Estructura del codigo

```
frontend/
  index.html    # SPA (abrir este archivo directamente)
  css/ js/      # Estilos y logica (api.js = API 100% client-side)
  vendor/       # Librerias locales: pdf.js, mammoth, lucide (sin internet)
  sw.js         # Service worker (cache offline)
backend/        # Version servidor (FastAPI + SQLAlchemy + MySQL/SQLite)
  app/          # api, core (JWT+bcrypt), models, services
  sql/          # Esquema MySQL (phpMyAdmin)
  start_server.bat
```

## Notas

- La contraseña debe tener como minimo **12 caracteres**.
- Sin clave de IA, el chat responde en modo demo sobre el contenido indexado.
