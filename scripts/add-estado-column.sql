-- Script para agregar columna "estado" a la tabla users
-- Ejecutar este script en DBeaver o tu herramienta de gestión de base de datos

-- Agregar columna estado si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN estado VARCHAR(20) DEFAULT 'Activo';
        
        -- Actualizar todos los registros existentes a "Activo"
        UPDATE users 
        SET estado = 'Activo' 
        WHERE estado IS NULL;
    END IF;
END $$;

-- Crear índice para mejorar búsquedas por estado
CREATE INDEX IF NOT EXISTS idx_users_estado ON users(estado);

-- Verificar que la columna fue creada correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'estado';

