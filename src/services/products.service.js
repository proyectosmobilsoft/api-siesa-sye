const { getPool } = require('../db/db');

async function getAllProducts() {
  const pool = await getPool();

  const query = `
    SELECT
      f120_ts,
      f120_id_cia,
      f120_id,
      f120_rowid,
      f120_referencia,
      f120_descripcion,
      f120_descripcion_corta,
      f120_id_grupo_impositivo,
      f120_id_tipo_inv_serv,
      f120_id_grupo_dscto,
      f120_ind_tipo_item,
      f120_ind_compra,
      f120_ind_venta,
      f120_ind_manufactura,
      f120_ind_lista_precios_ext,
      f120_ind_lote,
      f120_ind_lote_asignacion,
      f120_ind_sobrecostos,
      f120_vida_util,
      f120_rowid_tercero_prov,
      f120_id_sucursal_prov,
      f120_rowid_tercero_cli,
      f120_id_sucursal_cli,
      f120_id_unidad_inventario,
      f120_id_unidad_adicional,
      f120_id_unidad_orden,
      f120_id_unidad_empaque,
      f120_id_descripcion_tecnica,
      f120_id_extension1,
      f120_id_extension2,
      f120_rowid_foto,
      f120_notas,
      f120_id_segmento_costo,
      f120_usuario_creacion,
      f120_usuario_actualizacion,
      f120_fecha_creacion,
      f120_fecha_actualizacion,
      f120_ind_serial,
      f120_id_cfg_serial,
      f120_ind_paquete,
      f120_rowid_movto_entidad,
      f120_ind_exento,
      f120_ind_venta_interno,
      f120_ind_generico,
      f120_ind_gum_unificado,
      f120_id_unidad_precio,
      f120_ind_controlado
    FROM t120_mc_items
    ORDER BY f120_id DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function getSalesByProduct(yearMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona año-mes, obtener todos los meses
  let anoMesFilter = '';
  if (yearMonth) {
    anoMesFilter = `AND v.f5461_ano_mes = ${yearMonth}`;
  }

  const query = `
    SELECT 
        i.f120_id AS CodigoProducto,
        i.f120_descripcion AS NombreProducto,
        SUM(v.f5461_cant_1) AS CantidadVendida,
        SUM(v.f5461_vlr_bruto) AS VentasTotales,
        SUM(v.f5461_vlr_dsctos) AS DescuentosTotales,
        SUM(v.f5461_vlr_imp) AS ImpuestosTotales,
        SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) AS MargenBruto,
        CASE 
            WHEN SUM(v.f5461_cant_1) > 0 
            THEN (SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) / SUM(v.f5461_cant_1)) 
            ELSE 0 
        END AS MargenUnitario
    FROM 
        t5461_acum_ventas_fact v
    INNER JOIN 
        t120_mc_items i 
        ON v.f5461_rowid_item_ext = i.f120_rowid
    WHERE 
        v.f5461_id_cia = ${companyId}
        ${anoMesFilter}
    GROUP BY 
        i.f120_id, 
        i.f120_descripcion
    ORDER BY 
        VentasTotales DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function getTop10BestSellingProducts(yearMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona año-mes, obtener todos los meses
  let anoMesFilter = '';
  if (yearMonth) {
    anoMesFilter = `AND v.f5461_ano_mes = ${yearMonth}`;
  }

  const query = `
    SELECT TOP 10
        i.f120_id AS CodigoProducto,
        i.f120_descripcion AS NombreProducto,
        SUM(v.f5461_cant_1) AS CantidadVendida,
        SUM(v.f5461_vlr_bruto) AS VentasTotales,
        SUM(v.f5461_vlr_dsctos) AS DescuentosTotales,
        SUM(v.f5461_vlr_imp) AS ImpuestosTotales,
        SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) AS MargenBruto,
        CASE 
            WHEN SUM(v.f5461_cant_1) > 0 
            THEN (SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) / SUM(v.f5461_cant_1)) 
            ELSE 0 
        END AS MargenUnitario
    FROM 
        t5461_acum_ventas_fact v
    INNER JOIN 
        t120_mc_items i 
        ON v.f5461_rowid_item_ext = i.f120_rowid
    WHERE 
        v.f5461_id_cia = ${companyId}
        ${anoMesFilter}
    GROUP BY 
        i.f120_id, 
        i.f120_descripcion
    ORDER BY 
        VentasTotales DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function getTop10LeastSellingProducts(yearMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona año-mes, obtener todos los meses
  let anoMesFilter = '';
  if (yearMonth) {
    anoMesFilter = `AND v.f5461_ano_mes = ${yearMonth}`;
  }

  const query = `
    SELECT TOP 10
        i.f120_id AS CodigoProducto,
        i.f120_descripcion AS NombreProducto,
        SUM(v.f5461_cant_1) AS CantidadVendida,
        SUM(v.f5461_vlr_bruto) AS VentasTotales,
        SUM(v.f5461_vlr_dsctos) AS DescuentosTotales,
        SUM(v.f5461_vlr_imp) AS ImpuestosTotales,
        SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) AS MargenBruto,
        CASE 
            WHEN SUM(v.f5461_cant_1) > 0 
            THEN (SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) / SUM(v.f5461_cant_1)) 
            ELSE 0 
        END AS MargenUnitario
    FROM 
        t5461_acum_ventas_fact v
    INNER JOIN 
        t120_mc_items i 
        ON v.f5461_rowid_item_ext = i.f120_rowid
    WHERE 
        v.f5461_id_cia = ${companyId}
        ${anoMesFilter}
    GROUP BY 
        i.f120_id, 
        i.f120_descripcion
    ORDER BY 
        VentasTotales ASC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { getAllProducts, getSalesByProduct, getTop10BestSellingProducts, getTop10LeastSellingProducts };
