import React, { useState } from 'react';

export default function HistoryTimeline({ historial = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!historial || historial.length === 0) return null;

  return (
    <section className="history-section">
      <div className="history-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="history-header-left">
          <span>📜</span>
          <h3>Historial de Operaciones y Ajustes del Bot ({historial.length})</h3>
        </div>
        <button
          type="button"
          className="btn-quick"
          style={{ width: 'auto', padding: '0.3rem 0.8rem' }}
        >
          {isOpen ? 'Ocultar ▲' : 'Ver Historial ▼'}
        </button>
      </div>

      {isOpen && (
        <div className="history-list">
          {historial.map((op) => {
            const isProfit = op.profit_neto >= 0;
            const dateStr = op.fecha ? new Date(op.fecha).toLocaleString('es-ES') : 'N/A';

            return (
              <div key={op.id} className="history-item">
                <div className="history-meta">
                  <span className="history-date">{dateStr}</span>
                  {op.estado_bot_momento && (
                    <span className="meta-badge" style={{ padding: '0.1rem 0.45rem' }}>
                      {op.estado_bot_momento}
                    </span>
                  )}
                  <span className="history-note">{op.nota || 'Ajuste de Balance'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Balance: {Number(op.balance_nuevo).toFixed(2)} USDT
                  </span>
                  <span className={`profit-badge ${isProfit ? 'positive' : 'negative'}`}>
                    {isProfit ? '+' : ''}
                    {Number(op.profit_neto).toFixed(2)} USDT ({isProfit ? '+' : ''}
                    {op.rendimiento_porcentaje}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
