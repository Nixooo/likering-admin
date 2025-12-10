-- Tabla para administradores del panel
CREATE TABLE IF NOT EXISTS UsersAdmins (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear un administrador inicial (contraseña: admin123 - CAMBIAR INMEDIATAMENTE)
-- La contraseña hasheada con bcrypt para 'admin123' es: $2a$10$rK7n5qJ5h5J5h5J5h5J5hu (ejemplo)
-- Ejecutar: node scripts/create-admin.js para crear un admin correctamente

-- Tabla para quejas/reportes de usuarios
CREATE TABLE IF NOT EXISTS Reportes (
    id SERIAL PRIMARY KEY,
    tipo_reporte VARCHAR(50) NOT NULL, -- 'video', 'usuario', 'comentario', 'otro'
    id_usuario_reportado INTEGER, -- ID del usuario que fue reportado
    id_video_reportado INTEGER, -- ID del video reportado (si aplica)
    id_usuario_reporter INTEGER NOT NULL, -- ID del usuario que hizo el reporte
    motivo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'en_revision', 'resuelto', 'rechazado'
    prioridad VARCHAR(10) DEFAULT 'media', -- 'baja', 'media', 'alta'
    resuelto_por INTEGER, -- ID del admin que resolvió el reporte
    notas_admin TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar las búsquedas
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON Reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON Reportes(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON Reportes(creado_en);
CREATE INDEX IF NOT EXISTS idx_admins_correo ON UsersAdmins(correo);

