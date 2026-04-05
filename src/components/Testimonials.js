import React from "react";
import { motion } from "framer-motion";
import "../assets/css/style.css";

const Clients = () => {
  const clients = [
    {
      image: "/imagenes/clientes/reseña.png",
      name: "Veronica Rivera",
      meta: "8 reseñas · 6 fotos",
      rating: "★★★★★",
      quote: "El mejor lugar de comida tradicional. Muy bien servicio.",
      highlight: "Nueva",
    },
    {
      image: "/imagenes/clientes/cliente1.jpg",
      name: "Lorenzo C",
      meta: "Local Guide · 12 reseñas · 12 fotos",
      rating: "★★★★★",
      quote: "The best tigrillo I’ve ever eaten. Highly recommended.",
      highlight: "English",
    },
    {
      image: "/imagenes/clientes/cliente2.jpg",
      name: "Familia Huarmy",
      meta: "Visita reciente",
      rating: "★★★★★",
      quote: "Un ambiente cálido, comida deliciosa y atención que se siente en casa.",
      highlight: "Top",
    },
  ];

  return (
    <section id="clientes" className="clients-section-large">
      <div className="clients-container-large">
        <motion.div
          className="clients-header-large"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">NUESTROS CLIENTES</span>
          <h2 className="section-title-large">
            Ellos <span>disfrutan</span> de Huarmy Coffee
          </h2>
          <p className="section-subtitle-large">
            Un espacio donde cada visita es especial. Gracias por ser parte de nuestra familia.
          </p>
        </motion.div>

        <div className="clients-grid-large">
          {clients.map((client, index) => (
            <motion.div
              key={index}
              className="client-card-large"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.04, rotate: index % 2 === 0 ? 1 : -1 }}
            >
              <div className="client-review-card">
                <div className="client-review-top">
                  <div className="client-review-avatar">
                    <img src={client.image} alt={client.name} />
                  </div>

                  <div className="client-review-meta">
                    <div className="client-review-name-row">
                      <h3>{client.name}</h3>
                      <span className="client-review-pill">{client.highlight}</span>
                    </div>
                    <p>{client.meta}</p>
                  </div>
                </div>

                <div className="client-review-rating">{client.rating}</div>

                <p className="client-review-quote">{client.quote}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
