import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

import { apiUrl } from '../api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + localStorage.getItem('adminToken')
});

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCitas, resClientes, resSuc, resServ] = await Promise.all([
        fetch(apiUrl('/citas'), { headers: getHeaders() }).then(r => r.json()),
        fetch(apiUrl('/clientes'), { headers: getHeaders() }).then(r => r.json()),
        fetch(apiUrl('/sucursales'), { headers: getHeaders() }).then(r => r.json()),
        fetch(apiUrl('/servicios'), { headers: getHeaders() }).then(r => r.json())
      ]);
      setCitas(Array.isArray(resCitas) ? resCitas : []);
      setClientes(Array.isArray(resClientes) ? resClientes : []);
      setSucursales(Array.isArray(resSuc) ? resSuc : []);
      setServicios(Array.isArray(resServ) ? resServ : []);
    } catch (e) {
      console.error('Error fetching appointments data', e);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (id) => {
    const item = clientes.find(c => c.id === id);
    return item ? item.nombre : 'Cliente Desconocido';
  };

  const getClientContact = (id) => {
    const item = clientes.find(c => c.id === id);
    return item ? `${item.telefono || ''} ${item.email || ''}` : '';
  };

  const getBranchName = (id) => {
    const item = sucursales.find(s => s.id === id);
    return item ? item.nombre : 'Sucursal Desconocida';
  };

  const getServiceName = (id) => {
    const item = servicios.find(s => s.id === id);
    return item ? item.nombre : 'Servicio Desconocido';
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(apiUrl(`/citas/${id}`), {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ estado: status })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'confirmada':
        return <span className="badge badge-success">Confirmada</span>;
      case 'cancelada':
        return <span className="badge badge-danger">Cancelada</span>;
      case 'completada':
        return <span className="badge" style={{ backgroundColor: '#2980b9', color: 'white' }}>Completada</span>;
      default:
        return <span className="badge badge-warning">Pendiente</span>;
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60, color: '#8a7a6a' }}>Cargando citas...</div>;
  }

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Reservas y Citas</h1>
      </div>

      <div className="admin-card">
        <h2>Gestión de Citas Empresariales</h2>
        <table className="admin-table" style={{ marginTop: 15 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Sucursal</th>
              <th>Servicio</th>
              <th>Fecha y Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><strong>{getClientName(c.cliente_id)}</strong></td>
                <td style={{ fontSize: 12, color: '#8a7a6a' }}>{getClientContact(c.cliente_id)}</td>
                <td>{getBranchName(c.sucursal_id)}</td>
                <td>{getServiceName(c.servicio_id)}</td>
                <td>
                  <strong>{new Date(c.fecha_hora).toLocaleDateString()}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#aaa' }}>{new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td>{getStatusBadge(c.estado)}</td>
                <td>
                  {c.estado === 'pendiente' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(c.id, 'confirmada')} title="Confirmar Cita">
                        <Check size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(c.id, 'cancelada')} title="Cancelar Cita">
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {c.estado === 'confirmada' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(c.id, 'completada')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={12} /> Completar
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(c.id, 'cancelada')}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  {c.estado !== 'pendiente' && c.estado !== 'confirmada' && (
                    <span style={{ fontSize: 12, color: '#ccc' }}>Acción finalizada</span>
                  )}
                </td>
              </tr>
            ))}
            {citas.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No se encontraron registros de citas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Citas;





