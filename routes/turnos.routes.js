const express = require('express');
const turnosController = require('../controllers/turnos.controller');

const router = express.Router();

// Las rutas únicamente asocian endpoints con sus controladores.
router.get('/', turnosController.listarTurnos);
router.get('/:id', turnosController.obtenerTurnoPorId);
router.post('/', turnosController.crearTurno);

module.exports = router;
