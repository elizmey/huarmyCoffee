import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslation } from "../i18n";
import "../assets/css/style.css";
import { apiUrl } from "../api";
import { handlePublicImageError, galleryAltKeyForSrc, imageAlt, optimizedImageUrl } from "../utils/mediaUrl";

function Gallery() {
  const { t } = useTranslation();
  const AUTO_SCROLL_DURATION_MS = 46000;
  const [galleryImages, setGalleryImages] = useState([
    { src: "/imagenes/local/lugar1.webp", altKey: "gallery_alt_interior" },
    { src: "/imagenes/local/lugar2.webp", altKey: "gallery_alt_cozy" },
    { src: "/imagenes/local/lugar3.webp", altKey: "gallery_alt_tables" },
    { src: "/imagenes/local/lugar4.webp", altKey: "gallery_alt_coffee" },
    { src: "/imagenes/local/lugar5.webp", altKey: "gallery_alt_details" },
    { src: "/imagenes/local/lugar6.webp", altKey: "gallery_alt_family" },
    { src: "/imagenes/clientes/resena-destacada.webp", altKey: "gallery_alt_review_featured" },
    { src: "/imagenes/clientes/cliente1.webp", altKey: "gallery_alt_review_1" },
    { src: "/imagenes/clientes/cliente2.webp", altKey: "gallery_alt_review_2" },
    { src: "/imagenes/clientes/cliente3.webp", altKey: "gallery_alt_review_3" },
    { src: "/imagenes/clientes/cliente4.webp", altKey: "gallery_alt_review_4" },
    { src: "/imagenes/clientes/cliente5.webp", altKey: "gallery_alt_review_5" },
  ]);

  useEffect(() => {
    fetch(apiUrl('/public/galeria'))
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGalleryImages(data.map(item => {
            const src = optimizedImageUrl(item.url_imagen);
            return {
              src,
              alt: item.titulo || '',
              altKey: galleryAltKeyForSrc(src),
            };
          }));
        }
      })
      .catch(err => console.warn('Usando imágenes por defecto para la galería.', err));
    // Se ejecuta solo al montar: no debe re-disparar el fetch al cambiar de idioma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  const resolveAlt = (img) => {
    const key = img.altKey || galleryAltKeyForSrc(img.src);
    if (key) return t(key);
    return imageAlt(img.alt, t('gallery_default_alt'));
  };

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
          <h2 className="gallery-title">{t('gallery_title')}</h2>
          <p className="gallery-description">{t('gallery_desc')}</p>
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
                aria-label={`${t('gallery_open')} ${idx + 1}`}
              >
                <img src={img.src} alt={resolveAlt(img)} className="carousel-image" loading="lazy" onError={handlePublicImageError} />
                <span className="carousel-badge">{t('gallery_view')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-carousel-dots" aria-label={t('gallery_indicators')}>
          {galleryImages.map((img, index) => (
            <button
              key={`${img.src}-carousel-dot`}
              type="button"
              className={index === activeCarouselIndex ? "gallery-dot active" : "gallery-dot"}
              onClick={() => openViewer(index)}
              aria-label={`${t('gallery_go')} ${index + 1} ${t('gallery_of')} ${galleryImages.length}`}
              aria-pressed={index === activeCarouselIndex}
            />
          ))}
        </div>
      </div>

      {isOpen && currentImage && (
        <div className="gallery-lightbox" onClick={closeViewer}>
          <div className="gallery-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="gallery-close-button" onClick={closeViewer} aria-label={t('gallery_close')}>
              <X />
            </button>

            <button type="button" className="gallery-nav-button prev" onClick={goPrev} aria-label={t('gallery_prev')}>
              <ChevronLeft />
            </button>

            <div className="gallery-lightbox-image-wrap">
              <img src={currentImage.src} alt={resolveAlt(currentImage)} className="gallery-lightbox-image" onError={handlePublicImageError} />
            </div>

            <button type="button" className="gallery-nav-button next" onClick={goNext} aria-label={t('gallery_next')}>
              <ChevronRight />
            </button>

            <div className="gallery-lightbox-caption">
              <p>{resolveAlt(currentImage)}</p>
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
                  aria-label={`${t('gallery_go')} ${index + 1}`}
                >
                  <img src={img.src} alt={resolveAlt(img)} onError={handlePublicImageError} />
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
