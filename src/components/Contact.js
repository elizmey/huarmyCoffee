import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import "../assets/css/style.css";

const WHATSAPP_NUMBER = "593983436356";

const contactInfo = [
  { icon: MapPin, label: "Dirección", value: "Av. Equinoccial &, Quito" },
  { icon: Phone, label: "Teléfono", value: "0983436356" },
  { icon: Phone, label: "Local", value: "025185964" },
  { icon: Mail, label: "Email", value: "huarmycoffee@gmail.com" },
  {
    icon: Clock,
    label: "Horarios",
    value: "Lunes a Domingo: 8:00 - 17:30",
  },
];

const Contact = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const whatsappUrl = useMemo(() => {
    const baseMessage = [
      "Hola Huarmy Coffee, tengo un mensaje desde la web.",
      name ? `Nombre: ${name}` : null,
      message ? `Mensaje: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(baseMessage)}`;
  }, [name, message]);

  return (
    <section id="contact" className="contact-section">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-floating-button"
        aria-label="Contáctanos por WhatsApp"
      >
        <MessageCircle />
        <span>Contáctanos</span>
      </a>

      <div className="container">
        <div className="grid-2-cols">
          {/* Izquierda - Información */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase-tracking">Contáctanos Hoy</p>
            <h2 className="title-big">Visítanos Hoy</h2>

            <p className="text-soft">
              Te esperamos con una taza recién preparada. Ven a descubrir por qué Huarmy Coffee es el lugar favorito
              de nuestra comunidad.
            </p>

            <div>
              {contactInfo.map((item) => (
                <div key={item.label} className="info-item">
                  <div className="icon-circle">
                    <item.icon />
                  </div>
                  <div>
                    <p className="contact-item-label">{item.label}</p>
                    <p className="contact-item-value">{item.value}</p>
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
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <Facebook />
              </a>
              <a
                href="mailto:huarmycoffee@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Enviar correo"
              >
                <Mail />
              </a>
            </div>
          </motion.div>

          {/* Derecha - Formulario WhatsApp */}
          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="form-card"
            onSubmit={(event) => {
              event.preventDefault();
              window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <h3 className="form-title">Envíanos un Mensaje</h3>

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mensaje</label>
              <textarea
                rows={5}
                placeholder="¿En qué podemos ayudarte?"
                className="form-textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit btn-whatsapp">
              Enviar por WhatsApp
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
