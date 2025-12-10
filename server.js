const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const reportsRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const commentsRoutes = require('./routes/comments');
const followsRoutes = require('./routes/follows');
const messagesRoutes = require('./routes/messages');
const videosRoutes = require('./routes/videos');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/analytics', analyticsRoutes);

// Ruta principal - servir el index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Algo salió mal!', message: err.message });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Health check endpoint para Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Health check disponible en http://0.0.0.0:${PORT}/health`);
});

