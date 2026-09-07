import React from 'react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Sucursal = { id: number; nombre: string; direccion: string; telefono: string; capacidad_maxima: number };
type Form = { nombre: string; direccion: string; telefono: string; capacidad_maxima: number };

const emptyForm: Form = { nombre: '', direccion: '', telefono: '', capacidad_maxima: 50 };

const Sucursales = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Sucursal, Form>('/sucursales', emptyForm, {
      toForm: (s) => ({ nombre: s.nombre, direccion: s.direccion, telefono: s.telefono, capacidad_maxima: s.capacidad_maxima }),
      confirmDelete: () => '¿Eliminar esta sucursal?',
    });

  return (
    <div>
      <AdminHeaderBar title="Sucursales" actionLabel="Nueva Sucursal" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<Sucursal>
          loading={loading}
          loadingLabel="Cargando sucursales..."
          emptyLabel="No hay sucursales. Registra la primera sucursal real del negocio."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (s) => s.id },
            { header: 'Nombre', render: (s) => s.nombre },
            { header: 'Dirección', render: (s) => s.direccion },
            { header: 'Teléfono', render: (s) => s.telefono },
            { header: 'Capacidad Máx.', render: (s) => `${s.capacidad_maxima} personas` },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Sucursal' : 'Nueva Sucursal'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Crear Sucursal'}>
          <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
          <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required /></div>
            <div className="form-group"><label>Capacidad Máxima</label><input className="form-control" type="number" value={form.capacidad_maxima} onChange={(e) => setForm({ ...form, capacidad_maxima: parseInt(e.target.value, 10) || 0 })} required /></div>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Sucursales;
