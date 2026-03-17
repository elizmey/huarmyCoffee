import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import "../assets/css/style.css"; // Si ya es global, puedes quitar esta línea

const testimonials = [
  {
    name: "María González",
    role: "Cliente frecuente",
    text: "El mejor café que he probado en la ciudad. Cada visita es una experiencia única.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" // placeholder – cambia por fotos reales
  },
  {
    name: "Carlos Mendoza",
    role: "Foodie local",
    text: "Los postres son increíbles y el cold brew es adictivo. ¡Vuelvo cada semana!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    name: "Ana Lucía Torres",
    role: "Amante del café",
    text: "Huarmi Coffee tiene esa magia especial. El ambiente y el sabor son inigualables.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
  },
  // Puedes agregar más...
];

const TestimonialsPremium = () => {
  return (
    <section id="testimonios" className="premium-testimonials">
      <div className="testimonials-container">
        <motion.div
          className="testimonials-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">LO QUE DICEN NUESTROS CLIENTES</span>
          <h2 className="section-title">
            Historias <span>reales</span> detrás de cada taza
          </h2>
          <p className="section-subtitle">
            La pasión por el café se siente en cada visita. Escucha lo que dicen quienes ya lo vivieron.
          </p>
        </motion.div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: "easeOut"
              }}
              whileHover={{ y: -12, scale: 1.03 }}
            >
              <div className="card-header">
                <div className="avatar">
                  <img src={testimonial.avatar} alt={testimonial.name} />
                </div>
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <span className="author-role">{testimonial.role}</span>
                </div>
              </div>

              <div className="rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < testimonial.rating ? "#d4a373" : "none"}
                    color={i < testimonial.rating ? "#d4a373" : "#e0d5c0"}
                  />
                ))}
              </div>

              <blockquote className="testimonial-text">
                "{testimonial.text}"
              </blockquote>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsPremium;