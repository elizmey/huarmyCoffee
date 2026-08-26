import React, { useEffect, useState } from "react";
import { useTranslation } from "../i18n";
import { apiUrl } from "../api";

type MenuItem = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria_id?: number;
  categoria_nombre?: string;
};

type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

const formatPrice = (value: number) => {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return `$${n.toFixed(2)}`;
};

const Menu = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/public/servicios"))
      .then((r) => r.json())
      .then((rows: MenuItem[]) => {
        if (!Array.isArray(rows)) {
          setCategories([]);
          return;
        }
        const grouped: Record<string, MenuCategory> = {};
        rows.forEach((item) => {
          const key = String(item.categoria_id ?? "otros");
          const name = item.categoria_nombre || "Otros";
          if (!grouped[key]) grouped[key] = { id: key, name, items: [] };
          grouped[key].items.push(item);
        });
        const list = Object.values(grouped);
        setCategories(list);
        if (list.length) setActiveCategory(list[0].id);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const active = categories.find((c) => c.id === activeCategory);
  const activeItems = active?.items ?? [];

  const styles: Record<string, React.CSSProperties> = {
    section: {
      padding: "70px 20px",
      background: "linear-gradient(135deg, #fdf8f5 0%, #f3e9e2 100%)",
      minHeight: "60vh",
    },
    container: { maxWidth: "950px", margin: "0 auto", fontFamily: "'Poppins', 'Arial', sans-serif" },
    header: { textAlign: "center", marginBottom: "40px" },
    title: { fontSize: "44px", color: "#3b2a1f", margin: "0 0 10px 0", fontWeight: "700" },
    subtitle: { fontSize: "18px", color: "#b17f5a", margin: 0, fontStyle: "italic" },
    category: {
      marginBottom: "45px",
      background: "rgba(255,255,255,0.85)",
      borderRadius: "18px",
      padding: "30px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
      border: "1px solid rgba(212, 163, 115, 0.2)",
    },
    categoryTitle: {
      fontSize: "26px",
      color: "#4a3729",
      margin: "0 0 20px 0",
      paddingBottom: "10px",
      borderBottom: "2px solid #d4a373",
      textTransform: "uppercase",
    },
    itemsContainer: { display: "grid", gap: "10px" },
    item: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 10px",
      borderRadius: "10px",
      borderBottom: "1px dashed #e8d9cc",
    },
    itemName: { color: "#5c4a3a", fontSize: "17px", fontWeight: "500" },
    itemPrice: {
      color: "#fff",
      fontSize: "15px",
      fontWeight: "600",
      background: "linear-gradient(135deg, #b17f5a, #d4a373)",
      padding: "5px 14px",
      borderRadius: "20px",
    },
    empty: { textAlign: "center", padding: "40px 20px", color: "#8a7a6a" },
  };

  return (
    <section id="menu" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>{t("menu_title")}</h1>
          <p style={styles.subtitle}>{t("menu_subtitle")}</p>

          {categories.length > 0 && (
            <div className="menu-tabs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={activeCategory === cat.id ? "active" : ""}
                  onClick={() => setActiveCategory(cat.id)}
                  type="button"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <p style={styles.empty}>{t("menu_loading") || "Cargando menú..."}</p>
        ) : categories.length === 0 ? (
          <p style={styles.empty}>
            {t("menu_empty") || "El menú se publicará pronto. Gestiona categorías y servicios desde el panel admin."}
          </p>
        ) : (
          <div style={styles.category} className="menu-card">
            <h2 style={styles.categoryTitle}>{active?.name}</h2>
            <div style={styles.itemsContainer}>
              {activeItems.map((item) => (
                <div key={item.id} style={styles.item} className="menu-item">
                  <span style={styles.itemName}>{item.nombre}</span>
                  <span style={styles.itemPrice}>{formatPrice(item.precio)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
