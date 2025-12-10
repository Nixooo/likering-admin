-- ============================================
-- Script de Verificación de Tablas
-- Verifica que las tablas del panel de administración existan
-- ============================================

-- Verificar si existe la tabla UsersAdmins
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'UsersAdmins'
        ) 
        THEN '✅ Tabla UsersAdmins existe'
        ELSE '❌ Tabla UsersAdmins NO existe'
    END as estado_usersadmins;

-- Verificar si existe la tabla Reportes
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'Reportes'
        ) 
        THEN '✅ Tabla Reportes existe'
        ELSE '❌ Tabla Reportes NO existe'
    END as estado_reportes;

-- Mostrar estructura de UsersAdmins (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'UsersAdmins'
ORDER BY ordinal_position;

-- Mostrar estructura de Reportes (si existe)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'Reportes'
ORDER BY ordinal_position;

-- Contar registros en cada tabla
SELECT 
    'UsersAdmins' as tabla,
    COUNT(*) as total_registros
FROM UsersAdmins
UNION ALL
SELECT 
    'Reportes' as tabla,
    COUNT(*) as total_registros
FROM Reportes;

