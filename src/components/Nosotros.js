import React from "react";
import { motion } from "framer-motion";
import { Coffee, Heart, Leaf } from "lucide-react";
import "../assets/css/style.css";// o importa desde assets/css/style.css si lo prefieres global

const About = () => {
  return (
    <section id="nosotros" className="about-section">
      <div className="container">
        <div className="grid-about">
          {/* Columna izquierda - Texto */}
          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="section-label">NUESTRA HISTORIA</p>
            <h2 className="about-title">
              Más que café,<br />
              <span>una experiencia</span>
            </h2>

            <p className="about-description">
              Huarmy Coffee Restaurant nace de la pasión por la cocina tradicional ecuatoriana,
              bajo la dirección de la Chef Administradora Verónica Rivera y Francisco Rivera.
              "El sabor de la memoria..." es nuestra filosofía: cada plato revive las recetas
              de nuestras abuelas, preparadas con ingredientes frescos y mucho amor.
              Somos un espacio familiar donde la tradición y el sabor se encuentran.
            </p>

            <div className="highlights">
              <div className="highlight-item">
                <div className="icon-circle">
                  <Coffee size={24} />
                </div>
                <div className="highlight-text">
                  <h4>Café de Origen</h4>
                  <p>Seleccionamos los mejores granos de pequeños productores locales.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="icon-circle">
                  <Heart size={24} />
                </div>
                <div className="highlight-text">
                  <h4>Hecho con Amor</h4>
                  <p>Cada preparación es una obra de arte que refleja nuestra pasión.</p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="icon-circle">
                  <Leaf size={24} />
                </div>
                <div className="highlight-text">
                  <h4>Sostenible</h4>
                  <p>Comprometidos con prácticas agrícolas responsables y comercio justo.</p>
                </div>
              </div>
            </div>

            {/* Badge de experiencia */}
            <div className="experience-badge">
              <div className="badge-inner">
                <span className="years">5+</span>
                <span className="label">Años de experiencia</span>
              </div>
            </div>
          </motion.div>

          {/* Columna derecha - Imagen */}
          <motion.div
            className="about-image"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src="https://thumbs.dreamstime.com/b/group-friends-enjoy-hot-drinks-cafe-hands-holding-lattes-coffee-art-relaxing-morning-cozy-eatery-top-view-table-346769672.jpg"
              alt="Variedad de cafés con latte art en mesa de madera"
              className="main-image"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;