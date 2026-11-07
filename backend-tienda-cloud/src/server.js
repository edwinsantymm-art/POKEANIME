require('dotenv').config();

const crypto = require('node:crypto');
const { promisify } = require('node:util');
const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();
const IVA_PORCENTAJE = 19;
const scrypt = promisify(crypto.scrypt);
const tokenSecret = process.env.AUTH_TOKEN_SECRET;

app.use(cors());
app.use(express.json({ limit: '20kb' }));

if (typeof tokenSecret !== 'string' || tokenSecret.length < 32) {
  throw new Error('Configura AUTH_TOKEN_SECRET con al menos 32 caracteres aleatorios.');
}

function crearToken(usuario) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: String(usuario.id),
      nombre: usuario.nombre,
      correo: usuario.correo,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 12,
    }),
  ).toString('base64url');
  const firma = crypto.createHmac('sha256', tokenSecret).update(payload).digest('base64url');
  return `${payload}.${firma}`;
}

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

function validarDatosRegistro(nombre, correo, contraseña) {
  return (
    typeof nombre === 'string' &&
    nombre.trim().length >= 2 &&
    nombre.trim().length <= 80 &&
    typeof correo === 'string' &&
    correo.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) &&
    typeof contraseña === 'string' &&
    contraseña.length >= 8 &&
    contraseña.length <= 128
  );
}

async function derivarPassword(contraseña, salt = crypto.randomBytes(16)) {
  const passwordHash = await scrypt(contraseña, salt, 64);
  return { passwordHash, salt };
}

function aCentavos(valor) {
  const texto = String(valor);
  const coincidencia = /^(\d+)(?:\.(\d{1,2}))?$/.exec(texto);
  if (!coincidencia) {
    throw new Error('Neon devolvió un precio con formato inválido.');
  }

  const centavos = Number(`${coincidencia[1]}${(coincidencia[2] || '').padEnd(2, '0')}`);
  if (!Number.isSafeInteger(centavos)) {
    throw new Error('El precio supera el monto permitido.');
  }
  return centavos;
}

function desdeCentavos(valor) {
  return valor / 100;
}

app.get('/', (req, res) => {
  return res.json({ servicio: 'tienda-autopartes-service', salud: '/health' });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1 FROM public.autopartes_productos LIMIT 1');
    return res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Health check de Neon fallido:', error);
    return res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});

// Registra en Neon el correo y el hash de la contraseña, nunca la contraseña original.
app.post('/api/auth/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body || {};
  if (!validarDatosRegistro(nombre, correo, contraseña)) {
    return res.status(400).json({
      error: 'Ingresa un nombre, un correo válido y una contraseña de 8 a 128 caracteres.',
    });
  }

  try {
    const correoNormalizado = correo.trim().toLowerCase();
    const { passwordHash, salt } = await derivarPassword(contraseña);
    await pool.query(
      `INSERT INTO public.autopartes_usuarios (nombre, correo, password_hash, password_salt)
       VALUES ($1, $2, $3, $4)`,
      [nombre.trim(), correoNormalizado, passwordHash, salt],
    );
    return res.status(201).json({
      message: 'Cuenta creada. Ahora inicia sesión con tu correo y contraseña.',
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }
    console.error('No se pudo registrar el usuario en Neon:', error);
    return res.status(500).json({ error: 'No se pudo crear la cuenta. Intenta nuevamente.' });
  }
});

// Inicia sesión comparando con el hash guardado durante el registro en Neon.
app.post('/api/auth/login', async (req, res) => {
  const { correo, contraseña } = req.body || {};
  if (
    typeof correo !== 'string' ||
    correo.length > 254 ||
    typeof contraseña !== 'string' ||
    contraseña.length > 128
  ) {
    return res.status(400).json({ error: 'Ingresa el correo y la contraseña.' });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nombre, correo, password_hash, password_salt
       FROM public.autopartes_usuarios
       WHERE correo = $1`,
      [correo.trim().toLowerCase()],
    );
    const usuario = resultado.rows[0];
    if (!usuario) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const { passwordHash } = await derivarPassword(contraseña, usuario.password_salt);
    const passwordValido =
      passwordHash.length === usuario.password_hash.length &&
      crypto.timingSafeEqual(passwordHash, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    return res.json({
      token: crearToken(usuario),
      usuario: {
        id: String(usuario.id),
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  } catch (error) {
    console.error('No se pudo iniciar sesión con Neon:', error);
    return res.status(500).json({ error: 'No se pudo iniciar sesión. Intenta nuevamente.' });
  }
});

// Consulta en Neon el catálogo activo de autopartes.
app.get('/api/tienda/productos', exigirSesion, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, categoria, descripcion, precio
       FROM public.autopartes_productos
       WHERE activo = TRUE
       ORDER BY categoria, nombre`,
    );
    return res.json({
      products: resultado.rows.map((producto) => ({
        ...producto,
        precio: Number(producto.precio),
      })),
    });
  } catch (error) {
    console.error('No se pudieron consultar los productos en Neon:', error);
    return res.status(500).json({ error: 'No se pudieron consultar los productos.' });
  }
});

// Calcula la factura con precios actuales de Neon y guarda sus datos en una sola transacción.
app.post('/api/tienda/checkout', exigirSesion, async (req, res) => {
  const items = req.body && req.body.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ error: 'El carrito debe tener entre 1 y 50 productos.' });
  }

  const ids = new Set();
  for (const item of items) {
    if (
      !item ||
      typeof item.id !== 'string' ||
      !/^[a-zA-Z0-9-]{1,30}$/.test(item.id) ||
      ids.has(item.id) ||
      !Number.isSafeInteger(item.cantidad) ||
      item.cantidad < 1 ||
      item.cantidad > 99
    ) {
      return res.status(400).json({ error: 'El carrito contiene productos o cantidades inválidos.' });
    }
    ids.add(item.id);
  }

  let client;
  let transaccionIniciada = false;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    transaccionIniciada = true;

    const resultado = await client.query(
      `SELECT id, nombre, precio
       FROM public.autopartes_productos
       WHERE activo = TRUE AND id = ANY($1::varchar[])
       ORDER BY id
       FOR SHARE`,
      [[...ids]],
    );
    if (resultado.rowCount !== ids.size) {
      await client.query('ROLLBACK');
      transaccionIniciada = false;
      return res.status(400).json({ error: 'Uno o más productos ya no están disponibles.' });
    }

    const productos = new Map(
      resultado.rows.map((producto) => [producto.id, producto]),
    );
    let subtotalCentavos = 0;
    const lineas = items.map((item) => {
      const producto = productos.get(item.id);
      const precioCentavos = aCentavos(producto.precio);
      const totalLineaCentavos = precioCentavos * item.cantidad;
      subtotalCentavos += totalLineaCentavos;
      return {
        id: producto.id,
        nombre: producto.nombre,
        precioCentavos,
        cantidad: item.cantidad,
        totalLineaCentavos,
      };
    });

    if (!Number.isSafeInteger(subtotalCentavos)) {
      await client.query('ROLLBACK');
      transaccionIniciada = false;
      return res.status(400).json({ error: 'El total del carrito supera el monto permitido.' });
    }

    const ivaCentavos = Math.round((subtotalCentavos * IVA_PORCENTAJE) / 100);
    const totalCentavos = subtotalCentavos + ivaCentavos;
    const numero = `FAC-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const fecha = new Date();
    const facturaResultado = await client.query(
      `INSERT INTO public.autopartes_facturas
        (numero, fecha, usuario_id, subtotal, iva, porcentaje_iva, total)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        numero,
        fecha,
        req.usuario.sub,
        desdeCentavos(subtotalCentavos),
        desdeCentavos(ivaCentavos),
        IVA_PORCENTAJE,
        desdeCentavos(totalCentavos),
      ],
    );
    const facturaId = facturaResultado.rows[0].id;

    for (const linea of lineas) {
      await client.query(
        `INSERT INTO public.autopartes_factura_items
          (factura_id, producto_id, nombre_producto, precio_unitario, cantidad, total_linea)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          facturaId,
          linea.id,
          linea.nombre,
          desdeCentavos(linea.precioCentavos),
          linea.cantidad,
          desdeCentavos(linea.totalLineaCentavos),
        ],
      );
    }

    await client.query('COMMIT');
    transaccionIniciada = false;

    return res.status(201).json({
      factura: {
        numero,
        fecha: fecha.toISOString(),
        items: lineas.map((linea) => ({
          id: linea.id,
          nombre: linea.nombre,
          precio: desdeCentavos(linea.precioCentavos),
          cantidad: linea.cantidad,
          total: desdeCentavos(linea.totalLineaCentavos),
        })),
        subtotal: desdeCentavos(subtotalCentavos),
        iva: desdeCentavos(ivaCentavos),
        porcentajeIva: IVA_PORCENTAJE,
        total: desdeCentavos(totalCentavos),
        moneda: 'COP',
      },
    });
  } catch (error) {
    if (client && transaccionIniciada) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('No se pudo revertir la factura en Neon:', rollbackError);
      }
    }
    console.error('No se pudo guardar la factura en Neon:', error);
    return res.status(500).json({ error: 'No se pudo guardar la factura en Neon.' });
  } finally {
    if (client) client.release();
  }
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' });
  }
  console.error('Error inesperado en la solicitud de la tienda:', error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

async function iniciarServidor() {
  await pool.query('SELECT id FROM public.autopartes_usuarios LIMIT 0');
  await pool.query('SELECT id FROM public.autopartes_productos LIMIT 0');
  await pool.query('SELECT id FROM public.autopartes_facturas LIMIT 0');
  await pool.query('SELECT id FROM public.autopartes_factura_items LIMIT 0');

  const port = Number(process.env.PORT) || 4004;
  const server = app.listen(port, () => {
    console.log(`Microservicio de tienda escuchando en el puerto ${port}.`);
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
  console.error('No se pudo inicializar la tienda en Neon:', error);
  await pool.end();
  process.exit(1);
});
