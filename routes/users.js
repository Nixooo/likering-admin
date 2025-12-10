const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios con estadísticas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, estado, plan, limit = 50, offset = 0 } = req.query;

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

    if (estado) {
      conditions.push(`u.estado = $${paramCount}`);
      params.push(estado);
      paramCount++;
    }

    if (plan) {
      conditions.push(`LOWER(u.plan) = LOWER($${paramCount})`);
      params.push(plan);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY u.user_id, u.username, u.image_url, u.plan, u.estado, u.created_at, u.updated_at';
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total de usuarios para paginación
    let countQuery = 'SELECT COUNT(*) FROM users';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countParams = params.slice(0, params.length - 2);
    const countResult = await pool.query(countQuery, countParams);

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
      GROUP BY u.user_id, u.username, u.image_url, u.plan, u.estado, u.created_at, u.updated_at, u.followers, u.following
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
    const { estado } = req.body;

    if (!estado || (estado !== 'Activo' && estado !== 'Desactivo')) {
      return res.status(400).json({ error: 'El estado debe ser "Activo" o "Desactivo"' });
    }

    const result = await pool.query(
      'UPDATE users SET estado = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: `Usuario ${estado === 'Activo' ? 'activado' : 'desactivado'} correctamente`, user: result.rows[0] });
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
      GROUP BY u.user_id, u.username, u.image_url, u.plan, u.estado, u.created_at, u.updated_at
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

// Actualizar usuario (plan, username, estado, contraseña, image_url)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, plan, estado, password, image_url, email } = req.body;

    // Construir query dinámicamente basado en los campos proporcionados
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (username !== undefined) {
      updates.push(`username = $${paramCount}`);
      params.push(username);
      paramCount++;
    }

    if (plan !== undefined) {
      updates.push(`plan = $${paramCount}`);
      params.push(plan);
      paramCount++;
    }

    if (estado !== undefined) {
      if (estado !== 'Activo' && estado !== 'Desactivo') {
        return res.status(400).json({ error: 'El estado debe ser "Activo" o "Desactivo"' });
      }
      updates.push(`estado = $${paramCount}`);
      params.push(estado);
      paramCount++;
    }

    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount}`);
      params.push(image_url);
      paramCount++;
    }

    // Si se proporciona password, hashearlo
    if (password !== undefined && password.trim() !== '') {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      // Verificar si la columna se llama password_hash o password
      updates.push(`password_hash = $${paramCount}`);
      params.push(hashedPassword);
      paramCount++;
    }

    // Si se proporciona email y la columna existe
    if (email !== undefined) {
      // Intentar actualizar email si la columna existe (puede no existir)
      try {
        updates.push(`email = $${paramCount}`);
        params.push(email);
        paramCount++;
      } catch (err) {
        // Si la columna no existe, simplemente no la actualizamos
        console.log('Columna email no disponible en tabla users');
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE user_id = $${paramCount} 
      RETURNING user_id, username, plan, estado, image_url, created_at, updated_at
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario actualizado correctamente', user: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario', details: error.message });
  }
});

module.exports = router;

