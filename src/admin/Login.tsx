import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Building2, Home } from 'lucide-react';
import { loginAdmin } from '../services/authService';
import './admin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(email, password);
      navigate('/admin');
    } catch (err: unknown) {
      const message = (err as Error)?.message;
      setError(message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img
            src="/imagenes/local/logo-lugar.jpg"
            alt="Huarmy Coffee"
            className="login-logo"
          />
          <h1>Huarmy Coffee</h1>
          <p className="login-subtitle">Panel de Administración</p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="form-control login-input"
              placeholder="tu@huarmycoffee.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-required="true"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-control login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                aria-required="true"
                disabled={loading}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="login-spin" aria-hidden="true" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="login-hint">
          <p>
            <a href="/admin/forgot-password">¿Olvidaste tu contraseña?</a>
          </p>
          <p>Acceso interno de Huarmy Coffee.</p>
          <ul>
            <li><strong>Admin:</strong> admin@huarmycoffee.com</li>
            <li><strong>Recepcionista:</strong> recepcionista@huarmycoffee.com</li>
          </ul>
        </div>

        <div className="login-footer-actions">
          <a href="/" className="login-link-btn login-link-btn--outline">
            <Home size={16} aria-hidden="true" />
            Página Principal
          </a>
          <a href="/portal" className="login-link-btn login-link-btn--solid">
            <Building2 size={16} aria-hidden="true" />
            Portal Empresarial
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
