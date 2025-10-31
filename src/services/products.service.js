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

module.exports = { getAllProducts };
