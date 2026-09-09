import React from 'react';
import { Target } from 'lucide-react';
import { useCrudResource } from '../hooks/useCrudResource';
import AdminHeaderBar from './components/AdminHeaderBar';
import CrudTable from './components/CrudTable';
import CrudModal from './components/CrudModal';

type Indicador = { id: number; nombre: string; perspectiva: string; valor_actual: number; meta: number; estandar?: number; unidad: string };
type Form = { nombre: string; perspectiva: string; valor_actual: string; meta: string; estandar: string; unidad: string };

const PERSPECTIVAS = ['financiera', 'cliente', 'procesos', 'aprendizaje'];
const PERSPECTIVA_LABELS: Record<string, string> = { financiera: 'Financiera', cliente: 'Cliente', procesos: 'Procesos', aprendizaje: 'Aprendizaje' };

const emptyForm: Form = { nombre: '', perspectiva: 'financiera', valor_actual: '', meta: '', estandar: '', unidad: '%' };

const getCumplimiento = (item: Indicador) => {
  const meta = Number(item.meta);
  const actual = Number(item.valor_actual);
  const estandar = Number(item.estandar);
  if (!meta) return { value: '—', cls: '', estandarOk: null as boolean | null };
  const pct = Math.round((actual / meta) * 100);
  return {
    value: `${pct}%`,
    cls: pct >= 80 ? 'badge-success' : pct >= 50 ? 'badge-warning' : 'badge-danger',
    estandarOk: estandar ? actual >= estandar : null,
  };
};

const Scorecard = () => {
  const { items, loading, showModal, editing, form, setForm, error, openCreate, openEdit, closeModal, handleSubmit, handleDelete } =
    useCrudResource<Indicador, Form>('/indicadores', emptyForm, {
      toForm: (i) => ({
        nombre: i.nombre,
        perspectiva: i.perspectiva || 'financiera',
        valor_actual: String(i.valor_actual ?? ''),
        meta: String(i.meta ?? ''),
        estandar: String(i.estandar ?? ''),
        unidad: i.unidad || '%',
      }),
      toPayload: (form) => ({
        ...form,
        valor_actual: parseFloat(form.valor_actual) || 0,
        meta: parseFloat(form.meta) || 0,
        estandar: parseFloat(form.estandar) || 0,
      }),
      confirmDelete: () => '¿Eliminar este indicador?',
    });

  return (
    <div>
      <AdminHeaderBar title="Tablero de comando · BSC" actionLabel="Nuevo Indicador" onAction={openCreate} />
      <p className="section-hint">
        Balanced Scorecard con las cuatro perspectivas. La de <strong>Procesos</strong> cubre el flujo operativo: reserva → cliente → cita → inventario → capacidad.
        El <em>estándar</em> es el mínimo aceptable; la <em>meta</em> es el objetivo gerencial. Cumplimiento ≥ 80% se considera en estándar de tablero.
      </p>

      {PERSPECTIVAS.map((perspectiva) => {
        const group = items.filter((i) => (i.perspectiva || 'financiera') === perspectiva);
        return (
          <div className="admin-card mt-16" key={perspectiva}>
            <div className="admin-card-header">
              <h2><Target size={18} className="inline-icon" />Perspectiva {PERSPECTIVA_LABELS[perspectiva]}</h2>
            </div>
            {!loading && group.length === 0 ? (
              <p className="admin-state--empty">Sin indicadores para esta perspectiva.</p>
            ) : (
              <CrudTable<Indicador>
                loading={loading}
                loadingLabel="Cargando indicadores..."
                emptyLabel="Sin indicadores para esta perspectiva."
                items={group}
                onEdit={openEdit}
                onDelete={handleDelete}
                columns={[
                  { header: 'ID', render: (i) => i.id },
                  { header: 'Indicador', render: (i) => <strong>{i.nombre}</strong> },
                  { header: 'Valor', render: (i) => i.valor_actual },
                  { header: 'Estándar', render: (i) => i.estandar || '—' },
                  { header: 'Meta', render: (i) => i.meta },
                  { header: 'Unidad', render: (i) => i.unidad },
                  {
                    header: 'Cumplimiento',
                    render: (i) => {
                      const c = getCumplimiento(i);
                      return (
                        <>
                          <span className={`badge ${c.cls}`}>{c.value}</span>
                          {c.estandarOk === true && <span className="badge badge-success" style={{ marginLeft: 6 }}>Estándar OK</span>}
                          {c.estandarOk === false && <span className="badge badge-danger" style={{ marginLeft: 6 }}>Bajo estándar</span>}
                        </>
                      );
                    },
                  },
                ]}
              />
            )}
          </div>
        );
      })}

      {showModal && (
        <CrudModal title={editing ? 'Editar Indicador' : 'Nuevo Indicador'} onClose={closeModal} onSubmit={handleSubmit} error={error} submitLabel={editing ? 'Guardar Cambios' : 'Crear Indicador'}>
          <div className="form-group"><label>Indicador</label><input className="form-control" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></div>
          <div className="form-group"><label>Perspectiva</label>
            <select className="form-control" value={form.perspectiva} onChange={(e) => setForm({ ...form, perspectiva: e.target.value })}>
              {PERSPECTIVAS.map((p) => <option key={p} value={p}>{PERSPECTIVA_LABELS[p]}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Valor Actual</label><input className="form-control" type="number" step="0.01" value={form.valor_actual} onChange={(e) => setForm({ ...form, valor_actual: e.target.value })} required /></div>
            <div className="form-group"><label>Estándar (mínimo)</label><input className="form-control" type="number" step="0.01" value={form.estandar} onChange={(e) => setForm({ ...form, estandar: e.target.value })} /></div>
            <div className="form-group"><label>Meta</label><input className="form-control" type="number" step="0.01" value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} required /></div>
          </div>
          <div className="form-group"><label>Unidad</label>
            <select className="form-control" value={form.unidad} onChange={(e) => setForm({ ...form, unidad: e.target.value })}>
              <option value="%">Porcentaje</option>
              <option value="$">Dólares</option>
              <option value="unidades">Unidades</option>
              <option value="días">Días</option>
            </select>
          </div>
        </CrudModal>
      )}
    </div>
  );
};

export default Scorecard;
