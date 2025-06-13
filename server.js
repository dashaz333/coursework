const express = require('express');
const fs = require('fs');
const path = require('path');
const usersApi = require('./api/users');
const roomsApi = require('./api/rooms');
const bookingsApi = require('./api/bookings');
const postsApi = require('./api/posts'); // Импортируйте новый модуль postsApi
const app = express();
const port = 3000;
// Middleware для обработки CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
// Middleware для обработки JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Маршруты API
app.use('/api/users', usersApi);
// Добавляем новый маршрут для логина
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await usersApi.login(email, password); // Используем функцию login из usersApi
        if (result.success) {
            res.json({ success: true, id: result.user.id, token: 'dummy_token' }); // Заглушка для токена
        } else {
            res.status(401).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error("Ошибка при авторизации:", error);
        res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
});
app.use('/api/rooms', roomsApi);
app.use('/api/bookings', bookingsApi);
app.use('/api/posts', postsApi); // Используйте новый модуль postsApi
// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));
// Обработка 404 ошибки для статических файлов
app.use((req, res, next) => {
    const filePath = path.join(__dirname, 'public', '404.html');
    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.status(404).send('404: Страница не найдена');
        } else {
            res.status(404).contentType('text/html').send(content);
        }
    })
});
// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен по адресу http://localhost:${port}`);
});