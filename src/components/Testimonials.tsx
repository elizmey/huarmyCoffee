import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "../i18n";
import { apiUrl } from "../api";
import "../assets/css/style.css";

type GaleriaItem = {
  id: number;
  titulo?: string;
  url_imagen: string;
  categoria?: string;
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
          <p style={{ textAlign: "center", color: "#8a7a6a", padding: "40px" }}>
            {t("test_loading") || "Cargando reseñas..."}
          </p>
        ) : clients.length === 0 ? (
          <p style={{ textAlign: "center", color: "#8a7a6a", padding: "40px" }}>
            {t("test_empty") || "Agrega reseñas en Admin → Galería (categoría: reseña)."}
          </p>
        ) : (
          <div className="clients-grid-large">
            {clients.map((client, index) => (
              <motion.div
                key={client.id}
                className="client-card-large"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ scale: 1.04, rotate: index % 2 === 0 ? 1 : -1 }}
              >
                <div className="client-review-card">
                  <div className="client-review-top">
                    <div className="client-review-avatar">
                      <img src={client.url_imagen} alt={client.titulo || "Reseña"} />
                    </div>
                    <div className="client-review-meta">
                      <div className="client-review-name-row">
                        <h3>{client.titulo || t("test_client") || "Cliente"}</h3>
                      </div>
                    </div>
                  </div>
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
