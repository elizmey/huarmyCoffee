import React from 'react';
import { BadgePercent } from 'lucide-react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Promocion = {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: string;
  precio: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  url_imagen: string;
  activo: boolean;
};
type Form = { titulo: string; descripcion: string; tipo: string; precio: string; fecha_inicio: string; fecha_fin: string; url_imagen: string; activo: boolean };

const emptyForm: Form = { titulo: '', descripcion: '', tipo: 'Corporativa', precio: '', fecha_inicio: '', fecha_fin: '', url_imagen: '', activo: true };

const PromocionesAdmin = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Promocion, Form>('/promociones', emptyForm, {
      toForm: (p) => ({
        titulo: p.titulo,
        descripcion: p.descripcion || '',
        tipo: p.tipo || 'Corporativa',
        precio: p.precio ? String(p.precio) : '',
        fecha_inicio: p.fecha_inicio ? String(p.fecha_inicio).split('T')[0] : '',
        fecha_fin: p.fecha_fin ? String(p.fecha_fin).split('T')[0] : '',
        url_imagen: p.url_imagen || '',
        activo: p.activo,
      }),
      toPayload: (form) => ({
        ...form,
        precio: form.precio === '' ? 0 : parseFloat(form.precio),
        fecha_inicio: form.fecha_inicio || null,
        fecha_fin: form.fecha_fin || null,
      }),
      confirmDelete: () => '¿Eliminar esta promoción?',
    });

  return (
    <div>
      <AdminHeaderBar title="Promociones y Paquetes" actionLabel="Nueva Promoción" onAction={openCreate} />
      <div className="admin-card">
        <h2><BadgePercent size={18} className="inline-icon" />Ofertas Publicadas</h2>
        <CrudTable<Promocion>
          loading={loading}
          loadingLabel="Cargando promociones..."
          emptyLabel="No hay promociones registradas."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (p) => p.id },
            { header: 'Título', render: (p) => <strong>{p.titulo}</strong> },
            { header: 'Tipo', render: (p) => p.tipo },
            { header: 'Precio', render: (p) => (p.precio ? `$${p.precio}` : '—') },
            {
              header: 'Vigencia',
              className: 'text-sm',
              render: (p) => (
                <>
                  {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : '—'}
                  {p.fecha_fin ? ` a ${new Date(p.fecha_fin).toLocaleDateString()}` : ''}
                </>
              ),
            },
            { header: 'Estado', render: (p) => <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>{p.activo ? 'Activa' : 'Inactiva'}</span> },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Promoción' : 'Nueva Promoción'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Crear Promoción'}>
          <div className="form-group"><label>Título</label><input className="form-control" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} required /></div>
          <div className="form-group"><label>Descripción</label><textarea className="form-control" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-group"><label>Tipo</label>
              <select className="form-control" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                <option value="Corporativa">Corporativa</option>
                <option value="Celebración">Celebración</option>
                <option value="Logística">Logística</option>
              </select>
            </div>
            <div className="form-group"><label>Precio (USD)</label><input className="form-control" type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Fecha Inicio</label><input className="form-control" type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} /></div>
            <div className="form-group"><label>Fecha Fin</label><input className="form-control" type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>URL de Imagen</label><input className="form-control" value={form.url_imagen} onChange={(e) => setForm({ ...form, url_imagen: e.target.value })} placeholder="https://..." /></div>
          <div className="form-group"><label>Estado</label>
            <select className="form-control" value={form.activo ? 'true' : 'false'} onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}>
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default PromocionesAdmin;
