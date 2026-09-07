import React from 'react';
import { Settings } from 'lucide-react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type ConfiguracionItem = { id: number; clave: string; valor: string; descripcion: string };
type Form = { clave: string; valor: string; descripcion: string };

const emptyForm: Form = { clave: '', valor: '', descripcion: '' };

const Configuracion = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<ConfiguracionItem, Form>('/configuracion', emptyForm, {
      toForm: (c) => ({ clave: c.clave, valor: c.valor, descripcion: c.descripcion || '' }),
      confirmDelete: () => '¿Eliminar esta configuración?',
    });

  return (
    <div>
      <AdminHeaderBar title="Configuración del Sitio" actionLabel="Nueva Configuración" onAction={openCreate} />
      <div className="admin-card">
        <h2><Settings size={18} className="inline-icon" />Parámetros Generales</h2>
        <p className="section-hint">
          La clave <strong>mostrar_trabaja</strong> (valor <strong>true</strong>/<strong>false</strong>) controla la sección "Trabaja con Nosotros" en el sitio público.
        </p>
        <CrudTable<ConfiguracionItem>
          loading={loading}
          loadingLabel="Cargando configuración..."
          emptyLabel="No hay parámetros de configuración."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (c) => c.id },
            { header: 'Clave', render: (c) => <code className="code-chip">{c.clave}</code> },
            { header: 'Valor', render: (c) => <strong>{c.valor}</strong> },
            { header: 'Descripción', render: (c) => c.descripcion, className: 'text-sm text-muted' },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Configuración' : 'Nueva Configuración'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Guardar'}>
          <div className="form-group"><label>Clave</label><input className="form-control" value={form.clave} onChange={(e) => setForm({ ...form, clave: e.target.value })} placeholder="ej: mostrar_trabaja" required /></div>
          <div className="form-group"><label>Valor</label><input className="form-control" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="true / false / texto" required /></div>
          <div className="form-group"><label>Descripción</label><input className="form-control" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></div>
        </CrudModal>
      )}
    </div>
  );
};

export default Configuracion;
