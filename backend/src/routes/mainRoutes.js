const { Router } = require('express');
const { healthCheck } = require('../controllers/mainController');
const {
  getDashboard,
  getClientes,
  getRoles,
  createCliente,
  createAporte,
  updateBalance,
  updateBotStatus,
} = require('../controllers/botController');

const router = Router();

// Health check
router.get('/health', healthCheck);

// Rutas de Trading Bot, Clientes, Roles & Aportes
router.get('/dashboard', getDashboard);
router.get('/clientes', getClientes);
router.post('/clientes', createCliente);
router.get('/roles', getRoles);
router.post('/aportes', createAporte);
router.put('/bot/balance', updateBalance);
router.patch('/bot/estado', updateBotStatus);

module.exports = router;
