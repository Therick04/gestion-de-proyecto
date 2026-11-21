const repo = require('../repositories');

const healthCheck = (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API del Bot de Trading funcionando correctamente',
    fuente_datos: repo.name,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck };
