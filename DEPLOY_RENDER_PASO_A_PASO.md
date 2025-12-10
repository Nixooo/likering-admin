# 🚀 Desplegar en Render.com - Paso a Paso

## ✅ Ya Completado
- ✓ Tablas creadas en la base de datos
- ✓ Administrador creado

## 📝 Paso a Paso para Render.com

### Paso 1: Ir a Render.com
1. Ve a [https://render.com](https://render.com)
2. Inicia sesión (o crea una cuenta si no tienes)

### Paso 2: Crear Web Service
1. Click en el botón **"New +"** (arriba a la derecha)
2. Selecciona **"Web Service"**

### Paso 3: Conectar Repositorio
1. Render te pedirá conectar un repositorio
2. Click en **"Connect account"** si no has conectado GitHub
3. Autoriza Render para acceder a tus repositorios
4. Busca y selecciona: **`Nixooo/likering-admin`**
5. Click en **"Connect"**

### Paso 4: Configurar el Servicio
Llena los siguientes campos:

- **Name**: `likering-admin`
- **Environment**: `Node`
- **Region**: Elige la región más cercana (ej: `Oregon (US West)` o `Frankfurt (EU)`)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: `Free` (o el plan que prefieras)

### Paso 5: Configurar Variables de Entorno

**IMPORTANTE**: Antes de crear el servicio, haz scroll hacia abajo y busca la sección **"Environment Variables"** o **"Advanced"**.

Click en **"Add Environment Variable"** y añade cada una de estas:

```
NODE_ENV = production
PORT = 3000
DB_HOST = likering-db-nixoooo14.g.aivencloud.com
DB_PORT = 12691
DB_NAME = defaultdb
DB_USER = avnadmin
DB_PASSWORD = AVNS_h_rc54oNmOHe1_gr9tC
DB_SSL = true
JWT_SECRET = [Genera uno con el comando de abajo]
```

**Para generar JWT_SECRET:**
Ejecuta en tu terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y úsalo como valor de `JWT_SECRET`.

### Paso 6: Crear el Servicio
1. Verifica que todas las variables de entorno estén configuradas
2. Click en el botón **"Create Web Service"** (abajo)
3. Render comenzará a construir y desplegar tu aplicación
4. Espera 2-5 minutos para que se complete

### Paso 7: Verificar el Deploy

1. Una vez completado, Render te mostrará una URL como:
   - `https://likering-admin.onrender.com`
   - O `https://likering-admin-xxxx.onrender.com`

2. **Click en la URL** o cópiala y ábrela en tu navegador

3. Deberías ver la página de login de Likering Admin

4. Inicia sesión con las credenciales del administrador que creaste:
   - Correo: (el que ingresaste)
   - Contraseña: (la que ingresaste)

### Paso 8: ¡Listo! 🎉

Tu panel de administración está funcionando. Puedes:
- Ver el dashboard con estadísticas
- Gestionar usuarios
- Ver y gestionar reportes
- Activar/desactivar cuentas

## 🔄 Deploy Automático

A partir de ahora, cada vez que hagas `git push` a la rama `main`, Render desplegará automáticamente los cambios.

## 📊 Monitoreo

- **Logs**: Ve a "Logs" en el dashboard de Render para ver logs en tiempo real
- **Métricas**: Render muestra CPU, memoria y tráfico
- **Health Checks**: Render verifica automáticamente que el servicio funcione

## ⚠️ Si hay Problemas

1. **Error de conexión a la base de datos:**
   - Verifica que las variables de entorno estén correctas
   - Asegúrate de que `DB_SSL=true`

2. **Error 404 o página no carga:**
   - Revisa los logs en Render
   - Verifica que el servidor esté corriendo

3. **Error al iniciar sesión:**
   - Verifica que el administrador se haya creado correctamente
   - Revisa que las credenciales sean correctas

## 📝 Notas

- El plan Free puede tener límites de tiempo de inactividad (se "duerme" después de 15 minutos sin uso)
- Para evitar esto, considera actualizar a un plan de pago
- O puedes usar un servicio de ping para mantener el servicio activo

