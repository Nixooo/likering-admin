let currentPage = 1;
let currentSearch = '';
let currentStatus = '';
let totalPages = 1;

// Cargar usuarios
async function loadUsers(page = 1) {
    try {
        currentSearch = document.getElementById('searchInput').value;
        currentStatus = document.getElementById('statusFilter').value;
        currentPage = page;

        const params = new URLSearchParams({
            limit: 20,
            offset: (page - 1) * 20
        });

        if (currentSearch) {
            params.append('search', currentSearch);
        }

        if (currentStatus) {
            params.append('estado', currentStatus);
        }

        const response = await apiRequest(`/users?${params.toString()}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const data = await response.json();
        displayUsers(data.users);
        
        totalPages = Math.ceil(data.total / 20);
        updatePagination(data.total, page);
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="8" class="loading">Error al cargar usuarios</td></tr>';
    }
}

// Mostrar usuarios en la tabla
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No se encontraron usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.user_id || user.id || 'N/A'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${user.image_url || 'https://ui-avatars.com/api/?name=' + (user.username || 'User') + '&background=3b82f6&color=fff&size=32'}" 
                         alt="${user.username}" 
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${user.username || 'User'}&background=3b82f6&color=fff&size=32'">
                    <span>@${user.username || 'N/A'}</span>
                </div>
            </td>
            <td>
                <span class="user-plan">${(user.plan || 'azul').toUpperCase()}</span>
            </td>
            <td>${user.total_videos || 0}</td>
            <td>${(user.total_likes || 0).toLocaleString()}</td>
            <td>${(user.total_visualizaciones || 0).toLocaleString()}</td>
            <td>
                <span class="status-badge ${(user.estado || 'Activo') === 'Activo' ? 'status-active' : 'status-inactive'}">
                    ${user.estado || 'Activo'}
                </span>
            </td>
            <td>
                <button 
                    class="btn btn-sm ${(user.estado || 'Activo') === 'Activo' ? 'btn-danger' : 'btn-success'}" 
                    onclick="toggleUserStatus(${user.user_id || user.id}, '${(user.estado || 'Activo') === 'Activo' ? 'Desactivo' : 'Activo'}')"
                >
                    ${(user.estado || 'Activo') === 'Activo' ? 'Desactivar' : 'Activar'}
                </button>
                <button 
                    class="btn btn-sm btn-secondary" 
                    onclick="viewUserDetails(${user.user_id || user.id})"
                    style="margin-left: 5px;"
                >
                    Ver Detalles
                </button>
            </td>
        </tr>
    `).join('');
}

// Cambiar estado de usuario
async function toggleUserStatus(userId, newEstado) {
    const estadoTexto = newEstado === 'Activo' ? 'activar' : 'desactivar';
    if (!confirm(`¿Estás seguro de que deseas ${estadoTexto} este usuario?`)) {
        return;
    }

    try {
        const response = await apiRequest(`/users/${userId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: newEstado })
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al actualizar usuario');
            return;
        }

        alert(`Usuario ${estadoTexto}do correctamente`);
        loadUsers(currentPage);
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado del usuario');
    }
}

// Ver detalles del usuario
async function viewUserDetails(userId) {
    try {
        const response = await apiRequest(`/users/${userId}/stats`);
        if (!response) return;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al cargar detalles');
        }

        const user = await response.json();
        
        // Crear modal en lugar de alert
        showUserDetailsModal(user);
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        alert('Error al cargar los detalles del usuario: ' + error.message);
    }
}

// Mostrar modal de detalles de usuario
function showUserDetailsModal(user) {
    const modal = document.getElementById('userDetailsModal');
    const content = document.getElementById('userDetailsContent');
    
    content.innerHTML = `
        <div class="user-details-header">
            <img src="${user.image_url || 'https://ui-avatars.com/api/?name=' + (user.username || 'User') + '&background=3b82f6&color=fff&size=128'}" 
                 alt="${user.username}" 
                 class="user-details-avatar"
                 onerror="this.src='https://ui-avatars.com/api/?name=${user.username || 'User'}&background=3b82f6&color=fff&size=128'">
            <div>
                <h3>@${user.username || 'N/A'}</h3>
                <span class="user-plan">Plan: ${(user.plan || 'azul').toUpperCase()}</span>
                <span class="status-badge ${(user.estado || 'Activo') === 'Activo' ? 'status-active' : 'status-inactive'}" style="margin-left: 10px;">
                    ${user.estado || 'Activo'}
                </span>
            </div>
        </div>
        <div class="user-details-info">
            <div class="detail-row">
                <span class="detail-label">ID:</span>
                <span class="detail-value">${user.user_id || user.id || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Creado:</span>
                <span class="detail-value">${user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'N/A'}</span>
            </div>
        </div>
        <hr style="margin: 20px 0; border-color: var(--border-color);">
        <h4 style="margin-bottom: 15px; color: var(--text-primary);">Estadísticas</h4>
        <div class="user-stats-grid">
            <div class="stat-box">
                <div class="stat-box-icon">🎥</div>
                <div class="stat-box-info">
                    <div class="stat-box-value">${user.total_videos || 0}</div>
                    <div class="stat-box-label">Videos</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-box-icon">❤️</div>
                <div class="stat-box-info">
                    <div class="stat-box-value">${(user.total_likes || 0).toLocaleString()}</div>
                    <div class="stat-box-label">Likes</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-box-icon">👁️</div>
                <div class="stat-box-info">
                    <div class="stat-box-value">${(user.total_visualizaciones || 0).toLocaleString()}</div>
                    <div class="stat-box-label">Visualizaciones</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-box-icon">👥</div>
                <div class="stat-box-info">
                    <div class="stat-box-value">${user.total_seguidores || user.followers || 0}</div>
                    <div class="stat-box-label">Seguidores</div>
                </div>
            </div>
            <div class="stat-box">
                <div class="stat-box-icon">➕</div>
                <div class="stat-box-info">
                    <div class="stat-box-value">${user.total_siguiendo || user.following || 0}</div>
                    <div class="stat-box-label">Siguiendo</div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Cerrar modal
function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('userDetailsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Cambiar página
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadUsers(newPage);
    }
}

// Actualizar paginación
function updatePagination(total, page) {
    document.getElementById('pageInfo').textContent = 
        `Página ${page} de ${totalPages} (${total} usuarios)`;
    
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Búsqueda al presionar Enter
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadUsers(1);
        }
    });
}

// Cargar usuarios al iniciar
if (window.location.pathname.includes('users.html')) {
    loadUsers();
}

