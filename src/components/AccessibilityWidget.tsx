import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { Eye, ZoomIn, ZoomOut, Check, Volume2, Images, StopCircle } from 'lucide-react';
import { useTranslation, languages } from '../i18n';
import '../assets/css/style.css';

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

  const applyAccessibility = useCallback(() => {
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
  }, [fontSize, highContrast, grayscale, legibleFont]);

  useLayoutEffect(() => {
    applyAccessibility();
  }, [applyAccessibility]);

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

  return (
    <div className="accessibility-widget-root">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t('access_btn_label')}
        title={t('access_btn_label')}
        aria-expanded={isOpen}
        className="a11y-toggle-btn"
      >
        <Eye size={24} />
      </button>

      {isOpen && (
        <div className="accessibility-widget-panel">
          <div className="a11y-panel-header">
            <span className="a11y-panel-title">{t('access_title')}</span>
            <button type="button" onClick={resetAll} className="a11y-reset-btn">
              {t('access_reset')}
            </button>
          </div>

          <div>
            <span className="a11y-field-label">{t('access_language')}</span>
            <select
              aria-label={t('access_language')}
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              className="a11y-select"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="a11y-field-label">{t('access_text_size')}: {fontSize}%</span>
            <div className="a11y-btn-row">
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.max(prev - 10, 80))}
                className="a11y-icon-btn"
                aria-label={t('access_zoom_out')}
              >
                <ZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={() => setFontSize((prev) => Math.min(prev + 10, 150))}
                className="a11y-icon-btn"
                aria-label={t('access_zoom_in')}
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>

          <button type="button" onClick={() => setHighContrast(!highContrast)} className={`a11y-toggle ${highContrast ? 'active' : ''}`}>
            <span>{t('access_contrast')}</span>
            {highContrast && <Check size={16} color="#d4a373" />}
          </button>

          <button type="button" onClick={() => setGrayscale(!grayscale)} className={`a11y-toggle ${grayscale ? 'active' : ''}`}>
            <span>{t('access_grayscale')}</span>
            {grayscale && <Check size={16} color="#d4a373" />}
          </button>

          <button type="button" onClick={() => setLegibleFont(!legibleFont)} className={`a11y-toggle ${legibleFont ? 'active' : ''}`}>
            <span>{t('access_legible')}</span>
            {legibleFont && <Check size={16} color="#d4a373" />}
          </button>

          <div>
            <span className="a11y-field-label">{t('access_narrated')}</span>
            <div className="a11y-btn-row">
              <button type="button" onClick={readPageText} className="a11y-labeled-btn">
                <Volume2 size={16} /> {t('access_read_page')}
              </button>
              <button type="button" onClick={stopSpeaking} className="a11y-labeled-btn">
                <StopCircle size={16} /> {t('access_stop')}
              </button>
            </div>
          </div>

          <button type="button" onClick={readImageDescriptions} className="a11y-full-btn">
            <Images size={16} /> {t('access_images')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessibilityWidget;
