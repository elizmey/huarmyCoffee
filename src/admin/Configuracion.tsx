import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Settings } from 'lucide-react';

import { adminFetch, adminFetchList } from '../api/adminApi';

const emptyForm = { clave: '', valor: '', descripcion: '' };

const Configuracion = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/configuracion'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ clave: item.clave, valor: item.valor, descripcion: item.descripcion || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await adminFetch(`/configuracion/${editing.id}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await adminFetch('/configuracion', { method: 'POST', body: JSON.stringify(form) });
      }
    } catch (err) {
      alert((err as Error).message);
    }
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta configuración?')) {
      try {
        await adminFetch(`/configuracion/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
      fetchItems();
    }
  };

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Configuración del Sitio</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nueva Configuración</button>
      </div>
      <div className="admin-card">
        <h2><Settings size={18} style={{ marginRight: 8, color: '#d4a373' }} />Parámetros Generales</h2>
        <p style={{ color: '#8a7a6a', fontSize: 13, margin: '8px 0 15px' }}>
          La clave <strong>mostrar_trabaja</strong> (valor <strong>true</strong>/<strong>false</strong>) controla la sección "Trabaja con Nosotros" en el sitio público.
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando configuración...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Clave</th><th>Valor</th><th>Descripción</th><th>Acciones</th></tr></thead>
            <tbody>{items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td><code style={{ background: '#f5ebe6', padding: '2px 8px', borderRadius: 4 }}>{item.clave}</code></td>
                <td><strong>{item.valor}</strong></td>
                <td style={{ fontSize: 12, color: '#8a7a6a' }}>{item.descripcion}</td>
                <td>
                  <button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No hay parámetros de configuración.</td></tr>
            )}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Configuración' : 'Nueva Configuración'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Clave</label><input className="form-control" value={form.clave} onChange={e => setForm({ ...form, clave: e.target.value })} placeholder="ej: mostrar_trabaja" required /></div>
              <div className="form-group"><label>Valor</label><input className="form-control" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} placeholder="true / false / texto" required /></div>
              <div className="form-group"><label>Descripción</label><input className="form-control" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
