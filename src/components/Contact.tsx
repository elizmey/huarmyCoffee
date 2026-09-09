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
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
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
    fetch(apiUrl("/public/configuracion"))
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const s: Record<string, string> = {};
          data.forEach((item: { clave: string; valor: string }) => { s[item.clave] = item.valor; });
          setSettings(prev => ({ ...prev, ...s }));
        }
      })
      .catch(err => console.warn("Usando configuraciones locales.", err));
  }, []);

  const minFecha = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
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
      email ? `${t("contact_email")}: ${email}` : null,
      phone ? `${t("contact_telefono")}: ${phone}` : null,
      fechaHora ? `${t("contact_fecha")}: ${fechaHora.replace('T', ' ')}` : null,
      message ? `${t("contact_whatsapp_mensaje")} ${message}` : null,
    ].filter(Boolean).join("\n");
  }, [t, name, email, phone, message, fechaHora]);

  const defaultWhatsappUrl = `https://wa.me/${settings.whatsapp_matriz}?text=${encodeURIComponent(baseText)}`;

  const openWhatsApp = () => {
    window.open(defaultWhatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus({ type: "", text: "" });
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl("/public/citas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: name.trim(),
          email: email.trim(),
          telefono: phone.trim() || null,
          fecha_hora: fechaHora,
          mensaje: message.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t("contact_reserva_error"));
      setStatus({ type: "ok", text: t("contact_reserva_ok") });
      setMessage("");
      setFechaHora("");
    } catch (err) {
      setStatus({ type: "error", text: (err as Error).message || t("contact_reserva_error") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      {createPortal(
        <div className="whatsapp-float-container">
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

          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="form-card"
            onSubmit={handleSubmit}
          >
            <h3 className="form-title">{t("contact_reservar_titulo")}</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">{t("contact_nombre")}</label>
              <input
                id="contact-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">{t("contact_email")}</label>
              <input
                id="contact-email"
                type="email"
                className="form-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-phone">{t("contact_telefono")}</label>
              <input
                id="contact-phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-fecha">{t("contact_fecha")}</label>
              <input
                id="contact-fecha"
                type="datetime-local"
                className="form-input"
                value={fechaHora}
                min={minFecha}
                onChange={(event) => setFechaHora(event.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">{t("contact_mensaje")}</label>
              <textarea
                id="contact-message"
                rows={4}
                className="form-textarea"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />
            </div>

            {status.text && (
              <p className={status.type === "ok" ? "form-status-ok" : "form-status-error"} role="status">
                {status.text}
              </p>
            )}

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? t("contact_reservando") : t("contact_reservar")}
            </button>

            <button
              type="button"
              className="btn-submit btn-whatsapp btn-submit-secondary"
              onClick={openWhatsApp}
            >
              {t("contact_enviar_whatsapp")}
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
