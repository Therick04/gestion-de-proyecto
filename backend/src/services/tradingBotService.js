/**
 * Lógica de negocio del bot de trading.
 * Conectado a Supabase a través del repositorio.
 */
const repo = require('../repositories');

const ESTADOS_VALIDOS = ['ACTIVO', 'PAUSADO', 'DETENIDO'];
const round = (n, d = 4) => Number(Number(n || 0).toFixed(d));
const sumCapital = (clientes) => round(clientes.reduce((acc, c) => acc + Number(c.capital_aportado || 0), 0));

/**
 * - Total recaudado = Σ aportes de clientes activos
 * - Profit global = balance_actual_bot - total recaudado
 * - Rendimiento % = profit / total * 100
 * - Profit cliente = profit global * (aporte / total)
 */
function computeBotState(clientes, estadoBot, historial, roles) {
  const capital_total_invertido = sumCapital(clientes);
  const balance_actual_bot = round(estadoBot.balance_actual_bot);
  const profit_global_usdt = round(balance_actual_bot - capital_total_invertido);
  const rendimiento_porcentaje =
    capital_total_invertido > 0 ? round((profit_global_usdt / capital_total_invertido) * 100, 2) : 0;

  const clientesConCalculos = clientes.map((c) => {
    const aporte = Number(c.capital_aportado) || 0;
    const factor = capital_total_invertido > 0 ? aporte / capital_total_invertido : 0;
    const profit_ganado = round(profit_global_usdt * factor);
    return {
      id: c.id,
      nombres: c.nombres,
      apellidos: c.apellidos,
      cedula: c.cedula || null,
      idrol: c.idrol || null,
      rol: c.rol || null,
      capital_aportado: aporte,
      profit_ganado,
      balance_estimado: round(aporte + profit_ganado),
      rendimiento_porcentaje,
    };
  });

  return {
    kpis: {
      total_clientes: clientes.length,
      capital_total_invertido,
      balance_actual_bot,
      profit_global_usdt,
      rendimiento_porcentaje,
    },
    bot: {
      id: estadoBot.id,
      nombre_plataforma: estadoBot.nombre_plataforma || 'Forex Bot',
      estado: estadoBot.estado || 'DETENIDO',
      fecha_inicio_sesion: estadoBot.fecha_inicio_sesion || null,
    },
    roles: roles || [],
    clientes: clientesConCalculos,
    historial_operaciones: (historial || []).map((h) => ({
      ...h,
      balance_anterior: Number(h.balance_anterior),
      balance_nuevo: Number(h.balance_nuevo),
      profit_neto: Number(h.profit_neto),
      rendimiento_porcentaje: Number(h.rendimiento_porcentaje),
    })),
    fuente_datos: repo.name,
  };
}

async function getDashboardData() {
  const [clientes, estadoBot, historial, roles] = await Promise.all([
    repo.getClientes(),
    repo.getEstadoBot(),
    repo.getHistorial(50),
    repo.getRoles(),
  ]);
  return computeBotState(clientes, estadoBot, historial, roles);
}

async function getRoles() {
  return repo.getRoles();
}

async function addCliente({ nombres, apellidos, cedula, idrol, capital_aportado, nota_aporte }) {
  if (!nombres || !String(nombres).trim() || !apellidos || !String(apellidos).trim()) {
    throw new Error('Nombres y apellidos son requeridos.');
  }
  const aporte =
    capital_aportado !== undefined && capital_aportado !== null && capital_aportado !== '' && !isNaN(Number(capital_aportado))
      ? round(capital_aportado)
      : 2;
  if (aporte <= 0) throw new Error('El capital aportado debe ser mayor a 0 USDT.');

  await repo.insertCliente({
    nombres: String(nombres).trim(),
    apellidos: String(apellidos).trim(),
    cedula: cedula ? String(cedula).trim() : null,
    idrol: idrol ? Number(idrol) : null,
    capital_aportado: aporte,
    nota_aporte: nota_aporte ? String(nota_aporte).trim() : 'Aporte inicial',
  });

  const clientes = await repo.getClientes();
  await repo.updateEstadoBot({ capital_total_invertido: sumCapital(clientes) });

  return getDashboardData();
}

async function addAporte({ idcliente, monto, nota }) {
  if (!idcliente || isNaN(Number(idcliente))) {
    throw new Error('Debe seleccionar un cliente válido.');
  }
  const montoNum = round(monto);
  if (isNaN(montoNum) || montoNum <= 0) {
    throw new Error('El monto del aporte debe ser mayor a 0 USDT.');
  }

  await repo.insertAporte({
    idcliente: Number(idcliente),
    monto: montoNum,
    nota: nota ? String(nota).trim() : 'Aporte adicional',
  });

  const clientes = await repo.getClientes();
  await repo.updateEstadoBot({ capital_total_invertido: sumCapital(clientes) });

  return getDashboardData();
}

async function updateBotBalance({ nuevo_balance, nota, idoperador }) {
  if (nuevo_balance === undefined || nuevo_balance === null || nuevo_balance === '' || isNaN(Number(nuevo_balance))) {
    throw new Error('El nuevo balance debe ser un número válido.');
  }
  const balanceNum = round(nuevo_balance);
  if (balanceNum < 0) throw new Error('El balance no puede ser negativo.');

  const [clientes, estadoBot] = await Promise.all([repo.getClientes(), repo.getEstadoBot()]);
  const balanceAnterior = round(estadoBot.balance_actual_bot);
  const capitalTotal = sumCapital(clientes);
  const profitNeto = round(balanceNum - capitalTotal);
  const rendimiento = capitalTotal > 0 ? round((profitNeto / capitalTotal) * 100, 2) : 0;

  await repo.updateEstadoBot({ capital_total_invertido: capitalTotal, balance_actual_bot: balanceNum });
  await repo.insertHistorial({
    fecha: new Date().toISOString(),
    tipo: 'balance_update',
    balance_anterior: balanceAnterior,
    balance_nuevo: balanceNum,
    profit_neto: profitNeto,
    rendimiento_porcentaje: rendimiento,
    nota: nota || (balanceNum >= balanceAnterior ? 'Ganancia registrada' : 'Ajuste / Pérdida registrada'),
    idbot: estadoBot.id,
    idoperador: idoperador ? Number(idoperador) : null,
    estado_bot_momento: estadoBot.estado || 'DETENIDO',
  });

  return getDashboardData();
}

async function updateBotStatus({ estado, nombre_plataforma }) {
  const fields = {};
  if (estado !== undefined) {
    const upper = String(estado).toUpperCase().trim();
    if (!ESTADOS_VALIDOS.includes(upper)) {
      throw new Error(`Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}.`);
    }
    fields.estado = upper;
    if (upper === 'ACTIVO') {
      fields.fecha_inicio_sesion = new Date().toISOString();
    }
  }
  if (nombre_plataforma !== undefined && String(nombre_plataforma).trim()) {
    fields.nombre_plataforma = String(nombre_plataforma).trim();
  }
  if (Object.keys(fields).length === 0) {
    throw new Error('Debe indicar estado o nombre_plataforma para actualizar.');
  }

  await repo.updateEstadoBot(fields);
  return getDashboardData();
}

module.exports = {
  getDashboardData,
  getRoles,
  addCliente,
  addAporte,
  updateBotBalance,
  updateBotStatus,
};
