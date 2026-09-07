import React, { useEffect, useMemo, useState } from 'react';
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

const CATALOG_IMAGES = [
  '/imagenes/servicios/comida1.jpg',
  '/imagenes/servicios/comida2.jpg',
  '/imagenes/servicios/comida3.jpg',
  '/imagenes/servicios/comida4.jpg',
];

const formatPrice = (value?: number) => (value != null ? `$${Number(value).toFixed(2)}` : '');

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

  const categories = useMemo(() => {
    const groups: Record<string, Servicio[]> = {};
    servicios.forEach((item) => {
      const key = item.categoria_nombre || t('serv_otros') || 'Otros';
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return Object.entries(groups);
  }, [servicios, t]);

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

        {loading ? (
          <p className="section-status-text section-status-text--block">{t('serv_loading') || 'Cargando servicios...'}</p>
        ) : categories.length === 0 ? (
          <p className="section-status-text section-status-text--block">
            {t('serv_empty') || 'Los servicios se gestionan desde el panel admin (Menú / Servicios).'}
          </p>
        ) : (
          <div className="servicios-cards">
            {categories.map(([categoria, items], index) => (
              <motion.article
                className="servicio-card"
                key={categoria}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <div className="servicio-card-header">
                  <h3>{categoria}</h3>
                </div>

                <ul className="servicio-card-items">
                  {items.map((item) => (
                    <li key={item.id}>
                      <span className="servicio-item-name">
                        {item.nombre}
                        {item.descripcion && <span className="servicio-item-desc">{item.descripcion}</span>}
                      </span>
                      <span className="servicio-item-price">{formatPrice(item.precio)}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            ))}

            <motion.div
              className="servicios-catalog-gallery"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              {CATALOG_IMAGES.map((src, i) => (
                <div className="servicios-catalog-gallery-item" key={src}>
                  <img src={src} alt={`${t('serv_img_alt')} ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Servicios;
