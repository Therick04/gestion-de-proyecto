import React from 'react';

const STATUS_STYLES = {
  ACTIVO: {
    color: 'var(--profit-green)',
    background: 'var(--profit-green-bg)',
    borderColor: 'var(--profit-green-border)',
    dot: 'var(--profit-green)',
  },
  PAUSADO: {
    color: '#fbbf24',
    background: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    dot: '#fbbf24',
  },
  DETENIDO: {
    color: 'var(--loss-red)',
    background: 'var(--loss-red-bg)',
    borderColor: 'var(--loss-red-border)',
    dot: 'var(--loss-red)',
  },
};

export default function Navbar({ user, onLogout, dataSource, bot, onUpdateBotStatus }) {
  const displayName = user?.name || user?.email?.split('@')[0] || 'Trader';
  const botEstado = bot?.estado || 'DETENIDO';
  const botPlataforma = bot?.nombre_plataforma || 'Forex Bot';
  const style = STATUS_STYLES[botEstado] || STATUS_STYLES.DETENIDO;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand-wrapper">
          <div className="brand-icon-box">⚡</div>
          <div>
            <div className="brand-title">QuantumBot Trading</div>
            <div className="brand-subtitle">{botPlataforma} · Forex & Crypto</div>
          </div>
        </div>

        <div className="navbar-right">
          <div
            className="status-indicator"
            style={{
              color: style.color,
              background: style.background,
              borderColor: style.borderColor,
            }}
            title="Cambiar estado del bot en Supabase"
          >
            <span
              className="status-pulse-dot"
              style={{
                backgroundColor: style.dot,
                boxShadow: `0 0 8px ${style.dot}`,
                animation: botEstado === 'ACTIVO' ? 'pulse 2s infinite' : 'none',
              }}
            ></span>
            <select
              aria-label="Estado del bot"
              value={botEstado}
              onChange={(e) => onUpdateBotStatus && onUpdateBotStatus({ estado: e.target.value })}
              style={{
                background: 'transparent',
                color: 'inherit',
                border: 'none',
                outline: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              <option value="ACTIVO" style={{ background: '#111827', color: '#10b981' }}>BOT ACTIVO</option>
              <option value="PAUSADO" style={{ background: '#111827', color: '#fbbf24' }}>BOT PAUSADO</option>
              <option value="DETENIDO" style={{ background: '#111827', color: '#ef4444' }}>BOT DETENIDO</option>
            </select>
          </div>

          {dataSource && (
            <span className="meta-badge" title="Base de datos conectada">
              🗄️ Supabase
            </span>
          )}

          <div className="user-badge">
            <div className="user-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <span>{displayName}</span>
          </div>

          <button onClick={onLogout} className="btn-logout" title="Cerrar Sesión">
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
