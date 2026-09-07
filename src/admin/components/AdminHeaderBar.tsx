import React from 'react';
import { Plus, LucideIcon } from 'lucide-react';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
};

const AdminHeaderBar = ({ title, actionLabel, onAction, icon: Icon = Plus }: Props) => (
  <div className="admin-header-bar">
    <h1>{title}</h1>
    {actionLabel && onAction && (
      <button className="btn btn-primary" onClick={onAction}><Icon size={16} /> {actionLabel}</button>
    )}
  </div>
);

export default AdminHeaderBar;
