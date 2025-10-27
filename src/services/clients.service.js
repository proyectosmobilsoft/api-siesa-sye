const { getPool } = require('../db/db');

async function getAllClients() {
  const pool = await getPool();

  const query = `
    SELECT TOP 100
      f9740_id,
      f9740_nit,
      f9740_razon_social,
      f9740_nombre,
      f9740_email,
      f9740_celular,
      f9740_direccion1
    FROM f9740
    WHERE f9740_ind_estado = 1
    ORDER BY f9740_id DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { getAllClients };

