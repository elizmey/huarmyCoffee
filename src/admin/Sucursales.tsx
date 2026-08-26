import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const Sucursales = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', direccion: '', telefono: '', capacidad_maxima: 50 });

  useEffect(() => { fetchItems(); }, []);
  const fetchItems = async () => {
    try {
      setItems(await adminFetchList('/sucursales'));
    } catch (e) {
      console.error(e);
      setItems([]);
    }
  };

  const openCreate = () => { setEditing(null); setForm({ nombre: '', direccion: '', telefono: '', capacidad_maxima: 50 }); setShowModal(true); };
  const openEdit = (item) => { setEditing(item); setForm({ nombre: item.nombre, direccion: item.direccion, telefono: item.telefono, capacidad_maxima: item.capacidad_maxima }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/sucursales/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch('/sucursales', { method: 'POST', body: JSON.stringify(form) });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta sucursal?')) return;
    try {
      await adminFetch(`/sucursales/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Sucursales</h1><button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nueva Sucursal</button></div>
      <div className="admin-card">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Capacidad Máx.</th><th>Acciones</th></tr></thead>
          <tbody>{items.map(item => (
            <tr key={item.id}><td>{item.id}</td><td>{item.nombre}</td><td>{item.direccion}</td><td>{item.telefono}</td><td>{item.capacidad_maxima} personas</td>
              <td><button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button></td></tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>No hay sucursales. Registra la primera sucursal real del negocio.</td></tr>
          )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Sucursal' : 'Nueva Sucursal'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
              <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} required /></div>
              <div className="form-row">
                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} required /></div>
                <div className="form-group"><label>Capacidad Máxima</label><input className="form-control" type="number" value={form.capacidad_maxima} onChange={e => setForm({ ...form, capacidad_maxima: parseInt(e.target.value) || 0 })} required /></div>
              </div>
              <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Sucursal'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sucursales;








