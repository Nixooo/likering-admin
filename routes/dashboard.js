const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener estadísticas del dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Estadísticas generales - con manejo de errores individual
    let totalUsers = { rows: [{ count: '0' }] };
    let activeUsers = { rows: [{ count: '0' }] };
    let totalVideos = { rows: [{ count: '0' }] };
    let totalReports = { rows: [{ count: '0' }] };
    let pendingReports = { rows: [{ count: '0' }] };

    try {
      totalUsers = await pool.query('SELECT COUNT(*) FROM users');
      activeUsers = await pool.query('SELECT COUNT(*) FROM users');
      totalVideos = await pool.query('SELECT COUNT(*) FROM videos');
      totalReports = await pool.query('SELECT COUNT(*) FROM reportes');
      pendingReports = await pool.query("SELECT COUNT(*) FROM reportes WHERE estado = 'pendiente'");
    } catch (err) {
      console.error('Error en estadísticas generales:', err.message);
    }

    // Estadísticas de likes y visualizaciones
    let likesStats = { rows: [{ total_likes: '0' }] };
    let viewsStats = { rows: [{ total_visualizaciones: '0' }] };
    
    try {
      likesStats = await pool.query('SELECT COALESCE(SUM(likes), 0) as total_likes FROM videos');
      viewsStats = await pool.query('SELECT COALESCE(SUM(visualizaciones), 0) as total_visualizaciones FROM videos');
    } catch (err) {
      console.error('Error en estadísticas de likes/visualizaciones:', err.message);
    }

    // Usuarios más activos (top 5) con foto de perfil
    let topUsers = { rows: [] };
    try {
      topUsers = await pool.query(`
        SELECT 
          u.user_id as id,
          u.username,
          u.image_url,
          u.plan,
          COUNT(DISTINCT v.video_id) as total_videos,
          COALESCE(SUM(v.likes), 0) as total_likes,
          COALESCE(SUM(v.visualizaciones), 0) as total_visualizaciones
        FROM users u
        LEFT JOIN videos v ON u.user_id = v.user_id
        GROUP BY u.user_id, u.username, u.image_url, u.plan
        ORDER BY total_visualizaciones DESC NULLS LAST
        LIMIT 5
      `);
    } catch (err) {
      console.error('Error en top usuarios:', err.message);
    }

    // Videos más populares (top 5) con portada
    let topVideos = { rows: [] };
    try {
      topVideos = await pool.query(`
        SELECT 
          v.video_id as id,
          v.titulo,
          v.video_url as url,
          v.thumbnail_url,
          v.likes,
          v.visualizaciones,
          v.created_at as creado_en,
          v.username as usuario_username
        FROM videos v
        WHERE v.visualizaciones IS NOT NULL
        ORDER BY v.visualizaciones DESC
        LIMIT 5
      `);
    } catch (err) {
      console.error('Error en top videos:', err.message);
    }

    // Reportes por tipo
    let reportsByType = { rows: [] };
    let reportsByStatus = { rows: [] };
    
    try {
      reportsByType = await pool.query(`
        SELECT 
          tipo_reporte,
          COUNT(*) as cantidad
        FROM reportes
        GROUP BY tipo_reporte
      `);

      reportsByStatus = await pool.query(`
        SELECT 
          estado,
          COUNT(*) as cantidad
        FROM reportes
        GROUP BY estado
      `);
    } catch (err) {
      console.error('Error en reportes:', err.message);
    }

    // Nuevos usuarios (últimos 7 días) - Manejo si no existe created_at
    let newUsersWeek;
    try {
      newUsersWeek = await pool.query(`
        SELECT COUNT(*) 
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);
    } catch (err) {
      // Si no existe created_at, intentar con otro nombre o devolver 0
      newUsersWeek = { rows: [{ count: '0' }] };
    }

    // Nuevos videos (últimos 7 días)
    let newVideosWeek = { rows: [{ count: '0' }] };
    let activityByDay = { rows: [] };
    
    try {
      newVideosWeek = await pool.query(`
        SELECT COUNT(*) 
        FROM videos 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `);

      activityByDay = await pool.query(`
        SELECT 
          DATE(created_at) as fecha,
          COUNT(*) as cantidad
        FROM videos
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY fecha ASC
      `);
    } catch (err) {
      console.error('Error en estadísticas de videos semanales:', err.message);
    }

    // Usuarios por plan
    let usersByPlan = { rows: [] };
    try {
      usersByPlan = await pool.query(`
        SELECT 
          COALESCE(plan, 'Sin plan') as plan,
          COUNT(*) as cantidad
        FROM users
        GROUP BY plan
        ORDER BY cantidad DESC
      `);
    } catch (err) {
      console.error('Error en usuarios por plan:', err.message);
    }

    // Usuarios por fecha (últimos 30 días para gráfica de líneas)
    let usersByDate = { rows: [] };
    try {
      usersByDate = await pool.query(`
        SELECT 
          DATE(created_at) as fecha,
          COUNT(*) as cantidad
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY fecha ASC
      `);
    } catch (err) {
      console.error('Error en usuarios por fecha:', err.message);
    }

    res.json({
      general: {
        totalUsuarios: parseInt(totalUsers.rows[0].count),
        usuariosActivos: parseInt(activeUsers.rows[0].count),
        totalVideos: parseInt(totalVideos.rows[0].count),
        totalReportes: parseInt(totalReports.rows[0].count),
        reportesPendientes: parseInt(pendingReports.rows[0].count),
        totalLikes: parseInt(likesStats.rows[0].total_likes),
        totalVisualizaciones: parseInt(viewsStats.rows[0].total_visualizaciones)
      },
      estaSemana: {
        nuevosUsuarios: parseInt(newUsersWeek.rows[0].count),
        nuevosVideos: parseInt(newVideosWeek.rows[0].count)
      },
      topUsuarios: topUsers.rows,
      topVideos: topVideos.rows,
      reportesPorTipo: reportsByType.rows,
      reportesPorEstado: reportsByStatus.rows,
      actividadPorDia: activityByDay.rows,
      usuariosPorPlan: usersByPlan.rows,
      usuariosPorFecha: usersByDate.rows
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas', 
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

