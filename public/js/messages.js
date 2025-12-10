let currentPage = 1;
let currentSearch = '';
let totalPages = 1;

// Cargar mensajes
async function loadMessages(page = 1) {
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

        const response = await apiRequest(`/messages?${params.toString()}`);
        if (!response) return;

        if (!response.ok) {
            throw new Error('Error al cargar mensajes');
        }

        const data = await response.json();
        displayMessages(data.messages);
        
        totalPages = Math.ceil(data.total / 20);
        updatePagination(data.total, page);
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
        document.getElementById('messagesTableBody').innerHTML = 
            '<tr><td colspan="6" class="loading">Error al cargar mensajes</td></tr>';
    }
}

// Mostrar mensajes
function displayMessages(messages) {
    const tbody = document.getElementById('messagesTableBody');
    
    if (messages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No se encontraron mensajes</td></tr>';
        return;
    }

    tbody.innerHTML = messages.map(message => `
        <tr>
            <td>${message.message_id || message.id || 'N/A'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${message.sender_image || 'https://ui-avatars.com/api/?name=' + (message.sender_username || 'User') + '&background=3b82f6&color=fff&size=32'}" 
                         alt="${message.sender_username}"
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${message.sender_username || 'User'}&background=3b82f6&color=fff&size=32'">
                    <span>@${message.sender_username || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${message.receiver_image || 'https://ui-avatars.com/api/?name=' + (message.receiver_username || 'User') + '&background=ec4899&color=fff&size=32'}" 
                         alt="${message.receiver_username}"
                         style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${message.receiver_username || 'User'}&background=ec4899&color=fff&size=32'">
                    <span>@${message.receiver_username || 'N/A'}</span>
                </div>
            </td>
            <td>
                <div style="max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${message.message_text || ''}">
                    ${message.message_text || 'Sin texto'}
                </div>
            </td>
            <td>${new Date(message.created_at).toLocaleDateString('es-ES')}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteMessage('${message.message_id || message.id}')">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

// Eliminar mensaje
async function deleteMessage(messageId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
        return;
    }

    try {
        const response = await apiRequest(`/messages/${messageId}`, {
            method: 'DELETE'
        });

        if (!response) return;

        if (!response.ok) {
            const data = await response.json();
            alert(data.error || 'Error al eliminar mensaje');
            return;
        }

        alert('Mensaje eliminado correctamente');
        loadMessages(currentPage);
    } catch (error) {
        console.error('Error al eliminar mensaje:', error);
        alert('Error al eliminar el mensaje');
    }
}

// Cambiar página
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        loadMessages(newPage);
    }
}

// Actualizar paginación
function updatePagination(total, page) {
    document.getElementById('pageInfo').textContent = 
        `Página ${page} de ${totalPages} (${total} mensajes)`;
    
    document.getElementById('prevPage').disabled = page === 1;
    document.getElementById('nextPage').disabled = page >= totalPages;
}

// Búsqueda al presionar Enter
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadMessages(1);
        }
    });
}

// Cargar mensajes al iniciar
if (window.location.pathname.includes('messages.html')) {
    loadMessages();
}

