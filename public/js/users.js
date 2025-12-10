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
        
        const currentPlan = document.getElementById('planFilter')?.value;
        if (currentPlan) {
            params.append('plan', currentPlan);
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
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    <button 
                        class="btn btn-sm ${(user.estado || 'Activo') === 'Activo' ? 'btn-danger' : 'btn-success'}" 
                        onclick="toggleUserStatus(${user.user_id || user.id}, '${(user.estado || 'Activo') === 'Activo' ? 'Desactivo' : 'Activo'}')"
                        title="${(user.estado || 'Activo') === 'Activo' ? 'Desactivar' : 'Activar'} usuario"
                    >
                        <i class="fas fa-${(user.estado || 'Activo') === 'Activo' ? 'ban' : 'check'}"></i>
                    </button>
                    <button 
                        class="btn btn-sm btn-secondary" 
                        onclick="viewUserDetails(${user.user_id || user.id})"
                        title="Ver detalles"
                    >
                        <i class="fas fa-eye"></i>
                    </button>
                    <button 
                        class="btn btn-sm btn-primary" 
                        onclick="editUser(${user.user_id || user.id})"
                        title="Editar usuario"
                    >
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
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
            const errorData = await response.json().catch(() => ({}));
            alert(errorData.error || 'Error al actualizar el estado del usuario');
            return;
        }

        const result = await response.json();
        alert(`Usuario ${estadoTexto}do correctamente`);
        loadUsers(currentPage);
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        alert('Error al cambiar el estado del usuario: ' + error.message);
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

// Función helper para actualizar usuario después de toggle
async function toggleUserStatusAndReload(userId, newEstado) {
    await toggleUserStatus(userId, newEstado);
    // Recargar detalles si el modal está abierto
    if (document.getElementById('userDetailsModal').style.display === 'block') {
        await viewUserDetails(userId);
    }
}

// Mostrar modal de detalles de usuario
function showUserDetailsModal(user) {
    const modal = document.getElementById('userDetailsModal');
    const content = document.getElementById('userDetailsContent');
    
    content.innerHTML = `
        <div class="user-details-container">
            <div class="user-details-header-modern">
                <div class="user-avatar-section">
                    <img src="${user.image_url || 'https://ui-avatars.com/api/?name=' + (user.username || 'User') + '&background=3b82f6&color=fff&size=128'}" 
                         alt="${user.username}" 
                         class="user-details-avatar-large"
                         onerror="this.src='https://ui-avatars.com/api/?name=${user.username || 'User'}&background=3b82f6&color=fff&size=128'">
                    <button class="btn-edit-avatar" onclick="editUser(${user.user_id || user.id})" title="Editar usuario">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="user-info-section">
                    <h3>@${user.username || 'N/A'}</h3>
                    <div class="user-badges">
                        <span class="plan-badge plan-${(user.plan || 'azul').toLowerCase()}">${(user.plan || 'azul').toUpperCase()}</span>
                        <span class="status-badge ${(user.estado || 'Activo') === 'Activo' ? 'status-active' : 'status-inactive'}">
                            ${user.estado || 'Activo'}
                        </span>
                    </div>
                    <p class="user-id-text">ID: ${user.user_id || user.id || 'N/A'}</p>
                </div>
            </div>
            
            <div class="user-actions-bar">
                <button class="btn-action" onclick="editUser(${user.user_id || user.id})">
                    <i class="fas fa-edit"></i> Editar Usuario
                </button>
                <button class="btn-action ${(user.estado || 'Activo') === 'Activo' ? 'btn-action-danger' : 'btn-action-success'}" 
                        onclick="toggleUserStatusAndReload(${user.user_id || user.id}, '${(user.estado || 'Activo') === 'Activo' ? 'Desactivo' : 'Activo'}')">
                    <i class="fas fa-${(user.estado || 'Activo') === 'Activo' ? 'ban' : 'check'}"></i> 
                    ${(user.estado || 'Activo') === 'Activo' ? 'Desactivar' : 'Activar'}
                </button>
            </div>
            
            <div class="user-info-grid">
                <div class="info-card">
                    <div class="info-icon">📅</div>
                    <div class="info-content">
                        <span class="info-label">Fecha de Creación</span>
                        <span class="info-value">${user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
                <div class="info-card">
                    <div class="info-icon">🔄</div>
                    <div class="info-content">
                        <span class="info-label">Última Actualización</span>
                        <span class="info-value">${user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
            </div>
            
            <div class="section-divider">
                <h4>Estadísticas</h4>
            </div>
            
            <div class="user-stats-grid-modern">
                <div class="stat-card-modern">
                    <div class="stat-icon-modern">🎥</div>
                    <div class="stat-info-modern">
                        <div class="stat-value-modern">${user.total_videos || 0}</div>
                        <div class="stat-label-modern">Videos</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon-modern">❤️</div>
                    <div class="stat-info-modern">
                        <div class="stat-value-modern">${(user.total_likes || 0).toLocaleString()}</div>
                        <div class="stat-label-modern">Likes</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon-modern">👁️</div>
                    <div class="stat-info-modern">
                        <div class="stat-value-modern">${(user.total_visualizaciones || 0).toLocaleString()}</div>
                        <div class="stat-label-modern">Visualizaciones</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon-modern">👥</div>
                    <div class="stat-info-modern">
                        <div class="stat-value-modern">${user.total_seguidores || user.followers || 0}</div>
                        <div class="stat-label-modern">Seguidores</div>
                    </div>
                </div>
                <div class="stat-card-modern">
                    <div class="stat-icon-modern">➕</div>
                    <div class="stat-info-modern">
                        <div class="stat-value-modern">${user.total_siguiendo || user.following || 0}</div>
                        <div class="stat-label-modern">Siguiendo</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Editar usuario
let currentEditingUser = null;

async function editUser(userId) {
    try {
        // Cerrar modal de detalles
        closeUserDetailsModal();
        
        // Obtener datos del usuario
        const response = await apiRequest(`/users/${userId}/stats`);
        if (!response || !response.ok) {
            throw new Error('Error al cargar datos del usuario');
        }
        
        const user = await response.json();
        currentEditingUser = user;
        
        // Mostrar modal de edición
        showUserEditModal(user);
    } catch (error) {
        console.error('Error al cargar usuario para editar:', error);
        alert('Error al cargar los datos del usuario: ' + error.message);
    }
}

// Mostrar modal de edición
function showUserEditModal(user) {
    const modal = document.getElementById('userEditModal');
    const content = document.getElementById('userEditContent');
    
    const plans = ['azul', 'rojo', 'naranja', 'verde', 'morado', 'negro', 'amarillo'];
    
    content.innerHTML = `
        <form id="editUserForm" onsubmit="saveUserChanges(event)">
            <div class="edit-form-section">
                <h3 class="section-title">
                    <i class="fas fa-user"></i> Información Básica
                </h3>
                <div class="form-group-modern">
                    <label class="form-label-modern">
                        <i class="fas fa-at"></i> Username
                    </label>
                    <input type="text" id="edit-username" class="form-input-modern" value="${user.username || ''}" required>
                </div>
                <div class="form-group-modern">
                    <label class="form-label-modern">
                        <i class="fas fa-image"></i> URL de Imagen de Perfil
                    </label>
                    <input type="url" id="edit-image_url" class="form-input-modern" value="${user.image_url || ''}">
                    <div class="image-preview-container">
                        <img id="imagePreview" src="${user.image_url || 'https://ui-avatars.com/api/?name=' + (user.username || 'User')}" 
                             alt="Preview" class="image-preview">
                    </div>
                </div>
            </div>
            
            <div class="edit-form-section">
                <h3 class="section-title">
                    <i class="fas fa-crown"></i> Plan y Estado
                </h3>
                <div class="form-group-modern">
                    <label class="form-label-modern">
                        <i class="fas fa-tag"></i> Plan
                    </label>
                    <select id="edit-plan" class="form-input-modern">
                        ${plans.map(plan => `
                            <option value="${plan}" ${(user.plan || 'azul').toLowerCase() === plan ? 'selected' : ''}>
                                ${plan.charAt(0).toUpperCase() + plan.slice(1)}
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group-modern">
                    <label class="form-label-modern">
                        <i class="fas fa-toggle-on"></i> Estado
                    </label>
                    <select id="edit-estado" class="form-input-modern">
                        <option value="Activo" ${(user.estado || 'Activo') === 'Activo' ? 'selected' : ''}>Activo</option>
                        <option value="Desactivo" ${user.estado === 'Desactivo' ? 'selected' : ''}>Desactivo</option>
                    </select>
                </div>
            </div>
            
            <div class="edit-form-section">
                <h3 class="section-title">
                    <i class="fas fa-lock"></i> Seguridad
                </h3>
                <div class="form-group-modern">
                    <label class="form-label-modern">
                        <i class="fas fa-key"></i> Nueva Contraseña
                    </label>
                    <input type="password" id="edit-password" class="form-input-modern" placeholder="Dejar vacío para no cambiar">
                    <small class="form-help">Mínimo 6 caracteres. Solo se cambiará si se proporciona un valor.</small>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeUserEditModal()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Guardar Cambios
                </button>
            </div>
        </form>
    `;
    
    // Preview de imagen al cambiar URL
    document.getElementById('edit-image_url').addEventListener('input', function(e) {
        const preview = document.getElementById('imagePreview');
        if (e.target.value) {
            preview.src = e.target.value;
        }
    });
    
    modal.style.display = 'block';
}

// Guardar cambios del usuario
async function saveUserChanges(event) {
    event.preventDefault();
    
    if (!currentEditingUser) {
        alert('Error: No hay usuario seleccionado para editar');
        return;
    }
    
    const username = document.getElementById('edit-username').value.trim();
    const plan = document.getElementById('edit-plan').value;
    const estado = document.getElementById('edit-estado').value;
    const password = document.getElementById('edit-password').value.trim();
    const image_url = document.getElementById('edit-image_url').value.trim();
    
    if (!username) {
        alert('El username es requerido');
        return;
    }
    
    const updateData = {
        username,
        plan,
        estado,
        image_url: image_url || null
    };
    
    if (password) {
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        updateData.password = password;
    }
    
    try {
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        
        const response = await apiRequest(`/users/${currentEditingUser.user_id || currentEditingUser.id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        if (!response) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error al actualizar usuario');
        }
        
        alert('Usuario actualizado correctamente');
        closeUserEditModal();
        loadUsers(currentPage);
        
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        alert('Error al guardar cambios: ' + error.message);
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    }
}

// Cerrar modal de edición
function closeUserEditModal() {
    document.getElementById('userEditModal').style.display = 'none';
    currentEditingUser = null;
}

// Limpiar filtros
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('planFilter').value = '';
    loadUsers(1);
}

// Cerrar modal
function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').style.display = 'none';
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const detailsModal = document.getElementById('userDetailsModal');
    const editModal = document.getElementById('userEditModal');
    
    if (event.target === detailsModal) {
        detailsModal.style.display = 'none';
    }
    if (event.target === editModal) {
        editModal.style.display = 'none';
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

