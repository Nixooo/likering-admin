const API_BASE = '/api';

// Obtener token del localStorage
function getToken() {
    return localStorage.getItem('admin_token');
}

// Guardar token en localStorage
function saveToken(token, admin) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_data', JSON.stringify(admin));
}

// Eliminar token
function clearAuth() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_data');
}

// Verificar autenticación
async function checkAuth() {
    const token = getToken();
    if (!token) {
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/';
        }
        return false;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            clearAuth();
            if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                window.location.href = '/';
            }
            return false;
        }

        const data = await response.json();
        if (document.getElementById('adminName')) {
            document.getElementById('adminName').textContent = data.admin.nombre;
        }
        return true;
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        clearAuth();
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = '/';
        }
        return false;
    }
}

// Función para hacer requests autenticados
async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    if (response.status === 401) {
        clearAuth();
        window.location.href = '/';
        return null;
    }

    return response;
}

// Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorMsg = document.getElementById('errorMessage');
        errorMsg.classList.remove('show');
        errorMsg.textContent = '';

        const correo = document.getElementById('correo').value;
        const contraseña = document.getElementById('contraseña').value;

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contraseña })
            });

            const data = await response.json();

            if (!response.ok) {
                errorMsg.textContent = data.error || 'Error al iniciar sesión';
                errorMsg.classList.add('show');
                return;
            }

            saveToken(data.token, data.admin);
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Error en login:', error);
            errorMsg.textContent = 'Error de conexión. Por favor, intenta de nuevo.';
            errorMsg.classList.add('show');
        }
    });
}

// Logout
function logout() {
    clearAuth();
    window.location.href = '/';
}

// Verificar autenticación al cargar páginas protegidas
if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
    checkAuth();
}

