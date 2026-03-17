import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Star, CakeSlice, Leaf } from "lucide-react";

const categories = [
  { id: "clasicos", name: "Clásicos", icon: Coffee, color: "#d4a373" },
  { id: "especiales", name: "Especialidades", icon: Star, color: "#b08968" },
  { id: "reposteria", name: "Repostería", icon: CakeSlice, color: "#a0785a" },
  { id: "saludable", name: "Opciones Saludables", icon: Leaf, color: "#8a6d52" },
];

const menuItems = {
  clasicos: [
    { name: "Espresso Doble", price: "2.80", desc: "Intenso shot doble con crema densa y persistente", img: "https://images.unsplash.com/photo-1494314671902-399b18174975?w=800" },
    { name: "Cappuccino Clásico", price: "3.90", desc: "Espresso, leche vaporizada y espuma sedosa en proporción perfecta", img: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800" },
    { name: "Flat White", price: "4.20", desc: "Doble ristretto con microespuma aterciopelada", img: "https://images.unsplash.com/photo-1577968898879-3a5a4e8d7e3f?w=800" },
    { name: "Café Americano", price: "3.10", desc: "Espresso diluido con agua caliente filtrada a 92°C", img: "https://images.unsplash.com/photo-1554110397-9bac083977c6?w=800" },
  ],
  especiales: [
    { name: "Caramel Brûlée Latte", price: "5.50", desc: "Espresso, leche, caramelo quemado y toque de vainilla bourbon", img: "https://images.unsplash.com/photo-1577968898879-3a5a4e8d7e3f?w=800" },
    { name: "Mocha Oscuro 70%", price: "5.20", desc: "Chocolate negro 70% cacao, espresso y leche cremosa", img: "https://images.unsplash.com/photo-1581056771107-1be9d8b4d4e7?w=800" },
    { name: "Matcha ceremonial latte", price: "6.20", desc: "Matcha japonés premium con leche de avena y miel cruda", img: "https://images.unsplash.com/photo-1570545887596-2a6eba775d2c?w=800" },
    { name: "Cold Brew Nitrógeno", price: "5.80", desc: "Cold brew infusionado con nitrógeno – textura de stout", img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
  ],
  reposteria: [
    { name: "Croissant de mantequilla", price: "2.90", desc: "Láminas crujientes, 48 horas de fermentación", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800" },
    { name: "Tarta de chocolate & avellana", price: "5.50", desc: "Ganache de chocolate 64% y praliné casero", img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800" },
    { name: "Tiramisú artesanal", price: "6.20", desc: "Mascarpone italiano, café espresso y cacao amargo", img: "https://images.unsplash.com/photo-1637806930600-37fa8892069f?w=800" },
    { name: "Cookie de triple chocolate", price: "3.80", desc: "Chocolate negro, leche y blanco fundido", img: "https://images.unsplash.com/photo-1612201142855-7873bc1661b4?w=800" },
  ],
  saludable: [
    { name: "Açaí Bowl Premium", price: "7.90", desc: "Açaí orgánico, granola casera, frutas frescas y semillas", img: "https://images.unsplash.com/photo-1590133733146-8a9e7a0d38e3?w=800" },
    { name: "Avocado Toast con huevo poché", price: "6.80", desc: "Pan de masa madre, aguacate Hass y aceite de oliva virgen", img: "https://images.unsplash.com/photo-1525351326368-efbb5cb6814d?w=800" },
    { name: "Bowl de yogur griego & frutos rojos", price: "5.90", desc: "Yogur natural, miel de abeja nativa y granola sin azúcar", img: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=800" },
  ],
};

const MenuPremium = () => {
  const [activeCategory, setActiveCategory] = useState("clasicos");

  const currentItems = menuItems[activeCategory] || [];

  return (
    <section className="premium-menu-section">
      <div className="premium-container">
        <div className="menu-hero">
          <span className="menu-label">CARTA</span>
          <h1 className="menu-title">
            Nuestro <span>Menú</span>
          </h1>
          <p className="menu-subtitle">
            Experiencia artesanal en cada taza y bocado
          </p>
        </div>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`tab-btn ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{ "--accent": cat.color }}
            >
              <cat.icon size={20} />
              {cat.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="menu-grid"
          >
            {currentItems.map((item, index) => (
              <motion.div
                key={index}
                className="premium-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="card-image">
                  <img src={item.img} alt={item.name} loading="lazy" />
                  <div className="image-overlay" />
                </div>

                <div className="card-content">
                  <div className="card-header">
                    <h3 className="item-name">{item.name}</h3>
                    <span className="item-price">{item.price} €</span>
                  </div>
                  <p className="item-desc">{item.desc}</p>
                </div>

                <div className="card-footer">
                  <button className="btn-add">+ Añadir</button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuPremium;