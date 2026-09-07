const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Copia .env.example a .env y complétala.`);
  }
  return value;
}

module.exports = { requireEnv };
