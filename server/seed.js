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
    await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_mision_vision_tipo ON mision_vision (tipo)');
    await client.query(
      `INSERT INTO mision_vision (tipo, contenido, activo)
       SELECT $1::varchar(20), $2::text, true WHERE NOT EXISTS (SELECT 1 FROM mision_vision WHERE tipo = $1::varchar(20))`,
      ['mision', 'Ofrecer una experiencia gastronómica auténtica que rescata los sabores tradicionales ecuatorianos, brindando a nuestros clientes calidad, calidez y un ambiente acogedor en cada una de nuestras sucursales.']
    );
    await client.query(
      `INSERT INTO mision_vision (tipo, contenido, activo)
       SELECT $1::varchar(20), $2::text, true WHERE NOT EXISTS (SELECT 1 FROM mision_vision WHERE tipo = $1::varchar(20))`,
      ['vision', 'Ser la cadena de cafeterías y restaurantes ecuatorianos más reconocida del país para 2030, expandiendo nuestra propuesta gastronómica con valores de identidad, sostenibilidad y excelencia en el servicio.']
    );
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
