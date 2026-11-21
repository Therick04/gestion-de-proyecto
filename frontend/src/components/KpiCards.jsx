import React from 'react';

export default function KpiCards({ kpis }) {
  const {
    total_clientes = 0,
    capital_total_invertido = 0,
    balance_actual_bot = 0,
    profit_global_usdt = 0,
    rendimiento_porcentaje = 0,
  } = kpis || {};

  const isPositive = profit_global_usdt >= 0;

  return (
    <section className="kpis-grid">
      {/* 1. NÚMERO DE CLIENTES REGISTRADOS */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Clientes Registrados</span>
          <div className="kpi-icon-wrap users">👥</div>
        </div>
        <div className="kpi-value">
          {total_clientes}
          <span className="unit">inversores</span>
        </div>
        <div className="kpi-footer">
          <span>Inversores activos en el pool del bot</span>
        </div>
      </div>

      {/* 2. TOTAL DE DINERO RECAUDADO */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Total Recaudado</span>
          <div className="kpi-icon-wrap capital">💰</div>
        </div>
        <div className="kpi-value">
          {capital_total_invertido.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          <span className="unit">USDT</span>
        </div>
        <div className="kpi-footer">
          <span>Suma total de aportes base</span>
        </div>
      </div>

      {/* 3. PROFIT GLOBAL */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Profit Global</span>
          <div className={`kpi-icon-wrap profit ${!isPositive ? 'loss' : ''}`}>
            {isPositive ? '📈' : '📉'}
          </div>
        </div>
        <div className={`kpi-value ${isPositive ? 'green' : 'red'}`}>
          {isPositive ? '+' : ''}
          {profit_global_usdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          <span className="unit">USDT</span>
        </div>
        <div className="kpi-footer">
          <span className={`badge-trend ${isPositive ? 'green' : 'red'}`}>
            {isPositive ? '▲ +' : '▼ '}
            {rendimiento_porcentaje}%
          </span>
          <span>Rendimiento neto</span>
        </div>
      </div>

      {/* 4. BALANCE ACTUAL DEL BOT (Métrica Complementaria) */}
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Balance Actual Bot</span>
          <div className="kpi-icon-wrap bot">🤖</div>
        </div>
        <div className="kpi-value">
          {balance_actual_bot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          <span className="unit">USDT</span>
        </div>
        <div className="kpi-footer">
          <span>Capital actual administrado</span>
        </div>
      </div>
    </section>
  );
}
