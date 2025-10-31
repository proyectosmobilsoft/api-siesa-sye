const { getPool } = require('../db/db');

async function getAllClients() {
  const pool = await getPool();

  const query = `
    SELECT
      f9740_id,
      f9740_nit,
      f9740_razon_social,
      f9740_nombre,
      f9740_email,
      f9740_celular,
      f9740_direccion1
    FROM t9740_pdv_clientes
    WHERE f9740_ind_estado = 1
    ORDER BY f9740_id DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function getSalesByClient(yearMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona año-mes, usar el mes actual
  let anoMesFilter = '';
  if (yearMonth) {
    anoMesFilter = `AND v.f5461_ano_mes = ${yearMonth}`;
  }

  const query = `
    SELECT
        v.f5461_rowid_tercero_fact AS [ID Cliente],
        SUM(v.f5461_vlr_bruto - v.f5461_vlr_dsctos + v.f5461_vlr_imp) AS [Ventas Netas],
        SUM(v.f5461_vlr_bruto) AS [Ventas Brutas],
        SUM(v.f5461_vlr_dsctos) AS [Descuentos],
        SUM(v.f5461_vlr_imp) AS [Impuestos],
        COUNT(DISTINCT v.f5461_id_periodo) AS [Periodos Activos],
        SUM(v.f5461_vlr_bruto - v.f5461_vlr_dsctos + v.f5461_vlr_imp) / NULLIF(COUNT(DISTINCT v.f5461_rowid_tercero_fact), 0) AS [Ticket Promedio]
    FROM
        t5461_acum_ventas_fact v
    WHERE
        v.f5461_id_cia = ${companyId}
        ${anoMesFilter}
    GROUP BY
        v.f5461_rowid_tercero_fact
    ORDER BY
        [Ventas Netas] DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { getAllClients, getSalesByClient };

