import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, FolderPlus } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const ServiciosAdmin = () => {
  const [servicios, setServicios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Forms state
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    categoria_id: '',
    activo: true
  });

  const [categoryForm, setCategoryForm] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resS, resC] = await Promise.all([
        adminFetchList('/servicios'),
        adminFetchList('/categorias'),
      ]);
      setServicios(Array.isArray(resS) ? resS : []);
      setCategorias(Array.isArray(resC) ? resC : []);
    } catch (e) {
      console.error('Error fetching services/categories', e);
    } finally {
      setLoading(false);
    }
  };

  // Services Actions
  const openCreateService = () => {
    setEditingService(null);
    setServiceForm({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion: '',
      categoria_id: categorias[0]?.id || '',
      activo: true
    });
    setShowServiceModal(true);
  };

  const openEditService = (s) => {
    setEditingService(s);
    setServiceForm({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      precio: s.precio,
      duracion: s.duracion || '',
      categoria_id: s.categoria_id || '',
      activo: s.activo
    });
    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...serviceForm,
      precio: parseFloat(serviceForm.precio),
      duracion: serviceForm.duracion ? parseInt(serviceForm.duracion) : null,
      categoria_id: serviceForm.categoria_id ? parseInt(serviceForm.categoria_id) : null
    };

    try {
      if (editingService) {
        await adminFetch(`/servicios/${editingService.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data)
        });
      } else {
        await adminFetch('/servicios', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }
      setShowServiceModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleServiceDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      try {
        await adminFetch(`/servicios/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Categories Actions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      await adminFetch('/categorias', {
        method: 'POST',
        body: JSON.stringify(categoryForm)
      });
      setCategoryForm({ nombre: '', descripcion: '' });
      setShowCategoryModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCategoryDelete = async (id) => {
    if (window.confirm('¿Eliminar esta categoría? Esto podría afectar a los servicios asociados.')) {
      try {
        await adminFetch(`/categorias/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getCategoryName = (catId) => {
    const cat = categorias.find(c => c.id === catId);
    return cat ? cat.nombre : 'Sin categoría';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8a7a6a' }}>Cargando catálogo...</div>;
  }

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Servicios y Productos</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowCategoryModal(true)}>
            <FolderPlus size={16} /> Categorías
          </button>
          <button className="btn btn-primary" onClick={openCreateService}>
            <Plus size={16} /> Nuevo Servicio
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20 }}>
        {/* Tabla de Servicios */}
        <div className="admin-card">
          <h2>Lista de Servicios</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>
                    <strong>{s.nombre}</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8a7a6a' }}>{s.descripcion}</p>
                  </td>
                  <td>{parseFloat(s.precio).toFixed(2)}</td>
                  <td>{s.duracion ? `${s.duracion} min` : '—'}</td>
                  <td><span className="badge badge-success">{getCategoryName(s.categoria_id)}</span></td>
                  <td>
                    <span className={`badge ${s.activo ? 'badge-success' : 'badge-danger'}`}>
                      {s.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-edit btn-sm" onClick={() => openEditService(s)}>
                      <Edit2 size={14} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleServiceDelete(s.id)} style={{ marginLeft: 6 }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel lateral de Categorías */}
        <div className="admin-card">
          <h2>Categorías</h2>
          <div style={{ marginTop: 15 }}>
            {categorias.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0ebe5' }}>
                <div>
                  <strong style={{ color: '#2c1a0f', fontSize: 13 }}>{c.nombre}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aaa' }}>{c.descripcion || 'Sin descripción'}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleCategoryDelete(c.id)} style={{ padding: '3px 6px' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Servicio */}
      {showServiceModal && (
        <div className="modal-overlay" onClick={() => setShowServiceModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowServiceModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleServiceSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input className="form-control" value={serviceForm.nombre} onChange={e => setServiceForm({ ...serviceForm, nombre: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea className="form-control" rows={3} value={serviceForm.descripcion} onChange={e => setServiceForm({ ...serviceForm, descripcion: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio ($)</label>
                  <input className="form-control" type="number" step="0.01" value={serviceForm.precio} onChange={e => setServiceForm({ ...serviceForm, precio: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Duración (minutos)</label>
                  <input className="form-control" type="number" value={serviceForm.duracion} onChange={e => setServiceForm({ ...serviceForm, duracion: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select className="form-control" value={serviceForm.categoria_id} onChange={e => setServiceForm({ ...serviceForm, categoria_id: e.target.value })} required>
                    <option value="" disabled>Selecciona una categoría</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: 25 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={serviceForm.activo} onChange={e => setServiceForm({ ...serviceForm, activo: e.target.checked })} />
                    ¿Activo / Disponible?
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingService ? 'Guardar Cambios' : 'Crear Servicio'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoría */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Nueva Categoría</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowCategoryModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Nombre de Categoría</label>
                <input className="form-control" value={categoryForm.nombre} onChange={e => setCategoryForm({ ...categoryForm, nombre: e.target.value })} required placeholder="Ej: Especialidades, Entradas..." />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea className="form-control" rows={2} value={categoryForm.descripcion} onChange={e => setCategoryForm({ ...categoryForm, descripcion: e.target.value })} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear Categoría</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosAdmin;


