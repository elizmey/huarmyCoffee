import React from "react";
import { motion } from "framer-motion";
import { Coffee, Heart, Leaf } from "lucide-react";
import { useTranslation } from "../i18n";
import "../assets/css/style.css";

const Nosotros = () => {
  const { t } = useTranslation();

  return (
    <section id="nosotros" className="about-section">
      <div className="container">
        <div className="grid-about">
          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <p className="section-label">{t('nos_label')}</p>
            <h2 className="about-title">
              {t('nos_title_1')}
              <br />
              <span>{t('nos_title_2')}</span>
            </h2>

            <p className="about-description">{t('nos_desc')}</p>

            <div className="highlights">
              <div className="highlight-item">
                <div className="icon-circle">
                  <Coffee size={22} />
                </div>
                <div className="highlight-text">
                  <h4>{t('nos_h1_title')}</h4>
                  <p>{t('nos_h1_desc')}</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="icon-circle">
                  <Heart size={22} />
                </div>
                <div className="highlight-text">
                  <h4>{t('nos_h2_title')}</h4>
                  <p>{t('nos_h2_desc')}</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="icon-circle">
                  <Leaf size={22} />
                </div>
                <div className="highlight-text">
                  <h4>{t('nos_h3_title')}</h4>
                  <p>{t('nos_h3_desc')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="about-image"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src="/nosotros/image.webp"
              alt={t('nos_img_alt')}
              className="main-image"
              loading="lazy"
              decoding="async"
              width={900}
              height={700}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
