import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import {
  Eye, ZoomIn, ZoomOut, Volume2, Images, StopCircle, Contrast, Blend, Type, RotateCcw, X, Languages,
} from 'lucide-react';
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
  const [speaking, setSpeaking] = useState(false);
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
    if (!isOpen) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
    setSpeaking(false);
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

  const stopSpeaking = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.pause();
    window.speechSynthesis.resume();
    utteranceRef.current = null;
    setSpeaking(false);
  };

  const resetAll = () => {
    setFontSize(100);
    setHighContrast(false);
    setGrayscale(false);
    setLegibleFont(false);
    stopSpeaking();
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
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setSpeaking(false);
      }
    };
    utterance.onerror = () => setSpeaking(false);
    utteranceRef.current = utterance;
    setSpeaking(true);
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

  const activeCount = [highContrast, grayscale, legibleFont, fontSize !== 100].filter(Boolean).length;

  return (
    <div className={`accessibility-widget-root${isOpen ? ' is-open' : ''}`}>
      {isOpen && (
        <div className="a11y-dial" role="dialog" aria-label={t('access_title')}>
          <div className="a11y-chip-row" role="group" aria-label={t('access_language')}>
            <Languages size={14} className="a11y-chip-icon" aria-hidden="true" />
            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                className={`a11y-lang-chip${lang === item.code ? ' is-on' : ''}`}
                onClick={() => changeLanguage(item.code)}
                aria-pressed={lang === item.code}
                title={item.name}
              >
                {item.code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="a11y-chip-row a11y-size-row" role="group" aria-label={t('access_text_size')}>
            <button
              type="button"
              onClick={() => setFontSize((prev) => Math.max(prev - 10, 80))}
              className="a11y-round-btn"
              aria-label={t('access_zoom_out')}
            >
              <ZoomOut size={18} />
            </button>
            <span className="a11y-size-value">{fontSize}%</span>
            <button
              type="button"
              onClick={() => setFontSize((prev) => Math.min(prev + 10, 150))}
              className="a11y-round-btn"
              aria-label={t('access_zoom_in')}
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <button
            type="button"
            className={`a11y-action${highContrast ? ' is-on' : ''}`}
            onClick={() => setHighContrast((v) => !v)}
            aria-pressed={highContrast}
          >
            <span className="a11y-round-btn" aria-hidden="true"><Contrast size={18} /></span>
            <span className="a11y-action-label">{t('access_contrast')}</span>
          </button>

          <button
            type="button"
            className={`a11y-action${grayscale ? ' is-on' : ''}`}
            onClick={() => setGrayscale((v) => !v)}
            aria-pressed={grayscale}
          >
            <span className="a11y-round-btn" aria-hidden="true"><Blend size={18} /></span>
            <span className="a11y-action-label">{t('access_grayscale')}</span>
          </button>

          <button
            type="button"
            className={`a11y-action${legibleFont ? ' is-on' : ''}`}
            onClick={() => setLegibleFont((v) => !v)}
            aria-pressed={legibleFont}
          >
            <span className="a11y-round-btn" aria-hidden="true"><Type size={18} /></span>
            <span className="a11y-action-label">{t('access_legible')}</span>
          </button>

          <button type="button" className={`a11y-action${speaking ? ' is-on' : ''}`} onClick={readPageText}>
            <span className="a11y-round-btn" aria-hidden="true"><Volume2 size={18} /></span>
            <span className="a11y-action-label">{t('access_read_page')}</span>
          </button>

          <button type="button" className="a11y-action" onClick={stopSpeaking}>
            <span className="a11y-round-btn" aria-hidden="true"><StopCircle size={18} /></span>
            <span className="a11y-action-label">{t('access_stop')}</span>
          </button>

          <button type="button" className="a11y-action" onClick={readImageDescriptions}>
            <span className="a11y-round-btn" aria-hidden="true"><Images size={18} /></span>
            <span className="a11y-action-label">{t('access_images')}</span>
          </button>

          <button type="button" className="a11y-action a11y-action--reset" onClick={resetAll}>
            <span className="a11y-round-btn" aria-hidden="true"><RotateCcw size={18} /></span>
            <span className="a11y-action-label">{t('access_reset')}</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t('access_btn_label')}
        title={t('access_btn_label')}
        aria-expanded={isOpen}
        className={`a11y-toggle-btn${isOpen ? ' is-open' : ''}${activeCount ? ' has-active' : ''}`}
      >
        {isOpen ? <X size={22} /> : <Eye size={22} />}
        {!isOpen && activeCount > 0 && <span className="a11y-fab-dot" aria-hidden="true" />}
      </button>
    </div>
  );
};

export default AccessibilityWidget;
