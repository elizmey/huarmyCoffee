import React from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Compass,
  Flame,
  Briefcase,
  Coffee,
  UtensilsCrossed,
  PartyPopper,
} from 'lucide-react';
import { useTranslation } from '../i18n';
import '../assets/css/style.css';

const CATALOG_IMAGES = [
  '/imagenes/servicios/comida1.webp',
  '/imagenes/servicios/comida2.webp',
  '/imagenes/servicios/comida3.webp',
  '/imagenes/servicios/comida4.webp',
];

const SERVICE_OFFERS = [
  { titleKey: 'serv_item_1', descKey: 'serv_item_1_desc', Icon: ChefHat },
  { titleKey: 'serv_item_2', descKey: 'serv_item_2_desc', Icon: Compass },
  { titleKey: 'serv_item_3', descKey: 'serv_item_3_desc', Icon: Flame },
  { titleKey: 'serv_item_4', descKey: 'serv_item_4_desc', Icon: Briefcase },
  { titleKey: 'serv_item_5', descKey: 'serv_item_5_desc', Icon: Coffee },
  { titleKey: 'serv_item_6', descKey: 'serv_item_6_desc', Icon: UtensilsCrossed },
  { titleKey: 'serv_item_7', descKey: 'serv_item_7_desc', Icon: PartyPopper },
] as const;

const Servicios = () => {
  const { t } = useTranslation();

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
          <p className="servicios-description">{t('serv_desc')}</p>
        </motion.div>

        <div className="servicios-offer-grid">
          {SERVICE_OFFERS.map(({ titleKey, descKey, Icon }, index) => (
            <motion.article
              className="servicio-offer-card"
              key={titleKey}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              <div className="servicio-offer-icon" aria-hidden="true">
                <Icon size={22} strokeWidth={2.1} />
              </div>
              <h3>{t(titleKey)}</h3>
              <p>{t(descKey)}</p>
            </motion.article>
          ))}
        </div>

        <div className="servicios-cta">
          <a href="#cotizador" className="btn-primary">{t('serv_cta_cotizar')}</a>
          <a href="#contact" className="btn-secondary">{t('serv_cta_reservar')}</a>
        </div>

        <motion.div
          className="servicios-catalog-gallery"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          {CATALOG_IMAGES.map((src, i) => (
            <div className="servicios-catalog-gallery-item" key={src}>
              <img src={src} alt={t(`serv_img_alt_${i + 1}`) || `${t('serv_img_alt')} ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Servicios;
