const { Pool } = require('pg');
const { requireEnv, isVercel } = require('./env');

function sslConfig() {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DATABASE_URL || process.env.DB_SSL === 'true' || isVercel) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function createPool() {
  const ssl = sslConfig();
  const max = isVercel ? 1 : 20;

  if (process.env.DATABASE_URL) {
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl,
      max,
      idleTimeoutMillis: isVercel ? 10000 : 30000,
      connectionTimeoutMillis: 8000,
    });
  }

  return new Pool({
    host: requireEnv('DB_HOST'),
    port: parseInt(requireEnv('DB_PORT'), 10),
    database: requireEnv('DB_NAME'),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    ssl,
    max,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

const pool = createPool();

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;
