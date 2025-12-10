let currentPage = 1;
let currentSearch = '';
let currentVideoId = '';
let totalPages = 1;

// Cargar comentarios
async function loadComments(page = 1) {
    try {
        currentSearch = document.getElementById('searchInput').value;
        currentVideoId = document.getElementById('videoIdInput').value;
        currentPage = page;

        const params = new URLSearchParams({
            limit: 20,
            offset: (page - 1) * 20
        });

        if (currentSearch) {
            params.append('search', currentSearch);
        }

        if (currentVideoId) {
            params.append('video_id', currentVideoId);
        }

        const response = await apiRequest(`/comments?${params.toString()}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar comentarios');
        }

        const data = await response.json();
        displayComments(data.comments);
        
        totalPages = Math.ceil(data.total / 20);
        updatePagination(data.total, page);
    } catch (error) {
        console.error('Error al cargar comentarios:', error);
        document.getElementById('commentsTableBody').innerHTML = 
            '<tr><td colspan="7" class="loading">Error al cargar comentarios</td></tr>';
    }
}

// Mostrar comentarios
function displayComments(comments) {
    const tbody = document.getElementById('commentsTableBody');
    
    if (comments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">No se encontraron comentarios</td></tr>';
        return;
    }

    tbody.innerHTML = comments.map(comment => `
        <tr>
            <td>${comment.comment_id || comment.id || 'N/A'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${comment.user_image || 'https://ui-avatars.com/api/?name=' + (comment.username || 'User') + '&background=3b82f6&color=fff&size=32'}" 
                         alt="${comment.username}" 
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${comment.username || 'User'}&background=3b82f6&color=fff&size=32'">
                    <span>${comment.username || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${comment.comment_text || ''}">
                    ${comment.comment_text || 'Sin texto'}
                </div>
            </td>
            <td>
                ${comment.video_titulo ? `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        ${comment.video_thumbnail ? `<img src="${comment.video_thumbnail}" style="width: 40px; height: 24px; object-fit: cover; border-radius: 4px;">` : ''}
                        <span style="font-size: 12px;">${comment.video_titulo.substring(0, 30)}${comment.video_titulo.length > 30 ? '...' : ''}</span>
                    </div>
                ` : 'N/A'}
            </td>
            <td>${new Date(comment.created_at).toLocaleDateString('es-ES')}</td>
            <td>
                ${comment.is_edited ? '<span class="status-badge status-active">Sí</span>' : '<span class="status-badge status-inactive">No</span>'}
            </td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteComment('${comment.comment_id || comment.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Eliminar comentario
async function deleteComment(commentId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
        return;
    }

    try {
        const response = await apiRequest(`/comments/${commentId}`, {
            method: 'DELETE'
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al eliminar comentario');
            return;
        }

        alert('Comentario eliminado correctamente');
        loadComments(currentPage);
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        alert('Error al eliminar el comentario');
    }
}

// Cambiar página
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadComments(newPage);
    }
}

// Actualizar paginación
function updatePagination(total, page) {
    document.getElementById('pageInfo').textContent = 
        `Página ${page} de ${totalPages} (${total} comentarios)`;
    
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Búsqueda al presionar Enter
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadComments(1);
        }
    });
}

// Cargar comentarios al iniciar
if (window.location.pathname.includes('comments.html')) {
    loadComments();
}

