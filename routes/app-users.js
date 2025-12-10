const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Obtener perfil de usuario (endpoint público para la app)
router.get('/profile', async (req, res) => {
  try {
    const { user } = req.query;

    if (!user) {
      return res.json({ success: false, message: 'Usuario requerido' });
    }

    // Obtener datos del usuario
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [user]
    );

    if (userResult.rows.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado' });
    }

    const userData = userResult.rows[0];

    // Obtener estadísticas
    const videosResult = await pool.query(
      'SELECT COUNT(*) as count FROM videos WHERE username = $1',
      [user]
    );
    const postsCount = parseInt(videosResult.rows[0].count) || 0;

    const followersResult = await pool.query(
      'SELECT COUNT(*) as count FROM follows WHERE following_username = $1',
      [user]
    );
    const followersCount = parseInt(followersResult.rows[0].count) || 0;

    const followingResult = await pool.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_username = $1',
      [user]
    );
    const followingCount = parseInt(followingResult.rows[0].count) || 0;

    const likesResult = await pool.query(
      `SELECT COALESCE(SUM(v.likes), 0) as total_likes 
       FROM videos v WHERE v.username = $1`,
      [user]
    );
    const likesCount = parseInt(likesResult.rows[0].total_likes) || 0;

    res.json({
      success: true,
      data: {
        user_id: userData.user_id || userData.id,
        id: userData.user_id || userData.id, // También incluir como 'id' para compatibilidad
        username: userData.username,
        imageUrl: userData.image_url,
        plan: userData.plan || 'azul',
        estado: userData.estado || 'Activo',
        followers: followersCount,
        following: followingCount,
        likes: likesCount,
        posts: postsCount
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.json({ success: false, message: 'Error al obtener perfil' });
  }
});

module.exports = router;

