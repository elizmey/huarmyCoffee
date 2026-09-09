import React, { useEffect, useState } from 'react';
import { Users, Truck, Store, Package, MessageSquare, Handshake, Target, TrendingUp, BarChart3, CalendarRange, ShoppingBag, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { adminFetch, ApiError, getStoredAdminUser } from '../api/adminApi';

type DashboardData = {
  counts: Record<string, number>;
  indicadores: Array<{ nombre: string; perspectiva: string; valor_actual: number; meta: number }>;
  stock_bajo?: number;
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [user, setUser] = useState<{ nombre?: string; rol?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getStoredAdminUser());
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem('adminToken')) {
        setError('Sesión no válida. Inicia sesión de nuevo.');
        setLoading(false);
        return;
      }
      try {
        const json = await adminFetch<DashboardData>('/dashboard');
        setData(json);
      } catch (e) {
        const err = e as ApiError;
        if (err.status === 401 || err.status === 403) {
          setError('Sesión expirada o token inválido. Cierra sesión e ingresa de nuevo.');
        } else {
          setError(err.message || 'Error al cargar datos');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="admin-state admin-state--page">Cargando panel de gestión...</div>;
  if (error) {
    return (
      <div className="admin-state admin-state--page admin-state--error">
        <p>{error}</p>
        {error.includes('API') && (
          <p className="error-hint">
            En una terminal ejecuta: <code>npm run api</code> y en otra: <code>npm start</code>
          </p>
        )}
      </div>
    );
  }
  if (!data?.counts) return <div className="admin-state admin-state--page admin-state--error">Error al cargar datos</div>;

  const { counts, indicadores, stock_bajo } = data;

  const statCards = [
    { icon: Users, label: 'Clientes', value: counts.clientes, color: '#d4a373', bg: '#fdf4e6', to: '/admin/clientes' },
    { icon: CalendarRange, label: 'Citas', value: counts.citas || 0, color: '#2980b9', bg: '#e8f0fe', to: '/admin/citas' },
    { icon: ShoppingBag, label: 'Pedidos', value: counts.pedidos || 0, color: '#16a085', bg: '#e8f8f5', to: '/admin/pedidos' },
    { icon: Truck, label: 'Proveedores', value: counts.proveedores, color: '#27ae60', bg: '#e8f8f0', to: '/admin/proveedores' },
    { icon: Handshake, label: 'Socios', value: counts.socios, color: '#2980b9', bg: '#e8f0fe', to: '/admin/socios' },
    { icon: Store, label: 'Sucursales', value: counts.sucursales, color: '#8e44ad', bg: '#f0e8f8', to: '/admin/sucursales' },
    { icon: ShieldCheck, label: 'Usuarios', value: counts.usuarios || 0, color: '#2c1a0f', bg: '#f4f0eb', to: '/admin/usuarios' },
    { icon: Package, label: 'Inventario', value: counts.inventarios, color: '#e67e22', bg: '#fef5e7', to: '/admin/inventarios' },
    { icon: MessageSquare, label: 'Comunicaciones', value: counts.comunicaciones, color: '#16a085', bg: '#e8f8f5', to: '/admin/comunicacion' },
  ];

  const chartData = indicadores?.map(i => ({ name: i.nombre.substring(0, 15), actual: i.valor_actual, meta: i.meta })) || [];
  const visibleCards = statCards.filter((card) => card.to !== '/admin/usuarios' || user?.rol === 'admin');

  return (
    <div>
      <div className="admin-header-bar">
        <h1>Panel de Gestión</h1>
        <div className="admin-user-info">
          {user && <span>Bienvenido, {user.nombre}</span>}
          <button className="btn btn-primary" onClick={() => navigate('/admin/scorecard')}><BarChart3 size={16} /> Tablero de comando</button>
        </div>
      </div>
      {typeof stock_bajo === 'number' && (
        <p style={{ color: stock_bajo > 0 ? '#c0392b' : '#27ae60', marginTop: 0 }}>
          Alertas de inventario (cantidad 3 o menos): <strong>{stock_bajo}</strong>
        </p>
      )}

      <div className="dashboard-grid">
        {visibleCards.map((card, i) => (
          <div
            key={i}
            className="dashboard-stat"
            style={{ '--stat-bg': card.bg, '--stat-color': card.color, cursor: 'pointer' } as React.CSSProperties}
            onClick={() => card.to && navigate(card.to)}
          >
            <div className="dashboard-stat-icon"><card.icon size={24} /></div>
            <div className="dashboard-stat-info"><h3>{card.value}</h3><p>{card.label}</p></div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h2><TrendingUp size={18} className="inline-icon" />Indicadores vs Metas</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d8" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="actual" name="Actual" fill="#d4a373" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#2c1a0f" radius={[4, 4, 0, 0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h2><Target size={18} className="inline-icon" />Tablero de comando · procesos BSC</h2>
        </div>
        <div className="scorecard-summary-grid">
          {['financiera', 'cliente', 'procesos', 'aprendizaje'].map(p => {
            const items = indicadores?.filter(i => i.perspectiva === p) || [];
            const avg = items.length ? (items.reduce((s, i) => s + (i.valor_actual / (i.meta || 1)), 0) / items.length * 100).toFixed(1) : 0;
            const labels = { financiera: 'Financiera', cliente: 'Cliente', procesos: 'Procesos', aprendizaje: 'Aprendizaje' };
            const level = Number(avg) >= 80 ? 'high' : Number(avg) >= 50 ? 'medium' : 'low';
            return (
              <div key={p} className="scorecard-summary-card">
                <p className="scorecard-summary-label">{labels[p]}</p>
                <p className={`scorecard-summary-value ${level}`}>{avg}%</p>
                <p className="table-cell-subtitle">{items.length} indicadores</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
