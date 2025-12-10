let userGrowthChart = null;
let videoGrowthChart = null;
let activityByHourChart = null;

// Cargar analytics
async function loadAnalytics() {
    try {
        const response = await apiRequest('/analytics');
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar analytics');
        }

        const data = await response.json();
        renderCharts(data);
        updateStats(data);
        displayTopLists(data);
    } catch (error) {
        console.error('Error al cargar analytics:', error);
    }
}

// Renderizar gráficas
function renderCharts(data) {
    renderUserGrowthChart(data.userGrowth || []);
    renderVideoGrowthChart(data.videoGrowth || []);
    renderActivityByHourChart(data.activityByHour || []);
}

// Gráfica de crecimiento de usuarios
function renderUserGrowthChart(data) {
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;

    if (userGrowthChart) {
        userGrowthChart.destroy();
    }

    const labels = data.map(item => {
        const date = new Date(item.fecha);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    });
    const values = data.map(item => parseInt(item.cantidad));

    userGrowthChart = new Chart(ctx, {
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
                    labels: { color: '#cbd5e1' }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                }
            }
        }
    });
}

// Gráfica de crecimiento de videos
function renderVideoGrowthChart(data) {
    const ctx = document.getElementById('videoGrowthChart');
    if (!ctx) return;

    if (videoGrowthChart) {
        videoGrowthChart.destroy();
    }

    const labels = data.map(item => {
        const date = new Date(item.fecha);
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    });
    const values = data.map(item => parseInt(item.cantidad));

    videoGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nuevos Videos',
                data: values,
                borderColor: 'rgba(236, 72, 153, 1)',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(236, 72, 153, 1)',
                pointBorderColor: '#0f172a',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1' }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                }
            }
        }
    });
}

// Gráfica de actividad por hora
function renderActivityByHourChart(data) {
    const ctx = document.getElementById('activityByHourChart');
    if (!ctx) return;

    if (activityByHourChart) {
        activityByHourChart.destroy();
    }

    const labels = data.map(item => `${item.hora}:00`);
    const values = data.map(item => parseInt(item.cantidad));

    activityByHourChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Videos Publicados',
                data: values,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#cbd5e1' }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 41, 59, 0.95)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: '#334155',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(51, 65, 85, 0.3)' }
                }
            }
        }
    });
}

// Actualizar estadísticas
function updateStats(data) {
    if (data.engagement) {
        document.getElementById('avgEngagement').textContent = 
            parseFloat(data.engagement.avgEngagementRate || 0).toFixed(2) + '%';
        document.getElementById('avgLikes').textContent = 
            Math.round(data.engagement.avgLikes || 0).toLocaleString();
        document.getElementById('avgViews').textContent = 
            Math.round(data.engagement.avgViews || 0).toLocaleString();
    }
}

// Mostrar top lists
function displayTopLists(data) {
    // Top videos
    const topVideosList = document.getElementById('topVideosList');
    if (data.topVideos && data.topVideos.length > 0) {
        topVideosList.innerHTML = data.topVideos.map((video, index) => `
            <div class="list-item">
                <h4>#${index + 1} ${video.titulo || 'Sin título'}</h4>
                <p><strong>Usuario:</strong> @${video.username || 'N/A'}</p>
                <p><strong>Likes:</strong> ${(video.likes || 0).toLocaleString()} | 
                   <strong>Views:</strong> ${(video.visualizaciones || 0).toLocaleString()} | 
                   <strong>Comentarios:</strong> ${video.comments_count || 0}</p>
            </div>
        `).join('');
    } else {
        topVideosList.innerHTML = '<p class="no-data">No hay datos disponibles</p>';
    }

    // Top usuarios
    const topUsersList = document.getElementById('topUsersList');
    if (data.topUsers && data.topUsers.length > 0) {
        topUsersList.innerHTML = data.topUsers.map((user, index) => `
            <div class="user-card">
                <div class="user-rank">#${index + 1}</div>
                <div class="user-avatar">
                    <img src="${user.image_url || 'https://ui-avatars.com/api/?name=' + (user.username || 'User') + '&background=3b82f6&color=fff&size=128'}" 
                         alt="${user.username}" 
                         onerror="this.src='https://ui-avatars.com/api/?name=${user.username || 'User'}&background=3b82f6&color=fff&size=128'">
                </div>
                <div class="user-info">
                    <h4>${user.username || 'Sin nombre'}</h4>
                    <span class="user-plan">Plan: ${user.plan || 'N/A'}</span>
                    <div class="user-stats">
                        <span><strong>${user.total_videos || 0}</strong> videos</span>
                        <span><strong>${(user.total_likes || 0).toLocaleString()}</strong> likes</span>
                        <span><strong>${(user.total_views || 0).toLocaleString()}</strong> views</span>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        topUsersList.innerHTML = '<p class="no-data">No hay datos disponibles</p>';
    }
}

// Cargar analytics al iniciar
if (window.location.pathname.includes('analytics.html')) {
    loadAnalytics();
}

