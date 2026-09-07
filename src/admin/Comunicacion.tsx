import React from 'react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type ComunicacionItem = { id: number; asunto: string; mensaje: string; destinatario: string; fecha_publicacion: string | null; activo: boolean };
type Form = { asunto: string; mensaje: string; destinatario: string; activo: boolean };

const emptyForm: Form = { asunto: '', mensaje: '', destinatario: 'todos', activo: true };

const Comunicacion = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<ComunicacionItem, Form>('/comunicaciones', emptyForm, {
      toForm: (c) => ({ asunto: c.asunto, mensaje: c.mensaje || '', destinatario: c.destinatario || 'todos', activo: c.activo }),
      toPayload: (form, editing) => (editing ? form : { ...form, fecha_publicacion: new Date().toISOString().split('T')[0] }),
      confirmDelete: () => '¿Eliminar esta comunicación?',
    });

  return (
    <div>
      <AdminHeaderBar title="Comunicaciones Internas" actionLabel="Nueva Comunicación" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<ComunicacionItem>
          loading={loading}
          loadingLabel="Cargando comunicaciones..."
          emptyLabel="No hay comunicaciones registradas."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (c) => c.id },
            { header: 'Asunto', render: (c) => <strong>{c.asunto}</strong> },
            { header: 'Mensaje', render: (c) => c.mensaje, className: 'table-cell-truncate' },
            { header: 'Destinatario', render: (c) => c.destinatario },
            { header: 'Fecha', render: (c) => (c.fecha_publicacion ? new Date(c.fecha_publicacion).toLocaleDateString() : '') },
            { header: 'Estado', render: (c) => <span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>{c.activo ? 'Activa' : 'Inactiva'}</span> },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Comunicación' : 'Nueva Comunicación'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Publicar'}>
          <div className="form-group"><label>Asunto</label><input className="form-control" value={form.asunto} onChange={(e) => setForm({ ...form, asunto: e.target.value })} required /></div>
          <div className="form-group"><label>Mensaje</label><textarea className="form-control" rows={3} value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Destinatario</label>
              <select className="form-control" value={form.destinatario} onChange={(e) => setForm({ ...form, destinatario: e.target.value })}>
                <option value="todos">Todos</option>
                <option value="gerentes">Gerentes</option>
                <option value="personal">Personal</option>
                <option value="socios">Socios</option>
              </select>
            </div>
            <div className="form-group"><label>Estado</label>
              <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}>
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </select>
            </div>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Comunicacion;
