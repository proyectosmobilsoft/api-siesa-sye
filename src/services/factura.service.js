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

 WITH AuxiliarCliente AS (
    -- Identifica el movimiento del cliente (cartera) para cada BQE
    SELECT 
        m.f351_rowid_docto,
        m.f351_rowid_auxiliar
    FROM t351_co_mov_docto m WITH (NOLOCK)
    WHERE m.f351_valor_db > 0
      AND m.f351_ind_estado = 1
),

Abonos AS (
    -- Total de abonos aplicados a esa cuenta por cobrar
    SELECT 
        m.f351_rowid_auxiliar,
        SUM(m.f351_valor_cr) AS valor_abonos
    FROM t351_co_mov_docto m WITH (NOLOCK)
    WHERE m.f351_ind_estado = 1
      AND m.f351_valor_cr > 0
    GROUP BY m.f351_rowid_auxiliar
)

SELECT 
      d.f350_id_cia,
      d.f350_rowid,
      d.f350_id_co,
      d.f350_id_tipo_docto,
      d.f350_consec_docto,
      d.f350_prefijo,
      d.f350_fecha,
      d.f350_id_periodo,
      d.f350_rowid_tercero,
      d.f350_id_sucursal,
      d.f350_total_db,
      d.f350_total_cr,
      d.f350_id_clase_docto,
      d.f350_ind_estado,
      d.f350_ind_transmit,
      d.f350_fecha_ts_creacion,
      d.f350_fecha_ts_actualizacion,
      d.f350_fecha_ts_aprobacion,
      d.f350_fecha_ts_anulacion,
      d.f350_usuario_creacion,
      d.f350_usuario_actualizacion,
      d.f350_usuario_aprobacion,
      d.f350_usuario_anulacion,
      d.f350_total_base_gravable,
      d.f350_ind_impresion,
      d.f350_nro_impresiones,
      d.f350_fecha_ts_habilita_imp,
      d.f350_usuario_habilita_imp,
      d.f350_notas,
      d.f350_rowid_docto_base,
      d.f350_referencia,
      d.f350_id_mandato,
      d.f350_rowid_movto_entidad,
      d.f350_id_motivo_otros,
      d.f350_id_moneda_docto,
      d.f350_id_moneda_conv,
      d.f350_ind_forma_conv,
      d.f350_tasa_conv,
      d.f350_id_moneda_local,
      d.f350_ind_forma_local,
      d.f350_tasa_local,
      d.f350_id_tipo_cambio,
      d.f350_ind_cfd,
      d.f350_usuario_impresion,
      d.f350_fecha_ts_impresion,
      d.f350_rowid_te_plantilla,
      d.f350_total_db2,
      d.f350_total_cr2,
      d.f350_total_db3,
      d.f350_total_cr3,
      d.f350_ind_impto_asumido,
      d.f350_rowid_sesion,
      d.f350_ind_tipo_origen,
      d.f350_rowid_docto_rp,
      d.f350_id_proyecto,
      d.f350_ind_dif_cambio_forma,
      d.f350_ind_clase_origen,
      d.f350_ind_envio_correo,
      d.f350_usuario_envio_correo,
      d.f350_fecha_ts_envio_correo,

      -- Movimientos reales de abonos
      ISNULL(a.valor_abonos, 0) AS valor_movimientos,

      -- Saldo real
      (d.f350_total_cr - ISNULL(a.valor_abonos, 0)) AS saldo_pendiente,

      -- Estado del saldo
      CASE 
          WHEN a.valor_abonos IS NULL THEN 'SIN MOVIMIENTOS'
          WHEN d.f350_total_cr > ISNULL(a.valor_abonos, 0) THEN 'MOV PENDIENTES'
          WHEN d.f350_total_cr = a.valor_abonos THEN 'SALDADA'
          ELSE 'DESCONOCIDO'
      END AS estado_saldo

FROM t350_co_docto_contable d WITH (NOLOCK)

LEFT JOIN AuxiliarCliente ac
    ON ac.f351_rowid_docto = d.f350_rowid

LEFT JOIN Abonos a
    ON a.f351_rowid_auxiliar = ac.f351_rowid_auxiliar

WHERE 
      d.f350_id_tipo_docto = 'BQE'
      ${terceroFilter}
      AND d.f350_ind_estado = 1
      AND d.f350_total_cr > 0
      AND d.f350_fecha_ts_anulacion IS NULL

      -- Solo documentos sin abonar o con saldo pendiente
      AND (d.f350_total_cr - ISNULL(a.valor_abonos, 0)) > 0

ORDER BY d.f350_fecha ASC
OFFSET @offset ROWS
FETCH NEXT @limit ROWS ONLY;

    
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

