import React from 'react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Socio = { id: number; nombre: string; tipo: string; contacto: string; telefono: string; email: string; direccion: string };
type Form = { nombre: string; tipo: string; contacto: string; telefono: string; email: string; direccion: string };

const emptyForm: Form = { nombre: '', tipo: 'socio', contacto: '', telefono: '', email: '', direccion: '' };

const tipoBadge = (tipo: string) => (tipo === 'inversionista' ? 'badge-success' : tipo === 'aliado' ? 'badge-info' : 'badge-warning');

const Socios = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Socio, Form>('/socios', emptyForm, {
      toForm: (s) => ({ nombre: s.nombre, tipo: s.tipo || 'socio', contacto: s.contacto || '', telefono: s.telefono || '', email: s.email || '', direccion: s.direccion || '' }),
      toPayload: (form, editing) => (editing ? form : { ...form, created_at: new Date().toISOString().split('T')[0] }),
      confirmDelete: () => '¿Eliminar este socio?',
    });

  return (
    <div>
      <AdminHeaderBar title="Socios Estratégicos" actionLabel="Nuevo Socio" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<Socio>
          loading={loading}
          loadingLabel="Cargando socios..."
          emptyLabel="No hay socios registrados."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (s) => s.id },
            { header: 'Nombre', render: (s) => s.nombre },
            { header: 'Tipo', render: (s) => <span className={`badge ${tipoBadge(s.tipo)}`}>{s.tipo || 'socio'}</span> },
            { header: 'Contacto', render: (s) => s.contacto },
            { header: 'Teléfono', render: (s) => s.telefono },
            { header: 'Email', render: (s) => s.email },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Socio' : 'Nuevo Socio'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Crear Socio'}>
          <div className="form-row">
            <div className="form-group"><label>Nombre</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
            <div className="form-group"><label>Tipo</label>
              <select className="form-control" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="socio">Socio</option>
                <option value="inversionista">Inversionista</option>
                <option value="aliado">Aliado</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Contacto</label><input className="form-control" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} /></div>
            <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} /></div>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Socios;
