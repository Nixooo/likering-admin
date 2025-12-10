const express = require('express');
const pool = require('../config/database');

const router = express.Router();

// Crear reporte público (sin autenticación para usuarios de la app)
router.post('/', async (req, res) => {
  try {
    const { tipo_reporte, id_usuario_reportado, id_video_reportado, id_usuario_reporter, motivo, descripcion } = req.body;

    if (!tipo_reporte || !id_usuario_reporter || !motivo) {
      return res.status(400).json({ 
        success: false,
        error: 'Campos requeridos: tipo_reporte, id_usuario_reporter, motivo' 
      });
    }

    // Validar tipos de reporte permitidos
    const tiposPermitidos = ['video', 'usuario', 'comentario', 'otro'];
    if (!tiposPermitidos.includes(tipo_reporte)) {
      return res.status(400).json({ 
        success: false,
        error: 'Tipo de reporte inválido. Tipos permitidos: video, usuario, comentario, otro' 
      });
    }

    const result = await pool.query(
      `INSERT INTO reportes 
       (tipo_reporte, id_usuario_reportado, id_video_reportado, id_usuario_reporter, motivo, descripcion, estado, prioridad)
       VALUES ($1, $2, $3, $4, $5, $6, 'pendiente', 'media')
       RETURNING *`,
      [
        tipo_reporte, 
        id_usuario_reportado || null, 
        id_video_reportado || null, 
        id_usuario_reporter, 
        motivo, 
        descripcion || null
      ]
    );

    res.status(201).json({ 
      success: true,
      message: 'Reporte enviado correctamente. Los administradores lo revisarán pronto.',
      reportId: result.rows[0].id
    });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al enviar el reporte. Por favor, intenta más tarde.' 
    });
  }
});

module.exports = router;

