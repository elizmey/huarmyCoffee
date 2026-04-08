import React from 'react';
import { motion } from 'framer-motion';

const Promociones = () => {
  const promociones = [
    {
      id: 1,
      nombre: "Día de la Madre",
      fecha: "12 de Mayo",
      descuento: "2x1 en postres",
      detalle: "Vino de cortesía para mamá",
      icono: "🌷",
      color: "#d4a373",
      vigencia: "Válido hasta el 12 de Mayo"
    },
    {
      id: 2,
      nombre: "Día del Padre",
      fecha: "16 de Junio",
      descuento: "15% OFF",
      detalle: "Cerveza artesanal de regalo",
      icono: "👔",
      color: "#8b5a2b",
      vigencia: "Válido hasta el 16 de Junio"
    },
    {
      id: 3,
      nombre: "Happy Hour",
      fecha: "Todos los Viernes",
      descuento: "2x1 en Café",
      detalle: "De 4:00 PM a 7:00 PM",
      icono: "☕",
      color: "#3e2c23",
      vigencia: "Todos los viernes"
    }
  ];

  return (
    <section id="promociones" style={{
      padding: '100px 20px',
      background: 'linear-gradient(135deg, #fef9f0 0%, #fff5e6 100%)',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span style={{
            fontSize: '0.9rem',
            letterSpacing: '3px',
            color: '#8b5a2b',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '10px'
          }}>
            OFERTAS ESPECIALES
          </span>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            color: '#3e2c23',
            fontSize: '3rem',
            borderBottom: '3px solid #d4a373',
            display: 'inline-block',
            paddingBottom: '10px',
            marginBottom: '20px'
          }}>
            Promociones
          </h2>
          <p style={{
            color: '#6B4F3C',
            fontSize: '1.1rem',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px'
          }}>
            Disfruta de nuestras ofertas por tiempo limitado
          </p>
        </motion.div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center'
        }}>
          {promociones.map((promo, index) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ 
                y: -15,
                transition: { duration: 0.3 }
              }}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                width: '320px',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {/* Etiqueta de descuento */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '-30px',
                background: '#d4a373',
                color: 'white',
                padding: '8px 40px',
                transform: 'rotate(45deg)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                zIndex: 10
              }}>
                {promo.descuento}
              </div>

              {/* Cabecera con icono */}
              <div style={{
                background: promo.color,
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '5rem' }}>{promo.icono}</span>
                <h3 style={{ 
                  color: 'white', 
                  marginTop: '15px',
                  fontSize: '1.8rem',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {promo.nombre}
                </h3>
              </div>

              {/* Contenido */}
              <div style={{ padding: '25px', textAlign: 'center' }}>
                <p style={{ 
                  fontSize: '1.3rem', 
                  fontWeight: 'bold', 
                  color: '#3e2c23',
                  marginBottom: '15px'
                }}>
                  📅 {promo.fecha}
                </p>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#666',
                  marginBottom: '10px'
                }}>
                  {promo.detalle}
                </p>
                <p style={{
                  fontSize: '0.85rem',
                  color: '#d4a373',
                  fontStyle: 'italic',
                  marginBottom: '20px'
                }}>
                  {promo.vigencia}
                </p>
                <button
                  style={{
                    background: 'transparent',
                    color: '#3e2c23',
                    border: '2px solid #d4a373',
                    padding: '12px 30px',
                    borderRadius: '40px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d4a373';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#3e2c23';
                  }}
                >
                  Reservar ahora →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            marginTop: '60px',
            color: '#8b5a2b',
            fontStyle: 'italic',
            fontSize: '0.9rem',
            background: 'rgba(139, 90, 43, 0.1)',
            display: 'inline-block',
            padding: '12px 24px',
            borderRadius: '50px'
          }}
        >
          💡 *Más promociones disponibles para eventos empresariales. Consulta con nosotros.*
        </motion.p>
      </div>
    </section>
  );
};

export default Promociones;