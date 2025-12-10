const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todas las relaciones de seguimiento
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, follower_id, following_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        f.*,
        u1.image_url as follower_image,
        u2.image_url as following_image
      FROM follows f
      LEFT JOIN users u1 ON f.follower_id = u1.user_id
      LEFT JOIN users u2 ON f.following_id = u2.user_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(f.follower_username ILIKE $${paramCount} OR f.following_username ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (follower_id) {
      conditions.push(`f.follower_id = $${paramCount}`);
      params.push(follower_id);
      paramCount++;
    }

    if (following_id) {
      conditions.push(`f.following_id = $${paramCount}`);
      params.push(following_id);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY f.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total
    let countQuery = 'SELECT COUNT(*) FROM follows';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      follows: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener seguimientos:', error);
    res.status(500).json({ error: 'Error al obtener seguimientos' });
  }
});

// Eliminar relación de seguimiento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM follows WHERE follow_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Relación de seguimiento no encontrada' });
    }

    res.json({ message: 'Relación de seguimiento eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar seguimiento:', error);
    res.status(500).json({ error: 'Error al eliminar seguimiento' });
  }
});

// Estadísticas de seguimientos
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalFollows = await pool.query('SELECT COUNT(*) FROM follows');
    const followsToday = await pool.query(`
      SELECT COUNT(*) FROM follows 
      WHERE created_at >= CURRENT_DATE
    `);
    const followsThisWeek = await pool.query(`
      SELECT COUNT(*) FROM follows 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const topFollowed = await pool.query(`
      SELECT 
        following_id,
        following_username,
        COUNT(*) as total_seguidores
      FROM follows
      GROUP BY following_id, following_username
      ORDER BY total_seguidores DESC
      LIMIT 10
    `);

    res.json({
      total: parseInt(totalFollows.rows[0].count),
      today: parseInt(followsToday.rows[0].count),
      thisWeek: parseInt(followsThisWeek.rows[0].count),
      topFollowed: topFollowed.rows
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de seguimientos:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

