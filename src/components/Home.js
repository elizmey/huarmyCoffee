import React from "react";
import { motion } from "framer-motion";
import "../assets/css/style.css"; // Si ya es global, puedes quitar esta línea

function Home() {
  return (
    <section className="premium-hero">
      <div className="hero-background">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&auto=format&fit=crop&q=90" // Fondo premium café (cambia por tu imagen real)
          alt="Huarmi Coffee ambiance"
          className="hero-bg-image"
        />
        <div className="hero-overlay" />
      </div>

      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          Huarmi <span>Coffee</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          Donde cada taza cuenta una historia.<br />
          Café de origen artesanal, preparado con pasión y tradición ecuatoriana.
        </motion.p>

        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
        >
          <a href="#menu" className="btn-primary">
            Explorar el Menú
          </a>
          <a href="#nosotros" className="btn-secondary">
            Nuestra Historia
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Home;