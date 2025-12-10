# Instrucciones para DBeaver - Crear Tablas del Panel Admin

## 📋 Pasos para Ejecutar en DBeaver

### Paso 1: Conectarte a la Base de Datos

1. Abre DBeaver
2. Crea una nueva conexión PostgreSQL (si no la tienes):
   - **Host**: `likering-db-nixoooo14.g.aivencloud.com`
   - **Port**: `12691`
   - **Database**: `defaultdb`
   - **User**: `avnadmin`
   - **Password**: `AVNS_h_rc54oNmOHe1_gr9tC`
   - **SSL**: Habilitado (Required)

### Paso 2: Ejecutar el Script SQL

1. En DBeaver, abre el archivo `scripts/create-admin-tables-only.sql`
2. O copia y pega el contenido del script
3. Ejecuta el script completo (Ctrl+Enter o botón "Execute SQL Script")
4. Verifica que no haya errores

### Paso 3: Verificar que las Tablas se Crearon

1. Ejecuta el script `scripts/verificar-tablas.sql`
2. Deberías ver:
   - ✅ Tabla UsersAdmins existe
   - ✅ Tabla Reportes existe
   - Las estructuras de ambas tablas
   - Contadores de registros (deberían ser 0 inicialmente)

### Paso 4: Crear el Primer Administrador

Tienes dos opciones:

#### Opción A: Usar el Script Node.js (Recomendado)
```bash
npm run create-admin
```
Este script hashea la contraseña automáticamente con bcrypt.

#### Opción B: Crear Manualmente desde DBeaver

1. Primero, genera el hash de la contraseña:
   ```bash
   node -e "const bcrypt=require('bcryptjs'); bcrypt.hash('tu_contraseña', 10).then(h=>console.log(h))"
   ```

2. Luego ejecuta en DBeaver:
   ```sql
   INSERT INTO UsersAdmins (nombre, correo, contraseña, telefono)
   VALUES (
       'Tu Nombre',
       'tu@email.com',
       'PEGA_AQUI_EL_HASH_GENERADO',
       '3124769501'  -- Opcional
   );
   ```

## 📊 Estructura de las Tablas Creadas

### Tabla: UsersAdmins
- `id` - ID único del administrador
- `nombre` - Nombre completo
- `correo` - Correo electrónico (único)
- `contraseña` - Contraseña hasheada con bcrypt
- `telefono` - Teléfono (opcional)
- `creado_en` - Fecha de creación
- `actualizado_en` - Fecha de última actualización

### Tabla: Reportes
- `id` - ID único del reporte
- `tipo_reporte` - Tipo: 'video', 'usuario', 'comentario', 'otro'
- `id_usuario_reportado` - ID del usuario reportado (referencia a tabla users)
- `id_video_reportado` - ID del video reportado (si aplica)
- `id_usuario_reporter` - ID del usuario que hizo el reporte
- `motivo` - Motivo del reporte
- `descripcion` - Descripción detallada
- `estado` - Estado: 'pendiente', 'en_revision', 'resuelto', 'rechazado'
- `prioridad` - Prioridad: 'baja', 'media', 'alta'
- `resuelto_por` - ID del admin que resolvió
- `notas_admin` - Notas del administrador
- `creado_en` - Fecha de creación
- `actualizado_en` - Fecha de última actualización

## 🔍 Verificar Tablas Existentes

Si quieres ver todas tus tablas existentes:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

## ⚠️ Notas Importantes

- Las tablas se crean con `IF NOT EXISTS`, así que puedes ejecutar el script múltiples veces sin problemas
- Los índices mejoran el rendimiento de las búsquedas
- Las foreign keys están comentadas por si tus tablas tienen nombres diferentes (users, videos, etc.)
- Si tus tablas tienen nombres diferentes, ajusta las referencias en el script

## 🚀 Después de Crear las Tablas

1. Crea el primer administrador
2. Despliega en Render.com (ver `RENDER_DEPLOY.md`)
3. Inicia sesión en el panel de administración
4. ¡Listo para usar!

