const { getPool } = require('../db/db');

async function getAllCuentasBancarias() {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 60 segundos para consultas complejas
  request.timeout = 60000;

  // Consulta optimizada con WITH (NOLOCK)
  const query = `
    SELECT
      f026_id_cia,
      f026_id,
      f026_descripcion,
      f026_rowid_aux_bancos,
      f026_id_banco,
      f026_nro_cuenta,
      f026_ind_controla_chequera,
      f026_inicial1,
      f026_final1,
      f026_siguiente1,
      f026_inicial2,
      f026_final2,
      f026_siguiente2,
      f026_ind_controla_consecutivo,
      f026_ind_pago_electronico,
      f026_ind_forma_generacion,
      f026_rowid_tercero_pago_elect,
      f026_criterio_ch_digitos,
      f026_criterio_ch,
      f026_criterio_cg_digitos,
      f026_criterio_cg,
      f026_criterio_nd_digitos,
      f026_criterio_nd,
      f026_criterio_nc_digitos,
      f026_criterio_nc,
      f026_id_formato_extracto,
      f026_id_formato,
      f026_id_pe_formato,
      f026_fecha_ultima_contab,
      f026_ts,
      f026_ind_multiple_movto_cg,
      f026_num_max_med_pagos,
      f026_ind_encripcion,
      f026_ruta_exe_enc,
      f026_parametros_enc,
      f026_ruta_cert_enc,
      f026_vlr_retorno_exitoso_enc,
      f026_id_llave_ret_gmf,
      f026_ind_tarjeta_decimales,
      f026_num_tarjeta_decimales,
      f026_ruta1_archivo_pe,
      f026_ruta2_archivo_pe
    FROM t026_mm_cuentas_bancarias WITH (NOLOCK)
    ORDER BY f026_id_cia, f026_id
  `;

  const result = await request.query(query);
  return result.recordset;
}

module.exports = { getAllCuentasBancarias };

