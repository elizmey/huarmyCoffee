import React from "react";
import { motion } from "framer-motion";
import "../assets/css/style.css";
import { useTranslation } from "../i18n";

function Ubicacion() {
  const { t } = useTranslation();
  return (
    <section id="ubicacion" className="ubicacion-section">
      <motion.div
        className="ubicacion-container"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
      >
        <h1>{t("ubicacion_titulo")}</h1>
        <p>{t("ubicacion_descripcion")}</p>

        <div className="map-container">
          <iframe
            src="https://www.google.com/maps?q=Av.%20Equinoccial%20Quito&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            title={t("ubicacion_mapa_titulo")}
          ></iframe>
        </div>

        <a
          href="https://maps.app.goo.gl/HCMGhDKRXi1STzJR7"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-map"
        >
          {t("ubicacion_abrir_maps")}
        </a>
      </motion.div>
    </section>
  );
}

export default Ubicacion;
