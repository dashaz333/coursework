const express = require('express');
const db = require('../database');

const router = express.Router();

// Получить все бронирования
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM bookings");
        console.log("Все бронирования:", rows); // Отладочный лог
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении бронирований:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получить бронирование по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT * FROM bookings WHERE id = ?", [id]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            console.log(`Бронирование с ID ${id} не найдено`);
            res.status(404).json({ message: "Бронирование не найдено" });
        }
    } catch (error) {
        console.error("Ошибка при получении бронирования:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Удалить бронирование по ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM bookings WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.json({ id: id });
        } else {
            console.log(`Бронирование с ID ${id} не найдено для удаления`);
            res.status(404).json({ message: "Бронирование не найдено" });
        }
    } catch (error) {
        console.error("Ошибка при удалении бронирования:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Создание нового бронирования
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body;
        const { user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status } = bookingData;

        const [result] = await db.query("INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status]);
        
        const newBooking = { id: result.insertId, user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status };
        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Ошибка при добавлении бронирования:", error);
        res.status(400).json({ message: "Некорректный запрос" });
    }
});

// Обновить существующее бронирование
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bookingData = req.body;
        const { user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status } = bookingData;

        const [result] = await db.query("UPDATE bookings SET user_id = ?, room_id = ?, check_in_date = ?, check_out_date = ?, number_of_guests = ?, total_price = ?, status = ? WHERE id = ?", 
        [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status, id]);

        if (result.affectedRows > 0) {
            const updatedBooking = { id, user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status };
            res.json(updatedBooking);
        } else {
            console.log(`Бронирование с ID ${id} не найдено для обновления`);
            res.status(404).json({ message: "Бронирование не найдено" });
        }
    } catch (error) {
        console.error("Ошибка при обновлении бронирования:", error);
        res.status(400).json({ message: "Некорректный запрос" });
    }
});

module.exports = router;
