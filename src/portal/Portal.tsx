import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Coffee, MapPin, Phone, ChevronRight, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api';
import { useTranslation } from '../i18n';
import { loginAdmin, logoutAdmin } from '../services/authService';

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
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)',
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #d4a373',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" style={{ height: 48, width: 48, borderRadius: '50%', border: '2px solid #d4a373' }} />
          <div>
            <div style={{ color: '#d4a373', fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Huarmy Coffee</div>
            <div style={{ color: '#f5e8d3', fontSize: 11, opacity: 0.7 }}>{t('portal_title')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: '#f5e8d3', textDecoration: 'none', fontSize: 13, fontWeight: 500,
            padding: '8px 16px', borderRadius: 8,
            border: '1px solid rgba(245,232,211,0.2)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,232,211,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={14} /> {t('portal_public_site')}
          </a>
          <button onClick={() => user ? navigate('/admin') : document.getElementById('portal-login')?.scrollIntoView({ behavior: 'smooth' })} style={{
            padding: '9px 20px', background: '#d4a373', border: 'none',
            borderRadius: 8, color: '#2c1a0f', fontWeight: 700, cursor: 'pointer',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = '#c49262'}
            onMouseLeave={e => e.currentTarget.style.background = '#d4a373'}
          >
            <Shield size={14} /> {user ? t('portal_go_admin') : t('portal_login')}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)',
        padding: '80px 40px',
        textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <img src="/imagenes/local/logo-lugar.jpg" alt={t('portal_logo_alt')} style={{ width: 110, height: 110, borderRadius: '50%', border: '4px solid #d4a373', marginBottom: 24, boxShadow: '0 0 30px rgba(212,163,115,0.3)' }} />
          <h1 style={{ color: '#f5e8d3', fontSize: 'clamp(24px, 5vw, 42px)', margin: '0 0 16px', letterSpacing: 2 }}>{t('portal_title')}</h1>
          <p style={{ color: '#d4a373', fontSize: 'clamp(14px, 2.5vw, 18px)', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.6 }}>
            {t('portal_hero_subtitle')}
          </p>
          <a href="#mision" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 30px', background: '#d4a373', color: '#2c1a0f',
            textDecoration: 'none', borderRadius: 30, fontWeight: 700, fontSize: 15,
          }}>
            {t('portal_learn_more')} <ChevronRight size={16} />
          </a>
        </motion.div>
      </section>

      {/* Misión y Visión */}
      <section id="mision" style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)', background: '#fdfaf7' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ background: 'white', padding: 'clamp(24px, 4vw, 40px)', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderLeft: '5px solid #d4a373' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Target size={32} color="#d4a373" />
              <h2 style={{ margin: 0, color: '#2c1a0f', fontSize: 24 }}>{t('portal_mision')}</h2>
            </div>
            <p style={{ color: '#5a4a3a', lineHeight: 1.8, fontSize: 15, margin: 0 }}>{mision}</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ background: 'white', padding: 'clamp(24px, 4vw, 40px)', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', borderLeft: '5px solid #c49262' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Eye size={32} color="#c49262" />
              <h2 style={{ margin: 0, color: '#2c1a0f', fontSize: 24 }}>{t('portal_vision')}</h2>
            </div>
            <p style={{ color: '#5a4a3a', lineHeight: 1.8, fontSize: 15, margin: 0 }}>{vision}</p>
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
        <section style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)', background: 'white' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#2c1a0f', fontSize: 'clamp(22px, 4vw, 32px)', marginBottom: 40 }}>{t('portal_corporate_services')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {servicios.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  style={{ background: '#fdfaf7', padding: 24, borderRadius: 12, border: '1px solid #e8e0d8' }}>
                  <h3 style={{ color: '#2c1a0f', margin: '0 0 8px', fontSize: 16 }}>{s.nombre}</h3>
                  <p style={{ color: '#8a7a6a', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>{s.descripcion}</p>
                  <span style={{ color: '#d4a373', fontWeight: 700, fontSize: 16 }}>{Number(s.precio || 0).toFixed(2)}</span>
                  {s.categoria_nombre && <span style={{ color: '#8a7a6a', fontSize: 12, marginLeft: 10 }}>— {s.categoria_nombre}</span>}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sucursales */}
      {sucursales.length > 0 && (
        <section style={{ padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 60px)', background: '#fdfaf7' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ textAlign: 'center', color: '#2c1a0f', fontSize: 'clamp(22px, 4vw, 32px)', marginBottom: 40 }}>{t('portal_branches')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {sucursales.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <Coffee size={24} color="#d4a373" />
                  <h3 style={{ color: '#2c1a0f', margin: '10px 0 8px', fontSize: 17 }}>{s.nombre}</h3>
                  <p style={{ color: '#5a4a3a', fontSize: 13, margin: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={14} color="#d4a373" /> {s.direccion}
                  </p>
                  {s.telefono && (
                    <p style={{ color: '#5a4a3a', fontSize: 13, margin: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
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
      <section style={{ padding: 'clamp(50px, 8vw, 80px) clamp(20px, 5vw, 60px)', background: 'linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)', textAlign: 'center' }}>
        <h2 style={{ color: '#f5e8d3', fontSize: 'clamp(20px, 4vw, 30px)', marginBottom: 16 }}>{t('portal_cta_title')}</h2>
        <p style={{ color: '#d4a373', marginBottom: 30, maxWidth: 520, margin: '0 auto 30px', lineHeight: 1.6 }}>
          {t('portal_cta_subtitle')}
        </p>
        <a href="/#contact" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '14px 32px', background: '#d4a373', color: '#2c1a0f',
          textDecoration: 'none', borderRadius: 30, fontWeight: 700, fontSize: 16,
          boxShadow: '0 4px 20px rgba(212,163,115,0.4)',
        }}>
          {t('portal_cta_button')} <ChevronRight size={18} />
        </a>
      </section>

      <footer style={{ textAlign: 'center', padding: '28px 20px', background: '#1a0e08', color: '#8a7a6a', fontSize: 13 }}>
        <p style={{ margin: 0 }}>{t('portal_footer')}</p>
      </footer>
    </div>
  );
};

export default Portal;
