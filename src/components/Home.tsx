import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../i18n";
import "../assets/css/style.css";

function Home() {
  const { t } = useTranslation();

  return (
    <section id="inicio" className="premium-hero">
      <div className="hero-background">
        <img
          src="/imagenes/local/lugar1.jpg"
          alt="Huarmy Coffee ambiance"
          className="hero-bg-image"
        />
        <div className="hero-overlay" />
      </div>

      {/* 🔥 TODO el contenido centrado */}
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          HUARMY COFFEE CATERING <span>RESTAURANT</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
              {t('home_subtitulo_1')}<br />
              {t('home_subtitulo_2')}
        </motion.p>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <a href="#menu" className="btn-primary">
            {t('home_btn_menu')}
          </a>
          <a href="#nosotros" className="btn-secondary">
            {t('home_btn_historia')}
          </a>
        </motion.div>

        {/* 🔥 MOVIDO AQUÍ */}
        <motion.p
          className="hero-location"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          📍 Av. Equinoccial &, Quito | 🕒 8:00 AM - 5:30 PM
        </motion.p>

       <a href="#ubicacion" className="btn-maps">
        {t('home_btn_ubicacion')}
</a>
      </motion.div>
    </section>
  );
}

export default Home;
