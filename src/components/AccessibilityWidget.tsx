import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Eye, ZoomIn, ZoomOut, Check, Volume2, Images, StopCircle } from 'lucide-react';
import { useTranslation, languages } from '../i18n';

const readStoredInt = (key: string, fallback: number) => {
  const v = localStorage.getItem(key);
  const n = v ? parseInt(v, 10) : fallback;
  return Number.isFinite(n) ? n : fallback;
};

const readStoredBool = (key: string) => localStorage.getItem(key) === 'true';

const AccessibilityWidget = () => {
  const { lang, changeLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(() => readStoredInt('access_fontSize', 100));
  const [highContrast, setHighContrast] = useState(() => readStoredBool('access_highContrast'));
  const [grayscale, setGrayscale] = useState(() => readStoredBool('access_grayscale'));
  const [legibleFont, setLegibleFont] = useState(() => readStoredBool('access_legibleFont'));
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const closeMe = () => setIsOpen(false);
    const openMe = () => setIsOpen(true);
    window.addEventListener('whatsapp:open', closeMe);
    window.addEventListener('accessibility:open', openMe);
    return () => {
      window.removeEventListener('whatsapp:open', closeMe);
      window.removeEventListener('accessibility:open', openMe);
    };
  }, []);

  useEffect(() => {
    if (isOpen) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
      document.body.classList.remove('grayscale-filter', 'high-contrast', 'legible-font');
    };
  }, []);

  const handleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const applyAccessibility = () => {
    const body = document.body;
    const app = document.querySelector('.App');

    document.documentElement.style.fontSize = `${(fontSize / 100) * 16}px`;
    document.documentElement.style.setProperty('--access-font-scale', String(fontSize / 100));

    if (app) {
      app.classList.toggle('access-text-scaled', fontSize !== 100);
    }

    body.classList.toggle('high-contrast', highContrast);
    body.classList.toggle('grayscale-filter', grayscale);
    body.classList.toggle('legible-font', legibleFont);

    localStorage.setItem('access_fontSize', String(fontSize));
    localStorage.setItem('access_highContrast', String(highContrast));
    localStorage.setItem('access_grayscale', String(grayscale));
    localStorage.setItem('access_legibleFont', String(legibleFont));
  };

  useLayoutEffect(() => {
    applyAccessibility();
  }, [fontSize, highContrast, grayscale, legibleFont]);

  const resetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setGrayscale(false);
    setLegibleFont(false);
    stopSpeaking();
  };

  const stopSpeaking = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
    utteranceRef.current = null;
  };

  const speak = (text: string) => {
    if (!text) return;
    if (!('speechSynthesis' in window)) {
      alert(t('access_not_supported'));
      return;
    }
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : lang === 'pt' ? 'pt-PT' : 'es-ES';
    utterance.onend = () => {
      if (utteranceRef.current === utterance) utteranceRef.current = null;
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const readImageDescriptions = () => {
    const main = document.querySelector('#main-content');
    const scope = main || document.body;
    const images = Array.from(scope.querySelectorAll('img'));
    const alts = images
      .map((img) => img.getAttribute('alt'))
      .filter((alt): alt is string => !!alt && alt.trim() !== '');
    if (alts.length === 0) {
      speak(t('access_no_images'));
      return;
    }
    speak(t('access_image_intro') + alts.join('. '));
  };

  const readPageText = () => {
    const main = document.querySelector('#main-content');
    if (!main) {
      speak(t('access_no_text'));
      return;
    }
    const clone = main.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.accessibility-widget-root, script, style').forEach((el) => el.remove());
    const text = clone.innerText?.replace(/\s+/g, ' ').trim() || '';
    if (!text) {
      speak(t('access_no_text'));
      return;
    }
    speak(t('access_page_intro') + text);
  };

  const actionButton = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    border: active ? '2px solid #d4a373' : '1px solid #ddd',
    borderRadius: 6,
    background: active ? '#fdfaf7' : 'white',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 13,
    fontWeight: 500,
    color: '#2c1a0f',
    gap: 8,
  });

  return (
    <div className="accessibility-widget-root" style={{ position: 'fixed', bottom: 30, left: 24, zIndex: 9999 }}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t('access_btn_label')}
        title={t('access_btn_label')}
        aria-expanded={isOpen}
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: '#2c1a0f',
          color: '#d4a373',
          border: '2px solid #d4a373',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'all 0.3s',
        }}
      >
        <Eye size={24} />
      </button>

      {isOpen && (
        <div
          className="accessibility-widget-panel"
          style={{
            position: 'absolute',
            bottom: '120%',
            left: 0,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            width: 260,
            padding: 16,
            border: '1px solid #e8e0d8',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f5ebe6', paddingBottom: 8 }}>
            <span style={{ fontWeight: 700, color: '#2c1a0f', fontSize: 14 }}>{t('access_title')}</span>
            <button
              type="button"
              onClick={resetAll}
              style={{ background: 'none', border: 'none', color: '#c0392b', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
            >
              {t('access_reset')}
            </button>
          </div>

          <div>
            <span style={{ fontSize: 12, color: '#8a7a6a', display: 'block', marginBottom: 6 }}>{t('access_language')}</span>
            <select
              aria-label={t('access_language')}
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: 6,
                background: 'white',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 600,
                color: '#2c1a0f',
              }}
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span style={{ fontSize: 12, color: '#8a7a6a', display: 'block', marginBottom: 6 }}>{t('access_text_size')}: {fontSize}%</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.max(prev - 10, 80))}
                style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: 6, display: 'flex', justifyContent: 'center', cursor: 'pointer', background: 'white' }}
                aria-label={t('access_zoom_out')}
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.min(prev + 10, 150))}
                style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: 6, display: 'flex', justifyContent: 'center', cursor: 'pointer', background: 'white' }}
                aria-label={t('access_zoom_in')}
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <button type="button" onClick={() => setHighContrast(!highContrast)} style={actionButton(highContrast)}>
            <span>{t('access_contrast')}</span>
            {highContrast && <Check size={16} color="#d4a373" />}
          </button>

          <button type="button" onClick={() => setGrayscale(!grayscale)} style={actionButton(grayscale)}>
            <span>{t('access_grayscale')}</span>
            {grayscale && <Check size={16} color="#d4a373" />}
          </button>

          <button type="button" onClick={() => setLegibleFont(!legibleFont)} style={actionButton(legibleFont)}>
            <span>{t('access_legible')}</span>
            {legibleFont && <Check size={16} color="#d4a373" />}
          </button>

          <div>
            <span style={{ fontSize: 12, color: '#8a7a6a', display: 'block', marginBottom: 6 }}>{t('access_narrated')}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={readPageText}
                style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'white', fontSize: 12, fontWeight: 600, color: '#2c1a0f' }}
              >
                <Volume2 size={16} /> {t('access_read_page')}
              </button>
              <button
                type="button"
                onClick={stopSpeaking}
                style={{ flex: 1, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'white', fontSize: 12, fontWeight: 600, color: '#2c1a0f' }}
              >
                <StopCircle size={16} /> {t('access_stop')}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={readImageDescriptions}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#2c1a0f' }}
          >
            <Images size={16} /> {t('access_images')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityWidget;
