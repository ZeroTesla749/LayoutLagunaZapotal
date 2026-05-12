// ================================================================
// API — comunicación con Google Sheets
// Fix CORS: usamos GET con parámetros para escritura también,
// ya que GitHub Pages no puede hacer POST cross-origin sin preflight
// ================================================================
let DATA = { casing: [], aib: [], despachos: [], config: {} };
let lastSync = null;

const BASE_URL = CONFIG.SHEETS_URL;

// ── GET (lectura) ─────────────────────────────────────────────
async function fetchSheet(accion) {
  const url  = BASE_URL + '?accion=' + accion + '&_=' + Date.now();
  const resp = await fetch(url, { redirect: 'follow' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

// ── POST via fetch con no-cors fallback ───────────────────────
// Google Apps Script acepta GET con todos los parámetros en la URL
// para evitar el bloqueo CORS en peticiones POST desde páginas externas
async function postSheet(payload) {
  // Primero intentamos POST normal
  try {
    const resp = await fetch(BASE_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'text/plain' }, // text/plain evita preflight CORS
      body:    JSON.stringify(payload),
      redirect:'follow'
    });
    if (resp.ok) return resp.json();
  } catch (e) {
    console.warn('POST falló, intentando GET fallback:', e.message);
  }

  // Fallback: GET con payload en parámetro (el .gs lo procesa igual)
  const encoded = encodeURIComponent(JSON.stringify(payload));
  const url = BASE_URL + '?payload=' + encoded + '&_=' + Date.now();
  const resp = await fetch(url, { redirect: 'follow' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

// ── CARGAR TODO ───────────────────────────────────────────────
async function cargarTodo() {
  setSyncStatus('Sincronizando...');
  try {
    const data = await fetchSheet('leer_todo');
    if (!data.ok) throw new Error(data.error || 'Error del servidor');

    DATA.casing    = data.casing    || [];
    DATA.aib       = data.aib       || [];
    DATA.despachos = data.despachos || [];
    DATA.config    = data.config    || {};

    lastSync = new Date();
    setSyncStatus('✓ ' + lastSync.toLocaleTimeString('es'));
    document.getElementById('last-sync-label').textContent =
      'Última sync: ' + lastSync.toLocaleString('es');

    actualizarDashboard();
    filtrarInventario();
    filtrarDespachos();
    notificarPlano();

  } catch(e) {
    setSyncStatus('✗ ' + e.message);
    console.error('cargarTodo:', e);
  }
}

async function sincronizar() { await cargarTodo(); }

function setSyncStatus(msg) {
  const el = document.getElementById('sync-status');
  if (el) el.textContent = msg;
}

// ── ACTUALIZAR RACK ───────────────────────────────────────────
async function actualizarRackSheet(rackId, campos) {
  return postSheet({
    accion:      'actualizar_rack',
    rack_id:     rackId,
    campos:      campos,
    dispositivo: 'web'
  });
}

// ── HELPERS ───────────────────────────────────────────────────
function getCasing()    { return DATA.casing; }
function getAIB()       { return DATA.aib; }
function getDespachos() { return DATA.despachos; }

function getRackById(id) {
  return DATA.casing.find(r => r.rack_id === id) ||
         DATA.aib.find(r => r.rack_id === id)    || null;
}
