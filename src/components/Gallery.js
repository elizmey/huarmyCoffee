import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import "../assets/css/style.css";

function Gallery() {
  const AUTO_SCROLL_DURATION_MS = 46000;
  const galleryImages = [
    { src: "/imagenes/local/lugar1.jpg", alt: "Interior del café" },
    { src: "/imagenes/local/lugar2.jpg", alt: "Ambiente acogedor" },
    { src: "/imagenes/local/lugar3.jpg", alt: "Mesas y decoración" },
    { src: "/imagenes/local/lugar4.jpg", alt: "Preparación de café" },
    { src: "/imagenes/local/lugar5.jpg", alt: "Detalles del local" },
    { src: "/imagenes/local/lugar6.jpg", alt: "Espacio familiar" },
    { src: "/imagenes/clientes/reseña.png", alt: "Reseña destacada de una clienta" },
    { src: "/imagenes/clientes/cliente1.jpg", alt: "Reseña de cliente 1" },
    { src: "/imagenes/clientes/cliente2.jpg", alt: "Reseña de cliente 2" },
    { src: "/imagenes/clientes/cliente3.jpg", alt: "Reseña de cliente 3" },
    { src: "/imagenes/clientes/cliente4.jpg", alt: "Reseña de cliente 4" },
    { src: "/imagenes/clientes/cliente5.jpg", alt: "Reseña de cliente 5" },
  ];
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const suppressClickRef = useRef(false);

  const isOpen = selectedIndex !== null;
  const currentImage = isOpen ? galleryImages[selectedIndex] : null;

  const openViewer = (index) => {
    setSelectedIndex(index);
  };

  const closeViewer = () => {
    setSelectedIndex(null);
  };

  const goPrev = () => {
    setSelectedIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const goNext = () => {
    setSelectedIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (!carouselRef.current) {
      return;
    }

    dragStateRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: carouselRef.current.scrollLeft,
      moved: false,
    };

    setIsDragging(true);
    suppressClickRef.current = false;
  };

  useEffect(() => {
    const handlePointerMove = (event) => {
      if (!dragStateRef.current.active || !carouselRef.current) {
        return;
      }

      const delta = event.clientX - dragStateRef.current.startX;
      if (Math.abs(delta) > 6) {
        dragStateRef.current.moved = true;
        suppressClickRef.current = true;
      }

      carouselRef.current.scrollLeft = dragStateRef.current.scrollLeft - delta;
    };

    const handlePointerUp = () => {
      if (!dragStateRef.current.active) {
        return;
      }

      dragStateRef.current.active = false;
      setIsDragging(false);

      if (dragStateRef.current.moved) {
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 120);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeViewer();
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current === 0 ? galleryImages.length - 1 : current - 1
        );
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current === galleryImages.length - 1 ? 0 : current + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, galleryImages.length]);

  useEffect(() => {
    if (isDragging || isCarouselPaused) {
      return undefined;
    }

    const stepDuration = AUTO_SCROLL_DURATION_MS / galleryImages.length;
    const intervalId = window.setInterval(() => {
      setActiveCarouselIndex((current) => (current + 1) % galleryImages.length);
    }, stepDuration);

    return () => window.clearInterval(intervalId);
  }, [galleryImages.length, isDragging, isCarouselPaused]);

  return (
    <section id="galeria" className="gallery-section">
      <div className="gallery-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="gallery-title">Nuestro Espacio</h2>
          <p className="gallery-description">
            Un rincón cálido donde el café, las visitas y las buenas reseñas se encuentran.
          </p>
        </motion.div>

        <div
          className={isDragging ? "carousel-wrapper is-dragging" : "carousel-wrapper"}
          ref={carouselRef}
          onPointerDown={handlePointerDown}
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          <div className="carousel-track">
            {[...galleryImages, ...galleryImages].map((img, idx) => (
              <button
                key={`${img.src}-${idx}`}
                type="button"
                className="carousel-item carousel-button"
                onClick={() => {
                  if (suppressClickRef.current) {
                    return;
                  }
                  openViewer(idx % galleryImages.length);
                }}
                aria-label={`Abrir imagen ${idx + 1}`}
              >
                <img src={img.src} alt={img.alt} className="carousel-image" loading="lazy" />
                <span className="carousel-badge">Ver</span>
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-carousel-dots" aria-label="Indicadores de imagen">
          {galleryImages.map((img, index) => (
            <button
              key={`${img.src}-carousel-dot`}
              type="button"
              className={index === activeCarouselIndex ? "gallery-dot active" : "gallery-dot"}
              onClick={() => openViewer(index)}
              aria-label={`Ver imagen ${index + 1} de ${galleryImages.length}`}
              aria-pressed={index === activeCarouselIndex}
            />
          ))}
        </div>
      </div>

      {isOpen && currentImage && (
        <div className="gallery-lightbox" onClick={closeViewer}>
          <div className="gallery-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gallery-close-button" onClick={closeViewer} aria-label="Cerrar visor">
              <X />
            </button>

            <button type="button" className="gallery-nav-button prev" onClick={goPrev} aria-label="Imagen anterior">
              <ChevronLeft />
            </button>

            <div className="gallery-lightbox-image-wrap">
              <img src={currentImage.src} alt={currentImage.alt} className="gallery-lightbox-image" />
            </div>

            <button type="button" className="gallery-nav-button next" onClick={goNext} aria-label="Imagen siguiente">
              <ChevronRight />
            </button>

            <div className="gallery-lightbox-caption">
              <p>{currentImage.alt}</p>
              <span>
                {selectedIndex + 1} / {galleryImages.length}
              </span>
            </div>

            <div className="gallery-thumbs">
              {galleryImages.map((img, index) => (
                <button
                  key={img.src}
                  type="button"
                  className={index === selectedIndex ? "gallery-thumb active" : "gallery-thumb"}
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Ir a imagen ${index + 1}`}
                >
                  <img src={img.src} alt={img.alt} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
