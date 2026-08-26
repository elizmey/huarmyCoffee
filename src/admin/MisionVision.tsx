import React, { useEffect, useState } from 'react';
import { Edit2, X, Target } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const MisionVision = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ tipo: 'mision', contenido: '', activo: true });

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/mision-vision'));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const openEdit = (item) => {
    setEditing(item);
    setForm({ tipo: item.tipo, contenido: item.contenido || '', activo: item.activo !== false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing?.id) {
        await adminFetch(`/mision-vision/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch('/mision-vision', { method: 'POST', body: JSON.stringify(form) });
      }
      setEditing(null);
      fetchItems();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Misión y Visión</h1>
      </div>
      <div className="admin-card">
        <h2><Target size={18} style={{ marginRight: 8, color: '#d4a373' }} />Textos del portal empresarial</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>Tipo</th><th>Contenido</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.tipo === 'mision' ? 'Misión' : 'Visión'}</strong></td>
                  <td style={{ maxWidth: 480 }}>{item.contenido}</td>
                  <td><span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>{item.activo ? 'Activo' : 'Inactivo'}</span></td>
                  <td><button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button></td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>No hay textos. Crea misión y visión desde aquí.</td></tr>
              )}
            </tbody>
          </table>
        )}
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => { setEditing({ id: null }); setForm({ tipo: 'mision', contenido: '', activo: true }); }}>Nuevo texto</button>
      </div>
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing.id ? `Editar ${form.tipo === 'mision' ? 'misión' : 'visión'}` : 'Nuevo texto'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tipo</label>
                <select className="form-control" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} disabled={Boolean(editing.id)}>
                  <option value="mision">Misión</option>
                  <option value="vision">Visión</option>
                </select>
              </div>
              <div className="form-group">
                <label>Contenido</label>
                <textarea className="form-control" rows={6} value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}>
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisionVision;
