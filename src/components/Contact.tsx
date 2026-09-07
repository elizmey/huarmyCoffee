import React, { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";
import "../assets/css/style.css";
import { apiUrl } from "../api";
import { useTranslation } from "../i18n";

const Contact = () => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    sitio_nombre: "Huarmy Coffee",
    email_contacto: "huarmycoffee@gmail.com",
    telefono_contacto: "0983436356",
    telefono_local: "025185964",
    horario_atencion: "Lunes a Domingo: 8:00 - 17:30",
    direccion_matriz: "Av. Equinoccial &, Quito",
    whatsapp_matriz: "593983436356"
  });

  useEffect(() => {
    // Fetch Settings
    fetch(apiUrl("/public/configuracion"))
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const s = {};
          data.forEach(item => { s[item.clave] = item.valor; });
          setSettings(prev => ({ ...prev, ...s }));
        }
      })
      .catch(err => console.warn("Usando configuraciones locales.", err));
  }, []);

  const contactInfo = [
    { icon: MapPin, label: t("contact_direccion"), value: settings.direccion_matriz },
    { icon: Phone, label: t("contact_telefono"), value: settings.telefono_contacto },
    { icon: Phone, label: t("contact_local"), value: settings.telefono_local },
    { icon: Mail, label: t("contact_email"), value: settings.email_contacto },
    { icon: Clock, label: t("contact_horarios"), value: settings.horario_atencion },
  ];

  const baseText = useMemo(() => {
    return [
      t("contact_whatsapp_intro"),
      name ? `${t("contact_whatsapp_nombre")} ${name}` : null,
      message ? `${t("contact_whatsapp_mensaje")} ${message}` : null,
    ].filter(Boolean).join("\n");
  }, [t, name, message]);

  const defaultWhatsappUrl = `https://wa.me/${settings.whatsapp_matriz}?text=${encodeURIComponent(baseText)}`;

  return (
    <section id="contact" className="contact-section">
      {/* Floating WhatsApp Button — redirige directo a WhatsApp */}
      {createPortal(
        <div className="whatsapp-float-container">
          {/* Pulse ring animation */}
          <span className="whatsapp-pulse-ring" />
          <a
            href={defaultWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("contact_chatear_whatsapp")}
            className="whatsapp-floating-button"
          >
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </a>
        </div>,
        document.body
      )}

      <div className="container">
        <div className="grid-2-cols">
          {/* Izquierda - Información */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <p className="uppercase-tracking">{t("contact_contactanos_hoy")}</p>
            <h2 className="title-big">{t("contact_visitanos_hoy")}</h2>

            <p className="text-soft">
              {t("contact_intro")}
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
                href="https://www.facebook.com/groups/2761410240810200/user/100000261163987"
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
                aria-label={t("contact_enviar_correo")}
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
              window.open(defaultWhatsappUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <h3 className="form-title">{t("contact_envianos_mensaje")}</h3>

            <div className="form-group">
              <label className="form-label">{t("contact_nombre")}</label>
              <input
                type="text"
                placeholder={t("contact_placeholder_nombre")}
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t("contact_mensaje")}</label>
              <textarea
                rows={5}
                placeholder={t("contact_placeholder_mensaje")}
                className="form-textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            <button type="submit" className="btn-submit btn-whatsapp">
              {t("contact_enviar_whatsapp")}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
