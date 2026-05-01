import React, { useCallback, useEffect, useRef, useState } from "react";
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
  typeof value === "string" &&
  (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/") || value.startsWith("data:image/"));

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

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
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

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });

const clonePromotions = (list) => list.map((promotion) => ({ ...promotion }));
const clonePackages = (list) => list.map((pkg) => ({ ...pkg, items: Array.isArray(pkg.items) ? [...pkg.items] : [] }));
const isPlaceholderPromotionTitle = (value) => typeof value === "string" && value.trim().toLowerCase() === "nueva promocion";
const isPlaceholderPromotionDescription = (value) =>
  typeof value === "string" && value.trim().toLowerCase() === "describe aqui los beneficios de esta promocion.";

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
  const [highlight] = useState(initialHighlight);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorPage, setEditorPage] = useState("promotions");
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteContext, setQuoteContext] = useState({ type: "", title: "" });
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    date: "",
    guests: "",
    message: "",
  });
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
  const hasMountedRef = useRef(false);
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
  const featuredPromotionTitle =
    featuredPromotion && !isPlaceholderPromotionTitle(featuredPromotion.title) ? featuredPromotion.title : highlight.title;
  const featuredPromotionDescription =
    featuredPromotion && !isPlaceholderPromotionDescription(featuredPromotion.description)
      ? featuredPromotion.description
      : highlight.description;
  const visibleOrderedPromotions = [
    ...visiblePromotions.filter((promotion) => promotion.id === featuredPromotionId),
    ...visiblePromotions.filter((promotion) => promotion.id !== featuredPromotionId),
  ];
  const hasPromotions = visiblePromotions.length > 0;
  const hasPackages = packages.length > 0;
  const showHero = hasPromotions || hasPackages;
  const showEmptyPromotionsState = !hasPromotions && !hasPackages;
  const todayInputValue = getTodayInputValue();

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

  const buildSerializableEditorState = useCallback(() => {
    const defaultPromotions = createDefaultPromotions();
    const serializablePromotions = promotions.map((promotion, index) => ({
      ...promotion,
      image: isPersistableImage(promotion.image) ? promotion.image : defaultPromotions[index]?.image || "",
    }));
    const serializablePackages = packages.map((pkg) => ({
      ...pkg,
      items: Array.isArray(pkg.items)
        ? pkg.items.map((item) => `${item}`.trim()).filter(Boolean)
        : [],
    }));
    const nextFeaturedId =
      serializablePromotions.find((promotion) => promotion.id === featuredPromotionId)?.id || serializablePromotions[0]?.id || "";

    return {
      promotions: serializablePromotions,
      packages: serializablePackages,
      highlight,
      featuredPromotionId: nextFeaturedId,
    };
  }, [promotions, packages, highlight, featuredPromotionId]);

  const persistEditorState = useCallback(({ closeEditor = false } = {}) => {
    const nextState = buildSerializableEditorState();

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      lastSavedStateRef.current = {
        promotions: clonePromotions(nextState.promotions),
        packages: clonePackages(nextState.packages),
        highlight: { ...nextState.highlight },
        featuredPromotionId: nextState.featuredPromotionId,
      };
      setFeaturedPromotionId(nextState.featuredPromotionId);
    } catch (error) {
      console.warn("No se pudo guardar el editor de promociones en localStorage:", error);
    }

    if (closeEditor) {
      setEditorOpen(false);
      setEditorPage("promotions");
    }
  }, [buildSerializableEditorState]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    persistEditorState();
  }, [promotions, packages, highlight, featuredPromotionId, persistEditorState]);

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

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !selectedPromotion) {
      return;
    }

    try {
      const nextImage = await readFileAsDataUrl(file);
      updateSelectedPromotion("image", nextImage);
      setImageSourceMode("upload");
    } catch (error) {
      console.warn("No se pudo cargar la imagen seleccionada:", error);
    }
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


  const saveEditorChanges = () => {
    persistEditorState({ closeEditor: true });
  };

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
        {showHero && (
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
                <h3>{featuredPromotionTitle}</h3>
                <p className="promotions-highlight-description">{featuredPromotionDescription}</p>
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
                  <div className="promotions-editor-list-header">
                    <h4>Promociones</h4>
                    <div className="promotions-editor-list-actions promotions-editor-list-actions--inline" style={{gap: '8px', display: 'flex', background: 'none', boxShadow: 'none', padding: 0}}>
                      <button
  type="button"
  onClick={addPromotion}
  aria-label="Agregar promocion"
  title="Agregar promocion"
  style={{
    backgroundColor: "#22c55e",
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  <Plus size={14} color="#fff" />
</button>

<button
  type="button"
  onClick={removeSelectedPromotion}
  disabled={!selectedPromotion}
  aria-label="Eliminar promocion seleccionada"
  title="Eliminar promocion seleccionada"
  style={{
    backgroundColor: "#ef4444",
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    cursor: selectedPromotion ? "pointer" : "not-allowed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: selectedPromotion ? 1 : 0.5
  }}
>
  <Trash2 size={14} color="#fff" />
</button>
                    </div>
                  </div>
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

                  {/* Botón 'Restaurar ultimo guardado' eliminado */}
                </aside>

                {selectedPromotion && (
                  <div className="promotions-editor-form">
                    <div className="promotions-editor-grid">
                      <label className="promotions-editor-field--span-2">
                        <span>Nombre de la promocion</span>
                        <input
                          type="text"
                          value={selectedPromotion.title}
                          onChange={(event) => updateSelectedPromotion("title", event.target.value)}
                        />
                      </label>

                      <label className="promotions-editor-field--span-2">
                        <span>Tipo de promocion</span>
                        <input
                          type="text"
                          value={selectedPromotion.type}
                          onChange={(event) => updateSelectedPromotion("type", event.target.value)}
                        />
                      </label>


                      <div style={{ display: "flex", gap: "1rem", flexWrap: "nowrap", marginBottom: "1.5rem" }}>
                        <label style={{ flex: 1, minWidth: 180 }}>
                          <span>Fecha de inicio</span>
                          <input
                            type="date"
                            value={selectedPromotion.startDate || ""}
                            min={todayInputValue}
                            onChange={(event) => updateSelectedPromotion("startDate", event.target.value)}
                          />
                        </label>
                        <label style={{ flex: 1, minWidth: 180 }}>
                          <span>Fecha de finalizacion</span>
                          <input
                            type="date"
                            value={selectedPromotion.endDate || ""}
                            min={selectedPromotion.startDate || todayInputValue}
                            onChange={(event) => updateSelectedPromotion("endDate", event.target.value)}
                          />
                        </label>
                        <label style={{ flex: 1, minWidth: 180 }}>
                          <span>Etiqueta breve</span>
                          <input
                            type="text"
                            value={selectedPromotion.tag}
                            onChange={(event) => updateSelectedPromotion("tag", event.target.value)}
                          />
                        </label>
                      </div>

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
                  <div className="promotions-editor-packages-actions" style={{gap: '8px', display: 'flex', background: 'none', boxShadow: 'none', padding: 0}}>
                    <button type="button" style={{background: 'none', boxShadow: 'none', padding: 0, border: 'none'}} onClick={addPackage}>
                      <Plus size={14} />
                      Nuevo paquete
                    </button>
                    {/* Botón 'Restaurar ultimo guardado' eliminado */}
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
                  placeholder="Cuéntanos que necesitas para tu reserva o cotizacion."
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
