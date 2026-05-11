// ================================================================
// EDITAR RACK (solo admin)
// ================================================================
let editRackId = null;
let editTipo   = null;

function cargarRacksEdit() {
  const tipo = document.getElementById('edit-tipo').value;
  const sel  = document.getElementById('edit-rack-sel');
  const data = tipo === 'casing' ? getCasing() : getAIB();

  sel.innerHTML = '<option value="">— selecciona un rack —</option>' +
    data.map(r => `<option value="${r.rack_id}">${r.rack_id} · ${r.estado}</option>`).join('');

  document.getElementById('edit-form-card').style.display = 'none';
}

function cargarDatosRack() {
  const id   = document.getElementById('edit-rack-sel').value;
  const tipo = document.getElementById('edit-tipo').value;
  if (!id) { document.getElementById('edit-form-card').style.display = 'none'; return; }

  const rack = getRackById(id);
  if (!rack) return;

  editRackId = id;
  editTipo   = tipo;

  document.getElementById('edit-form-card').style.display = 'block';
  document.getElementById('edit-rack-title').textContent = id;
  document.getElementById('save-status').textContent = '';

  if (tipo === 'casing') {
    document.getElementById('edit-fields-casing').style.display = 'block';
    document.getElementById('edit-fields-aib').style.display    = 'none';
    document.getElementById('ef-estado').value   = rack.estado || 'libre';
    document.getElementById('ef-medida').value   = rack.medida_casing || '';
    document.getElementById('ef-peso').value     = rack.peso_lbft || '';
    document.getElementById('ef-cantidad').value = rack.cantidad_tubos || 0;
    document.getElementById('ef-maxima').value   = rack.capacidad_maxima || CONFIG.CAPACIDAD_MAX_CASING;
    document.getElementById('ef-estibado').checked =
      rack.estibado == true || rack.estibado === 'true' || rack.estibado === 'TRUE';
    document.getElementById('ef-obs').value = rack.observaciones || '';
    actualizarBarraEdit();
  } else {
    document.getElementById('edit-fields-casing').style.display = 'none';
    document.getElementById('edit-fields-aib').style.display    = 'block';
    document.getElementById('ef-estado-aib').value = rack.estado || 'libre';
    document.getElementById('ef-modelo').value     = rack.modelo_aib || '';
    document.getElementById('ef-serie').value      = rack.numero_serie || '';
    document.getElementById('ef-potencia').value   = rack.potencia_hp || '';
    document.getElementById('ef-obs').value        = rack.observaciones || '';
  }
}

function actualizarBarraEdit() {
  const cant = parseInt(document.getElementById('ef-cantidad').value) || 0;
  const max  = parseInt(document.getElementById('ef-maxima').value)   || CONFIG.CAPACIDAD_MAX_CASING;
  const pct  = max > 0 ? Math.min(200, Math.round((cant/max)*100)) : 0;
  const excede = cant > max;
  const prog = document.getElementById('ef-prog');
  prog.style.width      = Math.min(100,pct) + '%';
  prog.style.background = excede ? '#E53935' : pct>=100 ? '#F18448' : pct>0 ? '#FFD100' : '#97D700';
  document.getElementById('ef-prog-label').textContent =
    pct + '%' + (excede ? ' ⚠ EXCEDIDO' : '');

  // Auto-estado
  const estSel = document.getElementById('ef-estado');
  estSel.value = cant === 0 ? 'libre' : cant < max ? 'parcial' : 'lleno';
}

async function guardarRack() {
  if (!editRackId || !isAdmin()) return;
  const statusEl = document.getElementById('save-status');
  statusEl.textContent = 'Guardando...';
  statusEl.className = 'save-status';

  let campos = {};
  if (editTipo === 'casing') {
    const cant = parseInt(document.getElementById('ef-cantidad').value) || 0;
    const max  = parseInt(document.getElementById('ef-maxima').value)   || CONFIG.CAPACIDAD_MAX_CASING;
    const pct  = max > 0 ? Math.min(100, Math.round((cant/max)*100)) : 0;
    campos = {
      estado:         document.getElementById('ef-estado').value,
      medida_casing:  document.getElementById('ef-medida').value,
      peso_lbft:      document.getElementById('ef-peso').value,
      cantidad_tubos: cant,
      capacidad_pct:  pct,
      estibado:       document.getElementById('ef-estibado').checked,
      observaciones:  document.getElementById('ef-obs').value
    };
  } else {
    campos = {
      estado:       document.getElementById('ef-estado-aib').value,
      modelo_aib:   document.getElementById('ef-modelo').value,
      numero_serie: document.getElementById('ef-serie').value,
      potencia_hp:  document.getElementById('ef-potencia').value,
      observaciones:document.getElementById('ef-obs').value
    };
  }

  try {
    const resp = await actualizarRackSheet(editRackId, campos);
    if (resp.ok) {
      statusEl.textContent = '✓ Guardado correctamente';
      statusEl.className   = 'save-status save-ok';
      await cargarTodo(); // Refresca todo
    } else {
      throw new Error(resp.error || 'Error desconocido');
    }
  } catch(e) {
    statusEl.textContent = '✗ ' + e.message;
    statusEl.className   = 'save-status save-err';
  }
}
