const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

async function createAdmin() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (prompt) => {
        return new Promise((resolve) => {
            readline.question(prompt, resolve);
        });
    };

    try {
        console.log('=== Crear Administrador ===\n');
        
        const nombre = await question('Nombre: ');
        const correo = await question('Correo: ');
        const contraseña = await question('Contraseña: ');
        const telefono = await question('Teléfono (opcional, presiona Enter para omitir): ') || null;

        if (!nombre || !correo || !contraseña) {
            console.log('\n❌ Error: Nombre, correo y contraseña son requeridos');
            readline.close();
            process.exit(1);
            return;
        }

        // Verificar si el correo ya existe
        const existing = await pool.query('SELECT id FROM UsersAdmins WHERE correo = $1', [correo]);
        if (existing.rows.length > 0) {
            console.log('\n❌ Error: Este correo ya está registrado');
            readline.close();
            process.exit(1);
            return;
        }

        // Hashear contraseña
        console.log('\n⏳ Creando administrador...');
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar administrador
        const result = await pool.query(
            'INSERT INTO UsersAdmins (nombre, correo, contraseña, telefono) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo',
            [nombre, correo, hashedPassword, telefono]
        );

        console.log('\n✅ Administrador creado exitosamente!');
        console.log(`   ID: ${result.rows[0].id}`);
        console.log(`   Nombre: ${result.rows[0].nombre}`);
        console.log(`   Correo: ${result.rows[0].correo}`);
        console.log('\n💡 Ya puedes iniciar sesión en el panel de administración\n');

    } catch (error) {
        console.error('\n❌ Error al crear administrador:');
        console.error(`   Mensaje: ${error.message}`);
        if (error.code) {
            console.error(`   Código: ${error.code}`);
        }
        
        if (error.code === '23505') {
            console.error('   El correo electrónico ya está en uso');
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            console.error('\n💡 Error de conexión a la base de datos:');
            console.error('   - Verifica que el archivo .env esté configurado correctamente');
            console.error('   - Verifica que la base de datos sea accesible');
            console.error(`   - Host: ${process.env.DB_HOST || 'NO CONFIGURADO'}`);
            console.error(`   - Port: ${process.env.DB_PORT || 'NO CONFIGURADO'}`);
        } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
            console.error('\n💡 Error: La tabla UsersAdmins no existe');
            console.error('   - Ejecuta primero el script SQL para crear las tablas');
            console.error('   - O ejecuta: npm run init-db');
        }
        
        console.error('\n📋 Detalles completos del error:');
        console.error(error);
        
        process.exit(1);
    } finally {
        readline.close();
        await pool.end();
    }
}

createAdmin();

