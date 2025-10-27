const { getPool } = require('../db/db');

exports.getAllClients = async () => {
  const pool = await getPool();
  const request = pool.request();
  const result = await request.query('SELECT * FROM clients');
  return result.recordset;
};

exports.getClientById = async (id) => {
  const pool = await getPool();
  const request = pool.request();
  request.input('id', id);
  const result = await request.query('SELECT * FROM clients WHERE id = @id');
  return result.recordset[0];
};

