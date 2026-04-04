import React, { useState, useEffect } from 'react';
import './App.css';

import Home from './components/Home';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';
import Gallery from './components/Gallery';
import Nosotros from './components/Nosotros';
import Servicios from './components/Servicios';
import Ubicacion from './components/Ubicacion';

function App() {
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlHeader = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlHeader);
    return () => window.removeEventListener('scroll', controlHeader);
  }, [lastScrollY]);

  const headerStyles = {
    header: {
      background: 'linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)',
      padding: '15px 20px',
      position: 'fixed',
      top: showHeader ? '0' : '-100px',
      left: '0',
      right: '0',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      transition: 'top 0.4s ease-in-out',
      borderBottom: '2px solid #d4a373',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    },
    logo: {
      height: '70px',
      width: 'auto',
      borderRadius: '50%',
      border: '3px solid #d4a373',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'transform 0.3s ease',
    },
    nav: {
      display: 'flex',
      gap: '30px',
    },
    link: {
      color: '#f5e8d3',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '500',
      padding: '8px 16px',
      borderRadius: '30px',
      transition: 'all 0.3s ease',
      letterSpacing: '0.5px',
      border: '1px solid transparent',
    },
  };

  return (
    <div className="App">
      <header style={headerStyles.header}>
        <div style={headerStyles.container}>
          <img
            src="/imagenes/local/logo-lugar.jpg"
            alt="Huarmy Coffee Logo"
            style={headerStyles.logo}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          />
          <nav style={headerStyles.nav}>
            {['inicio', 'menu', 'nosotros', 'servicios', 'ubicacion', 'contact'].map((item) => (
              <a
                key={item}
                href={`#${item}`}
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
                {item === 'inicio'
                  ? 'Inicio'
                  : item === 'menu'
                    ? 'MenÃº'
                    : item === 'nosotros'
                      ? 'Nuestra Historia'
                      : item === 'servicios'
                        ? 'Servicios'
                        : item === 'ubicacion'
                          ? 'UbicaciÃ³n'
                          : 'Contacto'}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div style={{ height: '140px' }} />

      <Home />
      <Menu />
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
          Todos los derechos reservados Â© 2026 Huarmy Coffee
        </p>
      </footer>
    </div>
  );
}

export default App;
