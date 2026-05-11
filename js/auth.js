// ================================================================
// AUTENTICACIÓN
// ================================================================
let currentRole = null;

function doLogin() {
  const rol  = document.getElementById('login-rol').value;
  const pass = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');

  if (pass !== CONFIG.PASSWORDS[rol]) {
    errEl.style.display = 'block';
    document.getElementById('login-pass').value = '';
    return;
  }

  errEl.style.display = 'none';
  currentRole = rol;

  // Guardar sesión en sessionStorage
  sessionStorage.setItem('lz_role', rol);

  // Aplicar rol al body
  document.body.classList.remove('login-page');
  document.body.classList.add('role-' + rol);

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  document.getElementById('rol-badge').textContent =
    rol === 'admin' ? '👤 Administrador' : '👁️ Invitado';

  // Cargar datos al entrar
  cargarTodo();
}

function doLogout() {
  sessionStorage.removeItem('lz_role');
  currentRole = null;
  document.body.className = 'login-page';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-pass').value = '';
}

function isAdmin() { return currentRole === 'admin'; }

// Restaurar sesión si ya estaba logueado
(function() {
  const saved = sessionStorage.getItem('lz_role');
  if (saved) {
    document.getElementById('login-rol').value = saved;
    // Auto-login con sesión guardada
    currentRole = saved;
    document.body.classList.remove('login-page');
    document.body.classList.add('role-' + saved);
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('rol-badge').textContent =
      saved === 'admin' ? '👤 Administrador' : '👁️ Invitado';
  }
})();
