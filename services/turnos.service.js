const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { N, PORCENTAJE_POR_UNIDAD } = require('../config/parametros');

const ARCHIVO_DATOS = path.join(__dirname, '..', 'data', 'turnos.json');

async function leerTurnos() {
  try {
    const contenido = await fs.readFile(ARCHIVO_DATOS, 'utf8');
    const turnos = JSON.parse(contenido);

    if (!Array.isArray(turnos)) {
      throw new Error('El archivo de turnos debe contener un arreglo JSON.');
    }

    return turnos;
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(ARCHIVO_DATOS), { recursive: true });
      await fs.writeFile(ARCHIVO_DATOS, '[]', 'utf8');
      return [];
    }

    throw error;
  }
}

async function guardarTurnos(turnos) {
  await fs.mkdir(path.dirname(ARCHIVO_DATOS), { recursive: true });
  await fs.writeFile(ARCHIVO_DATOS, JSON.stringify(turnos, null, 2), 'utf8');
}

async function listarTurnos() {
  return leerTurnos();
}

async function obtenerTurnoPorId(id) {
  const turnos = await leerTurnos();
  return turnos.find((turno) => turno.id === id) || null;
}

async function crearTurno(datos) {
  const turnos = await leerTurnos();
  const porcentajeRecargoConfigurado = N * PORCENTAJE_POR_UNIDAD;
  const porcentajeRecargoAplicado = datos.prioritario ? porcentajeRecargoConfigurado : 0;
  const valorRecargo = datos.precioBase * (porcentajeRecargoAplicado / 100);
  const totalPagar = datos.precioBase + valorRecargo;

  const nuevoTurno = {
    id: randomUUID(),
    cliente: datos.cliente,
    tipoServicio: datos.tipoServicio,
    fechaHora: datos.fechaHora,
    precioBase: datos.precioBase,
    prioritario: datos.prioritario,
    porcentajeRecargoConfigurado,
    porcentajeRecargoAplicado,
    valorRecargo: Number(valorRecargo.toFixed(2)),
    totalPagar: Number(totalPagar.toFixed(2)),
    creadoEn: new Date().toISOString()
  };

  turnos.push(nuevoTurno);
  await guardarTurnos(turnos);

  return nuevoTurno;
}

module.exports = {
  listarTurnos,
  obtenerTurnoPorId,
  crearTurno
};
