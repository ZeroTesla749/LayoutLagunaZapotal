// ================================================================
// INVENTARIO
// ================================================================
function filtrarInventario() {
  const tipo    = document.getElementById('inv-tipo').value;
  const estado  = document.getElementById('inv-estado').value;
  const pasillo = document.getElementById('inv-pasillo').value;
  const search  = (document.getElementById('inv-search').value || '').toLowerCase();

  let data = tipo === 'casing' ? getCasing() : getAIB();

  if (estado  !== 'todos') data = data.filter(r => r.estado === estado);
  if (pasillo !== 'todos') data = data.filter(r => String(r.pasillo) === pasillo);
  if (search) {
    data = data.filter(r => {
      const str = JSON.stringify(r).toLowerCase();
      return str.includes(search);
    });
  }

  renderTablaInventario(tipo, data);
  setText('inv-count', data.length + ' registros');
}

function renderTablaInventario(tipo, data) {
  const thead = document.getElementById('inv-thead');
  const tbody = document.getElementById('inv-tbody');

  if (tipo === 'casing') {
    thead.innerHTML = `<tr>
      <th>Rack ID</th><th>Pasillo</th><th>Fila</th><th>N° Rack</th>
      <th>Estado</th><th>Medida</th><th>Peso (lb/ft)</th>
      <th>Tubos</th><th>Cap. Máx.</th><th>% Cap.</th>
      <th>Estibado</th><th>Observaciones</th>
    </tr>`;
    tbody.innerHTML = data.map(r => {
      const cant = parseInt(r.cantidad_tubos) || 0;
      const max  = parseInt(r.capacidad_maxima) || CONFIG.CAPACIDAD_MAX_CASING;
      const pct  = max > 0 ? Math.round((cant/max)*100) : 0;
      const excede = cant > max;
      return `<tr>
        <td><strong>${r.rack_id}</strong></td>
        <td>${r.pasillo}</td>
        <td>${r.fila}</td>
        <td>${r.numero_rack}</td>
        <td>${badgeEstado(r.estado)}</td>
        <td>${r.medida_casing || '—'}</td>
        <td>${r.peso_lbft || '—'}</td>
        <td><strong>${cant}</strong></td>
        <td>${max}</td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:8px;background:#e0e0e0;border-radius:4px;overflow:hidden">
              <div style="width:${Math.min(100,pct)}%;height:100%;background:${colorPct(pct,excede)};border-radius:4px"></div>
            </div>
            <span style="font-size:11px;white-space:nowrap;color:${excede?'#B71C1C':'inherit'}">${pct}%${excede?' ⚠':''}</span>
          </div>
        </td>
        <td>${r.estibado==true||r.estibado==='true'||r.estibado==='TRUE'
          ? '<span style="color:#1565C0;font-weight:600">✓ Sí</span>'
          : '<span style="color:#999">No</span>'}</td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.observaciones||'—'}</td>
      </tr>`;
    }).join('');
  } else {
    thead.innerHTML = `<tr>
      <th>Rack ID</th><th>Pasillo</th><th>N° Rack</th>
      <th>Estado</th><th>Modelo AIB</th><th>N° Serie</th>
      <th>Potencia (HP)</th><th>Observaciones</th>
    </tr>`;
    tbody.innerHTML = data.map(r => `<tr>
      <td><strong>${r.rack_id}</strong></td>
      <td>${r.pasillo}</td>
      <td>${r.numero_rack}</td>
      <td>${badgeEstadoAIB(r.estado)}</td>
      <td>${r.modelo_aib||'—'}</td>
      <td>${r.numero_serie||'—'}</td>
      <td>${r.potencia_hp||'—'}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.observaciones||'—'}</td>
    </tr>`).join('');
  }
}

function badgeEstado(estado) {
  const labels = {libre:'Libre',parcial:'Parcial',lleno:'Lleno'};
  return `<span class="badge badge-${estado}">${labels[estado]||estado}</span>`;
}
function badgeEstadoAIB(estado) {
  const labels = {libre:'Libre',en_uso:'En Uso',en_mantenimiento:'Mantenimiento'};
  return `<span class="badge badge-${estado}">${labels[estado]||estado}</span>`;
}
function colorPct(pct, excede) {
  if (excede)    return '#E53935';
  if (pct>=100)  return '#F18448';
  if (pct>0)     return '#FFD100';
  return '#97D700';
}
