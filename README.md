# Likering Admin Panel

Panel de administración para Likering - Aplicación tipo TikTok

## Características

- 🔐 Autenticación segura para administradores
- 👥 Gestión completa de usuarios
- 📊 Dashboard con estadísticas en tiempo real
- 🔍 Sistema de búsqueda y filtros avanzados
- ⚠️ Gestión de reportes y quejas de usuarios
- ✅ Activar/Desactivar cuentas de usuario
- 📈 Visualización de métricas (likes, videos, visualizaciones)

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Ejecutar scripts SQL para crear tablas:
```bash
# Conectarse a la base de datos y ejecutar scripts/create-tables.sql
```

4. Iniciar el servidor:
```bash
npm start
# o para desarrollo
npm run dev
```

## Despliegue en Render.com

El proyecto está configurado para desplegarse automáticamente en Render.com. 

**Para instrucciones detalladas de despliegue, consulta:**
- `GITHUB_SETUP.md` - Guía completa para GitHub y Render.com
- `DEPLOY.md` - Instrucciones de configuración inicial

### Resumen Rápido:
1. Crea un repositorio en GitHub y haz push del código
2. Conecta el repositorio a Render.com
3. Configura las variables de entorno en Render
4. Ejecuta los scripts SQL para crear las tablas
5. Crea un administrador con `npm run create-admin`

## Estructura del Proyecto

```
likering-admin/
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── scripts/
│   └── create-tables.sql
├── server.js
├── config/
│   └── database.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   └── reports.js
├── middleware/
│   └── auth.js
└── package.json
```

