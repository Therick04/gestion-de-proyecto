import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('trader@quantumbot.io');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert('Por favor ingrese usuario y contraseña');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const authUser = {
        email: username,
        name: username.split('@')[0] || 'Trader Master',
        role: 'Admin / Inversor',
        loginTime: new Date().toISOString(),
      };
      localStorage.setItem('bot_auth', JSON.stringify(authUser));
      setIsLoading(false);
      onLoginSuccess(authUser);
    }, 350);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">⚡</div>
          <h1>QuantumBot</h1>
          <p>Control y Seguimiento de Inversión Forex & Crypto</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario / Correo Electrónico</label>
            <input
              id="username"
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ejemplo@trading.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Autenticando…' : 'Acceder al Dashboard'}
          </button>
        </form>

        <div className="login-hint">
          <strong>Modo Demostración Activo:</strong> Puedes ingresar cualquier usuario y contraseña para acceder de inmediato.
        </div>
      </div>
    </div>
  );
}
