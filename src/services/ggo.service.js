const { getPool } = require('../db/db');
const sql = require('mssql');
const axios = require('axios');

/**
 * Obtiene los tipos de empaque desde la tabla type_packageUnit
 * @returns {Promise<Array>} Lista de tipos de empaque
 */
async function getPackageUnits() {
  const pool = await getPool();
  const request = new sql.Request(pool);

  try {
    const result = await request.query(`
      SELECT codigo, nombre 
      FROM type_packageUnit 
      ORDER BY codigo
    `);

    return {
      success: true,
      data: result.recordset || []
    };
  } catch (error) {
    console.error('Error consultando type_packageUnit:', error);
    throw error;
  }
}

/**
 * Valida los datos del request antes de enviarlos al servicio externo
 * @param {Object} data - Datos del request
 * @returns {Object} - { valid: boolean, errors: Array }
 */
function validateShippingData(data) {
  const errors = [];

  // Campos requeridos
  if (!data.orderNumber || data.orderNumber.trim() === '') {
    errors.push('orderNumber es requerido');
  }
  if (!data.customerName || data.customerName.trim() === '') {
    errors.push('customerName es requerido');
  }
  if (!data.address || data.address.trim() === '') {
    errors.push('address es requerido');
  }
  if (data.managementType === undefined || data.managementType === null) {
    errors.push('managementType es requerido');
  } else if (![1, 2, 3].includes(Number(data.managementType))) {
    errors.push('managementType debe ser 1 (Entrega), 2 (Recogida) o 3 (Visita)');
  }
  if (data.priority === undefined || data.priority === null) {
    errors.push('priority es requerido');
  } else if (![0, 1, 2, 3].includes(Number(data.priority))) {
    errors.push('priority debe ser 0, 1, 2 o 3');
  }
  if (!data.deliveryPlannedDate) {
    errors.push('deliveryPlannedDate es requerido');
  }
  if (!data.dispensary) {
    errors.push('dispensary es requerido');
  } else {
    if (!data.dispensary.name || data.dispensary.name.trim() === '') {
      errors.push('dispensary.name es requerido');
    }
    if (!data.dispensary.code || data.dispensary.code.trim() === '') {
      errors.push('dispensary.code es requerido');
    }
    if (!data.dispensary.location) {
      errors.push('dispensary.location es requerido');
    } else {
      if (!data.dispensary.location.cityCode || data.dispensary.location.cityCode.trim() === '') {
        errors.push('dispensary.location.cityCode es requerido');
      }
      if (!data.dispensary.location.address || data.dispensary.location.address.trim() === '') {
        errors.push('dispensary.location.address es requerido');
      }
    }
  }

  // Validar ventana de tiempo (si se envía fromHour, debe enviarse toHour y viceversa)
  if ((data.fromHour && !data.toHour) || (!data.fromHour && data.toHour)) {
    errors.push('Si se envía fromHour, debe enviarse también toHour y viceversa');
  }

  // Validar formato de fecha
  if (data.deliveryPlannedDate) {
    const date = new Date(data.deliveryPlannedDate);
    if (isNaN(date.getTime())) {
      errors.push('deliveryPlannedDate debe ser una fecha válida en formato ISO 8601');
    }
  }

  // Validar productos si se envían
  if (data.products && Array.isArray(data.products)) {
    data.products.forEach((product, index) => {
      if (!product.name || product.name.trim() === '') {
        errors.push(`products[${index}].name es requerido`);
      }
      if (product.quantity !== undefined && product.quantity !== null) {
        if (isNaN(Number(product.quantity)) || Number(product.quantity) < 0) {
          errors.push(`products[${index}].quantity debe ser un número mayor o igual a 0`);
        }
      }
      if (product.packageUnit !== undefined && product.packageUnit !== null) {
        if (!Number.isInteger(Number(product.packageUnit)) || Number(product.packageUnit) < 0) {
          errors.push(`products[${index}].packageUnit debe ser un número entero mayor o igual a 0`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Envía los datos de envío al servicio externo de GGO
 * @param {Object} shippingData - Datos del envío
 * @param {string} token - Token JWT para autenticación
 * @returns {Promise<Object>} - Respuesta del servicio externo
 */
async function sendShippingToGGO(shippingData, token) {
  const url = 'https://web.logimiles.com/ggo-shipping-service/api/shippings';

  try {
    const response = await axios.post(url, shippingData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      timeout: 30000 // 30 segundos de timeout
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error enviando datos a GGO:', error.response?.data || error.message);
    
    if (error.response) {
      // El servidor respondió con un código de error
      return {
        success: false,
        status: error.response.status,
        message: error.response.data?.message || 'Error al enviar datos al servicio GGO',
        data: error.response.data
      };
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      return {
        success: false,
        message: 'No se pudo conectar con el servicio GGO. Por favor, verifique la conexión.',
        error: error.message
      };
    } else {
      // Error al configurar la petición
      return {
        success: false,
        message: 'Error al configurar la petición al servicio GGO',
        error: error.message
      };
    }
  }
}

module.exports = {
  getPackageUnits,
  validateShippingData,
  sendShippingToGGO
};
