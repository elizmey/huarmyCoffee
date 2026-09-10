import React from "react";
import { useTranslation } from "../i18n";
import "../assets/css/style.css";

function Home() {
  const { t } = useTranslation();

  return (
    <section id="inicio" className="premium-hero">
      <div className="hero-background">
        <img
          src="/imagenes/local/lugar1-hero.webp"
          srcSet="/imagenes/local/lugar1-hero.webp 960w, /imagenes/local/lugar1.webp 1400w"
          sizes="100vw"
          alt={t('home_hero_alt')}
          className="hero-bg-image"
          width={1400}
          height={933}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          HUARMY COFFEE CATERING <span>RESTAURANT</span>
        </h1>

        <p className="hero-subtitle">
          {t('home_subtitulo_1')}<br />
          {t('home_subtitulo_2')}
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="btn-primary">
            {t('home_btn_menu')}
          </a>
          <a href="#nosotros" className="btn-secondary">
            {t('home_btn_historia')}
          </a>
        </div>

        <p className="hero-location">
          📍 Av. Equinoccial &, Quito | 🕒 8:00 AM - 5:30 PM
        </p>

        <a href="#ubicacion" className="btn-maps">
          {t('home_btn_ubicacion')}
        </a>
      </div>
    </section>
  );
}

export default Home;
