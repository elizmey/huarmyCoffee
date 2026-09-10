import React, { useEffect, useState } from 'react';
import { Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';
import CrudModal from './components/CrudModal';

type Foto = {
  id: number;
  titulo: string;
  url_imagen: string;
  categoria: string;
  orden: number;
  autor?: string | null;
  comentario?: string | null;
  calificacion?: number | null;
};
type Form = { titulo: string; url_imagen: string; categoria: string; orden: number; autor: string; comentario: string; calificacion: number };

const emptyForm: Form = { titulo: '', url_imagen: '', categoria: 'local', orden: 0, autor: '', comentario: '', calificacion: 5 };

const GaleriaAdmin = () => {
  const [items, setItems] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList<Foto>('/galeria'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/galeria', {
        method: 'POST',
        body: JSON.stringify({ ...form, orden: parseInt(String(form.orden || 0), 10) }),
      });
      setShowModal(false);
      setForm(emptyForm);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar esta imagen de la galería?')) return;
    try {
      await adminFetch(`/galeria/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const sortedItems = [...items].sort((a, b) => a.orden - b.orden || a.id - b.id);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...sortedItems];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    const updated = list.map((item, idx) => ({ ...item, orden: idx + 1 }));

    setDraggedIndex(index);
    setItems(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      await Promise.all(
        sortedItems.map((item, index) => adminFetch(`/galeria/${item.id}`, { method: 'PATCH', body: JSON.stringify({ orden: index + 1 }) }))
      );
      fetchData();
    } catch (e) {
      console.error('Error al guardar el nuevo orden:', e);
    }
  };

  if (loading) {
    return <div className="admin-state admin-state--page">Cargando galería...</div>;
  }

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Galería de Fotos</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Añadir Foto</button>
      </div>

      <div className="admin-card">
        <h2>Imágenes y Reseñas Publicadas</h2>
        <p className="section-hint section-hint--tight">
          💡 Arrastra y suelta las tarjetas para reordenar las imágenes. El nuevo orden se guardará automáticamente al soltarlas.
        </p>
        <div className="gallery-grid">
          {sortedItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`gallery-card ${draggedIndex === index ? 'dragging' : ''}`}
            >
              <div className="gallery-card-image-wrap">
                <img
                  src={item.url_imagen}
                  alt={item.titulo?.trim() || 'Imagen de la galería'}
                  className="gallery-card-image"
                  onError={(e) => { e.currentTarget.src = '/imagenes/local/logo-lugar.jpg'; }}
                />
                <span className={`badge badge-corner ${item.categoria === 'reseña' ? 'badge-warning' : 'badge-success'}`}>
                  {item.categoria}
                </span>
              </div>
              <div className="gallery-card-body">
                <div>
                  <strong className="gallery-card-title">
                    {item.titulo || 'Sin título'}
                  </strong>
                  <span className="text-xs text-faint">Orden: {item.orden}</span>
                  {item.categoria === 'reseña' && item.autor && (
                    <span className="text-xs text-faint">{item.autor} · {'★'.repeat(item.calificacion || 0)}</span>
                  )}
                </div>
                <div className="gallery-card-footer">
                  <div className="gallery-card-move" title="Arrastrar para mover">
                    <GripVertical size={16} className="cursor-grab" />
                    <span className="text-xs">Mover</span>
                  </div>
                  <button className="btn btn-danger btn-sm btn-xs" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sortedItems.length === 0 && (
            <div className="gallery-empty">
              <ImageIcon size={48} className="admin-empty-icon" />
              <p>No hay imágenes en la galería. Añade una nueva URL de imagen.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CrudModal title="Nueva Foto en Galería" onClose={() => setShowModal(false)} onSubmit={handleSubmit} submitLabel="Añadir Foto">
          <div className="form-group">
            <label>Título / Descripción corta</label>
            <input className="form-control" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Interior del café, Café de especialidad..." />
          </div>
          <div className="form-group">
            <label>URL de Imagen</label>
            <input className="form-control" type="text" value={form.url_imagen} onChange={(e) => setForm({ ...form, url_imagen: e.target.value })} placeholder="Ej: /imagenes/local/foto.jpg o URL de Unsplash" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Categoría</label>
              <select className="form-control" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} required>
                <option value="local">Local (Ambiente/Espacio)</option>
                <option value="reseña">Reseña de Cliente</option>
              </select>
            </div>
            <div className="form-group">
              <label>Orden (Prioridad de visualización)</label>
              <input className="form-control" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value === '' ? 0 : parseInt(e.target.value, 10) })} />
            </div>
          </div>

          {form.categoria === 'reseña' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre del cliente</label>
                  <input className="form-control" value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} placeholder="Ej: Gabriela Torres" />
                </div>
                <div className="form-group">
                  <label>Calificación (1-5)</label>
                  <select className="form-control" value={form.calificacion} onChange={(e) => setForm({ ...form, calificacion: parseInt(e.target.value, 10) })}>
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrella{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Comentario / Reseña</label>
                <textarea className="form-control" rows={3} value={form.comentario} onChange={(e) => setForm({ ...form, comentario: e.target.value })} placeholder="Texto de la reseña del cliente..." />
              </div>
            </>
          )}
        </CrudModal>
      )}
    </div>
  );
};

export default GaleriaAdmin;
