import React from "react";
import { motion } from "framer-motion";
import "../assets/css/style.css";

const Clients = () => {
  const clients = [
    { image: "/imagenes/clientes/cliente1.jpg", name: "Cliente 1" },
    { image: "/imagenes/clientes/cliente2.jpg", name: "Cliente 2" },
    { image: "/imagenes/clientes/cliente3.jpg", name: "Cliente 3" },
    { image: "/imagenes/clientes/cliente4.jpg", name: "Cliente 4" },
    { image: "/imagenes/clientes/cliente5.jpg", name: "Cliente 5" }
  ];

  return (
    <section id="clientes" className="clients-section-large">
      <div className="clients-container-large">
        <motion.div
          className="clients-header-large"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
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
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ scale: 1.08, rotate: 2 }}
            >
              <div className="client-image-large">
                <img src={client.image} alt={`Cliente ${index + 1}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;