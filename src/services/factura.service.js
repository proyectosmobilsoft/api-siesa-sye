const { getPool } = require('../db/db');

async function getEstadosFinancieros(periodoInicial = 202401, periodoFinal = 202412) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 60 segundos para consultas complejas
  request.timeout = 60000;
  request.input('periodoInicial', require('mssql').Int, periodoInicial);
  request.input('periodoFinal', require('mssql').Int, periodoFinal);

  const query = `
    SELECT 
      a.f253_id_cia                                AS [Compañía],
      a.f253_id                                    AS [Código Cuenta],
      a.f253_descripcion                           AS [Nombre de la Cuenta],
      SUM(b.f_valor_neto)                          AS [Total Cuenta],
      CASE 
        WHEN SUM(b.f_valor_neto) > 0 THEN 'Deudor'
        WHEN SUM(b.f_valor_neto) < 0 THEN 'Acreedor'
        ELSE 'Saldo Cero'
      END AS [Tipo de Saldo]
    FROM 
      BI_T350 b
    INNER JOIN 
      t253_co_auxiliares a
        ON a.f253_id = b.f_auxiliar
    WHERE 
      b.f_perido_docto BETWEEN @periodoInicial AND @periodoFinal
    GROUP BY 
      a.f253_id_cia,
      a.f253_id,
      a.f253_descripcion
    ORDER BY 
      [Total Cuenta] DESC
  `;

  const result = await request.query(query);
  return result.recordset;
}

async function getFacturas(periodoInicial = 202401, periodoFinal = 202412, limit = 1000, offset = 0) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 120 segundos para consultas complejas
  request.timeout = 120000;
  request.input('periodoInicial', require('mssql').Int, periodoInicial);
  request.input('periodoFinal', require('mssql').Int, periodoFinal);
  request.input('limit', require('mssql').Int, limit);
  request.input('offset', require('mssql').Int, offset);

  // Consulta optimizada con OFFSET/FETCH para paginación eficiente
  // Nota: Se recomienda crear índices en:
  // - BI_T350.f_perido_docto
  // - BI_T350.f_desc_tipo_docto
  // - BI_T350.f_fecha_docto (para ORDER BY)
  const query = `
    SELECT 
      f_cia AS IdCompania,
      f_docto AS NumeroFactura,
      f_fecha_docto AS FechaFactura,
      f_tercero_docto AS IdTercero,
      f_tercero_docto_razon_soc AS NombreCliente,
      f_desc_tipo_docto AS TipoDocumento,
      f_auxiliar AS CodigoCuenta,
      f_desc_auxiliar AS NombreCuenta,
      f_valor_debito AS ValorDebito,
      f_valor_credito AS ValorCredito,
      f_valor_neto AS ValorNeto,
      f_perido_docto AS PeriodoContable
    FROM BI_T350 WITH (NOLOCK)
    WHERE f_perido_docto >= @periodoInicial 
      AND f_perido_docto <= @periodoFinal
      AND f_desc_tipo_docto LIKE '%Factura%'
    ORDER BY f_fecha_docto DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const result = await request.query(query);
  return result.recordset;
}

// Función para obtener el total de registros (para paginación)
async function getFacturasCount(periodoInicial = 202401, periodoFinal = 202412) {
  const pool = await getPool();

  const request = pool.request();
  request.timeout = 60000;
  request.input('periodoInicial', require('mssql').Int, periodoInicial);
  request.input('periodoFinal', require('mssql').Int, periodoFinal);

  const query = `
    SELECT COUNT(*) AS Total
    FROM BI_T350 WITH (NOLOCK)
    WHERE f_perido_docto >= @periodoInicial 
      AND f_perido_docto <= @periodoFinal
      AND f_desc_tipo_docto LIKE '%Factura%'
  `;

  const result = await request.query(query);
  return result.recordset[0]?.Total || 0;
}

async function getEstadoResultados(periodoInicial = 202401, periodoFinal = 202412) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 60 segundos para consultas complejas
  request.timeout = 60000;
  request.input('periodoInicial', require('mssql').Int, periodoInicial);
  request.input('periodoFinal', require('mssql').Int, periodoFinal);

  const query = `
    SELECT 
      CASE 
        WHEN LEFT(f_auxiliar, 1) = '4' THEN 'Ingresos'
        WHEN LEFT(f_auxiliar, 1) = '5' THEN 'Costos'
        WHEN LEFT(f_auxiliar, 1) = '6' THEN 'Gastos'
        ELSE 'Otros'
      END AS TipoCuenta,
      f_desc_auxiliar AS Cuenta,
      SUM(f_valor_neto) AS Total
    FROM BI_T350 WITH (NOLOCK)
    WHERE f_perido_docto >= @periodoInicial 
      AND f_perido_docto <= @periodoFinal
    GROUP BY 
      CASE 
        WHEN LEFT(f_auxiliar, 1) = '4' THEN 'Ingresos'
        WHEN LEFT(f_auxiliar, 1) = '5' THEN 'Costos'
        WHEN LEFT(f_auxiliar, 1) = '6' THEN 'Gastos'
        ELSE 'Otros'
      END,
      f_desc_auxiliar
    ORDER BY TipoCuenta, Total DESC
  `;

  const result = await request.query(query);
  return result.recordset;
}

async function getTendenciaMensual(periodoInicial = 202401, periodoFinal = 202412) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 60 segundos para consultas complejas
  request.timeout = 60000;
  request.input('periodoInicial', require('mssql').Int, periodoInicial);
  request.input('periodoFinal', require('mssql').Int, periodoFinal);

  const query = `
    SELECT 
      f_perido_docto AS Periodo,
      SUM(CASE WHEN LEFT(f_auxiliar, 1) = '4' THEN f_valor_neto ELSE 0 END) AS Ingresos,
      SUM(CASE WHEN LEFT(f_auxiliar, 1) = '5' THEN f_valor_neto ELSE 0 END) AS Costos,
      SUM(CASE WHEN LEFT(f_auxiliar, 1) = '6' THEN f_valor_neto ELSE 0 END) AS Gastos,
      SUM(CASE WHEN LEFT(f_auxiliar, 1) IN ('4') THEN f_valor_neto 
               WHEN LEFT(f_auxiliar, 1) IN ('5','6') THEN -f_valor_neto 
               ELSE 0 END) AS Utilidad
    FROM BI_T350 WITH (NOLOCK)
    WHERE f_perido_docto >= @periodoInicial 
      AND f_perido_docto <= @periodoFinal
    GROUP BY f_perido_docto
    ORDER BY f_perido_docto
  `;

  const result = await request.query(query);
  return result.recordset;
}

module.exports = { getEstadosFinancieros, getFacturas, getFacturasCount, getEstadoResultados, getTendenciaMensual };

