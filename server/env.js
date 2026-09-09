const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const isVercel = Boolean(process.env.VERCEL);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copia .env.example a .env o configúrala en Vercel.`);
  }
  return value;
}

function envOr(name, fallback) {
  const value = process.env[name];
  return value == null || value === '' ? fallback : value;
}

module.exports = { requireEnv, envOr, isVercel };
