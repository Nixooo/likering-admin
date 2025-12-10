const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener estadísticas del dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Estadísticas generales
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users'); // Ajustar si hay columna activo
    const totalVideos = await pool.query('SELECT COUNT(*) FROM videos');
    const totalReports = await pool.query('SELECT COUNT(*) FROM reportes');
    const pendingReports = await pool.query("SELECT COUNT(*) FROM reportes WHERE estado = 'pendiente'");

    // Estadísticas de likes y visualizaciones
    const likesStats = await pool.query('SELECT COALESCE(SUM(likes), 0) as total_likes FROM videos');
    const viewsStats = await pool.query('SELECT COALESCE(SUM(visualizaciones), 0) as total_visualizaciones FROM videos');

    // Usuarios más activos (top 5)
    const topUsers = await pool.query(`
      SELECT 
        u.user_id as id,
        u.username,
        COUNT(DISTINCT v.video_id) as total_videos,
        COALESCE(SUM(v.likes), 0) as total_likes,
        COALESCE(SUM(v.visualizaciones), 0) as total_visualizaciones
      FROM users u
      LEFT JOIN videos v ON u.user_id = v.user_id
      GROUP BY u.user_id, u.username
      ORDER BY total_visualizaciones DESC
      LIMIT 5
    `);

    // Videos más populares (top 5)
    const topVideos = await pool.query(`
      SELECT 
        v.video_id as id,
        v.titulo,
        v.video_url as url,
        v.likes,
        v.visualizaciones,
        v.created_at as creado_en,
        v.username as usuario_username
      FROM videos v
      ORDER BY v.visualizaciones DESC
      LIMIT 5
    `);

    // Reportes por tipo
    const reportsByType = await pool.query(`
      SELECT 
        tipo_reporte,
        COUNT(*) as cantidad
      FROM reportes
      GROUP BY tipo_reporte
    `);

    // Reportes por estado
    const reportsByStatus = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM reportes
      GROUP BY estado
    `);

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
    const newVideosWeek = await pool.query(`
      SELECT COUNT(*) 
      FROM videos 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Actividad por día (últimos 7 días)
    const activityByDay = await pool.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as cantidad
      FROM videos
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `);

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
      actividadPorDia: activityByDay.rows
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

