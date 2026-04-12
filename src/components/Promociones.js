import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgePercent,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  LockKeyhole,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Truck,
  Upload,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import "../assets/css/style.css";

const STORAGE_KEY = "huarmy_promociones_editor_v1";

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

const loadSavedState = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.promotions)) {
      return null;
    }

    const defaults = createDefaultPromotions();
    const packageDefaults = createDefaultPackages();

    const promotions = parsed.promotions.map((promotion, index) => ({
      ...defaults[index % defaults.length],
      ...promotion,
      image: isPersistableImage(promotion.image) ? promotion.image : defaults[index % defaults.length].image,
    }));
    const packages = Array.isArray(parsed.packages)
      ? parsed.packages.map((pkg, index) => ({
          ...packageDefaults[index % packageDefaults.length],
          ...pkg,
          items: Array.isArray(pkg.items) ? pkg.items.filter((item) => typeof item === "string") : packageDefaults[index % packageDefaults.length].items,
        }))
      : createDefaultPackages();
    const featuredPromotionId =
      typeof parsed.featuredPromotionId === "string" && promotions.some((promotion) => promotion.id === parsed.featuredPromotionId)
        ? parsed.featuredPromotionId
        : promotions[0]?.id || "";

    const savedHighlight = { ...defaultHighlight, ...(parsed.highlight || {}) };
    const normalizePremium = (value) =>
      typeof value === "string" && value.trim().toLowerCase() === "premium" ? "Equilibrda" : value;
    savedHighlight.eyebrow = normalizePremium(savedHighlight.eyebrow);
    savedHighlight.badgePrimary = normalizePremium(savedHighlight.badgePrimary);
    savedHighlight.description =
      typeof savedHighlight.description === "string"
        ? savedHighlight.description.replace(/premium/gi, "equilibrda")
        : savedHighlight.description;

    return {
      promotions,
      packages,
      highlight: savedHighlight,
      featuredPromotionId,
    };
  } catch {
    return null;
  }
};

const getPromotionIcon = (index) => {
  const icons = [UtensilsCrossed, Users, Truck];
  return icons[index % icons.length];
};

const isPersistableImage = (value) =>
  typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"));

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

const createPromotionId = () => `promo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createNewPromotion = (index = 0) => {
  const defaults = createDefaultPromotions();
  const fallback = defaults[index % defaults.length];

  return {
    id: createPromotionId(),
    title: "Nueva promocion",
    type: fallback.type,
    duration: "Disponible esta semana",
    startDate: "",
    endDate: "",
    description: "Describe aqui los beneficios de esta promocion.",
    tag: "Nuevo",
    detail: "Agrega detalles para que el cliente entienda la oferta.",
    image: fallback.image,
  };
};

const createPackageId = () => `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createNewPackage = () => ({
  id: createPackageId(),
  title: "Nuevo paquete",
  price: "Desde $0.00",
  items: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
});

const clonePromotions = (list) => list.map((promotion) => ({ ...promotion }));
const clonePackages = (list) => list.map((pkg) => ({ ...pkg, items: Array.isArray(pkg.items) ? [...pkg.items] : [] }));

const Promociones = () => {
  const savedState = loadSavedState();
  const initialPromotions = savedState?.promotions || createDefaultPromotions();
  const initialPackages = savedState?.packages || createDefaultPackages();
  const initialHighlight = savedState?.highlight || defaultHighlight;
  const initialFeaturedPromotionId =
    savedState?.featuredPromotionId && initialPromotions.some((promotion) => promotion.id === savedState.featuredPromotionId)
      ? savedState.featuredPromotionId
      : initialPromotions[0]?.id || "";

  const [promotions, setPromotions] = useState(initialPromotions);
  const [packages, setPackages] = useState(initialPackages);
  const [highlight, setHighlight] = useState(initialHighlight);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorPage, setEditorPage] = useState("promotions");
  const [selectedPromotionId, setSelectedPromotionId] = useState(initialPromotions[0]?.id || "promo-1");
  const [featuredPromotionId, setFeaturedPromotionId] = useState(initialFeaturedPromotionId);
  const [imageSourceMode, setImageSourceMode] = useState("url");
  const secretClickCountRef = useRef(0);
  const secretTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const promotionsGridRef = useRef(null);
  const uploadedImageUrlsRef = useRef({});
  const [canScrollPromotionsLeft, setCanScrollPromotionsLeft] = useState(false);
  const [canScrollPromotionsRight, setCanScrollPromotionsRight] = useState(false);
  const lastSavedStateRef = useRef({
    promotions: clonePromotions(initialPromotions),
    packages: clonePackages(initialPackages),
    highlight: { ...initialHighlight },
    featuredPromotionId: initialFeaturedPromotionId,
  });

  useEffect(() => {
    const uploadedImageUrls = uploadedImageUrlsRef.current;

    return () => {
      Object.values(uploadedImageUrls).forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  useEffect(() => {
    return () => {
      if (secretTimerRef.current) {
        clearTimeout(secretTimerRef.current);
      }
    };
  }, []);

  const selectedPromotion = promotions.find((promotion) => promotion.id === selectedPromotionId) || promotions[0] || null;
  const visiblePromotions = promotions.filter((promotion) => isPromotionActive(promotion));
  const featuredPromotion =
    visiblePromotions.find((promotion) => promotion.id === featuredPromotionId) || visiblePromotions[0] || promotions[0] || null;
  const visibleOrderedPromotions = [
    ...visiblePromotions.filter((promotion) => promotion.id === featuredPromotionId),
    ...visiblePromotions.filter((promotion) => promotion.id !== featuredPromotionId),
  ];
  const hasPromotions = visiblePromotions.length > 0;
  const hasPackages = packages.length > 0;

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

  const updateSelectedPromotion = (field, value) => {
    setPromotions((prev) =>
      prev.map((promotion) =>
        promotion.id === selectedPromotionId
          ? {
              ...promotion,
              [field]: value,
            }
          : promotion
      )
    );
  };

  const handleSecretOpen = () => {
    secretClickCountRef.current += 1;

    if (secretTimerRef.current) {
      clearTimeout(secretTimerRef.current);
    }

    secretTimerRef.current = setTimeout(() => {
      secretClickCountRef.current = 0;
    }, 1200);

    if (secretClickCountRef.current >= 5) {
      secretClickCountRef.current = 0;
      setEditorPage("promotions");
      setEditorOpen(true);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPromotion) {
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    const previousUrl = uploadedImageUrlsRef.current[selectedPromotion.id];

    if (previousUrl && previousUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrl);
    }

    uploadedImageUrlsRef.current[selectedPromotion.id] = nextUrl;
    updateSelectedPromotion("image", nextUrl);
    setImageSourceMode("upload");
  };

  const addPromotion = () => {
    const newPromotion = createNewPromotion(promotions.length);
    setPromotions((prev) => [...prev, newPromotion]);
    setSelectedPromotionId(newPromotion.id);
    if (!featuredPromotionId) {
      setFeaturedPromotionId(newPromotion.id);
    }
    setImageSourceMode("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeSelectedPromotion = () => {
    if (!selectedPromotion) {
      return;
    }

    const selectedId = selectedPromotion.id;
    const uploadedImageUrl = uploadedImageUrlsRef.current[selectedId];
    if (uploadedImageUrl && uploadedImageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    delete uploadedImageUrlsRef.current[selectedId];

    const nextPromotions = promotions.filter((promotion) => promotion.id !== selectedId);
    setPromotions(nextPromotions);
    if (featuredPromotionId === selectedId) {
      setFeaturedPromotionId(nextPromotions[0]?.id || "");
    }
    setImageSourceMode("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const restoreLastSaved = () => {
    const snapshot = lastSavedStateRef.current;
    const restoredPromotions = clonePromotions(snapshot.promotions);
    const restoredPackages = clonePackages(snapshot.packages);
    const nextFeaturedId =
      restoredPromotions.find((promotion) => promotion.id === snapshot.featuredPromotionId)?.id || restoredPromotions[0]?.id || "";

    setPromotions(restoredPromotions);
    setPackages(restoredPackages);
    setHighlight({ ...snapshot.highlight });
    setFeaturedPromotionId(nextFeaturedId);
    setSelectedPromotionId(restoredPromotions[0]?.id || "promo-1");
    setImageSourceMode("url");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveEditorChanges = () => {
    const serializablePromotions = promotions.map((promotion, index) => ({
      ...promotion,
      image: isPersistableImage(promotion.image) ? promotion.image : createDefaultPromotions()[index]?.image || "",
    }));
    const serializablePackages = packages.map((pkg) => ({
      ...pkg,
      items: Array.isArray(pkg.items)
        ? pkg.items.map((item) => `${item}`.trim()).filter(Boolean)
        : [],
    }));
    const nextFeaturedId =
      serializablePromotions.find((promotion) => promotion.id === featuredPromotionId)?.id || serializablePromotions[0]?.id || "";

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          promotions: serializablePromotions,
          packages: serializablePackages,
          highlight,
          featuredPromotionId: nextFeaturedId,
        })
      );
      lastSavedStateRef.current = {
        promotions: clonePromotions(serializablePromotions),
        packages: clonePackages(serializablePackages),
        highlight: { ...highlight },
        featuredPromotionId: nextFeaturedId,
      };
      setFeaturedPromotionId(nextFeaturedId);
    } catch (error) {
      console.warn("No se pudo guardar el editor de promociones en localStorage:", error);
    }
    setEditorOpen(false);
    setEditorPage("promotions");
  };

  const updatePackageField = (packageId, field, value) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              [field]: value,
            }
          : pkg
      )
    );
  };

  const updatePackageItems = (packageId, rawValue) => {
    const items = rawValue
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    updatePackageField(packageId, "items", items);
  };

  const addPackage = () => {
    setPackages((prev) => [...prev, createNewPackage()]);
  };

  const removePackage = (packageId) => {
    setPackages((prev) => prev.filter((pkg) => pkg.id !== packageId));
  };

  return (
    <section id="promociones" className="promotions-section">
      <div className="promotions-container">
        {hasPromotions && (
          <motion.div
            className="promotions-hero"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <div className="promotions-copy">
              <p className="promotions-kicker promotions-kicker--secret" onClick={handleSecretOpen}>
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
          <div className={`promotions-bottom-layout ${hasPromotions && hasPackages ? "promotions-bottom-layout--split" : ""}`}>
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
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {!hasPromotions && (
          <motion.div
            className="promotions-empty-state"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.55 }}
          >
            <p className="promotions-kicker promotions-kicker--secret" onClick={handleSecretOpen}>
              PROMOCIONES
            </p>
            <h3>No hay ofertas o promociones disponibles por el momento</h3>
            <p>Estamos preparando nuevas opciones para ti. Vuelve pronto para ver promociones actualizadas.</p>
          </motion.div>
        )}

      </div>

      {editorOpen && (
        <div className="promotions-editor-overlay">
          <div className="promotions-editor-card">
            <div className="promotions-editor-header">
              <div>
                <p className="promotions-editor-kicker">
                  <LockKeyhole size={14} />
                  Panel oculto
                </p>
                <h3>Edicion de promociones</h3>
                <p className="promotions-editor-helper">
                  Cambia el tipo, la duracion y la imagen sin usar base de datos. Puedes pegar una URL o subir un archivo local.
                </p>
              </div>
              <button
                type="button"
                className="promotions-editor-close"
                onClick={() => {
                  setEditorOpen(false);
                  setEditorPage("promotions");
                }}
                aria-label="Cerrar editor"
              >
                <X size={20} />
              </button>
            </div>

            <div className="promotions-editor-mini-menu">
              <button
                type="button"
                className={`promotions-editor-tab ${editorPage === "promotions" ? "active" : ""}`}
                onClick={() => setEditorPage("promotions")}
              >
                Promociones
              </button>
              <button
                type="button"
                className={`promotions-editor-tab ${editorPage === "packages" ? "active" : ""}`}
                onClick={() => setEditorPage("packages")}
              >
                Paquetes
              </button>
            </div>

            {editorPage === "promotions" ? (
              <div className="promotions-editor-layout">
                <aside className="promotions-editor-list">
                  <h4>Promociones</h4>
                  {promotions.map((promotion) => (
                    <button
                      type="button"
                      key={promotion.id}
                      className={`promotions-editor-list-item ${promotion.id === selectedPromotionId ? "active" : ""} ${promotion.id === featuredPromotionId ? "featured" : ""}`}
                      onClick={() => setSelectedPromotionId(promotion.id)}
                    >
                      <img src={promotion.image} alt={promotion.title} />
                      <span>
                        <strong>{promotion.title}</strong>
                        <span
                          role="button"
                          tabIndex={0}
                          className={`promotions-editor-featured ${promotion.id === featuredPromotionId ? "active" : ""}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setFeaturedPromotionId(promotion.id);
                            setSelectedPromotionId(promotion.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              setFeaturedPromotionId(promotion.id);
                              setSelectedPromotionId(promotion.id);
                            }
                          }}
                          title="Marcar como promocion destacada"
                          aria-label="Marcar como promocion destacada"
                        >
                          <Star size={14} />
                          {promotion.id === featuredPromotionId ? "Destacada" : "Destacar"}
                        </span>
                        <small>{promotion.type} | {getPromotionScheduleLabel(promotion)}</small>
                      </span>
                    </button>
                  ))}

                  <div className="promotions-editor-list-actions">
                    <button type="button" className="promotions-editor-reset" onClick={addPromotion}>
                      Agregar promocion
                    </button>
                    <button
                      type="button"
                      className="promotions-editor-reset promotions-editor-reset--danger"
                      onClick={removeSelectedPromotion}
                      disabled={!selectedPromotion}
                    >
                      Eliminar seleccionada
                    </button>
                  </div>

                  <button type="button" className="promotions-editor-reset" onClick={restoreLastSaved}>
                    Restaurar ultimo guardado
                  </button>
                </aside>

                {selectedPromotion && (
                  <div className="promotions-editor-form">
                    <div className="promotions-editor-grid">
                      <label>
                        <span>Nombre de la promocion</span>
                        <input
                          type="text"
                          value={selectedPromotion.title}
                          onChange={(event) => updateSelectedPromotion("title", event.target.value)}
                        />
                      </label>

                      <label>
                        <span>Tipo de promocion</span>
                        <input
                          type="text"
                          value={selectedPromotion.type}
                          onChange={(event) => updateSelectedPromotion("type", event.target.value)}
                        />
                      </label>

                      <label>
                        <span>Fecha de inicio</span>
                        <input
                          type="date"
                          value={selectedPromotion.startDate || ""}
                          onChange={(event) => updateSelectedPromotion("startDate", event.target.value)}
                        />
                      </label>

                      <label>
                        <span>Fecha de finalizacion</span>
                        <input
                          type="date"
                          value={selectedPromotion.endDate || ""}
                          onChange={(event) => updateSelectedPromotion("endDate", event.target.value)}
                        />
                      </label>

                      <label>
                        <span>Etiqueta breve</span>
                        <input
                          type="text"
                          value={selectedPromotion.tag}
                          onChange={(event) => updateSelectedPromotion("tag", event.target.value)}
                        />
                      </label>

                      <label className="promotions-editor-field--wide">
                        <span>Descripcion</span>
                        <textarea
                          value={selectedPromotion.description}
                          onChange={(event) => updateSelectedPromotion("description", event.target.value)}
                        />
                      </label>

                      <label className="promotions-editor-field--wide">
                        <span>Detalle</span>
                        <textarea
                          value={selectedPromotion.detail}
                          onChange={(event) => updateSelectedPromotion("detail", event.target.value)}
                        />
                      </label>

                      <div className="promotions-editor-field--wide">
                        <span className="promotions-editor-image-title">Imagen de la promocion</span>
                        <div className="promotions-editor-image-switch">
                          <button
                            type="button"
                            className={imageSourceMode === "url" ? "active" : ""}
                            onClick={() => setImageSourceMode("url")}
                          >
                            URL de internet
                          </button>
                          <button
                            type="button"
                            className={imageSourceMode === "upload" ? "active" : ""}
                            onClick={() => setImageSourceMode("upload")}
                          >
                            Subir archivo
                          </button>
                        </div>

                        {imageSourceMode === "url" ? (
                          <label className="promotions-editor-url">
                            <span>Pega la URL de la imagen</span>
                            <input
                              type="url"
                              value={selectedPromotion.image}
                              onChange={(event) => updateSelectedPromotion("image", event.target.value)}
                              placeholder="https://..."
                            />
                          </label>
                        ) : (
                          <label className="promotions-editor-upload">
                            <span>
                              <Upload size={15} />
                              Cargar imagen local
                            </span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="promotions-editor-preview">
                      <h4>Vista previa</h4>
                      <div className="promotions-editor-preview-card">
                        <img src={selectedPromotion.image} alt={selectedPromotion.title} />
                        <div>
                          <span>{selectedPromotion.type}</span>
                          <strong>{selectedPromotion.title}</strong>
                          <p>{getPromotionScheduleLabel(selectedPromotion)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="promotions-editor-packages-page">
                <div className="promotions-editor-packages">
                  <h4>Editor de paquetes</h4>
                  <div className="promotions-editor-packages-actions">
                    <button type="button" className="promotions-editor-reset" onClick={addPackage}>
                      <Plus size={14} />
                      Nuevo paquete
                    </button>
                    <button type="button" className="promotions-editor-reset" onClick={restoreLastSaved}>
                      Restaurar ultimo guardado
                    </button>
                  </div>
                  <div className="promotions-editor-packages-grid">
                    {packages.map((pkg) => (
                      <div className="promotions-editor-package-card" key={pkg.id}>
                        <label>
                          <span>Nombre del paquete</span>
                          <input
                            type="text"
                            value={pkg.title}
                            onChange={(event) => updatePackageField(pkg.id, "title", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Precio</span>
                          <input
                            type="text"
                            value={pkg.price}
                            onChange={(event) => updatePackageField(pkg.id, "price", event.target.value)}
                          />
                        </label>
                        <label>
                          <span>Beneficios (una linea por item)</span>
                          <textarea
                            value={pkg.items.join("\n")}
                            onChange={(event) => updatePackageItems(pkg.id, event.target.value)}
                          />
                        </label>
                        <button
                          type="button"
                          className="promotions-editor-reset promotions-editor-reset--danger promotions-editor-package-remove"
                          onClick={() => removePackage(pkg.id)}
                        >
                          <Trash2 size={14} />
                          Eliminar paquete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="promotions-editor-actions">
              <button
                type="button"
                className="promotions-editor-button secondary"
                onClick={() => {
                  setEditorOpen(false);
                  setEditorPage("promotions");
                }}
              >
                Cerrar
              </button>
              <button type="button" className="promotions-editor-button primary" onClick={saveEditorChanges}>
                <Save size={16} />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Promociones;
