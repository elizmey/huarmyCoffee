const bcrypt = require('bcryptjs');
const { requireEnv } = require('./env');

async function ensureCoreUsers(client) {
  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD');
  const recepEmail = requireEnv('SEED_RECEPCIONISTA_EMAIL');
  const recepPassword = requireEnv('SEED_RECEPCIONISTA_PASSWORD');

  const adminHash = bcrypt.hashSync(adminPassword, 10);
  const recepHash = bcrypt.hashSync(recepPassword, 10);

  await client.query(
    `INSERT INTO usuarios (nombre, email, password, rol, sucursal_id, activo) VALUES
      ('Administrador', $1, $2, 'admin', NULL, true),
      ('Recepcionista', $3, $4, 'recepcionista', NULL, true)
    ON CONFLICT (email) DO UPDATE SET
      nombre = EXCLUDED.nombre,
      password = EXCLUDED.password,
      rol = EXCLUDED.rol,
      sucursal_id = EXCLUDED.sucursal_id,
      activo = EXCLUDED.activo`,
    [adminEmail, adminHash, recepEmail, recepHash]
  );
  console.log('Usuarios core (admin + recepcionista) verificados.');
}

module.exports = { ensureCoreUsers };
