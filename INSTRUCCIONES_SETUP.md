# Instrucciones de Configuración - Likering Admin

## ✅ Paso 1: Instalar Dependencias

```bash
npm install
```

## ✅ Paso 2: Inicializar Base de Datos

Tienes dos opciones:

### Opción A: Usar el script automatizado (Recomendado)
```bash
npm run init-db
```

### Opción B: Ejecutar manualmente el SQL
1. Conéctate a tu base de datos PostgreSQL usando pgAdmin, DBeaver, o cualquier cliente
2. Ejecuta el contenido completo del archivo `scripts/create-tables.sql`

## ✅ Paso 3: Crear Primer Administrador

```bash
npm run create-admin
```

Seguir las instrucciones en pantalla:
- Ingresa tu nombre
- Ingresa tu correo electrónico
- Ingresa una contraseña segura
- Ingresa tu teléfono (opcional)

## ✅ Paso 4: Probar Localmente (Opcional)

```bash
npm start
```

Luego visita: http://localhost:3000

## ✅ Paso 5: Configurar Render.com

1. Ve a [Render.com](https://render.com) e inicia sesión
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio de GitHub: `Nixooo/likering-admin`
4. Configura el servicio:
   - **Name**: `likering-admin`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el que prefieras)

5. **Variables de Entorno en Render** (IMPORTANTE):
   ```
   NODE_ENV=production
   PORT=3000
   DB_HOST=likering-db-nixoooo14.g.aivencloud.com
   DB_PORT=12691
   DB_NAME=defaultdb
   DB_USER=avnadmin
   DB_PASSWORD=[TU_CONTRASEÑA_DE_BASE_DE_DATOS]
   DB_SSL=true
   JWT_SECRET=[Genera uno seguro con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
   ```

6. Click en "Create Web Service"

## ✅ Paso 6: Inicializar Base de Datos en Render

Después del primer deploy en Render, necesitas ejecutar los scripts SQL:

**Opción A**: Conectarte a la base de datos directamente y ejecutar `scripts/create-tables.sql`

**Opción B**: Usar la consola de Render (si está disponible):
```bash
npm run init-db
npm run create-admin
```

## ✅ Paso 7: Verificar el Deploy

1. Render te dará una URL (ej: `https://likering-admin.onrender.com`)
2. Visita la URL
3. Deberías ver la página de login
4. Inicia sesión con las credenciales del administrador que creaste

## 🔄 Deploy Automático

Render.com desplegará automáticamente cada vez que hagas push a la rama `main` de GitHub.

Para hacer un deploy manual:
1. Ve al dashboard de Render
2. Selecciona el servicio "likering-admin"
3. Click en "Manual Deploy" → "Deploy latest commit"

## 📝 Notas Importantes

- ⚠️ **JWT_SECRET**: Genera uno único y seguro para producción
- 🔒 **Base de Datos**: Asegúrate de que la base de datos sea accesible desde Render
- 📊 **Logs**: Puedes ver los logs en tiempo real desde el dashboard de Render
- 🔄 **Actualizaciones**: Cada push a `main` desplegará automáticamente

