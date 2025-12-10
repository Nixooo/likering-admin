const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Analytics generales
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Crecimiento de usuarios (últimos 30 días)
    const userGrowth = await pool.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as cantidad
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `);

    // Crecimiento de videos (últimos 30 días)
    const videoGrowth = await pool.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as cantidad
      FROM videos
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `);

    // Distribución de usuarios por plan
    const usersByPlan = await pool.query(`
      SELECT 
        COALESCE(plan, 'Sin plan') as plan,
        COUNT(*) as cantidad
      FROM users
      GROUP BY plan
      ORDER BY cantidad DESC
    `);

    // Actividad por hora del día
    const activityByHour = await pool.query(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hora,
        COUNT(*) as cantidad
      FROM videos
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY EXTRACT(HOUR FROM created_at)
      ORDER BY hora ASC
    `);

    // Top 10 videos más populares
    const topVideos = await pool.query(`
      SELECT 
        v.video_id,
        v.titulo,
        v.username,
        v.thumbnail_url,
        v.likes,
        v.visualizaciones,
        v.comments_count,
        v.created_at
      FROM videos v
      ORDER BY v.visualizaciones DESC
      LIMIT 10
    `);

    // Top 10 usuarios más activos
    const topUsers = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.image_url,
        u.plan,
        COUNT(DISTINCT v.video_id) as total_videos,
        COALESCE(SUM(v.likes), 0) as total_likes,
        COALESCE(SUM(v.visualizaciones), 0) as total_views
      FROM users u
      LEFT JOIN videos v ON u.user_id = v.user_id
      GROUP BY u.user_id, u.username, u.image_url, u.plan
      ORDER BY total_views DESC
      LIMIT 10
    `);

    // Engagement rate promedio
    const engagementStats = await pool.query(`
      SELECT 
        AVG(CASE WHEN visualizaciones > 0 THEN (likes::float / visualizaciones::float) * 100 ELSE 0 END) as avg_engagement_rate,
        AVG(likes) as avg_likes,
        AVG(visualizaciones) as avg_views
      FROM videos
      WHERE visualizaciones > 0
    `);

    res.json({
      userGrowth: userGrowth.rows,
      videoGrowth: videoGrowth.rows,
      usersByPlan: usersByPlan.rows,
      activityByHour: activityByHour.rows,
      topVideos: topVideos.rows,
      topUsers: topUsers.rows,
      engagement: {
        avgEngagementRate: engagementStats.rows[0]?.avg_engagement_rate || 0,
        avgLikes: engagementStats.rows[0]?.avg_likes || 0,
        avgViews: engagementStats.rows[0]?.avg_views || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener analytics:', error);
    res.status(500).json({ error: 'Error al obtener analytics' });
  }
});

module.exports = router;

