const pool = require('../db');
const { obtenerPokemonDesdePokeAPI } = require('../services/pokeapi.service');
const POKEMON_INICIALES = require('../pokemonesIniciales');

async function listar(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM pokemon ORDER BY numero ASC');
    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar la base de datos', detalle: error.message });
  }
}

async function obtenerPorId(req, res) {
  try {
    const resultado = await pool.query('SELECT * FROM pokemon WHERE id = $1', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Pokémon no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al consultar la base de datos', detalle: error.message });
  }
}

async function crear(req, res) {
  const { numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad, imagen, descripcion } =
    req.body;
  try {
    const resultado = await pool.query(
      `INSERT INTO pokemon (numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad, imagen, descripcion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad, imagen, descripcion],
    );
    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el Pokémon', detalle: error.message });
  }
}

async function actualizar(req, res) {
  const { numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad, imagen, descripcion } =
    req.body;
  try {
    const resultado = await pool.query(
      `UPDATE pokemon
       SET numero=$1, nombre=$2, tipo_principal=$3, tipo_secundario=$4, altura=$5, peso=$6, habilidad=$7, imagen=$8, descripcion=$9
       WHERE id = $10 RETURNING *`,
      [numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad, imagen, descripcion, req.params.id],
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Pokémon no encontrado' });
    }
    res.json(resultado.rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el Pokémon', detalle: error.message });
  }
}

async function eliminar(req, res) {
  try {
    const resultado = await pool.query('DELETE FROM pokemon WHERE id = $1 RETURNING *', [req.params.id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensaje: 'Pokémon no encontrado' });
    }
    res.json({ mensaje: 'Pokémon eliminado', pokemon: resultado.rows[0] });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el Pokémon', detalle: error.message });
  }
}

// Esta es la conexión real entre el microservicio y la PokeAPI pública:
// va, trae cada Pokémon desde PokeAPI, y lo guarda (o actualiza) en nuestra
// propia base de datos PostgreSQL. A partir de ahí, el resto de endpoints
// (GET/PUT/DELETE) solo hablan con la base de datos, no con PokeAPI.
async function sincronizar(req, res) {
  const resultados = [];

  for (const idONombre of POKEMON_INICIALES) {
    try {
      const p = await obtenerPokemonDesdePokeAPI(idONombre);

      const resultado = await pool.query(
        `INSERT INTO pokemon (numero, nombre, tipo_principal, tipo_secundario, altura, peso, habilidad, imagen, descripcion)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (numero) DO UPDATE SET
           nombre = EXCLUDED.nombre,
           tipo_principal = EXCLUDED.tipo_principal,
           tipo_secundario = EXCLUDED.tipo_secundario,
           altura = EXCLUDED.altura,
           peso = EXCLUDED.peso,
           habilidad = EXCLUDED.habilidad,
           imagen = EXCLUDED.imagen,
           descripcion = EXCLUDED.descripcion
         RETURNING *`,
        [p.numero, p.nombre, p.tipo_principal, p.tipo_secundario, p.altura, p.peso, p.habilidad, p.imagen, p.descripcion],
      );

      resultados.push(resultado.rows[0]);
    } catch (error) {
      resultados.push({ pokemon: idONombre, error: error.message });
    }
  }

  res.json({
    mensaje: 'Sincronización con PokeAPI completada',
    total: resultados.length,
    resultados,
  });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, sincronizar };
