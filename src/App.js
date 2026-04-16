import React, { useEffect, useState } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
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

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const headerStyles = {
    header: {
      background: 'linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)',
      padding: '10px 18px',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      transition: 'top 0.4s ease-in-out',
      borderBottom: '2px solid #d4a373',
    },
    container: {
      maxWidth: '1440px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px',
    },
    logo: {
      height: '58px',
      width: 'auto',
      borderRadius: '50%',
      border: '3px solid #d4a373',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s ease',
    },
    nav: {
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
    mobileButton: {
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: '999px',
      border: '1px solid rgba(245, 232, 211, 0.24)',
      background: 'rgba(255, 255, 255, 0.06)',
      color: '#f5e8d3',
      cursor: 'pointer',
      padding: 0,
      flex: '0 0 auto',
    },
    link: {
      color: '#f5e8d3',
      textDecoration: 'none',
      fontSize: '15px',
      fontWeight: '500',
      padding: '8px 14px',
      borderRadius: '30px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.5px',
      border: '1px solid transparent',
    },
  };

  const navItems = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'menu', label: 'Men\u00fa' },
    { id: 'promociones', label: 'Promociones' },
    { id: 'nosotros', label: 'Nuestra Historia' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'ubicacion', label: 'Ubicaci\u00f3n' },
    { id: 'contact', label: 'Contacto' },
    { id: 'portal', label: 'Retornar al Portal' },
  ];

  return (
    <div className="App">
      <header style={headerStyles.header}>
        <div style={headerStyles.container} className="app-header-inner">
          <img
            src="/imagenes/local/logo-lugar.jpg"
            alt="Huarmy Coffee Logo"
            style={headerStyles.logo}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          />
          <nav style={headerStyles.nav} className="desktop-nav">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={headerStyles.link}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d4a373';
                  e.target.style.color = '#2c1a0f';
                  e.target.style.borderColor = '#d4a373';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#f5e8d3';
                  e.target.style.borderColor = 'transparent';
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className="mobile-menu-button"
            style={headerStyles.mobileButton}
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon size={22} strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <div style={{ height: '84px' }} />

      <div
        className={`mobile-menu-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <aside className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-menu-drawer-header">
          <span>Menú</span>
          <button
            type="button"
            className="mobile-menu-close"
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>
        <nav className="mobile-menu-nav">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="mobile-menu-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      <Home />
      <Menu />
      <Promociones />
      <Nosotros />
      <Servicios />
      <Testimonials />
      <Gallery />
      <Ubicacion />
      <Contact />

      <footer
        style={{
          textAlign: 'center',
          padding: '30px',
          background: '#2c1a0f',
          color: '#d4a373',
          borderTop: '2px solid #d4a373',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', letterSpacing: '1px' }}>
          Todos los derechos reservados \u00a9 2026 Huarmy Coffee
        </p>
      </footer>
    </div>
  );
}

export default App;
