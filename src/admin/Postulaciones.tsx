import React, { useEffect, useState } from 'react';
import { Check, X, Briefcase } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';
import CrudTable from './components/CrudTable';

type Postulacion = { id: number; nombre: string; correo: string; telefono: string; mensaje: string; estado: string; fecha: string | null; created_at: string };

const estadoBadge = (estado: string) => {
  switch (estado) {
    case 'aprobada':
      return <span className="badge badge-success">Aprobada</span>;
    case 'rechazada':
      return <span className="badge badge-danger">Rechazada</span>;
    default:
      return <span className="badge badge-warning">Pendiente</span>;
  }
};

const Postulaciones = () => {
  const [items, setItems] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList<Postulacion>('/postulaciones'));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id: number, estado: string) => {
    try {
      await adminFetch(`/postulaciones/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
    } catch (e) {
      console.error(e);
    }
    fetchItems();
  };

  const deleteItem = async (id: number) => {
    if (!window.confirm('¿Eliminar esta postulación?')) return;
    try {
      await adminFetch(`/postulaciones/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    fetchItems();
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Postulaciones</h1></div>
      <div className="admin-card">
        <h2><Briefcase size={18} className="inline-icon" />Solicitudes de Empleo</h2>
        <CrudTable<Postulacion>
          loading={loading}
          loadingLabel="Cargando postulaciones..."
          emptyLabel="No hay postulaciones recibidas."
          items={items}
          columns={[
            { header: 'ID', render: (i) => i.id },
            { header: 'Nombre', render: (i) => <strong>{i.nombre}</strong> },
            { header: 'Correo', render: (i) => i.correo },
            { header: 'Teléfono', render: (i) => i.telefono },
            { header: 'Mensaje', render: (i) => i.mensaje, className: 'table-cell-truncate table-cell-truncate--sm text-sm text-dark-muted' },
            { header: 'Fecha', render: (i) => new Date(i.fecha || i.created_at).toLocaleDateString() },
            { header: 'Estado', render: (i) => estadoBadge(i.estado) },
          ]}
          renderActions={(item) => (
            <span className="row-actions">
              {item.estado !== 'aprobada' && (
                <button className="btn btn-success btn-sm" onClick={() => updateEstado(item.id, 'aprobada')} title="Aprobar postulación"><Check size={14} /></button>
              )}
              {item.estado !== 'rechazada' && (
                <button className="btn btn-secondary btn-sm" onClick={() => updateEstado(item.id, 'rechazada')} title="Rechazar postulación"><X size={14} /></button>
              )}
              <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)} title="Eliminar postulación"><X size={14} /></button>
            </span>
          )}
        />
      </div>
    </div>
  );
};

export default Postulaciones;
