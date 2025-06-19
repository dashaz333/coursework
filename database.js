const mysql = require('mysql2');

/**
 * Конфигурация подключения к базе данных MySQL.
 * @type {object}
 * @property {string} host - Хост базы данных.
 * @property {string} user - Имя пользователя базы данных.
 * @property {number} port - Порт базы данных.
 * @property {string} database - Название базы данных.
 * @property {string} password - Пароль пользователя базы данных.
 * @property {boolean} waitForConnections - Ожидать ли доступных соединений в пуле.
 * @property {number} connectionLimit - Максимальное количество соединений в пуле.
 * @property {number} queueLimit - Максимальное количество запросов в очереди, ожидающих соединения.
 */
const dbConfig = {
  host: 'MySQL-8.0',
  user: 'root',
  port: 3306,
  database: 'kur',
  password: '', // В реальных проектах пароли хранятся более безопасно!
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/**
 * Пул соединений с базой данных MySQL.
 * Создает и управляет пулом соединений для эффективного выполнения запросов.
 * Использует промисы для асинхронной работы.
 * @type {mysql2.Pool}
 */
const pool = mysql.createPool(dbConfig).promise();

/**
 * Экспортирует пул соединений с базой данных.
 * @module db
 */
module.exports = pool;