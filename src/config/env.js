
var path = require("path");
var config = require(path.join(__dirname, 'config.json'));

module.exports = {
  port: config.PORT || 3010,
  db: {
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    port: config.DB_PORT ? Number(config.DB_PORT) : 1433,
    trustServerCertificate: config.trustServerCertificate !== undefined ? config.trustServerCertificate : true,
    encrypt: config.encrypt !== undefined ? config.encrypt : false,
  },
  db2: {
    host: config.DB2_HOST,
    user: config.DB2_USER,
    password: config.DB2_PASS,
    database: config.DB2_NAME,
    port: config.DB2_PORT ? Number(config.DB2_PORT) : 1434,
    trustServerCertificate: false, // para bd secundaria clásico
    encrypt: false                // clave para SQL Server sin SSL
  },
};

