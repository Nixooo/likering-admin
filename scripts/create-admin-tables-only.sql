-- ============================================
-- Script para crear tablas del Panel de Administración
-- Likering Admin Panel
-- ============================================
-- Este script crea SOLO las nuevas tablas necesarias para el panel de administración
-- No afecta las tablas existentes de la aplicación Likering
-- ============================================

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

-- Tabla para quejas/reportes de usuarios
CREATE TABLE IF NOT EXISTS Reportes (
    id SERIAL PRIMARY KEY,
    tipo_reporte VARCHAR(50) NOT NULL, -- 'video', 'usuario', 'comentario', 'otro'
    id_usuario_reportado INTEGER, -- ID del usuario que fue reportado (referencia a tabla users)
    id_video_reportado INTEGER, -- ID del video reportado (referencia a tabla videos, si aplica)
    id_usuario_reporter INTEGER NOT NULL, -- ID del usuario que hizo el reporte (referencia a tabla users)
    motivo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'en_revision', 'resuelto', 'rechazado'
    prioridad VARCHAR(10) DEFAULT 'media', -- 'baja', 'media', 'alta'
    resuelto_por INTEGER, -- ID del admin que resolvió el reporte (referencia a UsersAdmins)
    notas_admin TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    
    -- Foreign keys (opcionales, comentados por si las tablas tienen nombres diferentes)
    -- FOREIGN KEY (id_usuario_reportado) REFERENCES users(id) ON DELETE SET NULL,
    -- FOREIGN KEY (id_usuario_reporter) REFERENCES users(id) ON DELETE CASCADE,
    -- FOREIGN KEY (id_video_reportado) REFERENCES videos(id) ON DELETE SET NULL,
    -- FOREIGN KEY (resuelto_por) REFERENCES UsersAdmins(id) ON DELETE SET NULL
);

-- Índices para mejorar las búsquedas
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON Reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON Reportes(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON Reportes(creado_en);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario_reporter ON Reportes(id_usuario_reporter);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario_reportado ON Reportes(id_usuario_reportado);
CREATE INDEX IF NOT EXISTS idx_admins_correo ON UsersAdmins(correo);

-- Comentarios en las tablas (opcional, para documentación)
COMMENT ON TABLE UsersAdmins IS 'Tabla de administradores del panel de Likering';
COMMENT ON TABLE Reportes IS 'Tabla de reportes/quejas de usuarios sobre videos, usuarios o comentarios';

COMMENT ON COLUMN Reportes.tipo_reporte IS 'Tipo de reporte: video, usuario, comentario, otro';
COMMENT ON COLUMN Reportes.estado IS 'Estado del reporte: pendiente, en_revision, resuelto, rechazado';
COMMENT ON COLUMN Reportes.prioridad IS 'Prioridad del reporte: baja, media, alta';

-- ============================================
-- Verificación: Mostrar las tablas creadas
-- ============================================
-- Ejecuta esto después para verificar:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('UsersAdmins', 'Reportes');

