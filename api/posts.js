const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware для обработки JSON
router.use(express.json());

// GET all posts
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT id, title, content, author_id, image_url FROM posts");
        console.log("Данные, полученные из базы данных:", rows); // Отладочный лог
        res.json(rows);
    } catch (error) {
        console.error("Ошибка при получении постов:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

// GET a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query("SELECT id, title, max, content, author_id, image_url FROM posts WHERE id = ?", [id]);

        if (rows.length > 0) {
            console.log("Данные из API:", rows[0]); // Проверка данных
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: "Пост не найден" });
        }
    } catch (error) {
        console.error("Ошибка при получении поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});



// POST (create) a new post
router.post('/', async (req, res) => {
    try {
        const { title, content, author_id, image_url } = req.body;
        const [result] = await db.query("INSERT INTO posts (title, content, author_id, image_url) VALUES (?, ?, ?, ?)", [title, content, author_id, image_url]);
        const newPost = { id: result.insertId, title, content, author_id, image_url };
        res.status(201).json(newPost); // Используйте 201 Created для успешного создания
    } catch (error) {
        console.error("Ошибка при добавлении поста:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});

// PUT (update) an existing post
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, content_max, author_id, image_url } = req.body; // Обновлено для получения content_max

        // Измененный SQL запрос для обновления обоих полей
        const [result] = await db.query(
            "UPDATE posts SET title = ?, content = ?, content_max = ?, author_id = ?, image_url = ? WHERE id = ?",
            [title, content, content_max, author_id, image_url, id]
        );

        if (result.affectedRows > 0) {
            const updatedPost = { id: parseInt(id), title, content, content_max, author_id, image_url };
            res.json(updatedPost);
        } else {
            res.status(404).json({ message: "Пост не найден" });
        }
    } catch (error) {
        console.error("Ошибка при обновлении поста:", error);
        res.status(400).json({ message: "Некорректный запрос", error: error.message });
    }
});


// DELETE a post by ID
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query("DELETE FROM posts WHERE id = ?", [id]);

        if (result.affectedRows > 0) {
            res.json({ message: `Пост с ID ${id} успешно удален` });
        } else {
            res.status(404).json({ message: "Пост не найден" });
        }
    } catch (error) {
        console.error("Ошибка при удалении поста:", error);
        res.status(500).json({ message: "Ошибка сервера" });
    }
});

module.exports = router;
