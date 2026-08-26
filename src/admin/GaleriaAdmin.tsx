import React, { useEffect, useState } from 'react';
import { Plus, Trash2, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import { apiUrl } from '../api';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
});

const GaleriaAdmin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [form, setForm] = useState({
    titulo: '',
    url_imagen: '',
    categoria: 'local',
    orden: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/galeria'), { headers: getHeaders() });
      const json = await res.json();
      setItems(Array.isArray(json) ? json : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(apiUrl('/galeria'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...form,
          orden: parseInt(String(form.orden || 0), 10)
        })
      });
      setShowModal(false);
      setForm({ titulo: '', url_imagen: '', categoria: 'local', orden: 0 });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta imagen de la galería?')) {
      try {
        await fetch(apiUrl(`/galeria/${id}`), { method: 'DELETE', headers: getHeaders() });
        fetchData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Sort items locally by orden then by id
  const sortedItems = [...items].sort((a, b) => a.orden - b.orden || a.id - b.id);

  // HTML5 Drag and Drop Event Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...sortedItems];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);

    // Locally reassign orders based on their new list position
    const updated = list.map((item, idx) => ({
      ...item,
      orden: idx + 1
    }));

    setDraggedIndex(index);
    // Since items doesn't need to match the sorting state instantly,
    // setting items to the updated list will trigger a re-render.
    setItems(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    try {
      // Persist the updated orders to database
      await Promise.all(
        sortedItems.map((item, index) =>
          fetch(apiUrl(`/galeria/${item.id}`), {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ orden: index + 1 })
          })
        )
      );
      fetchData();
    } catch (e) {
      console.error('Error al guardar el nuevo orden:', e);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8a7a6a' }}>Cargando galería...</div>;
  }

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Galería de Fotos</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Añadir Foto
        </button>
      </div>

      <div className="admin-card">
        <h2>Imágenes y Reseñas Publicadas</h2>
        <p style={{ color: '#8a7a6a', fontSize: 13, marginBottom: 15 }}>
          💡 Arrastra y suelta las tarjetas para reordenar las imágenes. El nuevo orden se guardará automáticamente al soltarlas.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: 20, 
          marginTop: 20 
        }}>
          {sortedItems.map((item, index) => (
            <div 
              key={item.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              style={{ 
                background: 'white', 
                borderRadius: 8, 
                border: '1px solid #e8e0d8', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'grab',
                opacity: draggedIndex === index ? 0.4 : 1,
                transform: draggedIndex === index ? 'scale(0.98)' : 'scale(1)',
                transition: 'transform 0.2s, opacity 0.2s, box-shadow 0.2s',
                boxShadow: draggedIndex === index ? '0 10px 20px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ height: 140, overflow: 'hidden', background: '#eee', position: 'relative' }}>
                <img 
                  src={item.url_imagen} 
                  alt={item.titulo} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                  onError={(e) => {
                    e.currentTarget.src = '/imagenes/local/logo-lugar.jpg';
                  }}
                />
                <span 
                  className={`badge ${item.categoria === 'reseña' ? 'badge-warning' : 'badge-success'}`}
                  style={{ position: 'absolute', top: 8, right: 8 }}
                >
                  {item.categoria}
                </span>
              </div>
              <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: 13, color: '#2c1a0f', display: 'block', height: 36, overflow: 'hidden' }}>
                    {item.titulo || 'Sin título'}
                  </strong>
                  <span style={{ fontSize: 11, color: '#aaa' }}>Orden: {item.orden}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, borderTop: '1px solid #f5ebe6', paddingTop: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8a7a6a' }} title="Arrastrar para mover">
                    <GripVertical size={16} style={{ cursor: 'grab' }} />
                    <span style={{ fontSize: 11 }}>Mover</span>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} style={{ padding: '4px 6px' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sortedItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#ccc' }}>
              <ImageIcon size={48} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p>No hay imágenes en la galería. Añade una nueva URL de imagen.</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Nueva Foto en Galería</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título / Descripción corta</label>
                <input className="form-control" value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Interior del café, Café de especialidad..." />
              </div>
              <div className="form-group">
                <label>URL de Imagen</label>
                <input className="form-control" type="text" value={form.url_imagen} onChange={e => setForm({ ...form, url_imagen: e.target.value })} placeholder="Ej: /imagenes/local/foto.jpg o URL de Unsplash" required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select className="form-control" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} required>
                    <option value="local">Local (Ambiente/Espacio)</option>
                    <option value="reseña">Reseña de Cliente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Orden (Prioridad de visualización)</label>
                  <input className="form-control" type="number" value={form.orden} onChange={e => setForm({ ...form, orden: e.target.value === '' ? 0 : parseInt(e.target.value, 10) })} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Añadir Foto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaAdmin;


