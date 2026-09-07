import React, { useEffect, useState } from 'react';
import { adminFetchList } from '../api/adminApi';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Sucursal = { id: number; nombre: string };
type Empleado = { id: number; nombre: string; cargo: string; telefono: string; email: string; salario: number; sucursal_id: number | null };
type Form = { nombre: string; cargo: string; telefono: string; email: string; salario: string; sucursal_id: string };

const emptyForm: Form = { nombre: '', cargo: '', telefono: '', email: '', salario: '', sucursal_id: '' };

const Personal = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  useEffect(() => {
    adminFetchList<Sucursal>('/sucursales').then(setSucursales).catch(() => setSucursales([]));
  }, []);

  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Empleado, Form>('/personal', emptyForm, {
      toForm: (e) => ({ nombre: e.nombre, cargo: e.cargo, telefono: e.telefono, email: e.email, salario: String(e.salario ?? ''), sucursal_id: e.sucursal_id ? String(e.sucursal_id) : '' }),
      toPayload: (form) => ({
        nombre: form.nombre,
        cargo: form.cargo,
        telefono: form.telefono,
        email: form.email,
        salario: parseFloat(form.salario) || 0,
        sucursal_id: form.sucursal_id === '' ? null : parseInt(form.sucursal_id, 10),
      }),
      confirmDelete: () => '¿Eliminar este empleado?',
    });

  return (
    <div>
      <AdminHeaderBar title="Personal" actionLabel="Nuevo Empleado" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<Empleado>
          loading={loading}
          loadingLabel="Cargando personal..."
          emptyLabel="No hay personal registrado. Crea empleados desde aquí o registra sucursales primero."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (e) => e.id },
            { header: 'Nombre', render: (e) => e.nombre },
            { header: 'Cargo', render: (e) => e.cargo },
            { header: 'Teléfono', render: (e) => e.telefono },
            { header: 'Email', render: (e) => e.email },
            { header: 'Salario', render: (e) => (e.salario ? Number(e.salario).toFixed(2) : '') },
            { header: 'Sucursal', render: (e) => sucursales.find((s) => s.id === e.sucursal_id)?.nombre || '—' },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Empleado' : 'Nuevo Empleado'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar' : 'Crear'}>
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="form-group"><label>Cargo</label><input className="form-control" value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Salario</label><input className="form-control" type="number" step="0.01" value={form.salario} onChange={(e) => setForm({ ...form, salario: e.target.value })} /></div>
            <div className="form-group"><label>Sucursal</label>
              <select className="form-control" value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Personal;
