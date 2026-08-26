import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Target } from 'lucide-react';

import { adminFetch, adminFetchList } from '../api/adminApi';

const PERSPECTIVAS = ['financiera', 'cliente', 'procesos', 'aprendizaje'];

const PERSPECTIVA_LABELS = {
  financiera: 'Financiera',
  cliente: 'Cliente',
  procesos: 'Procesos',
  aprendizaje: 'Aprendizaje',
};

const emptyForm = { nombre: '', perspectiva: 'financiera', valor_actual: '', meta: '', unidad: '%' };

const Scorecard = () => {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/indicadores'));
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
      perspectiva: item.perspectiva || 'financiera',
      valor_actual: item.valor_actual,
      meta: item.meta,
      unidad: item.unidad || '%',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, valor_actual: parseFloat(form.valor_actual) || 0, meta: parseFloat(form.meta) || 0 };
    try {
      if (editing) {
        await adminFetch(`/indicadores/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await adminFetch('/indicadores', { method: 'POST', body: JSON.stringify(payload) });
      }
    } catch (err) {
      console.error(err);
    }
    setShowModal(false);
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este indicador?')) {
      try {
        await adminFetch(`/indicadores/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(err);
      }
      fetchItems();
    }
  };

  const getCumplimiento = (item) => {
    const meta = parseFloat(item.meta);
    const actual = parseFloat(item.valor_actual);
    if (!meta) return { value: '—', cls: '' };
    const pct = Math.round((actual / meta) * 100);
    return {
      value: `${pct}%`,
      cls: pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger',
    };
  };

  const sortedItems = [...items].sort((a, b) => PERSPECTIVAS.indexOf(a.perspectiva) - PERSPECTIVAS.indexOf(b.perspectiva));

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Balanced Scorecard</h1>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Nuevo Indicador</button>
      </div>

      {PERSPECTIVAS.map(perspectiva => {
        const group = sortedItems.filter(i => (i.perspectiva || 'financiera') === perspectiva);
        return (
          <div className="admin-card" key={perspectiva} style={{ marginTop: 16 }}>
            <div className="admin-card-header">
              <h2><Target size={18} style={{ marginRight: 8, color: '#d4a373' }} />Perspectiva {PERSPECTIVA_LABELS[perspectiva]}</h2>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 30, color: '#8a7a6a' }}>Cargando indicadores...</div>
            ) : group.length === 0 ? (
              <p style={{ color: '#ccc', textAlign: 'center', padding: 20 }}>Sin indicadores para esta perspectiva.</p>
            ) : (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Indicador</th><th>Valor Actual</th><th>Meta</th><th>Unidad</th><th>Cumplimiento</th><th>Acciones</th></tr></thead>
                <tbody>{group.map(item => {
                  const cumplimiento = getCumplimiento(item);
                  return (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td><strong>{item.nombre}</strong></td>
                      <td>{item.valor_actual}</td>
                      <td>{item.meta}</td>
                      <td>{item.unidad}</td>
                      <td><span className={`badge ${cumplimiento.cls}`}>{cumplimiento.value}</span></td>
                      <td>
                        <button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ marginLeft: 6 }}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            )}
          </div>
        );
      })}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editing ? 'Editar Indicador' : 'Nuevo Indicador'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group"><label>Indicador</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
              <div className="form-group"><label>Perspectiva</label>
                <select className="form-control" value={form.perspectiva} onChange={e => setForm({ ...form, perspectiva: e.target.value })}>
                  {PERSPECTIVAS.map(p => <option key={p} value={p}>{PERSPECTIVA_LABELS[p]}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Valor Actual</label><input className="form-control" type="number" step="0.01" value={form.valor_actual} onChange={e => setForm({ ...form, valor_actual: e.target.value })} required /></div>
                <div className="form-group"><label>Meta</label><input className="form-control" type="number" step="0.01" value={form.meta} onChange={e => setForm({ ...form, meta: e.target.value })} required /></div>
              </div>
              <div className="form-group"><label>Unidad</label>
                <select className="form-control" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                  <option value="%">Porcentaje</option>
                  <option value="$">Dólares</option>
                  <option value="unidades">Unidades</option>
                  <option value="días">Días</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Indicador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scorecard;
