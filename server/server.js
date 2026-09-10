const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const { requireEnv, envOr, isVercel } = require('./env');
const { MODULES, TABLE_ROLES, BRANCH_SCOPED, ROLE_LABELS } = require('./roles');
const { computeCpm, normalizePreds } = require('./cpm');
const { buildFunctionPoints } = require('./functionPoints');
const { pedidosRouter } = require('./pedidos');
const {
  FALLBACK_SERVICIOS,
  FALLBACK_GALERIA,
  orFallback,
  withNormalizedImages,
} = require('./publicCatalog');

const app = express();
const JWT_EXPIRES = envOr('JWT_EXPIRES', '24h');

function getJwtSecret() {
  return requireEnv('JWT_SECRET');
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json());
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' },
});
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.' },
});

const MISION_TEXT = 'Ofrecer una experiencia gastronómica auténtica que rescata los sabores tradicionales ecuatorianos, brindando a nuestros clientes calidad, calidez y un ambiente acogedor en cada una de nuestras sucursales.';
const VISION_TEXT = 'Ser la cadena de cafeterías y restaurantes ecuatorianos más reconocida del país para 2030, expandiendo nuestra propuesta gastronómica con valores de identidad, sostenibilidad y excelencia en el servicio.';

function runStartupMigrations() {
  const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  return pool.query(initSQL)
    .then(async () => {
      await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_mision_vision_tipo ON mision_vision (tipo)');
      await pool.query(
        `INSERT INTO mision_vision (tipo, contenido, activo)
         SELECT $1::varchar(20), $2::text, true WHERE NOT EXISTS (SELECT 1 FROM mision_vision WHERE tipo = $1::varchar(20))`,
        ['mision', MISION_TEXT]
      );
      await pool.query(
        `INSERT INTO mision_vision (tipo, contenido, activo)
         SELECT $1::varchar(20), $2::text, true WHERE NOT EXISTS (SELECT 1 FROM mision_vision WHERE tipo = $1::varchar(20))`,
        ['vision', VISION_TEXT]
      );
      await seedProjectPlan();
    })
    .catch((err) => console.error('Error executing database migrations:', err));
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  jwt.verify(token, getJwtSecret(), (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

function authorizeAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Requiere permisos de administrador' });
  next();
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (req.user?.rol === 'admin') return next();
    if (roles.length && !roles.includes(req.user?.rol)) {
      return res.status(403).json({ error: 'No tienes acceso a este módulo' });
    }
    next();
  };
}

async function logAudit(req, accion, modulo, detalle) {
  try {
    await pool.query(
      `INSERT INTO auditoria (usuario_id, usuario_nombre, rol, accion, modulo, detalle, ruta)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.user?.id || null,
        req.user?.nombre || 'público',
        req.user?.rol || 'publico',
        accion,
        modulo,
        detalle ? String(detalle).slice(0, 500) : null,
        req.originalUrl || null,
      ]
    );
  } catch (e) {
    console.error('auditoria:', e.message);
  }
}

async function seedProjectPlan() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM proyecto_tareas');
  if (rows[0].c > 0) return;
  const plan = [
    ['Análisis de requisitos y roles', 5, [], 'Equipo', 'roles'],
    ['Diseño de base de datos y módulos', 4, [0], 'Administrador', 'roles'],
    ['Implementación del sitio público', 8, [1], 'Equipo', 'servicios'],
    ['Implementación del back-office', 8, [1], 'Administrador', 'dashboard'],
    ['Tablero BSC e indicadores', 3, [3], 'Gerencia', 'scorecard'],
    ['Pruebas e integración', 4, [2, 3, 4], 'Equipo', 'planificacion'],
    ['Despliegue y auditoría', 2, [5], 'Administrador', 'auditoria'],
  ];
  const ids = [];
  for (const [nombre, duracion, predIdx, responsable, modulo] of plan) {
    const preds = predIdx.map((i) => ids[i]);
    const inserted = await pool.query(
      `INSERT INTO proyecto_tareas (nombre, duracion_dias, predecesoras, responsable, modulo)
       VALUES ($1, $2, $3::int[], $4, $5) RETURNING id`,
      [nombre, duracion, preds, responsable, modulo]
    );
    ids.push(inserted.rows[0].id);
  }
}

const ALLOWED_COLUMNS = {
  clientes: ['nombre', 'email', 'telefono', 'direccion'],
  proveedores: ['nombre', 'contacto', 'telefono', 'email', 'direccion'],
  sucursales: ['nombre', 'direccion', 'telefono', 'capacidad_maxima', 'whatsapp', 'activo'],
  personal: ['nombre', 'cargo', 'telefono', 'email', 'salario', 'sucursal_id'],
  inventarios: ['producto', 'cantidad', 'unidad', 'stock_minimo', 'sucursal_id', 'proveedor_id'],
  categorias: ['nombre', 'descripcion', 'activo'],
  servicios: ['categoria_id', 'nombre', 'descripcion', 'precio', 'duracion', 'activo'],
  citas: ['cliente_id', 'sucursal_id', 'servicio_id', 'fecha_hora', 'estado'],
  galeria: ['titulo', 'url_imagen', 'categoria', 'orden', 'autor', 'comentario', 'calificacion'],
  socios: ['nombre', 'tipo', 'contacto', 'telefono', 'email', 'direccion'],
  comunicaciones: ['asunto', 'mensaje', 'destinatario', 'fecha_publicacion', 'activo'],
  indicadores: ['nombre', 'perspectiva', 'valor_actual', 'meta', 'estandar', 'unidad'],
  postulaciones: ['nombre', 'correo', 'telefono', 'mensaje', 'estado', 'fecha'],
  configuracion: ['clave', 'valor', 'descripcion'],
  promociones: ['titulo', 'descripcion', 'tipo', 'precio', 'fecha_inicio', 'fecha_fin', 'url_imagen', 'activo'],
  mision_vision: ['tipo', 'contenido', 'activo'],
};

function pickAllowed(tableName, body) {
  const allowed = ALLOWED_COLUMNS[tableName] || [];
  const out = {};
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
      out[key] = body[key];
    }
  }
  return out;
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

function crud(tableName, allowWrite = true, roles = TABLE_ROLES[tableName] || ['admin']) {
  const router = express.Router();
  router.use(authenticateToken);
  router.use(authorizeRoles(...roles));
  router.get('/', crudHandler(tableName, async (req, res) => {
    let sql = `SELECT * FROM ${tableName} ORDER BY id ASC`;
    const params = [];
    if (
      BRANCH_SCOPED.includes(tableName) &&
      req.user.rol !== 'admin' &&
      req.user.rol !== 'gerente' &&
      req.user.sucursal_id
    ) {
      sql = `SELECT * FROM ${tableName} WHERE sucursal_id = $1 ORDER BY id ASC`;
      params.push(req.user.sucursal_id);
    }
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  }));
  router.get('/:id', crudHandler(tableName, async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(rows[0]);
  }));
  if (allowWrite) {
    router.post('/', crudHandler(tableName, async (req, res) => {
      const data = pickAllowed(tableName, req.body);
      const keys = Object.keys(data);
      const values = Object.values(data);
      if (!keys.length) return res.status(400).json({ error: 'Cuerpo vacío o campos no permitidos' });
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const { rows } = await pool.query(query, values);
      await logAudit(req, 'crear', tableName, `id=${rows[0].id}`);
      res.status(201).json(rows[0]);
    }));
    router.patch('/:id', crudHandler(tableName, async (req, res) => {
      const data = pickAllowed(tableName, req.body);
      const keys = Object.keys(data);
      const values = Object.values(data);
      if (!keys.length) return res.status(400).json({ error: 'Cuerpo vacío o campos no permitidos' });
      const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
      const { rows } = await pool.query(query, [...values, req.params.id]);
      if (!rows.length) return res.status(404).json({ error: 'Registro no encontrado' });
      await logAudit(req, 'editar', tableName, `id=${req.params.id}`);
      res.json(rows[0]);
    }));
    router.delete('/:id', crudHandler(tableName, async (req, res) => {
      const { rowCount } = await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [req.params.id]);
      if (!rowCount) return res.status(404).json({ error: 'Registro no encontrado' });
      await logAudit(req, 'eliminar', tableName, `id=${req.params.id}`);
      res.json({ deleted: true });
    }));
  }
  return router;
}

function usuariosRouter() {
  const router = express.Router();
  router.use(authenticateToken);

  router.get('/', authorizeRoles('admin', 'gerente'), crudHandler('usuarios', async (_, res) => {
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
    await logAudit(req, 'crear', 'usuarios', `id=${rows[0].id} email=${rows[0].email}`);
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
    await logAudit(req, 'editar', 'usuarios', `id=${req.params.id}`);
    res.json(rows[0]);
  }));

  router.delete('/:id', authorizeAdmin, crudHandler('usuarios', async (req, res) => {
    if (parseInt(req.params.id, 10) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Usuario no encontrado' });
    await logAudit(req, 'eliminar', 'usuarios', `id=${req.params.id}`);
    res.json({ deleted: true });
  }));

  return router;
}

app.get('/api/health', (_, res) => res.json({ ok: true }));

app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND activo = true', [email.trim()]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, sucursal_id: user.sucursal_id },
      getJwtSecret(),
      { expiresIn: JWT_EXPIRES }
    );
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol, sucursal_id: user.sucursal_id } });
    await logAudit({ user: { id: user.id, nombre: user.nombre, rol: user.rol }, originalUrl: '/api/login' }, 'login', 'portal', user.email);
  } catch (e) {
    console.error('Error en login:', e);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/dashboard', authenticateToken, async (_, res) => {
  try {
    const tables = ['clientes', 'proveedores', 'socios', 'sucursales', 'usuarios', 'inventarios', 'comunicaciones', 'citas', 'pedidos'];
    const counts = {};
    for (const table of tables) {
      const { rows } = await pool.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
      counts[table] = rows[0].c;
    }
    const { rows: indicadores } = await pool.query('SELECT * FROM indicadores ORDER BY id ASC');
    const { rows: stock } = await pool.query(
      'SELECT COUNT(*)::int AS c FROM inventarios WHERE cantidad <= 3'
    );
    res.json({ counts, indicadores, stock_bajo: stock[0].c });
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
app.use('/api/pedidos', pedidosRouter(pool, { authenticateToken, authorizeRoles, logAudit }));
app.use('/api/galeria', crud('galeria'));
app.use('/api/socios', crud('socios'));
app.use('/api/comunicaciones', crud('comunicaciones'));
app.use('/api/indicadores', crud('indicadores'));
app.use('/api/postulaciones', crud('postulaciones'));
app.use('/api/configuracion', crud('configuracion'));
app.use('/api/promociones', crud('promociones'));
app.use('/api/mision-vision', crud('mision_vision'));

app.get('/api/modulos', authenticateToken, (req, res) => {
  const rol = req.user.rol;
  res.json({
    rol,
    rol_label: ROLE_LABELS[rol] || rol,
    visibles: MODULES.filter((m) => m.roles.includes(rol) || rol === 'admin'),
    matriz: MODULES,
    roles: ROLE_LABELS,
  });
});

app.get('/api/puntos-funcion', authenticateToken, authorizeRoles('admin', 'gerente'), (_, res) => {
  res.json(buildFunctionPoints());
});

app.get('/api/auditoria', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.email
       FROM auditoria a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       ORDER BY a.created_at DESC
       LIMIT 400`
    );
    const resumen = {};
    for (const row of rows) {
      const key = row.usuario_nombre || 'público';
      if (!resumen[key]) resumen[key] = { usuario: key, rol: row.rol, total: 0, por_accion: {} };
      resumen[key].total += 1;
      resumen[key].por_accion[row.accion] = (resumen[key].por_accion[row.accion] || 0) + 1;
    }
    res.json({ eventos: rows, resumen: Object.values(resumen) });
  } catch (e) {
    console.error('auditoria list:', e);
    res.status(500).json({ error: 'No se pudo cargar la bitácora' });
  }
});

app.get('/api/proyecto-tareas', authenticateToken, authorizeRoles('admin', 'gerente'), async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM proyecto_tareas ORDER BY id ASC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'No se pudieron cargar las tareas' });
  }
});

app.get('/api/planificacion', authenticateToken, authorizeRoles('admin', 'gerente'), async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM proyecto_tareas ORDER BY id ASC');
    res.json(computeCpm(rows));
  } catch (e) {
    res.status(500).json({ error: 'No se pudo calcular la red crítica' });
  }
});

app.post('/api/proyecto-tareas', authenticateToken, authorizeRoles('admin', 'gerente'), async (req, res) => {
  try {
    const { nombre, duracion_dias, fecha_inicio, predecesoras, responsable, modulo } = req.body || {};
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const preds = normalizePreds(predecesoras);
    const { rows } = await pool.query(
      `INSERT INTO proyecto_tareas (nombre, duracion_dias, fecha_inicio, predecesoras, responsable, modulo)
       VALUES ($1, $2, $3, $4::int[], $5, $6) RETURNING *`,
      [nombre, parseInt(duracion_dias, 10) || 1, fecha_inicio || null, preds, responsable || null, modulo || null]
    );
    await logAudit(req, 'crear', 'proyecto_tareas', `id=${rows[0].id}`);
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo crear la tarea' });
  }
});

app.patch('/api/proyecto-tareas/:id', authenticateToken, authorizeRoles('admin', 'gerente'), async (req, res) => {
  try {
    const { nombre, duracion_dias, fecha_inicio, predecesoras, responsable, modulo } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE proyecto_tareas SET
         nombre = COALESCE($1, nombre),
         duracion_dias = COALESCE($2, duracion_dias),
         fecha_inicio = COALESCE($3, fecha_inicio),
         predecesoras = COALESCE($4::int[], predecesoras),
         responsable = COALESCE($5, responsable),
         modulo = COALESCE($6, modulo)
       WHERE id = $7 RETURNING *`,
      [
        nombre || null,
        duracion_dias !== undefined ? parseInt(duracion_dias, 10) : null,
        fecha_inicio || null,
        predecesoras !== undefined ? normalizePreds(predecesoras) : null,
        responsable || null,
        modulo || null,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tarea no encontrada' });
    await logAudit(req, 'editar', 'proyecto_tareas', `id=${req.params.id}`);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo actualizar la tarea' });
  }
});

app.delete('/api/proyecto-tareas/:id', authenticateToken, authorizeRoles('admin', 'gerente'), async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM proyecto_tareas WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Tarea no encontrada' });
    await logAudit(req, 'eliminar', 'proyecto_tareas', `id=${req.params.id}`);
    res.json({ deleted: true });
  } catch (e) {
    res.status(500).json({ error: 'No se pudo eliminar la tarea' });
  }
});

app.post('/api/forgot-password', loginLimiter, async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const generic = { ok: true, message: 'Si el correo existe, se generó un enlace de recuperación.' };
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    const { rows } = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND activo = true', [email]);
    if (!rows.length) return res.json(generic);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('UPDATE password_resets SET used = true WHERE usuario_id = $1 AND used = false', [rows[0].id]);
    await pool.query(
      'INSERT INTO password_resets (usuario_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [rows[0].id, tokenHash, expiresAt]
    );
    const origin = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/admin/reset-password?token=${token}`;
    console.log('Enlace de recuperación:', resetUrl);
    return res.json({ ...generic, resetUrl });
  } catch (e) {
    console.error('Error en forgot-password:', e);
    res.status(500).json({ error: 'No se pudo procesar la solicitud' });
  }
});

app.post('/api/reset-password', loginLimiter, async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
    if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const { rows } = await pool.query(
      `SELECT * FROM password_resets
       WHERE token_hash = $1 AND used = false AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [tokenHash]
    );
    const reset = rows[0];
    if (!reset) return res.status(400).json({ error: 'El enlace no es válido o ya expiró' });
    const hash = bcrypt.hashSync(password, 10);
    await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hash, reset.usuario_id]);
    await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [reset.id]);
    res.json({ ok: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
  } catch (e) {
    console.error('Error en reset-password:', e);
    res.status(500).json({ error: 'No se pudo actualizar la contraseña' });
  }
});

app.post('/api/public/citas', publicWriteLimiter, async (req, res) => {
  try {
    const { nombre, email, telefono, fecha_hora } = req.body || {};
    if (!nombre || !email || !fecha_hora) {
      return res.status(400).json({ error: 'Nombre, email y fecha son requeridos' });
    }
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return res.status(400).json({ error: 'Email no válido' });
    }
    const when = new Date(fecha_hora);
    if (Number.isNaN(when.getTime())) return res.status(400).json({ error: 'Fecha inválida' });

    let clienteId;
    const existing = await pool.query('SELECT id FROM clientes WHERE LOWER(email) = $1 LIMIT 1', [emailNorm]);
    if (existing.rows.length) {
      clienteId = existing.rows[0].id;
      await pool.query(
        'UPDATE clientes SET nombre = $1, telefono = COALESCE($2, telefono) WHERE id = $3',
        [String(nombre).trim(), telefono || null, clienteId]
      );
    } else {
      const created = await pool.query(
        'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING id',
        [String(nombre).trim(), emailNorm, telefono || null]
      );
      clienteId = created.rows[0].id;
    }
    const { rows } = await pool.query(
      `INSERT INTO citas (cliente_id, sucursal_id, servicio_id, fecha_hora, estado)
       VALUES ($1, NULL, NULL, $2, 'pendiente') RETURNING *`,
      [clienteId, when]
    );
    await logAudit(
      { user: { id: null, nombre: String(nombre).trim(), rol: 'publico' }, originalUrl: '/api/public/citas' },
      'crear',
      'citas',
      `reserva pública ${emailNorm}`
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Error al reservar cita:', e);
    res.status(500).json({ error: 'No se pudo registrar la reserva' });
  }
});

app.post('/api/postular', publicWriteLimiter, async (req, res) => {
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
  try {
    const { rows } = await pool.query(`
      SELECT s.*, c.nombre AS categoria_nombre
      FROM servicios s
      LEFT JOIN categorias c ON s.categoria_id = c.id
      WHERE s.activo = true
      ORDER BY c.nombre, s.nombre
    `);
    res.json(orFallback(rows, FALLBACK_SERVICIOS));
  } catch (e) {
    console.error('Error al cargar servicios públicos:', e);
    res.json(FALLBACK_SERVICIOS);
  }
});

app.get('/api/public/sucursales', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM sucursales WHERE activo = true ORDER BY nombre');
    res.json(rows);
  } catch (e) {
    console.error('Error al cargar sucursales públicas:', e);
    res.json([]);
  }
});

app.get('/api/public/galeria', async (_, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM galeria ORDER BY orden ASC, id ASC');
    res.json(withNormalizedImages(orFallback(rows, FALLBACK_GALERIA)));
  } catch (e) {
    console.error('Error al cargar galería pública:', e);
    res.json(withNormalizedImages(FALLBACK_GALERIA));
  }
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

if (!isVercel) {
  const buildDir = path.join(__dirname, '../build');
  const buildIndex = path.join(buildDir, 'index.html');
  if (fs.existsSync(buildIndex)) {
    app.use(express.static(buildDir));
    app.use((req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Ruta no encontrada' });
      res.sendFile(buildIndex);
    });
  } else {
    app.use((req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Ruta no encontrada' });
      res.status(404).json({ error: 'Frontend no compilado. Usa npm start en el puerto 3000.' });
    });
  }
}

let migrationPromise;

function ensureMigrated() {
  if (!migrationPromise) {
    migrationPromise = Promise.resolve()
      .then(() => runStartupMigrations())
      .catch((err) => console.error('Error executing database migrations:', err));
  }
  return migrationPromise;
}

app.ensureMigrated = ensureMigrated;
module.exports = app;

if (require.main === module) {
  const port = envOr('API_PORT', envOr('PORT', '3001'));
  ensureMigrated().finally(() => {
    app.listen(port, () => {
      console.log(`API corriendo en http://localhost:${port}`);
    });
  });
}
