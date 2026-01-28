const { getPool } = require('../db/db');

async function getPedidos(fechaInicial, fechaFinal) {
  const pool = await getPool();

  const request = pool.request();
  // Aumentar timeout a 120 segundos para consultas complejas
  request.timeout = 120000;

  const sql = require('mssql');

  // Agregar parámetros de entrada
  request.input('p_cia', sql.Int, 1);
  request.input('p_co', sql.NVarChar, '');
  request.input('p_tipo_docto', sql.NVarChar, '');
  request.input('p_usuario', sql.NVarChar, '');
  request.input('p_ind_usuario', sql.Int, 1);
  request.input('p_rowid_vend', sql.Int, 0);
  request.input('p_rowid_fact', sql.Int, 0);
  request.input('p_rowid_rem', sql.Int, 0);
  request.input('p_clase_docto', sql.Int, 0);
  request.input('p_fec_inicial', sql.DateTime, fechaInicial);
  request.input('p_fec_final', sql.DateTime, fechaFinal);
  request.input('p_ind_fecha', sql.Int, 7);
  request.input('p_num_inicial', sql.Int, 0);
  request.input('p_num_final', sql.Int, 0);
  request.input('p_ind_numero', sql.Int, 0);
  request.input('p_ind_estado', sql.Int, 0);
  request.input('p_ind_impresos', sql.Int, 0);
  request.input('p_ind_transmitidos', sql.Int, 0);
  request.input('p_ind_valorar_con', sql.Int, 1);
  request.input('p_cons_tipo', sql.Int, 10092);
  request.input('p_cons_nombre', sql.NVarChar, '<Predeterminado>');
  request.input('p_rowid_usuario', sql.Int, 1133);

  // Ejecutar el stored procedure
  const result = await request.execute('sp_pv_cons_pedido');

  return result.recordset;
}

module.exports = { getPedidos };
