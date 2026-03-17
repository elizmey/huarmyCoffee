import React from "react";
import "../assets/css/style.css";
function Gallery() {
  // Puedes reemplazar estas rutas por tus imágenes reales cuando las tengas
  // Por ahora uso placeholders de buena calidad que coinciden con el estilo
  const images = [
    { src: "https://thumbs.dreamstime.com/b/steaming-cup-coffee-rustic-wooden-table-cozy-cafe-interior-blurred-warm-lights-background-inviting-atmosphere-432892130.jpg", alt: "Interior acogedor del café" },
    { src: "https://thumbs.dreamstime.com/b/steam-rising-latte-art-coffee-shop-cozy-wooden-table-good-resolution-stock-photo-steam-rising-latte-art-coffee-shop-cozy-wooden-415193387.jpg", alt: "Café con latte art y vapor" },
    { src: "https://thumbs.dreamstime.com/b/coffee-cup-latte-art-rustic-wooden-table-cozy-cafe-setting-ceramic-filled-featuring-intricate-leaf-warm-ambient-409219839.jpg", alt: "Latte art detallado" },
    { src: "https://thumbs.dreamstime.com/b/aromatic-coffee-cozy-cafe-teal-cup-dark-table-single-delicious-latte-art-sits-night-warm-lighting-creates-atmosphere-407716102.jpg", alt: "Ambiente nocturno cálido" },
    { src: "https://thumbs.dreamstime.com/b/warm-ceramic-coffee-cup-latte-art-rustic-wooden-windowsill-cozy-morning-ambiance-sits-surrounded-beans-natural-409219850.jpg", alt: "Café junto a la ventana" },
    { src: "https://thumbs.dreamstime.com/b/beautifully-crafted-heart-shaped-latte-art-creamy-cup-coffee-resting-rustic-wooden-table-creating-cozy-inviting-319882794.jpg", alt: "Latte con corazón" },
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
          {images.map((image, index) => (
            <div key={index} className="gallery-item">
              <img
                src={image.src}
                alt={image.alt}
                className="gallery-img"
                loading="lazy" // Mejora rendimiento
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;