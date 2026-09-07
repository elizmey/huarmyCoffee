import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { adminFetchList, getStoredAdminUser } from '../api/adminApi';
import { useCrudResource } from '../hooks/useCrudResource';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'recepcionista', label: 'Recepcionista' },
  { value: 'cajero', label: 'Cajero' },
];

type Sucursal = { id: number; nombre: string };
type Usuario = { id: number; nombre: string; email: string; rol: string; sucursal_id: number | null; activo: boolean };
type Form = { nombre: string; email: string; password: string; rol: string; sucursal_id: string; activo: boolean };

const emptyForm: Form = { nombre: '', email: '', password: '', rol: 'cajero', sucursal_id: '', activo: true };

const roleLabel = (rol: string) => ROLES.find((r) => r.value === rol)?.label || rol;
const roleBadge = (rol: string) => (rol === 'admin' ? 'badge-success' : rol === 'gerente' ? 'badge-info' : 'badge-warning');

const Usuarios = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const currentUser = getStoredAdminUser();
  const isAdmin = currentUser?.rol === 'admin';

  useEffect(() => {
    adminFetchList<Sucursal>('/sucursales').then(setSucursales).catch(() => setSucursales([]));
  }, []);

  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Usuario, Form>('/usuarios', emptyForm, {
      toForm: (u) => ({ nombre: u.nombre, email: u.email, password: '', rol: u.rol, sucursal_id: u.sucursal_id ? String(u.sucursal_id) : '', activo: u.activo }),
      toPayload: (form, editing) => {
        if (!editing && !form.password) {
          throw new Error('La contraseña es obligatoria para nuevos usuarios');
        }
        const payload: Record<string, unknown> = {
          nombre: form.nombre,
          email: form.email,
          rol: form.rol,
          sucursal_id: form.sucursal_id === '' ? null : parseInt(form.sucursal_id, 10),
          activo: form.activo,
        };
        if (form.password) payload.password = form.password;
        return payload;
      },
      confirmDelete: (u) => `¿Eliminar al usuario "${u.nombre}"?`,
    });

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Usuarios del Sistema</h1>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> Registrar Usuario</button>}
      </div>

      {!isAdmin && (
        <div className="admin-card admin-card--warning">
          <p className="warning-text">Solo los usuarios con rol <strong>Administrador</strong> pueden registrar o modificar usuarios.</p>
        </div>
      )}

      <div className="admin-card">
        <CrudTable<Usuario>
          loading={loading}
          loadingLabel="Cargando usuarios..."
          emptyLabel="No hay usuarios registrados."
          items={items}
          onEdit={isAdmin ? openEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          canDelete={(u) => u.id !== currentUser?.id}
          columns={[
            { header: 'ID', render: (u) => u.id },
            { header: 'Nombre', render: (u) => u.nombre },
            { header: 'Email', render: (u) => u.email },
            { header: 'Rol', render: (u) => <span className={`badge ${roleBadge(u.rol)}`}>{roleLabel(u.rol)}</span> },
            { header: 'Sucursal', render: (u) => sucursales.find((s) => s.id === u.sucursal_id)?.nombre || '—' },
            { header: 'Estado', render: (u) => <span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span> },
          ]}
        />
      </div>

      {showModal && (
        <CrudModal
          title={editing ? 'Editar Usuario' : 'Registrar Usuario'}
          onClose={closeModal}
          onSubmit={handleSubmit}
          error={error}
          submitLabel={editing ? 'Guardar Cambios' : 'Registrar Usuario'}
        >
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Contraseña {editing && <span className="field-hint">(dejar vacío para no cambiar)</span>}</label>
              <input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'} minLength={6} {...(!editing ? { required: true } : {})} />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select className="form-control" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sucursal</label>
              <select className="form-control" value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Usuarios;
