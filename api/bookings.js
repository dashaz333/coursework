const express = require('express');
const db = require('../database'); // Подключение к базе данных
const router = express.Router(); // Создание маршрутизатора Express

// GET /bookings: Получение списка всех бронирований.
router.get('/', async (req, res) => {
    try {
        // Выполняем SQL-запрос для получения всех бронирований.
        const [rows] = await db.query("SELECT * FROM bookings");
        console.log("Все бронирования:", rows); // Отладочный лог (можно удалить в продакшене)
        res.json(rows); // Отправляем данные в формате JSON
    } catch (error) {
        console.error("Ошибка при получении бронирований:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

// GET /bookings/:id: Получение бронирования по ID.
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для получения бронирования по ID.
        const [rows] = await db.query("SELECT * FROM bookings WHERE id = ?", [id]);
        if (rows.length > 0) {
            res.json(rows[0]); // Отправляем найденное бронирование
        } else {
            console.log(`Бронирование с ID ${id} не найдено`); // Логируем, если бронирование не найдено
            res.status(404).json({ message: "Бронирование не найдено" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при получении бронирования:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

// DELETE /bookings/:id: Удаление бронирования по ID.
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для удаления бронирования по ID.
        const [result] = await db.query("DELETE FROM bookings WHERE id = ?", [id]);
        if (result.affectedRows > 0) {
            res.json({ id: id }); // Отправляем id удаленного бронирования
        } else {
            console.log(`Бронирование с ID ${id} не найдено для удаления`); // Логируем, если бронирование не найдено
            res.status(404).json({ message: "Бронирование не найдено" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при удалении бронирования:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

// POST /bookings: Создание нового бронирования.
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body; // Получаем данные из тела запроса
        const { user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status } = bookingData;
        // Выполняем SQL-запрос для добавления нового бронирования.
        const [result] = await db.query("INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status]);

        const newBooking = { id: result.insertId, user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status }; // Формируем объект нового бронирования
        res.status(201).json(newBooking); // Отправляем данные созданного бронирования с кодом 201 (Created)
    } catch (error) {
        console.error("Ошибка при добавлении бронирования:", error); // Логируем ошибку
        res.status(400).json({ message: "Некорректный запрос" }); // Отправляем ошибку 400
    }
});

// PUT /bookings/:id: Обновление существующего бронирования.
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        const bookingData = req.body; // Получаем обновленные данные из тела запроса
        const { user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status } = bookingData;
        // Выполняем SQL-запрос для обновления данных бронирования.
        const [result] = await db.query("UPDATE bookings SET user_id = ?, room_id = ?, check_in_date = ?, check_out_date = ?, number_of_guests = ?, total_price = ?, status = ? WHERE id = ?",
            [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status, id]);
        if (result.affectedRows > 0) {
            const updatedBooking = { id, user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status }; // Формируем объект обновленного бронирования
            res.json(updatedBooking); // Отправляем обновленные данные
        } else {
            console.log(`Бронирование с ID ${id} не найдено для обновления`); // Логируем, если бронирование не найдено
            res.status(404).json({ message: "Бронирование не найдено" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при обновлении бронирования:", error); // Логируем ошибку
        res.status(400).json({ message: "Некорректный запрос" }); // Отправляем ошибку 400
    }
});

module.exports = router; // Экспортируем маршрутизатор