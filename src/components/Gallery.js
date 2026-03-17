import React from "react";
import "../assets/css/style.css";

function Gallery() {
  const lugarImages = [
    { src: "/imagenes/local/lugar1.jpg", alt: "Interior del café" },
    { src: "/imagenes/local/lugar2.jpg", alt: "Ambiente acogedor" },
    { src: "/imagenes/local/lugar3.jpg", alt: "Mesas y decoración" },
    { src: "/imagenes/local/lugar4.jpg", alt: "Preparación de café" },
    { src: "/imagenes/local/lugar5.jpg", alt: "Detalles del local" },
    { src: "/imagenes/local/lugar6.jpg", alt: "Espacio familiar" },
  ];

  return (
    <section id="galeria" className="gallery-section">
      <div className="gallery-container">
        <span className="gallery-label">GALERÍA</span>
        <h2 className="gallery-title">Nuestro Espacio</h2>
        <p className="gallery-description">
          Un rincón cálido donde el café y la buena compañía se encuentran ☕
        </p>

        <div className="gallery-grid">
          {lugarImages.map((image, index) => (
            <div key={index} className="gallery-item">
              <img
                src={image.src}
                alt={image.alt}
                className="gallery-img"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;