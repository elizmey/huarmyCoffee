import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { apiUrl } from '../api';
import '../assets/css/style.css';

type ServicioItem = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoria_nombre?: string;
};

type TipoEvento = 'cumpleanos' | 'empresarial' | 'boda' | 'otro';

const DEFAULT_WHATSAPP = '593983436356';
const DEFAULT_PERSONAS = 20;
const DEFAULT_TIPO_EVENTO: TipoEvento = 'empresarial';
const PACKAGE_CATEGORY = 'Catering Corporativo';

const formatMoney = (value: number) => `$${value.toFixed(2)}`;

const Cotizador = () => {
  const { t } = useTranslation();
  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP);
  const [loading, setLoading] = useState(true);

  const [personas, setPersonas] = useState(DEFAULT_PERSONAS);
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>(DEFAULT_TIPO_EVENTO);
  const [fecha, setFecha] = useState('');

  // Ítems a la carta: cantidad propia por producto, independiente de "personas".
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  // Paquetes de catering por persona: selección simple, el costo se multiplica por "personas".
  const [selectedPackageIds, setSelectedPackageIds] = useState<Set<number>>(new Set());

  const resetFiltros = () => {
    setPersonas(DEFAULT_PERSONAS);
    setTipoEvento(DEFAULT_TIPO_EVENTO);
    setFecha('');
    setQuantities({});
    setSelectedPackageIds(new Set());
  };

  useEffect(() => {
    fetch(apiUrl('/public/servicios'))
      .then((r) => r.json())
      .then((rows) => setServicios(Array.isArray(rows) ? rows : []))
      .catch(() => setServicios([]))
      .finally(() => setLoading(false));

    fetch(apiUrl('/public/configuracion'))
      .then((r) => r.json())
      .then((rows) => {
        if (!Array.isArray(rows)) return;
        const item = rows.find((c) => c.clave === 'whatsapp_matriz');
        if (item?.valor) setWhatsappNumber(item.valor);
      })
      .catch(() => {});
  }, []);

  const alacarteGroups = useMemo(() => {
    const groups: Record<string, ServicioItem[]> = {};
    servicios
      .filter((s) => s.categoria_nombre !== PACKAGE_CATEGORY)
      .forEach((s) => {
        const key = s.categoria_nombre || t('serv_otros') || 'Otros';
        if (!groups[key]) groups[key] = [];
        groups[key].push(s);
      });
    return Object.entries(groups);
  }, [servicios, t]);

  const packageItems = useMemo(
    () => servicios.filter((s) => s.categoria_nombre === PACKAGE_CATEGORY),
    [servicios]
  );

  const setQuantity = (id: number, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  };
  const incrementQuantity = (id: number) => setQuantity(id, (quantities[id] || 0) + 1);
  const decrementQuantity = (id: number) => setQuantity(id, (quantities[id] || 0) - 1);

  const togglePackage = (id: number) => {
    setSelectedPackageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Ítems a la carta seleccionados con su propia cantidad: precio_unitario × cantidad_del_producto.
  const alacarteSelection = useMemo(
    () =>
      servicios
        .filter((s) => (quantities[s.id] || 0) > 0)
        .map((item) => ({ item, cantidad: quantities[item.id] })),
    [servicios, quantities]
  );

  // Paquetes seleccionados: su costo se multiplica por el número global de personas.
  const packageSelection = useMemo(
    () => servicios.filter((s) => selectedPackageIds.has(s.id)),
    [servicios, selectedPackageIds]
  );

  const guestCount = Math.max(1, Number(personas) || 0);

  const alacarteTotal = alacarteSelection.reduce((sum, { item, cantidad }) => sum + Number(item.precio) * cantidad, 0);
  const packagePricePerPerson = packageSelection.reduce((sum, item) => sum + Number(item.precio), 0);
  const packagesTotal = packagePricePerPerson * guestCount;
  const total = alacarteTotal + packagesTotal;

  const hasSelection = alacarteSelection.length > 0 || packageSelection.length > 0;

  const eventoLabels: Record<TipoEvento, string> = {
    cumpleanos: t('cot_evento_cumpleanos'),
    empresarial: t('cot_evento_empresarial'),
    boda: t('cot_evento_boda'),
    otro: t('cot_evento_otro'),
  };

  const buildWhatsappUrl = () => {
    const lines = [
      `${t('cot_wa_saludo')}.`,
      `${t('cot_wa_evento')}: ${eventoLabels[tipoEvento]}`,
      `${t('cot_wa_personas')}: ${guestCount}`,
      `${t('cot_wa_fecha')}: ${fecha || t('cot_sin_fecha')}`,
    ];
    if (alacarteSelection.length) {
      lines.push(`${t('cot_wa_alacarte')}: ${alacarteSelection.map(({ item, cantidad }) => `${item.nombre} (x${cantidad})`).join(', ')}`);
    }
    if (packageSelection.length) {
      lines.push(`${t('cot_wa_paquetes')}: ${packageSelection.map((i) => i.nombre).join(', ')}`);
    }
    lines.push(`${t('cot_wa_total')}: ${formatMoney(total)}`);
    lines.push(t('cot_wa_cierre'));

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const hasCatalog = alacarteGroups.length > 0 || packageItems.length > 0;

  return (
    <section id="cotizador" className="cotizador-section">
      <div className="cotizador-container">
        <motion.div
          className="cotizador-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-label">{t('cot_label')}</span>
          <h2 className="cotizador-title">
            {t('cot_title_1')} <span>{t('cot_title_2')}</span>
          </h2>
          <p className="cotizador-subtitle">{t('cot_subtitle')}</p>
        </motion.div>

        {loading ? (
          <p className="section-status-text section-status-text--block">{t('cot_loading')}</p>
        ) : !hasCatalog ? (
          <p className="section-status-text section-status-text--block">{t('cot_empty')}</p>
        ) : (
          <div className="cotizador-grid">
            <motion.div
              className="cotizador-form"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <div className="cotizador-form-toolbar">
                <button type="button" className="cotizador-clear-btn" onClick={resetFiltros}>
                  <X size={14} /> {t('cot_limpiar')}
                </button>
              </div>

              <div className="cotizador-fields-row">
                <div className="cotizador-field">
                  <label htmlFor="cot-personas">{t('cot_personas')}</label>
                  <input
                    id="cot-personas"
                    type="number"
                    min={1}
                    value={personas}
                    onChange={(e) => setPersonas(parseInt(e.target.value, 10) || 0)}
                  />
                </div>
                <div className="cotizador-field">
                  <label htmlFor="cot-tipo-evento">{t('cot_tipo_evento')}</label>
                  <select id="cot-tipo-evento" value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value as TipoEvento)}>
                    <option value="cumpleanos">{t('cot_evento_cumpleanos')}</option>
                    <option value="empresarial">{t('cot_evento_empresarial')}</option>
                    <option value="boda">{t('cot_evento_boda')}</option>
                    <option value="otro">{t('cot_evento_otro')}</option>
                  </select>
                </div>
                <div className="cotizador-field">
                  <label htmlFor="cot-fecha">{t('cot_fecha')}</label>
                  <input id="cot-fecha" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
                </div>
              </div>

              {alacarteGroups.map(([categoria, items]) => (
                <div className="cotizador-group" key={categoria}>
                  <h3>{categoria}</h3>
                  <div className="cotizador-options">
                    {items.map((item) => {
                      const qty = quantities[item.id] || 0;
                      return (
                        <div className={`cotizador-option cotizador-option--qty ${qty > 0 ? 'active' : ''}`} key={item.id}>
                          <div className="cotizador-option-info">
                            <span className="cotizador-option-name">{item.nombre}</span>
                            <span className="cotizador-option-price">{formatMoney(Number(item.precio))} {t('cot_por_unidad')}</span>
                          </div>
                          <div className="cotizador-qty-stepper">
                            <button
                              type="button"
                              className="cotizador-qty-btn"
                              onClick={() => decrementQuantity(item.id)}
                              disabled={qty === 0}
                              aria-label={t('cot_disminuir')}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min={0}
                              className="cotizador-qty-input"
                              value={qty}
                              onChange={(e) => setQuantity(item.id, Math.max(0, parseInt(e.target.value, 10) || 0))}
                              aria-label={`${t('cot_cantidad')} ${item.nombre}`}
                            />
                            <button
                              type="button"
                              className="cotizador-qty-btn"
                              onClick={() => incrementQuantity(item.id)}
                              aria-label={t('cot_aumentar')}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {packageItems.length > 0 && (
                <div className="cotizador-group">
                  <h3>{packageItems[0]?.categoria_nombre || PACKAGE_CATEGORY}</h3>
                  <p className="cotizador-group-hint">{t('cot_paquetes_hint')}</p>
                  <div className="cotizador-options">
                    {packageItems.map((item) => (
                      <label className="cotizador-option" key={item.id}>
                        <input type="checkbox" checked={selectedPackageIds.has(item.id)} onChange={() => togglePackage(item.id)} />
                        <span className="cotizador-option-name">{item.nombre}</span>
                        <span className="cotizador-option-price">{formatMoney(Number(item.precio))} {t('cot_por_persona')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              className="cotizador-summary"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
            >
              <h3>{t('cot_resumen')}</h3>
              {!hasSelection ? (
                <p className="cotizador-summary-empty">{t('cot_sin_seleccion')}</p>
              ) : (
                <>
                  <ul className="cotizador-summary-list">
                    {alacarteSelection.map(({ item, cantidad }) => (
                      <li key={item.id}>
                        <span>{item.nombre} (x{cantidad})</span>
                        <span>{formatMoney(Number(item.precio) * cantidad)}</span>
                      </li>
                    ))}
                    {packageSelection.map((item) => (
                      <li key={item.id}>
                        <span>{item.nombre} ({guestCount} {t('cot_personas_corto')})</span>
                        <span>{formatMoney(Number(item.precio) * guestCount)}</span>
                      </li>
                    ))}
                  </ul>

                  {alacarteSelection.length > 0 && (
                    <div className="cotizador-summary-row">
                      <span>{t('cot_subtotal_alacarte')}</span>
                      <strong>{formatMoney(alacarteTotal)}</strong>
                    </div>
                  )}
                  {packageSelection.length > 0 && (
                    <div className="cotizador-summary-row">
                      <span>{t('cot_subtotal_paquetes')} ({guestCount})</span>
                      <strong>{formatMoney(packagesTotal)}</strong>
                    </div>
                  )}
                  <div className="cotizador-summary-row cotizador-summary-total">
                    <span>{t('cot_total_estimado')}</span>
                    <strong>{formatMoney(total)}</strong>
                  </div>
                  <a
                    className="cotizador-whatsapp-btn"
                    href={buildWhatsappUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={18} /> {t('cot_boton_whatsapp')}
                  </a>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cotizador;
