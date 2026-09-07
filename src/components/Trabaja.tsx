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
    <section id="work" className="contact-section trabaja-section">
      <div className="container">
        <div className="grid-2-cols trabaja-grid">
          {/* Lado izquierdo - Texto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase-tracking trabaja-kicker">{t('trabaja_une_equipo')}</p>
            <h2 className="title-big">{t('trabaja_trabaja_nosotros')}</h2>
            <p className="text-soft trabaja-intro">
              {t('trabaja_descripcion')}
            </p>

            <div className="trabaja-perks">
              <div className="trabaja-perk-row">
                <div className="icon-circle">
                  <Briefcase size={20} />
                </div>
                <div>
                  <strong className="trabaja-perk-title">{t('trabaja_oportunidades')}</strong>
                  <span className="trabaja-perk-desc">{t('trabaja_capacitacion')}</span>
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
            className="form-card trabaja-form-card"
          >
            {success ? (
              <div className="trabaja-success">
                <CheckCircle size={48} color="#27ae60" className="trabaja-success-icon" />
                <h3 className="trabaja-success-title">{t('trabaja_exito_titulo')}</h3>
                <p className="trabaja-success-text">
                  {t('trabaja_exito_descripcion')}
                </p>
                <button
                  className="btn btn-primary trabaja-retry-btn"
                  onClick={() => setSuccess(false)}
                >
                  {t('trabaja_enviar_otra')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 className="form-title trabaja-form-title">{t('trabaja_formulario_titulo')}</h3>
                {error && (
                  <div className="trabaja-error">
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
                  className="btn-submit btn-submit--with-icon"
                  disabled={loading}
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
