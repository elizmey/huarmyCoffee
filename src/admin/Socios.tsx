import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

import { apiUrl } from '../api';

const emptyForm = { nombre: '', tipo: 'socio', contacto: '', telefono: '', email: '', direccion: '' };

const Socios = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/socios'), { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') } });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      tipo: item.tipo || 'socio',
      contacto: item.contacto || '',
      telefono: item.telefono || '',
      email: item.email || '',
      direccion: item.direccion || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, created_at: new Date().toISOString().split('T')[0] };
    try {
      if (editing) {
        await fetch(apiUrl(`/socios/${editing.id}`), { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }, body: JSON.stringify(form) });
      } else {
        await fetch(apiUrl('/socios'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }, body: JSON.stringify(payload) });
      }
    } catch (err) {
      console.error(err);
    }
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este socio?')) {
      try {
        await fetch(apiUrl(`/socios/${id}`), { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') } });
      } catch (err) {
        console.error(err);
      }
      fetchItems();
    }
  };

  const tipoBadge = (tipo) => (tipo === 'inversionista' ? 'badge-success' : tipo === 'aliado' ? 'badge-info' : 'badge-warning');

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Socios Estratégicos</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Socio</button>
      </div>
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando socios...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
            <tbody>{items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nombre}</td>
                <td><span className={`badge ${tipoBadge(item.tipo)}`}>{item.tipo || 'socio'}</span></td>
                <td>{item.contacto}</td>
                <td>{item.telefono}</td>
                <td>{item.email}</td>
                <td>
                  <button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No hay socios registrados.</td></tr>
            )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Socio' : 'Nuevo Socio'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                <div className="form-group"><label>Tipo</label>
                  <select className="form-control" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="socio">Socio</option>
                    <option value="inversionista">Inversionista</option>
                    <option value="aliado">Aliado</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Contacto</label><input className="form-control" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} /></div>
                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Socio'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Socios;
