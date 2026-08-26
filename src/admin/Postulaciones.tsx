import React, { useEffect, useState } from 'react';
import { Check, X, Briefcase, Inbox } from 'lucide-react';

import { apiUrl } from '../api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
});

const Postulaciones = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/postulaciones'), { headers: getHeaders() });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateEstado = async (id, estado) => {
    try {
      await fetch(apiUrl(`/postulaciones/${id}`), { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ estado }) });
    } catch (e) {
      console.error(e);
    }
    fetchItems();
  };

  const deleteItem = async (id) => {
    if (window.confirm('¿Eliminar esta postulación?')) {
      try {
        await fetch(apiUrl(`/postulaciones/${id}`), { method: 'DELETE', headers: getHeaders() });
      } catch (e) {
        console.error(e);
      }
      fetchItems();
    }
  };

  const estadoBadge = (estado) => {
    switch (estado) {
      case 'aprobada':
        return <span className="badge badge-success">Aprobada</span>;
      case 'rechazada':
        return <span className="badge badge-danger">Rechazada</span>;
      default:
        return <span className="badge badge-warning">Pendiente</span>;
    }
  };

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Postulaciones</h1>
      </div>
      <div className="admin-card">
        <h2><Briefcase size={18} style={{ marginRight: 8, color: '#d4a373' }} />Solicitudes de Empleo</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#8a7a6a' }}>Cargando postulaciones...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#ccc' }}>
            <Inbox size={48} style={{ opacity: 0.3, marginBottom: 10 }} />
            <p>No hay postulaciones recibidas.</p>
          </div>
        ) : (
          <table className="admin-table" style={{ marginTop: 15 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Mensaje</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td><strong>{item.nombre}</strong></td>
                  <td>{item.correo}</td>
                  <td>{item.telefono}</td>
                  <td style={{ maxWidth: 280, fontSize: 12, color: '#5a4a3a' }}>{item.mensaje}</td>
                  <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</td>
                  <td>{estadoBadge(item.estado)}</td>
                  <td>
                    {item.estado !== 'aprobada' && (
                      <button className="btn btn-success btn-sm" onClick={() => updateEstado(item.id, 'aprobada')} title="Aprobar postulación"><Check size={14} /></button>
                    )}
                    {item.estado !== 'rechazada' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => updateEstado(item.id, 'rechazada')} title="Rechazar postulación" style={{ marginLeft: 6 }}><X size={14} /></button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item.id)} title="Eliminar postulación" style={{ marginLeft: 6 }}><X size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Postulaciones;
