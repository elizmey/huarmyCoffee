import React from 'react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Cliente = { id: number; nombre: string; email: string; telefono: string; direccion: string };
type Form = { nombre: string; email: string; telefono: string; direccion: string };

const emptyForm: Form = { nombre: '', email: '', telefono: '', direccion: '' };

const Clientes = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Cliente, Form>('/clientes', emptyForm, {
      toForm: (c) => ({ nombre: c.nombre, email: c.email, telefono: c.telefono, direccion: c.direccion }),
      toPayload: (form, editing) => (editing ? form : { ...form, created_at: new Date().toISOString().split('T')[0] }),
      confirmDelete: () => '¿Eliminar este cliente?',
    });

  return (
    <div>
      <AdminHeaderBar title="Clientes" actionLabel="Nuevo Cliente" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<Cliente>
          loading={loading}
          loadingLabel="Cargando clientes..."
          emptyLabel="No hay clientes. Registra el primero con el botón Nuevo Cliente."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (c) => c.id },
            { header: 'Nombre', render: (c) => c.nombre },
            { header: 'Email', render: (c) => c.email },
            { header: 'Teléfono', render: (c) => c.telefono },
            { header: 'Dirección', render: (c) => c.direccion },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Cliente' : 'Nuevo Cliente'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar' : 'Crear'}>
          <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
          <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
          <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
        </CrudModal>
      )}
    </div>
  );
};

export default Clientes;
