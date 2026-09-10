import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useTranslation } from '../i18n';
import '../assets/css/style.css';

const GOOGLE_REVIEWS = [
  {
    id: 'lorenzo',
    name: 'Lorenzo C',
    rating: 5,
    initials: 'LC',
    photo: '/imagenes/clientes/resena-destacada.png',
    metaKey: 'test_lorenzo_meta',
    quoteKey: 'test_lorenzo_quote',
  },
  {
    id: 'ruth',
    name: 'Ruth Guerrero',
    rating: 4,
    initials: 'RG',
    photo: '',
    metaKey: 'test_ruth_meta',
    quoteKey: 'test_ruth_quote',
  },
  {
    id: 'julissa',
    name: 'Julissa Rivera',
    rating: 5,
    initials: 'JR',
    photo: '',
    metaKey: 'test_julissa_meta',
    quoteKey: 'test_julissa_quote',
    scoresKey: 'test_julissa_scores',
  },
] as const;

const ReviewAvatar = ({ name, initials }: { name: string; initials: string }) => (
  <div className="client-review-avatar" aria-hidden="true">
    <span className="client-review-initials">{initials || name.slice(0, 1)}</span>
  </div>
);

const ReviewPhoto = ({ src, alt }: { src: string; alt: string }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      className="client-review-photo"
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
};

const Clients = () => {
  const { t } = useTranslation();

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
          <span className="section-label">{t('test_label')}</span>
          <h2 className="section-title-large">
            {t('test_title_1')} <span>{t('test_title_2')}</span> {t('test_title_3')}
          </h2>
          <p className="section-subtitle-large">{t('test_subtitle')}</p>
          <p className="clients-google-score">
            <strong>{t('test_google_rating')}</strong>
            <span>{t('test_google_count')}</span>
          </p>
        </motion.div>

        <div className="clients-grid-large">
          {GOOGLE_REVIEWS.map((review, index) => (
            <motion.div
              key={review.id}
              className="client-card-large"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
              whileHover={{ y: -6 }}
            >
              <article className="client-review-card">
                <div className="client-review-top">
                  <ReviewAvatar name={review.name} initials={review.initials} />
                  <div className="client-review-meta">
                    <div className="client-review-name-row">
                      <h3>{review.name}</h3>
                    </div>
                    <p>{t(review.metaKey)}</p>
                    <div className="client-review-rating" aria-label={`${review.rating} / 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < review.rating ? 'currentColor' : 'none'}
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="client-review-quote">&ldquo;{t(review.quoteKey)}&rdquo;</p>
                {'scoresKey' in review && review.scoresKey ? (
                  <p className="client-review-scores">{t(review.scoresKey)}</p>
                ) : null}
                {review.photo ? (
                  <ReviewPhoto src={review.photo} alt={t('test_lorenzo_photo')} />
                ) : null}
              </article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Clients;
