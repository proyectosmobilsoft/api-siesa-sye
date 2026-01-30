const { getPool } = require('../db/db');
const stateManager = require('../utils/state-manager');
const HttpClient = require('../utils/http-client');

class PedidosSyncService {
    constructor() {
        this.httpClient = null;
        this.isRunning = false;
    }

    /**
     * Inicializar el servicio
     */
    initialize() {
        const endpointUrl = process.env.SYNC_ENDPOINT_URL;

        if (!endpointUrl) {
            throw new Error('SYNC_ENDPOINT_URL no está configurado en .env');
        }

        this.httpClient = new HttpClient(endpointUrl, {
            maxRetries: parseInt(process.env.SYNC_RETRY_ATTEMPTS) || 3,
            retryDelay: parseInt(process.env.SYNC_RETRY_DELAY_MS) || 1000,
            timeout: parseInt(process.env.SYNC_TIMEOUT_MS) || 10000
        });

        console.log('🔧 Pedidos Sync Service inicializado');
        console.log(`📍 Endpoint: ${endpointUrl}`);
    }

    /**
     * Ejecutar sincronización
     */
    async sync() {
        if (this.isRunning) {
            console.log('⏭️  Sincronización ya en curso, saltando...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('\n🔄 Iniciando sincronización de pedidos...');

            // 1. Leer estado
            const state = stateManager.readState();
            console.log(`📅 Última fecha procesada: ${state.ultimaFecha}`);

            // 2. Consultar pedidos nuevos
            const pedidos = await this.fetchNewPedidos(state.ultimaFecha);

            if (pedidos.length === 0) {
                console.log('✨ No hay pedidos nuevos');
                return;
            }

            console.log(`📦 Encontrados ${pedidos.length} pedidos nuevos`);

            // 3. Filtrar pedidos que no hayan sido procesados
            const pedidosNuevos = this.filterNewPedidos(pedidos, state);

            if (pedidosNuevos.length === 0) {
                console.log('✨ Todos los pedidos ya fueron procesados');
                return;
            }

            console.log(`🆕 ${pedidosNuevos.length} pedidos para sincronizar`);

            // 4. Enviar pedidos
            let successCount = 0;
            for (const pedido of pedidosNuevos) {
                try {
                    await this.httpClient.sendPedido(pedido);

                    // Actualizar estado después de cada envío exitoso
                    stateManager.updateState({
                        fecha: pedido.f430_fecha || new Date().toISOString(),
                        id: pedido.f430_rowid || 0
                    });

                    successCount++;
                } catch (error) {
                    console.error(`❌ Error enviando pedido ${pedido.f430_rowid}:`, error.message);
                    // Continuar con el siguiente pedido
                }
            }

            const duration = Date.now() - startTime;
            console.log(`✅ Sincronización completada: ${successCount}/${pedidosNuevos.length} pedidos enviados en ${duration}ms`);

        } catch (error) {
            console.error('❌ Error en sincronización:', error.message);
            console.error(error.stack);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Obtener pedidos nuevos desde la base de datos
     * @param {string} fechaDesde - Fecha desde la cual buscar
     * @returns {Promise<Array>} Array de pedidos
     */
    async fetchNewPedidos(fechaDesde) {
        const pool = await getPool();
        const request = pool.request();
        request.timeout = 120000;

        const sql = require('mssql');

        const fechaInicial = new Date(fechaDesde);
        const fechaFinal = new Date();

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
     * Filtrar pedidos que no hayan sido procesados
     * @param {Array} pedidos - Todos los pedidos
     * @param {Object} state - Estado actual
     * @returns {Array} Pedidos nuevos
     */
    filterNewPedidos(pedidos, state) {
        return pedidos.filter(pedido => {
            const pedidoFecha = new Date(pedido.f430_fecha || pedido.fecha);
            const ultimaFecha = new Date(state.ultimaFecha);
            const pedidoId = pedido.f430_rowid || pedido.id || 0;

            // Incluir si la fecha es posterior O si la fecha es igual pero el ID es mayor
            return pedidoFecha > ultimaFecha ||
                (pedidoFecha.getTime() === ultimaFecha.getTime() && pedidoId > state.ultimoId);
        });
    }

    /**
     * Obtener estadísticas del servicio
     * @returns {Object} Estadísticas
     */
    getStats() {
        return {
            ...stateManager.getStats(),
            isRunning: this.isRunning,
            endpointUrl: process.env.SYNC_ENDPOINT_URL
        };
    }
}

module.exports = new PedidosSyncService();
