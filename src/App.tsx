import React, { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu as MenuIcon, X, Home as HomeIcon } from 'lucide-react';
import './App.css';

import Home from './components/Home';
import Menu from './components/Menu';
import Promociones from './components/Promociones';
import Nosotros from './components/Nosotros';
import Servicios from './components/Servicios';
import DeferSection from './components/DeferSection';
import AccessibilityWidget from './components/AccessibilityWidget';
import { useTranslation } from './i18n';

const Cotizador = React.lazy(() => import('./components/Cotizador'));
const Testimonials = React.lazy(() => import('./components/Testimonials'));
const Gallery = React.lazy(() => import('./components/Gallery'));
const Ubicacion = React.lazy(() => import('./components/Ubicacion'));
const Contact = React.lazy(() => import('./components/Contact'));
const Portal = React.lazy(() => import('./portal/Portal'));
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

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
            <img
              src="/imagenes/local/logo-lugar-sm.webp"
              alt={t('logo_alt')}
              className="site-logo"
              width={52}
              height={52}
              decoding="async"
            />
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
          <Home /><Menu /><Promociones /><Nosotros /><Servicios />
          <Suspense fallback={null}>
            <DeferSection minHeight={420}><Cotizador /></DeferSection>
            <DeferSection minHeight={480}><Testimonials /></DeferSection>
            <DeferSection minHeight={520}><Gallery /></DeferSection>
            <DeferSection minHeight={520}><Ubicacion /></DeferSection>
            <DeferSection minHeight={640}><Contact /></DeferSection>
          </Suspense>
        </main>

        <footer className="site-footer">
          <p>{t('derechos')}</p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return (
      <Suspense fallback={<div className="route-fallback">Cargando…</div>}>
        <AdminApp />
      </Suspense>
    );
  }

  if (location.pathname.startsWith('/portal')) {
    return (
      <Suspense fallback={<div className="route-fallback">Cargando…</div>}>
        <Portal />
        <AccessibilityWidget />
      </Suspense>
    );
  }

  return (
    <>
      <PublicSite />
      <AccessibilityWidget />
    </>
  );
}

export default App;
