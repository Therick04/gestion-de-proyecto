import React, { useState, useEffect } from 'react';

export default function ControlPanel({
  onAddCliente,
  onAddAporte,
  onUpdateBalance,
  currentBalance,
  clientes = [],
  roles = [],
}) {
  // Pestaña en la tarjeta izquierda: 'cliente' | 'aporte'
  const [clientTab, setClientTab] = useState('cliente');

  // Formulario Nuevo Cliente
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cedula, setCedula] = useState('');
  const [idrol, setIdrol] = useState('');
  const [capitalAportado, setCapitalAportado] = useState(2);
  const [isSubmittingCliente, setIsSubmittingCliente] = useState(false);

  // Formulario Aporte Adicional (tabla aportes_capital)
  const [aporteClienteId, setAporteClienteId] = useState('');
  const [aporteMonto, setAporteMonto] = useState(2);
  const [aporteNota, setAporteNota] = useState('');
  const [isSubmittingAporte, setIsSubmittingAporte] = useState(false);

  // Formulario Balance Bot
  const [nuevoBalance, setNuevoBalance] = useState(currentBalance ?? 40);
  const [notaBalance, setNotaBalance] = useState('');
  const [isSubmittingBalance, setIsSubmittingBalance] = useState(false);

  useEffect(() => {
    if (currentBalance !== undefined && currentBalance !== null) {
      setNuevoBalance(currentBalance);
    }
  }, [currentBalance]);

  const handleClienteSubmit = async (e) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim()) {
      alert('Por favor complete nombres y apellidos.');
      return;
    }

    setIsSubmittingCliente(true);
    try {
      await onAddCliente({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        cedula: cedula.trim() || undefined,
        idrol: idrol ? Number(idrol) : undefined,
        capital_aportado: Number(capitalAportado),
      });
      setNombres('');
      setApellidos('');
      setCedula('');
      setIdrol('');
      setCapitalAportado(2);
    } finally {
      setIsSubmittingCliente(false);
    }
  };

  const handleAporteSubmit = async (e) => {
    e.preventDefault();
    if (!aporteClienteId) {
      alert('Seleccione un cliente.');
      return;
    }
    setIsSubmittingAporte(true);
    try {
      await onAddAporte({
        idcliente: Number(aporteClienteId),
        monto: Number(aporteMonto),
        nota: aporteNota.trim() || undefined,
      });
      setAporteMonto(2);
      setAporteNota('');
    } finally {
      setIsSubmittingAporte(false);
    }
  };

  const handleBalanceSubmit = async (e) => {
    e.preventDefault();
    if (nuevoBalance === '' || isNaN(Number(nuevoBalance)) || Number(nuevoBalance) < 0) {
      alert('Por favor ingrese un valor de balance válido mayor o igual a 0.');
      return;
    }

    setIsSubmittingBalance(true);
    try {
      await onUpdateBalance({
        nuevo_balance: Number(nuevoBalance),
        nota: notaBalance.trim() || undefined,
      });
      setNotaBalance('');
    } finally {
      setIsSubmittingBalance(false);
    }
  };

  const adjustQuickBalance = (delta) => {
    const current = Number(nuevoBalance) || 0;
    const nextVal = Math.max(0, Number((current + delta).toFixed(4)));
    setNuevoBalance(nextVal);
  };

  return (
    <section className="control-grid">
      {/* 1. GESTIÓN DE CLIENTES Y APORTES */}
      <div className="control-card">
        <div className="card-title-group" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="card-title-icon">{clientTab === 'cliente' ? '👤' : '💵'}</span>
            <div>
              <h2>{clientTab === 'cliente' ? 'Registrar Nuevo Cliente' : 'Registrar Aporte Adicional'}</h2>
              <p>
                {clientTab === 'cliente'
                  ? 'Crea cliente y su aporte inicial en aportes_capital'
                  : 'Suma nuevo capital a un inversor existente'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn-quick"
              style={{
                padding: '0.35rem 0.65rem',
                borderColor: clientTab === 'cliente' ? 'var(--accent-blue)' : undefined,
                color: clientTab === 'cliente' ? 'var(--text-primary)' : undefined,
              }}
              onClick={() => setClientTab('cliente')}
            >
              Nuevo
            </button>
            <button
              type="button"
              className="btn-quick"
              style={{
                padding: '0.35rem 0.65rem',
                borderColor: clientTab === 'aporte' ? 'var(--accent-blue)' : undefined,
                color: clientTab === 'aporte' ? 'var(--text-primary)' : undefined,
              }}
              onClick={() => setClientTab('aporte')}
            >
              + Aporte
            </button>
          </div>
        </div>

        {clientTab === 'cliente' ? (
          <form onSubmit={handleClienteSubmit} className="login-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cli-nombres">Nombres</label>
                <input
                  id="cli-nombres"
                  type="text"
                  className="input-field"
                  placeholder="Ej. Roberto"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cli-apellidos">Apellidos</label>
                <input
                  id="cli-apellidos"
                  type="text"
                  className="input-field"
                  placeholder="Ej. Salazar"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cli-cedula">Cédula (Opcional)</label>
                <input
                  id="cli-cedula"
                  type="text"
                  className="input-field"
                  placeholder="Ej. V-25123456"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cli-aporte">Aporte Inicial (USDT)</label>
                <input
                  id="cli-aporte"
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="input-field"
                  value={capitalAportado}
                  onChange={(e) => setCapitalAportado(e.target.value)}
                  required
                />
              </div>
            </div>

            {roles.length > 0 && (
              <div className="form-group">
                <label htmlFor="cli-rol">Rol (Opcional)</label>
                <select
                  id="cli-rol"
                  className="input-field"
                  value={idrol}
                  onChange={(e) => setIdrol(e.target.value)}
                >
                  <option value="">Sin rol asignado</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={isSubmittingCliente}>
              {isSubmittingCliente ? 'Registrando…' : '+ Registrar Cliente'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleAporteSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="ap-cliente">Cliente</label>
              <select
                id="ap-cliente"
                className="input-field"
                value={aporteClienteId}
                onChange={(e) => setAporteClienteId(e.target.value)}
                required
              >
                <option value="">Seleccione un cliente…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.id} · {c.nombres} {c.apellidos} (Actual: {Number(c.capital_aportado).toFixed(2)} USDT)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ap-monto">Monto del Aporte (USDT)</label>
                <input
                  id="ap-monto"
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="input-field"
                  value={aporteMonto}
                  onChange={(e) => setAporteMonto(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="ap-nota">Nota (Opcional)</label>
                <input
                  id="ap-nota"
                  type="text"
                  className="input-field"
                  placeholder="Ej. Recarga Binance Pay"
                  value={aporteNota}
                  onChange={(e) => setAporteNota(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmittingAporte}>
              {isSubmittingAporte ? 'Guardando…' : '💵 Registrar Aporte'}
            </button>
          </form>
        )}
      </div>

      {/* 2. ACTUALIZAR BALANCE DEL BOT */}
      <div className="control-card">
        <div className="card-title-group">
          <span className="card-title-icon">📊</span>
          <div>
            <h2>Actualizar Balance del Bot</h2>
            <p>Registra nuevo balance o profit/pérdida de trading</p>
          </div>
        </div>

        <form onSubmit={handleBalanceSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="bot-balance">Nuevo Balance Total del Bot (USDT)</label>
            <input
              id="bot-balance"
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              placeholder="Ej. 40, 50, 15..."
              value={nuevoBalance}
              onChange={(e) => setNuevoBalance(e.target.value)}
              required
            />
          </div>

          <div className="quick-balance-adjust">
            <button
              type="button"
              className="btn-quick"
              onClick={() => adjustQuickBalance(5)}
              title="Añadir +5 USDT"
            >
              +5 USDT
            </button>
            <button
              type="button"
              className="btn-quick"
              onClick={() => adjustQuickBalance(10)}
              title="Añadir +10 USDT"
            >
              +10 USDT
            </button>
            <button
              type="button"
              className="btn-quick"
              onClick={() => adjustQuickBalance(-5)}
              title="Restar -5 USDT"
            >
              -5 USDT
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="bot-nota">Nota u Operación (Opcional)</label>
            <input
              id="bot-nota"
              type="text"
              className="input-field"
              placeholder="Ej. Ganancia Scalping BTC/USDT & EUR/USD"
              value={notaBalance}
              onChange={(e) => setNotaBalance(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-accent" disabled={isSubmittingBalance}>
            {isSubmittingBalance ? 'Recalculando…' : '⚡ Actualizar Balance & Recalcular'}
          </button>
        </form>
      </div>
    </section>
  );
}
