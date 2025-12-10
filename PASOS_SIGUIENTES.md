# ✅ Pasos Siguientes - Likering Admin

## ✅ Paso 1: Tablas Creadas ✓
Las tablas `UsersAdmins` y `Reportes` ya están creadas en tu base de datos.

## 📝 Paso 2: Crear el Primer Administrador

Tienes dos opciones:

### Opción A: Usar el Script Node.js (Recomendado)

1. Asegúrate de tener el archivo `.env` configurado con las credenciales de la base de datos
2. Ejecuta:
   ```bash
   npm run create-admin
   ```
3. Ingresa:
   - Nombre: Tu nombre completo
   - Correo: Tu correo electrónico
   - Contraseña: Una contraseña segura
   - Teléfono: (Opcional)

### Opción B: Crear Manualmente desde DBeaver

Si prefieres crear el administrador directamente en la base de datos:

1. **Genera el hash de la contraseña:**
   ```bash
   node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu_contraseña', 10).then(h=>console.log(h))"
   ```

2. **Ejecuta en DBeaver:**
   ```sql
   INSERT INTO UsersAdmins (nombre, correo, contraseña, telefono)
   VALUES (
       'Tu Nombre',
       'tu@email.com',
       'PEGA_AQUI_EL_HASH_GENERADO',
       '3124769501'  -- Opcional
   );
   ```

## 🚀 Paso 3: Desplegar en Render.com

### 3.1 Crear Web Service en Render

1. Ve a [Render.com](https://render.com) e inicia sesión
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub: `Nixooo/likering-admin`
4. Configura el servicio:
   - **Name**: `likering-admin`
   - **Environment**: `Node`
   - **Region**: Elige la más cercana
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el que prefieras)

### 3.2 Configurar Variables de Entorno

En la sección **"Environment Variables"**, añade:

```
NODE_ENV=production
PORT=3000
DB_HOST=likering-db-nixoooo14.g.aivencloud.com
DB_PORT=12691
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_h_rc54oNmOHe1_gr9tC
DB_SSL=true
JWT_SECRET=[Genera uno con el comando de abajo]
```

**Para generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.3 Crear el Servicio

Click en **"Create Web Service"** y espera a que se complete el build.

## ✅ Paso 4: Verificar el Deploy

1. Una vez completado el deploy, Render te dará una URL (ej: `https://likering-admin.onrender.com`)
2. Visita la URL
3. Deberías ver la página de login
4. Inicia sesión con las credenciales del administrador que creaste

## 🎉 ¡Listo!

Tu panel de administración está funcionando. Puedes:
- Ver todos los usuarios
- Ver estadísticas en el dashboard
- Gestionar reportes
- Activar/desactivar cuentas
- Y más...

## 📚 Archivos de Referencia

- `RENDER_DEPLOY.md` - Guía detallada de despliegue
- `INSTRUCCIONES_DBEAVER.md` - Guía de DBeaver
- `SETUP_BASE_DATOS.md` - Más información sobre la base de datos

