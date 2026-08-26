import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const Inventarios = () => {
  const [items, setItems] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ producto: '', cantidad: '', unidad: 'kg', stock_minimo: '', sucursal_id: '', proveedor_id: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    adminFetchList('/sucursales').then(setSucursales).catch(() => setSucursales([]));
    adminFetchList('/proveedores').then(setProveedores).catch(() => setProveedores([]));
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/inventarios'));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ producto: '', cantidad: '', unidad: 'kg', stock_minimo: '', sucursal_id: '', proveedor_id: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ producto: item.producto, cantidad: item.cantidad, unidad: item.unidad, stock_minimo: item.stock_minimo, sucursal_id: item.sucursal_id || '', proveedor_id: item.proveedor_id || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      producto: form.producto,
      cantidad: parseFloat(form.cantidad) || 0,
      unidad: form.unidad,
      stock_minimo: parseFloat(form.stock_minimo) || 0,
      sucursal_id: form.sucursal_id === '' ? null : parseInt(form.sucursal_id, 10),
      proveedor_id: form.proveedor_id === '' ? null : parseInt(form.proveedor_id, 10),
    };
    try {
      if (editing) {
        await adminFetch(`/inventarios/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/inventarios', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este item?')) return;
    try {
      await adminFetch(`/inventarios/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Inventarios</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Item</button></div>
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando inventario...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Producto</th><th>Cantidad</th><th>Unidad</th><th>Stock Mín.</th><th>Sucursal</th><th>Proveedor</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map(item => {
                const bajoStock = item.cantidad <= item.stock_minimo;
                return (
                  <tr key={item.id}><td>{item.id}</td><td>{item.producto}</td><td>{item.cantidad}</td><td>{item.unidad}</td><td>{item.stock_minimo}</td>
                    <td>{sucursales.find(s => s.id === item.sucursal_id)?.nombre || '—'}</td>
                    <td>{proveedores.find(p => p.id === item.proveedor_id)?.nombre || '—'}</td>
                    <td><span className={`badge ${bajoStock ? 'badge-danger' : 'badge-success'}`}>{bajoStock ? 'Stock Bajo' : 'OK'}</span></td>
                    <td><button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button></td></tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>No hay items en inventario. Registra productos reales desde aquí.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Item' : 'Nuevo Item'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Producto</label><input className="form-control" value={form.producto} onChange={e => setForm({ ...form, producto: e.target.value })} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Cantidad</label><input className="form-control" type="number" step="0.01" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required /></div>
                <div className="form-group"><label>Unidad</label><input className="form-control" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} /></div>
                <div className="form-group"><label>Stock mínimo</label><input className="form-control" type="number" step="0.01" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Sucursal</label>
                  <select className="form-control" value={form.sucursal_id} onChange={e => setForm({ ...form, sucursal_id: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Proveedor</label>
                  <select className="form-control" value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventarios;
