import React from "react";
import { motion } from "framer-motion";
import "../assets/css/style.css";

function Home() {
  return (
    <section id="inicio" className="premium-hero">
      <div className="hero-background">
        <img
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&auto=format&fit=crop&q=90"
          alt="Huarmy Coffee ambiance"
          className="hero-bg-image"
        />
        <div className="hero-overlay" />
      </div>

      {/* 🔥 TODO el contenido centrado */}
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
          Huarmy Coffee Catering Restaurant
        </motion.h1>

        <motion.p
          className="hero-sostenible"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#d4a373',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '15px'
          }}
        >
          🌱 Compromiso sostenible: Alimentación Equilibrada y saludable para Empresas y grupos.
        </motion.p>

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

        {/* 🔥 MOVIDO AQUÍ */}
        <motion.p
          className="hero-location"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
        >
          📍 Av. Equinoccial &, Quito | 🕒 8:00 AM - 5:30 PM
        </motion.p>

        <a href="#ubicacion" className="btn-maps">
          Ver ubicación
        </a>
      </motion.div>
    </section>
  );
}

export default Home;
