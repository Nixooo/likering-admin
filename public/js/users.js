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
            '<tr><td colspan="9" class="loading">Error al cargar usuarios</td></tr>';
    }
}

// Mostrar usuarios en la tabla
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No se encontraron usuarios</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.nombre || 'N/A'}</td>
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
                    onclick="toggleUserStatus(${user.id}, '${(user.estado || 'Activo') === 'Activo' ? 'Desactivo' : 'Activo'}')"
                >
                    ${(user.estado || 'Activo') === 'Activo' ? 'Desactivar' : 'Activar'}
                </button>
                <button 
                    class="btn btn-sm btn-secondary" 
                    onclick="viewUserDetails(${user.id})"
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
            throw new Error('Error al cargar detalles');
        }

        const user = await response.json();
        const details = `
            <h3>Detalles del Usuario</h3>
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Username:</strong> ${user.username || 'N/A'}</p>
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Nombre:</strong> ${user.nombre || 'N/A'}</p>
            <p><strong>Estado:</strong> ${user.estado || 'Activo'}</p>
            <hr>
            <h4>Estadísticas</h4>
            <p><strong>Total Videos:</strong> ${user.total_videos || 0}</p>
            <p><strong>Total Likes:</strong> ${(user.total_likes || 0).toLocaleString()}</p>
            <p><strong>Total Visualizaciones:</strong> ${(user.total_visualizaciones || 0).toLocaleString()}</p>
            <p><strong>Total Seguidores:</strong> ${user.total_seguidores || 0}</p>
            <p><strong>Total Siguiendo:</strong> ${user.total_siguiendo || 0}</p>
        `;
        alert(details.replace(/<[^>]*>/g, ''));
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        alert('Error al cargar los detalles del usuario');
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

