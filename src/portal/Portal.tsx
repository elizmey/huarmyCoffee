import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Coffee, MapPin, Phone, ChevronRight, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';
import { useTranslation } from '../i18n';
import './Portal.css';

const defaultMision = 'Ofrecer una experiencia gastronómica auténtica que rescata los sabores tradicionales ecuatorianos, brindando a nuestros clientes calidad, calidez y un ambiente acogedor en cada una de nuestras sucursales.';
const defaultVision = 'Ser la cadena de cafeterías y restaurantes ecuatorianos más reconocida del país para 2030, expandiendo nuestra propuesta gastronómica con valores de identidad, sostenibilidad y excelencia en el servicio.';

const Portal = () => {
  const [mision, setMision] = useState(defaultMision);
  const [vision, setVision] = useState(defaultVision);
  const [servicios, setServicios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, vRes, sRes, sucRes] = await Promise.allSettled([
          fetch(apiUrl('/public/mision')).then(r => r.ok ? r.json() : null),
          fetch(apiUrl('/public/vision')).then(r => r.ok ? r.json() : null),
          fetch(apiUrl('/public/servicios')).then(r => r.ok ? r.json() : []),
          fetch(apiUrl('/public/sucursales')).then(r => r.ok ? r.json() : []),
        ]);

        if (mRes.status === 'fulfilled' && mRes.value?.contenido) setMision(mRes.value.contenido);
        if (vRes.status === 'fulfilled' && vRes.value?.contenido) setVision(vRes.value.contenido);
        if (sRes.status === 'fulfilled' && Array.isArray(sRes.value)) setServicios(sRes.value);
        if (sucRes.status === 'fulfilled' && Array.isArray(sucRes.value)) setSucursales(sucRes.value);
      } catch (e) {
        console.warn('API no disponible, usando datos por defecto');
      }
    };
    fetchData();
  }, []);

  return (
    <div className="portal-page">
      {/* Header */}
      <header className="portal-header portal-gradient-bg">
        <div className="portal-brand">
          <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" className="portal-brand-logo" />
          <div>
            <div className="portal-brand-name">Huarmy Coffee</div>
            <div className="portal-brand-subtitle">{t('portal_title')}</div>
          </div>
        </div>
        <div className="portal-header-actions">
          <a href="/" className="portal-link-btn">
            <ArrowLeft size={14} /> {t('portal_public_site')}
          </a>
          <button onClick={() => navigate('/admin/login')} className="portal-admin-btn">
            <Shield size={14} /> {t('portal_admin_access')}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="portal-hero portal-gradient-bg">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <img src="/imagenes/local/logo-lugar.jpg" alt={t('portal_logo_alt')} className="portal-hero-logo" />
          <h1 className="portal-hero-title">{t('portal_title')}</h1>
          <p className="portal-hero-subtitle">
            {t('portal_hero_subtitle')}
          </p>
          <a href="#mision" className="portal-hero-cta">
            {t('portal_learn_more')} <ChevronRight size={16} />
          </a>
        </motion.div>
      </section>

      {/* Misión y Visión */}
      <section id="mision" className="portal-section portal-section--tint">
        <div className="portal-mission-grid">
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="portal-mission-card">
            <div className="portal-mission-header">
              <Target size={32} color="#d4a373" />
              <h2>{t('portal_mision')}</h2>
            </div>
            <p className="portal-mission-text">{mision}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="portal-mission-card vision">
            <div className="portal-mission-header">
              <Eye size={32} color="#c49262" />
              <h2>{t('portal_vision')}</h2>
            </div>
            <p className="portal-mission-text">{vision}</p>
          </motion.div>
        </div>
      </section>

      {/* Servicios Corporativos */}
      {servicios.length > 0 && (
        <section className="portal-section portal-section--white">
          <div className="portal-section-inner">
            <h2 className="portal-section-title">{t('portal_corporate_services')}</h2>
            <div className="portal-cards-grid">
              {servicios.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="portal-service-card">
                  <h3>{s.nombre}</h3>
                  <p>{s.descripcion}</p>
                  <span className="portal-service-price">{Number(s.precio || 0).toFixed(2)}</span>
                  {s.categoria_nombre && <span className="portal-service-category">— {s.categoria_nombre}</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sucursales */}
      {sucursales.length > 0 && (
        <section className="portal-section portal-section--tint">
          <div className="portal-section-inner">
            <h2 className="portal-section-title">{t('portal_branches')}</h2>
            <div className="portal-cards-grid portal-cards-grid--branches">
              {sucursales.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="portal-branch-card">
                  <Coffee size={24} color="#d4a373" />
                  <h3>{s.nombre}</h3>
                  <p className="portal-branch-line">
                    <MapPin size={14} color="#d4a373" /> {s.direccion}
                  </p>
                  {s.telefono && (
                    <p className="portal-branch-line">
                      <Phone size={14} color="#d4a373" /> {s.telefono}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="portal-cta-section portal-gradient-bg">
        <h2 className="portal-cta-title">{t('portal_cta_title')}</h2>
        <p className="portal-cta-subtitle">
          {t('portal_cta_subtitle')}
        </p>
        <a href="/#contact" className="portal-cta-button">
          {t('portal_cta_button')} <ChevronRight size={18} />
        </a>
      </section>

      <footer className="portal-footer">
        <p>{t('portal_footer')}</p>
      </footer>
    </div>
  );
};

export default Portal;
