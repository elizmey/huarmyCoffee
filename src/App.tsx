import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
import Personal from './admin/Personal';
import Inventarios from './admin/Inventarios';
import Capacidad from './admin/Capacidad';
import Comunicacion from './admin/Comunicacion';
import Scorecard from './admin/Scorecard';
import ServiciosAdmin from './admin/Servicios';
import Citas from './admin/Citas';
import Postulaciones from './admin/Postulaciones';
import GaleriaAdmin from './admin/GaleriaAdmin';
import Configuracion from './admin/Configuracion';
import PromocionesAdmin from './admin/PromocionesAdmin';
import Usuarios from './admin/Usuarios';

import Portal from './portal/Portal';
import Trabaja from './components/Trabaja';
import AccessibilityWidget from './components/AccessibilityWidget';
import { useTranslation } from './i18n';
import { apiUrl } from './api';

function PublicSite() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [mostrarTrabaja, setMostrarTrabaja] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/public/configuracion'))
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const item = data.find(c => c.clave === 'mostrar_trabaja');
          if (item) {
            setMostrarTrabaja(item.valor === 'true');
          }
        }
      })
      .catch(err => console.warn('Error fetching config for mostrar_trabaja', err));
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const handleKeyDown = (event) => { if (event.key === 'Escape') setMobileMenuOpen(false); };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navItems = [
    { id: 'inicio', label: t('inicio') },
    { id: 'menu', label: t('menu') },
    { id: 'promociones', label: t('promociones') },
    { id: 'nosotros', label: t('nosotros') },
    { id: 'servicios', label: t('servicios') },
    { id: 'cotizador', label: t('cotizador_nav') },
    { id: 'ubicacion', label: t('ubicacion') },
    { id: 'contact', label: t('contacto') },
    ...(mostrarTrabaja ? [{ id: 'work', label: t('trabaja') }] : []),
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
                <a key={item.id} href={item.href || `#${item.id}`} className="site-nav-link" aria-label={item.icon ? item.label : undefined} title={item.icon ? item.label : undefined}>
                  {item.icon ? <item.icon size={18} strokeWidth={2.2} aria-hidden="true" /> : item.label}
                </a>
              ))}
            </nav>
          </div>
          <button type="button" className="site-mobile-button mobile-menu-button" aria-label="Abrir menú" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} tabIndex={0}>
            <MenuIcon size={22} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <aside className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
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
          <Home /><Menu /><Promociones /><Nosotros /><Servicios /><Cotizador /><Testimonials /><Gallery /><Ubicacion /><Contact />{mostrarTrabaja && <Trabaja />}
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
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="servicios" element={<ServiciosAdmin />} />
          <Route path="citas" element={<Citas />} />
          <Route path="postulaciones" element={<Postulaciones />} />
          <Route path="galeria" element={<GaleriaAdmin />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="socios" element={<Socios />} />
          <Route path="sucursales" element={<Sucursales />} />
          <Route path="personal" element={<Personal />} />
          <Route path="inventarios" element={<Inventarios />} />
          <Route path="capacidad" element={<Capacidad />} />
          <Route path="comunicacion" element={<Comunicacion />} />
          <Route path="scorecard" element={<Scorecard />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="promociones" element={<PromocionesAdmin />} />
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
