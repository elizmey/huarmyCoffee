import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

export type Column<T> = {
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;
};

type Props<T extends { id: number | string }> = {
  columns: Column<T>[];
  items: T[];
  loading?: boolean;
  loadingLabel?: string;
  emptyLabel: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  /** Reemplaza las acciones por defecto (editar/eliminar) por una celda a medida. */
  renderActions?: (item: T) => React.ReactNode;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
};

function CrudTable<T extends { id: number | string }>({
  columns,
  items,
  loading,
  loadingLabel = 'Cargando...',
  emptyLabel,
  onEdit,
  onDelete,
  renderActions,
  canEdit,
  canDelete,
}: Props<T>) {
  const showActions = !!(onEdit || onDelete || renderActions);

  if (loading) {
    return <div className="admin-state">{loadingLabel}</div>;
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          {columns.map((c, i) => <th key={i}>{c.header}</th>)}
          {showActions && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            {columns.map((c, i) => <td key={i} className={c.className}>{c.render(item)}</td>)}
            {showActions && (
              <td>
                {renderActions ? renderActions(item) : (
                  <span className="row-actions">
                    {onEdit && (!canEdit || canEdit(item)) && (
                      <button className="btn btn-edit btn-sm" onClick={() => onEdit(item)}><Edit2 size={14} /></button>
                    )}
                    {onDelete && (!canDelete || canDelete(item)) && (
                      <button className="btn btn-danger btn-sm" onClick={() => onDelete(item)}><Trash2 size={14} /></button>
                    )}
                  </span>
                )}
              </td>
            )}
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td colSpan={columns.length + (showActions ? 1 : 0)} className="admin-state admin-state--tight">
              {emptyLabel}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default CrudTable;
