import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const AdminLayout = React.lazy(() => import('./AdminLayout'));
const Login = React.lazy(() => import('./Login'));
const Dashboard = React.lazy(() => import('./Dashboard'));
const Clientes = React.lazy(() => import('./Clientes'));
const Proveedores = React.lazy(() => import('./Proveedores'));
const Socios = React.lazy(() => import('./Socios'));
const Sucursales = React.lazy(() => import('./Sucursales'));
const Inventarios = React.lazy(() => import('./Inventarios'));
const Capacidad = React.lazy(() => import('./Capacidad'));
const Comunicacion = React.lazy(() => import('./Comunicacion'));
const Scorecard = React.lazy(() => import('./Scorecard'));
const Catalogo = React.lazy(() => import('./Catalogo'));
const Citas = React.lazy(() => import('./Citas'));
const Pedidos = React.lazy(() => import('./Pedidos'));
const Usuarios = React.lazy(() => import('./Usuarios'));
const ForgotPassword = React.lazy(() => import('./ForgotPassword'));
const ResetPassword = React.lazy(() => import('./ResetPassword'));

const AdminApp = () => (
  <Suspense fallback={<div className="route-fallback">Cargando…</div>}>
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="menu" element={<Catalogo />} />
        <Route path="servicios" element={<Navigate to="/admin/menu" replace />} />
        <Route path="galeria" element={<Navigate to="/admin/menu" replace />} />
        <Route path="promociones" element={<Navigate to="/admin/menu" replace />} />
        <Route path="roles" element={<Navigate to="/admin" replace />} />
        <Route path="citas" element={<Citas />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="socios" element={<Socios />} />
        <Route path="sucursales" element={<Sucursales />} />
        <Route path="personal" element={<Navigate to="/admin/usuarios" replace />} />
        <Route path="inventarios" element={<Inventarios />} />
        <Route path="capacidad" element={<Capacidad />} />
        <Route path="comunicacion" element={<Comunicacion />} />
        <Route path="scorecard" element={<Scorecard />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
    </Routes>
  </Suspense>
);

export default AdminApp;
