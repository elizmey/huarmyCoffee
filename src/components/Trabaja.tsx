import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Send, CheckCircle } from 'lucide-react';
import '../assets/css/style.css';
import { apiUrl } from '../api';
import { useTranslation } from '../i18n';

const Trabaja = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(apiUrl('/postular'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('trabaja_error_envio'));
        return;
      }
      setSuccess(true);
      setFormData({ nombre: '', correo: '', telefono: '', mensaje: '' });
    } catch (err) {
      setError(t('trabaja_error_conexion'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="work" className="contact-section" style={{ background: '#fdfaf7', borderTop: '1px solid #e8e0d8' }}>
      <div className="container">
        <div className="grid-2-cols" style={{ alignItems: 'center' }}>
          {/* Lado izquierdo - Texto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase-tracking" style={{ color: '#d4a373' }}>{t('trabaja_une_equipo')}</p>
            <h2 className="title-big" style={{ color: '#2c1a0f' }}>{t('trabaja_trabaja_nosotros')}</h2>
            <p className="text-soft" style={{ margin: '15px 0 25px', lineHeight: 1.8 }}>
              {t('trabaja_descripcion')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="icon-circle" style={{ background: 'rgba(212, 163, 115, 0.15)', color: '#d4a373', padding: 12, borderRadius: '50%' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <strong style={{ color: '#2c1a0f', display: 'block', fontSize: 15 }}>{t('trabaja_oportunidades')}</strong>
                  <span style={{ fontSize: 13, color: '#8a7a6a' }}>{t('trabaja_capacitacion')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lado derecho - Formulario */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="form-card"
            style={{ background: 'white', padding: 32, borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}
          >
            {success ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle size={48} color="#27ae60" style={{ marginBottom: 16 }} />
                <h3 style={{ color: '#2c1a0f', fontSize: 18, marginBottom: 8 }}>{t('trabaja_exito_titulo')}</h3>
                <p style={{ color: '#8a7a6a', fontSize: 14 }}>
                  {t('trabaja_exito_descripcion')}
                </p>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setSuccess(false)}
                  style={{ marginTop: 20 }}
                >
                  {t('trabaja_enviar_otra')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="form-title" style={{ fontSize: 20, marginBottom: 20 }}>{t('trabaja_formulario_titulo')}</h3>
                {error && (
                  <div style={{ color: '#c0392b', marginBottom: 15, fontSize: 13, background: '#fdedec', padding: '8px 12px', borderRadius: 6 }}>
                    {error}
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">{t('trabaja_label_nombre')}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('trabaja_placeholder_nombre')}
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('trabaja_label_correo')}</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder={t('trabaja_placeholder_correo')}
                    value={formData.correo}
                    onChange={e => setFormData({ ...formData, correo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('trabaja_label_telefono')}</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0999999999"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('trabaja_label_mensaje')}</label>
                  <textarea
                    rows={4}
                    className="form-textarea"
                    placeholder={t('trabaja_placeholder_mensaje')}
                    value={formData.mensaje}
                    onChange={e => setFormData({ ...formData, mensaje: e.target.value })}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <Send size={16} />
                  {loading ? t('trabaja_enviando') : t('trabaja_enviar_postulacion')}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Trabaja;
