# Configuración de GitHub y Deploy

## Paso 1: Crear Repositorio en GitHub

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Click en el botón "+" (arriba a la derecha) → "New repository"
3. Configura el repositorio:
   - **Repository name**: `likering-admin` (o el nombre que prefieras)
   - **Description**: Panel de administración para Likering
   - **Visibility**: Private o Public (según prefieras)
   - **NO marques** "Initialize this repository with a README" (ya tenemos uno)
4. Click en "Create repository"

## Paso 2: Conectar el Repositorio Local con GitHub

Ejecuta estos comandos en tu terminal (reemplaza `TU_USUARIO` con tu usuario de GitHub):

```bash
git remote add origin https://github.com/TU_USUARIO/likering-admin.git
git branch -M main
git push -u origin main
```

O si prefieres usar SSH:

```bash
git remote add origin git@github.com:TU_USUARIO/likering-admin.git
git branch -M main
git push -u origin main
```

## Paso 3: Configurar Render.com

1. Ve a [Render.com](https://render.com) e inicia sesión
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub:
   - Selecciona el repositorio `likering-admin`
   - Click en "Connect"
4. Configura el servicio:
   - **Name**: `likering-admin`
   - **Environment**: `Node`
   - **Region**: Elige la región más cercana
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el plan que prefieras)
5. Configura las Variables de Entorno:
   - Click en "Advanced" → "Add Environment Variable"
   - Añade las siguientes variables:
     ```
     NODE_ENV=production
     PORT=3000
     DB_HOST=likering-db-nixoooo14.g.aivencloud.com
     DB_PORT=12691
     DB_NAME=defaultdb
     DB_USER=avnadmin
     DB_PASSWORD=[TU_CONTRASEÑA_DE_BASE_DE_DATOS]
     DB_SSL=true
     JWT_SECRET=[Genera un secreto seguro aquí]
     ```
   - Para generar un JWT_SECRET seguro, puedes usar:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
6. Click en "Create Web Service"
7. Espera a que se complete el build y deploy

## Paso 4: Inicializar Base de Datos

Después del primer deploy, necesitas ejecutar los scripts SQL:

1. Conéctate a tu base de datos usando pgAdmin, DBeaver, o cualquier cliente PostgreSQL
2. Ejecuta el contenido del archivo `scripts/create-tables.sql`
3. O usa la consola de Render para ejecutar:
   ```bash
   npm run init-db
   npm run create-admin
   ```

## Paso 5: Verificar el Deploy

1. Una vez completado el deploy, Render te dará una URL (ej: `https://likering-admin.onrender.com`)
2. Visita la URL y deberías ver la página de login
3. Inicia sesión con las credenciales del administrador que creaste

## Deploy Automático

Render.com despliega automáticamente cada vez que haces push a la rama `main` de GitHub.

Para hacer un deploy manual:
1. Ve al dashboard de Render
2. Selecciona el servicio "likering-admin"
3. Click en "Manual Deploy" → "Deploy latest commit"

## Notas Importantes

- ⚠️ **Seguridad**: Cambia el `JWT_SECRET` en producción por uno seguro y único
- 🔒 **Base de Datos**: Asegúrate de que la base de datos sea accesible desde los servidores de Render
- 📝 **Logs**: Puedes ver los logs en tiempo real desde el dashboard de Render
- 🔄 **Actualizaciones**: Cada push a `main` desplegará automáticamente

