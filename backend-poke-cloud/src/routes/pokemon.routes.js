const { Router } = require('express');
const controlador = require('../controllers/pokemon.controller');

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Pokemon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         numero:
 *           type: integer
 *           example: 25
 *         nombre:
 *           type: string
 *           example: Pikachu
 *         tipo_principal:
 *           type: string
 *           example: Eléctrico
 *         tipo_secundario:
 *           type: string
 *           nullable: true
 *           example: null
 *         altura:
 *           type: number
 *           example: 0.4
 *         peso:
 *           type: number
 *           example: 6.0
 *         habilidad:
 *           type: string
 *           example: Electricidad Estática
 *         imagen:
 *           type: string
 *           example: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png
 *         descripcion:
 *           type: string
 *           example: Guarda electricidad en sus mejillas.
 */

/**
 * @openapi
 * /api/pokemon:
 *   get:
 *     summary: Lista los Pokémon almacenados en la base de datos propia
 *     tags: [Pokemon]
 *     responses:
 *       200:
 *         description: Lista de Pokémon
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pokemon'
 */
router.get('/', controlador.listar);

/**
 * @openapi
 * /api/pokemon/{id}:
 *   get:
 *     summary: Obtiene un Pokémon por su id
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pokémon encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Pokemon' }
 *       404:
 *         description: No encontrado
 */
router.get('/:id', controlador.obtenerPorId);

/**
 * @openapi
 * /api/pokemon:
 *   post:
 *     summary: Crea un nuevo Pokémon
 *     tags: [Pokemon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Pokemon' }
 *     responses:
 *       201:
 *         description: Pokémon creado
 */
router.post('/', controlador.crear);

/**
 * @openapi
 * /api/pokemon/{id}:
 *   put:
 *     summary: Actualiza un Pokémon existente
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Pokemon' }
 *     responses:
 *       200:
 *         description: Pokémon actualizado
 *       404:
 *         description: No encontrado
 */
router.put('/:id', controlador.actualizar);

/**
 * @openapi
 * /api/pokemon/{id}:
 *   delete:
 *     summary: Elimina un Pokémon
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Pokémon eliminado
 *       404:
 *         description: No encontrado
 */
router.delete('/:id', controlador.eliminar);

/**
 * @openapi
 * /api/pokemon/sincronizar:
 *   post:
 *     summary: Conecta el microservicio con la PokeAPI pública y guarda/actualiza los 10 Pokémon en la base de datos propia
 *     description: >
 *       Esta es la conexión real con la PokeAPI (https://pokeapi.co). El microservicio
 *       consulta cada Pokémon directamente ahí y lo guarda (INSERT) o lo actualiza
 *       (UPDATE) en la base de datos PostgreSQL propia. Los demás endpoints (GET,
 *       PUT, DELETE) solo leen/escriben en esa base de datos, no en PokeAPI.
 *     tags: [Pokemon]
 *     responses:
 *       200:
 *         description: Sincronización completada
 */
router.post('/sincronizar', controlador.sincronizar);

module.exports = router;
