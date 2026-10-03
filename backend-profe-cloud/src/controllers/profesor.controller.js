const pool = require('../db');

const CAMPOS_REQUERIDOS = ['nombre', 'profesion'];

function validarId(valor) {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validarProfesor(datos) {
  const errores = [];

  for (const campo of CAMPOS_REQUERIDOS) {
    if (typeof datos[campo] !== 'string' || datos[campo].trim().length === 0) {
      errores.push(`El campo ${campo} es obligatorio y debe ser texto.`);
    }
  }

  if (typeof datos.nombre === 'string' && datos.nombre.trim().length > 100) {
    errores.push('El campo nombre no puede superar 100 caracteres.');
  }

  if (typeof datos.profesion === 'string' && datos.profesion.trim().length > 150) {
    errores.push('El campo profesion no puede superar 150 caracteres.');
  }

  if (datos.imagen !== undefined && datos.imagen !== null && typeof datos.imagen !== 'string') {
    errores.push('El campo imagen debe ser texto o null.');
  }

  if (datos.habilidades !== undefined && (!Array.isArray(datos.habilidades) || datos.habilidades.some((habilidad) => typeof habilidad !== 'string'))) {
    errores.push('El campo habilidades debe ser una lista de textos.');
  }

  return errores;
}

function normalizarProfesor(datos) {
  return {
    nombre: datos.nombre.trim(),
    profesion: datos.profesion.trim(),
    imagen: typeof datos.imagen === 'string' ? datos.imagen.trim() || null : null,
    habilidades: Array.isArray(datos.habilidades)
      ? datos.habilidades.map((habilidad) => habilidad.trim()).filter(Boolean)
      : [],
  };
}

function responderError(res, error, mensaje) {
  console.error(mensaje, error);
  return res.status(500).json({ error: mensaje });
}

async function listar(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT id, nombre, profesion, imagen, habilidades FROM profesores ORDER BY id ASC',
    );
    return res.json(resultado.rows);
  } catch (error) {
    return responderError(res, error, 'No se pudieron obtener los profesores.');
  }
}

async function obtenerPorId(req, res) {
  const id = validarId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  try {
    const resultado = await pool.query(
      'SELECT id, nombre, profesion, imagen, habilidades FROM profesores WHERE id = $1',
      [id],
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Profesor no encontrado.' });
    return res.json(resultado.rows[0]);
  } catch (error) {
    return responderError(res, error, 'No se pudo obtener el profesor.');
  }
}

async function crear(req, res) {
  const errores = validarProfesor(req.body ?? {});
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  const profesor = normalizarProfesor(req.body);
  try {
    const resultado = await pool.query(
      `INSERT INTO profesores (nombre, profesion, imagen, habilidades)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, profesion, imagen, habilidades`,
      [profesor.nombre, profesor.profesion, profesor.imagen, profesor.habilidades],
    );
    return res.status(201).json(resultado.rows[0]);
  } catch (error) {
    return responderError(res, error, 'No se pudo crear el profesor.');
  }
}

async function actualizar(req, res) {
  const id = validarId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  const errores = validarProfesor(req.body ?? {});
  if (errores.length) return res.status(400).json({ error: 'Datos inválidos.', detalles: errores });

  const profesor = normalizarProfesor(req.body);
  try {
    const resultado = await pool.query(
      `UPDATE profesores
       SET nombre = $1, profesion = $2, imagen = $3, habilidades = $4
       WHERE id = $5
       RETURNING id, nombre, profesion, imagen, habilidades`,
      [profesor.nombre, profesor.profesion, profesor.imagen, profesor.habilidades, id],
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Profesor no encontrado.' });
    return res.json(resultado.rows[0]);
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el profesor.');
  }
}

async function eliminar(req, res) {
  const id = validarId(req.params.id);
  if (!id) return res.status(400).json({ error: 'El id debe ser un entero positivo.' });

  try {
    const resultado = await pool.query(
      'DELETE FROM profesores WHERE id = $1 RETURNING id',
      [id],
    );
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Profesor no encontrado.' });
    return res.json({ mensaje: 'Profesor eliminado.', id: resultado.rows[0].id });
  } catch (error) {
    return responderError(res, error, 'No se pudo eliminar el profesor.');
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };