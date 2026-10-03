const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const pool = require('./db');
const asegurarProfesores = require('./profesoresIniciales');

const app = express();
app.use(cors());
app.use(express.json());

// Definición de OpenAPI para Swagger UI
const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservicio Neon PostgreSQL + Swagger',
      version: '1.0.0',
      description: 'API de Pokémon y profesores con Neon PostgreSQL como fuente de consulta.'
    },
    servers: [{ url: '/' }]
  },
  apis: ['./src/server.js']
});

// Ruta de Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check (usado por el render.yaml para saber si el servicio está vivo)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

/**
 * @swagger
 * /api/pokemons:
 *   get:
 *     summary: Obtiene todos los pokemones guardados en Neon
 *     responses:
 *       200:
 *         description: Lista devuelta exitosamente
 */
app.get('/api/pokemons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pokemons ORDER BY poke_id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/pokemons/{name}:
 *   get:
 *     summary: Busca un pokemon por nombre en Neon DB
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pokemon encontrado
 *       404:
 *         description: No encontrado
 */
app.get('/api/pokemons/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const esNumero = /^\d+$/.test(name);
    const valor = esNumero ? Number(name) : name;
    if (esNumero && !Number.isSafeInteger(valor)) {
      return res.status(404).json({ message: 'Pokémon no encontrado en la BD' });
    }

    const consulta = esNumero
      ? 'SELECT * FROM pokemons WHERE poke_id = $1'
      : 'SELECT * FROM pokemons WHERE LOWER(name) = LOWER($1)';
    const result = await pool.query(consulta, [valor]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pokémon no encontrado en la BD' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/profesores:
 *   get:
 *     summary: Obtiene todos los profesores guardados en Neon
 *     responses:
 *       200:
 *         description: Lista devuelta exitosamente
 */
app.get('/api/profesores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM profesores ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/profesores/{id}:
 *   get:
 *     summary: Obtiene un profesor por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profesor encontrado
 *       404:
 *         description: No encontrado
 */
app.get('/api/profesores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM profesores WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pokemons (
      id SERIAL PRIMARY KEY,
      poke_id INT UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      type VARCHAR(100) NOT NULL,
      altura NUMERIC(5, 2),
      peso NUMERIC(5, 2),
      habilidad VARCHAR(100),
      image_url TEXT,
      imagen_shiny TEXT,
      imagen_trasera TEXT,
      movimientos TEXT[],
      descripcion TEXT
    );
  `);

  app.listen(PORT, async () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    console.log('Búsquedas de Pokémon consultan únicamente Neon PostgreSQL.');
    console.log('Documentación Swagger disponible en /docs');
    await asegurarProfesores();
  });
}

iniciarServidor().catch(async (error) => {
  console.error('No se pudo inicializar la base de datos Neon:', error);
  await pool.end();
  process.exit(1);
});