import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, Home as HomeIcon } from 'lucide-react';
import './App.css';

import Home from './components/Home';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';
import Gallery from './components/Gallery';
import Nosotros from './components/Nosotros';
import Servicios from './components/Servicios';
import Promociones from './components/Promociones';
import Ubicacion from './components/Ubicacion';
import Cotizador from './components/Cotizador';

import AdminLayout from './admin/AdminLayout';
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import Clientes from './admin/Clientes';
import Proveedores from './admin/Proveedores';
import Socios from './admin/Socios';
import Sucursales from './admin/Sucursales';
import Inventarios from './admin/Inventarios';
import Capacidad from './admin/Capacidad';
import Comunicacion from './admin/Comunicacion';
import Scorecard from './admin/Scorecard';
import Catalogo from './admin/Catalogo';
import Citas from './admin/Citas';
import Pedidos from './admin/Pedidos';
import Usuarios from './admin/Usuarios';
import ForgotPassword from './admin/ForgotPassword';
import ResetPassword from './admin/ResetPassword';

import Portal from './portal/Portal';
import AccessibilityWidget from './components/AccessibilityWidget';
import { useTranslation } from './i18n';

function PublicSite() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (window.matchMedia('(min-width: 1100px)').matches) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  const navItems = [
    { id: 'inicio', label: t('inicio') },
    { id: 'menu', label: t('menu') },
    { id: 'promociones', label: t('promociones') },
    { id: 'nosotros', label: t('nosotros') },
    { id: 'servicios', label: t('servicios') },
    { id: 'cotizador', label: t('cotizador_nav') },
    { id: 'ubicacion', label: t('ubicacion') },
    { id: 'contact', label: t('contacto') },
    { id: 'portal', label: t('portal'), href: '/portal' },
    { id: 'admin', icon: HomeIcon, label: t('admin'), href: '/admin/login' },
  ];

  return (
    <div className="App" role="application">
      <a href="#main-content" className="skip-link" tabIndex={0}>
        {t('skip_link')}
      </a>
      <header className="site-header">
        <div className="site-header-container">
          <a href="/" aria-label="Ir al inicio">
            <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" className="site-logo" />
          </a>
          <div className="site-header-actions">
            <nav className="site-nav desktop-nav" aria-label="Navegación principal">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href || `#${item.id}`}
                  className={`site-nav-link${item.icon ? ' site-nav-link--icon' : ''}${item.id === 'portal' ? ' site-nav-link--accent' : ''}`}
                  aria-label={item.icon ? item.label : undefined}
                  title={item.icon ? item.label : undefined}
                >
                  {item.icon ? <item.icon size={18} strokeWidth={2.2} aria-hidden="true" /> : item.label}
                </a>
              ))}
            </nav>
          </div>
          <button
            type="button"
            className="site-mobile-button mobile-menu-button"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-site-nav"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2.2} /> : <MenuIcon size={22} strokeWidth={2.2} />}
          </button>
        </div>
      </header>

      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <aside id="mobile-site-nav" className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-menu-drawer-title">
          <span>{t('drawer_title')}</span>
          <button type="button" className="mobile-menu-close-btn" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)}>
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>
        <nav className="mobile-menu-nav">
          {navItems.map((item) => (
            <a key={item.id} href={item.href || `#${item.id}`} className="mobile-menu-link" aria-label={item.icon ? item.label : undefined} onClick={() => setMobileMenuOpen(false)}>
              {item.icon ? <item.icon size={18} aria-hidden="true" /> : item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div id="site-content">
        <div className="site-content-spacer" />
        <main id="main-content">
          <Home /><Menu /><Promociones /><Nosotros /><Servicios /><Cotizador /><Testimonials /><Gallery /><Ubicacion /><Contact />
        </main>

        <footer className="site-footer">
          <p>{t('derechos')}</p>
        </footer>
      </div>
      <AccessibilityWidget />
    </div>
  );
}

function App() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<Catalogo />} />
          <Route path="servicios" element={<Navigate to="/admin/menu" replace />} />
          <Route path="galeria" element={<Navigate to="/admin/menu" replace />} />
          <Route path="promociones" element={<Navigate to="/admin/menu" replace />} />
          <Route path="roles" element={<Navigate to="/admin" replace />} />
          <Route path="citas" element={<Citas />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="socios" element={<Socios />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="personal" element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="inventarios" element={<Inventarios />} />
          <Route path="capacidad" element={<Capacidad />} />
          <Route path="comunicacion" element={<Comunicacion />} />
          <Route path="scorecard" element={<Scorecard />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    );
  }

  if (location.pathname.startsWith('/portal')) {
    return <Portal />;
  }

  return <PublicSite />;
}

export default App;
