import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import KpiCards from './components/KpiCards';
import ControlPanel from './components/ControlPanel';
import ClientsTable from './components/ClientsTable';
import HistoryTimeline from './components/HistoryTimeline';
import './App.css';

function App() {
  // ── Autenticación con localStorage ──────────────────────────
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bot_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Estado de datos del Bot y Clientes ───────────────────────
  const [data, setData] = useState({
    kpis: {
      total_clientes: 0,
      capital_total_invertido: 0,
      balance_actual_bot: 0,
      profit_global_usdt: 0,
      rendimiento_porcentaje: 0,
    },
    bot: {
      id: 1,
      nombre_plataforma: 'Forex Bot',
      estado: 'DETENIDO',
      fecha_inicio_sesion: null,
    },
    roles: [],
    clientes: [],
    historial_operaciones: [],
    fuente_datos: null,
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // ── Cargar datos del dashboard desde Express ─────────────────
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        showToast(json.message || 'Error al obtener datos', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión con el backend', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // ── Handlers de Sesión ──────────────────────────────────────
  const handleLoginSuccess = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem('bot_auth');
    setUser(null);
  };

  // ── Handlers de Negocio ─────────────────────────────────────
  const handleAddCliente = async ({ nombres, apellidos, cedula, idrol, capital_aportado }) => {
    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres, apellidos, cedula, idrol, capital_aportado }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        showToast(`✅ Inversor ${nombres} ${apellidos} registrado (+${capital_aportado} USDT)`);
      } else {
        showToast(json.message || 'No se pudo registrar el cliente', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al registrar cliente', 'error');
    }
  };

  const handleAddAporte = async ({ idcliente, monto, nota }) => {
    try {
      const res = await fetch('/api/aportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idcliente, monto, nota }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        showToast(`💵 Aporte de +${monto} USDT registrado correctamente.`);
      } else {
        showToast(json.message || 'No se pudo registrar el aporte', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al registrar aporte', 'error');
    }
  };

  const handleUpdateBalance = async ({ nuevo_balance, nota }) => {
    try {
      const res = await fetch('/api/bot/balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nuevo_balance, nota }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        showToast(`⚡ Balance del bot actualizado a ${nuevo_balance} USDT. Profits recalculados.`);
      } else {
        showToast(json.message || 'No se pudo actualizar el balance', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al actualizar balance', 'error');
    }
  };

  const handleUpdateBotStatus = async ({ estado, nombre_plataforma }) => {
    try {
      const res = await fetch('/api/bot/estado', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, nombre_plataforma }),
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        showToast(`🤖 Estado del bot actualizado a ${estado}.`);
      } else {
        showToast(json.message || 'No se pudo cambiar el estado del bot', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al actualizar estado del bot', 'error');
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onLogout={handleLogout}
        isRefreshing={loading}
        dataSource={data.fuente_datos}
        bot={data.bot}
        onUpdateBotStatus={handleUpdateBotStatus}
      />

      <main className="main-content">
        {toast && (
          <div className={`toast-banner ${toast.type}`}>
            <span>{toast.text}</span>
            <button className="toast-close" onClick={() => setToast(null)}>×</button>
          </div>
        )}

        <KpiCards kpis={data.kpis} />

        <ControlPanel
          onAddCliente={handleAddCliente}
          onAddAporte={handleAddAporte}
          onUpdateBalance={handleUpdateBalance}
          currentBalance={data.kpis?.balance_actual_bot}
          clientes={data.clientes}
          roles={data.roles}
        />

        <ClientsTable clientes={data.clientes} />

        <HistoryTimeline historial={data.historial_operaciones} />
      </main>
    </div>
  );
}

export default App;
