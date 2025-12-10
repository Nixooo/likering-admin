const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

async function initDatabase() {
    try {
        console.log('Inicializando base de datos...\n');
        
        // Leer el archivo SQL
        const sqlFile = fs.readFileSync(
            path.join(__dirname, 'create-tables.sql'), 
            'utf8'
        );

        // Ejecutar las consultas
        await pool.query(sqlFile);
        
        console.log('✅ Tablas creadas exitosamente!');
        console.log('\n📋 Tablas creadas:');
        console.log('   - UsersAdmins (administradores)');
        console.log('   - Reportes (quejas/reportes)');
        console.log('\n📝 Para crear un administrador, ejecuta:');
        console.log('   npm run create-admin\n');
        
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    } finally {
        await pool.end();
    }
}

initDatabase();

