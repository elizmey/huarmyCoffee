import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";
import "../assets/css/style.css";

const contactInfo = [
  { icon: MapPin, label: "Dirección", value: "Av. Equinoccial, Quito" },
  { icon: Phone, label: "Teléfono", value: "0983436356" },
  { icon: Mail, label: "Email", value: "hola@huarmicoffee.com" },
  {
    icon: Clock,
    label: "Horarios",
    value: "Lun - Sáb: 7:00 - 21:00 | Dom: 8:00 - 18:00",
  },
];

const Contact = () => {
  return (
    <section id="contacto" className="contact-section">
      <div className="container">
        <div className="grid-2-cols">
          {/* Izquierda - Información */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase-tracking">Contáctanos Hoy</p>
            <h2 className="title-big">Visítanos Hoy</h2>

            <p className="text-soft">
              Te esperamos con una taza recién preparada. Ven a descubrir por qué Huarmi Coffee es el lugar favorito de nuestra comunidad.
            </p>

            <div>
              {contactInfo.map((item) => (
                <div key={item.label} className="info-item">
                  <div className="icon-circle">
                    <item.icon />
                  </div>
                  <div>
                    <p className="font-medium text-[#f5e8d3]">{item.label}</p>
                    <p className="text-[#d9c2a6] text-sm mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="social-icons">
              <a
                href="https://instagram.com/huarm.y2026"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Instagram />
              </a>
              <a href="#" className="social-link">
                <Facebook />
              </a>
            </div>
          </motion.div>

          {/* Derecha - Formulario */}
          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="form-card"
            onSubmit={(e) => e.preventDefault()}
          >
            <h3 className="form-title">Envíanos un Mensaje</h3>

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                placeholder="tu@email.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <textarea
                rows={5}
                placeholder="¿En qué podemos ayudarte?"
                className="form-textarea"
              />
            </div>

            <button type="submit" className="btn-submit">
              Enviar Mensaje
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;