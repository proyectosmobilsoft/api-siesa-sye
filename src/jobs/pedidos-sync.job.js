const cron = require('node-cron');
const pedidosSyncService = require('../services/pedidos-sync.service');

class PedidosSyncJob {
    constructor() {
        this.task = null;
        this.isEnabled = false;
    }

    /**
     * Iniciar el job de sincronización
     */
    start() {
        // Verificar si está habilitado
        const enabled = process.env.SYNC_ENABLED === 'true';

        if (!enabled) {
            console.log('⏸️  Pedidos sync job deshabilitado (SYNC_ENABLED=false)');
            return;
        }

        this.isEnabled = true;

        // Inicializar el servicio
        try {
            pedidosSyncService.initialize();
        } catch (error) {
            console.error('❌ Error inicializando sync service:', error.message);
            return;
        }

        // Obtener intervalo de configuración (en segundos)
        const intervalSeconds = parseInt(process.env.SYNC_INTERVAL_SECONDS) || 30;

        // Convertir a expresión cron
        // Si es menos de 60 segundos, usar formato */N * * * * *
        // Si es 60 o más, usar minutos
        let cronExpression;
        if (intervalSeconds < 60) {
            cronExpression = `*/${intervalSeconds} * * * * *`;
        } else {
            const intervalMinutes = Math.floor(intervalSeconds / 60);
            cronExpression = `*/${intervalMinutes} * * * *`;
        }

        console.log(`⏰ Programando sincronización cada ${intervalSeconds} segundos`);
        console.log(`📅 Expresión cron: ${cronExpression}`);

        // Crear tarea cron
        this.task = cron.schedule(cronExpression, async () => {
            await pedidosSyncService.sync();
        });

        console.log('✅ Pedidos sync job iniciado');

        // Ejecutar una vez al inicio (después de 5 segundos)
        setTimeout(async () => {
            console.log('🚀 Ejecutando sincronización inicial...');
            await pedidosSyncService.sync();
        }, 5000);
    }

    /**
     * Detener el job
     */
    stop() {
        if (this.task) {
            this.task.stop();
            console.log('⏹️  Pedidos sync job detenido');
        }
    }

    /**
     * Obtener estado del job
     */
    getStatus() {
        return {
            enabled: this.isEnabled,
            running: this.task ? true : false,
            stats: pedidosSyncService.getStats()
        };
    }

    /**
     * Forzar ejecución manual
     */
    async trigger() {
        console.log('🔧 Sincronización manual disparada');
        await pedidosSyncService.sync();
    }
}

module.exports = new PedidosSyncJob();
