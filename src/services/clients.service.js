const { getPool } = require('../db/db');

exports.getAllClients = async () => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM clients');
  return rows;
};

exports.getClientById = async (id) => {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM clients WHERE id = ?', [id]);
  return rows[0];
};

