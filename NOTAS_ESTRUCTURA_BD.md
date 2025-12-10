# Notas sobre la Estructura de la Base de Datos

## Tablas Identificadas

### Tabla `videos`
- `video_id` (clave primaria) - **NO es `id`**
- `user_id` (foreign key a users)
- `username` (varchar)
- `titulo` (varchar)
- `descripcion` (text)
- `video_url` (text)
- `thumbnail_url` (text)
- `music_url` (text)
- `likes` (integer)
- `visualizaciones` (integer) - **Nombre correcto**
- `comments_count` (integer)
- `created_at` (timestamp) - **NO es `creado_en`**
- `updated_at` (timestamp) - **NO es `actualizado_en`**
- `music_name` (varchar)

### Tabla `usersadmins`
- Parece ser para usuarios normales, no administradores
- Tiene: user_id, username, image_url, plan, likes, followers, following, etc.
- Tiene: password_hash, created_at, updated_at

### Tabla `users` (necesita verificación)
- Necesitamos verificar su estructura completa
- Probablemente tiene: user_id, username, created_at, etc.

### Tabla `reportes` (minúscula)
- Ya creada correctamente
- Usa minúsculas en el nombre

### Otras tablas
- `follows` - para relaciones de seguimiento
- `video_likes` - tabla separada para likes
- `video_views` - tabla separada para visualizaciones
- `comments` - comentarios

## Cambios Realizados

✅ Cambiado `v.id` → `v.video_id`
✅ Cambiado `u.id` → `u.user_id`
✅ Cambiado `creado_en` → `created_at`
✅ Cambiado `actualizado_en` → `updated_at`
✅ Cambiado `Reportes` → `reportes` (minúsculas)
✅ Ajustado joins con `user_id`
✅ Removido filtro de `activo` (no sabemos si existe)
✅ Ajustado búsqueda para usar solo `username`

## Pendientes

⚠️ Verificar estructura completa de `users`
⚠️ Verificar si existe columna `activo` o `is_active` en users
⚠️ Verificar si existe tabla de administradores o si está en otra tabla
⚠️ Ajustar funcionalidad de activar/desactivar usuarios según estructura real

