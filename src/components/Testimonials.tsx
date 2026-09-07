import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useTranslation } from "../i18n";
import { apiUrl } from "../api";
import "../assets/css/style.css";

type GaleriaItem = {
  id: number;
  titulo?: string;
  url_imagen: string;
  categoria?: string;
  autor?: string | null;
  comentario?: string | null;
  calificacion?: number | null;
};

const Clients = () => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/public/galeria"))
      .then((r) => r.json())
      .then((rows: GaleriaItem[]) => {
        if (!Array.isArray(rows)) {
          setClients([]);
          return;
        }
        const reviews = rows.filter((item) => {
          const cat = (item.categoria || "").toLowerCase();
          return cat === "reseña" || cat === "resena" || cat === "review" || cat === "cliente";
        });
        setClients(reviews);
      })
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

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
          <span className="section-label">{t("test_label")}</span>
          <h2 className="section-title-large">
            {t("test_title_1")} <span>{t("test_title_2")}</span> {t("test_title_3")}
          </h2>
          <p className="section-subtitle-large">{t("test_subtitle")}</p>
        </motion.div>

        {loading ? (
          <p className="section-status-text section-status-text--block">
            {t("test_loading") || "Cargando reseñas..."}
          </p>
        ) : clients.length === 0 ? (
          <p className="section-status-text section-status-text--block">
            {t("test_empty") || "Agrega reseñas en Admin → Galería (categoría: reseña)."}
          </p>
        ) : (
          <div className="clients-grid-large">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                className="client-card-large"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6 }}
              >
                <div className="client-review-card">
                  <div className="client-review-top">
                    <div className="client-review-avatar">
                      <img src={client.url_imagen} alt={client.autor || client.titulo || "Reseña"} />
                    </div>
                    <div className="client-review-meta">
                      <div className="client-review-name-row">
                        <h3>{client.autor || client.titulo || t("test_client") || "Cliente"}</h3>
                      </div>
                      <div className="client-review-rating" aria-label={`${client.calificacion || 5} de 5 estrellas`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} fill={i < (client.calificacion || 5) ? 'currentColor' : 'none'} strokeWidth={1.5} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {client.comentario && (
                    <p className="client-review-quote">&ldquo;{client.comentario}&rdquo;</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Clients;
