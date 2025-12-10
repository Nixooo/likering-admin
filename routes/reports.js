const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los reportes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { estado, tipo_reporte, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        r.*,
        u_reporter.username as reporter_username,
        u_reporter.email as reporter_email,
        u_reported.username as reported_username,
        u_reported.email as reported_email,
        v.titulo as video_titulo,
        v.url as video_url,
        admin.nombre as resuelto_por_nombre
      FROM reportes r
      LEFT JOIN users u_reporter ON r.id_usuario_reporter = u_reporter.user_id
      LEFT JOIN users u_reported ON r.id_usuario_reportado = u_reported.user_id
      LEFT JOIN videos v ON r.id_video_reportado = v.video_id
      LEFT JOIN UsersAdmins admin ON r.resuelto_por = admin.id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (estado) {
      conditions.push(`r.estado = $${paramCount}`);
      params.push(estado);
      paramCount++;
    }

    if (tipo_reporte) {
      conditions.push(`r.tipo_reporte = $${paramCount}`);
      params.push(tipo_reporte);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY r.creado_en DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Obtener total de reportes
    let countQuery = 'SELECT COUNT(*) FROM reportes';
    const countParams = [];
    let countParamNum = 1;
    
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.map((cond, idx) => {
        const newCond = cond.replace(/\$\d+/g, () => `$${countParamNum++}`);
        countParams.push(params[idx]);
        return newCond;
      }).join(' AND ');
    }
    
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      reports: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// Obtener un reporte específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        r.*,
        u_reporter.username as reporter_username,
        u_reporter.email as reporter_email,
        u_reported.username as reported_username,
        u_reported.email as reported_email,
        v.titulo as video_titulo,
        v.url as video_url,
        admin.nombre as resuelto_por_nombre
      FROM reportes r
      LEFT JOIN users u_reporter ON r.id_usuario_reporter = u_reporter.user_id
      LEFT JOIN users u_reported ON r.id_usuario_reportado = u_reported.user_id
      LEFT JOIN videos v ON r.id_video_reportado = v.video_id
      LEFT JOIN UsersAdmins admin ON r.resuelto_por = admin.id
      WHERE r.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

// Actualizar estado de un reporte
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas_admin, prioridad } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }

    const estadosValidos = ['pendiente', 'en_revision', 'resuelto', 'rechazado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const result = await pool.query(
      `UPDATE reportes 
       SET estado = $1, 
           notas_admin = COALESCE($2, notas_admin),
           prioridad = COALESCE($3, prioridad),
           resuelto_por = CASE WHEN $1 IN ('resuelto', 'rechazado') THEN $4 ELSE resuelto_por END,
           actualizado_en = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [estado, notas_admin || null, prioridad || null, req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json({ message: 'Reporte actualizado correctamente', report: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({ error: 'Error al actualizar reporte' });
  }
});

// Crear un nuevo reporte (para pruebas o desde el admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tipo_reporte, id_usuario_reportado, id_video_reportado, id_usuario_reporter, motivo, descripcion, prioridad } = req.body;

    if (!tipo_reporte || !id_usuario_reporter || !motivo) {
      return res.status(400).json({ error: 'Campos requeridos: tipo_reporte, id_usuario_reporter, motivo' });
    }

    const result = await pool.query(
      `INSERT INTO reportes 
       (tipo_reporte, id_usuario_reportado, id_video_reportado, id_usuario_reporter, motivo, descripcion, prioridad)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tipo_reporte, id_usuario_reportado || null, id_video_reportado || null, id_usuario_reporter, motivo, descripcion || null, prioridad || 'media']
    );

    res.status(201).json({ message: 'Reporte creado correctamente', report: result.rows[0] });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ error: 'Error al crear reporte' });
  }
});

module.exports = router;

