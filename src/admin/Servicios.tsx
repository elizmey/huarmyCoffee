import React, { useEffect, useState } from 'react';
import { Plus, Trash2, FolderPlus } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Categoria = { id: number; nombre: string; descripcion: string };
type Servicio = { id: number; nombre: string; descripcion: string; precio: number; duracion: number | null; categoria_id: number | null; activo: boolean };
type ServiceForm = { nombre: string; descripcion: string; precio: string; duracion: string; categoria_id: string; activo: boolean };
type CategoryForm = { nombre: string; descripcion: string };

const emptyServiceForm: ServiceForm = { nombre: '', descripcion: '', precio: '', duracion: '', categoria_id: '', activo: true };
const emptyCategoryForm: CategoryForm = { nombre: '', descripcion: '' };

const ServiciosAdmin = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingService, setEditingService] = useState<Servicio | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyServiceForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resS, resC] = await Promise.all([adminFetchList<Servicio>('/servicios'), adminFetchList<Categoria>('/categorias')]);
      setServicios(resS);
      setCategorias(resC);
    } catch (e) {
      console.error('Error fetching services/categories', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateService = () => {
    setEditingService(null);
    setServiceForm({ ...emptyServiceForm, categoria_id: categorias[0] ? String(categorias[0].id) : '' });
    setShowServiceModal(true);
  };

  const openEditService = (s: Servicio) => {
    setEditingService(s);
    setServiceForm({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      precio: String(s.precio),
      duracion: s.duracion ? String(s.duracion) : '',
      categoria_id: s.categoria_id ? String(s.categoria_id) : '',
      activo: s.activo,
    });
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      nombre: serviceForm.nombre,
      descripcion: serviceForm.descripcion,
      precio: parseFloat(serviceForm.precio),
      duracion: serviceForm.duracion ? parseInt(serviceForm.duracion, 10) : null,
      categoria_id: serviceForm.categoria_id ? parseInt(serviceForm.categoria_id, 10) : null,
      activo: serviceForm.activo,
    };
    try {
      if (editingService) {
        await adminFetch(`/servicios/${editingService.id}`, { method: 'PATCH', body: JSON.stringify(data) });
      } else {
        await adminFetch('/servicios', { method: 'POST', body: JSON.stringify(data) });
      }
      setShowServiceModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleServiceDelete = async (s: Servicio) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await adminFetch(`/servicios/${s.id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/categorias', { method: 'POST', body: JSON.stringify(categoryForm) });
      setCategoryForm(emptyCategoryForm);
      setShowCategoryModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategoryDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría? Esto podría afectar a los servicios asociados.')) return;
    try {
      await adminFetch(`/categorias/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryName = (catId: number | null) => categorias.find((c) => c.id === catId)?.nombre || 'Sin categoría';

  if (loading) {
    return <div className="admin-state admin-state--page">Cargando catálogo...</div>;
  }

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Servicios y Productos</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}><FolderPlus size={16} /> Categorías</button>
          <button className="btn btn-primary" onClick={openCreateService}><Plus size={16} /> Nuevo Servicio</button>
        </div>
      </div>

      <div className="panel-columns">
        <div className="admin-card">
          <h2>Lista de Servicios</h2>
          <CrudTable<Servicio>
            emptyLabel="No hay servicios registrados."
            items={servicios}
            onEdit={openEditService}
            onDelete={handleServiceDelete}
            columns={[
              { header: 'ID', render: (s) => s.id },
              {
                header: 'Nombre',
                render: (s) => (
                  <>
                    <strong>{s.nombre}</strong>
                    <p className="table-cell-subtitle">{s.descripcion}</p>
                  </>
                ),
              },
              { header: 'Precio', render: (s) => Number(s.precio).toFixed(2) },
              { header: 'Duración', render: (s) => (s.duracion ? `${s.duracion} min` : '—') },
              { header: 'Categoría', render: (s) => <span className="badge badge-success">{getCategoryName(s.categoria_id)}</span> },
              { header: 'Estado', render: (s) => <span className={`badge ${s.activo ? 'badge-success' : 'badge-danger'}`}>{s.activo ? 'Activo' : 'Inactivo'}</span> },
            ]}
          />
        </div>

        <div className="admin-card">
          <h2>Categorías</h2>
          <div className="mt-15">
            {categorias.map((c) => (
              <div key={c.id} className="panel-list-row">
                <div>
                  <strong className="panel-list-title">{c.nombre}</strong>
                  <p className="cell-time">{c.descripcion || 'Sin descripción'}</p>
                </div>
                <button className="btn btn-danger btn-sm btn-xs" onClick={() => handleCategoryDelete(c.id)}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showServiceModal && (
        <CrudModal
          title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          onClose={() => setShowServiceModal(false)}
          onSubmit={handleServiceSubmit}
          submitLabel={editingService ? 'Guardar Cambios' : 'Crear Servicio'}
        >
          <div className="form-group">
            <label>Nombre</label>
            <input className="form-control" value={serviceForm.nombre} onChange={(e) => setServiceForm({ ...serviceForm, nombre: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea className="form-control" rows={3} value={serviceForm.descripcion} onChange={(e) => setServiceForm({ ...serviceForm, descripcion: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio ($)</label>
              <input className="form-control" type="number" step="0.01" value={serviceForm.precio} onChange={(e) => setServiceForm({ ...serviceForm, precio: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Duración (minutos)</label>
              <input className="form-control" type="number" value={serviceForm.duracion} onChange={(e) => setServiceForm({ ...serviceForm, duracion: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select className="form-control" value={serviceForm.categoria_id} onChange={(e) => setServiceForm({ ...serviceForm, categoria_id: e.target.value })} required>
                <option value="" disabled>Selecciona una categoría</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group checkbox-field">
              <label>
                <input type="checkbox" checked={serviceForm.activo} onChange={(e) => setServiceForm({ ...serviceForm, activo: e.target.checked })} />
                ¿Activo / Disponible?
              </label>
            </div>
          </div>
        </CrudModal>
      )}

      {showCategoryModal && (
        <CrudModal title="Nueva Categoría" onClose={() => setShowCategoryModal(false)} onSubmit={handleCategorySubmit} submitLabel="Crear Categoría">
          <div className="form-group">
            <label>Nombre de Categoría</label>
            <input className="form-control" value={categoryForm.nombre} onChange={(e) => setCategoryForm({ ...categoryForm, nombre: e.target.value })} required placeholder="Ej: Especialidades, Entradas..." />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea className="form-control" rows={2} value={categoryForm.descripcion} onChange={(e) => setCategoryForm({ ...categoryForm, descripcion: e.target.value })} />
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default ServiciosAdmin;
