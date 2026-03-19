import React from "react";
import "../assets/css/style.css";

function Gallery() {
  const images = [
    { src: "/imagenes/local/lugar1.jpg", alt: "Interior del café" },
    { src: "/imagenes/local/lugar2.jpg", alt: "Ambiente acogedor" },
    { src: "/imagenes/local/lugar3.jpg", alt: "Mesas y decoración" },
    { src: "/imagenes/local/lugar4.jpg", alt: "Preparación de café" },
    { src: "/imagenes/local/lugar5.jpg", alt: "Detalles del local" },
    { src: "/imagenes/local/lugar6.jpg", alt: "Espacio familiar" },
  ];

  const extendedImages = [...images, ...images];

  return (
    <section id="galeria" className="gallery-section">
      <div className="gallery-container">
        <h2 className="gallery-title">Nuestro Espacio</h2>
        <p className="gallery-description">
          Un rincón cálido donde el café y la buena compañía se encuentran
        </p>

        <div className="carousel-wrapper">
          <div className="carousel-track">
            {extendedImages.map((img, idx) => (
              <div key={idx} className="carousel-item">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="carousel-image"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gallery;