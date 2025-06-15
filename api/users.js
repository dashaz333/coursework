const express = require('express');
const db = require('../database');
const router = express.Router();
// Получить всех пользователей
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


// Получить пользователя по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT id, name, surname, patronymic, email, phone FROM users WHERE id = ?", [id]);

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

// Удалить пользователя по ID
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

// Добавить нового пользователя
router.post('/', async (req, res) => {
    try {
        const { name, surname, patronymic, email, phone, password } = req.body;

        // Проверка на существование email
        const [existingUsers] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Пользователь с таким email уже зарегистрирован" });
        }
        const sql = "INSERT INTO users (name, surname, patronymic, email, phone, password) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [name, surname, patronymic, email, phone, password];
        const [result] = await db.query(sql, values);
        const newUser = { id: result.insertId, name, surname, patronymic, email, phone, password };
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Ошибка при добавлении пользователя:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});

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
        res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
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
        let sql = "UPDATE users SET name = ?, surname = ?, patronymic = ?, email = ?, phone = ?";
        let values = [name, surname, patronymic, email, phone];
        if (password) {
            sql += ", password = ?";
            values.push(password);
        }
        sql += " WHERE id = ?";
        values.push(id);
        const [result] = await db.query(sql, values);
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
        res.json({ success: true, user: user });
    } catch (error) {
        console.error("Ошибка при авторизации:", error);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});

module.exports = router;
