function pedidosRouter(pool, { authenticateToken, authorizeRoles, logAudit }) {
  const express = require('express');
  const router = express.Router();
  const ROLES = ['admin', 'gerente', 'recepcionista', 'cajero'];

  router.use(authenticateToken);
  router.use(authorizeRoles(...ROLES));

  function scoped(req) {
    return req.user.rol !== 'admin' && req.user.rol !== 'gerente' && req.user.sucursal_id;
  }

  async function attachItems(pedidos) {
    if (!pedidos.length) return [];
    const ids = pedidos.map((p) => p.id);
    const { rows } = await pool.query(
      'SELECT * FROM pedido_detalles WHERE pedido_id = ANY($1::int[]) ORDER BY id ASC',
      [ids]
    );
    const byPedido = {};
    for (const row of rows) {
      if (!byPedido[row.pedido_id]) byPedido[row.pedido_id] = [];
      byPedido[row.pedido_id].push({
        ...row,
        cantidad: Number(row.cantidad),
        precio_unitario: Number(row.precio),
        precio: Number(row.precio),
        subtotal: Number(row.subtotal),
      });
    }
    return pedidos.map((p) => ({
      ...p,
      total: Number(p.total),
      items: byPedido[p.id] || [],
    }));
  }

  async function loadPedido(id, req) {
    const params = [id];
    let sql = `SELECT p.*, c.nombre AS cliente_registro, s.nombre AS sucursal_nombre
               FROM pedidos p
               LEFT JOIN clientes c ON c.id = p.cliente_id
               LEFT JOIN sucursales s ON s.id = p.sucursal_id
               WHERE p.id = $1`;
    if (scoped(req)) {
      sql += ' AND (p.sucursal_id = $2 OR p.sucursal_id IS NULL)';
      params.push(req.user.sucursal_id);
    }
    const { rows } = await pool.query(sql, params);
    if (!rows.length) return null;
    const [withItems] = await attachItems(rows);
    return withItems;
  }

  router.get('/catalogo', async (req, res) => {
    try {
      const sucParams = [];
      let sucSql = 'SELECT id, nombre FROM sucursales WHERE activo = true ORDER BY nombre';
      if (scoped(req)) {
        sucSql = 'SELECT id, nombre FROM sucursales WHERE activo = true AND id = $1 ORDER BY nombre';
        sucParams.push(req.user.sucursal_id);
      }
      const [servicios, sucursales, clientes] = await Promise.all([
        pool.query(
          `SELECT s.id, s.nombre, s.precio, s.descripcion, c.nombre AS categoria_nombre
           FROM servicios s
           LEFT JOIN categorias c ON c.id = s.categoria_id
           WHERE s.activo = true
           ORDER BY c.nombre NULLS LAST, s.nombre`
        ),
        pool.query(sucSql, sucParams),
        pool.query('SELECT id, nombre, telefono FROM clientes ORDER BY nombre'),
      ]);
      res.json({
        servicios: servicios.rows.map((s) => ({ ...s, precio: Number(s.precio) })),
        sucursales: sucursales.rows,
        clientes: clientes.rows,
      });
    } catch (e) {
      console.error('pedidos catalogo:', e.message);
      res.status(500).json({ error: 'No se pudo cargar el catálogo de caja' });
    }
  });

  router.get('/', async (req, res) => {
    try {
      const params = [];
      let sql = `SELECT p.*, c.nombre AS cliente_registro, s.nombre AS sucursal_nombre
                 FROM pedidos p
                 LEFT JOIN clientes c ON c.id = p.cliente_id
                 LEFT JOIN sucursales s ON s.id = p.sucursal_id`;
      if (scoped(req)) {
        sql += ' WHERE (p.sucursal_id = $1 OR p.sucursal_id IS NULL)';
        params.push(req.user.sucursal_id);
      }
      sql += ' ORDER BY p.id DESC';
      const { rows } = await pool.query(sql, params);
      res.json(await attachItems(rows));
    } catch (e) {
      console.error('pedidos list:', e.message);
      res.status(500).json({ error: 'No se pudieron cargar los pedidos' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      if (!/^\d+$/.test(String(req.params.id))) return res.status(404).json({ error: 'Pedido no encontrado' });
      const pedido = await loadPedido(req.params.id, req);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      res.json(pedido);
    } catch (e) {
      console.error('pedidos get:', e.message);
      res.status(500).json({ error: 'No se pudo cargar el pedido' });
    }
  });

  router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
      const body = req.body || {};
      const itemsIn = Array.isArray(body.items) ? body.items : [];
      if (!itemsIn.length) return res.status(400).json({ error: 'Agrega al menos un producto' });

      let sucursalId = body.sucursal_id ? parseInt(body.sucursal_id, 10) : null;
      if (scoped(req)) sucursalId = req.user.sucursal_id || sucursalId;

      const tipo = ['mostrador', 'para_llevar', 'catering'].includes(body.tipo) ? body.tipo : 'mostrador';
      const clienteId = body.cliente_id ? parseInt(body.cliente_id, 10) : null;
      let clienteNombre = String(body.cliente_nombre || '').trim() || 'Cliente de paso';
      if (clienteId) {
        const { rows: cli } = await client.query('SELECT nombre FROM clientes WHERE id = $1', [clienteId]);
        if (cli[0]) clienteNombre = cli[0].nombre;
      }

      await client.query('BEGIN');
      const lines = [];
      let total = 0;
      for (const raw of itemsIn) {
        const servicioId = parseInt(raw.servicio_id, 10);
        const cantidad = parseInt(raw.cantidad, 10);
        if (!servicioId || !Number.isFinite(cantidad) || cantidad < 1) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Cantidad o producto inválido' });
        }
        const { rows: servRows } = await client.query(
          'SELECT id, nombre, precio FROM servicios WHERE id = $1 AND activo = true',
          [servicioId]
        );
        if (!servRows.length) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Un producto del pedido no está disponible' });
        }
        const serv = servRows[0];
        const precio = Number(serv.precio);
        const lineSub = Math.round(precio * cantidad * 100) / 100;
        total += lineSub;
        lines.push({ servicio_id: serv.id, nombre: serv.nombre, cantidad, precio, subtotal: lineSub });
      }
      total = Math.round(total * 100) / 100;

      const inserted = await client.query(
        `INSERT INTO pedidos (cliente_nombre, cliente_id, sucursal_id, usuario_id, tipo, estado, total, notas)
         VALUES ($1, $2, $3, $4, $5, 'abierto', $6, $7) RETURNING *`,
        [clienteNombre, clienteId || null, sucursalId, req.user.id, tipo, total, body.notas || null]
      );
      const pedido = inserted.rows[0];
      for (const line of lines) {
        await client.query(
          `INSERT INTO pedido_detalles (pedido_id, servicio_id, nombre, precio, cantidad, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [pedido.id, line.servicio_id, line.nombre, line.precio, line.cantidad, line.subtotal]
        );
      }
      await client.query('COMMIT');
      await logAudit(req, 'crear', 'pedidos', `id=${pedido.id} total=${total}`);
      res.status(201).json(await loadPedido(pedido.id, req));
    } catch (e) {
      try { await client.query('ROLLBACK'); } catch (_) { /* ignore */ }
      console.error('pedidos create:', e.message);
      res.status(500).json({ error: 'No se pudo registrar el pedido' });
    } finally {
      client.release();
    }
  });

  router.post('/:id/cobrar', async (req, res) => {
    try {
      const metodo = String(req.body?.metodo_pago || '').trim();
      if (!['efectivo', 'tarjeta', 'transferencia'].includes(metodo)) {
        return res.status(400).json({ error: 'Método de pago inválido' });
      }
      const pedido = await loadPedido(req.params.id, req);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (pedido.estado !== 'abierto' && pedido.estado !== 'pendiente') {
        return res.status(400).json({ error: 'Solo se cobran pedidos abiertos' });
      }

      await pool.query(
        `UPDATE pedidos SET estado = 'completado', metodo_pago = $1, cobrado_at = NOW() WHERE id = $2`,
        [metodo, pedido.id]
      );
      await logAudit(req, 'editar', 'pedidos', `cobrar id=${pedido.id} ${metodo}`);
      res.json(await loadPedido(pedido.id, req));
    } catch (e) {
      console.error('pedidos cobrar:', e.message);
      res.status(500).json({ error: 'No se pudo registrar el cobro' });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const pedido = await loadPedido(req.params.id, req);
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
      if (req.body?.estado === 'cancelado') {
        if (pedido.estado !== 'abierto' && pedido.estado !== 'pendiente') {
          return res.status(400).json({ error: 'Solo se cancelan pedidos abiertos' });
        }
        await pool.query(`UPDATE pedidos SET estado = 'cancelado' WHERE id = $1`, [pedido.id]);
        await logAudit(req, 'editar', 'pedidos', `cancelar id=${pedido.id}`);
        return res.json(await loadPedido(pedido.id, req));
      }
      res.status(400).json({ error: 'Cambio no permitido' });
    } catch (e) {
      console.error('pedidos patch:', e.message);
      res.status(500).json({ error: 'No se pudo actualizar el pedido' });
    }
  });

  return router;
}

module.exports = { pedidosRouter };
