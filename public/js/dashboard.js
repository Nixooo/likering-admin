let dashboardData = null;

// Cargar datos del dashboard
async function loadDashboard() {
    try {
        const response = await apiRequest('/dashboard');
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar datos');
        }

        dashboardData = await response.json();
        updateDashboardUI(dashboardData);
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        document.querySelector('.dashboard-content').innerHTML = 
            '<div class="error-message show">Error al cargar los datos del dashboard</div>';
    }
}

// Actualizar UI del dashboard
function updateDashboardUI(data) {
    // Estadísticas generales
    document.getElementById('totalUsuarios').textContent = data.general.totalUsuarios.toLocaleString();
    document.getElementById('usuariosActivos').textContent = `${data.general.usuariosActivos.toLocaleString()} activos`;
    document.getElementById('totalVideos').textContent = data.general.totalVideos.toLocaleString();
    document.getElementById('nuevosVideos').textContent = `${data.estaSemana.nuevosVideos} esta semana`;
    document.getElementById('totalLikes').textContent = data.general.totalLikes.toLocaleString();
    document.getElementById('totalVisualizaciones').textContent = data.general.totalVisualizaciones.toLocaleString();
    document.getElementById('totalReportes').textContent = data.general.totalReportes.toLocaleString();
    document.getElementById('reportesPendientes').textContent = `${data.general.reportesPendientes} pendientes`;
    document.getElementById('nuevosUsuarios').textContent = data.estaSemana.nuevosUsuarios.toLocaleString();

    // Top usuarios
    const topUsersContainer = document.getElementById('topUsers');
    if (data.topUsuarios.length === 0) {
        topUsersContainer.innerHTML = '<p>No hay datos disponibles</p>';
    } else {
        topUsersContainer.innerHTML = data.topUsuarios.map((user, index) => `
            <div class="list-item">
                <h4>${index + 1}. ${user.username || user.email}</h4>
                <p><strong>Videos:</strong> ${user.total_videos || 0}</p>
                <p><strong>Likes:</strong> ${(user.total_likes || 0).toLocaleString()}</p>
                <p><strong>Visualizaciones:</strong> ${(user.total_visualizaciones || 0).toLocaleString()}</p>
            </div>
        `).join('');
    }

    // Top videos
    const topVideosContainer = document.getElementById('topVideos');
    if (data.topVideos.length === 0) {
        topVideosContainer.innerHTML = '<p>No hay datos disponibles</p>';
    } else {
        topVideosContainer.innerHTML = data.topVideos.map((video, index) => `
            <div class="list-item">
                <h4>${index + 1}. ${video.titulo || 'Sin título'}</h4>
                <p><strong>Usuario:</strong> ${video.usuario_username || 'N/A'}</p>
                <p><strong>Likes:</strong> ${(video.likes || 0).toLocaleString()}</p>
                <p><strong>Visualizaciones:</strong> ${(video.visualizaciones || 0).toLocaleString()}</p>
            </div>
        `).join('');
    }

    // Reportes por tipo
    const reportsByTypeContainer = document.getElementById('reportsByType');
    if (data.reportesPorTipo.length === 0) {
        reportsByTypeContainer.innerHTML = '<p>No hay datos disponibles</p>';
    } else {
        const maxCount = Math.max(...data.reportesPorTipo.map(r => parseInt(r.cantidad)));
        reportsByTypeContainer.innerHTML = data.reportesPorTipo.map(item => {
            const percentage = maxCount > 0 ? (item.cantidad / maxCount) * 100 : 0;
            return `
                <div class="chart-item">
                    <span>${item.tipo_reporte}</span>
                    <span><strong>${item.cantidad}</strong></span>
                </div>
                <div class="chart-bar" style="width: ${percentage}%"></div>
            `;
        }).join('');
    }

    // Reportes por estado
    const reportsByStatusContainer = document.getElementById('reportsByStatus');
    if (data.reportesPorEstado.length === 0) {
        reportsByStatusContainer.innerHTML = '<p>No hay datos disponibles</p>';
    } else {
        const maxCount = Math.max(...data.reportesPorEstado.map(r => parseInt(r.cantidad)));
        reportsByStatusContainer.innerHTML = data.reportesPorEstado.map(item => {
            const percentage = maxCount > 0 ? (item.cantidad / maxCount) * 100 : 0;
            const estadoClass = item.estado.replace('_', '-');
            return `
                <div class="chart-item">
                    <span class="state-badge state-${estadoClass}">${item.estado}</span>
                    <span><strong>${item.cantidad}</strong></span>
                </div>
                <div class="chart-bar" style="width: ${percentage}%"></div>
            `;
        }).join('');
    }
}

// Cargar dashboard al iniciar
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
    // Actualizar cada 30 segundos
    setInterval(loadDashboard, 30000);
}

