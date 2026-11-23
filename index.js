const express = require('express');
const turnosRoutes = require('./routes/turnos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para recibir y procesar cuerpos JSON.
app.use(express.json());

// Conexión de las rutas de la API.
app.use('/api/turnos', turnosRoutes);

// Respuesta para rutas que no existen.
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `No existe el recurso ${req.method} ${req.originalUrl}.`
  });
});

app.listen(PORT, () => {
  console.log(`API de turnos ejecutándose en http://localhost:${PORT}`);
});
