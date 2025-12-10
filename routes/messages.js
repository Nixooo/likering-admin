const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los mensajes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, sender_id, receiver_id, sender_username, receiver_username, date, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        m.*,
        u1.username as sender_username,
        u1.image_url as sender_image,
        u2.username as receiver_username,
        u2.image_url as receiver_image
      FROM messages m
      LEFT JOIN users u1 ON m.sender_id = u1.user_id
      LEFT JOIN users u2 ON m.receiver_id = u2.user_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`m.message_text ILIKE $${paramCount}`);
      params.push(`%${search}%`);
      paramCount++;
    }

    if (sender_id) {
      conditions.push(`m.sender_id = $${paramCount}`);
      params.push(sender_id);
      paramCount++;
    }

    if (receiver_id) {
      conditions.push(`m.receiver_id = $${paramCount}`);
      params.push(receiver_id);
      paramCount++;
    }

    if (sender_username) {
      conditions.push(`u1.username ILIKE $${paramCount}`);
      params.push(`%${sender_username}%`);
      paramCount++;
    }

    if (receiver_username) {
      conditions.push(`u2.username ILIKE $${paramCount}`);
      params.push(`%${receiver_username}%`);
      paramCount++;
    }

    if (date) {
      conditions.push(`DATE(m.created_at) = $${paramCount}`);
      params.push(date);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total
    let countQuery = 'SELECT COUNT(*) FROM messages';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      messages: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// Eliminar mensaje
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM messages WHERE message_id = $1 OR id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    res.json({ message: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    res.status(500).json({ error: 'Error al eliminar mensaje' });
  }
});

// Estadísticas de mensajes
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalMessages = await pool.query('SELECT COUNT(*) FROM messages');
    const messagesToday = await pool.query(`
      SELECT COUNT(*) FROM messages 
      WHERE created_at >= CURRENT_DATE
    `);
    const messagesThisWeek = await pool.query(`
      SELECT COUNT(*) FROM messages 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    res.json({
      total: parseInt(totalMessages.rows[0].count),
      today: parseInt(messagesToday.rows[0].count),
      thisWeek: parseInt(messagesThisWeek.rows[0].count)
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de mensajes:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

module.exports = router;

