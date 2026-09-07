const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const { requireEnv } = require('./env');

const app = express();
const PORT = requireEnv('API_PORT');
const JWT_SECRET = requireEnv('JWT_SECRET');
const JWT_EXPIRES = requireEnv('JWT_EXPIRES');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
pool.query(initSQL).catch(err => console.error('Error executing database migrations:', err));

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Requiere permisos de administrador' });
  next();
}

function crudHandler(tableName, fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      console.error(`${tableName}:`, e.message || e);
      if (!res.headersSent) res.status(500).json({ error: 'Error en la operación' });
    }
  };
}

// Whitelist de columnas reales por tabla (ver server/init.sql). Nunca interpolar
// nombres de columna provenientes del body sin filtrarlos por esta lista: son
// concatenados directamente en el SQL y un body arbitrario permitiría inyección SQL.
const TABLE_COLUMNS = {
  sucursales: ['nombre', 'direccion', 'telefono', 'capacidad_maxima', 'whatsapp', 'activo'],
  clientes: ['nombre', 'email', 'telefono', 'direccion', 'created_at'],
  proveedores: ['nombre', 'contacto', 'telefono', 'email', 'direccion', 'created_at'],
  personal: ['nombre', 'cargo', 'telefono', 'email', 'salario', 'sucursal_id'],
  categorias: ['nombre', 'descripcion', 'activo', 'created_at', 'updated_at'],
  servicios: ['categoria_id', 'nombre', 'descripcion', 'precio', 'duracion', 'activo', 'created_at'],
  inventarios: ['producto', 'cantidad', 'unidad', 'stock_minimo', 'sucursal_id', 'proveedor_id'],
  citas: ['cliente_id', 'sucursal_id', 'servicio_id', 'fecha_hora', 'estado', 'created_at'],
  galeria: ['titulo', 'url_imagen', 'categoria', 'orden', 'autor', 'comentario', 'calificacion', 'created_at'],
  socios: ['nombre', 'tipo', 'contacto', 'telefono', 'email', 'direccion', 'created_at'],
  comunicaciones: ['asunto', 'mensaje', 'destinatario', 'fecha_publicacion', 'activo', 'created_at'],
  indicadores: ['nombre', 'perspectiva', 'valor_actual', 'meta', 'unidad', 'created_at'],
  postulaciones: ['nombre', 'correo', 'telefono', 'mensaje', 'estado', 'fecha', 'created_at'],
  configuracion: ['clave', 'valor', 'descripcion', 'created_at', 'updated_at'],
  promociones: ['titulo', 'descripcion', 'tipo', 'precio', 'fecha_inicio', 'fecha_fin', 'url_imagen', 'activo', 'created_at'],
};

function allowedKeys(tableName, body) {
  const allowed = TABLE_COLUMNS[tableName] || [];
  return Object.keys(body).filter((k) => allowed.includes(k));
}

function crud(tableName, allowWrite = true) {
  const router = express.Router();
  router.use(authenticateToken);
  router.get('/', crudHandler(tableName, async (_, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
    res.json(rows);
  }));
  router.get('/:id', crudHandler(tableName, async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(rows[0]);
  }));
  if (allowWrite) {
    router.post('/', crudHandler(tableName, async (req, res) => {
      const keys = allowedKeys(tableName, req.body);
      if (!keys.length) return res.status(400).json({ error: 'Cuerpo vacío o sin columnas válidas' });
      const values = keys.map((k) => req.body[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const { rows } = await pool.query(query, values);
      res.status(201).json(rows[0]);
    }));
    router.patch('/:id', crudHandler(tableName, async (req, res) => {
      const keys = allowedKeys(tableName, req.body);
      if (!keys.length) return res.status(400).json({ error: 'Cuerpo vacío o sin columnas válidas' });
      const values = keys.map((k) => req.body[k]);
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
      const { rows } = await pool.query(query, [...values, req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json(rows[0]);
    }));
    router.delete('/:id', crudHandler(tableName, async (req, res) => {
      const { rowCount } = await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json({ deleted: true });
    }));
  }
  return router;
}

function usuariosRouter() {
  const router = express.Router();
  router.use(authenticateToken);

  router.get('/', crudHandler('usuarios', async (_, res) => {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, sucursal_id, activo, created_at FROM usuarios ORDER BY id ASC'
    );
    res.json(rows);
  }));

  router.post('/', authorizeAdmin, crudHandler('usuarios', async (req, res) => {
    const { nombre, email, password, rol, sucursal_id, activo } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña requeridos' });
    if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    const hash = bcrypt.hashSync(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol, sucursal_id, activo)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nombre, email, rol, sucursal_id, activo, created_at`,
      [nombre, email.trim(), hash, rol || 'cajero', sucursal_id || null, activo !== false]
    );
    res.status(201).json(rows[0]);
  }));

  router.patch('/:id', authorizeAdmin, crudHandler('usuarios', async (req, res) => {
    const { nombre, email, password, rol, sucursal_id, activo } = req.body;
    const updates = {};
    if (nombre !== undefined) updates.nombre = nombre;
    if (email !== undefined) updates.email = email;
    if (rol !== undefined) updates.rol = rol;
    if (sucursal_id !== undefined) updates.sucursal_id = sucursal_id;
    if (activo !== undefined) updates.activo = activo;
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      updates.password = bcrypt.hashSync(password, 10);
    }
    const keys = Object.keys(updates);
    if (!keys.length) return res.status(400).json({ error: 'Sin cambios' });
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE usuarios SET ${setClause} WHERE id = $${keys.length + 1}
       RETURNING id, nombre, email, rol, sucursal_id, activo, created_at`,
      [...Object.values(updates), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  }));

  router.delete('/:id', authorizeAdmin, crudHandler('usuarios', async (req, res) => {
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ deleted: true });
  }));

  return router;
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email.trim()]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, sucursal_id: user.sucursal_id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, sucursal_id: user.sucursal_id } });
  } catch (e) {
    console.error('Error en login:', e);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/dashboard', authenticateToken, async (_, res) => {
  try {
    const { rows: countRows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM clientes) AS clientes,
        (SELECT COUNT(*)::int FROM proveedores) AS proveedores,
        (SELECT COUNT(*)::int FROM socios) AS socios,
        (SELECT COUNT(*)::int FROM sucursales) AS sucursales,
        (SELECT COUNT(*)::int FROM personal) AS personal,
        (SELECT COUNT(*)::int FROM inventarios) AS inventarios,
        (SELECT COUNT(*)::int FROM comunicaciones) AS comunicaciones
    `);
    const { rows: indicadores } = await pool.query('SELECT * FROM indicadores ORDER BY id ASC');
    res.json({ counts: countRows[0], indicadores });
  } catch (e) {
    console.error('Error en dashboard:', e);
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
});

app.use('/api/usuarios', usuariosRouter());
app.use('/api/clientes', crud('clientes'));
app.use('/api/proveedores', crud('proveedores'));
app.use('/api/sucursales', crud('sucursales'));
app.use('/api/personal', crud('personal'));
app.use('/api/inventarios', crud('inventarios'));
app.use('/api/categorias', crud('categorias'));
app.use('/api/servicios', crud('servicios'));
app.use('/api/citas', crud('citas'));
app.use('/api/galeria', crud('galeria'));
app.use('/api/socios', crud('socios'));
app.use('/api/comunicaciones', crud('comunicaciones'));
app.use('/api/indicadores', crud('indicadores'));
app.use('/api/postulaciones', crud('postulaciones'));
app.use('/api/configuracion', crud('configuracion'));
app.use('/api/promociones', crud('promociones'));

app.post('/api/postular', async (req, res) => {
  const { nombre, correo, telefono, mensaje } = req.body;
  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: 'Nombre, correo y mensaje son requeridos' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO postulaciones (nombre, correo, telefono, mensaje) VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, correo, telefono || null, mensaje]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Error al guardar postulación:', e);
    res.status(500).json({ error: 'Error al guardar la postulación' });
  }
});

app.get('/api/public/promociones', async (_, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM promociones WHERE activo = true ORDER BY fecha_inicio DESC NULLS LAST, id ASC'
    );
    res.json(rows);
  } catch (e) {
    console.error('Error al cargar promociones públicas:', e);
    res.json([]);
  }
});

app.get('/api/public/servicios', async (_, res) => {
  const { rows } = await pool.query(`
    SELECT s.*, c.nombre AS categoria_nombre
    FROM servicios s
    LEFT JOIN categorias c ON s.categoria_id = c.id
    WHERE s.activo = true
    ORDER BY c.nombre, s.nombre
  `);
  res.json(rows);
});

app.get('/api/public/sucursales', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM sucursales WHERE activo = true ORDER BY nombre');
  res.json(rows);
});

app.get('/api/public/galeria', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM galeria ORDER BY orden ASC, id ASC');
  res.json(rows);
});

app.get('/api/public/configuracion', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT clave, valor, descripcion FROM configuracion');
    res.json(rows);
  } catch (e) {
    console.error('Error al cargar configuración pública:', e);
    res.json([]);
  }
});

app.get('/api/public/mision', async (_, res) => {
  try {
    const { rows } = await pool.query(`SELECT contenido FROM mision_vision WHERE tipo = 'mision' AND activo = true ORDER BY id LIMIT 1`);
    res.json(rows[0] || { contenido: '' });
  } catch (e) {
    console.error('Error al cargar misión:', e);
    res.status(500).json({ error: 'Error al cargar la misión' });
  }
});

app.get('/api/public/vision', async (_, res) => {
  try {
    const { rows } = await pool.query(`SELECT contenido FROM mision_vision WHERE tipo = 'vision' AND activo = true ORDER BY id LIMIT 1`);
    res.json(rows[0] || { contenido: '' });
  } catch (e) {
    console.error('Error al cargar visión:', e);
    res.status(500).json({ error: 'Error al cargar la visión' });
  }
});

app.use(express.static(path.join(__dirname, '../build')));
app.use((req, res) => {
  if (!req.path.startsWith('/api')) res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
