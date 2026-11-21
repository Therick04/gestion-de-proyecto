require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mainRoutes = require('./routes/mainRoutes');
const repo = require('./repositories');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globales ──────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api', mainRoutes);

app.get('/', (_req, res) => {
  res.json({ message: '🚀 Servidor Express funcionando', fuente_datos: repo.name });
});

// ── Levantar servidor ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📡 Health-check en   http://localhost:${PORT}/api/health`);
  console.log('🗄️  Fuente de datos: Supabase (PostgreSQL)\n');
});
