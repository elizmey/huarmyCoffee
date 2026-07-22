import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgePercent,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Star,
  Truck,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { fetchData } from "../f";
import "../assets/css/style.css";

const WHATSAPP_NUMBER = "593983436356";

const createDefaultPromotions = () => [
  {
    id: "promo-1",
    title: "Menu Ejecutivo",
    type: "Corporativa",
    duration: "Disponible todo el mes",
    startDate: "",
    endDate: "",
    description: "Almuerzos balanceados para equipos con proteina, guarnicion y bebida.",
    tag: "Desde 10 personas",
    detail: "Perfecto para jornadas de oficina y reuniones.",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "promo-2",
    title: "Grupos y Eventos",
    type: "Celebracion",
    duration: "Reservas semanales",
    startDate: "",
    endDate: "",
    description: "Opciones especiales para grupos grandes con presentacion cuidada y servicio rapido.",
    tag: "Servicio personalizado",
    detail: "Ideal para capacitaciones, retiros y celebraciones.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
  },
  {
    id: "promo-3",
    title: "Delivery Corporativo",
    type: "Logistica",
    duration: "Programacion diaria",
    startDate: "",
    endDate: "",
    description: "Entregas puntuales para empresas con empaques listos para compartir.",
    tag: "Cobertura programada",
    detail: "Recibe pedidos listos en tu oficina o evento.",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
  },
];

const createDefaultPackages = () => [
  {
    id: "pkg-1",
    title: "Plan Bronce",
    price: "Desde $5.50",
    items: ["Menu diario", "1 bebida", "Pedido minimo por grupo"],
  },
  {
    id: "pkg-2",
    title: "Plan Oro",
    price: "Desde $7.90",
    items: ["Menu completo", "Bebida natural", "Atencion prioritaria"],
  },
  {
    id: "pkg-3",
    title: "Plan Equilibrda",
    price: "A convenir",
    items: ["Propuesta a medida", "Montaje especial", "Eventos empresariales"],
  },
];

const defaultHighlight = {
  eyebrow: "Equilibrda",
  title: "Alimentacion equilibrada para empresas y grupos",
  description:
    "Diseñamos opciones equilibrda para equipos de trabajo, reuniones y eventos con una experiencia cuidada desde la cocina hasta la entrega.",
  badgePrimary: "Equilibrda",
  badgeSecondary: "Beneficios por volumen",
  statOneLabel: "Atencion",
  statOneValue: "Personalizada",
  statTwoLabel: "Entrega",
  statTwoValue: "Puntual",
  statThreeLabel: "Servicio",
  statThreeValue: "Flexible",
};

const getPromotionIcon = (index) => {
  const icons = [UtensilsCrossed, Users, Truck];
  return icons[index % icons.length];
};

const parseDateAtLocalMidnight = (value) => {
  if (typeof value !== "string" || !value) {
    return null;
  }
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const isPromotionActive = (promotion, now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = parseDateAtLocalMidnight(promotion.startDate);
  const endDate = parseDateAtLocalMidnight(promotion.endDate);

  if (startDate && today < startDate) {
    return false;
  }
  if (endDate && today > endDate) {
    return false;
  }
  return true;
};

const formatDateLabel = (value) => {
  const date = parseDateAtLocalMidnight(value);
  if (!date) {
    return "";
  }
  return date.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getPromotionScheduleLabel = (promotion) => {
  const start = formatDateLabel(promotion.startDate);
  const end = formatDateLabel(promotion.endDate);

  if (start && end) {
    return `${start} - ${end}`;
  }
  if (start) {
    return `Desde ${start}`;
  }
  if (end) {
    return `Hasta ${end}`;
  }
  return promotion.duration || "Sin fecha";
};

const Promociones = () => {
  const [promotions, setPromotions] = useState(createDefaultPromotions());
  const [packages, setPackages] = useState(createDefaultPackages());
  const [highlight] = useState(defaultHighlight);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteContext, setQuoteContext] = useState({ type: "", title: "" });
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    date: "",
    guests: "",
    message: "",
  });
  const [selectedPromotionId, setSelectedPromotionId] = useState("promo-1");
  const [featuredPromotionId, setFeaturedPromotionId] = useState("");
  const promotionsGridRef = useRef(null);
  const [canScrollPromotionsLeft, setCanScrollPromotionsLeft] = useState(false);
  const [canScrollPromotionsRight, setCanScrollPromotionsRight] = useState(false);
  const todayInputValue = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  })();

  useEffect(() => {
    let active = true;
    const loadFromFirebase = async () => {
      const { promociones } = await fetchData();
      if (active && promociones && Array.isArray(promociones.promotions)) {
        const defaults = createDefaultPromotions();
        const packageDefaults = createDefaultPackages();

        const loadedPromotions = promociones.promotions.map((promotion, index) => ({
          ...defaults[index % defaults.length],
          ...promotion,
        }));
        const loadedPackages = Array.isArray(promociones.packages)
          ? promociones.packages.map((pkg, index) => ({
              ...packageDefaults[index % packageDefaults.length],
              ...pkg,
              items: Array.isArray(pkg.items) ? pkg.items.filter((item) => typeof item === "string") : packageDefaults[index % packageDefaults.length].items,
            }))
          : createDefaultPackages();
        const loadedFeaturedId =
          typeof promociones.featuredPromotionId === "string" && loadedPromotions.some((p) => p.id === promociones.featuredPromotionId)
            ? promociones.featuredPromotionId
            : loadedPromotions[0]?.id || "";

        setPromotions(loadedPromotions);
        setPackages(loadedPackages);
        setFeaturedPromotionId(loadedFeaturedId);
        setSelectedPromotionId(loadedFeaturedId);
      }
    };
    loadFromFirebase();
    return () => { active = false; };
  }, []);

  const visiblePromotions = promotions.filter((promotion) => isPromotionActive(promotion));
  const featuredPromotion =
    visiblePromotions.find((promotion) => promotion.id === featuredPromotionId) || visiblePromotions[0] || promotions[0] || null;
  const visibleOrderedPromotions = [
    ...visiblePromotions.filter((promotion) => promotion.id === featuredPromotionId),
    ...visiblePromotions.filter((promotion) => promotion.id !== featuredPromotionId),
  ];
  const hasPromotions = visiblePromotions.length > 0;
  const hasPackages = packages.length > 0;
  const showHero = hasPromotions || hasPackages;
  const showEmptyPromotionsState = !hasPromotions && !hasPackages;

  const scrollPromotions = (direction) => {
    const grid = promotionsGridRef.current;
    if (!grid) {
      return;
    }

    const firstCard = grid.querySelector(".promotion-card");
    const cardWidth = firstCard instanceof HTMLElement ? firstCard.offsetWidth : grid.clientWidth * 0.85;
    const step = cardWidth + 18;

    grid.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const grid = promotionsGridRef.current;
    if (!grid) {
      return undefined;
    }

    const syncState = () => {
      if (visibleOrderedPromotions.length <= 1) {
        setCanScrollPromotionsLeft(false);
        setCanScrollPromotionsRight(false);
        return;
      }

      const maxScrollLeft = grid.scrollWidth - grid.clientWidth;
      setCanScrollPromotionsLeft(grid.scrollLeft > 6);
      setCanScrollPromotionsRight(grid.scrollLeft < maxScrollLeft - 6);
    };
    syncState();

    grid.addEventListener("scroll", syncState, { passive: true });
    window.addEventListener("resize", syncState);

    return () => {
      grid.removeEventListener("scroll", syncState);
      window.removeEventListener("resize", syncState);
    };
  }, [visibleOrderedPromotions.length]);

  useEffect(() => {
    if (!promotions.length) {
      setSelectedPromotionId("");
      return;
    }

    const stillExists = promotions.some((promotion) => promotion.id === selectedPromotionId);
    if (!stillExists) {
      setSelectedPromotionId(promotions[0].id);
    }
  }, [promotions, selectedPromotionId]);

  useEffect(() => {
    if (!promotions.length) {
      setFeaturedPromotionId("");
      return;
    }

    const stillExists = promotions.some((promotion) => promotion.id === featuredPromotionId);
    if (!stillExists) {
      setFeaturedPromotionId(promotions[0].id);
    }
  }, [promotions, featuredPromotionId]);

  const openQuoteModal = (type, title) => {
    setQuoteContext({ type, title });
    setQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setQuoteModalOpen(false);
  };

  const updateQuoteField = (field, value) => {
    setQuoteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submitQuoteToWhatsApp = (event) => {
    event.preventDefault();

    const message = [
      `Hola Huarmy Coffee, quiero ${quoteContext.type === "package" ? "cotizar un paquete" : "reservar/cotizar una promocion"}.`,
      quoteContext.title ? `Opcion: ${quoteContext.title}` : null,
      quoteForm.name ? `Nombre: ${quoteForm.name}` : null,
      quoteForm.phone ? `Telefono: ${quoteForm.phone}` : null,
      quoteForm.date ? `Fecha: ${quoteForm.date}` : null,
      quoteForm.guests ? `Personas: ${quoteForm.guests}` : null,
      quoteForm.message ? `Mensaje: ${quoteForm.message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setQuoteModalOpen(false);
  };

  return (
    <section id="promociones" className="promotions-section">
      <div className="promotions-container">
        {showHero && (
          <motion.div
            className="promotions-hero"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <div className="promotions-copy">
              <p className="promotions-kicker">
                {highlight.eyebrow}
              </p>
              <h2 className="promotions-title">
                {highlight.title}
              </h2>
              <p className="promotions-description">{highlight.description}</p>

              <div className="promotions-actions">
                <a href="#contact" className="btn-primary">
                  Solicitar cotizacion
                </a>
                <a href="#menu" className="btn-secondary">
                  Ver menu completo
                </a>
              </div>
            </div>

            <div className="promotions-highlight-card">
              <div className="promotions-highlight-top">
                <span className="promotions-chip">
                  <Sparkles size={16} />
                  {highlight.badgePrimary}
                </span>
                <span className="promotions-chip promotions-chip--soft">
                  <BadgePercent size={16} />
                  {highlight.badgeSecondary}
                </span>
              </div>

              <div className="promotions-highlight-main">
                <p>Promocion destacada</p>
                <h3>{featuredPromotion?.title || highlight.title}</h3>
                <p className="promotions-highlight-description">{featuredPromotion?.description || highlight.description}</p>
                <div className="promotions-stat-row">
                  <div>
                    <strong>{highlight.statOneLabel}</strong>
                    <span>{highlight.statOneValue}</span>
                  </div>
                  <div>
                    <strong>{highlight.statTwoLabel}</strong>
                    <span>{highlight.statTwoValue}</span>
                  </div>
                  <div>
                    <strong>{highlight.statThreeLabel}</strong>
                    <span>{highlight.statThreeValue}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {(hasPromotions || hasPackages) && (
          <div
            className={`promotions-bottom-layout ${hasPromotions && hasPackages ? "promotions-bottom-layout--split" : ""} ${hasPackages && !hasPromotions ? "promotions-bottom-layout--packages-only" : ""}`}
          >
            {hasPromotions && (
              <div className="promotions-column">
                <div className="promotions-column-header">
                  <p className="promotions-kicker">Promociones</p>
                </div>
                <div className={`promotions-grid-shell ${visibleOrderedPromotions.length === 1 ? "promotions-grid-shell--single" : ""}`}>
                  {visibleOrderedPromotions.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="promotions-grid-arrow promotions-grid-arrow--left"
                        onClick={() => scrollPromotions(-1)}
                        disabled={!canScrollPromotionsLeft}
                        aria-label="Ver promociones anteriores"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        type="button"
                        className="promotions-grid-arrow promotions-grid-arrow--right"
                        onClick={() => scrollPromotions(1)}
                        disabled={!canScrollPromotionsRight}
                        aria-label="Ver siguientes promociones"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <div
                    ref={promotionsGridRef}
                    className={`promotions-grid ${visibleOrderedPromotions.length === 1 ? "promotions-grid--single" : ""}`}
                  >
                  {visibleOrderedPromotions.map((promotion, index) => {
                    const Icon = getPromotionIcon(index);
                    const isFeatured = promotion.id === featuredPromotionId;

                    return (
                      <motion.article
                        key={promotion.id}
                        className={`promotion-card ${isFeatured ? "promotion-card--featured" : ""}`}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.55, delay: index * 0.08 }}
                      >
                        <div className="promotion-card-media">
                          <img src={promotion.image} alt={promotion.title} className="promotion-card-image" />
                          <div className="promotion-card-media-badge">
                            <Icon size={16} />
                            {promotion.type}
                          </div>
                          {isFeatured && (
                            <div className="promotion-card-featured-badge">
                              <Star size={15} />
                              Destacada
                            </div>
                          )}
                        </div>

                        <div className="promotion-icon">
                          <Icon size={22} />
                        </div>

                        <div className="promotion-card-copy">
                          <span className="promotion-tag">{promotion.tag}</span>
                          <h3>{promotion.title}</h3>
                          <p>{promotion.description}</p>
                          <small>{promotion.detail}</small>
                          <div className="promotion-meta-row">
                            <span className="promotion-meta-pill">
                              <CalendarDays size={14} />
                              {getPromotionScheduleLabel(promotion)}
                            </span>
                            <span className="promotion-meta-pill promotion-meta-pill--soft">
                              <ImageIcon size={14} />
                              {promotion.image ? "Imagen cargada" : "Sin imagen"}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="promotion-cta-button"
                            onClick={() => openQuoteModal("promotion", promotion.title)}
                          >
                            Reservar o cotizar
                          </button>
                        </div>
                      </motion.article>
                    );
                  })}
                  </div>
                </div>
              </div>
            )}

            {hasPackages && (
              <div className="promotions-column promotions-column--packages">
                <div className="promotions-column-header">
                  <p className="promotions-kicker">Paquetes</p>
                </div>
                <motion.div
                  className="promotions-packages"
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.7 }}
                >
                  <div className={`promotions-package-grid ${packages.length === 1 ? "promotions-package-grid--single" : ""}`}>
                    {packages.map((pkg) => (
                      <div className="promotion-package-card" key={pkg.id}>
                        <span className="promotion-package-kicker">Paquete</span>
                        <CalendarDays size={18} />
                        <h4>{pkg.title}</h4>
                        <strong>{pkg.price}</strong>
                        <ul>
                          {pkg.items.map((item, index) => (
                            <li key={`${pkg.id}-item-${index}`}>{item}</li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className="promotion-cta-button promotion-cta-button--package"
                          onClick={() => openQuoteModal("package", pkg.title)}
                        >
                          Reservar o cotizar
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {showEmptyPromotionsState && (
          <motion.div
            className="promotions-empty-state"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.55 }}
          >
            <p className="promotions-kicker">
              PROMOCIONES
            </p>
            <h3>No hay ofertas o promociones disponibles por el momento</h3>
            <p>Estamos preparando nuevas opciones para ti. Vuelve pronto para ver promociones actualizadas.</p>
          </motion.div>
        )}

      </div>

      {quoteModalOpen && (
        <div className="promotions-quote-overlay" onClick={closeQuoteModal}>
          <div className="promotions-quote-card" onClick={(event) => event.stopPropagation()}>
            <div className="promotions-quote-header">
              <div>
                <p className="promotions-editor-kicker">Solicitud rapida</p>
                <h3>{quoteContext.type === "package" ? "Cotizar paquete" : "Reservar o cotizar promocion"}</h3>
                <p className="promotions-quote-helper">{quoteContext.title}</p>
              </div>
              <button type="button" className="promotions-editor-close" onClick={closeQuoteModal} aria-label="Cerrar formulario">
                <X size={18} />
              </button>
            </div>

            <form className="promotions-quote-form" onSubmit={submitQuoteToWhatsApp}>
              <label>
                <span>Nombre</span>
                <input type="text" value={quoteForm.name} onChange={(event) => updateQuoteField("name", event.target.value)} required />
              </label>
              <label>
                <span>Telefono</span>
                <input type="tel" value={quoteForm.phone} onChange={(event) => updateQuoteField("phone", event.target.value)} />
              </label>
              <label>
                <span>Fecha deseada</span>
                <input type="date" min={todayInputValue} value={quoteForm.date} onChange={(event) => updateQuoteField("date", event.target.value)} />
              </label>
              <label>
                <span>Numero de personas</span>
                <input type="number" min="1" value={quoteForm.guests} onChange={(event) => updateQuoteField("guests", event.target.value)} />
              </label>
              <label className="promotions-quote-field-wide">
                <span>Mensaje</span>
                <textarea
                  rows={4}
                  value={quoteForm.message}
                  onChange={(event) => updateQuoteField("message", event.target.value)}
                  placeholder="Cuentanos que necesitas para tu reserva o cotizacion."
                />
              </label>

              <div className="promotions-quote-actions">
                <button type="button" className="promotions-editor-button secondary" onClick={closeQuoteModal}>
                  Cancelar
                </button>
                <button type="submit" className="promotions-editor-button primary">
                  Enviar a WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Promociones;
