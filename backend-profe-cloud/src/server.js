require('dotenv').config();

const path = require('node:path');
const cors = require('cors');
const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const pool = require('./db');
const profesoresRouter = require('./routes/profesores.routes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservicio de Profesores',
      version: '1.0.0',
      description: 'API REST de profesores respaldada por PostgreSQL en Neon.',
    },
    servers: [{ url: '/' }],
  },
  apis: [path.join(__dirname, 'routes', '*.js').split(path.sep).join('/')],
});

app.get('/', (req, res) => {
  res.json({ servicio: 'profesores-service', documentacion: '/docs', salud: '/health' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1 FROM public.profesores LIMIT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check de PostgreSQL fallido:', error);
    return res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/profesores', profesoresRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });
  }
  console.error('Error inesperado en la solicitud:', error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

async function iniciarServidor() {
  const port = Number(process.env.PORT) || 3001;
  const server = app.listen(port, () => {
    console.log(`Microservicio de profesores escuchando en el puerto ${port}.`);
    console.log(`Swagger disponible en http://localhost:${port}/docs`);
  });

  const cerrarServidor = () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };

  process.once('SIGINT', cerrarServidor);
  process.once('SIGTERM', cerrarServidor);
}

iniciarServidor().catch(async (error) => {
  console.error('No se pudo iniciar el microservicio:', error);
  await pool.end();
  process.exit(1);
});