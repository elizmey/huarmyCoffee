import React from 'react';
import { X } from 'lucide-react';

type Props = {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  error?: string;
  children: React.ReactNode;
};

const CrudModal = ({ title, onClose, onSubmit, submitLabel, error, children }: Props) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h2>{title}</h2>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}><X size={16} /></button>
      </div>
      {error && <p className="modal-error" role="alert">{error}</p>}
      <form onSubmit={onSubmit}>
        {children}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary">{submitLabel}</button>
        </div>
      </form>
    </div>
  </div>
);

export default CrudModal;
