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
    tipo_reporte VARCHAR(50) NOT NULL,
    id_usuario_reportado INTEGER,
    id_video_reportado INTEGER,
    id_usuario_reporter INTEGER NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    prioridad VARCHAR(10) DEFAULT 'media',
    resuelto_por INTEGER,
    notas_admin TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar las búsquedas
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON Reportes(estado);
CREATE INDEX IF NOT EXISTS idx_reportes_tipo ON Reportes(tipo_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON Reportes(creado_en);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario_reporter ON Reportes(id_usuario_reporter);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario_reportado ON Reportes(id_usuario_reportado);
CREATE INDEX IF NOT EXISTS idx_admins_correo ON UsersAdmins(correo);

