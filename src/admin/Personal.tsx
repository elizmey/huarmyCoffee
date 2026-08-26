import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const Personal = () => {
  const [items, setItems] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', cargo: '', telefono: '', email: '', salario: '', sucursal_id: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
    adminFetchList('/sucursales').then(setSucursales).catch(() => setSucursales([]));
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/personal'));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ nombre: '', cargo: '', telefono: '', email: '', salario: '', sucursal_id: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ nombre: item.nombre, cargo: item.cargo, telefono: item.telefono, email: item.email, salario: item.salario, sucursal_id: item.sucursal_id || '' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre,
      cargo: form.cargo,
      telefono: form.telefono,
      email: form.email,
      salario: parseFloat(form.salario) || 0,
      sucursal_id: form.sucursal_id === '' ? null : parseInt(form.sucursal_id, 10),
    };
    try {
      if (editing) {
        await adminFetch(`/personal/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/personal', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    try {
      await adminFetch(`/personal/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Personal</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Empleado</button></div>
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando personal...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Cargo</th><th>Teléfono</th><th>Email</th><th>Salario</th><th>Sucursal</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}><td>{item.id}</td><td>{item.nombre}</td><td>{item.cargo}</td><td>{item.telefono}</td><td>{item.email}</td><td>{item.salario ? Number(item.salario).toFixed(2) : ''}</td>
                  <td>{sucursales.find(s => s.id === item.sucursal_id)?.nombre || '—'}</td>
                  <td><button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button></td></tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>No hay personal registrado. Crea empleados desde aquí o registra sucursales primero.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                <div className="form-group"><label>Cargo</label><input className="form-control" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
                <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Salario</label><input className="form-control" type="number" step="0.01" value={form.salario} onChange={e => setForm({ ...form, salario: e.target.value })} /></div>
                <div className="form-group"><label>Sucursal</label>
                  <select className="form-control" value={form.sucursal_id} onChange={e => setForm({ ...form, sucursal_id: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
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

export default Personal;
