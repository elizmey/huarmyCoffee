import React from 'react';
import { motion } from 'framer-motion';
import '../assets/css/style.css';

const Servicios = () => {
  const serviciosList = [
    'Cooking class experiens Ecuadorian food.',
    'Men\u00fa Tur\u00edstico',
    'Cuy asado',
    'Catering Empresarial y para personal.',
    'Coffee Breaks',
    'Brunchs Medio d\u00eda Media tarde',
    'Eventos Empresariales y Banquetes, bodas, bautizos, Grados.',
  ];

  const fotos = [
    '/imagenes/servicios/comida1.jpg',
    '/imagenes/servicios/comida2.jpg',
    '/imagenes/servicios/comida3.jpg',
    '/imagenes/servicios/comida4.jpg',
  ];

  return (
    <section id="servicios" className="servicios-section">
      <div className="servicios-container">
        <motion.div
          className="servicios-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">NUESTROS SERVICIOS</span>
          <h2 className="servicios-title">
            Comida Tradicional <span>Mestiza Ecuatoriana</span>
          </h2>
        </motion.div>

        <div className="servicios-grid">
          <motion.div
            className="servicios-list"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            <ul>
              {serviciosList.map((servicio, index) => (
                <li key={index}>{servicio}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="servicios-gallery"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6 }}
          >
            {fotos.map((foto, index) => (
              <div key={index} className="servicio-imagen">
                <img src={foto} alt={`Foto de servicio ${index + 1}`} loading="lazy" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Servicios;
