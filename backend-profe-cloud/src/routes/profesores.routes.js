const { Router } = require('express');
const controlador = require('../controllers/profesor.controller');

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Profesor:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         nombre:
 *           type: string
 *           example: Profesor Ejemplo 1
 *         profesion:
 *           type: string
 *           example: Ingeniero de Software
 *         imagen:
 *           type: string
 *           nullable: true
 *           example: https://example.com/profesor.jpg
 *         habilidades:
 *           type: array
 *           items:
 *             type: string
 *           example: [React Native, Node.js]
 *       required: [nombre, profesion]
 *     ProfesorInput:
 *       type: object
 *       properties:
 *         nombre:
 *           type: string
 *         profesion:
 *           type: string
 *         imagen:
 *           type: string
 *           nullable: true
 *         habilidades:
 *           type: array
 *           items:
 *             type: string
 *       required: [nombre, profesion]
 */

/**
 * @openapi
 * /api/profesores:
 *   get:
 *     summary: Lista los profesores
 *     tags: [Profesores]
 *     responses:
 *       200:
 *         description: Lista de profesores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profesor'
 */
router.get('/', controlador.listar);

/**
 * @openapi
 * /api/profesores/{id}:
 *   get:
 *     summary: Obtiene un profesor por id
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profesor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profesor'
 *       400:
 *         description: Id inválido
 *       404:
 *         description: Profesor no encontrado
 */
router.get('/:id', controlador.obtenerPorId);

/**
 * @openapi
 * /api/profesores:
 *   post:
 *     summary: Crea un profesor
 *     tags: [Profesores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfesorInput'
 *     responses:
 *       201:
 *         description: Profesor creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', controlador.crear);

/**
 * @openapi
 * /api/profesores/{id}:
 *   put:
 *     summary: Reemplaza los datos de un profesor
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfesorInput'
 *     responses:
 *       200:
 *         description: Profesor actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Profesor no encontrado
 */
router.put('/:id', controlador.actualizar);

/**
 * @openapi
 * /api/profesores/{id}:
 *   delete:
 *     summary: Elimina un profesor
 *     tags: [Profesores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Profesor eliminado
 *       400:
 *         description: Id inválido
 *       404:
 *         description: Profesor no encontrado
 */
router.delete('/:id', controlador.eliminar);

module.exports = router;