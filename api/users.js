const express = require('express');
const db = require('../database'); // Подключение к базе данных
const router = express.Router(); // Создание маршрутизатора Express

// GET /users: Получение списка всех пользователей.
router.get('/', async (req, res) => {
    try {
        // Выполняем SQL-запрос для получения всех пользователей, исключая пароль.
        const [rows] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users");
        console.log("Данные пользователей:", rows); // Логируем полученные данные
        res.json(rows); // Отправляем данные в формате JSON
    } catch (error) {
        console.error("Ошибка при получении пользователей:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

// GET /users/:id: Получение пользователя по ID.
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для получения пользователя по ID.
        const [rows] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users WHERE id = ?", [id]);
        if (rows.length > 0) {
            res.json(rows[0]); // Отправляем найденного пользователя
        } else {
            console.log(`Пользователь с ID ${id} не найден`); // Логируем, если пользователь не найден
            res.status(404).json({ message: "Пользователь не найден" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при получении пользователя:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

// DELETE /users/:id: Удаление пользователя по ID.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для удаления пользователя по ID.
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [id]);
        if (result.affectedRows > 0) {
            res.json({ id: id }); // Отправляем id удаленного пользователя
        } else {
            console.log(`Пользователь с ID ${id} не найден для удаления`); // Логируем, если пользователь не найден
            res.status(404).json({ message: "Пользователь не найден" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

// POST /users: Добавление нового пользователя.
router.post('/', async (req, res) => {
    try {
        const { name, surname, patronymic, email, phone, password } = req.body; // Получаем данные из тела запроса
        // Проверка на существование email
        const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Пользователь с таким email уже зарегистрирован" }); // Если email существует, отправляем ошибку 400
        }
        // Выполняем SQL-запрос для добавления нового пользователя.
        const sql = "INSERT INTO users (name, surname, patronymic, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [name, surname, patronymic, email, phone, password];
        const [result] = await db.query(sql, values);
        const newUser = { id: result.insertId, name, surname, patronymic, email, phone, password }; // Формируем объект нового пользователя
        res.status(201).json(newUser); // Отправляем данные созданного пользователя с кодом 201 (Created)
    } catch (error) {
        console.error("Ошибка при добавлении пользователя:", error); // Логируем ошибку
        res.status(400).json({ message: "Некорректный запрос", error: error.message }); // Отправляем ошибку 400
    }
});

// PUT /users/:id: Обновление информации о пользователе по его идентификатору.
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        const { name, surname, patronymic, email, phone, password } = req.body; // Получаем обновленные данные из тела запроса
        // Формируем SQL-запрос для обновления данных пользователя.
        // Если password передан, обновляем и его.
        let sql = "UPDATE users SET name = ?, surname = ?, patronymic = ?, email = ?, phone = ?";
        let values = [name, surname, patronymic, email, phone];
        if (password) {
            sql += ", password = ?";
            values.push(password);
        }
        sql += " WHERE id = ?";
        values.push(id);
        const [result] = await db.query(sql, values); // Выполняем SQL-запрос
        if (result.affectedRows > 0) {
            const updatedUser = { id, name, surname, patronymic, email, phone, password }; // Формируем объект обновленного пользователя
            res.json(updatedUser); // Отправляем обновленные данные
        } else {
            console.log(`Пользователь с ID ${id} не найден для обновления`); // Логируем, если пользователь не найден
            res.status(404).json({ message: "Пользователь не найден" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error); // Логируем ошибку
        res.status(400).json({ message: "Некорректный запрос" }); // Отправляем ошибку 400
    }
});

// POST /users/login: Аутентификация пользователя.
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