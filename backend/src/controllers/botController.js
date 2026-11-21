const botService = require('../services/tradingBotService');

/** Envuelve handlers async y unifica el manejo de errores. */
const handle = (fn, status = 200, errorStatus = 500) => async (req, res) => {
  try {
    const payload = await fn(req);
    res.status(status).json({ success: true, ...payload });
  } catch (error) {
    console.error(error);
    res.status(errorStatus).json({ success: false, message: error.message || 'Error interno.' });
  }
};

// GET /api/dashboard
const getDashboard = handle(async () => ({ data: await botService.getDashboardData() }));

// GET /api/clientes
const getClientes = handle(async () => {
  const { clientes } = await botService.getDashboardData();
  return { data: clientes, total: clientes.length };
});

// GET /api/roles
const getRoles = handle(async () => ({ data: await botService.getRoles() }));

// POST /api/clientes
const createCliente = handle(
  async (req) => ({
    message: 'Cliente registrado exitosamente.',
    data: await botService.addCliente(req.body || {}),
  }),
  201,
  400
);

// POST /api/aportes
const createAporte = handle(
  async (req) => ({
    message: 'Aporte de capital registrado exitosamente.',
    data: await botService.addAporte(req.body || {}),
  }),
  201,
  400
);

// PUT /api/bot/balance
const updateBalance = handle(
  async (req) => ({
    message: 'Balance del bot actualizado correctamente.',
    data: await botService.updateBotBalance(req.body || {}),
  }),
  200,
  400
);

// PATCH /api/bot/estado
const updateBotStatus = handle(
  async (req) => ({
    message: 'Estado del bot actualizado correctamente.',
    data: await botService.updateBotStatus(req.body || {}),
  }),
  200,
  400
);

module.exports = {
  getDashboard,
  getClientes,
  getRoles,
  createCliente,
  createAporte,
  updateBalance,
  updateBotStatus,
};
