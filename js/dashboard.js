// ================================================================
// DASHBOARD
// ================================================================
function actualizarDashboard() {
  const casing = getCasing();
  const aib    = getAIB();
  const desp   = getDespachos();

  // Casing stats
  const libres   = casing.filter(r => r.estado === 'libre').length;
  const parciales= casing.filter(r => r.estado === 'parcial').length;
  const llenos   = casing.filter(r => r.estado === 'lleno').length;
  const totalTub = casing.reduce((s,r) => s + (parseInt(r.cantidad_tubos)||0), 0);

  setText('kpi-libres',   libres);
  setText('kpi-parciales', parciales);
  setText('kpi-llenos',   llenos);
  setText('kpi-tubos',    totalTub.toLocaleString('es'));

  // Estibado
  const estibados  = casing.filter(r => r.estibado == true || r.estibado === 'true' || r.estibado === 'TRUE');
  const sinEstibar = casing.filter(r => !(r.estibado == true || r.estibado === 'true' || r.estibado === 'TRUE'));
  const tubEst = estibados.reduce((s,r) => s+(parseInt(r.cantidad_tubos)||0), 0);
  const tubSin = sinEstibar.reduce((s,r) => s+(parseInt(r.cantidad_tubos)||0), 0);
  const totalRacks = estibados.length + sinEstibar.length;
  const pctEst = totalRacks > 0 ? Math.round((estibados.length/totalRacks)*100) : 0;

  setText('est-estibados', estibados.length);
  setText('est-sinest',    sinEstibar.length);
  setText('est-tubos-est',  tubEst.toLocaleString('es') + ' tubos');
  setText('est-tubos-sinest', tubSin.toLocaleString('es') + ' tubos');
  setProgress('prog-estibado', pctEst, '#1565C0');
  setText('prog-est-label', pctEst + '% estibado');

  // AIB
  const aibLibre = aib.filter(r => r.estado === 'libre').length;
  const aibUso   = aib.filter(r => r.estado === 'en_uso').length;
  const aibMant  = aib.filter(r => r.estado === 'en_mantenimiento').length;
  const totalAIB = aib.length;
  const pctAIB   = totalAIB > 0 ? Math.round(((aibUso+aibMant)/totalAIB)*100) : 0;

  setText('aib-libre', aibLibre);
  setText('aib-uso',   aibUso);
  setText('aib-mant',  aibMant);
  setProgress('prog-aib', pctAIB, '#1565C0');
  setText('prog-aib-label', pctAIB + '% ocupado');

  // Despachos
  const despCasing = desp.filter(d => d.tipo === 'CASING').length;
  const tubosDespachados = desp
    .filter(d => d.tipo === 'CASING')
    .reduce((s,d) => s+(parseInt(d.cantidad_despachada)||0), 0);

  setText('kpi-desp-casing', despCasing);
  setText('kpi-tubos-desp',  tubosDespachados.toLocaleString('es'));
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function setProgress(id, pct, color) {
  const el = document.getElementById(id);
  if (el) { el.style.width = pct + '%'; el.style.background = color; }
}
