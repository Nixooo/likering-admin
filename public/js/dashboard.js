let dashboardData = null;
let usersByPlanChart = null;
let usersByDateChart = null;

// Cargar datos del dashboard
async function loadDashboard() {
    try {
        const response = await apiRequest('/dashboard');
        if (!response) return;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
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
    document.getElementById('totalComentarios').textContent = (data.general.totalComentarios || 0).toLocaleString();
    document.getElementById('totalSeguimientos').textContent = (data.general.totalSeguimientos || 0).toLocaleString();
    document.getElementById('totalMensajes').textContent = (data.general.totalMensajes || 0).toLocaleString();
    document.getElementById('usuariosDesactivados').textContent = (data.general.usuariosDesactivados || 0).toLocaleString();

    // Top usuarios con fotos de perfil
    const topUsersContainer = document.getElementById('topUsers');
    if (data.topUsuarios.length === 0) {
        topUsersContainer.innerHTML = '<p class="no-data">No hay datos disponibles</p>';
    } else {
        topUsersContainer.innerHTML = data.topUsuarios.map((user, index) => `
            <div class="user-card">
                <div class="user-rank">#${index + 1}</div>
                <div class="user-avatar">
                    <img src="${user.image_url || 'https://via.placeholder.com/60?text=' + (user.username ? user.username.charAt(0).toUpperCase() : 'U')}" 
                         alt="${user.username}" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${user.username || 'User'}&background=3b82f6&color=fff&size=128'">
                </div>
                <div class="user-info">
                    <h4>${user.username || 'Sin nombre'}</h4>
                    <span class="user-plan">Plan: ${user.plan || 'N/A'}</span>
                    <div class="user-stats">
                        <span><strong>${user.total_videos || 0}</strong> videos</span>
                        <span><strong>${(user.total_likes || 0).toLocaleString()}</strong> likes</span>
                        <span><strong>${(user.total_visualizaciones || 0).toLocaleString()}</strong> views</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Top videos con portadas
    const topVideosContainer = document.getElementById('topVideos');
    if (data.topVideos.length === 0) {
        topVideosContainer.innerHTML = '<p class="no-data">No hay datos disponibles</p>';
    } else {
        topVideosContainer.innerHTML = data.topVideos.map((video, index) => `
            <div class="video-card">
                <div class="video-rank">#${index + 1}</div>
                <div class="video-thumbnail">
                    <img src="${video.thumbnail_url || 'https://via.placeholder.com/160x90?text=Video'}" 
                         alt="${video.titulo || 'Video'}"
                         onerror="this.src='https://via.placeholder.com/160x90/1e293b/94a3b8?text=Video'">
                    <div class="video-overlay">
                        <span class="video-views">👁️ ${(video.visualizaciones || 0).toLocaleString()}</span>
                    </div>
                </div>
                <div class="video-info">
                    <h4 title="${video.titulo || 'Sin título'}">${(video.titulo || 'Sin título').substring(0, 40)}${(video.titulo || '').length > 40 ? '...' : ''}</h4>
                    <p class="video-author">@${video.usuario_username || 'N/A'}</p>
                    <div class="video-stats">
                        <span>❤️ ${(video.likes || 0).toLocaleString()}</span>
                        <span>👁️ ${(video.visualizaciones || 0).toLocaleString()}</span>
                    </div>
                </div>
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

    // Renderizar gráfica de usuarios por plan
    renderUsersByPlanChart(data.usuariosPorPlan || []);
    
    // Renderizar gráfica de usuarios por fecha
    renderUsersByDateChart(data.usuariosPorFecha || []);
}

// Renderizar gráfica de pastel para usuarios por plan
function renderUsersByPlanChart(data) {
    const ctx = document.getElementById('usersByPlanChart');
    if (!ctx) return;

    if (usersByPlanChart) {
        usersByPlanChart.destroy();
    }

    const labels = data.map(item => item.plan || 'Sin plan');
    const values = data.map(item => parseInt(item.cantidad));

    usersByPlanChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(96, 165, 250, 0.8)',
                    'rgba(244, 114, 182, 0.8)',
                    'rgba(79, 70, 229, 0.8)',
                    'rgba(219, 39, 119, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(96, 165, 250, 1)',
                    'rgba(244, 114, 182, 1)',
                    'rgba(79, 70, 229, 1)',
                    'rgba(219, 39, 119, 1)',
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#cbd5e1',
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true
                }
            }
        }
    });
}

// Renderizar gráfica de líneas para usuarios por fecha
function renderUsersByDateChart(data) {
    const ctx = document.getElementById('usersByDateChart');
    if (!ctx) return;

    if (usersByDateChart) {
        usersByDateChart.destroy();
    }

    // Si no hay datos, crear datos vacíos para los últimos 30 días
    let labels = [];
    let values = [];

    if (data.length > 0) {
        labels = data.map(item => {
            const date = new Date(item.fecha);
            return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        });
        values = data.map(item => parseInt(item.cantidad));
    } else {
        // Crear array de últimos 30 días
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }));
            values.push(0);
        }
    }

    usersByDateChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nuevos Usuarios',
                data: values,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#0f172a',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#cbd5e1',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#94a3b8',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.3)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        stepSize: 1
                    },
                    grid: {
                        color: 'rgba(51, 65, 85, 0.3)'
                    }
                }
            }
        }
    });
}

// Cargar dashboard al iniciar
if (window.location.pathname.includes('dashboard.html')) {
    loadDashboard();
    // Actualizar cada 30 segundos
    setInterval(loadDashboard, 30000);
}

