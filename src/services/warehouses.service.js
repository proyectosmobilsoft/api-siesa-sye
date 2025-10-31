const { getPool } = require('../db/db');

async function getAllWarehouses() {
  const pool = await getPool();

  const query = `
    SELECT
      f150_ts,
      f150_id_cia,
      f150_rowid,
      f150_id,
      f150_descripcion,
      f150_descripcion_corta,
      f150_id_co,
      f150_id_instalacion,
      f150_rowid_contacto,
      f150_ind_estado,
      f150_ind_cntrl_existencia,
      f150_ind_multi_ubicacion,
      f150_ind_lotes,
      f150_ind_costos,
      f150_ind_facturable,
      f150_ind_considerable_mrp,
      f150_notas,
      f150_id_instalacion_base_mrp,
      f150_id_cia_base_mrp,
      f150_ind_consig_dada,
      f150_ind_exclusivo_pdv,
      f150_ind_cntrl_disponibilidad,
      f150_rowid_movto_entidad,
      f150_id_bd,
      f150_identificacion_mac,
      f150_id_portafolio_inv,
      f150_ind_um_portafolio_inv,
      f150_rowid_ccosto,
      f150_ind_consig_recibida,
      f150_rowid_bodega_propia
    FROM t150_mc_bodegas
    ORDER BY f150_rowid DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

async function getSalesByWarehouse(yearMonth = null, companyId = 1) {
  const pool = await getPool();

  // Si no se proporciona año-mes, obtener todos los meses
  let anoMesFilter = '';
  if (yearMonth) {
    anoMesFilter = `AND v.f5461_ano_mes = ${yearMonth}`;
  }

  const query = `
    SELECT 
        v.f5461_rowid_bodega AS IdBodega,
        b.f150_descripcion AS NombreBodega,
        SUM(v.f5461_vlr_bruto) AS VentasTotales,
        SUM(v.f5461_vlr_dsctos) AS DescuentosTotales,
        SUM(v.f5461_vlr_imp) AS ImpuestosTotales,
        SUM(v.f5461_vlr_bruto - v.f5461_costo_prom) AS MargenBruto,
        COUNT(DISTINCT v.f5461_fecha_cubo) AS DiasFacturacion,
        CASE 
            WHEN COUNT(DISTINCT v.f5461_fecha_cubo) > 0 
            THEN SUM(v.f5461_vlr_bruto) / COUNT(DISTINCT v.f5461_fecha_cubo)
            ELSE 0 
        END AS PromedioDiarioFacturacion
    FROM 
        t5461_acum_ventas_fact v
    INNER JOIN 
        t150_mc_bodegas b ON v.f5461_rowid_bodega = b.f150_rowid
    WHERE 
        v.f5461_id_cia = ${companyId}
        ${anoMesFilter}
    GROUP BY 
        v.f5461_rowid_bodega,
        b.f150_descripcion
    ORDER BY 
        VentasTotales DESC
  `;

  const result = await pool.request().query(query);
  return result.recordset;
}

module.exports = { getAllWarehouses, getSalesByWarehouse };

