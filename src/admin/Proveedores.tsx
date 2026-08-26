import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const Proveedores = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      setItems(await adminFetchList('/proveedores'));
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ nombre: '', contacto: '', telefono: '', email: '', direccion: '' }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ nombre: item.nombre, contacto: item.contacto, telefono: item.telefono, email: item.email, direccion: item.direccion }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/proveedores/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch('/proveedores', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await adminFetch(`/proveedores/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Proveedores</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Proveedor</button></div>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id}><td>{item.id}</td><td>{item.nombre}</td><td>{item.contacto}</td><td>{item.telefono}</td><td>{item.email}</td>
              <td><button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button></td></tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>No hay proveedores registrados.</td></tr>
          )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                <div className="form-group"><label>Contacto</label><input className="form-control" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required /></div>
                <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              </div>
              <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
              <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Proveedor'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
