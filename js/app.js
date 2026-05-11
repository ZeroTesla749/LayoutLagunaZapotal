// ================================================================
// APP — navegación, plano y funciones globales
// ================================================================

// ── NAVEGACIÓN ────────────────────────────────────────────────
function showTab(nombre) {
  // Ocultar todas las secciones
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  document.getElementById('tab-' + nombre).classList.add('active');
  document.getElementById('nav-' + nombre).classList.add('active');

  // Cerrar sidebar en móvil
  document.getElementById('sidebar').classList.remove('open');

  // Si va al inventario, inicializar tabla
  if (nombre === 'inventario') filtrarInventario();
  if (nombre === 'despachos')  filtrarDespachos();
  if (nombre === 'editar')     cargarRacksEdit();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── PLANO ─────────────────────────────────────────────────────
// El plano.html corre en un iframe y se comunica via postMessage
function notificarPlano() {
  const iframe = document.getElementById('plano-iframe');
  if (!iframe || !iframe.contentWindow) return;
  const payload = {
    type: 'SET_INVENTARIO',
    data: { casing: getCasing(), aib: getAIB() }
  };
  iframe.contentWindow.postMessage(payload, '*');
}

// Escuchar mensajes del plano (rack seleccionado)
window.addEventListener('message', function(event) {
  if (!event.data || !event.data.type) return;

  if (event.data.type === 'RACK_SELECTED') {
    mostrarDetalleRack(event.data.rackId, event.data.inv);
  }
  if (event.data.type === 'PLANO_READY') {
    notificarPlano();
  }
});

function mostrarDetalleRack(rackId, inv) {
  const panel  = document.getElementById('rack-detail-panel');
  const title  = document.getElementById('rd-title');
  const body   = document.getElementById('rd-body');
  const btns   = document.getElementById('rd-btns');

  const tipo   = inv._tipo || 'casing';
  const pasillo = rackId.startsWith('P11') ? '1.1'
                : rackId.startsWith('P12') ? '1.2'
                : rackId.startsWith('P13') ? '1.3' : '1.4';
  const estado = inv.estado || 'libre';

  title.textContent = 'Pasillo ' + pasillo + ' · ' + rackId.split('_').pop();

  let rows = `
    <div class="rd-row"><span class="rd-label">Tipo</span>
      <span class="rd-val">${tipo==='casing'?'Casing (tubería)':'Equipo AIB'}</span></div>
    <div class="rd-row"><span class="rd-label">Estado</span>
      <span class="rd-val">${estado}</span></div>`;

  if (tipo === 'casing') {
    const max  = parseInt(inv.capacidadMaxima) || CONFIG.CAPACIDAD_MAX_CASING;
    const cant = parseInt(inv.cantidadTubos)   || 0;
    const pct  = max > 0 ? Math.round((cant/max)*100) : 0;
    const excede = cant > max;
    rows += `
      <div class="rd-row"><span class="rd-label">Medida</span>
        <span class="rd-val">${inv.medidaCasing||'—'}</span></div>
      <div class="rd-row"><span class="rd-label">Peso</span>
        <span class="rd-val">${inv.pesoLbft?inv.pesoLbft+' lb/ft':'—'}</span></div>
      <div class="rd-row"><span class="rd-label">Tubos</span>
        <span class="rd-val">${cant} / ${max}</span></div>
      <div class="rd-row"><span class="rd-label">Capacidad</span>
        <span class="rd-val" style="color:${excede?'#E53935':''}">${pct}%${excede?' ⚠':''}</span></div>
      <div class="rd-row"><span class="rd-label">Estibado</span>
        <span class="rd-val">${inv.estibado?'✓ Sí':'No'}</span></div>`;
  } else {
    rows += `
      <div class="rd-row"><span class="rd-label">Modelo AIB</span>
        <span class="rd-val">${inv.modeloAib||'—'}</span></div>
      <div class="rd-row"><span class="rd-label">N° Serie</span>
        <span class="rd-val">${inv.numeroSerie||'—'}</span></div>
      <div class="rd-row"><span class="rd-label">Potencia</span>
        <span class="rd-val">${inv.potenciaHp?inv.potenciaHp+' HP':'—'}</span></div>`;
  }

  if (inv.observaciones)
    rows += `<div class="rd-row"><span class="rd-label">Obs.</span>
      <span class="rd-val">${inv.observaciones}</span></div>`;

  body.innerHTML = rows;

  // Botones según rol
  let bHtml = '';
  if (isAdmin()) {
    bHtml += `<button style="background:#FFD100;color:#4B4F54"
      onclick="irAEditar('${rackId}','${tipo}')">✏ Editar</button>`;
  }
  btns.innerHTML = bHtml;

  panel.style.display = 'block';
}

function cerrarDetalle() {
  document.getElementById('rack-detail-panel').style.display = 'none';
  // Limpiar highlight en el plano
  const iframe = document.getElementById('plano-iframe');
  if (iframe && iframe.contentWindow)
    iframe.contentWindow.postMessage({type:'LIMPIAR_HIGHLIGHTS'}, '*');
}

function irAEditar(rackId, tipo) {
  cerrarDetalle();
  document.getElementById('edit-tipo').value = tipo;
  cargarRacksEdit();
  setTimeout(() => {
    document.getElementById('edit-rack-sel').value = rackId;
    cargarDatosRack();
  }, 100);
  showTab('editar');
}

// ── BÚSQUEDA EN EL PLANO ──────────────────────────────────────
function buscarEnPlano() {
  const tipo = document.getElementById('search-tipo').value;
  const q1   = document.getElementById('search-q1').value.trim().toLowerCase();
  const q2   = document.getElementById('search-q2').value.trim().toLowerCase();
  let   ids  = [];

  if (tipo === 'casing') {
    ids = getCasing()
      .filter(r => r.estado !== 'libre' &&
        r.medida_casing && r.medida_casing.toLowerCase().includes(q1) &&
        (!q2 || (r.peso_lbft && r.peso_lbft.toLowerCase().includes(q2))))
      .map(r => r.rack_id);
  } else {
    ids = getAIB()
      .filter(r => r.estado !== 'libre' &&
        ((r.modelo_aib && r.modelo_aib.toLowerCase().includes(q1)) ||
         (r.numero_serie && r.numero_serie.toLowerCase().includes(q1))))
      .map(r => r.rack_id);
  }

  const iframe = document.getElementById('plano-iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'RESALTAR', ids: ids }, '*');
  }
}

function limpiarBusqueda() {
  document.getElementById('search-q1').value = '';
  document.getElementById('search-q2').value = '';
  const iframe = document.getElementById('plano-iframe');
  if (iframe && iframe.contentWindow)
    iframe.contentWindow.postMessage({ type: 'LIMPIAR_HIGHLIGHTS' }, '*');
}

// Auto-inicializar si ya hay sesión
if (sessionStorage.getItem('lz_role')) {
  cargarTodo();
}
