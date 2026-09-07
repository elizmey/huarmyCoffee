import React, { useEffect, useState } from 'react';
import { adminFetchList } from '../api/adminApi';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Sucursal = { id: number; nombre: string };
type Proveedor = { id: number; nombre: string };
type Item = { id: number; producto: string; cantidad: number; unidad: string; stock_minimo: number; sucursal_id: number | null; proveedor_id: number | null };
type Form = { producto: string; cantidad: string; unidad: string; stock_minimo: string; sucursal_id: string; proveedor_id: string };

const emptyForm: Form = { producto: '', cantidad: '', unidad: 'kg', stock_minimo: '', sucursal_id: '', proveedor_id: '' };

const Inventarios = () => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  useEffect(() => {
    adminFetchList<Sucursal>('/sucursales').then(setSucursales).catch(() => setSucursales([]));
    adminFetchList<Proveedor>('/proveedores').then(setProveedores).catch(() => setProveedores([]));
  }, []);

  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Item, Form>('/inventarios', emptyForm, {
      toForm: (i) => ({
        producto: i.producto,
        cantidad: String(i.cantidad ?? ''),
        unidad: i.unidad,
        stock_minimo: String(i.stock_minimo ?? ''),
        sucursal_id: i.sucursal_id ? String(i.sucursal_id) : '',
        proveedor_id: i.proveedor_id ? String(i.proveedor_id) : '',
      }),
      toPayload: (form) => ({
        producto: form.producto,
        cantidad: parseFloat(form.cantidad) || 0,
        unidad: form.unidad,
        stock_minimo: parseFloat(form.stock_minimo) || 0,
        sucursal_id: form.sucursal_id === '' ? null : parseInt(form.sucursal_id, 10),
        proveedor_id: form.proveedor_id === '' ? null : parseInt(form.proveedor_id, 10),
      }),
      confirmDelete: () => '¿Eliminar este item?',
    });

  return (
    <div>
      <AdminHeaderBar title="Inventarios" actionLabel="Nuevo Item" onAction={openCreate} />
      <div className="admin-card">
        <CrudTable<Item>
          loading={loading}
          loadingLabel="Cargando inventario..."
          emptyLabel="No hay items en inventario. Registra productos reales desde aquí."
          items={items}
          onEdit={openEdit}
          onDelete={handleDelete}
          columns={[
            { header: 'ID', render: (i) => i.id },
            { header: 'Producto', render: (i) => i.producto },
            { header: 'Cantidad', render: (i) => i.cantidad },
            { header: 'Unidad', render: (i) => i.unidad },
            { header: 'Stock Mín.', render: (i) => i.stock_minimo },
            { header: 'Sucursal', render: (i) => sucursales.find((s) => s.id === i.sucursal_id)?.nombre || '—' },
            { header: 'Proveedor', render: (i) => proveedores.find((p) => p.id === i.proveedor_id)?.nombre || '—' },
            {
              header: 'Estado',
              render: (i) => {
                const bajoStock = i.cantidad <= i.stock_minimo;
                return <span className={`badge ${bajoStock ? 'badge-danger' : 'badge-success'}`}>{bajoStock ? 'Stock Bajo' : 'OK'}</span>;
              },
            },
          ]}
        />
      </div>
      {showModal && (
        <CrudModal title={editing ? 'Editar Item' : 'Nuevo Item'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar' : 'Crear'}>
          <div className="form-group"><label>Producto</label><input className="form-control" value={form.producto} onChange={(e) => setForm({ ...form, producto: e.target.value })} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Cantidad</label><input className="form-control" type="number" step="0.01" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} required /></div>
            <div className="form-group"><label>Unidad</label><input className="form-control" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })} /></div>
            <div className="form-group"><label>Stock mínimo</label><input className="form-control" type="number" step="0.01" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Sucursal</label>
              <select className="form-control" value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Proveedor</label>
              <select className="form-control" value={form.proveedor_id} onChange={(e) => setForm({ ...form, proveedor_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Inventarios;
