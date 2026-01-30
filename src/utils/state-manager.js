const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, '../../data/sync-state.json');
const DATA_DIR = path.join(__dirname, '../../data');

class StateManager {
    constructor() {
        this.ensureDataDirectory();
    }

    /**
     * Asegurar que el directorio data/ existe
     */
    ensureDataDirectory() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
            console.log('📁 Directorio data/ creado');
        }
    }

    /**
     * Leer el estado guardado
     * @returns {Object} Estado con ultimaFecha y ultimoId
     */
    readState() {
        try {
            if (!fs.existsSync(STATE_FILE)) {
                // Si no existe, crear estado inicial (1 hora atrás)
                const initialState = this.createInitialState();
                this.writeState(initialState);
                return initialState;
            }

            const data = fs.readFileSync(STATE_FILE, 'utf8');
            const state = JSON.parse(data);

            // Validar estructura
            if (!state.ultimaFecha || !state.ultimoId) {
                console.warn('⚠️  Estado corrupto, recreando...');
                return this.createInitialState();
            }

            return state;
        } catch (error) {
            console.error('❌ Error leyendo estado:', error.message);
            return this.createInitialState();
        }
    }

    /**
     * Guardar el estado
     * @param {Object} state - Estado a guardar
     */
    writeState(state) {
        try {
            const data = JSON.stringify(state, null, 2);
            fs.writeFileSync(STATE_FILE, data, 'utf8');
            console.log('💾 Estado guardado:', state);
        } catch (error) {
            console.error('❌ Error guardando estado:', error.message);
        }
    }

    /**
     * Actualizar el estado con nuevo pedido procesado
     * @param {Object} pedido - Último pedido procesado
     */
    updateState(pedido) {
        const state = {
            ultimaFecha: pedido.fecha || new Date().toISOString(),
            ultimoId: pedido.id || 0,
            ultimaActualizacion: new Date().toISOString(),
            totalProcesados: (this.readState().totalProcesados || 0) + 1
        };
        this.writeState(state);
    }

    /**
     * Crear estado inicial (1 hora atrás para no perder pedidos recientes)
     * @returns {Object} Estado inicial
     */
    createInitialState() {
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        return {
            ultimaFecha: oneHourAgo.toISOString(),
            ultimoId: 0,
            ultimaActualizacion: new Date().toISOString(),
            totalProcesados: 0
        };
    }

    /**
     * Obtener estadísticas del estado
     * @returns {Object} Estadísticas
     */
    getStats() {
        const state = this.readState();
        return {
            ultimaFecha: state.ultimaFecha,
            ultimoId: state.ultimoId,
            ultimaActualizacion: state.ultimaActualizacion,
            totalProcesados: state.totalProcesados || 0
        };
    }
}

module.exports = new StateManager();
