/**
 * Repositorio de datos sobre Supabase (PostgreSQL).
 * Esquema actual:
 *  - roles (id, role_name, status)
 *  - clientes (id, nombres, apellidos, cedula, idrol, status, created_at)
 *  - aportes_capital (id, idcliente, monto, fecha, nota)
 *  - estado_bot (id, capital_total_invertido, balance_actual_bot, nombre_plataforma, estado, fecha_inicio_sesion, updated_at)
 *  - historial_operaciones (id, fecha, tipo, balance_anterior, balance_nuevo, profit_neto, rendimiento_porcentaje, nota, idbot, idoperador, estado_bot_momento)
 */
const { supabase } = require('../config/supabase');

function check(error, contexto) {
  if (error) {
    console.error(`❌ Supabase (${contexto}):`, error.message);
    throw new Error(`Error de base de datos (${contexto}): ${error.message}`);
  }
}

async function getRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('id, role_name, status')
    .eq('status', 1)
    .order('id', { ascending: true });
  check(error, 'listar roles');
  return data || [];
}

async function getClientes() {
  const [clientesRes, aportesRes, rolesRes] = await Promise.all([
    supabase
      .from('clientes')
      .select('id, nombres, apellidos, cedula, idrol, status, created_at')
      .eq('status', 1)
      .order('id', { ascending: true }),
    supabase
      .from('aportes_capital')
      .select('id, idcliente, monto, fecha, nota'),
    supabase
      .from('roles')
      .select('id, role_name'),
  ]);

  check(clientesRes.error, 'listar clientes');
  check(aportesRes.error, 'listar aportes de capital');
  check(rolesRes.error, 'listar roles');

  const rolesMap = new Map((rolesRes.data || []).map((r) => [r.id, r.role_name]));
  const aportesPorCliente = new Map();

  for (const a of aportesRes.data || []) {
    const prev = aportesPorCliente.get(a.idcliente) || { total: 0, count: 0 };
    prev.total += Number(a.monto || 0);
    prev.count += 1;
    aportesPorCliente.set(a.idcliente, prev);
  }

  return (clientesRes.data || []).map((c) => {
    const infoAporte = aportesPorCliente.get(c.id) || { total: 0, count: 0 };
    return {
      id: c.id,
      nombres: c.nombres,
      apellidos: c.apellidos,
      cedula: c.cedula || null,
      idrol: c.idrol || null,
      rol: c.idrol ? rolesMap.get(c.idrol) || null : null,
      status: c.status,
      created_at: c.created_at,
      capital_aportado: Number(infoAporte.total.toFixed(4)),
      aportes_count: infoAporte.count,
    };
  });
}

async function insertCliente({ nombres, apellidos, cedula = null, idrol = null, capital_aportado = 2, nota_aporte = 'Aporte inicial' }) {
  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({
      nombres,
      apellidos,
      cedula: cedula || null,
      idrol: idrol ? Number(idrol) : null,
      status: 1,
    })
    .select('id, nombres, apellidos, cedula, idrol, status, created_at')
    .single();
  check(error, 'insertar cliente');

  const { error: aporteError } = await supabase.from('aportes_capital').insert({
    idcliente: cliente.id,
    monto: capital_aportado,
    nota: nota_aporte,
  });
  check(aporteError, 'insertar aporte inicial');

  return { ...cliente, capital_aportado };
}

async function insertAporte({ idcliente, monto, nota = 'Aporte adicional' }) {
  const { data, error } = await supabase
    .from('aportes_capital')
    .insert({
      idcliente: Number(idcliente),
      monto,
      nota,
    })
    .select('id, idcliente, monto, fecha, nota')
    .single();
  check(error, 'registrar aporte de capital');
  return data;
}

async function getEstadoBot() {
  const { data, error } = await supabase
    .from('estado_bot')
    .select('id, capital_total_invertido, balance_actual_bot, nombre_plataforma, estado, fecha_inicio_sesion, updated_at')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle();
  check(error, 'leer estado del bot');

  if (data) return data;

  // Si la tabla está vacía, creamos el primer registro (id se autogenera)
  const { data: created, error: insertError } = await supabase
    .from('estado_bot')
    .insert({
      capital_total_invertido: 0,
      balance_actual_bot: 0,
      nombre_plataforma: 'Forex Bot',
      estado: 'DETENIDO',
    })
    .select('id, capital_total_invertido, balance_actual_bot, nombre_plataforma, estado, fecha_inicio_sesion, updated_at')
    .single();
  check(insertError, 'inicializar estado del bot');
  return created;
}

async function updateEstadoBot(fields) {
  const bot = await getEstadoBot();
  const { error } = await supabase
    .from('estado_bot')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', bot.id);
  check(error, 'actualizar estado del bot');
  return { ...bot, ...fields };
}

async function getHistorial(limit = 50) {
  const { data, error } = await supabase
    .from('historial_operaciones')
    .select('id, fecha, tipo, balance_anterior, balance_nuevo, profit_neto, rendimiento_porcentaje, nota, idbot, idoperador, estado_bot_momento')
    .order('fecha', { ascending: false })
    .limit(limit);
  check(error, 'leer historial');
  return data || [];
}

async function insertHistorial(operacion) {
  const { error } = await supabase.from('historial_operaciones').insert(operacion);
  check(error, 'insertar historial');
}

module.exports = {
  name: 'supabase',
  getRoles,
  getClientes,
  insertCliente,
  insertAporte,
  getEstadoBot,
  updateEstadoBot,
  getHistorial,
  insertHistorial,
};
