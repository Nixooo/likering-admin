const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
require('dotenv').config();

async function initDatabase() {
    try {
        console.log('🔌 Conectando a la base de datos...');
        console.log(`   Host: ${process.env.DB_HOST}`);
        console.log(`   Port: ${process.env.DB_PORT}`);
        console.log(`   Database: ${process.env.DB_NAME}`);
        console.log(`   User: ${process.env.DB_USER}\n`);
        
        // Verificar conexión
        const testQuery = await pool.query('SELECT NOW()');
        console.log('✅ Conexión exitosa!\n');
        
        console.log('📝 Inicializando base de datos...\n');
        
        // Leer el archivo SQL
        const sqlFile = fs.readFileSync(
            path.join(__dirname, 'create-tables.sql'), 
            'utf8'
        );

        // Dividir el archivo SQL en consultas individuales
        const queries = sqlFile
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('--'));

        // Ejecutar cada consulta
        for (const query of queries) {
            if (query.trim()) {
                try {
                    await pool.query(query);
                } catch (err) {
                    // Ignorar errores de "ya existe" para tablas e índices
                    if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
                        console.warn(`⚠️  Advertencia en consulta: ${err.message}`);
                    }
                }
            }
        }
        
        console.log('✅ Tablas creadas exitosamente!');
        console.log('\n📋 Tablas creadas:');
        console.log('   - UsersAdmins (administradores)');
        console.log('   - Reportes (quejas/reportes)');
        console.log('\n📝 Para crear un administrador, ejecuta:');
        console.log('   npm run create-admin\n');
        
    } catch (error) {
        console.error('\n❌ Error al inicializar la base de datos:');
        console.error(`   ${error.message}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Sugerencia:');
            console.error('   - Verifica que las variables de entorno estén configuradas');
            console.error('   - Asegúrate de que la base de datos sea accesible');
            console.error('   - Verifica el archivo .env o las variables de entorno');
        }
        
        process.exit(1);
    } finally {
        await pool.end();
    }
}

initDatabase();

