const { getPool } = require('../db/db');

async function getDailyOrders() {
  const pool = await getPool();

  const query = `
    SELECT
      rowid,
      [Fecha docto],
      [Hora creacion],
      [ID. CO],
      Estado,
      [Desc. CO],
      [Hora creacion dt]
    FROM v430_pedidos_diarios
    ORDER BY rowid DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function getSalesSummary() {
  const pool = await getPool();

  const query = `
    SELECT
      *
    FROM v9820_db_vta_resumen_tpv
    ORDER BY (SELECT NULL)
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { getDailyOrders, getSalesSummary };

async function getVendors() {
  const pool = await getPool();

  const query = `
    SELECT
      [Codigo vendedor],
      [Nombre vendedor],
      [Tipo de entrega],
      [Valor subtotal],
      [Valor neto],
      compania,
      [centro de op]
    FROM v9820_vendedores
    ORDER BY [Codigo vendedor] ASC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports.getVendors = getVendors;
