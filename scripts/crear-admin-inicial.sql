-- ============================================
-- Script para crear un administrador inicial
-- IMPORTANTE: Cambia la contraseña después del primer login
-- ============================================
-- Este script crea un administrador con una contraseña temporal
-- La contraseña debe ser hasheada con bcrypt antes de insertar
-- ============================================

-- NOTA: Para crear un administrador correctamente, usa el script Node.js:
-- npm run create-admin
-- 
-- O hashea la contraseña manualmente y reemplaza el hash aquí

-- Ejemplo de inserción (REEMPLAZA EL HASH DE CONTRASEÑA):
-- La contraseña 'admin123' hasheada sería algo como:
-- $2a$10$rK7n5qJ5h5J5h5J5h5J5hu...

-- INSERT INTO UsersAdmins (nombre, correo, contraseña, telefono)
-- VALUES (
--     'Administrador Principal',
--     'admin@likering.com',
--     '$2a$10$REEMPLAZA_CON_HASH_REAL_DE_BCRYPT',
--     NULL
-- );

-- ============================================
-- Para obtener el hash de una contraseña, ejecuta en Node.js:
-- ============================================
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('tu_contraseña', 10).then(hash => console.log(hash));

-- ============================================
-- O usa el script create-admin.js:
-- npm run create-admin
-- ============================================

