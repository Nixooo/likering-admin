const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los comentarios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, video_id, sort = 'recent', date, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        c.*,
        u.image_url as user_image,
        v.titulo as video_titulo,
        v.thumbnail_url as video_thumbnail
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      LEFT JOIN videos v ON c.video_id = v.video_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`(c.comment_text ILIKE $${paramCount} OR c.username ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (video_id) {
      conditions.push(`c.video_id = $${paramCount}`);
      params.push(video_id);
      paramCount++;
    }

    if (date) {
      conditions.push(`DATE(c.created_at) = $${paramCount}`);
      params.push(date);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Ordenar según el parámetro sort
    let orderBy = 'c.created_at DESC';
    if (sort === 'oldest') {
      orderBy = 'c.created_at ASC';
    } else if (sort === 'edited') {
      conditions.push('c.updated_at IS NOT NULL AND c.updated_at != c.created_at');
      orderBy = 'c.updated_at DESC';
    }

    query += ` ORDER BY ${orderBy} LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total
    let countQuery = 'SELECT COUNT(*) FROM comments';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Eliminar comentario
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM comments WHERE comment_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    res.json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

// Obtener comentarios de un video específico
router.get('/video/:video_id', authenticateToken, async (req, res) => {
  try {
    const { video_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(`
      SELECT 
        c.*,
        u.image_url as user_image
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.video_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `, [video_id, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM comments WHERE video_id = $1',
      [video_id]
    );

    res.json({
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener comentarios del video:', error);
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

module.exports = router;

