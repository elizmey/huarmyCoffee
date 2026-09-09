import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { resetPassword } from '../services/authService';
import './admin.css';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      navigate('/admin/login');
    } catch (err: unknown) {
      setError((err as Error).message || 'No se pudo actualizar');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <p className="login-error">El enlace no incluye un token válido.</p>
          <a href="/admin/forgot-password" className="login-link-btn login-link-btn--solid">Solicitar uno nuevo</a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" className="login-logo" />
          <h1>Nueva contraseña</h1>
        </div>
        {error && <div className="login-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" className="form-control login-input" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="confirm">Confirmar</label>
            <input id="confirm" type="password" className="form-control login-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required disabled={loading} />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><Loader2 size={18} className="login-spin" /> Guardando...</> : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
