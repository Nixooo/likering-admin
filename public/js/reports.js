let currentPage = 1;
let currentStatus = '';
let currentType = '';
let totalPages = 1;

// Cargar reportes
async function loadReports(page = 1) {
    try {
        currentStatus = document.getElementById('statusFilter')?.value || '';
        currentType = document.getElementById('typeFilter')?.value || '';
        const search = document.getElementById('searchInput')?.value || '';
        const priority = document.getElementById('priorityFilter')?.value || '';
        const dateFilter = document.getElementById('dateFilter')?.value || '';
        currentPage = page;

        const params = new URLSearchParams({
            limit: 20,
            offset: (page - 1) * 20
        });

        if (currentStatus) {
            params.append('estado', currentStatus);
        }

        if (currentType) {
            params.append('tipo_reporte', currentType);
        }
        
        if (search) {
            params.append('search', search);
        }
        
        if (priority) {
            params.append('prioridad', priority);
        }
        
        if (dateFilter) {
            params.append('date', dateFilter);
        }

        const response = await apiRequest(`/reports?${params.toString()}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar reportes');
        }

        const data = await response.json();
        displayReports(data.reports);
        
        totalPages = Math.ceil(data.total / 20);
        updatePagination(data.total, page);
    } catch (error) {
        console.error('Error al cargar reportes:', error);
        document.getElementById('reportsTableBody').innerHTML = 
            '<tr><td colspan="9" class="loading" style="text-align: center; padding: 40px; color: var(--text-muted);">Actualmente no hay reportes disponibles</td></tr>';
    }
}

// Mostrar reportes en la tabla
function displayReports(reports) {
    const tbody = document.getElementById('reportsTableBody');
    
    if (reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading" style="text-align: center; padding: 40px; color: var(--text-muted);">Actualmente no hay reportes disponibles</td></tr>';
        return;
    }

    tbody.innerHTML = reports.map(report => {
        const estadoClass = report.estado.replace('_', '-');
        const prioridadClass = report.prioridad || 'media';
        
        return `
            <tr>
                <td>${report.id}</td>
                <td>${report.tipo_reporte}</td>
                <td>${report.reporter_username || 'N/A'}</td>
                <td>${report.reported_username || 'N/A'}</td>
                <td>${report.motivo}</td>
                <td>
                    <span class="state-badge state-${estadoClass}">
                        ${report.estado}
                    </span>
                </td>
                <td>
                    <span class="priority-badge priority-${prioridadClass}">
                        ${report.prioridad || 'media'}
                    </span>
                </td>
                <td>${new Date(report.creado_en).toLocaleDateString()}</td>
                <td>
                    <button 
                        class="btn btn-sm btn-secondary" 
                        onclick="viewReportDetails(${report.id})"
                    >
                        Ver
                    </button>
                    ${report.estado === 'pendiente' ? `
                        <button 
                            class="btn btn-sm btn-success" 
                            onclick="updateReportStatus(${report.id}, 'en_revision')"
                            style="margin-left: 5px;"
                        >
                            Revisar
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

// Ver detalles del reporte
async function viewReportDetails(reportId) {
    try {
        const response = await apiRequest(`/reports/${reportId}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar reporte');
        }

        const report = await response.json();
        const estadoClass = report.estado.replace('_', '-');
        const prioridadClass = report.prioridad || 'media';
        
        const details = `
            <div class="report-details">
                <h3>Reporte #${report.id}</h3>
                <div class="detail-section">
                    <p><strong>Tipo:</strong> ${report.tipo_reporte}</p>
                    <p><strong>Estado:</strong> 
                        <span class="state-badge state-${estadoClass}">${report.estado}</span>
                    </p>
                    <p><strong>Prioridad:</strong> 
                        <span class="priority-badge priority-${prioridadClass}">${report.prioridad || 'media'}</span>
                    </p>
                </div>
                <div class="detail-section">
                    <p><strong>Reportado por:</strong> ${report.reporter_username || report.reporter_email || 'N/A'}</p>
                    <p><strong>Usuario reportado:</strong> ${report.reported_username || 'N/A'}</p>
                    ${report.video_titulo ? `<p><strong>Video:</strong> ${report.video_titulo}</p>` : ''}
                </div>
                <div class="detail-section">
                    <p><strong>Motivo:</strong> ${report.motivo}</p>
                    <p><strong>Descripción:</strong> ${report.descripcion || 'Sin descripción'}</p>
                </div>
                ${report.notas_admin ? `
                    <div class="detail-section">
                        <p><strong>Notas del Admin:</strong> ${report.notas_admin}</p>
                        <p><strong>Resuelto por:</strong> ${report.resuelto_por_nombre || 'N/A'}</p>
                    </div>
                ` : ''}
                <div class="detail-section">
                    <p><strong>Fecha de creación:</strong> ${new Date(report.creado_en).toLocaleString()}</p>
                    <p><strong>Última actualización:</strong> ${new Date(report.actualizado_en).toLocaleString()}</p>
                </div>
                <div class="detail-section">
                    <label for="reportStatus">Cambiar Estado:</label>
                    <select id="reportStatus" class="filter-select">
                        <option value="pendiente" ${report.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="en_revision" ${report.estado === 'en_revision' ? 'selected' : ''}>En Revisión</option>
                        <option value="resuelto" ${report.estado === 'resuelto' ? 'selected' : ''}>Resuelto</option>
                        <option value="rechazado" ${report.estado === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                    </select>
                    <label for="reportPriority">Prioridad:</label>
                    <select id="reportPriority" class="filter-select">
                        <option value="baja" ${report.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                        <option value="media" ${report.prioridad === 'media' ? 'selected' : ''}>Media</option>
                        <option value="alta" ${report.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
                    </select>
                    <label for="adminNotes">Notas:</label>
                    <textarea id="adminNotes" class="filter-select" rows="3">${report.notas_admin || ''}</textarea>
                    <button class="btn btn-primary" onclick="saveReportChanges(${report.id})" style="margin-top: 10px;">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('reportDetails').innerHTML = details;
        document.getElementById('reportModal').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar detalles:', error);
        alert('Error al cargar los detalles del reporte');
    }
}

// Guardar cambios del reporte
async function saveReportChanges(reportId) {
    const estado = document.getElementById('reportStatus').value;
    const prioridad = document.getElementById('reportPriority').value;
    const notas = document.getElementById('adminNotes').value;

    try {
        const response = await apiRequest(`/reports/${reportId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                estado,
                prioridad,
                notas_admin: notas
            })
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al actualizar reporte');
            return;
        }

        alert('Reporte actualizado correctamente');
        closeModal();
        loadReports(currentPage);
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        alert('Error al guardar los cambios');
    }
}

// Actualizar estado del reporte
async function updateReportStatus(reportId, newStatus) {
    try {
        const response = await apiRequest(`/reports/${reportId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ estado: newStatus })
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al actualizar reporte');
            return;
        }

        alert('Estado del reporte actualizado');
        loadReports(currentPage);
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado del reporte');
    }
}

// Cerrar modal
function closeModal() {
    document.getElementById('reportModal').style.display = 'none';
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('reportModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Cambiar página
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadReports(newPage);
    }
}

// Actualizar paginación
function updatePagination(total, page) {
    document.getElementById('pageInfo').textContent = 
        `Página ${page} de ${totalPages} (${total} reportes)`;
    
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Cargar reportes al iniciar
if (window.location.pathname.includes('reports.html')) {
    loadReports();
}

