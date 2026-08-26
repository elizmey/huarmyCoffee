import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const Clientes = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/clientes'));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ nombre: '', email: '', telefono: '', direccion: '' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, email: c.email, telefono: c.telefono, direccion: c.direccion }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/clientes/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch('/clientes', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await adminFetch(`/clientes/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Clientes</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Cliente</button></div>
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando clientes...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Dirección</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id}><td>{c.id}</td><td>{c.nombre}</td><td>{c.email}</td><td>{c.telefono}</td><td>{c.direccion}</td>
                  <td><button className="btn btn-edit btn-sm" onClick={() => openEdit(c)}><Edit2 size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button></td></tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>No hay clientes. Registra el primero con el botón Nuevo Cliente.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
              <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
              <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
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

export default Clientes;
