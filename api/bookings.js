const express = require('express');
const db = require('../database');

<<<<<<< HEAD
const router = express.Router();

// Получить все бронирования
=======
/**
 * @route GET /api/bookings
 * @description Получение списка всех бронирований.
 * @access Public
 * @returns {Array<Object>} Массив объектов бронирований.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
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

<<<<<<< HEAD
// Получить бронирование по ID
=======
/**
 * @route GET /api/bookings/:id
 * @description Получение бронирования по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор бронирования.
 * @returns {Object} Объект бронирования.
 * @returns {Object} 404 - Бронирование не найдено.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
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

<<<<<<< HEAD
// Удалить бронирование по ID
=======
/**
 * @route DELETE /api/bookings/:id
 * @description Удаление бронирования по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор бронирования для удаления.
 * @returns {Object} Объект с id удаленного бронирования.
 * @returns {Object} 404 - Бронирование не найдено.
 * @returns {Object} 500 - Ошибка сервера.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
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

<<<<<<< HEAD
// Создание нового бронирования
=======
/**
 * @route POST /api/bookings
 * @description Создание нового бронирования.
 * @access Public
 * @param {Object} req.body - Данные нового бронирования.
 * @param {number} req.body.user_id - Идентификатор пользователя, сделавшего бронирование.
 * @param {number} req.body.room_id - Идентификатор забронированного номера.
 * @param {string} req.body.check_in_date - Дата заезда (в формате YYYY-MM-DD).
 * @param {string} req.body.check_out_date - Дата выезда (в формате YYYY-MM-DD).
 * @param {number} req.body.number_of_guests - Количество гостей.
 * @param {number} req.body.total_price - Общая стоимость бронирования.
 * @param {string} req.body.status - Статус бронирования (одно из значений enum: 'pending', 'confirmed', 'cancelled', 'completed').
 * @returns {Object} 201 - Объект созданного бронирования с его id.
 * @returns {Object} 400 - Некорректный запрос.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.post('/', async (req, res) => {
    try {
        const bookingData = req.body;
        const { user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status } = bookingData;
<<<<<<< HEAD
=======

        // Выполняем SQL-запрос для добавления нового бронирования.
        const [result] = await db.query("INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status]);
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759

        const [result] = await db.query("INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status]);
        
        const newBooking = { id: result.insertId, user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status };
        res.status(201).json(newBooking);
    } catch (error) {
        console.error("Ошибка при добавлении бронирования:", error);
        res.status(400).json({ message: "Некорректный запрос" });
    }
});

<<<<<<< HEAD
// Обновить существующее бронирование
=======
/**
 * @route PUT /api/bookings/:id
 * @description Обновление существующего бронирования.
 * @access Public
 * @param {string} id - Уникальный идентификатор бронирования для обновления.
 * @param {Object} req.body - Обновленные данные бронирования.
 * @param {number} [req.body.user_id] - Новый идентификатор пользователя (опционально).
 * @param {number} [req.body.room_id] - Новый идентификатор номера (опционально).
 * @param {string} [req.body.check_in_date] - Новая дата заезда (опционально, в формате YYYY-MM-DD).
 * @param {string} [req.body.check_out_date] - Новая дата выезда (опционально, в формате YYYY-MM-DD).
 * @param {number} [req.body.number_of_guests] - Новое количество гостей (опционально).
 * @param {number} [req.body.total_price] - Новая общая стоимость (опционально).
 * @param {string} [req.body.status] - Новый статус бронирования (опционально, одно из значений enum).
 * @returns {Object} Объект с обновленными данными бронирования.
 * @returns {Object} 404 - Бронирование не найдено.
 * @returns {Object} 400 - Некорректный запрос.
 */
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bookingData = req.body;
        const { user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status } = bookingData;

<<<<<<< HEAD
        const [result] = await db.query("UPDATE bookings SET user_id = ?, room_id = ?, check_in_date = ?, check_out_date = ?, number_of_guests = ?, total_price = ?, status = ? WHERE id = ?", 
        [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status, id]);
=======
        // Выполняем SQL-запрос для обновления данных бронирования.
        const [result] = await db.query("UPDATE bookings SET user_id = ?, room_id = ?, check_in_date = ?, check_out_date = ?, number_of_guests = ?, total_price = ?, status = ? WHERE id = ?",
            [user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, status, id]);
>>>>>>> 3baab1fe2f1f81c0db16b686235c16a741264759

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
