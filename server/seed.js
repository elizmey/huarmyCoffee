const fs = require('fs');
const path = require('path');
const pool = require('./db');
const { ensureCoreUsers } = require('./seedCoreUsers');

async function runSeed() {
  const client = await pool.connect();
  try {
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSQL);
    await ensureCoreUsers(client);
    console.log('Esquema listo. Sin datos de demostración: usa el admin para cargar información real.');
  } catch (err) {
    console.error('Error ejecutando seed:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
