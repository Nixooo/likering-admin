# Guía de Despliegue - Likering Admin

## Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Base de Datos

Ejecutar el script SQL para crear las tablas:
```bash
npm run init-db
```

### 3. Crear Administrador Inicial

Ejecutar el script para crear el primer administrador:
```bash
npm run create-admin
```

Seguir las instrucciones en pantalla para ingresar:
- Nombre
- Correo
- Contraseña
- Teléfono (opcional)

## Despliegue en Render.com

### Paso 1: Preparar el Repositorio

1. Inicializar Git (si no está inicializado):
```bash
git init
git add .
git commit -m "Initial commit: Likering Admin Panel"
```

2. Crear repositorio en GitHub y hacer push:
```bash
git remote add origin <URL_DEL_REPOSITORIO>
git branch -M main
git push -u origin main
```

### Paso 2: Configurar en Render.com

1. Ir a [Render.com](https://render.com) y crear una cuenta/login

2. Click en "New +" → "Web Service"

3. Conectar el repositorio de GitHub

4. Configurar el servicio:
   - **Name**: likering-admin
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el plan que prefieras)

5. Configurar Variables de Entorno en Render:
   - `NODE_ENV`: production
   - `PORT`: 3000 (Render asigna automáticamente, pero puede especificarse)
  - `DB_HOST`: likering-db-nixoooo14.g.aivencloud.com
  - `DB_PORT`: 12691
  - `DB_NAME`: defaultdb
  - `DB_USER`: avnadmin
  - `DB_PASSWORD`: [TU_CONTRASEÑA_DE_BASE_DE_DATOS]
  - `DB_SSL`: true
   - `JWT_SECRET`: [Generar un secreto seguro y único]

6. Guardar y desplegar

### Paso 3: Ejecutar Scripts Iniciales

Después del primer despliegue, conectarse a la base de datos y ejecutar:
```bash
npm run init-db
npm run create-admin
```

O ejecutar los scripts SQL manualmente desde el panel de Render o usando una herramienta como pgAdmin.

## Actualizaciones y Deploy Automático

Render.com despliega automáticamente cada vez que haces push a la rama principal.

Para hacer un deploy manual:
1. Ve al dashboard de Render
2. Selecciona el servicio "likering-admin"
3. Click en "Manual Deploy" → "Deploy latest commit"

## Notas Importantes

- El archivo `render.yaml` está configurado para facilitar el despliegue
- Asegúrate de cambiar el `JWT_SECRET` en producción
- La base de datos debe estar accesible desde los servidores de Render
- Verifica que el SSL esté configurado correctamente para la conexión a la base de datos

