/* eslint-disable */
// ===== DocuPasion - API 100% client-side (sin servidor) =====
// Almacena todo en localStorage + IndexedDB.  Sin dependencias de backend.

const DB_KEY = 'docupasion_db';
const FILE_DB = 'docupasion_files';
const FILE_STORE = 'blobs';

// ────────── helpers ──────────
function _hash(s) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 2654435761);
        h2 = Math.imul(h2 ^ c, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function _loadDB() {
    try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); }
    catch (_) { return {}; }
}
function _saveDB(db) { localStorage.setItem(DB_KEY, JSON.stringify(db)); }

function _nextId(db, col) {
    if (!db._seq) db._seq = {};
    db._seq[col] = (db._seq[col] || 0) + 1;
    return db._seq[col];
}

function _seed(db) {
    if (!db.users || !db.users.length) {
        db.users = [{ id: 1, email: 'admin@docupasion.com', passwordHash: String(_hash('Admin123456!')), role: 'admin', createdAt: new Date().toISOString() }];
    }
    var ALL_CATEGORIES = [
        { id: 1, name: 'académico', description: 'Documentos académicos e investigativos', isDefault: false },
        { id: 2, name: 'técnico', description: 'Documentos técnicos y de ingeniería', isDefault: false },
        { id: 3, name: 'legal', description: 'Documentos con valor legal o contractual', isDefault: false },
        { id: 4, name: 'administrativo', description: 'Documentos de gestión y administración', isDefault: false },
        { id: 5, name: 'general', description: 'Categoría por defecto', isDefault: true },
        { id: 6, name: 'contratos', description: 'Contratos y convenios (subcategoría de legal)', isDefault: false },
        { id: 7, name: 'hoja de vida', description: 'Hojas de vida y currículos (subcategoría de administrativo)', isDefault: false },
    ];
    if (!db.categories || !db.categories.length) {
        db.categories = ALL_CATEGORIES.map(function (c) { return Object.assign({}, c); });
    } else {
        var _maxCatId = db.categories.reduce(function (m, c) { return Math.max(m, c.id || 0); }, 0);
        var _addedCat = false;
        ALL_CATEGORIES.forEach(function (c) {
            if (!db.categories.some(function (x) { return x.name === c.name; })) {
                db.categories.push({ id: ++_maxCatId, name: c.name, description: c.description, isDefault: c.isDefault });
                _addedCat = true;
            }
        });
        if (_addedCat) { db._seq = db._seq || {}; db._seq.categories = db.categories.length; }
    }
    if (!db.repositories) db.repositories = [];
    if (!db.documents) db.documents = [];
    if (!db.aiLogs) db.aiLogs = [];
    if (!db.errorLogs) db.errorLogs = [];
    if (!db.config) db.config = { llm_model: 'gpt-4o-mini', chunk_size: 512, chunk_overlap: 64 };
    if (!db._seq) {
        db._seq = {
            users: db.users.length,
            repositories: db.repositories.length,
            documents: db.documents.length,
            categories: db.categories.length,
            aiLogs: db.aiLogs.length,
            errorLogs: db.errorLogs.length,
            extractions: 0,
        };
    } else {
        if (!db._seq.users && db.users.length) db._seq.users = db.users.length;
        if (!db._seq.repositories) db._seq.repositories = db.repositories.length;
        if (!db._seq.documents) db._seq.documents = db.documents.length;
        if (!db._seq.categories && db.categories.length) db._seq.categories = db.categories.length;
        if (!db._seq.aiLogs) db._seq.aiLogs = db.aiLogs.length;
        if (!db._seq.errorLogs) db._seq.errorLogs = db.errorLogs.length;
        if (!db._seq.extractions) db._seq.extractions = 0;
    }
    return db;
}

// ────────── IndexedDB para archivos ──────────
function _openFileDB() {
    return new Promise(function (ok, fail) {
        var r = indexedDB.open(FILE_DB, 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(FILE_STORE); };
        r.onsuccess = function () { ok(r.result); };
        r.onerror = function () { fail(r.error); };
    });
}
async function _saveFile(id, blob) {
    var db = await _openFileDB();
    var tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).put(blob, id);
    return new Promise(function (ok) { tx.oncomplete = ok; });
}
async function _getFile(id) {
    var db = await _openFileDB();
    var tx = db.transaction(FILE_STORE, 'readonly');
    var req = tx.objectStore(FILE_STORE).get(id);
    return new Promise(function (ok) { req.onsuccess = function () { ok(req.result); }; req.onerror = function () { ok(null); }; });
}
async function _delFile(id) {
    var db = await _openFileDB();
    var tx = db.transaction(FILE_STORE, 'readwrite');
    tx.objectStore(FILE_STORE).delete(id);
    return new Promise(function (ok) { tx.oncomplete = ok; });
}

// ────────── Extracción de texto (client-side) ──────────
async function _extractText(file) {
    var ext = (file.name || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return _extractPDF(file);
    if (ext === 'docx') return _extractDOCX(file);
    if (ext === 'txt') return _extractTXT(file);
    return null;
}

async function _extractPDF(file) {
    if (!window.pdfjsLib) return null;
    var buf = await file.arrayBuffer();
    var pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    var parts = [];
    for (var i = 0; i < pdf.numPages; i++) {
        var page = await pdf.getPage(i + 1);
        var tc = await page.getTextContent();
        parts.push(tc.items.map(function (it) { return it.str; }).join(' '));
    }
    return parts.join('\n') || null;
}

async function _extractDOCX(file) {
    if (!window.mammoth) return null;
    var buf = await file.arrayBuffer();
    var res = await mammoth.extractRawText({ arrayBuffer: buf });
    return res.value || null;
}

function _extractTXT(file) {
    return new Promise(function (ok) {
        var reader = new FileReader();
        reader.onload = function () { ok(reader.result || null); };
        reader.onerror = function () { ok(null); };
        reader.readAsText(file);
    });
}

// ────────── Clasificación y resumen (misma lógica del backend) ──────────
var _CAT_KW = {
    'académico': ['tesis','disertación','universidad','investigación','bibliografía','metodología','hipótesis','abstract','conclusión','ensayo','trabajo de grado','maestría','doctorado'],
    'técnico': ['software','código','arquitectura','base de datos','servidor','api','endpoints','deployment','docker','aws','cloud','implementación','framework','backend','frontend','programación','algoritmo','requisitos','modelo'],
    'legal': ['contrato','cláusula','ley','reglamento','norma','jurídico','firma','obligación','derecho','tribunal','demanda','resolución','decreto','arbitraje'],
    'administrativo': ['acta','reunión','comité','planificación','presupuesto','inventario','informe','reporte','directriz','estrategia','gestión','calidad','auditoría','protocolo'],
    'contratos': ['contrato','convenio','cláusula','partes','vigencia','términos y condiciones','acuerdo de confidencialidad','indemnización','obligaciones de las partes','objeto del contrato','duración','terminación','firma de','anexo','penalidades','renovación','prestación de servicios','acuerdo de licencia'],
    'hoja de vida': ['hoja de vida','currículum','curriculum vitae','perfil profesional','experiencia laboral','formación académica','educación','habilidades','competencias','referencias','logros','resumen profesional','aspiraciones salariales'],
};
// Subcategorías: una categoría de mayor jerarquía incluye a sus subcategorías
var _CAT_SUB = { 'legal': ['contratos'], 'administrativo': ['hoja de vida'] };
var _CAT_EXTRACT = {
    'académico': ['autor','tesis','director','institución','universidad','palabras clave','resumen'],
    'técnico': ['requisitos','arquitectura','tecnologías','stack','framework','base de datos','despliegue'],
    'legal': ['partes','firmante','contrato','cláusula','vigencia','jurisdicción'],
    'administrativo': ['comité','asistentes','acuerdos','compromisos','fecha','presupuesto','responsable','plazo'],
    'contratos': ['partes','cláusula','objeto','vigencia','duración','fecha de firma'],
    'hoja de vida': ['nombre','email','perfil profesional','experiencia laboral','formación académica'],
};

function _norm(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function _classify(filename, text) {
    var t = _norm(text);
    var scores = {};
    for (var cat in _CAT_KW) {
        scores[cat] = 0;
        _CAT_KW[cat].forEach(function (kw) { if (t.indexOf(_norm(kw)) !== -1) scores[cat]++; });
    }
    var best = 'general', bestS = 0;
    for (var c in scores) { if (scores[c] > bestS) { bestS = scores[c]; best = c; } }
    // Las subcategorías son más específicas que su categoría madre
    if (scores['contratos'] >= 2 && scores['contratos'] >= scores['legal']) return 'contratos';
    if (scores['hoja de vida'] >= 2 && scores['hoja de vida'] >= scores['administrativo']) return 'hoja de vida';
    return bestS > 2 ? best : 'general';
}

function _summarize(text, max) {
    max = max || 5;
    var s = (text || '').trim();
    if (!s) return '';
    var parts = s.split(/[.!?]+\s+/).filter(function (x) { return x.length > 20; });
    return parts.length ? parts.slice(0, max).join('. ') + '.' : s.slice(0, 300);
}

function _extractFields(text, type) {
    var fields = [], t = text || '';
    var years = (t.match(/\b(19|20)\d{2}\b/g) || []).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort();
    var emails = (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).filter(function (v, i, a) { return a.indexOf(v) === i; }).slice(0, 3);
    function findLine(re) {
        var lines = t.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i].trim();
            if (re.test(l)) return l.slice(0, 200);
        }
        return '';
    }
    if (type === 'académico') {
        fields.push({ field_name: 'año', field_value: years.join(', ') });
        fields.push({ field_name: 'autor', field_value: findLine(/autor/i) });
        fields.push({ field_name: 'institución', field_value: findLine(/universidad|institución/i) });
        fields.push({ field_name: 'palabras clave', field_value: findLine(/palabras clave/i) });
        fields.push({ field_name: 'email', field_value: emails.join(', ') });
    } else if (type === 'técnico') {
        fields.push({ field_name: 'requisitos', field_value: findLine(/requisitos/i) });
        fields.push({ field_name: 'arquitectura', field_value: findLine(/arquitectura/i) });
        fields.push({ field_name: 'tecnologías', field_value: findLine(/tecnologías|stack|framework/i) });
    } else if (type === 'legal') {
        fields.push({ field_name: 'partes', field_value: findLine(/contrato|acuerdo|partes/i) });
        fields.push({ field_name: 'cláusulas', field_value: findLine(/cláusula/i) });
        fields.push({ field_name: 'fechas', field_value: years.join(', ') });
        fields.push({ field_name: 'vigencia', field_value: findLine(/vigencia/i) });
    } else if (type === 'administrativo') {
        fields.push({ field_name: 'asistentes', field_value: findLine(/asistentes/i) });
        fields.push({ field_name: 'acuerdos', field_value: findLine(/acuerdos|compromisos/i) });
        fields.push({ field_name: 'fechas', field_value: years.join(', ') });
    } else if (type === 'contratos') {
        fields.push({ field_name: 'partes', field_value: findLine(/partes|entre|contrato/i) });
        fields.push({ field_name: 'objeto', field_value: findLine(/objeto del contrato|objeto/i) });
        fields.push({ field_name: 'cláusulas', field_value: findLine(/cláusula/i) });
        fields.push({ field_name: 'vigencia', field_value: findLine(/vigencia/i) });
        fields.push({ field_name: 'fechas', field_value: years.join(', ') });
    } else if (type === 'hoja de vida') {
        fields.push({ field_name: 'email', field_value: emails.join(', ') });
        fields.push({ field_name: 'perfil profesional', field_value: findLine(/perfil profesional/i) });
        fields.push({ field_name: 'experiencia laboral', field_value: findLine(/experiencia laboral/i) });
        fields.push({ field_name: 'formación académica', field_value: findLine(/formación académica|educación/i) });
        fields.push({ field_name: 'fechas', field_value: years.join(', ') });
    }
    return fields.filter(function (f) { return f.field_value; });
}

function _makeSnippet(text, needle, radius) {
    radius = radius || 120;
    var idx = text.toLowerCase().indexOf(needle.toLowerCase());
    if (idx === -1) return text.slice(0, 240);
    var s = Math.max(0, idx - radius), e = Math.min(text.length, idx + needle.length + radius);
    return text.slice(s, e).replace(/\n/g, ' ');
}

// ────────── Rutas de la API ──────────
function _matchSegs(segs, pat) {
    if (segs.length !== pat.length) return false;
    for (var i = 0; i < segs.length; i++) {
        if (pat[i] === ':id') { if (!/^\d+$/.test(segs[i])) return false; }
        else if (pat[i] !== segs[i]) return false;
    }
    return true;
}

async function _route(method, path, body) {
    var qIdx = path.indexOf('?');
    var pathname = qIdx === -1 ? path : path.slice(0, qIdx);
    var qs = new URLSearchParams(qIdx === -1 ? '' : path.slice(qIdx + 1));
    var segs = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    var db = _seed(_loadDB());

    // ── Auth ──
    if (method === 'GET' && _matchSegs(segs, ['api', 'auth', 'me'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        return { id: body._user.id, email: body._user.email, role: body._user.role };
    }
    if (method === 'POST' && _matchSegs(segs, ['api', 'auth', 'register'])) {
        var em = (body.email || '').trim().toLowerCase(), pw = body.password || '';
        if (!em || !pw) throw new APIError('Email y contraseña son requeridos', 422);
        if (pw.length < 12) throw new APIError('La contraseña debe tener al menos 12 caracteres', 422);
        if (db.users.some(function (u) { return u.email === em; })) throw new APIError('El email ya está registrado', 400);
        var nu = { id: _nextId(db, 'users'), email: em, passwordHash: String(_hash(pw)), role: 'client', createdAt: new Date().toISOString() };
        db.users.push(nu); _saveDB(db);
        return { id: nu.id, email: nu.email, role: nu.role, access_token: nu.email, token_type: 'bearer' };
    }
    if (method === 'POST' && _matchSegs(segs, ['api', 'auth', 'login'])) {
        var le = (body.username || '').trim().toLowerCase(), lp = body.password || '';
        var lu = db.users.find(function (u) { return u.email === le; });
        if (!lu || lu.passwordHash !== String(_hash(lp))) throw new APIError('Credenciales incorrectas', 401);
        return { access_token: lu.email, token_type: 'bearer' };
    }

    // ── Repositories ──
    if (method === 'GET' && _matchSegs(segs, ['api', 'repositories'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var uid = body._user.id;
        return db.repositories.filter(function (r) { return r.ownerId === uid; }).map(function (r) {
            var cnt = db.documents.filter(function (d) { return d.repositoryId === r.id && d.ownerId === uid; }).length;
            return { id: r.id, name: r.name, document_count: cnt, created_at: r.createdAt };
        }).sort(function (a, b) { return (b.created_at || '').localeCompare(a.created_at || ''); });
    }
    if (method === 'POST' && _matchSegs(segs, ['api', 'repositories'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var rn = (body.name || '').trim();
        if (!rn) throw new APIError('El nombre es requerido', 400);
        if (db.repositories.some(function (r) { return r.ownerId === body._user.id && r.name === rn; }))
            throw new APIError('Ya existe un repositorio con ese nombre', 400);
        var nr = { id: _nextId(db, 'repositories'), name: rn, ownerId: body._user.id, createdAt: new Date().toISOString() };
        db.repositories.push(nr); _saveDB(db);
        return { id: nr.id, name: nr.name, created_at: nr.createdAt };
    }
    if ((method === 'PATCH' || method === 'DELETE') && segs[1] === 'repositories' && /^\d+$/.test(segs[2] || '')) {
        var rid = parseInt(segs[2]), ri = db.repositories.findIndex(function (r) { return r.id === rid; });
        if (ri === -1) throw new APIError('Repositorio no encontrado', 404);
        if (method === 'PATCH') {
            var pn = (body.name || '').trim(); if (!pn) throw new APIError('Nombre requerido', 400);
            db.repositories[ri].name = pn; _saveDB(db);
            return { id: db.repositories[ri].id, name: db.repositories[ri].name };
        }
        if (db.documents.some(function (d) { return d.repositoryId === rid; }))
            throw new APIError('El repositorio tiene documentos; elimínelos primero', 409);
        db.repositories.splice(ri, 1); _saveDB(db);
        return { detail: 'Repositorio eliminado' };
    }

    // ── Documents ──
    if (method === 'POST' && _matchSegs(segs, ['api', 'documents', 'upload'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var file = body._file, repoId = body.repository_id ? parseInt(body.repository_id) : null;
        if (!file) throw new APIError('No se proporcionó archivo', 400);
        var ext = (file.name || '').split('.').pop().toLowerCase();
        if (['pdf', 'txt', 'docx'].indexOf(ext) === -1) throw new APIError('Formato no soportado. Use PDF, TXT o DOCX.', 400);
        var t0 = Date.now(), extractedText = null;
        try { extractedText = await _extractText(file); } catch (_) { }
        var cat = _classify(file.name, extractedText);
        var catObj = db.categories.find(function (c) { return c.name === cat; }) || db.categories.find(function (c) { return c.isDefault; });
        var summary = _summarize(extractedText);
        var extractions = _extractFields(extractedText, cat);
        var status = extractedText ? 'indexed' : 'failed';
        var docId = _nextId(db, 'documents');
        var doc = {
            id: docId, filename: file.name, originalFilename: file.name,
            file_path: file.name, file_size: file.size, mime_type: file.type || '',
            status: status, contentSummary: summary, extractedText: extractedText,
            categoryId: catObj ? catObj.id : null, ownerId: body._user.id,
            repositoryId: repoId, uploadedAt: new Date().toISOString(),
            processedAt: extractedText ? new Date().toISOString() : null,
            extractions: extractions,
        };
        db.documents.push(doc);
        db.aiLogs.push({ id: _nextId(db, 'aiLogs'), documentId: docId, ownerId: body._user.id, operationType: 'extraccion', tokensUsed: 0, processingTimeMs: Date.now() - t0, timestamp: new Date().toISOString() });
        if (extractedText) {
            db.aiLogs.push({ id: _nextId(db, 'aiLogs'), documentId: docId, ownerId: body._user.id, operationType: 'clasificacion', tokensUsed: 0, processingTimeMs: 0, timestamp: new Date().toISOString() });
        }
        _saveDB(db);
        await _saveFile(docId, file);
        var out = _serDoc(doc, db);
        if (!extractedText) out.detail = 'No se pudo extraer texto del documento';
        return out;
    }
    if (method === 'GET' && _matchSegs(segs, ['api', 'documents', 'stats', 'summary'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var ud = db.documents.filter(function (d) { return d.ownerId === body._user.id; });
        var total = ud.length, indexed = ud.filter(function (d) { return d.status === 'indexed'; }).length;
        var processing = ud.filter(function (d) { return d.status === 'processing'; }).length;
        var failed = ud.filter(function (d) { return d.status === 'failed'; }).length;
        var byStatus = { indexed: indexed, processing: processing, failed: failed };
        var byCat = {};
        ud.forEach(function (d) { var cn = 'sin categoría'; db.categories.forEach(function (c) { if (c.id === d.categoryId) cn = c.name; }); byCat[cn] = (byCat[cn] || 0) + 1; });
        var questions = db.aiLogs.filter(function (l) { return l.operationType === 'chat' && l.ownerId === body._user.id; }).length;
        return { total_documents: total, processed: indexed, processing: processing, failed: failed, by_status: byStatus, by_category: byCat, questions_answered: questions, time_saved_estimate_h: Math.round((indexed * 15 + questions * 3) / 60 * 10) / 10 };
    }
    if (method === 'GET' && _matchSegs(segs, ['api', 'documents'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var docs = db.documents.filter(function (d) { return d.ownerId === body._user.id; });
        var repId = qs.get('repository_id'), catF = qs.get('category'), statF = qs.get('status'), seaF = qs.get('search');
        if (repId) docs = docs.filter(function (d) { return String(d.repositoryId) === repId; });
        if (catF) docs = docs.filter(function (d) { var c = db.categories.find(function (x) { return x.id === d.categoryId; }); return c && c.name === catF; });
        if (statF) docs = docs.filter(function (d) { return d.status === statF; });
        if (seaF) docs = docs.filter(function (d) { return (d.originalFilename || '').toLowerCase().indexOf(seaF.toLowerCase()) !== -1; });
        return docs.sort(function (a, b) { return (b.uploadedAt || '').localeCompare(a.uploadedAt || ''); }).map(function (d) { return _serDoc(d, db); });
    }
    if (method === 'GET' && segs[1] === 'documents' && segs.length === 3 && /^\d+$/.test(segs[2])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var gd = db.documents.find(function (d) { return d.id === parseInt(segs[2]) && d.ownerId === body._user.id; });
        if (!gd) throw new APIError('Documento no encontrado', 404);
        var sd = _serDoc(gd, db);
        sd.extracted_text_preview = (gd.extractedText || '').slice(0, 2000);
        sd.extractions = gd.extractions || [];
        return sd;
    }
    if (method === 'GET' && segs[1] === 'documents' && segs.length === 4 && segs[3] === 'download') {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var dd = db.documents.find(function (d) { return d.id === parseInt(segs[2]) && d.ownerId === body._user.id; });
        if (!dd) throw new APIError('Documento no encontrado', 404);
        var blob = await _getFile(dd.id);
        if (!blob) throw new APIError('Archivo no disponible en la sesión actual; vuelva a subir el archivo.', 404);
        return blob;
    }
    if (method === 'DELETE' && segs[1] === 'documents' && segs.length === 3 && /^\d+$/.test(segs[2])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var di = db.documents.findIndex(function (d) { return d.id === parseInt(segs[2]) && d.ownerId === body._user.id; });
        if (di === -1) throw new APIError('Documento no encontrado', 404);
        var did = db.documents[di].id;
        db.documents.splice(di, 1);
        db.aiLogs = db.aiLogs.filter(function (l) { return l.documentId !== did; });
        db.errorLogs = db.errorLogs.filter(function (l) { return l.documentId !== did; });
        _saveDB(db); await _delFile(did);
        return null; // 204
    }

    // ── Chat / Search ──
    if (method === 'POST' && _matchSegs(segs, ['api', 'chat'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var msg = _norm(body.message || '');
        var start = Date.now();
        var repF = body.repository_id ? parseInt(body.repository_id, 10) : null;
        var catF = body.category ? _norm(body.category) : '';
        var q = db.documents.filter(function (d) {
            if (d.ownerId !== body._user.id || d.status !== 'indexed' || !d.extractedText) return false;
            if (repF && d.repositoryId !== repF) return false;
            if (catF) {
                var c = db.categories.find(function (x) { return x.id === d.categoryId; });
                if (!c || (_norm(c.name) !== catF && (_CAT_SUB[catF] || []).indexOf(_norm(c.name)) === -1)) return false;
            }
            return true;
        });
        var hits = [];
        q.forEach(function (d) {
            var t = _norm(d.extractedText), idx = t.indexOf(msg);
            if (idx !== -1) hits.push({ doc_id: d.id, filename: d.originalFilename, text: d.extractedText.slice(Math.max(0, idx - 100), idx + msg.length + 300), score: 1 });
        });
        hits.sort(function (a, b) { return b.score - a.score; });
        hits = hits.slice(0, 5);
        var answer = hits.length ? 'Respuesta generada desde el repositorio local (modo demo):\n\n' + hits.map(function (h, i) { return 'Fragmento ' + (i + 1) + ': ' + h.text.slice(0, 400); }).join('\n\n') : 'No encontré información relacionada en tu repositorio.';
        var elapsed = Date.now() - start;
        db.aiLogs.push({ id: _nextId(db, 'aiLogs'), documentId: null, ownerId: body._user.id, operationType: 'chat', tokensUsed: 0, processingTimeMs: elapsed, timestamp: new Date().toISOString() });
        _saveDB(db);
        return { query: body.message, answer: answer, sources: hits.map(function (h) { return { doc_id: h.doc_id, score: h.score, snippet: h.text.slice(0, 240) }; }), chunks_retrieved: hits.length, mode: 'demo', response_time_ms: elapsed, filters: { repository_id: repF, category: body.category || '' } };
    }
    if (method === 'GET' && _matchSegs(segs, ['api', 'chat', 'search'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var sq = _norm(qs.get('q') || '');
        if (!sq) throw new APIError('La consulta no puede estar vacía', 400);
        var res = [];
        db.documents.filter(function (d) { return d.ownerId === body._user.id && d.status === 'indexed' && d.extractedText; }).forEach(function (d) {
            var lc = _norm(d.extractedText), c = 0, pos = -1;
            while ((pos = lc.indexOf(sq, pos + 1)) !== -1) c++;
            if (c > 0) res.push({ doc_id: d.id, filename: d.originalFilename, snippet: _makeSnippet(d.extractedText, sq), score: c });
        });
        res.sort(function (a, b) { return b.score - a.score; });
        return { query: qs.get('q'), count: res.length, results: res.slice(0, 30) };
    }

    // ── Monitoring ──
    if (method === 'GET' && _matchSegs(segs, ['api', 'monitoring', 'logs'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var docs2 = db.documents.filter(function (d) { return d.ownerId === body._user.id; });
        var sc = { total: docs2.length, indexed: 0, processing: 0, failed: 0 };
        docs2.forEach(function (d) { if (sc[d.status] !== undefined) sc[d.status]++; });
        var errs = db.errorLogs.filter(function (l) {
            return !l.documentId || docs2.some(function (d) { return d.id === l.documentId; });
        }).slice(-50).reverse();
        return { status_counts: sc, errors: errs.map(function (l) { return { id: l.id, document_id: l.documentId, error_code: l.errorCode, message: l.message, level: l.level, created_at: l.createdAt }; }) };
    }
    if (method === 'GET' && _matchSegs(segs, ['api', 'monitoring', 'ai-logs'])) {
        if (!body || !body._user) throw new APIError('No autenticado', 401);
        var al = db.aiLogs.filter(function (l) { return l.ownerId === body._user.id; }).slice(-50).reverse();
        return al.map(function (l) { return { id: l.id, document_id: l.documentId, operation_type: l.operationType, tokens_used: l.tokensUsed || 0, processing_time_ms: l.processingTimeMs, timestamp: l.timestamp }; });
    }

    // ── Config ──
    if (method === 'GET' && _matchSegs(segs, ['api', 'config'])) {
        var c = db.config || {};
        return { llm_model: c.llm_model || 'gpt-4o-mini', chunk_size: c.chunk_size || 512, chunk_overlap: c.chunk_overlap || 64, openai_configured: false };
    }
    if (method === 'PUT' && _matchSegs(segs, ['api', 'config'])) {
        if (!body || !body._user || body._user.role !== 'admin') throw new APIError('Se requieren privilegios de administrador', 403);
        if (!db.config) db.config = {};
        if (body.llm_model) db.config.llm_model = body.llm_model;
        if (body.chunk_size) db.config.chunk_size = body.chunk_size;
        if (body.chunk_overlap !== undefined) db.config.chunk_overlap = body.chunk_overlap;
        _saveDB(db);
        return { llm_model: db.config.llm_model, chunk_size: db.config.chunk_size, chunk_overlap: db.config.chunk_overlap, openai_configured: false };
    }

    throw new APIError('Ruta no encontrada: ' + path, 404);
}

// ────────── Serializar documento ──────────
function _serDoc(d, db) {
    var catName = null;
    if (d.categoryId && db) { var c = db.categories.find(function (x) { return x.id === d.categoryId; }); if (c) catName = c.name; }
    var repoName = null;
    if (d.repositoryId && db) { var r = db.repositories.find(function (x) { return x.id === d.repositoryId; }); if (r) repoName = r.name; }
    return {
        id: d.id, filename: d.originalFilename || d.filename, status: d.status,
        category: catName, repository_id: d.repositoryId, repository: repoName,
        file_size: d.file_size, summary: d.contentSummary,
        uploaded_at: d.uploadedAt, processed_at: d.processedAt,
    };
}

// ────────── API pública ──────────
class APIError extends Error {
    constructor(message, status) { super(message); this.status = status; }
}

const API = {
    TOKEN_KEY: 'dp_token',
    get token() { return localStorage.getItem(this.TOKEN_KEY); },
    setToken(t) { if (t) localStorage.setItem(this.TOKEN_KEY, t); else localStorage.removeItem(this.TOKEN_KEY); },

    _currentUser() {
        var t = this.token;
        if (!t) return null;
        var db = _loadDB();
        var u = (db.users || []).find(function (x) { return x.email === t; });
        return u || null;
    },

    async request(path, opts) {
        opts = opts || {};
        var method = opts.method || 'GET';
        var body = opts.body;
        var ctx = { _user: this._currentUser() };
        if (body instanceof URLSearchParams) {
            Object.assign(ctx, Object.fromEntries(body));
        } else if (body instanceof FormData) {
            ctx._file = body.get('file');
            ctx.repository_id = body.get('repository_id');
        } else if (body && typeof body === 'object') {
            Object.assign(ctx, body);
        }
        return _route(method, path, ctx);
    },

    get(path) { return this.request(path); },
    post(path, body) { return this.request(path, { method: 'POST', body: body }); },
    put(path, body) { return this.request(path, { method: 'PUT', body: body }); },
    patch(path, body) { return this.request(path, { method: 'PATCH', body: body }); },
    del(path) { return this.request(path, { method: 'DELETE' }); },
    upload(path, fd) { return this.request(path, { method: 'POST', body: fd }); },

    async download(path) {
        var match = path.match(/\/documents\/(\d+)\/download/);
        if (!match) throw new APIError('Ruta no encontrada', 404);
        return _route('GET', path, { _user: this._currentUser() });
    },
};

// Seed inicial (persistir: sin esto el login/admin no sobrevive al recargar)
_saveDB(_seed(_loadDB()));
