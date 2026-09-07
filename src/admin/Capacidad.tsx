import React, { useEffect, useState } from 'react';
import { adminFetchList } from '../api/adminApi';

const Capacidad = () => {
  const [sucursales, setSucursales] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [inventarios, setInventarios] = useState([]);

  useEffect(() => {
    adminFetchList('/sucursales').then(setSucursales).catch(() => setSucursales([]));
    adminFetchList('/personal').then(setPersonal).catch(() => setPersonal([]));
    adminFetchList('/inventarios').then(setInventarios).catch(() => setInventarios([]));
  }, []);

  const getSucursalPersonal = (id) => personal.filter(p => p.sucursal_id === id).length;
  const getSucursalInventarios = (id) => inventarios.filter(i => i.sucursal_id === id).length;

  return (
    <div>
      <div className="admin-header-bar"><h1>Capacidad de Sucursales</h1></div>
      <div className="capacity-grid">
        {sucursales.map(s => {
          const empleados = getSucursalPersonal(s.id);
          const items = getSucursalInventarios(s.id);
          const pct = Math.min(Math.round((empleados / Math.max(s.capacidad_maxima, 1)) * 100), 100);
          const level = pct < 30 ? 'low' : pct < 70 ? 'medium' : 'high';
          return (
            <div key={s.id} className="capacity-card">
              <h3>{s.nombre}</h3>
              <p className="capacity-address">{s.direccion}</p>
              <div className="capacity-bar"><div className={`capacity-bar-fill ${level}`} style={{ '--fill': pct } as React.CSSProperties} /></div>
              <div className="capacity-info"><span>Personal: {empleados}</span><span>Capacidad: {s.capacidad_maxima}</span></div>
              <div className="capacity-info capacity-info--spaced"><span>Items inventario: {items}</span><span>Ocupación: {pct}%</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Capacidad;


