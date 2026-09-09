import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Coffee, MapPin, Phone, ChevronRight, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';
import { useTranslation } from '../i18n';
import { loginAdmin, logoutAdmin } from '../services/authService';
import './Portal.css';

const defaultMision = 'Ofrecer una experiencia gastronómica auténtica que rescata los sabores tradicionales ecuatorianos, brindando a nuestros clientes calidad, calidez y un ambiente acogedor en cada una de nuestras sucursales.';
const defaultVision = 'Ser la cadena de cafeterías y restaurantes ecuatorianos más reconocida del país para 2030, expandiendo nuestra propuesta gastronómica con valores de identidad, sostenibilidad y excelencia en el servicio.';

const Portal = () => {
  const [mision, setMision] = useState(defaultMision);
  const [vision, setVision] = useState(defaultVision);
  const [servicios, setServicios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
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
    const stored = localStorage.getItem('adminUser');
    if (stored && localStorage.getItem('adminToken')) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
  }, []);

  const handlePortalLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const logged = await loginAdmin(loginEmail, loginPassword);
      setUser(logged);
      setLoginPassword('');
    } catch (err) {
      setLoginError((err as Error).message || 'No se pudo iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

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
          <button
            onClick={() => user ? navigate('/admin') : document.getElementById('portal-login')?.scrollIntoView({ behavior: 'smooth' })}
            className="portal-admin-btn"
          >
            <Shield size={14} /> {user ? t('portal_go_admin') : t('portal_login')}
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

      <section id="portal-login" style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)', background: 'white' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', background: '#fdfaf7', padding: 28, borderRadius: 16, border: '1px solid #e8e0d8' }}>
          <h2 style={{ color: '#2c1a0f', marginTop: 0 }}>{t('portal_login_title')}</h2>
          {user ? (
            <div>
              <p style={{ color: '#5a4a3a' }}>{t('portal_welcome')} <strong>{user.nombre}</strong> ({user.rol}).</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => navigate('/admin')} style={{ padding: '10px 18px', background: '#d4a373', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>{t('portal_go_admin')}</button>
                <button onClick={async () => { await logoutAdmin(); setUser(null); }} style={{ padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>{t('portal_logout')}</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePortalLogin}>
              {loginError && <p style={{ color: '#c0392b' }}>{loginError}</p>}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>{t('portal_email')}</label>
                <input className="form-control" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e8e0d8' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>{t('portal_password')}</label>
                <input className="form-control" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e8e0d8' }} />
              </div>
              <button type="submit" disabled={loginLoading} style={{ padding: '10px 18px', background: '#d4a373', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>
                {loginLoading ? '...' : t('portal_login_btn')}
              </button>
              <p style={{ marginTop: 12, fontSize: 13 }}><a href="/admin/forgot-password">{t('portal_forgot')}</a></p>
            </form>
          )}
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
