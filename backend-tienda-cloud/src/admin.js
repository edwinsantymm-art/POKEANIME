require('dotenv').config();

const crypto = require('node:crypto');
const express = require('express');
const pool = require('./db');

const router = express.Router();
const tokenSecret = process.env.AUTH_TOKEN_SECRET;
const PLATAFORMAS = ['PlayStation', 'Xbox', 'Nintendo'];

if (typeof tokenSecret !== 'string' || tokenSecret.length < 32) {
  throw new Error('Configura AUTH_TOKEN_SECRET con al menos 32 caracteres aleatorios.');
}

// Reutiliza el mismo formato de token firmado que /api/auth/login.
function exigirSesion(req, res, next) {
  const encabezado = req.get('authorization') || '';
  const coincidencia = /^Bearer ([\w.-]+)$/.exec(encabezado);
  if (!coincidencia) {
    return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  }

  const [payload, firmaRecibida] = coincidencia[1].split('.');
  if (!payload || !firmaRecibida) {
    return res.status(401).json({ error: 'La sesión no es válida. Inicia sesión nuevamente.' });
  }

  const firmaEsperada = crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  const firmaBuffer = Buffer.from(firmaRecibida);
  const esperadaBuffer = Buffer.from(firmaEsperada);
  if (
    firmaBuffer.length !== esperadaBuffer.length ||
    !crypto.timingSafeEqual(firmaBuffer, esperadaBuffer)
  ) {
    return res.status(401).json({ error: 'La sesión no es válida. Inicia sesión nuevamente.' });
  }

  try {
    const usuario = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (
      typeof usuario.sub !== 'string' ||
      !/^\d+$/.test(usuario.sub) ||
      typeof usuario.correo !== 'string' ||
      typeof usuario.nombre !== 'string' ||
      !Number.isSafeInteger(usuario.exp) ||
      usuario.exp <= Math.floor(Date.now() / 1000)
    ) {
      return res.status(401).json({ error: 'La sesión venció. Inicia sesión nuevamente.' });
    }

    req.usuario = usuario;
    return next();
  } catch {
    return res.status(401).json({ error: 'La sesión no es válida. Inicia sesión nuevamente.' });
  }
}

// Consulta el rol en la base de datos para que un token viejo no pueda escalar privilegios.
async function exigirAdministrador(req, res, next) {
  try {
    const resultado = await pool.query(
      'SELECT rol FROM public.autopartes_usuarios WHERE id = $1',
      [req.usuario.sub],
    );
    if (resultado.rowCount === 0) {
      return res.status(401).json({ error: 'La cuenta de la sesión ya no existe.' });
    }
    if (resultado.rows[0].rol !== 'administrador') {
      return res.status(403).json({ error: 'Esta sección es solo para administradores.' });
    }

    req.usuario.rol = resultado.rows[0].rol;
    return next();
  } catch (error) {
    return responderError(res, error, 'No se pudo verificar el rol del usuario:');
  }
}

function responderError(res, error, contexto) {
  if (error && error.code === '42703') {
    return res.status(500).json({
      error: 'Falta aplicar la migración de roles en la base de datos. Ejecuta 20261114_add_user_roles.sql.',
    });
  }
  console.error(contexto, error);
  return res.status(500).json({ error: 'No se pudo completar la operación de administración.' });
}

function serializarProducto(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    plataforma: fila.plataforma,
    descripcion: fila.descripcion,
    precio: Number(fila.precio),
    stock: fila.stock === null ? 0 : Number(fila.stock),
    image_url: fila.image_url || '',
    activo: fila.activo,
  };
}

function idValido(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9-]{1,30}$/.test(id);
}

function validarProducto(datos) {
  const cuerpo = datos && typeof datos === 'object' ? datos : {};
  const nombre = typeof cuerpo.nombre === 'string' ? cuerpo.nombre.trim() : '';
  const categoria = typeof cuerpo.categoria === 'string' ? cuerpo.categoria.trim() : '';
  const plataforma = typeof cuerpo.plataforma === 'string' ? cuerpo.plataforma.trim() : '';
  const descripcion = typeof cuerpo.descripcion === 'string' ? cuerpo.descripcion.trim() : '';
  const imageUrl = typeof cuerpo.image_url === 'string' ? cuerpo.image_url.trim() : '';
  const precio = Number(cuerpo.precio);
  const stock = Number(cuerpo.stock);

  if (nombre.length < 2 || nombre.length > 160) {
    return { error: 'El nombre debe tener entre 2 y 160 caracteres.' };
  }
  if (categoria.length < 2 || categoria.length > 60) {
    return { error: 'El género debe tener entre 2 y 60 caracteres.' };
  }
  if (!PLATAFORMAS.includes(plataforma)) {
    return { error: 'La plataforma debe ser PlayStation, Xbox o Nintendo.' };
  }
  if (descripcion.length > 300) {
    return { error: 'La descripción no puede superar los 300 caracteres.' };
  }
  if (!Number.isFinite(precio) || precio <= 0 || precio > 9999999999.99) {
    return { error: 'El precio debe ser mayor que 0 y menor o igual a 9.999.999.999,99.' };
  }
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 999999) {
    return { error: 'El stock debe ser un número entero entre 0 y 999999.' };
  }
  if (imageUrl.length > 1000 || !/^https:\/\/\S+$/i.test(imageUrl)) {
    return { error: 'La imagen debe ser una URL HTTPS válida de hasta 1000 caracteres.' };
  }

  return {
    producto: {
      nombre,
      categoria,
      plataforma,
      descripcion,
      precio: Math.round(precio * 100) / 100,
      stock,
      image_url: imageUrl,
    },
  };
}

// Devuelve el rol de la sesión actual. El frontend lo usa para mostrar u ocultar el acceso.
router.get('/permiso', exigirSesion, async (req, res) => {
  try {
    const resultado = await pool.query(
      'SELECT rol FROM public.autopartes_usuarios WHERE id = $1',
      [req.usuario.sub],
    );
    if (resultado.rowCount === 0) {
      return res.status(401).json({ error: 'La cuenta de la sesión ya no existe.' });
    }
    return res.json({ rol: resultado.rows[0].rol });
  } catch (error) {
    return responderError(res, error, 'No se pudo consultar el rol del usuario:');
  }
});

router.get('/productos', exigirSesion, exigirAdministrador, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, categoria, plataforma, descripcion, precio, stock, image_url, activo
       FROM public.autopartes_productos
       WHERE activo = TRUE
         AND plataforma IN ('PlayStation', 'Xbox', 'Nintendo')
       ORDER BY nombre`,
    );
    return res.json({ products: resultado.rows.map(serializarProducto) });
  } catch (error) {
    return responderError(res, error, 'No se pudieron consultar los productos para administración:');
  }
});

router.post('/productos', exigirSesion, exigirAdministrador, async (req, res) => {
  const validacion = validarProducto(req.body);
  if (validacion.error) {
    return res.status(400).json({ error: validacion.error });
  }

  const datos = validacion.producto;
  try {
    for (let intento = 0; intento < 3; intento += 1) {
      const id = `gs-${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
      try {
        const resultado = await pool.query(
          `INSERT INTO public.autopartes_productos
            (id, nombre, categoria, plataforma, descripcion, precio, stock, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, nombre, categoria, plataforma, descripcion, precio, stock, image_url, activo`,
          [
            id,
            datos.nombre,
            datos.categoria,
            datos.plataforma,
            datos.descripcion,
            datos.precio,
            datos.stock,
            datos.image_url,
          ],
        );
        return res.status(201).json({
          message: 'Producto agregado al catálogo.',
          producto: serializarProducto(resultado.rows[0]),
        });
      } catch (error) {
        if (error.code !== '23505' || intento === 2) throw error;
      }
    }
  } catch (error) {
    return responderError(res, error, 'No se pudo agregar el producto:');
  }
});

router.patch('/productos/:id', exigirSesion, exigirAdministrador, async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'El identificador del producto no es válido.' });
  }

  const validacion = validarProducto(req.body);
  if (validacion.error) {
    return res.status(400).json({ error: validacion.error });
  }

  const datos = validacion.producto;
  try {
    const resultado = await pool.query(
      `UPDATE public.autopartes_productos
       SET nombre = $2,
           categoria = $3,
           plataforma = $4,
           descripcion = $5,
           precio = $6,
           stock = $7,
           image_url = $8
       WHERE id = $1
       RETURNING id, nombre, categoria, plataforma, descripcion, precio, stock, image_url, activo`,
      [
        req.params.id,
        datos.nombre,
        datos.categoria,
        datos.plataforma,
        datos.descripcion,
        datos.precio,
        datos.stock,
        datos.image_url,
      ],
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'El producto no existe.' });
    }
    return res.json({
      message: 'Producto actualizado.',
      producto: serializarProducto(resultado.rows[0]),
    });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el producto:');
  }
});

router.patch('/productos/:id/stock', exigirSesion, exigirAdministrador, async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'El identificador del producto no es válido.' });
  }

  const stock = Number(req.body && req.body.stock);
  if (!Number.isSafeInteger(stock) || stock < 0 || stock > 999999) {
    return res.status(400).json({ error: 'El stock debe ser un número entero entre 0 y 999999.' });
  }

  try {
    const resultado = await pool.query(
      `UPDATE public.autopartes_productos
       SET stock = $2
       WHERE id = $1
       RETURNING id, nombre, categoria, plataforma, descripcion, precio, stock, image_url, activo`,
      [req.params.id, stock],
    );
    if (resultado.rowCount === 0) {
      return res.status(404).json({ error: 'El producto no existe.' });
    }
    return res.json({
      message: 'Stock actualizado.',
      producto: serializarProducto(resultado.rows[0]),
    });
  } catch (error) {
    return responderError(res, error, 'No se pudo actualizar el stock:');
  }
});

router.delete('/productos/:id', exigirSesion, exigirAdministrador, async (req, res) => {
  if (!idValido(req.params.id)) {
    return res.status(400).json({ error: 'El identificador del producto no es válido.' });
  }

  try {
    const eliminado = await pool.query(
      'DELETE FROM public.autopartes_productos WHERE id = $1 RETURNING id',
      [req.params.id],
    );
    if (eliminado.rowCount > 0) {
      return res.json({ message: 'Producto eliminado.' });
    }
    return res.status(404).json({ error: 'El producto no existe.' });
  } catch (error) {
    // Las facturas históricas referencian el producto; se conserva la factura y se oculta del catálogo.
    if (error.code === '23503') {
      try {
        const desactivado = await pool.query(
          `UPDATE public.autopartes_productos
           SET activo = FALSE
           WHERE id = $1
           RETURNING id`,
          [req.params.id],
        );
        if (desactivado.rowCount === 0) {
          return res.status(404).json({ error: 'El producto no existe.' });
        }
        return res.json({
          message:
            'El producto tiene facturas asociadas, así que se desactivó del catálogo en lugar de borrarse.',
        });
      } catch (errorDesactivar) {
        return responderError(
          res,
          errorDesactivar,
          'No se pudo desactivar el producto con facturas:',
        );
      }
    }
    return responderError(res, error, 'No se pudo eliminar el producto:');
  }
});

module.exports = router;
