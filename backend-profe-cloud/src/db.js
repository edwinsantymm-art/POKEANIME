const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta configurar la variable DATABASE_URL.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (error) => {
  console.error('Error inesperado en una conexión inactiva de PostgreSQL:', error);
});

module.exports = pool;