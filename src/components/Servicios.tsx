import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';
import { apiUrl } from '../api';
import '../assets/css/style.css';

type Servicio = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio?: number;
  categoria_nombre?: string;
};

const Servicios = () => {
  const { t } = useTranslation();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/public/servicios'))
      .then((r) => r.json())
      .then((data) => setServicios(Array.isArray(data) ? data : []))
      .catch(() => setServicios([]))
      .finally(() => setLoading(false));
  }, []);

  const fotos = [
    '/imagenes/servicios/comida1.jpg',
    '/imagenes/servicios/comida2.jpg',
    '/imagenes/servicios/comida3.jpg',
    '/imagenes/servicios/comida4.jpg',
  ];

  return (
    <section id="servicios" className="servicios-section">
      <div className="servicios-container">
        <motion.div
          className="servicios-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">{t('serv_label')}</span>
          <h2 className="servicios-title">
            {t('serv_title_1')} <span>{t('serv_title_2')}</span>
          </h2>
        </motion.div>

        <div className="servicios-grid">
          <motion.div
            className="servicios-list"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            {loading ? (
              <p style={{ color: '#8a7a6a' }}>{t('serv_loading') || 'Cargando servicios...'}</p>
            ) : servicios.length === 0 ? (
              <p style={{ color: '#8a7a6a' }}>
                {t('serv_empty') || 'Los servicios se gestionan desde el panel admin (Menú / Servicios).'}
              </p>
            ) : (
              <ul>
                {servicios.map((servicio) => (
                  <li key={servicio.id}>
                    <strong>{servicio.nombre}</strong>
                    {servicio.descripcion ? ` — ${servicio.descripcion}` : ''}
                    {servicio.precio != null ? ` (${Number(servicio.precio).toFixed(2)} USD)` : ''}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            className="servicios-gallery"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            {fotos.map((foto, index) => (
              <div key={index} className="servicio-imagen">
                <img src={foto} alt={`${t('serv_img_alt')} ${index + 1}`} loading="lazy" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Servicios;
