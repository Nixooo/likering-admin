let currentPage = 1;
let currentSearch = '';
let totalPages = 1;

// Cargar videos
async function loadVideos(page = 1) {
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

        const response = await apiRequest(`/videos?${params.toString()}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar videos');
        }

        const data = await response.json();
        displayVideos(data.videos);
        
        totalPages = Math.ceil(data.total / 20);
        updatePagination(data.total, page);
    } catch (error) {
        console.error('Error al cargar videos:', error);
        document.getElementById('videosGrid').innerHTML = 
            '<div class="loading">Error al cargar videos</div>';
    }
}

// Mostrar videos en grid
function displayVideos(videos) {
    const grid = document.getElementById('videosGrid');
    
    if (videos.length === 0) {
        grid.innerHTML = '<div class="loading">No se encontraron videos</div>';
        return;
    }

    grid.innerHTML = videos.map(video => `
        <div class="video-grid-card">
            <div class="video-grid-thumbnail">
                <img src="${video.thumbnail_url || 'https://via.placeholder.com/300x400/1e293b/94a3b8?text=Video'}" 
                     alt="${video.titulo || 'Video'}"
                     onerror="this.src='https://via.placeholder.com/300x400/1e293b/94a3b8?text=Video'">
                <div class="video-grid-overlay">
                    <div class="video-grid-stats">
                        <span>👁️ ${(video.visualizaciones || 0).toLocaleString()}</span>
                        <span>❤️ ${(video.likes || 0).toLocaleString()}</span>
                        <span>💬 ${video.comments_count || 0}</span>
                    </div>
                </div>
            </div>
            <div class="video-grid-info">
                <div class="video-grid-user">
                    <img src="${video.user_image || 'https://ui-avatars.com/api/?name=' + (video.username || 'User') + '&background=3b82f6&color=fff&size=32'}" 
                         alt="${video.username}"
                         onerror="this.src='https://ui-avatars.com/api/?name=${video.username || 'User'}&background=3b82f6&color=fff&size=32'"
                         class="video-grid-avatar">
                    <span>@${video.username || 'N/A'}</span>
                </div>
                <h4 title="${video.titulo || 'Sin título'}">${(video.titulo || 'Sin título').substring(0, 50)}${(video.titulo || '').length > 50 ? '...' : ''}</h4>
                <p class="video-grid-date">${new Date(video.created_at).toLocaleDateString('es-ES')}</p>
                <div class="video-grid-actions">
                    <button class="btn btn-sm btn-danger" onclick="deleteVideo('${video.video_id}')">
                        Eliminar
                    </button>
                    <a href="${video.video_url || '#'}" target="_blank" class="btn btn-sm btn-secondary">
                        Ver Video
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Eliminar video
async function deleteVideo(videoId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este video? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        const response = await apiRequest(`/videos/${videoId}`, {
            method: 'DELETE'
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al eliminar video');
            return;
        }

        alert('Video eliminado correctamente');
        loadVideos(currentPage);
    } catch (error) {
        console.error('Error al eliminar video:', error);
        alert('Error al eliminar el video');
    }
}

// Cambiar página
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadVideos(newPage);
    }
}

// Actualizar paginación
function updatePagination(total, page) {
    document.getElementById('pageInfo').textContent = 
        `Página ${page} de ${totalPages} (${total} videos)`;
    
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Búsqueda al presionar Enter
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadVideos(1);
        }
    });
}

// Cargar videos al iniciar
if (window.location.pathname.includes('videos.html')) {
    loadVideos();
}

