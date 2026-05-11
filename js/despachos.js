// ================================================================
// DESPACHOS
// ================================================================
function filtrarDespachos() {
  const tipo   = document.getElementById('desp-tipo').value;
  const search = (document.getElementById('desp-search').value || '').toLowerCase();

  let data = getDespachos();
  if (tipo !== 'todos') data = data.filter(d => d.tipo === tipo);
  if (search) data = data.filter(d => JSON.stringify(d).toLowerCase().includes(search));

  // Ordenar por fecha descendente
  data.sort((a,b) => new Date(b.fecha||0) - new Date(a.fecha||0));

  const tbody = document.getElementById('desp-tbody');
  tbody.innerHTML = data.map(d => {
    const fecha = formatFecha(d.fecha);
    const colorTipo = d.tipo === 'CASING' ? '#1565C0' : '#F18448';
    return `<tr>
      <td style="white-space:nowrap">${fecha}</td>
      <td><span style="font-weight:700;color:${colorTipo}">${d.tipo}</span></td>
      <td><strong>${d.rack_id||'—'}</strong></td>
      <td>${parseInt(d.cantidad_despachada)||0}</td>
      <td>${parseInt(d.cantidad_antes)||0}</td>
      <td>${parseInt(d.cantidad_despues)||0}</td>
      <td>${d.destino||'—'}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.observaciones||'—'}</td>
    </tr>`;
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:#999;padding:24px">Sin despachos registrados</td></tr>';

  setText('desp-count', data.length + ' despacho(s)');
}

function formatFecha(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es', {
      day:'2-digit',month:'2-digit',year:'numeric',
      hour:'2-digit',minute:'2-digit'
    });
  } catch { return iso; }
}
