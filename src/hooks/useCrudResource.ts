import { useCallback, useEffect, useState } from 'react';
import { adminFetch, adminFetchList } from '../api/adminApi';

type CrudOptions<T, F> = {
  /** Construye el estado del formulario a partir de un registro existente (para editar). */
  toForm?: (item: T) => F;
  /** Transforma el formulario en el payload que se envía al API. */
  toPayload?: (form: F, editing: T | null) => unknown;
  /** Mensaje de confirmación antes de eliminar. */
  confirmDelete?: (item: T) => string;
};

/**
 * Encapsula el ciclo fetch/crear/editar/eliminar que se repetía casi
 * idéntico en cada pantalla del panel admin (Clientes, Proveedores, Socios, etc.).
 */
export function useCrudResource<T extends { id: number | string }, F>(
  endpoint: string,
  emptyForm: F,
  options: CrudOptions<T, F> = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<F>(emptyForm);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminFetchList<T>(endpoint));
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setForm(options.toForm ? options.toForm(item) : (item as unknown as F));
    setError('');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = options.toPayload ? options.toPayload(form, editing) : form;
      if (editing) {
        await adminFetch(`${endpoint}/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await adminFetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowModal(false);
      await fetchItems();
    } catch (err) {
      setError((err as Error).message || 'No se pudo guardar el registro');
    }
  };

  const handleDelete = async (item: T) => {
    const message = options.confirmDelete ? options.confirmDelete(item) : '¿Eliminar este registro?';
    if (!window.confirm(message)) return;
    try {
      await adminFetch(`${endpoint}/${item.id}`, { method: 'DELETE' });
      await fetchItems();
    } catch (err) {
      alert((err as Error).message || 'No se pudo eliminar el registro');
    }
  };

  return {
    items,
    loading,
    showModal,
    editing,
    form,
    setForm,
    error,
    fetchItems,
    openCreate,
    openEdit,
    closeModal,
    handleSubmit,
    handleDelete,
  };
}
