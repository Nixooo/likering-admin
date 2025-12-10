# Guía de Despliegue en Render.com

## 🚀 Configuración Completa para Render.com

### Opción 1: Web Service (Recomendado - Todo en uno)

Esta opción despliega el backend y frontend juntos en un solo servicio.

#### Paso 1: Crear Web Service

1. Ve a [Render.com](https://render.com) e inicia sesión
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub: `Nixooo/likering-admin`
4. Configura el servicio:
   - **Name**: `likering-admin`
   - **Environment**: `Node`
   - **Region**: Elige la más cercana
   - **Branch**: `main`
   - **Root Directory**: (dejar vacío)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el que prefieras)

#### Paso 2: Configurar Variables de Entorno

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
JWT_SECRET=[Genera uno con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
```

**Para generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Paso 3: Crear el Servicio

Click en **"Create Web Service"** y espera a que se complete el build.

#### Paso 4: Inicializar Base de Datos

**IMPORTANTE**: Después del primer deploy, necesitas crear las tablas:

**Opción A - Desde tu computadora (conectándote a la BD remota):**
1. Usa pgAdmin, DBeaver, o cualquier cliente PostgreSQL
2. Conéctate a: `likering-db-nixoooo14.g.aivencloud.com:12691`
3. Ejecuta el contenido completo de `scripts/create-tables.sql`

**Opción B - Desde Render Shell (si está disponible):**
1. Ve al dashboard de Render
2. Selecciona el servicio "likering-admin"
3. Click en "Shell" (si está disponible)
4. Ejecuta:
   ```bash
   npm run init-db
   npm run create-admin
   ```

#### Paso 5: Crear Primer Administrador

Después de crear las tablas, crea el primer admin:

**Opción A - Desde tu computadora:**
```bash
npm run create-admin
```
(Asegúrate de tener el .env configurado con las credenciales correctas)

**Opción B - Desde la base de datos directamente:**
Puedes insertar manualmente usando SQL (no recomendado por seguridad de contraseñas)

---

### Opción 2: Web Service + Static Site (Separado)

Si quieres separar el frontend y backend:

#### Web Service (Backend API)

1. Crear Web Service como en la Opción 1
2. **Start Command**: `npm start`
3. Este servicio solo expondrá las APIs en `/api/*`

#### Static Site (Frontend)

1. Click en **"New +"** → **"Static Site"**
2. Conecta el mismo repositorio
3. Configura:
   - **Name**: `likering-admin-frontend`
   - **Branch**: `main`
   - **Root Directory**: `public`
   - **Build Command**: (dejar vacío o `echo "No build needed"`)
   - **Publish Directory**: `public`

**⚠️ NOTA**: Si separas frontend y backend, necesitarás:
- Configurar CORS en el backend
- Cambiar las URLs de la API en el frontend
- Configurar variables de entorno para la URL del backend

---

## 📝 Configuración del .env Local (Para desarrollo)

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=likering-db-nixoooo14.g.aivencloud.com
DB_PORT=12691
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=AVNS_h_rc54oNmOHe1_gr9tC
DB_SSL=true
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
```

**⚠️ IMPORTANTE**: El archivo `.env` está en `.gitignore`, así que no se subirá a GitHub.

---

## ✅ Verificar el Deploy

1. Una vez completado el deploy, Render te dará una URL (ej: `https://likering-admin.onrender.com`)
2. Visita la URL
3. Deberías ver la página de login
4. Inicia sesión con las credenciales del administrador que creaste

---

## 🔄 Deploy Automático

Render.com despliega automáticamente cada vez que haces push a la rama `main` de GitHub.

Para hacer un deploy manual:
1. Ve al dashboard de Render
2. Selecciona el servicio
3. Click en **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que las variables de entorno estén correctas en Render
- Asegúrate de que la base de datos permita conexiones desde los servidores de Render
- Verifica que `DB_SSL=true` esté configurado

### Error al crear tablas
- Ejecuta el SQL manualmente desde un cliente PostgreSQL
- Verifica que tengas permisos en la base de datos

### Error 404 en las rutas
- Verifica que el servidor esté corriendo
- Revisa los logs en Render para ver errores

---

## 📊 Monitoreo

- **Logs**: Ve a "Logs" en el dashboard de Render para ver logs en tiempo real
- **Métricas**: Render muestra CPU, memoria y tráfico en el dashboard
- **Health Checks**: Render verifica automáticamente que el servicio esté funcionando

