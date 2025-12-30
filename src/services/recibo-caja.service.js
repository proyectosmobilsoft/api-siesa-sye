const { getPool } = require('../db/db');
const sql = require('mssql');

/**
 * Servicio para procesar recibos de caja ejecutando una secuencia de stored procedures
 * Los procedimientos se ejecutan secuencialmente, esperando que cada uno termine exitosamente
 */

/**
 * Ejecuta la secuencia completa de stored procedures para crear un recibo de caja
 * @param {Object} params - Parámetros para todos los stored procedures
 * @returns {Promise<Object>} - Resultado de la ejecución con los valores de salida
 */
async function procesarReciboCaja(params) {
  // Validar TODOS los parámetros requeridos de todos los stored procedures
  const allRequiredParams = [
    // sp_docto_insertar
    'id_cia', 'id_co', 'id_tipo_docto', 'consec_docto', 'prefijo', 'fecha',
    'periodo', 'rowid_tercero', 'sucursal', 'total_db', 'total_cr',
    'ind_origen', 'ind_estado', 'ind_transmit', 'fecha_creacion',
    'fecha_actualiza', 'fecha_afectado', 'notas', 'p_estado',
    // sp_mov_docto_insertar
    'id_un', 'rowid_auxiliar', 'rowid_ccosto', 'rowid_fe', 'id_co_mov',
    'valor_db', 'valor_cr', 'docto_banco', 'nro_docto_banco',
    // sp_rel_med_pag_insertar
    'id_medios_pago', 'valor', 'id_banco', 'nro_cheque', 'nro_cuenta',
    'cod_seguridad', 'nro_autorizacion', 'fecha_vcto', 'id_cuentas_bancarias',
    'fecha_consignacion', 'rowid_docto_consignacion', 'rowid_mov_docto_consignacion',
    'id_causales_devolucion', 'id_sucursal',
    // sp_let_movto_adicionar
    'p_rowid_docto_letra', 'p_id_ubicacion_origen', 'p_id_ubicacion_destino',
    'p_rowid_sa_origen', 'p_rowid_sa_destino', 'p_id_cuenta_bancaria'
  ];
  
  // Parámetros que pueden ser strings vacíos (opcionales pero deben estar presentes)
  const paramsThatCanBeEmpty = ['id_causales_devolucion'];
  
  const missingParams = allRequiredParams.filter(param => {
    if (paramsThatCanBeEmpty.includes(param)) {
      // Para estos parámetros, solo validar que existan (pueden ser strings vacíos)
      return params[param] === undefined || params[param] === null;
    }
    // Para el resto, validar que no estén vacíos
    return params[param] === undefined || params[param] === null || params[param] === '';
  });
  
  if (missingParams.length > 0) {
    throw new Error(`Parámetros requeridos faltantes: ${missingParams.join(', ')}`);
  }
  
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  
  try {
    await transaction.begin();
    console.log('🔄 Iniciando transacción para recibo de caja...');
    
    const results = {
      sp_docto_insertar: null,
      sp_mov_docto_insertar: null,
      sp_rel_med_pag_insertar: null,
      sp_let_movto_adicionar: null,
      sp_docto_actualizar_estado: null
    };
    
    // 1. Ejecutar sp_docto_insertar
    console.log('📝 Ejecutando sp_docto_insertar...');
    const request1 = new sql.Request(transaction);
    request1.timeout = 120000;
    
    // Configurar parámetros de entrada
    request1.input('id_cia', sql.SmallInt, params.id_cia);
    request1.input('id_co', sql.Char(3), params.id_co);
    request1.input('id_tipo_docto', sql.Char(3), params.id_tipo_docto);
    request1.input('consec_docto', sql.Int, params.consec_docto);
    request1.input('prefijo', sql.Char(4), params.prefijo);
    request1.input('fecha', sql.DateTime, params.fecha);
    request1.input('periodo', sql.Int, params.periodo);
    request1.input('rowid_tercero', sql.Int, params.rowid_tercero);
    request1.input('sucursal', sql.Char(3), params.sucursal);
    request1.input('total_db', sql.Money, params.total_db);
    request1.input('total_cr', sql.Money, params.total_cr);
    request1.input('ind_origen', sql.SmallInt, params.ind_origen);
    request1.input('ind_estado', sql.SmallInt, params.ind_estado);
    request1.input('ind_transmit', sql.SmallInt, params.ind_transmit);
    request1.input('fecha_creacion', sql.DateTime, params.fecha_creacion);
    request1.input('fecha_actualiza', sql.DateTime, params.fecha_actualiza);
    request1.input('fecha_afectado', sql.DateTime, params.fecha_afectado);
    request1.input('notas', sql.VarChar(255), params.notas);
    
    // Parámetros opcionales
    if (params.usuariocreacion !== undefined) request1.input('usuariocreacion', sql.VarChar(30), params.usuariocreacion);
    if (params.p_rowid_docto_base !== undefined) request1.input('p_rowid_docto_base', sql.Int, params.p_rowid_docto_base);
    if (params.p_referencia !== undefined) request1.input('p_referencia', sql.VarChar(20), params.p_referencia);
    if (params.p_id_mandato !== undefined) request1.input('p_id_mandato', sql.Char(15), params.p_id_mandato);
    if (params.p_rowid_movto_entidad !== undefined) request1.input('p_rowid_movto_entidad', sql.Int, params.p_rowid_movto_entidad);
    if (params.p_id_tipo_cambio !== undefined) request1.input('p_id_tipo_cambio', sql.Char(3), params.p_id_tipo_cambio);
    if (params.p_tasa_conv !== undefined) request1.input('p_tasa_conv', sql.Decimal(28, 4), params.p_tasa_conv);
    if (params.p_tasa_local !== undefined) request1.input('p_tasa_local', sql.Decimal(28, 4), params.p_tasa_local);
    if (params.p_id_moneda_docto !== undefined) request1.input('p_id_moneda_docto', sql.Char(3), params.p_id_moneda_docto);
    if (params.p_id_moneda_conv !== undefined) request1.input('p_id_moneda_conv', sql.Char(3), params.p_id_moneda_conv);
    if (params.p_ind_forma_conv !== undefined) request1.input('p_ind_forma_conv', sql.SmallInt, params.p_ind_forma_conv);
    if (params.p_id_moneda_local !== undefined) request1.input('p_id_moneda_local', sql.Char(3), params.p_id_moneda_local);
    if (params.p_ind_forma_local !== undefined) request1.input('p_ind_forma_local', sql.SmallInt, params.p_ind_forma_local);
    if (params.p_rowid_te_plantilla !== undefined) request1.input('p_rowid_te_plantilla', sql.Int, params.p_rowid_te_plantilla);
    if (params.p_rowid_sesion !== undefined) request1.input('p_rowid_sesion', sql.Int, params.p_rowid_sesion);
    if (params.p_ind_tipo_origen !== undefined) request1.input('p_ind_tipo_origen', sql.SmallInt, params.p_ind_tipo_origen);
    if (params.p_rowid_docto_rp !== undefined) request1.input('p_rowid_docto_rp', sql.Int, params.p_rowid_docto_rp);
    if (params.p_id_proyecto !== undefined) request1.input('p_id_proyecto', sql.Char(15), params.p_id_proyecto);
    if (params.p_ind_dif_cambio_forma !== undefined) request1.input('p_ind_dif_cambio_forma', sql.SmallInt, params.p_ind_dif_cambio_forma);
    if (params.p_ind_clase_origen !== undefined) request1.input('p_ind_clase_origen', sql.SmallInt, params.p_ind_clase_origen);
    
    // Parámetros de salida
    request1.output('p_rowid', sql.Int);
    request1.output('p_timestamp', sql.DateTime);
    
    const result1 = await request1.execute('sp_docto_insertar');
    results.sp_docto_insertar = {
      p_rowid: result1.output.p_rowid,
      p_timestamp: result1.output.p_timestamp
    };
    console.log(`✅ sp_docto_insertar completado. p_rowid: ${results.sp_docto_insertar.p_rowid}`);
    
    // 2. Ejecutar sp_mov_docto_insertar
    console.log('📝 Ejecutando sp_mov_docto_insertar...');
    const request2 = new sql.Request(transaction);
    request2.timeout = 120000;
    
    // Usar el p_rowid del procedimiento anterior
    const rowid_docto = results.sp_docto_insertar.p_rowid;
    
    request2.input('id_cia', sql.SmallInt, params.id_cia);
    request2.input('rowid_docto', sql.Int, rowid_docto);
    request2.input('id_un', sql.VarChar(20), params.id_un);
    request2.input('rowid_auxiliar', sql.Int, params.rowid_auxiliar);
    request2.input('rowid_tercero', sql.Int, params.rowid_tercero);
    request2.input('sucursal', sql.Char(3), params.sucursal);
    request2.input('rowid_ccosto', sql.Int, params.rowid_ccosto);
    request2.input('rowid_fe', sql.Int, params.rowid_fe);
    request2.input('id_co_mov', sql.Char(3), params.id_co_mov);
    request2.input('fecha', sql.DateTime, params.fecha);
    request2.input('periodo', sql.Int, params.periodo);
    request2.input('ind_estado', sql.SmallInt, params.ind_estado);
    request2.input('valor_db', sql.Money, params.valor_db);
    request2.input('valor_cr', sql.Money, params.valor_cr);
    request2.input('valor_db_alt', sql.Money, params.valor_db_alt || 0);
    request2.input('valor_cr_alt', sql.Money, params.valor_cr_alt || 0);
    request2.input('base_gravable', sql.Money, params.base_gravable || 0);
    request2.input('docto_banco', sql.Char(2), params.docto_banco);
    request2.input('nro_docto_banco', sql.Int, params.nro_docto_banco);
    request2.input('ind_mov_sa', sql.SmallInt, params.ind_mov_sa || 0);
    request2.input('ind_mov_diferido', sql.SmallInt, params.ind_mov_diferido || 0);
    request2.input('notas', sql.VarChar(255), params.notas);
    request2.input('IndAutomatico', sql.SmallInt, params.IndAutomatico || 0);
    request2.input('ind_mov_caja', sql.SmallInt, params.ind_mov_caja || 0);
    
    // Parámetros opcionales
    if (params.p_rowid_mov_distribucion !== undefined) request2.input('p_rowid_mov_distribucion', sql.Int, params.p_rowid_mov_distribucion);
    if (params.p_ind_mov_invent !== undefined) request2.input('p_ind_mov_invent', sql.SmallInt, params.p_ind_mov_invent);
    if (params.p_nro_alt_docto_banco !== undefined) request2.input('p_nro_alt_docto_banco', sql.VarChar(30), params.p_nro_alt_docto_banco);
    if (params.p_generar_rx !== undefined) request2.input('p_generar_rx', sql.SmallInt, params.p_generar_rx);
    if (params.p_valor_db_rx !== undefined) request2.input('p_valor_db_rx', sql.Money, params.p_valor_db_rx);
    if (params.p_valor_cr_rx !== undefined) request2.input('p_valor_cr_rx', sql.Money, params.p_valor_cr_rx);
    if (params.p_valor_base_gravable_rx !== undefined) request2.input('p_valor_base_gravable_rx', sql.Money, params.p_valor_base_gravable_rx);
    if (params.p_rowid_cpto_tesoreria !== undefined) request2.input('p_rowid_cpto_tesoreria', sql.Int, params.p_rowid_cpto_tesoreria);
    if (params.p_ind_respetar_valor2 !== undefined) request2.input('p_ind_respetar_valor2', sql.SmallInt, params.p_ind_respetar_valor2);
    if (params.p_valor_db2 !== undefined) request2.input('p_valor_db2', sql.Money, params.p_valor_db2);
    if (params.p_valor_cr2 !== undefined) request2.input('p_valor_cr2', sql.Money, params.p_valor_cr2);
    if (params.p_base_gravable2 !== undefined) request2.input('p_base_gravable2', sql.Money, params.p_base_gravable2);
    if (params.p_valor_db_alt2 !== undefined) request2.input('p_valor_db_alt2', sql.Money, params.p_valor_db_alt2);
    if (params.p_valor_cr_alt2 !== undefined) request2.input('p_valor_cr_alt2', sql.Money, params.p_valor_cr_alt2);
    if (params.p_valor_db_rx2 !== undefined) request2.input('p_valor_db_rx2', sql.Money, params.p_valor_db_rx2);
    if (params.p_valor_cr_rx2 !== undefined) request2.input('p_valor_cr_rx2', sql.Money, params.p_valor_cr_rx2);
    if (params.p_valor_base_gravable_rx2 !== undefined) request2.input('p_valor_base_gravable_rx2', sql.Money, params.p_valor_base_gravable_rx2);
    if (params.p_ind_respetar_valor3 !== undefined) request2.input('p_ind_respetar_valor3', sql.SmallInt, params.p_ind_respetar_valor3);
    if (params.p_valor_db3 !== undefined) request2.input('p_valor_db3', sql.Money, params.p_valor_db3);
    if (params.p_valor_cr3 !== undefined) request2.input('p_valor_cr3', sql.Money, params.p_valor_cr3);
    if (params.p_base_gravable3 !== undefined) request2.input('p_base_gravable3', sql.Money, params.p_base_gravable3);
    if (params.p_valor_db_alt3 !== undefined) request2.input('p_valor_db_alt3', sql.Money, params.p_valor_db_alt3);
    if (params.p_valor_cr_alt3 !== undefined) request2.input('p_valor_cr_alt3', sql.Money, params.p_valor_cr_alt3);
    if (params.p_valor_db_rx3 !== undefined) request2.input('p_valor_db_rx3', sql.Money, params.p_valor_db_rx3);
    if (params.p_valor_cr_rx3 !== undefined) request2.input('p_valor_cr_rx3', sql.Money, params.p_valor_cr_rx3);
    if (params.p_valor_base_gravable_rx3 !== undefined) request2.input('p_valor_base_gravable_rx3', sql.Money, params.p_valor_base_gravable_rx3);
    if (params.p_rowid_movto_entidad !== undefined) request2.input('p_rowid_movto_entidad', sql.Int, params.p_rowid_movto_entidad);
    if (params.p_impto_asum !== undefined) request2.input('p_impto_asum', sql.Money, params.p_impto_asum);
    if (params.p_impto_asum2 !== undefined) request2.input('p_impto_asum2', sql.Money, params.p_impto_asum2);
    if (params.p_impto_asum3 !== undefined) request2.input('p_impto_asum3', sql.Money, params.p_impto_asum3);
    if (params.p_impto_asum_rx !== undefined) request2.input('p_impto_asum_rx', sql.Money, params.p_impto_asum_rx);
    if (params.p_impto_asum_rx2 !== undefined) request2.input('p_impto_asum_rx2', sql.Money, params.p_impto_asum_rx2);
    if (params.p_impto_asum_rx3 !== undefined) request2.input('p_impto_asum_rx3', sql.Money, params.p_impto_asum_rx3);
    if (params.p_generar_rx_docto !== undefined) request2.input('p_generar_rx_docto', sql.SmallInt, params.p_generar_rx_docto);
    if (params.p_rowid_sesion !== undefined) request2.input('p_rowid_sesion', sql.Int, params.p_rowid_sesion);
    if (params.p_tasa_rx !== undefined) request2.input('p_tasa_rx', sql.Decimal(28, 4), params.p_tasa_rx);
    if (params.p_ind_forma_rx !== undefined) request2.input('p_ind_forma_rx', sql.SmallInt, params.p_ind_forma_rx);
    if (params.p_ind_forma_conv !== undefined) request2.input('p_ind_forma_conv', sql.SmallInt, params.p_ind_forma_conv);
    if (params.p_tasa_libro1 !== undefined) request2.input('p_tasa_libro1', sql.Decimal(28, 4), params.p_tasa_libro1);
    if (params.p_tasa_libro2 !== undefined) request2.input('p_tasa_libro2', sql.Decimal(28, 4), params.p_tasa_libro2);
    if (params.p_tasa_libro3 !== undefined) request2.input('p_tasa_libro3', sql.Decimal(28, 4), params.p_tasa_libro3);
    if (params.p_ind_mov_af !== undefined) request2.input('p_ind_mov_af', sql.SmallInt, params.p_ind_mov_af);
    if (params.p_rowid_rubro !== undefined) request2.input('p_rowid_rubro', sql.Int, params.p_rowid_rubro);
    
    request2.output('RowId', sql.Int);
    
    const result2 = await request2.execute('sp_mov_docto_insertar');
    results.sp_mov_docto_insertar = {
      RowId: result2.output.RowId
    };
    console.log(`✅ sp_mov_docto_insertar completado. RowId: ${results.sp_mov_docto_insertar.RowId}`);
    
    // 3. Ejecutar sp_rel_med_pag_insertar
    console.log('📝 Ejecutando sp_rel_med_pag_insertar...');
    const request3 = new sql.Request(transaction);
    request3.timeout = 120000;
    
    request3.input('id_cia', sql.SmallInt, params.id_cia);
    request3.input('rowid_docto', sql.Int, rowid_docto);
    request3.input('rowid_mov_docto', sql.Int, results.sp_mov_docto_insertar.RowId);
    request3.input('rowid_auxiliar', sql.Int, params.rowid_auxiliar);
    request3.input('rowid_ccosto', sql.Int, params.rowid_ccosto);
    request3.input('rowid_fe', sql.Int, params.rowid_fe);
    request3.input('id_co', sql.Char(3), params.id_co);
    request3.input('id_un', sql.VarChar(20), params.id_un);
    request3.input('id_medios_pago', sql.Char(3), params.id_medios_pago);
    request3.input('ind_estado', sql.SmallInt, params.ind_estado);
    request3.input('valor', sql.Money, params.valor);
    request3.input('valor_alterna', sql.Money, params.valor_alterna || 0);
    request3.input('id_banco', sql.Char(10), params.id_banco);
    request3.input('nro_cheque', sql.Int, params.nro_cheque);
    request3.input('nro_cuenta', sql.VarChar(25), params.nro_cuenta);
    request3.input('cod_seguridad', sql.Char(3), params.cod_seguridad);
    request3.input('nro_autorizacion', sql.VarChar(10), params.nro_autorizacion);
    request3.input('fecha_vcto', sql.Char(8), params.fecha_vcto);
    request3.input('notas', sql.VarChar(255), params.notas);
    request3.input('id_cuentas_bancarias', sql.Char(3), params.id_cuentas_bancarias);
    request3.input('fecha_consignacion', sql.DateTime, params.fecha_consignacion);
    request3.input('rowid_docto_consignacion', sql.Int, params.rowid_docto_consignacion);
    request3.input('rowid_mov_docto_consignacion', sql.Int, params.rowid_mov_docto_consignacion);
    request3.input('id_causales_devolucion', sql.Char(3), params.id_causales_devolucion);
    request3.input('rowid_tercero', sql.Int, params.rowid_tercero);
    request3.input('id_sucursal', sql.Char(3), params.id_sucursal);
    
    // Parámetros opcionales
    if (params.p_id_caja !== undefined) request3.input('p_id_caja', sql.Char(3), params.p_id_caja);
    if (params.p_id_moneda !== undefined) request3.input('p_id_moneda', sql.Char(3), params.p_id_moneda);
    if (params.p_ind_tipo_medio !== undefined) request3.input('p_ind_tipo_medio', sql.SmallInt, params.p_ind_tipo_medio);
    if (params.p_referencia_otros !== undefined) request3.input('p_referencia_otros', sql.VarChar(30), params.p_referencia_otros);
    if (params.p_valor_cr !== undefined) request3.input('p_valor_cr', sql.Money, params.p_valor_cr);
    if (params.p_valor_cr_alt !== undefined) request3.input('p_valor_cr_alt', sql.Money, params.p_valor_cr_alt);
    if (params.p_ind_cambio !== undefined) request3.input('p_ind_cambio', sql.SmallInt, params.p_ind_cambio);
    if (params.p_NroAltDoctoBanco !== undefined) request3.input('p_NroAltDoctoBanco', sql.VarChar(30), params.p_NroAltDoctoBanco);
    if (params.p_ind_aux_orden !== undefined) request3.input('p_ind_aux_orden', sql.SmallInt, params.p_ind_aux_orden);
    if (params.p_id_cta_bancaria_cg !== undefined) request3.input('p_id_cta_bancaria_cg', sql.Char(3), params.p_id_cta_bancaria_cg);
    if (params.p_referencia_cg !== undefined) request3.input('p_referencia_cg', sql.VarChar(30), params.p_referencia_cg);
    if (params.p_rowid_ccosto_cg !== undefined) request3.input('p_rowid_ccosto_cg', sql.Int, params.p_rowid_ccosto_cg);
    if (params.p_fecha_cg_cg !== undefined) request3.input('p_fecha_cg_cg', sql.DateTime, params.p_fecha_cg_cg);
    if (params.p_nro_docto_alterno_cg !== undefined) request3.input('p_nro_docto_alterno_cg', sql.VarChar(30), params.p_nro_docto_alterno_cg);
    if (params.p_ind_liquida_tarjeta !== undefined) request3.input('p_ind_liquida_tarjeta', sql.SmallInt, params.p_ind_liquida_tarjeta);
    if (params.p_vlr_impto_tarjeta !== undefined) request3.input('p_vlr_impto_tarjeta', sql.Money, params.p_vlr_impto_tarjeta);
    if (params.p_vlr_impto_tarjeta_alt !== undefined) request3.input('p_vlr_impto_tarjeta_alt', sql.Money, params.p_vlr_impto_tarjeta_alt);
    if (params.p_fecha_elab_cheq_postf !== undefined) request3.input('p_fecha_elab_cheq_postf', sql.DateTime, params.p_fecha_elab_cheq_postf);
    if (params.p_docto_banco !== undefined) request3.input('p_docto_banco', sql.VarChar(2), params.p_docto_banco);
    
    request3.output('p_rowid', sql.Int);
    
    const result3 = await request3.execute('sp_rel_med_pag_insertar');
    results.sp_rel_med_pag_insertar = {
      p_rowid: result3.output.p_rowid
    };
    console.log(`✅ sp_rel_med_pag_insertar completado. p_rowid: ${results.sp_rel_med_pag_insertar.p_rowid}`);
    
    // 4. Ejecutar sp_let_movto_adicionar
    console.log('📝 Ejecutando sp_let_movto_adicionar...');
    const request4 = new sql.Request(transaction);
    request4.timeout = 120000;
    
    request4.input('p_id_cia', sql.SmallInt, params.id_cia);
    request4.input('p_rowid_docto_planilla', sql.Int, rowid_docto);
    request4.input('p_rowid_docto_letra', sql.Int, params.p_rowid_docto_letra);
    request4.input('p_id_ubicacion_origen', sql.VarChar(3), params.p_id_ubicacion_origen);
    request4.input('p_id_ubicacion_destino', sql.VarChar(3), params.p_id_ubicacion_destino);
    request4.input('p_rowid_sa_origen', sql.Int, params.p_rowid_sa_origen);
    request4.input('p_rowid_sa_destino', sql.Int, params.p_rowid_sa_destino);
    request4.input('p_leer_origenes', sql.SmallInt, params.p_leer_origenes || 0);
    request4.input('p_id_cuenta_bancaria', sql.Char(3), params.p_id_cuenta_bancaria);
    if (params.p_id_banco !== undefined) request4.input('p_id_banco', sql.Char(10), params.p_id_banco);
    
    request4.output('p_error', sql.Int);
    request4.output('p_des_error', sql.VarChar(100));
    request4.output('p_des_error2', sql.VarChar(100));
    
    const result4 = await request4.execute('sp_let_movto_adicionar');
    results.sp_let_movto_adicionar = {
      p_error: result4.output.p_error,
      p_des_error: result4.output.p_des_error,
      p_des_error2: result4.output.p_des_error2
    };
    console.log(`✅ sp_let_movto_adicionar completado. p_error: ${results.sp_let_movto_adicionar.p_error}`);
    
    // Verificar si hubo error en sp_let_movto_adicionar
    if (results.sp_let_movto_adicionar.p_error !== 0) {
      throw new Error(`Error en sp_let_movto_adicionar: ${results.sp_let_movto_adicionar.p_des_error} - ${results.sp_let_movto_adicionar.p_des_error2}`);
    }
    
    // 5. Ejecutar sp_docto_actualizar_estado
    console.log('📝 Ejecutando sp_docto_actualizar_estado...');
    const request5 = new sql.Request(transaction);
    request5.timeout = 120000;
    
    request5.input('p_rowid_docto', sql.Int, rowid_docto);
    request5.input('p_estado', sql.SmallInt, params.p_estado);
    if (params.p_usuario !== undefined) request5.input('p_usuario', sql.VarChar(30), params.p_usuario);
    if (params.p_id_motivo_otros !== undefined) request5.input('p_id_motivo_otros', sql.VarChar(20), params.p_id_motivo_otros);
    
    request5.output('p_error', sql.Int);
    request5.output('p_des_error', sql.VarChar(255));
    request5.output('p_id_cia', sql.SmallInt);
    request5.output('p_id_co', sql.Char(3));
    request5.output('p_id_tipo_docto', sql.Char(3));
    request5.output('p_numero_docto', sql.Int);
    request5.output('p_ind_cfdi', sql.SmallInt);
    
    const result5 = await request5.execute('sp_docto_actualizar_estado');
    results.sp_docto_actualizar_estado = {
      p_error: result5.output.p_error,
      p_des_error: result5.output.p_des_error,
      p_id_cia: result5.output.p_id_cia,
      p_id_co: result5.output.p_id_co,
      p_id_tipo_docto: result5.output.p_id_tipo_docto,
      p_numero_docto: result5.output.p_numero_docto,
      p_ind_cfdi: result5.output.p_ind_cfdi
    };
    console.log(`✅ sp_docto_actualizar_estado completado. p_error: ${results.sp_docto_actualizar_estado.p_error}`);
    
    // Verificar si hubo error en sp_docto_actualizar_estado
    if (results.sp_docto_actualizar_estado.p_error !== 0) {
      throw new Error(`Error en sp_docto_actualizar_estado: ${results.sp_docto_actualizar_estado.p_des_error}`);
    }
    
    // Si todo salió bien, hacer commit
    await transaction.commit();
    console.log('✅ Transacción completada exitosamente');
    
    return {
      success: true,
      message: 'Recibo de caja procesado exitosamente',
      results: results
    };
    
  } catch (error) {
    // Si hay error, hacer rollback
    try {
      await transaction.rollback();
      console.error('❌ Transacción revertida debido a error');
    } catch (rollbackError) {
      console.error('❌ Error al hacer rollback:', rollbackError);
    }
    
    console.error('❌ Error procesando recibo de caja:', error);
    throw error;
  }
}

module.exports = {
  procesarReciboCaja
};

