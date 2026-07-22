import React, { useState, useEffect, useCallback } from "react";
import { X, Lock, Save, Plus, Trash2, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { fetchData, saveMenu, savePromociones, fetchPassword, savePassword } from "../f";

const defaultMenuData = {
  mar: [
    ["Caldo de Bolas de verde", "$6.00"],
    ["Encebollado", "$3.00"],
    ["Viche de Pescado", "$6.50"],
    ["Camarones Apanados", "$6.80"],
    ["Salpicon Mariscos mix (pescado, camaron, calamar)", "$6.50"],
    ["Encocado de camaron", "$6.50"],
    ["Ceviche Pescado", "$5.50"],
    ["Ceviche de Camaron", "$6.50"],
  ],
  sierra: [
    ["Yaguarlocro", "$5.50"],
    ["Locro de Queso", "$5.00"],
    ["Caldo de Pollo", "$4.00"],
    ["Fritada", "$6.80"],
    ["Seco de Chivo", "$7.00"],
    ["Hornado con tortilla", "$7.00"],
    ["Churrasco", "$6.00"],
    ["Apanado de res", "$6.00"],
    ["Ambateño (Chorizo, huevo, tortilla)", "$5.50"],
  ],
  postres: [
    ["Torta de Chocolate", "$2.50"],
    ["Tres Leches", "$3.50"],
    ["Pristiños con Miel", "$2.80"],
    ["Empanada de Viento", "$0.80"],
  ],
  desayunos: [
    ["Tigrillo Huarmy", "$4.00"],
    ["Con Bolón mixto", "$3.80"],
    ["Con Humita", "$3.80"],
    ["Con Panques", "$4.00"],
    ["Continental", "$3.25"],
    ["Completo", "$3.75"],
  ],
  calientes: [
    ["Capuchino", "$2.50"],
    ["Mocachino", "$2.75"],
    ["Cafe Pasado", "$1.50"],
    ["Chocolate de Ambato", "$2.75"],
    ["Aromaticas", "$1.40"],
  ],
  frias: [
    ["Limonada (Jarra)", "$4.50"],
    ["Gaseosa medio litro", "$1.50"],
    ["Cerveza 1 litro", "$4.00"],
  ],
};

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
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80",
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
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80",
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

const menuCategories = [
  { key: "mar", label: "Mar" },
  { key: "sierra", label: "Sierra" },
  { key: "postres", label: "Postres" },
  { key: "desayunos", label: "Desayunos" },
  { key: "calientes", label: "Calientes" },
  { key: "frias", label: "Frias" },
];

const AdminPanel = ({ onClose }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState("menu");
  const [menuData, setMenuData] = useState(defaultMenuData);
  const [expandedCategory, setExpandedCategory] = useState("mar");
  const [promotions, setPromotions] = useState([]);
  const [packages, setPackages] = useState([]);
  const [highlight, setHighlight] = useState(defaultHighlight);
  const [featuredPromotionId, setFeaturedPromotionId] = useState("");
  const [selectedPromoIndex, setSelectedPromoIndex] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const { menu, promociones } = await fetchData();
      const password = await fetchPassword();

      setAdminPassword(password || "");

      if (menu) {
        setMenuData({ ...defaultMenuData, ...menu });
      }

      if (promociones && Array.isArray(promociones.promotions)) {
        setPromotions(promociones.promotions);
        setPackages(promociones.packages || createDefaultPackages());
        setHighlight({ ...defaultHighlight, ...(promociones.highlight || {}) });
        setFeaturedPromotionId(promociones.featuredPromotionId || promociones.promotions[0]?.id || "");
      } else {
        const defaults = createDefaultPromotions();
        setPromotions(defaults);
        setPackages(createDefaultPackages());
        setFeaturedPromotionId(defaults[0]?.id || "");
      }
    };
    loadData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminPassword) {
      const password = await fetchPassword();
      if (password) {
        setAdminPassword(password);
      }
    }
    const storedPassword = adminPassword || await fetchPassword();
    if (storedPassword && passwordInput === storedPassword) {
      setAuthenticated(true);
      setPasswordError("");
    } else if (!storedPassword) {
      setPasswordError("No hay contrasena configurada");
    } else {
      setPasswordError("Contrasena incorrecta");
    }
  };

  const showSaveMsg = (msg) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(""), 2500);
  };

  const saveAll = useCallback(async () => {
    try {
      const menuOk = await saveMenu(menuData);
      const promoOk = await savePromociones({
        promotions,
        packages,
        highlight,
        featuredPromotionId,
      });

      if (menuOk && promoOk) {
        showSaveMsg("Cambios guardados en la nube");
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } else {
        showSaveMsg("Guardado parcial - revisa tu conexion");
      }
    } catch {
      showSaveMsg("Error al guardar");
    }
  }, [menuData, promotions, packages, highlight, featuredPromotionId]);

  const resetMenu = async () => {
    if (window.confirm("Esto restaurara el menu por defecto. Continuar?")) {
      setMenuData(defaultMenuData);
      await saveMenu(defaultMenuData);
      showSaveMsg("Menu restaurado");
    }
  };

  const resetPromos = async () => {
    if (window.confirm("Esto restaurara las promociones por defecto. Continuar?")) {
      const defaults = createDefaultPromotions();
      setPromotions(defaults);
      setPackages(createDefaultPackages());
      setHighlight(defaultHighlight);
      setFeaturedPromotionId(defaults[0]?.id || "");
      await savePromociones({
        promotions: defaults,
        packages: createDefaultPackages(),
        highlight: defaultHighlight,
        featuredPromotionId: defaults[0]?.id || "",
      });
      showSaveMsg("Promociones restauradas");
    }
  };

  const updateMenuItem = (category, index, field, value) => {
    setMenuData((prev) => {
      const updated = [...prev[category]];
      updated[index] = [field === 0 ? value : updated[index][0], field === 1 ? value : updated[index][1]];
      return { ...prev, [category]: updated };
    });
  };

  const addMenuItem = (category) => {
    setMenuData((prev) => ({
      ...prev,
      [category]: [...prev[category], ["Nuevo plato", "$0.00"]],
    }));
  };

  const removeMenuItem = (category, index) => {
    setMenuData((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const updatePromoField = (index, field, value) => {
    setPromotions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const addPromotion = () => {
    const newPromo = {
      id: `promo-${Date.now()}`,
      title: "Nueva promocion",
      type: "Nueva",
      duration: "Disponible",
      startDate: "",
      endDate: "",
      description: "Describe la promocion aqui.",
      tag: "Nuevo",
      detail: "Detalle de la promocion.",
      image: createDefaultPromotions()[0].image,
    };
    setPromotions((prev) => [...prev, newPromo]);
    setSelectedPromoIndex(promotions.length);
  };

  const removePromotion = (index) => {
    if (!window.confirm("Eliminar esta promocion?")) return;
    const removed = promotions[index];
    setPromotions((prev) => prev.filter((_, i) => i !== index));
    if (featuredPromotionId === removed?.id) {
      setFeaturedPromotionId("");
    }
    if (selectedPromoIndex >= promotions.length - 1) {
      setSelectedPromoIndex(Math.max(0, promotions.length - 2));
    }
  };

  const updatePackageField = (index, field, value) => {
    setPackages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const updatePackageItem = (pkgIndex, itemIndex, value) => {
    setPackages((prev) =>
      prev.map((p, i) => {
        if (i !== pkgIndex) return p;
        const items = [...p.items];
        items[itemIndex] = value;
        return { ...p, items };
      })
    );
  };

  const addPackageItem = (pkgIndex) => {
    setPackages((prev) =>
      prev.map((p, i) =>
        i === pkgIndex ? { ...p, items: [...p.items, "Nuevo beneficio"] } : p
      )
    );
  };

  const removePackageItem = (pkgIndex, itemIndex) => {
    setPackages((prev) =>
      prev.map((p, i) =>
        i === pkgIndex
          ? { ...p, items: p.items.filter((_, j) => j !== itemIndex) }
          : p
      )
    );
  };

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      { id: `pkg-${Date.now()}`, title: "Nuevo paquete", price: "Desde $0.00", items: ["Beneficio 1"] },
    ]);
  };

  const removePackage = (index) => {
    if (!window.confirm("Eliminar este paquete?")) return;
    setPackages((prev) => prev.filter((_, i) => i !== index));
  };

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(18, 11, 7, 0.92)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    },
    card: {
      width: "100%",
      maxWidth: "900px",
      maxHeight: "92vh",
      background: "#fff",
      borderRadius: "20px",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    },
    header: {
      background: "linear-gradient(135deg, #2c1a0f 0%, #3e2c23 100%)",
      padding: "18px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      color: "#f5e8d3",
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: "18px",
      fontWeight: "700",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    closeBtn: {
      background: "rgba(255,255,255,0.1)",
      border: "none",
      color: "#f5e8d3",
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
    },
    loginBox: {
      padding: "40px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
    },
    loginInput: {
      width: "100%",
      maxWidth: "280px",
      padding: "12px 16px",
      border: "2px solid #d4a373",
      borderRadius: "12px",
      fontSize: "16px",
      textAlign: "center",
      outline: "none",
    },
    loginBtn: {
      padding: "12px 32px",
      background: "linear-gradient(135deg, #3b2a1f, #d4a373)",
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      fontSize: "16px",
      fontWeight: "600",
      cursor: "pointer",
    },
    loginError: {
      color: "#ef4444",
      fontSize: "14px",
    },
    tabs: {
      display: "flex",
      borderBottom: "2px solid #eee",
      flexShrink: 0,
    },
    tab: (active) => ({
      flex: 1,
      padding: "12px",
      border: "none",
      background: active ? "#d4a373" : "transparent",
      color: active ? "#fff" : "#5c4a3a",
      fontWeight: "600",
      fontSize: "14px",
      cursor: "pointer",
      transition: "all 0.2s",
    }),
    content: {
      flex: 1,
      overflow: "auto",
      padding: "16px",
    },
    sectionTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#3b2a1f",
      margin: "0 0 12px 0",
    },
    categoryHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 14px",
      background: "#f5e8d3",
      borderRadius: "10px",
      marginBottom: "6px",
      cursor: "pointer",
      fontWeight: "600",
      color: "#3b2a1f",
    },
    itemRow: {
      display: "flex",
      gap: "8px",
      alignItems: "center",
      marginBottom: "6px",
    },
    itemInput: (flex) => ({
      flex: flex || 1,
      padding: "8px 10px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    }),
    smallBtn: (color) => ({
      background: color || "#ef4444",
      border: "none",
      color: "#fff",
      width: "30px",
      height: "30px",
      borderRadius: "8px",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
    }),
    addBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 14px",
      background: "#22c55e",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "8px",
    },
    promoCard: {
      border: "1px solid #eee",
      borderRadius: "12px",
      padding: "14px",
      marginBottom: "12px",
    },
    promoField: {
      marginBottom: "10px",
    },
    promoLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#5c4a3a",
      marginBottom: "4px",
      display: "block",
    },
    promoInput: {
      width: "100%",
      padding: "8px 10px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
    },
    promoTextarea: {
      width: "100%",
      padding: "8px 10px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      resize: "vertical",
      minHeight: "60px",
    },
    footer: {
      padding: "12px 16px",
      borderTop: "1px solid #eee",
      display: "flex",
      gap: "10px",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
      background: "#fafafa",
    },
    saveBtn: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "10px 20px",
      background: "linear-gradient(135deg, #3b2a1f, #d4a373)",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },
    resetBtn: {
      padding: "10px 16px",
      background: "transparent",
      color: "#ef4444",
      border: "1px solid #ef4444",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
      cursor: "pointer",
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 14px",
      background: "transparent",
      color: "#5c4a3a",
      border: "1px solid #ddd",
      borderRadius: "10px",
      fontSize: "13px",
      cursor: "pointer",
    },
    saveMsg: {
      fontSize: "13px",
      color: "#22c55e",
      fontWeight: "600",
    },
  };

  if (!authenticated) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.card} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.headerTitle}>
              <Lock size={18} /> Panel de Administracion
            </h2>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <form style={styles.loginBox} onSubmit={handleLogin}>
            <Lock size={40} color="#d4a373" />
            <p style={{ color: "#5c4a3a", margin: 0, fontSize: "14px" }}>
              Ingresa la contrasena para acceder
            </p>
            <input
              type="password"
              style={styles.loginInput}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contrasena"
              autoFocus
            />
            {passwordError && <p style={styles.loginError}>{passwordError}</p>}
            <button type="submit" style={styles.loginBtn}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            <Lock size={18} /> Panel de Administracion
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={styles.logoutBtn} onClick={() => setAuthenticated(false)}>
              <LogOut size={14} /> Salir
            </button>
            <button style={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(activeTab === "menu")} onClick={() => setActiveTab("menu")}>
            Menu
          </button>
          <button style={styles.tab(activeTab === "promos")} onClick={() => setActiveTab("promos")}>
            Promociones
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === "menu" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={styles.sectionTitle}>Editar Menu</h3>
                <button style={styles.resetBtn} onClick={resetMenu}>
                  Restaurar por defecto
                </button>
              </div>
              {menuCategories.map((cat) => {
                const isExpanded = expandedCategory === cat.key;
                const items = menuData[cat.key] || [];
                return (
                  <div key={cat.key} style={{ marginBottom: "8px" }}>
                    <div
                      style={styles.categoryHeader}
                      onClick={() => setExpandedCategory(isExpanded ? "" : cat.key)}
                    >
                      <span>
                        {cat.label} ({items.length} items)
                      </span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "10px 0" }}>
                        {items.map(([name, price], i) => (
                          <div key={i} style={styles.itemRow}>
                            <input
                              style={styles.itemInput(3)}
                              value={name}
                              onChange={(e) => updateMenuItem(cat.key, i, 0, e.target.value)}
                              placeholder="Nombre del plato"
                            />
                            <input
                              style={styles.itemInput(1)}
                              value={price}
                              onChange={(e) => updateMenuItem(cat.key, i, 1, e.target.value)}
                              placeholder="$0.00"
                            />
                            <button style={styles.smallBtn("#ef4444")} onClick={() => removeMenuItem(cat.key, i)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button style={styles.addBtn} onClick={() => addMenuItem(cat.key)}>
                          <Plus size={14} /> Agregar item
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "promos" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h3 style={styles.sectionTitle}>Promociones</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={styles.addBtn} onClick={addPromotion}>
                    <Plus size={14} /> Nueva
                  </button>
                  <button style={styles.resetBtn} onClick={resetPromos}>
                    Restaurar
                  </button>
                </div>
              </div>

              {promotions.map((promo, i) => (
                <div key={promo.id} style={styles.promoCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "14px", color: "#3b2a1f" }}>
                      {promo.title || `Promocion ${i + 1}`}
                      {featuredPromotionId === promo.id && (
                        <span style={{ marginLeft: "8px", fontSize: "11px", color: "#d4a373" }}>DESTACADA</span>
                      )}
                    </strong>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={{
                          ...styles.smallBtn(featuredPromotionId === promo.id ? "#d4a373" : "#888"),
                          fontSize: "11px",
                          width: "auto",
                          padding: "0 8px",
                        }}
                        onClick={() => setFeaturedPromotionId(featuredPromotionId === promo.id ? "" : promo.id)}
                      >
                        {featuredPromotionId === promo.id ? "Destacada" : "Destacar"}
                      </button>
                      <button style={styles.smallBtn("#ef4444")} onClick={() => removePromotion(i)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Titulo</label>
                      <input
                        style={styles.promoInput}
                        value={promo.title}
                        onChange={(e) => updatePromoField(i, "title", e.target.value)}
                      />
                    </div>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Tipo</label>
                      <input
                        style={styles.promoInput}
                        value={promo.type}
                        onChange={(e) => updatePromoField(i, "type", e.target.value)}
                      />
                    </div>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Etiqueta</label>
                      <input
                        style={styles.promoInput}
                        value={promo.tag}
                        onChange={(e) => updatePromoField(i, "tag", e.target.value)}
                      />
                    </div>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Duracion</label>
                      <input
                        style={styles.promoInput}
                        value={promo.duration}
                        onChange={(e) => updatePromoField(i, "duration", e.target.value)}
                      />
                    </div>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Fecha inicio</label>
                      <input
                        type="date"
                        style={styles.promoInput}
                        value={promo.startDate || ""}
                        onChange={(e) => updatePromoField(i, "startDate", e.target.value)}
                      />
                    </div>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Fecha fin</label>
                      <input
                        type="date"
                        style={styles.promoInput}
                        value={promo.endDate || ""}
                        onChange={(e) => updatePromoField(i, "endDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={styles.promoField}>
                    <label style={styles.promoLabel}>Descripcion</label>
                    <textarea
                      style={styles.promoTextarea}
                      value={promo.description}
                      onChange={(e) => updatePromoField(i, "description", e.target.value)}
                    />
                  </div>
                  <div style={styles.promoField}>
                    <label style={styles.promoLabel}>Detalle</label>
                    <textarea
                      style={styles.promoTextarea}
                      value={promo.detail}
                      onChange={(e) => updatePromoField(i, "detail", e.target.value)}
                    />
                  </div>
                  <div style={styles.promoField}>
                    <label style={styles.promoLabel}>URL de imagen</label>
                    <input
                      style={styles.promoInput}
                      value={promo.image}
                      onChange={(e) => updatePromoField(i, "image", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              ))}

              <h3 style={{ ...styles.sectionTitle, marginTop: "24px" }}>Paquetes</h3>
              <div style={{ marginBottom: "10px" }}>
                <button style={styles.addBtn} onClick={addPackage}>
                  <Plus size={14} /> Nuevo paquete
                </button>
              </div>
              {packages.map((pkg, i) => (
                <div key={pkg.id} style={styles.promoCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <strong style={{ fontSize: "14px", color: "#3b2a1f" }}>{pkg.title}</strong>
                    <button style={styles.smallBtn("#ef4444")} onClick={() => removePackage(i)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Nombre</label>
                      <input
                        style={styles.promoInput}
                        value={pkg.title}
                        onChange={(e) => updatePackageField(i, "title", e.target.value)}
                      />
                    </div>
                    <div style={styles.promoField}>
                      <label style={styles.promoLabel}>Precio</label>
                      <input
                        style={styles.promoInput}
                        value={pkg.price}
                        onChange={(e) => updatePackageField(i, "price", e.target.value)}
                      />
                    </div>
                  </div>
                  <div style={styles.promoField}>
                    <label style={styles.promoLabel}>Beneficios</label>
                    {pkg.items.map((item, j) => (
                      <div key={j} style={styles.itemRow}>
                        <input
                          style={styles.itemInput()}
                          value={item}
                          onChange={(e) => updatePackageItem(i, j, e.target.value)}
                        />
                        <button style={styles.smallBtn("#ef4444")} onClick={() => removePackageItem(i, j)}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <button style={styles.addBtn} onClick={() => addPackageItem(i)}>
                      <Plus size={12} /> Beneficio
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.footer}>
          <div>
            {saveMessage && <span style={styles.saveMsg}>{saveMessage}</span>}
          </div>
          <button style={styles.saveBtn} onClick={saveAll}>
            <Save size={16} /> Guardar todos los cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
