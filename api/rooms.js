const express = require('express');
const router = express.Router(); // Создание маршрутизатора Express
const db = require('../database'); // Подключение к базе данных

/**
 * @route GET /api/rooms
 * @description Получение списка всех номеров.
 * @access Public
 * @returns {Array<Object>} Массив объектов номеров с полями id, name, description, price, max_occupancy, is_available, amenities, image_url.
 * @returns {Object} 500 - Ошибка сервера.
 */
router.get('/', async (req, res) => {
    try {
        // Выполняем SQL-запрос для получения всех номеров.
        const [rows] = await db.query("SELECT id, name, description, price, max_occupancy, is_available, amenities, image_url FROM rooms");
        res.json(rows); // Отправляем данные в формате JSON
    } catch (error) {
        console.error("Ошибка при получении номеров:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

/**
 * @route GET /api/rooms/:id
 * @description Получение номера по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор номера.
 * @returns {Object} Объект номера с полями id, name, description, price, max_occupancy, is_available, amenities, image_url.
 * @returns {Object} 404 - Номер не найден.
 * @returns {Object} 500 - Ошибка сервера.
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для получения номера по ID.
        const [rows] = await db.query("SELECT id, name, description, price, max_occupancy, is_available, amenities, image_url FROM rooms WHERE id = ?", [id]);

        if (rows.length > 0) {
            res.json(rows[0]); // Отправляем найденный номер
        } else {
            res.status(404).json({ message: "Номер не найден" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при получении номера:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

/**
 * @route DELETE /api/rooms/:id
 * @description Удаление номера по ID.
 * @access Public
 * @param {string} id - Уникальный идентификатор номера для удаления.
 * @returns {Object} Объект с id удаленного номера.
 * @returns {Object} 404 - Номер не найден.
 * @returns {Object} 500 - Ошибка сервера.
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        // Выполняем SQL-запрос для удаления номера по ID.
        const [result] = await db.query("DELETE FROM rooms WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.json({ id: id }); // Отправляем id удаленного номера
        } else {
            res.status(404).json({ message: "Номер не найден" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при удалении номера:", error); // Логируем ошибку
        res.status(500).json({ message: "Ошибка сервера" }); // Отправляем ответ с ошибкой сервера
    }
});

/**
 * @route POST /api/rooms
 * @description Создание нового номера.
 * @access Public
 * @param {Object} req.body - Данные нового номера.
 * @param {string} req.body.type - Тип номера.
 * @param {string} req.body.description - Описание номера.
 * @param {number} req.body.price - Цена за ночь.
 * @param {number} req.body.max_occupancy - Максимальное количество гостей.
 * @param {number} req.body.is_available - Флаг доступности номера (1 или 0).
 * @param {string} [req.body.amenities] - Описание удобств (опционально).
 * @param {string} [req.body.image_url] - URL-адрес изображения номера (опционально).
 * @returns {Object} Объект созданного номера с его id.
 * @returns {Object} 400 - Некорректный запрос.
 */
router.post('/', async (req, res) => {
    try {
        const { type, description, price, max_occupancy, is_available, amenities, image_url } = req.body; // Получаем данные из тела запроса

        // Выполняем SQL-запрос для добавления нового номера.
        const [result] = await db.query("INSERT INTO rooms (type, description, price, max_occupancy, is_available, amenities, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)", [type, description, price, max_occupancy, is_available, amenities, image_url]);

        const newRoom = { id: result.insertId, type, description, price, max_occupancy, is_available, amenities, image_url }; // Формируем объект нового номера
        res.json(newRoom); // Отправляем данные созданного номера
    } catch (error) {
        console.error("Ошибка при добавлении номера:", error); // Логируем ошибку
        res.status(400).json({ message: "Некорректный запрос", error: error.message }); // Отправляем ошибку 400
    }
});

/**
 * @route PUT /api/rooms/:id
 * @description Обновление данных о номере.
 * @access Public
 * @param {string} id - Уникальный идентификатор номера для обновления.
 * @param {Object} req.body - Обновленные данные номера.
 * @param {string} [req.body.type] - Новый тип номера (опционально).
 * @param {string} [req.body.description] - Новое описание номера (опционально).
 * @param {number} [req.body.price] - Новая цена за ночь (опционально).
 * @param {number} [req.body.max_occupancy] - Новое максимальное количество гостей (опционально).
 * @param {number} [req.body.is_available] - Новый флаг доступности номера (опционально, 1 или 0).
 * @param {string} [req.body.amenities] - Новое описание удобств (опционально).
 * @param {string} [req.body.image_url] - Новый URL-адрес изображения номера (опционально).
 * @returns {Object} Объект с обновленными данными номера.
 * @returns {Object} 404 - Номер не найден.
 * @returns {Object} 400 - Некорректный запрос.
 */
router.put('/:id', async (req, res) => { // Исправлено на PUT с ID в пути
    try {
        const { id } = req.params; // Получаем ID из параметров запроса
        const { type, description, price, max_occupancy, is_available, amenities, image_url } = req.body; // Получаем обновленные данные из тела запроса

        // Выполняем SQL-запрос для обновления данных номера по ID.
        const [result] = await db.query("UPDATE rooms SET type = ?, description = ?, price = ?, max_occupancy = ?, is_available = ?, amenities = ?, image_url = ? WHERE id = ?", [type, description, price, max_occupancy, is_available, amenities, image_url, id]); // Используем ID из параметров маршрута

        if (result.affectedRows > 0) {
            // Возвращаем обновленные данные (можно получить их из базы после обновления для точности)
            res.json({ id, type, description, price, max_occupancy, is_available, amenities, image_url });
        } else {
            res.status(404).json({ message: "Номер не найден" }); // Отправляем ошибку 404
        }
    } catch (error) {
        console.error("Ошибка при обновлении номера:", error); // Логируем ошибку
        res.status(400).json({ message: "Некорректный запрос", error: error.message }); // Отправляем ошибку 400
    }
});

module.exports = router; // Экспортируем маршрутизатор