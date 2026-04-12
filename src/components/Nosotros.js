import React from "react";
import { motion } from "framer-motion";
import { Coffee, Heart, Leaf } from "lucide-react";
import "../assets/css/style.css";

const Nosotros = () => {
  return (
    <section id="nosotros" className="about-section">
      <div className="container">
        <div className="grid-about">
          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <p className="section-label">NUESTRA HISTORIA</p>
            <h2 className="about-title">
              Más que café,
              <br />
              <span>una experiencia</span>
            </h2>

            <p className="about-description">
              En Huarmy Coffee Restaurant, bajo la dirección de la Chef
              Verónica Rivera y Francisco Rivera, evolucionamos el "sabor de la
              memoria" hacia una propuesta de alimentación equilibrada y
              saludable para empresas y grupos.
              Creemos que la productividad de un equipo nace de una nutrición
              consciente. Por eso, diseñamos experiencias gastronómicas para
              eventos especiales que fusionan las recetas tradicionales de
              nuestras abuelas con un enfoque balanceado, utilizando
              ingredientes frescos y porciones cuidadas. 
              Somos el aliado estratégico de tu empresa para transformar la
              alimentación diaria en un momento de bienestar, calidez y alto
              valor nutricional.
              <br />
              <br />

            </p>

            <div className="highlights">
              <div className="highlight-item">
                <div className="icon-circle">
                  <Coffee size={22} />
                </div>
                <div className="highlight-text">
                  <h4>Nutrición Equilibrada</h4>
                  <p>
                    Diseñamos menús balanceados pensados para cuidar la energía
                    y el bienestar de cada equipo.
                  </p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="icon-circle">
                  <Heart size={22} />
                </div>
                <div className="highlight-text">
                  <h4>Recetas con Tradición</h4>
                  <p>
                    Fusionamos el sabor de la memoria con recetas caseras,
                    ingredientes frescos y una presentación cuidada.
                  </p>
                </div>
              </div>

              <div className="highlight-item">
                <div className="icon-circle">
                  <Leaf size={22} />
                </div>
                <div className="highlight-text">
                  <h4>Servicio para Empresas</h4>
                  <p>
                    Somos aliados estratégicos para eventos, grupos y jornadas
                    corporativas con atención cálida y puntual.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="about-image"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <img
              src="/nosotros/image.png"
              alt="Variedad de cafés con latte art en mesa de madera"
              className="main-image"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Nosotros;
