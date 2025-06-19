const express = require('express');
<<<<<<< HEAD
const db = require('../database');
const router = express.Router();
// Получить всех пользователей
=======
const db = require('../database'); // Подключение к базе данных
const router = express.Router(); // Создание маршрутизатора Express

/**
 * @route GET /api/users
 * @description Получение списка всех пользователей.
 * @access Public
 * @returns {Array<Object>} Массив объектов пользователей с полями id, name, surname, patronymic, email, phone.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users");
        console.log("Данные пользователей:", rows); // Отладочный лог
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

<<<<<<< HEAD

// Получить пользователя по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT id, name, surname, patronymic, email, phone, rights FROM users WHERE id = ?", [id]);
=======
/**
 * @route GET /api/users/:id
 * @description Получение пользователя по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор пользователя.
 * @returns {Object} Объект пользователя с полями id, name, surname, patronymic, email, phone.
 * @returns {Object} 404 - Пользователь не найден.
 * @returns {Object} 500 - Ошибка сервера.
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для получения пользователя по ID.
        const [rows] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users WHERE id = ?", [id]);
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            console.log(`Пользователь с ID ${id} не найден`);
            res.status(404).json({ message: "Пользователь не найден" });
        }
    } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

<<<<<<< HEAD
// Удалить пользователя по ID
=======
/**
 * @route DELETE /api/users/:id
 * @description Удаление пользователя по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор пользователя для удаления.
 * @returns {Object} Объект с id удаленного пользователя.
 * @returns {Object} 404 - Пользователь не найден.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.json({ id: id });
        } else {
            console.log(`Пользователь с ID ${id} не найден для удаления`);
            res.status(404).json({ message: "Пользователь не найден" });
        }
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

<<<<<<< HEAD
// Добавить нового пользователя
router.post('/', async (req, res) => {
    try {
        const { name, surname, patronymic, email, phone, password } = req.body;
=======
/**
 * @route POST /api/users
 * @description Добавление нового пользователя.
 * @access Public
 * @param {Object} req.body - Данные нового пользователя.
 * @param {string} req.body.name - Имя пользователя.
 * @param {string} req.body.surname - Фамилия пользователя.
 * @param {string} req.body.patronymic - Отчество пользователя.
 * @param {string} req.body.email - Адрес электронной почты пользователя (должен быть уникальным).
 * @param {string} req.body.phone - Номер телефона пользователя.
 * @param {string} req.body.password - Пароль пользователя.
 * @returns {Object} 201 - Объект созданного пользователя с его id.
 * @returns {Object} 400 - Пользователь с таким email уже зарегистрирован или некорректный запрос.
 */
router.post('/', async (req, res) => {
    try {
        const { name, surname, patronymic, email, phone, password } = req.body; // Получаем данные из тела запроса
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759

        // Проверка на существование email
        const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Пользователь с таким email уже зарегистрирован" });
        }
<<<<<<< HEAD
        const sql = "INSERT INTO users (name, surname, patronymic, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [name, surname, patronymic, email, phone, password];
        const [result] = await db.query(sql, values);
        const newUser = { id: result.insertId, name, surname, patronymic, email, phone, password };
        res.status(201).json(newUser);
=======

        // Выполняем SQL-запрос для добавления нового пользователя.
        const sql = "INSERT INTO users (name, surname, patronymic, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [name, surname, patronymic, email, phone, password];
        const [result] = await db.query(sql, values);

        const newUser = { id: result.insertId, name, surname, patronymic, email, phone, password }; // Формируем объект нового пользователя
        res.status(201).json(newUser); // Отправляем данные созданного пользователя с кодом 201 (Created)
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
    } catch (error) {
        console.error("Ошибка при добавлении пользователя:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});

<<<<<<< HEAD
// Добавляем функцию login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Пользователь с таким email не найден" });
        }
        const user = users[0];

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Неверный пароль" });
        }
        // Отправляем данные пользователя в ответе
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, rights: user.rights } }); // <-- ИЗМЕНЕНО ЗДЕСЬ
    } catch (error) {
        console.error("Ошибка при авторизации:", error);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});


// Обновить пользователя
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, surname, patronymic, email, phone, password } = req.body;
        // Если пароль передается, обновляем его. Если нет, оставляем старый.
=======
/**
 * @route PUT /api/users/:id
 * @description Обновление информации о пользователе по его идентификатору.
 * @access Public
 * @param {string} id - Уникальный идентификатор пользователя для обновления.
 * @param {Object} req.body - Обновленные данные пользователя.
 * @param {string} [req.body.name] - Новое имя пользователя (опционально).
 * @param {string} [req.body.surname] - Новая фамилия пользователя (опционально).
 * @param {string} [req.body.patronymic] - Новое отчество пользователя (опционально).
 * @param {string} [req.body.email] - Новый адрес электронной почты пользователя (опционально).
 * @param {string} [req.body.phone] - Новый номер телефона пользователя (опционально).
 * @param {string} [req.body.password] - Новый пароль пользователя (опционально).
 * @returns {Object} Объект с обновленными данными пользователя.
 * @returns {Object} 404 - Пользователь не найден.
 * @returns {Object} 400 - Некорректный запрос.
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        const { name, surname, patronymic, email, phone, password } = req.body; // Получаем обновленные данные из тела запроса

        // Формируем SQL-запрос для обновления данных пользователя.
        // Если password передан, обновляем и его.
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
        let sql = "UPDATE users SET name = ?, surname = ?, patronymic = ?, email = ?, phone = ?";
        let values = [name, surname, patronymic, email, phone];

        if (password) {
            sql += ", password = ?";
            values.push(password);
        }

        sql += " WHERE id = ?";
        values.push(id);
<<<<<<< HEAD
        const [result] = await db.query(sql, values);
=======

        const [result] = await db.query(sql, values); // Выполняем SQL-запрос

>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
        if (result.affectedRows > 0) {
            const updatedUser = { id, name, surname, patronymic, email, phone, password };
            res.json(updatedUser);
        } else {
            console.log(`Пользователь с ID ${id} не найден для обновления`);
            res.status(404).json({ message: "Пользователь не найден" });
        }
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error);
        res.status(400).json({ message: "Некорректный запрос" });
    }
});

<<<<<<< HEAD
module.exports = router;
=======
/**
 * @route POST /api/login
 * @description Аутентификация пользователя.
 * @access Public
 * @param {Object} req.body - Данные для аутентификации.
 * @param {string} req.body.email - Адрес электронной почты пользователя.
 * @param {string} req.body.password - Пароль пользователя.
 * @returns {Object} Объект с success: true и данными пользователя (id, email, name) при успешной аутентификации.
 * @returns {Object} 404 - Пользователь с таким email не найден (success: false).
 * @returns {Object} 401 - Неверный пароль (success: false).
 * @returns {Object} 500 - Ошибка сервера (success: false).
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // Получаем email и пароль из тела запроса

        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]); // Ищем пользователя по email.

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Пользователь с таким email не найден" }); // Если пользователь не найден, отправляем ошибку 404
        }

        const user = users[0]; // Получаем данные пользователя

        // Проверяем пароль.
        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Неверный пароль" }); // Если пароль не совпадает, отправляем ошибку 401
        }

        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } }); // Отправляем данные пользователя при успешной аутентификации.
    } catch (error) {
        console.error("Ошибка при авторизации:", error); // Логируем ошибку
        res.status(500).json({ success: false, message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

module.exports = router; // Экспортируем маршрутизатор
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
