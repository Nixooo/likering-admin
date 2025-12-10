# Guía para Inicializar la Base de Datos

## ⚠️ Problema Común

Si obtienes el error `ECONNREFUSED` al ejecutar `npm run init-db`, significa que:
- El archivo `.env` no está configurado correctamente, O
- Estás intentando conectarte a una base de datos local en lugar de la remota

## ✅ Solución: Inicializar Base de Datos Remota

### Opción 1: Usar Cliente PostgreSQL (Recomendado)

1. **Instala un cliente PostgreSQL:**
   - [pgAdmin](https://www.pgadmin.org/) (Recomendado)
   - [DBeaver](https://dbeaver.io/)
   - [TablePlus](https://tableplus.com/)

2. **Conéctate a tu base de datos:**
   - **Host**: `likering-db-nixoooo14.g.aivencloud.com`
   - **Port**: `12691`
   - **Database**: `defaultdb`
   - **User**: `avnadmin`
   - **Password**: `[TU_CONTRASEÑA_DE_BASE_DE_DATOS]`
   - **SSL**: Habilitado (Required)

3. **Ejecuta el script SQL:**
   - Abre el archivo `scripts/create-tables.sql`
   - Copia todo el contenido
   - Ejecútalo en el cliente PostgreSQL

### Opción 2: Configurar .env y Ejecutar Script

1. **Crea/Verifica el archivo `.env`** en la raíz del proyecto:

```env
DB_HOST=likering-db-nixoooo14.g.aivencloud.com
DB_PORT=12691
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=[TU_CONTRASEÑA_DE_BASE_DE_DATOS]
DB_SSL=true
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
```

2. **Ejecuta el script:**
```bash
npm run init-db
```

### Opción 3: Desde Render.com (Después del Deploy)

1. Despliega el servicio en Render.com primero
2. Ve al dashboard de Render
3. Selecciona tu servicio
4. Click en "Shell" (si está disponible)
5. Ejecuta:
   ```bash
   npm run init-db
   npm run create-admin
   ```

## 📝 Crear Primer Administrador

Después de crear las tablas, crea el primer administrador:

```bash
npm run create-admin
```

Ingresa:
- **Nombre**: Tu nombre completo
- **Correo**: Tu correo electrónico
- **Contraseña**: Una contraseña segura
- **Teléfono**: (Opcional)

## 🔍 Verificar que Funciona

Después de crear las tablas y el administrador:

1. Inicia el servidor:
   ```bash
   npm start
   ```

2. Visita: http://localhost:3000

3. Inicia sesión con las credenciales que creaste

## ⚠️ Notas Importantes

- El archivo `.env` NO se sube a GitHub (está en `.gitignore`)
- Las credenciales en Render.com se configuran como variables de entorno
- Asegúrate de que la base de datos permita conexiones desde tu IP (o desde Render)

