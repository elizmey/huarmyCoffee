import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

import { adminFetch, adminFetchList } from '../api/adminApi';

const emptyForm = { asunto: '', mensaje: '', destinatario: 'todos', activo: true };

const Comunicacion = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/comunicaciones'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ asunto: item.asunto, mensaje: item.mensaje || '', destinatario: item.destinatario || 'todos', activo: item.activo });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/comunicaciones/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch('/comunicaciones', { method: 'POST', body: JSON.stringify({ ...form, fecha_publicacion: new Date().toISOString().split('T')[0] }) });
      }
    } catch (err) {
      console.error(err);
    }
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta comunicación?')) {
      try {
        await adminFetch(`/comunicaciones/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
      fetchItems();
    }
  };

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Comunicaciones Internas</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nueva Comunicación</button>
      </div>
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando comunicaciones...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Asunto</th><th>Mensaje</th><th>Destinatario</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td><strong>{item.asunto}</strong></td>
                <td style={{ maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.mensaje}</td>
                <td>{item.destinatario}</td>
                <td>{item.fecha_publicacion ? new Date(item.fecha_publicacion).toLocaleDateString() : ''}</td>
                <td><span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>{item.activo ? 'Activa' : 'Inactiva'}</span></td>
                <td>
                  <button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No hay comunicaciones registradas.</td></tr>
            )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Comunicación' : 'Nueva Comunicación'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Asunto</label><input className="form-control" value={form.asunto} onChange={e => setForm({ ...form, asunto: e.target.value })} required /></div>
              <div className="form-group"><label>Mensaje</label><textarea className="form-control" rows={3} value={form.mensaje} onChange={e => setForm({ ...form, mensaje: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Destinatario</label>
                  <select className="form-control" value={form.destinatario} onChange={e => setForm({ ...form, destinatario: e.target.value })}>
                    <option value="todos">Todos</option>
                    <option value="gerentes">Gerentes</option>
                    <option value="personal">Personal</option>
                    <option value="socios">Socios</option>
                  </select>
                </div>
                <div className="form-group"><label>Estado</label>
                  <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Publicar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comunicacion;
