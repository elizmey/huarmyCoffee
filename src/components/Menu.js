import React from "react";

const Menu = () => {
  const styles = {
    section: {
      padding: "60px 20px",
      background: "linear-gradient(135deg, #fdf8f5 0%, #f9f1ea 100%)",
      minHeight: "100vh"
    },
    container: {
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "'Poppins', 'Arial', sans-serif"
    },
    header: {
      textAlign: "center",
      marginBottom: "50px"
    },
    title: {
      fontSize: "42px",
      color: "#4a3729",
      margin: "0 0 10px 0",
      fontWeight: "600",
      letterSpacing: "-0.5px",
      textShadow: "2px 2px 4px rgba(0,0,0,0.05)"
    },
    subtitle: {
      fontSize: "18px",
      color: "#b17f5a",
      margin: "0",
      fontStyle: "italic",
      position: "relative",
      display: "inline-block"
    },
    subtitleLine: {
      content: "''",
      position: "absolute",
      bottom: "-10px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "60px",
      height: "2px",
      background: "#d4a373"
    },
    category: {
      marginBottom: "45px",
      background: "white",
      borderRadius: "16px",
      padding: "30px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      transition: "transform 0.3s ease",
      border: "1px solid rgba(212, 163, 115, 0.1)"
    },
    categoryTitle: {
      fontSize: "28px",
      color: "#4a3729",
      margin: "0 0 25px 0",
      paddingBottom: "12px",
      borderBottom: "3px solid #d4a373",
      textTransform: "uppercase",
      letterSpacing: "2px",
      fontWeight: "600",
      position: "relative"
    },
    categoryTitleAccent: {
      position: "absolute",
      bottom: "-3px",
      left: "0",
      width: "60px",
      height: "3px",
      background: "#b17f5a"
    },
    itemsContainer: {
      display: "grid",
      gap: "12px"
    },
    item: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
      borderBottom: "1px dashed #e8d9cc",
      transition: "background 0.2s ease",
      cursor: "default"
    },
    itemHover: {
      background: "#fdf8f5"
    },
    itemName: {
      color: "#5c4a3a",
      fontSize: "17px",
      fontWeight: "500",
      lineHeight: "1.4"
    },
    itemPrice: {
      color: "#b17f5a",
      fontSize: "20px",
      fontWeight: "700",
      whiteSpace: "nowrap",
      marginLeft: "20px",
      background: "#f9f1ea",
      padding: "4px 12px",
      borderRadius: "20px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    },
    specialNote: {
      textAlign: "center",
      marginTop: "40px",
      padding: "20px",
      background: "rgba(212, 163, 115, 0.1)",
      borderRadius: "12px",
      color: "#6b4f3a",
      fontSize: "15px",
      fontStyle: "italic",
      border: "1px dashed #d4a373"
    }
  };

  const menuData = {
    mar: [
      ["Caldo de Bolas de verde", "$6.00"],
      ["Encebollado", "$3.00"],
      ["Viche de Pescado", "$6.50"],
      ["Camarones Apanados", "$6.80"],
      ["Salpicón Mariscos mix (pescado, camarón, calamari)", "$6.50"],
      ["Encocado de camarón", "$6.50"],
      ["Ceviche Pescado", "$5.50"],
      ["Ceviche de Camarón", "$6.50"]
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
      ["Ambateño (Chorizo, huevo, tortilla)", "$5.50"]
    ],
    postres: [
      ["Torta de Chocolate", "$2.50"],
      ["Tres Leches", "$3.50"],
      ["Pristiños con Miel", "$2.80"],
      ["Empanada de Viento", "$0.80"]
    ],
    desayunos: [
      ["Tigrillo Huarmy", "$4.00"],
      ["Con Bolón mixto", "$3.80"],
      ["Con Humita", "$3.80"],
      ["Con Panques", "$4.00"],
      ["Continental", "$3.25"],
      ["Completo", "$3.75"]
    ],
    calientes: [
      ["Capuchino", "$2.50"],
      ["Mocachino", "$2.75"],
      ["Café Pasado", "$1.50"],
      ["Chocolate de Ambato", "$2.75"],
      ["Aromáticas", "$1.40"]
    ],
    frias: [
      ["Limonada (Jarra)", "$4.50"],
      ["Gaseosa medio litro", "$1.50"],
      ["Cerveza 1 litro", "$4.00"]
    ]
  };

  return (
    <section id="menu" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Nuestro Menú</h1>
          <p style={styles.subtitle}>"El sabor de la memoria..."</p>
        </div>

        {/* MAR */}
        <div style={styles.category}>
          <h2 style={styles.categoryTitle}>MAR</h2>
          <div style={styles.itemsContainer}>
            {menuData.mar.map(([name, price], i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>{name}</span>
                <span style={styles.itemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SIERRA */}
        <div style={styles.category}>
          <h2 style={styles.categoryTitle}>SIERRA</h2>
          <div style={styles.itemsContainer}>
            {menuData.sierra.map(([name, price], i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>{name}</span>
                <span style={styles.itemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* POSTRES */}
        <div style={styles.category}>
          <h2 style={styles.categoryTitle}>POSTRES</h2>
          <div style={styles.itemsContainer}>
            {menuData.postres.map(([name, price], i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>{name}</span>
                <span style={styles.itemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DESAYUNOS */}
        <div style={styles.category}>
          <h2 style={styles.categoryTitle}>DESAYUNOS</h2>
          <div style={styles.itemsContainer}>
            {menuData.desayunos.map(([name, price], i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>{name}</span>
                <span style={styles.itemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BEBIDAS CALIENTES */}
        <div style={styles.category}>
          <h2 style={styles.categoryTitle}>BEBIDAS CALIENTES</h2>
          <div style={styles.itemsContainer}>
            {menuData.calientes.map(([name, price], i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>{name}</span>
                <span style={styles.itemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BEBIDAS FRÍAS */}
        <div style={styles.category}>
          <h2 style={styles.categoryTitle}>BEBIDAS FRÍAS</h2>
          <div style={styles.itemsContainer}>
            {menuData.frias.map(([name, price], i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>{name}</span>
                <span style={styles.itemPrice}>{price}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.specialNote}>
          🍽️ Todos nuestros platos son preparados al momento con ingredientes frescos y recetas tradicionales
        </div>
      </div>
    </section>
  );
};

export default Menu;