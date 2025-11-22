const { getPool } = require('../db/db');

async function getEstadosFinancieros(periodoInicial = 202401, periodoFinal = 202412) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 120 segundos para consultas complejas
  request.timeout = 120000;
  request.input('periodoInicial', require('mssql').Int, periodoInicial);
  request.input('periodoFinal', require('mssql').Int, periodoFinal);

  // Consulta optimizada con WITH (NOLOCK) y filtros mejorados
  // Nota: Se recomienda crear índices en:
  // - BI_T350.f_perido_docto
  // - BI_T350.f_auxiliar
  // - t253_co_auxiliares.f253_id
  // - t253_co_auxiliares.f253_id_cia
  // - t010_mm_companias.f010_id
  const query = `
    SELECT 
      a.f253_id_cia                                AS [Compañía],
      c.f010_razon_social                          AS [Nombre Compañía],
      a.f253_id                                    AS [Código Cuenta],
      a.f253_descripcion                           AS [Nombre de la Cuenta],
      SUM(b.f_valor_neto)                          AS [Total Cuenta],
      CASE 
        WHEN SUM(b.f_valor_neto) > 0 THEN 'Deudor'
        WHEN SUM(b.f_valor_neto) < 0 THEN 'Acreedor'
        ELSE 'Saldo Cero'
      END AS [Tipo de Saldo]
    FROM 
      BI_T350 b WITH (NOLOCK)
    INNER JOIN 
      t253_co_auxiliares a WITH (NOLOCK)
        ON a.f253_id = b.f_auxiliar
    INNER JOIN 
      t010_mm_companias c WITH (NOLOCK)
        ON c.f010_id = a.f253_id_cia
    WHERE 
      b.f_perido_docto >= @periodoInicial 
      AND b.f_perido_docto <= @periodoFinal
    GROUP BY 
      a.f253_id_cia,
      c.f010_razon_social,
      a.f253_id,
      a.f253_descripcion
    ORDER BY 
      [Total Cuenta] DESC
  `;

  const result = await request.query(query);
  return result.recordset;
}

async function getFacturas(limit = 1000, offset = 0, idTercero = null) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 120 segundos para consultas complejas
  request.timeout = 120000;
  request.input('limit', require('mssql').Int, limit);
  request.input('offset', require('mssql').Int, offset);

  // Construir filtro opcional por tercero
  let terceroFilter = '';
  if (idTercero) {
    request.input('idTercero', require('mssql').Int, idTercero);
    terceroFilter = 'AND d.f350_rowid_tercero = @idTercero';
  }

  // Consulta optimizada con OFFSET/FETCH para paginación eficiente
  // Nota: Se recomienda crear índices en:
  // - t350_co_docto_contable.f350_id_tipo_docto
  // - t350_co_docto_contable.f350_rowid_tercero
  // - t350_co_docto_contable.f350_fecha (para ORDER BY)
  const query = `
    SELECT 
      d.f350_id_cia AS IdCompania,
      ISNULL(d.f350_prefijo + '-', '') + CAST(d.f350_consec_docto AS VARCHAR) AS NumeroFactura,
      d.f350_fecha AS FechaFactura,
      d.f350_rowid_tercero AS IdTercero,
      ISNULL(t.f200_razon_social, '') AS NombreCliente,
      d.f350_id_tipo_docto AS TipoDocumento,
      NULL AS CodigoCuenta,
      NULL AS NombreCuenta,
      d.f350_total_db AS ValorDebito,
      d.f350_total_cr AS ValorCredito,
      (d.f350_total_db - d.f350_total_cr) AS ValorNeto,
      d.f350_id_periodo AS PeriodoContable
    FROM t350_co_docto_contable d WITH (NOLOCK)
    LEFT JOIN t200_mm_terceros t WITH (NOLOCK)
      ON t.f200_rowid = d.f350_rowid_tercero
    WHERE (d.f350_id_tipo_docto LIKE '%FV%' OR d.f350_id_tipo_docto LIKE '%FC%' OR d.f350_id_tipo_docto LIKE '%Factura%')
      ${terceroFilter}
    ORDER BY d.f350_fecha DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const result = await request.query(query);
  return result.recordset;
}

// Función para obtener el total de registros (para paginación)
async function getFacturasCount(idTercero = null) {
  const pool = await getPool();

  const request = pool.request();
  request.timeout = 60000;

  // Construir filtro opcional por tercero
  let terceroFilter = '';
  if (idTercero) {
    request.input('idTercero', require('mssql').Int, idTercero);
    terceroFilter = 'AND d.f350_rowid_tercero = @idTercero';
  }

  const query = `
    SELECT COUNT(*) AS Total
    FROM t350_co_docto_contable d WITH (NOLOCK)
    WHERE (d.f350_id_tipo_docto LIKE '%FV%' OR d.f350_id_tipo_docto LIKE '%FC%' OR d.f350_id_tipo_docto LIKE '%Factura%')
      ${terceroFilter}
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

