const PedidosDataService = require('../services/pedidos-data.service');
const PedidoTransformer = require('../utils/pedido-transformer');
const HttpClient = require('../utils/http-client');

/**
 * Generar preview del JSON transformado sin enviarlo
 */
async function previewPedido(req, res, next) {
    try {
        const { f_rowid } = req.body;

        if (!f_rowid) {
            return res.status(400).json({
                success: false,
                message: 'f_rowid es requerido'
            });
        }

        console.log(`📋 Generando preview para pedido ${f_rowid}`);

        // Obtener datos completos del pedido (ejecuta los 3 SPs)
        const pedidoDB = await PedidosDataService.getPedidoCompleto(f_rowid);

        if (!pedidoDB) {
            return res.status(404).json({
                success: false,
                message: `No se encontró el pedido con f_rowid: ${f_rowid}`
            });
        }

        // Transformar a formato de API externa
        const { pedido, isValid, errors } = PedidoTransformer.transformAndValidate(pedidoDB);

        res.json({
            success: true,
            data: {
                pedidoOriginal: pedidoDB,
                pedidoTransformado: pedido,
                validacion: {
                    isValid,
                    errors
                }
            }
        });

    } catch (err) {
        console.error('Error generando preview:', err);
        next(err);
    }
}

/**
 * Enviar pedido al endpoint externo
 */
async function sendPedido(req, res, next) {
    try {
        const { f_rowid } = req.body;

        if (!f_rowid) {
            return res.status(400).json({
                success: false,
                message: 'f_rowid es requerido'
            });
        }

        const endpointUrl = process.env.SYNC_ENDPOINT_URL;

        if (!endpointUrl) {
            return res.status(500).json({
                success: false,
                message: 'SYNC_ENDPOINT_URL no está configurado'
            });
        }

        console.log(`📤 Enviando pedido ${f_rowid} a ${endpointUrl}`);

        // Obtener datos completos del pedido
        const pedidoDB = await PedidosDataService.getPedidoCompleto(f_rowid);

        if (!pedidoDB) {
            return res.status(404).json({
                success: false,
                message: `No se encontró el pedido con f_rowid: ${f_rowid}`
            });
        }

        // Transformar a formato de API externa
        const { pedido, isValid, errors } = PedidoTransformer.transformAndValidate(pedidoDB);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'El pedido tiene errores de validación',
                errors
            });
        }

        // Enviar al endpoint
        const httpClient = new HttpClient(endpointUrl, {
            maxRetries: parseInt(process.env.SYNC_RETRY_ATTEMPTS) || 3,
            retryDelay: parseInt(process.env.SYNC_RETRY_DELAY_MS) || 1000,
            timeout: parseInt(process.env.SYNC_TIMEOUT_MS) || 10000
        });

        const response = await httpClient.sendPedido(pedido);

        res.json({
            success: true,
            message: 'Pedido enviado exitosamente',
            data: {
                pedido,
                response
            }
        });

    } catch (err) {
        console.error('Error enviando pedido:', err);
        next(err);
    }
}

module.exports = {
    previewPedido,
    sendPedido
};
