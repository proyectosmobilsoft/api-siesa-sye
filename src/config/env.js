
var path = require("path"); 
var config = require(path.join(__dirname, 'config.json'));

module.exports = {
  port: config.PORT || 3000,
  db: {
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASS,
    database: config.DB_NAME,
    port: config.DB_PORT ? Number(config.DB_PORT) : 1433,
  },
};

