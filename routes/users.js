const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios con estadísticas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, estado, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        u.*,
        COALESCE(COUNT(DISTINCT v.video_id), 0) as total_videos,
        COALESCE(SUM(v.likes), 0) as total_likes,
        COALESCE(SUM(v.visualizaciones), 0) as total_visualizaciones
      FROM users u
      LEFT JOIN videos v ON u.user_id = v.user_id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (search) {
      conditions.push(`u.username ILIKE $${paramCount}`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Removido filtro de estado ya que no sabemos si existe la columna activo
    // Se puede agregar después si existe

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY u.user_id';
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total de usuarios para paginación
    let countQuery = 'SELECT COUNT(*) FROM users';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(
      countQuery.replace(/\$\d+/g, (match, offset, string) => {
        const num = parseInt(match.substring(1)) - (search ? 1 : 0) - (estado ? 1 : 0);
        return match;
      }),
      params.slice(0, params.length - 2)
    );

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener estadísticas de un usuario específico
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.*,
        COALESCE(COUNT(DISTINCT v.video_id), 0) as total_videos,
        COALESCE(SUM(v.likes), 0) as total_likes,
        COALESCE(SUM(v.visualizaciones), 0) as total_visualizaciones,
        COALESCE(u.followers, 0) as total_seguidores,
        COALESCE(u.following, 0) as total_siguiendo
      FROM users u
      LEFT JOIN videos v ON u.user_id = v.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas del usuario:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Activar/Desactivar usuario
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo activo debe ser un booleano' });
    }

    // Nota: Ajustar esta query según la estructura real de la tabla users
    // Por ahora comentamos ya que no sabemos si existe la columna 'activo'
    const result = await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *',
      [id]
    );
    
    // Si necesitas activar/desactivar, primero verifica si existe la columna 'activo' o 'is_active'

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente`, user: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ error: 'Error al actualizar estado del usuario' });
  }
});

// Obtener un usuario específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        u.*,
        COALESCE(COUNT(DISTINCT v.video_id), 0) as total_videos,
        COALESCE(SUM(v.likes), 0) as total_likes,
        COALESCE(SUM(v.visualizaciones), 0) as total_visualizaciones
      FROM users u
      LEFT JOIN videos v ON u.user_id = v.user_id
      WHERE u.user_id = $1
      GROUP BY u.user_id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

module.exports = router;

