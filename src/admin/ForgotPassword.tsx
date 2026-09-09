import React, { useState } from 'react';
import { Loader2, Home } from 'lucide-react';
import { requestPasswordReset } from '../services/authService';
import './admin.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setLoading(true);
    try {
      const data = await requestPasswordReset(email);
      setMessage(data.message);
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err: unknown) {
      setError((err as Error).message || 'No se pudo enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src="/imagenes/local/logo-lugar.jpg" alt="Huarmy Coffee" className="login-logo" />
          <h1>Recuperar contraseña</h1>
          <p className="login-subtitle">Ingresa el correo de tu cuenta</p>
        </div>
        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <p style={{ color: '#2c1a0f', marginBottom: 12 }}>{message}</p>}
        {resetUrl && (
          <p style={{ fontSize: 13, wordBreak: 'break-all', background: '#fdf4e6', padding: 12, borderRadius: 8 }}>
            Sin servidor de correo configurado. Usa este enlace: <a href={resetUrl}>{resetUrl}</a>
          </p>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" className="form-control login-input" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><Loader2 size={18} className="login-spin" /> Enviando...</> : 'Enviar enlace'}
          </button>
        </form>
        <div className="login-footer-actions">
          <a href="/admin/login" className="login-link-btn login-link-btn--solid">Volver al login</a>
          <a href="/" className="login-link-btn login-link-btn--outline"><Home size={16} /> Inicio</a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
