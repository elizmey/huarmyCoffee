import React from "react";
import { motion } from "framer-motion";
import "../assets/css/style.css";

function Ubicacion() {
  return (
    <section id="ubicacion" className="ubicacion-section">
      <motion.div
        className="ubicacion-container"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.8 }}
      >
        <h1>📍 Nuestra Ubicación</h1>
        <p>Visítanos y disfruta del mejor café en un ambiente acogedor</p>

        <div className="map-container">
          <iframe
            src="https://www.google.com/maps?q=Av.%20Equinoccial%20Quito&output=embed"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Ubicación Huarmy Coffee en Google Maps"
          ></iframe>
        </div>

        <a
          href="https://maps.app.goo.gl/HCMGhDKRXi1STzJR7"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-map"
        >
          Abrir en Google Maps
        </a>
      </motion.div>
    </section>
  );
}

export default Ubicacion;
