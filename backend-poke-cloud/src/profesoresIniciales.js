// backend-poke-cloud/src/profesoresIniciales.js
const pool = require('./db');

// Datos de ejemplo — reemplaza nombre, profesión, imagen y habilidades por los reales.
const PROFESORES_EJEMPLO = [
  {
    nombre: 'Profesor Ejemplo 1',
    profesion: 'Ingeniero de Software',
    imagen: 'https://via.placeholder.com/300x300.png?text=Profesor+1',
    habilidades: ['React Native', 'Node.js', 'Bases de datos'],
  },
  {
    nombre: 'Profesor Ejemplo 2',
    profesion: 'Magíster en Ciencias de la Computación',
    imagen: 'https://via.placeholder.com/300x300.png?text=Profesor+2',
    habilidades: ['Arquitectura de software', 'Cloud Computing', 'DevOps'],
  },
];

async function asegurarProfesores() {
  try {
    // 1. Crear la tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profesores (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        profesion VARCHAR(100) NOT NULL,
        imagen TEXT,
        habilidades TEXT[]
      );
    `);

    // 2. Sembrar solo si está vacía (para no duplicar en cada reinicio del servidor)
    const { rows } = await pool.query('SELECT COUNT(*)::int AS total FROM profesores');
    if (rows[0].total > 0) {
      console.log('Tabla "profesores" ya tiene datos, no se vuelve a sembrar.');
      return;
    }

    for (const profesor of PROFESORES_EJEMPLO) {
      await pool.query(
        `INSERT INTO profesores (nombre, profesion, imagen, habilidades)
         VALUES ($1, $2, $3, $4)`,
        [profesor.nombre, profesor.profesion, profesor.imagen, profesor.habilidades],
      );
    }

    console.log(`Tabla "profesores" sembrada con ${PROFESORES_EJEMPLO.length} registros.`);
  } catch (error) {
    console.error('Error al preparar la tabla "profesores":', error);
  }
}

module.exports = asegurarProfesores;
