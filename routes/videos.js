const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los videos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, user_id, sort = 'recent', date_from, date_to, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        v.*,
        u.image_url as user_image
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.user_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(v.titulo ILIKE $${paramCount} OR v.username ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (user_id) {
      conditions.push(`v.user_id = $${paramCount}`);
      params.push(user_id);
      paramCount++;
    }

    if (date_from) {
      conditions.push(`DATE(v.created_at) >= $${paramCount}`);
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      conditions.push(`DATE(v.created_at) <= $${paramCount}`);
      params.push(date_to);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Ordenar según el parámetro sort
    let orderBy = 'v.created_at DESC';
    if (sort === 'popular') {
      orderBy = 'v.visualizaciones DESC NULLS LAST';
    } else if (sort === 'likes') {
      orderBy = 'v.likes DESC NULLS LAST';
    } else if (sort === 'views') {
      orderBy = 'v.visualizaciones DESC NULLS LAST';
    }

    query += ` ORDER BY ${orderBy} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total
    let countQuery = 'SELECT COUNT(*) FROM videos';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      videos: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener videos:', error);
    res.status(500).json({ error: 'Error al obtener videos' });
  }
});

// Obtener un video específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        v.*,
        u.image_url as user_image,
        u.username as user_username
      FROM videos v
      LEFT JOIN users u ON v.user_id = u.user_id
      WHERE v.video_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener video:', error);
    res.status(500).json({ error: 'Error al obtener video' });
  }
});

// Eliminar video
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM videos WHERE video_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    res.json({ message: 'Video eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({ error: 'Error al eliminar video' });
  }
});

module.exports = router;

