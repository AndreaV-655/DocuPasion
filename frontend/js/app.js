// ===== DocuPasion - Lógica de la aplicación (SPA) =====

const CATEGORY_OPTIONS = ['académico', 'técnico', 'legal', 'contratos', 'administrativo', 'hoja de vida', 'general'];
const CHAT_TOPICS = [
    { cat: 'contratos', label: 'Contratos y cláusulas', query: 'cláusula' },
    { cat: 'legal', label: 'Aspectos legales', query: 'ley' },
    { cat: 'hoja de vida', label: 'Hoja de vida / CV', query: 'experiencia laboral' },
    { cat: 'administrativo', label: 'Actas y reuniones', query: 'acta' },
    { cat: 'académico', label: 'Investigación académica', query: 'metodología' },
    { cat: 'técnico', label: 'Temas técnicos', query: 'requisitos' },
];
const HELPERS = {
    escapeHtml(str = '') {
        return String(str).replace(/[&<>"']/g, (m) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        }[m]));
    },
    formatBytes(bytes = 0) {
        if (!bytes) return '-';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0, n = bytes;
        while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
        return n.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    },
    formatDate(iso = null) {
        if (!iso) return '-';
        const d = new Date(iso);
        return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    },
    badge(status) {
        const map = { indexed: ['status-success', 'Indexado'], processing: ['status-processing', 'Procesando'], failed: ['status-failed', 'Fallido'] };
        const [cls, label] = map[status] || ['status-processing', status];
        return `<span class="status-badge ${cls}">${label}</span>`;
    },
    icons() { if (window.lucide) lucide.createIcons(); },
};

const App = {
    user: null,
    selectedRepoId: null,
    _repos: [],
    filters: { repo: '', category: '', status: '', search: '' },
    detailDocId: null,
    pdf: null, pdfPage: 1, pdfDoc: null,

    init() {
        HELPERS.icons();
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this._uploadMultiple(e.dataTransfer.files || []);
        });
        fileInput.addEventListener('change', (e) => {
            this._uploadMultiple(e.target.files || []);
            e.target.value = '';
        });

        let searchTimer = null;
        document.getElementById('searchInput').addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => { this.filters.search = e.target.value.trim(); this.loadDocuments(); }, 400);
        });
        document.getElementById('filterRepo').addEventListener('change', (e) => { this.filters.repo = e.target.value; this.loadDocuments(); });
        document.getElementById('filterCategory').addEventListener('change', (e) => { this.filters.category = e.target.value; this.loadDocuments(); });
        document.getElementById('filterRepoCategory').addEventListener('change', (e) => { this.filters.category = e.target.value; this.loadRepoDocuments(); });
        document.getElementById('filterStatus').addEventListener('change', (e) => { this.filters.status = e.target.value; this.loadDocuments(); });
    },

    async checkAuth() {
        if (!API.token) return this.showLogin();
        try {
            this.user = await API.get('/api/auth/me');
            this.showApp();
        } catch (e) {
            this.showLogin();
        }
    },

    showLogin() {
        document.getElementById('loginView').style.display = 'flex';
        document.getElementById('appView').style.display = 'none';
        this.showAuth('login');
        HELPERS.icons();
    },

    showApp() {
        document.getElementById('appView').style.display = 'flex';
        document.getElementById('loginView').style.display = 'none';
        document.getElementById('userEmail').textContent = this.user.email;
        document.getElementById('userRole').textContent = this.user.role === 'admin' ? 'Administrador' : 'Cliente';
        document.getElementById('avatarUser').textContent = (this.user.email || '?')[0].toUpperCase();
        const isAdmin = this.user.role === 'admin';
        document.querySelectorAll('.admin-only').forEach((el) => { el.style.display = isAdmin ? '' : 'none'; });
        const savedRepo = parseInt(localStorage.getItem('dp_selected_repo'), 10);
        if (savedRepo) {
            this.selectedRepoId = savedRepo;
            this.filters.repo = String(savedRepo);
        }
        this.switchView(savedRepo ? 'repoView' : 'dashboard');
        HELPERS.icons();
    },

    logout() {
        API.setToken(null);
        location.reload();
    },

    showAuth(mode) {
        const loginForm = document.getElementById('loginForm');
        const regForm = document.getElementById('registerForm');
        document.getElementById('loginError').textContent = '';
        document.getElementById('registerError').textContent = '';
        if (mode === 'register') {
            loginForm.style.display = 'none';
            regForm.style.display = 'block';
            document.getElementById('tabLogin').classList.remove('active');
            document.getElementById('tabRegister').classList.add('active');
        } else {
            regForm.style.display = 'none';
            loginForm.style.display = 'block';
            document.getElementById('tabRegister').classList.remove('active');
            document.getElementById('tabLogin').classList.add('active');
        }
    },

    async login(e) {
        e.preventDefault();
        const btn = document.getElementById('loginBtn');
        this.setBusy(btn, true);
        document.getElementById('loginError').textContent = '';
        try {
            const body = new URLSearchParams({ username: document.getElementById('loginEmail').value, password: document.getElementById('loginPassword').value });
            const data = await API.request('/api/auth/login', { method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
            API.setToken(data.access_token);
            await this.checkAuth();
        } catch (err) {
            document.getElementById('loginError').textContent = err.message;
        } finally { this.setBusy(btn, false); }
    },

    async register(e) {
        e.preventDefault();
        const btn = document.getElementById('registerBtn');
        this.setBusy(btn, true);
        document.getElementById('registerError').textContent = '';
        try {
            const data = await API.post('/api/auth/register', { email: document.getElementById('regEmail').value, password: document.getElementById('regPassword').value });
            API.setToken(data.access_token);
            await this.checkAuth();
            this.showToast('¡Cuenta creada correctamente!', 'success');
        } catch (err) {
            document.getElementById('registerError').textContent = err.message;
        } finally { this.setBusy(btn, false); }
    },

    setBusy(btn, busy) {
        if (!btn) return;
        if (busy) btn.dataset.original = btn.innerHTML;
        btn.disabled = busy;
        btn.innerHTML = busy ? '<span class="loader"></span>' : (btn.dataset.original || '');
    },

    switchView(viewId) {
        document.querySelectorAll('.view-section').forEach((el) => el.classList.remove('active'));
        const el = document.getElementById(viewId);
        if (!el) return;
        el.classList.add('active');
        document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
        const navMap = { dashboard: 0, repositories: 1, repoView: 1, documents: 2, chat: 3, monitoring: 4, config: 5 };
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems[navMap[viewId]]) navItems[navMap[viewId]].classList.add('active');

        if (viewId === 'dashboard') this.loadDashboard();
        if (viewId === 'repositories') this.loadRepositories();
        if (viewId === 'repoView') this.loadRepoView();
        if (viewId === 'documents') { this.loadRepositoriesForSelects(); this.loadDocuments(); }
        if (viewId === 'chat') { this.loadChatGreeting(); this.loadChatOptions(); this.loadChatTopics(); }
        if (viewId === 'monitoring') this.loadMonitoring();
        if (viewId === 'config') this.loadConfig();
        HELPERS.icons();
    },

    // ===== Dashboard =====
    async loadDashboard() {
        const s = await API.get('/api/documents/stats/summary').catch(() => null);
        if (!s) return this.showToast('No se pudo cargar el dashboard', 'error');
        document.getElementById('stat-total').textContent = s.total_documents;
        document.getElementById('stat-processed').textContent = s.processed;
        document.getElementById('stat-processing').textContent = s.processing;
        document.getElementById('stat-failed').textContent = s.failed;
        document.getElementById('stat-questions').textContent = s.questions_answered;
        document.getElementById('stat-time').textContent = (s.time_saved_estimate_h || 0) + 'h';

        const statusChart = document.getElementById('byStatusChart');
        statusChart.innerHTML = Object.entries(s.by_status || {}).map(([k, v]) =>
            `<div style="display:flex; justify-content:space-between; padding:0.35rem 0; border-bottom:1px solid var(--border);">
                <span style="text-transform:capitalize;">${HELPERS.escapeHtml(k)}</span><strong>${v}</strong>
            </div>`).join('') || '<p style="color:var(--text-muted);">Sin datos</p>';

        const catChart = document.getElementById('byCategoryChart');
        catChart.innerHTML = Object.entries(s.by_category || {}).map(([k, v]) =>
            `<div style="display:flex; justify-content:space-between; padding:0.35rem 0; border-bottom:1px solid var(--border);">
                <span>${HELPERS.escapeHtml(k)}</span><strong>${v}</strong>
            </div>`).join('') || '<p style="color:var(--text-muted);">Sin datos</p>';
    },

    // ===== Repositorios =====
    async loadRepositories() {
        this._repos = await API.get('/api/repositories/').catch(() => []);
        if (this.selectedRepoId && !this._repos.some((r) => r.id === this.selectedRepoId)) {
            this.selectedRepoId = null;
            this.filters.repo = '';
            localStorage.removeItem('dp_selected_repo');
        }
        this.updateRepoViewTitle();
        const repos = this._repos;
        const grid = document.getElementById('repoGrid');
        if (!repos.length) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">No hay repositorios todavía. Crea uno para organizar tus documentos.</div>';
            return HELPERS.icons();
        }
        grid.innerHTML = repos.map((r) => `
            <div class="repo-card ${this.selectedRepoId === r.id ? 'active' : ''}" onclick="App.selectRepo(${r.id})">
                <div class="repo-name">
                    <span>${HELPERS.escapeHtml(r.name)}</span>
                    <i data-lucide="folder" style="width:18px; color:var(--primary);"></i>
                </div>
                <div class="repo-count">${r.document_count} documento(s)</div>
                <div style="margin-top:0.75rem; display:flex; gap:0.5rem;">
                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); App.openRepoModal(${r.id})">Renombrar</button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); App.deleteRepo(${r.id})">Eliminar</button>
                </div>
            </div>`).join('');
        HELPERS.icons();
    },

    selectRepo(id) {
        this.selectedRepoId = id;
        this.filters.repo = id ? String(id) : '';
        if (id) localStorage.setItem('dp_selected_repo', String(id));
        else localStorage.removeItem('dp_selected_repo');
        document.getElementById('filterRepo').value = this.filters.repo;
        this.loadRepositories();
        this.switchView('repoView');
    },

    updateRepoViewTitle() {
        const title = document.getElementById('repoViewTitle');
        const repo = this.selectedRepoId ? this._repos.find((r) => r.id === this.selectedRepoId) : null;
        title.textContent = repo ? repo.name : 'Repositorio';
    },

    loadRepoView() {
        this.loadRepositoriesForSelects();
        this.loadRepoCategories();
        this.loadRepoDocuments();
        this.updateRepoViewTitle();
    },

    loadRepoCategories() {
        const sel = document.getElementById('filterRepoCategory');
        const cur = this.filters.category || sel.value;
        sel.innerHTML = '<option value="">Todas</option>' + CATEGORY_OPTIONS.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join('');
        sel.value = cur || '';
    },

    async loadRepoDocuments() {
        const tb = document.getElementById('repoDocumentsBody');
        tb.innerHTML = '<tr><td colspan="6" class="empty-state">Cargando...</td></tr>';
        if (!this.selectedRepoId) { tb.innerHTML = '<tr><td colspan="6" class="empty-state">No hay repositorio seleccionado.</td></tr>'; return; }
        const params = new URLSearchParams({ repository_id: String(this.selectedRepoId) });
        if (this.filters.category) params.set('category', this.filters.category);
        const docs = await API.get('/api/documents/?' + params.toString()).catch(() => { tb.innerHTML = '<tr><td colspan="6" class="empty-state">Error al cargar documentos</td></tr>'; return null; });
        if (!docs) return;
        if (!docs.length) { tb.innerHTML = '<tr><td colspan="6" class="empty-state">No hay documentos en este repositorio.</td></tr>'; return; }
        tb.innerHTML = docs.map((d) => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <i data-lucide="${(d.filename || '').toLowerCase().endsWith('.pdf') ? 'file-text' : 'file'}" style="width:16px; color:var(--secondary);"></i>
                        <span style="cursor:pointer; color:var(--primary);" onclick="App.openDetail(${d.id})" title="Ver detalle">${HELPERS.escapeHtml(d.filename)}</span>
                    </div>
                </td>
                <td>${HELPERS.escapeHtml(d.category || '-')}</td>
                <td>${HELPERS.formatBytes(d.file_size)}</td>
                <td>${HELPERS.badge(d.status)}</td>
                <td>${HELPERS.formatDate(d.uploaded_at)}</td>
                <td style="text-align:right; white-space:nowrap;">
                    <button class="icon-btn" title="Descargar" onclick="App.downloadDoc(${d.id}, '${HELPERS.escapeHtml(d.filename).replace(/'/g, '&#39;')}')"><i data-lucide="download"></i></button>
                    <button class="icon-btn" title="Ver detalle" onclick="App.openDetail(${d.id})"><i data-lucide="eye"></i></button>
                    <button class="icon-btn danger" title="Eliminar" onclick="App.deleteDoc(${d.id})"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>`).join('');
        HELPERS.icons();
    },

    openRepoModal(id = null) {
        const repo = this._repos.find((r) => r.id === id) || { name: '' };
        document.getElementById('repoId').value = id || '';
        document.getElementById('repoName').value = repo.name;
        document.getElementById('repoModalTitle').textContent = id ? 'Renombrar repositorio' : 'Nuevo repositorio';
        document.getElementById('repoError').textContent = '';
        document.getElementById('repoModal').classList.add('show');
    },

    closeRepoModal() { document.getElementById('repoModal').classList.remove('show'); },

    async submitRepo(e) {
        e.preventDefault();
        const id = document.getElementById('repoId').value;
        const name = document.getElementById('repoName').value.trim();
        document.getElementById('repoError').textContent = '';
        try {
            if (id) await API.patch('/api/repositories/' + id, { name });
            else await API.post('/api/repositories/', { name });
            this.closeRepoModal();
            this.showToast('Repositorio guardado', 'success');
            this.loadRepositories();
            this.loadRepositoriesForSelects();
        } catch (err) { document.getElementById('repoError').textContent = err.message; }
    },

    async deleteRepo(id) {
        if (!confirm('¿Eliminar este repositorio?')) return;
        try {
            await API.del('/api/repositories/' + id);
            this.showToast('Repositorio eliminado', 'success');
            this.loadRepositories();
            this.loadRepositoriesForSelects();
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    // ===== Documentos =====
    async loadRepositoriesForSelects() {
        const repos = await API.get('/api/repositories/').catch(() => []);
        this._repos = repos;
        const opts = repos.map((r) => `<option value="${r.id}">${HELPERS.escapeHtml(r.name)}</option>`).join('');
        const sel = document.getElementById('filterRepo');
        const cur = this.filters.repo || sel.value;
        sel.innerHTML = '<option value="">Todos</option>' + opts;
        sel.value = cur && opts.includes('value="' + cur + '"') ? cur : '';
        document.getElementById('uploadRepoSelect').innerHTML = '<option value="">Sin repositorio</option>' + opts;
        document.getElementById('uploadRepoSelect').value = this.selectedRepoId ? String(this.selectedRepoId) : '';
        this.updateRepoViewTitle();
    },

    async loadDocuments() {
        const tb = document.getElementById('documentsTableBody');
        tb.innerHTML = '<tr><td colspan="7" class="empty-state">Cargando...</td></tr>';
        const params = new URLSearchParams();
        if (this.filters.repo) params.set('repository_id', this.filters.repo);
        if (this.filters.category) params.set('category', this.filters.category);
        if (this.filters.status) params.set('status', this.filters.status);
        if (this.filters.search) params.set('search', this.filters.search);
        const qs = params.toString();
        const docs = await API.get('/api/documents/' + (qs ? '?' + qs : '')).catch(() => { tb.innerHTML = '<tr><td colspan="7" class="empty-state">Error al cargar documentos</td></tr>'; return null; });
        if (!docs) return;
        if (!docs.length) { tb.innerHTML = '<tr><td colspan="7" class="empty-state">No hay documentos. Sube tu primer archivo.</td></tr>'; return; }
        tb.innerHTML = docs.map((d) => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <i data-lucide="${(d.filename || '').toLowerCase().endsWith('.pdf') ? 'file-text' : 'file'}" style="width:16px; color:var(--secondary);"></i>
                        <span style="cursor:pointer; color:var(--primary);" onclick="App.openDetail(${d.id})" title="Ver detalle">${HELPERS.escapeHtml(d.filename)}</span>
                    </div>
                </td>
                <td>${HELPERS.escapeHtml(d.repository || '-')}</td>
                <td>${HELPERS.escapeHtml(d.category || '-')}</td>
                <td>${HELPERS.formatBytes(d.file_size)}</td>
                <td>${HELPERS.badge(d.status)}</td>
                <td>${HELPERS.formatDate(d.uploaded_at)}</td>
                <td style="text-align:right; white-space:nowrap;">
                    <button class="icon-btn" title="Descargar" onclick="App.downloadDoc(${d.id}, '${HELPERS.escapeHtml(d.filename).replace(/'/g, '&#39;')}')"><i data-lucide="download"></i></button>
                    <button class="icon-btn" title="Ver detalle" onclick="App.openDetail(${d.id})"><i data-lucide="eye"></i></button>
                    <button class="icon-btn danger" title="Eliminar" onclick="App.deleteDoc(${d.id})"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>`).join('');
        HELPERS.icons();
    },

    async uploadFile(file) {
        const fd = new FormData();
        fd.append('file', file);
        const repoId = document.getElementById('uploadRepoSelect').value;
        if (repoId) fd.append('repository_id', repoId);
        this.showToast(`Subiendo ${file.name}...`, 'info');
        try {
            const result = await API.upload('/api/documents/upload', fd);
            const ok = result.detail ? ' al ' + result.detail : '';
            this.showToast(`${file.name}: ${result.status}${ok}`, result.status === 'indexed' ? 'success' : 'error');
            this.loadDocuments();
            this.loadRepoDocuments();
            this.loadDashboard();
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    // Sube varios archivos en secuencia para no perder escrituras (RF: subida múltiple)
    async _uploadMultiple(files) {
        for (const f of Array.from(files || [])) {
            await this.uploadFile(f);
        }
    },

    async deleteDoc(id) {
        if (!confirm('¿Eliminar este documento? Se borrará el archivo y su índice (RB-010).')) return;
        try {
            await API.del('/api/documents/' + id);
            this.showToast('Documento eliminado', 'success');
            this.loadDocuments();
            this.loadRepoDocuments();
            this.loadDashboard();
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    async downloadDoc(id, filename = 'documento-' + id) {
        try {
            const blob = await API.download('/api/documents/' + id + '/download');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || ('documento-' + id);
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            this.showToast('Descarga iniciada', 'success');
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    clearRepoFilter() {
        this.selectedRepoId = null;
        this.filters.repo = '';
        document.getElementById('filterRepo').value = '';
        document.getElementById('uploadRepoSelect').value = '';
        localStorage.removeItem('dp_selected_repo');
        this.updateRepoViewTitle();
        this.loadRepositories();
        this.loadDocuments();
    },

    // ===== Detalle =====
    async openDetail(id) {
        try {
            const d = await API.get('/api/documents/' + id);
            this.detailDocId = id;
            document.getElementById('detailTitle').textContent = d.filename;
            document.getElementById('detailMeta').innerHTML = `
                <div class="detail-block"><h4>Estado</h4><div class="value">${HELPERS.badge(d.status)}</div></div>
                <div class="detail-block"><h4>Categoría</h4><div class="value">${HELPERS.escapeHtml(d.category || '-')}</div></div>
                <div class="detail-block"><h4>Repositorio</h4><div class="value">${HELPERS.escapeHtml(d.repository || 'Sin repositorio')}</div></div>
                <div class="detail-block"><h4>Fecha de carga</h4><div class="value">${HELPERS.formatDate(d.uploaded_at)}</div></div>`;
            document.getElementById('detailSummary').textContent = d.summary || 'Sin resumen generado.';
            const exTb = document.getElementById('detailExtractions');
            const extras = d.extractions || [];
            if (extras.length) {
                exTb.innerHTML = extras.map((x) =>
                    `<tr><td>${HELPERS.escapeHtml(x.field_name)}</td><td>${HELPERS.escapeHtml(x.field_value)}</td></tr>`).join('');
            } else {
                exTb.innerHTML = '<tr><td colspan="2" class="empty-state">Sin información extraída para este tipo.</td></tr>';
            }
            document.getElementById('detailPreview').textContent = d.extracted_text_preview || '(sin texto extraído)';
            document.getElementById('detailModal').classList.add('show');
            this.closePdf();
            // Visor PDF (RF-019) para archivos PDF
            if ((d.filename || '').toLowerCase().endsWith('.pdf') && d.status === 'indexed') {
                document.getElementById('pdfTools').style.display = 'flex';
                await this.showPdf(id);
            } else {
                document.getElementById('pdfTools').style.display = 'none';
                document.getElementById('pdfContainer').style.display = 'none';
            }
            HELPERS.icons();
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    closeDetail() {
        document.getElementById('detailModal').classList.remove('show');
        this.closePdf();
    },

    // ===== Visor PDF (pdf.js) =====
    async showPdf(id) {
        try {
            const blob = await API.download('/api/documents/' + id + '/download');
            const buffer = await blob.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
            this.pdf = pdf;
            this.pdfPage = 1;
            document.getElementById('pdfContainer').style.display = 'block';
            await this.renderPdfPage();
        } catch (err) { this.showToast('No se pudo previsualizar el PDF: ' + err.message, 'error'); }
    },

    async renderPdfPage() {
        const pdf = this.pdf;
        if (!pdf || this.pdfPage < 1 || this.pdfPage > pdf.numPages) return;
        const page = await pdf.getPage(this.pdfPage);
        const scale = Math.min(1.4, 900 / page.getViewport({ scale: 1 }).width);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const container = document.getElementById('pdfContainer');
        container.innerHTML = '';
        container.appendChild(canvas);
        document.getElementById('pdfPageLabel').textContent = `Página ${this.pdfPage} de ${pdf.numPages}`;
    },

    async pdfPrev() { if (this.pdfPage > 1) { this.pdfPage--; await this.renderPdfPage(); } },
    async pdfNext() { if (this.pdf && this.pdfPage < this.pdf.numPages) { this.pdfPage++; await this.renderPdfPage(); } },
    closePdf() {
        this.pdf = null;
        document.getElementById('pdfContainer').style.display = 'none';
        document.getElementById('pdfContainer').innerHTML = '';
    },

    // ===== Chat RAG =====
    loadChatGreeting() {
        const container = document.getElementById('chatMessages');
        if (!container.children.length) {
            container.innerHTML = '<div class="message ai">Hola, soy tu asistente de análisis documental de DocuPasion. Haz preguntas sobre tus documentos indexados; responderé con citas a las fuentes. Si quieres una búsqueda más específica, elige un repositorio y/o una categoría.</div>' +
                '<div class="chat-topics" id="chatTopics"></div>';
        }
    },

    async loadChatTopics() {
        const host = document.getElementById('chatTopics');
        if (!host) return;
        const docs = await API.get('/api/documents/').catch(() => []);
        const present = new Set(docs.map((d) => d.category).filter(Boolean));
        const topics = CHAT_TOPICS.filter((t) => present.has(t.cat));
        if (!topics.length) {
            host.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted);">Sube e indexa documentos para ver aquí temas que puedes buscar.</div>';
            return;
        }
        host.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted); align-self:center;">Temas que puedes buscar:</span>' +
            topics.map((t) => `<button class="topic-chip" onclick="App.askTopic('${t.cat}','${t.query}')">${HELPERS.escapeHtml(t.label)}</button>`).join('');
    },

    askTopic(cat, query) {
        document.getElementById('chatRepoSelect').value = '';
        document.getElementById('chatCategorySelect').value = cat;
        const input = document.getElementById('chatInput');
        input.value = query;
        this.sendChat();
    },

    async loadChatOptions() {
        const repos = await API.get('/api/repositories/').catch(() => []);
        this._repos = repos;
        const sel = document.getElementById('chatRepoSelect');
        const curRepo = sel.value;
        sel.innerHTML = '<option value="">Todos</option>' + repos.map((r) => `<option value="${r.id}">${HELPERS.escapeHtml(r.name)}</option>`).join('');
        sel.value = curRepo && repos.some((r) => String(r.id) === curRepo) ? curRepo : '';
        const selC = document.getElementById('chatCategorySelect');
        const curCat = selC.value;
        selC.innerHTML = '<option value="">Todas</option>' + CATEGORY_OPTIONS.map((c) => `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`).join('');
        selC.value = curCat && CATEGORY_OPTIONS.includes(curCat) ? curCat : '';
    },

    async sendChat() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;
        const container = document.getElementById('chatMessages');
        container.insertAdjacentHTML('beforeend', `<div class="message user">${HELPERS.escapeHtml(message)}</div>`);
        input.value = '';
        const loadingId = 'loading-' + Date.now();
        const scope = (document.getElementById('chatRepoSelect').value || document.getElementById('chatCategorySelect').value);
        container.insertAdjacentHTML('beforeend', `<div class="message ai" id="${loadingId}"><span class="loader dark"></span> Buscando en tu repositorio...</div>`);
        container.scrollTop = container.scrollHeight;
        try {
            const body = { message };
            const repoIdSel = document.getElementById('chatRepoSelect').value;
            const catSel = document.getElementById('chatCategorySelect').value;
            if (repoIdSel) body.repository_id = repoIdSel;
            if (catSel) body.category = catSel;
            const data = await API.post('/api/chat/', body);
            const el = document.getElementById(loadingId);
            if (el) el.remove();
            const mode = data.mode === 'llm' ? 'Generado con LLM' : 'Generado en modo demo local';
            let scopeNote = '';
            if (repoIdSel || catSel) {
                const repoName = repoIdSel ? (this._repos.find((r) => String(r.id) === repoIdSel) || {}).name || repoIdSel : 'todos';
                const catName = catSel ? catSel[0].toUpperCase() + catSel.slice(1) : 'todas';
                scopeNote = `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.4rem;">Búsqueda específica en: ${HELPERS.escapeHtml(repoName)} · categoría ${HELPERS.escapeHtml(catName)}</div>`;
            }
            const sources = (data.sources || []).map((s, i) =>
                `<span class="source">Fuente ${i + 1}: <a href="#" class="source-link" onclick="App.openDetail(${s.doc_id}); return false;">documento #${s.doc_id}</a> (relevancia ${s.score})<br>${HELPERS.escapeHtml(s.snippet || '')}</span>`).join('');
            container.insertAdjacentHTML('beforeend',
                `<div class="message ai">${HELPERS.escapeHtml(data.answer || 'El sistema no devolvió respuesta.')}<span class="mode-badge">${mode} · ${data.response_time_ms}ms</span>${scopeNote}${sources}</div>`);
        } catch (err) {
            const el = document.getElementById(loadingId);
            if (el) el.remove();
            container.insertAdjacentHTML('beforeend', `<div class="message ai">Error: ${HELPERS.escapeHtml(err.message)}</div>`);
        }
        container.scrollTop = container.scrollHeight;
    },

    // ===== Monitoreo (admin) =====
    async loadMonitoring() {
        try {
            const data = await API.get('/api/monitoring/logs');
            const counts = data.status_counts || {};
            document.getElementById('monitorCounts').innerHTML =
                `<div class="grid-stats">
                    <div class="card stat-card"><h3>Total</h3><div class="value">${counts.total || 0}</div></div>
                    <div class="card stat-card"><h3>Indexados</h3><div class="value">${counts.indexed || 0}</div></div>
                    <div class="card stat-card"><h3>Procesando</h3><div class="value">${counts.processing || 0}</div></div>
                    <div class="card stat-card"><h3>Fallidos</h3><div class="value">${counts.failed || 0}</div></div>
                </div>`;
            const errorsTb = document.getElementById('errorLogsBody');
            const logs = data.errors || [];
            errorsTb.innerHTML = logs.length
                ? logs.map((l) => `<tr>
                    <td>${l.id}</td><td>${l.document_id || '-'}</td><td>${HELPERS.escapeHtml(l.error_code)}</td>
                    <td>${HELPERS.escapeHtml(l.message)}</td><td>${HELPERS.escapeHtml(l.level)}</td><td>${HELPERS.formatDate(l.created_at)}</td>
                </tr>`).join('')
                : '<tr><td colspan="6" class="empty-state">Sin errores registrados</td></tr>';
            const ai = await API.get('/api/monitoring/ai-logs');
            const aiTb = document.getElementById('aiLogsBody');
            aiTb.innerHTML = ai.length
                ? ai.map((l) => `<tr>
                    <td>${l.id}</td><td>${l.document_id || '-'}</td><td>${HELPERS.escapeHtml(l.operation_type)}</td>
                    <td>${l.tokens_used}</td><td>${l.processing_time_ms || '-'}</td><td>${HELPERS.formatDate(l.timestamp)}</td>
                </tr>`).join('')
                : '<tr><td colspan="6" class="empty-state">Sin registros de IA</td></tr>';
            HELPERS.icons();
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    // ===== Configuración (admin) =====
    async loadConfig() {
        try {
            const c = await API.get('/api/config/');
            document.getElementById('cfgModel').value = c.llm_model || '';
            document.getElementById('cfgChunkSize').value = c.chunk_size || 512;
            document.getElementById('cfgChunkOverlap').value = c.chunk_overlap || 64;
            document.getElementById('cfgOpenAiHost').innerHTML =
                `<label>Estado de la API de OpenAI</label><div style="font-size:0.9rem;">
                    ${c.openai_configured ? 'Configurada (activada por variable de entorno)' : 'No configurada (modo demo local)'}
                 </div>`;
        } catch (err) { this.showToast(err.message, 'error'); }
    },

    async saveConfig(e) {
        e.preventDefault();
        const btn = document.getElementById('cfgSaveBtn');
        this.setBusy(btn, true);
        try {
            const c = await API.put('/api/config/', {
                llm_model: document.getElementById('cfgModel').value.trim(),
                chunk_size: Number(document.getElementById('cfgChunkSize').value),
                chunk_overlap: Number(document.getElementById('cfgChunkOverlap').value),
            });
            this.showToast('Configuración guardada y aplicada a nuevos procesos', 'success');
            this.loadConfig();
        } catch (err) { this.showToast(err.message, 'error'); }
        finally { this.setBusy(btn, false); HELPERS.icons(); }
    },

    // ===== Utilidades =====
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
        const color = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)';
        toast.style.borderLeftColor = color;
        toast.innerHTML = `<i data-lucide="${icon}" style="color:${color}"></i><span style="font-size:0.9rem;">${HELPERS.escapeHtml(message)}</span>`;
        container.appendChild(toast);
        HELPERS.icons();
        setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3500);
    },
};

// Inicialización de la UI de categorías en el filtro
(function populateFilters() {
    const select = document.getElementById('filterCategory');
    CATEGORY_OPTIONS.forEach((c) => { select.innerHTML += `<option value="${c}">${c[0].toUpperCase() + c.slice(1)}</option>`; });
})();

document.addEventListener('DOMContentLoaded', () => App.init());
if (document.readyState !== 'loading') App.init();