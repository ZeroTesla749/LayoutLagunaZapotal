// ================================================================
// API — comunicación con Google Sheets
// ================================================================
let DATA = { casing: [], aib: [], despachos: [], config: {} };
let lastSync = null;

async function fetchSheet(accion) {
  const url = CONFIG.SHEETS_URL + '?accion=' + accion;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

async function postSheet(payload) {
  const resp = await fetch(CONFIG.SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

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

    // Actualizar todas las vistas
    actualizarDashboard();
    filtrarInventario();
    filtrarDespachos();
    notificarPlano();

  } catch(e) {
    setSyncStatus('✗ Error: ' + e.message);
    console.error('cargarTodo:', e);
  }
}

async function sincronizar() {
  await cargarTodo();
}

function setSyncStatus(msg) {
  document.getElementById('sync-status').textContent = msg;
}

// Actualizar un rack individual en el Sheet
async function actualizarRackSheet(rackId, campos) {
  return postSheet({
    accion:      'actualizar_rack',
    rack_id:     rackId,
    campos:      campos,
    dispositivo: 'web'
  });
}

// Helpers de acceso a datos
function getCasing()    { return DATA.casing; }
function getAIB()       { return DATA.aib; }
function getDespachos() { return DATA.despachos; }

function getRackById(id) {
  return DATA.casing.find(r => r.rack_id === id) ||
         DATA.aib.find(r => r.rack_id === id)    || null;
}
