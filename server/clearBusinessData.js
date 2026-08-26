/**
 * Elimina datos de negocio de la base. Conserva solo usuarios admin y recepcionista.
 * Uso: npm run db:clear
 */
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
}

async function clearBusinessData() {
  const client = await pool.connect();
  try {
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSQL);

    await client.query('BEGIN');
    await client.query('DELETE FROM citas');
    await client.query('DELETE FROM inventarios');
    await client.query('DELETE FROM servicios');
    await client.query('DELETE FROM categorias');
    await client.query('DELETE FROM postulaciones');
    await client.query('DELETE FROM galeria');
    await client.query('DELETE FROM comunicaciones');
    await client.query('DELETE FROM indicadores');
    await client.query('DELETE FROM promociones');
    await client.query('DELETE FROM personal');
    await client.query('DELETE FROM clientes');
    await client.query('DELETE FROM proveedores');
    await client.query('DELETE FROM socios');
    await client.query('DELETE FROM configuracion');
    await client.query('UPDATE usuarios SET sucursal_id = NULL');
    await client.query('DELETE FROM sucursales');
    await client.query(
      `DELETE FROM usuarios WHERE email NOT IN ('admin@huarmycoffee.com', 'recepcionista@huarmycoffee.com')`
    );
    await client.query('COMMIT');

    await ensureCoreUsers(client);
    console.log('Datos de demostración eliminados. Solo quedan admin y recepcionista.');
    console.log('Registra clientes, menú, galería, etc. desde el panel admin.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al limpiar datos:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

clearBusinessData();
