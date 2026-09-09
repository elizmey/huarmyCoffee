import React, { useEffect, useMemo, useState } from 'react';
import { Plus, ShoppingBag, X, Banknote } from 'lucide-react';
import { adminFetch } from '../api/adminApi';

type Servicio = {
  id: number;
  nombre: string;
  precio: number;
  categoria_nombre?: string;
};

type Cliente = { id: number; nombre: string; telefono?: string };
type Sucursal = { id: number; nombre: string };

type Linea = {
  servicio_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

type PedidoItem = Linea & { subtotal: number };

type Pedido = {
  id: number;
  cliente_id: number | null;
  cliente_nombre?: string;
  cliente_registro?: string;
  sucursal_id: number;
  sucursal_nombre?: string;
  tipo: string;
  estado: string;
  metodo_pago?: string | null;
  total: number;
  notas?: string | null;
  created_at: string;
  cobrado_at?: string | null;
  items: PedidoItem[];
};

const emptyForm = { cliente_id: '', sucursal_id: '', tipo: 'mostrador', notas: '' };

const tipoLabel: Record<string, string> = {
  mostrador: 'Mostrador',
  para_llevar: 'Para llevar',
  catering: 'Catering',
};

const Pedidos = () => {
  const session = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrder, setShowOrder] = useState(false);
  const [cobrar, setCobrar] = useState<Pedido | null>(null);
  const [metodo, setMetodo] = useState('efectivo');
  const [form, setForm] = useState(emptyForm);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [saving, setSaving] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [lista, catalogo] = await Promise.all([
        adminFetch<Pedido[]>('/pedidos'),
        adminFetch<{ servicios: Servicio[]; sucursales: Sucursal[]; clientes: Cliente[] }>('/pedidos/catalogo'),
      ]);
      setPedidos(Array.isArray(lista) ? lista : []);
      setServicios(catalogo.servicios || []);
      setSucursales(catalogo.sucursales || []);
      setClientes(catalogo.clientes || []);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cartTotal = useMemo(
    () => lineas.reduce((sum, l) => sum + l.precio_unitario * l.cantidad, 0),
    [lineas]
  );

  const productosPorCategoria = useMemo(() => {
    const groups: { categoria: string; items: Servicio[] }[] = [];
    const index: Record<string, number> = {};
    for (const s of servicios) {
      const categoria = (s.categoria_nombre || '').trim() || 'Sin categoría';
      if (index[categoria] === undefined) {
        index[categoria] = groups.length;
        groups.push({ categoria, items: [] });
      }
      groups[index[categoria]].items.push(s);
    }
    return groups;
  }, [servicios]);

  const productosVisibles = productosPorCategoria.find((g) => g.categoria === categoriaActiva)?.items
    || productosPorCategoria[0]?.items
    || [];

  const abiertos = pedidos.filter((p) => p.estado === 'abierto' || p.estado === 'pendiente');
  const cobradosHoy = pedidos.filter((p) => {
    if (p.estado !== 'completado' && p.estado !== 'cobrado') return false;
    const when = p.cobrado_at || p.created_at;
    return new Date(when).toDateString() === new Date().toDateString();
  });
  const totalHoy = cobradosHoy.reduce((s, p) => s + Number(p.total), 0);

  const openCreate = () => {
    setForm({
      ...emptyForm,
      sucursal_id: session.sucursal_id ? String(session.sucursal_id) : (sucursales[0]?.id ? String(sucursales[0].id) : ''),
    });
    setLineas([]);
    setCategoriaActiva(productosPorCategoria[0]?.categoria || '');
    setShowOrder(true);
  };

  const addProducto = (s: Servicio) => {
    setLineas((prev) => {
      const found = prev.find((l) => l.servicio_id === s.id);
      if (found) {
        return prev.map((l) => (l.servicio_id === s.id ? { ...l, cantidad: l.cantidad + 1 } : l));
      }
      return [...prev, { servicio_id: s.id, nombre: s.nombre, cantidad: 1, precio_unitario: Number(s.precio) }];
    });
  };

  const changeQty = (servicioId: number, cantidad: number) => {
    if (cantidad < 1) {
      setLineas((prev) => prev.filter((l) => l.servicio_id !== servicioId));
      return;
    }
    setLineas((prev) => prev.map((l) => (l.servicio_id === servicioId ? { ...l, cantidad } : l)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineas.length) {
      alert('Agrega al menos un producto.');
      return;
    }
    setSaving(true);
    try {
      await adminFetch('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          cliente_id: form.cliente_id ? parseInt(form.cliente_id, 10) : null,
          sucursal_id: form.sucursal_id ? parseInt(form.sucursal_id, 10) : null,
          tipo: form.tipo,
          notas: form.notas,
          items: lineas.map((l) => ({ servicio_id: l.servicio_id, cantidad: l.cantidad })),
        }),
      });
      setShowOrder(false);
      await load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleCobrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cobrar) return;
    setSaving(true);
    try {
      await adminFetch(`/pedidos/${cobrar.id}/cobrar`, {
        method: 'POST',
        body: JSON.stringify({ metodo_pago: metodo }),
      });
      setCobrar(null);
      await load();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const cancelar = async (id: number) => {
    if (!window.confirm('¿Cancelar este pedido?')) return;
    try {
      await adminFetch(`/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify({ estado: 'cancelado' }) });
      await load();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const statusBadge = (estado: string) => {
    if (estado === 'completado' || estado === 'cobrado') return <span className="badge badge-success">Cobrado</span>;
    if (estado === 'cancelado') return <span className="badge badge-danger">Cancelado</span>;
    return <span className="badge badge-warning">Abierto</span>;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8a7a6a' }}>Cargando caja...</div>;
  }

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Pedidos y caja</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo pedido</button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 20 }}>
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: '#fef5e7', color: '#e67e22' }}><ShoppingBag size={22} /></div>
          <div className="dashboard-stat-info"><h3>{abiertos.length}</h3><p>Pedidos abiertos</p></div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: '#e8f8f0', color: '#27ae60' }}><Banknote size={22} /></div>
          <div className="dashboard-stat-info"><h3>{cobradosHoy.length}</h3><p>Cobrados hoy</p></div>
        </div>
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon" style={{ background: '#fdf4e6', color: '#d4a373' }}><Banknote size={22} /></div>
          <div className="dashboard-stat-info"><h3>${totalHoy.toFixed(2)}</h3><p>Total cobrado hoy</p></div>
        </div>
      </div>

      <div className="admin-card">
        <h2>Atención de recepción</h2>
        <p style={{ color: '#8a7a6a', fontSize: 13, marginTop: 0 }}>Toma el pedido del cliente y registra el cobro cuando se entregue.</p>
        <table className="admin-table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Sucursal</th><th>Tipo</th><th>Detalle</th><th>Total</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td><strong>{p.cliente_nombre || p.cliente_registro || 'Cliente de paso'}</strong></td>
                <td>{p.sucursal_nombre || '—'}</td>
                <td>{tipoLabel[p.tipo] || p.tipo}</td>
                <td style={{ fontSize: 12, color: '#8a7a6a' }}>
                  {(p.items || []).map((i) => `${i.cantidad}× ${i.nombre}`).join(', ') || '—'}
                </td>
                <td><strong>${Number(p.total).toFixed(2)}</strong></td>
                <td>
                  {statusBadge(p.estado)}
                  {p.metodo_pago && p.estado !== 'abierto' && p.estado !== 'pendiente' && (
                    <div style={{ fontSize: 11, color: '#8a7a6a', marginTop: 4 }}>{p.metodo_pago}</div>
                  )}
                </td>
                <td>
                  {(p.estado === 'abierto' || p.estado === 'pendiente') ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-success btn-sm" onClick={() => { setMetodo('efectivo'); setCobrar(p); }}>Cobrar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => cancelar(p.id)}>Cancelar</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: '#ccc' }}>Cerrado</span>
                  )}
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No hay pedidos. Registra el primero con Nuevo pedido.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showOrder && (
        <div className="modal-overlay" onClick={() => setShowOrder(false)}>
          <div className="modal-content" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>Nuevo pedido</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowOrder(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Cliente</label>
                  <select className="form-control" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                    <option value="">Cliente de paso</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sucursal</label>
                  <select className="form-control" value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })} required disabled={Boolean(session.sucursal_id)}>
                    <option value="">Selecciona</option>
                    {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select className="form-control" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                    <option value="mostrador">Mostrador</option>
                    <option value="para_llevar">Para llevar</option>
                    <option value="catering">Catering</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Productos del menú</label>
                {servicios.length === 0 && <span style={{ color: '#8a7a6a', fontSize: 13 }}>No hay productos activos en el menú.</span>}
                {productosPorCategoria.length > 0 && (
                  <nav className="catalog-jump" style={{ margin: '8px 0 12px' }} aria-label="Categorías del menú">
                    {productosPorCategoria.map((group) => (
                      <button
                        key={group.categoria}
                        type="button"
                        className={(categoriaActiva || productosPorCategoria[0].categoria) === group.categoria ? 'active' : ''}
                        onClick={() => setCategoriaActiva(group.categoria)}
                      >
                        {group.categoria}
                      </button>
                    ))}
                  </nav>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 48 }}>
                  {productosVisibles.map((s) => {
                    const inCart = lineas.some((l) => l.servicio_id === s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`btn btn-sm ${inCart ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => addProducto(s)}
                      >
                        {s.nombre} · ${Number(s.precio).toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <table className="admin-table">
                <thead><tr><th>Producto</th><th>Cant.</th><th>P. unit.</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {lineas.map((l) => (
                    <tr key={l.servicio_id}>
                      <td>{l.nombre}</td>
                      <td>
                        <input
                          className="form-control"
                          type="number"
                          min={0}
                          value={l.cantidad}
                          onChange={(e) => changeQty(l.servicio_id, parseInt(e.target.value, 10) || 0)}
                          style={{ width: 72 }}
                        />
                      </td>
                      <td>${l.precio_unitario.toFixed(2)}</td>
                      <td>${(l.precio_unitario * l.cantidad).toFixed(2)}</td>
                    </tr>
                  ))}
                  {lineas.length === 0 && (
                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aaa' }}>Pulsa un producto para agregarlo</td></tr>
                  )}
                </tbody>
              </table>
              <p style={{ textAlign: 'right', fontWeight: 700, marginTop: 10 }}>Total: ${cartTotal.toFixed(2)}</p>

              <div className="form-group">
                <label>Notas</label>
                <input className="form-control" value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} placeholder="Sin azúcar, para llevar..." />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOrder(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : 'Registrar pedido'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cobrar && (
        <div className="modal-overlay" onClick={() => setCobrar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Cobrar pedido #{cobrar.id}</h2>
            <p style={{ color: '#8a7a6a' }}>{cobrar.cliente_nombre || cobrar.cliente_registro || 'Cliente de paso'} · ${Number(cobrar.total).toFixed(2)}</p>
            <form onSubmit={handleCobrar}>
              <div className="form-group">
                <label>Método de pago</label>
                <select className="form-control" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setCobrar(null)}>Volver</button>
                <button type="submit" className="btn btn-success" disabled={saving}>{saving ? 'Cobrando...' : 'Confirmar cobro'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;
