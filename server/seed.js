const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'huarmy_db',
  user: process.env.DB_USER || 'huarmy_user',
  password: process.env.DB_PASSWORD || 'HuarmyPassword2026',
});

async function ensureCoreUsers(client) {
  const adminHash = bcrypt.hashSync('admin123', 10);
  const recepHash = bcrypt.hashSync('recepcionista123', 10);
  await client.query(
    `INSERT INTO usuarios (nombre, email, password, rol, sucursal_id, activo) VALUES
      ('Administrador', 'admin@huarmycoffee.com', $1, 'admin', NULL, true),
      ('Recepcionista', 'recepcionista@huarmycoffee.com', $2, 'recepcionista', NULL, true)
    ON CONFLICT (email) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      password = EXCLUDED.password,
      rol = EXCLUDED.rol,
      sucursal_id = EXCLUDED.sucursal_id,
      activo = EXCLUDED.activo`,
    [adminHash, recepHash]
  );
  console.log('Usuarios core (admin + recepcionista) verificados.');
}

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
