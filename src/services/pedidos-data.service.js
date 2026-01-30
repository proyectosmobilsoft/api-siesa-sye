const { getPool } = require('../db/db');
const sql = require('mssql');

/**
 * Servicio para obtener datos completos de pedidos
 * Ejecuta 3 SPs en secuencia para obtener toda la información
 */
class PedidosDataService {
    /**
     * Obtener lista de pedidos en un rango de fechas
     * @param {Date} fechaInicial 
     * @param {Date} fechaFinal 
     * @returns {Promise<Array>} Lista de pedidos con f_rowid
     */
    static async getPedidosList(fechaInicial, fechaFinal) {
        const pool = await getPool();
        const request = pool.request();
        request.timeout = 120000; // 2 minutos

        request.input('fechaInicial', sql.DateTime, fechaInicial);
        request.input('fechaFinal', sql.DateTime, fechaFinal);

        const query = `
      EXEC sp_pv_cons_pedido 
        @p_cia = 1,
        @p_co = N'',
        @p_tipo_docto = N'',
        @p_usuario = N'',
        @p_ind_usuario = 1,
        @p_rowid_vend = 0,
        @p_rowid_fact = 0,
        @p_rowid_rem = 0,
        @p_clase_docto = 0,
        @p_fec_inicial = @fechaInicial,
        @p_fec_final = @fechaFinal,
        @p_ind_fecha = 7,
        @p_num_inicial = 0,
        @p_num_final = 0,
        @p_ind_numero = 0,
        @p_ind_estado = 0,
        @p_ind_impresos = 0,
        @p_ind_transmitidos = 0,
        @p_ind_valorar_con = 1,
        @p_cons_tipo = 10092,
        @p_cons_nombre = N'<Predeterminado>',
        @p_rowid_usuario = 1133
    `;

        const result = await request.query(query);
        return result.recordset || [];
    }

    /**
     * Obtener detalles básicos de un pedido
     * @param {number} rowid - f_rowid del pedido
     * @returns {Promise<Object>} Detalles básicos (Rowid, Fecha, C.O., Tipo_Docto, Número, Estado)
     */
    static async getPedidoBasicDetails(rowid) {
        const pool = await getPool();
        const request = pool.request();
        request.timeout = 30000;

        request.input('rowid_docto', sql.Int, rowid);

        const query = `
      EXEC sp_pv_leer_bsq_esp 
        @p_cia = 1,
        @p_idco = NULL,
        @p_estado = -1,
        @p_idtipodoc = NULL,
        @p_numero = 0,
        @p_clasedocto = NULL,
        @p_rowid_docto = @rowid_docto,
        @p_rowid_usuario = 1133
    `;

        const result = await request.query(query);
        return result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;
    }

    /**
     * Obtener detalles completos de un pedido
     * @param {number} numero - Número del pedido
     * @param {number} rowid - Rowid del pedido
     * @returns {Promise<Object>} Detalles completos del pedido
     */
    static async getPedidoFullDetails(numero, rowid) {
        const pool = await getPool();
        const request = pool.request();
        request.timeout = 30000;

        // Parámetros de salida
        request.output('p_rowiddocto', sql.Int);
        request.output('p_leer_movtos', sql.SmallInt);
        request.output('p_total_cant_pedida', sql.Float);
        request.output('p_total_cant_pendiente', sql.Float);
        request.output('p_total_vlr_bruto', sql.Money);
        request.output('p_total_vlr_dsctos', sql.Money);
        request.output('p_total_vlr_imp', sql.Money);
        request.output('p_total_vlr_neto', sql.Money);
        request.output('p_total_vlr_subtotal', sql.Money);
        request.output('p_tiene_movtos_docto', sql.SmallInt);
        request.output('p_total_peso', sql.Money);
        request.output('p_total_volumen', sql.Money);
        request.output('p_total_margen', sql.Float);
        request.output('p_total_vlr_dscto_global', sql.Money);

        // Parámetros de entrada
        request.input('p_numero', sql.Int, numero);
        request.input('p_rowiddocto_input', sql.Int, rowid);

        const query = `
      EXEC sp_pv_leer_busq 
        @p_cia = 1,
        @p_idco = N'',
        @p_idtipo = N'',
        @p_numero = @p_numero,
        @p_rowiddocto = @p_rowiddocto_input,
        @p_leer_movtos = @p_leer_movtos OUTPUT,
        @p_total_cant_pedida = @p_total_cant_pedida OUTPUT,
        @p_total_cant_pendiente = @p_total_cant_pendiente OUTPUT,
        @p_total_vlr_bruto = @p_total_vlr_bruto OUTPUT,
        @p_total_vlr_dsctos = @p_total_vlr_dsctos OUTPUT,
        @p_total_vlr_imp = @p_total_vlr_imp OUTPUT,
        @p_total_vlr_neto = @p_total_vlr_neto OUTPUT,
        @p_total_vlr_subtotal = @p_total_vlr_subtotal OUTPUT,
        @p_tiene_movtos_docto = @p_tiene_movtos_docto OUTPUT,
        @p_total_peso = @p_total_peso OUTPUT,
        @p_total_volumen = @p_total_volumen OUTPUT,
        @p_total_margen = @p_total_margen OUTPUT,
        @p_total_vlr_dscto_global = @p_total_vlr_dscto_global OUTPUT
    `;

        const result = await request.query(query);

        // Retornar tanto el recordset como los parámetros de salida
        return {
            data: result.recordset && result.recordset.length > 0 ? result.recordset[0] : null,
            outputs: result.output
        };
    }

    /**
     * Obtener datos completos de un pedido ejecutando los 3 SPs
     * @param {number} rowid - f_rowid del pedido
     * @returns {Promise<Object>} Objeto con todos los datos del pedido
     */
    static async getPedidoCompleto(rowid) {
        try {
            console.log(`📋 Obteniendo detalles del pedido rowid: ${rowid}`);

            // Paso 1: Obtener detalles básicos
            const basicDetails = await this.getPedidoBasicDetails(rowid);

            if (!basicDetails) {
                console.warn(`⚠️  No se encontraron detalles básicos para rowid: ${rowid}`);
                return null;
            }

            console.log(`✅ Detalles básicos obtenidos - Número: ${basicDetails.Número}`);

            // Paso 2: Obtener detalles completos
            const fullDetails = await this.getPedidoFullDetails(basicDetails.Número, rowid);

            if (!fullDetails.data) {
                console.warn(`⚠️  No se encontraron detalles completos para pedido: ${basicDetails.Número}`);
                return null;
            }

            console.log(`✅ Detalles completos obtenidos`);

            // Combinar toda la información
            return {
                rowid: rowid,
                numero: basicDetails.Número,
                fecha: basicDetails.Fecha,
                co: basicDetails['C.O.'],
                tipo_docto: basicDetails.Tipo_Docto,
                estado: basicDetails.Estado,
                ...fullDetails.data,
                totales: fullDetails.outputs
            };

        } catch (error) {
            console.error(`❌ Error obteniendo pedido completo (rowid: ${rowid}):`, error.message);
            throw error;
        }
    }

    /**
     * Obtener todos los pedidos completos en un rango de fechas
     * @param {Date} fechaInicial 
     * @param {Date} fechaFinal 
     * @returns {Promise<Array>} Array de pedidos completos
     */
    static async getPedidosCompletos(fechaInicial, fechaFinal) {
        try {
            console.log(`🔍 Buscando pedidos desde ${fechaInicial.toISOString()} hasta ${fechaFinal.toISOString()}`);

            // Paso 1: Obtener lista de pedidos
            const pedidosList = await this.getPedidosList(fechaInicial, fechaFinal);

            console.log(`📦 Encontrados ${pedidosList.length} pedidos`);

            if (pedidosList.length === 0) {
                return [];
            }

            // Paso 2: Obtener detalles completos de cada pedido
            const pedidosCompletos = [];

            for (const pedido of pedidosList) {
                try {
                    const pedidoCompleto = await this.getPedidoCompleto(pedido.f_rowid);

                    if (pedidoCompleto) {
                        pedidosCompletos.push(pedidoCompleto);
                    }
                } catch (error) {
                    console.error(`❌ Error procesando pedido ${pedido.f_rowid}:`, error.message);
                    // Continuar con el siguiente pedido
                }
            }

            console.log(`✅ Obtenidos ${pedidosCompletos.length} pedidos completos`);
            return pedidosCompletos;

        } catch (error) {
            console.error('❌ Error obteniendo pedidos completos:', error.message);
            throw error;
        }
    }
}

module.exports = PedidosDataService;
