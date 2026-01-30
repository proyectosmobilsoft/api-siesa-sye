const axios = require('axios');

class HttpClient {
    constructor(baseURL, options = {}) {
        this.baseURL = baseURL;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000; // ms
        this.timeout = options.timeout || 10000; // 10 segundos
    }

    /**
     * Enviar pedido al endpoint con reintentos
     * @param {Object} pedido - Pedido a enviar
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async sendPedido(pedido) {
        let lastError;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`📤 Enviando pedido (intento ${attempt}/${this.maxRetries})...`);

                const response = await axios.post(this.baseURL, pedido, {
                    timeout: this.timeout,
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': 'Distrisye-Pedidos-Sync/1.0'
                    }
                });

                console.log(`✅ Pedido enviado exitosamente (status: ${response.status})`);
                return response.data;

            } catch (error) {
                lastError = error;

                const errorMsg = error.response
                    ? `HTTP ${error.response.status}: ${error.response.statusText}`
                    : error.message;

                console.error(`❌ Error en intento ${attempt}/${this.maxRetries}: ${errorMsg}`);

                // Si no es el último intento, esperar antes de reintentar
                if (attempt < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1); // Backoff exponencial
                    console.log(`⏳ Reintentando en ${delay}ms...`);
                    await this.sleep(delay);
                }
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        throw new Error(`Failed to send pedido after ${this.maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * Enviar múltiples pedidos en lote
     * @param {Array} pedidos - Array de pedidos
     * @returns {Promise<Object>} Resultado del envío
     */
    async sendBatch(pedidos) {
        const results = {
            success: [],
            failed: []
        };

        for (const pedido of pedidos) {
            try {
                await this.sendPedido(pedido);
                results.success.push(pedido);
            } catch (error) {
                console.error(`❌ Error enviando pedido ${pedido.id}:`, error.message);
                results.failed.push({ pedido, error: error.message });
            }
        }

        return results;
    }

    /**
     * Verificar conectividad con el endpoint
     * @returns {Promise<boolean>} true si el endpoint responde
     */
    async healthCheck() {
        try {
            const response = await axios.get(this.baseURL, {
                timeout: 5000
            });
            return response.status >= 200 && response.status < 500;
        } catch (error) {
            console.warn('⚠️  Endpoint no disponible:', error.message);
            return false;
        }
    }

    /**
     * Utilidad para esperar
     * @param {number} ms - Milisegundos a esperar
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = HttpClient;
