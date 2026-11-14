require('dotenv').config();

const crypto = require('node:crypto');
const { promisify } = require('node:util');
const pool = require('../src/db');

const scrypt = promisify(crypto.scrypt);

function mostrarUso() {
  console.error(
    [
      'Uso: node scripts/crear-admin.js <correo> <contraseña> [nombre]',
      'También puedes usar las variables ADMIN_CORREO, ADMIN_PASSWORD y ADMIN_NOMBRE.',
      'Ejemplo: node scripts/crear-admin.js admin@gameshop.local Admin12345 "Administrador"',
    ].join('\n'),
  );
}

async function crearAdministrador(correo, contrasena, nombre) {
  if (typeof correo !== 'string' || correo.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error('Indica un correo válido para el administrador.');
  }
  if (typeof contrasena !== 'string' || contrasena.length < 8 || contrasena.length > 128) {
    throw new Error('La contraseña debe tener entre 8 y 128 caracteres.');
  }
  if (typeof nombre !== 'string' || nombre.length < 2 || nombre.length > 80) {
    throw new Error('El nombre debe tener entre 2 y 80 caracteres.');
  }

  const salt = crypto.randomBytes(16);
  const passwordHash = await scrypt(contrasena, salt, 64);

  const resultado = await pool.query(
    `INSERT INTO public.autopartes_usuarios
      (nombre, correo, password_hash, password_salt, rol)
     VALUES ($1, $2, $3, $4, 'administrador')
     ON CONFLICT (correo) DO UPDATE
       SET nombre = EXCLUDED.nombre,
           password_hash = EXCLUDED.password_hash,
           password_salt = EXCLUDED.password_salt,
           rol = 'administrador'
     RETURNING id, nombre, correo, rol`,
    [nombre, correo, passwordHash, salt],
  );

  const administrador = resultado.rows[0];
  console.log('Administrador listo:');
  console.log(`  id: ${administrador.id}`);
  console.log(`  nombre: ${administrador.nombre}`);
  console.log(`  correo: ${administrador.correo}`);
  console.log(`  rol: ${administrador.rol}`);
}

async function main() {
  const [correoArg, contrasenaArg, nombreArg] = process.argv.slice(2);
  const correo = (correoArg || process.env.ADMIN_CORREO || '').trim().toLowerCase();
  const contrasena = contrasenaArg || process.env.ADMIN_PASSWORD || '';
  const nombre = (nombreArg || process.env.ADMIN_NOMBRE || 'Administrador').trim();

  if (!correo || !contrasena) {
    mostrarUso();
    process.exitCode = 1;
    return;
  }

  await crearAdministrador(correo, contrasena, nombre);
}

main()
  .catch((error) => {
    if (error && error.code === '42703') {
      console.error(
        'Falta aplicar la migración de roles. Ejecuta primero sql/migrations/20261114_add_user_roles.sql.',
      );
    } else {
      console.error('No se pudo crear el administrador:', error.message);
    }
    process.exitCode = 1;
  })
  .finally(() => pool.end());
