const express = require('express'); 
const router = express.Router(); // Создание router express
const db = require('../database');
// Получить все номера 
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, name, description, price, max_occupancy, is_available, amenities, image_url FROM rooms");
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении номеров:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
// Получить номер по ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT id, name, description, price, max_occupancy, is_available, amenities, image_url FROM rooms WHERE id = ?", [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Номер не найден" });
        }
    } catch (error) {
        console.error("Ошибка при получении номера:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
// Удалить номер по ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM rooms WHERE id = ?", [id]);
        if (result.affectedRows > 0) {
            res.json({ id: id });
        } else {
            res.status(404).json({ message: "Номер не найден" });
        }
    } catch (error) {
        console.error("Ошибка при удалении номера:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});
// Создание нового номера
router.post('/', async (req, res) => {
    try {
        const { type, description, price, max_occupancy, is_available, amenities, image_url } = req.body;
        const [result] = await db.query("INSERT INTO rooms (type, description, price, max_occupancy, is_available, amenities, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)", [type, description, price, max_occupancy, is_available, amenities, image_url]);
        const newRoom = { id: result.insertId, type, description, price, max_occupancy, is_available, amenities, image_url };
        res.json(newRoom);
    } catch (error) {
        console.error("Ошибка при добавлении номера:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});
// Обновить данные о номере
router.put('/', async (req, res) => {
    try {
        const { id, type, description, price, max_occupancy, is_available, amenities, image_url } = req.body;
        const [result] = await db.query("UPDATE rooms SET type = ?, description = ?, price = ?, max_occupancy = ?, is_available = ?, amenities = ?, image_url = ? WHERE id = ?", [type, description, price, max_occupancy, is_available, amenities, image_url, id]);
        if (result.affectedRows > 0) {
            res.json({ id, type, description, price, max_occupancy, is_available, amenities, image_url });
        } else {
            res.status(404).json({ message: "Номер не найден" });
        }
    } catch (error) {
        console.error("Ошибка при обновлении номера:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});

module.exports = router; // Экспортируйте router
