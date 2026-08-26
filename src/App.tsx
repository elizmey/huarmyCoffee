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
import MisionVision from './admin/MisionVision';
import ForgotPassword from './admin/ForgotPassword';
import ResetPassword from './admin/ResetPassword';

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

  const headerStyles: Record<string, React.CSSProperties> = {
    header: { background: 'linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)', padding: '10px 18px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', borderBottom: '2px solid #d4a373' },
    container: { maxWidth: 1440, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 },
    logo: { height: 58, width: 'auto', borderRadius: '50%', border: '3px solid #d4a373' },
    nav: { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
    mobileButton: { display: 'none', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 999, border: '1px solid rgba(245,232,211,0.24)', background: 'rgba(255,255,255,0.06)', color: '#f5e8d3', cursor: 'pointer', padding: 0 },
    link: { color: '#f5e8d3', textDecoration: 'none', fontSize: 15, fontWeight: 500, padding: '8px 14px', borderRadius: 30, transition: 'all 0.3s', border: '1px solid transparent' },
  };

  const navItems = [
    { id: 'inicio', label: t('inicio') },
    { id: 'menu', label: t('menu') },
    { id: 'promociones', label: t('promociones') },
    { id: 'nosotros', label: t('nosotros') },
    { id: 'servicios', label: t('servicios') },
    { id: 'ubicacion', label: t('ubicacion') },
    { id: 'contact', label: t('contacto') },
    ...(mostrarTrabaja ? [{ id: 'work', label: t('trabaja') }] : []),
    { id: 'portal', label: t('portal'), href: '/portal' },
    { id: 'admin', icon: HomeIcon, label: t('admin'), href: '/admin/login' },
  ];

  return (
    <div className="App" role="application">
      <a href="#main-content" style={{ position: 'absolute', left: '-999px', top: 0, zIndex: 9999, padding: '10px', background: '#d4a373', color: '#2c1a0f' }} tabIndex={0}>
        {t('skip_link')}
      </a>
      <header style={headerStyles.header}>
        <div style={headerStyles.container}>
          <a href="/" aria-label="Ir al inicio">
            <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" style={headerStyles.logo} />
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <nav style={headerStyles.nav} className="desktop-nav" aria-label="Navegación principal">
              {navItems.map((item) => (
                <a key={item.id} href={item.href || `#${item.id}`} style={headerStyles.link} aria-label={item.icon ? item.label : undefined} title={item.icon ? item.label : undefined}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#d4a373'; e.currentTarget.style.color = '#2c1a0f'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#f5e8d3'; }}>
                  {item.icon ? <item.icon size={18} strokeWidth={2.2} aria-hidden="true" /> : item.label}
                </a>
              ))}
            </nav>
          </div>
          <button type="button" style={headerStyles.mobileButton} className="mobile-menu-button" aria-label="Abrir menú" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} tabIndex={0}>
            <MenuIcon size={22} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <div className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      <aside className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f5e8d3', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          <span>{t('drawer_title')}</span>
          <button type="button" style={{ width: 42, height: 42, border: '1px solid rgba(245,232,211,0.18)', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#f5e8d3', cursor: 'pointer' }} aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)}>
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {navItems.map((item) => (
            <a key={item.id} href={item.href || `#${item.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 16, textDecoration: 'none', color: '#f5e8d3', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,232,211,0.12)', fontWeight: 600 }} aria-label={item.icon ? item.label : undefined} onClick={() => setMobileMenuOpen(false)}>
              {item.icon ? <item.icon size={18} aria-hidden="true" /> : item.label}
            </a>
          ))}
        </nav>
      </aside>

      <div id="site-content">
        <div style={{ height: 84 }} />
        <main id="main-content">
          <Home /><Menu /><Promociones /><Nosotros /><Servicios /><Testimonials /><Gallery /><Ubicacion /><Contact />{mostrarTrabaja && <Trabaja />}
        </main>

        <footer style={{ textAlign: 'center', padding: '30px', background: '#2c1a0f', color: '#d4a373', borderTop: '2px solid #d4a373' }}>
          <p style={{ margin: 0, fontSize: '14px', letterSpacing: '1px' }}>{t('derechos')}</p>
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
          <Route path="mision-vision" element={<MisionVision />} />
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
