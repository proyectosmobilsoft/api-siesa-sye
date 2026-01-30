const PedidosDataService = require('./pedidos-data.service');
const PedidoTransformer = require('../utils/pedido-transformer');
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

            // 1. Calcular rango de fechas (solo hoy - getday)
            const { fechaInicial, fechaFinal } = this.getDateRange();
            console.log(`📅 Rango de fechas: ${fechaInicial.toISOString()} - ${fechaFinal.toISOString()}`);

            // 2. Obtener pedidos completos (ejecuta los 3 SPs)
            const pedidosDB = await PedidosDataService.getPedidosCompletos(fechaInicial, fechaFinal);

            if (pedidosDB.length === 0) {
                console.log('✨ No hay pedidos nuevos para hoy');
                return;
            }

            console.log(`📦 Encontrados ${pedidosDB.length} pedidos para procesar`);

            // 3. Leer estado para filtrar pedidos ya procesados
            const state = stateManager.readState();
            const pedidosNuevos = this.filterNewPedidos(pedidosDB, state);

            if (pedidosNuevos.length === 0) {
                console.log('✨ Todos los pedidos de hoy ya fueron procesados');
                return;
            }

            console.log(`🆕 ${pedidosNuevos.length} pedidos nuevos para sincronizar`);

            // 4. Transformar y enviar pedidos
            let successCount = 0;
            let errorCount = 0;

            for (const pedidoDB of pedidosNuevos) {
                try {
                    // Transformar a formato de API externa
                    const { pedido, isValid, errors } = PedidoTransformer.transformAndValidate(pedidoDB);

                    if (!isValid) {
                        console.warn(`⚠️  Pedido ${pedidoDB.rowid} tiene errores de validación:`, errors);
                        // Continuar de todas formas (puedes cambiar esto si prefieres saltarlo)
                    }

                    console.log(`📤 Enviando pedido ${pedidoDB.rowid}...`);
                    console.log('JSON a enviar:', JSON.stringify(pedido, null, 2));

                    // Enviar al endpoint
                    await this.httpClient.sendPedido(pedido);

                    // Actualizar estado después de envío exitoso
                    stateManager.updateState({
                        fecha: pedidoDB.fecha || new Date().toISOString(),
                        id: pedidoDB.rowid || 0
                    });

                    successCount++;
                    console.log(`✅ Pedido ${pedidoDB.rowid} enviado exitosamente`);

                } catch (error) {
                    errorCount++;
                    console.error(`❌ Error enviando pedido ${pedidoDB.rowid}:`, error.message);
                    // Continuar con el siguiente pedido
                }
            }

            const duration = Date.now() - startTime;
            console.log(`\n✅ Sincronización completada:`);
            console.log(`   - Exitosos: ${successCount}/${pedidosNuevos.length}`);
            console.log(`   - Errores: ${errorCount}`);
            console.log(`   - Duración: ${duration}ms`);

        } catch (error) {
            console.error('❌ Error en sincronización:', error.message);
            console.error(error.stack);
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Obtener rango de fechas (solo hoy - getday)
     * @returns {Object} { fechaInicial, fechaFinal }
     */
    getDateRange() {
        const now = new Date();

        // Inicio del día (00:00:00)
        const fechaInicial = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

        // Fin del día (23:59:59)
        const fechaFinal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        return { fechaInicial, fechaFinal };
    }

    /**
     * Filtrar pedidos que no hayan sido procesados
     * @param {Array} pedidos - Todos los pedidos
     * @param {Object} state - Estado actual
     * @returns {Array} Pedidos nuevos
     */
    filterNewPedidos(pedidos, state) {
        return pedidos.filter(pedido => {
            const pedidoFecha = new Date(pedido.fecha);
            const ultimaFecha = new Date(state.ultimaFecha);
            const pedidoId = pedido.rowid || 0;

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
