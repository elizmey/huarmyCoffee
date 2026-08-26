import React, { useState } from 'react';
import ServiciosAdmin from './Servicios';
import GaleriaAdmin from './GaleriaAdmin';
import PromocionesAdmin from './PromocionesAdmin';

const TABS = [
  { key: 'servicios', label: 'Servicios y Productos' },
  { key: 'galeria', label: 'Galería' },
  { key: 'promociones', label: 'Promociones y Paquetes' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const Catalogo = () => {
  const [tab, setTab] = useState<TabKey>('servicios');

  return (
    <div className="admin-catalog">
      <div className="admin-header-bar">
        <h1>Menú</h1>
      </div>
      <nav className="catalog-jump" aria-label="Secciones del menú">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={tab === item.key ? 'active' : ''}
            aria-current={tab === item.key ? 'page' : undefined}
            onClick={() => setTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="catalog-panel">
        {tab === 'servicios' && <ServiciosAdmin />}
        {tab === 'galeria' && <GaleriaAdmin />}
        {tab === 'promociones' && <PromocionesAdmin />}
      </div>
    </div>
  );
};

export default Catalogo;
