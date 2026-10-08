require('dotenv').config();

const path = require('node:path');
const cors = require('cors');
const express = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const swaggerSpec = swaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Microservicio de Pokémon',
      version: '1.0.0',
      description: 'API REST de Pokémon respaldada por PostgreSQL en Neon.',
    },
    servers: [{ url: '/' }],
  },
  apis: [path.join(__dirname, 'server.js').split(path.sep).join('/')],
});

function adaptarPokemon(row) {
  const tipo = Array.isArray(row.type)
    ? row.type.join('/')
    : row.type ?? row.tipos?.join('/') ?? 'desconocido';

  return {
    poke_id: row.poke_id ?? row.id,
    name: row.name ?? row.nombre,
    type: tipo,
    altura: Number(row.altura ?? row.height ?? 0),
    peso: Number(row.peso ?? row.weight ?? 0),
    habilidad: row.habilidad ?? row.ability ?? '—',
    image_url: row.image_url ?? row.imagen ?? row.imagenPrincipal ?? null,
    imagen_shiny: row.imagen_shiny ?? row.imagenShiny ?? null,
    imagen_trasera: row.imagen_trasera ?? row.imagenTrasera ?? null,
    movimientos: row.movimientos ?? row.moves ?? [],
    descripcion: row.descripcion ?? row.description ?? 'Sin descripción disponible',
  };
}

app.get('/', (req, res) => {
  res.json({ servicio: 'pokemon-service', documentacion: '/docs', salud: '/health' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1 FROM public.pokemons LIMIT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check de PostgreSQL fallido:', error);
    return res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /api/pokemons:
 *   get:
 *     summary: Lista todos los Pokémon almacenados en Neon
 *     tags: [Pokémon]
 *     responses:
 *       200:
 *         description: Lista de Pokémon
 */
app.get('/api/pokemons', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM public.pokemons ORDER BY poke_id ASC');
    return res.json(resultado.rows);
  } catch (error) {
    console.error('No se pudieron consultar los Pokémon:', error);
    return res.status(500).json({ error: 'No se pudieron consultar los Pokémon.' });
  }
});

/**
 * @openapi
 * /api/pokemons/{consulta}:
 *   get:
 *     summary: Busca un Pokémon por número o nombre en Neon
 *     tags: [Pokémon]
 *     parameters:
 *       - in: path
 *         name: consulta
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pokémon encontrado
 *       404:
 *         description: Pokémon no encontrado
 */
app.get('/api/pokemons/:consulta', async (req, res) => {
  const { consulta } = req.params;
  const esNumero = /^\d+$/.test(consulta);

  try {
    const resultado = esNumero
      ? await pool.query('SELECT * FROM public.pokemons WHERE poke_id = $1', [Number(consulta)])
      : await pool.query('SELECT * FROM public.pokemons WHERE LOWER(name) = LOWER($1)', [consulta]);
    if (!resultado.rowCount) {
      return res.status(404).json({ message: 'Pokémon no encontrado en la base de datos.' });
    }
    return res.json(adaptarPokemon(resultado.rows[0]));
  } catch (error) {
    console.error('No se pudo consultar el Pokémon:', error);
    return res.status(500).json({ error: 'No se pudo consultar el Pokémon.' });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });
  }
  console.error('Error inesperado en la solicitud:', error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

async function iniciarServidor() {
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`Microservicio de Pokémon escuchando en el puerto ${port}.`);
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
  console.error('No se pudo inicializar la base de datos Neon:', error);
  await pool.end();
  process.exit(1);
});
