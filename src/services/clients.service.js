const { getPool } = require('../db/db');

async function getAllClients(page = null, pageSize = null, search = null) {
  const pool = await getPool();

  const request = pool.request();
  // Timeout estándar de 30 segundos
  request.timeout = 30000;

  // Consulta optimizada usando t200_mm_terceros con WITH (NOLOCK)
  // IMPORTANTE: Para mejorar el rendimiento, crear un índice compuesto:
  // CREATE NONCLUSTERED INDEX IX_t200_tipo_tercero_rowid ON t200_mm_terceros (f200_ind_tipo_tercero, f200_rowid DESC)
  
  let paginationClause = '';
  if (page && pageSize) {
    const offset = (page - 1) * pageSize;
    paginationClause = `OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
  }

  // Construir filtro de búsqueda
  let searchFilter = '';
  if (search && search.trim() !== '') {
    const searchTerm = `%${search.trim()}%`;
    request.input('searchTerm', searchTerm);
    searchFilter = `AND f200_razon_social LIKE @searchTerm`;
  }

  const query = `
    SELECT
      f200_rowid AS f9740_id,
      f200_nit AS f9740_nit,
      f200_razon_social AS f9740_razon_social,
      CASE 
        WHEN LTRIM(RTRIM(ISNULL(f200_nombres, '') + ' ' + ISNULL(f200_apellido1, '') + ' ' + ISNULL(f200_apellido2, ''))) <> ''
          THEN LTRIM(RTRIM(ISNULL(f200_nombres, '') + ' ' + ISNULL(f200_apellido1, '') + ' ' + ISNULL(f200_apellido2, '')))
        WHEN f200_nombre_est IS NOT NULL AND f200_nombre_est <> ''
          THEN f200_nombre_est
        ELSE f200_razon_social
      END AS f9740_nombre,
      NULL AS f9740_email,
      NULL AS f9740_celular,
      NULL AS f9740_direccion1
    FROM t200_mm_terceros WITH (NOLOCK)
    WHERE f200_ind_tipo_tercero = 1
    ${searchFilter}
    ORDER BY f200_rowid DESC
    ${paginationClause}
  `;

  const result = await request.query(query);
  
  // Siempre obtener el total de registros con el mismo filtro de búsqueda
  const countRequest = pool.request();
  if (search && search.trim() !== '') {
    const searchTerm = `%${search.trim()}%`;
    countRequest.input('searchTerm', searchTerm);
  }
  
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM t200_mm_terceros WITH (NOLOCK)
    WHERE f200_ind_tipo_tercero = 1
    ${searchFilter}
  `;
  const countResult = await countRequest.query(countQuery);
  const total = countResult.recordset[0].total;
  
  // Si hay paginación, retornar información completa de paginación
  if (page && pageSize) {
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      data: result.recordset,
      total: total,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: total,
        totalPages: totalPages
      }
    };
  }
  
  // Sin paginación, retornar solo el total
  return {
    data: result.recordset,
    total: total
  };
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

async function getTop10Clients(yearMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona año-mes, obtener todos los meses
  let anoMesFilter = '';
  if (yearMonth) {
    anoMesFilter = `AND v.f5461_ano_mes = ${yearMonth}`;
  }

  const query = `
    SELECT TOP 10
        v.f5461_rowid_tercero_fact AS [ID Cliente],
        SUM(v.f5461_vlr_bruto - v.f5461_vlr_dsctos + v.f5461_vlr_imp) AS [Ventas Netas]
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

async function getNewVsRecurrentClients(currentMonth, previousMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona mes previo, calcular automáticamente (restar 1 mes)
  let prevMonth = previousMonth;
  if (!prevMonth && currentMonth) {
    const year = Math.floor(currentMonth / 100);
    const month = currentMonth % 100;
    
    let prevYear = year;
    let prevMonthNum = month - 1;
    
    if (prevMonthNum === 0) {
      prevMonthNum = 12;
      prevYear = year - 1;
    }
    
    prevMonth = prevYear * 100 + prevMonthNum;
  }

  if (!currentMonth) {
    throw new Error('El mes actual (currentMonth) es requerido');
  }

  const query = `
    WITH ClientesActuales AS (
        SELECT DISTINCT v.f5461_rowid_tercero_fact
        FROM t5461_acum_ventas_fact v
        WHERE v.f5461_id_cia = ${companyId}
          AND v.f5461_ano_mes = ${currentMonth}
    ),
    ClientesPrevios AS (
        SELECT DISTINCT v.f5461_rowid_tercero_fact
        FROM t5461_acum_ventas_fact v
        WHERE v.f5461_id_cia = ${companyId}
          AND v.f5461_ano_mes = ${prevMonth}
    )
    SELECT
        CASE 
            WHEN p.f5461_rowid_tercero_fact IS NULL THEN 'Clientes Nuevos'
            ELSE 'Clientes Recurrentes'
        END AS [Tipo Cliente],
        COUNT(*) AS [Cantidad Clientes]
    FROM
        ClientesActuales c
        LEFT JOIN ClientesPrevios p
            ON c.f5461_rowid_tercero_fact = p.f5461_rowid_tercero_fact
    GROUP BY
        CASE 
            WHEN p.f5461_rowid_tercero_fact IS NULL THEN 'Clientes Nuevos'
            ELSE 'Clientes Recurrentes'
        END
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { getAllClients, getSalesByClient, getTop10Clients, getNewVsRecurrentClients };

