/**
 * Elimina datos de negocio de la base. Conserva solo usuarios admin y recepcionista.
 * Uso: npm run db:clear
 */
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const { ensureCoreUsers } = require('./seedCoreUsers');
const { requireEnv } = require('./env');

async function clearBusinessData() {
  const client = await pool.connect();
  try {
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    await client.query(initSQL);

    const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
    const recepEmail = requireEnv('SEED_RECEPCIONISTA_EMAIL');

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
    await client.query('DELETE FROM usuarios WHERE email NOT IN ($1, $2)', [adminEmail, recepEmail]);
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
