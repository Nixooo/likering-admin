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
        console.error('\n❌ Error al crear administrador:', error.message);
        if (error.code === '23505') {
            console.error('   El correo electrónico ya está en uso');
        }
        process.exit(1);
    } finally {
        readline.close();
        await pool.end();
    }
}

createAdmin();

