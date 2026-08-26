import React, { useEffect, useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';

const emptyForm = { cliente_id: '', sucursal_id: '', servicio_id: '', fecha_hora: '' };

const Citas = () => {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCitas, resClientes, resSuc, resServ] = await Promise.all([
        adminFetchList('/citas'),
        adminFetchList('/clientes'),
        adminFetchList('/sucursales'),
        adminFetchList('/servicios'),
      ]);
      setCitas(resCitas);
      setClientes(resClientes);
      setSucursales(resSuc);
      setServicios(resServ);
    } catch (e) {
      console.error('Error fetching appointments data', e);
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (id) => clientes.find(c => c.id === id)?.nombre || 'Cliente Desconocido';
  const getClientContact = (id) => {
    const item = clientes.find(c => c.id === id);
    return item ? `${item.telefono || ''} ${item.email || ''}` : '';
  };
  const getBranchName = (id) => sucursales.find(s => s.id === id)?.nombre || 'Sucursal Desconocida';
  const getServiceName = (id) => servicios.find(s => s.id === id)?.nombre || 'Servicio Desconocido';

  const updateStatus = async (id, status) => {
    try {
      await adminFetch(`/citas/${id}`, { method: 'PATCH', body: JSON.stringify({ estado: status }) });
      fetchData();
    } catch (e) {
      alert((e as Error).message);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await adminFetch('/citas', {
        method: 'POST',
        body: JSON.stringify({
          cliente_id: parseInt(form.cliente_id, 10),
          sucursal_id: parseInt(form.sucursal_id, 10),
          servicio_id: parseInt(form.servicio_id, 10),
          fecha_hora: form.fecha_hora,
          estado: 'pendiente',
        }),
      });
      setShowModal(false);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      alert((err as Error).message);
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Nueva cita</button>
      </div>
      <div className="admin-card">
        <h2>Gestión de Citas Empresariales</h2>
        <table className="admin-table" style={{ marginTop: 15 }}>
          <thead>
            <tr>
              <th>ID</th><th>Cliente</th><th>Contacto</th><th>Sucursal</th><th>Servicio</th><th>Fecha y Hora</th><th>Estado</th><th>Acciones</th>
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
                      <button className="btn btn-success btn-sm" onClick={() => updateStatus(c.id, 'confirmada')} title="Confirmar Cita"><Check size={14} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(c.id, 'cancelada')} title="Cancelar Cita"><X size={14} /></button>
                    </div>
                  )}
                  {c.estado === 'confirmada' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(c.id, 'completada')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Completar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => updateStatus(c.id, 'cancelada')}><X size={14} /></button>
                    </div>
                  )}
                  {c.estado !== 'pendiente' && c.estado !== 'confirmada' && (
                    <span style={{ fontSize: 12, color: '#ccc' }}>Acción finalizada</span>
                  )}
                </td>
              </tr>
            ))}
            {citas.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#ccc' }}>No se encontraron registros de citas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Nueva cita</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Cliente</label>
                <select className="form-control" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })} required>
                  <option value="">Selecciona</option>
                  {clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Sucursal</label>
                <select className="form-control" value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })} required>
                  <option value="">Selecciona</option>
                  {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Servicio</label>
                <select className="form-control" value={form.servicio_id} onChange={(e) => setForm({ ...form, servicio_id: e.target.value })} required>
                  <option value="">Selecciona</option>
                  {servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Fecha y hora</label>
                <input className="form-control" type="datetime-local" value={form.fecha_hora} onChange={(e) => setForm({ ...form, fecha_hora: e.target.value })} required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Citas;
