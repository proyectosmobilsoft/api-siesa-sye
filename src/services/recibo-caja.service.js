const { getPool } = require('../db/db');
const sql = require('mssql');

/**
 * Servicio para procesar recibos de caja ejecutando una secuencia de stored procedures
 * Los procedimientos se ejecutan secuencialmente, esperando que cada uno termine exitosamente
 */

/**
 * Obtiene el próximo consecutivo disponible para un tipo de documento
 * @param {Object} params - Parámetros para sp_tipo_docto_leer_proximo
 * @returns {Promise<Object>} - Resultado con el próximo consecutivo
 */
async function leerProximoConsecutivoRC({ id_cia, id_tipo_docto, id_co, p_bloquear = 0, p_leer_mandato_tipo = 0 }) {
  const pool = await getPool();
  const request = new sql.Request(pool);

  request.input('id_cia', sql.SmallInt, id_cia);
  request.input('id_tipo_docto', sql.Char(3), id_tipo_docto);
  request.input('id_co', sql.Char(3), id_co);
  request.input('p_bloquear', sql.SmallInt, p_bloquear);
  request.input('p_leer_mandato_tipo', sql.SmallInt, p_leer_mandato_tipo);
  request.output('p_ind_mandato_tipo', sql.SmallInt);

  const result = await request.execute('sp_tipo_docto_leer_proximo');

  return {
    success: true,
    proximoConsecutivo: result.recordset && result.recordset[0] || {},
    p_ind_mandato_tipo: result.output.p_ind_mandato_tipo
  };
}

/**
 * Función auxiliar para escapar strings SQL
 */
function escapeSQLString(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') {
    return `N'${value.replace(/'/g, "''")}'`;
  }
  return value;
}

/**
 * Función auxiliar para formatear fecha a DATETIME de SQL Server
 */
function formatSQLDateTime(dateValue) {
  if (!dateValue) return 'NULL';
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}'`;
}

/**
 * Ejecuta el script SQL completo para procesar un recibo de caja.
 * Ahora p_rowid_sa debe ser un arreglo (por ejemplo: [111, 222] o [{ p_rowid_sa: 111 }, { p_rowid_sa: 222 }])
 * y el script se ejecutará una vez por cada elemento del arreglo.
 * @param {Object} params - Parámetros del request body
 * @returns {Promise<Object>} - Resultado de la ejecución
 */
async function procesarReciboCaja(params) {
  console.log("params", params);
  
  // Validar parámetros requeridos básicos
  const requiredParams = [
    'p_cia', 'p_fecha', 'p_clase_modulo', 'p_rowid_usuario',
    'p_id_co', 'p_id_tipo_docto', 'p_numero_docto', 'p_clase_docto',
    'p_rowid_tercero', 'p_periodo_docto', 'p_notas', 'p_usuario',
    'p_id_caja', 'p_moneda', 'p_valor', 'p_rowid_cobrador',
    'p_rowid_fe', 'p_id_un', 'p_id_medio_pago', 'p_id_cta_bancaria',
    'p_referencia_med', 'p_rowid_sa'
  ];
  
  const missingParams = requiredParams.filter(param => 
    params[param] === undefined || params[param] === null || params[param] === ''
  );
  
  if (missingParams.length > 0) {
    throw new Error(`Parámetros requeridos faltantes: ${missingParams.join(', ')}`);
  }

  // p_rowid_sa ahora debe ser un arreglo (de números o de objetos con propiedad p_rowid_sa)
  if (!Array.isArray(params.p_rowid_sa) || params.p_rowid_sa.length === 0) {
    throw new Error('Parámetros requeridos faltantes: p_rowid_sa debe ser un arreglo con al menos un elemento');
  }

  const rowidSaList = params.p_rowid_sa.map(item => {
    if (typeof item === 'object' && item !== null) {
      return Number(item.p_rowid_sa);
    }
    return Number(item);
  });

  if (rowidSaList.some(v => Number.isNaN(v))) {
    throw new Error('Parámetros inválidos: todos los elementos de p_rowid_sa deben ser numéricos');
  }

  // Preparar valores comunes para el script SQL
  const p_prefijo = params.p_prefijo || '';
  const fechaSQL = formatSQLDateTime(params.p_fecha);
  const pool = await getPool();
  
  // Construir el script SQL base; luego se inyectan dinámicamente los bloques de saldo abierto
  const baseSqlScript = `
    /* =====================================================
      VARIABLES DE ENTRADA
      ===================================================== */
    DECLARE @p_cia SMALLINT = ${params.p_cia};
    DECLARE @p_fecha DATETIME = ${fechaSQL};
    DECLARE @p_clase_modulo SMALLINT = ${params.p_clase_modulo};
    DECLARE @p_rowid_usuario INT = ${params.p_rowid_usuario};

    DECLARE @p_id_co NVARCHAR(3) = ${escapeSQLString(params.p_id_co)};
    DECLARE @p_id_tipo_docto NVARCHAR(3) = ${escapeSQLString(params.p_id_tipo_docto)};
    DECLARE @p_numero_docto INT = ${params.p_numero_docto};
    DECLARE @p_clase_docto SMALLINT = ${params.p_clase_docto};
    DECLARE @p_rowid_tercero INT = ${params.p_rowid_tercero};
    DECLARE @p_periodo_docto INT = ${params.p_periodo_docto};
    DECLARE @p_prefijo NVARCHAR(4) = ${escapeSQLString(p_prefijo)};
    DECLARE @p_notas NVARCHAR(255) = ${escapeSQLString(params.p_notas)};
    DECLARE @p_usuario NVARCHAR(50) = ${escapeSQLString(params.p_usuario)};

    DECLARE @p_id_caja NVARCHAR(3) = ${escapeSQLString(params.p_id_caja)};
    DECLARE @p_moneda NVARCHAR(3) = ${escapeSQLString(params.p_moneda)};
    DECLARE @p_valor DECIMAL(18,4) = ${params.p_valor};
    DECLARE @p_rowid_cobrador INT = ${params.p_rowid_cobrador};
    DECLARE @p_rowid_fe INT = ${params.p_rowid_fe};
    DECLARE @p_id_un NVARCHAR(3) = ${escapeSQLString(params.p_id_un)};

    DECLARE @p_id_medio_pago NVARCHAR(10) = ${escapeSQLString(params.p_id_medio_pago)};
    DECLARE @p_id_cta_bancaria NVARCHAR(10) = ${escapeSQLString(params.p_id_cta_bancaria)};
    DECLARE @p_referencia_med NVARCHAR(50) = ${escapeSQLString(params.p_referencia_med)};
    DECLARE @p_rowid_sa INT = __ROWID_SA__; -- ID DE SALDO ABIERTO (se reemplaza en runtime)

/* =====================================================
      VARIABLES DE CONTROL
      ===================================================== */
    DECLARE 
        @v_error INT = 0,
        @v_deserror NVARCHAR(255) = '',
        @v_periodo INT,
        @v_rowid_docto INT,
        @v_timestamp DATETIME;

    /* =====================================================
      OUTPUT VALIDACIÓN DOCTO
      ===================================================== */
    DECLARE
        @v_ind_prefijo SMALLINT,
        @v_id_moneda_local NVARCHAR(3),
        @v_clase_agrupa SMALLINT,
        @v_clase_sin SMALLINT,
        @v_clase_modulo_out SMALLINT,
        @v_num_real INT,
        @v_ind_clase_aut SMALLINT,
        @v_dec_total SMALLINT,
        @v_ind_contable SMALLINT;

    /* =====================================================
      OUTPUT MEDIO DE PAGO
      ===================================================== */
    DECLARE
        @v_tipo_medio SMALLINT,
        @v_rowid_aux_bancos INT,
        @v_id_auxiliar NVARCHAR(15),
        @v_id_moneda_auxiliar NVARCHAR(3),
        @v_ind_aux_orden SMALLINT,
        @v_descripcion_mp NVARCHAR(40),
        @v_rowid_rel_mp INT;

    /* =====================================================
      OUTPUT ACTUALIZAR ESTADO
      ===================================================== */
    DECLARE
        @v_id_cia_out SMALLINT,
        @v_id_co_out NVARCHAR(3),
        @v_id_tipo_docto_out NVARCHAR(3),
        @v_numero_docto_out INT,
        @v_ind_cfdi_out SMALLINT;

    BEGIN TRY
        BEGIN TRAN;

        /* =============================
          1. PERIODO
          ============================= */
        EXEC sp_periodo_dada_fecha
            @p_cia,
            @p_fecha,
            @v_periodo OUTPUT;

        /* =============================
          2. VALIDAR FECHA
          ============================= */
        EXEC sp_fechas_val_fecha_x_mod
            @p_cia,
            @p_clase_modulo,
            -1,
            @p_fecha,
            1,
            @v_error OUTPUT,
            @v_deserror OUTPUT;

        IF @v_error <> 0 THROW 50001, @v_deserror, 1;

        /* =============================
          3. VALIDAR DOCUMENTO
          ============================= */
        EXEC sp_docto_validar
            @p_ind_adicion = -1,
            @p_cia = @p_cia,
            @p_id_co = @p_id_co,
            @p_id_tipo_docto = @p_id_tipo_docto,
            @p_numero_docto = @p_numero_docto,
            @p_fecha = @p_fecha,
            @p_rowid_tercero = @p_rowid_tercero,
            @p_periodo_docto = @p_periodo_docto,
            @p_clase_docto = @p_clase_docto,
            @p_rowid_usuario = @p_rowid_usuario,
            @p_periodo = @v_periodo OUTPUT,
            @p_ind_prefijo_docto = @v_ind_prefijo OUTPUT,
            @p_id_moneda_local = @v_id_moneda_local OUTPUT,
            @p_clase_ind_agrupa_movtos = @v_clase_agrupa OUTPUT,
            @p_clase_ind_sin_movtos = @v_clase_sin OUTPUT,
            @p_clase_modulo = @v_clase_modulo_out OUTPUT,
            @p_numero_docto_real = @v_num_real OUTPUT,
            @p_prefijo = @p_prefijo OUTPUT,
            @p_error = @v_error OUTPUT,
            @p_deserror = @v_deserror OUTPUT,
            @p_id_mandato = NULL,
            @p_ind_clase_aut = @v_ind_clase_aut OUTPUT,
            @p_seg_man_perm_dif_co = 1,
            @p_dec_total_local = @v_dec_total OUTPUT,
            @p_ind_importacion_remota = 0,
            @p_ind_docto_contable = @v_ind_contable OUTPUT,
            @p_rowid_docto_rp = NULL,
            @p_id_proyecto = NULL;

        IF @v_error <> 0 THROW 50002, @v_deserror, 1;

        /* =============================
          4. INSERTAR DOCUMENTO
          ============================= */
        EXEC sp_docto_insertar
            @id_cia = @p_cia,
            @id_co = @p_id_co,
            @id_tipo_docto = @p_id_tipo_docto,
            @consec_docto = @p_numero_docto,
            @prefijo = @p_prefijo,
            @fecha = @p_fecha,
            @periodo = @p_periodo_docto,
            @rowid_tercero = @p_rowid_tercero,
            @sucursal = N'',
            @total_db = 0,
            @total_cr = 0,
            @ind_origen = @p_clase_docto,
            @ind_estado = 0,
            @ind_transmit = 0,
            @fecha_creacion = @p_fecha,
            @fecha_actualiza = @p_fecha,
            @fecha_afectado = @p_fecha,
            @notas = @p_notas,
            @usuariocreacion = @p_usuario,
            @p_rowid = @v_rowid_docto OUTPUT,
            @p_rowid_docto_base = NULL,
            @p_timestamp = @v_timestamp OUTPUT,
            @p_referencia = N'',
            @p_id_mandato = NULL,
            @p_rowid_movto_entidad = NULL,
            @p_id_tipo_cambio = NULL,
            @p_tasa_conv = 0,
            @p_tasa_local = 0,
            @p_id_moneda_docto = NULL,
            @p_id_moneda_conv = NULL,
            @p_ind_forma_conv = 0,
            @p_id_moneda_local = NULL,
            @p_ind_forma_local = 0,
            @p_rowid_te_plantilla = NULL,
            @p_rowid_sesion = 365008,
            @p_ind_tipo_origen = 0,
            @p_rowid_docto_rp = NULL,
            @p_id_proyecto = NULL,
            @p_ind_dif_cambio_forma = 0,
            @p_ind_clase_origen = 0;

        /* =============================
          5. VALIDAR INGRESO CAJA
          ============================= */
        EXEC sp_ingre_caja_validar
            @p_id_cia = @p_cia,
            @p_rowid_docto = @v_rowid_docto,
            @p_id_co = @p_id_co,
            @p_id_tipo_docto = @p_id_tipo_docto,
            @p_consecutivo = @p_numero_docto,
            @p_fecha_elaboracion = @p_fecha,
            @p_fecha_recaudo = @p_fecha,
            @p_id_caja = @p_id_caja,
            @p_rowid_tercero = @p_rowid_tercero,
            @p_referencia = N'',
            @p_ind_valida_medPag = 1,
            @p_moneda_recaudo = @p_moneda,
            @p_moneda_aplicar = @p_moneda,
            @p_valor_recaudo = @p_valor,
            @p_valor_aplicar_real = @p_valor,
            @p_rowid_cobrador = @p_rowid_cobrador,
            @p_id_un = @p_id_un,
            @p_rowid_ccosto = NULL,
            @p_rowid_fe = @p_rowid_fe,
            @p_notas = @p_notas,
            @p_nro_error = @v_error OUTPUT,
            @p_desc_error = @v_deserror OUTPUT;

        IF @v_error <> 0 THROW 50003, @v_deserror, 1;

        /* =============================
          6. INSERTAR INGRESO CAJA
          ============================= */
        EXEC sp_ingre_caja_insertar
            @id_cia = @p_cia,
            @rowid_docto = @v_rowid_docto,
            @fecha_elaboracion = @p_fecha,
            @fecha_recaudo = @p_fecha,
            @rowid_cobrador = @p_rowid_cobrador,
            @moneda_rc = @p_moneda,
            @valor_rc = @p_valor,
            @moneda_aplicar = @p_moneda,
            @valor_conversion = @p_valor,
            @valor_aplicar_real = @p_valor,
            @rowid_fe = @p_rowid_fe,
            @rowid_ccosto = NULL,
            @id_un = @p_id_un,
            @id_co = @p_id_co,
            @id_caja = @p_id_caja,
            @notas = @p_notas,
            @p_referencia = N'',
            @p_id_sucursal_filtro = NULL,
            @p_rowid_auxiliar_filtro = NULL,
            @p_id_co_filtro = @p_id_co,
            @p_id_un_filtro = NULL,
            @p_ind_presenta_neg_filtro = 0,
            @p_id_tipo_docto_filtro = NULL,
            @p_fecha_ini_filtro = NULL,
            @p_fecha_fin_filtro = NULL,
            @p_num_ini_filtro = NULL,
            @p_num_fin_filtro = NULL,
            @p_ind_valida_medPag = 1,
            @p_rowid_tcro_filtro = NULL,
            @p_ind_orden_proc = 1;

        /* =============================
          7. VALIDAR MEDIO DE PAGO
          ============================= */
        EXEC sp_rel_med_pag_validar
            @p_cia = @p_cia,
            @p_id_medio_pago = @p_id_medio_pago,
            @p_id_cta_bancaria = @p_id_cta_bancaria,
            @p_rowid_auxiliar = 1,
            @p_id_co = @p_id_co,
            @p_id_caja = @p_id_caja,
            @p_rowid_usuario = @p_rowid_usuario,
            @p_tipo_medio = @v_tipo_medio OUTPUT,
            @p_rowid_aux_bancos = @v_rowid_aux_bancos OUTPUT,
            @p_id_auxiliar = @v_id_auxiliar OUTPUT,
            @p_id_moneda_auxiliar = @v_id_moneda_auxiliar OUTPUT,
            @p_error = @v_error OUTPUT,
            @p_rowid_docto = @v_rowid_docto,
            @p_fecha_cg_posf = @p_fecha,
            @p_ind_aux_orden = @v_ind_aux_orden OUTPUT,
            @p_valor = @p_valor,
            @p_vlr_impto_tarjeta = 0,
            @p_descripcion = @v_descripcion_mp OUTPUT;

        IF @v_error <> 0 THROW 50004, @v_deserror, 1;

        /* =============================
          8. INSERTAR MEDIO DE PAGO
          ============================= */
        EXEC sp_rel_med_pag_insertar
            @id_cia = @p_cia,
            @rowid_docto = @v_rowid_docto,
            @rowid_mov_docto = NULL,
            @rowid_auxiliar = @v_rowid_aux_bancos,
            @rowid_ccosto = NULL,
            @rowid_fe = @p_rowid_fe,
            @id_co = @p_id_co,
            @id_un = @p_id_un,
            @id_medios_pago = @p_id_medio_pago,
            @ind_estado = 0,
            @valor = @p_valor,
            @valor_alterna = 0,
            @id_banco = NULL,
            @nro_cheque = NULL,
            @nro_cuenta = NULL,
            @cod_seguridad = NULL,
            @nro_autorizacion = NULL,
            @fecha_vcto = NULL,
            @notas = N'',
            @id_cuentas_bancarias = @p_id_cta_bancaria,
            @fecha_consignacion = @p_fecha,
            @rowid_docto_consignacion = @v_rowid_docto,
            @rowid_mov_docto_consignacion = NULL,
            @id_causales_devolucion = NULL,
            @rowid_tercero = NULL,
            @id_sucursal = NULL,
            @p_id_caja = @p_id_caja,
            @p_id_moneda = @p_moneda,
            @p_ind_tipo_medio = @v_tipo_medio,
            @p_referencia_otros = @p_referencia_med,
            @p_valor_cr = 0,
            @p_valor_cr_alt = 0,
            @p_ind_cambio = 0,
            @p_NroAltDoctoBanco = N'',
            @p_rowid = @v_rowid_rel_mp OUTPUT,
            @p_ind_aux_orden = @v_ind_aux_orden,
            @p_id_cta_bancaria_cg = NULL,
            @p_referencia_cg = N'',
            @p_rowid_ccosto_cg = NULL,
            @p_fecha_cg_cg = NULL,
            @p_nro_docto_alterno_cg = N'',
            @p_ind_liquida_tarjeta = 0,
            @p_vlr_impto_tarjeta = 0,
            @p_vlr_impto_tarjeta_alt = 0,
            @p_fecha_elab_cheq_postf = NULL,
            @p_docto_banco = N'CG';


        --------------------------------------------------
    -- 112 MOVIMIENTO DB (CAJA / BANCO)
    --------------------------------------------------
    DECLARE 
        @mv_id_aux NVARCHAR(20)=N'11100522            ',
        @mv_id_ccosto NVARCHAR(15)=N'',
        @mv_id_fe NVARCHAR(10)=N'',
        @mv_id_ter NVARCHAR(15)=N'',
        @mv_err INT,
        @mv_desc NVARCHAR(40);

    EXEC sp_mov_docto_validar
        @p_ind_adicion=-1,@p_clase_docto=13,@p_cia=1,
        @p_rowid_auxiliar=2023,@p_id_co=@p_id_co,
        @p_id_un=@p_id_un,@p_rowid_tercero=NULL,
        @p_id_sucursal=NULL,@p_rowid_ccosto=NULL,
        @p_rowid_fe=3,@p_rowid_usuario=@p_rowid_usuario,
        @p_periodo=@p_periodo_docto,
        @p_id_auxiliar=@mv_id_aux OUTPUT,
        @p_id_ccosto=@mv_id_ccosto OUTPUT,
        @p_id_fe=@mv_id_fe OUTPUT,
        @p_id_tercero=@mv_id_ter OUTPUT,
        @p_error=@mv_err OUTPUT,
        @p_rowid_rubro=NULL,
        @p_desc_clase_docto=@mv_desc OUTPUT;

    IF @mv_err <> 0 THROW 50010,'Error mov débito',1;

    DECLARE @rowid_mov_db INT;

    EXEC sp_mov_docto_insertar
        @id_cia=1,@rowid_docto=@v_rowid_docto,@id_un=@p_id_un,
        @rowid_auxiliar=2023,@rowid_tercero=NULL,
        @sucursal=NULL,@rowid_ccosto=NULL,@rowid_fe=3,
        @id_co_mov=@p_id_co,@fecha=@p_fecha,@periodo=@p_periodo_docto,
        @ind_estado=0,@valor_db=@p_valor,@valor_cr=0,
        @valor_db_alt=0,@valor_cr_alt=0,@base_gravable=0,
        @docto_banco=N'CG',@nro_docto_banco=@p_referencia_med,
        @ind_mov_sa=0,@ind_mov_diferido=0,@notas=@p_notas,
        @RowId=@rowid_mov_db OUTPUT,
        @IndAutomatico=1,@ind_mov_caja=0,
        @p_rowid_sesion=365008;

      --------------------------------------------------
    -- MOVIMIENTO FE (DESPUÉS DEL DÉBITO)
    --------------------------------------------------
    DECLARE @v_rowid_movto_fe INT;

    EXEC sp_movto_fe_insertar
        @p_rowid = @v_rowid_movto_fe OUTPUT,
        @p_ts = '1753-01-01 00:00:00',
        @p_id_cia = @p_cia,
        @p_rowid_movto = @rowid_mov_db,   -- ?? ESTE ES EL ROWID DEL MOV DB
        @p_rowid_fe = @p_rowid_fe,        -- FE = 3
        @p_fecha = @p_fecha,
        @p_id_periodo = @p_periodo_docto,
        @p_valor_db = @p_valor,
        @p_valor_cr = 0,
        @p_valor_db_alt = 0,
        @p_valor_cr_alt = 0,
        @p_valor_db2 = @p_valor,
        @p_valor_cr2 = 0,
        @p_valor_db_alt2 = 0,
        @p_valor_cr_alt2 = 0,
        @p_valor_db3 = @p_valor,
        @p_valor_cr3 = 0,
        @p_valor_db_alt3 = 0,
        @p_valor_cr_alt3 = 0; 

    --------------------------------------------------
    -- 127 MOVIMIENTO CR (TERCERO)
    --------------------------------------------------
    DECLARE 
        @mv2_id_aux NVARCHAR(20)=N'13050501            ',
        @mv2_id_ter NVARCHAR(15)=N'802012745      ',
        @mv2_err INT,@mv2_desc NVARCHAR(40);

    EXEC sp_mov_docto_validar
        @p_ind_adicion=-1,@p_clase_docto=13,@p_cia=1,
        @p_rowid_auxiliar=9,@p_id_co=@p_id_co,
        @p_id_un=@p_id_un,@p_rowid_tercero=@p_rowid_tercero,
        @p_id_sucursal=N'001',@p_rowid_ccosto=NULL,
        @p_rowid_fe=NULL,@p_rowid_usuario=@p_rowid_usuario,
        @p_periodo=@p_periodo_docto,
        @p_id_auxiliar=@mv2_id_aux OUTPUT,
        @p_id_ccosto=NULL,@p_id_fe=NULL,
        @p_id_tercero=@mv2_id_ter OUTPUT,
        @p_error=@mv2_err OUTPUT,
        @p_rowid_rubro=NULL,
        @p_desc_clase_docto=@mv2_desc OUTPUT;

    IF @mv2_err <> 0 THROW 50011,'Error mov crédito',1;

    DECLARE @rowid_mov_cr INT;

    EXEC sp_mov_docto_insertar
        @id_cia=1,@rowid_docto=@v_rowid_docto,@id_un=@p_id_un,
        @rowid_auxiliar=9,@rowid_tercero=@p_rowid_tercero,
        @sucursal=N'001',@rowid_ccosto=NULL,@rowid_fe=NULL,
        @id_co_mov=@p_id_co,@fecha=@p_fecha,@periodo=@p_periodo_docto,
        @ind_estado=0,@valor_db=0,@valor_cr=@p_valor,
        @valor_db_alt=0,@valor_cr_alt=0,@base_gravable=0,
        @docto_banco=N'',@nro_docto_banco=0,
        @ind_mov_sa=1,@ind_mov_diferido=0,@notas=@p_notas,
        @RowId=@rowid_mov_cr OUTPUT,
        @IndAutomatico=1,@ind_mov_caja=0,
        @p_rowid_sesion=365008;

      __SA_BLOCKS__


      EXEC sp_rel_med_pag_actual_movto
        @rowid_docto           = @v_rowid_docto,     -- docto contable
        @rowid_mov_docto       = @rowid_mov_db,      -- ?? movimiento DB (caja/banco)
        @id_medios_pago        = @p_id_medio_pago,   -- CG1
        @p_desde_ctl_recaudo   = 0,
        @p_rowid_rel_med_pago  = @v_rowid_rel_mp;    -- rel_med_pag_insertar


	/* =============================
		9. ACTUALIZAR ESTADO DOCTO
    ============================= */
        EXEC sp_docto_actualizar_estado
            @p_rowid_docto = @v_rowid_docto,
            @p_estado = 1,
            @p_usuario = @p_usuario,
            @p_error = @v_error OUTPUT,
            @p_des_error = @v_deserror OUTPUT,
            @p_id_motivo_otros = NULL,
            @p_id_cia = @v_id_cia_out OUTPUT,
            @p_id_co = @v_id_co_out OUTPUT,
            @p_id_tipo_docto = @v_id_tipo_docto_out OUTPUT,
            @p_numero_docto = @v_numero_docto_out OUTPUT,
            @p_ind_cfdi = @v_ind_cfdi_out OUTPUT;

        IF @v_error <> 0 THROW 50005, @v_deserror, 1;

		-----------------------------------PROCESO DE REVERSAR Y BORRAR------------------------------------------------------

		EXEC sp_docto_reversar_y_borrar @rowid = @v_rowid_docto, @borrarencabezado = 0








----------------------------------------------------PROCESO DE APROVAR-------------------------------------

DECLARE 
    @v_error_mp INT,
    @v_desc_mp NVARCHAR(40);
DECLARE @v_fecha_actualiza DATETIME = GETDATE();



---------------------------Modificar documento----------------------------------
EXEC sp_docto_modificar
    @rowid = @v_rowid_docto,
    @rowid_tercero = @p_rowid_tercero,
    @fecha_actualiza = @v_fecha_actualiza OUTPUT,
    @notas = @p_notas,
    @usuarioactualiza = @p_usuario,
    @p_id_sucursal = NULL,
    @p_fecha = @p_fecha,
    @p_referencia = N'',
    @p_id_mandato = NULL,
    @p_rowid_movto_entidad = NULL,
    @p_id_tipo_cambio = NULL,
    @p_tasa_conv = 0,
    @p_tasa_local = 0,
    @p_id_moneda_docto = NULL,
    @p_id_moneda_conv = NULL,
    @p_ind_forma_conv = 0,
    @p_id_moneda_local = NULL,
    @p_ind_forma_local = 0,
    @p_rowid_te_plantilla = NULL,
    @p_rowid_docto_rp = NULL,
    @p_id_proyecto = NULL;


	----------Modificar ingreso de caja-----------------------
EXEC sp_ingre_caja_mod
    @id_cia = @p_cia,
    @rowid_docto = @v_rowid_docto,
    @fecha_elaboracion = @p_fecha,
    @fecha_recaudo = @p_fecha,
    @rowid_cobrador = @p_rowid_cobrador,
    @moneda_rc = @p_moneda,
    @valor_rc = @p_valor,
    @moneda_aplicar = @p_moneda,
    @valor_conversion = @p_valor,
    @valor_aplicar_real = @p_valor,
    @rowid_fe = @p_rowid_fe,
    @rowid_ccosto = NULL,
    @id_un = @p_id_un,
    @id_co = @p_id_co,
    @id_caja = @p_id_caja,
    @notas = @p_notas,
    @rowidtercero = @p_rowid_tercero,
    @p_referencia = N'',
    @p_id_sucursal_filtro = NULL,
    @p_rowid_auxiliar_filtro = NULL,
    @p_id_co_filtro = @p_id_co,
    @p_id_un_filtro = NULL,
    @p_ind_presenta_neg_filtro = 0,
    @p_id_tipo_docto_filtro = NULL,
    @p_fecha_ini_filtro = NULL,
    @p_fecha_fin_filtro = NULL,
    @p_num_ini_filtro = NULL,
    @p_num_fin_filtro = NULL,
    @p_ind_valida_medPag = 1,
    @p_rowid_tcro_filtro = NULL,
    @p_ind_orden_proc = 1;


--------------------Borrar medios de pago-------------------------------

DECLARE @v_err_borrar INT, @v_desc_borrar NVARCHAR(100);

EXEC sp_ingre_caja_borrar_medios
    @rowidIngreso = @v_rowid_docto,
    @p_error = @v_err_borrar OUTPUT,
    @p_des_error = @v_desc_borrar OUTPUT;

IF @v_err_borrar <> 0
    THROW 70001, @v_desc_borrar, 1;




----------------------Revalidar medio de pago--------------------------------

EXEC sp_rel_med_pag_validar
    @p_cia = @p_cia,
    @p_id_medio_pago = @p_id_medio_pago,
    @p_id_cta_bancaria = @p_id_cta_bancaria,
    @p_rowid_auxiliar = 1,
    @p_id_co = @p_id_co,
    @p_id_caja = @p_id_caja,
    @p_rowid_usuario = @p_rowid_usuario,
    @p_tipo_medio = @v_tipo_medio OUTPUT,
    @p_rowid_aux_bancos = @v_rowid_aux_bancos OUTPUT,
    @p_id_auxiliar = @v_id_auxiliar OUTPUT,
    @p_id_moneda_auxiliar = @v_id_moneda_auxiliar OUTPUT,
    @p_error = @v_error_mp OUTPUT,
    @p_rowid_docto = @v_rowid_docto,
    @p_fecha_cg_posf = @p_fecha,
    @p_ind_aux_orden = @v_ind_aux_orden OUTPUT,
    @p_valor = @p_valor,
    @p_vlr_impto_tarjeta = 0,
    @p_descripcion = @v_desc_mp OUTPUT;

IF @v_error_mp <> 0
    THROW 70002, 'Error validando medio de pago', 1;




-----------INSERTAR MEDIO DE PAGO----------------------------

EXEC sp_rel_med_pag_insertar
    @id_cia = @p_cia,
    @rowid_docto = @v_rowid_docto,
    @rowid_mov_docto = NULL,
    @rowid_auxiliar = @v_rowid_aux_bancos,
    @rowid_ccosto = NULL,
    @rowid_fe = @p_rowid_fe,
    @id_co = @p_id_co,
    @id_un = @p_id_un,
    @id_medios_pago = @p_id_medio_pago,
    @ind_estado = 0,
    @valor = @p_valor,
    @valor_alterna = 0,
    @id_banco = NULL,
    @nro_cheque = NULL,
    @nro_cuenta = NULL,
    @cod_seguridad = NULL,
    @nro_autorizacion = NULL,
    @fecha_vcto = NULL,
    @notas = N'',
    @id_cuentas_bancarias = @p_id_cta_bancaria,
    @fecha_consignacion = @p_fecha,
    @rowid_docto_consignacion = @v_rowid_docto,
    @rowid_mov_docto_consignacion = NULL,
    @id_causales_devolucion = NULL,
    @rowid_tercero = NULL,
    @id_sucursal = NULL,
    @p_id_caja = @p_id_caja,
    @p_id_moneda = @p_moneda,
    @p_ind_tipo_medio = @v_tipo_medio,
    @p_referencia_otros = @p_referencia_med,
    @p_valor_cr = 0,
    @p_valor_cr_alt = 0,
    @p_ind_cambio = 0,
    @p_NroAltDoctoBanco = N'',
    @p_rowid = @v_rowid_rel_mp OUTPUT,
    @p_ind_aux_orden = @v_ind_aux_orden,
    @p_id_cta_bancaria_cg = NULL,
    @p_referencia_cg = N'',
    @p_rowid_ccosto_cg = NULL,
    @p_fecha_cg_cg = NULL,
    @p_nro_docto_alterno_cg = N'',
    @p_ind_liquida_tarjeta = 0,
    @p_vlr_impto_tarjeta = 0,
    @p_vlr_impto_tarjeta_alt = 0,
    @p_fecha_elab_cheq_postf = NULL,
    @p_docto_banco = N'CG';



	-------------------LIMPIAR RETENCIONES / ELIMINAR PREVIAS----------------------------
	EXEC sp_ingre_caja_ret_eli
    @p_rowid_docto = @v_rowid_docto;


	----------------------MOVIMIENTO DÉBITO (CAJA / BANCO)----------------------------

	DECLARE @v_rowid_mov_db INT;

EXEC sp_mov_docto_insertar
    @id_cia = @p_cia,
    @rowid_docto = @v_rowid_docto,
    @id_un = @p_id_un,
    @rowid_auxiliar = @v_rowid_aux_bancos,
    @rowid_tercero = NULL,
    @sucursal = NULL,
    @rowid_ccosto = NULL,
    @rowid_fe = @p_rowid_fe,
    @id_co_mov = @p_id_co,
    @fecha = @p_fecha,
    @periodo = @p_periodo_docto,
    @ind_estado = 0,
    @valor_db = @p_valor,
    @valor_cr = 0,
    @valor_db_alt = 0,
    @valor_cr_alt = 0,
    @base_gravable = 0,
    @docto_banco = N'CG',
    @nro_docto_banco = @p_referencia_med,
    @ind_mov_sa = 0,
    @ind_mov_diferido = 0,
    @notas = @p_notas,
    @RowId = @v_rowid_mov_db OUTPUT,
    @IndAutomatico = 1,
    @ind_mov_caja = 0,
    @p_rowid_sesion = 365008;




	-------------------MOVIMIENTO FE (DEL DÉBITO)------------------------
	DECLARE @v_rowid_mov_fe INT;

	EXEC sp_movto_fe_insertar
		@p_rowid = @v_rowid_mov_fe OUTPUT,
		@p_ts = '1753-01-01',
		@p_id_cia = @p_cia,
		@p_rowid_movto = @v_rowid_mov_db,
		@p_rowid_fe = @p_rowid_fe,
		@p_fecha = @p_fecha,
		@p_id_periodo = @p_periodo_docto,
		@p_valor_db = @p_valor,
		@p_valor_cr = 0,
		@p_valor_db_alt = 0,
		@p_valor_cr_alt = 0,
		@p_valor_db2 = @p_valor,
		@p_valor_cr2 = 0,
		@p_valor_db_alt2 = 0,
		@p_valor_cr_alt2 = 0,
		@p_valor_db3 = @p_valor,
		@p_valor_cr3 = 0,
		@p_valor_db_alt3 = 0,
		@p_valor_cr_alt3 = 0;


		------------------MOVIMIENTO CRÉDITO (TERCERO)-----------------------

		DECLARE @v_rowid_mov_cr INT;

		EXEC sp_mov_docto_insertar
			@id_cia = @p_cia,
			@rowid_docto = @v_rowid_docto,
			@id_un = @p_id_un,
			@rowid_auxiliar = 9,
			@rowid_tercero = @p_rowid_tercero,
			@sucursal = @p_id_co,
			@rowid_ccosto = NULL,
			@rowid_fe = NULL,
			@id_co_mov = @p_id_co,
			@fecha = @p_fecha,
			@periodo = @p_periodo_docto,
			@ind_estado = 0,
			@valor_db = 0,
			@valor_cr = @p_valor,
			@valor_db_alt = 0,
			@valor_cr_alt = 0,
			@base_gravable = 0,
			@docto_banco = N'',
			@nro_docto_banco = 0,
			@ind_mov_sa = 1,
			@ind_mov_diferido = 0,
			@notas = @p_notas,
			@RowId = @v_rowid_mov_cr OUTPUT,
			@IndAutomatico = 1,
			@ind_mov_caja = 0,
			@p_rowid_sesion = 365008;



-------------------CANCELAR SALDO ABIERTO-----------------------

DECLARE @v_err_sa INT, @v_desc_sa NVARCHAR(255);

EXEC sp_sa_cancelar
    @rowidsa = @p_rowid_sa,
    @fecha = @p_fecha,
    @total_db = 0,
    @total_cr = 0,
    @total_db_alt = 0,
    @total_cr_alt = 0,
    @total_db_pendientes = 0,
    @total_cr_pendientes = @p_valor,
    @total_db_alt_pendientes = 0,
    @total_cr_alt_pendientes = 0,
    @chequesposfechados = 0,
    @p_total_db2_pendientes = 0,
    @p_total_cr2_pendientes = @p_valor,
    @p_total_db2_alt_pendientes = 0,
    @p_total_cr2_alt_pendientes = 0,
    @p_rowid_docto_contable = @v_rowid_docto,
    @p_error = @v_err_sa OUTPUT,
    @p_desc_error = @v_desc_sa OUTPUT;

IF @v_err_sa <> 0
    THROW 80001, @v_desc_sa, 1;




	-----------------------------Aplicar saldo abierto--------------------------------------------
	EXEC sp_mov_saldo_abierto_insertar
    @id_cia = @p_cia,
    @rowid_mov_docto = @v_rowid_mov_cr,
    @rowid_docto = @v_rowid_docto,
    @rowid_sa = @p_rowid_sa,
    @fecha = @p_fecha,
    @ind_estado = 0,
    @valor_db = 0,
    @valor_cr = @p_valor,
    @valor_db_alt = 0,
    @valor_cr_alt = 0,
    @rowid_vend = @p_rowid_cobrador,
    @id_sucursal = @p_id_co,
    @prefijo_cruce = NULL,
    @id_tipo_docto_cruce = N'BQE',
    @consec_docto_cruce = 26024,
    @nro_cuota_cruce = 0,
    @notas = @p_notas,
    @valor_aplicado_pp = 0,
    @valor_aplicado_pp_alt = 0,
    @valor_aprovecha = 0,
    @valor_aprovecha_alt = 0,
    @valor_retenciones = 0,
    @valor_retenciones_alt = 0,
    @p_rowid_pe_prov_cuenta = NULL,
    @p_valor_db2 = 0,
    @p_valor_cr2 = @p_valor,
    @p_valor_db2_alt = 0,
    @p_valor_cr2_alt = 0;


	-----------------------Recalcular totales DB / CR del documento-------------------------------
	DECLARE @v_err_dbs INT, @v_desc_dbs NVARCHAR(500);

EXEC sp_docto_actualizar_dbscrs
    @rowid = @v_rowid_docto,
    @valordb = 0,
    @valorcr = 0,
    @basegravable = 0,
    @p_total_rx = 0,
    @p_valor_db2 = 0,
    @p_valor_cr2 = 0,
    @p_base_gravable2 = 0,
    @p_valor_db3 = 0,
    @p_valor_cr3 = 0,
    @p_base_gravable3 = 0,
    @p_s_nro_error = @v_err_dbs OUTPUT,
    @p_s_desc_error = @v_desc_dbs OUTPUT;

IF @v_err_dbs <> 0
    THROW 90010, @v_desc_dbs, 1;




	-----------------------Amarrar medio de pago con movimiento DB--------------------------
	EXEC sp_rel_med_pag_actual_movto
    @rowid_docto = @v_rowid_docto,
    @rowid_mov_docto = @v_rowid_mov_db,
    @id_medios_pago = @p_id_medio_pago,
    @p_desde_ctl_recaudo = 0,
    @p_rowid_rel_med_pago = @v_rowid_rel_mp;


	------------------------Validar Unidad de Negocio-----------------------------------

	DECLARE @v_desc_un NVARCHAR(40), @v_err_un SMALLINT;

EXEC sp_un_validar
    @p_cia = @p_cia,
    @p_id_un = @p_id_un,
    @p_por_estado = -1,
    @p_ind_estado = 1,
    @p_por_seguridad_x_maestro = -1,
    @p_rowid_usuario = @p_rowid_usuario,
    @p_des_un = @v_desc_un OUTPUT,
    @p_error = @v_err_un OUTPUT;

IF @v_err_un <> 0
    THROW 90020, 'Unidad de negocio inválida', 1;


	-----------------------Validar control granulado----------------------------------
	DECLARE @v_ind_granulado SMALLINT;

EXEC sp_validar_control_granulado
    @p_id_cia = @p_cia,
    @p_id_clase_docto = @p_clase_docto,
    @p_rowid_docto = @v_rowid_docto,
    @p_ind_existe = @v_ind_granulado OUTPUT;



	---------------------------Aprobar ingreso de caja--------------------------------------
	DECLARE @v_err_aprobar INT, @v_desc_aprobar NVARCHAR(255);

EXEC sp_ingre_caja_validar_aprobar
    @p_rowid_docto = @v_rowid_docto,
    @p_error = @v_err_aprobar OUTPUT,
    @p_deserror = @v_desc_aprobar OUTPUT;

IF @v_err_aprobar <> 0
    THROW 90030, @v_desc_aprobar, 1;



	-----------------Deducir estado final del documento------------------------------
	DECLARE 
    @v_ded_ret SMALLINT,
    @v_err_estado INT,
    @v_desc_estado NVARCHAR(200);

EXEC sp_docto_deducir_estado
    @rowid = @v_rowid_docto,
    @p_leer_movtos_gastos = -1,
    @p_ded_ret_pago = @v_ded_ret OUTPUT,
    @p_error = @v_err_estado OUTPUT,
    @p_cadena_error = @v_desc_estado OUTPUT;

IF @v_err_estado <> 0
    THROW 90040, @v_desc_estado, 1;



	----------------Generar impuestos en el pago-----------------

	DECLARE @v_err_imp INT, @v_desc_imp NVARCHAR(255);

EXEC sp_generico_imp_en_pago
    @p_rowid_docto = @v_rowid_docto,
    @p_error = @v_err_imp OUTPUT,
    @p_des_error = @v_desc_imp OUTPUT;

IF @v_err_imp <> 0
    THROW 91010, @v_desc_imp, 1;


	----------------------Actualizar estado del documento (APROBADO)----------------------------


	DECLARE
    @v_err_est INT,
    @v_desc_est NVARCHAR(255),
    @v_id_cia SMALLINT,
    @v_id_co NVARCHAR(3),
    @v_id_tipo_docto NVARCHAR(3),
    @v_num_docto INT,
    @v_ind_cfdi SMALLINT;

EXEC sp_docto_actualizar_estado
    @p_rowid_docto = @v_rowid_docto,
    @p_estado = 1,
    @p_usuario = @p_usuario,
    @p_error = @v_err_est OUTPUT,
    @p_des_error = @v_desc_est OUTPUT,
    @p_id_motivo_otros = NULL,
    @p_id_cia = @v_id_cia OUTPUT,
    @p_id_co = @v_id_co OUTPUT,
    @p_id_tipo_docto = @v_id_tipo_docto OUTPUT,
    @p_numero_docto = @v_num_docto OUTPUT,
    @p_ind_cfdi = @v_ind_cfdi OUTPUT;

IF @v_err_est <> 0
    THROW 91020, @v_desc_est, 1;



	----------------Validar entidad dinámica--------------------------
	DECLARE
    @v_err_ent INT,
    @v_desc_ent NVARCHAR(255),
    @v_tipo_docto_ent NVARCHAR(3),
    @v_grupo_ent NVARCHAR(30);

EXEC sp_docto_val_ent_din
    @p_error = @v_err_ent OUTPUT,
    @p_cadena_error = @v_desc_ent OUTPUT,
    @p_id_tipo_docto = @v_tipo_docto_ent OUTPUT,
    @p_id_grupo_entidad = @v_grupo_ent OUTPUT,
    @p_rowid_docto = @v_rowid_docto,
    @p_id_tipo_entidad = N'';

IF @v_err_ent <> 0
    THROW 91030, @v_desc_ent, 1;



	----------------------Generar movimientos intercompañía---------------------------


	DECLARE @v_err_cia INT, @v_desc_cia NVARCHAR(255);

EXEC sp_genera_movto_cias
    @p_rowid_docto = @v_rowid_docto,
    @p_error = @v_err_cia OUTPUT,
    @p_cadena_error = @v_desc_cia OUTPUT;

IF @v_err_cia <> 0
    THROW 91040, @v_desc_cia, 1;

	-----------------------Disparar facturación----------------------------
	DECLARE @v_err_fact INT, @v_desc_fact NVARCHAR(255);

EXEC sp_inst_fn_docto_gen_facturar
    @p_rowid_docto_base = @v_rowid_docto,
    @p_error = @v_err_fact OUTPUT,
    @p_error_cadena = @v_desc_fact OUTPUT;

IF @v_err_fact <> 0
    THROW 91050, @v_desc_fact, 1;



	--------------------------Generar documento de percepción----------------------------

	EXEC sp_genera_docto_percepcion
    @p_rowid_docto = @v_rowid_docto;



	-----------------------Limpieza final de retenciones----------------------------

	EXEC sp_ingre_caja_ret_eli
    @p_rowid_docto = @v_rowid_docto;








/*
      DECLARE 
        @v_err_aprobar INT,
        @v_desc_err_aprobar NVARCHAR(255);

      EXEC sp_ingre_caja_validar_aprobar
        @p_rowid_docto = @v_rowid_docto,   -- ?? documento contable
        @p_error       = @v_err_aprobar OUTPUT,
        @p_deserror    = @v_desc_err_aprobar OUTPUT;


      IF @v_err_aprobar IS NOT NULL AND @v_err_aprobar <> 0
        THROW 60040, @v_desc_err_aprobar, 1;*/






        COMMIT;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SELECT ERROR_NUMBER() AS error, ERROR_MESSAGE() AS descripcion;
    END CATCH;


`;
  
  try {
    const saBlockTemplate = `
      --------------------------------------------------
    -- CANCELACIÓN SALDO ABIERTO (DESPUÉS DEL CRÉDITO)
    --------------------------------------------------
    DECLARE 
        @v_error_sa INT,
        @v_desc_error_sa NVARCHAR(255);

    EXEC sp_sa_cancelar
        @rowidsa = __ROWID_SA__,                 -- ID de saldo abierto
        @fecha = @p_fecha,
        @total_db = 0,
        @total_cr = 0,
        @total_db_alt = 0,
        @total_cr_alt = 0,
        @total_db_pendientes = 0,
        @total_cr_pendientes = @p_valor,
        @total_db_alt_pendientes = 0,
        @total_cr_alt_pendientes = 0,
        @chequesposfechados = 0,
        @p_total_db2_pendientes = 0,
        @p_total_cr2_pendientes = @p_valor,
        @p_total_db2_alt_pendientes = 0,
        @p_total_cr2_alt_pendientes = 0,
        @p_rowid_docto_contable = @v_rowid_docto,
        @p_error = @v_error_sa OUTPUT,
        @p_desc_error = @v_desc_error_sa OUTPUT;

    IF @v_error_sa <> 0 
        THROW 60020, @v_desc_error_sa, 1;


      --------------------------------------------------
    -- MOVIMIENTO SALDO ABIERTO (DESPUÉS DE sp_sa_cancelar)
    --------------------------------------------------
    
    EXEC sp_mov_saldo_abierto_insertar
        @id_cia = @p_cia,
        @rowid_mov_docto = @rowid_mov_cr,       -- MOVIMIENTO CR
        @rowid_docto = @v_rowid_docto,          
        @rowid_sa = __ROWID_SA__,               
        @fecha = @p_fecha,
        @ind_estado = 0,
        @valor_db = 0,
        @valor_cr = @p_valor,
        @valor_db_alt = 0,
        @valor_cr_alt = 0,
        @rowid_vend = @p_rowid_cobrador,        
        @id_sucursal = N'001',
        @prefijo_cruce = NULL,
        @id_tipo_docto_cruce = N'BQE',
        @consec_docto_cruce = 26024,
        @nro_cuota_cruce = 0,
        @notas = @p_notas,
        @valor_aplicado_pp = 0,
        @valor_aplicado_pp_alt = 0,
        @valor_aprovecha = 0,
        @valor_aprovecha_alt = 0,
        @valor_retenciones = 0,
        @valor_retenciones_alt = 0,
        @p_rowid_pe_prov_cuenta = NULL,
        @p_valor_db2 = 0,
        @p_valor_cr2 = @p_valor,
        @p_valor_db2_alt = 0,
        @p_valor_cr2_alt = 0;
`;

    const dynamicBlocks = rowidSaList
      .map(rowidSa => saBlockTemplate.replace(/__ROWID_SA__/g, String(rowidSa)))
      .join('\n');

    const sqlScript = baseSqlScript.replace('__SA_BLOCKS__', dynamicBlocks);

    console.log('🔄 Ejecutando script SQL para procesar recibo de caja con múltiples saldos abiertos...');
    const request = pool.request();
    request.timeout = 180000; // 3 minutos para scripts complejos

    const result = await request.query(sqlScript);
    
    console.log('✅ Script SQL ejecutado exitosamente');
    
    return {
      success: true,
      message: 'Recibo de caja procesado exitosamente',
      data: result.recordset || []
    };
    
  } catch (error) {
    console.error('❌ Error ejecutando script SQL:', error);
    throw error;
  }
}

module.exports = {
  procesarReciboCaja,
  leerProximoConsecutivoRC
};
