import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, BadgePercent } from 'lucide-react';

import { apiUrl } from '../api';

const emptyForm = { titulo: '', descripcion: '', tipo: 'Corporativa', precio: '', fecha_inicio: '', fecha_fin: '', url_imagen: '', activo: true };

const PromocionesAdmin = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/promociones'), { headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') } });
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
      titulo: item.titulo,
      descripcion: item.descripcion || '',
      tipo: item.tipo || 'Corporativa',
      precio: item.precio || '',
      fecha_inicio: item.fecha_inicio ? String(item.fecha_inicio).split('T')[0] : '',
      fecha_fin: item.fecha_fin ? String(item.fecha_fin).split('T')[0] : '',
      url_imagen: item.url_imagen || '',
      activo: item.activo,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      precio: form.precio === '' ? 0 : parseFloat(form.precio),
      fecha_inicio: form.fecha_inicio || null,
      fecha_fin: form.fecha_fin || null,
    };
    try {
      if (editing) {
        await fetch(apiUrl(`/promociones/${editing.id}`), { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }, body: JSON.stringify(payload) });
      } else {
        await fetch(apiUrl('/promociones'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') }, body: JSON.stringify(payload) });
      }
    } catch (err) {
      console.error(err);
    }
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta promoción?')) {
      try {
        await fetch(apiUrl(`/promociones/${id}`), { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') } });
      } catch (err) {
        console.error(err);
      }
      fetchItems();
    }
  };

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Promociones y Paquetes</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nueva Promoción</button>
      </div>
      <div className="admin-card">
        <h2><BadgePercent size={18} style={{ marginRight: 8, color: '#d4a373' }} />Ofertas Publicadas</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando promociones...</div>
        ) : (
          <table className="admin-table" style={{ marginTop: 15 }}>
            <thead><tr><th>ID</th><th>Título</th><th>Tipo</th><th>Precio</th><th>Vigencia</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td><strong>{item.titulo}</strong></td>
                <td>{item.tipo}</td>
                <td>{item.precio ? `$${item.precio}` : '—'}</td>
                <td style={{ fontSize: 12 }}>
                  {item.fecha_inicio ? new Date(item.fecha_inicio).toLocaleDateString() : '—'}
                  {item.fecha_fin ? ` a ${new Date(item.fecha_fin).toLocaleDateString()}` : ''}
                </td>
                <td><span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>{item.activo ? 'Activa' : 'Inactiva'}</span></td>
                <td>
                  <button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No hay promociones registradas.</td></tr>
            )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Promoción' : 'Nueva Promoción'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Título</label><input className="form-control" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required /></div>
              <div className="form-group"><label>Descripción</label><textarea className="form-control" rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div className="form-row">
                <div className="form-group"><label>Tipo</label>
                  <select className="form-control" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    <option value="Corporativa">Corporativa</option>
                    <option value="Celebración">Celebración</option>
                    <option value="Logística">Logística</option>
                  </select>
                </div>
                <div className="form-group"><label>Precio (USD)</label><input className="form-control" type="number" step="0.01" min="0" value={form.precio} onChange={e => setForm({ ...form, precio: e.target.value })} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Fecha Inicio</label><input className="form-control" type="date" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
                <div className="form-group"><label>Fecha Fin</label><input className="form-control" type="date" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>URL de Imagen</label><input className="form-control" value={form.url_imagen} onChange={e => setForm({ ...form, url_imagen: e.target.value })} placeholder="https://..." /></div>
              <div className="form-group"><label>Estado</label>
                <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                  <option value="true">Activa</option>
                  <option value="false">Inactiva</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Promoción'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromocionesAdmin;
