import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, Store, Package, Building2, LogOut, Coffee, CalendarRange, Menu, X, ShieldCheck, Handshake, MessageSquare, BarChart3, ShoppingBag } from 'lucide-react';
import { logoutAdmin } from '../services/authService';
import { canAccessModule, currentRole, ROLE_LABELS } from './roleAccess';
import './admin.css';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/scorecard', icon: BarChart3, label: 'Tablero BSC' },
  { to: '/admin/menu', icon: Coffee, label: 'Menú' },
  { to: '/admin/citas', icon: CalendarRange, label: 'Citas' },
  { to: '/admin/pedidos', icon: ShoppingBag, label: 'Pedidos y caja' },
  { to: '/admin/clientes', icon: Users, label: 'Clientes' },
  { to: '/admin/proveedores', icon: Truck, label: 'Proveedores' },
  { to: '/admin/socios', icon: Handshake, label: 'Socios' },
  { to: '/admin/sucursales', icon: Store, label: 'Sucursales' },
  { to: '/admin/inventarios', icon: Package, label: 'Inventarios' },
  { to: '/admin/capacidad', icon: Building2, label: 'Capacidad' },
  { to: '/admin/comunicacion', icon: MessageSquare, label: 'Comunicación' },
  { to: '/admin/usuarios', icon: ShieldCheck, label: 'Usuarios' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const location = useLocation();
  const role = currentRole();

  if (!token && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  const path = location.pathname.replace(/\/$/, '') || '/admin';
  if (token && !canAccessModule(path, role)) {
    return <Navigate to="/admin" replace />;
  }

  const visibleNav = navItems.filter((item) => canAccessModule(item.to, role));

  const handleLogout = async () => {
    await logoutAdmin();
    window.location.href = '/admin/login';
  };

  return (
    <div className="admin-layout">
      <button
        className="admin-sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>

      {sidebarOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} role="navigation" aria-label="Menú de administración">
        <div className="admin-sidebar-header">
          <button
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
          <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #d4a373', marginBottom: 8 }} />
          <h2>Huarmy Admin</h2>
          <p style={{ fontSize: 11, opacity: 0.6 }}>{ROLE_LABELS[user.rol] || user.rol}</p>
        </div>
        <nav className="admin-sidebar-nav">
          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              aria-label={item.label}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          <button className="admin-nav-item logout" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontFamily: 'inherit' }}>
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </nav>
      </aside>
      <main className="admin-main" role="main" aria-label="Contenido principal">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
