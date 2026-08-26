import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, ShieldCheck } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'cajero', label: 'Cajero' },
];

const emptyForm = { nombre: '', email: '', password: '', rol: 'cajero', sucursal_id: '', activo: true };

const Usuarios = () => {
  const [items, setItems] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isAdmin = currentUser.rol === 'admin';

  useEffect(() => {
    fetchItems();
    adminFetchList('/sucursales').then(setSucursales).catch(() => setSucursales([]));
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList('/usuarios'));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ nombre: item.nombre, email: item.email, password: '', rol: item.rol, sucursal_id: item.sucursal_id || '', activo: item.activo });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload: {
      nombre: string;
      email: string;
      rol: string;
      sucursal_id: number | null;
      activo: boolean;
      password?: string;
    } = {
      nombre: form.nombre,
      email: form.email,
      rol: form.rol,
      sucursal_id: form.sucursal_id === '' ? null : parseInt(form.sucursal_id, 10),
      activo: form.activo,
    };
    if (form.password) payload.password = form.password;

    try {
      if (editing) {
        await adminFetch(`/usuarios/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        if (!form.password) { setError('La contraseña es obligatoria para nuevos usuarios'); return; }
        await adminFetch('/usuarios', { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      fetchItems();
    } catch (err) {
      setError((err as Error).message || 'No se pudo guardar el usuario');
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar al usuario "${item.nombre}"?`)) return;
    try {
      await adminFetch(`/usuarios/${item.id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      alert((err as Error).message || 'No se pudo eliminar el usuario');
    }
  };

  const roleLabel = (rol) => ROLES.find(r => r.value === rol)?.label || rol;
  const roleBadge = (rol) => (rol === 'admin' ? 'badge-success' : rol === 'gerente' ? 'badge-info' : 'badge-warning');

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Usuarios del Sistema</h1>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Registrar Usuario</button>}
      </div>

      {!isAdmin && (
        <div className="admin-card" style={{ borderLeft: '4px solid #e67e22' }}>
          <p style={{ margin: 0, color: '#8a7a6a' }}>Solo los usuarios con rol <strong>Administrador</strong> pueden registrar o modificar usuarios.</p>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando usuarios...</div>
        ) : (
          <table className="admin-table">
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Sucursal</th><th>Estado</th>{isAdmin && <th>Acciones</th>}</tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.nombre}</td>
                  <td>{item.email}</td>
                  <td><span className={`badge ${roleBadge(item.rol)}`}>{roleLabel(item.rol)}</span></td>
                  <td>{sucursales.find(s => s.id === item.sucursal_id)?.nombre || '—'}</td>
                  <td><span className={`badge ${item.activo ? 'badge-success' : 'badge-danger'}`}>{item.activo ? 'Activo' : 'Inactivo'}</span></td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-edit btn-sm" onClick={() => openEdit(item)}><Edit2 size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item)} style={{ marginLeft: 6 }} disabled={item.id === currentUser.id}><Trash2 size={14} /></button>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No hay usuarios registrados.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={20} color="#d4a373" /> {editing ? 'Editar Usuario' : 'Registrar Usuario'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            {error && <p className="login-error" role="alert" style={{ color: '#c0392b', marginBottom: 12 }}>{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contraseña {editing && <span style={{ fontWeight: 400, color: '#aaa', fontSize: 12 }}>(dejar vacío para no cambiar)</span>}</label>
                  <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'} minLength={6} {...(!editing ? { required: true } : {})} />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select className="form-control" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Sucursal</label>
                  <select className="form-control" value={form.sucursal_id} onChange={e => setForm({ ...form, sucursal_id: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado</label>
                  <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Registrar Usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
