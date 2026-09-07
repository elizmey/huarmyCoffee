import React, { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { adminFetch, adminFetchList } from '../api/adminApi';
import CrudTable from './components/CrudTable';

type Cliente = { id: number; nombre: string; telefono: string; email: string };
type Sucursal = { id: number; nombre: string };
type Servicio = { id: number; nombre: string };
type Cita = { id: number; cliente_id: number; sucursal_id: number; servicio_id: number; fecha_hora: string; estado: string };

const getStatusBadge = (estado: string) => {
  switch (estado) {
    case 'confirmada':
      return <span className="badge badge-success">Confirmada</span>;
    case 'cancelada':
      return <span className="badge badge-danger">Cancelada</span>;
    case 'completada':
      return <span className="badge badge-complete">Completada</span>;
    default:
      return <span className="badge badge-warning">Pendiente</span>;
  }
};

const Citas = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCitas, resClientes, resSuc, resServ] = await Promise.all([
        adminFetchList<Cita>('/citas'),
        adminFetchList<Cliente>('/clientes'),
        adminFetchList<Sucursal>('/sucursales'),
        adminFetchList<Servicio>('/servicios'),
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

  const getClientName = (id: number) => clientes.find((c) => c.id === id)?.nombre || 'Cliente Desconocido';
  const getClientContact = (id: number) => { const c = clientes.find((c) => c.id === id); return c ? `${c.telefono || ''} ${c.email || ''}` : ''; };
  const getBranchName = (id: number) => sucursales.find((s) => s.id === id)?.nombre || 'Sucursal Desconocida';
  const getServiceName = (id: number) => servicios.find((s) => s.id === id)?.nombre || 'Servicio Desconocido';

  const updateStatus = async (id: number, estado: string) => {
    try {
      await adminFetch(`/citas/${id}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-header-bar"><h1>Reservas y Citas</h1></div>
      <div className="admin-card">
        <h2>Gestión de Citas Empresariales</h2>
        <CrudTable<Cita>
          loading={loading}
          loadingLabel="Cargando citas..."
          emptyLabel="No se encontraron registros de citas."
          items={citas}
          columns={[
            { header: 'ID', render: (c) => c.id },
            { header: 'Cliente', render: (c) => <strong>{getClientName(c.cliente_id)}</strong> },
            { header: 'Contacto', render: (c) => getClientContact(c.cliente_id), className: 'text-sm text-muted' },
            { header: 'Sucursal', render: (c) => getBranchName(c.sucursal_id) },
            { header: 'Servicio', render: (c) => getServiceName(c.servicio_id) },
            {
              header: 'Fecha y Hora',
              render: (c) => (
                <>
                  <strong>{new Date(c.fecha_hora).toLocaleDateString()}</strong>
                  <p className="cell-time">{new Date(c.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </>
              ),
            },
            { header: 'Estado', render: (c) => getStatusBadge(c.estado) },
          ]}
          renderActions={(c) => {
            if (c.estado === 'pendiente') {
              return (
                <span className="row-actions">
                  <button className="btn btn-success btn-sm" onClick={() => updateStatus(c.id, 'confirmada')} title="Confirmar Cita"><Check size={14} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(c.id, 'cancelada')} title="Cancelar Cita"><X size={14} /></button>
                </span>
              );
            }
            if (c.estado === 'confirmada') {
              return (
                <span className="row-actions">
                  <button className="btn btn-secondary btn-sm btn-with-label" onClick={() => updateStatus(c.id, 'completada')}><Check size={12} /> Completar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => updateStatus(c.id, 'cancelada')}><X size={14} /></button>
                </span>
              );
            }
            return <span className="text-sm text-empty">Acción finalizada</span>;
          }}
        />
      </div>
    </div>
  );
};

export default Citas;
