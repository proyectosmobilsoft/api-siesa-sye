const pedidosService = require('../services/pedidos.service');

async function getPedidos(req, res, next) {
    try {
        const { fechaInicial, fechaFinal } = req.query;

        // Validar que se proporcionen las fechas
        if (!fechaInicial || !fechaFinal) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren los parámetros fechaInicial y fechaFinal'
            });
        }

        // Convertir las fechas a objetos Date
        const fecInicial = new Date(fechaInicial);
        const fecFinal = new Date(fechaFinal);

        // Validar que las fechas sean válidas
        if (isNaN(fecInicial.getTime()) || isNaN(fecFinal.getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Las fechas proporcionadas no son válidas. Use formato ISO 8601 (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss)'
            });
        }

        const pedidos = await pedidosService.getPedidos(fecInicial, fecFinal);
        res.json({ success: true, data: pedidos });
    } catch (err) {
        next(err);
    }
}

module.exports = { getPedidos };
