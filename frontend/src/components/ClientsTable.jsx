import React, { useState, useMemo } from 'react';

export default function ClientsTable({ clientes = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('id-asc');

  // Filtrado por buscador (Nombres, Apellidos o Cédula)
  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return clientes.filter((c) => {
      const nombresMatch = (c.nombres || '').toLowerCase().includes(term);
      const apellidosMatch = (c.apellidos || '').toLowerCase().includes(term);
      const cedulaMatch = (c.cedula || '').toLowerCase().includes(term);
      return nombresMatch || apellidosMatch || cedulaMatch;
    });
  }, [clientes, searchTerm]);

  // Ordenamiento
  const sortedClients = useMemo(() => {
    const list = [...filteredClients];
    switch (sortBy) {
      case 'nombres-asc':
        return list.sort((a, b) => (a.nombres || '').localeCompare(b.nombres || ''));
      case 'nombres-desc':
        return list.sort((a, b) => (b.nombres || '').localeCompare(a.nombres || ''));
      case 'apellidos-asc':
        return list.sort((a, b) => (a.apellidos || '').localeCompare(b.apellidos || ''));
      case 'apellidos-desc':
        return list.sort((a, b) => (b.apellidos || '').localeCompare(a.apellidos || ''));
      case 'profit-desc':
        return list.sort((a, b) => (b.profit_ganado || 0) - (a.profit_ganado || 0));
      case 'profit-asc':
        return list.sort((a, b) => (a.profit_ganado || 0) - (b.profit_ganado || 0));
      case 'capital-desc':
        return list.sort((a, b) => (b.capital_aportado || 0) - (a.capital_aportado || 0));
      case 'id-desc':
        return list.sort((a, b) => b.id - a.id);
      case 'id-asc':
      default:
        return list.sort((a, b) => a.id - b.id);
    }
  }, [filteredClients, sortBy]);

  return (
    <section className="table-card">
      <div className="table-header-tools">
        <div className="table-title-group">
          <h2>Lista de Inversores</h2>
          <p>Distribución proporcional de ganancias y pérdidas calculadas en tiempo real</p>
        </div>

        <div className="table-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombres, apellidos o cédula…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="id-asc">Orden por Defecto (ID)</option>
            <option value="nombres-asc">Nombres (A - Z)</option>
            <option value="nombres-desc">Nombres (Z - A)</option>
            <option value="apellidos-asc">Apellidos (A - Z)</option>
            <option value="apellidos-desc">Apellidos (Z - A)</option>
            <option value="profit-desc">Mayor Profit Ganado</option>
            <option value="profit-asc">Menor Profit Ganado</option>
            <option value="capital-desc">Mayor Capital Aportado</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>Cédula</th>
              <th>Capital Aportado</th>
              <th>Profit Ganado</th>
              <th>Balance Total Estimado</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No se encontraron clientes que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              sortedClients.map((cliente, index) => {
                const profit = Number(cliente.profit_ganado || 0);
                const isPositive = profit > 0;
                const isNegative = profit < 0;
                const badgeClass = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
                const sign = isPositive ? '+' : '';

                return (
                  <tr key={cliente.id || index}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      #{cliente.id}
                    </td>

                    {/* COLUMNA: Nombres */}
                    <td>
                      <div className="client-name-cell">
                        <div className="client-avatar-mini">
                          {(cliente.nombres || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="client-name-text">{cliente.nombres}</span>
                          {cliente.rol && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.7rem',
                                padding: '0.1rem 0.45rem',
                                borderRadius: '999px',
                                background: 'rgba(59,130,246,0.15)',
                                color: '#60a5fa',
                              }}
                            >
                              {cliente.rol}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA: Apellidos */}
                    <td>
                      <span className="client-lastname-text">{cliente.apellidos}</span>
                    </td>

                    {/* COLUMNA: Cédula */}
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {cliente.cedula || '—'}
                    </td>

                    {/* Capital Aportado (suma desde aportes_capital) */}
                    <td style={{ fontFamily: 'var(--font-mono)' }}>
                      {Number(cliente.capital_aportado || 0).toFixed(2)} USDT
                    </td>

                    {/* COLUMNA: Profit Ganado */}
                    <td>
                      <span className={`profit-badge ${badgeClass}`}>
                        {sign}
                        {profit.toFixed(4)} USDT
                      </span>
                    </td>

                    {/* Balance Total Estimado */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {Number(cliente.balance_estimado || cliente.capital_aportado || 0).toFixed(4)} USDT
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer-info">
        <span>
          Mostrando <strong>{sortedClients.length}</strong> de <strong>{clientes.length}</strong> clientes registrados
        </span>
        <span>Aporte estándar base: 2.00 USDT</span>
      </div>
    </section>
  );
}
