/**
 * Transformador de datos de pedidos
 * Convierte los resultados de los SPs al formato requerido por la API externa
 */

class PedidoTransformer {
    /**
     * Transforma un pedido del formato de base de datos al formato de API externa
     * @param {Object} pedidoDB - Pedido completo desde pedidos-data.service
     * @returns {Object} Pedido en formato de API externa
     */
    static transform(pedidoDB) {
        return {
            orderNumber: pedidoDB.rowid?.toString() || '',
            customerName: pedidoDB.contacto || '',
            address: pedidoDB.direccion1 || '',
            externalClientId: pedidoDB.rowid_tercero_desp?.toString() || pedidoDB.id_desp?.toString() || '',
            managementType: 1, // 1=Entrega (quemado por ahora)
            phone: this.getPhone(pedidoDB),
            cellphone: this.getCellphone(pedidoDB),
            addressAdd: pedidoDB.direccion2 || '',
            email: pedidoDB.email || '',
            comments: pedidoDB.notas || '',
            dispensaryId: 0,
            latitude: 0,
            longitude: 0,
            fromHour: this.formatTime(pedidoDB.hora_desde) || '',
            toHour: this.formatTime(pedidoDB.hora_hasta) || '',
            deliveryPlannedDate: this.formatDate(pedidoDB.d_clase_venc_dcto || pedidoDB.fecha),
            priority: 0, // Quemado en 0 por ahora
            dispensary: this.buildDispensary(pedidoDB),
            products: this.buildProducts(pedidoDB)
        };
    }

    /**
     * Obtener teléfono (priorizar celular, sino teléfono)
     */
    static getPhone(pedidoDB) {
        const celular = pedidoDB.celular;
        const telefono = pedidoDB.telefono;

        // Si celular existe y no es null/0, retornarlo
        if (celular && celular !== '0' && celular !== 0) {
            return '';  // No enviar phone si hay celular
        }

        // Si hay teléfono y no es null/0, retornarlo
        if (telefono && telefono !== '0' && telefono !== 0) {
            return telefono.toString();
        }

        return '';
    }

    /**
     * Obtener celular (priorizar este)
     */
    static getCellphone(pedidoDB) {
        const celular = pedidoDB.celular;

        // Si celular existe y no es null/0, retornarlo
        if (celular && celular !== '0' && celular !== 0) {
            return celular.toString();
        }

        return '';
    }

    /**
     * Construir objeto dispensary
     */
    static buildDispensary(pedidoDB) {
        return {
            id: 0,
            externalClientId: 0,
            municipalityId: 0,
            name: pedidoDB.razon_social_desp || pedidoDB.contacto || 'Dispensario Principal',
            code: pedidoDB.id_desp?.toString() || pedidoDB.cod_postal?.toString() || '001',
            location: {
                countryCode: 'CO',
                departmentCode: pedidoDB.id_depto?.toString() || '',
                cityCode: pedidoDB.id_ciudad?.toString() || '',
                address: pedidoDB.direccion1 || '',
                lat: 0,
                lng: 0
            }
        };
    }

    /**
     * Construir array de productos
     * TODO: Confirmar de dónde vienen los productos
     */
    static buildProducts(pedidoDB) {
        // Por ahora retornar array vacío
        // Pendiente: confirmar si vienen en el mismo SP o hay que hacer otra consulta
        return [];
    }

    /**
     * Formatear fecha a ISO 8601
     */
    static formatDate(fecha) {
        if (!fecha) {
            return new Date().toISOString();
        }

        const date = new Date(fecha);
        return date.toISOString();
    }

    /**
     * Formatear hora a formato HH:mm:ss
     */
    static formatTime(hora) {
        if (!hora) {
            return '';
        }

        // Si viene como Date, extraer solo la hora
        if (hora instanceof Date) {
            return hora.toTimeString().split(' ')[0];
        }

        // Si viene como string, retornar tal cual
        return hora.toString();
    }

    /**
     * Validar que el pedido transformado tenga los campos requeridos
     */
    static validate(pedidoTransformado) {
        const requiredFields = {
            'orderNumber': pedidoTransformado.orderNumber,
            'customerName': pedidoTransformado.customerName,
            'address': pedidoTransformado.address,
            'managementType': pedidoTransformado.managementType,
            'priority': pedidoTransformado.priority,
            'deliveryPlannedDate': pedidoTransformado.deliveryPlannedDate,
            'dispensary.name': pedidoTransformado.dispensary?.name,
            'dispensary.code': pedidoTransformado.dispensary?.code,
            'dispensary.location.cityCode': pedidoTransformado.dispensary?.location?.cityCode,
            'dispensary.location.address': pedidoTransformado.dispensary?.location?.address
        };

        const errors = [];

        Object.entries(requiredFields).forEach(([field, value]) => {
            if (!value && value !== 0) {
                errors.push(`Campo requerido faltante: ${field}`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Limpiar campos vacíos opcionales del JSON
     */
    static cleanOptionalFields(pedidoJSON) {
        // Remover campos opcionales que estén vacíos
        const optionalFields = ['phone', 'cellphone', 'email', 'comments', 'addressAdd', 'fromHour', 'toHour'];

        optionalFields.forEach(field => {
            if (!pedidoJSON[field]) {
                delete pedidoJSON[field];
            }
        });

        return pedidoJSON;
    }

    /**
     * Transformar y validar
     */
    static transformAndValidate(pedidoDB) {
        const transformed = this.transform(pedidoDB);
        const validation = this.validate(transformed);

        if (!validation.isValid) {
            console.warn('⚠️  Pedido con campos faltantes:', validation.errors);
            console.warn('Datos del pedido:', pedidoDB);
        }

        // Limpiar campos opcionales vacíos
        const cleaned = this.cleanOptionalFields(transformed);

        return {
            pedido: cleaned,
            isValid: validation.isValid,
            errors: validation.errors
        };
    }
}

module.exports = PedidoTransformer;
