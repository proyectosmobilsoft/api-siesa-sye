const { getPool } = require('../db/db');

async function getPedidos(fechaInicial, fechaFinal) {
    const pool = await getPool();

    const request = pool.request();
    // Aumentar timeout a 120 segundos para consultas complejas
    request.timeout = 120000;

    const sql = require('mssql');

    // Agregar parámetros de fecha
    request.input('fechaInicial', sql.DateTime, fechaInicial);
    request.input('fechaFinal', sql.DateTime, fechaFinal);

    // Query SQL directa - Consulta de pedidos por rango de fechas
    // Basada en el stored procedure sp_pv_cons_pedido
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
    return result.recordset;
}

module.exports = { getPedidos };
