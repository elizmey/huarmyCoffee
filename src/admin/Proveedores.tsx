import React from 'react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Proveedor = { id: number; nombre: string; contacto: string; telefono: string; email: string; direccion: string };
type Form = { nombre: string; contacto: string; telefono: string; email: string; direccion: string };

const emptyForm: Form = { nombre: '', contacto: '', telefono: '', email: '', direccion: '' };

const Proveedores = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Proveedor, Form>('/proveedores', emptyForm, {
      toForm: (p) => ({ nombre: p.nombre, contacto: p.contacto, telefono: p.telefono, email: p.email, direccion: p.direccion }),
      toPayload: (form, editing) => (editing ? form : { ...form, created_at: new Date().toISOString().split('T')[0] }),
      confirmDelete: () => '¿Eliminar este proveedor?',
    });

  return (
    <div>
      <AdminHeaderBar title="Proveedores" actionLabel="Nuevo Proveedor" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<Proveedor>
          loading={loading}
          loadingLabel="Cargando proveedores..."
          emptyLabel="No hay proveedores registrados."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (p) => p.id },
            { header: 'Nombre', render: (p) => p.nombre },
            { header: 'Contacto', render: (p) => p.contacto },
            { header: 'Teléfono', render: (p) => p.telefono },
            { header: 'Email', render: (p) => p.email },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Crear Proveedor'}>
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="form-group"><label>Contacto</label><input className="form-control" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
        </CrudModal>
      )}
    </div>
  );
};

export default Proveedores;
