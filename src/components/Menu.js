import React, { useEffect, useState } from "react";
import { fetchData } from "../f";

const initialMenuData = {
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

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("mar");
  const [menuData, setMenuData] = useState(initialMenuData);

  useEffect(() => {
    let active = true;
    const loadFromFirebase = async () => {
      const { menu } = await fetchData();
      if (active && menu) {
        setMenuData({ ...initialMenuData, ...menu });
      }
    };
    loadFromFirebase();
    return () => { active = false; };
  }, []);

  const styles = {
    section: {
      padding: "70px 20px",
      background: "linear-gradient(135deg, #fdf8f5 0%, #f3e9e2 100%)",
      minHeight: "100vh",
    },
    container: {
      maxWidth: "950px",
      margin: "0 auto",
      fontFamily: "'Poppins', 'Arial', sans-serif",
    },
    header: {
      textAlign: "center",
      marginBottom: "60px",
    },
    title: {
      fontSize: "44px",
      color: "#3b2a1f",
      margin: "0 0 10px 0",
      fontWeight: "700",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      fontSize: "18px",
      color: "#b17f5a",
      margin: "0",
      fontStyle: "italic",
    },
    category: {
      marginBottom: "45px",
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(8px)",
      borderRadius: "18px",
      padding: "30px",
      boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
      border: "1px solid rgba(212, 163, 115, 0.2)",
      transition: "all 0.3s ease",
    },
    categoryTitle: {
      fontSize: "26px",
      color: "#4a3729",
      margin: "0 0 20px 0",
      paddingBottom: "10px",
      borderBottom: "2px solid #d4a373",
      textTransform: "uppercase",
      letterSpacing: "2px",
      fontWeight: "600",
    },
    itemsContainer: {
      display: "grid",
      gap: "10px",
    },
    item: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 10px",
      borderRadius: "10px",
      borderBottom: "1px dashed #e8d9cc",
      transition: "all 0.25s ease",
      cursor: "default",
    },
    itemName: {
      color: "#5c4a3a",
      fontSize: "17px",
      fontWeight: "500",
    },
    itemPrice: {
      color: "#fff",
      fontSize: "15px",
      fontWeight: "600",
      background: "linear-gradient(135deg, #b17f5a, #d4a373)",
      padding: "5px 14px",
      borderRadius: "20px",
    },
    specialNote: {
      textAlign: "center",
      marginTop: "50px",
      padding: "20px",
      background: "rgba(212, 163, 115, 0.15)",
      borderRadius: "12px",
      color: "#6b4f3a",
      fontSize: "15px",
      fontStyle: "italic",
      border: "1px dashed #d4a373",
    },
    compactCategory: {
      padding: "22px",
      marginBottom: "30px",
      maxHeight: "620px",
      overflow: "auto",
    },
    compactCategoryTitle: {
      fontSize: "22px",
      marginBottom: "16px",
    },
    compactItemsContainer: {
      gap: "8px",
    },
    compactItem: {
      padding: "10px 8px",
    },
    compactItemName: {
      fontSize: "15px",
    },
    compactItemPrice: {
      fontSize: "13px",
      padding: "4px 12px",
    },
    compactSpecialNote: {
      marginTop: "28px",
      padding: "16px",
      fontSize: "14px",
    },
  };

  const activeItems = menuData[activeCategory] || [];
  const isLargeList = activeItems.length > 5;
  const categoryStyle = isLargeList ? { ...styles.category, ...styles.compactCategory } : styles.category;
  const categoryTitleStyle = isLargeList
    ? { ...styles.categoryTitle, ...styles.compactCategoryTitle }
    : styles.categoryTitle;
  const itemsContainerStyle = isLargeList
    ? { ...styles.itemsContainer, ...styles.compactItemsContainer }
    : styles.itemsContainer;
  const itemStyle = isLargeList ? { ...styles.item, ...styles.compactItem } : styles.item;
  const itemNameStyle = isLargeList ? { ...styles.itemName, ...styles.compactItemName } : styles.itemName;
  const itemPriceStyle = isLargeList ? { ...styles.itemPrice, ...styles.compactItemPrice } : styles.itemPrice;
  const specialNoteStyle = isLargeList ? { ...styles.specialNote, ...styles.compactSpecialNote } : styles.specialNote;

  return (
    <section id="menu" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Nuestro Menu</h1>
          <p style={styles.subtitle}>"El sabor de la memoria..."</p>

          <div className="menu-tabs">
            <button className={activeCategory === "mar" ? "active" : ""} onClick={() => setActiveCategory("mar")}>
              MAR
            </button>
            <button className={activeCategory === "sierra" ? "active" : ""} onClick={() => setActiveCategory("sierra")}>
              SIERRA
            </button>
            <button
              className={activeCategory === "postres" ? "active" : ""}
              onClick={() => setActiveCategory("postres")}
            >
              POSTRES
            </button>
            <button
              className={activeCategory === "desayunos" ? "active" : ""}
              onClick={() => setActiveCategory("desayunos")}
            >
              DESAYUNOS
            </button>
            <button
              className={activeCategory === "calientes" ? "active" : ""}
              onClick={() => setActiveCategory("calientes")}
            >
              CALIENTES
            </button>
            <button className={activeCategory === "frias" ? "active" : ""} onClick={() => setActiveCategory("frias")}>
              FRIAS
            </button>
          </div>
        </div>

        <div style={categoryStyle} className="menu-card">
          <h2 style={categoryTitleStyle}>{activeCategory.toUpperCase()}</h2>

          <div style={itemsContainerStyle}>
            {activeItems.length > 0 ? (
              activeItems.map(([name, price], i) => (
                <div key={i} style={itemStyle} className="menu-item">
                  <span style={itemNameStyle}>{name}</span>
                  <span style={itemPriceStyle}>{price}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#7b5a43", textAlign: "center", padding: "12px 0" }}>
                No hay items en esta categoria.
              </div>
            )}
          </div>
        </div>

        <div style={specialNoteStyle}>
          Todos nuestros platos son preparados al momento con ingredientes frescos y recetas tradicionales
        </div>

        <div style={{ textAlign: "center", marginTop: "18px" }}>
          <a
            href="#promociones"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "14px 24px",
              borderRadius: "999px",
              textDecoration: "none",
              color: "#fff",
              background: "linear-gradient(135deg, #3b2a1f, #d4a373)",
              boxShadow: "0 16px 34px rgba(44, 26, 15, 0.2)",
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}
          >
            Ver promociones
          </a>
        </div>
      </div>
    </section>
  );
};

export default Menu;
