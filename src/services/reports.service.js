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

async function getMonthlySalesTrend(companyId = 1) {
  const pool = await getPool();

  const query = `
    SELECT 
        v.f5461_ano_mes AS Periodo,
        SUM(v.f5461_vlr_bruto) AS VentasTotales,
        SUM(v.f5461_vlr_dsctos) AS DescuentosTotales,
        SUM(v.f5461_vlr_imp) AS ImpuestosTotales,
        SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) AS MargenBruto
    FROM 
        t5461_acum_ventas_fact v
    WHERE 
        v.f5461_id_cia = ${companyId}
    GROUP BY 
        v.f5461_ano_mes
    ORDER BY 
        v.f5461_ano_mes
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports.getMonthlySalesTrend = getMonthlySalesTrend;

async function getYearOverYearComparison(companyId = 1) {
  const pool = await getPool();

  const query = `
    WITH VentasPorAnio AS (
        SELECT 
            LEFT(CAST(v.f5461_ano_mes AS VARCHAR(6)), 4) AS Anio,
            SUM(v.f5461_vlr_bruto) AS VentasTotales
        FROM 
            t5461_acum_ventas_fact v
        WHERE 
            v.f5461_id_cia = ${companyId}
        GROUP BY 
            LEFT(CAST(v.f5461_ano_mes AS VARCHAR(6)), 4)
    )
    SELECT 
        Anio,
        VentasTotales,
        LAG(VentasTotales) OVER (ORDER BY Anio) AS VentasAnioAnterior,
        CASE 
            WHEN LAG(VentasTotales) OVER (ORDER BY Anio) > 0 
            THEN ((VentasTotales - LAG(VentasTotales) OVER (ORDER BY Anio)) / 
                  LAG(VentasTotales) OVER (ORDER BY Anio)) * 100
            ELSE 0 
        END AS VariacionPorcentualYoY
    FROM 
        VentasPorAnio
    ORDER BY 
        Anio
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports.getYearOverYearComparison = getYearOverYearComparison;

async function getMonthOverMonthComparison(companyId = 1) {
  const pool = await getPool();

  const query = `
    WITH VentasMensuales AS (
        SELECT 
            v.f5461_ano_mes AS Periodo,
            SUM(v.f5461_vlr_bruto) AS VentasTotales
        FROM 
            t5461_acum_ventas_fact v
        WHERE 
            v.f5461_id_cia = ${companyId}
        GROUP BY 
            v.f5461_ano_mes
    )
    SELECT 
        Periodo,
        VentasTotales,
        LAG(VentasTotales) OVER (ORDER BY Periodo) AS VentasMesAnterior,
        CASE 
            WHEN LAG(VentasTotales) OVER (ORDER BY Periodo) > 0 
            THEN ((VentasTotales - LAG(VentasTotales) OVER (ORDER BY Periodo)) / 
                  LAG(VentasTotales) OVER (ORDER BY Periodo)) * 100
            ELSE 0 
        END AS VariacionPorcentualMoM
    FROM 
        VentasMensuales
    ORDER BY 
        Periodo
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports.getMonthOverMonthComparison = getMonthOverMonthComparison;