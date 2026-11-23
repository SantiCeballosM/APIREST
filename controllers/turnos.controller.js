const turnosService = require('../services/turnos.service');

function validarDatosTurno(body) {
  const errores = [];

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON.'];
  }

  if (typeof body.cliente !== 'string' || body.cliente.trim() === '') {
    errores.push('El campo "cliente" es obligatorio y debe ser texto.');
  }

  if (typeof body.tipoServicio !== 'string' || body.tipoServicio.trim() === '') {
    errores.push('El campo "tipoServicio" es obligatorio y debe ser texto.');
  }

  if (typeof body.fechaHora !== 'string' || body.fechaHora.trim() === '' || Number.isNaN(Date.parse(body.fechaHora))) {
    errores.push('El campo "fechaHora" es obligatorio y debe contener una fecha y hora válidas.');
  }

  if (typeof body.precioBase !== 'number' || !Number.isFinite(body.precioBase) || body.precioBase <= 0) {
    errores.push('El campo "precioBase" es obligatorio y debe ser un número mayor que cero.');
  }

  if (body.prioritario !== undefined && typeof body.prioritario !== 'boolean') {
    errores.push('El campo "prioritario" debe ser true o false.');
  }

  return errores;
}

async function listarTurnos(req, res) {
  try {
    const turnos = await turnosService.listarTurnos();
    return res.status(200).json({ cantidad: turnos.length, turnos });
  } catch (error) {
    console.error('Error al listar turnos:', error);
    return res.status(500).json({ error: 'Error interno al consultar los turnos.' });
  }
}

async function obtenerTurnoPorId(req, res) {
  try {
    const turno = await turnosService.obtenerTurnoPorId(req.params.id);

    if (!turno) {
      return res.status(404).json({
        error: 'Turno no encontrado',
        mensaje: `No existe un turno con el identificador ${req.params.id}.`
      });
    }

    return res.status(200).json(turno);
  } catch (error) {
    console.error('Error al consultar turno:', error);
    return res.status(500).json({ error: 'Error interno al consultar el turno.' });
  }
}

async function crearTurno(req, res) {
  const errores = validarDatosTurno(req.body);

  if (errores.length > 0) {
    return res.status(400).json({
      error: 'Solicitud inválida',
      detalles: errores
    });
  }

  try {
    const turnoCreado = await turnosService.crearTurno({
      cliente: req.body.cliente.trim(),
      tipoServicio: req.body.tipoServicio.trim(),
      fechaHora: req.body.fechaHora,
      precioBase: req.body.precioBase,
      prioritario: req.body.prioritario === true
    });

    return res.status(201).json({
      mensaje: 'Turno registrado correctamente.',
      turno: turnoCreado
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    return res.status(500).json({ error: 'No fue posible registrar el turno.' });
  }
}

module.exports = {
  listarTurnos,
  obtenerTurnoPorId,
  crearTurno
};
