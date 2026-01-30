const pedidosSyncJob = require('../jobs/pedidos-sync.job');

async function getStatus(req, res, next) {
    try {
        const status = pedidosSyncJob.getStatus();
        res.json({ success: true, data: status });
    } catch (err) {
        next(err);
    }
}

async function triggerSync(req, res, next) {
    try {
        // Disparar sincronización en background
        pedidosSyncJob.trigger().catch(error => {
            console.error('Error en sincronización manual:', error);
        });

        res.json({
            success: true,
            message: 'Sincronización manual iniciada'
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getStatus, triggerSync };
