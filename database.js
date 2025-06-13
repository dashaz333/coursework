const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'MySQL-8.0',
  user: 'root',
  port: 3306,
  database: 'kur',
  password: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

module.exports = pool;
