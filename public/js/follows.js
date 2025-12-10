let currentPage = 1;
let currentSearch = '';
let totalPages = 1;

// Cargar seguimientos
async function loadFollows(page = 1) {
    try {
        currentSearch = document.getElementById('searchInput').value;
        currentPage = page;

        const params = new URLSearchParams({
            limit: 20,
            offset: (page - 1) * 20
        });

        if (currentSearch) {
            params.append('search', currentSearch);
        }

        const response = await apiRequest(`/follows?${params.toString()}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar seguimientos');
        }

        const data = await response.json();
        displayFollows(data.follows);
        
        totalPages = Math.ceil(data.total / 20);
        updatePagination(data.total, page);
    } catch (error) {
        console.error('Error al cargar seguimientos:', error);
        document.getElementById('followsTableBody').innerHTML = 
            '<tr><td colspan="5" class="loading">Error al cargar seguimientos</td></tr>';
    }
}

// Mostrar seguimientos
function displayFollows(follows) {
    const tbody = document.getElementById('followsTableBody');
    
    if (follows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No se encontraron seguimientos</td></tr>';
        return;
    }

    tbody.innerHTML = follows.map(follow => `
        <tr>
            <td>${follow.follow_id || follow.id || 'N/A'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${follow.follower_image || 'https://ui-avatars.com/api/?name=' + (follow.follower_username || 'User') + '&background=3b82f6&color=fff&size=32'}" 
                         alt="${follow.follower_username}"
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${follow.follower_username || 'User'}&background=3b82f6&color=fff&size=32'">
                    <span>@${follow.follower_username || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${follow.following_image || 'https://ui-avatars.com/api/?name=' + (follow.following_username || 'User') + '&background=ec4899&color=fff&size=32'}" 
                         alt="${follow.following_username}"
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${follow.following_username || 'User'}&background=ec4899&color=fff&size=32'">
                    <span>@${follow.following_username || 'N/A'}</span>
                </div>
            </td>
            <td>${new Date(follow.created_at).toLocaleDateString('es-ES')}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteFollow('${follow.follow_id || follow.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Eliminar seguimiento
async function deleteFollow(followId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta relación de seguimiento?')) {
        return;
    }

    try {
        const response = await apiRequest(`/follows/${followId}`, {
            method: 'DELETE'
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al eliminar seguimiento');
            return;
        }

        alert('Relación de seguimiento eliminada correctamente');
        loadFollows(currentPage);
    } catch (error) {
        console.error('Error al eliminar seguimiento:', error);
        alert('Error al eliminar el seguimiento');
    }
}

// Cambiar página
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadFollows(newPage);
    }
}

// Actualizar paginación
function updatePagination(total, page) {
    document.getElementById('pageInfo').textContent = 
        `Página ${page} de ${totalPages} (${total} seguimientos)`;
    
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Búsqueda al presionar Enter
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadFollows(1);
        }
    });
}

// Cargar seguimientos al iniciar
if (window.location.pathname.includes('follows.html')) {
    loadFollows();
}

