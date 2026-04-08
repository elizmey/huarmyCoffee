import React from 'react';
import { motion } from 'framer-motion';

const Promociones = () => {
  return (
    <section id="promociones" className="promociones-section" style={{
      padding: '100px 20px',
      background: '#fef9f0',
      textAlign: 'center'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            color: '#3e2c23',
            fontSize: '2.8rem',
            borderBottom: '3px solid #d4a373',
            display: 'inline-block',
            paddingBottom: '10px',
            marginBottom: '50px'
          }}>
            Promociones Especiales
          </h2>
        </motion.div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '30px',
          justifyContent: 'center'
        }}>
          {/* Día de la Madre */}
          <motion.div
            className="promo-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              background: 'white',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              width: '320px',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            whileHover={{ y: -10 }}
          >
            <div style={{
              background: '#d4a373',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '4rem' }}>🌷</span>
              <h3 style={{ marginTop: '15px' }}>Día de la Madre</h3>
            </div>
            <div style={{ padding: '25px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>12 de Mayo</p>
              <p>2x1 en postres especiales</p>
              <p>Vino de cortesía para mamá</p>
              <button style={{
                background: '#3e2c23',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '30px',
                marginTop: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#d4a373'}
              onMouseLeave={(e) => e.target.style.background = '#3e2c23'}>
                Reservar
              </button>
            </div>
          </motion.div>

          {/* Día del Padre */}
          <motion.div
            className="promo-card"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              background: 'white',
              borderRadius: '15px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              width: '320px',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            whileHover={{ y: -10 }}
          >
            <div style={{
              background: '#8b5a2b',
              padding: '30px',
              color: 'white',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '4rem' }}>👔</span>
              <h3 style={{ marginTop: '15px' }}>Día del Padre</h3>
            </div>
            <div style={{ padding: '25px', textAlign: 'center' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>16 de Junio</p>
              <p>15% descuento en cortes especiales</p>
              <p>Cerveza artesanal de regalo</p>
              <button style={{
                background: '#3e2c23',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '30px',
                marginTop: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#d4a373'}
              onMouseLeave={(e) => e.target.style.background = '#3e2c23'}>
                Reservar
              </button>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            marginTop: '50px',
            color: '#8b5a2b',
            fontStyle: 'italic',
            fontSize: '0.95rem'
          }}
        >
          *Próximamente más fechas especiales. Consulta por reservas grupales.
        </motion.p>
      </div>
    </section>
  );
};

export default Promociones;