const mysql = require("mysql");

const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'full_stack_demo'
});

module.exports = dbConnection;