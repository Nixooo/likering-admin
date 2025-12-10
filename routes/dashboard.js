const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener estadísticas del dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Estadísticas generales
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = await pool.query("SELECT COUNT(*) FROM users WHERE activo = true");
    const totalVideos = await pool.query('SELECT COUNT(*) FROM videos');
    const totalReports = await pool.query('SELECT COUNT(*) FROM Reportes');
    const pendingReports = await pool.query("SELECT COUNT(*) FROM Reportes WHERE estado = 'pendiente'");

    // Estadísticas de likes y visualizaciones
    const likesStats = await pool.query('SELECT COALESCE(SUM(likes), 0) as total_likes FROM videos');
    const viewsStats = await pool.query('SELECT COALESCE(SUM(visualizaciones), 0) as total_visualizaciones FROM videos');

    // Usuarios más activos (top 5)
    const topUsers = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.nombre,
        COUNT(DISTINCT v.id) as total_videos,
        COALESCE(SUM(v.likes), 0) as total_likes,
        COALESCE(SUM(v.visualizaciones), 0) as total_visualizaciones
      FROM users u
      LEFT JOIN videos v ON u.id = v.user_id
      GROUP BY u.id, u.username, u.email, u.nombre
      ORDER BY total_visualizaciones DESC
      LIMIT 5
    `);

    // Videos más populares (top 5)
    const topVideos = await pool.query(`
      SELECT 
        v.id,
        v.titulo,
        v.url,
        v.likes,
        v.visualizaciones,
        v.creado_en,
        u.username as usuario_username
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY v.visualizaciones DESC
      LIMIT 5
    `);

    // Reportes por tipo
    const reportsByType = await pool.query(`
      SELECT 
        tipo_reporte,
        COUNT(*) as cantidad
      FROM Reportes
      GROUP BY tipo_reporte
    `);

    // Reportes por estado
    const reportsByStatus = await pool.query(`
      SELECT 
        estado,
        COUNT(*) as cantidad
      FROM Reportes
      GROUP BY estado
    `);

    // Nuevos usuarios (últimos 7 días)
    const newUsersWeek = await pool.query(`
      SELECT COUNT(*) 
      FROM users 
      WHERE creado_en >= NOW() - INTERVAL '7 days'
    `);

    // Nuevos videos (últimos 7 días)
    const newVideosWeek = await pool.query(`
      SELECT COUNT(*) 
      FROM videos 
      WHERE creado_en >= NOW() - INTERVAL '7 days'
    `);

    // Actividad por día (últimos 7 días)
    const activityByDay = await pool.query(`
      SELECT 
        DATE(creado_en) as fecha,
        COUNT(*) as cantidad
      FROM videos
      WHERE creado_en >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(creado_en)
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
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

