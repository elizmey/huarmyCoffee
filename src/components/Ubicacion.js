import React from "react";
import "../assets/css/style.css";

function Ubicacion() {
  return (
    <section className="ubicacion-section">
      <div className="ubicacion-container">
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
          ></iframe>
        </div>

        <a
          href="https://maps.app.goo.gl/WG4iwtVRR4SGeD3f6"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-map"
        >
          Abrir en Google Maps
        </a>
      </div>
    </section>
  );
}

export default Ubicacion;